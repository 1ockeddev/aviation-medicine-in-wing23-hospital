'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { AccordionToggle } from '@/components/ui/AccordionToggle';
import { deleteCategory, reorderCategory, updateCategoryOrder } from '@/actions/categories';
import { CategoryModal } from './CategoryModal';
import { DraggableCategory } from './DraggableCategory';
import { validateDrop } from '@/lib/drag-validation';
import { calculateNewOrder } from '@/lib/order-calculator';
import { useAccordionState } from '@/hooks/useAccordionState';
import type { Category } from '@prisma/client';

type CategoryLevel3 = Category & {
  _count: {
    medications: number;
  };
};

type CategoryLevel2 = Category & {
  children: CategoryLevel3[];
  _count: {
    medications: number;
  };
};

type CategoryWithChildrenAndCount = Category & {
  children: CategoryLevel2[];
  _count: {
    medications: number;
  };
};

type ParentCategoryOption = {
  id: string;
  name: string;
  number: string;
};

interface CategoryListProps {
  categories: CategoryWithChildrenAndCount[];
  parentCategories: ParentCategoryOption[];
}

// Helper function to calculate total medication count including all subcategories
const calculateTotalMedicationCount = (category: CategoryWithChildrenAndCount | CategoryLevel2 | CategoryLevel3): number => {
  // Start with direct medication count
  let total = category._count.medications;
  
  // Add counts from all children recursively
  if ('children' in category && category.children.length > 0) {
    for (const child of category.children) {
      total += calculateTotalMedicationCount(child);
    }
  }
  
  return total;
};

