import { describe, it, expect, beforeEach } from 'vitest';
import type { VocabularyEntry } from '@shared/language/progress';
import { ReviewSessionManager } from '@shared/language/review-session-manager';

function makeEntry(overrides: Partial<VocabularyEntry> = {}): VocabularyEntry {
  return {
    word: 'hola',
    language: 'es',
    meaning: 'hello',
    category: 'greetings',
    timesEncountered: 5,
    timesUsedCorrectly: 2,
    timesUsedIncorrectly: 1,
    lastEncountered: Date.now() - 60 * 60 * 1000,
    masteryLevel: 'learning',
    ...overrides,
  };
}

function makeDueVocabulary(now: number): VocabularyEntry[] {
  return [
    makeEntry({ word: 'hola', meaning: 'hello', masteryLevel: 'learning', lastEncountered: now - 2 * 60 * 60 * 1000 }),
    makeEntry({ word: 'adios', meaning: 'goodbye', masteryLevel: 'new', lastEncountered: now - 30 * 60 * 1000 }),
    makeEntry({ word: 'gracias', meaning: 'thank you', masteryLevel: 'new', lastEncountered: now - 20 * 60 * 1000 }),
    makeEntry({ word: 'por favor', meaning: 'please', masteryLevel: 'learning', lastEncountered: now - 60 * 60 * 1000 }),
    makeEntry({ word: 'agua', meaning: 'water', category: 'food', masteryLevel: 'familiar', lastEncountered: now - 5 * 60 * 60 * 1000 }),
  ];
}

let manager: ReviewSessionManager;

beforeEach(() => {
  manager = new ReviewSessionManager();
});

// ── shouldTriggerSession ────────────────────────────────────────────────────

describe('shouldTriggerSession', () => {
  it('returns true when enough due words and no cooldown', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    expect(manager.shouldTriggerSession(vocab, { now, minDueWords: 3 })).toBe(true);
  });

  it('returns false when not enough due words', () => {
    const now = Date.now();
    const vocab = [
      makeEntry({ masteryLevel: 'learning', lastEncountered: now - 1000 }), // not due
    ];
    expect(manager.shouldTriggerSession(vocab, { now, minDueWords: 3 })).toBe(false);
  });

  it('returns false during cooldown', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);

    // Start and complete a session to set cooldown
    const session = manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });
    expect(session).not.toBeNull();

    // Submit answers to complete it
    for (let i = 0; i < session!.challenges.length; i++) {
      manager.submitAnswer('wrong', vocab, now);
    }

    // Should be on cooldown
    expect(manager.shouldTriggerSession(vocab, { now: now + 1000 })).toBe(false);
  });

  it('returns true after cooldown expires', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);

    const session = manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });
    for (let i = 0; i < session!.challenges.length; i++) {
      manager.submitAnswer('wrong', vocab, now);
    }
    manager.dismissSession();

    // After cooldown (default 10 min)
    const later = now + 11 * 60 * 1000;
    // Need to make vocabulary due again
    for (const v of vocab) v.lastEncountered = later - 2 * 60 * 60 * 1000;
    expect(manager.shouldTriggerSession(vocab, { now: later })).toBe(true);
  });

  it('returns false when session is already active', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });

    expect(manager.shouldTriggerSession(vocab, { now })).toBe(false);
  });
});

// ── startSession ────────────────────────────────────────────────────────────

describe('startSession', () => {
  it('creates a session with challenges', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    const session = manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });

    expect(session).not.toBeNull();
    expect(session!.challenges.length).toBeGreaterThan(0);
    expect(session!.currentIndex).toBe(0);
    expect(session!.completed).toBe(false);
  });

  it('returns null when conditions not met', () => {
    const now = Date.now();
    const vocab = [makeEntry({ lastEncountered: now - 1000, masteryLevel: 'learning' })];
    const session = manager.startSession(vocab, vocab, { now, minDueWords: 5 });
    expect(session).toBeNull();
  });

  it('creates matching challenges when forced', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    const session = manager.startSession(vocab, vocab, { now, forceGameType: 'matching' });

    expect(session).not.toBeNull();
    expect(session!.challenges[0].type).toBe('matching');
  });
});

// ── getCurrentChallenge ─────────────────────────────────────────────────────

describe('getCurrentChallenge', () => {
  it('returns null when no active session', () => {
    expect(manager.getCurrentChallenge()).toBeNull();
  });

  it('returns the current challenge', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });

    const challenge = manager.getCurrentChallenge();
    expect(challenge).not.toBeNull();
    expect(challenge!.type).toBe('multiple_choice');
  });
});

