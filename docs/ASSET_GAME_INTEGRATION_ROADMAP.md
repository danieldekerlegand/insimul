# Asset Collection & Game Integration Roadmap

## Current State Analysis

### What You're Seeing in the Game (Mystery Objects Explained)

| Visual Element | Source | File | Purpose |
|---|---|---|---|
| **Green/cyan arches** | Zone boundary torus rings | `BabylonGame.ts:1546` (`createZoneBoundaries`) | Settlement zone indicators — glowing torus meshes around each settlement |
| **Colored orbs on green poles** | Settlement center markers + quest waypoints | `BabylonGame.ts:1329` (cylinder marker), `QuestWaypointManager.ts:37-53` (beam + sphere) | Mark settlement centers and quest objective locations |
| **Sparkling/appearing-disappearing entities** | Zone boundary particle systems | `BabylonGame.ts:1595` (ParticleSystem emitting `flare.png`) | Ambient zone boundary effects |
| **Small green rectangles scattered on ground** | Procedural grass tufts | `ProceduralNatureGenerator.ts:598` (tiny green boxes) | Placeholder grass |
| **Flat colored orbs on ground** | Procedural rocks | `ProceduralNatureGenerator.ts:510` (flattened spheres) | Placeholder rocks |
| **Brown blocky houses with pyramid roofs** | Procedural building primitives | `ProceduralBuildingGenerator.ts:355-448` (box + cone/cylinder) | Fallback buildings when no 3D models load |

### Why Asset Collections Don't Appear in the Game

The asset collection → game integration pipeline has **seven critical disconnects**:

1. **Ground textures hardcoded**: `BabylonGame.ts:572` always loads `/assets/ground/ground.jpg` regardless of the collection's `groundTextureId`
2. **No road meshes exist**: `TextureManager.applyRoadTexture()` looks for meshes named `road-*` but no road geometry is ever created
3. **Building model paths don't resolve**: `ProceduralBuildingGenerator.initializeAssets()` tries hardcoded paths like `/assets/models/buildings/medieval/house_small.glb` that don't exist on disk
4. **Nature model paths don't resolve**: Same issue — `ProceduralNatureGenerator.initializeAssets()` tries `/assets/models/nature/trees/oak_tree.glb`
5. **Asset collection stores IDs, not file paths**: The `applyWorld3DConfig()` method correctly resolves IDs → VisualAsset → filePath, but the VisualAssets in the collection may not be downloadable GLB/GLTF models
6. **No Polyhaven → local file pipeline**: Assets from Polyhaven are referenced but never downloaded to the server's file system
7. **NPC models hardcoded**: `NPC_MODEL_URL` is always `/assets/npc/starterAvatars.babylon`; the `characterModels` config exists but isn't wired up

### Current File Architecture

```
client/src/components/3DGame/
├── BabylonGame.ts                    # Main game class (4024 lines) — orchestrates everything
├── TextureManager.ts                 # Loads/applies textures from VisualAsset records
├── ProceduralBuildingGenerator.ts    # Generates buildings (primitives or cloned models)
├── ProceduralNatureGenerator.ts      # Generates trees, rocks, shrubs, grass, flowers
├── WorldScaleManager.ts             # Distributes settlements, calculates sizes
├── QuestObjectManager.ts            # Spawns quest collectibles & location markers
├── QuestWaypointManager.ts          # Creates beam-of-light waypoint markers
├── QuestIndicatorManager.ts         # Shows !/? indicators above NPCs
├── BuildingPlacementSystem.ts       # Player-placed buildings (survival/strategy genre)
├── BuildingInfoDisplay.ts           # Hover tooltips for buildings
├── AudioManager.ts                  # Sound effects and music
└── ...                              # Combat, VR, GUI, etc.

server/services/
├── asset-collection-resolver.ts     # Resolves world → asset collection → World3DConfig
├── default-asset-collection.ts      # Auto-assigns default collections to worlds
└── ...

shared/schema.ts                     # AssetCollection table with all model/texture ID fields
```

---

## Roadmap

