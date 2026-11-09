# 🛡️ KIDSbSAFE — Ethical Family Safety Platform

KIDSbSAFE is a family-safety platform for parents who want to protect their own
minor children from grooming, predatory contact, bullying, scams, and dangerous
websites **without covert surveillance**.

The product principle is **transparent protection**:

- The child app is visible and explains what is monitored.
- Normal activity stays private.
- Only high-risk events (risk score **≥ 70**) surface to a parent.
- No keylogging, no secret screenshots, no hidden install mode.

> **Project status:** runnable prototype / pre-production. Last audited
> **2026-11-08**. See [`AUDIT.md`](./AUDIT.md) for verified limitations before
> treating any feature as production-ready.

---

## Documentation map

| Document | Use it for |
| :--- | :--- |
| **`HOW-TO-USE.md`** | Step-by-step: run locally, parent walkthrough, pair a child device, troubleshoot |
| **`DEPLOY.md`** | Production deployment (Docker, Bun, Render/Fly/Railway) |
| **`AUDIT.md`** | What is implemented vs. claimed, security notes, open issues |
| **`design.md`** | Brand, colours, typography, motion |
| **`task.md`** | Original build checklist (partly historical) |
| **`“KIDSbSAFE” MEGA PROMPT.md`** | Original product/ethical requirements |

---

## Repository structure

This is a **Bun + Turbo monorepo**.

```text
packages/
├── web/        Hono API + React/Vite parent dashboard (one Bun process in production)
├── mobile/     Expo / React Native parent app + visible child-device mode
└── desktop/    Optional Electron wrapper (scaffold)
```

| Package | Stack | Purpose |
| :--- | :--- | :--- |
| `packages/web` | Bun, Hono, Drizzle ORM, PostgreSQL, React 19, Vite, Tailwind 4, Better Auth, Autumn | API + parent SPA |
| `packages/mobile` | Expo SDK 54, Expo Router, React Native, SecureStore, expo-location | Parent app + child device app |
| `packages/desktop` | Electron + Vite | Desktop shell that loads the web dashboard |

---

## How the platform works

```text
 Parent browser ──┐
 Parent mobile  ──┼── HTTPS ──►  Bun.serve  ──►  Hono /api/*  ──►  PostgreSQL
 Child mobile   ──┘                │                                  (Drizzle)
                                   └──►  packages/web/dist  (React SPA)
```

### One process, one port (production)

`packages/web/src/api/server.ts` is a single `Bun.serve` process:

1. `/api/*` → the Hono app (`src/api/index.ts`).
2. Known asset extensions → files from `packages/web/dist`.
3. Anything else → `index.html` (SPA fallback for `/dashboard`, `/pricing`, …).

### Authentication and authorisation

- **Parents** sign in with email + password through **Better Auth**
  (`/api/auth/*`). The web client stores the bearer token and sends
  `Authorization: Bearer …`.
- **Child devices** are authorised by a `deviceToken` generated on the device
  at pairing time and stored in `expo-secure-store`. A `childId` alone is
  **not** a credential.
- Parent-only routes are wrapped in `requireAuth`. Device ingestion routes
  (`/api/geo`, `/api/browse/check`, `/api/alerts/risk-scan`, `/api/dns/log`)
  verify `childId + deviceToken`.

### Data model

| Table | Holds |
| :--- | :--- |
| `user`, `session`, `account`, `verification` | Better Auth |
| `families` | One family per parent (`parent_user_id` is unique) |
| `children` | Child profile, pairing code, paired device token |
| `alerts` | Risk events shown on the parent dashboard |
| `geofences` | Safe-zone definitions |
| `gps_events` | Location reports from child devices |
| `browsing_history` | URLs checked by the child's Safe Browser |
| `dns_logs` | Domain lookups reported by a DNS resolver |
| `domain_blacklist` | Seedable high-risk domain list |

---

## Feature status

This table describes what the code actually does today — not marketing copy.

