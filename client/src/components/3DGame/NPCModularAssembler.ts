/**
 * NPCModularAssembler — Assembles NPCs from modular body parts (body, arms,
 * legs, feet, hair, accessories) loaded from Quaternius character assets.
 *
 * Each body part is loaded once as a hidden template, then cloned per NPC.
 * Appearance variation (skin tone, clothing color, hair, scale) is driven
 * deterministically by the character ID hash via NPCAppearanceGenerator.
 */

import {
  AbstractMesh,
  Color3,
  Mesh,
  Scene,
  SceneLoader,
  StandardMaterial,
  TransformNode,
  Vector3,
} from '@babylonjs/core';
import { CHARACTERS_BASE } from '@shared/asset-paths';
import { hashString, hashFloat, generateNPCAppearance, type NPCRole } from './NPCAppearanceGenerator';

// --- Types ---

export type NPCGender = 'male' | 'female';

/** Body part slot identifiers */
export type BodyPartSlot = 'body' | 'arms' | 'legs' | 'feet' | 'head_hood' | 'acc_pauldron';

/** Hair style identifiers */
export type HairStyle = 'long' | 'simpleparted' | 'buzzed' | 'buns' | 'buzzedfemale' | 'beard';

/** Outfit type identifiers */
export type OutfitType = 'peasant' | 'ranger';

/** Configuration for assembling an NPC */
export interface NPCAssemblyConfig {
  characterId: string;
  gender: NPCGender;
  role: NPCRole;
  outfit?: OutfitType;
}

/** Result of assembling an NPC */
export interface AssembledNPC {
  root: TransformNode;
  parts: Map<string, AbstractMesh>;
  hairMesh: AbstractMesh | null;
  eyebrowMesh: AbstractMesh | null;
}

/** Stored template for a loaded body part */
interface PartTemplate {
  sourceMesh: AbstractMesh;
  allMeshes: AbstractMesh[];
}

// --- Constants ---

const QUATERNIUS_BASE = `/${CHARACTERS_BASE}/quaternius`;

/** Core body part slots for each outfit */
const CORE_SLOTS: BodyPartSlot[] = ['body', 'arms', 'legs', 'feet'];

/** Extra slots available per outfit type and gender */
const EXTRA_SLOTS: Record<OutfitType, Record<NPCGender, BodyPartSlot[]>> = {
  peasant: { male: [], female: [] },
  ranger: {
    male: ['head_hood', 'acc_pauldron'],
    female: ['head_hood', 'acc_pauldron'],
  },
};

/** Hair styles available per gender */
const HAIR_STYLES: Record<NPCGender, HairStyle[]> = {
  female: ['long', 'simpleparted', 'buns', 'buzzedfemale'],
  male: ['buzzed', 'simpleparted', 'long'],
};

/** Hair color palette */
const HAIR_COLORS: Color3[] = [
  new Color3(0.15, 0.10, 0.07), // black
  new Color3(0.35, 0.22, 0.12), // dark brown
  new Color3(0.55, 0.38, 0.20), // medium brown
  new Color3(0.70, 0.52, 0.28), // light brown
  new Color3(0.85, 0.68, 0.35), // blonde
  new Color3(0.60, 0.25, 0.12), // auburn
  new Color3(0.75, 0.55, 0.45), // strawberry blonde
  new Color3(0.30, 0.28, 0.28), // dark grey
];

/** Available outfit types */
const OUTFIT_TYPES: OutfitType[] = ['peasant', 'ranger'];

// --- Helpers ---

/** Build the directory name for a body part */
function partDirName(gender: NPCGender, outfit: OutfitType, slot: BodyPartSlot): string {
  // Special cases for non-standard naming
  if (outfit === 'ranger' && slot === 'feet') {
    return gender === 'male'
      ? `outfit_${gender}_ranger_feet_boots`
      : `outfit_${gender}_ranger_feet`;
  }
  if (outfit === 'ranger' && slot === 'acc_pauldron') {
    return gender === 'male'
      ? `outfit_${gender}_ranger_acc_pauldron`
      : `outfit_${gender}_ranger_acc_pauldrons`;
  }
  return `outfit_${gender}_${outfit}_${slot}`;
}

/** Build the gltf filename for a body part */
function partFileName(gender: NPCGender, outfit: OutfitType, slot: BodyPartSlot): string {
  const dir = partDirName(gender, outfit, slot);
  return `${dir}.gltf`;
}

/** Build the directory name for a hair style */
function hairDirName(style: HairStyle): string {
  return `hair_hair_${style}`;
}

/** Select root mesh from loaded mesh array */
function selectRootMesh(meshes: AbstractMesh[]): AbstractMesh | null {
  const root = meshes.find(m => m.name === '__root__');
  if (root) return root;
  return meshes.find(m => m instanceof Mesh) ?? null;
}

