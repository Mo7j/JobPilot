import { useMemo, useState } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Topbar from './Topbar';
import DemoBanner from './DemoBanner';
import NotificationsPanel from './NotificationsPanel';
import { useCollection } from '../hooks/useCollection';
import { useNotifications } from '../hooks/useNotifications';
import { usePushSync } from '../hooks/usePushSync';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { isDemo } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { docs: approvals } = useCollection('approvalQueue');
  const { docs: agentRequests } = useCollection('agentRequests');
  const { unreadCount } = useNotifications();
  usePushSync();

  const pendingCount = useMemo(
    () =>
      approvals.filter((a) => a.status === 'pending').length +
      agentRequests.filter((r) => r.status === 'open').length,
    [approvals, agentRequests],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      {isDemo && <DemoBanner />}
      <div className="flex flex-1">
        <Sidebar pendingCount={pendingCount} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            unreadCount={unreadCount}
            onOpenNotifications={() => setNotificationsOpen(true)}
          />
          <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
      <MobileNav pendingCount={pendingCount} />
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
