/**
 * Tests for crossing-generator.ts
 */

import {
  CrossingGenerator,
  segmentIntersection,
  type RiverPath,
  type StreetSegment,
  type Point,
} from './crossing-generator';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

function assertApprox(actual: number, expected: number, tolerance: number, msg: string) {
  assert(Math.abs(actual - expected) < tolerance, `${msg} (got ${actual}, expected ~${expected})`);
}

// ── segmentIntersection tests ──

console.log('\nsegmentIntersection:');

(() => {
  // Two perpendicular segments crossing at (5, 5)
  const result = segmentIntersection(
    { x: 0, y: 5 }, { x: 10, y: 5 },
    { x: 5, y: 0 }, { x: 5, y: 10 }
  );
  assert(result !== null, 'perpendicular segments intersect');
  if (result) {
    assertApprox(result.x, 5, 0.01, 'intersection x = 5');
    assertApprox(result.y, 5, 0.01, 'intersection y = 5');
  }
})();

(() => {
  // Parallel segments (no intersection)
  const result = segmentIntersection(
    { x: 0, y: 0 }, { x: 10, y: 0 },
    { x: 0, y: 5 }, { x: 10, y: 5 }
  );
  assert(result === null, 'parallel segments do not intersect');
})();

(() => {
  // Segments that would intersect if extended but don't actually touch
  const result = segmentIntersection(
    { x: 0, y: 0 }, { x: 3, y: 0 },
    { x: 5, y: -5 }, { x: 5, y: 5 }
  );
  assert(result === null, 'non-overlapping segments do not intersect');
})();

(() => {
  // Diagonal intersection
  const result = segmentIntersection(
    { x: 0, y: 0 }, { x: 10, y: 10 },
    { x: 10, y: 0 }, { x: 0, y: 10 }
  );
  assert(result !== null, 'diagonal segments intersect');
  if (result) {
    assertApprox(result.x, 5, 0.01, 'diagonal intersection x = 5');
    assertApprox(result.y, 5, 0.01, 'diagonal intersection y = 5');
  }
})();

// ── CrossingGenerator construction ──

console.log('\nCrossingGenerator construction:');

(() => {
  const gen = new CrossingGenerator({ seed: 123, mapSize: 1000 });
  assert(gen !== null, 'creates with valid config');
})();

// ── River path generation ──

console.log('\nRiver path generation:');

(() => {
  const gen = new CrossingGenerator({ seed: 42, mapSize: 1000 });
  const river = gen.generateRiverPath('Test River', 15);

  assert(river.id === 'river-test-river', 'river has correct id');
  assert(river.name === 'Test River', 'river has correct name');
  assert(river.width === 15, 'river has correct width');
  assert(river.points.length === 21, 'river has 21 points (0..20)');

  // River should span most of the map
  const xs = river.points.map(p => p.x);
  const ys = river.points.map(p => p.y);
  const xRange = Math.max(...xs) - Math.min(...xs);
  const yRange = Math.max(...ys) - Math.min(...ys);
  assert(
    xRange > 500 || yRange > 500,
    `river spans a significant portion of the map (xRange=${xRange.toFixed(0)}, yRange=${yRange.toFixed(0)})`
  );
})();

(() => {
  // Deterministic: same seed produces same river
  const gen1 = new CrossingGenerator({ seed: 99, mapSize: 500 });
  const gen2 = new CrossingGenerator({ seed: 99, mapSize: 500 });
  const r1 = gen1.generateRiverPath('R');
  const r2 = gen2.generateRiverPath('R');
  const same = r1.points.every((p, i) => p.x === r2.points[i].x && p.y === r2.points[i].y);
  assert(same, 'same seed produces identical river paths');
})();

// ── Streets to segments ──

console.log('\nStreets to segments:');

(() => {
  const gen = new CrossingGenerator({ seed: 42, mapSize: 1000 });
  const streets = [
    { id: 's1', name: 'Main St', x: 500, y: 500, properties: { length: 300 } },
  ];
  const segments = gen.streetsToSegments(streets);
  assert(segments.length === 1, 'converts one street to one segment');
  assert(segments[0].id === 's1', 'segment preserves id');
  assert(segments[0].name === 'Main St', 'segment preserves name');

  // Segment length should approximately match the street length
  const dx = segments[0].end.x - segments[0].start.x;
  const dy = segments[0].end.y - segments[0].start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  assertApprox(len, 300, 1, 'segment length matches street length');
})();

// ── Finding crossings ──

console.log('\nFinding crossings:');

