import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  describe('Value Changes', () => {
    it('should call onChange handler when value changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input onChange={handleChange} placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });

    it('should update value correctly', async () => {
      const user = userEvent.setup();

      render(<Input placeholder="Type here" />);

      const input = screen.getByPlaceholderText('Type here');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('should clear value when cleared', async () => {
      const user = userEvent.setup();

      render(<Input defaultValue="initial" placeholder="Clear me" />);

      const input = screen.getByPlaceholderText('Clear me');
      expect(input).toHaveValue('initial');

      await user.clear(input);
      expect(input).toHaveValue('');
    });

    it('should handle controlled input', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Controlled"
          />
        );
      };

      render(<TestComponent />);

      const input = screen.getByPlaceholderText('Controlled');
      await user.type(input, 'controlled value');

      expect(input).toHaveValue('controlled value');
    });
  });

  describe('Error State Display', () => {
    it('should display error message when error prop is provided', () => {
      render(<Input id="test-input" error="This field is required" />);

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-600');
    });

    it('should apply error styling to input', () => {
      render(<Input error="Error" placeholder="Error input" />);

      const input = screen.getByPlaceholderText('Error input');
      expect(input).toHaveClass('border-red-500', 'focus-visible:ring-red-600');
    });

    it('should not display error message when error prop is undefined', () => {
      render(<Input placeholder="No error" />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should apply normal styling when no error', () => {
      render(<Input placeholder="Normal input" />);

      const input = screen.getByPlaceholderText('Normal input');
      expect(input).toHaveClass('border-gray-300', 'focus-visible:ring-blue-600');
      expect(input).not.toHaveClass('border-red-500');
    });

    it('should link error message to input via aria-describedby', () => {
      render(<Input id="email" error="Invalid email" />);

      const input = screen.getByRole('textbox');
      const errorId = input.getAttribute('aria-describedby');

      expect(errorId).toBe('email-error');
      expect(screen.getByText('Invalid email')).toHaveAttribute('id', 'email-error');
    });
  });

  describe('Label', () => {
    it('should display label when provided', () => {
      render(<Input label="Email Address" />);

      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });

    it('should show required indicator when required', () => {
      render(<Input label="Password" required />);

      const label = screen.getByText('Password');
      expect(label).toBeInTheDocument();

      // Required asterisk should be present
      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-600');
    });

    it('should not show required indicator when not required', () => {
      render(<Input label="Optional Field" />);

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should work without label', () => {
      render(<Input placeholder="No label" />);

      expect(screen.getByPlaceholderText('No label')).toBeInTheDocument();
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should set aria-invalid to true when error exists', () => {
      render(<Input error="Error message" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-invalid to false when no error', () => {
      render(<Input />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have alert role on error message', () => {
      render(<Input id="test" error="Error" />);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Error');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(<Input placeholder="Type here" />);

      const input = screen.getByPlaceholderText('Type here');
      input.focus();

      await user.keyboard('Hello');
      expect(input).toHaveValue('Hello');
    });

    it('should support disabled state', () => {
      render(<Input disabled placeholder="Disabled" />);

      const input = screen.getByPlaceholderText('Disabled');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Input Types', () => {
    it('should support text type (default)', () => {
      const { container } = render(<Input />);

      const input = container.querySelector('input');
      // When no type is specified, browsers default to 'text' but don't set the attribute
      expect(input).toBeInTheDocument();
      expect(input?.type).toBe('text'); // Check the property, not the attribute
    });

    it('should support email type', () => {
      render(<Input type="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should support password type', () => {
      render(<Input type="password" placeholder="Password" />);

      const input = screen.getByPlaceholderText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should support number type', () => {
      render(<Input type="number" placeholder="Number" />);

      const input = screen.getByPlaceholderText('Number');
      expect(input).toHaveAttribute('type', 'number');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Input className="custom-class" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should support placeholder', () => {
      render(<Input placeholder="Enter your name" />);

      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);

      expect(ref).toHaveBeenCalled();
    });

    it('should support maxLength attribute', () => {
      render(<Input maxLength={10} placeholder="Max 10 chars" />);

      const input = screen.getByPlaceholderText('Max 10 chars');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should support required attribute', () => {
      render(<Input required />);

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('Combined States', () => {
    it('should render with label, error, and required indicator', () => {
      render(
        <Input
          id="username"
          label="Username"
          error="Username is required"
          required
        />
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Username is required')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should handle disabled state with error', () => {
      render(<Input disabled error="Error message" />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });
});
