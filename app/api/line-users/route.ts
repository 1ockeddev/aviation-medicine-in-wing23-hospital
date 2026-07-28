import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Get LINE Users
 * 
 * GET /api/line-users
 */
export async function GET(request: NextRequest) {
  try {
    const users = await prisma.lineUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        lineUserId: true,
        displayName: true,
        pictureUrl: true,
        notificationsEnabled: true,
        daysBeforeExpiration: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error('Error fetching LINE users', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to fetch LINE users' },
      { status: 500 }
    );
  }
}
