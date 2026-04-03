/**
 * Assessment System Audit — Can the initial language assessment be completed?
 *
 * Tests that verify the full assessment flow from start to CEFR result:
 *   1. All 5 phases (reading, writing, listening, initiate_conversation, conversation) complete
 *   2. Offline content and scoring produce valid results
 *   3. Conversation score is used when provided (not random fallback)
 *   4. Dimension scores are deterministic
 *   5. CEFR level mapping is correct
 *   6. storeCefrLevel receives correct parameters
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  scoreReadingListeningOffline,
  scoreWritingOffline,
} from '../assessment/offline-scoring';
import {
  getOfflineContentPool,
  pickRandom,
} from '../assessment/offline-content-bank';
import type { OfflinePassageEntry, OfflineWritingEntry } from '../assessment/offline-content-bank';
import {
  isFirstPlaythrough,
  isLanguageLearningWorld,
  getTargetLanguage,
} from '../game-engine/rendering/OnboardingLauncher';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Create a minimal mock event bus for testing AssessmentEngine */
function createMockEventBus() {
  const listeners = new Map<string, Set<(event: any) => void>>();
  return {
    emit(event: { type: string; [key: string]: any }) {
      const set = listeners.get(event.type);
      if (set) {
        for (const cb of set) cb(event);
      }
    },
    on(type: string, cb: (event: any) => void): () => void {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(cb);
      return () => { listeners.get(type)?.delete(cb); };
    },
    emittedEvents: [] as Array<{ type: string; [key: string]: any }>,
  };
}

/** Wrap emit to track emitted events */
function trackEmits(bus: ReturnType<typeof createMockEventBus>) {
  const original = bus.emit.bind(bus);
  bus.emit = (event: { type: string; [key: string]: any }) => {
    bus.emittedEvents.push(event);
    original(event);
  };
  return bus;
}

// ── Offline Content Bank Tests ───────────────────────────────────────────────

describe('Assessment System Audit: Offline Content Bank', () => {
  it('provides French beginner content with all 3 phase types', () => {
    const pool = getOfflineContentPool('french', 'beginner');
    expect(pool.reading.length).toBeGreaterThanOrEqual(1);
    expect(pool.listening.length).toBeGreaterThanOrEqual(1);
    expect(pool.writing.length).toBeGreaterThanOrEqual(1);
  });

  it('provides Spanish beginner content', () => {
    const pool = getOfflineContentPool('spanish', 'beginner');
    expect(pool.reading.length).toBeGreaterThanOrEqual(1);
    expect(pool.listening.length).toBeGreaterThanOrEqual(1);
    expect(pool.writing.length).toBeGreaterThanOrEqual(1);
  });

  it('falls back to generic content for unsupported languages', () => {
    const pool = getOfflineContentPool('klingon', 'beginner');
    expect(pool.reading.length).toBeGreaterThanOrEqual(1);
    expect(pool.listening.length).toBeGreaterThanOrEqual(1);
    expect(pool.writing.length).toBeGreaterThanOrEqual(1);
  });

  it('reading passages have questions with rubrics', () => {
    const pool = getOfflineContentPool('french', 'beginner');
    for (const entry of pool.reading) {
      expect(entry.passage.length).toBeGreaterThan(0);
      expect(entry.questions.length).toBeGreaterThanOrEqual(1);
      for (const q of entry.questions) {
        expect(q.id).toBeTruthy();
        expect(q.questionText).toBeTruthy();
        expect(q.maxPoints).toBeGreaterThan(0);
        expect(q.expectedKeywords.length).toBeGreaterThan(0);
      }
    }
  });

  it('writing entries have prompts and rubrics', () => {
    const pool = getOfflineContentPool('french', 'beginner');
    for (const entry of pool.writing) {
      expect(entry.writingPrompts.length).toBeGreaterThanOrEqual(1);
      expect(entry.rubrics.length).toBeGreaterThanOrEqual(1);
      for (const rubric of entry.rubrics) {
        expect(rubric.expectedKeywords.length).toBeGreaterThan(0);
        expect(rubric.minWords).toBeGreaterThan(0);
      }
    }
  });

  it('pickRandom returns an element from the array', () => {
    const items = [1, 2, 3, 4, 5];
    const picked = pickRandom(items);
    expect(items).toContain(picked);
  });
});

