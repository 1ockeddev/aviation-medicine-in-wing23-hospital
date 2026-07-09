import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { verifyLiffToken } from '@/lib/line-liff';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    lineUser: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock('@/lib/line-liff');

const mockVerifyLiffToken = vi.mocked(verifyLiffToken);
const mockPrismaUpsert = vi.mocked(prisma.lineUser.upsert);

describe('POST /api/line/register', () => {
  const mockProfile = {
    userId: 'U1234567890abcdef',
    displayName: 'Test User',
    pictureUrl: 'https://example.com/picture.jpg',
  };

  const mockLineUser = {
    id: 'test-id',
    lineUserId: mockProfile.userId,
    displayName: mockProfile.displayName,
    pictureUrl: mockProfile.pictureUrl,
    notificationsEnabled: true,
    daysBeforeExpiration: 30,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Requirement 1.1, 11.2: LIFF Authentication', () => {
    it('should authenticate user using LIFF access token', async () => {
      const accessToken = 'valid-access-token';
      mockVerifyLiffToken.mockResolvedValue(mockProfile);
      mockPrismaUpsert.mockResolvedValue(mockLineUser);

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      await POST(request);

      expect(mockVerifyLiffToken).toHaveBeenCalledWith(accessToken);
    });
  });

  describe('Requirement 1.2: Extract LINE userId', () => {
    it('should extract LINE userId from verified token', async () => {
      const accessToken = 'valid-access-token';
      mockVerifyLiffToken.mockResolvedValue(mockProfile);
      mockPrismaUpsert.mockResolvedValue(mockLineUser);

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      await POST(request);

      expect(mockPrismaUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { lineUserId: mockProfile.userId },
        })
      );
    });
  });

  describe('Requirement 1.3: Store LINE user data', () => {
    it('should upsert user on successful authentication', async () => {
      const accessToken = 'valid-access-token';
      mockVerifyLiffToken.mockResolvedValue(mockProfile);
      mockPrismaUpsert.mockResolvedValue(mockLineUser);

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      await POST(request);

      expect(mockPrismaUpsert).toHaveBeenCalledWith({
        where: { lineUserId: mockProfile.userId },
        update: {
          displayName: mockProfile.displayName,
          pictureUrl: mockProfile.pictureUrl,
        },
        create: {
          lineUserId: mockProfile.userId,
          displayName: mockProfile.displayName,
          pictureUrl: mockProfile.pictureUrl,
          notificationsEnabled: true,
          daysBeforeExpiration: 30,
        },
      });
    });

    it('should update existing user profile on subsequent registrations', async () => {
      const accessToken = 'valid-access-token';
      const updatedProfile = {
        ...mockProfile,
        displayName: 'Updated Name',
        pictureUrl: 'https://example.com/new-picture.jpg',
      };
      
      mockVerifyLiffToken.mockResolvedValue(updatedProfile);
      mockPrismaUpsert.mockResolvedValue({
        ...mockLineUser,
        displayName: updatedProfile.displayName,
        pictureUrl: updatedProfile.pictureUrl,
      });

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      await POST(request);

      expect(mockPrismaUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: {
            displayName: updatedProfile.displayName,
            pictureUrl: updatedProfile.pictureUrl,
          },
        })
      );
    });
  });

  describe('Requirement 1.4: Set default notification preferences', () => {
    it('should set notificationsEnabled to true for new users', async () => {
      const accessToken = 'valid-access-token';
      mockVerifyLiffToken.mockResolvedValue(mockProfile);
      mockPrismaUpsert.mockResolvedValue(mockLineUser);

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      await POST(request);

      expect(mockPrismaUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            notificationsEnabled: true,
          }),
        })
      );
    });

    it('should set daysBeforeExpiration to 30 for new users', async () => {
      const accessToken = 'valid-access-token';
      mockVerifyLiffToken.mockResolvedValue(mockProfile);
      mockPrismaUpsert.mockResolvedValue(mockLineUser);

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      await POST(request);

      expect(mockPrismaUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            daysBeforeExpiration: 30,
          }),
        })
      );
    });
  });

  describe('Requirement 1.5, 11.5: Authentication failure handling', () => {
    it('should return 401 when token verification fails', async () => {
      const accessToken = 'invalid-access-token';
      mockVerifyLiffToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Invalid access token' });
    });

    it('should not create user when token verification fails', async () => {
      const accessToken = 'invalid-access-token';
      mockVerifyLiffToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      await POST(request);

      expect(mockPrismaUpsert).not.toHaveBeenCalled();
    });
  });

  describe('Requirement 11.4: Success response', () => {
    it('should return 200 with user data on successful registration', async () => {
      const accessToken = 'valid-access-token';
      mockVerifyLiffToken.mockResolvedValue(mockProfile);
      mockPrismaUpsert.mockResolvedValue(mockLineUser);

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        user: {
          ...mockLineUser,
          createdAt: mockLineUser.createdAt.toISOString(),
          updatedAt: mockLineUser.updatedAt.toISOString(),
        },
      });
    });
  });

  describe('Requirement 12.2: Error handling and logging', () => {
    it('should return 500 on database error', async () => {
      const accessToken = 'valid-access-token';
      mockVerifyLiffToken.mockResolvedValue(mockProfile);
      mockPrismaUpsert.mockRejectedValue(
        new Error('Database connection failed')
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Registration failed' });
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should log errors with context on failure', async () => {
      const accessToken = 'valid-access-token';
      const error = new Error('Database error');
      mockVerifyLiffToken.mockResolvedValue(mockProfile);
      mockPrismaUpsert.mockRejectedValue(error);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Registration error',
        expect.objectContaining({
          operation: 'LINE_USER_REGISTRATION',
          userId: mockProfile.userId,
          error: 'Database error',
          timestamp: expect.any(String),
        })
      );

      consoleSpy.mockRestore();
    });

    it('should handle malformed request body', async () => {
      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Registration failed' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing accessToken in request body', async () => {
      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      mockVerifyLiffToken.mockResolvedValue(null);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Invalid access token' });
    });

    it('should handle user with no profile picture', async () => {
      const accessToken = 'valid-access-token';
      const profileWithoutPicture = {
        ...mockProfile,
        pictureUrl: undefined,
      };

      mockVerifyLiffToken.mockResolvedValue(profileWithoutPicture);
      mockPrismaUpsert.mockResolvedValue({
        ...mockLineUser,
        pictureUrl: null,
      });

      const request = new NextRequest('http://localhost/api/line/register', {
        method: 'POST',
        body: JSON.stringify({ accessToken }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.pictureUrl).toBeNull();
    });
  });
});
