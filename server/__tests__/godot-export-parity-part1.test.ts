/**
 * Tests for Godot export parity part 1 — verifies all new GDScript templates
 * are included in the export pipeline, properly wired into the scene, and
 * pass GDScript validation.
 */

import { describe, it, expect } from 'vitest';
import { generateSceneFiles } from '../services/game-export/godot/godot-scene-generator';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import { generateDataFiles } from '../services/game-export/godot/godot-data-generator';
import { generateProjectFiles } from '../services/game-export/godot/godot-project-generator';
import { validateGDScriptFiles } from '../services/game-export/godot/gdscript-validator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  return {
    meta: {
      worldId: 'w1',
      worldName: 'Parity Test World',
      worldType: 'medieval-fantasy',
      seed: 'parity-seed',
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
      questObjects: [{
        id: 'qobj1',
        questId: 'q1',
        objectType: 'interact',
        position: { x: 110, y: 0, z: 110 },
        modelAssetKey: '',
        interactionType: 'collect',
        description: 'A glowing orb',
      }],
      containers: [{
        id: 'cont1',
        type: 'chest',
        position: { x: 108, y: 0, z: 96 },
        settlementId: 'set1',
        buildingId: 'bld1',
        lootTableId: '',
        items: [],
        context: 'tavern',
      }],
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
// New GDScript templates included in output
// ─────────────────────────────────────────────

describe('Godot export parity part 1 — new world scripts', () => {
  const newWorldScripts = [
    'scripts/world/terrain_foundation_renderer.gd',
    'scripts/world/settlement_scene_manager.gd',
    'scripts/world/chunk_manager.gd',
    'scripts/world/town_square_generator.gd',
    'scripts/world/building_placement_system.gd',
    'scripts/world/building_sign_manager.gd',
    'scripts/world/building_collision_system.gd',
    'scripts/world/interior_scene_manager.gd',
    'scripts/world/building_interior_generator.gd',
    'scripts/world/interior_lighting_system.gd',
    'scripts/world/interior_decoration_generator.gd',
    'scripts/world/outdoor_furniture_generator.gd',
    'scripts/world/container_spawn_system.gd',
    'scripts/world/exterior_item_manager.gd',
    'scripts/world/procedural_building_generator.gd',
  ];

  it('includes all new world scripts in GDScript output', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const paths = files.map(f => f.path);

    for (const script of newWorldScripts) {
      expect(paths, `Missing script: ${script}`).toContain(script);
    }
  });

  it('includes audio_manifest.gd in system scripts', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const audioManifest = files.find(f => f.path === 'scripts/systems/audio_manifest.gd');
    expect(audioManifest).toBeDefined();
  });

  it('all new scripts have valid GDScript (no unreplaced tokens)', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const newFiles = files.filter(f => newWorldScripts.includes(f.path));

    for (const file of newFiles) {
      const tokens = file.content.match(/\{\{[A-Z_]+\}\}/g);
      expect(tokens, `Unreplaced tokens in ${file.path}: ${tokens?.join(', ')}`).toBeNull();
    }
  });

  it('all new scripts extend correct base classes', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);

    for (const script of newWorldScripts) {
      const file = files.find(f => f.path === script);
      expect(file, `Missing: ${script}`).toBeDefined();
      expect(file!.content).toMatch(/^extends (Node3D|Node)\b/m);
    }
  });

  it('new world scripts have generate_from_data or are utility scripts', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);

    const generatorScripts = newWorldScripts.filter(
      s => !s.includes('interior_lighting') && !s.includes('interior_decoration')
        && !s.includes('building_interior_generator') && !s.includes('procedural_building_generator')
    );

    for (const script of generatorScripts) {
      const file = files.find(f => f.path === script);
      expect(file, `Missing: ${script}`).toBeDefined();
      expect(
        file!.content.includes('generate_from_data') || file!.content.includes('func _ready'),
        `${script} should have generate_from_data or _ready`,
      ).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────
// Scene generator includes new nodes
// ─────────────────────────────────────────────

describe('Godot scene generator — new parity nodes', () => {
  const newSceneNodes = [
    'TerrainFoundationRenderer',
    'SettlementSceneManager',
    'ChunkManager',
    'TownSquareGenerator',
    'BuildingPlacementSystem',
    'BuildingSignManager',
    'BuildingCollisionSystem',
    'InteriorSceneManager',
    'OutdoorFurnitureGenerator',
    'ContainerSpawnSystem',
    'ExteriorItemManager',
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

  it('new scene nodes reference correct ExtResource IDs', () => {
    const ir = makeMinimalIR();
    const sceneFiles = generateSceneFiles(ir);
    const mainTscn = sceneFiles.find(f => f.path === 'scenes/main.tscn')!;

    // Verify that ext_resource declarations exist for new scripts
    expect(mainTscn.content).toContain('terrain_foundation_renderer.gd');
    expect(mainTscn.content).toContain('settlement_scene_manager.gd');
    expect(mainTscn.content).toContain('chunk_manager.gd');
    expect(mainTscn.content).toContain('town_square_generator.gd');
    expect(mainTscn.content).toContain('building_placement_system.gd');
    expect(mainTscn.content).toContain('building_sign_manager.gd');
    expect(mainTscn.content).toContain('building_collision_system.gd');
    expect(mainTscn.content).toContain('interior_scene_manager.gd');
    expect(mainTscn.content).toContain('outdoor_furniture_generator.gd');
    expect(mainTscn.content).toContain('container_spawn_system.gd');
    expect(mainTscn.content).toContain('exterior_item_manager.gd');
  });
});

// ─────────────────────────────────────────────
// Data generator includes new data files
// ─────────────────────────────────────────────

describe('Godot data generator — new data files', () => {
  it('generates containers.json data file', () => {
    const ir = makeMinimalIR();
    const dataFiles = generateDataFiles(ir);
    const containers = dataFiles.find(f => f.path === 'data/containers.json');
    expect(containers).toBeDefined();
    const parsed = JSON.parse(containers!.content);
    expect(parsed).toBeInstanceOf(Array);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe('cont1');
    expect(parsed[0].type).toBe('chest');
  });

  it('generates quest_objects.json data file', () => {
    const ir = makeMinimalIR();
    const dataFiles = generateDataFiles(ir);
    const qobjs = dataFiles.find(f => f.path === 'data/quest_objects.json');
    expect(qobjs).toBeDefined();
    const parsed = JSON.parse(qobjs!.content);
    expect(parsed).toBeInstanceOf(Array);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe('qobj1');
    expect(parsed[0].questId).toBe('q1');
  });

  it('generates audio_manifest.json data file', () => {
    const ir = makeMinimalIR();
    const dataFiles = generateDataFiles(ir);
    const audioManifest = dataFiles.find(f => f.path === 'data/audio_manifest.json');
    expect(audioManifest).toBeDefined();
    const parsed = JSON.parse(audioManifest!.content);
    expect(parsed).toHaveProperty('medieval-fantasy');
    expect(parsed).toHaveProperty('generic');
    expect(parsed['medieval-fantasy']).toHaveProperty('ambient');
    expect(parsed['generic']).toHaveProperty('footstep');
  });
});

// ─────────────────────────────────────────────
// Project generator includes AudioManifest autoload
// ─────────────────────────────────────────────

describe('Godot project generator — AudioManifest autoload', () => {
  it('injects AudioManifest autoload into project.godot', () => {
    const ir = makeMinimalIR();
    const projectFiles = generateProjectFiles(ir);
    const projectGodot = projectFiles.find(f => f.path === 'project.godot');
    expect(projectGodot).toBeDefined();
    expect(projectGodot!.content).toContain('AudioManifest=');
    expect(projectGodot!.content).toContain('audio_manifest.gd');
  });
});

// ─────────────────────────────────────────────
// GDScript validation passes for all new scripts
// ─────────────────────────────────────────────

describe('Godot export parity — GDScript validation', () => {
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
// Template content verification
// ─────────────────────────────────────────────

describe('Godot template content — specific features', () => {
  it('terrain_foundation_renderer has compute_foundation_data', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/terrain_foundation_renderer.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('func compute_foundation_data');
    expect(file!.content).toContain('"flat"');
    expect(file!.content).toContain('"raised"');
    expect(file!.content).toContain('"stilted"');
    expect(file!.content).toContain('"terraced"');
  });

  it('settlement_scene_manager has zone management', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/settlement_scene_manager.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('MAX_SETTLEMENTS_3D');
    expect(file!.content).toContain('func register_zone');
    expect(file!.content).toContain('func _check_player_zone');
    expect(file!.content).toContain('VISIBILITY_DISTANCE');
  });

  it('chunk_manager has spatial partitioning', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/chunk_manager.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('chunk_size');
    expect(file!.content).toContain('render_radius');
    expect(file!.content).toContain('func register_mesh');
    expect(file!.content).toContain('func _world_to_chunk');
  });

  it('town_square_generator creates settlement centers', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/town_square_generator.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('SQUARE_SIZE');
    expect(file!.content).toContain('_add_central_feature');
    expect(file!.content).toContain('_add_bench');
    expect(file!.content).toContain('_add_lamp_post');
    expect(file!.content).toContain('_add_notice_board');
  });

  it('building_placement_system has street alignment', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/building_placement_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('LOT_SPACING');
    expect(file!.content).toContain('ZONE_SCALE');
    expect(file!.content).toContain('_calculate_street_facing');
    expect(file!.content).toContain('_check_collision');
  });

  it('building_sign_manager creates business signs', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/building_sign_manager.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('Label3D');
    expect(file!.content).toContain('_create_sign');
    expect(file!.content).toContain('_get_sign_color');
  });

  it('building_collision_system has entry triggers', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/building_collision_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('WALL_THICKNESS');
    expect(file!.content).toContain('DOOR_WIDTH');
    expect(file!.content).toContain('Area3D');
    expect(file!.content).toContain('signal building_entered');
    expect(file!.content).toContain('signal building_exited');
  });

  it('interior_scene_manager has model loading and transitions', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/interior_scene_manager.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('INTERIOR_MODEL_MAP');
    expect(file!.content).toContain('func switch_to_interior');
    expect(file!.content).toContain('func switch_to_exterior');
    expect(file!.content).toContain('_fade_in');
    expect(file!.content).toContain('british_pub.glb');
  });

  it('building_interior_generator has room layouts', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/building_interior_generator.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('ROOM_FURNITURE');
    expect(file!.content).toContain('SURFACE_COLORS');
    expect(file!.content).toContain('func generate_interior');
    expect(file!.content).toContain('_compute_room_layout');
    expect(file!.content).toContain('_add_staircase');
  });

  it('interior_lighting_system has presets', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/interior_lighting_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('LIGHTING_PRESETS');
    expect(file!.content).toContain('"candlelit"');
    expect(file!.content).toContain('func create_lighting');
    expect(file!.content).toContain('func update_time_of_day');
  });

  it('interior_decoration_generator has decoration pools', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/interior_decoration_generator.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('DECORATION_POOLS');
    expect(file!.content).toContain('func decorate_room');
    expect(file!.content).toContain('func load_furniture_model');
  });

  it('outdoor_furniture_generator has world-type sets with MultiMesh', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/outdoor_furniture_generator.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('FURNITURE_SETS');
    expect(file!.content).toContain('MultiMeshInstance3D');
    expect(file!.content).toContain('medieval-fantasy');
    expect(file!.content).toContain('cyberpunk');
  });

  it('container_spawn_system has loot and quest objects', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/container_spawn_system.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('CONTAINER_TYPES');
    expect(file!.content).toContain('BUSINESS_LOOT');
    expect(file!.content).toContain('signal container_opened');
    expect(file!.content).toContain('signal quest_object_interacted');
  });

  it('exterior_item_manager has item and book spawning', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/world/exterior_item_manager.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('ITEM_TYPE_COLORS');
    expect(file!.content).toContain('signal item_collected');
    expect(file!.content).toContain('signal book_read');
    expect(file!.content).toContain('func _spawn_book');
    expect(file!.content).toContain('Label3D');
  });

  it('audio_manifest has lookup functions', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const file = files.find(f => f.path === 'scripts/systems/audio_manifest.gd');
    expect(file).toBeDefined();
    expect(file!.content).toContain('func get_audio');
    expect(file!.content).toContain('func get_ambient');
    expect(file!.content).toContain('func get_footsteps');
    expect(file!.content).toContain('func load_audio_stream');
  });
});

// ─────────────────────────────────────────────
// File count verification
// ─────────────────────────────────────────────

describe('Godot export parity — total file counts', () => {
  it('generates at least 15 more world scripts than before', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const worldScripts = files.filter(f => f.path.startsWith('scripts/world/'));
    // Before parity: 11 world scripts. After: 26 world scripts.
    expect(worldScripts.length).toBeGreaterThanOrEqual(26);
  });

  it('generates at least 22 data files', () => {
    const ir = makeMinimalIR();
    const dataFiles = generateDataFiles(ir);
    // world_ir + meta + 19 tables + containers + quest_objects + audio_manifest + ...
    expect(dataFiles.length).toBeGreaterThanOrEqual(22);
  });
});
