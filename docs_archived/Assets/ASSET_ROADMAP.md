# Insimul Asset Management Roadmap

> **Comprehensive analysis of asset management status for procedural world generation and Babylon.js gameplay**
> 
> Last Updated: February 2026

---

## Executive Summary

Insimul's asset management system enables procedural generation of enormous amounts of world content, allowing users to quickly play through a Babylon.js game incorporating that content. Each world type is associated with specific asset types defined in `data/asset-categories-by-world-type.json`. Users select a starting world type which provides a base asset pack, and can add custom assets on top.

### Key Statistics
- **10 World Types Defined**: medieval-fantasy, sci-fi-space, historical, high-fantasy, low-fantasy, dark-fantasy, historical-medieval, mythological, cyberpunk (+generic fallback)
- **14 Asset Category Types**: buildings (public, business, residence), nature (tree, shrub, plant), props (furniture, storage, weapon, decoration), characters (NPC/player male/female)
- **Physical Assets Present**: 6 placeholder character models, 3 quest objects, 2 polyhaven models
- **GenAI Providers Supported**: DALL-E, Stable Diffusion, Flux, Gemini Imagen (prompt enhancement only)

---

## Table of Contents

1. [Core Infrastructure](#1-core-infrastructure)
2. [Asset Collections & World Association](#2-asset-collections--world-association)
3. [Physical Asset Inventory by World Type](#3-physical-asset-inventory-by-world-type)
4. [Babylon.js Asset Loading](#4-babylonjs-asset-loading)
5. [GenAI Image & Texture Generation](#5-genai-image--texture-generation)
6. [Audio Asset Management](#6-audio-asset-management)
7. [User Asset Addition Flow](#7-user-asset-addition-flow)
8. [Admin Tools & UI](#8-admin-tools--ui)
9. [API Integrations](#9-api-integrations)
10. [Priority Action Items](#10-priority-action-items)

---

## 1. Core Infrastructure

### Database Schema & Storage
- [x] `VisualAsset` table with comprehensive fields (name, description, assetType, filePath, dimensions, generation metadata)
- [x] `AssetCollection` table for grouping assets by world type and theme
- [x] `GenerationJob` table for tracking AI generation tasks
- [x] MongoDB storage implementation (`server/db/mongo-storage.ts`)
- [x] PostgreSQL schema definitions (`shared/schema.ts`)

### Asset Types Defined
- [x] Character portraits (`character_portrait`, `character_full_body`, `character_sprite`)
- [x] Building assets (`building_exterior`, `building_interior`, `building_icon`)
- [x] Map assets (`map_terrain`, `map_political`, `map_region`)
- [x] Texture types (`texture_ground`, `texture_wall`, `texture_material`)
- [x] Model types (`model_player`, `model_character`, `model_building`, `model_tree`, `model_prop`, `model_quest_item`, `model_3d`)
- [x] Audio types (`audio_footstep`, `audio_ambient`, `audio_combat`, `audio_effect`, `audio_music`)

### File Storage Structure
```
client/public/assets/
├── characters/
│   ├── generic/         ✅ 5 models (player_default, npc_civilian_male, npc_guard, brainstem, fox)
│   ├── medieval/        ❌ Empty - needs population
│   └── scifi/           ❌ Empty - needs population
├── containers/          ✅ 2 models (chest, treasure_chest)
├── markers/             ✅ 2 models (quest_marker, lantern_marker)
├── props/               ✅ 4 models (collectible_gem, water_bottle, avocado_collectible, brass_lamp)
├── polyhaven/
│   ├── models/          ✅ 15+ models (fir_tree, pine_tree, barrels, etc. from base collections)
│   └── textures/        ✅ 8+ textures (forest_floor, cobblestone, asphalt, metal_plate, etc.)
├── freesound/           ✅ 11 audio files for 4 world types
│   ├── footstep/        ✅ 3 files (stone, metallic, concrete)
│   ├── ambient/         ✅ 4 files (village, spaceship, city, wind)
│   ├── combat/          ❌ Not yet populated
│   ├── interact/        ✅ 4 files (door creak, button, etc.)
│   └── music/           ❌ Not yet populated
├── generated/
│   └── textures/        ✅ AI texture generation endpoint available
└── audio/               ❌ Empty (using freesound/ instead)
```

---

## 2. Asset Collections & World Association

### Collection System
- [x] `AssetCollection` schema with world type association
- [x] `AssetCollectionLoader` service for client-side loading (`client/src/services/AssetCollectionLoader.ts`)
- [x] `AssetCollectionResolver` for resolving world 3D configs (`server/services/asset-collection-resolver.ts`)
- [x] Default collection auto-assignment service (`server/services/default-asset-collection.ts`)
- [x] World-to-collection mapping logic with fallbacks

### Base Collections Configuration
- [x] `data/base-asset-collections.json` defines base collections for 8 world types
- [x] Migration script for seeding base collections (`server/scripts/002-seed-base-collections.ts`)
- [x] **Base collections seeded in database** ✅ (Feb 2026)
- [x] Historical world type base collection defined ✅
- [x] High-fantasy, low-fantasy, dark-fantasy base collections defined ✅
- [ ] Mythological world type base collection not defined
- [ ] Historical-medieval world type base collection not defined

### World Types Coverage

| World Type | Base Collection Defined | Assets Populated | Textures | Audio |
|------------|------------------------|------------------|----------|-------|
| `medieval-fantasy` | ✅ | ✅ Polyhaven downloaded | ✅ Defined | ✅ Downloaded |
| `cyberpunk` | ✅ | ✅ Polyhaven downloaded | ✅ Defined | ✅ Downloaded |
| `sci-fi-space` | ✅ | ✅ Polyhaven downloaded | ✅ Defined | ✅ Downloaded |
| `generic` | ✅ | ✅ Polyhaven downloaded | ✅ Defined | ✅ Downloaded |
| `historical` | ✅ | ✅ Polyhaven downloaded | ✅ Defined | ⚠️ Queries defined |
| `high-fantasy` | ✅ | ✅ Polyhaven downloaded | ✅ Defined | ❌ |
| `low-fantasy` | ✅ | ✅ Polyhaven downloaded | ✅ Defined | ❌ |
| `dark-fantasy` | ✅ | ✅ Polyhaven downloaded | ✅ Defined | ❌ |
| `historical-medieval` | ❌ | ❌ | ❌ | ❌ |
| `mythological` | ❌ | ❌ | ❌ | ❌ |

---

## 3. Physical Asset Inventory by World Type

### Current Physical Assets (Downloaded)

#### Generic Characters (`client/public/assets/characters/generic/`)
- [x] `player_default.glb` (479KB) - CesiumMan animated humanoid ✅ Functional
- [x] `player_male.glb` (479KB) - CesiumMan ✅ Downloaded (Feb 2026)
- [x] `player_female.glb` (49KB) - RiggedFigure placeholder ✅ Downloaded (Feb 2026)
- [x] `npc_civilian_male.glb` (49KB) - RiggedFigure ✅ Functional
- [x] `npc_civilian_female.glb` (49KB) - RiggedFigure ✅ Downloaded (Feb 2026)
- [x] `npc_guard.glb` (15KB) - RiggedSimple ✅ Functional
- [x] `npc_merchant.glb` (15KB) - RiggedSimple ✅ Downloaded (Feb 2026)
- [x] `brainstem.glb` (3.1MB) - Animated humanoid ✅ Downloaded
- [x] `fox.glb` (159KB) - Animated animal character ✅ Downloaded

#### Medieval Characters (`client/public/assets/characters/medieval/`)
- [ ] `player_knight.glb` - Directory empty
- [ ] `player_mage.glb` - Directory empty
- [ ] `npc_barbarian.glb` - Directory empty

#### Sci-Fi Characters (`client/public/assets/characters/scifi/`)
- [ ] `player_soldier.glb` - Directory empty

#### Containers (`client/public/assets/models/containers/`)
- [x] `chest.glb` (1.6KB) - Box placeholder ⚠️ Should replace
- [x] `treasure_chest.gltf` (8.4KB) - Treasure chest model

#### Markers (`client/public/assets/models/markers/`)
- [x] `quest_marker.glb` (9.4MB) - Lantern ⚠️ Oversized for marker
- [x] `lantern_marker.gltf` (4.8KB) - Lantern marker

#### Props (`client/public/assets/models/props/`)
- [x] `collectible_gem.glb` (5.6MB) - ToyCar placeholder ⚠️ Should replace
- [x] `water_bottle.glb` (8.6MB) - Water bottle
- [x] `avocado_collectible.glb` (7.7MB) - Avocado collectible
- [x] `brass_lamp.gltf` (10KB) - Brass lamp

#### Polyhaven Models (`client/public/assets/polyhaven/models/`)
- [x] `potted_plant_02.gltf` (6.6KB) ✅ Functional
- [x] `wooden_crate_02.gltf` (4.1KB) ✅ Functional

### Missing Critical Assets by Category

#### Player Models (HIGH PRIORITY)
- [ ] Proper animated player character with idle/walk/run animations
- [ ] Male/female player variants
- [ ] Medieval-themed player variants (knight, mage, rogue)
- [ ] Sci-fi themed player variants (soldier, pilot, hacker)

#### NPC Models (MEDIUM PRIORITY)
- [ ] Female civilian NPC
- [ ] Merchant NPC with appropriate attire
- [ ] World-type specific NPCs (knights, aliens, etc.)

#### Building Models (MEDIUM PRIORITY)
- [ ] Small residence (cottage, hut)
- [ ] Large residence (manor, mansion)
- [ ] Business/shop building
- [ ] Public building (tavern, temple)

#### Nature Models (LOW PRIORITY - procedural fallback exists)
- [ ] Various tree types (oak, pine, birch)
- [ ] Rocks and boulders
- [ ] Shrubs and bushes
- [ ] Grass clusters

#### Quest Objects (HIGH PRIORITY)
- [ ] Proper treasure chest model
- [ ] Collectible gem/orb model
- [ ] Quest marker beacon/pillar
- [ ] Key model
- [ ] Scroll/book model

---

## 4. Babylon.js Asset Loading

### Core Loading System
- [x] `BabylonGame.ts` loads world assets via `/api/worlds/:worldId/assets`
- [x] `BabylonGame.ts` loads 3D config via `/api/worlds/:worldId/3d-config`
- [x] `applyWorld3DConfig()` resolves asset IDs to loaded meshes
- [x] `SceneLoader.ImportMeshAsync()` for GLB/GLTF model loading
- [x] Support for both local paths and external URLs (with warnings)

### Texture Management
- [x] `TextureManager.ts` handles texture loading and caching
- [x] Ground texture application with tiling (`applyGroundTexture`)
- [x] Road texture application (`applyRoadTexture`)
- [x] Bump map generation from diffuse textures
- [x] Texture caching by asset ID
- [ ] **No physical textures downloaded yet** - uses procedural colors as fallback

### Where Textures Are Used in Babylon.js
1. **Ground/Terrain** (`TextureManager.applyGroundTexture`)
   - Applied to main ground mesh with tiling (uScale/vScale: 8)
   - Bump mapping for depth effect
   
2. **Roads** (`TextureManager.applyRoadTexture`)
   - Applied to settlement road meshes (uScale/vScale: 4)
   
3. **Buildings** (Procedural)
   - Currently uses procedural materials based on world style
   - **Not yet using texture assets**
   
4. **Characters** (Model-embedded)
   - Textures embedded in GLB models
   - **No runtime texture swapping implemented**

### Model Loading Categories
- [x] Building models via `buildingGenerator.registerRoleModel()`
- [x] Nature models via `natureGenerator.registerTreeOverride()`, `registerRockOverride()`, etc.
- [x] Quest object models via `questObjectManager.registerQuestModelTemplate()`
- [x] Object/prop models via `objectModelTemplates` Map
- [x] **Player models** - Configurable via collection's playerModels ✅ (Feb 2026)
- [x] **NPC models** - Configurable via collection's characterModels ✅ (Feb 2026)

### Fallback Behavior
- [x] Procedural buildings when no model template available
- [x] Procedural trees/nature when no override registered
- [x] Procedural quest items (spheres) when no template
- [x] Default material colors when no textures

---

## 5. GenAI Image & Texture Generation

### Image Generation Infrastructure
- [x] `ImageGenerationManager` class (`server/services/image-generation.ts`)
- [x] Provider abstraction pattern for multiple AI services
- [x] Image saving to disk with proper paths

### Provider Status

| Provider | Implemented | API Available | Status |
|----------|-------------|---------------|--------|
| DALL-E (OpenAI) | ✅ | Requires `OPENAI_API_KEY` | ✅ Full support |
| Stable Diffusion | ✅ | Requires `REPLICATE_API_KEY` | ✅ Full support |
| Flux | ✅ | Requires `REPLICATE_API_KEY` | ✅ Full support |
| Gemini Imagen | ✅ | Not yet available via API | ⚠️ Prompt enhancement only |

### Visual Asset Generator Service
- [x] `VisualAssetGenerator` class (`server/services/visual-asset-generator.ts`)
- [x] Character portrait generation with personality-based prompts
- [x] Building exterior generation with architectural context
- [x] Style preset support for consistent aesthetics
- [x] Generation job tracking with progress updates

### Supported Generation Types
- [x] Character portraits (`generateCharacterPortrait`)
- [x] Character portrait variants (`generateCharacterVariants`)
- [x] Building exteriors (`generateBuildingExterior`)
- [x] **Texture generation** - Full endpoint with world-style presets ✅ (Feb 2026)
  - [x] Ground textures (`/api/textures/generate`)
  - [x] Wall textures
  - [x] Material textures
  - [x] Ceiling, road, nature textures
  - [x] World-style specific presets (8 styles, 40+ presets)
  - [x] Seamless/weathered/damaged options
- [x] **World maps** - Full integration ✅ (Feb 2026)
  - [x] `generateWorldMapPrompt()` for world-level maps
  - [x] `generateWorldMap()` method in VisualAssetGenerator
  - [x] `POST /api/worlds/:worldId/generate-world-map` endpoint
  - [x] UI in BatchGenerationDialog with fantasy/realistic/stylized styles
- [ ] **Character skins/textures** - Not implemented

### Client-Side Generation UI
- [x] `VisualAssetGeneratorDialog.tsx` for triggering generation
- [x] Provider selection dropdown
- [x] Quality level selection (standard/high/ultra)
- [x] Asset type selection (portrait, building, textures)
- [x] **Audio preview in AssetBrowserDialog** ✅ (Feb 2026)
  - Play/pause controls for audio assets
  - Visual indicator for audio files (purple gradient)
  - Support for mp3, wav, ogg, m4a formats
- [ ] **Texture-specific generation options** - Basic only

### API Endpoints
- [x] `GET /api/assets/providers` - List available providers
- [x] `POST /api/assets/generate` - Generate visual assets
- [x] `GET /api/worlds/:worldId/assets` - Get world assets
- [x] `POST /api/visual-assets` - Create asset record
- [x] `GET /api/textures/presets` - Get texture presets by world style ✅
- [x] `POST /api/textures/generate` - Generate AI texture with options ✅
- [x] `POST /api/textures/generate-set` - Batch generate from presets ✅

---

## 6. Audio Asset Management

### Freesound API Integration
- [x] `FreesoundAPI` service (`server/services/freesound-api.ts`)
- [x] CC0 license filtering for legal compliance
- [x] Search by query with duration filters
- [x] Auto-select based on audio role and world type
- [x] Multiple query support for variety

### Audio Categories Definition
- [x] `data/audio-categories-by-world-type.json` defines search queries per world type
- [x] 5 audio roles: footstep, ambient, combat, interact, music
- [x] 5 world types with audio definitions (medieval-fantasy, sci-fi-space, cyberpunk, historical, generic)

### Babylon.js Audio System
- [x] `AudioManager.ts` handles audio loading and playback
- [x] Sound loading from asset collection config
- [x] Volume control per audio role
- [x] Loop support for ambient and music
- [x] Mute/unmute functionality

### Audio Asset Status
- [x] **11 audio files downloaded** ✅ (Feb 2026)
  - footstep: stone, metallic, concrete
  - ambient: village, spaceship, city, wind
  - interact: door creak, buttons, etc.
- [x] Freesound import endpoint tested and working
- [x] Auto-select endpoint working
- [ ] Audio preview in UI not implemented
- [ ] Combat and music audio not yet downloaded

### API Endpoints
- [x] `GET /api/freesound/search` - Search Freesound
- [x] `POST /api/freesound/import` - Import sound as asset
- [x] `POST /api/freesound/auto-select` - Auto-select for world type

---

## 7. User Asset Addition Flow

### Manual Asset Addition
- [x] Download CC0 asset from external source
- [x] Place in appropriate `client/public/assets/` directory
- [x] Create `VisualAsset` record in database
- [x] Add to `AssetCollection` if applicable
- [x] Asset appears in collection's 3D config

### Admin Panel Asset Management
- [x] `AssetCollectionManager.tsx` - Create/edit/delete collections
- [x] `AssetBrowserDialog.tsx` - Browse existing assets
- [x] `VisualAssetGeneratorDialog.tsx` - Generate new assets with AI
- [x] `PolyhavenBrowserDialog.tsx` - Browse and import Polyhaven assets
- [x] 3D config editor for model role assignments

### Asset Addition Workflows

#### Via Admin Panel (Recommended)
1. [x] Navigate to Admin → Asset Collections
2. [x] Select or create a collection
3. [x] Use "Browse Polyhaven" to find CC0 models
4. [x] Use "Generate Asset" for AI-generated textures/images
5. [x] Assign assets to semantic roles in 3D Config
6. [ ] **Bulk import not yet implemented**

#### Via API (Developer)
1. [x] POST `/api/visual-assets` with asset metadata
2. [x] PATCH `/api/asset-collections/:id` to add to collection
3. [x] Asset auto-resolves in game via collection

#### Via Freesound (Audio)
1. [x] GET `/api/freesound/search?query=...`
2. [x] POST `/api/freesound/import` with sound details
3. [x] Assign to collection's audioAssets config

### User-Generated World Assets
- [x] Each world has a `selectedAssetCollectionId`
- [x] Worlds auto-assigned default collection if none selected
- [x] Users can select different collections via World Details
- [ ] **Users cannot yet create their own collections** (admin only)
- [ ] **Asset upload by regular users not implemented**

---

## 8. Admin Tools & UI

### Asset Collection Manager
- [x] List all asset collections with metadata
- [x] Create new collections with world type selection
- [x] Edit collection name, description, tags
- [x] Copy from base collection option
- [x] Delete collections with confirmation
- [x] View assets in collection

### 3D Configuration Editor
- [x] Ground texture selection
- [x] Road texture selection
- [x] Building model role assignments (default, smallResidence, business)
- [x] Nature model role assignments (defaultTree, rock, shrub, bush)
- [x] Character model role assignments
- [x] Object model role assignments
- [ ] Quest object model role assignments in UI (backend supports)
- [ ] Audio asset role assignments in UI (backend supports)
- [ ] Player model role assignments in UI (backend supports)

### Asset Browser
- [x] Browse assets by collection
- [x] Filter by asset type
- [x] Preview asset thumbnails (images)
- [x] Preview 3D models in browser
- [ ] Preview audio with playback controls

### Polyhaven Integration UI
- [x] Search Polyhaven models by category
- [x] Import models to local storage
- [x] Create VisualAsset records automatically
- [ ] Search Polyhaven textures
- [x] Bulk import multiple assets (JSON/CSV via BulkAssetImportDialog)

---

## 9. API Integrations

### Polyhaven API
- [x] Query assets by type and categories
- [x] Get file URLs for download
- [x] Auto-select based on world type
- [x] Asset downloading with local storage (`server/services/asset-downloader.ts`)
- [x] GLTF/GLB format support

### Freesound API
- [x] OAuth-free search with API key
- [x] CC0 license filtering
- [x] Preview URL extraction
- [x] Duration-based filtering
- [x] Credentials configured (see environment variables)
- [ ] Full sound download (only previews currently)

### OpenAI/Replicate APIs
- [x] DALL-E 2 and DALL-E 3 support
- [x] Stable Diffusion XL via Replicate
- [x] Flux models via Replicate
- [x] Image download and local storage
- [x] Generation metadata tracking

---

## 10. Priority Action Items

### 🔴 Critical (Blocking Gameplay)

1. ~~**Download proper player character model**~~ ✅ DONE (Feb 2026)
   - Downloaded brainstem.glb and fox.glb character models
   - Configured in bundled-character-models.json

2. ~~**Replace placeholder quest objects**~~ ✅ DONE (Feb 2026)
   - Downloaded treasure_chest.glb, lantern_marker.glb, brass_lamp.glb, water_bottle.glb, avocado.glb
   - Configured quest object roles in base collections

3. ~~**Run base collection migration**~~ ✅ DONE (Feb 2026)
   - Seeded 8 world type base collections
   - All Polyhaven assets downloaded

### 🟡 High Priority (Essential for Release)

4. ~~**Download ground textures for each world type**~~ ✅ DONE
   - Downloaded via Polyhaven in base collections
   - AI texture generation also available

5. ~~**Download footstep sounds**~~ ✅ DONE (Feb 2026)
   - Downloaded 11 audio files from Freesound
   - Stone, metallic, concrete footsteps available

6. ~~**Complete medieval-fantasy asset pack**~~ ✅ DONE (Feb 2026)
   - Trees: fir_tree_01, pine_tree_01, jacaranda_tree, tree_small_02, dead_tree_trunk ✅
   - Rocks: rock_moss_set_01, rock_moss_set_02, rock_07 ✅
   - Shrubs: shrub_01, shrub_02, shrub_03, moss_01, fern_02 ✅
   - Props: wine_barrel_01, wooden_crate_02, wooden_bucket_01, wooden_lantern_01 ✅

7. ~~**Add player model selection to 3D config UI**~~ ✅ DONE (Feb 2026)
   - Full UI for player models (default, male, female, knight, mage, rogue)
   - NPC model selection (civilian_male/female, guard, merchant, noble)
   - Quest object model selection (collectible, marker, container, key, scroll)
   - Nature model selection (trees, rocks, shrubs)

### 🟢 Medium Priority (Enhanced Experience)

8. ~~**Define base collections for missing world types**~~ ✅ DONE (Feb 2026)
   - historical ✅
   - high-fantasy, low-fantasy, dark-fantasy ✅
   - historical-medieval, mythological ❌ still needed

9. ~~**Enable user collection creation**~~ ✅ DONE (Feb 2026)
   - Users can create custom collections from WorldDetailsDialog
   - Collection types: texture_pack, character_set, building_set, prop_set, complete_theme
   - Collections are private by default and linked to specific worlds

10. ~~**Implement texture generation endpoint**~~ ✅ DONE (Feb 2026)
   - `/api/textures/generate` - full texture generation
   - `/api/textures/presets` - world-style presets
   - `/api/textures/generate-set` - batch generation
   - 8 world styles, 40+ presets, seamless/weathered options

11. ~~**Add audio preview in admin panel**~~ ✅ DONE (Feb 2026)
   - Play/pause controls for audio assets in AssetBrowserDialog
   - Visual indicator for audio files (purple gradient)
   - Support for mp3, wav, ogg, m4a formats

### 🔵 Low Priority (Nice to Have)

12. ~~**3D model preview in asset browser**~~ ✅ DONE (Feb 2026)
   - Created `ModelPreview.tsx` component using Babylon.js
   - Auto-rotation, zoom controls, reset view
   - Integrated in AssetBrowserDialog for .glb/.gltf files

13. ~~**Bulk asset import**~~ ✅ DONE (Feb 2026)
   - Created `BulkAssetImportDialog.tsx` component
   - JSON and CSV format support
   - Validation, sample templates, file upload

14. ~~**Historical-medieval & mythological collections**~~ ✅ DONE (Feb 2026)
   - Added historical-medieval collection with period-accurate assets
   - Added mythological collection with Greek/Norse themed assets
   - Both include buildings, nature, objects, textures, and config3D

15. ~~**World map generation integration**~~ ✅ DONE (Feb 2026)
   - Added `generateWorldMap` checkbox in WorldCreateDialog
   - Auto-triggers map generation on world creation via WorldSelectionScreen
   - Uses existing `/api/worlds/:worldId/generate-world-map` endpoint
   - Map stored as visual asset with fantasy cartography style

16. ~~**Character skin/texture generation**~~ ✅ DONE (Feb 2026)
   - Added `generateCharacterTexturePrompt()` for face/body/clothing/full textures
   - Implemented `generateCharacterTexture()` and `batchGenerateCharacterTextures()` methods
   - API endpoints: `POST /api/characters/:id/generate-texture` and `/generate-textures`
   - UI: Texture generation button and Textures tab in CharacterDetailView
   - Supports art styles: realistic, stylized, anime, painterly

---

## Appendix A: Recommended CC0 Asset Sources

### Character Models
- **Quaternius**: https://quaternius.com/ (Ultimate Modular Characters, Animated Woman)
- **Kenney.nl**: https://kenney.nl/assets (Animated Characters, Character Kit 3D)
- **Sketchfab CC0**: https://sketchfab.com/search?licenses=7c23a1ba438d4306920229c12afcb5f9

### Environment Models
- **Quaternius Low Poly Ultimate Pack**: https://quaternius.com/packs/lowpolyultimatepack.html
- **Kenney Game Assets**: https://kenney.nl/assets
- **Polyhaven Models**: https://polyhaven.com/models

### Textures
- **Polyhaven Textures**: https://polyhaven.com/textures
- **AmbientCG**: https://ambientcg.com/
- **cgbookcase**: https://cgbookcase.com/

### Audio
- **Freesound (CC0)**: https://freesound.org/search/?f=license:"Creative+Commons+0"
- **Free Music Archive**: https://freemusicarchive.org/search?adv=1&music-filter-public-domain=1

---

## Appendix B: Quick Reference Commands

### Download Models Script
```bash
bash server/scripts/download-models.sh
```

### Seed Base Collections
```bash
cd server && npx tsx migrations/002-seed-base-collections.ts
```

### Search Freesound
```bash
curl "http://localhost:3000/api/freesound/search?query=footstep%20stone&license=cc0"
```

### Check Available Providers
```bash
curl "http://localhost:3000/api/assets/providers"
```

### Generate Asset
```bash
curl -X POST "http://localhost:3000/api/assets/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt": "medieval grass texture, tileable", "provider": "flux", "assetType": "texture_ground"}'
```

---

## Appendix C: Environment Variables Required

```env
# GenAI Providers
OPENAI_API_KEY=sk-...          # For DALL-E
REPLICATE_API_KEY=r8_...       # For Stable Diffusion, Flux
GEMINI_API_KEY=...             # For Gemini (prompt enhancement)

# Audio Assets
FREESOUND_CLIENT_ID=...
FREESOUND_API_KEY=...

# Database
MONGO_URL=mongodb://...
DATABASE_URL=postgresql://...
```

---

*This roadmap was generated by analyzing the Insimul codebase including asset configuration files, Babylon.js game code, server services, and client components.*
