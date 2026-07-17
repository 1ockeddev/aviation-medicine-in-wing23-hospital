'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'ยา',
    href: '/admin/medications',
    icon: '💊',
  },
  {
    label: 'หมวดหมู่',
    href: '/admin/categories',
    icon: '📋',
  },
  {
    label: 'LINE Users',
    href: '/admin/line-users',
    icon: '👥',
  },
  {
    label: 'ฐานข้อมูล',
    href: '/admin/database',
    icon: '💾',
  },
];

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Navigation({ isOpen, onClose }: NavigationProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onClose}
        />
      )}

      {/* Navigation Sidebar */}
      <nav
        className={cn(
          'w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out',
          // Mobile: slide in/out
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-6">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            ยาการบินพลอากาศ
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            โรงพยาบาลกองบิน กองบิน 23
          </p>
        </div>

        <div className="px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors touch-manipulation',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