| Area | Status | Notes |
| :--- | :--- | :--- |
| Parent email/password auth | ✅ Working | Bearer sessions via Better Auth |
| Ethical signup gating | ⚠️ Web only | Declaration, age range, reason on `/sign-up`. Mobile signup does not ask |
| Family + child CRUD | ✅ Working | One family per parent; add/pair children |
| 6-character device pairing | ✅ Working | 15-minute code, rate-limited, crypto-random |
| Live GPS map | ✅ Working | Child app reports foreground location; Leaflet/OSM map |
| Alert feed + dismiss | ✅ Working | Threshold 70; categories grooming/bullying/scam/predator |
| Safe Browser URL checks | ✅ Working | Child app calls `/api/browse/check`; optional Google Safe Browsing |
| Browsing history view | ✅ Working | Parent dashboard tab |
| Risk engine (messages) | ⚠️ API only | `POST /api/alerts/risk-scan` works, but no app currently submits messages |
| Network Guard (DNS) | ⚠️ Manual | Child screen explains private-DNS setup; this repo has no DNS resolver |
| Geofencing | ⚠️ Backend only | CRUD API exists; no UI and no enter/exit evaluation |
| Billing / plans | ⚠️ Partial | Autumn plans + pricing UI; scan limits are not enforced |
| Demo data | ✅ Working | "Load Demo Data" before creating a real family |
| Email verification | ❌ Missing | Signup signs the user in immediately |
| 13+ opt-out request | ⚠️ Simulated | UI confirmation only; no API/parent notification |
| Desktop app | ⚠️ Scaffold | Electron shell; renderer build target is not wired |
| Automated tests | ❌ None | No test suite in the repo |

---

## Quick start

Full walkthrough: **[`HOW-TO-USE.md`](./HOW-TO-USE.md)**.

```bash
# 1. prerequisites: Bun >= 1.3, PostgreSQL
bun install

# 2. configure
cp .env.template .env
#    edit .env: DATABASE_URL, BETTER_AUTH_SECRET, WEBSITE_URL
#    BETTER_AUTH_SECRET: openssl rand -hex 32

# 3. create tables + seed the domain blacklist
bun run db:push
bun run packages/web/src/api/database/seed.ts

# 4. run the web app (API + SPA)
bun run dev
# → http://localhost:5173
```

For local development set `WEBSITE_URL=http://localhost:5173` (the dev server
port). In production it must be your public origin.

Health check: `curl http://localhost:5173/api/health`

---

## Environment variables

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | ✅ | Session signing secret (`openssl rand -hex 32`) |
| `WEBSITE_URL` | ✅ | Public origin; used for Better Auth, CORS, desktop |
| `NODE_ENV` | recommended | `development` / `production` |
| `PORT` | optional | Production server port (default `3000`) |
| `CORS_ORIGINS` | optional | Extra comma-separated browser origins |
| `TRUSTED_ORIGINS` | optional | Extra Better Auth origins |
| `DATABASE_PREPARE` | optional | Set `false` for Supabase transaction pooler (port 6543) |
| `DATABASE_POOL_MAX` | optional | Postgres pool size (default `10`) |
| `GOOGLE_SAFE_BROWSING_KEY` | optional | Enables Google Safe Browsing checks |
| `AUTUMN_SECRET_KEY` | optional | Billing/checkout |
| `APPLICATION_ID` | optional | Injects the analytics script hostname |
| `AI_GATEWAY_*` | unused | Present in the template; no code path reads them |
| `GEMINI_API_KEY` | unused | Mentioned in `DEPLOY.md`; not used by code |

Never commit a filled-in `.env`. The template ships **blank** secrets.

---

## Scripts

Run from the repository root.

| Command | Action |
| :--- | :--- |
| `bun run dev` | Vite dev server + Hono API (`:5173`) |
| `bun run dev:mobile` | Expo dev server |
| `bun run dev:desktop` | Electron dev shell |
| `bun run build:web` | Build the SPA only (`packages/web/dist`) |
| `bun run build` | Turbo build across packages |
| `bun run start` | Start the production Bun server via PM2 (default port `4200`) |
| `bun run typecheck` | Turbo typecheck (passes, but the web step is a no-op — see `AUDIT.md`) |
| `bun run db:push` | Push Drizzle schema to the database |
| `bun run db:generate` | Generate a SQL migration from the schema |
| `bun run db:migrate` | Apply generated migrations |
| `bun run db:studio` | Drizzle Studio |
| `bun run lint` | oxlint |

Production build and run:

```bash
cd packages/web
bun run build          # vite build into packages/web/dist
bun run start          # bun src/api/server.ts (PORT, default 3000)
```

From the repository root, `bun run start` instead starts PM2 with
`ecosystem.config.cjs`, which defaults `PORT` to **4200**. Set `PORT=3000` if you
want both entry points to agree.

---

## API reference

