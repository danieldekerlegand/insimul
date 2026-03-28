/**
 * Tests for ActivityObservationRewards
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActivityObservationRewards } from '../game-engine/logic/ActivityObservationRewards';
import { GameEventBus } from '../game-engine/logic/GameEventBus';
import { QuestCompletionEngine } from '../game-engine/logic/QuestCompletionEngine';

describe('ActivityObservationRewards', () => {
  let rewards: ActivityObservationRewards;
  let eventBus: GameEventBus;

  beforeEach(() => {
    rewards = new ActivityObservationRewards();
    eventBus = new GameEventBus();
    rewards.setEventBus(eventBus);
  });

  it('emits activity_observed event on observation', () => {
    const events: any[] = [];
    eventBus.on('activity_observed', (e) => events.push(e));

    rewards.processObservation('npc-1', 'Pierre', 'cooking', 6);

    expect(events.length).toBe(1);
    expect(events[0].npcId).toBe('npc-1');
    expect(events[0].npcName).toBe('Pierre');
    expect(events[0].activity).toBe('cooking');
    expect(events[0].durationSeconds).toBe(6);
  });

  it('returns activity translation for known activities', () => {
    const result = rewards.processObservation('npc-1', 'Pierre', 'cooking', 6);

    expect(result.activityTranslation).not.toBeNull();
    expect(result.activityTranslation!.targetPhrase).toBe('Il cuisine');
    expect(result.activityTranslation!.translation).toBe('He is cooking');
  });

  it('returns null translation for unknown activities', () => {
    const result = rewards.processObservation('npc-1', 'Pierre', 'unknown_action', 6);
    expect(result.activityTranslation).toBeNull();
  });

  it('adds vocabulary word for new observations', () => {
    const addWord = vi.fn();
    rewards.setAddVocabularyWord(addWord);

    rewards.processObservation('npc-1', 'Pierre', 'cooking', 6);

    expect(addWord).toHaveBeenCalledWith('Il cuisine', 'He is cooking', 'activity');
  });

  it('does not add duplicate vocabulary for same NPC+activity', () => {
    const addWord = vi.fn();
    rewards.setAddVocabularyWord(addWord);

    rewards.processObservation('npc-1', 'Pierre', 'cooking', 6);
    rewards.processObservation('npc-1', 'Pierre', 'cooking', 7);

    expect(addWord).toHaveBeenCalledTimes(1);
  });

  it('adds vocabulary for different activities on same NPC', () => {
    const addWord = vi.fn();
    rewards.setAddVocabularyWord(addWord);

    rewards.processObservation('npc-1', 'Pierre', 'cooking', 6);
    rewards.processObservation('npc-1', 'Pierre', 'reading', 6);

    expect(addWord).toHaveBeenCalledTimes(2);
  });

  it('calls showToast callback', () => {
    const showToast = vi.fn();
    rewards.setShowToast(showToast);

    rewards.processObservation('npc-1', 'Pierre', 'painting', 5);

    expect(showToast).toHaveBeenCalledOnce();
    const result = showToast.mock.calls[0][0];
    expect(result.npcName).toBe('Pierre');
    expect(result.activity).toBe('painting');
    expect(result.activityTranslation!.targetPhrase).toBe('Il peint');
  });

  it('hasObserved tracks observation state', () => {
    expect(rewards.hasObserved('npc-1', 'cooking')).toBe(false);
    rewards.processObservation('npc-1', 'Pierre', 'cooking', 6);
    expect(rewards.hasObserved('npc-1', 'cooking')).toBe(true);
    expect(rewards.hasObserved('npc-1', 'reading')).toBe(false);
  });

  it('serialize and restore preserves observation state', () => {
    rewards.processObservation('npc-1', 'Pierre', 'cooking', 6);
    rewards.processObservation('npc-2', 'Marie', 'reading', 5);

    const saved = rewards.serialize();

    const rewards2 = new ActivityObservationRewards();
    rewards2.restore(saved);

    expect(rewards2.hasObserved('npc-1', 'cooking')).toBe(true);
    expect(rewards2.hasObserved('npc-2', 'reading')).toBe(true);
    expect(rewards2.hasObserved('npc-1', 'painting')).toBe(false);
  });

  it('static getActivityTranslation works for known activities', () => {
    const t = ActivityObservationRewards.getActivityTranslation('working');
    expect(t).not.toBeNull();
    expect(t!.targetPhrase).toBe('Il travaille');

    const unknown = ActivityObservationRewards.getActivityTranslation('flying');
    expect(unknown).toBeNull();
  });

  describe('integration with QuestCompletionEngine', () => {
    it('activity_observed event can complete observe_activity objectives', () => {
      const engine = new QuestCompletionEngine();

      const obj = {
        id: 'obj-1',
        questId: 'q1',
        type: 'observe_activity',
        description: 'Watch the baker',
        completed: false,
        targetActivity: 'cooking',
        requiredCount: 1,
      };
      engine.addQuest({ id: 'q1', objectives: [obj] });

      // Simulate event from ActivityObservationRewards → QuestCompletionEngine
      engine.trackEvent({
        type: 'activity_observed',
        npcId: 'npc-1',
        npcName: 'Baker',
        activity: 'cooking',
        durationSeconds: 6,
      });

      expect(obj.completed).toBe(true);
    });
  });
});
