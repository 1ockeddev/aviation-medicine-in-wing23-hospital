import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Created admin user:', admin.username);

  // Create sample categories
  const painRelief = await prisma.category.upsert({
    where: { id: 'pain-relief-category' },
    update: {},
    create: {
      id: 'pain-relief-category',
      name: 'ยาแก้ปวด (Pain Relief)',
    },
  });

  const antibiotics = await prisma.category.upsert({
    where: { id: 'antibiotics-category' },
    update: {},
    create: {
      id: 'antibiotics-category',
      name: 'ยาปฏิชีวนะ (Antibiotics)',
    },
  });

  console.log('Created categories:', painRelief.name, antibiotics.name);

  // Create sample sub-categories
  const nsaids = await prisma.category.upsert({
    where: { id: 'nsaids-subcategory' },
    update: {},
    create: {
      id: 'nsaids-subcategory',
      name: 'NSAIDs',
      parentId: painRelief.id,
    },
  });

  console.log('Created sub-category:', nsaids.name);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
