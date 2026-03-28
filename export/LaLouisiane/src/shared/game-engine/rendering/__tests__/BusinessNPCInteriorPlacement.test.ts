/**
 * Tests for business owner/employee NPC placement inside building interiors.
 * Verifies that occupantIds flow correctly through the data pipeline
 * and that business hours control NPC presence.
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
  isBusinessOpen,
  isShiftActive,
  BUSINESS_OPERATING_HOURS,
  type InteriorNPCCallbacks,
  type BuildingMetadata,
} from '../InteriorNPCManager';

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

function createInterior(overrides: Partial<any> = {}): any {
  return {
    id: 'interior-1',
    buildingId: 'building-1',
    buildingType: overrides.buildingType ?? 'business',
    businessType: overrides.businessType ?? 'Shop',
    position: new Vector3(0, 500, 0),
    width: 10,
    depth: 10,
    height: 4,
    doorPosition: new Vector3(0, 500, 5),
    exitPosition: new Vector3(0, 0, 6),
    roomMesh: createMockMesh(),
    furniture: [],
    ...overrides,
  };
}

function createCallbacks(overrides: Partial<InteriorNPCCallbacks> = {}): InteriorNPCCallbacks {
  return {
    onAnimationChange: overrides.onAnimationChange ?? vi.fn(),
    onFaceDirection: overrides.onFaceDirection ?? vi.fn(),
    onNPCGreeting: overrides.onNPCGreeting ?? vi.fn(),
    getGameHour: overrides.getGameHour ?? (() => 12),
    onNPCEnterInterior: overrides.onNPCEnterInterior ?? vi.fn(),
    onNPCExitInterior: overrides.onNPCExitInterior ?? vi.fn(),
  };
}

// --- Tests ---

describe('Business NPC interior placement', () => {
  describe('owner and employee identification from metadata', () => {
    it('places owner when ownerId is provided in metadata', () => {
      const npcMap = createNPCMap(['owner-1', 'emp-1']);
      const manager = new InteriorNPCManager(createCallbacks());
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner-1',
        employees: ['emp-1'],
      };

      const placed = manager.populateInterior('bld-1', createInterior(), metadata, npcMap);
      expect(placed.length).toBe(2);

      const owner = placed.find(p => p.npcId === 'owner-1');
      expect(owner).toBeDefined();
      expect(owner!.role).toBe('owner');

      const employee = placed.find(p => p.npcId === 'emp-1');
      expect(employee).toBeDefined();
      expect(employee!.role).toBe('employee');
    });

    it('places owner at counter/desk with work animation', () => {
      const animChange = vi.fn();
      const npcMap = createNPCMap(['owner-1']);
      const manager = new InteriorNPCManager(createCallbacks({ onAnimationChange: animChange }));
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner-1',
      };

      manager.populateInterior('bld-1', createInterior(), metadata, npcMap);

      // Owner should get 'work' animation (counter furniture for Bakery)
      expect(animChange).toHaveBeenCalledWith('owner-1', 'work');
    });

    it('assigns owner to counter before desk', () => {
      const npcMap = createNPCMap(['owner-1']);
      const manager = new InteriorNPCManager(createCallbacks());
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Shop', // Shop has counter first
        ownerId: 'owner-1',
      };

      manager.populateInterior('bld-1', createInterior({ businessType: 'Shop' }), metadata, npcMap);

      const assignment = manager.getAssignment('bld-1', 'owner-1');
      expect(assignment).toBeDefined();
      expect(assignment!.furnitureName).toBe('counter');
    });

    it('assigns owner to desk when counter is not available', () => {
      const npcMap = createNPCMap(['owner-1']);
      const manager = new InteriorNPCManager(createCallbacks());
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Hospital', // Hospital has desk, not counter
        ownerId: 'owner-1',
      };

      manager.populateInterior('bld-1', createInterior({ businessType: 'Hospital' }), metadata, npcMap);

      const assignment = manager.getAssignment('bld-1', 'owner-1');
      expect(assignment).toBeDefined();
      expect(assignment!.furnitureName).toBe('desk');
    });

    it('employees get workstation/shelf positions', () => {
      const npcMap = createNPCMap(['owner-1', 'emp-1', 'emp-2']);
      const manager = new InteriorNPCManager(createCallbacks());
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Shop',
        ownerId: 'owner-1',
        employees: ['emp-1', 'emp-2'],
      };

      manager.populateInterior('bld-1', createInterior({ businessType: 'Shop' }), metadata, npcMap);

      // Owner gets counter, employees get shelf1 and storage
      const ownerAssign = manager.getAssignment('bld-1', 'owner-1');
      const emp1Assign = manager.getAssignment('bld-1', 'emp-1');
      const emp2Assign = manager.getAssignment('bld-1', 'emp-2');

      expect(ownerAssign!.furnitureName).toBe('counter');
      expect(emp1Assign!.furnitureName).toBe('shelf1');
      expect(emp2Assign!.furnitureName).toBe('storage');
    });

    it('does not place NPCs when metadata has no ownerId or employees', () => {
      const npcMap = createNPCMap(['npc-1']);
      const manager = new InteriorNPCManager(createCallbacks());
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        // No ownerId, no employees
      };

      const placed = manager.populateInterior('bld-1', createInterior(), metadata, npcMap);
      // Only visitors may appear (random based on extroversion), but no guaranteed NPCs
      const nonVisitors = placed.filter(p => p.role !== 'visitor');
      expect(nonVisitors.length).toBe(0);
    });
  });

  describe('business operating hours', () => {
    it('isBusinessOpen returns true during open hours', () => {
      expect(isBusinessOpen('Bakery', 10)).toBe(true);  // 6-18
      expect(isBusinessOpen('Bakery', 6)).toBe(true);
      expect(isBusinessOpen('Bakery', 17)).toBe(true);
    });

    it('isBusinessOpen returns false outside open hours', () => {
      expect(isBusinessOpen('Bakery', 5)).toBe(false);
      expect(isBusinessOpen('Bakery', 18)).toBe(false);
      expect(isBusinessOpen('Bakery', 23)).toBe(false);
    });

    it('handles overnight business hours (bars)', () => {
      expect(isBusinessOpen('Bar', 18)).toBe(true);   // after 16
      expect(isBusinessOpen('Bar', 1)).toBe(true);    // before 2
      expect(isBusinessOpen('Bar', 10)).toBe(false);  // between 2-16
    });

    it('handles 24h businesses', () => {
      expect(isBusinessOpen('Hospital', 0)).toBe(true);
      expect(isBusinessOpen('Hospital', 12)).toBe(true);
      expect(isBusinessOpen('Hospital', 23)).toBe(true);
    });

    it('does not place owner/employees when business is closed', () => {
      const npcMap = createNPCMap(['owner-1', 'emp-1']);
      // Game hour = 5 AM, Bakery opens at 6
      const manager = new InteriorNPCManager(createCallbacks({ getGameHour: () => 5 }));
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner-1',
        employees: ['emp-1'],
      };

      const placed = manager.populateInterior('bld-1', createInterior(), metadata, npcMap);
      const staff = placed.filter(p => p.role === 'owner' || p.role === 'employee');
      expect(staff.length).toBe(0);
    });

    it('places owner/employees when business is open', () => {
      const npcMap = createNPCMap(['owner-1', 'emp-1']);
      // Game hour = 10 AM, Bakery is open (6-18)
      const manager = new InteriorNPCManager(createCallbacks({ getGameHour: () => 10 }));
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner-1',
        employees: ['emp-1'],
      };

      const placed = manager.populateInterior('bld-1', createInterior(), metadata, npcMap);
      expect(placed.find(p => p.npcId === 'owner-1')).toBeDefined();
      expect(placed.find(p => p.npcId === 'emp-1')).toBeDefined();
    });
  });

  describe('business closing removes employees/owner', () => {
    it('removes non-visitor NPCs when business closes during updateFromSchedules', () => {
      let gameHour = 12;
      const onExit = vi.fn();
      const manager = new InteriorNPCManager(createCallbacks({
        getGameHour: () => gameHour,
        onNPCExitInterior: onExit,
      }));
      const npcMap = createNPCMap(['owner-1', 'emp-1']);
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner-1',
        employees: ['emp-1'],
      };

      manager.populateInterior('bld-1', createInterior(), metadata, npcMap);
      expect(manager.getPlacedCount()).toBe(2);

      // Simulate business closing (Bakery closes at 18)
      gameHour = 19;
      manager.updateFromSchedules();

      expect(manager.getPlacedCount()).toBe(0);
      expect(onExit).toHaveBeenCalledWith('owner-1');
      expect(onExit).toHaveBeenCalledWith('emp-1');
    });

    it('keeps visitors when business closes', () => {
      let gameHour = 12;
      const manager = new InteriorNPCManager(createCallbacks({ getGameHour: () => gameHour }));
      const npcMap = createNPCMap(['owner-1', 'visitor-1']);

      // Populate with owner and manually add visitor via schedule
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Shop',
        ownerId: 'owner-1',
      };

      manager.populateInterior('bld-1', createInterior({ businessType: 'Shop' }), metadata, npcMap);
      manager.setNPCSource(() => npcMap);
      manager.setScheduleSource({
        getScheduledBuildingId: () => 'bld-1',
        getScheduledNPCIds: () => ['visitor-1'],
      });
      manager.updateFromSchedules();

      const visitorBefore = manager.getPlacedNPC('visitor-1');
      expect(visitorBefore).toBeDefined();
      expect(visitorBefore!.role).toBe('visitor');

      // Business closes
      gameHour = 20; // Shop closes at 19
      manager.updateFromSchedules();

      // Owner removed, visitor stays
      expect(manager.isNPCInside('owner-1')).toBe(false);
      expect(manager.isNPCInside('visitor-1')).toBe(true);
    });
  });

  describe('shift-based employee filtering', () => {
    it('isShiftActive returns correct values for day/night shifts', () => {
      // Normal business (Bakery 6-18): only day shift
      expect(isShiftActive('day', 'Bakery', 10)).toBe(true);
      expect(isShiftActive('night', 'Bakery', 10)).toBe(false);

      // 24h business (Hospital): day = 6-18, night = 18-6
      expect(isShiftActive('day', 'Hospital', 10)).toBe(true);
      expect(isShiftActive('night', 'Hospital', 10)).toBe(false);
      expect(isShiftActive('day', 'Hospital', 20)).toBe(false);
      expect(isShiftActive('night', 'Hospital', 20)).toBe(true);
    });

    it('only places employees on their active shift', () => {
      const npcMap = createNPCMap(['owner-1', 'day-emp', 'night-emp']);
      // Game hour = 10 AM — day shift active
      const manager = new InteriorNPCManager(createCallbacks({ getGameHour: () => 10 }));
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Hospital',
        ownerId: 'owner-1',
        employees: [
          { id: 'day-emp', shift: 'day' },
          { id: 'night-emp', shift: 'night' },
        ],
      };

      const placed = manager.populateInterior('bld-1', createInterior({ businessType: 'Hospital' }), metadata, npcMap);

      expect(placed.find(p => p.npcId === 'day-emp')).toBeDefined();
      expect(placed.find(p => p.npcId === 'night-emp')).toBeUndefined();
    });
  });

  describe('max occupants capacity', () => {
    it('respects MAX_INTERIOR_NPCS limit of 6', () => {
      const ids = ['owner', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'];
      const npcMap = createNPCMap(ids);
      const manager = new InteriorNPCManager(createCallbacks());
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Shop',
        ownerId: 'owner',
        employees: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7'],
      };

      const placed = manager.populateInterior('bld-1', createInterior({ businessType: 'Shop' }), metadata, npcMap);
      expect(placed.length).toBeLessThanOrEqual(6);
    });
  });

  describe('owner vs employee distinct behavior', () => {
    it('owner gets work animation at counter, employee gets work at different station', () => {
      const animChange = vi.fn();
      const npcMap = createNPCMap(['owner-1', 'emp-1']);
      const manager = new InteriorNPCManager(createCallbacks({ onAnimationChange: animChange }));
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner-1',
        employees: ['emp-1'],
      };

      manager.populateInterior('bld-1', createInterior(), metadata, npcMap);

      // Both get 'work' animation but at different furniture positions
      expect(animChange).toHaveBeenCalledWith('owner-1', 'work');
      expect(animChange).toHaveBeenCalledWith('emp-1', 'work');

      // Verify they're at different positions
      const ownerPos = manager.getPlacedNPC('owner-1')!.interiorPosition;
      const empPos = manager.getPlacedNPC('emp-1')!.interiorPosition;
      const samePosition = Math.abs(ownerPos.x - empPos.x) < 0.01 && Math.abs(ownerPos.z - empPos.z) < 0.01;
      expect(samePosition).toBe(false);
    });

    it('owner at shop counter gets idle animation (shopkeeper standing)', () => {
      const animChange = vi.fn();
      const npcMap = createNPCMap(['owner-1']);
      const manager = new InteriorNPCManager(createCallbacks({ onAnimationChange: animChange }));
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Shop',
        ownerId: 'owner-1',
      };

      manager.populateInterior('bld-1', createInterior({ businessType: 'Shop' }), metadata, npcMap);

      // Shop counter has 'idle' animation (shopkeeper standing behind counter)
      expect(animChange).toHaveBeenCalledWith('owner-1', 'idle');
    });
  });

  describe('persistent furniture assignments', () => {
    it('NPCs return to same furniture on re-entry', () => {
      const npcMap = createNPCMap(['owner-1', 'emp-1']);
      const manager = new InteriorNPCManager(createCallbacks());
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Shop',
        ownerId: 'owner-1',
        employees: ['emp-1'],
      };

      // First visit
      manager.populateInterior('bld-1', createInterior({ businessType: 'Shop' }), metadata, npcMap);
      const firstOwnerAssign = manager.getAssignment('bld-1', 'owner-1');
      const firstEmpAssign = manager.getAssignment('bld-1', 'emp-1');

      // Exit
      manager.clearInterior();

      // Second visit
      manager.populateInterior('bld-1', createInterior({ businessType: 'Shop' }), metadata, npcMap);
      const secondOwnerAssign = manager.getAssignment('bld-1', 'owner-1');
      const secondEmpAssign = manager.getAssignment('bld-1', 'emp-1');

      expect(secondOwnerAssign!.furnitureName).toBe(firstOwnerAssign!.furnitureName);
      expect(secondEmpAssign!.furnitureName).toBe(firstEmpAssign!.furnitureName);
    });
  });
});
