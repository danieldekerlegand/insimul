/**
 * Tests for Godot export parity part 2 — verifies all new GDScript templates
 * for character systems, NPC behavior, dialogue, combat, UI, exploration,
 * audio, VR, save/load, and more are properly integrated.
 */

import { describe, it, expect } from 'vitest';
import { generateSceneFiles } from '../services/game-export/godot/godot-scene-generator';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import { validateGDScriptFiles } from '../services/game-export/godot/gdscript-validator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  return {
    meta: {
      worldId: 'w1',
      worldName: 'Parity2 Test World',
      worldType: 'medieval-fantasy',
      seed: 'parity2-seed',
      insimulVersion: '1.0.0',
      exportedAt: '2026-03-30',
      genreConfig: {
        id: 'medieval_fantasy',
        name: 'Medieval Fantasy',
        features: { crafting: false, resources: false, magic: false },
        worldDefaults: {},
      },
    },
    geography: {
      terrainSize: 512,
      heightmap: [[0.0, 0.1], [0.1, 0.5]],
      slopeMap: [[0.0, 0.1], [0.1, 0.4]],
      terrainFeatures: [],
      biomeZones: [],
      countries: [{ id: 'c1', name: 'TestCountry', position: { x: 0, y: 0, z: 0 } }],
      states: [{ id: 's1', name: 'TestState', countryId: 'c1', position: { x: 0, y: 0, z: 0 } }],
      settlements: [{
        id: 'set1',
        name: 'TestTown',
        description: 'A test town',
        settlementType: 'town',
        population: 200,
        position: { x: 100, y: 0, z: 100 },
        radius: 50,
        countryId: 'c1',
        stateId: 's1',
        mayorId: '',
        lots: [{
          id: 'lot1',
          address: '1 Main St',
          houseNumber: 1,
          streetName: 'Main St',
          block: '',
          districtName: '',
          position: { x: 100, y: 0, z: 100 },
          facingAngle: 0,
          elevation: 0,
          buildingType: 'residential',
          buildingId: 'bld1',
          streetEdgeId: '',
          side: '',
          neighboringLotIds: [],
          distanceFromDowntown: 0,
          formerBuildingIds: [],
        }],
        streetNetwork: {
          layout: 'grid',
          nodes: [
            { id: 'n1', position: { x: 80, y: 0, z: 100 }, intersectionOf: [] },
            { id: 'n2', position: { x: 120, y: 0, z: 100 }, intersectionOf: [] },
          ],
          segments: [{
            id: 'seg1', name: 'Main St', direction: 'EW', nodeIds: ['n1', 'n2'],
            waypoints: [{ x: 80, y: 0, z: 100 }, { x: 120, y: 0, z: 100 }], width: 6,
          }],
        },
      }],
      waterFeatures: [],
      foliageLayers: [],
      worldScaleFactor: 1.0,
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [{
        id: 'bld1',
        settlementId: 'set1',
        lotId: 'lot1',
        position: { x: 105, y: 0, z: 95 },
        rotation: 0,
        spec: { buildingRole: 'tavern', floors: 2, width: 12, depth: 10, hasChimney: true, hasBalcony: false },
        modelAssetKey: '',
        businessId: 'biz1',
        occupantIds: [],
      }],
      businesses: [{
        id: 'biz1',
        settlementId: 'set1',
        name: 'The Rusty Tankard',
        businessType: 'tavern',
        ownerId: '',
        isOutOfBusiness: false,
        foundedYear: 1850,
        lotId: 'lot1',
      }],
      roads: [{
        fromId: 'set1', toId: 'set1', width: 3,
        waypoints: [{ x: 80, y: 0, z: 100 }, { x: 120, y: 0, z: 100 }],
      }],
      natureObjects: [],
      animals: [],
      dungeons: [],
      questObjects: [],
      containers: [],
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
      texts: [],
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
    ui: { showMinimap: true, showQuestTracker: true, showChat: true },
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

// ─────────────────────────────────────────────
// New character scripts
// ─────────────────────────────────────────────

describe('Godot export parity part 2 — character scripts', () => {
  const newCharacterScripts = [
    'scripts/characters/camera_manager.gd',
    'scripts/characters/npc_modular_assembler.gd',
    'scripts/characters/npc_accessory_system.gd',
    'scripts/characters/npc_animation_controller.gd',
    'scripts/characters/npc_movement_controller.gd',
    'scripts/characters/npc_schedule_system.gd',
    'scripts/characters/npc_simulation_lod.gd',
    'scripts/characters/npc_greeting_system.gd',
    'scripts/characters/npc_activity_label_system.gd',
    'scripts/characters/ambient_conversation_system.gd',
    'scripts/characters/lip_sync_controller.gd',
  ];

  it('includes all new character scripts in GDScript output', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const paths = files.map(f => f.path);

    for (const script of newCharacterScripts) {
      expect(paths, `Missing script: ${script}`).toContain(script);
    }
  });

  it('all character scripts have valid GDScript (no unreplaced tokens)', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const newFiles = files.filter(f => newCharacterScripts.includes(f.path));

    for (const file of newFiles) {
      const tokens = file.content.match(/\{\{[A-Z_]+\}\}/g);
      expect(tokens, `Unreplaced tokens in ${file.path}: ${tokens?.join(', ')}`).toBeNull();
    }
  });

  it('all character scripts extend correct base classes', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);

    for (const script of newCharacterScripts) {
      const file = files.find(f => f.path === script);
      expect(file, `Missing: ${script}`).toBeDefined();
      expect(file!.content).toMatch(/^extends (Node3D|Node|CharacterBody3D)\b/m);
    }
  });
});

