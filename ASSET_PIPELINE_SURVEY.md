# Asset Pipeline Survey & Taxonomy

## Root Cause Fix

The primary reason assets were not appearing in game worlds was a **server-side disconnect**: the `/api/worlds/:worldId/assets` endpoint only returned `VisualAsset` records where `worldId` matched the request. Base collection assets created by the migration script have **no worldId** (they are shared/global assets), so BabylonGame's `findAssetById()` could never resolve them.

**Fix applied**: The endpoint now merges the world's selected asset collection's `assetIds` into the response, so all collection assets are available to the client.

---

## Full Asset Pipeline Flow

```
base-asset-collections.json
  → 002-seed-base-collections.ts (migration)
    → Downloads Polyhaven assets → creates VisualAsset records
    → Resolves ${polyhavenId:...} → actual VisualAsset IDs
    → Creates AssetCollection with config3D + assetIds[]

World creation / play:
  → ensureWorldHasAssetCollection() assigns collection to world
  → /api/worlds/:worldId/3d-config → returns config3D from collection
  → /api/worlds/:worldId/assets → returns world assets + collection assets (FIXED)
  → BabylonGame.applyWorld3DConfig() resolves IDs → loads meshes/textures
```

---

## Comprehensive Asset Type Taxonomy

### 1. NATURE MODELS (`config3D.natureModels`)

| Slot Key | Purpose | Used By | Status |
|----------|---------|---------|--------|
| `defaultTree` | Primary tree model for biome | ProceduralNatureGenerator.registerTreeOverride() | ✅ Connected |
| `tree_deciduous` | Deciduous tree variant | registerAdditionalTreeVariant() | ✅ Connected |
| `tree_dead` | Dead/bare tree | registerAdditionalTreeVariant() | ✅ Connected |
| `tree_small` | Small/young tree | registerAdditionalTreeVariant() | ✅ Connected |
| `evergreen` | Conifer/pine tree | registerAdditionalTreeVariant() | ⚠️ Key recognized, no collection has it yet |
| `stump` | Tree stump prop | registerAdditionalTreeVariant() | ✅ Connected |
| `rock` | Primary rock/boulder | registerRockOverride() | ✅ Connected |
| `rock_large` | Large boulder variant | registerAdditionalRockVariant() | ⚠️ Key recognized, no collection has it yet |
| `boulder` | Boulder variant | registerAdditionalRockVariant() | ⚠️ Key recognized, no collection has it yet |
| `rock_alt` | Alternative rock | registerAdditionalRockVariant() | ⚠️ Key recognized, no collection has it yet |
| `shrub` | Shrub model | registerShrubOverride() | ⚠️ Key recognized, no collection defines it |
| `bush` | Bush model | registerBushOverride() | ⚠️ Key recognized, no collection defines it |

**Gap**: No collection currently defines `shrub`, `bush`, `evergreen`, or rock variants. Polyhaven has limited shrub/bush models — may need procedural fallback or alternative sources.

### 2. GROUND TEXTURES (`config3D.groundTextureId`)

| Slot | Purpose | Used By | Status |
|------|---------|---------|--------|
| `groundTextureId` | Main terrain ground texture | TextureManager.applyGroundTexture() | ✅ Connected |

**Coverage per collection**:
- medieval-fantasy: `forest_floor` ✅
- cyberpunk: `asphalt_01` ✅
- sci-fi-space: `metal_plate` ✅
- post-apocalyptic: `asphalt_01` ✅
- steampunk: `cobblestone_floor_01` ✅
- western-frontier: `dirt` ✅
- tropical-pirate: `forrest_ground_01` ✅
- generic: `forrest_ground_01` ✅
- historical: `dirt` ✅
- high-fantasy: `castle_brick_01` ✅
- dark-fantasy: `mossy_cobblestone` ✅
- low-fantasy: `mossy_brick_floor` ✅
- historical-medieval: `cobblestone_floor_02` ✅
- mythological: `marble_01` ✅

### 3. ROAD/PATH TEXTURES (`config3D.roadTextureId`)

| Slot | Purpose | Used By | Status |
|------|---------|---------|--------|
| `roadTextureId` | Road/path texture between settlements | RoadGenerator.setRoadTexture() | ✅ Connected |

All 15 collections define a road texture. ✅

### 4. BUILDING TEXTURES (`config3D.wallTextureId`, `config3D.roofTextureId`)

| Slot | Purpose | Used By | Status |
|------|---------|---------|--------|
| `wallTextureId` | Building wall texture | ProceduralBuildingGenerator.setWallTexture() | ✅ Wired (NEW) |
| `roofTextureId` | Building roof texture | ProceduralBuildingGenerator.setRoofTexture() | ✅ Wired (NEW) |

**Gap**: No collection currently defines wall or roof textures. These need to be added to `base-asset-collections.json` with appropriate Polyhaven texture IDs for each world type. Fallback: assetType-based lookup (`texture_wall`, `texture_material` with roof tag).

### 5. BUILDING MODELS (`config3D.buildingModels`)

| Slot Key | Purpose | Used By | Status |
|----------|---------|---------|--------|
| `{role}` (e.g. tavern, shop) | Complete building model for role | ProceduralBuildingGenerator.registerRoleModel() | ✅ Wired |

**Current approach**: Buildings are **procedurally generated** (boxes with textures). Complete building models from collections would override these, but no collections currently define building models. This is by design — Polyhaven has very few complete building models.

### 6. OBJECT/PROP MODELS (`config3D.objectModels`)

