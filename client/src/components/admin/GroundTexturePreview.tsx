/**
 * Preview component for ground/terrain textures.
 * Shows a tiled texture image (asset mode) or flat color (procedural mode)
 * on a surface appropriate to the ground type.
 */

interface GroundTexturePreviewProps {
  /** Ground type for shape hint */
  groundType: string;
  /** Texture image URL (asset mode) */
  textureUrl?: string;
  /** Fallback color hex (procedural mode) */
  color?: string;
  /** Tiling factor — higher = more tiles visible */
  tiling?: number;
  /** Preview height in px */
  height?: number;
}

export function GroundTexturePreview({
  groundType,
  textureUrl,
  color = "#5a8a5a",
  tiling = 4,
  height = 180,
}: GroundTexturePreviewProps) {
  // Road/sidewalk: narrower strip; ground: full square
  const isStrip = groundType === "road" || groundType === "sidewalk";
  // Scale tiling to a visible CSS background-size
  const tileSizePx = Math.max(16, Math.round(200 / tiling));

  const surfaceStyle: React.CSSProperties = textureUrl
    ? {
        backgroundImage: `url(${textureUrl})`,
        backgroundSize: `${tileSizePx}px ${tileSizePx}px`,
        backgroundRepeat: "repeat",
      }
    : {
        backgroundColor: color,
      };

  return (
    <div
      className="relative rounded-lg border overflow-hidden bg-muted/30"
      style={{ height }}
    >
      {/* Dark background to simulate scene */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "#1e1e26" }}>
        {/* Surface patch */}
        <div
          className="rounded-sm shadow-inner"
          style={{
            ...surfaceStyle,
            width: isStrip ? "40%" : "85%",
            height: isStrip ? "90%" : "85%",
            imageRendering: "auto",
          }}
        />
      </div>

      {/* Label overlay */}
      <div className="absolute bottom-1 right-2">
        <span className="text-[9px] text-white/40">
          {textureUrl ? `${tiling}x tiling` : "procedural"}
        </span>
      </div>
    </div>
  );
}
