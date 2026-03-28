# PRD: Unified Building & NPC Configuration System

## Introduction

The Insimul 3D world currently suffers from several visual and functional gaps that undermine the dissertation defense demo quality: all NPCs look identical regardless of gender, procedural settlement generation only produces shops, building configuration is split across two disconnected UI sections, and interiors are not configurable per building type. This PRD covers a comprehensive overhaul that merges building configuration into a unified system, adds texture support, enables interior configuration via templates, fixes business/residence type diversity, and implements modular NPC assembly for visual variety.

The primary driver is preparing a polished, visually distinct world for the dissertation defense demo.

## Goals

- Merge "3D Configuration" and "Procedural Buildings" into a single unified building configuration UI where each business type and residence type is individually configurable
- Support choosing between asset models OR procedural generation per building type, with category-level shared presets and per-type overrides
- Add texture references (wall, roof, floor, door, window) to procedural style presets
- Enable interior configuration per building type using template-based room layouts with configurable textures and furniture sets
- Provide real-time 3D preview of both exterior and interior configurations in the asset collection editor
- Fix business/residence type editing on the Society page (SettlementHub)
- Fix settlement generation to produce a diverse mix of business types instead of only shops
- Implement full modular NPC assembly: gender-correct base body + hair + facial hair + outfit pieces + body proportions, all driven by character data and deterministic hashing

## User Stories

### US-001: Unified Building Type Schema
**Description:** As a developer, I need to update the schema to support unified per-type building configuration so that each BusinessType and ResidenceType can store either an asset reference or procedural generation settings.

**Acceptance Criteria:**
- [x] Add `UnifiedBuildingTypeConfig` type to `shared/game-engine/types.ts` with fields: `mode` ('asset' | 'procedural'), `assetId?`, `stylePresetId?`, `styleOverrides?`, `interiorConfig?`
- [x] Add `buildingTypeConfigs: Record<string, UnifiedBuildingTypeConfig>` to AssetCollection schema in `shared/schema.ts`
- [x] Add `InteriorTemplateConfig` type with fields: `mode` ('model' | 'procedural'), `modelPath?`, `layoutTemplate?`, `wallTextureId?`, `floorTextureId?`, `ceilingTextureId?`, `furnitureSet?`, `lightingPreset?`
- [x] Add texture fields to `ProceduralStylePreset`: `wallTextureId?`, `roofTextureId?`, `floorTextureId?`, `doorTextureId?`, `windowTextureId?`
- [x] Define category-level shared presets structure: `categoryPresets: Record<string, ProceduralStylePreset>` where keys are categories like 'restaurant', 'retail', 'residential', etc.
- [x] Add `InteriorLayoutTemplate` type with fields: `rooms: RoomTemplate[]`, `totalWidth`, `totalDepth`, `floors`
- [x] Add `RoomTemplate` type with: `name`, `function`, `relativeWidth`, `relativeDepth`, `furniturePreset`
- [x] Add `FurnitureSet` type mapping room functions to lists of furniture item types
- [x] Typecheck passes

### US-002: Category Preset System
**Description:** As a world creator, I want building types grouped by category (restaurants, retail, residential, etc.) with shared presets so I don't have to configure each of the 45+ types individually, but can override specific types when needed.

**Acceptance Criteria:**
- [x] Define default category groupings: `commercial_food` (Restaurant, Bar, Bakery, Brewery, Cafe), `commercial_retail` (Shop, GroceryStore, JewelryStore, BookStore, PawnShop, HerbShop), `commercial_service` (Bank, Hotel, Barbershop, Tailor, Bathhouse, DentalOffice, OptometryOffice, Pharmacy), `civic` (Church, TownHall, School, University, Hospital, PoliceStation, FireStation, Daycare), `industrial` (Factory, Farm, Warehouse, Blacksmith, Carpenter, Butcher), `maritime` (Harbor, Boatyard, FishMarket, CustomsHouse, Lighthouse), `residential` (house, apartment, mansion, cottage, townhouse, mobile_home)
- [x] Each category has a shared `ProceduralStylePreset` that applies to all types in the category by default
- [x] Individual building types can override any field from their category preset
- [x] Override resolution: type-specific override > category preset > global defaults
- [x] Typecheck passes

### US-003: Unified Building Configuration UI - Layout
**Description:** As a world creator, I want to see all building types in one unified configuration panel instead of separate "3D Config" and "Procedural Buildings" sections, so I can manage everything in one place.

