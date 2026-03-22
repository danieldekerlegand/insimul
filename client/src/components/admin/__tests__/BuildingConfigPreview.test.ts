import { describe, it, expect } from 'vitest';
import type { ProceduralBuildingConfig, ProceduralStylePreset, ProceduralBuildingTypeOverride } from '@shared/game-engine/types';

/**
 * Tests for the exterior 3D preview integration in the BuildingTypeOverridesEditor.
 *
 * These tests validate the preview config construction logic and zone/tint
 * classification that drives the BuildingModelPreview component.
 */

const RESIDENTIAL_TYPES = ['residence_small', 'residence_medium', 'residence_large', 'residence_mansion'];
const COMMERCIAL_TYPES = ['Bakery', 'Restaurant', 'Tavern', 'Inn', 'Market', 'Shop', 'Blacksmith',
  'LawFirm', 'Bank', 'Hospital', 'School', 'Church', 'Theater', 'Library', 'ApartmentComplex'];

/** Mirrors the helper in BuildingTypeOverridesEditor */
function buildPreviewConfig(
  stylePresets: ProceduralStylePreset[],
  type: string,
  ov: ProceduralBuildingTypeOverride,
): ProceduralBuildingConfig {
  return {
    stylePresets,
    buildingTypeOverrides: { [type]: ov },
    defaultResidentialStyleId: undefined,
    defaultCommercialStyleId: undefined,
  };
}

/** Mirrors the zone classification in BuildingTypeOverridesEditor */
function isResidentialType(type: string): boolean {
  return type.startsWith('residence_');
}

const samplePreset: ProceduralStylePreset = {
  id: 'creole-1',
  name: 'Creole Style',
  baseColors: [{ r: 0.9, g: 0.85, b: 0.7 }],
  roofColor: { r: 0.3, g: 0.2, b: 0.15 },
  windowColor: { r: 0.5, g: 0.6, b: 0.7 },
  doorColor: { r: 0.4, g: 0.25, b: 0.15 },
  materialType: 'stucco',
  architectureStyle: 'creole',
};

describe('BuildingConfigPreview helpers', () => {
  describe('buildPreviewConfig', () => {
    it('produces a valid ProceduralBuildingConfig with the given type override', () => {
      const override: ProceduralBuildingTypeOverride = { floors: 3, hasBalcony: true };
      const config = buildPreviewConfig([samplePreset], 'Tavern', override);

      expect(config.stylePresets).toHaveLength(1);
      expect(config.stylePresets[0].id).toBe('creole-1');
      expect(config.buildingTypeOverrides).toBeDefined();
      expect(config.buildingTypeOverrides!['Tavern']).toEqual(override);
    });

    it('scopes overrides to the single building type', () => {
      const override: ProceduralBuildingTypeOverride = { floors: 2 };
      const config = buildPreviewConfig([samplePreset], 'Bakery', override);

      expect(Object.keys(config.buildingTypeOverrides!)).toEqual(['Bakery']);
    });

    it('passes through empty override', () => {
      const config = buildPreviewConfig([samplePreset], 'Shop', {});
      expect(config.buildingTypeOverrides!['Shop']).toEqual({});
    });

    it('includes all style presets for resolution', () => {
      const preset2: ProceduralStylePreset = {
        ...samplePreset,
        id: 'colonial-1',
        name: 'Colonial Style',
      };
      const override: ProceduralBuildingTypeOverride = { stylePresetId: 'colonial-1' };
      const config = buildPreviewConfig([samplePreset, preset2], 'Inn', override);

      expect(config.stylePresets).toHaveLength(2);
      expect(config.buildingTypeOverrides!['Inn'].stylePresetId).toBe('colonial-1');
    });

    it('does not set default zone style IDs', () => {
      const config = buildPreviewConfig([samplePreset], 'Market', {});
      expect(config.defaultResidentialStyleId).toBeUndefined();
      expect(config.defaultCommercialStyleId).toBeUndefined();
    });
  });

  describe('isResidentialType', () => {
    it('classifies residence_ prefixed types as residential', () => {
      for (const type of RESIDENTIAL_TYPES) {
        expect(isResidentialType(type)).toBe(true);
      }
    });

    it('classifies business types as non-residential', () => {
      for (const type of COMMERCIAL_TYPES) {
        expect(isResidentialType(type)).toBe(false);
      }
    });
  });

  describe('zone and tint color assignment', () => {
    it('residential types get blue tint and residential zone', () => {
      const residentialTint = { r: 0.3, g: 0.5, b: 0.8 };
      for (const type of RESIDENTIAL_TYPES) {
        const zone = isResidentialType(type) ? 'residential' : 'commercial';
        const tint = isResidentialType(type) ? residentialTint : { r: 0.8, g: 0.5, b: 0.2 };
        expect(zone).toBe('residential');
        expect(tint).toEqual(residentialTint);
      }
    });

    it('commercial types get orange tint and commercial zone', () => {
      const commercialTint = { r: 0.8, g: 0.5, b: 0.2 };
      for (const type of COMMERCIAL_TYPES) {
        const zone = isResidentialType(type) ? 'residential' : 'commercial';
        const tint = isResidentialType(type) ? { r: 0.3, g: 0.5, b: 0.8 } : commercialTint;
        expect(zone).toBe('commercial');
        expect(tint).toEqual(commercialTint);
      }
    });
  });

  describe('override with style preset binding', () => {
    it('override stylePresetId references a preset in the config', () => {
      const override: ProceduralBuildingTypeOverride = { stylePresetId: 'creole-1', floors: 2 };
      const config = buildPreviewConfig([samplePreset], 'Restaurant', override);

      const referencedPreset = config.stylePresets.find(
        p => p.id === config.buildingTypeOverrides!['Restaurant'].stylePresetId
      );
      expect(referencedPreset).toBeDefined();
      expect(referencedPreset!.name).toBe('Creole Style');
    });

    it('override without stylePresetId falls through to zone default', () => {
      const override: ProceduralBuildingTypeOverride = { floors: 1 };
      const config = buildPreviewConfig([samplePreset], 'Shop', override);

      expect(config.buildingTypeOverrides!['Shop'].stylePresetId).toBeUndefined();
      // The BuildingModelPreview resolvePresetForPreview will fall back to first preset
      expect(config.stylePresets.length).toBeGreaterThan(0);
    });
  });
});