### Phase 0: Quick Wins — Tone Down Zone Indicators ⏱️ ~2 hours

**Problem**: The torus rings, ground discs, and particle systems are visually confusing and dominate the scene.

**Changes to `BabylonGame.ts` (`createZoneBoundaries`)**:
- [x] Replace torus ring with a subtle ground-level ring (thin disc or dashed circle)
- [x] Reduce particle system emission rate from 20 → 3-5, reduce particle size
- [x] Lower alpha on ground disc from 0.15 → 0.05
- [x] Make zone boundaries only visible when player is within 2x the zone radius (Phase 10C LOD culling)
- [ ] Add option to toggle zone visibility via settings

**Changes to settlement center markers**:
- [x] Replace the cylinder+sphere marker with a flat signpost or banner mesh
- [x] Add settlement name label above the marker using BabylonGUI

---

### Phase 1: Fix Texture Pipeline — Collection → Game ⏱️ ~4 hours

**Problem**: Textures from asset collections are never applied to the terrain, roads, or buildings.

#### 1A. Ground Texture from Asset Collection

**File: `BabylonGame.ts` → `createGround()` and `loadWorldData()`**

- [x] After `applyWorld3DConfig()`, check `world3DConfig.groundTextureId`
- [x] If present, use `TextureManager.loadTextureById(groundTextureId)` to load it
- [x] Apply to the ground mesh's `StandardMaterial.diffuseTexture`
- [x] Fall back to `/assets/ground/ground.jpg` only if no collection texture exists
- [x] Support tiling parameters per world type (desert = less tiling, forest = more)

#### 1B. Road Texture from Asset Collection

**Requires Phase 3 (road mesh generation) first**, but the texture pipeline should be ready:

- [x] When road meshes are created, apply `world3DConfig.roadTextureId` texture
- [x] Fall back to a procedural dark-color road material

#### 1C. Building Wall Textures

**File: `ProceduralBuildingGenerator.ts` → `createBuildingStructure()`**

- [x] Accept an optional `wallTexture: Texture` parameter
- [x] When a wall texture asset exists in the collection, apply it to building materials
- [x] Support per-building-type texture overrides (stone for castle, wood for cottage)

#### 1D. Biome-Aware Texture Defaults

- [x] Create a mapping: world type → default texture set (grass, sand, snow, etc.)
- [ ] Ship 4-6 built-in ground textures as static assets:
  - `grass_green.jpg` — medieval/fantasy
  - `sand_desert.jpg` — desert worlds
  - `snow_tundra.jpg` — tundra/ice
  - `concrete_urban.jpg` — modern/cyberpunk
  - `dirt_path.jpg` — post-apocalyptic
  - `moss_forest.jpg` — deep forest
- [x] Use these as fallbacks when no collection texture is assigned

---

### Phase 2: Fix 3D Model Pipeline — Collection → Game ⏱️ ~8 hours

**Problem**: The collection stores VisualAsset IDs, but those assets may not have downloadable GLB files. The hardcoded model paths in generators don't exist.

#### 2A. Asset Download & Storage Pipeline

**New file: `server/services/asset-downloader.ts`**

- [ ] When an asset is added to a collection (from Polyhaven, upload, or generation):
  - Download the file to `public/assets/models/<collection_id>/<asset_id>.<ext>`
  - Update the VisualAsset's `filePath` to point to the local path
  - Support GLB, GLTF, OBJ formats (convert OBJ → GLB if needed)
- [ ] Add a `/api/asset-collections/:id/download-assets` endpoint for batch downloading
- [ ] Track download status per asset (pending, downloaded, failed)

#### 2B. Fix Building Model Loading

**File: `ProceduralBuildingGenerator.ts`**

- [x] Remove hardcoded path loading from `initializeAssets()`
- [x] Rely entirely on `registerRoleModel()` calls from `BabylonGame.applyWorld3DConfig()`
- [x] Add more role types beyond `default` and `smallResidence`:
  - `tavern`, `shop`, `blacksmith`, `church`, `market`, `inn`
  - `apartment`, `tower`, `warehouse`, `stable`
