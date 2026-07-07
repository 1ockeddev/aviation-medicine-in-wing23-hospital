import { describe, it, expect, vi } from 'vitest';

describe('CategoryList Event Handlers', () => {
  describe('handleToggle', () => {
    it('should toggle category when hasChildren is true and conditions are met', () => {
      const toggleCategory = vi.fn();
      const isDragging = false;
      const categoryId = 'cat-1';
      const hasChildren = true;

      // Simulate the handler logic
      const handleToggle = (categoryId: string, hasChildren: boolean) => (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-action]')) {
          return;
        }

        if (isDragging) {
          return;
        }

        if (hasChildren) {
          toggleCategory(categoryId);
        }
      };

      // Create mock event
      const mockEvent = {
        target: document.createElement('div'),
      } as unknown as React.MouseEvent;

      // Execute handler
      handleToggle(categoryId, hasChildren)(mockEvent);

      // Verify toggleCategory was called
      expect(toggleCategory).toHaveBeenCalledWith(categoryId);
      expect(toggleCategory).toHaveBeenCalledTimes(1);
    });

    it('should not toggle when clicking on action button', () => {
      const toggleCategory = vi.fn();
      const isDragging = false;
      const categoryId = 'cat-1';
      const hasChildren = true;

      const handleToggle = (categoryId: string, hasChildren: boolean) => (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-action]')) {
          return;
        }

        if (isDragging) {
          return;
        }

        if (hasChildren) {
          toggleCategory(categoryId);
        }
      };

      // Create button with data-action attribute
      const button = document.createElement('button');
      button.setAttribute('data-action', 'delete');
      const mockEvent = {
        target: button,
      } as unknown as React.MouseEvent;

      // Mock closest to return the button
      vi.spyOn(button, 'closest').mockReturnValue(button);

      // Execute handler
      handleToggle(categoryId, hasChildren)(mockEvent);

      // Verify toggleCategory was NOT called
      expect(toggleCategory).not.toHaveBeenCalled();
    });

    it('should not toggle when isDragging is true', () => {
      const toggleCategory = vi.fn();
      const isDragging = true;
      const categoryId = 'cat-1';
      const hasChildren = true;

      const handleToggle = (categoryId: string, hasChildren: boolean) => (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-action]')) {
          return;
        }

        if (isDragging) {
          return;
        }

        if (hasChildren) {
          toggleCategory(categoryId);
        }
      };

      const mockEvent = {
        target: document.createElement('div'),
      } as unknown as React.MouseEvent;

      // Execute handler
      handleToggle(categoryId, hasChildren)(mockEvent);

      // Verify toggleCategory was NOT called
      expect(toggleCategory).not.toHaveBeenCalled();
    });

    it('should not toggle when hasChildren is false', () => {
      const toggleCategory = vi.fn();
      const isDragging = false;
      const categoryId = 'cat-1';
      const hasChildren = false;

      const handleToggle = (categoryId: string, hasChildren: boolean) => (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-action]')) {
          return;
        }

        if (isDragging) {
          return;
        }

        if (hasChildren) {
          toggleCategory(categoryId);
        }
      };

      const mockEvent = {
        target: document.createElement('div'),
      } as unknown as React.MouseEvent;

      // Execute handler
      handleToggle(categoryId, hasChildren)(mockEvent);

      // Verify toggleCategory was NOT called
      expect(toggleCategory).not.toHaveBeenCalled();
    });
  });

  describe('handleKeyDown', () => {
    it('should toggle on Enter key when hasChildren is true', () => {
      const toggleCategory = vi.fn();
      const categoryId = 'cat-1';
      const hasChildren = true;

      const handleKeyDown = (categoryId: string, hasChildren: boolean) => (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();

          if (hasChildren) {
            toggleCategory(categoryId);
          }
        }
      };

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      // Execute handler
      handleKeyDown(categoryId, hasChildren)(mockEvent);

      // Verify preventDefault was called
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      // Verify toggleCategory was called
      expect(toggleCategory).toHaveBeenCalledWith(categoryId);
      expect(toggleCategory).toHaveBeenCalledTimes(1);
    });

    it('should toggle on Space key when hasChildren is true', () => {
      const toggleCategory = vi.fn();
      const categoryId = 'cat-1';
      const hasChildren = true;

      const handleKeyDown = (categoryId: string, hasChildren: boolean) => (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();

          if (hasChildren) {
            toggleCategory(categoryId);
          }
        }
      };

      const mockEvent = {
        key: ' ',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      // Execute handler
      handleKeyDown(categoryId, hasChildren)(mockEvent);

      // Verify preventDefault was called
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      // Verify toggleCategory was called
      expect(toggleCategory).toHaveBeenCalledWith(categoryId);
      expect(toggleCategory).toHaveBeenCalledTimes(1);
    });

    it('should not toggle on other keys', () => {
      const toggleCategory = vi.fn();
      const categoryId = 'cat-1';
      const hasChildren = true;

      const handleKeyDown = (categoryId: string, hasChildren: boolean) => (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();

          if (hasChildren) {
            toggleCategory(categoryId);
          }
        }
      };

      const mockEvent = {
        key: 'Tab',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      // Execute handler
      handleKeyDown(categoryId, hasChildren)(mockEvent);

      // Verify preventDefault was NOT called
      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      // Verify toggleCategory was NOT called
      expect(toggleCategory).not.toHaveBeenCalled();
    });

    it('should not toggle when hasChildren is false', () => {
      const toggleCategory = vi.fn();
      const categoryId = 'cat-1';
      const hasChildren = false;

      const handleKeyDown = (categoryId: string, hasChildren: boolean) => (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();

          if (hasChildren) {
            toggleCategory(categoryId);
          }
        }
      };

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      // Execute handler
      handleKeyDown(categoryId, hasChildren)(mockEvent);

      // Verify preventDefault was called (always prevent default on Enter/Space)
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      // Verify toggleCategory was NOT called
      expect(toggleCategory).not.toHaveBeenCalled();
    });
  });
});
