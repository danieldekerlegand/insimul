/**
 * PrologDebugger — In-game Prolog knowledge base inspector.
 *
 * When debug mode is active, provides:
 *   1. Entity hover enrichment: shows Prolog facts about hovered NPCs,
 *      buildings, items, and world objects in the debug tooltip.
 *   2. Interactive query panel: a collapsible panel for running ad-hoc
 *      Prolog queries against the live knowledge base.
 *
 * Activated via the existing Debug toggle (Game Menu > System > Debug).
 */

import type { GamePrologEngine } from '../logic/GamePrologEngine';

// ── Entity Hover Enrichment ─────────────────────────────────────────────────

/**
 * Extract the Prolog entity identifier from a mesh's metadata.
 * Returns the atom used in the knowledge base, or null if not identifiable.
 */
function extractEntityAtom(metadata: Record<string, any> | null): {
  atom: string;
  entityType: string;
} | null {
  if (!metadata) return null;

  if (metadata.npcId) {
    return { atom: sanitize(metadata.npcId), entityType: 'character' };
  }
  if (metadata.businessId) {
    return { atom: sanitize(metadata.businessId), entityType: 'business' };
  }
  if (metadata.residenceId) {
    return { atom: sanitize(metadata.residenceId), entityType: 'residence' };
  }
  if (metadata.settlementId) {
    return { atom: sanitize(metadata.settlementId), entityType: 'settlement' };
  }
  if (metadata.containerId) {
    return { atom: sanitize(metadata.containerId), entityType: 'container' };
  }
  if (metadata.itemId) {
    return { atom: sanitize(metadata.itemId), entityType: 'item' };
  }
  if (metadata.objectRole) {
    return { atom: sanitize(metadata.objectRole), entityType: 'object' };
  }

  return null;
}

/**
 * Query Prolog for all known facts about an entity.
 * Returns a formatted multi-line string for display in the debug tooltip.
 */
export async function queryEntityFacts(
  engine: GamePrologEngine,
  metadata: Record<string, any> | null,
): Promise<string | null> {
  const entity = extractEntityAtom(metadata);
  if (!entity) return null;

  const lines: string[] = [];
  lines.push(`--- Prolog (${entity.entityType}) ---`);

  try {
    // Query predicates that commonly use this entity's atom
    const predicateQueries = getPredicateQueriesForType(entity.entityType, entity.atom);

    for (const { label, query } of predicateQueries) {
      try {
        const results = await engine.query(query);
        if (results && results.length > 0) {
          for (const result of results) {
            const values = Object.entries(result)
              .filter(([k]) => k !== entity.atom)
              .map(([k, v]) => `${k}=${v}`)
              .join(', ');
            lines.push(`  ${label}: ${values || 'true'}`);
          }
        }
      } catch {
        // Query failed — predicate may not exist, skip silently
      }
    }

    // Also check quest-related facts about this entity
    try {
      const questResults = await engine.query(
        `quest_objective(QuestId, Idx, Goal)`, 5,
      );
      // Filter for goals mentioning this entity (heuristic)
      // This is best-effort since goal terms vary
    } catch { /* skip */ }
  } catch {
    lines.push('  (query error)');
  }

  return lines.length > 1 ? lines.join('\n') : null;
}

/**
 * Get a list of Prolog queries relevant to a given entity type.
 */
