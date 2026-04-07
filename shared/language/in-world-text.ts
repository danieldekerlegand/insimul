/**
 * In-World Text Translation
 *
 * Provides CEFR-aware translation functions for in-world UI elements:
 * action verbs (Talk, Enter, Pick Up, etc.) and building labels.
 *
 * These functions wrap getGameString() and getBilingualDisplay() from
 * ui-localization.ts, providing a domain-specific API for Babylon.js
 * rendering code.
 */

import type { CEFRLevel } from '../assessment/cefr-mapping';
import {
  getGameString,
  getBilingualDisplay,
  type UIImmersionMode,
} from './ui-localization';

/**
 * Translate an interaction verb based on the player's CEFR level.
 *
 * At A1-A2: returns English (e.g., "Talk")
 * At B1+:   returns target language (e.g., "Parler")
 *
 * @param englishVerb - The English action verb (e.g., "Talk", "Enter")
 * @param targetVerb - The target language verb (e.g., "Parler", "Entrer")
 * @param cefrLevel - The player's current CEFR level
 * @param mode - Optional immersion mode override
 * @returns The appropriate verb for the player's proficiency level
 */
export function translateInteractionVerb(
  englishVerb: string,
  targetVerb: string | undefined,
  cefrLevel: CEFRLevel,
  mode: UIImmersionMode = 'auto',
): string {
  return getGameString(englishVerb, targetVerb, 'actions.verb', cefrLevel, mode);
}

/**
 * Build a bilingual building name display based on the player's CEFR level.
 *
 * At A1-A2: English primary, target language subtitle
 * At B1:    Target language primary, English subtitle + tooltip
 * At B2+:   Target language only, hover reveals English
 *
 * @param englishName - The English building name
 * @param translatedName - The target language building name (or undefined)
 * @param cefrLevel - The player's current CEFR level
 * @returns Object with primary text, optional subtitle, and tooltip flag
 */
export function buildBilingualBuildingPrompt(
  englishName: string,
  translatedName: string | undefined,
  cefrLevel: CEFRLevel,
): { primary: string; subtitle?: string; showTooltip: boolean } {
  return getBilingualDisplay(englishName, translatedName, cefrLevel);
}

/**
 * Translate a menu title based on CEFR level.
 * Uses the 'locations' namespace since menu titles represent in-world locations/objects.
 *
 * @param englishTitle - The English menu title
 * @param translatedTitle - The target language title (or undefined)
 * @param cefrLevel - The player's current CEFR level
 * @param mode - Optional immersion mode override
 * @returns The appropriate title for the player's proficiency level
 */
export function translateMenuTitle(
  englishTitle: string,
  translatedTitle: string | undefined,
  cefrLevel: CEFRLevel,
  mode: UIImmersionMode = 'auto',
): string {
  return getGameString(englishTitle, translatedTitle, 'locations.title', cefrLevel, mode);
}
