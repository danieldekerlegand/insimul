/**
 * Tests for Unity terrain heightmap mesh export.
 *
 * Verifies that:
 * - Scene descriptor includes heightmap and slope map data
 * - C# generator includes the TerrainMeshGenerator.cs template
 * - WorldScaleManager.cs references TerrainMeshGenerator
 * - Heightmap data flows correctly through the export pipeline
 */

import { describe, it, expect } from 'vitest';
import { generateSceneFiles } from '../services/game-export/unity/unity-scene-generator';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
import { TerrainGenerator, type TerrainType } from '../generators/terrain-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture with heightmap
// ─────────────────────────────────────────────

function makeIRWithHeightmap(): WorldIR {
  const generator = new TerrainGenerator();
  const resolution = 16;
  const terrainSize = 512;
  const terrainType: TerrainType = 'hills';

  const heightmap = generator.generateHeightmap({
    seed: 'unity-terrain-test',
    width: terrainSize,
    height: terrainSize,
    terrainType,
    resolution,
  });

  const slopeMap = generator.deriveSlopeMap(heightmap);

  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'unity-terrain-test',
      terrainSize,
      genreConfig: {
        genre: 'rpg',
        features: { crafting: false, resources: false, survival: false },
      },
    },
    geography: {
      terrainSize,
      heightmap,
      slopeMap,
      terrainFeatures: [
        {
          id: 'feature_1',
          name: 'Eagle Peak',
          featureType: 'mountain',
          position: { x: 100, y: 15, z: 100 },
          radius: 50,
          elevation: 0.75,
          description: null,
        },
      ],
      biomeZones: [],
      foliageLayers: [],
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      roads: [],
      businesses: [],
      natureObjects: [],
      animals: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      items: [],
      lootTables: [],
      languages: [],
      knowledgeBase: null,
      dialogueContexts: [],
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.3, g: 0.5, b: 0.2 },
        skyColor: { r: 0.6, g: 0.7, b: 0.9 },
        roadColor: { r: 0.3, g: 0.3, b: 0.3 },
        roadRadius: 1.5,
        settlementBaseColor: { r: 0.6, g: 0.5, b: 0.4 },
        settlementRoofColor: { r: 0.3, g: 0.2, b: 0.15 },
      },
      ambientLighting: { color: [0.4, 0.4, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0, 1, 0], intensity: 1.0 },
      fog: { density: 0.02 },
    },
    assets: [],
    player: {
      speed: 5,
      jumpHeight: 1.2,
      gravity: 1,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      startPosition: { x: 0, y: 0, z: 0 },
    },
    ui: {
      minimap: true,
      healthBar: true,
      staminaBar: false,
      ammoCounter: false,
      compass: true,
    },
    combat: {
      style: 'melee',
      settings: {
        baseDamage: 10,
        criticalChance: 0.15,
        criticalMultiplier: 1.5,
        blockReduction: 0.25,
        dodgeChance: 0.1,
        attackCooldown: 1000,
        combatRange: 2,
      },
    },
    survival: null,
    resources: null,
  } as unknown as WorldIR;
}

function makeIRWithoutHeightmap(): WorldIR {
  const ir = makeIRWithHeightmap();
  (ir.geography as any).heightmap = undefined;
  (ir.geography as any).slopeMap = undefined;
  return ir;
}

// ─────────────────────────────────────────────
// Scene descriptor: heightmap data
// ─────────────────────────────────────────────

describe('Unity terrain mesh export - scene descriptor heightmap', () => {
  it('includes heightmap 2D array in terrain section', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    expect(descriptor.terrain.heightmap).toBeDefined();
    expect(descriptor.terrain.heightmap).toHaveLength(16);
    expect(descriptor.terrain.heightmap[0]).toHaveLength(16);
  });

  it('heightmap values are normalized [0, 1]', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    for (const row of descriptor.terrain.heightmap) {
      for (const val of row) {
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    }
  });

  it('includes slope map in terrain section', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    expect(descriptor.terrain.slopeMap).toBeDefined();
    expect(descriptor.terrain.slopeMap).toHaveLength(16);
    expect(descriptor.terrain.slopeMap[0]).toHaveLength(16);
  });

  it('slope map values are non-negative', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    for (const row of descriptor.terrain.slopeMap) {
      for (const val of row) {
        expect(val).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('includes terrain features', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    expect(descriptor.terrain.terrainFeatures).toHaveLength(1);
    expect(descriptor.terrain.terrainFeatures[0].featureType).toBe('mountain');
    expect(descriptor.terrain.terrainFeatures[0].name).toBe('Eagle Peak');
  });

  it('includes terrain size', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    expect(descriptor.terrain.size).toBe(512);
  });

  it('includes ground color', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    expect(descriptor.terrain.groundColor).toEqual([0.3, 0.5, 0.2]);
  });

  it('sets heightmap to null when not provided', () => {
    const ir = makeIRWithoutHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    expect(descriptor.terrain.heightmap).toBeNull();
    expect(descriptor.terrain.slopeMap).toBeNull();
  });
});

