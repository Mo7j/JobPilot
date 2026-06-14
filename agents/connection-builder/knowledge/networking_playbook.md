# LinkedIn Networking Playbook: Knowledge

Grow the owner's network strategically and safely. Two tracks: (1) **job-specific**
outreach for active applications, (2) **general fill** toward target companies/people.
Target 10–15 connections per run, deliberately low-volume and human-paced.

---

## LinkedIn Limits

### Connection requests
- **~100 requests / week** baseline; resets 7 days after the first request of the cycle
- **~20–25 / day** practical safe pace
- Withdraw stale pending invites periodically, a high pending count reduces the weekly cap

### Connection notes (sent WITH the request)
- **Free account: 5 notes per month, 200 characters each.** Track in
  `agentMemory.monthlyNotesSent`; at 5, fall back to blank requests.
- Premium gives more notes at 300 chars, confirm the owner's account type once and
  record it here.

### Weekly-limit back-off ladder
| weeklyConnectionsSent | Action |
|---|---|
| 0–70 | Normal, 10–15/run |
| 71–85 | Slow to ~6/run, log it |
| 86–95 | ~3/run + low-priority notification |
| 96–99 | Send 0 this run, notify |
| 100+ | Pause immediately, notify urgently |

---

## Job-Specific Targeting (Step 2)

### Who to pick (max 2 per company, in order)
1. Recruiter named explicitly in the job posting, highest value
2. Anyone with "Recruiter", "Talent Acquisition", "Talent", "HR" in their title there
3. Someone in the **same function** as the applied role, same level or one above
   (e.g. applying for a frontend role → target frontend/web engineers, not the CTO)

### Who to skip
- Already 1st connection or Pending
- C-suite, VP, Director, Head-of (unless the company has < 20 employees)
- Unrelated departments (unless that IS the applied role)
- Inactive profiles (no visible activity in 6+ months)

### Note rules (recruiter/HR contact only)
- Facts from the JD and company page only, no invented enthusiasm, no assumptions
- Never reference interest/excitement or why a job was or wasn't pursued
- Structure: who the owner is (one phrase from PROFILE.md) + role applied for +
  1 factual JD detail + CV link
- Always verify ≤ 200 chars before queuing

### Note template
```
Hi [Name], [owner one-phrase identity] applying for [Role] at [Company].
[1 factual JD detail, e.g. "saw the team uses React and GraphQL"]. CV: [Drive link]. [First name]
```

### Blank request, peer contact
The second person (peer/team member) always gets a blank request, no note, nothing
queued. Just connect.

---

## General Networking Fill (Step 3)

### Target companies
The target-employer list lives in `job-search/knowledge/market_playbook.md` (generated
for the owner's market). Use that list, don't maintain a second one here.

### Target people (in order)
1. Recruiters / Talent Acquisition at target companies
2. People in the owner's target roles at target companies
3. Alumni of the owner's school (from PROFILE.md) in relevant roles

### Rules
Blank requests only · no follow-ups queued · same skip criteria as job-specific.

---

## Etiquette
- No pitching, no asks in notes, intro + role + one fact + CV only.
- Never send the same note to multiple people (no mass blasts).
- Record what works in `memory/connection_log.md`; promote durable patterns here (3× rule).
