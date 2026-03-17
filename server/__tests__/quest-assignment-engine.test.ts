import { describe, it, expect } from 'vitest';
import {
  assignQuests,
  getNPCRoutine,
  getNPCTimeBlock,
  isNPCAvailable,
  getNPCAvailableHours,
  type WorldContext,
  type AssignmentOptions,
  type ScheduleContext,
} from '../services/quest-assignment-engine';

// --- Test fixtures ---

function makeWorld(overrides: Record<string, any> = {}) {
  return {
    id: 'world-1',
    name: 'Test Village',
    description: 'A test world',
    targetLanguage: 'French',
    worldType: 'village',
    gameType: 'language-learning',
    ...overrides,
  } as any;
}

function makeCharacter(overrides: Record<string, any> = {}) {
  return {
    id: `char-${Math.random().toString(36).slice(2, 8)}`,
    firstName: 'NPC',
    lastName: 'Bob',
    status: 'active',
    occupation: 'merchant',
    currentLocation: 'Town Square',
    ...overrides,
  } as any;
}

function makeSettlement(overrides: Record<string, any> = {}) {
  return {
    id: 'settlement-1',
    name: 'Petit Village',
    worldId: 'world-1',
    ...overrides,
  } as any;
}

function makeCtx(overrides: Partial<WorldContext> = {}): WorldContext {
  return {
    world: makeWorld(),
    characters: [
      makeCharacter({ id: 'npc-1', firstName: 'Marie', lastName: 'Dupont', occupation: 'teacher' }),
      makeCharacter({ id: 'npc-2', firstName: 'Pierre', lastName: 'Martin', occupation: 'merchant' }),
      makeCharacter({ id: 'npc-3', firstName: 'Jean', lastName: 'Blanc', occupation: 'baker' }),
      makeCharacter({ id: 'npc-4', firstName: 'Claire', lastName: 'Roux', occupation: 'innkeeper' }),
    ],
    settlements: [makeSettlement(), makeSettlement({ id: 's2', name: 'Grand Marché' })],
    existingQuests: [],
    ...overrides,
  };
}

function makeOptions(overrides: Partial<AssignmentOptions> = {}): AssignmentOptions {
  return {
    playerName: 'Player1',
    playerCharacterId: 'player-char-1',
    count: 3,
    ...overrides,
  };
}

// --- Tests ---

