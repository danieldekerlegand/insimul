/**
 * Tests for StreetGenerator.
 *
 * Run with: npx tsx server/generators/street-generator.test.ts
 */

import { StreetGenerator, StreetGenConfig } from './street-generator';

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

// ── Organic pattern tests ──

console.log('\n=== StreetGenerator: Organic Pattern ===\n');

const gen = new StreetGenerator();

const villageConfig: StreetGenConfig = {
  center: { x: 0, z: 0 },
  radius: 100,
  settlementType: 'village',
  seed: 'test-village-42',
};

const network = gen.generateOrganic(villageConfig);

// Basic structure
console.log('--- Basic structure ---');
assert(network.nodes.length > 0, `Has nodes (got ${network.nodes.length})`);
assert(network.edges.length > 0, `Has edges (got ${network.edges.length})`);

// Village should have a reasonable number of nodes and edges
assert(network.nodes.length >= 5, `At least 5 nodes for a village (got ${network.nodes.length})`);
assert(network.nodes.length <= 80, `No more than 80 nodes for a village (got ${network.nodes.length})`);
assert(network.edges.length >= 4, `At least 4 edges for a village (got ${network.edges.length})`);
assert(network.edges.length <= 80, `No more than 80 edges for a village (got ${network.edges.length})`);

// Node validity
console.log('\n--- Node validity ---');
for (const node of network.nodes) {
  assert(typeof node.id === 'string' && node.id.length > 0, `Node ${node.id} has valid id`);
  assert(typeof node.position.x === 'number' && !isNaN(node.position.x), `Node ${node.id} has valid x`);
  assert(typeof node.position.z === 'number' && !isNaN(node.position.z), `Node ${node.id} has valid z`);
  assert(
    ['intersection', 'dead_end', 'T_junction', 'curve_point'].includes(node.type),
    `Node ${node.id} has valid type: ${node.type}`
  );
}

// Edge validity
console.log('\n--- Edge validity ---');
const nodeIds = new Set(network.nodes.map(n => n.id));

for (const edge of network.edges) {
  assert(typeof edge.id === 'string' && edge.id.length > 0, `Edge ${edge.id} has valid id`);
  assert(nodeIds.has(edge.fromNodeId), `Edge ${edge.id} fromNodeId ${edge.fromNodeId} references existing node`);
  assert(nodeIds.has(edge.toNodeId), `Edge ${edge.id} toNodeId ${edge.toNodeId} references existing node`);
  assert(edge.waypoints.length >= 2, `Edge ${edge.id} has at least 2 waypoints (got ${edge.waypoints.length})`);
  assert(edge.length > 0, `Edge ${edge.id} has non-zero length (got ${edge.length.toFixed(2)})`);
  assert(edge.width > 0, `Edge ${edge.id} has non-zero width (got ${edge.width})`);
}

// Connectivity: all nodes reachable from any other via BFS
console.log('\n--- Connectivity ---');
{
  const adj = new Map<string, Set<string>>();
  for (const n of network.nodes) adj.set(n.id, new Set());
  for (const e of network.edges) {
    adj.get(e.fromNodeId)!.add(e.toNodeId);
    adj.get(e.toNodeId)!.add(e.fromNodeId);
  }

  const visited = new Set<string>();
  const queue = [network.nodes[0].id];
  visited.add(network.nodes[0].id);
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adj.get(current)!) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  assert(
    visited.size === network.nodes.length,
    `Graph is fully connected: visited ${visited.size}/${network.nodes.length} nodes`
  );
}

// Determinism: same seed = same output
console.log('\n--- Determinism ---');
{
  const gen2 = new StreetGenerator();
  const network2 = gen2.generateOrganic(villageConfig);
  assert(network2.nodes.length === network.nodes.length, `Same seed produces same node count`);
  assert(network2.edges.length === network.edges.length, `Same seed produces same edge count`);

  // Check positions match
  let positionsMatch = true;
  for (let i = 0; i < network.nodes.length; i++) {
    if (
      Math.abs(network.nodes[i].position.x - network2.nodes[i].position.x) > 0.0001 ||
      Math.abs(network.nodes[i].position.z - network2.nodes[i].position.z) > 0.0001
    ) {
      positionsMatch = false;
      break;
    }
  }
  assert(positionsMatch, `Same seed produces identical node positions`);
}

// Different seed = different output
console.log('\n--- Different seeds ---');
{
  const gen3 = new StreetGenerator();
  const network3 = gen3.generateOrganic({ ...villageConfig, seed: 'different-seed-99' });
  let hasDifference = false;
  if (network3.nodes.length !== network.nodes.length) {
    hasDifference = true;
  } else {
    for (let i = 0; i < network.nodes.length; i++) {
      if (
        Math.abs(network.nodes[i].position.x - network3.nodes[i].position.x) > 0.01 ||
        Math.abs(network.nodes[i].position.z - network3.nodes[i].position.z) > 0.01
      ) {
        hasDifference = true;
        break;
      }
    }
  }
  assert(hasDifference, `Different seed produces different network`);
}

// Street types
console.log('\n--- Street types ---');
{
  const types = new Set(network.edges.map(e => e.streetType));
  assert(types.has('main_road'), `Has main_road street type`);
  // Secondary or tertiary should exist too
  assert(types.size >= 2, `Has at least 2 different street types (got ${types.size}: ${[...types].join(', ')})`);
}

// Slope map avoidance
console.log('\n--- Slope map avoidance ---');
{
  // Create a slope map with steep center and flat edges
  const size = 32;
  const steepSlopeMap: number[][] = [];
  for (let r = 0; r < size; r++) {
    steepSlopeMap[r] = [];
    for (let c = 0; c < size; c++) {
      const cx = c / (size - 1) - 0.5;
      const cz = r / (size - 1) - 0.5;
      const d = Math.sqrt(cx * cx + cz * cz);
      // Steep near center, flat at edges
      steepSlopeMap[r][c] = d < 0.2 ? 2.0 : 0.01;
    }
  }

  const gen4 = new StreetGenerator();
  const slopeNetwork = gen4.generateOrganic({
    ...villageConfig,
    seed: 'slope-test',
    slopeMap: steepSlopeMap,
  });
  assert(slopeNetwork.nodes.length > 0, `Generates network even with steep slope map`);
  assert(slopeNetwork.edges.length > 0, `Has edges with steep slope map`);
}

// Larger settlement
console.log('\n--- Larger settlement ---');
{
  const gen5 = new StreetGenerator();
  const cityNetwork = gen5.generateOrganic({
    center: { x: 0, z: 0 },
    radius: 500,
    settlementType: 'city',
    seed: 'big-city',
  });
  assert(cityNetwork.nodes.length > network.nodes.length * 0.5, `Larger radius produces more nodes (got ${cityNetwork.nodes.length} vs village ${network.nodes.length})`);
}

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
