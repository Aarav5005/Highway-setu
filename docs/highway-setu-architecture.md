# Highway Setu Architecture Blueprint

This document translates the current product context into a build-ready architecture plan. It intentionally stays at the design level and does not include implementation code.

## 1) Complete System Architecture

### Core Principle
Highway Setu is a mobile-first discovery platform, not a navigation app. The mobile app identifies nearby trusted vendors and then hands off navigation to Google Maps when the driver chooses to navigate.

### High-Level Components

```text
Driver Mobile App (React Native)
    -> Firebase OTP for login
    -> App JWT for API access
    -> Backend API (Node.js + Express)
    -> PostgreSQL + PostGIS
    -> Google Maps APIs for search, distance, and handoff
    -> Firebase Cloud Messaging for notifications

Vendor Mobile Flows (same app, role-based)
    -> Registration, profile, amenities, services, media

Admin Dashboard (Next.js)
    -> Verification, vendor/user management, analytics

Shared Services
    -> Media storage (Supabase Storage or AWS S3)
    -> Logging and audit trail
    -> Localization bundles (English, Hindi, Punjabi)
```

### Recommended Runtime Boundaries

- Mobile app owns onboarding, profile capture, vendor discovery, live location sharing, and Google Maps handoff.
- Backend owns identity, authorization, business rules, vendor search, journey state, verification, and auditability.
- PostgreSQL stores all business entities.
- PostGIS should be enabled for location search, distance filtering, and proximity ranking.
- Admin dashboard should use the same backend APIs as the mobile app, with separate admin authorization.

### Primary Data Flows

1. Driver signs in with Firebase OTP.
2. Backend exchanges or validates identity and issues an app session token.
3. Driver creates or updates truck and profile data.
4. Driver starts a journey and begins sharing location at controlled intervals.
5. Backend calculates nearby vendors using stored coordinates and spatial indexes.
6. Driver opens a vendor detail page and taps navigate.
7. The app launches Google Maps instead of rendering turn-by-turn routing itself.
8. Vendors register through role-specific onboarding and wait for admin verification.
9. Admin reviews users, vendors, documents, and profile completeness.

### Key Architectural Decisions

- Use a single backend API with role-based authorization rather than separate services for each user type in V1.
- Keep media uploads outside the primary database and store only metadata in PostgreSQL.
- Standardize on a shared localization key system from day one.
- Make location updates incremental and battery-aware instead of continuous high-frequency tracking.
- Keep the mobile UI resilient to intermittent network conditions with cached profiles and last-known location snapshots.

## 2) Database Architecture

### Design Goals

- Keep the schema minimal but complete for V1.
- Model identity separately from role-specific profile data.
- Use spatial columns for vendor and journey locations.
- Store verification, media, and audit data explicitly so admin workflows are traceable.

### Core Tables

#### `users`
Purpose: canonical identity record for drivers, dhaba owners, mechanics, and admins.

- `id` UUID primary key
- `firebase_uid` text unique not null
- `phone_number` text unique not null
- `role` enum or constrained text not null
- `status` enum or constrained text not null
- `preferred_language` text not null
- `created_at`, `updated_at`

Indexes:
- unique index on `firebase_uid`
- unique index on `phone_number`
- index on `role`
- index on `status`

#### `driver_profiles`
Purpose: driver-specific profile data.

- `user_id` UUID primary key, foreign key to `users.id`
- `full_name` text
- `home_state` text
- `license_number` text nullable for V1 if not mandatory at onboarding
- `emergency_contact_name` text
- `emergency_contact_phone` text
- `created_at`, `updated_at`

#### `trucks`
Purpose: one or more truck records per driver.

- `id` UUID primary key
- `driver_user_id` UUID foreign key to `users.id`
- `registration_number` text unique not null
- `vehicle_type` text
- `truck_model` text
- `capacity_tons` numeric
- `created_at`, `updated_at`

Indexes:
- unique index on `registration_number`
- index on `driver_user_id`

#### `vendor_profiles`
Purpose: shared vendor record for dhabas and mechanics.

