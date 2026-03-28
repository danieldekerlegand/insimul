/**
 * Tests for 'conversation_initiation' objective type.
 *
 * Covers:
 * - Canonical type registration and normalization
 * - QuestCompletionEngine tracking for NPC-initiated conversations
 * - NPC quest guidance strategy
 */
import { describe, it, expect, vi } from 'vitest';
import {
  VALID_OBJECTIVE_TYPES,
  normalizeObjectiveType,
  ACHIEVABLE_OBJECTIVE_TYPES,
} from '../quest-objective-types';
import {
  QuestCompletionEngine,
  type CompletionQuest,
} from '../../client/src/components/3DGame/QuestCompletionEngine';
import {
  buildQuestGuidance,
  type QuestGuidanceContext,
} from '../../server/services/conversation/npc-quest-guidance';

// ── Canonical type registration ──

describe('conversation_initiation objective type', () => {
  it('is a valid canonical objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('conversation_initiation')).toBe(true);
  });

  it('has correct type info', () => {
    const info = ACHIEVABLE_OBJECTIVE_TYPES.find(t => t.type === 'conversation_initiation');
    expect(info).toBeDefined();
    expect(info!.requiresTarget).toBe('npc');
    expect(info!.countable).toBe(true);
  });
});

// ── Normalization ──

describe('conversation_initiation normalization', () => {
  it.each([
    'npc_initiated',
    'npc_initiation',
    'npc_proactive',
    'respond_to_npc',
    'accept_conversation',
    'npc_approach',
  ])('normalizes "%s" to conversation_initiation', (alias) => {
    expect(normalizeObjectiveType(alias)).toBe('conversation_initiation');
  });

  it('passes through the canonical type unchanged', () => {
    expect(normalizeObjectiveType('conversation_initiation')).toBe('conversation_initiation');
  });
});

// ── QuestCompletionEngine tracking ──

describe('QuestCompletionEngine — conversation_initiation', () => {
  function makeEngine(quest: CompletionQuest) {
    const engine = new QuestCompletionEngine();
    engine.addQuest(quest);
    return engine;
  }

  function makeQuest(overrides: Record<string, any> = {}): CompletionQuest {
    return {
      id: 'quest-1',
      objectives: [
        {
          id: 'obj-1',
          questId: 'quest-1',
          type: 'conversation_initiation',
          description: 'Respond to an NPC who approaches you',
          completed: false,
          npcId: 'npc-maria',
          requiredCount: 1,
          currentCount: 0,
          ...overrides,
        },
      ],
    };
  }

  it('completes on accepted NPC-initiated conversation', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest());
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({
      type: 'conversation_initiation',
      npcId: 'npc-maria',
      accepted: true,
    });

    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
    expect(engine.getQuests()[0].objectives![0].completed).toBe(true);
  });

  it('does not complete when conversation is rejected', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest());
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({
      type: 'conversation_initiation',
      npcId: 'npc-maria',
      accepted: false,
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(engine.getQuests()[0].objectives![0].completed).toBe(false);
  });

  it('does not complete for wrong NPC', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest());
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({
      type: 'conversation_initiation',
      npcId: 'npc-other',
      accepted: true,
    });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it('completes for any NPC when npcId is not set on objective', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest({ npcId: undefined }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({
      type: 'conversation_initiation',
      npcId: 'npc-anyone',
      accepted: true,
    });

    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('tracks multiple required initiations', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest({ requiredCount: 3, npcId: undefined }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({ type: 'conversation_initiation', npcId: 'npc-a', accepted: true });
    expect(onComplete).not.toHaveBeenCalled();

    engine.trackEvent({ type: 'conversation_initiation', npcId: 'npc-b', accepted: true });
    expect(onComplete).not.toHaveBeenCalled();

    engine.trackEvent({ type: 'conversation_initiation', npcId: 'npc-c', accepted: true });
    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('respects minResponseQuality threshold', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest({ minResponseQuality: 50 }));
    engine.setOnObjectiveCompleted(onComplete);

    // Low quality — does not complete
    engine.trackEvent({
      type: 'conversation_initiation',
      npcId: 'npc-maria',
      accepted: true,
      responseQuality: 30,
    });
    expect(onComplete).not.toHaveBeenCalled();
    expect(engine.getQuests()[0].objectives![0].currentCount).toBe(1);
  });

  it('completes when responseQuality meets threshold', () => {
    const onComplete = vi.fn();
    const engine = makeEngine(makeQuest({ minResponseQuality: 50, requiredCount: 1 }));
    engine.setOnObjectiveCompleted(onComplete);

    engine.trackEvent({
      type: 'conversation_initiation',
      npcId: 'npc-maria',
      accepted: true,
      responseQuality: 75,
    });

    expect(onComplete).toHaveBeenCalledWith('quest-1', 'obj-1');
  });

  it('stores responseQuality on the objective', () => {
    const engine = makeEngine(makeQuest({ minResponseQuality: 50, requiredCount: 2 }));

    engine.trackEvent({
      type: 'conversation_initiation',
      npcId: 'npc-maria',
      accepted: true,
      responseQuality: 60,
    });

    expect(engine.getQuests()[0].objectives![0].responseQuality).toBe(60);
  });

  it('fires quest completed when all objectives done', () => {
    const onQuestComplete = vi.fn();
    const engine = new QuestCompletionEngine();
    engine.setOnQuestCompleted(onQuestComplete);

    engine.addQuest({
      id: 'quest-2',
      objectives: [
        {
          id: 'obj-a',
          questId: 'quest-2',
          type: 'conversation_initiation',
          description: 'Respond to NPC approach',
          completed: false,
          npcId: 'npc-maria',
          requiredCount: 1,
          currentCount: 0,
        },
        {
          id: 'obj-b',
          questId: 'quest-2',
          type: 'talk_to_npc',
          description: 'Talk to the elder',
          completed: true,
          npcId: 'npc-elder',
        },
      ],
    });

    engine.trackEvent({
      type: 'conversation_initiation',
      npcId: 'npc-maria',
      accepted: true,
    });

    expect(onQuestComplete).toHaveBeenCalledWith('quest-2');
  });
});

// ── NPC Quest Guidance ──

describe('NPC quest guidance — conversation_initiation', () => {
  it('generates guidance for conversation_initiation objectives', () => {
    const contexts: QuestGuidanceContext[] = [
      {
        questId: 'q1',
        questTitle: 'Community Welcome',
        questDescription: 'Be welcomed by the community',
        role: 'objective_target',
        relevantObjectives: [
          { type: 'conversation_initiation', description: 'Respond to Maria' },
        ],
      },
    ];

    const result = buildQuestGuidance(contexts);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('proactively approaching');
    expect(result.systemPromptAddition).toContain('target language');
  });
});
