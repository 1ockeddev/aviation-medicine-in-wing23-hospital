import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createExpirationFlexMessage } from './flex-messages';
import type { Medication, Category } from '@prisma/client';

describe('createExpirationFlexMessage - URI with Query Parameters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
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
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createMockMedication = (
    id: string,
    name: string,
    categoryId: string,
    expirationDate: Date,
    category: Category,
    tradeName?: string
  ): Medication & { category: Category } => ({
    id,
    name,
    tradeName: tradeName || null,
    categoryId,
    expirationDate,
    status: 'Y',
    halfLife: null,
    sideEffects: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    category,
  });

  it('should include medication name and ID in URI for single medication', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('med-123', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);

    // Single medication returns a bubble directly
    const footer = result.contents.footer;
    const button = footer.contents[0];

    expect(button.action.uri).toBe('https://test-app.com?search=Paracetamol&medicationId=med-123');
  });

  it('should include medication name and ID in URI for each medication in carousel', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('med-1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
      createMockMedication('med-2', 'Ibuprofen', 'cat1', new Date('2024-01-15'), category),
      createMockMedication('med-3', 'Aspirin', 'cat1', new Date('2024-01-20'), category),
    ];

    const result = createExpirationFlexMessage(medications);

    // Multiple medications return a carousel
    expect(result.contents.type).toBe('carousel');
    const bubbles = result.contents.contents;

    // Check first medication
    expect(bubbles[0].footer.contents[0].action.uri).toBe(
      'https://test-app.com?search=Paracetamol&medicationId=med-1'
    );

    // Check second medication
    expect(bubbles[1].footer.contents[0].action.uri).toBe(
      'https://test-app.com?search=Ibuprofen&medicationId=med-2'
    );

    // Check third medication
    expect(bubbles[2].footer.contents[0].action.uri).toBe(
      'https://test-app.com?search=Aspirin&medicationId=med-3'
    );
  });

  it('should properly encode medication names with special characters', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication(
        'med-1',
        'Medication & Drug+',
        'cat1',
        new Date('2024-01-10'),
        category
      ),
    ];

    const result = createExpirationFlexMessage(medications);
    const button = result.contents.footer.contents[0];

    // Special characters should be URL encoded
    expect(button.action.uri).toContain('search=Medication%20%26%20Drug%2B');
    expect(button.action.uri).toContain('medicationId=med-1');
  });

  it('should properly encode Thai medication names', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication(
        'med-1',
        'พาราเซตามอล',
        'cat1',
        new Date('2024-01-10'),
        category
      ),
    ];

    const result = createExpirationFlexMessage(medications);
    const button = result.contents.footer.contents[0];

    // Thai characters should be URL encoded
    expect(button.action.uri).toContain('search=%E0%B8%9E%E0%B8%B2%E0%B8%A3%E0%B8%B2%E0%B9%80%E0%B8%8B%E0%B8%95%E0%B8%B2%E0%B8%A1%E0%B8%AD%E0%B8%A5');
    expect(button.action.uri).toContain('medicationId=med-1');
  });

  it('should use fallback URL when NEXT_PUBLIC_APP_URL is not set', () => {
    delete process.env.NEXT_PUBLIC_APP_URL;

    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('med-1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const button = result.contents.footer.contents[0];

    expect(button.action.uri).toContain('https://your-app-url.com?search=Paracetamol&medicationId=med-1');
  });

  it('should handle medications with IDs containing special characters', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication(
        'med-id-123-abc',
        'Paracetamol',
        'cat1',
        new Date('2024-01-10'),
        category
      ),
    ];

    const result = createExpirationFlexMessage(medications);
    const button = result.contents.footer.contents[0];

    // ID should be included as-is (not encoded since it's in query value)
    expect(button.action.uri).toBe('https://test-app.com?search=Paracetamol&medicationId=med-id-123-abc');
  });

  it('should include both search and medicationId parameters in correct order', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('med-1', 'Test Medicine', 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const button = result.contents.footer.contents[0];

    // Check parameter order
    expect(button.action.uri).toMatch(/\?search=.*&medicationId=.*/);
    expect(button.action.uri).toContain('search=Test%20Medicine');
    expect(button.action.uri).toContain('medicationId=med-1');
  });

  it('should handle very long medication names', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const longName = 'A'.repeat(200);
    const medications = [
      createMockMedication('med-1', longName, 'cat1', new Date('2024-01-10'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const button = result.contents.footer.contents[0];

    // Should include the full encoded name
    expect(button.action.uri).toContain(`search=${encodeURIComponent(longName)}`);
    expect(button.action.uri).toContain('medicationId=med-1');
  });

  it('should create different URIs for medications with same name but different IDs', () => {
    const category = createMockCategory('cat1', 'ยาแก้ปวด');
    const medications = [
      createMockMedication('med-1', 'Paracetamol', 'cat1', new Date('2024-01-10'), category),
      createMockMedication('med-2', 'Paracetamol', 'cat1', new Date('2024-01-15'), category),
    ];

    const result = createExpirationFlexMessage(medications);
    const bubbles = result.contents.contents;

    const uri1 = bubbles[0].footer.contents[0].action.uri;
    const uri2 = bubbles[1].footer.contents[0].action.uri;

    // Same search parameter but different medicationId
    expect(uri1).toContain('search=Paracetamol');
    expect(uri2).toContain('search=Paracetamol');
    expect(uri1).toContain('medicationId=med-1');
    expect(uri2).toContain('medicationId=med-2');
    expect(uri1).not.toBe(uri2);
  });
});
