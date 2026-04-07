import { describe, it, expect } from 'vitest';
import {
  INTERACTION_VERB_WORDS,
  QUEST_HINT_WORDS,
  IN_WORLD_TEXT_WORDS,
  translateInteractionVerb,
  translateObjectName,
  translateQuestHint,
  buildTranslatedPrompt,
  buildTranslatedNPCPrompt,
  buildTranslatedEavesdropPrompt,
  buildBilingualBuildingPrompt,
} from '../language/in-world-text';
import type { CEFRLevel } from '../assessment/cefr-mapping';
import type { UIImmersionMode } from '../language/ui-localization';
import type { TranslationLookupFn } from '../language/action-labels';

// ── Constants ──────────────────────────────────────────────────────────────

describe('INTERACTION_VERB_WORDS', () => {
  it('contains all expected interaction verbs', () => {
    const expected = ['Talk to', 'Eavesdrop', 'Enter', 'Read', 'Pick up',
      'Examine', 'Sit on', 'Sleep in', 'Use', 'Interact with', 'Open'];
    for (const verb of expected) {
      expect(INTERACTION_VERB_WORDS).toContain(verb);
    }
  });
});

describe('QUEST_HINT_WORDS', () => {
  it('contains all quest hint strings', () => {
    expect(QUEST_HINT_WORDS).toContain('Quest Available');
    expect(QUEST_HINT_WORDS).toContain('Quest In Progress');
    expect(QUEST_HINT_WORDS).toContain('Quest Ready to Turn In!');
  });
});

describe('IN_WORLD_TEXT_WORDS', () => {
  it('includes verbs, quest hints, and connector', () => {
    expect(IN_WORLD_TEXT_WORDS).toContain('Talk to');
    expect(IN_WORLD_TEXT_WORDS).toContain('Quest Available');
    expect(IN_WORLD_TEXT_WORDS).toContain('and');
  });

  it('has no duplicates', () => {
    const unique = new Set(IN_WORLD_TEXT_WORDS);
    expect(unique.size).toBe(IN_WORLD_TEXT_WORDS.length);
  });
});

// ── Test helpers ───────────────────────────────────────────────────────────

const frenchLookup: TranslationLookupFn = (word: string) => {
  const translations: Record<string, string> = {
    'Talk to': 'Parler à',
    'Eavesdrop': 'Écouter',
    'Enter': 'Entrer',
    'Read': 'Lire',
    'Pick up': 'Ramasser',
    'Examine': 'Examiner',
    'Sit on': "S'asseoir sur",
    'Sleep in': 'Dormir dans',
    'Use': 'Utiliser',
    'Open': 'Ouvrir',
    'Interact with': 'Interagir avec',
    'and': 'et',
    'Quest Available': 'Quête disponible',
    'Quest In Progress': 'Quête en cours',
    'Quest Ready to Turn In!': 'Quête prête à rendre !',
    'Bakery': 'Boulangerie',
    'Tavern': 'Taverne',
    'Notice Board': 'Panneau d\'affichage',
  };
  return translations[word];
};

// ── translateInteractionVerb ──────────────────────────────────────────────

