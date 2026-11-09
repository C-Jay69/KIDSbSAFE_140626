# KIDSbSAFE — Step-by-Step How to Use

This guide takes you from a fresh checkout to a working parent dashboard and a
paired child device.

It covers:

1. [Run the platform locally](#part-1--run-the-platform-locally)
2. [Use the parent web dashboard](#part-2--parent-walkthrough-web)
3. [Pair and use the child device](#part-3--child-device-expo-app)
4. [Billing (optional)](#part-4--billing-optional)
5. [Production deployment](#part-5--production-deployment)
6. [Troubleshooting and reset](#part-6--troubleshooting)

> **Before you start:** KIDSbSAFE is a working prototype, not a finished
> consumer product. Read [`AUDIT.md`](./AUDIT.md) for what is and is not wired
> end-to-end. In particular: geofence alerts, message monitoring, and plan
> limits are not fully enforced yet.

---

## What you need

| Requirement | Notes |
| :--- | :--- |
| **Bun 1.3+** | `bun --version` |
| **PostgreSQL 14+** | Local install, Docker, or Supabase |
| **A terminal** | Commands below are run from the repo root unless stated |
| **Node 20+** (optional) | Only needed by some tooling; Bun runs the app |
| **Expo Go / a dev build** (optional) | To run the mobile app on a phone |

Check Bun:

```bash
bun --version
# 1.3.x
```

---

# Part 1 — Run the platform locally

## Step 1. Install dependencies

From the repository root:

```bash
bun install
```

Expected: Bun resolves the workspace and creates `node_modules`.

## Step 2. Start PostgreSQL

Use an existing server, or start a throwaway one with Docker:

```bash
docker run -d \
  --name kidsbsafe-pg \
  -e POSTGRES_USER=kidsbsafe \
  -e POSTGRES_PASSWORD=kidsbsafe \
  -e POSTGRES_DB=kidsbsafe \
  -p 5432:5432 \
  postgres:16
```

Your connection string will be:

```text
postgresql://kidsbsafe:kidsbsafe@localhost:5432/kidsbsafe
```

Verify it is accepting connections:

```bash
docker exec kidsbsafe-pg pg_isready -U kidsbsafe
# accepting connections
```

If you use **Supabase** or another pooler, use the full connection URI and set
`DATABASE_PREPARE=false` when the pooler is on port `6543` (pgbouncer).

## Step 3. Create your `.env`

```bash
cp .env.template .env
```

Open `.env` and fill in at least these three values:

```env
NODE_ENV=development
WEBSITE_URL=http://localhost:5173
DATABASE_URL=postgresql://kidsbsafe:kidsbsafe@localhost:5432/kidsbsafe
BETTER_AUTH_SECRET=<paste the output of the command below>
```

Generate the auth secret:

```bash
openssl rand -hex 32
```

Notes:

- **Use `http://localhost:5173` for local development.** The Vite dev server
  runs on `5173`. `WEBSITE_URL` feeds Better Auth's origin checks and the CORS
  allowlist; a mismatch produces "Invalid origin" errors.
- In production, `WEBSITE_URL` must be the real public HTTPS origin.
- Leave `AUTUMN_SECRET_KEY` blank until you want billing (Part 4).
- The server refuses to boot if `DATABASE_URL` is missing, with a clear error.

## Step 4. Create the database tables

```bash
bun run db:push
```

Expected: Drizzle reports the tables it created or confirms they are in sync.

> Use `db:push` for development. For versioned deployments, run
> `bun run db:generate` then `bun run db:migrate`. The checked-in
> `packages/web/drizzle/0000_*.sql` predates the latest schema changes, so
> regenerate before relying on `db:migrate` (see `AUDIT.md`).

Optional: inspect the database visually.

```bash
bun run db:studio
```

## Step 5. Seed the domain blocklist

The Safe Browser, DNS checks, and demo experience use a starter blocklist.

```bash
bun run packages/web/src/api/database/seed.ts
```

Expected output:

```text
🌱 Seeding Domain Blacklist...
✅ Domain Blacklist populated successfully.
```

This is idempotent (`onConflictDoNothing`) — safe to run again.

## Step 6. Start the app

```bash
bun run dev
```

Expected:

```text
VITE v7.x  ready in ... ms
➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173**.

In development there is **no separate API process**: the `hono-dev-plugin`
(`packages/web/vite/plugins/hono-dev-plugin.ts`) mounts the Hono app as Vite
middleware, so every request to `/api/*` is served by the same port. The
"KIDSbSAFE web server listening" line only appears when you run the production
server (`bun run start`).

## Step 7. Verify the API

Open a second terminal:

```bash
curl http://localhost:5173/api/health
```

Expected:

```json
{"status":"ok","service":"KIDSbSAFE"}
```

Check that protected routes are gated:

```bash
curl -i http://localhost:5173/api/alerts
# HTTP/1.1 401 Unauthorized
```

---

# Part 2 — Parent walkthrough (web)

## Step 1. Create an account

1. Open `http://localhost:5173`.
2. Click **Get Started Free**.
3. Fill in:
   - Full name
   - Email
   - Password (minimum 8 characters)
   - **Age range** of the child(ren) you are protecting
   - **Reason** for using KIDSbSAFE
   - Tick the declaration: *"I confirm I am a parent or legal guardian…"*
4. Click **Create Free Account**.

You are signed in and redirected to `/dashboard`.

> The ethical gating above exists on the **web** signup only. The mobile
> signup currently asks for name/email/password only — see `AUDIT.md`.
> There is no email-verification step in the current build.

## Step 2. Create a family — or load demo data

On first sign-in the dashboard shows **Create Your Family**.

Choose one:

### Option A — real family

Enter a family name (e.g. `The Smiths`) and click **Create**.

### Option B — demo data (fastest way to see everything)

Click **Load Demo Data**. This creates:

- Family: **The Demo Family**
- Children: **Emma (12)** and **Liam (14)**
- Two simulated GPS points
- Four sample alerts, including grooming examples

The demo button only appears while you have no family. Once a demo family
exists, creating a real family replaces it **only if no child has been paired**.

## Step 3. Tour the dashboard

The sidebar has three views:

| View | What it shows |
| :--- | :--- |
| **Dashboard** | Children count, active alerts, plan, children list, risk-alert feed |
| **Browsing History** | URLs checked by the child's Safe Browser; flagged domains highlighted |
| **GPS Map** | Latest location per paired child (Leaflet + OpenStreetMap) |

Alerts refresh every 30 seconds. Each alert shows:

- Risk score and label: **High** (70–79), **Critical** (≥ 80)
- Category: grooming, bullying, scam, predator, other
- Summary and timestamp
- **Dismiss** button

To review the demo alerts:

1. Click **Dashboard**.
2. Scroll to **Risk Alerts**.
3. Click **Dismiss** on any alert to remove it from the active feed.

## Step 4. Add a child and get a pairing code

1. Click **+ Add Child** (or **Pair Device** in the sidebar).
2. Enter the child's name and age (5–17).
3. Click **Add Child & Generate Code**.
4. A six-character code appears, e.g. `K7M2QP`.

Rules:

- The code is valid for **15 minutes**.
- Regenerate it any time from the child's **Pair Device** link on the dashboard.
- Enter it on the child device — see Part 3.

The code screen also shows the exact message the child will see about
monitoring. That text is part of the ethical design — do not hide it.

## Step 5. Review browsing history

1. Click **Browsing History**.
2. If you have multiple children, filter by child.
3. Flagged entries show a red **Blocked · score** badge and the reason.

If the list is empty, the child has not used the Safe Browser yet, or has not
been paired.

## Step 6. View GPS locations

1. Click **GPS Map**.
2. Locations arrive from the child app after pairing (foreground location only,
   at most every 30 seconds / 50 metres).
3. With no data, the map shows a demo pin and explains how to pair a device.

## Step 7. Manage your plan (optional)

Open **Settings** to see:

- Account name, email, current plan
- Risk-scan usage (when Autumn returns a balance)
- Available plans and upgrade/downgrade buttons

Billing is covered in [Part 4](#part-4--billing-optional).

---

# Part 3 — Child device (Expo app)

The mobile package contains **two modes in one app**:

- **Parent mode** — the default tabbed app (`app/(tabs)`).
- **Child mode** — pairing, GPS, Safe Browser, consent (`app/(child)`).

The child mode is visible and intentional. There is no hidden mode.

## Step 1. Point the app at your API

Open `packages/mobile/app.json` and set:

```json
"extra": {
  "apiUrl": "http://192.168.1.50:3000"
}
```

Use:

- your computer's **LAN IP** (not `localhost`) when testing on a physical phone;
- your **production HTTPS origin** for a real deployment;
- port **3000** if you run the production server, or Vite's **5173** if you run
  `bun run dev` with `--host`.

You can override at build time instead:

```bash
EXPO_PUBLIC_API_URL=https://your-domain.com bun x expo start
```

The app strips trailing slashes, so both `https://host` and `https://host/` work.

## Step 2. Start the app

```bash
cd packages/mobile
bun install          # only if you did not run it at the root
bun x expo start
```

Then:

- press `a` for an Android emulator,
- press `i` for the iOS simulator,
- or scan the QR code with **Expo Go** on a phone.

## Step 3. Open child mode

On the **parent** mobile app, the dashboard has a banner:

> 🧒 **Setting up a child's device?** — Tap here to enter a pairing code

Tap it to open the child setup screen. (You can also deep-link with the app
scheme `kidsbsafe://`.)

## Step 4. Pair the device

1. On the parent device (web or mobile), generate a 6-character code.
2. On the child device, open **Child Device Setup**.
3. Enter the code (letters are auto-uppercased; only A–Z and 0–9).
4. Tap **Connect Device**.

What happens internally:

1. The child app creates a random `deviceToken` and stores it in SecureStore.
2. It calls `POST /api/children/claim-pair` with the code + token.
3. The server atomically consumes the code, saves the token, and returns the
   child and family.
4. The app stores `child_id`, the token, the child's name, and the parent/family
   label locally.

Expected: the child home screen shows **Monitored by …** and a green/paired
state.

If pairing fails:

| Message | Fix |
| :--- | :--- |
| **Invalid pairing code** | Check the code; only 6 characters, no 0/O/1/I/L |
| **Pairing code expired** | Generate a new code (15-minute TTL) |
| **Too many attempts** | Wait a minute; claim attempts are rate-limited per IP |
| Network error | Check `extra.apiUrl` and that the phone can reach your computer |

## Step 5. Allow location (optional)

After pairing, the child app requests foreground location permission and starts
reporting:

- an immediate fix, then
- updates at most every 30 seconds or 50 metres.

Denying permission stops GPS reports; pairing and browsing still work.

## Step 6. Use the Safe Browser

1. From the child home, tap **Open Safe Browser**.
2. Type a domain or search term in the address bar.
3. Each navigation is checked:

- A fast local list blocks well-known adult/gambling domains immediately.
- The server also checks the URL (`POST /api/browse/check`), writes history,
  and creates a parent alert for high-risk results.

Known limits:

- The server check runs **after** the page starts loading, so the first load may
  briefly appear before the blocked overlay.
- Network failures **fail open** (the page is allowed). This is a deliberate
  availability choice, not a guarantee.

## Step 7. Network Guard (optional)

The child home links to **Network Guard**, which explains how to point the
device at a filtering DNS resolver:

- Android: Settings → Network → Private DNS
- iOS: install a DNS profile

This repo does **not** ship a DNS resolver. The screen is a setup guide; a
separate resolver must call `POST /api/dns/log` with `childId`, `deviceToken`,
and `domain`.

## Step 8. 13+ monitoring review request

On the child home:

1. Tap **I'm 13+ and want to request changes**.
2. Fill in name, age (must be 13+), and a reason (20+ characters).
3. Submit.

> This flow is currently **simulated**: it shows a success screen after a short
> delay but does not call an API or notify the parent. See `AUDIT.md`.

---

# Part 4 — Billing (optional)

Pricing is defined in `autumn.config.ts`:

| Plan | Price | Included risk scans |
| :--- | :--- | :--- |
| Free | $0 | 10/month |
| Basic | $6.99/month | 500/month |
| Premium | $10.99/month | 99,999/month |

To enable checkout:

1. Create an Autumn account and copy the secret key.
2. Add it to `.env`:

   ```env
   AUTUMN_SECRET_KEY=am_sk_...
   ```

3. Sync the plans:

   ```bash
   bunx atmn push -y
   ```

4. Restart the app.

Then:

- `/pricing` shows plan cards.
- **Start Basic / Go Premium** calls Autumn checkout.
- **Settings** lists plans and current subscription.

Current limitations:

- Scan usage is displayed but **not enforced** — the API does not reject scans
  after a plan limit.
- The **Annual** toggle and **Pay What You Can** slider are UI-only in this
  build; checkout still attaches the monthly plan.
- Without `AUTUMN_SECRET_KEY`, the pricing page still renders, but checkout and
  customer/subscription data will fail.

---

# Part 5 — Production deployment

## Option A — Bun directly

```bash
# with production env configured
cd packages/web
bun run build
bun run start
```

- `bun run build` type-checks the solution config (a no-op today) and builds
  the SPA into `packages/web/dist`.
- `bun run start` runs `src/api/server.ts`, serving API + SPA on `PORT`
  (default `3000`).

> From the **repository root**, `bun run start` uses PM2 and
> `ecosystem.config.cjs` instead, whose default port is **4200**. Set
> `PORT=3000` explicitly if you want the two entry points to agree.

Set at minimum:

```env
NODE_ENV=production
PORT=3000
WEBSITE_URL=https://your-domain.com
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=<random>
```

## Option B — Docker

```bash
docker build -t kidsbsafe .
docker run -d --name kidsbsafe \
  -p 3000:3000 \
  --env-file .env \
  kidsbsafe
```

## Option C — Docker Compose

```bash
docker compose up -d --build
docker compose logs -f web
```

## Post-deploy checks

```bash
curl https://your-domain.com/api/health
# {"status":"ok","service":"KIDSbSAFE"}

curl -o /dev/null -w "%{http_code}\n" https://your-domain.com/pricing
# 200

curl -i https://your-domain.com/api/alerts
# 401 Unauthorized
```

Set the mobile app's `expo.extra.apiUrl` to the deployed origin before building
with EAS:

```bash
cd packages/mobile
eas build --platform android
eas build --platform ios
```

---

## Part 6 — Troubleshooting

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| `DATABASE_URL is not set` | No `.env` or started from the wrong directory | Create `.env` at the repo root; run commands from root |
| `password authentication failed` | Wrong user/password/database in `DATABASE_URL` | Test with `psql "$DATABASE_URL"` |
| `db:push` hangs / pooler errors | Supabase transaction pooler + prepared statements | Set `DATABASE_PREPARE=false` |
| `Invalid origin` in auth | `WEBSITE_URL` does not match the browser origin | Dev: `http://localhost:5173`; prod: real HTTPS origin |
| Browser request blocked by CORS | Extra origin not allowlisted | Add it to `CORS_ORIGINS` (browser) or `TRUSTED_ORIGINS` (auth) |
| Vite build fails on `Landing.tsx` | Mismatched JSX tags | Pull latest code; the closing tag was fixed |
| `bun run build` passes but types are wrong | The web typecheck step is a no-op (solution config with `"files": []`) | Run `bunx tsc -p tsconfig.app.json --noEmit` and `-p tsconfig.node.json` explicitly |
| Mobile app shows network errors | `apiUrl` uses `localhost` or wrong port | Use the computer's LAN IP; set `extra.apiUrl`; restart Expo |
| GPS map stays empty | Child not paired, permission denied, or app backgrounded | Pair the device, grant location, keep the app open |
| Browsing history empty | Child has not used Safe Browser / not paired | Pair, then browse from the in-app Safe Browser |
| Pairing code always invalid | Code expired (15 min) or typo (0/O/1/I/L not used) | Generate a new code |
| Pricing checkout does nothing | Autumn key missing or plans not pushed | Set `AUTUMN_SECRET_KEY`, run `bunx atmn push -y`, restart |
| Demo data unavailable | A family already exists | The demo is only for accounts with no family |
| `db:migrate` does not add indexes | Checked-in migration predates schema | `bun run db:generate` then `db:migrate`, or use `db:push` |

### Reset local data

Stop the app, then (destructive):

```bash
psql "$DATABASE_URL" -c 'TRUNCATE browsing_history, dns_logs, gps_events, alerts, geofences, children, families, session, account, verification, "user" CASCADE;'
```

Then re-run `bun run packages/web/src/api/database/seed.ts`.

### Start over completely

```bash
rm -rf node_modules packages/*/node_modules
bun install
bun run db:push
bun run packages/web/src/api/database/seed.ts
bun run dev
```

---

## Quick reference: the happy path

```bash
# 1. setup
bun install
cp .env.template .env                 # fill DATABASE_URL + BETTER_AUTH_SECRET
bun run db:push
bun run packages/web/src/api/database/seed.ts
bun run dev                           # http://localhost:5173

# 2. web
# sign up → create family (or Load Demo Data) → Add Child → copy code

# 3. mobile
cd packages/mobile
bun x expo start
# parent app → dashboard banner → child mode → enter code → allow location

# 4. watch data arrive
# dashboard: Alerts / Browsing History / GPS Map
```
