/**
 * Reading Quest Generator
 *
 * Generates quests that require players to find a book, read its text,
 * and answer comprehension questions to prove understanding.
 *
 * Each reading quest has three ordered objectives:
 *   1. find_text — locate and collect the book
 *   2. read_text — read all pages of the text
 *   3. comprehension_quiz — answer N/M comprehension questions correctly
 *
 * NPCs who are teachers, librarians, or scholars are preferred quest givers.
 * Completing a quest about a main-quest text also reveals its embedded clue.
 */

import type { Character, GameText, World, InsertQuest } from '../schema.js';
import { convertQuestToProlog } from '../prolog/quest-converter.js';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ReadingQuestOptions {
  world: World;
  characters: Character[];
  texts: GameText[];
  assignedTo?: string;
  maxQuests?: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

/** XP rewards scaled by CEFR difficulty level. */
const XP_BY_CEFR: Record<string, number> = {
  A1: 20,
  A2: 35,
  B1: 50,
  B2: 75,
};

/** Minimum comprehension questions correct to pass, by CEFR level. */
const PASS_THRESHOLD: Record<string, number> = {
  A1: 2,
  A2: 2,
  B1: 3,
  B2: 3,
};

/** Occupations that naturally assign reading quests. */
const READING_NPC_OCCUPATIONS = new Set([
  'teacher', 'librarian', 'scholar', 'professor', 'tutor',
  'priest', 'scribe', 'historian', 'academic', 'instructor',
]);

/** Dialogue hooks for NPC quest assignment. */
const DIALOGUE_TEMPLATES = [
  `Have you read "{title}"? I'd love to discuss it with you.`,
  `There's a wonderful text called "{title}" — you should read it and tell me what you think.`,
  `I recommend reading "{title}". Come back when you've understood it and we'll talk.`,
  `"{title}" is essential reading. Find a copy, read it carefully, and answer a few questions for me.`,
  `A well-read person should know "{title}". Go find it and prove you've read it.`,
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function charName(c: Character): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

function obj(id: string, type: string, description: string, extra: Record<string, any> = {}) {
  return {
    id, type, description,
    requiredCount: 1, currentCount: 0, completed: false,
    ...extra,
  };
}

function findReadingNPCs(characters: Character[]): Character[] {
  const active = characters.filter(c => c.status === 'active');
  const readers = active.filter(c =>
    c.occupation && READING_NPC_OCCUPATIONS.has(c.occupation.toLowerCase()),
  );
  return readers.length > 0 ? readers : active;
}

function cefrToDifficulty(cefr: string): 'beginner' | 'intermediate' | 'advanced' {
  switch (cefr) {
    case 'A1': return 'beginner';
    case 'A2': return 'intermediate';
    case 'B1': return 'intermediate';
    case 'B2': return 'advanced';
    case 'C1': return 'advanced';
    case 'C2': return 'advanced';
    default: return 'beginner';
  }
}

// ── Generator ────────────────────────────────────────────────────────────────

/**
 * Generate reading quests from published texts with comprehension questions.
 * Produces 5-8 quests (one per major text), limited by available texts.
 */
export function generateReadingQuests(options: ReadingQuestOptions): InsertQuest[] {
  const {
    world,
    characters,
    texts,
    assignedTo = 'Player',
    maxQuests,
  } = options;

  const targetLanguage = world.targetLanguage || 'English';
  const npcs = findReadingNPCs(characters);

  // Filter to published texts that have comprehension questions
  const eligible = texts.filter(t =>
    t.status === 'published' &&
    t.comprehensionQuestions &&
    t.comprehensionQuestions.length > 0,
  );

  if (eligible.length === 0) return [];

  // Pick 5-8 texts, prioritizing diversity of CEFR levels
  const target = Math.min(maxQuests ?? 8, Math.max(5, eligible.length), eligible.length);
  const selected = shuffle(eligible).slice(0, target);

  const quests: InsertQuest[] = [];

  for (const text of selected) {
    const cefr = text.cefrLevel || 'A1';
    const xp = XP_BY_CEFR[cefr] ?? 20;
    const totalQuestions = text.comprehensionQuestions!.length;
    const passThreshold = Math.min(
      PASS_THRESHOLD[cefr] ?? 2,
      totalQuestions,
    );
    const giver = npcs.length > 0 ? pick(npcs) : null;
    const dialogue = pick(DIALOGUE_TEMPLATES).replace('{title}', text.title);
    const difficulty = cefrToDifficulty(cefr);

    const objectives = [
      obj('obj_find', 'find_text', `Find the book "${text.title}"`, {
        itemName: text.title,
        textId: text.id,
        order: 1,
      }),
      obj('obj_read', 'read_text', `Read all of "${text.title}"`, {
        textId: text.id,
        order: 2,
        dependsOn: ['obj_find'],
      }),
      obj('obj_quiz', 'comprehension_quiz', `Answer ${passThreshold} out of ${totalQuestions} comprehension questions correctly`, {
        quizQuestions: text.comprehensionQuestions!.map(q => ({
          question: q.question,
          correctAnswer: q.options[q.correctIndex],
          options: q.options,
        })),
        quizPassThreshold: passThreshold,
        requiredCount: passThreshold,
        textId: text.id,
        order: 3,
        dependsOn: ['obj_read'],
      }),
    ];

    const quest: InsertQuest = {
      worldId: world.id,
      title: `Read & Understand: ${text.title}`,
      description: `${dialogue} Find, read, and prove your understanding of "${text.title}" (${cefr} level).`,
      questType: 'reading',
      difficulty,
      cefrLevel: cefr,
      targetLanguage,
      assignedTo,
      assignedBy: giver ? charName(giver) : null,
      assignedByCharacterId: giver?.id ?? null,
      status: 'available',
      objectives,
      experienceReward: xp,
      rewards: { xp, fluency: Math.round(xp / 5) },
      tags: [
        'seed', 'reading', `difficulty:${difficulty}`, `cefr:${cefr}`,
        ...(text.clueText ? ['main-quest-clue'] : []),
      ],
      // Store text metadata for clue discovery on completion
      relatedTruthIds: text.clueText ? [text.id] : [],
    };

    // Generate Prolog content
    try {
      const result = convertQuestToProlog(quest as any);
      if (result.prologContent) {
        (quest as any).content = result.prologContent;
      }
    } catch {
      // Non-critical
    }

    quests.push(quest);
  }

  return quests;
}

/**
 * Check if a completed reading quest should reveal a clue.
 * Returns the clue text and book title if the quest's text has embedded clue data.
 */
export function getReadingQuestClue(
  quest: { tags?: string[] | null; relatedTruthIds?: string[] | null; objectives?: any[] },
  texts: GameText[],
): { title: string; clueText: string; authorName?: string } | null {
  if (!quest.tags?.includes('main-quest-clue')) return null;

  const textId = quest.relatedTruthIds?.[0];
  if (!textId) return null;

  const text = texts.find(t => t.id === textId);
  if (!text?.clueText) return null;

  return {
    title: text.title,
    clueText: text.clueText,
    authorName: text.authorName ?? undefined,
  };
}
