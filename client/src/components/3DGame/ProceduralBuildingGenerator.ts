/**
 * Procedural Building Generator
 *
 * Generates 3D buildings procedurally based on business/residence types,
 * population, world style, and terrain.
 */

import { Scene, Mesh, AbstractMesh, MeshBuilder, Vector3, StandardMaterial, Color3, Texture, VertexData, DynamicTexture, SceneLoader } from '@babylonjs/core';
import { createDebugLabel } from './DebugLabelUtils';
import "@babylonjs/loaders/glTF";

export interface BuildingStyle {
  name: string;
  baseColor: Color3;
  roofColor: Color3;
  windowColor: Color3;
  doorColor: Color3;
  materialType: 'wood' | 'stone' | 'brick' | 'metal' | 'glass';
  architectureStyle: 'medieval' | 'modern' | 'futuristic' | 'rustic' | 'industrial';
  assetSetId?: string;
}

export interface BuildingSpec {
  id: string;
  type: 'business' | 'residence' | 'municipal';
  businessType?: string;
  floors: number;
  width: number;
  depth: number;
  style: BuildingStyle;
  position: Vector3;
  rotation: number;
  hasChimney?: boolean;
  hasBalcony?: boolean;
  windowCount?: { width: number; height: number };
}

export class ProceduralBuildingGenerator {
  private scene: Scene;
  private buildingMeshes: Map<string, Mesh> = new Map();

  // Optional textures from asset collection to apply to procedural buildings
  private wallTexture: Texture | null = null;
  private roofTexture: Texture | null = null;

  // World-level model overrides by logical role (e.g. 'default', 'smallResidence')
  private roleModelPrototypes: Map<string, Mesh> = new Map();
  // Per-role scale hints from asset metadata (overrides automatic unit detection)
  private roleScaleHints: Map<string, number> = new Map();
  // Per-role original bounding-box heights measured at import time
  private roleOriginalHeights: Map<string, number> = new Map();

  // Building type to architecture mapping
  private static BUILDING_TYPES: Record<string, Partial<BuildingSpec>> = {
    // Businesses
    'Bakery': { floors: 2, width: 12, depth: 10, hasChimney: true },
    'Restaurant': { floors: 2, width: 15, depth: 12 },
    'Tavern': { floors: 2, width: 14, depth: 14, hasBalcony: true },
    'Inn': { floors: 3, width: 16, depth: 14, hasBalcony: true },
    'Market': { floors: 1, width: 20, depth: 15 },
    'Shop': { floors: 2, width: 10, depth: 8 },
    'Blacksmith': { floors: 1, width: 12, depth: 10, hasChimney: true },
    'LawFirm': { floors: 3, width: 12, depth: 10 },
    'Bank': { floors: 2, width: 14, depth: 12 },
    'Hospital': { floors: 3, width: 20, depth: 18 },
    'School': { floors: 2, width: 18, depth: 16 },
    'Church': { floors: 1, width: 16, depth: 24 },
    'Theater': { floors: 2, width: 18, depth: 20 },
    'Library': { floors: 3, width: 16, depth: 14 },
    'ApartmentComplex': { floors: 5, width: 18, depth: 16, hasBalcony: true },
    'Windmill': { floors: 3, width: 10, depth: 10 },
    'Watermill': { floors: 2, width: 14, depth: 12 },
    'Lumbermill': { floors: 1, width: 16, depth: 12, hasChimney: true },
    'Barracks': { floors: 2, width: 18, depth: 14 },
    'Mine': { floors: 1, width: 12, depth: 10 },

    // Residences
    'residence_small': { floors: 1, width: 8, depth: 8 },
    'residence_medium': { floors: 2, width: 10, depth: 10, hasChimney: true },
    'residence_large': { floors: 2, width: 14, depth: 12, hasBalcony: true, hasChimney: true },
    'residence_mansion': { floors: 3, width: 20, depth: 18, hasBalcony: true, hasChimney: true },
  };

