'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { deleteLineUser } from '@/actions/line-users';
import { LineUserModal } from './LineUserModal';
import type { LineUser } from '@prisma/client';

interface LineUserListProps {
  lineUsers: LineUser[];
}

export function LineUserList({ lineUsers }: LineUserListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<LineUser | undefined>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [testNotificationPending, setTestNotificationPending] = useState<string | null>(null);
  const [expiryNotificationPending, setExpiryNotificationPending] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const USERS_PER_PAGE = 20;

  // Filter users based on search query (Requirements 3.4)
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return lineUsers;

    const query = searchQuery.toLowerCase();
    return lineUsers.filter((user) =>
      user.displayName.toLowerCase().includes(query) ||
      user.lineUserId.toLowerCase().includes(query)
    );
  }, [lineUsers, searchQuery]);

  // Pagination logic (Requirement 3.5)
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDeleteClick = (id: string, name: string) => {
    setUserToDelete({ id, name });
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleEditClick = (user: LineUser) => {
    setUserToEdit(user);
    setModalOpen(true);
  };

  // Delete user operation (Requirement 4.3, 4.4)
  const handleDeleteConfirm = () => {
    if (!userToDelete) return;

    startTransition(async () => {
      const result = await deleteLineUser(userToDelete.id);
      
      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : 'เกิดข้อผิดพลาด');
      } else {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        setError(null);
        // Show success message (Requirement 5.3)
        setSuccessMessage('ลบผู้ใช้เรียบร้อยแล้ว');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    });
  };

  const handleDialogClose = () => {
    if (!isPending) {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setError(null);
    }
  };

  // Send test notification (Requirement 5.1, 5.3, 5.4)
  const handleSendTest = async (lineUserId: string, displayName: string) => {
    setTestNotificationPending(lineUserId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/line/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lineUserId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message (Requirement 5.3)
        setSuccessMessage(`ส่งการแจ้งเตือนทดสอบถึง ${displayName} เรียบร้อยแล้ว`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // Show error message (Requirement 5.4)
        setError(data.error || 'ไม่สามารถส่งการแจ้งเตือนได้');
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการส่งการแจ้งเตือน');
      setTimeout(() => setError(null), 5000);
    } finally {
      setTestNotificationPending(null);
    }
  };

  // Send expiry notification with real medication data
  const handleSendExpiryNotification = async (lineUserId: string, displayName: string) => {
    setExpiryNotificationPending(lineUserId);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/line/send-expiry-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lineUserId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message with medication count
        const medicationCount = data.medicationCount || 0;
        setSuccessMessage(
          `ส่งการแจ้งเตือนยาใกล้หมดอายุ ${medicationCount} รายการถึง ${displayName} เรียบร้อยแล้ว`
        );
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        // Show error message
        if (response.status === 404) {
          setError('ไม่พบยาที่ใกล้หมดอายุภายใน 30 วัน');
        } else {
          setError(data.error || 'ไม่สามารถส่งการแจ้งเตือนได้');
        }
        setTimeout(() => setError(null), 5000);
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการส่งการแจ้งเตือน');
      setTimeout(() => setError(null), 5000);
    } finally {
      setExpiryNotificationPending(null);
    }
  };

  // Format date for display
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (lineUsers.length === 0) {
    return (
      <>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">ยังไม่มี LINE Users ในระบบ</p>
        </div>
        <LineUserModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode="create"
        />
      </>
    );
  }

  return (
    <>
      {/* Success Message Toast (Requirement 5.3) */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md animate-slide-in">
          <p className="text-sm text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message Toast (Requirement 5.4) */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md animate-slide-in">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Search Box (Requirement 3.4) */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="ค้นหาชื่อผู้ใช้หรือ LINE User ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">ไม่พบผู้ใช้ที่ค้นหา</p>
        </div>
      ) : (
        <>
          {/* User Cards - Requirements 3.2, 4.1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                {/* User Profile */}
                <div className="flex items-start gap-3 mb-4">
                  {user.pictureUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.pictureUrl}
                      alt={user.displayName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg font-semibold">
                        {user.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {user.displayName}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {user.lineUserId}
                    </p>
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">ลงทะเบียน:</span>
                    <span className="text-gray-900">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">การแจ้งเตือน:</span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.notificationsEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.notificationsEnabled ? 'เปิด' : 'ปิด'}
                    </span>
                  </div>
                  {user.notificationsEnabled && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">แจ้งเตือนก่อน:</span>
                      <span className="text-gray-900">{user.daysBeforeExpiration} วัน</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons (Requirement 4.1, 4.3, 5.1) */}
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditClick(user)}
                      className="text-xs px-2 py-1"
                    >
                      แก้ไข
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id, user.displayName)}
                      className="text-xs px-2 py-1"
                    >
                      ลบ
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSendTest(user.lineUserId, user.displayName)}
                      disabled={testNotificationPending === user.lineUserId}
                      className="text-xs px-2 py-1"
                    >
                      {testNotificationPending === user.lineUserId ? 'กำลังส่ง...' : 'ทดสอบ'}
                    </Button>
                  </div>
                  
                  {/* Send Real Expiry Notification Button */}
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleSendExpiryNotification(user.lineUserId, user.displayName)}
                    disabled={expiryNotificationPending === user.lineUserId}
                    className="text-xs px-2 py-1 w-full"
                  >
                    {expiryNotificationPending === user.lineUserId 
                      ? 'กำลังส่ง...' 
                      : '📋 ส่งรายการยาใกล้หมดอายุ'}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination (Requirement 3.5) */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← ก่อนหน้า
              </Button>
              <span className="text-sm text-gray-600">
                หน้า {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ถัดไป →
              </Button>
            </div>
          )}
        </>
      )}

      {/* Edit Modal (Requirement 4.2) */}
      <LineUserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode="edit"
        lineUser={userToEdit}
      />

      {/* Delete Confirmation Dialog (Requirement 4.3) */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={handleDialogClose}
        title="ยืนยันการลบผู้ใช้"
        description={
          userToDelete
            ? `คุณต้องการลบผู้ใช้ "${userToDelete.name}" ใช่หรือไม่?`
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
