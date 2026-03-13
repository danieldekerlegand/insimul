/**
 * Assessment Conversation Controller (US-5.06)
 *
 * Manages the conversational phase of an assessment encounter.
 * - Tier tracking: advance after 3 good exchanges, drop on struggle
 * - 8–10 minute timer
 * - Real-time automated metrics: WPM, TTR, MLU, latency, repairs, code-switching
 * - Full transcript storage
 */

import type { AutomatedMetrics, CefrLevel } from '../../shared/assessment/assessment-types';
import {
  type AssessmentTier,
  type CharacterProfile,
  type DimensionScores,
  buildAssessmentSystemPrompt,
  parseAssessmentEvalBlock,
} from './assessment-prompt-utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TranscriptEntry {
  role: 'player' | 'npc';
  text: string;
  timestamp: number;
  metrics?: ExchangeMetrics;
  dimensionScores?: DimensionScores;
}

export interface ExchangeMetrics {
  wpm: number;
  ttr: number;
  mlu: number;
  latencyMs: number;
  repairs: number;
  codeSwitchCount: number;
}

export type ConversationStatus = 'idle' | 'active' | 'paused' | 'completed' | 'timed_out';

export interface TierChangeEvent {
  previous: AssessmentTier;
  current: AssessmentTier;
  direction: 'up' | 'down';
  exchangeIndex: number;
}

export interface ConversationCallbacks {
  onTierChange?: (event: TierChangeEvent) => void;
  onTranscriptUpdate?: (entry: TranscriptEntry) => void;
  onTimeWarning?: (remainingSeconds: number) => void;
  onComplete?: (result: ConversationResult) => void;
  onSystemPromptUpdate?: (prompt: string) => void;
}

export interface ConversationResult {
  transcript: TranscriptEntry[];
  finalTier: AssessmentTier;
  aggregateMetrics: AutomatedMetrics;
  dimensionAverages: DimensionScores;
  durationMs: number;
  exchangeCount: number;
  tierHistory: AssessmentTier[];
}

export interface ConversationControllerConfig {
  /** Duration in seconds (default: 480 = 8 min) */
  durationSeconds?: number;
  /** Max duration in seconds (default: 600 = 10 min) */
  maxDurationSeconds?: number;
  /** Good exchange threshold: average dimension score (default: 3.5 out of 5) */
  goodExchangeThreshold?: number;
  /** Struggle threshold: average dimension score (default: 2.0 out of 5) */
  struggleThreshold?: number;
  /** Consecutive good exchanges needed to advance tier (default: 3) */
  advanceCount?: number;
  /** Known native language for code-switch detection (default: 'en') */
  nativeLanguage?: string;
  /** Target language being assessed */
  targetLanguage: string;
  /** NPC character profile */
  characterProfile: CharacterProfile;
  /** Starting tier (default: 'A1') */
  startingTier?: AssessmentTier;
  /** Time warning thresholds in seconds remaining (default: [120, 60, 30]) */
  timeWarnings?: number[];
}

// ─── Metrics computation ─────────────────────────────────────────────────────

/** Count words in a text string */
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Compute Type-Token Ratio: unique words / total words */
function computeTTR(text: string): number {
  const words = text.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const unique = new Set(words);
  return unique.size / words.length;
}

/** Compute Mean Length of Utterance (words per sentence/utterance) */
function computeMLU(text: string): number {
  const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + wordCount(s), 0);
  return totalWords / sentences.length;
}

/** Count self-repairs: patterns like "I mean", "no wait", "sorry," corrections */
function countRepairs(text: string): number {
  const repairPatterns = [
    /\bi mean\b/gi,
    /\bno wait\b/gi,
    /\bsorry,?\s/gi,
    /\bactually\b/gi,
    /\blet me rephrase\b/gi,
    /\bcorrection\b/gi,
    /\bi meant\b/gi,
    /\bnot\s+\w+,?\s+\w+/gi, // "not X, Y" correction pattern
  ];
  return repairPatterns.reduce((count, pattern) => count + (text.match(pattern)?.length ?? 0), 0);
}

