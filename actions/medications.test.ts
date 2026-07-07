import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMedication, updateMedication, deleteMedication } from './medications';
import type { ActionState } from '@/types';

// Mock modules
vi.mock('@/lib/prisma', () => ({
  prisma: {
    medication: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

describe('createMedication', () => {
  const validCuid = 'clh3x8w0p0000qj0x5y8z9w8y';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful creation with valid data (Req 3.3, 3.4)', () => {
    it('should create medication with required fields only', async () => {
      // Mock authenticated session
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockMedication = {
        id: 'med123',
        name: 'Aspirin',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      };
      
      vi.mocked(prisma.medication.create).mockResolvedValue(mockMedication as any);

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      try {
        await createMedication(undefined, formData);
      } catch (error: any) {
        // Expect redirect
        expect(error.message).toBe('REDIRECT:/medications/med123');
      }

      expect(prisma.medication.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Aspirin',
          fdaApproved: 'APPROVED',
          categoryId: validCuid,
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/medications');
    });

    it('should create medication with all fields populated', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockMedication = {
        id: 'med456',
        name: 'Ibuprofen',
        tradeName: 'Advil',
        expirationDate: new Date('2025-12-31'),
        fdaApproved: 'APPROVED',
        halfLife: '2-4 hours',
        sideEffects: 'Nausea, dizziness',
        notes: 'Take with food',
        categoryId: validCuid,
      };
      
      vi.mocked(prisma.medication.create).mockResolvedValue(mockMedication as any);

      const formData = new FormData();
      formData.append('name', 'Ibuprofen');
      formData.append('tradeName', 'Advil');
      formData.append('expirationDate', '2025-12-31');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('halfLife', '2-4 hours');
      formData.append('sideEffects', 'Nausea, dizziness');
      formData.append('notes', 'Take with food');
      formData.append('categoryId', validCuid);

      try {
        await createMedication(undefined, formData);
      } catch (error: any) {
        expect(error.message).toBe('REDIRECT:/medications/med456');
      }

      expect(prisma.medication.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Ibuprofen',
          tradeName: 'Advil',
          fdaApproved: 'APPROVED',
          halfLife: '2-4 hours',
          sideEffects: 'Nausea, dizziness',
          notes: 'Take with food',
          categoryId: validCuid,
        }),
      });
    });
  });

  describe('validation error handling for required fields (Req 3.3, 3.5)', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
    });

    it('should reject empty medication name', async () => {
      const formData = new FormData();
      formData.append('name', '');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      const result = await createMedication(undefined, formData);

      expect(result.error).toBe('กรุณากรอกชื่อยา');
      expect(prisma.medication.create).not.toHaveBeenCalled();
    });

    it('should reject missing medication name', async () => {
      const formData = new FormData();
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      const result = await createMedication(undefined, formData);

      expect(result.error).toBeTruthy();
      expect(prisma.medication.create).not.toHaveBeenCalled();
    });

    it('should reject invalid categoryId', async () => {
      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', 'invalid-cuid');

      const result = await createMedication(undefined, formData);

      expect(result.error).toBe('กรุณาเลือกหมวดหมู่ที่ถูกต้อง');
      expect(prisma.medication.create).not.toHaveBeenCalled();
    });

    it('should reject missing categoryId', async () => {
      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');

      const result = await createMedication(undefined, formData);

      expect(result.error).toBeTruthy();
      expect(prisma.medication.create).not.toHaveBeenCalled();
    });
  });

  describe('validation error handling for invalid dates (Req 3.5, 3.8)', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
    });

    it('should reject invalid date format', async () => {
      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('expirationDate', 'not-a-date');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      const result = await createMedication(undefined, formData);

      expect(result.error).toBeTruthy();
      expect(prisma.medication.create).not.toHaveBeenCalled();
    });

    it('should accept valid date format', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.medication.create).mockResolvedValue({ id: 'med789' } as any);

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('expirationDate', '2025-12-31');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      try {
        await createMedication(undefined, formData);
      } catch (error: any) {
        expect(error.message).toBe('REDIRECT:/medications/med789');
      }

      expect(prisma.medication.create).toHaveBeenCalled();
    });

    it('should accept empty string for optional expirationDate', async () => {
      vi.mocked(prisma.medication.create).mockResolvedValue({ id: 'med790' } as any);

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('expirationDate', '');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      try {
        await createMedication(undefined, formData);
      } catch (error: any) {
        expect(error.message).toBe('REDIRECT:/medications/med790');
      }

      expect(prisma.medication.create).toHaveBeenCalled();
    });
  });

  describe('validation error handling for FDA status (Req 3.5, 3.7)', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
    });

    it('should reject invalid FDA status', async () => {
      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'PENDING');
      formData.append('categoryId', validCuid);

      const result = await createMedication(undefined, formData);

      expect(result.error).toBe('สถานะ FDA ต้องเป็น Approved หรือ Not Approved เท่านั้น');
      expect(prisma.medication.create).not.toHaveBeenCalled();
    });

    it('should accept APPROVED status', async () => {
      vi.mocked(prisma.medication.create).mockResolvedValue({ id: 'med791' } as any);

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      try {
        await createMedication(undefined, formData);
      } catch (error: any) {
        expect(error.message).toBe('REDIRECT:/medications/med791');
      }

      expect(prisma.medication.create).toHaveBeenCalled();
    });

    it('should accept NOT_APPROVED status', async () => {
      vi.mocked(prisma.medication.create).mockResolvedValue({ id: 'med792' } as any);

      const formData = new FormData();
      formData.append('name', 'Experimental Drug');
      formData.append('fdaApproved', 'NOT_APPROVED');
      formData.append('categoryId', validCuid);

      try {
        await createMedication(undefined, formData);
      } catch (error: any) {
        expect(error.message).toBe('REDIRECT:/medications/med792');
      }

      expect(prisma.medication.create).toHaveBeenCalled();
    });

    it('should reject missing FDA status', async () => {
      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('categoryId', validCuid);

      const result = await createMedication(undefined, formData);

      expect(result.error).toBeTruthy();
      expect(prisma.medication.create).not.toHaveBeenCalled();
    });
  });

  describe('authorization checks (Req 3.3, 9.4)', () => {
    it('should reject unauthorized user', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      const result = await createMedication(undefined, formData);

      expect(result.error).toBe('ไม่ได้รับอนุญาต');
      expect(prisma.medication.create).not.toHaveBeenCalled();
    });

    it('should allow authorized user', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1', username: 'admin' } } as any);
      vi.mocked(prisma.medication.create).mockResolvedValue({ id: 'med793' } as any);

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      try {
        await createMedication(undefined, formData);
      } catch (error: any) {
        expect(error.message).toBe('REDIRECT:/medications/med793');
      }

      expect(prisma.medication.create).toHaveBeenCalled();
    });
  });

  describe('database error handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.medication.create).mockRejectedValue(new Error('Database error'));

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      const result = await createMedication(undefined, formData);

      expect(result.error).toBe('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    });
  });
});

