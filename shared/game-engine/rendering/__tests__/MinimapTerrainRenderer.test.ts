import { describe, it, expect } from 'vitest';
import {
  elevationToColor,
  renderTerrainPixels,
  TERRAIN_PALETTES,
  type RGB,
  type TerrainColorPalette,
} from '../MinimapTerrainRenderer';

describe('MinimapTerrainRenderer', () => {
  describe('TERRAIN_PALETTES', () => {
    it('defines palettes for all expected biomes', () => {
      const expected = ['forest', 'plains', 'mountains', 'desert', 'tundra', 'wasteland', 'tropical', 'swamp', 'urban'];
      for (const biome of expected) {
        expect(TERRAIN_PALETTES[biome]).toBeDefined();
        expect(TERRAIN_PALETTES[biome].water).toHaveLength(3);
        expect(TERRAIN_PALETTES[biome].lowland).toHaveLength(3);
        expect(TERRAIN_PALETTES[biome].midland).toHaveLength(3);
        expect(TERRAIN_PALETTES[biome].highland).toHaveLength(3);
        expect(TERRAIN_PALETTES[biome].alpine).toHaveLength(3);
      }
    });

    it('all palette values are valid RGB (0-255)', () => {
      for (const [, palette] of Object.entries(TERRAIN_PALETTES)) {
        for (const zone of ['water', 'lowland', 'midland', 'highland', 'alpine'] as const) {
          const [r, g, b] = palette[zone];
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThanOrEqual(255);
          expect(g).toBeGreaterThanOrEqual(0);
          expect(g).toBeLessThanOrEqual(255);
          expect(b).toBeGreaterThanOrEqual(0);
          expect(b).toBeLessThanOrEqual(255);
        }
      }
    });
  });

  describe('elevationToColor', () => {
    const palette = TERRAIN_PALETTES.plains;

    it('returns water color for very low elevation', () => {
      const color = elevationToColor(0.01, palette);
      expect(color).toEqual(palette.water);
    });

    it('returns lowland color for low elevation', () => {
      const color = elevationToColor(0.1, palette);
      expect(color).toEqual(palette.lowland);
    });

    it('returns midland color for mid elevation', () => {
      const color = elevationToColor(0.35, palette);
      expect(color).toEqual(palette.midland);
    });

    it('returns highland color for high elevation', () => {
      const color = elevationToColor(0.65, palette);
      expect(color).toEqual(palette.highland);
    });

    it('returns alpine color for very high elevation', () => {
      const color = elevationToColor(0.95, palette);
      expect(color).toEqual(palette.alpine);
    });

    it('clamps negative elevation to water', () => {
      const color = elevationToColor(-0.5, palette);
      expect(color).toEqual(palette.water);
    });

    it('clamps elevation above 1 to alpine', () => {
      const color = elevationToColor(1.5, palette);
      expect(color).toEqual(palette.alpine);
    });

    it('blends colors near zone boundaries', () => {
      // Near the lowland→midland boundary (0.25)
      const pureColor = elevationToColor(0.1, palette);
      const blendColor = elevationToColor(0.24, palette);
      // Blended color should differ from the pure zone color
      expect(blendColor).not.toEqual(pureColor);
    });

    it('produces different colors for different biomes at same elevation', () => {
      const forestColor = elevationToColor(0.4, TERRAIN_PALETTES.forest);
      const desertColor = elevationToColor(0.4, TERRAIN_PALETTES.desert);
      expect(forestColor).not.toEqual(desertColor);
    });
  });

  describe('renderTerrainPixels', () => {
    /** Create a flat heightmap (all pixels same grayscale value) */
    function flatHeightmap(width: number, height: number, value: number): Uint8ClampedArray {
      const data = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < width * height; i++) {
        data[i * 4] = value;     // R
        data[i * 4 + 1] = value; // G
        data[i * 4 + 2] = value; // B
        data[i * 4 + 3] = 255;   // A
      }
      return data;
    }

    /** Create a gradient heightmap (left=0, right=255) */
    function gradientHeightmap(width: number, height: number): Uint8ClampedArray {
      const data = new Uint8ClampedArray(width * height * 4);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = Math.floor((x / (width - 1)) * 255);
          const idx = (y * width + x) * 4;
          data[idx] = val;
          data[idx + 1] = val;
          data[idx + 2] = val;
          data[idx + 3] = 255;
        }
      }
      return data;
    }

    it('produces output with correct dimensions', () => {
      const hm = flatHeightmap(4, 4, 128);
      const result = renderTerrainPixels(hm, 4, 4, 8);
      expect(result.length).toBe(8 * 8 * 4);
    });

    it('flat heightmap produces uniform color', () => {
      const hm = flatHeightmap(4, 4, 128);
      const result = renderTerrainPixels(hm, 4, 4, 4, 'plains');
      // All pixels should be the same color
      const firstR = result[0];
      const firstG = result[1];
      const firstB = result[2];
      for (let i = 0; i < 4 * 4; i++) {
        expect(result[i * 4]).toBe(firstR);
        expect(result[i * 4 + 1]).toBe(firstG);
        expect(result[i * 4 + 2]).toBe(firstB);
        expect(result[i * 4 + 3]).toBe(255); // alpha always 255
      }
    });

    it('gradient heightmap produces varying colors', () => {
      const hm = gradientHeightmap(16, 16);
      const result = renderTerrainPixels(hm, 16, 16, 16, 'plains');
      // Left side (low elevation) should differ from right side (high elevation)
      const leftR = result[0];
      const leftG = result[1];
      const leftB = result[2];
      const rightIdx = (15) * 4; // last pixel of first row
      const rightR = result[rightIdx];
      const rightG = result[rightIdx + 1];
      const rightB = result[rightIdx + 2];
      expect([leftR, leftG, leftB]).not.toEqual([rightR, rightG, rightB]);
    });

    it('all alpha values are 255', () => {
      const hm = gradientHeightmap(8, 8);
      const result = renderTerrainPixels(hm, 8, 8, 8);
      for (let i = 0; i < 8 * 8; i++) {
        expect(result[i * 4 + 3]).toBe(255);
      }
    });

    it('falls back to plains palette for unknown biome', () => {
      const hm = flatHeightmap(4, 4, 128);
      const unknownResult = renderTerrainPixels(hm, 4, 4, 4, 'nonexistent_biome');
      const plainsResult = renderTerrainPixels(hm, 4, 4, 4, 'plains');
      expect(Array.from(unknownResult)).toEqual(Array.from(plainsResult));
    });

    it('different biomes produce different output for same heightmap', () => {
      const hm = flatHeightmap(4, 4, 128);
      const forestResult = renderTerrainPixels(hm, 4, 4, 4, 'forest');
      const desertResult = renderTerrainPixels(hm, 4, 4, 4, 'desert');
      // At least one pixel should differ
      let differs = false;
      for (let i = 0; i < forestResult.length; i++) {
        if (forestResult[i] !== desertResult[i]) {
          differs = true;
          break;
        }
      }
      expect(differs).toBe(true);
    });

    it('handles upscaling from small heightmap to larger output', () => {
      const hm = flatHeightmap(2, 2, 64);
      const result = renderTerrainPixels(hm, 2, 2, 16);
      expect(result.length).toBe(16 * 16 * 4);
      // All pixels should be uniform since heightmap is flat
      const firstR = result[0];
      for (let i = 1; i < 16 * 16; i++) {
        expect(result[i * 4]).toBe(firstR);
      }
    });
  });
});
