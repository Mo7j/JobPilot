import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  KanbanSquare,
  Bot,
  LineChart,
  ClipboardList,
  Settings,
} from 'lucide-react';
import GitHubIcon from './GitHubIcon';
import { cn } from '../lib/utils';
import { repoUrl } from '../config';

export const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/approvals', label: 'Approvals', icon: Inbox, badge: 'approvals' },
  { to: '/applications', label: 'Applications', icon: KanbanSquare },
  { to: '/agents', label: 'Agents', icon: Bot },
  { to: '/insights', label: 'Insights', icon: LineChart },
  { to: '/tracker', label: 'Tracker', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ pendingCount = 0 }) {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col gap-1 border-r border-line bg-card px-3 py-5 sticky top-0 h-dvh">
      <div className="flex items-center gap-2.5 px-3 pb-5 min-h-0">
        <img src="/jobpilot-192.png" alt="" className="size-8 rounded-xl" />
        <span className="font-display font-bold text-lg tracking-tight">JobPilot</span>
      </div>

      <nav className="flex min-h-0 flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-muted hover:bg-card-2 hover:text-ink',
              )
            }
          >
            <Icon size={18} strokeWidth={2.2} />
            <span className="flex-1">{label}</span>
            {badge === 'approvals' && pendingCount > 0 && (
              <span className="chip bg-accent text-white">{pendingCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="fixed bottom-5 left-3 w-[13.5rem]">
        <div className="rounded-2xl bg-accent-soft p-4 shadow-card">
          <p className="text-xs font-bold text-accent-ink">Self-hosted</p>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Your Firebase, your data. Agents run on your own Claude.
          </p>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-ink hover:underline"
          >
            <GitHubIcon size={13} /> Star on GitHub
          </a>
        </div>
      </div>
    </aside>
  );
}
