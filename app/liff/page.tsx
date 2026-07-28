'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';
import { SpinnerIcon, CheckIcon, XIcon } from '@/components/icons/LiffIcons';

/**
 * LIFF Landing Page
 * 
 * Entry point from LINE Rich Menu
 * Authenticates user and redirects to admin panel
 */
export default function LiffLandingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    initializeLiff();
  }, []);

  const initializeLiff = async () => {
    try {
      setStatus('loading');
      
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      
      if (!liffId) {
        throw new Error('LIFF ID not configured');
      }

      // Initialize LIFF
      await liff.init({ liffId });

      console.log('LIFF initialized', {
        isLoggedIn: liff.isLoggedIn(),
        isInClient: liff.isInClient(),
      });

      // Check if user is logged in
      if (!liff.isLoggedIn()) {
        console.log('User not logged in, redirecting to LINE login');
        liff.login();
        return;
      }

      // Get user profile
      const profile = await liff.getProfile();
      console.log('User profile', {
        userId: profile.userId,
        displayName: profile.displayName,
      });

      setUserProfile(profile);

      // Register/update user in database
      await registerUser(profile);

      setStatus('authenticated');

      // Redirect to admin panel after 1 second
      setTimeout(() => {
        router.push('/liff/menu');
      }, 1000);

    } catch (err) {
      console.error('LIFF initialization error', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  };

  const registerUser = async (profile: any) => {
    try {
      const response = await fetch('/api/line/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl,
        }),
      });

      if (!response.ok) {
        console.warn('Failed to register user', await response.text());
      }
    } catch (err) {
      console.error('User registration error', err);
      // Don't throw - allow user to continue even if registration fails
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="mb-6">
              <SpinnerIcon size={64} className="mx-auto text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              กำลังเข้าสู่ระบบ...
            </h1>
            <p className="text-gray-600">
              กรุณารอสักครู่
            </p>
          </>
        )}

        {status === 'authenticated' && (
          <>
            <div className="mb-6">
              {userProfile?.pictureUrl && (
                <img 
                  src={userProfile.pictureUrl} 
                  alt={userProfile.displayName}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
              )}
              <CheckIcon size={48} className="mx-auto text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ยินดีต้อนรับ!
            </h1>
            <p className="text-gray-600 mb-4">
              {userProfile?.displayName}
            </p>
            <p className="text-sm text-gray-500">
              กำลังนำคุณไปยังเมนู...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-6">
              <XIcon size={48} className="mx-auto text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              เกิดข้อผิดพลาด
            </h1>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              ลองอีกครั้ง
            </button>
          </>
        )}
      </div>
    </div>
  );
}
