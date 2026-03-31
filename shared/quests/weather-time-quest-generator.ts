/**
 * Weather & Time-of-Day Quest Generator
 *
 * Generates vocabulary quests that tie weather/time-of-day vocabulary
 * to NPC schedules. Quests adapt to the current in-game time and
 * select NPCs who are available at that time.
 */

import type { Character, Quest, World, Settlement, TimeOfDay, ActivityOccasion } from '../schema.js';
import {
  QUEST_TEMPLATES,
  type QuestTemplate,
} from '../language/quest-templates.js';
import { VOCABULARY_CORPUS, type VocabularyCorpusEntry } from '../language/vocabulary-corpus.js';
import { validateAndNormalizeObjectives } from '../quest-objective-types.js';
import { convertQuestToProlog } from '../prolog/quest-converter.js';
import {
  isNPCAvailable,
  getNPCTimeBlock,
  getNPCAvailableHours,
  type ScheduleContext,
} from './quest-assignment-engine.js';

// --- Types ---

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy' | 'windy' | 'clear';

export type TimeOfDayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface WeatherTimeContext {
  weather: WeatherCondition;
  timeOfDayPeriod: TimeOfDayPeriod;
  currentHour: number;
  timeOfDay: TimeOfDay; // 'day' | 'night'
}

export interface WeatherTimeQuestOptions {
  worldId: string;
  world: World;
  characters: Character[];
  settlements: Settlement[];
  existingQuests: Quest[];
  playerName: string;
  playerCharacterId?: string;
  weatherTimeContext: WeatherTimeContext;
  count?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

// --- Constants ---

/** Weather vocabulary words grouped by condition. */
const WEATHER_VOCAB_BY_CONDITION: Record<WeatherCondition, string[]> = {
  sunny: ['sunny', 'hot', 'warm', 'sun', 'sky'],
  cloudy: ['cloud', 'wind', 'warm', 'sky'],
  rainy: ['rain', 'cloud', 'cold', 'wind', 'storm'],
  stormy: ['storm', 'wind', 'rain', 'cold', 'cloud'],
  snowy: ['snow', 'cold', 'wind', 'cloud'],
  foggy: ['foggy', 'cold', 'cloud', 'wind'],
  windy: ['wind', 'cloud', 'cold'],
  clear: ['sunny', 'warm', 'sky', 'sun'],
};

/** Time vocabulary words grouped by period. */
const TIME_VOCAB_BY_PERIOD: Record<TimeOfDayPeriod, string[]> = {
  morning: ['morning', 'early', 'today', 'now', 'day'],
  afternoon: ['afternoon', 'today', 'now', 'day', 'later'],
  evening: ['evening', 'late', 'night', 'today', 'soon'],
  night: ['night', 'late', 'tomorrow', 'always', 'never'],
};

/** NPC occasions appropriate for each time-of-day period. */
const PREFERRED_OCCASIONS_BY_PERIOD: Record<TimeOfDayPeriod, ActivityOccasion[]> = {
  morning: ['eating', 'working', 'commuting'],
  afternoon: ['working', 'socializing', 'shopping'],
  evening: ['eating', 'relaxing', 'socializing'],
  night: ['relaxing', 'sleeping'],
};

/** Map weather_time template IDs to the time-of-day periods they work best for. */
const TEMPLATE_TIME_AFFINITY: Record<string, TimeOfDayPeriod[]> = {
  morning_weather_chat: ['morning'],
  weather_watcher: ['morning', 'afternoon'],
  evening_routine_report: ['evening'],
  weather_and_plans: ['morning', 'afternoon', 'evening'],
  npc_schedule_tracker: ['morning', 'afternoon', 'evening'],
  storm_story: ['evening', 'night'],
  seasonal_scene: ['morning', 'afternoon'],
  day_night_vocabulary: ['morning', 'afternoon', 'evening', 'night'],
};

// --- Helpers ---

/** Convert hour (0-23) to time-of-day period. */
export function hourToTimeOfDayPeriod(hour: number): TimeOfDayPeriod {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/** Get weather vocabulary entries from the corpus matching a condition. */
export function getWeatherVocabulary(
  condition: WeatherCondition,
  difficulty?: 'beginner' | 'intermediate' | 'advanced',
): VocabularyCorpusEntry[] {
  const relevantWords = WEATHER_VOCAB_BY_CONDITION[condition] ?? [];
  return VOCABULARY_CORPUS.weather.filter(
    (entry) =>
      relevantWords.includes(entry.english) &&
      (!difficulty || entry.difficulty === difficulty),
  );
}

/** Get time vocabulary entries from the corpus matching a period. */
export function getTimeVocabulary(
  period: TimeOfDayPeriod,
  difficulty?: 'beginner' | 'intermediate' | 'advanced',
): VocabularyCorpusEntry[] {
  const relevantWords = TIME_VOCAB_BY_PERIOD[period] ?? [];
  return VOCABULARY_CORPUS.time.filter(
    (entry) =>
      relevantWords.includes(entry.english) &&
      (!difficulty || entry.difficulty === difficulty),
  );
}

/** Get weather_time templates filtered by current time-of-day period. */
export function getTemplatesForPeriod(period: TimeOfDayPeriod): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((t) => {
    if (t.category !== 'weather_time') return false;
    const affinity = TEMPLATE_TIME_AFFINITY[t.id];
    return !affinity || affinity.includes(period);
  });
}

/** Filter NPCs to those available at the current schedule context. */
function getAvailableNPCs(
  characters: Character[],
  playerName: string,
  schedule: ScheduleContext,
): Character[] {
  return characters.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.trim();
    if (name === playerName) return false;
    if (c.status !== 'active') return false;
    return isNPCAvailable(c, schedule);
  });
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  let result = template;
  for (const [key, val] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), String(val));
  }
  return result;
}

