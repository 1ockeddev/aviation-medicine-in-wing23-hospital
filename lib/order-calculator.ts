/**
 * Order Calculation Helper
 * 
 * Calculates new order values for categories after drag and drop reordering.
 * Ensures sequential order without gaps (0, 1, 2, 3...).
 */

interface CategoryWithOrder {
  id: string;
  order: number;
}

export interface OrderUpdate {
  id: string;
  newOrder: number;
}

/**
 * Calculates new order values when moving a category to a new position
 * 
 * @param categoryId - ID of the category being moved
 * @param newPosition - Target order position (0-indexed)
 * @param siblings - Array of all sibling categories with their current order
 * @returns Array of updates needed { id, newOrder } for affected categories
 * 
 * Algorithm:
 * - Moving down (newPosition > oldPosition): Shift items between old and new position up
 * - Moving up (newPosition < oldPosition): Shift items between new and old position down
 * - No change (newPosition === oldPosition): Return empty array
 */
export function calculateNewOrder(
  categoryId: string,
  newPosition: number,
  siblings: CategoryWithOrder[]
): OrderUpdate[] {
  // Find the category being moved
  const movingCategory = siblings.find((cat) => cat.id === categoryId);
  
  if (!movingCategory) {
    return [];
  }

  const oldPosition = movingCategory.order;

  // No change needed
  if (oldPosition === newPosition) {
    return [];
  }

  const updates: OrderUpdate[] = [];

  if (newPosition > oldPosition) {
    // Moving down: shift items between old and new position up by 1
    for (const sibling of siblings) {
      if (sibling.id === categoryId) {
        // Moving category goes to new position
        updates.push({ id: sibling.id, newOrder: newPosition });
      } else if (sibling.order > oldPosition && sibling.order <= newPosition) {
        // Items in between shift up (order - 1)
        updates.push({ id: sibling.id, newOrder: sibling.order - 1 });
      }
    }
  } else {
    // Moving up: shift items between new and old position down by 1
    for (const sibling of siblings) {
      if (sibling.id === categoryId) {
        // Moving category goes to new position
        updates.push({ id: sibling.id, newOrder: newPosition });
      } else if (sibling.order >= newPosition && sibling.order < oldPosition) {
        // Items in between shift down (order + 1)
        updates.push({ id: sibling.id, newOrder: sibling.order + 1 });
      }
    }
  }

  return updates;
}
