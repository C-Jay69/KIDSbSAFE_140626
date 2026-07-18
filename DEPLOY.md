# KIDSbSAFE — Deployment Guide

This is the **detailed** deployment reference for KIDSbSAFE. For a quick-start overview, see
`README.md`. This guide covers running the **web API + SPA** in production and building the **mobile** app.

---

## 1. Architecture recap (what you are deploying)

KIDSbSAFE is a Turbo monorepo:

| Package | Purpose |
| :--- | :--- |
| `packages/web` | **Hono API** (`/api/*`) **+ React SPA** (parent dashboard, landing, pricing). This is what you deploy. |
| `packages/mobile` | Expo / React Native child app (GPS reporting, pairing). Built separately, talks to the web API. |
| `packages/desktop` | Electron wrapper (optional). |

**The production server is a single Bun process** (`packages/web/src/api/server.ts`) that handles everything:

1. `GET/POST /api/*` → the real Hono app (auth, DB, GPS, alerts, billing).
2. Static assets → served from `packages/web/dist` (the built SPA) with correct MIME types.
3. SPA fallback → any unknown non-`/api` route (e.g. `/pricing`, `/dashboard`) returns `index.html`, so deep links and refreshes work.

**One port. One process.** You do **not** need a separate frontend host and backend host. Default port is `3000` (override with `PORT`).

**Database:** PostgreSQL (tested with Supabase). Schema is managed with Drizzle ORM.

---

## 2. Prerequisites

- **A PostgreSQL database.** Supabase free tier works out of the box. You need the **connection string** (`postgresql://user:password@host:5432/postgres`).
- **A runtime:** either **Docker** (recommended for deploy) or **Bun** (`>=1.3`) installed directly.
- **Secrets** (see §3). None are committed to the repo.

---

## 3. Environment variables

Create a file named **`.env`** in the repo root. It is **already gitignored** — never commit it.
Copy `.env.template` as a starting point:

```bash
cp .env.template .env
```

### Required

| Variable | Purpose | How to get it |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string | Supabase → Settings → Database → Connection string (URI) |
| `BETTER_AUTH_SECRET` | Session token signing secret | `openssl rand -hex 32` |
| `WEBSITE_URL` | Public base URL of this deployment | `https://your-domain.com` (used by Better Auth callbacks) |
| `JWT_SECRET` | JWT signing secret | `openssl rand -hex 32` |

### Recommended (feature-dependent)

| Variable | Purpose |
| :--- | :--- |
| `GEMINI_API_KEY` | AI risk-engine analysis |
| `AI_GATEWAY_BASE_URL` / `AI_GATEWAY_API_KEY` | AI gateway for enhanced analysis |
| `AUTUMN_SECRET_KEY` | Autumn billing (subscriptions / pricing page checkout) |
| `NODE_ENV` | Set to `production` in deploy |

### Optional / legacy

`STRIPE_*` (price IDs, publishable/secret keys), `SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_AUTH_SECRET` — present in the template for Stripe/billing integrations and
mobile auth; only needed if you activate those paths. `APPLICATION_ID` is unused by the web server.

> ⚠️ **Never paste real secret values into chat, issues, or commit them.** Rotate any
> secret that may have been exposed.

---

## 4. Local development (no Docker)

```bash
# 1. install deps (root workspace)
bun install

# 2. configure .env (see §3) — must include a valid DATABASE_URL

# 3. push the schema to your Postgres database
bun run db:push

# 4. run the dev server (Vite + Hono, hot reload)
bun run dev
# → web UI + API on http://localhost:5173
```

The dev server uses the `hono-dev-plugin` to route `/api/*` to the Hono app and
serve the SPA. It reads the root `.env` automatically (Vite `loadEnv` from the monorepo root).

---

## 5. Production build + run (Bun, no Docker)

```bash
cd packages/web

# 1. type-check + build the SPA into packages/web/dist
bun run build

# 2. start the production server (serves API + SPA on PORT, default 3000)
#    Make sure DATABASE_URL / secrets are in the environment (e.g. `bun --env-file=../../.env`)
bun run start
# → http://localhost:3000  (API at /api/*, SPA at /)
```

`package.json` → `"start": "bun src/api/server.ts"`. The server reads `process.env`,
so ensure the env vars from §3 are exported in the process environment.

---

## 6. Docker (single image)

A `Dockerfile` is provided at the repo root (multi-stage: builds the SPA, then runs
the Bun server). It does **not** copy `.env` — you supply secrets at runtime.

