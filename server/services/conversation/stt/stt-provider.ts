/**
 * Speech-to-Text Provider Interface
 *
 * Pluggable STT interface for streaming transcription. Mirrors the
 * provider pattern used by the LLM providers in ../providers/.
 */

import type { AudioEncoding } from '../../../../shared/proto/conversation.js';

// ── Types ─────────────────────────────────────────────────────────────

export interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  confidence: number;
  languageDetected: string;
}

export interface AudioStreamChunk {
  data: Uint8Array;
  encoding: AudioEncoding;
  sampleRate: number;
}

export interface STTOptions {
  languageCode?: string;
  sampleRate?: number;
  encoding?: AudioEncoding;
}

// ── Interface ─────────────────────────────────────────────────────────

export interface ISTTProvider {
  readonly name: string;

  /**
   * Stream transcription results from an audio stream.
   * Yields partial results as the speaker talks, with isFinal=true
   * for completed utterances.
   */
  streamTranscription(
    audioStream: AsyncIterable<AudioStreamChunk>,
    options?: STTOptions,
  ): AsyncIterable<TranscriptionResult>;
}

export type STTProviderFactory = () => ISTTProvider;

// ── Provider Registry ─────────────────────────────────────────────────

const sttProviders = new Map<string, STTProviderFactory>();

export function registerSTTProvider(name: string, factory: STTProviderFactory): void {
  sttProviders.set(name, factory);
}

export function getSTTProvider(name?: string): ISTTProvider {
  const providerName = name ?? process.env.STT_PROVIDER ?? 'google';
  const factory = sttProviders.get(providerName);
  if (!factory) {
    const available = Array.from(sttProviders.keys());
    throw new Error(
      `STT provider "${providerName}" not found. Available: ${available.join(', ') || 'none'}`,
    );
  }
  return factory();
}

export function getRegisteredSTTProviders(): string[] {
  return Array.from(sttProviders.keys());
}

export function clearSTTProviders(): void {
  sttProviders.clear();
}
