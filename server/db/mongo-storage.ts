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
  type InsertItem,
  type Container as ContainerSchema,
  type InsertContainer,
  type Reputation,
  type InsertReputation,
  type PlaythroughRelationship,
  type InsertPlaythroughRelationship,
  type VersionAlert,
  type InsertVersionAlert,
  type PlaythroughConversation,
  type InsertPlaythroughConversation,
  type GameText,
  type InsertGameText,
  type Text,
  type InsertText,
  type CharacterTemplate,
  type InsertCharacterTemplate
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

interface GameTextDoc extends Omit<GameText, 'id'>, Document {
  _id: string;
}

interface ContainerDoc extends Omit<ContainerSchema, 'id'>, Document {
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

// PlayerProgressDoc removed — player progress now stored as truths
// PlayerSessionDoc removed — sessions embedded in player_progress truth sourceData
// AchievementDoc removed — achievements now stored as truths

interface TextDoc extends Omit<Text, 'id'>, Document {
  _id: string;
}

interface PlaythroughDoc extends Omit<Playthrough, 'id'>, Document {
  _id: string;
}

interface PlaythroughDeltaDoc extends Omit<PlaythroughDelta, 'id'>, Document {
  _id: string;
}

// PlayTraceDoc removed — play traces now stored as truths

interface PlaythroughConversationDoc extends Omit<PlaythroughConversation, 'id'>, Document {
  _id: string;
}

interface WorldLanguageDoc extends Omit<WorldLanguage, 'id'>, Document {
  _id: string;
}

// LanguageChatMessageDoc removed — language chat messages removed
// ReputationDoc removed — reputations now stored as truths
// PlaythroughRelationshipDoc removed — relationships now stored as truths

interface VersionAlertDoc extends Omit<VersionAlert, 'id'>, Document {
  _id: string;
}

interface AssessmentSessionDoc extends Omit<AssessmentSession, 'id'>, Document {
  _id: string;
}

interface CharacterTemplateDoc extends Omit<CharacterTemplate, 'id'>, Document {
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
  // Template fields (when isTemplate=true, this character is a reusable preset)
  isTemplate: { type: Boolean, default: false },
  isDefault: { type: Boolean, default: false },
  isBase: { type: Boolean, default: false },
  startingTruths: { type: Schema.Types.Mixed, default: null },
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

  // Grid dimensions
  gridWidth: { type: Number, default: null },
  gridHeight: { type: Number, default: null },

  // Geographic dimensions (derived from grid)
  mapWidth: { type: Number, default: null },
  mapDepth: { type: Number, default: null },
  mapCenter: { type: Schema.Types.Mixed, default: null },

  sourceFormats: { type: Schema.Types.Mixed, default: null },
  config: { type: Schema.Types.Mixed, default: null },
  worldData: { type: Schema.Types.Mixed, default: null },
  historicalEvents: { type: Schema.Types.Mixed, default: null },
  generationConfig: { type: Schema.Types.Mixed, default: null },

  // Character creation mode
  characterCreationMode: { type: String, default: 'fixed' },

