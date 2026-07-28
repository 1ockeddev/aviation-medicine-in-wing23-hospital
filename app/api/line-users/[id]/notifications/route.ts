import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Update LINE User Notification Settings
 * 
 * PATCH /api/line-users/[id]/notifications
 * Body: { notificationsEnabled: boolean, daysBeforeExpiration?: number }
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { notificationsEnabled, daysBeforeExpiration } = body;

    console.log('Updating notification settings', {
      userId: id,
      notificationsEnabled,
      daysBeforeExpiration,
      timestamp: new Date().toISOString(),
    });

    // Validate input
    if (typeof notificationsEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'notificationsEnabled must be a boolean' },
        { status: 400 }
      );
    }

    // Update user settings
    const updateData: any = {
      notificationsEnabled,
      updatedAt: new Date(),
    };

    if (daysBeforeExpiration !== undefined) {
      const days = parseInt(daysBeforeExpiration);
      if (isNaN(days) || days < 0 || days > 365) {
        return NextResponse.json(
          { error: 'daysBeforeExpiration must be between 0 and 365' },
          { status: 400 }
        );
      }
      updateData.daysBeforeExpiration = days;
    }

    const user = await prisma.lineUser.update({
      where: { id },
      data: updateData,
    });

    console.log('Notification settings updated', {
      userId: id,
      notificationsEnabled: user.notificationsEnabled,
      daysBeforeExpiration: user.daysBeforeExpiration,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        notificationsEnabled: user.notificationsEnabled,
        daysBeforeExpiration: user.daysBeforeExpiration,
      },
    });
  } catch (error) {
    console.error('Error updating notification settings', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { 
        error: 'Failed to update notification settings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
