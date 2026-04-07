import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUIImmersionLevel,
  shouldTranslateUIKey,
  getGameString,
  getBilingualDisplay,
  ImmersionTransitionController,
  getImmersionProgressData,
} from '../language/ui-localization';
import type { CEFRLevel } from '../assessment/cefr-mapping';

describe('getUIImmersionLevel', () => {
  it('returns 0% for A1 and A2 in auto mode', () => {
    expect(getUIImmersionLevel('A1')).toBe(0);
    expect(getUIImmersionLevel('A2')).toBe(0);
  });

  it('returns 10% for B1 in auto mode', () => {
    expect(getUIImmersionLevel('B1')).toBe(10);
  });

  it('returns 30% for B2 in auto mode', () => {
    expect(getUIImmersionLevel('B2')).toBe(30);
  });

  it('returns 60% for C1 in auto mode', () => {
    expect(getUIImmersionLevel('C1')).toBe(60);
  });

  it('returns 90% for C2 in auto mode', () => {
    expect(getUIImmersionLevel('C2')).toBe(90);
  });

  it('returns 0% in english_only mode regardless of CEFR level', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (const level of levels) {
      expect(getUIImmersionLevel(level, 'english_only')).toBe(0);
    }
  });

  it('returns 90% in maximum mode regardless of CEFR level', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (const level of levels) {
      expect(getUIImmersionLevel(level, 'maximum')).toBe(90);
    }
  });
});

describe('shouldTranslateUIKey', () => {
  it('returns false for all keys at A1', () => {
    expect(shouldTranslateUIKey('actions.talk', 'A1')).toBe(false);
    expect(shouldTranslateUIKey('ui.questLog', 'A1')).toBe(false);
    expect(shouldTranslateUIKey('notifications.questComplete', 'A1')).toBe(false);
  });

  it('returns false for all keys at A2', () => {
    expect(shouldTranslateUIKey('actions.talk', 'A2')).toBe(false);
    expect(shouldTranslateUIKey('ui.inventory', 'A2')).toBe(false);
  });

  it('returns true for actions and locations keys at B1', () => {
    expect(shouldTranslateUIKey('actions.talk', 'B1')).toBe(true);
    expect(shouldTranslateUIKey('actions.enter', 'B1')).toBe(true);
    expect(shouldTranslateUIKey('locations.bakery', 'B1')).toBe(true);
  });

  it('returns false for non-actions keys at B1', () => {
    expect(shouldTranslateUIKey('ui.questLog', 'B1')).toBe(false);
    expect(shouldTranslateUIKey('notifications.questComplete', 'B1')).toBe(false);
    expect(shouldTranslateUIKey('inventory.weapon', 'B1')).toBe(false);
  });

  it('returns true for actions, inventory, map, and ui keys at B2', () => {
    expect(shouldTranslateUIKey('actions.talk', 'B2')).toBe(true);
    expect(shouldTranslateUIKey('ui.questLog', 'B2')).toBe(true);
    expect(shouldTranslateUIKey('map.you', 'B2')).toBe(true);
    expect(shouldTranslateUIKey('inventory.weapon', 'B2')).toBe(true);
  });

  it('returns false for quest and notification keys at B2', () => {
    expect(shouldTranslateUIKey('quests.mainQuest', 'B2')).toBe(false);
    expect(shouldTranslateUIKey('notifications.questComplete', 'B2')).toBe(false);
  });

  it('returns true for quest and notification keys at C1', () => {
    expect(shouldTranslateUIKey('quests.mainQuest', 'C1')).toBe(true);
    expect(shouldTranslateUIKey('notifications.questComplete', 'C1')).toBe(true);
    expect(shouldTranslateUIKey('emptyStates.noItems', 'C1')).toBe(true);
  });

  it('returns true for nearly everything at C2', () => {
    expect(shouldTranslateUIKey('actions.talk', 'C2')).toBe(true);
    expect(shouldTranslateUIKey('ui.questLog', 'C2')).toBe(true);
    expect(shouldTranslateUIKey('notifications.questComplete', 'C2')).toBe(true);
    expect(shouldTranslateUIKey('photo.caption', 'C2')).toBe(true);
    expect(shouldTranslateUIKey('misc.tooltip', 'C2')).toBe(true);
  });

  it('never translates system namespace regardless of level', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (const level of levels) {
      expect(shouldTranslateUIKey('system.error', level)).toBe(false);
      expect(shouldTranslateUIKey('system.saveSuccessful', level)).toBe(false);
    }
  });

  it('never translates system namespace even in maximum mode', () => {
    expect(shouldTranslateUIKey('system.error', 'A1', 'maximum')).toBe(false);
    expect(shouldTranslateUIKey('system.saveSuccessful', 'B2', 'maximum')).toBe(false);
  });

  it('translates everything except system in maximum mode', () => {
    expect(shouldTranslateUIKey('actions.talk', 'A1', 'maximum')).toBe(true);
    expect(shouldTranslateUIKey('ui.questLog', 'A1', 'maximum')).toBe(true);
    expect(shouldTranslateUIKey('notifications.questComplete', 'A1', 'maximum')).toBe(true);
  });

  it('translates nothing in english_only mode', () => {
    expect(shouldTranslateUIKey('actions.talk', 'B2', 'english_only')).toBe(false);
    expect(shouldTranslateUIKey('ui.questLog', 'B2', 'english_only')).toBe(false);
  });

  it('returns false for unknown namespace', () => {
    expect(shouldTranslateUIKey('unknown.key', 'C2')).toBe(false);
  });
});

