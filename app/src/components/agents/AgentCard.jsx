import { useState } from 'react';
import { ChevronDown, AlertTriangle, Save } from 'lucide-react';
import { dataSource } from '../../data';
import { useNow } from '../../hooks/useNow';
import { formatRelativeTime, formatDuration, elapsedSeconds } from '../../lib/dates';
import { cn } from '../../lib/utils';

const AGENT_DESCRIPTIONS = {
  'job-search': 'Hunts new roles on your platforms every hour.',
  'job-analysis': 'Scores fit 0–100 and researches each company.',
  'cv-creation': 'Drafts a tailored one-page CV, asks before assuming.',
  'application-writer': 'Fills application forms, never submits without you.',
  'connection-builder': 'Grows your network within platform limits.',
  'career-advisor': 'Finds skill gaps in market data, suggests next moves.',
  manager: 'Coaches the crew twice a day and reports to you.',
};

function StatusChip({ agent, now }) {
  if (!agent.enabled) return <span className="chip bg-card-2 text-faint">paused</span>;
  if (agent.status === 'running') {
    const secs = elapsedSeconds(agent.runningSince);
    return (
      <span className="chip bg-success-soft text-success">
        <span className="size-1.5 rounded-full bg-success animate-pulse" />
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

export default function AgentCard({ agent, instructionsDoc }) {
  const now = useNow(1000);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);

  const instructions = instructionsDoc?.instructions ?? '';
  const value = draft ?? instructions;

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
    <article className={cn('card p-5', agent.status === 'running' && agent.enabled && 'anim-running')}>
      <div className="flex items-start gap-3.5">
        <img
          src={`/agents/${agent.id}.png`}
          alt=""
          className={cn('size-12 rounded-2xl bg-accent-soft object-cover', !agent.enabled && 'grayscale opacity-60')}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold">{agent.name || agent.id}</h3>
            <StatusChip agent={agent} now={now} />
          </div>
          <p className="mt-0.5 text-xs text-muted leading-relaxed">
            {AGENT_DESCRIPTIONS[agent.id] ?? ''}
          </p>
        </div>

        {/* enable toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={agent.enabled}
          aria-label={`${agent.enabled ? 'Pause' : 'Resume'} ${agent.name}`}
          onClick={toggleEnabled}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
            agent.enabled ? 'bg-accent' : 'bg-line-strong',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform',
              agent.enabled ? 'translate-x-5.5' : 'translate-x-0.5',
            )}
          />
        </button>
      </div>

      {agent.status === 'error' && agent.errorMessage && (
        <p className="mt-3 rounded-xl bg-danger-soft px-3.5 py-2.5 text-xs font-medium text-danger">
          {agent.errorMessage}
        </p>
      )}

      {agent.lastAction && (
        <p className="mt-3 rounded-xl bg-card-2 px-3.5 py-2.5 text-xs leading-relaxed">
          {agent.lastAction}
        </p>
      )}

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          ['Last run', formatRelativeTime(agent.lastRun) ?? 'Never'],
          ['Next run', agent.enabled ? formatRelativeTime(agent.nextRun) ?? 'Soon' : 'paused'],
          ['Runs', `${agent.runCount ?? 0}${agent.errorCount ? ` · ${agent.errorCount} err` : ''}`],
        ].map(([label, val]) => (
          <div key={label} className="rounded-xl border border-line px-2 py-2">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-faint">{label}</dt>
            <dd className="mt-0.5 text-xs font-semibold truncate">{val}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-between text-xs font-bold text-muted hover:text-ink transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        Custom instructions
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            className="input min-h-20 resize-y text-xs"
            placeholder={`Standing orders for ${agent.name}. They override its defaults, e.g. "Only remote roles this month."`}
            value={value}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-soft !py-1.5 !px-3 text-xs"
              disabled={draft == null || draft === instructions}
              onClick={saveInstructions}
            >
              <Save size={13} /> {saved ? 'Saved ✓' : 'Save'}
            </button>
            {instructionsDoc?.updatedAt && (
              <span className="text-[11px] text-faint">
                updated {formatRelativeTime(instructionsDoc.updatedAt)}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
