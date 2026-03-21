/**
 * Tests for Babylon.js scene generator
 *
 * Verifies that generateSceneFiles produces scene-builder.ts,
 * world-generator.ts, and npc-spawner.ts with all IR data embedded.
 */

import { describe, it, expect } from 'vitest';
import { generateSceneFiles } from '../services/game-export/babylon/babylon-scene-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

/** Minimal WorldIR fixture with representative data */
function createTestIR(): WorldIR {
  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world-1',
      worldName: 'Test World',
      worldDescription: 'A test world',
      worldType: 'fantasy',
      genreConfig: {} as any,
      exportTimestamp: '2026-03-13T00:00:00Z',
      exportVersion: 1,
      seed: 'test-seed',
    },
    geography: {
      terrainSize: 500,
      countries: [],
      states: [],
      settlements: [
        {
          id: 'settlement-1',
          worldId: 'test-world-1',
          countryId: null,
          stateId: null,
          name: 'Testville',
          description: null,
          settlementType: 'town',
          terrain: 'plains',
          population: 100,
          foundedYear: 1900,
          founderIds: [],
          mayorId: null,
          position: { x: 0, y: 0, z: 0 },
          radius: 50,
          elevationProfile: {
            minElevation: 0,
            maxElevation: 5,
            meanElevation: 2.5,
            elevationRange: 5,
            slopeClass: 'flat',
          },
          lots: [
            {
              id: 'lot-1',
              address: '1 Main St',
              houseNumber: 1,
              streetName: 'Main St',
              block: 'A',
              districtName: null,
              position: { x: 10, y: 0, z: 5 },
              buildingType: 'residence',
              buildingId: 'building-1',
            },
          ],
          businessIds: [],
          internalRoads: [],
          infrastructure: [
            {
              id: 'infra-1',
              name: 'Well',
              category: 'water',
              level: 1,
              builtYear: 1900,
              description: 'Town well',
            },
          ],
          streetNetwork: {
            layout: 'grid',
            nodes: [
              { id: 'node-1', position: { x: -20, y: 0, z: 0 }, intersectionOf: ['Main St'] },
              { id: 'node-2', position: { x: 20, y: 0, z: 0 }, intersectionOf: ['Main St'] },
            ],
            segments: [
              {
                id: 'seg-1',
                name: 'Main St',
                direction: 'EW' as const,
                nodeIds: ['node-1', 'node-2'],
                waypoints: [
                  { x: -20, y: 0, z: 0 },
                  { x: 20, y: 0, z: 0 },
                ],
                width: 6,
              },
            ],
          },
        },
      ],
      waterFeatures: [
        {
          id: 'water-1',
          worldId: 'test-world-1',
          type: 'lake' as any,
          subType: 'fresh',
          name: 'Crystal Lake',
          position: { x: 100, y: 0, z: 100 },
          waterLevel: 0.5,
          bounds: { minX: 80, maxX: 120, minZ: 80, maxZ: 120, centerX: 100, centerZ: 100 },
          depth: 5,
          width: 40,
          flowDirection: null,
          flowSpeed: 0,
          shorelinePoints: [
            { x: 80, y: 0.5, z: 80 },
            { x: 120, y: 0.5, z: 80 },
            { x: 120, y: 0.5, z: 120 },
            { x: 80, y: 0.5, z: 120 },
          ],
          settlementId: null,
          biome: 'forest',
          isNavigable: true,
          isDrinkable: true,
          modelAssetKey: null,
          color: { r: 0.1, g: 0.4, b: 0.7 },
          transparency: 0.3,
        },
      ],
    },
    entities: {
      characters: [
        {
          id: 'char-1',
          worldId: 'test-world-1',
          firstName: 'Alice',
          middleName: null,
          lastName: 'Smith',
          suffix: null,
          gender: 'female',
          isAlive: true,
          birthYear: 1980,
          personality: { openness: 0.8, conscientiousness: 0.6, extroversion: 0.7, agreeableness: 0.9, neuroticism: 0.3 },
          physicalTraits: {},
          mentalTraits: {},
          skills: { cooking: 5 },
          relationships: {},
          socialAttributes: {},
          coworkerIds: [],
          friendIds: [],
          neighborIds: [],
          immediateFamilyIds: [],
          extendedFamilyIds: [],
          parentIds: [],
          childIds: [],
          spouseId: null,
          genealogyData: {},
          currentLocation: 'settlement-1',
          occupation: 'baker',
          status: null,
        },
      ],
      npcs: [
        {
          characterId: 'char-1',
          role: 'merchant',
          homePosition: { x: 10, y: 0, z: 5 },
          patrolRadius: 15,
          disposition: 75,
          settlementId: 'settlement-1',
          questIds: [],
          greeting: 'Welcome!',
        },
      ],
      buildings: [
        {
          id: 'building-1',
          settlementId: 'settlement-1',
          position: { x: 10, y: 0, z: 5 },
          rotation: 0.5,
          spec: {
            buildingRole: 'bakery',
            floors: 2,
            width: 8,
            depth: 6,
            hasChimney: true,
            hasBalcony: false,
          },
          style: {
            baseColor: { r: 0.8, g: 0.7, b: 0.6 },
            roofColor: { r: 0.5, g: 0.3, b: 0.2 },
          } as any,
          occupantIds: ['char-1'],
          interior: null,
          businessId: null,
          modelAssetKey: null,
        },
      ],
      businesses: [],
      roads: [
        {
          fromId: 'settlement-1',
          toId: 'settlement-2',
          waypoints: [
            { x: 0, y: 0, z: 0 },
            { x: 50, y: 0, z: 50 },
            { x: 100, y: 0, z: 100 },
          ],
          width: 4,
          materialKey: 'dirt',
        },
      ],
      natureObjects: [
        {
          type: 'tree' as const,
          subType: 'oak',
          position: { x: 30, y: 0, z: 30 },
          scale: { x: 1, y: 1.5, z: 1 },
          rotation: 0,
          biome: 'forest',
          modelAssetKey: null,
          elevationZone: 'lowland',
        },
        {
          type: 'rock' as const,
          subType: 'granite',
          position: { x: 40, y: 0, z: 40 },
          scale: { x: 2, y: 1, z: 2 },
          rotation: 1.2,
          biome: 'mountains',
          modelAssetKey: null,
          elevationZone: 'midland',
        },
      ],
      animals: [],
      dungeons: [],
      questObjects: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      languages: [],
      items: [],
      lootTables: [],
      knowledgeBase: null,
    },
    theme: {
      visualTheme: 'medieval' as any,
      skyboxAssetKey: null,
      ambientLighting: { color: [0.6, 0.6, 0.7], intensity: 0.8 },
      directionalLight: { direction: [-1, -2, -1], intensity: 1.2 },
      fog: { mode: 'exp2', density: 0.002, color: [0.7, 0.8, 0.9] },
    },
    assets: { collectionId: null, textures: [], models: [], audio: [], animations: [] },
    player: {
      startPosition: { x: 0, y: 0, z: 0 },
      startRotation: 0,
      cameraMode: 'third_person' as any,
      moveSpeed: 5,
      modelAssetKey: null,
    },
    ui: {
      showMinimap: true,
      showQuestTracker: true,
      showHealthBar: true,
      chatEnabled: true,
      inventoryEnabled: true,
    },
    combat: {
      enabled: true,
      style: 'action' as any,
      playerBaseHealth: 100,
      playerBaseDamage: 10,
      playerBaseArmor: 5,
      critChance: 0.1,
      critMultiplier: 2,
    },
    survival: null,
    resources: null,
    aiConfig: { provider: 'gemini', model: 'gemini-pro', temperature: 0.7 },
  };
}