- [x] Expand `getRoleForSpec()` to map `businessType` → role name

#### 2C. Fix Nature Model Loading

**File: `ProceduralNatureGenerator.ts`**

- [x] Remove hardcoded path loading from `initializeAssets()`
- [x] Rely on `registerTreeOverride()`, `registerRockOverride()`, etc.
- [ ] Add more vegetation types:
  - `flower`, `grass_clump`, `fern`, `mushroom`, `vine`
  - `cactus` (desert), `dead_shrub` (wasteland), `snow_bush` (tundra)
- [ ] Support multiple tree varieties per biome (not just one template)

#### 2D. Fix NPC Model Loading

**File: `BabylonGame.ts` → `loadNPCs()`**

- [x] Read `world3DConfig.characterModels` for role-based NPC models
- [x] Map roles: `npcDefault`, `civilian`, `guard`, `merchant`, `questgiver`
- [x] Fall back to `NPC_MODEL_URL` only when no collection model exists
- [ ] Support per-NPC model assignment (e.g., specific character has unique model)

#### 2E. Expand Asset Collection Schema

**File: `shared/schema.ts` → `assetCollections` table**

- [ ] Add `wallTextures: jsonb` — mapping of material type → texture asset ID
- [ ] Add `roofTextures: jsonb` — mapping of roof style → texture asset ID
- [ ] Add `skyboxAssetId: varchar` — custom skybox texture
- [ ] Add `ambientSoundAssetId: varchar` — background ambient audio
- [ ] Add `weatherEffects: jsonb` — weather particle configurations

---

### Phase 3: Road & Path Generation System ⏱️ ~6 hours

**Problem**: No roads exist in the world. Settlements are just clusters of buildings on bare terrain.

#### 3A. Inter-Settlement Roads

**New file: `client/src/components/3DGame/RoadGenerator.ts`**

- [x] Generate roads between settlements using minimum spanning tree (MST)
- [x] Road mesh: flat ribbon geometry following terrain height
- [x] Road width based on settlement importance (city = wide, village = narrow)
- [x] Apply road texture from asset collection or fallback material
- [ ] Add road-side elements: fence posts, lanterns, signposts

#### 3B. Intra-Settlement Streets

- [x] Generate a grid or organic street layout within each settlement (hub-and-spoke)
- [x] Streets connect building lots, creating walkable paths
- [ ] Differentiate main streets (wider) from alleys (narrower)
- [ ] Place buildings along streets with proper setbacks

#### 3C. Road Naming & Signage

- [ ] Name roads procedurally (or from world data if available)
- [ ] Place signpost meshes at intersections with readable text
- [ ] Register roads with the minimap system

---

### Phase 4: Building Interiors & Enter/Exit Mechanics ⏱️ ~12 hours

**Problem**: Buildings are solid boxes. Players cannot enter them or see interior props.

#### 4A. Building Interior Generation

**New file: `client/src/components/3DGame/BuildingInteriorGenerator.ts`**

- [x] When player approaches a building door, generate/load an interior scene
- [x] Interior layout based on building type:
  - **Tavern**: bar counter, tables, chairs, fireplace
  - **Shop**: display shelves, counter, back room
  - **Residence**: bed, table, chairs, fireplace, chest
  - **Blacksmith**: forge, anvil, weapon racks
  - **Library**: bookshelves, reading desks, candles
- [ ] Use props from asset collection's `objectModels` and `buildingModels`

#### 4B. Door/Portal System

- [x] Add click-based door entry (player clicks building when within 12 units)
- [x] When player enters trigger: fade to black → teleport to interior → fade in
- [x] Interior is a separate enclosed space (Y=500+ offset, box room with floor/walls/ceiling)
- [x] "Exit" trigger near the door teleports back to the exterior

#### 4C. Interior Props from Asset Collection

- [ ] Map `objectModels` roles to interior placement:
  - `chair`, `table`, `bed`, `shelf`, `counter`, `fireplace`
  - `crate`, `barrel`, `bookshelf`, `candlestick`, `cabinet`
  - `forge`, `anvil`, `weapon_rack`, `cauldron`
