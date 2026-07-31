import { getActivityLogs, getActivityStats } from '@/lib/activity-log';
import { LogsClientPage } from './LogsClientPage';

export const metadata = {
  title: 'Activity Logs | Admin',
  description: 'View system activity and audit trail',
};

export default async function LogsPage({
  searchParams,
}: {
  searchParams: { page?: string; entity?: string; action?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const [{ logs, total }, stats] = await Promise.all([
    getActivityLogs({
      limit,
      offset,
      entity: searchParams.entity as any,
      action: searchParams.action as any,
    }),
    getActivityStats(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <LogsClientPage
      logs={logs}
      stats={stats}
      currentPage={page}
      totalPages={totalPages}
      totalLogs={total}
    />
  );
}
