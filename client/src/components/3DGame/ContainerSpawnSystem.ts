/**
 * ContainerSpawnSystem
 *
 * Spawns interactive loot containers (chests, barrels, crates) in building
 * interiors and outdoor locations. Containers hold contextual items based on
 * their building/business type and can be opened by the player.
 *
 * Interior containers are created by BuildingInteriorGenerator (furniture
 * meshes tagged with `metadata.isContainer`). Outdoor containers are spawned
 * by this system near building exteriors.
 */

import {
  Scene,
  Mesh,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';
import type { GameEventBus } from './GameEventBus';
import type { InventoryItem } from '@shared/game-engine/types';

// ── Types ───────────────────────────────────────────────────────────────────

export type ContainerType = 'chest' | 'barrel' | 'crate';

export interface ContainerData {
  id: string;
  type: ContainerType;
  items: InventoryItem[];
  opened: boolean;
  buildingId?: string;
  location: 'interior' | 'outdoor';
  mesh?: Mesh;
}

/** Loot table entry: describes an item that may appear in a container. */
export interface LootEntry {
  name: string;
  /** English name for description field */
  nameEn: string;
  type: string;
  category?: string;
  rarity?: InventoryItem['rarity'];
  value?: number;
  /** Weight for random selection (higher = more likely). */
  weight: number;
  /** Language learning data for vocabulary acquisition */
  languageLearning: {
    targetWord: string;
    pronunciation: string;
    category: string;
  };
}

/** Quest objective info for item injection. */
export interface QuestItemObjective {
  questId: string;
  itemName: string;
  buildingContexts: string[];
}

/** Outdoor spawn point for a container near a building. */
export interface OutdoorSpawnPoint {
  position: Vector3;
  containerType: ContainerType;
  buildingId?: string;
  businessType?: string;
}

// ── Deterministic PRNG ──────────────────────────────────────────────────────

/** Simple seeded PRNG (mulberry32). Produces values in [0, 1). */
export function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string to a 32-bit integer for seeding. */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash;
}

// ── Loot tables by context ──────────────────────────────────────────────────

