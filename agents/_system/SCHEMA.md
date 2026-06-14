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
(e.g. job-search uses `searchConfig`, `trendingSkills`). Grow it via the LEARNING loop.

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
folderPath, errorMessage, agentLog[{timestamp,agentId,message}]`. Plus Drive fields below.
Status vocabulary lives in `app/src/lib/pipeline.js` (`STATUS_TO_STAGE`).

### Drive fields on a jobCase (see DRIVE in each SKILL + auto-setup)
- `driveFolderId`, Drive folder ID for `[Company] - [Title]`
- `driveFolderUrl`, shareable `webViewLink` for the folder
- `driveFileUrls`, map of file → `webViewLink`. Known keys the UI links:
  `job_info, analysis_report, company_research, fit_analysis, ats_keywords,
   resume, resume_pdf, cover_letter, application_answers, interview_notes, connection_strategy`

## `approvalQueue/{auto}`, things needing the owner's decision
`{ type: 'analysis'|'cv_questions'|'cv'|'application'|'connection_note'|'career_advice',
   status: 'pending'|'decided', agentId, jobCaseId?, title, summary, driveFileUrl?,
   attachedFilePath?, createdAt, decision?, reason?, decidedAt }`. Transitions on decision
are defined in `app/src/lib/pipeline.js` (`APPROVAL_NEXT_STATUS`).

**For `cv_questions` type:** include a `questions: string[]` field, one question per element,
no numbering, no header/footer lines. The UI renders each as a labelled textarea. If `questions`
is absent the UI falls back to parsing `summary` by newlines, so keep `summary` to question-only
lines (no intro sentences) when not using the array field.

**For `connection_note` type:** also include `personName, personRole, personLinkedInUrl,
noteText` so the owner sees exactly what would be sent, to whom.

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

## `meta/googleDrive`, Drive config (auto-created on first upload)
`{ id: 'googleDrive', setupComplete: bool, rootFolderId, rootFolderUrl, updatedAt }`.