// Common words per language for basic code-switch detection
const COMMON_WORDS: Record<string, Set<string>> = {
  en: new Set(['the', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'shall', 'must', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'this', 'that', 'these', 'those', 'a', 'an', 'and', 'but', 'or', 'not', 'no', 'yes', 'what', 'where', 'when', 'how', 'why', 'who', 'which', 'if', 'then', 'so', 'because', 'very', 'just', 'also', 'too', 'only']),
  es: new Set(['el', 'la', 'los', 'las', 'un', 'una', 'es', 'son', 'soy', 'eres', 'está', 'están', 'tiene', 'tengo', 'yo', 'tú', 'él', 'ella', 'nosotros', 'ellos', 'ellas', 'pero', 'y', 'o', 'no', 'sí', 'qué', 'dónde', 'cuándo', 'cómo', 'por qué', 'quién', 'muy', 'también', 'solo']),
  fr: new Set(['le', 'la', 'les', 'un', 'une', 'des', 'est', 'sont', 'suis', 'es', 'a', 'ont', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'mais', 'et', 'ou', 'ne', 'pas', 'oui', 'non', 'que', 'qui', 'où', 'quand', 'comment', 'pourquoi', 'très', 'aussi']),
  de: new Set(['der', 'die', 'das', 'ein', 'eine', 'ist', 'sind', 'bin', 'bist', 'hat', 'haben', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'aber', 'und', 'oder', 'nicht', 'ja', 'nein', 'was', 'wo', 'wann', 'wie', 'warum', 'wer', 'sehr', 'auch', 'nur']),
  ja: new Set(['は', 'が', 'の', 'に', 'を', 'で', 'と', 'も', 'か', 'です', 'ます', 'した', 'ない', 'ある', 'いる', 'する', 'なる', 'これ', 'それ', 'あれ', 'この', 'その', 'あの']),
};

/** Count code-switches between native and target language */
function countCodeSwitches(text: string, nativeLanguage: string, targetLanguage: string): number {
  const nativeWords = COMMON_WORDS[nativeLanguage];
  const targetWords = COMMON_WORDS[targetLanguage];
  if (!nativeWords || !targetWords) return 0;

  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  let switches = 0;
  let lastLang: 'native' | 'target' | null = null;

  for (const word of words) {
    let currentLang: 'native' | 'target' | null = null;
    if (nativeWords.has(word)) currentLang = 'native';
    else if (targetWords.has(word)) currentLang = 'target';

    if (currentLang && lastLang && currentLang !== lastLang) {
      switches++;
    }
    if (currentLang) lastLang = currentLang;
  }

  return switches;
}

// ─── Controller ──────────────────────────────────────────────────────────────

const TIERS_ORDERED: AssessmentTier[] = ['A1', 'A2', 'B1'];
const DEFAULT_DURATION_SECONDS = 480;   // 8 minutes
const DEFAULT_MAX_DURATION_SECONDS = 600; // 10 minutes
const DEFAULT_GOOD_THRESHOLD = 3.5;
const DEFAULT_STRUGGLE_THRESHOLD = 2.0;
const DEFAULT_ADVANCE_COUNT = 3;
const DEFAULT_TIME_WARNINGS = [120, 60, 30];

export class AssessmentConversationController {
  private _status: ConversationStatus = 'idle';
  private _tier: AssessmentTier;
  private _transcript: TranscriptEntry[] = [];
  private _tierHistory: AssessmentTier[] = [];
  private _consecutiveGood = 0;
  private _exchangeIndex = 0;
  private _startTime = 0;
  private _lastPlayerMessageTime = 0;
  private _timerHandle: ReturnType<typeof setTimeout> | null = null;
  private _warningHandles: ReturnType<typeof setTimeout>[] = [];
  private _firedWarnings = new Set<number>();

  private readonly _config: Required<ConversationControllerConfig>;
  private readonly _callbacks: ConversationCallbacks;

