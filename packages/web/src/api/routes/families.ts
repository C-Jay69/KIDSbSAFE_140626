import { Hono } from "hono";
import { db } from "../database";
import { families, children } from "../database/schema";
import { eq } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { randomUUID } from "crypto";

const app = new Hono()
  .use(authMiddleware)
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const { name } = await c.req.json<{ name: string }>();
    if (!name) return c.json({ error: "Family name required" }, 400);

    // Check if family exists for this user
    const existing = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (existing.length > 0) return c.json({ error: "Family already exists" }, 409);

    const id = randomUUID();
    await db.insert(families).values({ id, name, parentUserId: user.id });
    return c.json({ id, name, parentUserId: user.id }, 201);
  })
  .get("/me", requireAuth, async (c) => {
    const user = c.get("user")!;
    const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (familyRows.length === 0) return c.json({ family: null, children: [] }, 200);

    const family = familyRows[0];
    const childRows = await db.select().from(children).where(eq(children.familyId, family.id));
    return c.json({ family, children: childRows }, 200);
  });

export default app;
