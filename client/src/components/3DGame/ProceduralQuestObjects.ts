/**
 * Procedural Quest Object Mesh Generator
 *
 * Generates contextual 3D meshes for quest objects based on object type.
 * Produces simple colored primitives (spheres, boxes, cylinders, composites)
 * as placeholders until real GLTF assets are available.
 *
 * Design: asset registry lookup first, procedural fallback second.
 */

import {
  Scene,
  Mesh,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Color3,
  Animation,
  GlowLayer,
  TransformNode,
} from '@babylonjs/core';

/** Shape primitives used to compose quest objects */
export type QuestObjectShape = 'sphere' | 'box' | 'cylinder' | 'cone' | 'torus' | 'composite';

/** Specification for a single primitive part within a composite object */
export interface QuestObjectPart {
  shape: Exclude<QuestObjectShape, 'composite'>;
  position: { x: number; y: number; z: number };
  scaling: { x: number; y: number; z: number };
  color?: Color3;
}

/** Full specification for a quest object type */
export interface QuestObjectSpec {
  shape: QuestObjectShape;
  baseColor: Color3;
  emissiveColor: Color3;
  /** Uniform scale multiplier */
  size: number;
  /** Primitive options (diameter, width, height, etc.) */
  options: Record<string, number>;
  /** Parts for composite objects */
  parts?: QuestObjectPart[];
}

/** Parameters for generating a quest object mesh */
export interface QuestObjectParams {
  objectType: string;
  color?: Color3;
  size?: number;
  label?: string;
  interactable?: boolean;
}

/** Result from generating a quest object */
export interface QuestObjectResult {
  mesh: Mesh;
  /** Call to clean up glow layer inclusion */
  removeGlow?: () => void;
}

// ── Color palette for vocabulary quests ──

const COLORS: Record<string, Color3> = {
  red: new Color3(0.9, 0.15, 0.15),
  blue: new Color3(0.15, 0.35, 0.9),
  green: new Color3(0.15, 0.75, 0.25),
  yellow: new Color3(0.95, 0.85, 0.1),
  orange: new Color3(0.95, 0.55, 0.1),
  purple: new Color3(0.6, 0.2, 0.85),
  white: new Color3(0.95, 0.95, 0.95),
  black: new Color3(0.12, 0.12, 0.12),
  brown: new Color3(0.55, 0.35, 0.15),
  pink: new Color3(0.95, 0.45, 0.65),
  gold: new Color3(1, 0.84, 0),
  silver: new Color3(0.75, 0.75, 0.78),
  cyan: new Color3(0.1, 0.85, 0.85),
};

// ── Object type registry ──

function spec(
  shape: QuestObjectShape,
  baseColor: Color3,
  size: number,
  options: Record<string, number> = {},
  parts?: QuestObjectPart[],
): QuestObjectSpec {
  return {
    shape,
    baseColor,
    emissiveColor: baseColor.scale(0.35),
    size,
    options,
    parts,
  };
}