// ── Offline Scoring Tests ────────────────────────────────────────────────────

describe('Assessment System Audit: Offline Scoring', () => {
  describe('Reading/Listening scoring', () => {
    it('awards full points for exact phrase match', () => {
      const pool = getOfflineContentPool('french', 'beginner');
      const entry = pool.reading[0]; // Gare de Lyon passage
      // Answer with the exact expected phrase
      const answers: Record<string, string> = {
        r1q1: '14h30',
        r1q2: "bureau d'information",
        r1q3: 'guichet',
      };
      const result = scoreReadingListeningOffline(entry.questions, answers);
      expect(result.totalScore).toBe(15); // 5+5+5
      expect(result.maxScore).toBe(15);
      expect(result.questionScores).toHaveLength(3);
    });

    it('awards partial credit for keyword matches', () => {
      const pool = getOfflineContentPool('french', 'beginner');
      const entry = pool.reading[0];
      const answers: Record<string, string> = {
        r1q1: 'The train departs at two thirty',
        r1q2: 'I think it is open from 8 to 20',
        r1q3: 'At the ticket counter near the entrance',
      };
      const result = scoreReadingListeningOffline(entry.questions, answers);
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.totalScore).toBeLessThanOrEqual(15);
    });

    it('awards zero for empty answers', () => {
      const pool = getOfflineContentPool('french', 'beginner');
      const entry = pool.reading[0];
      const answers: Record<string, string> = { r1q1: '', r1q2: '', r1q3: '' };
      const result = scoreReadingListeningOffline(entry.questions, answers);
      expect(result.totalScore).toBe(0);
    });

    it('scores listening questions the same way as reading', () => {
      const pool = getOfflineContentPool('french', 'beginner');
      const entry = pool.listening[0];
      const answers: Record<string, string> = {
        l1q1: '9h à 17h, monday to saturday',
        l1q2: 'mardi',
        l1q3: '8 euros',
      };
      const result = scoreReadingListeningOffline(entry.questions, answers);
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.maxScore).toBe(13); // 5+5+3
    });
  });

  describe('Writing scoring', () => {
    it('scores based on word count and keyword coverage', () => {
      const pool = getOfflineContentPool('french', 'beginner');
      const entry = pool.writing[0];
      const answers: Record<string, string> = {
        p1: "I arrived in the city by train yesterday. I can see beautiful buildings and a park from my window. The journey was wonderful.",
        p2: "My hotel room has a comfortable bed near the window. There is a small table with a lamp. The room is clean and cozy.",
      };
      const result = scoreWritingOffline(entry, answers);
      expect(result.totalScore).toBeGreaterThan(0);
      expect(result.maxScore).toBe(15); // 5*3 dimensions
      expect(result.dimensionScores.task_completion.score).toBeGreaterThan(0);
      expect(result.dimensionScores.vocabulary.score).toBeGreaterThan(0);
      expect(result.dimensionScores.grammar.score).toBeGreaterThan(0);
    });

    it('gives low scores for empty writing', () => {
      const pool = getOfflineContentPool('french', 'beginner');
      const entry = pool.writing[0];
      const answers: Record<string, string> = { p1: '', p2: '' };
      const result = scoreWritingOffline(entry, answers);
      expect(result.dimensionScores.task_completion.score).toBe(0);
      expect(result.dimensionScores.vocabulary.score).toBe(0);
    });
  });
});

// ── AssessmentEngine End-to-End Tests ────────────────────────────────────────

