# Highway Setu Repository Architecture

## Purpose

This document defines the complete production-ready repository architecture for Highway Setu V1.

It includes:

1. Folder structure
2. Naming conventions
3. Environment variable strategy
4. Shared types strategy
5. Module boundaries

No implementation code is included.

## Technology Baseline

1. Backend: Node.js, Express, TypeScript
2. Mobile: React Native, TypeScript
3. Admin: Next.js, Tailwind CSS
4. Database: PostgreSQL

## Monorepo Structure

highway-setu/

1. apps/
2. packages/
3. infra/
4. docs/
5. scripts/
6. mcp-servers/
7. agents/
8. .agents/

### apps/

1. apps/backend/
2. apps/mobile/
3. apps/admin/

### apps/backend/

1. src/
2. tests/
3. package.json
4. tsconfig.json
5. .env.example

#### apps/backend/src/

1. app/
2. config/
3. modules/
4. middleware/
5. integrations/
6. db/
7. utils/
8. types/
9. index.ts

#### apps/backend/src/modules/

1. auth/
2. drivers/
3. trucks/
4. journeys/
5. vendors/
6. dhabas/
7. mechanics/
8. admin/
9. location/
10. media/
11. health/

Each module contains:

1. controller.ts
2. service.ts
3. repository.ts
4. validator.ts
5. routes.ts
6. types.ts

### apps/mobile/

1. src/
2. assets/
3. android/
4. ios/
5. package.json
6. tsconfig.json
7. .env.example

#### apps/mobile/src/

1. app/
2. navigation/
3. screens/
4. features/
5. services/
6. state/
7. components/
8. theme/
9. i18n/
10. utils/
11. types/

#### apps/mobile/src/screens/

1. auth/
2. driver/
3. dhaba/
4. mechanic/
5. shared/

### apps/admin/

1. src/
2. public/
3. package.json
4. next.config.ts
5. tailwind.config.ts
6. tsconfig.json
7. .env.example

#### apps/admin/src/

1. app/
2. modules/
3. components/
4. services/
5. hooks/
6. lib/
7. types/
8. styles/

#### apps/admin/src/modules/

1. auth/
2. user-verification/
3. vendor-management/
4. dashboard/
5. audit/

### packages/

1. packages/shared-types/
2. packages/shared-validation/
3. packages/shared-constants/
4. packages/shared-i18n/

### infra/

1. infra/database/
2. infra/environments/
3. infra/observability/
4. infra/security/

#### infra/database/

1. migrations/
2. seeds/
3. schema/
4. policies/
5. README.md

### scripts/

1. scripts/bootstrap/
2. scripts/release/
3. scripts/quality/

## Naming Conventions

### Repository and Paths

1. Use lowercase kebab-case for folder names.
2. Use singular module names only when representing one clear domain concept.
3. Keep route segments lowercase and plural where resource-oriented.

### TypeScript

1. Use PascalCase for interfaces, types, classes, and React components.
2. Use camelCase for functions and variables.
3. Use UPPER_SNAKE_CASE for constants and environment keys.
4. Use explicit suffixes where useful:
   1. Request and Response for API payload types
   2. Dto for transfer models
   3. Entity for persistence models

### File Naming

1. Use kebab-case for feature files.
2. Use role-based file names inside modules:
   1. driver-profile.controller.ts
   2. driver-profile.service.ts
   3. driver-profile.repository.ts
   4. driver-profile.validator.ts

### API Naming

1. Prefix all endpoints with /api/v1.
2. Use noun-based resource naming.
3. Avoid action-style endpoint sprawl unless unavoidable.

## Environment Variable Strategy

### Rules

1. Keep all secrets out of source control.
2. Use one .env.example per app.
3. Validate environment variables at startup.
4. Separate mandatory and optional variables by module.
5. Prefix variables by app scope.

### Backend Environment Variables

