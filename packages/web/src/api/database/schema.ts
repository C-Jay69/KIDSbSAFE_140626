import { pgTable, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";

export * from "./auth-schema";

// Families
export const families = pgTable("families", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentUserId: text("parent_user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Children
export const children = pgTable("children", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().references(() => families.id),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  deviceToken: text("device_token"),
  pairingCode: text("pairing_code"),
  pairingCodeExpiresAt: timestamp("pairing_code_expires_at"),
  pairedAt: timestamp("paired_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Alerts
export const alerts = pgTable("alerts", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id),
  familyId: text("family_id").notNull(),
  riskScore: integer("risk_score").notNull(),
  summary: text("summary").notNull(),
  category: text("category").notNull(), // 'grooming' | 'bullying' | 'scam' | 'predator' | 'other'
  dismissed: boolean("dismissed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Geofences
export const geofences = pgTable("geofences", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull(),
  childId: text("child_id").references(() => children.id),
  name: text("name").notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  radiusMeters: integer("radius_meters").notNull().default(200),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Domain Blacklist (Managed by Parents/Admin)
export const domainBlacklist = pgTable("domain_blacklist", {
  id: text("id").primaryKey(),
  domain: text("domain").notNull().unique(),
  category: text("category").notNull(), // 'porn', 'gambling', 'violence', 'etc'
  riskScore: integer("risk_score").notNull().default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// DNS Logs (Visit History)
export const dnsLogs = pgTable("dns_logs", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id),
  domain: text("domain").notNull(),
  riskScore: integer("risk_score").notNull(),
  flagged: boolean("flagged").notNull().default(false),
  visitedAt: timestamp("visited_at").notNull().defaultNow(),
});

// GPS Events
export const gpsEvents = pgTable("gps_events", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  accuracy: real("accuracy"),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
});

// Browsing History
export const browsingHistory = pgTable("browsing_history", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id),
  familyId: text("family_id").notNull(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  title: text("title"),
  flagged: boolean("flagged").notNull().default(false),
  flagReason: text("flag_reason"),
  riskScore: integer("risk_score").notNull().default(0),
  visitedAt: timestamp("visited_at").notNull().defaultNow(),
});
