import { AppError } from '../../errors/app-error';
import type {
  AuthMeResponseDto,
  AuthUserResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
  RoleSelectionDto,
  SendOtpResponseDto,
  VerifyOtpResponseDto,
} from './types';
import type { AuthRepository } from './repository';
import { buildProfileCompletion, toAuthUserResponse } from './repository';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../auth/token-service';
import { sendFirebaseOtp, verifyFirebaseOtp } from '../../integrations/firebase';
import bcrypt from 'bcrypt';
import { dbPool } from '../../db/pool';
import type { AuthSessionStore } from './session-store';
import { createAuthSessionStore, pruneExpiredEntries } from './session-store';
import type { PreferredLanguage, UserRole } from '../../auth/auth-types';

const OTP_RATE_LIMIT_SECONDS = 60;

type AuthServiceDependencies = {
  repository: AuthRepository;
  sessionStore?: AuthSessionStore;
  clock?: () => number;
};

type SendOtpResult = SendOtpResponseDto & {
  otpCode: string;
};

export type AuthService = {
  sendOtp(phoneE164: string): Promise<SendOtpResult>;
  verifyOtp(input: {
    phoneE164: string;
    otpCode: string;
    verificationToken: string;
    preferredLanguage?: PreferredLanguage;
  }): Promise<VerifyOtpResponseDto>;
  refreshAccessToken(refreshToken: string): Promise<RefreshResponseDto>;
  logout(input: { accessUserId: string; refreshToken: string }): Promise<LogoutResponseDto>;
  getAuthContext(userId: string): Promise<AuthMeResponseDto>;
  selectRole(input: RoleSelectionDto): Promise<AuthUserResponseDto>;
  adminLogin(email: string, password: string): Promise<VerifyOtpResponseDto>;
};

const normalizePhone = (phoneE164: string) => phoneE164.trim();

const getCooldownExpiry = (now: number) => now + OTP_RATE_LIMIT_SECONDS * 1000;

