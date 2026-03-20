# Asset Management TODO

This document provides instructions for admins and developers on how to manually add and manage assets in the game's asset collection system.

## Current Asset Status

### Downloaded Placeholder Models
The following placeholder models have been downloaded from the Khronos glTF Sample Models repository:

| File | Size | Description |
|------|------|-------------|
| `client/public/assets/characters/generic/player_default.glb` | 479K | CesiumMan (animated humanoid) |
| `client/public/assets/characters/generic/npc_civilian_male.glb` | 49K | RiggedFigure |
| `client/public/assets/characters/generic/npc_guard.glb` | 15K | RiggedSimple |
| `client/public/assets/models/containers/chest.glb` | 1.6K | Box (simple cube) |
| `client/public/assets/models/props/collectible_gem.glb` | 5.6M | ToyCar (placeholder) |
| `client/public/assets/models/markers/quest_marker.glb` | 9.4M | Lantern |

These are functional placeholders - replace them with better CC0 models as needed.

---

## Recommended CC0 Model Sources

### Character Models
1. **Quaternius** - https://quaternius.com/
   - Ultimate Modular Characters: https://quaternius.com/packs/ultimatemodularcharacters.html
   - Animated Woman: https://quaternius.com/packs/animatedwoman.html
   - Mini People: https://quaternius.com/packs/minipeople.html

2. **Kenney.nl** - https://kenney.nl/assets
   - Animated Characters: https://kenney.nl/assets/animated-characters
   - Character Kit 3D: https://kenney.nl/assets/character-kit-3d

3. **Sketchfab CC0** - https://sketchfab.com/search?features=downloadable&licenses=7c23a1ba438d4306920229c12afcb5f9&type=models

### Quest Object Models
1. **Quaternius Low Poly Ultimate Pack** - https://quaternius.com/packs/lowpolyultimatepack.html
   - Contains chests, keys, scrolls, and various props

2. **Kenney Game Assets** - https://kenney.nl/assets
   - Search for specific items (furniture, props, etc.)

### Audio Assets
- **Freesound** (CC0 filter) - https://freesound.org/search/?q=&f=%20license:%22Creative+Commons+0%22
- **Free Music Archive** - https://freemusicarchive.org/search?adv=1&music-filter-public-domain=1

---

## Directory Structure

```
client/public/assets/
├── characters/
│   ├── generic/           # Generic characters usable across world types
│   │   ├── player_default.glb
│   │   ├── player_male.glb
│   │   ├── player_female.glb
│   │   ├── npc_civilian_male.glb
│   │   ├── npc_civilian_female.glb
│   │   ├── npc_guard.glb
│   │   └── npc_merchant.glb
│   ├── medieval/          # Medieval/fantasy themed characters
│   │   ├── player_knight.glb
│   │   ├── player_mage.glb
│   │   └── npc_barbarian.glb
│   └── scifi/             # Sci-fi themed characters
│       └── player_soldier.glb
├── containers/            # Storage containers (chests, crates, barrels)
│   ├── chest.glb
│   └── treasure_chest.gltf
├── markers/               # Visual quest indicators
│   ├── quest_marker.glb
│   └── lantern_marker.gltf
├── props/                 # Collectible items and props
│   ├── collectible_gem.glb
│   ├── water_bottle.glb
│   ├── avocado_collectible.glb
│   └── brass_lamp.gltf
├── freesound/             # Downloaded audio from Freesound (auto-created)
│   ├── footstep/
│   ├── ambient/
│   ├── combat/
│   ├── interact/
│   └── music/
└── polyhaven/             # Downloaded assets from Polyhaven (auto-created)
    ├── models/
    └── textures/
```

---

## Adding Assets to Asset Collections

### Step 1: Add the Physical Asset File

1. Download a CC0-licensed model (GLB format preferred)
2. Place it in the appropriate directory under `client/public/assets/`
3. Use a descriptive filename (e.g., `medieval_knight.glb`)

### Step 2: Register as a VisualAsset in the Database

Create a VisualAsset document in MongoDB:

```javascript
// Using mongosh or your MongoDB client
db.visualAssets.insertOne({
  name: "Medieval Knight Player",
  description: "A knight character model for medieval worlds",
  assetType: "model_player",  // or model_character, model_quest_item, audio_footstep, etc.
  filePath: "assets/characters/medieval/player_knight.glb",
  fileName: "player_knight.glb",
  fileSize: 512000,  // in bytes
  mimeType: "model/gltf-binary",
  generationProvider: "manual",
  purpose: "procedural",
  usageContext: "3d_game",
  tags: ["player", "knight", "medieval", "rigged"],
  status: "active",
  isActive: true,
  metadata: {
    source: "quaternius",
    license: "CC0",
    originalUrl: "https://quaternius.com/packs/ultimatemodularcharacters.html"
  },
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Step 3: Add to an Asset Collection

Update an existing asset collection to include your new asset:

```javascript
// Find the asset collection for your world type
const collection = db.assetCollections.findOne({ worldType: "medieval-fantasy" });

