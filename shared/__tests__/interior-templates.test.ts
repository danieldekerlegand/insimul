import { describe, it, expect } from 'vitest';
import {
  INTERIOR_LAYOUT_TEMPLATES,
  getTemplateById,
  getTemplateForBuildingType,
  getTemplateIds,
  resolveRoomZone,
  getFurnitureSetForRoom,
  type InteriorLayoutTemplate,
  type RoomZoneTemplate,
  type FurnitureEntry,
} from '../game-engine/interior-templates';

describe('Interior Layout Templates', () => {
  it('should have at least 15 templates', () => {
    expect(INTERIOR_LAYOUT_TEMPLATES.length).toBeGreaterThanOrEqual(15);
  });

  it('should have unique IDs', () => {
    const ids = INTERIOR_LAYOUT_TEMPLATES.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every template has valid dimensions', () => {
    for (const t of INTERIOR_LAYOUT_TEMPLATES) {
      expect(t.width).toBeGreaterThan(0);
      expect(t.depth).toBeGreaterThan(0);
      expect(t.height).toBeGreaterThan(0);
      expect(t.floorCount).toBeGreaterThanOrEqual(1);
    }
  });

  it('every template has at least one room', () => {
    for (const t of INTERIOR_LAYOUT_TEMPLATES) {
      expect(t.rooms.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every room has a matching furniture set', () => {
    for (const t of INTERIOR_LAYOUT_TEMPLATES) {
      const availableFunctions = new Set(t.furnitureSets.map(fs => fs.roomFunction));
      for (const room of t.rooms) {
        expect(availableFunctions.has(room.function)).toBe(true);
      }
    }
  });

  it('every template has at least one matchBusinessTypes entry', () => {
    for (const t of INTERIOR_LAYOUT_TEMPLATES) {
      expect(t.matchBusinessTypes.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('color values are in valid range [0, 1]', () => {
    const checkColor = (c: { r: number; g: number; b: number }, label: string) => {
      expect(c.r, `${label}.r`).toBeGreaterThanOrEqual(0);
      expect(c.r, `${label}.r`).toBeLessThanOrEqual(1);
      expect(c.g, `${label}.g`).toBeGreaterThanOrEqual(0);
      expect(c.g, `${label}.g`).toBeLessThanOrEqual(1);
      expect(c.b, `${label}.b`).toBeGreaterThanOrEqual(0);
      expect(c.b, `${label}.b`).toBeLessThanOrEqual(1);
    };

    for (const t of INTERIOR_LAYOUT_TEMPLATES) {
      checkColor(t.colors.floor, `${t.id}.colors.floor`);
      checkColor(t.colors.wall, `${t.id}.colors.wall`);
      checkColor(t.colors.ceiling, `${t.id}.colors.ceiling`);

      for (const fs of t.furnitureSets) {
        for (const f of fs.furniture) {
          checkColor(f.color, `${t.id}.${fs.roomFunction}.${f.type}`);
        }
      }
    }
  });

  it('room zone fractions are within bounds', () => {
    for (const t of INTERIOR_LAYOUT_TEMPLATES) {
      for (const room of t.rooms) {
        expect(room.widthFraction).toBeGreaterThan(0);
        expect(room.widthFraction).toBeLessThanOrEqual(1);
        expect(room.depthFraction).toBeGreaterThan(0);
        expect(room.depthFraction).toBeLessThanOrEqual(1);
        expect(room.floor).toBeGreaterThanOrEqual(0);
        expect(room.floor).toBeLessThan(t.floorCount);
      }
    }
  });

  it('furniture entries have positive dimensions', () => {
    for (const t of INTERIOR_LAYOUT_TEMPLATES) {
      for (const fs of t.furnitureSets) {
        for (const f of fs.furniture) {
          expect(f.width, `${t.id}.${fs.roomFunction}.${f.type}.width`).toBeGreaterThan(0);
          expect(f.height, `${t.id}.${fs.roomFunction}.${f.type}.height`).toBeGreaterThan(0);
          expect(f.depth, `${t.id}.${fs.roomFunction}.${f.type}.depth`).toBeGreaterThan(0);
        }
      }
    }
  });

  describe('required templates exist', () => {
    const requiredIds = [
      'tavern', 'restaurant', 'shop', 'bar', 'bakery',
      'residence_small', 'residence_medium', 'residence_large',
      'church', 'school', 'hotel', 'blacksmith', 'warehouse',
      'clinic', 'farm_barn',
    ];

    for (const id of requiredIds) {
      it(`has template "${id}"`, () => {
        expect(getTemplateById(id)).toBeDefined();
      });
    }
  });
});

describe('getTemplateById', () => {
  it('returns template for valid id', () => {
    const t = getTemplateById('tavern');
    expect(t).toBeDefined();
    expect(t!.id).toBe('tavern');
  });

  it('returns undefined for unknown id', () => {
    expect(getTemplateById('nonexistent')).toBeUndefined();
  });
});

describe('getTemplateForBuildingType', () => {
  it('matches by business type', () => {
    expect(getTemplateForBuildingType('building', 'tavern')?.id).toBe('tavern');
    expect(getTemplateForBuildingType('building', 'inn')?.id).toBe('tavern');
    expect(getTemplateForBuildingType('building', 'shop')?.id).toBe('shop');
  });

  it('matches by building type when no business type', () => {
    expect(getTemplateForBuildingType('church')?.id).toBe('church');
    expect(getTemplateForBuildingType('warehouse')?.id).toBe('warehouse');
  });

  it('returns undefined for unknown type', () => {
    expect(getTemplateForBuildingType('spaceship')).toBeUndefined();
  });

  it('is case-insensitive via toLowerCase', () => {
    expect(getTemplateForBuildingType('building', 'Tavern')?.id).toBe('tavern');
  });
});

describe('getTemplateIds', () => {
  it('returns all template ids', () => {
    const ids = getTemplateIds();
    expect(ids.length).toBe(INTERIOR_LAYOUT_TEMPLATES.length);
    expect(ids).toContain('tavern');
    expect(ids).toContain('clinic');
  });
});

describe('resolveRoomZone', () => {
  it('converts fractions to absolute dimensions', () => {
    const template: InteriorLayoutTemplate = {
      id: 'test', buildingType: 'test', matchBusinessTypes: [],
      width: 20, depth: 10, height: 5, floorCount: 2,
      colors: { floor: { r: 0, g: 0, b: 0 }, wall: { r: 0, g: 0, b: 0 }, ceiling: { r: 0, g: 0, b: 0 } },
      rooms: [], furnitureSets: [],
    };
    const room: RoomZoneTemplate = {
      name: 'test_room', function: 'living',
      offsetXFraction: 0.25, offsetZFraction: -0.2,
      widthFraction: 0.5, depthFraction: 0.6, floor: 1,
    };

    const resolved = resolveRoomZone(template, room);
    expect(resolved.name).toBe('test_room');
    expect(resolved.function).toBe('living');
    expect(resolved.offsetX).toBeCloseTo(5);   // 0.25 * 20
    expect(resolved.offsetZ).toBeCloseTo(-2);  // -0.2 * 10
    expect(resolved.offsetY).toBe(5);          // floor 1 * height 5
    expect(resolved.width).toBeCloseTo(10);    // 0.5 * 20
    expect(resolved.depth).toBeCloseTo(6);     // 0.6 * 10
    expect(resolved.floor).toBe(1);
  });
});

describe('getFurnitureSetForRoom', () => {
  it('returns furniture for matching room function', () => {
    const tavern = getTemplateById('tavern')!;
    const mainFurniture = getFurnitureSetForRoom(tavern, 'tavern_main');
    expect(mainFurniture.length).toBeGreaterThan(0);
    expect(mainFurniture.some(f => f.type === 'counter')).toBe(true);
  });

  it('returns empty array for non-matching function', () => {
    const tavern = getTemplateById('tavern')!;
    expect(getFurnitureSetForRoom(tavern, 'nonexistent')).toEqual([]);
  });
});
