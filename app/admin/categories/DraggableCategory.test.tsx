import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { DraggableCategory } from './DraggableCategory';

// Mock the useSortable hook for testing
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: ({ id }: { id: string }) => ({
    attributes: { 'data-test': 'sortable' },
    listeners: { onClick: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
    isOver: false,
  }),
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  verticalListSortingStrategy: {},
}));

describe('DraggableCategory', () => {
  describe('Rendering', () => {
    it('should render drag handle button', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Test Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toBeInTheDocument();
    });

    it('should render children content correctly', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div data-testid="child-content">Test Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const childContent = screen.getByTestId('child-content');
      expect(childContent).toBeInTheDocument();
      expect(childContent).toHaveTextContent('Test Content');
    });

    it('should render complex children', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>
              <h3>Category Title</h3>
              <p>Category Description</p>
              <button>Edit</button>
            </div>
          </DraggableCategory>
        </DndContext>
      );

      expect(screen.getByText('Category Title')).toBeInTheDocument();
      expect(screen.getByText('Category Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    });
  });

  describe('Drag Handle', () => {
    it('should have correct aria-label', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toHaveAttribute('aria-label', 'ลากเพื่อจัดเรียง');
    });

    it('should have aria-describedby pointing to instructions', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toHaveAttribute('aria-describedby', 'drag-instructions');
    });

    it('should have button type attribute', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toHaveAttribute('type', 'button');
    });

    it('should have grab cursor class', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toHaveClass('cursor-grab');
    });

    it('should have grabbing cursor on active state', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toHaveClass('active:cursor-grabbing');
    });

    it('should have minimum touch target size (44x44px)', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });

    it('should have touch-manipulation class for mobile', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toHaveClass('touch-manipulation');
    });

    it('should have hover background effect', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toHaveClass('hover:bg-gray-200');
    });

    it('should have transition class for smooth hover effect', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      expect(dragHandle).toHaveClass('transition-colors');
    });
  });

  describe('Visual Feedback', () => {
    it('should apply opacity when isDragging is true', () => {
      // Mock isDragging state
      vi.mocked(require('@dnd-kit/sortable').useSortable).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: true,
        isOver: false,
      });

      const { container } = render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ opacity: '0.5' });
    });

    it('should have normal opacity when not dragging', () => {
      vi.mocked(require('@dnd-kit/sortable').useSortable).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
        isOver: false,
      });

      const { container } = render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ opacity: '1' });
    });

    it('should apply dashed border when isDragging is true', () => {
      vi.mocked(require('@dnd-kit/sortable').useSortable).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: true,
        isOver: false,
      });

      const { container } = render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('border-2', 'border-dashed', 'border-blue-400');
    });

    it('should apply drop zone highlight when isOver is true', () => {
      vi.mocked(require('@dnd-kit/sortable').useSortable).mockReturnValue({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
        isOver: true,
      });

      const { container } = render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('bg-blue-50', 'border-t-2', 'border-blue-300');
    });
  });

  describe('Accessibility', () => {
    it('should have screen reader instructions', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const instructions = screen.getByText(
        /กดค้างและลากเพื่อเปลี่ยนตำแหน่งหมวดหมู่/
      );
      expect(instructions).toBeInTheDocument();
      expect(instructions).toHaveClass('sr-only');
    });

    it('should mention alternative keyboard navigation in instructions', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const instructions = screen.getByText(
        /ใช้ปุ่มลูกศรสำหรับผู้ใช้คีย์บอร์ด/
      );
      expect(instructions).toBeInTheDocument();
    });

    it('should have proper ARIA structure', () => {
      render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const dragHandle = screen.getByLabelText('ลากเพื่อจัดเรียง');
      const instructionsId = dragHandle.getAttribute('aria-describedby');
      
      expect(instructionsId).toBe('drag-instructions');
      
      const instructions = document.getElementById(instructionsId!);
      expect(instructions).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use flexbox layout for proper alignment', () => {
      const { container } = render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toBeInTheDocument();
      expect(flexContainer).toHaveClass('items-center', 'gap-2');
    });

    it('should allow content to flex-grow', () => {
      const { container } = render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const contentWrapper = container.querySelector('.flex-1');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('should position wrapper relatively', () => {
      const { container } = render(
        <DndContext>
          <DraggableCategory id="test-id">
            <div>Content</div>
          </DraggableCategory>
        </DndContext>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('relative');
    });
  });
});