  // World style presets
  private static STYLE_PRESETS: Record<string, BuildingStyle> = {
    'medieval_wood': {
      name: 'Medieval Wood',
      baseColor: new Color3(0.55, 0.35, 0.2),
      roofColor: new Color3(0.3, 0.2, 0.15),
      windowColor: new Color3(0.9, 0.9, 0.7),
      doorColor: new Color3(0.4, 0.25, 0.15),
      materialType: 'wood',
      architectureStyle: 'medieval',
      assetSetId: 'medieval_village'
    },
    'medieval_stone': {
      name: 'Medieval Stone',
      baseColor: new Color3(0.6, 0.6, 0.55),
      roofColor: new Color3(0.35, 0.2, 0.15),
      windowColor: new Color3(0.7, 0.8, 0.9),
      doorColor: new Color3(0.3, 0.2, 0.1),
      materialType: 'stone',
      architectureStyle: 'medieval',
      assetSetId: 'medieval_village'
    },
    'modern_concrete': {
      name: 'Modern Concrete',
      baseColor: new Color3(0.7, 0.7, 0.7),
      roofColor: new Color3(0.3, 0.3, 0.3),
      windowColor: new Color3(0.6, 0.7, 0.8),
      doorColor: new Color3(0.5, 0.5, 0.5),
      materialType: 'brick',
      architectureStyle: 'modern',
      assetSetId: 'modern_city'
    },
    'futuristic_metal': {
      name: 'Futuristic Metal',
      baseColor: new Color3(0.6, 0.65, 0.7),
      roofColor: new Color3(0.2, 0.25, 0.3),
      windowColor: new Color3(0.5, 0.7, 0.9),
      doorColor: new Color3(0.3, 0.4, 0.5),
      materialType: 'metal',
      architectureStyle: 'futuristic',
      assetSetId: 'futuristic_city'
    },
    'rustic_cottage': {
      name: 'Rustic Cottage',
      baseColor: new Color3(0.7, 0.5, 0.3),
      roofColor: new Color3(0.5, 0.35, 0.2),
      windowColor: new Color3(0.8, 0.85, 0.7),
      doorColor: new Color3(0.5, 0.3, 0.2),
      materialType: 'wood',
      architectureStyle: 'rustic',
      assetSetId: 'medieval_village'
    }
  };

  constructor(scene: Scene) {
    this.scene = scene;
  }

  private modelPrototypes: Map<string, Mesh> = new Map();
  private assetsInitialized: boolean = false;

  private makeModelKey(assetSetId: string, modelType: string): string {
    return assetSetId + ':' + modelType;
  }

  public async initializeAssets(worldType?: string): Promise<void> {
    if (this.assetsInitialized) {
      return;
    }
    this.assetsInitialized = true;
    // Building models are now loaded via registerRoleModel() from
    // BabylonGame.applyWorld3DConfig(), which resolves asset collection
    // model IDs to actual meshes. No hardcoded paths needed.
  }

  /**
   * Register a world-level model prototype for a logical building role.
   * The mesh is treated as a template and will be cloned per building instance.
   */
  /**
   * Hide all template prototype meshes after building generation is done.
   * Moves them far off-screen and marks them non-visible/non-pickable.
   * We cannot dispose them because instantiateHierarchy shares geometry
   * and materials — disposing the source would destroy all cloned buildings.
   */
  public hidePrototypes(): void {
    const hideOne = (mesh: Mesh) => {
      if (!mesh || mesh.isDisposed()) return;
      mesh.position.y = -10000;
      mesh.setEnabled(false);
      mesh.isPickable = false;
      mesh.isVisible = false;
      mesh.getChildMeshes().forEach((c: AbstractMesh) => {
        c.setEnabled(false);
        c.isVisible = false;
        c.isPickable = false;
      });
    };
    Array.from(this.roleModelPrototypes.values()).forEach(hideOne);
    Array.from(this.modelPrototypes.values()).forEach(hideOne);
    console.log('[BuildingGen] Hidden all prototype templates (moved off-screen)');
  }

  /**
   * Check if a mesh name matches environment/ground mesh patterns.
   * These are Sketchfab export artifacts (ground planes, skyboxes, etc.)
   * that should be stripped from building models.
   */
  private static isEnvMesh(name: string): boolean {
    const lower = name.toLowerCase();
    if (lower.startsWith('ground') || lower.startsWith('backdrop') ||
        lower.startsWith('terrain') || lower.startsWith('sky') ||
        lower.startsWith('environment')) return true;
    if (/^Plane[_.]/.test(name) || /^pPlane/.test(name)) return true;
    return false;
  }

