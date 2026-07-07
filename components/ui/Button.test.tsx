import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  describe('Click Handlers', () => {
    it('should call onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: 'Click me' });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      const button = screen.getByRole('button', { name: 'Click me' });
      await user.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Variants', () => {
    it('should render primary variant with correct styles', () => {
      render(<Button variant="primary">Primary</Button>);

      const button = screen.getByRole('button', { name: 'Primary' });
      expect(button).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should render default variant as primary', () => {
      render(<Button variant="default">Default</Button>);

      const button = screen.getByRole('button', { name: 'Default' });
      expect(button).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should render secondary variant with correct styles', () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole('button', { name: 'Secondary' });
      expect(button).toHaveClass('bg-gray-100', 'text-gray-900');
    });

    it('should render danger variant with correct styles', () => {
      render(<Button variant="danger">Danger</Button>);

      const button = screen.getByRole('button', { name: 'Danger' });
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });

    it('should render destructive variant as danger', () => {
      render(<Button variant="destructive">Destructive</Button>);

      const button = screen.getByRole('button', { name: 'Destructive' });
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });

    it('should render outline variant with correct styles', () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole('button', { name: 'Outline' });
      expect(button).toHaveClass('border', 'border-gray-300', 'bg-white');
    });

    it('should render ghost variant with correct styles', () => {
      render(<Button variant="ghost">Ghost</Button>);

      const button = screen.getByRole('button', { name: 'Ghost' });
      expect(button).toHaveClass('hover:bg-gray-100');
    });

    it('should render link variant with correct styles', () => {
      render(<Button variant="link">Link</Button>);

      const button = screen.getByRole('button', { name: 'Link' });
      expect(button).toHaveClass('text-blue-600', 'underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('should render small size with correct styles', () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole('button', { name: 'Small' });
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-xs');
    });

    it('should render medium size with correct styles (default)', () => {
      render(<Button size="md">Medium</Button>);

      const button = screen.getByRole('button', { name: 'Medium' });
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });

    it('should render large size with correct styles', () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole('button', { name: 'Large' });
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
    });

    it('should default to medium size when not specified', () => {
      render(<Button>Default Size</Button>);

      const button = screen.getByRole('button', { name: 'Default Size' });
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button with correct attributes', () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none');
    });

    it('should apply disabled styles across variants', () => {
      const { rerender } = render(
        <Button variant="primary" disabled>
          Primary Disabled
        </Button>
      );

      let button = screen.getByRole('button');
      expect(button).toBeDisabled();

      rerender(
        <Button variant="danger" disabled>
          Danger Disabled
        </Button>
      );

      button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Custom Props', () => {
    it('should accept and apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole('button', { name: 'Custom' });
      expect(button).toHaveClass('custom-class');
    });

    it('should support type attribute', () => {
      render(<Button type="submit">Submit</Button>);

      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should render children correctly', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      );

      expect(screen.getByText('Icon')).toBeInTheDocument();
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);

      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button role', () => {
      render(<Button>Accessible</Button>);

      const button = screen.getByRole('button', { name: 'Accessible' });
      expect(button).toBeInTheDocument();
    });

    it('should support focus-visible styles', () => {
      render(<Button>Focus Test</Button>);

      const button = screen.getByRole('button', { name: 'Focus Test' });
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Keyboard</Button>);

      const button = screen.getByRole('button', { name: 'Keyboard' });
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalled();
    });
  });
});
