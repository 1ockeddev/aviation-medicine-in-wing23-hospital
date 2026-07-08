'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Medication, Category } from '@prisma/client';
import { CategoryAccordion } from '@/app/components/CategoryAccordion';
import { ScreenReaderAnnouncement } from '@/app/components/ScreenReaderAnnouncement';
import { useUserAccordionState } from '@/hooks/useUserAccordionState';
import { filterCategoriesWithSearch, extractCategoryIds } from '@/lib/user-accordion-helpers';
import type { CategoryWithMedicationCount } from '@/lib/user-accordion-helpers';

type MedicationWithCategory = Medication & {
  category: Category;
};

interface HomeClientPageProps {
  medications: MedicationWithCategory[];
  categories: CategoryWithMedicationCount[];
}

export function HomeClientPage({ medications, categories }: HomeClientPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [screenReaderMessage, setScreenReaderMessage] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<MedicationWithCategory | null>(null);
  
  // Ref for the detail section (for auto-scroll on mobile)
  const detailRef = useRef<HTMLDivElement>(null);

  // Accordion state management
  const {
    expandedCategories,
    toggleCategory,
    expandCategories,
  } = useUserAccordionState();

  // Filter categories based on search query (no popular categories, just filtered list)
  const filteredCategories = useMemo(() => {
    return filterCategoriesWithSearch(categories, medications, searchQuery);
  }, [categories, medications, searchQuery]);

  // Auto-expand matching categories when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingCategoryIds = extractCategoryIds(filteredCategories);
      expandCategories(matchingCategoryIds);
    }
    // Don't collapse all when search is empty - let user manage accordion state manually
  }, [searchQuery, filteredCategories, expandCategories]);

  // Handle accordion toggle with screen reader announcement
  const handleToggleCategory = React.useCallback(
    (categoryId: string) => {
      // Check if category is currently expanded
      const wasExpanded = expandedCategories.has(categoryId);
      
      // Toggle the category
      toggleCategory(categoryId);
      
      // Update screen reader announcement
      const message = wasExpanded ? 'หมวดหมู่ยุบแล้ว' : 'หมวดหมู่ขยายแล้ว';
      setScreenReaderMessage(message);
      
      // Clear the message after a short delay to allow for repeated announcements
      setTimeout(() => setScreenReaderMessage(''), 100);
    },
    [expandedCategories, toggleCategory]
  );

  // Handle medication selection
  const handleMedicationClick = React.useCallback((medication: Medication) => {
    // Find full medication with category from medications array
    const fullMedication = medications.find(m => m.id === medication.id);
    if (fullMedication) {
      setSelectedMedication(fullMedication);
      
      // Auto-scroll to detail section on mobile/tablet (< 1024px for lg breakpoint)
      if (typeof window !== 'undefined' && window.innerWidth < 1024 && detailRef.current) {
        // Small delay to ensure state update completes
        setTimeout(() => {
          detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [medications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 relative overflow-hidden">
        {/* Background Video (lowest layer) */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/bg/7317304-uhd_3840_2160_25fps.mp4" type="video/mp4" />
        </video>

        {/* AlphaJet Animation (middle layer) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/bg/alphajet-01.png"
            alt="AlphaJet"
            width={1200}
            height={392}
            className="absolute animate-fly-across opacity-60 w-[180px] h-auto sm:w-[270px] lg:w-[360px]"
            style={{
              right: '10%',
            }}
          />
        </div>

        {/* Dot Grid Pattern Background (top layer) */}
        <div 
          className="absolute inset-0 opacity-[0.15] z-[1]"
          style={{
            backgroundImage: `radial-gradient(circle, #61a4ca 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          {/* Top Row: Logo, Title, and Admin Button */}
          <div className="flex items-center justify-between gap-4 mb-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex-shrink-0">
                <Image
                  src="/wing23-logo.png"
                  alt="Wing 23 Hospital Logo"
                  fill
                  className="object-contain rounded-lg"
                  priority
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#232e49]" style={{ textShadow: '0 0 12px rgba(255, 255, 255, 1), 0 0 24px rgba(255, 255, 255, 0.9), 0 2px 8px rgba(255, 255, 255, 1), 0 4px 16px rgba(255, 255, 255, 0.8)' }}>
                  Aviation Medicine in Wing23 Hospital
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5" style={{ textShadow: '0 0 8px rgba(255, 255, 255, 1), 0 0 16px rgba(255, 255, 255, 0.9), 0 2px 6px rgba(255, 255, 255, 1)' }}>
                  โรงพยาบาลกองบิน กองบิน 23
                </p>
              </div>
            </div>

          </div>

          {/* Search Input */}
          <div className="relative max-w-3xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#61a4ca]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              id="search"
              className="w-full pl-10 pr-4 py-2.5 bg-[#f0f6fa] border border-transparent rounded-xl focus:bg-white focus:border-[#61a4ca] focus:ring-2 focus:ring-[#bdd9e9] transition-all outline-none text-base text-[#232e49] placeholder-[#232e49]/50"
              placeholder="กรอกชื่อยา, ชื่อการค้า หรือหมวดหมู่ที่ต้องการค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Category List */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              หมวดหมู่ทั้งหมด
            </h2>
            <CategoryAccordion
              categories={filteredCategories}
              expandedCategories={expandedCategories}
              onToggle={handleToggleCategory}
              searchQuery={searchQuery}
              medications={medications}
              onMedicationClick={handleMedicationClick}
              selectedMedicationId={selectedMedication?.id}
            />
          </div>

          {/* Right Column: Medication Detail */}
          <div ref={detailRef} className="lg:sticky lg:top-6 lg:self-start">
            {selectedMedication ? (
              <div className="space-y-4">
                {/* Main Info Card with Top Border */}
                <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md border-t-4 border-[#61a4ca] space-y-4">
                  {/* Category and Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 bg-[#ddebf4] text-[#232e49] rounded-md">
                      {selectedMedication.category.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600">
                        FAA Approval:
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                        selectedMedication.status === 'Y' || selectedMedication.status === 'Y*'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : selectedMedication.status === 'N' || selectedMedication.status === 'N*'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : selectedMedication.status === 'ยาฉุกเฉิน'
                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        <span className="relative inline-flex">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedMedication.status === 'Y' || selectedMedication.status === 'Y*'
                              ? 'bg-green-500'
                              : selectedMedication.status === 'N' || selectedMedication.status === 'N*'
                              ? 'bg-red-500'
                              : selectedMedication.status === 'ยาฉุกเฉิน'
                              ? 'bg-orange-500'
                              : 'bg-gray-500'
                          }`}></span>
                          <span className={`absolute inset-0 rounded-full animate-radio-ripple ${
                            selectedMedication.status === 'Y' || selectedMedication.status === 'Y*'
                              ? 'bg-green-500'
                              : selectedMedication.status === 'N' || selectedMedication.status === 'N*'
                              ? 'bg-red-500'
                              : selectedMedication.status === 'ยาฉุกเฉิน'
                              ? 'bg-orange-500'
                              : 'bg-gray-500'
                          }`}></span>
                        </span>
                        {selectedMedication.status}
                      </span>
                    </div>
                  </div>

                  {/* Medication Name */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#232e49]">
                      {selectedMedication.name}
                    </h2>
                    {selectedMedication.tradeName && (
                      <p className="text-sm text-gray-500 mt-1">
                        ชื่อการค้า: <span className="px-1 font-semibold text-gray-900">{selectedMedication.tradeName}</span>
                      </p>
                    )}
                  </div>

                  {/* Expiration Date */}
                  {selectedMedication.expirationDate && (
                    <div className="p-3 bg-gray-50 rounded-md text-xs sm:text-sm text-gray-600">
                      <strong>วันหมดอายุ:</strong>{' '}
                      {new Date(selectedMedication.expirationDate).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  )}
                </div>

                {/* Detailed Information Card */}
                <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md space-y-4">
                  {/* Half Life */}
                  {selectedMedication.halfLife && (
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="font-bold text-sm sm:text-base text-[#232e49] flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-[#61a4ca]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        HL
                      </h3>
                      <p className="pl-7 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMedication.halfLife}</p>
                    </div>
                  )}

                  {/* Side Effects */}
                  {selectedMedication.sideEffects && (
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="font-bold text-sm sm:text-base text-[#232e49] flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-[#61a4ca]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        SE
                      </h3>
                      <p className="pl-7 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMedication.sideEffects}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedMedication.notes && (
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="font-bold text-sm sm:text-base text-[#232e49] flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-[#61a4ca]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        หมายเหตุ
                      </h3>
                      <p className="pl-7 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMedication.notes}</p>
                    </div>
                  )}

                  {/* Aviation Medicine Note */}
                  <div className="bg-blue-50/50 p-4 rounded-lg border border-[#99c4dd]/40">
                    <h3 className="font-bold text-sm sm:text-base text-[#232e49] flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      ข้อแนะนำด้านเวชศาสตร์การบิน
                    </h3>
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                      รายละเอียดและข้อควรระวังเกี่ยวกับเวชศาสตร์การบินจะแสดงผลในบริเวณนี้
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-[#61a4ca] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[#232e49]/70 font-semibold text-base mb-2">
                    กรุณาเลือกหรือค้นหาชื่อยาเพื่อดูรายละเอียด
                  </p>
                  <p className="text-xs text-gray-500">
                    รายละเอียดและข้อควรระวังเกี่ยวกับเวชศาสตร์การบินจะแสดงผลในบริเวณนี้
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Screen Reader Announcement for Accordion State Changes */}
      <ScreenReaderAnnouncement message={screenReaderMessage} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <p className="text-xs sm:text-sm text-center text-gray-600">
            © 2026 Aviation Medicine in Wing23 Hospital. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
