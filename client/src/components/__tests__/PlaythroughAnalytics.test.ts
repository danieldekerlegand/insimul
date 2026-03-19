/**
 * Tests for PlaythroughAnalytics read-only contract.
 *
 * PlaythroughAnalytics is a research dashboard for world owners.
 * It MUST remain read-only — no playthrough creation, deletion, or mutation.
 * Playthrough lifecycle is managed exclusively in-game (MainMenuSystem / GameMenuSystem).
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the component source for static analysis
const componentSource = fs.readFileSync(
  path.resolve(__dirname, '../PlaythroughAnalytics.tsx'),
  'utf-8',
);

// ─── Pure helper functions (mirrored from component) ─────────────────────────

interface Playthrough {
  id: string;
  userId: string;
  worldId: string;
  name?: string;
  status: string;
  currentTimestep?: number;
  playtime?: number;
  actionsCount?: number;
  createdAt: string;
  lastPlayedAt?: string;
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupPlaythroughsByStatus(playthroughs: Playthrough[]): Map<string, Playthrough[]> {
  const groups = new Map<string, Playthrough[]>();
  playthroughs.forEach(p => {
    const status = p.status || 'unknown';
    if (!groups.has(status)) groups.set(status, []);
    groups.get(status)!.push(p);
  });
  return groups;
}

function computeStats(playthroughs: Playthrough[]) {
  const totalPlaytime = playthroughs.reduce((sum, p) => sum + (p.playtime || 0), 0);
  const totalActions = playthroughs.reduce((sum, p) => sum + (p.actionsCount || 0), 0);
  const activePlayers = playthroughs.filter(p => p.status === 'active').length;
  return { totalPlaytime, totalActions, activePlayers };
}

// ─── Test data ───────────────────────────────────────────────────────────────

const SAMPLE_PLAYTHROUGHS: Playthrough[] = [
  { id: '1', userId: 'u1', worldId: 'w1', name: 'First Run', status: 'active', playtime: 3661, actionsCount: 42, createdAt: '2026-03-01T10:00:00Z', lastPlayedAt: '2026-03-15T14:30:00Z' },
  { id: '2', userId: 'u2', worldId: 'w1', name: 'Second Run', status: 'paused', playtime: 1800, actionsCount: 15, createdAt: '2026-03-05T08:00:00Z' },
  { id: '3', userId: 'u3', worldId: 'w1', status: 'completed', playtime: 7200, actionsCount: 100, createdAt: '2026-02-20T12:00:00Z', lastPlayedAt: '2026-03-10T18:00:00Z' },
  { id: '4', userId: 'u4', worldId: 'w1', name: 'Quick Test', status: 'active', playtime: 120, actionsCount: 3, createdAt: '2026-03-18T09:00:00Z' },
];

// ─── Read-only contract (static source analysis) ────────────────────────────

describe('PlaythroughAnalytics read-only contract', () => {
  it('does not contain any POST/PUT/PATCH/DELETE fetch calls', () => {
    // The component should only use GET (default fetch method)
    expect(componentSource).not.toMatch(/method:\s*['"`]POST['"`]/i);
    expect(componentSource).not.toMatch(/method:\s*['"`]PUT['"`]/i);
    expect(componentSource).not.toMatch(/method:\s*['"`]PATCH['"`]/i);
    expect(componentSource).not.toMatch(/method:\s*['"`]DELETE['"`]/i);
  });

  it('only fetches from the analytics endpoint (read-only)', () => {
    const fetchCalls = componentSource.match(/fetch\s*\([^)]+\)/g) || [];
    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0]).toContain('/analytics/playthroughs');
  });

  it('does not contain playthrough creation UI elements', () => {
    const lowerSource = componentSource.toLowerCase();
    expect(lowerSource).not.toContain('new playthrough');
    expect(lowerSource).not.toContain('create playthrough');
    expect(lowerSource).not.toContain('start playthrough');
  });

  it('does not contain playthrough deletion UI elements', () => {
    const lowerSource = componentSource.toLowerCase();
    expect(lowerSource).not.toContain('delete playthrough');
    expect(lowerSource).not.toContain('remove playthrough');
  });

  it('does not contain playthrough mutation UI elements', () => {
    const lowerSource = componentSource.toLowerCase();
    expect(lowerSource).not.toContain('edit playthrough');
    expect(lowerSource).not.toContain('rename playthrough');
    expect(lowerSource).not.toContain('pause playthrough');
    expect(lowerSource).not.toContain('abandon playthrough');
  });

  it('does not import mutation hooks like useMutation', () => {
    expect(componentSource).not.toMatch(/useMutation/);
  });

  it('does not call the playthrough start endpoint', () => {
    expect(componentSource).not.toContain('/playthroughs/start');
  });

  it('does not contain form or input elements for playthrough data', () => {
    // No <input>, <form>, <textarea> for playthrough creation
    expect(componentSource).not.toMatch(/<input[\s>]/);
    expect(componentSource).not.toMatch(/<form[\s>]/);
    expect(componentSource).not.toMatch(/<textarea[\s>]/);
  });
});

// ─── Helper function tests ──────────────────────────────────────────────────

describe('PlaythroughAnalytics formatDuration', () => {
  it('returns 0m for undefined', () => {
    expect(formatDuration(undefined)).toBe('0m');
  });

  it('returns 0m for zero', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('formats minutes only', () => {
    expect(formatDuration(300)).toBe('5m');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(3661)).toBe('1h 1m');
  });

  it('handles exact hour', () => {
    expect(formatDuration(7200)).toBe('2h 0m');
  });
});

describe('PlaythroughAnalytics formatDate', () => {
  it('returns Never for undefined', () => {
    expect(formatDate(undefined)).toBe('Never');
  });

  it('returns a formatted date string for valid input', () => {
    const result = formatDate('2026-03-15T14:30:00Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('Never');
  });
});

describe('PlaythroughAnalytics groupPlaythroughsByStatus', () => {
  it('groups playthroughs by their status', () => {
    const groups = groupPlaythroughsByStatus(SAMPLE_PLAYTHROUGHS);
    expect(groups.get('active')?.length).toBe(2);
    expect(groups.get('paused')?.length).toBe(1);
    expect(groups.get('completed')?.length).toBe(1);
  });

  it('returns empty map for no playthroughs', () => {
    const groups = groupPlaythroughsByStatus([]);
    expect(groups.size).toBe(0);
  });

  it('handles unknown status gracefully', () => {
    const playthroughs: Playthrough[] = [
      { id: '1', userId: 'u1', worldId: 'w1', status: '', createdAt: '2026-01-01' },
    ];
    const groups = groupPlaythroughsByStatus(playthroughs);
    expect(groups.get('unknown')?.length).toBe(1);
  });
});

describe('PlaythroughAnalytics computeStats', () => {
  it('computes correct totals', () => {
    const stats = computeStats(SAMPLE_PLAYTHROUGHS);
    expect(stats.totalPlaytime).toBe(3661 + 1800 + 7200 + 120);
    expect(stats.totalActions).toBe(42 + 15 + 100 + 3);
    expect(stats.activePlayers).toBe(2);
  });

  it('handles empty list', () => {
    const stats = computeStats([]);
    expect(stats.totalPlaytime).toBe(0);
    expect(stats.totalActions).toBe(0);
    expect(stats.activePlayers).toBe(0);
  });

  it('handles missing optional fields', () => {
    const playthroughs: Playthrough[] = [
      { id: '1', userId: 'u1', worldId: 'w1', status: 'active', createdAt: '2026-01-01' },
    ];
    const stats = computeStats(playthroughs);
    expect(stats.totalPlaytime).toBe(0);
    expect(stats.totalActions).toBe(0);
    expect(stats.activePlayers).toBe(1);
  });
});
