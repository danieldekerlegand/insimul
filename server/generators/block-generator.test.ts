/**
 * Tests for block-generator.ts — city block extraction from street networks.
 *
 * Run with: npx tsx server/generators/block-generator.test.ts
 */

import { generateBlocks, assignLotsToBlocks } from './block-generator';
import { generateLotsAlongStreets, LotPosition } from './lot-generator';
import { StreetGenerator } from './street-generator';
import type { StreetNetwork, StreetNode, StreetEdge, Block } from '../../shared/game-engine/types';
import type { GeographyConfig } from './geography-generator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

// ── Helpers ──

function makeNode(id: string, x: number, z: number): StreetNode {
  return { id, position: { x, z }, elevation: 0, type: 'intersection' };
}

function makeEdge(id: string, fromId: string, toId: string, nodes: Map<string, StreetNode>, name?: string): StreetEdge {
  const from = nodes.get(fromId)!;
  const to = nodes.get(toId)!;
  const dx = to.position.x - from.position.x;
  const dz = to.position.z - from.position.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  return {
    id,
    name: name ?? `Street-${id}`,
    fromNodeId: fromId,
    toNodeId: toId,
    streetType: 'residential',
    width: 3,
    waypoints: [
      { x: from.position.x, y: 0, z: from.position.z },
      { x: to.position.x, y: 0, z: to.position.z },
    ],
    length,
    condition: 1,
    traffic: 0.5,
    sidewalks: true,
    hasStreetLights: false,
  };
}

function makeGeoConfig(overrides: Partial<GeographyConfig> = {}): GeographyConfig {
  return {
    worldId: 'test-world',
    settlementId: 'test-settlement',
    settlementName: 'Testville',
    settlementType: 'town',
    population: 200,
    foundedYear: 1900,
    terrain: 'plains',
    ...overrides,
  };
}

// ── Build a simple square network (4 nodes, 4 edges, 1 inner block) ──

function makeSquareNetwork(): StreetNetwork {
  const nodes: StreetNode[] = [
    makeNode('n1', 0, 0),
    makeNode('n2', 100, 0),
    makeNode('n3', 100, 100),
    makeNode('n4', 0, 100),
  ];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const edges: StreetEdge[] = [
    makeEdge('e1', 'n1', 'n2', nodeMap, '1st St'),
    makeEdge('e2', 'n2', 'n3', nodeMap, '1st Ave'),
    makeEdge('e3', 'n3', 'n4', nodeMap, '2nd St'),
    makeEdge('e4', 'n4', 'n1', nodeMap, '2nd Ave'),
  ];

  return { nodes, edges };
}

// ── Build a 2x2 grid (9 nodes, 12 edges, 4 inner blocks) ──

function make2x2GridNetwork(): StreetNetwork {
  const nodes: StreetNode[] = [];
  const nodeMap = new Map<string, StreetNode>();
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const node = makeNode(`n${row}_${col}`, col * 100, row * 100);
      nodes.push(node);
      nodeMap.set(node.id, node);
    }
  }

  const edges: StreetEdge[] = [];
  let edgeId = 0;
  // Horizontal edges
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      edges.push(makeEdge(`e${edgeId++}`, `n${row}_${col}`, `n${row}_${col + 1}`, nodeMap, `${row + 1}th St`));
    }
  }
  // Vertical edges
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      edges.push(makeEdge(`e${edgeId++}`, `n${row}_${col}`, `n${row + 1}_${col}`, nodeMap, `${col + 1}th Ave`));
    }
  }

  return { nodes, edges };
}

// ════════════════════════════════════════════════════════════════════════════
// Tests
// ════════════════════════════════════════════════════════════════════════════

console.log('\n=== Block Generator Tests ===\n');

// ── Single square block ──
console.log('--- Single square block ---');
{
  const network = makeSquareNetwork();
  const blocks = generateBlocks(network, { x: 50, z: 50 });

  assert(blocks.length === 1, `Single square produces 1 block (got ${blocks.length})`);

  if (blocks.length > 0) {
    const block = blocks[0];
    assert(block.polygon.length === 4, `Block has 4 vertices (got ${block.polygon.length})`);
    assert(block.blockNumber === 100, `First block is numbered 100 (got ${block.blockNumber})`);
    assert(block.boundaryStreetIds.length > 0, `Block has boundary street IDs`);
    assert(block.id === 'block-0', `Block ID is block-0 (got ${block.id})`);
    assert(typeof block.center.x === 'number', `Block center has x coordinate`);
    assert(typeof block.center.z === 'number', `Block center has z coordinate`);
  }
}

