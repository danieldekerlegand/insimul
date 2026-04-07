import { describe, it, expect } from 'vitest';
import { buildLanguageAwareSystemPrompt } from '../language/utils';
import type { CEFRLevel } from '../assessment/cefr-mapping';

/**
 * US-005: Wire NPC language mode and vocabulary frequency into conversation prompts
 *
 * Tests that buildLanguageAwareSystemPrompt() includes NPC language mode directives
 * and vocabulary frequency constraints based on the player's CEFR level.
 */

const makeCharacter = (id: string = 'npc_baker_01') => ({
  id,
  firstName: 'Pierre',
  lastName: 'Dupont',
  age: 45,
  gender: 'male' as const,
  occupation: 'Baker',
  currentLocation: 'Boulangerie',
  personality: { openness: 0.7 },
  friendIds: [],
  coworkerIds: [],
  spouseId: null,
});

const makeWorldContext = () => ({
  targetLanguage: 'French',
  worldLanguages: [],
  primaryLanguage: null,
  learningTargetLanguage: null,
  gameType: 'language-learning',
});

const makeWorldInfo = () => ({
  id: 'world-1',
  name: 'Test World',
  worldType: 'educational',
  gameType: 'language-learning',
  targetLanguage: 'French',
});

describe('US-005: NPC language mode and vocabulary frequency in system prompts', () => {
  it('A1 player prompt contains simplified mode directive and frequency constraint 1-200', () => {
    const cefrLevel: CEFRLevel = 'A1';
    const prompt = buildLanguageAwareSystemPrompt(
      makeCharacter(),
      [],
      makeWorldContext(),
      makeWorldInfo(),
      undefined,
      cefrLevel,
    );

    // Should contain a language mode directive (bilingual or simplified at A1)
    expect(
      prompt.includes('LANGUAGE MODE — SIMPLIFIED') || prompt.includes('LANGUAGE MODE — BILINGUAL'),
    ).toBe(true);

    // Should contain vocabulary frequency constraint for top 200 words
    expect(prompt).toContain('VOCABULARY FREQUENCY CONSTRAINT');
    expect(prompt).toContain('top 200 most common words');
  });

  it('B2 player prompt contains natural mode directive and no restrictive frequency constraint', () => {
    const cefrLevel: CEFRLevel = 'B2';
    const prompt = buildLanguageAwareSystemPrompt(
      makeCharacter(),
      [],
      makeWorldContext(),
      makeWorldInfo(),
      undefined,
      cefrLevel,
    );

    // B2 should always be natural mode
    expect(prompt).toContain('LANGUAGE MODE — NATURAL');

    // B2 should have full-range vocabulary, not restrictive frequency constraint
    expect(prompt).toContain('VOCABULARY RANGE');
    expect(prompt).toContain('full range');
    // Should NOT contain the restrictive constraint header
    expect(prompt).not.toContain('VOCABULARY FREQUENCY CONSTRAINT');
  });

  it('prompt without cefrLevel does not contain language mode directive', () => {
    const prompt = buildLanguageAwareSystemPrompt(
      makeCharacter(),
      [],
      makeWorldContext(),
      makeWorldInfo(),
      undefined,
      undefined,
    );

    expect(prompt).not.toContain('LANGUAGE MODE —');
    expect(prompt).not.toContain('VOCABULARY FREQUENCY CONSTRAINT');
    expect(prompt).not.toContain('VOCABULARY RANGE');
  });

  it('A2 player prompt contains frequency constraint with 201-500 range', () => {
    const cefrLevel: CEFRLevel = 'A2';
    const prompt = buildLanguageAwareSystemPrompt(
      makeCharacter(),
      [],
      makeWorldContext(),
      makeWorldInfo(),
      undefined,
      cefrLevel,
    );

    // A2 should contain frequency constraint for top 500 words
    expect(prompt).toContain('VOCABULARY FREQUENCY CONSTRAINT');
    expect(prompt).toContain('top 500 most common words');
  });

  it('non-language-learning world does not include language mode directives', () => {
    const worldContext = {
      ...makeWorldContext(),
      gameType: 'sandbox',
      targetLanguage: 'English',
    };
    const worldInfo = {
      ...makeWorldInfo(),
      gameType: 'sandbox',
      targetLanguage: 'English',
    };

    const prompt = buildLanguageAwareSystemPrompt(
      makeCharacter(),
      [],
      worldContext,
      worldInfo,
      undefined,
      'A1',
    );

    expect(prompt).not.toContain('LANGUAGE MODE —');
  });
});
