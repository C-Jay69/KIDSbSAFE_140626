import { Hono } from "hono";
import { db } from "../database";
import { geofences, families } from "../database/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { randomUUID } from "crypto";

const app = new Hono()
  .use(authMiddleware)
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (familyRows.length === 0) return c.json({ geofences: [] }, 200);

    const rows = await db.select().from(geofences).where(eq(geofences.familyId, familyRows[0].id));
    return c.json({ geofences: rows }, 200);
  })
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const { name, lat, lng, radiusMeters, childId } = await c.req.json<{
      name: string; lat: number; lng: number; radiusMeters?: number; childId?: string;
    }>();

    const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (familyRows.length === 0) return c.json({ error: "No family found" }, 404);

    const id = randomUUID();
    await db.insert(geofences).values({
      id,
      familyId: familyRows[0].id,
      childId: childId ?? null,
      name,
      lat,
      lng,
      radiusMeters: radiusMeters ?? 200,
    });

    return c.json({ id, name, lat, lng }, 201);
  })
  .delete("/:id", requireAuth, async (c) => {
    const user = c.get("user")!;
    const geoId = c.req.param("id");
    const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (familyRows.length === 0) return c.json({ error: "Not found" }, 404);

    await db.delete(geofences)
      .where(and(eq(geofences.id, geoId), eq(geofences.familyId, familyRows[0].id)));

    return c.json({ success: true }, 200);
  });

export default app;
