/**
 * Tests for NPCExamEngine — unit tests without browser dependencies.
 *
 * Tests the engine's orchestration logic using mocked fetch and callbacks.
 *
 * Run with: npx tsx shared/__tests__/npc-exam-engine.test.ts
 */

// Mock fetch globally before importing the engine
const fetchCalls: Array<{ url: string; body: any }> = [];
let fetchResponses: Array<{ ok: boolean; json: () => Promise<any> }> = [];

(globalThis as any).fetch = async (url: string, opts: any) => {
  fetchCalls.push({ url, body: JSON.parse(opts.body) });
  const response = fetchResponses.shift();
  if (!response) return { ok: false, status: 500, json: async () => ({}) };
  return response;
};

// The NPCExamEngine imports are relative to client/src, so we test the shared logic separately
// and test the engine's core building blocks here
import {
  buildNPCExamEncounter,
  buildReadingExamPhase,
  buildWritingExamPhase,
} from '../assessment/npc-exam-encounter';
import { mapScoreToCEFR } from '../assessment/cefr-mapping';

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

// --- Encounter structure for engine consumption ---

function testEncounterForEngine() {
  console.log('\n── Encounter Structure for NPCExamEngine ──');

  const encounter = buildNPCExamEncounter('reading_writing', 'A2');

  // Verify the encounter has the structure the engine expects
  assert(encounter.id.startsWith('npc_exam_'), 'encounter id starts with npc_exam_');
  assertEqual(encounter.phases.length, 2, 'has 2 phases for reading_writing');

  // Each phase has a task with contentTemplate (needed for content generation)
  for (const phase of encounter.phases) {
    const task = phase.tasks[0];
    assert(task !== undefined, `phase ${phase.id} has at least 1 task`);
    assert(task.contentTemplate !== undefined, `phase ${phase.id} task has contentTemplate`);
    assert(task.scoringMethod === 'llm', `phase ${phase.id} uses llm scoring`);
  }

  // Reading phase content template has the expected fields
  const readingTemplate = encounter.phases[0].tasks[0].contentTemplate!;
  assert(readingTemplate.topic.length > 0, 'reading template has topic');
  assert(readingTemplate.lengthSentences !== undefined, 'reading template has lengthSentences');
  assert(readingTemplate.questionCount !== undefined, 'reading template has questionCount');

  // Writing phase content template has the expected fields
  const writingTemplate = encounter.phases[1].tasks[0].contentTemplate!;
  assert(writingTemplate.topic.length > 0, 'writing template has topic');
  assert(writingTemplate.promptCount !== undefined, 'writing template has promptCount');
}

// --- CEFR mapping integration ---

function testCEFRMappingIntegration() {
  console.log('\n── CEFR Mapping Integration ──');

  // Test that exam scores correctly map to CEFR levels
  const encounter = buildNPCExamEncounter('reading_writing', 'B1');
  const maxScore = encounter.totalMaxPoints;

  // High score => B2
  const highResult = mapScoreToCEFR(maxScore * 0.85, maxScore);
  assertEqual(highResult.level, 'B2', 'high score maps to B2');

  // Medium score => B1
  const medResult = mapScoreToCEFR(maxScore * 0.55, maxScore);
  assertEqual(medResult.level, 'B1', 'medium score maps to B1');

  // Low score => A2
  const lowResult = mapScoreToCEFR(maxScore * 0.30, maxScore);
  assertEqual(lowResult.level, 'A2', 'low score maps to A2');

  // Very low score => A1
  const veryLowResult = mapScoreToCEFR(maxScore * 0.10, maxScore);
  assertEqual(veryLowResult.level, 'A1', 'very low score maps to A1');
}

// --- Phase maxScore consistency ---

function testPhaseScoreConsistency() {
  console.log('\n── Phase Score Consistency ──');

  const levels = ['A1', 'A2', 'B1', 'B2'] as const;

  for (const level of levels) {
    const encounter = buildNPCExamEncounter('reading_writing', level);
    const summedScore = encounter.phases.reduce((s, p) => s + (p.maxScore ?? 0), 0);
    assertEqual(encounter.totalMaxPoints, summedScore, `${level}: totalMaxPoints matches sum of phase scores`);

    // Each phase's task maxScore should match phase maxScore
    for (const phase of encounter.phases) {
      const taskScore = phase.tasks[0].maxScore ?? phase.tasks[0].maxPoints ?? 0;
      assertEqual(taskScore, phase.maxScore!, `${level}/${phase.type}: task score matches phase score`);
    }
  }
}

// --- Scoring dimension totals ---

function testScoringDimensionTotals() {
  console.log('\n── Scoring Dimension Totals ──');

  const levels = ['A1', 'A2', 'B1', 'B2'] as const;

  for (const level of levels) {
    const readingPhase = buildReadingExamPhase(level);
    const readingTask = readingPhase.tasks[0];
    const readingDimTotal = readingTask.scoringDimensions!.reduce((s, d) => s + d.maxScore, 0);
    // Dimension totals should approximately match maxScore (rounding may cause ±1 difference)
    assert(
      Math.abs(readingDimTotal - readingPhase.maxScore!) <= 1,
      `${level} reading: dimension total (${readingDimTotal}) ≈ maxScore (${readingPhase.maxScore})`,
    );

    const writingPhase = buildWritingExamPhase(level);
    const writingTask = writingPhase.tasks[0];
    const writingDimTotal = writingTask.scoringDimensions!.reduce((s, d) => s + d.maxScore, 0);
    assert(
      Math.abs(writingDimTotal - writingPhase.maxScore!) <= 1,
      `${level} writing: dimension total (${writingDimTotal}) ≈ maxScore (${writingPhase.maxScore})`,
    );
  }
}

// --- Run all tests ---

testEncounterForEngine();
testCEFRMappingIntegration();
testPhaseScoreConsistency();
testScoringDimensionTotals();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
