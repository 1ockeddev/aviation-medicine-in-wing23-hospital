'use client';

import { Suspense, useState } from 'react';
import { CategoryList } from './CategoryList';
import { CategoryModal } from './CategoryModal';
import { Button } from '@/components/ui/Button';
import type { Category } from '@prisma/client';

type CategoryLevel3 = Category & {
  _count: {
    medications: number;
  };
};

type CategoryLevel2 = Category & {
  children: CategoryLevel3[];
  _count: {
    medications: number;
  };
};

type CategoryWithChildrenAndCount = Category & {
  children: CategoryLevel2[];
  _count: {
    medications: number;
  };
};

type ParentCategoryOption = {
  id: string;
  name: string;
  number: string;
};

interface CategoriesClientPageProps {
  categories: CategoryWithChildrenAndCount[];
  parentCategories: ParentCategoryOption[];
}

export function CategoriesClientPage({
  categories,
  parentCategories,
}: CategoriesClientPageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">หมวดหมู่ยา</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">จัดการหมวดหมู่และหมวดหมู่ย่อยของยา</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto"
        >
          เพิ่มหมวดหมู่
        </Button>
      </div>

      <Suspense fallback={<div className="text-gray-500 text-center py-8">กำลังโหลด...</div>}>
        <CategoryList
          categories={categories}
          parentCategories={parentCategories}
        />
      </Suspense>

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode="create"
        parentCategories={parentCategories}
      />
    </div>
  );
}
