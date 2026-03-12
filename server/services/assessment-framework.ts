/**
 * Assessment Framework (US-5.06)
 *
 * Pre/post/delayed test framework for language learning evaluation.
 * Supports ACTFL OPI (language proficiency), SUS (usability), SSQ (simulator sickness),
 * and IPQ (immersive presence) instruments.
 *
 * Test sessions follow a timeline:
 *   1. Pre-test: administered before gameplay begins
 *   2. Post-test: administered immediately after gameplay session ends
 *   3. Delayed-test: administered 2+ weeks after gameplay for retention measurement
 */

// ───────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────

export type InstrumentType = 'actfl_opi' | 'sus' | 'ssq' | 'ipq';
export type TestPhase = 'pre' | 'post' | 'delayed';
export type QuestionType = 'likert_5' | 'likert_7' | 'open_ended' | 'multiple_choice' | 'rating_scale';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface InstrumentQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  /** For likert scales: anchor labels */
  scaleAnchors?: { low: string; high: string };
  /** Which phases this question appears in (empty = all) */
  phases?: TestPhase[];
  /** Whether this item is reverse-scored */
  reverseScored?: boolean;
  /** Subscale this question belongs to */
  subscale?: string;
  /** Required question */
  required?: boolean;
  /** Difficulty level for balanced test form generation */
  difficulty?: DifficultyLevel;
  /** Target language this item is specific to (undefined = language-agnostic) */
  targetLanguage?: string;
}

export interface InstrumentDefinition {
  id: InstrumentType;
  name: string;
  description: string;
  version: string;
  /** Citation for the instrument */
  citation: string;
  questions: InstrumentQuestion[];
  /** Scoring function */
  scoringMethod: 'mean' | 'sum' | 'weighted' | 'custom';
  /** Subscales within the instrument */
  subscales?: Array<{ id: string; name: string; questionIds: string[] }>;
  /** Minimum and maximum possible scores */
  scoreRange: { min: number; max: number };
  /** Time estimate in minutes */
  estimatedMinutes: number;
}

export interface TestSession {
  id: string;
  participantId: string;
  worldId: string;
  instrumentId: InstrumentType;
  phase: TestPhase;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  responses: Record<string, number | string>;
  score?: number;
  subscaleScores?: Record<string, number>;
  /** Target language being assessed */
  targetLanguage?: string;
}

export interface TestSchedule {
  participantId: string;
  worldId: string;
  instruments: InstrumentType[];
  preTestDate: Date;
  postTestDate: Date;
  delayedTestDate: Date;
  /** Delay in days between post and delayed test */
  delayedTestDelayDays: number;
  /** Target language for language-specific instruments */
  targetLanguage?: string;
}

// ───────────────────────────────────────────────────────────────────────────
// Instrument Definitions
// ───────────────────────────────────────────────────────────────────────────

