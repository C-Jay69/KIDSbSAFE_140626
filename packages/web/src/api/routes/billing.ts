import { Hono } from "hono";
import { authMiddleware, requireAuth, type AppVariables } from "../middleware/auth";
import { isAdminEmail } from "../lib/admin";

/** Plan allowlisted staff accounts resolve to, regardless of billing state. */
const ADMIN_PLAN_ID = "premium";

const app = new Hono<{ Variables: AppVariables }>()
  .use(authMiddleware)
  // Effective plan override for the signed-in account.
  //
  // `planId: null` means "no override — use what Autumn reports", so paying
  // customers are unaffected by this endpoint.
  .get("/me", requireAuth, (c) => {
    const user = c.get("user")!;
    const isAdmin = isAdminEmail(user.email);
    return c.json(
      {
        isAdmin,
        planId: isAdmin ? ADMIN_PLAN_ID : null,
      },
      200
    );
  });

export default app;
