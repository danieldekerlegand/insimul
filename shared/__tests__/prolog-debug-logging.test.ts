import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Mock isDebugLabelsEnabled ──────────────────────────────────────────────

let _debugEnabled = false;
vi.mock('../game-engine/rendering/DebugLabelUtils', () => ({
  isDebugLabelsEnabled: () => _debugEnabled,
}));

// ── Capture DebugEventBus.emit() calls ────────────────────────────────────

const _emittedEvents: any[] = [];
vi.mock('../game-engine/debug-event-bus', () => ({
  getDebugEventBus: () => ({
    emit: (event: any) => { _emittedEvents.push(event); },
  }),
}));

// ── Mock TauPrologEngine ───────────────────────────────────────────────────

let _queryResults: Record<string, any>[] = [];
vi.mock('@shared/prolog/tau-engine', () => ({
  TauPrologEngine: class {
    async initialize() {}
    async loadProgram() {}
    async assertFact() {}
    async assertFacts() {}
    async retractFact() {}
    async query() { return _queryResults; }
    async queryOnce() { return _queryResults[0] || null; }
    getStats() { return { factCount: 10, ruleCount: 5 }; }
  },
}));

// ── Stub other imports ─────────────────────────────────────────────────────

vi.mock('@shared/prolog/npc-reasoning', () => ({
  getNPCReasoningRules: () => '',
  getPersonalityFacts: () => '',
  getRelationshipFacts: () => '',
  getEmotionalStateFacts: () => '',
  getEnvironmentFacts: () => '',
}));
vi.mock('@shared/npc-awareness-context', () => ({
  getTimePeriod: () => 'day',
}));
vi.mock('@shared/prolog/tott-predicates', () => ({
  getTotTPredicates: () => '',
}));
vi.mock('@shared/prolog/advanced-predicates', () => ({
  getAdvancedPredicates: () => '',
}));
vi.mock('@shared/prolog/helper-predicates', () => ({
  HELPER_PREDICATES_PROLOG: '',
}));

describe('Prolog Debug Logging (US-013)', () => {
  let GamePrologEngine: any;
  let engine: any;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    _emittedEvents.length = 0;
    _debugEnabled = false;
    _queryResults = [];

    consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    vi.resetModules();
    const mod = await import('../game-engine/logic/GamePrologEngine');
    GamePrologEngine = mod.GamePrologEngine;

    // Create engine with a mock event bus
    const mockEventBus = { on: vi.fn(), emit: vi.fn() } as any;
    engine = new GamePrologEngine(mockEventBus);
    // Force initialized = true so methods don't early-return
    (engine as any).initialized = true;
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should log assert to Prolog tab when debug is enabled', async () => {
    _debugEnabled = true;
    await engine.assertFact('quest_status(q1, completed)', 'quest completion handler');

    expect(_emittedEvents.length).toBe(1);
    expect(_emittedEvents[0].category).toBe('prolog');
    expect(_emittedEvents[0].tag).toBe('Prolog');
    expect(_emittedEvents[0].source).toBe('client');
    expect(_emittedEvents[0].summary).toBe('[+] quest_status(q1, completed)');
    expect(_emittedEvents[0].detail).toContain('quest_status(q1, completed)');
    expect(_emittedEvents[0].detail).toContain('quest completion handler');

    // Also verify console.debug was called
    expect(consoleSpy).toHaveBeenCalledWith(
      '[PrologDebug] assert:',
      'quest_status(q1, completed)',
      '(source: quest completion handler)',
    );
  });

  it('should NOT log when debug is disabled', async () => {
    _debugEnabled = false;
    await engine.assertFact('quest_status(q1, completed)');
    await engine.retractFact('quest_status(q1, active)');
    _queryResults = [{ X: 'hello' }];
    await engine.query('test(X)');

    expect(_emittedEvents.length).toBe(0);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('should log retract with reason to Prolog tab', async () => {
    _debugEnabled = true;
    await engine.retractFact('quest_status(q1, active)', 'status changed to completed');

    expect(_emittedEvents.length).toBe(1);
    expect(_emittedEvents[0].summary).toBe('[-] quest_status(q1, active)');
    expect(_emittedEvents[0].detail).toContain('status changed to completed');
  });

  it('should log query result and execution time to Prolog tab', async () => {
    _debugEnabled = true;
    _queryResults = [{ QuestId: 'q1', Status: 'active' }];
    const results = await engine.query('quest_status(QuestId, Status)');

    expect(results.length).toBe(1);
    expect(_emittedEvents.length).toBe(1);
    expect(_emittedEvents[0].summary).toContain('[?] quest_status(QuestId, Status) -> true');
    expect(_emittedEvents[0].detail).toContain('QuestId=q1, Status=active');
    expect(_emittedEvents[0].detail).toMatch(/Execution time: [\d.]+ms/);
  });

  it('should log query with false result when no bindings returned', async () => {
    _debugEnabled = true;
    _queryResults = [];
    await engine.query('nonexistent(X)');

    expect(_emittedEvents.length).toBe(1);
    expect(_emittedEvents[0].summary).toContain('-> false');
    expect(_emittedEvents[0].detail).toContain('Results: false');
  });

  it('should log unabridged content to console.debug for assert', async () => {
    _debugEnabled = true;
    const longFact = 'personality(npc_abc123, openness, 0.85)';
    await engine.assertFact(longFact);

    expect(consoleSpy).toHaveBeenCalledWith(
      '[PrologDebug] assert:',
      longFact,
      '',
    );
  });

  it('should log unabridged content to console.debug for query', async () => {
    _debugEnabled = true;
    _queryResults = [{ X: 'alice' }, { X: 'bob' }];
    await engine.query('person(X)');

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const args = consoleSpy.mock.calls[0];
    expect(args[0]).toBe('[PrologDebug] query:');
    expect(args[1]).toBe('person(X)');
    // args[2] is '->', args[3] is the binding summary
    expect(args[3]).toContain('X=alice');
    expect(args[3]).toContain('X=bob');
  });
});
