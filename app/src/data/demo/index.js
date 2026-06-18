/**
 * Demo fixtures, the job search of "Jane Doe", a fictional junior frontend
 * developer in Berlin. Every shape matches agents/_system/SCHEMA.md exactly;
 * if you change a field there, change it here too.
 *
 * Timestamps are generated relative to load time so the demo always looks
 * current.
 */

const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString();
const daysAgo = (d) => hoursAgo(d * 24);
const inHours = (h) => new Date(Date.now() + h * 3600000).toISOString();

export const DEMO_USER = {
  name: 'Jane Doe',
  email: 'jane@demo.jobpilot',
  role: 'Junior Frontend Developer',
  city: 'Berlin',
};

/* ── agents ──────────────────────────────────────────────────────────── */
const agents = [
  {
    id: 'job-search', name: 'Job Search', status: 'idle', enabled: true,
    lastRun: hoursAgo(0.4), nextRun: inHours(0.6), runningSince: null,
    lastRunDurationSeconds: 312, runCount: 168, errorCount: 2, pendingApprovals: 0,
    lastAction: 'Found 3 new roles on LinkedIn; skipped 11 (seniority or location).',
    errorMessage: '', intervalMinutes: 300, scheduleLabel: 'Every 5 hours',
  },
  {
    id: 'job-analysis', name: 'Job Analysis', status: 'running', enabled: true,
    lastRun: hoursAgo(1.2), nextRun: inHours(0.2), runningSince: hoursAgo(0.05),
    lastRunDurationSeconds: 422, runCount: 149, errorCount: 1, pendingApprovals: 1,
    lastAction: 'Analyzing Datawerk, Frontend Engineer (2 of 3 this run).',
    errorMessage: '', intervalMinutes: 300, scheduleLabel: 'Every 5 hours',
  },
  {
    id: 'cv-creation', name: 'CV Creation', status: 'idle', enabled: true,
    lastRun: hoursAgo(0.9), nextRun: inHours(0.4), runningSince: null,
    lastRunDurationSeconds: 514, runCount: 121, errorCount: 0, pendingApprovals: 2,
    lastAction: 'Drafted a tailored one-page CV for Northwind Labs; queued for review.',
    errorMessage: '', intervalMinutes: 300, scheduleLabel: 'Every 5 hours',
  },
  {
    id: 'application-writer', name: 'Application Writer', status: 'idle', enabled: true,
    lastRun: hoursAgo(1.5), nextRun: inHours(0.5), runningSince: null,
    lastRunDurationSeconds: 388, runCount: 96, errorCount: 1, pendingApprovals: 1,
    lastAction: 'Filled the Lumen Web application form and stopped before submit.',
    errorMessage: '', intervalMinutes: 300, scheduleLabel: 'Every 5 hours',
  },
  {
    id: 'connection-builder', name: 'Connection Builder', status: 'idle', enabled: true,
    lastRun: hoursAgo(1.8), nextRun: inHours(0.7), runningSince: null,
    lastRunDurationSeconds: 451, runCount: 64, errorCount: 0, pendingApprovals: 0,
    lastAction: 'Sent 8 connection requests (2 job-linked, 6 general networking).',
    errorMessage: '', intervalMinutes: 120, scheduleLabel: 'Every 2 hours',
  },
  {
    id: 'career-advisor', name: 'Career Advisor', status: 'idle', enabled: true,
    lastRun: hoursAgo(7), nextRun: inHours(17), runningSince: null,
    lastRunDurationSeconds: 232, runCount: 21, errorCount: 0, pendingApprovals: 0,
    lastAction: 'TypeScript appears in 78% of target roles, recommended a learning path.',
    errorMessage: '', intervalMinutes: 1440, scheduleLabel: 'Daily 8:00',
  },
  {
    id: 'manager', name: 'Manager', status: 'error', enabled: true,
    lastRun: hoursAgo(11), nextRun: inHours(1), runningSince: null,
    lastRunDurationSeconds: 195, runCount: 44, errorCount: 3, pendingApprovals: 0,
    lastAction: 'Morning health check: coached job-search to tighten location filters.',
    errorMessage: 'Evening run timed out while reading systemLogs, will retry next slot.',
    intervalMinutes: 720, scheduleLabel: '8:00 & 20:00',
  },
];

