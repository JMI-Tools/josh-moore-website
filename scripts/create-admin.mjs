import bcrypt from 'bcryptjs';
import { createAdminCredential } from '../server/db.ts';

const username = 'admin';
const password = '12345';

const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);

try {
  await createAdminCredential(username, passwordHash);
  console.log(`✓ Admin account created successfully`);
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);
} catch (error) {
  console.error('Error creating admin account:', error.message);
}