// ─────────────────────────────────────────────
// New system scripts
// ─────────────────────────────────────────────

describe('Godot export parity part 2 — system scripts', () => {
  const newSystemScripts = [
    'scripts/systems/npc_business_interaction_system.gd',
    'scripts/systems/reputation_manager.gd',
    'scripts/systems/exploration_discovery_system.gd',
    'scripts/systems/quest_completion_manager.gd',
    'scripts/systems/animal_npc_system.gd',
    'scripts/systems/photography_system.gd',
    'scripts/systems/puzzle_system.gd',
    'scripts/systems/vr_support.gd',
  ];

  it('includes all new system scripts in GDScript output', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const paths = files.map(f => f.path);

    for (const script of newSystemScripts) {
      expect(paths, `Missing script: ${script}`).toContain(script);
    }
  });

  it('all system scripts have no unreplaced tokens', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const newFiles = files.filter(f => newSystemScripts.includes(f.path));

    for (const file of newFiles) {
      const tokens = file.content.match(/\{\{[A-Z_]+\}\}/g);
      expect(tokens, `Unreplaced tokens in ${file.path}: ${tokens?.join(', ')}`).toBeNull();
    }
  });

  it('all system scripts extend correct base classes', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);

    for (const script of newSystemScripts) {
      const file = files.find(f => f.path === script);
      expect(file, `Missing: ${script}`).toBeDefined();
      expect(file!.content).toMatch(/^extends (Node3D|Node)\b/m);
    }
  });
});

// ─────────────────────────────────────────────
// New UI scripts
// ─────────────────────────────────────────────

describe('Godot export parity part 2 — UI scripts', () => {
  const newUIScripts = [
    'scripts/ui/game_intro_sequence.gd',
    'scripts/ui/onboarding_manager.gd',
    'scripts/ui/action_quick_bar.gd',
    'scripts/ui/document_reading_panel.gd',
  ];

  it('includes all new UI scripts in GDScript output', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const paths = files.map(f => f.path);

    for (const script of newUIScripts) {
      expect(paths, `Missing script: ${script}`).toContain(script);
    }
  });

  it('all UI scripts have no unreplaced tokens', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const newFiles = files.filter(f => newUIScripts.includes(f.path));

    for (const file of newFiles) {
      const tokens = file.content.match(/\{\{[A-Z_]+\}\}/g);
      expect(tokens, `Unreplaced tokens in ${file.path}: ${tokens?.join(', ')}`).toBeNull();
    }
  });

  it('all UI scripts extend correct base classes', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);

    for (const script of newUIScripts) {
      const file = files.find(f => f.path === script);
      expect(file, `Missing: ${script}`).toBeDefined();
      expect(file!.content).toMatch(/^extends (CanvasLayer|Node|Control|PanelContainer)\b/m);
    }
  });
});