export const LOOT_TABLES: Record<string, LootEntry[]> = {
  tavern: [
    { name: 'Chope de bière', nameEn: 'Ale mug', type: 'drink', category: 'food_drink', weight: 5, languageLearning: { targetWord: 'chope de bière', pronunciation: 'shop duh bee-ehr', category: 'food_drink' } },
    { name: 'Bouteille de vin', nameEn: 'Wine bottle', type: 'drink', category: 'food_drink', rarity: 'uncommon', value: 8, weight: 3, languageLearning: { targetWord: 'bouteille de vin', pronunciation: 'boo-tay duh van', category: 'food_drink' } },
    { name: 'Bourse de pièces', nameEn: 'Coin pouch', type: 'collectible', category: 'treasure', rarity: 'uncommon', value: 15, weight: 2, languageLearning: { targetWord: 'bourse de pièces', pronunciation: 'boors duh pee-ess', category: 'treasure' } },
    { name: 'Pain', nameEn: 'Bread', type: 'food', category: 'food_drink', weight: 4, languageLearning: { targetWord: 'pain', pronunciation: 'pan', category: 'food_drink' } },
    { name: 'Fromage', nameEn: 'Cheese', type: 'food', category: 'food_drink', weight: 3, languageLearning: { targetWord: 'fromage', pronunciation: 'fro-mahzh', category: 'food_drink' } },
  ],
  bakery: [
    { name: 'Pain frais', nameEn: 'Fresh bread', type: 'food', category: 'food_drink', weight: 5, languageLearning: { targetWord: 'pain frais', pronunciation: 'pan freh', category: 'food_drink' } },
    { name: 'Pâtisserie', nameEn: 'Pastry', type: 'food', category: 'food_drink', weight: 4, languageLearning: { targetWord: 'pâtisserie', pronunciation: 'pah-tee-suh-ree', category: 'food_drink' } },
    { name: 'Sac de farine', nameEn: 'Flour sack', type: 'material', category: 'crafting', weight: 3, languageLearning: { targetWord: 'sac de farine', pronunciation: 'sak duh fah-reen', category: 'crafting' } },
    { name: 'Miel', nameEn: 'Honey', type: 'food', category: 'food_drink', rarity: 'uncommon', value: 6, weight: 2, languageLearning: { targetWord: 'miel', pronunciation: 'mee-el', category: 'food_drink' } },
    { name: 'Beurre', nameEn: 'Butter', type: 'food', category: 'food_drink', weight: 3, languageLearning: { targetWord: 'beurre', pronunciation: 'buhr', category: 'food_drink' } },
  ],
  library: [
    { name: 'Vieux livre', nameEn: 'Old book', type: 'collectible', category: 'books', weight: 5, languageLearning: { targetWord: 'vieux livre', pronunciation: 'vyuh leevr', category: 'books' } },
    { name: 'Parchemin', nameEn: 'Scroll', type: 'collectible', category: 'books', weight: 4, languageLearning: { targetWord: 'parchemin', pronunciation: 'par-shuh-man', category: 'books' } },
    { name: "Bouteille d'encre", nameEn: 'Ink bottle', type: 'tool', category: 'tools', weight: 3, languageLearning: { targetWord: "bouteille d'encre", pronunciation: 'boo-tay donkr', category: 'tools' } },
    { name: 'Plume', nameEn: 'Quill pen', type: 'tool', category: 'tools', weight: 3, languageLearning: { targetWord: 'plume', pronunciation: 'ploom', category: 'tools' } },
    { name: 'Carte ancienne', nameEn: 'Ancient map', type: 'collectible', category: 'books', rarity: 'rare', value: 20, weight: 1, languageLearning: { targetWord: 'carte ancienne', pronunciation: 'kart on-see-en', category: 'books' } },
  ],
  church: [
    { name: 'Eau bénite', nameEn: 'Holy water', type: 'consumable', category: 'consumables', weight: 4, languageLearning: { targetWord: 'eau bénite', pronunciation: 'oh bay-neet', category: 'consumables' } },
    { name: 'Bougie', nameEn: 'Candle', type: 'tool', category: 'tools', weight: 5, languageLearning: { targetWord: 'bougie', pronunciation: 'boo-zhee', category: 'tools' } },
    { name: 'Chapelet', nameEn: 'Prayer beads', type: 'collectible', category: 'accessories', weight: 3, languageLearning: { targetWord: 'chapelet', pronunciation: 'shah-pleh', category: 'accessories' } },
    { name: 'Encens', nameEn: 'Incense', type: 'consumable', category: 'consumables', weight: 3, languageLearning: { targetWord: 'encens', pronunciation: 'on-son', category: 'consumables' } },
    { name: 'Croix en bois', nameEn: 'Wooden cross', type: 'collectible', category: 'accessories', rarity: 'uncommon', value: 10, weight: 2, languageLearning: { targetWord: 'croix en bois', pronunciation: 'kwah on bwah', category: 'accessories' } },
  ],
  farm: [
    { name: 'Graines', nameEn: 'Seeds', type: 'material', category: 'crafting', weight: 5, languageLearning: { targetWord: 'graines', pronunciation: 'gren', category: 'crafting' } },
    { name: 'Légumes', nameEn: 'Vegetables', type: 'food', category: 'food_drink', weight: 4, languageLearning: { targetWord: 'légumes', pronunciation: 'lay-goom', category: 'food_drink' } },
    { name: 'Pot de lait', nameEn: 'Milk jug', type: 'food', category: 'food_drink', weight: 3, languageLearning: { targetWord: 'pot de lait', pronunciation: 'poh duh leh', category: 'food_drink' } },
    { name: 'Œufs', nameEn: 'Eggs', type: 'food', category: 'food_drink', weight: 4, languageLearning: { targetWord: 'œufs', pronunciation: 'uhf', category: 'food_drink' } },
    { name: 'Foin', nameEn: 'Hay', type: 'material', category: 'materials', weight: 3, languageLearning: { targetWord: 'foin', pronunciation: 'fwan', category: 'materials' } },
  ],
  blacksmith: [
    { name: "Lingot de fer", nameEn: 'Iron ingot', type: 'material', category: 'crafting', weight: 4, languageLearning: { targetWord: 'lingot de fer', pronunciation: 'lan-go duh fehr', category: 'crafting' } },
    { name: 'Fer à cheval', nameEn: 'Horseshoe', type: 'material', category: 'crafting', weight: 4, languageLearning: { targetWord: 'fer à cheval', pronunciation: 'fehr ah shuh-val', category: 'crafting' } },
    { name: 'Dague', nameEn: 'Dagger', type: 'weapon', category: 'weapons', rarity: 'uncommon', value: 12, weight: 2, languageLearning: { targetWord: 'dague', pronunciation: 'dag', category: 'weapons' } },
    { name: 'Clous', nameEn: 'Nails', type: 'material', category: 'crafting', weight: 5, languageLearning: { targetWord: 'clous', pronunciation: 'kloo', category: 'crafting' } },
    { name: 'Marteau', nameEn: 'Hammer', type: 'tool', category: 'tools', weight: 3, languageLearning: { targetWord: 'marteau', pronunciation: 'mar-toh', category: 'tools' } },
  ],
  shop: [
    { name: 'Fil', nameEn: 'Thread', type: 'material', category: 'crafting', weight: 4, languageLearning: { targetWord: 'fil', pronunciation: 'feel', category: 'crafting' } },
    { name: 'Tissu', nameEn: 'Cloth', type: 'material', category: 'crafting', weight: 3, languageLearning: { targetWord: 'tissu', pronunciation: 'tee-soo', category: 'crafting' } },
    { name: 'Bougie', nameEn: 'Candle', type: 'tool', category: 'tools', weight: 3, languageLearning: { targetWord: 'bougie', pronunciation: 'boo-zhee', category: 'tools' } },
    { name: 'Petite gemme', nameEn: 'Small gem', type: 'collectible', category: 'treasure', rarity: 'rare', value: 25, weight: 1, languageLearning: { targetWord: 'petite gemme', pronunciation: 'puh-teet zhemm', category: 'treasure' } },
  ],
  workshop: [
    { name: 'Lingot de fer', nameEn: 'Iron ingot', type: 'material', category: 'crafting', weight: 4, languageLearning: { targetWord: 'lingot de fer', pronunciation: 'lan-go duh fehr', category: 'crafting' } },
    { name: 'Clous', nameEn: 'Nails', type: 'material', category: 'crafting', weight: 5, languageLearning: { targetWord: 'clous', pronunciation: 'kloo', category: 'crafting' } },
    { name: 'Marteau', nameEn: 'Hammer', type: 'tool', category: 'tools', weight: 2, languageLearning: { targetWord: 'marteau', pronunciation: 'mar-toh', category: 'tools' } },
    { name: "Fragment d'acier", nameEn: 'Steel fragment', type: 'material', category: 'crafting', rarity: 'uncommon', value: 12, weight: 1, languageLearning: { targetWord: "fragment d'acier", pronunciation: 'frag-mon dah-see-ay', category: 'crafting' } },
  ],
  warehouse: [
    { name: 'Corde', nameEn: 'Rope', type: 'tool', category: 'tools', weight: 4, languageLearning: { targetWord: 'corde', pronunciation: 'kord', category: 'tools' } },
    { name: 'Clous de caisse', nameEn: 'Crate nails', type: 'material', category: 'crafting', weight: 4, languageLearning: { targetWord: 'clous de caisse', pronunciation: 'kloo duh kess', category: 'crafting' } },
    { name: 'Huile de lanterne', nameEn: 'Lantern oil', type: 'consumable', category: 'consumables', weight: 3, languageLearning: { targetWord: 'huile de lanterne', pronunciation: 'weel duh lon-tehrn', category: 'consumables' } },
    { name: 'Marchandises', nameEn: 'Stored goods', type: 'material', category: 'materials', weight: 3, languageLearning: { targetWord: 'marchandises', pronunciation: 'mar-shon-deez', category: 'materials' } },
    { name: 'Cachette', nameEn: 'Hidden stash', type: 'collectible', category: 'treasure', rarity: 'rare', value: 30, weight: 1, languageLearning: { targetWord: 'cachette', pronunciation: 'kah-shet', category: 'treasure' } },
  ],
  residence: [
    { name: 'Pain', nameEn: 'Bread', type: 'food', category: 'food_drink', weight: 4, languageLearning: { targetWord: 'pain', pronunciation: 'pan', category: 'food_drink' } },
    { name: 'Pomme', nameEn: 'Apple', type: 'food', category: 'food_drink', weight: 4, languageLearning: { targetWord: 'pomme', pronunciation: 'pom', category: 'food_drink' } },
    { name: 'Bougie', nameEn: 'Candle', type: 'tool', category: 'tools', weight: 3, languageLearning: { targetWord: 'bougie', pronunciation: 'boo-zhee', category: 'tools' } },
    { name: 'Bourse de pièces', nameEn: 'Coin pouch', type: 'collectible', category: 'treasure', rarity: 'uncommon', value: 10, weight: 1, languageLearning: { targetWord: 'bourse de pièces', pronunciation: 'boors duh pee-ess', category: 'treasure' } },
    { name: 'Héritage familial', nameEn: 'Family heirloom', type: 'collectible', category: 'treasure', rarity: 'rare', value: 40, weight: 1, languageLearning: { targetWord: 'héritage familial', pronunciation: 'ay-ree-tahzh fam-ee-lee-al', category: 'treasure' } },
  ],
  outdoor: [
    { name: 'Pierre', nameEn: 'Stone', type: 'material', category: 'materials', weight: 5, languageLearning: { targetWord: 'pierre', pronunciation: 'pee-ehr', category: 'materials' } },
    { name: 'Bâton', nameEn: 'Stick', type: 'material', category: 'materials', weight: 5, languageLearning: { targetWord: 'bâton', pronunciation: 'bah-ton', category: 'materials' } },
    { name: 'Champignon', nameEn: 'Mushroom', type: 'food', category: 'food_drink', weight: 3, languageLearning: { targetWord: 'champignon', pronunciation: 'shom-pee-nyon', category: 'food_drink' } },
    { name: 'Herbe', nameEn: 'Herb', type: 'consumable', category: 'consumables', weight: 3, languageLearning: { targetWord: 'herbe', pronunciation: 'ehrb', category: 'consumables' } },
    { name: 'Vieille pièce', nameEn: 'Old coin', type: 'collectible', category: 'treasure', rarity: 'uncommon', value: 5, weight: 1, languageLearning: { targetWord: 'vieille pièce', pronunciation: 'vyay pee-ess', category: 'treasure' } },
  ],
  _default: [
    { name: 'Pain', nameEn: 'Bread', type: 'food', category: 'food_drink', weight: 4, languageLearning: { targetWord: 'pain', pronunciation: 'pan', category: 'food_drink' } },
    { name: 'Bougie', nameEn: 'Candle', type: 'tool', category: 'tools', weight: 3, languageLearning: { targetWord: 'bougie', pronunciation: 'boo-zhee', category: 'tools' } },
    { name: 'Corde', nameEn: 'Rope', type: 'tool', category: 'tools', weight: 3, languageLearning: { targetWord: 'corde', pronunciation: 'kord', category: 'tools' } },
    { name: 'Pièce', nameEn: 'Coin', type: 'collectible', category: 'treasure', value: 3, weight: 2, languageLearning: { targetWord: 'pièce', pronunciation: 'pee-ess', category: 'treasure' } },
  ],
};