describe('generateSceneFiles', () => {
  const ir = createTestIR();
  const files = generateSceneFiles(ir);

  it('produces three files', () => {
    expect(files).toHaveLength(3);
    const paths = files.map(f => f.path);
    expect(paths).toContain('src/game/scene-builder.ts');
    expect(paths).toContain('src/game/world-generator.ts');
    expect(paths).toContain('src/game/npc-spawner.ts');
  });

  describe('scene-builder.ts', () => {
    const file = files.find(f => f.path === 'src/game/scene-builder.ts')!;

    it('includes world name in header', () => {
      expect(file.content).toContain('Test World');
    });

    it('imports WorldGenerator and NPCSpawner', () => {
      expect(file.content).toContain("import { WorldGenerator } from './world-generator'");
      expect(file.content).toContain("import { NPCSpawner } from './npc-spawner'");
    });

    it('bakes theme lighting values', () => {
      expect(file.content).toContain('0.6, 0.6, 0.7');
      expect(file.content).toContain('intensity = 0.8');
    });

    it('includes fog when theme has fog', () => {
      expect(file.content).toContain('fogDensity = 0.002');
      expect(file.content).toContain('FOGMODE_EXP2');
    });

    it('omits fog when theme has no fog', () => {
      const noFogIR = { ...ir, theme: { ...ir.theme, fog: null } };
      const noFogFiles = generateSceneFiles(noFogIR);
      const noFogScene = noFogFiles.find(f => f.path === 'src/game/scene-builder.ts')!;
      expect(noFogScene.content).not.toContain('fogDensity');
    });
  });

  describe('world-generator.ts', () => {
    const file = files.find(f => f.path === 'src/game/world-generator.ts')!;

    it('embeds terrain size', () => {
      expect(file.content).toContain('TERRAIN_SIZE = 500');
    });

    it('embeds settlement data with street segments', () => {
      expect(file.content).toContain('Testville');
      expect(file.content).toContain('Main St');
      expect(file.content).toContain('"direction": "EW"');
    });

    it('embeds building data with spec and style', () => {
      expect(file.content).toContain('building-1');
      expect(file.content).toContain('"floors": 2');
      expect(file.content).toContain('"width": 8');
      expect(file.content).toContain('"rotation": 0.5');
    });

    it('embeds road waypoints', () => {
      expect(file.content).toContain('ROADS');
      // Verify middle waypoint from our test data
      expect(file.content).toContain('"x": 50');
    });

    it('embeds water feature data', () => {
      expect(file.content).toContain('Crystal Lake');
      expect(file.content).toContain('"type": "lake"');
      expect(file.content).toContain('waterLevel');
      expect(file.content).toContain('shorelinePoints');
    });

    it('embeds nature objects', () => {
      expect(file.content).toContain('NATURE_OBJECTS');
      expect(file.content).toContain('"subType": "oak"');
      expect(file.content).toContain('"subType": "granite"');
    });

    it('generates building creation with shadow casters', () => {
      expect(file.content).toContain('shadowGen.addShadowCaster(mesh)');
    });

    it('generates street network rendering', () => {
      expect(file.content).toContain('createStreetNetworks');
      expect(file.content).toContain('CreateTube');
    });

    it('generates water feature rendering with shoreline polygon', () => {
      expect(file.content).toContain('createWaterFeatures');
      expect(file.content).toContain('CreatePolygon');
    });

    it('generates nature objects with tree/rock/bush types', () => {
      expect(file.content).toContain('createNatureObjects');
      expect(file.content).toContain("case 'tree'");
      expect(file.content).toContain("case 'rock'");
      expect(file.content).toContain("case 'bush'");
    });

    it('embeds lot positions for settlements', () => {
      expect(file.content).toContain('"address": "1 Main St"');
      expect(file.content).toContain('"buildingType": "residence"');
    });

    it('embeds elevation profile', () => {
      expect(file.content).toContain('"slopeClass": "flat"');
    });
  });

  describe('npc-spawner.ts', () => {
    const file = files.find(f => f.path === 'src/game/npc-spawner.ts')!;

    it('merges NPC and character data', () => {
      expect(file.content).toContain('Alice Smith');
      expect(file.content).toContain('"occupation": "baker"');
      expect(file.content).toContain('"role": "merchant"');
    });

    it('uses homePosition for NPC placement', () => {
      // position should match homePosition from NPC data
      expect(file.content).toContain('"x": 10');
      expect(file.content).toContain('"z": 5');
    });

    it('stores metadata on mesh for picking', () => {
      expect(file.content).toContain('body.metadata');
      expect(file.content).toContain('characterId');
      expect(file.content).toContain('occupation');
    });

    it('creates body and head meshes per NPC', () => {
      expect(file.content).toContain('CreateCapsule');
      expect(file.content).toContain('CreateSphere');
    });
  });

  describe('edge cases', () => {
    it('handles empty settlements', () => {
      const emptyIR = {
        ...ir,
        geography: { ...ir.geography, settlements: [], waterFeatures: [] },
        entities: { ...ir.entities, buildings: [], roads: [], natureObjects: [], npcs: [] },
      };
      const result = generateSceneFiles(emptyIR);
      expect(result).toHaveLength(3);
      const wg = result.find(f => f.path === 'src/game/world-generator.ts')!;
      expect(wg.content).toContain('SETTLEMENTS = []');
      expect(wg.content).toContain('BUILDINGS = []');
    });

    it('handles NPC with missing character data', () => {
      const missingCharIR = {
        ...ir,
        entities: {
          ...ir.entities,
          characters: [], // no matching character
          npcs: [{ ...ir.entities.npcs[0] }],
        },
      };
      const result = generateSceneFiles(missingCharIR);
      const ns = result.find(f => f.path === 'src/game/npc-spawner.ts')!;
      // Falls back to characterId as name
      expect(ns.content).toContain('"name": "char-1"');
      expect(ns.content).toContain('"occupation": null');
    });

    it('handles water feature without shoreline points', () => {
      const noShorelineIR = {
        ...ir,
        geography: {
          ...ir.geography,
          waterFeatures: [{
            ...ir.geography.waterFeatures[0],
            shorelinePoints: [],
          }],
        },
      };
      const result = generateSceneFiles(noShorelineIR);
      const wg = result.find(f => f.path === 'src/game/world-generator.ts')!;
      // Should still have fallback bounds-based rendering in generated code
      expect(wg.content).toContain('CreateGround');
    });
  });
});