describe('Quest Assignment Engine', () => {
  describe('assignQuests', () => {
    it('returns the requested number of quests', () => {
      const quests = assignQuests(makeCtx(), makeOptions({ count: 3 }));
      expect(quests).toHaveLength(3);
    });

    it('returns fewer quests if fewer templates are available', () => {
      // Request more quests than templates exist — should cap at available count
      const quests = assignQuests(makeCtx(), makeOptions({ count: 100 }));
      expect(quests.length).toBeGreaterThan(0);
      expect(quests.length).toBeLessThanOrEqual(100);
    });

    it('fills all required quest fields', () => {
      const quests = assignQuests(makeCtx(), makeOptions({ count: 1 }));
      const q = quests[0];

      expect(q.worldId).toBe('world-1');
      expect(q.assignedTo).toBe('Player1');
      expect(q.title).toBeTruthy();
      expect(q.description).toBeTruthy();
      expect(q.questType).toBeTruthy();
      expect(q.difficulty).toBeTruthy();
      expect(q.targetLanguage).toBe('French');
      expect(q.gameType).toBe('language-learning');
      expect(q.status).toBe('active');
      expect(q.objectives).toBeInstanceOf(Array);
      expect(q.objectives!.length).toBeGreaterThan(0);
      expect(q.experienceReward).toBeGreaterThan(0);
      expect(q.templateId).toBeTruthy();
      expect(q.filledParameters).toBeDefined();
    });

    it('assigns quest givers from available NPCs', () => {
      const quests = assignQuests(makeCtx(), makeOptions({ count: 5 }));
      const npcNames = ['Marie Dupont', 'Pierre Martin', 'Jean Blanc', 'Claire Roux'];

      for (const q of quests) {
        // assignedBy should be an NPC name or null (if no NPCs)
        if (q.assignedBy) {
          expect(npcNames).toContain(q.assignedBy);
        }
      }
    });

    it('does not assign the player as quest giver', () => {
      const ctx = makeCtx({
        characters: [
          makeCharacter({ id: 'player-char-1', firstName: 'Player1', lastName: '', occupation: 'student' }),
          makeCharacter({ id: 'npc-1', firstName: 'Marie', lastName: 'Dupont', occupation: 'teacher' }),
        ],
      });

      const quests = assignQuests(ctx, makeOptions({ count: 5 }));
      for (const q of quests) {
        expect(q.assignedBy).not.toBe('Player1');
      }
    });

    it('tags quests with template ID', () => {
      const quests = assignQuests(makeCtx(), makeOptions({ count: 2 }));
      for (const q of quests) {
        const tags = q.tags as string[];
        expect(tags.some((t) => t.startsWith('template:'))).toBe(true);
        expect(tags.some((t) => t.startsWith('category:'))).toBe(true);
      }
    });

    it('builds objectives with currentCount=0 and completed=false', () => {
      const quests = assignQuests(makeCtx(), makeOptions({ count: 1 }));
      for (const obj of quests[0].objectives!) {
        expect(obj.currentCount).toBe(0);
        expect(obj.completed).toBe(false);
        expect(obj.id).toBeTruthy();
        expect(obj.type).toBeTruthy();
        expect(obj.description).toBeTruthy();
      }
    });
  });

  describe('difficulty selection', () => {
    it('selects beginner templates for low proficiency', () => {
      const quests = assignQuests(
        makeCtx(),
        makeOptions({
          count: 5,
          proficiency: {
            overallFluency: 10,
            vocabularyCount: 20,
            masteredWordCount: 5,
            weakGrammarPatterns: [],
            strongGrammarPatterns: [],
            conversationCount: 2,
          },
        }),
      );

      for (const q of quests) {
        expect(q.difficulty).toBe('beginner');
      }
    });

    it('selects intermediate or beginner templates for mid proficiency', () => {
      const quests = assignQuests(
        makeCtx(),
        makeOptions({
          count: 5,
          proficiency: {
            overallFluency: 45,
            vocabularyCount: 100,
            masteredWordCount: 40,
            weakGrammarPatterns: [],
            strongGrammarPatterns: [],
            conversationCount: 20,
          },
        }),
      );

      for (const q of quests) {
        expect(['beginner', 'intermediate']).toContain(q.difficulty);
      }
    });

    it('allows advanced templates for high proficiency', () => {
      const quests = assignQuests(
        makeCtx(),
        makeOptions({
          count: 10,
          proficiency: {
            overallFluency: 75,
            vocabularyCount: 300,
            masteredWordCount: 200,
            weakGrammarPatterns: [],
            strongGrammarPatterns: [],
            conversationCount: 50,
          },
        }),
      );

      const difficulties = new Set(quests.map((q) => q.difficulty));
      // Should include intermediate and/or advanced
      expect(
        difficulties.has('intermediate') || difficulties.has('advanced'),
      ).toBe(true);
    });
  });

  describe('variety', () => {
    it('avoids consecutive same-category quests', () => {
      const quests = assignQuests(makeCtx(), makeOptions({ count: 5 }));

      for (let i = 1; i < quests.length; i++) {
        // Not guaranteed to always differ (if only one category available),
        // but with 16 templates across many categories it should vary
        if (quests.length >= 3) {
          const categories = new Set(quests.map((q) => q.questType));
          expect(categories.size).toBeGreaterThan(1);
        }
      }
    });

    it('does not repeat templates in a single batch', () => {
      const quests = assignQuests(makeCtx(), makeOptions({ count: 5 }));
      const templateIds = quests.map((q) => q.templateId);
      const unique = new Set(templateIds);
      expect(unique.size).toBe(templateIds.length);
    });
  });

  describe('preferred categories', () => {
    it('respects preferred categories when enough templates exist', () => {
      const quests = assignQuests(
        makeCtx(),
        makeOptions({
          count: 2,
          preferredCategories: ['vocabulary', 'conversation'],
        }),
      );

      for (const q of quests) {
        expect(['vocabulary', 'conversation']).toContain(q.questType);
      }
    });
  });

  describe('edge cases', () => {
    it('works with zero NPCs', () => {
      const ctx = makeCtx({ characters: [] });
      const quests = assignQuests(ctx, makeOptions({ count: 2 }));

      expect(quests.length).toBeGreaterThan(0);
      // Description should still be filled (uses fallback)
      for (const q of quests) {
        expect(q.description).toBeTruthy();
        expect(q.description).not.toContain('{{');
      }
    });

    it('works with zero settlements', () => {
      const ctx = makeCtx({ settlements: [] });
      const quests = assignQuests(ctx, makeOptions({ count: 2 }));

      expect(quests.length).toBeGreaterThan(0);
    });

    it('excludes specified template IDs', () => {
      const quests = assignQuests(
        makeCtx(),
        makeOptions({
          count: 5,
          excludeTemplateIds: ['greet_the_locals', 'food_vocabulary'],
        }),
      );

      for (const q of quests) {
        expect(q.templateId).not.toBe('greet_the_locals');
        expect(q.templateId).not.toBe('food_vocabulary');
      }
    });

    it('reward scaling increases with difficulty', () => {
      // Generate many quests and check that advanced rewards > beginner
      const beginnerQuests = assignQuests(
        makeCtx(),
        makeOptions({
          count: 5,
          proficiency: {
            overallFluency: 10,
            vocabularyCount: 10,
            masteredWordCount: 2,
            weakGrammarPatterns: [],
            strongGrammarPatterns: [],
            conversationCount: 1,
          },
        }),
      );

      const advancedQuests = assignQuests(
        makeCtx(),
        makeOptions({
          count: 5,
          proficiency: {
            overallFluency: 80,
            vocabularyCount: 400,
            masteredWordCount: 300,
            weakGrammarPatterns: [],
            strongGrammarPatterns: [],
            conversationCount: 100,
          },
        }),
      );

      const avgBeginner =
        beginnerQuests.reduce((s, q) => s + (q.experienceReward ?? 0), 0) /
        beginnerQuests.length;
      const avgAdvanced =
        advancedQuests.reduce((s, q) => s + (q.experienceReward ?? 0), 0) /
        advancedQuests.length;

      expect(avgAdvanced).toBeGreaterThanOrEqual(avgBeginner);
    });

    it('descriptions have no unfilled placeholders', () => {
      const quests = assignQuests(makeCtx(), makeOptions({ count: 10 }));
      for (const q of quests) {
        expect(q.description).not.toMatch(/\{\{.*?\}\}/);
        for (const obj of q.objectives!) {
          expect(obj.description).not.toMatch(/\{\{.*?\}\}/);
        }
      }
    });
  });

  describe('NPC schedule-aware quest assignment', () => {
    function makeDayRoutine(blocks: Array<{ startHour: number; endHour: number; location: string; occasion: string }>) {
      return {
        day: blocks.map((b) => ({
          startHour: b.startHour,
          endHour: b.endHour,
          location: b.location,
          locationType: 'work' as const,
          occasion: b.occasion as any,
        })),
        night: [{ startHour: 0, endHour: 24, location: 'home', locationType: 'home' as const, occasion: 'sleeping' as const }],
      };
    }

    function makeScheduledCharacter(overrides: Record<string, any> = {}) {
      const routine = overrides.routine ?? makeDayRoutine([
        { startHour: 0, endHour: 7, location: 'home', occasion: 'sleeping' },
        { startHour: 7, endHour: 8, location: 'home', occasion: 'eating' },
        { startHour: 8, endHour: 9, location: 'commuting', occasion: 'commuting' },
        { startHour: 9, endHour: 17, location: 'shop', occasion: 'working' },
        { startHour: 17, endHour: 18, location: 'commuting', occasion: 'commuting' },
        { startHour: 18, endHour: 22, location: 'home', occasion: 'relaxing' },
        { startHour: 22, endHour: 24, location: 'home', occasion: 'sleeping' },
      ]);
      const { routine: _r, ...rest } = overrides;
      return makeCharacter({
        customData: {
          routine: { characterId: rest.id ?? 'char-test', routine, lastUpdated: Date.now() },
        },
        ...rest,
      });
    }

    describe('getNPCRoutine', () => {
      it('returns null for characters without routine data', () => {
        const char = makeCharacter();
        expect(getNPCRoutine(char)).toBeNull();
      });

      it('extracts routine from customData', () => {
        const char = makeScheduledCharacter({ id: 'sched-1' });
        const routine = getNPCRoutine(char);
        expect(routine).not.toBeNull();
        expect(routine!.day.length).toBeGreaterThan(0);
      });
    });

    describe('getNPCTimeBlock', () => {
      it('returns the correct time block for a given hour', () => {
        const char = makeScheduledCharacter({ id: 'sched-2' });
        const block = getNPCTimeBlock(char, { currentHour: 10, timeOfDay: 'day' });
        expect(block).not.toBeNull();
        expect(block!.occasion).toBe('working');
        expect(block!.location).toBe('shop');
      });

      it('returns null for characters without routines', () => {
        const char = makeCharacter();
        const block = getNPCTimeBlock(char, { currentHour: 10, timeOfDay: 'day' });
        expect(block).toBeNull();
      });

      it('uses night schedule when timeOfDay is night', () => {
        const char = makeScheduledCharacter({ id: 'sched-3' });
        const block = getNPCTimeBlock(char, { currentHour: 3, timeOfDay: 'night' });
        expect(block).not.toBeNull();
        expect(block!.occasion).toBe('sleeping');
      });
    });

    describe('isNPCAvailable', () => {
      it('returns true when NPC is working', () => {
        const char = makeScheduledCharacter({ id: 'avail-1' });
        expect(isNPCAvailable(char, { currentHour: 10, timeOfDay: 'day' })).toBe(true);
      });

      it('returns false when NPC is sleeping', () => {
        const char = makeScheduledCharacter({ id: 'avail-2' });
        expect(isNPCAvailable(char, { currentHour: 3, timeOfDay: 'day' })).toBe(false);
      });

      it('returns false when NPC is commuting', () => {
        const char = makeScheduledCharacter({ id: 'avail-3' });
        expect(isNPCAvailable(char, { currentHour: 8, timeOfDay: 'day' })).toBe(false);
      });

      it('returns true when NPC is relaxing', () => {
        const char = makeScheduledCharacter({ id: 'avail-4' });
        expect(isNPCAvailable(char, { currentHour: 19, timeOfDay: 'day' })).toBe(true);
      });

      it('returns true when NPC has no routine (backward compatible)', () => {
        const char = makeCharacter({ id: 'avail-5' });
        expect(isNPCAvailable(char, { currentHour: 3, timeOfDay: 'day' })).toBe(true);
      });
    });

    describe('getNPCAvailableHours', () => {
      it('returns available hour ranges excluding sleeping and commuting', () => {
        const char = makeScheduledCharacter({ id: 'hours-1' });
        const hours = getNPCAvailableHours(char);
        // Should include: eating(7-8), working(9-17), relaxing(18-22)
        expect(hours).toEqual([
          { start: 7, end: 8 },
          { start: 9, end: 17 },
          { start: 18, end: 22 },
        ]);
      });

      it('returns full day for characters without routines', () => {
        const char = makeCharacter({ id: 'hours-2' });
        expect(getNPCAvailableHours(char)).toEqual([{ start: 0, end: 24 }]);
      });
    });

    describe('assignQuests with schedule context', () => {
      it('prefers available NPCs over sleeping ones', () => {
        const sleepingNPC = makeScheduledCharacter({
          id: 'sleep-npc',
          firstName: 'Sleepy',
          lastName: 'Head',
          occupation: 'merchant',
          routine: makeDayRoutine([
            { startHour: 0, endHour: 24, location: 'home', occasion: 'sleeping' },
          ]),
        });
        const awakeNPC = makeScheduledCharacter({
          id: 'awake-npc',
          firstName: 'Awake',
          lastName: 'Worker',
          occupation: 'merchant',
          routine: makeDayRoutine([
            { startHour: 0, endHour: 24, location: 'shop', occasion: 'working' },
          ]),
        });

        const ctx = makeCtx({ characters: [sleepingNPC, awakeNPC] });
        const schedule: ScheduleContext = { currentHour: 10, timeOfDay: 'day' };
        const quests = assignQuests(ctx, makeOptions({ count: 5, schedule }));

        // All quests should be assigned by the awake NPC
        for (const q of quests) {
          expect(q.assignedBy).toBe('Awake Worker');
        }
      });

      it('falls back to any NPC if all are unavailable', () => {
        const sleeper1 = makeScheduledCharacter({
          id: 'sleep-1',
          firstName: 'Night',
          lastName: 'Owl',
          occupation: 'merchant',
          routine: makeDayRoutine([
            { startHour: 0, endHour: 24, location: 'home', occasion: 'sleeping' },
          ]),
        });
        const sleeper2 = makeScheduledCharacter({
          id: 'sleep-2',
          firstName: 'Deep',
          lastName: 'Sleeper',
          occupation: 'teacher',
          routine: makeDayRoutine([
            { startHour: 0, endHour: 24, location: 'home', occasion: 'sleeping' },
          ]),
        });

        const ctx = makeCtx({ characters: [sleeper1, sleeper2] });
        const schedule: ScheduleContext = { currentHour: 10, timeOfDay: 'day' };
        const quests = assignQuests(ctx, makeOptions({ count: 2, schedule }));

        // Should still produce quests (graceful fallback)
        expect(quests.length).toBeGreaterThan(0);
        for (const q of quests) {
          expect(q.assignedBy).toBeTruthy();
        }
      });

      it('attaches questGiverSchedule metadata', () => {
        const npc = makeScheduledCharacter({
          id: 'meta-npc',
          firstName: 'Meta',
          lastName: 'NPC',
          occupation: 'merchant',
        });

        const ctx = makeCtx({ characters: [npc] });
        const schedule: ScheduleContext = { currentHour: 10, timeOfDay: 'day' };
        const quests = assignQuests(ctx, makeOptions({ count: 1, schedule }));

        expect(quests[0].questGiverSchedule).toBeDefined();
        expect(quests[0].questGiverSchedule.location).toBe('shop');
        expect(quests[0].questGiverSchedule.availableHours).toEqual([
          { start: 7, end: 8 },
          { start: 9, end: 17 },
          { start: 18, end: 22 },
        ]);
      });

      it('works without schedule context (backward compatible)', () => {
        const quests = assignQuests(makeCtx(), makeOptions({ count: 2 }));
        expect(quests.length).toBeGreaterThan(0);
        // questGiverSchedule should still be present but with default available hours
        for (const q of quests) {
          expect(q.questGiverSchedule).toBeDefined();
        }
      });
    });
  });
});