// --- Main Class ---

export class NPCModularAssembler {
  private scene: Scene;

  /** Cached body part templates: key = "gender_outfit_slot" */
  private partTemplates: Map<string, PartTemplate> = new Map();

  /** Cached hair templates: key = hair style name */
  private hairTemplates: Map<string, PartTemplate> = new Map();

  /** Cached eyebrow templates: key = "eyebrows_gender" */
  private eyebrowTemplates: Map<string, PartTemplate> = new Map();

  /** Track how many NPCs have been assembled (for stats) */
  private assembledCount = 0;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Preload all body part templates for both genders and outfits.
   * Call during asset loading phase. Failed loads are silently skipped.
   */
  async preloadTemplates(): Promise<void> {
    const loadPromises: Promise<void>[] = [];

    for (const gender of ['male', 'female'] as NPCGender[]) {
      for (const outfit of OUTFIT_TYPES) {
        // Core slots
        for (const slot of CORE_SLOTS) {
          loadPromises.push(this.loadPartTemplate(gender, outfit, slot));
        }
        // Extra slots
        const extras = EXTRA_SLOTS[outfit][gender];
        for (const slot of extras) {
          loadPromises.push(this.loadPartTemplate(gender, outfit, slot));
        }
      }
    }

    await Promise.all(loadPromises);
  }

  /**
   * Preload all hair and eyebrow templates.
   * Call during asset loading phase.
   */
  async preloadHairTemplates(): Promise<void> {
    const loadPromises: Promise<void>[] = [];

    // Hair styles
    const allStyles = new Set<HairStyle>([
      ...HAIR_STYLES.male,
      ...HAIR_STYLES.female,
      'beard',
    ]);
    for (const style of allStyles) {
      loadPromises.push(this.loadHairTemplate(style));
    }

    // Eyebrows
    loadPromises.push(this.loadEyebrowTemplate('regular'));
    loadPromises.push(this.loadEyebrowTemplate('female'));

    await Promise.all(loadPromises);
  }

  /**
   * Assemble a complete NPC from modular parts.
   *
   * @param config - Assembly configuration
   * @returns Assembled NPC with root transform node and part references, or null on failure
   */
  assembleNPC(config: NPCAssemblyConfig): AssembledNPC | null {
    const { characterId, gender, role } = config;
    const hash = hashString(characterId);
    const appearance = generateNPCAppearance(characterId, role);

    // Select outfit deterministically
    const outfitVal = hashFloat(hash, 10);
    const outfit = config.outfit ?? OUTFIT_TYPES[Math.floor(outfitVal * OUTFIT_TYPES.length) % OUTFIT_TYPES.length];

    // Create root transform node
    const root = new TransformNode(`npc_modular_${characterId}`, this.scene);

    // Apply height/width variation
    const heightVal = hashFloat(hash, 11);
    const widthVal = hashFloat(hash, 12);
    const heightScale = 0.85 + heightVal * 0.30; // 0.85 to 1.15
    const widthScale = 0.90 + widthVal * 0.20;   // 0.90 to 1.10
    root.scaling = new Vector3(widthScale, heightScale, widthScale);

    const parts = new Map<string, AbstractMesh>();

    // Clone and attach core body parts
    for (const slot of CORE_SLOTS) {
      const cloned = this.clonePart(gender, outfit, slot, characterId);
      if (cloned) {
        cloned.parent = root;
        parts.set(slot, cloned);

        // Apply colors to cloned meshes
        this.applyPartColors(cloned, slot, appearance.skinColor, appearance.clothingColor, appearance.accentColor);
      }
    }

    // Clone and attach extra parts (hoods, pauldrons) based on outfit
    const extras = EXTRA_SLOTS[outfit][gender];
    for (const slot of extras) {
      // Deterministically decide whether to show optional accessories
      const showVal = hashFloat(hash, 13 + extras.indexOf(slot));
      if (showVal > 0.5) {
        const cloned = this.clonePart(gender, outfit, slot, characterId);
        if (cloned) {
          cloned.parent = root;
          parts.set(slot, cloned);
          this.applyPartColors(cloned, slot, appearance.skinColor, appearance.clothingColor, appearance.accentColor);
        }
      }
    }

    // Attach hair
    const hairMesh = this.selectAndCloneHair(characterId, gender, hash);
    if (hairMesh) {
      hairMesh.parent = root;
      const hairColorVal = hashFloat(hash, 20);
      const hairColor = HAIR_COLORS[Math.floor(hairColorVal * HAIR_COLORS.length) % HAIR_COLORS.length];
      this.applyColorToMesh(hairMesh, hairColor);
    }

    // Attach eyebrows
    const eyebrowKey = gender === 'female' ? 'female' : 'regular';
    const eyebrowMesh = this.cloneEyebrow(eyebrowKey, characterId);
    if (eyebrowMesh) {
      eyebrowMesh.parent = root;
      // Match eyebrow color to hair
      if (hairMesh) {
        const hairMat = this.getFirstMaterial(hairMesh);
        if (hairMat) {
          this.applyColorToMesh(eyebrowMesh, hairMat.diffuseColor);
        }
      }
    }

    // If no parts were cloned at all, clean up and return null
    if (parts.size === 0) {
      root.dispose();
      return null;
    }

    this.assembledCount++;
    return { root, parts, hairMesh, eyebrowMesh };
  }

