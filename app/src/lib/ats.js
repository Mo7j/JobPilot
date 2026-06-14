// ─────────────────────────────────────────────────────────────────────────────
// ATS analysis engine
// A heuristic, fully client-side resume ↔ job-description matcher. It scores on
// several dimensions (skills, experience, education, measurable impact, ATS
// readiness), recognises real skills/phrases from a curated taxonomy instead of
// raw word frequency, and returns prioritised, actionable guidance.
// ─────────────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','and','with','for','that','this','from','your','will','have','you','our',
  'are','but','not','into','about','their','they','them','role','work','team',
  'years','year','plus','using','ability','experience','strong','good','great',
  'must','skills','including','required','preferred','candidate','candidates',
  'responsibilities','qualifications','we','is','in','to','a','of','on','or',
  'be','as','an','at','by','its','all','any','who','can','may','also','what',
  'new','help','helps','within','across','able','well','more','most','such',
  'other','etc','per','via','out','up','it','if','so','then','than','these',
  'those','here','there','when','where','which','while','would','should','could',
  'looking','join','seeking','part','full','time','day','days','week','month',
  'company','companies','business','world','people','make','build','building',
  'help','helping','want','need','like','get','one','two','three','high','low',
]);

// Curated skill taxonomy. Each entry: canonical label, the category it belongs
// to, and a list of aliases/spellings that should all map to it. `weight` lifts
// the importance of hard, role-defining skills over generic ones.
const SKILLS = [
  // Languages
  ['Python', 'language', ['python'], 3],
  ['JavaScript', 'language', ['javascript', 'js', 'es6', 'ecmascript'], 3],
  ['TypeScript', 'language', ['typescript', 'ts'], 3],
  ['Java', 'language', ['java'], 3],
  ['C++', 'language', ['c++', 'cpp'], 3],
  ['C#', 'language', ['c#', 'csharp', '.net', 'dotnet'], 3],
  ['C', 'language', ['c language', 'c programming'], 2],
  ['Go', 'language', ['golang', 'go programming'], 3],
  ['Rust', 'language', ['rust'], 3],
  ['Ruby', 'language', ['ruby', 'ruby on rails', 'rails'], 3],
  ['PHP', 'language', ['php'], 2],
  ['Swift', 'language', ['swift'], 3],
  ['Kotlin', 'language', ['kotlin'], 3],
  ['Scala', 'language', ['scala'], 3],
  ['R', 'language', ['r language', 'r programming', 'rstudio'], 3],
  ['SQL', 'language', ['sql', 't-sql', 'pl/sql', 'plsql'], 3],
  ['Bash', 'language', ['bash', 'shell scripting', 'shell script'], 2],
  ['HTML', 'language', ['html', 'html5'], 1],
  ['CSS', 'language', ['css', 'css3', 'sass', 'scss', 'tailwind', 'tailwindcss'], 1],

  // Frameworks & libraries
  ['React', 'framework', ['react', 'react.js', 'reactjs'], 3],
  ['Next.js', 'framework', ['next.js', 'nextjs'], 2],
  ['Vue', 'framework', ['vue', 'vue.js', 'vuejs'], 2],
  ['Angular', 'framework', ['angular', 'angularjs'], 2],
  ['Node.js', 'framework', ['node.js', 'nodejs', 'node'], 3],
  ['Express', 'framework', ['express', 'express.js'], 2],
  ['Django', 'framework', ['django'], 3],
  ['Flask', 'framework', ['flask'], 2],
  ['FastAPI', 'framework', ['fastapi'], 2],
  ['Spring', 'framework', ['spring', 'spring boot', 'springboot'], 3],
  ['Flutter', 'framework', ['flutter'], 3],
  ['React Native', 'framework', ['react native'], 3],
  ['.NET', 'framework', ['.net', 'asp.net', 'dotnet'], 3],

  // Data & AI
  ['Machine Learning', 'data', ['machine learning', 'ml', 'predictive modeling', 'predictive modelling'], 3],
  ['Deep Learning', 'data', ['deep learning', 'neural network', 'neural networks'], 3],
  ['NLP', 'data', ['nlp', 'natural language processing'], 3],
  ['Computer Vision', 'data', ['computer vision', 'cv', 'image recognition'], 3],
  ['Generative AI', 'data', ['generative ai', 'genai', 'llm', 'llms', 'large language model', 'large language models', 'prompt engineering'], 3],
  ['Data Engineering', 'data', ['data engineering', 'data engineer'], 3],
  ['Data Analysis', 'data', ['data analysis', 'data analytics', 'data analyst'], 3],
  ['Data Science', 'data', ['data science', 'data scientist'], 3],
  ['ETL', 'data', ['etl', 'elt', 'data pipeline', 'data pipelines', 'data ingestion'], 3],
  ['Data Warehouse', 'data', ['data warehouse', 'data warehousing', 'data lake', 'lakehouse'], 3],
  ['Big Data', 'data', ['big data'], 2],
  ['Spark', 'data', ['spark', 'apache spark', 'pyspark'], 3],
  ['Hadoop', 'data', ['hadoop'], 2],
  ['Kafka', 'data', ['kafka', 'apache kafka'], 3],
  ['Airflow', 'data', ['airflow', 'apache airflow'], 3],
  ['dbt', 'data', ['dbt'], 2],
  ['Pandas', 'data', ['pandas'], 2],
  ['NumPy', 'data', ['numpy'], 2],
  ['TensorFlow', 'data', ['tensorflow'], 3],
  ['PyTorch', 'data', ['pytorch'], 3],
  ['scikit-learn', 'data', ['scikit-learn', 'sklearn', 'scikit learn'], 2],
  ['Power BI', 'data', ['power bi', 'powerbi'], 2],
  ['Tableau', 'data', ['tableau'], 2],
  ['Looker', 'data', ['looker'], 2],
  ['Statistics', 'data', ['statistics', 'statistical analysis', 'statistical'], 2],
  ['Data Modeling', 'data', ['data modeling', 'data modelling', 'dimensional modeling'], 2],
  ['Data Visualization', 'data', ['data visualization', 'data visualisation', 'dashboards', 'dashboard'], 2],

  // Databases
  ['PostgreSQL', 'database', ['postgresql', 'postgres'], 3],
  ['MySQL', 'database', ['mysql'], 2],
  ['MongoDB', 'database', ['mongodb', 'mongo'], 2],
  ['Redis', 'database', ['redis'], 2],
  ['SQL Server', 'database', ['sql server', 'mssql'], 2],
  ['Oracle', 'database', ['oracle db', 'oracle database'], 2],
  ['Snowflake', 'database', ['snowflake'], 3],
  ['BigQuery', 'database', ['bigquery', 'big query'], 3],
  ['Redshift', 'database', ['redshift'], 3],
  ['Elasticsearch', 'database', ['elasticsearch', 'elastic search'], 2],
  ['Firebase', 'database', ['firebase', 'firestore'], 2],

  // Cloud & DevOps
  ['AWS', 'cloud', ['aws', 'amazon web services', 's3', 'ec2', 'lambda', 'redshift'], 3],
  ['Azure', 'cloud', ['azure', 'microsoft azure'], 3],
  ['GCP', 'cloud', ['gcp', 'google cloud', 'google cloud platform'], 3],
  ['Docker', 'cloud', ['docker', 'containerization', 'containers'], 3],
  ['Kubernetes', 'cloud', ['kubernetes', 'k8s'], 3],
  ['Terraform', 'cloud', ['terraform', 'infrastructure as code', 'iac'], 2],
  ['CI/CD', 'cloud', ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'], 2],
  ['Git', 'cloud', ['git', 'github', 'gitlab', 'version control'], 2],
  ['Linux', 'cloud', ['linux', 'unix'], 2],
  ['Jenkins', 'cloud', ['jenkins'], 1],

  // Concepts & methods
  ['REST API', 'concept', ['rest api', 'restful', 'rest', 'apis', 'api'], 2],
  ['GraphQL', 'concept', ['graphql'], 2],
  ['Microservices', 'concept', ['microservices', 'microservice'], 2],
  ['Agile', 'concept', ['agile', 'scrum', 'kanban', 'sprint'], 2],
  ['System Design', 'concept', ['system design', 'distributed systems', 'scalable', 'scalability'], 2],
  ['Testing', 'concept', ['unit testing', 'integration testing', 'test automation', 'tdd'], 2],
  ['OOP', 'concept', ['object-oriented', 'object oriented', 'oop'], 1],
  ['Data Structures', 'concept', ['data structures', 'algorithms'], 2],
  ['Cybersecurity', 'concept', ['cybersecurity', 'cyber security', 'security', 'fraud detection', 'threat detection'], 2],

  // Soft skills
  ['Communication', 'soft', ['communication', 'communicate', 'presentation', 'presenting'], 1],
  ['Leadership', 'soft', ['leadership', 'lead', 'mentoring', 'mentorship'], 1],
  ['Collaboration', 'soft', ['collaboration', 'collaborate', 'cross-functional', 'teamwork'], 1],
  ['Problem Solving', 'soft', ['problem solving', 'problem-solving', 'analytical', 'critical thinking'], 1],
  ['Project Management', 'soft', ['project management', 'stakeholder', 'stakeholders'], 1],
  ['Adaptability', 'soft', ['adaptability', 'fast-paced', 'self-motivated', 'proactive'], 1],
];

const CATEGORY_LABELS = {
  language: 'Languages',
  framework: 'Frameworks',
  data: 'Data & AI',
  database: 'Databases',
  cloud: 'Cloud & DevOps',
  concept: 'Concepts',
  soft: 'Soft skills',
};

const ACTION_VERBS = [
  'built','built','designed','developed','led','launched','created','implemented',
  'improved','increased','reduced','optimized','automated','delivered','managed',
  'architected','engineered','migrated','scaled','shipped','drove','spearheaded',
  'analyzed','deployed','integrated','streamlined','accelerated','generated',
  'boosted','cut','saved','grew','owned','established','refactored',
];

export function normalizeText(text) {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

// Build a boundary-aware regex for a term that may contain symbols (c++, c#,
// node.js). `\b` doesn't behave around +/#/., so we use alphanumeric lookarounds.
function termRegex(term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![a-z0-9])${escaped}(?![a-z0-9])`, 'i');
}

function hasTerm(haystack, term) {
  try {
    return termRegex(term).test(haystack);
  } catch {
    return haystack.includes(term.toLowerCase());
  }
}

// Which taxonomy skills are present in a block of text.
function detectSkills(text) {
  const low = text.toLowerCase();
  const found = new Map();
  for (const [label, category, aliases, weight] of SKILLS) {
    if (aliases.some((a) => hasTerm(low, a))) {
      found.set(label, { label, category, weight });
    }
  }
  return found;
}

// Legacy keyword extractor, kept for any other callers, but now far stricter.
export function extractKeywords(text) {
  const words = normalizeText(text).toLowerCase().match(/[a-z][a-z0-9#+.-]{2,}/g) ?? [];
  const counts = new Map();
  words.forEach((w) => {
    if (!STOP_WORDS.has(w) && w.length > 3) counts.set(w, (counts.get(w) ?? 0) + 1);
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([w]) => w);
}

// Extra job-specific keywords that aren't in the taxonomy (domain nouns the JD
// repeats). Used as a secondary "also mentioned" signal, not the core score.
function extraJobKeywords(jobText, skillAliases) {
  const words = jobText.toLowerCase().match(/[a-z][a-z0-9+.#-]{3,}/g) ?? [];
  const counts = new Map();
  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    if (skillAliases.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}

function findYears(text) {
  const m = text.toLowerCase().match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/g) ?? [];
  const nums = m.map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n) && n <= 30);
  return nums.length ? Math.max(...nums) : null;
}

const DEGREE_LEVELS = [
  [3, ['phd', 'ph.d', 'doctorate', 'doctoral']],
  [2, ['master', "master's", 'masters', 'msc', 'm.s', 'mba']],
  [1, ['bachelor', "bachelor's", 'bachelors', 'bsc', 'b.s', 'b.eng', 'undergraduate', 'degree in']],
];

function degreeLevel(text) {
  const low = text.toLowerCase();
  for (const [level, terms] of DEGREE_LEVELS) {
    if (terms.some((t) => low.includes(t))) return level;
  }
  return 0;
}

function detectSections(text) {
  const low = text.toLowerCase();
  return {
    experience: /experience|employment|work history|professional/.test(low),
    education: /education|university|college|degree|b\.?s|bachelor/.test(low),
    skills: /skills|technologies|technical|proficient|competenc/.test(low),
    projects: /projects?|portfolio/.test(low),
    summary: /summary|objective|profile|about/.test(low),
  };
}

function detectContact(text) {
  const low = text.toLowerCase();
  return {
    email: /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text),
    phone: /(\+?\d[\d\s().-]{7,}\d)/.test(text),
    linkedin: /linkedin\.com|linkedin/.test(low),
    github: /github\.com|github|gitlab/.test(low),
  };
}

function countQuantified(text) {
  // Bullets / sentences containing numbers, %, money, or scale words.
  const matches = text.match(/(\b\d[\d,.]*\s?%?)|(\$\s?\d)|\b(\d+x)\b/g) ?? [];
  return matches.length;
}

function countActionVerbs(text) {
  const low = text.toLowerCase();
  return new Set(ACTION_VERBS.filter((v) => new RegExp(`\\b${v}`).test(low))).size;
}

function clamp(n, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

export function analyzeATS(jobDesc, cvText) {
  const jobText = normalizeText(jobDesc);
  const resumeText = normalizeText(cvText);
  if (!jobText || !resumeText) return null;

  const jobSkills = detectSkills(jobText);
  const cvSkills = detectSkills(resumeText);
  const cvLow = resumeText.toLowerCase();

  // ── Skill match (weighted) ────────────────────────────────────────────────
  const matchedSkills = [];
  const missingSkills = [];
  let gotWeight = 0;
  let totalWeight = 0;
  for (const skill of jobSkills.values()) {
    totalWeight += skill.weight;
    if (cvSkills.has(skill.label)) {
      gotWeight += skill.weight;
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }
  const skillScore = totalWeight ? Math.round((gotWeight / totalWeight) * 100) : 0;

  // Sort missing by importance (hard skills first).
  missingSkills.sort((a, b) => b.weight - a.weight);
  matchedSkills.sort((a, b) => b.weight - a.weight);

  // ── Extra keywords (secondary signal) ─────────────────────────────────────
  const aliasSet = new Set(SKILLS.flatMap(([, aliases]) => aliases));
  const extraKw = extraJobKeywords(jobText, aliasSet);
  const extraMatched = extraKw.filter((k) => cvLow.includes(k));
  const extraMissing = extraKw.filter((k) => !cvLow.includes(k));

  // ── Experience ────────────────────────────────────────────────────────────
  const jobYears = findYears(jobText);
  const cvYears = findYears(resumeText);
  let expScore = 70; // neutral when JD doesn't specify
  let expNote = 'No specific experience requirement detected.';
  if (jobYears != null) {
    if (cvYears == null) {
      expScore = 45;
      expNote = `Job asks for ~${jobYears}+ years; none clearly stated on your resume.`;
    } else if (cvYears >= jobYears) {
      expScore = 100;
      expNote = `You meet the ~${jobYears}+ year requirement (resume shows ${cvYears}).`;
    } else {
      expScore = clamp(Math.round((cvYears / jobYears) * 100));
      expNote = `Job wants ~${jobYears}+ years; resume signals ~${cvYears}.`;
    }
  }

  // ── Education ──────────────────────────────────────────────────────────────
  const jobDeg = degreeLevel(jobText);
  const cvDeg = degreeLevel(resumeText);
  let eduScore = 100;
  let eduNote = 'No specific degree requirement detected.';
  if (jobDeg > 0) {
    if (cvDeg >= jobDeg) {
      eduScore = 100;
      eduNote = 'Your education meets the requirement.';
    } else if (cvDeg > 0) {
      eduScore = 70;
      eduNote = 'You have a degree, but a higher level may be preferred.';
    } else {
      eduScore = 40;
      eduNote = 'Job mentions a degree requirement not found on your resume.';
    }
  }

  // ── Measurable impact ─────────────────────────────────────────────────────
  const quantified = countQuantified(resumeText);
  const actionVerbs = countActionVerbs(resumeText);
  const impactScore = clamp(Math.round(Math.min(quantified, 8) / 8 * 60 + Math.min(actionVerbs, 8) / 8 * 40));

  // ── ATS readiness (structure + contact + length) ──────────────────────────
  const sections = detectSections(resumeText);
  const contact = detectContact(resumeText);
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const sectionScore = (['experience', 'education', 'skills'].filter((s) => sections[s]).length / 3) * 100;
  const contactScore = (['email', 'phone'].filter((c) => contact[c]).length / 2) * 100;
  let lengthScore = 100;
  if (wordCount < 200) lengthScore = 55;
  else if (wordCount > 1200) lengthScore = 70;
  const atsScore = Math.round(sectionScore * 0.5 + contactScore * 0.3 + lengthScore * 0.2);

  // ── Overall weighted score ────────────────────────────────────────────────
  const dimensions = [
    { key: 'skills', label: 'Skills & keyword match', score: skillScore, weight: 0.5 },
    { key: 'experience', label: 'Experience alignment', score: expScore, weight: 0.12, note: expNote },
    { key: 'education', label: 'Education', score: eduScore, weight: 0.08, note: eduNote },
    { key: 'impact', label: 'Measurable impact', score: impactScore, weight: 0.12 },
    { key: 'ats', label: 'ATS readiness', score: atsScore, weight: 0.18 },
  ];
  const overall = Math.round(dimensions.reduce((sum, d) => sum + d.score * d.weight, 0));

  // ── Suggestions (prioritised, actionable) ─────────────────────────────────
  const suggestions = [];
  const topMissing = missingSkills.filter((s) => s.weight >= 2).slice(0, 6);
  if (topMissing.length) {
    suggestions.push({
      priority: 'high',
      text: `Add the missing high-value skills the job calls for: ${topMissing.map((s) => s.label).join(', ')}, but only where they're honestly true.`,
    });
  }
  if (jobYears != null && cvYears != null && cvYears < jobYears) {
    suggestions.push({
      priority: 'high',
      text: `Job targets ~${jobYears}+ years. Make your total relevant experience explicit (internships, freelance, and projects count).`,
    });
  }
  if (quantified < 3) {
    suggestions.push({
      priority: 'high',
      text: 'Quantify your impact. Replace duties with results that have numbers (e.g. "cut load time 40%", "processed 2M rows daily").',
    });
  }
  if (!contact.email || !contact.phone) {
    suggestions.push({
      priority: 'high',
      text: `Add missing contact details (${[!contact.email && 'email', !contact.phone && 'phone'].filter(Boolean).join(' and ')}), ATS parsers expect them in plain text.`,
    });
  }
  if (!contact.linkedin || !contact.github) {
    suggestions.push({
      priority: 'medium',
      text: `Include your ${[!contact.linkedin && 'LinkedIn', !contact.github && 'GitHub'].filter(Boolean).join(' and ')} URL, recruiters look for them.`,
    });
  }
  ['skills', 'experience', 'education'].forEach((s) => {
    if (!sections[s]) {
      suggestions.push({
        priority: 'medium',
        text: `Add a clearly labelled "${s.charAt(0).toUpperCase() + s.slice(1)}" section, ATS systems parse by standard headings.`,
      });
    }
  });
  if (actionVerbs < 4) {
    suggestions.push({
      priority: 'medium',
      text: 'Start bullets with strong action verbs (Built, Designed, Led, Automated) instead of "responsible for".',
    });
  }
  if (extraMissing.length) {
    suggestions.push({
      priority: 'low',
      text: `The posting also repeats: ${extraMissing.slice(0, 6).join(', ')}. Mirror the relevant terms in your wording.`,
    });
  }
  if (wordCount < 200) {
    suggestions.push({ priority: 'medium', text: 'Your resume looks short, add more detail on projects and impact.' });
  } else if (wordCount > 1200) {
    suggestions.push({ priority: 'low', text: 'Resume is long, tighten to the most relevant 1–2 pages.' });
  }

  // Group matched/missing skills by category for display.
  const groupByCategory = (list) => {
    const groups = {};
    for (const s of list) {
      (groups[s.category] ??= []).push(s.label);
    }
    return Object.entries(groups).map(([category, items]) => ({
      category,
      label: CATEGORY_LABELS[category] ?? category,
      items,
    }));
  };

  return {
    score: overall,
    verdict:
      overall >= 75 ? 'Strong match' : overall >= 55 ? 'Decent match' : overall >= 35 ? 'Needs work' : 'Weak match',
    dimensions,
    matched: matchedSkills.map((s) => s.label),
    missing: missingSkills.map((s) => s.label),
    matchedGroups: groupByCategory(matchedSkills),
    missingGroups: groupByCategory(missingSkills),
    extraMatched,
    extraMissing,
    suggestions,
    stats: {
      jobYears,
      cvYears,
      quantified,
      actionVerbs,
      wordCount,
      sections,
      contact,
      skillsRequired: jobSkills.size,
      skillsMatched: matchedSkills.length,
    },
  };
}