All routes are under `/api`. Parent routes require a bearer session; device
routes require `childId` **and** `deviceToken`.

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | public | Liveness check |
| `GET/POST` | `/auth/*` | public | Better Auth handler |
| `POST` | `/families` | parent | Create family (demo family is replaced if untouched) |
| `GET` | `/families/me` | parent | Family + children (never returns tokens) |
| `POST` | `/children` | parent | Add child (age 5–17) |
| `POST` | `/children/:id/pair` | parent | Generate 6-char pairing code (15 min) |
| `POST` | `/children/claim-pair` | device | Claim a code with `pairingCode` + `deviceToken` |
| `GET` | `/alerts` | parent | Active alerts for the family |
| `POST` | `/alerts/:id/dismiss` | parent | Dismiss an alert |
| `POST` | `/alerts/risk-scan` | device | Score a message; creates an alert at ≥ 70 |
| `GET` | `/browse/history` | parent | Browsing history (`?childId=` optional) |
| `POST` | `/browse/check` | device | URL safety check + history write |
| `POST` | `/dns/log` | device | Domain lookup check + history write |
| `GET` | `/geo` | parent | Latest known location per child |
| `POST` | `/geo` | device | Report a GPS fix |
| `GET/POST` | `/geofences` | parent | List / create safe zones |
| `DELETE` | `/geofences/:id` | parent | Delete a safe zone |
| `POST` | `/demo` | parent | Seed demo family (only before a real family exists) |

### Risk engine

`packages/web/src/api/lib/risk-engine.ts` is a deterministic keyword/pattern
scorer:

- Weighted grooming, bullying, scam, and predator phrases.
- `+20` when the sender is an unknown contact.
- `+10` at >10 messages and another `+10` at >25 messages in 24h.
- Clamped to 100; **alerts are written at ≥ 70**.

The browser safety engine is `packages/web/src/api/lib/url-safety.ts`: local
domain/keyword blocklists plus optional Google Safe Browsing.

---

## Deployment

See **[`DEPLOY.md`](./DEPLOY.md)** for the full guide. The short version:

- **Docker:** `docker build -t kidsbsafe . && docker run -p 3000:3000 --env-file .env kidsbsafe`
- **Compose:** `docker compose up -d --build`
- **Bun directly:** build the SPA, then `bun src/api/server.ts` with env vars set.
- **Health check:** `GET /api/health` → `{"status":"ok","service":"KIDSbSAFE"}`

Required in production: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `WEBSITE_URL`.
Set `WEBSITE_URL` to the real public origin or Better Auth origin checks,
callbacks, and CORS will reject requests.

---

## Design system

Brand and UI conventions live in [`design.md`](./design.md):

- Purple gradient `#7C3AED → #A78BFA`, pink `#EC4899`, CTA orange `#F97316`.
- Near-black background `#0A0B14`, glassmorphism surfaces.
- Outfit for display, Inter for body.
- No spy-themed iconography, no fear-based red everywhere.

---

## Ethics and compliance notes

- The child app is designed to be visible and explain monitoring in plain
  language.
- Under-13 devices are parent-controlled; the 13+ review-request screen is
  visible but currently simulated (see `AUDIT.md`).
- The platform is intended **only** for a parent/guardian's own minor children.
  It must not be used for stalking, employer surveillance, or monitoring adults.
- Legal pages are served at `/legal`, `/privacy`, `/terms`, and `/cookies`.
- Before launch, have counsel review the legal copy: some statements (Stripe
  billing, device photo verification, data retention) do not match the current
  implementation.

---

## Known issues

See **[`AUDIT.md`](./AUDIT.md)** for evidence and remediation. Headline items:

- Mobile signup skips the ethical gating that the web signup enforces.
- No email-verification step despite the original requirement.
- Geofence alerts and message monitoring are not wired end-to-end.
- Billing plan limits are displayed but not enforced.
- `bun run typecheck` exits 0, but the web package checks nothing: its
  `tsconfig.json` is a solution config with `"files": []`, so plain
  `tsc --noEmit` compiles zero files. The same step inside `bun run build` is a
  no-op. Run `tsc -p tsconfig.app.json` and `tsc -p tsconfig.node.json`
  explicitly (both pass today).
- Drizzle migrations are behind the current schema (use `db:push` for dev, or
  regenerate migrations before relying on `db:migrate`).

---

## Contributing

1. Read `AUDIT.md` first so you know which features are real.
2. Keep the ethical invariants: visible child app, no covert capture, alerts
   only for high-risk signals.
3. Never commit `.env` or real secrets.
4. Before opening a PR, run `bun run build:web` and `bun run lint`.