const SUS_INSTRUMENT: InstrumentDefinition = {
  id: 'sus',
  name: 'System Usability Scale',
  description: 'A 10-item questionnaire measuring perceived usability of the system.',
  version: '1.0',
  citation: 'Brooke, J. (1996). SUS: A "quick and dirty" usability scale.',
  scoringMethod: 'custom', // SUS has special scoring: (sum of adjusted scores) * 2.5
  scoreRange: { min: 0, max: 100 },
  estimatedMinutes: 3,
  questions: [
    { id: 'sus_1', text: 'I think that I would like to use this system frequently.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, required: true },
    { id: 'sus_2', text: 'I found the system unnecessarily complex.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, reverseScored: true, required: true },
    { id: 'sus_3', text: 'I thought the system was easy to use.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, required: true },
    { id: 'sus_4', text: 'I think that I would need the support of a technical person to be able to use this system.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, reverseScored: true, required: true },
    { id: 'sus_5', text: 'I found the various functions in this system were well integrated.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, required: true },
    { id: 'sus_6', text: 'I thought there was too much inconsistency in this system.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, reverseScored: true, required: true },
    { id: 'sus_7', text: 'I would imagine that most people would learn to use this system very quickly.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, required: true },
    { id: 'sus_8', text: 'I found the system very cumbersome to use.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, reverseScored: true, required: true },
    { id: 'sus_9', text: 'I felt very confident using the system.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, required: true },
    { id: 'sus_10', text: 'I needed to learn a lot of things before I could get going with this system.', type: 'likert_5', scaleAnchors: { low: 'Strongly Disagree', high: 'Strongly Agree' }, reverseScored: true, required: true },
  ],
};

const SSQ_INSTRUMENT: InstrumentDefinition = {
  id: 'ssq',
  name: 'Simulator Sickness Questionnaire',
  description: 'A 16-item questionnaire measuring simulator sickness symptoms across three subscales.',
  version: '1.0',
  citation: 'Kennedy, R.S., Lane, N.E., Berbaum, K.S., & Lilienthal, M.G. (1993).',
  scoringMethod: 'weighted',
  scoreRange: { min: 0, max: 235.62 },
  estimatedMinutes: 5,
  subscales: [
    { id: 'nausea', name: 'Nausea', questionIds: ['ssq_1', 'ssq_6', 'ssq_7', 'ssq_8', 'ssq_9', 'ssq_15', 'ssq_16'] },
    { id: 'oculomotor', name: 'Oculomotor', questionIds: ['ssq_1', 'ssq_2', 'ssq_3', 'ssq_4', 'ssq_5', 'ssq_9', 'ssq_11'] },
    { id: 'disorientation', name: 'Disorientation', questionIds: ['ssq_5', 'ssq_8', 'ssq_10', 'ssq_11', 'ssq_12', 'ssq_13', 'ssq_14'] },
  ],
  questions: [
    { id: 'ssq_1', text: 'General discomfort', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'nausea', required: true },
    { id: 'ssq_2', text: 'Fatigue', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'oculomotor', required: true },
    { id: 'ssq_3', text: 'Headache', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'oculomotor', required: true },
    { id: 'ssq_4', text: 'Eye strain', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'oculomotor', required: true },
    { id: 'ssq_5', text: 'Difficulty focusing', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'oculomotor', required: true },
    { id: 'ssq_6', text: 'Increased salivation', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'nausea', required: true },
    { id: 'ssq_7', text: 'Sweating', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'nausea', required: true },
    { id: 'ssq_8', text: 'Nausea', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'nausea', required: true },
    { id: 'ssq_9', text: 'Difficulty concentrating', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'nausea', required: true },
    { id: 'ssq_10', text: 'Fullness of head', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'disorientation', required: true },
    { id: 'ssq_11', text: 'Blurred vision', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'oculomotor', required: true },
    { id: 'ssq_12', text: 'Dizzy (eyes open)', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'disorientation', required: true },
    { id: 'ssq_13', text: 'Dizzy (eyes closed)', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'disorientation', required: true },
    { id: 'ssq_14', text: 'Vertigo', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'disorientation', required: true },
    { id: 'ssq_15', text: 'Stomach awareness', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'nausea', required: true },
    { id: 'ssq_16', text: 'Burping', type: 'likert_5', scaleAnchors: { low: 'None', high: 'Severe' }, subscale: 'nausea', required: true },
  ],
};

const IPQ_INSTRUMENT: InstrumentDefinition = {
  id: 'ipq',
  name: 'iGroup Presence Questionnaire',
  description: 'A 14-item questionnaire measuring sense of presence in virtual environments.',
  version: '1.0',
  citation: 'Schubert, T., Friedmann, F., & Regenbrecht, H. (2001).',
  scoringMethod: 'mean',
  scoreRange: { min: 0, max: 6 },
  estimatedMinutes: 5,
  subscales: [
    { id: 'general_presence', name: 'General Presence', questionIds: ['ipq_1'] },
    { id: 'spatial_presence', name: 'Spatial Presence', questionIds: ['ipq_2', 'ipq_3', 'ipq_4', 'ipq_5', 'ipq_6'] },
    { id: 'involvement', name: 'Involvement', questionIds: ['ipq_7', 'ipq_8', 'ipq_9', 'ipq_10'] },
    { id: 'experienced_realism', name: 'Experienced Realism', questionIds: ['ipq_11', 'ipq_12', 'ipq_13', 'ipq_14'] },
  ],
  questions: [
    { id: 'ipq_1', text: 'In the virtual environment, I had a sense of "being there."', type: 'likert_7', scaleAnchors: { low: 'Not at all', high: 'Very much' }, subscale: 'general_presence', required: true },
    { id: 'ipq_2', text: 'Somehow I felt that the virtual world surrounded me.', type: 'likert_7', scaleAnchors: { low: 'Fully disagree', high: 'Fully agree' }, subscale: 'spatial_presence', required: true },
    { id: 'ipq_3', text: 'I felt like I was just perceiving pictures.', type: 'likert_7', scaleAnchors: { low: 'Fully disagree', high: 'Fully agree' }, subscale: 'spatial_presence', reverseScored: true, required: true },
    { id: 'ipq_4', text: 'I did not feel present in the virtual space.', type: 'likert_7', scaleAnchors: { low: 'Did not feel', high: 'Felt present' }, subscale: 'spatial_presence', reverseScored: true, required: true },
    { id: 'ipq_5', text: 'I had a sense of acting in the virtual space, rather than operating something from outside.', type: 'likert_7', scaleAnchors: { low: 'Fully disagree', high: 'Fully agree' }, subscale: 'spatial_presence', required: true },
    { id: 'ipq_6', text: 'I felt present in the virtual space.', type: 'likert_7', scaleAnchors: { low: 'Fully disagree', high: 'Fully agree' }, subscale: 'spatial_presence', required: true },
    { id: 'ipq_7', text: 'How aware were you of the real world surrounding while navigating in the virtual world?', type: 'likert_7', scaleAnchors: { low: 'Extremely aware', high: 'Not aware at all' }, subscale: 'involvement', required: true },
    { id: 'ipq_8', text: 'I was not aware of my real environment.', type: 'likert_7', scaleAnchors: { low: 'Fully disagree', high: 'Fully agree' }, subscale: 'involvement', required: true },
    { id: 'ipq_9', text: 'I still paid attention to the real environment.', type: 'likert_7', scaleAnchors: { low: 'Fully disagree', high: 'Fully agree' }, subscale: 'involvement', reverseScored: true, required: true },
    { id: 'ipq_10', text: 'I was completely captivated by the virtual world.', type: 'likert_7', scaleAnchors: { low: 'Fully disagree', high: 'Fully agree' }, subscale: 'involvement', required: true },
    { id: 'ipq_11', text: 'How real did the virtual world seem to you?', type: 'likert_7', scaleAnchors: { low: 'Completely real', high: 'Not real at all' }, subscale: 'experienced_realism', reverseScored: true, required: true },
    { id: 'ipq_12', text: 'How much did your experience in the virtual environment seem consistent with your real world experience?', type: 'likert_7', scaleAnchors: { low: 'Not consistent', high: 'Very consistent' }, subscale: 'experienced_realism', required: true },
    { id: 'ipq_13', text: 'How real did the virtual world seem to you?', type: 'likert_7', scaleAnchors: { low: 'An imagined world', high: 'Indistinguishable from real' }, subscale: 'experienced_realism', required: true },
    { id: 'ipq_14', text: 'The virtual world seemed more realistic than the real world.', type: 'likert_7', scaleAnchors: { low: 'Fully disagree', high: 'Fully agree' }, subscale: 'experienced_realism', required: true },
  ],
};

const ACTFL_OPI_INSTRUMENT: InstrumentDefinition = {
  id: 'actfl_opi',
  name: 'ACTFL Oral Proficiency Interview (Self-Assessment)',
  description: 'Self-assessment version of ACTFL proficiency guidelines for measuring language proficiency gains.',
  version: '1.0',
  citation: 'ACTFL (2012). ACTFL Proficiency Guidelines.',
  scoringMethod: 'mean',
  scoreRange: { min: 1, max: 10 },
  estimatedMinutes: 10,
  subscales: [
    { id: 'speaking', name: 'Speaking', questionIds: ['actfl_1', 'actfl_2', 'actfl_3'] },
    { id: 'listening', name: 'Listening', questionIds: ['actfl_4', 'actfl_5', 'actfl_6'] },
    { id: 'vocabulary', name: 'Vocabulary', questionIds: ['actfl_7', 'actfl_8'] },
    { id: 'confidence', name: 'Confidence', questionIds: ['actfl_9', 'actfl_10'] },
  ],
  questions: [
    { id: 'actfl_1', text: 'I can introduce myself and greet others in the target language.', type: 'rating_scale', scaleAnchors: { low: 'Cannot do at all', high: 'Can do easily' }, subscale: 'speaking', required: true, difficulty: 'easy' },
    { id: 'actfl_2', text: 'I can ask and answer simple questions about familiar topics (weather, family, daily routine).', type: 'rating_scale', scaleAnchors: { low: 'Cannot do at all', high: 'Can do easily' }, subscale: 'speaking', required: true, difficulty: 'easy' },
    { id: 'actfl_3', text: 'I can describe people, places, and things using connected sentences.', type: 'rating_scale', scaleAnchors: { low: 'Cannot do at all', high: 'Can do easily' }, subscale: 'speaking', required: true, difficulty: 'medium' },
    { id: 'actfl_4', text: 'I can understand simple greetings and common expressions.', type: 'rating_scale', scaleAnchors: { low: 'Cannot do at all', high: 'Can do easily' }, subscale: 'listening', required: true, difficulty: 'easy' },
    { id: 'actfl_5', text: 'I can understand the main idea of short conversations on familiar topics.', type: 'rating_scale', scaleAnchors: { low: 'Cannot do at all', high: 'Can do easily' }, subscale: 'listening', required: true, difficulty: 'medium' },
    { id: 'actfl_6', text: 'I can follow conversations between native speakers on everyday topics.', type: 'rating_scale', scaleAnchors: { low: 'Cannot do at all', high: 'Can do easily' }, subscale: 'listening', required: true, difficulty: 'hard' },
    { id: 'actfl_7', text: 'I know enough vocabulary to handle basic survival needs (ordering food, asking directions).', type: 'rating_scale', scaleAnchors: { low: 'Cannot do at all', high: 'Can do easily' }, subscale: 'vocabulary', required: true, difficulty: 'easy' },
    { id: 'actfl_8', text: 'I can use vocabulary related to a variety of everyday topics.', type: 'rating_scale', scaleAnchors: { low: 'Cannot do at all', high: 'Can do easily' }, subscale: 'vocabulary', required: true, difficulty: 'medium' },
    { id: 'actfl_9', text: 'I feel confident initiating a conversation in the target language.', type: 'rating_scale', scaleAnchors: { low: 'Not at all confident', high: 'Very confident' }, subscale: 'confidence', required: true, difficulty: 'medium' },
    { id: 'actfl_10', text: 'I feel comfortable making mistakes while speaking the target language.', type: 'rating_scale', scaleAnchors: { low: 'Not at all comfortable', high: 'Very comfortable' }, subscale: 'confidence', required: true, difficulty: 'hard' },
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// Instrument Registry
// ───────────────────────────────────────────────────────────────────────────

export const INSTRUMENTS: Record<InstrumentType, InstrumentDefinition> = {
  actfl_opi: ACTFL_OPI_INSTRUMENT,
  sus: SUS_INSTRUMENT,
  ssq: SSQ_INSTRUMENT,
  ipq: IPQ_INSTRUMENT,
};

export function getInstrument(id: InstrumentType): InstrumentDefinition {
  return INSTRUMENTS[id];
}

export function getAllInstruments(): InstrumentDefinition[] {
  return Object.values(INSTRUMENTS);
}

// ───────────────────────────────────────────────────────────────────────────
// Scoring
// ───────────────────────────────────────────────────────────────────────────

/** Score a set of responses for a given instrument */
export function scoreInstrument(
  instrumentId: InstrumentType,
  responses: Record<string, number | string>,
): { totalScore: number; subscaleScores: Record<string, number> } {
  const instrument = INSTRUMENTS[instrumentId];
  const numericResponses: Record<string, number> = {};

  // Convert responses to numeric, handling reverse scoring
  for (const question of instrument.questions) {
    const rawValue = responses[question.id];
    if (rawValue == null) continue;

    let value = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue);
    if (isNaN(value)) continue;

    if (question.reverseScored) {
      const maxScale = question.type === 'likert_7' ? 7 :
                       question.type === 'likert_5' ? 5 :
                       question.type === 'rating_scale' ? 10 : 5;
      value = (maxScale + 1) - value;
    }

    numericResponses[question.id] = value;
  }

  // Calculate subscale scores
  const subscaleScores: Record<string, number> = {};
  if (instrument.subscales) {
    for (const subscale of instrument.subscales) {
      const values = subscale.questionIds
        .map(qid => numericResponses[qid])
        .filter((v): v is number => v != null);

      if (values.length > 0) {
        subscaleScores[subscale.id] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
  }

  // Calculate total score
  let totalScore: number;
  const allValues = Object.values(numericResponses);

  if (instrumentId === 'sus') {
    // SUS special scoring: odd items (score - 1), even items (5 - score), sum * 2.5
    let adjustedSum = 0;
    for (let i = 0; i < instrument.questions.length; i++) {
      const value = numericResponses[instrument.questions[i].id];
      if (value == null) continue;
      // Odd-numbered items (1-indexed): contribution = scale position - 1
      // Even-numbered items: contribution = 5 - scale position
      // Note: reverseScored already applied above, so we use raw adjusted values
      if (i % 2 === 0) {
        adjustedSum += (value - 1);
      } else {
        adjustedSum += (5 - value);
      }
    }
    totalScore = adjustedSum * 2.5;
  } else if (instrument.scoringMethod === 'sum') {
    totalScore = allValues.reduce((a, b) => a + b, 0);
  } else {
    // mean
    totalScore = allValues.length > 0
      ? allValues.reduce((a, b) => a + b, 0) / allValues.length
      : 0;
  }

  return { totalScore, subscaleScores };
}

// ───────────────────────────────────────────────────────────────────────────
// Test Schedule Management
// ───────────────────────────────────────────────────────────────────────────

/** Create a test schedule for a participant */
export function createTestSchedule(
  participantId: string,
  worldId: string,
  options: {
    instruments?: InstrumentType[];
    postTestDelayMinutes?: number;
    delayedTestDelayDays?: number;
    targetLanguage?: string;
  } = {},
): TestSchedule {
  const now = new Date();
  const instruments = options.instruments ?? (['actfl_opi', 'sus', 'ssq', 'ipq'] as InstrumentType[]);
  const delayDays = options.delayedTestDelayDays ?? 14;

  // Post-test is scheduled relative to session end (placeholder: 0 minutes after)
  const postDate = new Date(now);
  postDate.setMinutes(postDate.getMinutes() + (options.postTestDelayMinutes ?? 0));

  // Delayed test
  const delayedDate = new Date(postDate);
  delayedDate.setDate(delayedDate.getDate() + delayDays);

  return {
    participantId,
    worldId,
    instruments,
    preTestDate: now,
    postTestDate: postDate,
    delayedTestDate: delayedDate,
    delayedTestDelayDays: delayDays,
    targetLanguage: options.targetLanguage,
  };
}

/** Generate empty test sessions from a schedule */
export function generateTestSessions(schedule: TestSchedule): Omit<TestSession, 'id'>[] {
  const sessions: Omit<TestSession, 'id'>[] = [];
  const phases: TestPhase[] = ['pre', 'post', 'delayed'];
  const dates = [schedule.preTestDate, schedule.postTestDate, schedule.delayedTestDate];

  for (const instrument of schedule.instruments) {
    for (let i = 0; i < phases.length; i++) {
      sessions.push({
        participantId: schedule.participantId,
        worldId: schedule.worldId,
        instrumentId: instrument,
        phase: phases[i],
        status: 'pending',
        scheduledAt: dates[i],
        responses: {},
        targetLanguage: schedule.targetLanguage,
      });
    }
  }

  return sessions;
}

/** Calculate gain scores between pre and post tests */
export function calculateGainScores(
  preScores: Record<string, number>,
  postScores: Record<string, number>,
): Record<string, { pre: number; post: number; gain: number; percentChange: number }> {
  const results: Record<string, { pre: number; post: number; gain: number; percentChange: number }> = {};

  for (const key of Object.keys(preScores)) {
    const pre = preScores[key];
    const post = postScores[key] ?? pre;
    const gain = post - pre;
    const percentChange = pre !== 0 ? (gain / pre) * 100 : 0;
    results[key] = { pre, post, gain, percentChange };
  }

  return results;
}

/** Compute descriptive statistics for a set of scores */
export function computeDescriptiveStats(scores: number[]): {
  n: number;
  mean: number;
  median: number;
  sd: number;
  min: number;
  max: number;
} {
  if (scores.length === 0) {
    return { n: 0, mean: 0, median: 0, sd: 0, min: 0, max: 0 };
  }

  const n = scores.length;
  const sorted = [...scores].sort((a, b) => a - b);
  const mean = scores.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];

  const variance = scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1 || 1);
  const sd = Math.sqrt(variance);

  return {
    n,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    sd: Math.round(sd * 100) / 100,
    min: sorted[0],
    max: sorted[n - 1],
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Language-Filtered Item Banks
// ───────────────────────────────────────────────────────────────────────────

/** Get instrument questions filtered by target language and/or difficulty */
export function getFilteredQuestions(
  instrumentId: InstrumentType,
  options: {
    targetLanguage?: string;
    difficulty?: DifficultyLevel;
  } = {},
): InstrumentQuestion[] {
  const instrument = INSTRUMENTS[instrumentId];
  let questions = instrument.questions;

  if (options.targetLanguage) {
    // Include items that are language-agnostic OR match the target language
    questions = questions.filter(
      q => !q.targetLanguage || q.targetLanguage === options.targetLanguage,
    );
  }

  if (options.difficulty) {
    questions = questions.filter(
      q => !q.difficulty || q.difficulty === options.difficulty,
    );
  }

  return questions;
}

// ───────────────────────────────────────────────────────────────────────────
// Parallel Test Form Generation
// ───────────────────────────────────────────────────────────────────────────

/**
 * Generate a parallel test form by selecting items that match the same difficulty
 * distribution while excluding previously administered items (to avoid practice effects).
 *
 * Returns a list of question IDs for the parallel form.
 */
export function generateParallelForm(
  testType: InstrumentType,
  targetLanguage?: string,
  excludeItemIds: string[] = [],
): InstrumentQuestion[] {
  const instrument = INSTRUMENTS[testType];
  const excludeSet = new Set(excludeItemIds);

  // Get eligible items (language-matched and not excluded)
  const eligible = instrument.questions.filter(q => {
    if (excludeSet.has(q.id)) return false;
    if (targetLanguage && q.targetLanguage && q.targetLanguage !== targetLanguage) return false;
    return true;
  });

  // Group eligible items by difficulty
  const byDifficulty: Record<string, InstrumentQuestion[]> = { easy: [], medium: [], hard: [], unset: [] };
  for (const q of eligible) {
    const key = q.difficulty ?? 'unset';
    byDifficulty[key].push(q);
  }

  // Count difficulty distribution of the original instrument (the target to match)
  const originalDist: Record<string, number> = { easy: 0, medium: 0, hard: 0, unset: 0 };
  for (const q of instrument.questions) {
    const key = q.difficulty ?? 'unset';
    originalDist[key]++;
  }

  // Select items matching the original difficulty distribution
  const selected: InstrumentQuestion[] = [];
  for (const difficulty of ['easy', 'medium', 'hard', 'unset'] as const) {
    const pool = byDifficulty[difficulty];
    const needed = originalDist[difficulty];

    // Shuffle pool for randomization
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, needed));
  }

  return selected;
}