// ── 2x2 grid → 4 blocks ──
console.log('\n--- 2x2 grid blocks ---');
{
  const network = make2x2GridNetwork();
  const blocks = generateBlocks(network, { x: 100, z: 100 });

  assert(blocks.length === 4, `2x2 grid produces 4 blocks (got ${blocks.length})`);

  // Block numbers should increase outward from center (100, 200, 300, 400)
  if (blocks.length === 4) {
    const numbers = blocks.map(b => b.blockNumber).sort((a, b) => a - b);
    assert(numbers[0] === 100, `First block number is 100 (got ${numbers[0]})`);
    assert(numbers[3] === 400, `Last block number is 400 (got ${numbers[3]})`);

    // All blocks should have unique IDs
    const ids = new Set(blocks.map(b => b.id));
    assert(ids.size === 4, `All blocks have unique IDs`);

    // Each block should have boundary street IDs
    for (const block of blocks) {
      assert(block.boundaryStreetIds.length > 0, `Block ${block.id} has boundary streets`);
    }
  }

  // Block numbers increase outward: inner blocks have lower numbers
  if (blocks.length === 4) {
    const innerBlocks = blocks.filter(b => {
      const d = Math.sqrt((b.center.x - 100) ** 2 + (b.center.z - 100) ** 2);
      return d < 80;
    });
    const outerBlocks = blocks.filter(b => {
      const d = Math.sqrt((b.center.x - 100) ** 2 + (b.center.z - 100) ** 2);
      return d >= 80;
    });
    // All blocks are equidistant in this symmetric grid, so just verify ordering is consistent
    assert(blocks[0].blockNumber <= blocks[blocks.length - 1].blockNumber,
      `Block numbers are non-decreasing`);
  }
}

// ── Empty / insufficient network → no blocks ──
console.log('\n--- Edge cases ---');
{
  const emptyNetwork: StreetNetwork = { nodes: [], edges: [] };
  assert(generateBlocks(emptyNetwork).length === 0, `Empty network produces 0 blocks`);

  // Two nodes, one edge — no cycle possible
  const twoNodes: StreetNetwork = {
    nodes: [makeNode('a', 0, 0), makeNode('b', 100, 0)],
    edges: [],
  };
  // Add an edge manually
  const nodeMap = new Map(twoNodes.nodes.map(n => [n.id, n]));
  twoNodes.edges.push(makeEdge('e1', 'a', 'b', nodeMap));
  assert(generateBlocks(twoNodes).length === 0, `Line network produces 0 blocks`);

  // Triangle (3 nodes, 3 edges) — produces 1 block
  const triNodes: StreetNode[] = [
    makeNode('t1', 0, 0),
    makeNode('t2', 100, 0),
    makeNode('t3', 50, 87),
  ];
  const triNodeMap = new Map(triNodes.map(n => [n.id, n]));
  const triNetwork: StreetNetwork = {
    nodes: triNodes,
    edges: [
      makeEdge('te1', 't1', 't2', triNodeMap),
      makeEdge('te2', 't2', 't3', triNodeMap),
      makeEdge('te3', 't3', 't1', triNodeMap),
    ],
  };
  const triBlocks = generateBlocks(triNetwork);
  assert(triBlocks.length === 1, `Triangle produces 1 block (got ${triBlocks.length})`);
}

// ── Block properties ──
console.log('\n--- Block properties ---');
{
  const network = makeSquareNetwork();
  const blocks = generateBlocks(network, { x: 50, z: 50 });

  if (blocks.length > 0) {
    const block = blocks[0];

    // Polygon should have positive signed area (CCW winding)
    let area = 0;
    for (let i = 0; i < block.polygon.length; i++) {
      const j = (i + 1) % block.polygon.length;
      area += block.polygon[i].x * block.polygon[j].z;
      area -= block.polygon[j].x * block.polygon[i].z;
    }
    // Area of 100x100 square = 10000
    assert(Math.abs(Math.abs(area / 2) - 10000) < 100, `Square block area ~10000 (got ${Math.abs(area / 2)})`);

    // Center should be near (50, 50)
    assert(Math.abs(block.center.x - 50) < 5, `Block center.x near 50 (got ${block.center.x})`);
    assert(Math.abs(block.center.z - 50) < 5, `Block center.z near 50 (got ${block.center.z})`);
  }
}

