# KIDSbSAFE Build Task

## Status
- [x] app_init scaffold
- [x] Install deps (better-auth, autumn-js, expo-secure-store)
- [x] design.md
- [x] DB schema (families, children, alerts, geofences, gps_events)
- [x] db:push
- [x] Auth config (better-auth + autumn plugin)
- [x] Risk engine
- [x] Auth middleware
- [x] API routes: families, children, alerts, geofences
- [x] Main API index wired
- [x] Autumn config (free/$7/$11)
- [ ] Push autumn config (npx atmn push -y)
- [ ] Web auth lib (auth.ts, api.ts)
- [ ] Web pages: Landing, Sign-in, Sign-up, Dashboard, Pairing, Settings
- [ ] Web styles (glassmorphism, fonts)
- [ ] Mobile parent app screens
- [ ] Mobile child app (second variant)
- [ ] app.json updates
- [ ] bun run build check
- [ ] deliver

## Key Decisions
- Managed stack (Bun/Hono/Drizzle/SQLite/Turso)
- Both mobile apps use same Expo package with route-based separation
- Child app accessible via /child route in mobile
- Pricing: Free / Basic $7/mo / Premium $11/mo (USD)
- Brand: KIDSbSAFE
