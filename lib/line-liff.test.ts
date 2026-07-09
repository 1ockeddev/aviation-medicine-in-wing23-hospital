import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyLiffToken } from './line-liff';

describe('verifyLiffToken', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.LINE_CHANNEL_ID = 'test-channel-id';
    global.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should return user profile when token verification succeeds', async () => {
    // Mock successful verification response
    const mockVerifyResponse = {
      ok: true,
      status: 200,
    };

    // Mock successful profile response
    const mockProfileData = {
      userId: 'U1234567890abcdef',
      displayName: 'Test User',
      pictureUrl: 'https://example.com/picture.jpg',
    };

    const mockProfileResponse = {
      ok: true,
      status: 200,
      json: async () => mockProfileData,
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockVerifyResponse)
      .mockResolvedValueOnce(mockProfileResponse);

    const result = await verifyLiffToken('valid-token');

    expect(result).toEqual({
      userId: 'U1234567890abcdef',
      displayName: 'Test User',
      pictureUrl: 'https://example.com/picture.jpg',
    });

    // Verify verify endpoint was called correctly
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.line.me/oauth2/v2.1/verify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          access_token: 'valid-token',
          client_id: 'test-channel-id',
        }),
      }
    );

    // Verify profile endpoint was called correctly
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'https://api.line.me/v2/profile',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-token',
        },
      }
    );
  });

  it('should return null when token verification fails', async () => {
    const mockVerifyResponse = {
      ok: false,
      status: 401,
    };

    (global.fetch as any).mockResolvedValueOnce(mockVerifyResponse);

    const result = await verifyLiffToken('invalid-token');

    expect(result).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('should return null when profile fetch fails', async () => {
    const mockVerifyResponse = {
      ok: true,
      status: 200,
    };

    const mockProfileResponse = {
      ok: false,
      status: 404,
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockVerifyResponse)
      .mockResolvedValueOnce(mockProfileResponse);

    const result = await verifyLiffToken('valid-token');

    expect(result).toBeNull();
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle missing pictureUrl gracefully', async () => {
    const mockVerifyResponse = {
      ok: true,
      status: 200,
    };

    const mockProfileData = {
      userId: 'U1234567890abcdef',
      displayName: 'Test User',
      // pictureUrl is missing
    };

    const mockProfileResponse = {
      ok: true,
      status: 200,
      json: async () => mockProfileData,
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockVerifyResponse)
      .mockResolvedValueOnce(mockProfileResponse);

    const result = await verifyLiffToken('valid-token');

    expect(result).toEqual({
      userId: 'U1234567890abcdef',
      displayName: 'Test User',
      pictureUrl: undefined,
    });
  });

  it('should return null when network error occurs during verification', async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await verifyLiffToken('valid-token');

    expect(result).toBeNull();
  });

  it('should return null when network error occurs during profile fetch', async () => {
    const mockVerifyResponse = {
      ok: true,
      status: 200,
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockVerifyResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    const result = await verifyLiffToken('valid-token');

    expect(result).toBeNull();
  });

  it('should extract userId, displayName, and pictureUrl correctly', async () => {
    const mockVerifyResponse = { ok: true, status: 200 };
    const mockProfileData = {
      userId: 'U9876543210fedcba',
      displayName: 'Another User',
      pictureUrl: 'https://example.com/another.jpg',
      // Additional fields that should be ignored
      statusMessage: 'Hello!',
      language: 'en',
    };
    const mockProfileResponse = {
      ok: true,
      status: 200,
      json: async () => mockProfileData,
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockVerifyResponse)
      .mockResolvedValueOnce(mockProfileResponse);

    const result = await verifyLiffToken('valid-token');

    // Should only return userId, displayName, and pictureUrl
    expect(result).toEqual({
      userId: 'U9876543210fedcba',
      displayName: 'Another User',
      pictureUrl: 'https://example.com/another.jpg',
    });
  });

  it('should use LINE_CHANNEL_ID from environment variables', async () => {
    process.env.LINE_CHANNEL_ID = 'custom-channel-id';

    const mockVerifyResponse = { ok: true, status: 200 };
    const mockProfileData = {
      userId: 'U123',
      displayName: 'User',
    };
    const mockProfileResponse = {
      ok: true,
      status: 200,
      json: async () => mockProfileData,
    };

    (global.fetch as any)
      .mockResolvedValueOnce(mockVerifyResponse)
      .mockResolvedValueOnce(mockProfileResponse);

    await verifyLiffToken('token');

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'https://api.line.me/oauth2/v2.1/verify',
      expect.objectContaining({
        body: new URLSearchParams({
          access_token: 'token',
          client_id: 'custom-channel-id',
        }),
      })
    );
  });
});
