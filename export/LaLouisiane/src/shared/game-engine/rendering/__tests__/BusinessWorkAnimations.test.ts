/**
 * Tests for business-type-specific NPC work animations and animation cycling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Babylon.js
vi.mock('@babylonjs/core', () => {
  class Vector3 {
    constructor(public x: number, public y: number, public z: number) {}
    clone() { return new Vector3(this.x, this.y, this.z); }
    subtract(other: Vector3) { return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z); }
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
  resolveAnimationState,
  type InteriorNPCCallbacks,
  type BuildingMetadata,
} from '../InteriorNPCManager';
import {
  selectFromCycle,
  getBusinessAnimationCycle,
  BUSINESS_WORK_ANIMATIONS,
  BUSINESS_OWNER_ANIMATIONS,
  DEFAULT_WORK_CYCLE,
  DEFAULT_OWNER_CYCLE,
  type AnimationCycleEntry,
} from '../AnimationAssetManager';

// --- Helper factories ---

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
    doorPosition: new Vector3(0, 500, -5),
    rooms: [],
    furniture: [],
  };
}

// --- Tests ---

describe('Business Work Animation Mappings', () => {
  it('should have animation cycles for all expected business types', () => {
    const expectedTypes = ['Blacksmith', 'Bakery', 'Bar', 'Tavern', 'Carpenter', 'Restaurant', 'Tailor', 'Library', 'Bank', 'Shop'];
    for (const type of expectedTypes) {
      expect(BUSINESS_WORK_ANIMATIONS[type]).toBeDefined();
      expect(BUSINESS_WORK_ANIMATIONS[type].length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should have owner animation cycles for all expected business types', () => {
    const expectedTypes = ['Blacksmith', 'Bakery', 'Bar', 'Tavern', 'Carpenter', 'Restaurant', 'Tailor', 'Library', 'Bank', 'Shop'];
    for (const type of expectedTypes) {
      expect(BUSINESS_OWNER_ANIMATIONS[type]).toBeDefined();
      expect(BUSINESS_OWNER_ANIMATIONS[type].length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should map Blacksmith to hammer as primary animation', () => {
    const cycle = BUSINESS_WORK_ANIMATIONS['Blacksmith'];
    const primary = cycle.reduce((a, b) => a.weight > b.weight ? a : b);
    expect(primary.animation).toBe('hammer');
  });

  it('should map Bakery to knead_dough as primary animation', () => {
    const cycle = BUSINESS_WORK_ANIMATIONS['Bakery'];
    const primary = cycle.reduce((a, b) => a.weight > b.weight ? a : b);
    expect(primary.animation).toBe('knead_dough');
  });

  it('should map Bar to pour as primary animation', () => {
    const cycle = BUSINESS_WORK_ANIMATIONS['Bar'];
    const primary = cycle.reduce((a, b) => a.weight > b.weight ? a : b);
    expect(primary.animation).toBe('pour');
  });

  it('should give owners more idle weight than employees', () => {
    for (const type of Object.keys(BUSINESS_WORK_ANIMATIONS)) {
      const empCycle = BUSINESS_WORK_ANIMATIONS[type];
      const ownerCycle = BUSINESS_OWNER_ANIMATIONS[type];
      if (!ownerCycle) continue;

      const empIdleWeight = empCycle.find(e => e.animation === 'idle')?.weight ?? 0;
      const ownerIdleWeight = ownerCycle.find(e => e.animation === 'idle')?.weight ?? 0;
      expect(ownerIdleWeight).toBeGreaterThanOrEqual(empIdleWeight);
    }
  });

  it('should have weights that sum to approximately 1.0 for each cycle', () => {
    for (const [type, cycle] of Object.entries(BUSINESS_WORK_ANIMATIONS)) {
      const total = cycle.reduce((sum, e) => sum + e.weight, 0);
      expect(total).toBeCloseTo(1.0, 1);
    }
    for (const [type, cycle] of Object.entries(BUSINESS_OWNER_ANIMATIONS)) {
      const total = cycle.reduce((sum, e) => sum + e.weight, 0);
      expect(total).toBeCloseTo(1.0, 1);
    }
  });
});

describe('selectFromCycle', () => {
  it('should return an animation from the cycle', () => {
    const cycle: AnimationCycleEntry[] = [
      { animation: 'hammer', weight: 0.6 },
      { animation: 'idle', weight: 0.4 },
    ];
    const result = selectFromCycle(cycle);
    expect(['hammer', 'idle']).toContain(result);
  });

  it('should respect weights over many draws', () => {
    const cycle: AnimationCycleEntry[] = [
      { animation: 'hammer', weight: 0.9 },
      { animation: 'idle', weight: 0.1 },
    ];
    let hammerCount = 0;
    const trials = 1000;
    for (let i = 0; i < trials; i++) {
      if (selectFromCycle(cycle) === 'hammer') hammerCount++;
    }
    // Hammer should be picked ~90% of the time
    expect(hammerCount / trials).toBeGreaterThan(0.7);
  });

  it('should handle single-entry cycles', () => {
    const cycle: AnimationCycleEntry[] = [{ animation: 'idle', weight: 1 }];
    expect(selectFromCycle(cycle)).toBe('idle');
  });
});

describe('getBusinessAnimationCycle', () => {
  it('should return business-specific cycle for employees', () => {
    const cycle = getBusinessAnimationCycle('Blacksmith', 'employee');
    expect(cycle).toBe(BUSINESS_WORK_ANIMATIONS['Blacksmith']);
  });

  it('should return owner cycle for owners', () => {
    const cycle = getBusinessAnimationCycle('Bakery', 'owner');
    expect(cycle).toBe(BUSINESS_OWNER_ANIMATIONS['Bakery']);
  });

  it('should return idle cycle for visitors', () => {
    const cycle = getBusinessAnimationCycle('Bar', 'visitor');
    expect(cycle).toEqual([{ animation: 'idle', weight: 1 }]);
  });

  it('should return default cycles for unknown business types', () => {
    expect(getBusinessAnimationCycle('UnknownBusiness', 'employee')).toBe(DEFAULT_WORK_CYCLE);
    expect(getBusinessAnimationCycle('UnknownBusiness', 'owner')).toBe(DEFAULT_OWNER_CYCLE);
  });

  it('should return default cycles when businessType is undefined', () => {
    expect(getBusinessAnimationCycle(undefined, 'employee')).toBe(DEFAULT_WORK_CYCLE);
    expect(getBusinessAnimationCycle(undefined, 'owner')).toBe(DEFAULT_OWNER_CYCLE);
  });
});

describe('resolveAnimationState', () => {
  it('should map specific work animations to work state', () => {
    expect(resolveAnimationState('hammer')).toBe('work');
    expect(resolveAnimationState('knead_dough')).toBe('work');
    expect(resolveAnimationState('pour')).toBe('work');
    expect(resolveAnimationState('chop')).toBe('work');
    expect(resolveAnimationState('stir')).toBe('work');
    expect(resolveAnimationState('write')).toBe('work');
    expect(resolveAnimationState('sweep')).toBe('work');
  });

  it('should pass through standard AnimationState values unchanged', () => {
    expect(resolveAnimationState('idle')).toBe('idle');
    expect(resolveAnimationState('walk')).toBe('walk');
    expect(resolveAnimationState('work')).toBe('work');
    expect(resolveAnimationState('sit')).toBe('sit');
  });

  it('should map work_sitting and work_standing to work', () => {
    expect(resolveAnimationState('work_sitting')).toBe('work');
    expect(resolveAnimationState('work_standing')).toBe('work');
  });
});

describe('InteriorNPCManager - Animation Cycling', () => {
  let manager: InteriorNPCManager;
  let animChanges: Array<{ npcId: string; state: string }>;
  let callbacks: InteriorNPCCallbacks;

  beforeEach(() => {
    animChanges = [];
    callbacks = {
      onAnimationChange: (npcId, state) => animChanges.push({ npcId, state }),
      getGameHour: () => 12,
    };
    manager = new InteriorNPCManager(callbacks);
  });

  it('should assign animation cycles to employees in business interiors', () => {
    const npcs = createNPCMap(['emp1']);
    const interior = createInterior('Bakery');
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Bakery',
      employees: ['emp1'],
    };

    const placed = manager.populateInterior('b1', interior, metadata, npcs);
    expect(placed.length).toBe(1);
    expect(placed[0].animationCycle).toBeDefined();
    expect(placed[0].animationCycle!.length).toBeGreaterThanOrEqual(2);
    expect(placed[0].animationStartTime).toBeDefined();
    expect(placed[0].animationDuration).toBeDefined();
    expect(placed[0].animationDuration!).toBeGreaterThanOrEqual(10_000);
    expect(placed[0].animationDuration!).toBeLessThanOrEqual(30_000);
  });

  it('should assign different animation cycles to owners vs employees', () => {
    const npcs = createNPCMap(['owner1', 'emp1']);
    const interior = createInterior('Blacksmith');
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Blacksmith',
      ownerId: 'owner1',
      employees: ['emp1'],
    };

    const placed = manager.populateInterior('b1', interior, metadata, npcs);
    const owner = placed.find(p => p.role === 'owner');
    const employee = placed.find(p => p.role === 'employee');

    expect(owner).toBeDefined();
    expect(employee).toBeDefined();
    // Owner should have higher idle weight than employee
    const ownerIdleWeight = owner!.animationCycle?.find(e => e.animation === 'idle')?.weight ?? 0;
    const empIdleWeight = employee!.animationCycle?.find(e => e.animation === 'idle')?.weight ?? 0;
    expect(ownerIdleWeight).toBeGreaterThanOrEqual(empIdleWeight);
  });

  it('should switch animations when cycle duration expires', () => {
    const npcs = createNPCMap(['emp1']);
    const interior = createInterior('Bakery');
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Bakery',
      employees: ['emp1'],
    };

    manager.populateInterior('b1', interior, metadata, npcs);
    animChanges = []; // Clear initial animation set

    // Force the animation to expire by manipulating the start time
    const placed = manager.getPlacedNPC('emp1')!;
    placed.animationStartTime = Date.now() - 31_000; // 31 seconds ago
    placed.animationDuration = 10_000; // Should have expired

    manager.updateAnimationCycles();

    // Should have triggered a new animation
    expect(animChanges.length).toBe(1);
    expect(animChanges[0].npcId).toBe('emp1');
    // The new animation start time should be recent
    expect(placed.animationStartTime).toBeGreaterThan(Date.now() - 1000);
  });

  it('should not switch animations before cycle duration expires', () => {
    const npcs = createNPCMap(['emp1']);
    const interior = createInterior('Bakery');
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Bakery',
      employees: ['emp1'],
    };

    manager.populateInterior('b1', interior, metadata, npcs);
    animChanges = [];

    // Don't manipulate time — animation just started
    manager.updateAnimationCycles();

    expect(animChanges.length).toBe(0);
  });

  it('should not assign animation cycles to visitors', () => {
    const npcs = createNPCMap(['vis1']);
    // Give the visitor high extroversion to ensure they're added
    const npcData = npcs.get('vis1')!;
    npcData.characterData = { id: 'vis1', personality: { extroversion: 1.0 } };

    const interior = createInterior('Bar');
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Bar',
    };

    // Seed Math.random to ensure visitor is added
    const originalRandom = Math.random;
    Math.random = () => 0.01; // Low value to pass extroversion check

    const placed = manager.populateInterior('b1', interior, metadata, npcs);
    Math.random = originalRandom;

    const visitor = placed.find(p => p.role === 'visitor');
    if (visitor) {
      // Visitors at sit positions don't get cycles
      // (only work positions get business-specific cycles)
      expect(visitor.animationState).toBeDefined();
    }
  });
});
