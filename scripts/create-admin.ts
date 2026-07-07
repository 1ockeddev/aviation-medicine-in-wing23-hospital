/**
 * Script to create admin user
 * Usage: npx tsx scripts/create-admin.ts <username> <password>
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ Usage: npx tsx scripts/create-admin.ts <username> <password>');
    process.exit(1);
  }

  const [username, password] = args;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    console.error(`❌ User "${username}" already exists!`);
    process.exit(1);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 Username: ${user.username}`);
  console.log(`🔑 Password: ${password}`);
  console.log(`👑 Role: ${user.role}`);
  console.log(`📅 Created: ${user.createdAt}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🌐 You can now login at: http://localhost:3000/login');
}

main()
  .catch((error) => {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
