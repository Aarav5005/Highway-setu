---
name: agent-workflow
description: Guidelines for how the specialized AI agents (Product, Backend, Mobile, GIS, Admin) collaborate to design and implement features.
---

# Agent Workflow

To design and implement features for Highway Setu, the specialized agents must follow this top-down sequential pipeline:

```
System Architect (Product Architect)
         │
         ▼
Database Architect
         │
         ▼
Backend Architect
         │
         ▼
Mobile Architect
         │
         ▼
Maps Architect (GIS Specialist)
         │
         ▼
Admin Architect
         │
         ▼
Code Review Agent
```

## Step-by-Step Flow:
1. **System Architect (Product):** Defines product requirements, user flows, and wireframe outlines.
2. **Database Architect:** Receives the specs and designs the PostgreSQL tables, indexes, and constraints.
3. **Backend Architect:** Develops the Node.js/Express REST APIs and integrates database logic.
4. **Mobile Architect:** Builds the React Native screens, integrates localized translation bundles (i18n), and connects to backend APIs.
5. **Maps Architect (GIS):** Handles geospatial optimizations, PostGIS setups, and Map APIs.
6. **Admin Architect:** Sets up the Next.js admin dashboard UI and connects analytics.
7. **Code Review Agent:** Performs final quality checks, performance reviews, and safety compliance checks.
