/**
 * Tests for OutdoorFurnitureGenerator — procedural outdoor furniture and market stalls
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Babylon.js
vi.mock('@babylonjs/core', () => {
  class MockVector3 {
    constructor(public x = 0, public y = 0, public z = 0) {}
    clone() { return new MockVector3(this.x, this.y, this.z); }
    set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; }
  }

  class MockColor3 {
    constructor(public r = 0, public g = 0, public b = 0) {}
    static Black() { return new MockColor3(); }
  }

  class MockMaterial {
    diffuseColor = new MockColor3();
    specularColor = new MockColor3();
    emissiveColor = new MockColor3();
    alpha = 1;
    constructor(public name: string, _scene?: any) {}
  }

  const childMeshes: any[] = [];
  class MockMesh {
    position = new MockVector3();
    rotation = new MockVector3();
    scaling = new MockVector3(1, 1, 1);
    material: any = null;
    parent: any = null;
    name: string;
    constructor(name: string, _scene?: any) { this.name = name; }
    getChildMeshes() { return childMeshes; }
    dispose() {}
  }

  return {
    Color3: MockColor3,
    Mesh: MockMesh,
    MeshBuilder: {
      CreateBox: (name: string, _opts: any, _scene: any) => new MockMesh(name),
      CreateCylinder: (name: string, _opts: any, _scene: any) => new MockMesh(name),
      CreateSphere: (name: string, _opts: any, _scene: any) => new MockMesh(name),
      CreateTorus: (name: string, _opts: any, _scene: any) => new MockMesh(name),
      CreatePlane: (name: string, _opts: any, _scene: any) => new MockMesh(name),
    },
    StandardMaterial: MockMaterial,
    Vector3: MockVector3,
  };
});

import {
  OutdoorFurnitureGenerator,
  getFurnitureSet,
  FURNITURE_ROLE_MAP,
  FURNITURE_SIZE_MAP,
  type OutdoorFurnitureType,
} from '../OutdoorFurnitureGenerator';
import { StandardMaterial } from '@babylonjs/core';

describe('getFurnitureSet', () => {
  it('returns medieval set with new outdoor types', () => {
    const set = getFurnitureSet('medieval');
    expect(set).toContain('market_stall');
    expect(set).toContain('picnic_table');
    expect(set).toContain('flower_cart');
    expect(set).toContain('signpost');
    expect(set).toContain('water_trough');
    expect(set).toContain('hanging_lantern');
    expect(set).toContain('food_stall');
    expect(set).toContain('weapon_rack');
  });

  it('returns fantasy set (same as medieval)', () => {
    const set = getFurnitureSet('fantasy');
    expect(set).toContain('market_stall');
    expect(set).toContain('hanging_lantern');
  });

  it('returns cyberpunk set with chair_set and picnic_table', () => {
    const set = getFurnitureSet('cyberpunk');
    expect(set).toContain('picnic_table');
    expect(set).toContain('chair_set');
    expect(set).not.toContain('market_stall');
  });

  it('returns western set with water_trough and food_stall', () => {
    const set = getFurnitureSet('western');
    expect(set).toContain('water_trough');
    expect(set).toContain('signpost');
    expect(set).toContain('food_stall');
  });

  it('returns default set with new outdoor types', () => {
    const set = getFurnitureSet('');
    expect(set).toContain('picnic_table');
    expect(set).toContain('signpost');
    expect(set).toContain('flower_cart');
  });
});

describe('FURNITURE_ROLE_MAP', () => {
  it('has entries for all new furniture types', () => {
    const newTypes: OutdoorFurnitureType[] = [
      'picnic_table', 'chair_set', 'flower_cart', 'signpost',
      'water_trough', 'hanging_lantern', 'food_stall', 'weapon_rack',
    ];
    for (const t of newTypes) {
      expect(FURNITURE_ROLE_MAP[t]).toBeDefined();
      expect(FURNITURE_ROLE_MAP[t].length).toBeGreaterThan(0);
    }
  });

  it('preserves original furniture type roles', () => {
    expect(FURNITURE_ROLE_MAP['lamp_post']).toEqual(['lamp', 'lamp_table']);
    expect(FURNITURE_ROLE_MAP['barrel']).toEqual(['storage', 'storage_alt']);
  });
});

describe('FURNITURE_SIZE_MAP', () => {
  it('has sizes for all new furniture types', () => {
    const newTypes = ['picnic_table', 'chair_set', 'flower_cart', 'signpost',
      'water_trough', 'hanging_lantern', 'food_stall', 'weapon_rack'];
    for (const t of newTypes) {
      expect(FURNITURE_SIZE_MAP[t]).toBeGreaterThan(0);
    }
  });
});

describe('OutdoorFurnitureGenerator', () => {
  let generator: OutdoorFurnitureGenerator;
  let materialCache: Map<string, StandardMaterial>;
  let mockScene: any;

  beforeEach(() => {
    materialCache = new Map();
    generator = new OutdoorFurnitureGenerator(materialCache);
    mockScene = {};
  });

  const newTypes = [
    'market_stall', 'picnic_table', 'chair_set', 'flower_cart',
    'signpost', 'water_trough', 'hanging_lantern', 'food_stall', 'weapon_rack',
  ];

  for (const type of newTypes) {
    it(`creates ${type} mesh`, () => {
      const mesh = generator.createOutdoorFurniture(type, `test_${type}`, mockScene);
      expect(mesh).not.toBeNull();
      expect(mesh!.name).toBe(`test_${type}`);
    });
  }

  it('returns null for unknown types', () => {
    const mesh = generator.createOutdoorFurniture('unknown_type', 'test', mockScene);
    expect(mesh).toBeNull();
  });

  it('returns null for original types handled by BabylonGame (lamp_post, bench, etc.)', () => {
    for (const type of ['lamp_post', 'bench', 'well', 'barrel', 'crate', 'terminal', 'planter']) {
      const mesh = generator.createOutdoorFurniture(type, `test_${type}`, mockScene);
      expect(mesh).toBeNull();
    }
  });

  it('caches materials across furniture creations', () => {
    generator.createOutdoorFurniture('market_stall', 'stall1', mockScene);
    const cacheSize1 = materialCache.size;
    expect(cacheSize1).toBeGreaterThan(0);

    generator.createOutdoorFurniture('market_stall', 'stall2', mockScene);
    // Should reuse cached materials, not create new ones
    expect(materialCache.size).toBe(cacheSize1);
  });

  it('enhanced market stall has legs, shelf, awning posts, and goods', () => {
    const mesh = generator.createOutdoorFurniture('market_stall', 'stall_test', mockScene);
    expect(mesh).not.toBeNull();
    // The material cache should have entries for wood, awning, and goods materials
    expect(materialCache.has('furn_stall_wood')).toBe(true);
    expect(materialCache.has('furn_awning')).toBe(true);
    expect(materialCache.has('furn_stall_goods')).toBe(true);
  });

  it('food stall has food items material and awning', () => {
    generator.createOutdoorFurniture('food_stall', 'food_test', mockScene);
    expect(materialCache.has('furn_food_stall_wood')).toBe(true);
    expect(materialCache.has('furn_food_awning')).toBe(true);
    expect(materialCache.has('furn_food_items')).toBe(true);
  });

  it('flower cart has flower and pot materials', () => {
    generator.createOutdoorFurniture('flower_cart', 'flower_test', mockScene);
    expect(materialCache.has('furn_cart_wood')).toBe(true);
    expect(materialCache.has('furn_pot_clay')).toBe(true);
  });

  it('hanging lantern has glow emissive material', () => {
    generator.createOutdoorFurniture('hanging_lantern', 'lantern_test', mockScene);
    expect(materialCache.has('furn_lantern_glow')).toBe(true);
    const glowMat = materialCache.get('furn_lantern_glow')!;
    // Emissive color should be set (warm glow)
    expect((glowMat as any).emissiveColor).toBeDefined();
  });

  it('water trough has semi-transparent water material', () => {
    generator.createOutdoorFurniture('water_trough', 'trough_test', mockScene);
    expect(materialCache.has('furn_trough_water')).toBe(true);
    const waterMat = materialCache.get('furn_trough_water')!;
    expect((waterMat as any).alpha).toBe(0.8);
  });

  it('weapon rack has metal material for weapons', () => {
    generator.createOutdoorFurniture('weapon_rack', 'rack_test', mockScene);
    expect(materialCache.has('furn_rack_metal')).toBe(true);
    expect(materialCache.has('furn_rack_wood')).toBe(true);
  });
});
