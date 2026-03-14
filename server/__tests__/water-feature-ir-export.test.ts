/**
 * Tests for water features export in IR (US-057)
 *
 * Verifies that water feature DB records are correctly converted
 * to WaterFeatureIR format for engine-agnostic export.
 */

import { describe, it, expect } from 'vitest';
import type { WaterFeatureIR } from '@shared/game-engine/ir-types';

/**
 * Convert a raw water feature DB record to WaterFeatureIR.
 * Mirrors the conversion logic in ir-generator.ts.
 */
function toWaterFeatureIR(wf: any): WaterFeatureIR {
  return {
    id: wf.id,
    worldId: wf.worldId,
    type: wf.type,
    subType: wf.subType || 'fresh',
    name: wf.name,
    position: wf.position || { x: 0, y: 0, z: 0 },
    waterLevel: wf.waterLevel ?? 0,
    bounds: wf.bounds || { minX: 0, maxX: 0, minZ: 0, maxZ: 0, centerX: 0, centerZ: 0 },
    depth: wf.depth ?? 2,
    width: wf.width ?? 10,
    flowDirection: wf.flowDirection || null,
    flowSpeed: wf.flowSpeed ?? 0,
    shorelinePoints: wf.shorelinePoints || [],
    settlementId: wf.settlementId || null,
    biome: wf.biome || null,
    isNavigable: wf.isNavigable ?? true,
    isDrinkable: wf.isDrinkable ?? true,
    modelAssetKey: wf.modelAssetKey || null,
    color: wf.color || null,
    transparency: wf.transparency ?? 0.3,
  };
}

// ─────────────────────────────────────────────
// River conversion
// ─────────────────────────────────────────────

describe('Water feature IR export - river', () => {
  const riverRecord = {
    id: 'wf-river-1',
    worldId: 'world-1',
    type: 'river',
    subType: 'fresh',
    name: 'Silverstream',
    position: { x: 10, y: 2, z: 30 },
    waterLevel: 2,
    bounds: { minX: -50, maxX: 70, minZ: 20, maxZ: 40, centerX: 10, centerZ: 30 },
    depth: 4,
    width: 15,
    flowDirection: { x: 1, y: 0, z: 0.2 },
    flowSpeed: 2.5,
    shorelinePoints: [
      { x: -50, y: 2, z: 25 },
      { x: 10, y: 2, z: 28 },
      { x: 70, y: 2, z: 30 },
    ],
    settlementId: 'settlement-1',
    biome: 'temperate_forest',
    isNavigable: true,
    isDrinkable: true,
    modelAssetKey: null,
    color: { r: 0.2, g: 0.5, b: 0.7 },
    transparency: 0.3,
  };

  it('preserves all fields', () => {
    const ir = toWaterFeatureIR(riverRecord);
    expect(ir.id).toBe('wf-river-1');
    expect(ir.worldId).toBe('world-1');
    expect(ir.type).toBe('river');
    expect(ir.subType).toBe('fresh');
    expect(ir.name).toBe('Silverstream');
    expect(ir.waterLevel).toBe(2);
    expect(ir.depth).toBe(4);
    expect(ir.width).toBe(15);
    expect(ir.flowSpeed).toBe(2.5);
    expect(ir.settlementId).toBe('settlement-1');
    expect(ir.biome).toBe('temperate_forest');
    expect(ir.isNavigable).toBe(true);
    expect(ir.isDrinkable).toBe(true);
  });

  it('preserves position as Vec3', () => {
    const ir = toWaterFeatureIR(riverRecord);
    expect(ir.position).toEqual({ x: 10, y: 2, z: 30 });
  });

  it('preserves bounds', () => {
    const ir = toWaterFeatureIR(riverRecord);
    expect(ir.bounds.minX).toBe(-50);
    expect(ir.bounds.maxX).toBe(70);
    expect(ir.bounds.centerX).toBe(10);
  });

  it('preserves flowDirection vector', () => {
    const ir = toWaterFeatureIR(riverRecord);
    expect(ir.flowDirection).toEqual({ x: 1, y: 0, z: 0.2 });
  });

  it('preserves shorelinePoints', () => {
    const ir = toWaterFeatureIR(riverRecord);
    expect(ir.shorelinePoints).toHaveLength(3);
    expect(ir.shorelinePoints[0]).toEqual({ x: -50, y: 2, z: 25 });
  });

  it('preserves color', () => {
    const ir = toWaterFeatureIR(riverRecord);
    expect(ir.color).toEqual({ r: 0.2, g: 0.5, b: 0.7 });
  });
});

// ─────────────────────────────────────────────
// Lake (still water) conversion
// ─────────────────────────────────────────────

