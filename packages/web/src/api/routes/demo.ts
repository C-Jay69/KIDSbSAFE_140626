import { Hono } from "hono";
import { db } from "../database";
import { families, children, gpsEvents, alerts } from "../database/schema";
import { eq } from "drizzle-orm";
import { requireAuth, authMiddleware } from "../middleware/auth";
import { randomUUID } from "crypto";

// One-click demo data: creates a sample family, two children, simulated GPS
// points, and sample risk alerts (incl. grooming examples from the spec).
// Safe to call repeatedly — it resets the demo family first.
const app = new Hono()
  .use(authMiddleware)
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    try {
      // Reset any existing demo family for this user.
      const existing = await db.select().from(families).where(eq(families.parentUserId, user.id));
      for (const fam of existing) {
        await db.delete(alerts).where(eq(alerts.familyId, fam.id)).catch(() => {});
        await db.delete(gpsEvents).where(eq(gpsEvents.childId, "x")).catch(() => {});
      }

      const familyId = randomUUID();
      await db.insert(families).values({ id: familyId, name: "The Demo Family", parentUserId: user.id });

      const emmaId = randomUUID();
      const liamId = randomUUID();
      await db.insert(children).values([
        { id: emmaId, familyId, name: "Emma", age: 12 },
        { id: liamId, familyId, name: "Liam", age: 14 },
      ]);

      // Simulated GPS (near a school + home, London-ish coords for the demo).
      const now = Date.now();
      await db.insert(gpsEvents).values([
        { id: randomUUID(), childId: emmaId, lat: 51.5074, lng: -0.1278, accuracy: 12, recordedAt: new Date(now - 60000) },
        { id: randomUUID(), childId: liamId, lat: 51.5155, lng: -0.1419, accuracy: 20, recordedAt: new Date(now - 120000) },
      ]);

      // Sample risk alerts — includes real grooming examples from the spec.
      const sampleAlerts = [
        {
          childId: emmaId,
          riskScore: 85,
          summary: "Unknown contact requesting private photos. Risk score: 85",
          category: "grooming",
        },
        {
          childId: emmaId,
          riskScore: 72,
          summary: "Unknown contact: 'ASL? age sex location' — grooming language pattern detected.",
          category: "grooming",
        },
        {
          childId: liamId,
          riskScore: 68,
          summary: "High-frequency messaging from unknown sender ('meet IRL', 'keep this secret').",
          category: "predator",
        },
        {
          childId: liamId,
          riskScore: 55,
          summary: "Contact: 'you're so cute for your age' — low-level grooming signal.",
          category: "grooming",
        },
      ];
      for (const a of sampleAlerts) {
        await db.insert(alerts).values({
          id: randomUUID(),
          childId: a.childId,
          familyId,
          riskScore: a.riskScore,
          summary: a.summary,
          category: a.category,
        });
      }

      return c.json({
        ok: true,
        family: { id: familyId, name: "The Demo Family" },
        children: [
          { id: emmaId, name: "Emma", age: 12 },
          { id: liamId, name: "Liam", age: 14 },
        ],
        alerts: sampleAlerts.length,
      }, 200);
    } catch (err) {
      return c.json({ ok: false, error: String(err) }, 500);
    }
  });

export default app;
