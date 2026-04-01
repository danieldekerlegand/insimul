/**
 * IR Generator — Server-Side
 *
 * Fetches all world data from the database and builds a complete
 * Intermediate Representation (WorldIR) document.
 *
 * The IR is the single source of truth consumed by engine-specific
 * exporters (Unreal, Unity, Godot).
 */

import { storage } from '../../db/storage';
import { getGenreConfig } from '@shared/game-genres/index';
import type { GenreConfig } from '@shared/game-genres/types';
import type { TargetEngine } from '@shared/game-engine/asset-pipeline';
import {
  loadCollectionSnapshot,
  resolveBuildingModel,
  resolvePlayerModel,
  buildWorldAssetManifest,
} from './asset-resolver';
import { generateFoliageLayers } from './foliage-generator';
import type {
  WorldIR,
  MetaIR,
  GeographyIR,
  EntitiesIR,
  SystemsIR,
  ThemeIR,
  AssetsIR,
  PlayerIR,
  UIIR,
  MenuConfigIR,
  CombatIR,
  SurvivalIR,
  ResourcesIR,
  CountryIR,
  StateIR,
  SettlementIR,
  ElevationProfileIR,
  LotIR,
  BoundsIR,
  CharacterIR,
  NPCIR,
  NPCDailyScheduleIR,
  NPCScheduleBlockIR,
  BuildingIR,
  BuildingSpecIR,
  BusinessIR,
  RoadIR,
  StreetNodeIR,
  StreetSegmentIR,
  StreetNetworkIR,
  WaterFeatureIR,
  FoliageLayerIR,
  NatureObjectIR,
  DungeonIR,
  QuestObjectIR,
  AnimalIR,
  ContainerIR,
  RuleIR,
  ActionIR,
  QuestIR,
  TruthIR,
  GrammarIR,
  LanguageIR,
  AssetReferenceIR,
  AnimationReferenceIR,
  ResourceDefinitionIR,
  GatheringNodeIR,
  NPCDialogueContext,
  AIConfigIR,
  TerrainFeatureIR,
  BiomeZoneIR,
  BiomeZoneSpeciesIR,
  MainQuestLocationIR,
  NarrativeIR,
  TextIR,
} from '@shared/game-engine/ir-types';
import { getDefaultHiddenLocations } from '@shared/game-engine/rendering/ExplorationDiscoverySystem';
import { getWriterName, MAIN_QUEST_CHAPTERS, resolveNarrativeText } from '@shared/quest/main-quest-chapters';
import { generateNarrative } from '@shared/narrative/narrative-generator';
import { computeElevationProfile } from '../../generators/settlement-elevation';
import { TerrainGenerator, type TerrainType, type TerrainFeature } from '../../generators/terrain-generator';
import {
  getElevationZone,
  getMoistureLevel,
  getVegetationForZone,
  estimateMoisture,
  type BiomeType,
  type ElevationZone,
  type MoistureLevel,
} from '@shared/game-engine/vegetation-zones';
import { getNPCReasoningRules } from '@shared/prolog/npc-reasoning';
import { getTotTPredicates } from '@shared/prolog/tott-predicates';
import { getAdvancedPredicates } from '@shared/prolog/advanced-predicates';
import { validateExportKnowledgeBase } from '@shared/prolog/export-validator';
import type {
  Vec3,
  Color3,
  WorldVisualTheme,
  BuildingStyleData,
  NeedConfig,
  CombatStyle,
} from '@shared/game-engine/types';
import type { World, Country, State, Settlement, Character, Quest } from '@shared/schema';
import { buildLanguageAwareSystemPrompt, buildWorldLanguageContext } from '@shared/language/language-utils';
import type { CharacterInfo, Truth, WorldLanguageContext } from '@shared/language/language-utils';
import type { WorldLanguage } from '@shared/language';
import {
  generateStreetNetwork,
  chooseLayout,
  placeLots,
  placeLotsAlongStreets,
  pruneUnusedStreets,
  type StreetNetwork,
} from '../../generators/street-network-generator';
import { getEligibleBuildingTypes, type GeographyTag } from '@shared/game-engine/building-generation-rules';

// ─────────────────────────────────────────────
// Constants (match client-side values exactly)
// ─────────────────────────────────────────────

const INSIMUL_VERSION = '1.0.0';
const MAX_NPCS = 8;
const MAX_SETTLEMENTS_3D = 16;
const INITIAL_ENERGY = 100;
const LOT_SPACING = 20;
const ROAD_WIDTH = 3;

// ─────────────────────────────────────────────
// Seeded PRNG — must match client-side exactly
// ─────────────────────────────────────────────

function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash) / 233280;
  };
}

// ─────────────────────────────────────────────
// World Scale (matches WorldScaleManager.ts)
// ─────────────────────────────────────────────

const POPULATION_TIERS = [
  { min: 0, max: 50, radius: 20 },
  { min: 51, max: 200, radius: 35 },
  { min: 201, max: 1000, radius: 55 },
  { min: 1001, max: 5000, radius: 80 },
  { min: 5001, max: Infinity, radius: 120 },
];

function getSettlementRadius(population: number): number {
  for (let i = 0; i < POPULATION_TIERS.length; i++) {
    const tier = POPULATION_TIERS[i];
    if (population <= tier.max) {
      const nextTier = POPULATION_TIERS[i + 1];
      if (nextTier) {
        const progress = (population - tier.min) / (tier.max - tier.min);
        return tier.radius + progress * (nextTier.radius - tier.radius);
      }
      return tier.radius;
    }
  }
  return 20;
}

function calculateOptimalWorldSize(data: {
  countryCount: number;
  stateCount: number;
  settlementCount: number;
}): number {
  const maxEntities = Math.max(
    data.countryCount,
    data.stateCount / 2,
    data.settlementCount / 5
  );
  if (maxEntities <= 4) return 512;
  if (maxEntities <= 9) return 768;
  if (maxEntities <= 16) return 1024;
  if (maxEntities <= 25) return 1536;
  return 2048;
}

// ─────────────────────────────────────────────
// Quest Object Placement
// ─────────────────────────────────────────────

/** Map objective types to interaction types for quest objects */
function objectiveTypeToInteraction(type: string): string {
  switch (type) {
    case 'visit_location':
    case 'discover_location':
      return 'trigger_zone';
    case 'talk_to_npc':
    case 'complete_conversation':
    case 'conversation_initiation':
    case 'build_friendship':
    case 'give_gift':
      return 'npc_interaction';
    case 'collect_item':
    case 'collect_text':
    case 'collect_vocabulary':
      return 'pickup';
    case 'deliver_item':
      return 'delivery_target';
    case 'use_vocabulary':
    case 'identify_object':
    case 'pronunciation':
      return 'language_challenge';
    case 'craft_item':
      return 'crafting_station';
    case 'defeat_enemies':
      return 'combat_zone';
    case 'escort_npc':
      return 'escort_waypoint';
    default:
      return 'interact';
  }
}

/** Map objective types to default model asset keys */
function objectiveTypeToModelKey(type: string): string | null {
  switch (type) {
    case 'visit_location':
    case 'discover_location':
      return 'quest_marker_location';
    case 'collect_item':
    case 'collect_text':
      return 'quest_item_pickup';
    case 'collect_vocabulary':
    case 'use_vocabulary':
    case 'identify_object':
    case 'pronunciation':
      return 'quest_marker_language';
    case 'deliver_item':
    case 'give_gift':
      return 'quest_marker_delivery';
    case 'defeat_enemies':
      return 'quest_marker_combat';
    case 'craft_item':
      return 'quest_marker_crafting';
    default:
      return 'quest_marker_default';
  }
}

/**
 * Generate QuestObjectIR instances from quest objectives.
 * Each objective that targets a location or item gets a placed object in the world.
 */
function generateQuestObjects(
  questIRs: QuestIR[],
  buildingIRs: BuildingIR[],
  seed: string,
): QuestObjectIR[] {
  const rand = createSeededRandom(`${seed}_quest_objects`);
  const questObjects: QuestObjectIR[] = [];

  // Build a lookup of buildings by businessId for location-based placement
  const buildingByBusinessId = new Map<string, BuildingIR>();
  for (const b of buildingIRs) {
    if (b.businessId) {
      buildingByBusinessId.set(b.businessId, b);
    }
  }

  for (const quest of questIRs) {
    if (!quest.objectives || quest.objectives.length === 0) continue;

    // Determine the quest's base position from its location or fall back to origin
    const basePosition: Vec3 = quest.locationPosition
      ? { x: quest.locationPosition.x, y: quest.locationPosition.y, z: quest.locationPosition.z }
      : { x: 0, y: 0, z: 0 };

    // If quest has a locationId, try to find a matching building for more precise placement
    let buildingPosition: Vec3 | null = null;
    if (quest.locationId) {
      const building = buildingByBusinessId.get(quest.locationId);
      if (building) {
        buildingPosition = { ...building.position };
      }
    }

    const anchorPos = buildingPosition || basePosition;

    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      if (!obj || !obj.type) continue;

      // Offset each objective slightly from the anchor so they don't overlap
      const angle = (2 * Math.PI * i) / quest.objectives.length + rand() * 0.5;
      const radius = 2 + rand() * 3; // 2-5 units from anchor
      const position: Vec3 = {
        x: anchorPos.x + Math.cos(angle) * radius,
        y: anchorPos.y,
        z: anchorPos.z + Math.sin(angle) * radius,
      };

      questObjects.push({
        id: `qobj_${quest.id}_${i}`,
        questId: quest.id,
        objectType: obj.type,
        position,
        modelAssetKey: objectiveTypeToModelKey(obj.type),
        interactionType: objectiveTypeToInteraction(obj.type),
        metadata: {
          objectiveIndex: i,
          description: obj.description || null,
          target: obj.target || null,
          targetWords: obj.targetWords || null,
          required: obj.required || null,
          questTitle: quest.title,
        },
      });
    }
  }

  return questObjects;
}

// ─────────────────────────────────────────────
// Animal population generation
// ─────────────────────────────────────────────

type AnimalSpecies = 'cat' | 'dog' | 'bird';

interface SpeciesPreset {
  species: AnimalSpecies;
  color: Color3;
  scale: number;
  speed: number;
  vocabularyWord: string;
  vocabularyCategory: string;
}

const SPECIES_PRESETS: Record<AnimalSpecies, SpeciesPreset[]> = {
  cat: [
    { species: 'cat', color: { r: 0.2, g: 0.2, b: 0.2 }, scale: 1.0, speed: 1.2, vocabularyWord: 'cat', vocabularyCategory: 'animals' },
    { species: 'cat', color: { r: 0.9, g: 0.5, b: 0.1 }, scale: 0.9, speed: 1.3, vocabularyWord: 'cat', vocabularyCategory: 'animals' },
    { species: 'cat', color: { r: 0.95, g: 0.95, b: 0.9 }, scale: 1.1, speed: 1.1, vocabularyWord: 'cat', vocabularyCategory: 'animals' },
    { species: 'cat', color: { r: 0.4, g: 0.35, b: 0.3 }, scale: 0.95, speed: 1.25, vocabularyWord: 'cat', vocabularyCategory: 'animals' },
  ],
  dog: [
    { species: 'dog', color: { r: 0.55, g: 0.35, b: 0.15 }, scale: 1.0, speed: 1.8, vocabularyWord: 'dog', vocabularyCategory: 'animals' },
    { species: 'dog', color: { r: 0.15, g: 0.15, b: 0.15 }, scale: 1.2, speed: 1.6, vocabularyWord: 'dog', vocabularyCategory: 'animals' },
    { species: 'dog', color: { r: 0.9, g: 0.85, b: 0.7 }, scale: 0.8, speed: 2.0, vocabularyWord: 'dog', vocabularyCategory: 'animals' },
    { species: 'dog', color: { r: 0.6, g: 0.3, b: 0.1 }, scale: 1.1, speed: 1.7, vocabularyWord: 'dog', vocabularyCategory: 'animals' },
  ],
  bird: [
    { species: 'bird', color: { r: 0.8, g: 0.2, b: 0.2 }, scale: 1.0, speed: 2.5, vocabularyWord: 'bird', vocabularyCategory: 'animals' },
    { species: 'bird', color: { r: 0.2, g: 0.4, b: 0.8 }, scale: 0.9, speed: 2.8, vocabularyWord: 'bird', vocabularyCategory: 'animals' },
    { species: 'bird', color: { r: 0.3, g: 0.3, b: 0.3 }, scale: 1.1, speed: 2.3, vocabularyWord: 'bird', vocabularyCategory: 'animals' },
    { species: 'bird', color: { r: 0.9, g: 0.8, b: 0.1 }, scale: 0.85, speed: 2.6, vocabularyWord: 'bird', vocabularyCategory: 'animals' },
  ],
};

/** Determine animal counts for a settlement based on its population */
export function getAnimalCounts(population: number): { cats: number; dogs: number; birds: number } {
  if (population <= 0) return { cats: 0, dogs: 0, birds: 0 };
  // Scale animals logarithmically with population: small towns get a few, cities get more
  const base = Math.max(1, Math.floor(Math.log2(population)));
  return {
    cats: Math.min(base, 6),
    dogs: Math.min(Math.max(1, base - 1), 5),
    birds: Math.min(base + 1, 8),
  };
}

/**
 * Generate animal population for settlements.
 * Animals are distributed around settlements, with counts scaling by population.
 * Cats and dogs stay near buildings; birds can roam wider.
 */
// ── Container Placement Generator ───────────────────────────────────────────

/** Item templates per business type for container population. */
const CONTAINER_ITEM_TEMPLATES: Record<string, Array<{ itemName: string; itemType: string; rarity?: string }>> = {
  Bakery: [
    { itemName: 'Bread', itemType: 'food' }, { itemName: 'Pastry', itemType: 'food' },
    { itemName: 'Flour', itemType: 'material' }, { itemName: 'Butter', itemType: 'food' },
  ],
  Restaurant: [
    { itemName: 'Prepared Meal', itemType: 'food' }, { itemName: 'Wine', itemType: 'food' },
    { itemName: 'Cheese', itemType: 'food' }, { itemName: 'Spices', itemType: 'material' },
  ],
  Blacksmith: [
    { itemName: 'Iron Ingot', itemType: 'material' }, { itemName: 'Hammer', itemType: 'tool' },
    { itemName: 'Nails', itemType: 'material' }, { itemName: 'Horseshoe', itemType: 'material' },
  ],
  Shop: [
    { itemName: 'Candles', itemType: 'material' }, { itemName: 'Rope', itemType: 'material' },
    { itemName: 'Cloth', itemType: 'material' }, { itemName: 'Small Gem', itemType: 'material', rarity: 'uncommon' },
  ],
  Farm: [
    { itemName: 'Seeds', itemType: 'material' }, { itemName: 'Vegetables', itemType: 'food' },
    { itemName: 'Eggs', itemType: 'food' }, { itemName: 'Milk', itemType: 'food' },
  ],
  default: [
    { itemName: 'Coin Pouch', itemType: 'material' }, { itemName: 'Candle', itemType: 'material' },
    { itemName: 'Old Book', itemType: 'material' }, { itemName: 'Bread', itemType: 'food' },
  ],
};

export function generateContainerPlacements(
  buildings: BuildingIR[],
  businesses: BusinessIR[],
  seed: string,
): ContainerIR[] {
  const rand = createSeededRandom(`${seed}_containers`);
  const containers: ContainerIR[] = [];
  const businessMap = new Map(businesses.map(b => [b.id, b]));

  for (const building of buildings) {
    const business = building.businessId ? businessMap.get(building.businessId) : null;
    const businessType = business?.businessType || '';
    const containerCount = 1 + Math.floor(rand() * 3); // 1-3 containers per building

    for (let i = 0; i < containerCount; i++) {
      const types: Array<'chest' | 'barrel' | 'crate'> = ['chest', 'barrel', 'crate'];
      const containerType = types[Math.floor(rand() * types.length)];

      // Position offset from building center
      const offset = { x: (rand() - 0.5) * 6, y: 0, z: (rand() - 0.5) * 6 };
      const pos = {
        x: (building.position?.x || 0) + offset.x,
        y: (building.position?.y || 0) + offset.y,
        z: (building.position?.z || 0) + offset.z,
      };

      // Generate 3-8 items from appropriate template
      const template = CONTAINER_ITEM_TEMPLATES[businessType] || CONTAINER_ITEM_TEMPLATES.default;
      const itemCount = 3 + Math.floor(rand() * 6);
      const items: Array<{ itemName: string; itemType: string; quantity: number; rarity?: string }> = [];
      for (let j = 0; j < itemCount; j++) {
        const item = template[Math.floor(rand() * template.length)];
        items.push({
          itemName: item.itemName,
          itemType: item.itemType,
          quantity: 1 + Math.floor(rand() * 3),
          rarity: item.rarity || 'common',
        });
      }

      containers.push({
        id: `container_${building.id}_${i}`,
        buildingId: building.id,
        containerType,
        position: pos,
        location: 'interior',
        items,
        businessType: businessType || undefined,
      });
    }
  }

  return containers;
}

export function generateAnimals(
  settlementIRs: SettlementIR[],
  seed: string,
): AnimalIR[] {
  const rand = createSeededRandom(`${seed}_animals`);
  const animals: AnimalIR[] = [];

  for (const settlement of settlementIRs) {
    const counts = getAnimalCounts(settlement.population);
    const cx = settlement.position.x;
    const cz = settlement.position.z;
    const r = 200; // Default settlement radius

    const speciesList: { species: AnimalSpecies; count: number; wanderScale: number }[] = [
      { species: 'cat', count: counts.cats, wanderScale: 0.6 },
      { species: 'dog', count: counts.dogs, wanderScale: 0.7 },
      { species: 'bird', count: counts.birds, wanderScale: 1.2 },
    ];

    for (const { species, count, wanderScale } of speciesList) {
      const presets = SPECIES_PRESETS[species];
      for (let i = 0; i < count; i++) {
        const r01 = () => Math.abs(rand()); // ensure [0, 1) range
        const preset = presets[Math.floor(r01() * presets.length) % presets.length];
        // Place animals within settlement radius
        const angle = r01() * Math.PI * 2;
        const dist = r01() * r * 0.8; // Keep within 80% of radius
        const x = cx + Math.cos(angle) * dist;
        const z = cz + Math.sin(angle) * dist;
        const wanderRadius = 5 + r01() * r * wanderScale * 0.3;

        animals.push({
          id: `animal_${settlement.id}_${species}_${i}`,
          species,
          position: { x, y: 0, z },
          rotation: r01() * Math.PI * 2,
          homePosition: { x, y: 0, z },
          wanderRadius,
          speed: preset.speed * (0.8 + r01() * 0.4), // ±20% speed variation
          color: preset.color,
          scale: preset.scale * (0.9 + r01() * 0.2), // ±10% scale variation
          vocabularyWord: preset.vocabularyWord,
          vocabularyCategory: preset.vocabularyCategory,
        });
      }
    }
  }

  return animals;
}

