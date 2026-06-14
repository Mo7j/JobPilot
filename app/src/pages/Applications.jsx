import { useMemo, useState } from 'react';
import { useCollection } from '../hooks/useCollection';
import PipelineCard from '../components/pipeline/PipelineCard';
import JobDetailDrawer from '../components/pipeline/JobDetailDrawer';
import EmptyState from '../components/EmptyState';
import { PIPELINE_STAGES, stageForStatus } from '../lib/pipeline';
import { toDate } from '../lib/dates';
import { cn } from '../lib/utils';

const STAGE_DOT = {
  Searching: 'bg-faint',
  Analyzing: 'bg-info',
  'Your Review': 'bg-amber',
  'CV Stage': 'bg-accent',
  'Application Stage': 'bg-success',
  Applied: 'bg-success',
};

export default function Applications() {
  const { docs: jobCases, loading } = useCollection('jobCases');
  const [selected, setSelected] = useState(null);
  const [showClosed, setShowClosed] = useState(false);

  const byStage = useMemo(() => {
    const map = new Map(PIPELINE_STAGES.map((s) => [s, []]));
    map.set('Closed', []);
    for (const job of jobCases) {
      const stage = stageForStatus(job.status);
      (map.get(stage) ?? map.get('Searching')).push(job);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (toDate(b.lastUpdatedAt)?.getTime() ?? 0) - (toDate(a.lastUpdatedAt)?.getTime() ?? 0));
    }
    return map;
  }, [jobCases]);

  const stages = showClosed ? [...PIPELINE_STAGES, 'Closed'] : PIPELINE_STAGES;
  const closedCount = byStage.get('Closed')?.length ?? 0;

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-80 w-72 shrink-0" />
        ))}
      </div>
    );
  }

  if (jobCases.length === 0) {
    return (
      <EmptyState
        title="No job cases yet"
        hint="Once the job-search agent runs, every role it finds appears here and moves across the board as the crew works."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3 px-1">
        <p className="text-sm text-muted">
          {jobCases.length} job case{jobCases.length === 1 ? '' : 's'} across the crew pipeline.
        </p>
        <button
          type="button"
          className="btn-ghost shrink-0 whitespace-nowrap !py-1.5 !px-3 text-xs"
          onClick={() => setShowClosed((v) => !v)}
        >
          {showClosed ? 'Hide closed' : `Show closed (${closedCount})`}
        </button>
      </header>

      <div className="-mx-4 px-4 pb-2 lg:-mx-8 lg:overflow-x-auto lg:px-8">
        <div className="flex flex-col gap-5 lg:min-w-max lg:flex-row lg:items-start lg:gap-4">
          {stages.map((stage) => {
            const jobs = byStage.get(stage) ?? [];
            return (
              <section key={stage} className="w-full lg:w-72 lg:shrink-0">
                <header className="flex items-center gap-2 px-1 pb-3">
                  <span className={cn('size-2 rounded-full', STAGE_DOT[stage] ?? 'bg-faint')} />
                  <h2 className="text-sm font-bold">{stage}</h2>
                  <span className="chip bg-card-2 text-muted">{jobs.length}</span>
                </header>
                <div
                  className={cn(
                    'rounded-2xl border border-line bg-card-2/45 p-2.5',
                    jobs.length === 0
                      ? 'hidden lg:flex lg:min-h-28 lg:flex-col'
                      : 'grid gap-2.5 sm:grid-cols-2 lg:flex lg:flex-col',
                  )}
                >
                  {jobs.length === 0 ? (
                    <p className="px-2 py-6 text-center text-xs text-faint">Nothing here right now</p>
                  ) : (
                    jobs.map((job) => <PipelineCard key={job.id} job={job} onOpen={setSelected} />)
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <JobDetailDrawer job={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
