import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DragHandleIcon } from './DragHandleIcon';

describe('DragHandleIcon', () => {
  describe('Rendering', () => {
    it('should render icon correctly', () => {
      const { container } = render(<DragHandleIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with six dots (circles)', () => {
      const { container } = render(<DragHandleIcon />);
      
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(6);
    });

    it('should have correct sizing classes (w-5 h-5)', () => {
      const { container } = render(<DragHandleIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-5', 'h-5');
    });

    it('should have correct color class (text-gray-600)', () => {
      const { container } = render(<DragHandleIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-gray-600');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<DragHandleIcon className="custom-class" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-class');
    });

    it('should preserve default classes when custom className is provided', () => {
      const { container } = render(<DragHandleIcon className="custom-class" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-5', 'h-5', 'text-gray-600', 'custom-class');
    });

    it('should allow overriding default color', () => {
      const { container } = render(<DragHandleIcon className="text-blue-500" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-500');
    });
  });

  describe('Accessibility', () => {
    it('should have proper contrast ratio (visual verification)', () => {
      // Note: Automated color contrast testing requires additional libraries
      // This test documents the requirement - actual contrast should be verified manually
      // or with specialized tools. The text-gray-600 on white background typically
      // achieves > 4.5:1 contrast ratio as required.
      const { container } = render(<DragHandleIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-gray-600');
      
      // Requirement 11.1: Contrast ratio minimum 4.5:1
      // text-gray-600 (#4B5563) on white (#FFFFFF) = ~7.7:1 contrast ratio ✓
    });

    it('should be scalable (SVG format)', () => {
      const { container } = render(<DragHandleIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox');
    });
  });

  describe('SVG Structure', () => {
    it('should use currentColor for fill', () => {
      const { container } = render(<DragHandleIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('should have correct viewBox dimensions', () => {
      const { container } = render(<DragHandleIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    });

    it('should render six dots in correct positions', () => {
      const { container } = render(<DragHandleIcon />);
      
      const circles = container.querySelectorAll('circle');
      
      // Left column: cx="9"
      const leftCircles = Array.from(circles).filter(
        circle => circle.getAttribute('cx') === '9'
      );
      expect(leftCircles).toHaveLength(3);
      
      // Right column: cx="15"
      const rightCircles = Array.from(circles).filter(
        circle => circle.getAttribute('cx') === '15'
      );
      expect(rightCircles).toHaveLength(3);
    });

    it('should have consistent circle radius', () => {
      const { container } = render(<DragHandleIcon />);
      
      const circles = container.querySelectorAll('circle');
      
      circles.forEach(circle => {
        expect(circle).toHaveAttribute('r', '1.5');
      });
    });
  });
});
