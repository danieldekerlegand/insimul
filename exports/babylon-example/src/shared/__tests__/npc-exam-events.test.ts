import { describe, it, expect, vi } from 'vitest';
import { GameEventBus } from '@/components/3DGame/GameEventBus.ts';

describe('GameEventBus — NPC exam events', () => {
  it('emits and receives npc_exam_started', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('npc_exam_started', handler);

    bus.emit({
      type: 'npc_exam_started',
      examId: 'exam-1',
      npcId: 'npc-1',
      npcName: 'Pierre',
      businessType: 'bakery',
      examType: 'listening_comprehension',
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'npc_exam_started',
        examId: 'exam-1',
        examType: 'listening_comprehension',
      }),
    );
    bus.dispose();
  });

  it('emits and receives npc_exam_listening_ready', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('npc_exam_listening_ready', handler);

    bus.emit({
      type: 'npc_exam_listening_ready',
      examId: 'exam-1',
      audioUrl: 'data:audio/mp3;base64,abc',
      passage: 'Bonjour, bienvenue à la boulangerie.',
      questions: [
        { id: 'q1', questionText: 'What did the baker say?', maxPoints: 5 },
      ],
      maxReplays: 1,
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'npc_exam_listening_ready',
        maxReplays: 1,
      }),
    );
    bus.dispose();
  });

  it('emits and receives npc_exam_completed with pass', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('npc_exam_completed', handler);

    bus.emit({
      type: 'npc_exam_completed',
      examId: 'exam-1',
      npcId: 'npc-1',
      score: 10,
      maxScore: 13,
      percentage: 77,
      passed: true,
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        passed: true,
        score: 10,
        maxScore: 13,
      }),
    );
    bus.dispose();
  });

  it('emits and receives npc_exam_completed with fail', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.on('npc_exam_completed', handler);

    bus.emit({
      type: 'npc_exam_completed',
      examId: 'exam-2',
      npcId: 'npc-1',
      score: 5,
      maxScore: 13,
      percentage: 38,
      passed: false,
    });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ passed: false }),
    );
    bus.dispose();
  });

  it('global handlers receive NPC exam events', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    bus.onAny(handler);

    bus.emit({
      type: 'npc_exam_started',
      examId: 'exam-1',
      npcId: 'npc-1',
      npcName: 'Pierre',
      businessType: 'bakery',
      examType: 'listening_comprehension',
    });

    expect(handler).toHaveBeenCalledOnce();
    bus.dispose();
  });

  it('unsubscribe works for NPC exam events', () => {
    const bus = new GameEventBus();
    const handler = vi.fn();
    const unsub = bus.on('npc_exam_completed', handler);

    unsub();

    bus.emit({
      type: 'npc_exam_completed',
      examId: 'exam-1',
      npcId: 'npc-1',
      score: 10,
      maxScore: 13,
      percentage: 77,
      passed: true,
    });

    expect(handler).not.toHaveBeenCalled();
    bus.dispose();
  });
});
