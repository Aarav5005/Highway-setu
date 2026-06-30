CREATE TABLE IF NOT EXISTS mechanic_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_user_id UUID NOT NULL REFERENCES mechanic_profiles(user_id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1 CHECK (display_order > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mechanic_user_id, photo_url)
);

CREATE INDEX IF NOT EXISTS idx_mechanic_photos_mechanic_order ON mechanic_photos(mechanic_user_id, display_order);