/* ── jobCases ────────────────────────────────────────────────────────── */
const jobCases = [
  {
    id: 'jc-01', title: 'Frontend Developer', company: 'Northwind Labs',
    location: 'Berlin, Germany', workType: 'Hybrid', sourcePlatform: 'LinkedIn',
    jobUrl: 'https://example.com/jobs/northwind-frontend',
    status: 'cv_review', priority: 'high', fitScore: 86,
    foundAt: daysAgo(3), lastUpdatedAt: hoursAgo(0.9),
    searchSummary: 'React + Tailwind product team, junior-friendly, design-system work.',
    analysisRecommendation: 'apply',
    atsKeywords: ['react', 'typescript', 'tailwind', 'design systems', 'testing-library'],
    analysisReport:
      'Strong match (86/100). The stack is React 18 + TypeScript + Tailwind; Jane has all three from her bootcamp capstone and freelance work. Role is explicitly open to 0–2 years of experience. Design-system focus matches her component-library side project. Risk: the JD mentions "occasional on-call" without detail.',
    companyResearch:
      'Northwind Labs (fictional) builds analytics tooling for e-commerce, ~120 people, Series B. Engineering blog shows a healthy review culture. Glassdoor-style sentiment: positive on mentorship.',
    folderPath: 'Jobs/Northwind Labs - Frontend Developer',
    filePaths: {
      analysis_report: 'Jobs/Northwind Labs - Frontend Developer/analytics_report.pdf',
      resume_pdf: 'Jobs/Northwind Labs - Frontend Developer/resume.pdf',
      resume: 'Jobs/Northwind Labs - Frontend Developer/resume.docx',
    },
    agentLog: [
      { timestamp: daysAgo(3), agentId: 'job-search', message: 'Found on LinkedIn (posted 6h earlier).' },
      { timestamp: daysAgo(2.8), agentId: 'job-analysis', message: 'Scored 86/100, queued for your approval.' },
      { timestamp: daysAgo(2), agentId: 'cv-creation', message: 'You approved the analysis. Asked 2 CV questions.' },
      { timestamp: hoursAgo(1), agentId: 'cv-creation', message: 'Drafted resume.pdf (1 page, verified). Awaiting review.' },
    ],
  },
  {
    id: 'jc-02', title: 'Junior React Developer', company: 'Datawerk',
    location: 'Berlin, Germany', workType: 'On-site', sourcePlatform: 'LinkedIn',
    jobUrl: 'https://example.com/jobs/datawerk-react',
    status: 'analyzing', priority: 'normal', fitScore: null,
    foundAt: hoursAgo(2), lastUpdatedAt: hoursAgo(0.1),
    searchSummary: 'Dashboard-heavy product, React + charting, junior level.',
    agentLog: [
      { timestamp: hoursAgo(2), agentId: 'job-search', message: 'Found on LinkedIn.' },
      { timestamp: hoursAgo(0.1), agentId: 'job-analysis', message: 'Analysis in progress.' },
    ],
  },
  {
    id: 'jc-03', title: 'Frontend Engineer', company: 'Lumen Web GmbH',
    location: 'Remote (EU)', workType: 'Remote', sourcePlatform: 'StepStone',
    jobUrl: 'https://example.com/jobs/lumen-frontend',
    status: 'application_review', priority: 'high', fitScore: 81,
    foundAt: daysAgo(6), lastUpdatedAt: hoursAgo(1.5),
    searchSummary: 'Remote-first agency, React/Next.js client projects.',
    analysisRecommendation: 'apply',
    atsKeywords: ['react', 'next.js', 'css', 'accessibility', 'agency'],
    analysisReport:
      'Good match (81/100). Agency variety suits a junior building breadth. Accessibility emphasis matches her a11y coursework. Salary range posted is fair for Berlin remote.',
    companyResearch: 'Lumen Web (fictional) is a 40-person remote-first web agency, EU clients, public salary bands.',
    applicationText:
      'Cover letter drafted: leads with the accessibility redesign she shipped for a bakery client, maps her React/Next.js experience to their client roster, 240 words.',
    folderPath: 'Jobs/Lumen Web GmbH - Frontend Engineer',
    filePaths: {
      analysis_report: 'Jobs/Lumen Web GmbH - Frontend Engineer/analytics_report.pdf',
      resume_pdf: 'Jobs/Lumen Web GmbH - Frontend Engineer/resume.pdf',
      application_screenshot: 'Jobs/Lumen Web GmbH - Frontend Engineer/application_filled.png',
      cover_letter: 'Jobs/Lumen Web GmbH - Frontend Engineer/cover_letter.pdf',
    },
    agentLog: [
      { timestamp: daysAgo(6), agentId: 'job-search', message: 'Found on StepStone.' },
      { timestamp: daysAgo(5.5), agentId: 'job-analysis', message: 'Scored 81/100, approved by you.' },
      { timestamp: daysAgo(3), agentId: 'cv-creation', message: 'CV approved (v1).' },
      { timestamp: hoursAgo(1.5), agentId: 'application-writer', message: 'Form filled, screenshot attached. Stopped before submit.' },
    ],
  },
  {
    id: 'jc-04', title: 'Web Developer', company: 'PixelForge Studio',
    location: 'Berlin, Germany', workType: 'Hybrid', sourcePlatform: 'LinkedIn',
    jobUrl: 'https://example.com/jobs/pixelforge-web',
    status: 'needs_approval', priority: 'normal', fitScore: 74,
    foundAt: hoursAgo(9), lastUpdatedAt: hoursAgo(6),
    searchSummary: 'Creative studio, marketing sites + web apps, small team.',
    analysisRecommendation: 'apply',
    atsKeywords: ['javascript', 'react', 'animation', 'webgl', 'figma'],
    analysisReport:
      'Decent match (74/100). Strong on core JS/React; WebGL is a gap but listed as nice-to-have. Small team means broad exposure, good growth for a junior. Studio work can mean deadline crunches.',
    companyResearch: 'PixelForge (fictional) is a 15-person digital studio doing award-style marketing sites.',
    folderPath: 'Jobs/PixelForge Studio - Web Developer',
    filePaths: { analysis_report: 'Jobs/PixelForge Studio - Web Developer/analytics_report.pdf' },
    agentLog: [
      { timestamp: hoursAgo(9), agentId: 'job-search', message: 'Found on LinkedIn.' },
      { timestamp: hoursAgo(6), agentId: 'job-analysis', message: 'Scored 74/100, queued for your approval.' },
    ],
  },
  {
    id: 'jc-05', title: 'Junior Fullstack Developer (React/Node)', company: 'StackRiver',
    location: 'Hamburg, Germany', workType: 'Hybrid', sourcePlatform: 'LinkedIn',
    jobUrl: 'https://example.com/jobs/stackriver-fullstack',
    status: 'cv_questions_pending', priority: 'normal', fitScore: 77,
    foundAt: daysAgo(2), lastUpdatedAt: hoursAgo(20),
    searchSummary: 'Logistics SaaS, React front, Node services, junior track with mentor.',
    analysisRecommendation: 'apply',
    atsKeywords: ['react', 'node.js', 'rest apis', 'postgresql', 'docker'],
    analysisReport:
      'Good match (77/100). Frontend side is solid; Node/Postgres are her weaker half but the role advertises a mentorship track. Hamburg relocation question flagged.',
    companyResearch: 'StackRiver (fictional) builds freight-tracking SaaS, ~80 people.',
    cvQuestionsAsked: [
      'Your bootcamp project used Express for the API. Can we describe that as production Node.js experience, or keep it as coursework?',
      'Have you used PostgreSQL directly, or only through an ORM?',
    ],
    agentLog: [
      { timestamp: daysAgo(2), agentId: 'job-search', message: 'Found on LinkedIn.' },
      { timestamp: daysAgo(1.5), agentId: 'job-analysis', message: 'Scored 77/100, approved by you.' },
      { timestamp: hoursAgo(20), agentId: 'cv-creation', message: 'Needs 2 answers before drafting the CV.' },
    ],
  },
  {
    id: 'jc-06', title: 'Frontend Developer (Vue)', company: 'Mondhaus',
    location: 'Berlin, Germany', workType: 'On-site', sourcePlatform: 'StepStone',
    jobUrl: 'https://example.com/jobs/mondhaus-vue',
    status: 'rejected_after_analysis', priority: 'low', fitScore: 48,
    foundAt: daysAgo(4), lastUpdatedAt: daysAgo(3.5),
    searchSummary: 'Vue 2 legacy codebase, junior role.',
    analysisRecommendation: 'skip',
    analysisReport:
      'Weak match (48/100). Vue 2 legacy migration work with no React anywhere; JD asks for Vuex specifics. Time is better spent on React roles.',
    agentLog: [
      { timestamp: daysAgo(4), agentId: 'job-search', message: 'Found on StepStone.' },
      { timestamp: daysAgo(3.5), agentId: 'job-analysis', message: 'Scored 48/100, recommended skip; you agreed.' },
    ],
  },
  {
    id: 'jc-07', title: 'React Developer', company: 'Velo Systems',
    location: 'Remote (EU)', workType: 'Remote', sourcePlatform: 'LinkedIn',
    jobUrl: 'https://example.com/jobs/velo-react',
    status: 'applied', priority: 'high', fitScore: 88,
    foundAt: daysAgo(9), lastUpdatedAt: daysAgo(1), appliedAt: daysAgo(1),
    searchSummary: 'Mobility startup, React + maps, junior-to-mid band.',
    analysisRecommendation: 'apply',
    atsKeywords: ['react', 'typescript', 'mapbox', 'testing', 'ci'],
    analysisReport: 'Excellent match (88/100). Maps work overlaps her cycling-route side project.',
    companyResearch: 'Velo Systems (fictional) builds B2B bike-fleet software, ~60 people, remote-first.',
    agentLog: [
      { timestamp: daysAgo(9), agentId: 'job-search', message: 'Found on LinkedIn.' },
      { timestamp: daysAgo(8), agentId: 'job-analysis', message: 'Scored 88/100, approved same day.' },
      { timestamp: daysAgo(5), agentId: 'cv-creation', message: 'CV approved (v2 after one revision).' },
      { timestamp: daysAgo(1), agentId: 'application-writer', message: 'You approved, application submitted.' },
    ],
  },
  {
    id: 'jc-08', title: 'UI Engineer', company: 'Brightpath Health',
    location: 'Munich, Germany', workType: 'Hybrid', sourcePlatform: 'LinkedIn',
    jobUrl: 'https://example.com/jobs/brightpath-ui',
    status: 'applied', priority: 'normal', fitScore: 79,
    foundAt: daysAgo(12), lastUpdatedAt: daysAgo(4), appliedAt: daysAgo(4),
    searchSummary: 'Health-tech patient portal, React + design system.',
    analysisRecommendation: 'apply',
    atsKeywords: ['react', 'design systems', 'storybook', 'accessibility'],
    analysisReport: 'Good match (79/100). Storybook + a11y emphasis fits her portfolio.',
    agentLog: [
      { timestamp: daysAgo(12), agentId: 'job-search', message: 'Found on LinkedIn.' },
      { timestamp: daysAgo(4), agentId: 'application-writer', message: 'Application submitted after your approval.' },
    ],
  },
  {
    id: 'jc-09', title: 'Junior Web Engineer', company: 'Kupferworks',
    location: 'Berlin, Germany', workType: 'On-site', sourcePlatform: 'Company site',
    jobUrl: 'https://example.com/jobs/kupferworks-web',
    status: 'found', priority: 'normal', fitScore: null,
    foundAt: hoursAgo(0.5), lastUpdatedAt: hoursAgo(0.5),
    searchSummary: 'Industrial IoT dashboards, React, junior level, posted 2h ago.',
    agentLog: [
      { timestamp: hoursAgo(0.5), agentId: 'job-search', message: 'Found via company careers page.' },
    ],
  },
  {
    id: 'jc-10', title: 'Frontend Developer', company: 'Ferntree Digital',
    location: 'Remote (EU)', workType: 'Remote', sourcePlatform: 'LinkedIn',
    jobUrl: 'https://example.com/jobs/ferntree-frontend',
    status: 'approved_for_cv', priority: 'normal', fitScore: 76,
    foundAt: daysAgo(1.2), lastUpdatedAt: hoursAgo(3),
    searchSummary: 'E-learning platform, React + video tooling.',
    analysisRecommendation: 'apply',
    atsKeywords: ['react', 'typescript', 'video', 'redux'],
    analysisReport: 'Good match (76/100). Redux is a small gap; everything else lines up.',
    agentLog: [
      { timestamp: daysAgo(1.2), agentId: 'job-search', message: 'Found on LinkedIn.' },
      { timestamp: hoursAgo(3), agentId: 'job-analysis', message: 'You approved, handing to CV creation.' },
    ],
  },
  {
    id: 'jc-11', title: 'Frontend Engineer (Growth)', company: 'CloudNine Commerce',
    location: 'Berlin, Germany', workType: 'Hybrid', sourcePlatform: 'StepStone',
    jobUrl: 'https://example.com/jobs/cloudnine-growth',
    status: 'closed', priority: 'low', fitScore: 71,
    foundAt: daysAgo(15), lastUpdatedAt: daysAgo(7),
    searchSummary: 'Checkout-flow experiments, React + analytics.',
    analysisRecommendation: 'apply',
    analysisReport: 'Decent match (71/100), but the posting closed before application.',
    agentLog: [
      { timestamp: daysAgo(15), agentId: 'job-search', message: 'Found on StepStone.' },
      { timestamp: daysAgo(7), agentId: 'manager', message: 'Posting removed by employer, case closed.' },
    ],
  },
  {
    id: 'jc-12', title: 'Design Engineer', company: 'Acme Analytics',
    location: 'Berlin, Germany', workType: 'Hybrid', sourcePlatform: 'LinkedIn',
    jobUrl: 'https://example.com/jobs/acme-design-engineer',
    status: 'cv_drafting', priority: 'high', fitScore: 83,
    foundAt: daysAgo(2.5), lastUpdatedAt: hoursAgo(5),
    searchSummary: 'Design-engineering hybrid: Figma-to-React, motion work.',
    analysisRecommendation: 'apply',
    atsKeywords: ['react', 'framer motion', 'figma', 'css', 'design systems'],
    analysisReport: 'Strong match (83/100). Her motion-design hobby projects are directly relevant.',
    agentLog: [
      { timestamp: daysAgo(2.5), agentId: 'job-search', message: 'Found on LinkedIn.' },
      { timestamp: hoursAgo(5), agentId: 'cv-creation', message: 'Revision requested, tightening the projects section.' },
    ],
  },
];

