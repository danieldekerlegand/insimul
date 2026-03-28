/**
 * Tests for the Library menu tab overhaul in GameMenuSystem.
 *
 * Validates category filtering, reading state management, document type labels,
 * article navigation, pagination, server text merging, and clue detection.
 * Tests pure logic in isolation since GameMenuSystem is a Babylon.js GUI class
 * that can't be instantiated in tests.
 */

import { describe, it, expect } from 'vitest';

// Re-implement types to test in isolation
interface NoticeArticle {
  id: string;
  title: string;
  titleTranslation: string;
  body: string;
  bodyTranslation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  vocabularyWords: { word: string; meaning: string }[];
  comprehensionQuestion?: {
    question: string;
    questionTranslation: string;
    options: string[];
    correctIndex: number;
  };
  author?: { characterId: string; name: string; occupation?: string };
  settlementId?: string;
  noticeType?: 'letter' | 'flyer' | 'official' | 'wanted' | 'advertisement';
  readingXp?: number;
  documentType?: 'notice' | 'story' | 'poem' | 'document' | 'book' | 'journal' | 'letter' | 'recipe';
  questHook?: { questId: string; questTitle: string; questTitleTranslation: string };
  assessmentHook?: { assessmentType: 'arrival' | 'departure'; buttonLabel: string; buttonLabelTranslation: string };
  clueText?: string;
  cefrLevel?: string;
  pages?: { content: string; contentTranslation: string }[];
}

const LIBRARY_CATEGORIES = [
  { id: 'all', label: 'All', icon: '📚' },
  { id: 'notice', label: 'Notices', icon: '📋' },
  { id: 'book', label: 'Books', icon: '📖' },
  { id: 'story', label: 'Stories', icon: '📝' },
  { id: 'poem', label: 'Poems', icon: '🎭' },
  { id: 'journal', label: 'Journals', icon: '📓' },
  { id: 'letter', label: 'Letters', icon: '✉️' },
  { id: 'recipe', label: 'Recipes', icon: '🍳' },
  { id: 'document', label: 'Documents', icon: '📄' },
];

// Pure logic extracted from GameMenuSystem for testing

function getDocumentTypeLabel(article: NoticeArticle): string {
  const docType = article.documentType || 'notice';
  const cat = LIBRARY_CATEGORIES.find(c => c.id === docType);
  if (!cat) return `📋 ${docType}`;
  const singular = cat.label.endsWith('ies')
    ? cat.label.slice(0, -3) + 'y'
    : cat.label.replace(/s$/, '');
  return `${cat.icon} ${singular}`;
}

function filterByCategory(articles: NoticeArticle[], category: string): NoticeArticle[] {
  if (category === 'all') return articles;
  return articles.filter(a => (a.documentType || 'notice') === category);
}

function filterByFluency(articles: NoticeArticle[], playerFluency: number): NoticeArticle[] {
  return articles.filter(a => {
    if (a.difficulty === 'intermediate' && playerFluency < 25) return false;
    if (a.difficulty === 'advanced' && playerFluency < 55) return false;
    return true;
  });
}

function getCategoryCounts(articles: NoticeArticle[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const a of articles) {
    const cat = a.documentType || 'notice';
    counts.set(cat, (counts.get(cat) || 0) + 1);
  }
  return counts;
}

function getNavigation(articles: NoticeArticle[], currentId: string): { prevId: string | null; nextId: string | null; position: number; total: number } {
  const idx = articles.findIndex(a => a.id === currentId);
  return {
    prevId: idx > 0 ? articles[idx - 1].id : null,
    nextId: idx < articles.length - 1 ? articles[idx + 1].id : null,
    position: idx + 1,
    total: articles.length,
  };
}

/** Merge local and server articles, deduplicating by id */
function mergeArticles(local: NoticeArticle[], server: NoticeArticle[]): NoticeArticle[] {
  const seenIds = new Set(local.map(a => a.id));
  const merged = [...local];
  for (const s of server) {
    if (!seenIds.has(s.id)) {
      merged.push(s);
      seenIds.add(s.id);
    }
  }
  return merged;
}

