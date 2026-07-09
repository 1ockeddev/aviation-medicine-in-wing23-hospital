import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateDaysRemaining, formatDate, createExpirationFlexMessage } from './flex-messages';
import type { Medication, Category } from '@prisma/client';

describe('calculateDaysRemaining', () => {
  beforeEach(() => {
    // Mock current date to 2024-01-01
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate days remaining for a future date', () => {
    const expirationDate = new Date('2024-01-15');
    const result = calculateDaysRemaining(expirationDate);
    expect(result).toBe(14);
  });

  it('should return 0 for today\'s date', () => {
    const expirationDate = new Date('2024-01-01');
    const result = calculateDaysRemaining(expirationDate);
    expect(result).toBe(0);
  });

  it('should return negative value for past dates', () => {
    const expirationDate = new Date('2023-12-25');
    const result = calculateDaysRemaining(expirationDate);
    expect(result).toBeLessThan(0);
  });

  it('should round up partial days to next integer', () => {
    // Set time to middle of the day
    vi.setSystemTime(new Date('2024-01-01T12:00:00.000Z'));
    const expirationDate = new Date('2024-01-02T06:00:00.000Z');
    const result = calculateDaysRemaining(expirationDate);
    // 18 hours = 0.75 days, should round up to 1
    expect(result).toBe(1);
  });

  it('should handle dates far in the future', () => {
    const expirationDate = new Date('2024-12-31');
    const result = calculateDaysRemaining(expirationDate);
    expect(result).toBe(365);
  });

  it('should handle leap year calculations', () => {
    vi.setSystemTime(new Date('2024-02-28T00:00:00.000Z'));
    const expirationDate = new Date('2024-03-01');
    const result = calculateDaysRemaining(expirationDate);
    // 2024 is a leap year, so Feb 29 exists
    expect(result).toBe(2);
  });
});

describe('formatDate', () => {
  it('should format date in Thai locale with full format', () => {
    const date = new Date('2024-01-15');
    const result = formatDate(date);
    // Thai Buddhist Era year is 543 years ahead: 2024 + 543 = 2567
    expect(result).toContain('2567');
    expect(result).toContain('มกราคม'); // January in Thai
    expect(result).toContain('15');
  });

  it('should format different months correctly', () => {
    const date = new Date('2024-06-20');
    const result = formatDate(date);
    expect(result).toContain('มิถุนายน'); // June in Thai
    expect(result).toContain('2567');
    expect(result).toContain('20');
  });

  it('should format December dates correctly', () => {
    const date = new Date('2024-12-31');
    const result = formatDate(date);
    expect(result).toContain('ธันวาคม'); // December in Thai
    expect(result).toContain('2567');
    expect(result).toContain('31');
  });

  it('should format first day of month correctly', () => {
    const date = new Date('2024-03-01');
    const result = formatDate(date);
    expect(result).toContain('มีนาคม'); // March in Thai
    expect(result).toContain('1');
    expect(result).not.toContain('01'); // Should be '1', not '01'
  });

  it('should handle dates from different years', () => {
    const date = new Date('2023-05-10');
    const result = formatDate(date);
    expect(result).toContain('2566'); // 2023 + 543
    expect(result).toContain('พฤษภาคม'); // May in Thai
    expect(result).toContain('10');
  });

  it('should format date objects consistently', () => {
    const date1 = new Date('2024-07-04T10:30:00');
    const date2 = new Date('2024-07-04T22:45:00');
    const result1 = formatDate(date1);
    const result2 = formatDate(date2);
    // Both should produce the same date string regardless of time
    expect(result1).toBe(result2);
  });
});

