import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { expo } from "@better-auth/expo";
import { autumn } from "autumn-js/better-auth";
import { Autumn } from "autumn-js";
import { db } from "./database";

const autumnSdk = new Autumn();

/**
 * Explicit trusted-origin allowlist.
 *
 * Returning `[requestOrigin]` for every request (the previous behaviour)
 * disables Better Auth's CSRF/origin checks entirely: an attacker-controlled
 * site is automatically "trusted".
 */
function buildTrustedOrigins(): string[] {
  const origins = new Set<string>();

  const website = process.env.WEBSITE_URL;
  if (website) {
    try {
      origins.add(new URL(website).origin);
    } catch {
      console.error(`[auth] WEBSITE_URL is not a valid URL: ${website}`);
    }
  }

  for (const raw of (process.env.TRUSTED_ORIGINS ?? "").split(",")) {
    const origin = raw.trim().replace(/\/$/, "");
    if (origin) origins.add(origin);
  }

  // The Expo child/parent app is a native client. These schemes never come
  // from a browser, so they cannot be used to bypass CSRF protections.
  origins.add("kidsbsafe://");
  origins.add("mobile://");

  if (process.env.NODE_ENV !== "production") {
    for (const origin of [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:4200",
      "http://127.0.0.1:4200",
      "exp://",
      "exp://**",
    ]) {
      origins.add(origin);
    }
  }

  return [...origins];
}

if (!process.env.WEBSITE_URL) {
  console.warn("[auth] WEBSITE_URL is not set; Better Auth callbacks and origin checks may fail.");
}
if (!process.env.BETTER_AUTH_SECRET) {
  console.warn("[auth] BETTER_AUTH_SECRET is not set; sessions cannot be signed securely.");
}

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: buildTrustedOrigins(),
  plugins: [bearer(), expo(), autumn()],
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          try {
            await autumnSdk.customers.getOrCreate({
              customerId: user.id,
              name: user.name,
              email: user.email,
            });
          } catch (e) {
            console.error("[autumn] Failed to create customer:", e);
          }
        },
      },
    },
  },
});
