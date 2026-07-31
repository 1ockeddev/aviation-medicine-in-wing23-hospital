import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/line/register
 * Register or update LINE user in database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName, pictureUrl } = body;

    if (!userId || !displayName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert user (insert or update if exists)
    const user = await prisma.lineUser.upsert({
      where: { lineUserId: userId },
      update: {
        displayName,
        pictureUrl: pictureUrl || null,
      },
      create: {
        lineUserId: userId,
        displayName,
        pictureUrl: pictureUrl || null,
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('LINE user registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
