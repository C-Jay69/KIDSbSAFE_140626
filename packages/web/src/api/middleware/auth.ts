import { createMiddleware } from "hono/factory";
import { and, eq } from "drizzle-orm";
import type { Session, User } from "better-auth";
import { auth } from "../auth";
import { db } from "../database";
import { children } from "../database/schema";

/**
 * Hono environment shared by every route. Declaring it is what makes
 * `c.get("user")` type-safe; without it the key is `never` and `tsc` rejects
 * every handler that reads the session.
 */
export type AppVariables = {
  user: User | null;
  session: Session | null;
};

export const authMiddleware = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  return next();
});

export const requireAuth = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  if (!c.get("user")) return c.json({ message: "Unauthorized" }, 401);
  return next();
});

/**
 * Authenticates a child device for the unauthenticated ingestion endpoints
 * (browsing checks, risk scans, DNS logs).
 *
 * A childId on its own is NOT a credential: it is a stable identifier that can
 * leak (logs, analytics, the mobile bundle). Every write must be tied to the
 * device token that was issued when the device completed pairing.
 */
export async function findChildForDevice(childId: string, deviceToken: string) {
  if (!childId || !deviceToken) return null;
  const rows = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.deviceToken, deviceToken)))
    .limit(1);
  return rows[0] ?? null;
}

/** Best-effort client identifier for rate limiting (works behind a proxy). */
export function clientIp(c: { req: { header: (name: string) => string | undefined } }): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return c.req.header("x-real-ip") ?? "unknown";
}
