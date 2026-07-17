import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createExpirationFlexMessage } from '@/lib/flex-messages';

/**
 * Preview Flex Message API
 * 
 * Returns the Flex Message JSON for testing in LINE Flex Message Simulator
 * https://developers.line.biz/flex-simulator/
 * 
 * Query parameters:
 * - medicationId: (optional) Specific medication ID to preview
 * - limit: (optional) Number of medications to include (default: 5)
 */
export async function GET(request: NextRequest) {
  const operation = 'PREVIEW_FLEX_MESSAGE';
  
  try {
    const { searchParams } = new URL(request.url);
    const medicationId = searchParams.get('medicationId');
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    console.log('Preview flex message request', {
      operation,
      medicationId,
      limit,
      timestamp: new Date().toISOString(),
    });

    // Build query
    const where: any = {};
    
    if (medicationId) {
      where.id = medicationId;
    } else {
      // Get medications expiring within 30 days
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      where.expirationDate = {
        lte: thirtyDaysFromNow,
        gte: new Date(),
      };
    }

    // Fetch medications with full category hierarchy
    const medications = await prisma.medication.findMany({
      where,
      include: {
        category: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true, // Support up to 4 levels deep
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        expirationDate: 'asc',
      },
      take: limit,
    });

    if (medications.length === 0) {
      return NextResponse.json(
        { 
          error: 'No medications found',
          hint: medicationId 
            ? 'The specified medication ID does not exist'
            : 'No medications expiring within 30 days found. Try adding ?medicationId=<id> to preview a specific medication.',
        },
        { status: 404 }
      );
    }

    console.log('Medications found for preview', {
      operation,
      count: medications.length,
      medications: medications.map(m => ({
        id: m.id,
        name: m.name,
        categoryId: m.categoryId,
        expirationDate: m.expirationDate?.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    });

    // Build full category hierarchy path for each medication
    const medicationsWithFullPath = medications.map(med => {
      // Build category path from root to leaf
      const categoryPath: string[] = [];
      let currentCategory: any = med.category;
      
      // Traverse up to root
      const ancestors: any[] = [];
      while (currentCategory) {
        ancestors.unshift(currentCategory); // Add to beginning
        currentCategory = currentCategory.parent;
      }
      
      // Build path string
      const fullPath = ancestors.map(c => c.name).join(' > ');
      
      return {
        ...med,
        category: {
          ...med.category,
          name: fullPath, // Override name with full path
        },
      };
    });

    // Generate Flex Message
    const flexMessage = createExpirationFlexMessage(medicationsWithFullPath as any);

    console.log('Flex message generated', {
      operation,
      medicationCount: medications.length,
      flexMessageType: flexMessage.type,
      timestamp: new Date().toISOString(),
    });

    // Return JSON for LINE Flex Message Simulator
    return NextResponse.json({
      success: true,
      medicationCount: medications.length,
      flexMessage,
      instructions: {
        simulator: 'https://developers.line.biz/flex-simulator/',
        usage: 'Copy the "flexMessage" object and paste it into LINE Flex Message Simulator',
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        medications: medications.map(m => ({
          id: m.id,
          name: m.name,
          expirationDate: m.expirationDate?.toISOString(),
        })),
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Preview flex message error', {
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { 
        error: 'Failed to generate preview',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
