/**
 * Main Quest Records
 *
 * Creates and manages proper Quest database records for main quest chapters.
 * This bridges the MainQuestState system (stored as a truth) with the
 * standard quest system so main quest entries appear in the quest list
 * alongside side quests.
 */

import { storage } from '../db/storage.js';
import type { InsertQuest, Quest } from '../../shared/schema.js';
import type { MainQuestChapter, MainQuestObjective } from '../../shared/quest/main-quest-chapters.js';

/** Tag used to identify main quest records */
const MAIN_QUEST_TAG = 'main_quest';

/** Prefix for main quest record tags identifying the chapter */
function chapterTag(chapterNumber: number): string {
  return `chapter:${chapterNumber}`;
}

/**
 * Convert main quest objectives to standard quest objective format.
 */
function convertObjectives(objectives: MainQuestObjective[]): any[] {
  return objectives.map((obj, index) => ({
    id: obj.id,
    type: obj.questType,
    description: obj.description,
    completed: false,
    current: 0,
    required: obj.requiredCount,
    ...(obj.chainTemplateId ? { chainTemplateId: obj.chainTemplateId } : {}),
  }));
}

/**
 * Gold reward scaling per chapter number (50g to 500g).
 */
function chapterGoldReward(chapterNumber: number): number {
  const rewards: Record<number, number> = {
    1: 50,
    2: 100,
    3: 150,
    4: 250,
    5: 400,
    6: 500,
  };
  return rewards[chapterNumber] ?? 50;
}

/**
 * Find an existing main quest record for a chapter in a world.
 */
export async function findMainQuestRecord(
  worldId: string,
  chapterId: string,
  playerId: string,
): Promise<Quest | undefined> {
  const quests = await storage.getQuestsByWorld(worldId);
  return quests.find(
    q =>
      q.assignedTo === playerId &&
      q.tags &&
      Array.isArray(q.tags) &&
      q.tags.includes(MAIN_QUEST_TAG) &&
      q.tags.some((t: string) => t === `chapterId:${chapterId}`),
  );
}

/**
 * Create a proper Quest record for an active main quest chapter.
 * Returns the created quest, or the existing one if already created.
 */
export async function createMainQuestRecord(
  worldId: string,
  playerId: string,
  chapter: MainQuestChapter,
  targetLanguage: string,
  narrativeContext?: {
    introNarrative?: string;
    outroNarrative?: string;
    mysteryDetails?: string;
    clueDescriptions?: Array<{ clueId: string; text: string; locationId?: string; npcRole?: string }>;
  },
): Promise<Quest> {
  // Check if a record already exists for this chapter
  const existing = await findMainQuestRecord(worldId, chapter.id, playerId);
  if (existing) {
    // If it was previously completed/abandoned, reactivate it
    if (existing.status !== 'active') {
      const updated = await storage.updateQuest(existing.id, { status: 'active' });
      return updated ?? existing;
    }
    return existing;
  }

  const questData: InsertQuest = {
    worldId,
    assignedTo: playerId,
    title: `Chapter ${chapter.number}: ${chapter.title}`,
    description: chapter.introNarrative,
    questType: 'main_quest',
    difficulty: chapter.requiredCefrLevel === 'A1' ? 'beginner'
      : chapter.requiredCefrLevel === 'A2' ? 'intermediate'
      : 'advanced',
    cefrLevel: chapter.requiredCefrLevel,
    targetLanguage,
    objectives: convertObjectives(chapter.objectives),
    progress: Object.fromEntries(
      chapter.objectives.map(obj => [obj.id, 0]),
    ),
    status: 'active',
    experienceReward: chapter.completionBonusXP,
    rewards: {
      gold: chapterGoldReward(chapter.number),
      xp: chapter.completionBonusXP,
    },
    tags: [
      MAIN_QUEST_TAG,
      chapterTag(chapter.number),
      `chapterId:${chapter.id}`,
    ],
    conversationContext: narrativeContext ? JSON.stringify({
      introNarrative: narrativeContext.introNarrative || chapter.introNarrative,
      outroNarrative: narrativeContext.outroNarrative || chapter.outroNarrative,
      mysteryDetails: narrativeContext.mysteryDetails,
      clueDescriptions: narrativeContext.clueDescriptions,
    }) : JSON.stringify({
      introNarrative: chapter.introNarrative,
      outroNarrative: chapter.outroNarrative,
    }),
  };

  return storage.createQuest(questData);
}

/**
 * Update the quest record's objective progress to match the chapter state.
 */
export async function updateMainQuestObjectiveProgress(
  worldId: string,
  playerId: string,
  chapterId: string,
  objectiveProgress: Record<string, number>,
  chapter: MainQuestChapter,
): Promise<Quest | undefined> {
  const quest = await findMainQuestRecord(worldId, chapterId, playerId);
  if (!quest) return undefined;

  // Update objectives with current progress
  const updatedObjectives = convertObjectives(chapter.objectives).map(obj => ({
    ...obj,
    current: objectiveProgress[obj.id] ?? 0,
    completed: (objectiveProgress[obj.id] ?? 0) >= obj.required,
  }));

  return storage.updateQuest(quest.id, {
    objectives: updatedObjectives,
    progress: objectiveProgress,
  });
}

/**
 * Mark a main quest chapter record as completed.
 */
export async function completeMainQuestRecord(
  worldId: string,
  playerId: string,
  chapterId: string,
): Promise<Quest | undefined> {
  const quest = await findMainQuestRecord(worldId, chapterId, playerId);
  if (!quest) return undefined;

  // Mark all objectives as completed
  const completedObjectives = (quest.objectives ?? []).map((obj: any) => ({
    ...obj,
    completed: true,
    current: obj.required ?? obj.current,
  }));

  return storage.updateQuest(quest.id, {
    status: 'completed',
    completedAt: new Date(),
    objectives: completedObjectives,
  });
}