- [ ] Random placement within the interior room bounds
- [ ] Some props interactable (chests → inventory, bookshelves → lore)

---

### Phase 5: Biome-Aware Vegetation System ⏱️ ~6 hours

**Problem**: Vegetation is placed uniformly regardless of terrain or distance from settlements.

#### 5A. Vegetation Density Zones

- [x] Dense vegetation far from settlements (wilderness)
- [x] Sparse vegetation near settlements (cleared land)
- [x] No vegetation on roads/streets (road avoidance in nature gen)
- [x] Gradual density gradient between zones (biome treeDensity scaling)

#### 5B. Multi-Biome Support

Expand `ProceduralNatureGenerator` biome presets:

| Biome | Trees | Ground Cover | Special Elements |
|---|---|---|---|
| **Temperate Forest** | Oak, birch, maple | Ferns, mushrooms, wildflowers | Fallen logs, moss-covered rocks |
| **Conifer Forest** | Pine, spruce, fir | Pine needles, small bushes | Snow patches, pinecones |
| **Desert** | Palm, cactus | Sand dunes, dry grass | Oasis, rock formations |
| **Tundra** | Sparse pine, dead trees | Snow, ice, lichen | Frozen ponds, snowdrifts |
| **Tropical** | Palm, bamboo, banyan | Dense ferns, vines | Waterfalls, colorful flowers |
| **Swamp** | Willow, mangrove | Reeds, lily pads | Fog, murky water |
| **Wasteland** | Dead trees, stumps | Rubble, scrap metal | Ruins, craters |

#### 5C. Height-Aware Placement

- [ ] No trees on steep slopes (> 30°)
- [ ] More rocks on hillsides
- [ ] Flowers and grass only on flat areas
- [ ] Water features in low-lying areas

#### 5D. Vegetation from Asset Collection

- [ ] Support multiple tree models per biome (3-5 varieties)
- [ ] Collection fields: `treeModels`, `shrubModels`, `groundCoverModels`
- [ ] Random selection from available models for variety

---

### Phase 6: World Prop System ⏱️ ~8 hours

**Problem**: Only 3 props spawn per settlement center. No exterior decorations, street furniture, or environmental storytelling.

#### 6A. Exterior Settlement Props

- [x] **Street furniture**: benches, lampposts, wells, fountains, market stalls
- [ ] **Signage**: shop signs, settlement name boards, directional signs
- [ ] **Decorations**: banners, flags, flower pots, hanging lanterns
- [x] Place props along streets and in settlement squares

#### 6B. Wilderness Props

- [x] **Camps**: campfire, tent, bedroll (for NPC camps outside settlements)
- [x] **Ruins**: broken walls, crumbled pillars, overgrown foundations
- [ ] **Resources**: ore deposits, herb patches, fishing spots
- [x] **Landmarks**: standing stones, shrines, ancient trees

#### 6C. Interactive Props

- [ ] **Chests**: open → add items to inventory
- [ ] **Signs**: click → read text
- [ ] **Crafting stations**: forge, alchemy table, workbench
- [ ] **Containers**: barrels, crates → random loot

#### 6D. Prop Placement Rules

**New file: `client/src/components/3DGame/PropPlacementSystem.ts`**

- [ ] Define placement rules per prop type:
  - `streetLamp`: every 20 units along roads
  - `bench`: near buildings, facing streets
  - `well`: 1 per settlement center
  - `market_stall`: near shops/markets
- [ ] Collision-aware placement (no props inside buildings or other props)
- [ ] World-type-aware selection (medieval → lanterns, sci-fi → holo-signs)

---

### Phase 7: Asset Acquisition Pipeline ⏱️ ~10 hours

**Problem**: No automated pipeline to discover, download, and integrate 3D assets.

#### 7A. Polyhaven Integration Improvements

**Current state**: Routes exist (`/api/polyhaven/assets`, `/api/polyhaven/auto-select`) but assets aren't downloaded locally.

