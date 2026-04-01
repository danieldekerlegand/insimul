/**
 * Audit: Conversation Action Registration → Quest Objective Completion
 *
 * Verifies that conversational actions detected during NPC dialogue
 * properly complete quest objectives through the full pipeline:
 *   ConversationalActionDetector → trackEvent → QuestCompletionEngine → objective completed
 *
 * Also covers:
 *   - ConversationQuestBridge (LLM goal evaluation path)
 *   - Turn counting thresholds
 *   - NPC filtering
 *   - Topic matching
 *   - Arrival objective auto-completion
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  QuestCompletionEngine,
  type CompletionQuest,
  type CompletionObjective,
} from '../game-engine/logic/QuestCompletionEngine';
import { ConversationalActionDetector } from '../game-engine/logic/ConversationalActionDetector';
import { ConversationQuestBridge, type GoalEvaluation } from '../game-engine/logic/ConversationQuestBridge';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(
  overrides: Partial<CompletionObjective> & { id: string; questId: string; type: string },
): CompletionObjective {
  return { description: 'test objective', completed: false, ...overrides };
}

function makeQuest(id: string, objectives: CompletionObjective[]): CompletionQuest {
  return { id, objectives };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Conversation Action → Quest Objective Completion Audit', () => {
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

  // ── trackConversationalAction: action→objective type mapping ───────────

  describe('trackConversationalAction — action to objective type mapping', () => {
    it('asked_about_topic completes asked_about_topic objectives', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'asked_about_topic' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'asked_about_topic', npcId: 'npc-1', topic: 'history' });

      expect(obj.completed).toBe(true);
      expect(objectiveCompletedSpy).toHaveBeenCalledWith('q1', 'o1');
    });

    it('used_target_language completes used_target_language objectives', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'used_target_language' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'used_target_language', npcId: 'npc-1' });

      expect(obj.completed).toBe(true);
    });

    it('used_target_language also completes arrival_writing objectives', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'arrival_writing' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'used_target_language', npcId: 'npc-1' });

      expect(obj.completed).toBe(true);
    });

    it('answered_question completes answered_question objectives', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'answered_question' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'answered_question', npcId: 'npc-1' });

      expect(obj.completed).toBe(true);
    });

    it('requested_information completes requested_information objectives', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'requested_information' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'requested_information', npcId: 'npc-1' });

      expect(obj.completed).toBe(true);
    });

    it('requested_information also completes ask_for_directions objectives', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'ask_for_directions' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'requested_information', npcId: 'npc-1' });

      expect(obj.completed).toBe(true);
    });

    it('made_introduction completes made_introduction objectives', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'made_introduction' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'made_introduction', npcId: 'npc-1' });

      expect(obj.completed).toBe(true);
    });

    it('made_introduction also completes introduce_self objectives', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'introduce_self' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'made_introduction', npcId: 'npc-1' });

      expect(obj.completed).toBe(true);
    });
  });

  // ── arrival_initiate_conversation auto-completion ──────────────────────

  describe('arrival_initiate_conversation — auto-completes on any conversational action', () => {
    it('completes arrival_initiate_conversation when any action fires', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'arrival_initiate_conversation', npcId: 'npc-1' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'answered_question', npcId: 'npc-1' });

      expect(obj.completed).toBe(true);
    });

    it('does not complete arrival_initiate_conversation for wrong NPC', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'arrival_initiate_conversation', npcId: 'npc-1' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'made_introduction', npcId: 'npc-2' });

      expect(obj.completed).toBe(false);
    });

    it('completes arrival_initiate_conversation without npcId filter', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'arrival_initiate_conversation' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'used_target_language', npcId: 'any-npc' });

      expect(obj.completed).toBe(true);
    });
  });

  // ── NPC filtering ─────────────────────────────────────────────────────

  describe('NPC filtering', () => {
    it('skips objectives targeted at a different NPC', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'asked_about_topic', npcId: 'npc-A' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'asked_about_topic', npcId: 'npc-B', topic: 'test' });

      expect(obj.completed).toBe(false);
    });

    it('completes objectives with matching NPC', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'asked_about_topic', npcId: 'npc-A' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'asked_about_topic', npcId: 'npc-A', topic: 'test' });

      expect(obj.completed).toBe(true);
    });

    it('completes objectives with no NPC filter (any NPC works)', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'made_introduction' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'made_introduction', npcId: 'random-npc' });

      expect(obj.completed).toBe(true);
    });
  });

  // ── Topic matching for asked_about_topic ──────────────────────────────

  describe('topic matching for asked_about_topic', () => {
    it('requires matching topic when targetWords is set', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'asked_about_topic',
        targetWords: ['missing', 'writer'],
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'asked_about_topic', npcId: 'npc-1', topic: 'weather' });

      expect(obj.completed).toBe(false);
    });

    it('completes when topic matches targetWords', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'asked_about_topic',
        targetWords: ['missing', 'writer'],
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'asked_about_topic', npcId: 'npc-1', topic: 'missing' });

      expect(obj.completed).toBe(true);
    });

    it('completes when no targetWords filter (any topic)', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'asked_about_topic' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'asked_about_topic', npcId: 'npc-1', topic: 'anything' });

      expect(obj.completed).toBe(true);
    });
  });

  // ── requiredCount threshold ───────────────────────────────────────────

  describe('requiredCount threshold', () => {
    it('does not complete until requiredCount is reached', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'used_target_language',
        requiredCount: 3,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'used_target_language', npcId: 'npc-1' });
      expect(obj.currentCount).toBe(1);
      expect(obj.completed).toBe(false);

      engine.trackEvent({ type: 'conversational_action', action: 'used_target_language', npcId: 'npc-1' });
      expect(obj.currentCount).toBe(2);
      expect(obj.completed).toBe(false);

      engine.trackEvent({ type: 'conversational_action', action: 'used_target_language', npcId: 'npc-1' });
      expect(obj.currentCount).toBe(3);
      expect(obj.completed).toBe(true);
    });

    it('defaults to requiredCount of 1', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'answered_question' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversational_action', action: 'answered_question', npcId: 'npc-1' });

      expect(obj.completed).toBe(true);
    });
  });

  // ── conversation_turn_counted → arrival_conversation ──────────────────

  describe('trackConversationTurnCounted', () => {
    it('completes arrival_conversation when meaningfulTurns meets threshold', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'arrival_conversation',
        requiredCount: 3,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversation_turn_counted', npcId: 'npc-1', totalTurns: 5, meaningfulTurns: 3 });

      expect(obj.currentCount).toBe(3);
      expect(obj.completed).toBe(true);
    });

    it('does not complete when meaningfulTurns below threshold', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'arrival_conversation',
        requiredCount: 5,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversation_turn_counted', npcId: 'npc-1', totalTurns: 10, meaningfulTurns: 4 });

      expect(obj.currentCount).toBe(4);
      expect(obj.completed).toBe(false);
    });

    it('filters by NPC when npcId is set', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'arrival_conversation',
        npcId: 'npc-1', requiredCount: 3,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversation_turn_counted', npcId: 'npc-2', totalTurns: 10, meaningfulTurns: 10 });

      expect(obj.completed).toBe(false);
    });

    it('defaults required turns to 3', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'arrival_conversation' });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({ type: 'conversation_turn_counted', npcId: 'npc-1', totalTurns: 5, meaningfulTurns: 3 });

      expect(obj.completed).toBe(true);
    });
  });

  // ── conversation_goal_evaluated (LLM path) ────────────────────────────

  describe('trackConversationGoalResult (LLM evaluation path)', () => {
    it('completes objective when goalMet=true and confidence >= 0.7', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'talk_to_npc',
        conversationGoal: 'Ask about the missing writer',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({
        type: 'conversation_goal_evaluated',
        questId: 'q1', objectiveId: 'o1',
        goalMet: true, confidence: 0.85,
        extractedInfo: 'Player asked about the missing writer',
      });

      expect(obj.completed).toBe(true);
      expect(obj.conversationGoalMet).toBe(true);
      expect(obj.conversationGoalConfidence).toBe(0.85);
      expect(obj.conversationGoalExtractedInfo).toBe('Player asked about the missing writer');
    });

    it('does not complete when confidence < 0.7', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'talk_to_npc',
        conversationGoal: 'Ask about the missing writer',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({
        type: 'conversation_goal_evaluated',
        questId: 'q1', objectiveId: 'o1',
        goalMet: true, confidence: 0.5,
        extractedInfo: 'Uncertain match',
      });

      expect(obj.completed).toBe(false);
      expect(obj.conversationGoalConfidence).toBe(0.5);
    });

    it('does not complete when goalMet is false', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'talk_to_npc',
        conversationGoal: 'Ask about the missing writer',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({
        type: 'conversation_goal_evaluated',
        questId: 'q1', objectiveId: 'o1',
        goalMet: false, confidence: 0.9,
        extractedInfo: 'Player talked about weather',
      });

      expect(obj.completed).toBe(false);
    });

    it('does not re-complete already completed objectives', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'talk_to_npc',
        conversationGoal: 'test', completed: true,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      engine.trackEvent({
        type: 'conversation_goal_evaluated',
        questId: 'q1', objectiveId: 'o1',
        goalMet: true, confidence: 0.95,
        extractedInfo: 'test',
      });

      // Callback should NOT fire for already-completed objective
      expect(objectiveCompletedSpy).not.toHaveBeenCalled();
    });
  });

  // ── ConversationQuestBridge ────────────────────────────────────────────

  describe('ConversationQuestBridge', () => {
    let bridge: ConversationQuestBridge;

    beforeEach(() => {
      bridge = new ConversationQuestBridge();
    });

    describe('getObjectivesForEvaluation', () => {
      it('returns empty when no tracker set', () => {
        expect(bridge.getObjectivesForEvaluation('npc-1')).toEqual([]);
      });

      it('returns incomplete conversation-type objectives', () => {
        const quests = [
          {
            id: 'q1',
            objectives: [
              { id: 'o1', type: 'talk_to_npc', description: 'Talk to NPC', completed: false },
              { id: 'o2', type: 'collect_item', description: 'Get sword', completed: false },
              { id: 'o3', type: 'use_vocabulary', description: 'Use French', completed: false },
            ],
          },
        ];
        bridge.setQuestTracker({
          trackEvent: vi.fn(),
          getConversationGoalObjectives: vi.fn().mockReturnValue([]),
          quests,
        });

        const result = bridge.getObjectivesForEvaluation();

        // Should include talk_to_npc and use_vocabulary, but NOT collect_item
        expect(result).toHaveLength(2);
        expect(result.map(r => r.objectiveType)).toEqual(['talk_to_npc', 'use_vocabulary']);
      });

      it('excludes completed objectives', () => {
        const quests = [
          {
            id: 'q1',
            objectives: [
              { id: 'o1', type: 'talk_to_npc', description: 'Done', completed: true },
              { id: 'o2', type: 'conversation', description: 'Still going', completed: false },
            ],
          },
        ];
        bridge.setQuestTracker({
          trackEvent: vi.fn(),
          getConversationGoalObjectives: vi.fn().mockReturnValue([]),
          quests,
        });

        const result = bridge.getObjectivesForEvaluation();
        expect(result).toHaveLength(1);
        expect(result[0].objectiveId).toBe('o2');
      });

      it('filters by NPC when objective has npcId', () => {
        const quests = [
          {
            id: 'q1',
            objectives: [
              { id: 'o1', type: 'talk_to_npc', description: 'Talk to baker', completed: false, npcId: 'npc-baker' },
              { id: 'o2', type: 'talk_to_npc', description: 'Talk to guard', completed: false, npcId: 'npc-guard' },
            ],
          },
        ];
        bridge.setQuestTracker({
          trackEvent: vi.fn(),
          getConversationGoalObjectives: vi.fn().mockReturnValue([]),
          quests,
        });

        const result = bridge.getObjectivesForEvaluation('npc-baker');
        expect(result).toHaveLength(1);
        expect(result[0].objectiveId).toBe('o1');
      });

      it('limits to 5 objectives', () => {
        const objectives = Array.from({ length: 10 }, (_, i) => ({
          id: `o${i}`, type: 'conversation', description: `Conv ${i}`, completed: false,
        }));
        bridge.setQuestTracker({
          trackEvent: vi.fn(),
          getConversationGoalObjectives: vi.fn().mockReturnValue([]),
          quests: [{ id: 'q1', objectives }],
        });

        const result = bridge.getObjectivesForEvaluation();
        expect(result).toHaveLength(5);
      });

      it('skips completed and failed quests', () => {
        const quests = [
          { id: 'q1', status: 'completed', objectives: [{ id: 'o1', type: 'talk_to_npc', description: 'test', completed: false }] },
          { id: 'q2', status: 'failed', objectives: [{ id: 'o2', type: 'talk_to_npc', description: 'test', completed: false }] },
          { id: 'q3', objectives: [{ id: 'o3', type: 'talk_to_npc', description: 'test', completed: false }] },
        ];
        bridge.setQuestTracker({
          trackEvent: vi.fn(),
          getConversationGoalObjectives: vi.fn().mockReturnValue([]),
          quests,
        });

        const result = bridge.getObjectivesForEvaluation();
        expect(result).toHaveLength(1);
        expect(result[0].questId).toBe('q3');
      });
    });

    describe('processEvaluations', () => {
      it('fires trackEvent for high-confidence goalMet evaluations', () => {
        const trackEventSpy = vi.fn();
        bridge.setQuestTracker({
          trackEvent: trackEventSpy,
          getConversationGoalObjectives: vi.fn().mockReturnValue([]),
        });

        const evaluations: GoalEvaluation[] = [
          { questId: 'q1', objectiveId: 'o1', goalMet: true, confidence: 0.85, extractedInfo: 'Player asked about writer' },
        ];

        bridge.processEvaluations(evaluations, 'npc-1', 'Where is the writer?');

        expect(trackEventSpy).toHaveBeenCalledWith({
          type: 'conversation_goal_evaluated',
          questId: 'q1',
          objectiveId: 'o1',
          goalMet: true,
          confidence: 0.85,
          extractedInfo: 'Player asked about writer',
        });
      });

      it('skips low-confidence evaluations', () => {
        const trackEventSpy = vi.fn();
        bridge.setQuestTracker({
          trackEvent: trackEventSpy,
          getConversationGoalObjectives: vi.fn().mockReturnValue([]),
        });

        bridge.processEvaluations(
          [{ questId: 'q1', objectiveId: 'o1', goalMet: true, confidence: 0.5, extractedInfo: 'uncertain' }],
          'npc-1',
        );

        expect(trackEventSpy).not.toHaveBeenCalled();
      });

      it('skips goalMet=false evaluations', () => {
        const trackEventSpy = vi.fn();
        bridge.setQuestTracker({
          trackEvent: trackEventSpy,
          getConversationGoalObjectives: vi.fn().mockReturnValue([]),
        });

        bridge.processEvaluations(
          [{ questId: 'q1', objectiveId: 'o1', goalMet: false, confidence: 0.9, extractedInfo: 'no match' }],
          'npc-1',
        );

        expect(trackEventSpy).not.toHaveBeenCalled();
      });

      it('emits to GameEventBus when set', () => {
        const emitSpy = vi.fn();
        bridge.setQuestTracker({
          trackEvent: vi.fn(),
          getConversationGoalObjectives: vi.fn().mockReturnValue([]),
        });
        bridge.setEventBus({ emit: emitSpy } as any);

        bridge.processEvaluations(
          [{ questId: 'q1', objectiveId: 'o1', goalMet: true, confidence: 0.8, extractedInfo: 'goal met' }],
          'npc-baker',
          'Hello baker',
        );

        expect(emitSpy).toHaveBeenCalledWith({
          type: 'conversational_action_completed',
          npcId: 'npc-baker',
          action: 'goal met',
          questId: 'q1',
          objectiveId: 'o1',
          confidence: 0.8,
          playerMessage: 'Hello baker',
        });
      });

      it('handles empty evaluations gracefully', () => {
        bridge.processEvaluations([], 'npc-1');
        bridge.processEvaluations(null as any, 'npc-1');
        // Should not throw
      });
    });
  });

  // ── End-to-end: detector → engine completion ──────────────────────────

  describe('end-to-end: ConversationalActionDetector → QuestCompletionEngine', () => {
    let detector: ConversationalActionDetector;

    beforeEach(() => {
      detector = new ConversationalActionDetector();
    });

    it('introduction detection completes introduce_self objective', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'introduce_self' });
      engine.addQuest(makeQuest('q1', [obj]));

      const actions = detector.detect({
        npcId: 'npc-1',
        npcMessage: 'Hello, who are you?',
        playerMessage: 'My name is Jean-Pierre',
      });

      expect(actions.some(a => a.action === 'made_introduction')).toBe(true);

      for (const action of actions) {
        engine.trackEvent({
          type: 'conversational_action',
          action: action.action,
          npcId: action.npcId,
          topic: action.topic,
          questId: action.questId,
        });
      }

      expect(obj.completed).toBe(true);
    });

    it('French language usage completes used_target_language objective', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'used_target_language' });
      engine.addQuest(makeQuest('q1', [obj]));

      const actions = detector.detect({
        npcId: 'npc-1',
        npcMessage: 'Bonjour!',
        playerMessage: 'Bonjour, je suis très content de vous rencontrer',
        targetLanguage: 'fr',
      });

      expect(actions.some(a => a.action === 'used_target_language')).toBe(true);

      for (const action of actions) {
        engine.trackEvent({
          type: 'conversational_action',
          action: action.action,
          npcId: action.npcId,
          topic: action.topic,
          questId: action.questId,
        });
      }

      expect(obj.completed).toBe(true);
    });

    it('topic keyword detection completes asked_about_topic objective', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'asked_about_topic',
        targetWords: ['missing', 'writer'],
      });
      engine.addQuest(makeQuest('q1', [obj]));

      const actions = detector.detect({
        npcId: 'npc-1',
        npcMessage: 'What brings you here?',
        playerMessage: 'I am looking for the missing writer who lived near the bayou',
        questTopics: [{ questId: 'q1', keywords: ['missing', 'writer'] }],
      });

      expect(actions.some(a => a.action === 'asked_about_topic')).toBe(true);

      for (const action of actions) {
        engine.trackEvent({
          type: 'conversational_action',
          action: action.action,
          npcId: action.npcId,
          topic: action.topic,
          questId: action.questId,
        });
      }

      expect(obj.completed).toBe(true);
    });

    it('information request completes ask_for_directions objective', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'ask_for_directions' });
      engine.addQuest(makeQuest('q1', [obj]));

      const actions = detector.detect({
        npcId: 'npc-1',
        npcMessage: 'Welcome to town!',
        playerMessage: 'Where can I find the market?',
      });

      expect(actions.some(a => a.action === 'requested_information')).toBe(true);

      for (const action of actions) {
        engine.trackEvent({
          type: 'conversational_action',
          action: action.action,
          npcId: action.npcId,
          topic: action.topic,
          questId: action.questId,
        });
      }

      expect(obj.completed).toBe(true);
    });

    it('answering a question completes answered_question objective', () => {
      const obj = makeObjective({ id: 'o1', questId: 'q1', type: 'answered_question' });
      engine.addQuest(makeQuest('q1', [obj]));

      const actions = detector.detect({
        npcId: 'npc-1',
        npcMessage: 'What is your favorite food?',
        playerMessage: 'I really enjoy fresh crawfish from the bayou',
      });

      expect(actions.some(a => a.action === 'answered_question')).toBe(true);

      for (const action of actions) {
        engine.trackEvent({
          type: 'conversational_action',
          action: action.action,
          npcId: action.npcId,
          topic: action.topic,
          questId: action.questId,
        });
      }

      expect(obj.completed).toBe(true);
    });

    it('turn counting completes arrival_conversation objective', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'arrival_conversation',
        requiredCount: 2, npcId: 'npc-1',
      });
      engine.addQuest(makeQuest('q1', [obj]));

      // Simulate recording turns (>5 words in target language = meaningful)
      detector.recordTurn('npc-1', 'Bonjour, je suis très content de vous rencontrer ici', 'fr');
      detector.recordTurn('npc-1', 'Je voudrais acheter du pain au marché', 'fr');
      const state = detector.getTurnState('npc-1')!;

      engine.trackEvent({
        type: 'conversation_turn_counted',
        npcId: state.npcId,
        totalTurns: state.totalTurns,
        meaningfulTurns: state.meaningfulTurns,
      });

      expect(state.meaningfulTurns).toBe(2);
      expect(obj.completed).toBe(true);
    });
  });

  // ── Multiple objectives from single conversation ──────────────────────

  describe('multiple objectives from a single conversation exchange', () => {
    it('single message can complete multiple objective types', () => {
      const introObj = makeObjective({ id: 'o1', questId: 'q1', type: 'introduce_self' });
      const initConvObj = makeObjective({ id: 'o2', questId: 'q1', type: 'arrival_initiate_conversation' });
      engine.addQuest(makeQuest('q1', [introObj, initConvObj]));

      // made_introduction should complete both introduce_self AND arrival_initiate_conversation
      engine.trackEvent({ type: 'conversational_action', action: 'made_introduction', npcId: 'npc-1' });

      expect(introObj.completed).toBe(true);
      expect(initConvObj.completed).toBe(true);
      expect(questCompletedSpy).toHaveBeenCalledWith('q1');
    });

    it('detector can produce multiple actions that complete different objectives', () => {
      const detector = new ConversationalActionDetector();
      const introObj = makeObjective({ id: 'o1', questId: 'q1', type: 'introduce_self' });
      const langObj = makeObjective({ id: 'o2', questId: 'q1', type: 'used_target_language' });
      engine.addQuest(makeQuest('q1', [introObj, langObj]));

      // Message is both an introduction AND in French
      const actions = detector.detect({
        npcId: 'npc-1',
        npcMessage: 'Qui êtes-vous?',
        playerMessage: 'Je m\'appelle Jean-Pierre, enchanté de vous rencontrer',
        targetLanguage: 'fr',
      });

      for (const action of actions) {
        engine.trackEvent({
          type: 'conversational_action',
          action: action.action,
          npcId: action.npcId,
          topic: action.topic,
          questId: action.questId,
        });
      }

      expect(introObj.completed).toBe(true);
      expect(langObj.completed).toBe(true);
    });
  });

  // ── Quest completion when all conversation objectives done ────────────

  describe('quest completion after all conversation objectives done', () => {
    it('fires quest completed when all objectives are completed', () => {
      const obj1 = makeObjective({ id: 'o1', questId: 'q1', type: 'introduce_self' });
      const obj2 = makeObjective({ id: 'o2', questId: 'q1', type: 'asked_about_topic' });
      engine.addQuest(makeQuest('q1', [obj1, obj2]));

      engine.trackEvent({ type: 'conversational_action', action: 'made_introduction', npcId: 'npc-1' });
      expect(questCompletedSpy).not.toHaveBeenCalled();

      engine.trackEvent({ type: 'conversational_action', action: 'asked_about_topic', npcId: 'npc-1', topic: 'test' });
      expect(questCompletedSpy).toHaveBeenCalledWith('q1');
    });
  });

  // ── Dependency ordering ───────────────────────────────────────────────

  describe('conversation objectives with dependency ordering', () => {
    it('locked objective is not completed until dependency met', () => {
      const obj1 = makeObjective({ id: 'o1', questId: 'q1', type: 'introduce_self', order: 1 });
      const obj2 = makeObjective({ id: 'o2', questId: 'q1', type: 'asked_about_topic', order: 2 });
      engine.addQuest(makeQuest('q1', [obj1, obj2]));

      // Try to complete obj2 first — should be blocked by obj1
      engine.trackEvent({ type: 'conversational_action', action: 'asked_about_topic', npcId: 'npc-1', topic: 'test' });
      expect(obj2.completed).toBe(false);

      // Complete obj1
      engine.trackEvent({ type: 'conversational_action', action: 'made_introduction', npcId: 'npc-1' });
      expect(obj1.completed).toBe(true);

      // Now obj2 can complete
      engine.trackEvent({ type: 'conversational_action', action: 'asked_about_topic', npcId: 'npc-1', topic: 'test' });
      expect(obj2.completed).toBe(true);
    });
  });

  // ── getConversationGoalObjectives ─────────────────────────────────────

  describe('getConversationGoalObjectives', () => {
    it('returns incomplete objectives with conversationGoal set', () => {
      const obj1 = makeObjective({
        id: 'o1', questId: 'q1', type: 'talk_to_npc',
        conversationGoal: 'Ask about the town history',
      });
      const obj2 = makeObjective({ id: 'o2', questId: 'q1', type: 'collect_item' });
      engine.addQuest(makeQuest('q1', [obj1, obj2]));

      const goals = engine.getConversationGoalObjectives();
      expect(goals).toHaveLength(1);
      expect(goals[0].questId).toBe('q1');
      expect(goals[0].objective.id).toBe('o1');
    });

    it('excludes completed goals', () => {
      const obj = makeObjective({
        id: 'o1', questId: 'q1', type: 'talk_to_npc',
        conversationGoal: 'Ask about history', completed: true,
      });
      engine.addQuest(makeQuest('q1', [obj]));

      expect(engine.getConversationGoalObjectives()).toHaveLength(0);
    });

    it('excludes locked goals', () => {
      const obj1 = makeObjective({ id: 'o1', questId: 'q1', type: 'introduce_self', order: 1 });
      const obj2 = makeObjective({
        id: 'o2', questId: 'q1', type: 'talk_to_npc',
        conversationGoal: 'Locked goal', order: 2,
      });
      engine.addQuest(makeQuest('q1', [obj1, obj2]));

      expect(engine.getConversationGoalObjectives()).toHaveLength(0);
    });
  });
});
