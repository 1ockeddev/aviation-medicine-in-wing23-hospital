import { prisma } from '@/lib/prisma';
import { sendPushMessage } from './line-messaging';
import { createExpirationFlexMessage } from './flex-messages';

/**
 * Result object returned from notification check operation
 */
interface NotificationResult {
  count: number;
  duration: number;
}

/**
 * Check for expiring medications and send notifications to enabled LINE users
 * 
 * This function:
 * 1. Queries all LineUsers with notificationsEnabled = true
 * 2. For each user, calculates threshold date using daysBeforeExpiration
 * 3. Queries medications where expirationDate is between now and threshold date
 * 4. Filters medications with status 'Y' or 'Y*' (active only)
 * 5. Sorts medications by expirationDate ascending
 * 6. Generates Flex Message using createExpirationFlexMessage
 * 7. Sends notification using sendPushMessage
 * 8. Logs start time, end time, and notification count
 * 9. Handles errors per user (continues processing if one fails)
 * 
 * @returns NotificationResult with count of notifications sent and duration in ms
 * 
 * **Validates: Requirements 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5, 9.5, 12.4, 12.5**
 */
export async function checkAndNotifyExpiringMedications(): Promise<NotificationResult> {
  const operation = 'CHECK_AND_NOTIFY_EXPIRING_MEDICATIONS';
  const startTime = Date.now();
  let notificationCount = 0;

  console.log('Starting expiration notification check', {
    operation,
    timestamp: new Date().toISOString(),
  });

  try {
    // Get all users with notifications enabled
    const users = await prisma.lineUser.findMany({
      where: { notificationsEnabled: true },
    });

    console.log('Retrieved enabled users', {
      operation,
      userCount: users.length,
      timestamp: new Date().toISOString(),
    });

    for (const user of users) {
      try {
        // Calculate threshold date
        const now = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + user.daysBeforeExpiration);

        console.log('Processing user notifications', {
          operation,
          userId: user.lineUserId,
          displayName: user.displayName,
          daysBeforeExpiration: user.daysBeforeExpiration,
          thresholdDate: thresholdDate.toISOString(),
          timestamp: new Date().toISOString(),
        });

        // Find expiring medications
        const expiringMedications = await prisma.medication.findMany({
          where: {
            expirationDate: {
              gte: now,
              lte: thresholdDate,
            },
            status: {
              in: ['Y', 'Y*'], // Only active medications
            },
          },
          include: {
            category: true,
          },
          orderBy: {
            expirationDate: 'asc',
          },
        });

        console.log('Found expiring medications', {
          operation,
          userId: user.lineUserId,
          displayName: user.displayName,
          medicationCount: expiringMedications.length,
          timestamp: new Date().toISOString(),
        });

        // Send notification if there are expiring medications
        if (expiringMedications.length > 0) {
          const flexMessage = createExpirationFlexMessage(expiringMedications);
          const result = await sendPushMessage(user.lineUserId, [flexMessage]);

          if (result.success) {
            notificationCount++;
            console.log('Notification sent successfully', {
              operation,
              userId: user.lineUserId,
              displayName: user.displayName,
              medicationCount: expiringMedications.length,
              timestamp: new Date().toISOString(),
            });
          } else {
            // Log notification failure (Requirement 12.5 - continue processing)
            console.error('Failed to send notification', {
              operation,
              userId: user.lineUserId,
              displayName: user.displayName,
              error: result.error,
              timestamp: new Date().toISOString(),
            });
          }
        }
      } catch (error: any) {
        // Log critical error per user (Requirement 12.5 - continue processing remaining users)
        console.error('Critical error processing user', {
          operation,
          userId: user.lineUserId,
          displayName: user.displayName,
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        });
        // Continue with next user - requirement 12.5
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('Notification check completed', {
      operation,
      notificationsSent: notificationCount,
      durationMs: duration,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      status: 'success',
    });

    return { count: notificationCount, duration };
  } catch (error: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log notification check failure
    console.error('Notification check failed', {
      operation,
      error: error.message,
      stack: error.stack,
      durationMs: duration,
      notificationsSent: notificationCount,
      timestamp: new Date().toISOString(),
      status: 'failed',
    });

    throw error;
  }
}
