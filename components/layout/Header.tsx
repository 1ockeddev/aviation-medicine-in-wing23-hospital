'use client';

import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { useTransition } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 lg:left-64 z-20">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between lg:justify-end">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100 touch-manipulation"
          aria-label="เปิด/ปิดเมนู"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        {/* Title on mobile, hidden on desktop */}
        <h1 className="text-sm font-semibold text-gray-900 lg:hidden">
          โรงพยาบาลกองบิน กองบิน 23
        </h1>

        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isPending}
          className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
        >
          {isPending ? 'กำลังออก...' : 'ออกจากระบบ'}
        </Button>
      </div>
    </header>
  );
}
