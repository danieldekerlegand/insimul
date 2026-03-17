/**
 * Tests for ReadSignAction
 *
 * Validates sign text formatting by fluency tier, action creation,
 * action execution, and knowledge effect generation.
 */

import { describe, it, expect } from 'vitest';
import {
  getFluencyTier,
  formatSignText,
  createReadSignAction,
  executeReadSign,
  type SignData,
} from '../actions/ReadSignAction';
import type { ActionContext } from '@shared/game-engine/types';

const sampleSign: SignData = {
  signId: 'sign-001',
  targetText: 'Boulangerie',
  nativeText: 'Bakery',
  category: 'buildings',
};

const baseContext: ActionContext = {
  actor: 'player-1',
  target: 'sign-001',
  location: 'town-square',
  timestamp: Date.now(),
  playerEnergy: 100,
  playerPosition: { x: 0, y: 0 },
};

describe('getFluencyTier', () => {
  it('returns beginner for fluency 0-29', () => {
    expect(getFluencyTier(0)).toBe('beginner');
    expect(getFluencyTier(15)).toBe('beginner');
    expect(getFluencyTier(29)).toBe('beginner');
  });

  it('returns intermediate for fluency 30-59', () => {
    expect(getFluencyTier(30)).toBe('intermediate');
    expect(getFluencyTier(45)).toBe('intermediate');
    expect(getFluencyTier(59)).toBe('intermediate');
  });

  it('returns advanced for fluency 60+', () => {
    expect(getFluencyTier(60)).toBe('advanced');
    expect(getFluencyTier(80)).toBe('advanced');
    expect(getFluencyTier(100)).toBe('advanced');
  });
});

describe('formatSignText', () => {
  it('shows both languages for beginners', () => {
    const text = formatSignText(sampleSign, 'beginner');
    expect(text).toBe('Boulangerie (Bakery)');
  });

  it('shows only target language for intermediate', () => {
    const text = formatSignText(sampleSign, 'intermediate');
    expect(text).toBe('Boulangerie');
  });

  it('shows only target language for advanced', () => {
    const text = formatSignText(sampleSign, 'advanced');
    expect(text).toBe('Boulangerie');
  });
});

describe('createReadSignAction', () => {
  const action = createReadSignAction('test-read-sign');

  it('creates action with correct id and name', () => {
    expect(action.id).toBe('test-read-sign');
    expect(action.name).toBe('Read Sign');
  });

  it('is a mental action type', () => {
    expect(action.actionType).toBe('mental');
  });

  it('requires a target object', () => {
    expect(action.requiresTarget).toBe(true);
    expect(action.targetType).toBe('object');
  });

  it('has zero energy cost', () => {
    expect(action.energyCost).toBe(0);
  });

  it('has interaction range of 3', () => {
    expect(action.range).toBe(3);
  });

  it('is a base action', () => {
    expect(action.isBase).toBe(true);
    expect(action.worldId).toBeNull();
  });

  it('has exploration tags', () => {
    expect(action.tags).toContain('exploration');
    expect(action.tags).toContain('language-learning');
    expect(action.tags).toContain('environmental');
  });

  it('has Prolog content', () => {
    expect(action.content).toContain('action(read_sign');
    expect(action.content).toContain('can_perform(Actor, read_sign, Target)');
  });
});

describe('executeReadSign', () => {
  const action = createReadSignAction('test-read-sign');

  it('succeeds and returns formatted text for beginners', () => {
    const result = executeReadSign(action, baseContext, sampleSign, 10);
    expect(result.success).toBe(true);
    expect(result.narrativeText).toContain('Boulangerie (Bakery)');
    expect(result.energyUsed).toBe(0);
  });

  it('shows only target language for intermediate players', () => {
    const result = executeReadSign(action, baseContext, sampleSign, 45);
    expect(result.narrativeText).toContain('Boulangerie');
    expect(result.narrativeText).not.toContain('Bakery');
  });

  it('produces a knowledge effect with sign data', () => {
    const result = executeReadSign(action, baseContext, sampleSign, 10);
    expect(result.effects).toHaveLength(1);

    const effect = result.effects[0];
    expect(effect.type).toBe('knowledge');
    expect(effect.target).toBe('player-1');
    expect(effect.value.signId).toBe('sign-001');
    expect(effect.value.targetText).toBe('Boulangerie');
    expect(effect.value.nativeText).toBe('Bakery');
    expect(effect.value.category).toBe('buildings');
  });

  it('includes vocabulary description in effect', () => {
    const result = executeReadSign(action, baseContext, sampleSign, 10);
    expect(result.effects[0].description).toContain('Boulangerie');
  });
});