describe('getGameString', () => {
  it('returns English when CEFR level is A1', () => {
    expect(getGameString('Talk', 'Parler', 'actions.talk', 'A1')).toBe('Talk');
  });

  it('returns translated text at B1 for actions', () => {
    expect(getGameString('Talk', 'Parler', 'actions.talk', 'B1')).toBe('Parler');
  });

  it('returns English when no translation available', () => {
    expect(getGameString('Talk', undefined, 'actions.talk', 'B2')).toBe('Talk');
  });

  it('returns English for non-actions at B1', () => {
    expect(getGameString('Inventory', 'Inventaire', 'inventory.title', 'B1')).toBe('Inventory');
  });

  it('returns translated for inventory at B2', () => {
    expect(getGameString('Inventory', 'Inventaire', 'inventory.title', 'B2')).toBe('Inventaire');
  });
});

describe('getBilingualDisplay', () => {
  it('shows English primary at A1', () => {
    const result = getBilingualDisplay('Bakery', 'Boulangerie', 'A1');
    expect(result.primary).toBe('Bakery');
    expect(result.subtitle).toBe('Boulangerie');
    expect(result.showTooltip).toBe(false);
  });

  it('shows target language with tooltip at B1', () => {
    const result = getBilingualDisplay('Bakery', 'Boulangerie', 'B1');
    expect(result.primary).toBe('Boulangerie');
    expect(result.subtitle).toBe('Bakery');
    expect(result.showTooltip).toBe(true);
  });

  it('shows target language with hover-to-reveal at B2', () => {
    const result = getBilingualDisplay('Bakery', 'Boulangerie', 'B2');
    expect(result.primary).toBe('Boulangerie');
    expect(result.showTooltip).toBe(true);
  });

  it('shows target language with hover-to-reveal at C1 and C2', () => {
    for (const level of ['C1', 'C2'] as CEFRLevel[]) {
      const result = getBilingualDisplay('Bakery', 'Boulangerie', level);
      expect(result.primary).toBe('Boulangerie');
      expect(result.showTooltip).toBe(true);
    }
  });

  it('shows English when no translation available', () => {
    const result = getBilingualDisplay('Bakery', undefined, 'B2');
    expect(result.primary).toBe('Bakery');
    expect(result.showTooltip).toBe(false);
  });
});

