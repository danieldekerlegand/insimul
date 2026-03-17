/**
 * Tests for assessment-prompt-utils
 *
 * Run with: npx tsx client/src/assessment/assessment-prompt-utils.test.ts
 */

import { parseAssessmentEvalBlock, buildAssessmentSystemPrompt } from './assessment-prompt-utils';
import type { CefrLevel, AssessmentPhase } from '../../../shared/assessment/assessment-types';

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

function assertDeepEqual(actual: unknown, expected: unknown, message: string) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), message);
}

// ───────────────────────────────────────────────────────────────────────────
// parseAssessmentEvalBlock tests
// ───────────────────────────────────────────────────────────────────────────

console.log('\n=== parseAssessmentEvalBlock ===\n');

// Valid full block
{
  const response = `Bonjour! Bienvenue à Paris! Comment puis-je vous aider?

**EVAL**
Vocabulary: 3
Grammar: 2
Fluency: 4
Comprehension: 3
TaskCompletion: 2
**END_EVAL**`;

  const result = parseAssessmentEvalBlock(response);
  assert(result.scores !== null, 'parses valid EVAL block');
  assertDeepEqual(result.scores, {
    vocabulary: 3,
    grammar: 2,
    fluency: 4,
    comprehension: 3,
    taskCompletion: 2,
  }, 'extracts correct dimension scores');
  assert(result.cleanedResponse === 'Bonjour! Bienvenue à Paris! Comment puis-je vous aider?', 'removes EVAL block from response');
}

// No EVAL block
{
  const response = 'Just a normal response with no eval block.';
  const result = parseAssessmentEvalBlock(response);
  assert(result.scores === null, 'returns null scores when no EVAL block');
  assert(result.cleanedResponse === response, 'returns original response unchanged');
}

// Partial block (missing dimensions)
{
  const response = `Hello!

**EVAL**
Vocabulary: 3
Grammar: 2
**END_EVAL**`;

  const result = parseAssessmentEvalBlock(response);
  assert(result.scores === null, 'returns null for incomplete EVAL block (missing dimensions)');
  assert(result.cleanedResponse === 'Hello!', 'still removes incomplete EVAL block from response');
}

// EVAL block at start of response
{
  const response = `**EVAL**
Vocabulary: 5
Grammar: 5
Fluency: 5
Comprehension: 5
TaskCompletion: 5
**END_EVAL**
Excellent work!`;

  const result = parseAssessmentEvalBlock(response);
  assert(result.scores !== null, 'parses EVAL block at start of response');
  assert(result.scores!.vocabulary === 5, 'max score parsed correctly');
  assert(result.cleanedResponse === 'Excellent work!', 'cleaned response has no leading/trailing whitespace');
}

// EVAL block with extra whitespace
{
  const response = `Response text.

**EVAL**
Vocabulary:   1
Grammar:  1
Fluency: 1
Comprehension:    1
TaskCompletion:1
**END_EVAL**`;

  const result = parseAssessmentEvalBlock(response);
  assert(result.scores !== null, 'handles extra whitespace in dimension lines');
  assert(result.scores!.vocabulary === 1, 'min score parsed correctly');
  assert(result.scores!.taskCompletion === 1, 'no-space before score parsed correctly');
}

// Invalid score values (out of range)
{
  const response = `**EVAL**
Vocabulary: 6
Grammar: 0
Fluency: 3
Comprehension: 3
TaskCompletion: 3
**END_EVAL**`;

  const result = parseAssessmentEvalBlock(response);
  assert(result.scores === null, 'rejects scores outside 1-5 range');
}

// Empty string
{
  const result = parseAssessmentEvalBlock('');
  assert(result.scores === null, 'handles empty string');
  assert(result.cleanedResponse === '', 'returns empty cleaned response for empty input');
}

// ───────────────────────────────────────────────────────────────────────────
// buildAssessmentSystemPrompt tests
// ───────────────────────────────────────────────────────────────────────────

console.log('\n=== buildAssessmentSystemPrompt ===\n');