/** Clue items that can appear with 5% probability in any container. */
const CLUE_ITEMS: LootEntry[] = [
  { name: 'Page déchirée', nameEn: 'Torn page', type: 'clue', category: 'clues', rarity: 'rare', value: 0, weight: 1, languageLearning: { targetWord: 'page déchirée', pronunciation: 'pahzh day-shee-ray', category: 'clues' } },
  { name: 'Note cryptique', nameEn: 'Cryptic note', type: 'clue', category: 'clues', rarity: 'rare', value: 0, weight: 1, languageLearning: { targetWord: 'note cryptique', pronunciation: 'noht kreep-teek', category: 'clues' } },
  { name: 'Symbole gravé', nameEn: 'Engraved symbol', type: 'clue', category: 'clues', rarity: 'rare', value: 0, weight: 1, languageLearning: { targetWord: 'symbole gravé', pronunciation: 'sam-bol grah-vay', category: 'clues' } },
  { name: 'Lettre ancienne', nameEn: 'Old letter', type: 'clue', category: 'clues', rarity: 'rare', value: 0, weight: 1, languageLearning: { targetWord: 'lettre ancienne', pronunciation: 'letr on-see-en', category: 'clues' } },
];

/** Minimum and maximum items per container type. */
const CONTAINER_ITEM_COUNTS: Record<ContainerType, { min: number; max: number }> = {
  chest: { min: 2, max: 5 },
  barrel: { min: 1, max: 3 },
  crate: { min: 1, max: 4 },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Resolve a business/building type string to a loot table key. */
export function resolveLootTableKey(businessType?: string, buildingType?: string): string {
  const bt = (businessType || buildingType || '').toLowerCase();
  if (bt.includes('tavern') || bt.includes('inn') || bt.includes('bar') || bt.includes('pub')) return 'tavern';
  if (bt.includes('bakery') || bt.includes('boulangerie') || bt.includes('baker')) return 'bakery';
  if (bt.includes('library') || bt.includes('bibliothèque')) return 'library';
  if (bt.includes('church') || bt.includes('chapel') || bt.includes('église') || bt.includes('cathedral')) return 'church';
  if (bt.includes('farm') || bt.includes('ferme') || bt.includes('ranch')) return 'farm';
  if (bt.includes('blacksmith') || bt.includes('forge') || bt.includes('forgeron')) return 'blacksmith';
  if (bt.includes('workshop') || bt.includes('atelier')) return 'workshop';
  if (bt.includes('shop') || bt.includes('store') || bt.includes('market')) return 'shop';
  if (bt.includes('warehouse') || bt.includes('storage')) return 'warehouse';
  if (bt.includes('residence') || bt.includes('house') || bt.includes('home')) return 'residence';
  return '_default';
}

/** Weighted random pick from a loot table using a provided random function. */
export function weightedPick(entries: LootEntry[], random: () => number = Math.random): LootEntry {
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = random() * totalWeight;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1];
}

