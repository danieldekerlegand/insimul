/**
 * Tests for the action-to-animation mapping module.
 */
import { describe, it, expect } from 'vitest';
import {
  ACTION_ANIMATION_MAP,
  getAnimationForAction,
  resolveAnimationClip,
  getActionAnimationsByCategory,
  isValidAnimationClip,
} from '../game-engine/action-animation-map';
import { ANIMATION_CATALOG } from '../game-engine/animation-registry';

describe('ACTION_ANIMATION_MAP', () => {
  it('contains entries for all key action types', () => {
    const requiredActions = [
      'fish', 'mine_rock', 'chop_tree', 'gather_herb',
      'farm_plant', 'farm_water', 'farm_harvest',
      'cook', 'craft_item', 'consume',
      'buy_item', 'sell_item', 'equip_item', 'drop_item', 'use_item',
      'greet', 'talk_to_npc', 'ask_for_directions',
      'listen_and_repeat', 'point_and_name',
      'attack_enemy', 'eavesdrop', 'sleep', 'rest',
    ];
    for (const action of requiredActions) {
      expect(ACTION_ANIMATION_MAP[action]).toBeDefined();
    }
  });

  it('has valid animation clips for all entries', () => {
    for (const [actionName, entry] of Object.entries(ACTION_ANIMATION_MAP)) {
      expect(entry.actionName).toBe(actionName);
      expect(entry.displayName).toBeTruthy();
      expect(entry.animationClip).toBeTruthy();
      expect(entry.animationFallback).toBeTruthy();
      expect(entry.category).toBeTruthy();
    }
  });

  it('references animation clips that exist in the catalog', () => {
    let valid = 0;
    let total = 0;
    for (const entry of Object.values(ACTION_ANIMATION_MAP)) {
      total++;
      if (ANIMATION_CATALOG[entry.animationClip] || ANIMATION_CATALOG[entry.animationFallback]) {
        valid++;
      }
    }
    // At least 90% of entries should have at least one valid clip
    expect(valid / total).toBeGreaterThanOrEqual(0.9);
  });
});

describe('getAnimationForAction', () => {
  it('returns the correct entry for a known action', () => {
    const entry = getAnimationForAction('fish');
    expect(entry.actionName).toBe('fish');
    expect(entry.animationClip).toBe('Farm_Harvest');
    expect(entry.category).toBe('physical');
  });

  it('normalizes action names with spaces and hyphens', () => {
    const entry = getAnimationForAction('chop-tree');
    expect(entry.actionName).toBe('chop_tree');
    expect(entry.animationClip).toBe('TreeChopping_Loop');
  });

  it('returns a fallback entry for unknown actions', () => {
    const entry = getAnimationForAction('unknown_action_xyz');
    expect(entry.animationClip).toBe('Interact');
    expect(entry.animationFallback).toBe('Idle');
    expect(entry.category).toBe('physical');
  });

  it('handles case normalization', () => {
    const entry = getAnimationForAction('FISH');
    expect(entry.actionName).toBe('fish');
  });
});

describe('resolveAnimationClip', () => {
  it('returns the primary clip when it exists in the catalog', () => {
    const clip = resolveAnimationClip('chop_tree');
    expect(clip).toBe('TreeChopping_Loop');
    expect(ANIMATION_CATALOG[clip]).toBeDefined();
  });

  it('returns the fallback clip when primary is missing', () => {
    // 'Interact' exists in catalog — this validates the fallback chain
    const clip = resolveAnimationClip('unknown_action');
    expect(ANIMATION_CATALOG[clip]).toBeDefined();
  });

  it('returns Idle as last resort', () => {
    // Even unknown actions should resolve to something
    const clip = resolveAnimationClip('totally_fake_action');
    expect(clip).toBeTruthy();
  });
});

describe('getActionAnimationsByCategory', () => {
  it('groups actions into categories', () => {
    const groups = getActionAnimationsByCategory();
    expect(groups.size).toBeGreaterThan(0);
    expect(groups.has('physical')).toBe(true);
    expect(groups.has('conversational')).toBe(true);
    expect(groups.has('inventory')).toBe(true);
    expect(groups.has('language')).toBe(true);
  });

  it('has physical actions containing resource-gathering actions', () => {
    const groups = getActionAnimationsByCategory();
    const physical = groups.get('physical') || [];
    const names = physical.map(e => e.actionName);
    expect(names).toContain('fish');
    expect(names).toContain('chop_tree');
    expect(names).toContain('mine_rock');
  });

  it('has language actions containing listen_and_repeat', () => {
    const groups = getActionAnimationsByCategory();
    const language = groups.get('language') || [];
    const names = language.map(e => e.actionName);
    expect(names).toContain('listen_and_repeat');
    expect(names).toContain('point_and_name');
  });
});

describe('isValidAnimationClip', () => {
  it('returns true for catalog animations', () => {
    expect(isValidAnimationClip('TreeChopping_Loop')).toBe(true);
    expect(isValidAnimationClip('Farm_Harvest')).toBe(true);
    expect(isValidAnimationClip('Idle')).toBe(true);
    expect(isValidAnimationClip('Consume')).toBe(true);
  });

  it('returns false for non-existent clips', () => {
    expect(isValidAnimationClip('NonexistentAnimation')).toBe(false);
    expect(isValidAnimationClip('')).toBe(false);
  });
});
