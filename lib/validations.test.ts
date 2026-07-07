import { describe, it, expect } from 'vitest';
import { CategorySchema, MedicationSchema } from './validations';

describe('CategorySchema', () => {
  it('should validate a category with name only', () => {
    const result = CategorySchema.safeParse({
      name: 'ยาแก้ปวด',
      parentId: null,
    });
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('ยาแก้ปวด');
      expect(result.data.parentId).toBeNull();
    }
  });

  it('should validate a sub-category with valid parentId', () => {
    const validCuid = 'clh3x8w0p0000qj0x5y8z9w8y';
    const result = CategorySchema.safeParse({
      name: 'ยาแก้ปวดทั่วไป',
      parentId: validCuid,
    });
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('ยาแก้ปวดทั่วไป');
      expect(result.data.parentId).toBe(validCuid);
    }
  });

  it('should reject empty category name', () => {
    const result = CategorySchema.safeParse({
      name: '',
      parentId: null,
    });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('กรุณากรอกชื่อหมวดหมู่');
    }
  });

  it('should reject invalid CUID for parentId', () => {
    const result = CategorySchema.safeParse({
      name: 'ยาแก้ปวด',
      parentId: 'invalid-cuid',
    });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('parentId');
    }
  });

  it('should accept null parentId for top-level category', () => {
    const result = CategorySchema.safeParse({
      name: 'หมวดหมู่หลัก',
      parentId: null,
    });
    
    expect(result.success).toBe(true);
  });

  it('should reject missing name field', () => {
    const result = CategorySchema.safeParse({
      parentId: null,
    });
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name');
    }
  });
});

describe('MedicationSchema', () => {
  const validCuid = 'clh3x8w0p0000qj0x5y8z9w8y';

  describe('Required fields validation', () => {
    it('should validate medication with all required fields (Req 3.2, 9.2)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Aspirin');
        expect(result.data.fdaApproved).toBe('APPROVED');
        expect(result.data.categoryId).toBe(validCuid);
      }
    });

    it('should reject empty medication name (Req 3.2, 9.2)', () => {
      const result = MedicationSchema.safeParse({
        name: '',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณากรอกชื่อยา');
      }
    });

    it('should reject missing medication name', () => {
      const result = MedicationSchema.safeParse({
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('name'))).toBe(true);
      }
    });

    it('should validate categoryId as CUID (Req 3.2, 3.3)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Ibuprofen',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid CUID for categoryId (Req 3.3)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Ibuprofen',
        fdaApproved: 'APPROVED',
        categoryId: 'invalid-cuid',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('กรุณาเลือกหมวดหมู่ที่ถูกต้อง');
      }
    });
  });

  describe('FDA status enum validation', () => {
    it('should accept APPROVED status (Req 3.2, 3.7, 9.3)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Medication A',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fdaApproved).toBe('APPROVED');
      }
    });

    it('should accept NOT_APPROVED status (Req 3.2, 3.7, 9.3)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Medication B',
        fdaApproved: 'NOT_APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fdaApproved).toBe('NOT_APPROVED');
      }
    });

    it('should reject invalid FDA status (Req 3.7, 9.3)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Medication C',
        fdaApproved: 'PENDING',
        categoryId: validCuid,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('สถานะ FDA ต้องเป็น Approved หรือ Not Approved เท่านั้น');
      }
    });

    it('should reject missing FDA status', () => {
      const result = MedicationSchema.safeParse({
        name: 'Medication D',
        categoryId: validCuid,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('fdaApproved'))).toBe(true);
      }
    });
  });

  describe('Optional fields validation', () => {
    it('should accept optional tradeName (Req 3.2)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Ibuprofen',
        tradeName: 'Advil',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tradeName).toBe('Advil');
      }
    });

    it('should accept empty string for tradeName', () => {
      const result = MedicationSchema.safeParse({
        name: 'Ibuprofen',
        tradeName: '',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
    });

    it('should accept missing tradeName', () => {
      const result = MedicationSchema.safeParse({
        name: 'Ibuprofen',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
    });

    it('should accept optional halfLife (Req 3.2)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        halfLife: '2-3 hours',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.halfLife).toBe('2-3 hours');
      }
    });

    it('should accept empty string for halfLife', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        halfLife: '',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
    });

    it('should accept optional sideEffects (Req 3.2)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        sideEffects: 'May cause stomach upset',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sideEffects).toBe('May cause stomach upset');
      }
    });

    it('should accept empty string for sideEffects', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        sideEffects: '',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
    });

    it('should accept optional notes (Req 3.2)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        notes: 'Take with food',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toBe('Take with food');
      }
    });

    it('should accept empty string for notes', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        notes: '',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Date format validation', () => {
    it('should accept valid expiration date (Req 3.2, 3.8, 9.1)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        expirationDate: '2025-12-31',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expirationDate).toBeInstanceOf(Date);
      }
    });

    it('should accept Date object for expiration date', () => {
      const date = new Date('2025-12-31');
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        expirationDate: date,
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expirationDate).toBeInstanceOf(Date);
      }
    });

    it('should accept null for expiration date', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        expirationDate: null,
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expirationDate).toBeNull();
      }
    });

    it('should accept missing expiration date', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
    });

    it('should coerce string to Date for expiration date', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        expirationDate: '2024-06-15',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.expirationDate).toBeInstanceOf(Date);
        expect(result.data.expirationDate?.getFullYear()).toBe(2024);
      }
    });

    it('should reject invalid date format (Req 9.1)', () => {
      const result = MedicationSchema.safeParse({
        name: 'Aspirin',
        expirationDate: 'not-a-date',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('expirationDate'))).toBe(true);
      }
    });
  });

  describe('Complete medication with all fields', () => {
    it('should validate medication with all fields populated', () => {
      const result = MedicationSchema.safeParse({
        name: 'Ibuprofen',
        tradeName: 'Advil',
        expirationDate: '2025-12-31',
        fdaApproved: 'APPROVED',
        halfLife: '2-4 hours',
        sideEffects: 'Nausea, dizziness, stomach upset',
        notes: 'Take with food. Do not exceed recommended dosage.',
        categoryId: validCuid,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Ibuprofen');
        expect(result.data.tradeName).toBe('Advil');
        expect(result.data.expirationDate).toBeInstanceOf(Date);
        expect(result.data.fdaApproved).toBe('APPROVED');
        expect(result.data.halfLife).toBe('2-4 hours');
        expect(result.data.sideEffects).toBe('Nausea, dizziness, stomach upset');
        expect(result.data.notes).toBe('Take with food. Do not exceed recommended dosage.');
        expect(result.data.categoryId).toBe(validCuid);
      }
    });
  });
});