  public registerRoleModel(role: string, mesh: Mesh): void {
    if (!role || !mesh) return;
    mesh.setEnabled(false);

    // Strip environment/ground meshes from the prototype BEFORE normalizing.
    // This ensures the normalization height matches only the actual building
    // geometry, consistent with the env-mesh filtering on clones.
    const envToDispose = mesh.getChildMeshes(false)
      .filter(c => ProceduralBuildingGenerator.isEnvMesh(c.name));
    if (envToDispose.length > 0) {
      console.log(`[BuildingGen] Stripping ${envToDispose.length} env meshes from prototype "${role}": ${envToDispose.map(m => m.name).join(', ')}`);
      for (const m of envToDispose) { m.dispose(); }
    }

    // Measure the original bounding-box height of the prototype (at import
    // scale) and store it.  We do NOT modify the prototype's scaling here;
    // instead, adjustModelToSpec computes an absolute scale from this height.
    mesh.computeWorldMatrix(true);
    const children = mesh.getChildMeshes(false);
    let minV = new Vector3(Infinity, Infinity, Infinity);
    let maxV = new Vector3(-Infinity, -Infinity, -Infinity);
    for (const child of children) {
      child.computeWorldMatrix(true);
      const bi = child.getBoundingInfo();
      minV = Vector3.Minimize(minV, bi.boundingBox.minimumWorld);
      maxV = Vector3.Maximize(maxV, bi.boundingBox.maximumWorld);
    }
    if (isFinite(minV.x)) {
      const height = maxV.y - minV.y;
      if (height > 0.001) {
        this.roleOriginalHeights.set(role, height);
        console.log(`[BuildingGen] Measured role="${role}" originalH=${height.toFixed(2)}`);
      }
    }

    // Extract per-model scaleHint from asset metadata (set during registration
    // in BabylonGame). scaleHint tells us the factor to convert model units to
    // real-world meters, so realHeight = originalH * scaleHint.
    const scaleHint = (mesh.metadata as any)?.scaleHint;
    if (scaleHint != null && scaleHint > 0) {
      this.roleScaleHints.set(role, scaleHint);
      console.log(`[BuildingGen] role="${role}" scaleHint=${scaleHint}`);
    }

    this.roleModelPrototypes.set(role, mesh);
  }

  private async loadBuildingModel(
    assetSetId: string,
    modelType: string,
    rootUrl: string,
    fileName: string
  ): Promise<void> {
    try {
      const result = await SceneLoader.ImportMeshAsync('', rootUrl, fileName, this.scene);
      const mesh = result.meshes.find((m) => m instanceof Mesh) as Mesh | undefined;
      if (!mesh) {
        return;
      }
      mesh.setEnabled(false);
      const key = this.makeModelKey(assetSetId, modelType);
      this.modelPrototypes.set(key, mesh);
    } catch (error) {
      console.warn('Failed to load building model', assetSetId, modelType, error);
    }
  }

  private getModelPrototype(spec: BuildingSpec): Mesh | null {
    const assetSetId = spec.style.assetSetId;
    if (!assetSetId) {
      return null;
    }

    let modelType: string | null = null;

    if (assetSetId === 'medieval_village' && spec.type === 'residence' && spec.businessType === 'residence_small') {
      modelType = 'residence_small';
    }

    if (assetSetId === 'futuristic_city' && spec.type === 'residence' && spec.businessType === 'residence_small') {
      modelType = 'residence_small';
    }

    if (!modelType) {
      return null;
    }

    const key = this.makeModelKey(assetSetId, modelType);
    const prototype = this.modelPrototypes.get(key);
    return prototype || null;
  }

