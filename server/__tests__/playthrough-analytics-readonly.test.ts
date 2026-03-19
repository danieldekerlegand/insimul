/**
 * Tests that the PlaythroughAnalytics API surface is read-only.
 *
 * The analytics endpoint (/api/worlds/:worldId/analytics/playthroughs)
 * must remain a GET-only, owner-restricted endpoint with no mutation
 * capabilities. Playthrough creation/deletion is handled exclusively
 * by in-game systems.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const routeSource = fs.readFileSync(
  path.resolve(__dirname, '../routes/playthrough-routes.ts'),
  'utf-8',
);

describe('Analytics endpoint read-only contract', () => {
  it('registers the analytics endpoint as GET only', () => {
    // The analytics endpoint should only be registered as a GET
    const analyticsLines = routeSource
      .split('\n')
      .filter(line => line.includes('/analytics/playthroughs'));

    expect(analyticsLines.length).toBeGreaterThanOrEqual(1);

    // Every route registration containing /analytics/playthroughs should be GET
    for (const line of analyticsLines) {
      if (line.match(/app\.(get|post|put|patch|delete)\s*\(/)) {
        expect(line).toMatch(/app\.get\s*\(/);
      }
    }
  });

  it('does not have POST/PUT/PATCH/DELETE endpoints under /analytics/', () => {
    expect(routeSource).not.toMatch(/app\.post\s*\([^)]*\/analytics\//);
    expect(routeSource).not.toMatch(/app\.put\s*\([^)]*\/analytics\//);
    expect(routeSource).not.toMatch(/app\.patch\s*\([^)]*\/analytics\//);
    expect(routeSource).not.toMatch(/app\.delete\s*\([^)]*\/analytics\//);
  });

  it('analytics endpoint requires owner permission (canEditWorld)', () => {
    // Extract the analytics handler block
    const analyticsIdx = routeSource.indexOf('/analytics/playthroughs');
    const handlerBlock = routeSource.substring(analyticsIdx, analyticsIdx + 1000);
    expect(handlerBlock).toContain('canEditWorld');
  });

  it('analytics endpoint returns 403 for non-owners', () => {
    const analyticsIdx = routeSource.indexOf('/analytics/playthroughs');
    const handlerBlock = routeSource.substring(analyticsIdx, analyticsIdx + 1000);
    expect(handlerBlock).toContain('403');
    expect(handlerBlock).toMatch(/only world owner/i);
  });

  it('analytics endpoint uses getPlaythroughsByWorld (read operation)', () => {
    const analyticsIdx = routeSource.indexOf('/analytics/playthroughs');
    const handlerBlock = routeSource.substring(analyticsIdx, analyticsIdx + 1000);
    expect(handlerBlock).toContain('getPlaythroughsByWorld');
    // Should NOT contain any mutation operations
    expect(handlerBlock).not.toContain('createPlaythrough');
    expect(handlerBlock).not.toContain('updatePlaythrough');
    expect(handlerBlock).not.toContain('deletePlaythrough');
  });
});