// --- Main Generator ---

/**
 * Generate weather and time-of-day vocabulary quests tied to NPC schedules.
 *
 * Selects quest templates appropriate for the current time of day,
 * assigns NPCs who are available according to their schedules,
 * and populates vocabulary targets from the weather/time corpus.
 */
export function generateWeatherTimeQuests(
  options: WeatherTimeQuestOptions,
): any[] {
  const {
    world,
    characters,
    settlements,
    existingQuests,
    playerName,
    playerCharacterId,
    weatherTimeContext,
    count = 2,
    difficulty,
  } = options;

  const { weather, timeOfDayPeriod, currentHour, timeOfDay } = weatherTimeContext;

  const schedule: ScheduleContext = { currentHour, timeOfDay };

  // Get templates appropriate for the current time
  let templates = getTemplatesForPeriod(timeOfDayPeriod);

  // Filter by difficulty if specified
  if (difficulty) {
    const filtered = templates.filter((t) => t.difficulty === difficulty);
    if (filtered.length > 0) templates = filtered;
  }

  // Exclude templates already active for this player
  const activeTemplateIds = new Set<string>();
  for (const q of existingQuests) {
    if (q.assignedTo === playerName && q.status === 'active' && q.tags && Array.isArray(q.tags)) {
      const tid = (q.tags as string[]).find((t) => t.startsWith('template:'));
      if (tid) activeTemplateIds.add(tid.replace('template:', ''));
    }
  }
  templates = templates.filter((t) => !activeTemplateIds.has(t.id));

  if (templates.length === 0) return [];

  // Get available NPCs
  const availableNPCs = getAvailableNPCs(characters, playerName, schedule);
  if (availableNPCs.length === 0) return [];

  // Get location names
  const locations = settlements.map((s) => s.name).filter(Boolean) as string[];
  if (locations.length === 0) locations.push('Town Square');

  // Get relevant vocabulary
  const weatherVocab = getWeatherVocabulary(weather, difficulty);
  const timeVocab = getTimeVocabulary(timeOfDayPeriod, difficulty);

  // Select templates (shuffle and pick)
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  const quests: any[] = [];

  for (const template of selected) {
    const npc = pick(availableNPCs);
    const npcBlock = getNPCTimeBlock(npc, schedule);
    const availableHours = getNPCAvailableHours(npc);

    // Fill parameters
    const params: Record<string, string | number> = {};
    for (const param of template.parameters) {
      switch (param.type) {
        case 'npc':
          params[param.name] = charName(npc);
          break;
        case 'location':
          params[param.name] = pick(locations);
          break;
        case 'number': {
          const base =
            template.objectiveTemplates.find((o) =>
              o.descriptionTemplate.includes(`{{${param.name}}}`),
            )?.requiredCount ?? 3;
          const scale =
            template.difficulty === 'beginner'
              ? 0.8
              : template.difficulty === 'advanced'
                ? 1.5
                : 1;
          params[param.name] = Math.max(1, Math.round(base * scale));
          break;
        }
        default:
          params[param.name] = param.description;
      }
    }

    // Build objectives
    const rawObjectives = template.objectiveTemplates.map((ot, idx) => ({
      id: `obj_${idx}`,
      type: ot.type,
      description: interpolate(ot.descriptionTemplate, params),
      requiredCount: ot.requiredCount,
      currentCount: 0,
      completed: false,
    }));
    const objectives = validateAndNormalizeObjectives(rawObjectives);

    const rewards = {
      xp: Math.round(
        template.rewardScale.xp *
          (template.difficulty === 'beginner' ? 1 : template.difficulty === 'intermediate' ? 1.5 : 2),
      ),
      fluency: Math.round(
        template.rewardScale.fluency *
          (template.difficulty === 'beginner' ? 1 : template.difficulty === 'intermediate' ? 1.5 : 2),
      ),
    };

    const quest: any = {
      worldId: world.id,
      assignedTo: playerName,
      assignedToCharacterId: playerCharacterId ?? null,
      assignedBy: charName(npc),
      assignedByCharacterId: npc.id,
      title: template.name,
      description: interpolate(template.description, params),
      questType: 'vocabulary',
      difficulty: template.difficulty,
      targetLanguage: world.targetLanguage || 'English',
      gameType: 'language-learning',
      objectives,
      progress: { percentComplete: 0 },
      status: 'active',
      experienceReward: rewards.xp,
      rewards,
      tags: [
        `template:${template.id}`,
        `category:weather_time`,
        `weather:${weather}`,
        `period:${timeOfDayPeriod}`,
      ],
      templateId: template.id,
      filledParameters: params,
      weatherContext: {
        weather,
        timeOfDayPeriod,
        currentHour,
        weatherVocabulary: weatherVocab.map((v) => v.english),
        timeVocabulary: timeVocab.map((v) => v.english),
      },
      questGiverSchedule: {
        location: npcBlock?.location ?? null,
        availableHours,
        currentOccasion: npcBlock?.occasion ?? null,
      },
    };

    // Generate Prolog content
    try {
      const result = convertQuestToProlog(quest);
      quest.content = result.prologContent;
    } catch {
      // Non-critical
    }

    quests.push(quest);
  }

  return quests;
}
