/**
 * NPCModelManifest — Maps NPC attributes (gender, body type, role, genre)
 * to 3D model asset paths. Provides diverse character representation with
 * multiple body types per gender and genre-appropriate variants.
 */

export type NPCGender = 'male' | 'female' | 'nonbinary';
export type NPCBodyType = 'average' | 'athletic' | 'heavy' | 'slim';
export type NPCGenreCategory = 'fantasy' | 'scifi' | 'modern' | 'generic';
export type NPCRoleType = 'civilian' | 'guard' | 'merchant' | 'questgiver';

export interface NPCModelEntry {
  /** Relative path from public root (e.g. /assets/characters/fantasy/npc_male_average.glb) */
  path: string;
  /** Genre category this model belongs to */
  genre: NPCGenreCategory;
  /** Gender this model represents */
  gender: NPCGender;
  /** Body type variant */
  bodyType: NPCBodyType;
  /** Optional role-specific model (null = generic for any role) */
  role: NPCRoleType | null;
}

/** Full manifest of all available NPC models */
const MODEL_MANIFEST: NPCModelEntry[] = [
  // === Fantasy genre ===
  // Male variants
  { path: '/assets/characters/fantasy/npc_male_average.glb', genre: 'fantasy', gender: 'male', bodyType: 'average', role: null },
  { path: '/assets/characters/fantasy/npc_male_athletic.glb', genre: 'fantasy', gender: 'male', bodyType: 'athletic', role: null },
  { path: '/assets/characters/fantasy/npc_male_heavy.glb', genre: 'fantasy', gender: 'male', bodyType: 'heavy', role: null },
  { path: '/assets/characters/fantasy/npc_male_slim.glb', genre: 'fantasy', gender: 'male', bodyType: 'slim', role: null },
  // Female variants
  { path: '/assets/characters/fantasy/npc_female_average.glb', genre: 'fantasy', gender: 'female', bodyType: 'average', role: null },
  { path: '/assets/characters/fantasy/npc_female_athletic.glb', genre: 'fantasy', gender: 'female', bodyType: 'athletic', role: null },
  { path: '/assets/characters/fantasy/npc_female_heavy.glb', genre: 'fantasy', gender: 'female', bodyType: 'heavy', role: null },
  { path: '/assets/characters/fantasy/npc_female_slim.glb', genre: 'fantasy', gender: 'female', bodyType: 'slim', role: null },
  // Nonbinary variants
  { path: '/assets/characters/fantasy/npc_nonbinary_average.glb', genre: 'fantasy', gender: 'nonbinary', bodyType: 'average', role: null },
  { path: '/assets/characters/fantasy/npc_nonbinary_athletic.glb', genre: 'fantasy', gender: 'nonbinary', bodyType: 'athletic', role: null },
  // Role-specific fantasy
  { path: '/assets/characters/fantasy/npc_guard_male.glb', genre: 'fantasy', gender: 'male', bodyType: 'athletic', role: 'guard' },
  { path: '/assets/characters/fantasy/npc_guard_female.glb', genre: 'fantasy', gender: 'female', bodyType: 'athletic', role: 'guard' },
  { path: '/assets/characters/fantasy/npc_merchant_male.glb', genre: 'fantasy', gender: 'male', bodyType: 'average', role: 'merchant' },
  { path: '/assets/characters/fantasy/npc_merchant_female.glb', genre: 'fantasy', gender: 'female', bodyType: 'average', role: 'merchant' },

  // === Sci-Fi genre ===
  { path: '/assets/characters/scifi/npc_male_average.glb', genre: 'scifi', gender: 'male', bodyType: 'average', role: null },
  { path: '/assets/characters/scifi/npc_male_athletic.glb', genre: 'scifi', gender: 'male', bodyType: 'athletic', role: null },
  { path: '/assets/characters/scifi/npc_male_heavy.glb', genre: 'scifi', gender: 'male', bodyType: 'heavy', role: null },
  { path: '/assets/characters/scifi/npc_male_slim.glb', genre: 'scifi', gender: 'male', bodyType: 'slim', role: null },
  { path: '/assets/characters/scifi/npc_female_average.glb', genre: 'scifi', gender: 'female', bodyType: 'average', role: null },
  { path: '/assets/characters/scifi/npc_female_athletic.glb', genre: 'scifi', gender: 'female', bodyType: 'athletic', role: null },
  { path: '/assets/characters/scifi/npc_female_heavy.glb', genre: 'scifi', gender: 'female', bodyType: 'heavy', role: null },
  { path: '/assets/characters/scifi/npc_female_slim.glb', genre: 'scifi', gender: 'female', bodyType: 'slim', role: null },
  { path: '/assets/characters/scifi/npc_nonbinary_average.glb', genre: 'scifi', gender: 'nonbinary', bodyType: 'average', role: null },
  { path: '/assets/characters/scifi/npc_nonbinary_athletic.glb', genre: 'scifi', gender: 'nonbinary', bodyType: 'athletic', role: null },
  // Role-specific scifi
  { path: '/assets/characters/scifi/npc_guard_male.glb', genre: 'scifi', gender: 'male', bodyType: 'athletic', role: 'guard' },
  { path: '/assets/characters/scifi/npc_guard_female.glb', genre: 'scifi', gender: 'female', bodyType: 'athletic', role: 'guard' },
  { path: '/assets/characters/scifi/npc_merchant_male.glb', genre: 'scifi', gender: 'male', bodyType: 'average', role: 'merchant' },
  { path: '/assets/characters/scifi/npc_merchant_female.glb', genre: 'scifi', gender: 'female', bodyType: 'average', role: 'merchant' },

  // === Modern genre ===
  { path: '/assets/characters/modern/npc_male_average.glb', genre: 'modern', gender: 'male', bodyType: 'average', role: null },
  { path: '/assets/characters/modern/npc_male_athletic.glb', genre: 'modern', gender: 'male', bodyType: 'athletic', role: null },
  { path: '/assets/characters/modern/npc_male_heavy.glb', genre: 'modern', gender: 'male', bodyType: 'heavy', role: null },
  { path: '/assets/characters/modern/npc_male_slim.glb', genre: 'modern', gender: 'male', bodyType: 'slim', role: null },
  { path: '/assets/characters/modern/npc_female_average.glb', genre: 'modern', gender: 'female', bodyType: 'average', role: null },
  { path: '/assets/characters/modern/npc_female_athletic.glb', genre: 'modern', gender: 'female', bodyType: 'athletic', role: null },
  { path: '/assets/characters/modern/npc_female_heavy.glb', genre: 'modern', gender: 'female', bodyType: 'heavy', role: null },
  { path: '/assets/characters/modern/npc_female_slim.glb', genre: 'modern', gender: 'female', bodyType: 'slim', role: null },
  { path: '/assets/characters/modern/npc_nonbinary_average.glb', genre: 'modern', gender: 'nonbinary', bodyType: 'average', role: null },
  { path: '/assets/characters/modern/npc_nonbinary_athletic.glb', genre: 'modern', gender: 'nonbinary', bodyType: 'athletic', role: null },

  // === Generic fallback (existing models, re-mapped) ===
  { path: '/assets/characters/generic/npc_civilian_male.glb', genre: 'generic', gender: 'male', bodyType: 'average', role: null },
  { path: '/assets/characters/generic/npc_civilian_female.glb', genre: 'generic', gender: 'female', bodyType: 'average', role: null },
  { path: '/assets/characters/generic/npc_guard.glb', genre: 'generic', gender: 'male', bodyType: 'athletic', role: 'guard' },
  { path: '/assets/characters/generic/npc_merchant.glb', genre: 'generic', gender: 'male', bodyType: 'average', role: 'merchant' },
];

