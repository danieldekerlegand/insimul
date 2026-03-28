/**
 * Tests for Unreal terrain heightmap landscape generation.
 *
 * Verifies that:
 * - ProceduralTerrainGenerator C++ templates are generated
 * - Level descriptor includes heightmap resolution and elevation scale
 * - GameMode template references terrain generator
 * - C++ templates contain correct mesh generation logic
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import { generateLevelFiles } from '../services/game-export/unreal/unreal-level-generator';
import { generateProjectFiles } from '../services/game-export/unreal/unreal-project-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture for Unreal generation
// ─────────────────────────────────────────────

function makeMinimalIR(overrides: Partial<{ heightmap: number[][]; slopeMap: number[][] }> = {}): WorldIR {
  const heightmap = overrides.heightmap ?? [
    [0.0, 0.1, 0.2, 0.3],
    [0.1, 0.3, 0.5, 0.4],
    [0.2, 0.5, 0.8, 0.6],
    [0.3, 0.4, 0.6, 0.5],
  ];

  return {
    meta: {
      worldId: 'test-world',
      worldName: 'TestWorld',
      worldType: 'fantasy',
      seed: 'abc123',
      insimulVersion: '1.0.0',
      exportTimestamp: '2026-01-01T00:00:00Z',
      targetEngine: 'unreal',
      genreConfig: {
        id: 'rpg',
        name: 'RPG',
        description: 'Role-playing game',
        features: { crafting: false, resources: false, survival: false, combat: true, dialogue: true, quests: true },
      } as any,
    },
    geography: {
      terrainSize: 1000,
      heightmap,
      slopeMap: overrides.slopeMap ?? [[0, 0.1], [0.1, 0.2]],
      terrainFeatures: [
        {
          id: 'feat-1',
          name: 'Big Mountain',
          featureType: 'mountain',
          position: { x: 100, y: 16, z: 200 },
          radius: 50,
          elevation: 0.8,
          description: null,
        },
      ],
      biomeZones: [],
      foliageLayers: [],
      countries: [],
      states: [],
      settlements: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      roads: [],
      lots: [],
      businesses: [],
      items: [],
    },
    systems: {
      rules: [],
      actions: [],
      quests: [],
      truths: [],
      grammars: [],
      dialogueContexts: [],
      knowledgeBase: '',
      languages: [],
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.3, g: 0.5, b: 0.2 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        settlementBaseColor: { r: 0.8, g: 0.7, b: 0.6 },
        settlementRoofColor: { r: 0.6, g: 0.3, b: 0.2 },
        roadColor: { r: 0.4, g: 0.4, b: 0.4 },
        roadRadius: 3,
      } as any,
      ambientLighting: { color: [0.3, 0.3, 0.4], intensity: 0.5 },
      directionalLight: { direction: [-0.5, -1, -0.3], intensity: 1.0 },
      fog: null,
    } as any,
    player: {
      startPosition: { x: 0, y: 0, z: 0 },
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      speed: 5,
      jumpHeight: 2,
      gravity: -9.8,
    } as any,
    combat: {
      style: 'realtime',
      settings: {
        baseDamage: 10,
        criticalChance: 0.1,
        criticalMultiplier: 2,
        blockReduction: 0.5,
        dodgeChance: 0.1,
      },
    } as any,
    aiConfig: {
      apiMode: 'insimul',
      insimulEndpoint: 'https://api.insimul.com',
      geminiModel: 'gemini-3.1-pro',
      geminiApiKeyPlaceholder: '',
      voiceEnabled: false,
      defaultVoice: 'neutral',
    } as any,
    ui: {} as any,
    assets: {} as any,
  } as WorldIR;
}

// ─────────────────────────────────────────────
// C++ Template Generation
// ─────────────────────────────────────────────

describe('Unreal ProceduralTerrainGenerator C++ templates', () => {
  it('generates ProceduralTerrainGenerator.h and .cpp files', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const paths = files.map(f => f.path);

    expect(paths).toContain('Source/InsimulExport/World/ProceduralTerrainGenerator.h');
    expect(paths).toContain('Source/InsimulExport/World/ProceduralTerrainGenerator.cpp');
  });

  it('header declares ProceduralMeshComponent and GenerateFromHeightmap', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('ProceduralTerrainGenerator.h'))!;

    expect(header.content).toContain('UProceduralMeshComponent* TerrainMesh');
    expect(header.content).toContain('GenerateFromHeightmap');
    expect(header.content).toContain('GenerateFromJson');
    expect(header.content).toContain('ElevationScale');
    expect(header.content).toContain('GrassSlopeMax');
    expect(header.content).toContain('RockSlopeMax');
  });

  it('cpp contains mesh building logic with vertices, triangles, normals, UVs', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('ProceduralTerrainGenerator.cpp'))!;

    expect(cpp.content).toContain('BuildMesh');
    expect(cpp.content).toContain('Vertices');
    expect(cpp.content).toContain('Triangles');
    expect(cpp.content).toContain('Normals');
    expect(cpp.content).toContain('UVs');
    expect(cpp.content).toContain('CreateMeshSection_LinearColor');
  });

  it('cpp implements slope-based vertex coloring', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('ProceduralTerrainGenerator.cpp'))!;

    expect(cpp.content).toContain('SlopeToVertexColor');
    expect(cpp.content).toContain('GrassMax');
    expect(cpp.content).toContain('RockMax');
  });

  it('cpp sets up collision on the ProceduralMeshComponent', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('ProceduralTerrainGenerator.cpp'))!;

    expect(cpp.content).toContain('bUseComplexAsSimpleCollision');
    expect(cpp.content).toContain('SetCollisionEnabled');
    expect(cpp.content).toContain('SetCollisionResponseToAllChannels');
  });

  it('cpp parses heightmap from JSON', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('ProceduralTerrainGenerator.cpp'))!;

    expect(cpp.content).toContain('GenerateFromJson');
    expect(cpp.content).toContain('sizeUnreal');
    expect(cpp.content).toContain('groundColorLinear');
    expect(cpp.content).toContain('heightmap');
  });
});

// ─────────────────────────────────────────────
// Level Descriptor
// ─────────────────────────────────────────────

describe('Unreal LevelDescriptor terrain data', () => {
  it('includes heightmap resolution and elevation scale', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const level = JSON.parse(files[0].content);

    expect(level.terrain.heightmapResolution).toBe(4); // 4x4 heightmap
    expect(level.terrain.elevationScale).toBe(20);
  });

  it('includes the full heightmap 2D array', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const level = JSON.parse(files[0].content);

    expect(level.terrain.heightmap).toHaveLength(4);
    expect(level.terrain.heightmap[0]).toHaveLength(4);
    expect(level.terrain.heightmap[2][2]).toBe(0.8); // peak value
  });

  it('converts terrain size to centimeters', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const level = JSON.parse(files[0].content);

    expect(level.terrain.sizeUnreal).toBe(100000); // 1000m * 100
  });

  it('includes slope map data', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const level = JSON.parse(files[0].content);

    expect(level.terrain.slopeMap).toBeDefined();
    expect(Array.isArray(level.terrain.slopeMap)).toBe(true);
  });

  it('includes terrain features with positions', () => {
    const ir = makeMinimalIR();
    const files = generateLevelFiles(ir);
    const level = JSON.parse(files[0].content);

    expect(level.terrain.terrainFeatures).toHaveLength(1);
    expect(level.terrain.terrainFeatures[0].featureType).toBe('mountain');
  });

  it('sets heightmapResolution to 0 when no heightmap', () => {
    const ir = makeMinimalIR({ heightmap: undefined as any });
    ir.geography.heightmap = undefined;
    const files = generateLevelFiles(ir);
    const level = JSON.parse(files[0].content);

    expect(level.terrain.heightmapResolution).toBe(0);
    expect(level.terrain.heightmap).toBeNull();
  });
});

// ─────────────────────────────────────────────
// GameMode Integration
// ─────────────────────────────────────────────

describe('Unreal GameMode terrain integration', () => {
  it('GameMode header includes terrain generator forward declaration', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('InsimulGameMode.h'))!;

    expect(header.content).toContain('class AProceduralTerrainGenerator');
    expect(header.content).toContain('AProceduralTerrainGenerator* TerrainGenerator');
  });

  it('GameMode cpp includes terrain generator header', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulGameMode.cpp'))!;

    expect(cpp.content).toContain('#include "../World/ProceduralTerrainGenerator.h"');
  });

  it('GameMode GenerateTerrain reads LevelDescriptor.json', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulGameMode.cpp'))!;

    expect(cpp.content).toContain('LevelDescriptor.json');
    expect(cpp.content).toContain('GenerateFromJson');
  });

  it('GameMode GenerateTerrain falls back to flat plane without heightmap', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const cpp = files.find(f => f.path.endsWith('InsimulGameMode.cpp'))!;

    // Should contain both heightmap path and flat fallback
    expect(cpp.content).toContain('AProceduralTerrainGenerator');
    expect(cpp.content).toContain('Flat ground plane');
  });
});

// ─────────────────────────────────────────────
// UE5 Project Configuration
// ─────────────────────────────────────────────

describe('Unreal project ProceduralMeshComponent setup', () => {
  it('.uproject enables ProceduralMeshComponent plugin', () => {
    const ir = makeMinimalIR();
    const files = generateProjectFiles(ir);
    const uproject = files.find(f => f.path.endsWith('.uproject'))!;
    const parsed = JSON.parse(uproject.content);

    const pmcPlugin = parsed.Plugins.find((p: any) => p.Name === 'ProceduralMeshComponent');
    expect(pmcPlugin).toBeDefined();
    expect(pmcPlugin.Enabled).toBe(true);
  });

  it('Build.cs includes ProceduralMeshComponent dependency', () => {
    const ir = makeMinimalIR();
    const files = generateProjectFiles(ir);
    const buildCs = files.find(f => f.path.endsWith('.Build.cs'))!;

    expect(buildCs.content).toContain('ProceduralMeshComponent');
  });
});
