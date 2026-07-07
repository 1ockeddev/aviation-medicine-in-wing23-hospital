'use client';

import { Suspense, useState } from 'react';
import { MedicationList } from './MedicationList';
import { MedicationModal } from './MedicationModal';
import { Button } from '@/components/ui/Button';
import type { Medication, Category } from '@prisma/client';

type MedicationWithCategory = Medication & {
  category: Category;
};

type CategoryWithNumber = {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  number: string;
};

interface MedicationsClientPageProps {
  medications: MedicationWithCategory[];
  categories: CategoryWithNumber[];
}

export function MedicationsClientPage({
  medications,
  categories,
}: MedicationsClientPageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">รายการยา</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            จัดการข้อมูลยาในระบบ
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto"
        >
          เพิ่มยา
        </Button>
      </div>

      <Suspense fallback={<div className="text-gray-500 text-center py-8">กำลังโหลด...</div>}>
        <MedicationList
          medications={medications}
          categories={categories}
        />
      </Suspense>

      <MedicationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode="create"
        categories={categories}
      />
    </div>
  );
}