/**
 * Map a worldType string to a genre category for model selection.
 */
export function worldTypeToGenre(worldType?: string): NPCGenreCategory {
  const wt = (worldType || '').toLowerCase();
  if (wt.includes('fantasy') || wt.includes('medieval') || wt.includes('dark-fantasy')) {
    return 'fantasy';
  }
  if (wt.includes('cyberpunk') || wt.includes('sci-fi') || wt.includes('scifi') || wt.includes('space') || wt.includes('post-apocalyptic')) {
    return 'scifi';
  }
  if (wt.includes('modern') || wt.includes('urban') || wt.includes('contemporary') || wt.includes('noir')) {
    return 'modern';
  }
  return 'generic';
}

/**
 * Normalize a character's gender string to our supported types.
 */
export function normalizeGender(gender?: string): NPCGender {
  const g = (gender || '').toLowerCase();
  if (g === 'male' || g === 'm') return 'male';
  if (g === 'female' || g === 'f') return 'female';
  return 'nonbinary';
}

/**
 * Derive a body type from a character's physical traits or occupation.
 * Uses a simple heuristic based on trait keywords.
 */
export function deriveBodyType(physicalTraits?: string[], occupation?: string): NPCBodyType {
  const traits = (physicalTraits || []).map(t => t.toLowerCase()).join(' ');
  const occ = (occupation || '').toLowerCase();

  if (traits.includes('muscular') || traits.includes('strong') || traits.includes('brawny') ||
      occ.includes('blacksmith') || occ.includes('soldier') || occ.includes('warrior') || occ.includes('guard')) {
    return 'athletic';
  }
  if (traits.includes('heavy') || traits.includes('stout') || traits.includes('large') || traits.includes('portly') ||
      occ.includes('innkeeper') || occ.includes('cook') || occ.includes('brewer')) {
    return 'heavy';
  }
  if (traits.includes('thin') || traits.includes('slender') || traits.includes('lithe') || traits.includes('wiry') ||
      occ.includes('thief') || occ.includes('scout') || occ.includes('scholar') || occ.includes('mage')) {
    return 'slim';
  }
  return 'average';
}