describe('Water feature IR export - lake', () => {
  const lakeRecord = {
    id: 'wf-lake-1',
    worldId: 'world-1',
    type: 'lake',
    subType: 'fresh',
    name: 'Mirror Lake',
    position: { x: 100, y: 10, z: 200 },
    waterLevel: 10,
    bounds: { minX: 80, maxX: 120, minZ: 180, maxZ: 220, centerX: 100, centerZ: 200 },
    depth: 8,
    width: 40,
    flowDirection: null,
    flowSpeed: 0,
    shorelinePoints: [],
    settlementId: null,
    biome: 'temperate_forest',
    isNavigable: true,
    isDrinkable: true,
    modelAssetKey: null,
    color: null,
    transparency: 0.25,
  };

  it('has null flowDirection for still water', () => {
    const ir = toWaterFeatureIR(lakeRecord);
    expect(ir.flowDirection).toBeNull();
    expect(ir.flowSpeed).toBe(0);
  });

  it('has null settlementId when unassociated', () => {
    const ir = toWaterFeatureIR(lakeRecord);
    expect(ir.settlementId).toBeNull();
  });

  it('allows null color', () => {
    const ir = toWaterFeatureIR(lakeRecord);
    expect(ir.color).toBeNull();
  });
});

// ─────────────────────────────────────────────
// Ocean (salt water) conversion
// ─────────────────────────────────────────────

describe('Water feature IR export - ocean', () => {
  it('marks salt water as not drinkable', () => {
    const ir = toWaterFeatureIR({
      id: 'wf-ocean-1',
      worldId: 'world-1',
      type: 'ocean',
      subType: 'salt',
      name: 'Eastern Sea',
      position: { x: 500, y: 0, z: 0 },
      waterLevel: 0,
      bounds: { minX: 400, maxX: 1000, minZ: -500, maxZ: 500, centerX: 700, centerZ: 0 },
      depth: 50,
      width: 600,
      flowDirection: { x: 0, y: 0, z: 1 },
      flowSpeed: 0.5,
      shorelinePoints: [],
      settlementId: 'port-1',
      biome: 'coastal',
      isNavigable: true,
      isDrinkable: false,
      modelAssetKey: null,
      color: { r: 0, g: 0.3, b: 0.6 },
      transparency: 0.4,
    });
    expect(ir.isDrinkable).toBe(false);
    expect(ir.subType).toBe('salt');
  });
});

// ─────────────────────────────────────────────
// Default value handling
// ─────────────────────────────────────────────

describe('Water feature IR export - defaults', () => {
  const minimal = {
    id: 'wf-min',
    worldId: 'world-1',
    type: 'pond',
    name: 'Small Pond',
  };

  it('defaults subType to fresh', () => {
    expect(toWaterFeatureIR(minimal).subType).toBe('fresh');
  });

  it('defaults position to origin', () => {
    expect(toWaterFeatureIR(minimal).position).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('defaults waterLevel to 0', () => {
    expect(toWaterFeatureIR(minimal).waterLevel).toBe(0);
  });

  it('defaults bounds to zero bounds', () => {
    const ir = toWaterFeatureIR(minimal);
    expect(ir.bounds).toEqual({ minX: 0, maxX: 0, minZ: 0, maxZ: 0, centerX: 0, centerZ: 0 });
  });

  it('defaults depth to 2', () => {
    expect(toWaterFeatureIR(minimal).depth).toBe(2);
  });

  it('defaults width to 10', () => {
    expect(toWaterFeatureIR(minimal).width).toBe(10);
  });

  it('defaults flowDirection to null', () => {
    expect(toWaterFeatureIR(minimal).flowDirection).toBeNull();
  });

  it('defaults flowSpeed to 0', () => {
    expect(toWaterFeatureIR(minimal).flowSpeed).toBe(0);
  });

  it('defaults shorelinePoints to empty array', () => {
    expect(toWaterFeatureIR(minimal).shorelinePoints).toEqual([]);
  });

  it('defaults isNavigable to true', () => {
    expect(toWaterFeatureIR(minimal).isNavigable).toBe(true);
  });

  it('defaults isDrinkable to true', () => {
    expect(toWaterFeatureIR(minimal).isDrinkable).toBe(true);
  });

  it('defaults transparency to 0.3', () => {
    expect(toWaterFeatureIR(minimal).transparency).toBe(0.3);
  });

  it('defaults modelAssetKey to null', () => {
    expect(toWaterFeatureIR(minimal).modelAssetKey).toBeNull();
  });

  it('defaults color to null', () => {
    expect(toWaterFeatureIR(minimal).color).toBeNull();
  });

  it('defaults settlementId to null', () => {
    expect(toWaterFeatureIR(minimal).settlementId).toBeNull();
  });

  it('defaults biome to null', () => {
    expect(toWaterFeatureIR(minimal).biome).toBeNull();
  });
});

// ─────────────────────────────────────────────
// Batch conversion
// ─────────────────────────────────────────────

describe('Water feature IR export - batch', () => {
  it('converts multiple water features', () => {
    const records = [
      { id: 'wf-1', worldId: 'w1', type: 'river', name: 'River A' },
      { id: 'wf-2', worldId: 'w1', type: 'lake', name: 'Lake B' },
      { id: 'wf-3', worldId: 'w1', type: 'marsh', name: 'Marsh C' },
    ];
    const irs = records.map(toWaterFeatureIR);
    expect(irs).toHaveLength(3);
    expect(irs[0].type).toBe('river');
    expect(irs[1].type).toBe('lake');
    expect(irs[2].type).toBe('marsh');
  });

  it('handles empty array', () => {
    const irs: WaterFeatureIR[] = [].map(toWaterFeatureIR);
    expect(irs).toEqual([]);
  });
});
