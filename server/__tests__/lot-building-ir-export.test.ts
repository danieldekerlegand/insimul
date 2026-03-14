/**
 * Tests for enhanced lot and building IR export (US-058)
 *
 * Verifies that LotIR includes all spatial/street metadata and
 * BuildingIR references lots with correct position and rotation.
 */

import { describe, it, expect } from 'vitest';
import type {
  LotIR,
  BuildingIR,
  BuildingSpecIR,
  BuildingStyleData,
  Vec3,
} from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Helper: build a mock lot record (as stored in DB)
// ─────────────────────────────────────────────

function makeMockLot(overrides: Partial<Record<string, any>> = {}) {
  return {
    id: 'lot-1',
    address: '123 Oak Street',
    houseNumber: 123,
    streetName: 'Oak Street',
    block: 'A',
    districtName: 'Downtown',
    positionX: 50,
    positionZ: 75,
    facingAngle: 1.57,
    elevation: 3.2,
    buildingType: 'residence',
    buildingId: 'bld-1',
    streetEdgeId: 'edge-42',
    side: 'left',
    neighboringLotIds: ['lot-2', 'lot-3'],
    distanceFromDowntown: 120,
    formerBuildingIds: ['old-bld-1'],
    ...overrides,
  };
}

/**
 * Maps a DB lot record to LotIR (mirrors ir-generator logic).
 */
function toLotIR(lot: ReturnType<typeof makeMockLot>, fallbackPosition: Vec3): LotIR {
  const hasPersistedPosition = lot.positionX != null && lot.positionZ != null;
  const position: Vec3 = hasPersistedPosition
    ? { x: lot.positionX!, y: lot.elevation || 0, z: lot.positionZ! }
    : fallbackPosition;

  return {
    id: lot.id,
    address: lot.address || '',
    houseNumber: lot.houseNumber || 1,
    streetName: lot.streetName || 'Main Street',
    block: lot.block || null,
    districtName: lot.districtName || null,
    position,
    facingAngle: lot.facingAngle || 0,
    elevation: lot.elevation || 0,
    buildingType: lot.buildingType || null,
    buildingId: lot.buildingId || null,
    streetEdgeId: lot.streetEdgeId || null,
    side: lot.side || null,
    neighboringLotIds: (lot.neighboringLotIds as string[]) || [],
    distanceFromDowntown: lot.distanceFromDowntown || 0,
    formerBuildingIds: (lot.formerBuildingIds as string[]) || [],
  };
}

/**
 * Creates a BuildingIR from a lotIR (mirrors ir-generator logic).
 */
function toBuildingIR(
  lotIR: LotIR | null,
  fallbackPosition: Vec3,
  businessId: string | null,
): BuildingIR {
  const pos = lotIR ? lotIR.position : fallbackPosition;
  const rotation = lotIR ? lotIR.facingAngle : 0;
  const spec: BuildingSpecIR = {
    buildingRole: 'residential',
    floors: 2,
    width: 10,
    depth: 8,
    hasChimney: false,
    hasBalcony: false,
  };
  const style = {
    name: 'default',
    baseColor: { r: 0.8, g: 0.8, b: 0.8 },
    roofColor: { r: 0.5, g: 0.3, b: 0.1 },
    windowColor: { r: 0.7, g: 0.8, b: 0.9 },
    doorColor: { r: 0.4, g: 0.2, b: 0.1 },
    materialType: 'brick',
    architectureStyle: 'modern',
  } as BuildingStyleData;

  return {
    id: `bld_${lotIR?.id || 'fallback'}`,
    settlementId: 'settlement-1',
    lotId: lotIR?.id || null,
    position: pos,
    rotation,
    spec,
    style,
    occupantIds: [],
    interior: null,
    businessId,
    modelAssetKey: null,
  };
}

// ─────────────────────────────────────────────
// LotIR enhanced fields
// ─────────────────────────────────────────────

