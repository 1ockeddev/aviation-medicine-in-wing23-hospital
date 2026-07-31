'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity } from '@/lib/activity-log';

// Helper to revalidate all relevant pages
function revalidateAll() {
  revalidatePath('/');
  revalidatePath('/admin/categories');
  revalidatePath('/admin/medications');
}
import { MedicationSchema } from '@/lib/validations';
import type { ActionState } from '@/types';

/**
 * Create a new medication
 * Validates input and stores in database (Requirements 3.3, 3.4, 3.5, 3.9, 9.4)
 */
export async function createMedication(
  _prevState: unknown,
  formData: FormData
): Promise<ActionState> {
  // Authentication check (Requirement 9.4)
  const session = await auth();
  if (!session) {
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  // Validate form data (Requirements 3.3, 3.5, 3.6, 3.7, 3.8)
  const validatedFields = MedicationSchema.safeParse({
    name: formData.get('name'),
    tradeName: formData.get('tradeName') || undefined,
    expirationDate: formData.get('expirationDate') || null,
    status: formData.get('status'),
    dose: formData.get('dose') || undefined,
    doseDetails: formData.get('doseDetails') || undefined,
    halfLife: formData.get('halfLife') || undefined,
    sideEffects: formData.get('sideEffects') || undefined,
    notes: formData.get('notes') || undefined,
    categoryId: formData.get('categoryId'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    // Return first field error or generic message (Requirement 3.5)
    return {
      error: fieldErrors.name?.[0] || 
             fieldErrors.categoryId?.[0] || 
             fieldErrors.status?.[0] || 
             'ข้อมูลไม่ถูกต้อง'
    };
  }

  try {
    // Store medication in database (Requirement 3.4)
    const medication = await prisma.medication.create({
      data: validatedFields.data,
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    // Log activity
    await logActivity({
      action: 'CREATE',
      entity: 'Medication',
      entityId: medication.id,
      entityName: medication.name,
      details: `Created in category: ${medication.category.name}`,
    });

    // Invalidate cache (Requirement 5.3)
    revalidatePath('/medications');
    
    // Return success (no redirect for modal usage)
    return { success: true };
  } catch (error) {
    console.error('Medication creation error:', error);
    return { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
  }
}

/**
 * Update an existing medication
 * Validates input and updates database (Requirements 5.3, 5.4, 5.5, 5.6, 9.4)
 */
export async function updateMedication(
  id: string,
  _prevState: unknown,
  formData: FormData
): Promise<ActionState> {
  // Authentication check (Requirement 9.4)
  const session = await auth();
  if (!session) {
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  // Validate form data (Requirement 5.3)
  const validatedFields = MedicationSchema.safeParse({
    name: formData.get('name'),
    tradeName: formData.get('tradeName') || undefined,
    expirationDate: formData.get('expirationDate') || null,
    status: formData.get('status'),
    dose: formData.get('dose') || undefined,
    doseDetails: formData.get('doseDetails') || undefined,
    halfLife: formData.get('halfLife') || undefined,
    sideEffects: formData.get('sideEffects') || undefined,
    notes: formData.get('notes') || undefined,
    categoryId: formData.get('categoryId'),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    // Display error messages without losing user input (Requirement 5.5)
    return {
      error: fieldErrors.name?.[0] || 
             fieldErrors.categoryId?.[0] || 
             fieldErrors.status?.[0] || 
             'ข้อมูลไม่ถูกต้อง'
    };
  }

  try {
    // Get old medication data
    const oldMedication = await prisma.medication.findUnique({
      where: { id },
      select: { name: true, categoryId: true, status: true },
    });

    // Update medication in database (Requirement 5.4)
    const medication = await prisma.medication.update({
      where: { id },
      data: validatedFields.data,
      include: {
        category: {
          select: { name: true },
        },
      },
    });

    // Log activity
    const changes = [];
    if (oldMedication?.name !== medication.name) {
      changes.push(`name: "${oldMedication?.name}" → "${medication.name}"`);
    }
    if (oldMedication?.categoryId !== medication.categoryId) {
      changes.push(`category: ${medication.category.name}`);
    }
    if (oldMedication?.status !== medication.status) {
      changes.push(`status: ${medication.status}`);
    }

    await logActivity({
      action: 'UPDATE',
      entity: 'Medication',
      entityId: medication.id,
      entityName: medication.name,
      details: changes.length > 0 ? changes.join(', ') : 'Updated medication',
    });

    // Invalidate cache for list and detail pages
    revalidatePath('/medications');
    
    // Return success (no redirect for modal usage)
    return { success: true };
  } catch (error) {
    console.error('Medication update error:', error);
    return { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' };
  }
}

/**
 * Delete a medication
 * Removes medication from database with confirmation (Requirements 6.3, 6.4, 6.5, 9.4)
 */
export async function deleteMedication(
  id: string
): Promise<ActionState> {
  // Authentication check (Requirement 9.4)
  const session = await auth();
  if (!session) {
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  try {
    // Get medication data before deletion
    const medication = await prisma.medication.findUnique({
      where: { id },
      select: { name: true },
    });

    // Remove medication from database (Requirement 6.3)
    await prisma.medication.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      action: 'DELETE',
      entity: 'Medication',
      entityId: id,
      entityName: medication?.name || 'Unknown',
      details: 'Deleted medication',
    });

    // Invalidate cache
    revalidatePath('/medications');
    
    // Display success confirmation (Requirement 6.5)
    return { success: true };
  } catch (error) {
    console.error('Medication deletion error:', error);
    return { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' };
  }
}

/**
 * Search medications by name or trade name
 * Returns filtered list based on case-insensitive partial matching (Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8)
 */
export async function searchMedications(query: string) {
  try {
    // Case-insensitive partial matching on name and tradeName (Requirements 7.2, 7.3, 7.4, 7.5)
    const medications = await prisma.medication.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            tradeName: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Return results (Requirements 7.6, 7.7, 7.8)
    return medications;
  } catch (error) {
    console.error('Medication search error:', error);
    throw new Error('เกิดข้อผิดพลาดในการค้นหา');
  }
}
