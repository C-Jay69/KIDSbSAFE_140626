import { Hono } from "hono";
import { randomUUID } from "crypto";
import { db } from "../database";
import { dnsLogs, alerts, domainBlacklist } from "../database/schema";
import { findChildForDevice } from "../middleware/auth";
import { rateLimit } from "../lib/rate-limit";
import { scoreDomain } from "../lib/risk-engine";

const MAX_DOMAIN_LENGTH = 253;

/**
 * POST /api/dns/log — called by a child device (or a DNS resolver acting on
 * its behalf) after a domain lookup.
 *
 * The previous implementation looked up `familyId` on the `dns_logs` row, but
 * that table has no such column, so every alert was written with
 * familyId: "unknown" and never appeared on the parent dashboard.
 */
const dns = new Hono();

dns.post("/log", async (c) => {
  const body = await c.req.json<{
    childId?: unknown;
    deviceToken?: unknown;
    domain?: unknown;
  }>().catch(() => null);
  if (!body) return c.json({ error: "Invalid JSON body" }, 400);

  const childId = typeof body.childId === "string" ? body.childId : "";
  const deviceToken = typeof body.deviceToken === "string" ? body.deviceToken : "";
  const domain = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";

  if (!childId || !deviceToken || !domain) {
    return c.json({ error: "childId, deviceToken and domain required" }, 400);
  }
  if (domain.length > MAX_DOMAIN_LENGTH || !/^[a-z0-9.-]+$/.test(domain)) {
    return c.json({ error: "Invalid domain" }, 400);
  }
  if (!rateLimit(`dns:${childId}`, 300, 60_000)) {
    return c.json({ error: "Too many requests" }, 429);
  }

  const child = await findChildForDevice(childId, deviceToken);
  if (!child) return c.json({ error: "Unknown device" }, 401);

  // 1. Fetch current blacklist for scoring
  const blacklist = await db.select().from(domainBlacklist);

  // 2. Score the domain
  const assessment = scoreDomain(domain, blacklist);

  // 3. Log the visit to the database
  await db.insert(dnsLogs).values({
    id: randomUUID(),
    childId: child.id,
    domain,
    riskScore: assessment.score,
    flagged: assessment.isFlagged,
    visitedAt: new Date(),
  });

  // 4. If high risk, create a Parent Alert immediately. The family comes
  //    from the child row, which is the only table that owns that relation.
  if (assessment.isFlagged) {
    await db.insert(alerts).values({
      id: randomUUID(),
      childId: child.id,
      familyId: child.familyId,
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