/* ── approvalQueue ───────────────────────────────────────────────────── */
const approvalQueue = [
  {
    id: 'ap-01', type: 'cv', status: 'pending', agentId: 'cv-creation', jobCaseId: 'jc-01',
    title: 'CV ready: Northwind Labs, Frontend Developer',
    summary:
      'One-page CV tailored to the design-system focus: leads with the component-library project, mirrors JD keywords (React, TypeScript, Tailwind, testing-library). PDF verified at exactly 1 page.',
    attachedFilePath: 'Jobs/Northwind Labs - Frontend Developer/resume.pdf',
    createdAt: hoursAgo(1),
  },
  {
    id: 'ap-02', type: 'cv_questions', status: 'pending', agentId: 'cv-creation', jobCaseId: 'jc-05',
    title: '2 questions before drafting: StackRiver CV',
    summary:
      'Your bootcamp project used Express for the API. Can we describe that as production Node.js experience, or keep it as coursework?\nHave you used PostgreSQL directly, or only through an ORM?',
    questions: [
      'Your bootcamp project used Express for the API. Can we describe that as production Node.js experience, or keep it as coursework?',
      'Have you used PostgreSQL directly, or only through an ORM?',
    ],
    createdAt: hoursAgo(20),
  },
  {
    id: 'ap-03', type: 'application', status: 'pending', agentId: 'application-writer', jobCaseId: 'jc-03',
    title: 'Application filled: Lumen Web GmbH (not submitted)',
    summary:
      'Form completed on their careers portal: contact details, CV uploaded (PDF), cover letter pasted, screening answers (remote OK, EU work authorization confirmed, notice period 2 weeks). Screenshot attached. Will submit only after your approval.',
    attachedFilePath: 'Jobs/Lumen Web GmbH - Frontend Engineer/application_filled.png',
    createdAt: hoursAgo(1.5),
  },
  {
    id: 'ap-04', type: 'analysis', status: 'pending', agentId: 'job-analysis', jobCaseId: 'jc-04',
    title: 'Fit 74/100: PixelForge Studio, Web Developer',
    summary:
      'Recommend applying. Core JS/React strong; WebGL is a nice-to-have gap. Small creative studio = broad exposure. Full report and company research attached to the case.',
    attachedFilePath: 'Jobs/PixelForge Studio - Web Developer/analytics_report.pdf',
    createdAt: hoursAgo(6),
  },
  {
    id: 'ap-05', type: 'connection_note', status: 'pending', agentId: 'connection-builder',
    title: 'Connection note for Velo Systems recruiter',
    summary: 'Follow-up note to the recruiter after applying.',
    personName: 'Maria Schmidt (fictional)', personRole: 'Talent Acquisition, Velo Systems',
    personLinkedInUrl: 'https://example.com/in/maria-schmidt',
    noteText:
      'Hi Maria, I applied for the React Developer role yesterday. My cycling-route planner (React + Mapbox) is close to what your team builds; happy to share it. Best, Jane',
    createdAt: hoursAgo(22),
  },
  {
    id: 'ap-06', type: 'cv', status: 'decided', decision: 'approved', agentId: 'cv-creation', jobCaseId: 'jc-07',
    title: 'CV v2: Velo Systems, React Developer',
    summary: 'Revision approved; map-project bullet moved to the top.',
    createdAt: daysAgo(5.2), decidedAt: daysAgo(5),
  },
];

