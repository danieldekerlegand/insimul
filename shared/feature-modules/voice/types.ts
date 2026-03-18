/**
 * Voice Module — Generic Types
 *
 * Wraps the existing speech recognition + TTS system with
 * genre-agnostic configuration. Voice can serve as:
 *   - Language: speech practice, pronunciation
 *   - RPG: verbal spellcasting, voice commands
 *   - Strategy: RTS voice commands
 *   - Any genre: NPC dialogue TTS, accessibility
 */

// ---------------------------------------------------------------------------
// Voice capabilities
// ---------------------------------------------------------------------------

export interface VoiceCapabilities {
  /** Speech-to-text available. */
  sttEnabled: boolean;
  /** Text-to-speech available. */
  ttsEnabled: boolean;
  /** Real-time voice streaming available. */
  streamingEnabled: boolean;
  /** Voice activity detection available. */
  vadEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

export interface VoiceConfig {
  /** Whether STT should be active by default. */
  sttDefault: boolean;
  /** Whether NPC dialogue should use TTS by default. */
  ttsDefault: boolean;
  /** Language hint for speech recognition (BCP-47 locale). */
  recognitionLocale?: string;
  /** TTS voice preference. */
  ttsVoice?: string;
}

export const DEFAULT_CONFIG: VoiceConfig = {
  sttDefault: false,
  ttsDefault: true,
};
