import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendExpiryNotification } from '@/lib/line-messaging';

/**
 * POST /api/line/send-expiry-notification
 * 
 * Sends expiry notification with real medication data to a LINE user.
 * Fetches medications expiring within 30 days and sends as Flex Message.
 * Requires admin authentication.
 * 
 * Request body:
 * - lineUserId: LINE user ID to send notification to
 * 
 * Response:
 * - 200: { success: true, medicationCount: number }
 * - 401: { error: 'Unauthorized' }
 * - 404: { error: 'No medications found expiring soon' }
 * - 500: { error: string }
 */
export async function POST(request: NextRequest) {
  const operation = 'SEND_EXPIRY_NOTIFICATION';
  let userId: string | undefined;
  let adminUser: string | undefined;

  try {
    // Check admin authentication
    const session = await auth();
    
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

    // Extract lineUserId from request body
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

    // Log notification attempt
    console.log('Expiry notification initiated', {
      operation,
      userId,
      adminUser,
      timestamp: new Date().toISOString(),
    });

    // Send notification with real medication data
    const result = await sendExpiryNotification(lineUserId);

    // Log result status
    if (result.success) {
      console.log('Expiry notification sent successfully', {
        operation,
        userId,
        adminUser,
        medicationCount: result.medicationCount,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error('Expiry notification failed', {
        operation,
        userId,
        adminUser,
        status: 'failed',
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }

    // Return response
    if (result.success) {
      return NextResponse.json({ 
        success: true,
        medicationCount: result.medicationCount 
      });
    } else {
      const statusCode = result.error === 'No medications found expiring soon' ? 404 : 500;
      return NextResponse.json(
        { error: result.error || 'Failed to send expiry notification' },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error('Send expiry notification error', {
      operation,
      userId,
      adminUser,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to send expiry notification' },
      { status: 500 }
    );
  }
}
