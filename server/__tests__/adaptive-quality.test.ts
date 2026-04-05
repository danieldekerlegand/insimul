/**
 * Tests for US-014: Enhanced adaptive quality degradation
 *
 * Covers: multi-tier quality (FULL/STANDARD/REDUCED/MINIMAL), hysteresis for
 * degradation (10 consecutive) and recovery (20 consecutive), tier effects on
 * viseme/TTS/context/model, tier transitions with logging.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ConversationMetricsCollector,
  QUALITY_TIER_CONFIGS,
} from '../services/conversation/conversation-metrics';
import type { QualityTier } from '../services/conversation/conversation-metrics';

// ── Helpers ──────────────────────────────────────────────────────────

/** Record N end_to_end measurements at the given latency. */
function recordN(collector: ConversationMetricsCollector, n: number, latencyMs: number): void {
  // Need at least 3 entries before adaptive quality evaluates
  for (let i = 0; i < n; i++) {
    collector.record('end_to_end', latencyMs);
  }
}

/** Seed the collector with enough entries so evaluation is active. */
function seedCollector(collector: ConversationMetricsCollector, latencyMs: number): void {
  recordN(collector, 3, latencyMs);
}

describe('ConversationMetricsCollector — Quality Tiers', () => {
  let collector: ConversationMetricsCollector;

  beforeEach(() => {
    collector = new ConversationMetricsCollector();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  // ── Tier config structure ────────────────────────────────────────

  it('has four quality tiers in correct order', () => {
    const tiers: QualityTier[] = ['FULL', 'STANDARD', 'REDUCED', 'MINIMAL'];
    for (const tier of tiers) {
      expect(QUALITY_TIER_CONFIGS[tier]).toBeDefined();
    }
  });

  it('FULL tier thresholds are correct', () => {
    const cfg = QUALITY_TIER_CONFIGS.FULL;
    expect(cfg.maxP95Ms).toBe(1500);
    expect(cfg.visemeQuality).toBe('full');
    expect(cfg.ttsBehavior).toBe('full');
    expect(cfg.contextMode).toBe('full');
    expect(cfg.modelTierOverride).toBeNull();
    expect(cfg.npcNpcTemplateFallback).toBe(false);
  });

  it('STANDARD tier uses slim context on follow-ups', () => {
    const cfg = QUALITY_TIER_CONFIGS.STANDARD;
    expect(cfg.maxP95Ms).toBe(3000);
    expect(cfg.contextMode).toBe('slim_followup');
    expect(cfg.visemeQuality).toBe('full');
    expect(cfg.ttsBehavior).toBe('full');
    expect(cfg.modelTierOverride).toBeNull();
  });

  it('REDUCED tier uses simplified visemes, first-sentence TTS, and fast model', () => {
    const cfg = QUALITY_TIER_CONFIGS.REDUCED;
    expect(cfg.maxP95Ms).toBe(5000);
    expect(cfg.visemeQuality).toBe('simplified');
    expect(cfg.ttsBehavior).toBe('first_sentence');
    expect(cfg.modelTierOverride).toBe('fast');
  });

  it('MINIMAL tier disables visemes/TTS and uses template fallback', () => {
    const cfg = QUALITY_TIER_CONFIGS.MINIMAL;
    expect(cfg.maxP95Ms).toBe(Infinity);
    expect(cfg.visemeQuality).toBe('disabled');
    expect(cfg.ttsBehavior).toBe('disabled');
    expect(cfg.contextMode).toBe('minimal');
    expect(cfg.modelTierOverride).toBe('fast');
    expect(cfg.npcNpcTemplateFallback).toBe(true);
  });

  // ── Default state ────────────────────────────────────────────────

  it('starts at FULL tier', () => {
    expect(collector.qualityTier).toBe('FULL');
    expect(collector.isDegraded).toBe(false);
    expect(collector.tierConfig).toEqual(QUALITY_TIER_CONFIGS.FULL);
  });

  it('stays FULL with low latency', () => {
    recordN(collector, 20, 500);
    expect(collector.qualityTier).toBe('FULL');
    expect(collector.isDegraded).toBe(false);
  });

  // ── Degradation with hysteresis ──────────────────────────────────

  it('does not degrade before 10 consecutive measurements above threshold', () => {
    seedCollector(collector, 500);
    // 9 high-latency measurements (not enough for degradation)
    recordN(collector, 9, 2000);
    expect(collector.qualityTier).toBe('FULL');
  });

  it('degrades FULL → STANDARD after 10 consecutive measurements above 1500ms', () => {
    seedCollector(collector, 500);
    // Need 10 above threshold (seeded 3 low ones set p95 low initially)
    // Record enough high-latency entries to shift p95 above 1500
    recordN(collector, 20, 2000);
    expect(collector.qualityTier).toBe('STANDARD');
    expect(collector.isDegraded).toBe(true);
  });

  it('degrades STANDARD → REDUCED when p95 exceeds 3000ms', () => {
    // First, get to STANDARD
    recordN(collector, 20, 2000);
    expect(collector.qualityTier).toBe('STANDARD');

    // Now push above 3000ms
    recordN(collector, 20, 4000);
    expect(collector.qualityTier).toBe('REDUCED');
  });

  it('degrades REDUCED → MINIMAL when p95 exceeds 5000ms', () => {
    // Get to REDUCED
    recordN(collector, 20, 2000);
    recordN(collector, 20, 4000);
    expect(collector.qualityTier).toBe('REDUCED');

    // Now push above 5000ms
    recordN(collector, 20, 6000);
    expect(collector.qualityTier).toBe('MINIMAL');
  });

  it('can skip tiers when latency is very high', () => {
    // Very high latency from the start — should jump to appropriate tier
    recordN(collector, 20, 6000);
    // Should be at REDUCED or MINIMAL (may take multiple degradation cycles)
    expect(['REDUCED', 'MINIMAL']).toContain(collector.qualityTier);
  });

  // ── Recovery with hysteresis ─────────────────────────────────────

  it('does not recover before 20 consecutive measurements below threshold', () => {
    // Degrade to STANDARD
    recordN(collector, 20, 2000);
    expect(collector.qualityTier).toBe('STANDARD');

    // 19 low-latency measurements (not enough for recovery)
    recordN(collector, 19, 500);
    expect(collector.qualityTier).toBe('STANDARD');
  });

  it('recovers STANDARD → FULL after 20 consecutive measurements below 1500ms', () => {
    // Degrade to STANDARD
    recordN(collector, 20, 2000);
    expect(collector.qualityTier).toBe('STANDARD');

    // Need enough low entries to push high entries out of rolling window (100),
    // THEN 20 more for hysteresis recovery
    recordN(collector, 120, 500);
    expect(collector.qualityTier).toBe('FULL');
    expect(collector.isDegraded).toBe(false);
  });

  it('recovers only one tier at a time', () => {
    // Get to REDUCED
    recordN(collector, 20, 2000);
    recordN(collector, 20, 4000);
    expect(collector.qualityTier).toBe('REDUCED');

    // Low latency recovery — push high entries out of rolling window + hysteresis
    // Should go to STANDARD first, not FULL
    recordN(collector, 120, 500);
    expect(collector.qualityTier).toBe('STANDARD');

    // Another round of recovery to get to FULL
    recordN(collector, 120, 500);
    expect(collector.qualityTier).toBe('FULL');
  });

  // ── Tier config accessor ─────────────────────────────────────────

  it('tierConfig matches current quality tier', () => {
    expect(collector.tierConfig).toEqual(QUALITY_TIER_CONFIGS.FULL);

    recordN(collector, 20, 2000);
    expect(collector.tierConfig).toEqual(QUALITY_TIER_CONFIGS.STANDARD);
  });

  // ── Snapshot includes tier info ──────────────────────────────────

  it('snapshot includes qualityTier and tierConfig', () => {
    recordN(collector, 5, 500);
    const snapshot = collector.getSnapshot();
    expect(snapshot.adaptiveQuality.qualityTier).toBe('FULL');
    expect(snapshot.adaptiveQuality.tierConfig).toEqual(QUALITY_TIER_CONFIGS.FULL);
  });

  it('snapshot reflects degraded tier', () => {
    recordN(collector, 20, 2000);
    const snapshot = collector.getSnapshot();
    expect(snapshot.adaptiveQuality.qualityTier).toBe('STANDARD');
    expect(snapshot.adaptiveQuality.degraded).toBe(true);
    expect(snapshot.adaptiveQuality.reason).toContain('STANDARD');
  });

  // ── Reset ────────────────────────────────────────────────────────

  it('reset restores to FULL tier', () => {
    recordN(collector, 20, 2000);
    expect(collector.qualityTier).toBe('STANDARD');

    collector.reset();
    expect(collector.qualityTier).toBe('FULL');
    expect(collector.isDegraded).toBe(false);
  });

  // ── Backward compatibility ───────────────────────────────────────

  it('isDegraded is true for any non-FULL tier', () => {
    expect(collector.isDegraded).toBe(false);

    recordN(collector, 20, 2000);
    expect(collector.isDegraded).toBe(true);
  });

  // ── Logging ──────────────────────────────────────────────────────

  it('logs tier transitions on degradation', () => {
    recordN(collector, 20, 2000);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[AdaptiveQuality]'),
    );
  });

  it('logs tier transitions on recovery', () => {
    recordN(collector, 20, 2000);
    (console.log as any).mockClear();

    // Push high entries out of rolling window + hysteresis for recovery
    recordN(collector, 120, 500);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('[AdaptiveQuality]'),
    );
  });

  // ── Not enough data ──────────────────────────────────────────────

  it('stays FULL with fewer than 3 measurements regardless of latency', () => {
    collector.record('end_to_end', 10000);
    collector.record('end_to_end', 10000);
    expect(collector.qualityTier).toBe('FULL');
    expect(collector.isDegraded).toBe(false);
  });
});
