/**
 * Viseme Generator for Lip Sync
 *
 * Generates viseme data from text input using phoneme-to-viseme mapping.
 * Supports Oculus OVR viseme format (15 visemes) with configurable quality levels.
 */

import type { Viseme, FacialData } from '../../../../shared/proto/conversation.js';

// ── Oculus OVR Viseme Set (15 visemes) ────────────────────────────────

export const OVR_VISEMES = [
  'sil', 'PP', 'FF', 'TH', 'DD', 'kk', 'CH', 'SS', 'nn', 'RR',
  'aa', 'E', 'ih', 'oh', 'ou',
] as const;

export type OVRViseme = typeof OVR_VISEMES[number];

// ── Simplified viseme set (5 mouth shapes) ────────────────────────────

export const SIMPLIFIED_VISEMES = ['sil', 'open', 'closed', 'wide', 'round'] as const;
export type SimplifiedViseme = typeof SIMPLIFIED_VISEMES[number];

// ── Quality levels ────────────────────────────────────────────────────

export type VisemeQuality = 'full' | 'simplified' | 'disabled';

// ── Phoneme-to-Viseme Mapping ─────────────────────────────────────────
// Maps lowercase characters/digraphs to OVR visemes.

const CHAR_TO_VISEME: Record<string, OVRViseme> = {
  // Bilabial plosives → PP
  p: 'PP', b: 'PP', m: 'PP',
  // Labiodental fricatives → FF
  f: 'FF', v: 'FF',
  // Dental fricatives → TH
  // (handled via digraph 'th')
  // Alveolar stops → DD
  d: 'DD', t: 'DD', l: 'DD',
  // Velar stops → kk
  k: 'kk', g: 'kk', q: 'kk', x: 'kk',
  // Post-alveolar affricates/fricatives → CH
  // (handled via digraphs 'ch', 'sh', 'zh')
  j: 'CH',
  // Alveolar fricatives → SS
  s: 'SS', z: 'SS', c: 'SS',
  // Alveolar nasal → nn
  n: 'nn',
  // Rhotic → RR
  r: 'RR',
  // Vowels
  a: 'aa',
  e: 'E',
  i: 'ih',
  o: 'oh',
  u: 'ou',
  y: 'ih',
  w: 'ou',
  h: 'sil',
};

// Digraph overrides (checked before single chars)
const DIGRAPH_TO_VISEME: Record<string, OVRViseme> = {
  th: 'TH',
  ch: 'CH',
  sh: 'CH',
  zh: 'CH',
  ng: 'nn',
  wh: 'ou',
  oo: 'ou',
  ee: 'E',
  ea: 'E',
  ou: 'ou',
  ow: 'oh',
  ai: 'E',
  ay: 'E',
  oi: 'oh',
  oy: 'oh',
};

// Full → Simplified mapping
const FULL_TO_SIMPLIFIED: Record<OVRViseme, SimplifiedViseme> = {
  sil: 'sil',
  PP: 'closed',
  FF: 'closed',
  TH: 'wide',
  DD: 'closed',
  kk: 'closed',
  CH: 'wide',
  SS: 'wide',
  nn: 'closed',
  RR: 'open',
  aa: 'open',
  E: 'wide',
  ih: 'wide',
  oh: 'round',
  ou: 'round',
};

// ── Text-to-Phoneme Approximation ─────────────────────────────────────

interface PhonemeToken {
  viseme: OVRViseme;
  /** Relative duration weight (vowels are longer than consonants) */
  weight: number;
}

/**
 * Convert text to a sequence of approximate phoneme tokens with OVR viseme mappings.
 * This is a rule-based approximation, not a full phoneme dictionary lookup.
 */
export function textToPhonemeTokens(text: string): PhonemeToken[] {
  const tokens: PhonemeToken[] = [];
  const lower = text.toLowerCase();
  let i = 0;

  while (i < lower.length) {
    const char = lower[i];

    // Skip non-alpha
    if (!/[a-z]/.test(char)) {
      // Space or punctuation → short silence
      if (char === ' ' || /[.,;:!?]/.test(char)) {
        // Only add silence if last token wasn't already silence
        if (tokens.length === 0 || tokens[tokens.length - 1].viseme !== 'sil') {
          tokens.push({ viseme: 'sil', weight: char === ' ' ? 0.3 : 0.6 });
        }
      }
      i++;
      continue;
    }

    // Check digraphs first
    if (i + 1 < lower.length) {
      const digraph = lower.slice(i, i + 2);
      const digraphViseme = DIGRAPH_TO_VISEME[digraph];
      if (digraphViseme) {
        const isVowelish = ['aa', 'E', 'ih', 'oh', 'ou'].includes(digraphViseme);
        tokens.push({ viseme: digraphViseme, weight: isVowelish ? 1.2 : 0.8 });
        i += 2;
        continue;
      }
    }

    // Single character mapping
    const viseme = CHAR_TO_VISEME[char] ?? 'sil';
    const isVowel = 'aeiou'.includes(char);
    tokens.push({ viseme, weight: isVowel ? 1.0 : 0.6 });
    i++;
  }

  return tokens;
}

// ── Viseme Generator ──────────────────────────────────────────────────

export interface IVisemeGenerator {
  /**
   * Generate visemes from text input synchronized to audio duration.
   * @param text - The text to generate visemes for
   * @param audioDurationMs - Duration of the corresponding audio chunk
   * @param quality - Viseme quality level
   * @returns FacialData with timed viseme sequence
   */
  generateVisemes(text: string, audioDurationMs: number, quality?: VisemeQuality): FacialData;
}

