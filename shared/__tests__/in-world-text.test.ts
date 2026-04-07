import { describe, it, expect } from 'vitest';
import {
  translateInteractionVerb,
  buildBilingualBuildingPrompt,
  translateMenuTitle,
} from '../language/in-world-text';
import { shouldTranslateUIKey, getGameString } from '../language/ui-localization';
import type { CEFRLevel } from '../assessment/cefr-mapping';

// ── AC: shouldTranslateUIKey('actions.talk', 'B2') returns true
//        shouldTranslateUIKey('actions.talk', 'A1') returns false ──────────

describe('shouldTranslateUIKey for actions namespace', () => {
  it('returns false for actions.talk at A1', () => {
    expect(shouldTranslateUIKey('actions.talk', 'A1')).toBe(false);
  });

  it('returns false for actions.talk at A2', () => {
    expect(shouldTranslateUIKey('actions.talk', 'A2')).toBe(false);
  });

  it('returns true for actions.talk at B1', () => {
    expect(shouldTranslateUIKey('actions.talk', 'B1')).toBe(true);
  });

  it('returns true for actions.talk at B2', () => {
    expect(shouldTranslateUIKey('actions.talk', 'B2')).toBe(true);
  });

  it('returns true for actions.talk at C1 and C2', () => {
    expect(shouldTranslateUIKey('actions.talk', 'C1')).toBe(true);
    expect(shouldTranslateUIKey('actions.talk', 'C2')).toBe(true);
  });
});

// ── AC: at A1 action prompts return English; at B2 return target language ────

describe('translateInteractionVerb', () => {
  const verbs = [
    { english: 'Talk', target: 'Parler' },
    { english: 'Enter', target: 'Entrer' },
    { english: 'Pick Up', target: 'Ramasser' },
    { english: 'Examine', target: 'Examiner' },
    { english: 'Fish', target: 'Pêcher' },
  ];

  it('returns English for all verbs at A1', () => {
    for (const { english, target } of verbs) {
      expect(translateInteractionVerb(english, target, 'A1')).toBe(english);
    }
  });

  it('returns English for all verbs at A2', () => {
    for (const { english, target } of verbs) {
      expect(translateInteractionVerb(english, target, 'A2')).toBe(english);
    }
  });

  it('returns target language for all verbs at B1+', () => {
    for (const level of ['B1', 'B2', 'C1', 'C2'] as CEFRLevel[]) {
      for (const { english, target } of verbs) {
        expect(translateInteractionVerb(english, target, level)).toBe(target);
      }
    }
  });

  it('returns English when no translation available', () => {
    expect(translateInteractionVerb('Talk', undefined, 'B2')).toBe('Talk');
  });

  it('returns English in english_only mode regardless of level', () => {
    expect(translateInteractionVerb('Talk', 'Parler', 'C2', 'english_only')).toBe('Talk');
  });

  it('returns target language in maximum mode even at A1', () => {
    expect(translateInteractionVerb('Talk', 'Parler', 'A1', 'maximum')).toBe('Parler');
  });
});

// ── AC: building labels use buildBilingualBuildingPrompt() ───────────────────

describe('buildBilingualBuildingPrompt', () => {
  it('shows English primary with target subtitle at A1', () => {
    const result = buildBilingualBuildingPrompt('Bakery', 'Boulangerie', 'A1');
    expect(result.primary).toBe('Bakery');
    expect(result.subtitle).toBe('Boulangerie');
    expect(result.showTooltip).toBe(false);
  });

  it('shows English primary with target subtitle at A2', () => {
    const result = buildBilingualBuildingPrompt('Bakery', 'Boulangerie', 'A2');
    expect(result.primary).toBe('Bakery');
    expect(result.subtitle).toBe('Boulangerie');
    expect(result.showTooltip).toBe(false);
  });

  it('shows target language with English subtitle at B1', () => {
    const result = buildBilingualBuildingPrompt('Bakery', 'Boulangerie', 'B1');
    expect(result.primary).toBe('Boulangerie');
    expect(result.subtitle).toBe('Bakery');
    expect(result.showTooltip).toBe(true);
  });

  it('shows target language only (hover for English) at B2+', () => {
    for (const level of ['B2', 'C1', 'C2'] as CEFRLevel[]) {
      const result = buildBilingualBuildingPrompt('Bakery', 'Boulangerie', level);
      expect(result.primary).toBe('Boulangerie');
      expect(result.subtitle).toBeUndefined();
      expect(result.showTooltip).toBe(true);
    }
  });

  it('shows English when no translation available', () => {
    const result = buildBilingualBuildingPrompt('Bakery', undefined, 'B2');
    expect(result.primary).toBe('Bakery');
    expect(result.showTooltip).toBe(false);
  });
});

// ── translateMenuTitle ───────────────────────────────────────────────────────

describe('translateMenuTitle', () => {
  it('returns English at A1-A2 (locations namespace not active)', () => {
    expect(translateMenuTitle('Object', 'Objet', 'A1')).toBe('Object');
    expect(translateMenuTitle('Furniture', 'Meuble', 'A2')).toBe('Furniture');
  });

  it('returns target language at B1+ (locations namespace active)', () => {
    expect(translateMenuTitle('Object', 'Objet', 'B1')).toBe('Objet');
    expect(translateMenuTitle('Furniture', 'Meuble', 'B2')).toBe('Meuble');
    expect(translateMenuTitle('Container', 'Contenant', 'C1')).toBe('Contenant');
  });

  it('returns English when no translation available', () => {
    expect(translateMenuTitle('Custom Place', undefined, 'B2')).toBe('Custom Place');
  });
});

// ── getGameString direct usage (backing function for translateInteractionVerb) ─

describe('getGameString for action verbs', () => {
  it('returns English at A1 for actions namespace', () => {
    expect(getGameString('Talk', 'Parler', 'actions.talk', 'A1')).toBe('Talk');
    expect(getGameString('Enter', 'Entrer', 'actions.enter', 'A1')).toBe('Enter');
    expect(getGameString('Pick Up', 'Ramasser', 'actions.pickup', 'A1')).toBe('Pick Up');
    expect(getGameString('Examine', 'Examiner', 'actions.examine', 'A1')).toBe('Examine');
    expect(getGameString('Fish', 'Pêcher', 'actions.fish', 'A1')).toBe('Fish');
  });

  it('returns target language at B2 for actions namespace', () => {
    expect(getGameString('Talk', 'Parler', 'actions.talk', 'B2')).toBe('Parler');
    expect(getGameString('Enter', 'Entrer', 'actions.enter', 'B2')).toBe('Entrer');
    expect(getGameString('Pick Up', 'Ramasser', 'actions.pickup', 'B2')).toBe('Ramasser');
    expect(getGameString('Examine', 'Examiner', 'actions.examine', 'B2')).toBe('Examiner');
    expect(getGameString('Fish', 'Pêcher', 'actions.fish', 'B2')).toBe('Pêcher');
  });
});
