import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import familiesRoute from "./routes/families";
import childrenRoute from "./routes/children";
import alertsRoute from "./routes/alerts";
import geofencesRoute from "./routes/geofences";
import browseRoute from "./routes/browse";
import dnsRoute from "./routes/dns";

const app = new Hono()
  .use(cors({
    origin: (origin) => origin ?? "*",
    credentials: true,
    exposeHeaders: ["set-auth-token"],
  }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath("api")
  .get("/health", (c) => c.json({ status: "ok", service: "KIDSbSAFE" }, 200))
  .route("/families", familiesRoute)
  .route("/children", childrenRoute)
  .route("/alerts", alertsRoute)
  .route("/geofences", geofencesRoute)
  .route("/browse", browseRoute)
  .route("/dns", dnsRoute);

export type AppType = typeof app;
export default app;
