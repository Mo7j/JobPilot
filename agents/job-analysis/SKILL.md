# Job Analysis Agent
**Agent ID:** job-analysis
**Schedule:** Every 5 hours (Group A, with job-search)
**Purpose:** Analyze jobs in "found" status, score fit, research companies, write the analytics report, push to approvalQueue.
**Max cases per run:** 3

---

## Read first
- `_system/CONFIG.md`, paths (JOBS_DIR), MCP prefix, connector availability.
- `_system/PROFILE.md`, the owner's skills (three honesty tiers), experience, targets.
- `_system/INSTRUCTIONS.md`, the owner's UI instructions OVERRIDE the rules below.
- `_system/HEARTBEAT.md`, `_system/NOTIFICATIONS.md`, `_system/REQUESTS.md`, `_system/LEARNING.md`, `_system/SCHEMA.md`, `_system/FILES.md` (local-first files).
- `knowledge/fit_scoring_rubric.md`, `knowledge/company_research_playbook.md`, `knowledge/red_flags.md`.
- **Files are local-first** (`_system/FILES.md`): the report is saved to the local job
  folder and reaches the owner's phone via their Drive-synced `JOBS_DIR`, no API upload.
  Record `folderPath` + `filePaths.analysis_report` so downstream agents and the dashboard
  find it.

**Doc ID = the slug `job-analysis`** for `agents`, `agentInstructions`, `agentMemory`.
For `jobCases`: use the `id` field.

---

## Step 0: Standard Startup

**0.1 Check enabled, then START the heartbeat** (`_system/HEARTBEAT.md`).

**0.2 Read instructions** (`agentInstructions/job-analysis`, they OVERRIDE this SKILL).

**0.3 Read memory** (`agentMemory/job-analysis`, company notes, role patterns).

**0.4 Query target cases**
```
mcp__jobpilot__list_collection("jobCases")
→ Filter: status == "found"
→ Sort by foundAt ascending (oldest first, FIFO)
→ Take first 3 cases max
```
If 0 cases: skip to Step 9/10 with lastAction "No jobs to analyze."

---

## Step 1: Set Status to Analyzing

For each selected case:
```
mcp__jobpilot__update_document("jobCases", "[jobCase.id]", {
  "status": "analyzing", "lastUpdatedAt": "[ISO 8601]"
})
```

---

## Step 2: Full Analysis (repeat for each case)

### 2.1: Fetch the Full JD
Navigate to `jobCase.jobUrl` (web fetch, or browser if available). Extract: full JD text,
required skills, preferred skills, seniority signals, application process (Easy Apply /
form / email / link), and red flags per `knowledge/red_flags.md`.

### 2.2: Company Research
Web search: `"[Company name]" [owner's market/city] careers OR about`.
Gather: what they do (1–2 sentences), size & stage, industry, tech stack (JD + site +
LinkedIn), culture signals (reviews, About page, news), recent news, funding, launches,
layoffs (last 12 months). Process details: `knowledge/company_research_playbook.md`.

### 2.3: Fit Scoring (0–100)

Score the OWNER (from `_system/PROFILE.md` + `cv-creation/references/base_cv.md`)
against the role. Be honest, the score is only useful if it predicts the owner's real
chances. Full rubric in `knowledge/fit_scoring_rubric.md`; the frame:

- **Technical skills match (40 pts)**, required skill in the owner's *strong* tier and
  used concretely → full credit; *basic* tier → half credit; in the *never-claim* tier
  or absent → 0. Never score a skill the owner doesn't actually have.
- **Domain relevance (20 pts)**, exact target-role domain → 20; adjacent → 10–15;
  unrelated → 0.
- **Growth potential (20 pts)**, will the owner learn valuable skills (10) + is the
  company growing / a good CV brand (10).
- **Location/type fit (10 pts)**, score against PROFILE.md target locations and
  remote tolerance (preferred location → 10, acceptable → 5–8, outside scope → 0).
- **Company quality (10 pts)**, known brand or playbook target employer → 10; unknown
  but solid posting → 5; red flags → 0.

**Thresholds:** ≥ 70 → "apply" · 50–69 → "uncertain" · < 50 → "skip"
(still queue it, the owner decides).

### 2.4: ATS Keyword Extraction
- **Required keywords**: exact phrases from the Requirements section
- **Preferred keywords**: from Preferred / Nice-to-have
- **Domain keywords**: industry terms that show awareness

---

## Step 3: Write analytics_report.pdf

For each analyzed job, write **one combined PDF** (`analytics_report.pdf`) into
`<JOBS_DIR>/[Company] - [Title]/` (JOBS_DIR from CONFIG.md). Five sections, each on a
new page: Job Info, Fit Score, Company Research, Fit Analysis, ATS Keywords.

