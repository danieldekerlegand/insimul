/**
 * Unified Save File Schema
 *
 * A single document that contains everything needed to resume a game session.
 * Used identically for both the in-app game and the exported standalone game.
 *
 * Replaces the scattered playthrough, playthroughDelta, and
 * playthroughConversation collections with one self-contained file.
 *
 * - `worldSnapshot`: read-only template embedded at game start
 * - `currentState`: mutable game state, overwritten on each save
 * - `conversations`: compressed NPC conversation history
 * - `playtraces`: append-only research log (never deleted, never replayed)
 */

// ─── World Snapshot (embedded read-only template) ──────────────────────────

/** Minimal character snapshot for the save file */
export interface CharacterSnapshot {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthYear: number | null;
  isAlive: boolean;
  occupation: string | null;
  personality: {
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  } | null;
  spouseId: string | null;
  parentIds: string[] | null;
  childIds: string[] | null;
  currentLocation: string;
  appearance: Record<string, any> | null;
  socialAttributes: Record<string, any> | null;
}

/** Minimal lot/location snapshot */
export interface LotSnapshot {
  id: string;
  settlementId: string;
  address: string | null;
  houseNumber: number | null;
  streetName: string | null;
  streetId: string | null;
  blockCol: number | null;
  blockRow: number | null;
  lotIndex: number | null;
  lotType: string;
  districtName: string | null;
  side: string | null;
  building: {
    buildingCategory: 'business' | 'residence';
    name?: string;
    businessType?: string;
    ownerId?: string | null;
    residenceType?: string;
    residentIds?: string[];
    ownerIds?: string[];
    vacancies?: Record<string, any>;
    businessData?: Record<string, any>;
  } | null;
}

/** Minimal quest snapshot */
export interface QuestSnapshot {
  id: string;
  name: string;
  description: string | null;
  giverNpcId: string | null;
  status: string;
  stages: any[];
  rewards: any;
  storyText: string | null;
}

/** Minimal settlement snapshot */
export interface SettlementSnapshot {
  id: string;
  name: string;
  settlementType: string;
  streetPattern: string | null;
  population: number;
  countryId: string | null;
  streets: any[];
  districts: any[];
  landmarks: any[];
}

/** Minimal country snapshot */
export interface CountrySnapshot {
  id: string;
  name: string;
  governmentType: string | null;
  economicSystem: string | null;
}

/** The full world template, embedded in the save file at game start */
export interface WorldSnapshot {
  world: {
    id: string;
    name: string;
    worldType: string | null;
    gameType: string | null;
    targetLanguage: string | null;
    description: string | null;
  };
  countries: CountrySnapshot[];
  settlements: SettlementSnapshot[];
  characters: CharacterSnapshot[];
  lots: LotSnapshot[];
  quests: QuestSnapshot[];
  rules: any[];
  actions: any[];
  grammars: any[];
}

// ─── Current Game State (mutable, overwritten on save) ─────────────────────

export interface PlayerState {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  gold: number;
  health: number;
  energy: number;
  inventory: any[];
  cefrLevel: string | null;
  effectiveFluency: number | null;
}

export interface QuestState {
  /** Progress for template quests (keyed by quest ID) */
  progress: Record<string, {
    status: 'active' | 'completed' | 'failed';
    currentStageIndex: number;
    stageData: Record<string, any>;
    completedAt: string | null;
  }>;
  /** Quests dynamically created during gameplay (e.g. by NPC conversation) */
  dynamicQuests: QuestSnapshot[];
}

export interface NPCState {
  /** Relationship strength per NPC (keyed by character ID) */
  relationships: Record<string, {
    type: string;
    strength: number;
    trust?: number;
  }>;
  /** Romance state */
  romance: Record<string, any>;
  /** Merchant inventory overrides (keyed by lot/business ID) */
  merchantStates: Record<string, {
    goldReserve: number;
    items: any[];
  }>;
}

export interface ReputationState {
  /** Reputation per settlement (keyed by settlement ID) */
  settlements: Record<string, {
    standing: number;
    fines: number;
    title: string | null;
  }>;
}

export interface ContainerState {
  /** Modified container contents (keyed by container ID) */
  containers: Record<string, {
    items: any[];
  }>;
}

export interface LanguageProgressState {
  vocabulary: any[];
  grammarPatterns: any[];
  totalXP: number;
  level: number;
}

export interface CurrentGameState {
  player: PlayerState;
  quests: QuestState;
  npcs: NPCState;
  reputation: ReputationState;
  containers: ContainerState;
  languageProgress: LanguageProgressState;
  /** Prolog gameplay facts (canonical truth state) */
  prologFacts: Array<{ predicate: string; args: Array<string | number> }>;
  /** Time state (in-game clock) */
  timeState: {
    currentYear: number;
    currentMonth: number;
    currentDay: number;
    timeOfDay: string;
    ordinalDate: number;
  } | null;
  /** Interior scene state (which building the player is inside) */
  interiorState: any | null;
  /** Any additional subsystem state (skill tree, gamification, etc.) */
  extensions: Record<string, any>;
}

// ─── Compressed Conversations ──────────────────────────────────────────────

export interface ConversationSummary {
  npcCharacterId: string;
  npcCharacterName: string;
  /** Compressed summary of older messages (via conversation-compression.ts) */
  compressedHistory: string | null;
  /** Recent uncompressed turns (kept for LLM context continuation) */
  recentTurns: Array<{
    role: 'player' | 'npc';
    content: string;
    timestamp: string;
  }>;
  /** Total turns across all interactions with this NPC */
  totalTurnCount: number;
  /** Location of last interaction */
  lastLocationId: string | null;
  lastLocationName: string | null;
  /** Language learning metadata */
  wordsUsed: string[];
  newWordsLearned: string[];
  topics: string[];
}

// ─── Playtraces (append-only research log) ─────────────────────────────────

export interface PlaytraceEntry {
  /** ISO timestamp */
  timestamp: string;
  /** Action category */
  action: string;
  /** Human-readable description */
  description: string;
  /** Structured data about the action */
  details: Record<string, any>;
  /** For branching choices: which choice was made */
  choiceId?: string;
  /** For branching choices: which branch was taken */
  branchTarget?: string;
  /** For quest events: which quest */
  questId?: string;
  /** For NPC interactions: which NPC */
  npcId?: string;
  /** In-game timestep when this occurred */
  timestep?: number;
}

// ─── The Save File ─────────────────────────────────────────────────────────

export interface SaveFile {
  /** Unique save file ID */
  id: string;
  /** Save slot index (0-based, for multiple save slots) */
  slotIndex: number;
  /** User/player ID */
  userId: string;
  /** World ID this save belongs to */
  worldId: string;
  /** Display name for this save (e.g. "My Adventure" or auto-generated) */
  name: string;
  /** Save file format version (for migration) */
  version: number;
  /** Status of this playthrough */
  status: 'active' | 'completed' | 'abandoned';

  // ── Timing ──
  createdAt: string;
  lastSavedAt: string;
  /** Total play time in seconds */
  totalPlaytime: number;
  /** Number of saves */
  saveCount: number;

  // ── Embedded world template (read-only after creation) ──
  worldSnapshot: WorldSnapshot;

  // ── Mutable game state (overwritten on each save) ──
  currentState: CurrentGameState;

  // ── Compressed conversation history ──
  conversations: ConversationSummary[];

  // ── Append-only research log ──
  playtraces: PlaytraceEntry[];
}

/** Current save file format version */
export const SAVE_FILE_VERSION = 1;
