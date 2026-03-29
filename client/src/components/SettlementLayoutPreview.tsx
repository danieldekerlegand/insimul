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
  selectStreetPattern,
  getGridLotCount,
  GRID_SIZE,
  type LayoutPattern,
} from '@shared/street-pattern-selection';

export type SettlementType = 'dwelling' | 'roadhouse' | 'homestead' | 'hamlet' | 'village' | 'town' | 'city';

export const POPULATION_BY_TYPE: Record<SettlementType, number> = {
  dwelling: 3,
  roadhouse: 3,
  homestead: 10,
  hamlet: 50,
  village: 100,
  town: 1000,
  city: 5000,
};

export const BASE_FAMILIES: Record<SettlementType, number> = {
  dwelling: 1,
  roadhouse: 1,
  homestead: 2,
  hamlet: 3,
  village: 5,
  town: 15,
  city: 50,
};

export const YEARS_PER_GENERATION = 25;

/**
 * Compute founding families and generations from settlement type + founded year.
 */
export function computeGenealogy(type: SettlementType, foundedYear: number): { foundingFamilies: number; generations: number } {
  const currentYear = new Date().getFullYear();
  const yearsOld = Math.max(0, currentYear - foundedYear);
  const generations = Math.max(1, Math.min(6, Math.floor(yearsOld / YEARS_PER_GENERATION)));
  const baseFamilies = BASE_FAMILIES[type];
  const generationScale = Math.max(0.5, 2.0 - (generations - 1) * 0.3);
  const foundingFamilies = Math.max(2, Math.min(60, Math.round(baseFamilies * generationScale)));
  return { foundingFamilies, generations };
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

const SERVER_GRID_SIZE = GRID_SIZE as Record<SettlementType, number>;

function getLotCount(type: SettlementType): number {
  return getGridLotCount(type);
}

export function selectPattern(terrain: string, settlementType: SettlementType, foundedYear: number): LayoutPattern {
  return selectStreetPattern({
    terrain,
    settlementType,
    foundedYear,
    population: POPULATION_BY_TYPE[settlementType],
  });
}

/** Seeded random so the preview is stable for a given type+terrain combo */
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed & 0x7fffffff) / 0x7fffffff;
  };
}

