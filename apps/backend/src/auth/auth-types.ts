export type UserRole = 'driver' | 'dhaba_owner' | 'mechanic' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type PreferredLanguage = 'english' | 'hindi' | 'punjabi';

export type AuthContext = {
  userId: string;
  role: UserRole;
};

export type AccessTokenClaims = {
  sub: string;
  role: UserRole;
  tokenType: 'access';
  jti: string;
  iat?: number;
  exp?: number;
};

export type RefreshTokenClaims = {
  sub: string;
  role: UserRole;
  tokenType: 'refresh';
  jti: string;
  iat?: number;
  exp?: number;
};

export type OtpVerificationClaims = {
  sub: string;
  phoneE164: string;
  otpHash: string;
  tokenType: 'otp_verification';
  jti: string;
  iat?: number;
  exp?: number;
};

export type UserRecord = {
  id: string;
  firebase_uid: string;
  phone_e164: string;
  role: UserRole;
  verification_status: VerificationStatus;
  language_pref: PreferredLanguage;
  created_at: Date;
  updated_at: Date;
};
