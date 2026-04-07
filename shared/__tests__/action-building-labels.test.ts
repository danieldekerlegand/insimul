import { describe, it, expect } from 'vitest';
import {
  ACTION_LABELS,
  ACTION_LABEL_WORDS,
  BUILDING_TYPE_LABELS,
  getActionLabel,
  getBuildingTypeLabel,
  type TranslationLookupFn,
} from '../language/action-labels';
import {
  shouldTranslateUIKey,
  getGameString,
  getBilingualDisplay,
} from '../language/ui-localization';
import type { CEFRLevel } from '../assessment/cefr-mapping';

// ── ACTION_LABELS Registry ──────────────────────────────────────────────────

describe('ACTION_LABELS', () => {
  it('contains all expected core actions', () => {
    const expected = ['talk', 'eavesdrop', 'enter', 'examine', 'read', 'pick_up',
      'give_gift', 'open', 'sit', 'use', 'fishing', 'mining', 'harvesting',
      'cooking', 'crafting', 'painting', 'reading', 'praying', 'sweeping',
      'chopping', 'herbalism', 'farm_plant', 'farm_water', 'farm_harvest', 'brew'];
    for (const id of expected) {
      expect(ACTION_LABELS[id]).toBeDefined();
      expect(ACTION_LABELS[id].english).toBeTruthy();
    }
  });

  it('all entries have non-empty english labels', () => {
    for (const [id, entry] of Object.entries(ACTION_LABELS)) {
      expect(entry.english, `${id} should have english label`).toBeTruthy();
    }
  });
});

describe('ACTION_LABEL_WORDS', () => {
  it('is a deduplicated list of English labels', () => {
    expect(ACTION_LABEL_WORDS.length).toBeGreaterThan(0);
    const unique = new Set(ACTION_LABEL_WORDS);
    expect(unique.size).toBe(ACTION_LABEL_WORDS.length);
  });

  it('includes Talk, Enter, Examine', () => {
    expect(ACTION_LABEL_WORDS).toContain('Talk');
    expect(ACTION_LABEL_WORDS).toContain('Enter');
    expect(ACTION_LABEL_WORDS).toContain('Examine');
  });
});

// ── getActionLabel ──────────────────────────────────────────────────────────

describe('getActionLabel', () => {
  it('returns English for both fields when no lookup provided', () => {
    const result = getActionLabel('talk');
    expect(result.label).toBe('Talk');
    expect(result.labelTranslation).toBe('Talk');
  });

  it('returns translated label when lookup has a match', () => {
    const lookup: TranslationLookupFn = (w) => w === 'Talk' ? 'Parler' : undefined;
    const result = getActionLabel('talk', lookup);
    expect(result.label).toBe('Parler');
    expect(result.labelTranslation).toBe('Talk');
  });

  it('falls back to English when lookup returns undefined', () => {
    const lookup: TranslationLookupFn = () => undefined;
    const result = getActionLabel('talk', lookup);
    expect(result.label).toBe('Talk');
    expect(result.labelTranslation).toBe('Talk');
  });

  it('uses action id as fallback for unknown actions', () => {
    const result = getActionLabel('unknown_action');
    expect(result.label).toBe('unknown_action');
    expect(result.labelTranslation).toBe('unknown_action');
  });

  it('translates unknown action when lookup matches the id', () => {
    const lookup: TranslationLookupFn = (w) => w === 'unknown_action' ? 'Acción desconocida' : undefined;
    const result = getActionLabel('unknown_action', lookup);
    expect(result.label).toBe('Acción desconocida');
    expect(result.labelTranslation).toBe('unknown_action');
  });

  it('handles all registered actions without errors', () => {
    const frenchLookup: TranslationLookupFn = (w) => `fr_${w}`;
    for (const id of Object.keys(ACTION_LABELS)) {
      const result = getActionLabel(id, frenchLookup);
      expect(result.label).toMatch(/^fr_/);
      expect(result.labelTranslation).toBeTruthy();
    }
  });
});

// ── BUILDING_TYPE_LABELS ────────────────────────────────────────────────────

describe('BUILDING_TYPE_LABELS', () => {
  it('contains common building types', () => {
    expect(BUILDING_TYPE_LABELS).toContain('Bakery');
    expect(BUILDING_TYPE_LABELS).toContain('Tavern');
    expect(BUILDING_TYPE_LABELS).toContain('Residence');
    expect(BUILDING_TYPE_LABELS).toContain('Town Hall');
  });

  it('has more than 20 entries', () => {
    expect(BUILDING_TYPE_LABELS.length).toBeGreaterThan(20);
  });
});

