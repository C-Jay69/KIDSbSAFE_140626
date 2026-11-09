import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../database";
import { browsingHistory, alerts, families } from "../database/schema";
import { requireAuth, authMiddleware, findChildForDevice, type AppVariables } from "../middleware/auth";
import { rateLimit } from "../lib/rate-limit";
import { checkUrl } from "../lib/url-safety";

const GOOGLE_SAFE_BROWSING_KEY = process.env.GOOGLE_SAFE_BROWSING_KEY;

const MAX_URL_LENGTH = 2048;
const MAX_TITLE_LENGTH = 500;

const app = new Hono<{ Variables: AppVariables }>()
  .use(authMiddleware)

  // POST /api/browse/check — called from child device on every navigation.
  //
  // childId alone is not authentication: it is an identifier. Require the
  // device token issued at pairing so a third party cannot inject browsing
  // history or fake "blocked site" alerts for someone else's child.
  .post("/check", async (c) => {
    const body = await c.req.json<{
      childId?: unknown;
      deviceToken?: unknown;
      url?: unknown;
      title?: unknown;
    }>().catch(() => null);
    if (!body) return c.json({ error: "Invalid JSON body" }, 400);

    const childId = typeof body.childId === "string" ? body.childId : "";
    const deviceToken = typeof body.deviceToken === "string" ? body.deviceToken : "";
    const url = typeof body.url === "string" ? body.url : "";
    const title = typeof body.title === "string" ? body.title : undefined;

    if (!childId || !deviceToken || !url) {
      return c.json({ error: "childId, deviceToken and url required" }, 400);
    }
    if (url.length > MAX_URL_LENGTH) {
      return c.json({ error: "URL too long" }, 400);
    }
    if (title && title.length > MAX_TITLE_LENGTH) {
      return c.json({ error: "Title too long" }, 400);
    }

    // Cap writes per device. Navigation can be frequent, but not unbounded.
    if (!rateLimit(`browse:${childId}`, 120, 60_000)) {
      return c.json({ error: "Too many requests" }, 429);
    }

    const child = await findChildForDevice(childId, deviceToken);
    if (!child) return c.json({ error: "Unknown device" }, 401);

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
      childId: child.id,
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
      await db.insert(alerts).values({
        id: alertId,
        childId: child.id,
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

    const familyRows = await db
      .select()
      .from(families)
      .where(eq(families.parentUserId, user.id))
      .limit(1);
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
