/**
 * CategoryAccordionItem Component
 * 
 * Individual accordion item representing one medication category on the user-side home page.
 * 
 * Features:
 * - Expand/collapse functionality via CategoryHeader
 * - Conditionally renders MedicationList when expanded
 * - Recursively renders subcategories (Level 2, Level 3)
 * - Click isolation: clicking medication items doesn't toggle the accordion
 * - Smooth 200ms expand/collapse animation
 * - Ice Blue background color (#ddebf4)
 * - Filters medications to only those belonging to the category
 * 
 * Design Requirements:
 * - Background: Ice Blue (#ddebf4) or Soft Gray (#d1e4f0)
 * - Animation: 200ms smooth transition
 * - Click isolation: medication items have data-medication-item attribute
 * 
 * Validates: Requirements 1.4, 3.3, 3.6, 4.2, 4.3, 5.1, 10.4, 13.1, 13.2, 13.3
 */

import * as React from 'react';
import type { Medication } from '@prisma/client';
import type { CategoryWithMedicationCount } from '@/lib/user-accordion-helpers';
import { CategoryHeader } from './CategoryHeader';
import { MedicationList } from './MedicationList';
import { USER_COLORS } from '@/lib/user-colors';
import { highlightSearchTerm } from '@/lib/user-accordion-helpers';

export interface CategoryAccordionItemProps {
  /** Category with medication count and children */
  category: CategoryWithMedicationCount;
  /** All medications in the database */
  medications: Medication[];
  /** Whether this accordion item is currently expanded */
  isExpanded: boolean;
  /** Toggle handler for expand/collapse */
  onToggle: () => void;
  /** Search query for filtering and highlighting */
  searchQuery: string;
  /** Handler for when a medication is clicked */
  onMedicationClick?: (medication: Medication) => void;
  /** ID of the currently selected medication */
  selectedMedicationId?: string;
  /** Current level (1, 2, or 3) */
  level?: number;
  /** Set of all expanded category IDs (for subcategories) */
  expandedCategories?: Set<string>;
  /** Toggle handler for subcategories */
  onToggleSubcategory?: (categoryId: string) => void;
  /** Whether the parent category name matches the search query */
  parentCategoryNameMatches?: boolean;
}

/**
 * CategoryAccordionItem - Individual category in the accordion
 * 
 * @example
 * ```tsx
 * <CategoryAccordionItem
 *   category={{ id: '1', name: 'Antibiotics', _count: { medications: 15 } }}
 *   medications={allMedications}
 *   isExpanded={false}
 *   onToggle={() => handleToggle('1')}
 *   searchQuery="penicillin"
 * />
 * ```
 */
export function CategoryAccordionItem({
  category,
  medications,
  isExpanded,
  onToggle,
  searchQuery,
  onMedicationClick,
  selectedMedicationId,
  level = 1,
  expandedCategories,
  onToggleSubcategory,
  parentCategoryNameMatches = false,
}: CategoryAccordionItemProps) {
  // Check if category name matches search query
  const categoryNameMatches = searchQuery && category.name.toLowerCase().includes(searchQuery.toLowerCase().trim());

  // Filter medications to only those belonging to this category (NOT descendants)
  const categoryMedications = React.useMemo(() => {
    return medications.filter((med) => med.categoryId === category.id);
  }, [medications, category.id]);

  // Handle click with isolation - prevent toggle when clicking medication items
  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      // Check if the click originated from a medication item
      const target = e.target as HTMLElement;
      const medicationItem = target.closest('[data-medication-item]');
      
      if (medicationItem) {
        // Click was on a medication item, don't toggle
        return;
      }
      
      // Click was on the header area, toggle the accordion
      onToggle();
    },
    [onToggle]
  );

  // Handle keyboard events (Enter/Space)
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  // Indentation based on level
  const getIndentation = () => {
    if (level === 2) return 'ml-4';
    if (level === 3) return 'ml-8';
    return '';
  };

  // Check if has medications or subcategories
  const hasSubcategories = category.children && category.children.length > 0;
  const hasMedications = categoryMedications.length > 0; // Use actual filtered medications count
  const hasContent = hasMedications || hasSubcategories;

  // Determine medication search query to pass to MedicationList
  // If this category name matches OR parent category name matches: 
  //   pass empty string (show all medications without filtering by medication name)
  // If neither matches: pass the search query (filter medications by name)
  const shouldShowAllMedications = categoryNameMatches || parentCategoryNameMatches;
  const medicationSearchQuery = shouldShowAllMedications ? '' : searchQuery;

  return (
    <div
      className={`rounded-lg overflow-hidden shadow-sm ${getIndentation()}`}
      style={{ backgroundColor: USER_COLORS.iceBlue }}
    >
      {/* Category Header - always visible */}
      <CategoryHeader
        category={category}
        isExpanded={isExpanded}
        onToggle={handleClick}
        onKeyDown={handleKeyDown}
        medicationCount={categoryMedications.length} // Pass actual count, not _count
        hasChildren={hasSubcategories}
        searchQuery={searchQuery}
        highlightFn={highlightSearchTerm}
      />

      {/* Medication List and Subcategories - conditionally rendered with animation */}
      {hasContent && (
        <div
          className="overflow-hidden transition-all duration-200 ease-in-out"
          style={{
            maxHeight: isExpanded ? '10000px' : '0',
            opacity: isExpanded ? 1 : 0,
          }}
        >
          {isExpanded && (
            <>
              {/* Medications in this category */}
              {hasMedications && (
                <MedicationList
                  medications={categoryMedications}
                  searchQuery={medicationSearchQuery}
                  categoryId={category.id}
                  onMedicationClick={onMedicationClick}
                  selectedMedicationId={selectedMedicationId}
                />
              )}

              {/* Subcategories (Level 2 and Level 3) */}
              {hasSubcategories && (
                <div className="p-2 space-y-2 bg-white">
                  {category.children!.map((child) => {
                    const childExpanded = expandedCategories?.has(child.id) || false;
                    const handleChildToggle = () => {
                      if (onToggleSubcategory) {
                        onToggleSubcategory(child.id);
                      }
                    };

                    return (
                      <CategoryAccordionItem
                        key={child.id}
                        category={child}
                        medications={medications}
                        isExpanded={childExpanded}
                        onToggle={handleChildToggle}
                        searchQuery={searchQuery}
                        onMedicationClick={onMedicationClick}
                        selectedMedicationId={selectedMedicationId}
                        level={level + 1}
                        expandedCategories={expandedCategories}
                        onToggleSubcategory={onToggleSubcategory}
                        parentCategoryNameMatches={categoryNameMatches || parentCategoryNameMatches}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
