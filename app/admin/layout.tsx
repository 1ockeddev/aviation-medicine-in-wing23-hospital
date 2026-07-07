'use client';

import { ReactNode, useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Header onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />
      <main className="lg:ml-64 pt-14 sm:pt-16">
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