describe('ImmersionTransitionController', () => {
  let controller: ImmersionTransitionController;

  beforeEach(() => {
    controller = new ImmersionTransitionController();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at A1 with no transition', () => {
    expect(controller.currentLevel).toBe('A1');
    expect(controller.isTransitioning).toBe(false);
  });

  it('begins transition on level increase', () => {
    controller.onLevelChanged('B1');
    expect(controller.currentLevel).toBe('B1');
    expect(controller.isTransitioning).toBe(true);
  });

  it('does not transition when immersion stays the same (A1 to A2)', () => {
    controller.onLevelChanged('A2');
    expect(controller.isTransitioning).toBe(false);
  });

  it('does not transition when setting the same level', () => {
    controller.onLevelChanged('A1');
    expect(controller.isTransitioning).toBe(false);
  });

  it('transition completes after duration', () => {
    controller.setTransitionDuration(1000);
    controller.onLevelChanged('B1');
    expect(controller.isTransitioning).toBe(true);

    vi.advanceTimersByTime(1001);
    expect(controller.isTransitioning).toBe(false);
  });

  it('progressive rollout lerps priorities during transition', () => {
    controller.setTransitionDuration(1000);
    // A1 max priority = 0, B2 max priority = 3
    controller.onLevelChanged('A2'); // no transition (same immersion)
    controller.onLevelChanged('B2');

    // At start of transition, effective priority should be near A2 level (0)
    expect(controller.getEffectiveMaxPriority()).toBe(0);

    // At 50%, should be ~1.5 -> floor to 1
    vi.advanceTimersByTime(500);
    expect(controller.getEffectiveMaxPriority()).toBe(1);

    // At 100%, should be 3
    vi.advanceTimersByTime(501);
    expect(controller.getEffectiveMaxPriority()).toBe(3);
  });

  it('shouldTranslateWithTransition respects transition progress', () => {
    controller.setTransitionDuration(1000);
    controller.onLevelChanged('B1');

    // At start of transition from A1 (priority 0) to B1 (priority 1):
    // effective max is 0, so actions should not translate yet
    expect(controller.shouldTranslateWithTransition('actions.talk')).toBe(false);

    // After full transition, actions should translate
    vi.advanceTimersByTime(1001);
    expect(controller.shouldTranslateWithTransition('actions.talk')).toBe(true);
  });

  it('respects english_only mode during transition', () => {
    controller.setTransitionDuration(1000);
    controller.onLevelChanged('B2');
    vi.advanceTimersByTime(1001);
    expect(controller.shouldTranslateWithTransition('actions.talk', 'english_only')).toBe(false);
  });

  it('respects maximum mode during transition', () => {
    controller.setTransitionDuration(1000);
    // Even at A1 with maximum mode, everything except system translates
    expect(controller.shouldTranslateWithTransition('actions.talk', 'maximum')).toBe(true);
    expect(controller.shouldTranslateWithTransition('system.error', 'maximum')).toBe(false);
  });

  it('getEffectiveMaxPriority returns 0 for english_only', () => {
    controller.onLevelChanged('C2');
    expect(controller.getEffectiveMaxPriority('english_only')).toBe(0);
  });

  it('getEffectiveMaxPriority returns Infinity for maximum', () => {
    expect(controller.getEffectiveMaxPriority('maximum')).toBe(Infinity);
  });
});

describe('immersion level progression', () => {
  it('immersion increases monotonically with CEFR level', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let prev = -1;
    for (const level of levels) {
      const immersion = getUIImmersionLevel(level);
      expect(immersion).toBeGreaterThanOrEqual(prev);
      prev = immersion;
    }
  });

  it('namespace coverage increases with CEFR level', () => {
    const namespaces = ['actions', 'locations', 'map', 'inventory', 'ui', 'quests', 'notifications', 'emptyStates', 'photo', 'misc'];
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    let prevCount = 0;
    for (const level of levels) {
      const count = namespaces.filter(ns => shouldTranslateUIKey(`${ns}.test`, level)).length;
      expect(count).toBeGreaterThanOrEqual(prevCount);
      prevCount = count;
    }
  });

  it('A1 and A2 translate nothing', () => {
    const namespaces = ['actions', 'locations', 'map', 'inventory', 'ui', 'quests', 'notifications'];
    for (const ns of namespaces) {
      expect(shouldTranslateUIKey(`${ns}.test`, 'A1')).toBe(false);
      expect(shouldTranslateUIKey(`${ns}.test`, 'A2')).toBe(false);
    }
  });

  it('B1 only translates actions and locations (10% immersion)', () => {
    expect(shouldTranslateUIKey('actions.talk', 'B1')).toBe(true);
    expect(shouldTranslateUIKey('locations.bakery', 'B1')).toBe(true);
    expect(shouldTranslateUIKey('map.label', 'B1')).toBe(false);
    expect(shouldTranslateUIKey('inventory.item', 'B1')).toBe(false);
  });

  it('B2 adds inventory, map, and ui (30% immersion)', () => {
    expect(shouldTranslateUIKey('actions.talk', 'B2')).toBe(true);
    expect(shouldTranslateUIKey('map.label', 'B2')).toBe(true);
    expect(shouldTranslateUIKey('inventory.item', 'B2')).toBe(true);
    expect(shouldTranslateUIKey('ui.menu', 'B2')).toBe(true);
    expect(shouldTranslateUIKey('quests.title', 'B2')).toBe(false);
  });

  it('C1 adds quests, notifications, emptyStates (60% immersion)', () => {
    expect(shouldTranslateUIKey('quests.title', 'C1')).toBe(true);
    expect(shouldTranslateUIKey('notifications.alert', 'C1')).toBe(true);
    expect(shouldTranslateUIKey('emptyStates.noItems', 'C1')).toBe(true);
    expect(shouldTranslateUIKey('photo.caption', 'C1')).toBe(false);
  });

  it('C2 translates nearly everything (90% immersion)', () => {
    expect(shouldTranslateUIKey('photo.caption', 'C2')).toBe(true);
    expect(shouldTranslateUIKey('misc.tooltip', 'C2')).toBe(true);
    expect(shouldTranslateUIKey('system.error', 'C2')).toBe(false);
  });
});