/** Generate items for a container with deterministic seeding. */
export function generateContainerItems(
  containerType: ContainerType,
  lootTableKey: string,
  containerId: string,
  questObjectives?: QuestItemObjective[],
): InventoryItem[] {
  const seed = hashString(containerId);
  const random = seededRandom(seed);

  const table = LOOT_TABLES[lootTableKey] || LOOT_TABLES['_default'];
  const counts = CONTAINER_ITEM_COUNTS[containerType];
  const count = Math.floor(random() * (counts.max - counts.min + 1)) + counts.min;

  const items: InventoryItem[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const entry = weightedPick(table, random);
    // Avoid exact duplicates by name in one container
    if (usedNames.has(entry.name) && table.length > 1) {
      const retry = weightedPick(table, random);
      if (!usedNames.has(retry.name)) {
        items.push(lootEntryToItem(retry, containerId, i));
        usedNames.add(retry.name);
        continue;
      }
    }
    items.push(lootEntryToItem(entry, containerId, i));
    usedNames.add(entry.name);
  }

  // Quest item injection: 30% chance per matching objective
  if (questObjectives) {
    for (const obj of questObjectives) {
      if (obj.buildingContexts.includes(lootTableKey) && random() < 0.3) {
        items.push({
          id: `${containerId}_quest_${obj.questId}`,
          name: obj.itemName,
          description: `Quest item`,
          type: 'quest_item' as InventoryItem['type'],
          quantity: 1,
          value: 0,
          category: 'quest',
          rarity: 'uncommon',
          questId: obj.questId,
          tradeable: false,
        });
        break; // Only inject one quest item per container
      }
    }
  }

  // 5% chance of a clue item
  if (random() < 0.05) {
    const clue = CLUE_ITEMS[Math.floor(random() * CLUE_ITEMS.length)];
    items.push(lootEntryToItem(clue, containerId, items.length, true));
  }

  return items;
}

