/**
 * Main Quest Progression Manager
 *
 * Tracks player progress through CEFR-gated main quest chapters.
 * Listens for quest completions and advances the main storyline.
 */

import { storage } from '../db/storage.js';
import type { CEFRLevel } from '../../shared/assessment/cefr-mapping.js';
import {
  MAIN_QUEST_CHAPTERS,
  type MainQuestState,
  type ChapterProgress,
  type MainQuestChapter,
  createInitialMainQuestState,
  meetsChapterCefrRequirement,
  isChapterComplete,
  getChapterCompletionPercent,
  getChapterById,
} from '../../shared/quest/main-quest-chapters.js';

export interface ChapterAdvanceResult {
  advanced: boolean;
  completedChapterId?: string;
  completedChapterTitle?: string;
  bonusXP: number;
  outroNarrative?: string;
  nextChapterId?: string;
  nextChapterTitle?: string;
  introNarrative?: string;
}

export interface ObjectiveProgressResult {
  updated: boolean;
  objectiveId: string;
  current: number;
  required: number;
  objectiveCompleted: boolean;
  chapterAdvance?: ChapterAdvanceResult;
}

export class MainQuestProgressionManager {
  /**
   * Get or initialize main quest state for a player in a world.
   * State is stored as a world truth with a special category.
   */
  async getMainQuestState(worldId: string, playerId: string): Promise<MainQuestState> {
    const truths = await storage.getTruthsByWorld(worldId);
    const stateTruth = truths.find(
      t => t.category === 'main_quest_state' && t.characterId === playerId,
    );

    if (stateTruth?.content) {
      try {
        return JSON.parse(stateTruth.content) as MainQuestState;
      } catch {
        // Corrupted state — reinitialize
      }
    }

    return createInitialMainQuestState();
  }

  /**
   * Save main quest state.
   */
  async saveMainQuestState(
    worldId: string,
    playerId: string,
    state: MainQuestState,
  ): Promise<void> {
    const truths = await storage.getTruthsByWorld(worldId);
    const existing = truths.find(
      t => t.category === 'main_quest_state' && t.characterId === playerId,
    );

    const content = JSON.stringify(state);

    if (existing) {
      await storage.updateTruth(existing.id, { content });
    } else {
      await storage.createTruth({
        worldId,
        characterId: playerId,
        title: 'Main Quest Progress',
        content,
        entryType: 'fact',
        category: 'main_quest_state',
      });
    }
  }

  /**
   * Record progress on a quest completion.
   * Matches the completed quest's type against current chapter objectives.
   */
  async recordQuestCompletion(
    worldId: string,
    playerId: string,
    questType: string,
    playerCefrLevel: CEFRLevel | null,
  ): Promise<ObjectiveProgressResult | null> {
    const state = await this.getMainQuestState(worldId, playerId);
    if (!state.currentChapterId) return null;

    const chapterProgress = state.chapters.find(
      cp => cp.chapterId === state.currentChapterId,
    );
    if (!chapterProgress || chapterProgress.status !== 'active') return null;

    const chapter = getChapterById(state.currentChapterId);
    if (!chapter) return null;

    // Find matching objective that isn't yet complete
    const matchingObjective = chapter.objectives.find(obj => {
      if (obj.questType !== questType) return false;
      const current = chapterProgress.objectiveProgress[obj.id] ?? 0;
      return current < obj.requiredCount;
    });

    if (!matchingObjective) return null;

    // Increment progress
    const newCount = (chapterProgress.objectiveProgress[matchingObjective.id] ?? 0) + 1;
    chapterProgress.objectiveProgress[matchingObjective.id] = newCount;
    const objectiveCompleted = newCount >= matchingObjective.requiredCount;

    // Check if chapter is now complete
    let chapterAdvance: ChapterAdvanceResult | undefined;
    if (isChapterComplete(chapter, chapterProgress)) {
      chapterAdvance = this.advanceChapter(state, chapter, chapterProgress, playerCefrLevel);
    }

    await this.saveMainQuestState(worldId, playerId, state);

    return {
      updated: true,
      objectiveId: matchingObjective.id,
      current: newCount,
      required: matchingObjective.requiredCount,
      objectiveCompleted,
      chapterAdvance,
    };
  }

