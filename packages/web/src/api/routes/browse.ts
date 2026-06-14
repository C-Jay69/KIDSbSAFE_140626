import { Hono } from "hono";
import { db } from "../database";
import { browsingHistory, alerts, children, families } from "../database/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { checkUrl } from "../lib/url-safety";
import { randomUUID } from "crypto";

const GOOGLE_SAFE_BROWSING_KEY = process.env.GOOGLE_SAFE_BROWSING_KEY;

const app = new Hono()
  .use(authMiddleware)

  // POST /api/browse/check — called from child device on every navigation
  .post("/check", async (c) => {
    const { childId, url, title } = await c.req.json<{
      childId: string;
      url: string;
      title?: string;
    }>();

    if (!childId || !url) return c.json({ error: "childId and url required" }, 400);

    const childRows = await db.select().from(children).where(eq(children.id, childId));
    if (childRows.length === 0) return c.json({ error: "Child not found" }, 404);

    const child = childRows[0];

    // Extract domain
    let domain = url;
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      domain = u.hostname.replace(/^www\./, "");
    } catch { /* keep as is */ }

    // Check URL safety
    const result = await checkUrl(url, GOOGLE_SAFE_BROWSING_KEY);

    // Log to browsing history
    const historyId = randomUUID();
    await db.insert(browsingHistory).values({
      id: historyId,
      childId,
      familyId: child.familyId,
      url,
      domain,
      title: title ?? null,
      flagged: !result.safe,
      flagReason: result.safe ? null : result.reason,
      riskScore: result.score,
    });

    // If flagged, create an alert (score >= 60 creates alert)
    if (!result.safe && result.score >= 60) {
      const alertId = randomUUID();
      const categoryLabel = result.category.replace("_", " ");
      await db.insert(alerts).values({
        id: alertId,
        childId,
        familyId: child.familyId,
        riskScore: result.score,
        summary: `${child.name} visited a flagged website: ${domain}. ${result.reason}`,
        category: result.category,
      });

      return c.json({
        safe: false,
        block: true,
        score: result.score,
        category: result.category,
        reason: result.reason,
        alertId,
      }, 200);
    }

    return c.json({ safe: result.safe, block: false, score: result.score }, 200);
  })

  // GET /api/browse/history — parent view of child browsing history
  .get("/history", requireAuth, async (c) => {
    const user = c.get("user")!;
    const childId = c.req.query("childId");

    const familyRows = await db.select().from(families).where(eq(families.parentUserId, user.id));
    if (familyRows.length === 0) return c.json({ history: [] }, 200);

    const familyId = familyRows[0].id;

    const query = childId
      ? and(eq(browsingHistory.familyId, familyId), eq(browsingHistory.childId, childId))
      : eq(browsingHistory.familyId, familyId);

    const rows = await db
      .select()
      .from(browsingHistory)
      .where(query)
      .orderBy(desc(browsingHistory.visitedAt))
      .limit(200);

    return c.json({ history: rows }, 200);
  });

export default app;
