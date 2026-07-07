'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { createCategory, updateCategory } from '@/actions/categories';
import type { Category } from '@prisma/client';

type ParentCategoryOption = {
  id: string;
  name: string;
  number: string;
};

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  category?: Category;
  parentCategories: ParentCategoryOption[];
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full touch-manipulation">
      {pending
        ? 'กำลังบันทึก...'
        : mode === 'create'
        ? 'สร้างหมวดหมู่'
        : 'อัพเดทหมวดหมู่'}
    </Button>
  );
}

export function CategoryModal({
  open,
  onOpenChange,
  mode,
  category,
  parentCategories,
}: CategoryModalProps) {
  const action =
    mode === 'create'
      ? createCategory
      : updateCategory.bind(null, category?.id || '');

  const [state, dispatch] = useActionState(action, undefined);

  // Close modal on success
  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  const parentOptions: SelectOption[] = [
    { value: '', label: 'ไม่มี (หมวดหมู่หลัก)' },
    ...parentCategories
      .filter((cat) => cat.id !== category?.id)
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'สร้างหมวดหมู่ใหม่' : 'แก้ไขหมวดหมู่'}
      description={
        mode === 'create'
          ? 'เพิ่มหมวดหมู่หรือหมวดหมู่ย่อยสำหรับจัดกลุ่มยา'
          : `แก้ไขข้อมูลหมวดหมู่ "${category?.name}"`
      }
      // Don't pass onConfirm to prevent Dialog from showing its own buttons
    >
      <form action={dispatch} className="space-y-4">
        {/* General Error Message */}
        {state?.error && typeof state.error === 'string' && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-xs sm:text-sm text-red-800">{state.error}</p>
          </div>
        )}

        {/* Category Name */}
        <div>
          <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            ชื่อหมวดหมู่ <span className="text-red-600">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={category?.name || ''}
            placeholder="กรอกชื่อหมวดหมู่"
            autoFocus
            className="text-base" // Prevent zoom on iOS
          />
        </div>

        {/* Parent Category Selector */}
        <div>
          <label htmlFor="parentId" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            หมวดหมู่หลัก
          </label>
          <Select
            id="parentId"
            name="parentId"
            options={parentOptions}
            defaultValue={category?.parentId || ''}
            className="text-base" // Prevent zoom on iOS
          />
          <p className="mt-1 text-xs text-gray-500">
            เลือกหมวดหมู่หลักหากต้องการสร้างหมวดหมู่ย่อย
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full touch-manipulation"
          >
            ยกเลิก
          </Button>
          <SubmitButton mode={mode} />
        </div>
      </form>
    </Dialog>
  );
}
