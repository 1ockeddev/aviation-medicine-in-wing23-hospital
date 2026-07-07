/**
 * MedicationList Component
 * 
 * Displays medications within an expanded category accordion item.
 * 
 * Features:
 * - Displays medications in alphabetical order by name
 * - Shows medication name (primary), trade name (secondary), status, and half-life
 * - Applies design system colors
 * - Highlights search terms
 * - Empty state for categories with no medications
 */

import React from 'react';
import type { Medication } from '@prisma/client';
import { highlightSearchTerm } from '@/lib/user-accordion-helpers';
import { USER_COLORS, STATUS_COLORS } from '@/lib/user-colors';

interface MedicationListProps {
  medications: Medication[];
  searchQuery: string;
  categoryId: string;
  onMedicationClick?: (medication: Medication) => void;
  selectedMedicationId?: string;
}

export function MedicationList({
  medications,
  searchQuery,
  categoryId,
  onMedicationClick,
  selectedMedicationId,
}: MedicationListProps) {
  // Filter medications that match the search query
  const filteredMedications = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return medications;
    }

    const query = searchQuery.toLowerCase().trim();
    return medications.filter(
      (med) =>
        med.name.toLowerCase().includes(query) ||
        (med.tradeName && med.tradeName.toLowerCase().includes(query))
    );
  }, [medications, searchQuery]);

  // Sort medications alphabetically by name
  const sortedMedications = React.useMemo(() => {
    return [...filteredMedications].sort((a, b) =>
      a.name.localeCompare(b.name, 'th')
    );
  }, [filteredMedications]);

  // Empty state: no medications in category
  if (sortedMedications.length === 0) {
    return (
      <div
        className="py-4 px-4 md:px-6 text-center text-gray-500 text-xs sm:text-sm md:text-base"
        role="status"
        aria-label="ไม่มียาในหมวดหมู่นี้"
      >
        ไม่มียาในหมวดหมู่นี้
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label={`รายการยาในหมวดหมู่ ${categoryId}`}
    >
      {sortedMedications.map((medication, index) => (
        <MedicationItem
          key={medication.id}
          medication={medication}
          searchQuery={searchQuery}
          onClick={onMedicationClick}
          isSelected={medication.id === selectedMedicationId}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}

/**
 * Individual medication item component - Simple view for list
 */
interface MedicationItemProps {
  medication: Medication;
  searchQuery: string;
  onClick?: (medication: Medication) => void;
  isSelected?: boolean;
  isFirst?: boolean;
}

function MedicationItem({ medication, searchQuery, onClick, isSelected = false, isFirst = false }: MedicationItemProps) {
  // Determine status color based on new status values
  const getStatusColor = (status: string) => {
    if (status === 'Y' || status === 'Y*') {
      return STATUS_COLORS.available; // Green
    } else if (status === 'N' || status === 'N*') {
      return STATUS_COLORS.unavailable; // Red
    } else if (status === 'ยาฉุกเฉิน') {
      return '#f97316'; // Orange for emergency medications
    } else {
      return STATUS_COLORS.notSpecified; // Gray for N/A, case by case, ≤20mg/day
    }
  };

  const statusColor = getStatusColor(medication.status);

  const handleClick = () => {
    if (onClick) {
      onClick(medication);
    }
  };

  return (
    <div
      className={`py-3 px-4 md:px-6 hover:bg-blue-50/50 transition-colors cursor-pointer touch-manipulation ${
        !isFirst ? 'border-t border-gray-200' : ''
      } ${
        isSelected ? 'bg-gradient-to-r from-[#ddebf4] to-[#bdd9e9] !border-l-4 !border-l-[#61a4ca]' : 'bg-white'
      }`}
      role="listitem"
      data-medication-item="true"
      onClick={handleClick}
    >
      {/* Medication name (primary text) */}
      <div
        className="font-medium text-xs sm:text-sm md:text-base mb-1"
        style={{ color: USER_COLORS.darkSlateBlue }}
      >
        {highlightSearchTerm(medication.name, searchQuery)}
      </div>

      {/* Trade name (secondary text) */}
      {medication.tradeName && (
        <div className="text-xs sm:text-sm mb-2" style={{ color: USER_COLORS.darkSlateBlue, opacity: 0.7 }}>
          ชื่อการค้า: {highlightSearchTerm(medication.tradeName, searchQuery)}
        </div>
      )}

      {/* Simple status badge */}
      <div className="flex items-center gap-1 sm:gap-2">
        <span
          className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: statusColor }}
          aria-hidden="true"
        />
        <span className="text-xs sm:text-sm font-medium" style={{ color: USER_COLORS.darkSlateBlue }}>
          {medication.status}
        </span>
      </div>
    </div>
  );
}
