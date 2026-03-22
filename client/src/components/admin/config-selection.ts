/**
 * Shared selection state for center ↔ right panel communication.
 * The center panel sets the selection; the right panel renders the editor + preview.
 */

import type {
  UnifiedBuildingTypeConfig,
  ProceduralStylePreset,
  GroundTypeConfig,
  CharacterModelConfig,
  NatureTypeConfig,
  ItemTypeConfig,
} from "@shared/game-engine/types";

export type ConfigSelection =
  | {
      module: 'building';
      typeName: string;
      category: string;
      config: UnifiedBuildingTypeConfig | undefined;
      categoryPreset: ProceduralStylePreset | undefined;
    }
  | {
      module: 'building-preset';
      category: string;
      preset: ProceduralStylePreset | undefined;
    }
  | {
      module: 'ground';
      groundType: string;
      config: GroundTypeConfig | undefined;
    }
  | {
      module: 'character';
      section: 'player' | 'npc';
      role: string;
      config: CharacterModelConfig | undefined;
    }
  | {
      module: 'nature';
      group: string;
      item: string;
      config: NatureTypeConfig | undefined;
    }
  | {
      module: 'item';
      group: string;
      item: string;
      config: ItemTypeConfig | undefined;
    }
  | null;
