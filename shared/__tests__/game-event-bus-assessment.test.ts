import { describe, it, expect, vi } from 'vitest';
import { GameEventBus } from '@/components/3DGame/GameEventBus.ts';

describe('GameEventBus — assessment & onboarding events', () => {
  it('emits and receives assessment_started', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('assessment_started', handler);

    bus.emit({
      type: 'assessment_started',
      sessionId: 's1',
      assessmentType: 'arrival',
      playerId: 'p1',
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'assessment_started', sessionId: 's1' }),
    );
    bus.dispose();
  });

  it('emits and receives assessment_phase_started', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('assessment_phase_started', handler);

    bus.emit({
      type: 'assessment_phase_started',
      sessionId: 's1',
      phaseId: 'conversational',
      phaseIndex: 0,
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ phaseId: 'conversational', phaseIndex: 0 }),
    );
    bus.dispose();
  });

  it('emits and receives assessment_phase_completed', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('assessment_phase_completed', handler);

    bus.emit({
      type: 'assessment_phase_completed',
      sessionId: 's1',
      phaseId: 'listening',
      score: 5,
      maxScore: 7,
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ score: 5, maxScore: 7 }),
    );
    bus.dispose();
  });

  it('emits and receives assessment_completed', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('assessment_completed', handler);

    bus.emit({
      type: 'assessment_completed',
      sessionId: 's1',
      totalScore: 35,
      totalMaxScore: 53,
      cefrLevel: 'A2',
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ cefrLevel: 'A2', totalScore: 35 }),
    );
    bus.dispose();
  });

  it('emits and receives onboarding_step_started', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('onboarding_step_started', handler);

    bus.emit({
      type: 'onboarding_step_started',
      stepId: 'step_1',
      stepIndex: 0,
      totalSteps: 10,
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ stepId: 'step_1', totalSteps: 10 }),
    );
    bus.dispose();
  });

  it('emits and receives onboarding_step_completed', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('onboarding_step_completed', handler);

    bus.emit({
      type: 'onboarding_step_completed',
      stepId: 'step_2',
      stepIndex: 1,
      totalSteps: 10,
      durationMs: 5000,
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ durationMs: 5000 }),
    );
    bus.dispose();
  });

  it('emits and receives onboarding_completed', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('onboarding_completed', handler);

    bus.emit({
      type: 'onboarding_completed',
      totalSteps: 10,
      totalDurationMs: 120000,
    });

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ totalSteps: 10, totalDurationMs: 120000 }),
    );
    bus.dispose();
  });

  it('global handler receives assessment events', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.onAny(handler);

    bus.emit({
      type: 'assessment_completed',
      sessionId: 's1',
      totalScore: 40,
      totalMaxScore: 53,
      cefrLevel: 'B1',
    });

    expect(handler).toHaveBeenCalledOnce();
    bus.dispose();
  });
});