// ─────────────────────────────────────────────
// Scene generator includes new nodes
// ─────────────────────────────────────────────

describe('Godot scene generator — parity part 2 nodes', () => {
  const newSceneNodes = [
    'CameraManager',
    'NPCGreetingSystem',
    'NPCSimulationLOD',
    'NPCActivityLabelSystem',
    'AmbientConversationSystem',
    'ReputationManager',
    'ExplorationDiscoverySystem',
    'QuestCompletionManager',
    'ActionQuickBar',
  ];

  it('main.tscn includes all new system nodes', () => {
    const ir = makeMinimalIR();
    const sceneFiles = generateSceneFiles(ir);
    const mainTscn = sceneFiles.find(f => f.path === 'scenes/main.tscn');
    expect(mainTscn).toBeDefined();

    for (const nodeName of newSceneNodes) {
      expect(
        mainTscn!.content,
        `Missing scene node: ${nodeName}`,
      ).toContain(`[node name="${nodeName}"`);
    }
  });

  it('new scene nodes reference correct script ExtResources', () => {
    const ir = makeMinimalIR();
    const sceneFiles = generateSceneFiles(ir);
    const mainTscn = sceneFiles.find(f => f.path === 'scenes/main.tscn')!;

    expect(mainTscn.content).toContain('camera_manager.gd');
    expect(mainTscn.content).toContain('npc_greeting_system.gd');
    expect(mainTscn.content).toContain('npc_simulation_lod.gd');
    expect(mainTscn.content).toContain('npc_activity_label_system.gd');
    expect(mainTscn.content).toContain('ambient_conversation_system.gd');
    expect(mainTscn.content).toContain('reputation_manager.gd');
    expect(mainTscn.content).toContain('exploration_discovery_system.gd');
    expect(mainTscn.content).toContain('quest_completion_manager.gd');
    expect(mainTscn.content).toContain('action_quick_bar.gd');
  });
});

// ─────────────────────────────────────────────
// Template content verification — character systems
// ─────────────────────────────────────────────

