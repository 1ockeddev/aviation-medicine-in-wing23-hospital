import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  beforeEach(() => {
    // Reset body overflow before each test
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Cleanup body overflow after each test
    document.body.style.overflow = 'unset';
  });

  describe('Open/Close Behavior', () => {
    it('should render when open is true', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Test Dialog"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <Dialog
          open={false}
          onOpenChange={vi.fn()}
          title="Test Dialog"
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should call onOpenChange with false when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Dialog
          open={true}
          onOpenChange={handleOpenChange}
          title="Test Dialog"
        />
      );

      // Click the backdrop (not the dialog content)
      const backdrop = document.querySelector('.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not close on backdrop click when loading', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Dialog
          open={true}
          onOpenChange={handleOpenChange}
          title="Test Dialog"
          loading={true}
        />
      );

      const backdrop = document.querySelector('.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
      }

      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it('should close on Escape key press', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Dialog
          open={true}
          onOpenChange={handleOpenChange}
          title="Test Dialog"
        />
      );

      await user.keyboard('{Escape}');

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not close on Escape key when loading', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Dialog
          open={true}
          onOpenChange={handleOpenChange}
          title="Test Dialog"
          loading={true}
        />
      );

      await user.keyboard('{Escape}');

      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    it('should prevent body scroll when open', () => {
      const { rerender } = render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Test Dialog"
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Dialog
          open={false}
          onOpenChange={vi.fn()}
          title="Test Dialog"
        />
      );

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Confirm/Cancel Actions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const handleConfirm = vi.fn();

      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Confirm Action"
          onConfirm={handleConfirm}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /ยืนยัน/ });
      await user.click(confirmButton);

      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel and onOpenChange when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();
      const handleOpenChange = vi.fn();

      render(
        <Dialog
          open={true}
          onOpenChange={handleOpenChange}
          title="Test Dialog"
          onCancel={handleCancel}
          onConfirm={vi.fn()}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });
      await user.click(cancelButton);

      expect(handleCancel).toHaveBeenCalledTimes(1);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not render confirm button when onConfirm is not provided', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Alert Dialog"
        />
      );

      expect(screen.getByRole('button', { name: /ยกเลิก/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /ยืนยัน/ })).not.toBeInTheDocument();
    });

    it('should disable buttons when loading', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Loading Dialog"
          onConfirm={vi.fn()}
          loading={true}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /กำลังดำเนินการ/ });
      const cancelButton = screen.getByRole('button', { name: /ยกเลิก/ });

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it('should show loading text on confirm button when loading', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Loading Dialog"
          onConfirm={vi.fn()}
          loading={true}
        />
      );

      expect(screen.getByText('กำลังดำเนินการ...')).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('should render title', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Dialog Title"
        />
      );

      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Dialog Title"
          description="This is a description"
        />
      );

      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should not render description element when not provided', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Dialog Title"
        />
      );

      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });

    it('should render custom children', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Dialog Title"
        >
          <div>Custom content here</div>
        </Dialog>
      );

      expect(screen.getByText('Custom content here')).toBeInTheDocument();
    });

    it('should render backdrop', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Dialog Title"
        />
      );

      const backdrop = document.querySelector('.bg-black\\/50');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant with primary button', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Default Dialog"
          variant="default"
          onConfirm={vi.fn()}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /ยืนยัน/ });
      expect(confirmButton).toHaveClass('bg-blue-600');
    });

    it('should render danger variant with danger button', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Delete Dialog"
          variant="danger"
          onConfirm={vi.fn()}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /ยืนยัน/ });
      expect(confirmButton).toHaveClass('bg-red-600');
    });
  });

  describe('Custom Labels', () => {
    it('should use custom confirm label', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Custom Labels"
          confirmLabel="Submit"
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('should use custom cancel label', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Custom Labels"
          cancelLabel="Close"
        />
      );

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('should use default Thai labels', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Default Labels"
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByRole('button', { name: /ยืนยัน/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ยกเลิก/ })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have dialog role', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Accessible Dialog"
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should set aria-modal to true', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Modal Dialog"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should link title via aria-labelledby', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Labeled Dialog"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');

      const title = screen.getByText('Labeled Dialog');
      expect(title).toHaveAttribute('id', 'dialog-title');
    });

    it('should link description via aria-describedby when present', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Described Dialog"
          description="This is the description"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'dialog-description');

      const description = screen.getByText('This is the description');
      expect(description).toHaveAttribute('id', 'dialog-description');
    });

    it('should not set aria-describedby when description is not provided', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="No Description"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-describedby');
    });

    it('should set backdrop as aria-hidden', () => {
      render(
        <Dialog
          open={true}
          onOpenChange={vi.fn()}
          title="Dialog"
        />
      );

      const backdrop = document.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(
        <Dialog
          ref={ref}
          open={true}
          onOpenChange={vi.fn()}
          title="Ref Dialog"
        />
      );

      expect(ref).toHaveBeenCalled();
    });
  });
});
