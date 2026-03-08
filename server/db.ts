import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, adminCredentials, siteSettings, embedCodes, resourceLinks, socialLinks, quickLinks } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Admin credentials
export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(adminCredentials).where(eq(adminCredentials.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAdminCredential(username: string, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminCredentials).values({ username, passwordHash });
}

// Site settings
export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(siteSettings);
}

export async function upsertSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(siteSettings).values({ key, value }).onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
}

// Embed codes
export async function getEmbedCode(type: "submit_deal_form" | "contact_calendar") {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(embedCodes).where(eq(embedCodes.type, type)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllEmbedCodes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(embedCodes);
}

export async function upsertEmbedCode(type: "submit_deal_form" | "contact_calendar", code: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(embedCodes).values({ type, code }).onDuplicateKeyUpdate({ set: { code, updatedAt: new Date() } });
}

// Resource links
export async function getAllResourceLinks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(resourceLinks).orderBy(resourceLinks.displayOrder);
}

export async function upsertResourceLink(key: string, label: string, url: string, displayOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(resourceLinks).values({ key, label, url, displayOrder }).onDuplicateKeyUpdate({ set: { label, url, displayOrder, updatedAt: new Date() } });
}

// Social links
export async function getAllSocialLinks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(socialLinks);
}

export async function upsertSocialLink(platform: "facebook" | "instagram" | "linkedin" | "youtube", url: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(socialLinks).values({ platform, url }).onDuplicateKeyUpdate({ set: { url, updatedAt: new Date() } });
}

// Quick links
export async function getAllQuickLinks() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(quickLinks).orderBy(quickLinks.displayOrder);
}

export async function upsertQuickLink(id: number | undefined, label: string, url: string, displayOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (id) {
    await db.update(quickLinks).set({ label, url, displayOrder, updatedAt: new Date() }).where(eq(quickLinks.id, id));
  } else {
    await db.insert(quickLinks).values({ label, url, displayOrder });
  }
}
