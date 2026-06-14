# Architecture

JobPilot is three pieces around one database, with you holding the approval pen.

```
┌─────────────────┐   MCP (stdio)    ┌──────────────────┐   onSnapshot    ┌─────────────┐
│  Your Claude    │ ───────────────► │  Your Firestore  │ ──────────────► │  React app  │
│  (8 agents,     │   service acct   │  (the one source │   live updates  │  (dashboard)│
│   markdown)     │ ◄─────────────── │   of truth)      │ ◄────────────── │             │
└────────┬────────┘                  └──────────────────┘   your writes   └─────────────┘
         │ Claude in Chrome → job boards, ATS forms, LinkedIn
         │ Google Drive     → files readable on your phone
```

## The contract: SCHEMA.md

Everything hangs on one data contract:
[`agents/_system/SCHEMA.md`](../agents/_system/SCHEMA.md). The agents write those
exact field names; the app reads them (`app/src/lib/pipeline.js` + page components);
the demo fixtures mirror them. **If you change a field, change it in all three
places**: agents, schema doc, and app/fixtures.

Key collections:

| Collection | Purpose | Written by |
|---|---|---|
| `jobCases` | the pipeline, one doc per role found | all pipeline agents |
| `approvalQueue` | everything waiting on the owner | agents queue · app decides |
| `agents` (doc id = slug) | live status/heartbeat per agent | agents · app toggles `enabled` |
| `agentInstructions` (slug) | the owner's standing orders | app · manager (coaching) |
| `agentMemory` (slug) | per-agent durable memory | agents |
| `agentReports` | run reports for the Insights tab | manager + agents |
| `notifications` | the bell | agents |
| `trends` | weekly market aggregates | job-search |
| `careerAdvice` | advisor recommendations | career-advisor |
| `jobs` | the owner's manual tracker | owner + application-writer |
| `systemLogs` | machine logs the manager reads | agents |

## The approval gate (the core mechanism)

1. An agent finishes a unit of work and writes an `approvalQueue` doc
   (`status: "pending"`, typed `analysis | cv_questions | cv | application |
   connection_note | career_advice`).
2. The app renders it; the owner taps approve/reject (with a reason).
3. The app writes the decision AND advances the linked `jobCase.status` via
   `APPROVAL_NEXT_STATUS` (`app/src/lib/decisions.js`).
4. The next agent's hourly query picks up the new status. The reason text feeds the
   agents' learning loop.

No agent ever performs an irreversible action from an unapproved state; the queries
they run simply can't see those cases.

## The app (`app/`)

React 19 + Vite + Tailwind 4 (CSS-first tokens, light/dark via `data-theme`).
Pages: Overview, Approvals, Applications (kanban + detail drawer), Agents, Insights
(Reports/Advice/Trends), Tracker (manual jobs + ATS keyword checker), Settings.

**The data seam** (`app/src/data/`) is the only place that knows where data comes from:

```js
dataSource = isDemoMode ? demoAdapter : firestoreAdapter
// subscribeCollection / subscribeDoc / addDoc / updateDoc / setDoc / deleteDoc
```

- `firestoreAdapter` wraps the Firebase SDK.
- `demoAdapter` is an in-memory store seeded from `app/src/data/demo/` (fictional
  "Jane Doe" persona) with snapshot semantics: mutations notify subscribers, so the
  demo's approve-a-CV actually moves the kanban card. Demo mode activates
  automatically when Firebase env vars are absent, or via `VITE_DEMO_MODE=true`.

## The agents (`agents/`)

Plain markdown executed by Claude. Generalization is done through **two generated,
gitignored files** every agent reads first:

- `_system/CONFIG.md`: machine paths, MCP prefix, timezone (from `CONFIG.template.md`)
- `_system/PROFILE.md`: the owner's facts and three-tier skills (from `PROFILE.template.md`)

plus four per-user generated files (base_cv, cv_design, market_playbook,
screening_answers). The committed repo contains **zero personal data**; the setup
agent writes the personal layer locally.

## The MCP server (`mcp-server/`)

~200 lines: stdio MCP server (`@modelcontextprotocol/sdk`) + `firebase-admin`,
authenticated by the owner's service-account key. Tools: `list_collection`,
`get_document`, `add_document`, `set_document` (create-or-merge for slug docs),
`update_document`, `delete_document`, `send_push` (FCM), `clear_collection`
(destructive, confirmation-gated by convention).

## Repo hygiene

- `scripts/audit-personal-data.mjs`: fails on secrets/personal patterns in committed
  files (patterns live in a gitignored local file).
- `scripts/verify-app.py` / `verify-landing.py`: Playwright end-to-end checks used
  during development; rerun after UI changes.
- Workspaces: `npm run dev:app`, `npm run dev:landing`, `npm run build`,
  `npm run audit:secrets` from the root.