/* ── notifications ───────────────────────────────────────────────────── */
const notifications = [
  {
    id: 'nt-01', agentId: 'cv-creation', type: 'approval_needed', priority: 'high',
    title: 'CV ready for review: Northwind Labs',
    body: 'One-page tailored CV is drafted and verified. Approve or request changes.',
    actionUrl: '/approvals', jobCaseId: 'jc-01', read: false, createdAt: hoursAgo(1),
  },
  {
    id: 'nt-02', agentId: 'application-writer', type: 'approval_needed', priority: 'high',
    title: 'Application filled: Lumen Web GmbH',
    body: 'Form is complete with screenshot attached. It will not be submitted until you approve.',
    actionUrl: '/approvals', jobCaseId: 'jc-03', read: false, createdAt: hoursAgo(1.5),
  },
  {
    id: 'nt-03', agentId: 'manager', type: 'error', priority: 'urgent',
    title: 'Manager evening run failed',
    body: 'Timed out reading systemLogs. Will retry at the next scheduled slot.',
    actionUrl: '/agents', read: false, createdAt: hoursAgo(11),
  },
  {
    id: 'nt-04', agentId: 'job-search', type: 'summary', priority: 'normal',
    title: '3 new roles found this hour',
    body: 'Two in Berlin, one remote EU. One already queued for analysis.',
    actionUrl: '/applications', read: true, createdAt: hoursAgo(0.4),
  },
  {
    id: 'nt-05', agentId: 'career-advisor', type: 'insight', priority: 'normal',
    title: 'TypeScript gap is costing matches',
    body: '78% of your target roles list TypeScript. A focused 2-week path is recommended.',
    actionUrl: '/insights', read: true, createdAt: hoursAgo(7),
  },
  {
    id: 'nt-06', agentId: 'application-writer', type: 'file_ready', priority: 'normal',
    title: 'Application submitted: Velo Systems',
    body: 'Submitted after your approval. Interview notes file created.',
    actionUrl: '/applications', jobCaseId: 'jc-07', read: true, createdAt: daysAgo(1),
  },
];

