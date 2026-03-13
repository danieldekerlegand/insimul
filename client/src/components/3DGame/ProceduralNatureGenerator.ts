/**
 * Procedural Nature Generator
 *
 * Generates trees, vegetation, rocks, water features, and other natural elements
 * based on terrain type and biome.
 */

import { Scene, Mesh, MeshBuilder, Vector3, StandardMaterial, Color3, InstancedMesh, Matrix, AbstractMesh, SceneLoader, Quaternion } from '@babylonjs/core';
import { createDebugLabel } from './DebugLabelUtils';
import "@babylonjs/loaders/glTF";

export type GeologicalFeatureType = 'boulder' | 'rock_cluster' | 'stone_pillar' | 'rock_outcrop' | 'crystal_formation';

export interface BiomeStyle {
  name: string;
  treeType: 'pine' | 'oak' | 'palm' | 'dead' | 'none';
  treeDensity: number; // 0-1
  grassColor: Color3;
  rockColor: Color3;
  hasWater: boolean;
  hasFlowers: boolean;
  flowerColors: Color3[];
  treeAssetSetId?: string;
  geologicalDensity: number; // 0-1, controls how many geological features spawn
  geologicalFeatures: GeologicalFeatureType[]; // which feature types appear in this biome
}

export class ProceduralNatureGenerator {
  private scene: Scene;
  private treeMeshes: AbstractMesh[] = [];
  private rockMeshes: AbstractMesh[] = [];
  private vegetationMeshes: AbstractMesh[] = [];
  private geologicalMeshes: AbstractMesh[] = [];

  // Optional world-level asset overrides
  private treeOverrideTemplate: Mesh | null = null;
  private rockOverrideTemplate: Mesh | null = null;
  private shrubOverrideTemplate: Mesh | null = null;
  private bushOverrideTemplate: Mesh | null = null;

  // Additional variant templates for variety
  private treeVariantTemplates: Mesh[] = [];
  private rockVariantTemplates: Mesh[] = [];

  // Biome presets
  private static BIOME_PRESETS: Record<string, BiomeStyle> = {
    'forest': {
      name: 'Forest',
      treeType: 'oak',
      treeDensity: 0.7,
      grassColor: new Color3(0.2, 0.5, 0.15),
      rockColor: new Color3(0.4, 0.4, 0.35),
      hasWater: true,
      hasFlowers: true,
      flowerColors: [new Color3(1, 0.3, 0.3), new Color3(1, 1, 0.4), new Color3(0.5, 0.3, 0.8)],
      treeAssetSetId: 'temperate_forest',
      geologicalDensity: 0.3,
      geologicalFeatures: ['boulder', 'rock_cluster']
    },
    'plains': {
      name: 'Plains',
      treeType: 'oak',
      treeDensity: 0.2,
      grassColor: new Color3(0.3, 0.6, 0.2),
      rockColor: new Color3(0.5, 0.5, 0.45),
      hasWater: false,
      hasFlowers: true,
      flowerColors: [new Color3(1, 0.8, 0.2), new Color3(1, 1, 0.5)],
      treeAssetSetId: 'temperate_forest',
      geologicalDensity: 0.15,
      geologicalFeatures: ['boulder', 'rock_outcrop']
    },
    'mountains': {
      name: 'Mountains',
      treeType: 'pine',
      treeDensity: 0.3,
      grassColor: new Color3(0.25, 0.45, 0.2),
      rockColor: new Color3(0.45, 0.45, 0.5),
      hasWater: true,
      hasFlowers: false,
      flowerColors: [],
      treeAssetSetId: 'temperate_forest',
      geologicalDensity: 0.8,
      geologicalFeatures: ['boulder', 'rock_cluster', 'stone_pillar', 'rock_outcrop', 'crystal_formation']
    },
    'desert': {
      name: 'Desert',
      treeType: 'palm',
      treeDensity: 0.05,
      grassColor: new Color3(0.7, 0.6, 0.4),
      rockColor: new Color3(0.6, 0.5, 0.4),
      hasWater: false,
      hasFlowers: false,
      flowerColors: [],
      treeAssetSetId: 'desert',
      geologicalDensity: 0.5,
      geologicalFeatures: ['boulder', 'rock_outcrop', 'stone_pillar']
    },
    'tundra': {
      name: 'Tundra',
      treeType: 'pine',
      treeDensity: 0.15,
      grassColor: new Color3(0.5, 0.6, 0.5),
      rockColor: new Color3(0.5, 0.5, 0.55),
      hasWater: true,
      hasFlowers: false,
      flowerColors: [],
      treeAssetSetId: 'tundra_forest',
      geologicalDensity: 0.4,
      geologicalFeatures: ['boulder', 'rock_cluster', 'rock_outcrop']
    },
    'wasteland': {
      name: 'Wasteland',
      treeType: 'dead',
      treeDensity: 0.1,
      grassColor: new Color3(0.4, 0.3, 0.2),
      rockColor: new Color3(0.3, 0.3, 0.3),
      hasWater: false,
      hasFlowers: false,
      flowerColors: [],
      treeAssetSetId: 'wasteland_dead',
      geologicalDensity: 0.6,
      geologicalFeatures: ['boulder', 'rock_cluster', 'rock_outcrop', 'crystal_formation']
    },
    'tropical': {
      name: 'Tropical',
      treeType: 'palm',
      treeDensity: 0.6,
      grassColor: new Color3(0.15, 0.55, 0.2),
      rockColor: new Color3(0.45, 0.4, 0.35),
      hasWater: true,
      hasFlowers: true,
      flowerColors: [new Color3(1, 0.2, 0.5), new Color3(1, 0.6, 0.1), new Color3(0.9, 0.2, 0.9)],
      treeAssetSetId: 'tropical',
      geologicalDensity: 0.25,
      geologicalFeatures: ['boulder', 'rock_cluster']
    },
    'swamp': {
      name: 'Swamp',
      treeType: 'oak',
      treeDensity: 0.5,
      grassColor: new Color3(0.2, 0.35, 0.15),
      rockColor: new Color3(0.3, 0.3, 0.25),
      hasWater: true,
      hasFlowers: false,
      flowerColors: [],
      treeAssetSetId: 'swamp',
      geologicalDensity: 0.2,
      geologicalFeatures: ['boulder', 'rock_outcrop']
    },
    'urban': {
      name: 'Urban',
      treeType: 'oak',
      treeDensity: 0.05,
      grassColor: new Color3(0.25, 0.5, 0.2),
      rockColor: new Color3(0.5, 0.5, 0.5),
      hasWater: false,
      hasFlowers: true,
      flowerColors: [new Color3(1, 0.3, 0.3), new Color3(1, 1, 0.5)],
      treeAssetSetId: 'urban',
      geologicalDensity: 0.05,
      geologicalFeatures: ['boulder']
    }
  };

