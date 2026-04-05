/**
 * CEFR-Aware UI Localization
 *
 * Controls which UI strings are displayed in the target language
 * based on the player's CEFR proficiency level. At lower levels,
 * the UI remains in English. As proficiency increases, more UI
 * elements transition to the target language for immersion.
 */

import type { CEFRLevel } from '../assessment/cefr-mapping';

/** Player preference for UI immersion behavior. */
export type UIImmersionMode = 'auto' | 'english_only' | 'maximum';

/**
 * UI string namespace priority for immersion.
 * Lower-numbered namespaces are translated first as CEFR increases.
 */
const NAMESPACE_PRIORITY: Record<string, number> = {
  // Priority 1: Action prompts (translate at B1+)
  'actions': 1,
  // Priority 2: Map labels and inventory categories (translate at B2)
  'map': 2,
  'inventory': 2,
  // Priority 3: Main UI labels (translate at B2)
  'ui': 3,
  // Priority 4: Notifications (translate at B2)
  'notifications': 4,
  // Priority 5: Empty states (translate at B2)
  'emptyStates': 5,
  // Priority 6: Photo UI (translate at B2)
  'photo': 6,
  // Never translated: system-critical messages
  'system': Infinity,
};

/**
 * CEFR-based immersion percentages.
 *
 * Since the codebase uses A1-B2, we map immersion as:
 * A1 = 0% (pure English UI)
 * A2 = 0% (pure English UI)
 * B1 = 20% (action prompts and location names)
 * B2 = 80% (most UI except system-critical)
 */
const CEFR_IMMERSION_LEVELS: Record<CEFRLevel, number> = {
  A1: 0,
  A2: 0,
  B1: 20,
  B2: 80,
  C1: 90,
  C2: 95,
};

/**
 * Which namespace priorities are active at each CEFR level.
 * A key translates if its namespace priority <= the max priority for the level.
 */
const CEFR_MAX_PRIORITY: Record<CEFRLevel, number> = {
  A1: 0,   // Nothing translates
  A2: 0,   // Nothing translates
  B1: 1,   // Only actions namespace
  B2: 6,   // Everything except system
  C1: 8,   // Nearly everything
  C2: 10,  // Everything including system-adjacent
};

/**
 * Get the UI immersion percentage for a CEFR level.
 * Returns 0-100 representing how much of the UI should be in the target language.
 */
export function getUIImmersionLevel(
  cefrLevel: CEFRLevel,
  mode: UIImmersionMode = 'auto',
): number {
  if (mode === 'english_only') return 0;
  if (mode === 'maximum') return 90;
  return CEFR_IMMERSION_LEVELS[cefrLevel];
}

/**
 * Determine whether a specific UI key should be displayed in the target language.
 *
 * @param key - The i18n key (e.g., 'actions.talk', 'ui.questLog', 'system.error')
 * @param cefrLevel - The player's current CEFR proficiency level
 * @param mode - The player's immersion preference
 * @returns true if the key should show in the target language
 */
export function shouldTranslateUIKey(
  key: string,
  cefrLevel: CEFRLevel,
  mode: UIImmersionMode = 'auto',
): boolean {
  if (mode === 'english_only') return false;

  // Extract namespace from key (e.g., 'actions' from 'actions.talk')
  const namespace = key.split('.')[0];
  const priority = NAMESPACE_PRIORITY[namespace];

  // System namespace is NEVER translated
  if (priority === Infinity) return false;
  if (priority === undefined) return false;

  if (mode === 'maximum') {
    // Maximum mode: translate everything except system
    return true;
  }

  // Auto mode: check if the namespace is active at this CEFR level
  const maxPriority = CEFR_MAX_PRIORITY[cefrLevel];
  return priority <= maxPriority;
}

/**
 * Get a game string with CEFR-aware language selection.
 * For use in non-React contexts (e.g., Babylon.js rendering code).
 *
 * @param englishText - The English text to display
 * @param translatedText - The target-language text (or undefined if not available)
 * @param key - The i18n key for immersion level checking
 * @param cefrLevel - The player's current CEFR level
 * @param mode - The player's immersion mode preference
 * @returns The appropriate text for display
 */
export function getGameString(
  englishText: string,
  translatedText: string | undefined,
  key: string,
  cefrLevel: CEFRLevel,
  mode: UIImmersionMode = 'auto',
): string {
  if (!translatedText) return englishText;
  if (!shouldTranslateUIKey(key, cefrLevel, mode)) return englishText;
  return translatedText;
}

/**
 * Get bilingual display text for in-world labels.
 * Returns formatted text based on CEFR level.
 *
 * @returns Object with primary text, optional subtitle, and whether to show tooltip
 */
export function getBilingualDisplay(
  englishText: string,
  translatedText: string | undefined,
  cefrLevel: CEFRLevel,
): { primary: string; subtitle?: string; showTooltip: boolean } {
  if (!translatedText) {
    return { primary: englishText, showTooltip: false };
  }

  switch (cefrLevel) {
    case 'A1':
    case 'A2':
      // English primary with target-language subtitle
      return {
        primary: englishText,
        subtitle: translatedText,
        showTooltip: false,
      };
    case 'B1':
      // Target language with English tooltip on hover
      return {
        primary: translatedText,
        subtitle: englishText,
        showTooltip: true,
      };
    case 'B2':
    case 'C1':
    case 'C2':
      // Target language only
      return {
        primary: translatedText,
        showTooltip: false,
      };
  }
}