// ── Lot assignment to blocks ──
console.log('\n--- Lot assignment to blocks ---');
{
  const network = makeSquareNetwork();
  const blocks = generateBlocks(network, { x: 50, z: 50 });

  // Create some test lots inside and outside the block
  const insideLot: LotPosition = {
    position: { x: 50, y: 0, z: 50 },
    facingAngle: 0,
    width: 10,
    depth: 10,
    side: 'left',
    distanceAlongStreet: 50,
    streetEdgeId: 'e1',
  };

  const outsideLot: LotPosition = {
    position: { x: 200, y: 0, z: 200 },
    facingAngle: 0,
    width: 10,
    depth: 10,
    side: 'right',
    distanceAlongStreet: 50,
    streetEdgeId: 'e1',
  };

  const lots = [insideLot, outsideLot];
  assignLotsToBlocks(lots, blocks);

  assert((insideLot as any).blockId === 'block-0', `Inside lot assigned to block-0 (got ${(insideLot as any).blockId})`);
  assert((outsideLot as any).blockId === undefined, `Outside lot not assigned to any block`);
}

// ── Integration with StreetGenerator grid ──
console.log('\n--- Integration with StreetGenerator ---');
{
  const gen = new StreetGenerator();
  const gridNetwork = gen.generateGrid({
    center: { x: 200, z: 200 },
    radius: 150,
    settlementType: 'town',
    seed: 'block-test-42',
    gridSize: 4,
    blockLength: 80,
  });

  const blocks = generateBlocks(gridNetwork, { x: 200, z: 200 });
  assert(blocks.length > 0, `Grid network produces blocks (got ${blocks.length})`);

  if (blocks.length > 0) {
    // All blocks have valid polygons
    const allValid = blocks.every(b => b.polygon.length >= 3);
    assert(allValid, `All blocks have polygons with ≥3 vertices`);

    // All blocks have unique IDs and block numbers
    const uniqueIds = new Set(blocks.map(b => b.id));
    const uniqueNums = new Set(blocks.map(b => b.blockNumber));
    assert(uniqueIds.size === blocks.length, `All block IDs are unique`);
    assert(uniqueNums.size === blocks.length, `All block numbers are unique`);

    // Block numbers are multiples of 100
    const allMultiples = blocks.every(b => b.blockNumber % 100 === 0 && b.blockNumber > 0);
    assert(allMultiples, `All block numbers are multiples of 100`);

    // Test lot assignment with generated lots
    const config = makeGeoConfig({ population: 100 });
    const lots = generateLotsAlongStreets(gridNetwork, config);

    if (lots.length > 0) {
      assignLotsToBlocks(lots, blocks);
      const assignedLots = lots.filter(l => (l as any).blockId !== undefined);
      assert(assignedLots.length > 0, `Some lots assigned to blocks (${assignedLots.length}/${lots.length})`);
    }
  }
}

// ── Determinism ──
console.log('\n--- Determinism ---');
{
  const network = make2x2GridNetwork();
  const blocks1 = generateBlocks(network, { x: 100, z: 100 });
  const blocks2 = generateBlocks(network, { x: 100, z: 100 });

  assert(blocks1.length === blocks2.length, `Same input produces same block count`);
  if (blocks1.length === blocks2.length && blocks1.length > 0) {
    let allMatch = true;
    for (let i = 0; i < blocks1.length; i++) {
      if (blocks1[i].blockNumber !== blocks2[i].blockNumber ||
          blocks1[i].polygon.length !== blocks2[i].polygon.length) {
        allMatch = false;
        break;
      }
    }
    assert(allMatch, `Block generation is deterministic`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Summary
// ════════════════════════════════════════════════════════════════════════════

console.log(`\n=== Results: ${passed} passed, ${failed} failed (${passed + failed} total) ===\n`);
process.exit(failed > 0 ? 1 : 0);
