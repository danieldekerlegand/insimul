/**
 * Main Quest Progression Manager
 *
 * Tracks player progress through CEFR-gated main quest chapters.
 * Listens for quest completions and advances the main storyline.
 */

import { storage } from '../db/storage.js';
import * as PlaythroughOverlay from './playthrough-overlay.js';
import type { CEFRLevel } from '../../shared/assessment/cefr-mapping.js';
import {
  MAIN_QUEST_CHAPTERS,
  type MainQuestState,
  type ChapterProgress,
  type MainQuestChapter,
  type NarrativeBeat,
  type PendingNarrativeBeat,
  type NarrativeBeatType,
  createInitialMainQuestState,
  meetsChapterCefrRequirement,
  isChapterComplete,
  getChapterCompletionPercent,
  getChapterById,
  narrativeBeatId,
  addCaseNote,
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
  async getMainQuestState(worldId: string, playerId: string, playthroughId?: string): Promise<MainQuestState> {
    const truths = playthroughId
      ? await PlaythroughOverlay.getTruthsWithOverlay(worldId, playthroughId)
      : await storage.getTruthsByWorld(worldId);
    const stateTruth = truths.find(
      (t: any) => t.category === 'main_quest_state' && t.characterId === playerId,
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
   * Save main quest state. When playthroughId is provided, mutations go through
   * the playthrough overlay so base world truths are never modified.
   */
  async saveMainQuestState(
    worldId: string,
    playerId: string,
    state: MainQuestState,
    playthroughId?: string,
  ): Promise<void> {
    const truths = playthroughId
      ? await PlaythroughOverlay.getTruthsWithOverlay(worldId, playthroughId)
      : await storage.getTruthsByWorld(worldId);
    const existing = truths.find(
      (t: any) => t.category === 'main_quest_state' && t.characterId === playerId,
    );

    const content = JSON.stringify(state);

    if (existing) {
      if (playthroughId) {
        await PlaythroughOverlay.updateTruthInPlaythrough(playthroughId, existing.id, { content }, 0);
      } else {
        await storage.updateTruth(existing.id, { content });
      }
    } else {
      const truthData = {
        worldId,
        characterId: playerId,
        title: 'Main Quest Progress',
        content,
        entryType: 'fact',
        category: 'main_quest_state',
      };
      if (playthroughId) {
        await PlaythroughOverlay.createTruthInPlaythrough(playthroughId, truthData, 0);
      } else {
        await storage.createTruth(truthData);
      }
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
    playthroughId?: string,
  ): Promise<ObjectiveProgressResult | null> {
    const state = await this.getMainQuestState(worldId, playerId, playthroughId);
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

    // Generate a case note for the objective progress
    const dayNumber = this.calculateGameDay(state);
    const noteCategory = this.questTypeToCaseNoteCategory(questType);
    addCaseNote(state, {
      day: dayNumber,
      text: objectiveCompleted
        ? `Completed: ${matchingObjective.title}. Another piece of the investigation falls into place.`
        : `Progress on "${matchingObjective.title}" (${newCount}/${matchingObjective.requiredCount}).`,
      category: noteCategory,
      chapterId: chapter.id,
    });

    // Check if chapter is now complete
    let chapterAdvance: ChapterAdvanceResult | undefined;
    if (isChapterComplete(chapter, chapterProgress)) {
      chapterAdvance = this.advanceChapter(state, chapter, chapterProgress, playerCefrLevel);
      addCaseNote(state, {
        day: dayNumber,
        text: `Chapter complete: "${chapter.title}". ${chapter.outroNarrative}`,
        category: 'chapter_event',
        chapterId: chapter.id,
      });
    }

    await this.saveMainQuestState(worldId, playerId, state, playthroughId);

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
    playthroughId?: string,
  ): Promise<MainQuestChapter | null> {
    const state = await this.getMainQuestState(worldId, playerId, playthroughId);

    // Find the first chapter that is 'available' (completed prereq but CEFR-locked)
    for (const cp of state.chapters) {
      if (cp.status !== 'available') continue;
      const chapter = getChapterById(cp.chapterId);
      if (!chapter) continue;

      if (meetsChapterCefrRequirement(newCefrLevel, chapter)) {
        cp.status = 'active';
        cp.startedAt = new Date().toISOString();
        state.currentChapterId = chapter.id;
        await this.saveMainQuestState(worldId, playerId, state, playthroughId);
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
    playthroughId?: string,
  ): Promise<{
    state: MainQuestState;
    chapters: Array<{
      chapter: MainQuestChapter;
      progress: ChapterProgress;
      completionPercent: number;
      cefrMet: boolean;
    }>;
  }> {
    const state = await this.getMainQuestState(worldId, playerId, playthroughId);

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

  /**
   * Get pending narrative beats that haven't been delivered yet.
   * Returns intro beats for active chapters and outro beats for just-completed chapters.
   */
  async getPendingNarrativeBeats(
    worldId: string,
    playerId: string,
  ): Promise<PendingNarrativeBeat[]> {
    const state = await this.getMainQuestState(worldId, playerId);
    const delivered = new Set(
      (state.narrativeBeatsDelivered || []).map(b => b.id),
    );
    const pending: PendingNarrativeBeat[] = [];

    for (const cp of state.chapters) {
      const chapter = getChapterById(cp.chapterId);
      if (!chapter) continue;

      // Intro beat: chapter is active and intro hasn't been delivered
      if (cp.status === 'active') {
        const introId = narrativeBeatId('chapter_intro', cp.chapterId);
        if (!delivered.has(introId)) {
          pending.push({
            id: introId,
            type: 'chapter_intro',
            chapterId: cp.chapterId,
            chapterTitle: chapter.title,
            text: chapter.introNarrative,
          });
        }
      }

      // Outro beat: chapter is completed and outro hasn't been delivered
      if (cp.status === 'completed') {
        const outroId = narrativeBeatId('chapter_outro', cp.chapterId);
        if (!delivered.has(outroId)) {
          pending.push({
            id: outroId,
            type: 'chapter_outro',
            chapterId: cp.chapterId,
            chapterTitle: chapter.title,
            text: chapter.outroNarrative,
          });
        }
      }
    }

    return pending;
  }

  /**
   * Mark a narrative beat as delivered so it won't be shown again.
   */
  async markNarrativeBeatDelivered(
    worldId: string,
    playerId: string,
    beatId: string,
  ): Promise<boolean> {
    const state = await this.getMainQuestState(worldId, playerId);
    if (!state.narrativeBeatsDelivered) {
      state.narrativeBeatsDelivered = [];
    }

    // Already delivered
    if (state.narrativeBeatsDelivered.some(b => b.id === beatId)) {
      return false;
    }

    // Parse the beat ID to find the beat details
    const [type, ...chapterParts] = beatId.split(':');
    const chapterId = chapterParts.join(':');
    const chapter = getChapterById(chapterId);
    if (!chapter) return false;

    const beatType = type as NarrativeBeatType;
    const text = beatType === 'chapter_intro'
      ? chapter.introNarrative
      : chapter.outroNarrative;

    const beat: NarrativeBeat = {
      id: beatId,
      type: beatType,
      chapterId,
      text,
      deliveredAt: new Date().toISOString(),
    };

    state.narrativeBeatsDelivered.push(beat);
    await this.saveMainQuestState(worldId, playerId, state);
    return true;
  }

  /** Calculate the in-game day number based on quest state timestamps */
  private calculateGameDay(state: MainQuestState): number {
    const startedChapter = state.chapters.find(cp => cp.startedAt);
    if (!startedChapter?.startedAt) return 1;
    const startDate = new Date(startedChapter.startedAt).getTime();
    const now = Date.now();
    return Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
  }

  /** Map a quest type to a case note category */
  private questTypeToCaseNoteCategory(questType: string): 'clue' | 'npc_interview' | 'text_found' | 'location_visited' | 'chapter_event' {
    switch (questType) {
      case 'conversation': return 'npc_interview';
      case 'vocabulary': return 'text_found';
      case 'fetch': return 'clue';
      case 'grammar': return 'text_found';
      default: return 'clue';
    }
  }
}

export const mainQuestProgressionManager = new MainQuestProgressionManager();