### ⚠️ CRITICAL, READ BEFORE WRITING THE SCRIPT
1. **ALL `[placeholder]` values MUST be replaced with real research content.** If a field
   has no data, write `"Not available"`, never leave a `[bracket]` in the output.
2. **Research FIRST, then write the script.** The script is just the formatter.
3. **NEVER pass raw strings as Table cell values**, wrap every cell in `Paragraph(text, style)`.
4. **NEVER reuse a ParagraphStyle name** within one script.
5. **`score_banner()` takes an integer** for `score`.

### Script template

```bash
pip install reportlab --break-system-packages -q
python3 << 'PYEOF'
import os
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                  Table, TableStyle, HRFlowable, PageBreak)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm

# ── Destination (JOBS_DIR from _system/CONFIG.md) ─────────────────────────────
DEST = "<JOBS_DIR>/[Company] - [Title]/"
os.makedirs(DEST, exist_ok=True)

# ── Palette ────────────────────────────────────────────────────────────────────
C_DARK   = colors.HexColor("#1A1A2E")
C_ACCENT = colors.HexColor("#2563EB")
C_LIGHT  = colors.HexColor("#F5F7FA")
C_GRAY   = colors.HexColor("#9CA3AF")
C_MID    = colors.HexColor("#E5E7EB")
C_GREEN  = colors.HexColor("#16A34A")
C_RED    = colors.HexColor("#DC2626")
C_AMBER  = colors.HexColor("#D97706")

# ── Base styles ────────────────────────────────────────────────────────────────
base = getSampleStyleSheet()

H1    = ParagraphStyle('H1',   parent=base['Normal'], fontSize=15, fontName='Helvetica-Bold', textColor=C_DARK,   spaceAfter=3,  leading=20)
H2    = ParagraphStyle('H2',   parent=base['Normal'], fontSize=11, fontName='Helvetica-Bold', textColor=C_ACCENT, spaceAfter=3,  spaceBefore=8,  leading=15)
H3    = ParagraphStyle('H3',   parent=base['Normal'], fontSize=9,  fontName='Helvetica-Bold', textColor=C_DARK,   spaceAfter=2,  spaceBefore=4,  leading=13)
BODY  = ParagraphStyle('BODY', parent=base['Normal'], fontSize=9,  fontName='Helvetica',      textColor=colors.black, leading=14)
SMALL = ParagraphStyle('SMALL',parent=base['Normal'], fontSize=8,  fontName='Helvetica',      textColor=C_GRAY,   leading=12)
LABEL = ParagraphStyle('LABEL',parent=base['Normal'], fontSize=9,  fontName='Helvetica-Bold', textColor=C_DARK,   leading=13)
VALUE = ParagraphStyle('VALUE',parent=base['Normal'], fontSize=9,  fontName='Helvetica',      textColor=colors.black, leading=13)

def hr():    return HRFlowable(width="100%", thickness=0.5, color=C_MID, spaceAfter=5, spaceBefore=3)
def sp(h=6): return Spacer(1, h)

def doc(path): return SimpleDocTemplate(
    path, pagesize=A4,
    leftMargin=20*mm, rightMargin=20*mm, topMargin=16*mm, bottomMargin=16*mm)

def tbl(rows, col_widths_mm, has_header=True):
    """White/gray alternating rows. col widths in mm, sum <= 160.
    All cells auto-wrapped in Paragraph."""
    data = []
    for i, row in enumerate(rows):
        sty = LABEL if (i == 0 and has_header) else VALUE
        data.append([Paragraph(str(c), sty) for c in row])
    t = Table(data, colWidths=[w * mm for w in col_widths_mm])
    ts = [
        ('VALIGN',       (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING',   (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 4),
        ('LEFTPADDING',  (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW',    (0, 0), (-1, -1), 0.3, C_MID),
    ]
    if has_header:
        ts += [
            ('BACKGROUND',    (0, 0), (-1,  0), C_LIGHT),
            ('LINEBELOW',     (0, 0), (-1,  0), 0.8, C_GRAY),
            ('ROWBACKGROUNDS',(0, 1), (-1, -1), [colors.white, C_LIGHT]),
        ]
    else:
        ts.append(('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, C_LIGHT]))
    t.setStyle(TableStyle(ts))
    return t

def score_banner(score, rec):
    """Score + recommendation box. score must be an int."""
    rec_color = {'apply': C_GREEN, 'uncertain': C_AMBER, 'skip': C_RED}.get(rec.lower(), C_GRAY)
    sty_score = ParagraphStyle('_SCN', parent=base['Normal'],
        fontSize=20, fontName='Helvetica-Bold', textColor=C_ACCENT, alignment=1, leading=26)
    sty_rec   = ParagraphStyle('_RCN', parent=base['Normal'],
        fontSize=12, fontName='Helvetica-Bold', textColor=rec_color, alignment=1, leading=18)
    data = [[Paragraph(f"{score}/100", sty_score), Paragraph(rec.upper(), sty_rec)]]
    t = Table(data, colWidths=[75 * mm, 85 * mm])
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0, 0), (-1, -1), C_LIGHT),
        ('BOX',          (0, 0), (-1, -1), 0.8, C_GRAY),
        ('INNERGRID',    (0, 0), (-1, -1), 0.3, C_MID),
        ('VALIGN',       (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN',        (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING',   (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING',(0, 0), (-1, -1), 10),
    ]))
    return t

# ══════════════════════════════════════════════════════════════════════════════
# BUILD COMBINED analytics_report.pdf
# ══════════════════════════════════════════════════════════════════════════════
story = []

# ── SECTION 1: JOB INFO ────────────────────────────────────────────────────────
story += [Paragraph("[Company], [Title]", H1), hr()]
story.append(Paragraph("Section 1 of 5  ·  Job Information", SMALL))
story.append(sp(6))
story.append(tbl([
    ["Field",     "Value"],
    ["Company",   "[Company]"],
    ["Title",     "[Title]"],
    ["Location",  "[City] ([Remote/Onsite/Hybrid])"],
    ["Platform",  "[source platform]"],
    ["Found",     "[YYYY-MM-DD]"],
    ["URL",       "[jobUrl, actual URL]"],
    ["Status",    "Analyzed"],
], [38, 122], has_header=True))
story += [sp(4), Paragraph("JD Summary", H2)]
story.append(Paragraph("[2-3 sentences, REAL summary of the role from the actual JD]", BODY))
story += [sp(4), Paragraph("Application Process", H2)]
story.append(Paragraph("[REAL process: Easy Apply / Form at URL / Email / Direct link]", BODY))
story += [sp(4), Paragraph("Requirements", H2)]
for req in [
    "[REAL requirement 1 from JD]",
    "[REAL requirement 2, add all of them]",
]:
    story.append(Paragraph(f"• {req}", BODY))
story += [sp(4), Paragraph("Preferred Skills", H2)]
for pref in [
    "[REAL preferred skill 1, add all]",
]:
    story.append(Paragraph(f"• {pref}", BODY))
story += [sp(4), Paragraph("Red Flags", H2)]
story.append(Paragraph("[None, or list real concerns found in the JD]", BODY))

# ── SECTION 2: FIT SCORE ───────────────────────────────────────────────────────
story.append(PageBreak())
story += [Paragraph("Fit Score & Analysis", H1), hr()]
story.append(Paragraph("Section 2 of 5  ·  [Company] | [Title]  ·  [YYYY-MM-DD]", SMALL))
story.append(sp(8))
story.append(score_banner(72, "apply"))   # ← replace with the actual int score + rec string
story += [sp(10), Paragraph("Score Breakdown", H2)]
story.append(tbl([
    ["Category",          "Score", "Max", "Notes"],
    ["Technical Skills",  "[X]",   "40",  "[REAL: which skills matched / were missing]"],
    ["Domain Relevance",  "[X]",   "20",  "[REAL: why this domain score]"],
    ["Growth Potential",  "[X]",   "20",  "[REAL: learning opportunity + company signal]"],
    ["Location / Type",   "[X]",   "10",  "[REAL: city + work type vs owner targets]"],
    ["Company Quality",   "[X]",   "10",  "[REAL: brand/funding signal]"],
], [50, 14, 12, 84], has_header=True))
story += [sp(8), Paragraph("Skill Match", H2)]
story.append(tbl([
    ["Category",               "Skills"],
    ["Present (full credit)",  "[REAL: owner skills matching JD requirements]"],
    ["Present (partial)",      "[REAL: partial matches]"],
    ["Missing (required)",     "[REAL: required skills the owner lacks, or 'None']"],
    ["Missing (preferred)",    "[REAL: preferred skills the owner lacks, or 'None']"],
], [55, 105], has_header=True))
story += [sp(8), Paragraph("Recommendation", H2)]
story.append(Paragraph("[REAL 2-3 sentences: the core apply/skip reasoning]", BODY))

# ── SECTION 3: COMPANY RESEARCH ───────────────────────────────────────────────
story.append(PageBreak())
story += [Paragraph("Company Research", H1), hr()]
story.append(Paragraph("Section 3 of 5  ·  [Company]", SMALL))
story.append(sp(6))
story.append(tbl([
    ["Topic",            "Detail"],
    ["What They Do",     "[REAL: 1-2 sentences from website / LinkedIn About]"],
    ["Size & Stage",     "[REAL: headcount, funding stage, revenue if known]"],
    ["Industry",         "[REAL: industry and sub-sector]"],
    ["Tech Stack",       "[REAL: from JD + company site]"],
    ["Culture Signals",  "[REAL: review-site notes, news, or 'No data found']"],
    ["Recent News",      "[REAL: last 12 months, or 'No major news found']"],
    ["Why Apply",        "[REAL: 3 reasons specific to the owner, or 'N/A, skip recommended']"],
], [42, 118], has_header=True))

# ── SECTION 4: FIT ANALYSIS ───────────────────────────────────────────────────
story.append(PageBreak())
story += [Paragraph("Fit Analysis", H1), hr()]
story.append(Paragraph("Section 4 of 5  ·  [Company] | [Title]", SMALL))
story += [sp(6), Paragraph("Owner Strengths for This Role", H2)]
for s in [
    "[REAL strength, specific to this JD]",
    "[REAL strength 2, add all honest advantages]",
]:
    story.append(Paragraph(f"• {s}", BODY))
story += [sp(6), Paragraph("Gaps to Address", H2)]
story.append(tbl([
    ["Gap (missing skill)",      "Effort to close",  "Blocker?"],
    ["[REAL missing skill 1]",   "[e.g. 1-2 weeks]", "No"],
], [80, 50, 30], has_header=True))
story += [sp(8), Paragraph("Honest Assessment", H2)]
story.append(Paragraph("[Reach / Fit / Safety], [REAL 2-3 sentences on where the owner stands]", BODY))
story += [sp(6), Paragraph("Talking Points if Interviewed", H2)]
for pt in [
    "[REAL talking point tied to a specific JD requirement]",
]:
    story.append(Paragraph(f"• {pt}", BODY))

# ── SECTION 5: ATS KEYWORDS ───────────────────────────────────────────────────
story.append(PageBreak())
story += [Paragraph("ATS Keywords", H1), hr()]
story.append(Paragraph("Section 5 of 5  ·  [Company] | [Title]", SMALL))
story.append(sp(6))
story.append(tbl([
    ["Category",                       "Keywords"],
    ["Required, Must Include in CV",  "[REAL: exact phrases from Requirements]"],
    ["Preferred, Include if Honest",  "[REAL: from Preferred / Nice-to-have]"],
    ["Domain, Use in Cover Letter",   "[REAL: industry terms]"],
    ["Priority Order",                 "[REAL ranked list]"],
], [58, 102], has_header=True))

doc(DEST + "analytics_report.pdf").build(story)
print("✓ analytics_report.pdf written to", DEST)
PYEOF
```

