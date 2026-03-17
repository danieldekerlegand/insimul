/**
 * Tests for NPC Exam Encounter Definitions
 *
 * Run with: npx tsx shared/assessment/npc-exam-encounter.test.ts
 */

import {
  buildNPCExamEncounter,
  buildReadingExamPhase,
  buildWritingExamPhase,
  shouldTriggerNPCExam,
  NPC_EXAM_QUEST_INTERVAL,
  NPC_EXAM_TIME_INTERVAL_MS,
  type NPCExamType,
  type BusinessContext,
} from './npc-exam-encounter';
import type { CEFRLevel } from './assessment-types';

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

// --- Reading Phase Builder ---

function testReadingPhaseBuilder() {
  console.log('\n── buildReadingExamPhase ──');

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

  for (const level of cefrLevels) {
    const phase = buildReadingExamPhase(level);
    assertEqual(phase.id, 'npc_exam_reading', `${level}: has correct id`);
    assertEqual(phase.type, 'reading', `${level}: has reading type`);
    assert(phase.maxScore! > 0, `${level}: has positive maxScore`);
    assertEqual(phase.tasks.length, 1, `${level}: has exactly 1 task`);

    const task = phase.tasks[0];
    assertEqual(task.type, 'reading_comprehension', `${level}: task type is reading_comprehension`);
    assert(task.contentTemplate !== undefined, `${level}: has content template`);
    assert(task.scoringDimensions!.length === 3, `${level}: has 3 scoring dimensions`);
  }

  // A1 should be easier than B2
  const a1Phase = buildReadingExamPhase('A1');
  const b2Phase = buildReadingExamPhase('B2');
  assert(a1Phase.maxScore! < b2Phase.maxScore!, 'A1 maxScore < B2 maxScore');
  assert(
    a1Phase.tasks[0].contentTemplate!.lengthSentences! < b2Phase.tasks[0].contentTemplate!.lengthSentences!,
    'A1 has fewer sentences than B2',
  );
}

// --- Writing Phase Builder ---

function testWritingPhaseBuilder() {
  console.log('\n── buildWritingExamPhase ──');

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

  for (const level of cefrLevels) {
    const phase = buildWritingExamPhase(level);
    assertEqual(phase.id, 'npc_exam_writing', `${level}: has correct id`);
    assertEqual(phase.type, 'writing', `${level}: has writing type`);
    assert(phase.maxScore! > 0, `${level}: has positive maxScore`);
    assertEqual(phase.tasks.length, 1, `${level}: has exactly 1 task`);

    const task = phase.tasks[0];
    assertEqual(task.type, 'writing_prompt', `${level}: task type is writing_prompt`);
    assert(task.contentTemplate !== undefined, `${level}: has content template`);
    assert(task.scoringDimensions!.length === 3, `${level}: has 3 scoring dimensions`);
  }

  // A1 has 1 prompt, A2+ have 2
  const a1Phase = buildWritingExamPhase('A1');
  const a2Phase = buildWritingExamPhase('A2');
  assertEqual(a1Phase.tasks[0].contentTemplate!.promptCount, 1, 'A1 has 1 writing prompt');
  assertEqual(a2Phase.tasks[0].contentTemplate!.promptCount, 2, 'A2 has 2 writing prompts');
}

// --- Business Context Variants ---

function testBusinessContext() {
  console.log('\n── Business Context ──');

  const contexts: BusinessContext[] = ['restaurant', 'shop', 'school', 'market', 'general'];

  for (const ctx of contexts) {
    const readingPhase = buildReadingExamPhase('A2', ctx);
    const writingPhase = buildWritingExamPhase('A2', ctx);

    assert(readingPhase.tasks[0].contentTemplate!.topic.length > 0, `reading ${ctx}: has non-empty topic`);
    assert(writingPhase.tasks[0].contentTemplate!.topic.length > 0, `writing ${ctx}: has non-empty topic`);
  }

  // Business context should override default topic
  const restaurantReading = buildReadingExamPhase('A2', 'restaurant');
  const generalReading = buildReadingExamPhase('A2', 'general');
  assert(
    restaurantReading.tasks[0].contentTemplate!.topic !== generalReading.tasks[0].contentTemplate!.topic,
    'restaurant topic differs from general topic',
  );
}