| Slot Key | Purpose | Used By | Status |
|----------|---------|---------|--------|
| `storage` | Barrel, crate, container | objectModelTemplates + street furniture | ✅ Connected |
| `chest` | Chest/crate for loot | objectModelTemplates + street furniture | ✅ Connected |
| `lamp` | Lantern, street lamp | objectModelTemplates + street furniture | ✅ Connected |
| `decoration` | Decorative props | objectModelTemplates + street furniture | ✅ Connected |
| `prop` | Generic small prop | objectModelTemplates + street furniture | ✅ Connected |
| `furniture_table` | Table | objectModelTemplates + street furniture | ✅ Connected |
| `furniture_chair` | Chair | objectModelTemplates + street furniture | ✅ Connected |
| `furniture_stool` | Stool | objectModelTemplates + street furniture | ✅ Connected |
| `furniture_bed` | Bed | objectModelTemplates | ✅ Connected |
| `furniture_cabinet` | Cabinet | objectModelTemplates | ✅ Connected |
| `furniture_shelf` | Shelf | objectModelTemplates | ✅ Connected |
| `tool` | Tool (axe, hammer) | objectModelTemplates | ✅ Connected |
| `tableware` | Goblets, cups, plates | objectModelTemplates | ✅ Connected |
| `books` | Book sets | objectModelTemplates | ✅ Connected |
| `candleholder` | Candle holders | objectModelTemplates | ✅ Connected |
| `electronics` | Tech props (cyberpunk) | objectModelTemplates | ✅ Connected |
| `barrel_fire` | Fire barrel (post-apoc) | objectModelTemplates | ✅ Connected |

**Street furniture is now wired** to prefer collection objectModels over procedural primitives.

### 7. QUEST OBJECT MODELS (`config3D.questObjectModels`)

| Slot Key | Purpose | Used By | Status |
|----------|---------|---------|--------|
| `collectible` | Quest collectible item | QuestObjectManager.registerQuestModelTemplate() | ✅ Connected |
| `weapon` | Quest weapon item | QuestObjectManager.registerQuestModelTemplate() | ✅ Connected |

### 8. CHARACTER MODELS (`config3D.characterModels`)

| Slot | Purpose | Used By | Status |
|------|---------|---------|--------|
| `npcDefault` | Default NPC model | Not yet wired | ❌ Hardcoded to NPC_MODEL_URL |

**Gap**: NPCs currently use a hardcoded model URL. Character model overrides from collections are recognized in config3D but not consumed. Future work needed.

### 9. PLAYER MODELS (`config3D.playerModels`)

| Slot | Purpose | Used By | Status |
|------|---------|---------|--------|
| `default` | Player avatar model | Not yet wired | ❌ Hardcoded |

**Gap**: Similar to NPCs — not yet collection-driven.

### 10. AUDIO ASSETS (`config3D.audioAssets`)

| Slot Key | Purpose | Used By | Status |
|----------|---------|---------|--------|
| `footstep` | Footstep sound | AudioManager | ✅ Wired |
| `ambient` | Ambient background | AudioManager | ✅ Wired |
| `combat` | Combat sounds | AudioManager | ✅ Wired |
| `interact` | Interaction sounds | AudioManager | ✅ Wired |
| `music` | Background music | AudioManager | ✅ Wired |

**Gap**: No collections currently define audio assets. Freesound API integration exists but isn't used in base collections.

### 11. SKYBOX / ENVIRONMENT

| Asset | Purpose | Status |
|-------|---------|--------|
| Sky dome | Sky background | ❌ Hardcoded procedural sky dome |
| Fog settings | Atmospheric depth | ❌ Hardcoded per biome |
| Lighting presets | Sun/ambient colors | ❌ Hardcoded per WorldVisualTheme |

**Gap**: No skybox textures or environment presets in collections.

---

## Fixes Applied in This Session

| # | Fix | File(s) | Impact |
|---|-----|---------|--------|
| 1 | **Merge collection assetIds into /api/worlds/:worldId/assets** | `server/routes.ts` | ROOT CAUSE — all collection assets now visible to BabylonGame |
| 2 | **Map ALL defined assets in config3D** | `data/base-asset-collections.json` | Nature variants, furniture, props now findable by BabylonGame |
| 3 | **Wire street furniture to collection objectModels** | `client/.../BabylonGame.ts` | Real 3D models replace procedural boxes when available |
| 4 | **Add wallTextureId/roofTextureId to config3D** | `server/.../asset-collection-resolver.ts`, `client/.../BabylonGame.ts` | Building textures can now be explicitly defined per collection |

---

## Remaining Gaps (Priority Order)

### HIGH — Needed for visual quality
1. **Re-run migration**: The migration script must be re-run after updating `base-asset-collections.json` so the new config3D mappings take effect in the database
2. **Add wall/roof textures to collections**: Each collection needs Polyhaven texture IDs for walls and roofs
3. **Add shrub/bush models**: No collections define shrub or bush models — these generate as procedural shapes only

### MEDIUM — Would improve immersion
4. **Add audio assets to collections**: Background music, ambient sounds, footstep variants per world type
5. **Wire NPC character models**: Replace hardcoded NPC_MODEL_URL with collection-driven character models
6. **Add rock variants**: Only one rock type per collection — adding 2-3 variants would improve variety
7. **Add evergreen/conifer trees**: Forest worlds need pine/fir tree variants

### LOW — Future enhancements
8. **Skybox textures per world type**: Replace procedural sky with themed skybox cubemaps
9. **Player model customization**: Collection-driven player avatars
10. **Interior furniture placement**: Use collection furniture models in BuildingInteriorGenerator
11. **Weather/particle effects**: Rain, snow, dust per biome

---

## Asset Counts Per Collection

| Collection | Nature | Objects | Textures | Total | config3D Keys |
|-----------|--------|---------|----------|-------|---------------|
| medieval-fantasy | 5 | 13 | 2 | 20 | 20 mapped |
| cyberpunk | 2 | 7 | 2 | 11 | 11 mapped |
| sci-fi-space | 2 | 4 | 2 | 8 | 8 mapped |
| post-apocalyptic | 3 | 7 | 2 | 12 | 12 mapped |
| steampunk | 2 | 8 | 2 | 12 | 12 mapped |
| western-frontier | 3 | 8 | 2 | 13 | 13 mapped |
| tropical-pirate | 2 | 7 | 2 | 11 | 11 mapped |
| generic | 2 | 3 | 2 | 7 | 7 mapped |
| historical | 2 | 5 | 2 | 9 | 9 mapped |
| high-fantasy | 2 | 5 | 2 | 9 | 9 mapped |
| dark-fantasy | 3 | 5 | 2 | 10 | 10 mapped |
| low-fantasy | 2 | 4 | 2 | 8 | 8 mapped |
| historical-medieval | 2 | 5 | 2 | 9 | 9 mapped |
| mythological | 2 | 5 | 2 | 9 | 9 mapped |

