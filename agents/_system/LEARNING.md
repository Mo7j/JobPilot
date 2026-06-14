# Continuous-Learning Loop (shared)

The system is supposed to get smarter every day. Two mechanisms do that: each agent
**reflects and learns** at the end of its own run, and the **Manager coaches** the whole
team. The owner sees the results in the Insights → Reports tab and in each agent's
(editable) instructions.

---

## A. Every agent, "Reflect & Learn" (run this just before the heartbeat close)

After doing your real work, spend a moment on improvement:

1. **Reflect.** What worked this run? What was wasteful, wrong, or low-quality? What did
   the owner's decisions (approvals/rejections, instruction edits) tell you about their
   preferences?
2. **Record the signal.** Append a concise note to your `agentMemory`
   (`mcp__jobpilot__set_document("agentMemory", "<slug>", {...})`):
   what you observed and what you'll do differently. Keep memory tight, facts and
   directives, not diary entries.
3. **Promote durable patterns to knowledge.** When the same signal shows up **3+ times**
   (a filter that keeps mis-firing, a company that always fits, a skill that keeps appearing
   in JDs, a CV phrasing the owner keeps approving), write it into the relevant
   `knowledge/*.md` file so it becomes part of how you operate, not something you
   re-learn each run.
4. **Surface it.** Put the most useful learning into your run report's `recommendations`
   and, if it changes future behaviour, mention it in `lastAction`.

Self-improvement is part of the job, not optional. An agent that runs 100 times and is no
better than run 1 is broken.

---

## B. Manager, coaching protocol (grows every agent)

The Manager doesn't just monitor health; it actively makes the other agents better:

1. **Observe.** Read each agent's recent `systemLogs`, `agentMemory`, run reports, and the
   outcomes in `jobCases`/`approvalQueue` (what the owner approved vs rejected, what got
   stuck, what was low-relevance).
2. **Diagnose.** Identify the highest-leverage problem per agent. Examples: job-search
   surfacing >30% irrelevant roles → tighten filters; CV-creation asking the same question
   repeatedly → it's a real skill gap, tell career-advisor; analysis fit-scores not matching
   the owner's actual decisions → recalibrate the rubric.
3. **Coach.** Write a specific, justified directive into that agent's `agentInstructions`
   (visible/editable by the owner) and, where it's a durable lesson, add to that agent's
   `knowledge/`. One or two concrete changes per agent per cycle, not a rewrite.
4. **Grow knowledge.** When the market shifts (new tools trending, new employers hiring
   at the owner's level), seed that into the right agent's `knowledge/` so the team's
   expertise compounds.
5. **Report the coaching.** List what you changed and why in the Manager report's
   `coachingGiven` so the owner sees how the team is evolving and can veto/adjust.

Hard rule: coaching changes *instructions and knowledge*, never job-case statuses or
approvals, those stay with the owner.
