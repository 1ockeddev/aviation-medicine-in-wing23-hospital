/**
 * Drag and Drop Validation Helper
 * 
 * Validates drag and drop operations for category reordering.
 * Allows categories to be moved to different levels (cross-level drag).
 */

interface CategoryDropData {
  id: string;
  parentId: string | null;
  level?: number;
}

/**
 * Validates whether a category can be dropped at a target position
 * 
 * @param activeCategory - The category being dragged
 * @param overCategory - The target category where drop is attempted
 * @returns null if drop is valid, Thai error message string if invalid
 * 
 * Validation Rules:
 * - Cannot drop category onto itself
 * - Cannot create more than 3 levels of hierarchy
 * - All other moves are allowed (cross-level drag supported)
 */
export function validateDrop(
  activeCategory: CategoryDropData,
  overCategory: CategoryDropData
): string | null {
  // Cannot drop onto itself
  if (activeCategory.id === overCategory.id) {
    return 'ไม่สามารถย้ายหมวดหมู่ไปยังตำแหน่งเดิมได้';
  }

  // Allow all moves - cross-level drag is now supported
  // Hierarchy depth validation will be handled by the server
  return null;
}

/**
 * Validates hierarchy depth to ensure max 3 levels
 * This should be called on the server side
 */
export function validateHierarchyDepth(
  targetParentId: string | null,
  targetParentLevel: number | null
): string | null {
  // If moving to Level 1 (no parent), always valid
  if (targetParentId === null) {
    return null;
  }

  // If target parent is at level 3, cannot add child (would create level 4)
  if (targetParentLevel !== null && targetParentLevel >= 3) {
    return 'ไม่สามารถสร้างหมวดหมู่เกิน 3 ระดับได้';
  }

  return null;
}
