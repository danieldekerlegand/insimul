/**
 * Tests for menu and UI configuration IR types
 *
 * Verifies that MenuConfigIR, MenuButtonIR, and SettingsCategoryIR
 * are correctly structured and that the UIIR includes menuConfig.
 */

import { describe, it, expect } from 'vitest';
import type {
  UIIR,
  MenuConfigIR,
  MenuButtonIR,
  SettingsCategoryIR,
} from '../game-engine/ir-types';

/**
 * Build a complete MenuConfigIR matching the ir-generator output
 * for a default action_rpg genre with inventory enabled.
 */
function buildTestMenuConfig(worldName = 'Test World'): MenuConfigIR {
  return {
    mainMenu: {
      title: worldName,
      backgroundImage: 'ui/backgrounds/fantasy_landscape.jpg',
      buttons: [
        { label: 'New Game', action: 'new_game' },
        { label: 'Continue', action: 'continue' },
        { label: 'Settings', action: 'open_settings' },
        { label: 'Quit', action: 'quit' },
      ],
    },
    pauseMenu: {
      buttons: [
        { label: 'Resume', action: 'resume' },
        { label: 'Settings', action: 'open_settings' },
        { label: 'Save', action: 'save_game' },
        { label: 'Main Menu', action: 'main_menu' },
        { label: 'Quit', action: 'quit' },
      ],
    },
    settingsMenu: {
      categories: [
        {
          name: 'Audio',
          settings: [
            { key: 'master_volume', label: 'Master Volume', type: 'slider', default: 80 },
            { key: 'music_volume', label: 'Music Volume', type: 'slider', default: 70 },
            { key: 'sfx_volume', label: 'SFX Volume', type: 'slider', default: 80 },
            { key: 'mute', label: 'Mute All', type: 'toggle', default: false },
          ],
        },
        {
          name: 'Graphics',
          settings: [
            { key: 'quality', label: 'Quality', type: 'dropdown', default: 'medium', options: ['low', 'medium', 'high', 'ultra'] },
            { key: 'resolution', label: 'Resolution', type: 'dropdown', default: '1920x1080', options: ['1280x720', '1920x1080', '2560x1440', '3840x2160'] },
            { key: 'fullscreen', label: 'Fullscreen', type: 'toggle', default: true },
          ],
        },
        {
          name: 'Controls',
          settings: [
            { key: 'mouse_sensitivity', label: 'Mouse Sensitivity', type: 'slider', default: 50 },
            { key: 'invert_y', label: 'Invert Y Axis', type: 'toggle', default: false },
          ],
        },
        {
          name: 'Language',
          settings: [
            { key: 'target_language', label: 'Target Language', type: 'dropdown', default: 'auto', options: ['auto'] },
            { key: 'subtitles', label: 'Show Subtitles', type: 'toggle', default: true },
          ],
        },
      ],
    },
    inventoryScreen: {
      slots: 40,
      categories: ['All', 'Equipment', 'Consumables', 'Materials', 'Quest Items'],
    },
    mapScreen: {
      enabled: true,
      zoomLevels: [0.5, 1, 2, 4],
    },
  };
}

function buildTestUIIR(menuConfig?: MenuConfigIR): UIIR {
  return {
    showMinimap: true,
    showHealthBar: true,
    showStaminaBar: true,
    showAmmoCounter: false,
    showCompass: true,
    genreLayout: 'action_rpg',
    menuConfig: menuConfig ?? buildTestMenuConfig(),
  };
}

describe('MenuButtonIR', () => {
  it('has required label and action fields', () => {
    const button: MenuButtonIR = { label: 'Play', action: 'start_game' };
    expect(button.label).toBe('Play');
    expect(button.action).toBe('start_game');
  });

  it('supports optional icon field', () => {
    const button: MenuButtonIR = { label: 'Settings', action: 'open_settings', icon: 'gear' };
    expect(button.icon).toBe('gear');
  });
});

