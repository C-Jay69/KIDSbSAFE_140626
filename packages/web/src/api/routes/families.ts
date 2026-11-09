import { Hono } from "hono";
import { asc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../database";
import {
  families,
  children,
  alerts,
  geofences,
  dnsLogs,
  gpsEvents,
  browsingHistory,
} from "../database/schema";
import { requireAuth, authMiddleware, type AppVariables } from "../middleware/auth";

/**
 * A parent has exactly one family. Every other route assumes `familyRows[0]`
 * is that family, so we order deterministically and rely on the unique index
 * on families.parent_user_id added in the schema.
 */
async function getFamilyForUser(userId: string) {
  const rows = await db
    .select()
    .from(families)
    .where(eq(families.parentUserId, userId))
    .orderBy(asc(families.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Remove the demo family created by POST /demo when the parent is ready to
 * create their real family. Only untouched demo data is removable: if any
 * child has been paired, the family is treated as real and the request is
 * rejected instead.
 */
async function removeUntouchedDemoFamily(familyId: string): Promise<boolean> {
  const kids = await db
    .select({ id: children.id, pairedAt: children.pairedAt })
    .from(children)
    .where(eq(children.familyId, familyId));

  if (kids.length === 0 || kids.some((kid) => kid.pairedAt)) return false;

  for (const kid of kids) {
    await db.delete(alerts).where(eq(alerts.childId, kid.id));
    await db.delete(dnsLogs).where(eq(dnsLogs.childId, kid.id));
    await db.delete(gpsEvents).where(eq(gpsEvents.childId, kid.id));
    await db.delete(browsingHistory).where(eq(browsingHistory.childId, kid.id));
  }
  // Geofences may be family-wide (childId null), so clear them by family.
  await db.delete(geofences).where(eq(geofences.familyId, familyId));
  await db.delete(browsingHistory).where(eq(browsingHistory.familyId, familyId));
  await db.delete(children).where(eq(children.familyId, familyId));
  await db.delete(families).where(eq(families.id, familyId));
  return true;
}

const app = new Hono<{ Variables: AppVariables }>()
  .use(authMiddleware)
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json<{ name?: unknown }>().catch(() => null);
    if (!body) return c.json({ error: "Invalid JSON body" }, 400);

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return c.json({ error: "Family name required" }, 400);
    if (name.length > 100) return c.json({ error: "Family name too long" }, 400);

    try {
      const existing = await getFamilyForUser(user.id);
      if (existing) {
        const isDemo = existing.name === "The Demo Family";
        if (!isDemo || !(await removeUntouchedDemoFamily(existing.id))) {
          return c.json({ error: "Family already exists" }, 409);
        }
      }

      const id = randomUUID();
      await db.insert(families).values({ id, name, parentUserId: user.id });
      return c.json({ id, name, parentUserId: user.id }, 201);
    } catch (err) {
      // Unique violation: two concurrent requests both passed the existence
      // check. The database is the source of truth.
      if ((err as { code?: string }).code === "23505") {
        return c.json({ error: "Family already exists" }, 409);
      }
      throw err;
    }
  })
  .get("/me", requireAuth, async (c) => {
    const user = c.get("user")!;
    const family = await getFamilyForUser(user.id);
    if (!family) return c.json({ family: null, children: [] }, 200);

    // Never return deviceToken / pairingCode: those are bearer credentials.
    const childRows = await db
      .select({
        id: children.id,
        familyId: children.familyId,
        name: children.name,
        age: children.age,
        pairedAt: children.pairedAt,
        createdAt: children.createdAt,
      })
      .from(children)
      .where(eq(children.familyId, family.id));

    return c.json({ family, children: childRows }, 200);
  });

export default app;
