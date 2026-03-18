import mongoose, { Schema, Document, Types } from "mongoose";
import type { IStorage } from "./storage.js";
import {
  type Rule,
  type InsertRule,
  type Grammar,
  type InsertGrammar,
  type Character,
  type InsertCharacter,
  type World,
  type InsertWorld,
  type Country,
  type InsertCountry,
  type State,
  type InsertState,
  type Settlement,
  type InsertSettlement,
  type SettlementHistoryEvent,
  type InsertSettlementHistoryEvent,
  type Simulation,
  type InsertSimulation,
  type Action,
  type InsertAction,
  type Quest,
  type InsertQuest,
  type Truth,
  type InsertTruth,
  type VisualAsset,
  type InsertVisualAsset,
  type AssetCollection,
  type InsertAssetCollection,
  type GenerationJob,
  type InsertGenerationJob,
  type User,
  type InsertUser,
  type PlayerProgress,
  type InsertPlayerProgress,
  type PlayerSession,
  type InsertPlayerSession,
  type Achievement,
  type InsertAchievement,
  type Playthrough,
  type InsertPlaythrough,
  type PlaythroughDelta,
  type InsertPlaythroughDelta,
  type PlayTrace,
  type InsertPlayTrace,
  type Item,
  type InsertItem
} from "@shared/schema";
import type {
  WorldLanguage,
  InsertWorldLanguage,
  LanguageChatMessage,
  InsertLanguageChatMessage,
  LanguageScopeType
} from "@shared/language";
import type {
  AssessmentSession,
  PhaseResult,
  RecordingReference
} from "@shared/assessment";

// Mongoose Document interfaces
interface RuleDoc extends Omit<Rule, 'id'>, Document {
  _id: string;
}

interface GrammarDoc extends Omit<Grammar, 'id'>, Document {
  _id: string;
}

interface CharacterDoc extends Omit<Character, 'id'>, Document {
  _id: string;
}

interface WorldDoc extends Omit<World, 'id'>, Document {
  _id: string;
}

interface CountryDoc extends Omit<Country, 'id'>, Document {
  _id: string;
}

interface StateDoc extends Omit<State, 'id'>, Document {
  _id: string;
}

interface SettlementDoc extends Omit<Settlement, 'id'>, Document {
  _id: string;
}

interface SettlementHistoryEventDoc extends Omit<SettlementHistoryEvent, 'id'>, Document {
  _id: string;
}

interface SimulationDoc extends Omit<Simulation, 'id'>, Document {
  _id: string;
}

interface ActionDoc extends Omit<Action, 'id'>, Document {
  _id: string;
}

interface TruthDoc extends Omit<Truth, 'id'>, Document {
  _id: string;
}

interface QuestDoc extends Omit<Quest, 'id'>, Document {
  _id: string;
}

interface ItemDoc extends Omit<Item, 'id'>, Document {
  _id: string;
}

interface VisualAssetDoc extends Omit<VisualAsset, 'id'>, Document {
  _id: string;
}

interface AssetCollectionDoc extends Omit<AssetCollection, 'id'>, Document {
  _id: string;
}

interface GenerationJobDoc extends Omit<GenerationJob, 'id'>, Document {
    _id: string;
}

interface UserDoc extends Omit<User, 'id'>, Document {
  _id: string;
}

interface PlayerProgressDoc extends Omit<PlayerProgress, 'id'>, Document {
  _id: string;
}

interface PlayerSessionDoc extends Omit<PlayerSession, 'id'>, Document {
  _id: string;
}

interface AchievementDoc extends Omit<Achievement, 'id'>, Document {
  _id: string;
}

interface PlaythroughDoc extends Omit<Playthrough, 'id'>, Document {
  _id: string;
}

interface PlaythroughDeltaDoc extends Omit<PlaythroughDelta, 'id'>, Document {
  _id: string;
}

interface PlayTraceDoc extends Omit<PlayTrace, 'id'>, Document {
  _id: string;
}

interface WorldLanguageDoc extends Omit<WorldLanguage, 'id'>, Document {
  _id: string;
}

interface LanguageChatMessageDoc extends Omit<LanguageChatMessage, 'id'>, Document {
  _id: string;
}

interface AssessmentSessionDoc extends Omit<AssessmentSession, 'id'>, Document {
  _id: string;
}

