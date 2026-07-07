import { prisma } from '@/lib/prisma';
import { MedicationsClientPage } from './MedicationsClientPage';

async function getMedications() {
  return await prisma.medication.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getCategories() {
  // Get categories with full hierarchy to build numbering
  const level1Categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: true,
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  // Flatten categories with numbering
  const categoriesWithNumbers: Array<{
    id: string;
    name: string;
    parentId: string | null;
    order: number;
    number: string;
  }> = [];

  level1Categories.forEach((level1, i) => {
    categoriesWithNumbers.push({
      id: level1.id,
      name: level1.name,
      parentId: level1.parentId,
      order: level1.order,
      number: `${i + 1}`,
    });

    level1.children.forEach((level2, j) => {
      categoriesWithNumbers.push({
        id: level2.id,
        name: level2.name,
        parentId: level2.parentId,
        order: level2.order,
        number: `${i + 1}.${j + 1}`,
      });

      level2.children.forEach((level3, k) => {
        categoriesWithNumbers.push({
          id: level3.id,
          name: level3.name,
          parentId: level3.parentId,
          order: level3.order,
          number: `${i + 1}.${j + 1}.${k + 1}`,
        });
      });
    });
  });

  return categoriesWithNumbers;
}

export default async function MedicationsPage() {
  const [medications, categories] = await Promise.all([
    getMedications(),
    getCategories(),
  ]);

  return <MedicationsClientPage medications={medications} categories={categories} />;
}