describe('getImmersionProgressData', () => {
  it('returns correct data for A1 auto mode', () => {
    const data = getImmersionProgressData('A1');
    expect(data.cefrLevel).toBe('A1');
    expect(data.cefrDescription).toBe('Beginner');
    expect(data.immersionPercent).toBe(0);
    expect(data.activeCount).toBe(0);
    expect(data.totalCount).toBe(10); // All namespaces except 'system'
    expect(data.isTransitioning).toBe(false);
    // All namespaces should be inactive at A1
    for (const ns of data.namespaces) {
      expect(ns.active).toBe(false);
    }
  });

  it('returns correct data for B1 auto mode', () => {
    const data = getImmersionProgressData('B1');
    expect(data.cefrLevel).toBe('B1');
    expect(data.cefrDescription).toBe('Intermediate');
    expect(data.immersionPercent).toBe(10);
    expect(data.activeCount).toBe(2); // actions + locations
    const activeNs = data.namespaces.filter(n => n.active).map(n => n.namespace);
    expect(activeNs).toContain('actions');
    expect(activeNs).toContain('locations');
  });

  it('returns correct data for B2 auto mode', () => {
    const data = getImmersionProgressData('B2');
    expect(data.immersionPercent).toBe(30);
    expect(data.activeCount).toBe(5); // actions, locations, map, inventory, ui
    const activeNs = data.namespaces.filter(n => n.active).map(n => n.namespace);
    expect(activeNs).toContain('map');
    expect(activeNs).toContain('inventory');
    expect(activeNs).toContain('ui');
  });

  it('returns correct data for C1 auto mode', () => {
    const data = getImmersionProgressData('C1');
    expect(data.immersionPercent).toBe(60);
    expect(data.activeCount).toBe(8); // +quests, notifications, emptyStates
    const activeNs = data.namespaces.filter(n => n.active).map(n => n.namespace);
    expect(activeNs).toContain('quests');
    expect(activeNs).toContain('notifications');
    expect(activeNs).toContain('emptyStates');
  });

  it('returns correct data for C2 auto mode', () => {
    const data = getImmersionProgressData('C2');
    expect(data.immersionPercent).toBe(90);
    expect(data.activeCount).toBe(10); // everything except system
    for (const ns of data.namespaces) {
      expect(ns.active).toBe(true);
    }
  });

  it('returns 0 active for english_only mode', () => {
    const data = getImmersionProgressData('C2', 'english_only');
    expect(data.immersionPercent).toBe(0);
    expect(data.activeCount).toBe(0);
    for (const ns of data.namespaces) {
      expect(ns.active).toBe(false);
    }
  });

  it('returns all active for maximum mode at any level', () => {
    const data = getImmersionProgressData('A1', 'maximum');
    expect(data.immersionPercent).toBe(90);
    expect(data.activeCount).toBe(10);
    for (const ns of data.namespaces) {
      expect(ns.active).toBe(true);
    }
  });

  it('namespaces are sorted by priority (lowest first)', () => {
    const data = getImmersionProgressData('C2');
    for (let i = 1; i < data.namespaces.length; i++) {
      expect(data.namespaces[i].priority).toBeGreaterThanOrEqual(data.namespaces[i - 1].priority);
    }
  });

  it('excludes system namespace from list', () => {
    const data = getImmersionProgressData('C2');
    const nsNames = data.namespaces.map(n => n.namespace);
    expect(nsNames).not.toContain('system');
  });

  it('all namespaces have human-readable labels', () => {
    const data = getImmersionProgressData('A1');
    for (const ns of data.namespaces) {
      expect(ns.label).toBeTruthy();
      expect(ns.label).not.toBe(ns.namespace); // Label should differ from raw key
    }
  });

  it('passes transitioning flag through', () => {
    const data = getImmersionProgressData('B1', 'auto', true);
    expect(data.isTransitioning).toBe(true);
  });

  it('active count increases monotonically with CEFR level', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let prevCount = 0;
    for (const level of levels) {
      const data = getImmersionProgressData(level);
      expect(data.activeCount).toBeGreaterThanOrEqual(prevCount);
      prevCount = data.activeCount;
    }
  });

  it('CEFR descriptions are correct for all levels', () => {
    const expected: Record<string, string> = {
      A1: 'Beginner',
      A2: 'Elementary',
      B1: 'Intermediate',
      B2: 'Upper-Intermediate',
      C1: 'Advanced',
      C2: 'Mastery',
    };
    for (const [level, desc] of Object.entries(expected)) {
      const data = getImmersionProgressData(level as CEFRLevel);
      expect(data.cefrDescription).toBe(desc);
    }
  });
});
