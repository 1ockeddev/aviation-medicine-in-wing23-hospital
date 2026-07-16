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
 * Based on the original design with dynamic data support
 * 
 * @param medications - Array of medications with category information
 * @returns LINE Flex Message object
 * 
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
 */
export function createExpirationFlexMessage(medications: MedicationWithCategory[]) {
  // Create bubbles for each medication (LINE supports carousel with multiple bubbles)
  const bubbles = medications.map((med) => {
    const daysRemaining = calculateDaysRemaining(med.expirationDate!);
    const expirationDateStr = formatDate(med.expirationDate!);
    
    // Get category hierarchy (parent → child → grandchild)
    const categoryPath = med.category.name;
    const categoryParts = categoryPath.split(' > ');
    
    // Build category boxes with different background colors for hierarchy
    const categoryBoxes: any[] = [];
    const bgColors = ['#FFF2CC', '#FFF9E6', '#FFFCF5'];
    const textColors = ['#222222', '#444444', '#666666'];
    const paddings = ['10px', '10px', '10px'];
    const paddingStarts = ['10px', '24px', '44px'];
    
    categoryParts.forEach((part, index) => {
      categoryBoxes.push({
        type: 'box',
        layout: 'vertical',
        backgroundColor: bgColors[index] || '#FFFCF5',
        paddingAll: paddings[index],
        paddingStart: paddingStarts[index],
        cornerRadius: '6px',
        margin: 'xs',
        contents: [
          {
            type: 'text',
            text: part,
            size: 'xs',
            color: textColors[index] || '#666666',
            weight: index === 0 ? 'bold' : 'regular',
            wrap: true,
            lineSpacing: '2px',
          },
        ],
      });
    });

    return {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'none',
        contents: [
          {
            type: 'image',
            url: 'https://images.pexels.com/photos/8855516/pexels-photo-8855516.jpeg',
            size: 'full',
            aspectMode: 'cover',
            aspectRatio: '5.3:1',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          // Alert icon + title
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'icon',
                url: 'https://www.svgrepo.com/show/402496/police-car-light.svg',
              },
              {
                type: 'text',
                text: 'แจ้งเตือนคลังยาหมดอายุ',
                color: '#DC3545',
                weight: 'bold',
                offsetStart: '5px',
              },
            ],
            margin: 'xs',
          },
          // Category hierarchy boxes
          ...categoryBoxes,
          // Medication name
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'lg',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: 'ชื่อยา',
                color: '#8C8C8C',
                size: 'sm',
                flex: 2,
              },
              {
                type: 'text',
                text: med.name,
                color: '#111111',
                size: 'sm',
                weight: 'bold',
                flex: 7,
                wrap: true,
              },
            ],
          },
          // Trade name (if available)
          ...(med.tradeName
            ? [
                {
                  type: 'box',
                  layout: 'horizontal',
                  margin: 'lg',
                  spacing: 'sm',
                  contents: [
                    {
                      type: 'text',
                      text: 'ชื่อการค้า',
                      color: '#8C8C8C',
                      size: 'sm',
                      flex: 2,
                    },
                    {
                      type: 'text',
                      text: med.tradeName,
                      color: '#111111',
                      size: 'sm',
                      weight: 'bold',
                      flex: 7,
                      wrap: true,
                    },
                  ],
                },
              ]
            : []),
          // Expiration date alert box
          {
            type: 'box',
            layout: 'vertical',
            margin: 'xl',
            backgroundColor: '#FDF2F2',
            paddingAll: '12px',
            cornerRadius: '8px',
            borderColor: '#F5C6CB',
            borderWidth: '1px',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                alignItems: 'center',
                spacing: 'xs',
                contents: [
                  {
                    type: 'text',
                    text: 'วันหมดอายุ',
                    size: 'md',
                    color: '#BD2130',
                    weight: 'bold',
                  },
                ],
              },
              {
                type: 'text',
                text: expirationDateStr,
                color: '#BD2130',
                wrap: true,
                size: 'xs',
              },
              {
                type: 'text',
                text: `(เหลืออีก ${daysRemaining} วัน)`,
                color: '#BD2130',
                wrap: true,
                size: 'xs',
                margin: 'xs',
              },
            ],
          },
        ],
        paddingAll: '20px',
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'button',
            style: 'primary',
            height: 'sm',
            action: {
              type: 'uri',
              label: 'ดูรายละเอียดเพิ่มเติม',
              uri: `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-url.com'}?search=${encodeURIComponent(med.name)}&medicationId=${med.id}`,
            },
            color: '#007BFF',
          },
        ],
        paddingAll: '16px',
        paddingTop: '0px',
      },
    };
  });

  // If multiple medications, return carousel; otherwise return single bubble
  if (bubbles.length === 1) {
    return {
      type: 'flex',
      altText: `แจ้งเตือนยา ${medications[0].name} ใกล้หมดอายุ`,
      contents: bubbles[0],
    };
  }

  return {
    type: 'flex',
    altText: `แจ้งเตือนยาใกล้หมดอายุ ${medications.length} รายการ`,
    contents: {
      type: 'carousel',
      contents: bubbles,
    },
  };
}
