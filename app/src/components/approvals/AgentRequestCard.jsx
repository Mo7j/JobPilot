import { useState } from 'react';
import { MessageCircleQuestion, Send } from 'lucide-react';
import { replyToAgentRequest } from '../../lib/decisions';
import { formatRelativeTime } from '../../lib/dates';

/**
 * An agent's question/idea for the owner (agentRequests). The owner types a
 * reply here instead of in any task chat; the agent reads it on its next run.
 */
export default function AgentRequestCard({ item, jobCase }) {
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  async function send() {
    if (busy || !reply.trim()) return;
    setBusy(true);
    try {
      await replyToAgentRequest(item, reply);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="list-card border-l-2 border-l-accent p-4 anim-rise">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-accent-soft p-2.5 text-accent-ink shrink-0">
          <MessageCircleQuestion size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2">
            <span className="chip w-fit bg-accent-soft text-accent-ink">Agent question</span>
            <span className="text-[11px] font-semibold text-faint">
              {item.agentId} · {formatRelativeTime(item.createdAt)}
            </span>
          </div>
          <h3 className="mt-2 font-bold leading-snug">{item.title}</h3>
          {jobCase && (
            <p className="mt-0.5 text-xs text-muted">
              {jobCase.company}, {jobCase.title}
            </p>
          )}
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{item.question}</p>
          {item.context && (
            <p className="mt-2 rounded-xl bg-card-2 px-3.5 py-2.5 text-xs leading-relaxed text-muted">
              {item.context}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <textarea
          className="input min-h-16 resize-y"
          placeholder="Your advice… the agent reads this on its next run."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <div>
          <button
            type="button"
            className="btn-soft !px-3.5 !py-2"
            disabled={busy || !reply.trim()}
            onClick={send}
          >
            <Send size={15} /> Send reply
          </button>
        </div>
      </div>
    </article>
  );
}
