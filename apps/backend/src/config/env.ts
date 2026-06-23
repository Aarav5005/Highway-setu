import 'dotenv/config';
import { z } from 'zod';

const boolFromString = z
  .string()
  .transform((value) => value.toLowerCase())
  .pipe(z.enum(['true', 'false']))
  .transform((value) => value === 'true');

const envSchema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production', 'test']),
  APP_PORT: z.coerce.number().int().min(1).max(65535),
  APP_BASE_URL: z.string().url(),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_SSL: boolFromString,

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().min(2),
  JWT_REFRESH_TTL: z.string().min(2),

  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().min(1),
  FIREBASE_PRIVATE_KEY: z.string().min(1),
  // Web API key from Firebase Console > Project Settings > General
  // Required for server-side SMS OTP sending via Identity Toolkit REST API
  FIREBASE_WEB_API_KEY: z.string().min(1).optional(),

  GOOGLE_MAPS_API_KEY: z.string().min(1),

  STORAGE_PROVIDER: z.enum(['supabase', 's3']),
  STORAGE_BUCKET: z.string().min(1),
  STORAGE_REGION: z.string().min(1),

  // Supabase Storage (used when STORAGE_PROVIDER=supabase)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_KEY: z.string().min(1).optional(),

  // AWS S3 (used when STORAGE_PROVIDER=s3)
  AWS_REGION: z.string().min(1).optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  AWS_BUCKET_NAME: z.string().min(1).optional(),

  CORS_ALLOWED_ORIGINS: z.string().min(1),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  const details = parseResult.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

const parsed = parseResult.data;

export const env = {
  ...parsed,
  CORS_ALLOWED_ORIGINS: parsed.CORS_ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
} as const;