describe('translateInteractionVerb', () => {
  it('returns English at A1 (no translation)', () => {
    expect(translateInteractionVerb('Talk to', 'A1', 'auto', frenchLookup)).toBe('Talk to');
  });

  it('returns English at A2 (no translation)', () => {
    expect(translateInteractionVerb('Enter', 'A2', 'auto', frenchLookup)).toBe('Enter');
  });

  it('returns translated verb at B1', () => {
    expect(translateInteractionVerb('Talk to', 'B1', 'auto', frenchLookup)).toBe('Parler à');
  });

  it('returns translated verb at B2', () => {
    expect(translateInteractionVerb('Read', 'B2', 'auto', frenchLookup)).toBe('Lire');
  });

  it('returns translated verb at C1', () => {
    expect(translateInteractionVerb('Eavesdrop', 'C1', 'auto', frenchLookup)).toBe('Écouter');
  });

  it('returns English when no lookup provided', () => {
    expect(translateInteractionVerb('Talk to', 'B1', 'auto')).toBe('Talk to');
  });

  it('returns English when english_only mode', () => {
    expect(translateInteractionVerb('Talk to', 'B1', 'english_only', frenchLookup)).toBe('Talk to');
  });

  it('returns translated in maximum mode even at A1', () => {
    expect(translateInteractionVerb('Enter', 'A1', 'maximum', frenchLookup)).toBe('Entrer');
  });

  it('falls back to English when lookup returns undefined', () => {
    const partialLookup: TranslationLookupFn = () => undefined;
    expect(translateInteractionVerb('Talk to', 'B1', 'auto', partialLookup)).toBe('Talk to');
  });
});

// ── translateObjectName ───────────────────────────────────────────────────

describe('translateObjectName', () => {
  it('returns English at A1', () => {
    expect(translateObjectName('Bakery', 'A1', 'auto', frenchLookup)).toBe('Bakery');
  });

  it('returns translated name at B1', () => {
    expect(translateObjectName('Bakery', 'B1', 'auto', frenchLookup)).toBe('Boulangerie');
  });

  it('returns English when no translation exists', () => {
    expect(translateObjectName('Unknown Place', 'B1', 'auto', frenchLookup)).toBe('Unknown Place');
  });
});

// ── translateQuestHint ────────────────────────────────────────────────────

describe('translateQuestHint', () => {
  it('returns English at A1 through B2', () => {
    const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
    for (const level of levels) {
      expect(translateQuestHint('Quest Available', level, 'auto', frenchLookup)).toBe('Quest Available');
    }
  });

  it('returns translated hint at C1', () => {
    expect(translateQuestHint('Quest Available', 'C1', 'auto', frenchLookup)).toBe('Quête disponible');
  });

  it('returns translated hint at C2', () => {
    expect(translateQuestHint('Quest In Progress', 'C2', 'auto', frenchLookup)).toBe('Quête en cours');
  });

  it('returns English in english_only mode at C1', () => {
    expect(translateQuestHint('Quest Available', 'C1', 'english_only', frenchLookup)).toBe('Quest Available');
  });

  it('returns translated in maximum mode at A1', () => {
    expect(translateQuestHint('Quest Available', 'A1', 'maximum', frenchLookup)).toBe('Quête disponible');
  });
});

// ── buildTranslatedPrompt ─────────────────────────────────────────────────

describe('buildTranslatedPrompt', () => {
  it('builds English prompt at A1', () => {
    const result = buildTranslatedPrompt('Enter', 'Read', 'Notice Board', 'A1', 'auto', frenchLookup);
    expect(result).toBe('[Enter]: Read Notice Board');
  });

  it('builds translated prompt at B1', () => {
    const result = buildTranslatedPrompt('Enter', 'Read', 'Notice Board', 'B1', 'auto', frenchLookup);
    expect(result).toBe("[Enter]: Lire Panneau d'affichage");
  });

  it('handles missing object translation at B1', () => {
    const result = buildTranslatedPrompt('G', 'Pick up', 'Stone', 'B1', 'auto', frenchLookup);
    expect(result).toBe('[G]: Ramasser Stone');
  });
});

// ── buildTranslatedNPCPrompt ──────────────────────────────────────────────

describe('buildTranslatedNPCPrompt', () => {
  it('returns English prompt at A1', () => {
    const result = buildTranslatedNPCPrompt('Enter', 'Talk to', 'Maria', 'A1', 'auto', frenchLookup);
    expect(result).toBe('[Enter]: Talk to Maria');
  });

  it('translates verb but keeps NPC name at B1', () => {
    const result = buildTranslatedNPCPrompt('Enter', 'Talk to', 'Maria', 'B1', 'auto', frenchLookup);
    expect(result).toBe('[Enter]: Parler à Maria');
  });

  it('keeps NPC name untranslated at C2', () => {
    const result = buildTranslatedNPCPrompt('Enter', 'Talk to', 'Maria', 'C2', 'auto', frenchLookup);
    expect(result).toBe('[Enter]: Parler à Maria');
  });
});

