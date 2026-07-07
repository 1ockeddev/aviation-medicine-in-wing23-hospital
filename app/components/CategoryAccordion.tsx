/**
 * CategoryAccordion Component
 * 
 * Container component that renders a list of category items with accordion functionality.
 * Displays medication categories in an expandable/collapsible format for the user-facing interface.
 * 
 * Features:
 * - Renders list of CategoryAccordionItem components
 * - Filters medications for each category
 * - Applies container styling with design system colors
 * - Supports responsive design (mobile, tablet, desktop)
 * - Touch-friendly minimum 44x44px targets (handled by AccordionToggle)
 * - Empty state when no categories exist
 * 
 * Requirements: 1.1, 1.2, 1.4, 8.1, 8.2, 8.4, 12.2
 */

import React from 'react';
import type { Medication } from '@prisma/client';
import type { CategoryWithMedicationCount } from '@/lib/user-accordion-helpers';
import { CategoryAccordionItem } from './CategoryAccordionItem';

export interface CategoryAccordionProps {
  /** Array of categories to display with medication counts */
  categories: CategoryWithMedicationCount[];
  /** Set of expanded category IDs */
  expandedCategories: Set<string>;
  /** Toggle handler for expanding/collapsing categories */
  onToggle: (categoryId: string) => void;
  /** Current search query for filtering and highlighting */
  searchQuery: string;
  /** All medications (for filtering by category) */
  medications: Medication[];
  /** Handler for when a medication is clicked */
  onMedicationClick?: (medication: Medication) => void;
  /** ID of the currently selected medication */
  selectedMedicationId?: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * CategoryAccordion displays a list of expandable/collapsible category items
 * 
 * @example
 * ```tsx
 * <CategoryAccordion
 *   categories={categories}
 *   expandedCategories={expandedSet}
 *   onToggle={handleToggle}
 *   searchQuery={query}
 *   medications={allMedications}
 * />
 * ```
 */
export function CategoryAccordion({
  categories,
  expandedCategories,
  onToggle,
  searchQuery,
  medications,
  onMedicationClick,
  selectedMedicationId,
  className = '',
}: CategoryAccordionProps) {
  // Memoize medications by category to avoid recalculating on every render
  const medicationsByCategory = React.useMemo(() => {
    const map = new Map<string, Medication[]>();
    medications.forEach((med) => {
      if (!map.has(med.categoryId)) {
        map.set(med.categoryId, []);
      }
      map.get(med.categoryId)!.push(med);
    });
    return map;
  }, [medications]);

  // Empty state: no categories
  if (categories.length === 0) {
    return (
      <div
        className={`text-center py-8 px-4 bg-white rounded-lg shadow-sm ${className}`}
        role="status"
        aria-label="ไม่พบหมวดหมู่ยา"
      >
        <p className="text-gray-600 text-sm sm:text-base">
          ไม่พบหมวดหมู่ยา
        </p>
      </div>
    );
  }

  return (
    <div
      className={`space-y-3 ${className}`}
      role="region"
      aria-label="รายการหมวดหมู่ยา"
    >
      {categories.map((category) => {
        // Get medications that belong to this category from memoized map
        const categoryMedications = medicationsByCategory.get(category.id) || [];

        // Check if this category is expanded
        const isExpanded = expandedCategories.has(category.id);

        // Wrap onToggle to avoid creating new function on every render
        const handleToggle = () => onToggle(category.id);

        return (
          <CategoryAccordionItem
            key={category.id}
            category={category}
            medications={medications}
            isExpanded={isExpanded}
            onToggle={handleToggle}
            searchQuery={searchQuery}
            onMedicationClick={onMedicationClick}
            selectedMedicationId={selectedMedicationId}
            level={1}
            expandedCategories={expandedCategories}
            onToggleSubcategory={onToggle}
          />
        );
      })}
    </div>
  );
}
