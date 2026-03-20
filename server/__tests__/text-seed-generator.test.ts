import { describe, it, expect, vi } from 'vitest';
import { buildSeedTexts, seedTextsForWorld } from '../services/text-seed-generator';
import type { InsertGameText, CefrLevel, TextCategory } from '../../shared/schema';

describe('buildSeedTexts', () => {
  const options = {
    worldId: '69bba18ce2e6d5c1cb3c7a9f',
    targetLanguage: 'French',
    writerName: 'Jean-Luc Moreau',
  };

  it('generates 28 texts total (12 books + 4 journals + 4 letters + 4 flyers + 4 recipes)', () => {
    const texts = buildSeedTexts(options);
    expect(texts).toHaveLength(28);
  });

  it('generates exactly 12 books', () => {
    const texts = buildSeedTexts(options);
    const books = texts.filter((t) => t.textCategory === 'book');
    expect(books).toHaveLength(12);
  });

  it('generates 3 books per CEFR level', () => {
    const texts = buildSeedTexts(options);
    const books = texts.filter((t) => t.textCategory === 'book');
    const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];
    for (const level of levels) {
      const count = books.filter((b) => b.cefrLevel === level).length;
      expect(count).toBe(3);
    }
  });

  it('generates 4 texts of each non-book category', () => {
    const texts = buildSeedTexts(options);
    const categories: TextCategory[] = ['journal', 'letter', 'flyer', 'recipe'];
    for (const cat of categories) {
      const count = texts.filter((t) => t.textCategory === cat).length;
      expect(count).toBe(4);
    }
  });

  it('assigns the correct worldId to all texts', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      expect(text.worldId).toBe('69bba18ce2e6d5c1cb3c7a9f');
    }
  });

  it('assigns the correct targetLanguage to all texts', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      expect(text.targetLanguage).toBe('French');
    }
  });

  it('sets status to published for all texts', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      expect(text.status).toBe('published');
    }
  });

  it('sets isGenerated to true for all texts', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      expect(text.isGenerated).toBe(true);
    }
  });

  it('main quest books have clueText', () => {
    const texts = buildSeedTexts(options);
    const books = texts.filter((t) => t.textCategory === 'book');
    for (const book of books) {
      expect(book.clueText).toBeTruthy();
    }
  });

  it('main quest books use the writerName as authorName', () => {
    const texts = buildSeedTexts(options);
    const books = texts.filter((t) => t.textCategory === 'book');
    for (const book of books) {
      expect(book.authorName).toBe('Jean-Luc Moreau');
    }
  });

  it('every text has at least one page', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      expect(text.pages.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every text has vocabulary highlights', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      expect(text.vocabularyHighlights.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every text has at least one comprehension question', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      expect(text.comprehensionQuestions.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('comprehension questions have valid correctIndex', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      for (const q of text.comprehensionQuestions) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThan(q.options.length);
      }
    }
  });

  it('every text has a spawnLocationHint', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      expect(text.spawnLocationHint).toBeTruthy();
    }
  });

  it('difficulty matches CEFR level', () => {
    const texts = buildSeedTexts(options);
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

  it('uses custom writer name when provided', () => {
    const texts = buildSeedTexts({ ...options, writerName: 'Marie Fontaine' });
    const books = texts.filter((t) => t.textCategory === 'book');
    for (const book of books) {
      expect(book.authorName).toBe('Marie Fontaine');
    }
  });

  it('pages have both content and contentTranslation', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      for (const page of text.pages) {
        expect(page.content).toBeTruthy();
        expect(page.contentTranslation).toBeTruthy();
      }
    }
  });

  it('vocabulary highlights have word, translation, and partOfSpeech', () => {
    const texts = buildSeedTexts(options);
    for (const text of texts) {
      for (const v of text.vocabularyHighlights) {
        expect(v.word).toBeTruthy();
        expect(v.translation).toBeTruthy();
        expect(v.partOfSpeech).toBeTruthy();
      }
    }
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

    expect(result.created).toBe(28);
    expect(result.skipped).toBe(false);
    expect(mockStorage.createGameText).toHaveBeenCalledTimes(28);
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
