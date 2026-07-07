import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

/**
 * Map of category ID to expanded state
 */
export type AccordionState = Record<string, boolean>;

export interface UseAccordionStateOptions {
  storageKey: string;
  defaultExpanded?: boolean;
  debounceMs?: number;
}

export interface UseAccordionStateReturn {
  expandedCategories: AccordionState;
  toggleCategory: (categoryId: string) => void;
  expandCategories: (categoryIds: string[]) => void;
  collapseAll: () => void;
  saveSnapshot: () => void;
  restoreSnapshot: () => void;
  isExpanded: (categoryId: string) => boolean;
}

/**
 * Custom debounce function to avoid adding lodash dependency
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * Check if localStorage is available (handles SSR and private browsing)
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate accordion state data structure
 */
function validateAccordionState(data: unknown): AccordionState {
  if (typeof data !== 'object' || data === null) {
    return {};
  }

  const validated: AccordionState = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof key === 'string' && typeof value === 'boolean') {
      validated[key] = value;
    }
  }

  return validated;
}

/**
 * Hook to manage accordion state with localStorage persistence
 * 
 * @param options - Configuration options
 * @returns Accordion state and control functions
 */
export function useAccordionState({
  storageKey,
  defaultExpanded = false,
  debounceMs = 300,
}: UseAccordionStateOptions): UseAccordionStateReturn {
  const [expandedCategories, setExpandedCategories] = useState<AccordionState>({});
  const [snapshot, setSnapshot] = useState<AccordionState | null>(null);
  const hasLocalStorage = useMemo(() => isLocalStorageAvailable(), []);
  
  // Use ref to track current state for saveSnapshot (avoid dependency issues)
  const expandedCategoriesRef = useRef<AccordionState>(expandedCategories);
  
  // Keep ref in sync with state
  useEffect(() => {
    expandedCategoriesRef.current = expandedCategories;
  }, [expandedCategories]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!hasLocalStorage) {
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validated = validateAccordionState(parsed);
        setExpandedCategories(validated);
      }
    } catch (error) {
      console.warn('Failed to load accordion state:', error);
      // Continue with default state
    }
  }, [storageKey, hasLocalStorage]);

  // Debounced save to localStorage
  const debouncedSave = useMemo(
    () =>
      debounce((state: AccordionState) => {
        if (!hasLocalStorage) {
          return;
        }

        try {
          localStorage.setItem(storageKey, JSON.stringify(state));
        } catch (error) {
          if (error instanceof Error && error.name === 'QuotaExceededError') {
            console.warn('localStorage quota exceeded, clearing old state');
            // Fallback: clear and try again with current state only
            try {
              localStorage.removeItem(storageKey);
              localStorage.setItem(storageKey, JSON.stringify(state));
            } catch (retryError) {
              console.warn('Failed to save accordion state after clearing:', retryError);
            }
          } else {
            console.warn('Failed to save accordion state:', error);
          }
        }
      }, debounceMs),
    [storageKey, debounceMs, hasLocalStorage]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Toggle a single category
  const toggleCategory = useCallback(
    (categoryId: string) => {
      setExpandedCategories((prev) => {
        const newState = {
          ...prev,
          [categoryId]: !prev[categoryId],
        };
        debouncedSave(newState);
        return newState;
      });
    },
    [debouncedSave]
  );

  // Expand multiple categories
  const expandCategories = useCallback(
    (categoryIds: string[]) => {
      setExpandedCategories((prev) => {
        const newState = { ...prev };
        categoryIds.forEach((id) => {
          newState[id] = true;
        });
        debouncedSave(newState);
        return newState;
      });
    },
    [debouncedSave]
  );

  // Collapse all categories
  const collapseAll = useCallback(() => {
    setExpandedCategories({});
    debouncedSave({});
  }, [debouncedSave]);

  // Save current state as snapshot (for search restoration)
  const saveSnapshot = useCallback(() => {
    // Only save if we don't already have a snapshot
    setSnapshot((prev) => {
      if (prev !== null) return prev;
      // Use ref to get current state without causing dependency issues
      return { ...expandedCategoriesRef.current };
    });
  }, []); // No dependencies - reads from ref

  // Restore snapshot state
  const restoreSnapshot = useCallback(() => {
    if (snapshot !== null) {
      setExpandedCategories(snapshot);
      debouncedSave(snapshot);
      setSnapshot(null);
    }
  }, [snapshot, debouncedSave]);

  // Check if a category is expanded
  const isExpanded = useCallback(
    (categoryId: string): boolean => {
      return expandedCategories[categoryId] ?? defaultExpanded;
    },
    [expandedCategories, defaultExpanded]
  );

  return {
    expandedCategories,
    toggleCategory,
    expandCategories,
    collapseAll,
    saveSnapshot,
    restoreSnapshot,
    isExpanded,
  };
}
