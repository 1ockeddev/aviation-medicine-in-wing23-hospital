import { prisma } from '@/lib/prisma';
import { CategoriesClientPage } from './CategoriesClientPage';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: {
      parentId: null,
    },
    include: {
      children: {
        include: {
          children: {
            include: {
              _count: {
                select: { medications: true },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
          _count: {
            select: { medications: true },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
      _count: {
        select: { medications: true },
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  return categories;
}

async function getAllParentCategories() {
  // Get full hierarchy to build numbering
  const level1Categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        include: {
          children: {
            select: { id: true }, // Only need id to check existence
          },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  // Flatten with numbering - ensure plain objects for serialization
  const flattenWithNumbers: { id: string; name: string; number: string }[] = [];

  level1Categories.forEach((level1, i) => {
    flattenWithNumbers.push({
      id: level1.id,
      name: level1.name,
      number: `${i + 1}`,
    });

    level1.children.forEach((level2, j) => {
      flattenWithNumbers.push({
        id: level2.id,
        name: level2.name,
        number: `${i + 1}.${j + 1}`,
      });

      // Level 3 cannot be parents, so we don't include them
    });
  });

  return flattenWithNumbers;
}

export default async function CategoriesPage() {
  const [categories, parentCategories] = await Promise.all([
    getCategories(),
    getAllParentCategories(),
  ]);

  return <CategoriesClientPage categories={categories} parentCategories={parentCategories} />;
}
