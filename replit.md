# Sarathi OS

A production-grade fleet operations platform for commercial drivers — trip management, expense tracking, broker relationships, and profitability analytics.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the Express API server (port 5000)
- `pnpm --filter @workspace/web run dev` — run the Next.js 14 web app (port 3000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push Drizzle DB schema changes (dev only)
- Required env: `MONGODB_URI`, `SESSION_SECRET` — see `artifacts/web/.env.example`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Web**: Next.js 14 (App Router), React 18, Tailwind v3, dark mode
- **State**: Zustand (client), TanStack Query (server state)
- **Forms**: React Hook Form + Zod
- **DB**: MongoDB + Mongoose 8 (Sarathi OS data layer)
- **API (legacy)**: Express 5 + Drizzle ORM + PostgreSQL
- **PWA**: @ducanh2912/next-pwa
- Build: esbuild (API), Next.js (web)

## Where things live

```
artifacts/web/src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── layout/             # RootLayout wrapper
│   └── providers/          # AppProviders (Query + Theme)
├── config/
│   ├── env.server.ts       # Zod-validated server env (server-only)
│   └── env.client.ts       # Zod-validated NEXT_PUBLIC_ env
├── features/               # Feature-first modules (Phase 3+)
├── hooks/
│   └── useTheme.ts         # Dark mode convenience hook
├── lib/
│   └── db/
│       ├── mongoose.ts     # Singleton connection with global cache
│       └── errors.ts       # Typed DB errors (DbError hierarchy)
├── models/                 # Mongoose models — REPOSITORY USE ONLY
│   ├── User.ts
│   ├── Trip.ts
│   ├── Expense.ts
│   └── Broker.ts
├── repositories/           # All DB access lives here
│   ├── BaseRepository.ts   # Generic CRUD + paginate + soft-delete
│   ├── UserRepository.ts
│   ├── TripRepository.ts
│   ├── ExpenseRepository.ts
│   └── BrokerRepository.ts
├── schemas/
│   └── validation.ts       # Zod schemas for all entities
├── store/
│   └── index.ts            # Zustand app store
└── types/
    ├── index.ts             # Generic API types (ApiResponse, etc.)
    └── database.ts          # Enums, Mongoose document interfaces, DTOs
```

## Architecture decisions

- **Feature-first folder structure**: each feature in `features/<domain>/` owns its own components, hooks, store slice, schemas, and types.
- **Repository pattern**: Mongoose models are never queried directly outside their repository. One repository per collection. All query logic encapsulates here.
- **Soft delete everywhere**: all documents carry `deletedAt: Date | null` (select: false). `BaseRepository.delete()` sets this field; all read queries automatically filter `{ deletedAt: null }`.
- **Server/client env split**: `env.server.ts` uses `server-only` — importing it in a Client Component is a build-time error. `env.client.ts` is safe anywhere.
- **`/api` path ownership**: the Express server at port 8080 owns the `/api` proxy path. Next.js Route Handlers (Phase 3+) must use a different prefix to avoid proxy collisions.
- **React 18 + Tailwind v3 pinned**: workspace catalog has React 19 and Tailwind v4; both are incompatible with Next.js 14 and pinned explicitly in `artifacts/web/package.json`.

## Product

Sarathi OS serves commercial truck drivers across India. Core capabilities:
- **Trip management**: full lifecycle from New → Accepted → Loaded → In Transit → Delivered → Paid
- **Expense tracking**: categorized (Fuel, Toll, Maintenance, Broker Fee, Food, Parking, Repair, Other) with receipt image support and trip linkage
- **Broker directory**: rating, payment delay tracking, company info
- **Driver profile**: vehicle details (model, number, fuel type), base mileage for profitability calculations
- **Sync-aware**: all transactional data carries `syncStatus` (Pending/Synced) for offline-first mobile sync

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **`next.config.mjs` not `.ts`**: Next.js 14 does not support TypeScript config files (that's Next.js 15+).
- **Always run `pnpm install` from workspace root**, not from inside an artifact directory.
- **Mongoose hot-reload safety**: models use `mongoose.models['X'] ?? mongoose.model(...)` pattern — never call `mongoose.model()` unconditionally.
- **`server-only` in `types/database.ts`**: this file imports mongoose types — do not import it from client components. For client-safe enum values in Phase 3, add a `types/enums.client.ts` without the server-only constraint.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
