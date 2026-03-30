/**
 * Harbor & Dock Generator
 *
 * Generates harbor infrastructure (docks, piers, warehouses, fish markets,
 * lighthouses) for coastal settlements. Works with the coastline generator
 * to place maritime structures along the waterfront.
 *
 * All functions are pure and deterministic given the same seed.
 */

import type { CoastlineData, Point2D, BayShape } from './coastline-generator';
import { isOnWaterSide, isInsideBay } from './coastline-generator';

// ── Seeded PRNG (mulberry32) ────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ───────────────────────────────────────────────────────────────────

export type HarborStructureType =
  | 'dock'
  | 'pier'
  | 'warehouse'
  | 'fish_market'
  | 'lighthouse'
  | 'harbormaster_office'
  | 'boatyard'
  | 'customs_house';

export interface HarborStructure {
  id: string;
  name: string;
  type: HarborStructureType;
  /** World-space position */
  x: number;
  z: number;
  /** Width along the waterfront */
  width: number;
  /** Depth perpendicular to the waterfront */
  depth: number;
  /** Rotation in radians (facing the water) */
  rotation: number;
  properties: {
    material: 'wood' | 'stone' | 'iron';
    condition: 'new' | 'good' | 'worn' | 'damaged';
    capacity?: number;
    builtYear?: number;
  };
}

export interface HarborZone {
  id: string;
  name: string;
  /** Center of the harbor zone */
  center: Point2D;
  /** Radius of the harbor zone */
  radius: number;
  /** Structures within this harbor */
  structures: HarborStructure[];
  /** Which bay this harbor is in (if any) */
  bayIndex: number | null;
}

export interface HarborConfig {
  seed?: number;
  /** Coastline data from the coastline generator */
  coastline: CoastlineData;
  /** Settlement type affects harbor size */
  settlementType: 'dwelling' | 'roadhouse' | 'homestead' | 'landing' | 'forge' | 'chapel' | 'market' | 'hamlet' | 'village' | 'town' | 'city';
  /** Year the settlement was founded */
  foundedYear?: number;
}

export interface HarborGenerationResult {
  zones: HarborZone[];
  /** All structures across all zones, for convenient iteration */
  allStructures: HarborStructure[];
}

// ── Harbor zone placement ───────────────────────────────────────────────────

/**
 * Find suitable locations along the coastline for harbor placement.
 * Bays are preferred locations; otherwise, pick points along the shore.
 */
export function findHarborSites(
  coastline: CoastlineData,
  count: number,
  rng: () => number,
): Point2D[] {
  const sites: Point2D[] = [];

  // Prefer bay centers — natural harbors
  for (const bay of coastline.bays) {
    if (sites.length >= count) break;
    sites.push({ x: bay.center.x, z: bay.center.z });
  }

  // Fill remaining slots with points along the coastline
  if (sites.length < count && coastline.contour.length >= 2) {
    const step = Math.floor(coastline.contour.length / (count - sites.length + 1));
    for (let i = step; i < coastline.contour.length && sites.length < count; i += step) {
      const pt = coastline.contour[i];
      // Ensure not too close to existing sites
      const tooClose = sites.some(
        s => Math.hypot(s.x - pt.x, s.z - pt.z) < coastline.mapSize * 0.1,
      );
      if (!tooClose) {
        sites.push({ x: pt.x, z: pt.z });
      }
    }
  }

  return sites;
}

/**
 * Get the number of harbor zones based on settlement type.
 */
export function getHarborCount(settlementType: string): number {
  switch (settlementType) {
    case 'dwelling':
    case 'roadhouse':
    case 'homestead': return 0;
    case 'hamlet': return 1;
    case 'village': return 1;
    case 'town': return 1;
    case 'city': return 2;
    default: return 1;
  }
}

/**
 * Calculate the inward direction (from water toward land) for a given waterSide.
 */
export function getInwardDirection(waterSide: 'north' | 'south' | 'east' | 'west'): Point2D {
  switch (waterSide) {
    case 'north': return { x: 0, z: 1 };
    case 'south': return { x: 0, z: -1 };
    case 'east': return { x: -1, z: 0 };
    case 'west': return { x: 1, z: 0 };
  }
}

