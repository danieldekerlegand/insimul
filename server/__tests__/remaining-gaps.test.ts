import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 1. Rule/Action/Quest Content Validation ────────────────────────────────

import {
  validateRuleContent,
  validateActionContent,
  validateQuestContent,
  type ValidationResult,
} from '../../shared/prolog/content-validators';

describe('Rule/Action/Quest Content Validation', () => {
  describe('validateRuleContent', () => {
    it('accepts valid Prolog rule content', () => {
      const content = `
        rule_type(greet_rule, volition).
        rule_applies(greet_rule, Character, Target) :-
          character(Character),
          character(Target),
          Character \\= Target.
        rule_priority(greet_rule, 5).
        rule_likelihood(greet_rule, 0.8).
        rule_category(greet_rule, social).
        rule_active(greet_rule).
        rule_source(greet_rule, custom).
      `;
      const result = validateRuleContent(content);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects empty content', () => {
      const result = validateRuleContent('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content is empty');
    });

    it('rejects whitespace-only content', () => {
      const result = validateRuleContent('   \n\t  ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content is empty');
    });

    it('flags missing required predicates', () => {
      const content = `
        some_random_fact(hello, world).
      `;
      const result = validateRuleContent(content);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('rule_type'))).toBe(true);
      expect(result.errors.some(e => e.includes('rule_applies'))).toBe(true);
    });

    it('detects unbalanced parentheses as syntax errors', () => {
      const content = `
        rule_type(greet_rule, volition.
        rule_applies(greet_rule, Character, Target) :-
          character(Character).
      `;
      const result = validateRuleContent(content);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('parenthesis'))).toBe(true);
    });

    it('generates warnings for missing recommended predicates', () => {
      const content = `
        rule_type(my_rule, social).
        rule_applies(my_rule, C, T) :- character(C), character(T).
      `;
      const result = validateRuleContent(content);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('rule_priority'))).toBe(true);
    });

    it('detects predicates in the content', () => {
      const content = `
        rule_type(my_rule, social).
        rule_applies(my_rule, C, T) :- character(C), character(T).
      `;
      const result = validateRuleContent(content);
      expect(result.detectedPredicates).toContain('rule_type/2');
      expect(result.detectedPredicates).toContain('rule_applies/3');
    });
  });

  describe('validateActionContent', () => {
    it('accepts valid Prolog action content', () => {
      const content = `
        action(trade_goods, 'Trade Goods', economic, 5).
        can_perform(trade_goods, Character) :-
          character(Character).
        action_effect(trade_goods, gain_gold).
        action_duration(trade_goods, 2).
        action_difficulty(trade_goods, 0.3).
      `;
      const result = validateActionContent(content);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects empty content', () => {
      const result = validateActionContent('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content is empty');
    });

    it('flags missing required action/4 predicate', () => {
      const content = `
        can_perform(my_action, Character) :- character(Character).
      `;
      const result = validateActionContent(content);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('action/4'))).toBe(true);
    });

    it('detects wrong arity for action predicate', () => {
      const content = `
        action(my_action, 'My Action').
      `;
      const result = validateActionContent(content);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('wrong arity'))).toBe(true);
    });

    it('detects unbalanced parentheses as syntax errors', () => {
      const content = `
        action(trade_goods, 'Trade Goods', economic, 5.
      `;
      const result = validateActionContent(content);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('parenthesis'))).toBe(true);
    });
  });

  describe('validateQuestContent', () => {
    it('accepts valid Prolog quest content with quest/3', () => {
      const content = `
        quest(fetch_herbs, 'Fetch Healing Herbs', fetch).
        quest_objective(fetch_herbs, collect, herb, 5).
        quest_reward(fetch_herbs, xp, 100).
        quest_prerequisite(fetch_herbs, level(2)).
        quest_location(fetch_herbs, forest).
      `;
      const result = validateQuestContent(content);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts valid quest content with quest/5', () => {
      const content = `
        quest(fetch_herbs, 'Fetch Healing Herbs', fetch, 3, active).
      `;
      const result = validateQuestContent(content);
      expect(result.isValid).toBe(true);
    });

    it('rejects empty content', () => {
      const result = validateQuestContent('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content is empty');
    });

    it('flags missing required quest predicate', () => {
      const content = `
        quest_objective(fetch_herbs, collect, herb, 5).
      `;
      const result = validateQuestContent(content);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('quest/3'))).toBe(true);
    });

    it('generates warnings for missing recommended predicates', () => {
      const content = `
        quest(my_quest, 'A Quest', adventure).
      `;
      const result = validateQuestContent(content);
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('quest_objective'))).toBe(true);
      expect(result.warnings.some(w => w.includes('quest_reward'))).toBe(true);
    });
  });
});

