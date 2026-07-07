import { describe, it, expect } from 'vitest';
import { validateDrop } from './drag-validation';

describe('validateDrop', () => {
  describe('Valid Drops - Same Parent', () => {
    it('should allow drop with same parent ID', () => {
      const activeCategory = { id: '1', parentId: 'parent-a' };
      const overCategory = { id: '2', parentId: 'parent-a' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBeNull();
    });

    it('should allow drop for top-level categories (both parentId null)', () => {
      const activeCategory = { id: '1', parentId: null };
      const overCategory = { id: '2', parentId: null };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBeNull();
    });

    it('should allow drop when dragging to same sibling group', () => {
      const activeCategory = { id: 'cat-1', parentId: 'parent-123' };
      const overCategory = { id: 'cat-2', parentId: 'parent-123' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBeNull();
    });

    it('should allow drop within Level 2 categories', () => {
      const activeCategory = { id: 'level2-a', parentId: 'level1-parent' };
      const overCategory = { id: 'level2-b', parentId: 'level1-parent' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBeNull();
    });

    it('should allow drop within Level 3 categories', () => {
      const activeCategory = { id: 'level3-x', parentId: 'level2-parent' };
      const overCategory = { id: 'level3-y', parentId: 'level2-parent' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBeNull();
    });
  });

  describe('Invalid Drops - Different Parent', () => {
    it('should reject drop with different parent IDs', () => {
      const activeCategory = { id: '1', parentId: 'parent-a' };
      const overCategory = { id: '2', parentId: 'parent-b' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBe('ไม่สามารถย้ายหมวดหมู่ไปยังระดับอื่นได้');
    });

    it('should reject drop from Level 1 to Level 2', () => {
      const activeCategory = { id: '1', parentId: null };
      const overCategory = { id: '2', parentId: 'some-parent' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBe('ไม่สามารถย้ายหมวดหมู่ไปยังระดับอื่นได้');
    });

    it('should reject drop from Level 2 to Level 1', () => {
      const activeCategory = { id: '1', parentId: 'some-parent' };
      const overCategory = { id: '2', parentId: null };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBe('ไม่สามารถย้ายหมวดหมู่ไปยังระดับอื่นได้');
    });

    it('should reject drop between different Level 2 groups', () => {
      const activeCategory = { id: 'cat-1', parentId: 'parent-a' };
      const overCategory = { id: 'cat-2', parentId: 'parent-b' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBe('ไม่สามารถย้ายหมวดหมู่ไปยังระดับอื่นได้');
    });

    it('should reject drop between different Level 3 groups', () => {
      const activeCategory = { id: 'level3-a', parentId: 'level2-parent-x' };
      const overCategory = { id: 'level3-b', parentId: 'level2-parent-y' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBe('ไม่สามารถย้ายหมวดหมู่ไปยังระดับอื่นได้');
    });
  });

  describe('Error Messages', () => {
    it('should return Thai error message', () => {
      const activeCategory = { id: '1', parentId: 'a' };
      const overCategory = { id: '2', parentId: 'b' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBe('ไม่สามารถย้ายหมวดหมู่ไปยังระดับอื่นได้');
      expect(error).toMatch(/ไม่สามารถ/); // Contains Thai text
    });

    it('should return null (no error) for valid drops', () => {
      const activeCategory = { id: '1', parentId: 'same' };
      const overCategory = { id: '2', parentId: 'same' };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBeNull();
      expect(error).not.toBe('');
      expect(error).not.toBe(undefined);
    });
  });

  describe('Edge Cases', () => {
    it('should handle same category ID (drag to itself)', () => {
      const activeCategory = { id: 'same-id', parentId: 'parent' };
      const overCategory = { id: 'same-id', parentId: 'parent' };

      const error = validateDrop(activeCategory, overCategory);

      // Should allow since parentId matches (handleDragEnd will filter this out)
      expect(error).toBeNull();
    });

    it('should handle empty string parent IDs consistently', () => {
      const activeCategory = { id: '1', parentId: '' as any };
      const overCategory = { id: '2', parentId: '' as any };

      const error = validateDrop(activeCategory, overCategory);

      // Empty strings are equal, so should allow
      expect(error).toBeNull();
    });

    it('should distinguish between null and empty string', () => {
      const activeCategory = { id: '1', parentId: null };
      const overCategory = { id: '2', parentId: '' as any };

      const error = validateDrop(activeCategory, overCategory);

      // null !== '' so should reject
      expect(error).toBe('ไม่สามารถย้ายหมวดหมู่ไปยังระดับอื่นได้');
    });

    it('should handle long parent IDs', () => {
      const longId = 'a'.repeat(100);
      const activeCategory = { id: '1', parentId: longId };
      const overCategory = { id: '2', parentId: longId };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBeNull();
    });

    it('should handle special characters in parent IDs', () => {
      const specialId = 'parent-#$%^&*()';
      const activeCategory = { id: '1', parentId: specialId };
      const overCategory = { id: '2', parentId: specialId };

      const error = validateDrop(activeCategory, overCategory);

      expect(error).toBeNull();
    });
  });

  describe('Type Safety', () => {
    it('should accept CategoryDropData interface', () => {
      const active: { id: string; parentId: string | null } = {
        id: 'test-1',
        parentId: 'parent',
      };
      const over: { id: string; parentId: string | null } = {
        id: 'test-2',
        parentId: 'parent',
      };

      const error = validateDrop(active, over);

      expect(error).toBeNull();
    });

    it('should handle null parentId type correctly', () => {
      const active: { id: string; parentId: null } = {
        id: 'test-1',
        parentId: null,
      };
      const over: { id: string; parentId: null } = {
        id: 'test-2',
        parentId: null,
      };

      const error = validateDrop(active, over);

      expect(error).toBeNull();
    });
  });
});
