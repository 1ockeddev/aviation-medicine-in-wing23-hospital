import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Export Database API
 * 
 * Exports complete database including:
 * - Structure (schema info)
 * - Data (all tables)
 * 
 * Returns JSON format ready for import
 */
export async function GET(request: NextRequest) {
  const operation = 'EXPORT_DATABASE';

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Database export started', {
      operation,
      user: session.user.username,
      timestamp: new Date().toISOString(),
    });

    // Export all data
    const [
      users,
      allCategories,
      medications,
      lineUsers,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          // Exclude password for security
        },
      }),
      // Get ALL categories (including parents)
      prisma.category.findMany({
        orderBy: { order: 'asc' },
      }),
      prisma.medication.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.lineUser.findMany({
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    console.log('Data fetched', {
      operation,
      counts: {
        users: users.length,
        categories: allCategories.length,
        medications: medications.length,
        lineUsers: lineUsers.length,
      },
    });

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: session.user.username,
        version: '1.0',
        tables: ['users', 'categories', 'medications', 'lineUsers'],
      },
      data: {
        users,
        categories: allCategories,
        medications,
        lineUsers,
      },
      counts: {
        users: users.length,
        categories: allCategories.length,
        medications: medications.length,
        lineUsers: lineUsers.length,
      },
    };

    console.log('Database export completed', {
      operation,
      counts: exportData.counts,
      timestamp: new Date().toISOString(),
    });

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="database-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Database export error', {
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to export database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