/**
 * Select the best model for an NPC given their attributes.
 * Uses a scored fallback: exact match > same genre+gender > same gender > any generic.
 */
export function selectNPCModel(
  gender: NPCGender,
  bodyType: NPCBodyType,
  role: NPCRoleType,
  genre: NPCGenreCategory
): NPCModelEntry {
  // Try role-specific match first (genre + gender + role)
  const roleMatch = MODEL_MANIFEST.find(
    m => m.genre === genre && m.gender === gender && m.role === role
  );
  if (roleMatch) return roleMatch;

  // Try exact body type match (genre + gender + body type, no role constraint)
  const exactMatch = MODEL_MANIFEST.find(
    m => m.genre === genre && m.gender === gender && m.bodyType === bodyType && m.role === null
  );
  if (exactMatch) return exactMatch;

  // Fallback: same genre + gender, any body type
  const genreGenderMatch = MODEL_MANIFEST.find(
    m => m.genre === genre && m.gender === gender && m.role === null
  );
  if (genreGenderMatch) return genreGenderMatch;

  // Fallback: generic genre + same gender
  const genericGenderMatch = MODEL_MANIFEST.find(
    m => m.genre === 'generic' && m.gender === gender && m.role === null
  );
  if (genericGenderMatch) return genericGenderMatch;

  // Fallback: generic genre, any gender
  const genericAny = MODEL_MANIFEST.find(m => m.genre === 'generic' && m.role === null);
  if (genericAny) return genericAny;

  // Should never happen, but return first entry as absolute fallback
  return MODEL_MANIFEST[0];
}

/**
 * Resolve the full model info for an NPC character in the given world.
 */
export function resolveNPCModelFromCharacter(
  character: { gender?: string; physicalTraits?: string[]; occupation?: string },
  role: NPCRoleType,
  worldType?: string
): { rootUrl: string; file: string; cacheKey: string } {
  const gender = normalizeGender(character.gender);
  const bodyType = deriveBodyType(character.physicalTraits, character.occupation);
  const genre = worldTypeToGenre(worldType);

  const entry = selectNPCModel(gender, bodyType, role, genre);

  const lastSlash = entry.path.lastIndexOf('/');
  const rootUrl = entry.path.substring(0, lastSlash + 1);
  const file = entry.path.substring(lastSlash + 1);
  const cacheKey = `npc_${genre}_${gender}_${bodyType}_${role}`;

  return { rootUrl, file, cacheKey };
}

/** Expose manifest for testing */
export function getModelManifest(): readonly NPCModelEntry[] {
  return MODEL_MANIFEST;
}
