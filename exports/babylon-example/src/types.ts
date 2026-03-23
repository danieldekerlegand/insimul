/**
 * Game Engine Types - Local copy for exported game
 */

// Combat types
export interface CombatEntityData {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  damage?: number;
}

export interface CombatStyle {
  id: string;
  name: string;
  damageMultiplier: number;
}

export interface CombatSettings {
  enabled: boolean;
  damageMultiplier: number;
}

export interface DamageResult {
  targetId: string;
  damage: number;
  newHealth: number;
}

export const DEFAULT_COMBAT_SETTINGS: CombatSettings = {
  enabled: true,
  damageMultiplier: 1.0,
};

// Inventory types
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  maxStack?: number;
}

// Resource types
export type ResourceType = 'wood' | 'stone' | 'metal' | 'food' | 'water';

export interface ResourceInventory {
  [key: string]: number;
}

export interface StorageCapacity {
  max: number;
  current: number;
}

// Survival types
export type NeedType = 'hunger' | 'thirst' | 'energy' | 'health';

export interface NeedConfig {
  id: NeedType;
  name: string;
  decayRate: number;
}

export interface NeedState {
  id: NeedType;
  value: number;
  max: number;
}

export interface NeedModifier {
  id: string;
  needId: NeedType;
  amount: number;
  duration?: number;
}

export interface SurvivalEvent {
  type: string;
  message: string;
}

// Rule types
export interface Rule {
  id: string;
  name: string;
  condition: RuleCondition;
  effect: RuleEffect;
}

export interface RuleCondition {
  type: string;
  params?: any;
}

export interface RuleEffect {
  type: string;
  params?: any;
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface GameContext {
  location?: Vec3;
  time?: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// Crafting types
export interface ItemCategory {
  id: string;
  name: string;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  inputs: { [key: string]: number };
  outputs: { [key: string]: number };
  category: ItemCategory;
}

export interface CraftedItem {
  id: string;
  name: string;
  quantity: number;
}

// Dungeon types
export type RoomType = 'entrance' | 'exit' | 'treasure' | 'enemy' | 'trap';
export type TileType = 'floor' | 'wall' | 'door' | 'trap';
export type LootRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type TrapType = 'spike' | 'poison' | 'fire' | 'electric';

export interface DungeonConfig {
  floorNumber: number;
  minRooms: number;
  maxRooms: number;
}

export interface EnemySpawn {
  type: string;
  position: Vec3;
  level: number;
}

export interface LootSpawn {
  items: string[];
  position: Vec3;
  rarity: LootRarity;
}

export interface TrapSpawn {
  type: TrapType;
  position: Vec3;
  damage: number;
}

export interface DungeonRoom {
  id: string;
  type: RoomType;
  position: Vec3;
  size: Vec3;
  connections: string[];
}

export interface DungeonCorridor {
  from: string;
  to: string;
  path: Vec3[];
}

export interface DungeonFloorData {
  rooms: DungeonRoom[];
  corridors: DungeonCorridor[];
  enemies: EnemySpawn[];
  loot: LootSpawn[];
  traps: TrapSpawn[];
}

// Action types
export interface Action {
  id: string;
  name: string;
  description?: string;
}

export type ActionState = 'available' | 'in_progress' | 'completed' | 'failed';

export interface ActionContext {
  playerId: string;
  targetId?: string;
  location?: Vec3;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  effects?: ActionEffect[];
}

export interface ActionEffect {
  type: string;
  value: any;
}

export interface ActionUIConfig {
  icon?: string;
  color?: string;
  shortcut?: string;
}

export const ACTION_UI_CONFIGS: { [key: string]: ActionUIConfig } = {};
