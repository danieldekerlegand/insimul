/**
 * Tests for AnimalNPCSystem
 *
 * Tests the pure helper functions and species config logic.
 * No Babylon.js Scene dependency — only tests exported utility functions.
 *
 * Run with: npx tsx client/src/components/3DGame/AnimalNPCSystem.test.ts
 */

import { pickRandom, isTooClose, randomWanderTarget, getSpeciesConfigs } from './AnimalNPCSystem';
import type { AnimalSpecies } from './AnimalNPCSystem';

// Minimal Vector3 polyfill for tests (Babylon Vector3 requires a full engine)
class Vector3 {
  constructor(public x: number, public y: number, public z: number) {}
}

// Monkey-patch so randomWanderTarget can construct Vector3
// @ts-expect-error - global override for testing
globalThis.Vector3 = Vector3;

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

// ---------- pickRandom ----------

console.log('\n=== pickRandom ===\n');

{
  const arr = [1, 2, 3, 4, 5];
  const result = pickRandom(arr);
  assert(arr.includes(result), 'pickRandom returns element from array');
}

{
  const arr = ['only'];
  assert(pickRandom(arr) === 'only', 'pickRandom with single element returns that element');
}

// ---------- isTooClose ----------

console.log('\n=== isTooClose ===\n');

{
  const pos = new Vector3(0, 0, 0) as any;
  const avoid = [new Vector3(1, 0, 1) as any];
  assert(isTooClose(pos, avoid, 5), 'Position within minDistance is too close');
}

{
  const pos = new Vector3(0, 0, 0) as any;
  const avoid = [new Vector3(100, 0, 100) as any];
  assert(!isTooClose(pos, avoid, 5), 'Position far away is not too close');
}

{
  const pos = new Vector3(10, 0, 10) as any;
  const avoid: any[] = [];
  assert(!isTooClose(pos, avoid, 5), 'Empty avoid list means nothing is too close');
}

{
  const pos = new Vector3(0, 0, 0) as any;
  const avoid = [
    new Vector3(100, 0, 100) as any,
    new Vector3(1, 0, 0) as any,
  ];
  assert(isTooClose(pos, avoid, 3), 'Too close if ANY avoid position is within range');
}

{
  // Test exact boundary: distance = 5, minDistance = 5 → should NOT be too close (not strictly less than)
  const pos = new Vector3(0, 0, 0) as any;
  const avoid = [new Vector3(3, 0, 4) as any]; // distance = 5
  assert(!isTooClose(pos, avoid, 5), 'Exact boundary distance is not too close (strict less-than)');
}

// ---------- getSpeciesConfigs ----------

console.log('\n=== getSpeciesConfigs ===\n');

{
  const species: AnimalSpecies[] = ['cat', 'dog', 'bird'];
  for (const s of species) {
    const configs = getSpeciesConfigs(s);
    assert(configs.length > 0, `${s} has at least one config variant`);
    assert(configs.every(c => c.species === s), `All ${s} configs have correct species`);
    assert(configs.every(c => c.vocabularyWord === s), `All ${s} configs have vocabulary word '${s}'`);
    assert(configs.every(c => c.vocabularyCategory === 'animals'), `All ${s} configs are in 'animals' category`);
    assert(configs.every(c => c.speed > 0), `All ${s} configs have positive speed`);
    assert(configs.every(c => c.scale > 0), `All ${s} configs have positive scale`);
  }
}

{
  // Birds should be faster than cats
  const birdConfigs = getSpeciesConfigs('bird');
  const catConfigs = getSpeciesConfigs('cat');
  const avgBirdSpeed = birdConfigs.reduce((s, c) => s + c.speed, 0) / birdConfigs.length;
  const avgCatSpeed = catConfigs.reduce((s, c) => s + c.speed, 0) / catConfigs.length;
  assert(avgBirdSpeed > avgCatSpeed, 'Birds are faster than cats on average');
}

{
  // Dogs should be faster than cats
  const dogConfigs = getSpeciesConfigs('dog');
  const catConfigs = getSpeciesConfigs('cat');
  const avgDogSpeed = dogConfigs.reduce((s, c) => s + c.speed, 0) / dogConfigs.length;
  const avgCatSpeed = catConfigs.reduce((s, c) => s + c.speed, 0) / catConfigs.length;
  assert(avgDogSpeed > avgCatSpeed, 'Dogs are faster than cats on average');
}

// ---------- randomWanderTarget ----------

console.log('\n=== randomWanderTarget ===\n');

{
  // Note: randomWanderTarget uses Babylon's Vector3 constructor internally.
  // Since we can't easily mock that, test the function's contract instead.
  const home = { x: 50, y: 0, z: 50 } as any;
  const radius = 10;
  const sampleHeight = (x: number, _z: number) => x * 0; // flat terrain

  // Run multiple times to check bounds
  let allWithinRadius = true;
  for (let i = 0; i < 50; i++) {
    const target = randomWanderTarget(home, radius, sampleHeight);
    const dx = target.x - home.x;
    const dz = target.z - home.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > radius + 0.001) { // small epsilon for floating point
      allWithinRadius = false;
      break;
    }
  }
  assert(allWithinRadius, 'All wander targets are within radius of home');
}

{
  // Height should come from sampleHeight
  const home = { x: 0, y: 0, z: 0 } as any;
  const sampleHeight = (_x: number, _z: number) => 42;
  const target = randomWanderTarget(home, 5, sampleHeight);
  assert(target.y === 42, 'Wander target Y comes from sampleHeight');
}

// ---------- Vocabulary corpus integration ----------

console.log('\n=== Vocabulary corpus animals category ===\n');

// Dynamically import to verify the corpus has our animal words
import { VOCABULARY_CORPUS } from '../../../../shared/language/vocabulary-corpus';

{
  const animalWords = VOCABULARY_CORPUS.animals;
  assert(animalWords.length > 0, 'Animals category has entries');

  const nouns = animalWords.filter(w => w.partOfSpeech === 'noun');
  const verbs = animalWords.filter(w => w.partOfSpeech === 'verb');
  const adjectives = animalWords.filter(w => w.partOfSpeech === 'adjective');

  assert(nouns.length > 0, 'Animals category has nouns');
  assert(verbs.length > 0, 'Animals category has verbs');
  assert(adjectives.length > 0, 'Animals category has adjectives');

  // Check that our 3 main species are present
  const words = animalWords.map(w => w.english);
  assert(words.includes('cat'), 'Vocabulary includes "cat"');
  assert(words.includes('dog'), 'Vocabulary includes "dog"');
  assert(words.includes('bird'), 'Vocabulary includes "bird"');

  // Check animal-related verbs
  assert(words.includes('to fly'), 'Vocabulary includes "to fly"');
  assert(words.includes('to bark'), 'Vocabulary includes "to bark"');
  assert(words.includes('to purr'), 'Vocabulary includes "to purr"');

  // Check animal body parts
  assert(words.includes('tail'), 'Vocabulary includes "tail"');
  assert(words.includes('wing'), 'Vocabulary includes "wing"');
  assert(words.includes('feather'), 'Vocabulary includes "feather"');
  assert(words.includes('paw'), 'Vocabulary includes "paw"');

  // Check difficulty distribution
  const beginnerCount = animalWords.filter(w => w.difficulty === 'beginner').length;
  const intermediateCount = animalWords.filter(w => w.difficulty === 'intermediate').length;
  assert(beginnerCount > 0, 'Animals has beginner words');
  assert(intermediateCount > 0, 'Animals has intermediate words');
}

// ---------- Summary ----------

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) {
  process.exit(1);
}
