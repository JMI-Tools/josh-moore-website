import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/mysql2';
import { adminCredentials } from '../drizzle/schema.js';
import dotenv from 'dotenv';

dotenv.config();

const password = 'JM' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10).toUpperCase() + '#2025';
const passwordHash = await bcrypt.hash(password, 10);

const db = drizzle(process.env.DATABASE_URL);

try {
  await db.insert(adminCredentials).values({
    username: 'admin',
    passwordHash: passwordHash,
  });
  console.log('✓ Admin credentials created successfully');
  console.log('');
  console.log('='.repeat(60));
  console.log('ADMIN LOGIN CREDENTIALS');
  console.log('='.repeat(60));
  console.log('Username: admin');
  console.log('Password:', password);
  console.log('='.repeat(60));
  console.log('');
  console.log('⚠️  SAVE THESE CREDENTIALS - They will not be shown again!');
  process.exit(0);
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    console.log('Admin user already exists');
  } else {
    console.error('Error creating admin:', error);
  }
  process.exit(1);
}
