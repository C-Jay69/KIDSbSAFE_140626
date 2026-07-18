import { Hono } from "hono";
import { db } from "../database";
import { gpsEvents, children, families } from "../database/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { randomUUID } from "crypto";

// GET  /api/geo  -> latest GPS location for every child in the parent's family (parent view, auth required)
// POST /api/geo  -> child device reports its current location (auth via device_token)
const app = new Hono()
  .use(authMiddleware)
  // Parent view: latest location per child
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    try {
      const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
      if (familyRows.length === 0) return c.json({ locations: [] }, 200);

      const familyId = familyRows[0].id;
      const childRows = await db.select().from(children).where(eq(children.familyId, familyId));
      if (childRows.length === 0) return c.json({ locations: [] }, 200);

      const childIds = childRows.map((ch) => ch.id);
      const nameById = new Map(childRows.map((ch) => [ch.id, ch.name]));

      const rows = await db
        .select()
        .from(gpsEvents)
        .where(inArray(gpsEvents.childId, childIds))
        .orderBy(desc(gpsEvents.recordedAt));

      const latestByChild = new Map<string, any>();
      for (const r of rows) {
        if (!latestByChild.has(r.childId)) latestByChild.set(r.childId, r);
      }

      const locations = [...latestByChild.values()].map((r: any) => ({
        childId: r.childId,
        childName: nameById.get(r.childId) ?? "Child",
        lat: r.lat,
        lng: r.lng,
        accuracy: r.accuracy ?? null,
        recordedAt: r.recordedAt,
      }));
      return c.json({ locations }, 200);
    } catch {
      return c.json({ locations: [] }, 200);
    }
  })
  // Child device reports its location
  .post("/", async (c) => {
    const { deviceToken, lat, lng, accuracy } = await c.req.json<{
      deviceToken: string;
      lat: number;
      lng: number;
      accuracy?: number;
    }>();

    if (!deviceToken || typeof lat !== "number" || typeof lng !== "number") {
      return c.json({ error: "deviceToken, lat and lng are required" }, 400);
    }

    try {
      const childRows = await db.select().from(children).where(eq(children.deviceToken, deviceToken));
      if (childRows.length === 0) return c.json({ error: "Unknown device" }, 401);

      const child = childRows[0];
      await db.insert(gpsEvents).values({
        id: randomUUID(),
        childId: child.id,
        lat,
        lng,
        accuracy: accuracy ?? null,
        recordedAt: new Date(),
      });

      return c.json({ ok: true, childId: child.id }, 200);
    } catch (err) {
      return c.json({ error: String(err) }, 500);
    }
  });

export default app;
