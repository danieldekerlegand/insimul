/**
 * AssetCollectionLoader
 * 
 * Centralized service for loading 3D assets from a world's selected asset collection.
 * Replaces hardcoded asset paths with collection-based asset resolution.
 */

import type { VisualAsset } from "@shared/schema";
import type { InteriorTemplateConfig } from "@shared/game-engine/types";

export interface CollectionAssets {
  groundTexture: VisualAsset | null;
  roadTexture: VisualAsset | null;
  buildingModels: Map<string, VisualAsset>;
  natureModels: Map<string, VisualAsset>;
  characterModels: Map<string, VisualAsset>;
  objectModels: Map<string, VisualAsset>;
  allAssets: VisualAsset[];
  /** Per-building-type interior configs from the asset collection */
  interiorConfigs: Record<string, InteriorTemplateConfig>;
}

export interface World3DConfig {
  groundTextureId?: string;
  roadTextureId?: string;
  buildingModels?: Record<string, string>;
  natureModels?: Record<string, string>;
  characterModels?: Record<string, string>;
  objectModels?: Record<string, string>;
  /** Per-building-type interior configuration */
  buildingTypeConfigs?: Record<string, { interiorConfig?: InteriorTemplateConfig }>;
}

export class AssetCollectionLoader {
  private worldId: string;
  private collectionId: string | null;
  private assets: VisualAsset[] = [];
  private config3D: World3DConfig | null = null;

  constructor(worldId: string, collectionId: string | null = null) {
    this.worldId = worldId;
    this.collectionId = collectionId;
  }

  /**
   * Load all assets and 3D config for the world's selected collection
   */
  async load(): Promise<CollectionAssets> {
    try {
      // Fetch world's 3D config and assets
      const [configRes, assetsRes] = await Promise.all([
        fetch(`/api/worlds/${this.worldId}/3d-config`),
        fetch(`/api/worlds/${this.worldId}/assets`)
      ]);

      if (configRes.ok) {
        this.config3D = await configRes.json();
      }

      if (assetsRes.ok) {
        this.assets = await assetsRes.json();
      }

      return this.resolveAssets();
    } catch (error) {
      console.error('[AssetCollectionLoader] Failed to load assets:', error);
      return this.getEmptyAssets();
    }
  }

  /**
   * Resolve assets into organized categories based on 3D config
   */
  private resolveAssets(): CollectionAssets {
    const buildingModels = new Map<string, VisualAsset>();
    const natureModels = new Map<string, VisualAsset>();
    const characterModels = new Map<string, VisualAsset>();
    const objectModels = new Map<string, VisualAsset>();

    // Resolve building models from config
    if (this.config3D?.buildingModels) {
      for (const [role, assetId] of Object.entries(this.config3D.buildingModels)) {
        const asset = this.findAssetById(assetId);
        if (asset) {
          buildingModels.set(role, asset);
        }
      }
    }

    // Resolve nature models from config
    if (this.config3D?.natureModels) {
      for (const [role, assetId] of Object.entries(this.config3D.natureModels)) {
        const asset = this.findAssetById(assetId);
        if (asset) {
          natureModels.set(role, asset);
        }
      }
    }

    // Resolve character models from config
    if (this.config3D?.characterModels) {
      for (const [role, assetId] of Object.entries(this.config3D.characterModels)) {
        const asset = this.findAssetById(assetId);
        if (asset) {
          characterModels.set(role, asset);
        }
      }
    }

    // Resolve object/prop models from config
    if (this.config3D?.objectModels) {
      for (const [role, assetId] of Object.entries(this.config3D.objectModels)) {
        const asset = this.findAssetById(assetId);
        if (asset) {
          objectModels.set(role, asset);
        }
      }
    }

    // Resolve textures
    const groundTexture = this.config3D?.groundTextureId
      ? this.findAssetById(this.config3D.groundTextureId)
      : this.findFirstAssetByType('texture_ground');

    const roadTexture = this.config3D?.roadTextureId
      ? this.findAssetById(this.config3D.roadTextureId)
      : this.findFirstAssetByType('texture_material');

    // Extract interior configs from buildingTypeConfigs
    const interiorConfigs: Record<string, InteriorTemplateConfig> = {};
    if (this.config3D?.buildingTypeConfigs) {
      for (const [type, cfg] of Object.entries(this.config3D.buildingTypeConfigs)) {
        if (cfg.interiorConfig) {
          interiorConfigs[type] = cfg.interiorConfig;
        }
      }
    }

    return {
      groundTexture,
      roadTexture,
      buildingModels,
      natureModels,
      characterModels,
      objectModels,
      allAssets: this.assets,
      interiorConfigs,
    };
  }

  private findAssetById(id: string): VisualAsset | null {
    return this.assets.find(a => a.id === id) || null;
  }

  private findFirstAssetByType(assetType: string): VisualAsset | null {
    return this.assets.find(a => a.assetType === assetType) || null;
  }

  private getEmptyAssets(): CollectionAssets {
    return {
      groundTexture: null,
      roadTexture: null,
      buildingModels: new Map(),
      natureModels: new Map(),
      characterModels: new Map(),
      objectModels: new Map(),
      allAssets: [],
      interiorConfigs: {},
    };
  }

  /**
   * Get a building model by role (e.g., 'default', 'smallResidence', 'tavern')
   */
  getBuildingModel(role: string, assets: CollectionAssets): VisualAsset | null {
    return assets.buildingModels.get(role) || assets.buildingModels.get('default') || null;
  }

  /**
   * Get a nature model by role (e.g., 'defaultTree', 'oak', 'pine')
   */
  getNatureModel(role: string, assets: CollectionAssets): VisualAsset | null {
    return assets.natureModels.get(role) || assets.natureModels.get('defaultTree') || null;
  }

  /**
   * Get a character model by role (e.g., 'npcDefault', 'guard', 'merchant').
   * Supports gender-aware lookups: tries role_gender first, then role, then npcDefault.
   */
  getCharacterModel(role: string, assets: CollectionAssets, gender?: string): VisualAsset | null {
    if (gender) {
      const genderKey = `${role}_${gender.toLowerCase()}`;
      const genderMatch = assets.characterModels.get(genderKey);
      if (genderMatch) return genderMatch;
    }
    return assets.characterModels.get(role) || assets.characterModels.get('npcDefault') || null;
  }

  /**
   * Get an object/prop model by role (e.g., 'chest', 'sword', 'crate')
   */
  getObjectModel(role: string, assets: CollectionAssets): VisualAsset | null {
    return assets.objectModels.get(role) || null;
  }
}
