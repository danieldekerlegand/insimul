import { describe, it, expect } from 'vitest';
import {
  generateFallbackHints,
  buildQuestHints,
  requestHint,
  getTotalHintsUsed,
  getTotalHintXpCost,
  calculateHintPenalty,
  buildHintGenerationPrompt,
  HINT_XP_COSTS,
  type QuestHintsData,
  type ObjectiveHints,
} from '../quest-hints';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeObjective(type: string, overrides: Record<string, any> = {}) {
  return { type, description: `Test ${type} objective`, target: 'test_target', required: 1, ...overrides };
}

// ── generateFallbackHints ────────────────────────────────────────────────────

describe('generateFallbackHints', () => {
  it('generates 3 hints for visit_location', () => {
    const result = generateFallbackHints(makeObjective('visit_location'), 0);
    expect(result.hints).toHaveLength(3);
    expect(result.hints[0].level).toBe(1);
    expect(result.hints[1].level).toBe(2);
    expect(result.hints[2].level).toBe(3);
    expect(result.hintsUsed).toBe(0);
    expect(result.objectiveIndex).toBe(0);
  });

  it('generates 3 hints for talk_to_npc', () => {
    const result = generateFallbackHints(makeObjective('talk_to_npc', { target: 'Marie' }), 1);
    expect(result.hints).toHaveLength(3);
    expect(result.hints[1].text).toContain('Marie');
    expect(result.objectiveIndex).toBe(1);
  });

  it('generates 3 hints for use_vocabulary with target words', () => {
    const result = generateFallbackHints(
      makeObjective('use_vocabulary', { targetWords: ['bonjour', 'merci'] }),
      0,
    );
    expect(result.hints).toHaveLength(3);
    expect(result.hints[2].text).toContain('bonjour');
    expect(result.hints[2].text).toContain('merci');
  });

  it('generates 3 hints for identify_object with english meaning', () => {
    const result = generateFallbackHints(
      makeObjective('identify_object', { englishMeaning: 'bread' }),
      0,
    );
    expect(result.hints[2].text).toContain('bread');
  });

  it('generates hints for navigate_language with english meaning', () => {
    const result = generateFallbackHints(
      makeObjective('navigate_language', { englishMeaning: 'Turn left at the fountain' }),
      0,
    );
    expect(result.hints[2].text).toContain('Turn left at the fountain');
  });

  it('generates generic hints for unknown objective types', () => {
    const result = generateFallbackHints(makeObjective('unknown_type'), 2);
    expect(result.hints).toHaveLength(3);
    expect(result.objectiveIndex).toBe(2);
  });

  const objectiveTypes = [
    'visit_location', 'discover_location', 'talk_to_npc', 'complete_conversation',
    'use_vocabulary', 'collect_vocabulary', 'identify_object', 'collect_item',
    'deliver_item', 'listening_comprehension', 'translation_challenge',
    'navigate_language', 'follow_directions', 'pronunciation_check',
  ];

  for (const type of objectiveTypes) {
    it(`generates 3 levels for ${type}`, () => {
      const result = generateFallbackHints(makeObjective(type), 0);
      expect(result.hints).toHaveLength(3);
      expect(result.hints.map(h => h.level)).toEqual([1, 2, 3]);
    });
  }
});

// ── buildQuestHints ──────────────────────────────────────────────────────────

