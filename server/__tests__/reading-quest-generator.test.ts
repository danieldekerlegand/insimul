import { describe, it, expect } from 'vitest';
import { generateReadingQuests, getReadingQuestClue } from '../../shared/quests/reading-quest-generator.js';
import type { Character, Text, World, InsertQuest } from '../../shared/schema';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeWorld(overrides: Partial<World> = {}): World {
  return {
    id: 'world-1',
    name: 'Test Village',
    description: 'A test world',
    targetLanguage: 'French',
    worldType: 'village',
    gameType: 'language-learning',
    ...overrides,
  } as World;
}

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: `npc-${Math.random().toString(36).slice(2, 8)}`,
    firstName: 'Marie',
    lastName: 'Dupont',
    status: 'active',
    occupation: 'teacher',
    ...overrides,
  } as Character;
}

function makeText(overrides: Partial<Text> = {}): Text {
  return {
    id: `text-${Math.random().toString(36).slice(2, 8)}`,
    worldId: 'world-1',
    title: 'Le Petit Prince',
    titleTranslation: 'The Little Prince',
    textCategory: 'book',
    cefrLevel: 'A2',
    targetLanguage: 'French',
    status: 'published',
    difficulty: 'intermediate',
    pages: [
      { content: 'Page un', contentTranslation: 'Page one' },
      { content: 'Page deux', contentTranslation: 'Page two' },
    ],
    comprehensionQuestions: [
      { question: 'Qui est le personnage principal?', questionTranslation: 'Who is the main character?', options: ['Le prince', 'Le roi', 'Le renard'], correctIndex: 0 },
      { question: 'Où habite le prince?', questionTranslation: 'Where does the prince live?', options: ['Sur la Terre', 'Sur un astéroïde', 'Dans un château'], correctIndex: 1 },
      { question: 'Qui est son ami?', questionTranslation: 'Who is his friend?', options: ['Le serpent', 'Le renard', 'Le mouton'], correctIndex: 1 },
    ],
    vocabularyHighlights: [],
    clueText: null,
    spawnLocationHint: 'library',
    authorName: 'Antoine',
    isGenerated: false,
    generationPrompt: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Text;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('generateReadingQuests', () => {
  it('generates quests from published texts with comprehension questions', () => {
    const world = makeWorld();
    const characters = [makeCharacter()];
    const texts = [makeText()];

    const quests = generateReadingQuests({ world, characters, texts });

    expect(quests).toHaveLength(1);
    const quest = quests[0];
    expect(quest.questType).toBe('reading');
    expect(quest.worldId).toBe('world-1');
    expect(quest.targetLanguage).toBe('French');
    expect(quest.status).toBe('available');
  });

  it('creates three ordered objectives: find_text, read_text, comprehension_quiz', () => {
    const quests = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter()],
      texts: [makeText({ id: 'text-1', title: 'Mon Livre' })],
    });

    const objectives = quests[0].objectives as any[];
    expect(objectives).toHaveLength(3);
    expect(objectives[0].type).toBe('find_text');
    expect(objectives[0].itemName).toBe('Mon Livre');
    expect(objectives[1].type).toBe('read_text');
    expect(objectives[1].textId).toBe('text-1');
    expect(objectives[1].dependsOn).toEqual(['obj_find']);
    expect(objectives[2].type).toBe('comprehension_quiz');
    expect(objectives[2].dependsOn).toEqual(['obj_read']);
  });

  it('sets XP rewards based on CEFR level', () => {
    const world = makeWorld();
    const characters = [makeCharacter()];

    const a1Quest = generateReadingQuests({
      world, characters,
      texts: [makeText({ cefrLevel: 'A1' })],
    })[0];
    expect(a1Quest.experienceReward).toBe(20);

    const a2Quest = generateReadingQuests({
      world, characters,
      texts: [makeText({ cefrLevel: 'A2' })],
    })[0];
    expect(a2Quest.experienceReward).toBe(35);

    const b1Quest = generateReadingQuests({
      world, characters,
      texts: [makeText({ cefrLevel: 'B1' })],
    })[0];
    expect(b1Quest.experienceReward).toBe(50);

    const b2Quest = generateReadingQuests({
      world, characters,
      texts: [makeText({ cefrLevel: 'B2' })],
    })[0];
    expect(b2Quest.experienceReward).toBe(75);
  });

  it('filters out unpublished texts and texts without comprehension questions', () => {
    const quests = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter()],
      texts: [
        makeText({ status: 'draft' }),
        makeText({ comprehensionQuestions: [] }),
        makeText({ comprehensionQuestions: null as any }),
        makeText({ id: 'valid', status: 'published', title: 'Valid Text' }),
      ],
    });

    expect(quests).toHaveLength(1);
    expect(quests[0].title).toContain('Valid Text');
  });

  it('returns empty array when no eligible texts exist', () => {
    const quests = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter()],
      texts: [],
    });

    expect(quests).toHaveLength(0);
  });

  it('prefers teacher/librarian/scholar NPCs as quest givers', () => {
    const teacher = makeCharacter({ id: 'teacher-1', firstName: 'Prof', lastName: 'Smith', occupation: 'teacher' });
    const merchant = makeCharacter({ id: 'merchant-1', firstName: 'Shop', lastName: 'Keep', occupation: 'merchant' });

    const quests = generateReadingQuests({
      world: makeWorld(),
      characters: [teacher, merchant],
      texts: [makeText()],
    });

    expect(quests[0].assignedBy).toBe('Prof Smith');
    expect(quests[0].assignedByCharacterId).toBe('teacher-1');
  });

  it('falls back to any active NPC when no reading-profession NPCs exist', () => {
    const quests = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter({ occupation: 'farmer', firstName: 'Bob', lastName: 'Farmer' })],
      texts: [makeText()],
    });

    expect(quests[0].assignedBy).toBe('Bob Farmer');
  });

  it('limits to maxQuests when specified', () => {
    const texts = Array.from({ length: 10 }, (_, i) =>
      makeText({ id: `text-${i}`, title: `Book ${i}` }),
    );

    const quests = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter()],
      texts,
      maxQuests: 3,
    });

    expect(quests.length).toBeLessThanOrEqual(3);
  });

  it('generates up to 8 quests by default', () => {
    const texts = Array.from({ length: 15 }, (_, i) =>
      makeText({ id: `text-${i}`, title: `Book ${i}` }),
    );

    const quests = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter()],
      texts,
    });

    expect(quests.length).toBeLessThanOrEqual(8);
    expect(quests.length).toBeGreaterThanOrEqual(5);
  });

  it('tags quests with main-quest-clue when text has clueText', () => {
    const quests = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter()],
      texts: [makeText({ id: 'clue-text', clueText: 'The secret is hidden in the bayou' })],
    });

    expect(quests[0].tags).toContain('main-quest-clue');
    expect(quests[0].relatedTruthIds).toEqual(['clue-text']);
  });

  it('sets comprehension quiz pass threshold from CEFR level', () => {
    const quests = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter()],
      texts: [makeText({ cefrLevel: 'A1' })],
    });

    const quizObj = (quests[0].objectives as any[])[2];
    expect(quizObj.quizPassThreshold).toBe(2);
    expect(quizObj.requiredCount).toBe(2);
    expect(quizObj.quizQuestions).toHaveLength(3);
  });

  it('sets difficulty from CEFR level', () => {
    const a1 = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter()],
      texts: [makeText({ cefrLevel: 'A1' })],
    })[0];
    expect(a1.difficulty).toBe('beginner');

    const b2 = generateReadingQuests({
      world: makeWorld(),
      characters: [makeCharacter()],
      texts: [makeText({ cefrLevel: 'B2' })],
    })[0];
    expect(b2.difficulty).toBe('advanced');
  });
});

