/**
 * Engine Drift Detector
 *
 * Compares SHA-256 hashes of tracked game-system source files against the
 * hashes recorded in shared/game-engine/drift-manifest.json.
 *
 * Exit codes:
 *   0 — no drift detected (or --update mode completed successfully)
 *   1 — drift detected (source files changed since manifest was last updated)
 *   2 — usage / file error
 *
 * Usage:
 *   tsx scripts/check-engine-drift.ts          # check mode (for pre-commit hook)
 *   tsx scripts/check-engine-drift.ts --update # update mode: recompute all hashes
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Types ───────────────────────────────────────────────────────────────────

interface EngineMapping {
  engine: 'babylon' | 'unreal' | 'unity' | 'godot';
  /** Path relative to repo root */
  templatePath: string;
  description?: string;
}

interface TrackedFile {
  /** Path relative to repo root */
  path: string;
  description: string;
  /** SHA-256 hex hash recorded at last `drift:update` run. Empty string = not yet initialized. */
  hash: string;
  engineMappings: EngineMapping[];
}

interface DriftManifest {
  version: string;
  description: string;
  lastUpdated: string;
  trackedFiles: TrackedFile[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sha256(filePath: string): string {
  if (!existsSync(filePath)) return '';
  const content = readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex');
}

function loadManifest(): DriftManifest {
  const manifestPath = join(ROOT, 'shared', 'game-engine', 'drift-manifest.json');
  if (!existsSync(manifestPath)) {
    console.error('[drift] drift-manifest.json not found at', manifestPath);
    process.exit(2);
  }
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as DriftManifest;
}

function saveManifest(manifest: DriftManifest): void {
  const manifestPath = join(ROOT, 'shared', 'game-engine', 'drift-manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

// ─── Check mode ──────────────────────────────────────────────────────────────

function runCheck(): void {
  const manifest = loadManifest();
  const driftedFiles: Array<{ file: TrackedFile; currentHash: string }> = [];
  const uninitializedFiles: TrackedFile[] = [];

  for (const file of manifest.trackedFiles) {
    if (!file.hash) {
      uninitializedFiles.push(file);
      continue;
    }
    const absPath = join(ROOT, file.path);
    const currentHash = sha256(absPath);
    if (currentHash !== file.hash) {
      driftedFiles.push({ file, currentHash });
    }
  }

  if (uninitializedFiles.length > 0) {
    console.warn('[drift] The following files have not been hashed yet. Run `npm run drift:update` to initialize:');
    for (const f of uninitializedFiles) {
      console.warn(`  • ${f.path}`);
    }
  }

  if (driftedFiles.length === 0) {
    console.log('[drift] ✓ No engine drift detected.');
    process.exit(0);
  }

  console.error('\n[drift] ✗ Engine drift detected! The following source files have changed:\n');

  for (const { file } of driftedFiles) {
    console.error(`  • ${file.path}`);
    console.error(`    ${file.description}`);
    console.error(`    Affects exports in:`);
    for (const mapping of file.engineMappings) {
      console.error(`      [${mapping.engine.padEnd(7)}] ${mapping.templatePath}`);
    }
    console.error('');
  }

  console.error('[drift] Action required:');
  console.error('  1. Update the corresponding export templates listed above.');
  console.error('  2. Run `npm run drift:update` to record the new hashes.');
  console.error('  3. Commit the updated templates and drift-manifest.json together.\n');
  process.exit(1);
}

// ─── Update mode ─────────────────────────────────────────────────────────────

function runUpdate(): void {
  const manifest = loadManifest();
  let updated = 0;

  for (const file of manifest.trackedFiles) {
    const absPath = join(ROOT, file.path);
    const newHash = sha256(absPath);
    if (!newHash) {
      console.warn(`[drift] Warning: file not found, skipping hash: ${file.path}`);
      continue;
    }
    if (file.hash !== newHash) {
      file.hash = newHash;
      updated++;
    }
  }

  manifest.lastUpdated = new Date().toISOString();
  saveManifest(manifest);

  if (updated > 0) {
    console.log(`[drift] ✓ Updated hashes for ${updated} file(s) in drift-manifest.json`);
  } else {
    console.log('[drift] ✓ All hashes were already up to date.');
  }
}

// ─── Entrypoint ──────────────────────────────────────────────────────────────

const mode = process.argv.includes('--update') ? 'update' : 'check';

if (mode === 'update') {
  runUpdate();
} else {
  runCheck();
}
