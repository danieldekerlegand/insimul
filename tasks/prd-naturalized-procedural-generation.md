# PRD: Naturalized Procedural Generation

## Introduction

Insimul's procedural generation currently produces flat, grid-based settlements with roads that radiate from a single central point, addresses that don't correspond to street names, and no terrain elevation, water features, or realistic geography. This initiative transforms the entire procedural generation pipeline — from heightmap terrain through street networks, water systems, vegetation, and map visualization — into a coherent, terrain-aware system that produces believable, navigable worlds across the world editor, in-app 3D engine, minimap, and all export targets.

**Reference:** See `NATURALIZED_PROCEDURAL_GENERATION_ROADMAP.md` for the full technical roadmap with algorithms and data structures.

## Goals

- Generate realistic terrain with elevation, slopes, and geographic features (mountains, valleys, canyons, cliffs)
- Replace radial road layouts with proper street network graphs using 6 terrain-appropriate patterns
- Fix the address system so house numbers, street names, and lot positions are spatially coherent
- Generate water features (rivers, lakes, coastlines, bays, harbors) that integrate with terrain
- Make settlements conform to terrain (coastal towns hug shores, mountain villages terrace hillsides)
- Orient buildings to face their streets with terrain-adaptive foundations
- Overhaul the minimap to show terrain, streets, and buildings
- Overhaul the world editor map with terrain visualization, street networks, water features, and interactive layers
- Generate ecologically coherent vegetation based on elevation, moisture, and biome
- Propagate all new data through the export IR to all target engines
- Enable dynamic settlement evolution during simulation (growth, decline, infrastructure)

## User Stories

---

### Phase 1: Terrain Foundation

---

### US-001: Seeded Noise Module
**Description:** As a developer, I need a deterministic Perlin/Simplex noise implementation so that terrain generation is reproducible from the same seed across server and client.

**Acceptance Criteria:**
- [ ] Create `shared/procedural/noise.ts` with a seeded Simplex noise implementation
- [ ] Function signature: `createNoise2D(seed: string): (x: number, y: number) => number` returning values in `[-1, 1]`
- [ ] Add multi-octave fractal noise helper: `fractalNoise(noise, x, y, octaves, lacunarity, persistence) => number`
- [ ] Same seed always produces identical output
- [ ] Unit tests verify determinism: same seed = same values, different seeds = different values
- [ ] Typecheck and lint pass

---

### US-002: Basic Heightmap Generation
**Description:** As a developer, I need a terrain generator that produces 2D heightmaps from noise so that settlements and worlds have elevation data.

**Acceptance Criteria:**
- [ ] Create `server/generators/terrain-generator.ts` with class `TerrainGenerator`
- [ ] Method `generateHeightmap(config: TerrainConfig): number[][]` produces a normalized `[0, 1]` 2D array
- [ ] `TerrainConfig` includes: `seed`, `width`, `height`, `terrainType` (plains/hills/mountains/coast/river/forest/desert), `resolution` (default 128)
- [ ] Each terrain type has distinct noise parameters (amplitude, octaves, frequency) per the roadmap table
- [ ] Resolution scales by settlement type: 128 (village), 256 (town), 512 (city)
- [ ] Uses the seeded noise module from US-001
- [ ] Unit tests verify each terrain type produces height distributions within expected ranges
- [ ] Typecheck and lint pass

---

### US-003: Terrain Feature Stamping
**Description:** As a developer, I need to stamp specific geographic features (peaks, valleys, canyons, cliffs, mesas) onto heightmaps so that terrain has recognizable landmarks.

**Acceptance Criteria:**
- [ ] Add methods to `TerrainGenerator`: `stampPeak()`, `stampValley()`, `stampCanyon()`, `stampCliff()`, `stampMesa()`, `stampCrater()`
- [ ] Each method modifies the heightmap in-place at specified position with configurable radius and intensity
- [ ] Peaks: Gaussian bump; Valleys: inverse Gaussian channel; Canyons: narrow deep cuts; Cliffs: step function; Mesas: flat-topped plateau; Craters: circular depression
- [ ] Add `stampFeatures(heightmap, terrainType, seed)` that auto-places 2-5 features appropriate to the terrain type (e.g., peaks for mountains, mesas for desert)
- [ ] Returns a `TerrainFeature[]` array with id, name, type, position, radius, elevation for each stamped feature
- [ ] Feature names generated from a terrain-appropriate name list (e.g., "Eagle Peak", "Shadow Canyon")
- [ ] Typecheck and lint pass

---

### US-004: Slope and Aspect Map Derivation
**Description:** As a developer, I need slope and aspect maps derived from the heightmap so that building placement and road routing can check terrain steepness and facing direction.

**Acceptance Criteria:**
- [ ] Add method `deriveSlopeMap(heightmap: number[][]): number[][]` to `TerrainGenerator` — returns gradient magnitude at each cell (0 = flat, higher = steeper)
- [ ] Add method `deriveAspectMap(heightmap: number[][]): number[][]` — returns angle in radians of the steepest descent direction at each cell
- [ ] Add helper `isBuildable(slopeMap, x, z, maxSlope = 0.52): boolean` (0.52 rad ≈ 30°)
- [ ] Add helper `getRoadCost(slopeMap, x, z): number` — returns traversal cost (1.0 for flat, exponentially increasing with slope, Infinity above 15° for roads)
- [ ] Unit tests verify: flat heightmap produces zero slope everywhere; a known ramp produces the correct slope value
- [ ] Typecheck and lint pass

---

### US-005: Terrain Schema and IR Additions
**Description:** As a developer, I need the database schema and IR types updated to store and export terrain data so that heightmaps, features, and elevation flow through the system.

**Acceptance Criteria:**
- [ ] Add to `shared/game-engine/ir-types.ts`: `TerrainFeatureIR` interface with fields `id`, `name`, `featureType` (enum of mountain/hill/valley/canyon/cliff/mesa/plateau/crater/ridge/pass), `position: Vec3`, `radius: number`, `elevation: number`, `description: string | null`
- [ ] Add `terrainFeatures: TerrainFeatureIR[]` field to `GeographyIR` interface
- [ ] Add `slopeMap?: number[][]` field to `GeographyIR` interface
- [ ] Add to `shared/schema.ts` settlements table: `elevation` (integer), `slopeProfile` (text: 'flat'|'gentle'|'moderate'|'steep'|'terraced')
- [ ] Create new `terrain_features` table in schema: `id` (uuid), `worldId` (uuid), `name` (text), `featureType` (text), `position` (jsonb), `radius` (number), `elevation` (number), `description` (text)
- [ ] Add corresponding Mongoose model in `server/db/mongo-storage.ts` with CRUD operations
- [ ] Typecheck and lint pass

---

