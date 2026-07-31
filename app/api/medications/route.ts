import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/medications
 * Returns all medications with their categories
 */
export async function GET() {
  try {
    // Fetch all medications with category information
    const medications = await prisma.medication.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Fetch all categories for the form dropdown (only Level 3 categories that can contain medications)
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        number: true,
        parentId: true,
      },
      orderBy: {
        number: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      medications,
      categories,
    });
  } catch (error) {
    console.error('Medications fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medications' },
      { status: 500 }
    );
  }
}
