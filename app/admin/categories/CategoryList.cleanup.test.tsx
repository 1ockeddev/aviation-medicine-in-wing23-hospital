/**
 * Unit tests for Task 8.2: Orphaned localStorage cleanup
 * Tests that the CategoryList component cleans up orphaned state entries
 * when categories are deleted from the database.
 * 
 * Validates: Requirements 5.4
 */

import { describe, test, expect, beforeEach, afterAll, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { CategoryList } from './CategoryList';
import type { Category } from '@prisma/client';

// Mock the server actions
vi.mock('@/actions/categories', () => ({
  deleteCategory: vi.fn(),
  reorderCategory: vi.fn(),
  updateCategoryOrder: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
}));

// Mock AccordionToggle component
vi.mock('@/components/ui/AccordionToggle', () => ({
  AccordionToggle: ({ onClick, isExpanded, hasChildren, 'aria-label': ariaLabel }: any) => (
    <button
      onClick={onClick}
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-label={ariaLabel}
    >
      {hasChildren ? (isExpanded ? '-' : '+') : null}
    </button>
  ),
}));

// Mock DraggableCategory component
vi.mock('./DraggableCategory', () => ({
  DraggableCategory: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock CategoryModal component
vi.mock('./CategoryModal', () => ({
  CategoryModal: () => null,
}));

// Mock DndContext from @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  TouchSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

// Mock SortableContext from @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
}));

type CategoryWithChildrenAndCount = Category & {
  children: (Category & {
    children: (Category & {
      _count: { medications: number };
    })[];
    _count: { medications: number };
  })[];
  _count: { medications: number };
};

describe('CategoryList - Orphaned State Cleanup (Task 8.2)', () => {
  // Store original localStorage
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    // Reset localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterAll(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage;
  });

  const createMockCategory = (
    id: string,
    name: string,
    order: number,
    parentId: string | null = null,
    children: any[] = []
  ): CategoryWithChildrenAndCount => ({
    id,
    name,
    number: order.toString(),
    order,
    parentId,
    createdAt: new Date(),
    updatedAt: new Date(),
    children,
    _count: { medications: 0 },
  });

  test('should remove orphaned localStorage entries for deleted categories', async () => {
    // Setup: Create initial categories
    const category1 = createMockCategory('cat-1', 'Category 1', 1);
    const category2 = createMockCategory('cat-2', 'Category 2', 2);
    const category3 = createMockCategory('cat-3', 'Category 3', 3);

    // Setup: Add localStorage state including an orphaned entry
    const initialState = {
      'cat-1': true,
      'cat-2': false,
      'cat-3': true,
      'cat-deleted': true, // Orphaned entry - category no longer exists
      'cat-removed': false, // Another orphaned entry
    };
    localStorage.setItem('category-accordion-state', JSON.stringify(initialState));

    // Render with only cat-1, cat-2, cat-3 (cat-deleted and cat-removed are gone)
    render(
      <CategoryList
        categories={[category1, category2, category3]}
        parentCategories={[]}
      />
    );

    // Wait for cleanup to occur
    await waitFor(() => {
      const stored = localStorage.getItem('category-accordion-state');
      expect(stored).toBeTruthy();
      
      const parsedState = JSON.parse(stored!);
      
      // Should keep valid entries
      expect(parsedState['cat-1']).toBe(true);
      expect(parsedState['cat-2']).toBe(false);
      expect(parsedState['cat-3']).toBe(true);
      
      // Should remove orphaned entries
      expect(parsedState['cat-deleted']).toBeUndefined();
      expect(parsedState['cat-removed']).toBeUndefined();
    });
  });

  test('should cleanup orphaned entries for nested categories', async () => {
    // Setup: Create nested categories
    const level2Cat = createMockCategory('cat-1-1', 'Subcategory 1.1', 1, 'cat-1');
    const level3Cat = createMockCategory('cat-1-1-1', 'Sub-sub 1.1.1', 1, 'cat-1-1');
    const level2WithLevel3 = { ...level2Cat, children: [level3Cat] };
    const category1 = createMockCategory('cat-1', 'Category 1', 1, null, [level2WithLevel3]);

    // Setup: Add localStorage state with orphaned nested entries
    const initialState = {
      'cat-1': true,
      'cat-1-1': true,
      'cat-1-1-1': false,
      'cat-1-2': true, // Orphaned level 2 category
      'cat-1-2-1': false, // Orphaned level 3 category
    };
    localStorage.setItem('category-accordion-state', JSON.stringify(initialState));

    // Render with only the valid nested structure
    render(
      <CategoryList
        categories={[category1]}
        parentCategories={[]}
      />
    );

    // Wait for cleanup to occur
    await waitFor(() => {
      const stored = localStorage.getItem('category-accordion-state');
      const parsedState = JSON.parse(stored!);
      
      // Should keep valid nested entries
      expect(parsedState['cat-1']).toBe(true);
      expect(parsedState['cat-1-1']).toBe(true);
      expect(parsedState['cat-1-1-1']).toBe(false);
      
      // Should remove orphaned nested entries
      expect(parsedState['cat-1-2']).toBeUndefined();
      expect(parsedState['cat-1-2-1']).toBeUndefined();
    });
  });

  test('should not modify localStorage if no orphaned entries exist', async () => {
    // Setup: Create categories
    const category1 = createMockCategory('cat-1', 'Category 1', 1);
    const category2 = createMockCategory('cat-2', 'Category 2', 2);

    // Setup: Add localStorage state with only valid entries
    const initialState = {
      'cat-1': true,
      'cat-2': false,
    };
    localStorage.setItem('category-accordion-state', JSON.stringify(initialState));

    // Render
    render(
      <CategoryList
        categories={[category1, category2]}
        parentCategories={[]}
      />
    );

    // Wait and verify state is unchanged
    await waitFor(() => {
      const stored = localStorage.getItem('category-accordion-state');
      const parsedState = JSON.parse(stored!);
      
      // Should keep all entries unchanged
      expect(parsedState).toEqual(initialState);
    });
  });

  test('should handle empty localStorage gracefully', async () => {
    // Setup: No localStorage state
    const category1 = createMockCategory('cat-1', 'Category 1', 1);

    // Render
    render(
      <CategoryList
        categories={[category1]}
        parentCategories={[]}
      />
    );

    // Should not throw error and localStorage should remain empty
    await waitFor(() => {
      const stored = localStorage.getItem('category-accordion-state');
      // Should be null (not set) or empty object
      expect(stored === null || stored === '{}').toBe(true);
    });
  });

  test('should handle corrupt localStorage data gracefully', async () => {
    // Setup: Add corrupt data to localStorage
    localStorage.setItem('category-accordion-state', 'not valid json {');

    const category1 = createMockCategory('cat-1', 'Category 1', 1);

    // Should not throw error
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(
      <CategoryList
        categories={[category1]}
        parentCategories={[]}
      />
    );

    // Should handle error gracefully
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to cleanup orphaned accordion state:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  test('should cleanup when categories prop changes', async () => {
    // Setup: Initial categories
    const category1 = createMockCategory('cat-1', 'Category 1', 1);
    const category2 = createMockCategory('cat-2', 'Category 2', 2);

    // Setup: localStorage with all categories
    const initialState = {
      'cat-1': true,
      'cat-2': true,
    };
    localStorage.setItem('category-accordion-state', JSON.stringify(initialState));

    // Initial render with both categories
    const { rerender } = render(
      <CategoryList
        categories={[category1, category2]}
        parentCategories={[]}
      />
    );

    // Verify initial state
    await waitFor(() => {
      const stored = localStorage.getItem('category-accordion-state');
      const parsedState = JSON.parse(stored!);
      expect(parsedState['cat-1']).toBe(true);
      expect(parsedState['cat-2']).toBe(true);
    });

    // Re-render with cat-2 removed (simulating deletion)
    rerender(
      <CategoryList
        categories={[category1]}
        parentCategories={[]}
      />
    );

    // Wait for cleanup to occur
    await waitFor(() => {
      const stored = localStorage.getItem('category-accordion-state');
      const parsedState = JSON.parse(stored!);
      
      // Should keep cat-1
      expect(parsedState['cat-1']).toBe(true);
      
      // Should remove cat-2
      expect(parsedState['cat-2']).toBeUndefined();
    });
  });

  test('should cleanup all orphaned entries when multiple categories are deleted', async () => {
    // Setup: Initial categories
    const category1 = createMockCategory('cat-1', 'Category 1', 1);

    // Setup: localStorage with many entries, most orphaned
    const initialState = {
      'cat-1': true,
      'cat-2': false,
      'cat-3': true,
      'cat-4': false,
      'cat-5': true,
      'cat-6': false,
    };
    localStorage.setItem('category-accordion-state', JSON.stringify(initialState));

    // Render with only cat-1 (all others are orphaned)
    render(
      <CategoryList
        categories={[category1]}
        parentCategories={[]}
      />
    );

    // Wait for cleanup to occur
    await waitFor(() => {
      const stored = localStorage.getItem('category-accordion-state');
      const parsedState = JSON.parse(stored!);
      
      // Should keep only cat-1
      expect(Object.keys(parsedState)).toHaveLength(1);
      expect(parsedState['cat-1']).toBe(true);
      
      // All others should be removed
      expect(parsedState['cat-2']).toBeUndefined();
      expect(parsedState['cat-3']).toBeUndefined();
      expect(parsedState['cat-4']).toBeUndefined();
      expect(parsedState['cat-5']).toBeUndefined();
      expect(parsedState['cat-6']).toBeUndefined();
    });
  });
});