### US-006: 3D Terrain Mesh Rendering
**Description:** As a developer, I need the Babylon.js game to render a terrain mesh from the heightmap so that the 3D world has visible elevation instead of a flat plane.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/TerrainRenderer.ts` with class `TerrainRenderer`
- [ ] Method `createTerrainMesh(heightmap: number[][], terrainSize: number, scene: Scene): Mesh` generates a subdivided ground mesh with vertex Y positions from the heightmap
- [ ] Apply biome-specific vertex coloring or a simple multi-material splatmap (green for low elevation, brown for mid, gray/white for high)
- [ ] Terrain mesh casts and receives shadows
- [ ] Integrate into `SettlementSceneManager.ts`: when heightmap data is available, use `TerrainRenderer` instead of the flat ground plane
- [ ] Existing flat-ground fallback preserved when no heightmap data is present
- [ ] Typecheck and lint pass

---

### Phase 2: Naturalized Street Networks

---

### US-007: Street Network Data Structures
**Description:** As a developer, I need shared TypeScript types for the street network graph (nodes, edges, network) so that all generators and renderers use a consistent data model.

**Acceptance Criteria:**
- [ ] Add to `shared/game-engine/types.ts`: `StreetNode` interface with `id`, `position: {x: number, z: number}`, `elevation: number`, `type` ('intersection'|'dead_end'|'T_junction'|'curve_point')
- [ ] Add `StreetEdge` interface with `id`, `name`, `fromNodeId`, `toNodeId`, `streetType` ('main_road'|'avenue'|'residential'|'alley'|'lane'|'boulevard'|'highway'), `width`, `waypoints: Vec3[]`, `length`, `condition`, `traffic`, `sidewalks: boolean`, `hasStreetLights: boolean`
- [ ] Add `StreetNetwork` interface with `nodes: StreetNode[]`, `edges: StreetEdge[]`
- [ ] Add `StreetNetworkIR` to `shared/game-engine/ir-types.ts` mirroring the above for export
- [ ] Add `StreetNodeIR` and `StreetEdgeIR` to IR types
- [ ] Update `SettlementIR` to include optional `streetNetwork: StreetNetworkIR`
- [ ] Typecheck and lint pass

---

### US-008: Street Generator Core with Organic Pattern
**Description:** As a developer, I need a street generator module that produces connected street network graphs, starting with the organic/medieval layout pattern used by villages and old towns.

**Acceptance Criteria:**
- [ ] Create `server/generators/street-generator.ts` with class `StreetGenerator`
- [ ] Method `generateOrganic(config: StreetGenConfig): StreetNetwork` generates a connected graph
- [ ] `StreetGenConfig` includes: `center: {x, z}`, `radius: number`, `settlementType`, `seed`, `slopeMap` (optional)
- [ ] Algorithm: start from center point, generate 3-5 main roads radiating at irregular angles, branch secondary roads off main roads at varied angles, add tertiary curved connections
- [ ] Apply Perlin noise displacement to waypoints for organic curves
- [ ] If slopeMap provided, roads avoid cells with slope cost > threshold (A* pathfinding on slope grid)
- [ ] All generated edges have non-zero length, valid from/to node references, and at least 2 waypoints
- [ ] Generated graph is connected (all nodes reachable from any other node)
- [ ] Unit test: generates a valid connected graph with expected node/edge count range for a village config
- [ ] Typecheck and lint pass

---

### US-009: Grid Street Pattern
**Description:** As a developer, I need a grid-based street layout pattern for planned towns and cities.

**Acceptance Criteria:**
- [ ] Add method `generateGrid(config: StreetGenConfig): StreetNetwork` to `StreetGenerator`
- [ ] Generates an N x M block grid where N and M scale with settlement radius
- [ ] Perturb grid intersection positions with low-amplitude noise for imperfection (±2-5% of block size)
- [ ] Optionally add 1-2 diagonal avenues cutting across the grid at 45° angles (for cities with population > 3000)
- [ ] Main streets (every Nth row/column) are wider (`boulevard` or `avenue` type); others are `residential`
- [ ] Grid axis optionally rotated to align with a provided direction vector (for terrain/coast alignment)
- [ ] All edges have correct from/to references and the graph is connected
- [ ] Unit test verifies grid structure and connectivity
- [ ] Typecheck and lint pass

---

### US-010: Radial Street Pattern
**Description:** As a developer, I need a radial/concentric street layout for capital cities and fortress towns.

**Acceptance Criteria:**
- [ ] Add method `generateRadial(config: StreetGenConfig): StreetNetwork` to `StreetGenerator`
- [ ] Central plaza node with 6-8 radial boulevard edges emanating outward
- [ ] 2-4 concentric ring road edges at increasing radii connecting the radials
- [ ] Radial roads may curve slightly (noise-based lateral displacement)
- [ ] Inner ring edges are `boulevard` type; outer ring edges are `residential`
- [ ] All intersections properly connected (radial × ring creates intersection nodes)
- [ ] Unit test verifies radial structure and connectivity
- [ ] Typecheck and lint pass

---

### US-011: Linear Street Pattern
**Description:** As a developer, I need a linear street layout for river towns, mining towns, and highway stops that cluster along a single main artery.

**Acceptance Criteria:**
- [ ] Add method `generateLinear(config: StreetGenConfig & { axis: Vec2 }): StreetNetwork` to `StreetGenerator`
- [ ] One main street running along the provided axis direction through the settlement center
- [ ] Short perpendicular side streets branching off the main street at semi-regular intervals
- [ ] Main street is `main_road` type; side streets are `residential` or `lane`
- [ ] Side streets alternate left/right or appear on both sides
- [ ] Optional: main street curves to follow a provided path (river centerline)
- [ ] Unit test verifies linear topology
- [ ] Typecheck and lint pass

---

### US-012: Hillside Terraced Street Pattern
**Description:** As a developer, I need a terraced/switchback street layout for mountain settlements where roads follow elevation contour lines.

**Acceptance Criteria:**
- [ ] Add method `generateHillside(config: StreetGenConfig, heightmap: number[][]): StreetNetwork` to `StreetGenerator`
- [ ] Generate contour-following roads at 3-5 elevation levels within the settlement radius
- [ ] Connect contour roads with switchback ramps (zigzag segments going uphill)
- [ ] Contour roads are `residential` type; switchback connectors are `lane` type
- [ ] Building lots are placed on the flatter terrace areas between contour roads
- [ ] Requires heightmap input; falls back to organic pattern if heightmap is not provided
- [ ] Unit test with a known sloped heightmap verifies terrace structure
- [ ] Typecheck and lint pass

---

### US-013: Waterfront Street Pattern
**Description:** As a developer, I need a waterfront street layout for port towns and lakeside villages where the main road follows the waterline.

**Acceptance Criteria:**
- [ ] Add method `generateWaterfront(config: StreetGenConfig & { shorelinePoints: Vec2[] }): StreetNetwork` to `StreetGenerator`
- [ ] Main road follows the provided shoreline curve (offset inland by a configurable distance)
- [ ] Perpendicular roads extend inland from the waterfront road at regular intervals
- [ ] A secondary parallel road runs further inland for larger settlements
- [ ] Waterfront road is `boulevard` type; perpendicular roads are `residential`
- [ ] Dock/pier stub nodes extend seaward from the waterfront road between perpendicular streets
- [ ] Unit test with a mock shoreline verifies waterfront topology
- [ ] Typecheck and lint pass

---

### US-014: Street Pattern Selection Logic
**Description:** As a developer, I need automatic selection of the appropriate street pattern based on settlement type, terrain, and other attributes so that the geography generator picks the right algorithm.

**Acceptance Criteria:**
- [ ] Add function `selectStreetPattern(config: GeographyConfig): StreetPatternType` to `street-generator.ts`
- [ ] Selection rules: coast → waterfront; river → linear; mountains + steep → hillside; city + large pop → grid; city + capital → radial; village → organic; older settlements (foundedYear < 1800) → organic; newer → grid
- [ ] Add public method `generate(config: StreetGenConfig, geographyConfig: GeographyConfig, heightmap?: number[][]): StreetNetwork` that calls `selectStreetPattern` and dispatches to the correct algorithm
- [ ] Pattern type is stored on the settlement record for reference
- [ ] Unit tests verify correct pattern selection for each terrain/type combination
- [ ] Typecheck and lint pass

---

### US-015: Street Naming System
**Description:** As a developer, I need a contextual street naming system that assigns unique, hierarchically-appropriate names to streets so that street names are consistent and meaningful.

**Acceptance Criteria:**
- [ ] Add method `assignStreetNames(network: StreetNetwork, seed: string): void` to `StreetGenerator` that mutates edge names in-place
- [ ] Street type determines suffix: boulevards/avenues for main arteries, streets for through-roads, drives/ways for curved residential, lanes/courts for dead-ends/cul-de-sacs, alleys for narrow passages
- [ ] Grid layouts use numbered cross-streets (1st St, 2nd St, ...) for one axis and named streets for the other
- [ ] Named streets draw from expandable name pools: tree names, landmark references, geographic terms, historical figure names (seeded random selection)
- [ ] No two streets in the same settlement share the same name
- [ ] Continuous street segments (multiple edges forming one road) share the same name
- [ ] Unit tests verify uniqueness and suffix-type correspondence
- [ ] Typecheck and lint pass

---

### US-016: Integrate Street Generator into Geography Generator
**Description:** As a developer, I need the geography generator to use the new street generator instead of its current random street placement so that settlements have proper street networks.

**Acceptance Criteria:**
- [ ] Refactor `geography-generator.ts`: replace `generateStreets()` with a call to `StreetGenerator.generate()`
- [ ] New generation flow: `generateStreetNetwork() → deriveDistricts() → generateBuildings()`
- [ ] Districts derived from street regions using Voronoi-like clustering around seed points, bounded by major streets
- [ ] Buildings generated along street edges (placeholder: evenly spaced positions along each edge — proper lot placement comes in Phase 3)
- [ ] The settlement's `streets` field in the DB stores the `StreetNetwork` object (serialized as JSONB)
- [ ] Existing settlement data migration: old-format streets still load without errors (backward compat)
- [ ] Integration test: `GeographyGenerator.generate()` produces a settlement with a connected street network, unique street names, and buildings assigned to streets
- [ ] Typecheck and lint pass

---

### US-017: Road Renderer Update for Street Networks
**Description:** As a developer, I need the Babylon.js road renderer to render intra-settlement streets from the street network graph instead of radial spokes from center.

**Acceptance Criteria:**
- [ ] Update `RoadGenerator.ts`: add method `generateStreetNetworkRoads(network: StreetNetworkIR, sampleHeight: (x, z) => number): RoadSegment[]`
- [ ] Each `StreetEdgeIR` is rendered as a ribbon mesh following its waypoints (existing ribbon generation logic reusable)
- [ ] Road width varies by street type: boulevard=6, avenue=5, main_road=4, residential=3, lane=2, alley=1.5
- [ ] Road material/color varies by street type: main roads darker, residential lighter, alleys dirt-colored
- [ ] `SettlementSceneManager.ts` updated to call the new method when street network data is present in the settlement IR
- [ ] Existing MST-based inter-settlement road generation preserved (not replaced)
- [ ] Fallback: if no street network data, use existing radial road generation
- [ ] Typecheck and lint pass

---

### Phase 3: Address & Lot Coherence

---

### US-018: Street-Frontage Lot Placement
**Description:** As a developer, I need lots placed along street edges with proper frontage so that buildings line streets realistically instead of sitting on a grid.

**Acceptance Criteria:**
- [ ] Create function `generateLotsAlongStreets(network: StreetNetwork, config: GeographyConfig): LotPosition[]` in `street-generator.ts` or a new `lot-generator.ts`
- [ ] `LotPosition` includes: `position: Vec3`, `facingAngle: number`, `width: number`, `depth: number`, `side: 'left'|'right'`, `distanceAlongStreet: number`, `streetEdgeId: string`
- [ ] Walk along each street edge, placing lots on both sides with configurable lot width (village=15, town=12, city=10), depth, and setback from street centerline
- [ ] Lots do not overlap each other or the street itself
- [ ] Lot facing angle is perpendicular to the street direction at the lot's position (facing toward the street)
- [ ] Total lot count approximately matches `GeographyConfig.population / 4` (avg 4 people per building)
- [ ] Typecheck and lint pass

---

### US-019: Address Assignment Algorithm
**Description:** As a developer, I need house numbers assigned based on position along the street so that addresses are spatially coherent — odd on the left, even on the right, increasing outward from settlement center.

**Acceptance Criteria:**
- [ ] Create function `assignAddresses(lots: LotPosition[], network: StreetNetwork, centerPoint: Vec2): void` that sets `houseNumber`, `streetName`, and `address` on each lot
- [ ] Lots on the left side of the street (relative to direction away from center) get odd numbers; right side gets even numbers
- [ ] Numbers increase monotonically moving away from the settlement center along each street
- [ ] In grid layouts, use block-based numbering: addresses in the 100s for the first block, 200s for the second, etc.
- [ ] Number gaps proportional to physical distance between lots (e.g., 50m gap → skip ~10 numbers)
- [ ] Corner lots get the address of the higher-priority street they face
- [ ] Full address string: `"{houseNumber} {streetName}"` (e.g., "42 Oak Ave")
- [ ] Unit test: generate lots along a test street, verify odd/even sides, monotonic increase, no duplicates within the settlement
- [ ] Typecheck and lint pass

---

### US-020: Block Structure Generation
**Description:** As a developer, I need blocks defined as enclosed regions bounded by streets so that lots can be grouped into navigable city blocks with address ranges.

**Acceptance Criteria:**
- [ ] Create function `generateBlocks(network: StreetNetwork): Block[]` that finds enclosed polygons in the street graph
- [ ] `Block` interface: `id`, `boundaryStreetIds: string[]`, `polygon: Vec2[]`, `districtId: string`, `blockNumber: number`, `center: Vec3`
- [ ] Use minimal cycle detection on the planar street graph to find enclosed faces
- [ ] Each lot assigned to the block whose polygon contains it
- [ ] Block numbers increase outward from settlement center (100, 200, 300, ...)
- [ ] Add `Block` and `BlockIR` types to `shared/game-engine/types.ts` and `ir-types.ts`
- [ ] Typecheck and lint pass

---

### US-021: Lot Schema Updates
**Description:** As a developer, I need the lots database table updated with new fields so that street-aligned lot data persists correctly.

**Acceptance Criteria:**
- [ ] Add fields to `lots` table in `shared/schema.ts`: `lotWidth` (number), `lotDepth` (number), `streetEdgeId` (text), `distanceAlongStreet` (number), `side` (text: 'left'|'right'), `blockId` (text), `facingAngle` (number), `elevation` (number), `foundationType` (text: 'flat'|'raised'|'stilted'|'terraced')
- [ ] Update `LotIR` in `ir-types.ts` with matching fields
- [ ] Update `mongo-storage.ts` Lot Mongoose schema to include new fields
- [ ] Update `persistLotsAndBuildings()` in `geography-generator.ts` to write the new fields when generating lots
- [ ] Existing lots without new fields default to sensible values (lotWidth=12, lotDepth=16, side='left', facingAngle=0, elevation=0, foundationType='flat')
- [ ] Typecheck and lint pass

---

### US-022: Address Validation Pass
**Description:** As a developer, I need an address validation step that runs after generation to catch and fix inconsistencies so that no settlement has duplicate or invalid addresses.

**Acceptance Criteria:**
- [ ] Create function `validateAddresses(lots: LotData[], streetNetwork: StreetNetwork): ValidationResult` in the geography generator or a dedicated validation module
- [ ] `ValidationResult` includes: `valid: boolean`, `errors: string[]`, `warnings: string[]`, `fixesApplied: string[]`
- [ ] Checks: no duplicate addresses within a settlement; all house numbers on a street are monotonically increasing in the correct direction; all lots reference a valid street edge; street names in lot records match the assigned street edge name
- [ ] Auto-fix: renumber duplicates by appending a suffix (e.g., "42A Oak Ave") and log the fix
- [ ] Validation runs automatically at end of `GeographyGenerator.generate()`
- [ ] Errors logged to console with settlement ID for debugging
- [ ] Typecheck and lint pass

---

### Phase 4: Settlement Shape & Terrain Integration

---

### US-023: Settlement Boundary Generation
**Description:** As a developer, I need terrain-aware settlement boundaries so that settlements have irregular shapes that conform to their geography instead of being circles or squares.

**Acceptance Criteria:**
- [ ] Create function `generateSettlementBoundary(config: GeographyConfig, heightmap?: number[][]): SettlementBoundary` in `geography-generator.ts` or `terrain-generator.ts`
- [ ] `SettlementBoundary` interface: `polygon: Vec2[]`, `area: number`, `perimeterType: 'natural'|'walled'|'open'`
- [ ] Plains/forest: roughly circular polygon with Perlin noise perturbation on the radius
- [ ] Coast: semi-circular, one side follows the coastline (sea level contour)
- [ ] Mountains: elongated, confined to lower-slope areas
- [ ] River: elongated along the river axis
- [ ] Desert: compact polygon centered on water source
- [ ] Hills: follows ridge and valley lines
- [ ] Store boundary polygon on settlement record in DB (JSONB field `boundaryPolygon`)
- [ ] Typecheck and lint pass

---

### US-024: Terrain-Influenced District Placement
**Description:** As a developer, I need districts placed according to terrain suitability so that commercial districts occupy flat areas, wealthy districts get scenic overlooks, and industrial districts are near water.

**Acceptance Criteria:**
- [ ] Refactor `deriveDistricts()` (or the equivalent district-generation step) to accept heightmap and slope map
- [ ] Commercial/market district placed at the flattest, most central accessible area (lowest average slope near center)
- [ ] Wealthy residential placed at moderate elevation with good views (high elevation, moderate slope)
- [ ] Working-class residential placed in lower-lying or less desirable terrain
- [ ] Industrial district placed near water features or settlement periphery
- [ ] Religious/civic district placed at highest accessible point within settlement
- [ ] District placement falls back to current radial placement when no heightmap is available
- [ ] Typecheck and lint pass

---

### US-025: Settlement Subtype System
**Description:** As a developer, I need expanded settlement subtypes so that generation can produce distinct settlement forms like port cities, mountain villages, mining towns, and fortress towns.

**Acceptance Criteria:**
- [ ] Add `settlementSubtype` field (text) to `settlements` table in `shared/schema.ts`
- [ ] Define subtypes: 'port_city', 'mountain_village', 'river_crossing', 'mining_town', 'fortress_town', 'oasis_settlement', 'fishing_village', 'crossroads_town', 'university_town', 'market_town', 'cliff_dwelling', 'island_settlement', 'valley_town', 'standard'
- [ ] Add function `inferSettlementSubtype(config: GeographyConfig): string` that selects a subtype based on terrain, population, and settlement type
- [ ] Each subtype includes a `SubtypeConfig` with: required landmark types, preferred street pattern, building style hints, and special features (e.g., port_city requires harbor, fortress_town requires walls)
- [ ] Subtype is auto-assigned during generation and stored on the settlement record
- [ ] Typecheck and lint pass

---

### US-026: Elevation-Aware Building Placement
**Description:** As a developer, I need buildings placed with terrain-adaptive foundations so that buildings on slopes have raised foundations, stilts, or retaining walls instead of floating or clipping through terrain.

**Acceptance Criteria:**
- [ ] Create function `calculateFoundation(lotPosition: Vec3, lotSize: {w, d}, heightmap: number[][]): FoundationData`
- [ ] `FoundationData` interface: `type: 'flat'|'raised'|'stilted'|'terraced'`, `baseElevation: number`, `foundationHeight: number`, `retainingWall: boolean`
- [ ] Logic: sample 4 corner elevations; if delta < 0.3 → flat; < 1.0 → raised; < 2.5 → stilted; else → terraced with retaining wall
- [ ] Store `foundationType` and `elevation` on each lot record
- [ ] `ProceduralBuildingGenerator.ts` updated to add a foundation mesh (box or stilts) beneath buildings where `foundationHeight > 0`
- [ ] Typecheck and lint pass

---

### US-027: Settlement Elevation Profile
**Description:** As a developer, I need settlement-level elevation metadata so that maps and UIs can display elevation information.

**Acceptance Criteria:**
- [ ] Create function `calculateElevationProfile(heightmap: number[][], boundary: Vec2[]): SettlementElevation`
- [ ] `SettlementElevation` includes: `minElevation`, `maxElevation`, `averageElevation`, `slopeProfile` ('flat'|'gentle'|'moderate'|'steep'|'terraced')
- [ ] `slopeProfile` derived from average slope within boundary: < 5° flat, < 15° gentle, < 25° moderate, < 35° steep, else terraced
- [ ] Generate contour lines at configurable intervals (default every 10% of elevation range): `contourLines: {elevation: number, points: Vec2[]}[]`
- [ ] Store `elevation`, `slopeProfile`, and `contourLines` (JSONB) on settlement record
- [ ] Typecheck and lint pass

---

### Phase 5: Water Systems

---

### US-028: River Generation
**Description:** As a developer, I need procedural river generation that carves realistic waterways through terrain so that worlds have rivers flowing from mountains to coasts/lakes.

**Acceptance Criteria:**
- [ ] Create `server/generators/water-generator.ts` with class `WaterGenerator`
- [ ] Method `generateRivers(heightmap: number[][], config: {seed, count, terrainType}): RiverData[]` produces 1-3 rivers
- [ ] Algorithm: place sources at high-elevation points; simulate flow following steepest descent with momentum/inertia; accumulate width downstream; terminate at sea level, lake, or map edge
- [ ] Apply meander displacement (sine wave perpendicular to flow, amplitude increases on flatter terrain)
- [ ] Carve river channel into heightmap (lower elevation along river path, proportional to flow volume)
- [ ] `RiverData` includes: `id`, `name`, `source: Vec3`, `mouth: Vec3`, `waypoints: Vec3[]`, `widthProfile: number[]`, `flowDirection: string`
- [ ] River names generated from a name pool (e.g., "Silver River", "Blackwater Creek")
- [ ] Typecheck and lint pass

---

### US-029: River Crossing Points
**Description:** As a developer, I need river crossing points (bridges, fords) generated where streets intersect rivers so that NPCs and players can cross.

**Acceptance Criteria:**
- [ ] Add method `generateCrossings(rivers: RiverData[], streetNetwork: StreetNetwork): RiverCrossingData[]` to `WaterGenerator`
- [ ] For each street edge that crosses a river (line-segment intersection test), generate a crossing point
- [ ] Crossing type determined by river width at the crossing: width < 5 → ford; width < 15 → bridge; width ≥ 15 → large bridge or ferry
- [ ] `RiverCrossingData` includes: `position: Vec3`, `type: 'bridge'|'ford'|'ferry'`, `streetEdgeId`, `riverId`, `name`
- [ ] Crossing names follow pattern: "{StreetName} Bridge" or "{RiverName} Ford"
- [ ] Store crossings on the river data and add `crossingPoints` field to `RiverIR`
- [ ] Typecheck and lint pass

---

### US-030: Lake Generation
**Description:** As a developer, I need procedural lake generation from terrain basins so that worlds have natural bodies of standing water.

**Acceptance Criteria:**
- [ ] Add method `generateLakes(heightmap: number[][], config: {seed, terrainType}): LakeData[]` to `WaterGenerator`
- [ ] Algorithm: find local minima (basins) in heightmap; fill each basin to its lowest overflow point (pour point); lake surface = flat at pour point elevation; lake boundary = heightmap contour at pour point elevation
- [ ] `LakeData` includes: `id`, `name`, `center: Vec3`, `elevation: number`, `boundaryPolygon: Vec2[]`, `area: number`, `maxDepth: number`
- [ ] Generate 0-3 lakes depending on terrain type (more in forest/hills, none in desert unless oasis)
- [ ] Lake names from pool (e.g., "Mirror Lake", "Shadow Mere")
- [ ] Typecheck and lint pass

---

### US-031: Coastline and Bay Generation
**Description:** As a developer, I need coastline and bay shapes for coastal settlements so that the water's edge has realistic geometry with beaches, cliffs, and sheltered bays.

**Acceptance Criteria:**
- [ ] Add method `generateCoastline(heightmap: number[][], seaLevel: number): CoastlineData` to `WaterGenerator`
- [ ] Coastline extracted as the contour of the heightmap at sea level with noise perturbation for natural irregularity
- [ ] Classify coastline segments by slope: gentle slope → beach; steep slope → cliff; moderate → rocky shore
- [ ] Add method `generateBays(coastline: CoastlineData, seed: string): BayData[]` that stamps 0-2 concave indentations into the coastline
- [ ] `CoastlineData` includes `segments: {points: Vec2[], type: 'beach'|'cliff'|'rocky'|'marsh'}[]`
- [ ] `BayData` includes `id`, `name`, `center: Vec3`, `mouthWidth`, `depth`, `boundaryPolygon: Vec2[]`, `harborSuitability: number (0-1)`
- [ ] Typecheck and lint pass

---

### US-032: Harbor and Dock Generation
**Description:** As a developer, I need harbors and docks generated for coastal and river settlements so that waterfront towns have functional port infrastructure.

**Acceptance Criteria:**
- [ ] Add method `generateHarbor(settlement: GeographyConfig, coastline: CoastlineData, bays: BayData[]): HarborData | null` to `WaterGenerator`
- [ ] Harbor placed in the most sheltered bay (highest `harborSuitability`), or along the calmest coastline segment
- [ ] Generate 2-6 docks extending into water from the harbor area: `DockData` with `position`, `length`, `width`, `rotation`, `dockType` ('fishing'|'trade'|'ferry'|'military')
- [ ] Optionally place a lighthouse at the harbor entrance or on a nearby promontory
- [ ] `HarborData` includes `id`, `name`, `position`, `docks: DockData[]`, `lighthousePosition: Vec3 | null`, `waterDepth`, `shelterRating`
- [ ] Only generated for settlements with terrain 'coast' or 'river' and population > 50
- [ ] Typecheck and lint pass

---

### US-033: Water Feature Schema and IR Types
**Description:** As a developer, I need schema and IR types for all water features so that rivers, lakes, coastlines, bays, and harbors persist and export correctly.

**Acceptance Criteria:**
- [ ] Add to `ir-types.ts`: `RiverIR`, `RiverCrossingIR`, `LakeIR`, `CoastlineIR`, `CoastSegmentIR`, `BayIR`, `HarborIR`, `DockIR` interfaces per the roadmap specifications
- [ ] Add to `GeographyIR`: `rivers: RiverIR[]`, `lakes: LakeIR[]`, `coastline: CoastlineIR | null`, `bays: BayIR[]`, `harbors: HarborIR[]`, `seaLevel: number`
- [ ] Add to `settlements` schema: `waterFeatures` (jsonb array), `hasHarbor` (boolean), `harborData` (jsonb)
- [ ] Create `water_features` table in schema: `id`, `worldId`, `featureType` (text: 'river'|'lake'|'bay'|'coastline'), `name`, `data` (jsonb)
- [ ] Add Mongoose model and CRUD operations in `mongo-storage.ts`
- [ ] Typecheck and lint pass

---

### US-034: Water Rendering in 3D
**Description:** As a developer, I need water features rendered in the Babylon.js 3D engine so that rivers, lakes, and oceans are visible in-game.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/WaterRenderer.ts` with class `WaterRenderer`
- [ ] Method `createRiverMesh(river: RiverIR, scene: Scene): Mesh` generates a ribbon mesh following river waypoints with width from widthProfile, at the correct elevation
- [ ] Method `createLakeMesh(lake: LakeIR, scene: Scene): Mesh` generates a flat plane clipped to the boundary polygon at the lake's elevation
- [ ] Method `createOceanMesh(seaLevel: number, terrainSize: number, scene: Scene): Mesh` generates a large water plane at sea level
- [ ] Water material: semi-transparent blue with subtle animated UV offset for flow effect (rivers) or gentle wave effect (lakes/ocean)
- [ ] Method `createBridgeMesh(crossing: RiverCrossingIR, scene: Scene): Mesh` generates a simple arch or flat bridge mesh at crossing points
- [ ] Integrate into `SettlementSceneManager.ts`: render water features when water data is present in IR
- [ ] Typecheck and lint pass

