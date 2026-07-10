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
    const events = JSON.parse(body).events;

    // Verify LINE signature
    const signature = request.headers.get('x-line-signature');
    if (!signature || !verifySignature(body, signature)) {
      console.error('Invalid LINE signature', {
        operation,
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('Webhook received', {
      operation,
      eventCount: events.length,
      timestamp: new Date().toISOString(),
    });

    // Process each event
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
          operation,
          eventType: event.type,
          userId: event.source.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        // Continue processing other events
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error', {
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
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

  console.log('Message event received', {
    userId,
    messageType: event.message.type,
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
  if (!channelSecret) {
    console.error('LINE_CHANNEL_SECRET not configured');
    return false;
  }

  const hash = crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64');

  return hash === signature;
}
