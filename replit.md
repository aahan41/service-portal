# Manual Service Portal

A full-stack dark-themed SaaS dashboard for applying for government document services (Aadhaar, PAN, Voter ID, DL, RC, etc.) with manual admin approval/rejection flows.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/service-portal run dev` — run the frontend (port from env)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + Tailwind CSS (shadcn/ui)
- API: Express 5 + JWT auth (jsonwebtoken + bcryptjs)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for the API contract
- `lib/api-client-react/src/generated/api.ts` — generated hooks (do not edit)
- `lib/db/src/schema.ts` — Drizzle DB schema
- `artifacts/api-server/src/` — Express API server (routes, middleware, seed)
- `artifacts/service-portal/src/` — React frontend (pages, components, hooks)

## Architecture decisions

- JWT stored in `localStorage` as `auth_token`; `setAuthTokenGetter` wires it to every API call in `main.tsx`
- Wallet is manual: users request top-ups, admins approve/reject — no payment gateway
- Applications have 4 statuses: pending → processing → success | rejected
- Admin can add result text/file URL when completing an application
- 37 services across 10 categories seeded at startup

## Product

- **Users**: Register, login, browse 37 government services across 10 categories, apply for services (wallet-gated), track application status, manage wallet top-up requests, view notifications
- **Admins**: Dashboard with stats, review/approve/reject applications with result text/files, manage wallet top-up requests, manage services & categories, view all users

## Test Credentials

- Admin: `admin@portal.com` / `admin123`
- User: `user@portal.com` / `admin123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec changes
- Run `pnpm --filter @workspace/db run push` after any schema changes
- `UserListResponse` is `{ users: User[], total: number }` — not a plain array
- `AdminStats` uses `successApplications` (not `completedApplications`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