---

### Phase 6: Building Orientation & Placement

---

### US-035: Street-Facing Building Orientation
**Description:** As a developer, I need buildings oriented to face their assigned street so that building entrances and facades align with the road network.

**Acceptance Criteria:**
- [ ] Update `ProceduralBuildingGenerator.ts` or building placement logic: when a lot has `facingAngle` set, use it as the building's Y-axis rotation
- [ ] `facingAngle` calculated perpendicular to the street direction at the lot's position, facing toward the street
- [ ] Add ±3° random rotation variance (seeded) for natural imperfection
- [ ] Update `BuildingIR.rotation` to use the lot's `facingAngle` in `ir-generator.ts`
- [ ] Buildings without `facingAngle` data fall back to existing rotation logic
- [ ] Typecheck and lint pass

---

### US-036: Corner Building Handling
**Description:** As a developer, I need corner buildings (at intersections) handled specially so that they face the correct street and potentially have distinctive shapes.

**Acceptance Criteria:**
- [ ] In lot generation, identify corner lots: lots whose `distanceAlongStreet` is within one lot width of a street node that connects to another street
- [ ] Corner lots face the higher-priority street (by `streetType` hierarchy: boulevard > avenue > main_road > residential > lane > alley)
- [ ] If streets are equal priority, face the one with more frontage
- [ ] Mark corner lots with a boolean `isCorner` flag in `LotPosition`
- [ ] Corner lots optionally have slightly larger dimensions (1.2× width) to accommodate more prominent buildings
- [ ] Typecheck and lint pass