- `id` UUID primary key
- `owner_user_id` UUID foreign key to `users.id`
- `vendor_type` enum or constrained text not null
- `business_name` text not null
- `phone_number` text
- `address_text` text
- `state` text
- `district` text
- `pincode` text
- `location` geography(Point, 4326) or geometry(Point, 4326)
- `is_verified` boolean default false
- `is_active` boolean default true
- `created_at`, `updated_at`

Indexes:
- spatial index on `location`
- index on `vendor_type`
- index on `is_verified`
- index on `is_active`

#### `vendor_documents`
Purpose: verification evidence for admin review.

- `id` UUID primary key
- `vendor_id` UUID foreign key to `vendor_profiles.id`
- `document_type` text
- `file_url` text not null
- `verification_status` text not null
- `reviewed_by_admin_id` UUID nullable foreign key to `users.id`
- `reviewed_at` timestamp nullable
- `created_at`, `updated_at`

#### `vendor_amenities`
Purpose: dhaba amenities listing.

- `id` UUID primary key
- `vendor_id` UUID foreign key to `vendor_profiles.id`
- `amenity_code` text not null
- `display_label` text not null
- `is_available` boolean not null
- `created_at`, `updated_at`

Indexes:
- composite index on `vendor_id`, `amenity_code`

#### `vendor_services`
Purpose: mechanic services listing and capability metadata.

- `id` UUID primary key
- `vendor_id` UUID foreign key to `vendor_profiles.id`
- `service_code` text not null
- `display_label` text not null
- `is_available` boolean not null
- `created_at`, `updated_at`

Indexes:
- composite index on `vendor_id`, `service_code`

#### `vendor_menu_items`
Purpose: dhaba menu management.

- `id` UUID primary key
- `vendor_id` UUID foreign key to `vendor_profiles.id`
- `item_name` text not null
- `category` text
- `price` numeric not null
- `is_available` boolean not null
- `created_at`, `updated_at`

#### `vendor_photos`
Purpose: vendor photo gallery.

- `id` UUID primary key
- `vendor_id` UUID foreign key to `vendor_profiles.id`
- `file_url` text not null
- `caption` text
- `sort_order` integer
- `created_at`, `updated_at`

#### `journeys`
Purpose: active and historical journey records for driver tracking.

- `id` UUID primary key
- `driver_user_id` UUID foreign key to `users.id`
- `truck_id` UUID foreign key to `trucks.id`
- `origin_label` text
- `destination_label` text
- `status` text not null
- `started_at` timestamp nullable
- `ended_at` timestamp nullable
- `created_at`, `updated_at`

Indexes:
- index on `driver_user_id`
- index on `truck_id`
- index on `status`

#### `location_pings`
Purpose: location history during active journeys.

- `id` UUID primary key
- `journey_id` UUID foreign key to `journeys.id`
- `driver_user_id` UUID foreign key to `users.id`
- `location` geography(Point, 4326) or geometry(Point, 4326)
- `speed_kmph` numeric nullable
- `heading_degrees` numeric nullable
- `accuracy_meters` numeric nullable
- `captured_at` timestamp not null

Indexes:
- spatial index on `location`
- index on `journey_id`, `captured_at`
- index on `driver_user_id`, `captured_at`

#### `device_tokens`
Purpose: FCM tokens for push notifications.

- `id` UUID primary key
- `user_id` UUID foreign key to `users.id`
- `token` text unique not null
- `platform` text not null
- `last_seen_at` timestamp
- `created_at`, `updated_at`

#### `audit_logs`
Purpose: admin and system traceability.

- `id` UUID primary key
- `actor_user_id` UUID nullable foreign key to `users.id`
- `action` text not null
- `entity_type` text not null
- `entity_id` UUID nullable
- `metadata` jsonb
- `created_at`

### Database Improvements Recommended Before Build

