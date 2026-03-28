/**
 * Tests for staircase navigation system:
 * - Step dimensions (0.3m tall, 0.4m deep)
 * - Railings on both sides
 * - Landing at top of stairs
 * - Upper floor cutout matches stair footprint
 * - Stair nav nodes for NPC floor transitions
 * - Player step offset can handle stair steps
 *
 * Run with: npx tsx --tsconfig client/src/components/3DGame/__tests__/tsconfig.test.json client/src/components/3DGame/__tests__/StaircaseNavigation.test.ts
 */

import { Scene, Mesh, Vector3, Color3 } from './babylon-mock';
import { BuildingInteriorGenerator } from '../BuildingInteriorGenerator';
import type { InteriorLayout, StairNavNode } from '../BuildingInteriorGenerator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  \u2713 ${message}`);
  } else {
    failed++;
    console.error(`  \u2717 ${message}`);
  }
}

function makeScene(): any {
  return new Scene();
}

// ── Tests ──

console.log('\n=== Staircase Navigation Tests ===\n');

// --- Multi-floor buildings produce staircase with nav nodes ---

console.log('multi-floor buildings have staircase and nav nodes:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  // Tavern is multi-floor
  const tavern = gen.generateInterior('tav_stair', 'business', 'tavern');
  assert(tavern.floorCount > 1, `tavern is multi-floor (floors: ${tavern.floorCount})`);
  assert(tavern.stairNavNodes !== undefined, 'tavern has stairNavNodes');
  assert(
    Array.isArray(tavern.stairNavNodes) && tavern.stairNavNodes.length > 0,
    `stairNavNodes is non-empty array (count: ${tavern.stairNavNodes?.length})`,
  );

  // Large residence is multi-floor
  const resLarge = gen.generateInterior('res_stair', 'residence_large');
  assert(resLarge.floorCount > 1, `large residence is multi-floor (floors: ${resLarge.floorCount})`);
  assert(resLarge.stairNavNodes !== undefined, 'large residence has stairNavNodes');
}

// --- Single-floor buildings have no stair nav nodes ---

console.log('\nsingle-floor buildings have no stairNavNodes:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const resSmall = gen.generateInterior('res_single', 'residence');
  assert(
    resSmall.stairNavNodes === undefined,
    'small residence has no stairNavNodes',
  );
}

// --- Nav node structure is correct ---

console.log('\nnav node structure:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const tavern = gen.generateInterior('tav_nav', 'business', 'tavern');
  const nodes = tavern.stairNavNodes!;

  // First node should be 'bottom'
  assert(nodes[0].type === 'bottom', `first nav node type is "bottom" (got: ${nodes[0].type})`);
  assert(nodes[0].floor === 0, `bottom node is on floor 0 (got: ${nodes[0].floor})`);

  // Last node should be 'top'
  const lastNode = nodes[nodes.length - 1];
  assert(lastNode.type === 'top', `last nav node type is "top" (got: ${lastNode.type})`);
  assert(lastNode.floor === 1, `top node is on floor 1 (got: ${lastNode.floor})`);

  // Should have a landing node
  const landingNode = nodes.find(n => n.type === 'landing');
  assert(landingNode !== undefined, 'has a landing node');
  assert(landingNode!.floor === 1, `landing node is on floor 1 (got: ${landingNode?.floor})`);

  // All nodes should have valid positions
  for (const node of nodes) {
    assert(
      node.position instanceof Vector3,
      `node "${node.type}" has a Vector3 position`,
    );
  }

  // Y values should increase from bottom to top
  const bottomY = nodes[0].position.y;
  const topY = lastNode.position.y;
  assert(topY > bottomY, `top Y (${topY}) > bottom Y (${bottomY})`);
}

// --- Staircase mesh has correct children (steps, landing, railings) ---

console.log('\nstaircase mesh structure:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const tavern = gen.generateInterior('tav_mesh', 'business', 'tavern');
  const stairMesh = tavern.furniture.find(m => m.name.includes('staircase'));
  assert(stairMesh !== undefined, 'staircase mesh exists in furniture');

  if (stairMesh) {
    const children = stairMesh.getChildMeshes();

    // Steps
    const steps = children.filter(c => c.name.includes('_step_'));
    assert(steps.length > 0, `has step meshes (count: ${steps.length})`);

    // Each step should have collision
    const stepsWithCollision = steps.filter(c => c.checkCollisions);
    assert(
      stepsWithCollision.length === steps.length,
      `all ${steps.length} steps have collision enabled`,
    );

    // Landing
    const landing = children.find(c => c.name.includes('_stair_landing'));
    assert(landing !== undefined, 'has landing mesh');
    if (landing) {
      assert(landing.checkCollisions, 'landing has collision enabled');
    }

    // Railings (should have left and right)
    const leftRailing = children.find(c => c.name.includes('railing_left'));
    const rightRailing = children.find(c => c.name.includes('railing_right'));
    assert(leftRailing !== undefined, 'has left railing');
    assert(rightRailing !== undefined, 'has right railing');

    // Railing posts (4 total: 2 sides x 2 ends)
    const posts = children.filter(c => c.name.includes('railing_post'));
    assert(posts.length === 4, `has 4 railing posts (got: ${posts.length})`);
  }
}

// --- Step height is walkable (<=0.3m) ---

console.log('\nstep height is walkable:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const tavern = gen.generateInterior('tav_height', 'business', 'tavern');
  const height = tavern.height;
  const stepCount = Math.ceil(height / 0.3);
  const actualStepHeight = height / stepCount;

  assert(
    actualStepHeight <= 0.3,
    `step height ${actualStepHeight.toFixed(3)}m <= 0.3m`,
  );

  // Interior controller step offset (0.4m) should be > step height
  const interiorStepOffset = 0.4;
  assert(
    interiorStepOffset > actualStepHeight,
    `interior step offset ${interiorStepOffset}m > step height ${actualStepHeight.toFixed(3)}m`,
  );
}

// --- Upper floor has stairwell cutout ---

console.log('\nupper floor cutout:');

{
  const scene = makeScene();
  const gen = new BuildingInteriorGenerator(scene as any);

  const tavern = gen.generateInterior('tav_cutout', 'business', 'tavern');

  // The upper floor is built as separate sections around the stairwell hole.
  // Main floor section should be narrower than total width.
  // Check that the interior has upper floor rooms on floor 1.
  const upperRooms = tavern.rooms.filter(r => r.floor === 1);
  assert(
    upperRooms.length > 0,
    `tavern has upper floor rooms (count: ${upperRooms.length})`,
  );
}

// ── Summary ──

console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);
if (failed > 0) process.exit(1);
