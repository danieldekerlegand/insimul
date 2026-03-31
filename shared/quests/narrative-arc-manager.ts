/**
 * Narrative Arc Manager
 *
 * Orchestrates the main quest narrative arc system. Creates, tracks, and
 * progresses multi-act story arcs by instantiating arc templates into
 * real quest chains stored in the database.
 *
 * An arc is represented as:
 * - A "root" quest (isMainQuest tag, stores arc metadata in its progress field)
 * - One quest chain per chapter (linked by questChainId)
 * - Individual subquests within each chain
 *
 * All arc/chapter/act metadata is encoded in quest tags so the system
 * layers cleanly on top of the existing quest infrastructure.
 */

import type { QuestStorageProvider } from './quest-storage-provider.js';
import type { Quest, InsertQuest } from '../schema.js';
import { getNarrativeArcTemplate } from './narrative-arc-templates.js';
import type {
  NarrativeArc,
  NarrativeArcTemplate,
  ActProgress,
  ChapterProgress,
  ChapterTemplate,
  SubQuestTemplate,
  ArcQuestMetadata,
  ArcProgressStatus,
  ActType,
  CEFRLevel,
} from '../narrative-arc-types.js';
import {
  ARC_TAG_PREFIX,
  ARC_CHAPTER_TAG_PREFIX,
  ARC_ACT_TAG_PREFIX,
} from '../narrative-arc-types.js';

// ─── Tag helpers ────────────────────────────────────────────────────────────

function encodeArcTag(meta: ArcQuestMetadata): string {
  return `${ARC_TAG_PREFIX}${JSON.stringify(meta)}`;
}

function decodeArcTag(tag: string): ArcQuestMetadata | null {
  if (!tag.startsWith(ARC_TAG_PREFIX)) return null;
  try {
    return JSON.parse(tag.slice(ARC_TAG_PREFIX.length));
  } catch {
    return null;
  }
}

function isArcQuest(quest: Quest): boolean {
  return (quest.tags || []).some(
    t => typeof t === 'string' && t.startsWith(ARC_TAG_PREFIX),
  );
}

function getArcMeta(quest: Quest): ArcQuestMetadata | null {
  for (const tag of quest.tags || []) {
    if (typeof tag === 'string') {
      const meta = decodeArcTag(tag);
      if (meta) return meta;
    }
  }
  return null;
}

/** CEFR levels ordered for comparison */
const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function cefrAtLeast(playerLevel: string | null, required: CEFRLevel): boolean {
  if (!playerLevel) return required === 'A1';
  const playerIdx = CEFR_ORDER.indexOf(playerLevel as CEFRLevel);
  const requiredIdx = CEFR_ORDER.indexOf(required);
  return playerIdx >= requiredIdx;
}

// ─── Manager ────────────────────────────────────────────────────────────────

export class NarrativeArcManager {
  private storage: QuestStorageProvider;

  constructor(storage: QuestStorageProvider) {
    this.storage = storage;
  }

