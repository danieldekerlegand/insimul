import { describe, it, expect } from 'vitest';
import {
  assignNPCLanguageMode,
  getNPCLanguageBehavior,
  buildLanguageModeDirective,
} from '../language/cefr-adaptation';
import { buildPlayerProficiencySection } from '../language/utils';
import type { CEFRLevel } from '../assessment/cefr-mapping';

// ── NPC language mode updates with CEFR level ──────────────────────────────

describe('NPC language mode re-evaluation on CEFR change', () => {
  const testNpcId = 'npc_baker_01';
  const targetLanguage = 'French';

  it('assignNPCLanguageMode returns different modes for different CEFR levels', () => {
    // At A1, NPCs use bilingual/simplified (no natural)
    const a1Modes = Array.from({ length: 50 }, (_, i) =>
      assignNPCLanguageMode('A1', `npc_${i}`),
    );
    const a1Natural = a1Modes.filter(m => m === 'natural').length;
    expect(a1Natural).toBe(0);

    // At B2, NPCs use 100% natural
    const b2Modes = Array.from({ length: 50 }, (_, i) =>
      assignNPCLanguageMode('B2', `npc_${i}`),
    );
    expect(b2Modes.every(m => m === 'natural')).toBe(true);
  });

  it('same NPC changes language mode when player CEFR level advances', () => {
    // Simulate a player talking to the same NPC at different levels
    const modeA1 = assignNPCLanguageMode('A1', testNpcId);
    const modeB1 = assignNPCLanguageMode('B1', testNpcId);
    const modeB2 = assignNPCLanguageMode('B2', testNpcId);

    // B2 should always be natural
    expect(modeB2).toBe('natural');
    // B1 should be more natural than A1 (or at worst the same)
    // The key check: B2 is definitely different from typical A1 modes
    expect(['bilingual', 'simplified']).toContain(modeA1);
  });

  it('getNPCLanguageBehavior produces correct directive for each level', () => {
    const behaviorA1 = getNPCLanguageBehavior('A1', testNpcId, targetLanguage);
    const behaviorB2 = getNPCLanguageBehavior('B2', testNpcId, targetLanguage);

    // A1 should have bilingual/simplified directive
    expect(behaviorA1.promptDirective).toBeTruthy();
    expect(behaviorA1.languageMode).not.toBe('natural');

    // B2 should have natural directive
    expect(behaviorB2.languageMode).toBe('natural');
    expect(behaviorB2.promptDirective).toContain('natural');
  });

  it('getNPCLanguageBehavior is not cached — calling with new level returns new behavior', () => {
    // Call for A1
    const first = getNPCLanguageBehavior('A1', testNpcId, targetLanguage);
    // Call for B2 — should reflect new level, not stale cache
    const second = getNPCLanguageBehavior('B2', testNpcId, targetLanguage);

    expect(first.languageMode).not.toBe('natural');
    expect(second.languageMode).toBe('natural');
    expect(first.promptDirective).not.toBe(second.promptDirective);
  });

  it('buildLanguageModeDirective changes with CEFR level', () => {
    const directiveA1 = buildLanguageModeDirective('bilingual', targetLanguage);
    const directiveB2 = buildLanguageModeDirective('natural', targetLanguage);

    expect(directiveA1).not.toBe(directiveB2);
    expect(directiveA1.toUpperCase()).toContain('BILINGUAL');
    expect(directiveB2.toUpperCase()).toContain('NATURAL');
  });
});

// ── buildPlayerProficiencySection includes CEFR language mode ───────────────

describe('buildPlayerProficiencySection passes CEFR to NPC behavior', () => {
  const baseProficiency = {
    overallFluency: 30,
    vocabularyCount: 50,
    masteredWordCount: 10,
    weakGrammarPatterns: [] as string[],
    strongGrammarPatterns: [] as string[],
    conversationCount: 5,
  };

  it('includes NPC language mode directive when cefrLevel and npcId provided', () => {
    const section = buildPlayerProficiencySection(
      baseProficiency, 'French', 'baker', 'A1', 'npc_baker_01'
    );

    // Should contain language mode directive from getNPCLanguageBehavior
    expect(section).toMatch(/bilingual|simplified|natural/i);
  });

  it('omits NPC language mode when cefrLevel is missing', () => {
    const section = buildPlayerProficiencySection(
      baseProficiency, 'French', 'baker', null, 'npc_baker_01'
    );

    // Should still have proficiency info but not language mode
    expect(section).toContain('PLAYER LANGUAGE PROFICIENCY');
    // Without cefrLevel, the specific NPC mode directive block should be absent
    expect(section).not.toMatch(/LANGUAGE MODE:/);
  });

  it('directive changes when cefrLevel changes for same NPC', () => {
    const sectionA1 = buildPlayerProficiencySection(
      baseProficiency, 'French', 'baker', 'A1', 'npc_baker_01'
    );
    const sectionB2 = buildPlayerProficiencySection(
      baseProficiency, 'French', 'baker', 'B2', 'npc_baker_01'
    );

    // B2 section should have natural mode, A1 should not
    expect(sectionB2).toContain('natural');
    // They should be different because the mode changed
    expect(sectionA1).not.toBe(sectionB2);
  });
});

// ── Full flow: CEFR level progression affects NPC behavior ──────────────────

describe('full CEFR progression flow', () => {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
  const npcId = 'npc_teacher_01';
  const targetLanguage = 'French';

  it('NPC behavior progressively shifts toward more target language', () => {
    const behaviors = levels.map(level => getNPCLanguageBehavior(level, npcId, targetLanguage));

    // A1 should not be natural
    expect(behaviors[0].languageMode).not.toBe('natural');
    // B2 should be natural
    expect(behaviors[3].languageMode).toBe('natural');
  });

  it('mode naturally updates when called with new cefrLevel (no manual reset needed)', () => {
    // Simulate player starting at A1, advancing to A2, then B1
    const mode1 = getNPCLanguageBehavior('A1', npcId, targetLanguage);
    const mode2 = getNPCLanguageBehavior('A2', npcId, targetLanguage);
    const mode3 = getNPCLanguageBehavior('B1', npcId, targetLanguage);

    // Each call with a new level should return behavior for that level
    // Not stale behavior from first call
    expect(mode1.languageMode).not.toBe('natural');
    // B1 should have more natural than A1 — at minimum the directive changes
    expect(mode3.promptDirective).not.toBe(mode1.promptDirective);
  });
});