// ── buildTranslatedEavesdropPrompt ────────────────────────────────────────

describe('buildTranslatedEavesdropPrompt', () => {
  it('returns English at A1', () => {
    const result = buildTranslatedEavesdropPrompt('Y', 'Maria', 'Pierre', 'A1', 'auto', frenchLookup);
    expect(result).toBe('[Y]: Eavesdrop Maria and Pierre');
  });

  it('translates verb and connector at B1', () => {
    const result = buildTranslatedEavesdropPrompt('Y', 'Maria', 'Pierre', 'B1', 'auto', frenchLookup);
    expect(result).toBe('[Y]: Écouter Maria et Pierre');
  });

  it('keeps NPC names untranslated', () => {
    const result = buildTranslatedEavesdropPrompt('Y', 'Maria', 'Pierre', 'C2', 'auto', frenchLookup);
    expect(result).toContain('Maria');
    expect(result).toContain('Pierre');
  });
});

// ── buildBilingualBuildingPrompt ──────────────────────────────────────────

describe('buildBilingualBuildingPrompt', () => {
  it('returns English-only prompt at A1', () => {
    const result = buildBilingualBuildingPrompt('Enter', 'Enter', 'Bakery', 'A1', 'auto', frenchLookup);
    expect(result.promptText).toBe('[Enter]: Enter Bakery');
    expect(result.subtitleText).toBeUndefined();
  });

  it('returns bilingual prompt at A2 with subtitle', () => {
    // A2 still doesn't translate locations (priority 0), so should be English
    const result = buildBilingualBuildingPrompt('Enter', 'Enter', 'Bakery', 'A2', 'auto', frenchLookup);
    expect(result.promptText).toContain('Bakery');
  });

  it('returns translated prompt with subtitle at B1', () => {
    const result = buildBilingualBuildingPrompt('Enter', 'Enter', 'Bakery', 'B1', 'auto', frenchLookup);
    // At B1, getBilingualDisplay returns target as primary, English as subtitle
    expect(result.promptText).toContain('Boulangerie');
    expect(result.subtitleText).toBe('(Bakery)');
  });

  it('returns translated prompt without subtitle at B2+', () => {
    const result = buildBilingualBuildingPrompt('Enter', 'Enter', 'Bakery', 'B2', 'auto', frenchLookup);
    expect(result.promptText).toContain('Boulangerie');
    // At B2+, getBilingualDisplay only shows target language (tooltip, not subtitle)
    expect(result.subtitleText).toBeUndefined();
  });

  it('returns English in english_only mode', () => {
    const result = buildBilingualBuildingPrompt('Enter', 'Enter', 'Bakery', 'B1', 'english_only', frenchLookup);
    expect(result.promptText).toBe('[Enter]: Enter Bakery');
    expect(result.subtitleText).toBeUndefined();
  });
});

// ── CEFR level progression ────────────────────────────────────────────────

describe('CEFR level progression for in-world text', () => {
  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  it('verbs remain English at A1-A2, translate at B1+', () => {
    for (const level of levels) {
      const result = translateInteractionVerb('Talk to', level, 'auto', frenchLookup);
      if (level === 'A1' || level === 'A2') {
        expect(result).toBe('Talk to');
      } else {
        expect(result).toBe('Parler à');
      }
    }
  });

  it('quest hints remain English at A1-B2, translate at C1+', () => {
    for (const level of levels) {
      const result = translateQuestHint('Quest Available', level, 'auto', frenchLookup);
      if (level === 'C1' || level === 'C2') {
        expect(result).toBe('Quête disponible');
      } else {
        expect(result).toBe('Quest Available');
      }
    }
  });
});