// Update it to include the new player model
db.assetCollections.updateOne(
  { _id: collection._id },
  {
    $set: {
      "playerModels.default": "<your-visual-asset-id>",
      // Or for other roles:
      // "playerModels.male": "<asset-id>",
      // "playerModels.female": "<asset-id>",
      // "questObjectModels.collectible": "<asset-id>",
      // "audioAssets.footstep": "<asset-id>",
    }
  }
);
```

### Step 4: Verify in Admin Panel

1. Go to the Admin Panel → Asset Collections
2. Select your collection
3. Verify the new models appear in the 3D Config section
4. Test in the 3D game to ensure models load correctly

---

## Asset Types Reference

### Model Types
| Type | Description | Used For |
|------|-------------|----------|
| `model_player` | Player character models | Player avatar in 3D game |
| `model_character` | NPC/character models | NPCs, enemies |
| `model_building` | Building/structure models | Procedural buildings |
| `model_tree` | Tree/vegetation models | Nature generation |
| `model_prop` | Props and decorations | World objects |
| `model_quest_item` | Quest-related objects | Collectibles, markers, containers |
| `model_3d` | Generic 3D model | Misc |

### Audio Types
| Type | Description | Used For |
|------|-------------|----------|
| `audio_footstep` | Footstep sounds | Player walking |
| `audio_ambient` | Ambient/atmosphere | Background sounds |
| `audio_combat` | Combat effects | Weapons, impacts |
| `audio_effect` | General SFX | UI, interactions |
| `audio_music` | Background music | Game soundtrack |

### Texture Types
| Type | Description | Used For |
|------|-------------|----------|
| `texture_ground` | Ground/terrain textures | World terrain |
| `texture_wall` | Wall/building textures | Buildings |
| `texture_material` | General materials | Roads, props |

---

## Asset Collection Schema

Each asset collection contains mappings from semantic roles to asset IDs:

```typescript
{
  id: string,
  name: string,
  description: string,
  collectionType: string,  // "complete_theme", "texture_pack", etc.
  worldType: string,       // "medieval-fantasy", "sci-fi-space", etc.
  
  // Model mappings (role → asset ID)
  buildingModels: {
    default: "asset-id",
    smallResidence: "asset-id",
    largeResidence: "asset-id"
  },
  natureModels: {
    defaultTree: "asset-id"
  },
  characterModels: {
    npcDefault: "asset-id",
    civilian: "asset-id"
  },
  playerModels: {
    default: "asset-id",
    male: "asset-id",
    female: "asset-id"
  },
  questObjectModels: {
    collectible: "asset-id",
    marker: "asset-id",
    container: "asset-id"
  },
  
  // Audio mappings (role → asset ID)
  audioAssets: {
    footstep: "asset-id",
    ambient: "asset-id",
    combat: "asset-id",
    interact: "asset-id",
    music: "asset-id"
  },
  
  // Texture IDs
  groundTextureId: "asset-id",
  roadTextureId: "asset-id"
}
```

---

## Freesound API Integration

To use the Freesound API for audio assets:

### 1. Add credentials to `.env`
```
FREESOUND_CLIENT_ID=your_client_id
FREESOUND_API_KEY=your_api_key
```

### 2. Search for sounds via API
```bash
# Search for CC0 footstep sounds
curl "http://localhost:3000/api/freesound/search?query=footstep%20stone&license=cc0"
```

### 3. Import a sound as a VisualAsset
```bash
curl -X POST "http://localhost:3000/api/freesound/import" \
  -H "Content-Type: application/json" \
  -d '{
    "soundId": 12345,
    "soundName": "Stone Footstep",
    "assetType": "audio_footstep",
    "previewUrl": "https://freesound.org/data/previews/...",
    "tags": ["footstep", "stone", "walking"]
  }'
```

### 4. Auto-select audio for a world type
```bash
curl -X POST "http://localhost:3000/api/freesound/auto-select" \
  -H "Content-Type: application/json" \
  -d '{
    "audioRole": "footstep",
    "worldType": "medieval-fantasy"
  }'
```

---

## Automated Model Download Script

To run the automated download script:

```bash
# Downloads placeholder models from Khronos glTF samples
bash server/scripts/download-models.sh

# Or use the TypeScript version for more detailed output
npx tsx server/scripts/download-character-models.ts
```

Note: Quaternius and Kenney require manual browser downloads due to their website setup.

---

## TODO Checklist

- [ ] Replace placeholder `player_default.glb` with a proper animated character
- [ ] Add male/female player character variants
- [ ] Add medieval-themed player models (knight, mage, rogue)
- [ ] Add sci-fi themed player models
- [ ] Replace placeholder quest objects with proper models
- [ ] Download and configure footstep sounds for different surfaces
- [ ] Download and configure ambient sounds for different world types
- [ ] Add background music tracks
- [ ] Create world-type-specific asset collections via Admin Panel
