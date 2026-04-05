/**
 * Conversation Pipeline Metrics
 *
 * Collects per-stage latency measurements across the conversation pipeline
 * and exposes p50/p95/p99 percentiles over a rolling window.
 *
 * Stages: stt, context, llm_first_token, llm_total, tts_first_chunk, tts_total, end_to_end
 */

// ── Types ─────────────────────────────────────────────────────────────

export type MetricStage =
  | 'stt'
  | 'context'
  | 'context_cache_hit'
  | 'context_cache_miss'
  | 'context_tokens'
  | 'pre_warm'
  | 'greeting_cache_hit'
  | 'greeting_cache_miss'
  | 'llm_first_token'
  | 'llm_total'
  | 'llm_fast_first_token'
  | 'llm_fast_total'
  | 'llm_full_first_token'
  | 'llm_full_total'
  | 'tts_first_chunk'
  | 'tts_total'
  | 'viseme'
  | 'npc_npc_first_line'
  | 'speculative_cache_hit'
  | 'speculative_cache_miss'
  | 'speculative_generation'
  | 'response_cache_hit'
  | 'response_cache_miss'
  | 'npc_npc_template_served'
  | 'npc_npc_llm_served'
  | 'npc_npc_pool_served'
  | 'npc_npc_template_replaced'
  | 'npc_npc_batch_generated'
  | 'npc_npc_batch_parse_failure'
  | 'npc_npc_batch_partial_failure'
  | 'tts_queue_depth'
  | 'end_to_end';

export interface LatencyEntry {
  stage: MetricStage;
  durationMs: number;
  timestamp: number;
}

export interface StagePercentiles {
  p50: number;
  p95: number;
  p99: number;
  count: number;
  mean: number;
}

// ── Quality Tiers ────────────────────────────────────────────────────

export type QualityTier = 'FULL' | 'STANDARD' | 'REDUCED' | 'MINIMAL';

export interface QualityTierConfig {
  /** p95 latency threshold — tier activates when p95 exceeds this value */
  maxP95Ms: number;
  /** Viseme quality for this tier */
  visemeQuality: VisemeQualityLevel;
  /** TTS behavior for this tier */
  ttsBehavior: 'full' | 'first_sentence' | 'disabled';
  /** Context mode for this tier */
  contextMode: 'full' | 'slim_followup' | 'minimal';
  /** Model tier override: null means use classifier result */
  modelTierOverride: 'fast' | null;
  /** Whether to use template fallback for NPC-NPC conversations */
  npcNpcTemplateFallback: boolean;
}

export type VisemeQualityLevel = 'full' | 'simplified' | 'disabled';

/**
 * Quality tier definitions ordered from best to worst.
 * Thresholds: FULL (<1500ms), STANDARD (1500-3000ms), REDUCED (3000-5000ms), MINIMAL (>5000ms)
 */
export const QUALITY_TIER_CONFIGS: Record<QualityTier, QualityTierConfig> = {
  FULL: {
    maxP95Ms: 1500,
    visemeQuality: 'full',
    ttsBehavior: 'full',
    contextMode: 'full',
    modelTierOverride: null,
    npcNpcTemplateFallback: false,
  },
  STANDARD: {
    maxP95Ms: 3000,
    visemeQuality: 'full',
    ttsBehavior: 'full',
    contextMode: 'slim_followup',
    modelTierOverride: null,
    npcNpcTemplateFallback: false,
  },
  REDUCED: {
    maxP95Ms: 5000,
    visemeQuality: 'simplified',
    ttsBehavior: 'first_sentence',
    contextMode: 'slim_followup',
    modelTierOverride: 'fast',
    npcNpcTemplateFallback: false,
  },
  MINIMAL: {
    maxP95Ms: Infinity,
    visemeQuality: 'disabled',
    ttsBehavior: 'disabled',
    contextMode: 'minimal',
    modelTierOverride: 'fast',
    npcNpcTemplateFallback: true,
  },
};

/** Ordered tiers from best to worst for threshold comparison */
const TIER_ORDER: QualityTier[] = ['FULL', 'STANDARD', 'REDUCED', 'MINIMAL'];

