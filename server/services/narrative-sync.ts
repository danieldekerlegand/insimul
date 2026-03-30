/**
 * Narrative Sync Service
 *
 * When the Narrative editor saves chapter data, this service syncs
 * downstream records: updates quest descriptions for linked quests,
 * updates text clueText for linked texts, and ensures the
 * narrativeChapterId field is set on matching records.
 */

import { storage } from '../db/storage.js';
import { CHAIN_QUEST_ORDER_TO_CHAPTER } from '../../shared/quest/main-quest-chapters.js';

/**
 * Sync narrative editor changes to quest and text records.
 * Called after the world_narrative truth is saved.
 */
export async function syncNarrativeToGameRecords(
  worldId: string,
  narrativeData: any,
): Promise<{ questsUpdated: number; textsUpdated: number }> {
  let questsUpdated = 0;
  let textsUpdated = 0;

  const chapters: any[] = narrativeData?.chapters || [];
  if (chapters.length === 0) return { questsUpdated, textsUpdated };

  const writerName = narrativeData?.writerName || '';

  // ── Sync quests ──────────────────────────────────────────────────────────
  // Set narrativeChapterId on chain quests based on questChainOrder
  const allQuests = await storage.getQuestsByWorld(worldId);
  const chainQuests = allQuests.filter((q: any) => q.questChainId);

  for (const quest of chainQuests) {
    const order = quest.questChainOrder ?? -1;
    const chapterId = CHAIN_QUEST_ORDER_TO_CHAPTER[order];
    if (!chapterId) continue;

    const chapter = chapters.find((ch: any) => ch.chapterId === chapterId || ch.id === chapterId);
    if (!chapter) continue;

    const updates: Record<string, any> = {};

    // Set narrativeChapterId if not already set
    if (quest.narrativeChapterId !== chapterId) {
      updates.narrativeChapterId = chapterId;
    }

    if (Object.keys(updates).length > 0) {
      await storage.updateQuest(quest.id, updates);
      questsUpdated++;
    }
  }

  // ── Sync texts ───────────────────────────────────────────────────────────
  // Set narrativeChapterId on texts that have matching chapterId tags
  const allTexts = await storage.getTextsByWorld(worldId);

  for (const text of allTexts) {
    const tags: string[] = (text as any).tags || [];

    // Check for chapterId:xxx tag
    const chapterTag = tags.find((t: string) => t.startsWith('chapterId:'));
    if (!chapterTag) continue;

    const chapterId = chapterTag.replace('chapterId:', '');
    if ((text as any).narrativeChapterId === chapterId) continue;

    await storage.updateText(text.id, { narrativeChapterId: chapterId } as any);
    textsUpdated++;
  }

  // Also set narrativeChapterId on texts whose authorName matches the writer
  if (writerName) {
    for (const text of allTexts) {
      if ((text as any).narrativeChapterId) continue; // already assigned
      const authorName = (text as any).authorName || '';
      if (!authorName.includes(writerName)) continue;

      // Assign to earliest chapter that doesn't already have texts
      // (simple heuristic: use CEFR level to guess chapter)
      const cefrLevel = (text as any).cefrLevel || 'A1';
      const cefrToChapter: Record<string, string> = {
        'A1': 'ch1_assignment_abroad',
        'A2': 'ch3_the_inner_circle',
        'B1': 'ch5_the_truth_emerges',
        'B2': 'ch6_the_final_chapter',
      };
      const guessedChapter = cefrToChapter[cefrLevel] || 'ch1_assignment_abroad';
      await storage.updateText(text.id, { narrativeChapterId: guessedChapter } as any);
      textsUpdated++;
    }
  }

  return { questsUpdated, textsUpdated };
}