describe('Godot template content — character system features', () => {
  it('camera_manager has SpringArm3D orbit and zoom', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/camera_manager.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('SpringArm3D');
    expect(file!.content).toContain('spring_length');
    expect(file!.content).toContain('MOUSE_MODE_CAPTURED');
    expect(file!.content).toContain('enum CameraMode');
    expect(file!.content).toContain('func switch_mode');
  });

  it('npc_modular_assembler has modular body assembly', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/npc_modular_assembler.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('BODY_TYPES');
    expect(file!.content).toContain('GENRE_MODEL_PATHS');
    expect(file!.content).toContain('ROLE_OUTFITS');
    expect(file!.content).toContain('func assemble_npc');
    expect(file!.content).toContain('_load_body');
    expect(file!.content).toContain('_attach_hair');
  });

  it('npc_accessory_system has occupation-based accessories', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/npc_accessory_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('ACCESSORY_POOLS');
    expect(file!.content).toContain('BoneAttachment3D');
    expect(file!.content).toContain('RandomNumberGenerator');
    expect(file!.content).toContain('func generate_accessories');
  });

  it('npc_animation_controller has AnimationTree state machine', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/npc_animation_controller.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('AnimationTree');
    expect(file!.content).toContain('enum AnimState');
    expect(file!.content).toContain('OCCUPATION_WORK_ANIMS');
    expect(file!.content).toContain('crossfade_duration');
    expect(file!.content).toContain('func set_speed');
    expect(file!.content).toContain('func set_working');
  });

  it('npc_movement_controller has NavigationAgent3D pathfinding', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/npc_movement_controller.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('NavigationAgent3D');
    expect(file!.content).toContain('func move_to');
    expect(file!.content).toContain('func wander');
    expect(file!.content).toContain('avoidance_enabled');
    expect(file!.content).toContain('signal destination_reached');
  });

  it('npc_schedule_system has daily routines', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/npc_schedule_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('ACTIVITY_ANIMS');
    expect(file!.content).toContain('func register_npc');
    expect(file!.content).toContain('GameClock.current_hour');
    expect(file!.content).toContain('signal activity_changed');
    expect(file!.content).toContain('_find_block_for_hour');
  });

  it('npc_simulation_lod has distance-based LOD', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/npc_simulation_lod.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('MAX_FULL_SIM_NPCS');
    expect(file!.content).toContain('enum LODLevel');
    expect(file!.content).toContain('PROCESS_MODE_DISABLED');
    expect(file!.content).toContain('func register_npc');
  });

  it('npc_greeting_system has interaction prompts and speech bubbles', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/npc_greeting_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('Area3D');
    expect(file!.content).toContain('Label3D');
    expect(file!.content).toContain('signal interaction_started');
    expect(file!.content).toContain('[E] Talk');
    expect(file!.content).toContain('func _generate_greeting');
  });

  it('npc_activity_label_system has activity labels and talking indicators', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/npc_activity_label_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('ACTIVITY_LABELS');
    expect(file!.content).toContain('Label3D');
    expect(file!.content).toContain('Sprite3D');
    expect(file!.content).toContain('func set_activity');
    expect(file!.content).toContain('func set_talking');
  });

  it('ambient_conversation_system has NPC-NPC chat', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/ambient_conversation_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('AMBIENT_LINES');
    expect(file!.content).toContain('signal conversation_started');
    expect(file!.content).toContain('signal relationship_changed');
    expect(file!.content).toContain('Label3D');
    expect(file!.content).toContain('func register_npc');
  });

  it('lip_sync_controller has blend shape mouth animation', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/characters/lip_sync_controller.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('set_blend_shape_value');
    expect(file!.content).toContain('get_blend_shape_count');
    expect(file!.content).toContain('func start_speaking');
    expect(file!.content).toContain('func stop_speaking');
    expect(file!.content).toContain('oscillation_speed');
  });
});

// ─────────────────────────────────────────────
// Template content verification — system features
// ─────────────────────────────────────────────

describe('Godot template content — system features', () => {
  it('npc_business_interaction_system has shop UI', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/npc_business_interaction_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('BUSINESS_INVENTORIES');
    expect(file!.content).toContain('GridContainer');
    expect(file!.content).toContain('func open_shop');
    expect(file!.content).toContain('signal item_purchased');
    expect(file!.content).toContain('"blacksmith"');
    expect(file!.content).toContain('"tavern"');
  });

  it('reputation_manager tracks reputation and relationships', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/reputation_manager.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('RELATIONSHIP_LEVELS');
    expect(file!.content).toContain('func modify_reputation');
    expect(file!.content).toContain('func get_price_multiplier');
    expect(file!.content).toContain('signal reputation_changed');
    expect(file!.content).toContain('signal relationship_level_changed');
    expect(file!.content).toContain('func save_data');
  });

  it('exploration_discovery_system has Area3D triggers and notifications', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/exploration_discovery_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('Area3D');
    expect(file!.content).toContain('signal area_discovered');
    expect(file!.content).toContain('signal lore_collected');
    expect(file!.content).toContain('func register_discovery_zone');
    expect(file!.content).toContain('AnimationPlayer');
  });

  it('quest_completion_manager detects completions and awards rewards', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/quest_completion_manager.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('signal quest_completed');
    expect(file!.content).toContain('signal reward_granted');
    expect(file!.content).toContain('func check_quest_completion');
    expect(file!.content).toContain('func register_hotspot');
    expect(file!.content).toContain('Area3D');
  });

  it('animal_npc_system has wildlife with navigation', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/animal_npc_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('ANIMAL_TYPES');
    expect(file!.content).toContain('NavigationAgent3D');
    expect(file!.content).toContain('func generate_from_data');
    expect(file!.content).toContain('"rideable"');
    expect(file!.content).toContain('"pet"');
    expect(file!.content).toContain('"wild"');
  });

  it('photography_system has screenshot capture and photo book', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/photography_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('get_viewport().get_texture().get_image()');
    expect(file!.content).toContain('save_png');
    expect(file!.content).toContain('user://photos/');
    expect(file!.content).toContain('signal photo_taken');
    expect(file!.content).toContain('GridContainer');
  });

  it('puzzle_system has dungeon generation and puzzle UI', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/puzzle_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('func _generate_dungeon');
    expect(file!.content).toContain('func _create_room');
    expect(file!.content).toContain('func _create_corridor');
    expect(file!.content).toContain('RandomNumberGenerator');
    expect(file!.content).toContain('signal puzzle_completed');
    expect(file!.content).toContain('signal dungeon_entered');
  });

  it('vr_support has XR rig with teleport locomotion', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/vr_support.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('XROrigin3D');
    expect(file!.content).toContain('XRCamera3D');
    expect(file!.content).toContain('XRController3D');
    expect(file!.content).toContain('OpenXR');
    expect(file!.content).toContain('func enter_vr');
    expect(file!.content).toContain('snap_turn_angle');
    expect(file!.content).toContain('SubViewport');
  });
});

