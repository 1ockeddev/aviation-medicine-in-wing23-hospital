import * as React from 'react';
import { PlusIcon, MinusIcon } from './AccordionIcons';
import { cn } from '@/lib/utils';

export interface AccordionToggleProps {
  /** Whether the accordion is currently expanded */
  isExpanded: boolean;
  /** Whether the category has children that can be toggled */
  hasChildren: boolean;
  /** Click handler for the toggle button */
  onClick: (e: React.MouseEvent) => void;
  /** Accessible label for screen readers */
  'aria-label': string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * AccordionToggle - Reusable toggle button component for accordion functionality
 * 
 * Displays a plus (+) icon when collapsed and minus (-) icon when expanded.
 * Provides a minimum 44x44px touch target for accessibility.
 * Returns null when the item has no children.
 * 
 * Features:
 * - ARIA attributes for screen reader support
 * - Hover effects and smooth transitions
 * - Touch-friendly 44x44px minimum size
 * - Keyboard accessible (receives focus)
 * 
 * @example
 * ```tsx
 * <AccordionToggle
 *   isExpanded={true}
 *   hasChildren={true}
 *   onClick={(e) => handleToggle(e)}
 *   aria-label="Collapse category"
 * />
 * ```
 */
export function AccordionToggle({
  isExpanded,
  hasChildren,
  onClick,
  'aria-label': ariaLabel,
  className,
}: AccordionToggleProps) {
  // If there are no children, render an empty spacer div with same dimensions
  if (!hasChildren) {
    return (
      <div
        className={cn(
          // Same size as button for consistent spacing
          'min-w-[44px] min-h-[44px]',
          'flex-shrink-0',
          className
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      aria-label={ariaLabel}
      aria-expanded={isExpanded}
      className={cn(
        // Minimum touch target size (44x44px) for accessibility
        'min-w-[44px] min-h-[44px]',
        // Layout
        'flex items-center justify-center flex-shrink-0',
        // Interactive states - using Design System colors
        'hover:bg-[#8fbed9]',
        'active:bg-[#8fbed9]',
        // Visual styling
        'rounded',
        'transition-colors duration-150',
        // Touch optimization
        'touch-manipulation',
        // Remove focus ring and outline (no border when clicked)
        'focus:outline-none focus:ring-0',
        className
      )}
    >
      {isExpanded ? <MinusIcon /> : <PlusIcon />}
    </button>
  );
}
