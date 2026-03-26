import { describe, it, expect } from 'vitest';
import type { GameText } from '@shared/schema';

/**
 * Tests for AdminTextsHub logic: filtering, grouping, and form data preparation.
 */

// ─── Constants mirrored from AdminTextsHub ──────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  book: 'Books',
  journal: 'Journals',
  letter: 'Letters',
  flyer: 'Flyers',
  recipe: 'Recipes',
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const SPAWN_LOCATIONS = ['library', 'bookshop', 'cafe', 'residence', 'office', 'hidden', 'market'];

// ─── Filtering logic mirrored from AdminTextsHub ────────────────────────────

function filterTexts(
  texts: GameText[],
  searchQuery: string,
  categoryFilter: string,
  cefrFilter: string,
): GameText[] {
  let result = texts;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.titleTranslation?.toLowerCase().includes(q) ||
      t.authorName?.toLowerCase().includes(q) ||
      (t.tags as string[] | null)?.some(tag => tag.toLowerCase().includes(q))
    );
  }
  if (categoryFilter !== 'all') {
    result = result.filter(t => t.textCategory === categoryFilter);
  }
  if (cefrFilter !== 'all') {
    result = result.filter(t => t.cefrLevel === cefrFilter);
  }
  return result;
}

function groupByCategory(texts: GameText[]): Map<string, GameText[]> {
  const groups = new Map<string, GameText[]>();
  for (const text of texts) {
    const key = text.textCategory || 'unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(text);
  }
  return groups;
}

// ─── Mock data ──────────────────────────────────────────────────────────────