**Recommendation**: Collections with < 10 assets should be expanded. Priority: generic (only 7), low-fantasy (8), sci-fi-space (8).

---

## Complete Visual Element Inventory

Every single visible object placed in the Babylon.js game world, how it is currently created, and whether it uses assets from collections.

### Legend

- **Source**: `PROCEDURAL` = built from Babylon.js primitives (boxes, spheres, cylinders, etc.), `HARDCODED` = loads a specific file baked into the code, `COLLECTION` = uses asset from an AssetCollection, `HYBRID` = tries collection first, falls back to procedural
- **Visual Quality**: `🟢 Good` = looks acceptable, `🟡 Passable` = functional but primitive, `🔴 Poor` = visually broken or placeholder-looking
- **In screenshots**: What the user likely sees from this element

---

### A. ENVIRONMENT (always present)

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| A1 | **Sky dome** | PROCEDURAL | `setupScene()` | `BabylonGame.ts:550` | 🟡 Passable | Solid-color sphere (emissive) based on `WorldVisualTheme.skyColor`. No skybox cubemap, no clouds, no gradient. |
| A2 | **Hemispheric light** | PROCEDURAL | `setupScene()` | `BabylonGame.ts:542` | 🟢 Good | Ambient light, intensity 0.7 |
| A3 | **Directional light (sun)** | PROCEDURAL | `setupScene()` | `BabylonGame.ts:545` | 🟢 Good | Sun at (-0.5, -1, -0.5), intensity 1.1 |
| A4 | **Ground terrain** | HYBRID | `createGround()` → `applyWorldTexturesFromAssets()` | `BabylonGame.ts:581-638, 4878-4936` | 🟡 Passable | HeightMap mesh with hardcoded `/assets/ground/ground.jpg` initially, then **overridden** by collection ground texture via `TextureManager.applyGroundTexture()`. The initial tint color is also reset to white. Still uses hardcoded heightmap image. |
| A5 | **Ground bump/normal map** | HARDCODED | `createGround()` | `BabylonGame.ts:609-612` | 🟡 Passable | Hardcoded `/assets/ground/ground-normal.png`. Never overridden by collection. |

---

### B. PLAYER CHARACTER

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| B1 | **Player model** | HARDCODED | `loadPlayer()` | `BabylonGame.ts:2301-2422` | 🟢 Good | Loads `/assets/player/Vincent-frontFacing.babylon`. Code checks `config3D.playerModels.default` for override but **no collection defines player models**, so always falls back to hardcoded Vincent. |
| B2 | **Player health bar** | PROCEDURAL | `HealthBar` class | `HealthBar.ts` | 🟢 Good | Two billboard planes (background gray + foreground colored) floating above player. |
| B3 | **Footstep sound** | HARDCODED | `loadPlayer()` | `BabylonGame.ts:2362-2383` | 🟢 Good | Loads `/assets/footstep_carpet_000.ogg`. Code checks `config3D.audioAssets.footstep` for override but no collection defines audio assets. |

---

### C. NPCs

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| C1 | **NPC model** | HARDCODED | `loadNPC()` | `BabylonGame.ts:2528-2679` | 🟢 Good | Loads `/assets/npc/starterAvatars.babylon`. Code checks `config3D.characterModels[role]` and `config3D.characterModels.npcDefault` for override but **no collection defines character models**, so always falls back to hardcoded. **If this file fails to load, NPCs silently disappear.** |
| C2 | **NPC health bar** | PROCEDURAL | `HealthBar` class | `HealthBar.ts` | 🟢 Good | Same as player health bar, hidden by default until combat. |
| C3 | **NPC role color tint** | PROCEDURAL | `applyNPCRoleTint()` | `BabylonGame.ts` | 🟡 Passable | Tints NPC meshes by role (guard=blue, merchant=green, questgiver=gold, civilian=default). |
| C4 | **NPC quest marker (?)** | PROCEDURAL | Quest indicator system | `QuestIndicatorManager.ts` | 🟡 Passable | Floating "?" or "!" symbol above quest-giving NPCs. |
| C5 | **NPC talking indicator** | PROCEDURAL | `NPCTalkingIndicator` | `NPCTalkingIndicator.ts` | 🟡 Passable | Speech bubble indicator when NPC is in ambient conversation. |
| C6 | **NPC footstep sound** | HARDCODED | `loadNPC()` | `BabylonGame.ts:2591-2612` | 🟢 Good | Same hardcoded footstep sound as player. |

---

### D. BUILDINGS

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| D1 | **Building body (walls)** | HYBRID | `ProceduralBuildingGenerator.generateBuilding()` | `ProceduralBuildingGenerator.ts:262-320, 348-388` | 🔴 Poor | **`CreateBox` primitive** — a solid colored box. Can use `wallTexture` from collection (applied via `setWallTexture()`) which improves appearance, but geometry is still a plain box. The `roleModelPrototypes` system supports complete model overrides but **no collections define building models**. This is the "abstract, blocky brown shapes" the user sees. |
| D2 | **Building roof** | HYBRID | `createRoof()` | `ProceduralBuildingGenerator.ts:393-457` | 🔴 Poor | Medieval/rustic = **`CreateCylinder` with 4 tessellation** (pyramid shape), modern/futuristic = flat box, default = 6-sided cone. Can use `roofTexture` from collection, but geometry is extremely primitive. These are the "brown shapes" with pointed tops. |
| D3 | **Windows** | PROCEDURAL | `addWindows()` | `ProceduralBuildingGenerator.ts:462-503` | 🟡 Passable | `CreatePlane` rectangles on front/back faces, semi-transparent with emissive glow. |
| D4 | **Door** | PROCEDURAL | `addDoor()` | `ProceduralBuildingGenerator.ts:508-525` | 🟡 Passable | `CreatePlane` rectangle at front center of building. |
| D5 | **Chimney** | PROCEDURAL | `createChimney()` | `ProceduralBuildingGenerator.ts:530-560` | 🟡 Passable | `CreateBox` thin column on top of roof. |
| D6 | **Balcony** | PROCEDURAL | `createBalcony()` | `ProceduralBuildingGenerator.ts:562+` | 🟡 Passable | `CreateBox` shelf protruding from upper floor. |

