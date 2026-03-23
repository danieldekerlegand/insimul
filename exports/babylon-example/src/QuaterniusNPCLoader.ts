/**
 * QuaterniusNPCLoader — Loads composite Quaternius NPC models (body + hair + outfit)
 * and assembles them under a single root mesh for use in the game rendering pipeline.
 *
 * Each NPC is composed of separate GLTF/GLB parts selected deterministically
 * based on character ID, gender, and role. Parts are cached as templates
 * for efficient cloning.
 */

import {
  AbstractMesh,
  Mesh,
  Scene,
  SceneLoader,
  Skeleton,
  Vector3,
} from '@babylonjs/core';

import {
  bodies,
  hair,
  outfits,
  type GenderedAssetEntry,
  type HairAssetEntry,
  type OutfitPartEntry,
  type Gender,
} from '@shared/game-engine/quaternius-asset-manifest';

import type { NPCRole } from './NPCModelInstancer';

// --- Types ---

/** Configuration for a complete quaternius NPC appearance */
export interface QuaterniusNPCConfig {
  body: GenderedAssetEntry;
  hair: HairAssetEntry | null;
  outfit: OutfitPartEntry;
}

/** Result of loading a quaternius NPC */
export interface QuaterniusNPCResult {
  root: Mesh;
  skeleton: Skeleton | null;
  animationGroups: any[];
}

/** Cached template for a single loaded part */
interface PartTemplate {
  sourceMesh: Mesh;
  allMeshes: AbstractMesh[];
  skeleton: Skeleton | null;
  animationGroups: any[];
}

// --- Deterministic hashing (matches NPCModelVariety) ---

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// --- Role to outfit mapping ---

const ROLE_OUTFIT_MAP: Record<NPCRole, string[]> = {
  guard: ['ranger'],
  soldier: ['ranger'],
  merchant: ['peasant'],
  questgiver: ['ranger', 'peasant'],
  civilian: ['peasant'],
  farmer: ['peasant'],
  blacksmith: ['peasant'],
  innkeeper: ['peasant'],
  priest: ['peasant'],
  teacher: ['peasant'],
  doctor: ['peasant'],
  child: ['peasant'],
  elder: ['peasant'],
  noble: ['ranger', 'peasant'],
  beggar: ['peasant'],
  sailor: ['ranger'],
};

// --- Selection functions ---

/**
 * Select a quaternius NPC configuration deterministically based on character attributes.
 */
export function selectQuaterniusConfig(
  characterId: string,
  gender: Gender,
  role: NPCRole,
): QuaterniusNPCConfig {
  const hash = hashString(characterId);

  // Select body
  const genderBodies = bodies.filter((b) => b.gender === gender);
  const body = genderBodies[hash % genderBodies.length];

  // Select hair (prefer rigged for animation compatibility)
  const genderHair = hair.filter(
    (h) => h.rigged && (h.genderAffinity === gender || h.genderAffinity === null),
  );
  // Use a different hash seed for hair to avoid correlation with body
  const hairHash = hashString(characterId + '_hair');
  // ~20% chance of no hair (bald)
  const selectedHair =
    hairHash % 5 === 0 ? null : genderHair[hairHash % genderHair.length];

  // Select outfit based on role
  const preferredSets = ROLE_OUTFIT_MAP[role] || ['peasant'];
  const outfitHash = hashString(characterId + '_outfit');
  const outfitSet = preferredSets[outfitHash % preferredSets.length];

  // Get the full outfit for this gender + set
  const fullOutfits = outfits.filter(
    (o) => o.gender === gender && o.outfitSet === outfitSet && o.part === 'full',
  );
  const outfit = fullOutfits.length > 0
    ? fullOutfits[outfitHash % fullOutfits.length]
    : outfits.filter((o) => o.gender === gender && o.part === 'full')[0];

  return { body, hair: selectedHair, outfit };
}

/**
 * Normalize a character gender string to the Quaternius Gender type.
 */
export function normalizeToQuaterniusGender(gender?: string): Gender {
  const g = (gender || '').toLowerCase();
  if (g === 'female' || g === 'f') return 'female';
  return 'male'; // Default to male for unknown/nonbinary since quaternius only has male/female
}

/**
 * Build a cache key for a quaternius NPC configuration.
 */
export function buildCacheKey(config: QuaterniusNPCConfig): string {
  const parts = [config.body.id, config.outfit.id];
  if (config.hair) parts.push(config.hair.id);
  return `quat_${parts.join('+')}`;
}

// --- Main loader class ---

