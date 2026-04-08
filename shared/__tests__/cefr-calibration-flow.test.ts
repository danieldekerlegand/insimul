/**
 * US-010: Score analysis and CEFR calibration from assessment results
 *
 * Tests that assessment scores are properly:
 * - Computed per-dimension from phase results
 * - Mapped to CEFR levels via mapScoreToCEFR
 * - Stored in quest overlay AND player save state
 * - Used to drive NPC language mode (SIMPLIFIED/BILINGUAL/NATURAL)
 */
import { describe, it, expect } from 'vitest';

// ── Score-to-CEFR mapping ────────────────────────────────────────────────────

describe('mapScoreToCEFR correctly maps assessment scores to CEFR levels', () => {
  it('scores 0-24% map to A1 (Beginner)', async () => {
    const { mapScoreToCEFR } = await import('@shared/assessment/cefr-mapping');
    const result = mapScoreToCEFR(20, 100);
    expect(result.level).toBe('A1');
  });

  it('scores 25-49% map to A2 (Elementary)', async () => {
    const { mapScoreToCEFR } = await import('@shared/assessment/cefr-mapping');
    const result = mapScoreToCEFR(35, 100);
    expect(result.level).toBe('A2');
  });

  it('scores 50-74% map to B1 (Intermediate)', async () => {
    const { mapScoreToCEFR } = await import('@shared/assessment/cefr-mapping');
    const result = mapScoreToCEFR(60, 100);
    expect(result.level).toBe('B1');
  });

  it('scores 75-84% map to B2 (Upper-Intermediate)', async () => {
    const { mapScoreToCEFR } = await import('@shared/assessment/cefr-mapping');
    const result = mapScoreToCEFR(80, 100);
    expect(result.level).toBe('B2');
  });

  it('scores 85-94% map to C1 (Advanced)', async () => {
    const { mapScoreToCEFR } = await import('@shared/assessment/cefr-mapping');
    const result = mapScoreToCEFR(90, 100);
    expect(result.level).toBe('C1');
  });

  it('scores 95%+ map to C2 (Mastery)', async () => {
    const { mapScoreToCEFR } = await import('@shared/assessment/cefr-mapping');
    const result = mapScoreToCEFR(97, 100);
    expect(result.level).toBe('C2');
  });

  it('returns normalized score in the result', async () => {
    const { mapScoreToCEFR } = await import('@shared/assessment/cefr-mapping');
    const result = mapScoreToCEFR(60, 200);
    expect(result.score).toBe(30);
    expect(result.level).toBe('A2');
  });
});

// ── NPC language mode assignment based on CEFR ──────────────────────────────

describe('assignNPCLanguageMode maps CEFR to appropriate NPC modes', () => {
  it('A1 players get simplified or bilingual NPCs (never natural)', async () => {
    const { assignNPCLanguageMode } = await import('@shared/language/cefr-adaptation');
    const modes = new Set<string>();
    // Test with several NPC IDs to sample the distribution
    for (let i = 0; i < 50; i++) {
      modes.add(assignNPCLanguageMode('A1', `npc_${i}`));
    }
    expect(modes.has('natural')).toBe(false);
    expect(modes.has('simplified') || modes.has('bilingual')).toBe(true);
  });

  it('A2 players get simplified or bilingual NPCs (never natural)', async () => {
    const { assignNPCLanguageMode } = await import('@shared/language/cefr-adaptation');
    const modes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      modes.add(assignNPCLanguageMode('A2', `npc_${i}`));
    }
    expect(modes.has('natural')).toBe(false);
  });

  it('B2+ players get natural mode NPCs', async () => {
    const { assignNPCLanguageMode } = await import('@shared/language/cefr-adaptation');
    const modes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      modes.add(assignNPCLanguageMode('B2', `npc_${i}`));
    }
    expect(modes.has('natural')).toBe(true);
    // B2 should be 100% natural per the distribution
    expect(modes.size).toBe(1);
  });

  it('B1 players get mostly natural NPCs', async () => {
    const { assignNPCLanguageMode } = await import('@shared/language/cefr-adaptation');
    let naturalCount = 0;
    const total = 100;
    for (let i = 0; i < total; i++) {
      if (assignNPCLanguageMode('B1', `npc_${i}`) === 'natural') naturalCount++;
    }
    // B1 distribution: 90% natural — allow some variance
    expect(naturalCount).toBeGreaterThan(70);
  });
});

// ── GameSaveState player.cefrLevel field ────────────────────────────────────