// Mongoose Schemas
const RuleSchema = new Schema({
  worldId: { type: String, required: false, default: null }, // Optional - null for base rules
  isBase: { type: Boolean, default: false }, // true for global rules, false for world-specific
  content: { type: String, required: true }, // Prolog content — single source of truth
  name: { type: String, required: true },
  description: { type: String, default: null },
  sourceFormat: { type: String, default: 'prolog' }, // original import format for backward translation
  ruleType: { type: String, default: 'trigger' }, // denormalized from Prolog for queries
  category: { type: String, default: null },
  priority: { type: Number, default: 5 }, // denormalized from Prolog for sorting
  likelihood: { type: Number, default: 1.0 }, // denormalized from Prolog
  tags: { type: [String], default: [] },
  relatedTruthIds: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
RuleSchema.index({ worldId: 1 });
RuleSchema.index({ isBase: 1, worldId: 1 }); // Compound index for base rules query

const GrammarSchema = new Schema({
  worldId: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  description: { type: String, default: null },
  grammar: { type: Schema.Types.Mixed, required: true },
  tags: { type: Schema.Types.Mixed, default: null },
  truthBindings: { type: Schema.Types.Mixed, default: [] },
  contextType: { type: String, default: null },
  relatedTruthIds: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CharacterSchema = new Schema({
  worldId: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: { type: String, default: null },
  lastName: { type: String, required: true },
  suffix: { type: String, default: null },
  maidenName: { type: String, default: null },
  age: { type: Number, default: null },
  birthYear: { type: Number, default: null },
  isAlive: { type: Boolean, default: true },
  gender: { type: String, required: true },
  personality: { type: Schema.Types.Mixed, default: null },
  physicalTraits: { type: Schema.Types.Mixed, default: null },
  mentalTraits: { type: Schema.Types.Mixed, default: null },
  skills: { type: Schema.Types.Mixed, default: null },
  relationships: { type: Schema.Types.Mixed, default: null },
  socialAttributes: { type: Schema.Types.Mixed, default: null },
  parentIds: { type: Schema.Types.Mixed, default: null },
  childIds: { type: Schema.Types.Mixed, default: null },
  spouseId: { type: String, default: null },
  genealogyData: { type: Schema.Types.Mixed, default: null },
  generationMethod: { type: String, default: null },
  generationConfig: { type: Schema.Types.Mixed, default: null },
  currentLocation: { type: String, default: null },
  currentResidenceId: { type: String, default: null },
  occupation: { type: String, default: null },
  status: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WorldSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: null },
  targetLanguage: { type: String, default: null },
  worldType: { type: String, default: null },
  gameType: { type: String, default: null },

  // Ownership and permissions
  ownerId: { type: String, default: null },
  visibility: { type: String, default: 'private' },
  isTemplate: { type: Boolean, default: false },
  allowedUserIds: { type: [String], default: [] },
  maxPlayers: { type: Number, default: null },
  requiresAuth: { type: Boolean, default: false },

  // Asset collection reference
  selectedAssetCollectionId: { type: String, default: null },

  // Camera perspective
  cameraPerspective: { type: String, default: null },

  // Timestep configuration
  timestepUnit: { type: String, default: 'year' },
  gameplayTimestepUnit: { type: String, default: 'day' },
  customTimestepLabel: { type: String, default: null },
  customTimestepDurationMs: { type: Number, default: null },
  historyStartYear: { type: Number, default: null },
  historyEndYear: { type: Number, default: null },
  currentGameYear: { type: Number, default: null },

  sourceFormats: { type: Schema.Types.Mixed, default: null },
  config: { type: Schema.Types.Mixed, default: null },
  worldData: { type: Schema.Types.Mixed, default: null },
  historicalEvents: { type: Schema.Types.Mixed, default: null },
  generationConfig: { type: Schema.Types.Mixed, default: null },

  // Version tracking for playthroughs
  version: { type: Number, default: 1 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CountrySchema = new Schema({
  worldId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: null },
  governmentType: { type: String, default: null },
  economicSystem: { type: String, default: null },
  socialStructure: { type: Schema.Types.Mixed, default: null },
  foundedYear: { type: Number, default: null },
  culture: { type: Schema.Types.Mixed, default: null },
  culturalValues: { type: Schema.Types.Mixed, default: null },
  laws: { type: Schema.Types.Mixed, default: null },
  currentYear: { type: Number, default: null },
  currentMonth: { type: Number, default: 1 },
  currentDay: { type: Number, default: 1 },
  alliances: { type: Schema.Types.Mixed, default: null },
  enemies: { type: Schema.Types.Mixed, default: null },
  isActive: { type: Boolean, default: true },
  dissolvedYear: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const StateSchema = new Schema({
  worldId: { type: String, required: true },
  countryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: null },
  stateType: { type: String, default: 'province' },
  foundedYear: { type: Number, default: null },
  terrain: { type: String, default: null },
  governorId: { type: String, default: null },
  localGovernmentType: { type: String, default: null },
  previousCountryIds: { type: Schema.Types.Mixed, default: null },
  annexationHistory: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SettlementSchema = new Schema({
  worldId: { type: String, required: true },
  countryId: { type: String, default: null },
  stateId: { type: String, default: null },
  name: { type: String, required: true },
  description: { type: String, default: null },
  settlementType: { type: String, required: true },
  settlementSubtype: { type: String, default: 'standard' },
  terrain: { type: String, default: null },
  population: { type: Number, default: 0 },
  foundedYear: { type: Number, default: null },
  founderIds: { type: Schema.Types.Mixed, default: null },
  currentGeneration: { type: Number, default: 0 },
  maxGenerations: { type: Number, default: 10 },
  currentYear: { type: Number, default: null },
  currentMonth: { type: Number, default: 1 },
  currentDay: { type: Number, default: 1 },
  timeOfDay: { type: String, default: 'day' },
  ordinalDate: { type: Number, default: 0 },
  mayorId: { type: String, default: null },
  localGovernmentType: { type: String, default: null },
  districts: { type: Schema.Types.Mixed, default: null },
  streets: { type: Schema.Types.Mixed, default: null },
  landmarks: { type: Schema.Types.Mixed, default: null },
  socialStructure: { type: Schema.Types.Mixed, default: null },
  economicData: { type: Schema.Types.Mixed, default: null },
  genealogies: { type: Schema.Types.Mixed, default: null },
  familyTrees: { type: Schema.Types.Mixed, default: null },
  unemployedCharacterIds: { type: Schema.Types.Mixed, default: null },
  vacantLotIds: { type: Schema.Types.Mixed, default: null },
  departedCharacterIds: { type: Schema.Types.Mixed, default: null },
  deceasedCharacterIds: { type: Schema.Types.Mixed, default: null },
  previousCountryIds: { type: Schema.Types.Mixed, default: null },
  previousStateIds: { type: Schema.Types.Mixed, default: null },
  annexationHistory: { type: Schema.Types.Mixed, default: null },
  boundaryPolygon: { type: Schema.Types.Mixed, default: null },
  elevation: { type: Number, default: 0 },
  slopeProfile: { type: String, default: null },
  elevationProfile: { type: Schema.Types.Mixed, default: null },
  generationConfig: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SettlementHistoryEventSchema = new Schema({
  worldId: { type: String, required: true },
  settlementId: { type: String, required: true },
  eventType: { type: String, required: true },
  category: { type: String, required: true },
  year: { type: Number, default: null },
  timestep: { type: Number, default: null },
  description: { type: String, required: true },
  previousValue: { type: Schema.Types.Mixed, default: null },
  newValue: { type: Schema.Types.Mixed, default: null },
  significance: { type: String, default: 'minor' },
  relatedCharacterIds: { type: Schema.Types.Mixed, default: [] },
  tags: { type: Schema.Types.Mixed, default: [] },
  createdAt: { type: Date, default: Date.now },
});

const SimulationSchema = new Schema({
  worldId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: null },
  sourceFormats: { type: Schema.Types.Mixed, default: null },
  config: { type: Schema.Types.Mixed, default: null },
  startTime: { type: Number, default: null },
  endTime: { type: Number, default: null },
  currentTime: { type: Number, default: 0 },
  timeStep: { type: Number, default: null },
  results: { type: Schema.Types.Mixed, default: null },
  socialRecord: { type: Schema.Types.Mixed, default: null },
  narrativeOutput: { type: Schema.Types.Mixed, default: null },
  status: { type: String, default: null },
  progress: { type: Number, default: null },
  errorLog: { type: Schema.Types.Mixed, default: null },
  executionTime: { type: Number, default: null },
  rulesExecuted: { type: Number, default: null },
  eventsGenerated: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ActionSchema = new Schema({
  worldId: { type: String, required: false, default: null }, // Optional - null for base actions
  isBase: { type: Boolean, default: false }, // true for global actions, false for world-specific
  name: { type: String, required: true },
  description: { type: String, default: null },
  content: { type: String, default: null }, // Prolog content — single source of truth
  actionType: { type: String, default: 'social' },
  category: { type: String, default: null },
  sourceFormat: { type: String, default: 'prolog' },
  energyCost: { type: Number, default: null },
  cooldown: { type: Number, default: null },
  targetType: { type: String, default: null },
  duration: { type: Number, default: 1 },
  difficulty: { type: Number, default: 0.5 },
  requiresTarget: { type: Boolean, default: false },
  range: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
  verbPast: { type: String, default: null },
  verbPresent: { type: String, default: null },
  narrativeTemplates: { type: Schema.Types.Mixed, default: [] },
  tags: { type: [String], default: [] },
  relatedTruthIds: { type: [String], default: [] },
  customData: { type: Schema.Types.Mixed, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
ActionSchema.index({ worldId: 1 });
ActionSchema.index({ isBase: 1, worldId: 1 }); // Compound index for base actions query

const TruthSchema = new Schema({
  worldId: { type: String, required: true },
  characterId: { type: String, default: null },
  title: { type: String, required: true },
  content: { type: String, required: true },
  entryType: { type: String, required: true },
  timestep: { type: Number, required: true, default: 0 },
  timestepDuration: { type: Number, default: null },
  timeYear: { type: Number, default: null },
  timeSeason: { type: String, default: null },
  timeDescription: { type: String, default: null },
  historicalEra: { type: String, default: null },
  historicalSignificance: { type: String, default: null },
  causesTruthIds: { type: [String], default: [] },
  causedByTruthIds: { type: [String], default: [] },
  relatedCharacterIds: { type: Schema.Types.Mixed, default: null },
  relatedLocationIds: { type: Schema.Types.Mixed, default: null },
  tags: { type: Schema.Types.Mixed, default: null },
  importance: { type: Number, default: null },
  isPublic: { type: Boolean, default: null },
  source: { type: String, default: null },
  sourceData: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const QuestSchema = new Schema({
  worldId: { type: String, required: true },
  assignedTo: { type: String, required: true },
  assignedBy: { type: String, default: null },
  assignedToCharacterId: { type: String, default: null },
  assignedByCharacterId: { type: String, default: null },
  title: { type: String, required: true },
  description: { type: String, required: true },
  questType: { type: String, required: true },
  difficulty: { type: String, required: true },
  cefrLevel: { type: String, default: null }, // A1, A2, B1, B2
  difficultyStars: { type: Number, default: null }, // 1–5
  estimatedMinutes: { type: Number, default: null },
  targetLanguage: { type: String, required: true },
  gameType: { type: String, default: 'language-learning' },
  questChainId: { type: String, default: null },
  questChainOrder: { type: Number, default: null },
  prerequisiteQuestIds: { type: [String], default: null },
  objectives: { type: Schema.Types.Mixed, default: [] },
  progress: { type: Schema.Types.Mixed, default: {} },
  status: { type: String, default: 'active' },
  completionCriteria: { type: Schema.Types.Mixed, default: {} },
  experienceReward: { type: Number, default: 0 },
  rewards: { type: Schema.Types.Mixed, default: {} },
  itemRewards: { type: Schema.Types.Mixed, default: null },
  skillRewards: { type: Schema.Types.Mixed, default: null },
  unlocks: { type: Schema.Types.Mixed, default: null },
  stages: { type: Schema.Types.Mixed, default: null },
  currentStageId: { type: String, default: null },
  parentQuestId: { type: String, default: null },
  failureConditions: { type: Schema.Types.Mixed, default: null },
  attemptCount: { type: Number, default: 1 },
  maxAttempts: { type: Number, default: 3 },
  abandonedAt: { type: Date, default: null },
  failedAt: { type: Date, default: null },
  failureReason: { type: String, default: null },
  abandonReason: { type: String, default: null },
  locationId: { type: String, default: null },
  locationName: { type: String, default: null },
  locationPosition: { type: Schema.Types.Mixed, default: null },
  recurrencePattern: { type: String, default: null }, // daily, weekly, monthly
  recurrenceResetAt: { type: Date, default: null },
  completionCount: { type: Number, default: 0 },
  lastCompletedAt: { type: Date, default: null },
  sourceQuestId: { type: String, default: null },
  streakCount: { type: Number, default: 0 },
  assignedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  conversationContext: { type: String, default: null },
  tags: { type: Schema.Types.Mixed, default: [] },
  content: { type: String, default: null }, // Prolog content — single source of truth
  relatedTruthIds: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ItemSchema = new Schema({
  worldId: { type: String, default: null },
  name: { type: String, required: true },
  description: { type: String, default: null },
  itemType: { type: String, required: true },
  icon: { type: String, default: null },
  value: { type: Number, default: 0 },
  sellValue: { type: Number, default: 0 },
  weight: { type: Number, default: 1 },
  tradeable: { type: Boolean, default: true },
  stackable: { type: Boolean, default: true },
  maxStack: { type: Number, default: 99 },
  worldType: { type: String, default: null },
  objectRole: { type: String, default: null },
  category: { type: String, default: null },
  material: { type: String, default: null },
  baseType: { type: String, default: null },
  rarity: { type: String, default: 'common' },
  effects: { type: Schema.Types.Mixed, default: null },
  lootWeight: { type: Number, default: 0 },
  tags: { type: Schema.Types.Mixed, default: [] },
  isBase: { type: Boolean, default: false },
  possessable: { type: Boolean, default: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  craftingRecipe: { type: Schema.Types.Mixed, default: null },
  questRelevance: { type: Schema.Types.Mixed, default: [] },
  loreText: { type: String, default: null },
  languageLearningData: { type: Schema.Types.Mixed, default: null },
  relatedTruthIds: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ItemSchema.index({ worldId: 1 });
ItemSchema.index({ isBase: 1, worldType: 1 });

const VisualAssetSchema = new Schema({
  worldId: { type: String, default: null },
  name: { type: String, required: true },
  description: { type: String, default: null },
  assetType: { type: String, required: true },
  characterId: { type: String, default: null },
  businessId: { type: String, default: null },
  settlementId: { type: String, default: null },
  countryId: { type: String, default: null },
  stateId: { type: String, default: null },
  filePath: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, default: null },
  mimeType: { type: String, default: 'image/png' },
  width: { type: Number, default: null },
  height: { type: Number, default: null },
  generationProvider: { type: String, default: null },
  generationPrompt: { type: String, default: null },
  generationParams: { type: Schema.Types.Mixed, default: {} },
  parentAssetId: { type: String, default: null },
  version: { type: Number, default: 1 },
  variants: { type: [String], default: [] },
  purpose: { type: String, default: null },
  usageContext: { type: String, default: null },
  tags: { type: [String], default: [] },
  status: { type: String, default: 'completed' },
  isPublic: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  errorMessage: { type: String, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: null },
  avatarUrl: { type: String, default: null },
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PlayerProgressSchema = new Schema({
  userId: { type: String, required: true },
  worldId: { type: String, required: true },
  characterId: { type: String, default: null },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  playtime: { type: Number, default: 0 },
  currentPosition: { type: Schema.Types.Mixed, default: { x: 0, y: 0, z: 0 } },
  currentLocation: { type: String, default: null },
  questsCompleted: { type: [String], default: [] },
  achievementsUnlocked: { type: [String], default: [] },
  stats: { type: Schema.Types.Mixed, default: {} },
  inventory: { type: Schema.Types.Mixed, default: [] },
  lastCheckpoint: { type: Schema.Types.Mixed, default: {} },
  saveData: { type: Schema.Types.Mixed, default: {} },
  lastPlayedAt: { type: Date, default: Date.now },
  sessionsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AssetCollectionSchema = new Schema({
  worldId: { type: String, default: null },
  name: { type: String, required: true },
  description: { type: String, default: null },
  collectionType: { type: String, required: true },
  worldType: { type: String, default: null },
  assetIds: { type: [String], default: [] },
  buildingModels: { type: Schema.Types.Mixed, default: {} },
  natureModels: { type: Schema.Types.Mixed, default: {} },
  characterModels: { type: Schema.Types.Mixed, default: {} },
  objectModels: { type: Schema.Types.Mixed, default: {} },
  playerModels: { type: Schema.Types.Mixed, default: {} },
  questObjectModels: { type: Schema.Types.Mixed, default: {} },
  audioAssets: { type: Schema.Types.Mixed, default: {} },
  groundTextureId: { type: String, default: null },
  roadTextureId: { type: String, default: null },
  wallTextureId: { type: String, default: null },
  roofTextureId: { type: String, default: null },
  purpose: { type: String, default: null },
  tags: { type: [String], default: [] },
  createdBy: { type: String, default: null },
  isPublic: { type: Boolean, default: false },
  isBase: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PlayerSessionSchema = new Schema({
  userId: { type: String, required: true },
  worldId: { type: String, required: true },
  progressId: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
  duration: { type: Number, default: 0 },
  experienceGained: { type: Number, default: 0 },
  questsCompletedInSession: { type: Number, default: 0 },
  achievementsEarnedInSession: { type: Number, default: 0 },
  sessionData: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const AchievementSchema = new Schema({
  worldId: { type: String, default: null },
  name: { type: String, required: true },
  description: { type: String, required: true },
  iconUrl: { type: String, default: null },
  achievementType: { type: String, required: true },
  criteria: { type: Schema.Types.Mixed, default: {} },
  experienceReward: { type: Number, default: 0 },
  rewards: { type: Schema.Types.Mixed, default: {} },
  isHidden: { type: Boolean, default: false },
  rarity: { type: String, default: 'common' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const GenerationJobSchema = new Schema({
  worldId: { type: String, default: null },
  jobType: { type: String, required: true },
  assetType: { type: String, required: true },
  targetEntityId: { type: String, default: null },
  targetEntityType: { type: String, default: null },
  prompt: { type: String, required: true },
  generationProvider: { type: String, required: true },
  generationParams: { type: Schema.Types.Mixed, default: {} },
  batchSize: { type: Number, default: 1 },
  completedCount: { type: Number, default: 0 },
  generatedAssetIds: { type: [String], default: [] },
  status: { type: String, default: 'queued' },
  progress: { type: Number, default: 0.0 },
  errorMessage: { type: String, default: null },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PlaythroughSchema = new Schema({
  userId: { type: String, required: true },
  worldId: { type: String, required: true },
  worldSnapshotVersion: { type: Number, required: true, default: 1 },
  name: { type: String, default: null },
  description: { type: String, default: null },
  notes: { type: String, default: null },
  status: { type: String, default: 'active' },
  currentTimestep: { type: Number, default: 0 },
  playtime: { type: Number, default: 0 },
  actionsCount: { type: Number, default: 0 },
  decisionsCount: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  lastPlayedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null },
  playerCharacterId: { type: String, default: null },
  saveData: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PlaythroughDeltaSchema = new Schema({
  playthroughId: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: String, required: true },
  operation: { type: String, required: true },
  deltaData: { type: Schema.Types.Mixed, default: null },
  fullData: { type: Schema.Types.Mixed, default: null },
  timestep: { type: Number, required: true },
  appliedAt: { type: Date, default: Date.now },
  description: { type: String, default: null },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const PlayTraceSchema = new Schema({
  playthroughId: { type: String, required: true },
  userId: { type: String, required: true },
  actionType: { type: String, required: true },
  actionName: { type: String, default: null },
  actionData: { type: Schema.Types.Mixed, default: {} },
  timestep: { type: Number, required: true },
  characterId: { type: String, default: null },
  targetId: { type: String, default: null },
  targetType: { type: String, default: null },
  locationId: { type: String, default: null },
  outcome: { type: String, default: null },
  outcomeData: { type: Schema.Types.Mixed, default: {} },
  stateChanges: { type: Schema.Types.Mixed, default: [] },
  narrativeText: { type: String, default: null },
  durationMs: { type: Number, default: null },
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const WorldLanguageSchema = new Schema({
  worldId: { type: String, required: true },
  scopeType: { type: String, required: true },
  scopeId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: null },

  kind: { type: String, required: true },
  realCode: { type: String, default: null },

  isPrimary: { type: Boolean, default: false },
  isLearningTarget: { type: Boolean, default: false },

  parentLanguageId: { type: String, default: null },
  influenceLanguageIds: { type: [String], default: [] },
  realInfluenceCodes: { type: [String], default: [] },

  config: { type: Schema.Types.Mixed, default: null },

  features: { type: Schema.Types.Mixed, default: null },
  phonemes: { type: Schema.Types.Mixed, default: null },
  grammar: { type: Schema.Types.Mixed, default: null },
  writingSystem: { type: Schema.Types.Mixed, default: null },
  culturalContext: { type: Schema.Types.Mixed, default: null },
  phoneticInventory: { type: Schema.Types.Mixed, default: null },
  sampleWords: { type: Schema.Types.Mixed, default: null },
  sampleTexts: { type: Schema.Types.Mixed, default: null },
  etymology: { type: Schema.Types.Mixed, default: null },
  dialectVariations: { type: Schema.Types.Mixed, default: null },
  learningModules: { type: Schema.Types.Mixed, default: null },

  relatedTruthIds: { type: [String], default: [] },
  culturalTruthIds: { type: [String], default: [] },
  historicalTruthIds: { type: [String], default: [] },
  idiomsAndProverbs: { type: Schema.Types.Mixed, default: [] },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const LotSchema = new Schema({
  worldId: { type: String, required: true },
  settlementId: { type: String, required: true },
  address: { type: String, required: true },
  houseNumber: { type: Number, required: true },
  streetName: { type: String, required: true },
  block: { type: String, default: null },
  districtName: { type: String, default: null },
  buildingId: { type: String, default: null },
  buildingType: { type: String, default: 'vacant' },
  positionX: { type: Number, default: null },
  positionZ: { type: Number, default: null },
  lotWidth: { type: Number, default: 12 },
  lotDepth: { type: Number, default: 16 },
  streetEdgeId: { type: String, default: null },
  distanceAlongStreet: { type: Number, default: 0 },
  side: { type: String, default: 'left' },
  blockId: { type: String, default: null },
  facingAngle: { type: Number, default: 0 },
  elevation: { type: Number, default: 0 },
  foundationType: { type: String, default: 'flat' },
  neighboringLotIds: { type: [String], default: [] },
  distanceFromDowntown: { type: Number, default: null },
  formerBuildingIds: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ResidenceSchema = new Schema({
  worldId: { type: String, required: true },
  settlementId: { type: String, required: true },
  lotId: { type: String, required: true },
  ownerIds: { type: [String], default: [] },
  residentIds: { type: [String], default: [] },
  address: { type: String, required: true },
  residenceType: { type: String, default: 'house' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BusinessMongoSchema = new Schema({
  worldId: { type: String, required: true },
  settlementId: { type: String, required: true },
  name: { type: String, required: true },
  businessType: { type: String, required: true },
  ownerId: { type: String, default: null },
  founderId: { type: String, default: null },
  isOutOfBusiness: { type: Boolean, default: false },
  foundedYear: { type: Number, default: null },
  closedYear: { type: Number, default: null },
  lotId: { type: String, default: null },
  address: { type: String, default: null },
  vacancies: { type: Schema.Types.Mixed, default: [] },
  businessData: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const OccupationSchema = new Schema({
  worldId: { type: String, required: true },
  characterId: { type: String, required: true },
  businessId: { type: String, required: true },
  vocation: { type: String, required: true },
  level: { type: Number, default: 1 },
  shift: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, default: null },
  yearsExperience: { type: Number, default: 0 },
  terminationReason: { type: String, default: null },
  predecessorId: { type: String, default: null },
  successorId: { type: String, default: null },
  isSupplemental: { type: Boolean, default: false },
  hiredAsFavor: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const LanguageChatMessageSchema = new Schema({
  languageId: { type: String, required: true },
  worldId: { type: String, required: true },
  scopeType: { type: String, default: null },
  scopeId: { type: String, default: null },
  userId: { type: String, default: null },
  role: { type: String, required: true },
  content: { type: String, required: true },
  inLanguage: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const LanguageProgressSchema = new Schema({
  playerId: { type: String, required: true },
  worldId: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  overallFluency: { type: Number, default: 0 }, // 0-100
  totalConversations: { type: Number, default: 0 },
  totalWordsLearned: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  achievements: { type: [String], default: [] },
  dailyChallenges: { type: Schema.Types.Mixed, default: [] },
  lastSessionAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
LanguageProgressSchema.index({ playerId: 1, worldId: 1 });

const VocabularyEntrySchema = new Schema({
  playerId: { type: String, required: true },
  worldId: { type: String, required: true },
  word: { type: String, required: true },
  meaning: { type: String, required: true },
  category: { type: String, default: null },
  timesEncountered: { type: Number, default: 0 },
  timesUsedCorrectly: { type: Number, default: 0 },
  masteryLevel: { type: String, default: 'new' }, // new, learning, familiar, mastered
  lastEncountered: { type: Date, default: null },
  context: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
VocabularyEntrySchema.index({ playerId: 1, worldId: 1 });

const GrammarPatternSchema = new Schema({
  playerId: { type: String, required: true },
  worldId: { type: String, required: true },
  pattern: { type: String, required: true },
  correctUsages: { type: Number, default: 0 },
  incorrectUsages: { type: Number, default: 0 },
  examples: { type: [String], default: [] },
  masteryLevel: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
GrammarPatternSchema.index({ playerId: 1, worldId: 1 });

const ConversationRecordSchema = new Schema({
  playerId: { type: String, required: true },
  worldId: { type: String, required: true },
  characterId: { type: String, required: true },
  turns: { type: Number, default: 0 },
  wordsUsed: { type: [String], default: [] },
  targetLanguagePercentage: { type: Number, default: 0 },
  fluencyGained: { type: Number, default: 0 },
  grammarErrors: { type: Schema.Types.Mixed, default: [] },
  duration: { type: Number, default: 0 }, // seconds
  createdAt: { type: Date, default: Date.now }
});
ConversationRecordSchema.index({ playerId: 1, worldId: 1 });

const LanguageAssessmentSchema = new Schema({
  playerId: { type: String, required: true },
  worldId: { type: String, required: true },
  assessmentType: { type: String, required: true }, // vocabulary, grammar, pronunciation, listening, pragmatic, cultural
  targetLanguage: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  details: { type: Schema.Types.Mixed, default: {} },
  testWindow: { type: String, default: null }, // pre, post, delayed
  studyId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});
LanguageAssessmentSchema.index({ playerId: 1, worldId: 1 });

const EvaluationResponseSchema = new Schema({
  participantId: { type: String, required: true },
  studyId: { type: String, required: true },
  instrumentType: { type: String, required: true }, // actfl_opi, sus, ssq, ipq, engagement, grammar_judgment, gap_fill, vocabulary_productive, vocabulary_receptive, listening_comprehension, discourse_completion, cultural_knowledge
  targetLanguage: { type: String, default: null },
  responses: { type: Schema.Types.Mixed, default: [] },
  score: { type: Number, default: null },
  maxScore: { type: Number, default: null },
  sessionId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});
EvaluationResponseSchema.index({ studyId: 1, participantId: 1 });
EvaluationResponseSchema.index({ studyId: 1, targetLanguage: 1 });

const TechnicalTelemetrySchema = new Schema({
  sessionId: { type: String, required: true },
  playerId: { type: String, required: true },
  worldId: { type: String, required: true },
  metricType: { type: String, required: true }, // speech_wer, dialogue_latency_ms, dialogue_quality, render_fps, error, vr_session_type, vr_comfort_settings, vr_ssq_indicators
  value: { type: Number, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});
TechnicalTelemetrySchema.index({ sessionId: 1 });
TechnicalTelemetrySchema.index({ playerId: 1, worldId: 1 });

const EngagementEventSchema = new Schema({
  sessionId: { type: String, required: true },
  playerId: { type: String, required: true },
  worldId: { type: String, default: null },
  eventType: { type: String, required: true }, // session_start, session_end, session_pause, session_resume, quest_started, quest_completed, quest_abandoned, area_explored, npc_conversation_started, npc_conversation_ended, menu_opened, menu_closed, idle_detected, frustration_signal
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});
EngagementEventSchema.index({ sessionId: 1 });
EngagementEventSchema.index({ playerId: 1 });

const ApiKeySchema = new Schema({
  key: { type: String, required: true, unique: true },
  worldId: { type: String, required: true },
  ownerId: { type: String, required: true },
  permissions: { type: [String], default: ['telemetry:write'] },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});
ApiKeySchema.index({ key: 1 });

const TerrainFeatureSchema = new Schema({
  worldId: { type: String, required: true },
  name: { type: String, required: true },
  featureType: { type: String, required: true },
  position: { type: Schema.Types.Mixed, required: true },
  radius: { type: Number, required: true },
  elevation: { type: Number, required: true },
  description: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
TerrainFeatureSchema.index({ worldId: 1 });

const WaterFeatureSchema = new Schema({
  worldId: { type: String, required: true },
  settlementId: { type: String, default: null },
  type: { type: String, required: true }, // river, lake, ocean, pond, stream, waterfall, marsh, canal
  subType: { type: String, default: 'fresh' },
  name: { type: String, required: true },
  position: { type: Schema.Types.Mixed, default: { x: 0, y: 0, z: 0 } },
  waterLevel: { type: Number, default: 0 },
  bounds: { type: Schema.Types.Mixed, default: { minX: 0, maxX: 0, minZ: 0, maxZ: 0, centerX: 0, centerZ: 0 } },
  depth: { type: Number, default: 2 },
  width: { type: Number, default: 10 },
  flowDirection: { type: Schema.Types.Mixed, default: null },
  flowSpeed: { type: Number, default: 0 },
  shorelinePoints: { type: Schema.Types.Mixed, default: [] },
  biome: { type: String, default: null },
  isNavigable: { type: Boolean, default: true },
  isDrinkable: { type: Boolean, default: true },
  modelAssetKey: { type: String, default: null },
  color: { type: Schema.Types.Mixed, default: null },
  transparency: { type: Number, default: 0.3 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
WaterFeatureSchema.index({ worldId: 1 });
WaterFeatureSchema.index({ settlementId: 1 });

const AssessmentSessionSchema = new Schema({
  playerId: { type: String, required: true },
  worldId: { type: String, required: true },
  assessmentDefinitionId: { type: String, required: true },
  assessmentType: { type: String, required: true }, // arrival, departure, periodic
  targetLanguage: { type: String, required: true },
  status: { type: String, required: true, default: 'idle' }, // idle, initializing, phase_active, phase_transitioning, scoring, complete
  phaseResults: { type: [Schema.Types.Mixed], default: [] },
  totalScore: { type: Number, default: null },
  totalMaxPoints: { type: Number, required: true },
  cefrLevel: { type: String, default: null }, // A1, A2, B1, B2
  dimensionScores: { type: Schema.Types.Mixed, default: null },
  automatedMetrics: { type: Schema.Types.Mixed, default: null },
  recordings: { type: [Schema.Types.Mixed], default: [] },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});
AssessmentSessionSchema.index({ playerId: 1, worldId: 1, assessmentType: 1 });
AssessmentSessionSchema.index({ worldId: 1, status: 1 });

// Mongoose Models
const RuleModel = mongoose.model<RuleDoc>('Rule', RuleSchema);
const GrammarModel = mongoose.model<GrammarDoc>('Grammar', GrammarSchema);
const CharacterModel = mongoose.model<CharacterDoc>('Character', CharacterSchema);
const WorldModel = mongoose.model<WorldDoc>('World', WorldSchema);
const CountryModel = mongoose.model<CountryDoc>('Country', CountrySchema);
const StateModel = mongoose.model<StateDoc>('State', StateSchema);
const SettlementModel = mongoose.model<SettlementDoc>('Settlement', SettlementSchema);
const SettlementHistoryEventModel = mongoose.model<SettlementHistoryEventDoc>('SettlementHistoryEvent', SettlementHistoryEventSchema);
const SimulationModel = mongoose.model<SimulationDoc>('Simulation', SimulationSchema);
const ActionModel = mongoose.model<ActionDoc>('Action', ActionSchema);
const TruthModel = mongoose.model<TruthDoc>('Truth', TruthSchema);
const QuestModel = mongoose.model<QuestDoc>('Quest', QuestSchema);
const ItemModel = mongoose.model<ItemDoc>('Item', ItemSchema);
const VisualAssetModel = mongoose.model<VisualAssetDoc>('VisualAsset', VisualAssetSchema);
const AssetCollectionModel = mongoose.model<AssetCollectionDoc>('AssetCollection', AssetCollectionSchema);
const GenerationJobModel = mongoose.model<GenerationJobDoc>('GenerationJob', GenerationJobSchema);
const UserModel = mongoose.model<UserDoc>('User', UserSchema);
const PlayerProgressModel = mongoose.model<PlayerProgressDoc>('PlayerProgress', PlayerProgressSchema);
const PlayerSessionModel = mongoose.model<PlayerSessionDoc>('PlayerSession', PlayerSessionSchema);
const AchievementModel = mongoose.model<AchievementDoc>('Achievement', AchievementSchema);
const PlaythroughModel = mongoose.model<PlaythroughDoc>('Playthrough', PlaythroughSchema);
const PlaythroughDeltaModel = mongoose.model<PlaythroughDeltaDoc>('PlaythroughDelta', PlaythroughDeltaSchema);
const PlayTraceModel = mongoose.model<PlayTraceDoc>('PlayTrace', PlayTraceSchema);
const WorldLanguageModel = mongoose.model<WorldLanguageDoc>('WorldLanguage', WorldLanguageSchema);
const LotModel = mongoose.model('Lot', LotSchema);
const ResidenceModel = mongoose.model('Residence', ResidenceSchema);
const BusinessMongoModel = mongoose.model('Business', BusinessMongoSchema);
const OccupationModel = mongoose.model('Occupation', OccupationSchema);
const LanguageChatMessageModel = mongoose.model<LanguageChatMessageDoc>('LanguageChatMessage', LanguageChatMessageSchema);
// Generic collection names (renamed from language-specific names).
// Run server/db/migrations/rename-collections-for-feature-modules.ts to rename
// existing collections, or start fresh — Mongoose will create the new names automatically.
const LanguageProgressModel = mongoose.model('LanguageProgress', LanguageProgressSchema, 'proficiencyprogress');
const VocabularyEntryModel = mongoose.model('VocabularyEntry', VocabularyEntrySchema, 'knowledgeentries');
const GrammarPatternModel = mongoose.model('GrammarPattern', GrammarPatternSchema, 'grammarpatterns');
const ConversationRecordModel = mongoose.model('ConversationRecord', ConversationRecordSchema, 'conversationrecords');
const LanguageAssessmentModel = mongoose.model('LanguageAssessment', LanguageAssessmentSchema, 'assessments');
const AssessmentSessionModel = mongoose.model('AssessmentSession', AssessmentSessionSchema, 'assessmentsessions');
const EvaluationResponseModel = mongoose.model('EvaluationResponse', EvaluationResponseSchema, 'evaluationresponses');
const TechnicalTelemetryModel = mongoose.model('TechnicalTelemetry', TechnicalTelemetrySchema, 'technicaltelemetry');
const EngagementEventModel = mongoose.model('EngagementEvent', EngagementEventSchema, 'engagementevents');
const ApiKeyModel = mongoose.model('ApiKey', ApiKeySchema, 'apikeys');
const TerrainFeatureModel = mongoose.model('TerrainFeature', TerrainFeatureSchema);
const WaterFeatureModel = mongoose.model('WaterFeature', WaterFeatureSchema);

function docToAssessmentSession(doc: any): AssessmentSession {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: (doc._id || obj._id).toString(),
    createdAt: obj.createdAt instanceof Date ? obj.createdAt.toISOString() : obj.createdAt,
    startedAt: obj.startedAt instanceof Date ? obj.startedAt.toISOString() : obj.startedAt,
    completedAt: obj.completedAt instanceof Date ? obj.completedAt.toISOString() : obj.completedAt,
  } as AssessmentSession;
}

// Helper to convert Mongoose doc to our type
function docToRule(doc: RuleDoc | any): Rule {
  // Check if it's a lean document (plain object) or Mongoose document
  if (doc.toObject) {
    // Mongoose document
    console.log(`[docToRule] Processing Mongoose document, has content:`, !!doc.content);
    return { ...doc.toObject(), id: doc._id.toString() };
  } else {
    // Lean document (plain object)
    console.log(`[docToRule] Processing lean document, has content:`, !!doc.content);
    return { ...doc, id: doc._id.toString() };
  }
}

/** Strip broken Tracery modifier syntax from names — e.g. "((.capitalize))" */
function sanitizeName(name: string | undefined): string | undefined {
  if (!name || !name.includes('((')) return name;
  return name.replace(/\(\(\.\w+\)\)/g, '').trim();
}

function docToGrammar(doc: GrammarDoc | any): Grammar {
  if (doc.toObject) {
    return { ...doc.toObject(), id: doc._id.toString() };
  } else {
    return { ...doc, id: doc._id.toString() };
  }
}

function docToCharacter(doc: CharacterDoc | any): Character {
  const obj = doc.toObject ? { ...doc.toObject(), id: doc._id.toString() } : { ...doc, id: doc._id.toString() };
  obj.name = sanitizeName(obj.name) ?? obj.name;
  if (obj.firstName) obj.firstName = sanitizeName(obj.firstName) ?? obj.firstName;
  if (obj.lastName) obj.lastName = sanitizeName(obj.lastName) ?? obj.lastName;
  return obj;
}

function docToWorld(doc: WorldDoc | any): World {
  if (doc.toObject) {
    return { ...doc.toObject(), id: doc._id.toString() };
  } else {
    return { ...doc, id: doc._id.toString() };
  }
}

function docToCountry(doc: CountryDoc): Country {
  const obj = { ...doc.toObject(), id: doc._id.toString() };
  obj.name = sanitizeName(obj.name) ?? obj.name;
  return obj;
}

function docToState(doc: StateDoc): State {
  const obj = { ...doc.toObject(), id: doc._id.toString() };
  obj.name = sanitizeName(obj.name) ?? obj.name;
  return obj;
}

function docToSettlement(doc: SettlementDoc): Settlement {
  const obj = { ...doc.toObject(), id: doc._id.toString() };
  obj.name = sanitizeName(obj.name) ?? obj.name;
  return obj;
}

function docToSettlementHistoryEvent(doc: SettlementHistoryEventDoc): SettlementHistoryEvent {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToSimulation(doc: SimulationDoc): Simulation {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToAction(doc: ActionDoc): Action {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToTruth(doc: TruthDoc): Truth {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToQuest(doc: QuestDoc): Quest {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToItem(doc: ItemDoc): Item {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToVisualAsset(doc: VisualAssetDoc): VisualAsset {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToAssetCollection(doc: AssetCollectionDoc): AssetCollection {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToGenerationJob(doc: GenerationJobDoc): GenerationJob {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToUser(doc: UserDoc): User {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToPlayerProgress(doc: PlayerProgressDoc): PlayerProgress {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToPlayerSession(doc: PlayerSessionDoc): PlayerSession {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToAchievement(doc: AchievementDoc): Achievement {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToPlaythrough(doc: PlaythroughDoc): Playthrough {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToPlaythroughDelta(doc: PlaythroughDeltaDoc): PlaythroughDelta {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToPlayTrace(doc: PlayTraceDoc): PlayTrace {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToWorldLanguage(doc: WorldLanguageDoc): WorldLanguage {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToLanguageChatMessage(doc: LanguageChatMessageDoc): LanguageChatMessage {
  return { ...doc.toObject(), id: doc._id.toString() };
}

export class MongoStorage implements IStorage {
  private static connectionPromise: Promise<void> | null = null;
  private static connected = false;

  constructor(private mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost:27017/insimul") {
    console.log(`MongoStorage initialized with URL: ${this.mongoUrl}`);
  }

  async connect(): Promise<void> {
    // If already connected and mongoose confirms it, return immediately
    if (MongoStorage.connected && mongoose.connection.readyState === 1) {
      return;
    }

    // If a connection is in progress, wait for it
    if (MongoStorage.connectionPromise) {
      await MongoStorage.connectionPromise;
      return;
    }

    // Otherwise, initiate connection
    console.log(`[MongoStorage] Initiating new connection...`);
    MongoStorage.connectionPromise = (async () => {
      try {
        // Only disconnect if there's a non-connected, non-disconnected state (connecting/disconnecting)
        if (mongoose.connection.readyState !== 0 && mongoose.connection.readyState !== 1) {
          console.log(`[MongoStorage] Disconnecting stale connection (state: ${mongoose.connection.readyState})`);
          await mongoose.disconnect();
        }

        // If mongoose is already connected, just mark and return
        if (mongoose.connection.readyState === 1) {
          console.log(`[MongoStorage] Mongoose already connected, reusing connection`);
          MongoStorage.connected = true;
          return;
        }

        console.log(`[MongoStorage] Connecting to MongoDB...`);
        const connectStart = Date.now();
        await mongoose.connect(this.mongoUrl, {
          serverSelectionTimeoutMS: 60000,
          socketTimeoutMS: 120000,
          connectTimeoutMS: 60000,
          maxPoolSize: 10,
          retryWrites: true,
          w: 'majority'
        });
        const connectElapsed = Date.now() - connectStart;
        console.log(`[MongoStorage] MongoDB connected successfully in ${connectElapsed}ms`);

        // Mark as connected BEFORE initializing sample data to avoid deadlock
        MongoStorage.connected = true;

      } catch (error) {
        console.error("MongoDB connection failed:", error);
        MongoStorage.connected = false;
        throw error;
      } finally {
        MongoStorage.connectionPromise = null;
      }
    })();

    await MongoStorage.connectionPromise;
  }

  async disconnect(): Promise<void> {
    if (!MongoStorage.connected) return;
    await mongoose.disconnect();
    MongoStorage.connected = false;
  }

  // World operations
  async getWorld(id: string): Promise<World | undefined> {
    await this.connect();
    const doc = await WorldModel.findById(id);
    return doc ? docToWorld(doc) : undefined;
  }

  async getWorlds(): Promise<World[]> {
    await this.connect();
    const docs = await WorldModel.find();
    return docs.map(docToWorld);
  }

  async createWorld(insertWorld: InsertWorld): Promise<World> {
    await this.connect();
    console.log("Creating world with data:", JSON.stringify(insertWorld, null, 2));
    
    try {
      const doc = await WorldModel.create({
        ...insertWorld,
        currentGeneration: 0,
        founderIds: null,
        familyTrees: null,
        buildings: null,
        landmarks: null,
        worldData: null,
        historicalEvents: null
      });
      console.log("World created successfully with ID:", doc._id);
      return docToWorld(doc);
    } catch (error) {
      console.error("Failed to create world in MongoDB:", error);
      throw error;
    }
  }

  async updateWorld(id: string, updateWorld: Partial<InsertWorld>): Promise<World | undefined> {
    await this.connect();
    const doc = await WorldModel.findByIdAndUpdate(
      id,
      { ...updateWorld, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToWorld(doc) : undefined;
  }

  async bumpWorldVersion(worldId: string): Promise<number> {
    await this.connect();
    const doc = await WorldModel.findByIdAndUpdate(
      worldId,
      { $inc: { version: 1 }, updatedAt: new Date() },
      { new: true }
    );
    if (!doc) {
      throw new Error(`World ${worldId} not found`);
    }
    return doc.version ?? 1;
  }

  async deleteWorld(id: string): Promise<boolean> {
    await this.connect();
    
    console.log(`🗑️  Deleting world ${id} with full cascade...`);
    
    // Get world to verify it exists
    const world = await WorldModel.findById(id);
    if (!world) {
      console.log(`   World ${id} not found`);
      return false;
    }
    
    console.log(`   Deleting world: ${world.name}`);
    
    // 1. Delete all rules for this world
    const rules = await RuleModel.deleteMany({ worldId: id });
    if (rules.deletedCount && rules.deletedCount > 0) {
      console.log(`   ✓ Deleted ${rules.deletedCount} rules`);
    }
    
    // 2. Delete all grammars for this world
    const grammars = await GrammarModel.deleteMany({ worldId: id });
    if (grammars.deletedCount && grammars.deletedCount > 0) {
      console.log(`   ✓ Deleted ${grammars.deletedCount} grammars`);
    }
    
    // 3. Delete all simulations for this world
    const simulations = await SimulationModel.deleteMany({ worldId: id });
    if (simulations.deletedCount && simulations.deletedCount > 0) {
      console.log(`   ✓ Deleted ${simulations.deletedCount} simulations`);
    }
    
    // 4. Delete all actions for this world
    const actions = await ActionModel.deleteMany({ worldId: id });
    if (actions.deletedCount && actions.deletedCount > 0) {
      console.log(`   ✓ Deleted ${actions.deletedCount} actions`);
    }
    
    // 5. Delete all truths for this world
    const truths = await TruthModel.deleteMany({ worldId: id });
    if (truths.deletedCount && truths.deletedCount > 0) {
      console.log(`   ✓ Deleted ${truths.deletedCount} truths`);
    }
    
    // 6. Delete all quests for this world
    const quests = await QuestModel.deleteMany({ worldId: id });
    if (quests.deletedCount && quests.deletedCount > 0) {
      console.log(`   ✓ Deleted ${quests.deletedCount} quests`);
    }
    
    // 7. Delete all characters for this world (before settlements)
    const characters = await CharacterModel.deleteMany({ worldId: id });
    if (characters.deletedCount && characters.deletedCount > 0) {
      console.log(`   ✓ Deleted ${characters.deletedCount} characters`);
    }
    
    // 8. Delete all settlements (this will also cascade to lots, businesses, residences)
    const settlements = await SettlementModel.find({ worldId: id });
    console.log(`   Found ${settlements.length} settlements to delete`);
    for (const settlement of settlements) {
      // Use the existing cascade delete for settlements
      await this.deleteSettlement(settlement._id.toString());
    }
    
    // 9. Delete all states
    const states = await StateModel.find({ worldId: id });
    console.log(`   Found ${states.length} states to delete`);
    for (const state of states) {
      await this.deleteState(state._id.toString());
    }
    
    // 10. Delete all countries
    const countries = await CountryModel.find({ worldId: id });
    console.log(`   Found ${countries.length} countries to delete`);
    for (const country of countries) {
      await this.deleteCountry(country._id.toString());
    }
    
    // 11. Delete items
    const items = await ItemModel.deleteMany({ worldId: id });
    if (items.deletedCount && items.deletedCount > 0) {
      console.log(`   ✓ Deleted ${items.deletedCount} items`);
    }

    // 12. Delete visual assets
    const visualAssets = await VisualAssetModel.deleteMany({ worldId: id });
    if (visualAssets.deletedCount && visualAssets.deletedCount > 0) {
      console.log(`   ✓ Deleted ${visualAssets.deletedCount} visual assets`);
    }

    // 13. Delete asset collections
    const assetCollections = await AssetCollectionModel.deleteMany({ worldId: id });
    if (assetCollections.deletedCount && assetCollections.deletedCount > 0) {
      console.log(`   ✓ Deleted ${assetCollections.deletedCount} asset collections`);
    }

    // 14. Delete generation jobs
    const genJobs = await GenerationJobModel.deleteMany({ worldId: id });
    if (genJobs.deletedCount && genJobs.deletedCount > 0) {
      console.log(`   ✓ Deleted ${genJobs.deletedCount} generation jobs`);
    }

    // 15. Delete player progress
    const playerProgress = await PlayerProgressModel.deleteMany({ worldId: id });
    if (playerProgress.deletedCount && playerProgress.deletedCount > 0) {
      console.log(`   ✓ Deleted ${playerProgress.deletedCount} player progress records`);
    }

    // 16. Delete player sessions
    const playerSessions = await PlayerSessionModel.deleteMany({ worldId: id });
    if (playerSessions.deletedCount && playerSessions.deletedCount > 0) {
      console.log(`   ✓ Deleted ${playerSessions.deletedCount} player sessions`);
    }

    // 17. Delete achievements
    const achievements = await AchievementModel.deleteMany({ worldId: id });
    if (achievements.deletedCount && achievements.deletedCount > 0) {
      console.log(`   ✓ Deleted ${achievements.deletedCount} achievements`);
    }

    // 18. Delete playthroughs and their deltas
    const playthroughs = await PlaythroughModel.find({ worldId: id });
    if (playthroughs.length > 0) {
      const playthroughIds = playthroughs.map(p => p._id.toString());
      const deltas = await PlaythroughDeltaModel.deleteMany({ playthroughId: { $in: playthroughIds } });
      if (deltas.deletedCount && deltas.deletedCount > 0) {
        console.log(`   ✓ Deleted ${deltas.deletedCount} playthrough deltas`);
      }
      const ptResult = await PlaythroughModel.deleteMany({ worldId: id });
      console.log(`   ✓ Deleted ${ptResult.deletedCount} playthroughs`);
    }

    // 19. Delete play traces
    const playTraces = await PlayTraceModel.deleteMany({ worldId: id });
    if (playTraces.deletedCount && playTraces.deletedCount > 0) {
      console.log(`   ✓ Deleted ${playTraces.deletedCount} play traces`);
    }

    // 20. Delete world languages
    const worldLanguages = await WorldLanguageModel.deleteMany({ worldId: id });
    if (worldLanguages.deletedCount && worldLanguages.deletedCount > 0) {
      console.log(`   ✓ Deleted ${worldLanguages.deletedCount} world languages`);
    }

    // 21. Delete language chat messages
    const langMessages = await LanguageChatMessageModel.deleteMany({ worldId: id });
    if (langMessages.deletedCount && langMessages.deletedCount > 0) {
      console.log(`   ✓ Deleted ${langMessages.deletedCount} language chat messages`);
    }

    // 22. Finally, delete the world itself
    const result = await WorldModel.findByIdAndDelete(id);
    
    if (result) {
      console.log(`✅ World ${id} (${world.name}) and all associated data deleted successfully`);
    }
    
    return !!result;
  }

  // Country operations
  async getCountry(id: string): Promise<Country | undefined> {
    await this.connect();
    const doc = await CountryModel.findById(id);
    return doc ? docToCountry(doc) : undefined;
  }

  async getCountriesByWorld(worldId: string): Promise<Country[]> {
    await this.connect();
    const docs = await CountryModel.find({ worldId });
    return docs.map(docToCountry);
  }

  async createCountry(insertCountry: InsertCountry): Promise<Country> {
    await this.connect();
    const doc = await CountryModel.create(insertCountry);
    return docToCountry(doc);
  }

  async updateCountry(id: string, updateCountry: Partial<InsertCountry>): Promise<Country | undefined> {
    await this.connect();
    const doc = await CountryModel.findByIdAndUpdate(
      id,
      { ...updateCountry, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToCountry(doc) : undefined;
  }

  async deleteCountry(id: string): Promise<boolean> {
    await this.connect();
    
    console.log(`🗑️  Deleting country ${id} with cascade...`);
    
    // Cascade delete: Get all states in this country
    const states = await StateModel.find({ countryId: id });
    console.log(`   Found ${states.length} states to delete`);
    
    // Delete all states (which will cascade delete settlements, etc.)
    for (const state of states) {
      await this.deleteState(state._id.toString());
    }
    
    // Get all settlements directly in this country (without state)
    const settlements = await SettlementModel.find({ countryId: id, stateId: null });
    console.log(`   Found ${settlements.length} direct settlements to delete`);
    
    // Delete all settlements (which will cascade delete characters, lots, businesses, etc.)
    for (const settlement of settlements) {
      await this.deleteSettlement(settlement._id.toString());
    }
    
    // Delete any characters that might have currentLocation set to this country ID
    // (They should be in settlements, but cleanup any edge cases)
    const orphanedChars = await CharacterModel.deleteMany({ currentLocation: id });
    if (orphanedChars.deletedCount && orphanedChars.deletedCount > 0) {
      console.log(`   Deleted ${orphanedChars.deletedCount} orphaned characters`);
    }
    
    // Delete any rules, actions, simulations, truth entries for this country's world
    // Note: These are world-scoped, not country-scoped, so we don't delete them here
    
    // Finally delete the country itself
    const result = await CountryModel.findByIdAndDelete(id);
    console.log(`   ✅ Country ${id} deleted successfully`);
    return !!result;
  }

  // State operations
  async getState(id: string): Promise<State | undefined> {
    await this.connect();
    const doc = await StateModel.findById(id);
    return doc ? docToState(doc) : undefined;
  }

  async getStatesByWorld(worldId: string): Promise<State[]> {
    await this.connect();
    const docs = await StateModel.find({ worldId });
    return docs.map(docToState);
  }

  async getStatesByCountry(countryId: string): Promise<State[]> {
    await this.connect();
    const docs = await StateModel.find({ countryId });
    return docs.map(docToState);
  }

  async createState(insertState: InsertState): Promise<State> {
    await this.connect();
    const doc = await StateModel.create(insertState);
    return docToState(doc);
  }

  async updateState(id: string, updateState: Partial<InsertState>): Promise<State | undefined> {
    await this.connect();
    const doc = await StateModel.findByIdAndUpdate(
      id,
      { ...updateState, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToState(doc) : undefined;
  }

  async deleteState(id: string): Promise<boolean> {
    await this.connect();
    
    console.log(`   🗑️  Deleting state ${id} with cascade...`);
    
    // Cascade delete: Get all settlements in this state
    const settlements = await SettlementModel.find({ stateId: id });
    console.log(`      Found ${settlements.length} settlements to delete`);
    
    // Delete all settlements (which will cascade delete characters, lots, businesses, etc.)
    for (const settlement of settlements) {
      await this.deleteSettlement(settlement._id.toString());
    }
    
    // Delete any characters that might have currentLocation set to this state ID
    // (They should be in settlements, but cleanup any edge cases)
    const orphanedChars = await CharacterModel.deleteMany({ currentLocation: id });
    if (orphanedChars.deletedCount && orphanedChars.deletedCount > 0) {
      console.log(`      Deleted ${orphanedChars.deletedCount} orphaned characters`);
    }
    
    // Finally delete the state itself
    const result = await StateModel.findByIdAndDelete(id);
    console.log(`      ✅ State ${id} deleted`);
    return !!result;
  }

  // Settlement operations
  async getSettlement(id: string): Promise<Settlement | undefined> {
    await this.connect();
    const doc = await SettlementModel.findById(id);
    return doc ? docToSettlement(doc) : undefined;
  }

  async getSettlementsByWorld(worldId: string): Promise<Settlement[]> {
    await this.connect();
    const docs = await SettlementModel.find({ worldId });
    return docs.map(docToSettlement);
  }

  async getSettlementsByCountry(countryId: string): Promise<Settlement[]> {
    await this.connect();
    const docs = await SettlementModel.find({ countryId });
    return docs.map(docToSettlement);
  }

  async getSettlementsByState(stateId: string): Promise<Settlement[]> {
    await this.connect();
    const docs = await SettlementModel.find({ stateId });
    return docs.map(docToSettlement);
  }

  async createSettlement(insertSettlement: InsertSettlement): Promise<Settlement> {
    await this.connect();
    const doc = await SettlementModel.create(insertSettlement);
    return docToSettlement(doc);
  }

  async updateSettlement(id: string, updateSettlement: Partial<InsertSettlement>): Promise<Settlement | undefined> {
    await this.connect();
    const doc = await SettlementModel.findByIdAndUpdate(
      id,
      { ...updateSettlement, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToSettlement(doc) : undefined;
  }

  async deleteSettlement(id: string): Promise<boolean> {
    await this.connect();
    
    console.log(`      🗑️  Deleting settlement ${id} with cascade...`);
    
    // Cascade delete: Delete all characters in this settlement
    const characters = await CharacterModel.find({ currentLocation: id });
    console.log(`         Found ${characters.length} characters to delete`);
    
    for (const character of characters) {
      await CharacterModel.findByIdAndDelete(character._id);
    }
    
    // Delete characters who might have this settlement in other location fields
    const residenceChars = await CharacterModel.deleteMany({ currentResidenceId: id });
    if (residenceChars.deletedCount && residenceChars.deletedCount > 0) {
      console.log(`         Deleted ${residenceChars.deletedCount} characters by residence`);
    }
    
    // Note: Lots, Businesses, and Residences are stub implementations
    // When they get proper schemas, add cascade delete here:
    // - await LotModel.deleteMany({ settlementId: id });
    // - await BusinessModel.deleteMany({ settlementId: id });
    // - await ResidenceModel.deleteMany({ settlementId: id });
    
    // Finally delete the settlement itself
    const result = await SettlementModel.findByIdAndDelete(id);
    console.log(`         ✅ Settlement ${id} deleted (${characters.length} characters removed)`);
    return !!result;
  }

  // Settlement History Event operations
  async getSettlementHistoryEvent(id: string): Promise<SettlementHistoryEvent | undefined> {
    await this.connect();
    const doc = await SettlementHistoryEventModel.findById(id);
    return doc ? docToSettlementHistoryEvent(doc) : undefined;
  }

  async getSettlementHistoryBySettlement(settlementId: string): Promise<SettlementHistoryEvent[]> {
    await this.connect();
    const docs = await SettlementHistoryEventModel.find({ settlementId }).sort({ year: 1, timestep: 1 });
    return docs.map(docToSettlementHistoryEvent);
  }

  async getSettlementHistoryByWorld(worldId: string): Promise<SettlementHistoryEvent[]> {
    await this.connect();
    const docs = await SettlementHistoryEventModel.find({ worldId }).sort({ year: 1, timestep: 1 });
    return docs.map(docToSettlementHistoryEvent);
  }

  async createSettlementHistoryEvent(event: InsertSettlementHistoryEvent): Promise<SettlementHistoryEvent> {
    await this.connect();
    const doc = await SettlementHistoryEventModel.create(event);
    return docToSettlementHistoryEvent(doc);
  }

  async deleteSettlementHistoryEvent(id: string): Promise<boolean> {
    await this.connect();
    const result = await SettlementHistoryEventModel.findByIdAndDelete(id);
    return !!result;
  }

  // Lot operations
  async getLot(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await LotModel.findById(id);
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async getLotsBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await LotModel.find({ settlementId });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async createLot(lot: any): Promise<any> {
    await this.connect();
    const doc = await new LotModel(lot).save();
    return { ...doc.toObject(), id: doc._id.toString() };
  }

  async updateLot(id: string, lot: any): Promise<any | undefined> {
    await this.connect();
    const doc = await LotModel.findByIdAndUpdate(id, { ...lot, updatedAt: new Date() }, { new: true });
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async deleteLot(id: string): Promise<boolean> {
    await this.connect();
    const result = await LotModel.findByIdAndDelete(id);
    return !!result;
  }

  async createLotsInBulk(lots: any[]): Promise<any[]> {
    await this.connect();
    const docs = await LotModel.insertMany(lots);
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  // Business operations
  async getBusiness(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await BusinessMongoModel.findById(id);
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async getBusinessesBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await BusinessMongoModel.find({ settlementId });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async getBusinessesByWorld(worldId: string): Promise<any[]> {
    await this.connect();
    const docs = await BusinessMongoModel.find({ worldId });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async createBusiness(business: any): Promise<any> {
    await this.connect();
    const doc = await new BusinessMongoModel(business).save();
    return { ...doc.toObject(), id: doc._id.toString() };
  }

  async updateBusiness(id: string, business: any): Promise<any | undefined> {
    await this.connect();
    const doc = await BusinessMongoModel.findByIdAndUpdate(id, { ...business, updatedAt: new Date() }, { new: true });
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async deleteBusiness(id: string): Promise<boolean> {
    await this.connect();
    const result = await BusinessMongoModel.findByIdAndDelete(id);
    return !!result;
  }

  async createBusinessesInBulk(businesses: any[]): Promise<any[]> {
    await this.connect();
    const docs = await BusinessMongoModel.insertMany(businesses);
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  // Residence operations
  async getResidence(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await ResidenceModel.findById(id);
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async getResidencesBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await ResidenceModel.find({ settlementId });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async createResidence(residence: any): Promise<any> {
    await this.connect();
    const doc = await new ResidenceModel(residence).save();
    return { ...doc.toObject(), id: doc._id.toString() };
  }

  async updateResidence(id: string, residence: any): Promise<any | undefined> {
    await this.connect();
    const doc = await ResidenceModel.findByIdAndUpdate(id, { ...residence, updatedAt: new Date() }, { new: true });
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async deleteResidence(id: string): Promise<boolean> {
    await this.connect();
    const result = await ResidenceModel.findByIdAndDelete(id);
    return !!result;
  }

  async createResidencesInBulk(residences: any[]): Promise<any[]> {
    await this.connect();
    const docs = await ResidenceModel.insertMany(residences);
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  // Occupation operations
  async getOccupation(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await OccupationModel.findById(id);
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async getOccupationsByCharacter(characterId: string): Promise<any[]> {
    await this.connect();
    const docs = await OccupationModel.find({ characterId });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async getOccupationsByBusiness(businessId: string): Promise<any[]> {
    await this.connect();
    const docs = await OccupationModel.find({ businessId });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async getCurrentOccupation(characterId: string): Promise<any | undefined> {
    await this.connect();
    const doc = await OccupationModel.findOne({ characterId, endYear: null });
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async createOccupation(occupation: any): Promise<any> {
    await this.connect();
    const doc = await new OccupationModel(occupation).save();
    return { ...doc.toObject(), id: doc._id.toString() };
  }

  async updateOccupation(id: string, occupation: any): Promise<any | undefined> {
    await this.connect();
    const doc = await OccupationModel.findByIdAndUpdate(id, { ...occupation, updatedAt: new Date() }, { new: true });
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async deleteOccupation(id: string): Promise<boolean> {
    await this.connect();
    const result = await OccupationModel.findByIdAndDelete(id);
    return !!result;
  }

  // Rule operations
  async getRule(id: string): Promise<Rule | undefined> {
    await this.connect();
    const doc = await RuleModel.findById(id);
    return doc ? docToRule(doc) : undefined;
  }

  async getRuleWithContent(id: string): Promise<Rule | undefined> {
    await this.connect();
    const doc = await RuleModel.findById(id);
    if (!doc) return undefined;
    
    // Return full rule with content
    return docToRule(doc);
  }

  async getRulesByWorld(worldId: string): Promise<Rule[]> {
    await this.connect();
    const docs = await RuleModel.find({ worldId });
    return docs.map(docToRule);
  }

  async getBaseRules(options?: { page?: number; limit?: number; includeContent?: boolean }): Promise<Rule[]> {
    await this.connect();
    
    // Default pagination options
    const page = options?.page || 1;
    const limit = options?.limit || 100;
    const skip = (page - 1) * limit;
    const includeContent = options?.includeContent ?? false; // Default to false for better performance
    
    console.log(`[MongoStorage] getBaseRules: Executing paginated query { isBase: true }, page ${page}, limit ${limit}, includeContent: ${includeContent}`);
    const startTime = Date.now();
    
    // Build projection based on whether we need content
    const projection: Record<string, 1 | 0> = includeContent
      ? { _id: 1, worldId: 1, isBase: 1, content: 1, name: 1, description: 1,
          sourceFormat: 1, ruleType: 1, category: 1, priority: 1, likelihood: 1,
          tags: 1, isActive: 1, createdAt: 1, updatedAt: 1 }
      : { _id: 1, worldId: 1, isBase: 1, name: 1, description: 1,
          sourceFormat: 1, ruleType: 1, category: 1, priority: 1, likelihood: 1,
          tags: 1, isActive: 1, createdAt: 1, updatedAt: 1 };
    
    console.log(`[MongoStorage] Using projection:`, projection);
    
    // Use paginated query with just isBase: true
    const query = RuleModel
      .find({ isBase: true })
      .lean()
      .select(projection)
      .skip(skip)
      .limit(limit);
    
    console.log(`[MongoStorage] Executing query:`, query.getQuery());
    const docs = await query;
    
    // Filter for worldId: null in application
    const baseRules = docs.filter(doc => doc.worldId === null);
    
    const elapsed = Date.now() - startTime;
    console.log(`[MongoStorage] getBaseRules: Query completed in ${elapsed}ms, page ${page} returned ${docs.length} rules with isBase:true, ${baseRules.length} with worldId:null`);
    
    return baseRules.map(docToRule);
  }
  
  // New method to get all base rules with pagination (for export)
  async getAllBaseRulesPaginated(): Promise<Rule[]> {
    await this.connect();
    console.log(`[MongoStorage] getAllBaseRulesPaginated: Fetching all base rules in batches`);
    const startTime = Date.now();
    
    const allRules: Rule[] = [];
    const pageSize = 50;
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      // For export, we need the content, so include it
      const rules = await this.getBaseRules({ page, limit: pageSize, includeContent: true });
      if (rules.length === 0) {
        hasMore = false;
      } else {
        allRules.push(...rules);
        console.log(`[MongoStorage] Fetched ${rules.length} rules, total: ${allRules.length}`);
        if (rules.length < pageSize) hasMore = false;
        page++;
      }
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`[MongoStorage] getAllBaseRulesPaginated: Completed in ${elapsed}ms, total rules: ${allRules.length}`);
    
    return allRules;
  }

  async getBaseRulesByCategory(category: string): Promise<Rule[]> {
    await this.connect();
    const docs = await RuleModel.find({ isBase: true, worldId: null, category });
    return docs.map(docToRule);
  }

  async createRule(insertRule: InsertRule): Promise<Rule> {
    await this.connect();
    const doc = await RuleModel.create(insertRule);
    return docToRule(doc);
  }

  async updateRule(id: string, updateRule: Partial<InsertRule>): Promise<Rule | undefined> {
    await this.connect();
    const doc = await RuleModel.findByIdAndUpdate(
      id,
      { ...updateRule, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToRule(doc) : undefined;
  }

  async deleteRule(id: string): Promise<boolean> {
    await this.connect();
    const result = await RuleModel.findByIdAndDelete(id);
    return !!result;
  }

  // Grammar operations
  async getGrammar(id: string): Promise<Grammar | undefined> {
    await this.connect();
    const doc = await GrammarModel.findById(id);
    return doc ? docToGrammar(doc) : undefined;
  }

  async getGrammarByName(worldId: string, name: string): Promise<Grammar | undefined> {
    await this.connect();
    const doc = await GrammarModel.findOne({ worldId, name });
    return doc ? docToGrammar(doc) : undefined;
  }

  async getGrammarsByWorld(worldId: string): Promise<Grammar[]> {
    await this.connect();
    const docs = await GrammarModel.find({ worldId });
    return docs.map(docToGrammar);
  }

  async createGrammar(insertGrammar: InsertGrammar): Promise<Grammar> {
    await this.connect();
    const doc = await GrammarModel.create(insertGrammar);
    return docToGrammar(doc);
  }

  async updateGrammar(id: string, grammar: Partial<InsertGrammar>): Promise<Grammar | undefined> {
    await this.connect();
    const doc = await GrammarModel.findByIdAndUpdate(id, { ...grammar, updatedAt: new Date() }, { new: true });
    return doc ? docToGrammar(doc) : undefined;
  }

  async deleteGrammar(id: string): Promise<boolean> {
    await this.connect();
    const result = await GrammarModel.findByIdAndDelete(id);
    return !!result;
  }

  // Character operations
  async getCharacter(id: string): Promise<Character | undefined> {
    await this.connect();
    const doc = await CharacterModel.findById(id);
    return doc ? docToCharacter(doc) : undefined;
  }

  async getCharactersByWorld(worldId: string): Promise<Character[]> {
    await this.connect();
    const docs = await CharacterModel.find({ worldId });
    return docs.map(docToCharacter);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    await this.connect();
    const doc = await CharacterModel.create({
      ...insertCharacter,
      maidenName: null,
      birthYear: null,
      isAlive: true,
      generationConfig: null,
      status: null
    });
    return docToCharacter(doc);
  }

  async updateCharacter(id: string, updateCharacter: Partial<InsertCharacter>): Promise<Character | undefined> {
    await this.connect();
    const doc = await CharacterModel.findByIdAndUpdate(
      id,
      { ...updateCharacter, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToCharacter(doc) : undefined;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    await this.connect();
    const result = await CharacterModel.findByIdAndDelete(id);
    return !!result;
  }

  // Simulation operations
  async getSimulation(id: string): Promise<Simulation | undefined> {
    await this.connect();
    const doc = await SimulationModel.findById(id);
    return doc ? docToSimulation(doc) : undefined;
  }

  async getSimulationsByWorld(worldId: string): Promise<Simulation[]> {
    await this.connect();
    const docs = await SimulationModel.find({ worldId });
    return docs.map(docToSimulation);
  }

  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    await this.connect();
    const doc = await SimulationModel.create({
      ...insertSimulation,
      currentTime: insertSimulation.startTime ?? 0,
      socialRecord: null,
      narrativeOutput: null,
      errorLog: null,
      executionTime: null,
      rulesExecuted: null,
      eventsGenerated: null
    });
    return docToSimulation(doc);
  }

  async updateSimulation(id: string, updateSimulation: Partial<InsertSimulation>): Promise<Simulation | undefined> {
    await this.connect();
    const doc = await SimulationModel.findByIdAndUpdate(
      id,
      { ...updateSimulation, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToSimulation(doc) : undefined;
  }

  async deleteSimulation(id: string): Promise<boolean> {
    await this.connect();
    const result = await SimulationModel.findByIdAndDelete(id);
    return !!result;
  }

  // Action operations
  async getAction(id: string): Promise<Action | undefined> {
    await this.connect();
    const doc = await ActionModel.findById(id);
    return doc ? docToAction(doc) : undefined;
  }

  async getActionsByWorld(worldId: string): Promise<Action[]> {
    await this.connect();
    const docs = await ActionModel.find({ worldId });
    return docs.map(docToAction);
  }

  async getActionsByType(worldId: string, actionType: string): Promise<Action[]> {
    await this.connect();
    const docs = await ActionModel.find({ worldId, actionType });
    return docs.map(docToAction);
  }

  async getBaseActions(): Promise<Action[]> {
    await this.connect();
    const docs = await ActionModel.find({ isBase: true, worldId: null });
    return docs.map(docToAction);
  }

  async getBaseActionsByType(actionType: string): Promise<Action[]> {
    await this.connect();
    const docs = await ActionModel.find({ isBase: true, worldId: null, actionType });
    return docs.map(docToAction);
  }

  async createAction(insertAction: InsertAction): Promise<Action> {
    await this.connect();
    const doc = await ActionModel.create(insertAction);
    return docToAction(doc);
  }

  async updateAction(id: string, updateAction: Partial<InsertAction>): Promise<Action | undefined> {
    await this.connect();
    const doc = await ActionModel.findByIdAndUpdate(
      id,
      { ...updateAction, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToAction(doc) : undefined;
  }

  async deleteAction(id: string): Promise<boolean> {
    await this.connect();
    const result = await ActionModel.findByIdAndDelete(id);
    return !!result;
  }

  // Truths
  async getTruth(id: string): Promise<Truth | undefined> {
    await this.connect();
    const doc = await TruthModel.findById(id);
    return doc ? docToTruth(doc) : undefined;
  }

  async getTruthsByWorld(worldId: string): Promise<Truth[]> {
    await this.connect();
    const docs = await TruthModel.find({ worldId });
    return docs.map(docToTruth);
  }

  async getTruthsByCharacter(characterId: string): Promise<Truth[]> {
    await this.connect();
    const docs = await TruthModel.find({ characterId });
    return docs.map(docToTruth);
  }

  async createTruth(entry: InsertTruth): Promise<Truth> {
    await this.connect();
    const doc = await TruthModel.create(entry);
    return docToTruth(doc);
  }

  async updateTruth(id: string, entry: Partial<InsertTruth>): Promise<Truth | undefined> {
    await this.connect();
    const doc = await TruthModel.findByIdAndUpdate(
      id,
      { ...entry, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToTruth(doc) : undefined;
  }

  async deleteTruth(id: string): Promise<boolean> {
    await this.connect();
    const result = await TruthModel.findByIdAndDelete(id);
    return !!result;
  }

  // Quests
  async getQuest(id: string): Promise<Quest | undefined> {
    await this.connect();
    const doc = await QuestModel.findById(id);
    return doc ? docToQuest(doc) : undefined;
  }

  async getQuestsByWorld(worldId: string): Promise<Quest[]> {
    await this.connect();
    const docs = await QuestModel.find({ worldId });
    return docs.map(docToQuest);
  }

  async getQuestsByPlayer(playerName: string): Promise<Quest[]> {
    await this.connect();
    const docs = await QuestModel.find({ assignedTo: playerName });
    return docs.map(docToQuest);
  }

  async getQuestsByPlayerCharacterId(characterId: string): Promise<Quest[]> {
    await this.connect();
    const docs = await QuestModel.find({ assignedToCharacterId: characterId });
    return docs.map(docToQuest);
  }

  async createQuest(quest: InsertQuest): Promise<Quest> {
    await this.connect();
    const doc = await QuestModel.create(quest);
    return docToQuest(doc);
  }

  async updateQuest(id: string, quest: Partial<InsertQuest>): Promise<Quest | undefined> {
    await this.connect();
    const doc = await QuestModel.findByIdAndUpdate(id, { ...quest, updatedAt: new Date() }, { new: true });
    return doc ? docToQuest(doc) : undefined;
  }

  async deleteQuest(id: string): Promise<boolean> {
    await this.connect();
    const result = await QuestModel.findByIdAndDelete(id);
    return !!result;
  }

  // ============= ITEMS =============

  async getItem(id: string): Promise<Item | undefined> {
    await this.connect();
    const doc = await ItemModel.findById(id);
    return doc ? docToItem(doc) : undefined;
  }

  async getItemsByWorld(worldId: string): Promise<Item[]> {
    await this.connect();
    // Get world-specific items
    const worldItems = await ItemModel.find({ worldId });
    // Get ALL base items (available to every world)
    const baseItems = await ItemModel.find({ isBase: true });
    // Merge: world items override base items with same objectRole
    const worldObjectRoles = new Set(worldItems.map(d => d.objectRole).filter(Boolean));
    const filteredBase = baseItems.filter(b => !b.objectRole || !worldObjectRoles.has(b.objectRole));
    return [...worldItems.map(docToItem), ...filteredBase.map(docToItem)];
  }

  async getBaseItems(worldType?: string): Promise<Item[]> {
    await this.connect();
    const query: any = { isBase: true };
    if (worldType) {
      query.$or = [{ worldType }, { worldType: null }, { worldType: { $exists: false } }];
    }
    const docs = await ItemModel.find(query);
    return docs.map(docToItem);
  }

  async createItem(item: InsertItem): Promise<Item> {
    await this.connect();
    const doc = await ItemModel.create(item);
    return docToItem(doc);
  }

  async updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined> {
    await this.connect();
    const doc = await ItemModel.findByIdAndUpdate(id, { ...item, updatedAt: new Date() }, { new: true });
    return doc ? docToItem(doc) : undefined;
  }

  async deleteItem(id: string): Promise<boolean> {
    await this.connect();
    const result = await ItemModel.findByIdAndDelete(id);
    return !!result;
  }

  // ============= VISUAL ASSETS =============

  async getVisualAsset(id: string): Promise<VisualAsset | undefined> {
    await this.connect();
    const doc = await VisualAssetModel.findById(id);
    return doc ? docToVisualAsset(doc) : undefined;
  }

  async getAllVisualAssets(): Promise<VisualAsset[]> {
    await this.connect();
    const docs = await VisualAssetModel.find({});
    return docs.map(docToVisualAsset);
  }

  async getVisualAssetsByWorld(worldId: string): Promise<VisualAsset[]> {
    await this.connect();
    const docs = await VisualAssetModel.find({ worldId });
    return docs.map(docToVisualAsset);
  }

  async getVisualAssetsByType(worldId: string, assetType: string): Promise<VisualAsset[]> {
    await this.connect();
    const docs = await VisualAssetModel.find({ worldId, assetType });
    return docs.map(docToVisualAsset);
  }

  async getVisualAssetsByEntity(entityId: string, entityType: string): Promise<VisualAsset[]> {
    await this.connect();
    // Entity-specific fields have been removed from visual assets
    // Assets are now organized through asset collections instead
    // This method is deprecated and returns empty array
    return [];
  }

  async createVisualAsset(asset: InsertVisualAsset): Promise<VisualAsset> {
    await this.connect();
    const doc = await VisualAssetModel.create(asset);
    return docToVisualAsset(doc);
  }

  async updateVisualAsset(id: string, asset: Partial<InsertVisualAsset>): Promise<VisualAsset | undefined> {
    await this.connect();
    const doc = await VisualAssetModel.findByIdAndUpdate(id, { ...asset, updatedAt: new Date() }, { new: true });
    return doc ? docToVisualAsset(doc) : undefined;
  }

  async deleteVisualAsset(id: string): Promise<boolean> {
    await this.connect();
    const result = await VisualAssetModel.findByIdAndDelete(id);
    return !!result;
  }

  async getVisualAssetsByIds(ids: string[]): Promise<VisualAsset[]> {
    await this.connect();
    const docs = await VisualAssetModel.find({ _id: { $in: ids } });
    return docs.map(docToVisualAsset);
  }

  async getVisualAssetsForCleanup(options: { worldId?: string; status?: string; olderThan?: Date | null }): Promise<VisualAsset[]> {
    await this.connect();
    const query: any = {};

    if (options.worldId) {
      query.worldId = options.worldId;
    }

    if (options.status) {
      query.status = options.status;
    }

    if (options.olderThan) {
      query.createdAt = { $lt: options.olderThan };
    }

    const docs = await VisualAssetModel.find(query);
    return docs.map(docToVisualAsset);
  }

  // ============= ASSET COLLECTIONS =============

  async getAssetCollection(id: string): Promise<AssetCollection | undefined> {
    await this.connect();
    const doc = await AssetCollectionModel.findById(id);
    return doc ? docToAssetCollection(doc) : undefined;
  }

  async getAllAssetCollections(): Promise<AssetCollection[]> {
    await this.connect();
    const docs = await AssetCollectionModel.find({});
    return docs.map(docToAssetCollection);
  }

  async getAssetCollectionsByWorld(worldId: string): Promise<AssetCollection[]> {
    await this.connect();
    const docs = await AssetCollectionModel.find({ worldId });
    return docs.map(docToAssetCollection);
  }

  async createAssetCollection(collection: InsertAssetCollection): Promise<AssetCollection> {
    await this.connect();
    const doc = await AssetCollectionModel.create(collection);
    return docToAssetCollection(doc);
  }

  async updateAssetCollection(id: string, collection: Partial<InsertAssetCollection>): Promise<AssetCollection | undefined> {
    await this.connect();
    const doc = await AssetCollectionModel.findByIdAndUpdate(id, { ...collection, updatedAt: new Date() }, { new: true });
    return doc ? docToAssetCollection(doc) : undefined;
  }

  async deleteAssetCollection(id: string): Promise<boolean> {
    await this.connect();
    const result = await AssetCollectionModel.findByIdAndDelete(id);
    return !!result;
  }

  // ============= GENERATION JOBS =============

  async getGenerationJob(id: string): Promise<GenerationJob | undefined> {
    await this.connect();
    const doc = await GenerationJobModel.findById(id);
    return doc ? docToGenerationJob(doc) : undefined;
  }

  async getGenerationJobsByWorld(worldId: string): Promise<GenerationJob[]> {
    await this.connect();
    const docs = await GenerationJobModel.find({ worldId });
    return docs.map(docToGenerationJob);
  }

  async getGenerationJobsByStatus(worldId: string, status: string): Promise<GenerationJob[]> {
    await this.connect();
    const docs = await GenerationJobModel.find({ worldId, status });
    return docs.map(docToGenerationJob);
  }

  async createGenerationJob(job: InsertGenerationJob): Promise<GenerationJob> {
    await this.connect();
    const doc = await GenerationJobModel.create(job);
    return docToGenerationJob(doc);
  }

  async updateGenerationJob(id: string, job: Partial<InsertGenerationJob>): Promise<GenerationJob | undefined> {
    await this.connect();
    const doc = await GenerationJobModel.findByIdAndUpdate(id, { ...job, updatedAt: new Date() }, { new: true });
    return doc ? docToGenerationJob(doc) : undefined;
  }

  async deleteGenerationJob(id: string): Promise<boolean> {
    await this.connect();
    const result = await GenerationJobModel.findByIdAndDelete(id);
    return !!result;
  }

  async getWorldLanguage(id: string): Promise<WorldLanguage | undefined> {
    await this.connect();
    const doc = await WorldLanguageModel.findById(id);
    return doc ? docToWorldLanguage(doc) : undefined;
  }

  async getWorldLanguagesByWorld(worldId: string): Promise<WorldLanguage[]> {
    await this.connect();
    const docs = await WorldLanguageModel.find({ worldId });
    return docs.map(docToWorldLanguage);
  }

  async getWorldLanguagesByScope(
    worldId: string,
    scopeType: LanguageScopeType,
    scopeId: string
  ): Promise<WorldLanguage[]> {
    await this.connect();
    const docs = await WorldLanguageModel.find({ worldId, scopeType, scopeId });
    return docs.map(docToWorldLanguage);
  }

  async createWorldLanguage(language: InsertWorldLanguage): Promise<WorldLanguage> {
    await this.connect();
    const doc = await WorldLanguageModel.create(language);
    return docToWorldLanguage(doc);
  }

  async updateWorldLanguage(
    id: string,
    language: Partial<InsertWorldLanguage>
  ): Promise<WorldLanguage | undefined> {
    await this.connect();
    const doc = await WorldLanguageModel.findByIdAndUpdate(
      id,
      { ...language, updatedAt: new Date() },
      { new: true }
    );
    return doc ? docToWorldLanguage(doc) : undefined;
  }

  async deleteWorldLanguage(id: string): Promise<boolean> {
    await this.connect();
    const result = await WorldLanguageModel.findByIdAndDelete(id);
    if (result) {
      await LanguageChatMessageModel.deleteMany({ languageId: id });
    }
    return !!result;
  }

  async getLanguageChatMessages(languageId: string): Promise<LanguageChatMessage[]> {
    await this.connect();
    const docs = await LanguageChatMessageModel.find({ languageId }).sort({ createdAt: 1 });
    return docs.map(docToLanguageChatMessage);
  }

  async createLanguageChatMessage(
    message: InsertLanguageChatMessage
  ): Promise<LanguageChatMessage> {
    await this.connect();
    const doc = await LanguageChatMessageModel.create(message);
    return docToLanguageChatMessage(doc);
  }

  // ===== User Management =====
  async getUser(id: string): Promise<User | undefined> {
    await this.connect();
    const doc = await UserModel.findById(id);
    return doc ? docToUser(doc) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.connect();
    const doc = await UserModel.findOne({ username });
    return doc ? docToUser(doc) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.connect();
    const doc = await UserModel.findOne({ email });
    return doc ? docToUser(doc) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    await this.connect();
    const doc = await UserModel.create(user);
    return docToUser(doc);
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    await this.connect();
    const doc = await UserModel.findByIdAndUpdate(id, { ...user, updatedAt: new Date() }, { new: true });
    return doc ? docToUser(doc) : undefined;
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.connect();
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }

  // ===== Player Progress =====
  async getPlayerProgress(id: string): Promise<PlayerProgress | undefined> {
    await this.connect();
    const doc = await PlayerProgressModel.findById(id);
    return doc ? docToPlayerProgress(doc) : undefined;
  }

  async getPlayerProgressByUser(userId: string, worldId: string): Promise<PlayerProgress | undefined> {
    await this.connect();
    const doc = await PlayerProgressModel.findOne({ userId, worldId });
    return doc ? docToPlayerProgress(doc) : undefined;
  }

  async getPlayerProgressesByUser(userId: string): Promise<PlayerProgress[]> {
    await this.connect();
    const docs = await PlayerProgressModel.find({ userId });
    return docs.map(docToPlayerProgress);
  }

  async createPlayerProgress(progress: InsertPlayerProgress): Promise<PlayerProgress> {
    await this.connect();
    const doc = await PlayerProgressModel.create(progress);
    return docToPlayerProgress(doc);
  }

  async updatePlayerProgress(id: string, progress: Partial<InsertPlayerProgress>): Promise<PlayerProgress | undefined> {
    await this.connect();
    const doc = await PlayerProgressModel.findByIdAndUpdate(id, { ...progress, updatedAt: new Date() }, { new: true });
    return doc ? docToPlayerProgress(doc) : undefined;
  }

  async deletePlayerProgress(id: string): Promise<boolean> {
    await this.connect();
    const result = await PlayerProgressModel.findByIdAndDelete(id);
    return !!result;
  }

  // ===== Player Sessions =====
  async getPlayerSession(id: string): Promise<PlayerSession | undefined> {
    await this.connect();
    const doc = await PlayerSessionModel.findById(id);
    return doc ? docToPlayerSession(doc) : undefined;
  }

  async getPlayerSessionsByUser(userId: string): Promise<PlayerSession[]> {
    await this.connect();
    const docs = await PlayerSessionModel.find({ userId }).sort({ startedAt: -1 });
    return docs.map(docToPlayerSession);
  }

  async createPlayerSession(session: InsertPlayerSession): Promise<PlayerSession> {
    await this.connect();
    const doc = await PlayerSessionModel.create(session);
    return docToPlayerSession(doc);
  }

  async updatePlayerSession(id: string, session: Partial<InsertPlayerSession>): Promise<PlayerSession | undefined> {
    await this.connect();
    const doc = await PlayerSessionModel.findByIdAndUpdate(id, session, { new: true });
    return doc ? docToPlayerSession(doc) : undefined;
  }

  async endPlayerSession(id: string, duration: number): Promise<PlayerSession | undefined> {
    await this.connect();
    const doc = await PlayerSessionModel.findByIdAndUpdate(
      id,
      { endedAt: new Date(), duration },
      { new: true }
    );
    return doc ? docToPlayerSession(doc) : undefined;
  }

  // ===== Achievements =====
  async getAchievement(id: string): Promise<Achievement | undefined> {
    await this.connect();
    const doc = await AchievementModel.findById(id);
    return doc ? docToAchievement(doc) : undefined;
  }

  async getAchievementsByWorld(worldId: string): Promise<Achievement[]> {
    await this.connect();
    const docs = await AchievementModel.find({ worldId });
    return docs.map(docToAchievement);
  }

  async getGlobalAchievements(): Promise<Achievement[]> {
    await this.connect();
    const docs = await AchievementModel.find({ worldId: null });
    return docs.map(docToAchievement);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    await this.connect();
    const doc = await AchievementModel.create(achievement);
    return docToAchievement(doc);
  }

  async updateAchievement(id: string, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    await this.connect();
    const doc = await AchievementModel.findByIdAndUpdate(id, { ...achievement, updatedAt: new Date() }, { new: true });
    return doc ? docToAchievement(doc) : undefined;
  }

  async deleteAchievement(id: string): Promise<boolean> {
    await this.connect();
    const result = await AchievementModel.findByIdAndDelete(id);
    return !!result;
  }

  // ===== Playthroughs =====
  async getPlaythrough(id: string): Promise<Playthrough | undefined> {
    await this.connect();
    const doc = await PlaythroughModel.findById(id);
    return doc ? docToPlaythrough(doc) : undefined;
  }

  async getPlaythroughsByUser(userId: string): Promise<Playthrough[]> {
    await this.connect();
    const docs = await PlaythroughModel.find({ userId }).sort({ lastPlayedAt: -1 });
    return docs.map(docToPlaythrough);
  }

  async getPlaythroughsByWorld(worldId: string): Promise<Playthrough[]> {
    await this.connect();
    const docs = await PlaythroughModel.find({ worldId }).sort({ lastPlayedAt: -1 });
    return docs.map(docToPlaythrough);
  }

  async getUserPlaythroughForWorld(userId: string, worldId: string): Promise<Playthrough | undefined> {
    await this.connect();
    const doc = await PlaythroughModel.findOne({ userId, worldId, status: { $ne: 'completed' } }).sort({ lastPlayedAt: -1 });
    return doc ? docToPlaythrough(doc) : undefined;
  }

  async createPlaythrough(playthrough: InsertPlaythrough): Promise<Playthrough> {
    await this.connect();
    const doc = await PlaythroughModel.create(playthrough);
    return docToPlaythrough(doc);
  }

  async updatePlaythrough(id: string, playthrough: Partial<InsertPlaythrough>): Promise<Playthrough | undefined> {
    await this.connect();
    const doc = await PlaythroughModel.findByIdAndUpdate(id, { ...playthrough, updatedAt: new Date() }, { new: true });
    return doc ? docToPlaythrough(doc) : undefined;
  }

  async deletePlaythrough(id: string): Promise<boolean> {
    await this.connect();
    const result = await PlaythroughModel.findByIdAndDelete(id);
    return !!result;
  }

  // ===== Playthrough Deltas =====
  async getPlaythroughDelta(id: string): Promise<PlaythroughDelta | undefined> {
    await this.connect();
    const doc = await PlaythroughDeltaModel.findById(id);
    return doc ? docToPlaythroughDelta(doc) : undefined;
  }

  async getDeltasByPlaythrough(playthroughId: string): Promise<PlaythroughDelta[]> {
    await this.connect();
    const docs = await PlaythroughDeltaModel.find({ playthroughId }).sort({ timestep: 1 });
    return docs.map(docToPlaythroughDelta);
  }

  async getDeltasByEntityType(playthroughId: string, entityType: string): Promise<PlaythroughDelta[]> {
    await this.connect();
    const docs = await PlaythroughDeltaModel.find({ playthroughId, entityType }).sort({ timestep: 1 });
    return docs.map(docToPlaythroughDelta);
  }

  async createPlaythroughDelta(delta: InsertPlaythroughDelta): Promise<PlaythroughDelta> {
    await this.connect();
    const doc = await PlaythroughDeltaModel.create(delta);
    return docToPlaythroughDelta(doc);
  }

  async deletePlaythroughDelta(id: string): Promise<boolean> {
    await this.connect();
    const result = await PlaythroughDeltaModel.findByIdAndDelete(id);
    return !!result;
  }

  // ===== Play Traces =====
  async getPlayTrace(id: string): Promise<PlayTrace | undefined> {
    await this.connect();
    const doc = await PlayTraceModel.findById(id);
    return doc ? docToPlayTrace(doc) : undefined;
  }

  async getTracesByPlaythrough(playthroughId: string): Promise<PlayTrace[]> {
    await this.connect();
    const docs = await PlayTraceModel.find({ playthroughId }).sort({ timestamp: 1 });
    return docs.map(docToPlayTrace);
  }

  async getTracesByUser(userId: string): Promise<PlayTrace[]> {
    await this.connect();
    const docs = await PlayTraceModel.find({ userId }).sort({ timestamp: -1 });
    return docs.map(docToPlayTrace);
  }

  async createPlayTrace(trace: InsertPlayTrace): Promise<PlayTrace> {
    await this.connect();
    const doc = await PlayTraceModel.create(trace);
    return docToPlayTrace(doc);
  }

  async deletePlayTrace(id: string): Promise<boolean> {
    await this.connect();
    const result = await PlayTraceModel.findByIdAndDelete(id);
    return !!result;
  }

  // ============= LANGUAGE PROGRESS =============

  async getLanguageProgress(playerId: string, worldId: string): Promise<any | null> {
    const doc = await LanguageProgressModel.findOne({ playerId, worldId });
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : null;
  }

  async upsertLanguageProgress(playerId: string, worldId: string, data: any): Promise<any> {
    const doc = await LanguageProgressModel.findOneAndUpdate(
      { playerId, worldId },
      { $set: { ...data, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  // ============= VOCABULARY =============

  async getVocabularyEntries(playerId: string, worldId: string): Promise<any[]> {
    const docs = await VocabularyEntryModel.find({ playerId, worldId });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async upsertVocabularyEntry(playerId: string, worldId: string, word: string, data: any): Promise<any> {
    const doc = await VocabularyEntryModel.findOneAndUpdate(
      { playerId, worldId, word },
      { $set: { ...data, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  // ============= GRAMMAR PATTERNS =============

  async getGrammarPatterns(playerId: string, worldId: string): Promise<any[]> {
    const docs = await GrammarPatternModel.find({ playerId, worldId });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async upsertGrammarPattern(playerId: string, worldId: string, pattern: string, data: any): Promise<any> {
    const doc = await GrammarPatternModel.findOneAndUpdate(
      { playerId, worldId, pattern },
      { $set: { ...data, updatedAt: new Date() } },
      { upsert: true, new: true }
    );
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  // ============= CONVERSATION RECORDS =============

  async getConversationRecords(playerId: string, worldId: string): Promise<any[]> {
    const docs = await ConversationRecordModel.find({ playerId, worldId }).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async createConversationRecord(data: any): Promise<any> {
    const doc = await ConversationRecordModel.create(data);
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  // ============= LANGUAGE ASSESSMENTS =============

  async getLanguageAssessments(playerId: string, worldId: string): Promise<any[]> {
    const docs = await LanguageAssessmentModel.find({ playerId, worldId }).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async createLanguageAssessment(data: any): Promise<any> {
    const doc = await LanguageAssessmentModel.create(data);
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async getAssessmentsByStudy(studyId: string): Promise<any[]> {
    const docs = await LanguageAssessmentModel.find({ studyId }).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async getLanguageAssessmentsByWorld(worldId: string, filters?: { assessmentType?: string; dateFrom?: string; dateTo?: string }): Promise<any[]> {
    const query: any = { worldId };
    if (filters?.assessmentType) query.assessmentType = filters.assessmentType;
    if (filters?.dateFrom || filters?.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }
    const docs = await LanguageAssessmentModel.find(query).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  // ============= EVALUATION RESPONSES =============

  async createEvaluationResponse(data: any): Promise<any> {
    const doc = await EvaluationResponseModel.create(data);
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async getEvaluationResponses(studyId: string, participantId?: string, targetLanguage?: string): Promise<any[]> {
    const query: any = { studyId };
    if (participantId) query.participantId = participantId;
    if (targetLanguage) query.targetLanguage = targetLanguage;
    const docs = await EvaluationResponseModel.find(query).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async getEvaluationResponsesByParticipant(participantId: string): Promise<any[]> {
    const docs = await EvaluationResponseModel.find({ participantId }).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async getEvaluationSummary(studyId: string, targetLanguage?: string): Promise<any> {
    const query: any = { studyId };
    if (targetLanguage) query.targetLanguage = targetLanguage;
    const docs = await EvaluationResponseModel.find(query);
    const byInstrument: Record<string, { count: number; avgScore: number; scores: number[] }> = {};
    for (const doc of docs) {
      const type = doc.instrumentType;
      if (!byInstrument[type]) byInstrument[type] = { count: 0, avgScore: 0, scores: [] };
      byInstrument[type].count++;
      if (doc.score != null) byInstrument[type].scores.push(doc.score);
    }
    for (const type of Object.keys(byInstrument)) {
      const scores = byInstrument[type].scores;
      byInstrument[type].avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    }
    return { studyId, totalResponses: docs.length, byInstrument };
  }

  // ============= TECHNICAL TELEMETRY =============

  async createTelemetryBatch(events: any[]): Promise<number> {
    if (events.length === 0) return 0;
    const result = await TechnicalTelemetryModel.insertMany(events, { ordered: false });
    return result.length;
  }

  async getTelemetrySummary(sessionId: string): Promise<any> {
    const docs = await TechnicalTelemetryModel.find({ sessionId });
    const byType: Record<string, { count: number; values: number[] }> = {};
    for (const doc of docs) {
      if (!byType[doc.metricType]) byType[doc.metricType] = { count: 0, values: [] };
      byType[doc.metricType].count++;
      if (doc.value != null) byType[doc.metricType].values.push(doc.value);
    }
    return { sessionId, totalMetrics: docs.length, byType };
  }

  async getAggregateTelemetry(studyId: string): Promise<any> {
    // Get all sessions for this study via engagement events
    const sessions = await EngagementEventModel.find({ eventType: 'session_start' }).distinct('sessionId');
    const docs = await TechnicalTelemetryModel.find({ sessionId: { $in: sessions } });
    const byType: Record<string, number[]> = {};
    for (const doc of docs) {
      if (!byType[doc.metricType]) byType[doc.metricType] = [];
      if (doc.value != null) byType[doc.metricType].push(doc.value);
    }
    const summary: Record<string, any> = {};
    for (const [type, values] of Object.entries(byType)) {
      values.sort((a, b) => a - b);
      summary[type] = {
        count: values.length,
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        p50: values[Math.floor(values.length * 0.5)] || 0,
        p95: values[Math.floor(values.length * 0.95)] || 0,
        p99: values[Math.floor(values.length * 0.99)] || 0,
      };
    }
    return summary;
  }

  // ============= ENGAGEMENT EVENTS =============

  async createEngagementEvent(data: any): Promise<any> {
    const doc = await EngagementEventModel.create(data);
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async createEngagementBatch(events: any[]): Promise<number> {
    if (events.length === 0) return 0;
    const result = await EngagementEventModel.insertMany(events, { ordered: false });
    return result.length;
  }

  async getEngagementSessions(playerId: string, studyId?: string): Promise<any[]> {
    const query: any = { playerId, eventType: { $in: ['session_start', 'session_end'] } };
    const docs = await EngagementEventModel.find(query).sort({ createdAt: 1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  // ============= API KEYS =============

  async createApiKey(data: { key: string; worldId: string; ownerId: string; permissions?: string[]; expiresAt?: Date }): Promise<any> {
    const doc = await ApiKeyModel.create(data);
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async validateApiKey(key: string): Promise<any | null> {
    const doc = await ApiKeyModel.findOne({ key, isActive: true });
    if (!doc) return null;
    if (doc.expiresAt && doc.expiresAt < new Date()) return null;
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async revokeApiKey(keyId: string): Promise<boolean> {
    const result = await ApiKeyModel.updateOne({ _id: keyId }, { $set: { isActive: false } });
    return result.modifiedCount > 0;
  }

  async getApiKeysByWorld(worldId: string): Promise<any[]> {
    const docs = await ApiKeyModel.find({ worldId });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  // ============= ASSESSMENT SESSIONS =============

  async createAssessmentSession(data: Omit<AssessmentSession, 'id'>): Promise<AssessmentSession> {
    await this.connect();
    const doc = await AssessmentSessionModel.create(data);
    return docToAssessmentSession(doc);
  }

  async getAssessmentSession(id: string): Promise<AssessmentSession | undefined> {
    await this.connect();
    const doc = await AssessmentSessionModel.findById(id);
    return doc ? docToAssessmentSession(doc) : undefined;
  }

  async updateAssessmentPhaseResult(sessionId: string, phaseResult: PhaseResult): Promise<AssessmentSession | undefined> {
    await this.connect();
    const existing = await AssessmentSessionModel.findById(sessionId);
    if (!existing) return undefined;

    const idx = existing.phaseResults.findIndex((r: any) => r.phaseId === phaseResult.phaseId);
    let update;
    if (idx >= 0) {
      update = await AssessmentSessionModel.findByIdAndUpdate(
        sessionId,
        { $set: { [`phaseResults.${idx}`]: phaseResult } },
        { new: true }
      );
    } else {
      update = await AssessmentSessionModel.findByIdAndUpdate(
        sessionId,
        { $push: { phaseResults: phaseResult } },
        { new: true }
      );
    }
    return update ? docToAssessmentSession(update) : undefined;
  }

  async addAssessmentRecording(sessionId: string, recording: RecordingReference): Promise<AssessmentSession | undefined> {
    await this.connect();
    const doc = await AssessmentSessionModel.findByIdAndUpdate(
      sessionId,
      { $push: { recordings: recording } },
      { new: true }
    );
    return doc ? docToAssessmentSession(doc) : undefined;
  }

  async completeAssessmentSession(sessionId: string, totalScore: number, maxScore: number, cefrLevel: string): Promise<AssessmentSession | undefined> {
    await this.connect();
    const doc = await AssessmentSessionModel.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          status: 'complete',
          totalScore,
          totalMaxPoints: maxScore,
          cefrLevel,
          completedAt: new Date()
        }
      },
      { new: true }
    );
    return doc ? docToAssessmentSession(doc) : undefined;
  }

  async getPlayerAssessments(playerId: string, worldId?: string, assessmentType?: string): Promise<AssessmentSession[]> {
    await this.connect();
    const query: any = { playerId };
    if (worldId) query.worldId = worldId;
    if (assessmentType) query.assessmentType = assessmentType;
    const docs = await AssessmentSessionModel.find(query).sort({ createdAt: -1 });
    return docs.map(d => docToAssessmentSession(d));
  }

  async getWorldAssessmentSummary(worldId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    averagePercentage: number;
    byType: Record<string, { count: number; avgScore: number; avgPercentage: number }>;
    cefrDistribution: Record<string, number>;
    scoreDistribution: { bucket: string; count: number }[];
  }> {
    await this.connect();
    const docs = await AssessmentSessionModel.find({ worldId, status: 'complete' });
    const totalSessions = await AssessmentSessionModel.countDocuments({ worldId });

    const byType: Record<string, { count: number; scores: number[]; percentages: number[] }> = {};
    const cefrDistribution: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0 };
    const allScores: number[] = [];
    const allPercentages: number[] = [];

    for (const doc of docs) {
      const score = doc.totalScore ?? 0;
      const maxPoints = doc.totalMaxPoints || 1;
      const pct = (score / maxPoints) * 100;
      allScores.push(score);
      allPercentages.push(pct);

      const type = doc.assessmentType;
      if (!byType[type]) byType[type] = { count: 0, scores: [], percentages: [] };
      byType[type].count++;
      byType[type].scores.push(score);
      byType[type].percentages.push(pct);

      if (doc.cefrLevel && doc.cefrLevel in cefrDistribution) {
        cefrDistribution[doc.cefrLevel]++;
      }
    }

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const byTypeResult: Record<string, { count: number; avgScore: number; avgPercentage: number }> = {};
    for (const [type, data] of Object.entries(byType)) {
      byTypeResult[type] = {
        count: data.count,
        avgScore: Math.round(avg(data.scores) * 100) / 100,
        avgPercentage: Math.round(avg(data.percentages) * 100) / 100,
      };
    }

    // Score distribution buckets (percentage-based)
    const buckets = [
      { label: '0-20%', min: 0, max: 20 },
      { label: '21-40%', min: 21, max: 40 },
      { label: '41-60%', min: 41, max: 60 },
      { label: '61-80%', min: 61, max: 80 },
      { label: '81-100%', min: 81, max: 100 },
    ];
    const scoreDistribution = buckets.map(b => ({
      bucket: b.label,
      count: allPercentages.filter(p => p >= b.min && p <= b.max).length,
    }));

    return {
      totalSessions,
      completedSessions: docs.length,
      averageScore: Math.round(avg(allScores) * 100) / 100,
      averagePercentage: Math.round(avg(allPercentages) * 100) / 100,
      byType: byTypeResult,
      cefrDistribution,
      scoreDistribution,
    };
  }

  // ============= TERRAIN FEATURES =============

  async getTerrainFeature(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await TerrainFeatureModel.findById(id);
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : undefined;
  }

  async getTerrainFeaturesByWorld(worldId: string): Promise<any[]> {
    await this.connect();
    const docs = await TerrainFeatureModel.find({ worldId });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async createTerrainFeature(feature: any): Promise<any> {
    await this.connect();
    const doc = await TerrainFeatureModel.create(feature);
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async updateTerrainFeature(id: string, feature: any): Promise<any | undefined> {
    await this.connect();
    const doc = await TerrainFeatureModel.findByIdAndUpdate(
      id,
      { $set: { ...feature, updatedAt: new Date() } },
      { new: true }
    );
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : undefined;
  }

  async deleteTerrainFeature(id: string): Promise<boolean> {
    await this.connect();
    const result = await TerrainFeatureModel.findByIdAndDelete(id);
    return !!result;
  }

  // ============= WATER FEATURES =============

  async getWaterFeature(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await WaterFeatureModel.findById(id);
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : undefined;
  }

  async getWaterFeaturesByWorld(worldId: string): Promise<any[]> {
    await this.connect();
    const docs = await WaterFeatureModel.find({ worldId });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async getWaterFeaturesBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await WaterFeatureModel.find({ settlementId });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async createWaterFeature(feature: any): Promise<any> {
    await this.connect();
    const doc = await WaterFeatureModel.create(feature);
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async updateWaterFeature(id: string, feature: any): Promise<any | undefined> {
    await this.connect();
    const doc = await WaterFeatureModel.findByIdAndUpdate(
      id,
      { $set: { ...feature, updatedAt: new Date() } },
      { new: true }
    );
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : undefined;
  }

  async deleteWaterFeature(id: string): Promise<boolean> {
    await this.connect();
    const result = await WaterFeatureModel.findByIdAndDelete(id);
    return !!result;
  }

}
