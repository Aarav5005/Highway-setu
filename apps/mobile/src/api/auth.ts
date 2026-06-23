import { apiClient } from './client';

export const authApi = {
  sendOtp: (phoneE164: string) => 
    apiClient.post('/auth/send-otp', { phoneE164 }),

  verifyOtp: (phoneE164: string, otpCode: string, verificationToken: string, referral_code?: string) => 
    apiClient.post('/auth/verify-otp', { phoneE164, otpCode, verificationToken, referral_code }),

  refreshToken: (refreshToken: string) => 
    apiClient.post('/auth/refresh', { refreshToken }),
};
