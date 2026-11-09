import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../database";
import { families, children, gpsEvents, alerts } from "../database/schema";
import { requireAuth, authMiddleware, type AppVariables } from "../middleware/auth";

// One-click demo data: creates a sample family, two children, simulated GPS
// points, and sample risk alerts (incl. grooming examples from the spec).
//
// The demo is only available before the parent creates their real family
// (the dashboard only shows the button in that state). Refusing afterwards
// means the endpoint can never delete real alerts or create a second family,
// both of which the previous implementation did.
const app = new Hono<{ Variables: AppVariables }>()
  .use(authMiddleware)
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    try {
      const existing = await db
        .select({ id: families.id })
        .from(families)
        .where(eq(families.parentUserId, user.id))
        .limit(1);

      if (existing.length > 0) {
        return c.json({
          ok: false,
          error: "Demo data is only available before you create a family.",
        }, 409);
      }

      const familyId = randomUUID();
      await db.insert(families).values({
        id: familyId,
        name: "The Demo Family",
        parentUserId: user.id,
      });

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
      // A concurrent demo request can trip the unique index on parent_user_id.
      if ((err as { code?: string }).code === "23505") {
        return c.json({ ok: false, error: "Demo data already exists." }, 409);
      }
      console.error("[demo] seed failed:", err);
      return c.json({ ok: false, error: "Could not load demo data" }, 500);
    }
  });

export default app;
