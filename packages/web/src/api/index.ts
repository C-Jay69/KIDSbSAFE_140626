import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import familiesRoute from "./routes/families";
import childrenRoute from "./routes/children";
import alertsRoute from "./routes/alerts";
import geofencesRoute from "./routes/geofences";
import browseRoute from "./routes/browse";
import dnsRoute from "./routes/dns";
import geoRoute from "./routes/geo";
import demoRoute from "./routes/demo";
import billingRoute from "./routes/billing";
import contactRoute from "./routes/contact";

/**
 * Build the origin allowlist once at boot.
 *
 * The previous configuration reflected *any* request Origin back and enabled
 * credentials, which lets any website read authenticated API responses in a
 * browser that holds a KIDSbSAFE session. Origins must be explicit.
 */
function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  const website = process.env.WEBSITE_URL;
  if (website) {
    try {
      origins.add(new URL(website).origin);
    } catch {
      console.error(`[cors] WEBSITE_URL is not a valid URL: ${website}`);
    }
  }

  for (const raw of (process.env.CORS_ORIGINS ?? "").split(",")) {
    const origin = raw.trim().replace(/\/$/, "");
    if (origin) origins.add(origin);
  }

  if (process.env.NODE_ENV !== "production") {
    for (const origin of [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:4200",
      "http://127.0.0.1:4200",
    ]) {
      origins.add(origin);
    }
  }

  return origins;
}

const allowedOrigins = buildAllowedOrigins();

const app = new Hono()
  .use(cors({
    origin: (origin) => (origin && allowedOrigins.has(origin) ? origin : undefined),
    credentials: true,
    exposeHeaders: ["set-auth-token"],
    allowHeaders: ["Content-Type", "Authorization", "expo-origin"],
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
  }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath("api")
  .get("/health", (c) => c.json({ status: "ok", service: "KIDSbSAFE" }, 200))
  .route("/families", familiesRoute)
  .route("/children", childrenRoute)
  .route("/alerts", alertsRoute)
  .route("/geofences", geofencesRoute)
  .route("/browse", browseRoute)
  .route("/dns", dnsRoute)
  .route("/geo", geoRoute)
  .route("/demo", demoRoute)
  .route("/billing", billingRoute)
  .route("/contact", contactRoute);

export type AppType = typeof app;
export default app;
