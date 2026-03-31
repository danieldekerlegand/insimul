/**
 * Settlement Layout Preview — SVG visualization of street patterns.
 *
 * This component is shared between SettlementDialog and CountryDialog.
 * Pattern selection is driven by shared/street-pattern-selection.ts which
 * mirrors the server-side logic.
 *
 * Related server files:
 *   - server/generators/street-network-generator.ts
 *   - server/generators/street-generator.ts
 *   - server/generators/geography-generator.ts
 */

import { useMemo } from 'react';
import {
  getGridLotCount,
  GRID_SIZE,
  type LayoutPattern,
} from '@shared/street-pattern-selection';

export type SettlementType = 'dwelling' | 'roadhouse' | 'homestead' | 'landing' | 'forge' | 'chapel' | 'market' | 'hamlet' | 'village' | 'town' | 'city';

export const POPULATION_BY_TYPE: Record<SettlementType, number> = {
  dwelling: 3,
  roadhouse: 3,
  landing: 10,
  forge: 10,
  chapel: 10,
  homestead: 10,
  market: 30,
  hamlet: 50,
  village: 100,
  town: 1000,
  city: 5000,
};

export const BASE_FAMILIES: Record<SettlementType, number> = {
  dwelling: 1,
  roadhouse: 1,
  landing: 2,
  forge: 2,
  chapel: 2,
  homestead: 2,
  market: 4,
  hamlet: 6,
  village: 10,
  town: 25,
  city: 60,
};

/** Default generation parameters per settlement type (rates that produce target populations) */
export const DEFAULT_GEN_PARAMS: Record<SettlementType, Omit<GenerationParams, 'foundingFamilies' | 'generations'>> = {
  dwelling:   { marriageRate: 0.8, fertilityRate: 0.7, deathRate: 0.3, immigrationRate: 0.5 },
  roadhouse:  { marriageRate: 0.8, fertilityRate: 0.7, deathRate: 0.3, immigrationRate: 0.5 },
  landing:    { marriageRate: 0.8, fertilityRate: 0.7, deathRate: 0.3, immigrationRate: 0.5 },
  forge:      { marriageRate: 0.8, fertilityRate: 0.7, deathRate: 0.3, immigrationRate: 0.5 },
  chapel:     { marriageRate: 0.8, fertilityRate: 0.7, deathRate: 0.3, immigrationRate: 0.5 },
  homestead:  { marriageRate: 0.8, fertilityRate: 0.9, deathRate: 0.2, immigrationRate: 0.6 },
  market:     { marriageRate: 0.8, fertilityRate: 0.8, deathRate: 0.3, immigrationRate: 0.8 },
  hamlet:     { marriageRate: 0.8, fertilityRate: 0.7, deathRate: 0.3, immigrationRate: 0.2 },
  village:    { marriageRate: 0.8, fertilityRate: 0.7, deathRate: 0.3, immigrationRate: 0.25 },
  town:       { marriageRate: 0.8, fertilityRate: 0.8, deathRate: 0.3, immigrationRate: 1.5 },
  city:       { marriageRate: 0.85, fertilityRate: 0.9, deathRate: 0.25, immigrationRate: 3.0 },
};

export const YEARS_PER_GENERATION = 25;

/** All generation parameters for a settlement */
export interface GenerationParams {
  foundingFamilies: number;
  generations: number;
  marriageRate: number;
  fertilityRate: number;
  deathRate: number;
  immigrationRate: number;
}

/**
 * Compute default generation params from settlement type + founded year.
 */
export function computeGenealogy(type: SettlementType, foundedYear: number): GenerationParams {
  const currentYear = new Date().getFullYear();
  const yearsOld = Math.max(0, currentYear - foundedYear);
  const generations = Math.max(1, Math.min(6, Math.floor(yearsOld / YEARS_PER_GENERATION)));
  const baseFamilies = BASE_FAMILIES[type];
  const defaults = DEFAULT_GEN_PARAMS[type];
  return {
    foundingFamilies: baseFamilies,
    generations: baseFamilies <= 2 ? Math.min(generations, 2) : generations,
    ...defaults,
  };
}

