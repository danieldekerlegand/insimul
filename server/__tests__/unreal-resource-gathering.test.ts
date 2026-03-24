/**
 * Tests for Unreal resource gathering system export
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - ResourceSystem.h/cpp and CraftingSystem.h/cpp when features are enabled
 * - ResourceData.h data struct for DataTable rows
 * - DT_Resources and DT_GatheringNodes DataTable JSON files
 * - Proper node state management, depletion, and respawn logic in templates
 * - Integration between ResourceSystem and CraftingSystem
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import { generateDataTableFiles } from '../services/game-export/unreal/unreal-datatable-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(opts?: { resources?: boolean; crafting?: boolean }): WorldIR {
  const resources = opts?.resources ?? false;
  const crafting = opts?.crafting ?? false;
  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldDescription: 'A test world',
      worldType: 'fantasy',
      genreConfig: {
        genre: 'rpg',
        subGenre: 'action-rpg',
        features: { crafting, resources, survival: false, dungeons: false, vehicles: false, companions: false, factions: false, housing: false, farming: false, fishing: false, cooking: false, mining: false, trading: true },
        cameraMode: 'third-person' as any,
        combatStyle: 'melee' as any,
      },
      exportTimestamp: new Date().toISOString(),
      exportVersion: 1,
      seed: 'test-seed',
    },
    geography: {
      terrainSize: 1000,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
      foliageLayers: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      businesses: [],
      roads: [],
      natureObjects: [],
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
      dialogueContexts: [],
      knowledgeBase: null,
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.4, g: 0.6, b: 0.3 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        settlementBaseColor: { r: 0.8, g: 0.7, b: 0.6 },
        settlementRoofColor: { r: 0.6, g: 0.3, b: 0.2 },
        roadColor: { r: 0.5, g: 0.5, b: 0.5 },
        roadRadius: 2.5,
      } as any,
      skyboxAssetKey: null,
      ambientLighting: { color: [0.3, 0.3, 0.3], intensity: 0.5 },
      directionalLight: { direction: [0, -1, 0], intensity: 1.0 },
      fog: null,
    },
    assets: { collectionId: null, textures: [], models: [], audio: [], animations: [] },
    player: {
      startPosition: { x: 0, y: 1, z: 0 },
      modelAssetKey: null,
      initialEnergy: 100,
      initialGold: 50,
      initialHealth: 100,
      speed: 6,
      jumpHeight: 4,
      gravity: 9.8,
    },
    ui: { showMinimap: true, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg' },
    combat: {
      style: 'melee' as any,
      settings: { baseDamage: 10, damageVariance: 2, criticalChance: 0.1, criticalMultiplier: 2, blockReduction: 0.5, dodgeChance: 0.1, attackCooldown: 500, comboWindowMs: 300, maxComboLength: 3 },
    },
    survival: null,
    resources: resources ? {
      definitions: [
        { id: 'wood' as any, name: 'Wood', icon: '🪵', color: { r: 0.55, g: 0.35, b: 0.15 }, maxStack: 999, gatherTime: 1500, respawnTime: 60000 },
        { id: 'stone' as any, name: 'Stone', icon: '🪨', color: { r: 0.6, g: 0.6, b: 0.6 }, maxStack: 999, gatherTime: 2000, respawnTime: 90000 },
        { id: 'iron' as any, name: 'Iron', icon: '⛏️', color: { r: 0.7, g: 0.7, b: 0.75 }, maxStack: 999, gatherTime: 3000, respawnTime: 120000 },
      ],
      gatheringNodes: [
        { id: 'node_wood_1', resourceType: 'wood' as any, position: { x: 10, y: 0, z: 20 }, maxAmount: 5, respawnTime: 60000, scale: 1.2 },
        { id: 'node_stone_1', resourceType: 'stone' as any, position: { x: 30, y: 0, z: 40 }, maxAmount: 3, respawnTime: 90000, scale: 1.0 },
        { id: 'node_iron_1', resourceType: 'iron' as any, position: { x: 50, y: 5, z: 60 }, maxAmount: 2, respawnTime: 120000, scale: 0.9 },
      ],
    } : null,
    aiConfig: { apiMode: 'insimul', insimulEndpoint: '', geminiModel: '', geminiApiKeyPlaceholder: '', voiceEnabled: false, defaultVoice: '' },
  };
}

// ═════════════════════════════════════════════
// C++ File Generation — ResourceSystem
// ═════════════════════════════════════════════

describe('Unreal export - ResourceSystem C++ generation', () => {
  it('generates ResourceSystem.h and .cpp when resources feature is enabled', () => {
    const ir = makeMinimalIR({ resources: true });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('ResourceSystem.h'));
    const source = files.find(f => f.path.endsWith('ResourceSystem.cpp'));
    expect(header).toBeDefined();
    expect(source).toBeDefined();
    expect(header!.path).toContain('/Systems/');
    expect(source!.path).toContain('/Systems/');
  });

  it('does NOT generate ResourceSystem when resources feature is disabled', () => {
    const ir = makeMinimalIR({ resources: false });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('ResourceSystem.h'));
    expect(header).toBeUndefined();
  });
});

describe('Unreal export - ResourceSystem header content', () => {
  let header: string;

  beforeAll(() => {
    const ir = makeMinimalIR({ resources: true });
    const files = generateCppFiles(ir);
    header = files.find(f => f.path.endsWith('ResourceSystem.h'))!.content;
  });

  it('extends UGameInstanceSubsystem', () => {
    expect(header).toContain('public UGameInstanceSubsystem');
  });

  it('includes the generated header', () => {
    expect(header).toContain('ResourceSystem.generated.h');
  });

  it('declares GatherResource method', () => {
    expect(header).toContain('GatherResource');
  });

  it('declares node state struct with depletion tracking', () => {
    expect(header).toContain('FGatheringNodeState');
    expect(header).toContain('CurrentAmount');
    expect(header).toContain('bDepleted');
    expect(header).toContain('RespawnTimer');
  });

  it('declares resource definition struct', () => {
    expect(header).toContain('FResourceDefinition');
    expect(header).toContain('GatherTime');
    expect(header).toContain('MaxStack');
  });

  it('declares delegates for gather events', () => {
    expect(header).toContain('FOnResourceGathered');
    expect(header).toContain('FOnNodeDepleted');
    expect(header).toContain('FOnNodeRespawned');
  });

  it('declares ConsumeResources for crafting integration', () => {
    expect(header).toContain('ConsumeResources');
  });

  it('declares HasResources for inventory queries', () => {
    expect(header).toContain('HasResources');
  });

  it('declares TickRespawns for node regeneration', () => {
    expect(header).toContain('TickRespawns');
  });

  it('declares GetNodesInRange for spatial queries', () => {
    expect(header).toContain('GetNodesInRange');
  });

  it('declares GetNearestAvailableNode', () => {
    expect(header).toContain('GetNearestAvailableNode');
  });

  it('declares resource inventory map', () => {
    expect(header).toContain('ResourceInventory');
  });
});

describe('Unreal export - ResourceSystem source content', () => {
  let source: string;

  beforeAll(() => {
    const ir = makeMinimalIR({ resources: true });
    const files = generateCppFiles(ir);
    source = files.find(f => f.path.endsWith('ResourceSystem.cpp'))!.content;
  });

  it('loads resource definitions from IR JSON', () => {
    expect(source).toContain('definitions');
    expect(source).toContain('ResourceTypeCount');
  });

  it('loads gathering nodes from IR JSON', () => {
    expect(source).toContain('gatheringNodes');
  });

  it('implements node depletion logic', () => {
    expect(source).toContain('bDepleted = true');
    expect(source).toContain('CurrentAmount -= Gathered');
  });

  it('implements respawn timer logic', () => {
    expect(source).toContain('RespawnTimer -= DeltaSeconds');
    expect(source).toContain('CurrentAmount = Node.MaxAmount');
  });

  it('converts IR Y-up to Unreal Z-up coordinate system', () => {
    // The position loading should swap Y and Z
    expect(source).toContain('GetNumberField(TEXT("z")) * 100.0');
    expect(source).toContain('GetNumberField(TEXT("y")) * 100.0');
  });

  it('converts ms to seconds for gather and respawn times', () => {
    expect(source).toContain('/ 1000.f');
  });

  it('broadcasts events on gather/deplete/respawn', () => {
    expect(source).toContain('OnResourceGathered.Broadcast');
    expect(source).toContain('OnNodeDepleted.Broadcast');
    expect(source).toContain('OnNodeRespawned.Broadcast');
  });

  it('caps inventory at max stack', () => {
    expect(source).toContain('FMath::Min(Held + Gathered, Max)');
  });
});

// ═════════════════════════════════════════════
// C++ File Generation — CraftingSystem
// ═════════════════════════════════════════════

describe('Unreal export - CraftingSystem C++ generation', () => {
  it('generates CraftingSystem.h and .cpp when crafting feature is enabled', () => {
    const ir = makeMinimalIR({ crafting: true });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('CraftingSystem.h'));
    const source = files.find(f => f.path.endsWith('CraftingSystem.cpp'));
    expect(header).toBeDefined();
    expect(source).toBeDefined();
  });

  it('does NOT generate CraftingSystem when crafting feature is disabled', () => {
    const ir = makeMinimalIR({ crafting: false });
    const files = generateCppFiles(ir);
    const header = files.find(f => f.path.endsWith('CraftingSystem.h'));
    expect(header).toBeUndefined();
  });
});

describe('Unreal export - CraftingSystem header content', () => {
  let header: string;

  beforeAll(() => {
    const ir = makeMinimalIR({ crafting: true });
    const files = generateCppFiles(ir);
    header = files.find(f => f.path.endsWith('CraftingSystem.h'))!.content;
  });

  it('extends UGameInstanceSubsystem', () => {
    expect(header).toContain('public UGameInstanceSubsystem');
  });

  it('declares recipe struct with ingredients', () => {
    expect(header).toContain('FCraftingRecipe');
    expect(header).toContain('FCraftingIngredient');
    expect(header).toContain('Ingredients');
  });

  it('declares CanCraft and Craft methods', () => {
    expect(header).toContain('CanCraft');
    expect(header).toContain('Craft');
  });

  it('declares OnItemCrafted delegate', () => {
    expect(header).toContain('FOnItemCrafted');
  });

  it('declares recipe query methods', () => {
    expect(header).toContain('GetAllRecipes');
    expect(header).toContain('GetRecipesByCategory');
  });
});

describe('Unreal export - CraftingSystem source content', () => {
  let source: string;

  beforeAll(() => {
    const ir = makeMinimalIR({ crafting: true });
    const files = generateCppFiles(ir);
    source = files.find(f => f.path.endsWith('CraftingSystem.cpp'))!.content;
  });

  it('includes ResourceSystem header for integration', () => {
    expect(source).toContain('#include "ResourceSystem.h"');
  });

  it('loads recipes from IR JSON', () => {
    expect(source).toContain('craftingRecipes');
  });

  it('checks resource availability via ResourceSystem', () => {
    expect(source).toContain('GetSubsystem<UResourceSystem>');
    expect(source).toContain('HasResources');
  });

  it('consumes resources on craft', () => {
    expect(source).toContain('ConsumeResources');
  });

  it('broadcasts OnItemCrafted event', () => {
    expect(source).toContain('OnItemCrafted.Broadcast');
  });
});

// ═════════════════════════════════════════════
// ResourceData.h — DataTable row struct
// ═════════════════════════════════════════════

describe('Unreal export - ResourceData.h generation', () => {
  it('generates ResourceData.h in the Data directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const dataFile = files.find(f => f.path.endsWith('ResourceData.h'));
    expect(dataFile).toBeDefined();
    expect(dataFile!.path).toContain('/Data/');
  });

  it('declares FInsimulResourceData struct', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const content = files.find(f => f.path.endsWith('ResourceData.h'))!.content;
    expect(content).toContain('FInsimulResourceData');
    expect(content).toContain('FTableRowBase');
  });

  it('declares FInsimulGatheringNodeData struct', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const content = files.find(f => f.path.endsWith('ResourceData.h'))!.content;
    expect(content).toContain('FInsimulGatheringNodeData');
    expect(content).toContain('ResourceType');
    expect(content).toContain('MaxAmount');
    expect(content).toContain('Position');
    expect(content).toContain('Scale');
  });
});

// ═════════════════════════════════════════════
// DataTable JSON — Resources and Gathering Nodes
// ═════════════════════════════════════════════

describe('Unreal export - Resource DataTable generation', () => {
  it('generates DT_Resources.json when resources are present', () => {
    const ir = makeMinimalIR({ resources: true });
    const files = generateDataTableFiles(ir);
    const dtFile = files.find(f => f.path.endsWith('DT_Resources.json'));
    expect(dtFile).toBeDefined();

    const rows = JSON.parse(dtFile!.content);
    expect(rows).toHaveLength(3);
    expect(rows[0].Name).toBe('wood');
    expect(rows[0].ResourceId).toBe('wood');
    expect(rows[0].ResourceName).toBe('Wood');
    expect(rows[0].MaxStack).toBe(999);
    expect(rows[0].GatherTime).toBe(1500);
    expect(rows[0].RespawnTime).toBe(60000);
    expect(rows[0].Color).toEqual({ R: 0.55, G: 0.35, B: 0.15, A: 1.0 });
  });

  it('generates empty DT_Resources.json when resources are null', () => {
    const ir = makeMinimalIR({ resources: false });
    const files = generateDataTableFiles(ir);
    const dtFile = files.find(f => f.path.endsWith('DT_Resources.json'));
    expect(dtFile).toBeDefined();
    const rows = JSON.parse(dtFile!.content);
    expect(rows).toHaveLength(0);
  });
});

describe('Unreal export - Gathering Nodes DataTable generation', () => {
  it('generates DT_GatheringNodes.json when resources are present', () => {
    const ir = makeMinimalIR({ resources: true });
    const files = generateDataTableFiles(ir);
    const dtFile = files.find(f => f.path.endsWith('DT_GatheringNodes.json'));
    expect(dtFile).toBeDefined();

    const rows = JSON.parse(dtFile!.content);
    expect(rows).toHaveLength(3);
    expect(rows[0].Name).toBe('node_wood_1');
    expect(rows[0].NodeId).toBe('node_wood_1');
    expect(rows[0].ResourceType).toBe('wood');
    expect(rows[0].MaxAmount).toBe(5);
    expect(rows[0].Scale).toBe(1.2);
  });

  it('converts positions from Y-up to Z-up (Unreal convention)', () => {
    const ir = makeMinimalIR({ resources: true });
    const files = generateDataTableFiles(ir);
    const dtFile = files.find(f => f.path.endsWith('DT_GatheringNodes.json'));
    const rows = JSON.parse(dtFile!.content);

    // node_wood_1: position { x: 10, y: 0, z: 20 }
    // Unreal: X = x*100, Y = z*100, Z = y*100
    expect(rows[0].Position.X).toBe(1000);  // 10 * 100
    expect(rows[0].Position.Y).toBe(2000);  // 20 * 100 (z → Y)
    expect(rows[0].Position.Z).toBe(0);     // 0 * 100 (y → Z)
  });

  it('generates empty DT_GatheringNodes.json when resources are null', () => {
    const ir = makeMinimalIR({ resources: false });
    const files = generateDataTableFiles(ir);
    const dtFile = files.find(f => f.path.endsWith('DT_GatheringNodes.json'));
    expect(dtFile).toBeDefined();
    const rows = JSON.parse(dtFile!.content);
    expect(rows).toHaveLength(0);
  });

  it('includes iron node with elevation in Z', () => {
    const ir = makeMinimalIR({ resources: true });
    const files = generateDataTableFiles(ir);
    const dtFile = files.find(f => f.path.endsWith('DT_GatheringNodes.json'));
    const rows = JSON.parse(dtFile!.content);

    // node_iron_1: position { x: 50, y: 5, z: 60 }
    const iron = rows.find((r: any) => r.NodeId === 'node_iron_1');
    expect(iron).toBeDefined();
    expect(iron.Position.X).toBe(5000);  // 50 * 100
    expect(iron.Position.Y).toBe(6000);  // 60 * 100
    expect(iron.Position.Z).toBe(500);   // 5 * 100
  });
});

// ═════════════════════════════════════════════
// WorldIR.json includes resources
// ═════════════════════════════════════════════

describe('Unreal export - WorldIR.json resource data', () => {
  it('includes resource definitions and gathering nodes in WorldIR.json', () => {
    const ir = makeMinimalIR({ resources: true });
    const files = generateDataTableFiles(ir);
    const worldIRFile = files.find(f => f.path.endsWith('WorldIR.json'));
    expect(worldIRFile).toBeDefined();

    const worldIR = JSON.parse(worldIRFile!.content);
    expect(worldIR.resources).toBeDefined();
    expect(worldIR.resources.definitions).toHaveLength(3);
    expect(worldIR.resources.gatheringNodes).toHaveLength(3);
  });

  it('WorldIR.json resources is null when feature is off', () => {
    const ir = makeMinimalIR({ resources: false });
    const files = generateDataTableFiles(ir);
    const worldIRFile = files.find(f => f.path.endsWith('WorldIR.json'));
    const worldIR = JSON.parse(worldIRFile!.content);
    expect(worldIR.resources).toBeNull();
  });
});
