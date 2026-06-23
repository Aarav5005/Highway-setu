import type {
  PreferredLanguage,
  UserRecord,
  UserRole,
  VerificationStatus,
} from '../../auth/auth-types';

export type SendOtpResponseDto = {
  verificationToken: string;
  expiresInSec: number;
};

export type AuthUserResponseDto = {
  id: string;
  phoneE164: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  preferredLanguage: PreferredLanguage;
};

export type VerifyOtpResponseDto = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
  user: AuthUserResponseDto;
};

export type RefreshResponseDto = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresInSeconds: number;
};

export type LogoutResponseDto = {
  success: boolean;
};

export type ProfileCompletionDto = {
  roleSelected: boolean;
  profileComplete: boolean;
  requiredProfile: 'driver' | 'dhaba' | 'mechanic' | 'none';
};

export type AuthMeResponseDto = {
  user: AuthUserResponseDto;
  profileCompletion: ProfileCompletionDto;
};

export type RoleSelectionDto = {
  userId: string;
  role: UserRole;
};

export type AuthRepositoryUser = UserRecord;