export const createAuthService = ({
  repository,
  sessionStore = createAuthSessionStore(),
  clock = () => Date.now(),
}: AuthServiceDependencies): AuthService => {
  const sendOtp = async (phoneE164: string): Promise<SendOtpResult> => {
    const now = clock();
    pruneExpiredEntries(sessionStore.otpCooldownByPhone, now);

    const normalizedPhone = normalizePhone(phoneE164);
    const existingCooldown = sessionStore.otpCooldownByPhone.get(normalizedPhone);

    if (existingCooldown && existingCooldown > now) {
      throw new AppError({
        statusCode: 429,
        code: 'AUTH_OTP_RATE_LIMITED',
        message: 'OTP requests are rate limited for this phone number',
      });
    }

    // Call Firebase REST API to send real SMS
    const sessionInfo = await sendFirebaseOtp(normalizedPhone);

    sessionStore.otpCooldownByPhone.set(normalizedPhone, getCooldownExpiry(now));

    return {
      verificationToken: sessionInfo,
      expiresInSec: OTP_RATE_LIMIT_SECONDS, // Cooldown
      otpCode: 'hidden', // Do not return real OTP to client
    };
  };

  const issueTokensForUser = (userId: string, role: UserRole) => {
    const accessToken = signAccessToken({ sub: userId, role });
    const refreshToken = signRefreshToken({ sub: userId, role });

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
      accessExpiresInSeconds: accessToken.expiresInSeconds,
    };
  };

  const verifyOtp = async (input: {
    phoneE164: string;
    otpCode: string;
    verificationToken: string;
    preferredLanguage?: PreferredLanguage;
    referral_code?: string;
  }): Promise<VerifyOtpResponseDto> => {
    // Verify using Firebase REST API
    const verifiedPhone = await verifyFirebaseOtp(input.verificationToken, input.otpCode);

    if (normalizePhone(verifiedPhone) !== normalizePhone(input.phoneE164)) {
      throw new AppError({
        statusCode: 409,
        code: 'AUTH_PHONE_MISMATCH',
        message: 'OTP verification token does not belong to the phone number',
      });
    }

    const existingUser = await repository.findUserByPhone(verifiedPhone);

    const user = existingUser
      ? existingUser
      : await repository.createUser({
          phoneE164: verifiedPhone,
          role: 'driver',
          preferredLanguage: input.preferredLanguage ?? 'english',
        });

    if (!existingUser) {
      const newReferralCode = 'USER' + Math.floor(1000 + Math.random() * 9000);
      await dbPool.query('UPDATE users SET referral_code = $1 WHERE id = $2', [
        newReferralCode,
        user.id,
      ]);

      if (input.referral_code) {
        const referrerRes = await dbPool.query('SELECT id FROM users WHERE referral_code = $1', [
          input.referral_code,
        ]);
        const referrerId = referrerRes.rows[0]?.id;
        if (referrerId) {
          await dbPool.query('UPDATE users SET referred_by = $1 WHERE id = $2', [
            referrerId,
            user.id,
          ]);
          await dbPool.query(
            'INSERT INTO referrals (referrer_id, referred_id, status) VALUES ($1, $2, $3)',
            [referrerId, user.id, 'pending']
          );
        }
      }
    }

    if (
      existingUser &&
      input.preferredLanguage &&
      existingUser.language_pref !== input.preferredLanguage
    ) {
      await repository.updatePreferredLanguage(existingUser.id, input.preferredLanguage);
    }

    const tokens = issueTokensForUser(user.id, user.role);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresInSeconds: tokens.accessExpiresInSeconds,
      user: toAuthUserResponse(user),
    };
  };

  const refreshAccessToken = async (refreshToken: string): Promise<RefreshResponseDto> => {
    const claims = verifyRefreshToken(refreshToken);
    const now = clock();
    pruneExpiredEntries(sessionStore.revokedRefreshTokenIds, now);

    const revokedUntil = sessionStore.revokedRefreshTokenIds.get(claims.jti);
    if (revokedUntil && revokedUntil > now) {
      throw new AppError({
        statusCode: 401,
        code: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Refresh token has been revoked',
      });
    }

    const user = await repository.findUserById(claims.sub);
    if (!user) {
      throw new AppError({
        statusCode: 401,
        code: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Refresh token subject is invalid',
      });
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role });

    return {
      accessToken: accessToken.token,
      tokenType: 'Bearer',
      expiresInSeconds: accessToken.expiresInSeconds,
    };
  };

  const logout = async (input: {
    accessUserId: string;
    refreshToken: string;
  }): Promise<LogoutResponseDto> => {
    const claims = verifyRefreshToken(input.refreshToken);

    if (claims.sub !== input.accessUserId) {
      throw new AppError({
        statusCode: 401,
        code: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'Refresh token does not match the authenticated user',
      });
    }

    const now = clock();
    sessionStore.revokedRefreshTokenIds.set(claims.jti, claims.exp ? claims.exp * 1000 : now + 1);

    return { success: true };
  };

  const getAuthContext = async (userId: string): Promise<AuthMeResponseDto> => {
    const user = await repository.findUserById(userId);
    if (!user) {
      throw new AppError({
        statusCode: 401,
        code: 'AUTH_UNAUTHORIZED',
        message: 'Authenticated user not found',
      });
    }

    const profileCompletion = await buildProfileCompletion(repository, user.id, user.role);

    return {
      user: toAuthUserResponse(user),
      profileCompletion,
    };
  };

  const selectRole = async (input: RoleSelectionDto): Promise<AuthUserResponseDto> => {
    const updated = await repository.updateUserRole(input.userId, input.role);
    if (!updated) {
      throw new AppError({
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return toAuthUserResponse(updated);
  };

  const adminLogin = async (email: string, password: string): Promise<VerifyOtpResponseDto> => {
    const user = await repository.findUserByEmail(email);
    if (!user || user.role !== 'admin' || !user.password_hash) {
      throw new AppError({
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid admin credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError({
        statusCode: 401,
        code: 'AUTH_INVALID_CREDENTIALS',
        message: 'Invalid admin credentials',
      });
    }

    const tokens = issueTokensForUser(user.id, user.role);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresInSeconds: tokens.accessExpiresInSeconds,
      user: toAuthUserResponse(user),
    };
  };

  return {
    sendOtp,
    verifyOtp,
    refreshAccessToken,
    logout,
    getAuthContext,
    selectRole,
    adminLogin,
  };
};
