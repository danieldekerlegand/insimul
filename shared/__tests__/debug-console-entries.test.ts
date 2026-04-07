import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Minimal DOM mocks (same pattern as debug-console-tabs.test.ts) ────────

function createMockElement(tag: string): any {
  const children: any[] = [];
  const dataset: Record<string, string> = {};
  const styleObj: Record<string, string> = {};
  const style = new Proxy(styleObj, {
    set(target, prop: string, value: string) {
      if (prop === 'cssText') {
        for (const part of value.split(';')) {
          const [k, ...v] = part.split(':');
          if (k && v.length) {
            const camelKey = k.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
            target[camelKey] = v.join(':').trim();
          }
        }
        return true;
      }
      target[prop] = value;
      return true;
    },
    get(target, prop: string) {
      return target[prop] ?? '';
    },
  });
  const el: any = {
    tagName: tag.toUpperCase(),
    style,
    dataset,
    children,
    childNodes: children,
    id: '',
    textContent: '',
    innerHTML: '',
    type: '',
    placeholder: '',
    appendChild(child: any) { children.push(child); child._parent = el; return child; },
    remove() {
      if (el._parent) {
        const idx = el._parent.children.indexOf(el);
        if (idx >= 0) el._parent.children.splice(idx, 1);
      }
    },
    querySelector(sel: string) { return deepQuery(el, sel); },
    querySelectorAll(sel: string) {
      const results: any[] = [];
      deepQueryAll(el, sel, results);
      return results;
    },
    setAttribute(k: string, v: string) { el[k] = v; },
    getAttribute(k: string) { return dataset[k] ?? el[k] ?? null; },
    onclick: null,
    onkeydown: null,
    onscroll: null,
    scrollTop: 0,
    scrollHeight: 500,
    clientHeight: 280,
    _parent: null,
  };
  return el;
}

function deepQuery(el: any, sel: string): any {
  for (const child of (el.children || [])) {
    if (matchesSelector(child, sel)) return child;
    const found = deepQuery(child, sel);
    if (found) return found;
  }
  return null;
}

function deepQueryAll(el: any, sel: string, results: any[]): void {
  for (const child of (el.children || [])) {
    if (matchesSelector(child, sel)) results.push(child);
    deepQueryAll(child, sel, results);
  }
}

function matchesSelector(el: any, sel: string): boolean {
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('[data-log-entry')) {
    if (sel === '[data-log-entry]') return !!el.dataset?.logEntry;
    const val = sel.match(/="([^"]+)"/)?.[1];
    return el.dataset?.logEntry === val;
  }
  if (sel === '[data-summary-row]') return !!el.dataset?.summaryRow;
  if (sel === '[data-detail-area]') return !!el.dataset?.detailArea;
  if (sel === '[data-indicator]') return !!el.dataset?.indicator;
  if (sel === '[data-entry-container]') return !!el.dataset?.entryContainer;
  if (sel === '[data-scroll]') return el.dataset?.scroll != null;
  if (sel === 'pre') return el.tagName === 'PRE';
  if (sel === 'span') return el.tagName === 'SPAN';
  if (sel === 'div') return el.tagName === 'DIV';
  return false;
}

