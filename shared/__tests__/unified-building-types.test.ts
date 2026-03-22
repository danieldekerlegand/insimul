import { describe, it, expect } from 'vitest';
import type {
  UnifiedBuildingTypeConfig,
  InteriorTemplateConfig,
  InteriorLayoutTemplate,
  RoomTemplate,
  FurnitureSet,
  LightingPreset,
  ProceduralStylePreset,
} from '../game-engine/types';

describe('Unified building type config types', () => {
  it('UnifiedBuildingTypeConfig supports asset mode', () => {
    const config: UnifiedBuildingTypeConfig = {
      mode: 'asset',
      assetId: 'model-tavern-01',
      modelScaling: { x: 1, y: 1.5, z: 1 },
    };
    expect(config.mode).toBe('asset');
    expect(config.assetId).toBe('model-tavern-01');
    expect(config.modelScaling?.y).toBe(1.5);
  });

  it('UnifiedBuildingTypeConfig supports procedural mode with style overrides', () => {
    const config: UnifiedBuildingTypeConfig = {
      mode: 'procedural',
      stylePresetId: 'creole-preset',
      styleOverrides: {
        materialType: 'brick',
        hasBalcony: true,
        hasIronworkBalcony: true,
        wallTextureId: 'tex-brick-01',
      },
    };
    expect(config.mode).toBe('procedural');
    expect(config.styleOverrides?.materialType).toBe('brick');
    expect(config.styleOverrides?.wallTextureId).toBe('tex-brick-01');
  });

  it('UnifiedBuildingTypeConfig supports interior config', () => {
    const config: UnifiedBuildingTypeConfig = {
      mode: 'procedural',
      interiorConfig: {
        mode: 'procedural',
        layoutTemplateId: 'tavern',
        wallTextureId: 'tex-wood-wall',
        floorTextureId: 'tex-stone-floor',
        ceilingTextureId: 'tex-wood-ceiling',
        furnitureSet: 'tavern',
        lightingPreset: 'warm',
      },
    };
    expect(config.interiorConfig?.mode).toBe('procedural');
    expect(config.interiorConfig?.lightingPreset).toBe('warm');
  });
});

describe('InteriorTemplateConfig', () => {
  it('supports model mode', () => {
    const config: InteriorTemplateConfig = {
      mode: 'model',
      modelPath: '/assets/models/interiors/tavern.glb',
    };
    expect(config.mode).toBe('model');
    expect(config.modelPath).toContain('tavern');
  });

  it('supports procedural mode with all fields', () => {
    const config: InteriorTemplateConfig = {
      mode: 'procedural',
      layoutTemplateId: 'shop',
      wallTextureId: 'wall-tex-1',
      floorTextureId: 'floor-tex-1',
      ceilingTextureId: 'ceil-tex-1',
      furnitureSet: 'shop',
      lightingPreset: 'bright',
    };
    expect(config.layoutTemplateId).toBe('shop');
    expect(config.furnitureSet).toBe('shop');
  });

  it('accepts all valid lighting presets', () => {
    const presets: LightingPreset[] = ['bright', 'dim', 'warm', 'cool', 'candlelit'];
    expect(presets).toHaveLength(5);
  });
});

describe('InteriorLayoutTemplate and RoomTemplate', () => {
  it('can define a multi-room template', () => {
    const rooms: RoomTemplate[] = [
      { name: 'Main Hall', function: 'dining', relativeWidth: 0.6, relativeDepth: 1, furniturePreset: 'tavern_hall', doorPlacements: ['south', 'east'] },
      { name: 'Kitchen', function: 'kitchen', relativeWidth: 0.25, relativeDepth: 1, furniturePreset: 'tavern_kitchen', doorPlacements: ['west'] },
      { name: 'Storage', function: 'storage', relativeWidth: 0.15, relativeDepth: 1, furniturePreset: 'storage_basic' },
    ];

    const template: InteriorLayoutTemplate = {
      id: 'tavern',
      name: 'Tavern Layout',
      rooms,
      totalWidth: 10,
      totalDepth: 8,
      floors: 1,
    };

    expect(template.rooms).toHaveLength(3);
    expect(template.rooms[0].function).toBe('dining');
    expect(template.rooms[0].doorPlacements).toContain('south');
    expect(template.floors).toBe(1);

    // Relative widths should sum approximately to 1
    const totalRelativeWidth = template.rooms.reduce((sum, r) => sum + r.relativeWidth, 0);
    expect(totalRelativeWidth).toBeCloseTo(1, 1);
  });

  it('supports multi-floor templates', () => {
    const template: InteriorLayoutTemplate = {
      id: 'residence_large',
      name: 'Large Residence',
      rooms: [
        { name: 'Living Room', function: 'living', relativeWidth: 0.5, relativeDepth: 0.5, furniturePreset: 'residential_living' },
        { name: 'Kitchen', function: 'kitchen', relativeWidth: 0.5, relativeDepth: 0.5, furniturePreset: 'residential_kitchen' },
      ],
      totalWidth: 12,
      totalDepth: 10,
      floors: 2,
    };
    expect(template.floors).toBe(2);
  });
});

describe('FurnitureSet', () => {
  it('maps room functions to furniture item lists', () => {
    const set: FurnitureSet = {
      dining: ['table', 'chair', 'chair', 'bench', 'candelabra'],
      kitchen: ['counter', 'stove', 'barrel', 'shelf'],
      storage: ['crate', 'barrel', 'shelf'],
    };
    expect(set.dining).toContain('table');
    expect(set.kitchen).toContain('stove');
    expect(set.storage).toHaveLength(3);
  });
});

describe('ProceduralStylePreset texture fields', () => {
  it('supports texture IDs alongside colors', () => {
    const preset: ProceduralStylePreset = {
      id: 'creole-1',
      name: 'Creole Style',
      baseColors: [{ r: 0.9, g: 0.85, b: 0.7 }],
      roofColor: { r: 0.3, g: 0.2, b: 0.15 },
      windowColor: { r: 0.5, g: 0.6, b: 0.7 },
      doorColor: { r: 0.4, g: 0.25, b: 0.15 },
      materialType: 'stucco',
      architectureStyle: 'creole',
      wallTextureId: 'tex-stucco-cream',
      roofTextureId: 'tex-slate-dark',
      floorTextureId: 'tex-wood-plank',
      doorTextureId: 'tex-wood-door',
      windowTextureId: 'tex-glass-pane',
    };
    expect(preset.wallTextureId).toBe('tex-stucco-cream');
    expect(preset.roofTextureId).toBe('tex-slate-dark');
    expect(preset.floorTextureId).toBe('tex-wood-plank');
    expect(preset.doorTextureId).toBe('tex-wood-door');
    expect(preset.windowTextureId).toBe('tex-glass-pane');
  });

  it('texture fields are optional (backward compatible)', () => {
    const preset: ProceduralStylePreset = {
      id: 'basic',
      name: 'Basic',
      baseColors: [{ r: 1, g: 1, b: 1 }],
      roofColor: { r: 0.5, g: 0.5, b: 0.5 },
      windowColor: { r: 0.7, g: 0.7, b: 0.7 },
      doorColor: { r: 0.4, g: 0.3, b: 0.2 },
      materialType: 'wood',
      architectureStyle: 'rustic',
    };
    expect(preset.wallTextureId).toBeUndefined();
    expect(preset.roofTextureId).toBeUndefined();
  });
});