function getPredicateQueriesForType(
  entityType: string,
  atom: string,
): Array<{ label: string; query: string }> {
  switch (entityType) {
    case 'character':
      return [
        { label: 'name', query: `name(${atom}, Name)` },
        { label: 'occupation', query: `occupation(${atom}, Occ)` },
        { label: 'age', query: `age(${atom}, Age)` },
        { label: 'gender', query: `gender(${atom}, G)` },
        { label: 'alive', query: `alive(${atom})` },
        { label: 'mood', query: `mood(${atom}, Mood)` },
        { label: 'personality', query: `personality(${atom}, Trait, Value)` },
        { label: 'skill', query: `skill(${atom}, Skill, Level)` },
        { label: 'location', query: `current_location(${atom}, Loc)` },
        { label: 'home', query: `home(${atom}, Res)` },
        { label: 'workplace', query: `workplace(${atom}, Biz)` },
        { label: 'married', query: `married_to(${atom}, Spouse)` },
        { label: 'friend', query: `friends(${atom}, Friend)` },
        { label: 'enemy', query: `enemies(${atom}, Enemy)` },
        { label: 'knows', query: `knows(${atom}, Topic)` },
        { label: 'physical', query: `physical_trait(${atom}, Trait)` },
        { label: 'mental', query: `mental_trait(${atom}, Trait)` },
        { label: 'thinks', query: `has_thought(${atom}, Content)` },
      ];

    case 'business':
      return [
        { label: 'name', query: `business_name(${atom}, Name)` },
        { label: 'type', query: `business_type(${atom}, Type)` },
        { label: 'owner', query: `business_owner(${atom}, Owner)` },
        { label: 'settlement', query: `business_of_settlement(${atom}, Sett)` },
        { label: 'closed', query: `business_out_of_business(${atom})` },
      ];

    case 'residence':
      return [
        { label: 'type', query: `residence_type(${atom}, Type)` },
        { label: 'address', query: `residence_address(${atom}, Addr)` },
        { label: 'owner', query: `residence_owner(${atom}, Owner)` },
        { label: 'resident', query: `lives_at(Resident, ${atom})` },
        { label: 'settlement', query: `residence_of_settlement(${atom}, Sett)` },
      ];

    case 'settlement':
      return [
        { label: 'name', query: `settlement_name(${atom}, Name)` },
        { label: 'type', query: `settlement_type(${atom}, Type)` },
        { label: 'population', query: `settlement_population(${atom}, Pop)` },
        { label: 'district', query: `settlement_district(${atom}, Dist)` },
        { label: 'landmark', query: `settlement_landmark(${atom}, Lm)` },
        { label: 'country', query: `settlement_of_country(${atom}, C)` },
      ];

    case 'container':
      return [
        { label: 'name', query: `container_name(${atom}, Name)` },
        { label: 'type', query: `container_type(${atom}, Type)` },
        { label: 'locked', query: `container_locked(${atom})` },
        { label: 'contains', query: `container_contains(${atom}, Item, Qty)` },
        { label: 'accessible', query: `container_accessible(player, ${atom})` },
      ];

    case 'item':
      return [
        { label: 'name', query: `item_name(${atom}, Name)` },
        { label: 'type', query: `item_type(${atom}, Type)` },
        { label: 'value', query: `item_value(${atom}, V)` },
        { label: 'player has', query: `has(player, ${atom})` },
      ];

    default:
      return [];
  }
}

// ── Interactive Query Panel ─────────────────────────────────────────────────

let _panelDiv: HTMLDivElement | null = null;
let _inputEl: HTMLInputElement | null = null;
let _outputEl: HTMLPreElement | null = null;
let _historyEl: HTMLDivElement | null = null;
let _prologEngine: GamePrologEngine | null = null;
const _queryHistory: string[] = [];
let _historyIndex = -1;

/**
 * Create and show the Prolog debug panel.
 */
