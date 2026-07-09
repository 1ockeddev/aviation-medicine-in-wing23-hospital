import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTestNotification, sendPushMessage } from './line-messaging';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('line-messaging', () => {
  beforeEach(() => {
    // Set up environment variable
    process.env.LINE_CHANNEL_ACCESS_TOKEN = 'test-token';
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendPushMessage', () => {
    it('should send message successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await sendPushMessage('test-user-id', [
        { type: 'text', text: 'test message' },
      ]);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.line.me/v2/bot/message/push',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          },
          body: JSON.stringify({
            to: 'test-user-id',
            messages: [{ type: 'text', text: 'test message' }],
          }),
        })
      );
    });

    it('should return error when LINE_CHANNEL_ACCESS_TOKEN is not configured', async () => {
      delete process.env.LINE_CHANNEL_ACCESS_TOKEN;

      const result = await sendPushMessage('test-user-id', [
        { type: 'text', text: 'test message' },
      ]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('LINE channel access token is not configured');
    });

    it('should return error when API request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          message: 'Invalid request',
          details: ['Missing required field'],
        }),
      });

      const result = await sendPushMessage('test-user-id', [
        { type: 'text', text: 'test message' },
      ]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await sendPushMessage('test-user-id', [
        { type: 'text', text: 'test message' },
      ]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('sendTestNotification', () => {
    it('should send test notification with Flex Message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await sendTestNotification('test-user-id');

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.line.me/v2/bot/message/push',
        expect.objectContaining({
          method: 'POST',
        })
      );

      // Verify the message structure
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.to).toBe('test-user-id');
      expect(callBody.messages).toHaveLength(1);
      expect(callBody.messages[0].type).toBe('flex');
      expect(callBody.messages[0].altText).toBe('ทดสอบการแจ้งเตือนยาใกล้หมดอายุ');
    });

    it('should create test Flex Message with correct structure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await sendTestNotification('test-user-id');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const flexMessage = callBody.messages[0];

      // Verify header
      expect(flexMessage.contents.header.backgroundColor).toBe('#61a4ca');
      expect(flexMessage.contents.header.contents[0].text).toBe('ทดสอบการแจ้งเตือน');
      expect(flexMessage.contents.header.contents[0].weight).toBe('bold');
      expect(flexMessage.contents.header.contents[0].size).toBe('xl');
      expect(flexMessage.contents.header.contents[0].color).toBe('#ffffff');

      // Verify body
      expect(flexMessage.contents.body.contents[0].text).toBe(
        'นี่คือการแจ้งเตือนทดสอบจากระบบ'
      );
      expect(flexMessage.contents.body.contents[0].wrap).toBe(true);
    });

    it('should handle errors from sendPushMessage', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await sendTestNotification('test-user-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});
