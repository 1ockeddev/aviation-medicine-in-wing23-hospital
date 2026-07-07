/**
 * UI Components Usage Examples
 * 
 * This file demonstrates how to use the reusable UI components.
 * These examples can be copied into your actual pages/components.
 */

'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Dialog } from './Dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';
import { DragHandleIcon } from './DragHandleIcon';

// Example: Button Component
export function ButtonExample() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Button Variants</h3>
      <div className="flex gap-2 flex-wrap">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>
      
      <h3 className="font-semibold">Button Sizes</h3>
      <div className="flex gap-2 items-center">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
      
      <h3 className="font-semibold">Button States</h3>
      <div className="flex gap-2">
        <Button disabled>Disabled</Button>
        <Button variant="danger" disabled>Disabled Danger</Button>
      </div>
    </div>
  );
}

// Example: Input Component
export function InputExample() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    
    if (val.length < 3) {
      setError('กรุณากรอกอย่างน้อย 3 ตัวอักษร');
    } else {
      setError('');
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold">Input Component</h3>
      
      <Input
        label="ชื่อยา"
        placeholder="กรอกชื่อยา"
        required
      />
      
      <Input
        type="date"
        label="วันหมดอายุ"
      />
      
      <Input
        label="ชื่อทางการค้า"
        placeholder="กรอกชื่อทางการค้า"
        value={value}
        onChange={handleValidation}
        error={error}
      />
    </div>
  );
}

// Example: Select Component
export function SelectExample() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');

  const categories = [
    { value: '1', label: 'Analgesics (ยาแก้ปวด)' },
    { value: '2', label: 'Antibiotics (ยาปฏิชีวนะ)' },
    { value: '3', label: 'Cardiovascular (ยาหัวใจและหลอดเลือด)' },
  ];

  const fdaOptions = [
    { value: 'Approved', label: 'Approved' },
    { value: 'Not Approved', label: 'Not Approved' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    
    if (!value) {
      setError('กรุณาเลือกหมวดหมู่');
    } else {
      setError('');
    }
  };

  return (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold">Select Component</h3>
      
      <Select
        label="หมวดหมู่"
        placeholder="เลือกหมวดหมู่"
        options={categories}
        required
        value={selectedCategory}
        onChange={handleChange}
        error={error}
      />
      
      <Select
        label="สถานะ FDA"
        options={fdaOptions}
        defaultValue="Approved"
      />
    </div>
  );
}

// Example: Dialog Component
export function DialogExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsOpen(false);
    alert('ดำเนินการเสร็จสิ้น');
  };

  const handleDelete = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsDeleteOpen(false);
    alert('ลบข้อมูลเสร็จสิ้น');
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Dialog Component</h3>
      
      <div className="flex gap-2">
        <Button onClick={() => setIsOpen(true)}>
          Open Dialog
        </Button>
        <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
          Delete Confirmation
        </Button>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="ยืนยันการดำเนินการ"
        description="คุณต้องการบันทึกข้อมูลนี้หรือไม่?"
        confirmLabel="บันทึก"
        cancelLabel="ยกเลิก"
        onConfirm={handleConfirm}
        loading={isLoading}
      />

      <Dialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="ยืนยันการลบ"
        description="คุณแน่ใจหรือไม่ที่จะลบข้อมูลนี้? การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
        variant="danger"
        onConfirm={handleDelete}
        loading={isLoading}
      />
    </div>
  );
}

// Example: Table Component
export function TableExample() {
  const medications = [
    {
      id: '1',
      name: 'Aspirin',
      tradeName: 'Bayer',
      category: 'Analgesics',
      expirationDate: '2025-12-31',
      fdaApproved: 'Approved',
    },
    {
      id: '2',
      name: 'Amoxicillin',
      tradeName: 'Amoxil',
      category: 'Antibiotics',
      expirationDate: '2024-06-30',
      fdaApproved: 'Approved',
    },
    {
      id: '3',
      name: 'Lisinopril',
      tradeName: 'Prinivil',
      category: 'Cardiovascular',
      expirationDate: '2026-03-15',
      fdaApproved: 'Approved',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Table Component</h3>
      
      <Table>
        <TableCaption>รายการยาทั้งหมด</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ชื่อยา</TableHead>
            <TableHead>ชื่อทางการค้า</TableHead>
            <TableHead>หมวดหมู่</TableHead>
            <TableHead>วันหมดอายุ</TableHead>
            <TableHead>สถานะ FDA</TableHead>
            <TableHead className="text-right">การดำเนินการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {medications.map((med) => (
            <TableRow key={med.id}>
              <TableCell className="font-medium">{med.name}</TableCell>
              <TableCell>{med.tradeName}</TableCell>
              <TableCell>{med.category}</TableCell>
              <TableCell>{med.expirationDate}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {med.fdaApproved}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline">แก้ไข</Button>
                  <Button size="sm" variant="danger">ลบ</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Example: DragHandleIcon Component
export function DragHandleIconExample() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">DragHandleIcon Component</h3>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm">Default:</span>
          <DragHandleIcon />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm">Custom color:</span>
          <DragHandleIcon className="text-blue-500" />
          <DragHandleIcon className="text-green-600" />
          <DragHandleIcon className="text-red-500" />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm">With drag handle button:</span>
          <button
            className="p-2 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded"
            aria-label="ลากเพื่อจัดเรียง"
          >
            <DragHandleIcon />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm">In a list context:</span>
          <div className="border rounded-lg p-4 w-full max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <button
                className="p-2 cursor-grab hover:bg-gray-100 rounded"
                aria-label="ลากเพื่อจัดเรียง"
              >
                <DragHandleIcon />
              </button>
              <span>Category Item 1</span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <button
                className="p-2 cursor-grab hover:bg-gray-100 rounded"
                aria-label="ลากเพื่อจัดเรียง"
              >
                <DragHandleIcon />
              </button>
              <span>Category Item 2</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="p-2 cursor-grab hover:bg-gray-100 rounded"
                aria-label="ลากเพื่อจัดเรียง"
              >
                <DragHandleIcon />
              </button>
              <span>Category Item 3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Combined Example Component
export default function UIComponentsExample() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <h1 className="text-3xl font-bold mb-8">UI Components Examples</h1>
      
      <section className="border rounded-lg p-6">
        <ButtonExample />
      </section>
      
      <section className="border rounded-lg p-6">
        <InputExample />
      </section>
      
      <section className="border rounded-lg p-6">
        <SelectExample />
      </section>
      
      <section className="border rounded-lg p-6">
        <DialogExample />
      </section>
      
      <section className="border rounded-lg p-6">
        <TableExample />
      </section>
      
      <section className="border rounded-lg p-6">
        <DragHandleIconExample />
      </section>
    </div>
  );
}
