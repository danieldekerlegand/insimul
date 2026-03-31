/**
 * Main Quest Progression Manager
 *
 * Tracks player progress through CEFR-gated main quest chapters.
 * Listens for quest completions and advances the main storyline.
 */

import type { QuestStorageProvider } from './quest-storage-provider.js';
import type { CEFRLevel } from '../assessment/cefr-mapping.js';
import type { Truth } from '../schema.js';

/** Playthrough overlay interface — handles per-playthrough truth isolation */
export interface PlaythroughOverlayProvider {
  getTruthsWithOverlay(worldId: string, playthroughId: string): Promise<Truth[]>;
  updateTruthInPlaythrough(playthroughId: string, truthId: string, data: Partial<Truth>, version: number): Promise<any>;
  createTruthInPlaythrough(playthroughId: string, data: any, version: number): Promise<any>;
}
import {
  createMainQuestRecord,
  completeMainQuestRecord,
  updateMainQuestObjectiveProgress,
} from './main-quest-records.js';

/** Resolve {{variable|fallback}} templates in narrative text */
function resolveTemplateVars(text: string | undefined, context: { writerName?: string; settlementName?: string }): string | undefined {
  if (!text) return text;
  return text
    .replace(/\{\{writer_name\|([^}]*)\}\}/g, (_, fallback) => context.writerName || fallback)
    .replace(/\{\{settlement_name\|([^}]*)\}\}/g, (_, fallback) => context.settlementName || fallback)
    .replace(/\{\{writer_name\}\}/g, context.writerName || 'the writer')
    .replace(/\{\{settlement_name\}\}/g, context.settlementName || 'the settlement')
    .replace(/\{WRITER\}/g, context.writerName || 'the writer')
    .replace(/\{SETTLEMENT\}/g, context.settlementName || 'the settlement');
}

/** Load narrative context for a specific chapter from the world's narrative truth.
 *  Resolves {{variable|fallback}} templates with current world data. */
