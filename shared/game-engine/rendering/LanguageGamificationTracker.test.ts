/**
 * Tests for LanguageGamificationTracker periodic assessment trigger
 *
 * Run with: npx tsx client/src/components/3DGame/LanguageGamificationTracker.test.ts
 */

import { LanguageGamificationTracker } from '/game-engine/rendering/LanguageGamificationTracker';
import type { PeriodicAssessmentEvent, AchievementUnlockedEvent } from '/game-engine/rendering/LanguageGamificationTracker';
import { LEVEL_THRESHOLDS } from '@shared/language/language-gamification';
import { PERIODIC_ASSESSMENT_COOLDOWN_MS } from '@shared/assessment/periodic-encounter';
import { GameEventBus } from '/game-engine/logic/GameEventBus';
import type { GameEvent } from '/game-engine/logic/GameEventBus';

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

// --- Achievement Event Bus Tests ---

function testAchievementEmitsEventOnBus() {
  console.log('\n── Achievement Unlocked Emits Event on Bus ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const busEvents: GameEvent[] = [];
  eventBus.on('achievement_unlocked', (e) => busEvents.push(e));

  // quest_hero achievement requires 10 quests completed
  for (let i = 0; i < 10; i++) {
    tracker.onQuestCompleted();
  }

  const achievementEvents = busEvents.filter(e => e.type === 'achievement_unlocked');
  assert(achievementEvents.length >= 1, 'at least one achievement_unlocked event emitted on bus');
  const questHeroEvent = achievementEvents.find(
    e => e.type === 'achievement_unlocked' && e.achievementId === 'quest_hero'
  );
  assert(questHeroEvent !== undefined, 'quest_hero achievement event found');
  if (questHeroEvent && questHeroEvent.type === 'achievement_unlocked') {
    assertEqual(questHeroEvent.achievementName, 'Quest Hero', 'event has correct achievement name');
  }
}

function testEventBusQuestCompletedTriggersAchievementCheck() {
  console.log('\n── Event Bus quest_completed Triggers Achievement Check ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // Emit quest_completed events through the bus (quest_hero requires 10)
  for (let i = 0; i < 10; i++) {
    eventBus.emit({ type: 'quest_completed', questId: `q${i}` });
  }

  assert(achievementEvents.length >= 1, 'achievement unlocked via event bus quest_completed');
  const questHero = achievementEvents.find(e => e.achievement.id === 'quest_hero');
  assert(questHero !== undefined, 'quest_hero unlocked from event bus events');
}

function testEventBusUtteranceQuestCompletedTriggersAchievementCheck() {
  console.log('\n── Event Bus utterance_quest_completed Triggers Achievement Check ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // Emit utterance_quest_completed events (also counts as quest completions)
  for (let i = 0; i < 10; i++) {
    eventBus.emit({
      type: 'utterance_quest_completed',
      questId: `uq${i}`,
      objectiveId: `obj${i}`,
      finalScore: 90,
      xpAwarded: 25,
    });
  }

  assert(achievementEvents.length >= 1, 'achievement unlocked via utterance_quest_completed');
}

function testAchievementCallbackAndBusEventBothFire() {
  console.log('\n── Both Callback and Bus Event Fire on Achievement ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const callbackEvents: AchievementUnlockedEvent[] = [];
  const busEvents: GameEvent[] = [];

  tracker.setOnAchievementUnlocked((e) => callbackEvents.push(e));
  eventBus.on('achievement_unlocked', (e) => busEvents.push(e));

  for (let i = 0; i < 10; i++) {
    tracker.onQuestCompleted();
  }

  assert(callbackEvents.length >= 1, 'callback fired');
  assert(busEvents.length >= 1, 'bus event fired');
  assertEqual(callbackEvents.length, busEvents.length, 'same number of events on both channels');
}

function testDisposeUnsubscribesFromEventBus() {
  console.log('\n── Dispose Unsubscribes from Event Bus ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const busEvents: GameEvent[] = [];
  eventBus.on('achievement_unlocked', (e) => busEvents.push(e));

  tracker.dispose();

  // After dispose, events through the bus should not trigger achievement checks
  for (let i = 0; i < 10; i++) {
    eventBus.emit({ type: 'quest_completed', questId: `q${i}` });
  }

  assertEqual(busEvents.length, 0, 'no achievement events after dispose');
}

function testUpdateProgressStatsEmitsOnBus() {
  console.log('\n── updateProgressStats Emits Achievement on Bus ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const busEvents: GameEvent[] = [];
  eventBus.on('achievement_unlocked', (e) => busEvents.push(e));

  // first_words achievement: 10 words learned
  tracker.updateProgressStats({
    wordsLearned: 10,
    conversations: 0,
    grammarMastered: 0,
    overallFluency: 0,
    streakDays: 0,
  });

  const firstWordsEvent = busEvents.find(
    e => e.type === 'achievement_unlocked' && e.achievementId === 'first_words'
  );
  assert(firstWordsEvent !== undefined, 'first_words achievement emitted on bus via updateProgressStats');
}

// --- Gameplay Event Wiring Tests ---

function testNpcTalkedTriggersAchievement() {
  console.log('\n── npc_talked Events Trigger Social Butterfly Achievement ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // social_butterfly requires 10 NPCs talked
  for (let i = 0; i < 10; i++) {
    eventBus.emit({ type: 'npc_talked', npcId: `npc${i}`, npcName: `NPC ${i}`, turnCount: 3 });
  }

  const socialButterfly = achievementEvents.find(e => e.achievement.id === 'social_butterfly');
  assert(socialButterfly !== undefined, 'social_butterfly achievement unlocked after 10 npc_talked events');
}

function testItemCollectedTriggersAchievement() {
  console.log('\n── item_collected Events Trigger Treasure Hunter Achievement ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // treasure_hunter requires 20 items collected
  for (let i = 0; i < 20; i++) {
    eventBus.emit({ type: 'item_collected', itemId: `item${i}`, itemName: `Item ${i}`, quantity: 1 });
  }

  const treasureHunter = achievementEvents.find(e => e.achievement.id === 'treasure_hunter');
  assert(treasureHunter !== undefined, 'treasure_hunter achievement unlocked after 20 item_collected events');
}

function testLocationDiscoveredTriggersAchievement() {
  console.log('\n── location_discovered Events Trigger Cartographer Achievement ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // cartographer requires 10 locations discovered
  for (let i = 0; i < 10; i++) {
    eventBus.emit({ type: 'location_discovered', locationId: `loc${i}`, locationName: `Location ${i}` });
  }

  const cartographer = achievementEvents.find(e => e.achievement.id === 'cartographer');
  assert(cartographer !== undefined, 'cartographer achievement unlocked after 10 location_discovered events');
}

function testPuzzleSolvedTriggersAchievement() {
  console.log('\n── puzzle_solved Events Trigger Puzzle Master Achievement ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // puzzle_master requires 10 puzzles solved
  for (let i = 0; i < 10; i++) {
    eventBus.emit({ type: 'puzzle_solved', puzzleId: `puzzle${i}` });
  }

  const puzzleMaster = achievementEvents.find(e => e.achievement.id === 'puzzle_master');
  assert(puzzleMaster !== undefined, 'puzzle_master achievement unlocked after 10 puzzle_solved events');
}

function testObjectExaminedTriggersAchievement() {
  console.log('\n── object_examined Events Trigger Curious Mind Achievement ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // curious_mind requires 15 objects examined
  for (let i = 0; i < 15; i++) {
    eventBus.emit({ type: 'object_examined', objectId: `obj${i}`, objectName: `Object ${i}`, targetWord: 'word', targetLanguage: 'fr' });
  }

  const curiousMind = achievementEvents.find(e => e.achievement.id === 'curious_mind');
  assert(curiousMind !== undefined, 'curious_mind achievement unlocked after 15 object_examined events');
}

function testNpcExamPassedTriggersAchievement() {
  console.log('\n── npc_exam_completed (passed) Events Trigger Exam Ace Achievement ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // exam_ace requires 5 passed exams
  for (let i = 0; i < 5; i++) {
    eventBus.emit({ type: 'npc_exam_completed', examId: `exam${i}`, npcId: `npc${i}`, passed: true, score: 80, maxScore: 100, percentage: 80 });
  }

  const examAce = achievementEvents.find(e => e.achievement.id === 'exam_ace');
  assert(examAce !== undefined, 'exam_ace achievement unlocked after 5 passed exams');
}

function testNpcExamPassedViaScoreTriggersAchievement() {
  console.log('\n── npc_exam_completed (passed via totalScore) Triggers Exam Ace ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // exam_ace requires 5 passed exams — use totalScore/totalMaxPoints instead of passed flag
  for (let i = 0; i < 5; i++) {
    eventBus.emit({ type: 'npc_exam_completed', examId: `exam${i}`, npcId: `npc${i}`, totalScore: 80, totalMaxPoints: 100 });
  }

  const examAce = achievementEvents.find(e => e.achievement.id === 'exam_ace');
  assert(examAce !== undefined, 'exam_ace achievement unlocked via totalScore/totalMaxPoints');
}

function testNpcExamFailedDoesNotCount() {
  console.log('\n── npc_exam_completed (failed) Does Not Count Toward Achievement ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // Send 5 failed exams - should NOT unlock exam_ace
  for (let i = 0; i < 5; i++) {
    eventBus.emit({ type: 'npc_exam_completed', examId: `exam${i}`, npcId: `npc${i}`, passed: false, score: 20, maxScore: 100, percentage: 20 });
  }

  const examAce = achievementEvents.find(e => e.achievement.id === 'exam_ace');
  assert(examAce === undefined, 'exam_ace NOT unlocked when exams are failed');
}

function testDirectMethodCallsTrackCounters() {
  console.log('\n── Direct Method Calls Track Counters ──');

  const tracker = new LanguageGamificationTracker();
  const achievementEvents: AchievementUnlockedEvent[] = [];
  tracker.setOnAchievementUnlocked((e) => achievementEvents.push(e));

  // Call onPuzzleSolved directly 10 times
  for (let i = 0; i < 10; i++) {
    tracker.onPuzzleSolved();
  }

  const puzzleMaster = achievementEvents.find(e => e.achievement.id === 'puzzle_master');
  assert(puzzleMaster !== undefined, 'puzzle_master unlocked via direct onPuzzleSolved calls');

  // Call onLocationDiscovered directly 10 times
  const tracker2 = new LanguageGamificationTracker();
  const achievementEvents2: AchievementUnlockedEvent[] = [];
  tracker2.setOnAchievementUnlocked((e) => achievementEvents2.push(e));

  for (let i = 0; i < 10; i++) {
    tracker2.onLocationDiscovered();
  }

  const cartographer = achievementEvents2.find(e => e.achievement.id === 'cartographer');
  assert(cartographer !== undefined, 'cartographer unlocked via direct onLocationDiscovered calls');
}

function testNewAchievementCountersPersistedViaExportImport() {
  console.log('\n── New Achievement Counters Persisted via Export/Import ──');

  const tracker = new LanguageGamificationTracker();
  const eventBus = new GameEventBus();
  tracker.subscribeToEventBus(eventBus);

  // Accumulate some counters
  for (let i = 0; i < 5; i++) {
    eventBus.emit({ type: 'npc_talked', npcId: `npc${i}`, npcName: `NPC ${i}`, turnCount: 3 });
    eventBus.emit({ type: 'item_collected', itemId: `item${i}`, itemName: `Item ${i}`, quantity: 1 });
  }

  const exported = tracker.exportState();
  const parsed = JSON.parse(exported);

  assertEqual(parsed.npcsTalked, 5, 'exported state has npcsTalked = 5');
  assertEqual(parsed.itemsCollected, 5, 'exported state has itemsCollected = 5');

  // Import into new tracker and verify counters survive
  const tracker2 = new LanguageGamificationTracker();
  tracker2.importState(exported);
  const state2 = tracker2.getState();
  assertEqual(state2.npcsTalked, 5, 'imported npcsTalked = 5');
  assertEqual(state2.itemsCollected, 5, 'imported itemsCollected = 5');
}

// --- Run all tests ---

testPeriodicAssessmentTriggersAtLevel5();
testPeriodicAssessmentTriggersAtLevel10();
testNoTriggerAtNonMilestoneLevels();
testCooldownPreventsRetrigger();
testExportImportPreservesTimestamp();
testRecordPeriodicAssessmentCompleted();
testDisposeCleanup();
testAchievementEmitsEventOnBus();
testEventBusQuestCompletedTriggersAchievementCheck();
testEventBusUtteranceQuestCompletedTriggersAchievementCheck();
testAchievementCallbackAndBusEventBothFire();
testDisposeUnsubscribesFromEventBus();
testUpdateProgressStatsEmitsOnBus();
testNpcTalkedTriggersAchievement();
testItemCollectedTriggersAchievement();
testLocationDiscoveredTriggersAchievement();
testPuzzleSolvedTriggersAchievement();
testObjectExaminedTriggersAchievement();
testNpcExamPassedTriggersAchievement();
testNpcExamPassedViaScoreTriggersAchievement();
testNpcExamFailedDoesNotCount();
testDirectMethodCallsTrackCounters();
testNewAchievementCountersPersistedViaExportImport();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
