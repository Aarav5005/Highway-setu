CREATE TABLE IF NOT EXISTS driver_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  license_number TEXT NOT NULL,
  truck_registration_number TEXT NOT NULL UNIQUE,
  truck_type TEXT NOT NULL,
  gps_tracking_enabled BOOLEAN NOT NULL DEFAULT false,
  current_latitude NUMERIC(9,6),
  current_longitude NUMERIC(9,6),
  last_location_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (current_latitude IS NULL OR (current_latitude >= -90 AND current_latitude <= 90)),
  CHECK (current_longitude IS NULL OR (current_longitude >= -180 AND current_longitude <= 180)),
  CHECK (
    (current_latitude IS NULL AND current_longitude IS NULL)
    OR
    (current_latitude IS NOT NULL AND current_longitude IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_driver_profiles_gps_tracking_enabled ON driver_profiles(gps_tracking_enabled);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_lat_lng ON driver_profiles(current_latitude, current_longitude);
