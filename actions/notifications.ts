'use server';

import { db } from '@/db';
import { notifications } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function getNotifications() {
  const session = await auth();
  if (!session?.user) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);
}

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user) return 0;

  const result = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));

  return result.length;
}

export async function markAsRead(notifId: string) {
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notifId));
}

export async function markAllRead() {
  const session = await auth();
  if (!session?.user) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, session.user.id));
}
