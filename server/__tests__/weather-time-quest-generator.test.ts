import { describe, it, expect } from 'vitest';
import {
  generateWeatherTimeQuests,
  hourToTimeOfDayPeriod,
  getWeatherVocabulary,
  getTimeVocabulary,
  getTemplatesForPeriod,
  type WeatherTimeContext,
  type WeatherTimeQuestOptions,
} from '../services/weather-time-quest-generator';
import { QUEST_TEMPLATES } from '../../shared/language/quest-templates';
import { VALID_OBJECTIVE_TYPES } from '../../shared/quest-objective-types';

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
    lastName: 'Test',
    status: 'active',
    occupation: 'farmer',
    currentLocation: 'Town Square',
    ...overrides,
  } as any;
}

function makeCharacterWithRoutine(overrides: Record<string, any> = {}) {
  return makeCharacter({
    customData: {
      routine: {
        characterId: overrides.id ?? 'char-1',
        routine: {
          day: [
            { startHour: 0, endHour: 7, location: 'home', locationType: 'home', occasion: 'sleeping' },
            { startHour: 7, endHour: 8, location: 'home', locationType: 'home', occasion: 'eating' },
            { startHour: 8, endHour: 12, location: 'farm', locationType: 'work', occasion: 'working' },
            { startHour: 12, endHour: 13, location: 'tavern', locationType: 'leisure', occasion: 'eating' },
            { startHour: 13, endHour: 17, location: 'farm', locationType: 'work', occasion: 'working' },
            { startHour: 17, endHour: 19, location: 'market', locationType: 'leisure', occasion: 'shopping' },
            { startHour: 19, endHour: 22, location: 'home', locationType: 'home', occasion: 'relaxing' },
            { startHour: 22, endHour: 24, location: 'home', locationType: 'home', occasion: 'sleeping' },
          ],
          night: [
            { startHour: 0, endHour: 24, location: 'home', locationType: 'home', occasion: 'sleeping' },
          ],
        },
        lastUpdated: Date.now(),
      },
    },
    ...overrides,
  });
}

function makeSettlement(overrides: Record<string, any> = {}) {
  return {
    id: 'settlement-1',
    name: 'Petit Village',
    worldId: 'world-1',
    ...overrides,
  } as any;
}

function makeWeatherTimeContext(overrides: Partial<WeatherTimeContext> = {}): WeatherTimeContext {
  return {
    weather: 'sunny',
    timeOfDayPeriod: 'morning',
    currentHour: 9,
    timeOfDay: 'day',
    ...overrides,
  };
}

function makeOptions(overrides: Partial<WeatherTimeQuestOptions> = {}): WeatherTimeQuestOptions {
  return {
    worldId: 'world-1',
    world: makeWorld(),
    characters: [
      makeCharacterWithRoutine({ id: 'npc-1', firstName: 'Marie', lastName: 'Dupont', occupation: 'farmer' }),
      makeCharacterWithRoutine({ id: 'npc-2', firstName: 'Pierre', lastName: 'Martin', occupation: 'merchant' }),
      makeCharacterWithRoutine({ id: 'npc-3', firstName: 'Jean', lastName: 'Blanc', occupation: 'guard' }),
    ],
    settlements: [makeSettlement(), makeSettlement({ id: 's2', name: 'Grand Marché' })],
    existingQuests: [],
    playerName: 'Player1',
    playerCharacterId: 'player-char-1',
    weatherTimeContext: makeWeatherTimeContext(),
    count: 2,
    ...overrides,
  };
}

// --- Tests ---

