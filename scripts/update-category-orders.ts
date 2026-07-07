import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateOrders() {
  console.log('Updating category orders...');

  // Get all parent categories
  const parentCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' }
  });

  console.log(`Found ${parentCategories.length} parent categories`);

  // Update parent categories order
  for (let i = 0; i < parentCategories.length; i++) {
    await prisma.category.update({
      where: { id: parentCategories[i].id },
      data: { order: i }
    });
    console.log(`Updated order for parent: ${parentCategories[i].name} -> ${i}`);

    // Update children order
    const children = await prisma.category.findMany({
      where: { parentId: parentCategories[i].id },
      orderBy: { name: 'asc' }
    });

    for (let j = 0; j < children.length; j++) {
      await prisma.category.update({
        where: { id: children[j].id },
        data: { order: j }
      });
      console.log(`  Updated order for child: ${children[j].name} -> ${j}`);
    }
  }

  console.log('✅ Updated order for all categories');
}

updateOrders()
  .catch((error) => {
    console.error('Error updating orders:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
