# Quality Rubric, Knowledge (evening review)

How the Manager judges the *quality* of the team's output (not just whether agents
ran). Feeds the coaching loop and the evening report.

## Job relevance (job-search quality)
- Sample the day's new jobCases. Count **relevant vs irrelevant** for the owner's
  targets/profile.
- **> 30% irrelevant** → filters are too loose. Coach job-search: tighten the offending
  rule, drop the noisy search, add the miss pattern to its knowledge.
- Cross-check against the owner's **actual approve/reject decisions**, they outrank
  any heuristic.

## Analysis quality (job-analysis)
- Do `fitScore`s track the owner's decisions? Approving "low" scores or rejecting
  "high" ones = miscalibrated rubric → coach an adjustment.
- Are company research + ATS keywords actually present and useful, or thin?

## CV / application quality
- Are CVs one page, ATS-clean, and tailored (not generic)? Repeated CV questions = a
  real skill gap → route to career-advisor + store the answer in base_cv.md.
- Are cover letters specific to the company, honest, and on-tone (`tone_matrix.md`)?

## Networking quality (connection-builder)
- Acceptance-rate trend; limit compliance; targeting hitting recruiters/relevant teams,
  not random profiles. Low acceptance → refine targeting/messaging.

## Cross-agent checks
- A skill job-analysis keeps flagging as missing **and** cv-creation keeps asking
  about = high-confidence gap → make sure career-advisor surfaces it.
- Duplicate jobCases → flag for cleanup.
- Drive: are job folders + files actually created and linked (`driveFolderUrl`
  populated)? Silent upload failures lock the owner out of their files, flag loudly.

## Output
Roll findings into the evening report's `highlights` + `coachingGiven` +
`recommendations`, and apply the coaching per `coaching_playbook.md`. Quality review
never changes statuses or approvals.