// ── 2. Volition Scoring (Softmax Action Selection) ─────────────────────────

import {
  softmaxActionSelection,
  softmax,
  computePersonalityMatch,
  type ActionCandidate,
  type PersonalityProfile,
} from '../../shared/game-engine/action-selection';

describe('Volition Scoring', () => {
  const personality: PersonalityProfile = {
    openness: 0.8,
    conscientiousness: 0.3,
    extroversion: 0.6,
    agreeableness: 0.5,
    neuroticism: -0.2,
  };

  const actions: ActionCandidate[] = [
    {
      id: 'explore',
      name: 'Explore',
      baseWeight: 0.5,
      personalityAffinities: { openness: 0.6, extroversion: 0.2 },
    },
    {
      id: 'rest',
      name: 'Rest',
      baseWeight: 0.2,
      personalityAffinities: { conscientiousness: -0.2, neuroticism: 0.1 },
    },
    {
      id: 'fight',
      name: 'Fight',
      baseWeight: 0.1,
      personalityAffinities: { agreeableness: -0.5, extroversion: 0.3 },
    },
  ];

  describe('softmax', () => {
    it('produces a valid probability distribution', () => {
      const probs = softmax([1, 2, 3]);
      expect(probs).toHaveLength(3);
      const sum = probs.reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5);
      // Higher score should have higher probability
      expect(probs[2]).toBeGreaterThan(probs[1]);
      expect(probs[1]).toBeGreaterThan(probs[0]);
    });

    it('with very low temperature the highest score dominates', () => {
      const probs = softmax([1, 5, 2], 0.01);
      // With temperature near 0, should be nearly deterministic
      expect(probs[1]).toBeGreaterThan(0.99);
    });

    it('with very high temperature approaches uniform distribution', () => {
      const probs = softmax([1, 5, 2], 100);
      // With very high temperature, probabilities should be nearly equal
      const avg = 1 / 3;
      for (const p of probs) {
        expect(p).toBeCloseTo(avg, 1);
      }
    });

    it('returns empty array for empty input', () => {
      expect(softmax([])).toEqual([]);
    });
  });

  describe('softmaxActionSelection', () => {
    it('returns null for empty actions', () => {
      expect(softmaxActionSelection([], personality)).toBeNull();
    });

    it('returns the only action with probability 1 for single action', () => {
      const result = softmaxActionSelection([actions[0]], personality);
      expect(result).not.toBeNull();
      expect(result!.selectedAction.id).toBe('explore');
      expect(result!.probability).toBe(1);
    });

    it('returns allProbabilities that sum to 1', () => {
      const result = softmaxActionSelection(actions, personality);
      expect(result).not.toBeNull();
      const sum = result!.allProbabilities.reduce((a, b) => a + b.probability, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });

    it('high-openness personality favors explore over fight', () => {
      // Run many times and check the probabilities directly
      const result = softmaxActionSelection(actions, personality, 0.7);
      expect(result).not.toBeNull();
      const exploreProb = result!.allProbabilities.find(p => p.actionId === 'explore')!.probability;
      const fightProb = result!.allProbabilities.find(p => p.actionId === 'fight')!.probability;
      expect(exploreProb).toBeGreaterThan(fightProb);
    });
  });

  describe('computePersonalityMatch', () => {
    it('computes higher score for personality-aligned actions', () => {
      const exploreScore = computePersonalityMatch(actions[0], personality);
      const restScore = computePersonalityMatch(actions[1], personality);
      expect(exploreScore).toBeGreaterThan(restScore);
    });

    it('applies situational modifiers', () => {
      const base = computePersonalityMatch(actions[0], personality);
      const withUrgency = computePersonalityMatch(actions[0], personality, { urgency: 0.9 });
      expect(withUrgency).toBeGreaterThan(base);
    });
  });
});

