import { NextRequest, NextResponse } from 'next/server';
import { checkAndNotifyExpiringMedications } from '@/lib/notification';

/**
 * Scheduled expiration check endpoint
 * 
 * This endpoint:
 * 1. Verifies authorization header matches CRON_SECRET from environment
 * 2. Returns 401 if authorization fails
 * 3. Calls checkAndNotifyExpiringMedications
 * 4. Returns response with notificationsSent count and duration
 * 5. Logs cron job execution with status
 * 
 * **Validates: Requirements 7.1, 7.5, 12.4**
 */
export async function GET(request: NextRequest) {
  const operation = 'SCHEDULED_EXPIRY_CHECK';

  try {
    // Verify cron secret (for Vercel Cron Jobs or external schedulers)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
    
    if (authHeader !== expectedAuth) {
      // Log unauthorized cron attempt
      console.error('Unauthorized cron job attempt', {
        operation,
        receivedAuth: authHeader ? 'Bearer ***' : 'null',
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log scheduled job execution start (Requirement 12.4)
    console.log('Cron job started', {
      operation,
      endpoint: '/api/cron/check-expiry',
      timestamp: new Date().toISOString(),
    });

    // Call notification service
    const result = await checkAndNotifyExpiringMedications();

    // Log scheduled job execution completion (Requirement 12.4)
    console.log('Cron job completed successfully', {
      operation,
      endpoint: '/api/cron/check-expiry',
      notificationsSent: result.count,
      durationMs: result.duration,
      status: 'success',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      notificationsSent: result.count,
      duration: result.duration,
    });
  } catch (error: any) {
    // Log scheduled job execution failure (Requirement 12.4)
    console.error('Cron job failed', {
      operation,
      endpoint: '/api/cron/check-expiry',
      error: error.message,
      stack: error.stack,
      status: 'failed',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Cron job failed', details: error.message },
      { status: 500 }
    );
  }
}
