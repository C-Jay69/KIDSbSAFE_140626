# 🛡️ KIDSbSAFE — Ethical Family Safety Platform

KIDSbSAFE is a professional-grade, ethical family safety ecosystem designed to protect minors from online grooming, predatory behavior, and digital hazards without resorting to covert surveillance. 

Unlike traditional "spyware," KIDSbSAFE operates on a principle of **Transparent Protection**, where the child is aware of the monitoring and the system only surfaces high-risk events to parents.

## 🚀 System Architecture

This project is managed as a **Turbo Monorepo**, separating the concerns of the API, the Parent/Web interface, and the Native Mobile experience.

### 📦 Repository Structure
- `packages/web`: 
    - **API**: High-performance backend powered by **Hono** and **Bun**.
    - **Database**: Persistent storage using **SQLite** and **Drizzle ORM**.
    - **Dashboard**: React + Vite web portal for parents.
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
- **Privacy First:** Only signals $\ge 70$ are surfaced to parents; benign conversations remain private.

### 3. Ethical Companion App
A visible app on the child's device that:
- Explains exactly what is being monitored.
- Provides a **Safe Browser** for highly filtered web access.
- Includes a **Cyber Safety Academy** to educate children on digital risks.
- Supports **Teen Privacy Rights** (Age 13+) with a formal opt-out/pause request flow.

---

## 🛠️ Deployment Guide

### 1. Backend & API Deployment
The backend is optimized for **Bun**.

**Environment Setup:**
Create a `.env` file in `packages/web`:
```env
PORT=3000
DATABASE_URL=file:./sqlite.db
GEMINI_API_KEY=your_google_gemini_key_here
JWT_SECRET=your_secure_random_secret
```

**Installation & Launch:**
```bash
bun install
bun run packages/web/src/api/server.ts
```

**Database Seeding:**
To populate the initial high-risk domain blacklist:
```bash
bun run packages/web/src/api/database/seed.ts
```

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
3. **Android Configuration:** Settings $\rightarrow$ Network $\rightarrow$ Private DNS $\rightarrow$ `dns.yourdomain.com`.
4. **iOS Configuration:** Install a DNS Profile via a Mobile Config file.

---

## 🎨 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime** | Bun |
| **Orchestration** | Turbo Repo |
| **API Framework** | Hono |
| **ORM** | Drizzle ORM |
| **Database** | SQLite / PostgreSQL |
| **Frontend** | React, Tailwind CSS, Vite |
| **Mobile** | Expo, React Native |
| **Desktop** | Electron |

## ⚖️ Ethical Framework
KIDSbSAFE is built to be **Legally Defensible**. 
- **No Keylogging:** We do not record keystrokes.
- **No Secret Screenshots:** We do not capture the screen covertly.
- **Consent-Driven:** Monitoring is visible and explainable to the child.
- **Compliance:** Designed to align with **COPPA** and **GDPR** guidelines.
