import { z } from 'zod';

export const validateSendOtp = {
  body: z.object({
    phoneE164: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
  }),
};

export const validateVerifyOtp = {
  body: z.object({
    phoneE164: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
    otpCode: z.string().min(4).max(8),
    verificationToken: z.string().min(1),
    preferredLanguage: z.enum(['english', 'hindi', 'punjabi']).optional(),
    referral_code: z.string().optional(),
  }),
};

export const validateRefreshToken = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const validateLogout = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

export const validateAdminLogin = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
};
