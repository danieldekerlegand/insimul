/**
 * Tests for Periodic Encounter Definition and Level-Up Trigger
 *
 * Run with: npx tsx shared/assessment/periodic-encounter.test.ts
 */

import {
  PERIODIC_ENCOUNTER,
  PERIODIC_ASSESSMENT_LEVELS,
  PERIODIC_ASSESSMENT_COOLDOWN_MS,
  isPeriodicAssessmentLevel,
  isPeriodicAssessmentCooldownMet,
} from './periodic-encounter';

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

function assertEqual<T>(actual: T, expected: T, message: string) {
  assert(actual === expected, `${message} (expected ${expected}, got ${actual})`);
}

// --- Periodic Encounter Definition ---

function testEncounterDefinition() {
  console.log('\n── Periodic Encounter Definition ──');

  assertEqual(PERIODIC_ENCOUNTER.id, 'periodic_assessment', 'has correct id');
  assertEqual(PERIODIC_ENCOUNTER.type, 'periodic', 'has type periodic');
  assertEqual(PERIODIC_ENCOUNTER.totalMaxPoints, 25, 'total max points is 25');
  assertEqual(PERIODIC_ENCOUNTER.timeLimitSeconds, 300, 'time limit is 5 minutes (300s)');
  assertEqual(PERIODIC_ENCOUNTER.phases.length, 1, 'has exactly 1 phase');

  const phase = PERIODIC_ENCOUNTER.phases[0];
  assertEqual(phase.type, 'conversation', 'phase is conversation');
  assertEqual(phase.maxScore, 25, 'phase max score is 25');
  assertEqual(phase.tasks.length, 1, 'phase has exactly 1 task');

  const task = phase.tasks[0];
  assertEqual(task.maxScore, 25, 'task max score is 25');
  assertEqual(task.scoringDimensions.length, 5, 'has 5 scoring dimensions');

  const dimensionIds = task.scoringDimensions.map(d => d.id);
  assert(dimensionIds.includes('accuracy'), 'has accuracy dimension');
  assert(dimensionIds.includes('fluency'), 'has fluency dimension');
  assert(dimensionIds.includes('vocabulary'), 'has vocabulary dimension');
  assert(dimensionIds.includes('comprehension'), 'has comprehension dimension');
  assert(dimensionIds.includes('pragmatics'), 'has pragmatics dimension');

  const totalDimensionScore = task.scoringDimensions.reduce((s, d) => s + d.maxScore, 0);
  assertEqual(totalDimensionScore, 25, 'dimension scores sum to 25');

  assert(task.prompt.includes('{{targetLanguage}}'), 'prompt includes targetLanguage template');
  assert(task.prompt.includes('{{cityName}}'), 'prompt includes cityName template');
}

// --- isPeriodicAssessmentLevel ---

function testIsPeriodicAssessmentLevel() {
  console.log('\n── isPeriodicAssessmentLevel ──');

  assert(isPeriodicAssessmentLevel(5), 'level 5 is a milestone');
  assert(isPeriodicAssessmentLevel(10), 'level 10 is a milestone');
  assert(isPeriodicAssessmentLevel(15), 'level 15 is a milestone');
  assert(isPeriodicAssessmentLevel(20), 'level 20 is a milestone');

  assert(!isPeriodicAssessmentLevel(1), 'level 1 is not a milestone');
  assert(!isPeriodicAssessmentLevel(4), 'level 4 is not a milestone');
  assert(!isPeriodicAssessmentLevel(6), 'level 6 is not a milestone');
  assert(!isPeriodicAssessmentLevel(11), 'level 11 is not a milestone');
  assert(!isPeriodicAssessmentLevel(0), 'level 0 is not a milestone');
  assert(!isPeriodicAssessmentLevel(25), 'level 25 is not a milestone');
}

// --- isPeriodicAssessmentCooldownMet ---

function testCooldown() {
  console.log('\n── isPeriodicAssessmentCooldownMet ──');

  assert(isPeriodicAssessmentCooldownMet(null), 'null timestamp means cooldown is met');

  const now = Date.now();

  assert(
    isPeriodicAssessmentCooldownMet(now - PERIODIC_ASSESSMENT_COOLDOWN_MS - 1, now),
    'cooldown met when more than 60min has passed',
  );

  assert(
    isPeriodicAssessmentCooldownMet(now - PERIODIC_ASSESSMENT_COOLDOWN_MS, now),
    'cooldown met when exactly 60min has passed',
  );

  assert(
    !isPeriodicAssessmentCooldownMet(now - PERIODIC_ASSESSMENT_COOLDOWN_MS + 1000, now),
    'cooldown NOT met when less than 60min has passed',
  );

  assert(
    !isPeriodicAssessmentCooldownMet(now, now),
    'cooldown NOT met when timestamp is now',
  );

  assert(
    !isPeriodicAssessmentCooldownMet(now - 30 * 60 * 1000, now),
    'cooldown NOT met after only 30 minutes',
  );
}

// --- PERIODIC_ASSESSMENT_LEVELS constant ---

function testConstants() {
  console.log('\n── Constants ──');

  assertEqual(PERIODIC_ASSESSMENT_LEVELS.length, 4, 'has 4 milestone levels');
  assertEqual(PERIODIC_ASSESSMENT_COOLDOWN_MS, 3600000, 'cooldown is 60 minutes in ms');
}

// --- Run all tests ---

testEncounterDefinition();
testIsPeriodicAssessmentLevel();
testCooldown();
testConstants();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