/* ── agentRequests (agent → owner questions / ideas) ─────────────────── */
const agentRequests = [
  {
    id: 'req-01', agentId: 'job-search', status: 'open', jobCaseId: null,
    title: 'Should I widen the search to Munich?',
    question:
      'Berlin + remote-EU is running thin this week, only 3 new roles. I found a cluster of strong junior React roles in Munich. Want me to include Munich (hybrid) for the next few runs, or keep the current scope?',
    context: 'Your instructions say "prefer Berlin and remote-EU". This would be a temporary widening, not a permanent change.',
    reply: null, repliedAt: null, readByAgent: false, createdAt: hoursAgo(2),
  },
  {
    id: 'req-02', agentId: 'cv-creation', status: 'answered', jobCaseId: 'jc-12',
    title: 'Phrasing for the motion-design hobby work',
    question:
      'For the Acme Design Engineer CV, can I frame your Framer Motion hobby projects as "production animation work", or should I keep them under a "Side projects" heading to stay honest?',
    context: null,
    reply: 'Keep it under Side projects, but lead with the most polished one. Don’t call it production.',
    repliedAt: hoursAgo(4), readByAgent: true, createdAt: hoursAgo(6),
  },
];

/* ── agentReports ────────────────────────────────────────────────────── */
const agentReports = [
  {
    id: 'rp-01', agentId: 'manager', runType: 'morning', runAt: hoursAgo(11),
    headline: 'Healthy pipeline; approvals are the bottleneck',
    summary:
      'All agents ran on schedule overnight. 4 items are waiting on your decision, the oldest for 22 hours. Job quality is good: 7 of the last 9 finds scored above 70.',
    metrics: { agentsHealthy: 6, pendingApprovals: 4, stuckJobs: 0, errorsLast24h: 1 },
    highlights: ['Velo Systems application submitted', 'Northwind CV drafted in one pass'],
    coachingGiven: ['job-search: tighten location filter; two Hamburg roles slipped through a Berlin-focused config'],
    createdAt: hoursAgo(11),
  },
  {
    id: 'rp-02', agentId: 'job-search', runType: 'run', runAt: hoursAgo(0.4),
    headline: '3 found, 11 skipped',
    summary: 'LinkedIn: 2 junior React roles in Berlin. Company site sweep: 1 IoT dashboard role. Skips were seniority (7) and location (4).',
    metrics: { jobsFound: 3, jobsSkipped: 11 },
    createdAt: hoursAgo(0.4),
  },
  {
    id: 'rp-03', agentId: 'career-advisor', runType: 'run', runAt: hoursAgo(7),
    headline: 'TypeScript remains the top gap',
    summary: 'Across 30 days of analyzed roles, TypeScript (78%), testing (61%), and Next.js (44%) lead the requirements Jane lacks confidence in.',
    metrics: { rolesAnalyzed: 41, newAdvice: 1 },
    createdAt: hoursAgo(7),
  },
  {
    id: 'rp-04', agentId: 'cv-creation', runType: 'run', runAt: hoursAgo(0.9),
    headline: 'Northwind CV drafted',
    summary: 'Tailored to design-system keywords; 1-page verified; uploaded PDF + DOCX.',
    metrics: { cvsDrafted: 1, questionsAsked: 0 },
    createdAt: hoursAgo(0.9),
  },
  {
    id: 'rp-05', agentId: 'manager', runType: 'evening', runAt: daysAgo(1.5),
    headline: 'Good week: 2 applications out',
    summary: 'Velo and Brightpath are submitted. Response time on approvals improved to ~6h median.',
    metrics: { applicationsSubmitted: 2, avgApprovalHours: 6 },
    createdAt: daysAgo(1.5),
  },
  {
    id: 'rp-06', agentId: 'connection-builder', runType: 'run', runAt: hoursAgo(1.8),
    headline: '8 connections sent',
    summary: '2 linked to active applications (Velo, Brightpath), 6 general networking at target companies. Weekly total: 34 of 100.',
    metrics: { connectionsSent: 8, weeklyTotal: 34 },
    createdAt: hoursAgo(1.8),
  },
];

