'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { LineUserSchema } from '@/lib/validations';
import type { ActionState } from '@/types';

/**
 * Helper to revalidate LINE users page
 * Requirement 4.5: Revalidate after mutations
 */
function revalidateLineUsers() {
  revalidatePath('/admin/line-users');
}

/**
 * Create a new LINE user
 * Validates input and stores in database
 * Requirements: 4.1, 10.1, 12.1
 */
export async function createLineUser(
  _prevState: unknown,
  formData: FormData
): Promise<ActionState> {
  // Authentication check (Requirement 10.1)
  const session = await auth();
  if (!session) {
    console.error('LINE user creation attempt without authentication');
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  // Validate form data (Requirements 4.1, 10.2)
  const validatedFields = LineUserSchema.safeParse({
    lineUserId: formData.get('lineUserId'),
    displayName: formData.get('displayName'),
    pictureUrl: formData.get('pictureUrl') || undefined,
    notificationsEnabled: formData.get('notificationsEnabled') === 'true',
    daysBeforeExpiration: parseInt(formData.get('daysBeforeExpiration') as string),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    console.error('LINE user validation error:', fieldErrors);
    // Return first field error or generic message (Requirement 10.3)
    return {
      error: fieldErrors.lineUserId?.[0] || 
             fieldErrors.displayName?.[0] || 
             fieldErrors.daysBeforeExpiration?.[0] || 
             'ข้อมูลไม่ถูกต้อง'
    };
  }

  try {
    // Check for duplicate LINE User ID
    const existingUser = await prisma.lineUser.findUnique({
      where: { lineUserId: validatedFields.data.lineUserId },
    });

    if (existingUser) {
      console.error('Duplicate LINE user ID:', validatedFields.data.lineUserId);
      return { error: 'LINE User ID นี้มีอยู่ในระบบแล้ว' };
    }

    // Store LINE user in database (Requirement 4.1)
    await prisma.lineUser.create({
      data: validatedFields.data,
    });

    console.log('LINE user created successfully:', {
      lineUserId: validatedFields.data.lineUserId,
      displayName: validatedFields.data.displayName,
      timestamp: new Date().toISOString(),
    });

    // Revalidate cache (Requirement 4.5)
    revalidateLineUsers();
    
    // Return success (Requirement 10.4)
    return { success: true };
  } catch (error) {
    // Log error with context (Requirement 12.1, 12.3)
    console.error('LINE user creation error:', {
      error: error instanceof Error ? error.message : String(error),
      lineUserId: validatedFields.data.lineUserId,
      timestamp: new Date().toISOString(),
    });
    return { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
  }
}

/**
 * Update an existing LINE user
 * Validates input and updates database
 * Requirements: 4.2, 10.1, 10.2, 12.1
 */
export async function updateLineUser(
  id: string,
  _prevState: unknown,
  formData: FormData
): Promise<ActionState> {
  // Authentication check (Requirement 10.1)
  const session = await auth();
  if (!session) {
    console.error('LINE user update attempt without authentication');
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  // Validate form data (Requirements 4.2, 10.2)
  const validatedFields = LineUserSchema.safeParse({
    lineUserId: formData.get('lineUserId'),
    displayName: formData.get('displayName'),
    pictureUrl: formData.get('pictureUrl') || undefined,
    notificationsEnabled: formData.get('notificationsEnabled') === 'true',
    daysBeforeExpiration: parseInt(formData.get('daysBeforeExpiration') as string),
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    console.error('LINE user validation error:', {
      id,
      fieldErrors,
    });
    // Return first field error or generic message (Requirement 10.3)
    return {
      error: fieldErrors.lineUserId?.[0] || 
             fieldErrors.displayName?.[0] || 
             fieldErrors.daysBeforeExpiration?.[0] || 
             'ข้อมูลไม่ถูกต้อง'
    };
  }

  try {
    // Check if LINE User ID is being changed to an existing one
    const existingUser = await prisma.lineUser.findUnique({
      where: { lineUserId: validatedFields.data.lineUserId },
    });

    if (existingUser && existingUser.id !== id) {
      console.error('Duplicate LINE user ID on update:', validatedFields.data.lineUserId);
      return { error: 'LINE User ID นี้มีอยู่ในระบบแล้ว' };
    }

    // Update LINE user in database (Requirement 4.2)
    await prisma.lineUser.update({
      where: { id },
      data: validatedFields.data,
    });

    console.log('LINE user updated successfully:', {
      id,
      lineUserId: validatedFields.data.lineUserId,
      displayName: validatedFields.data.displayName,
      notificationsEnabled: validatedFields.data.notificationsEnabled,
      timestamp: new Date().toISOString(),
    });

    // Revalidate cache (Requirement 4.5)
    revalidateLineUsers();
    
    // Return success (Requirement 10.4)
    return { success: true };
  } catch (error) {
    // Log error with context (Requirement 12.1, 12.3)
    console.error('LINE user update error:', {
      error: error instanceof Error ? error.message : String(error),
      id,
      lineUserId: validatedFields.data.lineUserId,
      timestamp: new Date().toISOString(),
    });
    return { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' };
  }
}

/**
 * Delete a LINE user
 * Removes LINE user from database
 * Requirements: 4.3, 4.4, 10.1, 12.1
 */
export async function deleteLineUser(id: string): Promise<ActionState> {
  // Authentication check (Requirement 10.1)
  const session = await auth();
  if (!session) {
    console.error('LINE user deletion attempt without authentication');
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  try {
    // Get user info before deletion for logging
    const user = await prisma.lineUser.findUnique({
      where: { id },
      select: { lineUserId: true, displayName: true },
    });

    if (!user) {
      console.error('LINE user not found for deletion:', id);
      return { error: 'ไม่พบข้อมูลผู้ใช้' };
    }

    // Remove LINE user from database (Requirement 4.3)
    await prisma.lineUser.delete({
      where: { id },
    });

    console.log('LINE user deleted successfully:', {
      id,
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      timestamp: new Date().toISOString(),
    });

    // Revalidate cache (Requirement 4.5)
    revalidateLineUsers();
    
    // Return success (Requirement 10.4)
    return { success: true };
  } catch (error) {
    // Log error with context (Requirement 12.1, 12.3)
    console.error('LINE user deletion error:', {
      error: error instanceof Error ? error.message : String(error),
      id,
      timestamp: new Date().toISOString(),
    });
    return { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' };
  }
}
