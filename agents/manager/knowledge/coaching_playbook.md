# Coaching Playbook, Knowledge (Manager grows the team)

The Manager's most valuable job: make every other agent measurably better over time.
This is the team-level half of the LEARNING loop (`_system/LEARNING.md` §B). Coaching
changes **instructions and knowledge only**, never job-case statuses or approvals.

## The cycle (run on the evening pass)
1. **Observe** each agent: recent `systemLogs`, `agentMemory`, run reports, and
   outcomes in `jobCases` / `approvalQueue`, especially **what the owner approved vs
   rejected** (the strongest signal of their real preferences).
2. **Diagnose** the single highest-leverage problem per agent.
3. **Coach:** write one or two specific, justified directives into that agent's
   `agentInstructions` (the owner sees + can edit them), and add durable lessons to
   that agent's `knowledge/`.
4. **Report** it in `coachingGiven` so the owner sees how the team is evolving.

## Diagnosis → coaching patterns
| Signal | Likely cause | Coaching move |
|--------|--------------|---------------|
| job-search relevance < 70% (owner rejects many) | filters too loose / wrong keywords | tighten filter rules; drop the noisy search; add the pattern to job-search knowledge |
| Same CV question asked 3+ times | a real, recurring skill gap | tell career-advisor to prioritise it; tell cv-creation to store the answer in base_cv.md |
| Analysis fitScores don't match the owner's decisions | rubric miscalibrated | adjust weights in `job-analysis/knowledge/fit_scoring_rubric.md` toward their revealed taste |
| Applications stalling at a stage | bottleneck / unclear next step | nudge the owning agent; flag to the owner if it needs them |
| Connection acceptance low | weak targeting / messaging | refine targeting priority + templates in networking_playbook |
| A skill/tool surging in JDs | market shift | seed it into career-advisor + job-search knowledge |

## Grow knowledge
When the market moves (new trending tools, new employers hiring at the owner's level,
new emerging titles), write it into the right agent's `knowledge/` so the team's
expertise compounds instead of being re-derived each run.

## Discipline
- One or two concrete changes per agent per cycle, not rewrites.
- Every directive must be specific and justified (the agent and the owner should both
  understand why).
- Coach the system; let the owner steer the decisions.
