import { Hono } from "hono";
import { db } from "../database";
import { dnsLogs, alerts, domainBlacklist } from "../database/schema";
import { eq, and } from "drizzle-orm";
import { scoreDomain } from "../lib/risk-engine";
import { nanoid } from "nanoid";

const dns = new Hono();

dns.post("/log", async (c) => {
  const { childId, domain } = await c.req.json();

  if (!childId || !domain) {
    return c.json({ error: "Missing childId or domain" }, 400);
  }

  // 1. Fetch current blacklist for scoring
  const blacklist = await db.select().from(domainBlacklist);

  // 2. Score the domain
  const assessment = scoreDomain(domain, blacklist);

  // 3. Log the visit to the database
  await db.insert(dnsLogs).values({
    id: nanoid(),
    childId: childId,
    domain: domain,
    riskScore: assessment.score,
    flagged: assessment.isFlagged,
    visitedAt: new Date(),
  });

  // 4. If high risk, create a Parent Alert immediately
  if (assessment.isFlagged) {
    // First, find the familyId associated with the child
    const childRes = await db.select().from(dnsLogs).where(eq(dnsLogs.childId, childId)).limit(1);
    const familyId = childRes[0]?.familyId || "unknown";

    await db.insert(alerts).values({
      id: nanoid(),
      childId: childId,
      familyId: familyId,
      riskScore: assessment.score,
      summary: `High-risk domain detected: ${domain}. Category: ${assessment.category}.`,
      category: assessment.category,
      dismissed: false,
      createdAt: new Date(),
    });
  }

  return c.json({
    success: true,
    score: assessment.score,
    isFlagged: assessment.isFlagged,
  });
});

export default dns;