/**
 * Estimate the living population from generation parameters.
 * Simulates generation-by-generation growth with cross-family marriage pooling.
 */
export function estimatePopulation(params: GenerationParams): { living: number; total: number } {
  const { foundingFamilies, generations, marriageRate, fertilityRate, deathRate, immigrationRate } = params;

  // Average children per fertile couple (matches rollChildren distribution)
  const avgChildren = 0.15*1 + 0.25*2 + 0.25*3 + 0.20*4 + 0.10*5 + 0.05*6; // ~2.95

  // Per-generation immigration: ~0.4 * foundingFamilies, min 1
  const immigrantsPerGen = Math.max(1, Math.round(foundingFamilies * 0.4));

  // Track population per generation
  const genPop: number[] = [];

  // Gen 0: founding couples
  genPop.push(foundingFamilies * 2);

  if (generations > 1) {
    // Gen 1: founding children + immigrants (founders immediately have children)
    const foundingChildren = Math.round(foundingFamilies * fertilityRate * avgChildren);
    genPop.push(foundingChildren + immigrantsPerGen);
  }

  for (let g = 2; g < generations; g++) {
    const prev = genPop[g - 1] + immigrantsPerGen;
    // With gender-separated pairing, ~marriageRate of min(males,females) marry
    const pairPool = prev / 2;
    const couples = Math.round(pairPool * marriageRate);
    const fertile = Math.round(couples * fertilityRate);
    const children = Math.round(fertile * avgChildren);
    genPop.push(Math.max(1, children) + immigrantsPerGen);
  }

  // Apply death rates: older generations die based on age at currentYear
  let total = 0;
  let living = 0;
  for (let g = 0; g < genPop.length; g++) {
    // Gen 0 is the oldest; last gen is the youngest
    const genAge = (genPop.length - 1 - g) * 25;
    total += genPop[g];
    if (genAge > 85) {
      // All dead
    } else {
      const survivalRate = 1 - (genAge / 100) * deathRate;
      living += Math.round(genPop[g] * Math.max(0, survivalRate));
    }
  }

  // Immigration adds a percentage on top of the genealogy-generated population
  const immigrants = Math.round(living * immigrationRate);
  living += immigrants;
  total += immigrants;

  return { living: Math.max(1, living), total: Math.max(1, total) };
}

export const PATTERN_LABELS: Record<LayoutPattern, string> = {
  grid: 'Grid',
  linear: 'Linear (main street)',
  waterfront: 'Waterfront',
  hillside: 'Hillside terraces',
  organic: 'Organic / medieval',
  radial: 'Radial',
};

export const PATTERN_DESCRIPTIONS: Record<LayoutPattern, string> = {
  grid: 'Square blocks with perpendicular streets',
  linear: 'Buildings line a central road along the riverbank',
  waterfront: 'Curved streets following the coastline',
  hillside: 'Terraced rows stepping up the mountainside',
  organic: 'Winding streets with irregular blocks',
  radial: 'Streets radiating from a central plaza',
};

import {
  resolveGridLotPosition,
  resolveGridStreet,
  getGridParkBlock,
  generateNonGridLayout,
  resolveStreetLotPosition,
  GRID_SPACING,
  LOTS_COLS,
  LOTS_ROWS,
  type ResolvedLotPosition,
  type StreetDefinition,
} from '@shared/layout-resolver';

/**
 * Settlement Layout Preview — uses the same layout resolver as the server
 * and 3D engine so the preview matches the actual generated layout.
 */
