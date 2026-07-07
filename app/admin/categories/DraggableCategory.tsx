'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragHandleIcon } from '@/components/ui/DragHandleIcon';
import type { ReactNode } from 'react';

interface DraggableCategoryProps {
  id: string;
  children: ReactNode;
}

/**
 * DraggableCategory - Wrapper component for draggable category rows
 * 
 * Uses @dnd-kit/sortable for drag and drop functionality.
 * Provides visual feedback during drag (opacity, transforms).
 * Includes accessible drag handle with proper ARIA attributes.
 */
export function DraggableCategory({ id, children }: DraggableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative ${isDragging ? 'border-2 border-dashed border-blue-400 rounded' : ''} ${isOver ? 'bg-blue-50 border-t-2 border-blue-300' : ''}`}
    >
      <div className="flex items-center gap-2">
        {/* Drag Handle Button */}
        <button
          {...attributes}
          {...listeners}
          className="p-2 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          aria-label="ลากเพื่อจัดเรียง"
          aria-describedby="drag-instructions"
          type="button"
        >
          <DragHandleIcon />
        </button>

        {/* Category Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>

      {/* Screen reader instructions */}
      <div id="drag-instructions" className="sr-only">
        กดค้างและลากเพื่อเปลี่ยนตำแหน่งหมวดหมู่ หรือใช้ปุ่มลูกศรสำหรับผู้ใช้คีย์บอร์ด
      </div>
    </div>
  );
}
