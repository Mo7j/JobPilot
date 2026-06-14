# Job Search Strategy

## The owner's target profile
Lives in `_system/PROFILE.md` (Targets + Work authorization) and
`agentMemory.searchConfig`, read those, never hardcode a profile here.
Market specifics (platforms, employers, filter realities) live in `market_playbook.md`.

## Rotation
Don't run every search every hour, rotate so the whole target surface gets covered
across a day while each run stays fast:
- Rotate role keywords: cycle through `targetRoles` (+ level variants) so each run
  covers 3–4 combos and the full set repeats every few hours.
- Rotate locations: broad country-level one run, specific cities the next.
- Once a day, do one broad X-ray sweep of the playbook's target-employer career pages.

## Freshness
- Hourly runs: 24h window (`f_TPR=r86400`).
- After downtime (vacation, paused agent): one catch-up run with a 7-day window,
  then back to 24h.

## Quality bar
A good run finds 0–5 *relevant* cases, not 20 mediocre ones. Every case you create
costs the owner review time and a job-analysis slot. When in doubt between "borderline
accept" and "skip": accept ONLY if the title is a direct target-role variant; skip if
the match relies on a generous reading of the JD.

## Platform notes (general)
- **LinkedIn:** near-universal; best signal-to-noise with 24h window + manual
  experience filtering. "Easy Apply" roles are faster for application-writer.
- **Company career pages:** target employers from the playbook post here first, 
  the X-ray sweep catches roles before they hit the boards.
- **Regional boards:** see `market_playbook.md` for which matter in the owner's market.

<!-- Durable observations promoted by the LEARNING loop get appended below. -->
