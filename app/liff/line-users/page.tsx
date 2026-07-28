'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';

interface LineUser {
  id: string;
  lineUserId: string;
  displayName: string;
  pictureUrl?: string;
  notificationsEnabled: boolean;
  daysBeforeExpiration: number;
  createdAt: string;
  updatedAt: string;
}

export default function LiffLineUsersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<LineUser[]>([]);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    initializeLiff();
  }, []);

  const initializeLiff = async () => {
    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      if (!liffId) throw new Error('LIFF ID not configured');
      await liff.init({ liffId });
      if (!liff.isLoggedIn()) {
        router.push('/liff');
        return;
      }
      await fetchUsers();
      setIsLoading(false);
    } catch (err) {
      console.error('LIFF error', err);
      router.push('/liff');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/line-users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      }
    } catch (err) {
      console.error('Error fetching users', err);
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
  };

  const toggleNotifications = async (userId: string, currentValue: boolean) => {
    try {
      setUpdatingUserId(userId);
      setError('');

      const response = await fetch(`/api/line-users/${userId}/notifications`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationsEnabled: !currentValue,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, notificationsEnabled: !currentValue }
            : user
        ));
      } else {
        setError(data.error || 'ไม่สามารถอัพเดทการตั้งค่าได้');
      }
    } catch (err) {
      console.error('Error updating notifications', err);
      setError('เกิดข้อผิดพลาดในการอัพเดท');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/liff/menu')}
              className="text-gray-600 hover:text-gray-800 text-2xl"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                👥 ผู้ใช้ LINE
              </h1>
              <p className="text-sm text-gray-500">
                {users.length} คน
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="max-w-7xl mx-auto p-4 space-y-3">
        {users.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">👥</div>
            <p className="text-gray-600">ยังไม่มีผู้ใช้ลงทะเบียน</p>
            <p className="text-sm text-gray-500 mt-2">
              ผู้ใช้จะถูกลงทะเบียนอัตโนมัติเมื่อเพิ่มเพื่อนหรือส่งข้อความ
            </p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                {/* Profile Picture */}
                {user.pictureUrl ? (
                  <img
                    src={user.pictureUrl}
                    alt={user.displayName}
                    className="w-14 h-14 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">👤</span>
                  </div>
                )}

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">
                    {user.displayName}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    ID: {user.lineUserId}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      แจ้งเตือนล่วงหน้า: {user.daysBeforeExpiration} วัน
                    </span>
                  </div>
                </div>

                {/* Notification Toggle */}
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => toggleNotifications(user.id, user.notificationsEnabled)}
                    disabled={updatingUserId === user.id}
                    className={`
                      relative inline-flex h-8 w-14 items-center rounded-full
                      transition-colors duration-200 ease-in-out
                      ${user.notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}
                      ${updatingUserId === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-6 w-6 transform rounded-full bg-white
                        transition-transform duration-200 ease-in-out shadow-lg
                        ${user.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}
                      `}
                    />
                  </button>
                  <span className={`text-xs font-medium ${
                    user.notificationsEnabled ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {updatingUserId === user.id ? '...' : user.notificationsEnabled ? 'เปิด' : 'ปิด'}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3 flex items-center gap-2">
                {user.notificationsEnabled ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
                    🔔 รับการแจ้งเตือน
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs">
                    🔕 ไม่รับการแจ้งเตือน
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  ลงทะเบียน: {new Date(user.createdAt).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Text */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">💡 เกี่ยวกับการแจ้งเตือน</p>
          <ul className="space-y-1 text-xs">
            <li>• เปิด/ปิดการแจ้งเตือนได้ด้วยการสลับสวิตช์</li>
            <li>• จะได้รับการแจ้งเตือนเมื่อยาใกล้หมดอายุ</li>
            <li>• แจ้งเตือนล่วงหน้าตามจำนวนวันที่ตั้งไว้</li>
          </ul>
        </div>
      </div>

      {/* Close Button */}
      {liff.isInClient() && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <button
            onClick={() => liff.closeWindow()}
            className="w-full bg-white text-gray-700 px-6 py-3 rounded-xl shadow-lg hover:bg-gray-50 transition font-medium"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      )}
    </div>
  );
}
