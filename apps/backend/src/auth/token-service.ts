import jwt from 'jsonwebtoken';
import { createHmac, randomUUID } from 'node:crypto';
import { env } from '../config/env';
import { AppError } from '../errors/app-error';
import type {
  AccessTokenClaims,
  OtpVerificationClaims,
  RefreshTokenClaims,
  UserRole,
} from './auth-types';

const OTP_VERIFICATION_TTL_SECONDS = 10 * 60;

const parseTtlToSeconds = (ttl: string) => {
  const match = ttl.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return Number(ttl) || OTP_VERIFICATION_TTL_SECONDS;
  }

  const value = Number(match[1]);
  const unit = match[2]!.toLowerCase();

  if (unit === 's') {
    return value;
  }

  if (unit === 'm') {
    return value * 60;
  }

  if (unit === 'h') {
    return value * 3_600;
  }

  return value * 86_400;
};

const createJwt = <T extends Record<string, unknown>>(
  payload: T,
  secret: string,
  expiresIn: string | number
) => {
  const token = jwt.sign(payload as jwt.JwtPayload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
  return {
    token,
    expiresInSeconds: typeof expiresIn === 'number' ? expiresIn : parseTtlToSeconds(expiresIn),
  };
};

const createClaims = (params: {
  sub: string;
  role: UserRole;
  tokenType: 'access' | 'refresh';
}) => ({
  sub: params.sub,
  role: params.role,
  tokenType: params.tokenType,
  jti: randomUUID(),
});

const parseClaims = (decoded: string | jwt.JwtPayload): AccessTokenClaims => {
  if (typeof decoded === 'string') {
    throw new AppError({
      statusCode: 401,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Invalid access token payload',
    });
  }

  const sub = decoded.sub;
  const role = decoded.role;
  const tokenType = decoded.tokenType;
  const jti = decoded.jti;

  if (typeof sub !== 'string') {
    throw new AppError({
      statusCode: 401,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Token subject is missing',
    });
  }

  if (tokenType !== 'access') {
    throw new AppError({
      statusCode: 401,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Token type is invalid',
    });
  }

  if (typeof jti !== 'string') {
    throw new AppError({
      statusCode: 401,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Token identifier is missing',
    });
  }

  if (role !== 'driver' && role !== 'dhaba_owner' && role !== 'mechanic' && role !== 'admin') {
    throw new AppError({
      statusCode: 401,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Token role is invalid',
    });
  }

  return {
    sub,
    role,
    tokenType,
    jti,
    iat: decoded.iat,
    exp: decoded.exp,
  };
};

export const verifyAccessToken = (token: string): AccessTokenClaims => {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return parseClaims(decoded);
  } catch {
    throw new AppError({
      statusCode: 401,
      code: 'AUTH_INVALID_TOKEN',
      message: 'Access token is invalid or expired',
    });
  }
};

const verifyTypedToken = <T extends { tokenType: string; sub: string; jti: string }>(
  token: string,
  secret: string,
  expectedTokenType: T['tokenType'],
  code: string
) => {
  try {
    const decoded = jwt.verify(token, secret);

    if (typeof decoded === 'string') {
      throw new Error('invalid payload');
    }

    if (decoded.tokenType !== expectedTokenType) {
      throw new Error('token type mismatch');
    }

    if (typeof decoded.sub !== 'string' || typeof decoded.jti !== 'string') {
      throw new Error('missing claims');
    }

    return decoded as jwt.JwtPayload & T;
  } catch {
    throw new AppError({
      statusCode: 401,
      code,
      message: 'Token is invalid or expired',
    });
  }
};

export const signAccessToken = (params: { sub: string; role: UserRole }) =>
  createJwt(
    createClaims({ ...params, tokenType: 'access' }),
    env.JWT_ACCESS_SECRET,
    env.JWT_ACCESS_TTL
  );

export const signRefreshToken = (params: { sub: string; role: UserRole }) =>
  createJwt(
    createClaims({ ...params, tokenType: 'refresh' }),
    env.JWT_REFRESH_SECRET,
    env.JWT_REFRESH_TTL
  );

export const hashOtpCode = (otpCode: string) =>
  createHmac('sha256', env.JWT_REFRESH_SECRET).update(otpCode).digest('hex');

export const signOtpVerificationToken = (params: { phoneE164: string; otpCode: string }) => {
  const token = jwt.sign(
    {
      sub: params.phoneE164,
      phoneE164: params.phoneE164,
      otpHash: hashOtpCode(params.otpCode),
      tokenType: 'otp_verification',
      jti: randomUUID(),
    } satisfies OtpVerificationClaims,
    env.JWT_REFRESH_SECRET,
    { expiresIn: OTP_VERIFICATION_TTL_SECONDS }
  );

  return {
    token,
    expiresInSeconds: OTP_VERIFICATION_TTL_SECONDS,
  };
};

export const verifyRefreshToken = (token: string): RefreshTokenClaims =>
  verifyTypedToken<RefreshTokenClaims>(
    token,
    env.JWT_REFRESH_SECRET,
    'refresh',
    'AUTH_INVALID_REFRESH_TOKEN'
  ) as RefreshTokenClaims;

export const verifyOtpVerificationToken = (token: string): OtpVerificationClaims =>
  verifyTypedToken<OtpVerificationClaims>(
    token,
    env.JWT_REFRESH_SECRET,
    'otp_verification',
    'AUTH_INVALID_OTP'
  ) as OtpVerificationClaims;
