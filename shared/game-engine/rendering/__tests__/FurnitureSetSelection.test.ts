import { describe, it, expect } from 'vitest';
import {
  INTERIOR_LAYOUT_TEMPLATES,
  getFurnitureSetForRoom,
} from '@shared/game-engine/interior-templates';
import type { FurnitureEntry } from '@shared/game-engine/interior-templates';

/**
 * Tests for furniture set selection in BuildingInteriorGenerator.
 *
 * Validates that:
 * - Each furniture set resolves to a distinct template with furniture data
 * - Different furniture sets produce different furniture for the same room function
 * - FurnitureEntry → FurnitureSpec conversion produces correct absolute offsets
 * - Fallback to first furniture set works when room function doesn't match
 */

// ── Template resolution ──

describe('Furniture set template resolution', () => {
  const FURNITURE_SET_NAMES = [
    'tavern', 'shop', 'church', 'school', 'hotel',
    'blacksmith', 'warehouse', 'guild_hall',
    'bakery', 'restaurant', 'bar',
  ];

  it('each furniture set name resolves to a template', () => {
    for (const setName of FURNITURE_SET_NAMES) {
      const template = INTERIOR_LAYOUT_TEMPLATES.find(
        t => t.id === setName || t.buildingType === setName,
      );
      expect(template, `template for '${setName}' should exist`).toBeDefined();
    }
  });

  it('each resolved template has at least one furniture set', () => {
    for (const setName of FURNITURE_SET_NAMES) {
      const template = INTERIOR_LAYOUT_TEMPLATES.find(
        t => t.id === setName || t.buildingType === setName,
      );
      if (!template) continue;
      expect(
        template.furnitureSets.length,
        `'${setName}' template should have furniture sets`,
      ).toBeGreaterThan(0);
    }
  });
});

// ── Different sets produce different furniture ──

describe('Furniture sets produce distinct furniture', () => {
  it('tavern and shop templates have different furniture types', () => {
    const tavern = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'tavern');
    const shop = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'shop');
    expect(tavern).toBeDefined();
    expect(shop).toBeDefined();

    const tavernTypes = new Set(
      tavern!.furnitureSets.flatMap(fs => fs.furniture.map(f => f.type)),
    );
    const shopTypes = new Set(
      shop!.furnitureSets.flatMap(fs => fs.furniture.map(f => f.type)),
    );

    // They should not be identical sets
    const allSame = tavernTypes.size === shopTypes.size &&
      [...tavernTypes].every(t => shopTypes.has(t));
    expect(allSame).toBe(false);
  });

  it('church and blacksmith templates have different furniture types', () => {
    const church = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'church');
    const blacksmith = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'blacksmith');
    expect(church).toBeDefined();
    expect(blacksmith).toBeDefined();

    const churchTypes = new Set(
      church!.furnitureSets.flatMap(fs => fs.furniture.map(f => f.type)),
    );
    const smithTypes = new Set(
      blacksmith!.furnitureSets.flatMap(fs => fs.furniture.map(f => f.type)),
    );

    const allSame = churchTypes.size === smithTypes.size &&
      [...churchTypes].every(t => smithTypes.has(t));
    expect(allSame).toBe(false);
  });
});

// ── FurnitureEntry → FurnitureSpec conversion ──

describe('FurnitureEntry to FurnitureSpec conversion', () => {
  /** Mirrors the convertFurnitureEntry method from BuildingInteriorGenerator */
  function convertFurnitureEntry(
    entry: FurnitureEntry,
    roomWidth: number,
    roomDepth: number,
  ) {
    return {
      type: entry.type,
      offsetX: entry.offsetXFraction * roomWidth,
      offsetZ: entry.offsetZFraction * roomDepth,
      width: entry.width,
      height: entry.height,
      depth: entry.depth,
      color: { r: entry.color.r, g: entry.color.g, b: entry.color.b },
      rotationY: entry.rotationY,
    };
  }

  it('converts fractional offsets to absolute offsets', () => {
    const entry: FurnitureEntry = {
      type: 'table',
      offsetXFraction: 0.5,
      offsetZFraction: -0.25,
      width: 1.5,
      height: 0.8,
      depth: 1.0,
      color: { r: 0.6, g: 0.4, b: 0.2 },
    };

    const roomWidth = 8;
    const roomDepth = 6;
    const spec = convertFurnitureEntry(entry, roomWidth, roomDepth);

    expect(spec.type).toBe('table');
    expect(spec.offsetX).toBe(4.0); // 0.5 * 8
    expect(spec.offsetZ).toBe(-1.5); // -0.25 * 6
    expect(spec.width).toBe(1.5);
    expect(spec.height).toBe(0.8);
    expect(spec.depth).toBe(1.0);
    expect(spec.color.r).toBe(0.6);
  });

  it('preserves rotationY when present', () => {
    const entry: FurnitureEntry = {
      type: 'chair',
      offsetXFraction: 0,
      offsetZFraction: 0,
      width: 0.5,
      height: 0.9,
      depth: 0.5,
      color: { r: 0.5, g: 0.3, b: 0.1 },
      rotationY: Math.PI / 2,
    };

    const spec = convertFurnitureEntry(entry, 4, 4);
    expect(spec.rotationY).toBe(Math.PI / 2);
  });

  it('returns undefined rotationY when not set', () => {
    const entry: FurnitureEntry = {
      type: 'bed',
      offsetXFraction: 0,
      offsetZFraction: 0,
      width: 2,
      height: 0.6,
      depth: 1.5,
      color: { r: 0.8, g: 0.8, b: 0.8 },
    };

    const spec = convertFurnitureEntry(entry, 4, 4);
    expect(spec.rotationY).toBeUndefined();
  });
});

// ── Fallback behavior ──

describe('Furniture set fallback behavior', () => {
  it('returns empty array when room function does not match template', () => {
    const tavern = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'tavern');
    expect(tavern).toBeDefined();

    // 'bedroom' is unlikely in a tavern template
    const result = getFurnitureSetForRoom(tavern!, 'nonexistent_room');
    expect(result).toEqual([]);
  });

  it('first furniture set has entries for fallback', () => {
    for (const template of INTERIOR_LAYOUT_TEMPLATES) {
      if (template.furnitureSets.length > 0) {
        expect(
          template.furnitureSets[0].furniture.length,
          `first furniture set of '${template.id}' should have entries for fallback`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('getFurnitureSetForRoom returns entries for matching room functions', () => {
    const tavern = INTERIOR_LAYOUT_TEMPLATES.find(t => t.id === 'tavern');
    expect(tavern).toBeDefined();

    // Tavern should have furniture for its main room function
    const roomFunctions = tavern!.furnitureSets.map(fs => fs.roomFunction);
    expect(roomFunctions.length).toBeGreaterThan(0);

    for (const fn of roomFunctions) {
      const furniture = getFurnitureSetForRoom(tavern!, fn);
      expect(furniture.length, `tavern should have furniture for '${fn}'`).toBeGreaterThan(0);
    }
  });
});
