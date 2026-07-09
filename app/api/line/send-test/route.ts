import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendTestNotification } from '@/lib/line-messaging';

/**
 * POST /api/line/send-test
 * 
 * Sends a test notification to a LINE user.
 * Requires admin authentication.
 * 
 * Request body:
 * - lineUserId: LINE user ID to send test notification to
 * 
 * Response:
 * - 200: { success: true }
 * - 401: { error: 'Unauthorized' }
 * - 500: { error: string }
 * 
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 12.1
 */
export async function POST(request: NextRequest) {
  const operation = 'SEND_TEST_NOTIFICATION';
  let userId: string | undefined;
  let adminUser: string | undefined;

  try {
    // Check admin authentication (Requirement 5.1)
    const session = await auth();
    
    // Return 401 if not authenticated (Requirement 5.1)
    if (!session) {
      console.error('Authentication failed', {
        operation,
        reason: 'No session',
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    adminUser = session.user?.username || session.user?.id;

    // Extract lineUserId from request body (Requirement 5.1)
    const { lineUserId } = await request.json();

    if (!lineUserId) {
      console.error('Invalid request', {
        operation,
        adminUser,
        reason: 'Missing lineUserId',
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { error: 'lineUserId is required' },
        { status: 400 }
      );
    }

    userId = lineUserId;

    // Log test notification attempt (Requirement 5.5, 12.1)
    console.log('Test notification initiated', {
      operation,
      userId,
      adminUser,
      timestamp: new Date().toISOString(),
    });

    // Call sendTestNotification with lineUserId (Requirement 5.2)
    const result = await sendTestNotification(lineUserId);

    // Log result status (Requirement 5.5, 12.1)
    if (result.success) {
      console.log('Test notification sent successfully', {
        operation,
        userId,
        adminUser,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    } else {
      // Log LINE Messaging API error (Requirement 12.1)
      console.error('Test notification failed', {
        operation,
        userId,
        adminUser,
        status: 'failed',
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    // Return success or error response based on result (Requirement 5.3, 5.4)
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send test notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    // Log all errors with comprehensive context (Requirement 5.5, 12.1)
    console.error('Send test notification error', {
      operation,
      userId,
      adminUser,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
