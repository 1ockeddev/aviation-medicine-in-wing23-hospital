import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { updateCategoryOrder } from './categories';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Mock auth and prisma
vi.mock('@/lib/auth');
vi.mock('@/lib/prisma', () => ({
  prisma: {
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock Next.js revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('updateCategoryOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: user is authenticated
    vi.mocked(auth).mockResolvedValue({
      user: { id: '1', name: 'Admin', email: 'admin@test.com' },
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should require authentication', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await updateCategoryOrder({
        categoryId: '1',
        newPosition: 2,
      });

      expect(result.error).toBe('ไม่ได้รับอนุญาต');
      expect(result.success).toBeUndefined();
    });

    it('should proceed when user is authenticated', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', name: 'Admin' },
      } as any);

      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '1',
        order: 0,
        parentId: null,
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: '1', order: 0 },
      ] as any);

      const result = await updateCategoryOrder({
        categoryId: '1',
        newPosition: 0,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Category Validation', () => {
    it('should return error when category not found', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      const result = await updateCategoryOrder({
        categoryId: 'nonexistent',
        newPosition: 0,
      });

      expect(result.error).toBe('ไม่พบหมวดหมู่');
      expect(result.success).toBeUndefined();
    });

    it('should find category by ID', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: 'test-id',
        order: 1,
        parentId: 'parent',
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: 'test-id', order: 1 },
      ] as any);

      await updateCategoryOrder({
        categoryId: 'test-id',
        newPosition: 1,
      });

      expect(prisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        select: { id: true, order: true, parentId: true },
      });
    });
  });

  describe('No Change Scenarios', () => {
    it('should return success when position unchanged', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '1',
        order: 2,
        parentId: null,
      } as any);

      const result = await updateCategoryOrder({
        categoryId: '1',
        newPosition: 2,
      });

      expect(result.success).toBe(true);
      expect(prisma.category.findMany).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('Moving Category Down', () => {
    it('should update order when moving category down', async () => {
      // Category '1' at position 0, moving to position 2
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '1',
        order: 0,
        parentId: null,
      } as any);

      // Siblings: '1' at 0, '2' at 1, '3' at 2
      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: '1', order: 0 },
        { id: '2', order: 1 },
        { id: '3', order: 2 },
      ] as any);

      vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}, {}]);

      const result = await updateCategoryOrder({
        categoryId: '1',
        newPosition: 2,
      });

      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should shift intermediate items up when moving down', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: 'a',
        order: 0,
        parentId: 'parent',
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: 'a', order: 0 },
        { id: 'b', order: 1 },
        { id: 'c', order: 2 },
        { id: 'd', order: 3 },
      ] as any);

      const mockTransaction = vi.fn().mockResolvedValue([]);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      await updateCategoryOrder({
        categoryId: 'a',
        newPosition: 3,
      });

      expect(mockTransaction).toHaveBeenCalled();
      const updates = mockTransaction.mock.calls[0][0];
      expect(updates).toHaveLength(4); // a, b, c, d all updated
    });
  });

  describe('Moving Category Up', () => {
    it('should update order when moving category up', async () => {
      // Category '3' at position 2, moving to position 0
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '3',
        order: 2,
        parentId: null,
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: '1', order: 0 },
        { id: '2', order: 1 },
        { id: '3', order: 2 },
      ] as any);

      vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}, {}]);

      const result = await updateCategoryOrder({
        categoryId: '3',
        newPosition: 0,
      });

      expect(result.success).toBe(true);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should shift intermediate items down when moving up', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: 'd',
        order: 3,
        parentId: 'parent',
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: 'a', order: 0 },
        { id: 'b', order: 1 },
        { id: 'c', order: 2 },
        { id: 'd', order: 3 },
      ] as any);

      const mockTransaction = vi.fn().mockResolvedValue([]);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      await updateCategoryOrder({
        categoryId: 'd',
        newPosition: 1,
      });

      expect(mockTransaction).toHaveBeenCalled();
      const updates = mockTransaction.mock.calls[0][0];
      expect(updates).toHaveLength(3); // d, b, c updated (a unchanged)
    });
  });

  describe('Multi-Level Support', () => {
    it('should work with Level 1 categories (parentId null)', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: 'level1-a',
        order: 0,
        parentId: null,
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: 'level1-a', order: 0 },
        { id: 'level1-b', order: 1 },
      ] as any);

      vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}]);

      const result = await updateCategoryOrder({
        categoryId: 'level1-a',
        newPosition: 1,
      });

      expect(result.success).toBe(true);
      
      // Verify query used correct parentId filter
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { parentId: null },
        orderBy: { order: 'asc' },
        select: { id: true, order: true },
      });
    });

    it('should work with Level 2 categories (with parentId)', async () => {
      const parentId = 'parent-123';

      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: 'level2-a',
        order: 0,
        parentId,
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: 'level2-a', order: 0 },
        { id: 'level2-b', order: 1 },
      ] as any);

      vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}]);

      const result = await updateCategoryOrder({
        categoryId: 'level2-a',
        newPosition: 1,
      });

      expect(result.success).toBe(true);
      
      // Verify query filtered by parentId
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: { parentId },
        orderBy: { order: 'asc' },
        select: { id: true, order: true },
      });
    });

    it('should work with Level 3 categories', async () => {
      const parentId = 'level2-parent';

      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: 'level3-x',
        order: 1,
        parentId,
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: 'level3-x', order: 1 },
        { id: 'level3-y', order: 2 },
      ] as any);

      vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}]);

      const result = await updateCategoryOrder({
        categoryId: 'level3-x',
        newPosition: 2,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Transaction Handling', () => {
    it('should use Prisma transaction for atomic updates', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '1',
        order: 0,
        parentId: null,
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: '1', order: 0 },
        { id: '2', order: 1 },
      ] as any);

      vi.mocked(prisma.$transaction).mockResolvedValue([{}, {}]);

      await updateCategoryOrder({
        categoryId: '1',
        newPosition: 1,
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should rollback on transaction failure', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '1',
        order: 0,
        parentId: null,
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: '1', order: 0 },
        { id: '2', order: 1 },
      ] as any);

      vi.mocked(prisma.$transaction).mockRejectedValue(
        new Error('Transaction failed')
      );

      const result = await updateCategoryOrder({
        categoryId: '1',
        newPosition: 1,
      });

      expect(result.error).toBe('เกิดข้อผิดพลาดในการจัดเรียงหมวดหมู่');
      expect(result.success).toBeUndefined();
    });
  });

  describe('Order Sequence Integrity', () => {
    it('should maintain sequential order without gaps', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '2',
        order: 1,
        parentId: null,
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: '1', order: 0 },
        { id: '2', order: 1 },
        { id: '3', order: 2 },
      ] as any);

      const mockTransaction = vi.fn().mockResolvedValue([]);
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction);

      await updateCategoryOrder({
        categoryId: '2',
        newPosition: 0,
      });

      const updates = mockTransaction.mock.calls[0][0];
      
      // Extract new orders from update operations
      const newOrders = updates.map((update: any) => {
        const data = update.data || {};
        return data.order;
      }).filter((order: any) => order !== undefined);

      // All orders should be unique and sequential
      const uniqueOrders = [...new Set(newOrders)].sort((a, b) => a - b);
      expect(uniqueOrders).toEqual(expect.arrayContaining([0, 1, 2]));
    });
  });

  describe('Error Messages', () => {
    it('should return Thai error messages', async () => {
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null);

      const result = await updateCategoryOrder({
        categoryId: 'test',
        newPosition: 0,
      });

      expect(result.error).toMatch(/ไม่พบหมวดหมู่/);
    });

    it('should return generic error on unexpected failure', async () => {
      vi.mocked(prisma.category.findUnique).mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await updateCategoryOrder({
        categoryId: 'test',
        newPosition: 0,
      });

      expect(result.error).toBe('เกิดข้อผิดพลาดในการจัดเรียงหมวดหมู่');
    });
  });

  describe('Path Revalidation', () => {
    it('should revalidate /admin/categories on success', async () => {
      const { revalidatePath } = await import('next/cache');

      vi.mocked(prisma.category.findUnique).mockResolvedValue({
        id: '1',
        order: 0,
        parentId: null,
      } as any);

      vi.mocked(prisma.category.findMany).mockResolvedValue([
        { id: '1', order: 0 },
      ] as any);

      await updateCategoryOrder({
        categoryId: '1',
        newPosition: 0,
      });

      expect(revalidatePath).toHaveBeenCalledWith('/admin/categories');
    });
  });
});