/**
 * Calculate the rotation angle (in radians) so structures face the water.
 */
export function getWaterFacingRotation(waterSide: 'north' | 'south' | 'east' | 'west'): number {
  switch (waterSide) {
    case 'north': return 0;           // facing north toward water
    case 'south': return Math.PI;     // facing south toward water
    case 'east': return Math.PI / 2;  // facing east toward water
    case 'west': return -Math.PI / 2; // facing west toward water
  }
}

// ── Structure generation ────────────────────────────────────────────────────

interface StructureTemplate {
  type: HarborStructureType;
  name: string;
  width: number;
  depth: number;
  materials: Array<'wood' | 'stone' | 'iron'>;
  /** Whether this structure extends into the water (piers, docks) */
  extendsIntoWater: boolean;
}

const STRUCTURE_TEMPLATES: StructureTemplate[] = [
  { type: 'dock', name: 'Dock', width: 8, depth: 20, materials: ['wood', 'stone'], extendsIntoWater: true },
  { type: 'pier', name: 'Pier', width: 4, depth: 30, materials: ['wood', 'wood', 'stone'], extendsIntoWater: true },
  { type: 'warehouse', name: 'Warehouse', width: 20, depth: 15, materials: ['wood', 'stone', 'stone'], extendsIntoWater: false },
  { type: 'fish_market', name: 'Fish Market', width: 15, depth: 10, materials: ['wood', 'wood'], extendsIntoWater: false },
  { type: 'lighthouse', name: 'Lighthouse', width: 6, depth: 6, materials: ['stone', 'stone', 'iron'], extendsIntoWater: false },
  { type: 'harbormaster_office', name: "Harbormaster's Office", width: 10, depth: 8, materials: ['stone', 'wood'], extendsIntoWater: false },
  { type: 'boatyard', name: 'Boatyard', width: 18, depth: 14, materials: ['wood', 'wood'], extendsIntoWater: true },
  { type: 'customs_house', name: 'Customs House', width: 12, depth: 10, materials: ['stone', 'stone'], extendsIntoWater: false },
];

/**
 * Determine which structure types to generate based on settlement size.
 */
export function getStructureLayout(
  settlementType: string,
  rng: () => number,
): HarborStructureType[] {
  const base: HarborStructureType[] = ['dock', 'pier'];

  switch (settlementType) {
    case 'dwelling':
    case 'roadhouse':
    case 'homestead':
      // Too small for a harbor
      return [];
    case 'hamlet':
      // Tiny hamlet: just the basics
      return base;
    case 'village':
      // Small fishing village: 1 dock, 1 pier, maybe a fish market
      if (rng() > 0.3) base.push('fish_market');
      return base;
    case 'town':
      // Town: docks, piers, warehouse, fish market, harbormaster
      base.push('dock', 'warehouse', 'fish_market', 'harbormaster_office');
      if (rng() > 0.5) base.push('lighthouse');
      if (rng() > 0.5) base.push('boatyard');
      return base;
    case 'city':
      // City: full harbor infrastructure
      base.push('dock', 'dock', 'pier', 'warehouse', 'warehouse',
        'fish_market', 'harbormaster_office', 'lighthouse',
        'boatyard', 'customs_house');
      return base;
    default:
      return base;
  }
}

/**
 * Place structures around a harbor site, arranging them along the waterfront.
 */