/** Consecutive measurements above threshold required to degrade */
const HYSTERESIS_DEGRADE = 10;
/** Consecutive measurements below threshold required to recover */
const HYSTERESIS_RECOVER = 20;

export interface ConversationMetricsSnapshot {
  stages: Record<string, StagePercentiles>;
  windowSize: number;
  collectedSince: number;
  adaptiveQuality: {
    degraded: boolean;
    reason: string | null;
    qualityTier: QualityTier;
    tierConfig: QualityTierConfig;
  };
}

// ── Percentile helper ─────────────────────────────────────────────────

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

// ── Metrics Collector ─────────────────────────────────────────────────

const ROLLING_WINDOW = 100; // keep last N entries per stage
const ADAPTIVE_THRESHOLD_MS = 2000; // degrade quality if e2e > 2s

export class ConversationMetricsCollector {
  private entries = new Map<MetricStage, LatencyEntry[]>();
  private _degraded = false;
  private _degradeReason: string | null = null;
  private _qualityTier: QualityTier = 'FULL';
  /** Consecutive measurements above current tier's threshold */
  private _degradeCount = 0;
  /** Consecutive measurements below current tier's threshold (eligible for recovery) */
  private _recoverCount = 0;

  /** Record a latency measurement for a pipeline stage. */
  record(stage: MetricStage, durationMs: number): void {
    let list = this.entries.get(stage);
    if (!list) {
      list = [];
      this.entries.set(stage, list);
    }
    list.push({ stage, durationMs, timestamp: Date.now() });
    // Keep rolling window
    if (list.length > ROLLING_WINDOW) {
      list.splice(0, list.length - ROLLING_WINDOW);
    }

    // Adaptive quality check on end-to-end latency
    if (stage === 'end_to_end') {
      this.evaluateAdaptiveQuality();
    }
  }

