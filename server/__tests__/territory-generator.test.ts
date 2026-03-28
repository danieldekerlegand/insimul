/**
 * Tests for territory-generator.ts — world-level geographic layout.
 *
 * Run with: npx vitest run server/generators/territory-generator.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  generateWorldGeography,
  resolveScaleConfig,
  getSettlementBaseRadius,
  type WorldGeographyConfig,
  type WorldScale,
} from '../generators/territory-generator';

// ── Helpers ──────────────────────────────────────────────────────────────────

function pointInPolygon(point: { x: number; z: number }, polygon: { x: number; z: number }[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, zi = polygon[i].z;
    const xj = polygon[j].x, zj = polygon[j].z;
    if (((zi > point.z) !== (zj > point.z)) &&
        (point.x < (xj - xi) * (point.z - zi) / (zj - zi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function dist(a: { x: number; z: number }, b: { x: number; z: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.z - b.z) ** 2);
}

// ── Scale config resolution ──────────────────────────────────────────────────

describe('resolveScaleConfig', () => {
  it('returns standard preset by default', () => {
    const cfg = resolveScaleConfig(undefined);
    expect(cfg.settlementSpacing).toBe(700);
    expect(cfg.countryRadius).toBe(1500);
  });

  it('resolves named presets', () => {
    expect(resolveScaleConfig('compact').settlementSpacing).toBe(400);
    expect(resolveScaleConfig('expansive').countryRadius).toBe(3000);
  });

  it('passes through custom config', () => {
    const custom = { settlementSpacing: 999, countryRadius: 1234, settlementRadiusMultiplier: 1.5 };
    expect(resolveScaleConfig(custom)).toEqual(custom);
  });
});

describe('getSettlementBaseRadius', () => {
  it('returns correct radii for known types', () => {
    expect(getSettlementBaseRadius('hamlet')).toBe(50);
    expect(getSettlementBaseRadius('village')).toBe(80);
    expect(getSettlementBaseRadius('town')).toBe(150);
    expect(getSettlementBaseRadius('city')).toBe(250);
  });

  it('returns fallback for unknown types', () => {
    expect(getSettlementBaseRadius('metropolis')).toBe(150);
  });
});

// ── Single-country world ─────────────────────────────────────────────────────

describe('generateWorldGeography — single country', () => {
  const config: WorldGeographyConfig = {
    worldId: 'w1',
    seed: 'test-single-country',
    scale: 'standard',
    countries: [{
      id: 'c1',
      terrain: 'plains',
      settlements: [
        { id: 's1', type: 'town', terrain: 'plains', population: 1000 },
      ],
    }],
  };

  const result = generateWorldGeography(config);

  it('computes map dimensions', () => {
    expect(result.mapWidth).toBeGreaterThan(0);
    expect(result.mapDepth).toBeGreaterThan(0);
    expect(result.mapCenter).toEqual({ x: 0, z: 0 });
  });

  it('generates country territory', () => {
    const country = result.countries.get('c1');
    expect(country).toBeDefined();
    expect(country!.territoryPolygon.length).toBeGreaterThanOrEqual(16);
    expect(country!.territoryRadius).toBeGreaterThan(0);
  });

  it('places settlement inside country territory', () => {
    const country = result.countries.get('c1')!;
    const settlement = result.settlements.get('s1');
    expect(settlement).toBeDefined();
    expect(settlement!.radius).toBe(150); // town base radius
    expect(pointInPolygon(
      { x: settlement!.worldPositionX, z: settlement!.worldPositionZ },
      country.territoryPolygon,
    )).toBe(true);
  });

  it('does not generate roads for single settlement', () => {
    expect(result.roads.length).toBe(0);
  });
});

// ── Multi-settlement single country ──────────────────────────────────────────

describe('generateWorldGeography — multiple settlements', () => {
  const config: WorldGeographyConfig = {
    worldId: 'w2',
    seed: 'test-multi-settle',
    scale: 'standard',
    countries: [{
      id: 'c1',
      terrain: 'plains',
      settlements: [
        { id: 's1', type: 'city', terrain: 'plains', population: 5000 },
        { id: 's2', type: 'village', terrain: 'plains', population: 200 },
        { id: 's3', type: 'hamlet', terrain: 'plains', population: 50 },
      ],
    }],
  };

  const result = generateWorldGeography(config);

  it('places all settlements', () => {
    expect(result.settlements.size).toBe(3);
    for (const id of ['s1', 's2', 's3']) {
      expect(result.settlements.has(id)).toBe(true);
    }
  });

  it('settlements have correct radii', () => {
    expect(result.settlements.get('s1')!.radius).toBe(250); // city
    expect(result.settlements.get('s2')!.radius).toBe(80);  // village
    expect(result.settlements.get('s3')!.radius).toBe(50);  // hamlet
  });

  it('generates inter-settlement roads', () => {
    // MST of 3 settlements should have 2 edges
    expect(result.roads.length).toBe(2);
    for (const road of result.roads) {
      expect(road.waypoints.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('settlements are not overlapping', () => {
    const all = [...result.settlements.entries()];
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const [, a] = all[i];
        const [, b] = all[j];
        const d = Math.sqrt(
          (a.worldPositionX - b.worldPositionX) ** 2 +
          (a.worldPositionZ - b.worldPositionZ) ** 2,
        );
        expect(d).toBeGreaterThan(a.radius + b.radius);
      }
    }
  });
});

// ── Multi-country world ──────────────────────────────────────────────────────

describe('generateWorldGeography — multiple countries', () => {
  const config: WorldGeographyConfig = {
    worldId: 'w3',
    seed: 'test-multi-country',
    scale: 'compact',
    countries: [
      {
        id: 'c1', terrain: 'plains',
        settlements: [{ id: 's1', type: 'town', terrain: 'plains', population: 800 }],
      },
      {
        id: 'c2', terrain: 'coast',
        settlements: [{ id: 's2', type: 'village', terrain: 'coast', population: 200 }],
      },
      {
        id: 'c3', terrain: 'mountains',
        settlements: [{ id: 's3', type: 'hamlet', terrain: 'mountains', population: 40 }],
      },
    ],
  };

  const result = generateWorldGeography(config);

  it('generates territory for each country', () => {
    expect(result.countries.size).toBe(3);
    for (const id of ['c1', 'c2', 'c3']) {
      const c = result.countries.get(id)!;
      expect(c.territoryPolygon.length).toBeGreaterThanOrEqual(16);
      expect(c.territoryRadius).toBeGreaterThan(0);
    }
  });

  it('country positions are distinct', () => {
    const positions = [...result.countries.values()].map(c => c.position);
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        expect(dist(positions[i], positions[j])).toBeGreaterThan(10);
      }
    }
  });

  it('country centroids lie within their own territory', () => {
    for (const [, country] of result.countries) {
      expect(pointInPolygon(country.position, country.territoryPolygon)).toBe(true);
    }
  });
});

// ── State subdivision ────────────────────────────────────────────────────────

describe('generateWorldGeography — state subdivision', () => {
  const config: WorldGeographyConfig = {
    worldId: 'w4',
    seed: 'test-states',
    scale: 'standard',
    countries: [{
      id: 'c1',
      terrain: 'plains',
      settlements: [
        { id: 's1', type: 'town', terrain: 'plains', population: 800, stateId: 'st1' },
        { id: 's2', type: 'village', terrain: 'plains', population: 200, stateId: 'st2' },
      ],
      states: [
        { id: 'st1', settlementIds: ['s1'] },
        { id: 'st2', settlementIds: ['s2'] },
      ],
    }],
  };

  const result = generateWorldGeography(config);

  it('generates state boundaries', () => {
    expect(result.states.size).toBe(2);
    for (const id of ['st1', 'st2']) {
      const state = result.states.get(id)!;
      expect(state.boundaryPolygon.length).toBeGreaterThanOrEqual(3);
      expect(state.position).toBeDefined();
    }
  });

  it('state positions are distinct', () => {
    const st1 = result.states.get('st1')!;
    const st2 = result.states.get('st2')!;
    expect(dist(st1.position, st2.position)).toBeGreaterThan(0);
  });
});

// ── Scale presets ────────────────────────────────────────────────────────────

describe('generateWorldGeography — scale presets', () => {
  const makeConfig = (scale: WorldScale): WorldGeographyConfig => ({
    worldId: 'w-scale',
    seed: 'test-scale',
    scale,
    countries: [{
      id: 'c1',
      terrain: 'plains',
      settlements: [
        { id: 's1', type: 'city', terrain: 'plains', population: 5000 },
        { id: 's2', type: 'village', terrain: 'plains', population: 200 },
      ],
    }],
  });

  it('expansive produces larger map than compact', () => {
    const compact = generateWorldGeography(makeConfig('compact'));
    const expansive = generateWorldGeography(makeConfig('expansive'));
    expect(expansive.mapWidth).toBeGreaterThan(compact.mapWidth);
    expect(expansive.mapDepth).toBeGreaterThan(compact.mapDepth);
  });
});

// ── Determinism ──────────────────────────────────────────────────────────────

describe('generateWorldGeography — determinism', () => {
  it('produces identical results with same seed', () => {
    const config: WorldGeographyConfig = {
      worldId: 'w-det',
      seed: 'deterministic',
      scale: 'standard',
      countries: [{
        id: 'c1',
        terrain: 'plains',
        settlements: [
          { id: 's1', type: 'town', terrain: 'plains', population: 1000 },
          { id: 's2', type: 'village', terrain: 'plains', population: 200 },
        ],
      }],
    };

    const r1 = generateWorldGeography(config);
    const r2 = generateWorldGeography(config);

    expect(r1.mapWidth).toBe(r2.mapWidth);
    expect(r1.mapDepth).toBe(r2.mapDepth);

    const s1a = r1.settlements.get('s1')!;
    const s1b = r2.settlements.get('s1')!;
    expect(s1a.worldPositionX).toBe(s1b.worldPositionX);
    expect(s1a.worldPositionZ).toBe(s1b.worldPositionZ);
  });
});
