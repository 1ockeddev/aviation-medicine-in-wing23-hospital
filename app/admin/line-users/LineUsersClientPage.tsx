'use client';

import { useState } from 'react';
import { LineUserList } from './LineUserList';
import { LineUserModal } from './LineUserModal';
import { Button } from '@/components/ui/Button';
import type { LineUser } from '@prisma/client';

interface Statistics {
  total: number;
  enabled: number;
  disabled: number;
  percentage: number;
}

interface LineUsersClientPageProps {
  lineUsers: LineUser[];
  statistics: Statistics;
}

export function LineUsersClientPage({
  lineUsers,
  statistics,
}: LineUsersClientPageProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      {/* Header - Mobile First */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            LINE Users
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            จัดการผู้ใช้ที่ลงทะเบียนผ่าน LINE Mini App
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setModalOpen(true)}
          className="w-full sm:w-auto"
        >
          เพิ่มผู้ใช้
        </Button>
      </div>

      {/* Statistics Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="ทั้งหมด"
          value={statistics.total}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          title="เปิดการแจ้งเตือน"
          value={statistics.enabled}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          title="ปิดการแจ้งเตือน"
          value={statistics.disabled}
          color="bg-gray-100 text-gray-700"
        />
        <StatCard
          title="% Active"
          value={`${statistics.percentage}%`}
          color="bg-purple-100 text-purple-700"
        />
      </div>

      {/* User List */}
      <LineUserList lineUsers={lineUsers} />

      {/* Modal */}
      <LineUserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode="create"
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
