/**
 * Tests for QuestCompletionEngine
 *
 * Pure-logic tests — no Babylon.js mocks needed since the engine has zero
 * rendering dependencies.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../QuestCompletionEngine';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string }): CompletionObjective {
  return {
    description: 'test objective',
    completed: false,
    ...overrides,
  };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('QuestCompletionEngine', () => {
  let engine: QuestCompletionEngine;
  let objectiveCompletedSpy: ReturnType<typeof vi.fn>;
  let questCompletedSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    engine = new QuestCompletionEngine();
    objectiveCompletedSpy = vi.fn();
    questCompletedSpy = vi.fn();
    engine.setOnObjectiveCompleted(objectiveCompletedSpy);
    engine.setOnQuestCompleted(questCompletedSpy);
  });

  // ── Quest management ────────────────────────────────────────────────────

  describe('quest management', () => {
    it('adds and retrieves quests', () => {
      const quest = makeQuest('q1', []);
      engine.addQuest(quest);
      expect(engine.getQuests()).toHaveLength(1);
      expect(engine.getQuests()[0].id).toBe('q1');
    });

    it('removes quests', () => {
      engine.addQuest(makeQuest('q1', []));
      engine.addQuest(makeQuest('q2', []));
      engine.removeQuest('q1');
      expect(engine.getQuests()).toHaveLength(1);
      expect(engine.getQuests()[0].id).toBe('q2');
    });

    it('clears all quests', () => {
      engine.addQuest(makeQuest('q1', []));
      engine.addQuest(makeQuest('q2', []));
      engine.clear();
      expect(engine.getQuests()).toHaveLength(0);
    });
  });

  // ── completeObjective ───────────────────────────────────────────────────

  describe('completeObjective', () => {
    it('marks objective as completed and fires callback', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' });
      engine.addQuest(makeQuest('q1', [obj]));

      const result = engine.completeObjective('q1', 'o1');

      expect(result).toBe(true);
      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });

    it('fires quest completed when all objectives done', () => {
      const o1 = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', completed: true });
      const o2 = makeObjective({ id: 'o2', questId: 'q1', type: 'collect_item' });
      engine.addQuest(makeQuest('q1', [o1, o2]));

      engine.completeObjective('q1', 'o2');

      expect(questCompletedSpy).toHaveBeenCalledWith('q1');
    });

    it('does not fire quest completed when some objectives remain', () => {
      const o1 = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' });
      const o2 = makeObjective({ id: 'o2', questId: 'q1', type: 'collect_item' });
      engine.addQuest(makeQuest('q1', [o1, o2]));

      engine.completeObjective('q1', 'o1');

      expect(questCompletedSpy).not.toHaveBeenCalled();
    });

    it('returns false for unknown quest', () => {
      expect(engine.completeObjective('unknown', 'o1')).toBe(false);
    });

    it('returns false for already-completed objective', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', completed: true });
      engine.addQuest(makeQuest('q1', [obj]));

      expect(engine.completeObjective('q1', 'o1')).toBe(false);
    });
  });

  // ── trackNPCConversation ────────────────────────────────────────────────

  describe('trackNPCConversation', () => {
    it('completes talk_to_npc objective when NPC matches', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackNPCConversation('npc-1');

      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });

    it('does not complete when NPC does not match', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackNPCConversation('npc-2');

      expect(obj.completed).toBe(false);
    });

    it('filters by questId when provided', () => {
      const o1 = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1' });
      const o2 = makeObjective({ id: 'o2', questId: 'q2', type: 'talk_to_npc', npcId: 'npc-1' });
      engine.addQuest(makeQuest('q1', [o1]));
      engine.addQuest(makeQuest('q2', [o2]));

      engine.trackNPCConversation('npc-1', 'q1');

      expect(o1.completed).toBe(true);
      expect(o2.completed).toBe(false);
    });
  });

  // ── trackVocabularyUsage ────────────────────────────────────────────────

  describe('trackVocabularyUsage', () => {
    it('increments count and completes when threshold met', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'use_vocabulary',
        requiredCount: 2, currentCount: 0,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackVocabularyUsage('hello');
      expect(obj.currentCount).toBe(1);
      expect(obj.completed).toBe(false);

      engine.trackVocabularyUsage('world');
      expect(obj.currentCount).toBe(2);
      expect(obj.completed).toBe(true);
    });

    it('does not double-count the same word', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'use_vocabulary',
        requiredCount: 3, currentCount: 0,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackVocabularyUsage('hello');
      engine.trackVocabularyUsage('hello');
      engine.trackVocabularyUsage('HELLO');

      expect(obj.currentCount).toBe(1);
    });

    it('only counts words in targetWords when specified', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'use_vocabulary',
        targetWords: ['bonjour'], requiredCount: 1, currentCount: 0,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackVocabularyUsage('hello');
      expect(obj.currentCount).toBe(0);

      engine.trackVocabularyUsage('bonjour');
      expect(obj.currentCount).toBe(1);
      expect(obj.completed).toBe(true);
    });

    it('handles collect_vocabulary type', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_vocabulary',
        requiredCount: 1, currentCount: 0,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackVocabularyUsage('word');
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackConversationTurn ───────────────────────────────────────────────

  describe('trackConversationTurn', () => {
    it('increments and completes at threshold', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'complete_conversation',
        requiredCount: 3, currentCount: 0,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackConversationTurn([]);
      engine.trackConversationTurn([]);
      expect(obj.completed).toBe(false);

      engine.trackConversationTurn([]);
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackCollectedItemByName ────────────────────────────────────────────

  describe('trackCollectedItemByName', () => {
    it('completes when item name matches (case-insensitive)', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item',
        itemName: 'Magic Scroll',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackCollectedItemByName('magic scroll');
      expect(obj.completed).toBe(true);
    });

    it('does not complete for non-matching item', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item',
        itemName: 'Magic Scroll',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackCollectedItemByName('health potion');
      expect(obj.completed).toBe(false);
    });
  });

  // ── trackItemDelivery ──────────────────────────────────────────────────

  describe('trackItemDelivery', () => {
    it('completes when NPC and item match', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'deliver_item',
        npcId: 'npc-1', itemName: 'Package',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackItemDelivery('npc-1', ['Package']);
      expect(obj.completed).toBe(true);
      expect(obj.delivered).toBe(true);
    });

    it('completes when npcId is unset (any NPC)', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'deliver_item',
        itemName: 'Package',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackItemDelivery('any-npc', ['package']);
      expect(obj.completed).toBe(true);
    });

    it('does not complete when item does not match', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'deliver_item',
        npcId: 'npc-1', itemName: 'Package',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackItemDelivery('npc-1', ['Sword']);
      expect(obj.completed).toBe(false);
    });
  });

  // ── checkInventoryObjectives ───────────────────────────────────────────

  describe('checkInventoryObjectives', () => {
    it('completes collect_item objectives for items in inventory', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item',
        itemName: 'Gem',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.checkInventoryObjectives(['gem', 'sword']);
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackEnemyDefeat ──────────────────────────────────────────────────

  describe('trackEnemyDefeat', () => {
    it('increments and completes at threshold', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'defeat_enemies',
        enemyType: 'goblin', enemiesRequired: 3, enemiesDefeated: 0,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEnemyDefeat('goblin');
      engine.trackEnemyDefeat('goblin');
      expect(obj.completed).toBe(false);

      engine.trackEnemyDefeat('goblin');
      expect(obj.completed).toBe(true);
    });

    it('ignores non-matching enemy types', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'defeat_enemies',
        enemyType: 'goblin', enemiesRequired: 1,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEnemyDefeat('dragon');
      expect(obj.completed).toBe(false);
    });

    it('matches any enemy when enemyType is unset', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'defeat_enemies',
        enemiesRequired: 1,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEnemyDefeat('anything');
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackItemCrafted ──────────────────────────────────────────────────

  describe('trackItemCrafted', () => {
    it('increments and completes craft_item objectives', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'craft_item',
        craftedItemId: 'sword', requiredCount: 2,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackItemCrafted('sword');
      expect(obj.craftedCount).toBe(1);

      engine.trackItemCrafted('sword');
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackLocationDiscovery ────────────────────────────────────────────

  describe('trackLocationDiscovery', () => {
    it('completes when location matches', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'discover_location',
        locationName: 'cave',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackLocationDiscovery('cave');
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackArrival ──────────────────────────────────────────────────────

  describe('trackArrival', () => {
    it('completes escort_npc and sets arrived flag', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'escort_npc',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackArrival('npc-1', true);
      expect(obj.completed).toBe(true);
      expect(obj.arrived).toBe(true);
    });

    it('completes deliver_item and sets delivered flag', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'deliver_item',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackArrival('item-1', true);
      expect(obj.completed).toBe(true);
      expect(obj.delivered).toBe(true);
    });

    it('does nothing when destination not reached', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'escort_npc',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackArrival('npc-1', false);
      expect(obj.completed).toBe(false);
    });
  });

  // ── trackReputationGain ───────────────────────────────────────────────

  describe('trackReputationGain', () => {
    it('accumulates and completes at threshold', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'gain_reputation',
        factionId: 'elves', reputationRequired: 50,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackReputationGain('elves', 30);
      expect(obj.completed).toBe(false);

      engine.trackReputationGain('elves', 25);
      expect(obj.completed).toBe(true);
      expect(obj.reputationGained).toBe(55);
    });

    it('ignores wrong faction', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'gain_reputation',
        factionId: 'elves', reputationRequired: 10,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackReputationGain('dwarves', 100);
      expect(obj.completed).toBe(false);
    });
  });

  // ── trackListeningAnswer ──────────────────────────────────────────────

  describe('trackListeningAnswer', () => {
    it('counts correct answers and completes at threshold', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'listening_comprehension',
        requiredCount: 2,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackListeningAnswer(true);
      expect(obj.questionsCorrect).toBe(1);
      expect(obj.questionsAnswered).toBe(1);

      engine.trackListeningAnswer(false);
      expect(obj.questionsCorrect).toBe(1);
      expect(obj.questionsAnswered).toBe(2);

      engine.trackListeningAnswer(true);
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackTranslationAttempt ───────────────────────────────────────────

  describe('trackTranslationAttempt', () => {
    it('counts correct translations and completes at threshold', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'translation_challenge',
        requiredCount: 2,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackTranslationAttempt(true);
      engine.trackTranslationAttempt(false);
      expect(obj.translationsCorrect).toBe(1);
      expect(obj.translationsCompleted).toBe(2);

      engine.trackTranslationAttempt(true);
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackNavigationWaypoint ───────────────────────────────────────────

  describe('trackNavigationWaypoint', () => {
    it('increments waypoints and completes when all reached', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'navigate_language',
        stepsRequired: 2,
        navigationWaypoints: [
          { instruction: 'Go left' },
          { instruction: 'Go right' },
        ],
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const r1 = engine.trackNavigationWaypoint();
      expect(r1?.completed).toBe(false);
      expect(r1?.nextWaypointIndex).toBe(1);

      const r2 = engine.trackNavigationWaypoint();
      expect(r2?.completed).toBe(true);
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackPronunciationAttempt ─────────────────────────────────────────

  describe('trackPronunciationAttempt', () => {
    it('only counts passed attempts', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'pronunciation_check',
        requiredCount: 2,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackPronunciationAttempt(false, 30);
      expect(obj.currentCount).toBeUndefined();

      engine.trackPronunciationAttempt(true, 85);
      engine.trackPronunciationAttempt(true, 90);
      expect(obj.completed).toBe(true);
    });
  });

  // ── trackEvent (unified dispatch) ─────────────────────────────────────

  describe('trackEvent', () => {
    it('dispatches npc_conversation events', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'npc_conversation', npcId: 'npc-1' });
      expect(obj.completed).toBe(true);
    });

    it('dispatches objective_direct_complete events', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'visit_location' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'objective_direct_complete', questId: 'q1', objectiveId: 'o1' });
      expect(obj.completed).toBe(true);
    });

    it('dispatches enemy_defeat events', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'defeat_enemies',
        enemiesRequired: 1,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'enemy_defeat', enemyType: 'goblin' });
      expect(obj.completed).toBe(true);
    });
  });

  // ── Timed objectives ──────────────────────────────────────────────────

  describe('checkTimedObjectives', () => {
    it('marks expired objectives as completed and returns descriptions', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'visit_location',
        description: 'Visit the temple',
        timeLimitSeconds: 10,
        startedAt: Date.now() - 15000, // 15 seconds ago
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const expired = engine.checkTimedObjectives();
      expect(expired).toHaveLength(1);
      expect(expired[0]).toContain('Time expired');
      expect(obj.completed).toBe(true);
    });

    it('does not expire objectives within time limit', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'visit_location',
        timeLimitSeconds: 60,
        startedAt: Date.now() - 5000,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const expired = engine.checkTimedObjectives();
      expect(expired).toHaveLength(0);
      expect(obj.completed).toBe(false);
    });
  });

  describe('getObjectiveTimeRemaining', () => {
    it('returns remaining time for timed objective', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'visit_location',
        timeLimitSeconds: 60,
        startedAt: Date.now() - 10000,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const remaining = engine.getObjectiveTimeRemaining('o1');
      expect(remaining).toBeGreaterThan(45);
      expect(remaining).toBeLessThanOrEqual(50);
    });

    it('returns null for untimed objective', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc' });
      engine.addQuest(makeQuest('q1', [obj]));

      expect(engine.getObjectiveTimeRemaining('o1')).toBeNull();
    });
  });

  // ── Cross-quest isolation ─────────────────────────────────────────────

  describe('cross-quest isolation', () => {
    it('does not leak completion between quests', () => {
      const o1 = makeObjective({ id: 'o1', questId: 'q1', type: 'talk_to_npc', npcId: 'npc-1' });
      const o2 = makeObjective({ id: 'o2', questId: 'q2', type: 'talk_to_npc', npcId: 'npc-1' });
      engine.addQuest(makeQuest('q1', [o1]));
      engine.addQuest(makeQuest('q2', [o2]));

      // Without questId filter, both should complete
      engine.trackNPCConversation('npc-1');

      expect(o1.completed).toBe(true);
      expect(o2.completed).toBe(true);
    });

    it('respects questId filter', () => {
      const o1 = makeObjective({ id: 'o1', questId: 'q1', type: 'defeat_enemies', enemiesRequired: 1 });
      const o2 = makeObjective({ id: 'o2', questId: 'q2', type: 'defeat_enemies', enemiesRequired: 1 });
      engine.addQuest(makeQuest('q1', [o1]));
      engine.addQuest(makeQuest('q2', [o2]));

      engine.trackEnemyDefeat('goblin', 'q1');

      expect(o1.completed).toBe(true);
      expect(o2.completed).toBe(false);
    });
  });

  // ── trackGiftGiven ──────────────────────────────────────────────────────

  describe('trackGiftGiven', () => {
    it('completes give_gift objective when NPC matches', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'give_gift',
        npcId: 'npc-1',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackGiftGiven('npc-1', 'flower');
      expect(obj.completed).toBe(true);
    });

    it('completes give_gift when npcId is unset (any NPC)', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'give_gift',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackGiftGiven('any-npc', 'sword');
      expect(obj.completed).toBe(true);
    });

    it('does not complete when NPC does not match', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'give_gift',
        npcId: 'npc-1',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackGiftGiven('npc-2', 'flower');
      expect(obj.completed).toBe(false);
    });

    it('fires objective and quest completion callbacks', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'give_gift',
        npcId: 'npc-1',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackGiftGiven('npc-1', 'flower');
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
      expect(questCompletedSpy).toHaveBeenCalledWith('q1');
    });
  });

  // ── trackEvent dispatch for inventory objectives ──────────────────────

  describe('trackEvent dispatch', () => {
    it('dispatches gift_given event to trackGiftGiven', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'give_gift',
        npcId: 'npc-1',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'gift_given', npcId: 'npc-1', itemName: 'flower' });
      expect(obj.completed).toBe(true);
    });

    it('dispatches item_delivery event to trackItemDelivery', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'deliver_item',
        npcId: 'npc-1', itemName: 'Package',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'item_delivery', npcId: 'npc-1', playerItemNames: ['Package'] });
      expect(obj.completed).toBe(true);
      expect(obj.delivered).toBe(true);
    });

    it('dispatches collect_item_by_name event to trackCollectedItemByName', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'collect_item',
        itemName: 'gem',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'collect_item_by_name', itemName: 'gem' });
      expect(obj.completed).toBe(true);
    });
  });
});