function lootEntryToItem(
  entry: LootEntry,
  containerId: string,
  index: number,
  isClue = false,
): InventoryItem {
  return {
    id: `${containerId}_item_${index}`,
    name: entry.name,
    description: entry.nameEn,
    type: (isClue ? 'clue' : entry.type) as InventoryItem['type'],
    quantity: 1,
    value: entry.value ?? 1,
    category: isClue ? 'clues' : entry.category,
    rarity: entry.rarity ?? 'common',
    tradeable: !isClue,
    languageLearningData: {
      targetWord: entry.languageLearning.targetWord,
      targetLanguage: 'French',
      pronunciation: entry.languageLearning.pronunciation,
      category: entry.languageLearning.category,
    },
  };
}

// ── Container mesh colors ───────────────────────────────────────────────────

const CONTAINER_COLORS: Record<ContainerType, Color3> = {
  chest: new Color3(0.55, 0.35, 0.12),
  barrel: new Color3(0.5, 0.3, 0.12),
  crate: new Color3(0.4, 0.32, 0.2),
};

const CONTAINER_DIMENSIONS: Record<ContainerType, { width: number; height: number; depth: number }> = {
  chest: { width: 1.2, height: 0.7, depth: 0.8 },
  barrel: { width: 0.8, height: 1.2, depth: 0.8 },
  crate: { width: 0.9, height: 0.9, depth: 0.9 },
};

