import { Hono } from "hono";
import { and, eq, gt } from "drizzle-orm";
import { randomInt, randomUUID } from "crypto";
import { db } from "../database";
import { families, children } from "../database/schema";
import { requireAuth, authMiddleware, clientIp, type AppVariables } from "../middleware/auth";
import { rateLimit } from "../lib/rate-limit";

const PAIRING_CODE_TTL_MS = 15 * 60 * 1000; // 15 min
const PAIRING_CODE_LENGTH = 6;

// Unambiguous 6-character alphabet (no 0/O, 1/I/L). Matches the mobile input
// mask, which only accepts A-Z and 0-9.
const PAIRING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Crypto-strong pairing code.
 *
 * Math.random() is not a CSPRNG: its output is predictable from a handful of
 * observations, and a pairing code is effectively a temporary credential that
 * binds a child device. randomInt() is uniform and unpredictable.
 */
function generatePairingCode(): string {
  let code = "";
  for (let i = 0; i < PAIRING_CODE_LENGTH; i++) {
    code += PAIRING_ALPHABET[randomInt(PAIRING_ALPHABET.length)];
  }
  return code;
}

/** Generate a code that is not currently in use by another child. */
async function generateUniquePairingCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generatePairingCode();
    const clash = await db
      .select({ id: children.id })
      .from(children)
      .where(eq(children.pairingCode, code))
      .limit(1);
    if (clash.length === 0) return code;
  }
  throw new Error("Could not allocate a unique pairing code");
}

function validateChildInput(name: unknown, age: unknown):
  | { ok: true; name: string; age: number }
  | { ok: false; error: string } {
  if (typeof name !== "string" || name.trim().length === 0) {
    return { ok: false, error: "Name is required" };
  }
  if (name.trim().length > 100) {
    return { ok: false, error: "Name is too long" };
  }
  if (typeof age !== "number" || !Number.isInteger(age) || age < 5 || age > 17) {
    return { ok: false, error: "Age must be an integer between 5 and 17" };
  }
  return { ok: true, name: name.trim(), age };
}

