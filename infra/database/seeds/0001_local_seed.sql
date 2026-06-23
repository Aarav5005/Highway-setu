BEGIN;

-- Users
INSERT INTO users (id, firebase_uid, phone_e164, role, verification_status, preferred_language)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'fb_admin_1', '+911111111111', 'admin', 'verified', 'english'),
  ('22222222-2222-2222-2222-222222222221', 'fb_driver_1', '+912222222221', 'driver', 'verified', 'hindi'),
  ('22222222-2222-2222-2222-222222222222', 'fb_driver_2', '+912222222222', 'driver', 'verified', 'punjabi'),
  ('33333333-3333-3333-3333-333333333331', 'fb_dhaba_1', '+913333333331', 'dhaba_owner', 'verified', 'hindi'),
  ('33333333-3333-3333-3333-333333333332', 'fb_dhaba_2', '+913333333332', 'dhaba_owner', 'pending', 'english'),
  ('44444444-4444-4444-4444-444444444441', 'fb_mech_1', '+914444444441', 'mechanic_owner', 'verified', 'hindi'),
  ('44444444-4444-4444-4444-444444444442', 'fb_mech_2', '+914444444442', 'mechanic_owner', 'pending', 'english')
ON CONFLICT (id) DO NOTHING;

-- Driver profiles
INSERT INTO driver_profiles (user_id, full_name, license_number, truck_registration_number, truck_type, gps_tracking_enabled, current_latitude, current_longitude, last_location_at)
VALUES
  ('22222222-2222-2222-2222-222222222221', 'Ravi Kumar', 'DL-DRV-0001', 'HR55AB1234', '12-wheeler', true, 28.613900, 77.209000, now()),
  ('22222222-2222-2222-2222-222222222222', 'Gurpreet Singh', 'PB-DRV-0002', 'PB10CD5678', '10-wheeler', true, 30.733300, 76.779400, now())
ON CONFLICT (user_id) DO NOTHING;

-- Dhaba profiles
INSERT INTO dhaba_profiles (user_id, business_name, phone_e164, address_line, state, district, pincode, latitude, longitude, is_active)
VALUES
  ('33333333-3333-3333-3333-333333333331', 'Punjab Highway Dhaba', '+913333333331', 'NH44 Mile 102', 'Punjab', 'Ludhiana', '141001', 30.901000, 75.857300, true),
  ('33333333-3333-3333-3333-333333333332', 'Rajasthan Road Dhaba', '+913333333332', 'NH48 Stop 56', 'Rajasthan', 'Jaipur', '302001', 26.912400, 75.787300, true)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO dhaba_amenities (id, dhaba_user_id, amenity_name, is_available)
VALUES
  ('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333331', 'Parking', true),
  ('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333331', 'Washroom', true),
  ('55555555-5555-5555-5555-555555555553', '33333333-3333-3333-3333-333333333332', 'Parking', true)
ON CONFLICT (dhaba_user_id, amenity_name) DO NOTHING;

INSERT INTO dhaba_photos (id, dhaba_user_id, photo_url, display_order)
VALUES
  ('66666666-6666-6666-6666-666666666661', '33333333-3333-3333-3333-333333333331', 'https://example.com/dhaba1-photo1.jpg', 1),
  ('66666666-6666-6666-6666-666666666662', '33333333-3333-3333-3333-333333333332', 'https://example.com/dhaba2-photo1.jpg', 1)
ON CONFLICT (dhaba_user_id, photo_url) DO NOTHING;

INSERT INTO dhaba_menu_items (id, dhaba_user_id, item_name, price_inr, is_available)
VALUES
  ('77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333331', 'Aloo Paratha', 80.00, true),
  ('77777777-7777-7777-7777-777777777772', '33333333-3333-3333-3333-333333333332', 'Dal Tadka', 120.00, true)
ON CONFLICT (dhaba_user_id, item_name) DO NOTHING;

-- Mechanic profiles
INSERT INTO mechanic_profiles (user_id, business_name, phone_e164, address_line, state, district, pincode, latitude, longitude, availability_status, is_active)
VALUES
  ('44444444-4444-4444-4444-444444444441', 'Highway Fix Mechanics', '+914444444441', 'NH44 Service Bay 12', 'Haryana', 'Karnal', '132001', 29.685700, 76.990500, 'available', true),
  ('44444444-4444-4444-4444-444444444442', 'Rapid Truck Repairs', '+914444444442', 'NH48 Service Bay 4', 'Rajasthan', 'Jaipur', '302001', 26.912400, 75.787300, 'busy', true)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO mechanic_services (id, mechanic_user_id, service_name, is_available)
VALUES
  ('88888888-8888-8888-8888-888888888881', '44444444-4444-4444-4444-444444444441', 'Tyre Repair', true),
  ('88888888-8888-8888-8888-888888888882', '44444444-4444-4444-4444-444444444441', 'Engine Check', true),
  ('88888888-8888-8888-8888-888888888883', '44444444-4444-4444-4444-444444444442', 'Brake Service', true)
ON CONFLICT (mechanic_user_id, service_name) DO NOTHING;

-- Reviews
INSERT INTO reviews (id, reviewer_user_id, vendor_user_id, vendor_type, rating, review_text)
VALUES
  ('99999999-9999-9999-9999-999999999991', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333331', 'dhaba', 5, 'Clean place and good food.'),
  ('99999999-9999-9999-9999-999999999992', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444441', 'mechanic', 4, 'Fast service on highway.')
ON CONFLICT (reviewer_user_id, vendor_user_id) DO NOTHING;

COMMIT;