  /**
   * Determine a logical role name for the given building spec, used for
   * world-level model overrides. This is intentionally coarse-grained.
   */
  private getRoleForSpec(spec: BuildingSpec): string | null {
    if (spec.type === 'residence') {
      if (spec.businessType === 'residence_small') return 'smallResidence';
      if (spec.businessType === 'residence_large') return 'largeResidence';
      if (spec.businessType === 'residence_mansion') return 'mansion';
      return 'default';
    }

    if (spec.type === 'business' && spec.businessType) {
      const bt = spec.businessType.toLowerCase();
      if (bt === 'tavern' || bt === 'inn') return 'tavern';
      if (bt === 'shop' || bt === 'market') return 'shop';
      if (bt === 'blacksmith') return 'blacksmith';
      if (bt === 'church') return 'church';
      if (bt === 'library') return 'library';
      if (bt === 'hospital') return 'hospital';
      if (bt === 'school') return 'school';
      if (bt === 'bank') return 'bank';
      if (bt === 'theater') return 'theater';
      if (bt === 'windmill') return 'windmill';
      if (bt === 'watermill') return 'watermill';
      if (bt === 'lumbermill' || bt === 'lumber') return 'lumbermill';
      if (bt === 'barracks' || bt === 'military') return 'barracks';
      if (bt === 'mine' || bt === 'mining') return 'mine';
      return 'default';
    }

    if (spec.type === 'municipal') return 'municipal';

    return 'default';
  }

  /**
   * Get building style based on world type and terrain
   */
  public static getStyleForWorld(worldType?: string, terrain?: string): BuildingStyle {
    const type = (worldType || '').toLowerCase();
    const terr = (terrain || '').toLowerCase();

    if (type.includes('medieval') || type.includes('fantasy')) {
      if (terr.includes('forest') || terr.includes('rural')) {
        return ProceduralBuildingGenerator.STYLE_PRESETS['medieval_wood'];
      }
      return ProceduralBuildingGenerator.STYLE_PRESETS['medieval_stone'];
    } else if (type.includes('cyberpunk') || type.includes('sci-fi') || type.includes('futuristic')) {
      return ProceduralBuildingGenerator.STYLE_PRESETS['futuristic_metal'];
    } else if (type.includes('modern')) {
      return ProceduralBuildingGenerator.STYLE_PRESETS['modern_concrete'];
    } else if (terr.includes('rural') || terr.includes('village')) {
      return ProceduralBuildingGenerator.STYLE_PRESETS['rustic_cottage'];
    }

    // Default
    return ProceduralBuildingGenerator.STYLE_PRESETS['medieval_wood'];
  }

  /**
   * Generate a building from specification
   */
  public generateBuilding(spec: BuildingSpec): Mesh {
    console.log(`[BuildingGen] generateBuilding: type="${spec.type}" businessType="${spec.businessType}" floors=${spec.floors}`);
    const parent = new Mesh(`building_${spec.id}`, this.scene);
    parent.position = spec.position.clone();
    parent.rotation.y = spec.rotation;

    // Prefer world-level overrides by logical role, then fall back to
    // style-based assetSet models, and finally to primitive geometry.
    const role = this.getRoleForSpec(spec);
    let modelPrototype: Mesh | null = null;
    if (role) {
      const override = this.roleModelPrototypes.get(role);
      if (override) {
        modelPrototype = override;
        console.log(`[BuildingGen] Using role override: ${role} (mesh: ${override.name})`);
      }
    }

    if (!modelPrototype) {
      modelPrototype = this.getModelPrototype(spec);
      if (modelPrototype) {
        console.log(`[BuildingGen] Using model prototype: ${modelPrototype.name}`);
      }
    }

    if (modelPrototype) {
      // glTF models are a hierarchy: root TransformNode → child Meshes.
      // Use instantiateHierarchy to deep-clone the entire tree.
      const instance = modelPrototype.instantiateHierarchy(
        parent,
        undefined,
        (source, clone) => {
          clone.name = `${source.name}_${spec.id}`;
        }
      );
      if (instance) {
        instance.name = `building_model_${spec.id}`;
        instance.position = Vector3.Zero();

        // Safety net: strip any env meshes that survived cloning
        // (prototypes are already stripped at registration, but clone names may differ)
        const toDispose = instance.getChildMeshes(false)
          .filter(c => ProceduralBuildingGenerator.isEnvMesh(c.name));
        for (const mesh of toDispose) {
          mesh.dispose();
        }

        // Enable all remaining cloned nodes (templates are disabled)
        instance.setEnabled(true);
        instance.getChildMeshes().forEach(m => m.setEnabled(true));
        this.adjustModelToSpec(instance as Mesh, spec, role || undefined);
      }
      this.buildingMeshes.set(spec.id, parent);
      return parent;
    }

    // Create main building structure
    const building = this.createBuildingStructure(spec);
    building.parent = parent;

    // Add roof
    const roof = this.createRoof(spec);
    roof.parent = parent;

    // Add windows
    this.addWindows(spec, building);

    // Add door
    this.addDoor(spec, building);

    // Optional features
    if (spec.hasChimney) {
      const chimney = this.createChimney(spec);
      chimney.parent = parent;
    }

    if (spec.hasBalcony && spec.floors > 1) {
      const balcony = this.createBalcony(spec);
      balcony.parent = parent;
    }

    // Debug label for procedural building fallback
    const label = spec.businessType || spec.type;
    createDebugLabel(this.scene, parent, `BUILDING: ${label}`, (spec.floors * 4) + 6);

    this.buildingMeshes.set(spec.id, parent);
    return parent;
  }

