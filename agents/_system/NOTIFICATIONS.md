# Notification Protocol (shared)

Notifications are the owner's phone-facing signal. They must be **few, useful, and
actionable**, every one should tell them what happened, why it matters, and give them a
way to act (a Drive link or the app page). Noise trains the owner to ignore them.

## Shape (write to `notifications`)

```
mcp__jobpilot__add_document("notifications", {
  "agentId": "<slug>",
  "type": "<approval_needed|file_ready|error|summary|insight>",
  "priority": "<urgent|high|normal|low>",
  "title": "<<= 60 chars, the headline>",
  "body": "<1-2 sentences: what + why + what to do>",
  "actionUrl": "<Drive webViewLink, an app route like /approvals, or null>",
  "dedupeKey": "<stable key, see below>",
  "jobCaseId": "<id or null>",
  "read": false,
  "createdAt": "<ISO 8601>"
})
```

## Priority, be disciplined
| priority | use for |
|----------|---------|
| `urgent` | something is blocked or about to be lost (e.g. an error stopping the pipeline, a deadline today) |
| `high`   | an approval is waiting (CV ready, application ready, analysis to review) |
| `normal` | informational but useful (new jobs found, a new insight, daily Manager summary) |
| `low`    | minor/background (limit warnings, housekeeping) |

## Rules
1. **One notification per meaningful event.** A file becoming ready, an approval needed, an
   error, or a once-a-day summary. Not one per processed item.
2. **Dedupe.** Set `dedupeKey` (e.g. `cv-ready:<jobCaseId>`, `error:job-search:fetch`). Before
   sending, check `notifications` for an **unread** doc with the same `dedupeKey`; if one
   exists, skip (or update it) instead of stacking duplicates.
3. **Always attach `actionUrl` when there's something to open**, the Drive folder/file or the
   relevant app route, so the owner can act from their phone in one tap.
4. **Batch the boring stuff.** "Ran, nothing new" is NOT a notification, it goes into your
   run report and the Manager's summary. Only ping when there is signal.
5. **Quiet by default at night.** Outside the owner's quiet hours (see `CONFIG.md`,
   default ~8:00–22:00 local), only `urgent` may push; everything else waits and is rolled
   into the next Manager summary.
6. Keep `title`/`body` human. "Your Northwind CV is ready, 1 page, tap to review" beats
   "cv-creation completed task".
7. For truly urgent items you may ALSO use `mcp__jobpilot__send_push` (works only if the
   owner enabled push in the app's Settings), the `notifications` doc is still required.
