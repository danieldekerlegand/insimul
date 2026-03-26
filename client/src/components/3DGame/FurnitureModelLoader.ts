/**
 * FurnitureModelLoader
 *
 * Loads and caches glTF furniture model templates for use in building interiors.
 * Maps furniture types (table, chair, barrel, etc.) to Polyhaven model paths.
 * Templates are loaded once and cloned for each furniture instance.
 */

import {
  Scene,
  Mesh,
  Vector3,
  SceneLoader,
} from '@babylonjs/core';
import {
  POLYHAVEN_FURNITURE_BASE,
  POLYHAVEN_PROPS_BASE,
} from '../../../../shared/asset-paths';

/** Mapping of furniture type → relative model path (from client/public/) */
export const FURNITURE_MODEL_PATHS: Record<string, string> = {
  table: `${POLYHAVEN_FURNITURE_BASE}/WoodenTable_01/WoodenTable_01.gltf`,
  display_table: `${POLYHAVEN_FURNITURE_BASE}/wooden_table_02/wooden_table_02.gltf`,
  chair: `${POLYHAVEN_FURNITURE_BASE}/GreenChair_01/GreenChair_01.gltf`,
  stool: `${POLYHAVEN_FURNITURE_BASE}/wooden_stool_01/wooden_stool_01.gltf`,
  bed: `${POLYHAVEN_FURNITURE_BASE}/GothicBed_01/GothicBed_01.gltf`,
  shelf: `${POLYHAVEN_FURNITURE_BASE}/Shelf_01/Shelf_01.gltf`,
  bookshelf: `${POLYHAVEN_FURNITURE_BASE}/wooden_bookshelf_worn/wooden_bookshelf_worn.gltf`,
  wardrobe: `${POLYHAVEN_FURNITURE_BASE}/GothicCabinet_01/GothicCabinet_01.gltf`,
  counter: `${POLYHAVEN_FURNITURE_BASE}/ClassicConsole_01/ClassicConsole_01.gltf`,
  barrel: `${POLYHAVEN_PROPS_BASE}/Barrel_01/Barrel_01.gltf`,
  crate: `${POLYHAVEN_PROPS_BASE}/wooden_crate_01/wooden_crate_01.gltf`,
  chest: `${POLYHAVEN_PROPS_BASE}/treasure_chest/treasure_chest.gltf`,
};

/**
 * Furniture types that use procedural mesh generation only (no glTF model).
 * Listed here for documentation; the BuildingInteriorGenerator handles their geometry.
 */
export const PROCEDURAL_FURNITURE_TYPES = [
  'bench', 'forge', 'anvil', 'altar', 'pew', 'workbench', 'pillar',
  'oven', 'loom', 'display_case', 'lectern', 'throne', 'bed_single',
  'bed_double', 'desk', 'cauldron', 'weapon_rack', 'armor_stand',
] as const;

export interface FurnitureTemplate {
  mesh: Mesh;
  originalHeight: number;
  originalWidth: number;
  originalDepth: number;
}

export class FurnitureModelLoader {
  private scene: Scene;
  private templates: Map<string, FurnitureTemplate> = new Map();
  private loading: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Load all furniture model templates. Call once during scene setup.
   * Models that fail to load are silently skipped (procedural fallback will be used).
   */
  public async loadAll(): Promise<void> {
    if (this.loading) return;
    this.loading = true;

    // In exported games (file:// protocol), polyhaven furniture models are not bundled — skip
    if (typeof window !== 'undefined' && window.location?.protocol === 'file:') {
      console.log('[FurnitureModelLoader] Skipping — furniture models not bundled in export');
      this.loading = false;
      return;
    }

    const entries = Object.entries(FURNITURE_MODEL_PATHS);
    const promises = entries.map(([type, path]) => this.loadTemplate(type, path));
    await Promise.allSettled(promises);

    this.loading = false;
  }

  private async loadTemplate(type: string, relativePath: string): Promise<void> {
    try {
      const cleanPath = relativePath.replace(/^\//, '');
      const lastSlash = cleanPath.lastIndexOf('/');
      const rootUrl = '/' + cleanPath.substring(0, lastSlash + 1);
      const fileName = cleanPath.substring(lastSlash + 1);

      const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, this.scene);
      if (result.meshes.length === 0) return;

      const root = result.meshes[0] as Mesh;

      // Disable template (it's only used for cloning)
      root.setEnabled(false);
      for (const child of result.meshes) {
        child.setEnabled(false);
      }

      // Measure bounding box for scaling
      root.computeWorldMatrix(true);
      let oMin = new Vector3(Infinity, Infinity, Infinity);
      let oMax = new Vector3(-Infinity, -Infinity, -Infinity);
      for (const child of result.meshes) {
        child.computeWorldMatrix(true);
        const bi = child.getBoundingInfo();
        oMin = Vector3.Minimize(oMin, bi.boundingBox.minimumWorld);
        oMax = Vector3.Maximize(oMax, bi.boundingBox.maximumWorld);
      }

      const height = isFinite(oMax.y - oMin.y) ? Math.max(oMax.y - oMin.y, 0.01) : 1;
      const width = isFinite(oMax.x - oMin.x) ? Math.max(oMax.x - oMin.x, 0.01) : 1;
      const depth = isFinite(oMax.z - oMin.z) ? Math.max(oMax.z - oMin.z, 0.01) : 1;

      this.templates.set(type, {
        mesh: root,
        originalHeight: height,
        originalWidth: width,
        originalDepth: depth,
      });
    } catch (err) {
      console.warn(`[FurnitureModelLoader] Failed to load ${type} (${relativePath}):`, err);
    }
  }

  /** Get a template for the given furniture type, if loaded. */
  public getTemplate(type: string): FurnitureTemplate | undefined {
    return this.templates.get(type);
  }

  /** Check if a model template is available for a furniture type. */
  public hasTemplate(type: string): boolean {
    return this.templates.has(type);
  }

  /** Get all loaded template types. */
  public getLoadedTypes(): string[] {
    return Array.from(this.templates.keys());
  }

  /**
   * Clone a furniture template, scaled to fit the given target dimensions.
   * Returns null if no template available for the type.
   */
  public cloneForFurniture(
    type: string,
    name: string,
    targetWidth: number,
    targetHeight: number,
    targetDepth: number,
  ): Mesh | null {
    const template = this.templates.get(type);
    if (!template) return null;

    let cloned: Mesh | null = null;

    // glTF root nodes may have 0 vertices — use instantiateHierarchy
    if (
      template.mesh.getTotalVertices() === 0 &&
      template.mesh.getChildMeshes().length > 0
    ) {
      const root = template.mesh.instantiateHierarchy(null, undefined, (source, clone) => {
        clone.name = `${source.name}_${name}`;
      });
      if (root) {
        root.setEnabled(true);
        root.getChildMeshes().forEach((m) => m.setEnabled(true));
        cloned = root as Mesh;
      }
    } else {
      cloned = template.mesh.clone(name, null, false, false) as Mesh;
    }

    if (!cloned) return null;

    cloned.setEnabled(true);

    // Scale to match target dimensions
    const scaleX = targetWidth / template.originalWidth;
    const scaleY = targetHeight / template.originalHeight;
    const scaleZ = targetDepth / template.originalDepth;
    cloned.scaling = new Vector3(scaleX, scaleY, scaleZ);

    return cloned;
  }

  /** Dispose all loaded templates. */
  public dispose(): void {
    this.templates.forEach((t) => {
      if (!t.mesh.isDisposed()) {
        t.mesh.dispose(false, true);
      }
    });
    this.templates.clear();
  }
}