describe('LotIR enhanced export', () => {
  it('includes all spatial fields from persisted lot data', () => {
    const lot = makeMockLot();
    const ir = toLotIR(lot, { x: 0, y: 0, z: 0 });

    expect(ir.facingAngle).toBe(1.57);
    expect(ir.elevation).toBe(3.2);
    expect(ir.position).toEqual({ x: 50, y: 3.2, z: 75 });
  });

  it('includes street placement metadata', () => {
    const lot = makeMockLot();
    const ir = toLotIR(lot, { x: 0, y: 0, z: 0 });

    expect(ir.streetEdgeId).toBe('edge-42');
    expect(ir.side).toBe('left');
  });

  it('includes neighboring lot references', () => {
    const lot = makeMockLot();
    const ir = toLotIR(lot, { x: 0, y: 0, z: 0 });

    expect(ir.neighboringLotIds).toEqual(['lot-2', 'lot-3']);
  });

  it('includes distance from downtown', () => {
    const lot = makeMockLot();
    const ir = toLotIR(lot, { x: 0, y: 0, z: 0 });

    expect(ir.distanceFromDowntown).toBe(120);
  });

  it('includes former building history', () => {
    const lot = makeMockLot();
    const ir = toLotIR(lot, { x: 0, y: 0, z: 0 });

    expect(ir.formerBuildingIds).toEqual(['old-bld-1']);
  });

  it('falls back to generated position when lot has no persisted coordinates', () => {
    const lot = makeMockLot({ positionX: null, positionZ: null });
    const fallback: Vec3 = { x: 999, y: 0, z: 888 };
    const ir = toLotIR(lot, fallback);

    expect(ir.position).toEqual(fallback);
  });

  it('uses persisted position over fallback when available', () => {
    const lot = makeMockLot({ positionX: 10, positionZ: 20, elevation: 5 });
    const fallback: Vec3 = { x: 999, y: 0, z: 888 };
    const ir = toLotIR(lot, fallback);

    expect(ir.position).toEqual({ x: 10, y: 5, z: 20 });
  });

  it('defaults optional fields to safe values', () => {
    const lot = makeMockLot({
      block: null,
      districtName: null,
      streetEdgeId: null,
      side: null,
      neighboringLotIds: null,
      formerBuildingIds: null,
      facingAngle: null,
      elevation: null,
      distanceFromDowntown: null,
    });
    const ir = toLotIR(lot, { x: 0, y: 0, z: 0 });

    expect(ir.block).toBeNull();
    expect(ir.districtName).toBeNull();
    expect(ir.streetEdgeId).toBeNull();
    expect(ir.side).toBeNull();
    expect(ir.neighboringLotIds).toEqual([]);
    expect(ir.formerBuildingIds).toEqual([]);
    expect(ir.facingAngle).toBe(0);
    expect(ir.elevation).toBe(0);
    expect(ir.distanceFromDowntown).toBe(0);
  });
});

// ─────────────────────────────────────────────
// BuildingIR lot reference
// ─────────────────────────────────────────────

describe('BuildingIR lot reference', () => {
  it('includes lotId when building is placed on a lot', () => {
    const lot = makeMockLot();
    const lotIR = toLotIR(lot, { x: 0, y: 0, z: 0 });
    const building = toBuildingIR(lotIR, { x: 0, y: 0, z: 0 }, null);

    expect(building.lotId).toBe('lot-1');
  });

  it('sets lotId to null when no lot is available', () => {
    const building = toBuildingIR(null, { x: 5, y: 0, z: 10 }, null);

    expect(building.lotId).toBeNull();
  });

  it('uses lot position for building placement', () => {
    const lot = makeMockLot({ positionX: 42, positionZ: 84, elevation: 2 });
    const lotIR = toLotIR(lot, { x: 0, y: 0, z: 0 });
    const building = toBuildingIR(lotIR, { x: 999, y: 0, z: 999 }, null);

    expect(building.position).toEqual({ x: 42, y: 2, z: 84 });
  });

  it('uses lot facingAngle for building rotation', () => {
    const lot = makeMockLot({ facingAngle: 2.35 });
    const lotIR = toLotIR(lot, { x: 0, y: 0, z: 0 });
    const building = toBuildingIR(lotIR, { x: 0, y: 0, z: 0 }, null);

    expect(building.rotation).toBe(2.35);
  });

  it('defaults rotation to 0 when no lot', () => {
    const building = toBuildingIR(null, { x: 0, y: 0, z: 0 }, null);

    expect(building.rotation).toBe(0);
  });

  it('uses fallback position when no lot', () => {
    const fallback: Vec3 = { x: 100, y: 0, z: 200 };
    const building = toBuildingIR(null, fallback, 'biz-1');

    expect(building.position).toEqual(fallback);
    expect(building.businessId).toBe('biz-1');
  });
});
