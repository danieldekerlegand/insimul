/**
 * Tests for Unity road mesh generation
 *
 * Verifies:
 * - Shared ribbon mesh builder produces correct geometry
 * - Unity RoadGenerator.cs template contains mesh generation code
 * - Token substitution works for road parameters
 */

import { describe, it, expect } from 'vitest';
import { buildRibbonMesh } from '@shared/game-engine/road-mesh-builder';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Ribbon mesh builder tests
// ─────────────────────────────────────────────

describe('buildRibbonMesh', () => {
  it('returns empty mesh for fewer than 2 waypoints', () => {
    const result = buildRibbonMesh([{ x: 0, y: 0, z: 0 }], 2);
    expect(result.vertices).toHaveLength(0);
    expect(result.triangles).toHaveLength(0);
  });

  it('builds a single-segment ribbon from 2 waypoints', () => {
    const waypoints = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    ];
    const result = buildRibbonMesh(waypoints, 4);

    // 2 waypoints * 2 vertices each = 4 vertices
    expect(result.vertices).toHaveLength(4);
    // 1 segment * 6 indices (2 triangles) = 6
    expect(result.triangles).toHaveLength(6);
    // 4 UVs and normals
    expect(result.uvs).toHaveLength(4);
    expect(result.normals).toHaveLength(4);
  });

  it('places vertices perpendicular to road direction', () => {
    // Road going along X axis, width=4 → vertices at z=±2
    const waypoints = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    ];
    const result = buildRibbonMesh(waypoints, 4);

    // Forward=(1,0,0), right=(0,0,-1), so left=+z, right=-z
    expect(result.vertices[0].x).toBeCloseTo(0);
    expect(result.vertices[0].z).toBeCloseTo(2);
    expect(result.vertices[1].x).toBeCloseTo(0);
    expect(result.vertices[1].z).toBeCloseTo(-2);

    // Second waypoint
    expect(result.vertices[2].x).toBeCloseTo(10);
    expect(result.vertices[2].z).toBeCloseTo(2);
    expect(result.vertices[3].x).toBeCloseTo(10);
    expect(result.vertices[3].z).toBeCloseTo(-2);
  });

  it('handles road along Z axis', () => {
    const waypoints = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 10 },
    ];
    const result = buildRibbonMesh(waypoints, 4);

    // Forward=(0,0,1), right=(1,0,0), so left=-x, right=+x
    expect(result.vertices[0].x).toBeCloseTo(-2);
    expect(result.vertices[0].z).toBeCloseTo(0);
    expect(result.vertices[1].x).toBeCloseTo(2);
    expect(result.vertices[1].z).toBeCloseTo(0);
  });

  it('builds correct triangle winding', () => {
    const waypoints = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    ];
    const result = buildRibbonMesh(waypoints, 2);

    // Two triangles: [0,2,1] and [1,2,3]
    expect(result.triangles).toEqual([0, 2, 1, 1, 2, 3]);
  });

  it('handles multi-segment roads', () => {
    const waypoints = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      { x: 20, y: 0, z: 10 },
    ];
    const result = buildRibbonMesh(waypoints, 2);

    // 3 waypoints → 6 vertices, 2 segments → 12 triangle indices
    expect(result.vertices).toHaveLength(6);
    expect(result.triangles).toHaveLength(12);
  });

  it('all normals point up', () => {
    const waypoints = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      { x: 20, y: 0, z: 10 },
    ];
    const result = buildRibbonMesh(waypoints, 2);

    for (const normal of result.normals) {
      expect(normal).toEqual({ x: 0, y: 1, z: 0 });
    }
  });

  it('UVs start at 0 and increase along road length', () => {
    const waypoints = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
    ];
    const result = buildRibbonMesh(waypoints, 2);

    // First pair: u=0,1, v=0
    expect(result.uvs[0]).toEqual({ u: 0, v: 0 });
    expect(result.uvs[1]).toEqual({ u: 1, v: 0 });

    // Second pair: v = distance/width = 10/2 = 5
    expect(result.uvs[2].u).toBe(0);
    expect(result.uvs[2].v).toBeCloseTo(5);
    expect(result.uvs[3].u).toBe(1);
    expect(result.uvs[3].v).toBeCloseTo(5);
  });

  it('preserves Y elevation in vertices', () => {
    const waypoints = [
      { x: 0, y: 5, z: 0 },
      { x: 10, y: 5, z: 0 },
    ];
    const result = buildRibbonMesh(waypoints, 2);

    for (const v of result.vertices) {
      expect(v.y).toBe(5);
    }
  });

  it('handles diagonal roads', () => {
    const waypoints = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 10 },
    ];
    const result = buildRibbonMesh(waypoints, 2);

    // Road goes at 45 degrees, so perpendicular is also at 45 degrees
    // Perpendicular direction: (fz, 0, -fx) normalized = (0.707, 0, -0.707)
    const hw = 1; // halfWidth
    const p = Math.sqrt(2) / 2; // ~0.707
    expect(result.vertices[0].x).toBeCloseTo(0 - p * hw);
    expect(result.vertices[0].z).toBeCloseTo(0 - (-p) * hw);
    expect(result.vertices[1].x).toBeCloseTo(0 + p * hw);
    expect(result.vertices[1].z).toBeCloseTo(0 + (-p) * hw);
  });
});

// ─────────────────────────────────────────────
// Unity template verification
// ─────────────────────────────────────────────

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

describe('Unity RoadGenerator.cs template - mesh generation', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('generates RoadGenerator.cs with mesh code', () => {
    const road = files.find(f => f.path.endsWith('RoadGenerator.cs'));
    expect(road).toBeDefined();
    expect(road!.content).toContain('BuildRibbonMesh');
    expect(road!.content).toContain('MeshFilter');
    expect(road!.content).toContain('MeshRenderer');
    expect(road!.content).toContain('MeshCollider');
  });

  it('does not contain LineRenderer', () => {
    const road = files.find(f => f.path.endsWith('RoadGenerator.cs'));
    expect(road).toBeDefined();
    expect(road!.content).not.toContain('LineRenderer');
  });

  it('substitutes road color tokens', () => {
    const road = files.find(f => f.path.endsWith('RoadGenerator.cs'));
    expect(road).toBeDefined();
    expect(road!.content).toContain('0.3f, 0.3f, 0.3f');
  });

  it('substitutes road width token', () => {
    const road = files.find(f => f.path.endsWith('RoadGenerator.cs'));
    expect(road).toBeDefined();
    // roadRadius=1.5, width = 1.5 * 2 = 3
    expect(road!.content).toContain('3f');
  });

  it('contains vertex/triangle generation logic', () => {
    const road = files.find(f => f.path.endsWith('RoadGenerator.cs'));
    expect(road).toBeDefined();
    expect(road!.content).toContain('vertices');
    expect(road!.content).toContain('triangles');
    expect(road!.content).toContain('normals');
    expect(road!.content).toContain('RecalculateBounds');
  });

  it('still references streetNetwork for settlement roads', () => {
    const road = files.find(f => f.path.endsWith('RoadGenerator.cs'));
    expect(road).toBeDefined();
    expect(road!.content).toContain('streetNetwork');
  });
});
