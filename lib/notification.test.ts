import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkAndNotifyExpiringMedications } from './notification';
import { prisma } from '@/lib/prisma';
import * as lineMessaging from './line-messaging';
import * as flexMessages from './flex-messages';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    lineUser: {
      findMany: vi.fn(),
    },
    medication: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('./line-messaging', () => ({
  sendPushMessage: vi.fn(),
}));

vi.mock('./flex-messages', () => ({
  createExpirationFlexMessage: vi.fn(),
}));

describe('checkAndNotifyExpiringMedications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return zero notifications when no users have notifications enabled', async () => {
    // Arrange
    vi.mocked(prisma.lineUser.findMany).mockResolvedValue([]);

    // Act
    const result = await checkAndNotifyExpiringMedications();

    // Assert
    expect(result.count).toBe(0);
    expect(result.duration).toBeGreaterThanOrEqual(0);
    expect(prisma.lineUser.findMany).toHaveBeenCalledWith({
      where: { notificationsEnabled: true },
    });
  });

  it('should not send notification when no medications are expiring', async () => {
    // Arrange
    const mockUser = {
      id: 'user1',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.lineUser.findMany).mockResolvedValue([mockUser]);
    vi.mocked(prisma.medication.findMany).mockResolvedValue([]);

    // Act
    const result = await checkAndNotifyExpiringMedications();

    // Assert
    expect(result.count).toBe(0);
    expect(lineMessaging.sendPushMessage).not.toHaveBeenCalled();
  });

  it('should send notification when medications are expiring', async () => {
    // Arrange
    const mockUser = {
      id: 'user1',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCategory = {
      id: 'cat1',
      name: 'Pain Relief',
      parentId: null,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mockMedication = {
      id: 'med1',
      name: 'Aspirin',
      tradeName: null,
      expirationDate: tomorrow,
      status: 'Y',
      dose: '500mg',
      doseDetails: null,
      halfLife: null,
      sideEffects: null,
      notes: null,
      categoryId: 'cat1',
      category: mockCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockFlexMessage = {
      type: 'flex',
      altText: 'ยาใกล้หมดอายุ 1 รายการ',
      contents: {},
    };

    vi.mocked(prisma.lineUser.findMany).mockResolvedValue([mockUser]);
    vi.mocked(prisma.medication.findMany).mockResolvedValue([mockMedication]);
    vi.mocked(flexMessages.createExpirationFlexMessage).mockReturnValue(mockFlexMessage);
    vi.mocked(lineMessaging.sendPushMessage).mockResolvedValue({ success: true });

    // Act
    const result = await checkAndNotifyExpiringMedications();

    // Assert
    expect(result.count).toBe(1);
    expect(prisma.medication.findMany).toHaveBeenCalledWith({
      where: {
        expirationDate: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
        status: {
          in: ['Y', 'Y*'],
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });
    expect(flexMessages.createExpirationFlexMessage).toHaveBeenCalledWith([mockMedication]);
    expect(lineMessaging.sendPushMessage).toHaveBeenCalledWith('U1234567890', [mockFlexMessage]);
  });

  it('should only include medications with status Y or Y*', async () => {
    // Arrange
    const mockUser = {
      id: 'user1',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.lineUser.findMany).mockResolvedValue([mockUser]);
    vi.mocked(prisma.medication.findMany).mockResolvedValue([]);

    // Act
    await checkAndNotifyExpiringMedications();

    // Assert
    expect(prisma.medication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: {
            in: ['Y', 'Y*'],
          },
        }),
      })
    );
  });

  it('should calculate threshold date correctly based on daysBeforeExpiration', async () => {
    // Arrange
    const mockUser = {
      id: 'user1',
      lineUserId: 'U1234567890',
      displayName: 'Test User',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.lineUser.findMany).mockResolvedValue([mockUser]);
    vi.mocked(prisma.medication.findMany).mockResolvedValue([]);

    const now = new Date();
    const expectedThreshold = new Date();
    expectedThreshold.setDate(now.getDate() + 15);

    // Act
    await checkAndNotifyExpiringMedications();

    // Assert
    const call = vi.mocked(prisma.medication.findMany).mock.calls[0][0];
    const thresholdDate = call.where.expirationDate.lte;
    
    // Allow for small time differences (within 1 second)
    expect(Math.abs(thresholdDate.getTime() - expectedThreshold.getTime())).toBeLessThan(1000);
  });

  it('should continue processing other users when one user fails', async () => {
    // Arrange
    const mockUser1 = {
      id: 'user1',
      lineUserId: 'U1234567890',
      displayName: 'User 1',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser2 = {
      id: 'user2',
      lineUserId: 'U0987654321',
      displayName: 'User 2',
      pictureUrl: null,
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCategory = {
      id: 'cat1',
      name: 'Pain Relief',
      parentId: null,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const mockMedication = {
      id: 'med1',
      name: 'Aspirin',
      tradeName: null,
      expirationDate: tomorrow,
      status: 'Y',
      dose: '500mg',
      doseDetails: null,
      halfLife: null,
      sideEffects: null,
      notes: null,
      categoryId: 'cat1',
      category: mockCategory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockFlexMessage = {
      type: 'flex',
      altText: 'ยาใกล้หมดอายุ 1 รายการ',
      contents: {},
    };

    vi.mocked(prisma.lineUser.findMany).mockResolvedValue([mockUser1, mockUser2]);
    vi.mocked(prisma.medication.findMany).mockResolvedValue([mockMedication]);
    vi.mocked(flexMessages.createExpirationFlexMessage).mockReturnValue(mockFlexMessage);
    
    // First user succeeds, second user fails
    vi.mocked(lineMessaging.sendPushMessage)
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, error: 'LINE API error' });

    // Act
    const result = await checkAndNotifyExpiringMedications();

    // Assert
    expect(result.count).toBe(1); // Only first user succeeded
    expect(lineMessaging.sendPushMessage).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to send notification'),
      expect.any(Object)
    );
  });

  it('should log start time, end time, and notification count', async () => {
    // Arrange
    vi.mocked(prisma.lineUser.findMany).mockResolvedValue([]);

    // Act
    const result = await checkAndNotifyExpiringMedications();

    // Assert
    expect(console.log).toHaveBeenCalledWith(
      'Starting expiration notification check',
      expect.objectContaining({
        timestamp: expect.any(String),
      })
    );
    expect(console.log).toHaveBeenCalledWith(
      'Notification check completed',
      expect.objectContaining({
        notificationsSent: 0,
        durationMs: expect.any(Number),
        startTime: expect.any(String),
        endTime: expect.any(String),
      })
    );
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('should handle database errors gracefully', async () => {
    // Arrange
    const dbError = new Error('Database connection failed');
    vi.mocked(prisma.lineUser.findMany).mockRejectedValue(dbError);

    // Act & Assert
    await expect(checkAndNotifyExpiringMedications()).rejects.toThrow('Database connection failed');
    expect(console.error).toHaveBeenCalledWith(
      'Notification check failed',
      expect.objectContaining({
        error: 'Database connection failed',
        durationMs: expect.any(Number),
        notificationsSent: 0,
        timestamp: expect.any(String),
      })
    );
  });
});
