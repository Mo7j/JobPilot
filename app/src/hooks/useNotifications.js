import { useMemo } from 'react';
import { useCollection } from './useCollection';
import { dataSource } from '../data';
import { toDate } from '../lib/dates';

// How many notifications to keep visible in the bell's history. Read ones stay
// in the list (greyed out) instead of vanishing the moment they're opened; we
// just cap the panel so it can't grow without bound.
const HISTORY_LIMIT = 60;

export function useNotifications() {
  const { docs } = useCollection('notifications');

  const notifications = useMemo(
    () =>
      [...docs]
        .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0))
        .slice(0, HISTORY_LIMIT),
    [docs],
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  async function markRead(notificationId) {
    await dataSource.updateDoc('notifications', notificationId, { read: true });
  }

  async function markAllRead() {
    await Promise.all(notifications.filter((n) => !n.read).map((n) => markRead(n.id)));
  }

  return { notifications, unreadCount, markRead, markAllRead };
}
