import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AssessmentListeningTask,
  distanceBetween,
  isAnswerCorrect,
  type ListeningTaskConfig,
  type ListeningTaskCallbacks,
  type Position,
} from '../assessment/AssessmentListeningTask';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCheckpoints(count = 4) {
  return Array.from({ length: count }, (_, i) => ({
    id: `cp_${i}`,
    targetPosition: { x: (i + 1) * 10, y: 0, z: 0 },
    toleranceRadius: 2,
    directionText: `Go to checkpoint ${i + 1}`,
  }));
}

function makeQuestions(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: `q_${i}`,
    question: `Question ${i + 1}?`,
    correctAnswer: `answer_${i}`,
    acceptableAnswers: [`alt_${i}`],
  }));
}

function makeConfig(overrides: Partial<ListeningTaskConfig> = {}): ListeningTaskConfig {
  return {
    checkpoints: makeCheckpoints(),
    questions: makeQuestions(),
    announcementText: 'Test announcement in target language.',
    targetLanguage: 'es',
    ...overrides,
  };
}

// ─── Unit tests: distanceBetween ─────────────────────────────────────────────

describe('distanceBetween', () => {
  it('returns 0 for same position', () => {
    const p: Position = { x: 5, y: 3, z: 1 };
    expect(distanceBetween(p, p)).toBe(0);
  });

  it('calculates distance along one axis', () => {
    expect(distanceBetween({ x: 0, y: 0, z: 0 }, { x: 3, y: 0, z: 0 })).toBe(3);
  });

  it('calculates 3D distance', () => {
    const d = distanceBetween({ x: 1, y: 2, z: 3 }, { x: 4, y: 6, z: 3 });
    expect(d).toBe(5); // sqrt(9 + 16 + 0) = 5
  });
});

// ─── Unit tests: isAnswerCorrect ─────────────────────────────────────────────

describe('isAnswerCorrect', () => {
  it('matches exact answer (case-insensitive)', () => {
    expect(isAnswerCorrect('Hello', 'hello')).toBe(true);
  });

  it('trims whitespace', () => {
    expect(isAnswerCorrect('  hello  ', 'hello')).toBe(true);
  });

  it('collapses internal whitespace', () => {
    expect(isAnswerCorrect('two  words', 'two words')).toBe(true);
  });

  it('rejects wrong answer', () => {
    expect(isAnswerCorrect('wrong', 'right')).toBe(false);
  });

  it('accepts alternative answers', () => {
    expect(isAnswerCorrect('alt', 'correct', ['alt', 'other'])).toBe(true);
  });

  it('rejects answer not in alternatives', () => {
    expect(isAnswerCorrect('nope', 'correct', ['alt'])).toBe(false);
  });
});

// ─── Constructor validation ──────────────────────────────────────────────────

describe('AssessmentListeningTask constructor', () => {
  it('throws if no checkpoints provided', () => {
    expect(() => new AssessmentListeningTask(makeConfig({ checkpoints: [] }))).toThrow(
      'At least one checkpoint',
    );
  });

  it('throws if no questions provided', () => {
    expect(() => new AssessmentListeningTask(makeConfig({ questions: [] }))).toThrow(
      'At least one question',
    );
  });

  it('creates successfully with valid config', () => {
    const task = new AssessmentListeningTask(makeConfig());
    expect(task.status).toBe('idle');
    expect(task.totalMaxScore).toBe(7);
  });
});

// ─── Task 2A: Following Directions ──────────────────────────────────────────

