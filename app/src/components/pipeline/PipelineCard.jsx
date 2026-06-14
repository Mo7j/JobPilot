import { MapPin, Clock } from 'lucide-react';
import { scoreTone, isJobCaseStuck } from '../../lib/pipeline';
import { formatRelativeTime } from '../../lib/dates';
import { cn } from '../../lib/utils';

export default function PipelineCard({ job, onOpen }) {
  const stuck = isJobCaseStuck(job);

  return (
    <button
      type="button"
      onClick={() => onOpen(job)}
      className="list-card w-full p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-line-strong hover:bg-card-2/35"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold leading-snug">{job.title}</p>
        {job.fitScore != null && (
          <span className={cn('chip shrink-0', scoreTone(job.fitScore))}>{job.fitScore}</span>
        )}
      </div>
      <p className="mt-0.5 text-xs font-semibold text-muted">{job.company}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-faint">
        {job.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} /> {job.location}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Clock size={11} /> {formatRelativeTime(job.lastUpdatedAt)}
        </span>
        {stuck && <span className="chip bg-warn-soft text-warn">stuck</span>}
      </div>
    </button>
  );
}
