/**
 * Intermediate Representation (IR) Types
 *
 * A single JSON document that fully describes an exported game.
 * Engine-specific exporters (Unreal, Unity, Godot) consume this IR
 * to generate native project files.
 *
 * No engine-specific imports allowed — this is purely data.
 */

import type { GenreConfig } from '../game-genres/types';
import type {
  Vec3,
  Color3,
  WorldVisualTheme,
  CameraMode,
  CombatStyle,
  BuildingStyleData,
  BiomeStyleData,
  DungeonConfig,
  DungeonRoom,
  DungeonCorridor,
  EnemySpawn,
  LootSpawn,
  TrapSpawn,
  TileType,
  NeedConfig,
  ResourceType,
} from './types';

// ─────────────────────────────────────────────
// Top-level IR
// ─────────────────────────────────────────────

export interface WorldIR {
  /** Export metadata */
  meta: MetaIR;

  /** Geography: terrain, countries, states, settlements */
  geography: GeographyIR;

  /** All game entities placed in the world */
  entities: EntitiesIR;

  /** Game-logic systems: rules, actions, quests, truths, grammars, languages */
  systems: SystemsIR;

  /** Visual theme and lighting */
  theme: ThemeIR;

  /** Asset references (textures, models, audio, animations) */
  assets: AssetsIR;

  /** Player configuration */
  player: PlayerIR;

  /** UI configuration */
  ui: UIIR;

  /** Combat configuration */
  combat: CombatIR;

  /** Survival configuration (if genre enables it) */
  survival: SurvivalIR | null;

  /** Resource system configuration (if genre enables it) */
  resources: ResourcesIR | null;
}

// ─────────────────────────────────────────────
// Meta
// ─────────────────────────────────────────────

export interface MetaIR {
  insimulVersion: string;
  worldId: string;
  worldName: string;
  worldDescription: string;
  worldType: string;
  genreConfig: GenreConfig;
  exportTimestamp: string;
  exportVersion: number;
  /** Seed used for deterministic procedural generation */
  seed: string;
}

// ─────────────────────────────────────────────
// Geography
// ─────────────────────────────────────────────

export interface GeographyIR {
  terrainSize: number;
  /** Optional heightmap as row-major 2D array of normalised heights [0,1] */
  heightmap?: number[][];
  countries: CountryIR[];
  states: StateIR[];
  settlements: SettlementIR[];
}

export interface CountryIR {
  id: string;
  name: string;
  description: string | null;
  governmentType: string | null;
  economicSystem: string | null;
  socialStructure: Record<string, any>;
  culture: Record<string, any>;
  culturalValues: Record<string, any>;
  laws: any[];
  alliances: string[];
  enemies: string[];
  foundedYear: number | null;
  /** Bounding box in world units */
  bounds: BoundsIR;
}

export interface StateIR {
  id: string;
  countryId: string;
  name: string;
  description: string | null;
  stateType: string | null;
  terrain: string | null;
  foundedYear: number | null;
  governorId: string | null;
  bounds: BoundsIR;
}

export interface SettlementIR {
  id: string;
  worldId: string;
  countryId: string | null;
  stateId: string | null;
  name: string;
  description: string | null;
  settlementType: string;
  terrain: string | null;
  population: number;
  foundedYear: number | null;
  founderIds: string[];
  mayorId: string | null;
  /** Center position in world space */
  position: Vec3;
  /** Radius in world units */
  radius: number;
  /** Building lot positions */
  lots: LotIR[];
  /** Business IDs located in this settlement */
  businessIds: string[];
  /** Internal road waypoints (settlement center → buildings) */
  internalRoads: RoadIR[];
}

export interface LotIR {
  id: string;
  address: string;
  houseNumber: number;
  streetName: string;
  block: string | null;
  districtName: string | null;
  /** Position in world space */
  position: Vec3;
  buildingType: string | null;
  buildingId: string | null;
}

export interface BoundsIR {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
}

// ─────────────────────────────────────────────
// Entities
// ─────────────────────────────────────────────

export interface EntitiesIR {
  characters: CharacterIR[];
  npcs: NPCIR[];
  buildings: BuildingIR[];
  businesses: BusinessIR[];
  roads: RoadIR[];
  natureObjects: NatureObjectIR[];
  dungeons: DungeonIR[];
  questObjects: QuestObjectIR[];
}

export interface CharacterIR {
  id: string;
  worldId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  gender: string;
  isAlive: boolean;
  birthYear: number | null;

  personality: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  physicalTraits: Record<string, any>;
  mentalTraits: Record<string, any>;
  skills: Record<string, number>;

  relationships: Record<string, any>;
  socialAttributes: Record<string, any>;

  coworkerIds: string[];
  friendIds: string[];
  neighborIds: string[];
  immediateFamilyIds: string[];
  extendedFamilyIds: string[];
  parentIds: string[];
  childIds: string[];
  spouseId: string | null;
  genealogyData: Record<string, any>;

  currentLocation: string;
  occupation: string | null;
  status: string | null;
}

