import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PlusIcon, MinusIcon } from './AccordionIcons';

describe('PlusIcon', () => {
  describe('Rendering', () => {
    it('should render icon correctly', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with two lines (vertical and horizontal)', () => {
      const { container } = render(<PlusIcon />);
      
      const lines = container.querySelectorAll('line');
      expect(lines).toHaveLength(2);
    });

    it('should have correct sizing classes (w-4 h-4 for 16x16px)', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4');
    });

    it('should have stroke instead of fill', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<PlusIcon className="custom-class" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-class');
    });

    it('should preserve default classes when custom className is provided', () => {
      const { container } = render(<PlusIcon className="custom-class" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4', 'custom-class');
    });

    it('should allow overriding color with custom class', () => {
      const { container } = render(<PlusIcon className="text-blue-500" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-500');
    });
  });

  describe('SVG Structure', () => {
    it('should use currentColor for stroke', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });

    it('should have correct viewBox dimensions (16x16)', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    });

    it('should render vertical line correctly', () => {
      const { container } = render(<PlusIcon />);
      
      const lines = container.querySelectorAll('line');
      const verticalLine = Array.from(lines).find(
        line => line.getAttribute('x1') === '8' && line.getAttribute('x2') === '8'
      );
      
      expect(verticalLine).toBeDefined();
      expect(verticalLine).toHaveAttribute('y1', '4');
      expect(verticalLine).toHaveAttribute('y2', '12');
    });

    it('should render horizontal line correctly', () => {
      const { container } = render(<PlusIcon />);
      
      const lines = container.querySelectorAll('line');
      const horizontalLine = Array.from(lines).find(
        line => line.getAttribute('y1') === '8' && line.getAttribute('y2') === '8'
      );
      
      expect(horizontalLine).toBeDefined();
      expect(horizontalLine).toHaveAttribute('x1', '4');
      expect(horizontalLine).toHaveAttribute('x2', '12');
    });

    it('should have rounded line caps', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-linecap', 'round');
    });

    it('should have rounded line joins', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-linejoin', 'round');
    });

    it('should have appropriate stroke width', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-width', '2');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden attribute', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be scalable (SVG format)', () => {
      const { container } = render(<PlusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox');
    });
  });
});

describe('MinusIcon', () => {
  describe('Rendering', () => {
    it('should render icon correctly', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with one horizontal line', () => {
      const { container } = render(<MinusIcon />);
      
      const lines = container.querySelectorAll('line');
      expect(lines).toHaveLength(1);
    });

    it('should have correct sizing classes (w-4 h-4 for 16x16px)', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4');
    });

    it('should have stroke instead of fill', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'none');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<MinusIcon className="custom-class" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('custom-class');
    });

    it('should preserve default classes when custom className is provided', () => {
      const { container } = render(<MinusIcon className="custom-class" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4', 'custom-class');
    });

    it('should allow overriding color with custom class', () => {
      const { container } = render(<MinusIcon className="text-red-500" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-red-500');
    });
  });

  describe('SVG Structure', () => {
    it('should use currentColor for stroke', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
    });

    it('should have correct viewBox dimensions (16x16)', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
    });

    it('should render horizontal line correctly', () => {
      const { container } = render(<MinusIcon />);
      
      const lines = container.querySelectorAll('line');
      const line = lines[0];
      
      expect(line).toHaveAttribute('x1', '4');
      expect(line).toHaveAttribute('x2', '12');
      expect(line).toHaveAttribute('y1', '8');
      expect(line).toHaveAttribute('y2', '8');
    });

    it('should have rounded line caps', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-linecap', 'round');
    });

    it('should have rounded line joins', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-linejoin', 'round');
    });

    it('should have appropriate stroke width', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('stroke-width', '2');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden attribute', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be scalable (SVG format)', () => {
      const { container } = render(<MinusIcon />);
      
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox');
    });
  });
});

describe('Icon Consistency', () => {
  it('should have same size for both icons', () => {
    const { container: plusContainer } = render(<PlusIcon />);
    const { container: minusContainer } = render(<MinusIcon />);
    
    const plusSvg = plusContainer.querySelector('svg');
    const minusSvg = minusContainer.querySelector('svg');
    
    expect(plusSvg?.getAttribute('viewBox')).toBe(minusSvg?.getAttribute('viewBox'));
    expect(plusSvg).toHaveClass('w-4', 'h-4');
    expect(minusSvg).toHaveClass('w-4', 'h-4');
  });

  it('should use currentColor for both icons', () => {
    const { container: plusContainer } = render(<PlusIcon />);
    const { container: minusContainer } = render(<MinusIcon />);
    
    const plusSvg = plusContainer.querySelector('svg');
    const minusSvg = minusContainer.querySelector('svg');
    
    expect(plusSvg?.getAttribute('stroke')).toBe('currentColor');
    expect(minusSvg?.getAttribute('stroke')).toBe('currentColor');
  });

  it('should have same stroke width for both icons', () => {
    const { container: plusContainer } = render(<PlusIcon />);
    const { container: minusContainer } = render(<MinusIcon />);
    
    const plusSvg = plusContainer.querySelector('svg');
    const minusSvg = minusContainer.querySelector('svg');
    
    expect(plusSvg?.getAttribute('stroke-width')).toBe('2');
    expect(minusSvg?.getAttribute('stroke-width')).toBe('2');
  });
});
