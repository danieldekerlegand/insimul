/**
 * @insimul/sdk — JavaScript/TypeScript SDK for the Insimul conversation service
 *
 * Connect any web game to AI-powered NPC conversations with streaming text,
 * audio, viseme (lip sync), and action triggers.
 */

// ── Client ─────────────────────────────────────────────────────────────────
export { InsimulClient } from './client.js';

// ── Audio ──────────────────────────────────────────────────────────────────
export { StreamingAudioPlayer } from './streaming-audio-player.js';
export type { AudioPlayerCallbacks, AudioPlayerOptions } from './streaming-audio-player.js';

// ── Microphone ─────────────────────────────────────────────────────────────
export { MicCapture } from './mic-capture.js';
export type { MicCaptureCallbacks, MicCaptureOptions } from './mic-capture.js';

// ── Types ──────────────────────────────────────────────────────────────────
export {
  // Enums
  SystemCommandType,
  AudioEncoding,
  ConversationState,
} from './types.js';

export type {
  // Request types
  TextInput,
  AudioChunkInput,
  SystemCommand,
  // Response types
  TextChunk,
  AudioChunkOutput,
  Viseme,
  FacialData,
  ActionTrigger,
  ConversationMeta,
  // SSE event types
  SSEEvent,
  SSETextEvent,
  SSEAudioEvent,
  SSEFacialEvent,
  SSETranscriptEvent,
  SSEErrorEvent,
  // Config types
  InsimulClientOptions,
  ConversationOptions,
  InsimulEventCallbacks,
  HealthCheckResponse,
} from './types.js';