- Enable PostGIS early, not later, because vendor discovery and distance math depend on it.
- Use enums or constrained lookup tables for role, vendor type, status, and verification state to avoid inconsistent strings.
- Add soft-delete or archival fields only where operationally needed; do not blanket-soft-delete every table.
- Define retention rules for location history because journey tracking can grow quickly.
- Store localized display labels in a separate translation approach if the same amenity or service labels must appear in multiple languages.

## 3) API Architecture

### API Style

- REST over HTTP with versioned routes under `/api/v1`.
- JWT-based session authorization after Firebase OTP verification.
- Validation on every write endpoint.
- Standardized error payloads for mobile-friendly handling.

### Auth APIs

#### `POST /api/v1/auth/send-otp`
- Purpose: initiate phone verification.
- Auth: public.
- Validation: valid phone number and country format.
- Response: OTP challenge reference or Firebase verification metadata.

#### `POST /api/v1/auth/verify-otp`
- Purpose: verify the OTP and create or update the user identity.
- Auth: public.
- Validation: Firebase verification token plus phone number.
- Response: app JWT, role, onboarding status, language, and profile completeness summary.

#### `POST /api/v1/auth/logout`
- Purpose: invalidate the local session and device token mapping.
- Auth: user JWT.

#### `GET /api/v1/auth/me`
- Purpose: return the current user, role, profile status, and onboarding progress.
- Auth: user JWT.

### Driver APIs

#### `GET /api/v1/drivers/profile`
- Purpose: load driver profile screen.
- Auth: driver JWT.

#### `PUT /api/v1/drivers/profile`
- Purpose: update driver profile.
- Auth: driver JWT.

#### `POST /api/v1/drivers/trucks`
- Purpose: add truck details.
- Auth: driver JWT.

#### `PUT /api/v1/drivers/trucks/:truckId`
- Purpose: edit truck details.
- Auth: driver JWT.

#### `POST /api/v1/journeys`
- Purpose: start a journey.
- Auth: driver JWT.

#### `PATCH /api/v1/journeys/:journeyId/end`
- Purpose: end a journey.
- Auth: driver JWT.

#### `POST /api/v1/journeys/:journeyId/location-pings`
- Purpose: submit current location during an active journey.
- Auth: driver JWT.
- Validation: numeric coordinates, timestamp, and reasonable accuracy value.

#### `GET /api/v1/vendors/nearby`
- Purpose: list dhabas and mechanics near the driver.
- Auth: driver JWT.
- Validation: current lat/lng, radius, vendor type filters.

#### `GET /api/v1/vendors/:vendorId`
- Purpose: vendor detail page.
- Auth: driver JWT.

#### `POST /api/v1/vendors/:vendorId/handoff`
- Purpose: record a navigation handoff intent and open Google Maps from the client.
- Auth: driver JWT.

### Vendor APIs

#### `POST /api/v1/vendors/register`
- Purpose: create a dhaba or mechanic business profile.
- Auth: vendor JWT.

#### `PUT /api/v1/vendors/:vendorId`
- Purpose: update business profile.
- Auth: vendor JWT.

#### `PUT /api/v1/vendors/:vendorId/amenities`
- Purpose: manage dhaba amenities.
- Auth: vendor JWT.

#### `PUT /api/v1/vendors/:vendorId/services`
- Purpose: manage mechanic services.
- Auth: vendor JWT.

#### `PUT /api/v1/vendors/:vendorId/menu-items`
- Purpose: manage menu listings.
- Auth: vendor JWT.

#### `POST /api/v1/vendors/:vendorId/photos`
- Purpose: upload vendor images.
- Auth: vendor JWT.

#### `PATCH /api/v1/vendors/:vendorId/availability`
- Purpose: toggle vendor operating availability.
- Auth: vendor JWT.

### Admin APIs

#### `GET /api/v1/admin/users`
- Purpose: search and filter users.
- Auth: admin JWT.

#### `GET /api/v1/admin/vendors`
- Purpose: list vendor records.
- Auth: admin JWT.

#### `PATCH /api/v1/admin/vendors/:vendorId/verify`
- Purpose: approve or reject vendor verification.
- Auth: admin JWT.