  /**
   * Instantiate a narrative arc from a template, creating all quests in the DB.
   * Only the first chapter's quests are set to "active"; the rest are "pending".
   */
  async createArc(
    templateId: string,
    worldId: string,
    targetLanguage: string,
    assignedTo: string,
    assignedToCharacterId?: string,
  ): Promise<NarrativeArc | null> {
    const template = getNarrativeArcTemplate(templateId, targetLanguage);
    if (!template) return null;

    // Check no arc already exists for this player in this world
    const existing = await this.getArcForPlayer(worldId, assignedTo);
    if (existing) return null;

    const arcId = `arc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const allChapters: ChapterProgress[] = [];
    let globalOrder = 0;

    // Flatten chapters across acts for ordering
    const flatChapters: Array<{ act: ActType; chapter: ChapterTemplate }> = [];
    for (const act of template.acts) {
      for (const chapter of act.chapters) {
        flatChapters.push({ act: act.actType, chapter });
      }
    }
    flatChapters.sort((a, b) => a.chapter.order - b.chapter.order);

    // Create quest chains for each chapter
    for (const { act, chapter } of flatChapters) {
      const chainId = `${arcId}_ch_${chapter.key}`;
      const isFirstChapter = chapter.order === 0;
      const subQuestIds: string[] = [];

      for (let sqIdx = 0; sqIdx < chapter.subQuests.length; sqIdx++) {
        const sq = chapter.subQuests[sqIdx];
        const questStatus = isFirstChapter && sqIdx === 0 ? 'active' : 'pending';

        const arcMeta: ArcQuestMetadata = {
          arcId,
          templateId,
          actType: act,
          chapterKey: chapter.key,
          subQuestKey: sq.key,
          mainQuestOrder: globalOrder++,
        };

        const questData: InsertQuest = {
          worldId,
          assignedTo,
          assignedToCharacterId: assignedToCharacterId || null,
          assignedBy: null,
          assignedByCharacterId: null,
          title: sq.title,
          description: sq.description,
          questType: sq.questType,
          difficulty: sq.difficulty,
          cefrLevel: sq.cefrLevel,
          targetLanguage,
          objectives: sq.objectives.map(obj => ({
            ...obj,
            current: 0,
            completed: false,
          })),
          status: questStatus,
          experienceReward: this.calculateXP(sq),
          estimatedMinutes: sq.estimatedMinutes,
          tags: [
            'main_quest',
            `${ARC_ACT_TAG_PREFIX}${act}`,
            `${ARC_CHAPTER_TAG_PREFIX}${chapter.key}`,
            encodeArcTag(arcMeta),
            ...sq.tags,
          ],
        };

        const created = await this.storage.createQuest(questData);
        subQuestIds.push(created.id);
      }

      allChapters.push({
        chapterKey: chapter.key,
        title: chapter.title,
        narrativeSummary: chapter.narrativeSummary,
        questChainId: chainId,
        requiredCefrLevel: chapter.requiredCefrLevel,
        status: isFirstChapter ? 'active' : 'locked',
        subQuestIds,
        completedSubQuestIds: [],
      });
    }

    // Build act progress
    const acts = this.buildActProgress(template, allChapters);

    const arc: NarrativeArc = {
      id: arcId,
      worldId,
      templateId,
      name: template.name,
      description: template.description,
      targetLanguage,
      currentActType: 'introduction',
      currentChapterKey: flatChapters[0]?.chapter.key || null,
      acts,
      percentComplete: 0,
      createdAt: new Date().toISOString(),
    };

    // Store arc metadata as a "root" quest with special tags
    await this.storage.createQuest({
      worldId,
      assignedTo,
      assignedToCharacterId: assignedToCharacterId || null,
      assignedBy: null,
      assignedByCharacterId: null,
      title: `Main Quest: ${template.name}`,
      description: template.description,
      questType: 'cultural',
      difficulty: 'beginner',
      targetLanguage,
      status: 'active',
      tags: ['main_quest_root', `arc_id:${arcId}`, `template:${templateId}`],
      progress: arc as any,
    });

    return arc;
  }

  /**
   * Get the narrative arc for a player in a world.
   */
  async getArcForPlayer(
    worldId: string,
    playerName: string,
  ): Promise<NarrativeArc | null> {
    const quests = await this.storage.getQuestsByWorld(worldId);
    const rootQuest = quests.find(
      q =>
        q.assignedTo === playerName &&
        (q.tags || []).includes('main_quest_root'),
    );
    if (!rootQuest?.progress) return null;
    return rootQuest.progress as unknown as NarrativeArc;
  }

  /**
   * Get the root quest ID for a player's arc.
   */
  private async getArcRootQuest(
    worldId: string,
    playerName: string,
  ): Promise<Quest | null> {
    const quests = await this.storage.getQuestsByWorld(worldId);
    return (
      quests.find(
        q =>
          q.assignedTo === playerName &&
          (q.tags || []).includes('main_quest_root'),
      ) || null
    );
  }

  /**
   * Refresh arc progress from the actual quest statuses in the DB.
   * Call this after completing a subquest to update chapter/act/arc status.
   */
  async refreshArcProgress(
    worldId: string,
    playerName: string,
    playerCefrLevel?: string | null,
  ): Promise<NarrativeArc | null> {
    const rootQuest = await this.getArcRootQuest(worldId, playerName);
    if (!rootQuest?.progress) return null;

    const arc = rootQuest.progress as unknown as NarrativeArc;
    const template = getNarrativeArcTemplate(arc.templateId, arc.targetLanguage);
    if (!template) return null;

    const allQuests = await this.storage.getQuestsByWorld(worldId);
    const arcQuests = allQuests.filter(q => {
      const meta = getArcMeta(q);
      return meta?.arcId === arc.id;
    });

    // Build a map of quest statuses by subquest key
    const questByKey = new Map<string, Quest>();
    for (const q of arcQuests) {
      const meta = getArcMeta(q);
      if (meta) questByKey.set(`${meta.chapterKey}:${meta.subQuestKey}`, q);
    }

    // Update chapter progress
    let totalSubQuests = 0;
    let completedSubQuests = 0;
    let currentChapterKey: string | null = null;
    let currentActType: ActType = 'introduction';

    for (const actProgress of arc.acts) {
      let actHasActive = false;
      let actAllComplete = true;

      for (const chapterProgress of actProgress.chapters) {
        const chapterTemplate = this.findChapter(template, chapterProgress.chapterKey);
        if (!chapterTemplate) continue;

        // Recalculate completed subquests
        chapterProgress.completedSubQuestIds = [];
        let chapterComplete = true;

        for (const sqId of chapterProgress.subQuestIds) {
          const sq = arcQuests.find(q => q.id === sqId);
          totalSubQuests++;
          if (sq?.status === 'completed') {
            chapterProgress.completedSubQuestIds.push(sqId);
            completedSubQuests++;
          } else {
            chapterComplete = false;
          }
        }

        // Determine chapter status
        const prereqsMet = chapterTemplate.prerequisiteChapterKeys.every(
          prereqKey => {
            const prereqChapter = this.findChapterProgress(arc, prereqKey);
            return prereqChapter?.status === 'completed';
          },
        );
        const cefrMet = cefrAtLeast(
          playerCefrLevel || null,
          chapterTemplate.requiredCefrLevel,
        );

        if (chapterComplete && chapterProgress.subQuestIds.length > 0) {
          chapterProgress.status = 'completed';
        } else if (
          chapterProgress.completedSubQuestIds.length > 0 ||
          chapterProgress.status === 'active'
        ) {
          chapterProgress.status = 'active';
          actHasActive = true;
          if (!currentChapterKey) {
            currentChapterKey = chapterProgress.chapterKey;
            currentActType = actProgress.actType;
          }
        } else if (prereqsMet && cefrMet) {
          chapterProgress.status = 'available';
          actHasActive = true;
          if (!currentChapterKey) {
            currentChapterKey = chapterProgress.chapterKey;
            currentActType = actProgress.actType;
          }
        } else {
          chapterProgress.status = 'locked';
          actAllComplete = false;
        }

        if (chapterProgress.status !== 'completed') {
          actAllComplete = false;
        }
      }

      // Update act status
      if (actAllComplete && actProgress.chapters.length > 0) {
        actProgress.status = 'completed';
      } else if (actHasActive) {
        actProgress.status = 'active';
      } else if (actProgress.chapters.some(c => c.status === 'available')) {
        actProgress.status = 'available';
      } else {
        actProgress.status = 'locked';
      }
    }

    arc.currentChapterKey = currentChapterKey;
    arc.currentActType = currentActType;
    arc.percentComplete =
      totalSubQuests > 0
        ? Math.round((completedSubQuests / totalSubQuests) * 100)
        : 0;

    // Activate next chapter's first subquest if available
    await this.activateNextAvailableSubQuests(arc, arcQuests);

    // Persist updated progress
    await this.storage.updateQuest(rootQuest.id, {
      progress: arc as any,
      status: arc.percentComplete >= 100 ? 'completed' : 'active',
    });

    return arc;
  }

  /**
   * When a chapter becomes available/active, activate its first pending subquest.
   */
  private async activateNextAvailableSubQuests(
    arc: NarrativeArc,
    arcQuests: Quest[],
  ): Promise<void> {
    for (const act of arc.acts) {
      for (const chapter of act.chapters) {
        if (chapter.status !== 'active' && chapter.status !== 'available') continue;

        // Find first pending subquest in this chapter whose predecessor is done
        for (let i = 0; i < chapter.subQuestIds.length; i++) {
          const sqId = chapter.subQuestIds[i];
          const sq = arcQuests.find(q => q.id === sqId);
          if (!sq || sq.status !== 'pending') continue;

          // First subquest in chapter has no prerequisite; others need the previous one completed
          const prevCompleted =
            i === 0 ||
            arcQuests.find(q => q.id === chapter.subQuestIds[i - 1])?.status === 'completed';

          if (prevCompleted) {
            await this.storage.updateQuest(sqId, { status: 'active' });
            if (chapter.status === 'available') {
              chapter.status = 'active';
            }
            break;
          }
        }
      }
    }
  }

  /**
   * Get all main quest subquests for a player (for the quest tracker UI).
   */
  async getMainQuestSubQuests(
    worldId: string,
    playerName: string,
  ): Promise<Quest[]> {
    const quests = await this.storage.getQuestsByWorld(worldId);
    return quests.filter(
      q =>
        q.assignedTo === playerName &&
        (q.tags || []).includes('main_quest') &&
        !(q.tags || []).includes('main_quest_root'),
    );
  }

  /**
   * Get the current active chapter's quests.
   */
  async getCurrentChapterQuests(
    worldId: string,
    playerName: string,
  ): Promise<{ chapter: ChapterProgress | null; quests: Quest[] }> {
    const arc = await this.getArcForPlayer(worldId, playerName);
    if (!arc?.currentChapterKey) return { chapter: null, quests: [] };

    const chapter = this.findChapterProgress(arc, arc.currentChapterKey);
    if (!chapter) return { chapter: null, quests: [] };

    const quests: Quest[] = [];
    for (const sqId of chapter.subQuestIds) {
      const q = await this.storage.getQuest(sqId);
      if (q) quests.push(q);
    }

    return { chapter, quests };
  }

  /**
   * Delete an arc and all its associated quests.
   */
  async deleteArc(worldId: string, playerName: string): Promise<boolean> {
    const rootQuest = await this.getArcRootQuest(worldId, playerName);
    if (!rootQuest) return false;

    const arc = rootQuest.progress as unknown as NarrativeArc;
    if (!arc) return false;

    // Delete all subquests
    const allQuests = await this.storage.getQuestsByWorld(worldId);
    const arcQuests = allQuests.filter(q => {
      const meta = getArcMeta(q);
      return meta?.arcId === arc.id;
    });

    for (const q of arcQuests) {
      await this.storage.deleteQuest(q.id);
    }

    // Delete the root quest
    await this.storage.deleteQuest(rootQuest.id);
    return true;
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private buildActProgress(
    template: NarrativeArcTemplate,
    chapters: ChapterProgress[],
  ): ActProgress[] {
    const chaptersByAct = new Map<ActType, ChapterProgress[]>();

    for (const act of template.acts) {
      const actChapters = chapters.filter(cp =>
        act.chapters.some(ct => ct.key === cp.chapterKey),
      );
      chaptersByAct.set(act.actType, actChapters);
    }

    return template.acts.map(act => ({
      actType: act.actType,
      title: act.title,
      status: (act.actType === 'introduction' ? 'active' : 'locked') as ArcProgressStatus,
      chapters: chaptersByAct.get(act.actType) || [],
    }));
  }

  private findChapter(
    template: NarrativeArcTemplate,
    key: string,
  ): ChapterTemplate | null {
    for (const act of template.acts) {
      const chapter = act.chapters.find(c => c.key === key);
      if (chapter) return chapter;
    }
    return null;
  }

  private findChapterProgress(
    arc: NarrativeArc,
    key: string,
  ): ChapterProgress | null {
    for (const act of arc.acts) {
      const chapter = act.chapters.find(c => c.chapterKey === key);
      if (chapter) return chapter;
    }
    return null;
  }

  private calculateXP(sq: SubQuestTemplate): number {
    const cefrMultiplier: Record<string, number> = {
      A1: 1,
      A2: 1.5,
      B1: 2,
      B2: 3,
      C1: 4,
      C2: 5,
    };
    const base = 50 + sq.estimatedMinutes * 3;
    return Math.round(base * (cefrMultiplier[sq.cefrLevel] || 1));
  }
}

// Factory: create with the given storage provider
export function createNarrativeArcManager(storage: QuestStorageProvider): NarrativeArcManager {
  return new NarrativeArcManager(storage);
}
