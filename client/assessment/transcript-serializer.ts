/**
 * Transcript Serializer
 *
 * Converts phase-specific transcript data into the common TranscriptEntry[]
 * and RecordingReference formats for storage. Each phase handler produces
 * different result structures; this module normalizes them.
 */

import type {
  PhaseResult,
  RecordingReference,
  TranscriptEntry,
} from '../../shared/assessment/assessment-types';

// ─── Conversation Phase ──────────────────────────────────────────────────────

export interface ConversationTranscriptEntry {
  role: 'player' | 'npc';
  text: string;
  timestamp: number;
  metrics?: Record<string, number>;
  dimensionScores?: Record<string, number>;
}

/**
 * Serialize a conversation phase transcript into PhaseResult transcript
 * and a text/plain RecordingReference for the full conversation log.
 */
export function serializeConversationPhase(
  phaseId: string,
  entries: ConversationTranscriptEntry[],
  score: number,
  maxPoints: number,
  dimensionScores?: Record<string, number>,
  automatedMetrics?: PhaseResult['automatedMetrics'],
): PhaseResult {
  const transcript: TranscriptEntry[] = entries.map(e => ({
    role: e.role,
    text: e.text,
    timestamp: e.timestamp,
    phaseId,
  }));

  const recordings: RecordingReference[] = [];
  if (entries.length > 0) {
    const fullText = entries.map(e => `[${e.role}] ${e.text}`).join('\n');
    recordings.push({
      storageKey: `transcript:${phaseId}:conversation`,
      mimeType: 'text/plain',
      phaseId,
      recordedAt: new Date().toISOString(),
      durationSeconds: entries.length > 1
        ? Math.round((entries[entries.length - 1].timestamp - entries[0].timestamp) / 1000)
        : undefined,
    });
  }

  return {
    phaseId,
    score,
    maxPoints,
    taskResults: [{ taskId: `${phaseId}_conversation`, score, maxPoints }],
    dimensionScores,
    automatedMetrics,
    transcript,
    recordings,
    startedAt: entries.length > 0 ? new Date(entries[0].timestamp).toISOString() : undefined,
    completedAt: new Date().toISOString(),
  };
}

// ─── Listening Phase ─────────────────────────────────────────────────────────

export interface ListeningPhaseData {
  directionsScore: number;
  directionsMaxScore: number;
  checkpointResults: Array<{ checkpointId: string; reached: boolean }>;
  extractionScore: number;
  extractionMaxScore: number;
  questionResults: Array<{ questionId: string; playerAnswer: string; correct: boolean }>;
  announcementText: string;
  durationMs: number;
}

/**
 * Serialize listening task results into a PhaseResult with transcript
 * entries for the announcement and player answers.
 */
export function serializeListeningPhase(
  phaseId: string,
  data: ListeningPhaseData,
): PhaseResult {
  const transcript: TranscriptEntry[] = [];
  const now = Date.now();

  // The announcement is the "system" utterance the player listened to
  transcript.push({
    role: 'system',
    text: data.announcementText,
    timestamp: now - data.durationMs,
    phaseId,
    taskId: `${phaseId}_directions`,
  });

  // Record player answers to extraction questions
  for (const qr of data.questionResults) {
    transcript.push({
      role: 'player',
      text: qr.playerAnswer,
      timestamp: now,
      phaseId,
      taskId: `${phaseId}_extraction`,
    });
  }

  const totalScore = data.directionsScore + data.extractionScore;
  const totalMax = data.directionsMaxScore + data.extractionMaxScore;

  const recordings: RecordingReference[] = [{
    storageKey: `transcript:${phaseId}:listening`,
    mimeType: 'text/plain',
    phaseId,
    recordedAt: new Date().toISOString(),
    durationSeconds: Math.round(data.durationMs / 1000),
  }];

  return {
    phaseId,
    score: totalScore,
    maxPoints: totalMax,
    taskResults: [
      {
        taskId: `${phaseId}_directions`,
        score: data.directionsScore,
        maxPoints: data.directionsMaxScore,
        playerResponse: JSON.stringify(data.checkpointResults),
      },
      {
        taskId: `${phaseId}_extraction`,
        score: data.extractionScore,
        maxPoints: data.extractionMaxScore,
        playerResponse: JSON.stringify(data.questionResults),
      },
    ],
    transcript,
    recordings,
    startedAt: new Date(now - data.durationMs).toISOString(),
    completedAt: new Date(now).toISOString(),
  };
}