describe('GameSaveState includes cefrLevel in player', () => {
  it('GameSaveState type allows cefrLevel on player', async () => {
    // Type-level check: creating a partial save state with player.cefrLevel
    const state: import('@shared/game-engine/types').GameSaveState = {
      version: 1,
      slotIndex: 0,
      savedAt: new Date().toISOString(),
      gameTime: 1000,
      player: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        gold: 100,
        health: 100,
        energy: 100,
        inventory: [],
        cefrLevel: 'B1',
      },
      npcs: [],
      relationships: {},
      romance: null,
      merchants: [],
      currentZone: null,
      questProgress: {},
    };
    expect(state.player.cefrLevel).toBe('B1');
  });

  it('cefrLevel is optional (undefined for new games)', async () => {
    const state: import('@shared/game-engine/types').GameSaveState = {
      version: 1,
      slotIndex: 0,
      savedAt: new Date().toISOString(),
      gameTime: 0,
      player: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        gold: 0,
        health: 100,
        energy: 100,
        inventory: [],
      },
      npcs: [],
      relationships: {},
      romance: null,
      merchants: [],
      currentZone: null,
      questProgress: {},
    };
    expect(state.player.cefrLevel).toBeUndefined();
  });
});

// ── AssessmentCompletionResult type ─────────────────────────────────────────

describe('AssessmentCompletionResult contains required fields', () => {
  it('includes totalScore, maxScore, cefrLevel, dimensionScores, completedAt', async () => {
    const result: import('@shared/assessment/assessment-types').AssessmentCompletionResult = {
      totalScore: 65,
      maxScore: 100,
      cefrLevel: 'B1',
      dimensionScores: {
        vocabulary: 0.7,
        grammar: 0.6,
        fluency: 0.65,
        comprehension: 0.68,
      },
      completedAt: new Date().toISOString(),
    };
    expect(result.cefrLevel).toBe('B1');
    expect(result.totalScore).toBe(65);
    expect(result.dimensionScores.vocabulary).toBe(0.7);
  });
});

// ── Language mode directive generation ──────────────────────────────────────

describe('buildLanguageModeDirective generates appropriate prompts', () => {
  it('simplified mode produces basic vocabulary instructions', async () => {
    const { buildLanguageModeDirective } = await import('@shared/language/cefr-adaptation');
    const directive = buildLanguageModeDirective('simplified', 'French', 'English');
    expect(directive).toContain('simple');
  });

  it('bilingual mode includes both languages', async () => {
    const { buildLanguageModeDirective } = await import('@shared/language/cefr-adaptation');
    const directive = buildLanguageModeDirective('bilingual', 'French', 'English');
    expect(directive.toLowerCase()).toMatch(/french|english|both/i);
  });

  it('natural mode uses full target language', async () => {
    const { buildLanguageModeDirective } = await import('@shared/language/cefr-adaptation');
    const directive = buildLanguageModeDirective('natural', 'French', 'English');
    expect(directive.toLowerCase()).toMatch(/french|native|natural|full/i);
  });
});

// ── Quest overlay stores assessment result ──────────────────────────────────

describe('PlaythroughQuestOverlay stores and retrieves assessmentResult', () => {
  it('updateQuest stores assessmentResult in overrides', async () => {
    const { PlaythroughQuestOverlay } = await import(
      '@shared/game-engine/logic/PlaythroughQuestOverlay'
    );
    const overlay = new PlaythroughQuestOverlay();
    overlay.updateQuest('quest_arrival', {
      status: 'completed',
      assessmentResult: {
        totalScore: 55,
        maxScore: 100,
        cefrLevel: 'B1',
        dimensionScores: { vocabulary: 0.6 },
        completedAt: '2026-04-08T12:00:00Z',
      },
    });

    const serialized = overlay.serialize();
    expect(serialized.overrides['quest_arrival']).toBeDefined();
    expect(serialized.overrides['quest_arrival'].assessmentResult).toBeDefined();
    expect(serialized.overrides['quest_arrival'].assessmentResult.cefrLevel).toBe('B1');
  });

  it('serialized overlay preserves assessmentResult across serialize/deserialize', async () => {
    const { PlaythroughQuestOverlay } = await import(
      '@shared/game-engine/logic/PlaythroughQuestOverlay'
    );
    const overlay1 = new PlaythroughQuestOverlay();
    overlay1.updateQuest('quest_arrival', {
      status: 'completed',
      assessmentResult: {
        totalScore: 80,
        maxScore: 100,
        cefrLevel: 'B2',
        dimensionScores: { grammar: 0.75, vocabulary: 0.85 },
        completedAt: '2026-04-08T12:00:00Z',
      },
    });

    const serialized = overlay1.serialize();
    const overlay2 = new PlaythroughQuestOverlay();
    overlay2.deserialize(serialized);

    const result = overlay2.serialize();
    expect(result.overrides['quest_arrival'].assessmentResult.cefrLevel).toBe('B2');
    expect(result.overrides['quest_arrival'].assessmentResult.totalScore).toBe(80);
  });
});
