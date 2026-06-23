CREATE TYPE order_status AS ENUM (
  'pending', 'accepted', 'preparing', 'ready', 
  'picked_up', 'rejected', 'cancelled'
);

CREATE TABLE food_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id),
  dhaba_id UUID NOT NULL REFERENCES dhaba_profiles(id),
  trip_id UUID REFERENCES trips(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  eta_minutes INTEGER,
  rejection_reason TEXT,
  payment_method VARCHAR(20) DEFAULT 'cash',
  payment_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_food_orders_driver_id ON food_orders(driver_id);
CREATE INDEX idx_food_orders_dhaba_id ON food_orders(dhaba_id);
CREATE INDEX idx_food_orders_status ON food_orders(status);
