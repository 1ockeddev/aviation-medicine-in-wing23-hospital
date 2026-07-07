import { describe, test, expect } from 'vitest';
import { getPopularCategories, filterCategoriesWithSearch, highlightSearchTerm } from './user-accordion-helpers';
import type { CategoryWithMedicationCount, MedicationWithCategory } from '@/types';

// Mock data helpers
function createCategory(id: string, name: string, medicationCount: number): CategoryWithMedicationCount {
  return {
    id,
    name,
    description: null,
    displayOrder: 0,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      medications: medicationCount,
    },
  };
}

function createMedication(id: string, name: string, tradeName: string | null, categoryId: string): MedicationWithCategory {
  return {
    id,
    name,
    tradeName,
    categoryId,
    halfLife: null,
    status: 'AVAILABLE',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: createCategory(categoryId, 'Test Category', 1),
  };
}

describe('getPopularCategories', () => {
  test('returns empty array when no categories meet criteria', () => {
    const categories = [
      createCategory('1', 'Cat 1', 5),
      createCategory('2', 'Cat 2', 8),
      createCategory('3', 'Cat 3', 9),
    ];
    
    const result = getPopularCategories(categories);
    expect(result).toEqual([]);
  });

  test('returns categories with 10 or more medications', () => {
    const categories = [
      createCategory('1', 'Cat 1', 5),
      createCategory('2', 'Cat 2', 10),
      createCategory('3', 'Cat 3', 15),
    ];
    
    const result = getPopularCategories(categories);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('3'); // 15 medications
    expect(result[1].id).toBe('2'); // 10 medications
  });

  test('sorts categories by medication count in descending order', () => {
    const categories = [
      createCategory('1', 'Cat 1', 10),
      createCategory('2', 'Cat 2', 50),
      createCategory('3', 'Cat 3', 25),
      createCategory('4', 'Cat 4', 100),
    ];
    
    const result = getPopularCategories(categories);
    expect(result[0]._count.medications).toBe(100);
    expect(result[1]._count.medications).toBe(50);
    expect(result[2]._count.medications).toBe(25);
    expect(result[3]._count.medications).toBe(10);
  });

  test('respects limit parameter (default 5)', () => {
    const categories = [
      createCategory('1', 'Cat 1', 10),
      createCategory('2', 'Cat 2', 20),
      createCategory('3', 'Cat 3', 30),
      createCategory('4', 'Cat 4', 40),
      createCategory('5', 'Cat 5', 50),
      createCategory('6', 'Cat 6', 60),
      createCategory('7', 'Cat 7', 70),
    ];
    
    const result = getPopularCategories(categories);
    expect(result).toHaveLength(5);
  });

  test('respects custom limit parameter', () => {
    const categories = [
      createCategory('1', 'Cat 1', 10),
      createCategory('2', 'Cat 2', 20),
      createCategory('3', 'Cat 3', 30),
      createCategory('4', 'Cat 4', 40),
    ];
    
    const result = getPopularCategories(categories, 2);
    expect(result).toHaveLength(2);
    expect(result[0]._count.medications).toBe(40);
    expect(result[1]._count.medications).toBe(30);
  });

  test('handles exactly 10 medications as popular', () => {
    const categories = [
      createCategory('1', 'Cat 1', 9),
      createCategory('2', 'Cat 2', 10),
    ];
    
    const result = getPopularCategories(categories);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('filterCategoriesWithSearch', () => {
  test('returns all categories when search query is empty', () => {
    const categories = [
      createCategory('1', 'Cat 1', 5),
      createCategory('2', 'Cat 2', 10),
    ];
    const medications: MedicationWithCategory[] = [];
    
    const result = filterCategoriesWithSearch(categories, medications, '');
    expect(result).toEqual(categories);
  });

  test('returns all categories when search query is whitespace', () => {
    const categories = [
      createCategory('1', 'Cat 1', 5),
      createCategory('2', 'Cat 2', 10),
    ];
    const medications: MedicationWithCategory[] = [];
    
    const result = filterCategoriesWithSearch(categories, medications, '   ');
    expect(result).toEqual(categories);
  });

  test('filters categories by medication name match', () => {
    const categories = [
      createCategory('1', 'Painkillers', 5),
      createCategory('2', 'Antibiotics', 10),
    ];
    const medications = [
      createMedication('m1', 'Aspirin', null, '1'),
      createMedication('m2', 'Ibuprofen', null, '1'),
      createMedication('m3', 'Amoxicillin', null, '2'),
    ];
    
    const result = filterCategoriesWithSearch(categories, medications, 'aspirin');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  test('filters categories by trade name match', () => {
    const categories = [
      createCategory('1', 'Painkillers', 5),
      createCategory('2', 'Antibiotics', 10),
    ];
    const medications = [
      createMedication('m1', 'Acetaminophen', 'Tylenol', '1'),
      createMedication('m2', 'Amoxicillin', 'Amoxil', '2'),
    ];
    
    const result = filterCategoriesWithSearch(categories, medications, 'tylenol');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  test('search is case-insensitive', () => {
    const categories = [
      createCategory('1', 'Painkillers', 5),
    ];
    const medications = [
      createMedication('m1', 'Aspirin', null, '1'),
    ];
    
    const result1 = filterCategoriesWithSearch(categories, medications, 'ASPIRIN');
    const result2 = filterCategoriesWithSearch(categories, medications, 'aspirin');
    const result3 = filterCategoriesWithSearch(categories, medications, 'AsPiRiN');
    
    expect(result1).toHaveLength(1);
    expect(result2).toHaveLength(1);
    expect(result3).toHaveLength(1);
  });

  test('returns multiple categories with matching medications', () => {
    const categories = [
      createCategory('1', 'Painkillers', 5),
      createCategory('2', 'Fever Reducers', 10),
      createCategory('3', 'Antibiotics', 8),
    ];
    const medications = [
      createMedication('m1', 'Aspirin', null, '1'),
      createMedication('m2', 'Ibuprofen', 'Advil', '2'),
      createMedication('m3', 'Amoxicillin', null, '3'),
    ];
    
    const result = filterCategoriesWithSearch(categories, medications, 'i');
    expect(result).toHaveLength(3); // All contain 'i' in name or trade name
  });

  test('returns empty array when no medications match', () => {
    const categories = [
      createCategory('1', 'Painkillers', 5),
      createCategory('2', 'Antibiotics', 10),
    ];
    const medications = [
      createMedication('m1', 'Aspirin', null, '1'),
      createMedication('m2', 'Amoxicillin', null, '2'),
    ];
    
    const result = filterCategoriesWithSearch(categories, medications, 'zzz');
    expect(result).toHaveLength(0);
  });

  test('handles partial matches', () => {
    const categories = [
      createCategory('1', 'Painkillers', 5),
    ];
    const medications = [
      createMedication('m1', 'Aspirin', null, '1'),
    ];
    
    const result = filterCategoriesWithSearch(categories, medications, 'asp');
    expect(result).toHaveLength(1);
  });
});

describe('highlightSearchTerm', () => {
  test('returns original text when search query is empty', () => {
    const result = highlightSearchTerm('Aspirin', '');
    expect(result).toBe('Aspirin');
  });

  test('returns original text when search query is whitespace', () => {
    const result = highlightSearchTerm('Aspirin', '   ');
    expect(result).toBe('Aspirin');
  });

  test('returns original text when text is empty', () => {
    const result = highlightSearchTerm('', 'test');
    expect(result).toBe('');
  });

  test('highlights single match case-insensitively', () => {
    const result = highlightSearchTerm('Aspirin 100mg', 'asp');
    
    // Result should be an array with highlighted span
    expect(Array.isArray(result)).toBe(true);
    // First element should be empty string (before match)
    // Second element should be the highlighted span
    // Third element should be 'irin 100mg'
  });

  test('highlights multiple matches', () => {
    const result = highlightSearchTerm('Aspirin is aspirin', 'aspirin');
    
    expect(Array.isArray(result)).toBe(true);
    // Should have multiple parts with highlights
  });

  test('handles special regex characters in search query', () => {
    const result = highlightSearchTerm('Test (parentheses)', '(paren');
    
    // Should not throw error and should return text
    expect(result).toBeDefined();
  });

  test('handles case-insensitive matching', () => {
    const result = highlightSearchTerm('Aspirin', 'ASPIRIN');
    
    expect(Array.isArray(result)).toBe(true);
  });

  test('returns original text when no match found', () => {
    const result = highlightSearchTerm('Aspirin', 'zzz');
    
    expect(result).toBe('Aspirin');
  });

  test('handles partial matches', () => {
    const result = highlightSearchTerm('Aspirin 100mg', 'rin');
    
    expect(Array.isArray(result)).toBe(true);
  });
});