export interface NPCIR {
  /** Reference to CharacterIR.id */
  characterId: string;
  /** NPC role: questgiver, guard, merchant, civilian */
  role: string;
  /** Home position in world space */
  homePosition: Vec3;
  /** Patrol radius from home position */
  patrolRadius: number;
  /** NPC disposition toward the player (0–100) */
  disposition: number;
  /** Settlement this NPC belongs to */
  settlementId: string | null;
  /** Quest IDs this NPC gives */
  questIds: string[];
  /** Dialogue greeting (if any) */
  greeting: string | null;
}

export interface BuildingIR {
  id: string;
  settlementId: string;
  /** Position in world space */
  position: Vec3;
  /** Y-axis rotation in radians */
  rotation: number;
  /** Building spec */
  spec: BuildingSpecIR;
  /** Building visual style */
  style: BuildingStyleData;
  /** Occupant character IDs */
  occupantIds: string[];
  /** Interior layout (if generated) */
  interior: InteriorLayoutIR | null;
  /** Associated business ID (if any) */
  businessId: string | null;
  /** Model asset override key (if asset collection provides one) */
  modelAssetKey: string | null;
}

export interface BuildingSpecIR {
  buildingRole: string;
  floors: number;
  width: number;
  depth: number;
  hasChimney: boolean;
  hasBalcony: boolean;
}

export interface InteriorLayoutIR {
  width: number;
  depth: number;
  height: number;
  furniture: FurnitureIR[];
}

export interface FurnitureIR {
  type: string;
  position: Vec3;
  dimensions: Vec3;
  rotation: number;
  color: Color3;
}

export interface BusinessIR {
  id: string;
  settlementId: string;
  name: string;
  businessType: string;
  ownerId: string;
  founderId: string;
  isOutOfBusiness: boolean;
  foundedYear: number;
  lotId: string | null;
  vacancies: { day: string[]; night: string[] };
  businessData: Record<string, any>;
}

export interface RoadIR {
  /** Start settlement or building ID */
  fromId: string;
  /** End settlement or building ID */
  toId: string;
  /** Ordered waypoints in world space */
  waypoints: Vec3[];
  /** Road width in world units */
  width: number;
  /** Material/texture key */
  materialKey: string | null;
}

export interface NatureObjectIR {
  type: 'tree' | 'rock' | 'bush' | 'flower' | 'grass';
  /** Sub-type based on biome (e.g. oak, pine, palm, dead) */
  subType: string;
  position: Vec3;
  scale: Vec3;
  /** Y-axis rotation in radians */
  rotation: number;
  /** Biome this object belongs to */
  biome: string;
  /** Model asset override key (if any) */
  modelAssetKey: string | null;
}

export interface DungeonIR {
  id: string;
  name: string;
  /** Entrance position in world space */
  entrancePosition: Vec3;
  /** Associated settlement (if any) */
  settlementId: string | null;
  floors: DungeonFloorIR[];
}

export interface DungeonFloorIR {
  floorNumber: number;
  config: DungeonConfig;
  rooms: DungeonRoom[];
  corridors: DungeonCorridor[];
  grid: TileType[][];
  gridWidth: number;
  gridHeight: number;
  startRoom: number;
  bossRoom: number | null;
}

export interface QuestObjectIR {
  id: string;
  questId: string;
  objectType: string;
  position: Vec3;
  modelAssetKey: string | null;
  interactionType: string;
  metadata: Record<string, any>;
}

// ─────────────────────────────────────────────
// Systems
// ─────────────────────────────────────────────

export interface SystemsIR {
  rules: RuleIR[];
  baseRules: RuleIR[];
  actions: ActionIR[];
  baseActions: ActionIR[];
  quests: QuestIR[];
  truths: TruthIR[];
  grammars: GrammarIR[];
  languages: LanguageIR[];
}

export interface RuleIR {
  id: string;
  name: string;
  description: string | null;
  content: string;
  isBase: boolean;
  sourceFormat: string;
  ruleType: string;
  category: string | null;
  priority: number;
  likelihood: number;
  conditions: any[];
  effects: any[];
  tags: string[];
  dependencies: string[];
  isActive: boolean;
}

export interface ActionIR {
  id: string;
  name: string;
  description: string | null;
  isBase: boolean;
  sourceFormat: string;
  actionType: string;
  category: string | null;
  duration: number;
  difficulty: number;
  energyCost: number;
  prerequisites: any[];
  effects: any[];
  sideEffects: any[];
  targetType: string | null;
  requiresTarget: boolean;
  range: number;
  isAvailable: boolean;
  cooldown: number;
  triggerConditions: any[];
  verbPast: string | null;
  verbPresent: string | null;
  narrativeTemplates: string[];
  customData: Record<string, any>;
  tags: string[];
  isActive: boolean;
}

