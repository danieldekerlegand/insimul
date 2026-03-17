import { describe, it, expect } from 'vitest';
import {
  getQuestTypeColor,
  getDifficultyStars,
  getDifficultyColor,
  getQuestIcon,
  calculateObjectivesProgress,
  calculateCriteriaProgress,
  formatDistance,
  filterQuests,
  sortQuests,
  computeQuestStats,
  getUniqueQuestGivers,
  getUniqueQuestTypes,
} from '../../client/src/components/3DGame/BabylonQuestTracker';
import type { Quest, QuestObjective } from '../../client/src/components/3DGame/BabylonQuestTracker';

describe('BabylonQuestTracker pure functions', () => {
  describe('getQuestTypeColor', () => {
    it('returns blue for conversation quests', () => {
      expect(getQuestTypeColor('conversation')).toBe('#2196F3');
    });

    it('returns blue for social quests', () => {
      expect(getQuestTypeColor('social')).toBe('#2196F3');
    });

    it('returns green for vocabulary quests', () => {
      expect(getQuestTypeColor('vocabulary')).toBe('#4CAF50');
    });

    it('returns orange for navigation quests', () => {
      expect(getQuestTypeColor('navigation')).toBe('#FF9800');
    });

    it('returns purple for listening_comprehension quests', () => {
      expect(getQuestTypeColor('listening_comprehension')).toBe('#9C27B0');
    });

    it('returns red for cultural quests', () => {
      expect(getQuestTypeColor('cultural')).toBe('#F44336');
    });

    it('returns grey for unknown types', () => {
      expect(getQuestTypeColor('unknown')).toBe('#9E9E9E');
    });

    it('returns cyan for grammar quests', () => {
      expect(getQuestTypeColor('grammar')).toBe('#00BCD4');
    });

    it('returns dark red for combat quests', () => {
      expect(getQuestTypeColor('combat')).toBe('#D32F2F');
    });
  });

  describe('getDifficultyStars', () => {
    it('returns 1 star for beginner', () => {
      expect(getDifficultyStars('beginner')).toBe(1);
    });

    it('returns 1 star for easy', () => {
      expect(getDifficultyStars('easy')).toBe(1);
    });

    it('returns 2 stars for intermediate', () => {
      expect(getDifficultyStars('intermediate')).toBe(2);
    });

    it('returns 2 stars for normal', () => {
      expect(getDifficultyStars('normal')).toBe(2);
    });

    it('returns 3 stars for advanced', () => {
      expect(getDifficultyStars('advanced')).toBe(3);
    });

    it('returns 3 stars for hard', () => {
      expect(getDifficultyStars('hard')).toBe(3);
    });

    it('returns 3 stars for legendary', () => {
      expect(getDifficultyStars('legendary')).toBe(3);
    });

    it('returns 1 star for unknown difficulty', () => {
      expect(getDifficultyStars('unknown')).toBe(1);
    });
  });

  describe('getDifficultyColor', () => {
    it('returns green for beginner', () => {
      expect(getDifficultyColor('beginner')).toBe('#4CAF50');
    });

    it('returns yellow for intermediate', () => {
      expect(getDifficultyColor('intermediate')).toBe('#FFC107');
    });

    it('returns red for advanced', () => {
      expect(getDifficultyColor('advanced')).toBe('#F44336');
    });

    it('returns purple for legendary', () => {
      expect(getDifficultyColor('legendary')).toBe('#9C27B0');
    });

    it('returns grey for unknown', () => {
      expect(getDifficultyColor('unknown')).toBe('#888');
    });
  });

  describe('getQuestIcon', () => {
    it('returns speech bubble for conversation', () => {
      expect(getQuestIcon('conversation')).toBe('\u{1F4AC}');
    });

    it('returns book for vocabulary', () => {
      expect(getQuestIcon('vocabulary')).toBe('\u{1F4DA}');
    });

    it('returns compass for navigation', () => {
      expect(getQuestIcon('navigation')).toBe('\u{1F9ED}');
    });

    it('returns target for unknown types', () => {
      expect(getQuestIcon('unknown_type')).toBe('\u{1F3AF}');
    });

    it('returns headphones for listening_comprehension', () => {
      expect(getQuestIcon('listening_comprehension')).toBe('\u{1F3A7}');
    });
  });

  describe('calculateObjectivesProgress', () => {
    it('returns 0 for empty objectives array', () => {
      expect(calculateObjectivesProgress([])).toBe(0);
    });

    it('returns 0 when no objectives completed', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', description: 'Talk to Bob', completed: false },
        { type: 'visit_location', description: 'Visit market', completed: false },
      ];
      expect(calculateObjectivesProgress(objectives)).toBe(0);
    });

    it('returns 1 when all objectives completed', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', description: 'Talk to Bob', completed: true },
        { type: 'visit_location', description: 'Visit market', completed: true },
      ];
      expect(calculateObjectivesProgress(objectives)).toBe(1);
    });

    it('returns correct fraction for partial completion', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', description: 'Talk to Bob', completed: true },
        { type: 'visit_location', description: 'Visit market', completed: false },
        { type: 'collect_item', description: 'Collect key', completed: false },
      ];
      expect(calculateObjectivesProgress(objectives)).toBeCloseTo(1 / 3);
    });

    it('returns 0.5 for 1 of 2 completed', () => {
      const objectives: QuestObjective[] = [
        { type: 'talk_to_npc', description: 'Talk', completed: true },
        { type: 'visit_location', description: 'Visit', completed: false },
      ];
      expect(calculateObjectivesProgress(objectives)).toBe(0.5);
    });
  });

  describe('calculateCriteriaProgress', () => {
    it('returns null for unknown criteria type', () => {
      expect(calculateCriteriaProgress({ type: 'unknown' }, {})).toBeNull();
    });

    it('calculates vocabulary_usage progress', () => {
      const criteria = { type: 'vocabulary_usage', requiredCount: 10 };
      const progress = { currentCount: 5 };
      expect(calculateCriteriaProgress(criteria, progress)).toBe(0.5);
    });

    it('caps vocabulary_usage at 1', () => {
      const criteria = { type: 'vocabulary_usage', requiredCount: 5 };
      const progress = { currentCount: 10 };
      expect(calculateCriteriaProgress(criteria, progress)).toBe(1);
    });

    it('calculates conversation_turns progress', () => {
      const criteria = { type: 'conversation_turns', requiredTurns: 4 };
      const progress = { turnsCompleted: 3 };
      expect(calculateCriteriaProgress(criteria, progress)).toBe(0.75);
    });

    it('calculates grammar_pattern progress', () => {
      const criteria = { type: 'grammar_pattern', requiredCount: 8 };
      const progress = { currentCount: 2 };
      expect(calculateCriteriaProgress(criteria, progress)).toBe(0.25);
    });

    it('calculates conversation_engagement progress', () => {
      const criteria = { type: 'conversation_engagement', requiredMessages: 10 };
      const progress = { messagesCount: 7 };
      expect(calculateCriteriaProgress(criteria, progress)).toBe(0.7);
    });

    it('calculates listening_comprehension progress', () => {
      const criteria = { type: 'listening_comprehension', questions: ['q1', 'q2', 'q3', 'q4'] };
      const progress = { questionsCorrect: 2 };
      expect(calculateCriteriaProgress(criteria, progress)).toBe(0.5);
    });

    it('calculates translation_challenge progress', () => {
      const criteria = { type: 'translation_challenge', phrases: ['p1', 'p2'] };
      const progress = { translationsCorrect: 1 };
      expect(calculateCriteriaProgress(criteria, progress)).toBe(0.5);
    });

    it('calculates navigate_language progress', () => {
      const criteria = { type: 'navigate_language', waypoints: ['w1', 'w2', 'w3'] };
      const progress = { waypointsReached: 3 };
      expect(calculateCriteriaProgress(criteria, progress)).toBe(1);
    });

    it('returns null when required data is missing', () => {
      const criteria = { type: 'vocabulary_usage', requiredCount: 10 };
      expect(calculateCriteriaProgress(criteria, {})).toBeNull();
    });
  });

  describe('formatDistance', () => {
    it('formats very short distances as <1m', () => {
      expect(formatDistance(0.5)).toBe('<1m');
    });

    it('formats distances under 100 as meters', () => {
      expect(formatDistance(45)).toBe('45m');
    });

    it('rounds meter distances', () => {
      expect(formatDistance(23.7)).toBe('24m');
    });

    it('formats distances >= 100 as km', () => {
      expect(formatDistance(150)).toBe('1.5km');
    });

    it('formats exact 100 as km', () => {
      expect(formatDistance(100)).toBe('1.0km');
    });

    it('formats 1 as 1m', () => {
      expect(formatDistance(1)).toBe('1m');
    });
  });

  // --- Helper: make a Quest object with defaults ---
  function makeQuest(overrides: Partial<Quest> = {}): Quest {
    return {
      id: 'q1',
      worldId: 'w1',
      assignedTo: 'player',
      assignedBy: null,
      assignedByCharacterId: null,
      title: 'Test Quest',
      description: 'A test quest',
      questType: 'vocabulary',
      difficulty: 'beginner',
      targetLanguage: 'fr',
      progress: null,
      status: 'active',
      completionCriteria: null,
      experienceReward: 100,
      assignedAt: new Date('2026-03-01'),
      completedAt: null,
      conversationContext: null,
      ...overrides,
    };
  }

  describe('filterQuests', () => {
    const quests: Quest[] = [
      makeQuest({ id: '1', questType: 'vocabulary', difficulty: 'beginner', assignedBy: 'Baker', title: 'Learn food words' }),
      makeQuest({ id: '2', questType: 'grammar', difficulty: 'intermediate', assignedBy: 'Teacher', title: 'Past tense practice' }),
      makeQuest({ id: '3', questType: 'conversation', difficulty: 'advanced', assignedBy: 'Baker', title: 'Chat with baker' }),
      makeQuest({ id: '4', questType: 'vocabulary', difficulty: 'intermediate', assignedBy: 'Shopkeeper', title: 'Market vocabulary' }),
    ];

    it('returns all quests with empty filters', () => {
      expect(filterQuests(quests, {})).toHaveLength(4);
    });

    it('filters by questType', () => {
      const result = filterQuests(quests, { questType: 'vocabulary' });
      expect(result).toHaveLength(2);
      expect(result.every(q => q.questType === 'vocabulary')).toBe(true);
    });

    it('filters by difficulty', () => {
      const result = filterQuests(quests, { difficulty: 'intermediate' });
      expect(result).toHaveLength(2);
      expect(result.every(q => q.difficulty === 'intermediate')).toBe(true);
    });

    it('filters by assignedBy (NPC giver)', () => {
      const result = filterQuests(quests, { assignedBy: 'Baker' });
      expect(result).toHaveLength(2);
      expect(result.every(q => q.assignedBy === 'Baker')).toBe(true);
    });

    it('filters by search term in title', () => {
      const result = filterQuests(quests, { search: 'food' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('filters by search term in description (case insensitive)', () => {
      const result = filterQuests(quests, { search: 'TEST' });
      expect(result).toHaveLength(4); // all have "A test quest" description
    });

    it('combines multiple filters', () => {
      const result = filterQuests(quests, { questType: 'vocabulary', difficulty: 'beginner' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('returns empty array when no match', () => {
      expect(filterQuests(quests, { questType: 'combat' })).toHaveLength(0);
    });
  });

  describe('sortQuests', () => {
    const quests: Quest[] = [
      makeQuest({ id: '1', assignedAt: new Date('2026-03-01'), difficulty: 'beginner', experienceReward: 50 }),
      makeQuest({ id: '2', assignedAt: new Date('2026-03-10'), difficulty: 'advanced', experienceReward: 200 }),
      makeQuest({ id: '3', assignedAt: new Date('2026-03-05'), difficulty: 'intermediate', experienceReward: 100 }),
    ];

    it('sorts by recent (most recent first)', () => {
      const result = sortQuests(quests, 'recent');
      expect(result.map(q => q.id)).toEqual(['2', '3', '1']);
    });

    it('sorts by difficulty (hardest first)', () => {
      const result = sortQuests(quests, 'difficulty');
      expect(result.map(q => q.id)).toEqual(['2', '3', '1']);
    });

    it('sorts by reward (highest first)', () => {
      const result = sortQuests(quests, 'reward');
      expect(result.map(q => q.id)).toEqual(['2', '3', '1']);
    });

    it('does not mutate original array', () => {
      const original = [...quests];
      sortQuests(quests, 'reward');
      expect(quests.map(q => q.id)).toEqual(original.map(q => q.id));
    });

    it('sorts by recent using completedAt when available', () => {
      const questsWithDone: Quest[] = [
        makeQuest({ id: 'a', assignedAt: new Date('2026-01-01'), completedAt: new Date('2026-03-15') }),
        makeQuest({ id: 'b', assignedAt: new Date('2026-03-10') }),
      ];
      const result = sortQuests(questsWithDone, 'recent');
      expect(result[0].id).toBe('a'); // completedAt is more recent
    });
  });

  describe('computeQuestStats', () => {
    it('returns zeros for empty list', () => {
      const stats = computeQuestStats([]);
      expect(stats.totalCompleted).toBe(0);
      expect(stats.totalActive).toBe(0);
      expect(stats.completionRate).toBe(0);
      expect(stats.totalXpEarned).toBe(0);
    });

    it('counts quests by status', () => {
      const quests: Quest[] = [
        makeQuest({ status: 'active' }),
        makeQuest({ status: 'completed', experienceReward: 100 }),
        makeQuest({ status: 'completed', experienceReward: 200 }),
        makeQuest({ status: 'failed' }),
        makeQuest({ status: 'abandoned' }),
      ];
      const stats = computeQuestStats(quests);
      expect(stats.totalActive).toBe(1);
      expect(stats.totalCompleted).toBe(2);
      expect(stats.totalFailed).toBe(1);
      expect(stats.totalAbandoned).toBe(1);
    });

    it('calculates completion rate', () => {
      const quests: Quest[] = [
        makeQuest({ status: 'completed' }),
        makeQuest({ status: 'completed' }),
        makeQuest({ status: 'failed' }),
        makeQuest({ status: 'active' }), // active doesn't count toward rate
      ];
      const stats = computeQuestStats(quests);
      // 2 completed / 3 with outcome (completed + failed)
      expect(stats.completionRate).toBeCloseTo(2 / 3);
    });

    it('calculates total XP earned from completed quests', () => {
      const quests: Quest[] = [
        makeQuest({ status: 'completed', experienceReward: 100 }),
        makeQuest({ status: 'completed', experienceReward: 250 }),
        makeQuest({ status: 'active', experienceReward: 500 }), // not counted
      ];
      expect(computeQuestStats(quests).totalXpEarned).toBe(350);
    });

    it('calculates average performance rating', () => {
      const quests: Quest[] = [
        makeQuest({ status: 'completed', performanceRating: 4 }),
        makeQuest({ status: 'completed', performanceRating: 2 }),
        makeQuest({ status: 'completed' }), // no rating, excluded from average
      ];
      expect(computeQuestStats(quests).averagePerformance).toBe(3);
    });

    it('counts unique vocabulary words', () => {
      const quests: Quest[] = [
        makeQuest({ status: 'completed', vocabularyUsed: ['pain', 'eau'] }),
        makeQuest({ status: 'completed', vocabularyUsed: ['eau', 'lait'] }), // 'eau' is duplicate
      ];
      expect(computeQuestStats(quests).vocabularyWordsLearned).toBe(3);
    });

    it('counts grammar quests', () => {
      const quests: Quest[] = [
        makeQuest({ status: 'completed', questType: 'grammar' }),
        makeQuest({ status: 'completed', questType: 'grammar' }),
        makeQuest({ status: 'completed', questType: 'vocabulary' }),
      ];
      expect(computeQuestStats(quests).grammarPatternsCount).toBe(2);
    });

    it('groups quests by type', () => {
      const quests: Quest[] = [
        makeQuest({ questType: 'vocabulary' }),
        makeQuest({ questType: 'vocabulary' }),
        makeQuest({ questType: 'grammar' }),
      ];
      const stats = computeQuestStats(quests);
      expect(stats.questsByType).toEqual({ vocabulary: 2, grammar: 1 });
    });

    it('groups quests by difficulty', () => {
      const quests: Quest[] = [
        makeQuest({ difficulty: 'beginner' }),
        makeQuest({ difficulty: 'beginner' }),
        makeQuest({ difficulty: 'advanced' }),
      ];
      const stats = computeQuestStats(quests);
      expect(stats.questsByDifficulty).toEqual({ beginner: 2, advanced: 1 });
    });
  });

  describe('getUniqueQuestGivers', () => {
    it('returns empty array for no quests', () => {
      expect(getUniqueQuestGivers([])).toEqual([]);
    });

    it('returns unique sorted giver names', () => {
      const quests: Quest[] = [
        makeQuest({ assignedBy: 'Baker' }),
        makeQuest({ assignedBy: 'Teacher' }),
        makeQuest({ assignedBy: 'Baker' }),
        makeQuest({ assignedBy: null }),
      ];
      expect(getUniqueQuestGivers(quests)).toEqual(['Baker', 'Teacher']);
    });
  });

  describe('getUniqueQuestTypes', () => {
    it('returns empty array for no quests', () => {
      expect(getUniqueQuestTypes([])).toEqual([]);
    });

    it('returns unique sorted quest types', () => {
      const quests: Quest[] = [
        makeQuest({ questType: 'vocabulary' }),
        makeQuest({ questType: 'grammar' }),
        makeQuest({ questType: 'vocabulary' }),
      ];
      expect(getUniqueQuestTypes(quests)).toEqual(['grammar', 'vocabulary']);
    });
  });
});
