import { toDate } from './dates';

// Job-case status transitions per approval type. `connection_note` and
// `career_advice` are intentionally omitted: they carry no linked job case,
// so approving/rejecting them must not change any job-case status.
export const APPROVAL_NEXT_STATUS = {
  analysis: { approved: 'approved_for_cv', rejected: 'rejected_after_analysis' },
  cv_questions: { approved: 'ready_for_cv_draft', rejected: 'cv_questions_pending' },
  cv: { approved: 'cv_approved', rejected: 'cv_drafting' },
  application: { approved: 'application_approved', rejected: 'application_writing' },
};

export const STATUS_TO_STAGE = {
  found: 'Searching',
  analyzing: 'Analyzing',
  needs_approval: 'Your Review',
  rejected_after_analysis: 'Closed',
  approved_for_cv: 'CV Stage',
  cv_questions_pending: 'CV Stage',
  waiting_for_cv_answers: 'CV Stage',
  ready_for_cv_draft: 'CV Stage',
  cv_drafting: 'CV Stage',
  cv_review: 'CV Stage',
  cv_approved: 'Application Stage',
  application_writing: 'Application Stage',
  application_awaiting_cv: 'Application Stage',
  application_review: 'Application Stage',
  application_approved: 'Application Stage',
  submitting: 'Application Stage',
  ready_to_apply: 'Application Stage',
  applied: 'Applied',
  follow_up_needed: 'Applied',
  connection_strategy_pending: 'Applied',
  connection_approved: 'Applied',
  closed: 'Closed',
};

export const PIPELINE_STAGES = [
  'Searching',
  'Analyzing',
  'Your Review',
  'CV Stage',
  'Application Stage',
  'Applied',
];

export const CLOSED_JOB_CASE_STATUSES = new Set(['rejected_after_analysis', 'closed']);

export const APPROVAL_TYPE_LABELS = {
  analysis: 'Job analysis',
  cv_questions: 'CV questions',
  cv: 'CV draft',
  application: 'Application',
  connection_note: 'Connection note',
  career_advice: 'Career advice',
};

export const AGENT_ORDER = [
  'job-search',
  'job-analysis',
  'cv-creation',
  'application-writer',
  'connection-builder',
  'career-advisor',
  'manager',
];

export function normalizeTimestamp(value) {
  const date = toDate(value);
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

export function hoursSince(value) {
  const date = normalizeTimestamp(value);
  if (!date) return null;
  return Math.max(0, (Date.now() - date.getTime()) / 3600000);
}

export function isJobCaseStuck(job) {
  const hours = hoursSince(job.lastUpdatedAt);
  return hours != null && hours > 24 && !CLOSED_JOB_CASE_STATUSES.has(job.status);
}

export function stageForStatus(status) {
  return STATUS_TO_STAGE[status] ?? 'Searching';
}

export function priorityRank(priority) {
  return { urgent: 0, high: 1, normal: 2, low: 3 }[priority] ?? 4;
}

/** Theme-aware chip classes for a fit score. */
export function scoreTone(score) {
  if (score == null) return 'text-muted bg-card-2 border border-line';
  if (score >= 80) return 'text-success bg-success-soft';
  if (score >= 60) return 'text-warn bg-warn-soft';
  return 'text-danger bg-danger-soft';
}

export function parseQuestions(summary) {
  if (!summary) return [];
  const lines = String(summary)
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;
  return String(summary)
    .split('?')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `${part}?`);
}

export async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