describe('Task 2A: Following Directions', () => {
  let task: AssessmentListeningTask;
  let callbacks: ListeningTaskCallbacks;

  beforeEach(() => {
    callbacks = {
      onCheckpointReached: vi.fn(),
      onCheckpointMissed: vi.fn(),
      onDirectionsComplete: vi.fn(),
      onComplete: vi.fn(),
    };
    task = new AssessmentListeningTask(makeConfig(), callbacks);
  });

  it('starts in idle, transitions to directions_active', () => {
    expect(task.status).toBe('idle');
    task.startDirections();
    expect(task.status).toBe('directions_active');
  });

  it('throws if starting directions when not idle', () => {
    task.startDirections();
    expect(() => task.startDirections()).toThrow('Cannot start directions');
  });

  it('throws if evaluating position when not in directions_active', () => {
    expect(() => task.evaluatePosition({ x: 0, y: 0, z: 0 })).toThrow('Cannot evaluate position');
  });

  it('scores a reached checkpoint within tolerance', () => {
    task.startDirections();
    // Checkpoint 0 target is { x: 10, y: 0, z: 0 }, tolerance 2
    const reached = task.evaluatePosition({ x: 11, y: 0, z: 0 }); // distance = 1 < 2
    expect(reached).toBe(true);
    expect(callbacks.onCheckpointReached).toHaveBeenCalledWith('cp_0', 0, 4);
    expect(task.getDirectionsScore()).toBe(1);
  });

  it('scores a missed checkpoint outside tolerance', () => {
    task.startDirections();
    const reached = task.evaluatePosition({ x: 100, y: 0, z: 0 }); // far away
    expect(reached).toBe(false);
    expect(callbacks.onCheckpointMissed).toHaveBeenCalledWith('cp_0', 0, 4);
    expect(task.getDirectionsScore()).toBe(0);
  });

  it('advances through all 4 checkpoints', () => {
    task.startDirections();
    // Hit all 4 checkpoints exactly
    task.evaluatePosition({ x: 10, y: 0, z: 0 }); // cp_0: hit
    task.evaluatePosition({ x: 20, y: 0, z: 0 }); // cp_1: hit
    task.evaluatePosition({ x: 30, y: 0, z: 0 }); // cp_2: hit
    task.evaluatePosition({ x: 40, y: 0, z: 0 }); // cp_3: hit
    expect(task.getDirectionsScore()).toBe(4);
    expect(callbacks.onDirectionsComplete).toHaveBeenCalledWith(4, 4);
    expect(task.status).toBe('extraction_active'); // auto-transitions
  });

  it('scores partial — 2 of 4 checkpoints', () => {
    task.startDirections();
    task.evaluatePosition({ x: 10, y: 0, z: 0 }); // cp_0: hit
    task.evaluatePosition({ x: 99, y: 0, z: 0 }); // cp_1: miss
    task.evaluatePosition({ x: 30, y: 0, z: 0 }); // cp_2: hit
    task.evaluatePosition({ x: 99, y: 0, z: 0 }); // cp_3: miss
    expect(task.getDirectionsScore()).toBe(2);
    expect(callbacks.onDirectionsComplete).toHaveBeenCalledWith(2, 4);
  });

  it('getCurrentCheckpoint returns current checkpoint', () => {
    task.startDirections();
    const cp = task.getCurrentCheckpoint();
    expect(cp?.id).toBe('cp_0');
    task.evaluatePosition({ x: 10, y: 0, z: 0 });
    expect(task.getCurrentCheckpoint()?.id).toBe('cp_1');
  });

  it('getCurrentCheckpoint returns null when not in directions mode', () => {
    expect(task.getCurrentCheckpoint()).toBeNull();
  });

  it('skipRemainingCheckpoints marks all unevaluated as missed', () => {
    task.startDirections();
    task.evaluatePosition({ x: 10, y: 0, z: 0 }); // cp_0: hit
    task.skipRemainingCheckpoints(); // cp_1, cp_2, cp_3: missed
    expect(task.getDirectionsScore()).toBe(1);
    expect(task.checkpointResults).toHaveLength(4);
    expect(callbacks.onCheckpointMissed).toHaveBeenCalledTimes(3);
    expect(callbacks.onDirectionsComplete).toHaveBeenCalledWith(1, 4);
  });

  it('throws skipRemainingCheckpoints when not in directions mode', () => {
    expect(() => task.skipRemainingCheckpoints()).toThrow('Cannot skip checkpoints');
  });

  it('stores player position in checkpoint results', () => {
    task.startDirections();
    task.evaluatePosition({ x: 11, y: 1, z: 0 });
    expect(task.checkpointResults[0].playerPosition).toEqual({ x: 11, y: 1, z: 0 });
  });
});

// ─── Task 2B: Information Extraction ─────────────────────────────────────────

describe('Task 2B: Information Extraction', () => {
  let task: AssessmentListeningTask;
  let callbacks: ListeningTaskCallbacks;

  beforeEach(() => {
    callbacks = {
      onQuestionAnswered: vi.fn(),
      onExtractionComplete: vi.fn(),
      onDirectionsComplete: vi.fn(),
      onComplete: vi.fn(),
    };
    task = new AssessmentListeningTask(makeConfig(), callbacks);
    // Complete Task 2A first
    task.startDirections();
    task.skipRemainingCheckpoints();
  });

  it('transitions to extraction_active after directions complete', () => {
    expect(task.status).toBe('extraction_active');
  });

  it('submits a correct answer', () => {
    const correct = task.submitAnswer('answer_0');
    expect(correct).toBe(true);
    expect(callbacks.onQuestionAnswered).toHaveBeenCalledWith('q_0', true, 0, 3);
    expect(task.getExtractionScore()).toBe(1);
  });

  it('submits an incorrect answer', () => {
    const correct = task.submitAnswer('wrong');
    expect(correct).toBe(false);
    expect(callbacks.onQuestionAnswered).toHaveBeenCalledWith('q_0', false, 0, 3);
    expect(task.getExtractionScore()).toBe(0);
  });

  it('accepts alternative answers', () => {
    const correct = task.submitAnswer('alt_0');
    expect(correct).toBe(true);
  });

  it('completes after answering all 3 questions', () => {
    task.submitAnswer('answer_0'); // correct
    task.submitAnswer('wrong');    // wrong
    task.submitAnswer('answer_2'); // correct
    expect(task.getExtractionScore()).toBe(2);
    expect(callbacks.onExtractionComplete).toHaveBeenCalledWith(2, 3);
    expect(task.status).toBe('completed');
    expect(callbacks.onComplete).toHaveBeenCalled();
  });

  it('throws when submitting after all questions answered', () => {
    task.submitAnswer('a');
    task.submitAnswer('b');
    task.submitAnswer('c');
    expect(() => task.submitAnswer('d')).toThrow('Cannot submit answer');
  });

  it('getCurrentQuestion returns current question', () => {
    const q = task.getCurrentQuestion();
    expect(q?.id).toBe('q_0');
    task.submitAnswer('answer_0');
    expect(task.getCurrentQuestion()?.id).toBe('q_1');
  });

  it('getCurrentQuestion returns null after completion', () => {
    task.submitAnswer('a');
    task.submitAnswer('b');
    task.submitAnswer('c');
    expect(task.getCurrentQuestion()).toBeNull();
  });
});