const OBJECT_REGISTRY: Record<string, QuestObjectSpec> = {
  // Food / consumables
  apple: spec('sphere', new Color3(0.85, 0.1, 0.1), 0.4, { diameter: 1, segments: 16 }),
  bread: spec('box', new Color3(0.82, 0.65, 0.3), 0.4, { width: 1.4, height: 0.6, depth: 0.8 }),
  cheese: spec('box', new Color3(0.95, 0.85, 0.2), 0.35, { width: 1, height: 0.5, depth: 0.8 }),
  wine: spec('cylinder', new Color3(0.5, 0.05, 0.15), 0.35, { diameter: 0.5, height: 1.4, tessellation: 16 }),
  water: spec('cylinder', new Color3(0.3, 0.6, 0.95), 0.35, { diameter: 0.45, height: 1.2, tessellation: 16 }),
  meat: spec('box', new Color3(0.65, 0.2, 0.15), 0.4, { width: 1, height: 0.4, depth: 0.7 }),
  fish: spec('box', new Color3(0.5, 0.7, 0.8), 0.4, { width: 1.4, height: 0.35, depth: 0.5 }),

  // Objects / tools
  key: spec('composite', new Color3(0.85, 0.75, 0.15), 0.3, {}, [
    { shape: 'torus', position: { x: 0, y: 0.3, z: 0 }, scaling: { x: 0.6, y: 0.6, z: 0.6 } },
    { shape: 'box', position: { x: 0, y: -0.2, z: 0 }, scaling: { x: 0.15, y: 0.7, z: 0.15 } },
  ]),
  book: spec('box', new Color3(0.4, 0.25, 0.12), 0.4, { width: 0.8, height: 1, depth: 0.2 }),
  scroll: spec('cylinder', new Color3(0.9, 0.85, 0.7), 0.35, { diameter: 0.3, height: 1.2, tessellation: 16 }),
  bottle: spec('cylinder', new Color3(0.2, 0.6, 0.3), 0.35, { diameter: 0.45, height: 1.3, tessellation: 16 }),
  box: spec('box', new Color3(0.6, 0.45, 0.25), 0.5, { width: 1, height: 0.8, depth: 1 }),
  chest: spec('box', new Color3(0.55, 0.35, 0.12), 0.5, { width: 1.2, height: 0.7, depth: 0.8 }),
  lantern: spec('composite', new Color3(0.95, 0.8, 0.2), 0.35, {}, [
    { shape: 'cylinder', position: { x: 0, y: 0, z: 0 }, scaling: { x: 0.6, y: 0.8, z: 0.6 } },
    { shape: 'sphere', position: { x: 0, y: 0, z: 0 }, scaling: { x: 0.5, y: 0.5, z: 0.5 }, color: new Color3(1, 0.9, 0.3) },
  ]),
  rope: spec('cylinder', new Color3(0.7, 0.6, 0.35), 0.3, { diameter: 0.2, height: 1.5, tessellation: 8 }),
  weapon: spec('composite', new Color3(0.6, 0.6, 0.65), 0.4, {}, [
    { shape: 'box', position: { x: 0, y: 0, z: 0 }, scaling: { x: 0.1, y: 1.2, z: 0.1 } },
    { shape: 'box', position: { x: 0, y: 0.65, z: 0 }, scaling: { x: 0.5, y: 0.15, z: 0.1 } },
  ]),
  sword: spec('composite', new Color3(0.7, 0.7, 0.75), 0.4, {}, [
    { shape: 'box', position: { x: 0, y: 0.1, z: 0 }, scaling: { x: 0.08, y: 1.3, z: 0.04 } },
    { shape: 'box', position: { x: 0, y: -0.5, z: 0 }, scaling: { x: 0.4, y: 0.08, z: 0.08 } },
  ]),
  shield: spec('sphere', new Color3(0.45, 0.35, 0.2), 0.5, { diameter: 1, segments: 16 }),
  tool: spec('composite', new Color3(0.5, 0.4, 0.3), 0.4, {}, [
    { shape: 'cylinder', position: { x: 0, y: -0.2, z: 0 }, scaling: { x: 0.15, y: 0.8, z: 0.15 } },
    { shape: 'box', position: { x: 0, y: 0.35, z: 0 }, scaling: { x: 0.5, y: 0.3, z: 0.1 } },
  ]),

  // Furniture
  chair: spec('composite', new Color3(0.55, 0.35, 0.18), 0.4, {}, [
    { shape: 'box', position: { x: 0, y: 0, z: 0 }, scaling: { x: 0.7, y: 0.08, z: 0.7 } },
    { shape: 'box', position: { x: 0, y: 0.45, z: -0.3 }, scaling: { x: 0.7, y: 0.8, z: 0.08 } },
  ]),
  table: spec('composite', new Color3(0.5, 0.35, 0.15), 0.5, {}, [
    { shape: 'box', position: { x: 0, y: 0.3, z: 0 }, scaling: { x: 1.2, y: 0.08, z: 0.8 } },
    { shape: 'cylinder', position: { x: 0, y: 0, z: 0 }, scaling: { x: 0.15, y: 0.6, z: 0.15 } },
  ]),
  barrel: spec('cylinder', new Color3(0.5, 0.3, 0.12), 0.5, { diameter: 0.8, height: 1, tessellation: 12 }),
  door: spec('box', new Color3(0.45, 0.3, 0.15), 0.5, { width: 0.8, height: 1.6, depth: 0.1 }),

  // Collectibles
  gem: spec('sphere', new Color3(0.3, 0.8, 0.4), 0.3, { diameter: 0.8, segments: 8 }),
  coin: spec('cylinder', new Color3(1, 0.84, 0), 0.25, { diameter: 0.6, height: 0.08, tessellation: 24 }),
  crystal: spec('cone', new Color3(0.6, 0.4, 0.95), 0.4, { diameter: 0.5, height: 1.2, tessellation: 6 }),
  orb: spec('sphere', new Color3(0.4, 0.6, 1), 0.35, { diameter: 1, segments: 24 }),
  ring: spec('torus', new Color3(0.9, 0.8, 0.2), 0.3, { diameter: 0.6, thickness: 0.1, tessellation: 24 }),

  // Nature
  flower: spec('composite', new Color3(0.9, 0.3, 0.5), 0.3, {}, [
    { shape: 'cylinder', position: { x: 0, y: -0.15, z: 0 }, scaling: { x: 0.08, y: 0.5, z: 0.08 }, color: new Color3(0.2, 0.6, 0.15) },
    { shape: 'sphere', position: { x: 0, y: 0.15, z: 0 }, scaling: { x: 0.4, y: 0.3, z: 0.4 } },
  ]),
  mushroom: spec('composite', new Color3(0.85, 0.2, 0.15), 0.35, {}, [
    { shape: 'cylinder', position: { x: 0, y: -0.1, z: 0 }, scaling: { x: 0.2, y: 0.4, z: 0.2 }, color: new Color3(0.9, 0.85, 0.7) },
    { shape: 'sphere', position: { x: 0, y: 0.15, z: 0 }, scaling: { x: 0.6, y: 0.3, z: 0.6 } },
  ]),
  stone: spec('sphere', new Color3(0.5, 0.5, 0.48), 0.4, { diameter: 1, segments: 8 }),
  shell: spec('sphere', new Color3(0.95, 0.85, 0.75), 0.3, { diameter: 0.8, segments: 10 }),
  ball: spec('sphere', new Color3(0.9, 0.2, 0.2), 0.35, { diameter: 1, segments: 16 }),

  // Default fallback
  _default: spec('sphere', new Color3(0.7, 0.7, 0.7), 0.4, { diameter: 1, segments: 16 }),
};

