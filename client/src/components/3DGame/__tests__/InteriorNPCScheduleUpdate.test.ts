/**
 * Tests for InteriorNPCManager schedule-based NPC entry/exit.
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

// Mock NPCAnimationController (type-only import, but mock needed for module resolution)
vi.mock('../NPCAnimationController', () => ({}));

import { Vector3, Mesh } from '@babylonjs/core';
import {
  InteriorNPCManager,
  type InteriorNPCCallbacks,
  type InteriorScheduleSource,
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

function createInterior(): any {
  return {
    id: 'interior-1',
    buildingId: 'building-1',
    buildingType: 'business',
    businessType: 'Shop',
    position: new Vector3(0, 500, 0),
    width: 10,
    depth: 10,
    height: 4,
    doorPosition: new Vector3(0, 500, 5),
    exitPosition: new Vector3(0, 0, 6),
    roomMesh: createMockMesh(),
    furniture: [],
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

function createScheduleSource(mapping: Record<string, string | null>): InteriorScheduleSource {
  return {
    getScheduledBuildingId: (npcId: string) => mapping[npcId] ?? null,
    getScheduledNPCIds: () => Object.keys(mapping).filter(k => mapping[k] !== null),
  };
}

describe('InteriorNPCManager schedule-based entry/exit', () => {
  it('adds NPCs whose schedule says they should be at this building', () => {
    const manager = new InteriorNPCManager(createCallbacks());
    const npcMap = createNPCMap(['npc-1', 'npc-2']);
    const interior = createInterior();
    const metadata: BuildingMetadata = { buildingType: 'business', businessType: 'Shop' };

    manager.populateInterior('building-1', interior, metadata, new Map());
    manager.setScheduleSource(createScheduleSource({ 'npc-1': 'building-1' }));
    manager.setNPCSource(() => npcMap);

    expect(manager.getPlacedCount()).toBe(0);
    manager.updateFromSchedules();
    expect(manager.getPlacedCount()).toBe(1);
    expect(manager.isNPCInside('npc-1')).toBe(true);
  });

  it('removes NPCs whose schedule says they should leave', () => {
    const onExit = vi.fn();
    const manager = new InteriorNPCManager(createCallbacks({ onNPCExitInterior: onExit }));
    const npcMap = createNPCMap(['npc-1', 'npc-2']);
    const interior = createInterior();
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Shop',
      employees: ['npc-1', 'npc-2'],
    };

    manager.populateInterior('building-1', interior, metadata, npcMap);
    expect(manager.getPlacedCount()).toBe(2);

    manager.setScheduleSource(createScheduleSource({ 'npc-1': 'building-2', 'npc-2': 'building-1' }));
    manager.setNPCSource(() => npcMap);
    manager.updateFromSchedules();

    expect(manager.getPlacedCount()).toBe(1);
    expect(manager.isNPCInside('npc-1')).toBe(false);
    expect(manager.isNPCInside('npc-2')).toBe(true);
    expect(onExit).toHaveBeenCalledWith('npc-1');
  });

  it('restores NPC mesh to overworld position on exit', () => {
    const manager = new InteriorNPCManager(createCallbacks());
    const npcMap = createNPCMap(['npc-1']);
    const npcEntry = npcMap.get('npc-1')!;
    const originalX = npcEntry.mesh.position.x;
    const originalZ = npcEntry.mesh.position.z;

    const interior = createInterior();
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Shop',
      employees: ['npc-1'],
    };

    manager.populateInterior('building-1', interior, metadata, npcMap);
    expect(npcEntry.mesh.position.y).toBeCloseTo(500.1);

    manager.setScheduleSource(createScheduleSource({}));
    manager.setNPCSource(() => npcMap);
    manager.updateFromSchedules();

    expect(npcEntry.mesh.position.x).toBeCloseTo(originalX);
    expect(npcEntry.mesh.position.z).toBeCloseTo(originalZ);
  });

  it('respects MAX_INTERIOR_NPCS limit', () => {
    const manager = new InteriorNPCManager(createCallbacks());
    const ids = ['npc-1', 'npc-2', 'npc-3', 'npc-4', 'npc-5', 'npc-6', 'npc-7'];
    const npcMap = createNPCMap(ids);
    const interior = createInterior();
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Shop',
      employees: ids.slice(0, 6),
    };

    manager.populateInterior('building-1', interior, metadata, npcMap);
    expect(manager.getPlacedCount()).toBe(6);

    manager.setNPCSource(() => npcMap);
    const result = manager.addNPCToInterior('npc-7');
    expect(result).toBeNull();
    expect(manager.getPlacedCount()).toBe(6);
  });

  it('removeNPCFromInterior returns false for unknown NPC', () => {
    const manager = new InteriorNPCManager(createCallbacks());
    expect(manager.removeNPCFromInterior('nonexistent')).toBe(false);
  });

  it('fires onNPCEnterInterior callback on dynamic entry', () => {
    const onEnter = vi.fn();
    const manager = new InteriorNPCManager(createCallbacks({ onNPCEnterInterior: onEnter }));
    const npcMap = createNPCMap(['npc-1']);
    const interior = createInterior();
    const metadata: BuildingMetadata = { buildingType: 'business', businessType: 'Shop' };

    manager.populateInterior('building-1', interior, metadata, new Map());
    manager.setScheduleSource(createScheduleSource({ 'npc-1': 'building-1' }));
    manager.setNPCSource(() => npcMap);

    manager.updateFromSchedules();
    expect(onEnter).toHaveBeenCalledWith('npc-1');
  });

  it('is a no-op when no active interior', () => {
    const manager = new InteriorNPCManager(createCallbacks());
    manager.setScheduleSource(createScheduleSource({ 'npc-1': 'building-1' }));
    manager.updateFromSchedules();
    expect(manager.getPlacedCount()).toBe(0);
  });

  it('resolves NPC roles correctly from metadata', () => {
    const manager = new InteriorNPCManager(createCallbacks());
    const npcMap = createNPCMap(['owner-1', 'emp-1', 'visitor-1']);
    const interior = createInterior();
    const metadata: BuildingMetadata = {
      buildingType: 'business',
      businessType: 'Shop',
      ownerId: 'owner-1',
      employees: ['emp-1'],
    };

    manager.populateInterior('building-1', interior, metadata, new Map());
    manager.setScheduleSource(createScheduleSource({
      'owner-1': 'building-1',
      'emp-1': 'building-1',
      'visitor-1': 'building-1',
    }));
    manager.setNPCSource(() => npcMap);
    manager.updateFromSchedules();

    expect(manager.getPlacedNPC('owner-1')?.role).toBe('owner');
    expect(manager.getPlacedNPC('emp-1')?.role).toBe('employee');
    expect(manager.getPlacedNPC('visitor-1')?.role).toBe('visitor');
  });

  it('does not duplicate NPCs across multiple updates', () => {
    const manager = new InteriorNPCManager(createCallbacks());
    const npcMap = createNPCMap(['npc-1']);
    const interior = createInterior();
    const metadata: BuildingMetadata = { buildingType: 'business', businessType: 'Shop' };

    manager.populateInterior('building-1', interior, metadata, new Map());
    manager.setScheduleSource(createScheduleSource({ 'npc-1': 'building-1' }));
    manager.setNPCSource(() => npcMap);

    manager.updateFromSchedules();
    manager.updateFromSchedules();
    manager.updateFromSchedules();

    expect(manager.getPlacedCount()).toBe(1);
  });

  it('handles NPC entering, leaving, and re-entering', () => {
    const onEnter = vi.fn();
    const onExit = vi.fn();
    const manager = new InteriorNPCManager(createCallbacks({
      onNPCEnterInterior: onEnter,
      onNPCExitInterior: onExit,
    }));
    const npcMap = createNPCMap(['npc-1']);
    const interior = createInterior();
    const metadata: BuildingMetadata = { buildingType: 'business', businessType: 'Shop' };

    manager.populateInterior('building-1', interior, metadata, new Map());
    manager.setNPCSource(() => npcMap);

    // NPC arrives
    manager.setScheduleSource(createScheduleSource({ 'npc-1': 'building-1' }));
    manager.updateFromSchedules();
    expect(manager.isNPCInside('npc-1')).toBe(true);
    expect(onEnter).toHaveBeenCalledTimes(1);

    // NPC leaves
    manager.setScheduleSource(createScheduleSource({ 'npc-1': 'building-2' }));
    manager.updateFromSchedules();
    expect(manager.isNPCInside('npc-1')).toBe(false);
    expect(onExit).toHaveBeenCalledTimes(1);

    // NPC returns
    manager.setScheduleSource(createScheduleSource({ 'npc-1': 'building-1' }));
    manager.updateFromSchedules();
    expect(manager.isNPCInside('npc-1')).toBe(true);
    expect(onEnter).toHaveBeenCalledTimes(2);
  });
});
