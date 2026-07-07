import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './Table';

describe('Table', () => {
  describe('Rendering with Mock Data', () => {
    it('should render table with headers and data rows', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>City</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>30</TableCell>
              <TableCell>New York</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>25</TableCell>
              <TableCell>Los Angeles</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      // Check headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('City')).toBeInTheDocument();

      // Check data
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    });

    it('should render table with multiple rows', () => {
      const mockData = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 },
        { id: 3, name: 'Item 3', value: 300 },
      ];

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );

      mockData.forEach((item) => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
        expect(screen.getByText(item.value.toString())).toBeInTheDocument();
      });
    });

    it('should render table with footer', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Widget</TableCell>
              <TableCell>$10</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>$10</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should render table with caption', () => {
      render(
        <Table>
          <TableCaption>List of users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>User 1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('List of users')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty table body', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column 1</TableHead>
              <TableHead>Column 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody />
        </Table>
      );

      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Column 2')).toBeInTheDocument();
    });

    it('should render empty state message', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should handle empty data array', () => {
      const emptyData: any[] = [];

      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emptyData.length === 0 ? (
              <TableRow>
                <TableCell>No items found</TableCell>
              </TableRow>
            ) : (
              emptyData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });

  describe('Table Component Styles', () => {
    it('should apply base table styles', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Data</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = container.querySelector('table');
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    });

    it('should have overflow wrapper', () => {
      const { container } = render(
        <Table>
          <TableBody />
        </Table>
      );

      const wrapper = container.querySelector('.overflow-auto');
      expect(wrapper).toBeInTheDocument();
    });

    it('should apply header styles', () => {
      const { container } = render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const thead = container.querySelector('thead');
      expect(thead).toHaveClass('border-b', 'bg-gray-50');
    });

    it('should apply footer styles', () => {
      const { container } = render(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      const tfoot = container.querySelector('tfoot');
      expect(tfoot).toHaveClass('border-t', 'bg-gray-50', 'font-medium');
    });

    it('should apply row hover styles', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = container.querySelector('tr');
      expect(row).toHaveClass('border-b', 'hover:bg-gray-50');
    });

    it('should apply head cell styles', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header Cell</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      const th = screen.getByText('Header Cell');
      expect(th).toHaveClass('h-12', 'px-4', 'text-left', 'font-medium', 'text-gray-700');
    });

    it('should apply body cell styles', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Body Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const td = screen.getByText('Body Cell');
      expect(td).toHaveClass('p-4', 'align-middle');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className on Table', () => {
      const { container } = render(
        <Table className="custom-table">
          <TableBody />
        </Table>
      );

      const table = container.querySelector('table');
      expect(table).toHaveClass('custom-table');
    });

    it('should accept custom className on TableRow', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <TableRow className="custom-row">
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const row = container.querySelector('.custom-row');
      expect(row).toBeInTheDocument();
    });

    it('should accept custom className on TableCell', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="custom-cell">Custom Cell Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByText('Custom Cell Content');
      expect(cell).toHaveClass('custom-cell');
    });

    it('should support colSpan on TableCell', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3}>Spanning Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const cell = screen.getByText('Spanning Cell');
      expect(cell).toHaveAttribute('colspan', '3');
    });
  });

  describe('Complex Table Structure', () => {
    it('should render nested table structure correctly', () => {
      const medications = [
        { id: 1, name: 'Aspirin', category: 'Pain Relief', stock: 100 },
        { id: 2, name: 'Ibuprofen', category: 'Pain Relief', stock: 50 },
        { id: 3, name: 'Amoxicillin', category: 'Antibiotic', stock: 75 },
      ];

      render(
        <Table>
          <TableCaption>Hospital Medication Inventory</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Medication Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med) => (
              <TableRow key={med.id}>
                <TableCell>{med.id}</TableCell>
                <TableCell>{med.name}</TableCell>
                <TableCell>{med.category}</TableCell>
                <TableCell>{med.stock}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total Items</TableCell>
              <TableCell>{medications.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      // Verify caption
      expect(screen.getByText('Hospital Medication Inventory')).toBeInTheDocument();

      // Verify headers
      expect(screen.getByText('Medication Name')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();

      // Verify data
      expect(screen.getByText('Aspirin')).toBeInTheDocument();
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
      expect(screen.getByText('Amoxicillin')).toBeInTheDocument();

      // Verify footer
      expect(screen.getByText('Total Items')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref on Table', () => {
      const ref = { current: null };
      render(
        <Table ref={ref}>
          <TableBody />
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableElement);
    });

    it('should forward ref on TableHeader', () => {
      const ref = { current: null };
      render(
        <Table>
          <TableHeader ref={ref}>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
    });

    it('should forward ref on TableBody', () => {
      const ref = { current: null };
      render(
        <Table>
          <TableBody ref={ref}>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      expect(ref.current).toBeInstanceOf(HTMLTableSectionElement);
    });
  });
});
