import { describe, it, expect } from 'vitest';
import { resolveAssetPath, LIGHTING_PRESET_CONFIGS } from '../BuildingModelPreview';
import type { VisualAsset } from '@shared/schema';
import {
  getTemplateForBuildingType,
  INTERIOR_LAYOUT_TEMPLATES,
  getFurnitureSetForRoom,
} from '@shared/game-engine/interior-templates';

describe('resolveAssetPath', () => {
  const mockAssets: Pick<VisualAsset, 'id' | 'filePath'>[] = [
    { id: 'tex-1', filePath: '/assets/textures/wood.png' },
    { id: 'tex-2', filePath: 'assets/textures/stone.png' },
    { id: 'tex-3', filePath: '/assets/textures/plaster.png' },
  ];

  it('returns undefined when assetId is undefined', () => {
    expect(resolveAssetPath(undefined, mockAssets as VisualAsset[])).toBeUndefined();
  });

  it('returns undefined when assets array is empty', () => {
    expect(resolveAssetPath('tex-1', [])).toBeUndefined();
  });

  it('returns undefined when assets is undefined', () => {
    expect(resolveAssetPath('tex-1', undefined)).toBeUndefined();
  });

  it('returns undefined for non-existent asset ID', () => {
    expect(resolveAssetPath('tex-missing', mockAssets as VisualAsset[])).toBeUndefined();
  });

  it('returns path as-is when it starts with /', () => {
    expect(resolveAssetPath('tex-1', mockAssets as VisualAsset[])).toBe('/assets/textures/wood.png');
  });

  it('prepends / when path does not start with /', () => {
    expect(resolveAssetPath('tex-2', mockAssets as VisualAsset[])).toBe('/assets/textures/stone.png');
  });
});

describe('LIGHTING_PRESET_CONFIGS', () => {
  it('has all five presets', () => {
    expect(Object.keys(LIGHTING_PRESET_CONFIGS)).toEqual(
      expect.arrayContaining(['bright', 'dim', 'warm', 'cool', 'candlelit']),
    );
    expect(Object.keys(LIGHTING_PRESET_CONFIGS)).toHaveLength(5);
  });

  it('bright preset has intensity 1.5', () => {
    expect(LIGHTING_PRESET_CONFIGS.bright.hemiIntensity).toBe(1.5);
  });

  it('dim preset has intensity 0.4', () => {
    expect(LIGHTING_PRESET_CONFIGS.dim.hemiIntensity).toBe(0.4);
  });

  it('warm preset has intensity 0.8 with orange tint', () => {
    const { hemiIntensity, color } = LIGHTING_PRESET_CONFIGS.warm;
    expect(hemiIntensity).toBe(0.8);
    // Orange tint: red channel highest, blue channel lowest
    expect(color[0]).toBeGreaterThan(color[2]);
  });

  it('cool preset has intensity 0.8 with blue tint', () => {
    const { hemiIntensity, color } = LIGHTING_PRESET_CONFIGS.cool;
    expect(hemiIntensity).toBe(0.8);
    // Blue tint: blue channel highest, red channel lowest
    expect(color[2]).toBeGreaterThan(color[0]);
  });

  it('candlelit preset has intensity 0.3', () => {
    expect(LIGHTING_PRESET_CONFIGS.candlelit.hemiIntensity).toBe(0.3);
  });

  it('all presets have valid color triplets', () => {
    for (const [, config] of Object.entries(LIGHTING_PRESET_CONFIGS)) {
      expect(config.color).toHaveLength(3);
      for (const c of config.color) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('Interior template furniture resolution', () => {
  it('getTemplateForBuildingType returns a template for Tavern', () => {
    const template = getTemplateForBuildingType('Tavern');
    expect(template).toBeDefined();
    expect(template!.furnitureSets.length).toBeGreaterThan(0);
  });

  it('furniture sets are returned for known room functions', () => {
    const template = getTemplateForBuildingType('Tavern');
    if (!template) return;
    const entries = getFurnitureSetForRoom(template, template.furnitureSets[0].roomFunction);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('INTERIOR_LAYOUT_TEMPLATES contains templates with furniture', () => {
    const withFurniture = INTERIOR_LAYOUT_TEMPLATES.filter(t => t.furnitureSets.length > 0);
    expect(withFurniture.length).toBeGreaterThan(0);
  });

  it('furniture set override by template ID finds a different template', () => {
    const defaultTemplate = getTemplateForBuildingType('Residence');
    const overrideTemplate = INTERIOR_LAYOUT_TEMPLATES.find(
      t => t.id !== defaultTemplate?.id && t.furnitureSets.length > 0,
    );
    expect(overrideTemplate).toBeDefined();
    expect(overrideTemplate!.id).not.toBe(defaultTemplate?.id);
  });
});