// ── System ──────────────────────────────────────────────────────────────────

export class ContainerSpawnSystem {
  private scene: Scene;
  private eventBus: GameEventBus | null;
  private containers: Map<string, ContainerData> = new Map();
  private outdoorMeshes: Mesh[] = [];

  /** Callback invoked when a container is opened with its items. */
  public onContainerOpened: ((container: ContainerData) => void) | null = null;

  /** Optional provider of active quest collect_item objectives for loot injection. */
  public questObjectiveProvider: (() => QuestItemObjective[]) | null = null;

  constructor(scene: Scene, eventBus?: GameEventBus) {
    this.scene = scene;
    this.eventBus = eventBus ?? null;
  }

  // ── Interior containers ─────────────────────────────────────────────────

  /**
   * Register interior container meshes from a generated interior.
   * Call after BuildingInteriorGenerator.generateInterior().
   * Scans furniture meshes for `metadata.isContainer` and populates them.
   */
  registerInteriorContainers(
    furnitureMeshes: Mesh[],
    buildingId: string,
    businessType?: string,
    buildingType?: string,
  ): ContainerData[] {
    const registered: ContainerData[] = [];
    const lootKey = resolveLootTableKey(businessType, buildingType);
    const questObjectives = this.questObjectiveProvider?.() ?? undefined;

    for (const mesh of furnitureMeshes) {
      if (!mesh.metadata?.isContainer) continue;

      const containerId = mesh.metadata.containerId || `container_${buildingId}_${mesh.name}`;

      // Skip already registered
      if (this.containers.has(containerId)) continue;

      const containerType = mesh.metadata.containerType as ContainerType;
      const items = generateContainerItems(containerType, lootKey, containerId, questObjectives);

      const data: ContainerData = {
        id: containerId,
        type: containerType,
        items,
        opened: false,
        buildingId,
        location: 'interior',
        mesh,
      };

      this.containers.set(containerId, data);
      registered.push(data);
    }

    return registered;
  }

  // ── Outdoor containers ──────────────────────────────────────────────────

  /**
   * Spawn outdoor containers near building exteriors.
   * Places containers at the provided spawn points.
   */
  spawnOutdoorContainers(spawnPoints: OutdoorSpawnPoint[]): ContainerData[] {
    const spawned: ContainerData[] = [];
    const questObjectives = this.questObjectiveProvider?.() ?? undefined;

    for (const point of spawnPoints) {
      const containerId = `outdoor_${point.containerType}_${point.position.x.toFixed(0)}_${point.position.z.toFixed(0)}`;

      // Skip duplicates
      if (this.containers.has(containerId)) continue;

      const lootKey = point.businessType
        ? resolveLootTableKey(point.businessType)
        : 'outdoor';
      const items = generateContainerItems(point.containerType, lootKey, containerId, questObjectives);

      const mesh = this.createOutdoorContainerMesh(containerId, point.containerType, point.position);

      const data: ContainerData = {
        id: containerId,
        type: point.containerType,
        items,
        opened: false,
        buildingId: point.buildingId,
        location: 'outdoor',
        mesh,
      };

      this.containers.set(containerId, data);
      this.outdoorMeshes.push(mesh);
      spawned.push(data);
    }

    return spawned;
  }

  /**
   * Generate outdoor spawn points around a building's exterior.
   * Places 0-2 containers at the sides/back of the building.
   */
  generateOutdoorSpawnPoints(
    buildingPosition: Vector3,
    buildingWidth: number,
    buildingDepth: number,
    buildingRotation: number,
    buildingId: string,
    businessType?: string,
  ): OutdoorSpawnPoint[] {
    const points: OutdoorSpawnPoint[] = [];

    // 50% chance for any outdoor container at each potential spot
    const cos = Math.cos(buildingRotation);
    const sin = Math.sin(buildingRotation);

    // Right side
    if (Math.random() < 0.5) {
      const localX = buildingWidth / 2 + 1.5;
      const localZ = 0;
      points.push({
        position: new Vector3(
          buildingPosition.x + cos * localX - sin * localZ,
          buildingPosition.y,
          buildingPosition.z + sin * localX + cos * localZ,
        ),
        containerType: Math.random() < 0.5 ? 'barrel' : 'crate',
        buildingId,
        businessType,
      });
    }

    // Back side
    if (Math.random() < 0.4) {
      const localX = (Math.random() - 0.5) * buildingWidth * 0.6;
      const localZ = -(buildingDepth / 2 + 1.5);
      points.push({
        position: new Vector3(
          buildingPosition.x + cos * localX - sin * localZ,
          buildingPosition.y,
          buildingPosition.z + sin * localX + cos * localZ,
        ),
        containerType: Math.random() < 0.3 ? 'chest' : 'crate',
        buildingId,
        businessType,
      });
    }

    return points;
  }

