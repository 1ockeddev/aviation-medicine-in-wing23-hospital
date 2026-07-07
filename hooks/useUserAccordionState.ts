import { useState, useCallback } from 'react';

/**
 * Accordion state for user-side (public home page)
 * Uses Set<string> for efficient lookup and manipulation
 */
export interface UseUserAccordionStateReturn {
  expandedCategories: Set<string>;
  toggleCategory: (categoryId: string) => void;
  expandCategories: (categoryIds: string[]) => void;
  collapseAll: () => void;
  isExpanded: (categoryId: string) => boolean;
}

/**
 * Hook to manage accordion state for user-side (public home page)
 * 
 * Key differences from admin-side:
 * - NO localStorage persistence (always starts collapsed)
 * - NO saveSnapshot/restoreSnapshot (simpler than admin)
 * - NO debouncing (state updates are immediate)
 * - Uses Set<string> instead of Record<string, boolean> for efficiency
 * - Support multiple categories expanded simultaneously
 * - Used for search integration (expand matching categories, collapse all when cleared)
 * 
 * @returns Accordion state and control functions
 */
export function useUserAccordionState(): UseUserAccordionStateReturn {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Toggle a single category
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  // Expand multiple categories (used for search results)
  const expandCategories = useCallback((categoryIds: string[]) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      categoryIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  // Collapse all categories (used when search is cleared)
  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  // Check if a category is expanded
  const isExpanded = useCallback(
    (categoryId: string): boolean => {
      return expandedCategories.has(categoryId);
    },
    [expandedCategories]
  );

  return {
    expandedCategories,
    toggleCategory,
    expandCategories,
    collapseAll,
    isExpanded,
  };
}
