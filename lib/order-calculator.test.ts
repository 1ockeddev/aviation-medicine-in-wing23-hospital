import { describe, it, expect } from 'vitest';
import { calculateNewOrder, normalizeOrder } from './order-calculator';
import type { CategoryWithOrder } from './order-calculator';

describe('calculateNewOrder', () => {
  describe('moving category down', () => {
    it('should move category from position 0 to 2', () => {
      const siblings: CategoryWithOrder[] = [
        { id: '1', order: 0 },
        { id: '2', order: 1 },
        { id: '3', order: 2 },
      ];
      
      const result = calculateNewOrder('1', 2, siblings);
      
      // Item '1' moves to position 2
      // Items '2' and '3' shift up
      expect(result).toEqual([
        { id: '1', newOrder: 2 },
        { id: '2', newOrder: 0 },
        { id: '3', newOrder: 1 },
      ]);
    });

    it('should move category from position 1 to 3', () => {
      const siblings: CategoryWithOrder[] = [
        { id: 'a', order: 0 },
        { id: 'b', order: 1 },
        { id: 'c', order: 2 },
        { id: 'd', order: 3 },
      ];
      
      const result = calculateNewOrder('b', 3, siblings);
      
      expect(result).toEqual([
        { id: 'b', newOrder: 3 },
        { id: 'c', newOrder: 1 },
        { id: 'd', newOrder: 2 },
      ]);
    });

    it('should move category one position down', () => {
      const siblings: CategoryWithOrder[] = [
        { id: 'x', order: 0 },
        { id: 'y', order: 1 },
        { id: 'z', order: 2 },
      ];
      
      const result = calculateNewOrder('x', 1, siblings);
      
      expect(result).toEqual([
        { id: 'x', newOrder: 1 },
        { id: 'y', newOrder: 0 },
      ]);
    });
  });

  describe('moving category up', () => {
    it('should move category from position 2 to 0', () => {
      const siblings: CategoryWithOrder[] = [
        { id: '1', order: 0 },
        { id: '2', order: 1 },
        { id: '3', order: 2 },
      ];
      
      const result = calculateNewOrder('3', 0, siblings);
      
      // Item '3' moves to position 0
      // Items '1' and '2' shift down
      expect(result).toEqual([
        { id: '3', newOrder: 0 },
        { id: '1', newOrder: 1 },
        { id: '2', newOrder: 2 },
      ]);
    });

    it('should move category from position 3 to 1', () => {
      const siblings: CategoryWithOrder[] = [
        { id: 'a', order: 0 },
        { id: 'b', order: 1 },
        { id: 'c', order: 2 },
        { id: 'd', order: 3 },
      ];
      
      const result = calculateNewOrder('d', 1, siblings);
      
      expect(result).toEqual([
        { id: 'd', newOrder: 1 },
        { id: 'b', newOrder: 2 },
        { id: 'c', newOrder: 3 },
      ]);
    });

    it('should move category one position up', () => {
      const siblings: CategoryWithOrder[] = [
        { id: 'x', order: 0 },
        { id: 'y', order: 1 },
        { id: 'z', order: 2 },
      ];
      
      const result = calculateNewOrder('z', 1, siblings);
      
      expect(result).toEqual([
        { id: 'z', newOrder: 1 },
        { id: 'y', newOrder: 2 },
      ]);
    });
  });

  describe('edge cases', () => {
    it('should return empty array if position unchanged', () => {
      const siblings: CategoryWithOrder[] = [
        { id: '1', order: 0 },
        { id: '2', order: 1 },
        { id: '3', order: 2 },
      ];
      
      const result = calculateNewOrder('2', 1, siblings);
      
      expect(result).toEqual([]);
    });

    it('should return empty array if category not found', () => {
      const siblings: CategoryWithOrder[] = [
        { id: '1', order: 0 },
        { id: '2', order: 1 },
      ];
      
      const result = calculateNewOrder('nonexistent', 1, siblings);
      
      expect(result).toEqual([]);
    });

    it('should handle single item list', () => {
      const siblings: CategoryWithOrder[] = [
        { id: '1', order: 0 },
      ];
      
      const result = calculateNewOrder('1', 0, siblings);
      
      expect(result).toEqual([]);
    });

    it('should handle two items swapping positions', () => {
      const siblings: CategoryWithOrder[] = [
        { id: 'first', order: 0 },
        { id: 'second', order: 1 },
      ];
      
      const result = calculateNewOrder('first', 1, siblings);
      
      expect(result).toEqual([
        { id: 'first', newOrder: 1 },
        { id: 'second', newOrder: 0 },
      ]);
    });
  });

  describe('ensures no gaps in order sequence', () => {
    it('should maintain sequential order after moving down', () => {
      const siblings: CategoryWithOrder[] = [
        { id: 'a', order: 0 },
        { id: 'b', order: 1 },
        { id: 'c', order: 2 },
        { id: 'd', order: 3 },
        { id: 'e', order: 4 },
      ];
      
      const result = calculateNewOrder('b', 4, siblings);
      
      // Extract all new orders including unchanged ones
      const orderMap = new Map(result.map(u => [u.id, u.newOrder]));
      siblings.forEach(s => {
        if (!orderMap.has(s.id)) {
          orderMap.set(s.id, s.order);
        }
      });
      
      const allOrders = Array.from(orderMap.values()).sort((a, b) => a - b);
      
      // Verify no gaps: should be [0, 1, 2, 3, 4]
      expect(allOrders).toEqual([0, 1, 2, 3, 4]);
    });

    it('should maintain sequential order after moving up', () => {
      const siblings: CategoryWithOrder[] = [
        { id: 'a', order: 0 },
        { id: 'b', order: 1 },
        { id: 'c', order: 2 },
        { id: 'd', order: 3 },
        { id: 'e', order: 4 },
      ];
      
      const result = calculateNewOrder('d', 0, siblings);
      
      // Extract all new orders including unchanged ones
      const orderMap = new Map(result.map(u => [u.id, u.newOrder]));
      siblings.forEach(s => {
        if (!orderMap.has(s.id)) {
          orderMap.set(s.id, s.order);
        }
      });
      
      const allOrders = Array.from(orderMap.values()).sort((a, b) => a - b);
      
      // Verify no gaps: should be [0, 1, 2, 3, 4]
      expect(allOrders).toEqual([0, 1, 2, 3, 4]);
    });
  });
});

