/**
 * Create or reset the admin dashboard credential directly against DATABASE_URL.
 *
 * The username and password are read from the environment — never hardcoded here.
 * This file is committed to a GitHub repo, so anything written into it is public.
 *
 *   ADMIN_PASSWORD='<a long random password>' node scripts/setup-admin.mjs
 */
import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { adminCredentials } from '../drizzle/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 12) {
  console.error('ADMIN_PASSWORD must be set and at least 12 characters.');
  console.error("Example: ADMIN_PASSWORD='<a long random password>' node scripts/setup-admin.mjs");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL must be set.');
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);
const db = drizzle(process.env.DATABASE_URL);

function report(action) {
  console.log(`✓ Admin credentials ${action} successfully`);
  console.log('  Username: ' + username);
  console.log('  Password: (the ADMIN_PASSWORD you supplied — not echoed)');
}

try {
  await db.insert(adminCredentials).values({ username, passwordHash });
  report('created');
  process.exit(0);
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    console.log('Admin user already exists. Updating password...');
    await db
      .update(adminCredentials)
      .set({ passwordHash })
      .where(eq(adminCredentials.username, username));
    report('updated');
    process.exit(0);
  }
  console.error('Error creating admin:', error);
  process.exit(1);
}
