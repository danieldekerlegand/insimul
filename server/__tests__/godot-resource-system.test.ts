/**
 * Tests for Godot resource system export pipeline.
 *
 * Verifies that:
 * 1. The resource_system.gd template is included when resources feature is enabled
 * 2. The data generator produces resources.json with definitions and gatheringNodes
 * 3. The GDScript template contains all required features (signals, gathering, depletion, respawn, tools)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { generateDataFiles } from '../services/game-export/godot/godot-data-generator';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import type { WorldIR, ResourcesIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Test resource data
// ─────────────────────────────────────────────

const TEST_RESOURCES: ResourcesIR = {
  definitions: [
    { id: 'wood', name: 'Wood', icon: '🪵', color: { r: 0.55, g: 0.35, b: 0.15 }, maxStack: 999, gatherTime: 1500, respawnTime: 60000 },
    { id: 'stone', name: 'Stone', icon: '🪨', color: { r: 0.5, g: 0.5, b: 0.5 }, maxStack: 999, gatherTime: 2000, respawnTime: 90000 },
    { id: 'iron', name: 'Iron', icon: '⛏️', color: { r: 0.6, g: 0.6, b: 0.65 }, maxStack: 500, gatherTime: 3000, respawnTime: 120000 },
  ],
  gatheringNodes: [
    { id: 'rnode_s1_0', resourceType: 'wood', position: { x: 10, y: 0, z: 20 }, maxAmount: 5, respawnTime: 60000, scale: 1.0 },
    { id: 'rnode_s1_1', resourceType: 'stone', position: { x: 30, y: 0, z: 40 }, maxAmount: 3, respawnTime: 90000, scale: 1.2 },
    { id: 'rnode_s1_2', resourceType: 'iron', position: { x: 50, y: 1, z: 60 }, maxAmount: 2, respawnTime: 120000, scale: 0.9 },
  ],
};

// ─────────────────────────────────────────────
// Minimal IR factory
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
        features: { crafting: false, resources: true, magic: false },
        worldDefaults: {},
      },
    },
    geography: {
      terrainSize: 200,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
      foliageLayers: [],
      biomeZones: [],
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
    resources: TEST_RESOURCES,
    aiConfig: { apiMode: 'none', model: '', endpoint: '' },
    ...overrides,
  } as WorldIR;
}

// ─────────────────────────────────────────────
// Data generator tests
// ─────────────────────────────────────────────

describe('Godot data generator - resources', () => {
  it('generates resources.json when resources are present', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const resourceFile = files.find(f => f.path === 'data/resources.json');
    expect(resourceFile).toBeDefined();

    const resources = JSON.parse(resourceFile!.content);
    expect(resources.definitions).toBeDefined();
    expect(resources.gatheringNodes).toBeDefined();
  });

  it('includes all resource definitions', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const resourceFile = files.find(f => f.path === 'data/resources.json');
    const resources = JSON.parse(resourceFile!.content);

    expect(resources.definitions).toHaveLength(3);
    const wood = resources.definitions.find((d: any) => d.id === 'wood');
    expect(wood.name).toBe('Wood');
    expect(wood.gatherTime).toBe(1500);
    expect(wood.respawnTime).toBe(60000);
    expect(wood.color).toEqual({ r: 0.55, g: 0.35, b: 0.15 });
  });

  it('includes all gathering nodes with positions', () => {
    const ir = makeMinimalIR();
    const files = generateDataFiles(ir);
    const resourceFile = files.find(f => f.path === 'data/resources.json');
    const resources = JSON.parse(resourceFile!.content);

    expect(resources.gatheringNodes).toHaveLength(3);
    const node = resources.gatheringNodes.find((n: any) => n.id === 'rnode_s1_0');
    expect(node.resourceType).toBe('wood');
    expect(node.position).toEqual({ x: 10, y: 0, z: 20 });
    expect(node.maxAmount).toBe(5);
    expect(node.scale).toBe(1.0);
  });

  it('does not generate resources.json when resources is null', () => {
    const ir = makeMinimalIR({ resources: null as any });
    const files = generateDataFiles(ir);
    const resourceFile = files.find(f => f.path === 'data/resources.json');
    expect(resourceFile).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// GDScript generator tests
// ─────────────────────────────────────────────

describe('Godot GDScript generator - resource_system.gd', () => {
  it('includes resource_system.gd when resources feature is enabled', () => {
    const ir = makeMinimalIR();
    const files = generateGDScriptFiles(ir);
    const resourceScript = files.find(f => f.path === 'scripts/systems/resource_system.gd');
    expect(resourceScript).toBeDefined();
    expect(resourceScript!.content.length).toBeGreaterThan(0);
  });

  it('excludes resource_system.gd when resources feature is disabled', () => {
    const ir = makeMinimalIR();
    ir.meta.genreConfig.features.resources = false;
    const files = generateGDScriptFiles(ir);
    const resourceScript = files.find(f => f.path === 'scripts/systems/resource_system.gd');
    expect(resourceScript).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// Template content tests
// ─────────────────────────────────────────────

describe('resource_system.gd template content', () => {
  const templatePath = join(__dirname, '../services/game-export/godot/templates/scripts/systems/resource_system.gd');
  const content = readFileSync(templatePath, 'utf-8');

  it('emits gather_complete and node_respawned signals', () => {
    expect(content).toContain('signal gather_complete');
    expect(content).toContain('signal node_respawned');
  });

  it('defines INTERACTION_RADIUS constant', () => {
    expect(content).toContain('INTERACTION_RADIUS');
    expect(content).toContain('2.0');
  });

  it('defines tool requirements for resource types', () => {
    expect(content).toContain('TOOL_REQUIREMENTS');
    expect(content).toContain('"wood": "axe"');
    expect(content).toContain('"stone": "pickaxe"');
    expect(content).toContain('"iron": "pickaxe"');
    expect(content).toContain('"crystal": "pickaxe"');
    expect(content).toContain('"gold": "pickaxe"');
  });

  it('loads resource definitions and gathering nodes from world data', () => {
    expect(content).toContain('func load_from_data(world_data: Dictionary)');
    expect(content).toContain('definitions');
    expect(content).toContain('gatheringNodes');
  });

  it('creates visual meshes for different resource types', () => {
    expect(content).toContain('func _create_node_visual');
    // Wood = tree stump (cylinder)
    expect(content).toContain('"wood"');
    expect(content).toContain('CylinderMesh');
    // Stone = rock pile (box)
    expect(content).toContain('"stone"');
    expect(content).toContain('BoxMesh');
    // Iron/crystal = ore vein (sphere)
    expect(content).toContain('"iron", "crystal"');
    expect(content).toContain('SphereMesh');
    // Fiber/food = bush
    expect(content).toContain('"fiber", "food"');
    // Water = pool
    expect(content).toContain('"water"');
  });

  it('implements gather mechanic with progress', () => {
    expect(content).toContain('_is_gathering');
    expect(content).toContain('_gather_progress');
    expect(content).toContain('func _try_start_gathering');
    expect(content).toContain('func _update_gathering');
    expect(content).toContain('func _complete_gathering');
    expect(content).toContain('func cancel_gathering');
  });

  it('checks tool requirements before gathering', () => {
    expect(content).toContain('func _check_tool_requirement');
    expect(content).toContain('InventorySystem.has_item');
  });

  it('implements depletion with visual feedback', () => {
    expect(content).toContain('func _deplete_node');
    expect(content).toContain('"depleted"');
    // Gray/transparent when depleted
    expect(content).toContain('Color(0.4, 0.4, 0.4, 0.5)');
    expect(content).toContain('TRANSPARENCY_ALPHA');
    // Shrink to half scale
    expect(content).toContain('* 0.5');
  });

  it('implements respawn timer', () => {
    expect(content).toContain('func _tick_respawns');
    expect(content).toContain('func _respawn_node');
    expect(content).toContain('respawn_timer');
    expect(content).toContain('node_respawned.emit');
  });

  it('adds gathered resources to inventory', () => {
    expect(content).toContain('InventorySystem.add_item');
    expect(content).toContain('"material"');
  });

  it('exposes public API methods', () => {
    expect(content).toContain('func is_gathering()');
    expect(content).toContain('func get_gather_progress()');
    expect(content).toContain('func get_active_node_id()');
    expect(content).toContain('func get_node_state(');
    expect(content).toContain('func get_resource_count(');
    expect(content).toContain('func has_enough(');
    expect(content).toContain('func dispose()');
  });

  it('finds player via group lookup', () => {
    expect(content).toContain('get_nodes_in_group("player")');
  });

  it('uses interact action for gather input', () => {
    expect(content).toContain('is_action_just_pressed("interact")');
  });
});