  private adjustModelToSpec(instance: Mesh, spec: BuildingSpec, role?: string): void {
    // Player is ~1.77 units ≈ 1.77 meters.
    // Medieval buildings are taller than modern ones (peaked roofs, thick walls).
    const floorHeight = 5;
    const effectiveFloors = spec.floors || 1;
    let targetHeight = effectiveFloors * floorHeight;

    // Some models are inherently oversized or undersized in their
    // native units. Apply role-specific multipliers to adjust them.
    const heightMultipliers: Record<string, number> = {
      'shop': 0.6,        // Food stall should be ~3m, not 5m
      'smallResidence': 2.0,  // Medieval House 3 needs major boost to match other houses
    };
    const multiplier = (role ? heightMultipliers[role] : undefined) || 1.0;
    const baseTarget = targetHeight;
    targetHeight *= multiplier;

    // Look up the original (import-time) height of the prototype.
    // Compute absolute scale so the clone reaches targetHeight meters.
    const originalH = (role ? this.roleOriginalHeights.get(role) : undefined) || 1;
    const absScale = targetHeight / originalH;
    console.log(`[BuildingGen] role="${role}" origH=${originalH.toFixed(2)} baseTarget=${baseTarget.toFixed(1)} mult=${multiplier.toFixed(2)} finalTarget=${targetHeight.toFixed(1)} absScale=${absScale.toFixed(6)}`);
    instance.scaling.set(absScale, absScale, absScale);

    // Align bottom of model to ground plane
    if (instance.parent) {
      (instance.parent as Mesh).computeWorldMatrix(true);
    }
    instance.computeWorldMatrix(true);
    const children = instance.getChildMeshes(false);
    let newMinY = Infinity;
    const parentWorldY = instance.parent
      ? (instance.parent as Mesh).getAbsolutePosition().y
      : 0;
    for (const child of children) {
      child.computeWorldMatrix(true);
      const bi = child.getBoundingInfo();
      newMinY = Math.min(newMinY, bi.boundingBox.minimumWorld.y);
    }
    if (isFinite(newMinY)) {
      instance.position.y -= (newMinY - parentWorldY);
    }
  }

  /**
   * Create main building structure
   */
  private createBuildingStructure(spec: BuildingSpec): Mesh {
    const floorHeight = 4;
    const totalHeight = spec.floors * floorHeight;

    const building = MeshBuilder.CreateBox(
      `building_main_${spec.id}`,
      {
        width: spec.width,
        height: totalHeight,
        depth: spec.depth
      },
      this.scene
    );

    building.position.y = totalHeight / 2;

    // Create material
    const material = new StandardMaterial(`building_mat_${spec.id}`, this.scene);
    material.diffuseColor = spec.style.baseColor;
    material.specularColor = new Color3(0.1, 0.1, 0.1);

    // Apply wall texture from asset collection if available, otherwise tint by material type
    if (this.wallTexture) {
      const wallTex = this.wallTexture.clone();
      if (wallTex) {
        wallTex.uScale = 2;
        wallTex.vScale = 2;
        material.diffuseTexture = wallTex;
        material.diffuseColor = new Color3(1, 1, 1); // Don't tint the texture
      }
    } else if (spec.style.materialType === 'brick') {
      material.diffuseColor = spec.style.baseColor.scale(0.9);
    } else if (spec.style.materialType === 'stone') {
      material.diffuseColor = spec.style.baseColor.scale(0.95);
    }

    building.material = material;
    building.checkCollisions = true;

    return building;
  }

