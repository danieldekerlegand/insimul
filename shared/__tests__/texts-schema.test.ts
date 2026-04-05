/**
 * Tests for the Texts schema (reading content for language learning).
 * Validates insertTextSchema parsing and type constraints.
 */

import { describe, it, expect } from 'vitest';
import { insertTextSchema } from '../schema';

describe('insertTextSchema', () => {
  const validText = {
    worldId: 'world-123',
    title: 'Le Petit Prince',
    titleTranslation: 'The Little Prince',
    textCategory: 'book',
    cefrLevel: 'A1',
    targetLanguage: 'French',
    pages: [{ content: 'Bonjour le monde', contentTranslation: 'Hello world' }],
    vocabularyHighlights: [{ word: 'bonjour', translation: 'hello', partOfSpeech: 'interjection' }],
    comprehensionQuestions: [{
      question: "Qu'est-ce que c'est?",
      questionTranslation: 'What is it?',
      options: ['un livre', 'un chat', 'un chien'],
      correctIndex: 0,
    }],
    difficulty: 'beginner',
    authorName: 'Antoine de Saint-Exupery',
    status: 'draft',
    tags: ['fiction', 'classic'],
  };

  it('accepts valid text data', () => {
    const result = insertTextSchema.safeParse(validText);
    expect(result.success).toBe(true);
  });

  it('requires title', () => {
    const result = insertTextSchema.safeParse({ ...validText, title: '' });
    expect(result.success).toBe(false);
  });

  it('requires worldId', () => {
    const { worldId, ...noWorld } = validText;
    const result = insertTextSchema.safeParse(noWorld);
    expect(result.success).toBe(false);
  });

  it('requires targetLanguage', () => {
    const result = insertTextSchema.safeParse({ ...validText, targetLanguage: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid textCategory', () => {
    const result = insertTextSchema.safeParse({ ...validText, textCategory: 'novel' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid categories', () => {
    for (const cat of ['book', 'journal', 'letter', 'flyer', 'recipe']) {
      const result = insertTextSchema.safeParse({ ...validText, textCategory: cat });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid cefrLevel', () => {
    const result = insertTextSchema.safeParse({ ...validText, cefrLevel: 'D1' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid CEFR levels', () => {
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
      const result = insertTextSchema.safeParse({ ...validText, cefrLevel: level });
      expect(result.success).toBe(true);
    }
  });

  it('allows minimal text (only required fields)', () => {
    const minimal = {
      worldId: 'world-1',
      title: 'Un Titre',
      textCategory: 'letter',
      cefrLevel: 'B1',
      targetLanguage: 'French',
    };
    const result = insertTextSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('allows pages with content and translation', () => {
    const result = insertTextSchema.safeParse({
      ...validText,
      pages: [
        { content: 'Page un', contentTranslation: 'Page one' },
        { content: 'Page deux', contentTranslation: 'Page two' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional fields as undefined', () => {
    const result = insertTextSchema.safeParse({
      worldId: 'w1',
      title: 'Test',
      textCategory: 'flyer',
      cefrLevel: 'A2',
      targetLanguage: 'Spanish',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.authorName).toBeUndefined();
      expect(result.data.clueText).toBeUndefined();
      expect(result.data.spawnLocationHint).toBeUndefined();
    }
  });
});
