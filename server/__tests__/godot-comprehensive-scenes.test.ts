/**
 * Tests for comprehensive .tscn scene files with full node hierarchy.
 *
 * Verifies that main.tscn includes all UI nodes (InventoryUI, QuestJournal,
 * GameMenu, DialoguePanel, QuestTracker, ChatPanel), correct load_steps,
 * and that project.godot gets conditional autoloads.
 */

import { describe, it, expect } from 'vitest';
import { generateSceneFiles } from '../services/game-export/godot/godot-scene-generator';
import { generateProjectFiles } from '../services/game-export/godot/godot-project-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  return {
    meta: {
      worldId: 'w1',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'test-seed',
      insimulVersion: '1.0.0',
      exportedAt: '2026-03-24',
      genreConfig: {
        id: 'medieval_fantasy',
        name: 'Medieval Fantasy',
        features: { crafting: false, resources: false, magic: false },
        worldDefaults: {},
      },
    },
    geography: {
      terrainSize: 200,
      countries: [],
      states: [],
      settlements: [
        {
          id: 'settlement-1',
          name: 'Testville',
          description: 'A test town',
          settlementType: 'town',
          population: 50,
          position: { x: 100, y: 0, z: 100 },
          radius: 50,
          countryId: null,
          stateId: null,
          mayorId: null,
          elevationProfile: { minElevation: 0, maxElevation: 5, meanElevation: 2, elevationRange: 5, slopeClass: 'flat' },
          lots: [],
          businessIds: [],
          roads: [],
          infrastructure: [],
          streetNetwork: { layout: 'grid', nodes: [], segments: [] },
        },
      ],
      waterFeatures: [],
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
      knowledgeBase: '',
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.3, g: 0.5, b: 0.2 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        roadColor: { r: 0.4, g: 0.35, b: 0.3 },
        roadRadius: 2,
        settlementBaseColor: { r: 0.7, g: 0.6, b: 0.5 },
        settlementRoofColor: { r: 0.5, g: 0.3, b: 0.2 },
      },
      ambientLighting: { color: [0.5, 0.5, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0, -1, 0.5], intensity: 1 },
      fog: null,
    },
    assets: { textures: [], models: [], audio: [], animations: [] },
    player: {
      startPosition: { x: 100, y: 1, z: 100 },
      speed: 5,
      jumpHeight: 1.5,
      gravity: 9.8,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
    },
    ui: { showMinimap: false, showQuestTracker: true, showChat: true },
    combat: {
      style: 'real-time',
      settings: {
        baseDamage: 10,
        criticalChance: 0.1,
        criticalMultiplier: 2,
        blockReduction: 0.5,
        dodgeChance: 0.1,
        attackCooldown: 1000,
      },
    },
    survival: null,
    resources: null,
    aiConfig: { apiMode: 'none', model: '', endpoint: '' },
    ...overrides,
  } as WorldIR;
}

function getMainTscn(ir: WorldIR): string {
  const files = generateSceneFiles(ir);
  const tscnFile = files.find(f => f.path === 'scenes/main.tscn');
  expect(tscnFile).toBeDefined();
  return tscnFile!.content;
}

// ─────────────────────────────────────────────
// Main scene: UI node hierarchy
// ─────────────────────────────────────────────

