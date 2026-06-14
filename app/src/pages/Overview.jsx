import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Bot,
  CircleCheck,
  ClipboardCheck,
  Inbox,
  Megaphone,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { useCountUp } from '../hooks/useCountUp';
import { useAuth } from '../context/AuthContext';
import { greeting, formatRelativeTime, toDate } from '../lib/dates';
import {
  PIPELINE_STAGES,
  stageForStatus,
  isJobCaseStuck,
  CLOSED_JOB_CASE_STATUSES,
} from '../lib/pipeline';
import MiniBars from '../components/ui/MiniBars';
import { cn } from '../lib/utils';

function sparklinePoints(data, width = 144, height = 56, pad = 4) {
  const values = data.length ? data : [0];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(1, max - min);
  return values.map((v, i) => {
    const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return [x, y];
  });
}

function smoothPath(points) {
  if (points.length < 2) return '';
  return points.reduce((path, [x, y], i) => {
    if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
    const [px, py] = points[i - 1];
    const mx = (px + x) / 2;
    return `${path} C ${mx.toFixed(2)} ${py.toFixed(2)}, ${mx.toFixed(2)} ${y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`;
  }, '');
}

function Sparkline({ data, color, gradientId }) {
  const W = 144, H = 56;
  const points = sparklinePoints(data, W, H);
  const line = smoothPath(points);
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-14 w-full overflow-visible"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gradientId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
      />
    </svg>
  );
}

function MetricCard({ icon: Icon, label, period, value, to, color, data, gradientId, delay = 0 }) {
  const animated = useCountUp(value, 900, delay);

  return (
    <Link
      to={to}
      className="list-card group flex flex-col gap-3 p-3 sm:p-4 transition-all hover:-translate-y-0.5 hover:border-line-strong hover:bg-card-2/30"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-1.5">
        <Icon size={15} style={{ color }} className="shrink-0" />
        <span className="text-xs font-semibold leading-tight text-ink">{label}</span>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-medium text-muted">{period}</p>
        <p className="font-display text-2xl font-bold tracking-tight text-ink tabular-nums">{animated}</p>
      </div>

      <Sparkline data={data} color={color} gradientId={gradientId} />
    </Link>
  );
}

const STAGE_SHORT = {
  Searching: 'Search',
  Analyzing: 'Analyze',
  'Your Review': 'Review',
  'CV Stage': 'CV',
  'Application Stage': 'Apply',
  Applied: 'Sent',
};

const agentActivityTime = (agent) =>
  toDate(agent.status === 'running' ? agent.runningSince : null)?.getTime()
  ?? toDate(agent.updatedAt)?.getTime()
  ?? toDate(agent.lastRun)?.getTime()
  ?? 0;

