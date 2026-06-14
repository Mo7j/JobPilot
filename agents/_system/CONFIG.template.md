# Machine Config (shared)

<!--
  THIS IS A TEMPLATE. The setup agent confirms these values with you and writes
  the real file to `_system/CONFIG.md` (gitignored). Every agent reads CONFIG.md
  first, it is the only place machine-specific paths and IDs live.
-->

## Paths
- **AGENTS_DIR:** `[absolute path to this agents/ folder, e.g. C:\Users\you\JobPilot\agents or /home/you/JobPilot/agents]`
- **JOBS_DIR:** `[absolute path where per-job output folders are created, e.g. C:\Users\you\Desktop\Jobs]`
  - Each job gets `JOBS_DIR/[Company] - [Title]/` containing the CV, cover letter,
    analytics report, and interview notes.

## Firebase
- **Project ID:** `[your-firebase-project-id]`
- **MCP server name:** `jobpilot` → tools are `mcp__jobpilot__*`
  (if you registered the MCP server under a different name, write it here and
  read every `mcp__jobpilot__*` call in the SKILL files with that prefix instead)

## Owner preferences
- **Timezone:** `[IANA timezone, e.g. Europe/Berlin]`
- **Quiet hours:** `[e.g. 22:00–08:00, only urgent notifications outside these]`
- **Manager run slots:** `[default 08:00 and 20:00 local]`

## Connectors available
<!-- The setup agent checks which of these are actually connected and records it,
     so agents degrade gracefully instead of erroring. -->
- Browser automation (Claude in Chrome): `[yes/no]`, needed for LinkedIn search,
  form filling, connection building
- Google Drive: `[yes/no]`, needed for file delivery to phone
- Gmail: `[yes/no]`, optional, used for follow-up awareness
- Push notifications (FCM): `[yes/no]`, optional, set up in app Settings
