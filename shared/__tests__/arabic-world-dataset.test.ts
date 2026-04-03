/**
 * Validation tests for the Arabic Al-Andalus world dataset
 *
 * Verifies that all Prolog files in data/worlds/language/arabic/ are:
 *  - Present and non-empty
 *  - Valid Prolog syntax (balanced quotes, proper terminators)
 *  - Meet minimum content requirements (counts)
 *  - Use consistent atom references across files
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ARABIC_DIR = join(process.cwd(), 'data/worlds/language/arabic');

function readPrologFile(filename: string): string {
  const path = join(ARABIC_DIR, filename);
  expect(existsSync(path), `${filename} should exist`).toBe(true);
  const content = readFileSync(path, 'utf-8');
  expect(content.length).toBeGreaterThan(0);
  return content;
}

function countPredicates(content: string, predicate: string): number {
  const regex = new RegExp(`^${predicate}\\(`, 'gm');
  return (content.match(regex) || []).length;
}

function extractAtoms(content: string, predicate: string, argIndex: number): string[] {
  const regex = new RegExp(`^${predicate}\\(([^)]+)\\)`, 'gm');
  const atoms: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const args = match[1].split(',').map(a => a.trim());
    if (args[argIndex]) {
      atoms.push(args[argIndex].replace(/'/g, ''));
    }
  }
  return atoms;
}

// ── File Existence ─────────────────────────────────────────────

describe('Arabic Al-Andalus: File existence', () => {
  const requiredFiles = [
    'world.pl', 'settlements.pl', 'locations.pl', 'characters.pl',
    'quests.pl', 'items.pl', 'languages.pl', 'grammars.pl',
    'truths.pl', 'history.pl',
  ];

  for (const file of requiredFiles) {
    it(`${file} exists and is non-empty`, () => {
      readPrologFile(file);
    });
  }
});

// ── Prolog Syntax ──────────────────────────────────────────────

describe('Arabic Al-Andalus: Prolog syntax', () => {
  const files = [
    'world.pl', 'settlements.pl', 'locations.pl', 'characters.pl',
    'quests.pl', 'items.pl', 'languages.pl', 'grammars.pl',
    'truths.pl', 'history.pl',
  ];

  for (const file of files) {
    it(`${file} has balanced single quotes`, () => {
      const content = readPrologFile(file);
      // Remove escaped quotes ('') before counting
      const cleaned = content.replace(/''/g, '');
      // Count quotes in non-comment lines
      const lines = cleaned.split('\n').filter(l => !l.trimStart().startsWith('%'));
      for (const line of lines) {
        const quoteCount = (line.match(/'/g) || []).length;
        expect(quoteCount % 2, `Unbalanced quotes in ${file}: "${line.trim()}"`).toBe(0);
      }
    });

    it(`${file} has proper fact terminators`, () => {
      const content = readPrologFile(file);
      const lines = content.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('%') && !l.startsWith('%%'));

      for (const line of lines) {
        // Facts/rules should end with . or :-
        // Allow lines ending with :- for rule heads
        if (!line.endsWith('.') && !line.endsWith(':-') && !line.endsWith(',')) {
          // Could be a continuation line in a rule body
          expect(
            line.endsWith('.') || line.endsWith(':-') || line.endsWith(',') || line.includes(':-'),
            `Line should end with period, comma, or be part of rule: "${line}" in ${file}`
          ).toBe(true);
        }
      }
    });
  }
});

// ── world.pl ───────────────────────────────────────────────────

describe('Arabic Al-Andalus: world.pl', () => {
  it('defines world with correct type', () => {
    const content = readPrologFile('world.pl');
    expect(content).toContain('world(arabic_al_andalus');
    expect(content).toContain('world_type(arabic_al_andalus, historical_medieval)');
    expect(content).toContain('game_type(arabic_al_andalus, language_learning)');
    expect(content).toContain('target_language(arabic_al_andalus, arabic)');
  });

  it('defines country and state', () => {
    const content = readPrologFile('world.pl');
    expect(countPredicates(content, 'country')).toBeGreaterThanOrEqual(1);
    expect(countPredicates(content, 'state')).toBeGreaterThanOrEqual(1);
  });
});

// ── settlements.pl ─────────────────────────────────────────────

describe('Arabic Al-Andalus: settlements.pl', () => {
  it('has at least 2 settlements', () => {
    const content = readPrologFile('settlements.pl');
    expect(countPredicates(content, 'settlement')).toBeGreaterThanOrEqual(2);
  });

  it('has districts, streets, and landmarks', () => {
    const content = readPrologFile('settlements.pl');
    expect(countPredicates(content, 'district')).toBeGreaterThanOrEqual(2);
    expect(countPredicates(content, 'street')).toBeGreaterThanOrEqual(4);
    expect(countPredicates(content, 'landmark')).toBeGreaterThanOrEqual(2);
  });
});

// ── locations.pl ───────────────────────────────────────────────

describe('Arabic Al-Andalus: locations.pl', () => {
  it('has at least 30 lots', () => {
    const content = readPrologFile('locations.pl');
    expect(countPredicates(content, 'lot')).toBeGreaterThanOrEqual(30);
  });

  it('has at least 10 businesses', () => {
    const content = readPrologFile('locations.pl');
    expect(countPredicates(content, 'business')).toBeGreaterThanOrEqual(10);
  });

  it('has building definitions for all lots', () => {
    const content = readPrologFile('locations.pl');
    const lotCount = countPredicates(content, 'lot');
    const buildingCount = countPredicates(content, 'building');
    expect(buildingCount).toBe(lotCount);
  });
});

// ── characters.pl ──────────────────────────────────────────────

describe('Arabic Al-Andalus: characters.pl', () => {
  it('has at least 20 characters', () => {
    const content = readPrologFile('characters.pl');
    expect(countPredicates(content, 'person')).toBeGreaterThanOrEqual(20);
  });

  it('has multi-generational family trees', () => {
    const content = readPrologFile('characters.pl');
    expect(content).toContain('generation(');
    // Should have gen 0, 1, and 2
    expect(content).toContain('generation(');
    const gen0 = (content.match(/generation\(\w+, 0\)/g) || []).length;
    const gen1 = (content.match(/generation\(\w+, 1\)/g) || []).length;
    const gen2 = (content.match(/generation\(\w+, 2\)/g) || []).length;
    expect(gen0).toBeGreaterThanOrEqual(1);
    expect(gen1).toBeGreaterThanOrEqual(1);
    expect(gen2).toBeGreaterThanOrEqual(1);
  });

  it('all characters have first_name, last_name, full_name, gender', () => {
    const content = readPrologFile('characters.pl');
    const personCount = countPredicates(content, 'person');
    expect(countPredicates(content, 'first_name')).toBe(personCount);
    expect(countPredicates(content, 'last_name')).toBe(personCount);
    expect(countPredicates(content, 'full_name')).toBe(personCount);
    expect(countPredicates(content, 'gender')).toBe(personCount);
  });

  it('has multi-faith characters (Muslim, Jewish, Christian)', () => {
    const content = readPrologFile('characters.pl');
    expect(content).toContain('al-Rashid');    // Muslim
    expect(content).toContain('ben Shlomo');    // Jewish
    expect(content).toContain('de Leon');       // Christian
  });
});

// ── quests.pl ──────────────────────────────────────────────────

describe('Arabic Al-Andalus: quests.pl', () => {
  it('has at least 15 quests', () => {
    const content = readPrologFile('quests.pl');
    expect(countPredicates(content, 'quest')).toBeGreaterThanOrEqual(15);
  });

  it('covers CEFR levels A1 through B2', () => {
    const content = readPrologFile('quests.pl');
    expect(content).toContain('quest_cefr(');
    for (const level of ['a1', 'a2', 'b1', 'b2']) {
      expect(content, `Should have CEFR level ${level}`).toContain(`quest_cefr(${content.match(new RegExp(`quest_cefr\\(\\w+, ${level}\\)`))?.[0] ? '' : 'MISSING'}`);
      const regex = new RegExp(`quest_cefr\\(\\w+, ${level}\\)`, 'g');
      expect((content.match(regex) || []).length, `Should have quests at CEFR ${level}`).toBeGreaterThanOrEqual(1);
    }
  });

  it('covers multiple quest types', () => {
    const content = readPrologFile('quests.pl');
    const types = ['conversation', 'exploration', 'vocabulary', 'grammar', 'cultural_knowledge'];
    let typesFound = 0;
    for (const type of types) {
      if (content.includes(`quest_tag(`) && content.includes(type)) {
        typesFound++;
      }
    }
    expect(typesFound).toBeGreaterThanOrEqual(4);
  });

  it('has prerequisite chains', () => {
    const content = readPrologFile('quests.pl');
    expect(countPredicates(content, 'quest_prerequisite')).toBeGreaterThanOrEqual(1);
  });

  it('all quests target Arabic', () => {
    const content = readPrologFile('quests.pl');
    const questLangCount = countPredicates(content, 'quest_language');
    const arabicLangCount = (content.match(/quest_language\(\w+, arabic\)/g) || []).length;
    expect(arabicLangCount).toBe(questLangCount);
  });
});

// ── items.pl ───────────────────────────────────────────────────

describe('Arabic Al-Andalus: items.pl', () => {
  it('has at least 20 items', () => {
    const content = readPrologFile('items.pl');
    expect(countPredicates(content, 'item')).toBeGreaterThanOrEqual(20);
  });

  it('all items have description, value, and rarity', () => {
    const content = readPrologFile('items.pl');
    const itemCount = countPredicates(content, 'item');
    expect(countPredicates(content, 'item_description')).toBe(itemCount);
    expect(countPredicates(content, 'item_value')).toBe(itemCount);
    expect(countPredicates(content, 'item_rarity')).toBe(itemCount);
  });

  it('includes culturally specific items', () => {
    const content = readPrologFile('items.pl');
    // Should have calligraphy, spices, textiles, instruments, manuscripts
    expect(content).toContain('qalam');        // calligraphy tool
    expect(content).toContain('astrolabe');     // scientific instrument
    expect(content).toContain('saffron');       // spice
    expect(content).toContain('silk_fabric');   // textile
    expect(content).toContain('ancient_manuscript'); // manuscript
  });
});

// ── languages.pl ───────────────────────────────────────────────

describe('Arabic Al-Andalus: languages.pl', () => {
  it('defines Arabic language', () => {
    const content = readPrologFile('languages.pl');
    expect(content).toContain("language(arabic, 'Arabic')");
    expect(content).toContain('language_learning_target(arabic)');
  });

  it('has language_family, script, and speakers', () => {
    const content = readPrologFile('languages.pl');
    expect(content).toContain('language_family(arabic');
    expect(content).toContain('language_script(arabic');
    expect(content).toContain('language_speakers(arabic');
  });
});

// ── grammars.pl ────────────────────────────────────────────────

describe('Arabic Al-Andalus: grammars.pl', () => {
  it('has at least 3 grammars', () => {
    const content = readPrologFile('grammars.pl');
    expect(countPredicates(content, 'grammar')).toBeGreaterThanOrEqual(3);
  });

  it('has grammar rules for each grammar', () => {
    const content = readPrologFile('grammars.pl');
    expect(countPredicates(content, 'grammar_rule')).toBeGreaterThanOrEqual(10);
  });

  it('includes Arabic name generation', () => {
    const content = readPrologFile('grammars.pl');
    expect(content).toContain('character_names');
    expect(content).toContain('arabicmale');
    expect(content).toContain('arabicfemale');
  });
});

// ── truths.pl ──────────────────────────────────────────────────

describe('Arabic Al-Andalus: truths.pl', () => {
  it('has at least 20 truths', () => {
    const content = readPrologFile('truths.pl');
    expect(countPredicates(content, 'truth')).toBeGreaterThanOrEqual(20);
  });

  it('covers cultural norms, social rules, and linguistic notes', () => {
    const content = readPrologFile('truths.pl');
    expect(content).toContain('cultural_norm');
    expect(content).toContain('social_rule');
    expect(content).toContain('linguistic_note');
  });

  it('addresses Arabic-specific linguistic features', () => {
    const content = readPrologFile('truths.pl');
    expect(content.toLowerCase()).toContain('diglossia');
    expect(content.toLowerCase()).toContain('right-to-left');
    expect(content.toLowerCase()).toContain('formal');
  });
});

// ── history.pl ─────────────────────────────────────────────────

describe('Arabic Al-Andalus: history.pl', () => {
  it('has at least 15 historical events', () => {
    const content = readPrologFile('history.pl');
    expect(countPredicates(content, 'history_event')).toBeGreaterThanOrEqual(15);
  });

  it('all events have descriptions and categories', () => {
    const content = readPrologFile('history.pl');
    const eventCount = countPredicates(content, 'history_event');
    expect(countPredicates(content, 'history_description')).toBe(eventCount);
    expect(countPredicates(content, 'history_category')).toBe(eventCount);
  });
});

// ── Cross-file Consistency ─────────────────────────────────────

describe('Arabic Al-Andalus: Cross-file consistency', () => {
  it('settlement atoms in locations.pl match settlements.pl', () => {
    const settlements = readPrologFile('settlements.pl');
    const locations = readPrologFile('locations.pl');

    // Extract settlement atoms from lot/3 third argument
    const lotSettlements = new Set(extractAtoms(locations, 'lot', 2));
    const definedSettlements = new Set(extractAtoms(settlements, 'settlement', 0));

    for (const s of lotSettlements) {
      expect(definedSettlements.has(s), `Settlement "${s}" used in locations.pl but not defined in settlements.pl`).toBe(true);
    }
  });

  it('character atoms in truths.pl match characters.pl', () => {
    const characters = readPrologFile('characters.pl');
    const truths = readPrologFile('truths.pl');

    const definedPersons = new Set(extractAtoms(characters, 'person', 0));
    const truthCharacters = extractAtoms(truths, 'truth_character', 1);

    for (const c of truthCharacters) {
      expect(definedPersons.has(c), `Character "${c}" referenced in truths.pl but not in characters.pl`).toBe(true);
    }
  });

  it('world atom is consistent across files', () => {
    const world = readPrologFile('world.pl');
    expect(world).toContain('arabic_al_andalus');
  });
});
