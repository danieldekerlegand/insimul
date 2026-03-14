/**
 * MinimapTerrainRenderer
 *
 * Generates a terrain-colored background image for the minimap by sampling
 * the heightmap and mapping elevation values to biome-appropriate colors.
 */

/** RGB color tuple [0–255] */
export type RGB = [number, number, number];

/** Elevation zone color palette for a biome */
export interface TerrainColorPalette {
  /** Water / very low areas */
  water: RGB;
  /** Lowland (elevation 0–0.25) */
  lowland: RGB;
  /** Midland (elevation 0.25–0.55) */
  midland: RGB;
  /** Highland (elevation 0.55–0.80) */
  highland: RGB;
  /** Alpine (elevation 0.80–1.0) */
  alpine: RGB;
}

/**
 * Built-in terrain color palettes keyed by biome name.
 * Colors are chosen to match ProceduralNatureGenerator biome presets.
 */
export const TERRAIN_PALETTES: Record<string, TerrainColorPalette> = {
  forest: {
    water: [40, 80, 120],
    lowland: [35, 100, 30],
    midland: [50, 128, 38],
    highland: [90, 110, 80],
    alpine: [160, 160, 155],
  },
  plains: {
    water: [40, 80, 120],
    lowland: [60, 130, 40],
    midland: [77, 153, 51],
    highland: [110, 128, 90],
    alpine: [170, 170, 160],
  },
  mountains: {
    water: [35, 70, 110],
    lowland: [55, 105, 45],
    midland: [64, 115, 51],
    highland: [115, 115, 128],
    alpine: [200, 200, 210],
  },
  desert: {
    water: [50, 90, 120],
    lowland: [178, 153, 102],
    midland: [165, 140, 90],
    highland: [140, 120, 80],
    alpine: [180, 170, 150],
  },
  tundra: {
    water: [30, 60, 100],
    lowland: [128, 153, 128],
    midland: [140, 160, 140],
    highland: [170, 175, 175],
    alpine: [220, 225, 230],
  },
  wasteland: {
    water: [45, 60, 70],
    lowland: [90, 70, 45],
    midland: [102, 77, 51],
    highland: [80, 75, 70],
    alpine: [120, 115, 110],
  },
  tropical: {
    water: [30, 100, 130],
    lowland: [30, 120, 40],
    midland: [38, 140, 51],
    highland: [100, 115, 85],
    alpine: [155, 160, 150],
  },
  swamp: {
    water: [35, 65, 50],
    lowland: [45, 80, 35],
    midland: [51, 89, 38],
    highland: [75, 80, 60],
    alpine: [140, 140, 130],
  },
  urban: {
    water: [40, 80, 120],
    lowland: [50, 110, 40],
    midland: [64, 128, 51],
    highland: [110, 120, 100],
    alpine: [165, 165, 160],
  },
};

const DEFAULT_PALETTE = TERRAIN_PALETTES.plains;

/** Elevation zone thresholds (matching vegetation-zones.ts) */
const ZONE_THRESHOLDS = [
  { max: 0.02, zone: 'water' as const },
  { max: 0.25, zone: 'lowland' as const },
  { max: 0.55, zone: 'midland' as const },
  { max: 0.80, zone: 'highland' as const },
  { max: 1.01, zone: 'alpine' as const },
];

/**
 * Map a normalized elevation [0,1] to an RGB color using the given palette.
 * Blends between zone colors at boundaries for smooth transitions.
 */
export function elevationToColor(elevation: number, palette: TerrainColorPalette): RGB {
  const e = Math.max(0, Math.min(1, elevation));

  // Find which zone we're in
  for (let i = 0; i < ZONE_THRESHOLDS.length; i++) {
    const threshold = ZONE_THRESHOLDS[i];
    if (e < threshold.max) {
      const color = palette[threshold.zone];

      // Blend with next zone near boundary
      if (i < ZONE_THRESHOLDS.length - 1) {
        const nextThreshold = ZONE_THRESHOLDS[i + 1];
        const nextColor = palette[nextThreshold.zone];
        const zoneStart = i === 0 ? 0 : ZONE_THRESHOLDS[i - 1].max;
        const zoneEnd = threshold.max;
        const zoneSize = zoneEnd - zoneStart;
        const blendRegion = zoneSize * 0.3; // 30% of zone is blend area
        const distToEnd = zoneEnd - e;

        if (distToEnd < blendRegion && blendRegion > 0) {
          const t = 1 - distToEnd / blendRegion;
          return [
            Math.round(color[0] + (nextColor[0] - color[0]) * t * 0.5),
            Math.round(color[1] + (nextColor[1] - color[1]) * t * 0.5),
            Math.round(color[2] + (nextColor[2] - color[2]) * t * 0.5),
          ];
        }
      }

      return color;
    }
  }

  return palette.alpine;
}

