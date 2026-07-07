'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { CategorySchema } from '@/lib/validations';
import type { ActionState } from '@/types';

/**
 * Create a new category or sub-category
 * Enforces three-level hierarchy limit (Level 1 → Level 2 → Level 3)
 */
export async function createCategory(
  _prevState: unknown,
  formData: FormData
): Promise<ActionState> {
  // Authentication check (Requirement 9.4)
  const session = await auth();
  if (!session) {
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  // Validate form data
  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
    parentId: formData.get('parentId') || null,
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return { 
      error: fieldErrors.name?.[0] || 'ข้อมูลไม่ถูกต้อง'
    };
  }

  const { parentId } = validatedFields.data;

  // Check hierarchy depth - enforce three-level limit
  if (parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parentId },
      select: { 
        id: true,
        parentId: true,
        parent: {
          select: {
            parentId: true
          }
        }
      },
    });

    if (!parent) {
      return { error: 'ไม่พบหมวดหมู่หลัก' };
    }

    // Check if parent is already at level 3 (has grandparent)
    if (parent.parent?.parentId) {
      return { error: 'ไม่สามารถสร้างหมวดหมู่เกิน 3 ระดับได้' };
    }
  }

  try {
    // Check for duplicate name within the same parent
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: validatedFields.data.name,
        parentId: validatedFields.data.parentId,
      },
    });

    if (existingCategory) {
      return { error: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' };
    }

    // Get the next order number for categories with the same parent
    const maxOrderCategory = await prisma.category.findFirst({
      where: { parentId: validatedFields.data.parentId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const nextOrder = maxOrderCategory ? maxOrderCategory.order + 1 : 0;

    await prisma.category.create({
      data: {
        ...validatedFields.data,
        order: nextOrder,
      },
    });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Category creation error:', error);
    return { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' };
  }
}

/**
 * Update an existing category
 * Allows updating name and parent (Requirements 2.5, 9.4)
 */
export async function updateCategory(
  id: string,
  _prevState: unknown,
  formData: FormData
): Promise<ActionState> {
  // Authentication check (Requirement 9.4)
  const session = await auth();
  if (!session) {
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  // Validate form data
  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name'),
    parentId: formData.get('parentId') || null,
  });

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return { 
      error: fieldErrors.name?.[0] || 'ข้อมูลไม่ถูกต้อง'
    };
  }

  const { parentId } = validatedFields.data;

  // Check hierarchy depth if parent is being changed
  if (parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parentId },
      select: { 
        id: true,
        parentId: true,
        parent: {
          select: {
            parentId: true
          }
        }
      },
    });

    if (!parent) {
      return { error: 'ไม่พบหมวดหมู่หลัก' };
    }

    // Check if parent is already at level 3 (has grandparent)
    if (parent.parent?.parentId) {
      return { error: 'ไม่สามารถสร้างหมวดหมู่เกิน 3 ระดับได้' };
    }
  }

  try {
    // Check for duplicate name within the same parent (excluding current category)
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: validatedFields.data.name,
        parentId: validatedFields.data.parentId,
        id: { not: id },
      },
    });

    if (existingCategory) {
      return { error: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว' };
    }

    await prisma.category.update({
      where: { id },
      data: validatedFields.data,
    });
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Category update error:', error);
    return { error: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูล' };
  }
}

/**
 * Delete a category
 * Prevents deletion if medications or sub-categories exist (Requirements 2.6, 2.7, 9.4, 9.6)
 */
