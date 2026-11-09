import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../database";
import { geofences, families, children } from "../database/schema";
import { requireAuth, authMiddleware, type AppVariables } from "../middleware/auth";

const MAX_RADIUS_METERS = 50_000;

const app = new Hono<{ Variables: AppVariables }>()
  .use(authMiddleware)
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const familyRows = await db
      .select()
      .from(families)
      .where(eq(families.parentUserId, user.id))
      .limit(1);
    if (familyRows.length === 0) return c.json({ geofences: [] }, 200);

    const rows = await db
      .select()
      .from(geofences)
      .where(eq(geofences.familyId, familyRows[0].id));
    return c.json({ geofences: rows }, 200);
  })
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json<{
      name?: unknown;
      lat?: unknown;
      lng?: unknown;
      radiusMeters?: unknown;
      childId?: unknown;
    }>().catch(() => null);
    if (!body) return c.json({ error: "Invalid JSON body" }, 400);

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const { lat, lng } = body;
    const radiusMeters = body.radiusMeters;
    const childId = typeof body.childId === "string" && body.childId ? body.childId : null;

    if (!name || name.length > 100) {
      return c.json({ error: "Valid name required" }, 400);
    }
    if (
      typeof lat !== "number" || !Number.isFinite(lat) || lat < -90 || lat > 90 ||
      typeof lng !== "number" || !Number.isFinite(lng) || lng < -180 || lng > 180
    ) {
      return c.json({ error: "Valid lat and lng required" }, 400);
    }
    if (
      radiusMeters !== undefined &&
      (typeof radiusMeters !== "number" || !Number.isFinite(radiusMeters) ||
        radiusMeters <= 0 || radiusMeters > MAX_RADIUS_METERS)
    ) {
      return c.json({ error: `radiusMeters must be between 1 and ${MAX_RADIUS_METERS}` }, 400);
    }

    const familyRows = await db
      .select()
      .from(families)
      .where(eq(families.parentUserId, user.id))
      .limit(1);
    if (familyRows.length === 0) return c.json({ error: "No family found" }, 404);

    const familyId = familyRows[0].id;

    // A geofence may only reference a child in the caller's own family.
    if (childId) {
      const owned = await db
        .select({ id: children.id })
        .from(children)
        .where(and(eq(children.id, childId), eq(children.familyId, familyId)))
        .limit(1);
      if (owned.length === 0) return c.json({ error: "Child not found" }, 404);
    }

    const id = randomUUID();
    await db.insert(geofences).values({
      id,
      familyId,
      childId,
      name,
      lat,
      lng,
      radiusMeters: typeof radiusMeters === "number" ? Math.round(radiusMeters) : 200,
    });

    return c.json({ id, name, lat, lng }, 201);
  })
  .delete("/:id", requireAuth, async (c) => {
    const user = c.get("user")!;
    const geoId = c.req.param("id");
    const familyRows = await db
      .select()
      .from(families)
      .where(eq(families.parentUserId, user.id))
      .limit(1);
    if (familyRows.length === 0) return c.json({ error: "Not found" }, 404);

    await db.delete(geofences)
      .where(and(eq(geofences.id, geoId), eq(geofences.familyId, familyRows[0].id)));

    return c.json({ success: true }, 200);
  });

export default app;
