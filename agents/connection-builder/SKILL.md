# Connection Builder Agent
**Agent ID:** connection-builder
**Schedule:** Every 2 hours
**Purpose:** Grow the owner's LinkedIn network, job-specific connections for active
applications, and general networking to fill each run.
**Target:** 10–15 connections per run.
**LinkedIn profile:** from `_system/PROFILE.md` (Contact → Links).

Requires browser automation (Claude in Chrome), if CONFIG.md says it's unavailable,
write an idle heartbeat with lastAction "Browser automation unavailable" and stop.

> ⚠ Automating actions on LinkedIn can violate its Terms of Service and risk account
> restrictions. This agent stays deliberately conservative (low volume, human-pace,
> hard caps), but the owner runs it at their own risk, make sure they know.

---

## Read first
- `_system/CONFIG.md`, `_system/PROFILE.md`
- `_system/INSTRUCTIONS.md`, the owner's UI instructions OVERRIDE the rules below.
- `_system/HEARTBEAT.md`, `_system/NOTIFICATIONS.md`, `_system/LEARNING.md`, `_system/SCHEMA.md`
- `knowledge/networking_playbook.md`, limits, targeting rules, note templates.
- `job-search/knowledge/market_playbook.md`, target employers list.

**Doc ID = the slug `connection-builder`** for `agents`, `agentInstructions`, `agentMemory`.

---

## Step 0: Standard Startup

**0.1 Check enabled, then START the heartbeat** (`_system/HEARTBEAT.md`).
**0.2 Read instructions** (OVERRIDE this SKILL).
**0.3 Read memory, check limits**
```
mcp__jobpilot__get_document("agentMemory", "connection-builder")
→ weeklyConnectionsSent vs weekly cap (100), apply the back-off ladder in the playbook
→ monthlyNotesSent vs monthly note cap (5 on free accounts)
→ At/over weekly cap: notify (low) and STOP with a clean idle heartbeat.
→ At/over note cap: notes disabled this run, all requests go blank.
```

---

## Step 1: Send Approved Notes (Priority 0, always first)

```
mcp__jobpilot__list_collection("approvalQueue")
→ Filter: agentId == "connection-builder" AND type == "connection_note"
          AND status == "decided" AND decision == "approved" AND sentAt missing
```

For each approved item:
1. Navigate to `personLinkedInUrl`.
2. Check connection state via JS/button text:
   - "Connect" → proceed
   - "Pending" → skip this run, retry next run
   - "Message" (already connected) → update item `status: "void"`, log "already connected".
3. Click Connect → note modal → paste `noteText` → Send.
4. If LinkedIn shows the monthly-note limit mid-send: fall back to a blank request and
   log the fallback on the item.
5. On success: update the item → `status: "sent"`, `sentAt: <ISO 8601>`; increment
   `agentMemory.monthlyNotesSent`.

---

## Step 2: Job-Specific Connections (Priority 1)

**Query:** `jobCases` where status ∈ {approved_for_cv, cv_review, cv_questions_pending,
applied} AND connectionStrategy == null.

For each case:

### 2.1: Scan the posting for a recruiter
`get_page_text` on `jobCase.jobUrl`: recruiter name, any profile links, concrete
tech/team details (facts for the note).

### 2.2: Find people at the company
`https://www.linkedin.com/company/[slug]/people/` (resolve the slug via company search
if unknown). **Max 2 people per company**, priority:
1. Recruiter named in the posting
2. "Talent Acquisition" / "Recruiter" / "HR" titles
3. Same function as the role, same level or one above

**Skip:** already 1st/Pending, C-suite/VP/Director+, unrelated departments, inactive
6+ months. **Always check the button state BEFORE clicking** (see Speed Rules).

### 2.3: Peer: blank request immediately
Connect → "Send without a note" → confirm Pending via JS → log name/role/company/URL.

### 2.4: Recruiter/HR: queue the note FIRST, do NOT connect yet
⚠ The connection happens next run WITH the approved note.

