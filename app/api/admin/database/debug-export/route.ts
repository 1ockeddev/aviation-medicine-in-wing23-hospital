import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * Debug Export File API
 * 
 * Analyzes an export file to find issues
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const importData = await request.json();

    if (!importData.data || !importData.data.categories) {
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 400 });
    }

    const categories = importData.data.categories;
    
    // Build category ID set
    const categoryIds = new Set(categories.map((c: any) => c.id));
    
    // Find problematic categories
    const rootCategories = categories.filter((c: any) => !c.parentId || c.parentId === '');
    const orphanedCategories = categories.filter((c: any) => 
      c.parentId && c.parentId !== '' && !categoryIds.has(c.parentId)
    );
    
    // Find categories that have problematic names
    const problematicNames = ['Gastro-intestinal system', 'Antacids and other drugs for dyspepsia', 'Antispasmodics and other drugs altering gut motility'];
    const problematicCategories = categories.filter((c: any) => 
      problematicNames.includes(c.name)
    );
    
    // Analyze hierarchy
    const hierarchyInfo = problematicCategories.map((c: any) => {
      const parent = c.parentId ? categories.find((p: any) => p.id === c.parentId) : null;
      return {
        id: c.id,
        name: c.name,
        parentId: c.parentId,
        parentIdType: typeof c.parentId,
        parentIdEmpty: c.parentId === '',
        parentIdNull: c.parentId === null,
        parentExists: parent !== undefined,
        parentName: parent?.name || 'NOT FOUND',
        parentIdInSet: categoryIds.has(c.parentId),
      };
    });

    const report = {
      totalCategories: categories.length,
      rootCategories: rootCategories.length,
      orphanedCategories: orphanedCategories.length,
      sampleRootCategories: rootCategories.slice(0, 5).map((c: any) => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId,
      })),
      orphanedCategoriesList: orphanedCategories.map((c: any) => ({
        id: c.id,
        name: c.name,
        parentId: c.parentId,
        parentIdType: typeof c.parentId,
      })),
      problematicCategoriesAnalysis: hierarchyInfo,
      allCategoryIds: Array.from(categoryIds).slice(0, 10),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Failed to debug', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
