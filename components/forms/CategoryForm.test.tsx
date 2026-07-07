import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryForm } from './CategoryForm';
import type { Category } from '@/types';

// Mock the React DOM hooks
vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');
  return {
    ...actual,
    useFormState: vi.fn((action, initialState) => [initialState, vi.fn()]),
    useFormStatus: vi.fn(() => ({ pending: false })),
  };
});

// Mock the server actions
vi.mock('@/actions/categories', () => ({
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
}));

describe('CategoryForm', () => {
  const mockParentCategories: Category[] = [
    {
      id: 'cat1',
      name: 'ยาแก้ปวด',
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat2',
      name: 'ยาแก้อักเสบ',
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('Create Mode', () => {
    it('should render create form with required fields', () => {
      render(
        <CategoryForm
          mode="create"
          parentCategories={mockParentCategories}
        />
      );

      expect(screen.getByLabelText(/ชื่อหมวดหมู่/)).toBeInTheDocument();
      expect(screen.getByLabelText(/หมวดหมู่หลัก/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /สร้างหมวดหมู่/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ยกเลิก/ })).toBeInTheDocument();
    });

    it('should display parent category options', () => {
      render(
        <CategoryForm
          mode="create"
          parentCategories={mockParentCategories}
        />
      );

      const parentSelect = screen.getByLabelText(/หมวดหมู่หลัก/) as HTMLSelectElement;
      const options = Array.from(parentSelect.options).map(opt => opt.text);

      expect(options).toContain('ไม่มี (หมวดหมู่หลัก)');
      expect(options).toContain('ยาแก้ปวด');
      expect(options).toContain('ยาแก้อักเสบ');
    });

    it('should show helper text about hierarchy limit', () => {
      render(
        <CategoryForm
          mode="create"
          parentCategories={mockParentCategories}
        />
      );

      expect(
        screen.getByText(/เลือกหมวดหมู่หลักหากต้องการสร้างหมวดหมู่ย่อย/)
      ).toBeInTheDocument();
    });

    it('should mark name field as required', () => {
      render(
        <CategoryForm
          mode="create"
          parentCategories={mockParentCategories}
        />
      );

      const nameInput = screen.getByLabelText(/ชื่อหมวดหมู่/);
      expect(nameInput).toHaveAttribute('required');
    });
  });

  describe('Edit Mode', () => {
    const mockInitialData: Category = {
      id: 'edit1',
      name: 'ยาแก้ไอ',
      parentId: 'cat1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should render edit form with initial data', () => {
      render(
        <CategoryForm
          mode="edit"
          initialData={mockInitialData}
          parentCategories={mockParentCategories}
        />
      );

      const nameInput = screen.getByLabelText(/ชื่อหมวดหมู่/) as HTMLInputElement;
      expect(nameInput.value).toBe('ยาแก้ไอ');
      expect(screen.getByRole('button', { name: /อัพเดทหมวดหมู่/ })).toBeInTheDocument();
    });

    it('should exclude self from parent category options', () => {
      const categoryToEdit: Category = {
        id: 'cat1',
        name: 'ยาแก้ปวด',
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(
        <CategoryForm
          mode="edit"
          initialData={categoryToEdit}
          parentCategories={mockParentCategories}
        />
      );

      const parentSelect = screen.getByLabelText(/หมวดหมู่หลัก/) as HTMLSelectElement;
      const options = Array.from(parentSelect.options).map(opt => opt.value);

      // Should not include self (cat1) as an option
      expect(options).not.toContain('cat1');
      expect(options).toContain('cat2');
    });

    it('should pre-select parent category', () => {
      render(
        <CategoryForm
          mode="edit"
          initialData={mockInitialData}
          parentCategories={mockParentCategories}
        />
      );

      const parentSelect = screen.getByLabelText(/หมวดหมู่หลัก/) as HTMLSelectElement;
      expect(parentSelect.value).toBe('cat1');
    });
  });

  describe('Validation Display', () => {
    it('should render form with Thai labels', () => {
      render(
        <CategoryForm
          mode="create"
          parentCategories={mockParentCategories}
        />
      );

      expect(screen.getByText(/ชื่อหมวดหมู่/)).toBeInTheDocument();
      expect(screen.getByText(/หมวดหมู่หลัก/)).toBeInTheDocument();
    });

    it('should have placeholder text in Thai', () => {
      render(
        <CategoryForm
          mode="create"
          parentCategories={mockParentCategories}
        />
      );

      const nameInput = screen.getByPlaceholderText(/กรอกชื่อหมวดหมู่/);
      expect(nameInput).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render when no parent categories are available', () => {
      render(
        <CategoryForm
          mode="create"
          parentCategories={[]}
        />
      );

      const parentSelect = screen.getByLabelText(/หมวดหมู่หลัก/) as HTMLSelectElement;
      const options = Array.from(parentSelect.options);

      // Should only have the "no parent" option
      expect(options).toHaveLength(1);
      expect(options[0].text).toBe('ไม่มี (หมวดหมู่หลัก)');
    });
  });
});
