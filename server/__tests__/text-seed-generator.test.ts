import { describe, it, expect, vi } from 'vitest';
import { buildSeedTexts, seedTextsForWorld, buildTextGenerationPrompt } from '../services/text-seed-generator';
import type { InsertGameText, CefrLevel, TextCategory } from '../../shared/schema';

describe('buildSeedTexts', () => {
  const options = {
    worldId: '69bba18ce2e6d5c1cb3c7a9f',
    targetLanguage: 'French',
    writerName: 'Jean-Luc Moreau',
  };

  const texts = buildSeedTexts(options);

  it('generates 20 texts total', () => {
    expect(texts).toHaveLength(20);
  });

  // ── Category distribution ──────────────────────────────────────────────────

  it('generates 5 writer journal entries', () => {
    const journals = texts.filter(
      (t) => t.textCategory === 'journal' && t.tags?.includes('missing_writer'),
    );
    expect(journals).toHaveLength(5);
  });

  it('generates 3 fiction books', () => {
    const fiction = texts.filter(
      (t) => t.textCategory === 'book' && t.tags?.includes('fiction'),
    );
    expect(fiction).toHaveLength(3);
  });

  it('generates 3 non-fiction books', () => {
    const nonFiction = texts.filter(
      (t) => t.textCategory === 'book' && t.tags?.includes('non_fiction'),
    );
    expect(nonFiction).toHaveLength(3);
  });

  it('generates 3 letters', () => {
    const letters = texts.filter((t) => t.textCategory === 'letter');
    expect(letters).toHaveLength(3);
  });

  it('generates 3 recipes', () => {
    const recipes = texts.filter((t) => t.textCategory === 'recipe');
    expect(recipes).toHaveLength(3);
  });

  it('generates 3 poems (books with poem tag)', () => {
    const poems = texts.filter(
      (t) => t.textCategory === 'book' && t.tags?.includes('poem'),
    );
    expect(poems).toHaveLength(3);
  });

  // ── CEFR distribution: 8×A1, 6×A2, 4×B1, 2×B2 ───────────────────────────

  it('has correct CEFR distribution (8 A1, 6 A2, 4 B1, 2 B2)', () => {
    const counts: Record<string, number> = {};
    for (const t of texts) {
      counts[t.cefrLevel] = (counts[t.cefrLevel] || 0) + 1;
    }
    expect(counts['A1']).toBe(8);
    expect(counts['A2']).toBe(6);
    expect(counts['B1']).toBe(4);
    expect(counts['B2']).toBe(2);
  });

  // ── Common fields ─────────────────────────────────────────────────────────

  it('assigns the correct worldId to all texts', () => {
    for (const text of texts) {
      expect(text.worldId).toBe('69bba18ce2e6d5c1cb3c7a9f');
    }
  });

  it('assigns the correct targetLanguage to all texts', () => {
    for (const text of texts) {
      expect(text.targetLanguage).toBe('French');
    }
  });

  it('sets status to published for all texts', () => {
    for (const text of texts) {
      expect(text.status).toBe('published');
    }
  });

  it('sets isGenerated to true for all texts', () => {
    for (const text of texts) {
      expect(text.isGenerated).toBe(true);
    }
  });

  // ── Missing writer clue progression ────────────────────────────────────────

  it('missing writer texts have clueText', () => {
    const writerTexts = texts.filter((t) => t.tags?.includes('missing_writer'));
    expect(writerTexts).toHaveLength(5);
    for (const t of writerTexts) {
      expect(t.clueText).toBeTruthy();
    }
  });

  it('missing writer texts use the writerName as authorName', () => {
    const writerTexts = texts.filter((t) => t.tags?.includes('missing_writer'));
    for (const t of writerTexts) {
      expect(t.authorName).toBe('Jean-Luc Moreau');
    }
  });

  it('missing writer texts have progressive clue tags (clue_1 through clue_5)', () => {
    const writerTexts = texts.filter((t) => t.tags?.includes('missing_writer'));
    for (let i = 1; i <= 5; i++) {
      const found = writerTexts.some((t) => t.tags?.includes(`clue_${i}`));
      expect(found).toBe(true);
    }
  });

  it('uses custom writer name when provided', () => {
    const customTexts = buildSeedTexts({ ...options, writerName: 'Marie Fontaine' });
    const writerTexts = customTexts.filter((t) => t.tags?.includes('missing_writer'));
    for (const t of writerTexts) {
      expect(t.authorName).toBe('Marie Fontaine');
    }
  });

  // ── Content quality ────────────────────────────────────────────────────────

  it('every text has at least one page', () => {
    for (const text of texts) {
      expect(text.pages.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('pages have both content and contentTranslation', () => {
    for (const text of texts) {
      for (const page of text.pages) {
        expect(page.content).toBeTruthy();
        expect(page.contentTranslation).toBeTruthy();
      }
    }
  });

  it('every text has 3-5 vocabulary highlights', () => {
    for (const text of texts) {
      expect(text.vocabularyHighlights.length).toBeGreaterThanOrEqual(3);
      expect(text.vocabularyHighlights.length).toBeLessThanOrEqual(5);
    }
  });

  it('vocabulary highlights have word, translation, and partOfSpeech', () => {
    for (const text of texts) {
      for (const v of text.vocabularyHighlights) {
        expect(v.word).toBeTruthy();
        expect(v.translation).toBeTruthy();
        expect(v.partOfSpeech).toBeTruthy();
      }
    }
  });

  it('every text has 2-3 comprehension questions', () => {
    for (const text of texts) {
      expect(text.comprehensionQuestions.length).toBeGreaterThanOrEqual(2);
      expect(text.comprehensionQuestions.length).toBeLessThanOrEqual(3);
    }
  });

  it('comprehension questions have valid correctIndex', () => {
    for (const text of texts) {
      for (const q of text.comprehensionQuestions) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    }
  });

  it('every text has a spawnLocationHint', () => {
    for (const text of texts) {
      expect(text.spawnLocationHint).toBeTruthy();
    }
  });

  it('difficulty matches CEFR level', () => {
    for (const text of texts) {
      if (text.cefrLevel === 'A1' || text.cefrLevel === 'A2') {
        expect(text.difficulty).toBe('beginner');
      } else if (text.cefrLevel === 'B1') {
        expect(text.difficulty).toBe('intermediate');
      } else if (text.cefrLevel === 'B2') {
        expect(text.difficulty).toBe('advanced');
      }
    }
  });

  // ── Louisiana/Chitimacha themes ────────────────────────────────────────────

  it('includes texts with chitimacha-related tags', () => {
    const chitimacha = texts.filter((t) => t.tags?.includes('chitimacha'));
    expect(chitimacha.length).toBeGreaterThanOrEqual(3);
  });

  it('includes texts with louisiana-related tags', () => {
    const louisiana = texts.filter((t) => t.tags?.includes('louisiana'));
    expect(louisiana.length).toBeGreaterThanOrEqual(2);
  });

  // ── Generation prompt ──────────────────────────────────────────────────────

  it('every text has a generationPrompt', () => {
    for (const text of texts) {
      expect(text.generationPrompt).toBeTruthy();
    }
  });
});

describe('buildTextGenerationPrompt', () => {
  it('includes target language and CEFR level', () => {
    const prompt = buildTextGenerationPrompt({
      targetLanguage: 'French',
      cefrLevel: 'A1',
      textCategory: 'book',
    });
    expect(prompt).toContain('French');
    expect(prompt).toContain('A1');
  });

  it('includes CEFR constraints for each level', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2'] as CefrLevel[]) {
      const prompt = buildTextGenerationPrompt({
        targetLanguage: 'French',
        cefrLevel: level,
        textCategory: 'book',
      });
      expect(prompt).toContain(`CEFR CONSTRAINTS (${level})`);
    }
  });

  it('includes writer character instructions when writerName is provided', () => {
    const prompt = buildTextGenerationPrompt({
      targetLanguage: 'French',
      cefrLevel: 'B1',
      textCategory: 'journal',
      writerName: 'Jean-Luc Moreau',
    });
    expect(prompt).toContain('Jean-Luc Moreau');
    expect(prompt).toContain('WRITER CHARACTER');
  });

  it('includes clue embedding instructions when clue is provided', () => {
    const prompt = buildTextGenerationPrompt({
      targetLanguage: 'French',
      cefrLevel: 'A2',
      textCategory: 'journal',
      clueToEmbed: 'The writer hid documents in the cabin',
    });
    expect(prompt).toContain('CLUE EMBEDDING');
    expect(prompt).toContain('The writer hid documents in the cabin');
  });

  it('includes world context when provided', () => {
    const prompt = buildTextGenerationPrompt({
      targetLanguage: 'French',
      cefrLevel: 'A1',
      textCategory: 'book',
      settlementName: 'Bayou Bleu',
      characterNames: ['Antoine', 'Marie'],
      locationNames: ['Le Café du Bayou', 'La Bibliothèque'],
    });
    expect(prompt).toContain('Bayou Bleu');
    expect(prompt).toContain('Antoine');
    expect(prompt).toContain('Le Café du Bayou');
  });

  it('includes Louisiana/Chitimacha cultural context', () => {
    const prompt = buildTextGenerationPrompt({
      targetLanguage: 'French',
      cefrLevel: 'A1',
      textCategory: 'recipe',
    });
    expect(prompt).toContain('Louisiana Creole');
    expect(prompt).toContain('Chitimacha');
  });

  it('specifies JSON output format with required fields', () => {
    const prompt = buildTextGenerationPrompt({
      targetLanguage: 'French',
      cefrLevel: 'A1',
      textCategory: 'book',
    });
    expect(prompt).toContain('OUTPUT FORMAT (JSON)');
    expect(prompt).toContain('vocabularyHighlights');
    expect(prompt).toContain('comprehensionQuestions');
    expect(prompt).toContain('contentTranslation');
  });
});

describe('seedTextsForWorld', () => {
  it('creates all texts when none exist', async () => {
    const created: InsertGameText[] = [];
    const mockStorage = {
      getGameTextsByWorld: vi.fn().mockResolvedValue([]),
      createGameText: vi.fn().mockImplementation((text: InsertGameText) => {
        created.push(text);
        return Promise.resolve({ ...text, id: `text-${created.length}` });
      }),
    };

    const result = await seedTextsForWorld(mockStorage, {
      worldId: '69bba18ce2e6d5c1cb3c7a9f',
      targetLanguage: 'French',
    });

    expect(result.created).toBe(20);
    expect(result.skipped).toBe(false);
    expect(mockStorage.createGameText).toHaveBeenCalledTimes(20);
  });

  it('skips seeding when texts already exist', async () => {
    const mockStorage = {
      getGameTextsByWorld: vi.fn().mockResolvedValue([{ id: 'existing-text' }]),
      createGameText: vi.fn(),
    };

    const result = await seedTextsForWorld(mockStorage, {
      worldId: '69bba18ce2e6d5c1cb3c7a9f',
      targetLanguage: 'French',
    });

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(true);
    expect(mockStorage.createGameText).not.toHaveBeenCalled();
  });
});
