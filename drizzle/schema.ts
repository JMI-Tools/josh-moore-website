import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Admin credentials table for dashboard access
 */
export const adminCredentials = mysqlTable("adminCredentials", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminCredential = typeof adminCredentials.$inferSelect;

/**
 * Site settings for visibility toggles and configuration
 */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;

/**
 * Embed codes for forms and calendars
 */
export const embedCodes = mysqlTable("embedCodes", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["submit_deal_form", "contact_calendar"]).notNull().unique(),
  code: text("code"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmbedCode = typeof embedCodes.$inferSelect;

/**
 * Resource links for the resources page
 */
export const resourceLinks = mysqlTable("resourceLinks", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  url: text("url"),
  displayOrder: int("displayOrder").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResourceLink = typeof resourceLinks.$inferSelect;

/**
 * Social media links
 */
export const socialLinks = mysqlTable("socialLinks", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["facebook", "instagram", "linkedin", "youtube"]).notNull().unique(),
  url: text("url"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SocialLink = typeof socialLinks.$inferSelect;

/**
 * Quick links for admin dashboard
 */
export const quickLinks = mysqlTable("quickLinks", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  url: text("url"),
  displayOrder: int("displayOrder").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QuickLink = typeof quickLinks.$inferSelect;
