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

export interface ConversationMetricsSnapshot {
  stages: Record<string, StagePercentiles>;
  windowSize: number;
  collectedSince: number;
  adaptiveQuality: {
    degraded: boolean;
    reason: string | null;
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
      },
    };
  }

  /** Whether adaptive quality degradation is active. */
  get isDegraded(): boolean {
    return this._degraded;
  }

  /** Reset all collected metrics. */
  reset(): void {
    this.entries.clear();
    this._degraded = false;
    this._degradeReason = null;
  }

  private evaluateAdaptiveQuality(): void {
    const e2eStats = this.getStageStats('end_to_end');
    if (!e2eStats || e2eStats.count < 3) {
      // Not enough data to judge
      this._degraded = false;
      this._degradeReason = null;
      return;
    }

    if (e2eStats.p95 > ADAPTIVE_THRESHOLD_MS) {
      this._degraded = true;
      this._degradeReason = `p95 end-to-end latency ${e2eStats.p95}ms exceeds ${ADAPTIVE_THRESHOLD_MS}ms threshold`;
    } else {
      this._degraded = false;
      this._degradeReason = null;
    }
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
