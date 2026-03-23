/**
 * Tests for HoverTranslationSystem
 *
 * Run with: npx tsx client/src/components/3DGame/HoverTranslationSystem.test.ts
 */

import { HoverTranslationSystem } from './HoverTranslationSystem';
import type { VocabHint } from './HoverTranslationSystem';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  assert(actual === expected, `${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`);
}

// --- Tests ---

function testAddAndGetVocabHints() {
  console.log('\n== Add and get vocab hints ==');
  const sys = new HoverTranslationSystem();

  sys.addVocabHints([
    { word: 'Bonjour', translation: 'Hello', context: 'greeting' },
    { word: 'merci', translation: 'thank you' },
  ]);

  assertEqual(sys.size, 2, 'Should have 2 translations');

  const hint = sys.getTranslation('bonjour');
  assert(hint !== null, 'Should find "bonjour" (case-insensitive)');
  assertEqual(hint!.translation, 'Hello', 'Translation matches');
  assertEqual(hint!.context, 'greeting', 'Context matches');

  const hint2 = sys.getTranslation('Merci');
  assert(hint2 !== null, 'Should find "Merci" (case-insensitive)');
  assertEqual(hint2!.translation, 'thank you', 'Translation matches');
}

function testGetTranslationWithPunctuation() {
  console.log('\n== Get translation with punctuation ==');
  const sys = new HoverTranslationSystem();

  sys.addVocabHints([
    { word: 'hola', translation: 'hello' },
  ]);

  const hint = sys.getTranslation('hola!');
  assert(hint !== null, 'Should find "hola!" stripping punctuation');
  assertEqual(hint!.translation, 'hello', 'Translation matches');

  const hint2 = sys.getTranslation('"hola"');
  assert(hint2 !== null, 'Should find with quotes stripped');

  const hint3 = sys.getTranslation('¿hola?');
  assert(hint3 !== null, 'Should find with Spanish punctuation stripped');
}

function testTokenize() {
  console.log('\n== Tokenize text ==');
  const sys = new HoverTranslationSystem();

  const tokens = sys.tokenize('Bonjour, comment allez-vous?');
  assert(tokens.length > 0, 'Should produce tokens');

  const words = tokens.filter(t => t.isWord);
  assert(words.length >= 3, `Should have at least 3 words (got ${words.length})`);
  assertEqual(words[0].text, 'Bonjour,', 'First word is "Bonjour,"');

  const spaces = tokens.filter(t => !t.isWord);
  assert(spaces.length > 0, 'Should have whitespace tokens');
}

function testTokenizePreservesWhitespace() {
  console.log('\n== Tokenize preserves whitespace ==');
  const sys = new HoverTranslationSystem();

  const tokens = sys.tokenize('Hello  world');
  const texts = tokens.map(t => t.text);
  assertEqual(texts.join(''), 'Hello  world', 'Reassembled text matches original');
}

function testStripPunctuation() {
  console.log('\n== Strip punctuation ==');
  const sys = new HoverTranslationSystem();

  assertEqual(sys.stripPunctuation('hello!'), 'hello', 'Strips trailing !');
  assertEqual(sys.stripPunctuation('"world"'), 'world', 'Strips quotes');
  assertEqual(sys.stripPunctuation('¿Cómo?'), 'Cómo', 'Strips Spanish punctuation');
  assertEqual(sys.stripPunctuation('café'), 'café', 'Preserves accented characters');
  assertEqual(sys.stripPunctuation('...'), '', 'All punctuation becomes empty');
}

function testIsLikelyTargetLanguage() {
  console.log('\n== Is likely target language ==');
  const sys = new HoverTranslationSystem();
  sys.setTargetLanguage('Spanish');

  // Common English words should not be flagged
  assert(!sys.isLikelyTargetLanguage('the'), '"the" is not target language');
  assert(!sys.isLikelyTargetLanguage('is'), '"is" is not target language');
  assert(!sys.isLikelyTargetLanguage('I'), '"I" is not target language (single char)');
  assert(!sys.isLikelyTargetLanguage(''), 'empty string is not target language');

  // Words with non-ASCII characters are likely target language
  assert(sys.isLikelyTargetLanguage('café'), '"café" has non-ASCII, likely target');
  assert(sys.isLikelyTargetLanguage('niño'), '"niño" has non-ASCII, likely target');

  // Words with known translations are target language
  sys.addVocabHints([{ word: 'hola', translation: 'hello' }]);
  assert(sys.isLikelyTargetLanguage('hola'), '"hola" has translation, is target');
}