#### `GET /api/v1/admin/verifications`
- Purpose: review pending documents and verification tasks.
- Auth: admin JWT.

#### `GET /api/v1/admin/analytics/summary`
- Purpose: show core adoption and verification metrics.
- Auth: admin JWT.

### API Standards To Enforce

- Version every endpoint.
- Return consistent pagination metadata for list endpoints.
- Use request validation for all writes.
- Normalize error responses for offline and retry handling on mobile.
- Avoid adding any endpoint that does not directly support a screen or workflow.

## 4) Mobile Screen Inventory

### Driver Screens

#### Language Selection
- Purpose: choose English, Hindi, or Punjabi before onboarding.
- Important UI: large language cards, icon-led choices.

#### OTP Login
- Purpose: sign in with phone verification.
- Important UI: phone input, OTP entry, resend timer.

#### Driver Home
- Purpose: entry point for journey start, search, and current status.
- Important UI: oversized primary buttons, quick actions, nearby vendor summary.

#### Driver Profile
- Purpose: manage personal information.

#### Truck Details
- Purpose: add or edit truck registration and vehicle data.

#### Start Journey
- Purpose: begin active trip tracking.

#### Live Journey Tracking
- Purpose: show current location, active journey state, and nearby vendors.

#### Nearby Vendors List
- Purpose: browse dhabas and mechanics around the current location.

#### Vendor Detail
- Purpose: review vendor profile, amenities or services, and contact actions.

#### Google Maps Handoff Confirm
- Purpose: launch Google Maps for external navigation.

#### Journey History
- Purpose: show previous trips and recently viewed vendors.

### Dhaba Screens

#### Dhaba Registration
- Purpose: create vendor account and business identity.

#### Dhaba Profile
- Purpose: edit business information.

#### Amenities Manager
- Purpose: maintain parking, washroom, food, and rest facilities.

#### Menu Manager
- Purpose: manage menu items and pricing.

#### Photo Manager
- Purpose: upload and organize photos.

#### Verification Status
- Purpose: show review state and any missing documents.

### Mechanic Screens

#### Mechanic Registration
- Purpose: create mechanic account and business identity.

#### Mechanic Profile
- Purpose: edit workshop profile.

#### Service Listing
- Purpose: manage repair services and specialties.

#### Availability Status
- Purpose: indicate open, busy, or closed.

#### Verification Status
- Purpose: show review state and any missing documents.

### Shared Mobile Concerns

- Keep all screens Android-first and touch-friendly.
- Use large icons, minimal text, and clear error states.
- Cache the last known vendor list and profile data for poor network conditions.
- Localize every screen copy and validation message.
- Avoid complex map-heavy screens; the map should support discovery, not replace it.

## 5) Admin Dashboard Inventory

### Dashboard Pages

#### Login
- Purpose: admin sign-in.

#### Overview Dashboard
- Purpose: high-level counts of users, vendors, pending verifications, and journey activity.

#### User Management
- Purpose: search, filter, and inspect drivers and vendor owners.

#### Vendor Management
- Purpose: review vendor profiles and operating status.

#### Verification Queue
- Purpose: approve or reject dhaba and mechanic submissions.

#### Vendor Detail Review
- Purpose: inspect profile completeness, documents, photos, and location consistency.

#### Analytics Dashboard
- Purpose: track adoption, onboarding completion, and vendor approval throughput.

#### Audit Log Viewer
- Purpose: trace admin actions and sensitive changes.

### Admin Components

- Filter bars with status, type, and date filters.
- Detail drawers or side panels for review without losing context.
- KPI cards for top-level metrics.
- Document preview cards for verification.
- Activity timeline for recent actions.

### Admin Requirements

- Require role-based access control.
- Require audit logging for verification and profile changes.
- Keep the dashboard responsive but optimized for desktop first.

## 6) Folder Structure

### Recommended Target Structure

