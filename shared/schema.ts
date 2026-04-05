import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, real, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============= TALK OF THE TOWN TYPE DEFINITIONS =============

// Occupation types (integrated from tott-types.ts)
export type OccupationVocation = 
  | 'Owner' | 'Manager' | 'Worker' | 'Doctor' | 'Lawyer' | 'Apprentice'
  | 'Secretary' | 'Cashier' | 'Janitor' | 'Builder' | 'HotelMaid' | 'Waiter'
  | 'Laborer' | 'Groundskeeper' | 'Bottler' | 'Cook' | 'Dishwasher' | 'Stocker'
  | 'Seamstress' | 'Farmhand' | 'Miner' | 'Painter' | 'BankTeller' | 'Grocer'
  | 'Bartender' | 'Concierge' | 'DaycareProvider' | 'Landlord' | 'Baker'
  | 'Plasterer' | 'Barber' | 'Butcher' | 'Firefighter' | 'PoliceOfficer'
  | 'Carpenter' | 'TaxiDriver' | 'BusDriver' | 'Blacksmith' | 'Woodworker'
  | 'Stonecutter' | 'Dressmaker' | 'Distiller' | 'Plumber' | 'Joiner'
  | 'Innkeeper' | 'Nurse' | 'Farmer' | 'Shoemaker' | 'Brewer' | 'TattooArtist'
  | 'Puddler' | 'Clothier' | 'Teacher' | 'Principal' | 'Tailor' | 'Druggist'
  | 'InsuranceAgent' | 'Jeweler' | 'FireChief' | 'PoliceChief' | 'Realtor'
  | 'Mortician' | 'Engineer' | 'Pharmacist' | 'Architect' | 'Optometrist'
  | 'Dentist' | 'PlasticSurgeon' | 'Professor' | 'Mayor';

export type BusinessType =
  | 'Generic' | 'LawFirm' | 'ApartmentComplex' | 'Bakery' | 'Hospital' | 'Bank'
  | 'Hotel' | 'Restaurant' | 'GroceryStore' | 'Bar' | 'Daycare' | 'School'
  | 'PoliceStation' | 'FireStation' | 'TownHall' | 'Church' | 'Farm' | 'Factory'
  | 'Shop' | 'Mortuary' | 'RealEstateOffice' | 'InsuranceOffice' | 'JewelryStore'
  | 'TattoParlor' | 'Brewery' | 'Pharmacy' | 'DentalOffice' | 'OptometryOffice'
  | 'University'
  | 'Harbor' | 'Boatyard' | 'FishMarket' | 'CustomsHouse' | 'Lighthouse'
  | 'Warehouse'
  | 'Blacksmith' | 'Tailor' | 'Butcher' | 'BookStore' | 'HerbShop' | 'PawnShop'
  | 'Barbershop' | 'Bathhouse' | 'Carpenter' | 'Stables' | 'Clinic'
  | 'GuildMarchands' | 'GuildArtisans' | 'GuildConteurs' | 'GuildExplorateurs' | 'GuildDiplomates';

export type ShiftType = 'day' | 'night';

export type TerminationReason = 
  | 'retirement' | 'firing' | 'quit' | 'death' | 'business_closure' | 'promotion' | 'relocation';

export type EventType = 
  | 'birth' | 'death' | 'marriage' | 'divorce' | 'move' | 'departure'
  | 'hiring' | 'retirement' | 'home_purchase' | 'business_founding' | 'business_closure'
  | 'promotion' | 'graduation' | 'accident' | 'crime' | 'festival' | 'election';

export type TimeOfDay = 'day' | 'night';

export type ActivityOccasion = 
  | 'working' | 'relaxing' | 'studying' | 'shopping' | 'socializing'
  | 'sleeping' | 'eating' | 'exercising' | 'commuting';

export type LocationType = 'home' | 'work' | 'leisure' | 'school';

export type BuildingType = 'residence' | 'business' | 'public' | 'vacant';

export type PublicBuildingType =
  | 'School' | 'CityHall' | 'Library' | 'PostOffice';

export type ResidenceType =
  | 'house' | 'apartment' | 'mansion' | 'cottage' | 'townhouse' | 'mobile_home';

export type PersonalityStrength = 
  | 'very_high' | 'high' | 'somewhat_high' | 'neutral'
  | 'somewhat_low' | 'low' | 'very_low';

// Personality and character types
export interface BigFivePersonality {
  openness: number; // -1 to 1
  conscientiousness: number; // -1 to 1
  extroversion: number; // -1 to 1
  agreeableness: number; // -1 to 1
  neuroticism: number; // -1 to 1
}

export interface DerivedTraits {
  gregarious: boolean; // E > 0.4 && A > 0.4 && N < -0.2
  cold: boolean; // E < -0.4 && A < 0 && C > 0.4
  creative: boolean; // O > 0.5
  organized: boolean; // C > 0.5
  anxious: boolean; // N > 0.5
  friendly: boolean; // A > 0.5 && E > 0
}

// Business and occupation structures
export interface BusinessVacancy {
  occupation: OccupationVocation;
  shift: ShiftType;
  isSupplemental: boolean;
}

export interface ApartmentUnit {
  unitNumber: number;
  residentIds: string[];
  rentAmount: number;
  isVacant: boolean;
}

// Mental models and cognition
export interface MentalModel {
  characterId: string;
  beliefs: Record<string, any>;
  lastUpdated: number;
  confidence: number; // 0.0 - 1.0
}

export interface Thought {
  content: string;
  timestep: number;
  emotion?: string;
  related_to?: string[];
}

// Helper functions for TotT
export function getPersonalityStrength(value: number): PersonalityStrength {
  if (value > 0.7) return 'very_high';
  if (value > 0.4) return 'high';
  if (value > 0.1) return 'somewhat_high';
  if (value > -0.1) return 'neutral';
  if (value > -0.4) return 'somewhat_low';
  if (value > -0.7) return 'low';
  return 'very_low';
}

export function calculateDerivedTraits(personality: BigFivePersonality): DerivedTraits {
  return {
    gregarious: personality.extroversion > 0.4 && 
                personality.agreeableness > 0.4 && 
                personality.neuroticism < -0.2,
    cold: personality.extroversion < -0.4 && 
          personality.agreeableness < 0 && 
          personality.conscientiousness > 0.4,
    creative: personality.openness > 0.5,
    organized: personality.conscientiousness > 0.5,
    anxious: personality.neuroticism > 0.5,
    friendly: personality.agreeableness > 0.5 && personality.extroversion > 0
  };
}

// ============= END TOTT TYPE DEFINITIONS =============

// Rules - single rule entities (can be base rules or world-specific)
// All rules are stored in Insimul format internally for execution
export const rules = pgTable("rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id"), // Nullable for base rules
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull(), // Prolog content — single source of truth

  // Base rule indicator
  isBase: boolean("is_base").default(false), // true for global rules, false for world-specific

  // Original import format (for backward translation to Ensemble/Kismet/TotT)
  sourceFormat: text("source_format").notNull().default("prolog"),

  // Denormalized from Prolog content for query performance
  ruleType: text("rule_type").notNull(), // trigger, volition, trait, default, pattern
  category: text("category"), // psychological, physical, social, economic, etc.
  priority: integer("priority").default(5),
  likelihood: real("likelihood").default(1.0),
  tags: jsonb("tags").$type<string[]>().default([]),
  relatedTruthIds: jsonb("related_truth_ids").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Grammars - Tracery grammar templates for narrative generation