describe('Godot main.tscn - comprehensive UI nodes', () => {
  it('includes InventoryUI node with script', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="InventoryUI" type="CanvasLayer" parent="."]');
    expect(tscn).toContain('path="res://scripts/ui/inventory_ui.gd"');
  });

  it('includes InventoryUI Panel child node', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="Panel" type="PanelContainer" parent="InventoryUI"]');
  });

  it('includes QuestJournal node with script', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="QuestJournal" type="CanvasLayer" parent="."]');
    expect(tscn).toContain('path="res://scripts/ui/quest_journal_ui.gd"');
  });

  it('includes GameMenu node with script and child hierarchy', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="GameMenu" type="CanvasLayer" parent="."]');
    expect(tscn).toContain('path="res://scripts/ui/game_menu.gd"');
    expect(tscn).toContain('[node name="MenuPanel" type="PanelContainer" parent="GameMenu"]');
    expect(tscn).toContain('[node name="VBoxContainer" type="VBoxContainer" parent="GameMenu/MenuPanel"]');
    expect(tscn).toContain('[node name="ResumeButton" type="Button" parent="GameMenu/MenuPanel/VBoxContainer"]');
    expect(tscn).toContain('[node name="QuitButton" type="Button" parent="GameMenu/MenuPanel/VBoxContainer"]');
  });

  it('includes DialoguePanel node with script', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="DialoguePanel" type="CanvasLayer" parent="."]');
    expect(tscn).toContain('path="res://scripts/ui/dialogue_panel.gd"');
  });

  it('includes QuestTracker as child of HUD', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="QuestTracker" type="Control" parent="HUD"]');
    expect(tscn).toContain('path="res://scripts/ui/quest_tracker_ui.gd"');
  });

  it('includes ChatPanel node with script', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="ChatPanel" type="CanvasLayer" parent="."]');
    expect(tscn).toContain('path="res://scripts/ui/chat_panel.gd"');
    expect(tscn).toContain('[node name="Panel" type="PanelContainer" parent="ChatPanel"]');
  });

  it('sets UI overlays as hidden by default', () => {
    const tscn = getMainTscn(makeMinimalIR());

    // Extract InventoryUI node block and check visibility
    const inventoryIdx = tscn.indexOf('[node name="InventoryUI"');
    const afterInventory = tscn.slice(inventoryIdx, inventoryIdx + 200);
    expect(afterInventory).toContain('visible = false');

    const questJournalIdx = tscn.indexOf('[node name="QuestJournal"');
    const afterQJ = tscn.slice(questJournalIdx, questJournalIdx + 200);
    expect(afterQJ).toContain('visible = false');

    const gameMenuIdx = tscn.indexOf('[node name="GameMenu"');
    const afterGM = tscn.slice(gameMenuIdx, gameMenuIdx + 200);
    expect(afterGM).toContain('visible = false');

    const dialogueIdx = tscn.indexOf('[node name="DialoguePanel"');
    const afterDP = tscn.slice(dialogueIdx, dialogueIdx + 200);
    expect(afterDP).toContain('visible = false');
  });

  it('sets process_mode = 3 on UI overlays for pause support', () => {
    const tscn = getMainTscn(makeMinimalIR());

    for (const name of ['InventoryUI', 'QuestJournal', 'GameMenu', 'DialoguePanel', 'ChatPanel']) {
      const idx = tscn.indexOf(`[node name="${name}"`);
      const block = tscn.slice(idx, idx + 200);
      expect(block).toContain('process_mode = 3');
    }
  });

  it('assigns correct CanvasLayer layers for z-ordering', () => {
    const tscn = getMainTscn(makeMinimalIR());

    // GameMenu should be on highest layer (20) so it covers everything
    const gameMenuIdx = tscn.indexOf('[node name="GameMenu"');
    const gameMenuBlock = tscn.slice(gameMenuIdx, gameMenuIdx + 200);
    expect(gameMenuBlock).toContain('layer = 20');

    // DialoguePanel on layer 15
    const dialogueIdx = tscn.indexOf('[node name="DialoguePanel"');
    const dialogueBlock = tscn.slice(dialogueIdx, dialogueIdx + 200);
    expect(dialogueBlock).toContain('layer = 15');
  });
});

// ─────────────────────────────────────────────
// Main scene: load_steps correctness
// ─────────────────────────────────────────────

describe('Godot main.tscn - load_steps count', () => {
  it('has correct load_steps without minimap', () => {
    const tscn = getMainTscn(makeMinimalIR({ ui: { showMinimap: false, showQuestTracker: true, showChat: true } }));
    // 17 ext_resources + 3 sub_resources = 20
    expect(tscn).toContain('load_steps=20');
  });

  it('has correct load_steps with minimap', () => {
    const tscn = getMainTscn(makeMinimalIR({ ui: { showMinimap: true, showQuestTracker: true, showChat: true } }));
    // 18 ext_resources + 3 sub_resources = 21
    expect(tscn).toContain('load_steps=21');
  });

  it('includes minimap ext_resource and node when enabled', () => {
    const tscn = getMainTscn(makeMinimalIR({ ui: { showMinimap: true, showQuestTracker: true, showChat: true } }));
    expect(tscn).toContain('path="res://scripts/ui/minimap.gd"');
    expect(tscn).toContain('[node name="Minimap" type="Control" parent="HUD"]');
  });

  it('omits minimap when disabled', () => {
    const tscn = getMainTscn(makeMinimalIR({ ui: { showMinimap: false, showQuestTracker: true, showChat: true } }));
    expect(tscn).not.toContain('minimap.gd');
    expect(tscn).not.toContain('[node name="Minimap"');
  });
});

// ─────────────────────────────────────────────
// Main scene: existing nodes preserved
// ─────────────────────────────────────────────