```bash
# build the image
docker build -t kidsbsafe .

# run it (pass secrets via --env-file, or -e flags)
docker run -d --name kidsbsafe \
  -p 3000:3000 \
  --env-file .env \
  kidsbsafe

# verify
curl https://localhost:3000/api/health
# → {"status":"ok","service":"KIDSbSAFE"}
```

The image exposes `3000`. Override the port with `-e PORT=8080 -p 8080:8080` if needed.

`.dockerignore` excludes `node_modules`, `.git`, `.env`, and `dist` from the build context.

---

## 7. Docker Compose

`docker-compose.yml` defines a single `web` service with a health check on
`/api/health`.

```bash
# from the repo root (where .env lives)
docker compose up -d --build

# logs
docker compose logs -f web

# stop
docker compose down
```

The compose file reads `.env` locally via `env_file`. **On a hosted platform,**
set the env vars in the platform's dashboard instead and don't rely on a committed `.env`.

---

## 8. Deploying to a host (Render / Fly.io / Railway / DigitalOcean)

General pattern (works on any container platform):

1. **Build** the image (platform builds from the `Dockerfile`, or you push to a registry).
2. **Set environment variables** from §3 in the platform's dashboard (NOT in a committed file).
3. **Expose port `3000`** (or your `PORT`).
4. **Health check:** `GET /api/health` should return `200` with `{"status":"ok"}`.
5. **Domain:** point `WEBSITE_URL` at your public domain (Better Auth needs the correct origin).

Example platform buttons once the image builds:
- **Render:** "New Web Service" → connect repo → Runtime: Docker → Port: 3000.
- **Fly.io:** `fly launch` (detects Dockerfile) → `fly deploy`.
- **Railway:** "Deploy from repo" → it uses the Dockerfile automatically.

---

## 9. Mobile app (Expo)

The child app is built separately and talks to the **hosted web API**.

```bash
cd packages/mobile
bun install
bun x expo start          # local dev
eas build --platform android   # production APK/AAB
eas build --platform ios
```

**Point the mobile app at your deployment:**
- Open `packages/mobile/app.json` → `expo.extra.apiUrl`.
- Set it to your hosted API base URL, e.g. `https://your-domain.com/`.
- It can also be overridden at build time with the `EXPO_PUBLIC_API_URL` environment variable.

The mobile app reports GPS via `POST /api/geo` and pairs via `POST /api/children/claim-pair`.
Make sure those endpoints are reachable from the device's network.

---

## 10. Post-deploy verification

```bash
# 1. server is up
curl https://your-domain.com/api/health
# → {"status":"ok","service":"KIDSbSAFE"}

# 2. database is connected (Better Auth can read the user table)
curl https://your-domain.com/api/auth/get-session
# → null   (200, no active session = DB reachable)

# 3. protected routes are gated
curl https://your-domain.com/api/alerts
# → 401 Unauthorized  (auth wall is up)

# 4. SPA routes resolve (deep link / refresh)
curl -o /dev/null -w "%{http_code}\n" https://your-domain.com/pricing
# → 200
```

---

## 11. Security checklist

- [ ] `.env` is **never** committed (it is gitignored; verify with `git status`).
- [ ] `BETTER_AUTH_SECRET` and `JWT_SECRET` are unique, high-entropy, and rotated if ever exposed.
- [ ] `DATABASE_URL` uses a strong password; Supabase RLS / network rules configured.
- [ ] `WEBSITE_URL` matches your real domain (Better Auth origin check).
- [ ] GPS endpoint (`/api/geo` child report) is authenticated by `deviceToken`; parent view (`GET /api/geo`) requires a session.
- [ ] Rotate any secret that was ever pasted into chat, logs, or CI output.

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| `db:push` → `ENOTFOUND` / connection error | `DATABASE_URL` missing or typo'd | Check the key is exactly `DATABASE_URL` (not `DATASE_URL`) and the host resolves |
| All `/api/*` return `500` in dev | `hono-dev-plugin` can't find API entry | Fixed in-repo; ensure you're on the latest commit |
| SPA deep links 404 on refresh (production) | No SPA fallback | The provided `server.ts` already falls back to `index.html` |
| Mobile app can't reach API | `apiUrl` wrong / not hosted yet | Set `expo.extra.apiUrl` to your deployed domain |
| `bun run start` → file not found | Wrong `start` script path | Should be `bun src/api/server.ts` (already fixed) |
