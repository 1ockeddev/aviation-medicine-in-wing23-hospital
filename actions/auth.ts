'use server';

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { LoginSchema } from '@/lib/validations';
import { redirect } from 'next/navigation';

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    // Validate form data
    const validatedFields = LoginSchema.safeParse({
      username: formData.get('username'),
      password: formData.get('password'),
    });

    if (!validatedFields.success) {
      return 'กรุณากรอกข้อมูลให้ครบถ้วน';
    }

    // Attempt sign in
    await signIn('credentials', {
      username: validatedFields.data.username,
      password: validatedFields.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        default:
          return 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      }
    }
    throw error;
  }
  
  redirect('/admin');
}

export async function logout() {
  await signOut({ redirectTo: '/' });
}
