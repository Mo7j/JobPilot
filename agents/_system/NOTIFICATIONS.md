# Notification Protocol (shared)

Notifications are the owner's phone-facing signal. They must be **useful and
actionable**, every one should tell them what happened, why it matters, and give them a
way to act (a Drive link or the app page).

> **The bell and the phone push are the same thing.** Every `notifications` doc you add
> is **automatically delivered as a phone push** by the MCP server (when the owner has
> enabled push). You do **not** call `send_push` separately, just write the notification.
> Whatever shows in the in-app bell 🔔 is exactly what buzzes the owner's phone.

## Shape (write to `notifications`)

```
mcp__jobpilot__add_document("notifications", {
  "agentId": "<slug>",
  "type": "<approval_needed|file_ready|error|summary|insight|question>",
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
   error, or a question for the owner. Not one per processed item.
2. **Every run ends with exactly one `summary` notification** (see `HEARTBEAT.md` END
   step). It's the "here's what I did this run" line, what you found/queued/asked, or
   plainly "Ran, nothing new this time." `dedupeKey: "run-summary:<slug>:<runStart ISO>"`,
   `priority: "low"` (or `normal` if the run produced something the owner should glance at),
   `actionUrl` to the most relevant page. This is the one place a quiet run still pings.
3. **Dedupe.** Set `dedupeKey` (e.g. `cv-ready:<jobCaseId>`, `error:job-search:fetch`). Before
   sending, check `notifications` for an **unread** doc with the same `dedupeKey`; if one
   exists, skip (or update it) instead of stacking duplicates.
4. **Always attach `actionUrl` when there's something to open**, the Drive folder/file or the
   relevant app route, so the owner can act from their phone in one tap.
5. Keep `title`/`body` human. "Your Northwind CV is ready, 1 page, tap to review" beats
   "cv-creation completed task".
6. **The bell == the push.** Adding the `notifications` doc is all you do; the MCP server
   auto-pushes it to the owner's phone. Don't call `send_push` for normal notifications.