- [x] When user selects a Polyhaven asset, download the GLB/GLTF to local storage (`POST /api/polyhaven/download-and-register`)
- [x] Store in `public/assets/polyhaven/<category>/<file>` (via `preprocessPolyhavenAsset`)
- [x] Create a VisualAsset record pointing to the local path
- [x] Auto-add to the appropriate collection slot (building, tree, texture, etc.)

#### 7B. Texture Processing Pipeline

- [ ] Download Polyhaven textures (diffuse, normal, roughness, AO)
- [ ] Generate tileable versions if not already tileable
- [ ] Create appropriate material definitions (PBR if supported)
- [ ] Store processed textures with metadata (tiling params, intended use)

#### 7C. Model Processing Pipeline

- [ ] Validate imported models (check polygon count, dimensions, materials)
- [ ] Auto-scale to game-appropriate sizes
- [ ] Generate LOD variants (high, medium, low poly)
- [ ] Strip unnecessary animation data for static props
- [ ] Generate collision meshes for buildings

#### 7D. Asset Collection Templates

- [x] Pre-built collection templates for 7 world types (`asset-collection-templates.ts`):
  - **Medieval Fantasy**: Gothic furniture, lanterns, barrels, nature (18 assets)
  - **Cyberpunk**: street lamps, utility boxes, industrial barrels (8 assets)
  - **Historical Ancient**: brass vessels, ceramic vases, stone fire pit (8 assets)
  - **Post-Apocalyptic**: rusted barrels, survival tools, stumps (8 assets)
  - **Western Frontier**: bar stools, rocking chairs, cash register (8 assets)
  - **Tropical Pirate**: treasure chest, maritime props, sabers (8 assets)
  - **Steampunk**: grandfather clock, oil lamps, brass blowtorch (10 assets)
- [x] One-click populate via `POST /api/asset-collections/:id/populate-from-template`
- [x] Templates reference verified Polyhaven asset IDs for auto-download

---

### Phase 8: NPC & Character Visual Improvements ⏱️ ~6 hours

#### 8A. Role-Based NPC Models

- [x] Wire up `world3DConfig.characterModels` to NPC loading
- [x] Different models per role: civilian, guard, merchant, questgiver
- [x] Fall back to shared model with color/texture variations (role-based tinting)

#### 8B. NPC Accessories & Variations

- [ ] Attach role-specific accessories (guard → helmet, merchant → backpack)
- [x] Color palette variations per NPC (role-based tinting: guard=red, merchant=gold, questgiver=blue)
- [ ] Faction-based uniform colors

#### 8C. NPC Placement Improvements

- [x] NPCs spawn near their workplace (business building) or residence
- [ ] Guards patrol settlement perimeters
- [ ] Merchants stand near market stalls
- [ ] Civilians wander between home and workplace

---

### Phase 9: World-Type-Specific Asset Requirements ⏱️ ~4 hours

Define the **minimum required assets** for each world type to look complete:

#### Medieval Fantasy
| Category | Required Assets | Count |
|---|---|---|
| Buildings | House (small/med/large), tavern, shop, blacksmith, church, castle keep | 8+ |
| Trees | Oak, pine, birch | 3+ |
| Vegetation | Bush, flower, fern, grass clump | 4+ |
| Props | Barrel, crate, cart, well, signpost, torch, banner | 7+ |
| Textures | Grass ground, dirt road, stone wall, wood wall, thatch roof | 5+ |
| Interior | Table, chair, bed, fireplace, shelf, chest | 6+ |

#### Cyberpunk / Sci-Fi
| Category | Required Assets | Count |
|---|---|---|
| Buildings | Skyscraper, apartment block, neon shop, tech lab, power station | 6+ |
| Trees | Holographic tree, metal sculpture, bioluminescent plant | 3+ |
| Vegetation | Neon bush, tech grass, wire vine | 3+ |
| Props | Vending machine, holo-sign, drone pad, data terminal, neon lamp | 6+ |
| Textures | Metal floor, asphalt road, glass wall, concrete, neon panel | 5+ |
| Interior | Monitor desk, server rack, neon chair, holo-table | 4+ |