  // Version tracking for playthroughs
  version: { type: Number, default: 1 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// CharacterTemplateSchema removed — templates are now characters with isTemplate=true

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
  // Grid placement
  gridWidth: { type: Number, default: null },
  gridHeight: { type: Number, default: null },
  gridX: { type: Number, default: null },
  gridY: { type: Number, default: null },

  // Geographic position and territory (derived from grid)
  position: { type: Schema.Types.Mixed, default: null },
  territoryPolygon: { type: Schema.Types.Mixed, default: null },
  territoryRadius: { type: Number, default: null },

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
  governorId: { type: String, default: null },
  localGovernmentType: { type: String, default: null },
  // Geographic position and boundary
  position: { type: Schema.Types.Mixed, default: null },
  boundaryPolygon: { type: Schema.Types.Mixed, default: null },
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
  streetPattern: { type: String, default: null },
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
  unemployedCharacterIds: { type: Schema.Types.Mixed, default: null },
  vacantLotIds: { type: Schema.Types.Mixed, default: null },
  departedCharacterIds: { type: Schema.Types.Mixed, default: null },
  deceasedCharacterIds: { type: Schema.Types.Mixed, default: null },
  previousCountryIds: { type: Schema.Types.Mixed, default: null },
  previousStateIds: { type: Schema.Types.Mixed, default: null },
  annexationHistory: { type: Schema.Types.Mixed, default: null },
  // Grid placement within country
  countryGridX: { type: Number, default: null },
  countryGridY: { type: Number, default: null },

  // World-space position (derived from country grid)
  worldPositionX: { type: Number, default: null },
  worldPositionZ: { type: Number, default: null },
  generationConfig: { type: Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// SettlementHistoryEventSchema removed — settlement history events are now stored as truths
// with entryType='settlement_history' and settlementId in relatedLocationIds

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
  parentAction: { type: String, default: null }, // parent action name for hierarchy
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
  playthroughId: { type: String, default: null },
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
  titleTranslation: { type: String, default: null },
  descriptionTranslation: { type: String, default: null },
  objectivesTranslation: { type: [String], default: null },
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
  status: { type: String, default: 'unavailable' }, // unavailable, available, active, completed, failed, abandoned
  completionCriteria: { type: Schema.Types.Mixed, default: {} },
  experienceReward: { type: Number, default: 0 },
  moneyReward: { type: Number, default: 0 },
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
  narrativeChapterId: { type: String, default: null }, // Main quest chapter link
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
  visualAssetId: { type: String, default: null },
  category: { type: String, default: null },
  material: { type: String, default: null },
  baseType: { type: String, default: null },
  rarity: { type: String, default: 'common' },
  effects: { type: Schema.Types.Mixed, default: null },
  lootWeight: { type: Number, default: 0 },
  tags: { type: Schema.Types.Mixed, default: [] },
  isBase: { type: Boolean, default: false },
  possessable: { type: Boolean, default: true },
  isContainer: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed, default: {} },
  craftingRecipe: { type: Schema.Types.Mixed, default: null },
  questRelevance: { type: Schema.Types.Mixed, default: [] },
  loreText: { type: String, default: null },
  translations: { type: Schema.Types.Mixed, default: null },
  relatedTruthIds: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ItemSchema.index({ worldId: 1 });
ItemSchema.index({ isBase: 1, worldType: 1 });

const GameTextSchema = new Schema({
  worldId: { type: String, required: true },
  title: { type: String, required: true },
  titleTranslation: { type: String, default: null },
  textCategory: { type: String, required: true }, // book, journal, letter, flyer, recipe
  pages: { type: [Schema.Types.Mixed], default: [] },
  vocabularyHighlights: { type: [Schema.Types.Mixed], default: [] },
  comprehensionQuestions: { type: [Schema.Types.Mixed], default: [] },
  cefrLevel: { type: String, required: true }, // A1, A2, B1, B2
  targetLanguage: { type: String, required: true },
  difficulty: { type: String, default: 'beginner' }, // beginner, intermediate, advanced
  authorName: { type: String, default: null },
  clueText: { type: String, default: null },
  spawnLocationHint: { type: String, default: null }, // library, bookshop, cafe, residence, etc.
  isGenerated: { type: Boolean, default: false },
  generationPrompt: { type: String, default: null },
  status: { type: String, default: 'draft' },
  tags: { type: [String], default: [] },
  narrativeChapterId: { type: String, default: null }, // Main quest chapter link
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
GameTextSchema.index({ worldId: 1 });
GameTextSchema.index({ worldId: 1, narrativeChapterId: 1 });
GameTextSchema.index({ worldId: 1, textCategory: 1 });
GameTextSchema.index({ worldId: 1, cefrLevel: 1 });

// ContainerSchema removed — containers are now Items with isContainer=true

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
  apiKey: { type: String, unique: true, sparse: true },
  lastLoginAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// PlayerProgressSchema removed — player progress is now truths with entryType='player_progress'

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
  modelScaling: { type: Schema.Types.Mixed, default: {} },
  proceduralBuildings: { type: Schema.Types.Mixed, default: null },
  buildingTypeConfigs: { type: Schema.Types.Mixed, default: null },
  categoryPresets: { type: Schema.Types.Mixed, default: null },
  npcConfig: { type: Schema.Types.Mixed, default: null },
  worldTypeConfig: { type: Schema.Types.Mixed, default: null },
  // Unified template config (label, description, visual preset, style preset, simulation rates, building style)
  templateConfig: { type: Schema.Types.Mixed, default: null },
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

// PlayerSessionSchema removed — sessions are now embedded in PlayerProgressSchema.sessions[]

// AchievementSchema removed — achievements are now truths with entryType='achievement'

const TextSchema = new Schema({
  worldId: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  textType: { type: String, required: true },
  language: { type: String, default: null },
  difficulty: { type: String, default: 'beginner' },
  locationId: { type: String, default: null },
  characterId: { type: String, default: null },
  vocabularyWords: { type: [String], default: [] },
  grammarNotes: { type: String, default: null },
  translation: { type: String, default: null },
  tags: { type: [String], default: [] },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

TextSchema.index({ worldId: 1 });

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

// PlaythroughSchema removed — replaced by SaveFileSchema

// PlaythroughDeltaSchema removed — replaced by save file playtraces
// PlaythroughConversationSchema removed — replaced by save file conversations

// ReputationSchema removed — reputations are now truths with entryType='reputation'

// PlaythroughRelationshipSchema removed — relationships are now truths with entryType='relationship'

// ── Unified Save File ────────────────────────────────────────────────────
const SaveFileSchema = new Schema({
  userId: { type: String, required: true },
  worldId: { type: String, required: true },
  slotIndex: { type: Number, default: 0 },
  name: { type: String, default: 'Save Game' },
  version: { type: Number, default: 1 },
  status: { type: String, default: 'active' },
  totalPlaytime: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  // Embedded world template (read-only after creation)
  worldSnapshot: { type: Schema.Types.Mixed, required: true },
  // Mutable game state (overwritten on each save)
  currentState: { type: Schema.Types.Mixed, default: {} },
  // Compressed conversation history
  conversations: { type: [Schema.Types.Mixed], default: [] },
  // Playtraces stored in separate 'playtraces' collection, not embedded here
  createdAt: { type: Date, default: Date.now },
  lastSavedAt: { type: Date, default: Date.now },
});
SaveFileSchema.index({ userId: 1, worldId: 1 });
SaveFileSchema.index({ userId: 1, worldId: 1, slotIndex: 1 }, { unique: true });

// VersionAlertSchema removed — obsolete with save file system

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

const LocationSchema = new Schema({
  worldId: { type: String, required: true },
  settlementId: { type: String, default: null },
  address: { type: String, default: null },
  houseNumber: { type: Number, default: null },
  streetName: { type: String, default: null },
  block: { type: String, default: null },
  districtName: { type: String, default: null },
  lotType: { type: String, default: 'buildable' }, // 'buildable', 'park'
  // Topological coordinates (grid layout)
  blockCol: { type: Number, default: null },
  blockRow: { type: Number, default: null },
  lotIndex: { type: Number, default: null },
  streetId: { type: String, default: null },
  side: { type: String, default: 'left' },
  // Embedded building (null if vacant or park)
  building: { type: Schema.Types.Mixed, default: null },
  // Historical layering — previous buildings on this lot
  formerBuildings: { type: [Schema.Types.Mixed], default: [] },
  // Geographic feature fields (from merged GeographicFeatureSchema)
  featureCategory: { type: String, default: null }, // 'terrain' or 'water'
  featureType: { type: String, default: null },
  subType: { type: String, default: null },
  name: { type: String, default: null },
  description: { type: String, default: null },
  position: { type: Schema.Types.Mixed, default: null },
  radius: { type: Number, default: null },
  waterLevel: { type: Number, default: null },
  bounds: { type: Schema.Types.Mixed, default: null },
  depth: { type: Number, default: null },
  width: { type: Number, default: null },
  flowDirection: { type: Schema.Types.Mixed, default: null },
  flowSpeed: { type: Number, default: null },
  shorelinePoints: { type: Schema.Types.Mixed, default: [] },
  biome: { type: String, default: null },
  isNavigable: { type: Boolean, default: null },
  isDrinkable: { type: Boolean, default: null },
  modelAssetKey: { type: String, default: null },
  color: { type: Schema.Types.Mixed, default: null },
  transparency: { type: Number, default: null },
  // Inventory fields
  items: { type: Schema.Types.Mixed, default: {} },
  containers: { type: Schema.Types.Mixed, default: {} },
  furniture: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
// BuildingSchema and BusinessMongoSchema removed — buildings and businesses are now embedded in lots

// OccupationSchema removed — occupations are now truths with entryType='occupation'

// LanguageChatMessageSchema removed — language chat messages removed, use PlaythroughConversation instead

// LanguageLearningSchema removed — language learning is now truths with entryType='language_progress'

// Unified assessment schema (merges LanguageAssessment, AssessmentSession, EvaluationResponse)
// Discriminated by `docType`: 'result' | 'session' | 'evaluation'
const UnifiedAssessmentSchema = new Schema({
  docType: { type: String, required: true }, // 'result', 'session', 'evaluation'
  // Shared fields
  playerId: { type: String, default: null },
  worldId: { type: String, default: null },
  targetLanguage: { type: String, default: null },
  score: { type: Number, default: null },
  maxScore: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  // LanguageAssessment (docType='result') fields
  assessmentType: { type: String, default: null },
  details: { type: Schema.Types.Mixed, default: null },
  testWindow: { type: String, default: null },
  studyId: { type: String, default: null },
  // AssessmentSession (docType='session') fields
  playthroughId: { type: String, default: null },
  assessmentDefinitionId: { type: String, default: null },
  status: { type: String, default: null },
  phaseResults: { type: [Schema.Types.Mixed], default: [] },
  totalScore: { type: Number, default: null },
  totalMaxPoints: { type: Number, default: null },
  cefrLevel: { type: String, default: null },
  dimensionScores: { type: Schema.Types.Mixed, default: null },
  automatedMetrics: { type: Schema.Types.Mixed, default: null },
  recordings: { type: [Schema.Types.Mixed], default: [] },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  // EvaluationResponse (docType='evaluation') fields
  participantId: { type: String, default: null },
  instrumentType: { type: String, default: null },
  responses: { type: Schema.Types.Mixed, default: null },
  sessionId: { type: String, default: null },
});
UnifiedAssessmentSchema.index({ playerId: 1, worldId: 1 });
UnifiedAssessmentSchema.index({ docType: 1 });
UnifiedAssessmentSchema.index({ playerId: 1, worldId: 1, playthroughId: 1, assessmentType: 1 });
UnifiedAssessmentSchema.index({ studyId: 1, participantId: 1 });

const TelemetrySchema = new Schema({
  category: { type: String, required: true }, // 'technical' or 'engagement'
  sessionId: { type: String, required: true },
  playerId: { type: String, required: true },
  worldId: { type: String, default: null },
  eventType: { type: String, required: true }, // unified from metricType/eventType
  value: { type: Number, default: null }, // null for engagement events
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
});
TelemetrySchema.index({ sessionId: 1 });
TelemetrySchema.index({ playerId: 1, worldId: 1 });
TelemetrySchema.index({ category: 1 });

// Word Translation Cache — caches individual word/phrase translations to avoid repeated LLM calls
const WordTranslationCacheSchema = new Schema({
  worldId: { type: String, required: true },
  sourceWord: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  translation: { type: String, required: true },
  partOfSpeech: { type: String, default: null },
  context: { type: String, default: null },
  lookupCount: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});
WordTranslationCacheSchema.index({ worldId: 1, sourceWord: 1, targetLanguage: 1 }, { unique: true });
WordTranslationCacheSchema.index({ worldId: 1, lookupCount: -1 });

// UI Translation Files — stores LLM-generated complete UI translation files per world/language
const UITranslationFileSchema = new Schema({
  worldId: { type: String, required: true },
  targetLanguage: { type: String, required: true },
  languageCode: { type: String, required: true }, // ISO code (e.g., 'fr', 'es')
  translations: { type: Schema.Types.Mixed, required: true }, // Full translation JSON (same shape as en/common.json)
  version: { type: Number, default: 1 }, // Increment on regeneration
  generatedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
UITranslationFileSchema.index({ worldId: 1, languageCode: 1 }, { unique: true });

// ApiKeySchema removed — API keys are now stored on user accounts (UserSchema.apiKey)

// GeographicFeatureSchema removed — geographic features are now merged into LocationSchema

// AssessmentSessionSchema removed — merged into UnifiedAssessmentSchema above

// Indexes
CharacterSchema.index({ worldId: 1, isTemplate: 1 });
CharacterSchema.index({ worldId: 1, isAlive: 1 });
CharacterSchema.index({ currentLocation: 1 });
CharacterSchema.index({ currentLocation: 1, isAlive: 1 });

// Mongoose Models
const RuleModel = mongoose.model<RuleDoc>('Rule', RuleSchema);
const GrammarModel = mongoose.model<GrammarDoc>('Grammar', GrammarSchema);
const CharacterModel = mongoose.model<CharacterDoc>('Character', CharacterSchema);
const WorldModel = mongoose.model<WorldDoc>('World', WorldSchema);
const CountryModel = mongoose.model<CountryDoc>('Country', CountrySchema);
const StateModel = mongoose.model<StateDoc>('State', StateSchema);
const SettlementModel = mongoose.model<SettlementDoc>('Settlement', SettlementSchema);
// SettlementHistoryEventModel removed — use TruthModel with entryType='settlement_history'
const SimulationModel = mongoose.model<SimulationDoc>('Simulation', SimulationSchema);
const ActionModel = mongoose.model<ActionDoc>('Action', ActionSchema);
TruthSchema.index({ worldId: 1, playthroughId: 1 });
const TruthModel = mongoose.model<TruthDoc>('Truth', TruthSchema);
const QuestModel = mongoose.model<QuestDoc>('Quest', QuestSchema);
const ItemModel = mongoose.model<ItemDoc>('Item', ItemSchema);
const GameTextModel = mongoose.model<GameTextDoc>('GameText', GameTextSchema, 'texts');
// ContainerModel removed — containers are now Items with isContainer=true
const VisualAssetModel = mongoose.model<VisualAssetDoc>('VisualAsset', VisualAssetSchema, 'assets');
const AssetCollectionModel = mongoose.model<AssetCollectionDoc>('AssetCollection', AssetCollectionSchema, 'templates');
const GenerationJobModel = mongoose.model<GenerationJobDoc>('GenerationJob', GenerationJobSchema, 'jobs');
const UserModel = mongoose.model<UserDoc>('User', UserSchema);
// PlayerProgressModel removed — use TruthModel with entryType='player_progress'
// PlayerSessionModel removed — sessions embedded in player_progress truth sourceData
// AchievementModel removed — use TruthModel with entryType='achievement'
// TextModel removed — use GameTextModel instead
// Playthrough models removed — replaced by save file system.
// Stub models prevent runtime crashes in legacy code paths that haven't been removed yet.
const _removedModel = { find: () => ({ sort: () => Promise.resolve([]) }), findById: () => Promise.resolve(null), findOne: () => ({ sort: () => Promise.resolve(null) }), create: () => Promise.reject(new Error('Playthroughs removed — use save files')), deleteMany: () => Promise.resolve({ deletedCount: 0 }), findByIdAndUpdate: () => Promise.resolve(null), findByIdAndDelete: () => Promise.resolve(null), updateOne: () => Promise.resolve({ modifiedCount: 0 }), insertMany: () => Promise.resolve([]) };
const PlaythroughModel = _removedModel as any;
const PlaythroughDeltaModel = _removedModel as any;
// PlayTraceModel removed — use TruthModel with entryType='play_trace'
const PlaythroughConversationModel = _removedModel as any;
// ReputationModel removed — use TruthModel with entryType='reputation'
// PlaythroughRelationshipModel removed — use TruthModel with entryType='relationship'
const WordTranslationCacheModel = mongoose.model('WordTranslationCache', WordTranslationCacheSchema, 'word_translation_cache');
const UITranslationFileModel = mongoose.model('UITranslationFile', UITranslationFileSchema, 'ui_translation_files');
const SaveFileModel = mongoose.model('SaveFile', SaveFileSchema, 'saves');
const WorldLanguageModel = mongoose.model<WorldLanguageDoc>('WorldLanguage', WorldLanguageSchema, 'languages');
const LocationModel = mongoose.model('Location', LocationSchema, 'locations');
// BuildingModel removed — buildings are now embedded in lots as lot.building
// BusinessMongoModel removed — businesses are now embedded in lots as lot.building
// OccupationModel removed — use TruthModel with entryType='occupation'
const VersionAlertModel = _removedModel as any;
// LanguageChatMessageModel removed — use PlaythroughConversation instead
// Generic collection names (renamed from language-specific names).
// Run server/db/migrations/rename-collections-for-feature-modules.ts to rename
// existing collections, or start fresh — Mongoose will create the new names automatically.
// LanguageLearningModel removed — use TruthModel with entryType='language_progress'
const AssessmentModel = mongoose.model('Assessment', UnifiedAssessmentSchema, 'assessments');
const TelemetryModel = mongoose.model('Telemetry', TelemetrySchema, 'telemetry');
// ApiKeyModel removed — API keys are now on user accounts
// LocationModel removed — geographic features are now locations with featureCategory set
// CharacterTemplateModel removed — use CharacterModel with isTemplate=true

/** Convert a lot doc with an embedded business building to a backward-compatible business object */
function lotToBusinessObj(doc: any): any {
  const obj = doc.toObject ? doc.toObject() : doc;
  const lotId = (doc._id || obj._id).toString();
  const building = obj.building || {};
  return {
    id: lotId,
    lotId,
    worldId: obj.worldId,
    settlementId: obj.settlementId,
    address: obj.address,
    ...building,
    _id: undefined,
  };
}

/** Convert a lot doc with an embedded residence building to a backward-compatible residence object */
function lotToResidenceObj(doc: any): any {
  const obj = doc.toObject ? doc.toObject() : doc;
  const lotId = (doc._id || obj._id).toString();
  const building = obj.building || {};
  return {
    id: lotId,
    lotId,
    worldId: obj.worldId,
    settlementId: obj.settlementId,
    address: obj.address,
    ...building,
    _id: undefined,
  };
}

/** Convert a lot doc with any embedded building to a backward-compatible building object */
function lotToBuildingObj(doc: any): any {
  const obj = doc.toObject ? doc.toObject() : doc;
  const lotId = (doc._id || obj._id).toString();
  const building = obj.building || {};
  return {
    id: lotId,
    lotId,
    worldId: obj.worldId,
    settlementId: obj.settlementId,
    address: obj.address,
    ...building,
    _id: undefined,
  };
}

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
    return { ...doc.toObject(), id: doc._id.toString() };
  } else {
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

function docToCharacterTemplate(doc: CharacterTemplateDoc | any): CharacterTemplate {
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

function docToGameText(doc: GameTextDoc): GameText {
  return { ...doc.toObject(), id: doc._id.toString() };
}

// docToContainer removed — containers are now Items with isContainer=true

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

function truthToPlayerProgress(doc: any): PlayerProgress {
  const obj = doc.toObject ? doc.toObject() : doc;
  return { id: (doc._id || obj._id).toString(), worldId: obj.worldId, playthroughId: obj.playthroughId, ...obj.sourceData } as any;
}

// docToPlayerSession — sessions are embedded in player_progress truth sourceData.sessions[]
// docToAchievement — achievements are truths with entryType='achievement'

function docToText(doc: TextDoc): Text {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToPlaythrough(doc: PlaythroughDoc): Playthrough {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToPlaythroughDelta(doc: PlaythroughDeltaDoc): PlaythroughDelta {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function truthToPlayTrace(doc: any): PlayTrace {
  const obj = doc.toObject ? doc.toObject() : doc;
  return { id: (doc._id || obj._id).toString(), playthroughId: obj.playthroughId, ...obj.sourceData } as any;
}

function docToPlaythroughConversation(doc: PlaythroughConversationDoc): PlaythroughConversation {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function truthToReputation(doc: any): Reputation {
  const obj = doc.toObject ? doc.toObject() : doc;
  return { id: (doc._id || obj._id).toString(), playthroughId: obj.playthroughId, ...obj.sourceData } as any;
}

function truthToPlaythroughRelationship(doc: any): PlaythroughRelationship {
  const obj = doc.toObject ? doc.toObject() : doc;
  return { id: (doc._id || obj._id).toString(), playthroughId: obj.playthroughId, ...obj.sourceData } as any;
}

function docToVersionAlert(doc: VersionAlertDoc): VersionAlert {
  return { ...doc.toObject(), id: doc._id.toString() };
}

function docToWorldLanguage(doc: WorldLanguageDoc): WorldLanguage {
  return { ...doc.toObject(), id: doc._id.toString() };
}

// docToLanguageChatMessage removed — language chat messages removed, use PlaythroughConversation instead

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

    // 11b. Containers removed — containers are now Items with isContainer=true

    // 11c. Delete remaining infrastructure (catch any missed by settlement cascade)
    await LocationModel.deleteMany({ worldId: id });
    // BusinessMongoModel/BuildingModel removed — buildings/businesses are embedded in lots
    await TruthModel.deleteMany({ worldId: id, entryType: 'occupation' });
    // GeographicFeatureModel removed — geographic features are now locations (already deleted above)
    // Settlement history events are now truths — already deleted with truths above
    await GameTextModel.deleteMany({ worldId: id });

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

    // 15. Delete player progress (stored as truths with entryType='player_progress')
    const playerProgress = await TruthModel.deleteMany({ worldId: id, entryType: 'player_progress' });
    if (playerProgress.deletedCount && playerProgress.deletedCount > 0) {
      console.log(`   ✓ Deleted ${playerProgress.deletedCount} player progress records`);
    }

    // 16. Delete player sessions
    // Player sessions are now embedded in PlayerProgress — deleted with PlayerProgress above

    // 17. Delete achievements
    const achievements = await TruthModel.deleteMany({ worldId: id, entryType: 'achievement' });
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

    // 19. Delete play traces (stored as truths with entryType='play_trace' — caught by TruthModel.deleteMany above)

    // 20. Delete world languages
    const worldLanguages = await WorldLanguageModel.deleteMany({ worldId: id });
    if (worldLanguages.deletedCount && worldLanguages.deletedCount > 0) {
      console.log(`   ✓ Deleted ${worldLanguages.deletedCount} world languages`);
    }

    // 21. Language chat messages removed — use PlaythroughConversation instead

    // 22. Character templates are now characters with isTemplate=true — already deleted with characters above

    // 23. Finally, delete the world itself
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

    // Collect character IDs before deleting so we can cascade-delete their truths
    // Also find characters with null currentLocation that belong to this settlement's world
    // (e.g. children born during history simulation whose mother had no location set)
    const settlement = await SettlementModel.findById(id);
    const worldId = settlement?.worldId;
    const charDocs = await CharacterModel.find(
      { $or: [
        { currentLocation: id },
        { currentResidenceId: id },
        // Catch orphaned characters in this world with no location
        ...(worldId ? [{ worldId, currentLocation: null, isTemplate: { $ne: true } }] : []),
      ] },
      { _id: 1 }
    );
    const charIds = charDocs.map(c => c._id.toString());

    // Delete the characters
    const characters = await CharacterModel.deleteMany({ currentLocation: id });
    const residenceChars = await CharacterModel.deleteMany({ currentResidenceId: id });
    // Also delete world characters with no location (orphans from history sim)
    if (worldId) {
      await CharacterModel.deleteMany({ worldId, currentLocation: null, isTemplate: { $ne: true } });
    }
    const totalCharsDeleted = (characters.deletedCount || 0) + (residenceChars.deletedCount || 0);
    if (totalCharsDeleted > 0) {
      console.log(`         Deleted ${totalCharsDeleted} characters`);
    }

    // Delete truths associated with those characters (by characterId or relatedCharacterIds)
    if (charIds.length > 0) {
      const charTruths = await TruthModel.deleteMany({
        $or: [{ characterId: { $in: charIds } }, { relatedCharacterIds: { $in: charIds } }]
      });
      if (charTruths.deletedCount) {
        console.log(`         Deleted ${charTruths.deletedCount} character truths`);
      }
    }

    // Cascade delete settlement infrastructure
    // Delete occupations via business lot IDs before deleting lots
    const businessLots = await LocationModel.find({ settlementId: id, 'building.buildingCategory': 'business' }, { _id: 1 });
    const businessIds = businessLots.map(b => b._id.toString());
    const occupations = businessIds.length > 0
      ? await TruthModel.deleteMany({ entryType: 'occupation', 'sourceData.businessId': { $in: businessIds } })
      : { deletedCount: 0 };

    const lots = await LocationModel.deleteMany({ settlementId: id });
    // BusinessMongoModel/BuildingModel removed — buildings/businesses are embedded in lots
    // ContainerModel removed — containers are now Items with isContainer=true
    const historyEvents = await TruthModel.deleteMany({ entryType: 'settlement_history', relatedLocationIds: id });
    // GeographicFeatureModel removed — geographic features are now locations (already deleted above)

    const infraDeleted = (lots.deletedCount || 0) +
      (occupations.deletedCount || 0) +
      (historyEvents.deletedCount || 0);
    if (infraDeleted > 0) {
      console.log(`         Deleted ${infraDeleted} infrastructure entities (${lots.deletedCount || 0} lots with embedded buildings/businesses)`);
    }

    // Finally delete the settlement itself
    const result = await SettlementModel.findByIdAndDelete(id);
    console.log(`         ✅ Settlement ${id} deleted`);
    return !!result;
  }

  // Settlement History Event operations (stored as truths with entryType 'settlement_history')
  async getSettlementHistoryEvent(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await TruthModel.findById(id);
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async getSettlementHistoryBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await TruthModel.find({ entryType: 'settlement_history', relatedLocationIds: settlementId }).sort({ timeYear: 1, timestep: 1 });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async getSettlementHistoryByWorld(worldId: string): Promise<any[]> {
    await this.connect();
    const docs = await TruthModel.find({ worldId, entryType: 'settlement_history' }).sort({ timeYear: 1, timestep: 1 });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async createSettlementHistoryEvent(event: any): Promise<any> {
    await this.connect();
    const truth = {
      worldId: event.worldId,
      title: `${event.eventType}: ${event.description?.substring(0, 60) || 'Settlement event'}`,
      content: event.description,
      entryType: 'settlement_history',
      timestep: event.timestep ?? 0,
      timeYear: event.year,
      historicalSignificance: event.significance || 'minor',
      relatedCharacterIds: event.relatedCharacterIds || [],
      relatedLocationIds: [event.settlementId],
      tags: [...(event.tags || []), event.category].filter(Boolean),
      source: 'settlement_history',
      sourceData: {
        eventType: event.eventType,
        category: event.category,
        previousValue: event.previousValue,
        newValue: event.newValue,
        settlementId: event.settlementId,
      },
    };
    const doc = await TruthModel.create(truth);
    return { ...doc.toObject(), id: doc._id.toString() };
  }

  async deleteSettlementHistoryEvent(id: string): Promise<boolean> {
    await this.connect();
    const result = await TruthModel.findByIdAndDelete(id);
    return !!result;
  }

  // Lot operations
  async getLot(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await LocationModel.findById(id);
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async getLotsBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ settlementId });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async createLot(lot: any): Promise<any> {
    await this.connect();
    const doc = await new LocationModel(lot).save();
    return { ...doc.toObject(), id: doc._id.toString() };
  }

  async updateLot(id: string, lot: any): Promise<any | undefined> {
    await this.connect();
    const doc = await LocationModel.findByIdAndUpdate(id, { ...lot, updatedAt: new Date() }, { new: true });
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async deleteLot(id: string): Promise<boolean> {
    await this.connect();
    const result = await LocationModel.findByIdAndDelete(id);
    return !!result;
  }

  async createLotsInBulk(lots: any[]): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.insertMany(lots);
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  // Business operations (businesses are now embedded in lots as lot.building with buildingCategory='business')
  async getBusiness(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await LocationModel.findOne({ _id: id, 'building.buildingCategory': 'business' });
    return doc ? lotToBusinessObj(doc) : undefined;
  }

  async getBusinessesBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ settlementId, 'building.buildingCategory': 'business' });
    return docs.map(d => lotToBusinessObj(d));
  }

  async getBusinessesByWorld(worldId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ worldId, 'building.buildingCategory': 'business' });
    return docs.map(d => lotToBusinessObj(d));
  }

  async createBusiness(business: any): Promise<any> {
    await this.connect();
    const { settlementId, worldId, address, lotId, ...buildingFields } = business;
    const buildingData = { buildingCategory: 'business' as const, ...buildingFields };
    if (lotId) {
      // Update existing lot with the business building
      const doc = await LocationModel.findByIdAndUpdate(lotId, { $set: { building: buildingData, updatedAt: new Date() } }, { new: true });
      return doc ? lotToBusinessObj(doc) : undefined;
    }
    // Create a new lot with the business embedded
    const doc = await new LocationModel({ settlementId, worldId, address, building: buildingData }).save();
    return lotToBusinessObj(doc);
  }

  async updateBusiness(id: string, business: any): Promise<any | undefined> {
    await this.connect();
    const existing = await LocationModel.findById(id);
    if (!existing) return undefined;
    const existingObj = existing.toObject();
    const merged = { ...(existingObj.building || {}), ...business, buildingCategory: 'business' };
    const doc = await LocationModel.findByIdAndUpdate(id, { $set: { building: merged, updatedAt: new Date() } }, { new: true });
    return doc ? lotToBusinessObj(doc) : undefined;
  }

  async deleteBusiness(id: string): Promise<boolean> {
    await this.connect();
    const existing = await LocationModel.findById(id);
    if (!existing || !existing.toObject().building || existing.toObject().building?.buildingCategory !== 'business') return false;
    const obj = existing.toObject();
    // Move current building to formerBuildings, then clear building
    const formerBuildings = obj.formerBuildings || [];
    formerBuildings.push(obj.building);
    await LocationModel.findByIdAndUpdate(id, { $set: { building: null, formerBuildings, updatedAt: new Date() } });
    return true;
  }

  async createBusinessesInBulk(businesses: any[]): Promise<any[]> {
    await this.connect();
    const results: any[] = [];
    // Separate into lots that need updating vs new lots
    const withLotId = businesses.filter(b => b.lotId);
    const withoutLotId = businesses.filter(b => !b.lotId);

    // Update existing lots
    for (const business of withLotId) {
      const { lotId, settlementId, worldId, address, ...buildingFields } = business;
      const buildingData = { buildingCategory: 'business' as const, ...buildingFields };
      const doc = await LocationModel.findByIdAndUpdate(lotId, { $set: { building: buildingData, updatedAt: new Date() } }, { new: true });
      if (doc) results.push(lotToBusinessObj(doc));
    }

    // Create new lots for businesses without lotId
    if (withoutLotId.length > 0) {
      const lotDocs = withoutLotId.map(b => {
        const { settlementId, worldId, address, ...buildingFields } = b;
        return { settlementId, worldId, address, building: { buildingCategory: 'business' as const, ...buildingFields } };
      });
      const docs = await LocationModel.insertMany(lotDocs);
      results.push(...docs.map(d => lotToBusinessObj(d)));
    }

    return results;
  }

  // Building operations (buildings are now embedded in lots as lot.building)
  async getResidence(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await LocationModel.findOne({ _id: id, 'building.buildingCategory': 'residence' });
    return doc ? lotToResidenceObj(doc) : undefined;
  }

  async getResidencesBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ settlementId, 'building.buildingCategory': 'residence' });
    return docs.map(d => lotToResidenceObj(d));
  }

  async getBuildingsBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ settlementId, building: { $ne: null } });
    return docs.map(d => lotToBuildingObj(d));
  }

  async createResidence(residence: any): Promise<any> {
    await this.connect();
    const { lotId, settlementId, worldId, address, ...buildingFields } = residence;
    const buildingData = { buildingCategory: 'residence' as const, ...buildingFields };
    if (lotId) {
      // Update existing lot with the residence building
      const doc = await LocationModel.findByIdAndUpdate(lotId, { $set: { building: buildingData, updatedAt: new Date() } }, { new: true });
      return doc ? lotToResidenceObj(doc) : undefined;
    }
    // Create a new lot with the residence embedded
    const doc = await new LocationModel({ settlementId, worldId, address, building: buildingData }).save();
    return lotToResidenceObj(doc);
  }

  async updateResidence(id: string, residence: any): Promise<any | undefined> {
    await this.connect();
    const existing = await LocationModel.findById(id);
    if (!existing) return undefined;
    const existingObj = existing.toObject();
    const merged = { ...(existingObj.building || {}), ...residence, buildingCategory: 'residence' };
    const doc = await LocationModel.findByIdAndUpdate(id, { $set: { building: merged, updatedAt: new Date() } }, { new: true });
    return doc ? lotToResidenceObj(doc) : undefined;
  }

  async deleteResidence(id: string): Promise<boolean> {
    await this.connect();
    const existing = await LocationModel.findById(id);
    if (!existing) return false;
    const obj = existing.toObject();
    if (!obj.building || obj.building?.buildingCategory !== 'residence') return false;
    const formerBuildings = obj.formerBuildings || [];
    formerBuildings.push(obj.building);
    await LocationModel.findByIdAndUpdate(id, { $set: { building: null, formerBuildings, updatedAt: new Date() } });
    return true;
  }

  async createResidencesInBulk(residences: any[]): Promise<any[]> {
    await this.connect();
    const results: any[] = [];
    const withLotId = residences.filter(r => r.lotId);
    const withoutLotId = residences.filter(r => !r.lotId);

    // Update existing lots
    for (const residence of withLotId) {
      const { lotId, settlementId, worldId, address, ...buildingFields } = residence;
      const buildingData = { buildingCategory: 'residence' as const, ...buildingFields };
      const doc = await LocationModel.findByIdAndUpdate(lotId, { $set: { building: buildingData, updatedAt: new Date() } }, { new: true });
      if (doc) results.push(lotToResidenceObj(doc));
    }

    // Create new lots for residences without lotId
    if (withoutLotId.length > 0) {
      const lotDocs = withoutLotId.map(r => {
        const { settlementId, worldId, address, ...buildingFields } = r;
        return { settlementId, worldId, address, building: { buildingCategory: 'residence' as const, ...buildingFields } };
      });
      const docs = await LocationModel.insertMany(lotDocs);
      results.push(...docs.map(d => lotToResidenceObj(d)));
    }

    return results;
  }

  async getPublicBuilding(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await LocationModel.findOne({ _id: id, 'building.buildingCategory': 'public' });
    return doc ? lotToBuildingObj(doc) : undefined;
  }

  async getPublicBuildingsBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ settlementId, 'building.buildingCategory': 'public' });
    return docs.map(d => lotToBuildingObj(d));
  }

  async getPublicBuildingsByWorld(worldId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ worldId, 'building.buildingCategory': 'public' });
    return docs.map(d => lotToBuildingObj(d));
  }

