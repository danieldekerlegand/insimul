/**
 * Assessment prompt utilities (US-5.06)
 *
 * Builds tier-adaptive NPC system prompts and parses EVAL blocks from NPC responses.
 */

import type { CefrLevel } from '../../shared/assessment/assessment-types';

export type AssessmentTier = 'A1' | 'A2' | 'B1';

export interface CharacterProfile {
  name: string;
  role?: string;
  personality?: string;
}

export interface DimensionScores {
  vocab: number;     // 1–5
  grammar: number;   // 1–5
  fluency: number;   // 1–5
  pronunciation: number; // 1–5
  comprehension: number; // 1–5
}

const TIER_GUIDELINES: Record<AssessmentTier, { vocab: string; syntax: string; pace: string }> = {
  A1: {
    vocab: 'Use only basic, high-frequency vocabulary (greetings, numbers, colors, family, food).',
    syntax: 'Use short, simple sentences (subject-verb-object). Avoid subordinate clauses.',
    pace: 'Speak slowly, pause between sentences, and repeat key words naturally.',
  },
  A2: {
    vocab: 'Use everyday vocabulary including common verbs, adjectives, and basic connectors (and, but, because).',
    syntax: 'Use simple and compound sentences. Introduce occasional past and future tenses.',
    pace: 'Speak at a moderate pace with clear enunciation.',
  },
  B1: {
    vocab: 'Use a broad range of vocabulary including abstract terms and idiomatic expressions.',
    syntax: 'Use complex sentences with subordinate clauses, conditionals, and varied tenses.',
    pace: 'Speak at natural conversational speed.',
  },
};

/** Build a tier-adaptive system prompt for the assessment NPC */
export function buildAssessmentSystemPrompt(
  tier: AssessmentTier,
  characterProfile: CharacterProfile,
  targetLanguage: string,
): string {
  const g = TIER_GUIDELINES[tier];
  return [
    `You are ${characterProfile.name}${characterProfile.role ? `, a ${characterProfile.role}` : ''}.`,
    characterProfile.personality ? `Personality: ${characterProfile.personality}.` : '',
    '',
    `Speak primarily in ${targetLanguage}. Adapt to the learner's current tier (${tier}):`,
    `- Vocabulary: ${g.vocab}`,
    `- Syntax: ${g.syntax}`,
    `- Pace: ${g.pace}`,
    '',
    'After EVERY response, append a hidden evaluation block (the player will not see this):',
    '',
    '**ASSESSMENT_EVAL**',
    'vocab: <1-5>',
    'grammar: <1-5>',
    'fluency: <1-5>',
    'pronunciation: <1-5>',
    'comprehension: <1-5>',
    '**END_EVAL**',
    '',
    'Score the player\'s LAST message on each dimension (1 = no evidence, 5 = excellent).',
  ].filter(Boolean).join('\n');
}

/** Parse an ASSESSMENT_EVAL block from an NPC response */
export function parseAssessmentEvalBlock(npcResponse: string): {
  dimensions: DimensionScores | null;
  cleanedResponse: string;
} {
  const evalMatch = npcResponse.match(/\*\*ASSESSMENT_EVAL\*\*[\s\S]*?\*\*END_EVAL\*\*/);

  if (!evalMatch) {
    return { dimensions: null, cleanedResponse: npcResponse };
  }

  const block = evalMatch[0];
  const cleanedResponse = npcResponse.replace(/\*\*ASSESSMENT_EVAL\*\*[\s\S]*?\*\*END_EVAL\*\*/, '').trim();

  const vocabMatch = block.match(/vocab:\s*(\d)/);
  const grammarMatch = block.match(/grammar:\s*(\d)/);
  const fluencyMatch = block.match(/fluency:\s*(\d)/);
  const pronunciationMatch = block.match(/pronunciation:\s*(\d)/);
  const comprehensionMatch = block.match(/comprehension:\s*(\d)/);

  if (!vocabMatch || !grammarMatch || !fluencyMatch || !pronunciationMatch || !comprehensionMatch) {
    return { dimensions: null, cleanedResponse };
  }

  const clamp = (v: number) => Math.max(1, Math.min(5, v));

  return {
    dimensions: {
      vocab: clamp(parseInt(vocabMatch[1])),
      grammar: clamp(parseInt(grammarMatch[1])),
      fluency: clamp(parseInt(fluencyMatch[1])),
      pronunciation: clamp(parseInt(pronunciationMatch[1])),
      comprehension: clamp(parseInt(comprehensionMatch[1])),
    },
    cleanedResponse,
  };
}
