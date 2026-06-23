CREATE EXTENSION IF NOT EXISTS postgis;

-- Update dhaba_profiles
ALTER TABLE dhaba_profiles RENAME COLUMN business_name TO dhaba_name;

ALTER TABLE dhaba_profiles 
  ADD COLUMN highway_name VARCHAR(255),
  ADD COLUMN fssai_number VARCHAR(50),
  ADD COLUMN fssai_doc_url TEXT,
  ADD COLUMN is_open BOOLEAN DEFAULT true,
  ADD COLUMN avg_rating NUMERIC(2,1) DEFAULT 0 CHECK (avg_rating >= 0 AND avg_rating <= 5),
  ADD COLUMN amenities JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN location GEOMETRY(Point, 4326),
  ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Create spatial index for dhaba_profiles
CREATE INDEX idx_dhaba_profiles_location ON dhaba_profiles USING GIST (location);

-- Update mechanic_profiles
ALTER TABLE mechanic_profiles RENAME COLUMN business_name TO shop_name;

ALTER TABLE mechanic_profiles
  ADD COLUMN services_offered JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN can_travel BOOLEAN DEFAULT false,
  ADD COLUMN travel_radius_km INTEGER DEFAULT 0,
  ADD COLUMN dl_number VARCHAR(50),
  ADD COLUMN dl_doc_url TEXT,
  ADD COLUMN location GEOMETRY(Point, 4326),
  ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Create spatial index for mechanic_profiles
CREATE INDEX idx_mechanic_profiles_location ON mechanic_profiles USING GIST (location);
