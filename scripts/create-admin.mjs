/**
 * Create the admin dashboard credential.
 *
 * The username and password are read from the environment — never hardcoded here.
 * This file is committed to a GitHub repo, so anything written into it is public.
 *
 *   ADMIN_USERNAME=admin ADMIN_PASSWORD='<a long random password>' node scripts/create-admin.mjs
 *
 * Use scripts/init-admin.mjs instead if you want one generated for you.
 */
import bcrypt from 'bcryptjs';
import { createAdminCredential } from '../server/db.ts';

const username = process.env.ADMIN_USERNAME || 'admin';
const password = process.env.ADMIN_PASSWORD;

if (!password || password.length < 12) {
  console.error('ADMIN_PASSWORD must be set and at least 12 characters.');
  console.error("Example: ADMIN_PASSWORD='<a long random password>' node scripts/create-admin.mjs");
  process.exit(1);
}

const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);

try {
  await createAdminCredential(username, passwordHash);
  console.log('✓ Admin account created successfully');
  console.log(`  Username: ${username}`);
  console.log('  Password: (the ADMIN_PASSWORD you supplied — not echoed)');
} catch (error) {
  console.error('Error creating admin account:', error.message);
  process.exit(1);
}
