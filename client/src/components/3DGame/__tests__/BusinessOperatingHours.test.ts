/**
 * Tests for business operating hours, shift-aware employee filtering,
 * and correct NPC placement in businesses.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Babylon.js
vi.mock('@babylonjs/core', () => {
  class Vector3 {
    constructor(public x: number, public y: number, public z: number) {}
    clone() { return new Vector3(this.x, this.y, this.z); }
    subtract(other: Vector3) { return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z); }
    static Distance(a: Vector3, b: Vector3) {
      const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  }
  class Mesh {
    position = new Vector3(0, 0, 0);
    rotation = { y: 0 };
    private _enabled = true;
    isEnabled() { return this._enabled; }
    setEnabled(v: boolean) { this._enabled = v; }
  }
  return { Vector3, Mesh };
});

vi.mock('../NPCAnimationController', () => ({}));

import { Vector3, Mesh } from '@babylonjs/core';
import {
  InteriorNPCManager,
  isBusinessOpen,
  isShiftActive,
  BUSINESS_OPERATING_HOURS,
  type InteriorNPCCallbacks,
  type BuildingMetadata,
} from '../InteriorNPCManager';

// --- Helpers ---

function createMockMesh(x = 0, y = 0, z = 0): Mesh {
  const mesh = new Mesh();
  mesh.position = new Vector3(x, y, z);
  return mesh;
}

function createNPCMap(ids: string[]): Map<string, { mesh: Mesh; characterData?: any }> {
  const map = new Map<string, { mesh: Mesh; characterData?: any }>();
  for (const id of ids) {
    map.set(id, { mesh: createMockMesh(Math.random() * 10, 0, Math.random() * 10), characterData: { id } });
  }
  return map;
}

function createInterior(businessType = 'Shop'): any {
  return {
    id: 'interior-1',
    buildingId: 'building-1',
    buildingType: 'business',
    businessType,
    position: new Vector3(0, 500, 0),
    width: 10,
    depth: 10,
    height: 4,
    doorPosition: new Vector3(0, 500, 5),
  };
}

// --- isBusinessOpen tests ---

describe('isBusinessOpen', () => {
  it('returns true for a shop during its open hours (9-19)', () => {
    expect(isBusinessOpen('Shop', 9)).toBe(true);
    expect(isBusinessOpen('Shop', 12)).toBe(true);
    expect(isBusinessOpen('Shop', 18)).toBe(true);
  });

  it('returns false for a shop outside its hours', () => {
    expect(isBusinessOpen('Shop', 8)).toBe(false);
    expect(isBusinessOpen('Shop', 19)).toBe(false);
    expect(isBusinessOpen('Shop', 3)).toBe(false);
  });

  it('handles overnight range for bars (16-2)', () => {
    expect(isBusinessOpen('Bar', 16)).toBe(true);
    expect(isBusinessOpen('Bar', 20)).toBe(true);
    expect(isBusinessOpen('Bar', 23)).toBe(true);
    expect(isBusinessOpen('Bar', 1)).toBe(true);
    // Closed during the day
    expect(isBusinessOpen('Bar', 10)).toBe(false);
    expect(isBusinessOpen('Bar', 2)).toBe(false);
    expect(isBusinessOpen('Bar', 15)).toBe(false);
  });

  it('hospital is always open (0-24)', () => {
    expect(isBusinessOpen('Hospital', 0)).toBe(true);
    expect(isBusinessOpen('Hospital', 12)).toBe(true);
    expect(isBusinessOpen('Hospital', 23)).toBe(true);
  });

  it('uses default hours for unknown business types', () => {
    // Default: 7-20
    expect(isBusinessOpen('UnknownType', 10)).toBe(true);
    expect(isBusinessOpen('UnknownType', 5)).toBe(false);
    expect(isBusinessOpen(undefined, 10)).toBe(true);
  });

  it('bakery opens early (6-18)', () => {
    expect(isBusinessOpen('Bakery', 6)).toBe(true);
    expect(isBusinessOpen('Bakery', 5)).toBe(false);
    expect(isBusinessOpen('Bakery', 17)).toBe(true);
    expect(isBusinessOpen('Bakery', 18)).toBe(false);
  });
});

// --- isShiftActive tests ---

describe('isShiftActive', () => {
  it('day shift covers all hours for single-range businesses', () => {
    // Shop: 9-19, single range, day shift covers everything
    expect(isShiftActive('day', 'Shop', 10)).toBe(true);
    expect(isShiftActive('day', 'Shop', 18)).toBe(true);
    // Night shift never active for single-range
    expect(isShiftActive('night', 'Shop', 10)).toBe(false);
  });

  it('hospital splits day/night at 6/18', () => {
    // Day: 6-18
    expect(isShiftActive('day', 'Hospital', 6)).toBe(true);
    expect(isShiftActive('day', 'Hospital', 12)).toBe(true);
    expect(isShiftActive('day', 'Hospital', 17)).toBe(true);
    expect(isShiftActive('day', 'Hospital', 18)).toBe(false);
    // Night: 18-6
    expect(isShiftActive('night', 'Hospital', 18)).toBe(true);
    expect(isShiftActive('night', 'Hospital', 23)).toBe(true);
    expect(isShiftActive('night', 'Hospital', 3)).toBe(true);
    expect(isShiftActive('night', 'Hospital', 6)).toBe(false);
  });

  it('bar splits day/night at midpoint of overnight range', () => {
    // Bar: 16-2, midpoint = (16+24+2)/2 = 21
    // Day shift: 16-21
    expect(isShiftActive('day', 'Bar', 16)).toBe(true);
    expect(isShiftActive('day', 'Bar', 20)).toBe(true);
    expect(isShiftActive('day', 'Bar', 21)).toBe(false);
    // Night shift: 21-2
    expect(isShiftActive('night', 'Bar', 21)).toBe(true);
    expect(isShiftActive('night', 'Bar', 23)).toBe(true);
    expect(isShiftActive('night', 'Bar', 1)).toBe(true);
  });
});

// --- InteriorNPCManager integration ---

describe('InteriorNPCManager business population', () => {
  let manager: InteriorNPCManager;
  let gameHour: number;

  beforeEach(() => {
    gameHour = 12;
    const callbacks: InteriorNPCCallbacks = {
      onAnimationChange: vi.fn(),
      onFaceDirection: vi.fn(),
      onNPCGreeting: vi.fn(),
      getGameHour: () => gameHour,
    };
    manager = new InteriorNPCManager(callbacks);
  });

  it('places owner and day-shift employees during business hours', () => {
    const allNPCs = createNPCMap(['owner-1', 'emp-day-1', 'emp-day-2']);
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Shop',
      ownerId: 'owner-1',
      employees: [
        { id: 'emp-day-1', shift: 'day' },
        { id: 'emp-day-2', shift: 'day' },
      ],
    };
    gameHour = 12; // Shop open 9-19
    const placed = manager.populateInterior('bld-1', createInterior(), metadata, allNPCs);

    const ids = placed.map(p => p.npcId);
    expect(ids).toContain('owner-1');
    expect(ids).toContain('emp-day-1');
    expect(ids).toContain('emp-day-2');
    expect(placed.find(p => p.npcId === 'owner-1')!.role).toBe('owner');
    expect(placed.find(p => p.npcId === 'emp-day-1')!.role).toBe('employee');
  });

  it('excludes night-shift employees during the day for single-range businesses', () => {
    const allNPCs = createNPCMap(['owner-1', 'emp-day', 'emp-night']);
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Shop',
      ownerId: 'owner-1',
      employees: [
        { id: 'emp-day', shift: 'day' },
        { id: 'emp-night', shift: 'night' },
      ],
    };
    gameHour = 12;
    const placed = manager.populateInterior('bld-1', createInterior(), metadata, allNPCs);

    const ids = placed.map(p => p.npcId);
    expect(ids).toContain('emp-day');
    expect(ids).not.toContain('emp-night');
  });

  it('places no employees when business is closed', () => {
    const allNPCs = createNPCMap(['owner-1', 'emp-1']);
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Shop',
      ownerId: 'owner-1',
      employees: [{ id: 'emp-1', shift: 'day' }],
    };
    gameHour = 22; // Shop closed at 19
    const placed = manager.populateInterior('bld-1', createInterior(), metadata, allNPCs);

    const ids = placed.map(p => p.npcId);
    expect(ids).not.toContain('owner-1');
    expect(ids).not.toContain('emp-1');
  });

  it('uses correct hours for bar (overnight business)', () => {
    const allNPCs = createNPCMap(['owner-1', 'emp-day', 'emp-night']);
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Bar',
      ownerId: 'owner-1',
      employees: [
        { id: 'emp-day', shift: 'day' },
        { id: 'emp-night', shift: 'night' },
      ],
    };

    // Bar open 16-2, day shift: 16-21, night shift: 21-2
    gameHour = 18;
    const placed = manager.populateInterior('bld-1', createInterior('Bar'), metadata, allNPCs);
    const ids = placed.map(p => p.npcId);
    expect(ids).toContain('owner-1');
    expect(ids).toContain('emp-day');
    expect(ids).not.toContain('emp-night');
  });

  it('bar night shift employees appear late at night', () => {
    const allNPCs = createNPCMap(['owner-1', 'emp-day', 'emp-night']);
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Bar',
      ownerId: 'owner-1',
      employees: [
        { id: 'emp-day', shift: 'day' },
        { id: 'emp-night', shift: 'night' },
      ],
    };

    gameHour = 23; // Night shift: 21-2
    const placed = manager.populateInterior('bld-1', createInterior('Bar'), metadata, allNPCs);
    const ids = placed.map(p => p.npcId);
    expect(ids).toContain('emp-night');
    expect(ids).not.toContain('emp-day');
  });

  it('hospital has both shifts, night employees appear at night', () => {
    const allNPCs = createNPCMap(['owner-1', 'emp-day', 'emp-night']);
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Hospital',
      ownerId: 'owner-1',
      employees: [
        { id: 'emp-day', shift: 'day' },
        { id: 'emp-night', shift: 'night' },
      ],
    };

    gameHour = 22; // Night shift: 18-6
    const placed = manager.populateInterior('bld-1', createInterior('Hospital'), metadata, allNPCs);
    const ids = placed.map(p => p.npcId);
    expect(ids).toContain('owner-1'); // Hospital always open
    expect(ids).toContain('emp-night');
    expect(ids).not.toContain('emp-day');
  });

  it('treats string employee entries as day shift (backward compat)', () => {
    const allNPCs = createNPCMap(['owner-1', 'emp-1']);
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Shop',
      ownerId: 'owner-1',
      employees: ['emp-1'], // Legacy string format
    };
    gameHour = 12;
    const placed = manager.populateInterior('bld-1', createInterior(), metadata, allNPCs);
    const ids = placed.map(p => p.npcId);
    expect(ids).toContain('emp-1');
  });

  it('residence always shows occupants regardless of hour', () => {
    const allNPCs = createNPCMap(['owner-1']);
    const metadata: BuildingMetadata = {
      buildingType: 'residence',
      ownerId: 'owner-1',
    };
    gameHour = 3; // middle of night
    const placed = manager.populateInterior('bld-1', {
      ...createInterior(),
      buildingType: 'residence',
    }, metadata, allNPCs);
    const ids = placed.map(p => p.npcId);
    expect(ids).toContain('owner-1');
  });
});