describe('Godot main.tscn - existing nodes preserved', () => {
  it('includes all world generator nodes', () => {
    const tscn = getMainTscn(makeMinimalIR());
    for (const name of ['WorldScaleManager', 'TerrainGenerator', 'BuildingGenerator', 'RoadGenerator', 'NatureGenerator', 'WaterGenerator', 'NPCSpawner']) {
      expect(tscn).toContain(`[node name="${name}"`);
    }
  });

  it('includes player with correct transform', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="Player" type="CharacterBody3D"');
    expect(tscn).toContain('100, 2, 100');
  });

  it('includes WorldEnvironment and DirectionalLight3D', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="WorldEnvironment"');
    expect(tscn).toContain('[node name="DirectionalLight3D"');
  });

  it('includes HUD and WorldMap', () => {
    const tscn = getMainTscn(makeMinimalIR());
    expect(tscn).toContain('[node name="HUD" type="CanvasLayer"');
    expect(tscn).toContain('[node name="WorldMap" type="CanvasLayer"');
  });
});

// ─────────────────────────────────────────────
// Main scene: ext_resource count
// ─────────────────────────────────────────────

describe('Godot main.tscn - external resources', () => {
  it('has 17 ext_resources without minimap', () => {
    const tscn = getMainTscn(makeMinimalIR());
    const matches = tscn.match(/\[ext_resource/g);
    expect(matches).toHaveLength(17);
  });

  it('has 18 ext_resources with minimap', () => {
    const tscn = getMainTscn(makeMinimalIR({ ui: { showMinimap: true, showQuestTracker: true, showChat: true } }));
    const matches = tscn.match(/\[ext_resource/g);
    expect(matches).toHaveLength(18);
  });
});

// ─────────────────────────────────────────────
// project.godot: conditional autoloads
// ─────────────────────────────────────────────

describe('Godot project.godot - conditional autoloads', () => {
  it('includes base autoloads without conditional systems', () => {
    const ir = makeMinimalIR();
    const files = generateProjectFiles(ir);
    const projectFile = files.find(f => f.path === 'project.godot');
    expect(projectFile).toBeDefined();

    const content = projectFile!.content;
    expect(content).toContain('GameManager=');
    expect(content).toContain('DataLoader=');
    expect(content).toContain('QuestSystem=');
    expect(content).not.toContain('SurvivalSystem=');
    expect(content).not.toContain('CraftingSystem=');
    expect(content).not.toContain('ResourceSystem=');
  });

  it('adds SurvivalSystem autoload when survival is present', () => {
    const ir = makeMinimalIR({
      survival: {
        hungerRate: 1,
        thirstRate: 1.5,
        fatigueRate: 0.5,
        maxHunger: 100,
        maxThirst: 100,
        maxFatigue: 100,
        hungerDamageThreshold: 0,
        thirstDamageThreshold: 0,
        hungerDamageRate: 1,
        thirstDamageRate: 1,
      },
    });
    const files = generateProjectFiles(ir);
    const content = files.find(f => f.path === 'project.godot')!.content;
    expect(content).toContain('SurvivalSystem="*res://scripts/systems/survival_system.gd"');
  });

  it('adds CraftingSystem and ResourceSystem autoloads when genre features enabled', () => {
    const ir = makeMinimalIR();
    ir.meta.genreConfig.features.crafting = true;
    ir.meta.genreConfig.features.resources = true;
    const files = generateProjectFiles(ir);
    const content = files.find(f => f.path === 'project.godot')!.content;
    expect(content).toContain('CraftingSystem="*res://scripts/systems/crafting_system.gd"');
    expect(content).toContain('ResourceSystem="*res://scripts/systems/resource_system.gd"');
  });

  it('places conditional autoloads before the [display] section', () => {
    const ir = makeMinimalIR({
      survival: {
        hungerRate: 1,
        thirstRate: 1.5,
        fatigueRate: 0.5,
        maxHunger: 100,
        maxThirst: 100,
        maxFatigue: 100,
        hungerDamageThreshold: 0,
        thirstDamageThreshold: 0,
        hungerDamageRate: 1,
        thirstDamageRate: 1,
      },
    });
    const files = generateProjectFiles(ir);
    const content = files.find(f => f.path === 'project.godot')!.content;

    const survivalPos = content.indexOf('SurvivalSystem=');
    const displayPos = content.indexOf('[display]');
    expect(survivalPos).toBeLessThan(displayPos);
    expect(survivalPos).toBeGreaterThan(content.indexOf('[autoload]'));
  });
});
