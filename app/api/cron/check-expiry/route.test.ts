import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as notificationModule from '@/lib/notification';

// Mock the notification module
vi.mock('@/lib/notification', () => ({
  checkAndNotifyExpiringMedications: vi.fn(),
}));

describe('Cron Check-Expiry Endpoint', () => {
  const mockCheckAndNotify = vi.mocked(notificationModule.checkAndNotifyExpiringMedications);
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variable
    process.env.CRON_SECRET = 'test-secret-123';
  });

  describe('Authorization', () => {
    /**
     * **Validates: Requirement 7.1**
     * Verifies authorization header matches CRON_SECRET
     */
    it('should verify authorization header matches CRON_SECRET', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer test-secret-123',
        },
      });

      mockCheckAndNotify.mockResolvedValue({ count: 5, duration: 1234 });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    /**
     * **Validates: Requirement 7.1**
     * Returns 401 if authorization fails
     */
    it('should return 401 if authorization header is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockCheckAndNotify).not.toHaveBeenCalled();
    });

    /**
     * **Validates: Requirement 7.1**
     * Returns 401 if authorization header has incorrect value
     */
    it('should return 401 if authorization header is incorrect', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer wrong-secret',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockCheckAndNotify).not.toHaveBeenCalled();
    });

    /**
     * **Validates: Requirement 7.1**
     * Returns 401 if authorization header is malformed (missing Bearer prefix)
     */
    it('should return 401 if authorization header is malformed', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'test-secret-123', // Missing "Bearer " prefix
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
      expect(mockCheckAndNotify).not.toHaveBeenCalled();
    });
  });

  describe('Notification Service Integration', () => {
    /**
     * **Validates: Requirements 7.1, 7.5**
     * Calls checkAndNotifyExpiringMedications when authorized
     */
    it('should call checkAndNotifyExpiringMedications when authorized', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer test-secret-123',
        },
      });

      mockCheckAndNotify.mockResolvedValue({ count: 10, duration: 2000 });

      await GET(request);

      expect(mockCheckAndNotify).toHaveBeenCalledTimes(1);
    });

    /**
     * **Validates: Requirements 7.5, 12.4**
     * Returns response with notificationsSent count and duration
     */
    it('should return response with notificationsSent count and duration', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer test-secret-123',
        },
      });

      mockCheckAndNotify.mockResolvedValue({ count: 7, duration: 1500 });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        notificationsSent: 7,
        duration: 1500,
      });
    });

    /**
     * **Validates: Requirement 7.5**
     * Returns correct values when no notifications sent
     */
    it('should return correct response when no notifications sent', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer test-secret-123',
        },
      });

      mockCheckAndNotify.mockResolvedValue({ count: 0, duration: 500 });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        notificationsSent: 0,
        duration: 500,
      });
    });
  });

  describe('Error Handling', () => {
    /**
     * **Validates: Requirement 12.4**
     * Logs and returns error when notification service fails
     */
    it('should handle errors from notification service', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer test-secret-123',
        },
      });

      const mockError = new Error('Database connection failed');
      mockCheckAndNotify.mockRejectedValue(mockError);

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Cron job failed');
      expect(data.details).toBe('Database connection failed');
    });

    /**
     * **Validates: Requirement 12.4**
     * Handles unexpected errors gracefully
     */
    it('should handle unexpected errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer test-secret-123',
        },
      });

      mockCheckAndNotify.mockRejectedValue('Unexpected string error');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Cron job failed');
    });
  });

  describe('Logging', () => {
    /**
     * **Validates: Requirement 12.4**
     * Logs cron job execution with status
     */
    it('should log successful cron job execution', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer test-secret-123',
        },
      });

      mockCheckAndNotify.mockResolvedValue({ count: 3, duration: 1200 });

      await GET(request);

      // Check that logging occurred
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cron job started',
        expect.objectContaining({
          endpoint: '/api/cron/check-expiry',
          timestamp: expect.any(String),
        })
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Cron job completed successfully',
        expect.objectContaining({
          endpoint: '/api/cron/check-expiry',
          notificationsSent: 3,
          durationMs: 1200,
          timestamp: expect.any(String),
        })
      );

      consoleSpy.mockRestore();
    });

    /**
     * **Validates: Requirement 12.4**
     * Logs failed cron job execution with error details
     */
    it('should log failed cron job execution', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer test-secret-123',
        },
      });

      const mockError = new Error('Service unavailable');
      mockCheckAndNotify.mockRejectedValue(mockError);

      await GET(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Cron job failed',
        expect.objectContaining({
          endpoint: '/api/cron/check-expiry',
          error: 'Service unavailable',
          timestamp: expect.any(String),
        })
      );

      consoleErrorSpy.mockRestore();
    });

    /**
     * **Validates: Requirement 12.4**
     * Logs unauthorized access attempts
     */
    it('should log unauthorized cron job attempts', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        headers: {
          authorization: 'Bearer wrong-secret',
        },
      });

      await GET(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Unauthorized cron job attempt',
        expect.objectContaining({
          receivedAuth: 'Bearer ***',
          timestamp: expect.any(String),
        })
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('HTTP Method', () => {
    /**
     * Verifies endpoint responds to GET requests
     */
    it('should respond to GET requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/cron/check-expiry', {
        method: 'GET',
        headers: {
          authorization: 'Bearer test-secret-123',
        },
      });

      mockCheckAndNotify.mockResolvedValue({ count: 1, duration: 800 });

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockCheckAndNotify).toHaveBeenCalled();
    });
  });
});
