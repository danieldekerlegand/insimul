/**
 * Client-Side Pronunciation Scorer
 *
 * Wraps the text-based pronunciation scoring cascade for use in game clients
 * without requiring a server API call. The cascade is:
 *
 *   1. If a text transcript is available (from STT), score it directly
 *   2. If an STT callback is provided, transcribe the audio first, then score
 *   3. Fall back to a heuristic score based on audio presence/length
 *
 * Results are emitted as game events so GamePrologEngine can assert
 * pronunciation_score/4 facts for quest evaluation.
 */

import {
  scorePronunciation,
  computeGrade,
  type PronunciationResult,
  type AudioPronunciationResult,
} from '../language/pronunciation-scoring.js';

export interface ClientPronunciationOptions {
  /** Expected phrase the player should have said */
  expectedPhrase: string;
  /** Language hint (e.g., 'French') for STT */
  languageHint?: string;
  /** Pre-transcribed text (if STT already happened) */
  transcript?: string;
  /** Audio data (Blob or base64 string) */
  audio?: Blob | string;
  /** Callback to perform STT on audio data — returns transcript text */
  sttCallback?: (audio: Blob | string, language?: string) => Promise<string>;
}

/**
 * Score pronunciation client-side using the available data.
 * Returns both the text-based PronunciationResult and an AudioPronunciationResult
 * wrapper for compatibility with NpcExamEngine.
 */
export async function scoreClientPronunciation(
  options: ClientPronunciationOptions,
): Promise<AudioPronunciationResult> {
  const { expectedPhrase, languageHint, audio, sttCallback } = options;
  let transcript = options.transcript || '';

  // Step 1: If no transcript, try STT
  if (!transcript && audio && sttCallback) {
    try {
      transcript = await sttCallback(audio, languageHint);
    } catch (err) {
      console.warn('[ClientPronunciation] STT failed:', err);
    }
  }

  // Step 2: If we have a transcript, use text-based scoring
  if (transcript) {
    const result = scorePronunciation(expectedPhrase, transcript);
    return textResultToAudioResult(result, expectedPhrase, transcript);
  }

  // Step 3: Fallback — heuristic based on audio presence
  const hasAudio = audio != null;
  const fallbackScore = hasAudio ? 50 : 0;
  const fallbackResult: PronunciationResult = {
    overallScore: fallbackScore,
    wordResults: [],
    feedback: hasAudio
      ? 'Audio received but could not be transcribed. Partial credit awarded.'
      : 'No response detected.',
    expectedPhrase,
    spokenPhrase: '',
  };

  return textResultToAudioResult(fallbackResult, expectedPhrase, '');
}

/**
 * Wrap a text-based PronunciationResult as an AudioPronunciationResult.
 */
function textResultToAudioResult(
  result: PronunciationResult,
  expectedPhrase: string,
  transcript: string,
): AudioPronunciationResult {
  return {
    ...result,
    audioWordScores: result.wordResults.map(wr => ({
      word: wr.expected,
      confidence: wr.similarity,
      pronunciationScore: Math.round(wr.similarity * 100),
      issue: wr.match === 'missed' ? 'word not detected' : undefined,
    })),
    fluencyScore: result.overallScore,
    grade: computeGrade(result.overallScore),
    scoringMethod: 'text-fallback',
  };
}