describe('Debug Console Entries', () => {
  let module: typeof import('../game-engine/rendering/DebugConsoleEntries');

  beforeEach(async () => {
    (globalThis as any).document = {
      createElement(tag: string) { return createMockElement(tag); },
      body: createMockElement('body'),
    };
    vi.resetModules();
    module = await import('../game-engine/rendering/DebugConsoleEntries');
  });

  afterEach(() => {
    module.disposeEntryStores();
  });

  function makeEntry(overrides: Partial<import('../game-engine/rendering/DebugConsoleEntries').DebugLogEntryData> = {}): import('../game-engine/rendering/DebugConsoleEntries').DebugLogEntryData {
    return {
      tag: 'Prolog',
      category: 'prolog',
      summary: 'asserted: quest_status(q1, completed)',
      detail: 'Full fact text:\nquest_status(q1, completed).\nSource: quest completion handler',
      timestamp: new Date(2026, 3, 6, 12, 4, 3),
      ...overrides,
    };
  }

  it('should create 5 entries with correct category colors', () => {
    const container = module.createEntryContainer('llm');

    const entries = [
      makeEntry({ category: 'prolog', tag: 'Prolog', summary: 'assert fact' }),
      makeEntry({ category: 'llm', tag: 'Chat', summary: 'NPC response' }),
      makeEntry({ category: 'language', tag: 'EVAL', summary: 'vocab:4 gram:3' }),
      makeEntry({ category: 'error', tag: 'Error', summary: 'query failed' }),
      makeEntry({ category: 'llm', tag: 'Route', summary: 'routed to LLM' }),
    ];

    const elements: any[] = [];
    for (const entry of entries) {
      elements.push(module.addDebugLogEntry('llm', entry));
    }

    expect(elements).toHaveLength(5);
    expect(container.children).toHaveLength(5);

    // Verify color-coding via dataset category
    expect(elements[0].dataset.logEntry).toBe('prolog');
    expect(elements[1].dataset.logEntry).toBe('llm');
    expect(elements[2].dataset.logEntry).toBe('language');
    expect(elements[3].dataset.logEntry).toBe('error');
    expect(elements[4].dataset.logEntry).toBe('llm');

    // Verify category colors
    expect(module.getCategoryColor('prolog')).toBe('#0f0');
    expect(module.getCategoryColor('llm')).toBe('#0af');
    expect(module.getCategoryColor('language')).toBe('#fa0');
    expect(module.getCategoryColor('error')).toBe('#f44');
  });

  it('should render entries in collapsed state by default with expand on click', () => {
    module.createEntryContainer('prolog');

    const el = module.addDebugLogEntry('prolog', makeEntry());

    // Detail area should be hidden by default
    const detailArea = deepQuery(el, '[data-detail-area]');
    expect(detailArea).toBeTruthy();
    expect(detailArea.style.display).toBe('none');

    // Indicator should show collapsed arrow
    const indicator = deepQuery(el, '[data-indicator]');
    expect(indicator.textContent).toBe('▶ ');

    // Click summary row to expand
    const summaryRow = deepQuery(el, '[data-summary-row]');
    summaryRow.onclick();

    expect(detailArea.style.display).toBe('block');
    expect(indicator.textContent).toBe('▼ ');

    // Click again to collapse
    summaryRow.onclick();
    expect(detailArea.style.display).toBe('none');
    expect(indicator.textContent).toBe('▶ ');
  });

  it('should display timestamp, tag, and summary in collapsed view', () => {
    module.createEntryContainer('prolog');

    const el = module.addDebugLogEntry('prolog', makeEntry({
      tag: 'Prolog',
      summary: 'asserted: quest_status(q1, completed)',
      timestamp: new Date(2026, 3, 6, 12, 4, 3),
    }));

    const spans = el.querySelectorAll('span');
    // spans: indicator, timestamp, tag, summary
    expect(spans.length).toBeGreaterThanOrEqual(4);

    // Timestamp
    const tsSpan = spans[1];
    expect(tsSpan.textContent).toBe('12:04:03');

    // Tag
    const tagSpan = spans[2];
    expect(tagSpan.textContent).toBe('[Prolog]');

    // Summary
    const summarySpan = spans[3];
    expect(summarySpan.textContent).toBe('asserted: quest_status(q1, completed)');
  });

  it('should show detail content in expanded view', () => {
    module.createEntryContainer('prolog');

    const detailText = 'Full fact:\nquest_status(q1, completed).\nSource: handler';
    const el = module.addDebugLogEntry('prolog', makeEntry({ detail: detailText }));

    const detailArea = deepQuery(el, '[data-detail-area]');
    expect(detailArea.textContent).toBe(detailText);
  });

  it('should evict oldest entries when exceeding 200', () => {
    module.createEntryContainer('llm');

    // Add 201 entries
    for (let i = 0; i < 201; i++) {
      module.addDebugLogEntry('llm', makeEntry({ summary: `entry-${i}` }));
    }

    expect(module.getTabEntryCount('llm')).toBe(200);
  });

  it('should clear all entries for a tab', () => {
    module.createEntryContainer('language');

    module.addDebugLogEntry('language', makeEntry({ category: 'language' }));
    module.addDebugLogEntry('language', makeEntry({ category: 'language' }));
    expect(module.getTabEntryCount('language')).toBe(2);

    module.clearTabEntries('language');
    expect(module.getTabEntryCount('language')).toBe(0);
  });

  it('should reset all stores on dispose', () => {
    module.createEntryContainer('prolog');
    module.createEntryContainer('llm');

    module.addDebugLogEntry('prolog', makeEntry());
    module.addDebugLogEntry('llm', makeEntry({ category: 'llm' }));

    module.disposeEntryStores();

    expect(module.getTabEntryCount('prolog')).toBe(0);
    expect(module.getTabEntryCount('llm')).toBe(0);
  });
});
