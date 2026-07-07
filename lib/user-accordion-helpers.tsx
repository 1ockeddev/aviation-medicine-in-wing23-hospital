/**
 * Helper functions for user-side category accordion
 * 
 * This module provides utility functions for:
 * - Filtering popular categories
 * - Searching and filtering categories with medications
 * - Highlighting search terms in text
 */

import type { Category, Medication } from '@prisma/client';

export type CategoryWithMedicationCount = Category & {
  _count: {
    medications: number;
  };
  children?: CategoryWithMedicationCount[];
};

export type MedicationWithCategory = Medication & {
  category: Category;
};

/**
 * Get popular categories (those with 10+ medications)
 * Returns top N categories sorted by medication count in descending order
 * 
 * @param categories - Array of categories with medication counts
 * @param limit - Maximum number of categories to return (default: 5)
 * @returns Array of popular categories, max length = limit
 */
export function getPopularCategories(
  categories: CategoryWithMedicationCount[],
  limit: number = 5
): CategoryWithMedicationCount[] {
  return categories
    .filter((category) => category._count.medications >= 10)
    .sort((a, b) => b._count.medications - a._count.medications)
    .slice(0, limit);
}

/**
 * Filter categories that contain medications matching the search query
 * Also filters subcategories recursively
 * 
 * @param categories - Array of all categories
 * @param medications - Array of all medications
 * @param searchQuery - Search query string
 * @returns Array of categories that have medications matching the query or category name matching the query (including subcategories)
 */
export function filterCategoriesWithSearch(
  categories: CategoryWithMedicationCount[],
  medications: MedicationWithCategory[],
  searchQuery: string
): CategoryWithMedicationCount[] {
  if (!searchQuery.trim()) {
    return categories;
  }

  const query = searchQuery.toLowerCase().trim();
  
  // Find medications that match the search query (name or trade name)
  const matchingMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(query) ||
    (med.tradeName && med.tradeName.toLowerCase().includes(query))
  );

  // Get unique category IDs from matching medications (all levels)
  const matchingCategoryIds = new Set(
    matchingMedications.map((med) => med.categoryId)
  );

  // Recursive function to get category and all its descendant IDs
  function getCategoryAndDescendantIds(category: CategoryWithMedicationCount): string[] {
    const ids = [category.id];
    if (category.children) {
      category.children.forEach(child => {
        ids.push(...getCategoryAndDescendantIds(child));
      });
    }
    return ids;
  }

  // Find categories whose names match the search query (recursively)
  // Only add the matched category and its descendants, NOT its parents
  function collectCategoriesWithMatchingNames(cats: CategoryWithMedicationCount[]): void {
    cats.forEach(category => {
      if (category.name.toLowerCase().includes(query)) {
        // If category name matches, include this category and all descendants
        const allIds = getCategoryAndDescendantIds(category);
        allIds.forEach(id => matchingCategoryIds.add(id));
      }
      // Continue searching in children regardless of parent match
      if (category.children) {
        collectCategoriesWithMatchingNames(category.children);
      }
    });
  }

  // Collect category IDs where category name matches
  collectCategoriesWithMatchingNames(categories);

  // Recursive function to filter categories and their children
  function filterCategoryTree(category: CategoryWithMedicationCount): CategoryWithMedicationCount | null {
    // Check if category name matches
    const categoryNameMatches = category.name.toLowerCase().includes(query);
    
    // Check if this category has matching medications
    const hasMatchingMeds = matchingCategoryIds.has(category.id);
    
    // Filter children recursively
    const filteredChildren = category.children
      ? category.children
          .map(child => filterCategoryTree(child))
          .filter((child): child is CategoryWithMedicationCount => child !== null)
      : [];
    
    // Include category if:
    // 1. Category name matches, OR
    // 2. Has matching medications, OR
    // 3. Has filtered children (subcategories with matches)
    if (categoryNameMatches || hasMatchingMeds || filteredChildren.length > 0) {
      return {
        ...category,
        children: filteredChildren.length > 0 ? filteredChildren : category.children,
      };
    }
    
    return null;
  }

  // Filter Level 1 categories
  return categories
    .map(category => filterCategoryTree(category))
    .filter((category): category is CategoryWithMedicationCount => category !== null);
}

/**
 * Highlight search term in text by wrapping it with a span
 * 
 * @param text - Text to search within
 * @param searchQuery - Search query to highlight
 * @returns React node with highlighted text, or original text if no match
 */
export function highlightSearchTerm(
  text: string,
  searchQuery: string
): React.ReactNode {
  if (!searchQuery.trim() || !text) {
    return text;
  }

  const query = searchQuery.trim();
  
  try {
    // Escape special regex characters in the search query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span
            key={index}
            style={{
              backgroundColor: '#fef08a', // yellow-200
              fontWeight: 600, // font-semibold
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  } catch (error) {
    // If regex fails (invalid pattern), return original text
    console.warn('Failed to highlight search term:', error);
    return text;
  }
}

/**
 * Extract all category IDs from filtered categories (for search auto-expand)
 * Includes parent categories and all their children recursively
 * 
 * @param categories - Filtered categories
 * @returns Array of category IDs (all levels)
 */
export function extractCategoryIds(
  categories: CategoryWithMedicationCount[]
): string[] {
  const ids: string[] = [];
  
  function collectIds(category: CategoryWithMedicationCount) {
    ids.push(category.id);
    if (category.children && category.children.length > 0) {
      category.children.forEach(child => collectIds(child));
    }
  }
  
  categories.forEach(category => collectIds(category));
  
  return ids;
}