// --- Encounter Builder ---

function testEncounterBuilder() {
  console.log('\n── buildNPCExamEncounter ──');

  // Reading-only exam
  const readingExam = buildNPCExamEncounter('reading', 'A2');
  assertEqual(readingExam.phases.length, 1, 'reading exam has 1 phase');
  assertEqual(readingExam.phases[0].type, 'reading', 'reading exam phase is reading');
  assert(readingExam.totalMaxPoints > 0, 'reading exam has positive totalMaxPoints');
  assert(readingExam.name.includes('Reading'), 'reading exam name contains "Reading"');

  // Writing-only exam
  const writingExam = buildNPCExamEncounter('writing', 'B1');
  assertEqual(writingExam.phases.length, 1, 'writing exam has 1 phase');
  assertEqual(writingExam.phases[0].type, 'writing', 'writing exam phase is writing');
  assert(writingExam.name.includes('Writing'), 'writing exam name contains "Writing"');

  // Combined exam
  const combinedExam = buildNPCExamEncounter('reading_writing', 'B2');
  assertEqual(combinedExam.phases.length, 2, 'combined exam has 2 phases');
  assertEqual(combinedExam.phases[0].type, 'reading', 'combined exam first phase is reading');
  assertEqual(combinedExam.phases[1].type, 'writing', 'combined exam second phase is writing');
  assert(combinedExam.name.includes('Reading & Writing'), 'combined exam name contains "Reading & Writing"');

  // totalMaxPoints should match sum of phase scores
  const expectedTotal = combinedExam.phases.reduce((s, p) => s + (p.maxScore ?? 0), 0);
  assertEqual(combinedExam.totalMaxPoints, expectedTotal, 'totalMaxPoints matches sum of phase maxScores');

  // All CEFR levels produce valid encounters
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
  const examTypes: NPCExamType[] = ['reading', 'writing', 'reading_writing'];
  for (const level of levels) {
    for (const examType of examTypes) {
      const enc = buildNPCExamEncounter(examType, level);
      assert(enc.totalMaxPoints > 0, `${examType}/${level}: valid encounter`);
    }
  }
}

// --- Trigger Logic ---

function testShouldTriggerNPCExam() {
  console.log('\n── shouldTriggerNPCExam ──');

  // Quest-based triggers
  assert(shouldTriggerNPCExam(5, null), 'triggers at 5 quests');
  assert(shouldTriggerNPCExam(10, null), 'triggers at 10 quests');
  assert(shouldTriggerNPCExam(15, null), 'triggers at 15 quests');
  assert(!shouldTriggerNPCExam(3, null), 'does not trigger at 3 quests');
  assert(!shouldTriggerNPCExam(7, null), 'does not trigger at 7 quests');
  assert(!shouldTriggerNPCExam(0, null), 'does not trigger at 0 quests');

  // Time-based triggers
  const now = Date.now();
  assert(
    shouldTriggerNPCExam(3, now - NPC_EXAM_TIME_INTERVAL_MS - 1, now),
    'triggers when time interval exceeded (quest count non-milestone)',
  );
  assert(
    !shouldTriggerNPCExam(3, now - 1000, now),
    'does not trigger when time interval not reached',
  );
  assert(
    !shouldTriggerNPCExam(3, null, now),
    'does not trigger with null timestamp and non-milestone quests',
  );

  // Combined: quest milestone overrides time
  assert(
    shouldTriggerNPCExam(5, now - 1000, now),
    'quest milestone triggers even if time interval not met',
  );
}

// --- Constants ---

function testConstants() {
  console.log('\n── Constants ──');

  assertEqual(NPC_EXAM_QUEST_INTERVAL, 5, 'quest interval is 5');
  assertEqual(NPC_EXAM_TIME_INTERVAL_MS, 30 * 60 * 1000, 'time interval is 30 minutes in ms');
}

// --- Run all tests ---

testReadingPhaseBuilder();
testWritingPhaseBuilder();
testBusinessContext();
testEncounterBuilder();
testShouldTriggerNPCExam();
testConstants();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
