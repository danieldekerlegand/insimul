/**
 * Main Quest Chapters
 *
 * Defines the main storyline as CEFR-gated chapters. Each chapter contains
 * a sequence of quest objectives that advance the story. Players must reach
 * the required CEFR level before a chapter unlocks.
 */

import type { CEFRLevel } from '../assessment/cefr-mapping';

export interface MainQuestObjective {
  id: string;
  title: string;
  description: string;
  /** Quest type to match against (vocabulary, conversation, grammar, etc.) */
  questType: string;
  /** Number of quests of this type to complete */
  requiredCount: number;
  /** Optional: specific quest chain template ID that satisfies this objective */
  chainTemplateId?: string;
}

export interface MainQuestChapter {
  id: string;
  number: number;
  title: string;
  description: string;
  /** CEFR level required to unlock this chapter */
  requiredCefrLevel: CEFRLevel;
  /** Objectives that must be completed to finish this chapter */
  objectives: MainQuestObjective[];
  /** XP bonus for completing the entire chapter */
  completionBonusXP: number;
  /** Narrative text shown when the chapter begins */
  introNarrative: string;
  /** Narrative text shown when the chapter is completed */
  outroNarrative: string;
}

export interface ChapterProgress {
  chapterId: string;
  status: 'locked' | 'available' | 'active' | 'completed';
  objectiveProgress: Record<string, number>;
  startedAt?: string;
  completedAt?: string;
}

export interface MainQuestState {
  currentChapterId: string | null;
  chapters: ChapterProgress[];
  totalXPEarned: number;
}

/** All main quest chapters, ordered by progression */
export const MAIN_QUEST_CHAPTERS: MainQuestChapter[] = [
  {
    id: 'ch1_arrival',
    number: 1,
    title: 'Arrival',
    description: 'You arrive in a new land where few speak your tongue. Learn the basics to survive.',
    requiredCefrLevel: 'A1',
    objectives: [
      {
        id: 'ch1_greetings',
        title: 'Learn to Greet',
        description: 'Complete greeting quests to introduce yourself to the locals.',
        questType: 'vocabulary',
        requiredCount: 2,
        chainTemplateId: 'first-words',
      },
      {
        id: 'ch1_conversations',
        title: 'First Conversations',
        description: 'Have your first real conversations with townspeople.',
        questType: 'conversation',
        requiredCount: 3,
      },
    ],
    completionBonusXP: 300,
    introNarrative: 'You step off the boat into an unfamiliar port. The sounds of a new language fill the air. Your journey begins here.',
    outroNarrative: 'The townspeople nod as you greet them. You have taken your first steps in this new world.',
  },
  {
    id: 'ch2_settling_in',
    number: 2,
    title: 'Settling In',
    description: 'Make yourself at home. Learn to navigate the town and handle daily errands.',
    requiredCefrLevel: 'A1',
    objectives: [
      {
        id: 'ch2_navigation',
        title: 'Learn Your Way',
        description: 'Complete navigation-related quests to learn the layout of town.',
        questType: 'vocabulary',
        requiredCount: 2,
        chainTemplateId: 'town-explorer',
      },
      {
        id: 'ch2_shopping',
        title: 'Market Trips',
        description: 'Successfully complete purchases at the market.',
        questType: 'conversation',
        requiredCount: 2,
        chainTemplateId: 'market-day',
      },
      {
        id: 'ch2_grammar',
        title: 'Getting the Grammar',
        description: 'Complete grammar-focused quests to improve your sentence structure.',
        questType: 'grammar',
        requiredCount: 2,
      },
    ],
    completionBonusXP: 500,
    introNarrative: 'The port town is starting to feel familiar. Time to explore further and make this place your own.',
    outroNarrative: 'You can navigate the market, ask for directions, and hold basic conversations. This town is starting to feel like home.',
  },
  {
    id: 'ch3_making_friends',
    number: 3,
    title: 'Making Friends',
    description: 'Deepen your connections. Engage in more complex conversations and earn trust.',
    requiredCefrLevel: 'A2',
    objectives: [
      {
        id: 'ch3_deep_conversations',
        title: 'Deeper Connections',
        description: 'Have extended conversations with NPCs about their lives.',
        questType: 'conversation',
        requiredCount: 5,
      },
      {
        id: 'ch3_vocabulary',
        title: 'Expanding Vocabulary',
        description: 'Learn and use new vocabulary across multiple categories.',
        questType: 'vocabulary',
        requiredCount: 4,
      },
      {
        id: 'ch3_quests_for_npcs',
        title: 'Helping Hands',
        description: 'Complete quests given by NPCs to build rapport.',
        questType: 'fetch',
        requiredCount: 3,
      },
    ],
    completionBonusXP: 750,
    introNarrative: 'The locals are warming up to you, but deeper friendships require deeper conversations. Time to truly connect.',
    outroNarrative: 'The townspeople consider you one of their own. Your words carry weight here now.',
  },
  {
    id: 'ch4_the_wider_world',
    number: 4,
    title: 'The Wider World',
    description: 'Your reputation opens new doors. Travel beyond the town and face new challenges.',
    requiredCefrLevel: 'A2',
    objectives: [
      {
        id: 'ch4_travel',
        title: 'Beyond the Town',
        description: 'Visit new settlements and navigate unfamiliar territory.',
        questType: 'conversation',
        requiredCount: 4,
      },
      {
        id: 'ch4_cultural',
        title: 'Cultural Exchange',
        description: 'Participate in cultural events and learn traditions.',
        questType: 'vocabulary',
        requiredCount: 3,
      },
      {
        id: 'ch4_translation',
        title: 'Bridge Between Worlds',
        description: 'Help translate for others who need assistance.',
        questType: 'grammar',
        requiredCount: 3,
      },
    ],
    completionBonusXP: 1000,
    introNarrative: 'Word of your skills has spread. Travelers and merchants seek you out. The world beyond the town walls awaits.',
    outroNarrative: 'You move between towns with ease, a bridge between cultures. Your journey is far from over.',
  },
  {
    id: 'ch5_the_scholar',
    number: 5,
    title: 'The Scholar',
    description: 'Master the language. Engage with scholars, debate ideas, and become a teacher yourself.',
    requiredCefrLevel: 'B1',
    objectives: [
      {
        id: 'ch5_debates',
        title: 'Scholarly Debates',
        description: 'Engage in debates and discussions with educated NPCs.',
        questType: 'conversation',
        requiredCount: 5,
      },
      {
        id: 'ch5_advanced_grammar',
        title: 'Mastering Grammar',
        description: 'Complete advanced grammar challenges.',
        questType: 'grammar',
        requiredCount: 4,
      },
      {
        id: 'ch5_teaching',
        title: 'Passing It On',
        description: 'Help newcomers learn the basics of the language.',
        questType: 'conversation',
        requiredCount: 3,
      },
    ],
    completionBonusXP: 1500,
    introNarrative: 'The scholars have taken notice of your progress. They invite you to the university district for greater challenges.',
    outroNarrative: 'You speak with confidence and nuance. The scholars call you one of their own.',
  },
  {
    id: 'ch6_fluent_citizen',
    number: 6,
    title: 'Fluent Citizen',
    description: 'You are now a respected member of this world. Use your mastery for the greater good.',
    requiredCefrLevel: 'B2',
    objectives: [
      {
        id: 'ch6_leadership',
        title: 'Community Leader',
        description: 'Take on leadership roles that require advanced communication.',
        questType: 'conversation',
        requiredCount: 5,
      },
      {
        id: 'ch6_mastery',
        title: 'Language Mastery',
        description: 'Demonstrate mastery across all skill areas.',
        questType: 'vocabulary',
        requiredCount: 5,
      },
    ],
    completionBonusXP: 2000,
    introNarrative: 'You have come so far. The people look to you as a leader and a bridge between worlds. One final chapter awaits.',
    outroNarrative: 'You have achieved true fluency. This world is yours, and your story will be told for generations.',
  },
];

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

