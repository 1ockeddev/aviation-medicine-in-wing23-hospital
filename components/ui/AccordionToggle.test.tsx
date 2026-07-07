import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccordionToggle } from './AccordionToggle';

describe('AccordionToggle', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Rendering', () => {
    it('should render plus icon when collapsed', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand category"
        />
      );

      const button = screen.getByRole('button', { name: /expand category/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'false');
      
      // Check for plus icon (has both vertical and horizontal lines)
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const lines = svg?.querySelectorAll('line');
      expect(lines?.length).toBe(2); // Plus icon has 2 lines
    });

    it('should render minus icon when expanded', () => {
      render(
        <AccordionToggle
          isExpanded={true}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Collapse category"
        />
      );

      const button = screen.getByRole('button', { name: /collapse category/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-expanded', 'true');
      
      // Check for minus icon (has only one horizontal line)
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      const lines = svg?.querySelectorAll('line');
      expect(lines?.length).toBe(1); // Minus icon has 1 line
    });

    it('should return null when hasChildren is false', () => {
      const { container } = render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={false}
          onClick={mockOnClick}
          aria-label="No children"
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should apply custom className', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
          className="custom-class"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('ARIA Attributes', () => {
    it('should have correct aria-label', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand medicines category"
        />
      );

      const button = screen.getByRole('button', { name: /expand medicines category/i });
      expect(button).toHaveAttribute('aria-label', 'Expand medicines category');
    });

    it('should have aria-expanded=true when expanded', () => {
      render(
        <AccordionToggle
          isExpanded={true}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Collapse"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have aria-expanded=false when collapsed', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Touch Target Size', () => {
    it('should have minimum 44x44px touch target', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      // Check for Tailwind classes that enforce 44x44px minimum
      expect(button).toHaveClass('min-w-[44px]');
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  describe('Click Handling', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should pass event to onClick handler', async () => {
      const user = userEvent.setup();
      
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object));
      expect(mockOnClick.mock.calls[0][0]).toHaveProperty('type', 'click');
    });

    it('should not be called when hasChildren is false', async () => {
      const user = userEvent.setup();
      
      const { container } = render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={false}
          onClick={mockOnClick}
          aria-label="No children"
        />
      );

      // Component returns null, so there's nothing to click
      expect(container.firstChild).toBeNull();
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup();
      
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup();
      
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should be focusable', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('Visual Styling', () => {
    it('should have transition classes for smooth interactions', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-colors');
    });

    it('should have hover state classes', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:bg-gray-200');
    });

    it('should have rounded corners', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded');
    });

    it('should have focus ring for keyboard navigation', () => {
      render(
        <AccordionToggle
          isExpanded={false}
          hasChildren={true}
          onClick={mockOnClick}
          aria-label="Expand"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
      expect(button).toHaveClass('focus:ring-blue-500');
    });
  });
});
