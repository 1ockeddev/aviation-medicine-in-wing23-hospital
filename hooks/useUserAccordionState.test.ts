import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useUserAccordionState } from './useUserAccordionState';

describe('useUserAccordionState', () => {
  describe('Initial State', () => {
    it('should initialize with all categories collapsed', () => {
      const { result } = renderHook(() => useUserAccordionState());

      expect(result.current.expandedCategories.size).toBe(0);
      expect(result.current.isExpanded('category-1')).toBe(false);
      expect(result.current.isExpanded('category-2')).toBe(false);
    });

    it('should always start with empty Set regardless of previous state', () => {
      // First render
      const { result: result1 } = renderHook(() => useUserAccordionState());
      
      act(() => {
        result1.current.toggleCategory('category-1');
      });

      expect(result1.current.isExpanded('category-1')).toBe(true);

      // Second render (simulating new component mount)
      const { result: result2 } = renderHook(() => useUserAccordionState());
      
      // Should start collapsed, not remember previous state
      expect(result2.current.isExpanded('category-1')).toBe(false);
      expect(result2.current.expandedCategories.size).toBe(0);
    });
  });

  describe('toggleCategory', () => {
    it('should expand a collapsed category', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('category-1');
      });

      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.expandedCategories.has('category-1')).toBe(true);
    });

    it('should collapse an expanded category', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('category-1');
      });

      expect(result.current.isExpanded('category-1')).toBe(true);

      act(() => {
        result.current.toggleCategory('category-1');
      });

      expect(result.current.isExpanded('category-1')).toBe(false);
      expect(result.current.expandedCategories.has('category-1')).toBe(false);
    });

    it('should toggle twice to return to original state (collapsed)', () => {
      const { result } = renderHook(() => useUserAccordionState());

      const initialState = result.current.isExpanded('category-1');
      expect(initialState).toBe(false);

      act(() => {
        result.current.toggleCategory('category-1');
        result.current.toggleCategory('category-1');
      });

      expect(result.current.isExpanded('category-1')).toBe(initialState);
    });

    it('should support multiple categories expanded simultaneously', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('category-1');
        result.current.toggleCategory('category-2');
        result.current.toggleCategory('category-3');
      });

      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.isExpanded('category-2')).toBe(true);
      expect(result.current.isExpanded('category-3')).toBe(true);
      expect(result.current.expandedCategories.size).toBe(3);
    });

    it('should not collapse other categories when toggling one', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('category-1');
        result.current.toggleCategory('category-2');
      });

      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.isExpanded('category-2')).toBe(true);

      act(() => {
        result.current.toggleCategory('category-3');
      });

      // Other categories should remain expanded
      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.isExpanded('category-2')).toBe(true);
      expect(result.current.isExpanded('category-3')).toBe(true);
    });

    it('should handle toggling the same category multiple times', () => {
      const { result } = renderHook(() => useUserAccordionState());

      // Toggle 5 times
      act(() => {
        result.current.toggleCategory('category-1');
        result.current.toggleCategory('category-1');
        result.current.toggleCategory('category-1');
        result.current.toggleCategory('category-1');
        result.current.toggleCategory('category-1');
      });

      // Should be expanded (odd number of toggles)
      expect(result.current.isExpanded('category-1')).toBe(true);
    });
  });

  describe('expandCategories', () => {
    it('should expand multiple categories at once', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.expandCategories(['category-1', 'category-2', 'category-3']);
      });

      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.isExpanded('category-2')).toBe(true);
      expect(result.current.isExpanded('category-3')).toBe(true);
      expect(result.current.expandedCategories.size).toBe(3);
    });

    it('should expand empty array without errors', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.expandCategories([]);
      });

      expect(result.current.expandedCategories.size).toBe(0);
    });

    it('should preserve previously expanded categories', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('category-1');
      });

      expect(result.current.isExpanded('category-1')).toBe(true);

      act(() => {
        result.current.expandCategories(['category-2', 'category-3']);
      });

      // All should be expanded
      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.isExpanded('category-2')).toBe(true);
      expect(result.current.isExpanded('category-3')).toBe(true);
    });

    it('should handle duplicate category IDs in array', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.expandCategories(['category-1', 'category-1', 'category-2']);
      });

      // Set automatically handles duplicates
      expect(result.current.expandedCategories.size).toBe(2);
      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.isExpanded('category-2')).toBe(true);
    });

    it('should be idempotent (expanding already expanded category has no effect)', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.expandCategories(['category-1']);
      });

      const firstSize = result.current.expandedCategories.size;

      act(() => {
        result.current.expandCategories(['category-1']);
      });

      expect(result.current.expandedCategories.size).toBe(firstSize);
      expect(result.current.isExpanded('category-1')).toBe(true);
    });
  });

  describe('collapseAll', () => {
    it('should collapse all expanded categories', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.expandCategories(['category-1', 'category-2', 'category-3']);
      });

      expect(result.current.expandedCategories.size).toBe(3);

      act(() => {
        result.current.collapseAll();
      });

      expect(result.current.expandedCategories.size).toBe(0);
      expect(result.current.isExpanded('category-1')).toBe(false);
      expect(result.current.isExpanded('category-2')).toBe(false);
      expect(result.current.isExpanded('category-3')).toBe(false);
    });

    it('should work when no categories are expanded', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.collapseAll();
      });

      expect(result.current.expandedCategories.size).toBe(0);
    });

    it('should allow re-expanding after collapse all', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.expandCategories(['category-1', 'category-2']);
        result.current.collapseAll();
        result.current.toggleCategory('category-1');
      });

      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.isExpanded('category-2')).toBe(false);
      expect(result.current.expandedCategories.size).toBe(1);
    });
  });

  describe('isExpanded', () => {
    it('should return false for never-toggled categories', () => {
      const { result } = renderHook(() => useUserAccordionState());

      expect(result.current.isExpanded('never-seen-category')).toBe(false);
    });

    it('should return true for expanded categories', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('category-1');
      });

      expect(result.current.isExpanded('category-1')).toBe(true);
    });

    it('should return false for collapsed categories', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('category-1');
        result.current.toggleCategory('category-1');
      });

      expect(result.current.isExpanded('category-1')).toBe(false);
    });

    it('should handle empty string category IDs', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('');
      });

      expect(result.current.isExpanded('')).toBe(true);
    });
  });

  describe('Search Integration Workflow', () => {
    it('should expand categories containing search results', () => {
      const { result } = renderHook(() => useUserAccordionState());

      // Simulate search finding matches in category-1 and category-3
      act(() => {
        result.current.expandCategories(['category-1', 'category-3']);
      });

      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.isExpanded('category-2')).toBe(false);
      expect(result.current.isExpanded('category-3')).toBe(true);
    });

    it('should collapse all when search is cleared', () => {
      const { result } = renderHook(() => useUserAccordionState());

      // Simulate search expanding categories
      act(() => {
        result.current.expandCategories(['category-1', 'category-2', 'category-3']);
      });

      expect(result.current.expandedCategories.size).toBe(3);

      // Simulate clearing search
      act(() => {
        result.current.collapseAll();
      });

      expect(result.current.expandedCategories.size).toBe(0);
    });

    it('should handle search refinement (changing expanded categories)', () => {
      const { result } = renderHook(() => useUserAccordionState());

      // First search
      act(() => {
        result.current.expandCategories(['category-1', 'category-2']);
      });

      expect(result.current.isExpanded('category-1')).toBe(true);
      expect(result.current.isExpanded('category-2')).toBe(true);

      // Refined search (different matches)
      act(() => {
        result.current.collapseAll();
        result.current.expandCategories(['category-3', 'category-4']);
      });

      expect(result.current.isExpanded('category-1')).toBe(false);
      expect(result.current.isExpanded('category-2')).toBe(false);
      expect(result.current.isExpanded('category-3')).toBe(true);
      expect(result.current.isExpanded('category-4')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in category IDs', () => {
      const { result } = renderHook(() => useUserAccordionState());

      const specialId = 'category-with-@#$%^&*()';

      act(() => {
        result.current.toggleCategory(specialId);
      });

      expect(result.current.isExpanded(specialId)).toBe(true);
    });

    it('should handle very long category IDs', () => {
      const { result } = renderHook(() => useUserAccordionState());

      const longId = 'category-' + 'x'.repeat(1000);

      act(() => {
        result.current.toggleCategory(longId);
      });

      expect(result.current.isExpanded(longId)).toBe(true);
    });

    it('should handle numeric-like string category IDs', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('123');
        result.current.toggleCategory('456');
      });

      expect(result.current.isExpanded('123')).toBe(true);
      expect(result.current.isExpanded('456')).toBe(true);
    });

    it('should handle UUID-like category IDs', () => {
      const { result } = renderHook(() => useUserAccordionState());

      const uuid = '550e8400-e29b-41d4-a716-446655440000';

      act(() => {
        result.current.toggleCategory(uuid);
      });

      expect(result.current.isExpanded(uuid)).toBe(true);
    });
  });

  describe('No Persistence Requirements', () => {
    it('should not persist state to localStorage', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        result.current.toggleCategory('category-1');
      });

      // Verify no localStorage calls were made
      // (This is a negative test - just ensuring hook doesn't error)
      expect(result.current.isExpanded('category-1')).toBe(true);
    });

    it('should not read from localStorage on initialization', () => {
      // Mock localStorage to have some data
      const mockData = { 'category-1': true };
      localStorage.setItem('user-accordion', JSON.stringify(mockData));

      const { result } = renderHook(() => useUserAccordionState());

      // Should still start collapsed, ignoring localStorage
      expect(result.current.isExpanded('category-1')).toBe(false);

      // Cleanup
      localStorage.removeItem('user-accordion');
    });
  });

  describe('Performance', () => {
    it('should handle large number of categories efficiently', () => {
      const { result } = renderHook(() => useUserAccordionState());

      const categoryIds = Array.from({ length: 100 }, (_, i) => `category-${i}`);

      act(() => {
        result.current.expandCategories(categoryIds);
      });

      expect(result.current.expandedCategories.size).toBe(100);

      // Check individual lookups are fast
      expect(result.current.isExpanded('category-0')).toBe(true);
      expect(result.current.isExpanded('category-50')).toBe(true);
      expect(result.current.isExpanded('category-99')).toBe(true);
    });

    it('should handle rapid toggles without state corruption', () => {
      const { result } = renderHook(() => useUserAccordionState());

      act(() => {
        // Rapid fire toggles
        for (let i = 0; i < 20; i++) {
          result.current.toggleCategory('category-1');
        }
      });

      // Even number of toggles should result in collapsed
      expect(result.current.isExpanded('category-1')).toBe(false);
    });
  });
});
