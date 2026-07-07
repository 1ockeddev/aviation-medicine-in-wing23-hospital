/**
 * Script to update user password
 * Usage: npx tsx scripts/update-password.ts <username> <new-password>
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ Usage: npx tsx scripts/update-password.ts <username> <new-password>');
    process.exit(1);
  }

  const [username, newPassword] = args;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    console.error(`❌ User "${username}" not found!`);
    process.exit(1);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { username },
    data: {
      password: hashedPassword,
    },
  });

  console.log('✅ Password updated successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 Username: ${username}`);
  console.log(`🔑 New Password: ${newPassword}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🌐 You can now login at: http://localhost:3000/login');
}

main()
  .catch((error) => {
    console.error('❌ Error updating password:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
