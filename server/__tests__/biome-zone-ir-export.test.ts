/**
 * Tests for landscape biome zone data in IR export.
 *
 * Verifies that generateBiomeZones correctly samples a heightmap,
 * classifies cells into biome zones, and attaches vegetation species.
 */

import { describe, it, expect } from 'vitest';
import { generateBiomeZones } from '../services/game-export/ir-generator';
import type { BiomeZoneIR } from '@shared/game-engine/ir-types';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Create a uniform heightmap where every cell has the same elevation */
function uniformHeightmap(resolution: number, elevation: number): number[][] {
  return Array.from({ length: resolution }, () =>
    Array.from({ length: resolution }, () => elevation),
  );
}

/** Create a heightmap with a linear gradient from 0 to 1 top-to-bottom */
function gradientHeightmap(resolution: number): number[][] {
  return Array.from({ length: resolution }, (_, row) =>
    Array.from({ length: resolution }, () => row / (resolution - 1)),
  );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('generateBiomeZones', () => {
  it('returns empty array for empty heightmap', () => {
    const result = generateBiomeZones([], 'plains');
    expect(result).toEqual([]);
  });

  it('returns a single zone for a uniform heightmap', () => {
    const heightmap = uniformHeightmap(16, 0.1); // lowland
    const zones = generateBiomeZones(heightmap, 'plains');

    expect(zones.length).toBe(1);
    expect(zones[0].biome).toBe('plains');
    expect(zones[0].elevationZone).toBe('lowland');
    expect(zones[0].cellCount).toBe(256); // 16x16
    expect(zones[0].coverageFraction).toBeCloseTo(1.0);
    expect(zones[0].averageElevation).toBeCloseTo(0.1);
  });

  it('generates multiple zones for a gradient heightmap', () => {
    const heightmap = gradientHeightmap(64);
    const zones = generateBiomeZones(heightmap, 'forest');

    // Should have multiple elevation zones
    expect(zones.length).toBeGreaterThan(1);

    // All zones should be in the forest biome
    for (const zone of zones) {
      expect(zone.biome).toBe('forest');
    }

    // Coverage fractions should sum to ~1.0
    const totalCoverage = zones.reduce((sum, z) => sum + z.coverageFraction, 0);
    expect(totalCoverage).toBeCloseTo(1.0, 2);

    // Cell counts should sum to total cells
    const totalCells = zones.reduce((sum, z) => sum + z.cellCount, 0);
    expect(totalCells).toBe(64 * 64);

    // Zones should be sorted by coverage descending
    for (let i = 1; i < zones.length; i++) {
      expect(zones[i - 1].coverageFraction).toBeGreaterThanOrEqual(zones[i].coverageFraction);
    }
  });

  it('maps terrain types to correct biomes', () => {
    const heightmap = uniformHeightmap(8, 0.3); // midland

    const forestZones = generateBiomeZones(heightmap, 'forest');
    expect(forestZones[0].biome).toBe('forest');

    const desertZones = generateBiomeZones(heightmap, 'desert');
    expect(desertZones[0].biome).toBe('desert');

    const mountainZones = generateBiomeZones(heightmap, 'mountains');
    expect(mountainZones[0].biome).toBe('mountains');

    const plainZones = generateBiomeZones(heightmap, 'plains');
    expect(plainZones[0].biome).toBe('plains');
  });

  it('attaches species data to each zone', () => {
    const heightmap = uniformHeightmap(8, 0.1);
    const zones = generateBiomeZones(heightmap, 'forest');

    expect(zones.length).toBe(1);
    expect(zones[0].species.length).toBeGreaterThan(0);

    for (const species of zones[0].species) {
      expect(species.id).toBeTruthy();
      expect(species.name).toBeTruthy();
      expect(['tree', 'shrub', 'groundcover', 'flower', 'grass']).toContain(species.category);
      expect(species.density).toBeGreaterThan(0);
      expect(species.scaleRange).toHaveLength(2);
      expect(species.scaleRange[0]).toBeLessThanOrEqual(species.scaleRange[1]);
    }
  });

  it('tree species include treeType field', () => {
    const heightmap = uniformHeightmap(8, 0.1);
    const zones = generateBiomeZones(heightmap, 'forest');

    const treeSpecies = zones[0].species.filter(s => s.category === 'tree');
    expect(treeSpecies.length).toBeGreaterThan(0);
    for (const tree of treeSpecies) {
      expect(tree.treeType).toBeTruthy();
    }
  });

  it('non-tree species omit treeType field', () => {
    const heightmap = uniformHeightmap(8, 0.1);
    const zones = generateBiomeZones(heightmap, 'forest');

    const nonTreeSpecies = zones[0].species.filter(s => s.category !== 'tree');
    for (const s of nonTreeSpecies) {
      expect(s.treeType).toBeUndefined();
    }
  });

  it('zone ids follow biome:elevation:moisture format', () => {
    const heightmap = gradientHeightmap(32);
    const zones = generateBiomeZones(heightmap, 'plains');

    for (const zone of zones) {
      expect(zone.id).toBe(`${zone.biome}:${zone.elevationZone}:${zone.moistureLevel}`);
    }
  });

  it('averageElevation is within valid range for each zone', () => {
    const heightmap = gradientHeightmap(32);
    const zones = generateBiomeZones(heightmap, 'mountains');

    for (const zone of zones) {
      expect(zone.averageElevation).toBeGreaterThanOrEqual(0);
      expect(zone.averageElevation).toBeLessThanOrEqual(1);
      expect(zone.averageMoisture).toBeGreaterThanOrEqual(0);
      expect(zone.averageMoisture).toBeLessThanOrEqual(1);
    }
  });

  it('handles desert terrain with arid moisture', () => {
    // Desert at low elevation should produce arid moisture
    const heightmap = uniformHeightmap(8, 0.05);
    const zones = generateBiomeZones(heightmap, 'desert');

    expect(zones.length).toBe(1);
    expect(zones[0].biome).toBe('desert');
    expect(zones[0].elevationZone).toBe('lowland');
    // Desert has base moisture 0.1, which is arid
    expect(zones[0].moistureLevel).toBe('arid');
  });
});
