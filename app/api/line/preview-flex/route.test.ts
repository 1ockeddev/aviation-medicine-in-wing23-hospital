/**
 * Tests for LINE Flex Message Preview API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    medication: {
      findMany: vi.fn(),
    },
  },
}));

// Mock flex message generator
vi.mock('@/lib/flex-messages', () => ({
  createExpirationFlexMessage: vi.fn((medications) => ({
    type: 'flex',
    altText: `แจ้งเตือนยาใกล้หมดอายุ ${medications.length} รายการ`,
    contents: {
      type: 'carousel',
      contents: medications.map((m: any) => ({
        type: 'bubble',
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            { type: 'text', text: m.name },
          ],
        },
      })),
    },
  })),
}));

describe('Preview Flex Message API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/line/preview-flex', () => {
    it('should return flex message for medications expiring within 30 days', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      // Mock data
      const mockMedications = [
        {
          id: 'med1',
          name: 'Paracetamol 500mg',
          tradeName: 'Tylenol',
          expirationDate: new Date('2026-08-15'),
          categoryId: 'cat1',
          category: {
            id: 'cat1',
            name: 'Pain Relief',
            parentId: null,
            parent: null,
          },
        },
        {
          id: 'med2',
          name: 'Amoxicillin 250mg',
          tradeName: null,
          expirationDate: new Date('2026-08-20'),
          categoryId: 'cat2',
          category: {
            id: 'cat2',
            name: 'Oral Forms',
            parentId: 'cat2-parent',
            parent: {
              id: 'cat2-parent',
              name: 'Antibiotics',
              parentId: null,
              parent: null,
            },
          },
        },
      ];

      vi.mocked(prisma.medication.findMany).mockResolvedValue(mockMedications as any);

      const request = new NextRequest('http://localhost:3000/api/line/preview-flex');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.medicationCount).toBe(2);
      expect(data.flexMessage).toBeDefined();
      expect(data.flexMessage.type).toBe('flex');
      expect(data.instructions).toBeDefined();
      expect(data.instructions.simulator).toBe('https://developers.line.biz/flex-simulator/');
      expect(data.metadata).toBeDefined();
      expect(data.metadata.medications).toHaveLength(2);
    });

    it('should support medicationId parameter', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      const mockMedication = {
        id: 'med1',
        name: 'Paracetamol 500mg',
        tradeName: 'Tylenol',
        expirationDate: new Date('2026-08-15'),
        categoryId: 'cat1',
        category: {
          id: 'cat1',
          name: 'Pain Relief',
          parentId: null,
          parent: null,
        },
      };

      vi.mocked(prisma.medication.findMany).mockResolvedValue([mockMedication] as any);

      const request = new NextRequest('http://localhost:3000/api/line/preview-flex?medicationId=med1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.medicationCount).toBe(1);
      
      // Verify query was called with specific medication ID
      expect(prisma.medication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'med1' },
        })
      );
    });

    it('should support limit parameter', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      const mockMedications = Array.from({ length: 3 }, (_, i) => ({
        id: `med${i + 1}`,
        name: `Medication ${i + 1}`,
        tradeName: null,
        expirationDate: new Date('2026-08-15'),
        categoryId: 'cat1',
        category: {
          id: 'cat1',
          name: 'Category',
          parentId: null,
          parent: null,
        },
      }));

      vi.mocked(prisma.medication.findMany).mockResolvedValue(mockMedications as any);

      const request = new NextRequest('http://localhost:3000/api/line/preview-flex?limit=3');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.medicationCount).toBe(3);
      
      // Verify query was called with limit
      expect(prisma.medication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
        })
      );
    });

    it('should build full category hierarchy path', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createExpirationFlexMessage } = await import('@/lib/flex-messages');
      
      const mockMedication = {
        id: 'med1',
        name: 'Amoxicillin 250mg',
        tradeName: null,
        expirationDate: new Date('2026-08-15'),
        categoryId: 'cat-child',
        category: {
          id: 'cat-child',
          name: 'Oral Forms',
          parentId: 'cat-parent',
          parent: {
            id: 'cat-parent',
            name: 'Antibiotics',
            parentId: 'cat-root',
            parent: {
              id: 'cat-root',
              name: 'Medications',
              parentId: null,
              parent: null,
            },
          },
        },
      };

      vi.mocked(prisma.medication.findMany).mockResolvedValue([mockMedication] as any);

      const request = new NextRequest('http://localhost:3000/api/line/preview-flex?medicationId=med1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify category hierarchy was built correctly
      expect(createExpirationFlexMessage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            category: expect.objectContaining({
              name: 'Medications > Antibiotics > Oral Forms',
            }),
          }),
        ])
      );
    });

    it('should return 404 when no medications found', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      vi.mocked(prisma.medication.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/line/preview-flex');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('No medications found');
      expect(data.hint).toContain('No medications expiring within 30 days');
    });

    it('should return 404 with specific hint when medicationId not found', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      vi.mocked(prisma.medication.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/line/preview-flex?medicationId=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('No medications found');
      expect(data.hint).toContain('The specified medication ID does not exist');
    });

    it('should handle database errors gracefully', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      vi.mocked(prisma.medication.findMany).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/line/preview-flex');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate preview');
      expect(data.message).toBe('Database connection failed');
    });

    it('should query medications with correct date range', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      vi.mocked(prisma.medication.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/line/preview-flex');
      await GET(request);

      // Verify date range in query
      const callArgs = vi.mocked(prisma.medication.findMany).mock.calls[0][0];
      expect(callArgs.where.expirationDate).toBeDefined();
      expect(callArgs.where.expirationDate.gte).toBeInstanceOf(Date);
      expect(callArgs.where.expirationDate.lte).toBeInstanceOf(Date);
      
      // Verify lte is approximately 30 days from now
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const queryDate = callArgs.where.expirationDate.lte;
      const diff = Math.abs(queryDate.getTime() - thirtyDaysFromNow.getTime());
      expect(diff).toBeLessThan(1000); // Within 1 second
    });

    it('should include full category hierarchy in query', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      vi.mocked(prisma.medication.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/line/preview-flex');
      await GET(request);

      // Verify nested include for category hierarchy
      const callArgs = vi.mocked(prisma.medication.findMany).mock.calls[0][0];
      expect(callArgs.include.category).toBeDefined();
      expect(callArgs.include.category.include.parent).toBeDefined();
      expect(callArgs.include.category.include.parent.include.parent).toBeDefined();
      expect(callArgs.include.category.include.parent.include.parent.include.parent).toBeDefined();
    });
  });
});
