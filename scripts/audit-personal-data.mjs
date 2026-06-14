#!/usr/bin/env node
/**
 * Personal-data & secrets audit.
 *
 * Scans every text file in the repo (excluding references/, node_modules/,
 * dist/, .git/) for secret material and personal data, then exits non-zero
 * if anything forbidden is found. Run it before every commit:
 *
 *   npm run audit:secrets
 *
 * Built-in patterns catch generic secrets (API keys, private keys, service
 * accounts). Your OWN personal patterns (email, phone, project IDs, employer
 * names, ...) belong in `scripts/audit-patterns.local.txt`, that file is
 * gitignored so the patterns themselves never reach the public repo.
 *
 * audit-patterns.local.txt format (one rule per line):
 *   forbid:some-string-that-must-never-appear
 *   review:some-string-that-needs-a-human-look
 *   # comments and blank lines are ignored
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(import.meta.url), '..', '..');

const SKIP_DIRS = new Set([
  'references', 'node_modules', 'dist', 'dev-dist', '.git', '.netlify', '.claude',
]);
const SKIP_FILES = new Set([
  'audit-personal-data.mjs', 'audit-patterns.local.txt', 'package-lock.json',
  '.gitignore', // contains ignore *rules* for secret filenames, not secrets
]);
const TEXT_EXT = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.md', '.html', '.css',
  '.txt', '.yml', '.yaml', '.toml', '.rules', '.svg', '.env', '.example', '',
]);

// Generic secret signatures, safe to commit, they identify *kinds* of secrets.
const BUILTIN_FORBID = [
  'BEGIN PRIVATE KEY',
  'BEGIN RSA PRIVATE KEY',
  'firebase-adminsdk',
  '"private_key"',
  'AIza', // Google API key prefix
];

function loadLocalPatterns() {
  const file = join(ROOT, 'scripts', 'audit-patterns.local.txt');
  const forbid = [];
  const review = [];
  if (existsSync(file)) {
    for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      if (line.startsWith('forbid:')) forbid.push(line.slice(7));
      else if (line.startsWith('review:')) review.push(line.slice(7));
    }
  }
  return { forbid, review };
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(join(dir, entry.name));
    } else if (!SKIP_FILES.has(entry.name)) {
      yield join(dir, entry.name);
    }
  }
}

const { forbid: localForbid, review } = loadLocalPatterns();
const forbid = [...BUILTIN_FORBID, ...localForbid];
const hits = [];
const warnings = [];
let scanned = 0;

for (const file of walk(ROOT)) {
  if (!TEXT_EXT.has(extname(file).toLowerCase())) continue;
  if (statSync(file).size > 2 * 1024 * 1024) continue; // skip big binaries-in-disguise
  const rel = relative(ROOT, file);
  const text = readFileSync(file, 'utf8');
  const lower = text.toLowerCase();
  scanned += 1;

  for (const pattern of forbid) {
    if (lower.includes(pattern.toLowerCase())) {
      const line = text.split(/\r?\n/).findIndex((l) => l.toLowerCase().includes(pattern.toLowerCase())) + 1;
      hits.push({ rel, pattern, line });
    }
  }
  for (const pattern of review) {
    if (lower.includes(pattern.toLowerCase())) {
      const line = text.split(/\r?\n/).findIndex((l) => l.toLowerCase().includes(pattern.toLowerCase())) + 1;
      warnings.push({ rel, pattern, line });
    }
  }
}

console.log(`Scanned ${scanned} text files.`);

if (warnings.length) {
  console.log('\n⚠ REVIEW (allowed only in intended places, e.g. attribution):');
  for (const w of warnings) console.log(`  ${w.rel}:${w.line}  →  "${w.pattern}"`);
}

if (hits.length) {
  console.error('\n✗ FORBIDDEN content found, do NOT commit until removed:');
  for (const h of hits) console.error(`  ${h.rel}:${h.line}  →  "${h.pattern}"`);
  process.exit(1);
}

console.log(`\n✓ No forbidden content found.${localForbid.length === 0 ? '\n  (tip: add your personal patterns to scripts/audit-patterns.local.txt)' : ''}`);
