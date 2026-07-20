import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Test LINE Webhook Configuration
 * 
 * Check if webhook can process events correctly
 */
export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {},
  };

  // 1. Check environment variables
  results.checks.envVariables = {
    LINE_CHANNEL_SECRET: !!process.env.LINE_CHANNEL_SECRET,
    LINE_CHANNEL_ACCESS_TOKEN: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
    DATABASE_URL: !!process.env.DATABASE_URL,
    secretLength: process.env.LINE_CHANNEL_SECRET?.length || 0,
    tokenLength: process.env.LINE_CHANNEL_ACCESS_TOKEN?.length || 0,
  };

  // 2. Check database connection
  try {
    const userCount = await prisma.lineUser.count();
    results.checks.database = {
      connected: true,
      userCount,
    };
  } catch (error) {
    results.checks.database = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 3. Check LINE API connection
  try {
    // Try to get bot info
    const response = await fetch('https://api.line.me/v2/bot/info', {
      headers: {
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
    });

    if (response.ok) {
      const botInfo = await response.json();
      results.checks.lineApi = {
        connected: true,
        botInfo: {
          displayName: botInfo.displayName,
          userId: botInfo.userId,
          premiumId: botInfo.premiumId,
        },
      };
    } else {
      results.checks.lineApi = {
        connected: false,
        status: response.status,
        statusText: response.statusText,
      };
    }
  } catch (error) {
    results.checks.lineApi = {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // 4. Overall status
  const allChecksPass = 
    results.checks.envVariables.LINE_CHANNEL_SECRET &&
    results.checks.envVariables.LINE_CHANNEL_ACCESS_TOKEN &&
    results.checks.database.connected &&
    results.checks.lineApi.connected;

  results.status = allChecksPass ? 'OK' : 'ERROR';
  results.message = allChecksPass 
    ? 'All checks passed. Webhook should work correctly.'
    : 'Some checks failed. Please fix the issues above.';

  return NextResponse.json(results);
}

/**
 * Test webhook with simulated LINE event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulate user registration
    const testUserId = body.userId || 'test_' + Date.now();
    
    console.log('Test webhook - simulating user registration', {
      testUserId,
      timestamp: new Date().toISOString(),
    });

    // Check if user exists
    const existingUser = await prisma.lineUser.findUnique({
      where: { lineUserId: testUserId },
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: existingUser,
      });
    }

    // Create test user
    const newUser = await prisma.lineUser.create({
      data: {
        lineUserId: testUserId,
        displayName: body.displayName || 'Test User',
        pictureUrl: body.pictureUrl || null,
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      },
    });

    console.log('Test user created', {
      userId: newUser.lineUserId,
      displayName: newUser.displayName,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Test webhook error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
