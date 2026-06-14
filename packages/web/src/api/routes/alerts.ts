import { Hono } from "hono";
import { db } from "../database";
import { alerts, families, children } from "../database/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { scoreMessage } from "../lib/risk-engine";
import { randomUUID } from "crypto";

const app = new Hono()
  .use(authMiddleware)
  // List alerts for the family
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (familyRows.length === 0) return c.json({ alerts: [] }, 200);

    const alertRows = await db
      .select()
      .from(alerts)
      .where(and(eq(alerts.familyId, familyRows[0].id), eq(alerts.dismissed, false)))
      .orderBy(desc(alerts.createdAt));

    return c.json({ alerts: alertRows }, 200);
  })
  // Dismiss alert
  .post("/:id/dismiss", requireAuth, async (c) => {
    const user = c.get("user")!;
    const alertId = c.req.param("id");
    const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (familyRows.length === 0) return c.json({ error: "Not found" }, 404);

    await db.update(alerts)
      .set({ dismissed: true })
      .where(and(eq(alerts.id, alertId), eq(alerts.familyId, familyRows[0].id)));

    return c.json({ success: true }, 200);
  })
  // Risk scan endpoint — submitted from child device
  .post("/risk-scan", async (c) => {
    const { childId, message, isUnknownContact, messageCount } = await c.req.json<{
      childId: string;
      message: string;
      isUnknownContact?: boolean;
      messageCount?: number;
    }>();

    if (!childId || !message) return c.json({ error: "childId and message required" }, 400);

    const childRows = await db.select().from(children).where(eq(children.id, childId));
    if (childRows.length === 0) return c.json({ error: "Child not found" }, 404);

    const result = scoreMessage({ message, isUnknownContact, messageCount });

    if (result.score >= 70) {
      const id = randomUUID();
      await db.insert(alerts).values({
        id,
        childId,
        familyId: childRows[0].familyId,
        riskScore: result.score,
        summary: result.summary,
        category: result.category,
      });
      return c.json({ score: result.score, alerted: true, alertId: id }, 200);
    }

    return c.json({ score: result.score, alerted: false }, 200);
  });

export default app;
