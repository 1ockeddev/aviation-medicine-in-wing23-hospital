import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLineUser, updateLineUser, deleteLineUser } from './line-users';
import type { ActionState } from '@/types';

// Mock modules
vi.mock('@/lib/prisma', () => ({
  prisma: {
    lineUser: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

describe('createLineUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful creation with valid data (Req 4.1, 10.2)', () => {
    it('should create LINE user with all required fields', async () => {
      // Mock authenticated session
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockLineUser = {
        id: 'line123',
        lineUserId: 'U1234567890abcdef',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/picture.jpg',
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      };
      
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.create).mockResolvedValue(mockLineUser as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('pictureUrl', 'https://example.com/picture.jpg');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          lineUserId: 'U1234567890abcdef',
          displayName: 'Test User',
          pictureUrl: 'https://example.com/picture.jpg',
          notificationsEnabled: true,
          daysBeforeExpiration: 30,
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/admin/line-users');
    });

    it('should create LINE user with notifications disabled', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockLineUser = {
        id: 'line124',
        lineUserId: 'U9876543210fedcba',
        displayName: 'Inactive User',
        notificationsEnabled: false,
        daysBeforeExpiration: 7,
      };
      
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.create).mockResolvedValue(mockLineUser as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U9876543210fedcba');
      formData.append('displayName', 'Inactive User');
      formData.append('notificationsEnabled', 'false');
      formData.append('daysBeforeExpiration', '7');

      const result = await createLineUser(undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          notificationsEnabled: false,
          daysBeforeExpiration: 7,
        }),
      });
    });

    it('should create LINE user without optional pictureUrl', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockLineUser = {
        id: 'line125',
        lineUserId: 'U1111222233334444',
        displayName: 'No Picture User',
        pictureUrl: '',
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
      };
      
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.create).mockResolvedValue(mockLineUser as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1111222233334444');
      formData.append('displayName', 'No Picture User');
      formData.append('pictureUrl', '');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.create).toHaveBeenCalled();
    });
  });

  describe('validation error handling (Req 10.2, 10.3)', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
    });

    it('should reject empty LINE User ID', async () => {
      const formData = new FormData();
      formData.append('lineUserId', '');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.error).toBe('LINE User ID is required');
      expect(prisma.lineUser.create).not.toHaveBeenCalled();
    });

    it('should reject missing LINE User ID', async () => {
      const formData = new FormData();
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.error).toBeTruthy();
      expect(prisma.lineUser.create).not.toHaveBeenCalled();
    });

    it('should reject empty display name', async () => {
      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', '');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.error).toBe('Display name is required');
      expect(prisma.lineUser.create).not.toHaveBeenCalled();
    });

    it('should reject invalid picture URL format', async () => {
      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('pictureUrl', 'not-a-valid-url');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.error).toBeTruthy();
      expect(prisma.lineUser.create).not.toHaveBeenCalled();
    });

    it('should reject daysBeforeExpiration less than 1', async () => {
      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '0');

      const result = await createLineUser(undefined, formData);

      expect(result.error).toBe('Must be at least 1 day');
      expect(prisma.lineUser.create).not.toHaveBeenCalled();
    });

    it('should reject daysBeforeExpiration greater than 90', async () => {
      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '91');

      const result = await createLineUser(undefined, formData);

      expect(result.error).toBe('Must be at most 90 days');
      expect(prisma.lineUser.create).not.toHaveBeenCalled();
    });

    it('should accept daysBeforeExpiration at boundary value 1', async () => {
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.create).mockResolvedValue({ id: 'line126' } as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '1');

      const result = await createLineUser(undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.create).toHaveBeenCalled();
    });

    it('should accept daysBeforeExpiration at boundary value 90', async () => {
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.create).mockResolvedValue({ id: 'line127' } as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '90');

      const result = await createLineUser(undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.create).toHaveBeenCalled();
    });
  });

  describe('duplicate LINE User ID handling (Req 4.1)', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
    });

    it('should reject duplicate LINE User ID', async () => {
      const existingUser = {
        id: 'existing123',
        lineUserId: 'U1234567890abcdef',
        displayName: 'Existing User',
      };

      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(existingUser as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.error).toBe('LINE User ID นี้มีอยู่ในระบบแล้ว');
      expect(prisma.lineUser.create).not.toHaveBeenCalled();
    });
  });

  describe('authorization checks (Req 10.1)', () => {
    it('should reject unauthorized user', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.error).toBe('ไม่ได้รับอนุญาต');
      expect(prisma.lineUser.create).not.toHaveBeenCalled();
    });

    it('should allow authorized user', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1', username: 'admin' } } as any);
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.create).mockResolvedValue({ id: 'line128' } as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.create).toHaveBeenCalled();
    });
  });

  describe('database error handling (Req 12.1, 12.3)', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.create).mockRejectedValue(new Error('Database error'));

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await createLineUser(undefined, formData);

      expect(result.error).toBe('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    });
  });
});

