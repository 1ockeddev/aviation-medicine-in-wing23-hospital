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
