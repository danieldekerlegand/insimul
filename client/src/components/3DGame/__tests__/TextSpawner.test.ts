/**
 * Tests for TextSpawner
 *
 * Run with: npx vitest run client/src/components/3DGame/__tests__/TextSpawner.test.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Babylon.js before imports
vi.mock('@babylonjs/core', () => {
  class Vector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
    clone() { return new Vector3(this.x, this.y, this.z); }
    static Distance(a: Vector3, b: Vector3) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dz = a.z - b.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  }
  class Color3 {
    constructor(public r = 0, public g = 0, public b = 0) {}
    scale(s: number) { return new Color3(this.r * s, this.g * s, this.b * s); }
  }
  let meshIdCounter = 0;
  class Mesh {
    name: string;
    material: any = null;
    position = new Vector3();
    metadata: any = null;
    isPickable = true;
    checkCollisions = false;
    animations: any[] = [];
    private _disposed = false;
    constructor(name: string, _scene?: any) { this.name = name; meshIdCounter++; }
    dispose() { this._disposed = true; }
    isDisposed() { return this._disposed; }
    getChildMeshes() { return []; }
  }
  class Animation {
    static ANIMATIONTYPE_FLOAT = 0;
    static ANIMATIONLOOPMODE_CYCLE = 1;
    constructor(public name: string, ..._args: any[]) {}
    setKeys(_keys: any[]) {}
  }
  class Scene {
    beginAnimation() { return {}; }
  }
  return { Vector3, Color3, Mesh, Animation, Scene };
});

import { Vector3, Scene } from '@babylonjs/core';
import {
  TextSpawner,
  TEXT_CATEGORY_OBJECT_ROLES,
  TEXT_CATEGORY_GLOW_COLORS,
  TEXT_CATEGORY_ICONS,
  type CollectibleTextData,
  type BuildingInfo,
  type TextCategory,
} from '../TextSpawner';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeEventBus() {
  return {
    emit: vi.fn(),
    on: vi.fn(() => () => {}),
  } as any;
}

function makeProceduralObjects() {
  return {
    generate: vi.fn((_name: string, _params: any) => ({
      mesh: {
        name: _name,
        position: new Vector3(),
        isPickable: false,
        metadata: null,
        animations: [],
        getChildMeshes: () => [],
        isDisposed: () => false,
        dispose: vi.fn(),
      },
    })),
  } as any;
}

function makeText(overrides: Partial<CollectibleTextData> = {}): CollectibleTextData {
  return {
    id: 'text-1',
    title: 'Le Petit Prince',
    textCategory: 'book',
    cefrLevel: 'A2',
    spawnLocationHint: 'library',
    ...overrides,
  };
}

function makeBuilding(overrides: Partial<BuildingInfo> = {}): BuildingInfo {
  return {
    id: 'building-1',
    businessType: 'library',
    position: { x: 10, y: 0, z: 10 },
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('TextSpawner', () => {
  let scene: Scene;
  let proceduralObjects: ReturnType<typeof makeProceduralObjects>;
  let eventBus: ReturnType<typeof makeEventBus>;
  let spawner: TextSpawner;

  beforeEach(() => {
    scene = new Scene();
    proceduralObjects = makeProceduralObjects();
    eventBus = makeEventBus();
    spawner = new TextSpawner(scene, proceduralObjects, eventBus);
  });

  describe('constants', () => {
    it('defines object roles for all 5 text categories', () => {
      expect(TEXT_CATEGORY_OBJECT_ROLES.book).toBe('text_book');
      expect(TEXT_CATEGORY_OBJECT_ROLES.journal).toBe('text_journal');
      expect(TEXT_CATEGORY_OBJECT_ROLES.letter).toBe('text_letter');
      expect(TEXT_CATEGORY_OBJECT_ROLES.flyer).toBe('text_flyer');
      expect(TEXT_CATEGORY_OBJECT_ROLES.recipe).toBe('text_recipe');
    });

    it('defines glow colors for all 5 text categories', () => {
      const categories: TextCategory[] = ['book', 'journal', 'letter', 'flyer', 'recipe'];
      for (const cat of categories) {
        expect(TEXT_CATEGORY_GLOW_COLORS[cat]).toBeDefined();
      }
    });

    it('defines icons for all 5 text categories', () => {
      const categories: TextCategory[] = ['book', 'journal', 'letter', 'flyer', 'recipe'];
      for (const cat of categories) {
        expect(TEXT_CATEGORY_ICONS[cat]).toBeDefined();
        expect(typeof TEXT_CATEGORY_ICONS[cat]).toBe('string');
      }
    });
  });

  describe('spawnTexts', () => {
    it('spawns a text at a matching building', () => {
      const text = makeText();
      const building = makeBuilding();

      spawner.spawnTexts([text], [building], []);

      expect(proceduralObjects.generate).toHaveBeenCalledTimes(1);
      expect(proceduralObjects.generate).toHaveBeenCalledWith(
        expect.stringContaining('text_collectible_text-1'),
        expect.objectContaining({ objectType: 'text_book' }),
      );
      expect(spawner.getSpawnedCount()).toBe(1);
      expect(spawner.getSpawnedIds()).toContain('text-1');
    });

    it('skips already collected texts', () => {
      const text = makeText();
      spawner.setCollectedIds(['text-1']);

      spawner.spawnTexts([text], [makeBuilding()], []);

      expect(proceduralObjects.generate).not.toHaveBeenCalled();
      expect(spawner.getSpawnedCount()).toBe(0);
    });

    it('does not double-spawn the same text', () => {
      const text = makeText();
      const building = makeBuilding();

      spawner.spawnTexts([text], [building], []);
      spawner.spawnTexts([text], [building], []);

      expect(proceduralObjects.generate).toHaveBeenCalledTimes(1);
    });

    it('spawns multiple texts of different categories', () => {
      const texts = [
        makeText({ id: 't1', textCategory: 'book' }),
        makeText({ id: 't2', textCategory: 'journal', spawnLocationHint: 'residence' }),
        makeText({ id: 't3', textCategory: 'letter', spawnLocationHint: 'office' }),
      ];
      const buildings = [
        makeBuilding({ id: 'b1', businessType: 'library' }),
        makeBuilding({ id: 'b2', businessType: 'guild' }),
      ];
      const residences = [
        makeBuilding({ id: 'r1', businessType: undefined }),
      ];

      spawner.spawnTexts(texts, buildings, residences);

      expect(spawner.getSpawnedCount()).toBe(3);
    });

    it('uses correct objectRole for each category', () => {
      const categories: TextCategory[] = ['book', 'journal', 'letter', 'flyer', 'recipe'];
      const buildings = [makeBuilding()];

      for (const cat of categories) {
        const text = makeText({ id: `text-${cat}`, textCategory: cat });
        spawner.spawnTexts([text], buildings, []);
      }

      expect(proceduralObjects.generate).toHaveBeenCalledTimes(5);
      for (const cat of categories) {
        expect(proceduralObjects.generate).toHaveBeenCalledWith(
          expect.stringContaining(`text-${cat}`),
          expect.objectContaining({ objectType: TEXT_CATEGORY_OBJECT_ROLES[cat] }),
        );
      }
    });
  });

  describe('main quest filtering', () => {
    it('only spawns main quest texts when their chapter is active', () => {
      const text = makeText({ isMainQuest: true, chapter: 2 });
      const building = makeBuilding();

      spawner.spawnTexts([text], [building], [], 1);
      expect(spawner.getSpawnedCount()).toBe(0);

      spawner.spawnTexts([text], [building], [], 2);
      expect(spawner.getSpawnedCount()).toBe(1);
    });

    it('always spawns non-main-quest texts regardless of chapter', () => {
      const text = makeText({ isMainQuest: false });
      spawner.spawnTexts([text], [makeBuilding()], [], 5);
      expect(spawner.getSpawnedCount()).toBe(1);
    });
  });

  describe('collectText', () => {
    it('removes the mesh and emits text_collected event', () => {
      const text = makeText();
      spawner.spawnTexts([text], [makeBuilding()], []);

      const collected = spawner.collectText('text-1');

      expect(collected).not.toBeNull();
      expect(collected!.id).toBe('text-1');
      expect(collected!.textCategory).toBe('book');
      expect(spawner.getSpawnedCount()).toBe(0);
      expect(spawner.isCollected('text-1')).toBe(true);
      expect(eventBus.emit).toHaveBeenCalledWith({
        type: 'text_collected',
        textId: 'text-1',
        textType: 'book',
        difficulty: 'A2',
        vocabularyWordCount: 0,
        title: 'Le Petit Prince',
        clueText: undefined,
        authorName: undefined,
      });
    });

    it('returns null for unknown text ID', () => {
      expect(spawner.collectText('nonexistent')).toBeNull();
    });

    it('calls onTextCollected callback', () => {
      const cb = vi.fn();
      spawner.setOnTextCollected(cb);
      spawner.spawnTexts([makeText()], [makeBuilding()], []);

      spawner.collectText('text-1');

      expect(cb).toHaveBeenCalledWith(expect.objectContaining({ id: 'text-1' }));
    });
  });

  describe('getTextInRange', () => {
    it('finds texts within range', () => {
      const text = makeText();
      spawner.spawnTexts([text], [makeBuilding()], []);

      // The mock mesh position defaults to (0,0,0), player at origin should be in range
      const result = spawner.getTextInRange(new Vector3(0, 0, 0), 100);
      expect(result).not.toBeNull();
      expect(result!.textId).toBe('text-1');
    });

    it('returns null when no texts in range', () => {
      const text = makeText();
      spawner.spawnTexts([text], [makeBuilding()], []);

      // Set the mock mesh position far away — but our mock doesn't actually position them
      // so check with a very small range instead
      const result = spawner.getTextInRange(new Vector3(1000, 1000, 1000), 1);
      expect(result).toBeNull();
    });
  });

  describe('resolveSpawnPosition', () => {
    it('places library texts near library buildings', () => {
      const text = makeText({ spawnLocationHint: 'library' });
      const building = makeBuilding({ businessType: 'library', position: { x: 20, y: 0, z: 30 } });

      const pos = spawner.resolveSpawnPosition(text, [building], []);
      expect(pos).not.toBeNull();
      // Should be near the building
      expect(Math.abs(pos!.x - 20)).toBeLessThan(5);
      expect(Math.abs(pos!.z - 30)).toBeLessThan(5);
    });

    it('places residence texts near residences', () => {
      const text = makeText({ spawnLocationHint: 'residence' });
      const residence = makeBuilding({ id: 'r1', position: { x: 50, y: 0, z: 50 } });

      const pos = spawner.resolveSpawnPosition(text, [], [residence]);
      expect(pos).not.toBeNull();
      expect(Math.abs(pos!.x - 50)).toBeLessThan(5);
    });

    it('places hidden texts at outdoor positions', () => {
      const text = makeText({ spawnLocationHint: 'hidden' });
      const pos = spawner.resolveSpawnPosition(text, [], []);
      expect(pos).not.toBeNull();
      // Should be far from origin
      const dist = Math.sqrt(pos!.x * pos!.x + pos!.z * pos!.z);
      expect(dist).toBeGreaterThan(20);
    });

    it('falls back to any building when no matching type exists', () => {
      const text = makeText({ spawnLocationHint: 'bookshop' });
      const building = makeBuilding({ businessType: 'tavern' });

      const pos = spawner.resolveSpawnPosition(text, [building], []);
      expect(pos).not.toBeNull();
    });

    it('returns null when no buildings or residences available', () => {
      const text = makeText({ spawnLocationHint: 'library' });
      const pos = spawner.resolveSpawnPosition(text, [], []);
      expect(pos).toBeNull();
    });
  });

  describe('setCollectedIds', () => {
    it('pre-populates collected state from persisted data', () => {
      spawner.setCollectedIds(['a', 'b', 'c']);

      expect(spawner.isCollected('a')).toBe(true);
      expect(spawner.isCollected('b')).toBe(true);
      expect(spawner.isCollected('c')).toBe(true);
      expect(spawner.isCollected('d')).toBe(false);
      expect(spawner.getCollectedCount()).toBe(3);
    });
  });

  describe('clear and dispose', () => {
    it('clear removes all spawned meshes', () => {
      spawner.spawnTexts(
        [makeText({ id: 't1' }), makeText({ id: 't2' })],
        [makeBuilding()],
        [],
      );
      expect(spawner.getSpawnedCount()).toBe(2);

      spawner.clear();
      expect(spawner.getSpawnedCount()).toBe(0);
    });

    it('dispose clears everything including collected state', () => {
      spawner.setCollectedIds(['x']);
      spawner.spawnTexts([makeText()], [makeBuilding()], []);

      spawner.dispose();

      expect(spawner.getSpawnedCount()).toBe(0);
      expect(spawner.getCollectedCount()).toBe(0);
    });
  });

  describe('cafe/tavern hint matching', () => {
    it('spawns cafe texts near tavern buildings', () => {
      const text = makeText({ spawnLocationHint: 'cafe' });
      const building = makeBuilding({ businessType: 'tavern', position: { x: 15, y: 0, z: 15 } });

      const pos = spawner.resolveSpawnPosition(text, [building], []);
      expect(pos).not.toBeNull();
      expect(Math.abs(pos!.x - 15)).toBeLessThan(5);
    });
  });

  describe('market hint matching', () => {
    it('spawns market texts near shop buildings', () => {
      const text = makeText({ spawnLocationHint: 'market' });
      const building = makeBuilding({ businessType: 'general_store', position: { x: 25, y: 0, z: 25 } });

      const pos = spawner.resolveSpawnPosition(text, [building], []);
      expect(pos).not.toBeNull();
      expect(Math.abs(pos!.x - 25)).toBeLessThan(5);
    });
  });
});
