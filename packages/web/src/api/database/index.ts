import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail at boot with a clear message instead of letting postgres() fall back
  // to a local socket and produce a confusing runtime error on first query.
  throw new Error("DATABASE_URL is not set. Add it to the environment before starting the server.");
}

const client = postgres(connectionString, {
  max: Number(process.env.DATABASE_POOL_MAX ?? 10),
  idle_timeout: 20,
  connect_timeout: 10,
  // Supabase's transaction pooler (port 6543) does not support prepared
  // statements. Set DATABASE_PREPARE=false when using it.
  prepare: process.env.DATABASE_PREPARE !== "false",
});

export const db = drizzle(client, { schema });
