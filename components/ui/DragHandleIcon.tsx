import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DragHandleIconProps {
  className?: string;
}

/**
 * DragHandleIcon - Visual icon for drag interaction
 * 
 * Displays a six-dot pattern icon that indicates draggable elements.
 * Used with drag and drop functionality for category reordering.
 * 
 * @example
 * ```tsx
 * <DragHandleIcon />
 * <DragHandleIcon className="text-blue-500" />
 * ```
 */
export function DragHandleIcon({ className }: DragHandleIconProps) {
  return (
    <svg 
      className={cn('w-5 h-5 text-gray-600', className)} 
      viewBox="0 0 24 24" 
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="9" cy="5" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="15" cy="5" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="15" cy="19" r="1.5" />
    </svg>
  );
}
