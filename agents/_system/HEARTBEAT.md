# Heartbeat Protocol (shared by every agent)

This is the single source of truth for how an agent reports its state to Firebase
so the JobPilot app shows live status, stats, and timing. Every agent runs this at the
**start** and **end** of every run. **Document ID = the agent's slug** for the
`agents`, `agentInstructions`, and `agentMemory` collections (e.g. `agents/job-search`).
Never use random doc IDs, the UI reads by slug.

---

## At the START of a run (after the enable check)

Record the start time and flip to running so the UI shows a live "Running for" timer:

```
START_TIME = now (ISO 8601)
mcp__jobpilot__set_document("agents", "<slug>", {
  "status": "running",
  "runningSince": START_TIME,
  "errorMessage": ""
})
```

Also read the current `runCount` from the `agents` doc now (you already listed the
collection for the enable check) and keep it, you will write `runCount + 1` at the end.

---

## At the END of a run (success)

```
END_TIME = now (ISO 8601)
DURATION = round((END_TIME - START_TIME) in seconds)
NEXT_RUN = END_TIME + intervalMinutes   // see "Next run" below

mcp__jobpilot__set_document("agents", "<slug>", {
  "status": "idle",
  "lastRun": END_TIME,
  "nextRun": NEXT_RUN,
  "runningSince": null,
  "lastRunDurationSeconds": DURATION,
  "runCount": <previous runCount + 1>,
  "lastAction": "<one concrete sentence: what you actually did this run>"
})
```

`lastAction` must be specific and useful, e.g. "Analyzed 3 jobs; queued two strong
fits for your review", not "Run complete".

### Next run
`nextRun = lastRun + intervalMinutes` (the `intervalMinutes` field is on your agent doc):
job-search / job-analysis / cv-creation / application-writer = 60, connection-builder = 120,
career-advisor = 1440. **Manager is special:** set `nextRun` to the next 08:00 or 20:00
slot in the owner's timezone (see `CONFIG.md`), whichever comes first after this run.

---

## On ERROR (caught failure that stops the run)

```
mcp__jobpilot__set_document("agents", "<slug>", {
  "status": "error",
  "errorMessage": "<short, human-readable cause>",
  "errorCount": <previous errorCount + 1>,
  "runningSince": null,
  "nextRun": "<END_TIME + intervalMinutes>"
})
```
Then send one `error`-priority notification (see `NOTIFICATIONS.md`) and stop. A clean next
run will set `status` back to `idle` and clear `errorMessage`.

---

## Rules

1. Always pair a START write with an END (or ERROR) write, never leave an agent stuck in
   `running`. If you must exit early (disabled, backlog pause), still write `status:"idle"`
   with a `lastAction` explaining why.
2. `pendingApprovals` on the agent doc = the number of items you currently have waiting in
   `approvalQueue` for the owner. Update it whenever you add or resolve an approval.
3. Keep timestamps ISO 8601 so the app's relative-time and duration displays render correctly.
4. The heartbeat is mechanical bookkeeping, it never decides anything. Decisions live in the
   agent's own steps, in `INSTRUCTIONS.md` precedence, and in `LEARNING.md`.
