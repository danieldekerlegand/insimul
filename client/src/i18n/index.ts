/**
 * i18n initialization for Insimul game UI
 *
 * Uses i18next with CEFR-aware locale switching.
 * English is always the fallback language. The target language
 * is loaded dynamically based on the world's targetLanguage field.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import frCommon from './locales/fr/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      fr: { common: frCommon },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: true,
    },
    detection: {
      // Don't auto-detect browser language — we control this via game state
      order: [],
    },
    // Start in English; CEFR-aware switching handles target language display
    lng: 'en',
  });

/**
 * Load a dynamically-generated translation resource for a target language.
 * Called when a world specifies a non-French target language and
 * UI translations have been generated via LLM.
 */
export function loadWorldTranslations(
  languageCode: string,
  translations: Record<string, unknown>,
): void {
  i18n.addResourceBundle(languageCode, 'common', translations, true, true);
}

/**
 * Set the active target language for i18n.
 * This doesn't change the UI language directly — the CEFR immersion
 * controller determines which keys actually display in the target language.
 */
export function setTargetLanguage(languageCode: string): void {
  // Store the target language so the immersion controller can access it
  i18n.options.lng = 'en'; // UI stays English by default
  (i18n as any).__targetLanguage = languageCode;
}

/**
 * Get the current target language code.
 */
export function getTargetLanguage(): string {
  return (i18n as any).__targetLanguage || 'fr';
}

export default i18n;