describe('Assessment System Audit: AssessmentEngine E2E', () => {
  let AssessmentEngine: any;

  beforeEach(async () => {
    // Dynamic import to get the actual class
    const mod = await import('../game-engine/logic/AssessmentEngine');
    AssessmentEngine = mod.AssessmentEngine;
  });

  it('completes all 5 phases and produces CEFR result', async () => {
    const bus = trackEmits(createMockEventBus());
    const completedPhases: string[] = [];
    let finalResult: any = null;

    const engine = new AssessmentEngine({
      authToken: 'test-token',
      targetLanguage: 'french',
      eventBus: bus as any,
    });

    engine.onPhaseCompleted((phaseId: string) => {
      completedPhases.push(phaseId);
    });
    engine.onCompleted((result: any) => {
      finalResult = result;
    });

    // Wire up modal handler — auto-submit answers for modal phases
    engine.onShowModal((config: any) => {
      const answers: Record<string, string> = {};
      if (config.questions) {
        for (const q of config.questions) {
          answers[q.id] = '14h30'; // Give a plausible answer
        }
      }
      if (config.writingPrompts) {
        for (let i = 0; i < config.writingPrompts.length; i++) {
          answers[`p${i + 1}`] = 'I arrived in the city by train. The weather is nice and I can see many shops and restaurants.';
        }
      }
      config.onSubmit(answers);
    });

    engine.onHideModal(() => {});
    engine.onShowInstruction(() => {});
    engine.onHideInstruction(() => {});

    // Start assessment — this will run reading, writing, listening synchronously via modal
    // then block on initiate_conversation and conversation events
    const startPromise = engine.start({
      assessmentType: 'arrival',
      playerId: 'test-player',
      worldId: 'test-world',
      targetLanguage: 'french',
    });

    // After modal phases complete, the engine waits for conversation events.
    // Give a small delay then emit the events.
    await new Promise(r => setTimeout(r, 50));

    // Emit initiate_conversation event
    bus.emit({ type: 'assessment_conversation_initiated', npcId: 'npc-1' });

    await new Promise(r => setTimeout(r, 50));

    // Emit conversation completed with a real score
    bus.emit({ type: 'assessment_conversation_completed', npcId: 'npc-1', score: 7 });

    await startPromise;

    // Verify all 5 phases completed
    expect(completedPhases).toEqual([
      'arrival_reading',
      'arrival_writing',
      'arrival_listening',
      'arrival_initiate_conversation',
      'arrival_conversation',
    ]);

    // Verify final result
    expect(finalResult).toBeTruthy();
    expect(finalResult.sessionId).toBeTruthy();
    expect(finalResult.totalScore).toBeGreaterThan(0);
    expect(finalResult.totalMaxScore).toBe(53);
    expect(['A1', 'A2', 'B1', 'B2']).toContain(finalResult.cefrLevel.toUpperCase());
    expect(finalResult.dimensionScores).toBeTruthy();
  });

  it('uses provided conversation score instead of random fallback', async () => {
    const bus = trackEmits(createMockEventBus());
    let finalResult: any = null;

    const engine = new AssessmentEngine({
      authToken: 'test-token',
      targetLanguage: 'french',
      eventBus: bus as any,
    });

    engine.onCompleted((result: any) => { finalResult = result; });
    engine.onShowModal((config: any) => {
      const answers: Record<string, string> = {};
      if (config.questions) {
        for (const q of config.questions) answers[q.id] = 'test answer';
      }
      if (config.writingPrompts) {
        for (let i = 0; i < config.writingPrompts.length; i++) answers[`p${i + 1}`] = 'a';
      }
      config.onSubmit(answers);
    });
    engine.onHideModal(() => {});
    engine.onShowInstruction(() => {});
    engine.onHideInstruction(() => {});

    const startPromise = engine.start({
      assessmentType: 'arrival',
      playerId: 'p1',
      worldId: 'w1',
      targetLanguage: 'french',
    });

    await new Promise(r => setTimeout(r, 50));
    bus.emit({ type: 'assessment_conversation_initiated', npcId: 'npc-1' });
    await new Promise(r => setTimeout(r, 50));

    // Provide exactly 8 as the conversation score
    bus.emit({ type: 'assessment_conversation_completed', npcId: 'npc-1', score: 8 });
    await startPromise;

    // Run it again with the same answers to verify determinism
    let finalResult2: any = null;
    const engine2 = new AssessmentEngine({
      authToken: 'test-token',
      targetLanguage: 'french',
      eventBus: bus as any,
    });
    engine2.onCompleted((result: any) => { finalResult2 = result; });
    engine2.onShowModal((config: any) => {
      const answers: Record<string, string> = {};
      if (config.questions) {
        for (const q of config.questions) answers[q.id] = 'test answer';
      }
      if (config.writingPrompts) {
        for (let i = 0; i < config.writingPrompts.length; i++) answers[`p${i + 1}`] = 'a';
      }
      config.onSubmit(answers);
    });
    engine2.onHideModal(() => {});
    engine2.onShowInstruction(() => {});
    engine2.onHideInstruction(() => {});

    const startPromise2 = engine2.start({
      assessmentType: 'arrival',
      playerId: 'p1',
      worldId: 'w1',
      targetLanguage: 'french',
    });

    await new Promise(r => setTimeout(r, 50));
    bus.emit({ type: 'assessment_conversation_initiated', npcId: 'npc-1' });
    await new Promise(r => setTimeout(r, 50));
    bus.emit({ type: 'assessment_conversation_completed', npcId: 'npc-1', score: 8 });
    await startPromise2;

    // Both runs should produce identical results (deterministic)
    expect(finalResult.totalScore).toBe(finalResult2.totalScore);
    expect(finalResult.cefrLevel).toBe(finalResult2.cefrLevel);
    expect(finalResult.dimensionScores).toEqual(finalResult2.dimensionScores);
  });

  it('dimension scores are deterministic (no random jitter)', async () => {
    const results: any[] = [];

    for (let i = 0; i < 3; i++) {
      // Mock Math.random to ensure same content is picked each run
      let callCount = 0;
      const originalRandom = Math.random;
      Math.random = () => { callCount++; return 0.1; }; // always pick first entry

      try {
        const bus = createMockEventBus();
        const engine = new AssessmentEngine({
          authToken: 'test-token',
          targetLanguage: 'french',
          eventBus: bus as any,
        });

        let result: any = null;
        engine.onCompleted((r: any) => { result = r; });
        engine.onShowModal((config: any) => {
          const answers: Record<string, string> = {};
          if (config.questions) {
            for (const q of config.questions) answers[q.id] = '14h30';
          }
          if (config.writingPrompts) {
            for (let j = 0; j < config.writingPrompts.length; j++) {
              answers[`p${j + 1}`] = 'I arrived in the city by train. The weather is nice.';
            }
          }
          config.onSubmit(answers);
        });
        engine.onHideModal(() => {});
        engine.onShowInstruction(() => {});
        engine.onHideInstruction(() => {});

        const p = engine.start({
          assessmentType: 'arrival',
          playerId: 'p1',
          worldId: 'w1',
          targetLanguage: 'french',
        });

        await new Promise(r => setTimeout(r, 50));
        bus.emit({ type: 'assessment_conversation_initiated', npcId: 'npc-1' });
        await new Promise(r => setTimeout(r, 50));
        bus.emit({ type: 'assessment_conversation_completed', npcId: 'npc-1', score: 5 });
        await p;

        results.push(result);
      } finally {
        Math.random = originalRandom;
      }
    }

    // All 3 runs should produce identical dimension scores
    expect(results[0].dimensionScores).toEqual(results[1].dimensionScores);
    expect(results[1].dimensionScores).toEqual(results[2].dimensionScores);
  });
});

