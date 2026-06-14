import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Save } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { dataSource } from '../data';
import { useCollection } from '../hooks/useCollection';
import { useNow } from '../hooks/useNow';
import { elapsedSeconds, formatDuration, formatRelativeTime } from '../lib/dates';
import { cn } from '../lib/utils';

const AGENT_DESCRIPTIONS = {
  'job-search': 'Finds roles and creates job cases.',
  'job-analysis': 'Scores fit, researches companies, queues analysis approvals.',
  'cv-creation': 'Asks questions, drafts and verifies tailored CVs.',
  'application-writer': 'Fills applications, stops before submit, queues approval.',
  'connection-builder': 'Builds job-specific and general LinkedIn connections.',
  'career-advisor': 'Reads market trends and recurring gaps, recommends next moves.',
  manager: 'Monitors health, backlog, errors, and coaches the crew.',
};

const AGENT_GRID_ROWS = [
  ['manager', 'career-advisor', 'connection-builder'],
  ['job-search', 'job-analysis', 'cv-creation', 'application-writer'],
];

function StatusChip({ agent }) {
  if (!agent?.enabled) return <span className="chip bg-card-2 text-faint">paused</span>;
  if (agent.status === 'running') {
    const secs = elapsedSeconds(agent.runningSince);
    return (
      <span className="chip whitespace-nowrap bg-success-soft text-success !text-[11px] sm:!text-xs">
        <span className="size-1.5 shrink-0 rounded-full bg-success animate-pulse" />
        running{secs != null ? ` ${formatDuration(secs)}` : ''}
      </span>
    );
  }
  if (agent.status === 'error') {
    return (
      <span className="chip bg-danger-soft text-danger">
        <AlertTriangle size={11} /> error
      </span>
    );
  }
  return <span className="chip bg-card-2 text-muted">idle</span>;
}