describe('buildQuestHints', () => {
  it('builds hints data with fallback hints for all objectives', () => {
    const objectives = [
      makeObjective('visit_location'),
      makeObjective('talk_to_npc'),
    ];
    const data = buildQuestHints('quest-1', objectives);
    expect(data.questId).toBe('quest-1');
    expect(data.objectiveHints).toHaveLength(2);
    expect(data.objectiveHints[0].objectiveIndex).toBe(0);
    expect(data.objectiveHints[1].objectiveIndex).toBe(1);
  });

  it('uses AI-generated hints when provided with 3+ hints', () => {
    const objectives = [makeObjective('visit_location')];
    const aiHints = [{
      objectiveIndex: 0,
      hints: [
        { level: 1 as const, text: 'AI hint level 1' },
        { level: 2 as const, text: 'AI hint level 2' },
        { level: 3 as const, text: 'AI hint level 3' },
      ],
    }];
    const data = buildQuestHints('quest-2', objectives, aiHints);
    expect(data.objectiveHints[0].hints[0].text).toBe('AI hint level 1');
    expect(data.objectiveHints[0].hints[1].text).toBe('AI hint level 2');
    expect(data.objectiveHints[0].hints[2].text).toBe('AI hint level 3');
  });

  it('falls back when AI hints have fewer than 3 entries', () => {
    const objectives = [makeObjective('visit_location')];
    const aiHints = [{
      objectiveIndex: 0,
      hints: [{ level: 1 as const, text: 'Only one hint' }],
    }];
    const data = buildQuestHints('quest-3', objectives, aiHints);
    // Should use fallback since AI provided < 3 hints
    expect(data.objectiveHints[0].hints[0].text).not.toBe('Only one hint');
    expect(data.objectiveHints[0].hints).toHaveLength(3);
  });

  it('handles empty objectives array', () => {
    const data = buildQuestHints('quest-4', []);
    expect(data.objectiveHints).toHaveLength(0);
  });
});

// ── requestHint ──────────────────────────────────────────────────────────────

describe('requestHint', () => {
  function makeHintsData(): QuestHintsData {
    return buildQuestHints('quest-1', [
      makeObjective('visit_location'),
      makeObjective('talk_to_npc'),
    ]);
  }

  it('returns level 1 hint on first request', () => {
    const data = makeHintsData();
    const result = requestHint(data, 0);
    expect(result).not.toBeNull();
    expect(result!.hint.level).toBe(1);
    expect(result!.xpCost).toBe(HINT_XP_COSTS[1]);
  });

  it('returns level 2 hint on second request', () => {
    const data = makeHintsData();
    requestHint(data, 0); // level 1
    const result = requestHint(data, 0); // level 2
    expect(result!.hint.level).toBe(2);
    expect(result!.xpCost).toBe(HINT_XP_COSTS[2]);
  });

  it('returns level 3 hint on third request', () => {
    const data = makeHintsData();
    requestHint(data, 0);
    requestHint(data, 0);
    const result = requestHint(data, 0);
    expect(result!.hint.level).toBe(3);
    expect(result!.xpCost).toBe(HINT_XP_COSTS[3]);
  });

  it('returns null after all 3 hints used', () => {
    const data = makeHintsData();
    requestHint(data, 0);
    requestHint(data, 0);
    requestHint(data, 0);
    const result = requestHint(data, 0);
    expect(result).toBeNull();
  });

  it('returns null for invalid objective index', () => {
    const data = makeHintsData();
    expect(requestHint(data, 99)).toBeNull();
  });

  it('tracks hints independently per objective', () => {
    const data = makeHintsData();
    requestHint(data, 0); // obj 0: level 1
    requestHint(data, 1); // obj 1: level 1
    requestHint(data, 0); // obj 0: level 2

    expect(data.objectiveHints[0].hintsUsed).toBe(2);
    expect(data.objectiveHints[1].hintsUsed).toBe(1);
  });

  it('increments hintsUsed on the ObjectiveHints', () => {
    const data = makeHintsData();
    expect(data.objectiveHints[0].hintsUsed).toBe(0);
    requestHint(data, 0);
    expect(data.objectiveHints[0].hintsUsed).toBe(1);
    requestHint(data, 0);
    expect(data.objectiveHints[0].hintsUsed).toBe(2);
  });
});

// ── getTotalHintsUsed ────────────────────────────────────────────────────────

describe('getTotalHintsUsed', () => {
  it('returns 0 for fresh hints data', () => {
    const data = buildQuestHints('q1', [makeObjective('visit_location')]);
    expect(getTotalHintsUsed(data)).toBe(0);
  });

  it('counts hints across all objectives', () => {
    const data = buildQuestHints('q1', [
      makeObjective('visit_location'),
      makeObjective('talk_to_npc'),
    ]);
    requestHint(data, 0);
    requestHint(data, 0);
    requestHint(data, 1);
    expect(getTotalHintsUsed(data)).toBe(3);
  });
});