function distributeInGrid(
  count: number,
  bounds: BoundsIR,
  padding: number
): BoundsIR[] {
  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxZ - bounds.minZ;
  const cellW = width / cols;
  const cellH = height / rows;

  const result: BoundsIR[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const minX = bounds.minX + col * cellW + padding;
    const maxX = bounds.minX + (col + 1) * cellW - padding;
    const minZ = bounds.minZ + row * cellH + padding;
    const maxZ = bounds.minZ + (row + 1) * cellH - padding;
    result.push({
      minX, maxX, minZ, maxZ,
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2,
    });
  }
  return result;
}

// ─────────────────────────────────────────────
// Settlement positioning (matches WorldScaleManager)
// ─────────────────────────────────────────────

interface PlacedSettlement {
  id: string;
  position: Vec3;
  radius: number;
}

function distributeSettlements(
  settlements: Settlement[],
  bounds: BoundsIR,
  seed: string,
  territoryId: string
): PlacedSettlement[] {
  const rand = createSeededRandom(`${seed}_${territoryId}`);
  const placed: PlacedSettlement[] = [];

  for (let idx = 0; idx < settlements.length; idx++) {
    const s = settlements[idx];
    const population = s.population || 100;
    const radius = getSettlementRadius(population);
    let x = 0, z = 0;
    let found = false;

    for (let attempt = 0; attempt < 50; attempt++) {
      x = bounds.minX + rand() * (bounds.maxX - bounds.minX);
      z = bounds.minZ + rand() * (bounds.maxZ - bounds.minZ);

      const tooClose = placed.some(other => {
        const dx = x - other.position.x;
        const dz = z - other.position.z;
        return Math.sqrt(dx * dx + dz * dz) < (radius + other.radius + 10);
      });

      if (!tooClose) { found = true; break; }
    }

    if (!found) {
      // Grid fallback
      const cols = Math.ceil(Math.sqrt(settlements.length));
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const cellW = (bounds.maxX - bounds.minX) / cols;
      const cellH = (bounds.maxZ - bounds.minZ) / Math.ceil(settlements.length / cols);
      x = bounds.minX + col * cellW + cellW / 2;
      z = bounds.minZ + row * cellH + cellH / 2;
    }

    placed.push({ id: s.id, position: { x, y: 0, z }, radius });
  }

  return placed;
}

// ─────────────────────────────────────────────
// Lot placement (matches WorldScaleManager)
// ─────────────────────────────────────────────

function generateLotPositions(
  center: Vec3,
  lotCount: number,
  seed: string,
  settlementId: string
): Vec3[] {
  const rand = createSeededRandom(`${seed}_${settlementId}_lots`);
  const positions: Vec3[] = [];
  const cols = Math.ceil(Math.sqrt(lotCount));
  const rows = Math.ceil(lotCount / cols);
  const gridW = (cols - 1) * LOT_SPACING;
  const gridH = (rows - 1) * LOT_SPACING;

  for (let i = 0; i < lotCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const baseX = center.x - gridW / 2 + col * LOT_SPACING;
    const baseZ = center.z - gridH / 2 + row * LOT_SPACING;
    const jitterX = (rand() - 0.5) * 4;
    const jitterZ = (rand() - 0.5) * 4;
    positions.push({ x: baseX + jitterX, y: 0, z: baseZ + jitterZ });
  }

  return positions;
}

// ─────────────────────────────────────────────
// Synthetic bay shoreline for coastal settlements
// ─────────────────────────────────────────────

function generateBayShoreline(
  centerX: number,
  centerZ: number,
  radius: number,
  settlementZ: number,
): Vec3[] {
  const points: Vec3[] = [];
  // Generate a U-shaped shoreline curving from west to east along the
  // northern edge of the bay (closest to settlement)
  const numPoints = 16;
  for (let i = 0; i <= numPoints; i++) {
    // Sweep from -PI to 0 (west to east across the top of the bay)
    const angle = -Math.PI + (i / numPoints) * Math.PI;
    const x = centerX + Math.cos(angle) * radius;
    const z = centerZ + Math.sin(angle) * radius * 0.6;
    // Clamp shoreline to not go north of the settlement edge
    points.push({ x, y: 0, z: Math.max(z, settlementZ) });
  }
  return points;
}

// ─────────────────────────────────────────────
// Road MST (matches RoadGenerator.ts Kruskal's)
// ─────────────────────────────────────────────

interface MSTEdge { fromIdx: number; toIdx: number; distance: number; }

function computeMST(nodes: { id: string; position: Vec3 }[]): MSTEdge[] {
  const n = nodes.length;
  if (n < 2) return [];

  const edges: MSTEdge[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = nodes[i].position.x - nodes[j].position.x;
      const dz = nodes[i].position.z - nodes[j].position.z;
      edges.push({ fromIdx: i, toIdx: j, distance: Math.sqrt(dx * dx + dz * dz) });
    }
  }
  edges.sort((a, b) => a.distance - b.distance);

  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  const find = (x: number): number => {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  };
  const union = (a: number, b: number): boolean => {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else { parent[rb] = ra; rank[ra]++; }
    return true;
  };

  const mst: MSTEdge[] = [];
  for (const edge of edges) {
    if (union(edge.fromIdx, edge.toIdx)) {
      mst.push(edge);
      if (mst.length === n - 1) break;
    }
  }
  return mst;
}

// ─────────────────────────────────────────────
// Visual theme (matches BabylonGame.ts)
// ─────────────────────────────────────────────

function computeWorldVisualTheme(worldType?: string): WorldVisualTheme {
  const type = (worldType || '').toLowerCase();

  if (type.includes('cyberpunk') || type.includes('sci-fi') || type.includes('space')) {
    return {
      groundColor: { r: 0.12, g: 0.12, b: 0.16 },
      skyColor: { r: 0.05, g: 0.08, b: 0.16 },
      roadColor: { r: 0.18, g: 0.2, b: 0.32 },
      roadRadius: 1.4,
      settlementBaseColor: { r: 0.25, g: 0.4, b: 0.7 },
      settlementRoofColor: { r: 0.5, g: 0.2, b: 0.7 },
    };
  }

  if (type.includes('post-apocalyptic') || type.includes('wild-west')) {
    return {
      groundColor: { r: 0.6, g: 0.54, b: 0.4 },
      skyColor: { r: 0.78, g: 0.7, b: 0.55 },
      roadColor: { r: 0.45, g: 0.36, b: 0.26 },
      roadRadius: 1.3,
      settlementBaseColor: { r: 0.55, g: 0.4, b: 0.25 },
      settlementRoofColor: { r: 0.3, g: 0.18, b: 0.12 },
    };
  }

  if (type.includes('solarpunk')) {
    return {
      groundColor: { r: 0.35, g: 0.6, b: 0.35 },
      skyColor: { r: 0.55, g: 0.8, b: 0.95 },
      roadColor: { r: 0.5, g: 0.6, b: 0.5 },
      roadRadius: 1.1,
      settlementBaseColor: { r: 0.45, g: 0.7, b: 0.5 },
      settlementRoofColor: { r: 0.7, g: 0.85, b: 0.6 },
    };
  }

  if (type.includes('medieval') || type.includes('fantasy') ||
      type.includes('historical') || type.includes('mythological')) {
    return {
      groundColor: { r: 0.45, g: 0.7, b: 0.38 },
      skyColor: { r: 0.4, g: 0.6, b: 0.9 },
      roadColor: { r: 0.38, g: 0.3, b: 0.22 },
      roadRadius: 1.2,
      settlementBaseColor: { r: 0.7, g: 0.55, b: 0.35 },
      settlementRoofColor: { r: 0.4, g: 0.2, b: 0.15 },
    };
  }

  if (type.includes('modern') || type.includes('superhero') || type.includes('urban-fantasy')) {
    return {
      groundColor: { r: 0.3, g: 0.55, b: 0.38 },
      skyColor: { r: 0.5, g: 0.7, b: 0.95 },
      roadColor: { r: 0.2, g: 0.22, b: 0.28 },
      roadRadius: 1.3,
      settlementBaseColor: { r: 0.6, g: 0.6, b: 0.65 },
      settlementRoofColor: { r: 0.25, g: 0.25, b: 0.3 },
    };
  }

  // Default
  return {
    groundColor: { r: 0.9, g: 0.6, b: 0.4 },
    skyColor: { r: 0.4, g: 0.6, b: 0.9 },
    roadColor: { r: 0.35, g: 0.28, b: 0.2 },
    roadRadius: 1.2,
    settlementBaseColor: { r: 0.8, g: 0.55, b: 0.35 },
    settlementRoofColor: { r: 0.4, g: 0.2, b: 0.15 },
  };
}

// ─────────────────────────────────────────────
// Building style (matches ProceduralBuildingGenerator)
// ─────────────────────────────────────────────

function getBuildingStyleForWorldType(worldType?: string): BuildingStyleData {
  const t = (worldType || '').toLowerCase();
  if (t.includes('medieval') || t.includes('fantasy')) {
    return {
      name: 'medieval_wood',
      baseColor: { r: 0.7, g: 0.55, b: 0.35 },
      roofColor: { r: 0.4, g: 0.2, b: 0.15 },
      windowColor: { r: 0.9, g: 0.85, b: 0.6 },
      doorColor: { r: 0.35, g: 0.2, b: 0.1 },
      materialType: 'wood',
      architectureStyle: 'medieval',
    };
  }
  if (t.includes('cyberpunk') || t.includes('sci-fi')) {
    return {
      name: 'futuristic_metal',
      baseColor: { r: 0.25, g: 0.4, b: 0.7 },
      roofColor: { r: 0.5, g: 0.2, b: 0.7 },
      windowColor: { r: 0.3, g: 0.8, b: 1.0 },
      doorColor: { r: 0.2, g: 0.2, b: 0.3 },
      materialType: 'metal',
      architectureStyle: 'futuristic',
    };
  }
  if (t.includes('modern') || t.includes('superhero')) {
    return {
      name: 'modern_glass',
      baseColor: { r: 0.6, g: 0.6, b: 0.65 },
      roofColor: { r: 0.25, g: 0.25, b: 0.3 },
      windowColor: { r: 0.5, g: 0.7, b: 0.9 },
      doorColor: { r: 0.3, g: 0.3, b: 0.35 },
      materialType: 'glass',
      architectureStyle: 'modern',
    };
  }
  // Default rustic
  return {
    name: 'rustic_wood',
    baseColor: { r: 0.8, g: 0.55, b: 0.35 },
    roofColor: { r: 0.4, g: 0.2, b: 0.15 },
    windowColor: { r: 0.85, g: 0.8, b: 0.55 },
    doorColor: { r: 0.4, g: 0.25, b: 0.12 },
    materialType: 'wood',
    architectureStyle: 'rustic',
  };
}

// ─────────────────────────────────────────────
// Building spec defaults (matches ProceduralBuildingGenerator)
// ─────────────────────────────────────────────

const BUILDING_SPEC_DEFAULTS: Record<string, Partial<BuildingSpecIR>> = {
  Bakery:    { floors: 2, width: 12, depth: 10, hasChimney: true, hasBalcony: false },
  Restaurant:{ floors: 2, width: 15, depth: 12, hasChimney: false, hasBalcony: false },
  Bar:       { floors: 2, width: 14, depth: 14, hasChimney: false, hasBalcony: true },
  Hotel:     { floors: 3, width: 16, depth: 14, hasChimney: false, hasBalcony: true },
  GroceryStore:{ floors: 1, width: 20, depth: 15, hasChimney: false, hasBalcony: false },
  Shop:      { floors: 2, width: 10, depth: 8, hasChimney: false, hasBalcony: false },
  Factory:   { floors: 1, width: 12, depth: 10, hasChimney: true, hasBalcony: false },
  Hospital:  { floors: 3, width: 20, depth: 18, hasChimney: false, hasBalcony: false },
  Church:    { floors: 1, width: 16, depth: 24, hasChimney: false, hasBalcony: false },
  School:    { floors: 3, width: 16, depth: 14, hasChimney: false, hasBalcony: false },
  residence_small:   { floors: 1, width: 8, depth: 8, hasChimney: false, hasBalcony: false },
  residence_medium:  { floors: 2, width: 10, depth: 10, hasChimney: true, hasBalcony: false },
  residence_large:   { floors: 2, width: 14, depth: 12, hasChimney: true, hasBalcony: true },
  residence_mansion: { floors: 3, width: 20, depth: 18, hasChimney: true, hasBalcony: true },
};

function getBuildingSpec(businessType: string | null): BuildingSpecIR {
  const defaults = (businessType && BUILDING_SPEC_DEFAULTS[businessType]) || {};
  return {
    buildingRole: businessType || 'residence_small',
    floors: defaults.floors ?? 2,
    width: defaults.width ?? 10,
    depth: defaults.depth ?? 10,
    hasChimney: defaults.hasChimney ?? false,
    hasBalcony: defaults.hasBalcony ?? false,
  };
}

// ─────────────────────────────────────────────
// Default combat settings (matches CombatSystem.ts)
// ─────────────────────────────────────────────

function getCombatSettings(style: CombatStyle) {
  const presets: Record<string, CombatIR['settings']> = {
    melee: {
      baseDamage: 10, damageVariance: 0.2, criticalChance: 0.1,
      criticalMultiplier: 2, blockReduction: 0.5, dodgeChance: 0.15,
      attackCooldown: 800, comboWindowMs: 500, maxComboLength: 3,
    },
    ranged: {
      baseDamage: 15, damageVariance: 0.15, criticalChance: 0.15,
      criticalMultiplier: 2.5, blockReduction: 0.3, dodgeChance: 0.2,
      attackCooldown: 1200, comboWindowMs: 0, maxComboLength: 1,
    },
    turn_based: {
      baseDamage: 20, damageVariance: 0.1, criticalChance: 0.08,
      criticalMultiplier: 1.5, blockReduction: 0.4, dodgeChance: 0.1,
      attackCooldown: 0, comboWindowMs: 0, maxComboLength: 1,
    },
    fighting: {
      baseDamage: 8, damageVariance: 0.25, criticalChance: 0.12,
      criticalMultiplier: 2, blockReduction: 0.6, dodgeChance: 0.2,
      attackCooldown: 400, comboWindowMs: 800, maxComboLength: 5,
    },
  };
  return presets[style] || presets['melee'];
}

// ─────────────────────────────────────────────
// Menu configuration builder
// ─────────────────────────────────────────────

function buildMenuConfig(worldName: string, genreConfig: GenreConfig): MenuConfigIR {
  const backgroundImages: Record<string, string> = {
    action_rpg: 'ui/backgrounds/fantasy_landscape.jpg',
    fps: 'ui/backgrounds/tactical_grid.jpg',
    rts: 'ui/backgrounds/strategic_map.jpg',
    platformer: 'ui/backgrounds/colorful_sky.jpg',
    puzzle: 'ui/backgrounds/abstract_pattern.jpg',
    minimal: 'ui/backgrounds/gradient.jpg',
  };

  const inventoryCategories: string[] = ['All'];
  if (genreConfig.features.inventory) inventoryCategories.push('Equipment', 'Consumables', 'Materials', 'Quest Items');
  if (genreConfig.features.crafting) inventoryCategories.push('Crafting');

  return {
    mainMenu: {
      title: worldName,
      backgroundImage: backgroundImages[genreConfig.uiLayout] ?? backgroundImages['minimal'],
      buttons: [
        { label: 'New Game', action: 'new_game' },
        { label: 'Continue', action: 'continue' },
        { label: 'Settings', action: 'open_settings' },
        { label: 'Quit', action: 'quit' },
      ],
    },
    pauseMenu: {
      buttons: [
        { label: 'Resume', action: 'resume' },
        { label: 'Settings', action: 'open_settings' },
        { label: 'Save', action: 'save_game' },
        { label: 'Main Menu', action: 'main_menu' },
        { label: 'Quit', action: 'quit' },
      ],
    },
    settingsMenu: {
      categories: [
        {
          name: 'Audio',
          settings: [
            { key: 'master_volume', label: 'Master Volume', type: 'slider', default: 80 },
            { key: 'music_volume', label: 'Music Volume', type: 'slider', default: 70 },
            { key: 'sfx_volume', label: 'SFX Volume', type: 'slider', default: 80 },
            { key: 'mute', label: 'Mute All', type: 'toggle', default: false },
          ],
        },
        {
          name: 'Graphics',
          settings: [
            { key: 'quality', label: 'Quality', type: 'dropdown', default: 'medium', options: ['low', 'medium', 'high', 'ultra'] },
            { key: 'resolution', label: 'Resolution', type: 'dropdown', default: '1920x1080', options: ['1280x720', '1920x1080', '2560x1440', '3840x2160'] },
            { key: 'fullscreen', label: 'Fullscreen', type: 'toggle', default: true },
          ],
        },
        {
          name: 'Controls',
          settings: [
            { key: 'mouse_sensitivity', label: 'Mouse Sensitivity', type: 'slider', default: 50 },
            { key: 'invert_y', label: 'Invert Y Axis', type: 'toggle', default: false },
          ],
        },
        {
          name: 'Language',
          settings: [
            { key: 'target_language', label: 'Target Language', type: 'dropdown', default: 'auto', options: ['auto'] },
            { key: 'subtitles', label: 'Show Subtitles', type: 'toggle', default: true },
          ],
        },
      ],
    },
    inventoryScreen: {
      slots: genreConfig.features.inventory ? 40 : 0,
      categories: inventoryCategories,
    },
    mapScreen: {
      enabled: genreConfig.showMinimap,
      zoomLevels: [0.5, 1, 2, 4],
    },
  };
}

