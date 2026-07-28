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
      
      // Get current user profile
      const profile = await liff.getProfile();
      console.log('Current user:', profile.userId);
      
      await fetchUsers(profile.userId);
      setIsLoading(false);
    } catch (err) {
      console.error('LIFF error', err);
      router.push('/liff');
    }
  };

  const fetchUsers = async (currentUserId: string) => {
    try {
      const response = await fetch('/api/line-users');
      const data = await response.json();
      
      if (data.success) {
        // Filter to show only current user
        const currentUser = data.users.find((user: LineUser) => user.lineUserId === currentUserId);
        
        if (currentUser) {
          setUsers([currentUser]);
        } else {
          setError('ไม่พบข้อมูลของคุณในระบบ กรุณาลองส่งข้อความใน LINE OA ก่อน');
        }
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
                👥 การตั้งค่าของฉัน
              </h1>
              <p className="text-sm text-gray-500">
                การแจ้งเตือนยาหมดอายุ
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
            <div className="text-gray-400 text-5xl mb-4">�</div>
            <p className="text-gray-600 mb-2">ไม่พบข้อมูลของคุณ</p>
            <p className="text-sm text-gray-500 mt-2">
              กรุณาส่งข้อความใน LINE OA เพื่อลงทะเบียน
            </p>
            <button
              onClick={() => liff.isInClient() && liff.closeWindow()}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              {/* Profile Section */}
              <div className="flex items-center gap-4 mb-6">
                {user.pictureUrl ? (
                  <img
                    src={user.pictureUrl}
                    alt={user.displayName}
                    className="w-20 h-20 rounded-full flex-shrink-0 border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl text-white">👤</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-800 truncate">
                    {user.displayName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    ลงทะเบียนเมื่อ: {new Date(user.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-6"></div>

              {/* Notification Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  ⚙️ การตั้งค่าการแจ้งเตือน
                </h3>

                {/* Toggle Switch */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">การแจ้งเตือน</p>
                    <p className="text-sm text-gray-500 mt-1">
                      รับการแจ้งเตือนเมื่อยาใกล้หมดอายุ
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNotifications(user.id, user.notificationsEnabled)}
                    disabled={updatingUserId === user.id}
                    className={`
                      relative inline-flex h-10 w-16 items-center rounded-full
                      transition-colors duration-200 ease-in-out
                      ${user.notificationsEnabled ? 'bg-green-500' : 'bg-gray-300'}
                      ${updatingUserId === user.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-8 w-8 transform rounded-full bg-white
                        transition-transform duration-200 ease-in-out shadow-lg
                        ${user.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                {/* Days Before Expiration */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📅</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">แจ้งเตือนล่วงหน้า</p>
                      <p className="text-sm text-gray-600 mt-1">
                        จะได้รับการแจ้งเตือนก่อนยาหมดอายุ{' '}
                        <span className="font-bold text-blue-600">{user.daysBeforeExpiration} วัน</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className={`p-4 rounded-xl border ${
                  user.notificationsEnabled 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {user.notificationsEnabled ? '🔔' : '🔕'}
                    </span>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        user.notificationsEnabled ? 'text-green-800' : 'text-gray-800'
                      }`}>
                        {user.notificationsEnabled ? 'กำลังรับการแจ้งเตือน' : 'ไม่ได้รับการแจ้งเตือน'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        user.notificationsEnabled ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {user.notificationsEnabled 
                          ? 'คุณจะได้รับข้อความแจ้งเตือนเมื่อยาใกล้หมดอายุ'
                          : 'คุณจะไม่ได้รับการแจ้งเตือนใดๆ'
                        }
                      </p>
                    </div>
                  </div>
                </div>
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
            <li>• จะได้รับการแจ้งเตือนเมื่อยาใกล้หมดอายุตามจำนวนวันที่ตั้งไว้</li>
            <li>• การแจ้งเตือนจะถูกส่งผ่านข้อความ LINE โดยอัตโนมัติ</li>
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
