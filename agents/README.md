# Highway Setu Specialized AI Agents

This directory contains the system prompts, requirements, and design rules for the five specialized AI agents tailored for the Highway Setu project.

## Agent Overview

1. **[Product Architect](product_architect/system_prompt.txt) (⭐ Most Important)**:
   - **Focus**: Overall business domain, safety, ease-of-use for low-literacy users, voice integrations, and core workflows.
   - **Stack Context**: React Native, Node.js/Express, PostgreSQL, Firebase FCM, Razorpay, Next.js, Google Maps.

2. **[Backend Architect](backend_architect/system_prompt.txt)**:
   - **Focus**: DB schema, API design, security/auth (JWT, OTP), migrations, validation logic, and caching (Redis).
   - **Stack Context**: Node.js, Express, PostgreSQL, Redis, Firebase, Razorpay.

3. **[Mobile App Architect](mobile_app_architect/system_prompt.txt)**:
   - **Focus**: React Native development, screen layout, navigation structure, offline-first strategies, voice input integration, and localized layouts (Hindi, English, Punjabi) with large touch targets.
   - **Stack Context**: React Native, React Navigation, Redux Toolkit, i18next, Firebase, Google Maps.

4. **[Admin Dashboard Architect](admin_dashboard_architect/system_prompt.txt)**:
   - **Focus**: Back-office dashboard, user verification workflows, charts & analytics, SOS dispatch monitoring, and role-based access control (RBAC).
   - **Stack Context**: Next.js, Tailwind CSS, PostgreSQL, Chart libraries.

5. **[GIS & Maps Specialist](gis_specialist/system_prompt.txt) (⭐ Crucial)**:
   - **Focus**: Spatial queries, PostGIS, route tracking, distance calculations, nearby searches, and dispatching.
   - **Stack Context**: Google Maps API, PostGIS, Spatial indexing.

## Interaction Workflow

```
[User Request]
      │
      ▼
┌─────────────────────────────────────────┐
│       Agent 1: Product Architect        │
│ (Flows, Screens, APIs, DB, Edge Cases)  │
└──────────────────┬──────────────────────┘
                   │ Defines specs for
                   ├───────────────────────────────┐
                   ▼                               ▼
┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│     Agent 2: Backend Architect      │  │    Agent 3: Mobile App Architect    │
│ (DB Schema, migrations, Endpoints)  │  │ (Screens, i18n, Offline, Voice UI)  │
└──────────────────┬──────────────────┘  └─────────────────────────────────────┘
                   │ Geospatial APIs
                   ▼
┌─────────────────────────────────────┐
│    Agent 5: GIS & Maps Specialist   │
│   (PostGIS, Routes, Nearby search)  │
└─────────────────────────────────────┘

* Agent 4: Admin Dashboard Architect handles Next.js back-office interfaces and analytics.
```
