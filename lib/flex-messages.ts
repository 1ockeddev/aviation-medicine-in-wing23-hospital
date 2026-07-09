import type { Medication, Category } from '@prisma/client';

/**
 * Flex Message utility functions for LINE notification system
 * 
 * This module provides helper functions for calculating expiration-related
 * information and formatting dates in Thai locale for LINE Flex Messages.
 */

type MedicationWithCategory = Medication & { category: Category };

/**
 * Calculates the number of days remaining until a medication expires
 * 
 * @param expirationDate - The expiration date of the medication
 * @returns The number of days remaining (positive integer, rounded up)
 * 
 * @example
 * // If today is 2024-01-01 and expiration is 2024-01-15
 * calculateDaysRemaining(new Date('2024-01-15')) // returns 14
 * 
 * **Validates: Requirements 9.3**
 */
export function calculateDaysRemaining(expirationDate: Date): number {
  const now = new Date();
  const expiration = new Date(expirationDate);
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formats a date in Thai locale with full format (e.g., "15 มกราคม 2567")
 * 
 * @param date - The date to format
 * @returns Formatted date string in Thai locale
 * 
 * @example
 * formatDate(new Date('2024-01-15')) // returns "15 มกราคม 2567"
 * 
 * **Validates: Requirements 9.1**
 */
export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Creates a Flex Message for expiring medications notification
 * 
 * @param medications - Array of medications with category information
 * @returns LINE Flex Message object
 * 
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
 */
export function createExpirationFlexMessage(medications: MedicationWithCategory[]) {
  const medicationContents = medications.map((med) => {
    const daysRemaining = calculateDaysRemaining(med.expirationDate!);
    const expirationDateStr = formatDate(med.expirationDate!);

    return {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: med.name,
          weight: 'bold',
          size: 'md',
          color: '#232e49',
        },
        {
          type: 'text',
          text: `หมวดหมู่: ${med.category.name}`,
          size: 'sm',
          color: '#666666',
        },
        {
          type: 'text',
          text: `หมดอายุ: ${expirationDateStr}`,
          size: 'sm',
          color: '#e53e3e',
        },
        {
          type: 'text',
          text: `เหลืออีก ${daysRemaining} วัน`,
          size: 'sm',
          color: '#e53e3e',
          weight: 'bold',
        },
      ],
      margin: 'md',
      paddingAll: '10px',
      backgroundColor: '#f0f6fa',
      cornerRadius: '8px',
    };
  });

  return {
    type: 'flex',
    altText: `ยาใกล้หมดอายุ ${medications.length} รายการ`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⚠️ ยาใกล้หมดอายุ',
            weight: 'bold',
            size: 'xl',
            color: '#ffffff',
          },
          {
            type: 'text',
            text: `${medications.length} รายการ`,
            size: 'sm',
            color: '#ffffff',
          },
        ],
        backgroundColor: '#e53e3e',
        paddingAll: '20px',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: medicationContents,
        paddingAll: '15px',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียดเพิ่มเติม',
              uri: process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com',
            },
            style: 'primary',
            color: '#61a4ca',
          },
        ],
        paddingAll: '15px',
      },
    },
  };
}
