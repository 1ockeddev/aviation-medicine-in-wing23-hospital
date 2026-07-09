import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyLiffToken } from '@/lib/line-liff';

/**
 * POST /api/line/register
 * 
 * Registers or updates a LINE user in the system.
 * 
 * Request body:
 * - accessToken: LIFF access token from LINE Mini App
 * 
 * Response:
 * - 200: { success: true, user: LineUser }
 * - 401: { error: 'Invalid access token' }
 * - 500: { error: 'Registration failed' }
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 11.1, 11.2, 11.3, 11.4, 11.5, 12.2
 */
export async function POST(request: NextRequest) {
  const operation = 'LINE_USER_REGISTRATION';
  let userId: string | undefined;

  try {
    const { accessToken } = await request.json();

    // Verify LIFF access token (Requirement 1.1, 11.2)
    const profile = await verifyLiffToken(accessToken);

    // Return 401 if token verification fails (Requirement 1.5, 11.5)
    if (!profile) {
      // Log LIFF authentication failure (Requirement 12.2)
      console.error('LIFF authentication failed', {
        operation,
        reason: 'Invalid access token',
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    userId = profile.userId;

    // Log successful authentication
    console.log('LIFF authentication successful', {
      operation,
      userId,
      displayName: profile.displayName,
      timestamp: new Date().toISOString(),
    });

    // Upsert LineUser - create or update based on lineUserId (Requirement 1.3)
    // Set default preferences: notificationsEnabled=true, daysBeforeExpiration=30 (Requirement 1.4)
    const lineUser = await prisma.lineUser.upsert({
      where: { lineUserId: profile.userId },
      update: {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
      },
      create: {
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      },
    });

    // Log successful registration/update
    console.log('User registration/update successful', {
      operation,
      userId,
      displayName: profile.displayName,
      timestamp: new Date().toISOString(),
    });

    // Return success response with user data (Requirement 11.4)
    return NextResponse.json({ success: true, user: lineUser });
  } catch (error) {
    // Log errors with comprehensive context (Requirement 12.2, 12.3)
    console.error('Registration error', {
      operation,
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