/**
 * Rule-based viseme generator using character-to-phoneme approximation.
 * Generates Oculus OVR visemes with timing synchronized to audio duration.
 */
export class VisemeGenerator implements IVisemeGenerator {
  generateVisemes(text: string, audioDurationMs: number, quality: VisemeQuality = 'full'): FacialData {
    if (quality === 'disabled' || !text.trim() || audioDurationMs <= 0) {
      return { visemes: [] };
    }

    const tokens = textToPhonemeTokens(text);
    if (tokens.length === 0) {
      return { visemes: [] };
    }

    // Calculate timing: distribute duration proportionally by weight
    const totalWeight = tokens.reduce((sum, t) => sum + t.weight, 0);
    if (totalWeight <= 0) {
      return { visemes: [] };
    }

    const msPerWeight = audioDurationMs / totalWeight;

    const visemes: Viseme[] = tokens.map((token) => {
      const durationMs = Math.max(1, Math.round(token.weight * msPerWeight));
      let phoneme: string = token.viseme;

      // Map to simplified if needed
      if (quality === 'simplified') {
        phoneme = FULL_TO_SIMPLIFIED[token.viseme] ?? 'sil';
      }

      return {
        phoneme,
        weight: token.viseme === 'sil' ? 0.0 : 1.0,
        durationMs,
      };
    });

    // Merge consecutive identical visemes for cleaner output
    const merged = mergeConsecutiveVisemes(visemes);

    // Adjust total duration to match audio exactly
    return { visemes: adjustTotalDuration(merged, audioDurationMs) };
  }
}

/**
 * Fallback viseme generator: simple open/close mouth pattern.
 * Used when full viseme generation is unavailable.
 */
export class FallbackVisemeGenerator implements IVisemeGenerator {
  generateVisemes(text: string, audioDurationMs: number, quality: VisemeQuality = 'full'): FacialData {
    if (quality === 'disabled' || !text.trim() || audioDurationMs <= 0) {
      return { visemes: [] };
    }

    // Estimate syllable count (~3 chars per syllable for English)
    const syllables = Math.max(1, Math.round(text.replace(/[^a-zA-Z]/g, '').length / 3));
    const cycleDuration = audioDurationMs / syllables;

    const visemes: Viseme[] = [];
    const openDuration = Math.max(1, Math.round(cycleDuration * 0.6));
    const closeDuration = Math.max(1, Math.round(cycleDuration * 0.4));

    for (let i = 0; i < syllables; i++) {
      visemes.push({ phoneme: 'aa', weight: 1.0, durationMs: openDuration });
      visemes.push({ phoneme: 'sil', weight: 0.0, durationMs: closeDuration });
    }

    return { visemes: adjustTotalDuration(visemes, audioDurationMs) };
  }
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Merge consecutive visemes with the same phoneme.
 */
function mergeConsecutiveVisemes(visemes: Viseme[]): Viseme[] {
  if (visemes.length === 0) return [];

  const merged: Viseme[] = [{ ...visemes[0] }];
  for (let i = 1; i < visemes.length; i++) {
    const last = merged[merged.length - 1];
    if (visemes[i].phoneme === last.phoneme) {
      last.durationMs += visemes[i].durationMs;
      // Keep higher weight
      last.weight = Math.max(last.weight, visemes[i].weight);
    } else {
      merged.push({ ...visemes[i] });
    }
  }
  return merged;
}

/**
 * Adjust viseme durations so total matches target audio duration exactly.
 */
function adjustTotalDuration(visemes: Viseme[], targetMs: number): Viseme[] {
  if (visemes.length === 0) return [];

  const currentTotal = visemes.reduce((sum, v) => sum + v.durationMs, 0);
  if (currentTotal === targetMs || currentTotal === 0) return visemes;

  // If there are more visemes than ms available, trim to fit
  if (visemes.length > targetMs) {
    // Keep only as many visemes as we have milliseconds, each 1ms
    const trimmed = visemes.slice(0, targetMs).map((v) => ({ ...v, durationMs: 1 }));
    // Last viseme absorbs any remainder
    if (trimmed.length > 0) {
      trimmed[trimmed.length - 1].durationMs = targetMs - (trimmed.length - 1);
    }
    return trimmed;
  }

  const ratio = targetMs / currentTotal;
  const result = visemes.map((v) => ({
    ...v,
    durationMs: Math.max(1, Math.round(v.durationMs * ratio)),
  }));

  // Correct any rounding drift by adjusting from the longest visemes
  let newTotal = result.reduce((sum, v) => sum + v.durationMs, 0);
  while (newTotal !== targetMs) {
    const drift = targetMs - newTotal;
    if (drift > 0) {
      // Under target: add to the longest viseme
      let longest = 0;
      for (let i = 1; i < result.length; i++) {
        if (result[i].durationMs > result[longest].durationMs) longest = i;
      }
      result[longest].durationMs += drift;
      break;
    } else {
      // Over target: subtract 1ms from the longest visemes until corrected
      let longest = 0;
      for (let i = 1; i < result.length; i++) {
        if (result[i].durationMs > result[longest].durationMs) longest = i;
      }
      if (result[longest].durationMs <= 1) break; // can't reduce further
      const reduction = Math.min(-drift, result[longest].durationMs - 1);
      result[longest].durationMs -= reduction;
      newTotal -= reduction;
    }
  }

  return result;
}

// ── Factory ──────────────────────────────────────────────────────────

/**
 * Create a viseme generator. Uses VisemeGenerator by default, with
 * FallbackVisemeGenerator as the fallback option.
 */
export function createVisemeGenerator(useFallback = false): IVisemeGenerator {
  return useFallback ? new FallbackVisemeGenerator() : new VisemeGenerator();
}
