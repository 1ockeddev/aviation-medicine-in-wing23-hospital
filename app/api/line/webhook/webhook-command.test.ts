import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    lineUser: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    medication: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/line-messaging', () => ({
  sendExpiryNotification: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('POST /api/line/webhook - P Command', () => {
  const mockChannelSecret = 'test-channel-secret';
  const mockAccessToken = 'test-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LINE_CHANNEL_SECRET = mockChannelSecret;
    process.env.LINE_CHANNEL_ACCESS_TOKEN = mockAccessToken;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const createSignedRequest = (body: any) => {
    const bodyString = JSON.stringify(body);
    const signature = crypto
      .createHmac('SHA256', mockChannelSecret)
      .update(bodyString)
      .digest('base64');

    return new NextRequest('http://localhost/api/line/webhook', {
      method: 'POST',
      headers: {
        'x-line-signature': signature,
        'content-type': 'application/json',
      },
      body: bodyString,
    });
  };

  it('should trigger expiry notification when user sends "P"', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { sendExpiryNotification } = await import('@/lib/line-messaging');

    // Mock existing user
    vi.mocked(prisma.lineUser.findUnique).mockResolvedValue({
      id: 'user-1',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Mock successful notification
    vi.mocked(sendExpiryNotification).mockResolvedValue({
      success: true,
      medicationCount: 3,
    });

    const webhookBody = {
      events: [
        {
          type: 'message',
          message: {
            type: 'text',
            text: 'P',
          },
          source: {
            userId: 'U1234567890',
          },
          timestamp: Date.now(),
        },
      ],
    };

    const request = createSignedRequest(webhookBody);
    const response = await POST(request);

    expect(response.status).toBe(200);

    // Wait for async processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(sendExpiryNotification).toHaveBeenCalledWith('U1234567890');
  });

  it('should handle "P" command case-insensitively', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { sendExpiryNotification } = await import('@/lib/line-messaging');

    vi.mocked(prisma.lineUser.findUnique).mockResolvedValue({
      id: 'user-1',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(sendExpiryNotification).mockResolvedValue({
      success: true,
      medicationCount: 2,
    });

    const testCases = ['P', 'p', ' P ', ' p '];

    for (const text of testCases) {
      vi.clearAllMocks();

      const webhookBody = {
        events: [
          {
            type: 'message',
            message: {
              type: 'text',
              text,
            },
            source: {
              userId: 'U1234567890',
            },
            timestamp: Date.now(),
          },
        ],
      };

      const request = createSignedRequest(webhookBody);
      await POST(request);

      // Wait for async processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(sendExpiryNotification).toHaveBeenCalledWith('U1234567890');
    }
  });

  it('should not trigger notification for other messages', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { sendExpiryNotification } = await import('@/lib/line-messaging');

    vi.mocked(prisma.lineUser.findUnique).mockResolvedValue({
      id: 'user-1',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const webhookBody = {
      events: [
        {
          type: 'message',
          message: {
            type: 'text',
            text: 'Hello',
          },
          source: {
            userId: 'U1234567890',
          },
          timestamp: Date.now(),
        },
      ],
    };

    const request = createSignedRequest(webhookBody);
    const response = await POST(request);

    expect(response.status).toBe(200);

    // Wait for async processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(sendExpiryNotification).not.toHaveBeenCalled();
  });

  it('should handle notification sending errors gracefully', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { sendExpiryNotification } = await import('@/lib/line-messaging');

    vi.mocked(prisma.lineUser.findUnique).mockResolvedValue({
      id: 'user-1',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Mock failed notification
    vi.mocked(sendExpiryNotification).mockResolvedValue({
      success: false,
      error: 'No medications found expiring soon',
    });

    const webhookBody = {
      events: [
        {
          type: 'message',
          message: {
            type: 'text',
            text: 'P',
          },
          source: {
            userId: 'U1234567890',
          },
          timestamp: Date.now(),
        },
      ],
    };

    const request = createSignedRequest(webhookBody);
    const response = await POST(request);

    // Should still return 200 (webhook requirement)
    expect(response.status).toBe(200);

    // Wait for async processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(sendExpiryNotification).toHaveBeenCalledWith('U1234567890');
  });

  it('should register new user before sending notification', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { sendExpiryNotification } = await import('@/lib/line-messaging');

    // Mock user doesn't exist
    vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);

    // Mock profile fetch
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        userId: 'U1234567890',
        displayName: 'New User',
        pictureUrl: 'https://example.com/pic.jpg',
      }),
    } as Response);

    // Mock user creation
    vi.mocked(prisma.lineUser.upsert).mockResolvedValue({
      id: 'user-1',
      lineUserId: 'U1234567890',
      displayName: 'New User',
      pictureUrl: 'https://example.com/pic.jpg',
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(sendExpiryNotification).mockResolvedValue({
      success: true,
      medicationCount: 1,
    });

    const webhookBody = {
      events: [
        {
          type: 'message',
          message: {
            type: 'text',
            text: 'P',
          },
          source: {
            userId: 'U1234567890',
          },
          timestamp: Date.now(),
        },
      ],
    };

    const request = createSignedRequest(webhookBody);
    const response = await POST(request);

    expect(response.status).toBe(200);

    // Wait for async processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should register user first
    expect(prisma.lineUser.upsert).toHaveBeenCalled();

    // Then send notification
    expect(sendExpiryNotification).toHaveBeenCalledWith('U1234567890');
  });

  it('should handle non-text messages without errors', async () => {
    const { prisma } = await import('@/lib/prisma');
    const { sendExpiryNotification } = await import('@/lib/line-messaging');

    vi.mocked(prisma.lineUser.findUnique).mockResolvedValue({
      id: 'user-1',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const webhookBody = {
      events: [
        {
          type: 'message',
          message: {
            type: 'image',
            id: 'msg-123',
          },
          source: {
            userId: 'U1234567890',
          },
          timestamp: Date.now(),
        },
      ],
    };

    const request = createSignedRequest(webhookBody);
    const response = await POST(request);

    expect(response.status).toBe(200);

    // Wait for async processing
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should not trigger notification
    expect(sendExpiryNotification).not.toHaveBeenCalled();
  });
});