// ─── Writing Phase ───────────────────────────────────────────────────────────

export interface WritingPhaseData {
  formFields?: Record<string, string>;
  formScore: number;
  formMaxPoints: number;
  messageText?: string;
  messageScore: number;
  messageMaxPoints: number;
  startedAt: number;
  completedAt: number;
}

/**
 * Serialize writing task results into a PhaseResult. Both form fields
 * and message text are stored verbatim in the transcript.
 */
export function serializeWritingPhase(
  phaseId: string,
  data: WritingPhaseData,
): PhaseResult {
  const transcript: TranscriptEntry[] = [];

  // Store form submission as a player transcript entry
  if (data.formFields) {
    const formText = Object.entries(data.formFields)
      .map(([field, value]) => `${field}: ${value}`)
      .join('\n');
    transcript.push({
      role: 'player',
      text: formText,
      timestamp: data.startedAt,
      phaseId,
      taskId: `${phaseId}_form`,
    });
  }

  // Store message as a player transcript entry
  if (data.messageText) {
    transcript.push({
      role: 'player',
      text: data.messageText,
      timestamp: data.completedAt,
      phaseId,
      taskId: `${phaseId}_message`,
    });
  }

  const totalScore = data.formScore + data.messageScore;
  const totalMax = data.formMaxPoints + data.messageMaxPoints;

  const recordings: RecordingReference[] = [{
    storageKey: `transcript:${phaseId}:writing`,
    mimeType: 'text/plain',
    phaseId,
    recordedAt: new Date(data.completedAt).toISOString(),
    durationSeconds: Math.round((data.completedAt - data.startedAt) / 1000),
  }];

  return {
    phaseId,
    score: totalScore,
    maxPoints: totalMax,
    taskResults: [
      {
        taskId: `${phaseId}_form`,
        score: data.formScore,
        maxPoints: data.formMaxPoints,
        playerResponse: data.formFields ? JSON.stringify(data.formFields) : undefined,
      },
      {
        taskId: `${phaseId}_message`,
        score: data.messageScore,
        maxPoints: data.messageMaxPoints,
        playerResponse: data.messageText,
      },
    ],
    transcript,
    recordings,
    startedAt: new Date(data.startedAt).toISOString(),
    completedAt: new Date(data.completedAt).toISOString(),
  };
}

// ─── Visual Phase ────────────────────────────────────────────────────────────

export interface VisualPhaseData {
  signResults: Array<{ signId: string; playerAnswer: string; correct: boolean }>;
  signScore: number;
  signMaxScore: number;
  objectResults: Array<{ objectId: string; playerAnswer: string; correct: boolean }>;
  objectScore: number;
  objectMaxScore: number;
  durationMs: number;
}

/**
 * Serialize visual recognition task results into a PhaseResult.
 * Player answers are stored as transcript entries.
 */
export function serializeVisualPhase(
  phaseId: string,
  data: VisualPhaseData,
): PhaseResult {
  const transcript: TranscriptEntry[] = [];
  const now = Date.now();

  for (const sr of data.signResults) {
    transcript.push({
      role: 'player',
      text: sr.playerAnswer,
      timestamp: now,
      phaseId,
      taskId: `${phaseId}_signs`,
    });
  }

  for (const or of data.objectResults) {
    transcript.push({
      role: 'player',
      text: or.playerAnswer,
      timestamp: now,
      phaseId,
      taskId: `${phaseId}_objects`,
    });
  }

  const totalScore = data.signScore + data.objectScore;
  const totalMax = data.signMaxScore + data.objectMaxScore;

  const recordings: RecordingReference[] = [{
    storageKey: `transcript:${phaseId}:visual`,
    mimeType: 'text/plain',
    phaseId,
    recordedAt: new Date().toISOString(),
    durationSeconds: Math.round(data.durationMs / 1000),
  }];

  return {
    phaseId,
    score: totalScore,
    maxPoints: totalMax,
    taskResults: [
      {
        taskId: `${phaseId}_signs`,
        score: data.signScore,
        maxPoints: data.signMaxScore,
        playerResponse: JSON.stringify(data.signResults),
      },
      {
        taskId: `${phaseId}_objects`,
        score: data.objectScore,
        maxPoints: data.objectMaxScore,
        playerResponse: JSON.stringify(data.objectResults),
      },
    ],
    transcript,
    recordings,
    startedAt: new Date(now - data.durationMs).toISOString(),
    completedAt: new Date(now).toISOString(),
  };
}