export function showPrologDebugPanel(
  container: HTMLElement,
  engine: GamePrologEngine,
): void {
  _prologEngine = engine;

  if (_panelDiv) {
    _panelDiv.style.display = 'flex';
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'prolog-debug-panel';
  panel.style.cssText =
    'position:absolute;bottom:10px;right:10px;width:480px;max-height:400px;' +
    'background:rgba(0,0,0,0.92);color:#0f0;font:13px monospace;' +
    'border:1px solid #0f0;border-radius:8px;z-index:2000;' +
    'display:flex;flex-direction:column;overflow:hidden;';

  // Title bar
  const titleBar = document.createElement('div');
  titleBar.style.cssText =
    'padding:6px 10px;background:rgba(0,80,0,0.5);display:flex;' +
    'justify-content:space-between;align-items:center;cursor:move;' +
    'border-bottom:1px solid #0f0;user-select:none;';
  titleBar.innerHTML = '<span style="font-weight:bold;">Prolog KB Inspector</span>';

  // Collapse button
  const collapseBtn = document.createElement('button');
  collapseBtn.textContent = '_';
  collapseBtn.style.cssText =
    'background:none;border:1px solid #0f0;color:#0f0;cursor:pointer;' +
    'font:bold 13px monospace;padding:0 6px;border-radius:3px;';
  collapseBtn.onclick = () => {
    const body = panel.querySelector('#prolog-debug-body') as HTMLElement;
    if (body) body.style.display = body.style.display === 'none' ? 'flex' : 'none';
  };
  titleBar.appendChild(collapseBtn);
  panel.appendChild(titleBar);

  // Body
  const body = document.createElement('div');
  body.id = 'prolog-debug-body';
  body.style.cssText = 'display:flex;flex-direction:column;flex:1;overflow:hidden;';

  // Output area
  const output = document.createElement('pre');
  output.style.cssText =
    'flex:1;overflow-y:auto;padding:8px;margin:0;font:12px monospace;' +
    'color:#0f0;max-height:280px;white-space:pre-wrap;word-break:break-all;';
  output.textContent = '% Prolog Knowledge Base Inspector\n% Type a query and press Enter.\n% Examples:\n%   person(X).\n%   quest_active(player, Q).\n%   pronunciation_score(player, P, S, T).\n%   has(player, X).\n';
  body.appendChild(output);
  _outputEl = output;

  // Quick-action buttons
  const quickBar = document.createElement('div');
  quickBar.style.cssText = 'padding:4px 8px;display:flex;gap:4px;flex-wrap:wrap;border-top:1px solid #060;';
  const quickQueries = [
    { label: 'Quests', query: 'quest_active(player, Q)' },
    { label: 'Inventory', query: 'has(player, X)' },
    { label: 'CEFR', query: 'player_cefr_level(player, L)' },
    { label: 'Vocab', query: 'pronunciation_count(player, C)' },
    { label: 'NPCs', query: 'person(X)' },
    { label: 'KB Stats', query: '__stats__' },
  ];
  for (const qq of quickQueries) {
    const btn = document.createElement('button');
    btn.textContent = qq.label;
    btn.style.cssText =
      'background:rgba(0,60,0,0.5);border:1px solid #060;color:#0f0;' +
      'font:11px monospace;padding:2px 6px;cursor:pointer;border-radius:3px;';
    btn.onclick = () => executeQuery(qq.query);
    quickBar.appendChild(btn);
  }
  body.appendChild(quickBar);

  // Input area
  const inputRow = document.createElement('div');
  inputRow.style.cssText = 'display:flex;border-top:1px solid #0f0;';

  const prompt = document.createElement('span');
  prompt.textContent = '?- ';
  prompt.style.cssText = 'padding:6px;color:#0f0;font:bold 13px monospace;';
  inputRow.appendChild(prompt);

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'person(X).';
  input.style.cssText =
    'flex:1;background:transparent;border:none;color:#0f0;' +
    'font:13px monospace;outline:none;padding:6px 0;';
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      executeQuery(input.value.trim());
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (_historyIndex < _queryHistory.length - 1) {
        _historyIndex++;
        input.value = _queryHistory[_queryHistory.length - 1 - _historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (_historyIndex > 0) {
        _historyIndex--;
        input.value = _queryHistory[_queryHistory.length - 1 - _historyIndex];
      } else {
        _historyIndex = -1;
        input.value = '';
      }
    }
  };
  inputRow.appendChild(input);
  body.appendChild(inputRow);
  _inputEl = input;

  panel.appendChild(body);
  container.appendChild(panel);
  _panelDiv = panel;
}

/**
 * Hide the Prolog debug panel.
 */
export function hidePrologDebugPanel(): void {
  if (_panelDiv) _panelDiv.style.display = 'none';
}

/**
 * Remove the Prolog debug panel entirely.
 */
export function disposePrologDebugPanel(): void {
  if (_panelDiv) {
    _panelDiv.remove();
    _panelDiv = null;
    _inputEl = null;
    _outputEl = null;
    _prologEngine = null;
  }
}

/**
 * Execute a Prolog query and display the results in the panel.
 */
async function executeQuery(queryText: string): Promise<void> {
  if (!_prologEngine || !_outputEl) return;
  if (!queryText) return;

  // Record in history
  _queryHistory.push(queryText);
  _historyIndex = -1;

  // Special commands
  if (queryText === '__stats__') {
    const stats = _prologEngine.getStats();
    appendOutput(`\n?- [KB Stats]\nFacts: ${stats?.factCount ?? '?'}\nRules: ${stats?.ruleCount ?? '?'}\n`);
    return;
  }

  // Strip trailing period if present
  const goal = queryText.endsWith('.') ? queryText.slice(0, -1) : queryText;

  appendOutput(`\n?- ${goal}.`);

  try {
    const results = await _prologEngine.query(goal);
    if (!results || results.length === 0) {
      appendOutput('false.');
    } else {
      for (const result of results) {
        const bindings = Object.entries(result);
        if (bindings.length === 0) {
          appendOutput('true.');
        } else {
          const formatted = bindings.map(([k, v]) => `${k} = ${v}`).join(', ');
          appendOutput(formatted);
        }
      }
    }
  } catch (err: any) {
    appendOutput(`ERROR: ${err?.message || err}`);
  }
}

function appendOutput(text: string): void {
  if (!_outputEl) return;
  _outputEl.textContent += text + '\n';
  _outputEl.scrollTop = _outputEl.scrollHeight;
}

// ── Utils ────────────────────────────────────────────────────────────────────

function sanitize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^([0-9])/, '_$1').replace(/_+/g, '_');
}