  constructor(scene: Scene) {
    this.scene = scene;
  }

  private treeModelPrototypes: Map<string, Mesh> = new Map();
  private treeAssetsInitialized: boolean = false;

  private makeTreeModelKey(assetSetId: string, treeType: string): string {
    return assetSetId + ':' + treeType;
  }

  public async initializeAssets(worldType?: string): Promise<void> {
    if (this.treeAssetsInitialized) {
      return;
    }
    this.treeAssetsInitialized = true;
    // Nature models are now loaded via registerTreeOverride(), registerRockOverride(),
    // etc. from BabylonGame.applyWorld3DConfig(), which resolves asset collection
    // model IDs to actual meshes. No hardcoded paths needed.
  }

  /**
   * Register a world-level tree model template. This will be preferred over
   * biome/asset-set specific models when generating trees.
   */
  public registerTreeOverride(mesh: Mesh): void {
    this.treeOverrideTemplate = mesh;
    if (this.treeOverrideTemplate) {
      this.treeOverrideTemplate.setEnabled(false);
    }
  }

  /**
   * Register a world-level rock model template.
   */
  public registerRockOverride(mesh: Mesh): void {
    this.rockOverrideTemplate = mesh;
    if (this.rockOverrideTemplate) {
      this.rockOverrideTemplate.setEnabled(false);
    }
  }

  /**
   * Register a world-level shrub model template.
   */
  public registerShrubOverride(mesh: Mesh): void {
    this.shrubOverrideTemplate = mesh;
    if (this.shrubOverrideTemplate) {
      this.shrubOverrideTemplate.setEnabled(false);
    }
  }

  /**
   * Register a world-level bush model template.
   */
  public registerBushOverride(mesh: Mesh): void {
    this.bushOverrideTemplate = mesh;
    if (this.bushOverrideTemplate) {
      this.bushOverrideTemplate.setEnabled(false);
    }
  }

  /**
   * Register an additional tree variant template for random variation.
   * These are mixed in with the primary tree override during generation.
   */
  public registerAdditionalTreeVariant(mesh: Mesh): void {
    mesh.setEnabled(false);
    this.treeVariantTemplates.push(mesh);
  }

  /**
   * Register an additional rock variant template for random variation.
   */
  public registerAdditionalRockVariant(mesh: Mesh): void {
    mesh.setEnabled(false);
    this.rockVariantTemplates.push(mesh);
  }

  /**
   * Hide all template prototype meshes after nature generation is done.
   * Moves them far off-screen so disabled PBR templates don't render
   * as giant floating objects. Cannot dispose because clones share geometry.
   */
  public hidePrototypes(): void {
    const hideOne = (mesh: Mesh | null) => {
      if (!mesh || mesh.isDisposed()) return;
      mesh.position.y = -10000;
      mesh.setEnabled(false);
      mesh.isVisible = false;
      mesh.isPickable = false;
      mesh.getChildMeshes().forEach((c: AbstractMesh) => {
        c.setEnabled(false);
        c.isVisible = false;
        c.isPickable = false;
      });
    };
    hideOne(this.treeOverrideTemplate);
    hideOne(this.rockOverrideTemplate);
    hideOne(this.shrubOverrideTemplate);
    hideOne(this.bushOverrideTemplate);
    this.treeVariantTemplates.forEach(hideOne);
    this.rockVariantTemplates.forEach(hideOne);
    console.log('[NatureGen] Hidden all prototype templates (moved off-screen)');
  }

