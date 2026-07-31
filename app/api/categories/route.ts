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

    // Fetch all categories that can be parents (Level 1 and 2 only)
    const parentCategories = await prisma.category.findMany({
      where: {
        OR: [
          { parentId: null }, // Level 1
          {
            parent: {
              parentId: null, // Level 2 (parent is Level 1)
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        number: true,
      },
      orderBy: [{ number: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      categories,
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
