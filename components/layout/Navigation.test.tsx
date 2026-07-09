import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Navigation } from './Navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('Navigation', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue('/admin/medications');
  });

  it('should render all navigation items including LINE Users', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />);

    // Check for all menu items
    expect(screen.getByText('ยา')).toBeInTheDocument();
    expect(screen.getByText('หมวดหมู่')).toBeInTheDocument();
    expect(screen.getByText('LINE Users')).toBeInTheDocument();
  });

  it('should render correct links for all navigation items', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />);

    const medicationsLink = screen.getByRole('link', { name: /ยา/i });
    const categoriesLink = screen.getByRole('link', { name: /หมวดหมู่/i });
    const lineUsersLink = screen.getByRole('link', { name: /LINE Users/i });

    expect(medicationsLink).toHaveAttribute('href', '/admin/medications');
    expect(categoriesLink).toHaveAttribute('href', '/admin/categories');
    expect(lineUsersLink).toHaveAttribute('href', '/admin/line-users');
  });

  it('should highlight LINE Users link when on that page', () => {
    vi.mocked(usePathname).mockReturnValue('/admin/line-users');

    render(<Navigation isOpen={true} onClose={mockOnClose} />);

    const lineUsersLink = screen.getByRole('link', { name: /LINE Users/i });
    expect(lineUsersLink).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('should render LINE Users icon', () => {
    render(<Navigation isOpen={true} onClose={mockOnClose} />);

    // LINE Users link should contain the 👥 icon
    const lineUsersLink = screen.getByRole('link', { name: /LINE Users/i });
    expect(lineUsersLink.textContent).toContain('👥');
  });
});
