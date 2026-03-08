import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import bcrypt from "bcryptjs";
import * as db from "./db";

type AuthenticatedContext = TrpcContext & { req: { cookies?: Record<string, string> } };

function createMockContext(): AuthenticatedContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
      cookies: {},
    } as AuthenticatedContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as AuthenticatedContext["res"],
  };
}

describe("Admin Authentication", () => {
  it("should reject invalid login credentials", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.admin.login({ username: "wrong", password: "wrong" })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should verify unauthenticated session", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.verifySession();
    expect(result.isAuthenticated).toBe(false);
  });
});

describe("Admin Settings Management", () => {
  it("should retrieve all settings", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const settings = await caller.admin.getSettings();
    expect(settings).toBeDefined();
    expect(typeof settings).toBe("object");
  });

  it("should retrieve embed codes", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const embedCodes = await caller.admin.getEmbedCodes();
    expect(Array.isArray(embedCodes)).toBe(true);
  });

  it("should retrieve resource links", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const resourceLinks = await caller.admin.getResourceLinks();
    expect(Array.isArray(resourceLinks)).toBe(true);
  });

  it("should retrieve social links", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const socialLinks = await caller.admin.getSocialLinks();
    expect(Array.isArray(socialLinks)).toBe(true);
  });

  it("should retrieve quick links", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const quickLinks = await caller.admin.getQuickLinks();
    expect(Array.isArray(quickLinks)).toBe(true);
  });
});

describe("Database Helper Functions", () => {
  it("should create and retrieve admin credentials", async () => {
    const testUsername = "testadmin_" + Date.now();
    const testPassword = "testpass123";
    const passwordHash = await bcrypt.hash(testPassword, 10);

    await db.createAdminCredential(testUsername, passwordHash);
    const admin = await db.getAdminByUsername(testUsername);

    expect(admin).toBeDefined();
    expect(admin?.username).toBe(testUsername);
    expect(admin?.passwordHash).toBeDefined();
  });

  it("should upsert and retrieve settings", async () => {
    const testKey = "test_setting_" + Date.now();
    const testValue = "test_value";

    await db.upsertSetting(testKey, testValue);
    const setting = await db.getSetting(testKey);

    expect(setting).toBeDefined();
    expect(setting?.key).toBe(testKey);
    expect(setting?.value).toBe(testValue);
  });

  it("should upsert and retrieve embed codes", async () => {
    const testCode = "<div>Test Form</div>";

    await db.upsertEmbedCode("submit_deal_form", testCode);
    const embedCode = await db.getEmbedCode("submit_deal_form");

    expect(embedCode).toBeDefined();
    expect(embedCode?.type).toBe("submit_deal_form");
    expect(embedCode?.code).toBe(testCode);
  });

  it("should upsert and retrieve social links", async () => {
    const testUrl = "https://facebook.com/test";

    await db.upsertSocialLink("facebook", testUrl);
    const socialLinks = await db.getAllSocialLinks();
    const facebookLink = socialLinks.find(l => l.platform === "facebook");

    expect(facebookLink).toBeDefined();
    expect(facebookLink?.url).toBe(testUrl);
  });
});
