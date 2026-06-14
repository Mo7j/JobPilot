import { useLocation } from 'react-router-dom';
import { Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';

const TITLES = {
  '/': 'Overview',
  '/approvals': 'Approvals',
  '/applications': 'Applications',
  '/agents': 'Agents',
  '/insights': 'Insights',
  '/tracker': 'Tracker',
  '/settings': 'Settings',
};

export default function Topbar({ unreadCount = 0, onOpenNotifications }) {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  const initial = (user?.name || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-surface/85 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="flex items-center gap-2.5 lg:hidden">
        <img src="/jobpilot-192.png" alt="" className="size-7 rounded-lg" />
      </div>
      <h1 className="font-display font-bold text-lg tracking-tight flex-1">
        {TITLES[pathname] ?? 'JobPilot'}
      </h1>

      <button
        type="button"
        onClick={toggle}
        className="btn-ghost !p-2.5"
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <button
        type="button"
        onClick={onOpenNotifications}
        className="btn-ghost !p-2.5 relative"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 size-4.5 min-w-4.5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <div
        className="size-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold"
        title={user?.email}
      >
        {initial}
      </div>
    </header>
  );
}
