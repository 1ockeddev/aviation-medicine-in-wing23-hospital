import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendExpiryNotification } from './line-messaging';

// Mock dependencies
vi.mock('./prisma', () => ({
  prisma: {
    medication: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('./flex-messages', () => ({
  createExpirationFlexMessage: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('sendExpiryNotification', () => {
  const mockLineUserId = 'U1234567890';
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, LINE_CHANNEL_ACCESS_TOKEN: 'test-token' };
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return error when no medications are expiring soon', async () => {
    const { prisma } = await import('./prisma');
    const { createExpirationFlexMessage } = await import('./flex-messages');
    
    vi.mocked(prisma.medication.findMany).mockResolvedValueOnce([]);

    const result = await sendExpiryNotification(mockLineUserId);

    expect(result).toEqual({
      success: false,
      error: 'No medications found expiring soon',
    });

    expect(prisma.medication.findMany).toHaveBeenCalledWith({
      where: {
        expirationDate: {
          lte: expect.any(Date),
          gte: expect.any(Date),
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        expirationDate: 'asc',
      },
    });

    expect(createExpirationFlexMessage).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should send notification successfully with medications expiring within 30 days', async () => {
    const { prisma } = await import('./prisma');
    const { createExpirationFlexMessage } = await import('./flex-messages');
    
    const mockMedications = [
      {
        id: '1',
        name: 'Paracetamol',
        tradeName: 'Tylenol',
        expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-1',
          name: 'ยาแก้ปวด',
          parentId: null,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: '2',
        name: 'Amoxicillin',
        tradeName: 'Amoxil',
        expirationDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
        categoryId: 'cat-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-2',
          name: 'ยาปฏิชีวนะ',
          parentId: null,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ];

    const mockFlexMessage = {
      type: 'flex',
      altText: 'แจ้งเตือนยาใกล้หมดอายุ 2 รายการ',
      contents: { type: 'carousel', contents: [] },
    };

    vi.mocked(prisma.medication.findMany).mockResolvedValueOnce(mockMedications as any);
    vi.mocked(createExpirationFlexMessage).mockReturnValueOnce(mockFlexMessage as any);
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    } as Response);

    const result = await sendExpiryNotification(mockLineUserId);

    expect(result).toEqual({
      success: true,
      medicationCount: 2,
    });

    expect(prisma.medication.findMany).toHaveBeenCalled();
    expect(createExpirationFlexMessage).toHaveBeenCalledWith(mockMedications);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.line.me/v2/bot/message/push',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({
          to: mockLineUserId,
          messages: [mockFlexMessage],
        }),
      })
    );
  });

  it('should handle LINE API errors', async () => {
    const { prisma } = await import('./prisma');
    const { createExpirationFlexMessage } = await import('./flex-messages');
    
    const mockMedications = [
      {
        id: '1',
        name: 'Paracetamol',
        tradeName: 'Tylenol',
        expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        categoryId: 'cat-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-1',
          name: 'ยาแก้ปวด',
          parentId: null,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ];

    const mockFlexMessage = {
      type: 'flex',
      altText: 'แจ้งเตือนยาใกล้หมดอายุ',
      contents: { type: 'bubble', body: {} },
    };

    vi.mocked(prisma.medication.findMany).mockResolvedValueOnce(mockMedications as any);
    vi.mocked(createExpirationFlexMessage).mockReturnValueOnce(mockFlexMessage as any);
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Invalid request' }),
    } as Response);

    const result = await sendExpiryNotification(mockLineUserId);

    expect(result).toEqual({
      success: false,
      error: 'Invalid request',
      medicationCount: 1,
    });
  });

  it('should handle database errors', async () => {
    const { prisma } = await import('./prisma');
    const { createExpirationFlexMessage } = await import('./flex-messages');
    
    vi.mocked(prisma.medication.findMany).mockRejectedValueOnce(new Error('Database connection failed'));

    const result = await sendExpiryNotification(mockLineUserId);

    expect(result).toEqual({
      success: false,
      error: 'Database connection failed',
    });

    expect(createExpirationFlexMessage).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should only fetch medications expiring between now and 30 days from now', async () => {
    const { prisma } = await import('./prisma');
    
    vi.mocked(prisma.medication.findMany).mockResolvedValueOnce([]);

    await sendExpiryNotification(mockLineUserId);

    const callArgs = vi.mocked(prisma.medication.findMany).mock.calls[0][0];
    const whereClause = callArgs?.where?.expirationDate;

    expect(whereClause).toBeDefined();
    expect(whereClause?.gte).toBeInstanceOf(Date);
    expect(whereClause?.lte).toBeInstanceOf(Date);

    // Verify the date range is approximately 30 days
    const lteDate = whereClause?.lte as Date;
    const gteDate = whereClause?.gte as Date;
    const diffInDays = Math.round((lteDate.getTime() - gteDate.getTime()) / (1000 * 60 * 60 * 24));

    expect(diffInDays).toBe(30);
  });
});