  async createPublicBuilding(building: any): Promise<any> {
    await this.connect();
    const { lotId, settlementId, worldId, address, ...buildingFields } = building;
    const buildingData = { buildingCategory: 'public' as const, ...buildingFields };
    if (lotId) {
      const doc = await LocationModel.findByIdAndUpdate(lotId, { $set: { building: buildingData, updatedAt: new Date() } }, { new: true });
      return doc ? lotToBuildingObj(doc) : undefined;
    }
    const doc = await new LocationModel({ settlementId, worldId, address, building: buildingData }).save();
    return lotToBuildingObj(doc);
  }

  async updatePublicBuilding(id: string, building: any): Promise<any | undefined> {
    await this.connect();
    const existing = await LocationModel.findById(id);
    if (!existing) return undefined;
    const existingObj = existing.toObject();
    const merged = { ...(existingObj.building || {}), ...building, buildingCategory: 'public' };
    const doc = await LocationModel.findByIdAndUpdate(id, { $set: { building: merged, updatedAt: new Date() } }, { new: true });
    return doc ? lotToBuildingObj(doc) : undefined;
  }

  async deletePublicBuilding(id: string): Promise<boolean> {
    await this.connect();
    const existing = await LocationModel.findById(id);
    if (!existing) return false;
    const obj = existing.toObject();
    if (!obj.building || obj.building?.buildingCategory !== 'public') return false;
    const formerBuildings = obj.formerBuildings || [];
    formerBuildings.push(obj.building);
    await LocationModel.findByIdAndUpdate(id, { $set: { building: null, formerBuildings, updatedAt: new Date() } });
    return true;
  }