// ── getTotalHintXpCost ───────────────────────────────────────────────────────

describe('getTotalHintXpCost', () => {
  it('returns 0 for no hints used', () => {
    const data = buildQuestHints('q1', [makeObjective('visit_location')]);
    expect(getTotalHintXpCost(data)).toBe(0);
  });

  it('sums XP cost correctly for revealed hints', () => {
    const data = buildQuestHints('q1', [makeObjective('visit_location')]);
    requestHint(data, 0); // level 1: 5 XP
    requestHint(data, 0); // level 2: 15 XP
    expect(getTotalHintXpCost(data)).toBe(5 + 15);
  });

  it('sums XP cost across objectives', () => {
    const data = buildQuestHints('q1', [
      makeObjective('visit_location'),
      makeObjective('talk_to_npc'),
    ]);
    requestHint(data, 0); // obj 0 level 1: 5
    requestHint(data, 1); // obj 1 level 1: 5
    requestHint(data, 1); // obj 1 level 2: 15
    expect(getTotalHintXpCost(data)).toBe(5 + 5 + 15);
  });

  it('sums all 3 levels correctly', () => {
    const data = buildQuestHints('q1', [makeObjective('visit_location')]);
    requestHint(data, 0); // 5
    requestHint(data, 0); // 15
    requestHint(data, 0); // 30
    expect(getTotalHintXpCost(data)).toBe(5 + 15 + 30);
  });
});

// ── calculateHintPenalty ─────────────────────────────────────────────────────

describe('calculateHintPenalty', () => {
  it('returns 1.0 for 0 hints', () => {
    expect(calculateHintPenalty(0)).toBe(1.0);
  });

  it('returns 0.9 for 1 hint', () => {
    expect(calculateHintPenalty(1)).toBe(0.9);
  });

  it('returns 0.8 for 2 hints', () => {
    expect(calculateHintPenalty(2)).toBe(0.8);
  });

  it('returns 0.7 for 3-4 hints', () => {
    expect(calculateHintPenalty(3)).toBe(0.7);
    expect(calculateHintPenalty(4)).toBe(0.7);
  });

  it('returns 0.6 for 5-6 hints', () => {
    expect(calculateHintPenalty(5)).toBe(0.6);
    expect(calculateHintPenalty(6)).toBe(0.6);
  });

  it('returns minimum 0.5 for 7+ hints', () => {
    expect(calculateHintPenalty(7)).toBe(0.5);
    expect(calculateHintPenalty(100)).toBe(0.5);
  });

  it('returns 1.0 for negative values', () => {
    expect(calculateHintPenalty(-1)).toBe(1.0);
  });
});

// ── HINT_XP_COSTS ────────────────────────────────────────────────────────────

describe('HINT_XP_COSTS', () => {
  it('has increasing costs per level', () => {
    expect(HINT_XP_COSTS[1]).toBeLessThan(HINT_XP_COSTS[2]);
    expect(HINT_XP_COSTS[2]).toBeLessThan(HINT_XP_COSTS[3]);
  });

  it('has expected values', () => {
    expect(HINT_XP_COSTS[1]).toBe(5);
    expect(HINT_XP_COSTS[2]).toBe(15);
    expect(HINT_XP_COSTS[3]).toBe(30);
  });
});

// ── buildHintGenerationPrompt ────────────────────────────────────────────────

describe('buildHintGenerationPrompt', () => {
  it('includes all 3 levels', () => {
    const prompt = buildHintGenerationPrompt();
    expect(prompt).toContain('Level 1');
    expect(prompt).toContain('Level 2');
    expect(prompt).toContain('Level 3');
  });

  it('mentions vocabulary and location specifics', () => {
    const prompt = buildHintGenerationPrompt();
    expect(prompt).toContain('vocabulary');
    expect(prompt).toContain('location');
  });
});
