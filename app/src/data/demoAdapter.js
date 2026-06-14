import { buildDemoData } from './demo';

/**
 * Demo adapter, an in-memory Firestore stand-in.
 *
 * Same five-method interface as firestoreAdapter, backed by a Map seeded
 * from the bundled "Jane Doe" fixtures. Mutations notify subscribers, so
 * approving a CV really moves the card across the pipeline. Nothing is
 * persisted; refresh = reset.
 */
let store = buildDemoData();
const listeners = new Map(); // collection -> Set<fn>

let counter = 0;
const newId = () => `demo-${Date.now().toString(36)}-${(counter += 1)}`;

function emit(name) {
  const docs = [...(store.get(name)?.values() ?? [])];
  for (const fn of listeners.get(name) ?? []) fn(docs);
}

function docsOf(name) {
  if (!store.has(name)) store.set(name, new Map());
  return store.get(name);
}

export const demoAdapter = {
  subscribeCollection(name, callback) {
    if (!listeners.has(name)) listeners.set(name, new Set());
    listeners.get(name).add(callback);
    callback([...docsOf(name).values()]); // snapshot semantics: emit immediately
    return () => listeners.get(name)?.delete(callback);
  },

  subscribeDoc(name, id, callback) {
    const wrapped = (docs) => callback(docs.find((d) => d.id === id) ?? null);
    return this.subscribeCollection(name, wrapped);
  },

  async addDoc(name, data) {
    const id = newId();
    const now = new Date().toISOString();
    docsOf(name).set(id, { id, ...data, createdAt: now, updatedAt: now });
    emit(name);
    return id;
  },

  async updateDoc(name, id, patch) {
    const current = docsOf(name).get(id);
    if (!current) return;
    docsOf(name).set(id, { ...current, ...patch, updatedAt: new Date().toISOString() });
    emit(name);
  },

  async setDoc(name, id, data) {
    const current = docsOf(name).get(id) ?? { id };
    docsOf(name).set(id, { ...current, ...data, updatedAt: new Date().toISOString() });
    emit(name);
  },

  async deleteDoc(name, id) {
    docsOf(name).delete(id);
    emit(name);
  },
};

/** Settings → "Reset demo data". */
export function resetDemo() {
  store = buildDemoData();
  for (const name of listeners.keys()) emit(name);
}

/**
 * Ambient life: every so often an agent briefly flips to "running" so the
 * demo dashboard feels alive without a backend.
 */
function startAmbientTicks() {
  setInterval(() => {
    const agents = store.get('agents');
    if (!agents) return;
    const ids = [...agents.keys()];
    const id = ids[Math.floor(Math.random() * ids.length)];
    const agent = agents.get(id);
    if (!agent || agent.status === 'error' || !agent.enabled) return;

    agents.set(id, { ...agent, status: 'running', runningSince: new Date().toISOString() });
    emit('agents');

    setTimeout(() => {
      const current = store.get('agents')?.get(id);
      if (!current || current.status !== 'running') return;
      agents.set(id, {
        ...current,
        status: 'idle',
        runningSince: null,
        lastRun: new Date().toISOString(),
        runCount: (current.runCount ?? 0) + 1,
      });
      emit('agents');
    }, 6000 + Math.random() * 6000);
  }, 25000);
}

if (typeof window !== 'undefined') startAmbientTicks();
