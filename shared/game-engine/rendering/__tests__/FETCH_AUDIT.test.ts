import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { DIRECT_FETCH_CALLS, type FetchCallSite } from '../FETCH_AUDIT';

const GAME_DIR = path.resolve(__dirname, '..');

describe('FETCH_AUDIT', () => {
  it('exports a non-empty catalog', () => {
    expect(DIRECT_FETCH_CALLS.length).toBeGreaterThan(0);
  });

  it('every entry has required fields', () => {
    for (const entry of DIRECT_FETCH_CALLS) {
      expect(entry.file).toBeTruthy();
      expect(entry.line).toBeGreaterThan(0);
      expect(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).toContain(entry.method);
      expect(entry.endpoint).toMatch(/^\/api\//);
      expect(entry.category).toBeTruthy();
      expect(entry.description).toBeTruthy();
    }
  });

  it('every referenced file exists', () => {
    const uniqueFiles = [...new Set(DIRECT_FETCH_CALLS.map((e) => e.file))];
    for (const file of uniqueFiles) {
      const fullPath = path.join(GAME_DIR, file);
      expect(fs.existsSync(fullPath), `${file} should exist`).toBe(true);
    }
  });

  it('every referenced line contains a fetch call', () => {
    const failures: string[] = [];
    for (const entry of DIRECT_FETCH_CALLS) {
      const fullPath = path.join(GAME_DIR, entry.file);
      const lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
      const line = lines[entry.line - 1]; // 1-indexed
      if (!line || !line.includes('fetch')) {
        failures.push(`${entry.file}:${entry.line} — expected fetch call, got: ${line?.trim()}`);
      }
    }
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  it('no duplicate entries (same file + line)', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const entry of DIRECT_FETCH_CALLS) {
      const key = `${entry.file}:${entry.line}`;
      if (seen.has(key)) dupes.push(key);
      seen.add(key);
    }
    expect(dupes, `Duplicate entries: ${dupes.join(', ')}`).toHaveLength(0);
  });

  it('catalog does not include DataSource.ts or ConversationClient.ts calls', () => {
    const abstracted = DIRECT_FETCH_CALLS.filter(
      (e) => e.file === 'DataSource.ts' || e.file === 'ConversationClient.ts',
    );
    expect(abstracted, 'These files are already abstracted').toHaveLength(0);
  });

  it('detects if new fetch calls appear in 3DGame files not in catalog', () => {
    const catalogKeys = new Set(DIRECT_FETCH_CALLS.map((e) => `${e.file}:${e.line}`));
    // Files already abstracted — skip them
    const skipFiles = new Set(['DataSource.ts', 'ConversationClient.ts', 'FETCH_AUDIT.ts']);

    const tsFiles = fs.readdirSync(GAME_DIR).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));
    const uncataloged: string[] = [];

    for (const file of tsFiles) {
      if (skipFiles.has(file)) continue;
      const fullPath = path.join(GAME_DIR, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Match fetch('/api/... or fetch(`/api/... or fetch("/api/...
        if (/fetch\s*\(\s*[`'"]\/?api\//.test(line) || /fetch\s*\(\s*`\$\{[^}]+\}\/api\//.test(line)) {
          const key = `${file}:${i + 1}`;
          if (!catalogKeys.has(key)) {
            uncataloged.push(key);
          }
        }
      }
    }

    expect(
      uncataloged,
      `Uncataloged fetch calls found — update FETCH_AUDIT.ts:\n${uncataloged.join('\n')}`,
    ).toHaveLength(0);
  });
});