const app = new Hono<{ Variables: AppVariables }>()
  .use(authMiddleware)
  // Add child
  .post("/", requireAuth, async (c) => {
    const user = c.get("user")!;
    const body = await c.req.json<{ name?: unknown; age?: unknown }>().catch(() => null);
    if (!body) return c.json({ error: "Invalid JSON body" }, 400);

    const parsed = validateChildInput(body.name, body.age);
    if (!parsed.ok) return c.json({ error: parsed.error }, 400);

    const familyRows = await db
      .select()
      .from(families)
      .where(eq(families.parentUserId, user.id))
      .limit(1);
    if (familyRows.length === 0) return c.json({ error: "Create a family first" }, 400);

    const id = randomUUID();
    await db.insert(children).values({
      id,
      familyId: familyRows[0].id,
      name: parsed.name,
      age: parsed.age,
    });
    return c.json({ id, name: parsed.name, age: parsed.age }, 201);
  })
  // Generate pairing code for a child
  .post("/:id/pair", requireAuth, async (c) => {
    const user = c.get("user")!;
    const childId = c.req.param("id");

    const familyRows = await db
      .select()
      .from(families)
      .where(eq(families.parentUserId, user.id))
      .limit(1);
    if (familyRows.length === 0) return c.json({ error: "No family found" }, 404);

    const childRows = await db
      .select()
      .from(children)
      .where(and(eq(children.id, childId), eq(children.familyId, familyRows[0].id)))
      .limit(1);
    if (childRows.length === 0) return c.json({ error: "Child not found" }, 404);

    const code = await generateUniquePairingCode();
    const expiresAt = new Date(Date.now() + PAIRING_CODE_TTL_MS);

    await db.update(children)
      .set({ pairingCode: code, pairingCodeExpiresAt: expiresAt })
      .where(eq(children.id, childId));

    return c.json({ pairingCode: code, expiresAt }, 200);
  })
  // Child device claims pairing code
  .post("/claim-pair", async (c) => {
    // Bound brute-force attempts per source address. A 6-char code is only
    // safe if guessing is rate-limited.
    if (!rateLimit(`claim-pair:${clientIp(c)}`, 10, 60_000)) {
      return c.json({ error: "Too many attempts. Try again later." }, 429);
    }

    const body = await c.req.json<{ pairingCode?: unknown; deviceToken?: unknown }>().catch(() => null);
    if (!body) return c.json({ error: "Invalid JSON body" }, 400);

    const pairingCode = typeof body.pairingCode === "string"
      ? body.pairingCode.trim().toUpperCase()
      : "";
    const deviceToken = typeof body.deviceToken === "string" ? body.deviceToken.trim() : "";

    if (pairingCode.length !== PAIRING_CODE_LENGTH || !deviceToken) {
      return c.json({ error: "pairingCode and deviceToken required" }, 400);
    }
    if (deviceToken.length < 16 || deviceToken.length > 200) {
      return c.json({ error: "Invalid deviceToken" }, 400);
    }

    const now = new Date();

    // Atomic claim: the UPDATE only matches while the code is still valid, so
    // two devices racing on the same code cannot both win.
    const claimed = await db.update(children)
      .set({ deviceToken, pairedAt: now, pairingCode: null, pairingCodeExpiresAt: null })
      .where(and(eq(children.pairingCode, pairingCode), gt(children.pairingCodeExpiresAt, now)))
      .returning({
        id: children.id,
        name: children.name,
        familyId: children.familyId,
      });

    if (claimed.length === 0) {
      // Distinguish "expired" from "unknown" without leaking whether a code
      // exists for a different family.
      const expired = await db
        .select({ id: children.id })
        .from(children)
        .where(eq(children.pairingCode, pairingCode))
        .limit(1);
      if (expired.length > 0) return c.json({ error: "Pairing code expired" }, 410);
      return c.json({ error: "Invalid pairing code" }, 404);
    }

    const child = claimed[0];
    const familyRows = await db
      .select()
      .from(families)
      .where(eq(families.id, child.familyId))
      .limit(1);
    const family = familyRows[0];

    return c.json({
      success: true,
      child: { name: child.name, id: child.id },
      family: { parentName: family?.name ?? "Your Parent", id: child.familyId },
    }, 200);
  })
  // Child device re-validates its stored token on launch.
  //
  // The mobile app caches "paired" locally, but that flag can outlive the
  // server-side link (re-seeded database, deleted child, different account).
  // This endpoint is what makes the device tell the child the truth.
  .post("/device", async (c) => {
    if (!rateLimit(`device-verify:${clientIp(c)}`, 20, 60_000)) {
      return c.json({ error: "Too many requests. Try again later." }, 429);
    }

    const body = await c.req.json<{ deviceToken?: unknown }>().catch(() => null);
    const deviceToken = typeof body?.deviceToken === "string" ? body.deviceToken.trim() : "";
    if (!deviceToken) return c.json({ error: "deviceToken required" }, 400);
    if (deviceToken.length < 16 || deviceToken.length > 200) {
      return c.json({ error: "Invalid deviceToken" }, 400);
    }

    const rows = await db
      .select({
        id: children.id,
        name: children.name,
        pairedAt: children.pairedAt,
        familyId: children.familyId,
        familyName: families.name,
      })
      .from(children)
      .innerJoin(families, eq(families.id, children.familyId))
      .where(eq(children.deviceToken, deviceToken))
      .limit(1);

    // A token that no longer resolves means the device must pair again.
    if (rows.length === 0 || !rows[0].pairedAt) {
      return c.json({ error: "Device is not paired" }, 404);
    }

    const row = rows[0];
    return c.json({
      paired: true,
      child: { id: row.id, name: row.name },
      family: { id: row.familyId, parentName: row.familyName },
    }, 200);
  });

export default app;
