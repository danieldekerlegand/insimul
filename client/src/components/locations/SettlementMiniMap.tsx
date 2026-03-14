import { useRef, useEffect, useCallback, useState } from 'react';
import { Map, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StreetSegmentData } from './LocationMapPreview';

/** Terrain background colors (CSS) matching LocationMapPreview palette */
const TERRAIN_BG: Record<string, string> = {
  plains: '#5ba530',
  hills: '#8c8c59',
  mountains: '#807366',
  coast: '#66a0b3',
  river: '#4d80b3',
  forest: '#338040',
  desert: '#ccb873',
};

/** Water feature fill colors */
const WATER_FILL: Record<string, string> = {
  ocean: '#0d3373',
  lake: '#265a8c',
  river: '#265a8c',
  pond: '#1f4d6b',
  stream: '#2e66a6',
  waterfall: '#99bfe6',
  marsh: '#2e4733',
  canal: '#1f528c',
};

/** Building marker colors by type */
const BUILDING_COLORS = {
  lot: '#888888',
  business: '#e6a020',
  residence: '#4a90d9',
} as const;

export interface SettlementMiniMapProps {
  terrain?: string | null;
  streets: StreetSegmentData[];
  lots: any[];
  businesses: any[];
  residences: any[];
  waterFeatures: any[];
  settlementType?: string;
  /** Called when user clicks a position on the mini-map (normalized 0-1 coords) */
  onPositionClick?: (x: number, z: number) => void;
}

/** Settlement scale affects the coordinate space */
const SETTLEMENT_EXTENT: Record<string, number> = {
  city: 60,
  town: 45,
  village: 30,
};

export function SettlementMiniMap({
  terrain,
  streets,
  lots,
  businesses,
  residences,
  waterFeatures,
  settlementType,
  onPositionClick,
}: SettlementMiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const size = 180;

  const getExtent = useCallback(() => {
    return SETTLEMENT_EXTENT[settlementType ?? 'town'] ?? 45;
  }, [settlementType]);

  /** Convert world coords to canvas pixel coords */
  const toCanvas = useCallback(
    (wx: number, wz: number, extent: number): [number, number] => {
      const cx = ((wx + extent) / (2 * extent)) * size;
      const cy = ((wz + extent) / (2 * extent)) * size;
      return [cx, cy];
    },
    [size],
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const extent = getExtent();

    // --- Background ---
    const bg = TERRAIN_BG[(terrain ?? 'plains').toLowerCase()] ?? TERRAIN_BG.plains;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    // --- Water features ---
    for (const wf of waterFeatures) {
      const wfType = (wf.type ?? 'lake').toLowerCase();
      ctx.fillStyle = WATER_FILL[wfType] ?? WATER_FILL.lake;
      ctx.globalAlpha = 0.7;

      if (wf.path && Array.isArray(wf.path) && wf.path.length > 1) {
        // River/stream: draw as thick line
        ctx.beginPath();
        const width = wfType === 'river' || wfType === 'stream' ? 3 : 2;
        ctx.lineWidth = width;
        ctx.strokeStyle = ctx.fillStyle;
        const [sx, sy] = toCanvas(wf.path[0].x ?? 0, wf.path[0].z ?? 0, extent);
        ctx.moveTo(sx, sy);
        for (let i = 1; i < wf.path.length; i++) {
          const [px, py] = toCanvas(wf.path[i].x ?? 0, wf.path[i].z ?? 0, extent);
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else if (wf.position) {
        // Area water: draw as circle
        const [cx, cy] = toCanvas(wf.position.x ?? 0, wf.position.z ?? 0, extent);
        const r = Math.max(4, ((wf.radius ?? 5) / (2 * extent)) * size);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // --- Streets ---
    ctx.strokeStyle = '#d4c8a0';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (const street of streets) {
      if (!street.waypoints || street.waypoints.length < 2) continue;
      ctx.beginPath();
      const [sx, sy] = toCanvas(street.waypoints[0].x, street.waypoints[0].z, extent);
      ctx.moveTo(sx, sy);
      for (let i = 1; i < street.waypoints.length; i++) {
        const [px, py] = toCanvas(street.waypoints[i].x, street.waypoints[i].z, extent);
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // --- Lots ---
    for (const lot of lots) {
      const pos = lot.position ?? lot.coordinates;
      if (!pos) continue;
      const [cx, cy] = toCanvas(pos.x ?? 0, pos.z ?? 0, extent);
      ctx.fillStyle = BUILDING_COLORS.lot;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(cx - 2, cy - 2, 4, 4);
      ctx.globalAlpha = 1;
    }

    // --- Businesses ---
    for (const biz of businesses) {
      const pos = biz.position ?? biz.coordinates;
      if (!pos) continue;
      const [cx, cy] = toCanvas(pos.x ?? 0, pos.z ?? 0, extent);
      ctx.fillStyle = BUILDING_COLORS.business;
      ctx.fillRect(cx - 2.5, cy - 2.5, 5, 5);
    }

    // --- Residences ---
    for (const res of residences) {
      const pos = res.position ?? res.coordinates;
      if (!pos) continue;
      const [cx, cy] = toCanvas(pos.x ?? 0, pos.z ?? 0, extent);
      ctx.fillStyle = BUILDING_COLORS.residence;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Border ---
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  }, [terrain, streets, lots, businesses, residences, waterFeatures, getExtent, toCanvas]);

  useEffect(() => {
    if (!collapsed) draw();
  }, [draw, collapsed]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onPositionClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const z = (e.clientY - rect.top) / rect.height;
    onPositionClick(x, z);
  };

  if (collapsed) {
    return (
      <div className="absolute bottom-3 right-3 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 shadow-md"
          onClick={() => setCollapsed(false)}
          title="Show mini-map"
        >
          <Map className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="absolute bottom-3 right-3 z-10 rounded-lg overflow-hidden shadow-lg border border-white/20"
      style={{ width: size, height: size + 28 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-1 bg-black/70 text-white">
        <span className="text-[10px] font-semibold uppercase tracking-wider">Mini-map</span>
        <button
          className="p-0.5 rounded hover:bg-white/20 transition-colors"
          onClick={() => setCollapsed(true)}
          title="Collapse mini-map"
        >
          <Minimize2 className="w-3 h-3" />
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block cursor-crosshair"
        onClick={handleCanvasClick}
      />

      {/* Legend */}
      <div className="flex items-center gap-2 px-2 py-0.5 bg-black/70 text-[9px] text-white/80">
        <span className="flex items-center gap-0.5">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: BUILDING_COLORS.business }} />
          Biz
        </span>
        <span className="flex items-center gap-0.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: BUILDING_COLORS.residence }} />
          Res
        </span>
        <span className="flex items-center gap-0.5">
          <span className="inline-block w-2 h-2 rounded-sm" style={{ background: BUILDING_COLORS.lot }} />
          Lot
        </span>
        <span className="flex items-center gap-0.5">
          <span className="inline-block w-2 h-0.5" style={{ background: '#d4c8a0' }} />
          St
        </span>
      </div>
    </div>
  );
}
