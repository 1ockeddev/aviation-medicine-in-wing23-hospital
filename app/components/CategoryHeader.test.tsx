import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryHeader } from './CategoryHeader';

describe('CategoryHeader', () => {
  const mockCategory = {
    id: 'test-category-1',
    name: 'Antibiotics',
  };

  const defaultProps = {
    category: mockCategory,
    isExpanded: false,
    onToggle: vi.fn(),
    onKeyDown: vi.fn(),
    medicationCount: 15,
  };

  it('renders category name and medication count in Thai format', () => {
    render(<CategoryHeader {...defaultProps} />);

    expect(screen.getByText('Antibiotics')).toBeInTheDocument();
    expect(screen.getByText('(15 รายการ)')).toBeInTheDocument();
  });

  it('displays medication count of zero correctly', () => {
    render(<CategoryHeader {...defaultProps} medicationCount={0} />);

    expect(screen.getByText('(0 รายการ)')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(<CategoryHeader {...defaultProps} onToggle={onToggle} />);

    const header = screen.getByRole('button', { name: /หมวดหมู่ Antibiotics \(15 รายการ\)/ });
    await user.click(header);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onKeyDown when keyboard event occurs', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();

    render(<CategoryHeader {...defaultProps} onKeyDown={onKeyDown} />);

    const header = screen.getByRole('button', { name: /หมวดหมู่ Antibiotics \(15 รายการ\)/ });
    header.focus();
    await user.keyboard('{Enter}');

    expect(onKeyDown).toHaveBeenCalled();
  });

  it('has correct ARIA attributes when collapsed', () => {
    render(<CategoryHeader {...defaultProps} isExpanded={false} />);

    const header = screen.getByRole('button', { name: /หมวดหมู่ Antibiotics \(15 รายการ\)/ });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(header).toHaveAttribute('aria-controls', 'category-content-test-category-1');
  });

  it('has correct ARIA attributes when expanded', () => {
    render(<CategoryHeader {...defaultProps} isExpanded={true} />);

    const header = screen.getByRole('button', { name: /หมวดหมู่ Antibiotics \(15 รายการ\)/ });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(header).toHaveAttribute('aria-controls', 'category-content-test-category-1');
  });

  it('renders AccordionToggle with correct aria-label when collapsed', () => {
    render(<CategoryHeader {...defaultProps} isExpanded={false} />);

    const toggleButton = screen.getByLabelText('ขยายหมวดหมู่ Antibiotics');
    expect(toggleButton).toBeInTheDocument();
  });

  it('renders AccordionToggle with correct aria-label when expanded', () => {
    render(<CategoryHeader {...defaultProps} isExpanded={true} />);

    const toggleButton = screen.getByLabelText('ยุบหมวดหมู่ Antibiotics');
    expect(toggleButton).toBeInTheDocument();
  });

  it('does not render toggle button when medicationCount is 0', () => {
    render(<CategoryHeader {...defaultProps} medicationCount={0} />);

    // AccordionToggle returns null when hasChildren is false
    const toggleButton = screen.queryByLabelText(/ขยาย|ยุบ/);
    expect(toggleButton).not.toBeInTheDocument();
  });

  it('is keyboard accessible with tabIndex', () => {
    render(<CategoryHeader {...defaultProps} />);

    const header = screen.getByRole('button', { name: /หมวดหมู่ Antibiotics \(15 รายการ\)/ });
    expect(header).toHaveAttribute('tabIndex', '0');
  });

  it('renders with large medication count', () => {
    render(<CategoryHeader {...defaultProps} medicationCount={999} />);

    expect(screen.getByText('(999 รายการ)')).toBeInTheDocument();
  });
});