const testPhase: AssessmentPhase = {
  id: 'conversation',
  name: 'Conversation',
  type: 'conversation',
  order: 1,
  maxScore: 25,
  description: 'Have a conversation with a local resident.',
  timeLimitSeconds: 600,
  systemPromptTemplate: 'You are a friendly local in {{cityName}} who speaks {{targetLanguage}}. Help the traveler.',
  tasks: [
    { id: 'conv_greeting', title: 'Greeting', description: 'Exchange greetings', prompt: 'Greet the visitor', maxScore: 5, dimensionId: 'vocabulary' },
    { id: 'conv_directions', title: 'Directions', description: 'Navigate directions', prompt: 'Give directions', maxScore: 5, dimensionId: 'fluency' },
  ],
};

// Template variable replacement
{
  const prompt = buildAssessmentSystemPrompt('A1', testPhase, 'French', 'Paris');
  assert(prompt.includes('Paris'), 'replaces {{cityName}} template variable');
  assert(prompt.includes('French'), 'replaces {{targetLanguage}} template variable');
  assert(!prompt.includes('{{'), 'no unresolved template variables remain');
}

// Tier-specific content
{
  const a1Prompt = buildAssessmentSystemPrompt('A1', testPhase, 'French', 'Paris');
  assert(a1Prompt.includes('BEGINNER'), 'A1 prompt contains BEGINNER tier instructions');
  assert(a1Prompt.includes('80-90% English'), 'A1 prompt specifies high English usage');

  const b2Prompt = buildAssessmentSystemPrompt('B2', testPhase, 'French', 'Paris');
  assert(b2Prompt.includes('UPPER INTERMEDIATE'), 'B2 prompt contains UPPER INTERMEDIATE tier instructions');
  assert(b2Prompt.includes('80-95% target language'), 'B2 prompt specifies high target language usage');
}

// EVAL block instructions included
{
  const prompt = buildAssessmentSystemPrompt('B1', testPhase, 'Spanish', 'Madrid');
  assert(prompt.includes('**EVAL**'), 'prompt includes EVAL block format');
  assert(prompt.includes('**END_EVAL**'), 'prompt includes END_EVAL marker');
  assert(prompt.includes('Vocabulary: [1-5]'), 'prompt includes scoring dimensions');
  assert(prompt.includes('TaskCompletion: [1-5]'), 'prompt includes TaskCompletion dimension');
}

// Phase context included
{
  const prompt = buildAssessmentSystemPrompt('A2', testPhase, 'German', 'Berlin');
  assert(prompt.includes('Phase: Conversation'), 'prompt includes phase name');
  assert(prompt.includes('25 points'), 'prompt includes max score');
  assert(prompt.includes('Greeting'), 'prompt includes task titles');
  assert(prompt.includes('10 minutes'), 'prompt includes time limit');
}

// Phase without system prompt template
{
  const noTemplatePhase: AssessmentPhase = {
    id: 'listening',
    name: 'Listening',
    type: 'listening',
    order: 2,
    maxScore: 7,
    description: 'Listen and answer comprehension questions.',
    tasks: [
      { id: 'listen_1', title: 'Follow Directions', description: 'Follow spoken directions', prompt: 'Listen and follow directions', maxScore: 4, dimensionId: 'comprehension' },
    ],
  };
  const prompt = buildAssessmentSystemPrompt('A1', noTemplatePhase, 'French', 'Lyon');
  assert(prompt.includes('Lyon'), 'fallback prompt includes city name');
  assert(prompt.includes('French'), 'fallback prompt includes target language');
  assert(prompt.includes('Listening'), 'fallback prompt includes phase name');
}

// All CEFR levels produce valid prompts
{
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2'];
  for (const level of levels) {
    const prompt = buildAssessmentSystemPrompt(level, testPhase, 'Italian', 'Rome');
    assert(prompt.length > 100, `${level} prompt is non-trivial (${prompt.length} chars)`);
    assert(prompt.includes('EVAL'), `${level} prompt includes EVAL instructions`);
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Summary
// ───────────────────────────────────────────────────────────────────────────

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(40)}\n`);

process.exit(failed > 0 ? 1 : 0);
