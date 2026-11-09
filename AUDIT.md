# KIDSbSAFE — Repository Audit

**Audit date:** 2026-11-08
**Scope:** entire repository (`packages/web`, `packages/mobile`, `packages/desktop`,
build/deploy config, docs)
**Method:** source review of every API route, page, mobile screen, schema, and
config file; `bun install`; production build; explicit TypeScript project checks;
mobile typecheck; lint. The server was **not** started end-to-end because no
database was configured in the audit environment. Findings are therefore
**code-verified**, not runtime-verified, unless stated otherwise.

This document separates:

- [What was verified](#what-was-verified) — commands and results
- [Open findings](#open-findings) — ordered by risk
- [Already hardened](#already-hardened-in-the-working-tree) — controls present
- [Recommended order of work](#recommended-order-of-work)

---

## What was verified

| Check | Command | Result |
| :--- | :--- | :--- |
| Dependency install | `bun install --frozen-lockfile` | ✅ exit 0 |
| Production build | `cd packages/web && bun run build` | ✅ succeeds **after** fixing a JSX mismatch (see F-01) |
| Web solution typecheck | `bun run typecheck` (web/turbo) | ⚠️ exits 0 but the web step checks **nothing** (see F-02) |
| Web app project typecheck | `bunx tsc -p tsconfig.app.json --noEmit` | ✅ 0 errors |
| Web API project typecheck | `bunx tsc -p tsconfig.node.json --noEmit` | ✅ 0 errors (covers `server.ts` → `index.ts` → routes) |
| Mobile typecheck | `cd packages/mobile && bun run typecheck` | ✅ 0 errors |
| Lint | `bun run lint` | ❌ non-zero (a11y labels, hook deps, unused vars) |
| Tests | — | ❌ no test files or test runner |
| Docker build | — | ⚠️ not run in this environment |

> Type errors were present earlier in the audit (37 in `tsconfig.app.json`, 29
> in mobile) and were corrected in the working tree before this report was
> finalized. F-02 still stands: the guard that should have caught them does not
> exist.

The web SPA builds to `packages/web/dist` (368.6 kB JS / 111.4 kB gzip).

---

## Open findings

Severity: **Critical** = blocks safe operation; **High** = security or legal
exposure; **Medium** = broken promise/feature gap; **Low** = hygiene.

### F-01 — Build-blocking JSX mismatch in `Landing.tsx` (Fixed during audit)

- **Severity:** Critical (was)
- **Evidence:** `packages/web/src/web/pages/Landing.tsx:170` closed a
  `<section>` while the open element was the grid `<div>`; esbuild reported four
  cascading errors and **no** production build was possible.
- **Impact:** `bun run build`, `docker build`, and the first page load in dev
  all failed.
- **Status:** ✅ Fixed in the working tree (`</div>` then `</section>`). Build
  now passes.
- **Follow-up:** add a CI step that runs `vite build` on every PR so a syntax
  regression cannot merge again.

### F-02 — `tsc --noEmit` is a no-op in the web package (High)

- **Severity:** High (engineering safety)
- **Evidence:** `packages/web/package.json:9,12` runs plain `tsc --noEmit`.
  `packages/web/tsconfig.json:2` is a solution-style config with
  `"files": []` and project references. Plain `tsc --noEmit` does not build
  references, so it compiles zero files.
- **Proof:** the production build succeeded — and `bun run typecheck` exited 0 —
  while `Landing.tsx` had invalid JSX, a file TypeScript would have rejected.
  Only `tsc -p tsconfig.app.json` (which includes `src/web` only) and
  `tsc -p tsconfig.node.json` (which includes `vite.config.ts` and
  `src/api/server.ts`, and follows imports through the API) actually check code.
- **Current state:** both project configs report **0 errors**, so nothing is
  broken today — but the guard is missing.
- **Impact:** `bun run build` and `bun run typecheck` give false confidence; a
  future type regression will merge silently.
- **Fix:** use `tsc -b --noEmit` (or run each project explicitly:
  `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit`),
  and make CI run it.

### F-03 — Hono context variables were untyped (Fixed in the working tree)

- **Severity:** Medium (was)
- **Evidence:** the app was created as `new Hono()` with no `Variables`
  generic, so `c.get("user")` resolved to `never`/`{}` and every route that
  read the session failed to typecheck.
- **Status:** ✅ Fixed in the audited tree. `middleware/auth.ts` exports
  `AppVariables = { user: User | null; session: Session | null }`,
  `createMiddleware<{ Variables: AppVariables }>` is used for
  `authMiddleware`/`requireAuth`, and each route uses
  `new Hono<{ Variables: AppVariables }>()`.
- **Follow-up:** keep the generic when adding routes; consider augmenting
  `ContextVariableMap` globally so the generic cannot be forgotten.

### F-04 — Database migrations are behind the schema (High)

- **Severity:** High (deployment integrity)
- **Evidence:** `packages/web/src/api/database/schema.ts` now declares
  `uniqueIndex` on `families.parent_user_id`, `children.pairing_code`,
  `children.device_token`, plus performance indexes on alerts, GPS, DNS, and
  browsing history. The only migration,
  `packages/web/drizzle/0000_wandering_firebrand.sql`, predates all of them.
- **Impact:** `bun run db:push` creates the constraints, but a deployment that
  uses `bun run db:migrate` will run without them. The pairing/device-token
  uniqueness assumptions in the routes then become client-side checks only.
- **Fix:** run `bun run db:generate`, review the new `0001_*.sql`, and commit it
  with the snapshot/journal. Treat `db:push` as a development-only shortcut.

### F-05 — Ethical signup gating exists only on web (High — product/legal)

- **Severity:** High (contradicts the stated ethical mandate)
- **Evidence:** `packages/web/src/web/pages/SignUp.tsx` requires the parent
  declaration, child age range, and reason. `packages/mobile/app/(auth)/sign-up.tsx`
  sends only `{ name, email, password }` to `authClient.signUp.email`.
- **Impact:** anyone can create a parent account from the mobile app without
  the declaration the product and legal pages promise.
- **Fix:** extract the gating fields into a shared onboarding step and enforce
  them server-side on the user-create hook, so no client can skip them.

### F-06 — No email verification (Medium — spec/COPPA)

- **Severity:** Medium
- **Evidence:** `packages/web/src/api/auth.ts:69` enables
  `emailAndPassword` only. There is no verification sender,
  `requireEmailVerification`, or verified-email gate on protected routes.
- **Impact:** the original task requires "dashboard access only after
  verification email"; disposable/unowned addresses work.
- **Fix:** add a transactional email provider, `emailVerification` config, and
  gate family creation until `user.emailVerified`.

### F-07 — Geofencing is backend-only (Medium — feature claim)

- **Severity:** Medium
- **Evidence:** `packages/web/src/api/routes/geofences.ts` implements
  list/create/delete with good validation and ownership checks. There is **no**
  geofence UI in `packages/web/src/web` or `packages/mobile/app`, and
  `routes/geo.ts` writes GPS points without checking any fence.
- **Impact:** landing/README claims about "geofence alerts" are not delivered.
- **Fix:** add a fence editor on the GPS tab and evaluate each incoming GPS
  point against the child's/family's fences (haversine + hysteresis), creating
  an alert on transition.

### F-08 — Billing plans are displayed but not enforced (Medium)

- **Severity:** Medium (revenue/feature integrity)
- **Evidence:** `autumn.config.ts` defines `scans` (10 / 500 / 99,999) and the
  three plans. `Settings.tsx` reads a balance, but no API route checks or
  consumes the `scans` feature. Child-count limits (1 / 3 / unlimited) exist
  only in marketing copy.
- **Impact:** free accounts can create unlimited children and scans; paid plans
  have no functional difference.
- **Fix:** call Autumn's usage/entitlement API in `POST /api/alerts/risk-scan`
  (and optionally browse checks), enforce child limits in
  `POST /api/children`, return `402`/`429` with an upgrade message.
- **Also:** the annual toggle and "Pay What You Can" slider on `/pricing` are
  presentation-only; checkout attaches the monthly Autumn plan.

### F-09 — Message monitoring is not wired end-to-end (Medium — core value)

- **Severity:** Medium
- **Evidence:** `POST /api/alerts/risk-scan` is a solid, authenticated endpoint
  (device token, length cap, rate limit) and the risk engine is implemented.
  No web or mobile code calls it. All visible message-based alerts come from
  `POST /api/demo`.
- **Impact:** the headline "AI grooming detection" is a working API plus demo
  data, not a live child-app capability.
- **Fix:** define ingestion (notification listener / screenshot OCR / platform
  APIs) and call `risk-scan` from the child app; until then, describe the
  feature as a demo.

### F-10 — 13+ consent review request is simulated (Medium — ethics)

- **Severity:** Medium
- **Evidence:** `packages/mobile/app/(child)/consent.tsx:21-23` explicitly
  comments that no API call is made; it waits 1.2 seconds and shows success.
- **Impact:** a child is told "your request has been sent to your parent" when
  nothing was sent. This is the most ethically sensitive gap in the app.
- **Fix:** add a `monitoring_requests` table and parent notification, or change
  the copy to "coming soon" until the flow is real.

### F-11 — Legal copy does not match the implementation (Medium — legal)

- **Severity:** Medium
- **Evidence:** `packages/web/src/web/pages/Legal.tsx` states:
  - payments are billed via **Stripe** (the platform uses **Autumn**);
  - parents verify ownership via "shared family accounts or **photo proof**"
    (no such flow exists);
  - data is "encrypted at rest" (that depends entirely on the database host);
  - alert logs are retained for 90 days (no retention job exists);
  - a cookie consent banner exists (none is implemented).
- **Impact:** consumer-protection / privacy-policy exposure; COPPA/GDPR claims
  should be reviewed by counsel against actual behaviour.
- **Fix:** make the legal text match shipped behaviour, or implement the
  missing controls before launch. Also disclose or remove the third-party
  analytics loaded on the web app: `packages/web/public/runable.js` posts to
  `https://collector.onedollarstats.com`. The policy currently names only
  "payment and security providers".

### F-12 — Desktop package is an incomplete scaffold (Low)

- **Severity:** Low
- **Evidence:** `packages/desktop/electron/main.ts` loads `../web-dist/index.html`
  in production, but no build step produces `packages/desktop/web-dist`.
  There is no renderer entry; `vite.config.ts` builds `electron/no-renderer.ts`.
  Dev loads `WEBSITE_URL` (default `http://localhost:3000`), not Vite's 5173.
- **Impact:** `bun run dev:desktop` and packaged builds do not show the dashboard
  reliably.
- **Fix:** copy `packages/web/dist` into the Electron resources at build time
  and load it, or have the shell load the hosted URL.

### F-13 — Stale template metadata (Low)

- **Severity:** Low (confusion)
- **Evidence:** `packages/web/website.config.json` is still
  `"name": "Runable"`, `"url": "https://example.com"`, `"port": 8080`;
  `packages/web/README.md` is a three-line template stub.
- **Fix:** delete both or replace with KIDSbSAFE metadata.

### F-14 — Lint and tests are not green (Medium — quality gate)

- **Severity:** Medium
- **Evidence:** `bun run lint` exits 1 with **33** errors:
  - `jsx-a11y` — 10 `control-has-associated-label` and 9
    `label-has-associated-control` in `SignIn.tsx`, `SignUp.tsx`, `Pair.tsx`,
    `Pricing.tsx`;
  - `eslint/no-unused-vars` — 6 across mobile `(child)/browser.tsx`,
    `(child)/consent.tsx`, `(tabs)/children.tsx`, web `Dashboard.tsx`,
    `Pair.tsx`;
  - `react-hooks/exhaustive-deps` — `GpsMap.tsx` and mobile `_layout.tsx`;
  - `jsx-a11y` click handler on a static element in `Dashboard.tsx:134`
    (`no-static-element-interactions`, `click-events-have-key-events`);
  - 4 `no-unused-expressions` in generated
    `packages/desktop/dist-electron/main.js` (should be lint-ignored).
  There are no `*.test.*` / `*.spec.*` files and no test script.
- **Impact:** accessibility defects (screen readers cannot associate labels),
  and no regression safety for auth/pairing/risk scoring.
- **Fix:** add `htmlFor`/`id` pairs, fix or intentionally suppress hook deps,
  add `dist-electron`/`dist` to lint ignores, and add tests for
  `risk-engine.ts`, pairing, and device-token auth.

### F-15 — Port defaults disagree (Low)

- **Severity:** Low (deployment confusion)
- **Evidence:** `ecosystem.config.cjs` defaults PM2 to **4200** and forces
  `NODE_ENV=production`; `packages/web/src/api/server.ts` defaults to **3000**;
  `.env.template` sets `WEBSITE_URL=http://localhost:3000` while dev runs on
  **5173**.
- **Impact:** `bun run start` listens on 4200, but docs/health checks assume
  3000; a copied template points auth at the wrong origin in dev.
- **Fix:** pick one production port (3000) and document the dev override
  explicitly.

### F-16 — Residual security notes (Low / by design)

- **Bearer token in `localStorage`** (`packages/web/src/web/lib/auth.ts`): any
  XSS can exfiltrate the session. Consider httpOnly cookies with CSRF
  protection, or short-lived tokens.
- **In-process rate limiter** (`packages/web/src/api/lib/rate-limit.ts`): state
  is per Bun instance and resets on restart. Fine for one instance; use Redis
  before scaling horizontally.
- **DNS endpoint trust model:** `/api/dns/log` authenticates the device, but a
  DNS resolver must hold device tokens. Document that operational assumption.
- **No audit trail** of parent access to child location/history. Consider an
  append-only access log if the product matures.

---

## Already hardened in the working tree

These controls are present in the current code (verified by reading the files).
They were added in the same working-tree state the audit reviewed; keep them
when refactoring:

| Control | Where |
| :--- | :--- |
| Device writes require `childId` **and** `deviceToken` | `middleware/auth.ts` → `findChildForDevice`; used by geo, browse, DNS, risk-scan |
| Rate limits on pairing, scans, browsing, DNS | `lib/rate-limit.ts` |
| Crypto-random 6-char pairing codes; 15-minute TTL; atomic claim | `routes/children.ts` |
| Device token generated with Web Crypto (fallback documented) | `packages/mobile/app/(child)/pair.tsx` |
| CORS allowlist instead of reflecting any Origin | `api/index.ts` |
| Better Auth trusted-origin allowlist | `api/auth.ts` |
| Path traversal + duplicate-slash handling; security headers | `api/server.ts` |
| Unique DB indexes for family/user, pairing code, device token | `database/schema.ts` |
| Demo data cannot overwrite a real family | `routes/demo.ts`, `routes/families.ts` |
| Input validation/length caps on URL, domain, message, GPS, geofences | route files |
| Typed Hono context (`AppVariables`) so `c.get("user")` is checked | `middleware/auth.ts`, `routes/*.ts` |
| Child app explains monitoring; no stealth mode | `packages/mobile/app/(child)/*` |

---

## Recommended order of work

1. **Make CI honest** — fix F-02 (`tsc -b --noEmit`), run `vite build` and
   `oxlint` in CI; do not merge on red.
2. **Ship the schema correctly** — regenerate migrations (F-04) and run
   `db:migrate` against a staging database.
3. **Close the ethics gap** — server-enforced signup gating (F-05) and either
   implement or relabel the 13+ request flow (F-10).
4. **Make legal text true** — F-11, before any public launch.
5. **Finish one core loop end-to-end** — either geofence evaluation (F-07) or
   message ingestion (F-09); do not claim both until they work.
6. **Enforce plans** (F-08) if billing is going live.
7. **Quality** — accessibility fixes, tests for risk engine + pairing + auth,
   then desktop and template cleanup.

---

## How to re-run this audit

```bash
bun install --frozen-lockfile

# Build must pass
cd packages/web && bun run build

# These currently pass, but only when pointed at a project config —
# plain `tsc --noEmit` in packages/web checks nothing (F-02)
cd packages/web && bunx tsc -p tsconfig.app.json --noEmit
cd packages/web && bunx tsc -p tsconfig.node.json --noEmit
cd packages/mobile && bun run typecheck

# Lint currently exits non-zero — see F-14
cd /path/to/repo && bun run lint
```