describe('Weather & Time-of-Day Quest Generator', () => {
  describe('hourToTimeOfDayPeriod', () => {
    it('maps early hours to morning', () => {
      expect(hourToTimeOfDayPeriod(6)).toBe('morning');
      expect(hourToTimeOfDayPeriod(9)).toBe('morning');
      expect(hourToTimeOfDayPeriod(11)).toBe('morning');
    });

    it('maps midday hours to afternoon', () => {
      expect(hourToTimeOfDayPeriod(12)).toBe('afternoon');
      expect(hourToTimeOfDayPeriod(14)).toBe('afternoon');
      expect(hourToTimeOfDayPeriod(16)).toBe('afternoon');
    });

    it('maps late hours to evening', () => {
      expect(hourToTimeOfDayPeriod(17)).toBe('evening');
      expect(hourToTimeOfDayPeriod(19)).toBe('evening');
      expect(hourToTimeOfDayPeriod(20)).toBe('evening');
    });

    it('maps very late and early hours to night', () => {
      expect(hourToTimeOfDayPeriod(21)).toBe('night');
      expect(hourToTimeOfDayPeriod(0)).toBe('night');
      expect(hourToTimeOfDayPeriod(3)).toBe('night');
    });
  });

  describe('getWeatherVocabulary', () => {
    it('returns weather words for sunny conditions', () => {
      const vocab = getWeatherVocabulary('sunny');
      const words = vocab.map((v) => v.english);
      expect(words).toContain('sunny');
      expect(words).toContain('hot');
    });

    it('returns weather words for rainy conditions', () => {
      const vocab = getWeatherVocabulary('rainy');
      const words = vocab.map((v) => v.english);
      expect(words).toContain('rain');
      expect(words).toContain('cold');
    });

    it('filters by difficulty', () => {
      const beginnerVocab = getWeatherVocabulary('stormy', 'beginner');
      for (const entry of beginnerVocab) {
        expect(entry.difficulty).toBe('beginner');
      }
    });

    it('returns entries from the weather corpus category', () => {
      const vocab = getWeatherVocabulary('cloudy');
      for (const entry of vocab) {
        expect(entry.category).toBe('weather');
      }
    });
  });

  describe('getTimeVocabulary', () => {
    it('returns time words for morning', () => {
      const vocab = getTimeVocabulary('morning');
      const words = vocab.map((v) => v.english);
      expect(words).toContain('morning');
      expect(words).toContain('today');
    });

    it('returns time words for evening', () => {
      const vocab = getTimeVocabulary('evening');
      const words = vocab.map((v) => v.english);
      expect(words).toContain('evening');
      expect(words).toContain('night');
    });

    it('filters by difficulty', () => {
      const beginnerVocab = getTimeVocabulary('morning', 'beginner');
      for (const entry of beginnerVocab) {
        expect(entry.difficulty).toBe('beginner');
      }
    });
  });

  describe('getTemplatesForPeriod', () => {
    it('returns only weather_time category templates', () => {
      const templates = getTemplatesForPeriod('morning');
      for (const t of templates) {
        expect(t.category).toBe('weather_time');
      }
    });

    it('morning templates include morning_weather_chat', () => {
      const templates = getTemplatesForPeriod('morning');
      const ids = templates.map((t) => t.id);
      expect(ids).toContain('morning_weather_chat');
    });

    it('evening templates include evening_routine_report', () => {
      const templates = getTemplatesForPeriod('evening');
      const ids = templates.map((t) => t.id);
      expect(ids).toContain('evening_routine_report');
    });

    it('storm_story is available in evening', () => {
      const templates = getTemplatesForPeriod('evening');
      const ids = templates.map((t) => t.id);
      expect(ids).toContain('storm_story');
    });

    it('day_night_vocabulary is available in all periods', () => {
      for (const period of ['morning', 'afternoon', 'evening', 'night'] as const) {
        const templates = getTemplatesForPeriod(period);
        const ids = templates.map((t) => t.id);
        expect(ids).toContain('day_night_vocabulary');
      }
    });
  });

  describe('weather_time templates in QUEST_TEMPLATES', () => {
    const weatherTimeTemplates = QUEST_TEMPLATES.filter((t) => t.category === 'weather_time');

    it('includes at least 5 weather_time templates', () => {
      expect(weatherTimeTemplates.length).toBeGreaterThanOrEqual(5);
    });

    it('all templates have valid objective types', () => {
      for (const template of weatherTimeTemplates) {
        for (const obj of template.objectiveTemplates) {
          expect(VALID_OBJECTIVE_TYPES.has(obj.type)).toBe(true);
        }
      }
    });

    it('templates cover beginner, intermediate, and advanced difficulties', () => {
      const difficulties = new Set(weatherTimeTemplates.map((t) => t.difficulty));
      expect(difficulties.has('beginner')).toBe(true);
      expect(difficulties.has('intermediate')).toBe(true);
      expect(difficulties.has('advanced')).toBe(true);
    });

    it('all templates have non-empty parameters', () => {
      for (const template of weatherTimeTemplates) {
        expect(template.parameters.length).toBeGreaterThan(0);
      }
    });
  });

  describe('generateWeatherTimeQuests', () => {
    it('generates the requested number of quests', () => {
      const quests = generateWeatherTimeQuests(makeOptions({ count: 2 }));
      expect(quests.length).toBeLessThanOrEqual(2);
      expect(quests.length).toBeGreaterThan(0);
    });

    it('generates quests with weather_time tags', () => {
      const quests = generateWeatherTimeQuests(makeOptions());
      for (const quest of quests) {
        expect(quest.tags).toContain('category:weather_time');
      }
    });

    it('includes weather condition in tags', () => {
      const quests = generateWeatherTimeQuests(
        makeOptions({
          weatherTimeContext: makeWeatherTimeContext({ weather: 'rainy' }),
        }),
      );
      for (const quest of quests) {
        expect(quest.tags).toContain('weather:rainy');
      }
    });

    it('includes time period in tags', () => {
      const quests = generateWeatherTimeQuests(
        makeOptions({
          weatherTimeContext: makeWeatherTimeContext({ timeOfDayPeriod: 'evening', currentHour: 18 }),
        }),
      );
      for (const quest of quests) {
        expect(quest.tags).toContain('period:evening');
      }
    });

    it('assigns available NPCs as quest givers', () => {
      const quests = generateWeatherTimeQuests(makeOptions());
      for (const quest of quests) {
        expect(quest.assignedBy).toBeTruthy();
        expect(quest.assignedBy).not.toBe('Player1');
      }
    });

    it('attaches weatherContext metadata', () => {
      const quests = generateWeatherTimeQuests(
        makeOptions({
          weatherTimeContext: makeWeatherTimeContext({ weather: 'stormy', timeOfDayPeriod: 'afternoon' }),
        }),
      );
      for (const quest of quests) {
        expect(quest.weatherContext).toBeDefined();
        expect(quest.weatherContext.weather).toBe('stormy');
        expect(quest.weatherContext.timeOfDayPeriod).toBe('afternoon');
        expect(quest.weatherContext.weatherVocabulary).toBeInstanceOf(Array);
        expect(quest.weatherContext.timeVocabulary).toBeInstanceOf(Array);
      }
    });

    it('attaches questGiverSchedule metadata', () => {
      const quests = generateWeatherTimeQuests(makeOptions());
      for (const quest of quests) {
        expect(quest.questGiverSchedule).toBeDefined();
        expect(quest.questGiverSchedule.availableHours).toBeInstanceOf(Array);
      }
    });

    it('all generated objectives use valid objective types', () => {
      const quests = generateWeatherTimeQuests(makeOptions({ count: 3 }));
      for (const quest of quests) {
        for (const obj of quest.objectives) {
          expect(VALID_OBJECTIVE_TYPES.has(obj.type)).toBe(true);
        }
      }
    });

    it('excludes already active templates for the player', () => {
      const existingQuests = [
        {
          assignedTo: 'Player1',
          status: 'active',
          tags: ['template:morning_weather_chat'],
        },
      ] as any[];

      const quests = generateWeatherTimeQuests(
        makeOptions({
          existingQuests,
          weatherTimeContext: makeWeatherTimeContext({ timeOfDayPeriod: 'morning' }),
        }),
      );

      for (const quest of quests) {
        expect(quest.templateId).not.toBe('morning_weather_chat');
      }
    });

    it('returns empty array when no NPCs available', () => {
      const quests = generateWeatherTimeQuests(
        makeOptions({
          characters: [
            makeCharacter({ firstName: 'Player1', lastName: '' }), // Only the player
          ],
        }),
      );
      expect(quests).toEqual([]);
    });

    it('filters by difficulty when specified', () => {
      const quests = generateWeatherTimeQuests(
        makeOptions({ difficulty: 'beginner', count: 5 }),
      );
      for (const quest of quests) {
        expect(quest.difficulty).toBe('beginner');
      }
    });

    it('sets world target language on quests', () => {
      const quests = generateWeatherTimeQuests(
        makeOptions({
          world: makeWorld({ targetLanguage: 'Spanish' }),
        }),
      );
      for (const quest of quests) {
        expect(quest.targetLanguage).toBe('Spanish');
      }
    });

    it('does not assign sleeping NPCs during night', () => {
      const quests = generateWeatherTimeQuests(
        makeOptions({
          weatherTimeContext: makeWeatherTimeContext({
            timeOfDayPeriod: 'night',
            currentHour: 2,
            timeOfDay: 'night',
          }),
          characters: [
            makeCharacterWithRoutine({
              id: 'npc-awake',
              firstName: 'Awake',
              lastName: 'NPC',
              customData: {
                routine: {
                  characterId: 'npc-awake',
                  routine: {
                    day: [{ startHour: 0, endHour: 24, location: 'farm', locationType: 'work', occasion: 'working' }],
                    night: [{ startHour: 0, endHour: 24, location: 'tavern', locationType: 'leisure', occasion: 'socializing' }],
                  },
                  lastUpdated: Date.now(),
                },
              },
            }),
            makeCharacterWithRoutine({
              id: 'npc-asleep',
              firstName: 'Asleep',
              lastName: 'NPC',
            }),
          ],
        }),
      );
      // If any quests generated, they should be assigned to the awake NPC
      for (const quest of quests) {
        expect(quest.assignedBy).toBe('Awake NPC');
      }
    });
  });
});
