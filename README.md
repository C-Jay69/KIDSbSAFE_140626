# 🛡️ KIDSbSAFE — Ethical Family Safety Platform

KIDSbSAFE is a professional-grade, ethical family safety ecosystem designed to protect minors from online grooming, predatory behavior, and digital hazards without resorting to covert surveillance.

Unlike traditional "spyware," KIDSbSAFE operates on a principle of **Transparent Protection**, where the child is aware of the monitoring and the system only surfaces high-risk events to parents.

## 🚀 System Architecture

This project is managed as a **Turbo Monorepo**, separating the concerns of the API, the Parent/Web interface, and the Native Mobile experience.

### 📦 Repository Structure
- `packages/web`:
    - **API**: High-performance backend powered by **Hono** and **Bun**.
    - **Database**: Persistent storage using **PostgreSQL** and **Drizzle ORM**.
    - **Dashboard**: React + Vite web portal for parents (incl. a dedicated Pricing page at `/pricing`).
- `packages/mobile`: **Expo / React Native** application for the child's device.
- `packages/desktop`: **Electron** wrapper for desktop-based management.

---

## ✨ Core Capabilities

### 1. Network Guard (System-Wide Monitoring)
The crown jewel of KIDSbSAFE. Instead of relying on a specific browser, Network Guard implements **DNS-level filtering**.
- **Cross-Browser:** Monitors Safari, Chrome, Firefox, and in-app browsers.
- **Domain Scoring:** Every DNS request is checked against a high-risk blacklist.
- **Instant Alerts:** Visits to predatory or dangerous domains trigger immediate parental notifications.

### 2. AI-Powered Risk Engine
A hybrid analysis system that scores communication and activity from 0-100.
- **Heuristic Matching:** Instant detection of grooming patterns (e.g., "keep this secret", "trade pics").
- **Contextual Analysis:** Factors in sender novelty and message frequency.
- **Privacy First:** Only signals ≥ 70 are surfaced to parents; benign conversations remain private.

### 3. Ethical Companion App
A visible app on the child's device that:
- Explains exactly what is being monitored.
- Provides a **Safe Browser** for highly filtered web access.
- Includes a **Cyber Safety Academy** to educate children on digital risks.
- Supports **Teen Privacy Rights** (Age 13+) with a formal opt-out/pause request flow.

### 4. GPS Map & Geofencing
The Parent Dashboard includes a live **GPS Map** tab (Leaflet) showing the last known location of each paired child device, plus geofence safe-zones that raise alerts when crossed.

---

## 🛠️ Deployment Guide

### 1. Backend & API Deployment
The backend is optimized for **Bun**.

**Environment Setup:**
Create a `.env` file in the project root (copy from `.env.template`):
```env
NODE_ENV=development
WEBSITE_URL=http://localhost:3000

# Better Auth
BETTER_AUTH_SECRET=<generate-with: openssl rand -hex 32>

# Database (PostgreSQL — Turso/SQLite removed)
DATABASE_URL=postgresql://user:password@localhost:5432/kidsbsafe

# Payments (Autumn billing)
AUTUMN_SECRET_KEY=<your-autumn-secret>

# Optional: AI gateway for enhanced analysis
AI_GATEWAY_BASE_URL=
AI_GATEWAY_API_KEY=
```

**Installation & Launch:**
```bash
bun install
bun run db:push      # create tables in your Postgres DB
bun run dev          # Vite dev server (web + Hono API on :5173)
```

**Database Seeding:**
To populate the initial high-risk domain blacklist:
```bash
bun run packages/web/src/api/database/seed.ts
```

**Demo Data (no real devices needed):**
Once signed in, open the Dashboard and click **"Load Demo Data"** to instantly create a sample family, two children (Emma & Liam), simulated GPS points, and sample risk alerts (including real grooming examples). The web demo is fully runnable with this mock data.

### 2. Mobile App Deployment (Expo)
The mobile app is built using **Expo**.

**Local Development:**
```bash
cd packages/mobile
bun install
bun x expo start
```

**Production Build:**
Use **EAS (Expo Application Services)** to build the `.apk` (Android) or `.ipa` (iOS):
```bash
eas build --platform android
eas build --platform ios
```

### 3. Activating Network Guard (DNS Setup)
To enable system-wide monitoring, the child's device must be pointed to the KIDSbSAFE DNS server.

**Production Requirements:**
1. Deploy the backend to a server with a public IP.
2. Set up a DNS proxy (e.g., using a DoH provider or a custom DNS server) that forwards requests to your `/api/dns/log` endpoint.
3. **Android Configuration:** Settings → Network → Private DNS → `dns.yourdomain.com`.
4. **iOS Configuration:** Install a DNS Profile via a Mobile Config file.

---

## 💳 Pricing & Billing

KIDSbSAFE uses **Autumn** for subscription management. Pricing is defined in `autumn.config.ts` and surfaced on the dedicated **`/pricing`** page (web).

| Plan | Price (USD) | Highlights |
| :--- | :--- | :--- |
| **Free** | $0 | 1 child, basic GPS alerts, 10 scans/month |
| **Basic** | $6.99/mo | Up to 3 children, full risk alerts, geofencing, 500 scans/month |
| **Premium** | $10.99/mo | Unlimited children, custom AI rules, trend analysis, unlimited scans |

- **Annual billing** discounted ~17% vs monthly.
- **Pay What You Can** — choose any amount from **$3/mo** if cost is a barrier.
- **Free/discounted** for verified single parents, teachers, and multi-kid families.
- All prices in **USD** (primary market: North America).

> Billing configuration lives in `autumn.config.ts`. To change prices, edit that file and re-sync with Autumn — the `/pricing` page reads plan data from Autumn at runtime.

---

## 🧷 Ethical Signup Gating

To stay true to the ethical mandate, account creation requires the parent/guardian to:
1. **Self-declare** they are a parent/legal guardian of minor children (required checkbox).
2. Select the **age range** of the child(ren) they're protecting.
3. Provide a short **reason** for using KIDSbSAFE.

This soft-friction gating deters non-parents without hard ID checks, and is enforced on the `/sign-up` page.

---

## 🎨 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Bun |
| **Orchestration** | Turbo Repo |
| **API Framework** | Hono |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL (via `postgres` driver) |
| **Auth** | Better Auth (Drizzle adapter, `pg` provider) |
| **Billing** | Autumn |
| **Frontend** | React, Tailwind CSS, Vite |
| **Mobile** | Expo, React Native |
| **Desktop** | Electron |

---

## ⚖️ Ethical Framework
KIDSbSAFE is built to be **Legally Defensible**.
- **No Keylogging:** We do not record keystrokes.
- **No Secret Screenshots:** We do not capture the screen covertly.
- **Consent-Driven:** Monitoring is visible and explainable to the child.
- **Compliance:** Designed to align with **COPPA** and **GDPR** guidelines.
