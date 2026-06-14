import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Inbox, KanbanSquare, Bot, LineChart, ClipboardList, Settings, MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';

const PRIMARY = [
  { to: '/',             label: 'Overview',  icon: LayoutDashboard, end: true },
  { to: '/approvals',    label: 'Approvals', icon: Inbox, badge: true },
  { to: '/applications', label: 'Pipeline',  icon: KanbanSquare },
  { to: '/agents',       label: 'Agents',    icon: Bot },
];

const MORE = [
  { to: '/insights', label: 'Insights', icon: LineChart },
  { to: '/tracker',  label: 'Tracker',  icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const spring = { delay: 0.05, type: 'spring', bounce: 0, duration: 0.5 };

const btnVariants = {
  animate: (isActive) => ({
    gap: isActive ? '0.4rem' : 0,
    paddingLeft:  isActive ? '0.875rem' : '0.625rem',
    paddingRight: isActive ? '0.875rem' : '0.625rem',
  }),
};

const labelVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: 'auto', opacity: 1 },
  exit:    { width: 0, opacity: 0 },
};

export default function MobileNav({ pendingCount = 0 }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to);

  const moreIsActive = MORE.some((item) => pathname.startsWith(item.to));

  const handleNav = (to) => {
    setMoreOpen(false);
    navigate(to);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* More sheet */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="sheet"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={spring}
            className="lg:hidden fixed bottom-24 left-4 right-4 z-50 rounded-2xl border border-line bg-card shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)] p-2"
          >
            {MORE.map((item) => {
              const active = pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <button
                  key={item.to}
                  onClick={() => handleNav(item.to)}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors"
                  style={{
                    color: active ? 'var(--accent-ink)' : 'var(--muted)',
                    backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-4 mb-4 flex items-center justify-between rounded-2xl border border-line bg-card/95 backdrop-blur-md shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] px-2 py-1.5">
          {PRIMARY.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <motion.button
                key={item.to}
                variants={btnVariants}
                initial={false}
                animate="animate"
                custom={active}
                transition={spring}
                onClick={() => handleNav(item.to)}
                className="relative flex items-center rounded-xl py-2 text-sm font-semibold transition-colors duration-200"
                style={{
                  color: active ? 'var(--accent-ink)' : 'var(--faint)',
                  backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 2} />
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.span
                      variants={labelVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={spring}
                      className="overflow-hidden whitespace-nowrap text-[13px]"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </motion.button>
            );
          })}

          {/* More button */}
          <motion.button
            variants={btnVariants}
            initial={false}
            animate="animate"
            custom={moreOpen || moreIsActive}
            transition={spring}
            onClick={() => setMoreOpen((v) => !v)}
            className="relative flex items-center rounded-xl py-2 text-sm font-semibold transition-colors duration-200"
            style={{
              color: moreOpen || moreIsActive ? 'var(--accent-ink)' : 'var(--faint)',
              backgroundColor: moreOpen || moreIsActive ? 'var(--accent-soft)' : 'transparent',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {moreOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={20} strokeWidth={2.4} />
                </motion.span>
              ) : (
                <motion.span key="more" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <MoreHorizontal size={20} strokeWidth={2} />
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {(moreOpen || moreIsActive) && (
                <motion.span
                  variants={labelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={spring}
                  className="overflow-hidden whitespace-nowrap text-[13px]"
                >
                  More
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>
    </>
  );
}
