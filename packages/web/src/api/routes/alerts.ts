import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../database";
import { alerts, families } from "../database/schema";
import { requireAuth, authMiddleware, findChildForDevice, type AppVariables } from "../middleware/auth";
import { rateLimit } from "../lib/rate-limit";
import { scoreMessage } from "../lib/risk-engine";

const MAX_MESSAGE_LENGTH = 10_000;

const app = new Hono<{ Variables: AppVariables }>()
  .use(authMiddleware)
  // List alerts for the family
  .get("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const familyRows = await db
      .select()
      .from(families)
      .where(eq(families.parentUserId, user.id))
      .limit(1);
    if (familyRows.length === 0) return c.json({ alerts: [] }, 200);

    const alertRows = await db
      .select()
      .from(alerts)
      .where(and(eq(alerts.familyId, familyRows[0].id), eq(alerts.dismissed, false)))
      .orderBy(desc(alerts.createdAt))
      .limit(500);

    return c.json({ alerts: alertRows }, 200);
  })
  // Dismiss alert
  .post("/:id/dismiss", requireAuth, async (c) => {
    const user = c.get("user")!;
    const alertId = c.req.param("id");
    const familyRows = await db
      .select()
      .from(families)
      .where(eq(families.parentUserId, user.id))
      .limit(1);
    if (familyRows.length === 0) return c.json({ error: "Not found" }, 404);

    await db.update(alerts)
      .set({ dismissed: true })
      .where(and(eq(alerts.id, alertId), eq(alerts.familyId, familyRows[0].id)));

    return c.json({ success: true }, 200);
  })
  // Risk scan endpoint — submitted from child device
  .post("/risk-scan", async (c) => {
    const body = await c.req.json<{
      childId?: unknown;
      deviceToken?: unknown;
      message?: unknown;
      isUnknownContact?: unknown;
      messageCount?: unknown;
    }>().catch(() => null);
    if (!body) return c.json({ error: "Invalid JSON body" }, 400);

    const childId = typeof body.childId === "string" ? body.childId : "";
    const deviceToken = typeof body.deviceToken === "string" ? body.deviceToken : "";
    const message = typeof body.message === "string" ? body.message : "";

    if (!childId || !deviceToken || !message) {
      return c.json({ error: "childId, deviceToken and message required" }, 400);
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return c.json({ error: "Message too long" }, 400);
    }

    // A single device cannot generate unbounded alerts (or DB writes).
    if (!rateLimit(`risk-scan:${childId}`, 120, 60_000)) {
      return c.json({ error: "Too many requests" }, 429);
    }

    const child = await findChildForDevice(childId, deviceToken);
    if (!child) return c.json({ error: "Unknown device" }, 401);

    const isUnknownContact = body.isUnknownContact === true;
    const messageCount = typeof body.messageCount === "number" && Number.isFinite(body.messageCount)
      ? Math.max(1, Math.floor(body.messageCount))
      : 1;

    const result = scoreMessage({ message, isUnknownContact, messageCount });

    if (result.score >= 70) {
      const id = randomUUID();
      await db.insert(alerts).values({
        id,
        childId: child.id,
        familyId: child.familyId,
        riskScore: result.score,
        summary: result.summary,
        category: result.category,
      });
      return c.json({ score: result.score, alerted: true, alertId: id }, 200);
    }

    return c.json({ score: result.score, alerted: false }, 200);
  });

export default app;
