/**
 * Category helper functions for the Category Accordion feature
 */

type CategoryWithChildren = {
  id: string;
  children?: CategoryWithChildren[];
};

/**
 * Recursively extracts all category IDs from a 3-level category hierarchy
 * 
 * @param categories - Array of top-level categories with nested children
 * @returns Array of all category IDs across all 3 levels
 * 
 * @example
 * const categories = [
 *   { id: 'cat-1', children: [
 *     { id: 'cat-1-1', children: [
 *       { id: 'cat-1-1-1', children: [] }
 *     ]}
 *   ]}
 * ];
 * extractAllCategoryIds(categories); // ['cat-1', 'cat-1-1', 'cat-1-1-1']
 */
export function extractAllCategoryIds(categories: CategoryWithChildren[]): string[] {
  const ids: string[] = [];

  function traverse(categoryList: CategoryWithChildren[]): void {
    for (const category of categoryList) {
      // Add current category ID
      ids.push(category.id);

      // Recursively process children if they exist
      if (category.children && category.children.length > 0) {
        traverse(category.children);
      }
    }
  }

  traverse(categories);
  return ids;
}
