import { useMemo } from 'react';
import { useCollection } from '../hooks/useCollection';
import ApprovalCard from '../components/approvals/ApprovalCard';
import EmptyState from '../components/EmptyState';
import { toDate } from '../lib/dates';

export default function Approvals() {
  const { docs: queue, loading } = useCollection('approvalQueue');
  const { docs: jobCases } = useCollection('jobCases');

  const pending = useMemo(
    () =>
      queue
        .filter((item) => item.status === 'pending')
        .sort(
          (a, b) =>
            (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0),
        ),
    [queue],
  );

  const caseById = useMemo(() => new Map(jobCases.map((c) => [c.id, c])), [jobCases]);

  if (loading) {
    return (
      <div className="grid gap-4">
        {[0, 1].map((i) => (
          <div key={i} className="skeleton h-44" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="max-w-2xl">
        <p className="text-sm text-muted leading-relaxed">
          Approve to move a job forward, or reject with a reason, the agent learns.
        </p>
      </header>

      {pending.length === 0 ? (
        <EmptyState
          title="Inbox zero"
          hint="No decisions waiting. The agents will queue their next recommendations here."
        />
      ) : (
        <div className="grid gap-3">
          {pending.map((item) => (
            <ApprovalCard key={item.id} item={item} jobCase={caseById.get(item.jobCaseId)} />
          ))}
        </div>
      )}
    </div>
  );
}
