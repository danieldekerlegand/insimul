/**
 * Tests for BusinessPopulationManager — assigns customer NPCs to businesses during game loading.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@babylonjs/core', () => {
  class Vector3 {
    constructor(public x: number, public y: number, public z: number) {}
    clone() { return new Vector3(this.x, this.y, this.z); }
  }
  return { Vector3 };
});

vi.mock('../NPCAnimationController', () => ({}));

import { Vector3 } from '@babylonjs/core';
import {
  BusinessPopulationManager,
  type BuildingEntry,
  type PopulatableNPC,
} from '../BusinessPopulationManager';

function makeBuildingEntry(overrides: Partial<BuildingEntry['metadata']> & { x?: number; z?: number } = {}): BuildingEntry {
  const { x = 0, z = 0, ...meta } = overrides;
  return {
    position: new Vector3(x, 0, z),
    metadata: {
      buildingType: 'business',
      businessType: 'Shop',
      settlementId: 'settlement-1',
      ownerId: null,
      employees: [],
      ...meta,
    },
  };
}

function makeNPC(id: string): PopulatableNPC {
  return {
    mesh: { position: new Vector3(0, 0, 0) },
    characterData: { id },
  };
}

describe('BusinessPopulationManager', () => {
  let manager: BusinessPopulationManager;

  beforeEach(() => {
    manager = new BusinessPopulationManager();
  });

  it('assigns customers to open businesses', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry({ x: 10, z: 10, businessType: 'Shop' }));

    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', makeNPC('npc-1'));
    npcMeshes.set('npc-2', makeNPC('npc-2'));
    npcMeshes.set('npc-3', makeNPC('npc-3'));
    npcMeshes.set('npc-4', makeNPC('npc-4'));

    const result = manager.populate(buildingData, npcMeshes, { gameHour: 12 });

    expect(result.totalCustomersAssigned).toBeGreaterThanOrEqual(1);
    expect(result.totalCustomersAssigned).toBeLessThanOrEqual(3);
    expect(result.customersByBusiness.has('biz-1')).toBe(true);
  });

  it('does not assign customers to closed businesses', () => {
    const buildingData = new Map<string, BuildingEntry>();
    // Shop closes at 19, so hour 23 = closed
    buildingData.set('biz-1', makeBuildingEntry({ businessType: 'Shop' }));

    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', makeNPC('npc-1'));
    npcMeshes.set('npc-2', makeNPC('npc-2'));

    const result = manager.populate(buildingData, npcMeshes, { gameHour: 23 });

    expect(result.totalCustomersAssigned).toBe(0);
    expect(result.customersByBusiness.size).toBe(0);
  });

  it('does not assign business owners or employees as customers', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry({
      ownerId: 'owner-1',
      employees: ['emp-1'],
    }));

    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('owner-1', makeNPC('owner-1'));
    npcMeshes.set('emp-1', makeNPC('emp-1'));
    npcMeshes.set('civ-1', makeNPC('civ-1'));

    const result = manager.populate(buildingData, npcMeshes, { gameHour: 12 });

    const customers = result.customersByBusiness.get('biz-1') || [];
    expect(customers).not.toContain('owner-1');
    expect(customers).not.toContain('emp-1');
    expect(customers).toContain('civ-1');
  });

  it('repositions customer NPCs near the business', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry({ x: 50, z: 50 }));

    const npc = makeNPC('npc-1');
    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', npc);

    manager.populate(buildingData, npcMeshes, { gameHour: 12, minCustomers: 1, maxCustomers: 1 });

    // NPC should be repositioned near (50, _, 50), not at origin
    const pos = npc.mesh.position as Vector3;
    expect(Math.abs(pos.x - 50)).toBeLessThan(20);
    expect(Math.abs(pos.z - 50)).toBeLessThan(20);
  });

  it('does not assign the same NPC to multiple businesses', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry({ x: 10, z: 10 }));
    buildingData.set('biz-2', makeBuildingEntry({ x: 30, z: 30 }));

    const npcMeshes = new Map<string, PopulatableNPC>();
    // Only 2 NPCs available, both businesses want 1-3
    npcMeshes.set('npc-1', makeNPC('npc-1'));
    npcMeshes.set('npc-2', makeNPC('npc-2'));

    const result = manager.populate(buildingData, npcMeshes, { gameHour: 12, minCustomers: 1, maxCustomers: 1 });

    const allCustomers: string[] = [];
    result.customersByBusiness.forEach((ids) => allCustomers.push(...ids));
    const uniqueCustomers = new Set(allCustomers);
    expect(uniqueCustomers.size).toBe(allCustomers.length);
  });

  it('skips residences (only populates businesses)', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('res-1', makeBuildingEntry({ buildingType: 'residence' }));

    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', makeNPC('npc-1'));

    const result = manager.populate(buildingData, npcMeshes, { gameHour: 12 });

    expect(result.totalCustomersAssigned).toBe(0);
  });

  it('isCustomer returns correct state', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry());

    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', makeNPC('npc-1'));

    manager.populate(buildingData, npcMeshes, { gameHour: 12, minCustomers: 1, maxCustomers: 1 });

    expect(manager.isCustomer('npc-1')).toBe(true);
    expect(manager.isCustomer('nonexistent')).toBe(false);
  });

  it('clear resets all assignments', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry());

    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', makeNPC('npc-1'));

    manager.populate(buildingData, npcMeshes, { gameHour: 12, minCustomers: 1, maxCustomers: 1 });
    expect(manager.isCustomer('npc-1')).toBe(true);

    manager.clear();
    expect(manager.isCustomer('npc-1')).toBe(false);
    expect(manager.getAllAssignments().size).toBe(0);
  });

  it('handles empty NPC pool gracefully', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry());

    const npcMeshes = new Map<string, PopulatableNPC>();

    const result = manager.populate(buildingData, npcMeshes, { gameHour: 12 });

    expect(result.totalCustomersAssigned).toBe(0);
  });

  it('handles empty building data gracefully', () => {
    const buildingData = new Map<string, BuildingEntry>();
    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', makeNPC('npc-1'));

    const result = manager.populate(buildingData, npcMeshes, { gameHour: 12 });

    expect(result.totalCustomersAssigned).toBe(0);
  });

  it('avoids placing NPCs inside building footprints', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry({ x: 0, z: 0 }));

    const npc = makeNPC('npc-1');
    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', npc);

    // Every point except very far away is "inside" a building
    let callCount = 0;
    const isInside = (x: number, z: number) => {
      callCount++;
      return callCount < 8; // Fail 7 times, succeed on 8th
    };

    manager.populate(buildingData, npcMeshes, {
      gameHour: 12,
      minCustomers: 1,
      maxCustomers: 1,
      isPointInsideBuilding: isInside,
    });

    // Should have called the collision check
    expect(callCount).toBeGreaterThan(0);
  });

  it('populates 24h businesses at any hour', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry({ businessType: 'Hospital' }));

    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', makeNPC('npc-1'));

    // 3am - Hospital should still be open
    const result = manager.populate(buildingData, npcMeshes, { gameHour: 3, minCustomers: 1, maxCustomers: 1 });

    expect(result.totalCustomersAssigned).toBe(1);
  });

  it('getCustomersForBusiness returns assignments for a specific business', () => {
    const buildingData = new Map<string, BuildingEntry>();
    buildingData.set('biz-1', makeBuildingEntry());

    const npcMeshes = new Map<string, PopulatableNPC>();
    npcMeshes.set('npc-1', makeNPC('npc-1'));

    manager.populate(buildingData, npcMeshes, { gameHour: 12, minCustomers: 1, maxCustomers: 1 });

    const assignments = manager.getCustomersForBusiness('biz-1');
    expect(assignments.length).toBe(1);
    expect(assignments[0].npcId).toBe('npc-1');
    expect(assignments[0].businessId).toBe('biz-1');
  });
});
