/**
 * Unit tests for extractAllCategoryIds helper function
 * Task 8.1: Extract all category IDs from categories prop
 * Requirements: 5.4
 */

import { describe, it, expect } from 'vitest';

// Type definitions matching CategoryList.tsx
type CategoryLevel3 = {
  id: string;
  name: string;
  order: number;
  parentId: string | null;
  _count: { medications: number };
};

type CategoryLevel2 = {
  id: string;
  name: string;
  order: number;
  parentId: string | null;
  children: CategoryLevel3[];
  _count: { medications: number };
};

type CategoryWithChildrenAndCount = {
  id: string;
  name: string;
  order: number;
  parentId: string | null;
  children: CategoryLevel2[];
  _count: { medications: number };
};

// Extract the function for testing
function extractAllCategoryIds(
  categories: CategoryWithChildrenAndCount[]
): string[] {
  const ids: string[] = [];

  for (const level1 of categories) {
    // Add level 1 category ID
    ids.push(level1.id);

    // Process level 2 children
    for (const level2 of level1.children) {
      // Add level 2 category ID
      ids.push(level2.id);

      // Process level 3 children
      for (const level3 of level2.children) {
        // Add level 3 category ID
        ids.push(level3.id);
      }
    }
  }

  return ids;
}

describe('extractAllCategoryIds', () => {
  it('should return empty array for empty categories', () => {
    const result = extractAllCategoryIds([]);
    expect(result).toEqual([]);
  });

  it('should extract IDs from single level 1 category with no children', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'cat-1',
        name: 'Category 1',
        order: 1,
        parentId: null,
        children: [],
        _count: { medications: 0 },
      },
    ];

    const result = extractAllCategoryIds(categories);
    expect(result).toEqual(['cat-1']);
  });

  it('should extract IDs from level 1 and level 2 categories', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'cat-1',
        name: 'Category 1',
        order: 1,
        parentId: null,
        children: [
          {
            id: 'cat-1-1',
            name: 'Category 1.1',
            order: 1,
            parentId: 'cat-1',
            children: [],
            _count: { medications: 0 },
          },
          {
            id: 'cat-1-2',
            name: 'Category 1.2',
            order: 2,
            parentId: 'cat-1',
            children: [],
            _count: { medications: 0 },
          },
        ],
        _count: { medications: 0 },
      },
    ];

    const result = extractAllCategoryIds(categories);
    expect(result).toEqual(['cat-1', 'cat-1-1', 'cat-1-2']);
  });

  it('should extract IDs from all 3 levels of category hierarchy', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'cat-1',
        name: 'Category 1',
        order: 1,
        parentId: null,
        children: [
          {
            id: 'cat-1-1',
            name: 'Category 1.1',
            order: 1,
            parentId: 'cat-1',
            children: [
              {
                id: 'cat-1-1-1',
                name: 'Category 1.1.1',
                order: 1,
                parentId: 'cat-1-1',
                _count: { medications: 5 },
              },
              {
                id: 'cat-1-1-2',
                name: 'Category 1.1.2',
                order: 2,
                parentId: 'cat-1-1',
                _count: { medications: 3 },
              },
            ],
            _count: { medications: 8 },
          },
        ],
        _count: { medications: 8 },
      },
    ];

    const result = extractAllCategoryIds(categories);
    expect(result).toEqual(['cat-1', 'cat-1-1', 'cat-1-1-1', 'cat-1-1-2']);
  });

  it('should extract IDs from multiple level 1 categories with mixed children', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'cat-1',
        name: 'Category 1',
        order: 1,
        parentId: null,
        children: [
          {
            id: 'cat-1-1',
            name: 'Category 1.1',
            order: 1,
            parentId: 'cat-1',
            children: [
              {
                id: 'cat-1-1-1',
                name: 'Category 1.1.1',
                order: 1,
                parentId: 'cat-1-1',
                _count: { medications: 2 },
              },
            ],
            _count: { medications: 2 },
          },
        ],
        _count: { medications: 2 },
      },
      {
        id: 'cat-2',
        name: 'Category 2',
        order: 2,
        parentId: null,
        children: [],
        _count: { medications: 0 },
      },
      {
        id: 'cat-3',
        name: 'Category 3',
        order: 3,
        parentId: null,
        children: [
          {
            id: 'cat-3-1',
            name: 'Category 3.1',
            order: 1,
            parentId: 'cat-3',
            children: [],
            _count: { medications: 1 },
          },
        ],
        _count: { medications: 1 },
      },
    ];

    const result = extractAllCategoryIds(categories);
    expect(result).toEqual([
      'cat-1',
      'cat-1-1',
      'cat-1-1-1',
      'cat-2',
      'cat-3',
      'cat-3-1',
    ]);
  });

  it('should extract IDs in depth-first order', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'A',
        name: 'Category A',
        order: 1,
        parentId: null,
        children: [
          {
            id: 'A1',
            name: 'Category A1',
            order: 1,
            parentId: 'A',
            children: [
              {
                id: 'A1a',
                name: 'Category A1a',
                order: 1,
                parentId: 'A1',
                _count: { medications: 0 },
              },
              {
                id: 'A1b',
                name: 'Category A1b',
                order: 2,
                parentId: 'A1',
                _count: { medications: 0 },
              },
            ],
            _count: { medications: 0 },
          },
          {
            id: 'A2',
            name: 'Category A2',
            order: 2,
            parentId: 'A',
            children: [],
            _count: { medications: 0 },
          },
        ],
        _count: { medications: 0 },
      },
    ];

    const result = extractAllCategoryIds(categories);
    // Should follow depth-first: A -> A1 -> A1a -> A1b -> A2
    expect(result).toEqual(['A', 'A1', 'A1a', 'A1b', 'A2']);
  });

  it('should handle complex hierarchy with multiple branches', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: '1',
        name: 'Cat 1',
        order: 1,
        parentId: null,
        children: [
          {
            id: '1.1',
            name: 'Cat 1.1',
            order: 1,
            parentId: '1',
            children: [
              {
                id: '1.1.1',
                name: 'Cat 1.1.1',
                order: 1,
                parentId: '1.1',
                _count: { medications: 0 },
              },
            ],
            _count: { medications: 0 },
          },
          {
            id: '1.2',
            name: 'Cat 1.2',
            order: 2,
            parentId: '1',
            children: [
              {
                id: '1.2.1',
                name: 'Cat 1.2.1',
                order: 1,
                parentId: '1.2',
                _count: { medications: 0 },
              },
              {
                id: '1.2.2',
                name: 'Cat 1.2.2',
                order: 2,
                parentId: '1.2',
                _count: { medications: 0 },
              },
            ],
            _count: { medications: 0 },
          },
        ],
        _count: { medications: 0 },
      },
      {
        id: '2',
        name: 'Cat 2',
        order: 2,
        parentId: null,
        children: [
          {
            id: '2.1',
            name: 'Cat 2.1',
            order: 1,
            parentId: '2',
            children: [],
            _count: { medications: 0 },
          },
        ],
        _count: { medications: 0 },
      },
    ];

    const result = extractAllCategoryIds(categories);
    expect(result).toEqual([
      '1',
      '1.1',
      '1.1.1',
      '1.2',
      '1.2.1',
      '1.2.2',
      '2',
      '2.1',
    ]);
  });
});
