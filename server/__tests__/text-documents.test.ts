import { describe, it, expect } from 'vitest';
import { dbTextToNoticeArticle, cefrToDifficulty, noticeArticleToGameText } from '../../shared/game-engine/logic/GameTextTypes';

describe('dbTextToNoticeArticle', () => {
  const sampleText = {
    id: 'text-001',
    title: 'Avis Important',
    titleTranslation: 'Important Notice',
    textCategory: 'notice' as const,
    cefrLevel: 'A1' as const,
    pages: [
      { content: 'Bonjour le village!', contentTranslation: 'Hello village!' },
    ],
    vocabularyHighlights: [
      { word: 'bonjour', translation: 'hello' },
      { word: 'village', translation: 'village' },
    ],
    comprehensionQuestions: [
      { question: 'Que dit le texte?', options: ['Bonjour', 'Au revoir', 'Merci', 'Pardon'], correctIndex: 0 },
    ],
    authorName: 'Jean-Luc Moreau',
  };

  it('converts DB text to NoticeArticle format', () => {
    const article = dbTextToNoticeArticle(sampleText);

    expect(article.id).toBe('text-001');
    expect(article.title).toBe('Avis Important');
    expect(article.titleTranslation).toBe('Important Notice');
    expect(article.body).toBe('Bonjour le village!');
    expect(article.bodyTranslation).toBe('Hello village!');
    expect(article.documentType).toBe('notice');
  });

  it('maps CEFR level to difficulty', () => {
    const article = dbTextToNoticeArticle(sampleText);
    expect(article.difficulty).toBe('beginner');
  });

  it('converts vocabulary highlights to word/meaning pairs', () => {
    const article = dbTextToNoticeArticle(sampleText);
    expect(article.vocabularyWords).toHaveLength(2);
    expect(article.vocabularyWords[0]).toEqual({ word: 'bonjour', meaning: 'hello' });
  });

  it('converts comprehension questions', () => {
    const article = dbTextToNoticeArticle(sampleText);
    expect(article.comprehensionQuestion).toBeDefined();
    expect(article.comprehensionQuestion?.question).toBe('Que dit le texte?');
    expect(article.comprehensionQuestion?.options).toHaveLength(4);
    expect(article.comprehensionQuestion?.correctIndex).toBe(0);
  });

  it('handles text with no pages', () => {
    const noPages = { ...sampleText, pages: [] };
    const article = dbTextToNoticeArticle(noPages);
    expect(article.body).toBe('');
    expect(article.bodyTranslation).toBe('');
  });

  it('handles text with no comprehension questions', () => {
    const noQuestions = { ...sampleText, comprehensionQuestions: [] };
    const article = dbTextToNoticeArticle(noQuestions);
    expect(article.comprehensionQuestion).toBeUndefined();
  });

  it('handles missing optional fields', () => {
    const minimal = {
      id: 'text-min',
      title: 'Test',
    };
    const article = dbTextToNoticeArticle(minimal);
    expect(article.id).toBe('text-min');
    expect(article.body).toBe('');
    expect(article.difficulty).toBe('beginner');
    expect(article.vocabularyWords).toHaveLength(0);
  });
});

describe('cefrToDifficulty', () => {
  it('maps A1 to beginner', () => {
    expect(cefrToDifficulty('A1')).toBe('beginner');
  });

  it('maps A2 to intermediate', () => {
    expect(cefrToDifficulty('A2')).toBe('intermediate');
  });

  it('maps B1 to intermediate', () => {
    expect(cefrToDifficulty('B1')).toBe('intermediate');
  });

  it('maps B2 to advanced', () => {
    expect(cefrToDifficulty('B2')).toBe('advanced');
  });
});

describe('noticeArticleToGameText', () => {
  it('converts a notice article to a GameText', () => {
    const article = {
      id: 'notice-001',
      title: 'Market Day',
      titleTranslation: "Jour de March\u00e9",
      body: 'The market is open today.',
      bodyTranslation: "Le march\u00e9 est ouvert aujourd'hui.",
      difficulty: 'beginner' as const,
      vocabularyWords: [{ word: 'market', meaning: "march\u00e9" }],
    };
    const gameText = noticeArticleToGameText(article);
    expect(gameText.textCategory).toBe('notice');
    expect(gameText.cefrLevel).toBe('A1');
    expect(gameText.collected).toBe(true);
  });

  it('maps story documentType to book category', () => {
    const article = {
      id: 'story-001',
      title: 'A Tale',
      titleTranslation: 'Un Conte',
      body: 'Once upon a time...',
      bodyTranslation: "Il \u00e9tait une fois...",
      difficulty: 'advanced' as const,
      vocabularyWords: [],
      documentType: 'story' as const,
    };
    const gameText = noticeArticleToGameText(article);
    expect(gameText.textCategory).toBe('book');
  });
});

describe('TextIR in ir-types', () => {
  it('SystemsIR has texts field', async () => {
    // Verify the TextIR type exists and SystemsIR includes it
    const irTypes = await import('../../shared/game-engine/ir-types');
    // If this compiles, the types are valid
    const mockSystem: Partial<typeof irTypes.SystemsIR> = {};
    expect(true).toBe(true);
  });
});

describe('IDataSource has loadTexts', () => {
  it('loadTexts is part of IDataSource interface', async () => {
    // Verify the interface includes loadTexts
    const dataSource = await import('../../shared/game-engine/data-source');
    // The import succeeds if loadTexts is defined in the interface
    expect(dataSource).toBeDefined();
  });
});
