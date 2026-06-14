import { Hono } from "hono";
import { db } from "../database";
import { families, children } from "../database/schema";
import { eq } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { randomUUID } from "crypto";

const PAIRING_CODE_TTL_MS = 15 * 60 * 1000; // 15 min

function generatePairingCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const app = new Hono()
  .use(authMiddleware)
  // Add child
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const { name, age } = await c.req.json<{ name: string; age: number }>();
    if (!name || !age) return c.json({ error: "Name and age required" }, 400);

    const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (familyRows.length === 0) return c.json({ error: "Create a family first" }, 400);

    const id = randomUUID();
    await db.insert(children).values({ id, familyId: familyRows[0].id, name, age });
    return c.json({ id, name, age }, 201);
  })
  // Generate pairing code for a child
  .post("/:id/pair", requireAuth, async (c) => {
    const user = c.get("user")!;
    const childId = c.req.param("id");

    const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (familyRows.length === 0) return c.json({ error: "No family found" }, 404);

    const childRows = await db.select().from(children).where(eq(children.id, childId));
    if (childRows.length === 0 || childRows[0].familyId !== familyRows[0].id) {
      return c.json({ error: "Child not found" }, 404);
    }

    const code = generatePairingCode();
    const expiresAt = new Date(Date.now() + PAIRING_CODE_TTL_MS);

    await db.update(children)
      .set({ pairingCode: code, pairingCodeExpiresAt: expiresAt })
      .where(eq(children.id, childId));

    return c.json({ pairingCode: code, expiresAt }, 200);
  })
  // Child device claims pairing code
  .post("/claim-pair", async (c) => {
    const { pairingCode, deviceToken } = await c.req.json<{ pairingCode: string; deviceToken: string }>();
    if (!pairingCode || !deviceToken) return c.json({ error: "pairingCode and deviceToken required" }, 400);

    const childRows = await db.select().from(children).where(eq(children.pairingCode, pairingCode));
    if (childRows.length === 0) return c.json({ error: "Invalid pairing code" }, 404);

    const child = childRows[0];
    if (child.pairingCodeExpiresAt && child.pairingCodeExpiresAt < new Date()) {
      return c.json({ error: "Pairing code expired" }, 410);
    }

    await db.update(children)
      .set({ deviceToken, pairedAt: new Date(), pairingCode: null, pairingCodeExpiresAt: null })
      .where(eq(children.id, child.id));

    const familyRows = await db.select().from(families).where(eq(families.id, child.familyId));
    const family = familyRows[0];

    return c.json({
      success: true,
      child: { name: child.name, id: child.id },
      family: { parentName: family?.name ?? "Your Parent", id: child.familyId },
    }, 200);
  });

export default app;
