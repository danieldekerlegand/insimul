/**
 * Tests for geographic coordinate system features:
 * - Street edge → segment adapter
 * - Terrain-aware pattern selection
 * - Non-grid lot placement
 *
 * Run with: npx vitest run server/__tests__/geographic-coordinate-system.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  generateStreetNetwork,
  selectStreetPattern,
  convertEdgesToSegments,
  placeLots,
  placeLotsAlongStreets,
  type StreetNetworkConfig,
} from '../generators/street-network-generator';
import { StreetGenerator } from '../generators/street-generator';
import type { StreetNetwork as SharedStreetNetwork } from '../../shared/game-engine/types';

// ── Pattern Selection ────────────────────────────────────────────────────────

describe('selectStreetPattern', () => {
  const base: StreetNetworkConfig = {
    centerX: 0, centerZ: 0,
    settlementType: 'town',
    foundedYear: 1900,
    seed: 'test',
  };

  it('coast → waterfront', () => {
    expect(selectStreetPattern({ ...base, terrain: 'coast' })).toBe('waterfront');
  });

  it('river → linear', () => {
    expect(selectStreetPattern({ ...base, terrain: 'river' })).toBe('linear');
  });

  it('mountains → hillside', () => {
    expect(selectStreetPattern({ ...base, terrain: 'mountains' })).toBe('hillside');
  });

  it('city ≥10k → grid', () => {
    expect(selectStreetPattern({
      ...base, terrain: 'plains', settlementType: 'city', population: 15000,
    })).toBe('grid');
  });

  it('city <10k → radial', () => {
    expect(selectStreetPattern({
      ...base, terrain: 'plains', settlementType: 'city', population: 5000,
    })).toBe('radial');
  });

  it('village → organic', () => {
    expect(selectStreetPattern({
      ...base, terrain: 'plains', settlementType: 'village',
    })).toBe('organic');
  });

  it('pre-1800 → organic', () => {
    expect(selectStreetPattern({
      ...base, terrain: 'plains', settlementType: 'town', foundedYear: 1700,
    })).toBe('organic');
  });

  it('modern town on plains → grid', () => {
    expect(selectStreetPattern({
      ...base, terrain: 'plains', settlementType: 'town', foundedYear: 1900,
    })).toBe('grid');
  });
});

// ── Edge → Segment Adapter ───────────────────────────────────────────────────

describe('convertEdgesToSegments', () => {
  it('converts StreetGenerator organic output to segment format', () => {
    const gen = new StreetGenerator();
    const network = gen.generateOrganic({
      center: { x: 0, z: 0 },
      radius: 100,
      settlementType: 'village',
      seed: 'adapter-test-organic',
    });

    expect(network.nodes.length).toBeGreaterThan(0);
    expect(network.edges.length).toBeGreaterThan(0);

    const converted = convertEdgesToSegments(network);

    expect(converted.nodes.length).toBeGreaterThan(0);
    expect(converted.segments.length).toBeGreaterThan(0);

    // Each segment should have valid waypoints
    for (const seg of converted.segments) {
      expect(seg.waypoints.length).toBeGreaterThanOrEqual(2);
      expect(seg.nodeIds.length).toBeGreaterThanOrEqual(2);
      expect(seg.width).toBeGreaterThan(0);
      expect(seg.name).toBeTruthy();
      expect(['NS', 'EW']).toContain(seg.direction);
    }

    // Each node should have intersectionOf populated
    const segNodeIds = new Set(converted.segments.flatMap(s => s.nodeIds));
    for (const node of converted.nodes) {
      expect(segNodeIds.has(node.id)).toBe(true);
    }
  });

  it('converts StreetGenerator radial output', () => {
    const gen = new StreetGenerator();
    const network = gen.generateRadial({
      center: { x: 0, z: 0 },
      radius: 120,
      settlementType: 'city',
      seed: 'adapter-test-radial',
    });

    const converted = convertEdgesToSegments(network);
    expect(converted.segments.length).toBeGreaterThan(0);
    expect(converted.nodes.length).toBeGreaterThan(0);
  });

  it('converts StreetGenerator linear output', () => {
    const gen = new StreetGenerator();
    const network = gen.generateLinear({
      center: { x: 0, z: 0 },
      radius: 100,
      settlementType: 'village',
      seed: 'adapter-test-linear',
      axis: { x: 1, z: 0 },
    });

    const converted = convertEdgesToSegments(network);
    expect(converted.segments.length).toBeGreaterThan(0);
  });

  it('converts StreetGenerator grid output', () => {
    const gen = new StreetGenerator();
    const network = gen.generateGrid({
      center: { x: 0, z: 0 },
      radius: 150,
      settlementType: 'city',
      seed: 'adapter-test-grid',
    });

    const converted = convertEdgesToSegments(network);
    expect(converted.segments.length).toBeGreaterThan(0);
  });
});

// ── Terrain-Aware Street Generation ──────────────────────────────────────────

describe('generateStreetNetwork with terrain', () => {
  const base: StreetNetworkConfig = {
    centerX: 0, centerZ: 0,
    settlementType: 'town',
    foundedYear: 1900,
    seed: 'terrain-gen-test',
  };

  it('generates grid for plains town', () => {
    const result = generateStreetNetwork({ ...base, terrain: 'plains' });
    expect(result.pattern).toBe('grid');
    expect(result.segments.length).toBeGreaterThan(0);
    expect(result.nodes.length).toBeGreaterThan(0);
  });

  it('generates waterfront for coast', () => {
    const result = generateStreetNetwork({ ...base, terrain: 'coast' });
    expect(result.pattern).toBe('waterfront');
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('generates linear for river', () => {
    const result = generateStreetNetwork({ ...base, terrain: 'river' });
    expect(result.pattern).toBe('linear');
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('generates hillside for mountains', () => {
    const result = generateStreetNetwork({ ...base, terrain: 'mountains' });
    expect(result.pattern).toBe('hillside');
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('generates organic for village on plains', () => {
    const result = generateStreetNetwork({ ...base, terrain: 'plains', settlementType: 'village' });
    expect(result.pattern).toBe('organic');
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('generates radial for small city on plains', () => {
    const result = generateStreetNetwork({
      ...base, terrain: 'plains', settlementType: 'city', population: 5000,
    });
    expect(result.pattern).toBe('radial');
    expect(result.segments.length).toBeGreaterThan(0);
  });

  it('falls back to grid without terrain', () => {
    const result = generateStreetNetwork(base);
    expect(result.pattern).toBe('grid');
    expect(result.segments.length).toBeGreaterThan(0);
  });
});

// ── Non-Grid Lot Placement ───────────────────────────────────────────────────

describe('placeLotsAlongStreets', () => {
  it('places lots along organic network', () => {
    const gen = new StreetGenerator();
    const edgeNetwork = gen.generateOrganic({
      center: { x: 0, z: 0 },
      radius: 100,
      settlementType: 'village',
      seed: 'lots-organic',
    });
    gen.assignStreetNames(edgeNetwork, 'lots-organic');
    const segNetwork = convertEdgesToSegments(edgeNetwork);

    const lots = placeLotsAlongStreets(segNetwork, 50, 'lots-organic', 'village', 'organic');
    expect(lots.length).toBeGreaterThan(0);
    expect(lots.length).toBeLessThanOrEqual(50);

    // Should have exactly one park
    const parks = lots.filter(l => l.zone === 'park');
    expect(parks.length).toBe(1);

    // All lots should have valid fields
    for (const lot of lots) {
      expect(typeof lot.x).toBe('number');
      expect(typeof lot.z).toBe('number');
      expect(lot.streetId).toBeTruthy();
      expect(lot.lotWidth).toBeGreaterThan(0);
      expect(lot.lotDepth).toBeGreaterThan(0);
    }
  });

  it('places lots along linear network', () => {
    const gen = new StreetGenerator();
    const edgeNetwork = gen.generateLinear({
      center: { x: 0, z: 0 },
      radius: 100,
      settlementType: 'village',
      seed: 'lots-linear',
      axis: { x: 1, z: 0 },
    });
    gen.assignStreetNames(edgeNetwork, 'lots-linear');
    const segNetwork = convertEdgesToSegments(edgeNetwork);

    const lots = placeLotsAlongStreets(segNetwork, 30, 'lots-linear', 'village', 'linear');
    expect(lots.length).toBeGreaterThan(0);
  });

  it('places lots along radial network', () => {
    const gen = new StreetGenerator();
    const edgeNetwork = gen.generateRadial({
      center: { x: 0, z: 0 },
      radius: 120,
      settlementType: 'city',
      seed: 'lots-radial',
    });
    gen.assignStreetNames(edgeNetwork, 'lots-radial');
    const segNetwork = convertEdgesToSegments(edgeNetwork);

    const lots = placeLotsAlongStreets(segNetwork, 100, 'lots-radial', 'city', 'radial');
    expect(lots.length).toBeGreaterThan(0);

    const parks = lots.filter(l => l.zone === 'park');
    expect(parks.length).toBe(1);
  });

  it('lot count scales with settlement type', () => {
    const gen = new StreetGenerator();

    // Village
    const villageNet = gen.generateOrganic({
      center: { x: 0, z: 0 }, radius: 80, settlementType: 'village', seed: 'scale-village',
    });
    gen.assignStreetNames(villageNet, 'scale-village');
    const villageSeg = convertEdgesToSegments(villageNet);
    const villageLots = placeLotsAlongStreets(villageSeg, 500, 'scale-village', 'village');

    // City
    const cityNet = gen.generateRadial({
      center: { x: 0, z: 0 }, radius: 250, settlementType: 'city', seed: 'scale-city',
    });
    gen.assignStreetNames(cityNet, 'scale-city');
    const citySeg = convertEdgesToSegments(cityNet);
    const cityLots = placeLotsAlongStreets(citySeg, 500, 'scale-city', 'city');

    // City should produce more lots than village
    expect(cityLots.length).toBeGreaterThan(villageLots.length);
  });

  it('grid placeLots still works for grid pattern', () => {
    const network = generateStreetNetwork({
      centerX: 0, centerZ: 0,
      settlementType: 'town',
      foundedYear: 1900,
      seed: 'grid-lots',
      terrain: 'plains',
    });

    const lots = placeLots(network, 100, 'grid-lots', 'town');
    expect(lots.length).toBeGreaterThan(0);

    const parks = lots.filter(l => l.zone === 'park');
    expect(parks.length).toBe(1);
  });
});

// ── End-to-End: Terrain → Pattern → Network → Lots ──────────────────────────

describe('end-to-end terrain-aware generation', () => {
  const terrains = ['plains', 'coast', 'river', 'mountains', 'forest'] as const;
  const types = ['hamlet', 'village', 'town', 'city'] as const;

  for (const terrain of terrains) {
    for (const type of types) {
      it(`generates ${terrain}/${type} with lots`, () => {
        const config: StreetNetworkConfig = {
          centerX: 0, centerZ: 0,
          settlementType: type,
          foundedYear: 1900,
          seed: `e2e-${terrain}-${type}`,
          terrain,
          population: type === 'city' ? 5000 : 500,
        };

        const network = generateStreetNetwork(config);
        expect(network.segments.length).toBeGreaterThan(0);
        expect(network.pattern).toBeTruthy();

        // Place lots using the appropriate function
        const isGrid = network.pattern === 'grid';
        const lots = isGrid
          ? placeLots(network, 100, config.seed, type)
          : placeLotsAlongStreets(network, 100, config.seed, type, network.pattern);

        expect(lots.length).toBeGreaterThan(0);
      });
    }
  }
});
