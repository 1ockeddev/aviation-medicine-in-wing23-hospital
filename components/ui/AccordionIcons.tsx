import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AccordionIconProps {
  className?: string;
}

/**
 * PlusIcon - Visual indicator for collapsed accordion state
 * 
 * Displays a plus (+) icon indicating that a category can be expanded.
 * Used in accordion functionality to show expandable items.
 * Size: 16x16px, uses currentColor for theme flexibility.
 * 
 * @example
 * ```tsx
 * <PlusIcon />
 * <PlusIcon className="text-blue-500" />
 * ```
 */
export function PlusIcon({ className }: AccordionIconProps) {
  return (
    <svg 
      className={cn('w-4 h-4 text-gray-600', className)} 
      viewBox="0 0 16 16" 
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="8" y1="4" x2="8" y2="12" />
      <line x1="4" y1="8" x2="12" y2="8" />
    </svg>
  );
}

/**
 * MinusIcon - Visual indicator for expanded accordion state
 * 
 * Displays a minus (-) icon indicating that a category can be collapsed.
 * Used in accordion functionality to show collapsible items.
 * Size: 16x16px, uses currentColor for theme flexibility.
 * 
 * @example
 * ```tsx
 * <MinusIcon />
 * <MinusIcon className="text-blue-500" />
 * ```
 */
export function MinusIcon({ className }: AccordionIconProps) {
  return (
    <svg 
      className={cn('w-4 h-4 text-gray-600', className)} 
      viewBox="0 0 16 16" 
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="8" x2="12" y2="8" />
    </svg>
  );
}