**Acceptance Criteria:**
- [x] Remove separate "3D Configuration > Building Models" and "Procedural Buildings" sections from AdminAssetsHub.tsx
- [x] Add new "Building Configuration" section that lists all building types organized by category (commercial_food, commercial_retail, commercial_service, civic, industrial, maritime, residential)
- [x] Each category is collapsible with a header showing the category name and count of configured types
- [x] Category header shows a summary indicator (e.g., "3 asset / 5 procedural / 2 unconfigured")
- [x] Each building type row shows: type name, current mode (asset/procedural), and a thumbnail or color swatch
- [x] Clicking a building type row expands inline or opens a detail panel
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-004: Per-Type Configuration - Asset Mode
**Description:** As a world creator, I want to assign a 3D model asset to a specific building type so that buildings of that type use the chosen model.

**Acceptance Criteria:**
- [x] Detail panel shows mode toggle: "Asset Model" / "Procedural Generation"
- [x] In Asset mode, show asset picker (reuse existing asset selector from current buildingModels config)
- [x] Show model scaling overrides (x, y, z) for the selected asset
- [x] Selected asset ID is stored in `buildingTypeConfigs[typeName].assetId`
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-005: Per-Type Configuration - Procedural Mode
**Description:** As a world creator, I want to configure procedural generation settings for a building type, inheriting from the category preset but allowing overrides.

**Acceptance Criteria:**
- [x] In Procedural mode, show all style preset fields: base colors (multiple), roof color, window color, door color, material type, architecture style, roof style
- [x] Show feature toggles: balcony, ironwork balcony, porch, shutters with porch depth/steps and shutter color
- [x] Show dimension overrides: floors, width, depth
- [x] Show feature overrides: chimney toggle
- [x] Fields that match the category preset show as "inherited" (dimmed/placeholder) — editing creates an override
- [x] "Reset to category default" button per field and "Reset all" button
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-006: Category Preset Editor
**Description:** As a world creator, I want to edit the shared category preset so that changes apply to all building types in that category (unless overridden).

**Acceptance Criteria:**
- [x] Category header row has an "Edit Category Preset" button/icon
- [x] Opens a preset editor with all ProceduralStylePreset fields including new texture fields
- [x] Changes propagate to all types in the category that haven't overridden those fields
- [x] Preview of a representative building from the category updates in real-time
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-007: Texture Configuration for Procedural Presets
**Description:** As a world creator, I want to assign textures to walls, roofs, floors, doors, and windows in procedural style presets so buildings look more realistic.

**Acceptance Criteria:**
- [x] Add texture picker fields in both category preset editor and per-type override: wall texture, roof texture, floor texture, door texture, window texture
- [x] Texture picker shows available texture assets from the current collection and global assets
- [x] Selected textures are stored in `ProceduralStylePreset` texture fields
- [x] "None" option uses solid color fallback (existing behavior)
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-008: Apply Preset Textures in ProceduralBuildingGenerator
**Description:** As a developer, I need the ProceduralBuildingGenerator to use per-preset texture references when generating building meshes.

**Acceptance Criteria:**
- [x] `ProceduralBuildingGenerator.generateBuilding()` reads texture IDs from the resolved style preset
- [x] Loads texture assets and applies them to wall, roof, floor, door, and window materials
- [x] Falls back to solid color when no texture is specified (preserves existing behavior)
- [x] Texture materials are cached in the existing `materialCache` to avoid duplicates
- [x] Typecheck passes

### US-009: Interior Template Configuration UI
**Description:** As a world creator, I want to configure interior settings per building type, choosing between a pre-made glTF model or a procedural template with room layout, textures, and furniture.

**Acceptance Criteria:**
- [x] Interior section in per-type detail panel with mode toggle: "3D Model" / "Procedural Template"
- [x] Model mode: interior model picker (browse available glTF interiors)
- [x] Template mode: room layout template selector with predefined templates per category (e.g., "Open shop floor + back storage", "Restaurant dining + kitchen", "Living room + bedroom + kitchen")
- [x] Template mode: wall texture, floor texture, ceiling texture pickers
- [x] Template mode: furniture set selector (e.g., "Tavern furniture", "Shop displays", "Residential basic")
- [x] Template mode: lighting preset selector (bright, dim, warm, cool, candlelit)
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-010: Interior Layout Templates
**Description:** As a developer, I need predefined interior layout templates that can be selected per building type and fed into the BuildingInteriorGenerator.