/* ── careerAdvice ────────────────────────────────────────────────────── */
const careerAdvice = [
  {
    id: 'ca-01', category: 'skill_gap', priority: 'high', effort: 'medium', status: 'pending',
    recommendation: 'Learn TypeScript fundamentals (2-week focused path)',
    reasoning: '78% of analyzed target roles list TypeScript. It is the single highest-frequency gap in your profile.',
    impact: 'Unlocks roughly 4 in 5 of the roles currently filtered down by fit score.',
    actionItems: ['Official TS handbook basics (2 evenings)', 'Convert your portfolio site to TS', 'Add TS to one freelance project'],
    createdAt: hoursAgo(7),
  },
  {
    id: 'ca-02', category: 'project_idea', priority: 'normal', effort: 'low', status: 'pending',
    recommendation: 'Add tests to your component-library project',
    reasoning: 'Testing (Jest / Testing Library) appears in 61% of JDs but your projects show none.',
    impact: 'Turns an existing project into evidence for a recurring requirement.',
    actionItems: ['Add Testing Library to the component library', 'Cover the 5 most-used components', 'Mention coverage in the README'],
    createdAt: daysAgo(1),
  },
  {
    id: 'ca-03', category: 'strategy', priority: 'normal', effort: 'low', status: 'pending',
    recommendation: 'Answer approvals within 12 hours',
    reasoning: 'Median approval time is 6h on weekdays but 26h on weekends; two strong roles closed while waiting.',
    impact: 'Faster pipeline throughput without any new skills.',
    actionItems: ['Enable push notifications in Settings', 'Batch-review approvals each morning'],
    createdAt: daysAgo(2),
  },
];

