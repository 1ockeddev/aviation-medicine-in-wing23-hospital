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

      try {
        // Delete in reverse dependency order
        const deletedMedications = await tx.medication.deleteMany({});
        console.log('Deleted medications', { count: deletedMedications.count });

        const deletedLineUsers = await tx.lineUser.deleteMany({});
        console.log('Deleted LINE users', { count: deletedLineUsers.count });

        const deletedCategories = await tx.category.deleteMany({});
        console.log('Deleted categories', { count: deletedCategories.count });
        
        // Don't delete users - keep existing admin users
      } catch (deleteError) {
        console.error('Error deleting data', {
          error: deleteError instanceof Error ? deleteError.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        throw deleteError;
      }

      // Step 2: Import new data (in correct order)
      console.log('Importing new data', {
        operation,
        timestamp: new Date().toISOString(),
      });

      // Import categories (must import in correct order: parent before children)
      let categoriesImported = 0;
      let categoriesSkipped = 0;
      let categoriesReparented = 0;
      const orphanedCategories: Array<{ id: string; name: string; missingParentId: string }> = [];

      if (data.categories && Array.isArray(data.categories)) {
        console.log('Importing categories', {
          totalCount: data.categories.length,
          timestamp: new Date().toISOString(),
        });

        // Build a set of all category IDs in the import file
        const availableCategoryIds = new Set(data.categories.map((c: any) => c.id));

        console.log('Category IDs check', {
          totalCategories: data.categories.length,
          uniqueIds: availableCategoryIds.size,
          sampleCategories: data.categories.slice(0, 5).map((c: any) => ({
            id: c.id,
            name: c.name,
            parentId: c.parentId,
          })),
        });

        // Identify orphaned categories (categories with missing parents)
        const orphanedCategoryIds = new Set<string>();
        data.categories.forEach((category: any) => {
          // Check if parentId exists and is not in the available IDs
          // Also handle empty string as null
          const normalizedParentId = category.parentId === '' ? null : category.parentId;
          
          if (normalizedParentId && !availableCategoryIds.has(normalizedParentId)) {
            orphanedCategoryIds.add(category.id);
            orphanedCategories.push({
              id: category.id,
              name: category.name,
              missingParentId: normalizedParentId,
            });
            console.warn('Found orphaned category', {
              categoryId: category.id,
              categoryName: category.name,
              missingParentId: normalizedParentId,
              parentIdExists: availableCategoryIds.has(normalizedParentId),
            });
          }
        });

        // Fix orphaned categories by moving them to root level
        const fixedCategories = data.categories.map((category: any) => {
          // Normalize parentId (empty string -> null)
          const normalizedParentId = category.parentId === '' ? null : category.parentId;
          
          if (orphanedCategoryIds.has(category.id)) {
            categoriesReparented++;
            return {
              ...category,
              parentId: null, // Move to root level
            };
          }
          return {
            ...category,
            parentId: normalizedParentId, // Use normalized parentId
          };
        });

        console.log('Categories validation', {
          total: data.categories.length,
          orphaned: orphanedCategories.length,
          reparented: categoriesReparented,
        });

        if (fixedCategories.length === 0) {
          console.log('No categories to import');
        } else {
          // Sort categories by hierarchy level (parents first)
          const sortedCategories = [...fixedCategories].sort((a: any, b: any) => {
            // null parentId comes first (root categories)
            if (!a.parentId && b.parentId) return -1;
            if (a.parentId && !b.parentId) return 1;
            return 0;
          });

          // Create a map to track which categories have been created
          const createdCategoryIds = new Set<string>();
          const remainingCategories = [...sortedCategories];
          let maxIterations = fixedCategories.length * 2;
          let iteration = 0;

          // Import categories in multiple passes until all are created
          while (remainingCategories.length > 0 && iteration < maxIterations) {
            iteration++;
            const categoriesToRetry: typeof remainingCategories = [];
            let importedThisIteration = 0;

            for (const category of remainingCategories) {
              // Check if parent exists (either null or already created)
              const canCreate = !category.parentId || createdCategoryIds.has(category.parentId);

              if (canCreate) {
                try {
                  await tx.category.create({
                    data: {
                      id: category.id,
                      name: category.name,
                      parentId: category.parentId,
                      order: category.order,
                      createdAt: new Date(category.createdAt),
                      updatedAt: new Date(category.updatedAt),
                    },
                  });
                  createdCategoryIds.add(category.id);
                  categoriesImported++;
                  importedThisIteration++;
                  
                  if (categoriesImported % 10 === 0 || categoriesImported === fixedCategories.length) {
                    console.log('Category import progress', {
                      progress: `${categoriesImported}/${fixedCategories.length}`,
                      iteration,
                    });
                  }
                } catch (catError) {
                  console.error('Error importing category', {
                    categoryId: category.id,
                    categoryName: category.name,
                    parentId: category.parentId,
                    error: catError instanceof Error ? catError.message : 'Unknown error',
                  });
                  throw catError;
                }
              } else {
                // Parent not created yet, retry in next iteration
                categoriesToRetry.push(category);
              }
            }

            // Update remaining categories for next iteration
            const previousCount = remainingCategories.length;
            remainingCategories.length = 0;
            remainingCategories.push(...categoriesToRetry);

            // Log progress
            if (categoriesToRetry.length > 0) {
              console.log('Categories waiting for parents', {
                remaining: categoriesToRetry.length,
                importedThisIteration,
                iteration,
                totalImported: categoriesImported,
              });
            }

            // If no progress was made in this iteration, we're stuck
            if (categoriesToRetry.length > 0 && importedThisIteration === 0) {
              // No categories were imported in this iteration - their parents are truly missing
              const problematicCategories = categoriesToRetry.slice(0, 10).map(c => ({
                id: c.id,
                name: c.name,
                parentId: c.parentId,
                parentIdInFixed: c.parentId ? fixedCategories.some((fc: any) => fc.id === c.parentId) : 'null',
                parentIdCreated: c.parentId ? createdCategoryIds.has(c.parentId) : 'null',
              }));
              
              console.error('Cannot import remaining categories - DETAILED DEBUG', {
                remainingCount: categoriesToRetry.length,
                iteration,
                importedThisIteration: 0,
                totalImported: categoriesImported,
                sample: problematicCategories,
                allCreatedIds: Array.from(createdCategoryIds).slice(0, 10),
              });
              
              throw new Error(
                `Cannot import ${categoriesToRetry.length} categories. ` +
                `Their parent categories are missing from the import file. ` +
                `Sample: ${categoriesToRetry.slice(0, 3).map(c => c.name).join(', ')}`
              );
            }
          }

          console.log('All categories imported', {
            totalImported: categoriesImported,
            reparented: categoriesReparented,
            skipped: categoriesSkipped,
            iterations: iteration,
          });
        }
      }

      // Import medications
      let medicationsImported = 0;
      if (data.medications && Array.isArray(data.medications)) {
        for (const medication of data.medications) {
          try {
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
                createdAt: new Date(medication.createdAt),
                updatedAt: new Date(medication.updatedAt),
              },
            });
            medicationsImported++;
          } catch (medError) {
            console.error('Error importing medication', {
              medicationId: medication.id,
              medicationName: medication.name,
              error: medError instanceof Error ? medError.message : 'Unknown error',
            });
            throw medError;
          }
        }
      }

      // Import LINE users
      let lineUsersImported = 0;
      if (data.lineUsers && Array.isArray(data.lineUsers)) {
        for (const lineUser of data.lineUsers) {
          try {
            await tx.lineUser.create({
              data: {
                id: lineUser.id,
                lineUserId: lineUser.lineUserId,
                displayName: lineUser.displayName,
                pictureUrl: lineUser.pictureUrl,
                notificationsEnabled: lineUser.notificationsEnabled,
                daysBeforeExpiration: lineUser.daysBeforeExpiration,
                createdAt: new Date(lineUser.createdAt),
                updatedAt: new Date(lineUser.updatedAt),
              },
            });
            lineUsersImported++;
          } catch (lineUserError) {
            console.error('Error importing LINE user', {
              lineUserId: lineUser.lineUserId,
              displayName: lineUser.displayName,
              error: lineUserError instanceof Error ? lineUserError.message : 'Unknown error',
            });
            throw lineUserError;
          }
        }
      }

      return {
        categoriesImported,
        categoriesReparented,
        medicationsImported,
        lineUsersImported,
        orphanedCategories,
      };
    }, {
      timeout: 30000, // 30 seconds timeout
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