  /**
   * Advance to the next chapter after completing the current one.
   */
  private advanceChapter(
    state: MainQuestState,
    completedChapter: MainQuestChapter,
    completedProgress: ChapterProgress,
    playerCefrLevel: CEFRLevel | null,
  ): ChapterAdvanceResult {
    completedProgress.status = 'completed';
    completedProgress.completedAt = new Date().toISOString();
    state.totalXPEarned += completedChapter.completionBonusXP;

    const result: ChapterAdvanceResult = {
      advanced: true,
      completedChapterId: completedChapter.id,
      completedChapterTitle: completedChapter.title,
      bonusXP: completedChapter.completionBonusXP,
      outroNarrative: completedChapter.outroNarrative,
    };

    // Find next chapter
    const nextChapterIndex = MAIN_QUEST_CHAPTERS.findIndex(
      ch => ch.id === completedChapter.id,
    ) + 1;

    if (nextChapterIndex < MAIN_QUEST_CHAPTERS.length) {
      const nextChapter = MAIN_QUEST_CHAPTERS[nextChapterIndex];
      const nextProgress = state.chapters.find(cp => cp.chapterId === nextChapter.id);

      if (nextProgress && meetsChapterCefrRequirement(playerCefrLevel, nextChapter)) {
        nextProgress.status = 'active';
        nextProgress.startedAt = new Date().toISOString();
        state.currentChapterId = nextChapter.id;
        result.nextChapterId = nextChapter.id;
        result.nextChapterTitle = nextChapter.title;
        result.introNarrative = nextChapter.introNarrative;
      } else if (nextProgress) {
        nextProgress.status = 'available';
        state.currentChapterId = null; // Waiting for CEFR level
      }
    } else {
      state.currentChapterId = null; // All chapters complete
    }

    return result;
  }

  /**
   * Attempt to unlock the next chapter after a CEFR level change.
   * Returns the newly unlocked chapter if any.
   */
  async tryUnlockNextChapter(
    worldId: string,
    playerId: string,
    newCefrLevel: CEFRLevel,
  ): Promise<MainQuestChapter | null> {
    const state = await this.getMainQuestState(worldId, playerId);

    // Find the first chapter that is 'available' (completed prereq but CEFR-locked)
    for (const cp of state.chapters) {
      if (cp.status !== 'available') continue;
      const chapter = getChapterById(cp.chapterId);
      if (!chapter) continue;

      if (meetsChapterCefrRequirement(newCefrLevel, chapter)) {
        cp.status = 'active';
        cp.startedAt = new Date().toISOString();
        state.currentChapterId = chapter.id;
        await this.saveMainQuestState(worldId, playerId, state);
        return chapter;
      }
    }

    return null;
  }

  /**
   * Get a summary for the journal UI.
   */
  async getJournalSummary(
    worldId: string,
    playerId: string,
    playerCefrLevel: CEFRLevel | null,
  ): Promise<{
    state: MainQuestState;
    chapters: Array<{
      chapter: MainQuestChapter;
      progress: ChapterProgress;
      completionPercent: number;
      cefrMet: boolean;
    }>;
  }> {
    const state = await this.getMainQuestState(worldId, playerId);

    const chapters = MAIN_QUEST_CHAPTERS.map(chapter => {
      const progress = state.chapters.find(cp => cp.chapterId === chapter.id) ?? {
        chapterId: chapter.id,
        status: 'locked' as const,
        objectiveProgress: {},
      };

      return {
        chapter,
        progress,
        completionPercent: getChapterCompletionPercent(chapter, progress),
        cefrMet: meetsChapterCefrRequirement(playerCefrLevel, chapter),
      };
    });

    return { state, chapters };
  }
}

export const mainQuestProgressionManager = new MainQuestProgressionManager();