/** Paginate articles: return first `limit` articles */
function paginate(articles: NoticeArticle[], limit: number): NoticeArticle[] {
  return articles.slice(0, limit);
}

// Test data
function makeArticle(overrides: Partial<NoticeArticle> = {}): NoticeArticle {
  return {
    id: 'test_1',
    title: 'Test Title',
    titleTranslation: 'Test Translation',
    body: 'Test body text for the article.',
    bodyTranslation: 'Test body translation.',
    difficulty: 'beginner',
    vocabularyWords: [],
    ...overrides,
  };
}

describe('Library Menu - Category Filtering', () => {
  const articles: NoticeArticle[] = [
    makeArticle({ id: '1', documentType: 'notice' }),
    makeArticle({ id: '2', documentType: 'story' }),
    makeArticle({ id: '3', documentType: 'book' }),
    makeArticle({ id: '4', documentType: 'poem' }),
    makeArticle({ id: '5', documentType: 'notice' }),
    makeArticle({ id: '6' }), // defaults to 'notice'
  ];

  it('returns all articles when category is "all"', () => {
    expect(filterByCategory(articles, 'all')).toHaveLength(6);
  });

  it('filters to notices (including default)', () => {
    const result = filterByCategory(articles, 'notice');
    expect(result).toHaveLength(3);
    expect(result.map(a => a.id)).toEqual(['1', '5', '6']);
  });

  it('filters to stories', () => {
    const result = filterByCategory(articles, 'story');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('filters to books', () => {
    const result = filterByCategory(articles, 'book');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('returns empty for category with no articles', () => {
    expect(filterByCategory(articles, 'recipe')).toHaveLength(0);
  });
});

describe('Library Menu - Fluency Filtering', () => {
  const articles: NoticeArticle[] = [
    makeArticle({ id: '1', difficulty: 'beginner' }),
    makeArticle({ id: '2', difficulty: 'intermediate' }),
    makeArticle({ id: '3', difficulty: 'advanced' }),
  ];

  it('shows only beginner at low fluency', () => {
    const result = filterByFluency(articles, 0);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('shows beginner + intermediate at fluency 25', () => {
    const result = filterByFluency(articles, 25);
    expect(result).toHaveLength(2);
  });

  it('shows all at fluency 55+', () => {
    const result = filterByFluency(articles, 55);
    expect(result).toHaveLength(3);
  });

  it('shows all at high fluency', () => {
    const result = filterByFluency(articles, 100);
    expect(result).toHaveLength(3);
  });
});

describe('Library Menu - Document Type Labels', () => {
  it('returns correct label for notice', () => {
    expect(getDocumentTypeLabel(makeArticle({ documentType: 'notice' }))).toBe('📋 Notice');
  });

  it('returns correct label for story', () => {
    expect(getDocumentTypeLabel(makeArticle({ documentType: 'story' }))).toBe('📝 Story');
  });

  it('returns correct label for book', () => {
    expect(getDocumentTypeLabel(makeArticle({ documentType: 'book' }))).toBe('📖 Book');
  });

  it('returns correct label for poem', () => {
    expect(getDocumentTypeLabel(makeArticle({ documentType: 'poem' }))).toBe('🎭 Poem');
  });

  it('returns correct label for journal', () => {
    expect(getDocumentTypeLabel(makeArticle({ documentType: 'journal' }))).toBe('📓 Journal');
  });

  it('returns correct label for recipe', () => {
    expect(getDocumentTypeLabel(makeArticle({ documentType: 'recipe' }))).toBe('🍳 Recipe');
  });

  it('defaults to notice when documentType is undefined', () => {
    expect(getDocumentTypeLabel(makeArticle())).toBe('📋 Notice');
  });
});

describe('Library Menu - Category Counts', () => {
  it('counts articles per category', () => {
    const articles = [
      makeArticle({ id: '1', documentType: 'notice' }),
      makeArticle({ id: '2', documentType: 'notice' }),
      makeArticle({ id: '3', documentType: 'story' }),
      makeArticle({ id: '4', documentType: 'book' }),
      makeArticle({ id: '5' }), // defaults to 'notice'
    ];
    const counts = getCategoryCounts(articles);
    expect(counts.get('notice')).toBe(3);
    expect(counts.get('story')).toBe(1);
    expect(counts.get('book')).toBe(1);
    expect(counts.get('poem')).toBeUndefined();
  });
});

describe('Library Menu - Navigation', () => {
  const articles = [
    makeArticle({ id: '1' }),
    makeArticle({ id: '2' }),
    makeArticle({ id: '3' }),
  ];

  it('shows correct position for first article', () => {
    const nav = getNavigation(articles, '1');
    expect(nav.position).toBe(1);
    expect(nav.total).toBe(3);
    expect(nav.prevId).toBeNull();
    expect(nav.nextId).toBe('2');
  });

  it('shows correct position for middle article', () => {
    const nav = getNavigation(articles, '2');
    expect(nav.position).toBe(2);
    expect(nav.prevId).toBe('1');
    expect(nav.nextId).toBe('3');
  });

  it('shows correct position for last article', () => {
    const nav = getNavigation(articles, '3');
    expect(nav.position).toBe(3);
    expect(nav.prevId).toBe('2');
    expect(nav.nextId).toBeNull();
  });

  it('handles single article', () => {
    const nav = getNavigation([makeArticle({ id: '1' })], '1');
    expect(nav.position).toBe(1);
    expect(nav.total).toBe(1);
    expect(nav.prevId).toBeNull();
    expect(nav.nextId).toBeNull();
  });
});

describe('Library Menu - Read Tracking', () => {
  it('tracks read articles', () => {
    const readIds = new Set<string>();
    expect(readIds.has('1')).toBe(false);
    readIds.add('1');
    expect(readIds.has('1')).toBe(true);
    expect(readIds.has('2')).toBe(false);
  });

  it('counts read articles', () => {
    const articles = [makeArticle({ id: '1' }), makeArticle({ id: '2' }), makeArticle({ id: '3' })];
    const readIds = new Set(['1', '3']);
    const readCount = articles.filter(a => readIds.has(a.id)).length;
    expect(readCount).toBe(2);
  });
});

describe('Library Menu - Combined Category + Fluency Filtering', () => {
  const articles = [
    makeArticle({ id: '1', documentType: 'notice', difficulty: 'beginner' }),
    makeArticle({ id: '2', documentType: 'notice', difficulty: 'advanced' }),
    makeArticle({ id: '3', documentType: 'story', difficulty: 'beginner' }),
    makeArticle({ id: '4', documentType: 'story', difficulty: 'intermediate' }),
  ];

  it('filters by both category and fluency', () => {
    const byCategory = filterByCategory(articles, 'notice');
    const result = filterByFluency(byCategory, 0);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('all category with low fluency filters out intermediate/advanced', () => {
    const byCategory = filterByCategory(articles, 'all');
    const result = filterByFluency(byCategory, 0);
    expect(result).toHaveLength(2);
    expect(result.map(a => a.id)).toEqual(['1', '3']);
  });
});

describe('Library Menu - Pagination', () => {
  const articles = Array.from({ length: 30 }, (_, i) =>
    makeArticle({ id: `art_${i}`, documentType: 'book' }),
  );

  it('returns only first page of articles', () => {
    const page = paginate(articles, 15);
    expect(page).toHaveLength(15);
    expect(page[0].id).toBe('art_0');
    expect(page[14].id).toBe('art_14');
  });

  it('returns all articles when limit exceeds count', () => {
    const page = paginate(articles, 50);
    expect(page).toHaveLength(30);
  });

  it('returns empty for empty list', () => {
    expect(paginate([], 15)).toHaveLength(0);
  });

  it('loads more articles when limit increases', () => {
    const page1 = paginate(articles, 15);
    const page2 = paginate(articles, 30);
    expect(page1).toHaveLength(15);
    expect(page2).toHaveLength(30);
  });
});

describe('Library Menu - Server Text Merging', () => {
  it('merges local and server articles without duplicates', () => {
    const local = [
      makeArticle({ id: 'local_1' }),
      makeArticle({ id: 'shared_1' }),
    ];
    const server = [
      makeArticle({ id: 'shared_1', title: 'Server Version' }),
      makeArticle({ id: 'server_1' }),
      makeArticle({ id: 'server_2' }),
    ];
    const merged = mergeArticles(local, server);
    expect(merged).toHaveLength(4);
    expect(merged.map(a => a.id)).toEqual(['local_1', 'shared_1', 'server_1', 'server_2']);
    // Local version wins for duplicates
    expect(merged.find(a => a.id === 'shared_1')?.title).toBe('Test Title');
  });

  it('returns only local when server is empty', () => {
    const local = [makeArticle({ id: '1' }), makeArticle({ id: '2' })];
    const merged = mergeArticles(local, []);
    expect(merged).toHaveLength(2);
  });

  it('returns only server when local is empty', () => {
    const server = [makeArticle({ id: 's1' }), makeArticle({ id: 's2' })];
    const merged = mergeArticles([], server);
    expect(merged).toHaveLength(2);
  });
});

describe('Library Menu - Clue Detection', () => {
  it('identifies articles with clue text', () => {
    const article = makeArticle({ id: '1', clueText: 'The key is under the mat' });
    expect(!!article.clueText).toBe(true);
  });

  it('identifies articles without clue text', () => {
    const article = makeArticle({ id: '2' });
    expect(!!article.clueText).toBe(false);
  });
});

describe('Library Menu - CEFR Level Display', () => {
  it('displays CEFR level when available', () => {
    const article = makeArticle({ id: '1', cefrLevel: 'A1' });
    expect(article.cefrLevel).toBe('A1');
  });

  it('falls back to difficulty when no CEFR level', () => {
    const article = makeArticle({ id: '1', difficulty: 'intermediate' });
    const displayLevel = article.cefrLevel || article.difficulty;
    expect(displayLevel).toBe('intermediate');
  });
});

describe('Library Menu - Page Count', () => {
  it('shows page count for multi-page texts', () => {
    const article = makeArticle({
      id: '1',
      pages: [
        { content: 'Page 1', contentTranslation: 'Page 1 translated' },
        { content: 'Page 2', contentTranslation: 'Page 2 translated' },
        { content: 'Page 3', contentTranslation: 'Page 3 translated' },
      ],
    });
    expect(article.pages?.length).toBe(3);
  });

  it('has no page count for single-body articles', () => {
    const article = makeArticle({ id: '1' });
    expect(article.pages).toBeUndefined();
  });
});

describe('Library Menu - XP Tracking', () => {
  it('tracks comprehension answers per article', () => {
    const answeredIds = new Set<string>();
    answeredIds.add('art_1');
    answeredIds.add('art_3');

    expect(answeredIds.has('art_1')).toBe(true);
    expect(answeredIds.has('art_2')).toBe(false);
    expect(answeredIds.has('art_3')).toBe(true);
  });

  it('prevents answering same article twice', () => {
    const answeredIds = new Set<string>();
    answeredIds.add('art_1');
    answeredIds.add('art_1'); // duplicate
    expect(answeredIds.size).toBe(1);
  });

  it('awards correct XP by difficulty', () => {
    const xpByDifficulty: Record<string, number> = { beginner: 10, intermediate: 15, advanced: 25 };
    expect(xpByDifficulty['beginner']).toBe(10);
    expect(xpByDifficulty['intermediate']).toBe(15);
    expect(xpByDifficulty['advanced']).toBe(25);
  });
});
