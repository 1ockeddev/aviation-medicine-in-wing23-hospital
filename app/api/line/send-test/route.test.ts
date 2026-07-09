import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { auth } from '@/lib/auth';
import { sendTestNotification } from '@/lib/line-messaging';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/line-messaging');

const mockAuth = vi.mocked(auth);
const mockSendTestNotification = vi.mocked(sendTestNotification);

describe('POST /api/line/send-test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return 401 when not authenticated', async () => {
    // Mock: no session (not authenticated)
    mockAuth.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost/api/line/send-test', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'test-user-id' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
    expect(mockSendTestNotification).not.toHaveBeenCalled();
  });

  it('should return 400 when lineUserId is missing', async () => {
    // Mock: authenticated session
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'admin', role: 'admin' },
    } as any);

    const request = new NextRequest('http://localhost/api/line/send-test', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('lineUserId is required');
    expect(mockSendTestNotification).not.toHaveBeenCalled();
  });

  it('should send test notification successfully when authenticated', async () => {
    // Mock: authenticated session
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'admin', role: 'admin' },
    } as any);

    // Mock: successful notification send
    mockSendTestNotification.mockResolvedValueOnce({ success: true });

    const request = new NextRequest('http://localhost/api/line/send-test', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'test-user-id' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSendTestNotification).toHaveBeenCalledWith('test-user-id');
  });

  it('should return 500 when notification send fails', async () => {
    // Mock: authenticated session
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'admin', role: 'admin' },
    } as any);

    // Mock: failed notification send
    mockSendTestNotification.mockResolvedValueOnce({
      success: false,
      error: 'LINE API error',
    });

    const request = new NextRequest('http://localhost/api/line/send-test', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'test-user-id' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('LINE API error');
    expect(mockSendTestNotification).toHaveBeenCalledWith('test-user-id');
  });

  it('should handle exceptions and return 500', async () => {
    // Mock: authenticated session
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'admin', role: 'admin' },
    } as any);

    // Mock: exception thrown
    mockSendTestNotification.mockRejectedValueOnce(
      new Error('Unexpected error')
    );

    const request = new NextRequest('http://localhost/api/line/send-test', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'test-user-id' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to send test notification');
  });

  it('should log all test notification attempts with timestamp and status', async () => {
    const mockConsoleLog = vi.spyOn(console, 'log');
    const mockConsoleError = vi.spyOn(console, 'error');

    // Mock: authenticated session
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'testadmin', role: 'admin' },
    } as any);

    // Mock: successful notification
    mockSendTestNotification.mockResolvedValueOnce({ success: true });

    const request = new NextRequest('http://localhost/api/line/send-test', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'test-user-123' }),
    });

    await POST(request);

    // Verify attempt logging
    expect(mockConsoleLog).toHaveBeenCalledWith(
      'Test notification attempt:',
      expect.objectContaining({
        lineUserId: 'test-user-123',
        adminUser: 'testadmin',
        timestamp: expect.any(String),
      })
    );

    // Verify success logging
    expect(mockConsoleLog).toHaveBeenCalledWith(
      'Test notification sent successfully:',
      expect.objectContaining({
        lineUserId: 'test-user-123',
        status: 'success',
        timestamp: expect.any(String),
      })
    );
  });

  it('should log failed notification attempts', async () => {
    const mockConsoleError = vi.spyOn(console, 'error');

    // Mock: authenticated session
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'testadmin', role: 'admin' },
    } as any);

    // Mock: failed notification
    mockSendTestNotification.mockResolvedValueOnce({
      success: false,
      error: 'Test error message',
    });

    const request = new NextRequest('http://localhost/api/line/send-test', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'test-user-123' }),
    });

    await POST(request);

    // Verify failure logging
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Test notification failed:',
      expect.objectContaining({
        lineUserId: 'test-user-123',
        status: 'failed',
        error: 'Test error message',
        timestamp: expect.any(String),
      })
    );
  });
});
