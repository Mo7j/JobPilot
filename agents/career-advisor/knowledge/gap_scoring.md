# Skill-Gap Scoring: Knowledge

How to turn raw JD data into a ranked, high-ROI learning recommendation. Run from the
trends + jobCase `atsKeywords[]` + the owner's profile. Don't recommend everything, 
surface the **top 1–2** moves with the best payoff.

## Inputs
- **Demand:** how often the skill appears across recent JDs / `trends.skillFrequency`
  (last 30 days).
- **Gap size:** does the owner have it? none / basic / strong (PROFILE.md tiers).
- **Time-to-learn:** rough weeks to job-ready competence FOR THIS OWNER, adjacency to
  their strong tier makes a skill fast; foreign foundations make it slow.
- **Impact:** how much it unlocks the roles they actually target.

## Score
`priority = demand × gapSize × impact ÷ timeToLearn`
- demand: high JD frequency = high.
- gapSize: missing = 1.0, basic = 0.5, strong = 0 (skip).
- impact: a gatekeeper skill for target roles = high.
- timeToLearn: penalise long slogs unless impact is huge.

This naturally floats the skills that are (a) everywhere in the owner's target JDs,
(b) missing, and (c) learnable in weeks, over prestige skills with slow payoff.

## Turn a gap into action
For the top gaps, output a `careerAdvice` item: skill, *why now* (cite the real JD
trend that triggered it), effort, impact, and 2–3 concrete steps (a specific course
per `cert_roi.md`, a project per `skill_roadmaps.md`). **Always pair learning with a
project**, projects are what convert to CV evidence.

## Feedback loop
Track which advice the owner accepts vs dismisses (LEARNING loop) and recalibrate, 
if they keep dismissing certs in favour of projects, lean into projects. Never repeat
an insight they already actioned or rejected.
