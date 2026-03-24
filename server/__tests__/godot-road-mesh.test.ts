/**
 * Tests for Godot road mesh generation
 *
 * Verifies:
 * - Godot road_generator.gd template contains ribbon mesh generation code
 * - Token substitution works for road parameters
 * - Template has correct structure for Godot ArrayMesh creation
 */

import { describe, it, expect } from 'vitest';
import { generateGDScriptFiles } from '../services/game-export/godot/godot-gdscript-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

function makeMinimalIR(): WorldIR {
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
        features: { crafting: false, resources: false, survival: false },
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
    assets: [],
    player: {
      speed: 5,
      jumpHeight: 1.2,
      gravity: 1,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      startPosition: { x: 50, y: 0, z: 50 },
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

function getRoadGeneratorContent(): string {
  const ir = makeMinimalIR();
  const files = generateGDScriptFiles(ir);
  const road = files.find(f => f.path.endsWith('road_generator.gd'));
  expect(road).toBeDefined();
  return road!.content;
}

describe('Godot road_generator.gd template - mesh generation', () => {
  it('generates road_generator.gd with ribbon mesh code', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('_build_ribbon_mesh');
    expect(content).toContain('ArrayMesh');
    expect(content).toContain('MeshInstance3D');
  });

  it('does not contain stub message', () => {
    const content = getRoadGeneratorContent();
    expect(content).not.toContain('stub (implement mesh roads)');
  });

  it('substitutes road color tokens', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('Color(0.3, 0.3, 0.3)');
  });

  it('substitutes road width token', () => {
    const content = getRoadGeneratorContent();
    // roadRadius=1.5, width = 1.5 * 2 = 3
    expect(content).toContain('road_width := 3');
  });

  it('contains vertex and triangle generation logic', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('PackedVector3Array');
    expect(content).toContain('PackedInt32Array');
    expect(content).toContain('ARRAY_VERTEX');
    expect(content).toContain('ARRAY_NORMAL');
    expect(content).toContain('ARRAY_TEX_UV');
    expect(content).toContain('ARRAY_INDEX');
    expect(content).toContain('PRIMITIVE_TRIANGLES');
  });

  it('computes perpendicular vertices for ribbon mesh', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('half_width');
    expect(content).toContain('right * half_width');
    expect(content).toContain('Vector3.UP');
  });

  it('processes settlement street networks', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('streetNetwork');
    expect(content).toContain('segments');
    expect(content).toContain('settlement');
  });

  it('processes inter-settlement roads', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('entities');
    expect(content).toContain('"roads"');
  });

  it('creates collision for road meshes', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('create_trimesh_collision');
  });

  it('generates intersection discs at street crossings', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('intersectionOf');
    expect(content).toContain('CylinderMesh');
    expect(content).toContain('_create_intersection_disc');
  });

  it('supports terrain-following via generate_settlement_streets', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('generate_settlement_streets');
    expect(content).toContain('sample_height');
  });

  it('handles UV tiling proportional to road length', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('cumulative_length');
    expect(content).toContain('cumulative_length / width');
  });

  it('adds road elevation to prevent z-fighting', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('road_elevation');
  });

  it('disables shadow casting on roads', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('SHADOW_CASTING_SETTING_OFF');
  });

  it('uses StandardMaterial3D for road material', () => {
    const content = getRoadGeneratorContent();
    expect(content).toContain('StandardMaterial3D');
    expect(content).toContain('albedo_color');
  });

  it('handles tangent direction at endpoints and midpoints', () => {
    const content = getRoadGeneratorContent();
    // Start point: forward from point[0] to point[1]
    expect(content).toContain('waypoints[1] - waypoints[0]');
    // End point: forward from point[n-2] to point[n-1]
    expect(content).toContain('waypoints[n - 1] - waypoints[n - 2]');
    // Midpoint: average of neighbors
    expect(content).toContain('waypoints[i + 1] - waypoints[i - 1]');
  });
});