---

### E. ROADS & PATHS

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| E1 | **Inter-settlement roads** | HYBRID | `RoadGenerator.generateRoads()` | `RoadGenerator.ts:176-265` | 🟡 Passable | Terrain-following ribbon mesh (MST algorithm connecting settlements). Uses collection road texture if available via `setRoadTexture()`, otherwise flat color from `WorldVisualTheme.roadColor`. |
| E2 | **Intra-settlement roads** | HYBRID | `RoadGenerator.generateSettlementRoads()` | `RoadGenerator.ts` | 🟡 Passable | Hub-and-spoke roads from settlement center to each building. Same material as inter-settlement roads. |

---

### F. SETTLEMENT DECORATIONS

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| F1 | **Settlement ground marker** | PROCEDURAL | `generateProceduralWorld()` | `BabylonGame.ts:1422-1442` | 🟡 Passable | `CreateDisc` flat circle on ground, semi-transparent amber. Marks settlement center. |
| F2 | **Settlement signpost pole** | PROCEDURAL | `generateProceduralWorld()` | `BabylonGame.ts:1444-1458` | 🟡 Passable | `CreateCylinder` thin brown pole at settlement center. |
| F3 | **Settlement name plate** | PROCEDURAL | `generateProceduralWorld()` | `BabylonGame.ts:1460-1496` | 🟢 Good | `CreatePlane` with DynamicTexture rendering settlement name in serif font. Billboard mode. |
| F4 | **Zone boundary ring** | PROCEDURAL | `createZoneBoundaries()` | `BabylonGame.ts:2185-2273` | 🔴 Poor | `CreateTorus` ring around each settlement, semi-transparent colored. **These are likely the "rainbow-type arches"** the user sees — large colored rings on the ground. |
| F5 | **Zone boundary particles** | PROCEDURAL | `createZoneBoundaries()` | `BabylonGame.ts:2248-2266` | 🟡 Passable | Small floating motes near boundary ring. Uses Babylon.js flare texture from CDN. |
| F6 | **Settlement center props** | COLLECTION | `generateProceduralWorld()` | `BabylonGame.ts:1498-1544` | 🟡 Passable | Clones up to 3 `objectModelTemplates` (chest, lantern, etc.) placed around settlement center. Only appears if collection models loaded successfully. |

---

### G. STREET FURNITURE (per settlement)

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| G1 | **Lamp post / Streetlight** | HYBRID | `createFurnitureProp()` | `BabylonGame.ts:1728-1902` | 🟡 Passable | Tries collection `objectModelTemplates['lamp']` first. Fallback: cylinder pole + sphere lamp head. **The sphere head may look like the "strange orbs"** the user reports. |
| G2 | **Bench** | HYBRID | `createFurnitureProp()` | `BabylonGame.ts:1786-1802` | 🟡 Passable | Tries `objectModelTemplates['furniture_stool'/'furniture_chair']`. Fallback: flat box seat + box legs. |
| G3 | **Well** | HYBRID | `createFurnitureProp()` | `BabylonGame.ts:1804-1820` | 🟡 Passable | Tries `objectModelTemplates['prop'/'decoration']`. Fallback: torus ring + cylinder posts. |
| G4 | **Barrel** | HYBRID | `createFurnitureProp()` | `BabylonGame.ts:1822-1829` | 🟡 Passable | Tries `objectModelTemplates['storage'/'storage_alt']`. Fallback: brown cylinder. |
| G5 | **Crate** | HYBRID | `createFurnitureProp()` | `BabylonGame.ts:1831-1838` | 🟡 Passable | Tries `objectModelTemplates['chest'/'storage']`. Fallback: brown box. |
| G6 | **Market stall** | HYBRID | `createFurnitureProp()` | `BabylonGame.ts:1840-1857` | 🟡 Passable | Tries `objectModelTemplates['furniture_table']`. Fallback: box table + flat awning box. |
| G7 | **Terminal** | HYBRID | `createFurnitureProp()` | `BabylonGame.ts:1859-1877` | 🟡 Passable | (Cyberpunk/sci-fi only) Tries `objectModelTemplates['electronics'/'prop']`. Fallback: metal box + glowing plane screen. |
| G8 | **Planter** | HYBRID | `createFurnitureProp()` | `BabylonGame.ts:1879-1894` | 🟡 Passable | Tries `objectModelTemplates['decoration'/'prop']`. Fallback: tapered cylinder pot + green sphere bush. |

---

### H. NATURE ELEMENTS

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| H1 | **Trees** | HYBRID | `ProceduralNatureGenerator.generateTrees()` | `ProceduralNatureGenerator.ts:338-390` | 🔴 Poor (procedural) / 🟢 Good (model) | Uses collection `defaultTree` + variant models if loaded. Fallback: **cylinder trunk + cone/sphere canopy** — these are the "pillar shapes" and large green orbs the user sees. Pine=stacked cones, Oak=sphere canopy, Palm=cylinder+boxes, Dead=cylinder+branches. |
| H2 | **Rocks** | HYBRID | `ProceduralNatureGenerator.generateRocks()` | `ProceduralNatureGenerator.ts:553-625` | 🔴 Poor (procedural) / 🟢 Good (model) | Uses collection `rock` model if loaded. Fallback: **`CreateSphere` with random squash scaling** — these are some of the "strange orbs" the user sees. Gray/brown spheres scattered across terrain. |
| H3 | **Shrubs / Bushes** | HYBRID | `ProceduralNatureGenerator.generateShrubs()` | `ProceduralNatureGenerator.ts:630-686` | 🔴 Poor | Uses collection `shrub`/`bush` model if loaded. **No collections define shrub/bush models.** Fallback: green `CreateSphere` — more of the green orbs. |
| H4 | **Grass patches** | PROCEDURAL | `ProceduralNatureGenerator.generateGrass()` | `ProceduralNatureGenerator.ts:691-742` | 🟡 Passable | Crossed `CreatePlane` tufts, small scale. Relatively unobtrusive. |
| H5 | **Flowers** | PROCEDURAL | `ProceduralNatureGenerator.generateFlowers()` | `ProceduralNatureGenerator.ts:747-800` | 🟡 Passable | Cylinder stems + sphere heads (tiny). Relatively unobtrusive. |

