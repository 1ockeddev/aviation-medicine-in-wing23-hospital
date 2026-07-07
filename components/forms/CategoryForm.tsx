'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';
import { createCategory, updateCategory } from '@/actions/categories';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { Category } from '@/types';

type ParentCategoryOption = {
  id: string;
  name: string;
  number: string;
};

interface CategoryFormProps {
  initialData?: Category;
  parentCategories?: ParentCategoryOption[];
  mode: 'create' | 'edit';
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
    >
      {pending
        ? 'กำลังบันทึก...'
        : mode === 'create'
        ? 'สร้างหมวดหมู่'
        : 'อัพเดทหมวดหมู่'}
    </Button>
  );
}

export function CategoryForm({
  initialData,
  parentCategories = [],
  mode,
}: CategoryFormProps) {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | undefined>();

  // Create the appropriate action based on mode
  const action = mode === 'create' 
    ? createCategory 
    : updateCategory.bind(null, initialData?.id || '');

  const [state, dispatch] = useActionState(action, undefined);

  // Handle form state updates
  useEffect(() => {
    if (state?.error) {
      if (typeof state.error === 'string') {
        setErrorMessage(state.error);
        setFieldErrors({});
      } else {
        setFieldErrors(state.error);
        setErrorMessage(undefined);
      }
      setSuccessMessage(undefined);
    } else if (state?.success) {
      setSuccessMessage(
        mode === 'create'
          ? 'สร้างหมวดหมู่สำเร็จ'
          : 'อัพเดทหมวดหมู่สำเร็จ'
      );
      setErrorMessage(undefined);
      setFieldErrors({});
    }
  }, [state, mode]);

  // Prepare parent category options with numbering
  const parentOptions: SelectOption[] = [
    { value: '', label: 'ไม่มี (หมวดหมู่หลัก)' },
    ...parentCategories
      .filter((cat) => cat.id !== initialData?.id) // Exclude self from parent options
      .map((cat) => ({
        value: cat.id,
        label: `${cat.number}. ${cat.name}`,
      })),
  ];

  return (
    <form action={dispatch} className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* General Error Message */}
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Category Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            ชื่อหมวดหมู่ <span className="text-red-600">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialData?.name || ''}
            className="mt-1"
            placeholder="กรอกชื่อหมวดหมู่"
            error={fieldErrors.name?.[0]}
          />
        </div>

        {/* Parent Category Selector */}
        <div>
          <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
            หมวดหมู่หลัก
          </label>
          <Select
            id="parentId"
            name="parentId"
            options={parentOptions}
            defaultValue={initialData?.parentId || ''}
            className="mt-1"
            error={fieldErrors.parentId?.[0]}
          />
          <p className="mt-1 text-xs text-gray-500">
            เลือกหมวดหมู่หลักหากต้องการสร้างหมวดหมู่ย่อย (สามารถมีได้สูงสุด 3 ระดับ)
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <SubmitButton mode={mode} />
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}