export default function Overview() {
  const { user } = useAuth();
  const { docs: jobCases } = useCollection('jobCases');
  const { docs: queue } = useCollection('approvalQueue');
  const { docs: agents } = useCollection('agents');
  const { docs: reports } = useCollection('agentReports');

  const pending = useMemo(() => queue.filter((q) => q.status === 'pending'), [queue]);
  const active = useMemo(
    () => jobCases.filter((j) => !CLOSED_JOB_CASE_STATUSES.has(j.status)),
    [jobCases],
  );
  const applied = useMemo(() => jobCases.filter((j) => stageForStatus(j.status) === 'Applied'), [jobCases]);
  const stuck = useMemo(() => active.filter(isJobCaseStuck), [active]);
  const erroredAgents = useMemo(() => agents.filter((a) => a.status === 'error'), [agents]);
  const runningAgents = useMemo(() => agents.filter((a) => a.status === 'running' && a.enabled), [agents]);

  const latestManagerReport = useMemo(
    () =>
      [...reports]
        .filter((r) => r.agentId === 'manager')
        .sort((a, b) => (toDate(b.runAt)?.getTime() ?? 0) - (toDate(a.runAt)?.getTime() ?? 0))[0],
    [reports],
  );

  const recentActivity = useMemo(
    () =>
      [...agents]
        .filter((a) => a.enabled && a.status !== 'error' && a.lastAction)
        .sort((a, b) => agentActivityTime(b) - agentActivityTime(a))
        .slice(0, 3),
    [agents],
  );

  const funnel = useMemo(
    () =>
      PIPELINE_STAGES.map((stage) => ({
        stage,
        count: active.filter((j) => stageForStatus(j.status) === stage).length,
      })),
    [active],
  );
  const activeAgents = agents.filter((a) => a.enabled && a.status !== 'error').length;
  const healthPercent = agents.length ? Math.round((activeAgents / agents.length) * 100) : 100;
  const focusStage = funnel.reduce(
    (best, item) => (item.count > best.count ? item : best),
    funnel[0] ?? { stage: 'Search', count: 0 },
  );
  const chartData = funnel.map(({ stage, count }) => ({
    id: stage,
    label: STAGE_SHORT[stage] ?? stage,
    value: count,
  }));

  const firstName = (user?.name || 'there').split(' ')[0];
  const headline =
    pending.length > 0
      ? `Review ${pending.length} pending decision${pending.length === 1 ? '' : 's'} to keep applications moving.`
      : runningAgents.length > 0
        ? `${runningAgents[0].name} is working right now.`
        : 'Your pipeline is clear. Check progress or add a fresh target role.';

  return (
    <div className="flex flex-col gap-5">
      <header className="relative mt-3 overflow-visible">
        <div className="relative min-h-30 overflow-visible rounded-3xl border border-white/15 bg-[radial-gradient(28rem_18rem_at_86%_16%,rgb(255_255_255_/_0.2),transparent_62%),linear-gradient(135deg,var(--accent),var(--accent-strong))] px-5 py-4 shadow-[0_24px_70px_-34px_rgb(79_65_196_/_0.62)] md:min-h-32 md:pr-72">
          <div className="relative z-10 max-w-md">
            <motion.h2
              className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl"
              initial={{ opacity: 0, y: 36, filter: 'blur(14px)', scale: 0.93 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              {greeting()}, {firstName} <span aria-hidden="true">{'\u{1F44B}'}</span>
            </motion.h2>
            <motion.p
              className="mt-2 max-w-sm text-xs font-medium leading-relaxed text-white/78 md:text-sm"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 0.85, delay: 0.45, ease: [0.25, 1, 0.5, 1] }}
            >
              {headline}
            </motion.p>
          </div>

          <div className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[48%] [clip-path:inset(-3.5rem_0_0_0_round_0_0_1.5rem_0)] md:block">
            <img
              src="/sitting.png"
              alt=""
              className="absolute bottom-[-0.65rem] right-[-1.5rem] h-42 max-w-none object-contain object-bottom lg:right-[-1.5rem] lg:h-40"
            />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            icon={Inbox}
            label="Pending approvals"
            period="Needs review"
            value={pending.length}
            color="var(--accent)"
            gradientId="grad-pending"
            data={[1, 2, 1, 3, 2, 4, 2, pending.length + 1, Math.max(0, pending.length)]}
            to="/approvals"
          />
          <MetricCard
            icon={BriefcaseBusiness}
            label="Active job cases"
            period="In pipeline"
            value={active.length}
            color="var(--info)"
            gradientId="grad-active"
            data={[2, 4, 3, 6, 4, 7, 5, active.length + 1, active.length]}
            to="/applications"
            delay={60}
          />
          <MetricCard
            icon={Send}
            label="Applications sent"
            period="Submitted"
            value={applied.length}
            color="var(--success)"
            gradientId="grad-applied"
            data={[0, 1, 1, 2, 1, 3, 2, applied.length + 1, applied.length]}
            to="/applications"
            delay={120}
          />
          <MetricCard
            icon={stuck.length > 0 ? AlertTriangle : CircleCheck}
            label="Stuck > 24h"
            period="Needs attention"
            value={stuck.length}
            color={stuck.length > 0 ? 'var(--danger)' : 'var(--muted)'}
            gradientId="grad-stuck"
            data={[0, 1, 0, 2, 1, 1, 0, stuck.length + 1, stuck.length]}
            to="/applications"
            delay={180}
          />
      </section>

      {erroredAgents.length > 0 && (
        <Link
          to="/agents"
          className="list-card flex items-center gap-3 border-danger/30 bg-danger-soft/50 px-5 py-4 transition-all hover:-translate-y-0.5"
        >
          <AlertTriangle size={18} className="shrink-0 text-danger" />
          <p className="flex-1 text-sm font-semibold text-danger">
            {erroredAgents.map((a) => a.name).join(', ')} hit an error. Tap to review.
          </p>
          <ArrowRight size={15} className="text-danger" />
        </Link>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <section className="card flex flex-col p-5 lg:col-span-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-faint">Pipeline</p>
              <h3 className="mt-1 text-sm font-bold">
                {focusStage.count > 0 ? `${focusStage.stage} needs the most attention` : 'No active stage pressure'}
              </h3>
            </div>
            <Link to="/applications" className="text-xs font-semibold text-accent-ink hover:underline">
              Open board
            </Link>
          </div>
          <MiniBars data={chartData} title="Cases by stage" className="mt-4 flex-1 border-0 bg-card-2/45" />
        </section>

        <section className="card p-5 lg:col-span-7">
          <header className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-faint">Crew</p>
              <h3 className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                <Bot size={15} className="text-accent" /> Recent activity
              </h3>
            </div>
            <span className="chip bg-card-2 text-muted">
              <CheckCircle2 size={12} /> {healthPercent}% healthy
            </span>
          </header>
          <ul className="mt-4 grid gap-2">
            {recentActivity.map((agent) => (
              <li key={agent.id} className="flex items-start gap-3 rounded-2xl border border-line bg-card/70 px-3 py-3">
                <img src={`/agents/${agent.id}.png`} alt="" className="size-9 rounded-xl bg-accent-soft object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">
                    {agent.name}
                    <span className="ml-2 font-semibold text-faint">
                      {formatRelativeTime(agentActivityTime(agent))}
                    </span>
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">{agent.lastAction}</p>
                </div>
                {agent.status === 'running' && (
                  <span className="chip bg-success-soft text-success shrink-0">
                    <span className="size-1.5 rounded-full bg-success animate-pulse" /> live
                  </span>
                )}
              </li>
            ))}
            {recentActivity.length === 0 && (
              <li className="py-6 text-center text-xs text-muted">
                No agent activity yet. Run the setup agent to bring the crew online.
              </li>
            )}
          </ul>
        </section>
      </div>

      {latestManagerReport && (
        <section className="card flex items-start gap-4 p-5">
          <span className="rounded-xl bg-amber-soft p-2.5 text-amber-ink shrink-0">
            <Megaphone size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-faint">
              Manager - {formatRelativeTime(latestManagerReport.runAt)}
            </p>
            <h3 className="mt-0.5 font-bold leading-snug">{latestManagerReport.headline}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">{latestManagerReport.summary}</p>
          </div>
          <Link to="/insights" className="btn-ghost !px-3 !py-1.5 text-xs shrink-0">
            Reports
          </Link>
        </section>
      )}
    </div>
  );
}