async function loadNarrativeContextForChapter(storage: QuestStorageProvider, worldId: string, chapterId: string): Promise<any | undefined> {
  try {
    const truths = await storage.getTruthsByWorld(worldId);
    const narrativeTruth = truths.find((t: any) => t.entryType === 'world_narrative');
    if (!narrativeTruth?.content) return undefined;
    const narrative = JSON.parse(narrativeTruth.content);
    const chapter = narrative.chapters?.find((ch: any) => ch.chapterId === chapterId);
    if (!chapter) return undefined;

    // Resolve template variables with current world data
    const settlements = await storage.getSettlementsByWorld(worldId);
    const resolveCtx = {
      writerName: narrative.writerName,
      settlementName: settlements[0]?.name,
    };

    return {
      introNarrative: resolveTemplateVars(chapter.introNarrative, resolveCtx),
      outroNarrative: resolveTemplateVars(chapter.outroNarrative, resolveCtx),
      mysteryDetails: resolveTemplateVars(chapter.mysteryDetails, resolveCtx),
      clueDescriptions: chapter.clueDescriptions?.map((c: any) => ({
        ...c,
        text: resolveTemplateVars(c.text, resolveCtx),
      })),
    };
  } catch {
    return undefined;
  }
}
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
} from '../quest/main-quest-chapters.js';

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
  private storage: QuestStorageProvider;
  private overlay: PlaythroughOverlayProvider | null;

  constructor(storage: QuestStorageProvider, overlay?: PlaythroughOverlayProvider) {
    this.storage = storage;
    this.overlay = overlay ?? null;
  }

  /**
   * Get or initialize main quest state for a player in a world.
   * State is stored as a world truth with a special category.
   */
  async getMainQuestState(worldId: string, playerId: string, playthroughId?: string): Promise<MainQuestState> {
    const truths = playthroughId
      ? await this.overlay!.getTruthsWithOverlay(worldId, playthroughId)
      : await this.storage.getTruthsByWorld(worldId);
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
      ? await this.overlay!.getTruthsWithOverlay(worldId, playthroughId)
      : await this.storage.getTruthsByWorld(worldId);
    const existing = truths.find(
      (t: any) => t.category === 'main_quest_state' && t.characterId === playerId,
    );

    const content = JSON.stringify(state);

    if (existing) {
      if (playthroughId) {
        await this.overlay!.updateTruthInPlaythrough(playthroughId, existing.id, { content }, 0);
      } else {
        await this.storage.updateTruth(existing.id, { content });
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
        await this.overlay!.createTruthInPlaythrough(playthroughId, truthData, 0);
      } else {
        await this.storage.createTruth(truthData);
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
      chapterAdvance = await this.advanceChapter(state, chapter, chapterProgress, playerCefrLevel, worldId, playerId);
      addCaseNote(state, {
        day: dayNumber,
        text: `Chapter complete: "${chapter.title}". ${chapter.outroNarrative}`,
        category: 'chapter_event',
        chapterId: chapter.id,
      });
    }

    await this.saveMainQuestState(worldId, playerId, state, playthroughId);

    // Sync quest record objective progress
    try {
      await updateMainQuestObjectiveProgress(this.storage, 
        worldId, playerId, chapter.id, chapterProgress.objectiveProgress, chapter,
      );
    } catch (err) {
      console.error('[MainQuest] Failed to update quest record progress:', err);
    }

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
   * Creates/completes Quest records to keep the quest system in sync.
   */
  private async advanceChapter(
    state: MainQuestState,
    completedChapter: MainQuestChapter,
    completedProgress: ChapterProgress,
    playerCefrLevel: CEFRLevel | null,
    worldId?: string,
    playerId?: string,
  ): Promise<ChapterAdvanceResult> {
    completedProgress.status = 'completed';
    completedProgress.completedAt = new Date().toISOString();
    state.totalXPEarned += completedChapter.completionBonusXP;

    // Load narrative truth for richer outro/intro text
    const narrativeCtx = worldId ? await loadNarrativeContextForChapter(this.storage, worldId, completedChapter.id) : undefined;

    const result: ChapterAdvanceResult = {
      advanced: true,
      completedChapterId: completedChapter.id,
      completedChapterTitle: completedChapter.title,
      bonusXP: completedChapter.completionBonusXP,
      outroNarrative: narrativeCtx?.outroNarrative || completedChapter.outroNarrative,
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
        const nextNarrativeCtx = worldId ? await loadNarrativeContextForChapter(this.storage, worldId, nextChapter.id) : undefined;
        result.introNarrative = nextNarrativeCtx?.introNarrative || nextChapter.introNarrative;
      } else if (nextProgress) {
        nextProgress.status = 'available';
        state.currentChapterId = null; // Waiting for CEFR level
      }
    } else {
      state.currentChapterId = null; // All chapters complete
    }

    // Sync quest records: complete old chapter, create next
    if (worldId && playerId) {
      try {
        await completeMainQuestRecord(this.storage, worldId, playerId, completedChapter.id);

        if (result.nextChapterId) {
          const nextChapter = MAIN_QUEST_CHAPTERS.find(ch => ch.id === result.nextChapterId);
          if (nextChapter) {
            const targetLanguage = await this.getWorldTargetLanguage(worldId);
            const narrativeCtx = await loadNarrativeContextForChapter(this.storage, worldId, nextChapter.id);
            await createMainQuestRecord(this.storage, worldId, playerId, nextChapter, targetLanguage, narrativeCtx);
          }
        }
      } catch (err) {
        console.error('[MainQuest] Failed to sync quest records on chapter advance:', err);
      }
    }

    return result;
  }

  /**
   * Get the target language for a world.
   */
  private async getWorldTargetLanguage(worldId: string): Promise<string> {
    try {
      const world = await this.storage.getWorld(worldId);
      return world?.targetLanguage || 'French';
    } catch {
      return 'French';
    }
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

        // Create quest record for the newly activated chapter
        try {
          const targetLanguage = await this.getWorldTargetLanguage(worldId);
          const narrativeCtx = await loadNarrativeContextForChapter(this.storage, worldId, chapter.id);
          await createMainQuestRecord(this.storage, worldId, playerId, chapter, targetLanguage, narrativeCtx);
        } catch (err) {
          console.error('[MainQuest] Failed to create quest record on unlock:', err);
        }

        return chapter;
      }
    }

    return null;
  }

  /**
   * Ensure the currently active chapter has a Quest record.
   * Called lazily on first access to bridge existing states.
   */
  async ensureActiveChapterHasQuestRecord(
    worldId: string,
    playerId: string,
    playthroughId?: string,
  ): Promise<void> {
    const state = await this.getMainQuestState(worldId, playerId, playthroughId);
    if (!state.currentChapterId) return;

    const chapter = getChapterById(state.currentChapterId);
    if (!chapter) return;

    try {
      const targetLanguage = await this.getWorldTargetLanguage(worldId);
      const narrativeCtx = await loadNarrativeContextForChapter(this.storage, worldId, chapter.id);
      await createMainQuestRecord(this.storage, worldId, playerId, chapter, targetLanguage, narrativeCtx);
    } catch (err) {
      console.error('[MainQuest] Failed to ensure quest record:', err);
    }
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

// Factory: create with the given storage provider
export function createMainQuestProgressionManager(storage: QuestStorageProvider): MainQuestProgressionManager {
  return new MainQuestProgressionManager(storage);
}
