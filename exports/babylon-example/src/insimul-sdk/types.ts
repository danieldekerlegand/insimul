/**
 * Insimul SDK Type Definitions
 *
 * Mirrors the conversation service protobuf schema. These types define the
 * messages exchanged between SDK clients and the Insimul conversation service.
 */

// ── Enums ──────────────────────────────────────────────────────────────────

export enum SystemCommandType {
  SYSTEM_COMMAND_TYPE_UNSPECIFIED = 0,
  END = 1,
  PAUSE = 2,
  RESUME = 3,
}

export enum AudioEncoding {
  AUDIO_ENCODING_UNSPECIFIED = 0,
  PCM = 1,
  OPUS = 2,
  MP3 = 3,
}

export enum ConversationState {
  CONVERSATION_STATE_UNSPECIFIED = 0,
  STARTED = 1,
  ACTIVE = 2,
  PAUSED = 3,
  ENDED = 4,
}

// ── Request Messages ───────────────────────────────────────────────────────

export interface TextInput {
  text: string;
  sessionId: string;
  characterId: string;
  languageCode: string;
}

export interface AudioChunkInput {
  data: Uint8Array;
  encoding: AudioEncoding;
  sampleRate: number;
  sessionId: string;
  characterId: string;
}

export interface SystemCommand {
  type: SystemCommandType;
  sessionId: string;
  parameters: Record<string, string>;
}

// ── Response Messages ──────────────────────────────────────────────────────

export interface TextChunk {
  text: string;
  isFinal: boolean;
  languageCode?: string;
  sessionId?: string;
}

export interface AudioChunkOutput {
  data: Uint8Array;
  encoding: AudioEncoding;
  sampleRate: number;
  durationMs: number;
}

export interface Viseme {
  phoneme: string;
  weight: number;
  durationMs: number;
}

export interface FacialData {
  visemes: Viseme[];
}

export interface ActionTrigger {
  actionType: string;
  targetId: string;
  parameters: Record<string, string>;
}

export interface ConversationMeta {
  sessionId: string;
  state: ConversationState;
}

// ── SSE Event Types ────────────────────────────────────────────────────────

export interface SSETextEvent {
  type: 'text';
  text: string;
  isFinal: boolean;
}

export interface SSEAudioEvent {
  type: 'audio';
  data: string; // base64-encoded audio
  encoding: AudioEncoding;
  sampleRate: number;
  durationMs: number;
}

export interface SSEFacialEvent {
  type: 'facial';
  visemes: Viseme[];
}

export interface SSETranscriptEvent {
  type: 'transcript';
  text: string;
}

export interface SSEErrorEvent {
  type: 'error';
  message: string;
}

export type SSEEvent =
  | SSETextEvent
  | SSEAudioEvent
  | SSEFacialEvent
  | SSETranscriptEvent
  | SSEErrorEvent;

// ── Client Options ─────────────────────────────────────────────────────────

export interface InsimulClientOptions {
  /** Base URL of the Insimul server (e.g., "https://api.insimul.com") */
  serverUrl: string;
  /** API key for authentication */
  apiKey?: string;
  /** World ID to scope all conversations */
  worldId: string;
  /** Language code for conversations (default: "en") */
  languageCode?: string;
}

export interface ConversationOptions {
  /** Character ID of the NPC to converse with */
  characterId: string;
  /** Optional session ID to resume a previous conversation */
  sessionId?: string;
  /** Language code override for this conversation */
  languageCode?: string;
}

// ── Callback Types ─────────────────────────────────────────────────────────

export interface InsimulEventCallbacks {
  /** Fired for each text token received from the NPC */
  onTextChunk?: (chunk: TextChunk) => void;
  /** Fired for each audio chunk received (TTS output) */
  onAudioChunk?: (chunk: AudioChunkOutput) => void;
  /** Fired when viseme/facial data arrives for lip sync */
  onVisemeData?: (data: FacialData) => void;
  /** Fired when the server triggers a game action */
  onActionTrigger?: (action: ActionTrigger) => void;
  /** Fired on any error */
  onError?: (error: Error) => void;
  /** Fired when conversation state changes */
  onStateChange?: (state: ConversationState) => void;
}

// ── Health Check ───────────────────────────────────────────────────────────

export interface HealthCheckResponse {
  healthy: boolean;
  version: string;
  services?: Record<string, boolean>;
}
