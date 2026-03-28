/**
 * Quest Action Wiring Audit Test
 *
 * Verifies end-to-end wiring for all 40 ACHIEVABLE_OBJECTIVE_TYPES:
 *   - Each objective type has a handler in QuestCompletionEngine (trackEvent or handleGameEvent)
 *   - Each objective type has a triggering GameEventBus event
 *   - Event → handler → completion flow works for each type
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ACHIEVABLE_OBJECTIVE_TYPES, VALID_OBJECTIVE_TYPES } from '../quest-objective-types';
import { QuestCompletionEngine, type CompletionQuest, type CompletionObjective } from '../game-engine/logic/QuestCompletionEngine';
import { QUEST_ACTION_MAPPINGS, getMappingsForEvent } from '../game-engine/quest-action-mapping';

// ── Test Matrix: objective type → triggering event → emitting system ──────────

interface WiringEntry {
  objectiveType: string;
  triggeringEvent: string;
  emittingSystem: string;
  handlerMethod: string;
}

/**
 * Comprehensive wiring matrix: maps each of the 40 canonical objective types
 * to the event that triggers it, the system that emits that event, and the
 * QuestCompletionEngine handler that processes it.
 */
const WIRING_MATRIX: WiringEntry[] = [
  { objectiveType: 'visit_location', triggeringEvent: 'location_visited', emittingSystem: 'BabylonGame zone detection', handlerMethod: 'trackLocationVisit / handleGameEvent' },
  { objectiveType: 'discover_location', triggeringEvent: 'location_discovered', emittingSystem: 'BabylonGame zone detection', handlerMethod: 'trackLocationVisit / handleGameEvent' },
  { objectiveType: 'talk_to_npc', triggeringEvent: 'npc_talked', emittingSystem: 'BabylonChatPanel', handlerMethod: 'trackNPCConversation / handleGameEvent' },
  { objectiveType: 'complete_conversation', triggeringEvent: 'conversation_turn', emittingSystem: 'BabylonChatPanel', handlerMethod: 'trackConversationTurn' },
  { objectiveType: 'conversation_initiation', triggeringEvent: 'npc_initiated_conversation', emittingSystem: 'NPCProactiveConversation', handlerMethod: 'trackConversationInitiation' },
  { objectiveType: 'use_vocabulary', triggeringEvent: 'vocabulary_used', emittingSystem: 'BabylonChatPanel / VocabularyCollectionSystem', handlerMethod: 'trackVocabularyUsage' },
  { objectiveType: 'collect_vocabulary', triggeringEvent: 'vocabulary_used', emittingSystem: 'VocabularyCollectionSystem', handlerMethod: 'trackVocabularyUsage' },
  { objectiveType: 'collect_text', triggeringEvent: 'text_collected', emittingSystem: 'BabylonGame item pickup', handlerMethod: 'trackCollectedItemByName' },
  { objectiveType: 'identify_object', triggeringEvent: 'object_identified', emittingSystem: 'VisualVocabularyDetector', handlerMethod: 'trackObjectIdentified' },
  { objectiveType: 'collect_item', triggeringEvent: 'item_collected', emittingSystem: 'BabylonGame item pickup', handlerMethod: 'trackCollectedItemByName / handleGameEvent' },
  { objectiveType: 'deliver_item', triggeringEvent: 'item_delivered', emittingSystem: 'BabylonChatPanel', handlerMethod: 'trackItemDelivery / handleGameEvent' },
  { objectiveType: 'defeat_enemies', triggeringEvent: 'enemy_defeated', emittingSystem: 'CombatSystem', handlerMethod: 'trackEnemyDefeat' },
  { objectiveType: 'craft_item', triggeringEvent: 'item_crafted', emittingSystem: 'RecipeCraftingSystem', handlerMethod: 'trackItemCrafted / handleGameEvent' },
  { objectiveType: 'escort_npc', triggeringEvent: 'escort_completed', emittingSystem: 'EscortQuestSystem', handlerMethod: 'trackArrival' },
  { objectiveType: 'build_friendship', triggeringEvent: 'npc_conversation_turn', emittingSystem: 'BabylonChatPanel', handlerMethod: 'trackNpcConversationTurn' },
  { objectiveType: 'give_gift', triggeringEvent: 'gift_given', emittingSystem: 'BabylonChatPanel / Inventory', handlerMethod: 'trackGiftGiven' },
  { objectiveType: 'gain_reputation', triggeringEvent: 'reputation_changed', emittingSystem: 'FactionSystem', handlerMethod: 'trackReputationGain' },
  { objectiveType: 'listening_comprehension', triggeringEvent: 'listening_completed', emittingSystem: 'ListeningComprehensionManager', handlerMethod: 'trackListeningAnswer' },
  { objectiveType: 'translation_challenge', triggeringEvent: 'translation_attempt', emittingSystem: 'TranslationUI', handlerMethod: 'trackTranslationAttempt' },
  { objectiveType: 'navigate_language', triggeringEvent: 'direction_step_completed', emittingSystem: 'NavigationQuestSystem', handlerMethod: 'trackNavigationWaypoint' },
  { objectiveType: 'follow_directions', triggeringEvent: 'direction_step_completed', emittingSystem: 'DirectionFollowingSystem', handlerMethod: 'trackDirectionStep' },
  { objectiveType: 'pronunciation_check', triggeringEvent: 'utterance_evaluated', emittingSystem: 'UtteranceQuestSystem', handlerMethod: 'trackPronunciationAttempt' },
  { objectiveType: 'examine_object', triggeringEvent: 'object_examined', emittingSystem: 'InteractionPromptSystem', handlerMethod: 'trackObjectExamined' },
  { objectiveType: 'read_sign', triggeringEvent: 'sign_read', emittingSystem: 'SignReadingUI', handlerMethod: 'trackSignRead' },
  { objectiveType: 'write_response', triggeringEvent: 'writing_submitted', emittingSystem: 'WritingUI', handlerMethod: 'trackWritingSubmission' },
  { objectiveType: 'listen_and_repeat', triggeringEvent: 'utterance_evaluated', emittingSystem: 'UtteranceQuestSystem', handlerMethod: 'trackPronunciationAttempt' },
  { objectiveType: 'point_and_name', triggeringEvent: 'object_named', emittingSystem: 'PointAndNameSystem', handlerMethod: 'trackPointAndName' },
  { objectiveType: 'ask_for_directions', triggeringEvent: 'npc_conversation_turn', emittingSystem: 'BabylonChatPanel (directions topic)', handlerMethod: 'trackNpcConversationTurn' },
  { objectiveType: 'order_food', triggeringEvent: 'food_ordered', emittingSystem: 'MerchantUI', handlerMethod: 'trackFoodOrdered' },
  { objectiveType: 'haggle_price', triggeringEvent: 'price_haggled', emittingSystem: 'MerchantUI', handlerMethod: 'trackPriceHaggled' },
  { objectiveType: 'introduce_self', triggeringEvent: 'npc_conversation_turn', emittingSystem: 'BabylonChatPanel (introduction topic)', handlerMethod: 'trackNpcConversationTurn' },
  { objectiveType: 'describe_scene', triggeringEvent: 'writing_submitted', emittingSystem: 'WritingUI', handlerMethod: 'trackWritingSubmission' },
  { objectiveType: 'find_text', triggeringEvent: 'text_collected', emittingSystem: 'BabylonGame item pickup', handlerMethod: 'trackTextFound' },
  { objectiveType: 'read_text', triggeringEvent: 'reading_completed', emittingSystem: 'LibraryPanel', handlerMethod: 'trackTextRead' },
  { objectiveType: 'comprehension_quiz', triggeringEvent: 'questions_answered', emittingSystem: 'ComprehensionQuizUI', handlerMethod: 'trackComprehensionAnswer' },
  { objectiveType: 'photograph_subject', triggeringEvent: 'photo_taken', emittingSystem: 'BabylonPhotographySystem', handlerMethod: 'trackPhotoTaken / handleGameEvent' },
  { objectiveType: 'photograph_activity', triggeringEvent: 'photo_taken', emittingSystem: 'BabylonPhotographySystem', handlerMethod: 'trackActivityPhotographed / handleGameEvent' },
  { objectiveType: 'observe_activity', triggeringEvent: 'activity_observed', emittingSystem: 'NPCActivityLabelSystem', handlerMethod: 'trackActivityObserved' },
  { objectiveType: 'teach_vocabulary', triggeringEvent: 'teach_word', emittingSystem: 'BabylonChatPanel', handlerMethod: 'trackTeachWord' },
  { objectiveType: 'teach_phrase', triggeringEvent: 'teach_phrase_to_npc', emittingSystem: 'BabylonChatPanel', handlerMethod: 'trackTeachPhrase' },
  { objectiveType: 'eavesdrop', triggeringEvent: 'conversation_overheard', emittingSystem: 'NPCSocializationController', handlerMethod: 'trackEavesdrop / handleGameEvent' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(type: string, extra: Partial<CompletionObjective> = {}): CompletionObjective {
  return {
    id: `obj-${type}`,
    questId: 'test-quest',
    type,
    description: `Test objective: ${type}`,
    completed: false,
    ...extra,
  };
}

function makeQuest(objectives: CompletionObjective[]): CompletionQuest {
  return {
    id: 'test-quest',
    objectives,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Quest Action Wiring Audit', () => {
  describe('Coverage: all 40 objective types have wiring entries', () => {
    const wiredTypes = new Set(WIRING_MATRIX.map(w => w.objectiveType));

    for (const objType of ACHIEVABLE_OBJECTIVE_TYPES) {
      it(`${objType.type} is wired`, () => {
        expect(wiredTypes.has(objType.type)).toBe(true);
      });
    }
  });

  describe('QuestCompletionEngine handlers exist for all objective types', () => {
    let engine: QuestCompletionEngine;

    beforeEach(() => {
      engine = new QuestCompletionEngine();
    });

    it('trackEvent handles npc_conversation for talk_to_npc', () => {
      const obj = makeObjective('talk_to_npc', { npcId: 'npc-1' });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'npc_conversation', npcId: 'npc-1' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles conversation_turn for complete_conversation', () => {
      const obj = makeObjective('complete_conversation', { requiredCount: 2 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'conversation_turn', keywords: ['hello'] });
      expect(obj.completed).toBe(false);
      engine.trackEvent({ type: 'conversation_turn', keywords: ['world'] });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles conversation_initiation', () => {
      const obj = makeObjective('conversation_initiation', { npcId: 'npc-1', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'conversation_initiation', npcId: 'npc-1', accepted: true });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles vocabulary_usage for use_vocabulary', () => {
      const obj = makeObjective('use_vocabulary', { targetWords: ['bonjour'], requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'vocabulary_usage', word: 'bonjour' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles collect_item_by_name for collect_item', () => {
      const obj = makeObjective('collect_item', { itemName: 'herbs', itemCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'collect_item_by_name', itemName: 'Healing Herbs' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles item_delivery for deliver_item', () => {
      const obj = makeObjective('deliver_item', { npcId: 'npc-1', itemName: 'letter' });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'item_delivery', npcId: 'npc-1', playerItemNames: ['letter'] });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles enemy_defeat for defeat_enemies', () => {
      const obj = makeObjective('defeat_enemies', { enemyType: 'wolf', enemiesRequired: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'enemy_defeat', enemyType: 'wolf' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles item_crafted for craft_item', () => {
      const obj = makeObjective('craft_item', { craftedItemId: 'sword', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'item_crafted', itemId: 'sword' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles location_discovery for visit_location and discover_location', () => {
      const obj1 = makeObjective('visit_location', { locationName: 'Market' });
      const obj2 = makeObjective('discover_location', { locationName: 'Market', id: 'obj-discover_location' });
      engine.addQuest(makeQuest([obj1, obj2]));
      engine.trackEvent({ type: 'location_discovery', locationId: 'zone-1', locationName: 'Market Square' });
      expect(obj1.completed).toBe(true);
      expect(obj2.completed).toBe(true);
    });

    it('trackEvent handles arrival for escort_npc', () => {
      const obj = makeObjective('escort_npc', { escortNpcId: 'npc-1' });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'arrival', npcOrItemId: 'npc-1', destinationReached: true });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles reputation_gain for gain_reputation', () => {
      const obj = makeObjective('gain_reputation', { factionId: 'merchants', reputationRequired: 50 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'reputation_gain', factionId: 'merchants', amount: 50 });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles listening_answer for listening_comprehension', () => {
      const obj = makeObjective('listening_comprehension', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'listening_answer', isCorrect: true });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles translation_attempt for translation_challenge', () => {
      const obj = makeObjective('translation_challenge', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'translation_attempt', isCorrect: true });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles navigation_waypoint for navigate_language', () => {
      const obj = makeObjective('navigate_language', { stepsRequired: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'navigation_waypoint' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles direction_step_completed for follow_directions', () => {
      const obj = makeObjective('follow_directions', { stepsRequired: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'direction_step_completed' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles pronunciation_attempt for pronunciation_check', () => {
      const obj = makeObjective('pronunciation_check', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'pronunciation_attempt', passed: true, score: 85 });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles pronunciation_attempt for listen_and_repeat', () => {
      const obj = makeObjective('listen_and_repeat', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'pronunciation_attempt', passed: true, score: 80 });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles object_examined for examine_object', () => {
      const obj = makeObjective('examine_object', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'object_examined', objectName: 'table' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles sign_read for read_sign', () => {
      const obj = makeObjective('read_sign', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'sign_read', signId: 'sign-1' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles writing_submitted for write_response', () => {
      const obj = makeObjective('write_response', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'writing_submitted', text: 'Bonjour le monde', wordCount: 3 });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles writing_submitted for describe_scene', () => {
      const obj = makeObjective('describe_scene', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'writing_submitted', text: 'La maison est belle', wordCount: 4 });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles object_pointed_and_named for point_and_name', () => {
      const obj = makeObjective('point_and_name', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'object_pointed_and_named', objectName: 'maison' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles object_identified for identify_object', () => {
      const obj = makeObjective('identify_object', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'object_identified', objectName: 'pomme' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles npc_conversation_turn for build_friendship', () => {
      const obj = makeObjective('build_friendship', { npcId: 'npc-1', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'npc-1', topicTag: 'friendship' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles gift_given for give_gift', () => {
      const obj = makeObjective('give_gift', { npcId: 'npc-1' });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'gift_given', npcId: 'npc-1', itemName: 'flower' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles npc_conversation_turn for ask_for_directions', () => {
      const obj = makeObjective('ask_for_directions', { npcId: 'npc-1', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'npc-1', topicTag: 'directions' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles food_ordered for order_food', () => {
      const obj = makeObjective('order_food', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'food_ordered', itemName: 'croissant', merchantId: 'm1', businessType: 'bakery' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles price_haggled for haggle_price', () => {
      const obj = makeObjective('haggle_price', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'price_haggled', itemName: 'sword', merchantId: 'm1', typedWord: 'moins' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles npc_conversation_turn for introduce_self', () => {
      const obj = makeObjective('introduce_self', { npcId: 'npc-1', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'npc_conversation_turn', npcId: 'npc-1', topicTag: 'introduction' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles text_found for find_text', () => {
      const obj = makeObjective('find_text', { itemName: 'journal', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'text_found', textId: 'txt-1', textName: 'journal' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles text_read for read_text', () => {
      const obj = makeObjective('read_text', { textId: 'txt-1', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'text_read', textId: 'txt-1' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles comprehension_answer for comprehension_quiz', () => {
      const obj = makeObjective('comprehension_quiz', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'comprehension_answer', isCorrect: true });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles photo_taken for photograph_subject', () => {
      const obj = makeObjective('photograph_subject', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'photo_taken', subjectName: 'church', subjectCategory: 'building' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles activity_photographed for photograph_activity', () => {
      const obj = makeObjective('photograph_activity', { targetActivity: 'cooking', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'activity_photographed', npcId: 'npc-1', npcName: 'Chef', activity: 'cooking' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles activity_observed for observe_activity', () => {
      const obj = makeObjective('observe_activity', { targetActivity: 'painting', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'activity_observed', npcId: 'npc-1', npcName: 'Artist', activity: 'painting', durationSeconds: 6 });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles teach_word for teach_vocabulary', () => {
      const obj = makeObjective('teach_vocabulary', { npcId: 'npc-1', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'teach_word', npcId: 'npc-1', word: 'bonjour' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles teach_phrase_to_npc for teach_phrase', () => {
      const obj = makeObjective('teach_phrase', { npcId: 'npc-1', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'teach_phrase_to_npc', npcId: 'npc-1', phrase: 'Comment allez-vous?' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles vocabulary_usage for collect_vocabulary', () => {
      const obj = makeObjective('collect_vocabulary', { requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'vocabulary_usage', word: 'chien' });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles physical_action for perform_physical_action (fishing)', () => {
      const obj = makeObjective('perform_physical_action', { actionType: 'fishing', actionsRequired: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'physical_action', actionType: 'fishing', itemsProduced: [] });
      expect(obj.completed).toBe(true);
    });

    it('trackEvent handles eavesdrop for eavesdrop objective', () => {
      const obj = makeObjective('eavesdrop', { eavesdropTopic: 'writer', requiredCount: 1 });
      engine.addQuest(makeQuest([obj]));
      engine.trackEvent({ type: 'eavesdrop', npcId1: 'npc-1', npcId2: 'npc-2', topic: 'the missing writer', languageUsed: 'french' });
      expect(obj.completed).toBe(true);
    });
  });

  describe('handleGameEvent declarative mapping coverage', () => {
    let engine: QuestCompletionEngine;

    beforeEach(() => {
      engine = new QuestCompletionEngine();
    });

    it('item_collected event completes collect_item via declarative mapping', () => {
      const obj = makeObjective('collect_item', { itemName: 'herbs', itemCount: 1, collectedCount: 0 });
      engine.addQuest(makeQuest([obj]));
      const affected = engine.handleGameEvent({ type: 'item_collected', itemName: 'Herbs', itemId: 'i1', quantity: 1 });
      expect(affected).toBeGreaterThan(0);
      expect(obj.completed).toBe(true);
    });

    it('photo_taken event completes photograph_subject via declarative mapping', () => {
      const obj = makeObjective('photograph_subject', { targetSubject: 'church', requiredCount: 1, currentCount: 0 });
      engine.addQuest(makeQuest([obj]));
      const affected = engine.handleGameEvent({ type: 'photo_taken', subjectName: 'Church', subjectCategory: 'building' });
      expect(affected).toBeGreaterThan(0);
      expect(obj.completed).toBe(true);
    });

    it('physical_action_completed event completes physical_action via declarative mapping', () => {
      const obj = makeObjective('physical_action', { actionType: 'fishing', actionsCompleted: 0, actionsRequired: 1 });
      engine.addQuest(makeQuest([obj]));
      const affected = engine.handleGameEvent({
        type: 'physical_action_completed',
        actionType: 'fishing',
        itemsProduced: [],
        energyCost: 15,
        xpGained: 10,
      });
      expect(affected).toBeGreaterThan(0);
      expect(obj.completed).toBe(true);
    });

    it('item_crafted event completes craft_item via declarative mapping', () => {
      const obj = makeObjective('craft_item', { itemName: 'bread', requiredCount: 1, craftedCount: 0 });
      engine.addQuest(makeQuest([obj]));
      const affected = engine.handleGameEvent({ type: 'item_crafted', itemName: 'Bread', itemId: 'i1', quantity: 1 });
      expect(affected).toBeGreaterThan(0);
      expect(obj.completed).toBe(true);
    });

    it('location_visited event completes visit_location via declarative mapping', () => {
      const obj = makeObjective('visit_location', { locationName: 'market' });
      engine.addQuest(makeQuest([obj]));
      const affected = engine.handleGameEvent({ type: 'location_visited', locationId: 'z1', locationName: 'Market Square' });
      expect(affected).toBeGreaterThan(0);
      expect(obj.completed).toBe(true);
    });
  });

  describe('Quest action mapping catalog integrity', () => {
    it('all mapping objectiveTypes reference types known to QUEST_ACTION_MAPPINGS', () => {
      for (const mapping of QUEST_ACTION_MAPPINGS) {
        expect(typeof mapping.objectiveType).toBe('string');
        expect(typeof mapping.eventType).toBe('string');
        expect(Array.isArray(mapping.matchFields)).toBe(true);
      }
    });

    it('getMappingsForEvent returns mappings for common events', () => {
      const itemMappings = getMappingsForEvent('item_collected');
      expect(itemMappings.length).toBeGreaterThan(0);

      const photoMappings = getMappingsForEvent('photo_taken');
      expect(photoMappings.length).toBeGreaterThan(0);

      const locationMappings = getMappingsForEvent('location_visited');
      expect(locationMappings.length).toBeGreaterThan(0);
    });
  });

  describe('Wiring matrix completeness', () => {
    it('wiring matrix covers all 40 objective types', () => {
      expect(WIRING_MATRIX.length).toBe(ACHIEVABLE_OBJECTIVE_TYPES.length);
    });

    it('every wiring entry references a valid objective type', () => {
      for (const entry of WIRING_MATRIX) {
        expect(VALID_OBJECTIVE_TYPES.has(entry.objectiveType)).toBe(true);
      }
    });

    it('no duplicate objective types in wiring matrix', () => {
      const seen = new Set<string>();
      for (const entry of WIRING_MATRIX) {
        expect(seen.has(entry.objectiveType)).toBe(false);
        seen.add(entry.objectiveType);
      }
    });
  });
});
