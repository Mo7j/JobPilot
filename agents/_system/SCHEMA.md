# Firebase Data Contract (shared)

Your Firestore project (see `CONFIG.md`). Accessed by agents via `mcp__jobpilot__*`;
read live by the JobPilot app (`app/src/lib/pipeline.js` + page components).
**Doc ID = slug** for `agents`, `agentInstructions`, `agentMemory`.
Write only the fields below, the UI reads these exact names.

> Use `set_document` for slug-keyed docs (creates or merges), `add_document` for
> auto-ID docs, `update_document` only when the doc certainly exists.

---

## `agents/{slug}`, one per agent (the app's Agents page + Overview read this)
| field | type | written by | notes |
|-------|------|-----------|-------|
| `id` | string | seed/agent | = slug |
| `name` | string | seed | display name |
| `status` | `idle`\|`running`\|`error` | agent (heartbeat) | drives the status badge |
| `enabled` | bool | UI toggle / manager | if false the agent must stop at startup |
| `lastRun` | ISO 8601 | agent | "Last run" metric |
| `nextRun` | ISO 8601 | agent | "Next run" metric |
| `runningSince` | ISO 8601 \| null | agent | powers the live "Running for" timer |
| `lastRunDurationSeconds` | number \| null | agent | "Last run took X" |
| `runCount` | number | agent | increment each successful run |
| `errorCount` | number | agent | increment on error |
| `pendingApprovals` | number | agent | items this agent has waiting for the owner |
| `lastAction` | string | agent | one concrete sentence |
| `errorMessage` | string | agent | cleared on next clean run |
| `intervalMinutes` | number | seed | UI "Next run" fallback + overdue badge |
| `scheduleLabel` | string | seed | human label, e.g. "Every hour" |

## `agentInstructions/{slug}`, the owner's directives (HIGHEST authority, see INSTRUCTIONS.md)
`{ id, instructions: string, readBy: ISO[], updatedAt }`. Read at startup; append your run
timestamp to `readBy`. The owner edits `instructions` in the app's Agents page.

## `agentMemory/{slug}`, durable per-agent memory
`{ id, lastRunAt, ... agent-specific keys ..., updatedAt }`. Free-form per agent
(e.g. job-search uses `searchConfig`, `trendingSkills`, and `seenJobs` — its map of
already-evaluated jobUrls so each run skips them fast). Grow it via the LEARNING loop.

## `agentReports/{auto}`, run reports shown in the app's Insights → Reports tab
`{ agentId, runType: 'run'|'morning'|'evening'|'monthly', runAt, headline, summary,
   metrics: {<label>: value}, highlights: [], actionsTaken: [], recommendations: [],
   coachingGiven: [], createdAt }`. Manager posts one every run; other agents may post a
short one. Keep arrays to 3-6 punchy items.

## `jobCases/{auto}`, the pipeline (id field == doc id)
Key fields used across agents + UI: `id, title, company, location, workType, jobUrl,
sourcePlatform, status, priority, foundAt, lastUpdatedAt, searchSummary, analysisReport,
companyResearch, fitScore, atsKeywords[], analysisRecommendation, cvQuestionsAsked[],
cvAnswersReceived{}, applicationText, connectionStrategy, appliedAt, followUpDate, tags[],
folderPath, filePaths{}, errorMessage, agentLog[{timestamp,agentId,message}]`. Plus the
files block below.
Status vocabulary lives in `app/src/lib/pipeline.js` (`STATUS_TO_STAGE`).

### Files on a jobCase — LOCAL-FIRST (read FILES.md)
JobPilot is **local-first**: every agent writes its outputs to the owner's local
`<JOBS_DIR>/[Company] - [Title]/` folder and the agents hand files to each other by
**local path**, never through the Drive API. The owner keeps `JOBS_DIR` synced to Google
Drive (SETUP § 9a), so the dashboard can preview the files. See `_system/FILES.md`.
- `folderPath`, the job's local folder (relative to `JOBS_DIR`), e.g. `Acme - Data Analyst`.
- `filePaths`, map of file key → **local path**. This is the source of truth for files and
  what downstream agents read. Known keys (the UI labels these):
  `analysis_report, company_research, resume, resume_pdf, cover_letter,
   application_answers, application_screenshot, interview_notes, connection_strategy`.