  /**
   * Get assembler statistics.
   */
  getStats(): { partTemplates: number; hairTemplates: number; eyebrowTemplates: number; assembled: number } {
    return {
      partTemplates: this.partTemplates.size,
      hairTemplates: this.hairTemplates.size,
      eyebrowTemplates: this.eyebrowTemplates.size,
      assembled: this.assembledCount,
    };
  }

  /**
   * Dispose all templates and free resources.
   */
  dispose(): void {
    for (const template of this.partTemplates.values()) {
      for (const m of template.allMeshes) {
        if (!m.isDisposed()) m.dispose();
      }
    }
    this.partTemplates.clear();

    for (const template of this.hairTemplates.values()) {
      for (const m of template.allMeshes) {
        if (!m.isDisposed()) m.dispose();
      }
    }
    this.hairTemplates.clear();

    for (const template of this.eyebrowTemplates.values()) {
      for (const m of template.allMeshes) {
        if (!m.isDisposed()) m.dispose();
      }
    }
    this.eyebrowTemplates.clear();

    this.assembledCount = 0;
  }

  // --- Internal: Template loading ---

  private async loadPartTemplate(gender: NPCGender, outfit: OutfitType, slot: BodyPartSlot): Promise<void> {
    const key = `${gender}_${outfit}_${slot}`;
    if (this.partTemplates.has(key)) return;

    const dir = partDirName(gender, outfit, slot);
    const file = partFileName(gender, outfit, slot);
    const rootUrl = `${QUATERNIUS_BASE}/${dir}/`;

    try {
      const result = await SceneLoader.ImportMeshAsync('', rootUrl, file, this.scene);
      const root = selectRootMesh(result.meshes);
      if (!root) {
        result.meshes.forEach(m => m.dispose());
        return;
      }

      // Reparent orphan meshes under root
      for (const m of result.meshes) {
        if (m !== root && !m.parent) {
          m.parent = root;
        }
      }

      // Hide template
      root.setEnabled(false);
      root.name = `__template_part_${key}`;

      this.partTemplates.set(key, { sourceMesh: root, allMeshes: result.meshes });
    } catch {
      // Asset not found — silently skip
    }
  }

  private async loadHairTemplate(style: HairStyle): Promise<void> {
    if (this.hairTemplates.has(style)) return;

    const dir = hairDirName(style);
    const rootUrl = `${QUATERNIUS_BASE}/${dir}/`;
    const file = `${dir}.gltf`;

    try {
      const result = await SceneLoader.ImportMeshAsync('', rootUrl, file, this.scene);
      const root = selectRootMesh(result.meshes);
      if (!root) {
        result.meshes.forEach(m => m.dispose());
        return;
      }

      for (const m of result.meshes) {
        if (m !== root && !m.parent) m.parent = root;
      }

      root.setEnabled(false);
      root.name = `__template_hair_${style}`;

      this.hairTemplates.set(style, { sourceMesh: root, allMeshes: result.meshes });
    } catch {
      // Asset not found — silently skip
    }
  }

  private async loadEyebrowTemplate(type: string): Promise<void> {
    const key = `eyebrows_${type}`;
    if (this.eyebrowTemplates.has(key)) return;

    const dir = `hair_eyebrows_${type}`;
    const rootUrl = `${QUATERNIUS_BASE}/${dir}/`;
    const file = `${dir}.gltf`;

    try {
      const result = await SceneLoader.ImportMeshAsync('', rootUrl, file, this.scene);
      const root = selectRootMesh(result.meshes);
      if (!root) {
        result.meshes.forEach(m => m.dispose());
        return;
      }

      for (const m of result.meshes) {
        if (m !== root && !m.parent) m.parent = root;
      }

      root.setEnabled(false);
      root.name = `__template_${key}`;

      this.eyebrowTemplates.set(key, { sourceMesh: root, allMeshes: result.meshes });
    } catch {
      // Asset not found — silently skip
    }
  }

  // --- Internal: Cloning ---