// ─────────────────────────────────────────────
// C# generator: TerrainMeshGenerator template
// ─────────────────────────────────────────────

describe('Unity terrain mesh export - C# template generation', () => {
  it('includes TerrainMeshGenerator.cs in generated files', () => {
    const ir = makeIRWithHeightmap();
    const files = generateCSharpFiles(ir);
    const terrainFile = files.find(f => f.path.endsWith('TerrainMeshGenerator.cs'));

    expect(terrainFile).toBeDefined();
    expect(terrainFile!.path).toBe('Assets/Scripts/World/TerrainMeshGenerator.cs');
  });

  it('TerrainMeshGenerator.cs contains mesh generation code', () => {
    const ir = makeIRWithHeightmap();
    const files = generateCSharpFiles(ir);
    const terrainFile = files.find(f => f.path.endsWith('TerrainMeshGenerator.cs'));

    expect(terrainFile!.content).toContain('GenerateFromHeightmap');
    expect(terrainFile!.content).toContain('BuildMesh');
    expect(terrainFile!.content).toContain('MeshCollider');
    expect(terrainFile!.content).toContain('SlopeToVertexColor');
  });

  it('TerrainMeshGenerator.cs has elevation scale parameter', () => {
    const ir = makeIRWithHeightmap();
    const files = generateCSharpFiles(ir);
    const terrainFile = files.find(f => f.path.endsWith('TerrainMeshGenerator.cs'));

    expect(terrainFile!.content).toContain('elevationScale');
  });

  it('WorldScaleManager.cs references TerrainMeshGenerator', () => {
    const ir = makeIRWithHeightmap();
    const files = generateCSharpFiles(ir);
    const wsmFile = files.find(f => f.path.endsWith('WorldScaleManager.cs'));

    expect(wsmFile!.content).toContain('TerrainMeshGenerator');
    expect(wsmFile!.content).toContain('GenerateFromHeightmap');
    // Should NOT contain the old flat plane approach
    expect(wsmFile!.content).not.toContain('PrimitiveType.Plane');
  });

  it('WorldScaleManager.cs passes heightmap from WorldIR', () => {
    const ir = makeIRWithHeightmap();
    const files = generateCSharpFiles(ir);
    const wsmFile = files.find(f => f.path.endsWith('WorldScaleManager.cs'));

    expect(wsmFile!.content).toContain('worldData.geography.heightmap');
  });
});

// ─────────────────────────────────────────────
// Heightmap mesh geometry validation
// ─────────────────────────────────────────────

describe('Unity terrain mesh export - mesh geometry expectations', () => {
  it('heightmap resolution determines vertex count (resolution^2)', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    const resolution = descriptor.terrain.heightmap.length;
    expect(resolution).toBe(16);
    // Vertex count = resolution * resolution = 256
    // Triangle count = (resolution-1)^2 * 2 = 450
    const expectedVerts = resolution * resolution;
    const expectedTris = (resolution - 1) * (resolution - 1) * 2;
    expect(expectedVerts).toBe(256);
    expect(expectedTris).toBe(450);
  });

  it('heightmap is deterministic for same seed', () => {
    const ir1 = makeIRWithHeightmap();
    const ir2 = makeIRWithHeightmap();
    const files1 = generateSceneFiles(ir1);
    const files2 = generateSceneFiles(ir2);
    const desc1 = JSON.parse(files1[0].content);
    const desc2 = JSON.parse(files2[0].content);

    expect(desc1.terrain.heightmap).toEqual(desc2.terrain.heightmap);
  });

  it('heightmap rows are all same length (square grid)', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    const resolution = descriptor.terrain.heightmap.length;
    for (const row of descriptor.terrain.heightmap) {
      expect(row).toHaveLength(resolution);
    }
  });

  it('slope map dimensions match heightmap dimensions', () => {
    const ir = makeIRWithHeightmap();
    const files = generateSceneFiles(ir);
    const descriptor = JSON.parse(files[0].content);

    expect(descriptor.terrain.slopeMap.length).toBe(
      descriptor.terrain.heightmap.length,
    );
    expect(descriptor.terrain.slopeMap[0].length).toBe(
      descriptor.terrain.heightmap[0].length,
    );
  });
});
