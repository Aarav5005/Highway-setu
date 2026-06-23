CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('dhaba', 'mechanic')),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reviewer_user_id, vendor_user_id),
  CHECK (reviewer_user_id <> vendor_user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_vendor_created_at ON reviews(vendor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_vendor_type ON reviews(vendor_type);

CREATE OR REPLACE FUNCTION enforce_review_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  reviewer_role TEXT;
  vendor_role TEXT;
BEGIN
  SELECT role INTO reviewer_role FROM users WHERE id = NEW.reviewer_user_id;
  SELECT role INTO vendor_role FROM users WHERE id = NEW.vendor_user_id;

  IF reviewer_role IS NULL OR vendor_role IS NULL THEN
    RAISE EXCEPTION 'Invalid review relation: missing users';
  END IF;

  IF reviewer_role <> 'driver' THEN
    RAISE EXCEPTION 'Only drivers can create reviews';
  END IF;

  IF NEW.vendor_type = 'dhaba' AND vendor_role <> 'dhaba_owner' THEN
    RAISE EXCEPTION 'Vendor type dhaba must target dhaba owner role';
  END IF;

  IF NEW.vendor_type = 'mechanic' AND vendor_role <> 'mechanic_owner' THEN
    RAISE EXCEPTION 'Vendor type mechanic must target mechanic owner role';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_review_roles ON reviews;

CREATE TRIGGER trg_enforce_review_roles
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION enforce_review_roles();
