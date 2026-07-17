import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Import Database API
 * 
 * Imports database from JSON file exported by export endpoint
 * 
 * WARNING: This will DELETE all existing data and replace with imported data
 * 
 * Process:
 * 1. Validate import data structure
 * 2. Delete existing data (in correct order to handle foreign keys)
 * 3. Import new data (in correct order)
 * 4. Return import summary
 */
export async function POST(request: NextRequest) {
  const operation = 'IMPORT_DATABASE';

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Database import started', {
      operation,
      user: session.user.username,
      timestamp: new Date().toISOString(),
    });

    // Parse request body
    const importData = await request.json();

    // Validate import data structure
    if (!importData.data || !importData.metadata) {
      return NextResponse.json(
        { error: 'Invalid import file structure' },
        { status: 400 }
      );
    }

    const { data } = importData;

    console.log('Import data validated', {
      operation,
      metadata: importData.metadata,
      counts: importData.counts,
      timestamp: new Date().toISOString(),
    });

    // Use transaction to ensure all-or-nothing import
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Delete existing data (in correct order to respect foreign keys)
      console.log('Deleting existing data', {
        operation,
        timestamp: new Date().toISOString(),
      });

      // Delete in reverse dependency order
      await tx.medication.deleteMany({});
      await tx.lineUser.deleteMany({});
      await tx.category.deleteMany({});
      // Don't delete users - keep existing admin users

      // Step 2: Import new data (in correct order)
      console.log('Importing new data', {
        operation,
        timestamp: new Date().toISOString(),
      });

      // Import categories
      let categoriesImported = 0;
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          await tx.category.create({
            data: {
              id: category.id,
              name: category.name,
              parentId: category.parentId,
              order: category.order,
              createdAt: category.createdAt,
              updatedAt: category.updatedAt,
            },
          });
          categoriesImported++;
        }
      }

      // Import medications
      let medicationsImported = 0;
      if (data.medications && Array.isArray(data.medications)) {
        for (const medication of data.medications) {
          await tx.medication.create({
            data: {
              id: medication.id,
              name: medication.name,
              tradeName: medication.tradeName,
              expirationDate: medication.expirationDate ? new Date(medication.expirationDate) : null,
              status: medication.status,
              dose: medication.dose,
              doseDetails: medication.doseDetails,
              halfLife: medication.halfLife,
              sideEffects: medication.sideEffects,
              notes: medication.notes,
              categoryId: medication.categoryId,
              createdAt: medication.createdAt,
              updatedAt: medication.updatedAt,
            },
          });
          medicationsImported++;
        }
      }

      // Import LINE users
      let lineUsersImported = 0;
      if (data.lineUsers && Array.isArray(data.lineUsers)) {
        for (const lineUser of data.lineUsers) {
          await tx.lineUser.create({
            data: {
              id: lineUser.id,
              lineUserId: lineUser.lineUserId,
              displayName: lineUser.displayName,
              pictureUrl: lineUser.pictureUrl,
              notificationsEnabled: lineUser.notificationsEnabled,
              daysBeforeExpiration: lineUser.daysBeforeExpiration,
              createdAt: lineUser.createdAt,
              updatedAt: lineUser.updatedAt,
            },
          });
          lineUsersImported++;
        }
      }

      return {
        categoriesImported,
        medicationsImported,
        lineUsersImported,
      };
    });

    console.log('Database import completed', {
      operation,
      result,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Database imported successfully',
      imported: result,
      metadata: importData.metadata,
    });
  } catch (error) {
    console.error('Database import error', {
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { 
        error: 'Failed to import database', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
