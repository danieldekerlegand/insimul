/**
 * NPC Appearance Configuration
 *
 * Stored in the world's `config.npcAppearance` JSONB field.
 * Controls genre-specific model selection and diversity settings for NPCs.
 */

/** Character style presets that map to genre-appropriate NPC model sets */
export const CHARACTER_STYLES = [
  'medieval',
  'fantasy',
  'modern',
  'sci-fi',
  'historical',
  'cyberpunk',
  'steampunk',
  'custom',
] as const;

export type CharacterStyle = (typeof CHARACTER_STYLES)[number];

/** How much visual variation NPCs should have */
export const DIVERSITY_LEVELS = ['low', 'medium', 'high'] as const;
export type DiversityLevel = (typeof DIVERSITY_LEVELS)[number];

/** Per-role model override — lets designers pick a specific asset for a role */
export interface RoleModelOverride {
  role: string; // e.g. 'civilian', 'guard', 'merchant', 'questgiver'
  assetId: string; // VisualAsset ID
  label?: string; // display label
}

/**
 * NPC Appearance configuration for a world.
 * Stored under `world.config.npcAppearance`.
 */
export interface NpcAppearanceConfig {
  /** Genre style that guides which model set to use */
  characterStyle: CharacterStyle;

  /** Diversity level — controls how many model variants are used */
  diversityLevel: DiversityLevel;

  /** Whether to use gender-specific models (male/female variants) */
  enableGenderModels: boolean;

  /** Per-role model overrides (take precedence over style defaults) */
  roleOverrides: RoleModelOverride[];
}

/** Default config when none is set */
export const DEFAULT_NPC_APPEARANCE_CONFIG: NpcAppearanceConfig = {
  characterStyle: 'medieval',
  diversityLevel: 'medium',
  enableGenderModels: true,
  roleOverrides: [],
};

/** Map worldType strings to the closest CharacterStyle */
export function worldTypeToCharacterStyle(worldType: string | null | undefined): CharacterStyle {
  if (!worldType) return 'medieval';
  const wt = worldType.toLowerCase();
  if (wt.includes('cyberpunk')) return 'cyberpunk';
  if (wt.includes('sci-fi') || wt.includes('space')) return 'sci-fi';
  if (wt.includes('steampunk')) return 'steampunk';
  if (wt.includes('modern') || wt.includes('contemporary') || wt.includes('realistic')) return 'modern';
  if (wt.includes('historical')) return 'historical';
  if (wt.includes('fantasy')) return 'fantasy';
  if (wt.includes('medieval')) return 'medieval';
  return 'custom';
}

/** Human-readable labels for character styles */
export const CHARACTER_STYLE_LABELS: Record<CharacterStyle, string> = {
  medieval: 'Medieval',
  fantasy: 'Fantasy',
  modern: 'Modern',
  'sci-fi': 'Sci-Fi',
  historical: 'Historical',
  cyberpunk: 'Cyberpunk',
  steampunk: 'Steampunk',
  custom: 'Custom',
};

/** Human-readable labels for diversity levels */
export const DIVERSITY_LEVEL_LABELS: Record<DiversityLevel, string> = {
  low: 'Low — 1-2 model variants',
  medium: 'Medium — 3-4 model variants',
  high: 'High — 5+ model variants',
};
