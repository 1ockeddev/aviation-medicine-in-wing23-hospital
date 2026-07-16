import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { auth } from '@/lib/auth';
import { sendExpiryNotification } from '@/lib/line-messaging';

// Mock dependencies
vi.mock('@/lib/auth');
vi.mock('@/lib/line-messaging');

const mockAuth = vi.mocked(auth);
const mockSendExpiryNotification = vi.mocked(sendExpiryNotification);

describe('POST /api/line/send-expiry-notification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return 401 if user is not authenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const request = new NextRequest('http://localhost:3000/api/line/send-expiry-notification', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'U1234567890' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(mockSendExpiryNotification).not.toHaveBeenCalled();
  });

  it('should return 400 if lineUserId is missing', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'admin' },
    } as any);

    const request = new NextRequest('http://localhost:3000/api/line/send-expiry-notification', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'lineUserId is required' });
    expect(mockSendExpiryNotification).not.toHaveBeenCalled();
  });

  it('should send expiry notification successfully', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'admin' },
    } as any);

    mockSendExpiryNotification.mockResolvedValueOnce({
      success: true,
      medicationCount: 3,
    });

    const request = new NextRequest('http://localhost:3000/api/line/send-expiry-notification', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'U1234567890' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, medicationCount: 3 });
    expect(mockSendExpiryNotification).toHaveBeenCalledWith('U1234567890');
  });

  it('should return 404 if no medications are expiring soon', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'admin' },
    } as any);

    mockSendExpiryNotification.mockResolvedValueOnce({
      success: false,
      error: 'No medications found expiring soon',
    });

    const request = new NextRequest('http://localhost:3000/api/line/send-expiry-notification', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'U1234567890' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'No medications found expiring soon' });
    expect(mockSendExpiryNotification).toHaveBeenCalledWith('U1234567890');
  });

  it('should return 500 if sending notification fails', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'admin' },
    } as any);

    mockSendExpiryNotification.mockResolvedValueOnce({
      success: false,
      error: 'LINE API error',
    });

    const request = new NextRequest('http://localhost:3000/api/line/send-expiry-notification', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'U1234567890' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'LINE API error' });
    expect(mockSendExpiryNotification).toHaveBeenCalledWith('U1234567890');
  });

  it('should handle unexpected errors', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', username: 'admin' },
    } as any);

    mockSendExpiryNotification.mockRejectedValueOnce(new Error('Database connection failed'));

    const request = new NextRequest('http://localhost:3000/api/line/send-expiry-notification', {
      method: 'POST',
      body: JSON.stringify({ lineUserId: 'U1234567890' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to send expiry notification' });
  });
});
