import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ClientDebugEventBus, getDebugEventBus, resetDebugEventBus } from '../game-engine/debug-event-bus';
import type { DebugEvent } from '../game-engine/debug-event-bus';

function makeEvent(overrides?: Partial<DebugEvent>): DebugEvent {
  return {
    timestamp: Date.now(),
    category: 'prolog',
    level: 'info',
    tag: 'Test',
    summary: 'test event',
    detail: 'test detail',
    source: 'client',
    ...overrides,
  };
}

describe('ClientDebugEventBus (US-016)', () => {
  let bus: ClientDebugEventBus;

  beforeEach(() => {
    bus = new ClientDebugEventBus();
  });

  // ── Test 1: emit 3 events, all received by subscriber ──

  it('delivers all emitted events to a subscriber', () => {
    const received: DebugEvent[] = [];
    bus.subscribe((event) => received.push(event));

    bus.emit(makeEvent({ tag: 'Prolog', summary: 'assert fact' }));
    bus.emit(makeEvent({ category: 'llm', tag: 'LLM', summary: 'chat response' }));
    bus.emit(makeEvent({ category: 'language', tag: 'EVAL', summary: 'eval scores' }));

    expect(received).toHaveLength(3);
    expect(received[0].tag).toBe('Prolog');
    expect(received[1].tag).toBe('LLM');
    expect(received[2].tag).toBe('EVAL');
  });

  // ── Test 2: unsubscribe stops delivery ──

  it('stops delivering after unsubscribe', () => {
    const received: DebugEvent[] = [];
    const unsub = bus.subscribe((event) => received.push(event));

    bus.emit(makeEvent({ summary: 'before unsub' }));
    unsub();
    bus.emit(makeEvent({ summary: 'after unsub' }));

    expect(received).toHaveLength(1);
    expect(received[0].summary).toBe('before unsub');
  });

  // ── Test 3: multiple subscribers all receive events ──

  it('notifies multiple subscribers', () => {
    const received1: DebugEvent[] = [];
    const received2: DebugEvent[] = [];
    bus.subscribe((e) => received1.push(e));
    bus.subscribe((e) => received2.push(e));

    bus.emit(makeEvent());

    expect(received1).toHaveLength(1);
    expect(received2).toHaveLength(1);
  });

  // ── Test 4: event history stores events ──

  it('stores events in history', () => {
    bus.emit(makeEvent({ summary: 'one' }));
    bus.emit(makeEvent({ summary: 'two' }));

    const history = bus.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].summary).toBe('one');
    expect(history[1].summary).toBe('two');
  });

  // ── Test 5: history eviction at capacity ──

  it('evicts oldest events when history exceeds capacity', () => {
    const smallBus = new ClientDebugEventBus(3);

    smallBus.emit(makeEvent({ summary: 'a' }));
    smallBus.emit(makeEvent({ summary: 'b' }));
    smallBus.emit(makeEvent({ summary: 'c' }));
    smallBus.emit(makeEvent({ summary: 'd' }));

    const history = smallBus.getHistory();
    expect(history).toHaveLength(3);
    expect(history[0].summary).toBe('b');
    expect(history[2].summary).toBe('d');
  });

  // ── Test 6: subscriber error does not break other subscribers ──

  it('continues notifying other subscribers when one throws', () => {
    const received: DebugEvent[] = [];
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    bus.subscribe(() => { throw new Error('boom'); });
    bus.subscribe((e) => received.push(e));

    bus.emit(makeEvent());

    expect(received).toHaveLength(1);
    expect(errorSpy).toHaveBeenCalledOnce();
    errorSpy.mockRestore();
  });

  // ── Test 7: dispose clears everything ──

  it('clears subscribers and history on dispose', () => {
    const received: DebugEvent[] = [];
    bus.subscribe((e) => received.push(e));
    bus.emit(makeEvent());

    expect(received).toHaveLength(1);
    expect(bus.getHistory()).toHaveLength(1);

    bus.dispose();

    // History is cleared
    expect(bus.getHistory()).toHaveLength(0);

    // Subscribers are cleared — new emit does not deliver to old subscriber
    bus.emit(makeEvent());
    expect(received).toHaveLength(1); // still 1, not 2
  });

  // ── Test 8: DebugEvent has correct shape ──

  it('events have all required fields', () => {
    const received: DebugEvent[] = [];
    bus.subscribe((e) => received.push(e));

    bus.emit(makeEvent({
      timestamp: 1234567890,
      category: 'llm',
      level: 'warn',
      tag: 'LLM',
      summary: 'test',
      detail: 'detail',
      source: 'server',
    }));

    const event = received[0];
    expect(event.timestamp).toBe(1234567890);
    expect(event.category).toBe('llm');
    expect(event.level).toBe('warn');
    expect(event.tag).toBe('LLM');
    expect(event.summary).toBe('test');
    expect(event.detail).toBe('detail');
    expect(event.source).toBe('server');
  });

  // ── Test 9: singleton getDebugEventBus ──

  it('getDebugEventBus returns the same instance', () => {
    resetDebugEventBus();
    const a = getDebugEventBus();
    const b = getDebugEventBus();
    expect(a).toBe(b);
    resetDebugEventBus();
  });

  // ── Test 10: resetDebugEventBus creates a new instance ──

  it('resetDebugEventBus creates a fresh instance', () => {
    resetDebugEventBus();
    const a = getDebugEventBus();
    a.emit(makeEvent());
    expect(a.getHistory()).toHaveLength(1);

    resetDebugEventBus();
    const b = getDebugEventBus();
    expect(b).not.toBe(a);
    expect(b.getHistory()).toHaveLength(0);
    resetDebugEventBus();
  });
});