  // Occupation operations (stored as truths with entryType='occupation')
  private occupationToTruth(occ: any): any {
    return {
      worldId: occ.worldId,
      title: `${occ.vocation} at ${occ.businessId}`,
      content: `employed_at('${occ.characterId}', '${occ.businessId}', '${occ.vocation}', '${occ.shift}', ${occ.startYear}).`,
      entryType: 'occupation',
      characterId: occ.characterId,
      timestep: 0,
      timeYear: occ.startYear,
      relatedCharacterIds: [occ.characterId],
      source: 'occupation',
      sourceData: {
        characterId: occ.characterId,
        businessId: occ.businessId,
        vocation: occ.vocation,
        level: occ.level ?? 1,
        shift: occ.shift,
        startYear: occ.startYear,
        endYear: occ.endYear ?? null,
        yearsExperience: occ.yearsExperience ?? 0,
        terminationReason: occ.terminationReason ?? null,
        predecessorId: occ.predecessorId ?? null,
        successorId: occ.successorId ?? null,
        isSupplemental: occ.isSupplemental ?? false,
        hiredAsFavor: occ.hiredAsFavor ?? false,
      },
    };
  }

  private truthToOccupation(doc: any): any {
    const obj = doc.toObject ? doc.toObject() : doc;
    return { id: (doc._id || obj._id).toString(), worldId: obj.worldId, ...obj.sourceData };
  }

  async getOccupation(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await TruthModel.findById(id);
    return doc && (doc as any).entryType === 'occupation' ? this.truthToOccupation(doc) : undefined;
  }

  async getOccupationsByCharacter(characterId: string): Promise<any[]> {
    await this.connect();
    const docs = await TruthModel.find({ entryType: 'occupation', 'sourceData.characterId': characterId });
    return docs.map(d => this.truthToOccupation(d));
  }

  async getOccupationsByBusiness(businessId: string): Promise<any[]> {
    await this.connect();
    const docs = await TruthModel.find({ entryType: 'occupation', 'sourceData.businessId': businessId });
    return docs.map(d => this.truthToOccupation(d));
  }

  async getCurrentOccupation(characterId: string): Promise<any | undefined> {
    await this.connect();
    const doc = await TruthModel.findOne({ entryType: 'occupation', 'sourceData.characterId': characterId, 'sourceData.endYear': null });
    return doc ? this.truthToOccupation(doc) : undefined;
  }

  async createOccupation(occupation: any): Promise<any> {
    await this.connect();
    const doc = await TruthModel.create(this.occupationToTruth(occupation));
    return this.truthToOccupation(doc);
  }

  async updateOccupation(id: string, occupation: any): Promise<any | undefined> {
    await this.connect();
    const existing = await TruthModel.findById(id);
    if (!existing) return undefined;
    const merged = { ...((existing as any).sourceData || {}), ...occupation };
    const doc = await TruthModel.findByIdAndUpdate(id, {
      $set: { sourceData: merged, updatedAt: new Date() }
    }, { new: true });
    return doc ? this.truthToOccupation(doc) : undefined;
  }