export class QuaterniusNPCLoader {
  private scene: Scene;
  private partTemplates: Map<string, PartTemplate> = new Map();
  private compositeTemplates: Map<string, PartTemplate> = new Map();

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Load a quaternius NPC from component parts (body + hair + outfit).
   * Uses cached templates for parts already loaded.
   */
  async load(
    characterId: string,
    config: QuaterniusNPCConfig,
  ): Promise<QuaterniusNPCResult | null> {
    const cacheKey = buildCacheKey(config);

    // Check composite cache first
    const cached = this.compositeTemplates.get(cacheKey);
    if (cached) {
      return this.cloneFromComposite(cached, characterId);
    }

    // Load body (required)
    const bodyTemplate = await this.loadPart(config.body.id, config.body.path);
    if (!bodyTemplate) return null;

    // The body is the root — clone it as the base
    const root = this.cloneMesh(bodyTemplate, `quat_npc_${characterId}`);
    if (!root) return null;

    // Load and attach outfit
    const outfitTemplate = await this.loadPart(config.outfit.id, config.outfit.path);
    if (outfitTemplate) {
      const outfitClone = this.cloneMesh(outfitTemplate, `quat_outfit_${characterId}`);
      if (outfitClone) {
        outfitClone.parent = root;
        outfitClone.position = Vector3.Zero();
      }
    }

    // Load and attach hair
    if (config.hair) {
      const hairTemplate = await this.loadPart(config.hair.id, config.hair.path);
      if (hairTemplate) {
        const hairClone = this.cloneMesh(hairTemplate, `quat_hair_${characterId}`);
        if (hairClone) {
          hairClone.parent = root;
          hairClone.position = Vector3.Zero();
        }
      }
    }

    // Store as composite template for future clones
    // (Store the body template as the composite since root structure matches)
    if (!this.compositeTemplates.has(cacheKey)) {
      this.compositeTemplates.set(cacheKey, {
        sourceMesh: root,
        allMeshes: [root, ...root.getChildMeshes()],
        skeleton: bodyTemplate.skeleton,
        animationGroups: bodyTemplate.animationGroups,
      });
      // Hide the composite template and create a new clone for the caller
      root.setEnabled(false);
      root.name = `__quat_template_${cacheKey}`;
      const result = this.cloneFromComposite(
        this.compositeTemplates.get(cacheKey)!,
        characterId,
      );
      return result;
    }

    root.setEnabled(true);
    return {
      root,
      skeleton: bodyTemplate.skeleton
        ? bodyTemplate.skeleton.clone(`skeleton_quat_${characterId}`)
        : null,
      animationGroups: bodyTemplate.animationGroups,
    };
  }

  /**
   * Load a quaternius NPC with automatic config selection.
   */
  async loadForCharacter(
    characterId: string,
    gender: Gender,
    role: NPCRole,
  ): Promise<QuaterniusNPCResult | null> {
    const config = selectQuaterniusConfig(characterId, gender, role);
    return this.load(characterId, config);
  }

  /**
   * Check if quaternius assets are available by verifying at least one body exists.
   */
  hasAssets(): boolean {
    return bodies.length > 0 && outfits.length > 0;
  }

  /**
   * Get loader statistics.
   */
  getStats(): { partTemplates: number; compositeTemplates: number } {
    return {
      partTemplates: this.partTemplates.size,
      compositeTemplates: this.compositeTemplates.size,
    };
  }

  /**
   * Dispose all cached templates.
   */
  dispose(): void {
    this.compositeTemplates.forEach((template) => {
      template.sourceMesh.setEnabled(true);
      template.allMeshes.forEach((m) => {
        if (!m.isDisposed()) m.dispose();
      });
    });
    this.compositeTemplates.clear();

    this.partTemplates.forEach((template) => {
      template.sourceMesh.setEnabled(true);
      template.allMeshes.forEach((m) => {
        if (!m.isDisposed()) m.dispose();
      });
    });
    this.partTemplates.clear();
  }

  // --- Internal ---

  private async loadPart(
    partId: string,
    path: string,
  ): Promise<PartTemplate | null> {
    const cached = this.partTemplates.get(partId);
    if (cached) return cached;

    try {
      const lastSlash = path.lastIndexOf('/');
      const rootUrl = path.substring(0, lastSlash + 1);
      const file = path.substring(lastSlash + 1);

      const result = await SceneLoader.ImportMeshAsync(
        '',
        rootUrl,
        file,
        this.scene,
      );

      const root = this.selectRoot(result.meshes);
      if (!root) {
        result.meshes.forEach((m) => m.dispose());
        return null;
      }

      // Reparent sibling meshes
      for (const m of result.meshes) {
        if (m !== root && !m.parent) {
          m.parent = root;
        }
      }

      // Hide template
      root.setEnabled(false);
      root.name = `__quat_part_${partId}`;

      const template: PartTemplate = {
        sourceMesh: root,
        allMeshes: result.meshes,
        skeleton: result.skeletons?.[0] ?? null,
        animationGroups: result.animationGroups || [],
      };

      this.partTemplates.set(partId, template);
      return template;
    } catch {
      return null;
    }
  }

  private selectRoot(meshes: AbstractMesh[]): Mesh | null {
    const explicit = meshes.find(
      (m) => m.name === '__root__' && m instanceof Mesh,
    ) as Mesh | undefined;
    if (explicit) return explicit;

    const skinned = meshes.find((m) => !!m.skeleton) as Mesh | undefined;
    if (skinned) return skinned;

    return (meshes.find((m) => m instanceof Mesh) as Mesh) ?? null;
  }

  private cloneMesh(template: PartTemplate, name: string): Mesh | null {
    try {
      const clone = template.sourceMesh.clone(name, null);
      if (!clone) return null;
      clone.setEnabled(true);
      return clone;
    } catch {
      return null;
    }
  }

  private cloneFromComposite(
    template: PartTemplate,
    characterId: string,
  ): QuaterniusNPCResult | null {
    const root = template.sourceMesh.clone(`quat_npc_${characterId}`, null);
    if (!root) return null;
    root.setEnabled(true);

    // Clone skeleton for independent animation
    let skeleton: Skeleton | null = null;
    if (template.skeleton) {
      skeleton = template.skeleton.clone(`skeleton_quat_${characterId}`);
      root.skeleton = skeleton;
      for (const child of root.getChildMeshes()) {
        if (child instanceof Mesh && child.skeleton) {
          child.skeleton = skeleton;
        }
      }
    }

    // Clone animation groups
    const animationGroups: any[] = [];
    for (const ag of template.animationGroups) {
      if (ag && typeof ag.clone === 'function') {
        animationGroups.push(ag.clone(`${ag.name}_${characterId}`));
      } else {
        animationGroups.push(ag);
      }
    }

    return { root, skeleton, animationGroups };
  }
}