function cefrRank(level: CEFRLevel): number {
  return CEFR_ORDER.indexOf(level);
}

/** Check if a CEFR level meets the requirement for a chapter */
export function meetsChapterCefrRequirement(
  playerLevel: CEFRLevel | null | undefined,
  chapter: MainQuestChapter,
): boolean {
  if (!playerLevel) return chapter.requiredCefrLevel === 'A1';
  return cefrRank(playerLevel) >= cefrRank(chapter.requiredCefrLevel);
}

/** Get a chapter by ID */
export function getChapterById(chapterId: string): MainQuestChapter | undefined {
  return MAIN_QUEST_CHAPTERS.find(ch => ch.id === chapterId);
}

/** Create initial main quest state — chapter 1 is available */
export function createInitialMainQuestState(): MainQuestState {
  return {
    currentChapterId: 'ch1_arrival',
    chapters: MAIN_QUEST_CHAPTERS.map((ch, index) => ({
      chapterId: ch.id,
      status: index === 0 ? 'active' : 'locked',
      objectiveProgress: Object.fromEntries(ch.objectives.map(obj => [obj.id, 0])),
    })),
    totalXPEarned: 0,
  };
}

/** Calculate completion percentage for a chapter */
export function getChapterCompletionPercent(
  chapter: MainQuestChapter,
  progress: ChapterProgress,
): number {
  let totalRequired = 0;
  let totalDone = 0;
  for (const obj of chapter.objectives) {
    totalRequired += obj.requiredCount;
    totalDone += Math.min(progress.objectiveProgress[obj.id] ?? 0, obj.requiredCount);
  }
  return totalRequired > 0 ? Math.round((totalDone / totalRequired) * 100) : 0;
}

/** Check if all objectives in a chapter are completed */
export function isChapterComplete(
  chapter: MainQuestChapter,
  progress: ChapterProgress,
): boolean {
  return chapter.objectives.every(
    obj => (progress.objectiveProgress[obj.id] ?? 0) >= obj.requiredCount,
  );
}
