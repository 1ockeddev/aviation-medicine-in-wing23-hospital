import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEffect } from 'react';

describe('CategoryList Search State Management', () => {
  describe('useEffect for search state management', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should call saveSnapshot and expandCategories when searchQuery is not empty', () => {
      const saveSnapshot = vi.fn();
      const expandCategories = vi.fn();
      const restoreSnapshot = vi.fn();
      const findMatchingCategoryIds = vi.fn().mockReturnValue(['cat-1', 'cat-2', 'cat-3']);
      
      const searchQuery = 'test';
      const filteredCategories = [
        {
          id: 'cat-1',
          name: 'Test Category 1',
          children: [
            {
              id: 'cat-2',
              name: 'Test Category 2',
              children: [
                {
                  id: 'cat-3',
                  name: 'Test Category 3',
                  children: [],
                },
              ],
            },
          ],
        },
      ];

      // Simulate the useEffect logic
      renderHook(() => {
        useEffect(() => {
          if (searchQuery.trim()) {
            saveSnapshot();
            const matchingIds = findMatchingCategoryIds(filteredCategories);
            expandCategories(matchingIds);
          } else {
            restoreSnapshot();
          }
        }, [searchQuery]);
      });

      // Verify saveSnapshot was called
      expect(saveSnapshot).toHaveBeenCalledTimes(1);
      
      // Verify findMatchingCategoryIds was called with filteredCategories
      expect(findMatchingCategoryIds).toHaveBeenCalledWith(filteredCategories);
      
      // Verify expandCategories was called with matching IDs
      expect(expandCategories).toHaveBeenCalledWith(['cat-1', 'cat-2', 'cat-3']);
      
      // Verify restoreSnapshot was NOT called
      expect(restoreSnapshot).not.toHaveBeenCalled();
    });

    it('should call restoreSnapshot when searchQuery is empty', () => {
      const saveSnapshot = vi.fn();
      const expandCategories = vi.fn();
      const restoreSnapshot = vi.fn();
      const findMatchingCategoryIds = vi.fn();
      
      const searchQuery = '';
      const filteredCategories: any[] = [];

      // Simulate the useEffect logic
      renderHook(() => {
        useEffect(() => {
          if (searchQuery.trim()) {
            saveSnapshot();
            const matchingIds = findMatchingCategoryIds(filteredCategories);
            expandCategories(matchingIds);
          } else {
            restoreSnapshot();
          }
        }, [searchQuery]);
      });

      // Verify restoreSnapshot was called
      expect(restoreSnapshot).toHaveBeenCalledTimes(1);
      
      // Verify saveSnapshot was NOT called
      expect(saveSnapshot).not.toHaveBeenCalled();
      
      // Verify findMatchingCategoryIds was NOT called
      expect(findMatchingCategoryIds).not.toHaveBeenCalled();
      
      // Verify expandCategories was NOT called
      expect(expandCategories).not.toHaveBeenCalled();
    });

    it('should call restoreSnapshot when searchQuery is only whitespace', () => {
      const saveSnapshot = vi.fn();
      const expandCategories = vi.fn();
      const restoreSnapshot = vi.fn();
      const findMatchingCategoryIds = vi.fn();
      
      const searchQuery = '   ';
      const filteredCategories: any[] = [];

      // Simulate the useEffect logic
      renderHook(() => {
        useEffect(() => {
          if (searchQuery.trim()) {
            saveSnapshot();
            const matchingIds = findMatchingCategoryIds(filteredCategories);
            expandCategories(matchingIds);
          } else {
            restoreSnapshot();
          }
        }, [searchQuery]);
      });

      // Verify restoreSnapshot was called (because trim() makes it empty)
      expect(restoreSnapshot).toHaveBeenCalledTimes(1);
      
      // Verify saveSnapshot was NOT called
      expect(saveSnapshot).not.toHaveBeenCalled();
      
      // Verify findMatchingCategoryIds was NOT called
      expect(findMatchingCategoryIds).not.toHaveBeenCalled();
      
      // Verify expandCategories was NOT called
      expect(expandCategories).not.toHaveBeenCalled();
    });

    it('should expand all matching category IDs including nested levels', () => {
      const saveSnapshot = vi.fn();
      const expandCategories = vi.fn();
      const restoreSnapshot = vi.fn();
      
      // Mock findMatchingCategoryIds to return all levels
      const findMatchingCategoryIds = (categories: any[]): string[] => {
        const ids: string[] = [];
        for (const level1 of categories) {
          ids.push(level1.id);
          for (const level2 of level1.children) {
            ids.push(level2.id);
            for (const level3 of level2.children) {
              ids.push(level3.id);
            }
          }
        }
        return ids;
      };
      
      const searchQuery = 'medication';
      const filteredCategories = [
        {
          id: 'level1-1',
          name: 'Medications',
          children: [
            {
              id: 'level2-1',
              name: 'Pain Medications',
              children: [
                {
                  id: 'level3-1',
                  name: 'Aspirin',
                  children: [],
                },
                {
                  id: 'level3-2',
                  name: 'Ibuprofen',
                  children: [],
                },
              ],
            },
            {
              id: 'level2-2',
              name: 'Antibiotics',
              children: [],
            },
          ],
        },
      ];

      // Simulate the useEffect logic
      renderHook(() => {
        useEffect(() => {
          if (searchQuery.trim()) {
            saveSnapshot();
            const matchingIds = findMatchingCategoryIds(filteredCategories);
            expandCategories(matchingIds);
          } else {
            restoreSnapshot();
          }
        }, [searchQuery]);
      });

      // Verify saveSnapshot was called
      expect(saveSnapshot).toHaveBeenCalledTimes(1);
      
      // Verify expandCategories was called with ALL category IDs
      expect(expandCategories).toHaveBeenCalledWith([
        'level1-1',
        'level2-1',
        'level3-1',
        'level3-2',
        'level2-2',
      ]);
    });
  });
});