describe('updateMedication', () => {
  const validCuid = 'clh3x8w0p0000qj0x5y8z9w8y';
  const medicationId = 'med123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful update operation (Req 5.3, 5.4)', () => {
    it('should update medication with valid data', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      
      const mockUpdatedMedication = {
        id: medicationId,
        name: 'Updated Aspirin',
        fdaApproved: 'APPROVED',
        categoryId: validCuid,
      };
      
      vi.mocked(prisma.medication.update).mockResolvedValue(mockUpdatedMedication as any);

      const formData = new FormData();
      formData.append('name', 'Updated Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      try {
        await updateMedication(medicationId, undefined, formData);
      } catch (error: any) {
        expect(error.message).toBe(`REDIRECT:/medications/${medicationId}`);
      }

      expect(prisma.medication.update).toHaveBeenCalledWith({
        where: { id: medicationId },
        data: expect.objectContaining({
          name: 'Updated Aspirin',
          fdaApproved: 'APPROVED',
          categoryId: validCuid,
        }),
      });
      expect(revalidatePath).toHaveBeenCalledWith('/medications');
      expect(revalidatePath).toHaveBeenCalledWith(`/medications/${medicationId}`);
    });

    it('should update medication with all fields', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.medication.update).mockResolvedValue({ id: medicationId } as any);

      const formData = new FormData();
      formData.append('name', 'Ibuprofen Updated');
      formData.append('tradeName', 'Advil Plus');
      formData.append('expirationDate', '2026-12-31');
      formData.append('fdaApproved', 'NOT_APPROVED');
      formData.append('halfLife', '3-5 hours');
      formData.append('sideEffects', 'Updated side effects');
      formData.append('notes', 'Updated notes');
      formData.append('categoryId', validCuid);

      try {
        await updateMedication(medicationId, undefined, formData);
      } catch (error: any) {
        expect(error.message).toBe(`REDIRECT:/medications/${medicationId}`);
      }

      expect(prisma.medication.update).toHaveBeenCalledWith({
        where: { id: medicationId },
        data: expect.objectContaining({
          name: 'Ibuprofen Updated',
          tradeName: 'Advil Plus',
          fdaApproved: 'NOT_APPROVED',
          halfLife: '3-5 hours',
          sideEffects: 'Updated side effects',
          notes: 'Updated notes',
          categoryId: validCuid,
        }),
      });
    });
  });

  describe('validation errors (Req 5.3, 5.5)', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
    });

    it('should reject empty medication name', async () => {
      const formData = new FormData();
      formData.append('name', '');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      const result = await updateMedication(medicationId, undefined, formData);

      expect(result.error).toBe('กรุณากรอกชื่อยา');
      expect(prisma.medication.update).not.toHaveBeenCalled();
    });

    it('should reject invalid categoryId', async () => {
      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', 'invalid-cuid');

      const result = await updateMedication(medicationId, undefined, formData);

      expect(result.error).toBe('กรุณาเลือกหมวดหมู่ที่ถูกต้อง');
      expect(prisma.medication.update).not.toHaveBeenCalled();
    });

    it('should reject invalid FDA status', async () => {
      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'INVALID');
      formData.append('categoryId', validCuid);

      const result = await updateMedication(medicationId, undefined, formData);

      expect(result.error).toBe('สถานะ FDA ต้องเป็น Approved หรือ Not Approved เท่านั้น');
      expect(prisma.medication.update).not.toHaveBeenCalled();
    });

    it('should reject invalid date format', async () => {
      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('expirationDate', 'invalid-date');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      const result = await updateMedication(medicationId, undefined, formData);

      expect(result.error).toBeTruthy();
      expect(prisma.medication.update).not.toHaveBeenCalled();
    });
  });

  describe('authorization checks (Req 5.3, 9.4)', () => {
    it('should reject unauthorized user', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      const result = await updateMedication(medicationId, undefined, formData);

      expect(result.error).toBe('ไม่ได้รับอนุญาต');
      expect(prisma.medication.update).not.toHaveBeenCalled();
    });

    it('should allow authorized user', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1', username: 'admin' } } as any);
      vi.mocked(prisma.medication.update).mockResolvedValue({ id: medicationId } as any);

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      try {
        await updateMedication(medicationId, undefined, formData);
      } catch (error: any) {
        expect(error.message).toBe(`REDIRECT:/medications/${medicationId}`);
      }

      expect(prisma.medication.update).toHaveBeenCalled();
    });
  });

  describe('database error handling', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.medication.update).mockRejectedValue(new Error('Database error'));

      const formData = new FormData();
      formData.append('name', 'Aspirin');
      formData.append('fdaApproved', 'APPROVED');
      formData.append('categoryId', validCuid);

      const result = await updateMedication(medicationId, undefined, formData);

      expect(result.error).toBe('เกิดข้อผิดพลาดในการอัพเดทข้อมูล');
    });
  });
});