---

### US-037: Building Scale by Zone
**Description:** As a developer, I need building size and style to vary by urban zone so that downtown buildings are taller and denser while suburban buildings are shorter with more yard space.

**Acceptance Criteria:**
- [ ] Create function `getZoneConfig(distanceFromCenter: number, settlementRadius: number, settlementType: string): ZoneConfig`
- [ ] `ZoneConfig` includes: `zoneName` ('downtown'|'mixed_use'|'inner_residential'|'outer_residential'|'rural_edge'|'industrial'), `lotWidth`, `lotDepth`, `maxFloors`, `setback`, `sideGap`
- [ ] Downtown: lots 8×10, 2-5 floors, 0 setback, 0 side gap (shared walls)
- [ ] Mixed use: lots 10×14, 2-3 floors, 1m setback
- [ ] Inner residential: lots 12×16, 1-2 floors, 2m setback
- [ ] Outer residential: lots 15×25, 1-2 floors, 4m setback
- [ ] Rural edge: lots 25×40, 1 floor, 8m setback
- [ ] Update lot generation to use zone-based lot dimensions
- [ ] Update building generation to use zone-based floor counts
- [ ] Typecheck and lint pass

---

### US-038: Terrain-Adaptive Foundation Rendering
**Description:** As a developer, I need visible foundation meshes rendered beneath buildings on slopes so that buildings don't float or clip through the terrain.