**Acceptance Criteria:**
- [x] Create at least 15 interior layout templates covering: tavern/bar (main hall + kitchen + storage), restaurant (dining + kitchen), shop (sales floor + storage), residence-small (living + bedroom + kitchen), residence-medium (living + dining + kitchen + 2 bedrooms + bathroom), residence-large/mansion (multi-floor with study, library, multiple bedrooms), church (nave + altar area), school (classrooms + office), hotel (lobby + rooms corridor), bakery (front counter + kitchen), blacksmith (forge + display), farm (barn layout), office (cubicles + meeting room), clinic/hospital (waiting + exam rooms), warehouse (open storage)
- [x] Each template defines: room list with functions, relative dimensions, door placements between rooms, floor count
- [x] Templates stored in a shared constants file (e.g., `shared/game-engine/interior-templates.ts`)
- [x] Typecheck passes

### US-011: Apply Interior Config in BuildingInteriorGenerator
**Description:** As a developer, I need the BuildingInteriorGenerator to use the per-type interior configuration (textures, furniture set, layout template) when generating interiors.

**Acceptance Criteria:**
- [x] `BuildingInteriorGenerator` reads `InteriorTemplateConfig` from the asset collection's `buildingTypeConfigs`
- [x] If mode is 'model', delegates to InteriorSceneManager to load the glTF model
- [x] If mode is 'procedural', uses the selected layout template to generate rooms with correct dimensions
- [x] Applies configured wall/floor/ceiling textures to generated room meshes
- [x] Places furniture from the configured furniture set using InteriorItemManager
- [x] Applies lighting preset (intensity, color temperature, shadow settings)
- [x] Falls back to existing hardcoded behavior when no config is specified
- [x] Typecheck passes

### US-012: Exterior 3D Preview in Asset Collection Editor
**Description:** As a world creator, I want to see a real-time 3D preview of the exterior building when configuring it, so I can see the effect of my changes immediately.

**Acceptance Criteria:**
- [x] BuildingModelPreview component embedded in the per-type detail panel
- [x] In asset mode: shows the selected 3D model with scaling applied
- [x] In procedural mode: renders a full procedural building using the resolved preset (category + overrides)
- [x] Preview updates in real-time as color, texture, material, architecture style, or feature settings change
- [x] Preview shows textures when configured (not just solid colors)
- [x] Auto-rotate toggle and zoom controls (reuse existing BuildingModelPreview features)
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-013: Interior 3D Preview in Asset Collection Editor
**Description:** As a world creator, I want to preview the interior configuration alongside the exterior so I can see the full building experience.

**Acceptance Criteria:**
- [x] Tab or toggle to switch between "Exterior" and "Interior" preview in the detail panel
- [x] In model mode: loads and displays the selected interior glTF model
- [x] In template mode: renders the procedural interior with room layout, textures, furniture, and lighting
- [x] Camera positioned inside the interior looking around (first-person or orbital)
- [x] Preview updates when interior config changes (texture, furniture set, layout template, lighting)
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-014: Business Type Editing on Society Page
**Description:** As a world creator, I want to change a business's type from the Society page so I can correct or customize the business mix after generation.

**Acceptance Criteria:**
- [x] Add business type dropdown/selector to the business detail view in SettlementHub.tsx
- [x] Dropdown lists all BusinessType values from the schema enum
- [x] Selecting a new type calls API to update the business
- [x] Building 3D preview updates to reflect the new type's configuration
- [x] Change persists in database
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-015: Residence Type Editing on Society Page
**Description:** As a world creator, I want to change a residence's type from the Society page so I can customize the residential mix.

**Acceptance Criteria:**
- [x] Add residence type dropdown/selector to the residence detail view in SettlementHub.tsx
- [x] Dropdown lists all ResidenceType values from the schema enum
- [x] Selecting a new type calls API to update the residence
- [x] Building 3D preview updates to reflect the new type's configuration
- [x] Change persists in database
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-016: API Endpoints for Type Updates
**Description:** As a developer, I need API endpoints to update business type and residence type.

**Acceptance Criteria:**
- [x] `PATCH /api/worlds/:worldId/businesses/:businessId` endpoint accepts `{ businessType: string }` and validates against BusinessType enum
- [x] `PATCH /api/worlds/:worldId/residences/:residenceId` endpoint accepts `{ residenceType: string }` and validates against ResidenceType enum
- [x] Returns 400 if type value is not in the enum
- [x] Returns updated business/residence object
- [x] Typecheck passes

### US-017: Fix inferBusinessType Default Fallback
**Description:** As a developer, I need to fix the geography generator's `inferBusinessType()` function so it doesn't default everything to 'Shop'.