  /** Get percentile stats for a specific stage. */
  getStageStats(stage: MetricStage): StagePercentiles | null {
    const list = this.entries.get(stage);
    if (!list || list.length === 0) return null;

    const values = list.map((e) => e.durationMs).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      p50: Math.round(percentile(values, 50)),
      p95: Math.round(percentile(values, 95)),
      p99: Math.round(percentile(values, 99)),
      count: values.length,
      mean: Math.round(sum / values.length),
    };
  }

  /** Get full metrics snapshot for all stages. */
  getSnapshot(): ConversationMetricsSnapshot {
    const stages: Record<string, StagePercentiles> = {};
    const allStages: MetricStage[] = [
      'stt', 'context', 'context_cache_hit', 'context_cache_miss', 'context_tokens', 'pre_warm',
      'greeting_cache_hit', 'greeting_cache_miss',
      'llm_first_token', 'llm_total',
      'llm_fast_first_token', 'llm_fast_total',
      'llm_full_first_token', 'llm_full_total',
      'tts_first_chunk', 'tts_total', 'viseme', 'end_to_end',
    ];

    for (const stage of allStages) {
      const stats = this.getStageStats(stage);
      if (stats) {
        stages[stage] = stats;
      }
    }

    // Find earliest timestamp across all entries
    let collectedSince = Date.now();
    for (const list of Array.from(this.entries.values())) {
      if (list.length > 0 && list[0].timestamp < collectedSince) {
        collectedSince = list[0].timestamp;
      }
    }

    return {
      stages,
      windowSize: ROLLING_WINDOW,
      collectedSince,
      adaptiveQuality: {
        degraded: this._degraded,
        reason: this._degradeReason,
        qualityTier: this._qualityTier,
        tierConfig: QUALITY_TIER_CONFIGS[this._qualityTier],
      },
    };
  }

  /** Whether adaptive quality degradation is active. */
  get isDegraded(): boolean {
    return this._degraded;
  }

  /** Current quality tier. */
  get qualityTier(): QualityTier {
    return this._qualityTier;
  }

  /** Get the configuration for the current quality tier. */
  get tierConfig(): QualityTierConfig {
    return QUALITY_TIER_CONFIGS[this._qualityTier];
  }

  /** Reset all collected metrics. */
  reset(): void {
    this.entries.clear();
    this._degraded = false;
    this._degradeReason = null;
    this._qualityTier = 'FULL';
    this._degradeCount = 0;
    this._recoverCount = 0;
  }

  private evaluateAdaptiveQuality(): void {
    const e2eStats = this.getStageStats('end_to_end');
    if (!e2eStats || e2eStats.count < 3) {
      // Not enough data to judge
      this._degraded = false;
      this._degradeReason = null;
      this._qualityTier = 'FULL';
      this._degradeCount = 0;
      this._recoverCount = 0;
      return;
    }

    const p95 = e2eStats.p95;
    const currentIdx = TIER_ORDER.indexOf(this._qualityTier);
    const currentConfig = QUALITY_TIER_CONFIGS[this._qualityTier];

    // Check if we should degrade (p95 exceeds current tier's threshold)
    if (p95 > currentConfig.maxP95Ms && currentIdx < TIER_ORDER.length - 1) {
      this._recoverCount = 0;
      this._degradeCount++;
      if (this._degradeCount >= HYSTERESIS_DEGRADE) {
        // Find the appropriate tier for the current p95
        let targetIdx = currentIdx + 1;
        for (let i = currentIdx + 1; i < TIER_ORDER.length; i++) {
          if (p95 <= QUALITY_TIER_CONFIGS[TIER_ORDER[i]].maxP95Ms) {
            targetIdx = i;
            break;
          }
          targetIdx = i;
        }
        const previousTier = this._qualityTier;
        this._qualityTier = TIER_ORDER[targetIdx];
        this._degradeCount = 0;
        console.log(
          `[AdaptiveQuality] Degraded ${previousTier} → ${this._qualityTier} (p95=${p95}ms)`
        );
      }
    }
    // Check if we should recover (p95 is below previous tier's threshold)
    else if (currentIdx > 0) {
      const betterTier = TIER_ORDER[currentIdx - 1];
      const betterConfig = QUALITY_TIER_CONFIGS[betterTier];
      if (p95 <= betterConfig.maxP95Ms) {
        this._degradeCount = 0;
        this._recoverCount++;
        if (this._recoverCount >= HYSTERESIS_RECOVER) {
          const previousTier = this._qualityTier;
          this._qualityTier = betterTier;
          this._recoverCount = 0;
          console.log(
            `[AdaptiveQuality] Recovered ${previousTier} → ${this._qualityTier} (p95=${p95}ms)`
          );
        }
      } else {
        this._recoverCount = 0;
        this._degradeCount = 0;
      }
    } else {
      // Already at FULL tier and p95 is fine
      this._degradeCount = 0;
      this._recoverCount = 0;
    }

    // Update legacy degraded flag for backward compatibility
    this._degraded = this._qualityTier !== 'FULL';
    this._degradeReason = this._degraded
      ? `Quality tier ${this._qualityTier}: p95 end-to-end latency ${p95}ms`
      : null;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────

let _instance: ConversationMetricsCollector | null = null;

export function getConversationMetrics(): ConversationMetricsCollector {
  if (!_instance) {
    _instance = new ConversationMetricsCollector();
  }
  return _instance;
}

export function resetConversationMetrics(): void {
  if (_instance) {
    _instance.reset();
  }
  _instance = null;
}

// ── Timer utility ─────────────────────────────────────────────────────

/**
 * Convenience class for timing a pipeline stage.
 * Usage:
 *   const timer = new PipelineTimer('llm_first_token');
 *   // ... do work ...
 *   timer.stop(); // records to global metrics collector
 */
export class PipelineTimer {
  private startTime: number;
  private stopped = false;

  constructor(
    private stage: MetricStage,
    private collector?: ConversationMetricsCollector,
  ) {
    this.startTime = Date.now();
  }

  /** Stop the timer and record the measurement. Returns elapsed ms. */
  stop(): number {
    if (this.stopped) return 0;
    this.stopped = true;
    const elapsed = Date.now() - this.startTime;
    const collector = this.collector ?? getConversationMetrics();
    collector.record(this.stage, elapsed);
    return elapsed;
  }

  /** Get elapsed time without stopping. */
  elapsed(): number {
    return Date.now() - this.startTime;
  }
}