  /**
   * Create roof
   */
  private createRoof(spec: BuildingSpec): Mesh {
    const floorHeight = 4;
    const totalHeight = spec.floors * floorHeight;
    const roofHeight = 3;

    let roof: Mesh;

    if (spec.style.architectureStyle === 'medieval' || spec.style.architectureStyle === 'rustic') {
      // Peaked hip roof — higher tessellation for smoother light distribution
      roof = MeshBuilder.CreateCylinder(
        `roof_${spec.id}`,
        {
          diameterTop: 0,
          diameterBottom: Math.max(spec.width, spec.depth) * 1.2,
          height: roofHeight,
          tessellation: 8
        },
        this.scene
      );
      roof.rotation.y = Math.PI / 8;
      // Flatten to match the rectangular footprint
      const aspect = spec.width / Math.max(spec.depth, 1);
      if (aspect > 1.2) {
        roof.scaling.z = 1 / aspect;
      } else if (aspect < 0.8) {
        roof.scaling.x = aspect;
      }
    } else if (spec.style.architectureStyle === 'modern' || spec.style.architectureStyle === 'futuristic') {
      // Flat roof
      roof = MeshBuilder.CreateBox(
        `roof_${spec.id}`,
        {
          width: spec.width + 0.5,
          height: 0.5,
          depth: spec.depth + 0.5
        },
        this.scene
      );
    } else {
      // Cone roof — higher tessellation for smoother appearance
      roof = MeshBuilder.CreateCylinder(
        `roof_${spec.id}`,
        {
          diameterTop: 1,
          diameterBottom: Math.max(spec.width, spec.depth) * 1.1,
          height: roofHeight,
          tessellation: 8
        },
        this.scene
      );
    }

    roof.position.y = totalHeight + roofHeight / 2;

    // Roof material — apply roof texture if available from asset collection
    const roofMat = new StandardMaterial(`roof_mat_${spec.id}`, this.scene);
    if (this.roofTexture) {
      const roofTex = this.roofTexture.clone();
      if (roofTex) {
        roofTex.uScale = 2;
        roofTex.vScale = 2;
        roofMat.diffuseTexture = roofTex;
        roofMat.diffuseColor = new Color3(1, 1, 1);
      }
    } else {
      const rc = spec.style.roofColor || new Color3(0.3, 0.2, 0.15);
      roofMat.diffuseColor = rc;
      // Strong emissive tint so roof color is always visible under any lighting
      roofMat.emissiveColor = rc.scale(0.35);
    }
    roofMat.specularColor = Color3.Black();
    roof.material = roofMat;

    return roof;
  }

  /**
   * Add windows to building
   */
  private addWindows(spec: BuildingSpec, building: Mesh): void {
    const floorHeight = 4;
    const windowWidth = 1.5;
    const windowHeight = 2;
    const windowsPerFloor = Math.floor(spec.width / 3);

    const windowMat = new StandardMaterial(`window_mat_${spec.id}`, this.scene);
    windowMat.diffuseColor = spec.style.windowColor;
    windowMat.emissiveColor = spec.style.windowColor.scale(0.3);
    windowMat.alpha = 0.7;

    for (let floor = 0; floor < spec.floors; floor++) {
      const y = floor * floorHeight + floorHeight / 2;

      // Front windows
      for (let i = 0; i < windowsPerFloor; i++) {
        const x = -spec.width / 2 + (i + 1) * (spec.width / (windowsPerFloor + 1));
        const window = MeshBuilder.CreatePlane(
          `window_front_${spec.id}_f${floor}_${i}`,
          { width: windowWidth, height: windowHeight },
          this.scene
        );
        window.position = new Vector3(x, y, spec.depth / 2 + 0.05);
        window.parent = building;
        window.material = windowMat;
      }

      // Back windows
      for (let i = 0; i < windowsPerFloor; i++) {
        const x = -spec.width / 2 + (i + 1) * (spec.width / (windowsPerFloor + 1));
        const window = MeshBuilder.CreatePlane(
          `window_back_${spec.id}_f${floor}_${i}`,
          { width: windowWidth, height: windowHeight },
          this.scene
        );
        window.position = new Vector3(x, y, -spec.depth / 2 - 0.05);
        window.rotation.y = Math.PI;
        window.parent = building;
        window.material = windowMat;
      }
    }
  }

