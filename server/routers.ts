import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ADMIN_JWT_SECRET = process.env.JWT_SECRET || "admin-secret-key-change-in-production";
const ADMIN_COOKIE_NAME = "josh_moore_admin_session";

// Helper to verify admin session
async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    jwt.verify(token, ADMIN_JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  admin: router({
    // Admin login
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const admin = await db.getAdminByUsername(input.username);
        if (!admin) {
          throw new Error("Invalid credentials");
        }
        const valid = await bcrypt.compare(input.password, admin.passwordHash);
        if (!valid) {
          throw new Error("Invalid credentials");
        }
        const token = jwt.sign({ username: input.username }, ADMIN_JWT_SECRET, { expiresIn: "7d" });
        ctx.res.cookie(ADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          secure: ctx.req.protocol === "https",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { success: true };
      }),

    // Verify admin session
    verifySession: publicProcedure.query(async ({ ctx }) => {
      const token = ctx.req.cookies?.[ADMIN_COOKIE_NAME];
      const isValid = await verifyAdminSession(token);
      return { isAuthenticated: isValid };
    }),

    // Admin logout
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE_NAME);
      return { success: true };
    }),

    // Get all settings
    getSettings: publicProcedure.query(async () => {
      const settings = await db.getAllSettings();
      const settingsMap: Record<string, string> = {};
      settings.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      return settingsMap;
    }),

    // Update setting
    updateSetting: publicProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.[ADMIN_COOKIE_NAME];
        if (!(await verifyAdminSession(token))) {
          throw new Error("Unauthorized");
        }
        await db.upsertSetting(input.key, input.value);
        return { success: true };
      }),

    // Get all embed codes
    getEmbedCodes: publicProcedure.query(async () => {
      return await db.getAllEmbedCodes();
    }),

    // Update embed code
    updateEmbedCode: publicProcedure
      .input(z.object({ type: z.enum(["submit_deal_form", "contact_calendar"]), code: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.[ADMIN_COOKIE_NAME];
        if (!(await verifyAdminSession(token))) {
          throw new Error("Unauthorized");
        }
        await db.upsertEmbedCode(input.type, input.code);
        return { success: true };
      }),

    // Get all resource links
    getResourceLinks: publicProcedure.query(async () => {
      return await db.getAllResourceLinks();
    }),

    // Update resource links
    updateResourceLinks: publicProcedure
      .input(z.array(z.object({ key: z.string(), label: z.string(), url: z.string(), displayOrder: z.number() })))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.[ADMIN_COOKIE_NAME];
        if (!(await verifyAdminSession(token))) {
          throw new Error("Unauthorized");
        }
        for (const link of input) {
          await db.upsertResourceLink(link.key, link.label, link.url, link.displayOrder);
        }
        return { success: true };
      }),

    // Get all social links
    getSocialLinks: publicProcedure.query(async () => {
      return await db.getAllSocialLinks();
    }),

    // Update social links
    updateSocialLinks: publicProcedure
      .input(z.array(z.object({ platform: z.enum(["facebook", "instagram", "linkedin", "youtube"]), url: z.string() })))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.[ADMIN_COOKIE_NAME];
        if (!(await verifyAdminSession(token))) {
          throw new Error("Unauthorized");
        }
        for (const link of input) {
          await db.upsertSocialLink(link.platform, link.url);
        }
        return { success: true };
      }),

    // Get all quick links
    getQuickLinks: publicProcedure.query(async () => {
      return await db.getAllQuickLinks();
    }),

    // Update quick links
    updateQuickLinks: publicProcedure
      .input(z.array(z.object({ id: z.number().optional(), label: z.string(), url: z.string(), displayOrder: z.number() })))
      .mutation(async ({ input, ctx }) => {
        const token = ctx.req.cookies?.[ADMIN_COOKIE_NAME];
        if (!(await verifyAdminSession(token))) {
          throw new Error("Unauthorized");
        }
        for (const link of input) {
          await db.upsertQuickLink(link.id, link.label, link.url, link.displayOrder);
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
