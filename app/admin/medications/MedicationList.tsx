'use client';

import { useState, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { deleteMedication } from '@/actions/medications';
import { MedicationModal } from './MedicationModal';
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

interface MedicationListProps {
  medications: MedicationWithCategory[];
  categories: CategoryWithNumber[];
}

export function MedicationList({ medications, categories }: MedicationListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicationToDelete, setMedicationToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [medicationToEdit, setMedicationToEdit] = useState<Medication | undefined>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to get category number by ID
  const getCategoryNumber = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.number || '';
  };

  // Filter medications based on search query
  const filteredMedications = useMemo(() => {
    if (!searchQuery.trim()) return medications;

    const query = searchQuery.toLowerCase();
    return medications.filter((medication) =>
      medication.name.toLowerCase().includes(query) ||
      medication.tradeName?.toLowerCase().includes(query) ||
      medication.category.name.toLowerCase().includes(query)
    );
  }, [medications, searchQuery]);

  const handleDeleteClick = (id: string, name: string) => {
    setMedicationToDelete({ id, name });
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleEditClick = (medication: Medication) => {
    setModalMode('edit');
    setMedicationToEdit(medication);
    setModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!medicationToDelete) return;

    startTransition(async () => {
      const result = await deleteMedication(medicationToDelete.id);
      
      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : 'เกิดข้อผิดพลาด');
      } else {
        setDeleteDialogOpen(false);
        setMedicationToDelete(null);
        setError(null);
      }
    });
  };

  const handleDialogClose = () => {
    if (!isPending) {
      setDeleteDialogOpen(false);
      setMedicationToDelete(null);
      setError(null);
    }
  };

  if (medications.length === 0) {
    return (
      <>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">ยังไม่มีรายการยาในระบบ</p>
        </div>
        <MedicationModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          medication={medicationToEdit}
          categories={categories}
        />
      </>
    );
  }

  return (
    <>
      {/* Search Box */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="ค้นหาชื่อยา, ชื่อการค้า หรือหมวดหมู่..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredMedications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">ไม่พบรายการยาที่ค้นหา</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อยา
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อการค้า
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมวดหมู่
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedications.map((medication, index) => (
                <tr key={medication.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {medication.name}
                    </div>
                    <div className="text-xs text-gray-500 sm:hidden mt-1">
                      {medication.category.name}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-500">
                    {medication.tradeName || '-'}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">
                    {medication.category.name}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        medication.status === 'Y' || medication.status === 'Y*'
                          ? 'bg-green-100 text-green-800'
                          : medication.status === 'N' || medication.status === 'N*'
                          ? 'bg-red-100 text-red-800'
                          : medication.status === 'ยาฉุกเฉิน'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {medication.status}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditClick(medication)}
                        className="text-xs px-2 py-1"
                      >
                        แก้ไข
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(medication.id, medication.name)}
                        className="text-xs px-2 py-1"
                      >
                        ลบ
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Medication Modal */}
      <MedicationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        medication={medicationToEdit}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={handleDialogClose}
        title="ยืนยันการลบยา"
        description={
          medicationToDelete
            ? `คุณต้องการลบยา "${medicationToDelete.name}" ใช่หรือไม่?`
            : ''
        }
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDialogClose}
        variant="danger"
        loading={isPending}
      >
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-xs sm:text-sm text-red-800">{error}</p>
          </div>
        )}
        {!error && (
          <p className="text-xs sm:text-sm text-gray-600">
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </p>
        )}
      </Dialog>
    </>
  );
}
