DROP TABLE IF EXISTS dhaba_menu_items CASCADE;

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dhaba_id UUID NOT NULL REFERENCES dhaba_profiles(user_id) ON DELETE CASCADE,
  name_en VARCHAR(100) NOT NULL,
  name_hi VARCHAR(100),
  name_pa VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_menu_items_dhaba_id ON menu_items(dhaba_id);
