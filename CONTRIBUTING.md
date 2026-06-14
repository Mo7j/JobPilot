# Contributing

Thanks for considering it! JobPilot is small on purpose. Please keep it that way.

## Ground rules

1. **`npm run audit:secrets` must pass.** Never commit `.env` values, service-account
   keys, or anyone's personal data. The `references/` pattern (private material kept
   untracked) is how the original was built; use the same discipline.
2. **Demo mode must keep working with zero config.** `npm run dev:app` on a fresh
   clone is the first thing every visitor tries.
3. **The schema is a three-way contract.** A field rename touches
   `agents/_system/SCHEMA.md`, the agent SKILL files, `app/src/lib/pipeline.js`, and
   `app/src/data/demo/`. PRs that change one without the others will be bounced.
4. **Agents stay approval-gated.** PRs that let an agent submit/send/contact without
   an approved queue item won't be merged, however convenient.

## Dev quickstart

```bash
npm install
npm run dev:app        # dashboard in demo mode
npm run dev:landing    # marketing site
npm run build          # both
npm run audit:secrets  # the gate
```

UI verification scripts (need Python + Playwright):
`python scripts/verify-app.py` and `python scripts/verify-landing.py` against the dev
servers.

## Good first contributions

- More regional job-platform notes for `market_playbook_guide.md`
- New CV design axes (fonts/palettes/layouts) in `cv_design_axes.md`
- App polish: accessibility, empty states, mobile
- Translations of the setup guide

## Style

- App code: follow what's there (React function components, Tailwind utility-first,
  the `data/` seam for ALL data access).
- Agent files: imperative, specific, no fluff; they're operating manuals, not essays.
