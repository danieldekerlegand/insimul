# 3D Model Sourcing Plan for Unmapped Object Roles

**Date**: 2026-03-21
**Scope**: ~79 objectRole values that need proper 3D models
**Goal**: Map every role to a free, game-ready 3D model

---

## Current State

Migration 023 assigned "best available" Polyhaven stand-ins for 17 roles, but most
are poor fits (e.g., `grenade → moon_rock_01`, `pistol → vintage_pocket_watch`).
Migration 027 created proper mappings for ~25 roles using downloaded Polyhaven assets.

The roles below still need purpose-built models from free sources.

---

## Source Overview

| Source | License | Format | Style | Best For |
|---|---|---|---|---|
| **Quaternius** | CC0 | FBX/OBJ (convert to glTF) | Low-poly stylized | Weapons, RPG items, tools, food |
| **KayKit** | CC0 (free tiers) | FBX/OBJ/glTF | Low-poly stylized | Dungeon props, medieval items, adventurer gear |
| **Polyhaven** | CC0 | glTF | Photorealistic | Realistic props, furniture, containers |
| **Sketchfab** | Varies (filter CC0/CC-BY) | glTF/FBX | Mixed | Niche items not in other packs |

---

## Recommended Source: Quaternius

Quaternius packs are the single best source for RPG/adventure items. All CC0, all
low-poly and game-ready. The key packs:

- **Ultimate RPG Pack** — potions, scrolls, keys, food, gems, coins, rings, amulets, books
- **Ultimate Weapon Pack** — swords, daggers, axes, maces, bows, staffs, shields, spears, hammers
- **Ultimate Food Pack** — bread loaves, bowls, plates, cheese wedges, barrels, bottles, jars
- **Ultimate Modular Dungeon Pack** — torches, candles, chests, barrels, chains
- **Ultimate Nature Pack** — rocks, wood logs, herbs, mushrooms
- **Ultimate Animated Character Pack** — has some held-item props

### Quaternius Assignments (44 roles)

| Role | Quaternius Pack | Model Name / Notes |
|---|---|---|
| `sword` | Ultimate Weapon Pack | Sword (multiple variants) |
| `dagger` | Ultimate Weapon Pack | Dagger |
| `bow` | Ultimate Weapon Pack | Bow |
| `shield` | Ultimate Weapon Pack | Shield (multiple variants) |
| `spear` | Ultimate Weapon Pack | Spear |
| `staff` | Ultimate Weapon Pack | Staff |
| `mace` | Ultimate Weapon Pack | Mace |
| `hammer` | Ultimate Weapon Pack | Hammer / War Hammer |
| `pickaxe` | Ultimate Weapon Pack | Pickaxe |
| `knife` | Ultimate Weapon Pack | Dagger (smaller variant) |
| `helmet` | Ultimate Weapon Pack | Helmet |
| `armor_piece` | Ultimate Weapon Pack | Armor piece / chestplate |
| `chainmail` | Ultimate Weapon Pack | Chainmail / armor variant |
| `boots` | Ultimate Weapon Pack | Boots (if available) or generic armor piece |
| `quiver` | Ultimate Weapon Pack | Quiver |
| `potion` | Ultimate RPG Pack | Potion bottle (multiple colors) |
| `scroll` | Ultimate RPG Pack | Scroll |
| `key` | Ultimate RPG Pack | Key |
| `ring` | Ultimate RPG Pack | Ring |
| `amulet` | Ultimate RPG Pack | Amulet / necklace |
| `crown` | Ultimate RPG Pack | Crown |
| `gemstone` | Ultimate RPG Pack | Gem / crystal |
| `herb` | Ultimate RPG Pack / Nature | Herb plant |
| `food_loaf` | Ultimate Food Pack | Bread loaf |
| `food_plate` | Ultimate Food Pack | Plate with food |
| `food_bowl` | Ultimate Food Pack | Bowl with contents |
| `food_wedge` | Ultimate Food Pack | Cheese wedge |
| `food_small` | Ultimate Food Pack | Small food item (apple/egg) |
| `bottle` | Ultimate Food Pack | Bottle |
| `jar` | Ultimate Food Pack | Jar |
| `pot` | Ultimate Food Pack | Cooking pot |
| `pan` | Ultimate Food Pack | Frying pan |
| `candle` | Ultimate Modular Dungeon | Candle / candlestick |
| `torch` | Ultimate Modular Dungeon | Wall torch / hand torch |
| `stone` | Ultimate Nature Pack | Stone / rock chunk |
| `wood` | Ultimate Nature Pack | Wood log / plank |
| `ingot` | Ultimate RPG Pack | Metal ingot bar |
| `ore_chunk` | Ultimate Nature Pack | Rock chunk (recolor for ore) |
| `rope` | Ultimate RPG Pack | Coiled rope |
| `sack` | Ultimate RPG Pack | Sack / bag |
| `pouch` | Ultimate RPG Pack | Small pouch / coin purse |
| `mortar` | Ultimate RPG Pack | Mortar and pestle |
| `shovel` | Ultimate RPG Pack | Shovel |
| `saw` | Ultimate Weapon Pack | Saw (or repurpose axe variant) |

