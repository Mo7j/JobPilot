# Scheduling the crew

Nothing runs until you schedule it. Each folder here is a thin **cron entry point**
that tells Claude to execute the corresponding agent's full SKILL.md.

## Before scheduling, one find-and-replace

Every wrapper contains the placeholder `<AGENTS_DIR>`. Replace it with the absolute
path of your `agents/` folder (the setup agent prints it at the end of setup), e.g.:

- Windows: `C:\Users\you\JobPilot\agents`
- macOS/Linux: `/Users/you/JobPilot/agents`

## The cadence

| Schedule | Wrapper | What it runs |
|---|---|---|
| Every hour | `job-search-agent` | finds new roles |
| Every hour | `job-analysis-agent` | scores fit, researches companies (max 3/run) |
| Every hour | `cv-creation-agent` | questions → tailored CV drafts → revisions |
| Every hour | `application-writer-agent` | submits approved, fills new (never submits unapproved) |
| Every 2 hours | `connection-builder-agent` | LinkedIn networking within limits |
| Daily 08:00 | `career-advisor-agent` | skill-gap analysis, recommendations |
| Daily 08:00 | `manager-morning` | health check, backlog, stuck jobs |
| Daily 20:00 | `manager-evening` | quality review + team coaching |

Stagger the hourly agents a few minutes apart (e.g. :00, :10, :20, :30) so they don't
compete for the browser.

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
0 * * * *   cd /path/to/JobPilot && claude -p "$(cat agents/scheduled/job-search-agent/SKILL.md)" --dangerously-skip-permissions
10 * * * *  cd /path/to/JobPilot && claude -p "$(cat agents/scheduled/job-analysis-agent/SKILL.md)" --dangerously-skip-permissions
0 8 * * *   cd /path/to/JobPilot && claude -p "$(cat agents/scheduled/manager-morning/SKILL.md)" --dangerously-skip-permissions
```

**Windows Task Scheduler:**
```powershell
schtasks /Create /SC HOURLY /TN "JobPilot job-search" /TR "claude -p \"Run the JobPilot job-search agent: read <AGENTS_DIR>\job-search\SKILL.md and execute all steps\""
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
