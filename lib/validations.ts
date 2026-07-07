import { z } from 'zod';

// Medication validation schema
// Validates requirements: 3.2, 3.3, 3.6, 3.7, 3.8, 9.1, 9.2, 9.3
export const MedicationSchema = z.object({
  // Required field: Medication Name (Req 3.2, 9.2)
  name: z.string().min(1, 'กรุณากรอกชื่อยา'),
  
  // Optional field: Trade Name (Req 3.2)
  tradeName: z.string().optional().or(z.literal('')),
  
  // Optional field: Expiration Date with date format validation (Req 3.2, 3.8, 9.1)
  expirationDate: z.coerce.date().nullable().optional(),
  
  // Required field: Medication Status string validation (Req 3.2, 3.7, 9.3)
  // Updated to support new status values as per Task 4 requirements
  status: z.enum(['Y', 'Y*', 'N', 'N*', 'N/A', 'case by case', 'ยาฉุกเฉิน', '≤20mg/day'], {
    message: 'กรุณาเลือกสถานะที่ถูกต้อง'
  }),
  
  // Optional field: Dose (e.g., "20 MG")
  dose: z.string().optional().or(z.literal('')),
  
  // Optional field: Dose Details (e.g., "ทน SE amlo ไม่ได้")
  doseDetails: z.string().optional().or(z.literal('')),
  
  // Optional field: Half Life (Req 3.2)
  halfLife: z.string().optional().or(z.literal('')),
  
  // Optional field: Side Effects (Req 3.2)
  sideEffects: z.string().optional().or(z.literal('')),
  
  // Optional field: Notes (Req 3.2)
  notes: z.string().optional().or(z.literal('')),
  
  // Required field: Category reference with CUID validation (Req 3.2, 3.3, 9.5)
  categoryId: z.string().cuid('กรุณาเลือกหมวดหมู่ที่ถูกต้อง'),
});

// Category validation schema
export const CategorySchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหมวดหมู่'),
  parentId: z.string().cuid().nullable(),
});

// Auth validation schema
export const LoginSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});