---

## Recommended Source: KayKit

KayKit's free packs complement Quaternius well for dungeon/adventure props. Key packs:

- **Dungeon Pack** (free) — torches, barrels, crates, chests, candles, skulls, keys
- **Adventurers Pack** (free) — weapons, shields, potions, scrolls, coins
- **Medieval Builder Pack** (free) — furniture, tools, building props

### KayKit Assignments (8 roles)

| Role | KayKit Pack | Model Name / Notes |
|---|---|---|
| `wanted_poster` | Dungeon Pack | Wall sign / notice board prop |
| `bell` | Medieval Builder | Bell prop |
| `inkwell` | Medieval Builder | Small desk prop |
| `spool` | Medieval Builder | Spool / thread roll |
| `small_tool` | Adventurers Pack | Small tool / wrench |
| `small_prop` | Adventurers Pack | Generic small adventurer prop |
| `plank` | Medieval Builder | Wooden plank |
| `small_block` | Medieval Builder | Small block / brick |

---

## Recommended Source: Polyhaven (Additional Downloads)

Polyhaven is already used in the project. These roles map to known Polyhaven models
that have not yet been downloaded. All CC0, glTF format, photorealistic.

### Polyhaven Assignments (11 roles)

| Role | Polyhaven Model ID | Notes |
|---|---|---|
| `vase` | Already have: `brass_vase_01`, `ceramic_vase_01`, `antique_ceramic_vase_01` | Use existing! Map to `brass_vase_01` |
| `commode` | Already have: `GothicCommode_01` | Use existing! Map to `GothicCommode_01` |
| `console` | Already have: `ClassicConsole_01` | Use existing! Map to `ClassicConsole_01` |
| `drawer` | Already have: `ClassicNightstand_01` | Use existing nightstand as drawer |
| `register` | Already have: `CashRegister_01` | Already mapped |
| `blowtorch` | `blowtorch_01` (if available) | Download new, or use `crowbar_01` as stand-in |
| `data_pad` | N/A | Not on Polyhaven; use Sketchfab |
| `energy_core` | N/A | Not on Polyhaven; use procedural |
| `pistol` | N/A | Not on Polyhaven; use Quaternius |
| `revolver` | N/A | Not on Polyhaven; use Quaternius/Sketchfab |
| `rifle` | N/A | Not on Polyhaven; use Quaternius/Sketchfab |

---

## Recommended Source: Sketchfab (Free Downloads)

For items not available in any pack. Filter: downloadable, free, CC0 or CC-BY 4.0,
low-poly / game-ready. Always verify license before download.

### Sketchfab Assignments (12 roles)

| Role | Search Term | Notes |
|---|---|---|
| `pistol` | "low poly pistol" | Many CC0 options. Pick stylized to match Quaternius aesthetic |
| `revolver` | "low poly revolver" | Western-style six-shooter |
| `rifle` | "low poly rifle" | Musket or hunting rifle style |
| `grenade` | "low poly grenade" | Pineapple grenade or sci-fi variant |
| `dynamite` | "low poly dynamite" | TNT stick bundle |
| `syringe` | "low poly syringe" | Medical syringe |
| `data_pad` | "low poly tablet sci-fi" | Sci-fi data tablet |
| `energy_core` | "low poly energy crystal" or "power core" | Glowing core prop |
| `battery` | "low poly battery" | Simple battery cell |
| `med_pack` | "low poly medkit" | First aid kit / medical box |
| `saddle` | "low poly saddle" | Horse saddle |
| `blowtorch` | "low poly blowtorch" or "welding torch" | Handheld torch tool |

---

## Roles That Can Share Models (Aliasing)

Several roles represent visually similar objects. Rather than sourcing unique models
for each, share a single model across multiple roles:

| Shared Model | Roles That Use It | Source |
|---|---|---|
| **Generic bottle** | `bottle`, `drink_can` | Quaternius Food Pack |
| **Small food item** | `food_small`, `food_bar` | Quaternius Food Pack |
| **Plate with food** | `food_plate` | Quaternius Food Pack |
| **Sack/bag** | `sack`, `pouch` (scale down for pouch) | Quaternius RPG Pack |
| **Scroll/paper** | `scroll`, `wanted_poster` (with texture swap) | Quaternius RPG Pack |
| **Metal bar** | `ingot`, `small_block` | Quaternius RPG Pack |
| **Rock chunk** | `ore_chunk`, `stone` | Quaternius Nature Pack |
| **Small container** | `small_box`, `toolbox` (scale) | Quaternius RPG Pack / KayKit |
| **Thread/wire** | `spool`, `wire_coil` | KayKit Medieval |
| **Rod/pole** | `rod`, `baton` | Quaternius (staff variant, shortened) |
| **Can/tin** | `can`, `drink_can` | Same cylindrical model |
| **Blade weapon** | `blade`, `dagger` (reskin) | Quaternius Weapon Pack |
| **Tank/canister** | `tank`, `battery` (scale) | Sketchfab |

---

## Summary by Source

| Source | Roles Covered | License | Download Effort |
|---|---|---|---|
| **Quaternius** | ~44 | CC0 | Download 4-5 packs, extract needed models, convert FBX to glTF |
| **Sketchfab** | ~12 | CC0/CC-BY (verify each) | Individual downloads, verify licenses |
| **KayKit** | ~8 | CC0 | Download 2-3 packs, extract needed models |
| **Polyhaven (existing)** | ~5 | CC0 | Already downloaded, just add role mappings |
| **Shared/aliased** | ~13 | N/A | No new downloads, just alias mappings |

**Total: 79 roles covered** (some roles appear in multiple categories due to aliasing)

---

## Recommended Implementation Order

### Phase 1: Quick Wins (no downloads needed)
Map these roles to EXISTING Polyhaven assets already in the project:

1. `vase` -> `brass_vase_01` or `ceramic_vase_01`
2. `commode` -> `GothicCommode_01`
3. `console` -> `ClassicConsole_01`
4. `drawer` -> `ClassicNightstand_01`
5. `register` -> `CashRegister_01` (already done)
6. `pot` -> `brass_pot_01`
7. `pan` -> `brass_pan_01`

These 7 roles can be mapped immediately by updating migration 027 or creating a new
migration -- zero downloads required.

### Phase 2: Quaternius Bulk Download (~44 roles)
1. Download Ultimate Weapon Pack, Ultimate RPG Pack, Ultimate Food Pack, Ultimate
   Nature Pack from quaternius.com
2. Convert needed FBX models to glTF using gltf-pipeline or Blender batch export
3. Place in `client/public/assets/models/props/quaternius/` organized by pack
4. Register as visual assets and update objectModels mappings
5. This single phase covers the majority of roles

### Phase 3: KayKit Packs (~8 roles)
1. Download Dungeon Pack, Adventurers Pack, Medieval Builder Pack from kaykit.itch.io
2. Extract needed models, convert to glTF if needed
3. Place in `client/public/assets/models/props/kaykit/`
4. Register and map

### Phase 4: Sketchfab Individual Downloads (~12 roles)
1. Search and download each model individually
2. Verify CC0/CC-BY license for each
3. Credit CC-BY authors in a CREDITS file
4. Place in `client/public/assets/models/props/sketchfab/`
5. Register and map

### Phase 5: Alias Mappings
After all models are downloaded, create alias entries in objectModels so that
visually similar roles share models (see "Roles That Can Share Models" above).

---

## File Size Considerations

- Quaternius low-poly models are typically 10-100 KB each (very lightweight)
- KayKit models are similarly small (low-poly stylized)
- Polyhaven models are 500 KB - 5 MB each (photorealistic with textures)
- Sketchfab varies widely -- always pick low-poly / game-ready versions
- Budget: ~50 MB total for all new models (conservative estimate)

---

## Style Consistency Notes

The project currently mixes photorealistic Polyhaven models with low-poly KayKit
buildings. For items/props that players interact with closely (weapons, tools, food),
**Quaternius low-poly style is recommended** because:

1. Consistent stylized aesthetic across all holdable items
2. Very small file sizes (fast loading)
3. Single artist = uniform style across all packs
4. The Polyhaven realistic models work well for environmental/furniture items that
   players don't hold

Consider: Polyhaven for furniture/environment, Quaternius for holdable items.