/**
 * Procedural quest object mesh generator.
 *
 * Generates simple colored primitives for quest objects, with support for
 * composite shapes, glow effects, and label billboards. Designed as a
 * temporary placeholder system — the asset registry lookup allows real
 * GLTF models to replace procedural meshes transparently.
 */
export class ProceduralQuestObjects {
  private scene: Scene;
  private materialCache: Map<string, StandardMaterial> = new Map();
  private glowLayer: GlowLayer | null = null;
  /** External GLTF asset registry: objectType → Mesh template */
  private assetRegistry: Map<string, Mesh> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
    this.initGlowLayer();
  }

  // ── Public API ──

  /**
   * Register a real GLTF asset to replace a procedural object type.
   * When registered, `generate()` will clone the asset instead of building primitives.
   */
  public registerAsset(objectType: string, mesh: Mesh): void {
    mesh.setEnabled(false);
    this.assetRegistry.set(objectType.toLowerCase(), mesh);
  }

  /**
   * Check if a real asset is registered for an object type.
   */
  public hasAsset(objectType: string): boolean {
    return this.assetRegistry.has(objectType.toLowerCase());
  }

  /**
   * Generate a quest object mesh.
   * Tries asset registry first, falls back to procedural generation.
   */
  public generate(name: string, params: QuestObjectParams): QuestObjectResult {
    const type = params.objectType.toLowerCase();

    // Asset registry lookup — prefer real GLTF models
    const asset = this.assetRegistry.get(type);
    if (asset) {
      return this.cloneAsset(name, asset, params);
    }

    // Procedural fallback
    return this.generateProcedural(name, type, params);
  }

  /**
   * Look up a named color from the built-in palette.
   */
  public static getColor(name: string): Color3 | undefined {
    return COLORS[name.toLowerCase()];
  }

  /**
   * Get the list of supported object types.
   */
  public static getObjectTypes(): string[] {
    return Object.keys(OBJECT_REGISTRY).filter(k => k !== '_default');
  }

  /**
   * Clean up all cached materials and the glow layer.
   */
  public dispose(): void {
    this.materialCache.forEach(mat => mat.dispose());
    this.materialCache.clear();
    this.glowLayer?.dispose();
    this.glowLayer = null;
    this.assetRegistry.clear();
  }

  // ── Private helpers ──

  private initGlowLayer(): void {
    // Reuse existing glow layer if one exists on the scene
    const existing = this.scene.effectLayers?.find(
      l => l.name === 'questObjectGlow',
    ) as GlowLayer | undefined;
    if (existing) {
      this.glowLayer = existing;
      return;
    }
    this.glowLayer = new GlowLayer('questObjectGlow', this.scene, {
      blurKernelSize: 32,
    });
    this.glowLayer.intensity = 0.6;
  }

  private cloneAsset(name: string, asset: Mesh, params: QuestObjectParams): QuestObjectResult {
    let mesh: Mesh;
    if (asset.getTotalVertices() === 0 && asset.getChildMeshes().length > 0) {
      const root = asset.instantiateHierarchy(
        null,
        undefined,
        (source, clone) => { clone.name = `${source.name}_${name}`; },
      );
      mesh = (root as Mesh) || this.buildFallbackSphere(name);
      mesh.setEnabled(true);
      mesh.getChildMeshes().forEach(m => m.setEnabled(true));
    } else {
      mesh = asset.clone(`${name}_clone`) as Mesh;
      mesh.setEnabled(true);
    }

    const scale = params.size ?? 1;
    mesh.scaling = new Vector3(scale, scale, scale);

    this.addPulseAnimation(mesh, name);
    return { mesh };
  }

  private generateProcedural(
    name: string,
    type: string,
    params: QuestObjectParams,
  ): QuestObjectResult {
    const specDef = OBJECT_REGISTRY[type] || OBJECT_REGISTRY['_default'];
    const color = params.color || specDef.baseColor;
    const sizeMultiplier = (params.size ?? 1) * specDef.size;

    let mesh: Mesh;

    if (specDef.shape === 'composite' && specDef.parts) {
      mesh = this.buildComposite(name, specDef.parts, color, sizeMultiplier);
    } else {
      mesh = this.buildPrimitive(name, specDef.shape as Exclude<QuestObjectShape, 'composite'>, specDef.options, color, sizeMultiplier);
    }

    // Apply glow
    const removeGlow = this.addGlow(mesh, color);

    // Add pulse animation
    this.addPulseAnimation(mesh, name);

    return { mesh, removeGlow };
  }

  private buildPrimitive(
    name: string,
    shape: Exclude<QuestObjectShape, 'composite'>,
    options: Record<string, number>,
    color: Color3,
    size: number,
  ): Mesh {
    let mesh: Mesh;
    const meshName = `quest_proc_${name}`;

    switch (shape) {
      case 'sphere':
        mesh = MeshBuilder.CreateSphere(meshName, {
          diameter: (options.diameter ?? 1) * size,
          segments: options.segments ?? 16,
        }, this.scene);
        break;
      case 'box':
        mesh = MeshBuilder.CreateBox(meshName, {
          width: (options.width ?? 1) * size,
          height: (options.height ?? 1) * size,
          depth: (options.depth ?? 1) * size,
        }, this.scene);
        break;
      case 'cylinder':
        mesh = MeshBuilder.CreateCylinder(meshName, {
          diameter: (options.diameter ?? 1) * size,
          height: (options.height ?? 1) * size,
          tessellation: options.tessellation ?? 16,
        }, this.scene);
        break;
      case 'cone':
        mesh = MeshBuilder.CreateCylinder(meshName, {
          diameterTop: 0,
          diameterBottom: (options.diameter ?? 1) * size,
          height: (options.height ?? 1) * size,
          tessellation: options.tessellation ?? 8,
        }, this.scene);
        break;
      case 'torus':
        mesh = MeshBuilder.CreateTorus(meshName, {
          diameter: (options.diameter ?? 1) * size,
          thickness: (options.thickness ?? 0.2) * size,
          tessellation: options.tessellation ?? 24,
        }, this.scene);
        break;
      default:
        mesh = MeshBuilder.CreateSphere(meshName, { diameter: size }, this.scene);
    }

    mesh.material = this.getMaterial(color);
    return mesh;
  }

  private buildComposite(
    name: string,
    parts: QuestObjectPart[],
    baseColor: Color3,
    size: number,
  ): Mesh {
    const root = new TransformNode(`quest_proc_${name}_root`, this.scene) as unknown as Mesh;
    // Create an invisible root mesh so we can return a Mesh type
    const rootMesh = MeshBuilder.CreateBox(`quest_proc_${name}`, { size: 0.001 }, this.scene);
    rootMesh.isVisible = false;
    rootMesh.isPickable = false;

    parts.forEach((part, i) => {
      const partColor = part.color || baseColor;
      const partMesh = this.buildPrimitive(
        `${name}_part${i}`,
        part.shape,
        {}, // Options are controlled via scaling
        partColor,
        1,  // Size = 1, controlled by scaling below
      );
      partMesh.parent = rootMesh;
      partMesh.position = new Vector3(
        part.position.x * size,
        part.position.y * size,
        part.position.z * size,
      );
      partMesh.scaling = new Vector3(
        part.scaling.x * size,
        part.scaling.y * size,
        part.scaling.z * size,
      );
    });

    return rootMesh;
  }

  private getMaterial(color: Color3): StandardMaterial {
    const key = `questObj_${color.r.toFixed(2)}_${color.g.toFixed(2)}_${color.b.toFixed(2)}`;
    let mat = this.materialCache.get(key);
    if (!mat) {
      mat = new StandardMaterial(key, this.scene);
      mat.diffuseColor = color;
      mat.emissiveColor = color.scale(0.35);
      mat.specularColor = new Color3(0.2, 0.2, 0.2);
      mat.alpha = 0.92;
      this.materialCache.set(key, mat);
    }
    return mat;
  }

  private addGlow(mesh: Mesh, color: Color3): () => void {
    if (!this.glowLayer) return () => {};

    this.glowLayer.addIncludedOnlyMesh(mesh);
    // Also glow child meshes (for composites)
    mesh.getChildMeshes().forEach(child => {
      if (child instanceof Mesh) {
        this.glowLayer!.addIncludedOnlyMesh(child);
      }
    });

    // Set custom emissive color on glow layer for this mesh
    this.glowLayer.customEmissiveColorSelector = (m, _subMesh, _material, result) => {
      if (m === mesh || m.parent === mesh) {
        result.set(color.r * 0.5, color.g * 0.5, color.b * 0.5, 1);
      }
    };

    return () => {
      this.glowLayer?.removeIncludedOnlyMesh(mesh);
      mesh.getChildMeshes().forEach(child => {
        if (child instanceof Mesh) {
          this.glowLayer?.removeIncludedOnlyMesh(child);
        }
      });
    };
  }

  private addPulseAnimation(mesh: Mesh, name: string): void {
    const anim = new Animation(
      `quest_proc_pulse_${name}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE,
    );

    const base = mesh.scaling.clone();
    const up = base.scale(1.08);

    anim.setKeys([
      { frame: 0, value: base },
      { frame: 30, value: up },
      { frame: 60, value: base },
    ]);

    mesh.animations.push(anim);
    this.scene.beginAnimation(mesh, 0, 60, true);
  }

  private buildFallbackSphere(name: string): Mesh {
    const mesh = MeshBuilder.CreateSphere(`quest_proc_${name}_fallback`, {
      diameter: 0.8,
      segments: 16,
    }, this.scene);
    mesh.material = this.getMaterial(new Color3(0.7, 0.7, 0.7));
    return mesh;
  }
}