  private clonePart(gender: NPCGender, outfit: OutfitType, slot: BodyPartSlot, npcId: string): AbstractMesh | null {
    const key = `${gender}_${outfit}_${slot}`;
    const template = this.partTemplates.get(key);
    if (!template) return null;

    try {
      const clone = (template.sourceMesh as Mesh).clone(`part_${slot}_${npcId}`, null);
      if (!clone) return null;
      clone.setEnabled(true);
      // Enable child meshes too
      for (const child of clone.getChildMeshes()) {
        child.setEnabled(true);
      }
      return clone;
    } catch {
      return null;
    }
  }

  private selectAndCloneHair(characterId: string, gender: NPCGender, hash: number): AbstractMesh | null {
    const styles = HAIR_STYLES[gender];
    const hairVal = hashFloat(hash, 15);
    const styleIndex = Math.floor(hairVal * styles.length) % styles.length;
    const style = styles[styleIndex];

    const template = this.hairTemplates.get(style);
    if (!template) return null;

    try {
      const clone = (template.sourceMesh as Mesh).clone(`hair_${style}_${characterId}`, null);
      if (!clone) return null;
      clone.setEnabled(true);
      for (const child of clone.getChildMeshes()) {
        child.setEnabled(true);
      }

      // Males have a 40% chance of a beard
      if (gender === 'male') {
        const beardVal = hashFloat(hash, 16);
        if (beardVal < 0.4) {
          const beardTemplate = this.hairTemplates.get('beard');
          if (beardTemplate) {
            const beardClone = (beardTemplate.sourceMesh as Mesh).clone(`beard_${characterId}`, clone);
            if (beardClone) {
              beardClone.setEnabled(true);
              for (const child of beardClone.getChildMeshes()) {
                child.setEnabled(true);
              }
            }
          }
        }
      }

      return clone;
    } catch {
      return null;
    }
  }

  private cloneEyebrow(type: string, npcId: string): AbstractMesh | null {
    const key = `eyebrows_${type}`;
    const template = this.eyebrowTemplates.get(key);
    if (!template) return null;

    try {
      const clone = (template.sourceMesh as Mesh).clone(`eyebrow_${npcId}`, null);
      if (!clone) return null;
      clone.setEnabled(true);
      for (const child of clone.getChildMeshes()) {
        child.setEnabled(true);
      }
      return clone;
    } catch {
      return null;
    }
  }

  // --- Internal: Material/color application ---

  /** Apply skin, clothing, and accent colors to a body part based on slot type */
  private applyPartColors(
    mesh: AbstractMesh,
    slot: BodyPartSlot,
    skinColor: Color3,
    clothingColor: Color3,
    accentColor: Color3,
  ): void {
    // Body slot gets clothing color; skin-exposed parts get skin color on skin meshes
    const primaryColor = slot === 'body' || slot === 'arms' || slot === 'legs' || slot === 'feet'
      ? clothingColor
      : accentColor;

    const allMeshes = [mesh, ...mesh.getChildMeshes()];
    for (const m of allMeshes) {
      if (!(m.material instanceof StandardMaterial)) continue;

      // Clone material so each NPC has independent colors
      const mat = m.material.clone(`${m.material.name}_${mesh.name}`) as StandardMaterial;

      // Detect skin meshes by name convention (textures named with "skin" or "Regular")
      const matName = mat.name.toLowerCase();
      if (matName.includes('skin') || matName.includes('regular')) {
        mat.diffuseColor = Color3.Lerp(mat.diffuseColor, skinColor, 0.7);
      } else {
        mat.diffuseColor = Color3.Lerp(mat.diffuseColor, primaryColor, 0.5);
      }

      m.material = mat;
    }
  }

  /** Apply a single color tint to all StandardMaterial meshes in a hierarchy */
  private applyColorToMesh(mesh: AbstractMesh, color: Color3): void {
    const allMeshes = [mesh, ...mesh.getChildMeshes()];
    for (const m of allMeshes) {
      if (!(m.material instanceof StandardMaterial)) continue;
      const mat = m.material.clone(`${m.material.name}_${mesh.name}`) as StandardMaterial;
      mat.diffuseColor = Color3.Lerp(mat.diffuseColor, color, 0.6);
      m.material = mat;
    }
  }

  /** Get the first StandardMaterial from a mesh or its children */
  private getFirstMaterial(mesh: AbstractMesh): StandardMaterial | null {
    if (mesh.material instanceof StandardMaterial) return mesh.material;
    for (const child of mesh.getChildMeshes()) {
      if (child.material instanceof StandardMaterial) return child.material;
    }
    return null;
  }
}

// --- Exported constants for testing ---

export { HAIR_STYLES, HAIR_COLORS, OUTFIT_TYPES, CORE_SLOTS, EXTRA_SLOTS };