#### Historical / Ancient
| Category | Required Assets | Count |
|---|---|---|
| Buildings | Stone house, temple, amphitheater, villa, market hall | 6+ |
| Trees | Olive, cypress, palm | 3+ |
| Props | Column, statue, urn, mosaic floor, fountain | 5+ |
| Textures | Marble, sandstone, terracotta, mosaic, dusty road | 5+ |

#### Post-Apocalyptic
| Category | Required Assets | Count |
|---|---|---|
| Buildings | Ruined house, bunker, scrap shelter, watchtower | 4+ |
| Trees | Dead tree, burned stump, mutant plant | 3+ |
| Props | Rusty car, barrel fire, scrap pile, warning sign | 5+ |
| Textures | Cracked earth, rubble, rusted metal, ash | 4+ |

#### Western / Frontier

| Category | Required Assets | Count |
|---|---|---|
| Buildings | Saloon, sheriff office, general store, ranch house, church, stable | 6+ |
| Trees | Oak, saguaro cactus, tumbleweed | 3+ |
| Vegetation | Dry grass, desert shrub, sage brush | 3+ |
| Props | Hitching post, water trough, barrel, wanted poster, wagon wheel | 5+ |
| Textures | Dusty ground, wood plank road, adobe wall, tin roof | 4+ |
| Interior | Bar counter, poker table, jail cell, gun rack | 4+ |

#### Tropical / Pirate

| Category | Required Assets | Count |
|---|---|---|
| Buildings | Bamboo hut, dock house, tavern, lighthouse, fort | 5+ |
| Trees | Palm, coconut palm, banana tree, mangrove | 4+ |
| Vegetation | Tropical fern, hibiscus, vine, coral | 4+ |
| Props | Treasure chest, cannon, anchor, tiki torch, fishing net | 5+ |
| Textures | Sand beach, jungle floor, plank deck, thatched roof | 4+ |
| Interior | Ship wheel, treasure map table, hammock, rum barrel | 4+ |

#### Steampunk

| Category | Required Assets | Count |
|---|---|---|
| Buildings | Clocktower, factory, airship dock, Victorian house, laboratory | 5+ |
| Trees | Pruned hedge, mechanical tree, copper-leafed oak | 3+ |
| Props | Gear sculpture, steam pipe, brass lamp, pneumatic tube, clock | 5+ |
| Textures | Brass panel, brick wall, cobblestone road, copper roof | 4+ |
| Interior | Workbench with gears, steam engine, brass telescope, pipe organ | 4+ |

---

### Phase 10: Performance Optimization ⏱️ ~6 hours

#### 10A. Level of Detail (LOD)

- [ ] Generate 3 LOD levels per model (high/med/low poly)
- [x] Switch LOD based on camera distance (distance-based culling at 200 units)
- [ ] Impostor billboards for very distant trees

#### 10B. Instanced Rendering

- [x] Use Babylon.js instanced meshes for repeated objects (trees, rocks, grass, shrubs, flowers)
- [x] All vegetation now uses template + createInstance pattern consistently
- [x] Batch similar materials to reduce draw calls (merged grass planes)

#### 10C. Occlusion Culling

- [x] Don't render building interiors when player is outside (Y=500+ offset)
- [x] Don't render settlement details when camera is far away (LOD culling at 150-200 units)
- [ ] Use bounding box checks before spawning vegetation

#### 10D. Asset Streaming

- [ ] Load settlement details on-demand as player approaches
- [x] Toggle visibility of distant world props and zone boundaries (throttled every 30 frames)
- [ ] Progressive loading: low-res textures first, then high-res

---

## Implementation Priority Order