Draft a note **strictly ≤ 200 characters**, facts only (JD + company page):
```
Hi [Name], [owner's one-phrase identity from PROFILE.md, e.g. "frontend dev"] applying
for [Role] at [Company]. [1 factual detail from the JD]. CV: [resume_pdf link]. [Owner first name]
```
No "passionate about", no "excited to", no assumptions. Verify the character count.

Push to approvalQueue:
```
mcp__jobpilot__add_document("approvalQueue", {
  "agentId": "connection-builder", "type": "connection_note", "status": "pending",
  "title": "Note, [Name] @ [Company]",
  "personName": "[Name]", "personRole": "[their title]",
  "personLinkedInUrl": "[actual profile URL, found, not guessed]",
  "jobTitle": "[jobCase.title]", "company": "[jobCase.company]",
  "noteText": "[≤200 chars]", "cvLink": "[resume_pdf link]",
  "jobCaseId": "[jobCase.id]", "createdAt": "[ISO 8601]"
})
```
Notify (normal): "Review note, [Name] @ [Company]" / "NOT connected yet. Approve →
I connect with this note next run." `dedupeKey: "note-[jobCaseId]-[name-slug]"`.

### 2.5: Update the jobCase
`connectionStrategy: "In progress, peer connected (blank), recruiter note pending approval."`

---

## Step 3: General Networking Fill (Priority 2)

If Step 2 sent < 10, fill up to 15 total from the playbook's target companies:
1. Recruiters / Talent Acquisition at target companies
2. People in the owner's target roles at target companies
3. Alumni of the owner's school (PROFILE.md) in relevant roles

All blank requests, no approval needed, no notifications. Same skip rules.

---

## Step 4: Update Memory & Close

**4.1 Read the REAL connection count** from the owner's own profile page, never calculate.
**4.2** `mcp__jobpilot__set_document("meta", "linkedin", { "connections": [real count] })`
**4.3** Update `agentMemory`: weeklyConnectionsSent += sent, monthlyNotesSent += notes,
lastGeneralNetworkingAt.
**4.4** Append to `<AGENTS_DIR>/connection-builder/memory/connection_log.md`:
`[YYYY-MM-DD], Sent [N]: [Name @ Company (blank/note queued)], … New total: [count].`
**4.5** systemLogs entry + ONE summary notification every run (even "0 sent, weekly
limit reached. Total: [N].").
**4.6** Close the LinkedIn tab. Close the heartbeat per `_system/HEARTBEAT.md`
(nextRun = +120 min); append to `readBy`.

---

## Error Handling
- **CAPTCHA / rate limit:** stop immediately, ERROR heartbeat, one `error` notification.
- **"Withdraw invitation" modal:** close with X, never confirm, move on.
- **Never click a "Pending" button**, it opens the withdrawal modal.
- **Note limit reached mid-run:** blank-request fallback, log it.
- **People page unavailable:** fall back to people search by company name.

## Hard Rules
1. Blank requests send immediately, no approval needed.
2. Notes (sent WITH a request) ALWAYS require the owner's approval first.
3. Notes ≤ 200 characters, verify before queuing.
4. Notes are for recruiter/HR contacts only, max 5/month (free-account limit).
5. Facts only in notes, nothing assumed, no approval-history references.
6. Never click a Pending button.
7. Always read the real connection count from the profile.
8. Weekly limit 100, daily 25, stop and notify when reached.
9. Target 10–15 connections per run, never more.

---

## Speed & Efficiency Rules

### ALWAYS use the browser MCP, never desktop computer-use for LinkedIn.

### Check connection status BEFORE clicking
```js
document.querySelector('button[aria-label*="Connect"]')?.innerText
// null → check for "Message" / "Follow" / "Pending", all mean skip
```

### Connect from the People page inline, no per-profile navigation
Connect buttons are usually visible inline; `find("Connect button")` and click the ref.
Only open a profile when the person has Creator mode (Follow shown) or you must verify
their role.

### Use `get_page_text` for bulk scanning, not screenshots.

### Batch JS checks instead of screenshot-wait-click loops
```js
!!document.querySelector('[aria-label="Send without a note"]')   // modal open?
document.querySelector('button[aria-label*="Pending"]') !== null // request sent?
```

### Do not pause between connections
Connect → confirm Pending via JS → next person. Screenshot only when uncertain.
