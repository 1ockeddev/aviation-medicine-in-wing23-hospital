import { describe, it, expect } from 'vitest';

type CategoryLevel3 = {
  id: string;
  name: string;
  _count: {
    medications: number;
  };
};

type CategoryLevel2 = {
  id: string;
  name: string;
  children: CategoryLevel3[];
  _count: {
    medications: number;
  };
};

type CategoryWithChildrenAndCount = {
  id: string;
  name: string;
  children: CategoryLevel2[];
  _count: {
    medications: number;
  };
};

// Helper function to calculate total medication count including all subcategories
const calculateTotalMedicationCount = (category: CategoryWithChildrenAndCount | CategoryLevel2 | CategoryLevel3): number => {
  // Start with direct medication count
  let total = category._count.medications;
  
  // Add counts from all children recursively
  if ('children' in category && category.children.length > 0) {
    for (const child of category.children) {
      total += calculateTotalMedicationCount(child);
    }
  }
  
  return total;
};

describe('calculateTotalMedicationCount', () => {
  it('should count direct medications for Level 3 category (no children)', () => {
    const level3Category: CategoryLevel3 = {
      id: '1',
      name: 'Level 3',
      _count: { medications: 5 },
    };

    expect(calculateTotalMedicationCount(level3Category)).toBe(5);
  });

  it('should count medications from Level 2 category and its Level 3 children', () => {
    const level2Category: CategoryLevel2 = {
      id: '1',
      name: 'Level 2',
      _count: { medications: 3 }, // 3 direct medications
      children: [
        { id: '2', name: 'Level 3 A', _count: { medications: 5 } },
        { id: '3', name: 'Level 3 B', _count: { medications: 7 } },
      ],
    };

    // Should be 3 + 5 + 7 = 15
    expect(calculateTotalMedicationCount(level2Category)).toBe(15);
  });

  it('should count medications from Level 1 category and entire subtree', () => {
    const level1Category: CategoryWithChildrenAndCount = {
      id: '1',
      name: 'Level 1',
      _count: { medications: 2 }, // 2 direct medications
      children: [
        {
          id: '2',
          name: 'Level 2 A',
          _count: { medications: 3 }, // 3 direct medications
          children: [
            { id: '4', name: 'Level 3 A1', _count: { medications: 5 } },
            { id: '5', name: 'Level 3 A2', _count: { medications: 4 } },
          ],
        },
        {
          id: '3',
          name: 'Level 2 B',
          _count: { medications: 1 }, // 1 direct medication
          children: [
            { id: '6', name: 'Level 3 B1', _count: { medications: 8 } },
          ],
        },
      ],
    };

    // Should be 2 + 3 + 5 + 4 + 1 + 8 = 23
    expect(calculateTotalMedicationCount(level1Category)).toBe(23);
  });

  it('should handle Level 1 category with no children', () => {
    const level1Category: CategoryWithChildrenAndCount = {
      id: '1',
      name: 'Level 1 Only',
      _count: { medications: 10 },
      children: [],
    };

    expect(calculateTotalMedicationCount(level1Category)).toBe(10);
  });

  it('should handle Level 2 category with no children', () => {
    const level2Category: CategoryLevel2 = {
      id: '1',
      name: 'Level 2 Only',
      _count: { medications: 8 },
      children: [],
    };

    expect(calculateTotalMedicationCount(level2Category)).toBe(8);
  });

  it('should handle zero medications at all levels', () => {
    const level1Category: CategoryWithChildrenAndCount = {
      id: '1',
      name: 'Empty Category',
      _count: { medications: 0 },
      children: [
        {
          id: '2',
          name: 'Empty Level 2',
          _count: { medications: 0 },
          children: [
            { id: '3', name: 'Empty Level 3', _count: { medications: 0 } },
          ],
        },
      ],
    };

    expect(calculateTotalMedicationCount(level1Category)).toBe(0);
  });

  it('should handle realistic scenario where main category shows sum of subcategories', () => {
    // Example: Main category has 0 direct medications, but subcategories have medications
    const mainCategory: CategoryWithChildrenAndCount = {
      id: '1',
      name: 'Main Category',
      _count: { medications: 0 }, // No direct medications
      children: [
        {
          id: '2',
          name: 'Subcategory A',
          _count: { medications: 0 }, // No direct medications
          children: [
            { id: '3', name: 'Leaf A1', _count: { medications: 12 } },
            { id: '4', name: 'Leaf A2', _count: { medications: 8 } },
          ],
        },
        {
          id: '5',
          name: 'Subcategory B',
          _count: { medications: 5 }, // Some direct medications
          children: [
            { id: '6', name: 'Leaf B1', _count: { medications: 15 } },
          ],
        },
      ],
    };

    // Should be 0 + 0 + 12 + 8 + 5 + 15 = 40
    expect(calculateTotalMedicationCount(mainCategory)).toBe(40);
  });
});
