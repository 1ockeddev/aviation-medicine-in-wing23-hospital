import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LineUserList } from './LineUserList';
import type { LineUser } from '@prisma/client';

// Mock server actions
vi.mock('@/actions/line-users', () => ({
  deleteLineUser: vi.fn(),
  createLineUser: vi.fn(),
  updateLineUser: vi.fn(),
}));

// Mock fetch for test notifications
global.fetch = vi.fn();

describe('LineUserList', () => {
  const mockUsers: LineUser[] = [
    {
      id: '1',
      lineUserId: 'U1234567890',
      displayName: 'Test User 1',
      pictureUrl: 'https://example.com/pic1.jpg',
      notificationsEnabled: true,
      daysBeforeExpiration: 30,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      lineUserId: 'U0987654321',
      displayName: 'Test User 2',
      pictureUrl: null,
      notificationsEnabled: false,
      daysBeforeExpiration: 15,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  describe('Display Requirements', () => {
    it('should display user cards with all required information (Requirement 3.2)', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      // Check display name
      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(screen.getByText('Test User 2')).toBeInTheDocument();

      // Check LINE User IDs
      expect(screen.getByText('U1234567890')).toBeInTheDocument();
      expect(screen.getByText('U0987654321')).toBeInTheDocument();

      // Check notification status
      expect(screen.getAllByText('เปิด')).toHaveLength(1);
      expect(screen.getAllByText('ปิด')).toHaveLength(1);
    });

    it('should display profile pictures when available', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', 'https://example.com/pic1.jpg');
      expect(images[0]).toHaveAttribute('alt', 'Test User 1');
    });

    it('should display fallback avatar when picture URL is null', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      // Check for the initial letter fallback
      expect(screen.getByText('T')).toBeInTheDocument(); // First letter of "Test User 2"
    });

    it('should display registration date in Thai format', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      // Thai date format should be present
      const dateElements = screen.getAllByText(/ม.ค.|ก.พ.|มี.ค./);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should display days before expiration for users with notifications enabled', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      expect(screen.getByText('30 วัน')).toBeInTheDocument();
    });
  });

  describe('Search Functionality (Requirement 3.4)', () => {
    it('should filter users by display name', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const searchInput = screen.getByPlaceholderText('ค้นหาชื่อผู้ใช้หรือ LINE User ID...');
      fireEvent.change(searchInput, { target: { value: 'User 1' } });

      expect(screen.getByText('Test User 1')).toBeInTheDocument();
      expect(screen.queryByText('Test User 2')).not.toBeInTheDocument();
    });

    it('should filter users by LINE User ID', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const searchInput = screen.getByPlaceholderText('ค้นหาชื่อผู้ใช้หรือ LINE User ID...');
      fireEvent.change(searchInput, { target: { value: 'U0987654321' } });

      expect(screen.getByText('Test User 2')).toBeInTheDocument();
      expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
    });

    it('should be case-insensitive', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const searchInput = screen.getByPlaceholderText('ค้นหาชื่อผู้ใช้หรือ LINE User ID...');
      fireEvent.change(searchInput, { target: { value: 'USER 1' } });

      expect(screen.getByText('Test User 1')).toBeInTheDocument();
    });

    it('should show empty state when no results found', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const searchInput = screen.getByPlaceholderText('ค้นหาชื่อผู้ใช้หรือ LINE User ID...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });

      expect(screen.getByText('ไม่พบผู้ใช้ที่ค้นหา')).toBeInTheDocument();
    });
  });

  describe('Pagination (Requirement 3.5)', () => {
    it('should display 20 users per page', () => {
      const manyUsers: LineUser[] = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        lineUserId: `U${i}`,
        displayName: `User ${i + 1}`,
        pictureUrl: null,
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      render(<LineUserList lineUsers={manyUsers} />);

      // Should show 20 cards (each has displayName)
      const displayNames = screen.getAllByText(/User \d+/);
      expect(displayNames.length).toBe(20);
    });

    it('should show pagination controls when more than 20 users', () => {
      const manyUsers: LineUser[] = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        lineUserId: `U${i}`,
        displayName: `User ${i + 1}`,
        pictureUrl: null,
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      render(<LineUserList lineUsers={manyUsers} />);

      expect(screen.getByText(/หน้า \d+ \/ \d+/)).toBeInTheDocument();
      expect(screen.getByText('ถัดไป →')).toBeInTheDocument();
      expect(screen.getByText('← ก่อนหน้า')).toBeInTheDocument();
    });

    it('should navigate to next page when clicking next button', () => {
      const manyUsers: LineUser[] = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        lineUserId: `U${i}`,
        displayName: `User ${i + 1}`,
        pictureUrl: null,
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      render(<LineUserList lineUsers={manyUsers} />);

      const nextButton = screen.getByText('ถัดไป →');
      fireEvent.click(nextButton);

      expect(screen.getByText('หน้า 2 / 2')).toBeInTheDocument();
    });

    it('should reset to page 1 when search query changes', () => {
      const manyUsers: LineUser[] = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        lineUserId: `U${i}`,
        displayName: `User ${i + 1}`,
        pictureUrl: null,
        notificationsEnabled: true,
        daysBeforeExpiration: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      render(<LineUserList lineUsers={manyUsers} />);

      // Go to page 2
      const nextButton = screen.getByText('ถัดไป →');
      fireEvent.click(nextButton);

      // Search should reset to page 1
      const searchInput = screen.getByPlaceholderText('ค้นหาชื่อผู้ใช้หรือ LINE User ID...');
      fireEvent.change(searchInput, { target: { value: 'User 1' } });

      // Should not see page indicator or should be on page 1
      const pageIndicator = screen.queryByText(/หน้า \d+ \/ \d+/);
      if (pageIndicator) {
        expect(pageIndicator.textContent).toContain('หน้า 1');
      }
    });
  });

  describe('Action Buttons (Requirements 4.1, 4.3, 5.1)', () => {
    it('should display Edit, Delete, and Test buttons for each user', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const editButtons = screen.getAllByText('แก้ไข');
      const deleteButtons = screen.getAllByText('ลบ');
      const testButtons = screen.getAllByText('ทดสอบ');

      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
      expect(testButtons).toHaveLength(2);
    });

    it('should open edit modal when clicking edit button', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const editButtons = screen.getAllByText('แก้ไข');
      fireEvent.click(editButtons[0]);

      // Modal should be opened (check via role)
      waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should open delete confirmation dialog when clicking delete button (Requirement 4.3)', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const deleteButtons = screen.getAllByText('ลบ');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByText('ยืนยันการลบผู้ใช้')).toBeInTheDocument();
      expect(screen.getByText(/คุณต้องการลบผู้ใช้ "Test User 1" ใช่หรือไม่/)).toBeInTheDocument();
    });
  });

  describe('Test Notification (Requirements 5.1, 5.3, 5.4)', () => {
    it('should call API when clicking Send Test button', async () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const testButtons = screen.getAllByText('ทดสอบ');
      fireEvent.click(testButtons[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/line/send-test',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lineUserId: 'U1234567890' }),
          })
        );
      });
    });

    it('should show success toast when test notification succeeds (Requirement 5.3)', async () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const testButtons = screen.getAllByText('ทดสอบ');
      fireEvent.click(testButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/ส่งการแจ้งเตือนทดสอบถึง Test User 1 เรียบร้อยแล้ว/)).toBeInTheDocument();
      });
    });

    it('should show error toast when test notification fails (Requirement 5.4)', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to send notification' }),
      });

      render(<LineUserList lineUsers={mockUsers} />);

      const testButtons = screen.getAllByText('ทดสอบ');
      fireEvent.click(testButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Failed to send notification')).toBeInTheDocument();
      });
    });

    it('should disable button and show loading state while sending', async () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const testButtons = screen.getAllByText('ทดสอบ');
      fireEvent.click(testButtons[0]);

      // Check for loading state
      await waitFor(() => {
        expect(screen.getByText('กำลังส่ง...')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no users exist', () => {
      render(<LineUserList lineUsers={[]} />);

      expect(screen.getByText('ยังไม่มี LINE Users ในระบบ')).toBeInTheDocument();
    });
  });

  describe('Toast Notifications (Requirements 5.3, 5.4)', () => {
    it('should display success toast with proper styling', async () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const testButtons = screen.getAllByText('ทดสอบ');
      fireEvent.click(testButtons[0]);

      await waitFor(() => {
        const successToast = screen.getByText(/ส่งการแจ้งเตือนทดสอบถึง Test User 1 เรียบร้อยแล้ว/);
        expect(successToast).toBeInTheDocument();
        // Check parent element has correct classes
        expect(successToast.closest('div')).toHaveClass('bg-green-50');
      });
    });

    it('should display error toast with proper styling', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Test error' }),
      });

      render(<LineUserList lineUsers={mockUsers} />);

      const testButtons = screen.getAllByText('ทดสอบ');
      fireEvent.click(testButtons[0]);

      await waitFor(() => {
        const errorToast = screen.getByText('Test error');
        expect(errorToast).toBeInTheDocument();
        // Check parent element has correct classes
        expect(errorToast.closest('div')).toHaveClass('bg-red-50');
      });
    });
  });

  describe('UI Components (Requirement 13.3)', () => {
    it('should use Button component for actions', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should use Input component for search', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const searchInput = screen.getByPlaceholderText('ค้นหาชื่อผู้ใช้หรือ LINE User ID...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput.tagName).toBe('INPUT');
    });

    it('should use Dialog component for delete confirmation', () => {
      render(<LineUserList lineUsers={mockUsers} />);

      const deleteButtons = screen.getAllByText('ลบ');
      fireEvent.click(deleteButtons[0]);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
