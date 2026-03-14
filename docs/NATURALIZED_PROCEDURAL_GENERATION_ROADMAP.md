# Naturalized Procedural Generation Roadmap

Comprehensive plan to transform Insimul's procedural generation from grid-based, flat layouts into realistic, terrain-aware, geographically coherent worlds — across the world editor, in-app 3D engine, minimap, and all export targets (Babylon.js, Godot, Unity, Unreal).

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Phase 1: Terrain Foundation](#2-phase-1-terrain-foundation)
3. [Phase 2: Naturalized Street Networks](#3-phase-2-naturalized-street-networks)
4. [Phase 3: Address & Lot Coherence](#4-phase-3-address--lot-coherence)
5. [Phase 4: Settlement Shape & Terrain Integration](#5-phase-4-settlement-shape--terrain-integration)
6. [Phase 5: Water Systems](#6-phase-5-water-systems)
7. [Phase 6: Building Orientation & Placement](#7-phase-6-building-orientation--placement)
8. [Phase 7: Minimap & World Editor Overhaul](#8-phase-7-minimap--world-editor-overhaul)
9. [Phase 8: Vegetation & Nature Systems](#9-phase-8-vegetation--nature-systems)
10. [Phase 9: Export Pipeline Updates](#10-phase-9-export-pipeline-updates)
11. [Phase 10: Dynamic Settlement Evolution](#11-phase-10-dynamic-settlement-evolution)
12. [Schema & IR Changes Summary](#12-schema--ir-changes-summary)
13. [File Impact Map](#13-file-impact-map)

---

## 1. Current State Analysis

### What exists today

| Area | Current Implementation | Key Limitation |
|------|----------------------|----------------|
| **Districts** | 2–8 radially placed around center (`geography-generator.ts`) | All emanate from one central point; no terrain influence |
| **Streets** | Random position within district bounds; named from static list | No actual geometry, no connectivity, names don't map to spatial reality |
| **Buildings** | Placed linearly along street x-axis (`x + i * 20`) | Grid-like; no relationship to street geometry |
| **Addresses** | `{houseNumber} {streetName}` — houseNumber often random | House numbers don't correspond to position along street; duplicates possible |
| **Lots** | Grid with ±2 unit jitter in `generateLotPositions()` | Pure grid; no blocks, no street frontage |
| **Roads (3D)** | Inter-settlement MST (Kruskal's); intra-settlement radial spokes | All internal roads radiate from center; no grid/organic patterns |
| **Terrain** | Flat XZ plane, `y = 0` everywhere | No elevation, no heightmap generation |
| **Water** | `hasWater` boolean on biome; no geometry | No rivers, lakes, coastlines, bays |
| **Minimap** | 200px dot-based; player/settlement/NPC markers | No terrain, roads, buildings, or street names |
| **World Editor Map** | 2D SVG circles in country rectangles | No street visualization, no terrain, no topography |
| **Nature** | Biome-keyed scatter (trees, rocks, flowers) | Not integrated with terrain elevation or water |
| **Export** | Baked IR with grid lots and MST roads | No heightmap, no street graph, no terrain-aware placement |

### Key files to modify

- `server/generators/geography-generator.ts` — Settlement generation pipeline
- `server/services/game-export/ir-generator.ts` — IR generation for exports
- `client/src/components/3DGame/WorldScaleManager.ts` — Lot positions, settlement scaling
- `client/src/components/3DGame/RoadGenerator.ts` — 3D road meshes
- `client/src/components/3DGame/ProceduralNatureGenerator.ts` — Vegetation
- `client/src/components/3DGame/ProceduralBuildingGenerator.ts` — Building meshes
- `client/src/components/3DGame/SettlementSceneManager.ts` — Settlement rendering
- `client/src/components/3DGame/BabylonMinimap.ts` — Minimap
- `client/src/components/visualization/GeographyMap.tsx` — World editor map
- `shared/game-engine/ir-types.ts` — IR type definitions
- `shared/game-engine/types.ts` — Shared engine types
- `shared/schema.ts` — Database schema

---

## 2. Phase 1: Terrain Foundation

**Goal:** Generate realistic elevation data so that all subsequent systems (streets, buildings, water, vegetation) can be terrain-aware.

### 1.1 Heightmap Generation

Create a new `server/generators/terrain-generator.ts` module that produces a 2D heightmap for each world.

**Algorithm:** Multi-octave Perlin/Simplex noise with terrain-type presets:

```
heightmap[x][z] = Σ (amplitude_i × noise(x × frequency_i, z × frequency_i))
```

| Terrain Type | Base Amplitude | Octaves | Frequency | Character |
|-------------|---------------|---------|-----------|-----------|
| Plains | 0.05 | 3 | 0.005 | Nearly flat with gentle rolling |
| Hills | 0.15 | 4 | 0.008 | Moderate undulation |
| Mountains | 0.40 | 6 | 0.012 | Sharp peaks, deep valleys |
| Coast | 0.08 | 3 | 0.006 | Gradual slope to sea level (clamp ≤ 0 for water) |
| River | 0.10 | 4 | 0.007 | Valley carved through terrain |
| Forest | 0.08 | 3 | 0.006 | Gentle terrain, high canopy |
| Desert | 0.12 | 2 | 0.004 | Long smooth dunes, occasional mesas |

**Resolution:** Configurable. Default 128×128 for villages, 256×256 for towns, 512×512 for cities. Stored as normalized `[0, 1]` float array.

**Seeded:** Use the world seed + settlement ID for deterministic generation across server and client.

### 1.2 Terrain Feature Placement

After base heightmap generation, stamp specific features:

- **Peaks/Mountains:** Gaussian bumps at random positions within mountain biomes
- **Valleys:** Inverse Gaussian channels connecting low points
- **Canyons:** Deep narrow cuts with steep walls (erosion simulation: iterative hydraulic erosion, ~50 iterations)
- **Cliffs:** Step functions applied along fault lines (random walk + vertical displacement)
- **Mesas/Plateaus:** Flat-topped regions in desert biomes (clamp heightmap to plateau level within polygon)
- **Craters:** Circular depressions (for volcanic or wasteland biomes)

### 1.3 Slope & Aspect Maps

Derive from heightmap:

- **Slope map:** `slope[x][z] = magnitude(∇height)` — used for buildability checks, road cost
- **Aspect map:** `aspect[x][z] = atan2(∂h/∂z, ∂h/∂x)` — used for building orientation, vegetation facing

**Buildability rule:** Slopes > 30° are unbuildable. Roads avoid slopes > 15° unless switchback paths are generated.

### 1.4 Elevation in Schema & IR

**`GeographyIR` additions:**
```typescript
interface GeographyIR {
  terrainSize: number;
  heightmap: number[][];           // Already defined but never populated — now generated
  slopeMap?: number[][];           // Derived slope data
  terrainFeatures: TerrainFeatureIR[];  // Named geographic features
}

interface TerrainFeatureIR {
  id: string;
  name: string;
  featureType: 'mountain' | 'hill' | 'valley' | 'canyon' | 'cliff' | 'mesa' | 'plateau' | 'crater' | 'ridge' | 'pass';
  position: Vec3;
  radius: number;                  // Approximate extent
  elevation: number;               // Peak/floor elevation
  description: string | null;
}
```

**`settlements` table additions:**
```
elevation: number           — Settlement center elevation (derived from heightmap)
slopeProfile: string        — 'flat' | 'gentle' | 'moderate' | 'steep' | 'terraced'
```

### 1.5 3D Terrain Mesh

Update `SettlementSceneManager.ts` to generate terrain mesh from heightmap:

- Use Babylon.js `MeshBuilder.CreateGroundFromHeightMap()` or manual vertex displacement
- Apply biome-specific textures via multi-material splatmap (grass, rock, sand, snow based on elevation + biome)
- LOD (Level of Detail): Full resolution near camera, simplified at distance

---

## 3. Phase 2: Naturalized Street Networks

**Goal:** Replace the current system where streets are random points within districts and all 3D roads radiate from one center, with a proper street network that has realistic topology, connectivity, and spatial coherence.

### 2.1 Street Network Graph

Replace the current `Location[]` streets with a proper graph structure:

```typescript
interface StreetNode {
  id: string;
  position: { x: number; z: number };
  elevation: number;               // From heightmap
  type: 'intersection' | 'dead_end' | 'T_junction' | 'curve_point';
}

interface StreetEdge {
  id: string;
  name: string;                    // Street name (consistent along the entire street)
  fromNodeId: string;
  toNodeId: string;
  streetType: 'main_road' | 'avenue' | 'residential' | 'alley' | 'lane' | 'boulevard' | 'highway';
  width: number;                   // In world units
  waypoints: Vec3[];               // Intermediate curve points between nodes
  length: number;                  // Computed from waypoints
  condition: 'good' | 'fair' | 'poor';
  traffic: 'high' | 'medium' | 'low';
  sidewalks: boolean;
  hasStreetLights: boolean;
}

interface StreetNetwork {
  nodes: StreetNode[];
  edges: StreetEdge[];
}
```

### 2.2 Street Generation Algorithms

Implement multiple street layout patterns, selected based on settlement type, terrain, and era:

#### A. Organic Medieval Pattern (villages, old towns)
- Start from a central point (town square, church, or market)
- Generate 3–5 main roads radiating outward at irregular angles
- Add secondary roads branching off main roads at varied angles (not 90°)
- Tertiary paths fill in as curved connections between secondary roads
- Apply Perlin noise displacement to all road waypoints for organic curves
- Roads avoid steep slopes (cost-weighted A* pathfinding on heightmap)

#### B. Grid Pattern (planned towns, cities)
- Generate a primary grid of N×M blocks
- Perturb grid intersections with low-amplitude noise for imperfection
- Add diagonal avenues cutting across the grid (like Washington DC or Barcelona)
- Main streets are wider; residential side streets are narrower
- Grid axis aligned to terrain contours or coastline (not always N-S/E-W)

#### C. Radial Pattern (capital cities, fortress towns)
- Central plaza with 6–8 radial boulevards
- Concentric ring roads at increasing radii
- Radial roads curve slightly to follow terrain
- Inner rings are commercial; outer rings are residential

#### D. Linear Pattern (river towns, mining towns, highway stops)
- One main street running along a river, valley, or trade route
- Short perpendicular side streets branching off
- Buildings clustered along the main artery
- Good for narrow valley or coastal settlements

#### E. Hillside Terraced Pattern (mountain settlements)
- Roads follow elevation contour lines (switchbacks)
- Buildings placed on terraced flat areas between switchbacks
- Staircases connect terraces where road connections are too steep
- Lower terraces are commercial; upper terraces are residential

#### F. Waterfront Pattern (port towns, lakeside villages)
- Main road follows the waterline (curved)
- Perpendicular roads lead inland from the waterfront
- Docks/piers extend into water at regular intervals
- Commercial district concentrated along the waterfront
- Residential areas spread inland

**Selection logic:**
```typescript
function selectStreetPattern(settlement: GeographyConfig): StreetPattern {
  if (terrain === 'coast') return 'waterfront';
  if (terrain === 'river') return 'linear';
  if (terrain === 'mountains' && slopeProfile === 'steep') return 'hillside_terraced';
  if (settlementType === 'city' && population > 3000) return 'grid';
  if (settlementType === 'city' && isCapital) return 'radial';
  if (settlementType === 'village') return 'organic';
  // Default: organic for older settlements, grid for newer ones
  return foundedYear < 1800 ? 'organic' : 'grid';
}
```

### 2.3 Street Naming System

Replace the current static name list with a contextual naming system:

#### Name generation rules:
1. **Directional streets:** Streets running roughly N-S or E-W get directional prefixes in grid layouts (e.g., "North Main St", "East 3rd Ave")
2. **Numbered streets:** Grid patterns use numbered cross-streets (1st St, 2nd St, ...)
3. **Named streets:** Main roads get named after historical figures, trees, geographic features, or landmarks
4. **Street type suffixes** match hierarchy:
   - Boulevards/Avenues: main arteries (widest)
   - Streets: standard through-roads
   - Drives/Ways: curved residential roads
   - Lanes/Courts: dead-end or cul-de-sac streets
   - Alleys: narrow service passages
5. **Consistency:** A street edge retains the same name along its entire length (multiple edges can share a name if they form a continuous path)
6. **Uniqueness:** No two streets in the same settlement share a name

#### Name sources (expandable via Tracery grammars):
- Tree names: Oak, Maple, Cedar, Elm, Pine, Birch, Willow, Ash, Hickory, Walnut
- Landmark references: Church St, Market St, Mill Rd, Bridge St, Harbor Dr, Castle Way
- Founder/historical names: Use character generator to produce period-appropriate names
- Geographic: Hill St, River Rd, Valley Dr, Ridge Ave, Cliff Way, Lake Ln, Bay Blvd
- Ordinal: 1st through 20th (for grid layouts)
- Directional: North, South, East, West (prefixes for grid layouts)

### 2.4 Street Network in the Geography Generator

Refactor `geography-generator.ts`:

```
generateDistricts() → generateStreetNetwork() → assignDistricts() → generateBuildings()
```

**New flow:**
1. Choose street pattern based on settlement config + terrain
2. Generate street graph (nodes + edges) using chosen algorithm
3. Assign street names
4. Derive districts from connected street regions (Voronoi around district seed points, clipped to street boundaries)
5. Generate building lots along street edges (see Phase 3)
6. Place landmarks at prominent intersections or district centers

### 2.5 Road Rendering Updates

Update `RoadGenerator.ts` to render the street network graph:

- **Intra-settlement roads:** Render each `StreetEdge` as a ribbon mesh following its waypoints
- **Road width** varies by street type (boulevard: 6 units, street: 4, lane: 2, alley: 1.5)
- **Intersections:** Flatten terrain at intersection nodes; optionally render intersection plazas
- **Elevation following:** Road waypoints sample heightmap; apply smoothing to prevent jarring bumps
- **Road surface materials:** Cobblestone for old town centers, asphalt for modern, dirt for rural outskirts
- **Curbs and sidewalks:** Thin raised meshes along road edges for streets with `sidewalks: true`

---

## 4. Phase 3: Address & Lot Coherence

**Goal:** Ensure that house numbers, street names, and lot positions form a coherent, real-world-like addressing system where you can navigate by address.

### 3.1 Address Assignment Algorithm

Buildings along a street get addresses based on their position along the street edge:

```typescript
function assignAddresses(street: StreetEdge, lots: Lot[]): void {
  // Sort lots by their projection onto the street centerline
  const sorted = lots.sort((a, b) => projectOntoStreet(a.position, street) - projectOntoStreet(b.position, street));

  // Odd numbers on the left side of the street, even on the right
  let leftNum = 1;
  let rightNum = 2;

  for (const lot of sorted) {
    const side = getSideOfStreet(lot.position, street); // 'left' | 'right'
    if (side === 'left') {
      lot.houseNumber = leftNum;
      leftNum += 2;
    } else {
      lot.houseNumber = rightNum;
      rightNum += 2;
    }
    lot.streetName = street.name;
    lot.address = `${lot.houseNumber} ${street.name}`;
  }
}
```

**Rules:**
- Numbers increase away from the settlement center (or from a designated origin point)
- Odd numbers on the left side of the street (facing away from origin), even on the right
- Numbers skip gaps proportionally to physical distance (e.g., a 50-meter gap between buildings → skip ~10 numbers)
- Corner lots get the address of the higher-priority street they face
- Blocks between cross-streets get address ranges (100s block, 200s block, etc.) in grid layouts

### 3.2 Lot Placement Along Streets

Replace grid-based lot placement with street-frontage placement:

```typescript
function generateLotsAlongStreet(street: StreetEdge, config: GeographyConfig): LotPosition[] {
  const lots: LotPosition[] = [];
  const lotWidth = getLotWidth(config.settlementType);  // village: 15, town: 12, city: 10
  const lotDepth = getLotDepth(config.settlementType);  // village: 20, town: 18, city: 15
  const setback = getSetback(street.streetType);         // distance from street centerline to building front

  // Walk along the street, placing lots on both sides
  let distanceAlongStreet = lotWidth / 2;
  const totalLength = street.length;

  while (distanceAlongStreet < totalLength - lotWidth / 2) {
    const centerPoint = interpolateAlongStreet(street, distanceAlongStreet);
    const streetDirection = getStreetDirectionAt(street, distanceAlongStreet);
    const perpendicular = rotate90(streetDirection);

    // Left side lot
    lots.push({
      position: centerPoint + perpendicular * (setback + lotDepth / 2),
      frontage: streetDirection,
      width: lotWidth,
      depth: lotDepth,
      side: 'left',
      distanceAlongStreet,
    });

    // Right side lot
    lots.push({
      position: centerPoint - perpendicular * (setback + lotDepth / 2),
      frontage: streetDirection,
      width: lotWidth,
      depth: lotDepth,
      side: 'right',
      distanceAlongStreet,
    });

    distanceAlongStreet += lotWidth + 1; // +1 unit gap between lots
  }

  return lots;
}
```

### 3.3 Block Structure

Group lots into blocks defined by surrounding streets:

```typescript
interface Block {
  id: string;
  boundaryStreetIds: string[];     // Street edges forming the block boundary
  lotIds: string[];                // Lots within this block
  districtId: string;
  blockNumber: number;             // For address ranges (e.g., "200 block of Main St")
  center: Vec3;
  polygon: Vec2[];                 // Block boundary polygon
}
```

Blocks are formed by:
1. Finding all enclosed polygons in the street graph (minimal cycle detection)
2. Each polygon interior becomes a block
3. Lots are assigned to blocks based on which block polygon contains them
4. Block numbers increase outward from settlement center (100, 200, 300, ...)

### 3.4 Lot Schema Updates

Extend the `lots` table:

```
lotWidth: number              — Front dimension (along street)
lotDepth: number              — Side dimension (perpendicular to street)
streetEdgeId: string          — Which street edge this lot faces
distanceAlongStreet: number   — Position along the street (for ordering)
side: 'left' | 'right'       — Which side of the street
blockId: string               — Block this lot belongs to
facingAngle: number           — Angle the lot faces (radians, for building orientation)
elevation: number             — Ground elevation at lot center
```

### 3.5 Address Validation

Add a validation pass after generation:

- No duplicate addresses within a settlement
- All house numbers on a street are monotonically increasing in the correct direction
- All lots reference a valid street edge that exists in the street network
- Street names in lot records match the street edge they're assigned to
- Log warnings for any inconsistencies

---

## 5. Phase 4: Settlement Shape & Terrain Integration

**Goal:** Make settlements conform to their terrain rather than existing as flat circles on a plane.

### 4.1 Settlement Boundary Generation

Replace circular/square boundaries with terrain-aware shapes:

```typescript
interface SettlementBoundary {
  polygon: Vec2[];                 // Irregular boundary polygon
  area: number;                    // Total area in world units²
  perimeterType: 'natural' | 'walled' | 'open';
}
```

**Boundary algorithms by terrain:**

| Terrain | Boundary Shape |
|---------|---------------|
| Plains | Roughly circular with organic noise perturbation |
| Hills | Follows ridge lines and valley floors; avoids steep slopes |
| Mountains | Confined to flat areas between peaks; narrow and elongated |
| Coast | Follows coastline on one side; semi-circular inland expansion |
| River | Elongated along river; may span both banks with bridge crossings |
| Forest | Clearing shape — round but with tree-line indentations |
| Desert | Clustered around water source (oasis); compact with hard edges |

### 4.2 Terrain-Influenced District Placement

Districts are no longer purely radial. Instead:

1. **Commercial/market districts** placed at the flattest, most accessible area (lowest slope near center)
2. **Wealthy residential** placed at scenic overlooks (moderate elevation, good aspect)
3. **Working-class residential** placed in lower areas or less desirable terrain
4. **Industrial districts** placed near water sources (rivers, coast) or outside settlement core
5. **Religious/civic** placed at the highest accessible point (hilltop churches, acropolis pattern)

### 4.3 Elevation-Aware Building Placement

Each building lot checks:
1. **Slope at lot position:** Must be < 30° for standard buildings; terraced buildings allow up to 45°
2. **Foundation leveling:** Building footprint samples 4 corner heights; foundation height = max corner - min corner
3. **Stilted buildings:** For lots on steep coastal or hillside terrain, generate raised foundations
4. **Retaining walls:** For terraced lots, generate retaining wall meshes on the downhill side

### 4.4 Settlement Types Expanded

Add new settlement subtypes that influence generation:

| Subtype | Description | Key Features |
|---------|-------------|--------------|
| **Port city** | Major coastal trading hub | Harbor, docks, lighthouse, waterfront market, shipyard |
| **Mountain village** | Small hillside settlement | Terraced layout, switchback roads, stone construction |
| **River crossing** | Town at a river ford/bridge | Bridge as central feature, mills along river, flood plain |
| **Mining town** | Built near mineral deposits | Mine entrance, ore processing, linear along valley |
| **Fortress town** | Built around a castle/fort | Walled perimeter, radial from castle, guard towers |
| **Oasis settlement** | Desert settlement at water | Compact around water, palm trees, mud-brick |
| **Fishing village** | Small coastal community | Small harbor, boats, fish market, clustered near shore |
| **Crossroads town** | Built at road intersection | Inns, stables, market square at junction |
| **University town** | Built around an institution | Campus district, bookshops, student housing |
| **Market town** | Regional trading center | Large central market, warehouses, trader inns |
| **Cliff dwelling** | Built into cliff face | Carved structures, ladder access, dramatic verticality |
| **Island settlement** | On an island in lake/river | Bridge access, compact layout, dock |
| **Valley town** | In a protected valley | Surrounded by hills, agricultural district, windmills |

### 4.5 Settlement Elevation Profile

Generate and store an elevation profile for each settlement:

```typescript
interface SettlementElevation {
  minElevation: number;
  maxElevation: number;
  averageElevation: number;
  slopeProfile: 'flat' | 'gentle' | 'moderate' | 'steep' | 'terraced';
  elevationGrid: number[][];       // Local heightmap excerpt for the settlement area
  contourLines: ContourLine[];     // Pre-computed contour lines for map display
}

interface ContourLine {
  elevation: number;
  points: Vec2[];                  // Polyline of points at this elevation
}
```

---

## 6. Phase 5: Water Systems

**Goal:** Generate rivers, lakes, coastlines, bays, harbors, and other water features that interact with terrain and settlements.

### 5.1 River Generation

**Algorithm:** Hydraulic flow simulation on heightmap:

1. **Source placement:** Place river sources at high-elevation points (mountain peaks, ridgelines)
2. **Flow simulation:** From each source, follow steepest descent with momentum
   - At each step: move to lowest neighboring cell, with inertia favoring current direction
   - Accumulate flow volume (tributary confluences increase width)
   - Carve terrain as river flows (erosion: lower heightmap along river path)
3. **Meander generation:** Apply sine-wave displacement perpendicular to flow direction
   - Amplitude increases with lower slope (flat terrain = more meandering)
   - Meander wavelength scales with river width
4. **Terminus:** River ends at sea level (coast), a lake, or the map edge
5. **Tributaries:** Secondary rivers branch from ridgeline watersheds and merge into main rivers

```typescript
interface RiverIR {
  id: string;
  name: string;
  source: Vec3;                    // Headwater position
  mouth: Vec3;                     // Where river ends (coast/lake/edge)
  waypoints: Vec3[];               // Centerline path
  widthProfile: number[];          // Width at each waypoint (increases downstream)
  flowDirection: 'north' | 'south' | 'east' | 'west' | string;
  tributaryIds: string[];          // Rivers that feed into this one
  crossingPoints: RiverCrossingIR[]; // Bridges/fords
  navigable: boolean;              // Can boats travel on this river?
}

interface RiverCrossingIR {
  position: Vec3;
  type: 'bridge' | 'ford' | 'ferry';
  streetEdgeId: string | null;     // Road that crosses here
  name: string | null;
}
```

### 5.2 Lake Generation

**Algorithm:**
1. Find local minima in heightmap (basins)
2. "Fill" basin up to the lowest overflow point (pour point)
3. Lake surface = flat plane at pour point elevation
4. Lake shape = heightmap contour at pour point elevation

```typescript
interface LakeIR {
  id: string;
  name: string;
  center: Vec3;
  elevation: number;               // Water surface elevation
  boundaryPolygon: Vec2[];         // Shoreline
  area: number;                    // Surface area
  maxDepth: number;
  outflowRiverId: string | null;   // River that drains this lake
  inflowRiverIds: string[];        // Rivers feeding this lake
  islandIds: string[];             // Islands within the lake
}
```

### 5.3 Coastline & Bay Generation

**For worlds with coastal terrain:**

1. **Sea level plane:** Define global sea level (e.g., height = 0.0)
2. **Coastline:** Contour of heightmap at sea level, with noise perturbation for natural irregularity
3. **Bays:** Concave coastal indentations — stamp inverted Gaussian into heightmap near coast
4. **Peninsulas:** Convex coastal protrusions — stamp elongated ridge extending into water
5. **Coves:** Small sheltered bays — tight concave curves with surrounding cliffs
6. **Sea cliffs:** Where steep terrain meets coastline — vertical drop at water's edge
7. **Beaches:** Where gentle slope meets coastline — gradual sand-textured transition

```typescript
interface CoastlineIR {
  segments: CoastSegmentIR[];
  seaLevel: number;
}

interface CoastSegmentIR {
  points: Vec2[];                  // Shoreline polyline
  type: 'beach' | 'cliff' | 'rocky' | 'marsh' | 'dock';
  elevation: number;               // Top of cliff, or beach level
}

interface BayIR {
  id: string;
  name: string;
  center: Vec3;
  mouthWidth: number;             // Opening width
  depth: number;                  // How far inland the bay extends
  boundaryPolygon: Vec2[];
  harborSuitability: number;       // 0-1, based on shelter from waves
}
```

### 5.4 Harbor & Dock Generation

For coastal/river settlements:

1. **Harbor placement:** Find sheltered bay or river bend near settlement
2. **Dock generation:** Place dock structures extending into water from shore
3. **Pier placement:** Short piers for fishing, long piers for trade ships
4. **Lighthouse:** Place at harbor entrance or on promontory
5. **Shipyard:** Large waterfront building near deep water
6. **Fish market/warehouse:** Buildings adjacent to docks

```typescript
interface HarborIR {
  id: string;
  name: string;
  settlementId: string;
  position: Vec3;
  docks: DockIR[];
  lighthousePosition: Vec3 | null;
  waterDepth: number;
  shelterRating: number;           // 0-1
}

interface DockIR {
  id: string;
  position: Vec3;
  length: number;
  width: number;
  rotation: number;
  dockType: 'fishing' | 'trade' | 'ferry' | 'military';
}
```

### 5.5 Water Rendering

Update 3D rendering for water features:

- **River meshes:** Ribbon meshes following river waypoints with animated UV scrolling
- **Lake meshes:** Flat plane clipped to boundary polygon with reflection/refraction material
- **Ocean/sea:** Large water plane at sea level with wave vertex animation
- **Waterfalls:** Where rivers have steep drops, generate waterfall particle effects
- **Bridges:** Arch or flat bridge meshes at river crossing points
- **Shore blending:** Texture splat transitions from land material to water-edge material (sand, mud, rock)

### 5.6 Water in Schema & IR

**`GeographyIR` additions:**
```typescript
interface GeographyIR {
  // ... existing fields ...
  rivers: RiverIR[];
  lakes: LakeIR[];
  coastline: CoastlineIR | null;
  bays: BayIR[];
  harbors: HarborIR[];
  seaLevel: number;
}
```

**`settlements` table additions:**
```
waterFeatures: JSONB[]    — Nearby water features [{type, id, distance, direction}]
hasHarbor: boolean
harborId: string | null
```

---

## 7. Phase 6: Building Orientation & Placement

**Goal:** Buildings face streets, have appropriate scale, and integrate with terrain.

### 6.1 Street-Facing Orientation

Replace uniform rotation with street-aware orientation:

```typescript
function calculateBuildingRotation(lot: LotPosition, street: StreetEdge): number {
  // Get the street direction at the lot's position along the street
  const streetDir = getStreetDirectionAt(street, lot.distanceAlongStreet);

  // Building faces perpendicular to street (toward the street)
  const facingDir = lot.side === 'left'
    ? rotate90CW(streetDir)
    : rotate90CCW(streetDir);

  // Add slight random variance (±3°) for realism
  const variance = (seededRandom() - 0.5) * (Math.PI / 60);

  return Math.atan2(facingDir.z, facingDir.x) + variance;
}
```

### 6.2 Corner Building Handling

Buildings on corner lots (at intersections):
- Face the higher-priority street (main road > residential)
- If streets are equal priority, face the one the lot has more frontage on
- Corner buildings may have a beveled or angled entrance facing the intersection
- Optional: corner buildings are larger (commercial ground floor)

### 6.3 Building Scale by Zone

| Zone | Lot Size | Building Height | Building Style |
|------|----------|----------------|----------------|
| Downtown/Commercial Core | Small lots (8×10) | 2–5 floors | Dense, shared walls |
| Mixed Use | Medium lots (10×14) | 2–3 floors | Shop below, residence above |
| Inner Residential | Medium lots (12×16) | 1–2 floors | Row houses, townhouses |
| Outer Residential | Large lots (15×25) | 1–2 floors | Detached houses, gardens |
| Rural Edge | Very large lots (25×40) | 1 floor | Farmhouses, barns |
| Industrial | Large irregular lots | 1–2 floors | Warehouses, factories |

### 6.4 Setback & Yard Generation

- **Front setback:** Distance from street to building front (varies by zone: 0 for downtown, 3m for residential, 8m for rural)
- **Side setback:** Gap between adjacent buildings (0 for row houses, 2m for detached)
- **Back yard:** Remaining lot depth behind building
- **Corner lots:** May have additional side-street setback

### 6.5 Building Footprint Variety

Instead of uniform rectangular footprints:
- **L-shaped** buildings (corner lots, larger residences)
- **U-shaped** buildings (courtyards, inns, civic buildings)
- **Irregular polygons** (following lot boundaries)
- **Attached/semi-detached** pairs (shared walls on one side)
- **Tower additions** (churches, town halls, clock towers)

### 6.6 Terrain-Adaptive Foundations

```typescript
function calculateFoundation(lot: LotPosition, heightmap: number[][]): FoundationData {
  // Sample elevation at building corners
  const corners = getBuildingCorners(lot);
  const elevations = corners.map(c => sampleHeightmap(heightmap, c.x, c.z));

  const minElev = Math.min(...elevations);
  const maxElev = Math.max(...elevations);
  const slopeDelta = maxElev - minElev;

  if (slopeDelta < 0.3) {
    return { type: 'flat', baseElevation: (minElev + maxElev) / 2, foundationHeight: 0 };
  } else if (slopeDelta < 1.0) {
    return { type: 'raised', baseElevation: maxElev, foundationHeight: slopeDelta };
  } else if (slopeDelta < 2.5) {
    return { type: 'stilted', baseElevation: maxElev, foundationHeight: slopeDelta, stiltCount: 4 };
  } else {
    return { type: 'terraced', baseElevation: maxElev, foundationHeight: slopeDelta, retainingWall: true };
  }
}
```

---

## 8. Phase 7: Minimap & World Editor Overhaul

**Goal:** Make the minimap and world editor maps display streets, terrain, water, and building footprints with proper labels.

### 7.1 Minimap Enhancements

Currently the minimap (`BabylonMinimap.ts`) is a 200×200px dot display. Overhaul to include:

#### A. Terrain Background Layer
- Render heightmap as a colored background (green=low, brown=mid, white=high)
- Apply biome-based colorization (forest=dark green, desert=tan, coast=blue gradient)
- Water features (rivers, lakes, coastline) rendered in blue
- Update in real-time as player moves (scrolling minimap centered on player)

#### B. Street Network Layer
- Draw street edges as lines on the minimap
- Line width proportional to street type (main roads thicker)
- Color: light gray for roads, darker for main arteries
- Street names shown when minimap is zoomed in or hovered

#### C. Building Footprint Layer
- Small rectangles for each building (2-3px at default zoom)
- Color-coded: residential (light), commercial (darker), civic (highlighted)
- Only shown at higher zoom levels to avoid clutter

#### D. Interactive Features
- **Zoom:** Mouse wheel or pinch to zoom minimap (1× to 8× magnification)
- **Click to mark:** Click minimap to set a waypoint marker
- **Tooltip:** Hover over a building/street shows its name/address
- **North indicator:** Compass rose or north arrow
- **Scale bar:** Distance reference at current zoom level

#### E. Fog of War (Optional)
- Areas the player hasn't visited are dimmed or hidden
- Gradually reveal terrain as player explores
- Persist exploration state across sessions

### 7.2 Full-Screen Map View

Add a full-screen map mode (toggled by M key or button):

- **2D top-down view** of the entire settlement or world region
- Street names rendered as text along street centerlines
- Building footprints with labels for businesses/landmarks
- Quest markers, NPC positions, points of interest
- Legend showing map symbols
- Zoom from settlement-level detail to world overview
- Player position and facing direction indicator

### 7.3 World Editor Map Overhaul

Completely redesign `GeographyMap.tsx` from its current SVG circles-in-rectangles to a proper geographic visualization:

#### A. Terrain Visualization
- Render heightmap as a tiled image or canvas overlay
- Color-code by biome/terrain type with smooth transitions
- Show elevation contour lines at configurable intervals
- Toggle layers: terrain, political boundaries, settlements, roads

#### B. Settlement Detail View
- Click a settlement to see its street network overlaid on terrain
- Street names displayed along edges
- Building footprints shown within blocks
- District boundaries shown as colored overlays
- Population density heatmap option

#### C. Street Network Display
- Render all streets within selected settlement
- Color-code by street type (main road, residential, alley)
- Street names as labels along the street direction
- Intersection markers
- One-way indicators (if applicable)

#### D. Water Feature Display
- Rivers as blue curved lines with width
- Lakes as blue filled polygons
- Coastlines as blue boundary lines
- Harbors with dock markers

#### E. Political Boundaries
- Country borders as thick dashed lines
- State borders as thin dashed lines
- Settlement boundaries as dotted circles/polygons

#### F. Interactive Features
- **Pan & zoom** (already exists, enhance with smooth animation)
- **Search:** Find a settlement, street, or building by name
- **Layers panel:** Toggle visibility of terrain, roads, water, buildings, districts, labels
- **Information panel:** Click any feature for detailed info
- **Distance measurement:** Click two points to see distance
- **Export map as image:** Download current view as PNG

### 7.4 Settlement Editor Mini-Map

When editing a specific settlement in the world editor, show a dedicated mini-map:

- Top-down view of the settlement's street network
- Lots shown as rectangles along streets
- Click a lot to select it (view/edit building, residents, business)
- Drag to rearrange lots (manual override of procedural generation)
- Color-code lots by type (residential=green, business=blue, vacant=gray)
- Show address numbers on each lot
- Street name labels on each street segment

---

## 9. Phase 8: Vegetation & Nature Systems

**Goal:** Replace scatter-based vegetation with ecologically coherent, terrain-aware nature generation.

### 8.1 Biome-Elevation Zones

Vegetation type varies with elevation:

| Elevation Band | Temperature | Vegetation |
|---------------|-------------|------------|
| 0.0 – 0.15 | Hot/Warm | Tropical/deciduous forest, grasslands |
| 0.15 – 0.35 | Temperate | Mixed forest, meadows |
| 0.35 – 0.55 | Cool | Coniferous forest, shrubs |
| 0.55 – 0.75 | Cold | Alpine meadows, sparse trees |
| 0.75 – 1.0 | Freezing | Bare rock, snow, no vegetation |

Cross-reference with moisture (distance to water, rainfall from aspect):

| | Dry | Moderate | Wet |
|--|-----|----------|-----|
| **Hot** | Desert scrub | Savanna | Tropical forest |
| **Temperate** | Steppe | Deciduous forest | Rainforest |
| **Cool** | Tundra | Conifer forest | Bog/marsh |
| **Cold** | Bare rock | Alpine scrub | Glacier |

### 8.2 Vegetation Placement Algorithm

Replace uniform random scatter with ecologically-motivated placement:

1. **Forest clustering:** Use Poisson disc sampling with varying minimum distance
   - Dense forest: min distance = 3 units
   - Sparse woodland: min distance = 8 units
   - Savanna: min distance = 15 units

2. **Edge effects:** Tree density decreases near settlements (cleared land), roads (cut back), water (riparian zone with different species), and high slopes (too steep for root systems)

3. **Species distribution:**
   - Each biome-elevation-moisture zone has a species palette (e.g., oak, maple for temperate-moderate; pine, spruce for cool-moderate)
   - Mix 2-3 species per zone with weighted random selection
   - Occasional "outlier" species at zone boundaries for natural transition

4. **Undergrowth:** Below tree canopy, generate ground cover:
   - Shrubs (scale 0.3–0.8, placed between trees)
   - Grass patches (billboard or ground-plane meshes)
   - Flowers (seasonal; based on biome)
   - Mushrooms (near water, in shade of trees)
   - Fallen logs (occasional, rotated randomly)

5. **Clearings:** Natural openings in forests:
   - Meadows (circular clearings with grass/flowers)
   - Rocky outcrops (no vegetation, replaced with rock meshes)
   - Water edges (riparian strip with reeds, willows)

### 8.3 Agricultural Zones

Near settlements, replace natural vegetation with agricultural features:

- **Crop fields:** Rectangular patches outside settlement boundary, aligned to roads
- **Orchards:** Regular grid of fruit trees
- **Pastures:** Fenced areas with grass texture, animal NPCs
- **Vineyards:** Terraced hillside rows (in appropriate biomes)
- **Lumber clearings:** Stumps at forest edge near settlements

### 8.4 Rock & Geological Features

- **Boulders:** Placed on slopes > 20°, near cliff edges, on mountaintops
- **Rock formations:** Clusters of rocks at cliff bases, canyon walls
- **Cave entrances:** At cliff faces, marked on map (potential dungeon entries)
- **Fossils/mineral deposits:** Visual markers at geological interest points

### 8.5 Nature Object LOD

For performance:
- **Near (< 50 units):** Full 3D mesh with shadows
- **Medium (50–150 units):** Simplified mesh, no shadows
- **Far (150–400 units):** Billboard (camera-facing quad with texture)
- **Very far (> 400 units):** Not rendered (culled)
- **Forest canopy:** At extreme distance, render forest as a green ground texture patch

---

## 10. Phase 9: Export Pipeline Updates

**Goal:** Ensure all new procedural generation data flows through the IR and into exported games for all target engines.

### 9.1 IR Type Additions Summary

New types to add to `shared/game-engine/ir-types.ts`:

```typescript
// Terrain
interface TerrainFeatureIR { ... }          // Mountains, valleys, cliffs, etc.

// Streets (replaces current simple RoadIR for intra-settlement)
interface StreetNetworkIR {
  nodes: StreetNodeIR[];
  edges: StreetEdgeIR[];
}
interface StreetNodeIR { ... }
interface StreetEdgeIR { ... }

// Water
interface RiverIR { ... }
interface LakeIR { ... }
interface CoastlineIR { ... }
interface BayIR { ... }
interface HarborIR { ... }
interface DockIR { ... }

// Settlement shape
interface SettlementBoundaryIR {
  polygon: Vec2[];
  perimeterType: string;
}

// Blocks
interface BlockIR {
  id: string;
  boundaryStreetIds: string[];
  polygon: Vec2[];
  districtId: string;
  blockNumber: number;
}

// Enhanced lots
interface LotIR {
  // ... existing fields plus:
  lotWidth: number;
  lotDepth: number;
  streetEdgeId: string;
  side: 'left' | 'right';
  facingAngle: number;
  elevation: number;
  foundationType: string;
}
```

### 9.2 IR Generator Updates

Update `server/services/game-export/ir-generator.ts`:

1. **Heightmap generation:** Call terrain generator, include heightmap in GeographyIR
2. **Street network export:** Convert street graph to StreetNetworkIR for each settlement
3. **Water features:** Include rivers, lakes, coastline in GeographyIR
4. **Lot positions:** Use street-aligned positions instead of grid positions
5. **Building rotations:** Use street-facing rotation instead of uniform rotation
6. **Nature objects:** Use terrain-aware vegetation placement
7. **Road IR:** Separate inter-settlement roads (MST-based, kept as RoadIR) from intra-settlement streets (StreetEdgeIR)

### 9.3 Babylon.js Scene Generator Updates

Update `babylon-scene-generator.ts` and `babylon-data-generator.ts`:

- Generate terrain mesh from heightmap
- Render street network as road meshes
- Apply building rotations from IR
- Generate water meshes (rivers, lakes)
- Apply terrain-aware vegetation placement
- Generate bridge meshes at river crossings

### 9.4 Unity Template Updates

Update `server/services/game-export/unity/templates/`:

- **Terrain:** Generate Unity Terrain from heightmap data (TerrainData, splatmap)
- **Streets:** Generate road meshes or spline-based roads (using Unity Splines package)
- **Water:** Use Unity water shader or third-party water system
- **Buildings:** Apply rotation and elevation from IR
- **Vegetation:** Use Unity terrain tree/detail system for efficient rendering

### 9.5 Godot Template Updates

Update Godot export templates:

- **Terrain:** Generate Godot terrain (Terrain3D plugin or custom mesh)
- **Streets:** Path3D nodes for roads with CSG meshes
- **Water:** Water3D node or shader-based water
- **Buildings:** Apply MeshInstance3D transforms from IR

### 9.6 Unreal Template Updates

Update Unreal export templates:

- **Terrain:** Generate Unreal Landscape from heightmap
- **Streets:** Spline meshes for roads
- **Water:** Water Body actors (UE5 Water plugin)
- **Buildings:** Static mesh actors with transforms from IR

### 9.7 Data Export Format

The exported `world-data.json` should include:

```json
{
  "geography": {
    "terrainSize": 1024,
    "heightmap": [[...], ...],
    "seaLevel": 0.0,
    "terrainFeatures": [...],
    "rivers": [...],
    "lakes": [...],
    "coastline": {...},
    "countries": [...],
    "states": [...],
    "settlements": [
      {
        "id": "...",
        "position": {...},
        "boundary": { "polygon": [...] },
        "streetNetwork": {
          "nodes": [...],
          "edges": [...]
        },
        "blocks": [...],
        "lots": [...],
        "elevation": {...}
      }
    ]
  }
}
```

---

## 11. Phase 10: Dynamic Settlement Evolution

**Goal:** Allow settlements to grow, change, and evolve over simulation time — not just be static after initial generation.

### 10.1 Settlement Growth

As population increases during simulation:

1. **New lots:** Add lots at the settlement periphery along extended street edges
2. **Street extension:** Extend existing streets outward or add new streets
3. **District expansion:** Existing districts grow; new districts form
4. **Densification:** Central lots subdivide (one large lot → two smaller lots)
5. **Building upgrades:** Cottages → houses → apartment buildings as density increases

### 10.2 Settlement Decline

As population decreases:

1. **Abandoned buildings:** Mark lots as vacant, building condition deteriorates
2. **Road decay:** Underused streets degrade from 'good' to 'poor'
3. **Nature reclamation:** Vegetation encroaches on abandoned lots over time
4. **District consolidation:** Peripheral districts depopulate first

### 10.3 Infrastructure Development

As settlements grow:

1. **Road paving:** Dirt → cobblestone → asphalt as wealth increases
2. **Street widening:** Main roads widen as traffic increases
3. **Bridge construction:** New bridges when settlements expand across rivers
4. **Wall construction:** Fortress towns add/expand walls as population grows
5. **Harbor expansion:** New docks added as trade increases

### 10.4 Historical Layers

Track the evolution of the settlement:

```typescript
interface SettlementHistory {
  foundedYear: number;
  growthEvents: GrowthEvent[];
}

interface GrowthEvent {
  year: number;
  type: 'expansion' | 'densification' | 'decline' | 'infrastructure' | 'disaster';
  description: string;
  affectedLotIds: string[];
  affectedStreetIds: string[];
}
```

This integrates with Talk of the Town's historical simulation phases — as the TotT engine simulates decades of history, the settlement physically evolves.

---

## 12. Schema & IR Changes Summary

### Database Schema Additions (`shared/schema.ts`)

**`settlements` table:**
```
elevation: number
slopeProfile: text                    — 'flat' | 'gentle' | 'moderate' | 'steep' | 'terraced'
settlementSubtype: text               — 'port_city' | 'mountain_village' | etc.
boundaryPolygon: jsonb                — Irregular settlement boundary
streetNetwork: jsonb                  — StreetNetwork graph
waterFeatures: jsonb                  — Nearby water features
hasHarbor: boolean
harborData: jsonb
elevationGrid: jsonb                  — Local heightmap excerpt
contourLines: jsonb
```

**`lots` table:**
```
lotWidth: number
lotDepth: number
streetEdgeId: text
distanceAlongStreet: number
side: text                            — 'left' | 'right'
blockId: text
facingAngle: number
elevation: number
foundationType: text                  — 'flat' | 'raised' | 'stilted' | 'terraced'
```

**New `street_edges` table:**
```
id: uuid
settlementId: uuid
name: text
streetType: text
fromNodeId: text
toNodeId: text
width: number
waypoints: jsonb
length: number
condition: text
traffic: text
sidewalks: boolean
hasStreetLights: boolean
```

**New `terrain_features` table:**
```
id: uuid
worldId: uuid
name: text
featureType: text
position: jsonb
radius: number
elevation: number
description: text
```

**New `water_features` table:**
```
id: uuid
worldId: uuid
featureType: text                     — 'river' | 'lake' | 'bay' | 'coastline'
name: text
data: jsonb                           — Feature-specific data (waypoints, boundary, etc.)
```

**New `blocks` table:**
```
id: uuid
settlementId: uuid
districtId: text
blockNumber: integer
boundaryStreetIds: jsonb
polygon: jsonb
```

### IR Type Additions (`shared/game-engine/ir-types.ts`)

See sections 1.4, 2.1, 3.3, 5.1–5.4 for complete type definitions.

---

## 13. File Impact Map

### Server-Side

| File | Changes |
|------|---------|
| `server/generators/terrain-generator.ts` | **NEW** — Heightmap, terrain features, slope maps |
| `server/generators/street-generator.ts` | **NEW** — Street network generation (6 pattern algorithms) |
| `server/generators/water-generator.ts` | **NEW** — Rivers, lakes, coastlines, harbors |
| `server/generators/vegetation-generator.ts` | **NEW** — Terrain-aware vegetation placement |
| `server/generators/geography-generator.ts` | **MAJOR REFACTOR** — Integrate street/terrain/water generators; new address system |
| `server/generators/world-generator.ts` | **MODIFY** — Call terrain generator before geography; pass heightmap |
| `server/services/game-export/ir-generator.ts` | **MAJOR MODIFY** — Export all new data (heightmap, streets, water, blocks) |
| `server/db/mongo-storage.ts` | **MODIFY** — Add new collections (street_edges, terrain_features, water_features, blocks) |
| `shared/schema.ts` | **MODIFY** — Add new tables and columns (see section 12) |

### Client-Side

| File | Changes |
|------|---------|
| `client/src/components/3DGame/RoadGenerator.ts` | **MAJOR REFACTOR** — Render from street network graph instead of MST |
| `client/src/components/3DGame/BabylonMinimap.ts` | **MAJOR REFACTOR** — Terrain background, street layer, building layer, zoom |
| `client/src/components/3DGame/ProceduralNatureGenerator.ts` | **MAJOR REFACTOR** — Terrain-aware, biome-elevation placement |
| `client/src/components/3DGame/ProceduralBuildingGenerator.ts` | **MODIFY** — Terrain foundations, street-facing orientation |
| `client/src/components/3DGame/SettlementSceneManager.ts` | **MODIFY** — Generate terrain mesh; use street network for roads |
| `client/src/components/3DGame/WorldScaleManager.ts` | **MODIFY** — Replace grid lot placement with street-aligned lots |
| `client/src/components/visualization/GeographyMap.tsx` | **MAJOR REFACTOR** — Terrain viz, street networks, water, layers panel |
| `client/src/components/3DGame/WaterRenderer.ts` | **NEW** — River meshes, lake planes, ocean, waterfalls |
| `client/src/components/3DGame/TerrainRenderer.ts` | **NEW** — Heightmap mesh, splatmap textures, LOD |
| `client/src/components/3DGame/FullScreenMap.ts` | **NEW** — Full-screen map view with labels |

### Shared

| File | Changes |
|------|---------|
| `shared/game-engine/ir-types.ts` | **MAJOR MODIFY** — All new IR types (terrain, streets, water, blocks) |
| `shared/game-engine/types.ts` | **MODIFY** — New type definitions for street patterns, water features |
| `shared/procedural/noise.ts` | **NEW** — Perlin/Simplex noise implementation (seeded, deterministic) |
| `shared/procedural/poisson-disc.ts` | **NEW** — Poisson disc sampling for vegetation/lot placement |
| `shared/procedural/hydraulic-erosion.ts` | **NEW** — Erosion simulation for river carving |

### Export Templates

| File | Changes |
|------|---------|
| `server/services/game-export/babylon/babylon-scene-generator.ts` | **MODIFY** — Terrain mesh, water, streets |
| `server/services/game-export/unity/templates/` | **MODIFY** — Terrain, water, road generation |
| `server/services/game-export/godot/templates/` | **MODIFY** — Terrain, water, road generation |
| `server/services/game-export/unreal/templates/` | **MODIFY** — Landscape, water bodies, spline roads |

---

## Implementation Priority

| Priority | Phase | Effort | Impact | Dependencies |
|----------|-------|--------|--------|-------------|
| **P0** | Phase 2: Street Networks | High | Critical — fixes the core road/address problems | None |
| **P0** | Phase 3: Address Coherence | Medium | Critical — directly solves the address/street mismatch | Phase 2 |
| **P1** | Phase 1: Terrain Foundation | High | High — enables all terrain-aware features | None |
| **P1** | Phase 7: Minimap & Editor | High | High — user-facing visibility of all improvements | Phases 1-3 |
| **P2** | Phase 4: Settlement Shape | Medium | High — terrain-integrated settlements | Phases 1, 2 |
| **P2** | Phase 5: Water Systems | High | High — major missing feature | Phase 1 |
| **P2** | Phase 6: Building Orientation | Medium | Medium — polishes building placement | Phases 2, 3 |
| **P3** | Phase 8: Vegetation | Medium | Medium — visual quality improvement | Phase 1 |
| **P3** | Phase 9: Export Pipeline | High | High — propagates everything to exports | All above |
| **P4** | Phase 10: Dynamic Evolution | High | Medium — advanced simulation feature | Phases 1-6 |

---

## Success Criteria

1. **Streets form connected networks** with realistic topology (no floating points)
2. **Every building address** corresponds to an actual street name at the correct position
3. **House numbers** increase logically along each street
4. **The world editor map** shows streets, terrain, and water features with toggleable layers
5. **The minimap** shows terrain coloring, road network, and building footprints
6. **Settlements conform to terrain** — coastal towns hug the shore, mountain villages terrace hillsides
7. **Rivers flow downhill** from mountains to coast/lakes and are visible in both 3D and maps
8. **Buildings face their street** with appropriate setbacks
9. **Vegetation varies with elevation and moisture** — not uniform scatter
10. **All data exports correctly** through the IR to all target engines
11. **Performance:** Street network generation completes in < 2s for a city; heightmap generation in < 1s
12. **Determinism:** Same seed produces identical terrain, streets, and placement across server and client
