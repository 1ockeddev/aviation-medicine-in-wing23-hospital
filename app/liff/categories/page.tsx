'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
import { SpinnerIcon, FolderIcon, ArrowLeftIcon } from '@/components/icons/LiffIcons';

export default function LiffCategoriesPage() {
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
        <SpinnerIcon size={64} className="text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/liff/menu')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon size={24} />
            </button>
            <div className="flex items-center gap-2">
              <FolderIcon size={24} className="text-green-600" />
              <h1 className="text-xl font-bold text-gray-800">
                จัดการหมวดหมู่
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">
            กำลังโหลดข้อมูลหมวดหมู่...
          </p>
          <div className="mt-6">
            <a
              href="/admin/categories"
              target="_blank"
              className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
            >
              เปิดหน้า Admin (Full)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
