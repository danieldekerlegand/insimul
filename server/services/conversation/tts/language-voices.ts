/**
 * Shared language code resolution and Google Cloud TTS voice mapping.
 *
 * Provides BCP-47 normalization and per-language Wavenet/Neural2 voice
 * names so that TTS output uses a native-sounding voice for each language.
 */

// ── BCP-47 Language Code Map ────────────────────────────────────────

/** Map common language names/codes to BCP-47 codes for Google Cloud TTS. */
const LANGUAGE_CODE_MAP: Record<string, string> = {
  english: 'en-US', en: 'en-US',
  french: 'fr-FR', fr: 'fr-FR', français: 'fr-FR',
  spanish: 'es-ES', es: 'es-ES', español: 'es-ES',
  german: 'de-DE', de: 'de-DE', deutsch: 'de-DE',
  italian: 'it-IT', it: 'it-IT', italiano: 'it-IT',
  portuguese: 'pt-BR', pt: 'pt-BR', português: 'pt-BR',
  japanese: 'ja-JP', ja: 'ja-JP', '日本語': 'ja-JP',
  korean: 'ko-KR', ko: 'ko-KR', '한국어': 'ko-KR',
  chinese: 'zh-CN', zh: 'zh-CN', '中文': 'zh-CN', mandarin: 'zh-CN',
  arabic: 'ar-XA', ar: 'ar-XA', 'العربية': 'ar-XA',
  russian: 'ru-RU', ru: 'ru-RU', 'русский': 'ru-RU',
  dutch: 'nl-NL', nl: 'nl-NL',
  turkish: 'tr-TR', tr: 'tr-TR',
  hindi: 'hi-IN', hi: 'hi-IN',
  chitimacha: 'en-US', // No TTS support; fall back to English
};

/**
 * Resolve a language name or short code to a BCP-47 code.
 * Handles names ("French"), short codes ("fr"), and passthrough ("fr-FR").
 */
export function resolveLanguageCode(lang: string): string {
  const lower = lang.toLowerCase().trim();
  // Direct match
  if (LANGUAGE_CODE_MAP[lower]) return LANGUAGE_CODE_MAP[lower];
  // If it already looks like a BCP-47 code (e.g. "fr-FR"), use it directly
  if (/^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(lower)) {
    // Ensure proper casing: "fr-fr" → "fr-FR"
    const parts = lower.split('-');
    if (parts.length === 2) return `${parts[0]}-${parts[1].toUpperCase()}`;
    // Bare 2-letter code: try to expand via map
    if (LANGUAGE_CODE_MAP[parts[0]]) return LANGUAGE_CODE_MAP[parts[0]];
    return lang;
  }
  // Partial match (e.g. "Brazilian Portuguese" → "portuguese")
  for (const [key, code] of Object.entries(LANGUAGE_CODE_MAP)) {
    if (lower.includes(key)) return code;
  }
  return 'en-US';
}

/** Fallback: detect language from text content when no explicit language is provided. */
export function detectLanguageFromText(text: string): string {
  const isFrench = /[àâäéèêëïîôùûüÿçœæ]/i.test(text) || /\b(vous|est|les|des|une|dans)\b/i.test(text);
  if (isFrench) return 'fr-FR';
  const isSpanish = /[ñ¿¡]/i.test(text) || /\b(está|usted|gracias|señor)\b/i.test(text);
  if (isSpanish) return 'es-ES';
  const isGerman = /[äöüß]/i.test(text) || /\b(ich|und|der|die|das)\b/i.test(text);
  if (isGerman) return 'de-DE';
  return 'en-US';
}

// ── Per-Language Google Cloud TTS Voice Names ────────────────────────
//
// Google Cloud TTS picks a generic default when only languageCode + ssmlGender
// are specified. By providing an explicit voice `name`, we get a specific
// high-quality Wavenet or Neural2 voice that sounds native for each language.
//
// Each entry maps a BCP-47 prefix to { female, male } voice names.
// See: https://cloud.google.com/text-to-speech/docs/voices

interface LanguageVoiceSet {
  female: string;
  male: string;
}

const GOOGLE_TTS_VOICES: Record<string, LanguageVoiceSet> = {
  'en-US': { female: 'en-US-Neural2-F', male: 'en-US-Neural2-D' },
  'en-GB': { female: 'en-GB-Neural2-F', male: 'en-GB-Neural2-D' },
  'fr-FR': { female: 'fr-FR-Neural2-A', male: 'fr-FR-Neural2-D' },
  'es-ES': { female: 'es-ES-Neural2-A', male: 'es-ES-Neural2-B' },
  'de-DE': { female: 'de-DE-Neural2-C', male: 'de-DE-Neural2-D' },
  'it-IT': { female: 'it-IT-Neural2-A', male: 'it-IT-Neural2-C' },
  'pt-BR': { female: 'pt-BR-Neural2-C', male: 'pt-BR-Neural2-B' },
  'ja-JP': { female: 'ja-JP-Neural2-B', male: 'ja-JP-Neural2-D' },
  'ko-KR': { female: 'ko-KR-Neural2-A', male: 'ko-KR-Neural2-C' },
  'zh-CN': { female: 'cmn-CN-Wavenet-A', male: 'cmn-CN-Wavenet-C' },
  'ar-XA': { female: 'ar-XA-Wavenet-A', male: 'ar-XA-Wavenet-B' },
  'ru-RU': { female: 'ru-RU-Wavenet-A', male: 'ru-RU-Wavenet-B' },
  'nl-NL': { female: 'nl-NL-Wavenet-A', male: 'nl-NL-Wavenet-B' },
  'tr-TR': { female: 'tr-TR-Wavenet-A', male: 'tr-TR-Wavenet-B' },
  'hi-IN': { female: 'hi-IN-Neural2-A', male: 'hi-IN-Neural2-B' },
};

/**
 * Get the best Google Cloud TTS voice name for a language + gender.
 * Returns undefined if no specific voice is mapped (Google will use its default).
 */
export function getGoogleVoiceName(
  languageCode: string,
  gender: 'male' | 'female',
): string | undefined {
  // Try exact match first (e.g. "en-US")
  const voices = GOOGLE_TTS_VOICES[languageCode];
  if (voices) return voices[gender];

  // Try prefix match (e.g. "en-US" for "en-US-x-whatever")
  const prefix = languageCode.slice(0, 5); // "xx-YY"
  const prefixVoices = GOOGLE_TTS_VOICES[prefix];
  if (prefixVoices) return prefixVoices[gender];

  return undefined;
}
