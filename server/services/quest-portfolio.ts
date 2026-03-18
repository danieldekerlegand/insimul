/**
 * Quest Portfolio & Learning Journal Service
 *
 * Compiles a portfolio of completed quests and generates learning journal
 * entries from quest completion history.
 */

import { storage } from '../db/storage.js';
import type { Quest } from '../../shared/schema.js';
import type {
  PortfolioEntry,
  PortfolioSummary,
  LearningJournalEntry,
  PortfolioData,
} from '../../shared/quest/portfolio-types.js';

const DIFFICULTY_ORDER = ['beginner', 'intermediate', 'advanced'];

function difficultyRank(d: string): number {
  const idx = DIFFICULTY_ORDER.indexOf(d);
  return idx >= 0 ? idx : -1;
}

/** Build a PortfolioEntry from a completed quest */
function questToPortfolioEntry(quest: Quest): PortfolioEntry {
  const skillsGained: string[] = [];
  if (Array.isArray(quest.skillRewards)) {
    for (const sr of quest.skillRewards as Array<{ name?: string }>) {
      if (sr.name) skillsGained.push(sr.name);
    }
  }

  return {
    questId: quest.id,
    title: quest.title,
    questType: quest.questType,
    difficulty: quest.difficulty,
    cefrLevel: quest.cefrLevel ?? null,
    completedAt: quest.completedAt ? new Date(quest.completedAt).toISOString() : new Date().toISOString(),
    xpEarned: quest.experienceReward ?? 0,
    streakAtCompletion: quest.streakCount ?? 0,
    skillsGained,
    assignedBy: quest.assignedBy ?? null,
    questChainId: quest.questChainId ?? null,
    tags: (quest.tags as string[]) ?? [],
  };
}

/** Build aggregated portfolio summary from completed quests */
export function buildPortfolioSummary(completedQuests: Quest[]): PortfolioSummary {
  const byType: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  const questGivers = new Set<string>();
  const completedChains = new Set<string>();
  let totalXP = 0;
  let longestStreak = 0;
  let currentStreak = 0;

  for (const q of completedQuests) {
    byType[q.questType] = (byType[q.questType] ?? 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1;
    totalXP += q.experienceReward ?? 0;

    const streak = q.streakCount ?? 0;
    if (streak > longestStreak) longestStreak = streak;

    if (q.assignedBy) questGivers.add(q.assignedBy);
    if (q.questChainId) completedChains.add(q.questChainId);
  }

  // Current streak = streak of the most recently completed quest
  if (completedQuests.length > 0) {
    const sorted = [...completedQuests].sort((a, b) => {
      const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return tb - ta;
    });
    currentStreak = sorted[0].streakCount ?? 0;
  }

  return {
    totalCompleted: completedQuests.length,
    totalXP,
    longestStreak,
    currentStreak,
    byType,
    byDifficulty,
    uniqueQuestGivers: questGivers.size,
    chainsCompleted: completedChains.size,
  };
}

/** Group completed quests by day and build learning journal entries */
export function buildLearningJournal(completedQuests: Quest[]): LearningJournalEntry[] {
  const byDate = new Map<string, Quest[]>();

  for (const q of completedQuests) {
    const ts = q.completedAt ? new Date(q.completedAt) : null;
    if (!ts) continue;
    const dateKey = ts.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(q);
  }

  const entries: LearningJournalEntry[] = [];

  for (const [date, quests] of Array.from(byDate.entries())) {
    const skillsPracticed = Array.from(new Set(quests.map(q => q.questType)));
    let highestDifficulty = 'beginner';
    let maxStreak = 0;
    let xpEarned = 0;
    let cefrLevel: string | null = null;

    for (const q of quests) {
      xpEarned += q.experienceReward ?? 0;
      if (difficultyRank(q.difficulty) > difficultyRank(highestDifficulty)) {
        highestDifficulty = q.difficulty;
      }
      if ((q.streakCount ?? 0) > maxStreak) maxStreak = q.streakCount ?? 0;
      if (q.cefrLevel) cefrLevel = q.cefrLevel;
    }

    entries.push({
      date,
      questsCompleted: quests.length,
      xpEarned,
      skillsPracticed,
      highestDifficulty,
      cefrLevel,
      streakCount: maxStreak,
    });
  }

  // Sort by date descending (most recent first)
  entries.sort((a, b) => b.date.localeCompare(a.date));
  return entries;
}

/** Fetch portfolio data for a player in a world */
export async function getPlayerPortfolio(
  worldId: string,
  playerName: string,
): Promise<PortfolioData> {
  const allQuests = await storage.getQuestsByWorld(worldId);
  const playerCompleted = allQuests.filter(
    q => q.assignedTo === playerName && q.status === 'completed',
  );

  // Sort by completion date descending
  playerCompleted.sort((a, b) => {
    const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return tb - ta;
  });

  return {
    summary: buildPortfolioSummary(playerCompleted),
    entries: playerCompleted.map(questToPortfolioEntry),
    journal: buildLearningJournal(playerCompleted),
  };
}
