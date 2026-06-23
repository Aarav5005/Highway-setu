# Highway Setu V1 Feature Lock

## Policy Statement

Highway Setu V1 scope is locked.

Only the features listed in this document are permitted for V1 design, architecture, API contracts, database schema, screens, and implementation.

Any feature outside this document is prohibited for V1.

## In-Scope Features (Allowed)

### Driver

1. OTP Login
2. Driver Profile
3. Truck Details
4. Start Journey
5. GPS Tracking
6. Vendor Discovery
7. Vendor Details
8. Distance Calculation
9. Open Google Maps

### Dhaba

1. Registration
2. Profile
3. Amenities
4. Photos
5. Menu

### Mechanic

1. Registration
2. Services
3. Availability

### Admin

1. User Verification
2. Vendor Management

## Out-of-Scope Features (Explicitly Prohibited)

1. Loyalty System
2. Referrals
3. SOS
4. Food Ordering
5. Payments
6. Chat
7. AI Recommendations
8. Weather Alerts
9. Fuel Prediction
10. Rewards

## Enforcement Rules

1. Do not create any database table for out-of-scope features.
2. Do not create any API endpoint for out-of-scope features.
3. Do not create any mobile or admin screen for out-of-scope features.
4. Do not create any event, queue, or background job for out-of-scope features.
5. Do not add placeholder modules, stubs, or dead code for out-of-scope features.

## Change Control

1. Any new feature request after this lock must be marked as Post-V1.
2. Scope changes require a formal V1 scope amendment.
3. Until an amendment is approved, this lock remains authoritative.

## Mapping Rule

1. Every table must map to at least one allowed feature in this lock.
2. Every API must map to at least one allowed feature in this lock.
3. Every screen must map to at least one allowed feature in this lock.

If a table, API, or screen cannot be mapped to the allowed list above, it is prohibited in V1.