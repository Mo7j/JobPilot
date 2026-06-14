import { useMemo, useState } from 'react';
import { Plus, Search, ExternalLink, ClipboardList, ScanSearch, CalendarClock, ChevronDown, Info } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import JobFormSheet, { TRACKER_STATUSES } from '../components/tracker/JobFormSheet';
import AtsChecker from '../components/tracker/AtsChecker';
import EmptyState from '../components/EmptyState';
import { formatDateShort, formatRelativeTime, toDate, isOverdue } from '../lib/dates';
import { cn } from '../lib/utils';

const STATUS_BY_ID = Object.fromEntries(TRACKER_STATUSES.map((s) => [s.id, s]));

export default function Tracker() {
  const { docs: jobs, loading } = useCollection('jobs');
  const [tab, setTab] = useState('applications');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((j) => (statusFilter === 'all' ? true : j.status === statusFilter))
      .filter((j) =>
        !q ||
        [j.companyName, j.position, j.location, j.notes].some((v) => v?.toLowerCase().includes(q)),
      )
      .sort((a, b) => (toDate(b.dateApplied)?.getTime() ?? 0) - (toDate(a.dateApplied)?.getTime() ?? 0));
  }, [jobs, query, statusFilter]);

  function openEdit(job) {
    setEditing(job);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        {tab === 'applications' && (
          <>
            <div className="relative order-2 min-w-0 flex-1 md:min-w-52">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                className="input !pl-9"
                placeholder="Search company, role, notes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="relative order-3 shrink-0">
              <select
                className="input !w-32 appearance-none truncate !pr-7 md:!w-auto md:!pr-8"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                {TRACKER_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-faint"
              />
            </div>
            <button
              type="button"
              aria-label="Add application"
              title="Add application"
              className="btn-primary order-4 shrink-0 !p-2.5 !shadow-[0_2px_8px_-5px_color-mix(in_srgb,var(--accent)_45%,transparent)]"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus size={17} />
            </button>
          </>
        )}

        <div className="order-1 flex w-full items-center gap-1 rounded-2xl border border-line bg-card p-1 md:w-fit md:shrink-0">
          {[
            { id: 'applications', label: 'Applications', icon: ClipboardList },
            { id: 'ats', label: 'ATS check', icon: ScanSearch },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors md:flex-none md:px-4',
                tab === id ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:text-ink',
              )}
            >
              <Icon size={15} className="shrink-0" /> {label}
            </button>
          ))}
        </div>

        {tab === 'ats' && (
          <p className="order-5 flex items-start gap-1.5 text-[11px] leading-snug text-faint md:max-w-xs">
            <Info size={13} className="mt-px shrink-0" />
            <span>Runs fully offline with instant keyword analysis. For richer, more detailed results, connect an LLM API.</span>
          </p>
        )}
      </div>

      {tab === 'ats' ? (
        <AtsChecker />
      ) : (
        <>

          {loading ? (
            <div className="grid gap-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-20" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title={jobs.length === 0 ? 'Nothing tracked yet' : 'No matches'}
              hint={
                jobs.length === 0
                  ? 'This is your manual tracker, for applications you sent outside the agent pipeline.'
                  : 'Try a different search or status filter.'
              }
            />
          ) : (
            <ul className="grid gap-3">
              {filtered.map((job) => {
                const status = STATUS_BY_ID[job.status] ?? STATUS_BY_ID.pending;
                const followUpDue = job.followUpDate && isOverdue(job.followUpDate) && job.status === 'pending';
                return (
                  <li key={job.id}>
                    <button
                      type="button"
                      onClick={() => openEdit(job)}
                      className="list-card w-full p-4 text-left transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
                    >
                      <div className="flex flex-wrap items-start gap-x-3 gap-y-2 md:flex-nowrap">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold leading-snug">{job.position}</p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <p className="text-xs font-semibold text-muted">
                              {job.companyName}
                              {job.location ? ` · ${job.location}` : ''}
                            </p>
                            {job.jobUrl && (
                              <span
                                role="link"
                                tabIndex={0}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-ink hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(job.jobUrl, '_blank', 'noreferrer');
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.stopPropagation();
                                    window.open(job.jobUrl, '_blank', 'noreferrer');
                                  }
                                }}
                              >
                                <ExternalLink size={11} /> posting
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className={cn('chip', status.tone)}>{status.label}</span>
                          {job.dateApplied && (
                            <span className="flex flex-col items-end leading-tight">
                              <span className="text-[11px] font-semibold text-faint">
                                applied {formatDateShort(job.dateApplied)}
                              </span>
                              <span className="text-[10px] font-medium text-faint/75">
                                {formatRelativeTime(job.dateApplied)}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      {(job.notes || followUpDue) && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {followUpDue && (
                            <span className="chip bg-warn-soft text-warn">
                              <CalendarClock size={11} /> follow up due
                            </span>
                          )}
                          {job.notes && (
                            <p className="text-xs text-muted leading-relaxed line-clamp-none md:line-clamp-1">{job.notes}</p>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <JobFormSheet open={formOpen} job={editing} onClose={() => setFormOpen(false)} />
        </>
      )}
    </div>
  );
}