// ─────────────────────────────────────────────
// Default survival needs (matches SurvivalNeedsSystem.ts)
// ─────────────────────────────────────────────

const DEFAULT_SURVIVAL_NEEDS: NeedConfig[] = [
  { id: 'hunger', name: 'Hunger', icon: '🍖', maxValue: 100, startValue: 80, decayRate: 0.15, criticalThreshold: 15, damageRate: 2, warningThreshold: 30 },
  { id: 'thirst', name: 'Thirst', icon: '💧', maxValue: 100, startValue: 90, decayRate: 0.25, criticalThreshold: 15, damageRate: 3, warningThreshold: 30 },
  { id: 'temperature', name: 'Temperature', icon: '🌡️', maxValue: 100, startValue: 50, decayRate: 0, criticalThreshold: 10, damageRate: 1.5, warningThreshold: 20 },
  { id: 'stamina', name: 'Stamina', icon: '⚡', maxValue: 100, startValue: 100, decayRate: 0, criticalThreshold: 10, damageRate: 0, warningThreshold: 25 },
  { id: 'sleep', name: 'Sleep', icon: '😴', maxValue: 100, startValue: 100, decayRate: 0.08, criticalThreshold: 10, damageRate: 0.5, warningThreshold: 25 },
];

function buildSurvivalIR(): SurvivalIR {
  return {
    needs: DEFAULT_SURVIVAL_NEEDS,
    damageConfig: {
      enabled: true,
      tickMode: 'continuous',
      globalDamageMultiplier: 1,
    },
    temperatureConfig: {
      environmentDriven: true,
      comfortZone: { min: 20, max: 80 },
      criticalAtBothExtremes: true,
    },
    staminaConfig: {
      actionDriven: true,
      recoveryRate: 2,
    },
    modifierPresets: [
      { id: 'near_campfire', name: 'Near Campfire', needType: 'temperature', rateMultiplier: 0, duration: 0, source: 'environment' },
      { id: 'sheltered', name: 'Sheltered', needType: 'temperature', rateMultiplier: 0.5, duration: 0, source: 'environment' },
      { id: 'well_fed', name: 'Well Fed', needType: 'hunger', rateMultiplier: 0.5, duration: 300000, source: 'consumable' },
      { id: 'dehydrated', name: 'Dehydrated', needType: 'thirst', rateMultiplier: 1.5, duration: 120000, source: 'status_effect' },
      { id: 'exhausted', name: 'Exhausted', needType: 'sleep', rateMultiplier: 2, duration: 180000, source: 'status_effect' },
      { id: 'resting', name: 'Resting', needType: 'stamina', rateMultiplier: 0, duration: 0, source: 'action' },
    ],
  };
}

// ─────────────────────────────────────────────
// Default resource definitions (matches ResourceSystem.ts)
// ─────────────────────────────────────────────

const DEFAULT_RESOURCE_DEFS: ResourceDefinitionIR[] = [
  { id: 'wood', name: 'Wood', icon: '🪵', color: { r: 0.55, g: 0.35, b: 0.15 }, maxStack: 999, gatherTime: 1500, respawnTime: 60000 },
  { id: 'stone', name: 'Stone', icon: '🪨', color: { r: 0.5, g: 0.5, b: 0.5 }, maxStack: 999, gatherTime: 2000, respawnTime: 90000 },
  { id: 'iron', name: 'Iron', icon: '⛏️', color: { r: 0.6, g: 0.6, b: 0.65 }, maxStack: 500, gatherTime: 3000, respawnTime: 120000 },
  { id: 'gold', name: 'Gold', icon: '💰', color: { r: 1, g: 0.84, b: 0 }, maxStack: 9999, gatherTime: 4000, respawnTime: 180000 },
  { id: 'food', name: 'Food', icon: '🌾', color: { r: 0.8, g: 0.7, b: 0.2 }, maxStack: 500, gatherTime: 1000, respawnTime: 30000 },
  { id: 'water', name: 'Water', icon: '💧', color: { r: 0.2, g: 0.5, b: 0.9 }, maxStack: 500, gatherTime: 800, respawnTime: 20000 },
  { id: 'fiber', name: 'Fiber', icon: '🌿', color: { r: 0.3, g: 0.7, b: 0.3 }, maxStack: 500, gatherTime: 1200, respawnTime: 45000 },
  { id: 'crystal', name: 'Crystal', icon: '💎', color: { r: 0.6, g: 0.4, b: 0.9 }, maxStack: 200, gatherTime: 5000, respawnTime: 300000 },
  { id: 'oil', name: 'Oil', icon: '🛢️', color: { r: 0.15, g: 0.15, b: 0.15 }, maxStack: 300, gatherTime: 3500, respawnTime: 240000 },
];

// ─────────────────────────────────────────────
// Resource gathering node generation
// ─────────────────────────────────────────────

/** Resource types mapped to biome-appropriate distribution weights */
const RESOURCE_BIOME_WEIGHTS: Record<string, Partial<Record<string, number>>> = {
  forest:    { wood: 5, food: 3, fiber: 3, water: 1 },
  plains:    { food: 4, fiber: 4, stone: 2, water: 1 },
  mountain:  { stone: 5, iron: 4, crystal: 2, gold: 1 },
  desert:    { stone: 3, oil: 3, crystal: 2, gold: 1 },
  swamp:     { water: 4, fiber: 3, food: 2, oil: 2 },
  tundra:    { stone: 3, iron: 2, crystal: 2, water: 1 },
  tropical:  { wood: 4, food: 5, fiber: 3, water: 2 },
  default:   { wood: 3, stone: 3, food: 2, iron: 1, water: 1 },
};

/** Amount ranges per resource type [min, max] */
const RESOURCE_AMOUNT_RANGES: Record<string, [number, number]> = {
  wood: [3, 8], stone: [2, 6], iron: [1, 4], gold: [1, 2],
  food: [2, 6], water: [3, 8], fiber: [2, 5], crystal: [1, 3], oil: [1, 3],
};

/**
 * Generate gathering nodes scattered around settlements based on terrain/biome.
 * Nodes are placed outside settlement radii but within reachable distance.
 */
export function generateGatheringNodes(
  settlements: SettlementIR[],
  resourceDefs: ResourceDefinitionIR[],
  terrainSize: number,
  seed: string,
): GatheringNodeIR[] {
  const rand = createSeededRandom(`${seed}_gathering_nodes`);
  const nodes: GatheringNodeIR[] = [];
  const half = terrainSize / 2;

  // Nodes per settlement scales with terrain
  const nodesPerSettlement = Math.max(5, Math.min(20, Math.floor(terrainSize / 100)));

  for (const settlement of settlements) {
    const biome = (settlement.terrain || 'default').toLowerCase();
    const weights = RESOURCE_BIOME_WEIGHTS[biome] || RESOURCE_BIOME_WEIGHTS.default;

    // Build weighted pool
    const pool: { type: string; weight: number }[] = [];
    let totalWeight = 0;
    for (const [type, weight] of Object.entries(weights)) {
      // Only include resource types that have a definition
      if (resourceDefs.some(d => d.id === type)) {
        pool.push({ type, weight: weight! });
        totalWeight += weight!;
      }
    }
    if (pool.length === 0 || totalWeight === 0) continue;

    for (let i = 0; i < nodesPerSettlement; i++) {
      // Weighted random selection
      let roll = Math.abs(rand()) * totalWeight;
      let selectedType = pool[0].type;
      for (const entry of pool) {
        roll -= entry.weight;
        if (roll <= 0) { selectedType = entry.type; break; }
      }

      const def = resourceDefs.find(d => d.id === selectedType)!;
      const range = RESOURCE_AMOUNT_RANGES[selectedType] || [1, 5];
      const maxAmount = range[0] + Math.floor(Math.abs(rand()) * (range[1] - range[0] + 1));

      // Place nodes in a ring around the settlement (1x-3x radius out)
      const angle = Math.abs(rand()) * Math.PI * 2;
      const dist = 200 * (1 + Math.abs(rand()) * 2);
      const x = Math.max(-half, Math.min(half, settlement.position.x + Math.cos(angle) * dist));
      const z = Math.max(-half, Math.min(half, settlement.position.z + Math.sin(angle) * dist));

      const scale = 0.8 + Math.abs(rand()) * 0.6; // 0.8 – 1.4

      nodes.push({
        id: `rnode_${settlement.id}_${i}`,
        resourceType: selectedType as any,
        position: { x, y: settlement.position.y, z },
        maxAmount,
        respawnTime: def.respawnTime,
        scale,
      });
    }
  }

  return nodes;
}

// ─────────────────────────────────────────────
// NPC assignment helpers
// ─────────────────────────────────────────────

function assignNPCRole(character: Character, quests: Quest[]): string {
  const isQuestGiver = quests.some(
    q => q.assignedByCharacterId === character.id
  );
  if (isQuestGiver) return 'questgiver';

  const occ = (character.occupation || '').toLowerCase();
  const age = character.age ?? 30;

  // Age-based roles
  if (age < 14) return 'child';
  if (age >= 65) return 'elder';

  // Occupation-based roles
  if (occ.includes('guard') || occ.includes('police') || occ.includes('sheriff') || occ.includes('watchman')) return 'guard';
  if (occ.includes('soldier') || occ.includes('knight') || occ.includes('militia') || occ.includes('warrior')) return 'soldier';
  if (occ.includes('merchant') || occ.includes('trader') || occ.includes('shop') || occ.includes('vendor')) return 'merchant';
  if (occ.includes('farm') || occ.includes('ranch') || occ.includes('harvest') || occ.includes('shepherd')) return 'farmer';
  if (occ.includes('smith') || occ.includes('forge') || occ.includes('armorer') || occ.includes('weaponsmith')) return 'blacksmith';
  if (occ.includes('innkeep') || occ.includes('barkeep') || occ.includes('tavern') || occ.includes('bartend')) return 'innkeeper';
  if (occ.includes('priest') || occ.includes('cleric') || occ.includes('monk') || occ.includes('clergy') || occ.includes('pastor') || occ.includes('chaplain')) return 'priest';
  if (occ.includes('teach') || occ.includes('tutor') || occ.includes('professor') || occ.includes('scholar') || occ.includes('librarian')) return 'teacher';
  if (occ.includes('doctor') || occ.includes('physician') || occ.includes('healer') || occ.includes('apothecary') || occ.includes('nurse') || occ.includes('medic')) return 'doctor';
  if (occ.includes('noble') || occ.includes('lord') || occ.includes('lady') || occ.includes('duke') || occ.includes('baron') || occ.includes('count') || occ.includes('mayor')) return 'noble';
  if (occ.includes('sailor') || occ.includes('fisher') || occ.includes('captain') || occ.includes('navigator') || occ.includes('boatswain')) return 'sailor';
  if (occ.includes('beggar') || occ.includes('vagrant') || occ.includes('homeless') || occ.includes('drifter')) return 'beggar';

  return 'civilian';
}

function parseDisposition(character: Character): number {
  const sa = character.socialAttributes as Record<string, any> | null;
  if (sa && typeof sa.disposition === 'number') return sa.disposition;
  // Derive from personality — friendlier = higher disposition
  const p = character.personality as { agreeableness?: number; extroversion?: number } | null;
  if (p) {
    const base = 50;
    const mod = ((p.agreeableness || 0) + (p.extroversion || 0)) * 15;
    return Math.max(0, Math.min(100, Math.round(base + mod)));
  }
  return 50;
}

// ═════════════════════════════════════════════
// NPC Daily Schedule Builder
// ═════════════════════════════════════════════

/**
 * Build a personality-driven daily schedule for an NPC.
 *
 * Mirrors the runtime NPCScheduleSystem logic so that exported games
 * (Godot/Unity/Unreal) can reconstruct NPC routines without the
 * Babylon.js client-side schedule system.
 */
export function buildNPCSchedule(
  character: {
    id: string;
    personality?: { openness?: number; conscientiousness?: number; extroversion?: number; agreeableness?: number; neuroticism?: number } | null;
    occupation?: string | null;
    friendIds?: string[];
    assignedHomeBuildingId?: string | null;
  },
  buildings: { id: string; settlementId: string; businessId: string | null; spec: { buildingRole: string } }[],
  settlementId: string | null,
): NPCDailyScheduleIR {
  const p = {
    openness: character.personality?.openness ?? 0.5,
    conscientiousness: character.personality?.conscientiousness ?? 0.5,
    extroversion: character.personality?.extroversion ?? 0.5,
    agreeableness: character.personality?.agreeableness ?? 0.5,
    neuroticism: character.personality?.neuroticism ?? 0.5,
  };

  const hasJob = !!(character.occupation);

  // Find home and work buildings in the NPC's settlement
  const settlementBuildings = settlementId
    ? buildings.filter(b => b.settlementId === settlementId)
    : buildings;

  const residences = settlementBuildings.filter(b =>
    b.spec.buildingRole.includes('residence')
  );
  const workplaces = settlementBuildings.filter(b =>
    b.businessId != null && !b.spec.buildingRole.includes('residence')
  );

  // Use the character's pre-resolved home building, fall back to first available residence
  const homeBuildingId = character.assignedHomeBuildingId
    ?? (residences.length > 0 ? residences[0].id : null);

  // Assign workplace if employed
  const workBuildingId = hasJob && workplaces.length > 0 ? workplaces[0].id : null;

  // Friend buildings: other residences (up to 3)
  const friendBuildingIds = residences
    .filter(r => r.id !== homeBuildingId)
    .slice(0, 3)
    .map(r => r.id);

  // Personality-derived wake/bed times (mirrors NPCScheduleSystem)
  const wakeHour = Math.max(4, Math.min(7, 6 - (p.conscientiousness - 0.5)));
  const bedtimeHour = Math.max(20, Math.min(23, 20 + (p.extroversion - 0.5) * 2 - (p.conscientiousness - 0.5)));

  const blocks: NPCScheduleBlockIR[] = [];

  // Sleep: bedtime → 24 and 0 → wake
  blocks.push({ startHour: bedtimeHour, endHour: 24, activity: 'sleep', buildingId: homeBuildingId, priority: 0 });
  blocks.push({ startHour: 0, endHour: wakeHour, activity: 'sleep', buildingId: homeBuildingId, priority: 0 });

  if (hasJob && workBuildingId) {
    // Employed schedule
    const workStart = Math.max(wakeHour + 0.5, 8 - (p.conscientiousness - 0.5) * 0.5);
    const lunchHour = (workStart + 17) / 2; // midpoint
    const workEnd = Math.min(bedtimeHour - 1, 17 + (p.conscientiousness - 0.5) * 0.5);

    // Morning at home
    blocks.push({ startHour: wakeHour, endHour: workStart, activity: 'idle_at_home', buildingId: homeBuildingId, priority: 1 });
    // Morning work
    blocks.push({ startHour: workStart, endHour: lunchHour, activity: 'work', buildingId: workBuildingId, priority: 2 });
    // Lunch
    const lunchBuildingId = p.conscientiousness > 0.6 ? workBuildingId : null;
    blocks.push({ startHour: lunchHour, endHour: lunchHour + 1, activity: 'eat', buildingId: lunchBuildingId, priority: 2 });
    // Afternoon work
    blocks.push({ startHour: lunchHour + 1, endHour: workEnd, activity: 'work', buildingId: workBuildingId, priority: 2 });
    // Evening free time
    const eveningActivity = pickEveningActivity(p);
    const eveningBuildingId = eveningActivity === 'visit_friend' && friendBuildingIds.length > 0
      ? friendBuildingIds[0]
      : eveningActivity === 'idle_at_home' ? homeBuildingId
      : null;
    blocks.push({ startHour: workEnd, endHour: bedtimeHour, activity: eveningActivity, buildingId: eveningBuildingId, priority: 1 });
  } else {
    // Unemployed schedule
    // Morning
    const morningEnd = 10;
    const morningActivity: NPCScheduleBlockIR['activity'] = p.neuroticism > 0.6 ? 'idle_at_home' : 'wander';
    blocks.push({ startHour: wakeHour, endHour: morningEnd, activity: morningActivity, buildingId: morningActivity === 'idle_at_home' ? homeBuildingId : null, priority: 1 });
    // Midday
    blocks.push({ startHour: morningEnd, endHour: 12, activity: 'shop', buildingId: null, priority: 1 });
    // Lunch
    blocks.push({ startHour: 12, endHour: 13, activity: 'eat', buildingId: homeBuildingId, priority: 1 });
    // Afternoon
    const afternoonActivity = pickEveningActivity(p);
    const afternoonBuildingId = afternoonActivity === 'visit_friend' && friendBuildingIds.length > 0
      ? friendBuildingIds[0]
      : afternoonActivity === 'idle_at_home' ? homeBuildingId
      : null;
    blocks.push({ startHour: 13, endHour: 17, activity: afternoonActivity, buildingId: afternoonBuildingId, priority: 1 });
    // Evening
    const eveningActivity = pickEveningActivity(p);
    const eveningBuildingId = eveningActivity === 'idle_at_home' ? homeBuildingId : null;
    blocks.push({ startHour: 17, endHour: bedtimeHour, activity: eveningActivity, buildingId: eveningBuildingId, priority: 1 });
  }

  // Sort blocks by startHour for consistent ordering
  blocks.sort((a, b) => a.startHour - b.startHour);

  return {
    homeBuildingId,
    workBuildingId,
    friendBuildingIds,
    blocks,
    wakeHour,
    bedtimeHour,
  };
}

/**
 * Pick an evening/free-time activity based on personality weights.
 * Mirrors the NPCScheduleSystem's pickEveningGoal weighting.
 */