export interface QuestIR {
  id: string;
  worldId: string;
  title: string;
  description: string;
  questType: string;
  difficulty: string;
  targetLanguage: string;
  gameType: string | null;
  questChainId: string | null;
  questChainOrder: number | null;
  prerequisiteQuestIds: string[] | null;
  objectives: any[];
  completionCriteria: Record<string, any>;
  experienceReward: number;
  rewards: Record<string, any>;
  itemRewards: Array<{ itemId: string; quantity: number; name: string }> | null;
  skillRewards: Array<{ skillId: string; name: string; level: number }> | null;
  unlocks: Array<{ type: 'area' | 'npc' | 'feature'; id: string; name: string }> | null;
  failureConditions: Record<string, any> | null;
  /** NPC character name who assigned this quest */
  assignedBy: string | null;
  /** NPC character ID who assigned this quest */
  assignedByCharacterId: string | null;
  tags: string[];
  status: string;
}

export interface TruthIR {
  id: string;
  worldId: string;
  characterId: string | null;
  title: string;
  content: string;
  entryType: string;
  timestep: number;
  timestepDuration: number;
  timeYear: number | null;
  timeSeason: string | null;
  timeDescription: string | null;
  relatedCharacterIds: string[];
  relatedLocationIds: string[];
  tags: string[];
  importance: number;
  isPublic: boolean;
  source: string | null;
}

export interface GrammarIR {
  id: string;
  worldId: string;
  name: string;
  description: string | null;
  /** Tracery grammar object: symbol → expansion(s) */
  grammar: Record<string, string | string[]>;
  tags: string[];
  worldType: string | null;
  gameType: string | null;
  isActive: boolean;
}

export interface LanguageIR {
  id: string;
  worldId: string;
  name: string;
  description: string | null;
  kind: 'real' | 'constructed';
  realCode: string | null;
  scopeType: string;
  scopeId: string;
  isPrimary: boolean;
  parentLanguageId: string | null;
  influenceLanguageIds: string[];
  realInfluenceCodes: string[];
  features: Record<string, any> | null;
  phonemes: Record<string, any> | null;
  grammarRules: Record<string, any> | null;
  writingSystem: Record<string, any> | null;
  sampleWords: Record<string, string> | null;
}

// ─────────────────────────────────────────────
// Theme / Lighting
// ─────────────────────────────────────────────

export interface ThemeIR {
  visualTheme: WorldVisualTheme;
  skyboxAssetKey: string | null;
  ambientLighting: {
    color: [number, number, number];
    intensity: number;
  };
  directionalLight: {
    direction: [number, number, number];
    intensity: number;
  };
  fog: {
    mode: string;
    density: number;
    color: [number, number, number];
  } | null;
}

// ─────────────────────────────────────────────
// Assets
// ─────────────────────────────────────────────

export interface AssetsIR {
  collectionId: string | null;
  textures: AssetReferenceIR[];
  models: AssetReferenceIR[];
  audio: AssetReferenceIR[];
  animations: AnimationReferenceIR[];
}

export interface AssetReferenceIR {
  id: string;
  /** Semantic role: 'ground_texture', 'building_tavern', 'tree_oak', etc. */
  role: string;
  /** Path to the Babylon.js / web asset */
  babylonPath: string;
  /** Engine-specific overrides (filled during Phase 2+) */
  unrealPath?: string;
  unityPath?: string;
  godotPath?: string;
  /** Asset metadata */
  assetType: string;
  tags: string[];
}

export interface AnimationReferenceIR {
  name: string;
  /** Animation type: idle, walk, run, attack, etc. */
  animationType: string;
  assetRef: AssetReferenceIR;
  frameRange: [number, number];
  loop: boolean;
}

// ─────────────────────────────────────────────
// Player
// ─────────────────────────────────────────────

export interface PlayerIR {
  startPosition: Vec3;
  modelAssetKey: string | null;
  initialEnergy: number;
  initialGold: number;
  initialHealth: number;
  speed: number;
  jumpHeight: number;
  gravity: number;
}

// ─────────────────────────────────────────────
// UI
// ─────────────────────────────────────────────

export interface UIIR {
  showMinimap: boolean;
  showHealthBar: boolean;
  showStaminaBar: boolean;
  showAmmoCounter: boolean;
  showCompass: boolean;
  genreLayout: string;
}

// ─────────────────────────────────────────────
// Combat
// ─────────────────────────────────────────────

export interface CombatIR {
  style: CombatStyle;
  settings: {
    baseDamage: number;
    damageVariance: number;
    criticalChance: number;
    criticalMultiplier: number;
    blockReduction: number;
    dodgeChance: number;
    attackCooldown: number;
    comboWindowMs: number;
    maxComboLength: number;
  };
}

// ─────────────────────────────────────────────
// Survival
// ─────────────────────────────────────────────

export interface SurvivalIR {
  needs: NeedConfig[];
}

// ─────────────────────────────────────────────
// Resources
// ─────────────────────────────────────────────

export interface ResourcesIR {
  definitions: ResourceDefinitionIR[];
}

export interface ResourceDefinitionIR {
  id: ResourceType;
  name: string;
  icon: string;
  color: Color3;
  maxStack: number;
  gatherTime: number;
  respawnTime: number;
}