**Acceptance Criteria:**
- [x] `inferBusinessType()` in `geography-generator.ts` uses a weighted random selection from all BusinessType values when no keyword match is found, instead of defaulting to 'Shop'
- [x] Weights reflect realistic town composition: more retail/food, fewer civic/industrial
- [x] Add keyword matches for all BusinessType values that are currently missing
- [x] Typecheck passes

### US-018: Fix determineBusinessMix Category-to-Type Mapping
**Description:** As a developer, I need to fix the world generator's `determineBusinessMix()` so generic categories map to actual BusinessType enum values.

**Acceptance Criteria:**
- [x] Create explicit mapping from generic categories ('Retail', 'Restaurant', 'Medicine', etc.) to arrays of actual BusinessType values
- [x] 'Retail' maps to ['Shop', 'GroceryStore', 'JewelryStore', 'BookStore', 'PawnShop', 'HerbShop']
- [x] 'Restaurant' maps to ['Restaurant', 'Bar', 'Bakery', 'Brewery']
- [x] 'Medicine' maps to ['Hospital', 'Pharmacy', 'Clinic', 'DentalOffice', 'OptometryOffice']
- [x] Each category randomly selects from its mapped BusinessType values
- [x] Generated settlements contain a diverse mix (no more than 30% of any single BusinessType)
- [x] Typecheck passes

### US-019: Diverse Residence Type Generation
**Description:** As a developer, I need settlement generation to create a mix of residence types instead of only 'house'.

**Acceptance Criteria:**
- [x] Geography generator assigns residence types using weighted distribution: house (40%), apartment (20%), cottage (15%), townhouse (15%), mansion (5%), mobile_home (5%)
- [x] Weights are configurable or influenced by settlement size/type (larger settlements = more apartments)
- [x] Generated settlements show visible variety in residence types
- [x] Typecheck passes

### US-020: Modular NPC Body Assembly System
**Description:** As a developer, I need to implement a modular NPC mesh assembly system that composes characters from separate body, hair, and accessory meshes based on gender and individual traits.

**Acceptance Criteria:**
- [x] Create `NPCModularAssembler` class in `client/src/components/3DGame/NPCModularAssembler.ts`
- [x] Loads base body meshes: male_peasant, female_peasant, male_ranger, female_ranger from quaternius assets
- [x] Selects base body by character gender (male/female)
- [x] Selects outfit variant (peasant/ranger) based on occupation hash
- [x] Assembles body from parts: head, body, arms, legs, feet (matching the quaternius part structure)
- [x] Parents all parts to a common root transform node
- [x] Caches loaded mesh templates and clones for instances (performance)
- [x] Typecheck passes

### US-021: Hair and Facial Hair System
**Description:** As a developer, I need NPCs to have varied hair styles and facial hair based on gender and individual identity.

**Acceptance Criteria:**
- [x] Catalog all available hair meshes from quaternius: hair_long, hair_parted, hair_buzzed, hair_buns, hair_beard variants
- [x] Deterministic hair selection using character ID hash (same character always gets same hair)
- [x] Female characters: select from long, parted, buns styles
- [x] Male characters: select from buzzed, parted, long styles
- [x] Male characters: 40% chance of beard (deterministic per character), select from beard variants
- [x] Attach hair mesh to head bone/position of base body
- [x] Apply hair color variation (deterministic): black, brown, blonde, red, gray, white
- [x] Typecheck passes

### US-022: NPC Clothing Color Variation
**Description:** As a developer, I need each NPC to have individually varied clothing colors so they're visually distinguishable.

**Acceptance Criteria:**
- [x] Deterministic color selection per character using ID hash
- [x] Apply primary clothing color to body/torso mesh material
- [x] Apply secondary/accent color to trim, sleeves, or accessories
- [x] Color palette: 12+ muted, natural clothing colors (reuse existing NPCAppearanceGenerator palette)
- [x] Role-based tinting still applies on top (guard=red accent, merchant=yellow, etc.)
- [x] Each NPC instance gets its own material clone (not shared) to allow unique colors
- [x] Typecheck passes

### US-023: NPC Body Proportion Variation
**Description:** As a developer, I need NPCs to have slightly varied body proportions so they don't all look like clones.

**Acceptance Criteria:**
- [x] Height variation: 0.85x to 1.15x scale on Y axis, deterministic per character
- [x] Width variation: 0.9x to 1.1x scale on X/Z axes
- [x] Proportions influenced by character traits if available (e.g., athletic occupation = slightly taller)
- [x] Scale applied to root transform node
- [x] Typecheck passes

### US-024: Integrate Modular NPC Assembly into BabylonGame
**Description:** As a developer, I need to replace the current single-mesh NPC loading with the modular assembly system in BabylonGame.ts.

