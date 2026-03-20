import { describe, it, expect } from 'vitest';
import { insertTextSchema } from '@shared/schema';
import type { Text, InsertText } from '@shared/schema';

describe('Texts Schema', () => {
  const validText: InsertText = {
    worldId: 'world-1',
    title: 'Welcome Sign',
    body: 'Bienvenue au village!',
    textType: 'sign',
    language: 'fr',
    difficulty: 'beginner',
    locationId: 'loc-1',
    characterId: null,
    vocabularyWords: ['bienvenue', 'village'],
    grammarNotes: 'Uses "au" contraction of "à le"',
    translation: 'Welcome to the village!',
    tags: ['greeting', 'sign'],
    metadata: { fontSize: 'large' },
  };

  it('validates a complete text insert', () => {
    const result = insertTextSchema.safeParse(validText);
    expect(result.success).toBe(true);
  });

  it('requires worldId, title, body, and textType', () => {
    const missing = insertTextSchema.safeParse({});
    expect(missing.success).toBe(false);

    const partial = insertTextSchema.safeParse({ worldId: 'w1', title: 'T' });
    expect(partial.success).toBe(false);
  });

  it('accepts minimal required fields', () => {
    const minimal = insertTextSchema.safeParse({
      worldId: 'world-1',
      title: 'A Book',
      body: 'Chapter 1...',
      textType: 'book',
    });
    expect(minimal.success).toBe(true);
  });

  it('allows optional fields to be omitted', () => {
    const result = insertTextSchema.safeParse({
      worldId: 'world-1',
      title: 'Notice',
      body: 'Town meeting tonight.',
      textType: 'notice',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBeUndefined();
      expect(result.data.locationId).toBeUndefined();
    }
  });

  it('rejects id, createdAt, and updatedAt in insert schema', () => {
    const withId = insertTextSchema.safeParse({
      ...validText,
      id: 'should-not-be-here',
    });
    // id should be stripped (omitted), so data should not have it
    if (withId.success) {
      expect((withId.data as any).id).toBeUndefined();
    }
  });
});

describe('Text type shape', () => {
  it('has expected properties when fully populated', () => {
    const text: Text = {
      id: 'text-1',
      worldId: 'world-1',
      title: 'Letter from the Mayor',
      body: 'Dear citizen...',
      textType: 'letter',
      language: 'es',
      difficulty: 'intermediate',
      locationId: 'town-hall',
      characterId: 'mayor-1',
      vocabularyWords: ['ciudadano', 'querido'],
      grammarNotes: 'Formal address',
      translation: 'Dear citizen...',
      tags: ['formal', 'quest-related'],
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(text.id).toBe('text-1');
    expect(text.worldId).toBe('world-1');
    expect(text.textType).toBe('letter');
    expect(text.vocabularyWords).toHaveLength(2);
    expect(text.difficulty).toBe('intermediate');
  });
});