function AgentOrgCard({ agent, instructionsDoc }) {
  useNow(1000);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);

  const instructions = instructionsDoc?.instructions ?? '';
  const value = draft ?? instructions;
  const name = agent?.name || agent?.id || 'Agent';
  const summary = AGENT_DESCRIPTIONS[agent.id] ?? '';
  const lastRun = formatRelativeTime(agent.lastRun) ?? '-';
  const nextRun = agent.enabled ? formatRelativeTime(agent.nextRun) ?? '-' : 'paused';
  const runs = `${agent.runCount ?? 0}${agent.errorCount ? ` / ${agent.errorCount} err` : ''}`;

  async function toggleEnabled() {
    await dataSource.updateDoc('agents', agent.id, { enabled: !agent.enabled });
  }

  async function saveInstructions() {
    await dataSource.setDoc('agentInstructions', agent.id, {
      id: agent.id,
      instructions: value.trim(),
      updatedAt: new Date().toISOString(),
    });
    setDraft(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <article
      onClick={() => setDetailsOpen(true)}
      className={cn(
        'group relative min-h-62 cursor-pointer overflow-hidden rounded-xl bg-transparent px-3 pb-3 pt-3 text-center transition-transform duration-200 hover:-translate-y-0.5',
        !agent.enabled && 'opacity-60 grayscale',
      )}
    >
      <div className="relative z-10 flex items-center justify-between gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={agent.enabled}
          aria-label={`${agent.enabled ? 'Pause' : 'Resume'} ${name}`}
          onClick={(event) => {
            event.stopPropagation();
            toggleEnabled();
          }}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
            agent.enabled
              ? 'bg-[linear-gradient(135deg,#8b7cf6,#6c5ce7_54%,#5a4bd1)] shadow-[0_8px_22px_-12px_var(--accent)]'
              : 'bg-line-strong',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left]',
              agent.enabled ? 'left-[1.375rem]' : 'left-0.5',
            )}
          />
        </button>

        <StatusChip agent={agent} />
      </div>

      <div
        className="relative mx-auto mt-2 flex h-29 w-32 items-end justify-center"
      >
        <span className="absolute bottom-0 left-1/2 h-22 w-26 -translate-x-1/2 bg-[linear-gradient(140deg,color-mix(in_srgb,var(--accent)_88%,#3b2aa8)_0%,var(--accent)_42%,color-mix(in_srgb,var(--accent-strong)_86%,#2b206f)_100%)] shadow-[0_22px_54px_-34px_rgb(79_65_196_/_0.78)] [border-radius:43%_57%_38%_62%/55%_41%_59%_45%]" />
        <img
          src={`/agents/${agent.id}.png`}
          alt=""
          className={cn(
            'relative z-10 size-27 self-end bg-transparent object-cover object-top shadow-sm transition-transform duration-300 ease-out [border-radius:42%_58%_46%_54%/58%_42%_58%_42%] group-hover:origin-bottom group-hover:scale-110',
            agent.status === 'running' && agent.enabled && 'anim-agent-running',
            !agent.enabled && 'grayscale opacity-60',
          )}
        />
      </div>

      <div className="mt-3">
        <h3 className="font-display text-sm font-bold leading-tight text-accent-ink">{name}</h3>
        <p className="mx-auto mt-1 line-clamp-2 max-w-46 text-[10px] font-semibold leading-snug text-muted">
          {summary}
        </p>
      </div>

      <dl className="mx-auto mt-3 grid max-w-48 grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-[linear-gradient(145deg,rgb(139_124_246_/_0.22),rgb(102_83_220_/_0.1))] px-2 py-1.5">
          <dt className="text-[10px] font-bold uppercase text-faint">Next</dt>
          <dd className="mt-0.5 truncate text-[11px] font-bold">{nextRun}</dd>
        </div>
        <div className="rounded-lg bg-[linear-gradient(145deg,rgb(139_124_246_/_0.22),rgb(102_83_220_/_0.1))] px-2 py-1.5">
          <dt className="text-[10px] font-bold uppercase text-faint">Runs</dt>
          <dd className="mt-0.5 truncate text-[11px] font-bold">{runs}</dd>
        </div>
      </dl>

      {detailsOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setDetailsOpen(false);
            setDraft(null);
          }}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-line bg-card p-4 text-left shadow-pop"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-bold leading-tight">{name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">{summary}</p>
              </div>
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs font-bold text-faint transition-colors hover:bg-card-2 hover:text-ink"
                onClick={() => {
                  setDetailsOpen(false);
                  setDraft(null);
                }}
              >
                Close
              </button>
            </div>

            {agent.status === 'error' && agent.errorMessage && (
              <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">
                {agent.errorMessage}
              </p>
            )}

            {agent.lastAction && (
              <p className="mt-3 rounded-lg bg-card-2 px-3 py-2 text-xs leading-relaxed">
                {agent.lastAction}
              </p>
            )}

            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ['Last run', lastRun],
                ['Next run', nextRun],
                ['Runs', runs],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg border border-line px-2 py-2">
                  <dt className="text-[10px] font-bold uppercase text-faint">{label}</dt>
                  <dd className="mt-0.5 truncate text-xs font-semibold">{val}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-3 text-xs font-bold text-muted">
              Custom instructions
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <textarea
                className="input min-h-20 resize-y text-xs"
                placeholder={`Standing orders for ${name}. They override its defaults.`}
                value={value}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn-soft !px-3 !py-1.5 text-xs"
                  disabled={draft == null || draft === instructions}
                  onClick={saveInstructions}
                >
                  <Save size={13} /> {saved ? 'Saved' : 'Save'}
                </button>
                {instructionsDoc?.updatedAt && (
                  <span className="text-[11px] text-faint">
                    updated {formatRelativeTime(instructionsDoc.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </article>
  );
}

export default function Agents() {
  const { docs: agents, loading } = useCollection('agents');
  const { docs: instructionDocs } = useCollection('agentInstructions');

  const agentsById = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);
  const instructionsById = useMemo(
    () => new Map(instructionDocs.map((d) => [d.id, d])),
    [instructionDocs],
  );

  const healthy = agents.filter((a) => a.enabled && a.status !== 'error').length;
  const errored = agents.filter((a) => a.status === 'error').length;
  const arrangedIds = AGENT_GRID_ROWS.flat();
  const extraAgents = agents.filter((agent) => !arrangedIds.includes(agent.id));
  const orderedAgents = [
    ...arrangedIds.map((id) => agentsById.get(id)).filter(Boolean),
    ...extraAgents,
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-64" />
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        image="/mascot-point.png"
        title="No agents registered yet"
        hint="Run the setup agent in Claude (step 10 in docs/SETUP.md) - it interviews you, seeds the crew, and they'll report in here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <p className="flex-1 text-xs leading-relaxed text-muted sm:text-sm">
          Your crew. Pause anyone with the toggle; leave standing orders in their instructions.
        </p>
        <div className="flex shrink-0 flex-col items-end gap-2 text-xs font-semibold sm:flex-row sm:items-center">
          <span className="chip bg-success-soft text-success">{healthy} healthy</span>
          {errored > 0 && <span className="chip bg-danger-soft text-danger">{errored} error</span>}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {orderedAgents.map((agent) => (
          <AgentOrgCard
            key={agent.id}
            agent={agent}
            instructionsDoc={instructionsById.get(agent.id)}
          />
        ))}
      </section>
    </div>
  );
}
