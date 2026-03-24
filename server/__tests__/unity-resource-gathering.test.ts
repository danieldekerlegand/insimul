/**
 * Tests for Unity resource gathering system export.
 *
 * Verifies:
 * - Data generator exports gathering_nodes.json
 * - GatheringNodeData class added to InsimulWorldIR.cs
 * - ResourceSystem.cs template includes gathering, depletion, respawn logic
 */

import { describe, it, expect } from 'vitest';
import { generateDataFiles } from '../services/game-export/unity/unity-data-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';
import * as fs from 'fs';
import * as path from 'path';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture with resource data
// ─────────────────────────────────────────────

function makeIRWithResources(): WorldIR {
  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'test-seed',
      terrainSize: 512,
      genreConfig: {
        genre: 'rpg',
        features: { crafting: false, resources: true, survival: false },
      },
    },
    geography: {
      terrainSize: 512,
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
      resources: {
        definitions: [
          { id: 'wood', name: 'Wood', icon: '🪵', color: { r: 0.55, g: 0.35, b: 0.15 }, maxStack: 999, gatherTime: 1500, respawnTime: 60000 },
          { id: 'stone', name: 'Stone', icon: '🪨', color: { r: 0.5, g: 0.5, b: 0.5 }, maxStack: 999, gatherTime: 2000, respawnTime: 90000 },
        ],
        gatheringNodes: [
          { id: 'rnode_town_0', resourceType: 'wood', position: { x: 10, y: 0, z: 20 }, maxAmount: 5, respawnTime: 60000, scale: 1.0 },
          { id: 'rnode_town_1', resourceType: 'stone', position: { x: 30, y: 0, z: 40 }, maxAmount: 3, respawnTime: 90000, scale: 1.2 },
          { id: 'rnode_town_2', resourceType: 'wood', position: { x: -15, y: 0, z: 25 }, maxAmount: 7, respawnTime: 60000, scale: 0.9 },
        ],
      },
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.5, g: 0.4, b: 0.3 },
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
    assets: { animations: [], models: [], textures: [], sounds: [] },
    player: {
      speed: 5, jumpHeight: 1.2, gravity: 1,
      initialHealth: 100, initialEnergy: 100, initialGold: 50,
      startPosition: { x: 0, y: 0, z: 0 },
    },
    ui: { minimap: true, healthBar: true, staminaBar: false, ammoCounter: false, compass: true },
    combat: {
      style: 'melee',
      settings: {
        baseDamage: 10, criticalChance: 0.15, criticalMultiplier: 1.5,
        blockReduction: 0.25, dodgeChance: 0.1, attackCooldown: 1000, combatRange: 2,
      },
    },
    survival: null,
    resources: null,
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// Data generator tests
// ─────────────────────────────────────────────

describe('Unity data generator - gathering nodes', () => {
  const ir = makeIRWithResources();
  const files = generateDataFiles(ir);

  it('generates gathering_nodes.json data file', () => {
    const file = files.find(f => f.path.endsWith('gathering_nodes.json'));
    expect(file).toBeDefined();
  });

  it('exports all nodes with correct structure', () => {
    const file = files.find(f => f.path.endsWith('gathering_nodes.json'))!;
    const data = JSON.parse(file.content);
    expect(data).toHaveLength(3);

    const node = data[0];
    expect(node).toHaveProperty('id', 'rnode_town_0');
    expect(node).toHaveProperty('resourceType', 'wood');
    expect(node).toHaveProperty('position');
    expect(node.position).toEqual({ x: 10, y: 0, z: 20 });
    expect(node).toHaveProperty('maxAmount', 5);
    expect(node).toHaveProperty('respawnTime', 60000);
    expect(node).toHaveProperty('scale', 1.0);
  });

  it('exports empty array when no gathering nodes', () => {
    const emptyIR = makeIRWithResources();
    (emptyIR as any).systems.resources.gatheringNodes = [];
    const emptyFiles = generateDataFiles(emptyIR);
    const file = emptyFiles.find(f => f.path.endsWith('gathering_nodes.json'))!;
    const data = JSON.parse(file.content);
    expect(data).toEqual([]);
  });

  it('exports empty array when resources is null', () => {
    const nullIR = makeIRWithResources();
    (nullIR as any).systems.resources = null;
    const nullFiles = generateDataFiles(nullIR);
    const file = nullFiles.find(f => f.path.endsWith('gathering_nodes.json'))!;
    const data = JSON.parse(file.content);
    expect(data).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// C# template content tests
// ─────────────────────────────────────────────

const templatesDir = path.resolve(__dirname, '../services/game-export/unity/templates/scripts');

describe('Unity C# ResourceSystem template', () => {
  const resourceSystemPath = path.join(templatesDir, 'systems/ResourceSystem.cs');
  const content = fs.readFileSync(resourceSystemPath, 'utf-8');

  it('loads gathering nodes from world data', () => {
    expect(content).toContain('worldData?.resources?.nodes');
    expect(content).toContain('SpawnNode');
  });

  it('creates visual primitives per resource type', () => {
    expect(content).toContain('case "wood"');
    expect(content).toContain('PrimitiveType.Cylinder');
    expect(content).toContain('case "stone"');
    expect(content).toContain('PrimitiveType.Cube');
    expect(content).toContain('case "iron"');
    expect(content).toContain('PrimitiveType.Sphere');
    expect(content).toContain('case "crystal"');
    expect(content).toContain('case "food"');
    expect(content).toContain('CreateBushShape');
  });

  it('implements interaction radius and gather key', () => {
    expect(content).toContain('interactionRadius');
    expect(content).toContain('KeyCode.E');
    expect(content).toContain('Vector3.Distance');
  });

  it('implements progress bar for gathering', () => {
    expect(content).toContain('CreateProgressBar');
    expect(content).toContain('RenderMode.WorldSpace');
    expect(content).toContain('UpdateProgressBar');
    expect(content).toContain('_gatherProgress');
  });

  it('adds gathered resources to inventory', () => {
    expect(content).toContain('InventorySystem');
    expect(content).toContain('AddItem');
    expect(content).toContain('InsimulItemType.Material');
  });

  it('depletes nodes after max yield', () => {
    expect(content).toContain('DepleteNode');
    expect(content).toContain('currentAmount');
    expect(content).toContain('depleted');
    // Gray material on depletion
    expect(content).toContain('0.4f, 0.4f, 0.4f');
    // Reduced scale
    expect(content).toContain('node.scale * 0.5f');
  });

  it('respawns nodes after delay', () => {
    expect(content).toContain('RespawnAfterDelay');
    expect(content).toContain('WaitForSeconds');
    expect(content).toContain('node.maxAmount');
    expect(content).toContain('originalMaterial');
  });

  it('checks tool requirements before gathering', () => {
    expect(content).toContain('CheckToolRequirement');
    expect(content).toContain('HasItem');
    expect(content).toContain('"pickaxe"');
    expect(content).toContain('"axe"');
  });
});

describe('Unity C# InsimulWorldIR data classes', () => {
  const dataPath = path.join(templatesDir, 'data/InsimulWorldIR.cs');
  const content = fs.readFileSync(dataPath, 'utf-8');

  it('includes GatheringNodeData class', () => {
    expect(content).toContain('class GatheringNodeData');
    expect(content).toContain('public string resourceType');
    expect(content).toContain('public Vec3Data position');
    expect(content).toContain('public int maxAmount');
    expect(content).toContain('public float respawnTime');
    expect(content).toContain('public float scale');
  });

  it('adds nodes field to ResourcesData', () => {
    expect(content).toContain('public GatheringNodeData[] nodes');
  });
});
