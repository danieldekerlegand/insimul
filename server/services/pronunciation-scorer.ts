/**
 * Audio-level Pronunciation Scoring Service
 *
 * Uses Gemini's audio understanding to analyze pronunciation quality
 * from raw audio, producing per-word scores and fluency metrics.
 * Falls back to text-based Levenshtein scoring if audio analysis fails.
 */

import { getGenAI, isGeminiConfigured, GEMINI_MODELS } from "../config/gemini.js";
import {
  scorePronunciation,
  buildAudioResult,
  textResultAsAudioResult,
  type AudioPronunciationResult,
  type GeminiPronunciationAnalysis,
} from "@shared/language/pronunciation-scoring.js";

/**
 * Score pronunciation from audio data by sending audio + expected text to Gemini
 * for word-level pronunciation analysis.
 *
 * Falls back to text-based scoring if Gemini is unavailable or analysis fails.
 */
export async function scoreAudioPronunciation(
  audioBuffer: Buffer,
  expectedPhrase: string,
  mimeType: string = 'audio/wav',
  languageHint?: string,
): Promise<AudioPronunciationResult> {
  if (!isGeminiConfigured()) {
    return fallbackTextScore(audioBuffer, expectedPhrase, mimeType, languageHint);
  }

  try {
    const analysis = await analyzePronunciationWithGemini(
      audioBuffer, expectedPhrase, mimeType, languageHint,
    );
    return buildAudioResult(expectedPhrase, analysis);
  } catch (error) {
    console.error("Audio pronunciation analysis failed, falling back to text:", error);
    return fallbackTextScore(audioBuffer, expectedPhrase, mimeType, languageHint);
  }
}

/**
 * Send audio to Gemini with a structured prompt requesting word-level
 * pronunciation analysis. Returns parsed analysis or throws on failure.
 */
async function analyzePronunciationWithGemini(
  audioBuffer: Buffer,
  expectedPhrase: string,
  mimeType: string,
  languageHint?: string,
): Promise<GeminiPronunciationAnalysis> {
  const client = getGenAI();

  const languageInstruction = languageHint
    ? `The expected language is ${languageHint}.`
    : '';

  const prompt = `You are a pronunciation scoring engine. Analyze the audio recording and compare it against the expected phrase.

Expected phrase: "${expectedPhrase}"
${languageInstruction}

Respond ONLY with a JSON object (no markdown, no code fences) in this exact format:
{
  "transcript": "<what the speaker actually said>",
  "words": [
    {
      "word": "<expected word>",
      "confidence": <0.0-1.0 how confident you are in detecting this word>,
      "pronunciationScore": <0-100 how well this word was pronounced>,
      "issue": "<optional: brief description of pronunciation issue, or omit if correct>"
    }
  ],
  "fluencyScore": <0-100 based on pacing, hesitation, and natural flow>,
  "overallScore": <0-100 overall pronunciation quality>,
  "feedback": "<1-2 sentence human-friendly feedback>"
}

Rules:
- Include one entry in "words" for each word in the expected phrase
- If a word was skipped or not detected, give it confidence 0 and pronunciationScore 0
- Score pronunciation on clarity, correct vowel/consonant sounds, and stress
- fluencyScore reflects pacing and natural rhythm (penalize long pauses, false starts)
- Be encouraging but honest in feedback`;

  const response = await client.models.generateContent({
    model: GEMINI_MODELS.FLASH,
    contents: [
      prompt,
      {
        inlineData: {
          data: audioBuffer.toString('base64'),
          mimeType,
        },
      },
    ],
  });

  const text = response.text || '';
  return parseGeminiResponse(text, expectedPhrase);
}

/**
 * Parse Gemini's JSON response into a GeminiPronunciationAnalysis.
 * Handles minor formatting issues (markdown fences, trailing commas).
 */
function parseGeminiResponse(
  text: string,
  expectedPhrase: string,
): GeminiPronunciationAnalysis {
  // Strip markdown code fences if present
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return validateAnalysis(parsed, expectedPhrase);
  } catch {
    throw new Error(`Failed to parse Gemini pronunciation response: ${text.slice(0, 200)}`);
  }
}

/**
 * Validate and normalize the parsed analysis object.
 */
function validateAnalysis(
  parsed: any,
  expectedPhrase: string,
): GeminiPronunciationAnalysis {
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Gemini response is not an object');
  }

  const transcript = typeof parsed.transcript === 'string' ? parsed.transcript : expectedPhrase;
  const overallScore = clampScore(parsed.overallScore);
  const fluencyScore = clampScore(parsed.fluencyScore);
  const feedback = typeof parsed.feedback === 'string' ? parsed.feedback : '';

  const words: GeminiPronunciationAnalysis['words'] = [];
  if (Array.isArray(parsed.words)) {
    for (const w of parsed.words) {
      if (typeof w === 'object' && w !== null && typeof w.word === 'string') {
        words.push({
          word: w.word,
          confidence: clamp01(w.confidence),
          pronunciationScore: clampScore(w.pronunciationScore),
          issue: typeof w.issue === 'string' && w.issue.length > 0 ? w.issue : undefined,
        });
      }
    }
  }

  return { transcript, words, fluencyScore, overallScore, feedback };
}

function clamp01(val: unknown): number {
  const n = typeof val === 'number' ? val : 0;
  return Math.max(0, Math.min(1, n));
}

function clampScore(val: unknown): number {
  const n = typeof val === 'number' ? val : 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Fallback: transcribe audio via Gemini STT, then use text-based scoring.
 */
async function fallbackTextScore(
  audioBuffer: Buffer,
  expectedPhrase: string,
  mimeType: string,
  languageHint?: string,
): Promise<AudioPronunciationResult> {
  try {
    const { speechToText } = await import("./tts-stt.js");
    const transcript = await speechToText(audioBuffer, mimeType, languageHint);
    const textResult = scorePronunciation(expectedPhrase, transcript);
    return textResultAsAudioResult(textResult);
  } catch {
    // If STT also fails, return a zero-score fallback
    const textResult = scorePronunciation(expectedPhrase, '');
    return textResultAsAudioResult(textResult);
  }
}