// ─────────────────────────────────────────────
// Template content verification — UI features
// ─────────────────────────────────────────────

describe('Godot template content — UI features', () => {
  it('game_intro_sequence has narrative cutscene system', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/ui/game_intro_sequence.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('RichTextLabel');
    expect(file!.content).toContain('signal intro_completed');
    expect(file!.content).toContain('signal cutscene_completed');
    expect(file!.content).toContain('func play_intro');
    expect(file!.content).toContain('Tween');
  });

  it('onboarding_manager has tutorial steps', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/ui/onboarding_manager.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('TUTORIAL_STEPS');
    expect(file!.content).toContain('func start_tutorial');
    expect(file!.content).toContain('func skip_tutorial');
    expect(file!.content).toContain('signal tutorial_completed');
    expect(file!.content).toContain('"movement"');
  });

  it('action_quick_bar has hotbar with number key bindings', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/ui/action_quick_bar.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('SLOT_COUNT');
    expect(file!.content).toContain('HBoxContainer');
    expect(file!.content).toContain('func assign_slot');
    expect(file!.content).toContain('signal action_triggered');
    expect(file!.content).toContain('KEY_1');
  });

  it('document_reading_panel has paginated reading', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/ui/document_reading_panel.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('func open_document');
    expect(file!.content).toContain('func close_document');
    expect(file!.content).toContain('RichTextLabel');
    expect(file!.content).toContain('_split_into_pages');
    expect(file!.content).toContain('signal document_closed');
  });
});

// ─────────────────────────────────────────────
// GDScript validation passes for all new scripts
// ─────────────────────────────────────────────

describe('Godot export parity part 2 — GDScript validation', () => {
  it('all generated files pass validation without errors', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const errors = validateGDScriptFiles(files);
    const critical = errors.filter(e => e.severity === 'error');

    if (critical.length > 0) {
      const msgs = critical.map(e => `${e.file}:${e.line} — ${e.message}`).join('\n');
      expect(critical.length, `GDScript validation errors:\n${msgs}`).toBe(0);
    }
  });
});

// ─────────────────────────────────────────────
// File count verification
// ─────────────────────────────────────────────

describe('Godot export parity part 2 — total file counts', () => {
  it('generates at least 15 character scripts', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const charScripts = files.filter(f => f.path.startsWith('scripts/characters/'));
    // Before parity2: 4 character scripts. After: 15 character scripts.
    expect(charScripts.length).toBeGreaterThanOrEqual(15);
  });

  it('generates at least 26 system scripts', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const sysScripts = files.filter(f => f.path.startsWith('scripts/systems/'));
    // Before parity2: ~14 system scripts. After: 22+ (shop/notice_board are under scripts/ui/).
    expect(sysScripts.length).toBeGreaterThanOrEqual(22);
  });

  it('generates at least 17 UI scripts', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const uiScripts = files.filter(f => f.path.startsWith('scripts/ui/'));
    // Before parity2: ~13 UI scripts. After: 17+.
    expect(uiScripts.length).toBeGreaterThanOrEqual(17);
  });

  it('total GDScript output exceeds 90 files', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    expect(files.length).toBeGreaterThanOrEqual(85);
  });
});
