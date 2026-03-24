/**
 * Tests for resource gathering node generation in the IR.
 *
 * Verifies that generateGatheringNodes produces correctly placed,
 * biome-weighted resource nodes around settlements with respawn data.
 */

import { describe, it, expect } from 'vitest';
import type {
  SettlementIR,
  ResourceDefinitionIR,
  GatheringNodeIR,
} from '@shared/game-engine/ir-types';

// Import the function under test
import { generateGatheringNodes } from '../services/game-export/ir-generator';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function makeSettlement(overrides: Partial<SettlementIR> = {}): SettlementIR {
  return {
    id: 'settlement-1',
    worldId: 'world-1',
    countryId: null,
    stateId: null,
    name: 'Test Town',
    description: null,
    settlementType: 'town',
    terrain: 'forest',
    population: 100,
    foundedYear: null,
    founderIds: [],
    mayorId: null,
    position: { x: 0, y: 0, z: 0 },
    radius: 50,
    elevationProfile: null,
    lots: [],
    ...overrides,
  } as SettlementIR;
}

const RESOURCE_DEFS: ResourceDefinitionIR[] = [
  { id: 'wood', name: 'Wood', icon: '🪵', color: { r: 0.55, g: 0.35, b: 0.15 }, maxStack: 999, gatherTime: 1500, respawnTime: 60000 },
  { id: 'stone', name: 'Stone', icon: '🪨', color: { r: 0.5, g: 0.5, b: 0.5 }, maxStack: 999, gatherTime: 2000, respawnTime: 90000 },
  { id: 'iron', name: 'Iron', icon: '⛏️', color: { r: 0.6, g: 0.6, b: 0.65 }, maxStack: 500, gatherTime: 3000, respawnTime: 120000 },
  { id: 'food', name: 'Food', icon: '🌾', color: { r: 0.8, g: 0.7, b: 0.2 }, maxStack: 500, gatherTime: 1000, respawnTime: 30000 },
  { id: 'water', name: 'Water', icon: '💧', color: { r: 0.2, g: 0.5, b: 0.9 }, maxStack: 500, gatherTime: 800, respawnTime: 20000 },
  { id: 'fiber', name: 'Fiber', icon: '🌿', color: { r: 0.3, g: 0.7, b: 0.3 }, maxStack: 500, gatherTime: 1200, respawnTime: 45000 },
  { id: 'gold', name: 'Gold', icon: '💰', color: { r: 1, g: 0.84, b: 0 }, maxStack: 9999, gatherTime: 4000, respawnTime: 180000 },
  { id: 'crystal', name: 'Crystal', icon: '💎', color: { r: 0.6, g: 0.4, b: 0.9 }, maxStack: 200, gatherTime: 5000, respawnTime: 300000 },
  { id: 'oil', name: 'Oil', icon: '🛢️', color: { r: 0.15, g: 0.15, b: 0.15 }, maxStack: 300, gatherTime: 3500, respawnTime: 240000 },
];

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('generateGatheringNodes', () => {
  it('generates nodes for each settlement', () => {
    const settlements = [
      makeSettlement({ id: 'town-a', position: { x: 100, y: 0, z: 100 } }),
      makeSettlement({ id: 'town-b', position: { x: -100, y: 0, z: -100 } }),
    ];
    const nodes = generateGatheringNodes(settlements, RESOURCE_DEFS, 1000, 'test-seed');

    // Should have nodes from both settlements
    const townANodes = nodes.filter(n => n.id.startsWith('rnode_town-a'));
    const townBNodes = nodes.filter(n => n.id.startsWith('rnode_town-b'));
    expect(townANodes.length).toBeGreaterThan(0);
    expect(townBNodes.length).toBeGreaterThan(0);
  });

  it('generates correct GatheringNodeIR shape', () => {
    const nodes = generateGatheringNodes(
      [makeSettlement()],
      RESOURCE_DEFS,
      1000,
      'shape-seed',
    );

    expect(nodes.length).toBeGreaterThan(0);
    const node = nodes[0];
    expect(node).toHaveProperty('id');
    expect(node).toHaveProperty('resourceType');
    expect(node).toHaveProperty('position');
    expect(node).toHaveProperty('maxAmount');
    expect(node).toHaveProperty('respawnTime');
    expect(node).toHaveProperty('scale');
    expect(node.position).toHaveProperty('x');
    expect(node.position).toHaveProperty('y');
    expect(node.position).toHaveProperty('z');
  });

  it('assigns respawnTime from matching resource definition', () => {
    const nodes = generateGatheringNodes(
      [makeSettlement()],
      RESOURCE_DEFS,
      1000,
      'respawn-seed',
    );

    for (const node of nodes) {
      const def = RESOURCE_DEFS.find(d => d.id === node.resourceType);
      expect(def).toBeDefined();
      expect(node.respawnTime).toBe(def!.respawnTime);
    }
  });

  it('only uses resource types that exist in definitions', () => {
    const limitedDefs = RESOURCE_DEFS.filter(d => d.id === 'wood' || d.id === 'stone');
    const nodes = generateGatheringNodes(
      [makeSettlement()],
      limitedDefs,
      1000,
      'limited-seed',
    );

    for (const node of nodes) {
      expect(['wood', 'stone']).toContain(node.resourceType);
    }
  });

  it('biases resource types based on biome', () => {
    // Forest biome should favor wood, food, fiber
    const forestSettlement = makeSettlement({ terrain: 'forest' });
    const forestNodes = generateGatheringNodes(
      [forestSettlement],
      RESOURCE_DEFS,
      2000,
      'biome-seed',
    );

    const typeCounts: Record<string, number> = {};
    for (const n of forestNodes) {
      typeCounts[n.resourceType] = (typeCounts[n.resourceType] || 0) + 1;
    }

    // Wood should be present in a forest biome
    expect(typeCounts['wood'] || 0).toBeGreaterThan(0);
  });

  it('keeps nodes within terrain bounds', () => {
    const terrainSize = 500;
    const half = terrainSize / 2;
    const nodes = generateGatheringNodes(
      [makeSettlement({ position: { x: 200, y: 0, z: 200 } })],
      RESOURCE_DEFS,
      terrainSize,
      'bounds-seed',
    );

    for (const node of nodes) {
      expect(node.position.x).toBeGreaterThanOrEqual(-half);
      expect(node.position.x).toBeLessThanOrEqual(half);
      expect(node.position.z).toBeGreaterThanOrEqual(-half);
      expect(node.position.z).toBeLessThanOrEqual(half);
    }
  });

  it('produces deterministic output for the same seed', () => {
    const settlements = [makeSettlement()];
    const a = generateGatheringNodes(settlements, RESOURCE_DEFS, 1000, 'det-seed');
    const b = generateGatheringNodes(settlements, RESOURCE_DEFS, 1000, 'det-seed');

    expect(a).toEqual(b);
  });

  it('produces different output for different seeds', () => {
    const settlements = [makeSettlement()];
    const a = generateGatheringNodes(settlements, RESOURCE_DEFS, 1000, 'seed-a');
    const b = generateGatheringNodes(settlements, RESOURCE_DEFS, 1000, 'seed-b');

    // At least some positions should differ
    const aPositions = a.map(n => `${n.position.x},${n.position.z}`);
    const bPositions = b.map(n => `${n.position.x},${n.position.z}`);
    expect(aPositions).not.toEqual(bPositions);
  });

  it('returns empty array when no settlements', () => {
    const nodes = generateGatheringNodes([], RESOURCE_DEFS, 1000, 'empty-seed');
    expect(nodes).toEqual([]);
  });

  it('sets maxAmount within expected ranges', () => {
    const nodes = generateGatheringNodes(
      [makeSettlement()],
      RESOURCE_DEFS,
      1000,
      'amount-seed',
    );

    for (const node of nodes) {
      expect(node.maxAmount).toBeGreaterThanOrEqual(1);
      expect(node.maxAmount).toBeLessThanOrEqual(8);
    }
  });

  it('sets scale within expected range', () => {
    const nodes = generateGatheringNodes(
      [makeSettlement()],
      RESOURCE_DEFS,
      1000,
      'scale-seed',
    );

    for (const node of nodes) {
      expect(node.scale).toBeGreaterThanOrEqual(0.8);
      expect(node.scale).toBeLessThanOrEqual(1.4);
    }
  });

  it('uses mountain biome for stone/iron/crystal-heavy distribution', () => {
    const settlement = makeSettlement({ terrain: 'mountain' });
    const nodes = generateGatheringNodes(
      [settlement],
      RESOURCE_DEFS,
      2000,
      'mountain-seed',
    );

    const typeCounts: Record<string, number> = {};
    for (const n of nodes) {
      typeCounts[n.resourceType] = (typeCounts[n.resourceType] || 0) + 1;
    }

    // Mountain nodes should not have wood or fiber (not in mountain weights)
    expect(typeCounts['wood'] || 0).toBe(0);
    expect(typeCounts['fiber'] || 0).toBe(0);
    // Should have stone
    expect(typeCounts['stone'] || 0).toBeGreaterThan(0);
  });
});
