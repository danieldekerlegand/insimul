import { describe, it, expect } from 'vitest';
import type { ReadableDocument } from '../../shared/game-engine/rendering/DocumentReadingPanel';
import type { TextIR } from '../../shared/game-engine/ir-types';

describe('ReadableDocument type', () => {
  it('can be constructed with all required fields', () => {
    const doc: ReadableDocument = {
      id: 'doc-001',
      title: 'Le Journal du Bayou',
      titleTranslation: 'The Bayou Journal',
      textCategory: 'journal',
      cefrLevel: 'A1',
      pages: [
        { content: 'Bonjour, je suis ici.', contentTranslation: 'Hello, I am here.' },
        { content: 'Le bayou est beau.', contentTranslation: 'The bayou is beautiful.' },
      ],
      vocabularyHighlights: [
        { word: 'bayou', translation: 'bayou', partOfSpeech: 'noun' },
        { word: 'beau', translation: 'beautiful', partOfSpeech: 'adjective' },
      ],
      comprehensionQuestions: [
        { question: 'Qu\'est-ce qui est beau?', options: ['Le bayou', 'La ville', 'La maison', 'Le chat'], correctIndex: 0 },
      ],
      authorName: 'Jean-Luc Moreau',
      clueText: 'The writer mentions cypress trees by the south bayou.',
    };

    expect(doc.id).toBe('doc-001');
    expect(doc.pages).toHaveLength(2);
    expect(doc.vocabularyHighlights).toHaveLength(2);
    expect(doc.comprehensionQuestions).toHaveLength(1);
    expect(doc.clueText).toContain('cypress');
  });

  it('handles minimal document without optional fields', () => {
    const doc: ReadableDocument = {
      id: 'doc-002',
      title: 'Simple Text',
      titleTranslation: 'Texte Simple',
      textCategory: 'book',
      cefrLevel: 'A1',
      pages: [{ content: 'Bonjour.', contentTranslation: 'Hello.' }],
      vocabularyHighlights: [],
      comprehensionQuestions: [],
    };

    expect(doc.authorName).toBeUndefined();
    expect(doc.clueText).toBeUndefined();
  });
});

describe('TextIR type', () => {
  it('can be constructed with all required fields', () => {
    const textIR: TextIR = {
      id: 'text-ir-001',
      title: 'Recette de Beignets',
      titleTranslation: 'Beignets Recipe',
      textCategory: 'recipe',
      cefrLevel: 'A1',
      pages: [{ content: 'Ingredients: farine, sucre, oeufs.', contentTranslation: 'Ingredients: flour, sugar, eggs.' }],
      vocabularyHighlights: [
        { word: 'farine', translation: 'flour', partOfSpeech: 'noun' },
      ],
      comprehensionQuestions: [],
      targetLanguage: 'French',
      authorName: null,
      clueText: null,
      difficulty: 'easy',
      tags: ['recipe', 'food'],
      spawnLocationHint: 'cafe',
      isMainQuest: false,
    };

    expect(textIR.id).toBe('text-ir-001');
    expect(textIR.textCategory).toBe('recipe');
    expect(textIR.isMainQuest).toBe(false);
  });

  it('can represent a main quest journal entry', () => {
    const textIR: TextIR = {
      id: 'journal-001',
      title: 'Journal de Jean-Luc, Chapitre 1',
      titleTranslation: "Jean-Luc's Journal, Chapter 1",
      textCategory: 'journal',
      cefrLevel: 'A1',
      pages: [{ content: 'Le bayou cache des secrets.', contentTranslation: 'The bayou hides secrets.' }],
      vocabularyHighlights: [],
      comprehensionQuestions: [],
      targetLanguage: 'French',
      authorName: 'Jean-Luc Moreau',
      clueText: 'Secret spot under cypress trees by the south bayou.',
      difficulty: 'easy',
      tags: ['main-quest', 'writer-journal'],
      spawnLocationHint: 'hidden',
      isMainQuest: true,
    };

    expect(textIR.isMainQuest).toBe(true);
    expect(textIR.clueText).toContain('cypress');
    expect(textIR.authorName).toBe('Jean-Luc Moreau');
  });
});

describe('CEFR XP values', () => {
  const CEFR_XP: Record<string, number> = { A1: 10, A2: 15, B1: 25, B2: 40 };

  it('A1 awards 10 XP', () => expect(CEFR_XP['A1']).toBe(10));
  it('A2 awards 15 XP', () => expect(CEFR_XP['A2']).toBe(15));
  it('B1 awards 25 XP', () => expect(CEFR_XP['B1']).toBe(25));
  it('B2 awards 40 XP', () => expect(CEFR_XP['B2']).toBe(40));
});
