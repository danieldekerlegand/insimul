import { describe, it, expect } from 'vitest';
import { generateCoastline } from '../generators/coastline-generator';
import {
  generateHarborAndDocks,
  findHarborSites,
  getHarborCount,
  getInwardDirection,
  getWaterFacingRotation,
  getStructureLayout,
  placeStructures,
  type HarborConfig,
} from '../generators/harbor-dock-generator';

/** Helper: create a default coastline for testing */
function makeCoastline(overrides: Record<string, any> = {}) {
  return generateCoastline({
    seed: 42,
    mapSize: 500,
    waterSide: 'north',
    minBays: 1,
    maxBays: 2,
    ...overrides,
  });
}

function makeRng(seed = 42) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('HarborDockGenerator', () => {
  describe('getHarborCount', () => {
    it('returns 1 for village', () => {
      expect(getHarborCount('village')).toBe(1);
    });
    it('returns 1 for town', () => {
      expect(getHarborCount('town')).toBe(1);
    });
    it('returns 2 for city', () => {
      expect(getHarborCount('city')).toBe(2);
    });
  });

  describe('getInwardDirection', () => {
    it('returns correct direction for each waterSide', () => {
      expect(getInwardDirection('north')).toEqual({ x: 0, z: 1 });
      expect(getInwardDirection('south')).toEqual({ x: 0, z: -1 });
      expect(getInwardDirection('east')).toEqual({ x: -1, z: 0 });
      expect(getInwardDirection('west')).toEqual({ x: 1, z: 0 });
    });
  });

  describe('getWaterFacingRotation', () => {
    it('returns 0 for north', () => {
      expect(getWaterFacingRotation('north')).toBe(0);
    });
    it('returns PI for south', () => {
      expect(getWaterFacingRotation('south')).toBe(Math.PI);
    });
  });

  describe('findHarborSites', () => {
    it('returns sites up to the requested count', () => {
      const coastline = makeCoastline();
      const rng = makeRng();
      const sites = findHarborSites(coastline, 2, rng);
      expect(sites.length).toBeLessThanOrEqual(2);
      expect(sites.length).toBeGreaterThanOrEqual(1);
    });

    it('prefers bay centers as harbor sites', () => {
      const coastline = makeCoastline({ minBays: 2, maxBays: 2 });
      const rng = makeRng();
      const sites = findHarborSites(coastline, 2, rng);
      // With 2 bays and requesting 2 sites, both should come from bays
      expect(sites.length).toBe(2);
      for (let i = 0; i < Math.min(sites.length, coastline.bays.length); i++) {
        expect(sites[i].x).toBe(coastline.bays[i].center.x);
        expect(sites[i].z).toBe(coastline.bays[i].center.z);
      }
    });

    it('falls back to contour points when no bays', () => {
      const coastline = makeCoastline({ minBays: 0, maxBays: 0 });
      const rng = makeRng();
      const sites = findHarborSites(coastline, 1, rng);
      expect(sites.length).toBe(1);
    });
  });

  describe('getStructureLayout', () => {
    it('returns at least dock and pier for village', () => {
      const rng = makeRng();
      const layout = getStructureLayout('village', rng);
      expect(layout).toContain('dock');
      expect(layout).toContain('pier');
      expect(layout.length).toBeGreaterThanOrEqual(2);
    });

    it('returns more structures for town', () => {
      const rng = makeRng();
      const layout = getStructureLayout('town', rng);
      expect(layout).toContain('dock');
      expect(layout).toContain('warehouse');
      expect(layout).toContain('fish_market');
      expect(layout.length).toBeGreaterThan(3);
    });

    it('returns full infrastructure for city', () => {
      const rng = makeRng();
      const layout = getStructureLayout('city', rng);
      expect(layout).toContain('customs_house');
      expect(layout).toContain('lighthouse');
      expect(layout).toContain('boatyard');
      expect(layout.length).toBeGreaterThan(8);
    });
  });

  describe('placeStructures', () => {
    it('creates structures with unique ids', () => {
      const coastline = makeCoastline();
      const rng = makeRng();
      const types = getStructureLayout('town', rng);
      const structures = placeStructures(
        { x: 250, z: 100 }, types, coastline, 'harbor-0', 1800, makeRng(99),
      );
      const ids = structures.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('assigns valid properties to each structure', () => {
      const coastline = makeCoastline();
      const structures = placeStructures(
        { x: 250, z: 100 },
        ['dock', 'pier', 'warehouse'],
        coastline, 'harbor-0', 1800, makeRng(77),
      );
      for (const s of structures) {
        expect(s.width).toBeGreaterThan(0);
        expect(s.depth).toBeGreaterThan(0);
        expect(['wood', 'stone', 'iron']).toContain(s.properties.material);
        expect(['new', 'good', 'worn', 'damaged']).toContain(s.properties.condition);
        expect(s.properties.builtYear).toBeGreaterThanOrEqual(1800);
      }
    });
  });

  describe('generateHarborAndDocks', () => {
    it('produces deterministic results with the same seed', () => {
      const coastline = makeCoastline();
      const config: HarborConfig = { seed: 42, coastline, settlementType: 'town' };
      const a = generateHarborAndDocks(config);
      const b = generateHarborAndDocks(config);
      expect(a.zones.length).toBe(b.zones.length);
      expect(a.allStructures.length).toBe(b.allStructures.length);
      for (let i = 0; i < a.allStructures.length; i++) {
        expect(a.allStructures[i].id).toBe(b.allStructures[i].id);
        expect(a.allStructures[i].x).toBeCloseTo(b.allStructures[i].x, 5);
        expect(a.allStructures[i].z).toBeCloseTo(b.allStructures[i].z, 5);
      }
    });

    it('generates 1 zone for village', () => {
      const coastline = makeCoastline();
      const result = generateHarborAndDocks({
        seed: 42, coastline, settlementType: 'village',
      });
      expect(result.zones.length).toBe(1);
      expect(result.allStructures.length).toBeGreaterThanOrEqual(2);
    });

    it('generates 2 zones for city', () => {
      const coastline = makeCoastline({ minBays: 2, maxBays: 3 });
      const result = generateHarborAndDocks({
        seed: 42, coastline, settlementType: 'city',
      });
      expect(result.zones.length).toBe(2);
      expect(result.allStructures.length).toBeGreaterThan(5);
    });

    it('assigns harbor names to zones', () => {
      const coastline = makeCoastline();
      const result = generateHarborAndDocks({
        seed: 42, coastline, settlementType: 'town',
      });
      for (const zone of result.zones) {
        expect(zone.name).toBeTruthy();
        expect(zone.id).toMatch(/^harbor-\d+$/);
      }
    });

    it('allStructures is the union of all zone structures', () => {
      const coastline = makeCoastline({ minBays: 2, maxBays: 3 });
      const result = generateHarborAndDocks({
        seed: 42, coastline, settlementType: 'city',
      });
      const expected = result.zones.flatMap(z => z.structures);
      expect(result.allStructures).toEqual(expected);
    });

    it('sets foundedYear on structure properties', () => {
      const coastline = makeCoastline();
      const result = generateHarborAndDocks({
        seed: 42, coastline, settlementType: 'town', foundedYear: 1750,
      });
      for (const s of result.allStructures) {
        expect(s.properties.builtYear).toBeGreaterThanOrEqual(1750);
      }
    });

    it('works with different waterSide orientations', () => {
      for (const waterSide of ['north', 'south', 'east', 'west'] as const) {
        const coastline = makeCoastline({ waterSide });
        const result = generateHarborAndDocks({
          seed: 42, coastline, settlementType: 'town',
        });
        expect(result.zones.length).toBeGreaterThanOrEqual(1);
        expect(result.allStructures.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('dock structures have capacity property', () => {
      const coastline = makeCoastline();
      const result = generateHarborAndDocks({
        seed: 42, coastline, settlementType: 'city',
      });
      const docks = result.allStructures.filter(s => s.type === 'dock');
      expect(docks.length).toBeGreaterThan(0);
      for (const dock of docks) {
        expect(dock.properties.capacity).toBeDefined();
        expect(dock.properties.capacity).toBeGreaterThan(0);
      }
    });
  });
});