function pickEveningActivity(p: {
  openness: number;
  conscientiousness: number;
  extroversion: number;
  agreeableness: number;
  neuroticism: number;
}): NPCScheduleBlockIR['activity'] {
  const socialWeight = p.extroversion * 0.5 + p.agreeableness * 0.3;
  const exploreWeight = Math.max(0, p.openness * 0.4 - p.neuroticism * 0.2);
  const homeWeight = (1 - p.extroversion) * 0.3 + p.neuroticism * 0.3 + (1 - p.openness) * 0.1;

  if (socialWeight >= exploreWeight && socialWeight >= homeWeight) {
    return p.agreeableness > 0.5 ? 'visit_friend' : 'socialize';
  }
  if (exploreWeight >= homeWeight) {
    return 'wander';
  }
  return 'idle_at_home';
}

// ═════════════════════════════════════════════
// Main IR Generator
// ═════════════════════════════════════════════

export async function generateWorldIR(
  worldId: string,
  engine: TargetEngine = 'babylon',
  options?: { aiProvider?: 'cloud' | 'local' }
): Promise<WorldIR> {
  console.log(`[Export] Starting IR generation for world ${worldId}...`);
  
  // Ensure storage is initialized before parallel queries
  console.log(`[Export] Initializing storage connection...`);
  await (storage as any).connect?.();
  
  // ── 1. Fetch all world data in parallel ──
  console.log(`[Export] Fetching world data (11 parallel queries, skipping base rules/actions for performance)...`);
  const startTime = Date.now();
  
  let [
    world,
    countries,
    states,
    allSettlements,
    characters,
    worldRules,
    // Skip baseRules for now due to performance issues
    worldActions,
    // Skip baseActions for now due to performance issues
    quests,
    truths,
    grammars,
    languages,
    worldItems,
    waterFeatures,
    gameTexts,
  ] = await Promise.all([
    storage.getWorld(worldId).then(r => { console.log(`[Export] ✓ getWorld`); return r; }),
    storage.getCountriesByWorld(worldId).then(r => { console.log(`[Export] ✓ getCountriesByWorld`); return r; }),
    storage.getStatesByWorld(worldId).then(r => { console.log(`[Export] ✓ getStatesByWorld`); return r; }),
    storage.getSettlementsByWorld(worldId).then(r => { console.log(`[Export] ✓ getSettlementsByWorld`); return r; }),
    storage.getCharactersByWorld(worldId).then(r => { console.log(`[Export] ✓ getCharactersByWorld`); return r; }),
    storage.getRulesByWorld(worldId).then(r => { console.log(`[Export] ✓ getRulesByWorld`); return r; }),
    // Skip baseRules - Promise.resolve([]).then(r => { console.log(`[Export] ✓ getBaseRules (skipped)`); return r; }),
    storage.getActionsByWorld(worldId).then(r => { console.log(`[Export] ✓ getActionsByWorld`); return r; }),
    // Skip baseActions - Promise.resolve([]).then(r => { console.log(`[Export] ✓ getBaseActions (skipped)`); return r; }),
    storage.getQuestsByWorld(worldId).then(r => { console.log(`[Export] ✓ getQuestsByWorld`); return r; }),
    storage.getTruthsByWorld(worldId).then(r => { console.log(`[Export] ✓ getTruthsByWorld`); return r; }),
    storage.getGrammarsByWorld(worldId).then(r => { console.log(`[Export] ✓ getGrammarsByWorld`); return r; }),
    storage.getWorldLanguagesByWorld(worldId).then(r => { console.log(`[Export] ✓ getWorldLanguagesByWorld`); return r; }),
    storage.getItemsByWorld(worldId).then(r => { console.log(`[Export] ✓ getItemsByWorld`); return r; }),
    storage.getWaterFeaturesByWorld(worldId).then(r => { console.log(`[Export] ✓ getWaterFeaturesByWorld`); return r; }),
    storage.getGameTextsByWorld(worldId).then(r => { console.log(`[Export] ✓ getGameTextsByWorld`); return r; }),
  ]);
  
  const parallelTime = Date.now() - startTime;
  console.log(`[Export] All parallel queries completed in ${parallelTime}ms`);

  if (!world) {
    throw new Error(`World ${worldId} not found`);
  }

  // Filter out disabled base items from the export
  const disabledBaseItems = new Set<string>(world.config?.disabledBaseItems || []);
  if (disabledBaseItems.size > 0) {
    worldItems = worldItems.filter((item: any) => !item.isBase || !disabledBaseItems.has(item.id));
  }

  // Fetch asset collection snapshot and visual assets
  console.log(`[Export] Fetching assets and building manifest...`);
  const assetStartTime = Date.now();
  const assetCollectionId = world.selectedAssetCollectionId;
  let world3DConfig: any = null;
  // Maps MongoDB asset IDs → export-relative file paths so the exported game
  // can resolve texture/model references without an API server
  const assetIdToPath: Record<string, string> = {};
  try {
    const { getWorld3DConfigForWorld } = await import(/* webpackIgnore: true */ '../asset-collection-resolver.js' as any);
    world3DConfig = await getWorld3DConfigForWorld(worldId);
    console.log(`[Export] ✓ getWorld3DConfigForWorld`);
  } catch (e) {
    console.warn(`[Export] ⚠ Failed to load world3DConfig:`, (e as Error).message);
  }

  const [collectionSnapshot, worldAssets] = await Promise.all([
    assetCollectionId ? loadCollectionSnapshot(assetCollectionId).then(r => { console.log(`[Export] ✓ loadCollectionSnapshot`); return r; }) : Promise.resolve(null),
    storage.getVisualAssetsByWorld(worldId).then(r => { console.log(`[Export] ✓ getVisualAssetsByWorld`); return r; }),
  ]);

  // Build asset manifest using the 3-tier fallback strategy
  console.log(`[Export] Building asset manifest...`);
  const { manifest: assetManifest } = await buildWorldAssetManifest(worldId, engine, world);
  console.log(`[Export] ✓ Asset manifest built`);

  // Build asset ID → file path mapping from visual assets
  for (const asset of worldAssets) {
    const id = asset.id || (asset as any)._id?.toString();
    if (id && asset.filePath) {
      let exportPath = asset.filePath;
      if (exportPath.startsWith('/')) exportPath = '.' + exportPath;
      assetIdToPath[id] = exportPath;
    }
  }

  // Also map assets referenced by the asset collection's worldTypeConfig.
  // These are global assets (not per-world) so getVisualAssetsByWorld misses them.
  if (collectionSnapshot || world3DConfig) {
    // Extract all asset IDs from world3DConfig
    const configAssetIds = new Set<string>();
    const extractIds = (obj: any, depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 10) return;
      if (Array.isArray(obj)) { for (const item of obj) extractIds(item, depth + 1); return; }
      for (const [key, value] of Object.entries(obj)) {
        if (!value) continue;
        // Direct string ObjectID values (e.g. wallTextureId, roofTextureId, assetId)
        if (typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value) &&
            (key.toLowerCase().includes('textureid') || key.toLowerCase().includes('assetid'))) {
          configAssetIds.add(value);
        } else if (typeof value === 'object') {
          const v = value as any;
          if (v.assetId && typeof v.assetId === 'string' && /^[0-9a-fA-F]{24}$/.test(v.assetId)) {
            configAssetIds.add(v.assetId);
          }
          if (v.textureId && typeof v.textureId === 'string' && /^[0-9a-fA-F]{24}$/.test(v.textureId)) {
            configAssetIds.add(v.textureId);
          }
          extractIds(v, depth + 1);
        }
      }
    };
    if (collectionSnapshot) {
      const collection = await storage.getAssetCollection(assetCollectionId!);
      if (collection?.worldTypeConfig) extractIds(collection.worldTypeConfig);
    }
    // Also extract from flattened world3DConfig
    if (world3DConfig) extractIds(world3DConfig);
    // Fetch and map any not already in assetIdToPath
    const missingIds = [...configAssetIds].filter(id => !assetIdToPath[id]);
    if (missingIds.length > 0) {
      const extraAssets = await storage.getVisualAssetsByIds(missingIds);
      for (const asset of extraAssets) {
        const id = asset.id || (asset as any)._id?.toString();
        if (id && asset.filePath) {
          let exportPath = asset.filePath;
          if (exportPath.startsWith('/')) exportPath = '.' + exportPath;
          assetIdToPath[id] = exportPath;
        }
      }
      console.log(`[Export] Added ${extraAssets.length} collection asset ID mappings`);
    }
  }
  console.log(`[Export] Built asset ID mapping: ${Object.keys(assetIdToPath).length} entries`);

  const assetTime = Date.now() - assetStartTime;
  console.log(`[Export] Asset fetching and manifest completed in ${assetTime}ms`);

  // ── 2. Derive configuration ──
  const worldType = (world.config as any)?.worldType || (world as any).worldType || '';
  const gameType = (world.config as any)?.gameType || 'rpg';
  const genreConfig = getGenreConfig(gameType);
  const seed = worldId; // Use worldId as the deterministic seed
  const theme = computeWorldVisualTheme(worldType);
  const buildingStyle = getBuildingStyleForWorldType(worldType);

  // Limit settlements for 3D
  const settlements = allSettlements.slice(0, MAX_SETTLEMENTS_3D);

  // Fetch businesses for all settlements
  const businessPromises = settlements.map(s => storage.getBusinessesBySettlement(s.id));
  const businessArrays = await Promise.all(businessPromises);
  const allBusinesses = businessArrays.flat();

  // Fetch occupations for all businesses (for building occupantIds)
  const occupationPromises = allBusinesses.map(b => storage.getOccupationsByBusiness(b.id));
  const occupationArrays = await Promise.all(occupationPromises);
  const allOccupations = occupationArrays.flat();

  // Build lookup: businessId → active occupation characterIds
  const activeOccupantsByBusiness = new Map<string, string[]>();
  for (const occ of allOccupations) {
    if (occ.endYear != null) continue; // skip ended occupations
    const list = activeOccupantsByBusiness.get(occ.businessId) || [];
    list.push(occ.characterId);
    activeOccupantsByBusiness.set(occ.businessId, list);
  }

  // Fetch residences for all settlements
  const residencePromises = settlements.map(s => storage.getResidencesBySettlement(s.id));
  const residenceArrays = await Promise.all(residencePromises);
  const allResidences = residenceArrays.flat();

  // Fetch public buildings for all settlements
  const publicBuildingPromises = settlements.map(s => storage.getPublicBuildingsBySettlement(s.id));
  const publicBuildingArrays = await Promise.all(publicBuildingPromises);
  const allPublicBuildings = publicBuildingArrays.flat();

  // Build lookup: lotId → residentIds
  const residentsByLot = new Map<string, string[]>();
  for (const res of allResidences) {
    if (res.lotId && Array.isArray(res.residentIds) && res.residentIds.length > 0) {
      residentsByLot.set(res.lotId, res.residentIds);
    }
  }

  // Fetch lots per settlement (sequential to avoid overloading DB)
  const lotsBySettlement = new Map<string, any[]>();
  for (const s of allSettlements) {
    const lots = await storage.getLotsBySettlement(s.id);
    lotsBySettlement.set(s.id, lots);
  }

  // ── 3. Geography: compute spatial layout ──
  const terrainSize = calculateOptimalWorldSize({
    countryCount: countries.length,
    stateCount: states.length,
    settlementCount: settlements.length,
  });

  const half = terrainSize / 2;
  const worldBounds: BoundsIR = {
    minX: -half, maxX: half,
    minZ: -half, maxZ: half,
    centerX: 0, centerZ: 0,
  };

  // ── 3a. Generate terrain heightmap & features ──
  // Determine dominant terrain type from settlements, default to 'plains'
  const dominantTerrain = inferDominantTerrain(settlements);
  const terrainGenerator = new TerrainGenerator();
  const TERRAIN_RESOLUTION = 128;
  const heightmap = terrainGenerator.generateHeightmap({
    seed,
    width: terrainSize,
    height: terrainSize,
    terrainType: dominantTerrain,
    resolution: TERRAIN_RESOLUTION,
  });
  const stampedFeatures = terrainGenerator.stampFeatures(heightmap, dominantTerrain, seed);
  const slopeMap = terrainGenerator.deriveSlopeMap(heightmap);

  // Convert stamped features to IR format (grid coords → world coords)
  const terrainFeatureIRs: TerrainFeatureIR[] = stampedFeatures.map(f =>
    terrainFeatureToIR(f, TERRAIN_RESOLUTION, terrainSize),
  );

  // ── 3b. Generate biome zones from heightmap ──
  const biomeZoneIRs = generateBiomeZones(heightmap, dominantTerrain);

  // Distribute countries in grid
  const countryBoundsArr = distributeInGrid(countries.length, worldBounds, 20);
  const countryIRs: CountryIR[] = countries.map((c, i) => ({
    id: c.id,
    name: c.name,
    description: c.description || null,
    governmentType: c.governmentType || null,
    economicSystem: c.economicSystem || null,
    socialStructure: (c.socialStructure as Record<string, any>) || {},
    culture: (c.culture as Record<string, any>) || {},
    culturalValues: (c.culturalValues as Record<string, any>) || {},
    laws: (c.laws as any[]) || [],
    alliances: (c.alliances as string[]) || [],
    enemies: (c.enemies as string[]) || [],
    foundedYear: c.foundedYear || null,
    bounds: countryBoundsArr[i] || worldBounds,
  }));

  // Distribute states within their country bounds
  const stateIRs: StateIR[] = [];
  const countryStatesMap = new Map<string, State[]>();
  for (const s of states) {
    const list = countryStatesMap.get(s.countryId) || [];
    list.push(s);
    countryStatesMap.set(s.countryId, list);
  }
  for (const cIR of countryIRs) {
    const cStates = countryStatesMap.get(cIR.id) || [];
    const stateBoundsArr = distributeInGrid(cStates.length, cIR.bounds, 5);
    for (let i = 0; i < cStates.length; i++) {
      const s = cStates[i];
      stateIRs.push({
        id: s.id,
        countryId: s.countryId,
        name: s.name,
        description: s.description || null,
        stateType: s.stateType || null,
        terrain: null,
        foundedYear: s.foundedYear || null,
        governorId: s.governorId || null,
        bounds: stateBoundsArr[i] || cIR.bounds,
      });
    }
  }

  // Place settlements within their territory
  const placedSettlementMap = new Map<string, PlacedSettlement>();

  // Group settlements by state (or by country if no state)
  const settlementsByTerritory = new Map<string, Settlement[]>();
  for (const s of settlements) {
    const key = s.stateId || s.countryId || '__world__';
    const list = settlementsByTerritory.get(key) || [];
    list.push(s);
    settlementsByTerritory.set(key, list);
  }

  for (const [territoryId, setts] of Array.from(settlementsByTerritory.entries())) {
    // Find bounds for this territory
    let bounds = worldBounds;
    const stateIR = stateIRs.find(s => s.id === territoryId);
    if (stateIR) bounds = stateIR.bounds;
    else {
      const countryIR = countryIRs.find(c => c.id === territoryId);
      if (countryIR) bounds = countryIR.bounds;
    }

    const placed = distributeSettlements(setts, bounds, seed, territoryId);
    for (const p of placed) {
      placedSettlementMap.set(p.id, p);
    }
  }

  // Build settlement IRs with lots
  const settlementIRs: SettlementIR[] = [];
  const allBuildingIRs: BuildingIR[] = [];
  const allRoadIRs: RoadIR[] = [];

  for (const s of settlements) {
    const placed = placedSettlementMap.get(s.id);
    if (!placed) continue;

    const pop = s.population || 100;
    const buildingCount = Math.ceil(pop / 4);
    const lots = lotsBySettlement.get(s.id) || [];
    const allSettlementBusinesses = allBusinesses.filter((b: any) => b.settlementId === s.id);

    // Filter businesses to only eligible building types for this settlement
    const terrainTag = '' as string;
    const geography: GeographyTag[] = (['coast', 'river', 'mountains', 'forest'] as GeographyTag[])
      .filter(g => terrainTag === g || terrainTag.includes(g));
    const eligible = new Set(getEligibleBuildingTypes(
      s.settlementType || 'town', pop, s.foundedYear, geography,
    ));
    const settlementBusinesses = allSettlementBusinesses.filter(
      (b: any) => !b.businessType || eligible.has(b.businessType),
    );

    // ── 1. Generate street network FIRST so lot positions follow street layout ──
    const sType = s.settlementType || 'town';
    const rawStreetNetwork = generateStreetNetwork({
      centerX: placed.position.x,
      centerZ: placed.position.z,
      settlementType: sType as any,
      foundedYear: s.foundedYear || 1900,
      seed: `${seed}_${s.id}`,
      streetPatternOverride: (s.streetPattern || undefined) as any,
      population: pop,
    });

    // ── 2. Generate lot positions from street network ──
    // Use grid-block placement for grid layouts, street-edge placement for others
    const networkPattern = (rawStreetNetwork as any).pattern as string | undefined;
    const isGridPattern = !networkPattern || networkPattern === 'grid';
    const streetLotPlacements = isGridPattern
      ? placeLots(rawStreetNetwork, buildingCount, `${seed}_${s.id}`, sType)
      : placeLotsAlongStreets(rawStreetNetwork, buildingCount, `${seed}_${s.id}`, sType, networkPattern);

    // Convert street-network lot placements to Vec3 positions with metadata.
    // Use street-network positions first; fill any remaining slots with the old grid generator.
    const streetLotPositions: Vec3[] = streetLotPlacements.map(lp => ({
      x: lp.x, y: 0, z: lp.z,
    }));
    let lotPositions: Vec3[];
    if (streetLotPositions.length >= buildingCount) {
      lotPositions = streetLotPositions;
    } else {
      // Street network didn't produce enough — pad with old grid positions
      const fallbackPositions = generateLotPositions(placed.position, buildingCount, seed, s.id);
      lotPositions = [
        ...streetLotPositions,
        ...fallbackPositions.slice(streetLotPositions.length),
      ];
    }

    // Resolve topological lots to positions using the layout resolver
    const hasTopology = lots.some((lot: any) => lot.blockCol != null && lot.blockRow != null);
    if (hasTopology) {
      const { resolveGridLotPosition } = await import('../../../shared/layout-resolver');
      let maxCol = 0, maxRow = 0;
      for (const lot of lots) {
        if (lot.blockCol != null) maxCol = Math.max(maxCol, lot.blockCol);
        if (lot.blockRow != null) maxRow = Math.max(maxRow, lot.blockRow);
      }
      const gridSize = Math.max(maxCol, maxRow) + 2;
      const layoutConfig = { gridSize, settlementType: s.settlementType || 'hamlet', centerX: placed.position.x, centerZ: placed.position.z };
      for (const lot of lots) {
        if (lot.blockCol != null && lot.blockRow != null && lot.lotIndex != null) {
          const pos = resolveGridLotPosition(lot.blockCol, lot.blockRow, lot.lotIndex, layoutConfig);
          lot.positionX = pos.x;
          lot.positionZ = pos.z;
          lot.facingAngle = pos.facingAngle;
          lot.lotWidth = pos.lotWidth;
          lot.lotDepth = pos.lotDepth;
        }
      }
    }

    // Map lots using persisted spatial data when available, falling back to street-network positions
    const lotIRs: LotIR[] = lots.map((lot, i) => {
      const hasPersistedPosition = lot.positionX != null && lot.positionZ != null;
      const streetLot = streetLotPlacements[i];
      const position: Vec3 = hasPersistedPosition
        ? { x: lot.positionX!, y: lot.elevation || 0, z: lot.positionZ! }
        : lotPositions[i] || { x: placed.position.x, y: 0, z: placed.position.z };

      return {
        id: lot.id,
        address: lot.address || '',
        houseNumber: streetLot?.houseNumber ?? lot.houseNumber ?? i + 1,
        streetName: streetLot?.streetName ?? lot.streetName ?? 'Main Street',
        block: lot.block || null,
        districtName: lot.districtName || null,
        position,
        facingAngle: streetLot?.facingAngle ?? lot.facingAngle ?? 0,
        elevation: lot.elevation || 0,
        buildingType: lot.buildingType || null,
        buildingId: lot.buildingId || null,
        lotWidth: streetLot?.lotWidth ?? lot.lotWidth ?? 12,
        lotDepth: streetLot?.lotDepth ?? lot.lotDepth ?? 16,
        streetEdgeId: streetLot?.streetId ?? lot.streetEdgeId ?? null,
        distanceAlongStreet: lot.distanceAlongStreet ?? 0,
        side: (streetLot?.side ?? lot.side) === 'right' ? 'right' as const : 'left' as const,
        blockId: lot.blockId || null,
        neighboringLotIds: (lot.neighboringLotIds as string[]) || [],
        distanceFromDowntown: lot.distanceFromDowntown || 0,
        formerBuildingIds: (lot.formerBuildingIds as string[]) || [],
        foundationType: lot.foundationType || 'flat',
      };
    });

    // Generate buildings using lot data for placement when available
    const totalBuildingSlots = Math.max(buildingCount, lotPositions.length);
    for (let i = 0; i < Math.min(buildingCount, totalBuildingSlots); i++) {
      const lotIR = lotIRs[i] || null;
      const streetLot = streetLotPlacements[i];
      const pos = lotIR ? lotIR.position : lotPositions[i];
      const rotation = lotIR ? lotIR.facingAngle : (streetLot?.facingAngle ?? 0);
      const business: any = settlementBusinesses[i] || null;
      const spec = getBuildingSpec(business?.businessType || null);
      const buildingId = business ? `bld_${business.id}` : `bld_${s.id}_${i}`;

      // Build occupantIds from DB data
      let occupantIds: string[] = [];
      if (business) {
        // Business building: ownerId first, then active employee characterIds
        const employeeIds = activeOccupantsByBusiness.get(business.id) || [];
        if (business.ownerId) {
          occupantIds = [business.ownerId, ...employeeIds.filter((id: string) => id !== business.ownerId)];
        } else {
          occupantIds = employeeIds;
        }
      } else if (lotIR?.id) {
        // Residence building: use residentIds from residence matched by lotId
        occupantIds = residentsByLot.get(lotIR.id) || [];
      }
      // Remove nulls and duplicates
      occupantIds = Array.from(new Set(occupantIds.filter(Boolean)));

      allBuildingIRs.push({
        id: buildingId,
        settlementId: s.id,
        lotId: lotIR?.id || null,
        position: pos,
        rotation,
        spec,
        style: buildingStyle,
        occupantIds,
        interior: null,
        businessId: business?.id || null,
        modelAssetKey: resolveBuildingModel(engine, collectionSnapshot, spec.buildingRole),
      });
    }

    // Prune streets that have no buildings nearby
    const lotStreetNames = lotIRs.map(l => l.streetName);
    const lotPositionsList = lotIRs.map(l => ({ x: l.position.x, z: l.position.z }));
    const streetNetwork = pruneUnusedStreets(rawStreetNetwork, lotStreetNames, lotPositionsList);

    // Convert street segments to internal road IRs (polyline waypoints)
    const internalRoads: RoadIR[] = streetNetwork.segments.map(seg => ({
      fromId: seg.nodeIds[0],
      toId: seg.nodeIds[seg.nodeIds.length - 1],
      waypoints: seg.waypoints.map(wp => ({ x: wp.x, y: 0, z: wp.z })),
      width: seg.width,
      materialKey: null,
    }));

    // Build full street network IR with topology
    const settlementType = (s.settlementType as 'village' | 'town' | 'city') || 'town';
    const streetNetworkIR: StreetNetworkIR = {
      layout: chooseLayout(settlementType, s.foundedYear || 1900),
      nodes: streetNetwork.nodes.map(n => ({
        id: n.id,
        position: { x: n.x, y: 0, z: n.z },
        intersectionOf: n.intersectionOf,
      })),
      segments: streetNetwork.segments.map(seg => ({
        id: seg.id,
        name: seg.name,
        direction: seg.direction,
        nodeIds: seg.nodeIds,
        waypoints: seg.waypoints.map(wp => ({ x: wp.x, y: 0, z: wp.z })),
        width: seg.width,
      })),
    };

    // Also add street-segment roads to the global roads list
    for (const road of internalRoads) {
      allRoadIRs.push(road);
    }

    // Compute elevation profile from the generated heightmap
    const elevationProfile: ElevationProfileIR | null = computeElevationProfile(
      { centerX: placed.position.x, centerZ: placed.position.z, radius: placed.radius },
      heightmap,
      terrainSize / 2,
    );

    settlementIRs.push({
      id: s.id,
      worldId: s.worldId,
      countryId: s.countryId || null,
      stateId: s.stateId || null,
      name: s.name,
      description: s.description || null,
      settlementType: s.settlementType,
      terrain: null,
      population: pop,
      foundedYear: s.foundedYear || null,
      founderIds: (s.founderIds as string[]) || [],
      mayorId: s.mayorId || null,
      position: placed.position,
      radius: placed.radius,
      elevationProfile,
      lots: lotIRs,
      businessIds: settlementBusinesses.map(b => b.id),
      internalRoads,
      infrastructure: [],
      streetNetwork: streetNetworkIR,
    });
  }

  // Inter-settlement roads via MST
  const settlementNodes = settlementIRs.map(s => ({ id: s.id, position: s.position }));
  const mstEdges = computeMST(settlementNodes);
  for (const edge of mstEdges) {
    const from = settlementNodes[edge.fromIdx];
    const to = settlementNodes[edge.toIdx];
    allRoadIRs.push({
      fromId: from.id,
      toId: to.id,
      waypoints: [from.position, to.position],
      width: ROAD_WIDTH,
      materialKey: null,
    });
  }

  // ── 3b. Water features ──
  const waterFeatureIRs: WaterFeatureIR[] = waterFeatures.map((wf: any) => ({
    id: wf.id,
    worldId: wf.worldId,
    type: wf.type,
    subType: wf.subType || 'fresh',
    name: wf.name,
    position: wf.position || { x: 0, y: 0, z: 0 },
    waterLevel: wf.waterLevel ?? 0,
    bounds: wf.bounds || { minX: 0, maxX: 0, minZ: 0, maxZ: 0, centerX: 0, centerZ: 0 },
    depth: wf.depth ?? 2,
    width: wf.width ?? 10,
    flowDirection: wf.flowDirection || null,
    flowSpeed: wf.flowSpeed ?? 0,
    shorelinePoints: wf.shorelinePoints || [],
    settlementId: wf.settlementId || null,
    biome: wf.biome || null,
    isNavigable: wf.isNavigable ?? true,
    isDrinkable: wf.isDrinkable ?? true,
    modelAssetKey: wf.modelAssetKey || null,
    color: wf.color || null,
    transparency: wf.transparency ?? 0.3,
  }));
  console.log(`[Export] ✓ ${waterFeatureIRs.length} water feature(s) converted to IR`);

  // Generate synthetic water bodies for coastal/landing settlements that lack one
  for (const sIR of settlementIRs) {
    const isCoastal = sIR.terrain === 'coast' || sIR.settlementType === 'landing';
    if (!isCoastal) continue;
    // Check if any water feature is already linked to this settlement
    const hasWater = waterFeatureIRs.some(wf =>
      wf.settlementId === sIR.id ||
      (Math.abs(wf.position.x - sIR.position.x) < sIR.radius * 2 &&
       Math.abs(wf.position.z - sIR.position.z) < sIR.radius * 2)
    );
    if (hasWater) continue;

    // Place a bay/inlet on the south side of the settlement (positive Z)
    const waterRadius = sIR.radius * 1.5;
    const waterCenterX = sIR.position.x;
    const waterCenterZ = sIR.position.z + sIR.radius + waterRadius * 0.4;
    waterFeatureIRs.push({
      id: `wf_${sIR.id}_bay`,
      worldId: sIR.worldId,
      type: 'bay',
      subType: 'salt',
      name: `${sIR.name} Bay`,
      position: { x: waterCenterX, y: -1, z: waterCenterZ },
      waterLevel: 0,
      bounds: {
        minX: waterCenterX - waterRadius,
        maxX: waterCenterX + waterRadius,
        minZ: waterCenterZ - waterRadius * 0.6,
        maxZ: waterCenterZ + waterRadius,
        centerX: waterCenterX,
        centerZ: waterCenterZ,
      },
      depth: 3,
      width: waterRadius * 2,
      flowDirection: null,
      flowSpeed: 0,
      shorelinePoints: generateBayShoreline(waterCenterX, waterCenterZ, waterRadius, sIR.position.z),
      settlementId: sIR.id,
      biome: 'coastal',
      isNavigable: true,
      isDrinkable: false,
      modelAssetKey: null,
      color: { r: 0.15, g: 0.35, b: 0.55 },
      transparency: 0.35,
    });
    console.log(`[Export] ✓ Generated synthetic bay for landing: ${sIR.name}`);
  }

  // ── 3c. Foliage & vegetation scatter ──
  const foliageLayerIRs = generateFoliageLayers({
    settlements: settlementIRs,
    heightmap,
    slopeMap,
    terrainSize,
    seed,
  });
  console.log(`[Export] ✓ ${foliageLayerIRs.length} foliage layer(s) generated across ${settlementIRs.length} settlement(s)`);

  // Build lookup: residence doc ID → building IR ID (via shared lotId)
  const residenceIdToBuildingId = new Map<string, string>();
  for (const res of allResidences) {
    if (!res.lotId) continue;
    const building = allBuildingIRs.find(b => b.lotId === res.lotId);
    if (building) {
      residenceIdToBuildingId.set(res.id, building.id);
    }
  }

  // ── 4. Characters & NPCs ──
  const characterIRs: CharacterIR[] = characters.map(c => ({
    id: c.id,
    worldId: c.worldId,
    firstName: c.firstName,
    middleName: c.middleName || null,
    lastName: c.lastName,
    suffix: c.suffix || null,
    gender: c.gender,
    isAlive: c.isAlive ?? true,
    birthYear: c.birthYear || null,
    personality: (c.personality as any) || { openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0 },
    physicalTraits: (c.physicalTraits as Record<string, any>) || {},
    mentalTraits: (c.mentalTraits as Record<string, any>) || {},
    skills: (c.skills as Record<string, number>) || {},
    relationships: (c.relationships as Record<string, any>) || {},
    socialAttributes: (c.socialAttributes as Record<string, any>) || {},
    coworkerIds: (c.coworkerIds as string[]) || [],
    friendIds: (c.friendIds as string[]) || [],
    neighborIds: (c.neighborIds as string[]) || [],
    immediateFamilyIds: (c.immediateFamilyIds as string[]) || [],
    extendedFamilyIds: (c.extendedFamilyIds as string[]) || [],
    parentIds: (c.parentIds as string[]) || [],
    childIds: (c.childIds as string[]) || [],
    spouseId: c.spouseId || null,
    genealogyData: (c.genealogyData as Record<string, any>) || {},
    currentLocation: c.currentLocation,
    occupation: c.occupation || null,
    status: c.status || null,
    homeResidenceId: (c as any).currentResidenceId || null,
  }));

  // Select NPCs (up to MAX_NPCS), ensuring business owners are always included
  const aliveCharacters = characters.filter(c => c.isAlive !== false);
  const businessOwnerIds = new Set(
    allBusinesses
      .filter((b: any) => b.ownerId && !b.isOutOfBusiness)
      .map((b: any) => b.ownerId as string)
  );
  // Partition: owners first, then remaining characters
  const ownerCharacters = aliveCharacters.filter(c => businessOwnerIds.has(c.id));
  const nonOwnerCharacters = aliveCharacters.filter(c => !businessOwnerIds.has(c.id));
  const npcCandidates = [
    ...ownerCharacters,
    ...nonOwnerCharacters.slice(0, Math.max(0, MAX_NPCS - ownerCharacters.length)),
  ];
  const npcRand = createSeededRandom(`${seed}_npcs`);

  // Build owner-to-business-type map for role assignment
  const ownerBusinessTypeMap = new Map<string, string>();
  for (const b of allBusinesses as any[]) {
    if (b.ownerId && !b.isOutOfBusiness) {
      ownerBusinessTypeMap.set(b.ownerId, b.businessType || '');
    }
  }

  const npcIRs: NPCIR[] = npcCandidates.map(c => {
    // Place NPC near a settlement
    const settlementIdx = Math.floor(npcRand() * Math.max(1, settlementIRs.length));
    const settlement = settlementIRs[settlementIdx] || settlementIRs[0];
    const offsetX = (npcRand() - 0.5) * (settlement?.radius || 20);
    const offsetZ = (npcRand() - 0.5) * (settlement?.radius || 20);
    const homePos: Vec3 = settlement
      ? { x: settlement.position.x + offsetX, y: 0, z: settlement.position.z + offsetZ }
      : { x: 0, y: 0, z: 0 };

    // Business owners get merchant role regardless of occupation text
    let role = assignNPCRole(c, quests);
    if (role === 'civilian' && ownerBusinessTypeMap.has(c.id)) {
      role = 'merchant';
    }
    const questIds = quests
      .filter(q => q.assignedByCharacterId === c.id)
      .map(q => q.id);

    const resolvedHomeBuildingId = (c as any).currentResidenceId
      ? residenceIdToBuildingId.get((c as any).currentResidenceId) || null
      : null;

    const schedule = buildNPCSchedule(
      {
        id: c.id,
        personality: c.personality as any,
        occupation: c.occupation,
        friendIds: (c.friendIds as string[]) || [],
        assignedHomeBuildingId: resolvedHomeBuildingId,
      },
      allBuildingIRs.map(b => ({ id: b.id, settlementId: b.settlementId, businessId: b.businessId, spec: b.spec })),
      settlement?.id || null,
    );

    return {
      characterId: c.id,
      role,
      homePosition: homePos,
      patrolRadius: 20,
      disposition: parseDisposition(c),
      settlementId: settlement?.id || null,
      questIds,
      greeting: null,
      schedule,
    };
  });

  // ── 5. Businesses ──
  const businessIRs: BusinessIR[] = allBusinesses.map((b: any) => ({
    id: b.id,
    settlementId: b.settlementId,
    name: b.name,
    businessType: b.businessType,
    ownerId: b.ownerId,
    founderId: b.founderId,
    isOutOfBusiness: b.isOutOfBusiness ?? false,
    foundedYear: b.foundedYear,
    lotId: b.lotId || null,
    vacancies: (b.vacancies as { day: string[]; night: string[] }) || { day: [], night: [] },
    businessData: (b.businessData as Record<string, any>) || {},
  }));

  // ── 6. Systems ──
  const ruleIRs: RuleIR[] = worldRules.map(r => ({
    id: r.id, name: r.name, description: r.description || null,
    content: r.content, isBase: r.isBase ?? false, sourceFormat: r.sourceFormat,
    ruleType: r.ruleType, category: r.category || null,
    priority: r.priority ?? 5, likelihood: r.likelihood ?? 1.0,
    tags: (r.tags as string[]) || [],
    isActive: r.isActive ?? true,
  }));

  const baseRuleIRs: RuleIR[] = []; // Skip base rules for now due to performance issues
  // const baseRuleIRs: RuleIR[] = baseRules.map(r => ({
  //   id: r.id, name: r.name, description: r.description || null,
  //   content: r.content, isBase: true, sourceFormat: r.sourceFormat,
  //   ruleType: r.ruleType, category: r.category || null,
  //   priority: r.priority ?? 5, likelihood: r.likelihood ?? 1.0,
  //   tags: (r.tags as string[]) || [],
  //   isActive: r.isActive ?? true,
  // }));

  const actionIRs: ActionIR[] = worldActions.map(a => ({
    id: a.id, name: a.name, description: a.description || null,
    isBase: a.isBase ?? false, sourceFormat: a.sourceFormat,
    actionType: a.actionType, category: a.category || null,
    duration: a.duration ?? 1, difficulty: a.difficulty ?? 0.5,
    energyCost: a.energyCost ?? 1,
    content: (a as any).content || (a as any).prologContent || null,
    targetType: a.targetType || null,
    requiresTarget: a.requiresTarget ?? false,
    range: a.range ?? 0,
    isAvailable: a.isAvailable ?? true,
    cooldown: a.cooldown ?? 0,
    verbPast: a.verbPast || null,
    verbPresent: a.verbPresent || null,
    narrativeTemplates: (a.narrativeTemplates as string[]) || [],
    customData: (a.customData as Record<string, any>) || {},
    tags: (a.tags as string[]) || [],
    isActive: a.isActive ?? true,
  }));

  const baseActionIRs: ActionIR[] = []; // Skip base actions for now due to performance issues
  // const baseActionIRs: ActionIR[] = baseActions.map(a => ({
  //   id: a.id, name: a.name, description: a.description || null,
  //   isBase: true, sourceFormat: a.sourceFormat,
  //   actionType: a.actionType, category: a.category || null,
  //   duration: a.duration ?? 1, difficulty: a.difficulty ?? 0.5,
  //   energyCost: a.energyCost ?? 1,
  //   content: (a as any).content || (a as any).prologContent || null,
  //   targetType: a.targetType || null,
  //   requiresTarget: a.requiresTarget ?? false,
  //   range: a.range || null,
  //   cooldown: a.cooldown || null,
  //   customData: (a.customData as Record<string, any>) || {},
  //   tags: (a.tags as string[]) || [],
  //   isActive: a.isActive ?? true,
  // }));

  const questIRs: QuestIR[] = quests.map(q => ({
    id: q.id, worldId: q.worldId,
    title: q.title, description: q.description,
    questType: q.questType, difficulty: q.difficulty,
    targetLanguage: q.targetLanguage,
    gameType: q.gameType || null,
    questChainId: q.questChainId || null,
    questChainOrder: q.questChainOrder || null,
    prerequisiteQuestIds: (q.prerequisiteQuestIds as string[]) || null,
    objectives: (q.objectives as any[]) || [],
    completionCriteria: (q.completionCriteria as Record<string, any>) || {},
    experienceReward: q.experienceReward ?? 0,
    rewards: (q.rewards as Record<string, any>) || {},
    itemRewards: (q.itemRewards as any) || null,
    skillRewards: (q.skillRewards as any) || null,
    unlocks: (q.unlocks as any) || null,
    failureConditions: (q.failureConditions as Record<string, any>) || null,
    assignedBy: q.assignedBy || null,
    assignedByCharacterId: q.assignedByCharacterId || null,
    locationId: (q as any).locationId || null,
    locationName: (q as any).locationName || null,
    locationPosition: (q as any).locationPosition || null,
    tags: (q.tags as string[]) || [],
    status: q.status || 'active',
    content: (q as any).content || (q as any).prologContent || null,
  }));

  const truthIRs: TruthIR[] = truths.map(t => ({
    id: t.id, worldId: t.worldId,
    characterId: t.characterId || null,
    title: t.title, content: t.content,
    entryType: t.entryType,
    timestep: t.timestep ?? 0,
    timestepDuration: t.timestepDuration ?? 1,
    timeYear: t.timeYear || null,
    timeSeason: t.timeSeason || null,
    timeDescription: t.timeDescription || null,
    relatedCharacterIds: (t.relatedCharacterIds as string[]) || [],
    relatedLocationIds: (t.relatedLocationIds as string[]) || [],
    tags: (t.tags as string[]) || [],
    importance: t.importance ?? 5,
    isPublic: t.isPublic ?? true,
    source: t.source || null,
  }));

  const grammarIRs: GrammarIR[] = grammars.map(g => ({
    id: g.id, worldId: g.worldId,
    name: g.name, description: g.description || null,
    grammar: (g.grammar as Record<string, string | string[]>) || {},
    tags: (g.tags as string[]) || [],
    worldType: g.worldType || null,
    gameType: g.gameType || null,
    isActive: g.isActive ?? true,
  }));

  const languageIRs: LanguageIR[] = languages.map(l => ({
    id: l.id, worldId: l.worldId,
    name: l.name, description: l.description || null,
    kind: l.kind,
    realCode: l.realCode || null,
    scopeType: l.scopeType,
    scopeId: l.scopeId,
    isPrimary: l.isPrimary,
    parentLanguageId: l.parentLanguageId || null,
    influenceLanguageIds: l.influenceLanguageIds || [],
    realInfluenceCodes: l.realInfluenceCodes || [],
    features: l.features || null,
    phonemes: l.phonemes || null,
    grammarRules: l.grammar || null,
    writingSystem: l.writingSystem || null,
    sampleWords: l.sampleWords || null,
  }));

  // ── 6b. Dialogue contexts (pre-built system prompts for NPC chat) ──
  const primaryLanguage = languageIRs.find(l => l.isPrimary) || null;
  const worldLanguageContext: WorldLanguageContext | undefined = primaryLanguage ? buildWorldLanguageContext(
    languageIRs as unknown as WorldLanguage[],
    gameType,
  ) : undefined;

  const dialogueContexts: NPCDialogueContext[] = npcIRs.map(npc => {
    const char = characters.find(c => c.id === npc.characterId);
    if (!char) return null;

    const charInfo: CharacterInfo = {
      firstName: char.firstName,
      lastName: char.lastName,
      age: char.birthYear ? new Date().getFullYear() - char.birthYear : null,
      gender: char.gender,
      occupation: char.occupation,
      currentLocation: char.currentLocation,
      personality: char.personality as Record<string, any>,
      friendIds: (char.friendIds as string[]) || [],
      coworkerIds: (char.coworkerIds as string[]) || [],
      spouseId: char.spouseId,
    };

    const charTruths: Truth[] = truths
      .filter(t => t.characterId === char.id || !t.characterId)
      .map(t => ({
        id: t.id,
        characterId: t.characterId,
        entryType: t.entryType,
        title: t.title,
        content: t.content,
        timestep: t.timestep,
      }));

    const systemPrompt = buildLanguageAwareSystemPrompt(charInfo, charTruths, worldLanguageContext);
    const voice = char.gender?.toLowerCase() === 'female' ? 'Kore' : 'Charon';

    return {
      characterId: char.id,
      characterName: `${char.firstName} ${char.lastName}`.trim(),
      systemPrompt,
      greeting: npc.greeting || `Hello, I'm ${char.firstName}.`,
      voice,
      truths: charTruths
        .filter(t => t.characterId === char.id)
        .map(t => ({ title: t.title || '', content: t.content || '' })),
    };
  }).filter((ctx): ctx is NPCDialogueContext => ctx !== null);

  const aiProviderChoice = options?.aiProvider || (process.env.AI_PROVIDER?.toLowerCase() === 'local' ? 'local' : 'cloud');
  const isLocal = aiProviderChoice === 'local';
  const aiConfig: AIConfigIR = {
    apiMode: isLocal ? 'local' : 'insimul',
    insimulEndpoint: '/api/gemini/chat',
    geminiModel: 'gemini-3.1-flash',
    geminiApiKeyPlaceholder: 'YOUR_GEMINI_API_KEY',
    voiceEnabled: true,
    defaultVoice: 'Kore',
    localModelPath: isLocal ? (process.env.LOCAL_MODEL_PATH || '') : undefined,
    localModelName: isLocal ? (process.env.LOCAL_MODEL_NAME || 'phi-4-mini-q4') : undefined,
  };

  // ── 7. Assets ──
  const textureAssets: AssetReferenceIR[] = worldAssets
    .filter(a => a.assetType?.includes('texture'))
    .map(a => ({
      id: a.id,
      role: (a.tags as string[])?.[0] || 'texture',
      babylonPath: a.filePath || '',
      assetType: a.assetType || 'texture',
      tags: (a.tags as string[]) || [],
    }));

  const modelAssets: AssetReferenceIR[] = worldAssets
    .filter(a => a.assetType?.includes('model') || a.assetType?.includes('3d'))
    .map(a => ({
      id: a.id,
      role: (a.tags as string[])?.[0] || 'model',
      babylonPath: a.filePath || '',
      assetType: a.assetType || 'model',
      tags: (a.tags as string[]) || [],
    }));

  const audioAssets: AssetReferenceIR[] = worldAssets
    .filter(a => a.assetType?.includes('audio') || a.assetType?.includes('sound'))
    .map(a => ({
      id: a.id,
      role: (a.tags as string[])?.[0] || 'audio',
      babylonPath: a.filePath || '',
      assetType: a.assetType || 'audio',
      tags: (a.tags as string[]) || [],
    }));

  const animationAssets = buildAnimationIRs(worldAssets);

  // ── 8. Assemble final IR ──
  const combatStyle = (genreConfig.combatStyle || 'melee') as CombatStyle;

  const ir: WorldIR = {
    meta: {
      insimulVersion: INSIMUL_VERSION,
      worldId: world.id,
      worldName: world.name,
      worldDescription: world.description || '',
      worldType,
      genreConfig,
      exportTimestamp: new Date().toISOString(),
      exportVersion: world.version ?? 1,
      seed,
      selectedAssetCollectionId: assetCollectionId || null,
      world3DConfig: world3DConfig || {},
      assetIdToPath,
    },

    geography: {
      terrainSize,
      worldScaleFactor: world.generationConfig?.worldScaleFactor ?? 1.0,
      heightmap,
      slopeMap,
      terrainFeatures: terrainFeatureIRs,
      biomeZones: biomeZoneIRs,
      countries: countryIRs,
      states: stateIRs,
      settlements: settlementIRs,
      waterFeatures: waterFeatureIRs,
      foliageLayers: foliageLayerIRs,
    },

    entities: {
      characters: characterIRs,
      npcs: npcIRs,
      buildings: allBuildingIRs,
      businesses: businessIRs,
      roads: allRoadIRs,
      natureObjects: [], // Populated by engine at runtime from biome data
      animals: generateAnimals(settlementIRs, seed),
      dungeons: [],      // Populated on demand per genre
      questObjects: generateQuestObjects(questIRs, allBuildingIRs, seed),
      containers: generateContainerPlacements(allBuildingIRs, businessIRs, seed),
    },

    systems: {
      rules: ruleIRs,
      baseRules: baseRuleIRs,
      actions: actionIRs,
      baseActions: baseActionIRs,
      quests: questIRs,
      truths: truthIRs,
      grammars: grammarIRs,
      languages: languageIRs,
      items: (worldItems || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || null,
        itemType: item.itemType || 'collectible',
        icon: item.icon || null,
        value: item.value || 0,
        sellValue: item.sellValue || 0,
        weight: item.weight || 1,
        tradeable: item.tradeable !== false,
        stackable: item.stackable !== false,
        maxStack: item.maxStack || 99,
        objectRole: item.objectRole || null,
        visualAssetId: item.visualAssetId || null,
        effects: item.effects || null,
        lootWeight: item.lootWeight || 0,
        tags: item.tags || [],
      })),
      lootTables: buildLootTables(worldItems || []),
      dialogueContexts,
      knowledgeBase: await buildKnowledgeBase(ruleIRs, actionIRs, questIRs, characters, {
        world,
        countries,
        states,
        settlements,
        businesses: allBusinesses,
        lotsBySettlement,
        truths,
        worldItems: worldItems || [],
        languages: languages || [],
        waterFeatures: waterFeatures || [],
        texts: gameTexts || [],
        residences: allResidences || [],
        containers: [],
        publicBuildings: allPublicBuildings || [],
      }),
      mainQuestLocations: buildMainQuestLocations(world),
      narrative: buildNarrativeIR(world, characters, settlements),
      texts: (gameTexts || []).map((t: any): TextIR => ({
        id: t.id,
        title: t.title,
        titleTranslation: t.titleTranslation || '',
        textCategory: t.textCategory || 'book',
        cefrLevel: t.cefrLevel || 'A1',
        pages: t.pages || [],
        vocabularyHighlights: t.vocabularyHighlights || [],
        comprehensionQuestions: t.comprehensionQuestions || [],
        targetLanguage: t.targetLanguage || '',
        authorName: t.authorName || null,
        clueText: t.clueText || null,
        difficulty: t.difficulty || 'easy',
        tags: t.tags || [],
        spawnLocationHint: t.spawnLocationHint || 'market',
        isMainQuest: (t.tags || []).includes('main-quest') || (t.tags || []).includes('writer-journal'),
      })),
    },

    theme: {
      visualTheme: theme,
      skyboxAssetKey: null,
      ambientLighting: {
        color: [1, 1, 1],
        intensity: 0.6,
      },
      directionalLight: {
        direction: [-1, -2, -1],
        intensity: 0.8,
      },
      fog: null,
    },

    assets: {
      collectionId: assetCollectionId || null,
      textures: textureAssets,
      models: modelAssets,
      audio: audioAssets,
      animations: animationAssets,
    },

    player: {
      startPosition: settlementIRs[0]?.position || { x: 0, y: 0, z: 0 },
      modelAssetKey: resolvePlayerModel(engine, collectionSnapshot),
      initialEnergy: INITIAL_ENERGY,
      initialGold: 0,
      initialHealth: 100,
      speed: genreConfig.defaultPlayerSpeed,
      jumpHeight: genreConfig.defaultJumpHeight,
      gravity: genreConfig.gravityMultiplier,
    },

    ui: {
      showMinimap: genreConfig.showMinimap,
      showHealthBar: genreConfig.showHealthBar,
      showStaminaBar: genreConfig.showStaminaBar,
      showAmmoCounter: genreConfig.showAmmoCounter,
      showCompass: genreConfig.showCompass,
      genreLayout: genreConfig.uiLayout,
      menuConfig: buildMenuConfig(world.name, genreConfig),
      questJournal: {
        enabled: true,
        maxTrackedQuests: 3,
        showQuestMarkers: genreConfig.showMinimap,
        autoTrackNew: true,
        sortOrder: 'newest',
        categories: ['conversation', 'translation', 'vocabulary', 'grammar', 'cultural'],
      },
    },

    combat: {
      style: combatStyle,
      settings: getCombatSettings(combatStyle),
    },

    survival: genreConfig.features.crafting || gameType === 'survival'
      ? buildSurvivalIR()
      : null,

    resources: genreConfig.features.resources || gameType === 'survival'
      ? {
          definitions: DEFAULT_RESOURCE_DEFS,
          gatheringNodes: generateGatheringNodes(settlementIRs, DEFAULT_RESOURCE_DEFS, terrainSize, seed),
        }
      : null,

    assessment: null,

    languageLearning: null,

    aiConfig,
  };

  return ir;
}