**Acceptance Criteria:**
- [ ] In `ProceduralBuildingGenerator.ts`, when building a mesh: check `foundationType` and `foundationHeight` from lot data
- [ ] 'flat': no additional geometry (current behavior)
- [ ] 'raised': add a box mesh beneath the building matching the building footprint with height = foundationHeight, using a stone/concrete material
- [ ] 'stilted': add 4 cylinder meshes (stilts) at corners with height = foundationHeight
- [ ] 'terraced': add a retaining wall mesh (thin box) on the downhill side of the building
- [ ] Foundation meshes use a neutral stone/concrete material color
- [ ] Typecheck and lint pass

---

### Phase 7: Minimap & World Editor Overhaul

---

### US-039: Minimap Terrain Background Layer
**Description:** As a developer, I need the minimap to display terrain coloring from the heightmap so that players can see elevation and biome at a glance.

**Acceptance Criteria:**
- [ ] Update `BabylonMinimap.ts`: add a terrain background rendering method
- [ ] Render a colored image/canvas onto the minimap background based on heightmap data: green for low elevation, brown for mid, gray/white for high
- [ ] Overlay biome-specific tinting (forest=darker green, desert=tan, coast=blue at sea level)
- [ ] Water features (rivers, lakes) rendered as blue pixels/lines on the minimap background
- [ ] Terrain background updates when the player moves to a new settlement or region
- [ ] Falls back to current solid dark background when no heightmap data is available
- [ ] Typecheck and lint pass

---

### US-040: Minimap Street Network Layer
**Description:** As a developer, I need the minimap to display street lines so that players can see the road network.

**Acceptance Criteria:**
- [ ] Add a street rendering layer to `BabylonMinimap.ts` drawn on top of the terrain background
- [ ] Each street edge rendered as a line on the minimap, transformed from world coordinates to minimap pixel coordinates
- [ ] Line width proportional to street type (main roads = 2px, residential = 1px, alleys = hairline)
- [ ] Line color: light gray for residential, white for main roads
- [ ] Street layer only rendered when street network data is available in the current settlement
- [ ] Performance: street lines are pre-rendered to a cached texture and updated only when the viewed settlement changes
- [ ] Typecheck and lint pass

---

### US-041: Minimap Building Footprint Layer
**Description:** As a developer, I need building footprints shown on the minimap at higher zoom levels so that players can see individual buildings.

**Acceptance Criteria:**
- [ ] Add a building rendering layer to `BabylonMinimap.ts`
- [ ] Each building rendered as a small rectangle (2-3px) at its lot position, rotated by facingAngle
- [ ] Color-coded: residential = light green, commercial = light blue, civic/landmark = yellow
- [ ] Only rendered when minimap zoom level is ≥ 2× (to avoid clutter at default zoom)
- [ ] Existing dot markers (player, NPC, quest) render on top of building layer
- [ ] Typecheck and lint pass

---

### US-042: Minimap Zoom and Interaction
**Description:** As a developer, I need the minimap to support zoom and basic interaction so that players can explore the map at different scales.

