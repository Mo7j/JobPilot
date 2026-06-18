# Scheduling the crew

Nothing runs until you schedule it. Each folder here is a thin **cron entry point**
that tells Claude to execute the corresponding agent's full SKILL.md.

## Before scheduling, one find-and-replace

Every wrapper contains the placeholder `<AGENTS_DIR>`. Replace it with the absolute
path of your `agents/` folder (the setup agent prints it at the end of setup), e.g.:

- Windows: `C:\Users\you\JobPilot\agents`
- macOS/Linux: `/Users/you/JobPilot/agents`

## The cadence

The four pipeline agents run **every 5 hours**, deliberately split into **two groups
offset by ~2.5 hours** so they don't all fire inside the same 5-hour usage window and
burn through it at once. Group A (discovery) and Group B (production) land in different
windows:

| Schedule | Wrapper | Group | What it runs |
|---|---|---|---|
| Every 5h, at :00 (00, 05, 10, 15, 20) | `job-search-agent` | A | finds new roles |
| Every 5h, at :15 (00, 05, 10, 15, 20) | `job-analysis-agent` | A | scores fit, researches companies (max 3/run) |
| Every 5h, at :30 (02, 07, 12, 17, 22) | `cv-creation-agent` | B | questions → tailored CV drafts → revisions |
| Every 5h, at :45 (02, 07, 12, 17, 22) | `application-writer-agent` | B | submits approved, fills new (never submits unapproved) |
| Every 2 hours | `connection-builder-agent` | — | LinkedIn networking within limits |
| Daily 08:00 | `career-advisor-agent` | — | skill-gap analysis, recommendations |
| Daily 08:00 | `manager-morning` | — | health check, backlog, stuck jobs |
| Daily 20:00 | `manager-evening` | — | quality review + team coaching |

**Why this split:** Group A (search + analysis) runs together so analysis works on the
roles search just found. Group B (CV + application) runs ~2.5h later in the next usage
window, on the items you've since approved. Keep the minute offsets (:00/:15, :30/:45) so
the two agents in each group don't compete for the browser at the same instant.

## Path A, Claude scheduled tasks (recommended)

If your Claude surface supports scheduled/recurring tasks (Claude.ai tasks, Cowork
scheduled tasks), create one scheduled task per wrapper: paste the wrapper's content
as the task prompt and set the schedule from the table. Make sure the environment the
task runs in has:
- the **jobpilot MCP server** registered (mcp-server/README.md),
- **Claude in Chrome** for the browser-dependent agents (job-search,
  application-writer, connection-builder),
- **Google Drive** connected for file delivery.

## Path B, Claude Code headless cron

Register the MCP server in the repo's `.mcp.json` (see mcp-server/README.md), then
schedule headless runs.

**Linux/macOS crontab:**
```cron
# Group A (discovery), hours 0,5,10,15,20
0  0,5,10,15,20 * * *  cd /path/to/JobPilot && claude -p "$(cat agents/scheduled/job-search-agent/SKILL.md)" --dangerously-skip-permissions
15 0,5,10,15,20 * * *  cd /path/to/JobPilot && claude -p "$(cat agents/scheduled/job-analysis-agent/SKILL.md)" --dangerously-skip-permissions
# Group B (production), hours 2,7,12,17,22 (the other usage window)
30 2,7,12,17,22 * * *  cd /path/to/JobPilot && claude -p "$(cat agents/scheduled/cv-creation-agent/SKILL.md)" --dangerously-skip-permissions
45 2,7,12,17,22 * * *  cd /path/to/JobPilot && claude -p "$(cat agents/scheduled/application-writer-agent/SKILL.md)" --dangerously-skip-permissions
# Support agents
0  8 * * *             cd /path/to/JobPilot && claude -p "$(cat agents/scheduled/manager-morning/SKILL.md)" --dangerously-skip-permissions
```

**Windows Task Scheduler** (every 5 hours; set `/ST` start times 2.5h apart to keep the
two groups in different usage windows, e.g. group A at 00:00, group B at 02:30):
```powershell
schtasks /Create /SC HOURLY /MO 5 /ST 00:00 /TN "JobPilot job-search" /TR "claude -p \"Run the JobPilot job-search agent: read <AGENTS_DIR>\job-search\SKILL.md and execute all steps\""
```

Notes for Path B:
- Browser-dependent agents need a Claude environment with the Chrome extension, 
  headless terminal runs degrade to fetch-only (each SKILL.md describes its fallback).
- Review `--dangerously-skip-permissions` carefully; alternatively pre-approve the
  jobpilot MCP tools in `.claude/settings.json`.

## Pausing

You don't need to touch schedules to pause an agent, flip its toggle on the app's
Agents page. A disabled agent exits immediately at startup (the wrapper run costs
seconds).