---

### I. WILDERNESS PROPS (between settlements)

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| I1 | **Camp** | PROCEDURAL | `createWildernessProp('camp')` | `BabylonGame.ts:1983-2011` | 🟡 Passable | 4-sided cone tent + flat box bedroll + torus campfire ring. |
| I2 | **Campfire** | PROCEDURAL | `createWildernessProp('campfire')` | `BabylonGame.ts:2013-2040` | 🟡 Passable | Torus stone ring + glowing sphere embers + cylinder log. |
| I3 | **Ruins** | PROCEDURAL | `createWildernessProp('ruins')` | `BabylonGame.ts:2042-2067` | 🟡 Passable | Two box "broken walls" at angles + sphere rubble pile. |
| I4 | **Standing stones** | PROCEDURAL | `createWildernessProp('standing_stones')` | `BabylonGame.ts:2069-2093` | 🟡 Passable | Circle of 3-5 tall box monoliths. |
| I5 | **Shrine** | PROCEDURAL | `createWildernessProp('shrine')` | `BabylonGame.ts:2095-2116` | 🟡 Passable | Tapered cylinder pedestal + glowing sphere orb on top. **These shrines with glowing orbs are likely some of the "strange orbs" the user reports.** |

---

### J. BUILDING INTERIORS (entered via door click)

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| J1 | **Interior room shell** | PROCEDURAL | `BuildingInteriorGenerator.buildRoom()` | `BuildingInteriorGenerator.ts:157-310` | 🟡 Passable | Ground floor + ceiling + 4 walls (planes) + door frame (box). Solid colors based on building type. |
| J2 | **Interior furniture** | PROCEDURAL | `BuildingInteriorGenerator.generateFurniture()` | `BuildingInteriorGenerator.ts:376-442` | 🔴 Poor | **All furniture is `CreateBox` with solid colors.** Tables, stools, counters, barrels, shelves, beds, anvils — all are rectangles. Collection `objectModelTemplates` are NOT used for interior furniture. |
| J3 | **Exit door** | PROCEDURAL | `buildRoom()` | `BuildingInteriorGenerator.ts:291-307` | 🟡 Passable | Semi-transparent brown box, clickable to exit. |

---

### K. QUEST OBJECTS (spawned during active quests)

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| K1 | **Collectible items** | HYBRID | `QuestObjectManager.spawnCollectibleItems()` | `QuestObjectManager.ts:315-431` | 🟡 Passable | Uses collection `questObjectModels['collectible']` if registered. Fallback: golden `CreateSphere`. Floating + rotating animation. |
| K2 | **Location marker/beacon** | HYBRID | `QuestObjectManager.spawnLocationMarker()` | `QuestObjectManager.ts:436-489` | 🟡 Passable | Uses collection `questObjectModels['marker']` if registered. Fallback: tall semi-transparent `CreateCylinder` beacon with pulsing animation. |
| K3 | **Quest item labels** | PROCEDURAL | `spawnCollectibleItems()` | `QuestObjectManager.ts:401-419` | 🟢 Good | GUI billboard labels with item names. |

---

### L. COMBAT ELEMENTS (genre-dependent, not always active)

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| L1 | **Projectiles** | PROCEDURAL | `RangedCombatSystem.spawnProjectile()` | `RangedCombatSystem.ts:280-303` | 🟡 Passable | Tiny `CreateSphere` (0.2 diameter), travels along direction vector. |
| L2 | **Combat UI** | PROCEDURAL | `CombatUI` | `CombatUI.ts` | 🟢 Good | GUI overlay elements for health, targeting, damage numbers. |

---

### M. RESOURCE NODES (survival/strategy genres only)

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| M1 | **Wood node** | PROCEDURAL | `ResourceSystem.createNodeMesh()` | `ResourceSystem.ts:134-178` | 🟡 Passable | `CreateCylinder` (tree-stump-like). |
| M2 | **Stone/Iron/Crystal node** | PROCEDURAL | `ResourceSystem.createNodeMesh()` | `ResourceSystem.ts:142-146` | 🟡 Passable | `CreateIcoSphere` (faceted rock). |
| M3 | **Gold node** | PROCEDURAL | `ResourceSystem.createNodeMesh()` | `ResourceSystem.ts:148-150` | 🟡 Passable | Smaller `CreateIcoSphere`, shiny material. |
| M4 | **Food/Fiber node** | PROCEDURAL | `ResourceSystem.createNodeMesh()` | `ResourceSystem.ts:152-155` | 🟡 Passable | `CreateSphere` (bush-like). |
| M5 | **Water node** | PROCEDURAL | `ResourceSystem.createNodeMesh()` | `ResourceSystem.ts:157-159` | 🟡 Passable | Flat `CreateCylinder` disc. |
| M6 | **Oil node** | PROCEDURAL | `ResourceSystem.createNodeMesh()` | `ResourceSystem.ts:161-163` | 🟡 Passable | Dark `CreateCylinder` barrel shape. |

---

### N. PLAYER-PLACED BUILDINGS (survival/sandbox genres only)

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| N1 | **Ghost preview mesh** | PROCEDURAL | `BuildingPlacementSystem.createGhostMesh()` | `BuildingPlacementSystem.ts:371-383` | 🟡 Passable | Semi-transparent green/red `CreateBox` shown during placement mode. |
| N2 | **Placed building** | PROCEDURAL | `BuildingPlacementSystem.confirmPlacement()` | `BuildingPlacementSystem.ts:454-460` | 🟡 Passable | `CreateBox` with category-colored material. Not using ProceduralBuildingGenerator — simpler boxes. |

---

