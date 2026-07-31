import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/categories
 * Returns all categories with hierarchical structure and medication counts
 */
export async function GET() {
  try {
    // Fetch all root categories (Level 1) with nested children
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        _count: {
          select: { medications: true },
        },
        children: {
          include: {
            _count: {
              select: { medications: true },
            },
            children: {
              include: {
                _count: {
                  select: { medications: true },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Add numbering to categories
    const addNumbering = (cats: any[], prefix = ''): any[] => {
      return cats.map((cat, index) => {
        const number = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
        return {
          ...cat,
          number,
          children: cat.children ? addNumbering(cat.children, number) : [],
        };
      });
    };

    const categoriesWithNumbers = addNumbering(categories);

    // Fetch all categories that can be parents (Level 1 and 2 only)
    const level1Categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          select: {
            id: true,
            name: true,
            order: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Flatten with numbering for parent options
    const parentCategories: { id: string; name: string; number: string }[] = [];

    level1Categories.forEach((level1, i) => {
      parentCategories.push({
        id: level1.id,
        name: level1.name,
        number: `${i + 1}`,
      });

      level1.children.forEach((level2, j) => {
        parentCategories.push({
          id: level2.id,
          name: level2.name,
          number: `${i + 1}.${j + 1}`,
        });
      });
    });

    return NextResponse.json({
      success: true,
      categories: categoriesWithNumbers,
      parentCategories,
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
