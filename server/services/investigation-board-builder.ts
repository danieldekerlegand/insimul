/**
 * Investigation Board Builder
 *
 * Builds the investigation board summary from main quest state.
 * Derives clue counts, timeline events, and NPC interview notes
 * from chapter progress and case notes.
 */

import type {
  MainQuestState,
  MainQuestChapter,
  ChapterProgress,
  InvestigationBoardData,
  InvestigationTimelineEvent,
  CaseNote,
} from '../../shared/quest/main-quest-chapters.js';

interface ChapterEntry {
  chapter: MainQuestChapter;
  progress: ChapterProgress;
  completionPercent: number;
  cefrMet: boolean;
}

/**
 * Build the investigation board data from quest state.
 * Derives timeline, evidence counts, NPC notes from progress + case notes.
 */
export function buildInvestigationBoard(
  state: MainQuestState,
  chapters: ChapterEntry[],
  writerNameOverride?: string,
): InvestigationBoardData {
  const caseNotes = state.caseNotes ?? [];

  // Build timeline from chapters
  const timeline: InvestigationTimelineEvent[] = chapters.map(entry => {
    const { chapter, progress } = entry;
    const isCompleted = progress.status === 'completed';
    const isActive = progress.status === 'active';
    return {
      label: `Ch. ${chapter.number}: ${chapter.title}`,
      detail: isCompleted
        ? `Completed${progress.completedAt ? ` on ${new Date(progress.completedAt).toLocaleDateString()}` : ''}`
        : isActive
          ? `In progress — ${entry.completionPercent}%`
          : 'Not yet started',
      completed: isCompleted,
    };
  });

  // Count evidence from case notes
  const evidenceCollected = caseNotes.filter(
    n => n.category === 'text_found' || n.category === 'clue',
  ).length;

  // Extract NPC interviews as key NPCs met
  const npcNotes = caseNotes.filter(n => n.category === 'npc_interview');
  const keyNPCsMet = npcNotes.slice(0, 10).map(n => ({
    name: extractNPCName(n),
    note: n.text,
  }));

  // Count total clues (all completed objectives across chapters)
  let cluesFound = 0;
  for (const entry of chapters) {
    const { chapter, progress } = entry;
    for (const obj of chapter.objectives) {
      const current = progress.objectiveProgress[obj.id] ?? 0;
      cluesFound += Math.min(current, obj.requiredCount);
    }
  }

  const writerName = writerNameOverride || 'The Missing Writer';

  return {
    writerName,
    timeline,
    evidenceCollected,
    keyNPCsMet,
    cluesFound,
  };
}

/** Extract an NPC name from a case note text, or return a default */
function extractNPCName(note: CaseNote): string {
  // Try to extract name from patterns like "Spoke with [Name]" or "Talked to [Name]"
  const match = note.text.match(/(?:Spoke with|Talked to|Interview with|Met)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  return match?.[1] ?? 'Unknown Contact';
}