```text
highway-setu/
  apps/
    mobile/
      src/
        assets/
        components/
        features/
        navigation/
        screens/
        services/
        store/
        i18n/
        theme/
    admin/
      src/
        app/
        components/
        features/
        services/
        lib/
        styles/
        types/
    backend/
      src/
        config/
        modules/
        middleware/
        integrations/
        db/
        utils/
        routes/
        validators/
        jobs/
  packages/
    shared/
      src/
        constants/
        types/
        validation/
        localization/
  infra/
    database/
      migrations/
      seeds/
    storage/
    deploy/
  docs/
    architecture/
  mcp-servers/
  agents/
```

### Structure Rules

- Keep backend feature modules bounded by business capability, not by technical layer only.
- Share types and validation schemas only when they truly reduce duplication.
- Keep mobile screens thin and push business rules into service modules.
- Keep admin and mobile as separate app boundaries even if they share API contracts.

## 7) Development Roadmap

### Phase 0: Product and Technical Decisions

- Confirm role definitions and onboarding requirements.
- Freeze V1 vendor categories and required fields.
- Decide media storage provider.
- Decide whether all maps-related data will use PostGIS from day one.
- Finalize localization copy ownership.

### Phase 1: Foundations

- Define database schema and migrations.
- Set up Firebase OTP login and app JWT issuance.
- Establish backend folder structure and validation patterns.
- Create shared localization framework.
- Set up base mobile and admin shells.

### Phase 2: Driver MVP

- Implement OTP login.
- Build driver profile and truck details.
- Build journey start and live location capture.
- Add nearby vendor discovery.
- Add vendor detail and Google Maps handoff.

### Phase 3: Vendor Onboarding

- Implement dhaba registration, amenities, menu, and photos.
- Implement mechanic registration, services, and availability.
- Build vendor verification workflow.

### Phase 4: Admin Workflow

- Build verification queue and detail review screens.
- Add vendor and user management.
- Add audit logging and analytics summary.

### Phase 5: Hardening

- Add offline handling and retry logic.
- Optimize location update frequency and battery impact.
- Add monitoring, logging, and alerting.
- Add test coverage for critical flows.

### Phase 6: Launch Readiness

- Validate the Hindi and Punjabi copy.
- Review onboarding completion rates with low-literacy assumptions.
- Check map API costs and rate limits.
- Run end-to-end UAT on low-end Android devices.

## Risks, Missing Requirements, and Improvements

### Major Risks

- The exact driver identity flow is underspecified: Firebase OTP is chosen, but the backend session model and token exchange need to be explicitly frozen.
- Vendor discovery quality depends on location accuracy, update frequency, and spatial indexing; without PostGIS or equivalent spatial support, search quality will degrade quickly.
- Media-heavy vendor profiles can become storage and latency hotspots if uploads are not separated from the main API path.
- The architecture currently has no stated retention policy for journey location history, which can create rapid data growth.
- Localization is required, but no translation management process is defined yet.
- Low-network behavior is a product requirement, but offline cache and sync rules are not yet specified.

### Missing Requirements To Resolve

- Required fields for driver, dhaba, and mechanic onboarding.
- Verification rules for each vendor type.
- Whether a single account can own multiple vendor locations.
- Whether vendors can edit their location after approval and under what review rules.
- Exact vendor filtering rules for drivers.
- Whether call tracking, favorites, or ratings belong in V1.
- Whether admin analytics need revenue or only operational metrics.

### Recommended Improvements Before Development

- Use a single identity model centered on `users`, with role-specific profile tables.
- Adopt PostGIS early for distance, radius, and proximity search.
- Define a localization key strategy and copy ownership before screen work starts.
- Introduce audit logging from the beginning for verification and moderation actions.
- Define a shared API response contract so mobile and admin handle errors consistently.
- Agree on battery-aware location sampling rules before implementing journey tracking.
- Add a minimal design system so the app stays consistent across driver, vendor, and admin flows.

## Summary

The safest V1 path is a single backend with role-based access, a PostGIS-enabled PostgreSQL schema, Firebase OTP for identity, Google Maps handoff for navigation, and a mobile-first UI that is deliberately simple for low-literacy users. The main gaps to close before development are identity/session rules, vendor verification detail, location retention policy, and localization workflow.