// ─── Combined Result ─────────────────────────────────────────────────────────

describe('Combined Listening Task Result', () => {
  it('produces correct combined result for perfect score', () => {
    const task = new AssessmentListeningTask(makeConfig());
    task.startDirections();
    // Hit all 4 checkpoints
    task.evaluatePosition({ x: 10, y: 0, z: 0 });
    task.evaluatePosition({ x: 20, y: 0, z: 0 });
    task.evaluatePosition({ x: 30, y: 0, z: 0 });
    task.evaluatePosition({ x: 40, y: 0, z: 0 });
    // Answer all 3 questions correctly
    task.submitAnswer('answer_0');
    task.submitAnswer('answer_1');
    task.submitAnswer('answer_2');

    const result = task.getResult();
    expect(result.directionsScore).toBe(4);
    expect(result.directionsMaxScore).toBe(4);
    expect(result.extractionScore).toBe(3);
    expect(result.extractionMaxScore).toBe(3);
    expect(result.totalScore).toBe(7);
    expect(result.totalMaxScore).toBe(7);
    expect(result.checkpointResults).toHaveLength(4);
    expect(result.questionResults).toHaveLength(3);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('produces correct result for zero score', () => {
    const task = new AssessmentListeningTask(makeConfig());
    task.startDirections();
    task.skipRemainingCheckpoints();
    task.submitAnswer('wrong');
    task.submitAnswer('wrong');
    task.submitAnswer('wrong');

    const result = task.getResult();
    expect(result.directionsScore).toBe(0);
    expect(result.extractionScore).toBe(0);
    expect(result.totalScore).toBe(0);
    expect(result.totalMaxScore).toBe(7);
  });

  it('produces correct result for partial score', () => {
    const task = new AssessmentListeningTask(makeConfig());
    task.startDirections();
    task.evaluatePosition({ x: 10, y: 0, z: 0 }); // hit
    task.evaluatePosition({ x: 99, y: 0, z: 0 }); // miss
    task.evaluatePosition({ x: 30, y: 0, z: 0 }); // hit
    task.evaluatePosition({ x: 99, y: 0, z: 0 }); // miss
    task.submitAnswer('answer_0'); // correct
    task.submitAnswer('wrong');    // wrong
    task.submitAnswer('alt_2');    // correct (alternative)

    const result = task.getResult();
    expect(result.directionsScore).toBe(2);
    expect(result.extractionScore).toBe(2);
    expect(result.totalScore).toBe(4);
  });

  it('throws getResult before completion', () => {
    const task = new AssessmentListeningTask(makeConfig());
    expect(() => task.getResult()).toThrow('task is not completed');
  });
});

// ─── Score properties ────────────────────────────────────────────────────────

describe('Score properties', () => {
  it('directionsMaxScore matches checkpoint count', () => {
    const task = new AssessmentListeningTask(makeConfig({ checkpoints: makeCheckpoints(3) }));
    expect(task.directionsMaxScore).toBe(3);
  });

  it('extractionMaxScore matches question count', () => {
    const task = new AssessmentListeningTask(makeConfig({ questions: makeQuestions(5) }));
    expect(task.extractionMaxScore).toBe(5);
  });

  it('totalMaxScore is sum of both', () => {
    const task = new AssessmentListeningTask(
      makeConfig({ checkpoints: makeCheckpoints(4), questions: makeQuestions(3) }),
    );
    expect(task.totalMaxScore).toBe(7);
  });
});

// ─── Callback integration ────────────────────────────────────────────────────

describe('Callback integration', () => {
  it('fires onComplete with full result', () => {
    const onComplete = vi.fn();
    const task = new AssessmentListeningTask(makeConfig(), { onComplete });
    task.startDirections();
    task.skipRemainingCheckpoints();
    task.submitAnswer('answer_0');
    task.submitAnswer('answer_1');
    task.submitAnswer('answer_2');

    expect(onComplete).toHaveBeenCalledTimes(1);
    const result = onComplete.mock.calls[0][0];
    expect(result.totalScore).toBe(3); // 0 directions + 3 extraction
    expect(result.totalMaxScore).toBe(7);
  });

  it('works with no callbacks', () => {
    const task = new AssessmentListeningTask(makeConfig());
    task.startDirections();
    task.skipRemainingCheckpoints();
    task.submitAnswer('a');
    task.submitAnswer('b');
    task.submitAnswer('c');
    expect(task.status).toBe('completed');
  });
});
