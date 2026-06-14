import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  ExternalLink,
  MapPin,
  Briefcase,
  Globe,
  FileText,
  Building2,
  ListChecks,
} from 'lucide-react';
import { scoreTone, stageForStatus } from '../../lib/pipeline';
import { formatRelativeTime, formatDateTime } from '../../lib/dates';
import { cn } from '../../lib/utils';

function Section({ icon: Icon, title, children }) {
  return (
    <section>
      <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
        <Icon size={13} /> {title}
      </h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default function JobDetailDrawer({ job, onClose }) {
  return (
    <AnimatePresence>
      {job && (
        <>
          <motion.button
            type="button"
            aria-label="Close details"
            className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-full max-w-xl flex-col bg-card border-l border-line shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <header className="border-b border-line px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip bg-accent-soft text-accent-ink">{stageForStatus(job.status)}</span>
                    <span className="chip bg-card-2 text-muted">{job.status}</span>
                    {job.fitScore != null && (
                      <span className={cn('chip', scoreTone(job.fitScore))}>Fit {job.fitScore}/100</span>
                    )}
                  </div>
                  <h2 className="mt-2 font-display text-xl font-bold leading-tight">{job.title}</h2>
                  <p className="mt-0.5 text-sm font-semibold text-muted">{job.company}</p>
                </div>
                <button type="button" onClick={onClose} className="btn-ghost !p-2" aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-faint">
                {job.location && (
                  <span className="inline-flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                )}
                {job.workType && (
                  <span className="inline-flex items-center gap-1"><Briefcase size={12} /> {job.workType}</span>
                )}
                {job.sourcePlatform && (
                  <span className="inline-flex items-center gap-1"><Globe size={12} /> {job.sourcePlatform}</span>
                )}
              </div>

              {job.jobUrl && (
                <a
                  href={job.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-ink hover:underline"
                >
                  <ExternalLink size={13} /> View original posting
                </a>
              )}
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">
              {job.searchSummary && (
                <p className="rounded-xl bg-card-2 px-4 py-3 text-sm leading-relaxed">{job.searchSummary}</p>
              )}

              {job.analysisReport && (
                <Section icon={FileText} title="Analysis">
                  <p className="whitespace-pre-line text-sm text-muted leading-relaxed">{job.analysisReport}</p>
                </Section>
              )}

              {job.companyResearch && (
                <Section icon={Building2} title="Company research">
                  <p className="whitespace-pre-line text-sm text-muted leading-relaxed">{job.companyResearch}</p>
                </Section>
              )}

              {Array.isArray(job.atsKeywords) && job.atsKeywords.length > 0 && (
                <Section icon={ListChecks} title="ATS keywords">
                  <div className="flex flex-wrap gap-1.5">
                    {job.atsKeywords.map((k) => (
                      <span key={k} className="chip bg-accent-soft text-accent-ink">{k}</span>
                    ))}
                  </div>
                </Section>
              )}

              {Array.isArray(job.cvQuestionsAsked) && job.cvQuestionsAsked.length > 0 && (
                <Section icon={FileText} title="CV questions">
                  <div className="flex flex-col gap-2">
                    {job.cvQuestionsAsked.map((q) => (
                      <div key={q} className="rounded-xl bg-card-2 px-4 py-3">
                        <p className="text-xs font-semibold text-muted">{q}</p>
                        <p className="mt-1 text-sm">{job.cvAnswersReceived?.[q] || 'No answer yet.'}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {job.applicationText && (
                <Section icon={FileText} title="Application draft">
                  <p className="whitespace-pre-line text-sm text-muted leading-relaxed">{job.applicationText}</p>
                </Section>
              )}

              {Array.isArray(job.agentLog) && job.agentLog.length > 0 && (
                <Section icon={ListChecks} title="Timeline">
                  <ol className="relative flex flex-col gap-4 border-l border-line pl-4 ml-1">
                    {[...job.agentLog].reverse().map((entry, i) => (
                      <li key={`${entry.timestamp}-${i}`} className="relative">
                        <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-accent" />
                        <p className="text-sm leading-snug">{entry.message}</p>
                        <p
                          className="mt-0.5 text-[11px] font-semibold text-faint"
                          title={formatDateTime(entry.timestamp)}
                        >
                          {entry.agentId} · {formatRelativeTime(entry.timestamp)}
                        </p>
                      </li>
                    ))}
                  </ol>
                </Section>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