  /**
   * Add door to building
   */
  private addDoor(spec: BuildingSpec, building: Mesh): void {
    const doorWidth = 2;
    const doorHeight = 3;

    const door = MeshBuilder.CreatePlane(
      `door_${spec.id}`,
      { width: doorWidth, height: doorHeight },
      this.scene
    );

    door.position = new Vector3(0, doorHeight / 2, spec.depth / 2 + 0.06);
    door.parent = building;

    const doorMat = new StandardMaterial(`door_mat_${spec.id}`, this.scene);
    doorMat.diffuseColor = spec.style.doorColor;
    doorMat.specularColor = new Color3(0.2, 0.2, 0.2);
    door.material = doorMat;
  }

  /**
   * Create chimney
   */
  private createChimney(spec: BuildingSpec): Mesh {
    const floorHeight = 4;
    const totalHeight = spec.floors * floorHeight;
    const chimneyHeight = 5;

    const chimney = MeshBuilder.CreateBox(
      `chimney_${spec.id}`,
      { width: 1, height: chimneyHeight, depth: 1 },
      this.scene
    );

    chimney.position = new Vector3(
      spec.width / 3,
      totalHeight + chimneyHeight / 2,
      -spec.depth / 4
    );

    const chimneyMat = new StandardMaterial(`chimney_mat_${spec.id}`, this.scene);
    chimneyMat.diffuseColor = spec.style.baseColor.scale(0.7);
    chimney.material = chimneyMat;

    return chimney;
  }

  /**
   * Create balcony
   */
  private createBalcony(spec: BuildingSpec): Mesh {
    const floorHeight = 4;
    const balconyFloor = Math.floor(spec.floors / 2);
    const balconyY = balconyFloor * floorHeight;

    const balcony = MeshBuilder.CreateBox(
      `balcony_${spec.id}`,
      { width: spec.width * 0.6, height: 0.3, depth: 2 },
      this.scene
    );

    balcony.position = new Vector3(0, balconyY, spec.depth / 2 + 1);

    const balconyMat = new StandardMaterial(`balcony_mat_${spec.id}`, this.scene);
    balconyMat.diffuseColor = spec.style.baseColor.scale(0.8);
    balcony.material = balconyMat;

    return balcony;
  }

  /**
   * Generate building spec from business/residence data
   */
  public static createSpecFromData(data: {
    id: string;
    type: 'business' | 'residence';
    businessType?: string;
    position: Vector3;
    worldStyle: BuildingStyle;
    population?: number;
  }): BuildingSpec {
    const defaults = data.businessType && ProceduralBuildingGenerator.BUILDING_TYPES[data.businessType]
      || ProceduralBuildingGenerator.BUILDING_TYPES['residence_medium'];

    // Use defaults from BUILDING_TYPES - no population-based overrides
    // since we're using actual 3D models with their own proportions
    const floors = defaults.floors || 2;
    const width = defaults.width || 10;
    const depth = defaults.depth || 10;

    return {
      id: data.id,
      type: data.type,
      businessType: data.businessType,
      floors,
      width,
      depth,
      style: data.worldStyle,
      position: data.position,
      rotation: Math.random() * Math.PI * 2,
      hasChimney: defaults.hasChimney || false,
      hasBalcony: defaults.hasBalcony || false
    };
  }

  /**
   * Set optional wall texture from asset collection
   */
  public setWallTexture(texture: Texture): void {
    this.wallTexture = texture;
  }

  /**
   * Set optional roof texture from asset collection
   */
  public setRoofTexture(texture: Texture): void {
    this.roofTexture = texture;
  }

  /**
   * Dispose all buildings
   */
  public dispose(): void {
    this.buildingMeshes.forEach(mesh => mesh.dispose());
    this.buildingMeshes.clear();
  }
}
