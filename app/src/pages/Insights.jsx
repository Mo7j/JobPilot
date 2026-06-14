import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Lightbulb, TrendingUp, Check, X } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import EmptyState from '../components/EmptyState';
import { decideAdvice } from '../lib/decisions';
import { formatRelativeTime, toDate } from '../lib/dates';
import { cn } from '../lib/utils';

const TABS = [
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'advice', label: 'Advice', icon: Lightbulb },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
];

const PRIORITY_TONE = {
  high: 'bg-amber-soft text-amber-ink',
  normal: 'bg-accent-soft text-accent-ink',
  low: 'bg-card-2 text-muted',
};

function ReportsTab() {
  const { docs } = useCollection('agentReports');
  const reports = useMemo(
    () => [...docs].sort((a, b) => (toDate(b.runAt)?.getTime() ?? 0) - (toDate(a.runAt)?.getTime() ?? 0)),
    [docs],
  );

  if (reports.length === 0) {
    return <EmptyState title="No reports yet" hint="Every agent files a short report after each run." />;
  }

  return (
    <div className="grid gap-3 items-start">
      {reports.map((r) => (
        <article key={r.id} className="list-card p-4 anim-rise">
          <header className="flex flex-wrap items-start gap-x-2 gap-y-2.5">
            <img src={`/agents/${r.agentId}.png`} alt="" className="size-8 rounded-xl bg-accent-soft object-cover" />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold leading-snug">{r.headline}</h3>
              <p className="mt-0.5 text-xs font-semibold text-muted">
                {r.agentId}
                {r.runType && r.runType !== 'run' ? ` · ${r.runType}` : ''} · {formatRelativeTime(r.runAt)}
              </p>
            </div>
            {r.metrics && Object.keys(r.metrics).length > 0 && (
              <div className="flex w-full flex-wrap gap-1.5 sm:w-auto sm:shrink-0 sm:justify-end">
                {Object.entries(r.metrics).map(([k, v]) => (
                  <span key={k} className="chip bg-card-2 text-muted">
                    {k.replace(/([A-Z])/g, ' $1').toLowerCase()}: <strong className="text-ink">{v}</strong>
                  </span>
                ))}
              </div>
            )}
          </header>
          {r.summary && <p className="mt-2 text-sm text-muted leading-relaxed">{r.summary}</p>}
          {Array.isArray(r.coachingGiven) && r.coachingGiven.length > 0 && (
            <ul className="mt-2.5 flex flex-col gap-1.5">
              {r.coachingGiven.map((c) => (
                <li key={c} className="rounded-xl bg-amber-soft px-3.5 py-2 text-xs font-medium text-amber-ink">
                  Coaching: {c}
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}

function AdviceTab() {
  const { docs } = useCollection('careerAdvice');
  const pending = useMemo(
    () =>
      docs
        .filter((a) => a.status === 'pending')
        .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)),
    [docs],
  );

  if (pending.length === 0) {
    return (
      <EmptyState
        title="No advice waiting"
        hint="The career advisor studies your market daily and only speaks up when it finds something worth your time."
      />
    );
  }

  return (
    <div className="grid gap-3 items-start">
      {pending.map((item) => (
        <article key={item.id} className="list-card p-4 anim-rise">
          <div className="flex items-start gap-2">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <span className={cn('chip', PRIORITY_TONE[item.priority] ?? PRIORITY_TONE.normal)}>
                {item.priority} priority
              </span>
              <span className="chip bg-card-2 text-muted">{item.category?.replace('_', ' ')}</span>
              {item.effort && <span className="chip bg-card-2 text-muted">{item.effort} effort</span>}
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                aria-label="Accept"
                title="Accept"
                className="btn group/btn !p-2.5 bg-success-soft text-success transition-all duration-200 hover:-translate-y-0.5 hover:bg-success hover:text-white hover:shadow-[0_6px_16px_-10px_color-mix(in_srgb,var(--success)_55%,transparent)] active:translate-y-0"
                onClick={() => decideAdvice(item, 'accepted')}
              >
                <Check size={17} className="transition-transform duration-200 group-hover/btn:scale-125" />
              </button>
              <button
                type="button"
                aria-label="Dismiss"
                title="Dismiss"
                className="btn group/btn !p-2.5 border border-line bg-transparent text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-danger/30 hover:bg-danger-soft hover:text-danger active:translate-y-0"
                onClick={() => decideAdvice(item, 'dismissed')}
              >
                <X size={17} className="transition-transform duration-200 group-hover/btn:rotate-90" />
              </button>
            </div>
          </div>
          <h3 className="mt-2 font-bold leading-snug">{item.recommendation}</h3>
          {item.reasoning && <p className="mt-1.5 text-sm text-muted leading-relaxed">{item.reasoning}</p>}
          {item.impact && (
            <p className="mt-2 rounded-xl bg-success-soft px-3 py-1.5 text-xs font-medium text-success">
              {item.impact}
            </p>
          )}
          {Array.isArray(item.actionItems) && item.actionItems.length > 0 && (
            <ol className="mt-2.5 flex flex-col gap-1 text-sm text-muted list-decimal list-inside">
              {item.actionItems.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          )}
        </article>
      ))}
    </div>
  );
}

// Animate a number counting up from 0 to `target` with an ease-out curve.
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const frame = useRef(null);

  useEffect(() => {
    const end = Number(target) || 0;
    const start = performance.now();
    cancelAnimationFrame(frame.current);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(end * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);

  return value;
}

function FrequencyBars({ title, data, dotClass = 'bg-accent', barClass = 'bg-accent' }) {
  const [grown, setGrown] = useState(false);
  const entries = Object.entries(data ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  // Start bars at 0 width, then grow to target on mount so the transition plays.
  useEffect(() => {
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (entries.length === 0) return null;

  return (
    <div className="card p-5">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn('size-2 rounded-full', dotClass)} />
          <h3 className="text-xs font-bold uppercase tracking-wide text-faint">{title}</h3>
        </div>
        <span className="text-xs font-semibold tabular-nums text-faint">{total} total</span>
      </header>

      <ol className="mt-4 flex flex-col gap-3">
        {entries.map(([label, count], i) => (
          <li key={label}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2">
                <span className="w-4 shrink-0 text-[11px] font-bold tabular-nums text-faint">{i + 1}</span>
                <span className="truncate text-sm font-semibold text-ink">{label}</span>
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-muted">{count}</span>
            </div>
            <div className="ml-6 h-2 overflow-hidden rounded-full bg-card-2">
              <div
                className={cn('h-full rounded-full transition-[width] duration-700 ease-out', barClass)}
                style={{
                  width: grown ? `${Math.max(4, (count / max) * 100)}%` : '0%',
                  transitionDelay: `${i * 60}ms`,
                }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TrendsTab() {
  const { docs } = useCollection('trends');
  const sorted = useMemo(
    () => [...docs].sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)),
    [docs],
  );
  const current = sorted[0];
  const previous = sorted[1];
  const jobsCount = useCountUp(current?.jobsFound ?? 0);

  if (!current) {
    return (
      <EmptyState
        title="No trend data yet"
        hint="The job-search agent aggregates the skills and roles it sees each week."
      />
    );
  }

  const delta = previous?.jobsFound ? current.jobsFound - previous.jobsFound : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="card flex flex-col items-start gap-2 p-5 sm:flex-row sm:items-center sm:gap-5">
        <p className="text-xs font-bold uppercase tracking-wide text-faint">Jobs found this week</p>
        <div className="flex items-center gap-3">
          <p className="font-display text-4xl font-bold leading-none tabular-nums">{jobsCount}</p>
          {delta != null && (
            <span className={cn('chip', delta >= 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger')}>
              {delta >= 0 ? '+' : ''}{delta} vs last week
            </span>
          )}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <FrequencyBars title="Most-requested skills" data={current.skillFrequency} />
        <FrequencyBars
          title="Most common roles"
          data={current.roleFrequency}
          dotClass="bg-amber"
          barClass="bg-amber"
        />
      </div>
    </div>
  );
}

export default function Insights() {
  const [tab, setTab] = useState('reports');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-fit items-center gap-1 rounded-2xl border border-line bg-card p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors',
              tab === id ? 'bg-accent-soft text-accent-ink' : 'text-muted hover:text-ink',
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'reports' && <ReportsTab />}
      {tab === 'advice' && <AdviceTab />}
      {tab === 'trends' && <TrendsTab />}
    </div>
  );
}
