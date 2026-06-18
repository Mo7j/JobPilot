// Central place for links + structured content used across sections.

export const GITHUB_URL = 'https://github.com/Mo7j/JobPilot';
export const DEMO_URL = 'https://7js-jobpilot.netlify.app';
export const DEMO_EMBED_URL = 'https://7js-jobpilot.netlify.app';
export const SETUP_URL = `${GITHUB_URL}/blob/main/docs/SETUP.md`;

import faceJobSearch from './assets/agents/job-search.png';
import faceJobAnalysis from './assets/agents/job-analysis.png';
import faceCv from './assets/agents/cv-creation.png';
import faceApp from './assets/agents/application-writer.png';
import faceConn from './assets/agents/connection-builder.png';
import faceAdvisor from './assets/agents/career-advisor.png';
import faceManager from './assets/agents/manager.png';

export const AGENTS = [
  {
    slug: 'job-search',
    name: 'Job Search',
    cadence: 'Every 5 hours',
    face: faceJobSearch,
    blurb: 'Hunts fresh postings on your platforms, filters out the noise, and queues only real matches.',
  },
  {
    slug: 'job-analysis',
    name: 'Job Analysis',
    cadence: 'Every 5 hours',
    face: faceJobAnalysis,
    blurb: 'Scores every role 0–100 against your honest profile and researches the company for you.',
    gated: true,
  },
  {
    slug: 'cv-creation',
    name: 'CV Creation',
    cadence: 'Every 5 hours',
    face: faceCv,
    blurb: 'Drafts a tailored one-page CV per role, and asks you first instead of inventing experience.',
    gated: true,
  },
  {
    slug: 'application-writer',
    name: 'Application Writer',
    cadence: 'Every 5 hours',
    face: faceApp,
    blurb: 'Fills the whole application form, screenshots it, and stops dead before the submit button.',
    gated: true,
  },
  {
    slug: 'connection-builder',
    name: 'Connection Builder',
    cadence: 'Every 2 hours',
    face: faceConn,
    blurb: 'Grows your LinkedIn network around active applications, within strict, safe limits.',
    gated: true,
  },
  {
    slug: 'career-advisor',
    name: 'Career Advisor',
    cadence: 'Daily',
    face: faceAdvisor,
    blurb: 'Mines weeks of market data to find the skill gaps actually costing you matches.',
  },
  {
    slug: 'manager',
    name: 'Manager',
    cadence: '8 AM & 8 PM',
    face: faceManager,
    blurb: 'Checks the crew’s health twice a day, reviews quality, and coaches the other agents.',
  },
];

export const FAQS = [
  {
    q: 'What does it cost to run?',
    a: 'JobPilot itself is free and MIT-licensed. You bring your own Claude subscription (the agents run on your Claude) and a Firebase project. The free Spark tier is plenty for one person’s job search.',
  },
  {
    q: 'Can it apply to jobs without me noticing?',
    a: 'No, that’s the core design rule. Every irreversible action (submitting an application, sending a connection note) stops in the approval queue until you tap Approve in the app. The agents prepare; you press the button.',
  },
  {
    q: 'Where does my data live?',
    a: 'In YOUR Firebase project, full stop. You create it, you hold the keys, and the app + agents talk only to it. There is no JobPilot server, no analytics, no third party in the loop.',
  },
  {
    q: 'I’m not a developer in Berlin, does it work for my field and country?',
    a: 'Yes. The setup agent interviews you about your background, target roles, and market, then generates your profile, a market playbook for your country (platforms, employers, salary norms), and even a CV design unique to you. Nothing about your field is hardcoded.',
  },
  {
    q: 'Why do two users get different CV designs?',
    a: 'The setup agent picks your CV typography, colors, layout, and spacing from over 1,000 combinations, seeded from your identity and adjusted to your taste. Recruiters in your market won’t see the same template twice.',
  },
  {
    q: 'What’s the difference between the demo and the real thing?',
    a: 'The demo runs entirely in your browser on sample data (Jane Doe’s job search), no backend, nothing saved. The real thing connects to your own Firebase and your own Claude, and the crew actually works.',
  },
];

export const SETUP_STEPS = [
  { n: 1, title: 'Clone & install', body: 'git clone, npm install. One repo has the app, the agents, and the bridge.' },
  { n: 2, title: 'Create YOUR Firebase', body: 'Your own free project, your data never touches anyone else’s server.' },
  { n: 3, title: 'Configure the app', body: 'Paste the Firebase config into .env, deploy the security rules, run or host the dashboard.' },
  { n: 4, title: 'Bridge Claude', body: 'Register the tiny MCP server so your Claude can read and write your Firestore.' },
  { n: 5, title: 'Connect the tools', body: 'Claude in Chrome for browsing and forms, Google Drive for files on your phone.' },
  { n: 6, title: 'Run the setup agent', body: 'It interviews you, builds your profile + unique CV design, seeds the crew, and smoke-tests the loop.' },
];
