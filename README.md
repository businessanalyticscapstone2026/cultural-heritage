# Tourism Cultural Decision Support System (TCDSS)

A web-based Decision Support System for Cultural Heritage Tourism in the First
District of Batangas. It centralizes cultural heritage information for the
PTCAO Administrator and Municipal Tourism Offices (MTO), and provides
tourists with GIS mapping, personalized recommendations, route optimization,
QR code integration, and tourism analytics to support decision-making.

See [AGENTS.md](./AGENTS.md) for the full engineering/architecture standards
this repo follows.

## Architecture

This repository contains **two separate applications**:

### 1. Root app — Admin/MTO portal (Next.js)

Next.js App Router app serving:

- `app/admin` — PTCAO Administrator portal
- `app/mto` — Municipal Tourism Office portal
- `app/(auth)` / `app/auth` — shared login, registration, and the
  Clerk-to-Supabase auth bridge (`app/auth/clerk-bridge-register`)
- `app/(public)` / `app/home` — public-facing pages (explore, map, reviews, etc.)
- `app/api` — Route Handlers (analytics, heritage, GIS, QR, roles, etc.)

Auth is [Clerk](https://clerk.com) (with Google OAuth), bridged into
Supabase for data access. There is no separate backend server — Supabase
(Postgres, Auth, Storage) is the entire backend.

**`app/` vs `features/`:** `app/` is routing only (pages, layouts, route
handlers). Business logic lives in feature modules under `features/`, one
folder per domain (`heritage`, `dashboard`, `gis`, `recommendation`,
`route-optimization`, `analytics`, `qr-code`, `users`, etc.), each following
the convention:

```
features/<name>/
  actions/      # Server Actions
  components/   # feature-specific UI
  hooks/        # feature-specific hooks
  services/     # data access / business logic
  schemas/      # Zod validation schemas
  types.ts
```

See `features/heritage` for the fullest example of this convention, or
`features/dashboard` for a minimal one. UI components never contain business
logic — they call into `features/*/services` and `features/*/actions`.

### 2. `cultural-heritage-tourist/` — Tourist-facing app

A **separate front-end project**, not part of the Next.js app above. It is a
[TanStack Start](https://tanstack.com/start) app (Vite + `@tanstack/react-start`,
scaffolded via Lovable's `@lovable.dev/vite-tanstack-config`), using the same
Supabase backend. It has its own `package.json`, lockfile, and deploy target
(see [Deployment](#deployment)) and must be installed/run independently of
the root app.

## Local Development Setup

Package manager: **bun** (both apps use `bun.lock`).

### Root app (Admin/MTO portal)

```bash
bun install          # install dependencies
cp .env.local.example .env.local   # then fill in real values, see below
bun dev               # start dev server -> http://localhost:3000
bun test              # run tests (bun's built-in test runner)
bun run lint          # run ESLint
```

Note: `bun run lint` currently reports pre-existing errors/warnings elsewhere
in the codebase (React Compiler incompatible-library warnings, a couple of
`react-hooks/set-state-in-effect` errors). The command itself works; it is
documented here as-is rather than a target to make pass as part of this task.

### Tourist app (`cultural-heritage-tourist/`)

Run these from inside `cultural-heritage-tourist/`, using its own
`package.json` scripts:

```bash
cd cultural-heritage-tourist
bun install
bun run dev           # start dev server -> http://localhost:8080
bun run build         # production build (vite build)
bun run lint          # run ESLint
```

There is no `test` script defined in this app's `package.json`. Like the root
app, `bun run lint` here currently reports a large number of pre-existing
`prettier/prettier` findings — the command works, the codebase just isn't
lint-clean yet.

## Environment Variables

Copy `.env.local.example` to `.env.local` in the relevant app directory and
fill in real values. **Never commit `.env.local` or expose these values
client-side beyond what's explicitly prefixed `NEXT_PUBLIC_`.**

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Project Settings → API). Public. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key for client-side requests. Public. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key. **Server-only** — bypasses RLS. Never expose it client-side or commit it. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for the auth SDK. Public. |
| `CLERK_SECRET_KEY` | Clerk secret key. **Server-only.** Never expose it client-side or commit it. |
| `TAAL_PORTAL_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the Taal portal API (`/api/v1/taal/*`), exact match, no wildcards. Empty blocks all browser origins. Server-only. See `docs/integrations/taal-portal.md`. |

For the canonical, up-to-date list of variables and example values, see
`.env.local.example` at the repo root — tracked under CHT-129.

The tourist app (`cultural-heritage-tourist/`) has no `.env.local.example`
committed; it uses its own `.env.local` with different, Vite-prefixed
variable names (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Get
real values from the same Supabase project's dashboard.

## Database

Schema and migrations live in `supabase/migrations/` (plain numbered SQL
files, applied in order). This repo does not commit a `supabase/config.toml`,
so there is no local Supabase CLI project scaffolded — the project connects
directly to a linked, hosted Supabase project. If you need a local Supabase
stack, run `supabase init` first, then use the standard Supabase CLI
migration workflow (`supabase migration up` / `supabase db push`) against
your target project. There are no project-specific migration scripts beyond
`scripts/seed-permissions.sql`, which seeds role/permission data.

## Deployment

- **Root app (Admin/MTO portal):** no `vercel.json`, `.vercel/`, or other
  deployment config is present in the repo. Deployment target/process is not
  determined by anything checked in — treat it as manual/undocumented rather
  than assuming Vercel.
- **Tourist app (`cultural-heritage-tourist/`):** builds via Nitro with the
  `cloudflare-module` preset (see `.output/nitro.json`) and deploys to
  **Cloudflare Workers** via Wrangler:

  ```bash
  cd cultural-heritage-tourist
  bun run build
  npx wrangler --cwd ./ deploy
  ```

  No `wrangler.toml`/`wrangler.jsonc` is committed to the repo, so Cloudflare
  project/account bindings are configured outside version control.
