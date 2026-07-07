import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

describe('Select', () => {
  const mockOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  describe('Option Selection', () => {
    it('should render all options', () => {
      render(<Select options={mockOptions} />);

      const select = screen.getByRole('combobox');
      const options = Array.from(select.querySelectorAll('option'));

      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('Option 1');
      expect(options[1]).toHaveTextContent('Option 2');
      expect(options[2]).toHaveTextContent('Option 3');
    });

    it('should render placeholder option when provided', () => {
      render(<Select options={mockOptions} placeholder="Select an option" />);

      const placeholderOption = screen.getByText('Select an option');
      expect(placeholderOption).toBeInTheDocument();
      expect(placeholderOption).toHaveAttribute('value', '');
      expect(placeholderOption).toHaveAttribute('disabled');
    });

    it('should call onChange when selection changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Select options={mockOptions} onChange={handleChange} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '2');

      expect(handleChange).toHaveBeenCalled();
      expect(select).toHaveValue('2');
    });

    it('should update selected value correctly', async () => {
      const user = userEvent.setup();

      render(<Select options={mockOptions} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '3');

      expect(select).toHaveValue('3');
    });

    it('should handle controlled select', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState('1');
        return (
          <Select
            options={mockOptions}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      render(<TestComponent />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('1');

      await user.selectOptions(select, '2');
      expect(select).toHaveValue('2');
    });
  });

  describe('Value Changes', () => {
    it('should support default value', () => {
      render(<Select options={mockOptions} defaultValue="2" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('2');
    });

    it('should handle empty options array', () => {
      render(<Select options={[]} placeholder="No options" />);

      const select = screen.getByRole('combobox');
      const options = Array.from(select.querySelectorAll('option'));

      // Only placeholder option should be present
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('No options');
    });

    it('should render options with matching value attributes', () => {
      render(<Select options={mockOptions} />);

      const option1 = screen.getByRole('option', { name: 'Option 1' });
      const option2 = screen.getByRole('option', { name: 'Option 2' });

      expect(option1).toHaveValue('1');
      expect(option2).toHaveValue('2');
    });
  });

  describe('Error State Display', () => {
    it('should display error message when error prop is provided', () => {
      render(
        <Select
          id="test-select"
          options={mockOptions}
          error="This field is required"
        />
      );

      const errorMessage = screen.getByText('This field is required');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-600');
    });

    it('should apply error styling to select', () => {
      render(<Select options={mockOptions} error="Error" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-red-500', 'focus-visible:ring-red-600');
    });

    it('should not display error message when error prop is undefined', () => {
      render(<Select options={mockOptions} />);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should apply normal styling when no error', () => {
      render(<Select options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-gray-300', 'focus-visible:ring-blue-600');
      expect(select).not.toHaveClass('border-red-500');
    });

    it('should link error message to select via aria-describedby', () => {
      render(<Select id="category" options={mockOptions} error="Invalid selection" />);

      const select = screen.getByRole('combobox');
      const errorId = select.getAttribute('aria-describedby');

      expect(errorId).toBe('category-error');
      expect(screen.getByText('Invalid selection')).toHaveAttribute('id', 'category-error');
    });
  });

  describe('Label', () => {
    it('should display label when provided', () => {
      render(<Select label="Category" options={mockOptions} />);

      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    it('should show required indicator when required', () => {
      render(<Select label="Type" options={mockOptions} required />);

      const label = screen.getByText('Type');
      expect(label).toBeInTheDocument();

      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-600');
    });

    it('should not show required indicator when not required', () => {
      render(<Select label="Optional" options={mockOptions} />);

      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('should work without label', () => {
      render(<Select options={mockOptions} />);

      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should set aria-invalid to true when error exists', () => {
      render(<Select options={mockOptions} error="Error message" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-invalid to false when no error', () => {
      render(<Select options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'false');
    });

    it('should have alert role on error message', () => {
      render(<Select id="test" options={mockOptions} error="Error" />);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Error');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(<Select options={mockOptions} />);

      const select = screen.getByRole('combobox');
      select.focus();
      expect(select).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      // Select should remain focused and navigable
      expect(select).toHaveFocus();
    });

    it('should support disabled state', () => {
      render(<Select disabled options={mockOptions} />);

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
      expect(select).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Select options={mockOptions} className="custom-class" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('custom-class');
    });

    it('should forward ref correctly', () => {
      const ref = vi.fn();
      render(<Select ref={ref} options={mockOptions} />);

      expect(ref).toHaveBeenCalled();
    });

    it('should support required attribute', () => {
      render(<Select options={mockOptions} required />);

      const select = screen.getByRole('combobox');
      expect(select).toBeRequired();
    });

    it('should support name attribute for forms', () => {
      render(<Select options={mockOptions} name="category" />);

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('name', 'category');
    });
  });

  describe('Combined States', () => {
    it('should render with label, error, and required indicator', () => {
      render(
        <Select
          id="status"
          label="Status"
          options={mockOptions}
          error="Status is required"
          required
        />
      );

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByText('Status is required')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should handle disabled state with error', () => {
      render(<Select disabled options={mockOptions} error="Error message" />);

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should work with placeholder, label, and default value', () => {
      render(
        <Select
          label="Choose"
          options={mockOptions}
          placeholder="Please select"
          defaultValue="2"
        />
      );

      expect(screen.getByText('Choose')).toBeInTheDocument();
      expect(screen.getByText('Please select')).toBeInTheDocument();

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('2');
    });
  });
});
