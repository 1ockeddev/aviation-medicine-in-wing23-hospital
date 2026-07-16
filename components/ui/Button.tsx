import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            // Primary variant (default blue)
            'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600': 
              variant === 'primary' || variant === 'default',
            // Secondary variant (gray)
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500': 
              variant === 'secondary',
            // Danger variant (red for destructive actions)
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600': 
              variant === 'danger' || variant === 'destructive',
            // Warning variant (orange/yellow for important actions)
            'bg-orange-500 text-white hover:bg-orange-600 focus-visible:ring-orange-500': 
              variant === 'warning',
            // Outline variant
            'border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-500': 
              variant === 'outline',
            // Ghost variant
            'hover:bg-gray-100 focus-visible:ring-gray-500': 
              variant === 'ghost',
            // Link variant
            'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-600': 
              variant === 'link',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
