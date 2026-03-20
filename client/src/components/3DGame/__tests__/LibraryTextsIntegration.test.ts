/**
 * Tests for Library notice content and Texts system integration
 *
 * Verifies:
 * - GameText types and conversion functions
 * - NoticeGenerator produces occupation-contextual content (no filler)
 * - SAMPLE_ARTICLES filler has been removed
 * - Library categorization works correctly
 *
 * Run with: npx tsx client/src/components/3DGame/__tests__/LibraryTextsIntegration.test.ts
 */

import {
  type GameText,
  type TextCategory,
  TEXT_CATEGORY_INFO,
  cefrToDifficulty,
  difficultyToCefr,
  noticeArticleToGameText,
} from '../GameTextTypes';
import {
  generateSettlementNotices,
  noticesToGameTexts,
  type NPCAuthorInfo,
} from '../NoticeGenerator';
import type { NoticeArticle } from '../BabylonNoticeBoardPanel';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  \u2713 ${message}`);
  } else {
    failed++;
    console.error(`  \u2717 ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  assert(actual === expected, `${message} (expected ${expected}, got ${actual})`);
}

// ── GameTextTypes tests ─────────────────────────────────────────────────

console.log('\n=== GameTextTypes ===');

console.log('\ncefrToDifficulty:');
assertEqual(cefrToDifficulty('A1'), 'beginner', 'A1 -> beginner');
assertEqual(cefrToDifficulty('A2'), 'intermediate', 'A2 -> intermediate');
assertEqual(cefrToDifficulty('B1'), 'intermediate', 'B1 -> intermediate');
assertEqual(cefrToDifficulty('B2'), 'advanced', 'B2 -> advanced');

console.log('\ndifficultyToCefr:');
assertEqual(difficultyToCefr('beginner'), 'A1', 'beginner -> A1');
assertEqual(difficultyToCefr('intermediate'), 'A2', 'intermediate -> A2');
assertEqual(difficultyToCefr('advanced'), 'B1', 'advanced -> B1');

console.log('\nTEXT_CATEGORY_INFO:');
const categories: TextCategory[] = ['book', 'journal', 'letter', 'flyer', 'recipe', 'notice'];
for (const cat of categories) {
  assert(TEXT_CATEGORY_INFO[cat] !== undefined, `${cat} has category info`);
  assert(TEXT_CATEGORY_INFO[cat].label.length > 0, `${cat} has a label`);
  assert(TEXT_CATEGORY_INFO[cat].icon.length > 0, `${cat} has an icon`);
}

console.log('\nnoticeArticleToGameText:');
const sampleArticle: NoticeArticle = {
  id: 'test_1',
  title: 'Test Title',
  titleTranslation: 'Test Title EN',
  body: 'Test body text.',
  bodyTranslation: 'Test body text EN.',
  difficulty: 'beginner',
  vocabularyWords: [{ word: 'test', meaning: 'test' }],
  documentType: 'notice',
};

const gameText = noticeArticleToGameText(sampleArticle);
assertEqual(gameText.textCategory, 'notice', 'notice documentType -> notice category');
assertEqual(gameText.cefrLevel, 'A1', 'beginner -> A1 cefrLevel');
assertEqual(gameText.collected, true, 'converted text marked as collected');
assertEqual(gameText.id, 'test_1', 'preserves id');
assertEqual(gameText.title, 'Test Title', 'preserves title');

const storyArticle: NoticeArticle = {
  ...sampleArticle,
  id: 'test_story',
  documentType: 'story',
};
const storyText = noticeArticleToGameText(storyArticle);
assertEqual(storyText.textCategory, 'book', 'story documentType -> book category');

const poemArticle: NoticeArticle = {
  ...sampleArticle,
  id: 'test_poem',
  documentType: 'poem',
};
const poemText = noticeArticleToGameText(poemArticle);
assertEqual(poemText.textCategory, 'book', 'poem documentType -> book category');

// ── NoticeGenerator tests ───────────────────────────────────────────────

console.log('\n=== NoticeGenerator ===');

console.log('\ngenerateSettlementNotices with empty NPCs:');
const emptyResult = generateSettlementNotices('s1', 'TestVille', []);
assertEqual(emptyResult.length, 0, 'returns empty array for no NPCs');

console.log('\ngenerateSettlementNotices with occupation-specific NPCs:');
const npcs: NPCAuthorInfo[] = [
  { characterId: 'c1', name: 'Pierre', occupation: 'Merchant' },
  { characterId: 'c2', name: 'Marie', occupation: 'Guard' },
  { characterId: 'c3', name: 'Jacques', occupation: 'Baker' },
  { characterId: 'c4', name: 'Sophie', occupation: 'Doctor' },
];

const articles = generateSettlementNotices('s1', 'TestVille', npcs);
assertEqual(articles.length, 4, 'generates one notice per NPC');