  async deleteOccupation(id: string): Promise<boolean> {
    await this.connect();
    const result = await TruthModel.findByIdAndDelete(id);
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

  async getCharactersByWorld(worldId: string, options?: { limit?: number; offset?: number; aliveOnly?: boolean; lean?: boolean }): Promise<Character[]> {
    await this.connect();
    const filter: any = { worldId, isTemplate: { $ne: true } };
    if (options?.aliveOnly) filter.isAlive = true;
    let query = CharacterModel.find(filter);
    if (options?.offset) query = query.skip(options.offset);
    if (options?.limit) query = query.limit(options.limit);
    // Lean mode: only fetch fields needed for snapshots (skip heavy Mixed blobs)
    if (options?.lean) {
      query = query.select('firstName lastName gender birthYear isAlive occupation personality spouseId currentLocation') as any;
    }
    const docs = await query;
    return docs.map(docToCharacter);
  }

  async getCharactersBySettlement(settlementId: string, options?: { limit?: number; offset?: number; lean?: boolean }): Promise<Character[]> {
    await this.connect();
    let query = CharacterModel.find({ currentLocation: settlementId });
    if (options?.lean) {
      query = query.select('firstName lastName gender birthYear isAlive occupation personality spouseId currentLocation') as any;
    }
    if (options?.offset) query = query.skip(options.offset);
    if (options?.limit) query = query.limit(options.limit);
    const docs = await query;
    return docs.map(docToCharacter);
  }

  async createCharacter(insertCharacter: InsertCharacter & { age?: number; occupation?: string }): Promise<Character> {
    await this.connect();
    const doc = await CharacterModel.create({
      ...insertCharacter,
      isAlive: insertCharacter.isAlive ?? true,
      generationConfig: insertCharacter.generationConfig ?? null,
      status: insertCharacter.status ?? null,
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

  async bulkUpdateCharacters(updates: Array<{ id: string; data: Partial<InsertCharacter> }>): Promise<number> {
    await this.connect();
    if (updates.length === 0) return 0;
    const ops = updates.map(u => ({
      updateOne: {
        filter: { _id: u.id },
        update: { $set: { ...u.data, updatedAt: new Date() } },
      }
    }));
    const result = await CharacterModel.bulkWrite(ops, { ordered: false });
    return result.modifiedCount;
  }

  async deleteCharacter(id: string): Promise<boolean> {
    await this.connect();
    const result = await CharacterModel.findByIdAndDelete(id);
    if (result) {
      // Cascade: delete truths associated with this character (by characterId or relatedCharacterIds)
      await TruthModel.deleteMany({
        $or: [{ characterId: id }, { relatedCharacterIds: id }]
      });
    }
    return !!result;
  }

  // Character Template operations
  // Character template operations (stored as characters with isTemplate=true)
  async getCharacterTemplate(id: string): Promise<CharacterTemplate | undefined> {
    await this.connect();
    const doc = await CharacterModel.findOne({ _id: id, isTemplate: true });
    if (!doc) return undefined;
    const obj = doc.toObject();
    return { id: doc._id.toString(), worldId: obj.worldId, name: obj.firstName, description: obj.status, startingTruths: (obj as any).startingTruths ?? [], isDefault: (obj as any).isDefault ?? false, isBase: (obj as any).isBase ?? false, createdAt: obj.createdAt, updatedAt: obj.updatedAt } as any;
  }

  async getCharacterTemplates(worldId: string): Promise<CharacterTemplate[]> {
    await this.connect();
    const docs = await CharacterModel.find({
      isTemplate: true,
      $or: [{ worldId: null }, { worldId }]
    });
    return docs.map(doc => {
      const obj = doc.toObject();
      return { id: doc._id.toString(), worldId: obj.worldId, name: obj.firstName, description: obj.status, startingTruths: (obj as any).startingTruths ?? [], isDefault: (obj as any).isDefault ?? false, isBase: (obj as any).isBase ?? false, createdAt: obj.createdAt, updatedAt: obj.updatedAt } as any;
    });
  }

  async createCharacterTemplate(template: InsertCharacterTemplate): Promise<CharacterTemplate> {
    await this.connect();
    const doc = await CharacterModel.create({
      worldId: (template as any).worldId || null,
      firstName: (template as any).name,
      lastName: 'Template',
      gender: 'other',
      isTemplate: true,
      isDefault: template.isDefault ?? false,
      isBase: template.isBase ?? false,
      startingTruths: template.startingTruths ?? [],
      status: (template as any).description || null,
    });
    const obj = doc.toObject();
    return { id: doc._id.toString(), worldId: obj.worldId, name: obj.firstName, description: obj.status, startingTruths: (obj as any).startingTruths ?? [], isDefault: (obj as any).isDefault ?? false, isBase: (obj as any).isBase ?? false, createdAt: obj.createdAt, updatedAt: obj.updatedAt } as any;
  }

  async updateCharacterTemplate(id: string, template: Partial<InsertCharacterTemplate>): Promise<CharacterTemplate | undefined> {
    await this.connect();
    const update: any = { updatedAt: new Date() };
    if ((template as any).name) update.firstName = (template as any).name;
    if ((template as any).description !== undefined) update.status = (template as any).description;
    if (template.startingTruths !== undefined) update.startingTruths = template.startingTruths;
    if (template.isDefault !== undefined) update.isDefault = template.isDefault;
    if (template.isBase !== undefined) update.isBase = template.isBase;
    const doc = await CharacterModel.findOneAndUpdate({ _id: id, isTemplate: true }, update, { new: true });
    if (!doc) return undefined;
    const obj = doc.toObject();
    return { id: doc._id.toString(), worldId: obj.worldId, name: obj.firstName, description: obj.status, startingTruths: (obj as any).startingTruths ?? [], isDefault: (obj as any).isDefault ?? false, isBase: (obj as any).isBase ?? false, createdAt: obj.createdAt, updatedAt: obj.updatedAt } as any;
  }

  async deleteCharacterTemplate(id: string): Promise<boolean> {
    await this.connect();
    const result = await CharacterModel.findOneAndDelete({ _id: id, isTemplate: true });
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

  async getTruthsByWorld(worldId: string, playthroughId?: string | null): Promise<Truth[]> {
    await this.connect();
    if (playthroughId) {
      // Return base truths (no playthroughId) merged with playthrough-specific truths
      const docs = await TruthModel.find({
        worldId,
        $or: [
          { playthroughId: null },
          { playthroughId: { $exists: false } },
          { playthroughId },
        ],
      });
      return docs.map(docToTruth);
    }
    // No playthrough filter — return all truths for the world
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

  async getItemsByWorld(worldId: string, disabledBaseItemIds?: string[]): Promise<Item[]> {
    await this.connect();
    // Get world-specific items
    const worldItems = await ItemModel.find({ worldId });
    // Get ALL base items (available to every world)
    const baseItems = await ItemModel.find({ isBase: true });
    // Merge: world items override base items with same objectRole
    const worldObjectRoles = new Set(worldItems.map(d => d.objectRole).filter(Boolean));
    const disabledSet = new Set(disabledBaseItemIds || []);
    const filteredBase = baseItems.filter(b =>
      (!b.objectRole || !worldObjectRoles.has(b.objectRole)) &&
      !disabledSet.has(b._id.toString())
    );
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

  // ============= TEXTS =============

  async getGameText(id: string): Promise<GameText | undefined> {
    await this.connect();
    const doc = await GameTextModel.findById(id);
    return doc ? docToGameText(doc) : undefined;
  }

  async getGameTextsByWorld(worldId: string, filters?: { textCategory?: string; cefrLevel?: string }): Promise<GameText[]> {
    await this.connect();
    const query: any = { worldId };
    if (filters?.textCategory) query.textCategory = filters.textCategory;
    if (filters?.cefrLevel) query.cefrLevel = filters.cefrLevel;
    const docs = await GameTextModel.find(query).sort({ createdAt: -1 });
    return docs.map(docToGameText);
  }

  async createGameText(text: InsertGameText): Promise<GameText> {
    await this.connect();
    const doc = await GameTextModel.create(text);
    return docToGameText(doc);
  }

  async updateGameText(id: string, text: Partial<InsertGameText>): Promise<GameText | undefined> {
    await this.connect();
    const doc = await GameTextModel.findByIdAndUpdate(id, { ...text, updatedAt: new Date() }, { new: true });
    return doc ? docToGameText(doc) : undefined;
  }

  async deleteGameText(id: string): Promise<boolean> {
    await this.connect();
    const result = await GameTextModel.findByIdAndDelete(id);
    return !!result;
  }

  // ============= CONTAINERS (deprecated — containers are now Items with isContainer=true) =============

  async getContainer(id: string): Promise<ContainerSchema | undefined> {
    return undefined;
  }

  async getContainersByWorld(worldId: string): Promise<ContainerSchema[]> {
    return [];
  }

  async getContainersByLocation(worldId: string, location: { businessId?: string; residenceId?: string; lotId?: string }): Promise<ContainerSchema[]> {
    return [];
  }

  async createContainer(container: InsertContainer): Promise<ContainerSchema> {
    return { id: 'deprecated', ...container } as any;
  }

  async updateContainer(id: string, container: Partial<InsertContainer>): Promise<ContainerSchema | undefined> {
    return undefined;
  }

  async deleteContainer(id: string): Promise<boolean> {
    return true;
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
    return !!result;
  }

  // Language chat messages removed — use PlaythroughConversation instead
  async getLanguageChatMessages(_languageId: string): Promise<LanguageChatMessage[]> {
    return [];
  }

  async createLanguageChatMessage(
    message: InsertLanguageChatMessage
  ): Promise<LanguageChatMessage> {
    // Stub: language chat messages have been removed in favor of PlaythroughConversation
    return { id: 'deprecated', ...message, createdAt: new Date() } as any;
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
    // Auto-generate API key for new users
    const crypto = await import('crypto');
    const apiKey = `isk_${crypto.randomBytes(24).toString('hex')}`;
    const doc = await UserModel.create({ ...user, apiKey });
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

  // ===== Player Progress (stored as truths with entryType='player_progress') =====
  async getPlayerProgress(id: string): Promise<PlayerProgress | undefined> {
    await this.connect();
    const doc = await TruthModel.findById(id);
    return doc && (doc as any).entryType === 'player_progress' ? truthToPlayerProgress(doc) : undefined;
  }

  async getPlayerProgressByUser(userId: string, worldId: string, playthroughId?: string): Promise<PlayerProgress | undefined> {
    await this.connect();
    const query: any = { entryType: 'player_progress', worldId, 'sourceData.userId': userId };
    if (playthroughId) query.playthroughId = playthroughId;
    const doc = await TruthModel.findOne(query);
    return doc ? truthToPlayerProgress(doc) : undefined;
  }

  async getPlayerProgressesByUser(userId: string): Promise<PlayerProgress[]> {
    await this.connect();
    const docs = await TruthModel.find({ entryType: 'player_progress', 'sourceData.userId': userId });
    return docs.map(truthToPlayerProgress);
  }

  async createPlayerProgress(progress: InsertPlayerProgress): Promise<PlayerProgress> {
    await this.connect();
    const userId = (progress as any).userId;
    const doc = await TruthModel.create({
      worldId: (progress as any).worldId,
      playthroughId: (progress as any).playthroughId || null,
      title: `Player Progress: ${userId}`,
      content: `player_progress('${userId}', '${(progress as any).worldId}').`,
      entryType: 'player_progress',
      timestep: 0,
      source: 'player_progress',
      sourceData: progress,
    });
    return truthToPlayerProgress(doc);
  }

  async updatePlayerProgress(id: string, progress: Partial<InsertPlayerProgress>): Promise<PlayerProgress | undefined> {
    await this.connect();
    const existing = await TruthModel.findById(id);
    if (!existing) return undefined;
    const merged = { ...((existing as any).sourceData || {}), ...progress };
    const doc = await TruthModel.findByIdAndUpdate(id, {
      $set: { sourceData: merged, updatedAt: new Date() }
    }, { new: true });
    return doc ? truthToPlayerProgress(doc) : undefined;
  }

  async deletePlayerProgress(id: string): Promise<boolean> {
    await this.connect();
    const result = await TruthModel.findByIdAndDelete(id);
    return !!result;
  }

  // ===== Player Sessions (embedded in player_progress truth sourceData.sessions[]) =====
  async getPlayerSession(id: string): Promise<PlayerSession | undefined> {
    await this.connect();
    const progress = await TruthModel.findOne({ entryType: 'player_progress', 'sourceData.sessions._id': id });
    if (!progress) return undefined;
    const sessions = ((progress as any).sourceData?.sessions as any[]) || [];
    const session = sessions.find((s: any) => s._id?.toString() === id);
    return session ? { ...session, id } as PlayerSession : undefined;
  }

  async getPlayerSessionsByUser(userId: string): Promise<PlayerSession[]> {
    await this.connect();
    const docs = await TruthModel.find({ entryType: 'player_progress', 'sourceData.userId': userId });
    const sessions: PlayerSession[] = [];
    for (const doc of docs) {
      for (const s of ((doc as any).sourceData?.sessions as any[]) || []) {
        sessions.push({ ...s, id: s._id?.toString() || s.id } as PlayerSession);
      }
    }
    sessions.sort((a: any, b: any) => (b.startedAt?.getTime?.() || 0) - (a.startedAt?.getTime?.() || 0));
    return sessions;
  }

  async createPlayerSession(session: InsertPlayerSession): Promise<PlayerSession> {
    await this.connect();
    const sessionData = { ...session, _id: new mongoose.Types.ObjectId(), startedAt: new Date(), createdAt: new Date() };
    await TruthModel.findByIdAndUpdate(
      (session as any).progressId,
      { $push: { 'sourceData.sessions': sessionData }, $inc: { 'sourceData.sessionsCount': 1 } }
    );
    return { ...sessionData, id: sessionData._id.toString() } as any as PlayerSession;
  }

  async updatePlayerSession(id: string, session: Partial<InsertPlayerSession>): Promise<PlayerSession | undefined> {
    await this.connect();
    const updates: any = {};
    for (const [key, val] of Object.entries(session)) {
      updates[`sourceData.sessions.$[elem].${key}`] = val;
    }
    const doc = await TruthModel.findOneAndUpdate(
      { entryType: 'player_progress', 'sourceData.sessions._id': id },
      { $set: updates },
      { arrayFilters: [{ 'elem._id': id }], new: true }
    );
    if (!doc) return undefined;
    const s = ((doc as any).sourceData?.sessions as any[])?.find((s: any) => s._id?.toString() === id);
    return s ? { ...s, id } as PlayerSession : undefined;
  }

  async endPlayerSession(id: string, duration: number): Promise<PlayerSession | undefined> {
    await this.connect();
    const doc = await TruthModel.findOneAndUpdate(
      { entryType: 'player_progress', 'sourceData.sessions._id': id },
      { $set: { 'sourceData.sessions.$[elem].endedAt': new Date(), 'sourceData.sessions.$[elem].duration': duration } },
      { arrayFilters: [{ 'elem._id': id }], new: true }
    );
    if (!doc) return undefined;
    const s = ((doc as any).sourceData?.sessions as any[])?.find((s: any) => s._id?.toString() === id);
    return s ? { ...s, id } as PlayerSession : undefined;
  }

  // ===== Achievements (stored as truths with entryType='achievement') =====
  private truthToAchievement(doc: any): any {
    const obj = doc.toObject ? doc.toObject() : doc;
    return { id: (doc._id || obj._id).toString(), worldId: obj.worldId, ...obj.sourceData };
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    await this.connect();
    const doc = await TruthModel.findById(id);
    return doc && (doc as any).entryType === 'achievement' ? this.truthToAchievement(doc) as any : undefined;
  }

  async getAchievementsByWorld(worldId: string): Promise<Achievement[]> {
    await this.connect();
    const docs = await TruthModel.find({ worldId, entryType: 'achievement' });
    return docs.map(d => this.truthToAchievement(d)) as any;
  }

  async getGlobalAchievements(): Promise<Achievement[]> {
    await this.connect();
    const docs = await TruthModel.find({ worldId: null, entryType: 'achievement' });
    return docs.map(d => this.truthToAchievement(d)) as any;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    await this.connect();
    const doc = await TruthModel.create({
      worldId: (achievement as any).worldId || null,
      title: (achievement as any).name,
      content: `achievement('${(achievement as any).name}', '${(achievement as any).achievementType}', ${(achievement as any).experienceReward || 0}).`,
      entryType: 'achievement',
      timestep: 0,
      source: 'achievement',
      sourceData: achievement,
    });
    return this.truthToAchievement(doc) as any;
  }

  async updateAchievement(id: string, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    await this.connect();
    const existing = await TruthModel.findById(id);
    if (!existing) return undefined;
    const merged = { ...((existing as any).sourceData || {}), ...achievement };
    const doc = await TruthModel.findByIdAndUpdate(id, {
      $set: { sourceData: merged, title: merged.name || (existing as any).title, updatedAt: new Date() }
    }, { new: true });
    return doc ? this.truthToAchievement(doc) as any : undefined;
  }

  async deleteAchievement(id: string): Promise<boolean> {
    await this.connect();
    const result = await TruthModel.findByIdAndDelete(id);
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
    if (result) {
      await Promise.all([
        PlaythroughDeltaModel.deleteMany({ playthroughId: id }),
        PlaythroughConversationModel.deleteMany({ playthroughId: id }),
        TruthModel.deleteMany({ playthroughId: id }),
      ]);
    }
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

  async deleteDeltasByPlaythrough(playthroughId: string): Promise<number> {
    await this.connect();
    const result = await PlaythroughDeltaModel.deleteMany({ playthroughId });
    return result.deletedCount || 0;
  }

  async compactDeltasByPlaythrough(playthroughId: string): Promise<{ before: number; after: number }> {
    await this.connect();
    const allDeltas = await PlaythroughDeltaModel.find({ playthroughId }).sort({ timestep: 1 });
    const before = allDeltas.length;
    if (before <= 1) return { before, after: before };

    // Group by entityType + entityId and merge into single compacted deltas
    const grouped = new Map<string, { entityType: string; entityId: string; deltas: any[] }>();
    for (const doc of allDeltas) {
      const key = `${doc.entityType}:${doc.entityId}`;
      if (!grouped.has(key)) {
        grouped.set(key, { entityType: doc.entityType, entityId: doc.entityId, deltas: [] });
      }
      grouped.get(key)!.deltas.push(doc);
    }

    const compacted: any[] = [];
    for (const { entityType, entityId, deltas } of grouped.values()) {
      // If only one delta for this entity, keep it as-is
      if (deltas.length === 1) {
        compacted.push(deltas[0]);
        continue;
      }

      // Replay deltas to compute final state
      let finalOp: string = deltas[0].operation;
      let mergedDelta: Record<string, any> = {};
      let mergedFull: Record<string, any> | null = null;
      let maxTimestep = 0;

      for (const d of deltas) {
        maxTimestep = Math.max(maxTimestep, d.timestep);
        if (d.operation === 'delete') {
          finalOp = 'delete';
          mergedDelta = {};
          mergedFull = null;
        } else if (d.operation === 'create') {
          finalOp = 'create';
          mergedFull = { ...(mergedFull || {}), ...(d.fullData || {}) };
          mergedDelta = {};
        } else if (d.operation === 'update') {
          if (finalOp === 'create' && mergedFull) {
            mergedFull = { ...mergedFull, ...(d.deltaData || {}) };
          } else if (finalOp !== 'delete') {
            finalOp = 'update';
            mergedDelta = { ...mergedDelta, ...(d.deltaData || {}) };
          }
        }
      }

      compacted.push({
        playthroughId,
        entityType,
        entityId,
        operation: finalOp,
        deltaData: Object.keys(mergedDelta).length > 0 ? mergedDelta : null,
        fullData: mergedFull,
        timestep: maxTimestep,
        description: `Compacted ${deltas.length} deltas for ${entityType} ${entityId}`,
        tags: ['compacted'],
      });
    }

    // Replace all deltas with compacted versions in a single transaction-like operation
    await PlaythroughDeltaModel.deleteMany({ playthroughId });
    if (compacted.length > 0) {
      await PlaythroughDeltaModel.insertMany(compacted);
    }

    return { before, after: compacted.length };
  }

  // ===== Play Traces (stored as truths with entryType='play_trace') =====
  async getPlayTrace(id: string): Promise<PlayTrace | undefined> {
    await this.connect();
    const doc = await TruthModel.findById(id);
    return doc && (doc as any).entryType === 'play_trace' ? truthToPlayTrace(doc) : undefined;
  }

  async getTracesByPlaythrough(playthroughId: string): Promise<PlayTrace[]> {
    await this.connect();
    const docs = await TruthModel.find({ entryType: 'play_trace', playthroughId }).sort({ createdAt: 1 });
    return docs.map(truthToPlayTrace);
  }

  async getTracesByUser(userId: string): Promise<PlayTrace[]> {
    await this.connect();
    const docs = await TruthModel.find({ entryType: 'play_trace', 'sourceData.userId': userId }).sort({ createdAt: -1 });
    return docs.map(truthToPlayTrace);
  }

  async createPlayTrace(trace: InsertPlayTrace): Promise<PlayTrace> {
    await this.connect();
    const t = trace as any;
    const doc = await TruthModel.create({
      worldId: t.worldId || 'unknown',
      playthroughId: t.playthroughId,
      characterId: t.characterId || null,
      title: `Trace: ${t.actionType}${t.actionName ? ' - ' + t.actionName : ''}`,
      content: `play_trace('${t.playthroughId}', '${t.actionType}', ${t.timestep}).`,
      entryType: 'play_trace',
      timestep: t.timestep || 0,
      source: 'play_trace',
      sourceData: trace,
    });
    return truthToPlayTrace(doc);
  }

  async deletePlayTrace(id: string): Promise<boolean> {
    await this.connect();
    const result = await TruthModel.findByIdAndDelete(id);
    return !!result;
  }

  // ===== Playthrough Conversations =====
  async getPlaythroughConversation(id: string): Promise<PlaythroughConversation | undefined> {
    await this.connect();
    const doc = await PlaythroughConversationModel.findById(id);
    return doc ? docToPlaythroughConversation(doc) : undefined;
  }

  async getConversationsByPlaythrough(playthroughId: string): Promise<PlaythroughConversation[]> {
    await this.connect();
    const docs = await PlaythroughConversationModel.find({ playthroughId }).sort({ createdAt: -1 });
    return docs.map(docToPlaythroughConversation);
  }

  async getConversationsByWorld(worldId: string): Promise<PlaythroughConversation[]> {
    await this.connect();
    const docs = await PlaythroughConversationModel.find({ worldId }).sort({ createdAt: -1 });
    return docs.map(docToPlaythroughConversation);
  }

  async getConversationsByNpc(playthroughId: string, npcCharacterId: string): Promise<PlaythroughConversation[]> {
    await this.connect();
    const docs = await PlaythroughConversationModel.find({ playthroughId, npcCharacterId }).sort({ createdAt: -1 });
    return docs.map(docToPlaythroughConversation);
  }

  async createPlaythroughConversation(conversation: InsertPlaythroughConversation): Promise<PlaythroughConversation> {
    await this.connect();
    const doc = await PlaythroughConversationModel.create(conversation);
    return docToPlaythroughConversation(doc);
  }

  async updatePlaythroughConversation(id: string, updates: Partial<InsertPlaythroughConversation>): Promise<PlaythroughConversation | undefined> {
    await this.connect();
    const doc = await PlaythroughConversationModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
    return doc ? docToPlaythroughConversation(doc) : undefined;
  }

  async deletePlaythroughConversation(id: string): Promise<boolean> {
    await this.connect();
    const result = await PlaythroughConversationModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteConversationsByPlaythrough(playthroughId: string): Promise<number> {
    await this.connect();
    const result = await PlaythroughConversationModel.deleteMany({ playthroughId });
    return result.deletedCount;
  }

  // ============= LANGUAGE LEARNING (stored as truths with entryType='language_progress') =============

  private async getOrCreateLearningDoc(playerId: string, worldId: string, playthroughId?: string): Promise<any> {
    const query: any = { entryType: 'language_progress', worldId, 'sourceData.playerId': playerId };
    if (playthroughId) query.playthroughId = playthroughId;
    let doc = await TruthModel.findOne(query);
    if (!doc) {
      doc = await TruthModel.create({
        worldId,
        playthroughId: playthroughId || null,
        title: `Language Progress: ${playerId}`,
        content: `language_progress('${playerId}', '${worldId}').`,
        entryType: 'language_progress',
        timestep: 0,
        source: 'language_progress',
        sourceData: {
          playerId, worldId, playthroughId: playthroughId || null,
          vocabulary: [], grammarPatterns: [], conversations: [],
          reading: { articlesRead: [], quizAnswers: [], totalCorrect: 0, totalAttempted: 0, xpFromReading: 0 },
        },
      });
    }
    return doc;
  }

  async getLanguageProgress(playerId: string, worldId: string, playthroughId?: string): Promise<any | null> {
    const query: any = { entryType: 'language_progress', worldId, 'sourceData.playerId': playerId };
    if (playthroughId) query.playthroughId = playthroughId;
    const doc = await TruthModel.findOne(query);
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return { id: (doc._id || (obj as any)._id).toString(), ...obj.sourceData };
  }

  async upsertLanguageProgress(playerId: string, worldId: string, data: any, playthroughId?: string): Promise<any> {
    const query: any = { entryType: 'language_progress', worldId, 'sourceData.playerId': playerId };
    if (playthroughId) query.playthroughId = playthroughId;
    const existing = await TruthModel.findOne(query);
    if (existing) {
      const merged = { ...((existing as any).sourceData || {}), ...data };
      const doc = await TruthModel.findByIdAndUpdate(existing._id, {
        $set: { sourceData: merged, updatedAt: new Date() }
      }, { new: true });
      const obj = doc!.toObject ? doc!.toObject() : doc!;
      return { id: doc!._id.toString(), ...(obj as any).sourceData };
    }
    const doc = await TruthModel.create({
      worldId,
      playthroughId: playthroughId || null,
      title: `Language Progress: ${playerId}`,
      content: `language_progress('${playerId}', '${worldId}').`,
      entryType: 'language_progress',
      timestep: 0,
      source: 'language_progress',
      sourceData: { playerId, worldId, playthroughId: playthroughId || null, ...data },
    });
    const obj = doc.toObject ? doc.toObject() : doc;
    return { id: doc._id.toString(), ...obj.sourceData };
  }

  async getVocabularyEntries(playerId: string, worldId: string, playthroughId?: string): Promise<any[]> {
    const doc = await this.getOrCreateLearningDoc(playerId, worldId, playthroughId);
    return ((doc as any).sourceData?.vocabulary || []) as any[];
  }

  async upsertVocabularyEntry(playerId: string, worldId: string, word: string, data: any, playthroughId?: string): Promise<any> {
    const doc = await this.getOrCreateLearningDoc(playerId, worldId, playthroughId);
    const sd = (doc as any).sourceData || {};
    const vocab = (sd.vocabulary || []) as any[];
    const idx = vocab.findIndex((v: any) => v.word === word);
    if (idx >= 0) {
      Object.assign(vocab[idx], data, { updatedAt: new Date() });
    } else {
      vocab.push({ word, ...data, createdAt: new Date(), updatedAt: new Date() });
    }
    sd.vocabulary = vocab;
    await TruthModel.findByIdAndUpdate(doc._id, { $set: { sourceData: sd, updatedAt: new Date() } });
    return idx >= 0 ? vocab[idx] : vocab[vocab.length - 1];
  }

  async getGrammarPatterns(playerId: string, worldId: string, playthroughId?: string): Promise<any[]> {
    const doc = await this.getOrCreateLearningDoc(playerId, worldId, playthroughId);
    return ((doc as any).sourceData?.grammarPatterns || []) as any[];
  }

  async upsertGrammarPattern(playerId: string, worldId: string, pattern: string, data: any, playthroughId?: string): Promise<any> {
    const doc = await this.getOrCreateLearningDoc(playerId, worldId, playthroughId);
    const sd = (doc as any).sourceData || {};
    const patterns = (sd.grammarPatterns || []) as any[];
    const idx = patterns.findIndex((p: any) => p.pattern === pattern);
    if (idx >= 0) {
      Object.assign(patterns[idx], data, { updatedAt: new Date() });
    } else {
      patterns.push({ pattern, ...data, createdAt: new Date(), updatedAt: new Date() });
    }
    sd.grammarPatterns = patterns;
    await TruthModel.findByIdAndUpdate(doc._id, { $set: { sourceData: sd, updatedAt: new Date() } });
    return idx >= 0 ? patterns[idx] : patterns[patterns.length - 1];
  }

  async getConversationRecords(playerId: string, worldId: string, playthroughId?: string): Promise<any[]> {
    const doc = await this.getOrCreateLearningDoc(playerId, worldId, playthroughId);
    const convos = ((doc as any).sourceData?.conversations || []) as any[];
    return convos.sort((a: any, b: any) => (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0));
  }

  async createConversationRecord(data: any): Promise<any> {
    const { playerId, worldId, playthroughId, ...recordData } = data;
    const record = { ...recordData, createdAt: new Date() };
    const doc = await this.getOrCreateLearningDoc(playerId, worldId, playthroughId);
    const sd = (doc as any).sourceData || {};
    const convos = (sd.conversations || []) as any[];
    convos.push(record);
    sd.conversations = convos;
    await TruthModel.findByIdAndUpdate(doc._id, { $set: { sourceData: sd, updatedAt: new Date() } });
    return record;
  }

  async getReadingProgress(playerId: string, worldId: string, playthroughId?: string): Promise<any | null> {
    const doc = await this.getOrCreateLearningDoc(playerId, worldId, playthroughId);
    return (doc as any).sourceData?.reading || null;
  }

  async upsertReadingProgress(playerId: string, worldId: string, data: any, playthroughId?: string): Promise<any> {
    const doc = await this.getOrCreateLearningDoc(playerId, worldId, playthroughId);
    const sd = (doc as any).sourceData || {};
    sd.reading = data;
    await TruthModel.findByIdAndUpdate(doc._id, { $set: { sourceData: sd, updatedAt: new Date() } });
    return data;
  }

  // ============= ASSESSMENTS (unified: result, session, evaluation) =============

  async getLanguageAssessments(playerId: string, worldId: string): Promise<any[]> {
    const docs = await AssessmentModel.find({ docType: 'result', playerId, worldId }).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async createLanguageAssessment(data: any): Promise<any> {
    const doc = await AssessmentModel.create({ ...data, docType: 'result' });
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async getAssessmentsByStudy(studyId: string): Promise<any[]> {
    const docs = await AssessmentModel.find({ docType: 'result', studyId }).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async getLanguageAssessmentsByWorld(worldId: string, filters?: { assessmentType?: string; dateFrom?: string; dateTo?: string }): Promise<any[]> {
    const query: any = { docType: 'result', worldId };
    if (filters?.assessmentType) query.assessmentType = filters.assessmentType;
    if (filters?.dateFrom || filters?.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }
    const docs = await AssessmentModel.find(query).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async createEvaluationResponse(data: any): Promise<any> {
    const doc = await AssessmentModel.create({ ...data, docType: 'evaluation' });
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async getEvaluationResponses(studyId: string, participantId?: string, targetLanguage?: string): Promise<any[]> {
    const query: any = { docType: 'evaluation', studyId };
    if (participantId) query.participantId = participantId;
    if (targetLanguage) query.targetLanguage = targetLanguage;
    const docs = await AssessmentModel.find(query).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async getEvaluationResponsesByParticipant(participantId: string): Promise<any[]> {
    const docs = await AssessmentModel.find({ docType: 'evaluation', participantId }).sort({ createdAt: -1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async getEvaluationSummary(studyId: string, targetLanguage?: string): Promise<any> {
    const query: any = { studyId };
    if (targetLanguage) query.targetLanguage = targetLanguage;
    const docs = await AssessmentModel.find(query);
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

  // ============= TELEMETRY (unified technical + engagement) =============

  async createTelemetryBatch(events: any[]): Promise<number> {
    if (events.length === 0) return 0;
    const tagged = events.map(e => ({ ...e, category: e.category || 'technical' }));
    const result = await TelemetryModel.insertMany(tagged, { ordered: false });
    return result.length;
  }

  async getTelemetrySummary(sessionId: string): Promise<any> {
    const docs = await TelemetryModel.find({ sessionId, category: 'technical' });
    const byType: Record<string, { count: number; values: number[] }> = {};
    for (const doc of docs) {
      const et = (doc as any).eventType;
      if (!byType[et]) byType[et] = { count: 0, values: [] };
      byType[et].count++;
      if ((doc as any).value != null) byType[et].values.push((doc as any).value);
    }
    return { sessionId, totalMetrics: docs.length, byType };
  }

  async getAggregateTelemetry(studyId: string): Promise<any> {
    const sessions = await TelemetryModel.find({ category: 'engagement', eventType: 'session_start' }).distinct('sessionId');
    const docs = await TelemetryModel.find({ sessionId: { $in: sessions }, category: 'technical' });
    const byType: Record<string, number[]> = {};
    for (const doc of docs) {
      const et = (doc as any).eventType;
      if (!byType[et]) byType[et] = [];
      if ((doc as any).value != null) byType[et].push((doc as any).value);
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

  async createEngagementEvent(data: any): Promise<any> {
    const doc = await TelemetryModel.create({ ...data, category: 'engagement' });
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async createEngagementBatch(events: any[]): Promise<number> {
    if (events.length === 0) return 0;
    const tagged = events.map(e => ({ ...e, category: 'engagement' }));
    const result = await TelemetryModel.insertMany(tagged, { ordered: false });
    return result.length;
  }

  async getEngagementSessions(playerId: string, studyId?: string): Promise<any[]> {
    const query: any = { playerId, category: 'engagement', eventType: { $in: ['session_start', 'session_end'] } };
    const docs = await TelemetryModel.find(query).sort({ createdAt: 1 });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  // ============= API KEYS (stored on user accounts) =============

  async validateApiKey(key: string): Promise<any | null> {
    await this.connect();
    const doc = await UserModel.findOne({ apiKey: key, isActive: true });
    if (!doc) return null;
    return { id: doc._id.toString(), ownerId: doc._id.toString(), key, permissions: ['telemetry:write'] };
  }

  async getUserApiKey(userId: string): Promise<string | null> {
    await this.connect();
    const doc = await UserModel.findById(userId);
    if (!doc) return null;
    // Generate one if missing (for existing users created before this feature)
    if (!doc.apiKey) {
      const crypto = await import('crypto');
      const apiKey = `isk_${crypto.randomBytes(24).toString('hex')}`;
      await UserModel.updateOne({ _id: userId }, { $set: { apiKey } });
      return apiKey;
    }
    return doc.apiKey;
  }

  async regenerateUserApiKey(userId: string): Promise<string | null> {
    await this.connect();
    const crypto = await import('crypto');
    const apiKey = `isk_${crypto.randomBytes(24).toString('hex')}`;
    const result = await UserModel.updateOne({ _id: userId }, { $set: { apiKey, updatedAt: new Date() } });
    return result.modifiedCount > 0 ? apiKey : null;
  }

  // ============= ASSESSMENT SESSIONS =============

  async createAssessmentSession(data: Omit<AssessmentSession, 'id'>): Promise<AssessmentSession> {
    await this.connect();
    const doc = await AssessmentModel.create({ ...data, docType: 'session' });
    return docToAssessmentSession(doc);
  }

  async getAssessmentSession(id: string): Promise<AssessmentSession | undefined> {
    await this.connect();
    const doc = await AssessmentModel.findById(id);
    return doc ? docToAssessmentSession(doc) : undefined;
  }

  async updateAssessmentPhaseResult(sessionId: string, phaseResult: PhaseResult): Promise<AssessmentSession | undefined> {
    await this.connect();
    const existing = await AssessmentModel.findById(sessionId);
    if (!existing) return undefined;

    const idx = existing.phaseResults.findIndex((r: any) => r.phaseId === phaseResult.phaseId);
    let update;
    if (idx >= 0) {
      update = await AssessmentModel.findByIdAndUpdate(
        sessionId,
        { $set: { [`phaseResults.${idx}`]: phaseResult } },
        { new: true }
      );
    } else {
      update = await AssessmentModel.findByIdAndUpdate(
        sessionId,
        { $push: { phaseResults: phaseResult } },
        { new: true }
      );
    }
    return update ? docToAssessmentSession(update) : undefined;
  }

  async addAssessmentRecording(sessionId: string, recording: RecordingReference): Promise<AssessmentSession | undefined> {
    await this.connect();
    const doc = await AssessmentModel.findByIdAndUpdate(
      sessionId,
      { $push: { recordings: recording } },
      { new: true }
    );
    return doc ? docToAssessmentSession(doc) : undefined;
  }

  async completeAssessmentSession(sessionId: string, totalScore: number, maxScore: number, cefrLevel: string): Promise<AssessmentSession | undefined> {
    await this.connect();
    const doc = await AssessmentModel.findByIdAndUpdate(
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

  async getPlayerAssessments(playerId: string, worldId?: string, assessmentType?: string, playthroughId?: string): Promise<AssessmentSession[]> {
    await this.connect();
    const query: any = { playerId };
    if (worldId) query.worldId = worldId;
    if (assessmentType) query.assessmentType = assessmentType;
    if (playthroughId) query.playthroughId = playthroughId;
    const docs = await AssessmentModel.find(query).sort({ createdAt: -1 });
    return docs.map(d => docToAssessmentSession(d));
  }

  async getWorldAssessmentSessions(worldId: string): Promise<AssessmentSession[]> {
    await this.connect();
    const docs = await AssessmentModel.find({ worldId }).sort({ createdAt: -1 });
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
    const docs = await AssessmentModel.find({ worldId, status: 'complete' });
    const totalSessions = await AssessmentModel.countDocuments({ worldId });

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

  // ============= GEOGRAPHIC FEATURES (unified terrain + water) =============

  async getTerrainFeature(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await LocationModel.findById(id);
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : undefined;
  }

  async getTerrainFeaturesByWorld(worldId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ worldId, featureCategory: 'terrain' });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async createTerrainFeature(feature: any): Promise<any> {
    await this.connect();
    const doc = await LocationModel.create({ ...feature, featureCategory: 'terrain' });
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async updateTerrainFeature(id: string, feature: any): Promise<any | undefined> {
    await this.connect();
    const doc = await LocationModel.findByIdAndUpdate(
      id, { $set: { ...feature, updatedAt: new Date() } }, { new: true }
    );
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : undefined;
  }

  async deleteTerrainFeature(id: string): Promise<boolean> {
    await this.connect();
    const result = await LocationModel.findByIdAndDelete(id);
    return !!result;
  }

  async getWaterFeature(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await LocationModel.findById(id);
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : undefined;
  }

  async getWaterFeaturesByWorld(worldId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ worldId, featureCategory: 'water' });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async getWaterFeaturesBySettlement(settlementId: string): Promise<any[]> {
    await this.connect();
    const docs = await LocationModel.find({ settlementId, featureCategory: 'water' });
    return docs.map(d => ({ id: d._id.toString(), ...d.toObject() }));
  }

  async createWaterFeature(feature: any): Promise<any> {
    await this.connect();
    const doc = await LocationModel.create({ ...feature, featureCategory: 'water' });
    return { id: doc._id.toString(), ...doc.toObject() };
  }

  async updateWaterFeature(id: string, feature: any): Promise<any | undefined> {
    await this.connect();
    const doc = await LocationModel.findByIdAndUpdate(
      id, { $set: { ...feature, updatedAt: new Date() } }, { new: true }
    );
    return doc ? { id: doc._id.toString(), ...doc.toObject() } : undefined;
  }

  async deleteWaterFeature(id: string): Promise<boolean> {
    await this.connect();
    const result = await LocationModel.findByIdAndDelete(id);
    return !!result;
  }

  // ===== Reputations (stored as truths with entryType='reputation') =====

  async getReputation(id: string): Promise<Reputation | undefined> {
    await this.connect();
    const doc = await TruthModel.findById(id);
    return doc && (doc as any).entryType === 'reputation' ? truthToReputation(doc) : undefined;
  }

  async getReputationsByPlaythrough(playthroughId: string): Promise<Reputation[]> {
    await this.connect();
    const docs = await TruthModel.find({ entryType: 'reputation', playthroughId });
    return docs.map(truthToReputation);
  }

  async getReputationForEntity(playthroughId: string, entityType: string, entityId: string): Promise<Reputation | undefined> {
    await this.connect();
    const doc = await TruthModel.findOne({ entryType: 'reputation', playthroughId, 'sourceData.entityType': entityType, 'sourceData.entityId': entityId });
    return doc ? truthToReputation(doc) : undefined;
  }

  async createReputation(reputation: InsertReputation): Promise<Reputation> {
    await this.connect();
    const r = reputation as any;
    const doc = await TruthModel.create({
      worldId: r.worldId || 'unknown',
      playthroughId: r.playthroughId,
      title: `Reputation: ${r.entityType}/${r.entityId}`,
      content: `reputation('${r.playthroughId}', '${r.entityType}', '${r.entityId}', ${r.score || 0}).`,
      entryType: 'reputation',
      timestep: 0,
      source: 'reputation',
      sourceData: reputation,
    });
    return truthToReputation(doc);
  }

  async updateReputation(id: string, updates: Partial<InsertReputation>): Promise<Reputation | undefined> {
    await this.connect();
    const existing = await TruthModel.findById(id);
    if (!existing) return undefined;
    const merged = { ...((existing as any).sourceData || {}), ...updates };
    const doc = await TruthModel.findByIdAndUpdate(id, {
      $set: { sourceData: merged, updatedAt: new Date() }
    }, { new: true });
    return doc ? truthToReputation(doc) : undefined;
  }

  async upsertReputation(playthroughId: string, entityType: string, entityId: string, updates: Partial<InsertReputation>): Promise<Reputation> {
    await this.connect();
    const existing = await TruthModel.findOne({ entryType: 'reputation', playthroughId, 'sourceData.entityType': entityType, 'sourceData.entityId': entityId });
    if (existing) {
      const merged = { ...((existing as any).sourceData || {}), ...updates, entityType, entityId, playthroughId };
      const doc = await TruthModel.findByIdAndUpdate(existing._id, {
        $set: { sourceData: merged, updatedAt: new Date() }
      }, { new: true });
      return truthToReputation(doc!);
    }
    const r = updates as any;
    const doc = await TruthModel.create({
      worldId: r.worldId || 'unknown',
      playthroughId,
      title: `Reputation: ${entityType}/${entityId}`,
      content: `reputation('${playthroughId}', '${entityType}', '${entityId}', ${r.score || 0}).`,
      entryType: 'reputation',
      timestep: 0,
      source: 'reputation',
      sourceData: { ...updates, playthroughId, entityType, entityId },
    });
    return truthToReputation(doc);
  }

  async deleteReputation(id: string): Promise<boolean> {
    await this.connect();
    const result = await TruthModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteReputationsByPlaythrough(playthroughId: string): Promise<number> {
    await this.connect();
    const result = await TruthModel.deleteMany({ entryType: 'reputation', playthroughId });
    return result.deletedCount;
  }

  // ===== Playthrough Relationships (stored as truths with entryType='relationship') =====

  async getPlaythroughRelationship(playthroughId: string, fromCharacterId: string, toCharacterId: string): Promise<PlaythroughRelationship | undefined> {
    await this.connect();
    const doc = await TruthModel.findOne({
      entryType: 'relationship', playthroughId,
      'sourceData.fromCharacterId': fromCharacterId, 'sourceData.toCharacterId': toCharacterId
    });
    return doc ? truthToPlaythroughRelationship(doc) : undefined;
  }

  async getPlaythroughRelationshipsForCharacter(playthroughId: string, characterId: string): Promise<PlaythroughRelationship[]> {
    await this.connect();
    const docs = await TruthModel.find({
      entryType: 'relationship', playthroughId,
      $or: [{ 'sourceData.fromCharacterId': characterId }, { 'sourceData.toCharacterId': characterId }]
    });
    return docs.map(truthToPlaythroughRelationship);
  }

  async getPlaythroughRelationshipsByPlaythrough(playthroughId: string): Promise<PlaythroughRelationship[]> {
    await this.connect();
    const docs = await TruthModel.find({ entryType: 'relationship', playthroughId });
    return docs.map(truthToPlaythroughRelationship);
  }

  async upsertPlaythroughRelationship(rel: InsertPlaythroughRelationship): Promise<PlaythroughRelationship> {
    await this.connect();
    const existing = await TruthModel.findOne({
      entryType: 'relationship', playthroughId: rel.playthroughId,
      'sourceData.fromCharacterId': rel.fromCharacterId, 'sourceData.toCharacterId': rel.toCharacterId
    });
    if (existing) {
      const merged = { ...((existing as any).sourceData || {}), ...rel };
      const doc = await TruthModel.findByIdAndUpdate(existing._id, {
        $set: { sourceData: merged, updatedAt: new Date() }
      }, { new: true });
      return truthToPlaythroughRelationship(doc!);
    }

    // Resolve human-readable names and proper IDs
    const playthrough = rel.playthroughId ? await PlaythroughModel.findById(rel.playthroughId) : null;
    const worldId = (rel as any).worldId || playthrough?.worldId || null;

    // Resolve "player" to the actual user ID from the playthrough
    const resolveId = (id: string) => id === 'player' && playthrough?.userId ? playthrough.userId : id;
    const fromId = resolveId(rel.fromCharacterId);
    const toId = resolveId(rel.toCharacterId);

    // Resolve character names for human-readable title/content
    const resolveName = async (id: string) => {
      if (id === 'player' || id === playthrough?.userId) {
        // Try the player's in-game character first
        if (playthrough?.playerCharacterId) {
          const playerChar = await CharacterModel.findById(playthrough.playerCharacterId);
          if (playerChar) return `${playerChar.firstName} ${playerChar.lastName}`.trim();
        }
        // Fall back to the user account name
        const user = playthrough?.userId ? await UserModel.findById(playthrough.userId) : null;
        if (user) return user.displayName || user.username;
        return 'Player';
      }
      const char = await CharacterModel.findById(id);
      return char ? `${char.firstName} ${char.lastName}` : id.substring(0, 12);
    };

    const fromName = await resolveName(rel.fromCharacterId);
    const toName = await resolveName(rel.toCharacterId);

    const doc = await TruthModel.create({
      worldId,
      playthroughId: rel.playthroughId,
      characterId: fromId,
      title: `${rel.type}: ${fromName} and ${toName}`,
      content: `relationship('${fromName}', '${toName}', '${rel.type}', ${rel.strength}).`,
      entryType: 'relationship',
      timestep: 0,
      source: 'relationship',
      sourceData: { ...rel, fromCharacterId: fromId, toCharacterId: toId },
      relatedCharacterIds: [fromId, toId],
    });
    return truthToPlaythroughRelationship(doc);
  }

  async deletePlaythroughRelationship(playthroughId: string, fromCharacterId: string, toCharacterId: string): Promise<boolean> {
    await this.connect();
    const result = await TruthModel.findOneAndDelete({
      entryType: 'relationship', playthroughId,
      'sourceData.fromCharacterId': fromCharacterId, 'sourceData.toCharacterId': toCharacterId
    });
    return !!result;
  }

  async deletePlaythroughRelationshipsByPlaythrough(playthroughId: string): Promise<number> {
    await this.connect();
    const result = await TruthModel.deleteMany({ entryType: 'relationship', playthroughId });
    return result.deletedCount;
  }

  // ===== Version Alerts =====

  async getVersionAlert(id: string): Promise<VersionAlert | undefined> {
    await this.connect();
    const doc = await VersionAlertModel.findById(id);
    return doc ? docToVersionAlert(doc) : undefined;
  }

  async getVersionAlertsByUser(userId: string, dismissed?: boolean): Promise<VersionAlert[]> {
    await this.connect();
    const filter: Record<string, any> = { userId };
    if (dismissed !== undefined) filter.dismissed = dismissed;
    const docs = await VersionAlertModel.find(filter).sort({ createdAt: -1 });
    return docs.map(docToVersionAlert);
  }

  async getVersionAlertsByPlaythrough(playthroughId: string): Promise<VersionAlert[]> {
    await this.connect();
    const docs = await VersionAlertModel.find({ playthroughId }).sort({ createdAt: -1 });
    return docs.map(docToVersionAlert);
  }

  async getVersionAlertsByWorld(worldId: string): Promise<VersionAlert[]> {
    await this.connect();
    const docs = await VersionAlertModel.find({ worldId }).sort({ createdAt: -1 });
    return docs.map(docToVersionAlert);
  }

  async createVersionAlert(alert: InsertVersionAlert): Promise<VersionAlert> {
    await this.connect();
    const doc = await VersionAlertModel.create(alert);
    return docToVersionAlert(doc);
  }

  async dismissVersionAlert(id: string): Promise<VersionAlert | undefined> {
    await this.connect();
    const doc = await VersionAlertModel.findByIdAndUpdate(id, { dismissed: true }, { new: true });
    return doc ? docToVersionAlert(doc) : undefined;
  }

  async dismissVersionAlertsByPlaythrough(playthroughId: string): Promise<number> {
    await this.connect();
    const result = await VersionAlertModel.updateMany(
      { playthroughId, dismissed: false },
      { dismissed: true },
    );
    return result.modifiedCount;
  }

  async deleteVersionAlert(id: string): Promise<boolean> {
    await this.connect();
    const result = await VersionAlertModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteVersionAlertsByPlaythrough(playthroughId: string): Promise<number> {
    await this.connect();
    const result = await VersionAlertModel.deleteMany({ playthroughId });
    return result.deletedCount;
  }

  // ===== Game Texts =====

  async getGameText(id: string): Promise<GameText | undefined> {
    await this.connect();
    const doc = await GameTextModel.findById(id);
    return doc ? docToGameText(doc) : undefined;
  }

  async getGameTextsByWorld(worldId: string): Promise<GameText[]> {
    await this.connect();
    const docs = await GameTextModel.find({ worldId });
    return docs.map(docToGameText);
  }

  async getGameTextsByCategory(worldId: string, textCategory: string): Promise<GameText[]> {
    await this.connect();
    const docs = await GameTextModel.find({ worldId, textCategory });
    return docs.map(docToGameText);
  }

  async getGameTextsByCefrLevel(worldId: string, cefrLevel: string): Promise<GameText[]> {
    await this.connect();
    const docs = await GameTextModel.find({ worldId, cefrLevel });
    return docs.map(docToGameText);
  }

  async createGameText(text: InsertGameText): Promise<GameText> {
    await this.connect();
    const doc = await GameTextModel.create(text);
    return docToGameText(doc);
  }

  async updateGameText(id: string, text: Partial<InsertGameText>): Promise<GameText | undefined> {
    await this.connect();
    const doc = await GameTextModel.findByIdAndUpdate(id, { ...text, updatedAt: new Date() }, { new: true });
    return doc ? docToGameText(doc) : undefined;
  }

  async deleteGameText(id: string): Promise<boolean> {
    await this.connect();
    const result = await GameTextModel.findByIdAndDelete(id);
    return !!result;
  }

  // ── Save File operations ─────────────────────────────────────────────

  async createSaveFile(save: any): Promise<any> {
    await this.connect();
    const doc = await new SaveFileModel(save).save();
    return { ...doc.toObject(), id: doc._id.toString() };
  }

  async getSaveFile(id: string): Promise<any | undefined> {
    await this.connect();
    const doc = await SaveFileModel.findById(id);
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async getSaveFileBySlot(userId: string, worldId: string, slotIndex: number): Promise<any | undefined> {
    await this.connect();
    const doc = await SaveFileModel.findOne({ userId, worldId, slotIndex });
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async getSaveFilesByUser(userId: string, worldId: string): Promise<any[]> {
    await this.connect();
    const docs = await SaveFileModel.find({ userId, worldId }).sort({ lastSavedAt: -1 });
    return docs.map(d => ({ ...d.toObject(), id: d._id.toString() }));
  }

  async updateSaveFile(id: string, updates: any): Promise<any | undefined> {
    await this.connect();
    const doc = await SaveFileModel.findByIdAndUpdate(
      id,
      { ...updates, lastSavedAt: new Date(), $inc: { saveCount: 1 } },
      { new: true }
    );
    return doc ? { ...doc.toObject(), id: doc._id.toString() } : undefined;
  }

  async appendPlaytraces(saveId: string, traces: any[]): Promise<boolean> {
    await this.connect();
    // Store traces in a separate collection to avoid bloating the save document
    const db = mongoose.connection.db!;
    const traceColl = db.collection('playtraces');
    const docs = traces.map(t => ({ saveId, ...t, createdAt: new Date() }));
    await traceColl.insertMany(docs, { ordered: false });
    return true;
  }

  async deleteSaveFile(id: string): Promise<boolean> {
    await this.connect();
    const result = await SaveFileModel.findByIdAndDelete(id);
    return !!result;
  }

  async deleteSaveFileBySlot(userId: string, worldId: string, slotIndex: number): Promise<boolean> {
    await this.connect();
    const result = await SaveFileModel.findOneAndDelete({ userId, worldId, slotIndex });
    return !!result;
  }

  // ── Word Translation Cache ──────────────────────────────────────────────────

  async findTranslation(worldId: string, word: string, targetLanguage: string): Promise<{ translation: string; partOfSpeech?: string } | null> {
    await this.connect();
    const doc = await WordTranslationCacheModel.findOne({
      worldId,
      sourceWord: word.toLowerCase(),
      targetLanguage,
    });
    if (!doc) return null;
    return { translation: doc.translation, partOfSpeech: doc.partOfSpeech ?? undefined };
  }

  async upsertTranslation(worldId: string, word: string, targetLanguage: string, translation: string, partOfSpeech?: string): Promise<void> {
    await this.connect();
    await WordTranslationCacheModel.findOneAndUpdate(
      { worldId, sourceWord: word.toLowerCase(), targetLanguage },
      {
        $set: { translation, partOfSpeech: partOfSpeech ?? null },
        $setOnInsert: { createdAt: new Date(), lookupCount: 1 },
      },
      { upsert: true },
    );
  }

  async incrementTranslationLookup(worldId: string, word: string, targetLanguage: string): Promise<void> {
    await this.connect();
    await WordTranslationCacheModel.updateOne(
      { worldId, sourceWord: word.toLowerCase(), targetLanguage },
      { $inc: { lookupCount: 1 } },
    );
  }

  async bulkUpsertTranslations(worldId: string, targetLanguage: string, translations: Array<{ word: string; translation: string; partOfSpeech?: string }>): Promise<number> {
    await this.connect();
    const ops = translations.map(t => ({
      updateOne: {
        filter: { worldId, sourceWord: t.word.toLowerCase(), targetLanguage },
        update: {
          $set: { translation: t.translation, partOfSpeech: t.partOfSpeech ?? null },
          $setOnInsert: { createdAt: new Date(), lookupCount: 1 },
        },
        upsert: true,
      },
    }));
    if (ops.length === 0) return 0;
    const result = await WordTranslationCacheModel.bulkWrite(ops);
    return result.upsertedCount + result.modifiedCount;
  }

  async getTranslationCacheStats(worldId: string): Promise<{ totalWords: number; topWords: Array<{ word: string; lookupCount: number }> }> {
    await this.connect();
    const totalWords = await WordTranslationCacheModel.countDocuments({ worldId });
    const topWords = await WordTranslationCacheModel.find({ worldId })
      .sort({ lookupCount: -1 })
      .limit(20)
      .select({ sourceWord: 1, lookupCount: 1, _id: 0 })
      .lean();
    return {
      totalWords,
      topWords: topWords.map(w => ({ word: w.sourceWord, lookupCount: w.lookupCount })),
    };
  }

  // ── UI Translation Files ─────────────────────────────���────────────────

  async getUITranslationFile(worldId: string, languageCode: string): Promise<{ translations: Record<string, unknown>; version: number; generatedAt: Date } | null> {
    await this.connect();
    const doc = await UITranslationFileModel.findOne({ worldId, languageCode }).lean();
    if (!doc) return null;
    return {
      translations: doc.translations as Record<string, unknown>,
      version: doc.version as number,
      generatedAt: doc.generatedAt as Date,
    };
  }

  async upsertUITranslationFile(worldId: string, languageCode: string, targetLanguage: string, translations: Record<string, unknown>): Promise<void> {
    await this.connect();
    await UITranslationFileModel.updateOne(
      { worldId, languageCode },
      {
        $set: { translations, targetLanguage, updatedAt: new Date() },
        $inc: { version: 1 },
        $setOnInsert: { generatedAt: new Date() },
      },
      { upsert: true },
    );
  }

}
