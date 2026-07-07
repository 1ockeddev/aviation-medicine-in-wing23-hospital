/**
 * Script to list all users
 * Usage: npx tsx scripts/list-users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (users.length === 0) {
    console.log('⚠️  No users found in the database.');
    console.log('\n💡 Create a new admin user with:');
    console.log('   npx tsx scripts/create-admin.ts <username> <password>');
    return;
  }

  console.log(`\n📋 Found ${users.length} user(s):\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.username}`);
    console.log(`   👤 Role: ${user.role}`);
    console.log(`   🆔 ID: ${user.id}`);
    console.log(`   📅 Created: ${user.createdAt.toLocaleString('th-TH')}`);
    console.log(`   🔄 Updated: ${user.updatedAt.toLocaleString('th-TH')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  });
}

main()
  .catch((error) => {
    console.error('❌ Error listing users:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
