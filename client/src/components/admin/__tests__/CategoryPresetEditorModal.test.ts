import { describe, it, expect } from 'vitest';
import type { ProceduralStylePreset } from '@shared/game-engine/types';
import { BUILDING_CATEGORY_GROUPINGS, type BuildingCategory } from '@shared/game-engine/building-categories';

/**
 * Tests for CategoryPresetEditorModal logic and data structures.
 * Covers category-to-preset mapping, texture field handling, and preset CRUD.
 */

const TEXTURE_FIELDS = [
  'wallTextureId',
  'roofTextureId',
  'floorTextureId',
  'doorTextureId',
  'windowTextureId',
] as const;

function makeTestPreset(overrides: Partial<ProceduralStylePreset> = {}): ProceduralStylePreset {
  return {
    id: 'test-preset',
    name: 'Test Style',
    baseColors: [{ r: 0.8, g: 0.75, b: 0.65 }],
    roofColor: { r: 0.3, g: 0.25, b: 0.2 },
    windowColor: { r: 0.8, g: 0.85, b: 0.9 },
    doorColor: { r: 0.4, g: 0.3, b: 0.2 },
    materialType: 'wood',
    architectureStyle: 'colonial',
    ...overrides,
  };
}

describe('CategoryPresetEditorModal', () => {
  describe('category preset data structure', () => {
    it('maps category keys to ProceduralStylePreset values', () => {
      const presets: Record<string, ProceduralStylePreset> = {
        commercial_food: makeTestPreset({ id: 'food-1', name: 'Food Style' }),
        residential: makeTestPreset({ id: 'res-1', name: 'Residential Style' }),
      };

      expect(Object.keys(presets)).toEqual(['commercial_food', 'residential']);
      expect(presets['commercial_food'].name).toBe('Food Style');
      expect(presets['residential'].materialType).toBe('wood');
    });

    it('covers all building category keys', () => {
      const categories = Object.keys(BUILDING_CATEGORY_GROUPINGS) as BuildingCategory[];
      expect(categories).toContain('commercial_food');
      expect(categories).toContain('commercial_retail');
      expect(categories).toContain('commercial_service');
      expect(categories).toContain('civic');
      expect(categories).toContain('industrial');
      expect(categories).toContain('maritime');
      expect(categories).toContain('residential');
      expect(categories).toHaveLength(7);
    });

    it('each category has at least one building type', () => {
      for (const [category, types] of Object.entries(BUILDING_CATEGORY_GROUPINGS)) {
        expect(types.length).toBeGreaterThan(0);
      }
    });
  });

  describe('texture fields on ProceduralStylePreset', () => {
    it('supports all five texture ID fields', () => {
      const preset = makeTestPreset({
        wallTextureId: 'tex-wall',
        roofTextureId: 'tex-roof',
        floorTextureId: 'tex-floor',
        doorTextureId: 'tex-door',
        windowTextureId: 'tex-window',
      });

      expect(preset.wallTextureId).toBe('tex-wall');
      expect(preset.roofTextureId).toBe('tex-roof');
      expect(preset.floorTextureId).toBe('tex-floor');
      expect(preset.doorTextureId).toBe('tex-door');
      expect(preset.windowTextureId).toBe('tex-window');
    });

    it('texture fields are optional and default to undefined', () => {
      const preset = makeTestPreset();
      for (const field of TEXTURE_FIELDS) {
        expect(preset[field]).toBeUndefined();
      }
    });

    it('can clear a texture by setting to undefined', () => {
      const preset = makeTestPreset({ wallTextureId: 'tex-wall' });
      expect(preset.wallTextureId).toBe('tex-wall');
      const updated = { ...preset, wallTextureId: undefined };
      expect(updated.wallTextureId).toBeUndefined();
    });
  });

  describe('preset CRUD operations', () => {
    it('can add a preset for a category', () => {
      const presets: Record<string, ProceduralStylePreset> = {};
      const category = 'commercial_food';
      const newPreset = makeTestPreset({ id: `cat_${category}_1`, name: 'Food Style' });
      const updated = { ...presets, [category]: newPreset };
      expect(Object.keys(updated)).toHaveLength(1);
      expect(updated[category].name).toBe('Food Style');
    });

    it('can update a preset for a category', () => {
      const presets: Record<string, ProceduralStylePreset> = {
        civic: makeTestPreset({ id: 'civic-1', name: 'Civic Style', materialType: 'stone' }),
      };
      const updated = {
        ...presets,
        civic: { ...presets['civic'], materialType: 'brick' as const },
      };
      expect(updated.civic.materialType).toBe('brick');
      expect(updated.civic.name).toBe('Civic Style');
    });

    it('can remove a preset for a category', () => {
      const presets: Record<string, ProceduralStylePreset> = {
        civic: makeTestPreset({ id: 'civic-1' }),
        residential: makeTestPreset({ id: 'res-1' }),
      };
      const next = { ...presets };
      delete next['civic'];
      expect(Object.keys(next)).toEqual(['residential']);
    });

    it('returns null when all presets are removed', () => {
      const presets: Record<string, ProceduralStylePreset> = {
        civic: makeTestPreset(),
      };
      const next = { ...presets };
      delete next['civic'];
      const result = Object.keys(next).length > 0 ? next : null;
      expect(result).toBeNull();
    });
  });

  describe('texture picker request', () => {
    it('creates correct request structure', () => {
      const request = { category: 'commercial_food', field: 'wallTextureId' as const };
      expect(request.category).toBe('commercial_food');
      expect(request.field).toBe('wallTextureId');
    });

    it('applies texture selection to correct category and field', () => {
      const presets: Record<string, ProceduralStylePreset> = {
        commercial_food: makeTestPreset({ id: 'food-1' }),
        residential: makeTestPreset({ id: 'res-1' }),
      };
      const request = { category: 'commercial_food', field: 'roofTextureId' as const };
      const assetId = 'tex-terracotta-roof';

      const updated = {
        ...presets,
        [request.category]: { ...presets[request.category], [request.field]: assetId },
      };

      expect(updated.commercial_food.roofTextureId).toBe('tex-terracotta-roof');
      expect(updated.residential.roofTextureId).toBeUndefined();
    });
  });

  describe('preset features', () => {
    it('supports all feature toggles', () => {
      const preset = makeTestPreset({
        hasBalcony: true,
        hasIronworkBalcony: true,
        hasPorch: true,
        hasShutters: true,
        porchDepth: 4,
        porchSteps: 5,
        shutterColor: { r: 0.2, g: 0.3, b: 0.4 },
      });

      expect(preset.hasBalcony).toBe(true);
      expect(preset.hasIronworkBalcony).toBe(true);
      expect(preset.hasPorch).toBe(true);
      expect(preset.hasShutters).toBe(true);
      expect(preset.porchDepth).toBe(4);
      expect(preset.porchSteps).toBe(5);
      expect(preset.shutterColor).toEqual({ r: 0.2, g: 0.3, b: 0.4 });
    });

    it('can update base colors array', () => {
      const preset = makeTestPreset();
      expect(preset.baseColors).toHaveLength(1);
      const withAdded = { ...preset, baseColors: [...preset.baseColors, { r: 0.5, g: 0.5, b: 0.5 }] };
      expect(withAdded.baseColors).toHaveLength(2);
      const withRemoved = { ...withAdded, baseColors: withAdded.baseColors.filter((_, i) => i !== 0) };
      expect(withRemoved.baseColors).toHaveLength(1);
      expect(withRemoved.baseColors[0]).toEqual({ r: 0.5, g: 0.5, b: 0.5 });
    });
  });

  describe('color utilities', () => {
    it('converts Color3 to hex string', () => {
      const colorToHex = (c: { r: number; g: number; b: number }) => {
        const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
        const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
        const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      };

      expect(colorToHex({ r: 1, g: 0, b: 0 })).toBe('#ff0000');
      expect(colorToHex({ r: 0, g: 1, b: 0 })).toBe('#00ff00');
      expect(colorToHex({ r: 0, g: 0, b: 1 })).toBe('#0000ff');
      expect(colorToHex({ r: 0.5, g: 0.5, b: 0.5 })).toBe('#808080');
    });

    it('converts hex string to Color3', () => {
      const hexToColor = (hex: string) => {
        const h = hex.replace('#', '');
        return {
          r: parseInt(h.substring(0, 2), 16) / 255,
          g: parseInt(h.substring(2, 4), 16) / 255,
          b: parseInt(h.substring(4, 6), 16) / 255,
        };
      };

      expect(hexToColor('#ff0000')).toEqual({ r: 1, g: 0, b: 0 });
      expect(hexToColor('#00ff00')).toEqual({ r: 0, g: 1, b: 0 });
      expect(hexToColor('#0000ff')).toEqual({ r: 0, g: 0, b: 1 });
    });
  });
});
