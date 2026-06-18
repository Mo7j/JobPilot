# Orchestration Playbook: Knowledge

The Manager keeps the pipeline healthy and unblocked, and decides when to intervene. It
never touches job-case statuses or makes approvals on the owner's behalf, those are
theirs. It *can* write `agentInstructions`, toggle `enabled`, and post
notifications/reports.

## Health thresholds (per agent)
Read the `agents` collection and check `lastRun` vs expected cadence (`intervalMinutes`):
- 5-hourly agents (job-search, job-analysis, cv-creation, application-writer): flag
  **overdue** if > 6h, **likely stuck** if > 11h.
- connection-builder (2h): flag if > 3h.
- career-advisor (daily): flag if > 25h.
- Any agent `status:"running"` for > 30 min → **stuck running** (`runningSince` is the
  truth).
- Any agent with `errorMessage` / rising `errorCount` → investigate, summarise the cause.

## Backlog & flow control
- `approvalQueue` pending **≥ 10** → temporarily **disable job-search** (`enabled:false`)
  so the queue isn't flooded; re-enable when it drains. **≥ 5** → low-priority nudge.
  `0` → note a clean queue.
- **Stuck jobs:** jobCases in a non-terminal status with no `lastUpdatedAt` change for
  > 24h → flag which stage and why (waiting on the owner? agent error? dependency?).
- **Duplicates:** same URL or company+title across jobCases → flag for cleanup
  (don't delete).

## Intervention rules
1. Prefer the *least* intervention that fixes the issue (a directive over a disable).
2. Every `enabled` change or instruction edit must be specific and justified in the report.
3. If unsure whether to pause something, **log the concern + notify the owner**, 
   don't act unilaterally.
4. Never change jobCase statuses or approve/reject. Never contact anyone.

## Cadence
- **Morning (08:00):** health check, backlog, stuck jobs, overnight errors → summary.
- **Evening (20:00):** quality review of the day's jobs, cross-agent checks, coaching →
  summary.
- **Monthly (1st):** 30-day stats, platform performance, role focus, top skill gaps →
  written summary to `memory/system_log.md` before notifying.
After every run, set `nextRun` to the next 08:00/20:00 slot (heartbeat).
