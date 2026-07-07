import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccordionState } from './useAccordionState';
import type { AccordionState } from './useAccordionState';

describe('useAccordionState', () => {
  const storageKey = 'test-accordion-state';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllTimers();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with empty state when localStorage is empty', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey })
      );

      expect(result.current.expandedCategories).toEqual({});
    });

    it('should load state from localStorage on mount', () => {
      const savedState: AccordionState = {
        'cat-1': true,
        'cat-2': false,
        'cat-3': true,
      };
      localStorage.setItem(storageKey, JSON.stringify(savedState));

      const { result } = renderHook(() =>
        useAccordionState({ storageKey })
      );

      // Wait for useEffect to run
      expect(result.current.expandedCategories).toEqual(savedState);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(storageKey, 'invalid-json{');

      const { result } = renderHook(() =>
        useAccordionState({ storageKey })
      );

      // Should initialize with empty state
      expect(result.current.expandedCategories).toEqual({});
    });

    it('should validate localStorage data and filter invalid entries', () => {
      const invalidState = {
        'cat-1': true,
        'cat-2': 'not-a-boolean', // invalid
        'cat-3': false,
        123: true, // numeric key, but will be string after JSON
      };
      localStorage.setItem(storageKey, JSON.stringify(invalidState));

      const { result } = renderHook(() =>
        useAccordionState({ storageKey })
      );

      // Should only include valid boolean entries
      expect(result.current.expandedCategories).toEqual({
        'cat-1': true,
        'cat-3': false,
        '123': true,
      });
    });
  });

  describe('toggleCategory', () => {
    it('should toggle category from false to true', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.toggleCategory('cat-1');
      });

      expect(result.current.expandedCategories['cat-1']).toBe(true);
    });

    it('should toggle category from true to false', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.toggleCategory('cat-1');
      });
      expect(result.current.expandedCategories['cat-1']).toBe(true);

      act(() => {
        result.current.toggleCategory('cat-1');
      });
      expect(result.current.expandedCategories['cat-1']).toBe(false);
    });

    it('should toggle undefined category to true', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.toggleCategory('new-cat');
      });

      expect(result.current.expandedCategories['new-cat']).toBe(true);
    });

    it('should save to localStorage after toggle (with debounce)', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 300 })
      );

      act(() => {
        result.current.toggleCategory('cat-1');
      });

      // Should not save immediately
      expect(localStorage.getItem(storageKey)).toBeNull();

      // Fast-forward time past debounce
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should now be saved
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      expect(saved['cat-1']).toBe(true);

      vi.useRealTimers();
    });
  });

  describe('expandCategories', () => {
    it('should expand multiple categories at once', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.expandCategories(['cat-1', 'cat-2', 'cat-3']);
      });

      expect(result.current.expandedCategories).toEqual({
        'cat-1': true,
        'cat-2': true,
        'cat-3': true,
      });
    });

    it('should merge with existing state', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.toggleCategory('cat-1');
      });

      act(() => {
        result.current.expandCategories(['cat-2', 'cat-3']);
      });

      expect(result.current.expandedCategories).toEqual({
        'cat-1': true,
        'cat-2': true,
        'cat-3': true,
      });
    });

    it('should handle empty array', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      const initialState = { ...result.current.expandedCategories };

      act(() => {
        result.current.expandCategories([]);
      });

      expect(result.current.expandedCategories).toEqual(initialState);
    });

    it('should not collapse already expanded categories', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.toggleCategory('cat-1');
        result.current.toggleCategory('cat-2');
      });

      // Expand cat-3, should not affect cat-1 and cat-2
      act(() => {
        result.current.expandCategories(['cat-3']);
      });

      expect(result.current.expandedCategories).toEqual({
        'cat-1': true,
        'cat-2': true,
        'cat-3': true,
      });
    });
  });

  describe('collapseAll', () => {
    it('should collapse all categories', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.expandCategories(['cat-1', 'cat-2', 'cat-3']);
      });

      expect(Object.keys(result.current.expandedCategories).length).toBe(3);

      act(() => {
        result.current.collapseAll();
      });

      expect(result.current.expandedCategories).toEqual({});
    });

    it('should clear localStorage when collapsing all', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 300 })
      );

      act(() => {
        result.current.expandCategories(['cat-1', 'cat-2']);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.collapseAll();
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      expect(saved).toEqual({});

      vi.useRealTimers();
    });
  });

  describe('isExpanded', () => {
    it('should return true for expanded category', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.toggleCategory('cat-1');
      });

      expect(result.current.isExpanded('cat-1')).toBe(true);
    });

    it('should return false for collapsed category', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.toggleCategory('cat-1');
        result.current.toggleCategory('cat-1');
      });

      expect(result.current.isExpanded('cat-1')).toBe(false);
    });

    it('should return defaultExpanded for unknown category', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, defaultExpanded: false })
      );

      expect(result.current.isExpanded('unknown')).toBe(false);
    });

    it('should respect defaultExpanded option', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, defaultExpanded: true })
      );

      expect(result.current.isExpanded('unknown')).toBe(true);
    });
  });

  describe('snapshot and restore', () => {
    it('should save and restore state snapshot', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      // Set initial state
      act(() => {
        result.current.expandCategories(['cat-1', 'cat-2']);
      });

      // Save snapshot
      act(() => {
        result.current.saveSnapshot();
      });

      // Modify state
      act(() => {
        result.current.expandCategories(['cat-3', 'cat-4']);
        result.current.toggleCategory('cat-1'); // collapse cat-1
      });

      expect(result.current.expandedCategories).toEqual({
        'cat-1': false,
        'cat-2': true,
        'cat-3': true,
        'cat-4': true,
      });

      // Restore snapshot
      act(() => {
        result.current.restoreSnapshot();
      });

      expect(result.current.expandedCategories).toEqual({
        'cat-1': true,
        'cat-2': true,
      });
    });

    it('should do nothing if restoreSnapshot called without saveSnapshot', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.expandCategories(['cat-1', 'cat-2']);
      });

      const beforeRestore = { ...result.current.expandedCategories };

      act(() => {
        result.current.restoreSnapshot();
      });

      expect(result.current.expandedCategories).toEqual(beforeRestore);
    });

    it('should clear snapshot after restore', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 0 })
      );

      act(() => {
        result.current.expandCategories(['cat-1']);
      });

      act(() => {
        result.current.saveSnapshot();
      });

      act(() => {
        result.current.expandCategories(['cat-2']);
      });

      // First restore
      act(() => {
        result.current.restoreSnapshot();
      });

      expect(result.current.expandedCategories).toEqual({ 'cat-1': true });

      // Modify state again
      act(() => {
        result.current.expandCategories(['cat-3']);
      });

      // Second restore should do nothing (snapshot was cleared)
      act(() => {
        result.current.restoreSnapshot();
      });

      expect(result.current.expandedCategories).toEqual({
        'cat-1': true,
        'cat-3': true,
      });
    });
  });

  describe('localStorage error handling', () => {
    it('should handle QuotaExceededError gracefully', async () => {
      vi.useFakeTimers();

      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      let callCount = 0;
      Storage.prototype.setItem = vi.fn((key, value) => {
        callCount++;
        if (callCount === 1) {
          const error = new Error('QuotaExceededError');
          error.name = 'QuotaExceededError';
          throw error;
        }
        // Second call (retry) succeeds
        originalSetItem.call(localStorage, key, value);
      });

      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 300 })
      );

      act(() => {
        result.current.toggleCategory('cat-1');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should still work despite error
      expect(result.current.expandedCategories['cat-1']).toBe(true);

      // Restore original method
      Storage.prototype.setItem = originalSetItem;
      vi.useRealTimers();
    });
  });

  describe('debouncing behavior', () => {
    it('should debounce multiple rapid toggles', async () => {
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 300 })
      );

      // Multiple rapid toggles
      act(() => {
        result.current.toggleCategory('cat-1');
        result.current.toggleCategory('cat-2');
        result.current.toggleCategory('cat-3');
      });

      // Should not save immediately
      expect(localStorage.getItem(storageKey)).toBeNull();

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should save only once with final state
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      expect(saved).toEqual({
        'cat-1': true,
        'cat-2': true,
        'cat-3': true,
      });

      vi.useRealTimers();
    });

    it('should cancel pending save on unmount', () => {
      vi.useFakeTimers();

      const { result, unmount } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 300 })
      );

      act(() => {
        result.current.toggleCategory('cat-1');
      });

      // Unmount before debounce completes
      unmount();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Should not save after unmount
      expect(localStorage.getItem(storageKey)).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('requirements validation', () => {
    it('should meet requirement 4.1: restore state from localStorage on initial load', () => {
      const savedState: AccordionState = {
        'level-1': true,
        'level-2': false,
      };
      localStorage.setItem(storageKey, JSON.stringify(savedState));

      const { result } = renderHook(() =>
        useAccordionState({ storageKey })
      );

      expect(result.current.expandedCategories).toEqual(savedState);
    });

    it('should meet requirement 4.2: default to collapsed when no saved state', () => {
      const { result } = renderHook(() =>
        useAccordionState({ storageKey, defaultExpanded: false })
      );

      expect(result.current.isExpanded('any-category')).toBe(false);
    });

    it('should meet requirement 4.4: use unique category ID as storage key', () => {
      vi.useFakeTimers();

      const { result } = renderHook(() =>
        useAccordionState({ storageKey, debounceMs: 300 })
      );

      act(() => {
        result.current.toggleCategory('unique-cat-123');
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      expect(saved).toHaveProperty('unique-cat-123');
      expect(saved['unique-cat-123']).toBe(true);

      vi.useRealTimers();
    });
  });
});