// ── Loot Table Builder ───────────────────────────────────────────────────

function buildLootTables(items: any[]): any[] {
  const lootItems = items.filter((item: any) => item.lootWeight > 0);
  if (lootItems.length === 0) return [];

  // Group by rarity tag to create tiered loot tables
  const common = lootItems.filter((i: any) => i.tags?.includes('loot:common'));
  const uncommon = lootItems.filter((i: any) => i.tags?.includes('loot:uncommon'));
  const rare = lootItems.filter((i: any) => i.tags?.includes('loot:rare'));

  // Create a generic loot table usable by any enemy type
  return [{
    enemyType: 'default',
    entries: lootItems.map((item: any) => ({
      itemId: item.id,
      itemName: item.name,
      dropChance: item.tags?.includes('loot:rare') ? 0.05
        : item.tags?.includes('loot:uncommon') ? 0.15
        : 0.3,
      minQuantity: 1,
      maxQuantity: item.stackable ? 3 : 1,
    })),
    goldMin: 1,
    goldMax: 20,
  }];
}

// ── Prolog Knowledge Base Builder ─────────────────────────────────────────

async function buildKnowledgeBase(
  rules: RuleIR[],
  actions: ActionIR[],
  quests: QuestIR[],
  characters: any[],
  worldData?: {
    world?: any;
    countries?: any[];
    states?: any[];
    settlements?: any[];
    businesses?: any[];
    lotsBySettlement?: Map<string, any[]>;
    truths?: any[];
    worldItems?: any[];
    languages?: any[];
    waterFeatures?: any[];
    texts?: any[];
    residences?: any[];
    containers?: any[];
    publicBuildings?: any[];
  },
): Promise<string | null> {
  const parts: string[] = [];

  parts.push('% Insimul Knowledge Base - Auto-generated for game export');
  parts.push(`% Generated: ${new Date().toISOString()}`);
  parts.push('');

  // NPC reasoning rules (lifecycle, social, emotional, decision-making)
  parts.push('% === NPC Reasoning Rules ===');
  parts.push(getNPCReasoningRules());
  parts.push('');

  // TotT social simulation predicates (hiring, social dynamics, economics, lifecycle)
  parts.push('% === TotT Social Simulation Predicates ===');
  parts.push(getTotTPredicates());
  parts.push('');

  // Advanced predicates (resources, probabilistic, abductive, meta, procedural)
  parts.push('% === Advanced Predicates ===');
  parts.push(getAdvancedPredicates());
  parts.push('');

  // ── World facts ──
  if (worldData?.world) {
    const w = worldData.world;
    const wId = sanitizeAtom(w.id || w._id?.toString() || 'world');
    parts.push('% === World Facts ===');
    parts.push(`world(${wId}).`);
    if (w.name) parts.push(`world_name(${wId}, '${escapeAtom(w.name)}').`);
    if (w.description) parts.push(`world_description(${wId}, '${escapeAtom(w.description.slice(0, 200))}').`);
    parts.push('');
  }

  // ── Country facts ──
  const countries = worldData?.countries || [];
  if (countries.length > 0) {
    parts.push('% === Country Facts ===');
    for (const c of countries) {
      const cId = sanitizeAtom(c.id || c._id?.toString());
      parts.push(`country(${cId}).`);
      if (c.name) parts.push(`country_name(${cId}, '${escapeAtom(c.name)}').`);
      if (c.governmentType) parts.push(`government_type(${cId}, ${sanitizeAtom(c.governmentType)}).`);
      if (c.economicSystem) parts.push(`economic_system(${cId}, ${sanitizeAtom(c.economicSystem)}).`);
      if (c.foundedYear) parts.push(`country_founded(${cId}, ${c.foundedYear}).`);
      if (c.description) parts.push(`country_description(${cId}, '${escapeAtom(c.description.slice(0, 300))}').`);
      // Alliances and enemies
      if (Array.isArray(c.alliances)) {
        for (const allyId of c.alliances) parts.push(`country_ally(${cId}, ${sanitizeAtom(allyId)}).`);
      }
      if (Array.isArray(c.enemies)) {
        for (const enemyId of c.enemies) parts.push(`country_enemy(${cId}, ${sanitizeAtom(enemyId)}).`);
      }
      // Culture and laws
      if (c.culture && typeof c.culture === 'object') {
        for (const [key, value] of Object.entries(c.culture)) {
          if (typeof value === 'string') {
            parts.push(`country_culture(${cId}, ${sanitizeAtom(key)}, '${escapeAtom(value)}').`);
          }
        }
      }
      if (c.culturalValues && typeof c.culturalValues === 'object') {
        for (const [key, value] of Object.entries(c.culturalValues)) {
          if (typeof value === 'string') {
            parts.push(`cultural_value(${cId}, ${sanitizeAtom(key)}, '${escapeAtom(value)}').`);
          } else if (typeof value === 'number') {
            parts.push(`cultural_value(${cId}, ${sanitizeAtom(key)}, ${value}).`);
          }
        }
      }
      if (Array.isArray(c.laws)) {
        for (const law of c.laws) {
          if (typeof law === 'string') {
            parts.push(`country_law(${cId}, '${escapeAtom(law)}').`);
          } else if (law?.name) {
            parts.push(`country_law(${cId}, '${escapeAtom(law.name)}').`);
          }
        }
      }
      // Social structure
      if (c.socialStructure && typeof c.socialStructure === 'object') {
        for (const [key, value] of Object.entries(c.socialStructure)) {
          if (typeof value === 'string') {
            parts.push(`social_structure(${cId}, ${sanitizeAtom(key)}, '${escapeAtom(value)}').`);
          }
        }
      }
    }
    parts.push('');
  }

  // ── State facts ──
  const states = worldData?.states || [];
  if (states.length > 0) {
    parts.push('% === State Facts ===');
    for (const s of states) {
      const sId = sanitizeAtom(s.id || s._id?.toString());
      parts.push(`state(${sId}).`);
      if (s.name) parts.push(`state_name(${sId}, '${escapeAtom(s.name)}').`);
      if (s.countryId) parts.push(`state_of_country(${sId}, ${sanitizeAtom(s.countryId)}).`);
      if (s.stateType) parts.push(`state_type(${sId}, ${sanitizeAtom(s.stateType)}).`);
      if (s.terrain) parts.push(`state_terrain(${sId}, ${sanitizeAtom(s.terrain)}).`);
      if (s.description) parts.push(`state_description(${sId}, '${escapeAtom(s.description.slice(0, 300))}').`);
      if (s.foundedYear) parts.push(`state_founded(${sId}, ${s.foundedYear}).`);
      if (s.governorId) parts.push(`state_governor(${sId}, ${sanitizeAtom(s.governorId)}).`);
      if (s.localGovernmentType) parts.push(`state_local_government(${sId}, ${sanitizeAtom(s.localGovernmentType)}).`);
      // Previous countries (annexation history)
      if (Array.isArray(s.previousCountryIds)) {
        for (const prevId of s.previousCountryIds) {
          parts.push(`state_previous_country(${sId}, ${sanitizeAtom(prevId)}).`);
        }
      }
    }
    parts.push('');
  }

  // ── Settlement facts ──
  const settlements = worldData?.settlements || [];
  if (settlements.length > 0) {
    parts.push('% === Settlement Facts ===');
    for (const s of settlements) {
      const sId = sanitizeAtom(s.id || s._id?.toString());
      parts.push(`settlement(${sId}).`);
      if (s.name) parts.push(`settlement_name(${sId}, '${escapeAtom(s.name)}').`);
      if (s.countryId) parts.push(`settlement_of_country(${sId}, ${sanitizeAtom(s.countryId)}).`);
      if (s.stateId) parts.push(`settlement_of_state(${sId}, ${sanitizeAtom(s.stateId)}).`);
      if (s.settlementType) parts.push(`settlement_type(${sId}, ${sanitizeAtom(s.settlementType)}).`);
      if (s.terrain) parts.push(`settlement_terrain(${sId}, ${sanitizeAtom(s.terrain)}).`);
      if (s.population) parts.push(`settlement_population(${sId}, ${s.population}).`);
      // Districts
      if (Array.isArray(s.districts)) {
        for (const d of s.districts) {
          const dName = typeof d === 'string' ? d : d?.name;
          if (dName) parts.push(`settlement_district(${sId}, '${escapeAtom(dName)}').`);
        }
      }
      // Streets
      if (Array.isArray(s.streets)) {
        for (const st of s.streets) {
          const stName = typeof st === 'string' ? st : st?.name;
          if (stName) parts.push(`settlement_street(${sId}, '${escapeAtom(stName)}').`);
        }
      }
      // Landmarks
      if (Array.isArray(s.landmarks)) {
        for (const lm of s.landmarks) {
          if (typeof lm === 'string') {
            parts.push(`settlement_landmark(${sId}, '${escapeAtom(lm)}').`);
          } else if (lm?.name) {
            parts.push(`settlement_landmark(${sId}, '${escapeAtom(lm.name)}').`);
            if (lm.type) parts.push(`landmark_type('${escapeAtom(lm.name)}', ${sanitizeAtom(lm.type)}).`);
          }
        }
      }
      // Demographic tracking
      if (Array.isArray(s.unemployedCharacterIds) && s.unemployedCharacterIds.length > 0) {
        parts.push(`settlement_unemployed_count(${sId}, ${s.unemployedCharacterIds.length}).`);
      }
      if (Array.isArray(s.deceasedCharacterIds) && s.deceasedCharacterIds.length > 0) {
        parts.push(`settlement_deceased_count(${sId}, ${s.deceasedCharacterIds.length}).`);
      }
      if (Array.isArray(s.vacantLotIds) && s.vacantLotIds.length > 0) {
        parts.push(`settlement_vacant_lots(${sId}, ${s.vacantLotIds.length}).`);
      }
    }
    parts.push('');
  }

  // ── Business facts ──
  const businesses = worldData?.businesses || [];
  if (businesses.length > 0) {
    parts.push('% === Business Facts ===');
    for (const b of businesses) {
      const bId = sanitizeAtom(b.id || b._id?.toString());
      parts.push(`business(${bId}).`);
      if (b.name) parts.push(`business_name(${bId}, '${escapeAtom(b.name)}').`);
      if (b.businessType) parts.push(`business_type(${bId}, ${sanitizeAtom(b.businessType)}).`);
      if (b.settlementId) parts.push(`business_of_settlement(${bId}, ${sanitizeAtom(b.settlementId)}).`);
      if (b.ownerId) parts.push(`business_owner(${bId}, ${sanitizeAtom(b.ownerId)}).`);
      if (b.isOutOfBusiness) parts.push(`business_out_of_business(${bId}).`);
    }
    parts.push('');
  }

  // ── Lot facts ──
  const lotsBySettlement = worldData?.lotsBySettlement;
  if (lotsBySettlement && lotsBySettlement.size > 0) {
    parts.push('% === Lot Facts ===');
    lotsBySettlement.forEach((lots) => {
      for (const lot of lots) {
        const lId = sanitizeAtom(lot.id || lot._id?.toString());
        parts.push(`lot(${lId}).`);
        if (lot.settlementId) parts.push(`lot_of_settlement(${lId}, ${sanitizeAtom(lot.settlementId)}).`);
        if (lot.address) parts.push(`lot_address(${lId}, '${escapeAtom(lot.address)}').`);
        if (lot.buildingType) parts.push(`lot_building_type(${lId}, ${sanitizeAtom(lot.buildingType)}).`);
      }
    });
    parts.push('');
  }

  // ── Character facts (expanded) ──
  parts.push('% === Character Facts ===');
  for (const char of characters) {
    const id = sanitizeAtom(`${char.firstName}_${char.lastName}_${char.id}`);
    parts.push(`person(${id}).`);
    if (char.firstName) parts.push(`first_name(${id}, '${escapeAtom(char.firstName)}').`);
    if (char.lastName) parts.push(`last_name(${id}, '${escapeAtom(char.lastName)}').`);
    if (char.age) parts.push(`age(${id}, ${char.age}).`);
    if (char.gender) parts.push(`gender(${id}, ${sanitizeAtom(char.gender)}).`);
    if (char.occupation) parts.push(`occupation(${id}, ${sanitizeAtom(char.occupation)}).`);
    if (char.isAlive !== false) parts.push(`alive(${id}).`);
    else parts.push(`dead(${id}).`);
    // Personality traits (Big Five)
    if (char.personality && typeof char.personality === 'object') {
      for (const [trait, value] of Object.entries(char.personality)) {
        if (typeof value === 'number') {
          parts.push(`personality(${id}, ${sanitizeAtom(trait)}, ${value}).`);
        }
      }
    }
    // Skills
    if (char.skills && typeof char.skills === 'object') {
      for (const [skill, level] of Object.entries(char.skills)) {
        if (typeof level === 'number') {
          parts.push(`skill(${id}, ${sanitizeAtom(skill)}, ${level}).`);
        }
      }
    }
    // Family relationships
    if (char.spouseId) parts.push(`married_to(${id}, ${sanitizeAtom(char.spouseId)}).`);
    if (Array.isArray(char.parentIds)) {
      for (const pid of char.parentIds) parts.push(`child_of(${id}, ${sanitizeAtom(pid)}).`);
    }
    if (Array.isArray(char.childIds)) {
      for (const cid of char.childIds) parts.push(`parent_of(${id}, ${sanitizeAtom(cid)}).`);
    }
    // Physical traits
    if (char.physicalTraits && typeof char.physicalTraits === 'object') {
      for (const [trait, value] of Object.entries(char.physicalTraits)) {
        if (typeof value === 'string') {
          parts.push(`physical_trait(${id}, ${sanitizeAtom(trait)}, '${escapeAtom(value)}').`);
        } else if (typeof value === 'boolean' && value) {
          parts.push(`physical_trait(${id}, ${sanitizeAtom(trait)}).`);
        } else if (typeof value === 'number') {
          parts.push(`physical_trait(${id}, ${sanitizeAtom(trait)}, ${value}).`);
        }
      }
    }
    // Mental traits
    if (char.mentalTraits && typeof char.mentalTraits === 'object') {
      for (const [trait, value] of Object.entries(char.mentalTraits)) {
        if (typeof value === 'string') {
          parts.push(`mental_trait(${id}, ${sanitizeAtom(trait)}, '${escapeAtom(value)}').`);
        } else if (typeof value === 'boolean' && value) {
          parts.push(`mental_trait(${id}, ${sanitizeAtom(trait)}).`);
        } else if (typeof value === 'number') {
          parts.push(`mental_trait(${id}, ${sanitizeAtom(trait)}, ${value}).`);
        }
      }
    }
    // Social attributes
    if (char.socialAttributes && typeof char.socialAttributes === 'object') {
      for (const [attr, value] of Object.entries(char.socialAttributes)) {
        if (typeof value === 'number') {
          parts.push(`social_attribute(${id}, ${sanitizeAtom(attr)}, ${value}).`);
        } else if (typeof value === 'string') {
          parts.push(`social_attribute(${id}, ${sanitizeAtom(attr)}, '${escapeAtom(value)}').`);
        }
      }
    }
    // Thoughts (recent thought history)
    if (Array.isArray(char.thoughts)) {
      for (const thought of char.thoughts.slice(-10)) { // last 10 thoughts
        if (typeof thought === 'string') {
          parts.push(`has_thought(${id}, '${escapeAtom(thought.slice(0, 200))}').`);
        } else if (thought && typeof thought === 'object' && thought.content) {
          parts.push(`has_thought(${id}, '${escapeAtom(String(thought.content).slice(0, 200))}').`);
        }
      }
    }
    // Mental models (beliefs about others)
    if (char.mentalModels && typeof char.mentalModels === 'object') {
      for (const [subject, model] of Object.entries(char.mentalModels)) {
        if (typeof model === 'string') {
          parts.push(`believes_about(${id}, ${sanitizeAtom(subject)}, '${escapeAtom(model.slice(0, 200))}').`);
        } else if (model && typeof model === 'object') {
          for (const [aspect, belief] of Object.entries(model as Record<string, any>)) {
            if (typeof belief === 'string') {
              parts.push(`believes_about(${id}, ${sanitizeAtom(subject)}, ${sanitizeAtom(aspect)}, '${escapeAtom(belief.slice(0, 200))}').`);
            }
          }
        }
      }
    }
    // Education and lifecycle
    if (char.collegeGraduate) parts.push(`college_graduate(${id}).`);
    if (char.retired) parts.push(`retired(${id}).`);
    if (char.departureYear) parts.push(`departure_year(${id}, ${char.departureYear}).`);
  }
  parts.push('');

  // ── Item facts ──
  const items = worldData?.worldItems || [];
  if (items.length > 0) {
    parts.push('% === Item Facts ===');
    for (const item of items) {
      const iId = sanitizeAtom(item.id || item._id?.toString());
      parts.push(`item(${iId}).`);
      if (item.name) parts.push(`item_name(${iId}, '${escapeAtom(item.name)}').`);
      if (item.itemType) parts.push(`item_type(${iId}, ${sanitizeAtom(item.itemType)}).`);
      if (item.value) parts.push(`item_value(${iId}, ${item.value}).`);
      if (item.weight) parts.push(`item_weight(${iId}, ${item.weight}).`);
      if (item.tradeable !== undefined) parts.push(`item_tradeable(${iId}, ${item.tradeable}).`);
    }
    parts.push('');
  }

  // ── Truth facts ──
  const truths = worldData?.truths || [];
  if (truths.length > 0) {
    parts.push('% === Truth Facts ===');
    for (const truth of truths) {
      const tId = sanitizeAtom(truth.id || truth._id?.toString());
      parts.push(`truth(${tId}).`);
      if (truth.title) parts.push(`truth_title(${tId}, '${escapeAtom(truth.title)}').`);
      if (truth.entryType) parts.push(`truth_type(${tId}, ${sanitizeAtom(truth.entryType)}).`);
      if (truth.characterId) parts.push(`truth_about(${tId}, ${sanitizeAtom(truth.characterId)}).`);
      if (truth.timestep != null) parts.push(`truth_timestep(${tId}, ${truth.timestep}).`);
      if (truth.importance) parts.push(`truth_importance(${tId}, ${truth.importance}).`);
      if (truth.isPublic !== undefined) parts.push(`truth_public(${tId}, ${truth.isPublic}).`);
    }
    parts.push('');
  }

  // ── Language facts ──
  const languages = worldData?.languages || [];
  if (languages.length > 0) {
    parts.push('% === Language Facts ===');
    for (const lang of languages) {
      const lId = sanitizeAtom(lang.id || lang._id?.toString());
      parts.push(`language(${lId}).`);
      if (lang.name) parts.push(`language_name(${lId}, '${escapeAtom(lang.name)}').`);
      if (lang.nativeName) parts.push(`language_native_name(${lId}, '${escapeAtom(lang.nativeName)}').`);
      if (lang.script) parts.push(`language_script(${lId}, ${sanitizeAtom(lang.script)}).`);
    }
    parts.push('');
  }

  // ── Water feature facts ──
  const waterFeats = worldData?.waterFeatures || [];
  if (waterFeats.length > 0) {
    parts.push('% === Water Feature Facts ===');
    for (const wf of waterFeats) {
      const wId = sanitizeAtom(wf.id || wf._id?.toString());
      parts.push(`water_feature(${wId}).`);
      if (wf.name) parts.push(`water_feature_name(${wId}, '${escapeAtom(wf.name)}').`);
      if (wf.type) parts.push(`water_feature_type(${wId}, ${sanitizeAtom(wf.type)}).`);
      if (wf.subType) parts.push(`water_feature_sub_type(${wId}, ${sanitizeAtom(wf.subType)}).`);
      if (wf.settlementId) parts.push(`water_feature_settlement(${wId}, ${sanitizeAtom(wf.settlementId)}).`);
      if (wf.isNavigable !== undefined) parts.push(`water_feature_navigable(${wId}, ${wf.isNavigable}).`);
      if (wf.isDrinkable !== undefined) parts.push(`water_feature_drinkable(${wId}, ${wf.isDrinkable}).`);
    }
    parts.push('');
  }

  // ── Text/book/sign facts ──
  const texts = worldData?.texts || [];
  if (texts.length > 0) {
    parts.push('% === Text Facts (books, journals, letters, signs) ===');
    for (const t of texts) {
      const tId = sanitizeAtom(t.id || t._id?.toString());
      parts.push(`game_text(${tId}).`);
      if (t.title) parts.push(`text_title(${tId}, '${escapeAtom(t.title)}').`);
      if (t.titleTranslation) parts.push(`text_title_translation(${tId}, '${escapeAtom(t.titleTranslation)}').`);
      if (t.textCategory) parts.push(`text_category(${tId}, ${sanitizeAtom(t.textCategory)}).`);
      if (t.cefrLevel) parts.push(`text_cefr_level(${tId}, ${sanitizeAtom(t.cefrLevel)}).`);
      if (t.targetLanguage) parts.push(`text_language(${tId}, ${sanitizeAtom(t.targetLanguage)}).`);
      if (t.difficulty) parts.push(`text_difficulty(${tId}, ${sanitizeAtom(t.difficulty)}).`);
      if (t.authorName) parts.push(`text_author(${tId}, '${escapeAtom(t.authorName)}').`);
      if (t.spawnLocationHint) parts.push(`text_spawn_location(${tId}, ${sanitizeAtom(t.spawnLocationHint)}).`);
      if (t.clueText) parts.push(`text_clue(${tId}, '${escapeAtom(t.clueText.slice(0, 200))}').`);
      if (t.narrativeChapterId) parts.push(`text_chapter(${tId}, ${sanitizeAtom(t.narrativeChapterId)}).`);
      if (t.status) parts.push(`text_status(${tId}, ${sanitizeAtom(t.status)}).`);
      const pageCount = Array.isArray(t.pages) ? t.pages.length : 0;
      if (pageCount > 0) parts.push(`text_page_count(${tId}, ${pageCount}).`);
      // Vocabulary highlights as facts
      if (Array.isArray(t.vocabularyHighlights)) {
        for (const vh of t.vocabularyHighlights) {
          if (vh.word) parts.push(`text_vocabulary(${tId}, '${escapeAtom(vh.word)}', '${escapeAtom(vh.translation || '')}', ${sanitizeAtom(vh.partOfSpeech || 'unknown')}).`);
        }
      }
      // Tags
      if (Array.isArray(t.tags)) {
        for (const tag of t.tags) {
          parts.push(`text_tag(${tId}, ${sanitizeAtom(tag)}).`);
        }
      }
    }
    parts.push('');
  }

  // ── Residence facts ──
  const residences = worldData?.residences || [];
  if (residences.length > 0) {
    parts.push('% === Residence Facts ===');
    for (const res of residences) {
      const rId = sanitizeAtom(res.id || res._id?.toString());
      parts.push(`residence(${rId}).`);
      if (res.settlementId) parts.push(`residence_of_settlement(${rId}, ${sanitizeAtom(res.settlementId)}).`);
      if (res.lotId) parts.push(`residence_on_lot(${rId}, ${sanitizeAtom(res.lotId)}).`);
      if (res.address) parts.push(`residence_address(${rId}, '${escapeAtom(res.address)}').`);
      if (res.residenceType) parts.push(`residence_type(${rId}, ${sanitizeAtom(res.residenceType)}).`);
      // Owners
      if (Array.isArray(res.ownerIds)) {
        for (const ownerId of res.ownerIds) {
          parts.push(`residence_owner(${rId}, ${sanitizeAtom(ownerId)}).`);
        }
      }
      // Residents
      if (Array.isArray(res.residentIds)) {
        for (const residentId of res.residentIds) {
          parts.push(`lives_at(${sanitizeAtom(residentId)}, ${rId}).`);
        }
      }
    }
    parts.push('');
  }

  // ── Container facts ──
  const containers = worldData?.containers || [];
  if (containers.length > 0) {
    parts.push('% === Container Facts ===');
    for (const c of containers) {
      const cId = sanitizeAtom(c.id || c._id?.toString());
      parts.push(`container(${cId}).`);
      if (c.name) parts.push(`container_name(${cId}, '${escapeAtom(c.name)}').`);
      if (c.containerType) parts.push(`container_type(${cId}, ${sanitizeAtom(c.containerType)}).`);
      if (c.capacity) parts.push(`container_capacity(${cId}, ${c.capacity}).`);
      if (c.locked) parts.push(`container_locked(${cId}).`);
      if (c.lockDifficulty) parts.push(`container_lock_difficulty(${cId}, ${c.lockDifficulty}).`);
      if (c.keyItemId) parts.push(`container_key(${cId}, ${sanitizeAtom(c.keyItemId)}).`);
      // Location
      if (c.businessId) parts.push(`container_at_business(${cId}, ${sanitizeAtom(c.businessId)}).`);
      if (c.residenceId) parts.push(`container_at_residence(${cId}, ${sanitizeAtom(c.residenceId)}).`);
      if (c.lotId) parts.push(`container_on_lot(${cId}, ${sanitizeAtom(c.lotId)}).`);
      // Contents
      if (Array.isArray(c.items)) {
        for (const item of c.items) {
          if (item.itemName) {
            parts.push(`container_contains(${cId}, '${escapeAtom(item.itemName)}', ${item.quantity || 1}).`);
          }
        }
      }
      if (c.respawns) parts.push(`container_respawns(${cId}).`);
    }
    parts.push('');
  }

  // ── Public building facts ──
  const publicBuildings = worldData?.publicBuildings || [];
  if (publicBuildings.length > 0) {
    parts.push('% === Public Building Facts ===');
    for (const pb of publicBuildings) {
      const pbId = sanitizeAtom(pb.id || pb._id?.toString());
      parts.push(`public_building(${pbId}).`);
      if (pb.name) parts.push(`public_building_name(${pbId}, '${escapeAtom(pb.name)}').`);
      if (pb.publicBuildingType) parts.push(`public_building_type(${pbId}, ${sanitizeAtom(pb.publicBuildingType)}).`);
      if (pb.settlementId) parts.push(`public_building_of_settlement(${pbId}, ${sanitizeAtom(pb.settlementId)}).`);
      if (pb.lotId) parts.push(`public_building_on_lot(${pbId}, ${sanitizeAtom(pb.lotId)}).`);
      if (pb.address) parts.push(`public_building_address(${pbId}, '${escapeAtom(pb.address)}').`);
      if (pb.foundedYear) parts.push(`public_building_founded(${pbId}, ${pb.foundedYear}).`);
      if (pb.isOperational !== undefined) parts.push(`public_building_operational(${pbId}, ${pb.isOperational}).`);
      if (pb.capacity) parts.push(`public_building_capacity(${pbId}, ${pb.capacity}).`);
      // Employees
      if (Array.isArray(pb.employeeIds)) {
        for (const empId of pb.employeeIds) {
          parts.push(`public_building_employee(${pbId}, ${sanitizeAtom(empId)}).`);
        }
      }
    }
    parts.push('');
  }

  // ── Character relationship & knowledge facts (detailed) ──
  parts.push('% === Character Relationships & Knowledge ===');
  for (const char of characters) {
    const id = sanitizeAtom(`${char.firstName}_${char.lastName}_${char.id}`);
    // Friendships, coworkers, enemies
    if (Array.isArray(char.friendIds)) {
      for (const fid of char.friendIds) parts.push(`friends(${id}, ${sanitizeAtom(fid)}).`);
    }
    if (Array.isArray(char.coworkerIds)) {
      for (const cid of char.coworkerIds) parts.push(`coworker(${id}, ${sanitizeAtom(cid)}).`);
    }
    if (Array.isArray(char.enemyIds)) {
      for (const eid of char.enemyIds) parts.push(`enemies(${id}, ${sanitizeAtom(eid)}).`);
    }
    // Home/workplace
    if (char.homeResidenceId) parts.push(`home(${id}, ${sanitizeAtom(char.homeResidenceId)}).`);
    if (char.workplaceId) parts.push(`workplace(${id}, ${sanitizeAtom(char.workplaceId)}).`);
    if (char.currentLocation) parts.push(`current_location(${id}, ${sanitizeAtom(char.currentLocation)}).`);
    // Status
    if (char.status) parts.push(`character_status(${id}, ${sanitizeAtom(char.status)}).`);
    // Knowledge/mental model
    if (char.knowledge && typeof char.knowledge === 'object') {
      for (const [topic, value] of Object.entries(char.knowledge)) {
        if (typeof value === 'string') {
          parts.push(`knows(${id}, ${sanitizeAtom(topic)}, '${escapeAtom(value.slice(0, 200))}').`);
        } else if (typeof value === 'boolean' && value) {
          parts.push(`knows(${id}, ${sanitizeAtom(topic)}).`);
        }
      }
    }
    // Beliefs/opinions
    if (char.mentalModel && typeof char.mentalModel === 'object') {
      for (const [subject, opinion] of Object.entries(char.mentalModel)) {
        if (typeof opinion === 'string') {
          parts.push(`believes(${id}, ${sanitizeAtom(subject)}, '${escapeAtom(opinion.slice(0, 200))}').`);
        }
      }
    }
  }
  parts.push('');

  // ── Reputation helper rules ──
  parts.push('% === Reputation Aggregation ===');
  parts.push(':- dynamic(reputation_record/3).');
  parts.push('% reputation(Player, Faction, Total) — aggregate all reputation changes');
  parts.push('reputation(Player, Faction, Total) :-');
  parts.push('    aggregate_all(sum(D), reputation_change(Player, Faction, D), Total).');
  parts.push('reputation(Player, Faction, 0) :-');
  parts.push('    \\+ reputation_change(Player, Faction, _).');
  parts.push('');

  // Prolog content from rules (validate each individually, skip broken ones)
  let hasContent = false;
  const rulesWithContent = rules.filter(r => r.content);
  if (rulesWithContent.length > 0) {
    parts.push('% === Rules ===');
    for (const rule of rulesWithContent) {
      if (hasBalancedParens(rule.content)) {
        parts.push(rule.content);
      } else {
        console.warn(`[IR Export] Skipping rule "${rule.id}" with syntax error`);
        parts.push(`% SKIPPED: rule ${rule.id} — syntax error (unbalanced parens)`);
      }
    }
    parts.push('');
    hasContent = true;
  }

  // Prolog content from actions
  const actionsWithContent = actions.filter(a => a.content);
  if (actionsWithContent.length > 0) {
    parts.push('% === Actions ===');
    for (const action of actionsWithContent) {
      if (hasBalancedParens(action.content!)) {
        parts.push(action.content!);
      } else {
        console.warn(`[IR Export] Skipping action "${action.id}" with syntax error`);
        parts.push(`% SKIPPED: action ${action.id} — syntax error (unbalanced parens)`);
      }
    }
    parts.push('');
    hasContent = true;
  }

  // Prolog content from quests
  const questsWithContent = quests.filter(q => q.content);
  if (questsWithContent.length > 0) {
    parts.push('% === Quests ===');
    for (const quest of questsWithContent) {
      if (hasBalancedParens(quest.content!)) {
        parts.push(quest.content!);
      } else {
        const label = quest.title || quest.id;
        console.warn(`[IR Export] Skipping quest "${label}" (${quest.id}) with syntax error`);
        parts.push(`% SKIPPED: quest ${quest.id} "${quest.title || ''}" — syntax error (unbalanced parens)`);
      }
    }
    parts.push('');
    hasContent = true;
  }

  // Return null if no meaningful content beyond boilerplate
  if (!hasContent && characters.length === 0) return null;

  const knowledgeBase = parts.join('\n');

  // Validate the generated knowledge base (log warnings but don't block export)
  try {
    const validation = await validateExportKnowledgeBase(knowledgeBase);
    if (validation.warnings.length > 0) {
      console.warn('[IR Export] Knowledge base validation warnings:');
      for (const w of validation.warnings) {
        console.warn(`  - ${w}`);
      }
    }
    if (!validation.valid) {
      console.error('[IR Export] Knowledge base validation errors (export continues):');
      for (const e of validation.errors) {
        console.error(`  - ${e}`);
      }
    }
    console.log(`[IR Export] Knowledge base stats: ${validation.stats.factCount} facts, ${validation.stats.ruleCount} rules, ${validation.stats.predicateCount} predicates`);
  } catch (err) {
    console.warn('[IR Export] Knowledge base validation skipped due to error:', err);
  }

  return knowledgeBase;
}