**Acceptance Criteria:**
- [ ] Add zoom support to `BabylonMinimap.ts`: zoom in/out via mouse wheel or GUI buttons (+ / -)
- [ ] Zoom range: 1× (default, shows full settlement) to 8× (close detail)
- [ ] Minimap view centers on the player position and pans as player moves
- [ ] Add a north indicator (small "N" or arrow) in a corner of the minimap
- [ ] Add a compass rose or direction indicator
- [ ] Zoom level persists within a session but resets to 1× on settlement change
- [ ] Typecheck and lint pass

---

### US-043: Full-Screen Map View
**Description:** As a developer, I need a full-screen 2D map overlay so that players can view the entire settlement or world with labels, buildings, and streets.

**Acceptance Criteria:**
- [ ] Create `client/src/components/3DGame/FullScreenMap.ts` using Babylon.js GUI (AdvancedDynamicTexture.CreateFullscreenUI)
- [ ] Toggle with a configurable key (default: M) or button
- [ ] Shows 2D top-down view with: terrain coloring, street network with name labels along centerlines, building footprints with labels for businesses/landmarks, player position and facing direction, quest markers
- [ ] Pan by dragging and zoom with scroll wheel
- [ ] Close with same key or Escape
- [ ] Performance: render to a cached canvas, update only when data changes
- [ ] Integrate into the game's input system so other controls are disabled while map is open
- [ ] Typecheck and lint pass

---

### US-044: World Editor Terrain Visualization
**Description:** As a developer, I need the world editor geography map to display terrain coloring and elevation so that editors can see the geographic landscape.

**Acceptance Criteria:**
- [ ] Update `GeographyMap.tsx`: render terrain background colors based on each settlement/state's terrain type using the existing `TERRAIN_FILL` color scheme, but applied to the full region area (not just settlement dots)
- [ ] If heightmap data is available for a settlement, render a small terrain preview when that settlement is selected (thumbnail heightmap-colored image)
- [ ] Show terrain feature markers (mountain icon, valley icon) at feature positions within country/state regions
- [ ] Add contour line overlay option when viewing a specific settlement's detail
- [ ] Typecheck and lint pass

---

### US-045: World Editor Street Network Display
**Description:** As a developer, I need the world editor to display street networks within settlements so that editors can see and verify the generated road layout.

**Acceptance Criteria:**
- [ ] Update `GeographyMap.tsx`: when a settlement is selected/expanded, render its street network as SVG lines within the settlement area
- [ ] Street edges drawn as `<line>` or `<path>` elements with width proportional to street type
- [ ] Street names rendered as `<text>` elements positioned along the edge centerline, rotated to follow the street direction
- [ ] Street names shown at zoom level ≥ 2× to avoid clutter
- [ ] Color-code streets by type (boulevard=dark gray, residential=light gray, alley=dashed)
- [ ] Intersection nodes rendered as small circles
- [ ] Typecheck and lint pass

---

### US-046: World Editor Water Feature Display
**Description:** As a developer, I need the world editor to display rivers, lakes, and coastlines so that editors can see water geography.

**Acceptance Criteria:**
- [ ] Update `GeographyMap.tsx`: render rivers as blue SVG `<path>` elements with width following widthProfile
- [ ] Render lakes as blue filled SVG `<polygon>` elements
- [ ] Render coastlines as thick blue SVG `<path>` elements
- [ ] Render harbors with small dock markers (rectangles extending into water)
- [ ] River crossing points (bridges) shown as small markers where streets cross rivers
- [ ] Water features render at all zoom levels (rivers are significant geography)
- [ ] Typecheck and lint pass

---

### US-047: World Editor Layers Panel
**Description:** As a developer, I need a layers toggle panel in the world editor map so that editors can show/hide different map features.

**Acceptance Criteria:**
- [ ] Add a layers panel component to `GeographyMap.tsx` (floating panel with checkboxes)
- [ ] Toggleable layers: Terrain, Political Boundaries, Settlements, Streets, Street Names, Buildings, Water Features, Terrain Features, Districts, Labels
- [ ] Default on: Terrain, Settlements, Political Boundaries
- [ ] Default off: Streets, Street Names, Buildings, Districts (these auto-enable when zooming into a settlement)
- [ ] Layer visibility state persists within the session (React state, not URL params)
- [ ] Each layer checkbox has a small color indicator showing the layer's visual style
- [ ] Typecheck and lint pass

---

### US-048: Settlement Editor Mini-Map
**Description:** As a developer, I need a dedicated mini-map when editing a specific settlement so that editors can see the lot layout, select lots, and view addresses.

**Acceptance Criteria:**
- [ ] Create a new React component `SettlementMiniMap.tsx` in `client/src/components/visualization/`
- [ ] Renders a top-down SVG view of the settlement's street network and lot positions
- [ ] Lots rendered as small rectangles along streets, color-coded by type (residential=green, business=blue, vacant=gray)
- [ ] Each lot shows its house number as a tiny text label when zoomed in
- [ ] Street names displayed along each street edge
- [ ] Click a lot to select it (fires an onLotSelect callback with lot ID)
- [ ] Pan and zoom support
- [ ] Integrate into the settlement detail view/panel in the world editor
- [ ] Typecheck and lint pass

---

### Phase 8: Vegetation & Nature Systems

---

### US-049: Poisson Disc Sampling Module
**Description:** As a developer, I need a Poisson disc sampling implementation so that vegetation and other objects can be placed with natural-looking spacing.

**Acceptance Criteria:**
- [ ] Create `shared/procedural/poisson-disc.ts` with function `poissonDiscSampling(width, height, minDistance, seed, maxAttempts = 30): Vec2[]`
- [ ] Implements Bridson's algorithm for O(n) Poisson disc sampling
- [ ] Uses seeded random for deterministic output
- [ ] Returns array of 2D positions with guaranteed minimum distance between any two points
- [ ] Unit test: all returned points have pairwise distance ≥ minDistance; output is deterministic for same seed
- [ ] Typecheck and lint pass

---

### US-050: Biome-Elevation Vegetation Zones
**Description:** As a developer, I need a vegetation zone system that maps biome, elevation, and moisture to specific plant species so that vegetation varies realistically across the landscape.

**Acceptance Criteria:**
- [ ] Create `server/generators/vegetation-generator.ts` with class `VegetationGenerator`
- [ ] Define a vegetation zone lookup: `getVegetationZone(elevation: number, moisture: number, biome: string): VegetationZone`
- [ ] `VegetationZone` includes: `primaryTreeType`, `secondaryTreeType`, `treeDensity` (0-1), `shrubDensity`, `grassDensity`, `flowerTypes`, `groundCoverType`
- [ ] Elevation bands: 0-0.15 (hot), 0.15-0.35 (temperate), 0.35-0.55 (cool), 0.55-0.75 (cold), 0.75+ (frozen/barren)
- [ ] Moisture derived from distance to nearest water feature: < 30 units = wet, 30-100 = moderate, > 100 = dry
- [ ] Cross-reference elevation × moisture to select zone (e.g., hot+wet = tropical forest, cold+dry = bare rock)
- [ ] Typecheck and lint pass

---

### US-051: Terrain-Aware Vegetation Placement
**Description:** As a developer, I need vegetation placed according to terrain data so that trees cluster in forests, thin near settlements, and avoid steep slopes and water.

**Acceptance Criteria:**
- [ ] Add method `generateVegetation(heightmap, slopeMap, waterFeatures, settlements, config): NatureObjectIR[]` to `VegetationGenerator`
- [ ] Use Poisson disc sampling (from US-049) with minDistance varying by zone's treeDensity
- [ ] Suppress vegetation: within settlement boundaries (cleared land), within 5 units of road centerlines, within 3 units of water edges, on slopes > 40°, above snow line (elevation > 0.75)
- [ ] Place ground cover (shrubs, grass, flowers) between trees using a secondary finer Poisson disc pass
- [ ] Each nature object includes position (with Y from heightmap), scale (randomized within species range), rotation (random Y), biome, and subType
- [ ] Replace the current scatter-based placement in `ProceduralNatureGenerator.ts` with a call to this generator
- [ ] Typecheck and lint pass

---

### US-052: Agricultural Zone Generation
**Description:** As a developer, I need agricultural areas generated near settlements so that farmland, orchards, and pastures appear outside town boundaries.