### O. DUNGEON ELEMENTS (roguelike genre only)

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| O1 | **Dungeon floors** | PROCEDURAL | `ProceduralDungeonGenerator` | `ProceduralDungeonGenerator.ts` | 🟡 Passable | `CreateGround` planes per room. |
| O2 | **Dungeon walls** | PROCEDURAL | `ProceduralDungeonGenerator` | `ProceduralDungeonGenerator.ts` | 🟡 Passable | `CreateBox` wall segments around rooms. |
| O3 | **Dungeon doors** | PROCEDURAL | `ProceduralDungeonGenerator` | `ProceduralDungeonGenerator.ts` | 🟡 Passable | `CreateBox` door frames between rooms. |

---

### P. UI / HUD ELEMENTS IN 3D SPACE

| # | Element | Source | Created By | File(s) | Visual Quality | Notes |
|---|---------|--------|------------|---------|----------------|-------|
| P1 | **Building info hover labels** | PROCEDURAL | `BuildingInfoDisplay` | `BuildingInfoDisplay.ts` | 🟢 Good | GUI tooltip showing building name/type on hover. |
| P2 | **Minimap markers** | PROCEDURAL | `BabylonMinimap` | `BabylonMinimap.ts` | 🟢 Good | 2D overlay minimap with settlement/NPC markers. |
| P3 | **Quest tracker** | PROCEDURAL | `BabylonQuestTracker` | `BabylonQuestTracker.ts` | 🟢 Good | GUI panel showing active quests. |
| P4 | **Radial action menu** | PROCEDURAL | `BabylonRadialMenu` | `BabylonRadialMenu.ts` | 🟢 Good | Context-sensitive radial menu on right-click. |

---

### Q. NOT IMPLEMENTED (flags/imports exist but no visuals generated)

| # | Element | Status | Notes |
|---|---------|--------|-------|
| Q1 | **Water bodies** | Flag only | `BiomeStyle.hasWater` is `true` for forest, mountains, tundra, tropical, swamp biomes — but **no water mesh generation code exists**. The flag is never consumed. |
| Q2 | **VR UI panels** | Import only | `VRUIPanel`, `VRHandMenu`, `VRVocabularyLabels`, `VRHUDManager`, `VRChatPanel`, `VRAccessibilityManager` are imported but only instantiated when VR mode is active (WebXR session). Not visible in standard desktop play. |
| Q3 | **Fog / atmospheric effects** | Not implemented | No fog settings, volumetric effects, or distance-based atmosphere. |
| Q4 | **Weather particles** | Not implemented | No rain, snow, dust, or wind effects despite biome presets suggesting them. |
| Q5 | **Shadows** | Partial | `receiveShadows = true` on ground mesh, but no `ShadowGenerator` is created — so no shadows are actually cast. |

---

## Screenshot Forensics — Artifact-by-Artifact Identification

Detailed mapping of every visible artifact in the user-provided screenshots to the exact code that creates it.

---

### Screenshot 1: Settlement View (close-up)

![Screenshot 1 description: Player near settlement with gray rectangles, brown pyramids, dark buildings, curved arc]

#### Artifact 1-A: Thin curved white/gray arc (upper-left, sweeping across sky)

- **Identified as**: Zone boundary torus ring (element **F4**)
- **Created by**: `createZoneBoundaries()` at `BabylonGame.ts:2222-2231`
- **Geometry**: `MeshBuilder.CreateTorus()` with diameter = `zoneRadius * 2`
- **Exact dimensions**: For a "town" settlement: `baseSize=18`, `buildingRadius = 18 × 1.6 = 28.8`, `zoneRadius = 28.8 × 1.8 = 51.84`, so **diameter ≈ 103.7 units**. For "city": **diameter ≈ 138 units**. For "village": **diameter ≈ 80 units**.
- **Material**: Semi-transparent (alpha=0.25), colored by settlement type: blue for city, amber for village, green for town. Emissive glow at 30% intensity.
- **Position**: `position.y = 0.15` (just above ground), `rotation.x = Math.PI / 2` (flat/horizontal)
- **Why it looks wrong**: The torus is 80-140 units in diameter but only 0.3 units thick. From the player's perspective inside or near the ring, it appears as a **massive thin arc sweeping across the sky**. It's positioned at ground level but because of the extreme diameter, the far side rises above the terrain's hills due to terrain height variation.
- **Root cause**: The torus is placed at a fixed Y=0.15, but the terrain has height variation (heightmap goes from 0-10). Parts of the ring on lower ground appear to hover in the sky when viewed from higher terrain. Combined with its huge diameter, it creates the illusion of a rainbow arch.

#### Artifact 1-B: Dark gray/black tall thin rectangles (near player, center of image)

- **Identified as**: Wilderness "standing stones" prop (element **I4**)
- **Created by**: `createWildernessProp('standing_stones')` at `BabylonGame.ts:2069-2093`
- **Geometry**: `MeshBuilder.CreateBox()` — width: `0.6 + random*0.4` (0.6-1.0), height: `2 + random*2` (2-4 units), depth: `0.4 + random*0.3` (0.4-0.7)
- **Material**: `diffuseColor = new Color3(0.5, 0.5, 0.48)` — medium gray, specular 0.05
- **Arrangement**: 3-5 stones in a circle of radius 2.5 units, each with slight random lean (`rotation.z ± 0.15`)
- **Why they look wrong**: These are narrow flat-ish boxes that look like dark 2D rectangles from a distance. The slight depth (0.4-0.7) is barely visible. At 2-4 units tall, they're taller than the player. The gray color against the brown/yellow terrain makes them look alien and out of place.
- **Alternative possibility**: Could also be ruins wall segments (`createWildernessProp('ruins')`) — wall1 is `CreateBox` width=4, height=2.5, depth=0.4; wall2 is width=2.5, height=1.5, depth=0.4. Same gray material `(0.5, 0.48, 0.42)`.

#### Artifact 1-C: Brown pyramid/cone shapes (background, clustered)