describe('createExpirationFlexMessage', () => {
  beforeEach(() => {
    // Mock current date to 2024-01-01 for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    
    // Mock environment variable
    process.env.NEXT_PUBLIC_APP_URL = 'https://test-app.com';
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  const createMockCategory = (id: string, name: string): Category => ({
    id,
    name,
    parentId: null,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createMockMedication = (
    id: string,
    name: string,
    categoryId: string,
    expirationDate: Date,
    category: Category
  ): Medication & { category: Category } => ({
    id,
    name,
    categoryId,
    expirationDate,
    status: 'Y',
    createdAt: new Date(),
    updatedAt: new Date(),
    category,
  });

  it('should create flex message with header containing title and medication count', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
      createMockMedication('2', 'Ibuprofen', 'cat1', new Date('2024-01-15'), category),
    ];

    const result = createExpirationFlexMessage(medications);

    expect(result.type).toBe('flex');
    expect(result.altText).toBe('ยาใกล้หมดอายุ 2 รายการ');
    expect(result.contents.header.contents[0].text).toBe('⚠️ ยาใกล้หมดอายุ');
    expect(result.contents.header.contents[1].text).toBe('2 รายการ');
  });

  it('should create body with medication items containing all required information', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const bodyContents = result.contents.body.contents[0].contents;

    // Check medication name
    expect(bodyContents[0].text).toBe('Paracetamol');
    expect(bodyContents[0].weight).toBe('bold');

    // Check category
    expect(bodyContents[1].text).toBe('หมวดหมู่: ยาแก้ปวด');

    // Check expiration date (Thai format)
    expect(bodyContents[2].text).toContain('หมดอายุ:');
    expect(bodyContents[2].text).toContain('2567'); // Buddhist year

    // Check days remaining
    expect(bodyContents[3].text).toBe('เหลืออีก 9 วัน');
  });

  it('should create footer with "ดูรายละเอียดเพิ่มเติม" button linking to app URL', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const footer = result.contents.footer.contents[0];

    expect(footer.type).toBe('button');
    expect(footer.action.label).toBe('ดูรายละเอียดเพิ่มเติม');
    expect(footer.action.uri).toBe('https://test-app.com');
  });

  it('should use fallback URL when NEXT_PUBLIC_APP_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const footer = result.contents.footer.contents[0];

    expect(footer.action.uri).toBe('https://your-app-url.com');
  });

  it('should format dates using Thai locale', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-06-15'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const expirationText = result.contents.body.contents[0].contents[2].text;

    expect(expirationText).toContain('มิถุนายน'); // June in Thai
    expect(expirationText).toContain('2567'); // Buddhist year
  });

  it('should handle multiple medications with different categories', () => {
    const category1 = createMockCategory('cat1', 'ยาแก้ปวด');
    const category2 = createMockCategory('cat2', 'ยาแก้ไข้');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category1),
      createMockMedication('2', 'Aspirin', 'cat2', new Date('2024-01-15'), category2),
      createMockMedication('3', 'Ibuprofen', 'cat1', new Date('2024-01-20'), category1),
    ];

    const result = createExpirationFlexMessage(medications);

    expect(result.altText).toBe('ยาใกล้หมดอายุ 3 รายการ');
    expect(result.contents.body.contents).toHaveLength(3);
    
    // Verify each medication has correct category
    expect(result.contents.body.contents[0].contents[1].text).toBe('หมวดหมู่: ยาแก้ปวด');
    expect(result.contents.body.contents[1].contents[1].text).toBe('หมวดหมู่: ยาแก้ไข้');
    expect(result.contents.body.contents[2].contents[1].text).toBe('หมวดหมู่: ยาแก้ปวด');
  });

  it('should calculate correct days remaining for each medication', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Med1', 'cat1', new Date('2024-01-05'), category),
      createMockMedication('2', 'Med2', 'cat1', new Date('2024-01-15'), category),
      createMockMedication('3', 'Med3', 'cat1', new Date('2024-02-01'), category),
    ];

    const result = createExpirationFlexMessage(medications);

    expect(result.contents.body.contents[0].contents[3].text).toBe('เหลืออีก 4 วัน');
    expect(result.contents.body.contents[1].contents[3].text).toBe('เหลืออีก 14 วัน');
    expect(result.contents.body.contents[2].contents[3].text).toBe('เหลืออีก 31 วัน');
  });

  it('should apply correct styling to header', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const header = result.contents.header;

    expect(header.backgroundColor).toBe('#e53e3e');
    expect(header.paddingAll).toBe('20px');
    expect(header.contents[0].color).toBe('#ffffff');
    expect(header.contents[0].weight).toBe('bold');
    expect(header.contents[0].size).toBe('xl');
  });

  it('should apply correct styling to body medication items', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const medBox = result.contents.body.contents[0];

    expect(medBox.backgroundColor).toBe('#f0f6fa');
    expect(medBox.cornerRadius).toBe('8px');
    expect(medBox.paddingAll).toBe('10px');
    expect(medBox.margin).toBe('md');
  });

  it('should apply correct styling to footer button', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const button = result.contents.footer.contents[0];

    expect(button.style).toBe('primary');
    expect(button.color).toBe('#61a4ca');
  });

  it('should handle single medication correctly', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);

    expect(result.altText).toBe('ยาใกล้หมดอายุ 1 รายการ');
    expect(result.contents.header.contents[1].text).toBe('1 รายการ');
    expect(result.contents.body.contents).toHaveLength(1);
  });

  it('should maintain proper flex message structure', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);

    // Verify top-level structure
    expect(result.type).toBe('flex');
    expect(result.contents.type).toBe('bubble');

    // Verify sections exist
    expect(result.contents.header).toBeDefined();
    expect(result.contents.body).toBeDefined();
    expect(result.contents.footer).toBeDefined();

    // Verify box layouts
    expect(result.contents.header.type).toBe('box');
    expect(result.contents.header.layout).toBe('vertical');
    expect(result.contents.body.type).toBe('box');
    expect(result.contents.body.layout).toBe('vertical');
    expect(result.contents.footer.type).toBe('box');
    expect(result.contents.footer.layout).toBe('vertical');
  });
});
