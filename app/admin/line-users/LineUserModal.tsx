'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createLineUser, updateLineUser } from '@/actions/line-users';
import type { LineUser } from '@prisma/client';

interface LineUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  lineUser?: LineUser;
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full touch-manipulation">
      {pending ? 'กำลังบันทึก...' : mode === 'create' ? 'บันทึก' : 'อัพเดท'}
    </Button>
  );
}

export function LineUserModal({
  open,
  onOpenChange,
  mode,
  lineUser,
}: LineUserModalProps) {
  const action =
    mode === 'create'
      ? createLineUser
      : updateLineUser.bind(null, lineUser?.id || '');

  const [state, dispatch] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Form state to preserve values (Requirements 4.1, 4.2)
  const [formData, setFormData] = useState({
    lineUserId: '',
    displayName: '',
    pictureUrl: '',
    notificationsEnabled: true,
    daysBeforeExpiration: 30,
  });

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && lineUser) {
        // Edit mode - populate with existing data (Requirement 4.2)
        setFormData({
          lineUserId: lineUser.lineUserId || '',
          displayName: lineUser.displayName || '',
          pictureUrl: lineUser.pictureUrl || '',
          notificationsEnabled: lineUser.notificationsEnabled ?? true,
          daysBeforeExpiration: lineUser.daysBeforeExpiration ?? 30,
        });
      } else {
        // Create mode - reset to defaults (Requirement 4.1)
        setFormData({
          lineUserId: '',
          displayName: '',
          pictureUrl: '',
          notificationsEnabled: true,
          daysBeforeExpiration: 30,
        });
      }
    }
  }, [open, mode, lineUser]);

  // Close modal on success only (Requirement 4.2)
  useEffect(() => {
    if (state?.success) {
      onOpenChange(false);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'เพิ่ม LINE User' : 'แก้ไข LINE User'}
      description={
        mode === 'create'
          ? 'กรอกข้อมูล LINE User ที่ต้องการเพิ่มในระบบ'
          : `แก้ไขข้อมูล LINE User "${lineUser?.displayName}"`
      }
    >
      <form ref={formRef} action={dispatch} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
        {/* General Error Message (Requirement 10.3) */}
        {state?.error && typeof state.error === 'string' && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-xs sm:text-sm text-red-800">{state.error}</p>
          </div>
        )}

        {/* LINE User ID (Requirement 2.1) */}
        <div>
          <label htmlFor="lineUserId" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            LINE User ID <span className="text-red-600">*</span>
          </label>
          <Input
            id="lineUserId"
            name="lineUserId"
            type="text"
            required
            value={formData.lineUserId}
            onChange={(e) => setFormData({...formData, lineUserId: e.target.value})}
            placeholder="กรอก LINE User ID"
            className="text-base"
          />
        </div>

        {/* Display Name (Requirement 2.2) */}
        <div>
          <label htmlFor="displayName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Display Name <span className="text-red-600">*</span>
          </label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            required
            value={formData.displayName}
            onChange={(e) => setFormData({...formData, displayName: e.target.value})}
            placeholder="กรอกชื่อที่แสดง"
            className="text-base"
          />
        </div>

        {/* Picture URL (Requirement 2.3) */}
        <div>
          <label htmlFor="pictureUrl" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Picture URL
          </label>
          <Input
            id="pictureUrl"
            name="pictureUrl"
            type="url"
            value={formData.pictureUrl}
            onChange={(e) => setFormData({...formData, pictureUrl: e.target.value})}
            placeholder="กรอก URL รูปโปรไฟล์ (ถ้ามี)"
            className="text-base"
          />
        </div>

        {/* Notifications Enabled (Requirement 10.1, 10.4) */}
        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="notificationsEnabled"
              value="true"
              checked={formData.notificationsEnabled}
              onChange={(e) => setFormData({...formData, notificationsEnabled: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              เปิดการแจ้งเตือน
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            เมื่อเปิดใช้งาน ผู้ใช้จะได้รับการแจ้งเตือนเมื่อยาใกล้หมดอายุ
          </p>
        </div>

        {/* Days Before Expiration (Requirement 10.2, 10.4) */}
        <div>
          <label htmlFor="daysBeforeExpiration" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            จำนวนวันก่อนหมดอายุ <span className="text-red-600">*</span>
          </label>
          <Input
            id="daysBeforeExpiration"
            name="daysBeforeExpiration"
            type="number"
            required
            min="1"
            max="90"
            value={formData.daysBeforeExpiration}
            onChange={(e) => setFormData({...formData, daysBeforeExpiration: parseInt(e.target.value) || 30})}
            placeholder="30"
            className="text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            แจ้งเตือนเมื่อยาใกล้หมดอายุภายในจำนวนวันที่กำหนด (1-90 วัน)
          </p>
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
