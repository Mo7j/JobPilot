# Changelog

All notable changes to JobPilot are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project aims to follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-19

First public release: a self-hosted crew of Claude agents that runs your job search end to
end, with a React + Firebase dashboard where you stay the approver. Everything below ships
in 1.0.

### Dashboard
- **Notification history that sticks** — read notifications stay in the bell (greyed out)
  instead of vanishing the moment you open them; an unread dot and count track what's new.
- **Bell = phone push** — every notification is also delivered as a Firebase Cloud
  Messaging push to your phone, no separate wiring. The device token now refreshes on every
  app open, so push keeps working after you reopen the installed PWA.
- **Inline file preview** — open a job (or an approval) and preview the analysis report,
  tailored CV, cover letter, or application screenshot right inside the dashboard via Google
  Drive's viewer, with a graceful local-path fallback.
- Light/dark themes, installable PWA, kanban pipeline, ATS keyword checker, manual tracker.

### Agents
- **Agent → owner question channel** — when an agent is blocked or has an idea it posts a
  question on the Approvals page; you reply there and it reads your answer on its next run.
  Agents never wait for you in a chat you don't see.
- **Per-run summaries** — every agent posts a short "here's what I did this run" summary.
- **Local-first files** — all agents write their outputs to your local `JOBS_DIR` (synced
  to Google Drive) and hand files to each other by local path; no Drive API uploads. Drive
  is used read-only to fetch preview links for the dashboard.
- **Smarter, faster job search** — listings-first triage with a `seenJobs` memory, so each
  run skips already-evaluated postings, opens individual jobs only when needed, and covers
  more keyword × location combinations per run.
- Approval-gated by design: nothing irreversible (submitting, sending a note) happens
  without your tap. Honesty tiers prevent agents from claiming skills you don't have.

### Scheduling
- Pipeline agents moved from hourly to **every 5 hours**, split into two groups offset by
  ~2.5h (search + analysis, then CV + application) so they don't all burn one usage window.

### Setup & docs
- Setup guide step for syncing your Jobs folder to Google Drive (enables phone access and
  inline previews).
- "Update without losing your data" guide for existing installs.

### Project
- Continuous integration (build + secret audit) and a documented contribution flow.

[1.0.0]: https://github.com/Mo7j/JobPilot/releases/tag/v1.0.0