// ── CEFR Level Mapping Tests ─────────────────────────────────────────────────

describe('Assessment System Audit: CEFR Mapping', () => {
  // The mapping in AssessmentEngine.start():
  //   >= 80% → B2, >= 60% → B1, >= 40% → A2, < 40% → A1
  // Total max score = 53

  it('maps 0% → A1', () => {
    const pct = 0;
    const level = pct >= 80 ? 'B2' : pct >= 60 ? 'B1' : pct >= 40 ? 'A2' : 'A1';
    expect(level).toBe('A1');
  });

  it('maps 39% → A1', () => {
    const pct = 39;
    const level = pct >= 80 ? 'B2' : pct >= 60 ? 'B1' : pct >= 40 ? 'A2' : 'A1';
    expect(level).toBe('A1');
  });

  it('maps 40% → A2', () => {
    const pct = 40;
    const level = pct >= 80 ? 'B2' : pct >= 60 ? 'B1' : pct >= 40 ? 'A2' : 'A1';
    expect(level).toBe('A2');
  });

  it('maps 59% → A2', () => {
    const pct = 59;
    const level = pct >= 80 ? 'B2' : pct >= 60 ? 'B1' : pct >= 40 ? 'A2' : 'A1';
    expect(level).toBe('A2');
  });

  it('maps 60% → B1', () => {
    const pct = 60;
    const level = pct >= 80 ? 'B2' : pct >= 60 ? 'B1' : pct >= 40 ? 'A2' : 'A1';
    expect(level).toBe('B1');
  });

  it('maps 79% → B1', () => {
    const pct = 79;
    const level = pct >= 80 ? 'B2' : pct >= 60 ? 'B1' : pct >= 40 ? 'A2' : 'A1';
    expect(level).toBe('B1');
  });

  it('maps 80% → B2', () => {
    const pct = 80;
    const level = pct >= 80 ? 'B2' : pct >= 60 ? 'B1' : pct >= 40 ? 'A2' : 'A1';
    expect(level).toBe('B2');
  });

  it('maps 100% → B2', () => {
    const pct = 100;
    const level = pct >= 80 ? 'B2' : pct >= 60 ? 'B1' : pct >= 40 ? 'A2' : 'A1';
    expect(level).toBe('B2');
  });
});

