CREATE TYPE request_status AS ENUM (
  'pending', 'accepted', 'rejected', 'completed', 'cancelled'
);

CREATE TABLE mechanic_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id),
  mechanic_id UUID REFERENCES users(id),
  issue_type VARCHAR(100) NOT NULL,
  description TEXT,
  location GEOMETRY(Point, 4326) NOT NULL,
  status request_status DEFAULT 'pending',
  quoted_amount DECIMAL(10,2),
  platform_fee_pct DECIMAL(5,2) DEFAULT 10.00,
  platform_fee_amount DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  payment_method VARCHAR(20) DEFAULT 'cash',
  payment_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mechanic_requests_driver_id ON mechanic_requests(driver_id);
CREATE INDEX idx_mechanic_requests_mechanic_id ON mechanic_requests(mechanic_id);
CREATE INDEX idx_mechanic_requests_status ON mechanic_requests(status);
