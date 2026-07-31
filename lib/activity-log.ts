import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type ActivityEntity = 'Category' | 'Medication' | 'LineUser' | 'User';

interface LogActivityParams {
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: string;
  entityName?: string;
  details?: string;
  request?: Request;
}

/**
 * Log user activity for audit trail
 */
export async function logActivity({
  action,
  entity,
  entityId,
  entityName,
  details,
  request,
}: LogActivityParams): Promise<void> {
  try {
    // Get authenticated user
    const session = await auth();
    
    // Extract IP and User Agent from request if provided
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    
    if (request) {
      ipAddress = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  undefined;
      userAgent = request.headers.get('user-agent') || undefined;
    }

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        userId: session?.user?.id,
        username: session?.user?.username || 'Unknown',
        action,
        entity,
        entityId,
        entityName,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log error but don't throw - logging should not break main functionality
    console.error('Failed to log activity:', error);
  }
}

/**
 * Get recent activity logs
 */
export async function getActivityLogs({
  limit = 50,
  offset = 0,
  entity,
  action,
  userId,
}: {
  limit?: number;
  offset?: number;
  entity?: ActivityEntity;
  action?: ActivityAction;
  userId?: string;
} = {}) {
  const where: any = {};
  
  if (entity) where.entity = entity;
  if (action) where.action = action;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Get activity statistics
 */
export async function getActivityStats() {
  const [totalLogs, byAction, byEntity, recentUsers] = await Promise.all([
    // Total logs
    prisma.activityLog.count(),
    
    // Count by action
    prisma.activityLog.groupBy({
      by: ['action'],
      _count: true,
    }),
    
    // Count by entity
    prisma.activityLog.groupBy({
      by: ['entity'],
      _count: true,
    }),
    
    // Recent active users
    prisma.activityLog.findMany({
      distinct: ['userId'],
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        userId: true,
        username: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    totalLogs,
    byAction: byAction.reduce((acc: Record<string, number>, item: any) => {
      acc[item.action] = item._count;
      return acc;
    }, {}),
    byEntity: byEntity.reduce((acc: Record<string, number>, item: any) => {
      acc[item.entity] = item._count;
      return acc;
    }, {}),
    recentUsers,
  };
}
