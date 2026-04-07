import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Since jsdom is not available, we test the tab system by mocking DOM APIs
// and importing the module functions.

// ── Minimal DOM mocks ──────────────────────────────────────────────────────

function createMockElement(tag: string): any {
  const children: any[] = [];
  const dataset: Record<string, string> = {};
  const styleObj: Record<string, string> = {};
  // Proxy to parse cssText assignments into individual properties
  const style = new Proxy(styleObj, {
    set(target, prop: string, value: string) {
      if (prop === 'cssText') {
        // Parse "key:value;key:value;" into individual properties
        for (const part of value.split(';')) {
          const [k, ...v] = part.split(':');
          if (k && v.length) {
            const camelKey = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
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
    appendChild(child: any) { children.push(child); return child; },
    remove() {},
    querySelector(sel: string) {
      return deepQuery(el, sel);
    },
    querySelectorAll(sel: string) {
      const results: any[] = [];
      deepQueryAll(el, sel, results);
      return results;
    },
    setAttribute(k: string, v: string) { el[k] = v; },
    getAttribute(k: string) { return dataset[k] ?? el[k] ?? null; },
    onclick: null,
    onkeydown: null,
    scrollTop: 0,
    scrollHeight: 0,
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
  if (sel.startsWith('[data-tab-panel=')) {
    const val = sel.match(/="([^"]+)"/)?.[1];
    return el.dataset?.tabPanel === val;
  }
  if (sel === '[data-tab-panel]') return !!el.dataset?.tabPanel;
  if (sel.startsWith('button[data-tab]')) return el.tagName === 'BUTTON' && el.dataset?.tab != null;
  if (sel === 'pre') return el.tagName === 'PRE';
  if (sel === 'span') return el.tagName === 'SPAN';
  if (sel === '[data-scroll]') return el.dataset?.scroll != null;
  return false;
}

// Mock document.createElement
const origCreateElement = globalThis.document?.createElement?.bind(globalThis.document);

describe('Debug Console Tab System', () => {
  let container: any;
  let module: any;

  beforeEach(async () => {
    // Set up document mock
    (globalThis as any).document = {
      createElement(tag: string) {
        return createMockElement(tag);
      },
      body: createMockElement('body'),
    };

    container = createMockElement('div');

    // Fresh import each test to reset module state
    vi.resetModules();
    module = await import('../game-engine/rendering/PrologDebugger');
  });

  afterEach(() => {
    module?.disposePrologDebugPanel();
  });

  const mockEngine = {
    query: async () => [],
    getStats: () => ({ factCount: 10, ruleCount: 5 }),
  } as any;

  it('should create panel with three tab buttons (Prolog, LLM, Language)', async () => {
    module.showPrologDebugPanel(container, mockEngine);

    const buttons = container.querySelectorAll('button[data-tab]');
    expect(buttons.length).toBe(3);

    const tabNames = buttons.map((b: any) => b.dataset.tab);
    expect(tabNames).toEqual(['prolog', 'llm', 'language']);
  });

  it('should start with Prolog tab active and others hidden', async () => {
    module.showPrologDebugPanel(container, mockEngine);

    expect(module.getActiveDebugTab()).toBe('prolog');

    const prologPanel = container.querySelector('[data-tab-panel="prolog"]');
    const llmPanel = container.querySelector('[data-tab-panel="llm"]');
    const langPanel = container.querySelector('[data-tab-panel="language"]');

    // Prolog panel is visible (display is 'flex', not 'none')
    expect(prologPanel.style.display).not.toBe('none');
    // LLM and Language are hidden
    expect(llmPanel.style.display).toBe('none');
    expect(langPanel.style.display).toBe('none');
  });

  it('should switch tabs and update title', async () => {
    module.showPrologDebugPanel(container, mockEngine);

    module.switchDebugTab('llm');
    expect(module.getActiveDebugTab()).toBe('llm');

    const prologPanel = container.querySelector('[data-tab-panel="prolog"]');
    const llmPanel = container.querySelector('[data-tab-panel="llm"]');

    expect(prologPanel.style.display).toBe('none');
    expect(llmPanel.style.display).toBe('flex');
  });

  it('should switch to Language tab', async () => {
    module.showPrologDebugPanel(container, mockEngine);

    module.switchDebugTab('language');
    expect(module.getActiveDebugTab()).toBe('language');

    const langPanel = container.querySelector('[data-tab-panel="language"]');
    expect(langPanel.style.display).toBe('flex');
  });

  it('should preserve content state across tab switches', async () => {
    module.showPrologDebugPanel(container, mockEngine);

    const prologPanel = container.querySelector('[data-tab-panel="prolog"]');
    const prologOutput = deepQuery(prologPanel, 'pre');
    const originalContent = prologOutput.textContent;
    expect(originalContent).toContain('Prolog Knowledge Base Inspector');

    // Switch away and back
    module.switchDebugTab('llm');
    module.switchDebugTab('prolog');

    // Content preserved
    expect(prologOutput.textContent).toBe(originalContent);
  });

  it('should show placeholder messages in LLM and Language tabs', async () => {
    module.showPrologDebugPanel(container, mockEngine);

    const llmPanel = container.querySelector('[data-tab-panel="llm"]');
    const langPanel = container.querySelector('[data-tab-panel="language"]');

    const llmPre = deepQuery(llmPanel, 'pre');
    const langPre = deepQuery(langPanel, 'pre');

    expect(llmPre.textContent).toContain('No LLM events yet');
    expect(langPre.textContent).toContain('No language events yet');
  });

  it('should not throw when switching to already-active tab', async () => {
    module.showPrologDebugPanel(container, mockEngine);

    // Should be a no-op
    expect(() => module.switchDebugTab('prolog')).not.toThrow();
    expect(module.getActiveDebugTab()).toBe('prolog');
  });

  it('should reset state on dispose', async () => {
    module.showPrologDebugPanel(container, mockEngine);
    module.switchDebugTab('llm');
    module.disposePrologDebugPanel();

    // After dispose, getActiveDebugTab should return default
    expect(module.getActiveDebugTab()).toBe('prolog');

    // switchDebugTab should be a no-op (no panels)
    expect(() => module.switchDebugTab('language')).not.toThrow();
  });
});