/**
 * Quick syntactic pre-check for a Prolog content block.
 * Catches unbalanced parens and obvious comma issues that cause tau-prolog
 * to fail the entire KB parse.
 */
function hasBalancedParens(content: string): boolean {
  // Strip comments and quoted strings before checking
  const stripped = content
    .replace(/%[^\n]*/g, '')        // line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/'[^']*'/g, "''")      // single-quoted atoms
    .replace(/"[^"]*"/g, '""');     // double-quoted strings
  let depth = 0;
  for (const ch of stripped) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth < 0) return false;
  }
  if (depth !== 0) return false;
  // Check for empty arguments: (,  ,) or ,,
  if (/\(\s*,|,\s*\)|,\s*,/.test(stripped)) return false;
  return true;
}

function sanitizeAtom(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
}

function escapeAtom(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// ─────────────────────────────────────────────
// Terrain helpers
// ─────────────────────────────────────────────

/** Map from TerrainGenerator FeatureType to TerrainFeatureIR featureType */
const FEATURE_TYPE_MAP: Record<string, TerrainFeatureIR['featureType']> = {
  peak: 'mountain',
  valley: 'valley',
  canyon: 'canyon',
  cliff: 'cliff',
  mesa: 'mesa',
  crater: 'crater',
};

/**
 * Convert a TerrainFeature (grid coords) to TerrainFeatureIR (world coords).
 */
function terrainFeatureToIR(
  f: TerrainFeature,
  resolution: number,
  terrainSize: number,
): TerrainFeatureIR {
  const half = terrainSize / 2;
  return {
    id: f.id,
    name: f.name,
    featureType: FEATURE_TYPE_MAP[f.type] || 'hill',
    position: {
      x: (f.position.x / resolution) * terrainSize - half,
      y: f.elevation * 20, // match default elevationScale
      z: (f.position.z / resolution) * terrainSize - half,
    },
    radius: (f.radius / resolution) * terrainSize,
    elevation: f.elevation,
    description: null,
  };
}

/**
 * Infer the dominant terrain type from settlements.
 * Falls back to 'plains' if no settlements or no terrain data.
 */
function inferDominantTerrain(settlements: any[]): TerrainType {
  const validTypes = new Set<string>([
    'plains', 'hills', 'mountains', 'coast', 'river', 'forest', 'desert',
  ]);
  const counts = new Map<string, number>();
  for (const s of settlements) {
    const t = s.terrain;
    if (t && validTypes.has(t)) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }
  if (counts.size === 0) return 'plains';
  let best = 'plains';
  let bestCount = 0;
  counts.forEach((c, t) => {
    if (c > bestCount) { best = t; bestCount = c; }
  });
  return best as TerrainType;
}

/**
 * Map terrain types to BiomeType for the vegetation zone system.
 */
const TERRAIN_TO_BIOME: Record<string, BiomeType> = {
  plains: 'plains',
  hills: 'plains',
  mountains: 'mountains',
  coast: 'plains',
  river: 'plains',
  forest: 'forest',
  desert: 'desert',
};

/**
 * Generate biome zone data by sampling the heightmap.
 * Each cell is classified by (biome, elevation, moisture) and zones are aggregated.
 */
export function generateBiomeZones(
  heightmap: number[][],
  dominantTerrain: TerrainType,
): BiomeZoneIR[] {
  const biome: BiomeType = TERRAIN_TO_BIOME[dominantTerrain] || 'plains';
  const resolution = heightmap.length;
  if (resolution === 0) return [];

  const totalCells = resolution * resolution;

  // Accumulate stats per zone key
  const zoneStats = new Map<string, {
    biome: BiomeType;
    elevation: ElevationZone;
    moisture: MoistureLevel;
    cellCount: number;
    elevationSum: number;
    moistureSum: number;
  }>();

  for (let row = 0; row < resolution; row++) {
    for (let col = 0; col < heightmap[row].length; col++) {
      const elev = heightmap[row][col];
      const moisture = estimateMoisture(dominantTerrain, elev);
      const elevZone = getElevationZone(elev);
      const moistLevel = getMoistureLevel(moisture);
      const key = `${biome}:${elevZone}:${moistLevel}`;

      let stats = zoneStats.get(key);
      if (!stats) {
        stats = { biome, elevation: elevZone, moisture: moistLevel, cellCount: 0, elevationSum: 0, moistureSum: 0 };
        zoneStats.set(key, stats);
      }
      stats.cellCount++;
      stats.elevationSum += elev;
      stats.moistureSum += moisture;
    }
  }

  // Convert to IR, sorted by coverage descending
  const zones: BiomeZoneIR[] = [];
  zoneStats.forEach((stats, key) => {
    const species = getVegetationForZone(stats.biome, stats.elevation, stats.moisture);
    zones.push({
      id: key,
      biome: stats.biome,
      elevationZone: stats.elevation,
      moistureLevel: stats.moisture,
      cellCount: stats.cellCount,
      coverageFraction: stats.cellCount / totalCells,
      averageElevation: stats.elevationSum / stats.cellCount,
      averageMoisture: stats.moistureSum / stats.cellCount,
      species: species.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        density: s.density,
        scaleRange: s.scaleRange,
        ...(s.treeType ? { treeType: s.treeType } : {}),
      })),
    });
  });

  zones.sort((a, b) => b.coverageFraction - a.coverageFraction);
  return zones;
}