describe('normalizeOrder', () => {
  it('should normalize orders with gaps', () => {
    const categories: CategoryWithOrder[] = [
      { id: '1', order: 0 },
      { id: '2', order: 5 },
      { id: '3', order: 7 },
    ];
    
    const result = normalizeOrder(categories);
    
    expect(result).toEqual([
      { id: '2', newOrder: 1 },
      { id: '3', newOrder: 2 },
    ]);
  });

  it('should return empty array if already normalized', () => {
    const categories: CategoryWithOrder[] = [
      { id: '1', order: 0 },
      { id: '2', order: 1 },
      { id: '3', order: 2 },
    ];
    
    const result = normalizeOrder(categories);
    
    expect(result).toEqual([]);
  });

  it('should handle out-of-order items', () => {
    const categories: CategoryWithOrder[] = [
      { id: 'c', order: 10 },
      { id: 'a', order: 2 },
      { id: 'b', order: 5 },
    ];
    
    const result = normalizeOrder(categories);
    
    // Should sort by current order, then assign 0, 1, 2
    expect(result).toEqual([
      { id: 'a', newOrder: 0 },
      { id: 'b', newOrder: 1 },
      { id: 'c', newOrder: 2 },
    ]);
  });

  it('should handle empty array', () => {
    const result = normalizeOrder([]);
    
    expect(result).toEqual([]);
  });

  it('should handle single item', () => {
    const categories: CategoryWithOrder[] = [
      { id: '1', order: 0 },
    ];
    
    const result = normalizeOrder(categories);
    
    expect(result).toEqual([]);
  });

  it('should normalize single item with wrong order', () => {
    const categories: CategoryWithOrder[] = [
      { id: '1', order: 5 },
    ];
    
    const result = normalizeOrder(categories);
    
    expect(result).toEqual([
      { id: '1', newOrder: 0 },
    ]);
  });
});