export async function deleteCategory(
  id: string
): Promise<ActionState> {
  // Authentication check (Requirement 9.4)
  const session = await auth();
  if (!session) {
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  try {
    // Check if category has medications (Requirement 9.6)
    const medicationCount = await prisma.medication.count({
      where: { categoryId: id },
    });

    if (medicationCount > 0) {
      return {
        error: `ไม่สามารถลบหมวดหมู่ที่มียาอยู่ ${medicationCount} รายการ กรุณาย้ายยาหรือลบยาก่อน`,
      };
    }

    // Check if category has sub-categories (Requirement 2.7)
    const childrenCount = await prisma.category.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return {
        error: `ไม่สามารถลบหมวดหมู่ที่มีหมวดหมู่ย่อย ${childrenCount} รายการ กรุณาลบหมวดหมู่ย่อยก่อน`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Category deletion error:', error);
    return { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' };
  }
}

/**
 * Update category order after drag and drop
 * Recalculates order for all affected siblings
 */
export async function updateCategoryOrder(input: {
  categoryId: string;
  newPosition: number;
}): Promise<ActionState> {
  // Authentication check
  const session = await auth();
  if (!session) {
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  const { categoryId, newPosition } = input;

  try {
    // Get the category being moved
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, order: true, parentId: true },
    });

    if (!category) {
      return { error: 'ไม่พบหมวดหมู่' };
    }

    const oldPosition = category.order;

    // If position hasn't changed, no update needed
    if (oldPosition === newPosition) {
      return { success: true };
    }

    // Get all siblings (same parentId) ordered by current order
    const siblings = await prisma.category.findMany({
      where: { parentId: category.parentId },
      orderBy: { order: 'asc' },
      select: { id: true, order: true },
    });

    // Calculate new order values
    const updates: { id: string; newOrder: number }[] = [];

    if (newPosition > oldPosition) {
      // Moving down: shift items between old and new position up
      for (const sibling of siblings) {
        if (sibling.id === categoryId) {
          updates.push({ id: sibling.id, newOrder: newPosition });
        } else if (sibling.order > oldPosition && sibling.order <= newPosition) {
          updates.push({ id: sibling.id, newOrder: sibling.order - 1 });
        }
      }
    } else {
      // Moving up: shift items between new and old position down
      for (const sibling of siblings) {
        if (sibling.id === categoryId) {
          updates.push({ id: sibling.id, newOrder: newPosition });
        } else if (sibling.order >= newPosition && sibling.order < oldPosition) {
          updates.push({ id: sibling.id, newOrder: sibling.order + 1 });
        }
      }
    }

    // Update all affected categories in a transaction
    await prisma.$transaction(
      updates.map(({ id, newOrder }) =>
        prisma.category.update({
          where: { id },
          data: { order: newOrder },
        })
      )
    );

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Category order update error:', error);
    return { error: 'เกิดข้อผิดพลาดในการจัดเรียงหมวดหมู่' };
  }
}

/**
 * Reorder categories (move up or down)
 */
export async function reorderCategory(
  id: string,
  direction: 'up' | 'down'
): Promise<ActionState> {
  // Authentication check
  const session = await auth();
  if (!session) {
    return { error: 'ไม่ได้รับอนุญาต' };
  }

  try {
    // Get current category
    const currentCategory = await prisma.category.findUnique({
      where: { id },
      select: { order: true, parentId: true },
    });

    if (!currentCategory) {
      return { error: 'ไม่พบหมวดหมู่' };
    }

    // Get siblings (categories with same parentId)
    const siblings = await prisma.category.findMany({
      where: { parentId: currentCategory.parentId },
      orderBy: { order: 'asc' },
      select: { id: true, order: true },
    });

    // Find current index
    const currentIndex = siblings.findIndex(cat => cat.id === id);
    if (currentIndex === -1) {
      return { error: 'เกิดข้อผิดพลาด' };
    }

    // Check if move is valid
    if (direction === 'up' && currentIndex === 0) {
      return { error: 'อยู่ในตำแหน่งแรกแล้ว' };
    }
    if (direction === 'down' && currentIndex === siblings.length - 1) {
      return { error: 'อยู่ในตำแหน่งสุดท้ายแล้ว' };
    }

    // Swap orders
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const currentOrder = siblings[currentIndex].order;
    const swapOrder = siblings[swapIndex].order;

    await prisma.$transaction([
      prisma.category.update({
        where: { id: siblings[currentIndex].id },
        data: { order: swapOrder },
      }),
      prisma.category.update({
        where: { id: siblings[swapIndex].id },
        data: { order: currentOrder },
      }),
    ]);

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Category reorder error:', error);
    return { error: 'เกิดข้อผิดพลาดในการจัดเรียง' };
  }
}