/* ── trends (weekly docs) ────────────────────────────────────────────── */
const trends = [
  {
    id: 'week-current', week: 'current',
    skillFrequency: { typescript: 32, react: 41, testing: 25, 'next.js': 18, tailwind: 14, accessibility: 11, redux: 9, graphql: 7 },
    roleFrequency: { 'Frontend Developer': 19, 'React Developer': 11, 'UI Engineer': 6, 'Fullstack Developer': 5 },
    companyFrequency: {},
    certFrequency: {},
    jobsFound: 23, totalJobsFound: 41,
    createdAt: hoursAgo(5),
  },
  {
    id: 'week-prev', week: 'previous',
    skillFrequency: { react: 38, typescript: 28, testing: 22, 'next.js': 15, tailwind: 12, accessibility: 9 },
    roleFrequency: { 'Frontend Developer': 16, 'React Developer': 9, 'UI Engineer': 5 },
    jobsFound: 18, totalJobsFound: 18,
    createdAt: daysAgo(8),
  },
];

/* ── agentInstructions ───────────────────────────────────────────────── */
const agentInstructions = [
  {
    id: 'job-search',
    instructions: 'Prefer Berlin and remote-EU roles. Skip anything requiring 3+ years.',
    updatedAt: daysAgo(2), readBy: [daysAgo(1.9), daysAgo(1)],
  },
  ...['job-analysis', 'cv-creation', 'application-writer', 'connection-builder', 'career-advisor', 'manager']
    .map((id) => ({ id, instructions: '', updatedAt: null, readBy: [] })),
];