---

## Step 4: Record the local report (+ best-effort Drive preview) — see `_system/FILES.md`

JobPilot is **local-first** (read `_system/FILES.md`). The report is saved to the local
job folder in Step 3 and reaches the owner's phone through their Drive-synced `JOBS_DIR`
(SETUP § 9a), there is **no Drive API upload**.

**4.1 Record the file on the jobCase.** Confirm `analytics_report.pdf` exists in
`<JOBS_DIR>/[Company] - [Title]/`, then set:
```
mcp__jobpilot__update_document("jobCases", "[jobCase.id]", {
  "folderPath": "[Company] - [Title]",
  "filePaths": { "analysis_report": "<JOBS_DIR>/[Company] - [Title]/analytics_report.pdf" }
})
```
(Merge `filePaths`; don't clobber keys other agents wrote.)

**4.2 Drive preview link (for the dashboard).** With the Google Drive connector, do a
**read-only search** for `analytics_report.pdf` in the synced `Jobs/[Company] - [Title]`
folder and store its `webViewLink` → `jobCase.driveFileUrls.analysis_report`. Quick metadata
lookup, NOT an upload, it lets the owner preview the PDF inline in the app. If Drive isn't
connected (or the file isn't visible yet mid-sync), skip it, the app falls back to the local
path. Never block or error on this.

---

## Step 5: Push to approvalQueue

The `summary` field is what the owner reads in the approval UI, make it complete enough
to decide without opening the PDF.

```
mcp__jobpilot__add_document("approvalQueue", {
  "jobCaseId": "[jobCase.id]", "agentId": "job-analysis",
  "type": "analysis", "status": "pending",
  "title": "[Title], [Company]",
  "summary": "[EMOJI] [APPLY/UNCERTAIN/SKIP], [score]/100\n\n[1-2 sentences: what the company does and why this role is or isn't a fit.]\n\nKey matches: [top 3 matching skills].\nMain gap: [top missing skill or concern].\n\nRecommendation: [2-3 direct sentences, exactly what to do and why, plus framing tips for the CV/cover letter if applying.]",
  "attachedFilePath": "<JOBS_DIR>/[Company] - [Title]/analytics_report.pdf",
  "driveFileUrl": "[driveFileUrls.analysis_report if you got one in 4.2, else null]",
  "createdAt": "[ISO 8601]"
})
```

**Emoji guide:** ✅ apply · ⚠️ uncertain · ⏭️ skip

Example summary (fictional):
```
✅ APPLY, 78/100

Meridian Analytics is a 200-person data-tooling firm hiring an explicitly junior
analyst in the owner's preferred city.

Key matches: Python, SQL, data analysis.
Main gap: domain experience, learnable on the job.

Recommendation: Strong apply. Known brand + junior-friendly role. Focus the cover
letter on data skills, not industry experience.
```

After adding, increment the agent doc's `pendingApprovals` by the number queued this run.

---

## Step 6: Update jobCase

⚠️ Use EXACTLY these field names, the app reads them by name.

```
mcp__jobpilot__update_document("jobCases", "[jobCase.id]", {
  "status": "needs_approval",
  "fitScore": [integer],
  "analysisRecommendation": "[apply|uncertain|skip]",
  "analysisReport": "[3-4 sentences shown on the pipeline card: score, recommendation, key matches, key gap, why]",
  "companyResearch": "[1-2 sentences: what the company does + size/stage]",
  "atsKeywords": ["[keyword1]", ...],
  "analysisCompletedAt": "[ISO 8601]",
  "approvalFor": "analysis", "approvalStatus": "pending",
  "lastUpdatedAt": "[ISO 8601]",
  "agentLog": [ ...existing entries (read first, append, never overwrite),
    {"timestamp": "[ISO8601]", "agentId": "job-analysis",
     "message": "Analysis complete. Score [N]/100, recommend [rec]. Pushed to approvalQueue."} ]
})
```

## Step 7: Notify (per job analyzed, see `_system/NOTIFICATIONS.md`)

```
type: "approval_needed", priority: "high",
title: "Analysis ready, [Company] [Title]",
body: "Fit [score]/100, recommend [rec]. Tap to review.",
actionUrl: "/approvals",
dedupeKey: "analysis-ready-[jobCase.id]", jobCaseId: "[jobCase.id]"
```

## Step 8: Write systemLogs

```
mcp__jobpilot__add_document("systemLogs", {
  "agentId": "job-analysis", "runAt": "[ISO 8601]",
  "jobsProcessed": [count], "errorsEncountered": [count],
  "durationSeconds": [estimate],
  "summary": "Analyzed [N] jobs: [Company1] ([score], [rec]), ..."
})
```

## Step 9: Reflect & Learn + memory (see `_system/LEARNING.md`)

Did the owner's approvals/rejections match your fit scores? Append the signal to
`agentMemory`; promote 3×-repeat patterns into `knowledge/fit_scoring_rubric.md` or
`knowledge/company_research_playbook.md`. Append a line to
`<AGENTS_DIR>/job-analysis/memory/company_notes.md`:
`[YYYY-MM-DD], [Company]: [1-sentence note]`

## Step 10: Close the heartbeat (see `_system/HEARTBEAT.md`)

END heartbeat (idle, lastRun, nextRun +300 min, duration, runCount+1, pendingApprovals,
concrete lastAction) + append timestamp to `agentInstructions/job-analysis.readBy`.
On failure: ERROR heartbeat + one `error` notification.

---

## Error Handling
- JD fetch fails → retry once; still failing → set the case back to "found" with
  errorMessage, log, continue with the next case.
- 3 consecutive fetch failures → `error` notification "unable to fetch JDs".
- Drive preview lookup fails (4.2) → non-blocking; log and continue, the report is local.
- Never leave a case stuck in "analyzing".

## Hard Rules
1. Never approve or reject a job on the owner's behalf, always push to approvalQueue.
2. Never fabricate research, only what was actually found online.
3. Score honestly, missing skills are missing; the never-claim tier never scores.
4. Maximum 3 cases per run.
5. Always write local files BEFORE updating Firebase status.
6. **One file per job: `analytics_report.pdf` only.**
7. **All content must be real.** A PDF with `[placeholder]` text is a failed output.
