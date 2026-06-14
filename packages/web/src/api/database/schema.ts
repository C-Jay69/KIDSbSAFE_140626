import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export * from "./auth-schema";

// Families
export const families = sqliteTable("families", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentUserId: text("parent_user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Children
export const children = sqliteTable("children", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().references(() => families.id),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  deviceToken: text("device_token"),
  pairingCode: text("pairing_code"),
  pairingCodeExpiresAt: integer("pairing_code_expires_at", { mode: "timestamp" }),
  pairedAt: integer("paired_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Alerts
export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id),
  familyId: text("family_id").notNull(),
  riskScore: integer("risk_score").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(), // 'grooming' | 'bullying' | 'scam' | 'predator' | 'other'
  dismissed: integer("dismissed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Geofences
export const geofences = sqliteTable("geofences", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull(),
  childId: text("child_id").references(() => children.id),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  radiusMeters: integer("radius_meters").notNull().default(200),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// GPS Events
export const gpsEvents = sqliteTable("gps_events", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  accuracy: real("accuracy"),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// Browsing History
export const browsingHistory = sqliteTable("browsing_history", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id),
  familyId: text("family_id").notNull(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  title: text("title"),
  flagged: integer("flagged", { mode: "boolean" }).notNull().default(false),
  flagReason: text("flag_reason"),
  riskScore: integer("risk_score").notNull().default(0),
  visitedAt: integer("visited_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});