describe('getReadingQuestClue', () => {
  it('returns clue when quest has main-quest-clue tag and matching text', () => {
    const quest = {
      tags: ['reading', 'main-quest-clue'],
      relatedTruthIds: ['text-clue'],
      objectives: [],
    };
    const texts = [makeText({ id: 'text-clue', title: 'Secret Book', clueText: 'The answer lies within', authorName: 'Elder' })];

    const result = getReadingQuestClue(quest, texts);
    expect(result).toEqual({
      title: 'Secret Book',
      clueText: 'The answer lies within',
      authorName: 'Elder',
    });
  });

  it('returns null when quest has no main-quest-clue tag', () => {
    const result = getReadingQuestClue(
      { tags: ['reading'], relatedTruthIds: ['text-1'], objectives: [] },
      [makeText({ id: 'text-1', clueText: 'hidden' })],
    );
    expect(result).toBeNull();
  });

  it('returns null when text has no clueText', () => {
    const result = getReadingQuestClue(
      { tags: ['main-quest-clue'], relatedTruthIds: ['text-1'], objectives: [] },
      [makeText({ id: 'text-1', clueText: null })],
    );
    expect(result).toBeNull();
  });

  it('returns null when text not found', () => {
    const result = getReadingQuestClue(
      { tags: ['main-quest-clue'], relatedTruthIds: ['nonexistent'], objectives: [] },
      [makeText({ id: 'text-1' })],
    );
    expect(result).toBeNull();
  });
});