describe('getBuildingTypeLabel', () => {
  it('returns undefined translated when no lookup provided', () => {
    const result = getBuildingTypeLabel('Bakery');
    expect(result.english).toBe('Bakery');
    expect(result.translated).toBeUndefined();
  });

  it('returns translated type when lookup matches', () => {
    const lookup: TranslationLookupFn = (w) => w === 'Bakery' ? 'Boulangerie' : undefined;
    const result = getBuildingTypeLabel('Bakery', lookup);
    expect(result.english).toBe('Bakery');
    expect(result.translated).toBe('Boulangerie');
  });
});

// ── CEFR-aware display integration ──────────────────────────────────────────

describe('CEFR-aware action label display', () => {
  it('actions namespace does not translate at A1/A2', () => {
    expect(shouldTranslateUIKey('actions.label', 'A1')).toBe(false);
    expect(shouldTranslateUIKey('actions.label', 'A2')).toBe(false);
  });

  it('actions namespace translates at B1+', () => {
    expect(shouldTranslateUIKey('actions.label', 'B1')).toBe(true);
    expect(shouldTranslateUIKey('actions.label', 'B2')).toBe(true);
    expect(shouldTranslateUIKey('actions.label', 'C1')).toBe(true);
    expect(shouldTranslateUIKey('actions.label', 'C2')).toBe(true);
  });

  it('english_only mode never translates', () => {
    expect(shouldTranslateUIKey('actions.label', 'C2', 'english_only')).toBe(false);
  });

  it('maximum mode always translates', () => {
    expect(shouldTranslateUIKey('actions.label', 'A1', 'maximum')).toBe(true);
  });
});

describe('CEFR-aware building type display', () => {
  it('locations namespace does not translate at A1/A2', () => {
    expect(shouldTranslateUIKey('locations.type', 'A1')).toBe(false);
    expect(shouldTranslateUIKey('locations.type', 'A2')).toBe(false);
  });

  it('locations namespace translates at B1+', () => {
    expect(shouldTranslateUIKey('locations.type', 'B1')).toBe(true);
    expect(shouldTranslateUIKey('locations.type', 'B2')).toBe(true);
  });

  it('getGameString returns English when CEFR is below threshold', () => {
    const text = getGameString('Bakery', 'Boulangerie', 'locations.type', 'A1');
    expect(text).toBe('Bakery');
  });

  it('getGameString returns translated at B1+', () => {
    const text = getGameString('Bakery', 'Boulangerie', 'locations.type', 'B1');
    expect(text).toBe('Boulangerie');
  });

  it('getGameString returns English when no translation available', () => {
    const text = getGameString('Bakery', undefined, 'locations.type', 'C2');
    expect(text).toBe('Bakery');
  });
});

describe('Bilingual building name display', () => {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  it('A1-A2 shows English primary with target subtitle', () => {
    for (const level of ['A1', 'A2'] as CEFRLevel[]) {
      const result = getBilingualDisplay('Bakery', 'Boulangerie', level);
      expect(result.primary).toBe('Bakery');
      expect(result.subtitle).toBe('Boulangerie');
      expect(result.showTooltip).toBe(false);
    }
  });

  it('B1 shows target primary with English subtitle and tooltip', () => {
    const result = getBilingualDisplay('Bakery', 'Boulangerie', 'B1');
    expect(result.primary).toBe('Boulangerie');
    expect(result.subtitle).toBe('Bakery');
    expect(result.showTooltip).toBe(true);
  });

  it('B2+ shows target only with tooltip', () => {
    for (const level of ['B2', 'C1', 'C2'] as CEFRLevel[]) {
      const result = getBilingualDisplay('Bakery', 'Boulangerie', level);
      expect(result.primary).toBe('Boulangerie');
      expect(result.subtitle).toBeUndefined();
      expect(result.showTooltip).toBe(true);
    }
  });

  it('returns English only when no translation provided', () => {
    for (const level of levels) {
      const result = getBilingualDisplay('Bakery', undefined, level);
      expect(result.primary).toBe('Bakery');
      expect(result.showTooltip).toBe(false);
    }
  });
});
