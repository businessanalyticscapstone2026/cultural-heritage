<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# AGENTS.md

# Tourism Cultural Decision Support System (TCDSS)

> AI Development Guide
>
> This document defines the development standards, architecture, conventions, and engineering practices for this project.
> Every AI agent working on this repository MUST follow these rules.

---

# Project Overview

This project is a web-based Decision Support System (DSS) for Cultural Heritage Tourism in the First District of Batangas.

The system centralizes cultural heritage information while providing:

- Heritage Information Management
- GIS Mapping
- Personalized Recommendation System
- Route Optimization
- Tourism Analytics
- QR Code Integration
- Decision Support Reports

Primary users:

- PTCAO Administrator
- Municipal Tourism Office (MTO)
- Tourists

---

# Tech Stack

## Framework

- Next.js (App Router)
- TypeScript
- TailwindCSS v4

## Backend

- Supabase
  - Authentication
  - PostgreSQL Database
  - Storage
  - Row Level Security

## Forms

- React Hook Form
- Zod v4

## UI

- shadcn/ui
- Lucide React
- Motion

## GIS

- MapCN
- MapLibre GL
- OpenStreetMap

## Charts

- Recharts

## State

- Zustand (UI state only)

## Package Manager

- bun

---

# Engineering Philosophy

Always prioritize:

1. Readability
2. Scalability
3. Maintainability
4. Performance
5. Accessibility

Never optimize prematurely.

Avoid clever code.

Choose boring, maintainable solutions.

---

# Architecture

Use Feature-Based Architecture.

```
app/
components/
features/
hooks/
lib/
services/
types/
utils/
constants/
```

Feature modules:

```
auth/
dashboard/
heritage/
gis/
recommendation/
routing/
analytics/
qr/
users/
settings/
```

Business logic belongs inside feature modules.

Never place business logic inside UI components.

---

# Coding Standards

Use:

- TypeScript strict mode
- Functional Components
- Server Components by default
- Client Components only when necessary

Never use:

- any
- class components
- inline styles
- duplicated logic

Prefer:

- async/await
- composition
- reusable components
- descriptive variable names

---

# Imports

Always use absolute imports.

Correct:

```ts
import Button from "@/components/ui/button";
```

Avoid long relative imports.

---

# Components

Components should:

- have one responsibility
- be reusable
- remain easy to understand

Avoid giant components.

Split components before they become difficult to maintain.

---

# Server Components

Default to Server Components.

Use Client Components only when:

- hooks are required
- browser APIs are required
- animations are required
- interactive forms are required

---

# Styling

TailwindCSS v4 only.

Do not create custom CSS unless absolutely necessary.

Prefer:

- utility classes
- design tokens
- shadcn components

---

# Icons

Use Lucide React only.

---

# Animations

Use Motion.

Animations should improve UX.

Avoid unnecessary animations.

---

# Forms

All forms must use:

- React Hook Form
- Zod v4 validation

Validate:

- client
- server

Never trust client validation.

---

# Authentication

Use Supabase Auth.

Never implement custom authentication.

Support:

- Email / Password
- Google OAuth (future ready)

Protect all private routes.

---

# Database

Supabase PostgreSQL only.

Use:

- UUID primary keys
- created_at
- updated_at

Prefer normalized tables.

Never duplicate data unless justified.

---

# Row Level Security

All user-owned tables must have RLS enabled.

Never bypass RLS.

---

# Storage

Store:

- heritage images
- brochures
- documents
- videos

Use Supabase Storage buckets.

---

# GIS

Maps use:

- MapCN
- MapLibre GL
- OpenStreetMap

Keep GIS logic separate from UI.

Map components should only render data.

---

# Recommendation System

The recommendation engine must remain independent.

Algorithms include:

- Content-Based Filtering
- Weighted Scoring
- Location-Aware Recommendation

Never mix recommendation logic with UI.

Recommendation logic belongs inside:

```
features/recommendation
```

---

# Route Optimization

Routing uses:

Dijkstra Shortest Path Algorithm.

Routing belongs inside:

```
features/routing
```

UI must never implement routing logic.

---

# Analytics

Charts use Recharts.

Always aggregate data on the server whenever possible.

Avoid expensive client-side calculations.

---

# State Management

Use Zustand only for:

- sidebar
- theme
- filters
- selected map markers
- dialogs
- UI state

Do NOT store server data inside Zustand.

---

# Data Fetching

Prefer:

Server Components

Server Actions

Use client fetching only when interactive updates are required.

---

# Performance

Always:

- lazy load maps
- lazy load charts
- optimize images
- paginate large datasets
- debounce searches
- cache expensive queries

Avoid unnecessary re-renders.

---

# Accessibility

Every page should include:

- semantic HTML
- labels
- keyboard navigation
- focus states
- sufficient color contrast

Accessibility is required.

---

# File Naming

Components

```
heritage-card.tsx
```

Hooks

```
use-map.ts
```

Utilities

```
calculate-score.ts
```

Types

```
heritage.ts
```

---

# Folder Responsibility

components/

Reusable UI only.

features/

Business logic.

services/

External services.

lib/

Shared utilities.

utils/

Helper functions.

hooks/

React hooks.

types/

TypeScript types.

---

# Error Handling

Never silently ignore errors.

Provide:

- loading states
- empty states
- error states
- retry actions

---

# Security

Never expose:

- service role keys
- environment variables
- database secrets

Validate all input.

Sanitize uploaded files.

---

# GIS Rules

Keep:

- coordinates
- GeoJSON
- markers
- polygons

inside GIS modules.

Avoid hardcoded coordinates.

---

# Recommendation Rules

Recommendations should consider:

- heritage category
- historical significance
- accessibility
- tourist interests
- distance
- municipality

Recommendation output should explain why an item was recommended.

---

# Dashboard

Dashboards should prioritize:

- KPIs
- Trends
- Comparisons
- Actionable insights

Avoid decorative charts.

---

# AI Behavior Rules

Before writing code:

Understand the feature.

Identify affected modules.

Avoid modifying unrelated files.

Reuse existing code before creating new code.

Follow project architecture.

Keep changes minimal.

---

# Definition of Done

A task is complete only if:

✓ Builds successfully

✓ TypeScript passes

✓ Validation implemented

✓ Responsive

✓ Accessible

✓ No duplicated code

✓ Uses project conventions

✓ No unnecessary dependencies

✓ Business logic separated from UI

✓ Performance considered

✓ Security considered

---

# General Rule

When uncertain:

Prefer consistency with the existing architecture over introducing new patterns.

<!-- END:nextjs-agent-rules -->

