import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * LINE Webhook Handler
 * 
 * Automatically registers users when they:
 * - Send first message to OA
 * - Follow/Add friend OA
 * 
 * Validates: LINE signature for security
 */
export async function POST(request: NextRequest) {
  const operation = 'LINE_WEBHOOK';

  try {
    // Get request body
    const body = await request.text();
    
    // Verify LINE signature first
    const signature = request.headers.get('x-line-signature');
    if (!signature) {
      console.error('Missing LINE signature', {
        operation,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    if (!verifySignature(body, signature)) {
      console.error('Invalid LINE signature', {
        operation,
        hasChannelSecret: !!process.env.LINE_CHANNEL_SECRET,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse events after signature verification
    const events = JSON.parse(body).events;

    console.log('Webhook received', {
      operation,
      eventCount: events.length,
      timestamp: new Date().toISOString(),
    });

    // Process events asynchronously (don't await)
    // LINE requires response within 3 seconds, so we process in background
    processEventsAsync(events).catch((error) => {
      console.error('Background event processing error', {
        operation,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    });

    // Return immediately to LINE (must be 200 OK)
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error', {
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Still return 200 to LINE to avoid retries
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

/**
 * Process events asynchronously in background
 */
async function processEventsAsync(events: any[]) {
  for (const event of events) {
    try {
      // Handle follow event (user adds friend)
      if (event.type === 'follow') {
        await handleFollowEvent(event);
      }

      // Handle message event (user sends message)
      if (event.type === 'message') {
        await handleMessageEvent(event);
      }
    } catch (error) {
      console.error('Error processing event', {
        eventType: event.type,
        userId: event.source.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
      // Continue processing other events
    }
  }
}

/**
 * Handle follow event - user adds friend
 */
async function handleFollowEvent(event: any) {
  const userId = event.source.userId;

  console.log('Follow event received', {
    userId,
    timestamp: new Date().toISOString(),
  });

  // Get user profile from LINE
  const profile = await getUserProfile(userId);
  if (!profile) {
    console.error('Failed to get user profile', { userId });
    return;
  }

  // Upsert user to database
  await upsertLineUser(profile);
}

/**
 * Handle message event - user sends message
 */
async function handleMessageEvent(event: any) {
  const userId = event.source.userId;
  const messageText = event.message.type === 'text' ? event.message.text : '';

  console.log('Message event received', {
    userId,
    messageType: event.message.type,
    messageText,
    timestamp: new Date().toISOString(),
  });

  // Check if user exists in database
  const existingUser = await prisma.lineUser.findUnique({
    where: { lineUserId: userId },
  });

  // If user doesn't exist, register them
  if (!existingUser) {
    const profile = await getUserProfile(userId);
    if (profile) {
      await upsertLineUser(profile);
    }
  }

  // Handle "P" command - send expiry notification
  if (messageText.trim().toUpperCase() === 'P') {
    console.log('P command received', {
      userId,
      timestamp: new Date().toISOString(),
    });

    // Send expiry notification
    await sendExpiryNotificationToUser(userId);
  }
}

/**
 * Send expiry notification to user
 */
async function sendExpiryNotificationToUser(userId: string) {
  try {
    // Import sendExpiryNotification function
    const { sendExpiryNotification } = await import('@/lib/line-messaging');

    console.log('Sending expiry notification', {
      userId,
      source: 'webhook_command',
      timestamp: new Date().toISOString(),
    });

    const result = await sendExpiryNotification(userId);

    if (result.success) {
      console.log('Expiry notification sent successfully', {
        userId,
        medicationCount: result.medicationCount,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error('Failed to send expiry notification', {
        userId,
        error: result.error,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Error sending expiry notification', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Get user profile from LINE API
 */
async function getUserProfile(userId: string) {
  try {
    const response = await fetch(
      `https://api.line.me/v2/bot/profile/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to get profile', {
        userId,
        status: response.status,
      });
      return null;
    }

    const data = await response.json();
    return {
      userId: data.userId,
      displayName: data.displayName,
      pictureUrl: data.pictureUrl,
    };
  } catch (error) {
    console.error('Error getting user profile', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Upsert LINE user to database
 */
async function upsertLineUser(profile: {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}) {
  try {
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

    console.log('User registered successfully', {
      userId: profile.userId,
      displayName: profile.displayName,
      timestamp: new Date().toISOString(),
    });

    return lineUser;
  } catch (error) {
    console.error('Error upserting user', {
      userId: profile.userId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Verify LINE webhook signature
 */
function verifySignature(body: string, signature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  
  // Debug logging
  console.log('Signature verification debug', {
    hasChannelSecret: !!channelSecret,
    channelSecretLength: channelSecret?.length || 0,
    signatureReceived: signature?.substring(0, 10) + '...',
    bodyLength: body.length,
    timestamp: new Date().toISOString(),
  });
  
  if (!channelSecret) {
    console.error('LINE_CHANNEL_SECRET not configured - check Netlify environment variables');
    return false;
  }

  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');

  const isValid = hash === signature;
  
  if (!isValid) {
    console.error('Signature mismatch', {
      computed: hash.substring(0, 10) + '...',
      received: signature.substring(0, 10) + '...',
      timestamp: new Date().toISOString(),
    });
  }

  return isValid;
}
