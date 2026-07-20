import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Validate Database Import File API
 * 
 * Validates an export file before importing to detect issues:
 * - Missing parent categories
 * - Orphaned categories
 * - Invalid data structure
 * - Circular references
 * 
 * Returns validation report without modifying database
 */
export async function POST(request: NextRequest) {
  const operation = 'VALIDATE_IMPORT';

  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Database validation started', {
      operation,
      user: session.user.username,
      timestamp: new Date().toISOString(),
    });

    // Parse request body
    const importData = await request.json();

    // Validate import data structure
    if (!importData.data || !importData.metadata) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Invalid import file structure',
          details: 'Missing required fields: data and/or metadata',
        },
        { status: 400 }
      );
    }

    const { data } = importData;
    const issues: string[] = [];
    const warnings: string[] = [];

    // Validate categories
    const orphanedCategories: Array<{ id: string; name: string; missingParentId: string }> = [];
    const categoryIssues: string[] = [];

    if (data.categories && Array.isArray(data.categories)) {
      const availableCategoryIds = new Set(data.categories.map((c: any) => c.id));

      // Check for orphaned categories
      data.categories.forEach((category: any) => {
        if (category.parentId && !availableCategoryIds.has(category.parentId)) {
          orphanedCategories.push({
            id: category.id,
            name: category.name,
            missingParentId: category.parentId,
          });
        }
      });

      if (orphanedCategories.length > 0) {
        warnings.push(
          `Found ${orphanedCategories.length} orphaned categories (will be moved to root level during import)`
        );
      }

      // Check for circular references
      const checkCircularRef = (categoryId: string, visited = new Set<string>()): boolean => {
        if (visited.has(categoryId)) return true;
        visited.add(categoryId);

        const category = data.categories.find((c: any) => c.id === categoryId);
        if (!category || !category.parentId) return false;

        return checkCircularRef(category.parentId, visited);
      };

      const circularRefs = data.categories.filter((c: any) => checkCircularRef(c.id));
      if (circularRefs.length > 0) {
        issues.push(
          `Found ${circularRefs.length} categories with circular references: ${circularRefs.slice(0, 3).map((c: any) => c.name).join(', ')}`
        );
      }
    } else {
      categoryIssues.push('No categories found in import file');
    }

    // Validate medications
    const medicationIssues: string[] = [];
    if (data.medications && Array.isArray(data.medications)) {
      const categoryIds = new Set(data.categories?.map((c: any) => c.id) || []);
      const orphanedMedications = data.medications.filter((m: any) => !categoryIds.has(m.categoryId));
      
      if (orphanedMedications.length > 0) {
        issues.push(
          `Found ${orphanedMedications.length} medications referencing non-existent categories`
        );
      }
    } else {
      medicationIssues.push('No medications found in import file');
    }

    // Build validation report
    const report = {
      valid: issues.length === 0,
      metadata: importData.metadata,
      counts: {
        categories: data.categories?.length || 0,
        medications: data.medications?.length || 0,
        lineUsers: data.lineUsers?.length || 0,
      },
      issues,
      warnings,
      orphanedCategories: orphanedCategories.slice(0, 20), // Limit to first 20
      categoryIssues,
      medicationIssues,
    };

    console.log('Database validation completed', {
      operation,
      valid: report.valid,
      issueCount: issues.length,
      warningCount: warnings.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Database validation error', {
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { 
        valid: false,
        error: 'Failed to validate import file', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
