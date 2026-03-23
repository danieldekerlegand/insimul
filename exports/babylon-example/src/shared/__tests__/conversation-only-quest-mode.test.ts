import { describe, it, expect } from 'vitest';
import {
  CONVERSATION_ONLY_OBJECTIVE_TYPES,
  CONVERSATION_ONLY_ACHIEVABLE_TYPES,
  isConversationOnlyObjectiveType,
  isConversationOnlyQuest,
  buildConversationOnlyObjectiveTypePrompt,
  VALID_OBJECTIVE_TYPES,
} from '../quest-objective-types.js';

// ── CONVERSATION_ONLY_OBJECTIVE_TYPES ────────────────────────────────────────

describe('CONVERSATION_ONLY_OBJECTIVE_TYPES', () => {
  it('contains only valid objective types', () => {
    for (const type of CONVERSATION_ONLY_OBJECTIVE_TYPES) {
      expect(VALID_OBJECTIVE_TYPES.has(type)).toBe(true);
    }
  });

  it('does not contain physical/movement objective types', () => {
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('visit_location')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('collect_item')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('deliver_item')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('defeat_enemies')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('craft_item')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('escort_npc')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('discover_location')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('navigate_language')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('collect_vocabulary')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('identify_object')).toBe(false);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('follow_directions')).toBe(false);
  });

  it('contains core conversation objective types', () => {
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('talk_to_npc')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('complete_conversation')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('use_vocabulary')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('listening_comprehension')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('pronunciation_check')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('translation_challenge')).toBe(true);
  });

  it('contains verbal interaction objective types', () => {
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('listen_and_repeat')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('ask_for_directions')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('order_food')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('haggle_price')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('introduce_self')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('describe_scene')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('write_response')).toBe(true);
    expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has('build_friendship')).toBe(true);
  });
});

// ── isConversationOnlyObjectiveType ──────────────────────────────────────────

describe('isConversationOnlyObjectiveType', () => {
  it('returns true for conversation-only types', () => {
    expect(isConversationOnlyObjectiveType('talk_to_npc')).toBe(true);
    expect(isConversationOnlyObjectiveType('use_vocabulary')).toBe(true);
    expect(isConversationOnlyObjectiveType('order_food')).toBe(true);
  });

  it('returns false for physical objective types', () => {
    expect(isConversationOnlyObjectiveType('collect_item')).toBe(false);
    expect(isConversationOnlyObjectiveType('visit_location')).toBe(false);
    expect(isConversationOnlyObjectiveType('defeat_enemies')).toBe(false);
  });

  it('returns false for unknown types', () => {
    expect(isConversationOnlyObjectiveType('unknown_type')).toBe(false);
    expect(isConversationOnlyObjectiveType('')).toBe(false);
  });
});

// ── isConversationOnlyQuest ─────────────────────────────────────────────────

describe('isConversationOnlyQuest', () => {
  it('returns true when all objectives are conversation-only', () => {
    const objectives = [
      { type: 'talk_to_npc', description: 'Talk to Maria' },
      { type: 'use_vocabulary', description: 'Use greeting words' },
      { type: 'complete_conversation', description: 'Have a 5-turn conversation' },
    ];
    expect(isConversationOnlyQuest(objectives)).toBe(true);
  });

  it('returns false when any objective requires physical action', () => {
    const objectives = [
      { type: 'talk_to_npc', description: 'Talk to Maria' },
      { type: 'collect_item', description: 'Collect the book' },
    ];
    expect(isConversationOnlyQuest(objectives)).toBe(false);
  });

  it('returns false for empty objectives array', () => {
    expect(isConversationOnlyQuest([])).toBe(false);
  });

  it('returns false for null/undefined objectives', () => {
    expect(isConversationOnlyQuest(null as any)).toBe(false);
    expect(isConversationOnlyQuest(undefined as any)).toBe(false);
  });

  it('returns true for single conversation objective', () => {
    const objectives = [
      { type: 'introduce_self', description: 'Introduce yourself to the shopkeeper' },
    ];
    expect(isConversationOnlyQuest(objectives)).toBe(true);
  });

  it('returns false when a location visit is mixed in', () => {
    const objectives = [
      { type: 'order_food', description: 'Order a coffee' },
      { type: 'visit_location', description: 'Go to the cafe' },
    ];
    expect(isConversationOnlyQuest(objectives)).toBe(false);
  });

  it('handles complex multi-objective conversation-only quest', () => {
    const objectives = [
      { type: 'introduce_self', description: 'Introduce yourself' },
      { type: 'use_vocabulary', description: 'Use food words' },
      { type: 'order_food', description: 'Order a meal' },
      { type: 'haggle_price', description: 'Negotiate the price' },
      { type: 'translation_challenge', description: 'Translate the menu' },
      { type: 'build_friendship', description: 'Build rapport with chef' },
    ];
    expect(isConversationOnlyQuest(objectives)).toBe(true);
  });
});

// ── CONVERSATION_ONLY_ACHIEVABLE_TYPES ──────────────────────────────────────

describe('CONVERSATION_ONLY_ACHIEVABLE_TYPES', () => {
  it('only contains types from CONVERSATION_ONLY_OBJECTIVE_TYPES', () => {
    for (const typeInfo of CONVERSATION_ONLY_ACHIEVABLE_TYPES) {
      expect(CONVERSATION_ONLY_OBJECTIVE_TYPES.has(typeInfo.type)).toBe(true);
    }
  });

  it('has same count as CONVERSATION_ONLY_OBJECTIVE_TYPES', () => {
    expect(CONVERSATION_ONLY_ACHIEVABLE_TYPES.length).toBe(CONVERSATION_ONLY_OBJECTIVE_TYPES.size);
  });

  it('has description and playerAction for each type', () => {
    for (const typeInfo of CONVERSATION_ONLY_ACHIEVABLE_TYPES) {
      expect(typeInfo.description).toBeTruthy();
      expect(typeInfo.playerAction).toBeTruthy();
    }
  });
});

// ── buildConversationOnlyObjectiveTypePrompt ────────────────────────────────

describe('buildConversationOnlyObjectiveTypePrompt', () => {
  it('includes CONVERSATION-ONLY header', () => {
    const prompt = buildConversationOnlyObjectiveTypePrompt();
    expect(prompt).toContain('CONVERSATION-ONLY QUEST MODE');
  });

  it('includes all conversation-only types', () => {
    const prompt = buildConversationOnlyObjectiveTypePrompt();
    for (const type of CONVERSATION_ONLY_OBJECTIVE_TYPES) {
      expect(prompt).toContain(`"${type}"`);
    }
  });

  it('does not include physical objective types', () => {
    const prompt = buildConversationOnlyObjectiveTypePrompt();
    expect(prompt).not.toContain('"collect_item"');
    expect(prompt).not.toContain('"visit_location"');
    expect(prompt).not.toContain('"defeat_enemies"');
    expect(prompt).not.toContain('"craft_item"');
  });

  it('warns against physical objectives', () => {
    const prompt = buildConversationOnlyObjectiveTypePrompt();
    expect(prompt).toContain('DO NOT use movement');
  });

  it('states quest is completable through dialogue', () => {
    const prompt = buildConversationOnlyObjectiveTypePrompt();
    expect(prompt).toContain('ENTIRELY through conversation');
  });
});
