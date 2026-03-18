import { describe, it, expect } from 'vitest';
import {
  findRelevantQuests,
  buildQuestGuidance,
  getQuestGuidanceForNPC,
} from '../services/conversation/npc-quest-guidance.js';
import type { Quest } from '@shared/schema';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeQuest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: 'quest-1',
    worldId: 'world-1',
    title: 'Test Quest',
    description: 'A test quest',
    questType: 'language',
    status: 'active',
    objectives: [],
    progress: {},
    assignedTo: 'player-1',
    assignedBy: null,
    assignedByCharacterId: null,
    assignedAt: new Date(),
    completedAt: null,
    difficulty: 'beginner',
    targetLanguage: 'Spanish',
    completionCriteria: {},
    experienceReward: 100,
    conversationContext: null,
    content: null,
    rewards: null,
    questChainId: null,
    questChainOrder: null,
    prerequisiteQuestIds: null,
    category: null,
    ...overrides,
  } as Quest;
}

// ── findRelevantQuests ───────────────────────────────────────────────────────

describe('findRelevantQuests', () => {
  it('returns empty array when no quests match', () => {
    const quests = [makeQuest({ assignedByCharacterId: 'other-npc' })];
    const result = findRelevantQuests('npc-1', 'John Smith', quests);
    expect(result).toEqual([]);
  });

  it('identifies quest giver role', () => {
    const quests = [
      makeQuest({
        assignedByCharacterId: 'npc-1',
        objectives: [
          { type: 'use_vocabulary', description: 'Use greetings', vocabulary: ['hola', 'buenos dias'] },
        ],
      }),
    ];
    const result = findRelevantQuests('npc-1', 'John Smith', quests);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('quest_giver');
    expect(result[0].relevantObjectives).toHaveLength(1);
  });

  it('identifies objective target role by ID', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'talk_to_npc', description: 'Talk to John', targetId: 'npc-1' },
        ],
      }),
    ];
    const result = findRelevantQuests('npc-1', 'John Smith', quests);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('objective_target');
  });

  it('identifies objective target role by name match', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'deliver_item', description: 'Deliver bread', target: 'John Smith' },
        ],
      }),
    ];
    const result = findRelevantQuests('npc-1', 'John Smith', quests);
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe('objective_target');
  });

  it('is case-insensitive for name matching', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'talk_to_npc', description: 'Talk to john', target: 'john smith' },
        ],
      }),
    ];
    const result = findRelevantQuests('npc-1', 'John Smith', quests);
    expect(result).toHaveLength(1);
  });

  it('skips completed objectives', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'talk_to_npc', description: 'Talk to John', targetId: 'npc-1', completed: true },
        ],
      }),
    ];
    const result = findRelevantQuests('npc-1', 'John Smith', quests);
    expect(result).toEqual([]);
  });

  it('skips non-active quests', () => {
    const quests = [
      makeQuest({
        status: 'completed',
        assignedByCharacterId: 'npc-1',
        objectives: [{ type: 'talk_to_npc', targetId: 'npc-1' }],
      }),
    ];
    const result = findRelevantQuests('npc-1', 'John Smith', quests);
    expect(result).toEqual([]);
  });

  it('handles multiple quests for the same NPC', () => {
    const quests = [
      makeQuest({
        id: 'quest-1',
        assignedByCharacterId: 'npc-1',
        objectives: [{ type: 'use_vocabulary', vocabulary: ['hola'] }],
      }),
      makeQuest({
        id: 'quest-2',
        objectives: [{ type: 'deliver_item', target: 'John Smith' }],
      }),
    ];
    const result = findRelevantQuests('npc-1', 'John Smith', quests);
    expect(result).toHaveLength(2);
    expect(result[0].role).toBe('quest_giver');
    expect(result[1].role).toBe('objective_target');
  });

  it('quest giver with no targeted objectives includes all incomplete objectives', () => {
    const quests = [
      makeQuest({
        assignedByCharacterId: 'npc-1',
        objectives: [
          { type: 'visit_location', description: 'Visit the market', target: 'Market' },
          { type: 'collect_item', description: 'Get a fish', target: 'Fish', completed: true },
        ],
      }),
    ];
    const result = findRelevantQuests('npc-1', 'John Smith', quests);
    expect(result).toHaveLength(1);
    expect(result[0].relevantObjectives).toHaveLength(1);
    expect(result[0].relevantObjectives[0].type).toBe('visit_location');
  });
});

// ── buildQuestGuidance ───────────────────────────────────────────────────────

