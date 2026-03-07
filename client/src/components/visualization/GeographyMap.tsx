import { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Maximize2, MapPin } from 'lucide-react';

// ─── Layout constants ─────────────────────────────────────────────────────────

const SETT_COLS = 4;      // max settlements per row within a country region
const SETT_STRIDE = 58;   // px between settlement centers
const C_PAD = 20;         // padding inside country rect
const C_HEADER_H = 40;    // height of the country name header
const C_MIN_W = 200;      // minimum country rect width
const WORLD_COLS = 3;     // countries per row in the world layout
const C_GAP = 32;         // gap between country rects
const WORLD_PAD = 40;     // outer padding

// ─── Color helpers ────────────────────────────────────────────────────────────

const TERRAIN_FILL: Record<string, string> = {
  plains:    '#bbf7d0',
  mountains: '#e2e8f0',
  forest:    '#86efac',
  desert:    '#fef08a',
  coastal:   '#bae6fd',
  tundra:    '#dbeafe',
  swamp:     '#a7f3d0',
  jungle:    '#6ee7b7',
};

const TYPE_STROKE: Record<string, string> = {
  city:    '#7c3aed',
  town:    '#2563eb',
  village: '#16a34a',
};

const TYPE_RADIUS: Record<string, number> = {
  city:    18,
  town:    13,
  village: 9,
};

function terrainFill(terrain: string | null): string {
  return TERRAIN_FILL[terrain?.toLowerCase() ?? ''] ?? '#e5e7eb';
}

function typeStroke(type: string | null): string {
  return TYPE_STROKE[type?.toLowerCase() ?? ''] ?? '#6b7280';
}

function typeRadius(type: string | null): number {
  return TYPE_RADIUS[type?.toLowerCase() ?? ''] ?? 11;
}

// ─── Layout computation ───────────────────────────────────────────────────────

interface Region {
  label: string;
  isUnaffiliated: boolean;
  settlements: any[];
  x: number;
  y: number;
  w: number;
  h: number;
}

