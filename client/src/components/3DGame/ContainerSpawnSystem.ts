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
  type: string;
  category?: string;
  rarity?: InventoryItem['rarity'];
  value?: number;
  /** Weight for random selection (higher = more likely). */
  weight: number;
}

/** Outdoor spawn point for a container near a building. */
export interface OutdoorSpawnPoint {
  position: Vector3;
  containerType: ContainerType;
  buildingId?: string;
  businessType?: string;
}

// ── Loot tables by context ──────────────────────────────────────────────────

const LOOT_TABLES: Record<string, LootEntry[]> = {
  tavern: [
    { name: 'Ale', type: 'drink', category: 'food_drink', weight: 5 },
    { name: 'Bread', type: 'food', category: 'food_drink', weight: 4 },
    { name: 'Cheese', type: 'food', category: 'food_drink', weight: 3 },
    { name: 'Wine Bottle', type: 'drink', category: 'food_drink', rarity: 'uncommon', value: 8, weight: 2 },
    { name: 'Coin Pouch', type: 'collectible', category: 'treasure', rarity: 'uncommon', value: 15, weight: 1 },
  ],
  shop: [
    { name: 'Thread', type: 'material', category: 'crafting', weight: 4 },
    { name: 'Cloth', type: 'material', category: 'crafting', weight: 3 },
    { name: 'Candle', type: 'tool', category: 'tools', weight: 3 },
    { name: 'Small Gem', type: 'collectible', category: 'treasure', rarity: 'rare', value: 25, weight: 1 },
  ],
  workshop: [
    { name: 'Iron Ingot', type: 'material', category: 'crafting', weight: 4 },
    { name: 'Nails', type: 'material', category: 'crafting', weight: 5 },
    { name: 'Hammer', type: 'tool', category: 'tools', weight: 2 },
    { name: 'Steel Fragment', type: 'material', category: 'crafting', rarity: 'uncommon', value: 12, weight: 1 },
  ],
  warehouse: [
    { name: 'Rope', type: 'tool', category: 'tools', weight: 4 },
    { name: 'Crate Nails', type: 'material', category: 'crafting', weight: 4 },
    { name: 'Lantern Oil', type: 'consumable', category: 'consumables', weight: 3 },
    { name: 'Stored Goods', type: 'material', category: 'materials', weight: 3 },
    { name: 'Hidden Stash', type: 'collectible', category: 'treasure', rarity: 'rare', value: 30, weight: 1 },
  ],
  residence: [
    { name: 'Bread', type: 'food', category: 'food_drink', weight: 4 },
    { name: 'Apple', type: 'food', category: 'food_drink', weight: 4 },
    { name: 'Candle', type: 'tool', category: 'tools', weight: 3 },
    { name: 'Coin Pouch', type: 'collectible', category: 'treasure', rarity: 'uncommon', value: 10, weight: 1 },
    { name: 'Family Heirloom', type: 'collectible', category: 'treasure', rarity: 'rare', value: 40, weight: 1 },
  ],
  outdoor: [
    { name: 'Stone', type: 'material', category: 'materials', weight: 5 },
    { name: 'Stick', type: 'material', category: 'materials', weight: 5 },
    { name: 'Mushroom', type: 'food', category: 'food_drink', weight: 3 },
    { name: 'Herb', type: 'consumable', category: 'consumables', weight: 3 },
    { name: 'Old Coin', type: 'collectible', category: 'treasure', rarity: 'uncommon', value: 5, weight: 1 },
  ],
  _default: [
    { name: 'Bread', type: 'food', category: 'food_drink', weight: 4 },
    { name: 'Candle', type: 'tool', category: 'tools', weight: 3 },
    { name: 'Rope', type: 'tool', category: 'tools', weight: 3 },
    { name: 'Coin', type: 'collectible', category: 'treasure', value: 3, weight: 2 },
  ],
};

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
  if (bt.includes('tavern') || bt.includes('inn') || bt.includes('bar')) return 'tavern';
  if (bt.includes('blacksmith') || bt.includes('forge') || bt.includes('workshop')) return 'workshop';
  if (bt.includes('shop') || bt.includes('store') || bt.includes('market')) return 'shop';
  if (bt.includes('warehouse') || bt.includes('storage')) return 'warehouse';
  if (bt.includes('residence') || bt.includes('house') || bt.includes('home')) return 'residence';
  return '_default';
}

/** Weighted random pick from a loot table. Returns one LootEntry. */
export function weightedPick(entries: LootEntry[]): LootEntry {
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1];
}

/** Generate items for a container. */
export function generateContainerItems(
  containerType: ContainerType,
  lootTableKey: string,
  containerId: string,
): InventoryItem[] {
  const table = LOOT_TABLES[lootTableKey] || LOOT_TABLES['_default'];
  const counts = CONTAINER_ITEM_COUNTS[containerType];
  const count = Math.floor(Math.random() * (counts.max - counts.min + 1)) + counts.min;

  const items: InventoryItem[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    const entry = weightedPick(table);
    // Avoid exact duplicates by name in one container
    if (usedNames.has(entry.name) && table.length > 1) {
      // Try once more
      const retry = weightedPick(table);
      if (!usedNames.has(retry.name)) {
        items.push(lootEntryToItem(retry, containerId, i));
        usedNames.add(retry.name);
        continue;
      }
    }
    items.push(lootEntryToItem(entry, containerId, i));
    usedNames.add(entry.name);
  }

  return items;
}

function lootEntryToItem(entry: LootEntry, containerId: string, index: number): InventoryItem {
  return {
    id: `${containerId}_item_${index}_${Date.now()}`,
    name: entry.name,
    description: `Found in a container`,
    type: entry.type as InventoryItem['type'],
    quantity: 1,
    value: entry.value ?? Math.floor(Math.random() * 5) + 1,
    category: entry.category,
    rarity: entry.rarity ?? 'common',
    tradeable: true,
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

    for (const mesh of furnitureMeshes) {
      if (!mesh.metadata?.isContainer) continue;

      const containerId = mesh.metadata.containerId || `container_${buildingId}_${mesh.name}`;

      // Skip already registered
      if (this.containers.has(containerId)) continue;

      const containerType = mesh.metadata.containerType as ContainerType;
      const items = generateContainerItems(containerType, lootKey, containerId);

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

    for (const point of spawnPoints) {
      const containerId = `outdoor_${point.containerType}_${point.position.x.toFixed(0)}_${point.position.z.toFixed(0)}`;

      // Skip duplicates
      if (this.containers.has(containerId)) continue;

      const lootKey = point.businessType
        ? resolveLootTableKey(point.businessType)
        : 'outdoor';
      const items = generateContainerItems(point.containerType, lootKey, containerId);

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
