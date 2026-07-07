/**
 * Script to delete a user
 * Usage: npx tsx scripts/delete-user.ts <username>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('❌ Usage: npx tsx scripts/delete-user.ts <username>');
    process.exit(1);
  }

  const [username] = args;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    console.error(`❌ User "${username}" not found!`);
    process.exit(1);
  }

  // Delete user
  await prisma.user.delete({
    where: { username },
  });

  console.log('✅ User deleted successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 Deleted Username: ${username}`);
  console.log(`🆔 ID: ${user.id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((error) => {
    console.error('❌ Error deleting user:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