function testClear() {
  console.log('\n== Clear translations ==');
  const sys = new HoverTranslationSystem();
  sys.addVocabHints([
    { word: 'test', translation: 'prueba' },
  ]);
  assertEqual(sys.size, 1, 'Should have 1 translation before clear');
  sys.clear();
  assertEqual(sys.size, 0, 'Should have 0 translations after clear');
  assert(sys.getTranslation('test') === null, 'Translation should be null after clear');
}

function testDuplicateHintsOverwrite() {
  console.log('\n== Duplicate hints overwrite ==');
  const sys = new HoverTranslationSystem();

  sys.addVocabHints([
    { word: 'hola', translation: 'hello' },
  ]);
  sys.addVocabHints([
    { word: 'hola', translation: 'hi (informal)', context: 'casual greeting' },
  ]);

  assertEqual(sys.size, 1, 'Should still have 1 translation (overwritten)');
  const hint = sys.getTranslation('hola');
  assertEqual(hint!.translation, 'hi (informal)', 'Should use latest translation');
  assertEqual(hint!.context, 'casual greeting', 'Should use latest context');
}

function testSkipsInvalidHints() {
  console.log('\n== Skips invalid hints ==');
  const sys = new HoverTranslationSystem();

  sys.addVocabHints([
    { word: '', translation: 'empty word' },
    { word: 'valid', translation: '' },
    { word: 'good', translation: 'bueno' },
  ] as VocabHint[]);

  assertEqual(sys.size, 1, 'Should only add valid hint');
  assert(sys.getTranslation('good') !== null, 'Valid hint should exist');
}

function testGetAllTranslations() {
  console.log('\n== Get all translations ==');
  const sys = new HoverTranslationSystem();

  sys.addVocabHints([
    { word: 'hola', translation: 'hello' },
    { word: 'adiós', translation: 'goodbye' },
  ]);

  const all = sys.getAllTranslations();
  assertEqual(all.size, 2, 'Should return 2 translations');
  assert(all.has('hola'), 'Should have "hola"');
  assert(all.has('adiós'), 'Should have "adiós"');
}

function testSetAndGetTargetLanguage() {
  console.log('\n== Set and get target language ==');
  const sys = new HoverTranslationSystem();

  assertEqual(sys.getTargetLanguage(), null, 'Initially null');
  sys.setTargetLanguage('French');
  assertEqual(sys.getTargetLanguage(), 'French', 'Should be French after set');
}

function testTokenizeEmptyString() {
  console.log('\n== Tokenize empty string ==');
  const sys = new HoverTranslationSystem();
  const tokens = sys.tokenize('');
  assertEqual(tokens.length, 0, 'Empty string produces no tokens');
}

function testTokenizeSingleWord() {
  console.log('\n== Tokenize single word ==');
  const sys = new HoverTranslationSystem();
  const tokens = sys.tokenize('Bonjour');
  assertEqual(tokens.length, 1, 'Single word produces 1 token');
  assertEqual(tokens[0].text, 'Bonjour', 'Token text matches');
  assert(tokens[0].isWord, 'Token is a word');
}

// --- Run all tests ---

testAddAndGetVocabHints();
testGetTranslationWithPunctuation();
testTokenize();
testTokenizePreservesWhitespace();
testStripPunctuation();
testIsLikelyTargetLanguage();
testClear();
testDuplicateHintsOverwrite();
testSkipsInvalidHints();
testGetAllTranslations();
testSetAndGetTargetLanguage();
testTokenizeEmptyString();
testTokenizeSingleWord();

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
