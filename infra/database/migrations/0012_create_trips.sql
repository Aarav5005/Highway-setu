CREATE TYPE trip_status AS ENUM ('active', 'completed', 'cancelled');

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id),
  from_location VARCHAR(255) NOT NULL,
  to_location VARCHAR(255) NOT NULL,
  from_coords GEOMETRY(Point, 4326),
  to_coords GEOMETRY(Point, 4326),
  route_polyline TEXT,
  distance_km DECIMAL(10,2),
  status trip_status DEFAULT 'active',
  alerts_sent JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  driving_hours DECIMAL(5,2) DEFAULT 0,
  last_location GEOMETRY(Point, 4326),
  last_location_updated_at TIMESTAMPTZ
);

CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