describe('deleteMedication', () => {
  const medicationId = 'med123';
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful deletion (Req 6.3, 6.4)', () => {
    it('should delete medication successfully', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.medication.delete).mockResolvedValue({ id: medicationId } as any);

      const result = await deleteMedication(medicationId);

      expect(result.success).toBe(true);
      expect(prisma.medication.delete).toHaveBeenCalledWith({
        where: { id: medicationId },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/medications');
    });

    it('should revalidate medication list cache after deletion', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.medication.delete).mockResolvedValue({ id: medicationId } as any);

      await deleteMedication(medicationId);

      expect(revalidatePath).toHaveBeenCalledWith('/medications');
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });
  });

  describe('authorization checks (Req 6.3, 9.4)', () => {
    it('should reject unauthorized user', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const result = await deleteMedication(medicationId);

      expect(result.error).toBe('ไม่ได้รับอนุญาต');
      expect(prisma.medication.delete).not.toHaveBeenCalled();
    });

    it('should allow authorized user to delete', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1', username: 'admin' } } as any);
      vi.mocked(prisma.medication.delete).mockResolvedValue({ id: medicationId } as any);

      const result = await deleteMedication(medicationId);

      expect(result.success).toBe(true);
      expect(prisma.medication.delete).toHaveBeenCalled();
    });
  });

  describe('database error handling (Req 6.5)', () => {
    it('should handle database errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.medication.delete).mockRejectedValue(new Error('Database error'));

      const result = await deleteMedication(medicationId);

      expect(result.error).toBe('เกิดข้อผิดพลาดในการลบข้อมูล');
      expect(result.success).toBeUndefined();
    });

    it('should handle non-existent medication', async () => {
      vi.mocked(auth).mockResolvedValue({ user: { id: '1' } } as any);
      vi.mocked(prisma.medication.delete).mockRejectedValue(new Error('Record not found'));

      const result = await deleteMedication('non-existent-id');

      expect(result.error).toBe('เกิดข้อผิดพลาดในการลบข้อมูล');
    });
  });
});