/**
 * Render terrain colors from heightmap pixel data into an RGBA pixel buffer.
 *
 * @param heightmapData - Grayscale heightmap pixel data (RGBA, but only R channel is used)
 * @param hmWidth - Heightmap width in pixels
 * @param hmHeight - Heightmap height in pixels
 * @param outputSize - Output image size (square)
 * @param biome - Biome name for color palette selection
 * @returns RGBA Uint8ClampedArray for the output image
 */
export function renderTerrainPixels(
  heightmapData: Uint8ClampedArray,
  hmWidth: number,
  hmHeight: number,
  outputSize: number,
  biome: string = 'plains',
): Uint8ClampedArray {
  const palette = TERRAIN_PALETTES[biome] || DEFAULT_PALETTE;
  const output = new Uint8ClampedArray(outputSize * outputSize * 4);

  for (let y = 0; y < outputSize; y++) {
    for (let x = 0; x < outputSize; x++) {
      // Map output pixel to heightmap pixel
      const hmX = Math.floor((x / outputSize) * hmWidth);
      const hmY = Math.floor((y / outputSize) * hmHeight);
      const hmIdx = (hmY * hmWidth + hmX) * 4;

      // Heightmap is grayscale — use R channel, normalize to [0,1]
      const elevation = heightmapData[hmIdx] / 255;

      const [r, g, b] = elevationToColor(elevation, palette);

      const outIdx = (y * outputSize + x) * 4;
      output[outIdx] = r;
      output[outIdx + 1] = g;
      output[outIdx + 2] = b;
      output[outIdx + 3] = 255;
    }
  }

  return output;
}

/**
 * Generate a terrain background canvas from a heightmap image URL.
 *
 * Loads the heightmap, samples its pixel data, maps elevation to biome colors,
 * and returns a canvas that can be used as the minimap background.
 *
 * @param heightmapUrl - URL of the grayscale heightmap PNG
 * @param outputSize - Size of the output canvas (square, in pixels)
 * @param biome - Biome name for color palette selection
 * @returns Promise resolving to an HTMLCanvasElement with the rendered terrain
 */
export function generateTerrainCanvas(
  heightmapUrl: string,
  outputSize: number = 256,
  biome: string = 'plains',
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Draw heightmap to temp canvas to read pixel data
      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = img.width;
      tmpCanvas.height = img.height;
      const tmpCtx = tmpCanvas.getContext('2d');
      if (!tmpCtx) {
        reject(new Error('Failed to get 2D context for heightmap'));
        return;
      }
      tmpCtx.drawImage(img, 0, 0);
      const heightmapData = tmpCtx.getImageData(0, 0, img.width, img.height).data;

      // Render terrain pixels
      const pixels = renderTerrainPixels(
        heightmapData as unknown as Uint8ClampedArray,
        img.width,
        img.height,
        outputSize,
        biome,
      );

      // Write to output canvas
      const outCanvas = document.createElement('canvas');
      outCanvas.width = outputSize;
      outCanvas.height = outputSize;
      const outCtx = outCanvas.getContext('2d');
      if (!outCtx) {
        reject(new Error('Failed to get 2D context for output'));
        return;
      }
      const imageData = new ImageData(pixels, outputSize, outputSize);
      outCtx.putImageData(imageData, 0, 0);

      resolve(outCanvas);
    };
    img.onerror = () => reject(new Error(`Failed to load heightmap: ${heightmapUrl}`));
    img.src = heightmapUrl;
  });
}
