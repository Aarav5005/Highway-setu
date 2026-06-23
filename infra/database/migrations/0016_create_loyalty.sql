CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE driver_profiles ADD COLUMN loyalty_points INTEGER DEFAULT 0;

CREATE INDEX idx_loyalty_user_id ON loyalty_transactions(user_id);
