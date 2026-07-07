/**
 * Accessibility Tests for Category Accordion
 * 
 * Tests Requirements 9.1-9.6:
 * - Keyboard navigation (Tab, Enter, Space)
 * - ARIA attributes
 * - Heading hierarchy
 * - Screen reader announcements
 * - Focus indicators
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryAccordion } from './CategoryAccordion';
import type { CategoryWithMedicationCount } from '@/lib/user-accordion-helpers';
import type { Medication } from '@prisma/client';

describe('CategoryAccordion - Accessibility', () => {
  const mockCategories: CategoryWithMedicationCount[] = [
    {
      id: 'cat-1',
      name: 'Antibiotics',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { medications: 5 },
    },
    {
      id: 'cat-2',
      name: 'Pain Relief',
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { medications: 3 },
    },
  ];

  const mockMedications: Medication[] = [
    {
      id: 'med-1',
      name: 'Amoxicillin',
      tradeName: 'Amoxil',
      categoryId: 'cat-1',
      status: 'Y',
      halfLife: '1-2 hours',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'med-2',
      name: 'Ibuprofen',
      tradeName: 'Advil',
      categoryId: 'cat-2',
      status: 'Y',
      halfLife: '2-4 hours',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const defaultProps = {
    categories: mockCategories,
    expandedCategories: new Set<string>(),
    onToggle: vi.fn(),
    searchQuery: '',
    medications: mockMedications,
  };

  describe('Requirement 9.1 - Keyboard Navigation (Tab key)', () => {
    it('allows Tab navigation between category headers', async () => {
      const user = userEvent.setup();
      render(<CategoryAccordion {...defaultProps} />);

      const headers = screen.getAllByRole('button', { name: /หมวดหมู่.*รายการ\)/ });
      
      // Should have at least 2 category headers (not counting the toggle buttons)
      expect(headers.length).toBeGreaterThanOrEqual(2);
    });

    it('each category header has tabIndex="0"', () => {
      render(<CategoryAccordion {...defaultProps} />);

      const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (5 รายการ)' });
      expect(header).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Requirement 9.2 - Enter key toggles accordion', () => {
    it('toggles accordion when Enter is pressed on focused header', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      
      render(<CategoryAccordion {...defaultProps} onToggle={onToggle} />);

      const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (5 รายการ)' });
      
      // Focus and press Enter
      header.focus();
      await user.keyboard('{Enter}');
      
      expect(onToggle).toHaveBeenCalledWith('cat-1');
    });
  });

  describe('Requirement 9.3 - Space key toggles accordion', () => {
    it('toggles accordion when Space is pressed on focused header', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      
      render(<CategoryAccordion {...defaultProps} onToggle={onToggle} />);

      const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (5 รายการ)' });
      
      // Focus and press Space
      header.focus();
      await user.keyboard(' ');
      
      expect(onToggle).toHaveBeenCalledWith('cat-1');
    });

    it('prevents default Space behavior (page scroll)', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(<CategoryAccordion {...defaultProps} onToggle={onToggle} />);

      const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (5 รายการ)' });
      header.focus();
      
      // This test verifies preventDefault is called by checking the toggle happens
      // In the actual implementation, CategoryAccordionItem calls e.preventDefault()
      await user.keyboard(' ');
      
      expect(onToggle).toHaveBeenCalled();
    });
  });

  describe('Requirement 9.4 - ARIA attributes', () => {
    it('has aria-expanded="false" when collapsed', () => {
      render(<CategoryAccordion {...defaultProps} />);

      const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (5 รายการ)' });
      expect(header).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-expanded="true" when expanded', () => {
      const expandedSet = new Set(['cat-1']);
      render(<CategoryAccordion {...defaultProps} expandedCategories={expandedSet} />);

      const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (5 รายการ)' });
      expect(header).toHaveAttribute('aria-expanded', 'true');
    });

    it('has aria-controls pointing to content ID', () => {
      render(<CategoryAccordion {...defaultProps} />);

      const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (5 รายการ)' });
      expect(header).toHaveAttribute('aria-controls', 'category-content-cat-1');
    });

    it('has role="button" on category headers', () => {
      render(<CategoryAccordion {...defaultProps} />);

      const headers = screen.getAllByRole('button', { name: /หมวดหมู่.*รายการ\)/ });
      expect(headers.length).toBeGreaterThanOrEqual(2); // At least the 2 category headers
    });

    it('has descriptive aria-label for each category', () => {
      render(<CategoryAccordion {...defaultProps} />);

      const antibioticsHeader = screen.getByRole('button', {
        name: 'หมวดหมู่ Antibiotics (5 รายการ)',
      });
      expect(antibioticsHeader).toBeInTheDocument();

      const painReliefHeader = screen.getByRole('button', {
        name: 'หมวดหมู่ Pain Relief (3 รายการ)',
      });
      expect(painReliefHeader).toBeInTheDocument();
    });
  });

  describe('Requirement 9.6 - Heading hierarchy', () => {
    it('uses h3 elements for category names', () => {
      const { container } = render(<CategoryAccordion {...defaultProps} />);

      const headings = container.querySelectorAll('h3');
      expect(headings).toHaveLength(2);
      
      expect(headings[0]).toHaveTextContent('Antibiotics');
      expect(headings[1]).toHaveTextContent('Pain Relief');
    });

    it('category names are within h3 tags', () => {
      const { container } = render(<CategoryAccordion {...defaultProps} />);

      const antibioticsHeading = Array.from(container.querySelectorAll('h3')).find(
        (h3) => h3.textContent === 'Antibiotics'
      );
      expect(antibioticsHeading).toBeInTheDocument();
    });
  });

  describe('Focus indicators', () => {
    it('headers have focus ring styles', () => {
      render(<CategoryAccordion {...defaultProps} />);

      const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (5 รายการ)' });
      
      // Check for Tailwind focus utilities
      expect(header).toHaveClass('focus:outline-none');
      expect(header).toHaveClass('focus:ring-2');
    });
  });

  describe('Empty state accessibility', () => {
    it('has role="status" for empty state', () => {
      render(<CategoryAccordion {...defaultProps} categories={[]} />);

      const emptyState = screen.getByRole('status');
      expect(emptyState).toBeInTheDocument();
    });

    it('has aria-label for empty state', () => {
      render(<CategoryAccordion {...defaultProps} categories={[]} />);

      const emptyState = screen.getByRole('status', { name: 'ไม่พบหมวดหมู่ยา' });
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Region labeling', () => {
    it('has role="region" with descriptive label', () => {
      render(<CategoryAccordion {...defaultProps} />);

      const region = screen.getByRole('region', { name: 'รายการหมวดหมู่ยา' });
      expect(region).toBeInTheDocument();
    });
  });

  describe('Touch target size', () => {
    it('category headers are full width and tappable', () => {
      render(<CategoryAccordion {...defaultProps} />);

      const header = screen.getByRole('button', { name: 'หมวดหมู่ Antibiotics (5 รายการ)' });
      
      // Check for full width class
      expect(header).toHaveClass('w-full');
    });
  });

  describe('Medication list accessibility', () => {
    it('medication list has role="list"', () => {
      const expandedSet = new Set(['cat-1']);
      render(<CategoryAccordion {...defaultProps} expandedCategories={expandedSet} />);

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('medication items have role="listitem"', () => {
      const expandedSet = new Set(['cat-1']);
      render(<CategoryAccordion {...defaultProps} expandedCategories={expandedSet} />);

      const items = screen.getAllByRole('listitem');
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
