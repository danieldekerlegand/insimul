/**
 * Text-to-Speech Provider Interface
 *
 * Pluggable TTS interface for streaming audio synthesis. Mirrors the
 * provider pattern used by STT providers in ../stt/.
 */

import type { AudioEncoding } from '../../../../shared/proto/conversation.js';

// ── Types ─────────────────────────────────────────────────────────────

export interface AudioChunkOutput {
  data: Uint8Array;
  encoding: AudioEncoding;
  sampleRate: number;
  durationMs: number;
}

export interface TTSOptions {
  languageCode?: string;
  speakingRate?: number;
  pitch?: number;
  encoding?: AudioEncoding;
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  ageRange: 'young' | 'middle' | 'senior';
  pitch: number;       // -20.0 to 20.0 semitones
  speakingRate: number; // 0.25 to 4.0
  description: string;
}

export interface CharacterVoiceAttributes {
  gender: string;
  age?: number;
  personality?: {
    openness?: number;
    conscientiousness?: number;
    extroversion?: number;
    agreeableness?: number;
    neuroticism?: number;
  };
}

// ── Voice Profiles (8 distinct: 4 male, 4 female) ────────────────────

export const VOICE_PROFILES: VoiceProfile[] = [
  // Female voices
  { id: 'f-young',  name: 'Aoede',  gender: 'female', ageRange: 'young',  pitch: 2.0,  speakingRate: 1.1, description: 'Young female, bright and energetic' },
  { id: 'f-mid-a',  name: 'Kore',   gender: 'female', ageRange: 'middle', pitch: 0.0,  speakingRate: 1.0, description: 'Adult female, clear and confident' },
  { id: 'f-mid-b',  name: 'Leda',   gender: 'female', ageRange: 'middle', pitch: -1.0, speakingRate: 0.95, description: 'Adult female, warm and calm' },
  { id: 'f-senior', name: 'Zephyr', gender: 'female', ageRange: 'senior', pitch: -3.0, speakingRate: 0.9, description: 'Older female, wise and measured' },
  // Male voices
  { id: 'm-young',  name: 'Puck',   gender: 'male',   ageRange: 'young',  pitch: 2.0,  speakingRate: 1.1, description: 'Young male, energetic and quick' },
  { id: 'm-mid-a',  name: 'Charon', gender: 'male',   ageRange: 'middle', pitch: 0.0,  speakingRate: 1.0, description: 'Adult male, steady and clear' },
  { id: 'm-mid-b',  name: 'Fenrir', gender: 'male',   ageRange: 'middle', pitch: -2.0, speakingRate: 0.95, description: 'Adult male, deep and authoritative' },
  { id: 'm-senior', name: 'Orus',   gender: 'male',   ageRange: 'senior', pitch: -4.0, speakingRate: 0.85, description: 'Older male, gravelly and slow' },
];

/**
 * Assign a voice profile to a character based on gender, age, and personality.
 */
export function assignVoiceProfile(attrs: CharacterVoiceAttributes): VoiceProfile {
  const gender = attrs.gender?.toLowerCase() === 'female' ? 'female' : 'male';
  const genderProfiles = VOICE_PROFILES.filter(v => v.gender === gender);

  // Determine age range
  let ageRange: 'young' | 'middle' | 'senior' = 'middle';
  if (attrs.age !== undefined) {
    if (attrs.age < 25) ageRange = 'young';
    else if (attrs.age >= 55) ageRange = 'senior';
  }

  // Find exact age match
  const ageMatches = genderProfiles.filter(v => v.ageRange === ageRange);
  if (ageMatches.length === 1) return ageMatches[0];

  // Multiple middle-age options — differentiate by personality
  if (ageMatches.length > 1 && attrs.personality) {
    // Higher extroversion → variant A (brighter); lower → variant B (deeper)
    const ext = attrs.personality.extroversion ?? 0;
    return ext >= 0 ? ageMatches[0] : ageMatches[1];
  }

  return ageMatches[0] ?? genderProfiles[0];
}

/**
 * Split text at sentence boundaries for TTS pipelining.
 * Each chunk is a complete sentence so TTS can start synthesising
 * while the LLM continues generating.
 */
export function splitAtSentenceBoundaries(text: string): string[] {
  if (!text.trim()) return [];

  // Split on sentence-ending punctuation followed by space or end of string
  const sentences: string[] = [];
  // Match sentences ending with .!? possibly followed by quotes/parens, then whitespace or end
  const regex = /[^.!?]*[.!?]+["')\]]?\s*/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const sentence = match[0].trim();
    if (sentence) sentences.push(sentence);
    lastIndex = regex.lastIndex;
  }

  // Leftover text (no sentence-ending punctuation)
  const remainder = text.slice(lastIndex).trim();
  if (remainder) sentences.push(remainder);

  return sentences;
}

// ── Interface ─────────────────────────────────────────────────────────

export interface ITTSProvider {
  readonly name: string;

  /**
   * Synthesize text to streaming audio chunks.
   * Yields AudioChunkOutput as audio data becomes available.
   */
  synthesize(
    text: string,
    voice: VoiceProfile,
    options?: TTSOptions,
  ): AsyncIterable<AudioChunkOutput>;
}

export type TTSProviderFactory = () => ITTSProvider;

// ── Provider Registry ─────────────────────────────────────────────────

const ttsProviders = new Map<string, TTSProviderFactory>();

export function registerTTSProvider(name: string, factory: TTSProviderFactory): void {
  ttsProviders.set(name, factory);
}

export function getTTSProvider(name?: string): ITTSProvider {
  const providerName = name ?? process.env.TTS_PROVIDER ?? 'google';
  const factory = ttsProviders.get(providerName);
  if (!factory) {
    const available = Array.from(ttsProviders.keys());
    throw new Error(
      `TTS provider "${providerName}" not found. Available: ${available.join(', ') || 'none'}`,
    );
  }
  return factory();
}

export function getRegisteredTTSProviders(): string[] {
  return Array.from(ttsProviders.keys());
}

export function clearTTSProviders(): void {
  ttsProviders.clear();
}
