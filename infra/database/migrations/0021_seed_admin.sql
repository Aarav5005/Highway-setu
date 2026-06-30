-- Create a default admin user if one doesn't exist
INSERT INTO users (id, email, password_hash, role, verification_status, firebase_uid, phone_e164, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@highwaysetu.com',
  '$2b$10$Ur0QPO0DdveLzcgjEnen1eLBFFacyM8TLmvPsR3zuSdiqodgb14Wm',
  'admin',
  'verified',
  'admin_firebase_uid',
  '+919876543210',
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;