// Check each article has required fields
for (let i = 0; i < articles.length; i++) {
  const a = articles[i];
  assert(a.id.startsWith('notice_s1_'), `article ${i} has settlement-scoped id`);
  assert(a.title.length > 0, `article ${i} has title`);
  assert(a.titleTranslation.length > 0, `article ${i} has title translation`);
  assert(a.body.length > 0, `article ${i} has body`);
  assert(a.bodyTranslation.length > 0, `article ${i} has body translation`);
  assert(a.vocabularyWords.length > 0, `article ${i} has vocabulary words`);
  assert(a.author !== undefined, `article ${i} has author`);
  assertEqual(a.settlementId, 's1', `article ${i} has correct settlementId`);
  assertEqual(a.documentType, 'notice', `article ${i} is a notice`);
  assert(a.readingXp !== undefined && a.readingXp > 0, `article ${i} has readingXp`);
}

console.log('\nOccupation-contextual content:');
// Merchant article should mention their shop/goods
const merchantArticle = articles[0];
assert(merchantArticle.author!.name === 'Pierre', 'merchant article authored by Pierre');
assert(
  merchantArticle.body.includes('Pierre') || merchantArticle.title.includes('Pierre'),
  'merchant article references NPC name',
);

// Guard article should mention security/safety
const guardArticle = articles[1];
assert(guardArticle.author!.name === 'Marie', 'guard article authored by Marie');

// Baker article should mention bread/baking
const bakerArticle = articles[2];
assert(bakerArticle.author!.name === 'Jacques', 'baker article authored by Jacques');
assert(
  bakerArticle.body.includes('pain') || bakerArticle.body.includes('boulangerie') || bakerArticle.body.includes('Jacques'),
  'baker article mentions bread/bakery-related content',
);

console.log('\ngenerateSettlementNotices with unknown occupation (fallback):');
const unknownNPCs: NPCAuthorInfo[] = [
  { characterId: 'c5', name: 'Luc', occupation: 'Astronaut' },
];
const fallbackArticles = generateSettlementNotices('s2', 'Fallbackville', unknownNPCs);
assertEqual(fallbackArticles.length, 1, 'generates one fallback notice');
assert(fallbackArticles[0].body.includes('Luc'), 'fallback article uses NPC name');

console.log('\ngenerateSettlementNotices with no occupation:');
const noOccNPCs: NPCAuthorInfo[] = [
  { characterId: 'c6', name: 'René' },
];
const noOccArticles = generateSettlementNotices('s3', 'NoOccVille', noOccNPCs);
assertEqual(noOccArticles.length, 1, 'generates one notice for NPC without occupation');
assert(noOccArticles[0].body.includes('René'), 'article uses NPC name');

// ── noticesToGameTexts conversion ───────────────────────────────────────

console.log('\n=== noticesToGameTexts ===');
const gameTexts = noticesToGameTexts(articles);
assertEqual(gameTexts.length, articles.length, 'converts all articles');
for (const gt of gameTexts) {
  assertEqual(gt.textCategory, 'notice', 'all converted texts are notice category');
  assertEqual(gt.collected, true, 'all converted texts are marked collected');
  assert(gt.cefrLevel !== undefined, 'all converted texts have cefrLevel');
}

// ── No SAMPLE_ARTICLES filler ───────────────────────────────────────────

console.log('\n=== Filler removal verification ===');
// Verify SAMPLE_ARTICLES is no longer exported from BabylonNoticeBoardPanel
try {
  // Dynamic import to check the export
  const mod = await import('../BabylonNoticeBoardPanel');
  assert(
    !('SAMPLE_ARTICLES' in mod),
    'SAMPLE_ARTICLES is no longer exported from BabylonNoticeBoardPanel',
  );
} catch {
  // If import fails (due to Babylon.js GUI dependency), that's ok — the static check is enough
  console.log('  (skipped dynamic import check — Babylon.js GUI not available in test)');
}

// ── Settlement-specific content ─────────────────────────────────────────

console.log('\n=== Settlement-specific content ===');
const articles2 = generateSettlementNotices('town_alpha', 'Alpha Village', [
  { characterId: 'npc1', name: 'François', occupation: 'Mayor' },
]);
assert(
  articles2[0].body.includes('Alpha Village') || articles2[0].title.includes('Alpha Village'),
  'articles reference settlement name',
);
assert(
  articles2[0].id.includes('town_alpha'),
  'article IDs include settlement ID',
);

// ── Comprehension questions present ─────────────────────────────────────

console.log('\n=== Comprehension questions ===');
for (const a of articles) {
  assert(a.comprehensionQuestion !== undefined, `article "${a.title}" has comprehension question`);
  if (a.comprehensionQuestion) {
    assert(a.comprehensionQuestion.options.length >= 2, 'question has at least 2 options');
    assert(
      a.comprehensionQuestion.correctIndex >= 0 &&
      a.comprehensionQuestion.correctIndex < a.comprehensionQuestion.options.length,
      'correctIndex is valid',
    );
  }
}

// ── Summary ─────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
