CREATE TABLE IF NOT EXISTS dhaba_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  phone_e164 TEXT NOT NULL,
  address_line TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  pincode TEXT NOT NULL,
  latitude NUMERIC(9,6) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude NUMERIC(9,6) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dhaba_profiles_active ON dhaba_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_dhaba_profiles_lat_lng ON dhaba_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_dhaba_profiles_district_state ON dhaba_profiles(district, state);

CREATE TABLE IF NOT EXISTS dhaba_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dhaba_user_id UUID NOT NULL REFERENCES dhaba_profiles(user_id) ON DELETE CASCADE,
  amenity_name TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (dhaba_user_id, amenity_name)
);

CREATE INDEX IF NOT EXISTS idx_dhaba_amenities_dhaba_user_id ON dhaba_amenities(dhaba_user_id);

CREATE TABLE IF NOT EXISTS dhaba_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dhaba_user_id UUID NOT NULL REFERENCES dhaba_profiles(user_id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1 CHECK (display_order > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (dhaba_user_id, photo_url)
);

CREATE INDEX IF NOT EXISTS idx_dhaba_photos_dhaba_order ON dhaba_photos(dhaba_user_id, display_order);

CREATE TABLE IF NOT EXISTS dhaba_menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dhaba_user_id UUID NOT NULL REFERENCES dhaba_profiles(user_id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  price_inr NUMERIC(10,2) NOT NULL CHECK (price_inr >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (dhaba_user_id, item_name)
);

CREATE INDEX IF NOT EXISTS idx_dhaba_menu_items_dhaba_available ON dhaba_menu_items(dhaba_user_id, is_available);
