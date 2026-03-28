import { describe, it, expect } from 'vitest';
import {
  BUILDING_CATEGORY_GROUPINGS,
  getCategoryForType,
} from '../game-engine/building-categories';
import {
  BUILDING_TYPE_DEFAULTS,
  getBuildingDefaults,
} from '../game-engine/building-defaults';
import {
  getTemplateForBuildingType,
  getTemplateById,
} from '../game-engine/interior-templates';

describe('Theater building type', () => {
  it('is in the entertainment category', () => {
    expect(BUILDING_CATEGORY_GROUPINGS.entertainment).toContain('Theater');
    expect(getCategoryForType('Theater')).toBe('entertainment');
  });

  it('has default dimensions (2 floors, 18x20)', () => {
    const defaults = getBuildingDefaults('Theater');
    expect(defaults.floors).toBe(2);
    expect(defaults.width).toBe(18);
    expect(defaults.depth).toBe(20);
  });

  it('has an interior layout template', () => {
    const template = getTemplateById('theater');
    expect(template).toBeDefined();
    expect(template!.category).toBe('entertainment');
    expect(template!.buildingType).toBe('theater');
    expect(template!.rooms.length).toBeGreaterThanOrEqual(2);
  });

  it('is found by getTemplateForBuildingType', () => {
    const template = getTemplateForBuildingType('Theater');
    expect(template).toBeDefined();
    expect(template!.id).toBe('theater');
  });

  it('template has stage and auditorium rooms', () => {
    const template = getTemplateById('theater')!;
    const roomFunctions = template.rooms.map(r => r.function);
    expect(roomFunctions).toContain('theater_stage');
    expect(roomFunctions).toContain('theater_auditorium');
  });
});

describe('AutoRepair building type', () => {
  it('is in the commercial_service category', () => {
    expect(BUILDING_CATEGORY_GROUPINGS.commercial_service).toContain('AutoRepair');
    expect(getCategoryForType('AutoRepair')).toBe('commercial_service');
  });

  it('has default dimensions (1 floor, 20x24)', () => {
    const defaults = getBuildingDefaults('AutoRepair');
    expect(defaults.floors).toBe(1);
    expect(defaults.width).toBe(20);
    expect(defaults.depth).toBe(24);
  });

  it('has an interior layout template', () => {
    const template = getTemplateById('autorepair');
    expect(template).toBeDefined();
    expect(template!.category).toBe('commercial_service');
    expect(template!.buildingType).toBe('autorepair');
  });

  it('is found by getTemplateForBuildingType', () => {
    const template = getTemplateForBuildingType('AutoRepair');
    expect(template).toBeDefined();
    expect(template!.id).toBe('autorepair');
  });

  it('template has garage bay and office rooms', () => {
    const template = getTemplateById('autorepair')!;
    const roomFunctions = template.rooms.map(r => r.function);
    expect(roomFunctions).toContain('garage_bay');
    expect(roomFunctions).toContain('office');
  });

  it('has exactly 1 floor in the template', () => {
    const template = getTemplateById('autorepair')!;
    expect(template.floorCount).toBe(1);
  });
});
