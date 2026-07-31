import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/medications
 * Returns all medications with their categories
 */
export async function GET() {
  try {
    // Fetch all categories with hierarchy info to generate numbering
    const level1Categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: {
              select: { id: true, name: true, order: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Create a map of category ID to number
    const categoryNumberMap = new Map<string, string>();
    
    level1Categories.forEach((level1, i) => {
      const level1Number = `${i + 1}`;
      categoryNumberMap.set(level1.id, level1Number);

      level1.children.forEach((level2, j) => {
        const level2Number = `${i + 1}.${j + 1}`;
        categoryNumberMap.set(level2.id, level2Number);

        level2.children.forEach((level3, k) => {
          const level3Number = `${i + 1}.${j + 1}.${k + 1}`;
          categoryNumberMap.set(level3.id, level3Number);
        });
      });
    });

    // Fetch all medications with category information
    const medications = await prisma.medication.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Add number to each medication's category
    const medicationsWithNumbers = medications.map(med => ({
      ...med,
      category: {
        ...med.category,
        number: categoryNumberMap.get(med.category.id) || '',
      },
    }));

    // Fetch all categories for the form dropdown
    const allCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parentId: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Add numbers to categories for dropdown
    const categoriesWithNumbers = allCategories.map(cat => ({
      ...cat,
      number: categoryNumberMap.get(cat.id) || '',
    }));

    return NextResponse.json({
      success: true,
      medications: medicationsWithNumbers,
      categories: categoriesWithNumbers,
    });
  } catch (error) {
    console.error('Medications fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medications' },
      { status: 500 }
    );
  }
}
