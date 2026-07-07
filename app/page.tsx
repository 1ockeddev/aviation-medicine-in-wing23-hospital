import { prisma } from '@/lib/prisma';
import { HomeClientPage } from './HomeClientPage';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getMedications() {
  return await prisma.medication.findMany({
    include: {
      category: true,
    },
    orderBy: [
      { name: 'asc' },
    ],
  });
}

async function getCategories() {
  // Get all categories with their children (3 levels deep)
  const allCategories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          medications: true,
        },
      },
      children: {
        include: {
          _count: {
            select: {
              medications: true,
            },
          },
          children: {
            include: {
              _count: {
                select: {
                  medications: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
    where: {
      parentId: null, // Only get top-level categories (Level 1)
    },
    orderBy: {
      order: 'asc',
    },
  });

  return allCategories;
}

export default async function Home() {
  const [medications, categories] = await Promise.all([
    getMedications(),
    getCategories(),
  ]);

  return <HomeClientPage medications={medications} categories={categories} />;
}
