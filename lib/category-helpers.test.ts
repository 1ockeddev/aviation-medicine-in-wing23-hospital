import { describe, it, expect } from 'vitest';
import { extractAllCategoryIds } from './category-helpers';

describe('extractAllCategoryIds', () => {
  it('should return empty array for empty input', () => {
    const result = extractAllCategoryIds([]);
    expect(result).toEqual([]);
  });

  it('should extract IDs from single level (Level 1 only)', () => {
    const categories = [
      { id: 'cat-1', children: [] },
      { id: 'cat-2', children: [] },
      { id: 'cat-3', children: [] },
    ];
    const result = extractAllCategoryIds(categories);
    expect(result).toEqual(['cat-1', 'cat-2', 'cat-3']);
  });

  it('should extract IDs from two levels (Level 1 and Level 2)', () => {
    const categories = [
      {
        id: 'cat-1',
        children: [
          { id: 'cat-1-1', children: [] },
          { id: 'cat-1-2', children: [] },
        ],
      },
      {
        id: 'cat-2',
        children: [
          { id: 'cat-2-1', children: [] },
        ],
      },
    ];
    const result = extractAllCategoryIds(categories);
    expect(result).toEqual(['cat-1', 'cat-1-1', 'cat-1-2', 'cat-2', 'cat-2-1']);
  });

  it('should extract IDs from all three levels', () => {
    const categories = [
      {
        id: 'cat-1',
        children: [
          {
            id: 'cat-1-1',
            children: [
              { id: 'cat-1-1-1', children: [] },
              { id: 'cat-1-1-2', children: [] },
            ],
          },
          {
            id: 'cat-1-2',
            children: [
              { id: 'cat-1-2-1', children: [] },
            ],
          },
        ],
      },
      {
        id: 'cat-2',
        children: [
          {
            id: 'cat-2-1',
            children: [
              { id: 'cat-2-1-1', children: [] },
            ],
          },
        ],
      },
    ];
    const result = extractAllCategoryIds(categories);
    expect(result).toEqual([
      'cat-1',
      'cat-1-1',
      'cat-1-1-1',
      'cat-1-1-2',
      'cat-1-2',
      'cat-1-2-1',
      'cat-2',
      'cat-2-1',
      'cat-2-1-1',
    ]);
  });

  it('should handle mixed hierarchy (some categories with children, some without)', () => {
    const categories = [
      {
        id: 'cat-1',
        children: [
          { id: 'cat-1-1', children: [] },
          {
            id: 'cat-1-2',
            children: [
              { id: 'cat-1-2-1', children: [] },
            ],
          },
        ],
      },
      { id: 'cat-2', children: [] },
    ];
    const result = extractAllCategoryIds(categories);
    expect(result).toEqual(['cat-1', 'cat-1-1', 'cat-1-2', 'cat-1-2-1', 'cat-2']);
  });

  it('should handle categories without children property', () => {
    const categories = [
      { id: 'cat-1' },
      { id: 'cat-2', children: [] },
    ];
    const result = extractAllCategoryIds(categories);
    expect(result).toEqual(['cat-1', 'cat-2']);
  });

  it('should preserve order of IDs (depth-first traversal)', () => {
    const categories = [
      {
        id: 'A',
        children: [
          {
            id: 'A1',
            children: [
              { id: 'A1a', children: [] },
            ],
          },
          { id: 'A2', children: [] },
        ],
      },
      {
        id: 'B',
        children: [
          { id: 'B1', children: [] },
        ],
      },
    ];
    const result = extractAllCategoryIds(categories);
    expect(result).toEqual(['A', 'A1', 'A1a', 'A2', 'B', 'B1']);
  });

  it('should handle large category hierarchies', () => {
    // Create a large hierarchy with 10 level 1, 10 level 2 each, 10 level 3 each
    const categories = Array.from({ length: 10 }, (_, i) => ({
      id: `cat-${i}`,
      children: Array.from({ length: 10 }, (_, j) => ({
        id: `cat-${i}-${j}`,
        children: Array.from({ length: 10 }, (_, k) => ({
          id: `cat-${i}-${j}-${k}`,
          children: [],
        })),
      })),
    }));
    
    const result = extractAllCategoryIds(categories);
    // Should have 10 + (10 * 10) + (10 * 10 * 10) = 10 + 100 + 1000 = 1110 IDs
    expect(result).toHaveLength(1110);
    // Verify first and last IDs
    expect(result[0]).toBe('cat-0');
    expect(result[result.length - 1]).toBe('cat-9-9-9');
  });
});
