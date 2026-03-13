/**
 * Assessment EVAL block parser and system prompt builder.
 *
 * Follows the same pattern as parseGrammarFeedbackBlock() in shared/language-progress.ts.
 */

import type { CefrLevel, AssessmentPhase } from '../../../shared/assessment/assessment-types';

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

/** The 5 scoring dimensions, each rated 1–5 */
export interface AssessmentDimensionScores {
  vocabulary: number;
  grammar: number;
  fluency: number;
  comprehension: number;
  taskCompletion: number;
}

export interface ParsedEvalBlock {
  scores: AssessmentDimensionScores | null;
  cleanedResponse: string;
}

// ───────────────────────────────────────────────────────────────────────────
// EVAL block parser
// ───────────────────────────────────────────────────────────────────────────

const EVAL_BLOCK_REGEX = /\*\*EVAL\*\*[\s\S]*?\*\*END_EVAL\*\*/;

const DIMENSION_PATTERNS: Record<keyof AssessmentDimensionScores, RegExp> = {
  vocabulary: /Vocabulary:\s*([1-5])/,
  grammar: /Grammar:\s*([1-5])/,
  fluency: /Fluency:\s*([1-5])/,
  comprehension: /Comprehension:\s*([1-5])/,
  taskCompletion: /TaskCompletion:\s*([1-5])/,
};

/**
 * Parse an EVAL block from an NPC assessment response.
 * Returns the parsed dimension scores and the response with the block removed.
 *
 * Expected format:
 * ```
 * **EVAL**
 * Vocabulary: 3
 * Grammar: 2
 * Fluency: 4
 * Comprehension: 3
 * TaskCompletion: 2
 * **END_EVAL**
 * ```
 */
export function parseAssessmentEvalBlock(response: string): ParsedEvalBlock {
  const evalMatch = response.match(EVAL_BLOCK_REGEX);

  if (!evalMatch) {
    return { scores: null, cleanedResponse: response };
  }

  const block = evalMatch[0];
  const cleanedResponse = response.replace(EVAL_BLOCK_REGEX, '').trim();

  const scores: Partial<AssessmentDimensionScores> = {};
  let validCount = 0;

  for (const [key, regex] of Object.entries(DIMENSION_PATTERNS) as Array<[keyof AssessmentDimensionScores, RegExp]>) {
    const match = block.match(regex);
    if (match) {
      scores[key] = parseInt(match[1], 10) as 1 | 2 | 3 | 4 | 5;
      validCount++;
    }
  }

  // All 5 dimensions must be present for a valid parse
  if (validCount < 5) {
    return { scores: null, cleanedResponse };
  }

  return {
    scores: scores as AssessmentDimensionScores,
    cleanedResponse,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// System prompt builder
// ───────────────────────────────────────────────────────────────────────────

/** Tier-specific dialogue rules for assessment NPCs */
const TIER_INSTRUCTIONS: Record<CefrLevel, string> = {
  A1: `The player is a BEGINNER (A1). You MUST:
- Use 80-90% English in your responses
- Introduce only 1-2 new target language words per message
- Provide English translations immediately after target language words
- Use very short, simple sentences (5-7 words)
- Be extremely encouraging and patient
- Use gestures and body language descriptions
- Speak slowly with short sentences separated by periods`,

  A2: `The player is ELEMENTARY (A2). You should:
- Use 30-50% target language in your responses
- Use short sentences with English translations nearby
- Introduce 2-4 new words per message
- Gently correct at most 1 error per message
- Be warm and encouraging
- Use common everyday vocabulary`,

  B1: `The player is INTERMEDIATE (B1). You should:
- Use 50-70% target language in your responses
- Use full sentences in the target language
- Introduce 3-5 new words including some idioms
- Correct up to 2 errors with brief explanations
- Only translate unusual or new words to English
- Use moderately complex sentence structures`,

  B2: `The player is UPPER INTERMEDIATE (B2). You should:
- Use 80-95% target language in your responses
- Speak naturally with idioms, humor, and cultural references
- Correct errors with detailed explanations
- Only use English for truly complex explanations
- Challenge the player with varied vocabulary and structures
- Use longer, complex sentences at natural speed`,
};

const EVAL_BLOCK_INSTRUCTIONS = `
After EVERY player message, you MUST append an EVAL block (hidden from the player).
Rate each dimension 1-5 based on the player's most recent message:

**EVAL**
Vocabulary: [1-5]
Grammar: [1-5]
Fluency: [1-5]
Comprehension: [1-5]
TaskCompletion: [1-5]
**END_EVAL**

Scoring guide:
1 = No evidence of ability
2 = Minimal/struggling
3 = Adequate with notable errors
4 = Good with minor errors
5 = Excellent/native-like`;

/**
 * Build a tier-adaptive system prompt for an assessment NPC.
 *
 * @param cefrLevel - Current estimated CEFR level of the player
 * @param phase - The assessment phase being conducted
 * @param targetLanguage - The language being assessed
 * @param cityName - The city/settlement name for context
 */
export function buildAssessmentSystemPrompt(
  cefrLevel: CefrLevel,
  phase: AssessmentPhase,
  targetLanguage: string,
  cityName: string,
): string {
  // Resolve template variables in the phase system prompt
  const basePrompt = phase.systemPromptTemplate
    ? phase.systemPromptTemplate
        .replace(/\{\{targetLanguage\}\}/g, targetLanguage)
        .replace(/\{\{cityName\}\}/g, cityName)
    : `You are a friendly local in ${cityName} who speaks ${targetLanguage}. Conduct the "${phase.name}" phase of a language assessment through natural interaction.`;

  const tierRules = TIER_INSTRUCTIONS[cefrLevel];

  let prompt = `${basePrompt}

ASSESSMENT CONTEXT:
- Phase: ${phase.name} (${phase.order} of 4)
- Max score this phase: ${phase.maxScore} points
- Tasks: ${phase.tasks.map(t => t.title).join(', ')}

LANGUAGE ADAPTATION:
${tierRules}

IMPORTANT RULES:
- Stay in character at all times — you are a real person, not an examiner
- Naturally guide the conversation to cover all tasks for this phase
- Do NOT tell the player they are being assessed
- Adapt your language complexity based on the player's responses
- If the player struggles, simplify; if they excel, increase complexity
${EVAL_BLOCK_INSTRUCTIONS}`;

  if (phase.timeLimitSeconds) {
    const minutes = Math.round(phase.timeLimitSeconds / 60);
    prompt += `\n\nTIME: This phase should take about ${minutes} minutes. Keep the conversation moving.`;
  }

  return prompt;
}