(() => {
  const gen = new CrossingGenerator({ seed: 42, mapSize: 1000, foundedYear: 1850 });

  // Create a horizontal river across the middle
  const river: RiverPath = {
    id: 'river-test',
    name: 'Test River',
    points: [
      { x: 0, y: 500 },
      { x: 1000, y: 500 },
    ],
    width: 15,
  };

  // A street that crosses vertically through the river
  const crossingStreet: StreetSegment = {
    id: 's-cross',
    name: 'Bridge St',
    start: { x: 400, y: 300 },
    end: { x: 400, y: 700 },
  };

  // A street that runs parallel (shouldn't cross)
  const parallelStreet: StreetSegment = {
    id: 's-parallel',
    name: 'River Rd',
    start: { x: 100, y: 200 },
    end: { x: 900, y: 200 },
  };

  const crossings = gen.findCrossings(river, [crossingStreet, parallelStreet]);
  assert(crossings.length === 1, 'finds exactly one crossing');
  assert(crossings[0].streetName === 'Bridge St', 'crossing is on correct street');
  assert(crossings[0].riverName === 'Test River', 'crossing references correct river');
  assertApprox(crossings[0].x, 400, 1, 'crossing x position is correct');
  assertApprox(crossings[0].y, 500, 1, 'crossing y position is correct');
})();

(() => {
  // Each street should only produce one crossing even if river doubles back
  const gen = new CrossingGenerator({ seed: 42, mapSize: 1000 });
  const river: RiverPath = {
    id: 'river-zigzag',
    name: 'Zigzag River',
    points: [
      { x: 0, y: 400 },
      { x: 500, y: 600 },
      { x: 1000, y: 400 },
    ],
    width: 10,
  };

  // A vertical street that could cross both segments
  const street: StreetSegment = {
    id: 's-vert',
    name: 'Center Ave',
    start: { x: 250, y: 0 },
    end: { x: 250, y: 1000 },
  };

  const crossings = gen.findCrossings(river, [street]);
  assert(crossings.length === 1, 'street only produces one crossing even with multi-segment river');
})();

// ── Crossing type selection ──

console.log('\nCrossing type selection:');

(() => {
  const gen = new CrossingGenerator({ seed: 42, mapSize: 1000, foundedYear: 1800 });

  // Narrow river should produce ford
  const narrowRiver: RiverPath = {
    id: 'river-narrow',
    name: 'Creek',
    points: [{ x: 0, y: 500 }, { x: 1000, y: 500 }],
    width: 5,
  };
  const street: StreetSegment = {
    id: 's1', name: 'Test St',
    start: { x: 500, y: 0 }, end: { x: 500, y: 1000 },
  };
  const crossings = gen.findCrossings(narrowRiver, [street]);
  assert(crossings.length === 1, 'narrow river produces a crossing');
  assert(crossings[0].type === 'ford', 'narrow river (width 5) produces a ford');
})();

// ── Full generate() pipeline ──

console.log('\nFull generate() pipeline:');

(() => {
  const gen = new CrossingGenerator({ seed: 42, mapSize: 1000, foundedYear: 1850 });
  const streets = [
    { id: 's0', name: 'North St', x: 500, y: 200, properties: { length: 400 } },
    { id: 's1', name: 'South St', x: 500, y: 800, properties: { length: 400 } },
    { id: 's2', name: 'Center Ave', x: 500, y: 500, properties: { length: 400 } },
  ];

  const result = gen.generate(streets);

  assert(result.rivers.length === 1, 'generates one river');
  assert(result.rivers[0].name === 'Town River', 'river named Town River');
  assert(result.crossings.length >= 0, 'crossings array is defined');

  // Every crossing should have required fields
  for (const c of result.crossings) {
    assert(typeof c.id === 'string' && c.id.length > 0, `crossing ${c.name} has id`);
    assert(typeof c.name === 'string' && c.name.length > 0, `crossing ${c.id} has name`);
    assert(['bridge', 'ford', 'ferry'].includes(c.type), `crossing ${c.name} has valid type`);
    assert(typeof c.x === 'number', `crossing ${c.name} has x`);
    assert(typeof c.y === 'number', `crossing ${c.name} has y`);
    assert(typeof c.properties.material === 'string', `crossing ${c.name} has material`);
    assert(['foot', 'cart', 'heavy'].includes(c.properties.capacity), `crossing ${c.name} has valid capacity`);
    assert(['new', 'good', 'worn', 'damaged'].includes(c.properties.condition), `crossing ${c.name} has valid condition`);
  }
})();

// ── Determinism ──

console.log('\nDeterminism:');

(() => {
  const streets = [
    { id: 's0', name: 'Main St', x: 300, y: 400, properties: { length: 500 } },
    { id: 's1', name: 'Oak Ave', x: 700, y: 600, properties: { length: 300 } },
  ];

  const gen1 = new CrossingGenerator({ seed: 77, mapSize: 1000, foundedYear: 1900 });
  const gen2 = new CrossingGenerator({ seed: 77, mapSize: 1000, foundedYear: 1900 });

  const r1 = gen1.generate(streets);
  const r2 = gen2.generate(streets);

  assert(r1.crossings.length === r2.crossings.length, 'same seed produces same number of crossings');
  const allMatch = r1.crossings.every((c, i) =>
    c.id === r2.crossings[i].id &&
    c.type === r2.crossings[i].type &&
    c.x === r2.crossings[i].x &&
    c.y === r2.crossings[i].y
  );
  assert(allMatch, 'same seed produces identical crossings');
})();

// ── Summary ──

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