// ── 3. Puzzle Validation ───────────────────────────────────────────────────

import { PuzzleSystem, type PuzzleType, type PuzzleDefinition } from '../../client/src/components/3DGame/PuzzleSystem';

describe('Puzzle Validation', () => {
  describe('getBuiltInTemplates', () => {
    const templates = PuzzleSystem.getBuiltInTemplates();

    it('returns a non-empty array of puzzle definitions', () => {
      expect(templates.length).toBeGreaterThan(0);
    });

    const puzzleTypes: PuzzleType[] = ['riddle', 'combination', 'environmental', 'translation', 'word_puzzle'];

    for (const pType of puzzleTypes) {
      it(`has at least 5 templates for puzzle type "${pType}"`, () => {
        const ofType = templates.filter(t => t.type === pType);
        expect(ofType.length).toBeGreaterThanOrEqual(5);
      });
    }

    it('each template has required fields', () => {
      for (const t of templates) {
        expect(t.id).toBeTruthy();
        expect(t.type).toBeTruthy();
        expect(t.title).toBeTruthy();
        expect(t.description).toBeTruthy();
        expect(t.difficulty).toBeGreaterThanOrEqual(1);
        expect(t.difficulty).toBeLessThanOrEqual(10);
        expect(t.xpReward).toBeGreaterThan(0);
        expect(
          Array.isArray(t.solution) ? t.solution.length : t.solution.length
        ).toBeGreaterThan(0);
        expect(t.hints.length).toBeGreaterThan(0);
      }
    });

    it('all template IDs are unique', () => {
      const ids = templates.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('PuzzleSystem instance', () => {
    let system: PuzzleSystem;

    beforeEach(() => {
      system = new PuzzleSystem();
    });

    it('can register and start a puzzle', () => {
      const puzzle: PuzzleDefinition = {
        id: 'test_puzzle',
        type: 'riddle',
        title: 'Test',
        description: 'What is 1+1?',
        difficulty: 1,
        setupData: {},
        solution: ['2', 'two'],
        hints: [{ text: 'It is a number', cost: 10 }],
        xpReward: 5,
      };
      system.registerPuzzle(puzzle);
      const active = system.startPuzzle('test_puzzle');
      expect(active).not.toBeNull();
      expect(active!.status).toBe('in_progress');
    });

    it('returns null when starting a non-existent puzzle', () => {
      expect(system.startPuzzle('nonexistent')).toBeNull();
    });

    it('validates correct answer', () => {
      const puzzle: PuzzleDefinition = {
        id: 'answer_test',
        type: 'riddle',
        title: 'Test',
        description: 'What is the color of the sky?',
        difficulty: 1,
        setupData: {},
        solution: ['blue'],
        hints: [{ text: 'Look up', cost: 10 }],
        xpReward: 5,
      };
      system.registerPuzzle(puzzle);
      system.startPuzzle('answer_test');
      const result = system.submitAnswer('blue');
      expect(result.correct).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('rejects incorrect answer and decrements remaining attempts', () => {
      const puzzle: PuzzleDefinition = {
        id: 'wrong_test',
        type: 'combination',
        title: 'Test',
        description: 'Enter code',
        difficulty: 1,
        setupData: {},
        solution: ['1234'],
        hints: [{ text: 'four digits', cost: 10 }],
        xpReward: 5,
      };
      system.registerPuzzle(puzzle);
      system.startPuzzle('wrong_test');
      const result = system.submitAnswer('0000');
      expect(result.correct).toBe(false);
      expect(result.message).toContain('attempts remaining');
    });
  });
});

// ── 4. State Lifecycle (TemporaryStateSystem) ──────────────────────────────

import { TemporaryStateSystem, type StateType } from '../../client/src/components/3DGame/TemporaryStateSystem';

describe('State Lifecycle', () => {
  let system: TemporaryStateSystem;

  beforeEach(() => {
    system = new TemporaryStateSystem();
  });

  it('creates a state with default duration', () => {
    const state = system.addState('char1', 'angry', 'insult', undefined, 0);
    expect(state.stateType).toBe('angry');
    expect(state.characterId).toBe('char1');
    expect(state.duration).toBe(1); // DEFAULT_DURATIONS.angry = 1
    expect(state.startTimestep).toBe(0);
  });

  it('creates a state with custom TTL (duration)', () => {
    const state = system.addState('char1', 'grieving', 'loss of friend', { duration: 50 }, 10);
    expect(state.duration).toBe(50);
    expect(state.startTimestep).toBe(10);
    expect(system.getRemaining('char1', 'grieving', 10)).toBe(50);
    expect(system.getRemaining('char1', 'grieving', 30)).toBe(30);
  });

  it('expires state after duration elapses', () => {
    system.addState('char1', 'excited', 'good news', { duration: 3 }, 0);
    expect(system.hasState('char1', 'excited')).toBe(true);

    // At timestep 2, state should still be active
    const result2 = system.update(2);
    expect(result2.expired).toHaveLength(0);
    expect(system.hasState('char1', 'excited')).toBe(true);

    // At timestep 3, state should expire (startTimestep=0 + duration=3 = 3)
    const result3 = system.update(3);
    expect(result3.expired).toHaveLength(1);
    expect(result3.expired[0].stateType).toBe('excited');
    expect(system.hasState('char1', 'excited')).toBe(false);
  });

  it('overrides existing state of the same type (refreshes duration)', () => {
    system.addState('char1', 'angry', 'insult', { duration: 5 }, 0);
    expect(system.getRemaining('char1', 'angry', 0)).toBe(5);

    // Re-add at timestep 3 with fresh duration
    system.addState('char1', 'angry', 'another insult', { duration: 5 }, 3);
    expect(system.getRemaining('char1', 'angry', 3)).toBe(5);
    // Only one angry state should exist
    expect(system.getStates('char1').filter(s => s.stateType === 'angry')).toHaveLength(1);
  });

  it('supports multiple different states on one character', () => {
    system.addState('char1', 'angry', 'fight', undefined, 0);
    system.addState('char1', 'injured', 'fight', undefined, 0);
    expect(system.getStates('char1')).toHaveLength(2);
    expect(system.hasState('char1', 'angry')).toBe(true);
    expect(system.hasState('char1', 'injured')).toBe(true);
  });

  it('returns combined behavior modifiers for active states', () => {
    system.addState('char1', 'angry', 'insult', { intensity: 1.0 }, 0);
    const mods = system.getBehaviorModifiers('char1');
    // Angry: aggression = 2.0 (at intensity 1.0)
    expect(mods.aggression).toBeGreaterThan(1.0);
    expect(mods.sociability).toBeLessThan(1.0);
  });

  it('removeState removes a specific state', () => {
    system.addState('char1', 'angry', 'insult', undefined, 0);
    expect(system.hasState('char1', 'angry')).toBe(true);
    const removed = system.removeState('char1', 'angry');
    expect(removed).toBe(true);
    expect(system.hasState('char1', 'angry')).toBe(false);
  });

  it('getRemaining returns 0 for non-existent state', () => {
    expect(system.getRemaining('char1', 'angry', 0)).toBe(0);
  });
});

// ── 5. Telemetry Client ────────────────────────────────────────────────────

import { ClientTelemetryCollector, type TelemetryTracker } from '../../client/src/components/3DGame/ClientTelemetryCollector';

// Mock browser APIs that ClientTelemetryCollector uses
const mockDocument = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  visibilityState: 'visible' as DocumentVisibilityState,
};
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

vi.stubGlobal('document', mockDocument);
vi.stubGlobal('window', mockWindow);
vi.stubGlobal('performance', { now: vi.fn(() => Date.now()) });
vi.stubGlobal('requestAnimationFrame', vi.fn());
vi.stubGlobal('cancelAnimationFrame', vi.fn());

describe('Telemetry Client', () => {
  let tracker: TelemetryTracker;
  let trackedEvents: Array<{ type: string; data: Record<string, unknown> }>;

  beforeEach(() => {
    trackedEvents = [];
    tracker = {
      track: vi.fn((eventType: string, data: Record<string, unknown>) => {
        trackedEvents.push({ type: eventType, data });
      }),
    };
    vi.clearAllMocks();
    // Re-stub after clear
    (performance.now as any) = vi.fn(() => Date.now());
  });

  it('tracks session_start on construction', () => {
    const collector = new ClientTelemetryCollector({
      worldId: 'w1',
      playerId: 'p1',
      sessionId: 's1',
      telemetryClient: tracker,
    });
    expect(tracker.track).toHaveBeenCalledWith('session_start', expect.objectContaining({
      worldId: 'w1',
      playerId: 'p1',
      sessionId: 's1',
    }));
    collector.dispose();
  });

  it('records chat latency events', () => {
    const collector = new ClientTelemetryCollector({
      worldId: 'w1',
      playerId: 'p1',
      sessionId: 's1',
      telemetryClient: tracker,
    });
    collector.recordChatLatency(1000, 1250, 'npc_1');
    expect(tracker.track).toHaveBeenCalledWith('chat_latency', expect.objectContaining({
      latencyMs: 250,
      npcId: 'npc_1',
    }));
    collector.dispose();
  });

  it('records error events and increments error count', () => {
    const collector = new ClientTelemetryCollector({
      worldId: 'w1',
      playerId: 'p1',
      sessionId: 's1',
      telemetryClient: tracker,
    });
    collector.recordError(new Error('test error'), { context: 'testing' });
    expect(tracker.track).toHaveBeenCalledWith('client_error', expect.objectContaining({
      message: 'test error',
      name: 'Error',
      context: 'testing',
    }));
    const metrics = collector.getSessionMetrics();
    expect(metrics.errorCount).toBe(1);
    collector.dispose();
  });

  it('getSessionMetrics returns correct structure', () => {
    const collector = new ClientTelemetryCollector({
      worldId: 'w1',
      playerId: 'p1',
      sessionId: 's1',
      telemetryClient: tracker,
    });
    const metrics = collector.getSessionMetrics();
    expect(metrics.sessionId).toBe('s1');
    expect(typeof metrics.totalActiveTimeMs).toBe('number');
    expect(typeof metrics.totalIdleTimeMs).toBe('number');
    expect(typeof metrics.totalPausedTimeMs).toBe('number');
    expect(typeof metrics.actionsPerMinute).toBe('number');
    expect(typeof metrics.eventsCount).toBe('number');
    expect(typeof metrics.avgFps).toBe('number');
    expect(typeof metrics.errorCount).toBe('number');
    expect(typeof metrics.chatInteractions).toBe('number');
    expect(typeof metrics.avgChatLatencyMs).toBe('number');
    collector.dispose();
  });

  it('tracks session_end on dispose', () => {
    const collector = new ClientTelemetryCollector({
      worldId: 'w1',
      playerId: 'p1',
      sessionId: 's1',
      telemetryClient: tracker,
    });
    collector.dispose();
    expect(tracker.track).toHaveBeenCalledWith('session_end', expect.objectContaining({
      sessionId: 's1',
    }));
  });

  it('accumulates chat latency averages correctly', () => {
    const collector = new ClientTelemetryCollector({
      worldId: 'w1',
      playerId: 'p1',
      sessionId: 's1',
      telemetryClient: tracker,
    });
    collector.recordChatLatency(0, 100, 'npc_1');
    collector.recordChatLatency(0, 300, 'npc_2');
    const metrics = collector.getSessionMetrics();
    expect(metrics.avgChatLatencyMs).toBe(200);
    collector.dispose();
  });
});

// ── 6. Ensemble Rule/Action Validation ─────────────────────────────────────

describe('Ensemble Rule/Action Validation Patterns', () => {
  describe('rule content patterns', () => {
    it('validates content with :- module directive', () => {
      const content = `
        :- module(my_rules, [rule_type/2, rule_applies/3]).
        rule_type(greet_rule, social).
        rule_applies(greet_rule, C, T) :- character(C), character(T).
      `;
      const result = validateRuleContent(content);
      expect(result.isValid).toBe(true);
    });

    it('validates rule content with rule( pattern', () => {
      // Even if it uses a custom predicate name, as long as required predicates are present
      const content = `
        rule_type(custom_behavior, volition).
        rule_applies(custom_behavior, Character) :-
          character(Character),
          has_trait(Character, brave).
        rule_priority(custom_behavior, 8).
        rule_likelihood(custom_behavior, 0.5).
        rule_category(custom_behavior, personality).
        rule_active(custom_behavior).
        rule_source(custom_behavior, ensemble).
      `;
      const result = validateRuleContent(content);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('validates content with dynamic declarations', () => {
      const content = `
        :- dynamic rule_type/2, rule_applies/3.
        rule_type(dynamic_rule, trigger).
        rule_applies(dynamic_rule, C, T) :- character(C), character(T).
      `;
      const result = validateRuleContent(content);
      expect(result.isValid).toBe(true);
    });
  });

  describe('action content patterns', () => {
    it('validates action content with action( predicate', () => {
      const content = `
        action(greet, 'Greet someone', social, 2).
        can_perform(greet, Character) :- character(Character).
        action_effect(greet, increase_friendship).
        action_duration(greet, 1).
        action_difficulty(greet, 0.1).
      `;
      const result = validateActionContent(content);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('validates action content with complex prerequisites', () => {
      const content = `
        action(cast_spell, 'Cast a Spell', magic, 10).
        can_perform(cast_spell, Character, Target) :-
          character(Character),
          has_skill(Character, magic, Level),
          Level >= 3,
          character(Target),
          Character \\= Target.
        action_effect(cast_spell, apply_magic).
        action_duration(cast_spell, 3).
        action_difficulty(cast_spell, 0.8).
      `;
      const result = validateActionContent(content);
      expect(result.isValid).toBe(true);
    });
  });

  describe('quest content patterns', () => {
    it('validates quest content with full structure', () => {
      const content = `
        quest(dragon_slayer, 'Slay the Dragon', combat).
        quest_objective(dragon_slayer, kill, dragon, 1).
        quest_objective(dragon_slayer, collect, dragon_scale, 3).
        quest_reward(dragon_slayer, xp, 500).
        quest_reward(dragon_slayer, gold, 200).
        quest_prerequisite(dragon_slayer, level(10)).
        quest_location(dragon_slayer, dragon_lair).
      `;
      const result = validateQuestContent(content);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('accepts quest/5 format from converter', () => {
      const content = `
        quest(escort_quest, 'Escort the Merchant', escort, 5, available).
        quest_objective(escort_quest, escort, merchant, 1).
        quest_reward(escort_quest, xp, 200).
        quest_prerequisite(escort_quest, none).
        quest_location(escort_quest, market).
      `;
      const result = validateQuestContent(content);
      expect(result.isValid).toBe(true);
    });
  });
});
