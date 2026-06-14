# The JobPilot crew

Eight Claude agents that run a job search end-to-end on YOUR Claude, against YOUR
Firebase. Every irreversible action (submitting an application, sending a note) stops
in the approval queue until you tap approve in the app.

## The agents

| Agent | Cadence | Does |
|---|---|---|
| **setup** | once (manual) | Interviews you, generates your profile + unique CV design + market playbook, seeds Firestore, smoke-tests the loop |
| **job-search** | hourly | Finds new roles on your platforms, filters, creates jobCases |
| **job-analysis** | hourly | Scores fit 0–100 against YOUR profile, researches the company, writes a PDF report |
| **cv-creation** | hourly | Asks honest clarifying questions, drafts a tailored 1-page CV (verified), revisions on request |
| **application-writer** | hourly | Fills application forms completely, screenshots, stops before Submit; submits after your approval |
| **connection-builder** | every 2h | Grows your LinkedIn network within hard limits; notes always approval-gated |
| **career-advisor** | daily | Finds your recurring skill gaps in real market data, recommends high-ROI moves |
| **manager** | 8 AM + 8 PM | Health checks, quality review, coaches the other agents |

## How it fits together

```
job-search → jobCases(found) → job-analysis → YOUR approval → cv-creation
  → YOUR approval → application-writer (fills, stops) → YOUR approval → submitted
connection-builder works alongside active applications
career-advisor reads the aggregate market data
manager watches everything and coaches
```

## Folder anatomy

```
agents/
├── _system/            # shared contracts every agent reads
│   ├── SCHEMA.md       #   the Firestore data contract (matches the app)
│   ├── HEARTBEAT.md    #   live status reporting protocol
│   ├── INSTRUCTIONS.md #   your in-app instructions override everything
│   ├── NOTIFICATIONS.md#   when/how agents may ping you
│   ├── LEARNING.md     #   the self-improvement loop
│   ├── PROFILE.template.md  → PROFILE.md (generated, gitignored: YOUR facts)
│   └── CONFIG.template.md   → CONFIG.md  (generated, gitignored: paths/IDs)
├── <agent>/SKILL.md    # the agent's full instruction set
├── <agent>/knowledge/  # its expertise (some files generated per-user)
├── <agent>/memory/     # its run memory (gitignored)
└── scheduled/          # thin cron wrappers + scheduling guide (README.md)
```

## Installing

1. Finish docs/SETUP.md steps 1–9 (Firebase, app, MCP server, connectors).
2. Run the **setup agent**: open Claude (Desktop/Code) with this folder accessible and
   say *"Read agents/setup/SKILL.md and run the setup"*. It interviews you and
   generates every per-user file.
3. Schedule the runs, `scheduled/README.md`.

## Customizing

- **Steer day-to-day** from the app's Agents page (custom instructions, they override
  the SKILL files, no editing needed).
- **Change behaviour permanently** by editing an agent's SKILL.md or knowledge files, 
  they're plain markdown.
- **Pause** any agent with its toggle in the app.
