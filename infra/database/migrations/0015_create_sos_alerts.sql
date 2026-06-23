CREATE TYPE sos_type AS ENUM ('accident', 'medical', 'breakdown', 'security');
CREATE TYPE sos_status AS ENUM ('active', 'resolved');

CREATE TABLE sos_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES users(id),
  sos_type sos_type NOT NULL,
  location GEOMETRY(Point, 4326) NOT NULL,
  status sos_status DEFAULT 'active',
  dispatched_to JSONB DEFAULT '[]',
  emergency_contacts_notified BOOLEAN DEFAULT false,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
