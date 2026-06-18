# ATS-Friendly Resume Rules: Knowledge

How to build a CV that parses cleanly in modern ATS (Workday, Greenhouse, Lever, Ashby,
iCIMS) **and** reads well to a human. Generated with python-docx per
`references/cv_design.md` (the owner's unique design).

## Structure (parse-safe)
- **Single column. No tables, text boxes, columns, headers/footers, images, icons, or
  charts.** Multi-column and table layouts are the #1 cause of garbled ATS parsing.
- **Reverse-chronological.** Standard section headings ATS recognises: *Summary, Skills,
  Experience, Education, Projects.* Don't get cute with names ("Where I've Been").
- System font, **10–12pt** (per the design system). Black/dark text only, **never**
  white/hidden keyword text; modern ATS flags zero-opacity text and rejects it.
- Contact details in the body, not the header/footer (footers are often dropped).
- Dates as `Mon YYYY – Mon YYYY` (or "Present"). Consistent formatting.
- Check `job-search/knowledge/market_playbook.md` "CV & application norms", some
  markets expect photos/2 pages/a different language; the playbook wins over defaults.

## Keyword optimization (the part that gets you past the filter)
- Pull required + preferred terms from the jobCase `atsKeywords[]`. Place each
  **high-priority term in 3 places**: the Skills block, the relevant role's bullets,
  and (top 3–5) the Summary.
- **Most keywords belong in Experience bullets** (proof), not just a skills list, ATS
  and humans both weight context.
- Mirror the JD's exact phrasing where honest.
- **Only claim what's true** (PROFILE.md three tiers). The never-claim tier never
  appears as a skill. Honesty > keyword stuffing; a flagged lie ends the process.

## File output
- Produce **both** `resume.docx` (editable) **and** `resume.pdf` (formatting locked,
  best for phone review), saved to the **local** job folder (local-first, see
  `_system/FILES.md`, no Drive API upload). Submit `.docx` unless the posting demands PDF.
- The PDF must be **text-selectable** (real PDF conversion, not a scan/image).
- **Exactly one page** (unless the market playbook says otherwise), verify with
  pdfinfo; adjust spacing/margins, never shrink below 10pt body.

## Quality bar (human reviewer)
- 3–4 line Summary tailored to the exact role title + top 2–3 JD skills the owner has.
- Bullets: action verb → what → tool → result/impact (quantify when real).
- No em dashes, no AI throat-clearing, no "passionate about". Fill the page; no gaps.
- Tailor section order to the role; if projects are the strongest evidence, surface
  Projects higher.

## Don't bother with
Keyword-stuffing hidden text · "ATS score 100" gimmicks · graphics/rating bars ·
two-column "designer" templates for corporate applications.
