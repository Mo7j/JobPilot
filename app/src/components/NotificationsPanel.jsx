import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCheck, AlertTriangle, Info, FileCheck, BellRing } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { formatRelativeTime } from '../lib/dates';
import { cn } from '../lib/utils';

const PRIORITY_STYLE = {
  urgent: 'text-danger bg-danger-soft',
  high: 'text-amber-ink bg-amber-soft',
  normal: 'text-accent-ink bg-accent-soft',
  low: 'text-muted bg-card-2',
};

const TYPE_ICON = {
  error: AlertTriangle,
  approval_needed: FileCheck,
  insight: Info,
  summary: Info,
  file_ready: FileCheck,
};

export default function NotificationsPanel({ open, onClose }) {
  const { notifications, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  function openNotification(n) {
    markRead(n.id);
    if (n.actionUrl?.startsWith('/')) {
      navigate(n.actionUrl);
      onClose();
    } else if (n.actionUrl) {
      window.open(n.actionUrl, '_blank', 'noreferrer');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close notifications"
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-sm flex-col bg-card border-l border-line shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <header className="flex items-center gap-2 border-b border-line px-5 py-4">
              <BellRing size={18} className="text-accent" />
              <h2 className="font-display font-bold flex-1">Notifications</h2>
              {notifications.length > 0 && (
                <button type="button" onClick={markAllRead} className="btn-ghost !px-2.5 !py-1.5 text-xs">
                  <CheckCheck size={14} /> Clear all
                </button>
              )}
              <button type="button" onClick={onClose} className="btn-ghost !p-2" aria-label="Close">
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-3">
              {notifications.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted">
                  All caught up, the crew will ping you here.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {notifications.map((n) => {
                    const Icon = TYPE_ICON[n.type] ?? Info;
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => openNotification(n)}
                          className="w-full rounded-2xl border border-line bg-card hover:bg-card-2 p-4 text-left transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <span className={cn('rounded-xl p-2', PRIORITY_STYLE[n.priority] ?? PRIORITY_STYLE.normal)}>
                              <Icon size={15} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold leading-snug">{n.title}</p>
                              <p className="mt-0.5 text-xs text-muted leading-relaxed">{n.body}</p>
                              <p className="mt-1.5 text-[11px] font-semibold text-faint">
                                {n.agentId} · {formatRelativeTime(n.createdAt)}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
