/**
 * CEFR-aware game translation hook.
 *
 * Wraps react-i18next's useTranslation() and applies CEFR immersion
 * logic to determine whether a UI key should display in English
 * or the target language.
 */

import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { shouldTranslateUIKey } from '../../../shared/language/ui-localization';
import type { CEFRLevel } from '../../../shared/language/cefr';
import type { UIImmersionMode } from '../../../shared/language/ui-localization';
import { getTargetLanguage } from './index';

interface GameTranslationOptions {
  /** Player's current CEFR level. Defaults to 'A1' if not provided. */
  cefrLevel?: CEFRLevel;
  /** Player's immersion mode preference. Defaults to 'auto'. */
  immersionMode?: UIImmersionMode;
}

/**
 * Hook that returns a translation function respecting CEFR immersion levels.
 *
 * At lower CEFR levels, returns English strings. As proficiency increases,
 * more UI elements transition to the target language.
 *
 * Usage:
 * ```tsx
 * const { gt } = useGameTranslation({ cefrLevel: 'B1' });
 * return <button>{gt('actions.talk')}</button>; // Returns "Parler" at B1+
 * ```
 */
export function useGameTranslation(options: GameTranslationOptions = {}) {
  const { cefrLevel = 'A1', immersionMode = 'auto' } = options;
  const { t, i18n } = useTranslation('common');
  const targetLanguage = getTargetLanguage();

  /**
   * Get a translated game string with CEFR-aware immersion.
   * Returns English or target-language text based on proficiency.
   */
  const gt = useCallback(
    (key: string, interpolation?: Record<string, unknown>): string => {
      if (!shouldTranslateUIKey(key, cefrLevel, immersionMode)) {
        // Return English version
        return t(key, { ...interpolation, lng: 'en' });
      }

      // Check if target language translation exists
      const translated = i18n.exists(key, { lng: targetLanguage, ns: 'common' })
        ? t(key, { ...interpolation, lng: targetLanguage })
        : t(key, { ...interpolation, lng: 'en' });

      return translated;
    },
    [cefrLevel, immersionMode, t, i18n, targetLanguage],
  );

  return { gt, t, i18n, targetLanguage };
}