// ── Main quest location + narrative helpers ──

function buildMainQuestLocations(world: any): MainQuestLocationIR[] {
  const terrainSize = world?.mapWidth || 500;
  const hiddenLocations = getDefaultHiddenLocations(terrainSize);
  return hiddenLocations.map(loc => ({
    id: loc.id,
    nameEn: loc.nameEn,
    nameFr: loc.nameFr,
    description: loc.description,
    locationType: 'hidden_location' as const,
    position: loc.position,
    rarity: loc.rarity,
    isWriterSecret: loc.isWriterSecret,
    investigationPoints: loc.investigationPoints.map(ip => ({
      id: ip.id,
      offset: ip.offset,
      contentType: ip.contentType,
      contentFr: ip.contentFr,
      contentEn: ip.contentEn,
    })),
  }));
}

function buildNarrativeIR(world: any, characters: any[], settlements: any[]): NarrativeIR | null {
  const targetLanguage = world?.targetLanguage || world?.config?.targetLanguage || 'french';
  const worldId = world?.id;
  if (!worldId) return null;

  const writerName = getWriterName(targetLanguage, worldId);
  const settlementNames = settlements.map((s: any) => s.name).filter(Boolean);
  const npcNames = characters.slice(0, 10).map((c: any) => `${c.firstName} ${c.lastName}`).filter(Boolean);

  return generateNarrative({
    worldId,
    targetLanguage,
    writerName,
    settlementNames,
    npcNames,
  });
}

