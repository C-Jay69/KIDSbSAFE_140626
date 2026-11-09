import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export * from "./auth-schema";

// Families
export const families = pgTable("families", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentUserId: text("parent_user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  // A parent has exactly one family. Every route looks up familyRows[0], so
  // a second row is a data-integrity bug, not a feature.
  uniqueIndex("families_parent_user_id_idx").on(table.parentUserId),
]);

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
}, (table) => [
  index("children_family_id_idx").on(table.familyId),
  // Both columns are lookup credentials; uniqueness prevents two children
  // from resolving the same pairing code or device token.
  uniqueIndex("children_pairing_code_idx").on(table.pairingCode),
  uniqueIndex("children_device_token_idx").on(table.deviceToken),
]);

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
}, (table) => [
  index("alerts_family_dismissed_idx").on(table.familyId, table.dismissed),
  index("alerts_child_id_idx").on(table.childId),
]);

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
}, (table) => [
  index("geofences_family_id_idx").on(table.familyId),
]);

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
}, (table) => [
  index("dns_logs_child_visited_idx").on(table.childId, table.visitedAt),
]);

// GPS Events
export const gpsEvents = pgTable("gps_events", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  accuracy: real("accuracy"),
  recordedAt: timestamp("recorded_at").notNull().defaultNow(),
}, (table) => [
  // Drives the "latest location per child" query on every dashboard poll.
  index("gps_events_child_recorded_idx").on(table.childId, table.recordedAt),
]);

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
}, (table) => [
  index("browsing_history_family_visited_idx").on(table.familyId, table.visitedAt),
  index("browsing_history_child_id_idx").on(table.childId),
]);
