import * as React from 'react';
import { AccordionToggle } from '@/components/ui/AccordionToggle';
import { USER_COLORS } from '@/lib/user-colors';
import { cn } from '@/lib/utils';

export interface CategoryHeaderProps {
  /** Category object with id and name */
  category: {
    id: string;
    name: string;
  };
  /** Whether the accordion is currently expanded */
  isExpanded: boolean;
  /** Click handler for toggling the accordion */
  onToggle: (e: React.MouseEvent) => void;
  /** Keyboard handler for Enter/Space keys */
  onKeyDown: (e: React.KeyboardEvent) => void;
  /** Number of medications in this category */
  medicationCount: number;
  /** Whether this category has children (subcategories) */
  hasChildren?: boolean;
  /** Optional search query for highlighting */
  searchQuery?: string;
  /** Optional highlight function */
  highlightFn?: (text: string, query: string) => React.ReactNode;
}

/**
 * CategoryHeader - Header component for category accordion items
 * 
 * Displays the category name, medication count, and an accordion toggle button.
 * Applies the user-side design system colors including Navy Blue for text
 * and Medium Blue for toggle icons. Implements hover states with Soft Blue Gradient.
 * 
 * Features:
 * - Full-width tappable area on mobile
 * - ARIA attributes for accessibility (aria-expanded, aria-controls, role="button")
 * - Keyboard navigation support (Enter/Space)
 * - Thai language medication count format "(X รายการ)"
 * - Hover state with gradient colors
 * 
 * Color palette:
 * - Text: Navy Blue (#232e49)
 * - Toggle icons: Medium Blue (#61a4ca)
 * - Hover: Soft Blue Gradient (#99c4dd, #8fbed9, #bdd9e9)
 * 
 * @example
 * ```tsx
 * <CategoryHeader
 *   category={{ id: '1', name: 'Antibiotics' }}
 *   isExpanded={false}
 *   onToggle={(e) => handleToggle(e)}
 *   onKeyDown={(e) => handleKeyDown(e)}
 *   medicationCount={15}
 * />
 * ```
 */
export function CategoryHeader({
  category,
  isExpanded,
  onToggle,
  onKeyDown,
  medicationCount,
  hasChildren = false,
  searchQuery = '',
  highlightFn,
}: CategoryHeaderProps) {
  // Display category name with highlighting if search query exists
  const displayName = searchQuery && highlightFn
    ? highlightFn(category.name, searchQuery)
    : category.name;

  // Show toggle button if has medications OR has subcategories
  const showToggle = medicationCount > 0 || hasChildren;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={onKeyDown}
      aria-expanded={isExpanded}
      aria-controls={`category-content-${category.id}`}
      aria-label={`หมวดหมู่ ${category.name} (${medicationCount} รายการ)`}
      className={cn(
        // Layout - full width tappable on mobile
        'w-full flex items-center justify-between gap-4',
        'px-4',
        // Background and hover state with Soft Blue Gradient
        'bg-transparent',
        'hover:bg-gradient-to-r hover:from-[#99c4dd] hover:via-[#8fbed9] hover:to-[#bdd9e9]',
        'transition-all duration-200',
        // Cursor
        'cursor-pointer',
        // Remove all focus rings and borders
        'focus:outline-none focus:ring-0',
        // Touch optimization
        'touch-manipulation'
      )}
    >
      {/* Category info section */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <h3
          className="font-semibold text-base md:text-lg truncate"
          style={{ color: USER_COLORS.navyBlue }}
        >
          {displayName}
        </h3>
        <span
          className="text-sm md:text-base whitespace-nowrap"
          style={{ color: USER_COLORS.navyBlue }}
        >
        </span>
      </div>

      {/* Accordion toggle */}
      <AccordionToggle
        isExpanded={isExpanded}
        hasChildren={showToggle}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(e);
        }}
        aria-label={
          isExpanded
            ? `ยุบหมวดหมู่ ${category.name}`
            : `ขยายหมวดหมู่ ${category.name}`
        }
        className={cn(
          // Icon color - Medium Blue
          '[&_svg]:!text-[#61a4ca]',
          // Remove focus ring and offset (causes white border)
          'focus:!ring-0 focus:!ring-offset-0 focus:!outline-none'
        )}
      />
    </div>
  );
}
