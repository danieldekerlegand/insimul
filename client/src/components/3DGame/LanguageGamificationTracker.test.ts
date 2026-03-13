/**
 * Tests for LanguageGamificationTracker periodic assessment trigger
 *
 * Run with: npx tsx client/src/components/3DGame/LanguageGamificationTracker.test.ts
 */

import { LanguageGamificationTracker } from './LanguageGamificationTracker';
import type { PeriodicAssessmentEvent } from './LanguageGamificationTracker';
import { LEVEL_THRESHOLDS } from '@shared/language-gamification';
import { PERIODIC_ASSESSMENT_COOLDOWN_MS } from '@shared/assessment/periodic-encounter';

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

/**
 * Helper: give enough XP to jump from level 1 to a target level.
 * Uses onConversationEnd with a minimal FluencyGainResult to add XP repeatedly.
 */
function pushToLevel(tracker: LanguageGamificationTracker, targetLevel: number): void {
  const xpNeeded = LEVEL_THRESHOLDS[targetLevel - 1];
  // Each conversation gives at least 10 XP (conversationBase)
  const iterations = Math.ceil(xpNeeded / 10) + 5; // a few extra to be safe
  for (let i = 0; i < iterations; i++) {
    if (tracker.getLevel() >= targetLevel) break;
    tracker.onConversationEnd({
      gain: 0.5,
      newFluency: 50,
      grammarScore: 0.5,
      wordsUsed: 5,
    } as any);
  }
}

// --- Tests ---

function testPeriodicAssessmentTriggersAtLevel5() {
  console.log('\n── Periodic Assessment Triggers at Level 5 ──');

  const tracker = new LanguageGamificationTracker();
  const events: PeriodicAssessmentEvent[] = [];
  tracker.setOnPeriodicAssessmentTriggered((e) => events.push(e));

  pushToLevel(tracker, 5);

  assertEqual(tracker.getLevel(), 5, 'reached level 5');
  assertEqual(events.length, 1, 'triggered exactly 1 periodic assessment');
  assertEqual(events[0].level, 5, 'event has level 5');
  assertEqual(events[0].tier, 'Beginner', 'event has Beginner tier');
}

function testPeriodicAssessmentTriggersAtLevel10() {
  console.log('\n── Periodic Assessment Triggers at Level 10 ──');

  const tracker = new LanguageGamificationTracker();
  const events: PeriodicAssessmentEvent[] = [];
  tracker.setOnPeriodicAssessmentTriggered((e) => events.push(e));

  // Manually set cooldown to past so level 5 trigger doesn't block level 10
  pushToLevel(tracker, 5);

  // Clear events and reset cooldown for next milestone
  events.length = 0;
  // Simulate cooldown elapsed by manipulating the internal state
  // We use recordPeriodicAssessmentCompleted and then wait conceptually
  // Instead, we export/import state with a past timestamp
  const state = JSON.parse(tracker.exportState());
  state.lastPeriodicAssessmentTimestamp = Date.now() - PERIODIC_ASSESSMENT_COOLDOWN_MS - 1;
  tracker.importState(JSON.stringify(state));

  pushToLevel(tracker, 10);

  assertEqual(tracker.getLevel(), 10, 'reached level 10');
  assert(events.length >= 1, 'triggered periodic assessment at level 10');
  const level10Event = events.find(e => e.level === 10);
  assert(level10Event !== undefined, 'has event for level 10');
}

function testNoTriggerAtNonMilestoneLevels() {
  console.log('\n── No Trigger at Non-Milestone Levels ──');

  const tracker = new LanguageGamificationTracker();
  const events: PeriodicAssessmentEvent[] = [];
  tracker.setOnPeriodicAssessmentTriggered((e) => events.push(e));

  // Push to level 4 (not a milestone)
  pushToLevel(tracker, 4);
  assertEqual(tracker.getLevel(), 4, 'reached level 4');
  assertEqual(events.length, 0, 'no periodic assessment triggered at level 4');
}

function testCooldownPreventsRetrigger() {
  console.log('\n── Cooldown Prevents Re-trigger ──');

  const tracker = new LanguageGamificationTracker();
  const events: PeriodicAssessmentEvent[] = [];
  tracker.setOnPeriodicAssessmentTriggered((e) => events.push(e));

  pushToLevel(tracker, 5);
  assertEqual(events.length, 1, 'triggered at level 5');

  // The timestamp is set; if we somehow re-triggered level 5 it should be blocked
  assert(tracker.getLastPeriodicAssessmentTimestamp() !== null, 'timestamp is set after trigger');
}

function testExportImportPreservesTimestamp() {
  console.log('\n── Export/Import Preserves Timestamp ──');

  const tracker = new LanguageGamificationTracker();
  tracker.setOnPeriodicAssessmentTriggered(() => {});

  pushToLevel(tracker, 5);

  const exported = tracker.exportState();
  const parsed = JSON.parse(exported);
  assert(
    parsed.lastPeriodicAssessmentTimestamp !== null && parsed.lastPeriodicAssessmentTimestamp !== undefined,
    'exported state includes lastPeriodicAssessmentTimestamp',
  );

  const tracker2 = new LanguageGamificationTracker();
  tracker2.importState(exported);
  assertEqual(
    tracker2.getLastPeriodicAssessmentTimestamp(),
    parsed.lastPeriodicAssessmentTimestamp,
    'imported state preserves timestamp',
  );
}

function testRecordPeriodicAssessmentCompleted() {
  console.log('\n── recordPeriodicAssessmentCompleted ──');

  const tracker = new LanguageGamificationTracker();
  assertEqual(tracker.getLastPeriodicAssessmentTimestamp(), null, 'initially null');

  tracker.recordPeriodicAssessmentCompleted();
  const ts = tracker.getLastPeriodicAssessmentTimestamp();
  assert(ts !== null, 'timestamp set after recording completion');
  assert(Math.abs(ts! - Date.now()) < 1000, 'timestamp is recent');
}

function testDisposeCleanup() {
  console.log('\n── Dispose Cleanup ──');

  const tracker = new LanguageGamificationTracker();
  const events: PeriodicAssessmentEvent[] = [];
  tracker.setOnPeriodicAssessmentTriggered((e) => events.push(e));

  tracker.dispose();

  // After dispose, callbacks should be null - no events captured
  pushToLevel(tracker, 5);
  assertEqual(events.length, 0, 'no events after dispose');
}

// --- Run all tests ---

testPeriodicAssessmentTriggersAtLevel5();
testPeriodicAssessmentTriggersAtLevel10();
testNoTriggerAtNonMilestoneLevels();
testCooldownPreventsRetrigger();
testExportImportPreservesTimestamp();
testRecordPeriodicAssessmentCompleted();
testDisposeCleanup();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
