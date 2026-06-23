# Highway Setu Seed Strategy

## Goals

1. Keep seed data deterministic for local and CI environments.
2. Seed only records needed to validate V1 user flows.
3. Avoid seeding production databases.

## Seed Scope

1. users
2. driver_profiles
3. dhaba_profiles
4. dhaba_amenities
5. dhaba_photos
6. dhaba_menu_items
7. mechanic_profiles
8. mechanic_services
9. reviews

## Environment Policy

1. Local and test environments may run full demo seeds.
2. Staging should run minimal sanitized seeds only.
3. Production must not run demo seeds.

## Data Shape

1. One admin user for verification workflow testing.
2. Two driver users and their profiles.
3. Two dhaba owners with profile, amenities, photos, and menu.
4. Two mechanic owners with profile and services.
5. Driver-submitted reviews on both vendor types.

## Safety Controls

1. Use transaction-wrapped seeds.
2. Use idempotent upsert patterns for repeatability.
3. Keep seed data free of real personal data.
