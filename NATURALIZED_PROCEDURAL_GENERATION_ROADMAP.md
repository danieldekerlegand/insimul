# Naturalized Procedural Generation Roadmap

Improvements to make procedurally generated worlds feel more organic and less grid-like.

## Settlement Layout

### 1. Organic Lot Placement
**File:** `client/src/components/3DGame/WorldScaleManager.ts` — `generateLotPositions()`

Currently buildings are placed on a strict `cols × rows` grid with ±2 unit jitter. Options for more natural layouts:

- **Radial distribution with concentric rings** — Place buildings in rings radiating outward from the settlement center. Inner rings are denser (commercial), outer rings are sparser (residential). Slight angular jitter per ring prevents perfect symmetry.

- **Poisson disc sampling** — Generate positions with a minimum distance constraint but no grid alignment. Produces natural-looking spacing similar to how real towns grow organically. Libraries like `fast-poisson-disk-sampling` exist, or implement Bridson's algorithm (~40 lines).

- **Road-first layout** — Generate a few main roads from the settlement center (radial spokes + a ring road), then place buildings along road edges. This naturally creates blocks and districts without an explicit grid.

- **Voronoi district clustering** — Divide the settlement area into Voronoi cells seeded by district centers (market square, residential quarter, etc.). Place buildings within each cell using local Poisson sampling. Creates distinct neighborhoods.

### 2. Building Orientation
Buildings currently all face the same direction (`rotation.y` from spec). Improvements:
- Orient buildings to face the nearest road segment
- Add slight random rotation variance (±5°) for realism
- Corner buildings rotated to face the intersection

### 3. Settlement Shape
Settlements are currently bounded by a square grid extent. More natural shapes:
- Elliptical or irregular polygon boundary based on terrain
- Settlements that follow coastlines, rivers, or ridge lines
- Organic edge falloff — building density decreases toward the perimeter

## Terrain & Nature

### 4. Terrain Variation
- Perlin noise-based biome blending at borders (forest → plains transition)
- River generation using hydraulic erosion simulation
- Cliff faces and elevation-aware building placement

### 5. Vegetation Distribution
- Tree clustering using L-system growth patterns
- Forest clearings around settlements that feel naturally cleared
- Vegetation density gradient based on distance from water sources

## Roads & Paths

### 6. Organic Road Networks
- Curved roads that follow terrain contours instead of straight lines
- Dirt path width variation based on traffic (settlement proximity)
- Intersections with small plazas or market squares
