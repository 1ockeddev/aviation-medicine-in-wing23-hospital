'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      children,
      confirmLabel = 'ยืนยัน',
      cancelLabel = 'ยกเลิก',
      onConfirm,
      onCancel,
      variant = 'default',
      loading = false,
    },
    ref
  ) => {
    const handleCancel = React.useCallback(() => {
      onCancel?.();
      onOpenChange(false);
    }, [onCancel, onOpenChange]);

    const handleConfirm = React.useCallback(() => {
      onConfirm?.();
    }, [onConfirm]);

    // Close on Escape key
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && open && !loading) {
          handleCancel();
        }
      };

      if (open) {
        document.addEventListener('keydown', handleKeyDown);
        // Prevent body scroll when dialog is open
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }, [open, handleCancel, loading]);

    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={!loading ? handleCancel : undefined}
          aria-hidden="true"
        />

        {/* Dialog Content */}
        <div
          ref={ref}
          className={cn(
            'relative z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg',
            'transform transition-all',
            'mx-4'
          )}
        >
          {/* Title */}
          <h2
            id="dialog-title"
            className="text-lg font-semibold text-gray-900 mb-2"
          >
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p
              id="dialog-description"
              className="text-sm text-gray-600 mb-4"
            >
              {description}
            </p>
          )}

          {/* Custom Content */}
          {children && <div className="mb-4">{children}</div>}

          {/* Actions - Only show if onConfirm is provided */}
          {onConfirm && (
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'กำลังดำเนินการ...' : confirmLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
Dialog.displayName = 'Dialog';

export { Dialog };
