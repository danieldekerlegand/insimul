/**
 * Foundation Calculator
 *
 * Determines foundation type for buildings based on terrain elevation
 * at the lot's four corners. Lots on steep slopes get raised, stilted,
 * or terraced foundations to prevent floating/clipping.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface FoundationData {
  type: 'flat' | 'raised' | 'stilted' | 'terraced';
  baseElevation: number;
  foundationHeight: number;
  retainingWall: boolean;
}

/**
 * Sample the heightmap at a world-space position.
 * The heightmap covers a square region centered on the origin with extent
 * `mapExtent` in each direction. Values outside the heightmap return 0.
 *
 * @param heightmap - 2D array [row][col] with values in [0, 1]
 * @param worldX - world X coordinate
 * @param worldZ - world Z coordinate
 * @param mapExtent - half-size of the area the heightmap covers (world units)
 */
function sampleHeightmap(
  heightmap: number[][],
  worldX: number,
  worldZ: number,
  mapExtent: number,
): number {
  const resolution = heightmap.length;
  if (resolution === 0) return 0;

  // Map world coords to grid coords
  const u = (worldX + mapExtent) / (2 * mapExtent);
  const v = (worldZ + mapExtent) / (2 * mapExtent);

  const col = Math.min(Math.max(Math.floor(u * resolution), 0), resolution - 1);
  const row = Math.min(Math.max(Math.floor(v * resolution), 0), resolution - 1);

  return heightmap[row][col];
}

/**
 * Calculate the appropriate foundation for a building lot based on terrain.
 *
 * Samples elevation at 4 corners of the lot footprint, determines the
 * elevation delta, and selects a foundation type:
 *   - delta < 0.3  → flat (no foundation needed)
 *   - delta < 1.0  → raised (short foundation wall)
 *   - delta < 2.5  → stilted (elevated on stilts)
 *   - delta >= 2.5 → terraced (with retaining wall)
 *
 * @param lotPosition - center position of the lot in world space
 * @param lotSize - { width, depth } of the lot footprint
 * @param heightmap - 2D heightmap array [row][col], values in [0, 1]
 * @param mapExtent - half-size of the area the heightmap covers (default 100)
 * @param elevationScale - multiplier to convert [0,1] heightmap to world units (default 20)
 */
export function calculateFoundation(
  lotPosition: Vec3,
  lotSize: { width: number; depth: number },
  heightmap: number[][],
  mapExtent: number = 100,
  elevationScale: number = 20,
): FoundationData {
  const hw = lotSize.width / 2;
  const hd = lotSize.depth / 2;

  // Sample 4 corners of the lot
  const corners = [
    { x: lotPosition.x - hw, z: lotPosition.z - hd },
    { x: lotPosition.x + hw, z: lotPosition.z - hd },
    { x: lotPosition.x - hw, z: lotPosition.z + hd },
    { x: lotPosition.x + hw, z: lotPosition.z + hd },
  ];

  const elevations = corners.map(c =>
    sampleHeightmap(heightmap, c.x, c.z, mapExtent) * elevationScale
  );

  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const delta = maxElev - minElev;

  // Base elevation is the lowest corner — building sits on this
  const baseElevation = minElev;

  if (delta < 0.3) {
    return {
      type: 'flat',
      baseElevation,
      foundationHeight: 0,
      retainingWall: false,
    };
  } else if (delta < 1.0) {
    return {
      type: 'raised',
      baseElevation,
      foundationHeight: delta,
      retainingWall: false,
    };
  } else if (delta < 2.5) {
    return {
      type: 'stilted',
      baseElevation,
      foundationHeight: delta,
      retainingWall: false,
    };
  } else {
    return {
      type: 'terraced',
      baseElevation,
      foundationHeight: delta,
      retainingWall: true,
    };
  }
}