describe('buildQuestGuidance', () => {
  it('returns no guidance for empty contexts', () => {
    const result = buildQuestGuidance([]);
    expect(result.hasGuidance).toBe(false);
    expect(result.systemPromptAddition).toBe('');
  });

  it('generates guidance for talk_to_npc objective', () => {
    const result = buildQuestGuidance([
      {
        questId: 'q1',
        questTitle: 'Greet the Elder',
        questDescription: 'Talk to the village elder',
        role: 'objective_target',
        relevantObjectives: [
          { type: 'talk_to_npc', description: 'Talk to Elder', targetId: 'npc-1' },
        ],
      },
    ]);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('NPC-GUIDED CONVERSATION MODE');
    expect(result.systemPromptAddition).toContain('Greet the Elder');
    expect(result.systemPromptAddition).toContain('welcoming');
  });

  it('generates vocabulary guidance with word list', () => {
    const result = buildQuestGuidance([
      {
        questId: 'q1',
        questTitle: 'Market Words',
        questDescription: 'Learn market vocabulary',
        role: 'quest_giver',
        relevantObjectives: [
          {
            type: 'use_vocabulary',
            vocabulary: ['pan', 'leche', 'queso'],
            required: 3,
            current: 1,
          },
        ],
      },
    ]);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('pan, leche, queso');
    expect(result.systemPromptAddition).toContain('2 more word(s)');
  });

  it('generates conversation turn guidance with remaining count', () => {
    const result = buildQuestGuidance([
      {
        questId: 'q1',
        questTitle: 'Deep Talk',
        questDescription: 'Have a long conversation',
        role: 'objective_target',
        relevantObjectives: [
          { type: 'complete_conversation', required: 5, current: 2 },
        ],
      },
    ]);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('3 more turn(s)');
  });

  it('includes immersion instruction', () => {
    const result = buildQuestGuidance([
      {
        questId: 'q1',
        questTitle: 'Test',
        questDescription: '',
        role: 'quest_giver',
        relevantObjectives: [{ type: 'talk_to_npc' }],
      },
    ]);
    expect(result.systemPromptAddition).toContain('Stay in character');
    expect(result.systemPromptAddition).toContain('do not break immersion');
  });

  it('handles unknown objective types with default guidance', () => {
    const result = buildQuestGuidance([
      {
        questId: 'q1',
        questTitle: 'Custom Quest',
        questDescription: '',
        role: 'objective_target',
        relevantObjectives: [
          { type: 'unknown_type', description: 'Do something special' },
        ],
      },
    ]);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('Do something special');
  });

  it('returns guidance contexts in result', () => {
    const contexts = [
      {
        questId: 'q1',
        questTitle: 'Test',
        questDescription: '',
        role: 'quest_giver' as const,
        relevantObjectives: [{ type: 'talk_to_npc' }],
      },
    ];
    const result = buildQuestGuidance(contexts);
    expect(result.guidanceContexts).toBe(contexts);
  });
});

// ── getQuestGuidanceForNPC (integration) ─────────────────────────────────────

describe('getQuestGuidanceForNPC', () => {
  it('returns no guidance when NPC has no relevant quests', () => {
    const quests = [makeQuest()];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(false);
  });

  it('produces complete guidance for quest giver with vocabulary objectives', () => {
    const quests = [
      makeQuest({
        assignedByCharacterId: 'npc-1',
        objectives: [
          { type: 'use_vocabulary', vocabulary: ['hola', 'adios'], required: 2, current: 0 },
          { type: 'complete_conversation', required: 3, current: 0 },
        ],
      }),
    ];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('hola, adios');
    expect(result.systemPromptAddition).toContain('3 more turn(s)');
    expect(result.guidanceContexts).toHaveLength(1);
  });

  it('handles deliver_item objective targeting the NPC', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'deliver_item', target: 'John Smith', description: 'Deliver the bread' },
        ],
      }),
    ];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('deliver');
  });

  it('generates listening comprehension guidance', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'listening_comprehension', targetId: 'npc-1', required: 1, current: 0 },
        ],
      }),
    ];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('listening comprehension');
    expect(result.systemPromptAddition).toContain('story');
  });

  it('adds conversation-only mode context for purely verbal quests', () => {
    const quests = [
      makeQuest({
        assignedByCharacterId: 'npc-1',
        objectives: [
          { type: 'talk_to_npc', targetId: 'npc-1', required: 1, current: 0 },
          { type: 'use_vocabulary', vocabulary: ['hola'], required: 1, current: 0 },
          { type: 'complete_conversation', required: 3, current: 0 },
        ],
      }),
    ];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('CONVERSATION-ONLY QUEST ACTIVE');
    expect(result.systemPromptAddition).toContain('entirely through dialogue');
    expect(result.systemPromptAddition).toContain('CONVERSATION-ONLY');
  });

  it('does not add conversation-only context for mixed quests', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'talk_to_npc', targetId: 'npc-1', target: 'John Smith' },
          { type: 'collect_item', targetId: 'npc-1', target: 'John Smith', description: 'Collect bread' },
        ],
      }),
    ];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).not.toContain('CONVERSATION-ONLY QUEST ACTIVE');
  });

  it('generates order_food guidance', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'order_food', targetId: 'npc-1', required: 1, current: 0 },
        ],
      }),
    ];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('order');
    expect(result.systemPromptAddition).toContain('menu');
  });

  it('generates introduce_self guidance', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'introduce_self', targetId: 'npc-1' },
        ],
      }),
    ];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('introduce');
  });

  it('generates haggle_price guidance', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'haggle_price', targetId: 'npc-1' },
        ],
      }),
    ];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('negotiate');
  });

  it('generates build_friendship guidance with remaining count', () => {
    const quests = [
      makeQuest({
        objectives: [
          { type: 'build_friendship', targetId: 'npc-1', required: 5, current: 2 },
        ],
      }),
    ];
    const result = getQuestGuidanceForNPC('npc-1', 'John Smith', quests);
    expect(result.hasGuidance).toBe(true);
    expect(result.systemPromptAddition).toContain('3 more meaningful exchange(s)');
  });
});
