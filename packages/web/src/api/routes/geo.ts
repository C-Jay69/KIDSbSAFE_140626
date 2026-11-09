import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../database";
import { gpsEvents, children, families } from "../database/schema";
import { requireAuth, authMiddleware, type AppVariables } from "../middleware/auth";

// GET  /api/geo  -> latest GPS location for every child in the parent's family (parent view, auth required)
// POST /api/geo  -> child device reports its current location (auth via device_token)
const app = new Hono<{ Variables: AppVariables }>()
  .use(authMiddleware)
  // Parent view: latest location per child
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    try {
      const familyRows = await db
        .select()
        .from(families)
        .where(eq(families.parentUserId, user.id))
        .limit(1);
      if (familyRows.length === 0) return c.json({ locations: [] }, 200);

      const familyId = familyRows[0].id;
      const childRows = await db
        .select()
        .from(children)
        .where(eq(children.familyId, familyId));
      if (childRows.length === 0) return c.json({ locations: [] }, 200);

      // One indexed "latest row per child" query per child. The previous
      // version loaded the entire gps_events history and de-duplicated in
      // memory — O(rows ever written), which grows without bound.
      const latestRows = await Promise.all(
        childRows.map((ch) =>
          db
            .select()
            .from(gpsEvents)
            .where(eq(gpsEvents.childId, ch.id))
            .orderBy(desc(gpsEvents.recordedAt))
            .limit(1)
            .then((rows) => ({ child: ch, event: rows[0] }))
        )
      );

      const locations = latestRows
        .filter((r) => r.event)
        .map(({ child, event }) => ({
          childId: child.id,
          childName: child.name,
          lat: event!.lat,
          lng: event!.lng,
          accuracy: event!.accuracy ?? null,
          recordedAt: event!.recordedAt,
        }));

      return c.json({ locations }, 200);
    } catch (err) {
      // Surface the failure in logs; do not silently pretend there is no data.
      console.error("[geo] failed to load locations:", err);
      return c.json({ error: "Could not load locations" }, 500);
    }
  })
  // Child device reports its location
  .post("/", async (c) => {
    const body = await c.req.json<{
      deviceToken?: unknown;
      lat?: unknown;
      lng?: unknown;
      accuracy?: unknown;
    }>().catch(() => null);
    if (!body) return c.json({ error: "Invalid JSON body" }, 400);

    const { deviceToken, lat, lng, accuracy } = body;
    if (
      typeof deviceToken !== "string" || deviceToken.length === 0 ||
      typeof lat !== "number" || !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      typeof lng !== "number" || !Number.isFinite(lng) || lng < -180 || lng > 180
    ) {
      return c.json({ error: "deviceToken, valid lat and lng are required" }, 400);
    }

    try {
      const childRows = await db
        .select()
        .from(children)
        .where(eq(children.deviceToken, deviceToken))
        .limit(1);
      if (childRows.length === 0) return c.json({ error: "Unknown device" }, 401);

      const child = childRows[0];
      await db.insert(gpsEvents).values({
        id: randomUUID(),
        childId: child.id,
        lat,
        lng,
        accuracy: typeof accuracy === "number" && Number.isFinite(accuracy) ? accuracy : null,
        recordedAt: new Date(),
      });

      return c.json({ ok: true, childId: child.id }, 200);
    } catch (err) {
      console.error("[geo] failed to store location:", err);
      return c.json({ error: "Could not store location" }, 500);
    }
  });

export default app;
