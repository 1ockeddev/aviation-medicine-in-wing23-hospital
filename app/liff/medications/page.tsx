'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';

/**
 * LIFF Medications Page
 * 
 * Mobile-friendly medication management via LINE LIFF
 */
export default function LiffMedicationsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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

      setIsLoading(false);
    } catch (err) {
      console.error('LIFF error', err);
      router.push('/liff');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
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
              className="text-gray-600 hover:text-gray-800"
            >
              ← กลับ
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              💊 จัดการยา
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">
            กำลังโหลดข้อมูลยา...
          </p>
          <p className="text-sm text-gray-500">
            หน้านี้จะแสดงรายการยาและฟังก์ชันการจัดการ CRUD
          </p>
          <div className="mt-6">
            <a
              href="/admin/medications"
              target="_blank"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              เปิดหน้า Admin (Full)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
