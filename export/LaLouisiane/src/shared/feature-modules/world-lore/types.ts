/**
 * World Lore Module — Generic Types
 *
 * Abstracts "world languages" into a generic world lore system.
 * Languages are one type of lore entry; other genres have:
 *   - RPG: magic systems, faction histories, creature bestiaries
 *   - Survival: biome ecosystems, species databases
 *   - Strategy: civilization histories, technology trees
 */

// ---------------------------------------------------------------------------
// Lore entries
// ---------------------------------------------------------------------------

export type LoreType =
  | 'language'
  | 'magic_system'
  | 'faction'
  | 'creature'
  | 'biome'
  | 'technology'
  | 'history'
  | 'custom';

export interface WorldLoreEntry {
  id: string;
  worldId: string;
  /** Lore type classification. */
  type: LoreType;
  /** Display name (e.g., language name, faction name). */
  name: string;
  /** Rich description. */
  description: string;
  /** Whether this is the "primary" / "learning target" lore entry. */
  isPrimary: boolean;
  /** Genre-specific data (full linguistic model for languages, etc.). */
  data: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Lore chat (exploration conversations about any lore topic)
// ---------------------------------------------------------------------------

export interface LoreChatMessage {
  id: string;
  loreEntryId: string;
  worldId: string;
  playerId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Item lore annotation (any genre-specific metadata on items)
// ---------------------------------------------------------------------------

export interface ItemLoreAnnotation {
  itemId: string;
  loreEntryId: string;
  /** The annotation (e.g., translated name, magical properties, species notes). */
  annotation: string;
  data: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Module configuration
// ---------------------------------------------------------------------------

export interface WorldLoreConfig {
  /** Lore types available in this genre. */
  loreTypes: LoreType[];
  /** Label for lore entries (e.g., "Language", "Lore"). */
  entryLabel: string;
  entryLabelPlural: string;
}

export const DEFAULT_CONFIG: WorldLoreConfig = {
  loreTypes: ['custom'],
  entryLabel: 'Lore Entry',
  entryLabelPlural: 'Lore Entries',
};
