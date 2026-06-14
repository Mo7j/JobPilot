# Agent reference

One section per agent: what it reads, what it writes, and where you come in.
The shared protocols every agent follows live in [`agents/_system/`](../agents/_system/):
heartbeat (live status), notifications (when it may ping you), instructions precedence
(your in-app orders override everything), and the learning loop.

> **You steer from the app.** Each agent's card on the Agents page has a pause toggle
> and a "custom instructions" box. Whatever you type there outranks the agent's
> SKILL.md on its next run, e.g. *"Only remote roles this month"* or *"Stop searching
> platform X"*.

---

## 🧭 Setup, `agents/setup/`
**Runs:** once, manually, in a Claude conversation.
**Reads:** the `_system` templates, its interview guide, your existing CV if you share it.
**Writes (all gitignored):** `_system/PROFILE.md`, `_system/CONFIG.md`,
`cv-creation/references/base_cv.md`, `cv-creation/references/cv_design.md` (your
unique design), `job-search/knowledge/market_playbook.md` (researched live for your
country), `application-writer/knowledge/screening_answers.md`. Seeds the 7 agent docs
in Firestore and writes a smoke-test notification.
**Your part:** the interview, especially the three-tier skills sort that keeps every
later document honest.

## 🔍 Job Search, `agents/job-search/`
**Runs:** hourly. **Needs:** Claude in Chrome for LinkedIn (degrades to fetch-only without).
**Reads:** `searchConfig` from its memory, your market playbook, your work-auth constraints.
**Writes:** new `jobCases` (status `found`), weekly `trends`, run logs.
**Guarantees:** dedupes by URL and company+title; pauses itself when 10+ approvals
are waiting; never contacts anyone.

## 📊 Job Analysis, `agents/job-analysis/`
**Runs:** hourly, max 3 cases. **Owns** Google Drive folder auto-setup.
**Reads:** `found` cases, the live JD, the web (company research), your profile tiers.
**Writes:** fit score 0–100 + recommendation, `analytics_report.pdf` (5 sections) to
your job folder + Drive, an `analysis` approval item.
**Your part:** approve → the case moves to CV stage; reject → closed, and your reason
recalibrates the scoring rubric over time.

## 📄 CV Creation, `agents/cv-creation/`
**Runs:** hourly, three passes (questions → drafts → revisions).
**Reads:** approved cases, your `base_cv.md` + unique `cv_design.md`, ATS keywords.
**Writes:** `cv_questions` items when honesty requires your input; `resume.docx` +
`resume.pdf` (1 page, verified with pdfinfo) to the job folder + Drive; a `cv`
approval item.
**Guarantees:** never invents experience; never adds skills you haven't confirmed;
revisions saved as v2/v3, approved files never overwritten.

## ✉️ Application Writer, `agents/application-writer/`
**Runs:** hourly, two queues, submit approved first, then fill new.
**Reads:** CV-approved cases, your screening answers, the live application form.
**Writes:** the filled form (browser), a screenshot, an `application` approval item;
after your approval, the actual submission, a tracker row, and interview notes.
**Guarantees:** never clicks Submit unapproved; unknown fields are flagged, never
guessed; no OS file picker / desktop control, shadow-DOM-safe uploads only.

## 🤝 Connection Builder, `agents/connection-builder/`
**Runs:** every 2 hours. **Needs:** Claude in Chrome.
**Reads:** active applications, your LinkedIn profile URL, the target-employer list.
**Writes:** blank connection requests (immediate, capped), `connection_note` approval
items for recruiter notes (≤200 chars, facts only), the real connection count.
**Guarantees:** hard caps (100/week, 25/day, 5 notes/month) with a back-off ladder;
notes never sent without your approval. ⚠ LinkedIn automation is ToS-gray; this
agent is conservative by design, and one toggle turns it off.

## 🎓 Career Advisor, `agents/career-advisor/`
**Runs:** daily 8 AM.
**Reads:** 30 days of trends, every analyzed JD's keywords, your skill tiers, what
cv-creation keeps having to ask you.
**Writes:** at most 1–3 `careerAdvice` items per day (skill gap / cert / project /
strategy), each with concrete action steps.
**Your part:** accept or dismiss in Insights → Advice; it recalibrates to your
revealed preferences and never repeats decided advice.

## 🧠 Manager, `agents/manager/`
**Runs:** 8 AM (health) and 8 PM (quality + coaching); monthly review on the 1st.
**Reads:** everything, agent heartbeats, logs, your approve/reject history.
**Writes:** morning/evening reports (Insights → Reports), coaching directives into
other agents' instruction docs (visible and editable by you), and it can pause
job-search when your approval queue backs up.
**Cannot:** change case statuses, decide approvals, or edit SKILL files.

---

## The pipeline at a glance

```
found ──► analyzing ──► needs_approval ──►(you)──► approved_for_cv
   ──► [cv questions? you answer] ──► cv_drafting ──► cv_review ──►(you)──► cv_approved
   ──► application_writing ──► application_review ──►(you)──► application_approved
   ──► submitting ──► applied
```

Statuses map to the board columns in `app/src/lib/pipeline.js`; the full field-level
contract is [`agents/_system/SCHEMA.md`](../agents/_system/SCHEMA.md).