// ── submitAnswer ────────────────────────────────────────────────────────────

describe('submitAnswer', () => {
  it('returns result and advances to next challenge', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    const session = manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });
    expect(session).not.toBeNull();

    const firstChallenge = manager.getCurrentChallenge();
    expect(firstChallenge).not.toBeNull();

    const result = manager.submitAnswer('wrong answer', vocab, now);
    expect(result).not.toBeNull();
    expect(result!.challengeType).toBe('multiple_choice');

    // Should advance
    const activeSession = manager.getActiveSession();
    expect(activeSession!.currentIndex).toBe(1);
  });

  it('marks session complete after last challenge', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    const session = manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });

    for (let i = 0; i < session!.challenges.length; i++) {
      manager.submitAnswer('wrong', vocab, now);
    }

    expect(manager.getActiveSession()!.completed).toBe(true);
  });

  it('returns null when no active session', () => {
    expect(manager.submitAnswer('test', [], Date.now())).toBeNull();
  });

  it('updates vocabulary mastery on correct answer', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    const session = manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });

    const challenge = manager.getCurrentChallenge();
    if (challenge && challenge.type === 'multiple_choice') {
      const correctAnswer = challenge.correctAnswer;
      const targetWord = challenge.targetWord;
      const entry = vocab.find(v => v.word === targetWord);
      const prevCorrect = entry?.timesUsedCorrectly ?? 0;

      manager.submitAnswer(correctAnswer, vocab, now);

      if (entry) {
        expect(entry.timesUsedCorrectly).toBe(prevCorrect + 1);
      }
    }
  });
});

// ── getSessionSummary ───────────────────────────────────────────────────────

describe('getSessionSummary', () => {
  it('returns null when session is not complete', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });

    expect(manager.getSessionSummary(now)).toBeNull();
  });

  it('returns summary after session completion', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    const session = manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });

    for (let i = 0; i < session!.challenges.length; i++) {
      manager.submitAnswer('wrong', vocab, now + 1000);
    }

    const summary = manager.getSessionSummary(now + 5000);
    expect(summary).not.toBeNull();
    expect(summary!.totalChallenges).toBe(session!.challenges.length);
    expect(summary!.incorrectCount).toBe(session!.challenges.length);
    expect(summary!.correctCount).toBe(0);
    expect(summary!.overallScore).toBe(0);
    expect(summary!.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('tracks correct answers in summary', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    const session = manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });

    // Answer first one correctly, rest wrong
    const first = manager.getCurrentChallenge();
    if (first && first.type === 'multiple_choice') {
      manager.submitAnswer(first.correctAnswer, vocab, now);
    }
    for (let i = 1; i < session!.challenges.length; i++) {
      manager.submitAnswer('wrong', vocab, now);
    }

    const summary = manager.getSessionSummary(now);
    expect(summary).not.toBeNull();
    expect(summary!.correctCount).toBe(1);
    expect(summary!.totalXP).toBeGreaterThan(0);
  });
});

// ── dismissSession ──────────────────────────────────────────────────────────

describe('dismissSession', () => {
  it('clears the active session', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    manager.startSession(vocab, vocab, { now, forceGameType: 'multiple_choice' });
    expect(manager.getActiveSession()).not.toBeNull();

    manager.dismissSession();
    expect(manager.getActiveSession()).toBeNull();
  });
});

// ── Integration: full session flow ──────────────────────────────────────────

describe('full session flow', () => {
  it('completes a multi-challenge session correctly', () => {
    const now = Date.now();
    const vocab = makeDueVocabulary(now);
    const session = manager.startSession(vocab, vocab, {
      now,
      maxChallenges: 3,
      forceGameType: 'multiple_choice',
    });

    expect(session).not.toBeNull();
    const challengeCount = session!.challenges.length;
    expect(challengeCount).toBeGreaterThan(0);
    expect(challengeCount).toBeLessThanOrEqual(3);

    // Answer all correctly
    for (let i = 0; i < challengeCount; i++) {
      const challenge = manager.getCurrentChallenge();
      expect(challenge).not.toBeNull();
      if (challenge && challenge.type === 'multiple_choice') {
        const result = manager.submitAnswer(challenge.correctAnswer, vocab, now);
        expect(result).not.toBeNull();
        expect(result!.correct).toBe(true);
      }
    }

    expect(manager.getActiveSession()!.completed).toBe(true);
    const summary = manager.getSessionSummary(now);
    expect(summary).not.toBeNull();
    expect(summary!.correctCount).toBe(challengeCount);
    expect(summary!.overallScore).toBe(1);
    expect(summary!.totalXP).toBe(challengeCount * 2);
  });
});