export function placeStructures(
  site: Point2D,
  structureTypes: HarborStructureType[],
  coastline: CoastlineData,
  zoneId: string,
  foundedYear: number,
  rng: () => number,
): HarborStructure[] {
  const structures: HarborStructure[] = [];
  const inward = getInwardDirection(coastline.waterSide);
  const baseRotation = getWaterFacingRotation(coastline.waterSide);

  // Tangent direction (along the shoreline)
  const tangent: Point2D = { x: -inward.z, z: inward.x };

  // Sort: water-extending structures go closer to the water, land ones go inland
  const waterStructures = structureTypes.filter(t => {
    const tmpl = STRUCTURE_TEMPLATES.find(s => s.type === t);
    return tmpl?.extendsIntoWater;
  });
  const landStructures = structureTypes.filter(t => {
    const tmpl = STRUCTURE_TEMPLATES.find(s => s.type === t);
    return !tmpl?.extendsIntoWater;
  });

  let lateralOffset = 0;
  let structureIndex = 0;

  // Place water-extending structures along the waterfront
  for (const type of waterStructures) {
    const tmpl = STRUCTURE_TEMPLATES.find(s => s.type === type)!;
    const spacing = tmpl.width + 2 + rng() * 4;

    const x = site.x + tangent.x * lateralOffset - inward.x * (tmpl.depth * 0.3);
    const z = site.z + tangent.z * lateralOffset - inward.z * (tmpl.depth * 0.3);

    structures.push(createStructure(
      `${zoneId}-${type}-${structureIndex}`,
      tmpl, x, z, baseRotation, foundedYear, rng,
    ));

    lateralOffset += spacing;
    structureIndex++;
  }

  // Place land structures in a row behind the waterfront
  lateralOffset = 0;
  for (const type of landStructures) {
    const tmpl = STRUCTURE_TEMPLATES.find(s => s.type === type)!;
    const spacing = tmpl.width + 3 + rng() * 5;
    const inlandDist = 15 + rng() * 10;

    const x = site.x + tangent.x * lateralOffset + inward.x * inlandDist;
    const z = site.z + tangent.z * lateralOffset + inward.z * inlandDist;

    structures.push(createStructure(
      `${zoneId}-${type}-${structureIndex}`,
      tmpl, x, z, baseRotation, foundedYear, rng,
    ));

    lateralOffset += spacing;
    structureIndex++;
  }

  return structures;
}

function createStructure(
  id: string,
  tmpl: StructureTemplate,
  x: number,
  z: number,
  rotation: number,
  foundedYear: number,
  rng: () => number,
): HarborStructure {
  const material = tmpl.materials[Math.floor(rng() * tmpl.materials.length)];
  const conditionRoll = rng();
  const condition = conditionRoll < 0.1 ? 'new' : conditionRoll < 0.5 ? 'good' : conditionRoll < 0.85 ? 'worn' : 'damaged';
  const builtYear = foundedYear + Math.floor(rng() * 60);

  return {
    id,
    name: tmpl.name,
    type: tmpl.type,
    x,
    z,
    width: tmpl.width,
    depth: tmpl.depth,
    rotation,
    properties: {
      material,
      condition,
      capacity: tmpl.type === 'dock' ? 3 + Math.floor(rng() * 5) : undefined,
      builtYear,
    },
  };
}

// ── Main entry point ────────────────────────────────────────────────────────

/**
 * Generate harbor zones and structures for a coastal settlement.
 */
export function generateHarborAndDocks(config: HarborConfig): HarborGenerationResult {
  const {
    seed = 42,
    coastline,
    settlementType,
    foundedYear = 1800,
  } = config;

  const rng = mulberry32(seed);
  const harborCount = getHarborCount(settlementType);
  const sites = findHarborSites(coastline, harborCount, rng);

  const zones: HarborZone[] = [];

  for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    const zoneId = `harbor-${i}`;

    // Check if this site is inside a bay
    let bayIndex: number | null = null;
    for (let b = 0; b < coastline.bays.length; b++) {
      if (isInsideBay(site.x, site.z, coastline.bays[b], coastline.waterSide)) {
        bayIndex = b;
        break;
      }
    }

    const layout = getStructureLayout(settlementType, rng);
    const structures = placeStructures(site, layout, coastline, zoneId, foundedYear, rng);

    const harborNames = ['Main Harbor', 'North Harbor', 'South Harbor', 'East Harbor', 'West Harbor'];
    zones.push({
      id: zoneId,
      name: harborNames[i % harborNames.length],
      center: site,
      radius: settlementType === 'city' ? 80 : settlementType === 'town' ? 50 : 30,
      structures,
      bayIndex,
    });
  }

  const allStructures = zones.flatMap(z => z.structures);

  return { zones, allStructures };
}