**Acceptance Criteria:**
- [ ] Add method `generateAgriculturalZones(settlement, boundary, heightmap): AgriculturalZone[]` to `VegetationGenerator`
- [ ] `AgriculturalZone` interface: `type` ('cropField'|'orchard'|'pasture'|'vineyard'), `polygon: Vec2[]`, `position: Vec3`, `rotation: number`
- [ ] Place 2-6 agricultural zones outside the settlement boundary but within 2× the settlement radius
- [ ] Crop fields: rectangular patches aligned to nearby roads on flat terrain
- [ ] Orchards: regular grid of fruit trees
- [ ] Pastures: fenced areas on gentle slopes
- [ ] Agricultural zones placed only on buildable terrain (slope < 15°)
- [ ] Generate corresponding `NatureObjectIR` entries for orchards (tree rows) and pasture fences
- [ ] Typecheck and lint pass

---

### US-053: Rock and Geological Feature Placement
**Description:** As a developer, I need rocks and geological features placed based on terrain so that rocky outcrops appear on slopes and cliffs.

**Acceptance Criteria:**
- [ ] Add method `generateRocks(heightmap, slopeMap, config): NatureObjectIR[]` to `VegetationGenerator`
- [ ] Boulders placed preferentially on slopes > 20° and near cliff edges
- [ ] Rock clusters at cliff bases and canyon walls (group 3-7 rocks within 5 units)
- [ ] Mountaintop rocks at elevations > 0.6 (exposed rock above tree line)
- [ ] Cave entrance markers at cliff faces (flagged with metadata for potential dungeon entries)
- [ ] Rock subTypes: 'boulder', 'rock_cluster', 'cliff_face', 'cave_entrance'
- [ ] Typecheck and lint pass

---

### US-054: Nature Object LOD System
**Description:** As a developer, I need a level-of-detail system for nature objects so that distant trees and rocks use simpler rendering for performance.

**Acceptance Criteria:**
- [ ] Update `ProceduralNatureGenerator.ts` with LOD-aware rendering
- [ ] Near (< 50 units from camera): full 3D mesh with shadows
- [ ] Medium (50-150 units): simplified mesh (fewer polygons), no shadows
- [ ] Far (150-400 units): billboard quad (camera-facing plane with texture)
- [ ] Very far (> 400 units): culled (not rendered)
- [ ] LOD transitions happen smoothly per frame based on camera distance
- [ ] LOD distance thresholds configurable via constructor parameter
- [ ] Performance: at least 30fps with 1000+ nature objects in view
- [ ] Typecheck and lint pass

---

### Phase 9: Export Pipeline Updates

---

### US-055: Heightmap Export in IR
**Description:** As a developer, I need the IR generator to include heightmap data in exports so that exported games have terrain elevation.

**Acceptance Criteria:**
- [ ] Update `ir-generator.ts`: when generating `GeographyIR`, call `TerrainGenerator` to produce a heightmap for the world
- [ ] Populate `GeographyIR.heightmap` field with the generated heightmap array
- [ ] Populate `GeographyIR.terrainFeatures` with terrain feature data
- [ ] Include `slopeMap` in the GeographyIR output
- [ ] Each settlement's `position.y` set from heightmap at its center point (instead of always 0)
- [ ] Each lot's `position.y` set from heightmap at its position
- [ ] Typecheck and lint pass

---

### US-056: Street Network Export in IR
**Description:** As a developer, I need street networks exported in the IR so that exported games render proper street layouts.

**Acceptance Criteria:**
- [ ] Update `ir-generator.ts`: for each settlement, include its `StreetNetworkIR` in the `SettlementIR` output
- [ ] Convert `StreetNetwork` from DB format to `StreetNetworkIR` format
- [ ] Street edge waypoints include Y-coordinate from heightmap (terrain-following)
- [ ] Each edge includes name, type, width, and all metadata
- [ ] Intra-settlement roads in `SettlementIR.internalRoads` populated from street edges (for backward compat with engines that only read `RoadIR`)
- [ ] Inter-settlement roads remain MST-based `RoadIR` in `EntitiesIR.roads`
- [ ] Typecheck and lint pass

---

### US-057: Water Features Export in IR
**Description:** As a developer, I need water features exported in the IR so that exported games can render rivers, lakes, and coastlines.

**Acceptance Criteria:**
- [ ] Update `ir-generator.ts`: include rivers, lakes, coastline, bays, and harbors in `GeographyIR`
- [ ] Rivers include waypoints with Y from heightmap, width profile, and crossing points
- [ ] Lakes include boundary polygon and surface elevation
- [ ] Coastline includes classified segments (beach/cliff/rocky)
- [ ] Harbors include dock data with positions and types
- [ ] All water feature names included for display in exported game UIs
- [ ] Typecheck and lint pass

---

### US-058: Enhanced Lot and Building Export
**Description:** As a developer, I need the enhanced lot and building data exported in the IR so that exported games place buildings correctly along streets.

**Acceptance Criteria:**
- [ ] Update `ir-generator.ts` lot generation: use street-aligned positions from DB lots instead of grid `generateLotPositions()`
- [ ] `LotIR` includes new fields: `lotWidth`, `lotDepth`, `streetEdgeId`, `side`, `facingAngle`, `elevation`, `foundationType`
- [ ] `BuildingIR.rotation` uses the lot's `facingAngle`
- [ ] `BuildingIR.position.y` set from lot elevation + foundation height
- [ ] Block data included in settlement IR if available
- [ ] Fallback to grid-based lot placement for settlements without street network data
- [ ] Typecheck and lint pass

---

### US-059: Babylon.js Scene Generator Updates
**Description:** As a developer, I need the Babylon.js scene generator to use all new IR data so that exported Babylon.js games render terrain, streets, water, and oriented buildings.

**Acceptance Criteria:**
- [ ] Update `babylon-scene-generator.ts`: generate terrain mesh from `GeographyIR.heightmap` using the `TerrainRenderer` logic
- [ ] Generate street network road meshes from `StreetNetworkIR` data
- [ ] Generate water meshes (rivers, lakes, ocean) from water feature IR data
- [ ] Apply building rotations from `BuildingIR.rotation` (facingAngle)
- [ ] Apply building elevation from `BuildingIR.position.y`
- [ ] Generate bridge meshes at river crossing points
- [ ] Generate foundation meshes for buildings with `foundationType` != 'flat'
- [ ] Fallback: all rendering degrades gracefully when new data fields are absent
- [ ] Typecheck and lint pass

---

### US-060: Unity Export Template Updates
**Description:** As a developer, I need the Unity export templates to consume new IR data so that exported Unity games have terrain, water, and proper street layouts.

**Acceptance Criteria:**
- [ ] Update Unity template `InsimulDataLoader.cs` to parse new IR fields (heightmap, streetNetwork, waterFeatures)
- [ ] Generate Unity Terrain from heightmap data (TerrainData asset with height values)
- [ ] Generate road meshes from street network edges
- [ ] Generate water plane meshes for rivers and lakes
- [ ] Apply building rotation from `BuildingIR.rotation`
- [ ] Apply building Y-position from IR elevation data
- [ ] Template compiles without errors in a Unity project
- [ ] Typecheck and lint pass (for TypeScript IR generation side)

---

### US-061: Godot Export Template Updates
**Description:** As a developer, I need the Godot export templates to consume new IR data so that exported Godot games have terrain, water, and proper street layouts.

**Acceptance Criteria:**
- [ ] Update Godot export templates to parse new IR fields
- [ ] Generate terrain mesh from heightmap (custom MeshInstance3D or Terrain3D integration)
- [ ] Generate road Path3D nodes with CSG ribbon meshes for street edges
- [ ] Generate water plane MeshInstance3D nodes for rivers and lakes
- [ ] Apply building rotation and elevation from IR
- [ ] Template scene loads without errors in Godot
- [ ] Typecheck and lint pass (for TypeScript IR generation side)

---

### US-062: Unreal Export Template Updates
**Description:** As a developer, I need the Unreal export templates to consume new IR data so that exported Unreal games have terrain, water, and proper street layouts.