export function CategoryList({ categories, parentCategories }: CategoryListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Optimistic state management for drag and drop
  const [optimisticCategories, setOptimisticCategories] = useState(categories);
  const [dragError, setDragError] = useState<string | null>(null);

  // Accordion state management
  const {
    toggleCategory,
    expandCategories,
    isExpanded,
    saveSnapshot,
    restoreSnapshot,
  } = useAccordionState({
    storageKey: 'category-accordion-state',
    defaultExpanded: false,
    debounceMs: 300,
  });

  // Drag isolation state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Screen reader announcement state
  const [announcement, setAnnouncement] = useState<string>('');

  // Update optimistic categories when server-provided categories change
  useEffect(() => {
    setOptimisticCategories(categories);
  }, [categories]);

  // Configure drag and drop sensors with 150ms delay and 5px tolerance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  // Handle drag start - prevent scroll on mobile and add haptic feedback
  const handleDragStart = (event: DragStartEvent) => {
    // Set isDragging state for drag isolation
    setIsDragging(true);

    // Prevent page scroll on mobile
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Haptic feedback on mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Handle drag end - update optimistic state and call server action
  const handleDragEnd = (event: DragEndEvent) => {
    // Reset isDragging state for drag isolation
    setIsDragging(false);

    // Re-enable scroll on mobile
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }

    const { active, over } = event;

    // Return early if no over target or same position
    if (!over || active.id === over.id) return;

    // Find active and over categories from state
    const findCategoryById = (id: string): Category | null => {
      for (const level1 of optimisticCategories) {
        if (level1.id === id) return level1;
        for (const level2 of level1.children) {
          if (level2.id === id) return level2;
          for (const level3 of level2.children) {
            if (level3.id === id) return level3;
          }
        }
      }
      return null;
    };

    const activeCategory = findCategoryById(active.id as string);
    const overCategory = findCategoryById(over.id as string);

    if (!activeCategory || !overCategory) return;

    // Validate drop using validation helper
    const validationError = validateDrop(
      { id: activeCategory.id, parentId: activeCategory.parentId },
      { id: overCategory.id, parentId: overCategory.parentId }
    );

    if (validationError) {
      setDragError(validationError);
      setTimeout(() => setDragError(null), 5000);
      return;
    }

    // Check if moving to different parent (cross-level move)
    const isCrossLevelMove = activeCategory.parentId !== overCategory.parentId;

    if (isCrossLevelMove) {
      // Cross-level move: change parent to match over category's parent
      startTransition(async () => {
        try {
          // Import updateCategory action for parent change
          const { updateCategory } = await import('@/actions/categories');
          
          // Create FormData with new parent
          const formData = new FormData();
          formData.append('name', activeCategory.name);
          formData.append('parentId', overCategory.parentId || '');

          const result = await updateCategory(activeCategory.id, undefined, formData);

          if (result.error) {
            const errorMessage = typeof result.error === 'string' ? result.error : 'เกิดข้อผิดพลาดในการย้ายหมวดหมู่';
            setDragError(errorMessage);
            setTimeout(() => setDragError(null), 5000);
            console.error('Category move error:', result.error);
          }
          // Success - page will revalidate and show new structure
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการย้ายหมวดหมู่';
          setDragError(errorMessage);
          setTimeout(() => setDragError(null), 5000);
          console.error('Category move error:', err);
        }
      });
      
      return;
    }

    // Same level move: reorder within siblings
    const getSiblings = (parentId: string | null): Category[] => {
      if (parentId === null) {
        // Level 1 categories
        return optimisticCategories;
      }
      
      // Find parent and return its children
      for (const level1 of optimisticCategories) {
        if (level1.id === parentId) {
          return level1.children;
        }
        for (const level2 of level1.children) {
          if (level2.id === parentId) {
            return level2.children;
          }
        }
      }
      return [];
    };

    const siblings = getSiblings(activeCategory.parentId);
    
    // Calculate new order for affected categories
    const updates = calculateNewOrder(
      activeCategory.id,
      overCategory.order,
      siblings.map(cat => ({ id: cat.id, order: cat.order }))
    );

    if (updates.length === 0) return;

    // Update optimistic state immediately
    const applyUpdates = (categories: CategoryWithChildrenAndCount[]): CategoryWithChildrenAndCount[] => {
      return categories.map(cat => {
        const update = updates.find(u => u.id === cat.id);
        const newCat = update ? { ...cat, order: update.newOrder } : cat;
        
        if (cat.children.length > 0) {
          return {
            ...newCat,
            children: newCat.children.map(child => {
              const childUpdate = updates.find(u => u.id === child.id);
              const newChild = childUpdate ? { ...child, order: childUpdate.newOrder } : child;
              
              if (child.children.length > 0) {
                return {
                  ...newChild,
                  children: newChild.children.map(grandchild => {
                    const grandchildUpdate = updates.find(u => u.id === grandchild.id);
                    return grandchildUpdate ? { ...grandchild, order: grandchildUpdate.newOrder } : grandchild;
                  }).sort((a, b) => a.order - b.order)
                };
              }
              
              return newChild;
            }).sort((a, b) => a.order - b.order)
          };
        }
        
        return newCat;
      }).sort((a, b) => a.order - b.order);
    };

    const newOptimisticCategories = applyUpdates(optimisticCategories);
    setOptimisticCategories(newOptimisticCategories);

    // Call server action with startTransition
    startTransition(async () => {
      try {
        const result = await updateCategoryOrder({
          categoryId: activeCategory.id,
          newPosition: overCategory.order,
        });

        if (result.error) {
          // Rollback optimistic state on error
          setOptimisticCategories(categories);
          const errorMessage = typeof result.error === 'string' ? result.error : 'เกิดข้อผิดพลาดในการจัดเรียงหมวดหมู่';
          setDragError(errorMessage);
          setTimeout(() => setDragError(null), 5000);
          console.error('Category order update error:', result.error);
        }
      } catch (err) {
        // Handle error by rolling back optimistic state
        setOptimisticCategories(categories);
        const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการจัดเรียงหมวดหมู่';
        setDragError(errorMessage);
        setTimeout(() => setDragError(null), 5000);
        console.error('Category order update error:', err);
      }
    });
  };

  // Filter categories based on search query (support 3 levels)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return optimisticCategories;

    const query = searchQuery.toLowerCase();
    return optimisticCategories
      .map((level1) => {
        // Filter level 2 categories
        const filteredLevel2 = level1.children
          .map((level2) => {
            // Filter level 3 categories
            const filteredLevel3 = level2.children.filter((level3) =>
              level3.name.toLowerCase().includes(query)
            );

            // Check if level2 matches or has matching level3 children
            const level2Matches = level2.name.toLowerCase().includes(query);

            if (level2Matches || filteredLevel3.length > 0) {
              return {
                ...level2,
                children: level2Matches ? level2.children : filteredLevel3,
              };
            }
            return null;
          })
          .filter((cat): cat is CategoryLevel2 => cat !== null);

        // Check if level1 matches or has matching children
        const level1Matches = level1.name.toLowerCase().includes(query);

        if (level1Matches || filteredLevel2.length > 0) {
          return {
            ...level1,
            children: level1Matches ? level1.children : filteredLevel2,
          };
        }
        return null;
      })
      .filter((cat): cat is CategoryWithChildrenAndCount => cat !== null);
  }, [optimisticCategories, searchQuery]);

  // Task 6.1: Helper function to extract all matching category IDs recursively
  const findMatchingCategoryIds = (
    categories: CategoryWithChildrenAndCount[]
  ): string[] => {
    const ids: string[] = [];

    for (const level1 of categories) {
      // Add level 1 category ID
      ids.push(level1.id);

      // Process level 2 children
      for (const level2 of level1.children) {
        // Add level 2 category ID
        ids.push(level2.id);

        // Process level 3 children
        for (const level3 of level2.children) {
          // Add level 3 category ID
          ids.push(level3.id);
        }
      }
    }

    return ids;
  };

  // Task 8.1: Extract all category IDs from categories prop
  const extractAllCategoryIds = (
    categories: CategoryWithChildrenAndCount[]
  ): string[] => {
    const ids: string[] = [];

    for (const level1 of categories) {
      // Add level 1 category ID
      ids.push(level1.id);

      // Process level 2 children
      for (const level2 of level1.children) {
        // Add level 2 category ID
        ids.push(level2.id);

        // Process level 3 children
        for (const level3 of level2.children) {
          // Add level 3 category ID
          ids.push(level3.id);
        }
      }
    }

    return ids;
  };

  // Task 8.2: Cleanup orphaned localStorage entries on mount when categories change
  useEffect(() => {
    // Extract all valid category IDs from current categories
    const allCategoryIds = extractAllCategoryIds(categories);
    
    // Get stored state from localStorage
    try {
      const stored = localStorage.getItem('category-accordion-state');
      if (stored) {
        const parsedState = JSON.parse(stored);
        const storedIds = Object.keys(parsedState);
        
        // Find orphaned IDs (in storage but not in categories)
        const orphanedIds = storedIds.filter(id => !allCategoryIds.includes(id));
        
        if (orphanedIds.length > 0) {
          // Remove orphaned entries
          const cleanedState = { ...parsedState };
          orphanedIds.forEach(id => delete cleanedState[id]);
          
          // Save cleaned state back to localStorage
          localStorage.setItem('category-accordion-state', JSON.stringify(cleanedState));
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup orphaned accordion state:', error);
    }
  }, [categories]);

  // Task 6.2: useEffect for search state management
  useEffect(() => {
    if (searchQuery.trim()) {
      // Save current state before search
      saveSnapshot();
      
      // Find all category IDs that have matches (including ancestors)
      const matchingIds = findMatchingCategoryIds(filteredCategories);
      expandCategories(matchingIds);
    } else {
      // Restore pre-search state when cleared
      restoreSnapshot();
    }
  }, [searchQuery, filteredCategories, saveSnapshot, expandCategories, restoreSnapshot]);

  // Generate category ID arrays for each sibling group
  // Level 1: all categories with parentId === null
  const level1CategoryIds = useMemo(
    () => filteredCategories.map((cat) => cat.id),
    [filteredCategories]
  );

  // Level 2: grouped by parentId (one array per Level 1 category)
  const level2CategoryGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    filteredCategories.forEach((level1Cat) => {
      groups[level1Cat.id] = level1Cat.children.map((cat) => cat.id);
    });
    return groups;
  }, [filteredCategories]);

  // Level 3: grouped by parentId (one array per Level 2 category)
  const level3CategoryGroups = useMemo(() => {
    const groups: Record<string, string[]> = {};
    filteredCategories.forEach((level1Cat) => {
      level1Cat.children.forEach((level2Cat) => {
        groups[level2Cat.id] = level2Cat.children.map((cat) => cat.id);
      });
    });
    return groups;
  }, [filteredCategories]);

  const handleDeleteClick = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setDeleteDialogOpen(true);
    setError(null);
  };

  const handleEditClick = (category: Category) => {
    setModalMode('edit');
    setCategoryToEdit(category);
    setModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return;

    startTransition(async () => {
      const result = await deleteCategory(categoryToDelete.id);
      
      if (result.error) {
        setError(typeof result.error === 'string' ? result.error : 'เกิดข้อผิดพลาด');
      } else {
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        setError(null);
      }
    });
  };

  const handleDialogClose = () => {
    if (!isPending) {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      setError(null);
    }
  };

  const handleReorder = (id: string, direction: 'up' | 'down') => {
    startTransition(async () => {
      const result = await reorderCategory(id, direction);
      if (result.error) {
        // Optionally show error toast
        console.error(result.error);
      }
    });
  };

  // Task 4.3: Create toggle click handler
  const handleToggle = (categoryId: string, hasChildren: boolean) => (e: React.MouseEvent) => {
    // Return early if target is within action button (check data-action attribute)
    const target = e.target as HTMLElement;
    if (target.closest('[data-action]')) {
      return;
    }

    // Return early if isDragging is true
    if (isDragging) {
      return;
    }

    // Call toggleCategory if hasChildren is true
    if (hasChildren) {
      const newState = !isExpanded(categoryId);
      toggleCategory(categoryId);
      
      // Update screen reader announcement
      setAnnouncement(newState ? 'หมวดหมู่ขยายแล้ว' : 'หมวดหมู่ยุบแล้ว');
    }
  };

  // Task 4.4: Create keyboard event handler
  const handleKeyDown = (categoryId: string, hasChildren: boolean) => (e: React.KeyboardEvent) => {
    // Check for Enter or Space key
    if (e.key === 'Enter' || e.key === ' ') {
      // Prevent default browser behavior (e.g., page scroll on Space)
      e.preventDefault();

      // Call toggleCategory if hasChildren is true
      if (hasChildren) {
        const newState = !isExpanded(categoryId);
        toggleCategory(categoryId);
        
        // Update screen reader announcement
        setAnnouncement(newState ? 'หมวดหมู่ขยายแล้ว' : 'หมวดหมู่ยุบแล้ว');
      }
    }
  };

  if (categories.length === 0) {
    return (
      <>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">ยังไม่มีหมวดหมู่ในระบบ</p>
        </div>
        <CategoryModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          category={categoryToEdit}
          parentCategories={parentCategories}
        />
      </>
    );
  }

  return (
    <>
      {/* Search Box */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="ค้นหาหมวดหมู่..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">ไม่พบหมวดหมู่ที่ค้นหา</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Display drag error if present */}
          {dragError && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{dragError}</p>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
            <div className="divide-y divide-gray-200 min-w-max">
              {/* Level 1 Categories - wrapped in SortableContext */}
              <SortableContext items={level1CategoryIds} strategy={verticalListSortingStrategy}>
                {filteredCategories.map((category, index) => (
                  <div key={category.id}>
                    {/* Parent Category - Mobile First */}
                    <DraggableCategory id={category.id}>
                      <div
                        className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                        onClick={handleToggle(category.id, category.children.length > 0)}
                        onKeyDown={handleKeyDown(category.id, category.children.length > 0)}
                        tabIndex={category.children.length > 0 ? 0 : -1}
                        role={category.children.length > 0 ? "button" : undefined}
                        aria-expanded={category.children.length > 0 ? isExpanded(category.id) : undefined}
                        aria-controls={category.children.length > 0 ? `category-children-${category.id}` : undefined}
                      >
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                          {/* Order Controls */}
                          {categories.length > 1 && (
                            <div className="flex flex-col gap-1 flex-shrink-0">
                              {index > 0 && (
                                <button
                                  onClick={() => handleReorder(category.id, 'up')}
                                  disabled={isPending}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                                  title="เลื่อนขึ้น"
                                  aria-label="เลื่อนขึ้น"
                                  data-action="reorder-up"
                                >
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                              )}
                              {index < categories.length - 1 && (
                                <button
                                  onClick={() => handleReorder(category.id, 'down')}
                                  disabled={isPending}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                                  title="เลื่อนลง"
                                  aria-label="เลื่อนลง"
                                  data-action="reorder-down"
                                >
                                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}

                          {/* AccordionToggle */}
                          <AccordionToggle
                            isExpanded={isExpanded(category.id)}
                            hasChildren={category.children.length > 0}
                            onClick={handleToggle(category.id, category.children.length > 0)}
                            aria-label={isExpanded(category.id) ? 'ยุบหมวดหมู่' : 'ขยายหมวดหมู่'}
                          />
                        
                          {/* Category Info */}
                          <div className="flex-1 min-w-0">
                            <h3 id={`category-name-${category.id}`} className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                              {category.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                              {calculateTotalMedicationCount(category)} รายการยา
                              {category.children.length > 0 && 
                                ` • ${category.children.length} หมวดหมู่ย่อย`}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditClick(category)}
                              className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                              data-action="edit"
                            >
                              แก้ไข
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteClick(category.id, category.name)}
                              className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                              data-action="delete"
                            >
                              ลบ
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DraggableCategory>

                    {/* Sub-Categories - Mobile First - Conditionally rendered based on expand state */}
                    {isExpanded(category.id) && category.children.length > 0 && (
                      <div
                        id={`category-children-${category.id}`}
                        role="region"
                        aria-labelledby={`category-name-${category.id}`}
                        className="bg-gray-50 border-t border-gray-200 transition-all duration-200 ease-in-out overflow-hidden motion-reduce:transition-none"
                      >
                        {/* Level 2 Categories - wrapped in SortableContext */}
                        <SortableContext items={level2CategoryGroups[category.id] || []} strategy={verticalListSortingStrategy}>
                          {category.children.map((subCategory, subIndex) => (
                            <div key={subCategory.id}>
                              <DraggableCategory id={subCategory.id}>
                                <div
                                  className="p-3 pl-12 sm:p-4 sm:pl-16 hover:bg-gray-100 transition-colors"
                                  onClick={handleToggle(subCategory.id, subCategory.children.length > 0)}
                                  onKeyDown={handleKeyDown(subCategory.id, subCategory.children.length > 0)}
                                  tabIndex={subCategory.children.length > 0 ? 0 : -1}
                                  role={subCategory.children.length > 0 ? "button" : undefined}
                                  aria-expanded={subCategory.children.length > 0 ? isExpanded(subCategory.id) : undefined}
                                  aria-controls={subCategory.children.length > 0 ? `category-children-${subCategory.id}` : undefined}
                                >
                                  <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                                    {/* Sub-Category Order Controls */}
                                    {category.children.length > 1 && (
                                      <div className="flex flex-col gap-1 flex-shrink-0">
                                        {subIndex > 0 && (
                                          <button
                                            onClick={() => handleReorder(subCategory.id, 'up')}
                                            disabled={isPending}
                                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                                            title="เลื่อนขึ้น"
                                            aria-label="เลื่อนขึ้น"
                                            data-action="reorder-up"
                                          >
                                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                          </button>
                                        )}
                                        {subIndex < category.children.length - 1 && (
                                          <button
                                            onClick={() => handleReorder(subCategory.id, 'down')}
                                            disabled={isPending}
                                            className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                                            title="เลื่อนลง"
                                            aria-label="เลื่อนลง"
                                            data-action="reorder-down"
                                          >
                                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    )}

                                    {/* AccordionToggle */}
                                    <AccordionToggle
                                      isExpanded={isExpanded(subCategory.id)}
                                      hasChildren={subCategory.children.length > 0}
                                      onClick={handleToggle(subCategory.id, subCategory.children.length > 0)}
                                      aria-label={isExpanded(subCategory.id) ? 'ยุบหมวดหมู่' : 'ขยายหมวดหมู่'}
                                    />

                                    {/* Sub-Category Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <h4 id={`category-name-${subCategory.id}`} className="text-sm sm:text-base font-medium text-gray-800 truncate">
                                          {subCategory.name}
                                        </h4>
                                      </div>
                                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        {calculateTotalMedicationCount(subCategory)} รายการยา
                                        {subCategory.children.length > 0 && 
                                          ` • ${subCategory.children.length} หมวดหมู่ย่อยระดับ 3`}
                                      </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleEditClick(subCategory)}
                                        className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                                        data-action="edit"
                                      >
                                        แก้ไข
                                      </Button>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteClick(subCategory.id, subCategory.name)
                                        }
                                        className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                                        data-action="delete"
                                      >
                                        ลบ
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </DraggableCategory>

                              {/* Level 3 Categories - Conditionally rendered based on expand state */}
                              {isExpanded(subCategory.id) && subCategory.children.length > 0 && (
                                <div
                                  id={`category-children-${subCategory.id}`}
                                  role="region"
                                  aria-labelledby={`category-name-${subCategory.id}`}
                                  className="mt-2 space-y-2 transition-all duration-200 ease-in-out overflow-hidden motion-reduce:transition-none"
                                >
                                  {/* Level 3 Categories - wrapped in SortableContext */}
                                  <SortableContext items={level3CategoryGroups[subCategory.id] || []} strategy={verticalListSortingStrategy}>
                                    {subCategory.children.map((level3Category, level3Index) => (
                                      <DraggableCategory key={level3Category.id} id={level3Category.id}>
                                        <div className="p-2 pl-[5.3125rem] sm:p-3 sm:pl-[6.6875rem] bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                                          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                                            {/* Level 3 Order Controls - aligned with Level 2 AccordionToggle */}
                                            {subCategory.children.length > 1 ? (
                                              <div className="flex flex-col gap-1 flex-shrink-0">
                                                {level3Index > 0 && (
                                                  <button
                                                    onClick={() => handleReorder(level3Category.id, 'up')}
                                                    disabled={isPending}
                                                    className="p-1 hover:bg-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                                                    title="เลื่อนขึ้น"
                                                    aria-label="เลื่อนขึ้น"
                                                    data-action="reorder-up"
                                                  >
                                                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                  </button>
                                                )}
                                                {level3Index < subCategory.children.length - 1 && (
                                                  <button
                                                    onClick={() => handleReorder(level3Category.id, 'down')}
                                                    disabled={isPending}
                                                    className="p-1 hover:bg-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
                                                    title="เลื่อนลง"
                                                    aria-label="เลื่อนลง"
                                                    data-action="reorder-down"
                                                  >
                                                    <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                  </button>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="min-w-[44px] flex-shrink-0" aria-hidden="true" />
                                            )}

                                            {/* Spacer for AccordionToggle alignment - Level 3 has no toggle */}
                                            <div className="min-w-[44px] min-h-[44px] flex-shrink-0" aria-hidden="true" />

                                            {/* Level 3 Info */}
                                            <div className="flex-1 min-w-0">
                                              <h5 className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                                                {level3Category.name}
                                              </h5>
                                              <p className="text-xs text-gray-500 mt-0.5">
                                                {calculateTotalMedicationCount(level3Category)} รายการยา
                                              </p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-1 flex-shrink-0">
                                              <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => handleEditClick(level3Category)}
                                                className="text-xs px-2 py-0.5"
                                                data-action="edit"
                                              >
                                                แก้ไข
                                              </Button>
                                              <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() =>
                                                  handleDeleteClick(level3Category.id, level3Category.name)
                                                }
                                                className="text-xs px-2 py-0.5"
                                                data-action="delete"
                                              >
                                                ลบ
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </DraggableCategory>
                                    ))}
                                  </SortableContext>
                                </div>
                              )}
                            </div>
                          ))}
                        </SortableContext>
                      </div>
                    )}
                  </div>
                ))}
              </SortableContext>
            </div>
          </div>
        </DndContext>
      )}

      {/* Category Modal */}
      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        category={categoryToEdit}
        parentCategories={parentCategories}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={handleDialogClose}
        title="ยืนยันการลบหมวดหมู่"
        description={
          categoryToDelete
            ? `คุณต้องการลบหมวดหมู่ "${categoryToDelete.name}" ใช่หรือไม่?`
            : ''
        }
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDialogClose}
        variant="danger"
        loading={isPending}
      >
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-xs sm:text-sm text-red-800">{error}</p>
          </div>
        )}
        {!error && (
          <p className="text-xs sm:text-sm text-gray-600">
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </p>
        )}
      </Dialog>

      {/* Screen reader live region for announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </>
  );
}