describe('SettingsCategoryIR', () => {
  it('contains name and settings array', () => {
    const category: SettingsCategoryIR = {
      name: 'Audio',
      settings: [
        { key: 'volume', label: 'Volume', type: 'slider', default: 80 },
      ],
    };
    expect(category.name).toBe('Audio');
    expect(category.settings).toHaveLength(1);
  });

  it('supports all setting types: slider, toggle, dropdown', () => {
    const category: SettingsCategoryIR = {
      name: 'Mixed',
      settings: [
        { key: 'brightness', label: 'Brightness', type: 'slider', default: 50 },
        { key: 'vsync', label: 'VSync', type: 'toggle', default: true },
        { key: 'quality', label: 'Quality', type: 'dropdown', default: 'high', options: ['low', 'medium', 'high'] },
      ],
    };
    expect(category.settings[0].type).toBe('slider');
    expect(category.settings[1].type).toBe('toggle');
    expect(category.settings[2].type).toBe('dropdown');
    expect(category.settings[2].options).toEqual(['low', 'medium', 'high']);
  });
});

describe('MenuConfigIR', () => {
  const config = buildTestMenuConfig('My World');

  it('uses world name as main menu title', () => {
    expect(config.mainMenu.title).toBe('My World');
  });

  it('has genre-appropriate background image', () => {
    expect(config.mainMenu.backgroundImage).toBeDefined();
    expect(config.mainMenu.backgroundImage).toContain('ui/backgrounds/');
  });

  it('main menu has standard buttons', () => {
    const actions = config.mainMenu.buttons.map(b => b.action);
    expect(actions).toContain('new_game');
    expect(actions).toContain('continue');
    expect(actions).toContain('open_settings');
    expect(actions).toContain('quit');
  });

  it('pause menu has standard buttons', () => {
    const actions = config.pauseMenu.buttons.map(b => b.action);
    expect(actions).toContain('resume');
    expect(actions).toContain('open_settings');
    expect(actions).toContain('save_game');
    expect(actions).toContain('main_menu');
    expect(actions).toContain('quit');
  });

  it('settings menu has Audio, Graphics, Controls, Language categories', () => {
    const names = config.settingsMenu.categories.map(c => c.name);
    expect(names).toEqual(['Audio', 'Graphics', 'Controls', 'Language']);
  });

  it('Audio category has volume and mute settings', () => {
    const audio = config.settingsMenu.categories.find(c => c.name === 'Audio')!;
    const keys = audio.settings.map(s => s.key);
    expect(keys).toContain('master_volume');
    expect(keys).toContain('mute');
  });

  it('Graphics category has quality, resolution, fullscreen', () => {
    const gfx = config.settingsMenu.categories.find(c => c.name === 'Graphics')!;
    const keys = gfx.settings.map(s => s.key);
    expect(keys).toContain('quality');
    expect(keys).toContain('resolution');
    expect(keys).toContain('fullscreen');
  });

  it('Controls category has sensitivity and invert-y', () => {
    const controls = config.settingsMenu.categories.find(c => c.name === 'Controls')!;
    const keys = controls.settings.map(s => s.key);
    expect(keys).toContain('mouse_sensitivity');
    expect(keys).toContain('invert_y');
  });

  it('Language category has target language and subtitles', () => {
    const lang = config.settingsMenu.categories.find(c => c.name === 'Language')!;
    const keys = lang.settings.map(s => s.key);
    expect(keys).toContain('target_language');
    expect(keys).toContain('subtitles');
  });

  it('inventory screen has slots and categories', () => {
    expect(config.inventoryScreen.slots).toBe(40);
    expect(config.inventoryScreen.categories).toContain('All');
    expect(config.inventoryScreen.categories.length).toBeGreaterThan(1);
  });

  it('map screen has enabled flag and zoom levels', () => {
    expect(config.mapScreen.enabled).toBe(true);
    expect(config.mapScreen.zoomLevels).toEqual([0.5, 1, 2, 4]);
  });
});

describe('UIIR with menuConfig', () => {
  it('includes menuConfig field', () => {
    const ui = buildTestUIIR();
    expect(ui.menuConfig).toBeDefined();
    expect(ui.menuConfig.mainMenu.title).toBe('Test World');
  });

  it('preserves existing HUD flags alongside menuConfig', () => {
    const ui = buildTestUIIR();
    expect(ui.showMinimap).toBe(true);
    expect(ui.showHealthBar).toBe(true);
    expect(ui.genreLayout).toBe('action_rpg');
    expect(ui.menuConfig).toBeDefined();
  });
});