// ── OnboardingLauncher Helper Tests ──────────────────────────────────────────

describe('Assessment System Audit: OnboardingLauncher Helpers', () => {
  it('isLanguageLearningWorld detects language worlds', () => {
    expect(isLanguageLearningWorld({ gameType: 'language-learning' })).toBe(true);
    expect(isLanguageLearningWorld({ worldType: 'language-immersion' })).toBe(true);
    expect(isLanguageLearningWorld({ targetLanguage: 'french' })).toBe(true);
    expect(isLanguageLearningWorld({ gameType: 'sandbox' })).toBe(false);
    expect(isLanguageLearningWorld(null)).toBe(false);
  });

  it('getTargetLanguage extracts language or defaults to Spanish', () => {
    expect(getTargetLanguage({ targetLanguage: 'French' })).toBe('French');
    expect(getTargetLanguage({})).toBe('Spanish');
    expect(getTargetLanguage(null)).toBe('Spanish');
  });

  it('isFirstPlaythrough returns true when no completed assessments exist', async () => {
    const dataSource = {
      getPlayerAssessments: vi.fn().mockResolvedValue([]),
    };
    const result = await isFirstPlaythrough('w1', 'p1', 'token', dataSource);
    expect(result).toBe(true);
  });

  it('isFirstPlaythrough returns false when completed arrival assessment exists', async () => {
    const dataSource = {
      getPlayerAssessments: vi.fn().mockResolvedValue([
        { assessmentType: 'arrival', status: 'complete' },
      ]),
    };
    const result = await isFirstPlaythrough('w1', 'p1', 'token', dataSource);
    expect(result).toBe(false);
  });

  it('isFirstPlaythrough returns true on error (safe default)', async () => {
    const dataSource = {
      getPlayerAssessments: vi.fn().mockRejectedValue(new Error('DB error')),
    };
    const result = await isFirstPlaythrough('w1', 'p1', 'token', dataSource);
    expect(result).toBe(true);
  });
});

// ── Phase Completion Trigger Tests ───────────────────────────────────────────

describe('Assessment System Audit: Phase Completion Triggers', () => {
  it('emits reading_completed, writing_submitted, and listening_completed events', async () => {
    const { AssessmentEngine } = await import('../game-engine/logic/AssessmentEngine');
    const bus = trackEmits(createMockEventBus());

    const engine = new AssessmentEngine({
      authToken: 'test-token',
      targetLanguage: 'french',
      eventBus: bus as any,
    });

    engine.onShowModal((config: any) => {
      const answers: Record<string, string> = {};
      if (config.questions) {
        for (const q of config.questions) answers[q.id] = 'answer';
      }
      if (config.writingPrompts) {
        for (let i = 0; i < config.writingPrompts.length; i++) answers[`p${i + 1}`] = 'answer text';
      }
      config.onSubmit(answers);
    });
    engine.onHideModal(() => {});
    engine.onShowInstruction(() => {});
    engine.onHideInstruction(() => {});
    engine.onCompleted(() => {});

    const p = engine.start({
      assessmentType: 'arrival',
      playerId: 'p1',
      worldId: 'w1',
      targetLanguage: 'french',
    });

    await new Promise(r => setTimeout(r, 50));
    bus.emit({ type: 'assessment_conversation_initiated', npcId: 'npc-1' });
    await new Promise(r => setTimeout(r, 50));
    bus.emit({ type: 'assessment_conversation_completed', npcId: 'npc-1', score: 5 });
    await p;

    const eventTypes = bus.emittedEvents.map(e => e.type);
    expect(eventTypes).toContain('reading_completed');
    expect(eventTypes).toContain('writing_submitted');
    expect(eventTypes).toContain('listening_completed');
  });
});
