const LINE_MESSAGING_API_URL = 'https://api.line.me/v2/bot/message/push';

interface SendMessageResult {
  success: boolean;
  error?: string;
}

/**
 * Send a push message to a LINE user via LINE Messaging API
 * @param userId - LINE user ID to send message to
 * @param messages - Array of LINE message objects to send
 * @returns Result object with success status and optional error message
 */
export async function sendPushMessage(
  userId: string,
  messages: any[]
): Promise<SendMessageResult> {
  const operation = 'SEND_PUSH_MESSAGE';
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  if (!channelAccessToken) {
    console.error('LINE configuration error', {
      operation,
      userId,
      error: 'LINE_CHANNEL_ACCESS_TOKEN is not configured',
      timestamp: new Date().toISOString(),
    });
    
    return {
      success: false,
      error: 'LINE channel access token is not configured',
    };
  }

  try {
    const response = await fetch(LINE_MESSAGING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: userId,
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      const errorDetails = errorData.details || [];

      // Log LINE Messaging API error (Requirement 12.1)
      console.error('LINE Messaging API error', {
        operation,
        userId,
        error: errorMessage,
        errorCode: response.status,
        details: errorDetails,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log('LINE message sent successfully', {
      operation,
      userId,
      messageCount: messages.length,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to send message';

    // Log LINE Messaging API error (Requirement 12.1)
    console.error('LINE Messaging API error', {
      operation,
      userId,
      error: errorMessage,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send a test notification to a LINE user
 * @param lineUserId - LINE user ID to send test notification to
 * @returns Result object with success status and optional error message
 */
export async function sendTestNotification(lineUserId: string): Promise<SendMessageResult> {
  const flexMessage = createTestFlexMessage();
  return sendPushMessage(lineUserId, [flexMessage]);
}

/**
 * Send expiry notification with real medication data
 * @param lineUserId - LINE user ID to send notification to
 * @returns Result object with success status, medication count, and optional error message
 */
export async function sendExpiryNotification(
  lineUserId: string
): Promise<SendMessageResult & { medicationCount?: number }> {
  const operation = 'SEND_EXPIRY_NOTIFICATION';
  
  try {
    // Import prisma and flex message utilities dynamically to avoid circular dependencies
    console.log('Importing prisma and flex utilities', {
      operation,
      userId: lineUserId,
      timestamp: new Date().toISOString(),
    });
    
    const { prisma } = await import('@/lib/prisma');
    const { createExpirationFlexMessage } = await import('@/lib/flex-messages');

    console.log('Imports successful, querying medications', {
      operation,
      userId: lineUserId,
      timestamp: new Date().toISOString(),
    });

    // Get medications expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    console.log('Date range calculated', {
      operation,
      userId: lineUserId,
      now: new Date().toISOString(),
      thirtyDaysFromNow: thirtyDaysFromNow.toISOString(),
      timestamp: new Date().toISOString(),
    });

    console.log('Starting database query for medications', {
      operation,
      userId: lineUserId,
      hasPrisma: !!prisma,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString(),
    });

    const medications = await prisma.medication.findMany({
      where: {
        expirationDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(), // Only future dates
        },
      },
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
    });

    console.log('Database query completed', {
      operation,
      userId: lineUserId,
      medicationCount: medications.length,
      timestamp: new Date().toISOString(),
    });

    if (medications.length === 0) {
      console.log('No medications expiring soon', {
        operation,
        userId: lineUserId,
        dateRangeChecked: {
          from: new Date().toISOString(),
          to: thirtyDaysFromNow.toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
      
      return {
        success: false,
        error: 'No medications found expiring soon',
      };
    }

    console.log('Creating flex message', {
      operation,
      userId: lineUserId,
      medicationCount: medications.length,
      medications: medications.map(m => ({
        name: m.name,
        expirationDate: m.expirationDate?.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    });

    // Build full category hierarchy path for each medication
    const medicationsWithFullPath = medications.map(med => {
      // Build category path from root to leaf
      const ancestors: any[] = [];
      let currentCategory: any = med.category;
      
      // Traverse up to root
      while (currentCategory) {
        ancestors.unshift(currentCategory); // Add to beginning
        currentCategory = currentCategory.parent;
      }
      
      // Build full path string
      const fullPath = ancestors.map(c => c.name).join(' > ');
      
      return {
        ...med,
        category: {
          ...med.category,
          name: fullPath, // Override name with full path
        },
      };
    });

    // Create flex message with real medication data
    const flexMessage = createExpirationFlexMessage(medicationsWithFullPath as any);

    console.log('Flex message created, sending push message', {
      operation,
      userId: lineUserId,
      timestamp: new Date().toISOString(),
    });

    // Send the message
    const result = await sendPushMessage(lineUserId, [flexMessage]);

    return {
      ...result,
      medicationCount: medications.length,
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Failed to send expiry notification';

    console.error('Expiry notification error', {
      operation,
      userId: lineUserId,
      error: errorMessage,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create a test Flex Message template
 * @returns LINE Flex Message object for test notification
 */
function createTestFlexMessage() {
  return {
    type: 'flex',
    altText: 'ทดสอบการแจ้งเตือนยาใกล้หมดอายุ',
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'ทดสอบการแจ้งเตือน',
            weight: 'bold',
            size: 'xl',
            color: '#ffffff',
          },
        ],
        backgroundColor: '#61a4ca',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'นี่คือการแจ้งเตือนทดสอบจากระบบ',
            wrap: true,
          },
        ],
      },
    },
  };
}
