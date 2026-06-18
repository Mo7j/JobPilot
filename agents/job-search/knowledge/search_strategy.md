# Job Search Strategy

## The owner's target profile
Lives in `_system/PROFILE.md` (Targets + Work authorization) and
`agentMemory.searchConfig`, read those, never hardcode a profile here.
Market specifics (platforms, employers, filter realities) live in `market_playbook.md`.

## Rotation
Runs are ~5h apart, so each run covers MORE of the surface while staying fast (the
`seenJobs` memory makes overlap cheap). Use `combinationCursor` to round-robin:
- Rotate role keywords: cycle through `targetRoles` (+ level variants) so each run covers
  6–8 combos, least-recently-covered first; the full set repeats within a day.
- Combine related titles in one query with OR (`knowledge/boolean_library.md`) instead of
  separate searches, fewer page loads, wider net per request.
- Rotate locations: broad country-level one run, specific cities the next.
- Once a day, do one broad X-ray sweep of the playbook's target-employer career pages.

## Work listings-first (speed)
Triage from the results list before opening anything: drop URLs already in `seenJobs` /
jobCases, then skip clear no-gos from the snippet (seniority, excluded role/company,
work-auth). Open an individual posting ONLY when the listing is too thin to decide or it's
going to become a jobCase. Record every URL you evaluate (created or skipped) in `seenJobs`
so future runs skip it instantly, this is what keeps each run quick.

## Freshness
- Normal runs: ~12h window (`f_TPR=r43200`) overlaps the 5h cadence with margin; `seenJobs`
  dedupes the overlap. Use 24h (`r86400`) for slow/low-volume markets.
- After downtime (vacation, paused agent): one catch-up run with a 7-day window,
  then back to normal.

## Quality bar
A good run finds 0–5 *relevant* cases, not 20 mediocre ones. Every case you create
costs the owner review time and a job-analysis slot. When in doubt between "borderline
accept" and "skip": accept ONLY if the title is a direct target-role variant; skip if
the match relies on a generous reading of the JD.

## Platform notes (general)
- **LinkedIn:** near-universal; best signal-to-noise with a 12–24h window + manual
  experience filtering. "Easy Apply" roles are faster for application-writer.
- **Company career pages:** target employers from the playbook post here first, 
  the X-ray sweep catches roles before they hit the boards.
- **Regional boards:** see `market_playbook.md` for which matter in the owner's market.

<!-- Durable observations promoted by the LEARNING loop get appended below. -->