function computeLayout(countries: any[], settlements: any[]): {
  regions: Region[];
  totalW: number;
  totalH: number;
} {
  // Group settlements by countryId
  const byCountry = new Map<string | null, any[]>();
  settlements.forEach(s => {
    const k = s.countryId ?? null;
    if (!byCountry.has(k)) byCountry.set(k, []);
    byCountry.get(k)!.push(s);
  });

  const regions: Omit<Region, 'x' | 'y'>[] = [];

  // One region per country (including empty countries)
  for (const country of countries) {
    const setts = byCountry.get(country.id) ?? [];
    const cols = Math.min(Math.max(setts.length, 1), SETT_COLS);
    const rows = Math.max(1, Math.ceil(setts.length / SETT_COLS));
    const w = Math.max(C_MIN_W, cols * SETT_STRIDE + C_PAD * 2);
    const h = C_HEADER_H + rows * SETT_STRIDE + C_PAD;
    regions.push({ label: country.name, isUnaffiliated: false, settlements: setts, w, h });
  }

  // One region for unaffiliated settlements (if any)
  const unaffiliated = byCountry.get(null) ?? [];
  if (unaffiliated.length > 0) {
    const cols = Math.min(unaffiliated.length, SETT_COLS);
    const rows = Math.ceil(unaffiliated.length / SETT_COLS);
    const w = Math.max(C_MIN_W, cols * SETT_STRIDE + C_PAD * 2);
    const h = C_HEADER_H + rows * SETT_STRIDE + C_PAD;
    regions.push({ label: 'Unaffiliated', isUnaffiliated: true, settlements: unaffiliated, w, h });
  }

  if (regions.length === 0) {
    return { regions: [], totalW: 400, totalH: 200 };
  }

  // Arrange regions into WORLD_COLS columns, stacking top-to-bottom
  const colWidths: number[] = Array(WORLD_COLS).fill(0);
  const colHeights: number[] = Array(WORLD_COLS).fill(WORLD_PAD);
  const placed: Region[] = regions.map((r, i) => {
    const col = i % WORLD_COLS;
    const x = 0; // placeholder, assigned below
    const y = colHeights[col];
    colHeights[col] += r.h + C_GAP;
    colWidths[col] = Math.max(colWidths[col], r.w);
    return { ...r, x, y };
  });

  // Now assign x positions based on actual column widths
  const colX: number[] = [WORLD_PAD];
  for (let c = 1; c < WORLD_COLS; c++) {
    colX[c] = colX[c - 1] + colWidths[c - 1] + C_GAP;
  }
  placed.forEach((r, i) => { r.x = colX[i % WORLD_COLS]; });

  const usedCols = Math.min(WORLD_COLS, regions.length);
  const totalW = colX[usedCols - 1] + colWidths[usedCols - 1] + WORLD_PAD;
  const totalH = Math.max(...colHeights) + WORLD_PAD;

  return { regions: placed, totalW, totalH };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GeographyMapProps {
  worldId: string;
  settlements?: any[];
  countries?: any[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GeographyMap({ settlements = [], countries = [] }: GeographyMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);

  // Drag state kept in refs to avoid re-renders during drag
  const dragging = useRef(false);
  const dragOrigin = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const { regions, totalW, totalH } = useMemo(
    () => computeLayout(countries, settlements),
    [countries, settlements]
  );

  // ── Pointer events for pan ──────────────────────────────────────────────────

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    dragging.current = true;
    dragOrigin.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    setTransform(t => ({
      ...t,
      x: dragOrigin.current.tx + e.clientX - dragOrigin.current.x,
      y: dragOrigin.current.ty + e.clientY - dragOrigin.current.y,
    }));
  };

  const onPointerUp = () => { dragging.current = false; };

  const onWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const rect = svgRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setTransform(t => ({
      scale: Math.max(0.15, Math.min(5, t.scale * factor)),
      x: mx - (mx - t.x) * factor,
      y: my - (my - t.y) * factor,
    }));
  };

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // ── Empty state ─────────────────────────────────────────────────────────────

  if (countries.length === 0 && settlements.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 border rounded-lg bg-muted/20 text-muted-foreground text-sm">
        No geographic data yet. Add countries and settlements first.
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const { x: tx, y: ty, scale } = transform;

  return (
    <div className="flex gap-4 h-[640px]">
      {/* Map SVG */}
      <div className="flex-1 relative border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-white/80 dark:bg-black/50"
            onClick={() => setTransform(t => ({ ...t, scale: Math.min(5, t.scale * 1.25) }))}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-white/80 dark:bg-black/50"
            onClick={() => setTransform(t => ({ ...t, scale: Math.max(0.15, t.scale * 0.8) }))}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-white/80 dark:bg-black/50"
            onClick={resetView}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${totalW} ${totalH}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ cursor: dragging.current ? 'grabbing' : 'grab', userSelect: 'none' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        >
          <g transform={`translate(${tx},${ty}) scale(${scale})`}>
            {regions.map((region, ri) => {
              const isUnaffiliated = region.isUnaffiliated;
              return (
                <g key={ri} transform={`translate(${region.x},${region.y})`}>
                  {/* Country background */}
                  <rect
                    x={0}
                    y={0}
                    width={region.w}
                    height={region.h}
                    rx={12}
                    fill={isUnaffiliated ? '#f4f4f5' : '#eff6ff'}
                    stroke={isUnaffiliated ? '#a1a1aa' : '#93c5fd'}
                    strokeWidth={1.5}
                    strokeDasharray={isUnaffiliated ? '6 3' : undefined}
                  />
                  {/* Country name */}
                  <text
                    x={region.w / 2}
                    y={24}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight="600"
                    fill={isUnaffiliated ? '#71717a' : '#1e40af'}
                    fontFamily="sans-serif"
                  >
                    {region.label}
                  </text>
                  {/* Divider */}
                  <line
                    x1={C_PAD}
                    y1={C_HEADER_H - 6}
                    x2={region.w - C_PAD}
                    y2={C_HEADER_H - 6}
                    stroke={isUnaffiliated ? '#d4d4d8' : '#bfdbfe'}
                    strokeWidth={1}
                  />

                  {/* Settlement nodes */}
                  {region.settlements.map((s, si) => {
                    const col = si % SETT_COLS;
                    const row = Math.floor(si / SETT_COLS);
                    const cx = C_PAD + col * SETT_STRIDE + SETT_STRIDE / 2;
                    const cy = C_HEADER_H + row * SETT_STRIDE + SETT_STRIDE / 2;
                    const r = typeRadius(s.settlementType);
                    const isSelected = selectedSettlement?.id === s.id;

                    return (
                      <g
                        key={s.id}
                        transform={`translate(${cx},${cy})`}
                        style={{ cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); setSelectedSettlement(s); }}
                      >
                        {/* Selection ring */}
                        {isSelected && (
                          <circle r={r + 7} fill="none" stroke="#f59e0b" strokeWidth={2.5} />
                        )}
                        {/* Main circle */}
                        <circle
                          r={r}
                          fill={terrainFill(s.terrain)}
                          stroke={typeStroke(s.settlementType)}
                          strokeWidth={2}
                        />
                        {/* Settlement initial */}
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={r > 13 ? 10 : 8}
                          fontWeight="700"
                          fill={typeStroke(s.settlementType)}
                          fontFamily="sans-serif"
                        >
                          {s.settlementType?.[0]?.toUpperCase() ?? '?'}
                        </text>
                        {/* Settlement name below */}
                        <text
                          y={r + 12}
                          textAnchor="middle"
                          fontSize={9}
                          fill="#374151"
                          fontFamily="sans-serif"
                        >
                          {s.name}
                        </text>
                      </g>
                    );
                  })}

                  {/* Empty country message */}
                  {region.settlements.length === 0 && (
                    <text
                      x={region.w / 2}
                      y={C_HEADER_H + SETT_STRIDE / 2 + 4}
                      textAnchor="middle"
                      fontSize={11}
                      fill="#9ca3af"
                      fontFamily="sans-serif"
                    >
                      No settlements
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Detail panel */}
      <div className="w-64 shrink-0 flex flex-col gap-3">
        {/* Legend */}
        <div className="border rounded-lg p-4 bg-white dark:bg-white/5 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Legend</p>
          <div className="space-y-1.5">
            {[
              { label: 'City', stroke: TYPE_STROKE.city, r: 8 },
              { label: 'Town', stroke: TYPE_STROKE.town, r: 6 },
              { label: 'Village', stroke: TYPE_STROKE.village, r: 4.5 },
            ].map(({ label, stroke, r }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <svg width={18} height={18}>
                  <circle cx={9} cy={9} r={r} fill="#e5e7eb" stroke={stroke} strokeWidth={2} />
                </svg>
                {label}
              </div>
            ))}
          </div>
          <div className="border-t pt-2 space-y-1.5">
            <p className="text-xs text-muted-foreground">Terrain fill</p>
            {Object.entries(TERRAIN_FILL).slice(0, 4).map(([terrain, color]) => (
              <div key={terrain} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full border border-gray-300" style={{ background: color }} />
                <span className="capitalize">{terrain}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected settlement detail */}
        {selectedSettlement ? (
          <div className="border rounded-lg p-4 bg-white dark:bg-white/5 space-y-3 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-base leading-tight">{selectedSettlement.name}</p>
                <Badge
                  variant="secondary"
                  className="mt-1 text-xs"
                  style={{
                    background: terrainFill(selectedSettlement.terrain),
                    color: typeStroke(selectedSettlement.settlementType),
                    border: `1px solid ${typeStroke(selectedSettlement.settlementType)}40`,
                  }}
                >
                  {selectedSettlement.settlementType}
                </Badge>
              </div>
              <button
                onClick={() => setSelectedSettlement(null)}
                className="text-muted-foreground hover:text-foreground text-xs mt-0.5"
              >
                ✕
              </button>
            </div>

            {selectedSettlement.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedSettlement.description}
              </p>
            )}

            <div className="space-y-1.5 text-xs">
              {[
                ['Population', selectedSettlement.population?.toLocaleString() ?? '—'],
                ['Terrain', selectedSettlement.terrain ?? '—'],
                ['Founded', selectedSettlement.foundedYear ?? 'Unknown'],
                ['Generation', selectedSettlement.currentGeneration ?? '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4 bg-white dark:bg-white/5 flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-6 h-6 opacity-30" />
            <p className="text-xs text-center">Click a settlement node to see its details</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          {settlements.length} settlement{settlements.length !== 1 ? 's' : ''} across {countries.length} countr{countries.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>
    </div>
  );
}