export function SettlementLayoutPreview({ pattern, settlementType, terrain }: {
  pattern: LayoutPattern;
  settlementType: SettlementType;
  terrain: string;
}) {
  const W = 200;
  const H = 140;
  const cx = W / 2;
  const cy = H / 2;
  const buildingCount = getLotCount(settlementType);

  const elements = useMemo(() => {
    const streets: Array<{ x1: number; y1: number; x2: number; y2: number; main?: boolean }> = [];
    const buildings: Array<{ x: number; y: number; w: number; h: number; biz?: boolean }> = [];
    let park: { x: number; y: number; w: number; h: number } | null = null;

    const bw = 4;
    const bh = 4;
    const gap = 1.5;

    switch (pattern) {
      case 'grid': {
        const gridSize = SERVER_GRID_SIZE[settlementType];
        const cols = gridSize - 1;
        const rows = gridSize - 1;
        const streetW = cols <= 3 ? 3 : cols <= 5 ? 2 : 1.5;
        const blockW = (W - (cols + 1) * streetW) / cols;
        const blockH = (H - (rows + 1) * streetW) / rows;
        const ox = streetW;
        const oy = streetW;

        for (let c = 0; c <= cols; c++) {
          const sx = ox + c * (blockW + streetW) - streetW / 2;
          streets.push({ x1: sx, y1: 0, x2: sx, y2: H, main: c === 0 || c === cols });
        }
        for (let r = 0; r <= rows; r++) {
          const sy = oy + r * (blockH + streetW) - streetW / 2;
          streets.push({ x1: 0, y1: sy, x2: W, y2: sy, main: r === 0 || r === rows });
        }

        const parkCol = Math.floor(cols / 2);
        const parkRow = Math.floor(rows / 2);
        const LOTS_COLS = 3;
        const LOTS_ROWS = 2;
        const inset = Math.max(0.5, blockW * 0.08);
        const bizCount = Math.ceil(buildingCount * 0.3);

        const bizSet = new Set<number>();
        const bizRng = seededRandom(42);
        while (bizSet.size < bizCount) {
          bizSet.add(Math.floor(bizRng() * buildingCount));
        }

        let placed = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const bx0 = ox + c * (blockW + streetW);
            const by0 = oy + r * (blockH + streetW);

            if (r === parkRow && c === parkCol) {
              park = { x: bx0 + 1, y: by0 + 1, w: blockW - 2, h: blockH - 2 };
              continue;
            }

            const lotW = (blockW - inset * 2) / LOTS_COLS;
            const lotH = (blockH - inset * 2) / LOTS_ROWS;
            const bldgW = lotW * 0.75;
            const bldgH = lotH * 0.75;

            for (let lr = 0; lr < LOTS_ROWS; lr++) {
              for (let lc = 0; lc < LOTS_COLS; lc++) {
                if (placed >= buildingCount) break;
                const lx = bx0 + inset + lc * lotW + (lotW - bldgW) / 2;
                const ly = by0 + inset + lr * lotH + (lotH - bldgH) / 2;
                buildings.push({ x: lx, y: ly, w: bldgW, h: bldgH, biz: bizSet.has(placed) });
                placed++;
              }
            }
          }
        }
        break;
      }
      case 'linear': {
        const mainY = cy;
        streets.push({ x1: 10, y1: mainY, x2: W - 10, y2: mainY, main: true });
        const sideCount = settlementType === 'hamlet' ? 2 : settlementType === 'village' ? 3 : 5;
        for (let i = 0; i < sideCount; i++) {
          const sx = 30 + i * ((W - 60) / Math.max(1, sideCount - 1));
          streets.push({ x1: sx, y1: mainY - 30, x2: sx, y2: mainY + 30 });
        }

        let placed = 0;
        const perSide = Math.ceil(buildingCount / 2);
        const sp = Math.min(bw + gap, (W - 20) / perSide);
        for (let side = 0; side < 2 && placed < buildingCount; side++) {
          const by = side === 0 ? mainY - bh - 3 : mainY + 3;
          for (let i = 0; i < perSide && placed < buildingCount; i++) {
            buildings.push({ x: 12 + i * sp, y: by, w: bw, h: bh, biz: placed < 4 });
            placed++;
          }
        }
        break;
      }
      case 'waterfront': {
        const shoreY = 20;
        streets.push({ x1: 10, y1: shoreY + 15, x2: W - 10, y2: shoreY + 15, main: true });
        streets.push({ x1: 15, y1: shoreY + 40, x2: W - 15, y2: shoreY + 40 });
        streets.push({ x1: 20, y1: shoreY + 65, x2: W - 20, y2: shoreY + 65 });
        for (let i = 0; i < 5; i++) {
          const sx = 25 + i * (W - 50) / 4;
          streets.push({ x1: sx, y1: shoreY + 5, x2: sx, y2: H - 5 });
        }

        let placed = 0;
        for (let row = 0; row < 3 && placed < buildingCount; row++) {
          const by = shoreY + 19 + row * 25;
          const cols = Math.floor((W - 30) / (bw + gap));
          for (let i = 0; i < cols && placed < buildingCount; i++) {
            buildings.push({ x: 15 + i * (bw + gap), y: by, w: bw, h: bh, biz: placed < 5 });
            placed++;
          }
        }
        break;
      }
      case 'hillside': {
        const terraces = settlementType === 'hamlet' ? 3 : settlementType === 'village' ? 4 : 5;
        const terraceH = (H - 15) / terraces;
        for (let t = 0; t < terraces; t++) {
          const ty = 8 + t * terraceH;
          const indent = t * 10;
          streets.push({ x1: 10 + indent, y1: ty, x2: W - 10 - indent, y2: ty, main: t === 0 });
        }

        let placed = 0;
        for (let t = 0; t < terraces && placed < buildingCount; t++) {
          const ty = 11 + t * terraceH;
          const indent = t * 10;
          const rowWidth = W - 20 - indent * 2;
          const perRow = Math.max(1, Math.floor(rowWidth / (bw + gap)));
          for (let i = 0; i < perRow && placed < buildingCount; i++) {
            buildings.push({
              x: 12 + indent + i * (bw + gap), y: ty,
              w: bw, h: bh, biz: placed < 3,
            });
            placed++;
          }
        }
        break;
      }
      case 'organic': {
        const mainPts = [
          { x: 12, y: cy + 10 },
          { x: cx * 0.55, y: cy - 18 },
          { x: cx, y: cy + 6 },
          { x: cx * 1.45, y: cy - 12 },
          { x: W - 12, y: cy + 4 },
        ];
        for (let i = 0; i < mainPts.length - 1; i++)
          streets.push({ x1: mainPts[i].x, y1: mainPts[i].y, x2: mainPts[i + 1].x, y2: mainPts[i + 1].y, main: true });

        const sideLanes = [
          { x1: cx * 0.55, y1: cy - 18, x2: cx * 0.35, y2: 10 },
          { x1: cx * 0.55, y1: cy - 18, x2: cx * 0.7, y2: H - 10 },
          { x1: cx, y1: cy + 6, x2: cx - 15, y2: H - 8 },
          { x1: cx, y1: cy + 6, x2: cx + 20, y2: 10 },
          { x1: cx * 1.45, y1: cy - 12, x2: cx * 1.55, y2: H - 12 },
          { x1: cx * 1.45, y1: cy - 12, x2: W - 25, y2: 12 },
        ];
        for (const sl of sideLanes) streets.push(sl);
        streets.push({ x1: cx * 0.35, y1: cy + 20, x2: cx * 1.55, y2: cy + 22 });

        const allOrgSegs = [...streets];
        let placed = 0;
        const orgBizCount = Math.ceil(buildingCount * 0.25);
        const orgBizRng = seededRandom(77);
        const orgBizSet = new Set<number>();
        while (orgBizSet.size < orgBizCount) orgBizSet.add(Math.floor(orgBizRng() * buildingCount));

        for (const seg of allOrgSegs) {
          if (placed >= buildingCount) break;
          const sdx = seg.x2 - seg.x1;
          const sdy = seg.y2 - seg.y1;
          const slen = Math.sqrt(sdx * sdx + sdy * sdy);
          if (slen < 8) continue;
          const snx = -sdy / slen;
          const sny = sdx / slen;
          const step = Math.max(bw + 0.5, slen / Math.ceil(slen / (bw + 1)));
          const steps = Math.floor(slen / step);
          for (let side = -1; side <= 1; side += 2) {
            const offset = side * (bw * 0.6 + 1);
            for (let s = 0; s < steps && placed < buildingCount; s++) {
              const t = (s + 0.5) / steps;
              const bx = seg.x1 + sdx * t + snx * offset - bw / 2;
              const by = seg.y1 + sdy * t + sny * offset - bh / 2;
              if (bx > 1 && bx < W - bw - 1 && by > 1 && by < H - bh - 1) {
                buildings.push({ x: bx, y: by, w: bw, h: bh, biz: orgBizSet.has(placed) });
                placed++;
              }
            }
          }
        }
        break;
      }
      case 'radial': {
        const spokeCount = settlementType === 'city' ? 8 : 6;
        const ringCount = settlementType === 'city' ? 4 : 3;
        const maxR = Math.min(cx, cy) - 4;
        const centerR = 8;

        for (let s = 0; s < spokeCount; s++) {
          const angle = (s / spokeCount) * Math.PI * 2;
          streets.push({
            x1: cx + Math.cos(angle) * centerR,
            y1: cy + Math.sin(angle) * centerR * 0.75,
            x2: cx + Math.cos(angle) * maxR,
            y2: cy + Math.sin(angle) * maxR * 0.75,
            main: s % Math.floor(spokeCount / 2) === 0,
          });
        }

        for (let r = 1; r <= ringCount; r++) {
          const ringR = centerR + (maxR - centerR) * (r / ringCount);
          for (let s = 0; s < spokeCount; s++) {
            const a1 = (s / spokeCount) * Math.PI * 2;
            const a2 = ((s + 1) / spokeCount) * Math.PI * 2;
            streets.push({
              x1: cx + Math.cos(a1) * ringR,
              y1: cy + Math.sin(a1) * ringR * 0.75,
              x2: cx + Math.cos(a2) * ringR,
              y2: cy + Math.sin(a2) * ringR * 0.75,
            });
          }
        }

        let placed = 0;
        const radBizCount = Math.ceil(buildingCount * 0.3);
        const radBizRng = seededRandom(99);
        const radBizSet = new Set<number>();
        while (radBizSet.size < radBizCount) radBizSet.add(Math.floor(radBizRng() * buildingCount));

        for (let r = 0; r < ringCount && placed < buildingCount; r++) {
          const innerR = centerR + (maxR - centerR) * (r / ringCount);
          const outerR = centerR + (maxR - centerR) * ((r + 1) / ringCount);
          const midR = (innerR + outerR) / 2;
          const spotsPerWedge = Math.max(1, Math.floor((midR * Math.PI * 2 / spokeCount) / (bw + 1)));
          for (let s = 0; s < spokeCount && placed < buildingCount; s++) {
            const a1 = (s / spokeCount) * Math.PI * 2;
            const a2 = ((s + 1) / spokeCount) * Math.PI * 2;
            for (let b = 0; b < spotsPerWedge && placed < buildingCount; b++) {
              const t = (b + 0.5) / spotsPerWedge;
              const angle = a1 + (a2 - a1) * t;
              const bx = cx + Math.cos(angle) * midR - bw / 2;
              const by = cy + Math.sin(angle) * midR * 0.75 - bh / 2;
              if (bx > 1 && bx < W - bw - 1 && by > 1 && by < H - bh - 1) {
                buildings.push({ x: bx, y: by, w: bw, h: bh, biz: radBizSet.has(placed) });
                placed++;
              }
            }
          }
        }

        park = { x: cx - centerR, y: cy - centerR * 0.75, w: centerR * 2, h: centerR * 1.5 };
        break;
      }
    }

    return { streets, buildings, park };
  }, [pattern, settlementType, terrain, buildingCount]);

  const waterPath = useMemo(() => {
    if (terrain === 'coast') {
      return <path d={`M0,0 L${W},0 L${W},18 Q${W * 0.75},24 ${cx},20 Q${W * 0.25},16 0,22 Z`} fill="#5b9bd5" opacity={0.3} />;
    }
    if (terrain === 'river') {
      return <path d={`M-2,${cy} Q${W * 0.3},${cy - 10} ${cx},${cy} Q${W * 0.7},${cy + 10} ${W + 2},${cy}`} fill="none" stroke="#5b9bd5" strokeWidth={5} opacity={0.25} />;
    }
    return null;
  }, [terrain]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-md border bg-muted/40" style={{ maxHeight: 160 }}>
        {waterPath}

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
          const tx = p.x + 3 + ((i * 7 + 3) % (p.w - 6));
          const ty = p.y + 3 + ((i * 11 + 5) % (p.h - 6));
          return <circle key={`tree-${i}`} cx={tx} cy={ty} r={1.5} fill="#3d6b41" opacity={0.7} />;
        })}
      </svg>
      <div className="text-center">
        <p className="text-xs font-medium">{PATTERN_LABELS[pattern]}</p>
        <p className="text-[10px] text-muted-foreground">{PATTERN_DESCRIPTIONS[pattern]}</p>
        <p className="text-[10px] text-muted-foreground">{getLotCount(settlementType)} lots</p>
      </div>
    </div>
  );
}
