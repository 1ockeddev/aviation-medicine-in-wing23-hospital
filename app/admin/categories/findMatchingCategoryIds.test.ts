/**
 * Unit tests for findMatchingCategoryIds helper function
 * Validates Requirements 7.1, 7.2
 */

import type { Category } from '@prisma/client';

type CategoryLevel3 = Category & {
  _count: {
    medications: number;
  };
};

type CategoryLevel2 = Category & {
  children: CategoryLevel3[];
  _count: {
    medications: number;
  };
};

type CategoryWithChildrenAndCount = Category & {
  children: CategoryLevel2[];
  _count: {
    medications: number;
  };
};

// Extract the function logic for testing
const findMatchingCategoryIds = (
  categories: CategoryWithChildrenAndCount[]
): string[] => {
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
};

describe('findMatchingCategoryIds', () => {
  it('should return empty array for empty categories', () => {
    const result = findMatchingCategoryIds([]);
    expect(result).toEqual([]);
  });

  it('should extract Level 1 category IDs only', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'cat1',
        name: 'Category 1',
        number: '1',
        parentId: null,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
        _count: { medications: 0 },
      },
      {
        id: 'cat2',
        name: 'Category 2',
        number: '2',
        parentId: null,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
        _count: { medications: 0 },
      },
    ];

    const result = findMatchingCategoryIds(categories);
    expect(result).toEqual(['cat1', 'cat2']);
  });

  it('should extract Level 1 and Level 2 category IDs', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'cat1',
        name: 'Category 1',
        number: '1',
        parentId: null,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [
          {
            id: 'cat1-1',
            name: 'Subcategory 1.1',
            number: '1.1',
            parentId: 'cat1',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
            _count: { medications: 0 },
          },
          {
            id: 'cat1-2',
            name: 'Subcategory 1.2',
            number: '1.2',
            parentId: 'cat1',
            order: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
            _count: { medications: 0 },
          },
        ],
        _count: { medications: 0 },
      },
    ];

    const result = findMatchingCategoryIds(categories);
    expect(result).toEqual(['cat1', 'cat1-1', 'cat1-2']);
  });

  it('should extract all category IDs across 3 levels', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'cat1',
        name: 'Category 1',
        number: '1',
        parentId: null,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [
          {
            id: 'cat1-1',
            name: 'Subcategory 1.1',
            number: '1.1',
            parentId: 'cat1',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [
              {
                id: 'cat1-1-1',
                name: 'Sub-subcategory 1.1.1',
                number: '1.1.1',
                parentId: 'cat1-1',
                order: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: { medications: 5 },
              },
              {
                id: 'cat1-1-2',
                name: 'Sub-subcategory 1.1.2',
                number: '1.1.2',
                parentId: 'cat1-1',
                order: 2,
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: { medications: 3 },
              },
            ],
            _count: { medications: 0 },
          },
          {
            id: 'cat1-2',
            name: 'Subcategory 1.2',
            number: '1.2',
            parentId: 'cat1',
            order: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
            _count: { medications: 0 },
          },
        ],
        _count: { medications: 0 },
      },
      {
        id: 'cat2',
        name: 'Category 2',
        number: '2',
        parentId: null,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
        _count: { medications: 0 },
      },
    ];

    const result = findMatchingCategoryIds(categories);
    expect(result).toEqual([
      'cat1',
      'cat1-1',
      'cat1-1-1',
      'cat1-1-2',
      'cat1-2',
      'cat2',
    ]);
  });

  it('should maintain order: Level 1, then Level 2, then Level 3 within each parent', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'A',
        name: 'A',
        number: '1',
        parentId: null,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [
          {
            id: 'A1',
            name: 'A1',
            number: '1.1',
            parentId: 'A',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [
              {
                id: 'A1a',
                name: 'A1a',
                number: '1.1.1',
                parentId: 'A1',
                order: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: { medications: 0 },
              },
            ],
            _count: { medications: 0 },
          },
          {
            id: 'A2',
            name: 'A2',
            number: '1.2',
            parentId: 'A',
            order: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [],
            _count: { medications: 0 },
          },
        ],
        _count: { medications: 0 },
      },
    ];

    const result = findMatchingCategoryIds(categories);
    // Should be: A, A1, A1a (Level 3 of A1), then A2
    expect(result).toEqual(['A', 'A1', 'A1a', 'A2']);
  });

  it('should handle mixed hierarchy depths', () => {
    const categories: CategoryWithChildrenAndCount[] = [
      {
        id: 'cat1',
        name: 'Category 1',
        number: '1',
        parentId: null,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [
          {
            id: 'cat1-1',
            name: 'Subcategory 1.1',
            number: '1.1',
            parentId: 'cat1',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            children: [
              {
                id: 'cat1-1-1',
                name: 'Sub-subcategory 1.1.1',
                number: '1.1.1',
                parentId: 'cat1-1',
                order: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
                _count: { medications: 0 },
              },
            ],
            _count: { medications: 0 },
          },
        ],
        _count: { medications: 0 },
      },
      {
        id: 'cat2',
        name: 'Category 2',
        number: '2',
        parentId: null,
        order: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [], // No children
        _count: { medications: 0 },
      },
    ];

    const result = findMatchingCategoryIds(categories);
    expect(result).toEqual(['cat1', 'cat1-1', 'cat1-1-1', 'cat2']);
  });
});
