import { describe, it, expect } from 'vitest';

describe('shared/language module structure', () => {
  it('exports language types from barrel index', async () => {
    const mod = await import('@shared/language');
    // Core types from language.ts are re-exported
    expect(mod).toBeDefined();
  });

  it('exports language types from language.ts', async () => {
    const mod = await import('@shared/language/language');
    expect(mod).toBeDefined();
  });

  it('exports language-utils functions', async () => {
    const mod = await import('@shared/language/language-utils');
    expect(typeof mod.buildGreeting).toBe('function');
    expect(typeof mod.extractLanguageFluencies).toBe('function');
    expect(typeof mod.getLanguageBCP47).toBe('function');
    expect(typeof mod.buildLanguageAwareSystemPrompt).toBe('function');
    expect(typeof mod.buildWorldLanguageContext).toBe('function');
  });

  it('exports language-progress types', async () => {
    const mod = await import('@shared/language/language-progress');
    expect(typeof mod.parseGrammarFeedbackBlock).toBe('function');
  });

  it('exports language-gamification constants', async () => {
    const mod = await import('@shared/language/language-gamification');
    expect(mod.LEVEL_THRESHOLDS).toBeDefined();
    expect(Array.isArray(mod.LEVEL_THRESHOLDS)).toBe(true);
    expect(typeof mod.getLevelForXP).toBe('function');
  });

  it('exports language-skill-tree data', async () => {
    const mod = await import('@shared/language/language-skill-tree');
    expect(mod.SKILL_TIERS).toBeDefined();
    expect(Array.isArray(mod.SKILL_TIERS)).toBe(true);
  });

  it('exports language-vocabulary-corpus data', async () => {
    const mod = await import('@shared/language/language-vocabulary-corpus');
    expect(mod.VOCABULARY_CORPUS).toBeDefined();
  });

  it('exports language-quest-templates', async () => {
    const mod = await import('@shared/language/language-quest-templates');
    expect(mod.QUEST_TEMPLATES).toBeDefined();
    expect(Array.isArray(mod.QUEST_TEMPLATES)).toBe(true);
  });

  it('exports pronunciation-scoring functions', async () => {
    const mod = await import('@shared/language/pronunciation-scoring');
    expect(typeof mod.scorePronunciation).toBe('function');
    expect(typeof mod.formatPronunciationFeedback).toBe('function');
  });

  it('exports bilingual-name-generation functions', async () => {
    const mod = await import('@shared/language/bilingual-name-generation');
    expect(typeof mod.getBilingualBusinessName).toBe('function');
  });

  it('re-exports all submodules from barrel index', async () => {
    const barrel = await import('@shared/language');
    // Verify key exports from different submodules are available through the barrel
    expect(typeof barrel.buildGreeting).toBe('function');
    expect(typeof barrel.parseGrammarFeedbackBlock).toBe('function');
    expect(barrel.LEVEL_THRESHOLDS).toBeDefined();
    expect(barrel.SKILL_TIERS).toBeDefined();
    expect(barrel.VOCABULARY_CORPUS).toBeDefined();
    expect(barrel.QUEST_TEMPLATES).toBeDefined();
    expect(typeof barrel.scorePronunciation).toBe('function');
    expect(typeof barrel.getBilingualBusinessName).toBe('function');
  });
});