| # | Phase | Effort | Impact | Priority |
|---|---|---|---|---|
| 1 | **Phase 0**: Tone down zone indicators | ~2h | High (immediate UX fix) | **P0** |
| 2 | **Phase 1A**: Ground textures from collection | ~2h | High (most visible) | **P0** |
| 3 | **Phase 2A**: Asset download pipeline | ~4h | Critical (enables everything) | **P1** |
| 4 | **Phase 2B**: Building models from collection | ~3h | High | **P1** |
| 5 | **Phase 2C**: Nature models from collection | ~2h | High | **P1** |
| 6 | **Phase 3A**: Inter-settlement roads | ~4h | High (world structure) | **P1** |
| 7 | **Phase 5A-C**: Biome-aware vegetation | ~4h | Medium-High | **P2** |
| 8 | **Phase 6A**: Exterior settlement props | ~4h | Medium-High | **P2** |
| 9 | **Phase 2D**: NPC models from collection | ~3h | Medium | **P2** |
| 10 | **Phase 3B**: Intra-settlement streets | ~3h | Medium | **P2** |
| 11 | **Phase 4A-C**: Building interiors | ~12h | High (game depth) | **P3** |
| 12 | **Phase 7A-D**: Asset acquisition pipeline | ~10h | High (content pipeline) | **P3** |
| 13 | **Phase 6B-D**: Wilderness/interactive props | ~6h | Medium | **P3** |
| 14 | **Phase 8**: NPC visual improvements | ~6h | Medium | **P3** |
| 15 | **Phase 9**: World-type asset requirements | ~4h | Documentation | **P3** |
| 16 | **Phase 10**: Performance optimization | ~6h | Medium (scales with content) | **P4** |

**Total estimated effort**: ~75 hours across all phases

---

## Key Architectural Decisions Needed

1. **GLB vs procedural**: Should we invest in a full 3D model pipeline (Polyhaven + custom), or improve procedural generation to look better (better materials, more detail, LOD)? **Recommendation**: Hybrid — improve procedurals as fallback, but build the model pipeline for quality.

2. **Interior generation**: On-demand (generate when entering) vs pre-generated (create at world load)? **Recommendation**: On-demand to save memory, with caching for recently visited buildings.

3. **Texture source**: AI-generated (current VisualAsset system) vs curated (Polyhaven textures) vs procedural (shader-based)? **Recommendation**: Polyhaven for quality, AI-generated for custom, procedural for variety.

4. **Asset format standardization**: Should all models be GLB? **Recommendation**: Yes — GLB is the standard for web 3D, supported natively by Babylon.js, and is compact.

5. **Collection granularity**: One collection per world vs shared collections across worlds? **Recommendation**: Both — shared "base" collections with per-world overrides.

---

## Files That Need Changes (By Phase)

### Phase 0
- `client/src/components/3DGame/BabylonGame.ts` — `createZoneBoundaries()`

### Phase 1
- `client/src/components/3DGame/BabylonGame.ts` — `createGround()`, `loadWorldData()`
- `client/src/components/3DGame/TextureManager.ts` — enhance texture application
- `client/src/components/3DGame/ProceduralBuildingGenerator.ts` — wall texture support

### Phase 2
- `server/services/asset-downloader.ts` — **NEW**
- `client/src/components/3DGame/ProceduralBuildingGenerator.ts` — remove hardcoded paths
- `client/src/components/3DGame/ProceduralNatureGenerator.ts` — remove hardcoded paths
- `client/src/components/3DGame/BabylonGame.ts` — NPC model loading
- `shared/schema.ts` — expand collection fields

### Phase 3
- `client/src/components/3DGame/RoadGenerator.ts` — **NEW**
- `client/src/components/3DGame/BabylonGame.ts` — integrate road generation

### Phase 4
- `client/src/components/3DGame/BuildingInteriorGenerator.ts` — **NEW**
- `client/src/components/3DGame/BabylonGame.ts` — door trigger system

### Phase 5
- `client/src/components/3DGame/ProceduralNatureGenerator.ts` — major expansion

### Phase 6
- `client/src/components/3DGame/PropPlacementSystem.ts` — **NEW**

### Phase 7
- `server/services/asset-downloader.ts` — Polyhaven download pipeline
- `server/routes.ts` — new download endpoints

### Phase 10
- All generator files — LOD and instancing improvements
