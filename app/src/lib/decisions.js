import { dataSource } from '../data';
import { APPROVAL_NEXT_STATUS } from './pipeline';

/**
 * Decide a pending approval item. Updates the queue item and, when the item
 * is linked to a job case, advances that case's status. These shapes are part
 * of the agent contract (agents/_system/SCHEMA.md), don't rename fields.
 */
export async function decideApproval(item, decision, reason = '') {
  const decidedAt = new Date().toISOString();
  const transition = APPROVAL_NEXT_STATUS[item.type]?.[decision];

  await dataSource.updateDoc('approvalQueue', item.id, {
    status: 'decided',
    decision,
    reason: decision === 'rejected' ? reason.trim() || null : null,
    decidedAt,
  });

  if (item.jobCaseId && transition) {
    await dataSource.updateDoc('jobCases', item.jobCaseId, {
      status: transition,
      approvalStatus: 'decided',
      approvalDecision: decision,
      approvalDecisionAt: decidedAt,
      approvalRejectionReason: decision === 'rejected' ? reason.trim() || null : null,
      lastUpdatedAt: decidedAt,
    });
  }
}

/** Answer a cv_questions item: stores answers and releases the CV draft. */
export async function submitCvAnswers(item, answers) {
  const decidedAt = new Date().toISOString();

  if (item.jobCaseId) {
    await dataSource.updateDoc('jobCases', item.jobCaseId, {
      cvAnswersReceived: answers,
      status: 'ready_for_cv_draft',
      lastUpdatedAt: decidedAt,
    });
  }
  await dataSource.updateDoc('approvalQueue', item.id, {
    status: 'decided',
    decision: 'approved',
    decidedAt,
  });
}

/**
 * Reply to an agent's request for advice. Stores the owner's answer and marks
 * the request answered + unread-by-agent, so the agent picks it up on its next
 * run (see agents/_system/REQUESTS.md). Shape is part of the agent contract.
 */
export async function replyToAgentRequest(item, reply) {
  await dataSource.updateDoc('agentRequests', item.id, {
    status: 'answered',
    reply: reply.trim(),
    repliedAt: new Date().toISOString(),
    readByAgent: false,
  });
}

export async function decideAdvice(item, decision) {
  await dataSource.updateDoc('careerAdvice', item.id, {
    status: 'decided',
    decision,
    decidedAt: new Date().toISOString(),
  });
}
