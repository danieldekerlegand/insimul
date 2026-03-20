/**
 * InteriorItemManager
 *
 * Spawns item props inside building interiors based on world items
 * assigned to that building (via item.metadata.businessId / residenceId).
 * Items are placed at contextually appropriate positions within the room
 * and are interactive (pickable with objectRole metadata).
 */

import {
  Scene,
  Mesh,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';
import type { InteriorLayout } from './BuildingInteriorGenerator';

export interface InteriorItemData {
  id: string;
  name: string;
  objectRole?: string | null;
  itemType: string;
  icon?: string | null;
  metadata?: Record<string, any> | null;
  possessable?: boolean | null;
  languageLearningData?: any;
}

interface ItemPlacement {
  offsetX: number;
  offsetZ: number;
  height: number;
}

/**
 * Maps business/building types to placement positions for items within interiors.
 * Positions are relative to the interior center. Items are placed on surfaces
 * (counters, shelves, tables) that match the furniture layout.
 */
const INTERIOR_ITEM_PLACEMENTS: Record<string, ItemPlacement[]> = {
  tavern: [
    { offsetX: 0, offsetZ: 0, height: 1.3 },        // on bar counter
    { offsetX: -2, offsetZ: -1.5, height: 0.9 },     // on table
    { offsetX: 2, offsetZ: -1.5, height: 0.9 },      // on table
    { offsetX: -2, offsetZ: 1.5, height: 0.9 },      // on table
    { offsetX: 2, offsetZ: 1.5, height: 0.9 },       // on table
    { offsetX: -5, offsetZ: 4.5, height: 0 },         // near barrel
    { offsetX: 5, offsetZ: 4.5, height: 0 },          // near barrel
    { offsetX: 3, offsetZ: 0, height: 0 },            // floor
  ],
  shop: [
    { offsetX: 0, offsetZ: -2, height: 1.1 },        // on counter
    { offsetX: -4, offsetZ: 0, height: 0.8 },         // on shelf
    { offsetX: 4, offsetZ: 0, height: 0.8 },          // on shelf
    { offsetX: -4, offsetZ: 1.5, height: 1.4 },       // upper shelf
    { offsetX: 4, offsetZ: 1.5, height: 1.4 },        // upper shelf
    { offsetX: 0, offsetZ: 2, height: 1.0 },          // on display table
    { offsetX: 3, offsetZ: 4, height: 0 },            // near crate
    { offsetX: -2, offsetZ: 3, height: 0 },           // floor
  ],
  blacksmith: [
    { offsetX: 0, offsetZ: 1.5, height: 0.9 },       // on anvil
    { offsetX: 0, offsetZ: 4, height: 1.1 },          // on workbench
    { offsetX: -5, offsetZ: 1, height: 0.5 },         // on tool rack
    { offsetX: 4, offsetZ: -2, height: 0 },           // near barrel
    { offsetX: -3, offsetZ: -2, height: 0 },          // floor
    { offsetX: 2, offsetZ: 3, height: 1.1 },          // on workbench
  ],
  temple: [
    { offsetX: 0, offsetZ: 8, height: 1.3 },         // on altar
    { offsetX: -3, offsetZ: 6, height: 0 },           // near altar
    { offsetX: 3, offsetZ: 6, height: 0 },            // near altar
    { offsetX: 0, offsetZ: 0, height: 0 },            // center aisle
  ],
  guild: [
    { offsetX: 0, offsetZ: 0, height: 0.9 },         // on meeting table
    { offsetX: -2, offsetZ: 0, height: 0.9 },         // on meeting table
    { offsetX: 2, offsetZ: 0, height: 0.9 },          // on meeting table
    { offsetX: 0, offsetZ: 6.5, height: 0.8 },        // on bookshelf
    { offsetX: -3, offsetZ: 6.5, height: 1.2 },       // on bookshelf
    { offsetX: 3, offsetZ: 6.5, height: 1.2 },        // on bookshelf
  ],
  residence: [
    { offsetX: 1, offsetZ: 0, height: 0.9 },         // on table
    { offsetX: 2, offsetZ: 2, height: 0 },            // near chest
    { offsetX: -2, offsetZ: 0, height: 0 },           // near wardrobe
    { offsetX: 0, offsetZ: -1, height: 0 },           // floor center
  ],
  warehouse: [
    { offsetX: -3, offsetZ: -1, height: 0 },          // near crates
    { offsetX: 0, offsetZ: 1.5, height: 0 },          // near barrels
    { offsetX: 3, offsetZ: 3, height: 0 },            // near crates
    { offsetX: -3, offsetZ: 3, height: 0 },           // near barrels
    { offsetX: 0, offsetZ: -2, height: 0 },           // floor
    { offsetX: -6, offsetZ: 0, height: 0.8 },         // on shelf
    { offsetX: -6, offsetZ: 2, height: 1.4 },         // upper shelf
    { offsetX: 3, offsetZ: -3, height: 0 },           // floor
  ],
};

/** Default placements when building type is not recognized. */
const DEFAULT_ITEM_PLACEMENTS: ItemPlacement[] = [
  { offsetX: 0, offsetZ: 0, height: 0 },
  { offsetX: 2, offsetZ: 2, height: 0 },
  { offsetX: -2, offsetZ: 2, height: 0 },
  { offsetX: 2, offsetZ: -2, height: 0 },
];

/** Maps item types to fallback colors for procedural meshes. */
const ITEM_TYPE_COLORS: Record<string, Color3> = {
  food: new Color3(0.7, 0.5, 0.2),
  drink: new Color3(0.3, 0.4, 0.7),
  weapon: new Color3(0.5, 0.5, 0.55),
  armor: new Color3(0.45, 0.4, 0.35),
  tool: new Color3(0.4, 0.35, 0.3),
  material: new Color3(0.5, 0.45, 0.35),
  consumable: new Color3(0.6, 0.3, 0.3),
  collectible: new Color3(0.6, 0.55, 0.3),
  key: new Color3(0.7, 0.65, 0.2),
  quest: new Color3(0.3, 0.6, 0.7),
};

const DEFAULT_ITEM_COLOR = new Color3(0.5, 0.45, 0.4);

export class InteriorItemManager {
  private scene: Scene;
  private spawnedMeshes: Mesh[] = [];
  private objectModelTemplates: Map<string, Mesh>;
  private objectModelOriginalHeights: Map<string, number>;

  constructor(
    scene: Scene,
    objectModelTemplates: Map<string, Mesh>,
    objectModelOriginalHeights: Map<string, number>,
  ) {
    this.scene = scene;
    this.objectModelTemplates = objectModelTemplates;
    this.objectModelOriginalHeights = objectModelOriginalHeights;
  }

  /**
   * Spawn item props for a building interior.
   * Filters worldItems by buildingId (matching businessId or residenceId in metadata),
   * then creates meshes at appropriate positions within the interior.
   */
  public spawnItems(
    buildingId: string,
    interior: InteriorLayout,
    worldItems: InteriorItemData[],
  ): Mesh[] {
    this.clearItems();

    const items = this.getItemsForBuilding(buildingId, worldItems);
    if (items.length === 0) return [];

    const placements = this.getPlacementsForType(
      interior.businessType || interior.buildingType,
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const placement = placements[i % placements.length];

      const mesh = this.createItemMesh(item, i, interior, placement);
      if (mesh) {
        this.spawnedMeshes.push(mesh);
      }
    }

    return [...this.spawnedMeshes];
  }

  /** Remove all spawned interior item meshes. */
  public clearItems(): void {
    for (const mesh of this.spawnedMeshes) {
      if (!mesh.isDisposed()) {
        mesh.dispose(false, true);
      }
    }
    this.spawnedMeshes = [];
  }

  /** Get currently spawned meshes. */
  public getSpawnedMeshes(): Mesh[] {
    return [...this.spawnedMeshes];
  }

  /** Filter world items to those placed in the given building. */
  public getItemsForBuilding(
    buildingId: string,
    worldItems: InteriorItemData[],
  ): InteriorItemData[] {
    return worldItems.filter((item) => {
      const meta = item.metadata;
      if (!meta) return false;
      return meta.businessId === buildingId || meta.residenceId === buildingId;
    });
  }

  /** Get placement positions for a building/business type. */
  private getPlacementsForType(buildingType: string): ItemPlacement[] {
    const bt = (buildingType || '').toLowerCase();

    for (const [key, placements] of Object.entries(INTERIOR_ITEM_PLACEMENTS)) {
      if (bt.includes(key)) return placements;
    }
    return DEFAULT_ITEM_PLACEMENTS;
  }

  /** Create a 3D mesh for an item at the given placement within the interior. */
  private createItemMesh(
    item: InteriorItemData,
    index: number,
    interior: InteriorLayout,
    placement: ItemPlacement,
  ): Mesh | null {
    const meshName = `interior_item_${interior.buildingId}_${index}_${item.id}`;

    // Try to use an asset model template via objectRole
    let mesh = this.tryCreateFromTemplate(item, meshName);

    // Fallback to a procedural box
    if (!mesh) {
      mesh = this.createProceduralItemMesh(item, meshName);
    }

    if (!mesh) return null;

    // Position within interior
    mesh.position = new Vector3(
      interior.position.x + placement.offsetX,
      interior.position.y + placement.height,
      interior.position.z + placement.offsetZ,
    );

    // Make interactive
    mesh.isPickable = true;
    mesh.checkCollisions = true;
    mesh.metadata = {
      objectRole: item.objectRole || item.itemType,
      itemId: item.id,
      interiorItem: true,
    };

    // Propagate metadata to child meshes (for glTF hierarchies)
    mesh.getChildMeshes().forEach((child) => {
      child.isPickable = true;
      child.checkCollisions = true;
      child.metadata = {
        ...(child.metadata || {}),
        objectRole: item.objectRole || item.itemType,
        itemId: item.id,
        interiorItem: true,
      };
    });

    return mesh;
  }

  /** Try to clone a mesh from objectModelTemplates using the item's objectRole. */
  private tryCreateFromTemplate(
    item: InteriorItemData,
    meshName: string,
  ): Mesh | null {
    if (!item.objectRole) return null;

    const template = this.objectModelTemplates.get(item.objectRole);
    if (!template) return null;

    let cloned: Mesh | null = null;

    // glTF root nodes may have 0 vertices — use instantiateHierarchy
    if (
      template.getTotalVertices() === 0 &&
      template.getChildMeshes().length > 0
    ) {
      const root = template.instantiateHierarchy(null, undefined, (source, clone) => {
        clone.name = `${source.name}_${meshName}`;
      });
      if (root) {
        root.setEnabled(true);
        root.getChildMeshes().forEach((m) => m.setEnabled(true));
        cloned = root as Mesh;
      }
    } else {
      cloned = template.clone(meshName, null, false, false) as Mesh;
    }

    if (cloned) {
      cloned.setEnabled(true);
      // Scale to a reasonable interior item size (0.4 units)
      const targetSize = 0.4;
      const origH = this.objectModelOriginalHeights.get(item.objectRole!) || 1;
      const scale = targetSize / origH;
      cloned.scaling = new Vector3(scale, scale, scale);
    }

    return cloned;
  }

  /** Create a simple procedural box mesh as fallback for items without objectRole models. */
  private createProceduralItemMesh(
    item: InteriorItemData,
    meshName: string,
  ): Mesh {
    const mesh = MeshBuilder.CreateBox(
      meshName,
      { width: 0.3, height: 0.3, depth: 0.3 },
      this.scene,
    );
    const mat = new StandardMaterial(`${meshName}_mat`, this.scene);
    mat.diffuseColor = ITEM_TYPE_COLORS[item.itemType] || DEFAULT_ITEM_COLOR;
    mat.specularColor = new Color3(0.15, 0.15, 0.15);
    mesh.material = mat;
    return mesh;
  }

  public dispose(): void {
    this.clearItems();
  }
}
