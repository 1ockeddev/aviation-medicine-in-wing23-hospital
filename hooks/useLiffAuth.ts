import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import liff from '@line/liff';

interface UseLiffAuthOptions {
  redirectOnError?: boolean;
  autoRegister?: boolean;
}

export function useLiffAuth(options: UseLiffAuthOptions = {}) {
  const {
    redirectOnError = true,
    autoRegister = true,
  } = options;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    initializeLiff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeLiff = async () => {
    try {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      
      if (!liffId) {
        throw new Error('LIFF ID not configured');
      }

      // Initialize LIFF
      await liff.init({ liffId });

      // Check if user is logged in
      if (!liff.isLoggedIn()) {
        liff.login();
        return;
      }

      // Get user profile
      const profile = await liff.getProfile();
      setUserProfile(profile);

      // Auto-register user if enabled
      if (autoRegister) {
        await registerUser(profile);
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err) {
      console.error('LIFF initialization error', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);

      if (redirectOnError) {
        router.push('/liff');
      }
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

  return {
    isLoading,
    isAuthenticated,
    userProfile,
    error,
    liff,
  };
}
