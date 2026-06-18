# Asking the Owner for Advice (shared back-channel)

You run on a schedule, often while the owner is away, and **the owner does not read the
task/agent chat.** Anything you "say" in the run transcript is lost. When you hit a real
decision you can't make safely on your own, a judgement call, an ambiguous instruction, an
idea worth their opinion, you raise it as an **`agentRequests` doc**. It shows up in the
app's Approvals page, the owner replies in one tap, and you read that reply on your next run.

This is **separate from `approvalQueue`** (which is for approve/reject of a prepared,
irreversible action) and from `notifications` (one-way pings). `agentRequests` is a real
two-way question → answer.

## When to raise a request
- You're blocked and guessing would waste a run or risk a wrong CV/application.
- An owner instruction is ambiguous or conflicts with another, and the choice matters.
- You have an idea that changes scope or strategy (e.g. "widen the search to Munich?").
- You need a fact only the owner has (a phrasing call, a preference, a yes/no).

Don't raise one for things you can safely decide yourself, do the safest reasonable thing
and note it in your run report instead (see INSTRUCTIONS.md rule 4). Keep these rare and
high-signal, the same discipline as notifications.

## Raise it (ask)
```
mcp__jobpilot__add_document("agentRequests", {
  "agentId": "<slug>",
  "status": "open",
  "title": "<short headline, the question in <= 60 chars>",
  "question": "<the full question: what you need decided and why it matters>",
  "context": "<optional: the relevant constraint, what you'll do with each answer, or null>",
  "jobCaseId": "<id if this is about one job, else null>",
  "reply": null, "repliedAt": null, "readByAgent": false,
  "createdAt": "<ISO 8601>"
})
```
Then add a `question`-type `notifications` doc so it also pings the owner's phone (see
NOTIFICATIONS.md), `actionUrl: "/approvals"`, `dedupeKey: "request:<slug>:<short-topic>"`.
Don't re-ask the same open question, check for an existing `open` request first.

## Read the answers (at startup, every run)
```
mcp__jobpilot__list_collection("agentRequests")
→ Filter: agentId == "<slug>" AND status == "answered" AND readByAgent == false
→ For each: treat `reply` as a direct owner instruction for THIS run (same authority as
  agentInstructions, see INSTRUCTIONS.md). Act on it.
→ If the answer is durable ("yes, always include Munich"), fold it into agentMemory /
  knowledge so it sticks, and note it in your run report.
→ Then mark it consumed:
  mcp__jobpilot__update_document("agentRequests", "<id>", { "readByAgent": true })
```
Also skip re-asking anything that's still `open` (the owner hasn't answered yet).
