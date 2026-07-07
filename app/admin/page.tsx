import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

// Disable caching for this page
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Redirect to medications page as default admin page
  redirect('/admin/medications');
}
