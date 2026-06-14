import { useMemo } from 'react';
import { useCollection } from './useCollection';
import { dataSource } from '../data';
import { toDate } from '../lib/dates';

export function useNotifications() {
  const { docs } = useCollection('notifications');

  const notifications = useMemo(
    () =>
      docs
        .filter((n) => !n.read)
        .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)),
    [docs],
  );

  async function markRead(notificationId) {
    await dataSource.updateDoc('notifications', notificationId, { read: true });
  }

  async function markAllRead() {
    await Promise.all(notifications.map((n) => markRead(n.id)));
  }

  return { notifications, markRead, markAllRead };
}
