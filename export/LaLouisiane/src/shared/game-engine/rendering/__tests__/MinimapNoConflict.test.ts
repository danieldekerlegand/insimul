import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Ensures the duplicate BabylonMinimap is not instantiated alongside
 * BabylonGUIManager's built-in minimap, which caused a GUI control name
 * collision ("minimapContainer") that broke game loading.
 */
describe('Minimap no-conflict', () => {
  const gameFilePath = path.resolve(__dirname, '..', 'BabylonGame.ts');
  const gameSource = fs.readFileSync(gameFilePath, 'utf-8');

  it('BabylonGame does not import BabylonMinimap', () => {
    expect(gameSource).not.toMatch(/import.*BabylonMinimap/);
  });

  it('BabylonGame does not instantiate BabylonMinimap', () => {
    expect(gameSource).not.toMatch(/new\s+BabylonMinimap/);
  });

  it('BabylonGame does not reference this.minimap for marker operations', () => {
    // The GUIManager's updateMinimap handles all marker rendering
    expect(gameSource).not.toMatch(/this\.minimap\?\./);
    expect(gameSource).not.toMatch(/this\.minimap\./);
  });

  it('BabylonMinimap control name does not conflict with GUIManager', () => {
    // BabylonMinimap uses "minimapContainer" as a GUI control name,
    // which conflicts with the GUIManager's own "minimapContainer".
    // This test documents the conflict so it isn't reintroduced.
    const minimapSource = fs.readFileSync(
      path.resolve(__dirname, '..', 'BabylonMinimap.ts'),
      'utf-8'
    );
    const guiManagerSource = fs.readFileSync(
      path.resolve(__dirname, '..', 'BabylonGUIManager.ts'),
      'utf-8'
    );

    // Both files define a control named "minimapContainer"
    const minimapNames = [...minimapSource.matchAll(/['"]minimapContainer['"]/g)];
    const guiManagerNames = [...guiManagerSource.matchAll(/['"]minimapContainer['"]/g)];

    // If both still define this name, ensure BabylonGame doesn't use BabylonMinimap
    if (minimapNames.length > 0 && guiManagerNames.length > 0) {
      expect(gameSource).not.toMatch(/new\s+BabylonMinimap/);
    }
  });
});
