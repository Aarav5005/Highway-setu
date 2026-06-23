-- Migration 0007: Create Documents table and add fcm_token to users

CREATE TYPE document_type AS ENUM ('driving_licence', 'fssai_certificate', 'aadhaar');

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  s3_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);

-- Add FCM Token for push notifications (used in Task 3)
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
