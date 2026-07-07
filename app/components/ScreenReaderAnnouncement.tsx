/**
 * ScreenReaderAnnouncement Component
 * 
 * Provides a visually hidden live region for announcing accordion state changes
 * to screen reader users. Announces in Thai when categories are expanded or collapsed.
 * 
 * Features:
 * - Visually hidden div with role="status" and aria-live="polite"
 * - Thai language announcements
 * - Polite announcements that don't interrupt current speech
 * 
 * Requirements: 9.5
 */

import React from 'react';

interface ScreenReaderAnnouncementProps {
  /** Message to announce to screen readers */
  message: string;
}

/**
 * ScreenReaderAnnouncement - Live region for screen reader state announcements
 * 
 * This component creates a visually hidden div that screen readers will
 * announce when the content changes. Uses aria-live="polite" to avoid
 * interrupting the user's current reading.
 * 
 * @example
 * ```tsx
 * <ScreenReaderAnnouncement 
 *   message="หมวดหมู่ขยายแล้ว" 
 * />
 * ```
 */
export function ScreenReaderAnnouncement({
  message,
}: ScreenReaderAnnouncementProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