export function SettlementLayoutPreview({ pattern, settlementType, population }: {
  pattern: LayoutPattern;
  settlementType: SettlementType;
  population?: number;
}) {
  const W = 200;
  const H = 140;

  // Estimate lots needed (same math as geography-generator)
  const pop = population || POPULATION_BY_TYPE[settlementType];
  const residences = Math.ceil(pop / 4);
  const businesses = Math.max(1, Math.ceil(pop / 15));
  const lotsNeeded = residences + businesses;

  const elements = useMemo(() => {
    const streets: Array<{ x1: number; y1: number; x2: number; y2: number; main?: boolean }> = [];
    const buildings: Array<{ x: number; y: number; w: number; h: number; biz?: boolean }> = [];
    let parkRect: { x: number; y: number; w: number; h: number } | null = null;

    if (pattern === 'grid') {
      // Compute grid size from population (same as geography-generator)
      const LOTS_PER_BLOCK = LOTS_COLS * LOTS_ROWS;
      const buildableBlocksNeeded = Math.ceil(lotsNeeded / LOTS_PER_BLOCK);
      let gridSize = 2;
      while ((gridSize - 1) * (gridSize - 1) < buildableBlocksNeeded + 1) {
        gridSize++;
      }

      const config = { gridSize, settlementType, centerX: 0, centerZ: 0 };
      const parkBlock = getGridParkBlock(config);

      // Compute bounding box of all positions
      const allPositions: Array<{ x: number; z: number }> = [];
      for (let i = 0; i < gridSize; i++) {
        const ns = resolveGridStreet(i, 'NS', config);
        const ew = resolveGridStreet(i, 'EW', config);
        allPositions.push({ x: ns.x1, z: ns.z1 }, { x: ns.x2, z: ns.z2 });
        allPositions.push({ x: ew.x1, z: ew.z1 }, { x: ew.x2, z: ew.z2 });
      }

      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (const p of allPositions) {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
      }

      const rangeX = maxX - minX || 1;
      const rangeZ = maxZ - minZ || 1;
      const margin = 8;
      const scaleX = (W - margin * 2) / rangeX;
      const scaleZ = (H - margin * 2) / rangeZ;
      const scale = Math.min(scaleX, scaleZ);
      const offsetX = (W - rangeX * scale) / 2 - minX * scale;
      const offsetZ = (H - rangeZ * scale) / 2 - minZ * scale;
      const tx = (x: number) => x * scale + offsetX;
      const tz = (z: number) => z * scale + offsetZ;

      // Draw streets
      for (let i = 0; i < gridSize; i++) {
        const ns = resolveGridStreet(i, 'NS', config);
        streets.push({ x1: tx(ns.x1), y1: tz(ns.z1), x2: tx(ns.x2), y2: tz(ns.z2), main: i === 0 || i === gridSize - 1 });
        const ew = resolveGridStreet(i, 'EW', config);
        streets.push({ x1: tx(ew.x1), y1: tz(ew.z1), x2: tx(ew.x2), y2: tz(ew.z2), main: i === 0 || i === gridSize - 1 });
      }

      // Draw buildings in blocks
      const numBlockCols = gridSize - 1;
      const numBlockRows = gridSize - 1;
      let lotIdx = 0;
      for (let col = 0; col < numBlockCols; col++) {
        for (let row = 0; row < numBlockRows; row++) {
          if (col === parkBlock.col && row === parkBlock.row) {
            // Park block
            const topLeft = resolveGridLotPosition(col, row, 0, config);
            const botRight = resolveGridLotPosition(col, row, LOTS_COLS * LOTS_ROWS - 1, config);
            const px = tx(topLeft.x - topLeft.lotWidth / 2);
            const py = tz(topLeft.z - topLeft.lotDepth / 2);
            const pw = tx(botRight.x + botRight.lotWidth / 2) - px;
            const ph = tz(botRight.z + botRight.lotDepth / 2) - py;
            parkRect = { x: px, y: py, w: pw, h: ph };
            continue;
          }

          for (let li = 0; li < LOTS_COLS * LOTS_ROWS && lotIdx < lotsNeeded; li++) {
            const pos = resolveGridLotPosition(col, row, li, config);
            const bw = pos.lotWidth * scale * 0.7;
            const bh = pos.lotDepth * scale * 0.7;
            buildings.push({
              x: tx(pos.x) - bw / 2,
              y: tz(pos.z) - bh / 2,
              w: bw,
              h: bh,
              biz: lotIdx < businesses,
            });
            lotIdx++;
          }
        }
      }
    } else {
      // Non-grid patterns — use the same layout resolver as the server
      const layoutConfig = { totalLots: lotsNeeded, settlementType, centerX: 0, centerZ: 0 };
      const layout = generateNonGridLayout(pattern, layoutConfig);

      // Compute bounding box
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (const s of layout.streets) {
        for (const wp of s.waypoints) {
          minX = Math.min(minX, wp.x); maxX = Math.max(maxX, wp.x);
          minZ = Math.min(minZ, wp.z); maxZ = Math.max(maxZ, wp.z);
        }
      }
      for (const lot of layout.lots) {
        minX = Math.min(minX, lot.position.x); maxX = Math.max(maxX, lot.position.x);
        minZ = Math.min(minZ, lot.position.z); maxZ = Math.max(maxZ, lot.position.z);
      }

      const rangeX = maxX - minX || 1;
      const rangeZ = maxZ - minZ || 1;
      const margin = 8;
      const scaleX = (W - margin * 2) / rangeX;
      const scaleZ = (H - margin * 2) / rangeZ;
      const scale = Math.min(scaleX, scaleZ);
      const offsetX = (W - rangeX * scale) / 2 - minX * scale;
      const offsetZ = (H - rangeZ * scale) / 2 - minZ * scale;
      const tx = (x: number) => x * scale + offsetX;
      const tz = (z: number) => z * scale + offsetZ;

      // Draw streets
      for (const s of layout.streets) {
        for (let i = 1; i < s.waypoints.length; i++) {
          streets.push({
            x1: tx(s.waypoints[i - 1].x), y1: tz(s.waypoints[i - 1].z),
            x2: tx(s.waypoints[i].x), y2: tz(s.waypoints[i].z),
            main: s.isMain,
          });
        }
      }

      // Draw buildings
      for (let i = 0; i < layout.lots.length; i++) {
        const lot = layout.lots[i];
        const bw = Math.max(2, lot.position.lotWidth * scale * 0.6);
        const bh = Math.max(2, lot.position.lotDepth * scale * 0.6);
        buildings.push({
          x: tx(lot.position.x) - bw / 2,
          y: tz(lot.position.z) - bh / 2,
          w: bw,
          h: bh,
          biz: i < businesses,
        });
      }
    }

    return { streets, buildings, park: parkRect };
  }, [pattern, settlementType, lotsNeeded, businesses]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-md border bg-muted/40" style={{ maxHeight: 160 }}>
        {elements.park && (
          <rect x={elements.park.x} y={elements.park.y} width={elements.park.w} height={elements.park.h}
            fill="#4a7c4f" opacity={0.4} rx={1.5} />
        )}

        {elements.streets.map((s, i) => (
          <line key={`st-${i}`} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={s.main ? '#888' : '#aaa'}
            strokeWidth={s.main ? 2.5 : 1.5} strokeLinecap="round" />
        ))}

        {elements.buildings.map((b, i) => (
          <rect key={`b-${i}`} x={b.x} y={b.y} width={b.w} height={b.h}
            fill={b.biz ? '#5a7fc2' : '#555'}
            rx={0.5} />
        ))}

        {elements.park && Array.from({ length: 7 }).map((_, i) => {
          const p = elements.park!;
          const tx = p.x + 3 + ((i * 7 + 3) % (Math.max(7, p.w - 6)));
          const ty = p.y + 3 + ((i * 11 + 5) % (Math.max(7, p.h - 6)));
          return <circle key={`tree-${i}`} cx={tx} cy={ty} r={1.5} fill="#3d6b41" opacity={0.7} />;
        })}
      </svg>
      <div className="text-center">
        <p className="text-xs font-medium">{PATTERN_LABELS[pattern]}</p>
        <p className="text-[10px] text-muted-foreground">{PATTERN_DESCRIPTIONS[pattern]}</p>
        <p className="text-[10px] text-muted-foreground">~{lotsNeeded} lots</p>
      </div>
    </div>
  );
}
