<div align="center">

<img src="landing/public/logo.png" alt="JobPilot" width="80" />

# JobPilot

**A crew of AI agents that runs your job search while you sleep.**

<p>
  <a href="https://github.com/Mo7j/JobPilot/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Mo7j/JobPilot/ci.yml?branch=main&label=build&logo=github" alt="Build status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/Mo7j/JobPilot?color=blue" alt="MIT license" /></a>
  <a href="https://7js-jobpilot.netlify.app"><img src="https://img.shields.io/badge/live-demo-6c5ce7?logo=netlify&logoColor=white" alt="Live demo" /></a>
  <img src="https://img.shields.io/badge/powered%20by-Claude-d97757?logo=anthropic&logoColor=white" alt="Powered by Claude" />
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs welcome" /></a>
</p>
<p>
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/Firebase-11-ffca28?logo=firebase&logoColor=black" alt="Firebase 11" />
  <img src="https://img.shields.io/badge/Node-20+-339933?logo=node.js&logoColor=white" alt="Node 20+" />
</p>

Seven Claude agents hunt roles, score fit, draft tailored CVs, and fill applications, 
then stop and wait for **your** approval. Self-hosted on **your** Firebase and **your**
Claude. Your data never leaves your project.

[Live demo](https://7js-jobpilot.netlify.app) · [Setup guide](docs/SETUP.md) ·
[Deploy guide](docs/DEPLOY.md) · [The agents](docs/AGENTS.md) ·
[Architecture](docs/ARCHITECTURE.md) · [FAQ](docs/FAQ.md)

<img src="docs/screenshots/overview-light.png" alt="JobPilot dashboard" width="800" />

</div>

---

## What is this?

Job searching is a full-time job: scanning boards daily, tailoring a CV per role,
writing cover letters, tracking follow-ups. JobPilot turns that into a **pipeline run
by agents with you as the approver**. The agents do the hours; you make the decisions.
Nothing irreversible (submitting an application, sending a connection note) ever
happens without your explicit tap in the dashboard.

## The crew

| Agent | Cadence | Job |
|---|---|---|
| 🧭 **Setup** | once | Interviews you → generates your profile, market playbook, and a **CV design unique to you** |
| 🔍 **Job Search** | every 5h | Finds fresh roles on your platforms, filters against your real profile |
| 📊 **Job Analysis** | every 5h | Scores fit 0–100, researches the company, writes a PDF report |
| 📄 **CV Creation** | every 5h | Drafts a tailored one-page CV, asks you questions instead of inventing facts |
| ✉️ **Application Writer** | every 5h | Fills the whole form, screenshots it, **stops before Submit** |
| 🤝 **Connection Builder** | 2-hourly | Grows your LinkedIn network within strict limits; notes always approval-gated |
| 🎓 **Career Advisor** | daily | Mines market data for the skill gaps actually costing you matches |
| 🧠 **Manager** | 8 AM + 8 PM | Health checks, quality review, coaches the other agents |

## How it fits together

```mermaid
flowchart LR
    subgraph YC["Your Claude"]
      A[8 agents<br/>markdown skills]
    end
    subgraph YF["Your Firebase"]
      F[(Firestore)]
    end
    subgraph YB["Your browser"]
      W[React dashboard]
    end
    A -- "MCP server<br/>(service account)" --> F
    F -- "live snapshots" --> W
    W -- "approvals & instructions" --> F
    A -- "Claude in Chrome" --> J[Job boards & ATS forms]
    A -- "Google Drive" --> D[CVs, reports,<br/>screenshots on your phone]
```

The repo is a monorepo:

```
app/         the dashboard (React 19 + Vite + Tailwind 4 + Firebase), has a zero-config demo mode
agents/      the 8 Claude agents: SKILL.md + knowledge + shared _system contracts
mcp-server/  a tiny MCP server that bridges your Claude ↔ your Firestore
landing/     the marketing site you're probably coming from
docs/        setup guide, architecture, per-agent reference
```

## Quickstart

```bash
git clone https://github.com/Mo7j/JobPilot.git
cd JobPilot
npm install
npm run dev:app     # → http://localhost:5173 in demo mode (sample data, no Firebase needed)
```

That's the demo. To run it for real (your own Firebase, your own Claude, the crew on
a schedule) follow **[docs/SETUP.md](docs/SETUP.md)**. It's eleven steps, each with a
"you know it worked when…" checkpoint, and takes about an evening.

## Design principles

1. **Approval-gated by design.** Agents prepare; the owner presses the button.
   `APPROVAL_NEXT_STATUS` in the app and the `approvalQueue` contract in the agents
   are two halves of the same gate.
2. **Honesty is enforced, not hoped for.** Your skills live in three tiers (strong /
   basic / never-claim). The never-claim tier can't appear on a CV or in an answer;
   any agent that's unsure has to ask you first.
3. **Your data is yours.** No JobPilot server, no telemetry. The app and agents talk
   only to the Firebase project *you* create. See [SECURITY.md](SECURITY.md).
4. **Unique per user.** The setup agent generates your profile, your market playbook,
   and one of 1,000+ CV designs. No two users ship the same resume template.
5. **It learns.** Every reject-with-reason teaches an agent. The manager coaches the
   crew nightly from your actual decisions.

## A tour of the app

**Overview** — your morning glance: pending approvals, active cases, what the crew did
overnight, and where the pipeline is stuck. Light and dark themes.

| Light | Dark |
|---|---|
| ![Overview light](docs/screenshots/overview-light.png) | ![Overview dark](docs/screenshots/overview-dark.png) |

**Approvals** — the gate. Every drafted CV, filled application, and connection note
waits here for an approve or a reject-with-reason (the reason is what the agents learn
from). **Applications** — the pipeline as a kanban board, with a detail drawer per role.

| Approvals | Applications board | Job detail |
|---|---|---|
| ![Approvals](docs/screenshots/approvals.png) | ![Applications board](docs/screenshots/applications-board.png) | ![Job detail](docs/screenshots/job-detail.png) |

**Agents** — your crew at a glance: status, cadence, run counts. Pause any agent or
leave it standing orders. **Insights** — run reports, market trends, and the advisor's
skill-gap advice. **Tracker** — a manual job tracker plus an offline ATS keyword checker.

| Agents | Insights | Tracker · ATS check |
|---|---|---|
| ![Agents](docs/screenshots/agents.png) | ![Insights](docs/screenshots/insights-trends.png) | ![Tracker ATS](docs/screenshots/tracker-ats.png) |

**Installable PWA with phone push.** Add JobPilot to your home screen and turn on push,
then your phone buzzes the moment an agent needs you (via Firebase Cloud Messaging, no
third-party service). Setup in [docs/SETUP.md § 6a](docs/SETUP.md).

<img src="docs/screenshots/mobile-overview.png" alt="JobPilot on mobile" width="280" />

## Status & contributing

Actively maintained. Issues and PRs welcome, see [CONTRIBUTING.md](CONTRIBUTING.md)
(short version: `npm run audit:secrets` must pass, demo mode must still work).

## Credits

Built by [Mohammed Hijazi](https://github.com/Mo7j). It started as my own
job-search automation and got rebuilt for everyone. Powered by
[Claude](https://claude.com). Mascot illustrations are AI-generated for this project.

MIT, see [LICENSE](LICENSE).
