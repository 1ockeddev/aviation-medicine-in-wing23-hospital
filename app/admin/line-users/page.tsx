import { prisma } from '@/lib/prisma';
import { LineUsersClientPage } from './LineUsersClientPage';

// Disable caching for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getLineUsers() {
  return await prisma.lineUser.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getStatistics() {
  const total = await prisma.lineUser.count();
  const enabled = await prisma.lineUser.count({
    where: { notificationsEnabled: true },
  });
  const disabled = total - enabled;
  const percentage = total > 0 ? Math.round((enabled / total) * 100) : 0;

  return { total, enabled, disabled, percentage };
}

export default async function LineUsersPage() {
  const [lineUsers, statistics] = await Promise.all([
    getLineUsers(),
    getStatistics(),
  ]);

  return <LineUsersClientPage lineUsers={lineUsers} statistics={statistics} />;
}
