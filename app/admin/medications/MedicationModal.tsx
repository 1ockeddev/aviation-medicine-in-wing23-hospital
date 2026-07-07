'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';
import { Combobox, type ComboboxOption } from '@/components/ui/Combobox';
import { Button } from '@/components/ui/Button';
import { createMedication, updateMedication } from '@/actions/medications';
import type { Medication } from '@prisma/client';

type CategoryWithNumber = {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  number: string;
};

interface MedicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  medication?: Medication;
  categories: CategoryWithNumber[];
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full touch-manipulation">
      {pending ? 'กำลังบันทึก...' : mode === 'create' ? 'บันทึก' : 'อัพเดท'}
    </Button>
  );
}

export function MedicationModal({
  open,
  onOpenChange,
  mode,
  medication,
  categories,
}: MedicationModalProps) {
  const action =
    mode === 'create'
      ? createMedication
      : updateMedication.bind(null, medication?.id || '');

  const [state, dispatch] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Form state to preserve values
  const [formData, setFormData] = useState({
    name: '',
    tradeName: '',
    expirationDate: '',
    categoryId: '',
    status: 'Y',
    dose: '',
    doseDetails: '',
    halfLife: '',
    sideEffects: '',
    notes: '',
  });

  // Toggle states for optional fields
  const [showHalfLife, setShowHalfLife] = useState<boolean>(false);
  const [showSideEffects, setShowSideEffects] = useState<boolean>(false);
  const [showNotes, setShowNotes] = useState<boolean>(false);

  // Helper function for date formatting
  const formatDateForInput = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  };

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && medication) {
        setFormData({
          name: medication.name || '',
          tradeName: medication.tradeName || '',
          expirationDate: formatDateForInput(medication.expirationDate),
          categoryId: medication.categoryId || '',
          status: medication.status || 'Y',
          dose: medication.dose || '',
          doseDetails: medication.doseDetails || '',
          halfLife: medication.halfLife || '',
          sideEffects: medication.sideEffects || '',
          notes: medication.notes || '',
        });
        setShowHalfLife(!!medication.halfLife);
        setShowSideEffects(!!medication.sideEffects);
        setShowNotes(!!medication.notes);
      } else {
        // Create mode - reset
        setFormData({
          name: '',
          tradeName: '',
          expirationDate: '',
          categoryId: '',
          status: 'Y',
          dose: '',
          doseDetails: '',
          halfLife: '',
          sideEffects: '',
          notes: '',
        });
        setShowHalfLife(false);
        setShowSideEffects(false);
        setShowNotes(false);
      }
    }
  }, [open, mode, medication]);

  // Close modal on success only
  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  const categoryOptions: ComboboxOption[] = categories.map((cat) => {
    let indent = '';
    let prefix = '';
    
    if (cat.parentId) {
      const parent = categories.find(c => c.id === cat.parentId);
      if (parent?.parentId) {
        indent = '　　　';
        prefix = '└─ ';
      } else {
        indent = '　　';
        prefix = '├─ ';
      }
    }

    return {
      value: cat.id,
      label: `${indent}${prefix}${cat.name}`,
    };
  });

  const statusOptions: SelectOption[] = [
    { value: 'Y', label: 'Y' },
    { value: 'Y*', label: 'Y*' },
    { value: 'N', label: 'N' },
    { value: 'N*', label: 'N*' },
    { value: 'N/A', label: 'N/A' },
    { value: 'case by case', label: 'case by case' },
    { value: 'ยาฉุกเฉิน', label: 'ยาฉุกเฉิน' },
    { value: '≤20mg/day', label: '≤20mg/day' },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'เพิ่มยาใหม่' : 'แก้ไขข้อมูลยา'}
      description={
        mode === 'create'
          ? 'กรอกข้อมูลยาที่ต้องการเพิ่มในระบบ'
          : `แก้ไขข้อมูลยา "${medication?.name}"`
      }
    >
      <form ref={formRef} action={dispatch} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
        {/* General Error Message */}
        {state?.error && typeof state.error === 'string' && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-xs sm:text-sm text-red-800">{state.error}</p>
          </div>
        )}

        {/* Category */}
        <div>
          <label htmlFor="categoryId" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            หมวดหมู่ <span className="text-red-600">*</span>
          </label>
          <Combobox
            id="categoryId"
            name="categoryId"
            options={categoryOptions}
            value={formData.categoryId}
            onChange={(value) => setFormData({...formData, categoryId: value})}
            placeholder="พิมพ์เพื่อค้นหาหมวดหมู่..."
            required
            className="text-base"
          />
        </div>

        {/* Medication Name */}
        <div>
          <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            ชื่อยา <span className="text-red-600">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="กรอกชื่อยา"
            className="text-base"
          />
        </div>

        {/* Trade Name */}
        <div>
          <label htmlFor="tradeName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            ชื่อการค้า
          </label>
          <Input
            id="tradeName"
            name="tradeName"
            type="text"
            value={formData.tradeName}
            onChange={(e) => setFormData({...formData, tradeName: e.target.value})}
            placeholder="กรอกชื่อการค้า (ถ้ามี)"
            className="text-base"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            สถานะ <span className="text-red-600">*</span>
          </label>
          <Select
            id="status"
            name="status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            required
            className="text-base"
          />
        </div>

        {/* Half Life */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              HL (Half Life)
            </label>
            <button
              type="button"
              onClick={() => setShowHalfLife(!showHalfLife)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                showHalfLife
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showHalfLife ? '✓ เพิ่มข้อมูล' : '+ เพิ่มข้อมูล'}
            </button>
          </div>
          {showHalfLife && (
            <textarea
              id="halfLife"
              name="halfLife"
              rows={3}
              value={formData.halfLife}
              onChange={(e) => setFormData({...formData, halfLife: e.target.value})}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="เช่น 2-4 ชั่วโมง"
            />
          )}
        </div>

        {/* Side Effects */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              SE (Side Effects)
            </label>
            <button
              type="button"
              onClick={() => setShowSideEffects(!showSideEffects)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                showSideEffects
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showSideEffects ? '✓ เพิ่มข้อมูล' : '+ เพิ่มข้อมูล'}
            </button>
          </div>
          {showSideEffects && (
            <textarea
              id="sideEffects"
              name="sideEffects"
              rows={3}
              value={formData.sideEffects}
              onChange={(e) => setFormData({...formData, sideEffects: e.target.value})}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="กรอกผลข้างเคียง"
            />
          )}
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              หมายเหตุ
            </label>
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                showNotes
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showNotes ? '✓ เพิ่มข้อมูล' : '+ เพิ่มข้อมูล'}
            </button>
          </div>
          {showNotes && (
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="กรอกหมายเหตุ"
            />
          )}
        </div>

        {/* Expiration Date */}
        <div>
          <label htmlFor="expirationDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            วันหมดอายุ
          </label>
          <Input
            id="expirationDate"
            name="expirationDate"
            type="date"
            value={formData.expirationDate}
            onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
            className="text-base"
          />
        </div>

        {/* Dose */}
        <div>
          <label htmlFor="dose" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            โดส
          </label>
          <Input
            id="dose"
            name="dose"
            type="text"
            value={formData.dose}
            onChange={(e) => setFormData({...formData, dose: e.target.value})}
            placeholder="เช่น 20 mg"
            className="text-base"
          />
        </div>

        {/* Dose Details */}
        <div>
          <label htmlFor="doseDetails" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            รายละเอียดโดส
          </label>
          <textarea
            id="doseDetails"
            name="doseDetails"
            rows={2}
            value={formData.doseDetails}
            onChange={(e) => setFormData({...formData, doseDetails: e.target.value})}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="เช่น ทน SE amlo ไม่ได้"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 sticky bottom-0 bg-white pb-2">
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