- `driveFileUrls`, map of the **same keys** → a Google Drive preview link, so the dashboard
  can embed an inline preview (`/preview` iframe). Obtained by a quick **read-only Drive
  lookup** (search) of the already-synced file, NOT by uploading. If Drive isn't connected
  (or the file isn't visible yet), leave the key unset, the app falls back to showing the
  `filePaths` location.
- `driveFolderId` / `driveFolderUrl` — *deprecated*. No longer required and no agent should
  depend on them; kept optional only for back-compat with old data.

## `approvalQueue/{auto}`, things needing the owner's decision
`{ type: 'analysis'|'cv_questions'|'cv'|'application'|'connection_note'|'career_advice',
   status: 'pending'|'decided', agentId, jobCaseId?, title, summary, attachedFilePath?,
   driveFileUrl?, createdAt, decision?, reason?, decidedAt }`. `attachedFilePath` is the
local file path (always set when there's a file); `driveFileUrl` is the optional Drive
preview link. The UI's "Preview file" embeds `driveFileUrl` when present, else shows the
path. Transitions on decision are in `app/src/lib/pipeline.js` (`APPROVAL_NEXT_STATUS`).

**For `cv_questions` type:** include a `questions: string[]` field, one question per element,
no numbering, no header/footer lines. The UI renders each as a labelled textarea. If `questions`
is absent the UI falls back to parsing `summary` by newlines, so keep `summary` to question-only
lines (no intro sentences) when not using the array field.

**For `connection_note` type:** also include `personName, personRole, personLinkedInUrl,
noteText` so the owner sees exactly what would be sent, to whom.

## `agentRequests/{auto}`, the agent → owner back-channel (see REQUESTS.md)
The way an agent **asks the owner for advice** when it's blocked or has an idea, instead of
talking in a task chat the owner never reads. Shown on the app's Approvals page.
`{ agentId, status: 'open'|'answered', title, question, context?, jobCaseId?,
   reply?, repliedAt?, readByAgent: bool, createdAt }`.
The owner types a reply in the app → `status:'answered'`, `reply` set, `readByAgent:false`.
At startup each agent reads its `answered` + `readByAgent:false` requests, acts on them,
then sets `readByAgent:true`. See REQUESTS.md for the full loop.

## `notifications/{auto}`, see NOTIFICATIONS.md
`{ agentId, type, priority: 'urgent'|'high'|'normal'|'low', title, body, actionUrl?,
   dedupeKey, jobCaseId?, read: false, createdAt }`.

## `trends/{week}`, market trends (app's Insights → Trends tab)
`{ week, weekOf?, skillFrequency{}, roleFrequency{}, companyFrequency{}, certFrequency{},
   jobsFound, createdAt }`.

## `systemLogs/{auto}`, machine run log (manager reads these)
`{ agentId, runAt, summary, durationSeconds, jobsProcessed?, jobsCreated?,
   errorsEncountered?, ... }`.

## `careerAdvice/{auto}`, advisor recommendations (app's Insights → Advice tab)
`{ recommendation, reasoning, category: 'skill_gap'|'certification'|'project_idea'|'strategy',
   priority, effort: 'low'|'medium'|'high', impact, actionItems[],
   status: 'pending'|'decided', decision?, createdAt }`.

## `jobs/{auto}`, the owner's MANUAL tracker (app's Tracker page)
`{ companyName, position, location, status: 'pending'|'assessments'|'interview'|'offer'|'rejected',
   dateApplied, followUpDate, jobUrl, notes, contactName, contactEmail }`.
Agents may append here when an application is submitted (so the owner tracks responses),
but never modify rows the owner created without instruction.

## `settings/user`, app settings
`{ fcmToken?, theme? }`. `fcmToken` powers `send_push`.

## `meta/googleDrive`, Drive config (optional, legacy)
`{ id: 'googleDrive', setupComplete: bool, rootFolderId, rootFolderUrl, updatedAt }`.
Legacy, from when files were uploaded via the API. JobPilot is now local-first
(`_system/FILES.md`); this doc is not required and may be absent.
