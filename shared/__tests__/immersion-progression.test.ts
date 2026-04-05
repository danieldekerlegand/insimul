import { describe, it, expect } from 'vitest';
import {
  shouldTranslateUIKey,
  getUIImmersionLevel,
  getBilingualDisplay,
} from '../language/ui-localization';
import type { CEFRLevel } from '../assessment/cefr-mapping';

describe('Immersion Progression Journey', () => {
  const uiKeys = {
    actionPrompts: ['actions.talk', 'actions.enter', 'actions.examine'],
    locationLabels: ['locations.bakery', 'locations.market'],
    mapLabels: ['map.you', 'map.npc', 'map.questMarker'],
    inventoryLabels: ['inventory.weapon', 'inventory.armor', 'inventory.consumables'],
    uiLabels: ['ui.questLog', 'ui.inventory', 'ui.settings'],
    questLabels: ['quests.mainQuest', 'quests.sideQuest'],
    notifications: ['notifications.questComplete', 'notifications.levelUp'],
    systemCritical: ['system.error', 'system.saveSuccessful'],
  };

  it('A1: all UI stays in English (0% immersion)', () => {
    expect(getUIImmersionLevel('A1')).toBe(0);

    for (const keys of Object.values(uiKeys)) {
      for (const key of keys) {
        expect(shouldTranslateUIKey(key, 'A1')).toBe(false);
      }
    }
  });

  it('A2: all UI stays in English (0% immersion)', () => {
    expect(getUIImmersionLevel('A2')).toBe(0);

    for (const keys of Object.values(uiKeys)) {
      for (const key of keys) {
        expect(shouldTranslateUIKey(key, 'A2')).toBe(false);
      }
    }
  });

  it('B1: only action prompts and location names translate (10% immersion)', () => {
    expect(getUIImmersionLevel('B1')).toBe(10);

    // Action prompts and locations should translate
    for (const key of uiKeys.actionPrompts) {
      expect(shouldTranslateUIKey(key, 'B1')).toBe(true);
    }
    for (const key of uiKeys.locationLabels) {
      expect(shouldTranslateUIKey(key, 'B1')).toBe(true);
    }

    // Everything else stays English
    for (const key of uiKeys.mapLabels) {
      expect(shouldTranslateUIKey(key, 'B1')).toBe(false);
    }
    for (const key of uiKeys.uiLabels) {
      expect(shouldTranslateUIKey(key, 'B1')).toBe(false);
    }
    for (const key of uiKeys.notifications) {
      expect(shouldTranslateUIKey(key, 'B1')).toBe(false);
    }
  });

  it('B2: action prompts, inventory, map, and UI menus translate (30% immersion)', () => {
    expect(getUIImmersionLevel('B2')).toBe(30);

    // Actions, locations, map, inventory, UI should translate
    for (const key of uiKeys.actionPrompts) {
      expect(shouldTranslateUIKey(key, 'B2')).toBe(true);
    }
    for (const key of uiKeys.mapLabels) {
      expect(shouldTranslateUIKey(key, 'B2')).toBe(true);
    }
    for (const key of uiKeys.inventoryLabels) {
      expect(shouldTranslateUIKey(key, 'B2')).toBe(true);
    }
    for (const key of uiKeys.uiLabels) {
      expect(shouldTranslateUIKey(key, 'B2')).toBe(true);
    }

    // Quests and notifications stay English at B2
    for (const key of uiKeys.questLabels) {
      expect(shouldTranslateUIKey(key, 'B2')).toBe(false);
    }
    for (const key of uiKeys.notifications) {
      expect(shouldTranslateUIKey(key, 'B2')).toBe(false);
    }

    // System-critical always stays English
    for (const key of uiKeys.systemCritical) {
      expect(shouldTranslateUIKey(key, 'B2')).toBe(false);
    }
  });

  it('C1: quest descriptions and notifications translate (60% immersion)', () => {
    expect(getUIImmersionLevel('C1')).toBe(60);

    for (const key of uiKeys.questLabels) {
      expect(shouldTranslateUIKey(key, 'C1')).toBe(true);
    }
    for (const key of uiKeys.notifications) {
      expect(shouldTranslateUIKey(key, 'C1')).toBe(true);
    }
    for (const key of uiKeys.systemCritical) {
      expect(shouldTranslateUIKey(key, 'C1')).toBe(false);
    }
  });

  it('C2: nearly everything translates except system (90% immersion)', () => {
    expect(getUIImmersionLevel('C2')).toBe(90);

    // All non-system keys translate
    for (const key of uiKeys.actionPrompts) {
      expect(shouldTranslateUIKey(key, 'C2')).toBe(true);
    }
    for (const key of uiKeys.questLabels) {
      expect(shouldTranslateUIKey(key, 'C2')).toBe(true);
    }
    for (const key of uiKeys.notifications) {
      expect(shouldTranslateUIKey(key, 'C2')).toBe(true);
    }
    for (const key of uiKeys.systemCritical) {
      expect(shouldTranslateUIKey(key, 'C2')).toBe(false);
    }
  });

  it('system-critical messages NEVER translate at any level', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (const level of levels) {
      for (const key of uiKeys.systemCritical) {
        expect(shouldTranslateUIKey(key, level)).toBe(false);
        expect(shouldTranslateUIKey(key, level, 'maximum')).toBe(false);
      }
    }
  });

  it('settings override: english_only forces 0% at all levels', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (const level of levels) {
      expect(getUIImmersionLevel(level, 'english_only')).toBe(0);
      expect(shouldTranslateUIKey('actions.talk', level, 'english_only')).toBe(false);
    }
  });

  it('settings override: maximum forces 90% at all levels', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    for (const level of levels) {
      expect(getUIImmersionLevel(level, 'maximum')).toBe(90);
      // Everything except system translates
      expect(shouldTranslateUIKey('actions.talk', level, 'maximum')).toBe(true);
      expect(shouldTranslateUIKey('ui.questLog', level, 'maximum')).toBe(true);
      expect(shouldTranslateUIKey('system.error', level, 'maximum')).toBe(false);
    }
  });

  it('bilingual display adapts correctly through CEFR progression', () => {
    const building = { en: 'Bakery', target: 'Boulangerie' };

    // A1-A2: English primary
    const a1 = getBilingualDisplay(building.en, building.target, 'A1');
    expect(a1.primary).toBe('Bakery');
    expect(a1.subtitle).toBe('Boulangerie');

    // B1: Target language with English subtitle + tooltip
    const b1 = getBilingualDisplay(building.en, building.target, 'B1');
    expect(b1.primary).toBe('Boulangerie');
    expect(b1.subtitle).toBe('Bakery');
    expect(b1.showTooltip).toBe(true);

    // B2+: Target language, hover-to-reveal English
    const b2 = getBilingualDisplay(building.en, building.target, 'B2');
    expect(b2.primary).toBe('Boulangerie');
    expect(b2.showTooltip).toBe(true);

    // C2: Target language, hover-to-reveal
    const c2 = getBilingualDisplay(building.en, building.target, 'C2');
    expect(c2.primary).toBe('Boulangerie');
    expect(c2.showTooltip).toBe(true);
  });
});