export const grammars = pgTable("grammars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  name: text("name").notNull().unique(), // e.g., "succession_ceremony"
  description: text("description"),
  grammar: jsonb("grammar").$type<Record<string, string | string[]>>().notNull(), // Tracery grammar object
  tags: jsonb("tags").$type<string[]>().default([]),
  worldType: text("world_type"), // e.g., "cyberpunk", "medieval-fantasy", "custom_pirate_world"
  gameType: text("game_type"), // e.g., "rpg", "language-learning", "simulation"

  // Truth bindings — map Tracery placeholders to Prolog truth queries
  truthBindings: jsonb("truth_bindings").$type<Array<{
    placeholder: string;
    truthQuery: string;
  }>>().default([]),

  // Context type — categorizes grammar usage
  contextType: text("context_type"), // narrative, dialogue, history, item_description, quest_description, ambient

  relatedTruthIds: jsonb("related_truth_ids").$type<string[]>().default([]),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced characters with full TotT-style attributes
export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  suffix: text("suffix"),
  maidenName: text("maiden_name"),
  birthYear: integer("birth_year"),
  isAlive: boolean("is_alive").default(true),
  gender: text("gender").notNull(), // male, female, other
  
  // Physical and mental attributes
  personality: jsonb("personality").$type<{
    openness: number;
    conscientiousness: number;
    extroversion: number;
    agreeableness: number;
    neuroticism: number;
  }>().default({ openness: 0, conscientiousness: 0, extroversion: 0, agreeableness: 0, neuroticism: 0 }),
  physicalTraits: jsonb("physical_traits").$type<Record<string, any>>().default({}),
  mentalTraits: jsonb("mental_traits").$type<Record<string, any>>().default({}),
  skills: jsonb("skills").$type<Record<string, number>>().default({}),
  
  // Mind and cognition (TotT)
  memory: real("memory").default(0.5), // 0.0-1.0 scale
  mentalModels: jsonb("mental_models").$type<Record<string, any>>().default({}), // belief about others
  thoughts: jsonb("thoughts").$type<any[]>().default([]), // thought history
  
  // Social relationships and affiliations
  relationships: jsonb("relationships").$type<Record<string, any>>().default({}),
  socialAttributes: jsonb("social_attributes").$type<Record<string, any>>().default({}),
  
  // Detailed relationship tracking (TotT)
  coworkerIds: jsonb("coworker_ids").$type<string[]>().default([]),
  friendIds: jsonb("friend_ids").$type<string[]>().default([]),
  neighborIds: jsonb("neighbor_ids").$type<string[]>().default([]),
  immediateFamilyIds: jsonb("immediate_family_ids").$type<string[]>().default([]),
  extendedFamilyIds: jsonb("extended_family_ids").$type<string[]>().default([]),
  parentIds: jsonb("parent_ids").$type<string[]>().default([]),
  childIds: jsonb("child_ids").$type<string[]>().default([]),
  spouseId: varchar("spouse_id"),
  genealogyData: jsonb("genealogy_data").$type<Record<string, any>>().default({}),
  
  // Generation metadata
  generationMethod: text("generation_method"), // manual, ensemble, kismet, tott, insimul
  generationConfig: jsonb("generation_config").$type<Record<string, any>>().default({}),
  
  // Current state
  currentLocation: text("current_location").notNull(), // Characters must always be associated with a location
  occupation: text("occupation"),
  status: text("status").default("active"), // active, inactive, deceased
  
  // TotT-specific fields
  currentOccupationId: varchar("current_occupation_id"), // FK to occupations table
  currentResidenceId: varchar("current_residence_id"), // FK to residences table
  collegeGraduate: boolean("college_graduate").default(false),
  retired: boolean("retired").default(false),
  departureYear: integer("departure_year"), // year they left the city
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced worlds with procedural generation capabilities (now primary container)
// A world is an abstract universe/reality that can contain multiple countries, states, and settlements
// All worlds execute using Insimul engine; rules/actions can be authored in different formats
export const worlds = pgTable("worlds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  targetLanguage: text("target_language"), // @deprecated — use WorldLanguage.isLearningTarget instead
  worldType: text("world_type"), // medieval-fantasy, cyberpunk, sci-fi-space, etc.
  gameType: text("game_type"), // rpg, action, language-learning, simulation, etc.

  // Ownership and permissions
  ownerId: varchar("owner_id"), // User who owns/created this world (nullable for legacy/system worlds)
  visibility: text("visibility").default("private"), // private, unlisted, public
  isTemplate: boolean("is_template").default(false), // Allow others to clone this world

  // Access control
  allowedUserIds: jsonb("allowed_user_ids").$type<string[]>().default([]), // Users with explicit access
  maxPlayers: integer("max_players"), // Optional player limit
  requiresAuth: boolean("requires_auth").default(false), // Require authentication to play

  // Asset collection reference
  selectedAssetCollectionId: varchar("selected_asset_collection_id"), // Reference to the asset collection this world uses

  // Camera perspective: first_person, third_person, isometric, side_scroll, top_down, fighting
  cameraPerspective: text("camera_perspective"),

  // Timestep configuration
  timestepUnit: text("timestep_unit").default("year"), // year, day, hour, minute, custom
  gameplayTimestepUnit: text("gameplay_timestep_unit").default("day"), // separate unit for gameplay
  customTimestepLabel: text("custom_timestep_label"), // label for custom timestep units
  customTimestepDurationMs: integer("custom_timestep_duration_ms"), // duration in ms for custom units
  historyStartYear: integer("history_start_year"), // e.g., 1839 — start of historical simulation
  historyEndYear: integer("history_end_year"), // e.g., 1979 — end of historical simulation / start of gameplay
  currentGameYear: integer("current_game_year"), // derived from historyEndYear + gameplay timesteps

  // Feature modules — list of enabled module IDs (e.g., ['knowledge-acquisition', 'proficiency'])
  // When null/empty, modules are inferred from the genre bundle defaults
  enabledModules: jsonb("enabled_modules").$type<string[]>().default([]),

  // Grid dimensions — creator-defined grid (each cell = 1600 game units)
  gridWidth: integer("grid_width"),   // Number of grid columns
  gridHeight: integer("grid_height"), // Number of grid rows

  // Geographic dimensions — derived from grid (gridWidth × 1600, gridHeight × 1600)
  mapWidth: integer("map_width"),   // X extent of the world
  mapDepth: integer("map_depth"),   // Z extent of the world
  mapCenter: jsonb("map_center").$type<{ x: number; z: number }>().default({ x: 0, z: 0 }),

  // Configuration
  config: jsonb("config").$type<Record<string, any>>().default({}),

  // Generation settings (includes worldScale: 'compact' | 'standard' | 'expansive' or explicit overrides)
  generationConfig: jsonb("generation_config").$type<Record<string, any>>().default({}),

  // Character creation mode
  characterCreationMode: text("character_creation_mode").default("fixed"), // 'fixed' | 'archetype_select' | 'custom_create'

  // Version tracking for playthroughs
  version: integer("version").default(1), // Increment when world structure changes

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Character Templates — store starting truths for character creation
export const characterTemplates = pgTable("character_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id"), // nullable for base templates
  name: text("name").notNull(),
  description: text("description"),
  startingTruths: jsonb("starting_truths").$type<Array<{ predicate: string; args: any[] }>>().default([]),
  isDefault: boolean("is_default").default(false),
  isBase: boolean("is_base").default(false), // true for global base templates, false for world-specific
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game Instances - multiple playthroughs per world with different module sets
// A game instance shares the world's data (NPCs, locations, items, etc.)
// but has its own enabled modules, player progress, and game state.
export const gameInstances = pgTable("game_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),

  // Owner / creator of this game instance
  ownerId: varchar("owner_id"),

  // Game type override (can differ from world's gameType)
  gameType: text("game_type"),

  // Feature modules enabled for this instance (overrides world-level modules)
  enabledModules: jsonb("enabled_modules").$type<string[]>().default([]),

  // Instance-specific configuration
  config: jsonb("config").$type<Record<string, any>>().default({}),

  // Status
  status: text("status").default("active"), // active, paused, completed, archived

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Countries - nation-states within a world
export const countries = pgTable("countries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Government and economy
  governmentType: text("government_type"), // monarchy, republic, democracy, feudal, theocracy, empire
  economicSystem: text("economic_system"), // feudal, mercantile, agricultural, trade-based, craft-guilds, mixed
  socialStructure: jsonb("social_structure").$type<Record<string, any>>().default({}), // class system, nobility tiers, etc.
  
  // Country characteristics
  foundedYear: integer("founded_year"),
  culture: jsonb("culture").$type<Record<string, any>>().default({}),
  culturalValues: jsonb("cultural_values").$type<Record<string, any>>().default({}),
  laws: jsonb("laws").$type<any[]>().default([]),
  
  // Grid placement — rectangular region on the world grid
  gridWidth: integer("grid_width"),   // Country width in world-grid cells
  gridHeight: integer("grid_height"), // Country height in world-grid cells
  gridX: integer("grid_x"),           // Left column on the world grid
  gridY: integer("grid_y"),           // Top row on the world grid

  // Geographic position and territory — derived from grid placement
  position: jsonb("position").$type<{ x: number; z: number }>(),          // Center in world coordinates
  territoryPolygon: jsonb("territory_polygon").$type<{ x: number; z: number }[]>(), // Non-overlapping boundary
  territoryRadius: integer("territory_radius"),                             // Approximate radius for quick checks

  // Relationships with other countries
  alliances: jsonb("alliances").$type<string[]>().default([]), // IDs of allied countries
  enemies: jsonb("enemies").$type<string[]>().default([]), // IDs of enemy countries

  // Status
  isActive: boolean("is_active").default(true),
  dissolvedYear: integer("dissolved_year"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// States - regions within a country (provinces, states, territories)
export const states = pgTable("states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  countryId: varchar("country_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  
  // State characteristics
  stateType: text("state_type").default("province"), // province, state, territory, region, duchy, county
  foundedYear: integer("founded_year"),
  
  // Governance
  governorId: varchar("governor_id"), // Character ID of the governor/ruler
  localGovernmentType: text("local_government_type"),
  
  // Geographic position and boundary within parent country
  position: jsonb("position").$type<{ x: number; z: number }>(),           // Center in world coordinates
  boundaryPolygon: jsonb("boundary_polygon").$type<{ x: number; z: number }[]>(), // Territory within country

  // History tracking (for wars, annexations, etc.)
  previousCountryIds: jsonb("previous_country_ids").$type<string[]>().default([]),
  annexationHistory: jsonb("annexation_history").$type<any[]>().default([]),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settlements - cities, towns, and villages within a state or country
export const settlements = pgTable("settlements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  countryId: varchar("country_id"), // Can be directly in a country
  stateId: varchar("state_id"), // Or within a state
  
  name: text("name").notNull(),
  description: text("description"),
  
  // Settlement type and characteristics
  settlementType: text("settlement_type").notNull(), // city, town, village
  streetPattern: text("street_pattern"), // grid, organic, linear, waterfront, hillside, radial
  
  // Demographics and founding
  population: integer("population").default(0),
  foundedYear: integer("founded_year"),
  founderIds: jsonb("founder_ids").$type<string[]>().default([]),
  currentGeneration: integer("current_generation").default(0),
  maxGenerations: integer("max_generations").default(10),
  
  // Governance
  mayorId: varchar("mayor_id"), // Character ID of mayor/leader
  localGovernmentType: text("local_government_type"),
  
  // Geography (stored as JSONB for flexibility)
  districts: jsonb("districts").$type<any[]>().default([]),
  streets: jsonb("streets").$type<any[]>().default([]),
  landmarks: jsonb("landmarks").$type<any[]>().default([]),
  
  // Social and economic data
  socialStructure: jsonb("social_structure").$type<Record<string, any>>().default({}),
  economicData: jsonb("economic_data").$type<Record<string, any>>().default({}),
  
  
  // TotT-specific tracking
  unemployedCharacterIds: jsonb("unemployed_character_ids").$type<string[]>().default([]),
  vacantLotIds: jsonb("vacant_lot_ids").$type<string[]>().default([]),
  departedCharacterIds: jsonb("departed_character_ids").$type<string[]>().default([]),
  deceasedCharacterIds: jsonb("deceased_character_ids").$type<string[]>().default([]),
  
  // History tracking (for wars, annexations, etc.)
  previousCountryIds: jsonb("previous_country_ids").$type<string[]>().default([]),
  previousStateIds: jsonb("previous_state_ids").$type<string[]>().default([]),
  annexationHistory: jsonb("annexation_history").$type<any[]>().default([]),
  
  // Grid placement — position within the country's internal grid
  countryGridX: integer("country_grid_x"),  // Column in country grid
  countryGridY: integer("country_grid_y"),  // Row in country grid

  // World-space position — derived from country position + grid cell
  worldPositionX: real("world_position_x"),
  worldPositionZ: real("world_position_z"),

  // Generation config specific to this settlement
  generationConfig: jsonb("generation_config").$type<Record<string, any>>().default({}),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settlement history events - tracks changes to settlements over simulation time
export const settlementHistoryEvents = pgTable("settlement_history_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  settlementId: varchar("settlement_id").notNull(),

  // Event classification
  eventType: text("event_type").notNull(), // population_change, mayor_change, type_change, founding, annexation, infrastructure, economic_shift, district_added, landmark_added
  category: text("category").notNull(), // demographic, governance, geographic, economic, political

  // Temporal data
  year: integer("year"),
  timestep: integer("timestep"),

  // Change data
  description: text("description").notNull(),
  previousValue: jsonb("previous_value").$type<Record<string, any>>(),
  newValue: jsonb("new_value").$type<Record<string, any>>(),

  // Metadata
  significance: text("significance").default("minor"), // minor, moderate, major, critical
  relatedCharacterIds: jsonb("related_character_ids").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),

  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSettlementHistoryEventSchema = createInsertSchema(settlementHistoryEvents).omit({
  id: true,
  createdAt: true,
});

// Terrain features - mountains, valleys, canyons, etc.
export const terrainFeatures = pgTable("terrain_features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  name: text("name").notNull(),
  featureType: text("feature_type").notNull(), // mountain, hill, valley, canyon, cliff, mesa, plateau, crater, ridge, pass
  position: jsonb("position").$type<{ x: number; y: number; z: number }>().notNull(),
  radius: integer("radius").notNull(),
  elevation: integer("elevation").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTerrainFeatureSchema = createInsertSchema(terrainFeatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Enhanced simulations - all execute using Insimul engine
export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Simulation configuration
  config: jsonb("config").$type<Record<string, any>>().default({}),
  
  // Execution parameters
  startTime: integer("start_time").default(0),
  endTime: integer("end_time"),
  currentTime: integer("current_time").default(0),
  timeStep: integer("time_step").default(1),
  
  // Results and state
  results: jsonb("results").$type<Record<string, any>>().default({}),
  socialRecord: jsonb("social_record").$type<any[]>().default([]), // Track social interactions
  narrativeOutput: jsonb("narrative_output").$type<string[]>().default([]),
  
  // Execution status
  status: text("status").default("pending"), // pending, running, completed, failed, paused
  progress: real("progress").default(0.0),
  errorLog: jsonb("error_log").$type<string[]>().default([]),
  
  // Performance metrics
  executionTime: real("execution_time"),
  rulesExecuted: integer("rules_executed").default(0),
  eventsGenerated: integer("events_generated").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Actions table - stores discrete actions (can be base actions or world-specific)
// Action logic is stored as Prolog content; denormalized columns kept for queries
export const actions = pgTable("actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id"), // Nullable for base actions
  name: text("name").notNull(),
  description: text("description"),

  // Prolog content — single source of truth for action logic
  content: text("content"),

  // Base action indicator
  isBase: boolean("is_base").default(false), // true for global actions, false for world-specific

  // Authoring format (for display/editing only, not execution)
  sourceFormat: text("source_format").notNull().default("prolog"),

  // Action hierarchy
  parentAction: text("parent_action"), // parent action name for hierarchy (e.g., sword_attack → attack_enemy)

  // Denormalized columns (derived from Prolog content, kept for DB queries)
  actionType: text("action_type").notNull(), // social, physical, mental, economic, etc.
  category: text("category"), // unified: movement, combat, social, commerce, resource, items, exploration, language, survival
  duration: integer("duration").default(1), // time steps to complete
  difficulty: real("difficulty").default(0.5), // 0.0 to 1.0
  energyCost: integer("energy_cost").default(1),
  targetType: text("target_type"), // self, other, location, object, none
  requiresTarget: boolean("requires_target").default(false),
  range: integer("range").default(0), // 0 for same location
  isAvailable: boolean("is_available").default(true),
  cooldown: integer("cooldown").default(0), // time steps before can use again

  // Narrative and presentation
  verbPast: text("verb_past"), // e.g., "talked", "fought"
  verbPresent: text("verb_present"), // e.g., "talks", "fights"
  narrativeTemplates: jsonb("narrative_templates").$type<string[]>().default([]),

  // Custom data for extensibility
  customData: jsonb("custom_data").$type<Record<string, any>>().default({}),

  // Tags and metadata
  tags: jsonb("tags").$type<string[]>().default([]),
  relatedTruthIds: jsonb("related_truth_ids").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Truths - stores past, present, and future truths about the world and characters
export const truths = pgTable("truths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  playthroughId: varchar("playthrough_id"), // null for base/world truths, set for gameplay-generated truths
  characterId: varchar("character_id"), // null for world-level truth

  // Entry metadata
  title: text("title").notNull(),
  content: text("content").notNull(),
  entryType: text("entry_type").notNull(), // event, backstory, relationship, achievement, milestone, prophecy, plan, history

  // Temporal information (generic timestep-based)
  timestep: integer("timestep").notNull().default(0), // Generic time unit, can be compared for past/present/future
  timestepDuration: integer("timestep_duration").default(1), // How many timesteps this truth spans
  timeYear: integer("time_year"), // Optional: year in world timeline for display
  timeSeason: text("time_season"), // Optional: spring, summer, fall, winter
  timeDescription: text("time_description"), // Optional: "In the third year of King Edmund's reign"

  // Historical context
  historicalEra: text("historical_era"), // e.g., "founding", "civil_war", "industrial", "modern" — for grouping
  historicalSignificance: text("historical_significance"), // world, country, state, settlement, family, personal — scope of impact

  // Causal chains between historical events
  causesTruthIds: jsonb("causes_truth_ids").$type<string[]>().default([]), // truths this event causes
  causedByTruthIds: jsonb("caused_by_truth_ids").$type<string[]>().default([]), // truths that caused this event

  // Related entities
  relatedCharacterIds: jsonb("related_character_ids").$type<string[]>().default([]),
  relatedLocationIds: jsonb("related_location_ids").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),

  // Importance and visibility
  importance: integer("importance").default(5), // 1-10, affects visibility
  isPublic: boolean("is_public").default(true), // false for character secrets

  // Source tracking
  source: text("source"), // "imported_ensemble", "user_created", "simulation_generated"
  sourceData: jsonb("source_data").$type<Record<string, any>>().default({}),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quests - stores language learning quests assigned to players
export const quests = pgTable("quests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  
  // Quest participants (Ensemble-style predicates)
  assignedTo: text("assigned_to").notNull(), // Player character name (first)
  assignedBy: text("assigned_by"), // NPC character name (second)
  assignedToCharacterId: varchar("assigned_to_character_id"), // Player character ID
  assignedByCharacterId: varchar("assigned_by_character_id"), // NPC character ID
  
  // Quest details
  title: text("title").notNull(),
  description: text("description").notNull(),

  // Translation fields — English equivalents for bilingual quest display
  titleTranslation: text("title_translation"), // English translation of title (when title is in target language)
  descriptionTranslation: text("description_translation"), // English translation of description
  objectivesTranslation: jsonb("objectives_translation").$type<string[]>(), // English translations of objective strings

  questType: text("quest_type").notNull(), // conversation, translation, vocabulary, grammar, cultural
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  cefrLevel: text("cefr_level"), // A1, A2, B1, B2 — CEFR alignment
  difficultyStars: integer("difficulty_stars"), // 1–5 star rating
  estimatedMinutes: integer("estimated_minutes"), // Estimated completion time
  targetLanguage: text("target_language").notNull(), // French, English

  // Game type and quest chains (for abstraction)
  gameType: varchar("game_type", { length: 100 }).default("language-learning"), // language-learning, rpg, strategy, adventure, survival
  questChainId: varchar("quest_chain_id", { length: 255 }),
  questChainOrder: integer("quest_chain_order"),
  prerequisiteQuestIds: text("prerequisite_quest_ids").array(),

  // Guild system — organizes quests into language-learning skill trees
  guildId: varchar("guild_id", { length: 100 }), // marchands, artisans, conteurs, explorateurs, diplomates
  guildTier: integer("guild_tier"), // 0=join, 1=starter, 2=intermediate, 3=advanced
  
  // Quest objectives and progress
  objectives: jsonb("objectives").$type<any[]>().default([]),
  progress: jsonb("progress").$type<Record<string, any>>().default({}),
  
  // Quest status
  status: text("status").default("unavailable"), // unavailable, available, active, completed, failed, abandoned
  completionCriteria: jsonb("completion_criteria").$type<Record<string, any>>().default({}),
  
  // Rewards and XP
  experienceReward: integer("experience_reward").default(0),
  moneyReward: integer("money_reward").default(0),
  rewards: jsonb("rewards").$type<Record<string, any>>().default({}),

  // Enhanced rewards (for non-language-learning games)
  itemRewards: jsonb("item_rewards").$type<Array<{ itemId: string; quantity: number; name: string }>>(),
  skillRewards: jsonb("skill_rewards").$type<Array<{ skillId: string; name: string; level: number }>>(),
  unlocks: jsonb("unlocks").$type<Array<{ type: 'area' | 'npc' | 'feature' | 'vocabulary_category'; id: string; name: string }>>(),

  // Multi-stage quests
  stages: jsonb("stages").$type<Array<{
    stageId: string;
    title: string;
    description: string;
    objectives: any[];
    preconditions?: string[];
    postconditions?: string[];
    nextStageIds?: string[];
  }>>(),
  currentStageId: varchar("current_stage_id", { length: 255 }),
  parentQuestId: varchar("parent_quest_id", { length: 255 }),

  // Failure conditions
  failureConditions: jsonb("failure_conditions").$type<Record<string, any>>(),

  // Abandonment, failure, and retry tracking
  attemptCount: integer("attempt_count").default(1),
  maxAttempts: integer("max_attempts").default(3),
  abandonedAt: timestamp("abandoned_at"),
  failedAt: timestamp("failed_at"),
  failureReason: text("failure_reason"),
  abandonReason: text("abandon_reason"),

  // Location binding — ties the quest to a specific place in the world
  locationId: varchar("location_id"), // Settlement or lot ID
  locationName: text("location_name"), // Human-readable place name
  locationPosition: jsonb("location_position").$type<{ x: number; y: number; z: number }>(), // World-space coordinates

  // Recurrence — daily/weekly/monthly repeating quests
  recurrencePattern: text("recurrence_pattern"), // daily, weekly, monthly (null = one-time)
  recurrenceResetAt: timestamp("recurrence_reset_at"), // next reset time (UTC)
  completionCount: integer("completion_count").default(0), // total times completed
  lastCompletedAt: timestamp("last_completed_at"), // when last completed (for reset logic)
  sourceQuestId: varchar("source_quest_id"), // for recurring instances, points to template quest
  streakCount: integer("streak_count").default(0), // consecutive completion streak

  // Timing
  assignedAt: timestamp("assigned_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  
  // Conversation-only mode — quest completable entirely through NPC dialogue
  conversationOnly: boolean("conversation_only").default(false),

  // Metadata
  conversationContext: text("conversation_context"), // Context from the conversation that triggered the quest
  tags: jsonb("tags").$type<string[]>().default([]),

  // Main quest chapter this quest belongs to (e.g. 'ch1_assignment_abroad')
  narrativeChapterId: text("narrative_chapter_id"),

  // Prolog content — single source of truth for quest logic
  content: text("quest_content"),

  relatedTruthIds: jsonb("related_truth_ids").$type<string[]>().default([]),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Items - first-class item definitions for worlds
export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id"), // null = base template item

  // Item identity
  name: text("name").notNull(),
  description: text("description"),
  itemType: text("item_type").notNull(), // quest, collectible, key, consumable, weapon, armor, food, drink, material, tool
  icon: text("icon"), // emoji or icon identifier

  // Economics
  value: integer("value").default(0), // base purchase value
  sellValue: integer("sell_value").default(0),
  weight: real("weight").default(1),
  tradeable: boolean("tradeable").default(true),
  stackable: boolean("stackable").default(true),
  maxStack: integer("max_stack").default(99),

  // World type (for base templates)
  worldType: text("world_type"), // medieval-fantasy, cyberpunk, sci-fi-space, etc.
  objectRole: text("object_role"), // maps to asset collection objectModels key
  visualAssetId: text("visual_asset_id"), // direct reference to visual asset ID

  // Taxonomy
  category: text("category"), // broad grouping: melee_weapon, ranged_weapon, light_armor, heavy_armor, potion, ingredient, building_material, etc.
  material: text("material"), // primary material: iron, steel, wood, leather, glass, etc. (null = not material-specific)
  baseType: text("base_type"), // generic archetype: sword, bow, shield, potion, ore, etc. (for IS-A reasoning)
  rarity: text("rarity").default("common"), // common, uncommon, rare, epic, legendary

  // Gameplay
  effects: jsonb("effects").$type<Record<string, number>>(), // { health: 20, energy: 10 }
  lootWeight: integer("loot_weight").default(0), // drop probability weight, 0 = not lootable
  tags: jsonb("tags").$type<string[]>().default([]),
  isBase: boolean("is_base").default(false), // true for global template items
  possessable: boolean("possessable").default(true), // whether the player can pick up / carry this item

  // Extensibility
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),

  // Crafting recipe (if this item can be crafted)
  craftingRecipe: jsonb("crafting_recipe").$type<{
    ingredients: Array<{ itemId: string; quantity: number }>;
    craftTime: number;
    requiredLevel: number;
    requiredStation?: string;
  }>(),

  // Quest relevance (auto-populated from quest definitions)
  questRelevance: jsonb("quest_relevance").$type<Array<{
    questId: string;
    role: 'objective' | 'reward' | 'tool' | 'key';
  }>>().default([]),

  // In-game lore text (separate from editor description)
  loreText: text("lore_text"),

  // Translations keyed by language (e.g. { French: { targetWord: "Épée", pronunciation: "ay-PAY", category: "weapon" } })
  translations: jsonb("translations").$type<Record<string, {
    targetWord: string;
    pronunciation: string;
    category: string;
  }>>(),

  relatedTruthIds: jsonb("related_truth_ids").$type<string[]>().default([]),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= TALK OF THE TOWN INTEGRATION TABLES =============

// Occupations - tracks character employment history and current jobs
export const occupations = pgTable("occupations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  characterId: varchar("character_id").notNull(),
  businessId: varchar("business_id").notNull(),
  
  // Occupation details
  vocation: text("vocation").notNull(), // Doctor, Lawyer, Worker, etc.
  level: integer("level").default(1), // 1-5 hierarchy
  shift: text("shift").notNull(), // day, night
  
  // Time tracking
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  yearsExperience: integer("years_experience").default(0),
  
  // Termination details
  terminationReason: text("termination_reason"), // retirement, firing, quit, death
  
  // Succession tracking
  predecessorId: varchar("predecessor_id"), // who had this job before
  successorId: varchar("successor_id"), // who took over this job
  
  // Special flags
  isSupplemental: boolean("is_supplemental").default(false),
  hiredAsFavor: boolean("hired_as_favor").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Businesses - companies and organizations that employ characters
export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  settlementId: varchar("settlement_id").notNull(), // Businesses belong to settlements
  
  // Business details
  name: text("name").notNull(),
  businessType: text("business_type").notNull(), // LawFirm, ApartmentComplex, Bakery, etc.
  
  // Ownership
  ownerId: varchar("owner_id").notNull(), // current owner's character ID
  founderId: varchar("founder_id").notNull(), // original founder's character ID
  
  // Status
  isOutOfBusiness: boolean("is_out_of_business").default(false),
  foundedYear: integer("founded_year").notNull(),
  closedYear: integer("closed_year"),
  
  // Location (reference to lot)
  lotId: varchar("lot_id"),
  
  // Vacancies (structured storage for job openings)
  vacancies: jsonb("vacancies").$type<{ day: string[], night: string[] }>().default({ day: [], night: [] }),
  
  // Business-specific data
  businessData: jsonb("business_data").$type<Record<string, any>>().default({}), // For ApartmentComplex units, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lots - land parcels with addresses and buildings
export const lots = pgTable("lots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  settlementId: varchar("settlement_id").notNull(), // Lots belong to settlements
  
  // Address
  address: text("address").notNull(),
  houseNumber: integer("house_number").notNull(),
  streetName: text("street_name").notNull(),
  block: text("block"),
  districtName: text("district_name"), // Which district/neighborhood
  
  // Building on the lot
  buildingId: varchar("building_id"), // Can be residence or business ID
  buildingType: text("building_type"), // residence, business, vacant
  
  // Position coordinates (world-space)
  positionX: real("position_x"),
  positionZ: real("position_z"),
  facingAngle: real("facing_angle").default(0),
  elevation: real("elevation").default(0),

  // Lot geometry & street alignment
  lotWidth: integer("lot_width").default(12),
  lotDepth: integer("lot_depth").default(24),
  streetEdgeId: text("street_edge_id"),
  distanceAlongStreet: integer("distance_along_street").default(0),
  side: text("side").default("left"), // left or right of street
  blockId: text("block_id"),
  foundationType: text("foundation_type").default("flat"), // flat, raised, stilted, terraced

  // Spatial relationships
  neighboringLotIds: jsonb("neighboring_lot_ids").$type<string[]>().default([]),
  distanceFromDowntown: integer("distance_from_downtown").default(0),
  
  // History
  formerBuildingIds: jsonb("former_building_ids").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Residences - homes where characters live
export const residences = pgTable("residences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  settlementId: varchar("settlement_id").notNull(), // Residences belong to settlements
  lotId: varchar("lot_id").notNull(),
  
  // Ownership and occupancy
  ownerIds: jsonb("owner_ids").$type<string[]>().default([]), // Can have multiple owners
  residentIds: jsonb("resident_ids").$type<string[]>().default([]), // Who lives here
  
  // Address (inherited from lot but stored for convenience)
  address: text("address").notNull(),
  
  // Residence type
  residenceType: text("residence_type").default("house"), // house, apartment, mansion, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Public Buildings - civic/government structures
export const publicBuildings = pgTable("public_buildings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  settlementId: varchar("settlement_id").notNull(),
  lotId: varchar("lot_id").notNull(),

  name: text("name").notNull(),
  publicBuildingType: text("public_building_type").notNull(), // School, CityHall, Library, PostOffice
  address: text("address").notNull(),

  // Operational details
  foundedYear: integer("founded_year"),
  isOperational: boolean("is_operational").default(true),
  capacity: integer("capacity"), // max occupants
  employeeIds: jsonb("employee_ids").$type<string[]>().default([]),

  // Building-specific data (e.g., school subjects, library collections)
  buildingData: jsonb("building_data").$type<Record<string, any>>().default({}),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Whereabouts - tracks character location history
export const whereabouts = pgTable("whereabouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  characterId: varchar("character_id").notNull(),
  
  // Location details
  location: text("location").notNull(), // Can be business ID, residence ID, or description
  locationType: text("location_type").notNull(), // home, work, leisure, school
  occasion: text("occasion"), // working, relaxing, studying, etc.
  
  // Time tracking
  timestep: integer("timestep").notNull(),
  timeOfDay: text("time_of_day").notNull(), // day, night
  date: timestamp("date").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Water Features - rivers, lakes, oceans, ponds, streams, waterfalls, marshes, canals
export const waterFeatures = pgTable("water_features", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  settlementId: varchar("settlement_id"), // Optional: associated settlement

  // Type
  type: text("type").notNull(), // river, lake, ocean, pond, stream, waterfall, marsh, canal
  subType: text("sub_type").notNull().default("fresh"), // fresh, salt, brackish
  name: text("name").notNull(),

  // Spatial
  position: jsonb("position").$type<{ x: number; y: number; z: number }>(),
  waterLevel: real("water_level").notNull().default(0),
  bounds: jsonb("bounds").$type<{ minX: number; maxX: number; minZ: number; maxZ: number; centerX: number; centerZ: number }>(),
  depth: real("depth").notNull().default(2),
  width: real("width").notNull().default(10),
  flowDirection: jsonb("flow_direction").$type<{ x: number; y: number; z: number } | null>(),
  flowSpeed: real("flow_speed").notNull().default(0),
  shorelinePoints: jsonb("shoreline_points").$type<{ x: number; y: number; z: number }[]>().default([]),

  // Properties
  biome: text("biome"),
  isNavigable: boolean("is_navigable").default(true),
  isDrinkable: boolean("is_drinkable").default(true),

  // Visual
  modelAssetKey: varchar("model_asset_key"),
  color: jsonb("color").$type<{ r: number; g: number; b: number } | null>(),
  transparency: real("transparency").default(0.3),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertRuleSchema = createInsertSchema(rules).pick({
  worldId: true,
  name: true,
  description: true,
  content: true,
  isBase: true,
  sourceFormat: true,
  ruleType: true,
  category: true,
  priority: true,
  likelihood: true,
  tags: true,
  relatedTruthIds: true,
  isActive: true,
});

export const insertGrammarSchema = createInsertSchema(grammars).pick({
  worldId: true,
  name: true,
  description: true,
  grammar: true,
  tags: true,
  worldType: true,
  gameType: true,
  truthBindings: true,
  contextType: true,
  relatedTruthIds: true,
  isActive: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertWorldSchema = createInsertSchema(worlds).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCharacterTemplateSchema = createInsertSchema(characterTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertCountrySchema = createInsertSchema(countries).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertStateSchema = createInsertSchema(states).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSettlementSchema = createInsertSchema(settlements).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertSimulationSchema = createInsertSchema(simulations).pick({
  worldId: true,
  name: true,
  description: true,
  config: true,
  startTime: true,
  endTime: true,
  timeStep: true,
  results: true,
  status: true,
  progress: true,
  executionTime: true,
  rulesExecuted: true,
  eventsGenerated: true,
  narrativeOutput: true,
});

export const insertActionSchema = createInsertSchema(actions).pick({
  worldId: true,
  name: true,
  description: true,
  content: true,
  isBase: true,
  sourceFormat: true,
  parentAction: true,
  actionType: true,
  category: true,
  duration: true,
  difficulty: true,
  energyCost: true,
  targetType: true,
  requiresTarget: true,
  range: true,
  isAvailable: true,
  cooldown: true,
  verbPast: true,
  verbPresent: true,
  narrativeTemplates: true,
  customData: true,
  tags: true,
  relatedTruthIds: true,
  isActive: true,
});

export const insertTruthSchema = createInsertSchema(truths).pick({
  worldId: true,
  playthroughId: true,
  characterId: true,
  title: true,
  content: true,
  entryType: true,
  timestep: true,
  timestepDuration: true,
  timeYear: true,
  timeSeason: true,
  timeDescription: true,
  historicalEra: true,
  historicalSignificance: true,
  causesTruthIds: true,
  causedByTruthIds: true,
  relatedCharacterIds: true,
  relatedLocationIds: true,
  tags: true,
  importance: true,
  isPublic: true,
  source: true,
  sourceData: true,
});

export const insertQuestSchema = createInsertSchema(quests).pick({
  worldId: true,
  assignedTo: true,
  assignedBy: true,
  assignedToCharacterId: true,
  assignedByCharacterId: true,
  title: true,
  description: true,
  titleTranslation: true,
  descriptionTranslation: true,
  objectivesTranslation: true,
  questType: true,
  difficulty: true,
  cefrLevel: true,
  difficultyStars: true,
  estimatedMinutes: true,
  targetLanguage: true,
  objectives: true,
  progress: true,
  status: true,
  completionCriteria: true,
  experienceReward: true,
  rewards: true,
  expiresAt: true,
  conversationContext: true,
  tags: true,
  content: true,
  relatedTruthIds: true,
  recurrencePattern: true,
  recurrenceResetAt: true,
  completionCount: true,
  lastCompletedAt: true,
  sourceQuestId: true,
  streakCount: true,
  attemptCount: true,
  maxAttempts: true,
  abandonedAt: true,
  failedAt: true,
  failureReason: true,
  abandonReason: true,
  completedAt: true,
});

export const insertItemSchema = createInsertSchema(items).pick({
  worldId: true,
  name: true,
  description: true,
  itemType: true,
  icon: true,
  value: true,
  sellValue: true,
  weight: true,
  tradeable: true,
  stackable: true,
  maxStack: true,
  worldType: true,
  objectRole: true,
  category: true,
  material: true,
  baseType: true,
  rarity: true,
  effects: true,
  lootWeight: true,
  tags: true,
  isBase: true,
  possessable: true,
  metadata: true,
  craftingRecipe: true,
  questRelevance: true,
  loreText: true,
  translations: true,
  relatedTruthIds: true,
});

export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;

// Containers - chests, cupboards, barrels, and other storage objects
export const containers = pgTable("containers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),

  // Container identity
  name: text("name").notNull(),
  containerType: text("container_type").notNull(), // chest, cupboard, barrel, crate, wardrobe, shelf, safe, sack
  capacity: integer("capacity").default(10), // max item slots

  // Contents
  items: jsonb("items").$type<Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    metadata?: Record<string, any>;
  }>>().default([]),

  // Lock
  locked: boolean("locked").default(false),
  lockDifficulty: integer("lock_difficulty"), // 0-100
  keyItemId: varchar("key_item_id"), // item that unlocks this container

  // Location
  businessId: varchar("business_id"),
  residenceId: varchar("residence_id"),
  lotId: varchar("lot_id"),
  positionX: real("position_x"),
  positionY: real("position_y"),
  positionZ: real("position_z"),
  rotationY: real("rotation_y"),

  // Visual
  objectRole: text("object_role"), // maps to asset collection model key

  // Loot respawn
  respawns: boolean("respawns").default(false),
  respawnTimeMinutes: integer("respawn_time_minutes"),
  lastOpenedAt: timestamp("last_opened_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContainerSchema = createInsertSchema(containers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertContainer = z.infer<typeof insertContainerSchema>;
export type Container = typeof containers.$inferSelect;

export const insertWaterFeatureSchema = createInsertSchema(waterFeatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWaterFeature = z.infer<typeof insertWaterFeatureSchema>;
export type WaterFeature = typeof waterFeatures.$inferSelect;

// ============= USER AUTHENTICATION AND PLAYER PROGRESS =============

// Users - authentication and account management
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  // Profile
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),

  // Account status & role
  role: text("role").default("user"), // user, researcher, admin
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  lastLoginAt: timestamp("last_login_at"),

  // API key for telemetry and external integrations
  apiKey: text("api_key").unique(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Player Progress - tracks player progress across worlds and games
export const playerProgress = pgTable("player_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  worldId: varchar("world_id").notNull(),
  playthroughId: varchar("playthrough_id"), // Scope progress to a specific playthrough

  // Player character association
  characterId: varchar("character_id"), // The character this player controls in the game

  // Progress metrics
  level: integer("level").default(1),
  experience: integer("experience").default(0),
  gold: integer("gold").default(0),
  playtime: integer("playtime").default(0), // in seconds

  // Game state
  currentPosition: jsonb("current_position").$type<{ x: number; y: number; z: number }>().default({ x: 0, y: 0, z: 0 }),
  currentLocation: text("current_location"), // Settlement or location name

  // CEFR language proficiency level (A1, A2, B1, B2, C1, C2)
  cefrLevel: text("cefr_level"),

  // Progress tracking
  questsCompleted: jsonb("quests_completed").$type<string[]>().default([]),
  achievementsUnlocked: jsonb("achievements_unlocked").$type<string[]>().default([]),
  stats: jsonb("stats").$type<Record<string, number>>().default({}),
  inventory: jsonb("inventory").$type<any[]>().default([]),

  // Checkpoints and saves
  lastCheckpoint: jsonb("last_checkpoint").$type<Record<string, any>>().default({}),
  saveData: jsonb("save_data").$type<Record<string, any>>().default({}),

  // Session tracking
  lastPlayedAt: timestamp("last_played_at").defaultNow(),
  sessionsCount: integer("sessions_count").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Player Sessions - tracks individual play sessions
export const playerSessions = pgTable("player_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  worldId: varchar("world_id").notNull(),
  progressId: varchar("progress_id").notNull(),

  // Session details
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  duration: integer("duration").default(0), // in seconds

  // Session metrics
  experienceGained: integer("experience_gained").default(0),
  questsCompletedInSession: integer("quests_completed_in_session").default(0),
  achievementsEarnedInSession: integer("achievements_earned_in_session").default(0),

  // Session data
  sessionData: jsonb("session_data").$type<Record<string, any>>().default({}),

  createdAt: timestamp("created_at").defaultNow(),
});

// Achievements - defines available achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id"), // null for global achievements

  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),

  // Achievement criteria
  achievementType: text("achievement_type").notNull(), // quest_completion, level_reached, time_played, social_interaction
  criteria: jsonb("criteria").$type<Record<string, any>>().default({}),

  // Rewards
  experienceReward: integer("experience_reward").default(0),
  rewards: jsonb("rewards").$type<Record<string, any>>().default({}),

  // Metadata
  isHidden: boolean("is_hidden").default(false),
  rarity: text("rarity").default("common"), // common, uncommon, rare, epic, legendary

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============= TEXTS (procedurally generated reading content) =============

// ============= PLAYTHROUGHS AND PLAYER ISOLATION =============

// Playthroughs - player-specific instances of a world
// Each player gets their own isolated playthrough where they can make changes
// without affecting the base world or other players
export const playthroughs = pgTable("playthroughs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  worldId: varchar("world_id").notNull(),

  // Snapshot info - which version of the world this playthrough is based on
  worldSnapshotVersion: integer("world_snapshot_version").notNull().default(1),

  // Playthrough metadata
  name: text("name"), // Player can name their playthrough (e.g., "My First Adventure")
  description: text("description"),
  notes: text("notes"), // Player notes

  // Playthrough state
  status: text("status").default("active"), // active, completed, abandoned, paused
  currentTimestep: integer("current_timestep").default(0),

  // Progress tracking
  playtime: integer("playtime").default(0), // Total playtime in seconds
  actionsCount: integer("actions_count").default(0), // Total actions taken
  decisionsCount: integer("decisions_count").default(0), // Major decisions made

  // Session tracking
  startedAt: timestamp("started_at").defaultNow(),
  lastPlayedAt: timestamp("last_played_at").defaultNow(),
  completedAt: timestamp("completed_at"),

  // Player character
  playerCharacterId: varchar("player_character_id"), // Which character the player controls

  // Save state
  saveData: jsonb("save_data").$type<Record<string, any>>().default({}),

  // Migration flag: true for editor-created playthroughs that need in-game initialization
  needsInitialization: boolean("needs_initialization").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Playthrough Deltas - tracks changes made in a playthrough
// Uses copy-on-write: only stores what changed from the base world
export const playthroughDeltas = pgTable("playthrough_deltas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playthroughId: varchar("playthrough_id").notNull(),

  // What entity changed
  entityType: text("entity_type").notNull(), // character, settlement, rule, action, etc.
  entityId: varchar("entity_id").notNull(), // ID of the base entity (if updating) or new ID (if creating)
  operation: text("operation").notNull(), // create, update, delete

  // The delta data
  deltaData: jsonb("delta_data").$type<Record<string, any>>(), // Only changed fields for updates
  fullData: jsonb("full_data").$type<Record<string, any>>(), // Full object for creates

  // When this change occurred
  timestep: integer("timestep").notNull(),
  appliedAt: timestamp("applied_at").defaultNow(),

  // Metadata
  description: text("description"), // Optional description of the change
  tags: jsonb("tags").$type<string[]>().default([]),

  createdAt: timestamp("created_at").defaultNow(),
});

// Play Traces - detailed log of player actions and decisions
// This is the audit trail of everything a player does in their playthrough
export const playTraces = pgTable("play_traces", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playthroughId: varchar("playthrough_id").notNull(),
  userId: varchar("user_id").notNull(),

  // Action details
  actionType: text("action_type").notNull(), // move, interact, dialogue, combat, quest_accept, etc.
  actionName: text("action_name"), // Human-readable name
  actionData: jsonb("action_data").$type<Record<string, any>>().default({}),

  // Context
  timestep: integer("timestep").notNull(),
  characterId: varchar("character_id"), // Player's character
  targetId: varchar("target_id"), // Target of the action (NPC, item, location, etc.)
  targetType: text("target_type"), // character, item, location, etc.
  locationId: varchar("location_id"), // Where the action took place

  // Results and outcomes
  outcome: text("outcome"), // success, failure, partial, etc.
  outcomeData: jsonb("outcome_data").$type<Record<string, any>>().default({}),
  stateChanges: jsonb("state_changes").$type<any[]>().default([]), // What changed as a result

  // Narrative
  narrativeText: text("narrative_text"), // Generated narrative description

  // Timing
  durationMs: integer("duration_ms"), // How long the action took (for analytics)
  timestamp: timestamp("timestamp").defaultNow(),

  createdAt: timestamp("created_at").defaultNow(),
});

// Playthrough Conversations - stores full conversation transcripts for research
// Each record captures a complete player-NPC conversation with dialogue turns,
// language metrics, and contextual metadata for linguistic research analysis
export const playthroughConversations = pgTable("playthrough_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playthroughId: varchar("playthrough_id").notNull(),
  userId: varchar("user_id").notNull(),
  worldId: varchar("world_id").notNull(),

  // Participants
  playerCharacterId: varchar("player_character_id"),
  npcCharacterId: varchar("npc_character_id").notNull(),
  npcCharacterName: text("npc_character_name"),

  // Conversation content
  turns: jsonb("turns").$type<ConversationTurn[]>().default([]),
  turnCount: integer("turn_count").default(0),

  // Context
  locationId: varchar("location_id"),
  locationName: text("location_name"),
  timestep: integer("timestep"),
  initiatedBy: text("initiated_by"), // player, npc, ambient

  // Language metrics (for language learning research)
  targetLanguage: text("target_language"),
  targetLanguagePercentage: integer("target_language_percentage"), // 0-100
  wordsUsed: jsonb("words_used").$type<string[]>().default([]),
  newWordsLearned: jsonb("new_words_learned").$type<string[]>().default([]),
  fluencyGained: integer("fluency_gained").default(0),
  grammarErrorCount: integer("grammar_error_count").default(0),
  grammarCorrectCount: integer("grammar_correct_count").default(0),

  // Quest/topic context
  activeQuestIds: jsonb("active_quest_ids").$type<string[]>().default([]),
  topics: jsonb("topics").$type<string[]>().default([]),

  // Timing
  durationMs: integer("duration_ms"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),

  createdAt: timestamp("created_at").defaultNow(),
});

// A single turn in a conversation
export interface ConversationTurn {
  role: "player" | "npc" | "system";
  text: string;
  timestamp: number;
  targetLanguageUsed?: boolean;
  wordsUsed?: string[];
  grammarFeedback?: {
    status: "correct" | "corrected" | "no_target_language";
    errorCount: number;
  };
  metadata?: Record<string, any>;
}

// Reputations - tracks player reputation/karma per settlement and faction
// Used for graduated rule enforcement and access control
export const reputations = pgTable("reputations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playthroughId: varchar("playthrough_id").notNull(), // Which playthrough this reputation belongs to
  userId: varchar("user_id").notNull(), // Which user

  // What entity this reputation is with
  entityType: text("entity_type").notNull(), // settlement, country, faction, character
  entityId: varchar("entity_id").notNull(), // ID of the settlement/country/faction/character

  // Reputation score (-100 to 100)
  // -100 = Hostile/Enemy, -50 = Unfriendly, 0 = Neutral, 50 = Friendly, 100 = Revered
  score: integer("score").default(0).notNull(),

  // Violation tracking for graduated enforcement
  violationCount: integer("violation_count").default(0),
  warningCount: integer("warning_count").default(0),
  lastViolation: timestamp("last_violation"),
  violationHistory: jsonb("violation_history").$type<Array<{
    type: string; // rule type violated
    severity: string; // minor, moderate, severe
    timestamp: string;
    penaltyApplied: string; // warning, fine, combat, banishment
  }>>().default([]),

  // Status and restrictions
  standing: text("standing").default("neutral"), // hostile, unfriendly, neutral, friendly, revered
  isBanned: boolean("is_banned").default(false),
  banExpiry: timestamp("ban_expiry"), // When the ban expires (null = permanent)

  // Financial penalties
  totalFinesPaid: integer("total_fines_paid").default(0),
  outstandingFines: integer("outstanding_fines").default(0),

  // Rewards and bonuses
  hasDiscounts: boolean("has_discounts").default(false),
  hasSpecialAccess: boolean("has_special_access").default(false),

  // Metadata
  notes: text("notes"), // Admin/system notes about this reputation
  tags: jsonb("tags").$type<string[]>().default([]),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for Talk of the Town tables
export const insertOccupationSchema = createInsertSchema(occupations).pick({
  worldId: true,
  characterId: true,
  businessId: true,
  vocation: true,
  level: true,
  shift: true,
  startYear: true,
  endYear: true,
  yearsExperience: true,
  terminationReason: true,
  predecessorId: true,
  successorId: true,
  isSupplemental: true,
  hiredAsFavor: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).pick({
  worldId: true,
  settlementId: true,
  name: true,
  businessType: true,
  ownerId: true,
  founderId: true,
  isOutOfBusiness: true,
  foundedYear: true,
  closedYear: true,
  lotId: true,
  vacancies: true,
  businessData: true,
});

export const insertLotSchema = createInsertSchema(lots).pick({
  worldId: true,
  settlementId: true,
  address: true,
  houseNumber: true,
  streetName: true,
  block: true,
  districtName: true,
  buildingId: true,
  buildingType: true,
  positionX: true,
  positionZ: true,
  facingAngle: true,
  elevation: true,
  streetEdgeId: true,
  side: true,
  neighboringLotIds: true,
  distanceFromDowntown: true,
  formerBuildingIds: true,
});

export const insertResidenceSchema = createInsertSchema(residences).pick({
  worldId: true,
  settlementId: true,
  lotId: true,
  ownerIds: true,
  residentIds: true,
  address: true,
  residenceType: true,
});

export const insertPublicBuildingSchema = createInsertSchema(publicBuildings).pick({
  worldId: true,
  settlementId: true,
  lotId: true,
  name: true,
  publicBuildingType: true,
  address: true,
  foundedYear: true,
  isOperational: true,
  capacity: true,
  employeeIds: true,
  buildingData: true,
});

export const insertWhereaboutsSchema = createInsertSchema(whereabouts).pick({
  worldId: true,
  characterId: true,
  location: true,
  locationType: true,
  occasion: true,
  timestep: true,
  timeOfDay: true,
  date: true,
});

// Types
export type Rule = typeof rules.$inferSelect;
export type InsertRule = z.infer<typeof insertRuleSchema>;

export type Grammar = typeof grammars.$inferSelect;
export type InsertGrammar = z.infer<typeof insertGrammarSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type World = typeof worlds.$inferSelect;
export type InsertWorld = z.infer<typeof insertWorldSchema>;

export type CharacterTemplate = typeof characterTemplates.$inferSelect;
export type InsertCharacterTemplate = z.infer<typeof insertCharacterTemplateSchema>;

export type Country = typeof countries.$inferSelect;
export type InsertCountry = z.infer<typeof insertCountrySchema>;

export type State = typeof states.$inferSelect;
export type InsertState = z.infer<typeof insertStateSchema>;

export type Settlement = typeof settlements.$inferSelect;
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;

export type SettlementHistoryEvent = typeof settlementHistoryEvents.$inferSelect;
export type InsertSettlementHistoryEvent = z.infer<typeof insertSettlementHistoryEventSchema>;

export type TerrainFeature = typeof terrainFeatures.$inferSelect;
export type InsertTerrainFeature = z.infer<typeof insertTerrainFeatureSchema>;

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;

export type Action = typeof actions.$inferSelect;
export type InsertAction = z.infer<typeof insertActionSchema>;

export type Truth = typeof truths.$inferSelect;
export type InsertTruth = z.infer<typeof insertTruthSchema>;

export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;

// Talk of the Town types
export type Occupation = typeof occupations.$inferSelect;
export type InsertOccupation = z.infer<typeof insertOccupationSchema>;

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

export type Lot = typeof lots.$inferSelect;
export type InsertLot = z.infer<typeof insertLotSchema>;

export type Residence = typeof residences.$inferSelect;
export type InsertResidence = z.infer<typeof insertResidenceSchema>;

export type PublicBuilding = typeof publicBuildings.$inferSelect;
export type InsertPublicBuilding = z.infer<typeof insertPublicBuildingSchema>;

export type Whereabouts = typeof whereabouts.$inferSelect;
export type InsertWhereabouts = z.infer<typeof insertWhereaboutsSchema>;

// ============= VISUAL ASSETS SYSTEM =============

// Asset types for procedural generation
export type AssetType =
  | 'character_portrait' | 'character_full_body' | 'character_sprite'
  | 'building_exterior' | 'building_interior' | 'building_icon'
  | 'map_terrain' | 'map_political' | 'map_region'
  | 'texture_ground' | 'texture_wall' | 'texture_material'
  | 'item_icon' | 'item_image' | 'artifact_image'
  | 'landscape' | 'skybox' | 'environmental'
  | 'ui_background' | 'ui_decoration' | 'custom'
  | 'model_3d' | 'model_building' | 'model_tree' | 'model_character' | 'model_prop'
  | 'model_player' | 'model_quest_item'
  | 'audio_footstep' | 'audio_ambient' | 'audio_effect' | 'audio_music';

export type AssetStatus = 'generating' | 'completed' | 'failed' | 'archived';

export type GenerationProvider = 'gemini-imagen' | 'stable-diffusion' | 'dalle' | 'flux' | 'manual';

// Visual Assets - stores generated or uploaded images and visual content
export const visualAssets = pgTable("visual_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id"), // Nullable for base/reusable assets

  // Asset identification
  name: text("name").notNull(),
  description: text("description"),
  assetType: text("asset_type").notNull(), // character_portrait, building_exterior, etc.

  // File information
  filePath: text("file_path").notNull(), // Relative path from public/assets
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"), // In bytes
  mimeType: text("mime_type").default("image/png"),
  width: integer("width"),
  height: integer("height"),

  // Generation metadata
  generationProvider: text("generation_provider"), // gemini-imagen, stable-diffusion, dalle, flux, manual
  generationPrompt: text("generation_prompt"), // The prompt used to generate this
  generationParams: jsonb("generation_params").$type<Record<string, any>>().default({}),

  // Versioning and variants
  parentAssetId: varchar("parent_asset_id"), // For variations/edits of existing assets
  version: integer("version").default(1),
  variants: jsonb("variants").$type<string[]>().default([]), // IDs of variant assets

  // Usage and purpose
  purpose: text("purpose"), // "authorial" (maps, character art), "procedural" (textures, tilesets)
  usageContext: text("usage_context"), // "3d_game", "2d_ui", "map_display", "character_sheet"
  tags: jsonb("tags").$type<string[]>().default([]),

  // Status and availability
  status: text("status").default("completed"), // generating, completed, failed, archived

  // Error tracking (for failed generations)
  errorMessage: text("error_message"),

  // Metadata
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// World Type Collections - comprehensive config bundles combining asset and procedural settings
// Replaces the former "Asset Collections" concept. Each collection defines a complete world theme
// with building, ground, character, nature, and item configurations.
export const assetCollections = pgTable("asset_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  name: text("name").notNull(),
  description: text("description"),
  collectionType: text("collection_type").notNull(), // world_type_collection (new), or legacy: complete_theme, texture_pack, etc.

  // Theme/world type this collection is designed for
  worldType: text("world_type"), // medieval-fantasy, cyberpunk, sci-fi-space, historical-medieval, etc.
  
  // Assets in this collection (organized by category)
  assetIds: jsonb("asset_ids").$type<string[]>().default([]),
  
  // 3D Config for this collection (buildings, nature, characters, objects, textures)
  buildingModels: jsonb("building_models").$type<Record<string, string>>().default({}),
  natureModels: jsonb("nature_models").$type<Record<string, string>>().default({}),
  characterModels: jsonb("character_models").$type<Record<string, string>>().default({}),
  objectModels: jsonb("object_models").$type<Record<string, string>>().default({}),
  groundTextureId: varchar("ground_texture_id"),
  roadTextureId: varchar("road_texture_id"),
  wallTextureId: varchar("wall_texture_id"),
  roofTextureId: varchar("roof_texture_id"),
  
  // Player and quest models
  playerModels: jsonb("player_models").$type<Record<string, string>>().default({}),
  questObjectModels: jsonb("quest_object_models").$type<Record<string, string>>().default({}),
  
  // Audio assets
  audioAssets: jsonb("audio_assets").$type<Record<string, string>>().default({}),

  // Per-model scaling overrides (key = "groupField.role", e.g. "buildingModels.tavern")
  modelScaling: jsonb("model_scaling").$type<Record<string, { x: number; y: number; z: number }>>().default({}),

  // Procedural building generation parameters (style presets, type overrides, etc.)
  proceduralBuildings: jsonb("procedural_buildings").$type<import('./game-engine/types').ProceduralBuildingConfig | null>().default(null),

  // Unified per-type building configuration (replaces buildingModels + proceduralBuildings for new collections)
  buildingTypeConfigs: jsonb("building_type_configs").$type<Record<string, import('./game-engine/types').UnifiedBuildingTypeConfig> | null>().default(null),
  // Category-level style presets (keys are category names like 'commercial_food', 'commercial_retail', etc.)
  categoryPresets: jsonb("category_presets").$type<Record<string, import('./game-engine/types').ProceduralStylePreset> | null>().default(null),
  // NPC appearance configuration (legacy — migrated to worldTypeConfig.characterConfig)
  npcConfig: jsonb("npc_config").$type<import('./game-engine/types').NpcConfig | null>().default(null),

  // Unified World Type Collection config — holds all 5 config modules
  // (building, ground, character, nature, item) in a single structured field
  worldTypeConfig: jsonb("world_type_config").$type<import('./game-engine/types').WorldTypeCollectionConfig | null>().default(null),

  // Per-engine asset overrides (Phase 2 — Asset Pipeline)
  // When exporting to a native engine, these override the default Babylon.js assets
  unrealAssets: jsonb("unreal_assets").$type<{
    buildingModels?: Record<string, string>;
    natureModels?: Record<string, string>;
    characterModels?: Record<string, string>;
    objectModels?: Record<string, string>;
    playerModels?: Record<string, string>;
    textures?: Record<string, string>;
    materials?: Record<string, string>;
    audio?: Record<string, string>;
  }>().default({}),
  unityAssets: jsonb("unity_assets").$type<{
    buildingPrefabs?: Record<string, string>;
    naturePrefabs?: Record<string, string>;
    characterPrefabs?: Record<string, string>;
    objectPrefabs?: Record<string, string>;
    playerPrefabs?: Record<string, string>;
    textures?: Record<string, string>;
    materials?: Record<string, string>;
    audio?: Record<string, string>;
  }>().default({}),
  godotAssets: jsonb("godot_assets").$type<{
    buildingScenes?: Record<string, string>;
    natureScenes?: Record<string, string>;
    characterScenes?: Record<string, string>;
    objectScenes?: Record<string, string>;
    playerScenes?: Record<string, string>;
    textures?: Record<string, string>;
    materials?: Record<string, string>;
    audio?: Record<string, string>;
  }>().default({}),

  // Collection metadata
  purpose: text("purpose"), // "Complete medieval fantasy asset pack", "Cyberpunk building set", etc.
  tags: jsonb("tags").$type<string[]>().default([]),
  
  // Ownership and visibility
  createdBy: varchar("created_by"), // User ID of creator (admin)
  isPublic: boolean("is_public").default(false), // Available to all users
  isActive: boolean("is_active").default(true),
  isBase: boolean("is_base").default(false), // Base/template collection (read-only in UI)

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generation Jobs - track ongoing and queued generation tasks
export const generationJobs = pgTable("generation_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id"),

  // Job details
  jobType: text("job_type").notNull(), // single_asset, batch_generation, texture_set
  assetType: text("asset_type").notNull(),

  // Target entity (what we're generating for)
  targetEntityId: varchar("target_entity_id"),
  targetEntityType: text("target_entity_type"), // character, business, settlement, etc.

  // Generation parameters
  prompt: text("prompt").notNull(),
  generationProvider: text("generation_provider").notNull(),
  generationParams: jsonb("generation_params").$type<Record<string, any>>().default({}),

  // Batch settings (for multiple generations)
  batchSize: integer("batch_size").default(1),
  completedCount: integer("completed_count").default(0),

  // Results
  generatedAssetIds: jsonb("generated_asset_ids").$type<string[]>().default([]),

  // Status tracking
  status: text("status").default("queued"), // queued, processing, completed, failed, cancelled
  progress: real("progress").default(0.0), // 0.0 to 1.0
  errorMessage: text("error_message"),

  // Timing
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertVisualAssetSchema = createInsertSchema(visualAssets).pick({
  worldId: true,
  name: true,
  description: true,
  assetType: true,
  filePath: true,
  fileName: true,
  fileSize: true,
  mimeType: true,
  width: true,
  height: true,
  generationProvider: true,
  generationPrompt: true,
  generationParams: true,
  parentAssetId: true,
  version: true,
  variants: true,
  purpose: true,
  usageContext: true,
  tags: true,
  status: true,
  errorMessage: true,
  metadata: true,
});

export const insertAssetCollectionSchema = createInsertSchema(assetCollections).pick({
  name: true,
  description: true,
  collectionType: true,
  worldType: true,
  assetIds: true,
  buildingModels: true,
  natureModels: true,
  characterModels: true,
  objectModels: true,
  groundTextureId: true,
  roadTextureId: true,
  wallTextureId: true,
  roofTextureId: true,
  playerModels: true,
  questObjectModels: true,
  audioAssets: true,
  proceduralBuildings: true,
  buildingTypeConfigs: true,
  categoryPresets: true,
  npcConfig: true,
  unrealAssets: true,
  unityAssets: true,
  godotAssets: true,
  purpose: true,
  tags: true,
  createdBy: true,
  isPublic: true,
  isActive: true,
  isBase: true,
});

export const insertGenerationJobSchema = createInsertSchema(generationJobs).pick({
  worldId: true,
  jobType: true,
  assetType: true,
  targetEntityId: true,
  targetEntityType: true,
  prompt: true,
  generationProvider: true,
  generationParams: true,
  batchSize: true,
  completedCount: true,
  generatedAssetIds: true,
  status: true,
  progress: true,
  errorMessage: true,
  startedAt: true,
  completedAt: true,
});

// Types
export type VisualAsset = typeof visualAssets.$inferSelect;
export type InsertVisualAsset = z.infer<typeof insertVisualAssetSchema>;

export type AssetCollection = typeof assetCollections.$inferSelect;
export type InsertAssetCollection = z.infer<typeof insertAssetCollectionSchema>;

export type GenerationJob = typeof generationJobs.$inferSelect;
export type InsertGenerationJob = z.infer<typeof insertGenerationJobSchema>;
// User and Player Progress insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlayerProgressSchema = createInsertSchema(playerProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlayerSessionSchema = createInsertSchema(playerSessions).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Playthrough insert schemas
export const insertPlaythroughSchema = createInsertSchema(playthroughs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlaythroughDeltaSchema = createInsertSchema(playthroughDeltas).omit({
  id: true,
  createdAt: true,
});

export const insertPlayTraceSchema = createInsertSchema(playTraces).omit({
  id: true,
  createdAt: true,
});

export const insertPlaythroughConversationSchema = createInsertSchema(playthroughConversations).omit({
  id: true,
  createdAt: true,
});

export const insertReputationSchema = createInsertSchema(reputations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User and Player Progress types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PlayerProgress = typeof playerProgress.$inferSelect;
export type InsertPlayerProgress = z.infer<typeof insertPlayerProgressSchema>;

export type PlayerSession = typeof playerSessions.$inferSelect;
export type InsertPlayerSession = z.infer<typeof insertPlayerSessionSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type Text = typeof texts.$inferSelect;
export type InsertText = z.infer<typeof insertTextSchema>;

// Playthrough types
export type Playthrough = typeof playthroughs.$inferSelect;
export type InsertPlaythrough = z.infer<typeof insertPlaythroughSchema>;

export type PlaythroughDelta = typeof playthroughDeltas.$inferSelect;
export type InsertPlaythroughDelta = z.infer<typeof insertPlaythroughDeltaSchema>;

export type PlayTrace = typeof playTraces.$inferSelect;
export type InsertPlayTrace = z.infer<typeof insertPlayTraceSchema>;

export type PlaythroughConversation = typeof playthroughConversations.$inferSelect;
export type InsertPlaythroughConversation = z.infer<typeof insertPlaythroughConversationSchema>;

export type Reputation = typeof reputations.$inferSelect;
export type InsertReputation = z.infer<typeof insertReputationSchema>;

// Playthrough-scoped relationship overlay
// Stores relationship changes that occur during a specific playthrough,
// layered on top of base world relationships via copy-on-write
export interface PlaythroughRelationship {
  id: string;
  playthroughId: string;
  fromCharacterId: string;
  toCharacterId: string;
  type: string; // romantic, friendship, rivalry, acquaintance, etc.
  strength: number; // -1.0 to 1.0
  reciprocal?: number; // Strength in opposite direction
  lastModified: number;
  metadata?: Record<string, any>; // Extra context (e.g., cause of change)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertPlaythroughRelationship {
  playthroughId: string;
  fromCharacterId: string;
  toCharacterId: string;
  type: string;
  strength: number;
  reciprocal?: number;
  lastModified: number;
  metadata?: Record<string, any>;
}

// ============= TEXTS (Reading Content) =============

export const texts = pgTable("texts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),

  // Text identity
  title: text("title").notNull(), // title in target language
  titleTranslation: text("title_translation"), // English translation
  textCategory: text("text_category").notNull(), // book, journal, letter, flyer, recipe

  // Content pages
  pages: jsonb("pages").$type<Array<{ content: string; contentTranslation: string }>>().default([]),

  // Language learning data
  vocabularyHighlights: jsonb("vocabulary_highlights").$type<Array<{
    word: string;
    translation: string;
    partOfSpeech: string;
  }>>().default([]),
  comprehensionQuestions: jsonb("comprehension_questions").$type<Array<{
    question: string;
    questionTranslation: string;
    options: string[];
    correctIndex: number;
  }>>().default([]),

  // Difficulty / language level
  cefrLevel: text("cefr_level").notNull(), // A1, A2, B1, B2
  targetLanguage: text("target_language").notNull(),
  difficulty: text("difficulty").default("beginner"), // beginner, intermediate, advanced

  // In-world metadata
  authorName: text("author_name"), // in-world author
  clueText: text("clue_text"), // what this text reveals for main quest
  spawnLocationHint: text("spawn_location_hint"), // library, bookshop, cafe, residence, office, hidden, market

  // Generation
  isGenerated: boolean("is_generated").default(false),
  generationPrompt: text("generation_prompt"),

  // Status and metadata
  status: text("status").default("draft"), // draft, published
  tags: jsonb("tags").$type<string[]>().default([]),

  // Main quest chapter this text is linked to (e.g. 'ch1_assignment_abroad')
  narrativeChapterId: text("narrative_chapter_id"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTextSchema = createInsertSchema(texts, {
  title: (schema) => schema.min(1),
  textCategory: (schema) => schema.refine(v => ['book', 'journal', 'letter', 'flyer', 'recipe'].includes(v), { message: 'Invalid text category' }),
  cefrLevel: (schema) => schema.refine(v => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(v), { message: 'Invalid CEFR level' }),
  targetLanguage: (schema) => schema.min(1),
}).pick({
  worldId: true,
  title: true,
  titleTranslation: true,
  textCategory: true,
  pages: true,
  vocabularyHighlights: true,
  comprehensionQuestions: true,
  cefrLevel: true,
  targetLanguage: true,
  difficulty: true,
  authorName: true,
  clueText: true,
  spawnLocationHint: true,
  isGenerated: true,
  generationPrompt: true,
  status: true,
  tags: true,
});

export type GameText = typeof texts.$inferSelect;
export type InsertGameText = z.infer<typeof insertTextSchema>;

// Version Alerts — notifies playthrough owners when the world version changes
export interface VersionAlert {
  id: string;
  worldId: string;
  playthroughId: string;
  userId: string;
  /** World version that triggered the alert. */
  worldVersion: number;
  /** Playthrough's snapshot version at the time of the alert. */
  snapshotVersion: number;
  /** How many versions behind the playthrough is. */
  versionsBehind: number;
  /** Compatibility status at alert time. */
  status: 'behind' | 'incompatible';
  /** Human-readable message. */
  message: string;
  /** Whether the user has dismissed this alert. */
  dismissed: boolean;
  /** Optional: entity type that triggered the version bump. */
  entityType?: string;
  createdAt?: Date;
}

export interface InsertVersionAlert {
  worldId: string;
  playthroughId: string;
  userId: string;
  worldVersion: number;
  snapshotVersion: number;
  versionsBehind: number;
  status: 'behind' | 'incompatible';
  message: string;
  dismissed?: boolean;
  entityType?: string;
}

// ============= TEXTS (reading content for language learning) =============

export type TextCategory = 'book' | 'journal' | 'letter' | 'flyer' | 'recipe';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type TextStatus = 'draft' | 'published';

export interface TextPage {
  content: string;
  contentTranslation: string;
}

export interface VocabularyHighlight {
  word: string;
  translation: string;
  partOfSpeech: string;
}

export interface ComprehensionQuestion {
  question: string;
  questionTranslation: string;
  options: string[];
  correctIndex: number;
}

export interface GameText {
  id: string;
  worldId: string;
  title: string;
  titleTranslation: string;
  textCategory: TextCategory;
  pages: TextPage[];
  vocabularyHighlights: VocabularyHighlight[];
  comprehensionQuestions: ComprehensionQuestion[];
  cefrLevel: CefrLevel;
  targetLanguage: string;
  authorName?: string;
  clueText?: string;
  difficulty: string;
  tags: string[];
  isGenerated: boolean;
  generationPrompt?: string;
  spawnLocationHint: string;
  status: TextStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InsertGameText {
  worldId: string;
  title: string;
  titleTranslation: string;
  textCategory: TextCategory;
  pages: TextPage[];
  vocabularyHighlights: VocabularyHighlight[];
  comprehensionQuestions: ComprehensionQuestion[];
  cefrLevel: CefrLevel;
  targetLanguage: string;
  authorName?: string;
  clueText?: string;
  difficulty: string;
  tags?: string[];
  isGenerated?: boolean;
  generationPrompt?: string;
  spawnLocationHint: string;
  status?: TextStatus;
}

// ── Word Translation Cache ──────────────────────────────────────────────────────
// Caches individual word/phrase translations to avoid repeated LLM calls

export const wordTranslationCache = pgTable("word_translation_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  worldId: varchar("world_id").notNull(),
  sourceWord: text("source_word").notNull(),
  targetLanguage: text("target_language").notNull(),
  translation: text("translation").notNull(),
  partOfSpeech: text("part_of_speech"),
  context: text("context"),
  lookupCount: integer("lookup_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});
