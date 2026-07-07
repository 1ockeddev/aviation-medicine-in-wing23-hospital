/**
 * Unit tests for CategoryAccordionItem component
 * 
 * Tests cover:
 * - Rendering with expanded/collapsed states
 * - Click isolation (medication clicks don't toggle accordion)
 * - Keyboard navigation (Enter/Space)
 * - Medication filtering by category
 * - Design system color application
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryAccordionItem } from './CategoryAccordionItem';
import type { Medication } from '@prisma/client';
import type { CategoryWithMedicationCount } from '@/lib/user-accordion-helpers';

describe('CategoryAccordionItem', () => {
  const mockCategory: CategoryWithMedicationCount = {
    id: '1',
    name: 'Antibiotics',
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      medications: 2,
    },
  };

  const mockMedications: Medication[] = [
    {
      id: '1',
      name: 'Penicillin',
      tradeName: 'Pen-VK',
      status: 'Y',
      halfLife: '30 minutes',
      categoryId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Amoxicillin',
      tradeName: 'Amoxil',
      status: 'Y',
      halfLife: '1 hour',
      categoryId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Ibuprofen',
      tradeName: 'Advil',
      status: 'Y',
      halfLife: '2 hours',
      categoryId: '2', // Different category
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const defaultProps = {
    category: mockCategory,
    medications: mockMedications,
    isExpanded: false,
    onToggle: vi.fn(),
    searchQuery: '',
  };

  it('renders category header with correct name and count', () => {
    render(<CategoryAccordionItem {...defaultProps} />);
    
    expect(screen.getByText('Antibiotics')).toBeInTheDocument();
    expect(screen.getByText('(2 รายการ)')).toBeInTheDocument();
  });

  it('does not render medication list when collapsed', () => {
    render(<CategoryAccordionItem {...defaultProps} />);
    
    // Medications should not be visible
    expect(screen.queryByText('Penicillin')).not.toBeInTheDocument();
    expect(screen.queryByText('Amoxicillin')).not.toBeInTheDocument();
  });

  it('renders medication list when expanded', () => {
    render(<CategoryAccordionItem {...defaultProps} isExpanded={true} />);
    
    // Medications from this category should be visible
    expect(screen.getByText('Penicillin')).toBeInTheDocument();
    expect(screen.getByText('Amoxicillin')).toBeInTheDocument();
    
    // Medication from different category should not be visible
    expect(screen.queryByText('Ibuprofen')).not.toBeInTheDocument();
  });

  it('filters medications to only those belonging to the category', () => {
    render(<CategoryAccordionItem {...defaultProps} isExpanded={true} />);
    
    // Should only show medications with categoryId='1'
    const medicationItems = screen.queryAllByRole('listitem');
    expect(medicationItems).toHaveLength(2);
  });

  it('calls onToggle when clicking category header', () => {
    const onToggle = vi.fn();
    render(<CategoryAccordionItem {...defaultProps} onToggle={onToggle} />);
    
    const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (2 รายการ)' });
    fireEvent.click(header);
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does NOT toggle when clicking medication item (click isolation)', () => {
    const onToggle = vi.fn();
    render(
      <CategoryAccordionItem
        {...defaultProps}
        isExpanded={true}
        onToggle={onToggle}
      />
    );
    
    // Click on a medication item
    const medicationItem = screen.getByText('Penicillin');
    fireEvent.click(medicationItem);
    
    // onToggle should NOT be called
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('toggles on Enter key press', () => {
    const onToggle = vi.fn();
    render(<CategoryAccordionItem {...defaultProps} onToggle={onToggle} />);
    
    const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (2 รายการ)' });
    fireEvent.keyDown(header, { key: 'Enter' });
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('toggles on Space key press', () => {
    const onToggle = vi.fn();
    render(<CategoryAccordionItem {...defaultProps} onToggle={onToggle} />);
    
    const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (2 รายการ)' });
    fireEvent.keyDown(header, { key: ' ' });
    
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not toggle on other key presses', () => {
    const onToggle = vi.fn();
    render(<CategoryAccordionItem {...defaultProps} onToggle={onToggle} />);
    
    const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (2 รายการ)' });
    fireEvent.keyDown(header, { key: 'Tab' });
    
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('applies Ice Blue background color', () => {
    const { container } = render(<CategoryAccordionItem {...defaultProps} />);
    
    const accordionItem = container.firstChild as HTMLElement;
    expect(accordionItem).toHaveStyle({ backgroundColor: '#ddebf4' });
  });

  it('passes search query to MedicationList', () => {
    render(
      <CategoryAccordionItem
        {...defaultProps}
        isExpanded={true}
        searchQuery="Penicillin"
      />
    );
    
    // The medication name should be rendered (highlighting is handled by MedicationList)
    expect(screen.getByText('Penicillin')).toBeInTheDocument();
  });

  it('displays correct ARIA attributes for accessibility', () => {
    render(<CategoryAccordionItem {...defaultProps} isExpanded={false} />);
    
    const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (2 รายการ)' });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    expect(header).toHaveAttribute('aria-controls', 'category-content-1');
  });

  it('updates aria-expanded when expanded state changes', () => {
    const { rerender } = render(
      <CategoryAccordionItem {...defaultProps} isExpanded={false} />
    );
    
    const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (2 รายการ)' });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    
    rerender(<CategoryAccordionItem {...defaultProps} isExpanded={true} />);
    
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders empty state when category has no medications', () => {
    const emptyCategory: CategoryWithMedicationCount = {
      ...mockCategory,
      _count: { medications: 0 },
    };
    
    render(
      <CategoryAccordionItem
        {...defaultProps}
        category={emptyCategory}
        medications={[]}
        isExpanded={true}
      />
    );
    
    expect(screen.getByText('ไม่มียาในหมวดหมู่นี้')).toBeInTheDocument();
  });

  it('has data-medication-item attribute on medication items for click detection', () => {
    render(<CategoryAccordionItem {...defaultProps} isExpanded={true} />);
    
    const medicationItems = screen.getAllByRole('listitem');
    
    medicationItems.forEach((item) => {
      expect(item).toHaveAttribute('data-medication-item', 'true');
    });
  });
});
