import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import { adminCredentials } from '../drizzle/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const username = 'admin';
const password = '12345';

const passwordHash = await bcrypt.hash(password, 10);
const db = drizzle(process.env.DATABASE_URL);

try {
  await db.insert(adminCredentials).values({
    username: username,
    passwordHash: passwordHash,
  });
  console.log('✓ Admin credentials created successfully');
  console.log('');
  console.log('='.repeat(60));
  console.log('ADMIN LOGIN CREDENTIALS');
  console.log('='.repeat(60));
  console.log('Username: ' + username);
  console.log('Password: ' + password);
  console.log('='.repeat(60));
  process.exit(0);
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    console.log('Admin user already exists. Updating password...');
    // Delete existing and recreate
    await db.delete(adminCredentials).where(adminCredentials.username === username);
    await db.insert(adminCredentials).values({
      username: username,
      passwordHash: passwordHash,
    });
    console.log('✓ Admin credentials updated successfully');
    console.log('');
    console.log('='.repeat(60));
    console.log('ADMIN LOGIN CREDENTIALS');
    console.log('='.repeat(60));
    console.log('Username: ' + username);
    console.log('Password: ' + password);
    console.log('='.repeat(60));
  } else {
    console.error('Error creating admin:', error);
  }
  process.exit(0);
}
