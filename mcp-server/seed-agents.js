/**
 * Seed/repair the `agents`, `agentInstructions`, and `agentMemory` collections.
 *
 *   cd mcp-server && npm run seed
 *
 * Normally the setup agent does this for you (docs/SETUP.md step 10), this
 * script is the manual fallback.
 *
 * Idempotent and non-destructive: missing docs get full defaults; existing
 * docs only receive the new fields they lack, so live counters, status, and
 * any user-edited instructions are never reset. Doc ID = slug for all three
 * collections so agent writes and UI reads always hit the same document.
 */

import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const HERE = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(HERE, '.env'), quiet: true });

const serviceAccountPath = resolve(HERE, process.env.SERVICE_ACCOUNT_PATH || './service-account.json');
if (!existsSync(serviceAccountPath)) {
  console.error(`Service account key not found at ${serviceAccountPath}, see docs/SETUP.md step 7.`);
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
const { FieldValue } = admin.firestore;

const AGENT_DEFS = [
  { id: 'job-search', name: 'Job Search', intervalMinutes: 60, scheduleLabel: 'Every hour' },
  { id: 'job-analysis', name: 'Job Analysis', intervalMinutes: 60, scheduleLabel: 'Every hour' },
  { id: 'cv-creation', name: 'CV Creation', intervalMinutes: 60, scheduleLabel: 'Every hour' },
  { id: 'application-writer', name: 'Application Writer', intervalMinutes: 60, scheduleLabel: 'Every hour' },
  { id: 'connection-builder', name: 'Connection Builder', intervalMinutes: 120, scheduleLabel: 'Every 2 hours' },
  { id: 'career-advisor', name: 'Career Advisor', intervalMinutes: 1440, scheduleLabel: 'Daily at 8 AM' },
  { id: 'manager', name: 'Manager', intervalMinutes: 720, scheduleLabel: '8 AM & 8 PM' },
];

function defaultAgentDoc(def) {
  return {
    id: def.id,
    name: def.name,
    status: 'idle',
    enabled: true,
    lastRun: null,
    nextRun: null,
    runningSince: null,
    lastAction: 'Not yet run',
    lastRunDurationSeconds: null,
    runCount: 0,
    errorCount: 0,
    pendingApprovals: 0,
    errorMessage: '',
    intervalMinutes: def.intervalMinutes,
    scheduleLabel: def.scheduleLabel,
  };
}

console.log('Seeding agents / agentInstructions / agentMemory…');

for (const def of AGENT_DEFS) {
  const agentRef = db.collection('agents').doc(def.id);
  const agentSnap = await agentRef.get();
  if (!agentSnap.exists) {
    await agentRef.set({ ...defaultAgentDoc(def), updatedAt: FieldValue.serverTimestamp() });
    console.log(`  + agents/${def.id} (created)`);
  } else {
    const data = agentSnap.data();
    const patch = { id: def.id, updatedAt: FieldValue.serverTimestamp() };
    if (data.name == null) patch.name = def.name;
    if (data.intervalMinutes == null) patch.intervalMinutes = def.intervalMinutes;
    if (data.scheduleLabel == null) patch.scheduleLabel = def.scheduleLabel;
    if (data.runningSince === undefined) patch.runningSince = null;
    if (data.lastRunDurationSeconds === undefined) patch.lastRunDurationSeconds = null;
    await agentRef.set(patch, { merge: true });
    console.log(`  ~ agents/${def.id} (patched new fields, state preserved)`);
  }

  const insRef = db.collection('agentInstructions').doc(def.id);
  if (!(await insRef.get()).exists) {
    await insRef.set({ id: def.id, instructions: '', readBy: [], updatedAt: FieldValue.serverTimestamp() });
    console.log(`  + agentInstructions/${def.id}`);
  }

  const memRef = db.collection('agentMemory').doc(def.id);
  if (!(await memRef.get()).exists) {
    await memRef.set({ id: def.id, lastRunAt: null, updatedAt: FieldValue.serverTimestamp() });
    console.log(`  + agentMemory/${def.id}`);
  }
}

console.log(`Done. ${AGENT_DEFS.length} agents ensured.`);
process.exit(0);
