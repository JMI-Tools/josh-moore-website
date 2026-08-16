/**
 * Create the admin dashboard credential directly against DATABASE_URL (TypeScript variant).
 *
 * The username and password are read from the environment — never hardcoded here.
 * This file is committed to a GitHub repo, so anything written into it is public.
 *
 *   ADMIN_PASSWORD='<a long random password>' tsx scripts/setup-admin.ts
 */
import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import { adminCredentials } from '../drizzle/schema';
import dotenv from 'dotenv';

dotenv.config();

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD;

async function setupAdmin() {
  if (!password || password.length < 12) {
    console.error('ADMIN_PASSWORD must be set and at least 12 characters.');
    console.error("Example: ADMIN_PASSWORD='<a long random password>' tsx scripts/setup-admin.ts");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL must be set.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const db = drizzle(process.env.DATABASE_URL);

  try {
    await db.insert(adminCredentials).values({ username, passwordHash });
    console.log('✓ Admin credentials created successfully');
    console.log('  Username: ' + username);
    console.log('  Password: (the ADMIN_PASSWORD you supplied — not echoed)');
    process.exit(0);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Admin user already exists — no change made.');
      console.log('Run scripts/setup-admin.mjs to reset the password.');
      process.exit(0);
    }
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

setupAdmin();
