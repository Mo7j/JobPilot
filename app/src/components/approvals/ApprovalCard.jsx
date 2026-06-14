import { useState } from 'react';
import {
  Check,
  X,
  ExternalLink,
  FileText,
  MessageCircleQuestion,
  ClipboardCheck,
  Send,
  UserPlus,
} from 'lucide-react';
import { APPROVAL_TYPE_LABELS, parseQuestions } from '../../lib/pipeline';
import { decideApproval, submitCvAnswers } from '../../lib/decisions';
import { formatRelativeTime } from '../../lib/dates';
import { cn } from '../../lib/utils';

const TYPE_META = {
  analysis: { icon: ClipboardCheck, tone: 'bg-info-soft text-info' },
  cv_questions: { icon: MessageCircleQuestion, tone: 'bg-amber-soft text-amber-ink' },
  cv: { icon: FileText, tone: 'bg-accent-soft text-accent-ink' },
  application: { icon: Send, tone: 'bg-success-soft text-success' },
  connection_note: { icon: UserPlus, tone: 'bg-card-2 text-muted' },
};

export default function ApprovalCard({ item, jobCase }) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const isQuestions = item.type === 'cv_questions';
  const questions = isQuestions
    ? Array.isArray(item.questions) && item.questions.length
      ? item.questions
      : parseQuestions(item.summary)
    : [];
  const [answers, setAnswers] = useState({});

  const meta = TYPE_META[item.type] ?? TYPE_META.analysis;
  const Icon = meta.icon;
  const answeredAll = questions.every((q) => (answers[q] ?? '').trim());

  async function run(fn) {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  // Side-by-side layout (content left, actions right) only fits the simple
  // approve/reject case. Questions and the reject-reason form go full width.
  const sideActions = !isQuestions && !rejecting;

  // Body is shown inside the icon column on desktop and as a full-width block
  // on phones, so the action buttons never squeeze the text.
  const body = (
    <>
      <h3 className="font-bold leading-snug">{item.title}</h3>
      {(jobCase || item.driveFileUrl) && (
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {jobCase && (
            <p className="text-xs text-muted">
              {jobCase.company}, {jobCase.title}
            </p>
          )}
          {item.driveFileUrl && (
            <a
              href={item.driveFileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-ink hover:underline"
            >
              <ExternalLink size={13} /> Open attached file
            </a>
          )}
        </div>
      )}
      {!isQuestions && item.summary && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{item.summary}</p>
      )}
      {item.type === 'connection_note' && item.noteText && (
        <blockquote className="mt-3 rounded-xl border-l-2 border-accent bg-card-2 px-3.5 py-2.5 text-sm italic">
          “{item.noteText}”
          {item.personName && (
            <footer className="mt-1.5 not-italic text-xs font-semibold text-muted">
              → {item.personName}{item.personRole ? `, ${item.personRole}` : ''}
            </footer>
          )}
        </blockquote>
      )}
    </>
  );

  return (
    <article className="list-card p-4 anim-rise">
      <div className="flex items-start gap-3">
        <span className={cn('rounded-xl p-2.5 shrink-0', meta.tone)}>
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-0">
            <span className="chip w-fit bg-card-2 text-muted">{APPROVAL_TYPE_LABELS[item.type] ?? item.type}</span>
            <span className="text-[11px] font-semibold text-faint">
              {item.agentId} · {formatRelativeTime(item.createdAt)}
            </span>
          </div>
          <div className="mt-2 hidden sm:block">{body}</div>
        </div>

        {sideActions && (
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              aria-label="Approve"
              title="Approve"
              className="btn group/btn !p-2.5 bg-success-soft text-success transition-all duration-200 hover:-translate-y-0.5 hover:bg-success hover:text-white hover:shadow-[0_6px_16px_-10px_color-mix(in_srgb,var(--success)_55%,transparent)] active:translate-y-0"
              disabled={busy}
              onClick={() => run(() => decideApproval(item, 'approved'))}
            >
              <Check size={17} className="transition-transform duration-200 group-hover/btn:scale-125" />
            </button>
            <button
              type="button"
              aria-label="Reject"
              title="Reject"
              className="btn group/btn !p-2.5 border border-line bg-transparent text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-danger/30 hover:bg-danger-soft hover:text-danger active:translate-y-0"
              disabled={busy}
              onClick={() => setRejecting(true)}
            >
              <X size={17} className="transition-transform duration-200 group-hover/btn:rotate-90" />
            </button>
          </div>
        )}

        {isQuestions && (
          <button
            type="button"
            aria-label="Send answers"
            title="Send answers"
            className="btn group/btn !p-2.5 shrink-0 bg-accent text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-strong hover:shadow-[0_6px_16px_-10px_color-mix(in_srgb,var(--accent)_55%,transparent)] active:translate-y-0"
            disabled={busy || !answeredAll}
            onClick={() => run(() => submitCvAnswers(item, answers))}
          >
            <Send size={17} className="transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
        )}
      </div>

      <div className="mt-3 sm:hidden">{body}</div>

      {isQuestions && (
        <>
          <div className="mt-4 flex flex-col gap-3">
            {questions.map((q, i) => (
              <div key={q}>
                <p className="text-sm font-semibold leading-snug">
                  <span className="text-accent-ink">{i + 1}.</span> {q}
                </p>
                <textarea
                  className="input mt-1.5 min-h-16 resize-y"
                  placeholder="Your answer…"
                  value={answers[q] ?? ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {rejecting && !isQuestions && (
        <div className="mt-3 flex flex-col gap-2">
          <input
            className="input"
            placeholder="Why? The agent learns from this (optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-danger-soft !px-3.5 !py-2"
              disabled={busy}
              onClick={() => run(() => decideApproval(item, 'rejected', reason))}
            >
              <X size={15} /> Confirm reject
            </button>
            <button type="button" className="btn-ghost !px-3.5 !py-2" onClick={() => setRejecting(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
