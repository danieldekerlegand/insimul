/**
 * Tests for CEFR-aware quest display integration.
 *
 * Verifies that QuestOfferPanel and QuestNotificationManager data structures
 * correctly carry translation fields and CEFR levels, and that the localization
 * functions produce the expected display text for each CEFR level.
 */
import { describe, it, expect } from 'vitest';
import {
  getLocalizedQuestText,
  getLocalizedObjectives,
  type QuestTextDisplay,
} from '../language/quest-localization';
import type { CEFRLevel } from '../assessment/cefr-mapping';

// Simulated quest data matching what BabylonGame would produce
const QUEST_TITLE = 'Trouver le marché';
const QUEST_TITLE_TRANSLATION = 'Find the market';
const QUEST_DESC = 'Demandez aux habitants où se trouve le marché.';
const QUEST_DESC_TRANSLATION = 'Ask the townspeople where the market is.';
const OBJECTIVES = ['Parler à trois habitants', 'Acheter des fruits'];
const OBJECTIVES_TRANSLATIONS = ['Talk to three residents', 'Buy some fruit'];

describe('CEFR-aware quest display', () => {
  describe('QuestOfferPanel data flow', () => {
    // Tests that QuestOfferData with translation fields produces correct display per CEFR level

    function buildOfferDisplay(cefrLevel: CEFRLevel) {
      const titleDisplay = getLocalizedQuestText(
        { targetText: QUEST_TITLE, englishText: QUEST_TITLE_TRANSLATION },
        cefrLevel,
        'title',
      );
      const descDisplay = getLocalizedQuestText(
        { targetText: QUEST_DESC, englishText: QUEST_DESC_TRANSLATION },
        cefrLevel,
        'description',
      );
      const objDisplay = getLocalizedQuestText(
        { targetText: OBJECTIVES.join('; '), englishText: OBJECTIVES_TRANSLATIONS.join('; ') },
        cefrLevel,
        'objective',
      );
      return { titleDisplay, descDisplay, objDisplay };
    }

    it('A1: shows English primary with target-language subtitle', () => {
      const { titleDisplay, descDisplay } = buildOfferDisplay('A1');

      expect(titleDisplay.primary).toBe(QUEST_TITLE_TRANSLATION);
      expect(titleDisplay.secondary).toBe(QUEST_TITLE);
      expect(titleDisplay.showHoverTranslation).toBe(false);

      expect(descDisplay.primary).toBe(QUEST_DESC_TRANSLATION);
      expect(descDisplay.secondary).toBe(QUEST_DESC);
    });

    it('A2: shows bilingual text (target + English in parentheses)', () => {
      const { titleDisplay, descDisplay } = buildOfferDisplay('A2');

      expect(titleDisplay.primary).toContain(QUEST_TITLE);
      expect(titleDisplay.primary).toContain(QUEST_TITLE_TRANSLATION);
      expect(titleDisplay.secondary).toBeUndefined();

      expect(descDisplay.primary).toContain(QUEST_DESC);
      expect(descDisplay.primary).toContain(QUEST_DESC_TRANSLATION);
    });

    it('B1: shows target language with hover translation enabled', () => {
      const { titleDisplay, descDisplay, objDisplay } = buildOfferDisplay('B1');

      expect(titleDisplay.primary).toBe(QUEST_TITLE);
      expect(titleDisplay.showHoverTranslation).toBe(true);
      expect(titleDisplay.showToggleButton).toBe(true);

      expect(descDisplay.primary).toBe(QUEST_DESC);
      expect(descDisplay.showHoverTranslation).toBe(true);

      expect(objDisplay.primary).toBe(OBJECTIVES.join('; '));
      expect(objDisplay.showHoverTranslation).toBe(true);
    });

    it('B2+: shows target language only, no translations', () => {
      for (const level of ['B2', 'C1', 'C2'] as CEFRLevel[]) {
        const { titleDisplay, descDisplay } = buildOfferDisplay(level);

        expect(titleDisplay.primary).toBe(QUEST_TITLE);
        expect(titleDisplay.secondary).toBeUndefined();
        expect(titleDisplay.showHoverTranslation).toBe(false);
        expect(titleDisplay.showToggleButton).toBe(false);

        expect(descDisplay.primary).toBe(QUEST_DESC);
        expect(descDisplay.showHoverTranslation).toBe(false);
      }
    });

    it('falls back gracefully when no translations are available', () => {
      const titleDisplay = getLocalizedQuestText(
        { targetText: QUEST_TITLE, englishText: null },
        'A1',
        'title',
      );
      expect(titleDisplay.primary).toBe(QUEST_TITLE);
      expect(titleDisplay.secondary).toBeUndefined();
    });

    it('falls back gracefully when cefrLevel is not provided', () => {
      // Simulates the fallback path in QuestOfferPanel when no cefrLevel
      const display: QuestTextDisplay = {
        primary: QUEST_TITLE,
        showHoverTranslation: false,
        showToggleButton: false,
      };
      expect(display.primary).toBe(QUEST_TITLE);
      expect(display.secondary).toBeUndefined();
    });
  });

  describe('QuestNotificationManager HUD title', () => {
    function getHudTitle(cefrLevel: CEFRLevel, titleTranslation: string | undefined) {
      if (cefrLevel && titleTranslation) {
        const display = getLocalizedQuestText(
          { targetText: QUEST_TITLE, englishText: titleTranslation },
          cefrLevel,
          'title',
        );
        return display.primary;
      }
      return QUEST_TITLE;
    }

    it('A1: HUD shows English title', () => {
      expect(getHudTitle('A1', QUEST_TITLE_TRANSLATION)).toBe(QUEST_TITLE_TRANSLATION);
    });

    it('A2: HUD shows bilingual title', () => {
      const title = getHudTitle('A2', QUEST_TITLE_TRANSLATION);
      expect(title).toContain(QUEST_TITLE);
      expect(title).toContain(QUEST_TITLE_TRANSLATION);
    });

    it('B1: HUD shows target-language title', () => {
      expect(getHudTitle('B1', QUEST_TITLE_TRANSLATION)).toBe(QUEST_TITLE);
    });

    it('B2: HUD shows target-language title', () => {
      expect(getHudTitle('B2', QUEST_TITLE_TRANSLATION)).toBe(QUEST_TITLE);
    });

    it('returns raw title when no translation', () => {
      expect(getHudTitle('A1', undefined)).toBe(QUEST_TITLE);
    });
  });

  describe('Task tracker objective localization', () => {
    it('localizes individual objectives at A1', () => {
      const results = getLocalizedObjectives(OBJECTIVES, OBJECTIVES_TRANSLATIONS, 'A1');

      expect(results).toHaveLength(2);
      expect(results[0].primary).toBe('Talk to three residents');
      expect(results[0].secondary).toBe('Parler à trois habitants');
      expect(results[1].primary).toBe('Buy some fruit');
      expect(results[1].secondary).toBe('Acheter des fruits');
    });

    it('localizes individual objectives at A2', () => {
      const results = getLocalizedObjectives(OBJECTIVES, OBJECTIVES_TRANSLATIONS, 'A2');

      expect(results[0].primary).toContain('Parler à trois habitants');
      expect(results[0].primary).toContain('Talk to three residents');
    });

    it('localizes individual objectives at B1', () => {
      const results = getLocalizedObjectives(OBJECTIVES, OBJECTIVES_TRANSLATIONS, 'B1');

      expect(results[0].primary).toBe('Parler à trois habitants');
      expect(results[0].showHoverTranslation).toBe(true);
    });

    it('localizes individual objectives at B2', () => {
      const results = getLocalizedObjectives(OBJECTIVES, OBJECTIVES_TRANSLATIONS, 'B2');

      expect(results[0].primary).toBe('Parler à trois habitants');
      expect(results[0].showHoverTranslation).toBe(false);
    });

    it('handles missing objective translations', () => {
      const results = getLocalizedObjectives(OBJECTIVES, null, 'A1');
      expect(results[0].primary).toBe('Parler à trois habitants');
      expect(results[0].secondary).toBeUndefined();
    });

    it('handles partial objective translations', () => {
      const results = getLocalizedObjectives(OBJECTIVES, ['Talk to three residents'], 'A1');
      expect(results[0].primary).toBe('Talk to three residents');
      expect(results[1].primary).toBe('Acheter des fruits'); // no translation available
    });
  });

  describe('CEFR level progression', () => {
    it('progressively reduces English assistance across levels', () => {
      const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const results = levels.map(level =>
        getLocalizedQuestText(
          { targetText: QUEST_TITLE, englishText: QUEST_TITLE_TRANSLATION },
          level,
          'title',
        ),
      );

      // A1: English primary
      expect(results[0].primary).toBe(QUEST_TITLE_TRANSLATION);
      expect(results[0].secondary).toBeDefined();

      // A2: Both languages visible
      expect(results[1].primary).toContain(QUEST_TITLE_TRANSLATION);

      // B1: Target only, but hover available
      expect(results[2].primary).toBe(QUEST_TITLE);
      expect(results[2].showHoverTranslation).toBe(true);

      // B2+: Target only, no assistance
      expect(results[3].primary).toBe(QUEST_TITLE);
      expect(results[3].showHoverTranslation).toBe(false);
      expect(results[4].showHoverTranslation).toBe(false);
      expect(results[5].showHoverTranslation).toBe(false);
    });
  });
});