  // ── Interaction ───────────────────────────────────────────────────────

  /**
   * Attempt to open a container by its mesh. Returns the container data
   * if successful, or null if the mesh isn't a container or is already opened.
   */
  openContainerByMesh(mesh: Mesh): ContainerData | null {
    if (!mesh.metadata?.isContainer) return null;

    const containerId = mesh.metadata.containerId;
    if (!containerId) return null;

    return this.openContainer(containerId);
  }

  /**
   * Open a container by ID. Returns the container data if found and not
   * already opened, null otherwise.
   */
  openContainer(containerId: string): ContainerData | null {
    const container = this.containers.get(containerId);
    if (!container || container.opened) return null;

    container.opened = true;

    // Emit event
    this.eventBus?.emit({
      type: 'container_opened',
      containerId: container.id,
      containerType: container.type,
      buildingId: container.buildingId,
      location: container.location,
      itemCount: container.items.length,
    });

    // Notify callback
    this.onContainerOpened?.(container);

    return container;
  }

  /**
   * Check if a mesh is an unopened container.
   */
  isUnopenedContainer(mesh: Mesh): boolean {
    if (!mesh.metadata?.isContainer || !mesh.metadata.containerId) return false;
    const container = this.containers.get(mesh.metadata.containerId);
    return !!container && !container.opened;
  }

  /**
   * Get a container by ID.
   */
  getContainer(containerId: string): ContainerData | undefined {
    return this.containers.get(containerId);
  }

  /**
   * Get all registered containers.
   */
  getAllContainers(): ContainerData[] {
    return Array.from(this.containers.values());
  }

  /**
   * Get count of containers by location type.
   */
  getContainerCounts(): { interior: number; outdoor: number; opened: number; total: number } {
    let interior = 0;
    let outdoor = 0;
    let opened = 0;
    this.containers.forEach((c) => {
      if (c.location === 'interior') interior++;
      else outdoor++;
      if (c.opened) opened++;
    });
    return { interior, outdoor, opened, total: this.containers.size };
  }

  // ── Mesh creation ─────────────────────────────────────────────────────

  private createOutdoorContainerMesh(
    containerId: string,
    containerType: ContainerType,
    position: Vector3,
  ): Mesh {
    const dims = CONTAINER_DIMENSIONS[containerType];
    const color = CONTAINER_COLORS[containerType];

    const mesh = MeshBuilder.CreateBox(
      `outdoor_container_${containerId}`,
      { width: dims.width, height: dims.height, depth: dims.depth },
      this.scene,
    );
    mesh.position = position.clone();
    mesh.position.y += dims.height / 2;

    const mat = new StandardMaterial(`outdoor_container_${containerId}_mat`, this.scene);
    mat.diffuseColor = color;
    mat.specularColor = new Color3(0.05, 0.05, 0.05);
    mesh.material = mat;

    mesh.isPickable = true;
    mesh.checkCollisions = true;
    mesh.metadata = {
      isContainer: true,
      containerType,
      containerId,
      location: 'outdoor',
    };

    return mesh;
  }

  // ── Cleanup ───────────────────────────────────────────────────────────

  /**
   * Remove all containers associated with a building (for when leaving interior).
   * Does NOT dispose interior furniture meshes (owned by BuildingInteriorGenerator).
   */
  clearBuildingContainers(buildingId: string): void {
    const toDelete: string[] = [];
    this.containers.forEach((container, id) => {
      if (container.buildingId === buildingId && container.location === 'interior') {
        toDelete.push(id);
      }
    });
    toDelete.forEach((id) => this.containers.delete(id));
  }

  /**
   * Dispose all outdoor container meshes and clear all container data.
   */
  dispose(): void {
    for (const mesh of this.outdoorMeshes) {
      mesh.dispose();
    }
    this.outdoorMeshes = [];
    this.containers.clear();
  }
}
