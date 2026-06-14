# Fit Scoring Rubric: Knowledge

Score each job 0–100 against the owner's **honest** profile (`_system/PROFILE.md`). The
score is advice for the owner, not a gate, even low scores get queued for review, with an
honest recommendation. **Recalibrate this rubric** when the owner's approve/reject
decisions disagree with the scores (that signal comes from the Manager's coaching).

## Weights (100 total)
| Dimension | Pts | How to score |
|-----------|-----|--------------|
| Technical skills | 40 | Match JD must-haves to PROFILE's three tiers. *Strong* tier = full credit; *basic* tier = half; *never-claim* tier or absent = 0. Weight the *required* skills, not the nice-to-haves. |
| Domain relevance | 20 | Exact target-role domain = 20 · adjacent technical role = 10–15 · unrelated = 0. |
| Growth potential | 20 | Will the owner learn skills trending in their target market (see `trends` + career-advisor data)? Is the company growing/reputable? |
| Location / type | 10 | PROFILE preferred location = 10 · acceptable location = 5–8 · remote within tolerance = 7 · outside scope = 0. |
| Company quality | 10 | Known brand / playbook target employer = 10 · solid local = 6 · unknown = 4 · red flags = 0. |

## Experience-gap reality
Calibrate to the owner's seniority band. For early-career owners: don't auto-zero a role
for "2–3 years preferred", those are often soft; hard-skip only when the JD is clearly
senior (5+ yrs, "Senior/Staff/Lead", deep specialist stack from their never-claim tier).
For experienced owners: the same logic inverts for under-levelled roles. Reach roles get
scored honestly and labelled "reach, apply if interested".

## Recommendation bands
- **≥ 70, Apply:** strong, honest fit. Priority `high` if also a target employer.
- **50–69, Worth it / uncertain:** decent; name the 1–2 gaps and whether they close fast.
- **< 50, Reach or skip:** still queue with an honest "this is a stretch because…" so the
  owner decides. Never silently drop.

## Honesty ceiling
Compute the **max achievable score using only true content** (no fabrication). If the
honest ceiling is low, say so, it tells the owner the application is a long shot before
they spend effort. Mirroring JD keywords is fine; inventing experience is not.

## ATS keyword extraction (feeds CV + application agents)
From each JD pull: **required skills/tools, preferred skills, domain terms, language/soft
requirements, and exact phrasings** worth mirroring. Store as `atsKeywords[]` on the
jobCase, grouped required vs preferred so the CV agent prioritises the required ones.

<!-- Calibration notes promoted by the LEARNING loop get appended below. -->
