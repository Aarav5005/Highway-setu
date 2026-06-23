CREATE TABLE IF NOT EXISTS mechanic_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  address_line TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude NUMERIC(9,6) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude NUMERIC(9,6) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mechanic_profiles_availability ON mechanic_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_mechanic_profiles_active ON mechanic_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_mechanic_profiles_lat_lng ON mechanic_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_mechanic_profiles_district_state ON mechanic_profiles(district, state);

CREATE TABLE IF NOT EXISTS mechanic_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_user_id UUID NOT NULL REFERENCES mechanic_profiles(user_id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mechanic_user_id, service_name)
);

CREATE INDEX IF NOT EXISTS idx_mechanic_services_user_available ON mechanic_services(mechanic_user_id, is_available);