1. APP_ENV
2. APP_PORT
3. APP_BASE_URL
4. DB_HOST
5. DB_PORT
6. DB_NAME
7. DB_USER
8. DB_PASSWORD
9. DB_SSL
10. JWT_ACCESS_SECRET
11. JWT_REFRESH_SECRET
12. JWT_ACCESS_TTL
13. JWT_REFRESH_TTL
14. FIREBASE_PROJECT_ID
15. FIREBASE_CLIENT_EMAIL
16. FIREBASE_PRIVATE_KEY
17. GOOGLE_MAPS_API_KEY
18. STORAGE_PROVIDER
19. STORAGE_BUCKET
20. STORAGE_REGION
21. CORS_ALLOWED_ORIGINS
22. LOG_LEVEL

### Mobile Environment Variables

1. MOBILE_APP_ENV
2. MOBILE_API_BASE_URL
3. MOBILE_FIREBASE_API_KEY
4. MOBILE_FIREBASE_APP_ID
5. MOBILE_FIREBASE_PROJECT_ID
6. MOBILE_GOOGLE_MAPS_API_KEY

### Admin Environment Variables

1. ADMIN_APP_ENV
2. ADMIN_API_BASE_URL
3. ADMIN_JWT_AUDIENCE
4. ADMIN_JWT_ISSUER
5. ADMIN_ALLOWED_EMAIL_DOMAINS

## Shared Types Strategy

### Objective

Use shared types only for cross-application contracts that are consumed by two or more apps.

### packages/shared-types Structure

1. src/auth/
2. src/users/
3. src/drivers/
4. src/trucks/
5. src/journeys/
6. src/vendors/
7. src/dhabas/
8. src/mechanics/
9. src/admin/
10. src/location/
11. src/common/

### Shared Type Categories

1. API request and response contracts
2. Role and status enums
3. Pagination and filtering contracts
4. Error envelope types
5. Localization key unions

### Shared Types Rules

1. Do not place business logic in shared type packages.
2. Do not share persistence entities directly with clients.
3. Use explicit DTO types for backend-to-client contracts.
4. Version breaking type changes and roll them across all consumers.

## Module Boundaries

### Backend Boundaries

1. auth: OTP verification, token issuance, session context.
2. drivers: driver profile operations only.
3. trucks: truck CRUD tied to driver.
4. journeys: start and end journey lifecycle.
5. location: GPS ping ingest and distance computations.
6. vendors: vendor discovery and vendor details.
7. dhabas: dhaba-specific profile, amenities, menu, photos.
8. mechanics: mechanic-specific profile, services, availability.
9. admin: user verification and vendor management.
10. media: upload metadata lifecycle only.

Boundary rule: modules communicate through service contracts, not direct repository access across domains.

### Mobile Boundaries

1. auth feature: OTP login and session bootstrap.
2. driver feature: profile, truck, journey, discovery, details, handoff.
3. dhaba feature: registration, profile, amenities, photos, menu.
4. mechanic feature: registration, services, availability.
5. shared feature: localization, common UI, offline states.

Boundary rule: screens call feature services; screens do not perform direct network orchestration.

### Admin Boundaries

1. auth module: admin authentication and guard logic.
2. user-verification module: user checks and approvals.
3. vendor-management module: vendor operations and lifecycle states.
4. dashboard module: operational aggregates and filters.
5. audit module: activity and decision traceability.

Boundary rule: admin modules only consume admin-authorized APIs.

## Database Architecture Placement

PostgreSQL assets must live in infra/database and follow strict migration discipline.

1. One migration per atomic schema change.
2. No direct schema edits outside migration files.
3. Seed data only for non-production bootstrap and test environments.
4. PostGIS activation and spatial index creation must be migration-managed.

## V1 Scope Mapping Enforcement

All repository modules must map to the locked V1 feature scope.

Allowed domains only:

1. Driver: OTP Login, Driver Profile, Truck Details, Start Journey, GPS Tracking, Vendor Discovery, Vendor Details, Distance Calculation, Open Google Maps
2. Dhaba: Registration, Profile, Amenities, Photos, Menu
3. Mechanic: Registration, Services, Availability
4. Admin: User Verification, Vendor Management

Explicitly prohibited in V1:

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

## Production Readiness Checklist

1. TypeScript enabled in backend, mobile, and admin apps.
2. Centralized environment validation in each app.
3. Shared type package consumed by all apps.
4. Migration-first PostgreSQL workflow in place.
5. Module boundary lint rules defined.
6. API versioning and error envelope conventions documented.
7. V1 scope guardrails applied to schema, API, and screens.