  constructor(config: ConversationControllerConfig, callbacks: ConversationCallbacks = {}) {
    this._config = {
      durationSeconds: config.durationSeconds ?? DEFAULT_DURATION_SECONDS,
      maxDurationSeconds: config.maxDurationSeconds ?? DEFAULT_MAX_DURATION_SECONDS,
      goodExchangeThreshold: config.goodExchangeThreshold ?? DEFAULT_GOOD_THRESHOLD,
      struggleThreshold: config.struggleThreshold ?? DEFAULT_STRUGGLE_THRESHOLD,
      advanceCount: config.advanceCount ?? DEFAULT_ADVANCE_COUNT,
      nativeLanguage: config.nativeLanguage ?? 'en',
      targetLanguage: config.targetLanguage,
      characterProfile: config.characterProfile,
      startingTier: config.startingTier ?? 'A1',
      timeWarnings: config.timeWarnings ?? DEFAULT_TIME_WARNINGS,
    };
    this._tier = this._config.startingTier;
    this._callbacks = callbacks;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  get status(): ConversationStatus { return this._status; }
  get currentTier(): AssessmentTier { return this._tier; }
  get transcript(): ReadonlyArray<TranscriptEntry> { return this._transcript; }
  get exchangeCount(): number { return this._exchangeIndex; }
  get elapsedMs(): number { return this._startTime > 0 ? Date.now() - this._startTime : 0; }
  get remainingMs(): number {
    if (this._startTime === 0) return this._config.maxDurationSeconds * 1000;
    return Math.max(0, this._config.maxDurationSeconds * 1000 - this.elapsedMs);
  }

  /** Start the conversation session. Returns the initial system prompt. */
  start(): string {
    if (this._status !== 'idle') {
      throw new Error(`Cannot start: status is ${this._status}`);
    }

    this._status = 'active';
    this._startTime = Date.now();
    this._tierHistory.push(this._tier);

    // Set up max duration timer
    this._timerHandle = setTimeout(() => this._onTimeout(), this._config.maxDurationSeconds * 1000);

    // Set up time warnings
    for (const warningSeconds of this._config.timeWarnings) {
      const delayMs = (this._config.maxDurationSeconds - warningSeconds) * 1000;
      if (delayMs > 0) {
        const handle = setTimeout(() => {
          if (this._status === 'active' && !this._firedWarnings.has(warningSeconds)) {
            this._firedWarnings.add(warningSeconds);
            this._callbacks.onTimeWarning?.(warningSeconds);
          }
        }, delayMs);
        this._warningHandles.push(handle);
      }
    }

    const prompt = this._buildCurrentPrompt();
    this._callbacks.onSystemPromptUpdate?.(prompt);
    return prompt;
  }

  /** Record a player message and compute exchange metrics. */
  addPlayerMessage(text: string): ExchangeMetrics {
    this._assertActive();
    const now = Date.now();
    const latencyMs = this._lastPlayerMessageTime > 0 ? now - this._lastPlayerMessageTime : 0;

    const metrics = this._computeExchangeMetrics(text, latencyMs);
    const entry: TranscriptEntry = {
      role: 'player',
      text,
      timestamp: now,
      metrics,
    };

    this._transcript.push(entry);
    this._lastPlayerMessageTime = now;
    this._callbacks.onTranscriptUpdate?.(entry);
    return metrics;
  }

  /**
   * Process an NPC response. Parses the EVAL block, updates tier tracking,
   * and returns the cleaned response text.
   */
  addNpcResponse(rawResponse: string): { cleanedResponse: string; dimensions: DimensionScores | null } {
    this._assertActive();

    const { dimensions, cleanedResponse } = parseAssessmentEvalBlock(rawResponse);
    const entry: TranscriptEntry = {
      role: 'npc',
      text: cleanedResponse,
      timestamp: Date.now(),
      dimensionScores: dimensions ?? undefined,
    };

    this._transcript.push(entry);
    this._callbacks.onTranscriptUpdate?.(entry);

    if (dimensions) {
      this._evaluateExchange(dimensions);
      this._exchangeIndex++;
    }

    return { cleanedResponse, dimensions };
  }

  /** Complete the conversation early (before timer). */
  complete(): ConversationResult {
    if (this._status !== 'active' && this._status !== 'paused') {
      throw new Error(`Cannot complete: status is ${this._status}`);
    }
    return this._finalize('completed');
  }

  /** Pause the timer. */
  pause(): void {
    this._assertActive();
    this._status = 'paused';
  }

  /** Resume from pause. */
  resume(): void {
    if (this._status !== 'paused') {
      throw new Error(`Cannot resume: status is ${this._status}`);
    }
    this._status = 'active';
  }

  /** Get the current system prompt (for re-sending after tier change). */
  getCurrentPrompt(): string {
    return this._buildCurrentPrompt();
  }

  /** Get aggregate metrics across all player exchanges. */
  getAggregateMetrics(): AutomatedMetrics {
    return this._computeAggregateMetrics();
  }

  /** Get average dimension scores across all NPC evaluations. */
  getDimensionAverages(): DimensionScores {
    return this._computeDimensionAverages();
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  private _assertActive(): void {
    if (this._status !== 'active') {
      throw new Error(`Conversation is not active (status: ${this._status})`);
    }
  }

  private _buildCurrentPrompt(): string {
    return buildAssessmentSystemPrompt(
      this._tier,
      this._config.characterProfile,
      this._config.targetLanguage,
    );
  }

  private _computeExchangeMetrics(text: string, latencyMs: number): ExchangeMetrics {
    const words = wordCount(text);
    const elapsedMinutes = latencyMs > 0 ? latencyMs / 60000 : 0;
    const wpm = elapsedMinutes > 0 ? words / elapsedMinutes : 0;

    return {
      wpm: Math.round(wpm * 10) / 10,
      ttr: Math.round(computeTTR(text) * 1000) / 1000,
      mlu: Math.round(computeMLU(text) * 10) / 10,
      latencyMs,
      repairs: countRepairs(text),
      codeSwitchCount: countCodeSwitches(text, this._config.nativeLanguage, this._config.targetLanguage),
    };
  }

  private _evaluateExchange(dimensions: DimensionScores): void {
    const avg = (dimensions.vocab + dimensions.grammar + dimensions.fluency +
      dimensions.pronunciation + dimensions.comprehension) / 5;

    if (avg >= this._config.goodExchangeThreshold) {
      this._consecutiveGood++;
      if (this._consecutiveGood >= this._config.advanceCount) {
        this._advanceTier();
        this._consecutiveGood = 0;
      }
    } else if (avg <= this._config.struggleThreshold) {
      this._consecutiveGood = 0;
      this._dropTier();
    } else {
      // Neutral exchange — don't reset consecutive counter
    }
  }

  private _advanceTier(): void {
    const idx = TIERS_ORDERED.indexOf(this._tier);
    if (idx < TIERS_ORDERED.length - 1) {
      const previous = this._tier;
      this._tier = TIERS_ORDERED[idx + 1];
      this._tierHistory.push(this._tier);
      this._callbacks.onTierChange?.({
        previous,
        current: this._tier,
        direction: 'up',
        exchangeIndex: this._exchangeIndex,
      });
      const prompt = this._buildCurrentPrompt();
      this._callbacks.onSystemPromptUpdate?.(prompt);
    }
  }

  private _dropTier(): void {
    const idx = TIERS_ORDERED.indexOf(this._tier);
    if (idx > 0) {
      const previous = this._tier;
      this._tier = TIERS_ORDERED[idx - 1];
      this._tierHistory.push(this._tier);
      this._callbacks.onTierChange?.({
        previous,
        current: this._tier,
        direction: 'down',
        exchangeIndex: this._exchangeIndex,
      });
      const prompt = this._buildCurrentPrompt();
      this._callbacks.onSystemPromptUpdate?.(prompt);
    }
  }

  private _onTimeout(): void {
    if (this._status === 'active' || this._status === 'paused') {
      this._finalize('timed_out');
    }
  }

  private _finalize(endStatus: 'completed' | 'timed_out'): ConversationResult {
    this._status = endStatus === 'timed_out' ? 'timed_out' : 'completed';
    this._clearTimers();

    const result: ConversationResult = {
      transcript: [...this._transcript],
      finalTier: this._tier,
      aggregateMetrics: this._computeAggregateMetrics(),
      dimensionAverages: this._computeDimensionAverages(),
      durationMs: Date.now() - this._startTime,
      exchangeCount: this._exchangeIndex,
      tierHistory: [...this._tierHistory],
    };

    this._callbacks.onComplete?.(result);
    return result;
  }

  private _clearTimers(): void {
    if (this._timerHandle) {
      clearTimeout(this._timerHandle);
      this._timerHandle = null;
    }
    for (const h of this._warningHandles) {
      clearTimeout(h);
    }
    this._warningHandles = [];
  }

  private _computeAggregateMetrics(): AutomatedMetrics {
    const playerEntries = this._transcript.filter(
      (e): e is TranscriptEntry & { metrics: ExchangeMetrics } =>
        e.role === 'player' && e.metrics != null,
    );

    if (playerEntries.length === 0) {
      return {};
    }

    const avg = (values: number[]) =>
      values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : undefined;

    return {
      wpm: avg(playerEntries.map(e => e.metrics.wpm)),
      ttr: avg(playerEntries.map(e => e.metrics.ttr)),
      mlu: avg(playerEntries.map(e => e.metrics.mlu)),
      latencyMs: avg(playerEntries.filter(e => e.metrics.latencyMs > 0).map(e => e.metrics.latencyMs)),
      repairs: playerEntries.reduce((sum, e) => sum + e.metrics.repairs, 0),
      codeSwitchCount: playerEntries.reduce((sum, e) => sum + e.metrics.codeSwitchCount, 0),
    };
  }

  private _computeDimensionAverages(): DimensionScores {
    const scored = this._transcript.filter(
      (e): e is TranscriptEntry & { dimensionScores: DimensionScores } =>
        e.dimensionScores != null,
    );

    if (scored.length === 0) {
      return { vocab: 0, grammar: 0, fluency: 0, pronunciation: 0, comprehension: 0 };
    }

    const avg = (key: keyof DimensionScores) =>
      Math.round(
        (scored.reduce((sum, e) => sum + e.dimensionScores[key], 0) / scored.length) * 10,
      ) / 10;

    return {
      vocab: avg('vocab'),
      grammar: avg('grammar'),
      fluency: avg('fluency'),
      pronunciation: avg('pronunciation'),
      comprehension: avg('comprehension'),
    };
  }
}
