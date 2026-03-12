import { describe, it, expect, beforeEach } from 'vitest';
import {
  ConversationMetricsCollector,
  PipelineTimer,
  percentile,
  resetConversationMetrics,
  getConversationMetrics,
} from '../services/conversation/conversation-metrics.js';

// ── percentile helper ─────────────────────────────────────────────────

describe('percentile', () => {
  it('returns 0 for empty array', () => {
    expect(percentile([], 50)).toBe(0);
  });

  it('returns exact value for single element', () => {
    expect(percentile([42], 50)).toBe(42);
    expect(percentile([42], 99)).toBe(42);
  });

  it('calculates p50 (median) correctly for odd-length array', () => {
    expect(percentile([10, 20, 30, 40, 50], 50)).toBe(30);
  });

  it('calculates p50 (median) correctly for even-length array', () => {
    // p50 of [10, 20, 30, 40] → idx = 1.5, interpolation between 20 and 30
    expect(percentile([10, 20, 30, 40], 50)).toBe(25);
  });

  it('calculates p95 correctly', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1); // 1..100
    // p95 → idx = 94.05 → interpolates between 95 and 96
    const result = percentile(values, 95);
    expect(result).toBeGreaterThanOrEqual(95);
    expect(result).toBeLessThanOrEqual(96);
  });

  it('calculates p99 correctly', () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1);
    const result = percentile(values, 99);
    expect(result).toBeGreaterThanOrEqual(99);
    expect(result).toBeLessThanOrEqual(100);
  });
});

// ── ConversationMetricsCollector ──────────────────────────────────────

describe('ConversationMetricsCollector', () => {
  let collector: ConversationMetricsCollector;

  beforeEach(() => {
    collector = new ConversationMetricsCollector();
  });

  it('records and retrieves stage stats', () => {
    collector.record('llm_first_token', 100);
    collector.record('llm_first_token', 200);
    collector.record('llm_first_token', 300);

    const stats = collector.getStageStats('llm_first_token');
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(3);
    expect(stats!.mean).toBe(200);
    expect(stats!.p50).toBe(200);
  });

  it('returns null for unrecorded stage', () => {
    expect(collector.getStageStats('stt')).toBeNull();
  });

  it('maintains rolling window of 100 entries', () => {
    for (let i = 0; i < 150; i++) {
      collector.record('llm_total', i);
    }
    const stats = collector.getStageStats('llm_total');
    expect(stats!.count).toBe(100);
    // Should have entries 50-149 (last 100)
    expect(stats!.p50).toBeGreaterThanOrEqual(99);
  });

  it('provides full snapshot with all recorded stages', () => {
    collector.record('llm_first_token', 50);
    collector.record('llm_total', 200);
    collector.record('tts_total', 300);

    const snapshot = collector.getSnapshot();
    expect(snapshot.stages).toHaveProperty('llm_first_token');
    expect(snapshot.stages).toHaveProperty('llm_total');
    expect(snapshot.stages).toHaveProperty('tts_total');
    expect(snapshot.windowSize).toBe(100);
    expect(snapshot.adaptiveQuality.degraded).toBe(false);
  });

  it('does not degrade with fewer than 3 e2e samples', () => {
    collector.record('end_to_end', 5000);
    collector.record('end_to_end', 5000);
    expect(collector.isDegraded).toBe(false);
  });

  it('activates adaptive quality when p95 e2e exceeds 2s', () => {
    // Record enough high-latency e2e samples
    for (let i = 0; i < 10; i++) {
      collector.record('end_to_end', 3000);
    }
    expect(collector.isDegraded).toBe(true);

    const snapshot = collector.getSnapshot();
    expect(snapshot.adaptiveQuality.degraded).toBe(true);
    expect(snapshot.adaptiveQuality.reason).toContain('exceeds');
  });

  it('deactivates adaptive quality when latency improves', () => {
    // First degrade
    for (let i = 0; i < 10; i++) {
      collector.record('end_to_end', 3000);
    }
    expect(collector.isDegraded).toBe(true);

    // Then record enough fast samples to push p95 below threshold
    for (let i = 0; i < 100; i++) {
      collector.record('end_to_end', 500);
    }
    expect(collector.isDegraded).toBe(false);
  });

  it('reset clears all data', () => {
    collector.record('llm_total', 100);
    for (let i = 0; i < 10; i++) {
      collector.record('end_to_end', 3000);
    }
    expect(collector.isDegraded).toBe(true);

    collector.reset();
    expect(collector.isDegraded).toBe(false);
    expect(collector.getStageStats('llm_total')).toBeNull();
  });
});

// ── PipelineTimer ────────────────────────────────────────────────────

describe('PipelineTimer', () => {
  it('records elapsed time to a collector', () => {
    const collector = new ConversationMetricsCollector();
    const timer = new PipelineTimer('context', collector);

    // Simulate a small delay
    const start = Date.now();
    while (Date.now() - start < 5) { /* busy wait */ }

    const elapsed = timer.stop();
    expect(elapsed).toBeGreaterThanOrEqual(0);

    const stats = collector.getStageStats('context');
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(1);
  });

  it('stop is idempotent — second call returns 0', () => {
    const collector = new ConversationMetricsCollector();
    const timer = new PipelineTimer('stt', collector);
    timer.stop();
    expect(timer.stop()).toBe(0);

    // Only one entry recorded
    expect(collector.getStageStats('stt')!.count).toBe(1);
  });

  it('elapsed() returns time without stopping', () => {
    const collector = new ConversationMetricsCollector();
    const timer = new PipelineTimer('llm_total', collector);
    const e = timer.elapsed();
    expect(e).toBeGreaterThanOrEqual(0);
    // Not stopped yet
    expect(collector.getStageStats('llm_total')).toBeNull();
  });
});

// ── Singleton ────────────────────────────────────────────────────────

describe('singleton', () => {
  beforeEach(() => {
    resetConversationMetrics();
  });

  it('getConversationMetrics returns a singleton', () => {
    const a = getConversationMetrics();
    const b = getConversationMetrics();
    expect(a).toBe(b);
  });

  it('resetConversationMetrics clears singleton', () => {
    const a = getConversationMetrics();
    a.record('stt', 100);
    resetConversationMetrics();
    const b = getConversationMetrics();
    expect(b.getStageStats('stt')).toBeNull();
  });
});