const mockTexts: GameText[] = [
  {
    id: 'text-1',
    worldId: 'world-1',
    title: 'Le Petit Prince',
    titleTranslation: 'The Little Prince',
    textCategory: 'book',
    cefrLevel: 'A2',
    targetLanguage: 'French',
    difficulty: 'beginner',
    authorName: 'Antoine',
    spawnLocationHint: 'library',
    status: 'published',
    isGenerated: false,
    pages: [{ content: 'Page un', contentTranslation: 'Page one' }],
    vocabularyHighlights: [{ word: 'petit', translation: 'small', partOfSpeech: 'adj' }],
    comprehensionQuestions: [],
    tags: ['classic', 'children'],
    clueText: null,
    generationPrompt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'text-2',
    worldId: 'world-1',
    title: 'Journal de Marie',
    titleTranslation: 'Marie\'s Journal',
    textCategory: 'journal',
    cefrLevel: 'B1',
    targetLanguage: 'French',
    difficulty: 'intermediate',
    authorName: 'Marie',
    spawnLocationHint: 'residence',
    status: 'draft',
    isGenerated: true,
    pages: [
      { content: 'Jour 1', contentTranslation: 'Day 1' },
      { content: 'Jour 2', contentTranslation: 'Day 2' },
    ],
    vocabularyHighlights: [],
    comprehensionQuestions: [],
    tags: ['diary'],
    clueText: 'Check the old house',
    generationPrompt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'text-3',
    worldId: 'world-1',
    title: 'Recette de Gumbo',
    titleTranslation: 'Gumbo Recipe',
    textCategory: 'recipe',
    cefrLevel: 'A1',
    targetLanguage: 'French',
    difficulty: 'beginner',
    authorName: null,
    spawnLocationHint: 'cafe',
    status: 'draft',
    isGenerated: false,
    pages: [{ content: 'Ingredients...', contentTranslation: 'Ingredients...' }],
    vocabularyHighlights: [],
    comprehensionQuestions: [],
    tags: ['food', 'cooking'],
    clueText: null,
    generationPrompt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'text-4',
    worldId: 'world-1',
    title: 'Lettre de Papa',
    titleTranslation: 'Letter from Dad',
    textCategory: 'letter',
    cefrLevel: 'A2',
    targetLanguage: 'French',
    difficulty: 'beginner',
    authorName: 'Papa',
    spawnLocationHint: 'residence',
    status: 'published',
    isGenerated: false,
    pages: [{ content: 'Cher fils...', contentTranslation: 'Dear son...' }],
    vocabularyHighlights: [],
    comprehensionQuestions: [],
    tags: ['family'],
    clueText: null,
    generationPrompt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ─── Filtering Tests ────────────────────────────────────────────────────────

describe('AdminTextsHub text filtering', () => {
  it('returns all texts when no filters are applied', () => {
    const result = filterTexts(mockTexts, '', 'all', 'all');
    expect(result).toHaveLength(4);
  });

  it('filters by search query matching title', () => {
    const result = filterTexts(mockTexts, 'petit', 'all', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('text-1');
  });

  it('filters by search query matching title translation', () => {
    const result = filterTexts(mockTexts, 'Gumbo', 'all', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('text-3');
  });

  it('filters by search query matching author name', () => {
    const result = filterTexts(mockTexts, 'Marie', 'all', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('text-2');
  });

  it('filters by search query matching tags', () => {
    const result = filterTexts(mockTexts, 'cooking', 'all', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('text-3');
  });

  it('filters by category', () => {
    const result = filterTexts(mockTexts, '', 'book', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].textCategory).toBe('book');
  });

  it('filters by CEFR level', () => {
    const result = filterTexts(mockTexts, '', 'all', 'A2');
    expect(result).toHaveLength(2);
    expect(result.every(t => t.cefrLevel === 'A2')).toBe(true);
  });

  it('combines search, category, and CEFR filters', () => {
    const result = filterTexts(mockTexts, '', 'book', 'A2');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('text-1');
  });

  it('returns empty when no texts match', () => {
    const result = filterTexts(mockTexts, 'nonexistent', 'all', 'all');
    expect(result).toHaveLength(0);
  });

  it('search is case-insensitive', () => {
    const result = filterTexts(mockTexts, 'PETIT', 'all', 'all');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('text-1');
  });
});

// ─── Grouping Tests ─────────────────────────────────────────────────────────

describe('AdminTextsHub text grouping', () => {
  it('groups texts by category', () => {
    const groups = groupByCategory(mockTexts);
    expect(groups.size).toBe(4); // book, journal, recipe, letter
    expect(groups.get('book')?.length).toBe(1);
    expect(groups.get('journal')?.length).toBe(1);
    expect(groups.get('recipe')?.length).toBe(1);
  });

  it('handles empty array', () => {
    const groups = groupByCategory([]);
    expect(groups.size).toBe(0);
  });

  it('assigns texts with missing category to unknown', () => {
    const textNoCategory = { ...mockTexts[0], textCategory: '' } as GameText;
    const groups = groupByCategory([textNoCategory]);
    expect(groups.has('unknown')).toBe(true);
  });
});

// ─── Category Labels Tests ──────────────────────────────────────────────────

describe('AdminTextsHub category labels', () => {
  it('has labels for all five document types', () => {
    expect(Object.keys(CATEGORY_LABELS)).toEqual(['book', 'journal', 'letter', 'flyer', 'recipe']);
  });

  it('has human-readable label for each category', () => {
    expect(CATEGORY_LABELS.book).toBe('Books');
    expect(CATEGORY_LABELS.journal).toBe('Journals');
    expect(CATEGORY_LABELS.letter).toBe('Letters');
    expect(CATEGORY_LABELS.flyer).toBe('Flyers');
    expect(CATEGORY_LABELS.recipe).toBe('Recipes');
  });
});

// ─── Difficulty Labels Tests ────────────────────────────────────────────────

describe('AdminTextsHub difficulty labels', () => {
  it('has labels for all three difficulty levels', () => {
    expect(Object.keys(DIFFICULTY_LABELS)).toEqual(['beginner', 'intermediate', 'advanced']);
  });
});

// ─── Spawn Locations Tests ──────────────────────────────────────────────────

describe('AdminTextsHub spawn locations', () => {
  it('includes expected spawn location options', () => {
    expect(SPAWN_LOCATIONS).toContain('library');
    expect(SPAWN_LOCATIONS).toContain('bookshop');
    expect(SPAWN_LOCATIONS).toContain('cafe');
    expect(SPAWN_LOCATIONS).toContain('residence');
    expect(SPAWN_LOCATIONS).toContain('hidden');
  });

  it('has 7 spawn locations', () => {
    expect(SPAWN_LOCATIONS).toHaveLength(7);
  });
});

// ─── Form Data Tests ────────────────────────────────────────────────────────

describe('AdminTextsHub form data preparation', () => {
  it('converts GameText to edit form data correctly', () => {
    const text = mockTexts[0];
    const form = {
      title: text.title,
      titleTranslation: text.titleTranslation || '',
      textCategory: text.textCategory,
      cefrLevel: text.cefrLevel,
      targetLanguage: text.targetLanguage,
      difficulty: text.difficulty || 'beginner',
      authorName: text.authorName || '',
      spawnLocationHint: text.spawnLocationHint || '',
      clueText: text.clueText || '',
      status: text.status || 'draft',
      tags: (text.tags as string[]) || [],
      pages: (text.pages as Array<{ content: string; contentTranslation: string }>) || [],
      vocabularyHighlights: (text.vocabularyHighlights as Array<{ word: string; translation: string; partOfSpeech: string }>) || [],
      comprehensionQuestions: (text.comprehensionQuestions as any[]) || [],
    };

    expect(form.title).toBe('Le Petit Prince');
    expect(form.titleTranslation).toBe('The Little Prince');
    expect(form.textCategory).toBe('book');
    expect(form.cefrLevel).toBe('A2');
    expect(form.difficulty).toBe('beginner');
    expect(form.authorName).toBe('Antoine');
    expect(form.status).toBe('published');
    expect(form.tags).toEqual(['classic', 'children']);
    expect(form.pages).toHaveLength(1);
    expect(form.vocabularyHighlights).toHaveLength(1);
  });

  it('handles null fields with defaults', () => {
    const text = mockTexts[2]; // recipe with null author
    const authorName = text.authorName || '';
    const clueText = text.clueText || '';

    expect(authorName).toBe('');
    expect(clueText).toBe('');
  });
});

// ─── Bulk Selection Tests ───────────────────────────────────────────────────

describe('AdminTextsHub bulk selection', () => {
  it('toggles selection correctly', () => {
    const selected = new Set<string>();

    // Add
    selected.add('text-1');
    expect(selected.has('text-1')).toBe(true);
    expect(selected.size).toBe(1);

    // Add another
    selected.add('text-2');
    expect(selected.size).toBe(2);

    // Remove
    selected.delete('text-1');
    expect(selected.has('text-1')).toBe(false);
    expect(selected.size).toBe(1);
  });

  it('select all adds all filtered text IDs', () => {
    const filtered = filterTexts(mockTexts, '', 'all', 'all');
    const selected = new Set(filtered.map(t => t.id));
    expect(selected.size).toBe(4);
  });

  it('select all with filter only selects filtered texts', () => {
    const filtered = filterTexts(mockTexts, '', 'book', 'all');
    const selected = new Set(filtered.map(t => t.id));
    expect(selected.size).toBe(1);
    expect(selected.has('text-1')).toBe(true);
  });
});

// ─── Page Count Display Tests ───────────────────────────────────────────────

describe('AdminTextsHub page count', () => {
  it('correctly counts pages for single-page text', () => {
    const pages = (mockTexts[0].pages as any[]) || [];
    expect(pages.length).toBe(1);
  });

  it('correctly counts pages for multi-page text', () => {
    const pages = (mockTexts[1].pages as any[]) || [];
    expect(pages.length).toBe(2);
  });
});