/* ── jobs (manual tracker) ───────────────────────────────────────────── */
const jobs = [
  {
    id: 'job-01', companyName: 'Hafenblick Media', position: 'Junior Web Developer',
    location: 'Berlin', status: 'interview', dateApplied: daysAgo(10),
    followUpDate: inHours(48), jobUrl: 'https://example.com/jobs/hafenblick',
    notes: 'Second-round technical interview scheduled. Prepare the portfolio walkthrough.',
    contactName: 'Tobias K. (fictional)', contactEmail: 'careers@example.com',
  },
  {
    id: 'job-02', companyName: 'Grünfeld Software', position: 'Frontend Developer',
    location: 'Berlin', status: 'pending', dateApplied: daysAgo(5),
    followUpDate: inHours(24), jobUrl: 'https://example.com/jobs/gruenfeld',
    notes: 'Applied directly via careers page before JobPilot found it.',
  },
  {
    id: 'job-03', companyName: 'Nordlicht Apps', position: 'React Native Developer',
    location: 'Remote', status: 'assessments', dateApplied: daysAgo(7),
    notes: 'Take-home: small RN screen. Due Friday.',
  },
  {
    id: 'job-04', companyName: 'Altbau Digital', position: 'Web Developer',
    location: 'Berlin', status: 'rejected', dateApplied: daysAgo(20),
    notes: 'Went with a mid-level candidate. Recruiter suggested re-applying in 6 months.',
  },
  {
    id: 'job-05', companyName: 'Velo Systems', position: 'React Developer',
    location: 'Remote (EU)', status: 'pending', dateApplied: daysAgo(1),
    jobUrl: 'https://example.com/jobs/velo-react',
    notes: 'Submitted by JobPilot after approval, tracking the response here.',
  },
];

/* ── build the store ─────────────────────────────────────────────────── */
export function buildDemoData() {
  const store = new Map();
  const put = (name, docs) => store.set(name, new Map(docs.map((d) => [d.id, { ...d }])));

  put('agents', agents);
  put('jobCases', jobCases);
  put('approvalQueue', approvalQueue);
  put('agentRequests', agentRequests);
  put('notifications', notifications);
  put('agentReports', agentReports);
  put('careerAdvice', careerAdvice);
  put('trends', trends);
  put('agentInstructions', agentInstructions);
  put('jobs', jobs);
  put('meta', [{ id: 'ats', resumeText: '', resumeFileName: '' }]);
  put('settings', [{ id: 'user', theme: 'light' }]);

  return store;
}