// ── Exported helpers for testing ──

const ANIMATION_TYPES = ['idle', 'walk', 'run', 'talk', 'listen', 'work', 'sit', 'eat', 'wave', 'sleep'] as const;
const LOOPING_ANIM_TYPES = new Set(['idle', 'walk', 'run', 'talk', 'listen', 'work', 'sit', 'eat', 'sleep']);

export function buildAnimationIRs(assets: any[]): AnimationReferenceIR[] {
  return assets
    .filter(a => a.assetType?.includes('animation'))
    .map(a => {
      const tags = (a.tags as string[]) || [];
      const meta = (a.metadata as Record<string, any>) || {};
      const animationType = meta.animationType || tags.find((t: string) =>
        (ANIMATION_TYPES as readonly string[]).includes(t)
      ) || 'idle';
      const ext = (a.filePath || '').split('.').pop()?.toLowerCase() || 'glb';
      const format = ['glb', 'gltf', 'babylon'].includes(ext) ? ext : 'glb';

      return {
        name: a.name || animationType,
        animationType,
        assetRef: {
          id: a.id,
          role: tags[0] || 'animation',
          babylonPath: a.filePath || '',
          assetType: a.assetType || 'animation',
          tags,
        },
        frameRange: (meta.frameRange as [number, number]) || [0, 1],
        loop: meta.loop != null ? Boolean(meta.loop) : LOOPING_ANIM_TYPES.has(animationType),
        speedRatio: typeof meta.speedRatio === 'number' ? meta.speedRatio : 1.0,
        format,
        skeletonType: meta.skeletonType || 'humanoid',
        isMixamo: Boolean(meta.isMixamo),
      };
    });
}
