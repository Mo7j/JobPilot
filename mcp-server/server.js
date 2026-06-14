/**
 * JobPilot MCP server, gives Claude direct read/write access to YOUR Firestore.
 *
 * Setup (full steps in docs/SETUP.md):
 *   1. Download a service-account key from your Firebase project
 *      (Project settings → Service accounts → Generate new private key).
 *   2. Save it OUTSIDE the repo, or as mcp-server/service-account.json
 *      (that filename is gitignored).
 *   3. Register this server in Claude Desktop / Claude Code (see README.md).
 *
 * The service-account path can be overridden with SERVICE_ACCOUNT_PATH
 * (absolute path, or relative to this folder), via env or mcp-server/.env.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import admin from 'firebase-admin';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { z } from 'zod';

const HERE = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(HERE, '.env'), quiet: true });

// ── Firebase Admin ──
const serviceAccountPath = resolve(HERE, process.env.SERVICE_ACCOUNT_PATH || './service-account.json');

if (!existsSync(serviceAccountPath)) {
  console.error(
    [
      '',
      '✗ JobPilot MCP: service account key not found.',
      `  Looked for: ${serviceAccountPath}`,
      '',
      '  Fix: Firebase console → Project settings → Service accounts →',
      '  "Generate new private key", then either:',
      '    • save it as mcp-server/service-account.json (gitignored), or',
      '    • set SERVICE_ACCOUNT_PATH in mcp-server/.env',
      '',
      '  Full walkthrough: docs/SETUP.md (step 7).',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const COLLECTIONS =
  'jobCases | approvalQueue | agents | agentInstructions | agentMemory | agentReports | notifications | trends | systemLogs | careerAdvice | jobs | meta | settings';

// Serialize Firestore Timestamps to full ISO strings so agents can do time math.
function serialize(val) {
  if (val === null || val === undefined) return val;
  if (val?.toDate) return val.toDate().toISOString();
  if (Array.isArray(val)) return val.map(serialize);
  if (typeof val === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(val)) out[k] = serialize(v);
    return out;
  }
  return val;
}

const server = new McpServer({ name: 'jobpilot', version: '1.0.0' });

// ── TOOL: list_collection ──
server.tool(
  'list_collection',
  'Read all documents from a Firestore collection. Use this first to see existing data and get document IDs.',
  { collection: z.string().describe(COLLECTIONS) },
  async ({ collection }) => {
    const snap = await db.collection(collection).get();
    const docs = snap.docs.map((d) => serialize({ id: d.id, ...d.data() }));
    return { content: [{ type: 'text', text: JSON.stringify(docs, null, 2) }] };
  },
);

// ── TOOL: get_document ──
server.tool(
  'get_document',
  'Read a single document by ID.',
  {
    collection: z.string().describe(COLLECTIONS),
    id: z.string().describe('Document ID'),
  },
  async ({ collection, id }) => {
    const snap = await db.collection(collection).doc(id).get();
    if (!snap.exists) {
      return { content: [{ type: 'text', text: `Document ${collection}/${id} does not exist.` }] };
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(serialize({ id: snap.id, ...snap.data() }), null, 2) }],
    };
  },
);

// ── TOOL: add_document ──
server.tool(
  'add_document',
  'Add a new document with an auto-generated ID. Use for jobCases, approvalQueue items, notifications, agentReports, systemLogs, careerAdvice.',
  {
    collection: z.string().describe(COLLECTIONS),
    data: z.record(z.any()).describe('Document fields to save'),
  },
  async ({ collection, data }) => {
    const ref = await db.collection(collection).add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { content: [{ type: 'text', text: `Created document ${ref.id} in ${collection}` }] };
  },
);

// ── TOOL: set_document ──
server.tool(
  'set_document',
  'Create or merge a document with a SPECIFIC ID. Use for slug-keyed docs: agents/{slug}, agentMemory/{slug}, agentInstructions/{slug}, meta/*, settings/user. Merges with existing fields.',
  {
    collection: z.string().describe(COLLECTIONS),
    id: z.string().describe('Document ID (e.g. the agent slug)'),
    data: z.record(z.any()).describe('Fields to set (merged into the existing doc)'),
  },
  async ({ collection, id, data }) => {
    await db
      .collection(collection)
      .doc(id)
      .set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return { content: [{ type: 'text', text: `Set ${collection}/${id}` }] };
  },
);

// ── TOOL: update_document ──
server.tool(
  'update_document',
  'Update specific fields on an EXISTING document (fails if it does not exist, use set_document for create-or-merge).',
  {
    collection: z.string().describe(COLLECTIONS),
    id: z.string().describe('Document ID (get it from list_collection first)'),
    data: z.record(z.any()).describe('Fields to update'),
  },
  async ({ collection, id, data }) => {
    await db
      .collection(collection)
      .doc(id)
      .update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return { content: [{ type: 'text', text: `Updated ${collection}/${id}` }] };
  },
);

// ── TOOL: delete_document ──
server.tool(
  'delete_document',
  'Delete a single document by ID.',
  {
    collection: z.string().describe(COLLECTIONS),
    id: z.string().describe('Document ID'),
  },
  async ({ collection, id }) => {
    await db.collection(collection).doc(id).delete();
    return { content: [{ type: 'text', text: `Deleted ${collection}/${id}` }] };
  },
);

// ── TOOL: send_push ──
server.tool(
  'send_push',
  "Send a push notification to the owner's device via FCM. Reads the FCM token from settings/user (the owner enables push in the app's Settings). Use for urgent items: approvals waiting, errors, deadlines.",
  {
    title: z.string().describe('Notification title'),
    body: z.string().describe('Notification body text'),
    data: z.record(z.string()).optional().describe('Optional key/value payload'),
  },
  async ({ title, body, data }) => {
    const settingsSnap = await db.collection('settings').doc('user').get();
    const token = settingsSnap.data()?.fcmToken;
    if (!token) {
      return {
        content: [
          {
            type: 'text',
            text: 'No FCM token in settings/user, the owner has not enabled push notifications in the app yet. Write a notifications doc instead.',
          },
        ],
      };
    }
    const result = await admin.messaging().send({ token, data: { title, body, ...(data ?? {}) } });
    return { content: [{ type: 'text', text: `Push sent. FCM message ID: ${result}` }] };
  },
);

// ── TOOL: clear_collection ──
server.tool(
  'clear_collection',
  'DESTRUCTIVE: delete ALL documents in a collection. Only use after the user explicitly confirms, naming the collection.',
  { collection: z.string().describe('Collection to clear') },
  async ({ collection }) => {
    const snap = await db.collection(collection).get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return { content: [{ type: 'text', text: `Cleared ${snap.size} documents from ${collection}` }] };
  },
);

// ── Start ──
const transport = new StdioServerTransport();
await server.connect(transport);
