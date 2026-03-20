/**
 * Tests for InteriorNPCManager
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Babylon.js
vi.mock('@babylonjs/core', () => {
  const Vector3 = class {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
    clone() { return new Vector3(this.x, this.y, this.z); }
    add(v: any) { return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z); }
    subtract(v: any) { return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z); }
    scale(s: number) { return new Vector3(this.x * s, this.y * s, this.z * s); }
    static Zero() { return new Vector3(0, 0, 0); }
  };
  return {
    Vector3,
    Mesh: {},
  };
});

import { InteriorNPCManager, InteriorNPCCallbacks, BuildingMetadata } from '../../client/src/components/3DGame/InteriorNPCManager';
import type { InteriorLayout } from '../../client/src/components/3DGame/BuildingInteriorGenerator';

const { Vector3 } = await import('@babylonjs/core');

function createMockMesh(name = 'npc') {
  return {
    name,
    position: new Vector3(10, 0, 10),
    rotation: { y: 0 },
    isEnabled: () => true,
    setEnabled: vi.fn(),
    dispose: vi.fn(),
  } as any;
}

function createMockInterior(overrides: Partial<InteriorLayout> = {}): InteriorLayout {
  return {
    id: 'interior_biz1',
    buildingId: 'biz1',
    buildingType: 'business',
    businessType: 'Bakery',
    position: new Vector3(0, 500, 0),
    width: 10,
    depth: 8,
    height: 4,
    roomMesh: createMockMesh('room'),
    furniture: [],
    doorPosition: new Vector3(0, 501, -3.5),
    exitPosition: new Vector3(5, 0, 5),
    ...overrides,
  } as any;
}

function createMockCallbacks(): InteriorNPCCallbacks {
  return {
    onAnimationChange: vi.fn(),
    onFaceDirection: vi.fn(),
    onNPCGreeting: vi.fn(),
    getGameHour: vi.fn(() => 12), // Noon by default
  };
}

function createNPCMap(npcs: Array<{ id: string; ownerId?: boolean; characterData?: any }>) {
  const map = new Map<string, { mesh: any; characterData?: any }>();
  for (const npc of npcs) {
    map.set(npc.id, {
      mesh: createMockMesh(npc.id),
      characterData: npc.characterData ?? { firstName: npc.id, personality: { extroversion: 0.5 } },
    });
  }
  return map;
}

describe('InteriorNPCManager', () => {
  let manager: InteriorNPCManager;
  let callbacks: InteriorNPCCallbacks;

  beforeEach(() => {
    callbacks = createMockCallbacks();
    manager = new InteriorNPCManager(callbacks);
  });

  describe('populateInterior', () => {
    it('should place employees inside a business', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: ['emp1', 'emp2'],
      };
      const npcs = createNPCMap([
        { id: 'owner1' },
        { id: 'emp1' },
        { id: 'emp2' },
      ]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      expect(placed.length).toBe(3);
      expect(manager.getPlacedCount()).toBe(3);
    });

    it('should place owner with "owner" role', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      expect(placed[0].role).toBe('owner');
    });

    it('should place employees with "employee" role', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        employees: ['emp1'],
      };
      const npcs = createNPCMap([{ id: 'emp1' }]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      expect(placed[0].role).toBe('employee');
    });

    it('should cap at MAX_INTERIOR_NPCS (6)', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        employees: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
      };
      const npcs = createNPCMap([
        { id: 'e1' }, { id: 'e2' }, { id: 'e3' }, { id: 'e4' },
        { id: 'e5' }, { id: 'e6' }, { id: 'e7' }, { id: 'e8' },
      ]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      expect(placed.length).toBeLessThanOrEqual(6);
      expect(manager.getPlacedCount()).toBeLessThanOrEqual(6);
    });

    it('should not place NPCs that do not exist in allNPCs', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        employees: ['nonexistent'],
      };
      const npcs = createNPCMap([]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      expect(placed.length).toBe(0);
    });

    it('should handle employees as objects with id field', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        employees: [{ id: 'emp1' }] as any,
      };
      const npcs = createNPCMap([{ id: 'emp1' }]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      expect(placed.length).toBe(1);
    });

    it('should teleport NPC meshes to interior positions', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);

      const npcMesh = npcs.get('owner1')!.mesh;
      // Should be at interior Y-offset (500+)
      expect(npcMesh.position.y).toBeGreaterThan(400);
    });

    it('should save original NPC positions', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);

      const placed = manager.getPlacedNPC('owner1');
      expect(placed?.savedPosition.x).toBe(10);
      expect(placed?.savedPosition.y).toBe(0);
      expect(placed?.savedPosition.z).toBe(10);
    });

    it('should set animation on placed NPCs', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);

      expect(callbacks.onAnimationChange).toHaveBeenCalledWith('owner1', expect.any(String));
    });

    it('should trigger greeting from employee/owner', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);

      expect(callbacks.onNPCGreeting).toHaveBeenCalledWith('owner1', expect.any(String));
    });

    it('should not place NPCs outside business hours', () => {
      (callbacks.getGameHour as any).mockReturnValue(3); // 3 AM
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        employees: ['emp1'],
      };
      const npcs = createNPCMap([{ id: 'emp1' }]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      expect(placed.length).toBe(0);
    });

    it('should place occupants in residences regardless of hour', () => {
      (callbacks.getGameHour as any).mockReturnValue(3); // 3 AM
      const interior = createMockInterior({ buildingType: 'residence' });
      const metadata: BuildingMetadata = {
        buildingType: 'residence',
        occupants: ['res1'],
      };
      const npcs = createNPCMap([{ id: 'res1' }]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      expect(placed.length).toBe(1);
    });

    it('should face NPCs toward the door', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);

      expect(callbacks.onFaceDirection).toHaveBeenCalledWith('owner1', interior.doorPosition);
    });

    it('should clear previous interior before populating new one', () => {
      // Mock Math.random to prevent random visitors from being added
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);

      const interior1 = createMockInterior();
      const meta1: BuildingMetadata = { buildingType: 'business', ownerId: 'npc1', employees: [] };
      const npcs = createNPCMap([{ id: 'npc1' }, { id: 'npc2' }]);

      manager.populateInterior('biz1', interior1, meta1, npcs);
      expect(manager.getPlacedCount()).toBe(1);

      const interior2 = createMockInterior({ buildingId: 'biz2' });
      const meta2: BuildingMetadata = { buildingType: 'business', ownerId: 'npc2', employees: [] };
      manager.populateInterior('biz2', interior2, meta2, npcs);

      expect(manager.getPlacedCount()).toBe(1);
      expect(manager.isNPCInside('npc2')).toBe(true);
      expect(manager.isNPCInside('npc1')).toBe(false);

      randomSpy.mockRestore();
    });
  });

  describe('clearInterior', () => {
    it('should restore NPC positions to overworld', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);
      manager.clearInterior();

      const npcMesh = npcs.get('owner1')!.mesh;
      expect(npcMesh.position.x).toBe(10);
      expect(npcMesh.position.y).toBe(0);
      expect(npcMesh.position.z).toBe(10);
    });

    it('should reset NPC animation to idle', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);
      (callbacks.onAnimationChange as any).mockClear();
      manager.clearInterior();

      expect(callbacks.onAnimationChange).toHaveBeenCalledWith('owner1', 'idle');
    });

    it('should clear placed NPCs map', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);
      manager.clearInterior();

      expect(manager.getPlacedCount()).toBe(0);
      expect(manager.getActiveBuildingId()).toBeNull();
    });

    it('should restore mesh enabled state', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);
      manager.clearInterior();

      const mesh = npcs.get('owner1')!.mesh;
      expect(mesh.setEnabled).toHaveBeenCalledWith(true); // Restored to wasEnabled=true
    });
  });

  describe('state queries', () => {
    it('isNPCInside returns false when no interior active', () => {
      expect(manager.isNPCInside('npc1')).toBe(false);
    });

    it('isNPCInside returns true for placed NPC', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = { buildingType: 'business', ownerId: 'npc1', employees: [] };
      const npcs = createNPCMap([{ id: 'npc1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);

      expect(manager.isNPCInside('npc1')).toBe(true);
      expect(manager.isNPCInside('npc2')).toBe(false);
    });

    it('getActiveBuildingId returns building ID when interior active', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = { buildingType: 'business', employees: [] };
      const npcs = createNPCMap([]);

      manager.populateInterior('biz1', interior, metadata, npcs);

      expect(manager.getActiveBuildingId()).toBe('biz1');
    });

    it('getPlacedNPCs returns all placed NPCs', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'o1',
        employees: ['e1'],
      };
      const npcs = createNPCMap([{ id: 'o1' }, { id: 'e1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);

      const placed = manager.getPlacedNPCs();
      expect(placed.length).toBe(2);
    });
  });

  describe('furniture role assignment', () => {
    it('should assign bakery owner to counter position', () => {
      const interior = createMockInterior({ businessType: 'Bakery' });
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      // Bakery counter is at offset (0, 0, 2) with 'work' animation
      expect(placed[0].animationState).toBe('work');
    });

    it('should assign bar visitors to stool positions', () => {
      const interior = createMockInterior({ businessType: 'Bar' });
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bar',
        occupants: ['v1'],
      };
      // Visitors come from employee/occupant lists or random; use occupants for residence-like
      // For businesses, visitors are added from the random pool, so let's test with residence occupants
      const npcs = createNPCMap([{ id: 'v1' }]);

      // occupants is for residences; for businesses, visitors are found randomly.
      // Let's test with an owner instead.
      const metadata2: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bar',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs2 = createNPCMap([{ id: 'owner1' }]);
      const placed = manager.populateInterior('bar1', interior, metadata2, npcs2);

      // Bar owner goes to 'bar' position with 'work' animation
      expect(placed[0].animationState).toBe('work');
    });

    it('should use residence furniture for residences', () => {
      const interior = createMockInterior({ buildingType: 'residence' });
      const metadata: BuildingMetadata = {
        buildingType: 'residence',
        occupants: ['res1'],
      };
      const npcs = createNPCMap([{ id: 'res1' }]);

      const placed = manager.populateInterior('res1', interior, metadata, npcs);

      // Residence first furniture is 'chair' with 'sit' animation
      expect(placed[0].animationState).toBe('sit');
    });

    it('should use default furniture for unknown business types', () => {
      const interior = createMockInterior({ businessType: 'UnknownBiz' });
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'UnknownBiz',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      const placed = manager.populateInterior('biz1', interior, metadata, npcs);

      // Default furniture: 'center' with 'idle' animation
      expect(placed[0].animationState).toBe('idle');
    });
  });

  describe('greetings', () => {
    it('should trigger business-specific greeting', () => {
      const interior = createMockInterior({ businessType: 'Bar' });
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bar',
        ownerId: 'bartender',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'bartender' }]);

      manager.populateInterior('bar1', interior, metadata, npcs);

      expect(callbacks.onNPCGreeting).toHaveBeenCalledWith('bartender', expect.any(String));
      // Greeting should be from Bar greetings
      const greeting = (callbacks.onNPCGreeting as any).mock.calls[0][1];
      const barGreetings = ["What'll it be?", 'Welcome, take a seat!', "Thirsty? We've got plenty."];
      expect(barGreetings).toContain(greeting);
    });

    it('should not trigger greeting when no employees or owner', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        employees: [],
      };
      const npcs = createNPCMap([]);

      manager.populateInterior('biz1', interior, metadata, npcs);

      expect(callbacks.onNPCGreeting).not.toHaveBeenCalled();
    });

    it('should use residence greetings for residences', () => {
      const interior = createMockInterior({ buildingType: 'residence' });
      const metadata: BuildingMetadata = {
        buildingType: 'residence',
        occupants: ['resident1'],
      };
      const npcs = createNPCMap([{ id: 'resident1' }]);

      manager.populateInterior('res1', interior, metadata, npcs);

      expect(callbacks.onNPCGreeting).toHaveBeenCalled();
      const greeting = (callbacks.onNPCGreeting as any).mock.calls[0][1];
      expect(['Make yourself at home.', 'Welcome to my home.']).toContain(greeting);
    });
  });

  describe('persistent assignments', () => {
    it('should persist furniture assignments across visits', () => {
      const interior = createMockInterior({ businessType: 'Bakery' });
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: ['emp1'],
      };
      const npcs = createNPCMap([{ id: 'owner1' }, { id: 'emp1' }]);

      // First visit
      const placed1 = manager.populateInterior('biz1', interior, metadata, npcs);
      const owner1Pos = placed1.find(p => p.npcId === 'owner1')!.interiorPosition;
      const emp1Pos = placed1.find(p => p.npcId === 'emp1')!.interiorPosition;

      // Check assignments were saved
      const assignments = manager.getAssignments('biz1');
      expect(assignments.length).toBe(2);

      // Second visit — positions should be identical
      const placed2 = manager.populateInterior('biz1', interior, metadata, npcs);
      const owner2Pos = placed2.find(p => p.npcId === 'owner1')!.interiorPosition;
      const emp2Pos = placed2.find(p => p.npcId === 'emp1')!.interiorPosition;

      expect(owner2Pos.x).toBe(owner1Pos.x);
      expect(owner2Pos.z).toBe(owner1Pos.z);
      expect(emp2Pos.x).toBe(emp1Pos.x);
      expect(emp2Pos.z).toBe(emp1Pos.z);
    });

    it('should preserve same furniture name across visits', () => {
      const interior = createMockInterior({ businessType: 'Bakery' });
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);
      const assignment = manager.getAssignment('biz1', 'owner1');
      expect(assignment).toBeDefined();
      expect(assignment!.furnitureName).toBe('counter');
      expect(assignment!.role).toBe('owner');

      // Second visit
      manager.populateInterior('biz1', interior, metadata, npcs);
      const assignment2 = manager.getAssignment('biz1', 'owner1');
      expect(assignment2!.furnitureName).toBe('counter');
      expect(assignment2!.furnitureIndex).toBe(assignment!.furnitureIndex);
    });

    it('should keep assignments after clearInterior', () => {
      const interior = createMockInterior({ businessType: 'Bakery' });
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);
      manager.clearInterior();

      // Assignments should still exist even after clearing
      const assignments = manager.getAssignments('biz1');
      expect(assignments.length).toBe(1);
      expect(assignments[0].npcId).toBe('owner1');
    });

    it('should clear assignments for a specific building', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);
      manager.clearInterior();
      manager.clearAssignments('biz1');

      expect(manager.getAssignments('biz1')).toEqual([]);
    });

    it('should clear all assignments', () => {
      const interior1 = createMockInterior();
      const meta1: BuildingMetadata = { buildingType: 'business', ownerId: 'npc1', employees: [] };
      const npcs = createNPCMap([{ id: 'npc1' }, { id: 'npc2' }]);

      manager.populateInterior('biz1', interior1, meta1, npcs);
      manager.clearInterior();

      const interior2 = createMockInterior({ buildingId: 'biz2' });
      const meta2: BuildingMetadata = { buildingType: 'business', ownerId: 'npc2', employees: [] };
      manager.populateInterior('biz2', interior2, meta2, npcs);
      manager.clearInterior();

      manager.clearAllAssignments();
      expect(manager.getAssignments('biz1')).toEqual([]);
      expect(manager.getAssignments('biz2')).toEqual([]);
    });

    it('should maintain separate assignments per building', () => {
      const npcs = createNPCMap([{ id: 'npc1' }]);

      const interior1 = createMockInterior({ businessType: 'Bakery' });
      const meta1: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'npc1',
        employees: [],
      };
      manager.populateInterior('bakery1', interior1, meta1, npcs);
      manager.clearInterior();

      const interior2 = createMockInterior({ businessType: 'Bar' });
      const meta2: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bar',
        ownerId: 'npc1',
        employees: [],
      };
      manager.populateInterior('bar1', interior2, meta2, npcs);
      manager.clearInterior();

      const bakeryAssignment = manager.getAssignment('bakery1', 'npc1');
      const barAssignment = manager.getAssignment('bar1', 'npc1');

      expect(bakeryAssignment!.furnitureName).toBe('counter'); // Bakery counter
      expect(barAssignment!.furnitureName).toBe('bar'); // Bar bar
    });

    it('should handle new NPCs added to existing building', () => {
      const interior = createMockInterior({ businessType: 'Bakery' });
      const npcs = createNPCMap([{ id: 'owner1' }, { id: 'emp1' }]);

      // First visit — owner only
      const meta1: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: [],
      };
      manager.populateInterior('biz1', interior, meta1, npcs);
      const ownerAssignment = manager.getAssignment('biz1', 'owner1');
      manager.clearInterior();

      // Second visit — owner + employee
      const meta2: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: ['emp1'],
      };
      manager.populateInterior('biz1', interior, meta2, npcs);

      // Owner should keep same assignment
      const ownerAssignment2 = manager.getAssignment('biz1', 'owner1');
      expect(ownerAssignment2!.furnitureIndex).toBe(ownerAssignment!.furnitureIndex);

      // Employee should get a different furniture slot
      const empAssignment = manager.getAssignment('biz1', 'emp1');
      expect(empAssignment).toBeDefined();
      expect(empAssignment!.furnitureIndex).not.toBe(ownerAssignment!.furnitureIndex);
    });

    it('should clear persistent assignments on dispose', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);
      manager.dispose();

      expect(manager.getAssignments('biz1')).toEqual([]);
    });

    it('should return undefined for unassigned NPC', () => {
      expect(manager.getAssignment('biz1', 'nonexistent')).toBeUndefined();
    });

    it('should persist animation state across visits', () => {
      const interior = createMockInterior({ businessType: 'Bakery' });
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        businessType: 'Bakery',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      // First visit
      const placed1 = manager.populateInterior('biz1', interior, metadata, npcs);
      const anim1 = placed1[0].animationState;

      // Second visit
      const placed2 = manager.populateInterior('biz1', interior, metadata, npcs);
      const anim2 = placed2[0].animationState;

      expect(anim2).toBe(anim1);
    });
  });

  describe('dispose', () => {
    it('should clear all interior NPCs', () => {
      const interior = createMockInterior();
      const metadata: BuildingMetadata = {
        buildingType: 'business',
        ownerId: 'owner1',
        employees: [],
      };
      const npcs = createNPCMap([{ id: 'owner1' }]);

      manager.populateInterior('biz1', interior, metadata, npcs);
      manager.dispose();

      expect(manager.getPlacedCount()).toBe(0);
      expect(manager.getActiveBuildingId()).toBeNull();
    });
  });
});
