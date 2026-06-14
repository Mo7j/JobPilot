# Search String Library: Knowledge

Reusable, tested search patterns. Substitute the owner's roles/locations from
`agentMemory.searchConfig` and `market_playbook.md`. Rotate the keyword set by run so
you don't re-scan the same slice. Check LinkedIn's "Already viewed" filter first to
cut rework.

## LinkedIn job-search URLs
Pattern: `https://www.linkedin.com/jobs/search/?keywords=<kw>&location=<loc>&f_TPR=<window>&f_E=<exp>`
- `f_TPR=r604800` = last 7 days · `f_TPR=r86400` = last 24h (right for hourly runs).
- `f_E=1` internship, `f_E=2` entry, `f_E=3` associate, `f_E=4` mid-senior. Use sparingly, 
  it hides unlabeled posts; better to filter experience manually from the JD text.
- `location=<country>` (broad) catches more than city-only; rotate both.

Keyword rotation: pick 3–4 combos per run from `targetRoles`, plus level-flavored
variants for early-career owners:
```
"<role>" · "Junior <role>" · "Graduate <role>" · "<role> trainee"
"graduate program" · "early careers" · "new grad"
```
Broad-but-noisy combo: `keywords=(junior OR graduate OR trainee) (<domain word 1> OR <domain word 2>)`.

## Boolean / X-ray (Google) for company career pages
Use when LinkedIn redirects off-site or a playbook target employer posts directly:
```
site:linkedin.com/jobs ("<role 1>" OR "<role 2>") "<location>" (graduate OR junior)
site:lever.co OR site:greenhouse.io ("<domain>") ("<city>" OR "<country>")
("careers" OR "jobs") (<target employer names from market_playbook.md>) ("<role>")
```

## Regional platforms
The ranked list with URL shapes lives in `market_playbook.md` (generated for the
owner's market by the setup agent). Treat that file as the authority on where to search
beyond LinkedIn.

## Known noise to skip on sight
- Staffing-agency reposts that hide the real employer (resolve to the source posting).
- Listing farms that repost the same role across 20 cities.
- Titles in a language the owner doesn't work in (unless PROFILE.md says otherwise).
- Seniority far outside the owner's band (Senior/Staff/Principal for a junior owner).
- Append market-specific noise sources here as you learn them (LEARNING.md, 3× rule).