**Acceptance Criteria:**
- [ ] Update Unreal export templates to parse new IR fields
- [ ] Generate Unreal Landscape actor from heightmap data
- [ ] Generate spline mesh actors for street edges
- [ ] Generate Water Body actors for rivers and lakes (UE5 Water plugin)
- [ ] Apply building rotation and elevation from IR
- [ ] Template compiles and loads without errors in Unreal Engine
- [ ] Typecheck and lint pass (for TypeScript IR generation side)

---

### Phase 10: Dynamic Settlement Evolution

---

### US-063: Settlement Growth Mechanics
**Description:** As a developer, I need settlements to grow physically when population increases during simulation so that new lots and streets appear at the periphery.

**Acceptance Criteria:**
- [ ] Create function `expandSettlement(settlement, populationDelta, streetNetwork, boundary): ExpansionResult` in `geography-generator.ts`
- [ ] When population increases: extend existing streets outward beyond current boundary; add new lots along extended streets; expand settlement boundary polygon
- [ ] New lots follow the same addressing scheme (numbers continue increasing outward)
- [ ] Street names for extensions reuse the existing street name
- [ ] `ExpansionResult` includes: `newLots: LotData[]`, `extendedStreets: StreetEdge[]`, `newBoundary: Vec2[]`
- [ ] Growth triggered by TotT simulation when `populationDelta > lotCapacity * 0.9`
- [ ] Typecheck and lint pass

---

### US-064: Settlement Decline Mechanics
**Description:** As a developer, I need settlements to show physical decline when population drops so that abandoned buildings and deteriorating roads appear.

**Acceptance Criteria:**
- [ ] Create function `declineSettlement(settlement, populationDelta): DeclineResult` in `geography-generator.ts`
- [ ] When population decreases: mark peripheral lots as vacant (set `buildingType = 'vacant'`); degrade street condition of underused streets from 'good' → 'fair' → 'poor'
- [ ] Peripheral lots (highest distanceFromDowntown) are vacated first
- [ ] `DeclineResult` includes: `vacatedLotIds: string[]`, `degradedStreetIds: string[]`
- [ ] Decline triggered by TotT simulation when population drops below 70% of lot capacity
- [ ] Vacant lots can be reoccupied if population later increases
- [ ] Typecheck and lint pass

---

### US-065: Infrastructure Development
**Description:** As a developer, I need settlement infrastructure to upgrade as the town grows and prospers so that roads improve and new structures appear.

**Acceptance Criteria:**
- [ ] Create function `upgradeInfrastructure(settlement, wealthLevel): InfraUpgrade[]` in `geography-generator.ts`
- [ ] Road surface upgrades based on wealth: low → all dirt; medium → main roads cobblestone; high → main roads asphalt, residential cobblestone
- [ ] Street widening: main roads can increase width by 1 unit when population exceeds tier threshold
- [ ] Bridge construction: when settlement expands across a river, generate a bridge crossing
- [ ] Wall construction: fortress settlements add wall segments as population grows (represented as a boundary polyline with gate nodes)
- [ ] `InfraUpgrade` includes: `type`, `targetId`, `beforeState`, `afterState`
- [ ] Typecheck and lint pass

---

### US-066: Settlement History Tracking
**Description:** As a developer, I need a historical record of settlement changes so that the evolution of a town over simulation time is traceable.

**Acceptance Criteria:**
- [ ] Add `settlementHistory` (jsonb) field to `settlements` table in schema
- [ ] `SettlementHistory` interface: `foundedYear: number`, `events: GrowthEvent[]`
- [ ] `GrowthEvent` interface: `year: number`, `type: 'expansion'|'densification'|'decline'|'infrastructure'|'disaster'`, `description: string`, `affectedLotIds: string[]`, `affectedStreetIds: string[]`
- [ ] Each call to `expandSettlement`, `declineSettlement`, or `upgradeInfrastructure` appends an event to the history
- [ ] History viewable in world editor settlement detail panel
- [ ] Typecheck and lint pass

---

## Functional Requirements

- FR-1: The system must generate Perlin/Simplex noise heightmaps for each settlement based on terrain type and seed
- FR-2: Heightmaps must be deterministic — same seed always produces identical terrain
- FR-3: The system must generate connected street network graphs using one of six pattern algorithms (organic, grid, radial, linear, hillside, waterfront)
- FR-4: Street pattern selection must be automatic based on terrain type, settlement type, and population
- FR-5: Street names must be unique within each settlement and appropriate to street type
- FR-6: House numbers must be assigned based on position along the street (odd left, even right, increasing outward)
- FR-7: All lot addresses must pass a validation check (no duplicates, correct street references, monotonic numbering)
- FR-8: Lots must be placed along street frontage, not on a grid
- FR-9: Buildings must face their assigned street with ±3° variance
- FR-10: Settlement boundaries must be irregular polygons that conform to terrain
- FR-11: Rivers must flow downhill from source to mouth following steepest descent
- FR-12: Lakes must form at heightmap basins filled to their pour point
- FR-13: Coastal settlements must have coastline geometry with classified segments (beach, cliff, rocky)
- FR-14: Harbors and docks must be generated for coastal/river settlements with population > 50
- FR-15: Vegetation must vary by elevation, moisture, and biome — not uniform scatter
- FR-16: Buildings on slopes must have terrain-adaptive foundations (raised, stilted, or terraced)
- FR-17: The minimap must display terrain coloring, street network lines, and building footprints
- FR-18: The world editor must display street networks, water features, and terrain with toggleable layers
- FR-19: All new data must export through the IR to Babylon.js, Unity, Godot, and Unreal targets
- FR-20: Settlements must grow/decline physically during TotT simulation based on population changes

## Non-Goals

- Real-time weather simulation or seasonal visual changes
- Fully destructible or player-modifiable terrain
- Procedural interior generation changes (existing interior system is out of scope)
- NPC pathfinding on the new street graph (pathfinding is a separate initiative)
- Traffic simulation or vehicle systems
- Dynamic LOD for terrain mesh (basic LOD for nature objects only)
- Multiplayer map synchronization
- Audio generation (ambient sounds for water, wind, etc.)
- Procedural dungeon changes (existing dungeon system is out of scope)
- Manual street/road editing tools for end users (editor shows generated data only, no drag-to-create-road)

## Technical Considerations

- **Seeded PRNG:** All procedural generation must use the same seeded random from `shared/procedural/noise.ts` to ensure server-client parity and deterministic exports
- **Performance budget:** Heightmap generation < 1s; street network generation < 2s for a city; full settlement generation < 5s
- **Backward compatibility:** All new schema fields must have sensible defaults so existing worlds load without migration errors. All new rendering paths must fall back gracefully when data is absent.
- **Shared code:** Noise, Poisson disc, and type definitions go in `shared/` so both server and client can use them
- **IR is the contract:** Engine-specific exporters only consume the IR — no direct DB access
- **Heightmap resolution:** Keep manageable for JSON serialization; 256×256 = 65K floats ≈ 500KB in JSON. Consider optional compression or downsampling for export.

## Success Metrics

- Every generated settlement has a connected, named street network with no orphan nodes
- 100% of building addresses match an actual street name at the correct spatial position
- House numbers are monotonically increasing along every street, with odd/even side consistency
- The world editor map renders streets, terrain, and water features with toggleable layers
- The minimap shows terrain elevation coloring and street network lines
- Coastal settlements have visible coastline geometry and harbors
- At least one river is generated per world that has mountain or hill terrain
- Buildings on slopes of 5° or more have visible foundations
- Vegetation density correlates with elevation and moisture zones (no trees above snow line)
- All new data fields round-trip through the IR and appear in exported Babylon.js scenes
- Street network generation completes in < 2s for city-scale settlements

## Open Questions

- Should the heightmap be stored in the database as-is (large JSONB), or referenced via a binary file/blob?
- Should exported heightmaps use a binary format (e.g., PNG grayscale) instead of JSON arrays for size efficiency?
- How should existing worlds created before this update be handled — regenerate geography, or leave as-is with flat terrain?
- Should the Poisson disc sampling library be a dependency (`fast-poisson-disk-sampling`) or a custom implementation?
- What level of detail should contour lines have for large settlements (performance vs. accuracy)?
- Should bridge meshes be purely visual or also affect NPC pathing in exported games?
- Should agricultural zones (crop fields, orchards) be interactive in the 3D game, or purely decorative?
