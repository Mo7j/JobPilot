# Reporting, Knowledge (Manager → app)

After every run, the Manager posts a **useful report** to the `agentReports`
collection. It shows in the app's Insights → Reports tab (and feeds the Overview).
The owner should be able to read it in 15 seconds and know exactly what happened and
what (if anything) needs them.

## Write to `agentReports`
```
mcp__jobpilot__add_document("agentReports", {
  "agentId": "manager",
  "runType": "<morning|evening|monthly>",
  "runAt": "<ISO 8601>",
  "headline": "<one line: the single most important thing>",
  "summary": "<2-3 sentences: state of the pipeline>",
  "metrics": { "jobsFound": N, "pendingApprovals": N, "stuckJobs": N, "errors": N, "applied": N },
  "highlights": ["3-6 punchy bullets of what happened"],
  "actionsTaken": ["what the manager did: disabled X, nudged Y"],
  "coachingGiven": ["agent: change + why (from coaching_playbook)"],
  "recommendations": ["what the owner should consider / decide"],
  "createdAt": "<ISO 8601>"
})
```

## Quality bar
- **Headline first.** Lead with the one thing that matters most (an approval waiting,
  an error, a big win). Not "Morning run complete".
- **Specific, quantified, scannable.** Real numbers, real names. 3–6 items per array, max.
- **Action-oriented.** Every report ends knowing what's blocked and what needs the owner.
- **Honest.** A quiet run is a quiet run, don't manufacture activity.

## Pair with a notification
Send **one** `summary`-type notification (see `_system/NOTIFICATIONS.md`) pointing at
the report, priority `normal` (or `high`/`urgent` if something needs the owner now).
Boring per-agent "ran, nothing new" detail lives only in the report, never as its own
push.

## Monthly report (1st of month)
Add 30-day stats: jobs found/analyzed, CVs drafted, applications submitted, response
rate, platform performance, role focus, top skill gaps. Write the long version to
`memory/system_log.md` before posting the report + notifying.