- **Identified as**: Procedural building roofs (element **D2**)
- **Created by**: `createRoof()` at `ProceduralBuildingGenerator.ts:400-412`
- **Geometry**: `MeshBuilder.CreateCylinder()` with `diameterTop: 0`, `diameterBottom: max(width,depth) * 1.2`, `height: 3`, **`tessellation: 4`** — this creates a **4-sided pyramid**, not a smooth cone
- **Exact size example**: For a "Tavern" (width=14, depth=14): diameterBottom = `14 * 1.2 = 16.8`, height = 3. For "residence_small" (width=8, depth=8): diameterBottom = `8 * 1.2 = 9.6`.
- **Material**: `spec.style.roofColor` — for medieval_wood style: `new Color3(0.3, 0.2, 0.15)` (dark brown). No roof texture applied if `this.roofTexture` is null.
- **Position**: Sits on top of building body at `totalHeight + roofHeight/2`
- **Why they look wrong**: Tessellation of 4 creates a **square-base pyramid**, not a natural-looking peaked roof. The dark brown color with no texture makes them look like solid flat-shaded polygons. Rotated by `Math.PI / 4` (45°) to align diamond-wise with the building box.
- **Root cause**: `this.roofTexture` is null → collection roof texture not loading → falls back to flat `roofColor`.

#### Artifact 1-D: Dark brown/black box buildings (behind the pyramids)

- **Identified as**: Procedural building bodies (element **D1**)
- **Created by**: `createBuildingStructure()` at `ProceduralBuildingGenerator.ts:348-388`
- **Geometry**: `MeshBuilder.CreateBox()` — dimensions vary by building type (e.g., Tavern: 14×8×14, residence_small: 8×4×8)
- **Material**: For medieval_wood style: `baseColor = new Color3(0.55, 0.35, 0.2)` (medium brown). No wall texture applied if `this.wallTexture` is null — the code checks `if (this.wallTexture)` and only applies texture if present.
- **Why they look wrong**: Plain monochrome boxes with no surface detail. The dark brown color is flat and unlit-looking. With 1-3 floors (height 4-12 units), they appear as massive solid blocks.
- **Root cause**: `this.wallTexture` is null → collection wall texture not loading → falls back to flat `baseColor`.

#### Artifact 1-E: Small dark rectangles poking above the pyramids

- **Identified as**: Chimneys (element **D5**)
- **Created by**: `createChimney()` at `ProceduralBuildingGenerator.ts:530-552`
- **Geometry**: `MeshBuilder.CreateBox()` — width=1, height=5, depth=1
- **Position**: On top of building at `(width/3, totalHeight + chimneyHeight/2, -depth/4)` — so they poke above the roof
- **Material**: `baseColor.scale(0.7)` — darker version of the building wall color
- **Note**: `hasChimney` is true for Bakery, Blacksmith, residence_medium, residence_large, residence_mansion

#### Artifact 1-F: Green box shape (bottom-right corner)

- **Identified as**: Procedural grass patch (element **H4**), possibly viewed edge-on
- **Created by**: `generateGrass()` at `ProceduralNatureGenerator.ts:706-741`
- **Geometry**: Two merged `CreatePlane` meshes (each 0.8 × 1.2), crossed perpendicular, then instanced
- **Scaling**: `scaleVar = 0.6 + random*0.8` (range 0.6-1.4), applied uniformly to all axes
- **Material**: `biome.grassColor` — e.g., for "plains": `new Color3(0.3, 0.6, 0.2)` (green), `backFaceCulling = false`, `alpha = 0.9`
- **Why it looks like a box**: When viewed from certain angles, the two crossed planes collapse into a rectangular silhouette. The green color and flat shading make it look like a solid green box. At higher scale values (1.0-1.4), these patches are about 1.1-1.7 units wide and 1.7-2.5 units tall — quite visible.
- **Alternative**: Could also be a `generateShrubs()` fallback — `CreateSphere` diameter=1, scaled by 1-3 in a green material. But the rectangular shape strongly suggests crossed planes.

---

### Screenshot 2: Open Terrain View

![Screenshot 2 description: Player on open terrain with gray ellipsoids, tan cone, green rectangle]

#### Artifact 2-A: Gray squashed ellipsoids (scattered, multiple visible)

- **Identified as**: Procedural rocks (element **H2**)
- **Created by**: `generateRocks()` at `ProceduralNatureGenerator.ts:597-624`
- **Geometry**: `MeshBuilder.CreateSphere()` — base diameter=1, segments=6 (low-poly)
- **Scaling**: `scale = 1 + random*3` (range 1-4), then:
  - X: `scale * (0.8 + random*0.4)` = `scale * 0.8-1.2`
  - Y: `scale * (0.6 + random*0.3)` = `scale * 0.6-0.9` ← **Y is squashed** giving the oblate shape
  - Z: `scale * 1.0`
- **Position**: `y = baseHeight + scale/2` — half-buried in terrain
- **Material**: `biome.rockColor` — for plains biome: `new Color3(0.5, 0.5, 0.45)` (gray)
- **Why they look wrong**: Low-poly (6 segments) sphere with uneven axis scaling creates an obvious **squashed egg/ellipsoid** shape. At scale 2-4, these are 2-4 meters wide — very prominent in the landscape. The gray color stands out against the yellow/brown terrain.
- **Root cause**: Rock model override from collection not loading → falls back to primitive sphere.

#### Artifact 2-B: Tan/beige pyramid/cone (left side, isolated)

- **Identified as**: Procedural pine tree cone layer (element **H1**) — specifically `createPineTree()`
- **Created by**: `createPineTree()` at `ProceduralNatureGenerator.ts:412-442`
- **Geometry**: Three stacked `CreateCylinder()` cones with `diameterTop=0`:
  - Bottom cone: height=4, diameterBottom=4, positioned at y=6
  - Middle cone: height=4, diameterBottom=3.5, positioned at y=8.5
  - Top cone: height=4, diameterBottom=3, positioned at y=11