**Acceptance Criteria:**
- [x] `BabylonGame` instantiates `NPCModularAssembler` and pre-loads all body part templates during init
- [x] NPC spawning calls `NPCModularAssembler.assembleNPC(character)` instead of loading a single model
- [x] `NPCAppearanceGenerator` color/scale variations still apply on top of modular assembly
- [x] `NPCModelManifest` updated to work with modular system (fallback to single-mesh if modular parts unavailable)
- [x] Performance: template meshes loaded once, cloned per NPC instance
- [x] At least 4 base body variants x 6+ hair styles x 6+ hair colors x 12+ clothing colors = 1700+ unique combinations
- [x] NPCs in the game world are visually distinguishable by gender, hair, and clothing
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

### US-025: NPC Configuration in Asset Collection Editor
**Description:** As a world creator, I want to configure NPC appearance settings per collection, such as which body/hair/outfit models to use and color palettes.

**Acceptance Criteria:**
- [x] Add "Character Configuration" section to the unified building config UI (or as a sibling section)
- [x] Configure available base body models (select from available quaternius models)
- [x] Configure available hair styles per gender
- [x] Configure clothing color palette
- [x] Configure skin tone palette
- [x] Preview a sample NPC with current settings (shows assembled character with random variation)
- [x] Settings stored in AssetCollection schema
- [x] Typecheck passes
- [x] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: The asset collection schema must support per-building-type configuration with either asset or procedural mode
- FR-2: Category-level shared presets must propagate to all types in the category unless overridden
- FR-3: ProceduralStylePreset must support texture asset references for walls, roofs, floors, doors, windows
- FR-4: ProceduralBuildingGenerator must apply textures from resolved presets with solid-color fallback
- FR-5: Interior configuration must support both glTF model and procedural template modes per building type
- FR-6: At least 15 interior layout templates must be provided covering all major building categories
- FR-7: BuildingInteriorGenerator must consume InteriorTemplateConfig for room generation, textures, furniture, and lighting
- FR-8: Real-time 3D preview must be available for both exterior and interior in the asset collection editor
- FR-9: Business type and residence type must be editable on the Society page via validated API endpoints
- FR-10: Settlement generation must produce diverse business types (no >30% of any single type) and varied residence types
- FR-11: NPC assembly must be modular: base body (gender-correct) + hair + facial hair + clothing colors + proportions
- FR-12: NPC appearance must be deterministic per character ID (same character always looks the same)
- FR-13: NPC system must support 1700+ unique visual combinations minimum
- FR-14: All mesh templates must be cached and cloned for performance (no duplicate asset loads)

## Non-Goals

- No drag-and-drop interior room editor (templates only, not freeform layout)
- No custom 3D model upload (only selection from existing assets)
- No animation configuration for NPCs in this PRD (animations are separate)
- No building destruction or damage states
- No weather-dependent building appearance
- No procedural generation of furniture models (use existing prop assets)
- No multi-story interior navigation (single floor per interior visit)

## Technical Considerations

- **Schema migration**: New fields on AssetCollection must be backward-compatible (all new fields optional with sensible defaults)
- **Performance**: Material and texture caching is critical — ProceduralBuildingGenerator already has `materialCache`, extend it for textures
- **Preview isolation**: Interior preview should use a separate Babylon.js scene (like InteriorSceneManager) to avoid mesh pollution
- **Deterministic hashing**: NPC appearance uses string hash of character ID — must remain consistent across sessions
- **Quaternius model structure**: Models are split into parts (head, body, arms, legs, feet) in separate subdirectories — assembler must handle this hierarchy
- **Backward compatibility**: Existing asset collections with old-style `buildingModels` and `proceduralBuildings` must still work; migration path to new `buildingTypeConfigs` format

## Success Metrics

- Generated settlements contain at least 8 distinct business types (not just shops)
- NPCs are visually distinguishable by gender at a glance
- No two adjacent NPCs look identical
- World creator can configure a full building type (exterior + interior) in under 2 minutes
- 3D preview renders within 2 seconds of configuration change
- Zero regression in existing asset collection functionality

## Open Questions

- Should interior furniture placement be randomized within zones or fixed per template?
- Should NPC outfit selection (peasant vs ranger) be configurable per collection or always inferred from occupation?
- Should the unified building config support a "randomize" option that picks randomly from multiple presets per type for visual variety within the same type?
- How should the system handle BusinessTypes that don't have quaternius-style building parts (e.g., Harbor, Lighthouse) — always asset mode?