describe('updateLineUser', () => {
  const lineUserId = 'line123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful update operation (Req 4.2, 10.2)', () => {
    it('should update LINE user with valid data', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockUpdatedUser = {
        id: lineUserId,
        lineUserId: 'U1234567890abcdef',
        displayName: 'Updated User',
        notificationsEnabled: true,
        daysBeforeExpiration: 60,
      };
      
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.update).mockResolvedValue(mockUpdatedUser as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Updated User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '60');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.update).toHaveBeenCalledWith({
        where: { id: lineUserId },
        data: expect.objectContaining({
          lineUserId: 'U1234567890abcdef',
          displayName: 'Updated User',
          notificationsEnabled: true,
          daysBeforeExpiration: 60,
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/admin/line-users');
    });

    it('should update notification preferences', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.update).mockResolvedValue({ id: lineUserId } as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'false');
      formData.append('daysBeforeExpiration', '14');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.update).toHaveBeenCalledWith({
        where: { id: lineUserId },
        data: expect.objectContaining({
          notificationsEnabled: false,
          daysBeforeExpiration: 14,
        }),
      });
    });

    it('should allow updating same LINE User ID for same record', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const existingUser = {
        id: lineUserId,
        lineUserId: 'U1234567890abcdef',
        displayName: 'Test User',
      };
      
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(existingUser as any);
      vi.mocked(prisma.lineUser.update).mockResolvedValue(existingUser as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Updated Name');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.update).toHaveBeenCalled();
    });
  });

  describe('validation errors (Req 10.2, 10.3)', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
    });

    it('should reject empty LINE User ID', async () => {
      const formData = new FormData();
      formData.append('lineUserId', '');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.error).toBe('LINE User ID is required');
      expect(prisma.lineUser.update).not.toHaveBeenCalled();
    });

    it('should reject empty display name', async () => {
      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', '');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.error).toBe('Display name is required');
      expect(prisma.lineUser.update).not.toHaveBeenCalled();
    });

    it('should reject invalid daysBeforeExpiration', async () => {
      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '100');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.error).toBe('Must be at most 90 days');
      expect(prisma.lineUser.update).not.toHaveBeenCalled();
    });
  });

  describe('duplicate LINE User ID handling (Req 4.2)', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
    });

    it('should reject updating to existing LINE User ID', async () => {
      const existingUser = {
        id: 'different123',
        lineUserId: 'U9876543210fedcba',
        displayName: 'Another User',
      };

      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(existingUser as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U9876543210fedcba');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.error).toBe('LINE User ID นี้มีอยู่ในระบบแล้ว');
      expect(prisma.lineUser.update).not.toHaveBeenCalled();
    });
  });

  describe('authorization checks (Req 10.1)', () => {
    it('should reject unauthorized user', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.error).toBe('ไม่ได้รับอนุญาต');
      expect(prisma.lineUser.update).not.toHaveBeenCalled();
    });

    it('should allow authorized user', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1', username: 'admin' } } as any);
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.update).mockResolvedValue({ id: lineUserId } as any);

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.update).toHaveBeenCalled();
    });
  });

  describe('database error handling (Req 12.1, 12.3)', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.lineUser.update).mockRejectedValue(new Error('Database error'));

      const formData = new FormData();
      formData.append('lineUserId', 'U1234567890abcdef');
      formData.append('displayName', 'Test User');
      formData.append('notificationsEnabled', 'true');
      formData.append('daysBeforeExpiration', '30');

      const result = await updateLineUser(lineUserId, undefined, formData);

      expect(result.error).toBe('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
    });
  });
});

describe('deleteLineUser', () => {
  const lineUserId = 'line123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful deletion (Req 4.3, 4.4)', () => {
    it('should delete LINE user successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockUser = {
        id: lineUserId,
        lineUserId: 'U1234567890abcdef',
        displayName: 'Test User',
      };
      
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.lineUser.delete).mockResolvedValue(mockUser as any);

      const result = await deleteLineUser(lineUserId);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.delete).toHaveBeenCalledWith({
        where: { id: lineUserId },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/admin/line-users');
    });

    it('should revalidate LINE users page cache after deletion', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockUser = {
        id: lineUserId,
        lineUserId: 'U1234567890abcdef',
        displayName: 'Test User',
      };
      
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.lineUser.delete).mockResolvedValue(mockUser as any);

      await deleteLineUser(lineUserId);

      expect(revalidatePath).toHaveBeenCalledWith('/admin/line-users');
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling for non-existent user (Req 4.4)', () => {
    it('should handle non-existent LINE user', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(null);

      const result = await deleteLineUser('non-existent-id');

      expect(result.error).toBe('ไม่พบข้อมูลผู้ใช้');
      expect(prisma.lineUser.delete).not.toHaveBeenCalled();
    });
  });

  describe('authorization checks (Req 10.1)', () => {
    it('should reject unauthorized user', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await deleteLineUser(lineUserId);

      expect(result.error).toBe('ไม่ได้รับอนุญาต');
      expect(prisma.lineUser.delete).not.toHaveBeenCalled();
    });

    it('should allow authorized user to delete', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1', username: 'admin' } } as any);
      
      const mockUser = {
        id: lineUserId,
        lineUserId: 'U1234567890abcdef',
        displayName: 'Test User',
      };
      
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.lineUser.delete).mockResolvedValue(mockUser as any);

      const result = await deleteLineUser(lineUserId);

      expect(result.success).toBe(true);
      expect(prisma.lineUser.delete).toHaveBeenCalled();
    });
  });

  describe('database error handling (Req 12.1, 12.3)', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockUser = {
        id: lineUserId,
        lineUserId: 'U1234567890abcdef',
        displayName: 'Test User',
      };
      
      vi.mocked(prisma.lineUser.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.lineUser.delete).mockRejectedValue(new Error('Database error'));

      const result = await deleteLineUser(lineUserId);

      expect(result.error).toBe('เกิดข้อผิดพลาดในการลบข้อมูล');
      expect(result.success).toBeUndefined();
    });
  });
});