- **Material**: `diffuseColor = new Color3(0.15, 0.4, 0.15)` (dark green)
- **Note**: The trunk is a cylinder (height=8, diameterBottom=0.8) but may be too thin to see at this distance
- **Why it looks wrong**: From a distance, the three stacked cones merge into a single large triangular shape. The tessellation=8 makes them look like low-poly cones. The dark green material blends with terrain making only the silhouette visible.
- **Alternative identification**: Could also be a detached building **roof** (`createRoof()`) if a building's body was placed below terrain level. Roof uses tessellation=4 (pyramid) which matches the angular shape. The tan/beige color would match a roof without texture: `roofColor = new Color3(0.3, 0.2, 0.15)`.

#### Artifact 2-C: Gray hemisphere (left side, next to the cone)

- **Identified as**: Large procedural rock (element **H2**) — same as 2-A but larger
- **Scale**: Likely in the 3-4 range, making it 3-4 meters across
- **Y-scaling**: 0.6-0.9 creates the hemisphere/dome appearance instead of a full sphere

#### Artifact 2-D: Green rectangular shape (front-left)

- **Identified as**: Procedural grass patch (element **H4**) — same as 1-F
- **Created by**: `generateGrass()` crossed planes
- **Why visible**: At scale ~1.0+, these crossed planes are ~1-1.7 units wide and ~1.2-2.5 units tall. Viewed from the side or at certain angles, the two perpendicular planes form a **rectangular silhouette**. The `backFaceCulling = false` ensures both sides render, making it look solid.
- **Key detail**: The darker vertical line through the center of the green shape (visible in screenshot) is the **seam where the two planes intersect** — this confirms it's the crossed-plane grass template.

#### Artifact 2-E: Brown buildings with pyramids and chimneys (far-left background)

- **Same as 1-C, 1-D, 1-E** — procedural buildings with pyramid roofs and chimney boxes, viewed from a greater distance.

#### Artifact 2-F: Thin vertical stick (mid-distance, barely visible)

- **Identified as**: Settlement signpost pole (element **F2**)
- **Created by**: `generateProceduralWorld()` at `BabylonGame.ts:1444-1458`
- **Geometry**: `CreateCylinder` — height=3, diameter=0.15
- **Material**: Brown `(0.35, 0.25, 0.15)`

---

## Root Cause Analysis

### Why everything is procedural fallbacks

The screenshots confirm that **every visible object is using the procedural primitive fallback**, meaning:

1. **Collection 3D models (glTF from Polyhaven) are NOT loading** — trees show as cylinder+cone/sphere, rocks as spheres, furniture as boxes
2. **Collection textures may partially load** — the ground has a texture applied (the yellow/red tiled pattern) which matches a Polyhaven ground texture, but wall and roof textures are clearly not applying (buildings are flat-colored)
3. **The NPC model file is likely failing** — zero NPCs are visible in either screenshot

### Probable failure chain

```
Asset Collection resolved → config3D returned with asset IDs
  → BabylonGame.applyWorld3DConfig() called
    → findAssetById() looks up each ID in worldAssets[]
      → For 3D models: SceneLoader.ImportMeshAsync() called
        → ⚠️ FAIL: Polyhaven assets are TEXTURES (PBR maps), not 3D model files (.glb)
        → No .glb files exist at the asset paths → silent fallback to procedural
      → For textures: TextureManager.loadTexture() called
        → ✅ Polyhaven texture maps DO load (ground texture visible)
        → ⚠️ BUT wall/roof textures may not be wired correctly to the building generator
```

**Critical insight**: The base-asset-collections.json defines assets with `polyhavenId` references. Polyhaven provides **textures** (diffuse maps, normal maps, etc.) and **3D models** separately. The `natureModels` and `objectModels` sections of config3D reference Polyhaven IDs that may be **texture assets being treated as 3D models**, which would cause `SceneLoader.ImportMeshAsync()` to fail silently on every model load attempt.

### What IS working

- **Player model** ✅ — Vincent loads from hardcoded `/assets/player/Vincent-frontFacing.babylon`
- **Ground texture** ✅ — Polyhaven ground texture appears to be applying (yellowish tiled pattern)
- **Sky dome** ✅ — Blue procedural sky visible
- **Terrain heightmap** ✅ — Rolling hills from heightmap
- **Procedural generation pipeline** ✅ — Settlements, buildings, roads, nature, wilderness props are all spawning at correct positions

### What is NOT working

- **NPCs** ❌ — Model file likely 404ing or failing to parse
- **Nature models** ❌ — Trees, rocks, shrubs all showing procedural fallbacks
- **Object/prop models** ❌ — Street furniture showing procedural fallbacks
- **Wall/roof textures** ❌ — Buildings showing flat color instead of textured surfaces
- **Zone boundaries** ⚠️ — Working as coded, but the design itself is visually problematic

### Priority Fix List

| Priority | Issue | Impact | Difficulty |
|----------|-------|--------|------------|
| 🔴 P0 | **Investigate why NPC model loading fails** — NPCs completely missing | Players see an empty world | Debug — check if `/assets/npc/starterAvatars.babylon` serves correctly |
| 🔴 P0 | **Investigate why collection 3D models fail to load** — everything shows procedural fallbacks | Everything looks like primitive shapes | Debug — check `SceneLoader.ImportMeshAsync()` errors in console, verify file paths serve correctly |
| 🔴 P1 | **Remove or tone down zone boundary rings** — they look like "rainbow arches" | Immersion-breaking visual artifact | Code change — reduce alpha, change to ground-level line, or remove entirely |
| 🟡 P2 | **Improve procedural building geometry** — even with textures, boxes are ugly | Buildings look like toy blocks | Major code change — add bevels, multi-story stacking, window recesses, proper peaked roofs |
| 🟡 P2 | **Wire interior furniture to collection models** — currently all CreateBox | Interiors are all rectangles | Code change — `BuildingInteriorGenerator` should use `objectModelTemplates` |
| 🟡 P3 | **Add fallback NPC mesh** — if model fails, create a simple humanoid placeholder | NPCs disappear silently on load failure | Code change — add capsule/cylinder fallback in `loadNPC()` catch block |
| 🟢 P4 | **Add shrub/bush models to collections** — always falls back to spheres | Green orbs scattered everywhere | Data change — find suitable Polyhaven models or remove shrub generation for biomes without models |