  private async loadTreeModel(
    assetSetId: string,
    treeType: string,
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
      const key = this.makeTreeModelKey(assetSetId, treeType);
      this.treeModelPrototypes.set(key, mesh);
    } catch (error) {
      console.warn('Failed to load tree model', assetSetId, treeType, error);
    }
  }

  private getTreeModelTemplate(biome: BiomeStyle): Mesh | null {
    if (this.treeOverrideTemplate) {
      return this.treeOverrideTemplate;
    }

    if (!biome.treeAssetSetId) {
      return null;
    }

    const key = this.makeTreeModelKey(biome.treeAssetSetId, biome.treeType);
    const prototype = this.treeModelPrototypes.get(key);
    return prototype || null;
  }

  private calibrateTreeTemplate(template: Mesh, biome: BiomeStyle): void {
    template.position = Vector3.Zero();
    template.scaling = Vector3.One();

    // Compute combined bounds across all child meshes (glTF root has no geometry)
    const children = template.getChildMeshes(false);
    let minVec = new Vector3(Infinity, Infinity, Infinity);
    let maxVec = new Vector3(-Infinity, -Infinity, -Infinity);
    for (const child of children) {
      child.computeWorldMatrix(true);
      const bi = child.getBoundingInfo();
      minVec = Vector3.Minimize(minVec, bi.boundingBox.minimumWorld);
      maxVec = Vector3.Maximize(maxVec, bi.boundingBox.maximumWorld);
    }
    if (!isFinite(minVec.x)) {
      template.computeWorldMatrix(true);
      const bounds = template.getBoundingInfo().boundingBox;
      minVec = bounds.minimumWorld;
      maxVec = bounds.maximumWorld;
    }
    const size = maxVec.subtract(minVec);

    let targetHeight = size.y || 8;
    if (biome.treeType === 'pine') {
      targetHeight = 12;
    } else if (biome.treeType === 'oak') {
      targetHeight = 12;
    } else if (biome.treeType === 'palm') {
      targetHeight = 14;
    } else if (biome.treeType === 'dead') {
      targetHeight = 8;
    }

    const scale = targetHeight / (size.y || 1);
    template.scaling = new Vector3(scale, scale, scale);

    // Recompute to align bottom to ground
    let newMinY = Infinity;
    for (const child of children) {
      child.computeWorldMatrix(true);
      const bi = child.getBoundingInfo();
      newMinY = Math.min(newMinY, bi.boundingBox.minimumWorld.y);
    }
    if (!isFinite(newMinY)) {
      template.computeWorldMatrix(true);
      newMinY = template.getBoundingInfo().boundingBox.minimumWorld.y;
    }
    template.position.y -= newMinY;
  }

  /**
   * Get biome style from terrain type
   */
  public static getBiomeFromTerrain(terrain?: string): BiomeStyle {
    const terr = (terrain || '').toLowerCase();

    if (terr.includes('forest') || terr.includes('wood')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['forest'];
    } else if (terr.includes('plain') || terr.includes('grass') || terr.includes('field')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['plains'];
    } else if (terr.includes('mountain') || terr.includes('hill')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['mountains'];
    } else if (terr.includes('desert') || terr.includes('sand')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['desert'];
    } else if (terr.includes('tundra') || terr.includes('snow') || terr.includes('ice')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['tundra'];
    } else if (terr.includes('waste') || terr.includes('dead')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['wasteland'];
    } else if (terr.includes('tropical') || terr.includes('jungle')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['tropical'];
    } else if (terr.includes('swamp') || terr.includes('marsh') || terr.includes('bog')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['swamp'];
    }

    // Default
    return ProceduralNatureGenerator.BIOME_PRESETS['plains'];
  }

  /**
   * Get biome style from world type (medieval, cyberpunk, fantasy, etc.)
   * Falls back to getBiomeFromTerrain if no world type match.
   */
  public static getBiomeFromWorldType(worldType?: string, terrain?: string): BiomeStyle {
    const wt = (worldType || '').toLowerCase();

    // World-type-specific overrides
    if (wt.includes('cyberpunk') || wt.includes('sci-fi') || wt.includes('modern')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['urban'];
    } else if (wt.includes('post-apocalyptic') || wt.includes('apocalyptic') || wt.includes('dieselpunk')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['wasteland'];
    } else if (wt.includes('fantasy') || wt.includes('medieval')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['forest'];
    } else if (wt.includes('tropical') || wt.includes('pirate')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['tropical'];
    } else if (wt.includes('western') || wt.includes('frontier')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['plains'];
    } else if (wt.includes('space') || wt.includes('futuristic')) {
      return ProceduralNatureGenerator.BIOME_PRESETS['urban'];
    }

    // Fall back to terrain-based lookup
    return ProceduralNatureGenerator.getBiomeFromTerrain(terrain || worldType);
  }

  /**
   * Generate trees across an area
   */
  public generateTrees(
    biome: BiomeStyle,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    avoidPositions: Vector3[] = [],
    avoidRadius: number = 15,
    heightSampler?: (x: number, z: number) => number
  ): void {
    if (biome.treeType === 'none' || biome.treeDensity === 0) return;

    const area = (bounds.maxX - bounds.minX) * (bounds.maxZ - bounds.minZ);
    const treeCount = Math.min(200, Math.floor((area / 100) * biome.treeDensity));

    const modelTemplate = this.getTreeModelTemplate(biome);
    const isProceduralFallback = !modelTemplate;
    const templateTree = modelTemplate || this.createTree(biome.treeType, `template_tree_${biome.treeType}`);
    if (modelTemplate) {
      this.calibrateTreeTemplate(templateTree, biome);
    }
    templateTree.setEnabled(false);

    // Build pool of all available templates (primary + variants)
    const allTreeTemplates: Mesh[] = [templateTree];
    for (const variant of this.treeVariantTemplates) {
      this.calibrateTreeTemplate(variant, biome);
      variant.setEnabled(false);
      allTreeTemplates.push(variant);
    }

    for (let i = 0; i < treeCount; i++) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
      const baseHeight = heightSampler ? heightSampler(x, z) : 0;
      const position = new Vector3(x, baseHeight, z);

      // Check if too close to settlements/NPCs
      const tooClose = avoidPositions.some(avoid =>
        Vector3.Distance(position, avoid) < avoidRadius
      );

      if (!tooClose) {
        const chosenTemplate = allTreeTemplates[Math.floor(Math.random() * allTreeTemplates.length)];
        const scale = 0.8 + Math.random() * 0.4;

        // glTF root nodes have 0 vertices — use instantiateHierarchy for those
        if (chosenTemplate.getTotalVertices() === 0 && chosenTemplate.getChildMeshes().length > 0) {
          const treeRoot = chosenTemplate.instantiateHierarchy(
            null,
            undefined,
            (source, clone) => { clone.name = `${source.name}_tree_${i}`; }
          );
          if (treeRoot) {
            treeRoot.position = position;
            treeRoot.rotation.y = Math.random() * Math.PI * 2;
            treeRoot.scaling = new Vector3(scale, scale, scale);
            treeRoot.setEnabled(true);
            treeRoot.getChildMeshes().forEach(m => {
              m.setEnabled(true);
              m.isPickable = false;
              m.freezeWorldMatrix();
              // LOD: cull glTF tree child meshes at distance
              if (m instanceof Mesh) {
                m.addLODLevel(120, null);
              }
            });
            if (treeRoot instanceof Mesh) {
              treeRoot.freezeWorldMatrix();
              treeRoot.addLODLevel(120, null);
            }
            this.treeMeshes.push(treeRoot as AbstractMesh);
          }
        } else if (chosenTemplate.getTotalVertices() > 0) {
          // Single-mesh procedural template — use efficient instancing
          const tree = chosenTemplate.createInstance(`tree_${i}`);
          tree.position = position;
          tree.rotation.y = Math.random() * Math.PI * 2;
          tree.scaling = new Vector3(scale, scale, scale);
          tree.isPickable = false;
          tree.freezeWorldMatrix();
          this.treeMeshes.push(tree);
        } else {
          continue;
        }

        // Invisible collision cylinder at trunk position (instances don't support checkCollisions reliably)
        const trunkRadius = 0.4 * scale;
        const trunkHeight = 3.0 * scale;
        const collider = MeshBuilder.CreateCylinder(
          `tree_collider_${i}`,
          { diameter: trunkRadius * 2, height: trunkHeight, tessellation: 6 },
          this.scene
        );
        collider.position = new Vector3(position.x, position.y + trunkHeight / 2, position.z);
        collider.isVisible = false;
        collider.isPickable = false;
        collider.checkCollisions = true;
        collider.freezeWorldMatrix();
        this.treeMeshes.push(collider);

        // Debug label on first procedural tree only
        if (isProceduralFallback && this.treeMeshes.length === 0) {
          const labelAnchor = new Mesh(`tree_label_anchor`, this.scene);
          labelAnchor.position = position.clone();
          createDebugLabel(this.scene, labelAnchor, `TREE (${biome.treeType})`, 14);
          this.treeMeshes.push(labelAnchor);
        }
      }
    }
  }

  /**
   * Merge parts into a single-material mesh so the result can be
   * efficiently instanced with createInstance().
   */
  private mergePartsSimple(name: string, parts: Mesh[], material: StandardMaterial): Mesh {
    for (const p of parts) {
      p.parent = null;
      p.bakeCurrentTransformIntoVertices();
    }
    // Use disposeSource=false so parts survive if merge fails
    const merged = Mesh.MergeMeshes(parts, false, true, undefined, false, false);
    if (!merged || merged.getTotalVertices() === 0) {
      // Merge failed — keep parts[0] as fallback, dispose the rest
      merged?.dispose();
      for (let i = 1; i < parts.length; i++) parts[i].dispose();
      parts[0].name = name;
      parts[0].material = material;
      console.warn(`[NatureGen] mergePartsSimple failed for "${name}", using fallback`);
      return parts[0];
    }
    // Merge succeeded — dispose original parts
    for (const p of parts) p.dispose();
    merged.name = name;
    merged.material = material;
    return merged;
  }

  private createTree(type: 'pine' | 'oak' | 'palm' | 'dead', name: string): Mesh {
    let tree: Mesh;
    if (type === 'pine') {
      tree = this.createPineTree(name);
    } else if (type === 'oak') {
      tree = this.createOakTree(name);
    } else if (type === 'palm') {
      tree = this.createPalmTree(name);
    } else {
      tree = this.createDeadTree(name);
    }

    // Add LOD: at medium distance use a simple low-poly proxy,
    // at far distance hide entirely. Instances inherit LOD from source.
    const lodMid = this.createTreeLOD(type, `${name}_lod1`);
    if (lodMid) {
      lodMid.setEnabled(false);
      lodMid.isPickable = false;
      tree.addLODLevel(50, lodMid);
    }
    // At 120+ units, hide tree entirely (null = cull)
    tree.addLODLevel(120, null);

    return tree;
  }

  /**
   * Create a minimal LOD proxy for a tree type — single low-poly shape.
   */
  private createTreeLOD(type: 'pine' | 'oak' | 'palm' | 'dead', name: string): Mesh | null {
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.specularColor = Color3.Black();

    if (type === 'pine') {
      mat.diffuseColor = new Color3(0.15, 0.4, 0.15);
      const lod = MeshBuilder.CreateCylinder(name, {
        height: 10, diameterTop: 0, diameterBottom: 3, tessellation: 4
      }, this.scene);
      lod.position.y = 5;
      lod.bakeCurrentTransformIntoVertices();
      lod.material = mat;
      return lod;
    } else if (type === 'oak') {
      mat.diffuseColor = new Color3(0.2, 0.5, 0.15);
      const lod = MeshBuilder.CreateSphere(name, {
        diameter: 4, segments: 3
      }, this.scene);
      lod.position.y = 6;
      lod.scaling.y = 0.7;
      lod.bakeCurrentTransformIntoVertices();
      lod.material = mat;
      return lod;
    } else if (type === 'palm') {
      mat.diffuseColor = new Color3(0.2, 0.6, 0.2);
      const lod = MeshBuilder.CreateCylinder(name, {
        height: 10, diameterTop: 0.3, diameterBottom: 0.5, tessellation: 4
      }, this.scene);
      lod.position.y = 5;
      lod.bakeCurrentTransformIntoVertices();
      lod.material = mat;
      return lod;
    } else {
      mat.diffuseColor = new Color3(0.3, 0.25, 0.2);
      const lod = MeshBuilder.CreateCylinder(name, {
        height: 7, diameterTop: 0.2, diameterBottom: 0.5, tessellation: 4
      }, this.scene);
      lod.position.y = 3.5;
      lod.bakeCurrentTransformIntoVertices();
      lod.material = mat;
      return lod;
    }
  }

  /**
   * Create pine tree (conical evergreen) — merged into single mesh
   */
  private createPineTree(name: string): Mesh {
    // Single material for instancing — dark green covers trunk + foliage
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = new Color3(0.15, 0.4, 0.15);
    mat.specularColor = Color3.Black();

    // Trunk
    const trunk = MeshBuilder.CreateCylinder(
      `${name}_trunk`,
      { height: 8, diameterTop: 0.4, diameterBottom: 0.8, tessellation: 6 },
      this.scene
    );
    trunk.position.y = 4;
    trunk.material = mat;

    // Foliage (3 cones stacked)
    const cones: Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const cone = MeshBuilder.CreateCylinder(
        `${name}_foliage_${i}`,
        { height: 4, diameterTop: 0, diameterBottom: 4 - i * 0.5, tessellation: 5 },
        this.scene
      );
      cone.position.y = 6 + i * 2.5;
      cone.material = mat;
      cones.push(cone);
    }

    return this.mergePartsSimple(name, [trunk, ...cones], mat);
  }

  /**
   * Create oak tree (trunk + clustered canopy) — merged into single mesh
   */
  private createOakTree(name: string): Mesh {
    // Single material for instancing — green canopy color for all parts
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = new Color3(0.2, 0.5, 0.15);
    mat.specularColor = Color3.Black();

    // Trunk — thick and visible
    const trunk = MeshBuilder.CreateCylinder(
      `${name}_trunk`,
      { height: 5, diameterTop: 0.8, diameterBottom: 1.4, tessellation: 6 },
      this.scene
    );
    trunk.position.y = 2.5;
    trunk.material = mat;

    // Canopy — smaller, more spread-out spheres for a lumpy natural shape
    const canopyParts: Mesh[] = [];
    const cpDefs = [
      { x: 0, y: 6.5, z: 0, d: 3 },       // Center, smaller
      { x: 2, y: 6, z: 1.2, d: 2.5 },      // Spread far out
      { x: -1.8, y: 6.3, z: -1, d: 2.3 },
      { x: 0.5, y: 7.2, z: -1.8, d: 2 },
      { x: -0.8, y: 7, z: 1.5, d: 2.2 },
      { x: 1.5, y: 7.3, z: -0.5, d: 1.8 }, // Extra top bump
    ];
    cpDefs.forEach((cp, i) => {
      const part = MeshBuilder.CreateSphere(
        `${name}_canopy_${i}`,
        { diameter: cp.d, segments: 3 },
        this.scene
      );
      part.position = new Vector3(cp.x, cp.y, cp.z);
      part.scaling.y = 0.6;
      part.material = mat;
      canopyParts.push(part);
    });

    return this.mergePartsSimple(name, [trunk, ...canopyParts], mat);
  }

  /**
   * Create palm tree — merged into single mesh
   */
  private createPalmTree(name: string): Mesh {
    // Single material for instancing — green frond color for all parts
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = new Color3(0.2, 0.6, 0.2);
    mat.specularColor = Color3.Black();

    // Trunk
    const trunk = MeshBuilder.CreateCylinder(
      `${name}_trunk`,
      { height: 10, diameterTop: 0.4, diameterBottom: 0.6, tessellation: 6 },
      this.scene
    );
    trunk.position.y = 5;
    trunk.rotation.z = Math.PI / 16;
    trunk.material = mat;

    // Fronds
    const fronds: Mesh[] = [];
    for (let i = 0; i < 6; i++) {
      const frond = MeshBuilder.CreateBox(
        `${name}_frond_${i}`,
        { width: 0.5, height: 4, depth: 0.2 },
        this.scene
      );
      frond.position.y = 10;
      frond.rotation.y = (i / 6) * Math.PI * 2;
      frond.rotation.x = Math.PI / 4;
      frond.material = mat;
      fronds.push(frond);
    }

    return this.mergePartsSimple(name, [trunk, ...fronds], mat);
  }

  /**
   * Create dead tree — merged into single mesh
   */
  private createDeadTree(name: string): Mesh {
    // Single material for instancing — brown trunk color
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = new Color3(0.3, 0.25, 0.2);
    mat.specularColor = Color3.Black();

    // Main trunk
    const trunk = MeshBuilder.CreateCylinder(
      `${name}_trunk`,
      { height: 7, diameterTop: 0.3, diameterBottom: 0.7, tessellation: 5 },
      this.scene
    );
    trunk.position.y = 3.5;
    trunk.material = mat;

    // Bare branches
    const branches: Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const branch = MeshBuilder.CreateCylinder(
        `${name}_branch_${i}`,
        { height: 2, diameterTop: 0.1, diameterBottom: 0.2, tessellation: 4 },
        this.scene
      );
      branch.position = new Vector3(0, 5 + i * 0.5, 0);
      branch.rotation.z = Math.PI / 3 + i * 0.2;
      branch.rotation.y = (i / 3) * Math.PI * 2;
      branch.material = mat;
      branches.push(branch);
    }

    return this.mergePartsSimple(name, [trunk, ...branches], mat);
  }

  /**
   * Generate rocks across an area
   */
  public generateRocks(
    biome: BiomeStyle,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    count: number = 20,
    heightSampler?: (x: number, z: number) => number
  ): void {
    // Use asset-based rock if available
    if (this.rockOverrideTemplate) {
      // Build pool of all available rock templates (primary + variants)
      const allRockTemplates: Mesh[] = [this.rockOverrideTemplate];
      for (const variant of this.rockVariantTemplates) {
        variant.setEnabled(false);
        allRockTemplates.push(variant);
      }

      for (let i = 0; i < count; i++) {
        const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
        const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
        const baseHeight = heightSampler ? heightSampler(x, z) : 0;

        // Pick randomly from all available rock templates for variety
        const chosenTemplate = allRockTemplates[Math.floor(Math.random() * allRockTemplates.length)];
        const scaleVariation = 0.8 + Math.random() * 0.4;

        // glTF root nodes have 0 vertices — use instantiateHierarchy
        if (chosenTemplate.getTotalVertices() === 0 && chosenTemplate.getChildMeshes().length > 0) {
          const rockRoot = chosenTemplate.instantiateHierarchy(
            null,
            undefined,
            (source, clone) => { clone.name = `${source.name}_rock_${i}`; }
          );
          if (rockRoot) {
            rockRoot.position = new Vector3(x, baseHeight, z);
            rockRoot.scaling = new Vector3(scaleVariation, scaleVariation, scaleVariation);
            rockRoot.rotation.y = Math.random() * Math.PI * 2;
            rockRoot.setEnabled(true);
            rockRoot.getChildMeshes().forEach(m => {
              m.setEnabled(true);
              m.isPickable = false;
              m.freezeWorldMatrix();
              if (m instanceof Mesh) m.addLODLevel(80, null);
            });
            if (rockRoot instanceof Mesh) {
              rockRoot.freezeWorldMatrix();
              rockRoot.addLODLevel(80, null);
            }
            this.rockMeshes.push(rockRoot as AbstractMesh);
          }
        } else if (chosenTemplate.getTotalVertices() > 0) {
          // Phase 2: Use createInstance instead of clone for efficient rendering
          const rock = chosenTemplate.createInstance(`rock_${i}`);
          rock.position = new Vector3(x, baseHeight, z);
          rock.scaling = new Vector3(scaleVariation, scaleVariation, scaleVariation);
          rock.rotation.y = Math.random() * Math.PI * 2;
          rock.isPickable = false;
          rock.freezeWorldMatrix();
          this.rockMeshes.push(rock);
        }

        // Invisible collision box at rock position
        const rockCollider = MeshBuilder.CreateBox(
          `rock_collider_${i}`,
          { width: scaleVariation, height: scaleVariation * 0.7, depth: scaleVariation },
          this.scene
        );
        rockCollider.position = new Vector3(x, baseHeight + scaleVariation * 0.35, z);
        rockCollider.isVisible = false;
        rockCollider.isPickable = false;
        rockCollider.checkCollisions = true;
        rockCollider.freezeWorldMatrix();
        this.rockMeshes.push(rockCollider);
      }
      return;
    }

    // Fallback to procedural rocks — use instanced rendering for performance
    const rockMat = new StandardMaterial('rock_mat', this.scene);
    rockMat.diffuseColor = biome.rockColor;
    rockMat.specularColor = new Color3(0.1, 0.1, 0.1);

    // Create template rock and disable it (low segments — rocks are irregular anyway)
    const rockTemplate = MeshBuilder.CreateSphere(
      'rock_template',
      { diameter: 1, segments: 4 },
      this.scene
    );
    rockTemplate.material = rockMat;
    rockTemplate.setEnabled(false);

    // LOD: hide rocks entirely at 80+ units (instances inherit)
    rockTemplate.addLODLevel(80, null);

    for (let i = 0; i < count; i++) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);

      const baseHeight = heightSampler ? heightSampler(x, z) : 0;

      // Random rock size
      const scale = 1 + Math.random() * 3;

      const rock = rockTemplate.createInstance(`rock_${i}`);
      rock.position = new Vector3(x, baseHeight + scale / 2, z);
      rock.scaling = new Vector3(
        scale * (0.8 + Math.random() * 0.4),
        scale * (0.6 + Math.random() * 0.3),
        scale
      );
      rock.rotation.y = Math.random() * Math.PI * 2;
      rock.isPickable = false;
      rock.freezeWorldMatrix();

      // Invisible collision box at rock position
      const rockCollider = MeshBuilder.CreateBox(
        `rock_collider_${i}`,
        { width: scale * 0.8, height: scale * 0.6, depth: scale },
        this.scene
      );
      rockCollider.position = new Vector3(x, baseHeight + scale / 2, z);
      rockCollider.isVisible = false;
      rockCollider.isPickable = false;
      rockCollider.checkCollisions = true;
      rockCollider.freezeWorldMatrix();
      this.rockMeshes.push(rockCollider);

      // Debug label on first procedural rock only
      if (i === 0) {
        const labelAnchor = new Mesh(`rock_label_anchor`, this.scene);
        labelAnchor.position = rock.position.clone();
        createDebugLabel(this.scene, labelAnchor, 'ROCK (procedural)', 4);
        this.rockMeshes.push(labelAnchor);
      }

      this.rockMeshes.push(rock);
    }
  }

  /**
   * Generate shrubs/bushes across an area
   */
  public generateShrubs(
    biome: BiomeStyle,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    count: number = 30,
    heightSampler?: (x: number, z: number) => number
  ): void {
    // Use asset-based shrub/bush if available
    const template = this.shrubOverrideTemplate || this.bushOverrideTemplate;

    if (template) {
      for (let i = 0; i < count; i++) {
        const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
        const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
        const baseHeight = heightSampler ? heightSampler(x, z) : 0;
        const scaleVariation = 0.7 + Math.random() * 0.6;

        // glTF root nodes have 0 vertices — use instantiateHierarchy
        if (template.getTotalVertices() === 0 && template.getChildMeshes().length > 0) {
          const shrubRoot = template.instantiateHierarchy(
            null,
            undefined,
            (source, clone) => { clone.name = `${source.name}_shrub_${i}`; }
          );
          if (shrubRoot) {
            shrubRoot.position = new Vector3(x, baseHeight, z);
            shrubRoot.scaling = new Vector3(scaleVariation, scaleVariation, scaleVariation);
            shrubRoot.rotation.y = Math.random() * Math.PI * 2;
            shrubRoot.setEnabled(true);
            shrubRoot.getChildMeshes().forEach(m => {
              m.setEnabled(true);
              m.isPickable = false;
              m.freezeWorldMatrix();
              if (m instanceof Mesh) m.addLODLevel(60, null);
            });
            if (shrubRoot instanceof Mesh) {
              shrubRoot.freezeWorldMatrix();
              shrubRoot.addLODLevel(60, null);
            }
            this.vegetationMeshes.push(shrubRoot as AbstractMesh);
          }
        } else {
          const shrub = template.clone(`shrub_${i}`, null, false, false) as Mesh;
          if (!shrub) continue;
          shrub.setEnabled(true);
          shrub.position = new Vector3(x, baseHeight, z);
          shrub.scaling = new Vector3(scaleVariation, scaleVariation, scaleVariation);
          shrub.rotation.y = Math.random() * Math.PI * 2;
          shrub.isPickable = false;
          shrub.freezeWorldMatrix();
          this.vegetationMeshes.push(shrub);
        }
      }
      return;
    }

    // Fallback to procedural bushes — use instanced rendering for performance
    const bushMat = new StandardMaterial('bush_mat', this.scene);
    bushMat.diffuseColor = new Color3(0.15, 0.4, 0.15);

    // Create template bush and disable it
    const bushTemplate = MeshBuilder.CreateSphere(
      'bush_template',
      { diameter: 1, segments: 4 },
      this.scene
    );
    bushTemplate.material = bushMat;
    bushTemplate.setEnabled(false);
    // LOD: hide bushes at 60+ units (instances inherit)
    bushTemplate.addLODLevel(60, null);

    for (let i = 0; i < count; i++) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
      const baseHeight = heightSampler ? heightSampler(x, z) : 0;

      const size = 1 + Math.random() * 2;
      const bush = bushTemplate.createInstance(`bush_${i}`);
      bush.position = new Vector3(x, baseHeight + size / 2, z);
      bush.scaling = new Vector3(size, size * (0.6 + Math.random() * 0.3), size);
      bush.isPickable = false;
      bush.freezeWorldMatrix();

      // Debug label on first procedural shrub only
      if (i === 0) {
        const labelAnchor = new Mesh(`shrub_label_anchor`, this.scene);
        labelAnchor.position = bush.position.clone();
        createDebugLabel(this.scene, labelAnchor, 'SHRUB (procedural)', 3);
        this.vegetationMeshes.push(labelAnchor);
      }

      this.vegetationMeshes.push(bush);
    }
  }

  /**
   * Generate grass patches using crossed planes for a more natural look
   */
  public generateGrass(
    biome: BiomeStyle,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    density: number = 100,
    heightSampler?: (x: number, z: number) => number
  ): void {
    // Scale density by biome tree density as a proxy for vegetation richness
    const adjustedDensity = Math.floor(density * Math.max(0.2, biome.treeDensity * 1.5));

    const grassMat = new StandardMaterial('grass_mat', this.scene);
    grassMat.diffuseColor = biome.grassColor;
    grassMat.emissiveColor = biome.grassColor.scale(0.15);
    grassMat.backFaceCulling = false;
    grassMat.alpha = 0.7;
    grassMat.specularColor = Color3.Black();

    // Create crossed-plane grass tuft template: very small so they act as
    // subtle ground cover rather than visible X shapes
    const plane1 = MeshBuilder.CreatePlane(
      'grass_blade_1',
      { width: 0.25, height: 0.35 },
      this.scene
    );
    const plane2 = MeshBuilder.CreatePlane(
      'grass_blade_2',
      { width: 0.25, height: 0.35 },
      this.scene
    );
    plane2.rotation.y = Math.PI / 2;
    plane2.bakeCurrentTransformIntoVertices();

    const grassTemplate = Mesh.MergeMeshes([plane1, plane2], false, true, undefined, false, false);
    if (!grassTemplate || grassTemplate.getTotalVertices() === 0) {
      grassTemplate?.dispose();
      plane1.dispose();
      plane2.dispose();
      return;
    }
    plane1.dispose();
    plane2.dispose();
    grassTemplate.name = 'grass_template';
    grassTemplate.material = grassMat;
    grassTemplate.isPickable = false;

    // LOD: hide grass at 30+ units
    grassTemplate.addLODLevel(30, null);

    // Phase 2: Use ThinInstances for ultra-dense grass — single draw call
    // Build a Float32Array of 4x4 world matrices for all grass patches
    const matrices = new Float32Array(adjustedDensity * 16);
    const tmpMatrix = Matrix.Identity();
    const tmpRotation = Quaternion.Identity();
    const tmpScaling = Vector3.Zero();
    const tmpPosition = Vector3.Zero();

    for (let i = 0; i < adjustedDensity; i++) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
      const baseHeight = heightSampler ? heightSampler(x, z) : 0;

      const rotY = Math.random() * Math.PI * 2;
      const scaleVar = 0.3 + Math.random() * 0.3;

      tmpPosition.set(x, baseHeight + 0.1, z);
      Quaternion.RotationYawPitchRollToRef(rotY, 0, 0, tmpRotation);
      tmpScaling.set(scaleVar, scaleVar, scaleVar);
      Matrix.ComposeToRef(tmpScaling, tmpRotation, tmpPosition, tmpMatrix);
      tmpMatrix.copyToArray(matrices, i * 16);
    }

    grassTemplate.thinInstanceSetBuffer('matrix', matrices, 16);
    grassTemplate.thinInstanceRefreshBoundingInfo(false);
    grassTemplate.freezeWorldMatrix();
    this.vegetationMeshes.push(grassTemplate);
  }

  /**
   * Generate flowers
   */
  public generateFlowers(
    biome: BiomeStyle,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    count: number = 50,
    heightSampler?: (x: number, z: number) => number
  ): void {
    if (!biome.hasFlowers || biome.flowerColors.length === 0) return;

    // Create one merged flower template per color (stem + head baked together)
    const flowerTemplates: Mesh[] = biome.flowerColors.map((color, idx) => {
      const flowerMat = new StandardMaterial(`flower_mat_${idx}`, this.scene);
      flowerMat.diffuseColor = color;
      flowerMat.emissiveColor = color.scale(0.15);
      flowerMat.specularColor = Color3.Black();

      // Thin stem — use flower color (too small to notice)
      const stem = MeshBuilder.CreateCylinder(
        `flower_stem_${idx}`,
        { height: 0.6, diameter: 0.04, tessellation: 4 },
        this.scene
      );
      stem.position.y = 0.3;
      stem.material = flowerMat;

      // Small flower head on top — flattened sphere
      const head = MeshBuilder.CreateSphere(
        `flower_head_${idx}`,
        { diameter: 0.2, segments: 5 },
        this.scene
      );
      head.position.y = 0.65;
      head.scaling.y = 0.5; // Flatten into a disc shape
      head.material = flowerMat;

      // Merge with multiMaterial=false — single material so instancing works
      const merged = this.mergePartsSimple(`flower_template_${idx}`, [stem, head], flowerMat);
      merged.isPickable = false;
      // LOD: hide flowers at 40+ units
      merged.addLODLevel(40, null);
      return merged;
    });

    // Phase 2: Use ThinInstances for flowers — single draw call per color
    // Pre-allocate positions per color template
    const positionsPerColor: { x: number; z: number; y: number; s: number }[][] =
      flowerTemplates.map(() => []);

    for (let i = 0; i < count; i++) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
      const baseHeight = heightSampler ? heightSampler(x, z) : 0;
      const colorIdx = Math.floor(Math.random() * flowerTemplates.length);
      const s = 0.8 + Math.random() * 0.5;
      positionsPerColor[colorIdx].push({ x, z, y: baseHeight, s });
    }

    const tmpMatrix = Matrix.Identity();
    const tmpRotation = Quaternion.Identity();
    const tmpScaling = Vector3.Zero();
    const tmpPosition = Vector3.Zero();

    for (let idx = 0; idx < flowerTemplates.length; idx++) {
      const template = flowerTemplates[idx];
      if (template.getTotalVertices() === 0) continue;
      const positions = positionsPerColor[idx];
      if (positions.length === 0) continue;

      const matrices = new Float32Array(positions.length * 16);
      for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        tmpPosition.set(p.x, p.y, p.z);
        Quaternion.RotationYawPitchRollToRef(0, 0, 0, tmpRotation);
        tmpScaling.set(p.s, p.s, p.s);
        Matrix.ComposeToRef(tmpScaling, tmpRotation, tmpPosition, tmpMatrix);
        tmpMatrix.copyToArray(matrices, i * 16);
      }

      template.thinInstanceSetBuffer('matrix', matrices, 16);
      template.thinInstanceRefreshBoundingInfo(false);
      template.freezeWorldMatrix();
      this.vegetationMeshes.push(template);
    }
  }

  /**
   * Generate geological features (boulders, rock clusters, pillars, outcrops, crystals)
   * based on biome configuration.
   */
  public generateGeologicalFeatures(
    biome: BiomeStyle,
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    count: number = 10,
    heightSampler?: (x: number, z: number) => number
  ): void {
    if (!biome.geologicalFeatures || biome.geologicalFeatures.length === 0) return;

    const adjustedCount = Math.max(1, Math.floor(count * biome.geologicalDensity));

    for (let i = 0; i < adjustedCount; i++) {
      const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
      const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ);
      const baseHeight = heightSampler ? heightSampler(x, z) : 0;

      const featureType = biome.geologicalFeatures[
        Math.floor(Math.random() * biome.geologicalFeatures.length)
      ];

      const mesh = this.createGeologicalFeature(featureType, `geo_${featureType}_${i}`, biome, baseHeight);
      if (!mesh) continue;

      mesh.position = new Vector3(x, baseHeight, z);
      mesh.rotation.y = Math.random() * Math.PI * 2;
      mesh.isPickable = false;
      mesh.freezeWorldMatrix();
      mesh.getChildMeshes().forEach(child => {
        child.isPickable = false;
        child.freezeWorldMatrix();
        if (child instanceof Mesh) child.addLODLevel(100, null);
      });
      if (mesh instanceof Mesh) mesh.addLODLevel(100, null);

      // Collision box around the feature
      const featureBounds = mesh.getHierarchyBoundingVectors(true);
      const size = featureBounds.max.subtract(featureBounds.min);
      const collider = MeshBuilder.CreateBox(
        `geo_collider_${i}`,
        { width: Math.max(1, size.x), height: Math.max(1, size.y), depth: Math.max(1, size.z) },
        this.scene
      );
      const center = featureBounds.min.add(size.scale(0.5));
      collider.position = center;
      collider.isVisible = false;
      collider.isPickable = false;
      collider.checkCollisions = true;
      collider.freezeWorldMatrix();
      this.geologicalMeshes.push(collider);

      if (i === 0) {
        const labelAnchor = new Mesh(`geo_label_anchor`, this.scene);
        labelAnchor.position = mesh.position.clone();
        createDebugLabel(this.scene, labelAnchor, `GEO: ${featureType}`, 6);
        this.geologicalMeshes.push(labelAnchor);
      }

      this.geologicalMeshes.push(mesh);
    }
  }

  /**
   * Create a single procedural geological feature mesh.
   */
  private createGeologicalFeature(
    type: GeologicalFeatureType,
    name: string,
    biome: BiomeStyle,
    _baseHeight: number
  ): Mesh | null {
    switch (type) {
      case 'boulder': return this.createBoulder(name, biome);
      case 'rock_cluster': return this.createRockCluster(name, biome);
      case 'stone_pillar': return this.createStonePillar(name, biome);
      case 'rock_outcrop': return this.createRockOutcrop(name, biome);
      case 'crystal_formation': return this.createCrystalFormation(name, biome);
      default: return null;
    }
  }

  private createBoulder(name: string, biome: BiomeStyle): Mesh {
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = biome.rockColor.scale(0.9 + Math.random() * 0.2);
    mat.specularColor = new Color3(0.05, 0.05, 0.05);

    const scale = 2 + Math.random() * 3;
    const boulder = MeshBuilder.CreateSphere(
      name,
      { diameter: scale, segments: 5 },
      this.scene
    );
    boulder.scaling = new Vector3(
      1 + Math.random() * 0.3,
      0.6 + Math.random() * 0.4,
      1 + Math.random() * 0.3
    );
    boulder.position.y = scale * 0.25;
    boulder.material = mat;
    return boulder;
  }

  private createRockCluster(name: string, biome: BiomeStyle): Mesh {
    const parent = new Mesh(name, this.scene);
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = biome.rockColor;
    mat.specularColor = new Color3(0.08, 0.08, 0.08);

    const rockCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < rockCount; i++) {
      const size = 0.8 + Math.random() * 1.5;
      const rock = MeshBuilder.CreateSphere(
        `${name}_rock_${i}`,
        { diameter: size, segments: 4 },
        this.scene
      );
      rock.scaling = new Vector3(
        0.8 + Math.random() * 0.4,
        0.5 + Math.random() * 0.5,
        0.8 + Math.random() * 0.4
      );
      // Scatter rocks in a small cluster radius
      rock.position = new Vector3(
        (Math.random() - 0.5) * 3,
        size * 0.2,
        (Math.random() - 0.5) * 3
      );
      rock.rotation.y = Math.random() * Math.PI * 2;
      rock.material = mat;
      rock.parent = parent;
    }
    return parent;
  }

  private createStonePillar(name: string, biome: BiomeStyle): Mesh {
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = biome.rockColor.scale(0.85);
    mat.specularColor = new Color3(0.1, 0.1, 0.1);

    const height = 3 + Math.random() * 5;
    const radius = 0.5 + Math.random() * 0.8;

    const pillar = MeshBuilder.CreateCylinder(
      name,
      { height, diameterTop: radius * 0.7, diameterBottom: radius * 2, tessellation: 6 },
      this.scene
    );
    pillar.position.y = height / 2;
    pillar.material = mat;
    // Slight tilt for natural look
    pillar.rotation.x = (Math.random() - 0.5) * 0.15;
    pillar.rotation.z = (Math.random() - 0.5) * 0.15;
    return pillar;
  }

  private createRockOutcrop(name: string, biome: BiomeStyle): Mesh {
    const parent = new Mesh(name, this.scene);
    const mat = new StandardMaterial(`${name}_mat`, this.scene);
    mat.diffuseColor = biome.rockColor.scale(0.8 + Math.random() * 0.2);
    mat.specularColor = new Color3(0.06, 0.06, 0.06);

    // Base slab — wide and flat
    const base = MeshBuilder.CreateBox(
      `${name}_base`,
      { width: 4 + Math.random() * 3, height: 1.5 + Math.random(), depth: 3 + Math.random() * 2 },
      this.scene
    );
    base.position.y = 0.75;
    base.material = mat;
    base.parent = parent;

    // Stacked layers for a layered rock look
    const layers = 1 + Math.floor(Math.random() * 3);
    let yOffset = 1.5;
    for (let i = 0; i < layers; i++) {
      const shrink = 0.7 - i * 0.15;
      const layer = MeshBuilder.CreateBox(
        `${name}_layer_${i}`,
        {
          width: (3 + Math.random() * 2) * shrink,
          height: 0.8 + Math.random() * 0.5,
          depth: (2.5 + Math.random() * 1.5) * shrink
        },
        this.scene
      );
      layer.position.y = yOffset + 0.4;
      layer.position.x = (Math.random() - 0.5) * 0.5;
      layer.position.z = (Math.random() - 0.5) * 0.5;
      layer.material = mat;
      layer.parent = parent;
      yOffset += 0.8;
    }
    return parent;
  }

  private createCrystalFormation(name: string, biome: BiomeStyle): Mesh {
    const parent = new Mesh(name, this.scene);

    const crystalMat = new StandardMaterial(`${name}_mat`, this.scene);
    // Tinted crystal color based on biome rock color with added saturation
    const r = Math.min(1, biome.rockColor.r * 0.5 + 0.3);
    const g = Math.min(1, biome.rockColor.g * 0.3 + 0.2);
    const b = Math.min(1, biome.rockColor.b * 0.5 + 0.5);
    crystalMat.diffuseColor = new Color3(r, g, b);
    crystalMat.specularColor = new Color3(0.4, 0.4, 0.5);
    crystalMat.alpha = 0.85;
    crystalMat.emissiveColor = new Color3(r * 0.15, g * 0.15, b * 0.15);

    const crystalCount = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < crystalCount; i++) {
      const height = 1 + Math.random() * 2.5;
      const diameter = 0.3 + Math.random() * 0.5;
      const crystal = MeshBuilder.CreateCylinder(
        `${name}_crystal_${i}`,
        { height, diameterTop: 0, diameterBottom: diameter, tessellation: 6 },
        this.scene
      );
      crystal.position = new Vector3(
        (Math.random() - 0.5) * 1.5,
        height / 2,
        (Math.random() - 0.5) * 1.5
      );
      // Crystals jut out at angles
      crystal.rotation.x = (Math.random() - 0.5) * 0.5;
      crystal.rotation.z = (Math.random() - 0.5) * 0.5;
      crystal.material = crystalMat;
      crystal.parent = parent;
    }

    // Small rock base
    const baseMat = new StandardMaterial(`${name}_base_mat`, this.scene);
    baseMat.diffuseColor = biome.rockColor;
    const base = MeshBuilder.CreateSphere(
      `${name}_base`,
      { diameter: 1.5, segments: 4 },
      this.scene
    );
    base.scaling = new Vector3(1.2, 0.5, 1.2);
    base.position.y = 0.2;
    base.material = baseMat;
    base.parent = parent;

    return parent;
  }

  /** Return all tree meshes for distance culling */
  public getTreeMeshes(): AbstractMesh[] {
    return this.treeMeshes;
  }

  /** Return all rock meshes for distance culling */
  public getRockMeshes(): AbstractMesh[] {
    return this.rockMeshes;
  }

  /** Return all vegetation meshes (shrubs, grass, flowers) for distance culling */
  public getVegetationMeshes(): AbstractMesh[] {
    return this.vegetationMeshes;
  }

  /** Return all geological feature meshes for distance culling */
  public getGeologicalMeshes(): AbstractMesh[] {
    return this.geologicalMeshes;
  }

  /**
   * Dispose all nature elements
   */
  public dispose(): void {
    this.treeMeshes.forEach(mesh => mesh.dispose());
    this.rockMeshes.forEach(mesh => mesh.dispose());
    this.vegetationMeshes.forEach(mesh => mesh.dispose());
    this.geologicalMeshes.forEach(mesh => mesh.dispose());

    this.treeMeshes = [];
    this.rockMeshes = [];
    this.vegetationMeshes = [];
    this.geologicalMeshes = [];
  }
}
