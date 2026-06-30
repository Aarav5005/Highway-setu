-- Add photos JSONB column to profiles
ALTER TABLE dhaba_profiles ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mechanic_profiles ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;
