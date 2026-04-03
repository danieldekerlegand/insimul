import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const BENGALI_DIR = join(__dirname, '../../data/worlds/language/bengali');

function readPrologFile(filename: string): string {
  return readFileSync(join(BENGALI_DIR, filename), 'utf-8');
}

function countPredicates(content: string, predicate: string): number {
  const regex = new RegExp(`^${predicate}\\(`, 'gm');
  return (content.match(regex) || []).length;
}

function validatePrologSyntax(content: string): string[] {
  const errors: string[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines, comments, and rule heads (lines ending with :-)
    if (!line || line.startsWith('%') || line.startsWith('%%')) continue;

    // Lines that are rule bodies (continuations) or directives
    if (line.startsWith('\\+')) continue;

    // Check that non-empty, non-comment lines that appear to be facts end with a period
    // A fact/rule should end with '.' but rule bodies might span multiple lines
    if (line.endsWith(':-')) continue; // Rule head
    if (line.endsWith(',')) continue; // Continuation
    if (line.endsWith(';')) continue; // Disjunction

    // Actual fact or end of rule — should end with '.'
    if (line.match(/^[a-z_]/) && !line.endsWith('.')) {
      errors.push(`Line ${i + 1}: Missing period at end of fact: "${line}"`);
    }
  }

  return errors;
}

function checkMatchedParens(content: string): string[] {
  const errors: string[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('%')) continue;

    let depth = 0;
    let inSingleQuote = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === "'" && (j === 0 || line[j - 1] !== "'")) {
        inSingleQuote = !inSingleQuote;
      }
      if (inSingleQuote) continue;
      if (ch === '(') depth++;
      if (ch === ')') depth--;
    }

    if (depth !== 0 && !inSingleQuote) {
      errors.push(`Line ${i + 1}: Unmatched parentheses (depth=${depth}): "${line.trim()}"`);
    }
  }

  return errors;
}

describe('Bengali World Dataset', () => {
  const expectedFiles = [
    'world.pl',
    'settlements.pl',
    'locations.pl',
    'characters.pl',
    'quests.pl',
    'items.pl',
    'languages.pl',
    'grammars.pl',
    'truths.pl',
    'history.pl',
  ];

  it('should have all required files', () => {
    const files = readdirSync(BENGALI_DIR).filter((f) => f.endsWith('.pl'));
    for (const expected of expectedFiles) {
      expect(files).toContain(expected);
    }
  });

  describe('Prolog syntax validation', () => {
    for (const file of expectedFiles) {
      it(`${file} should have valid Prolog syntax (periods, parens)`, () => {
        const content = readPrologFile(file);
        const syntaxErrors = validatePrologSyntax(content);
        const parenErrors = checkMatchedParens(content);
        const allErrors = [...syntaxErrors, ...parenErrors];
        expect(allErrors, allErrors.join('\n')).toEqual([]);
      });
    }
  });

  describe('world.pl', () => {
    it('should define world, country, and state predicates', () => {
      const content = readPrologFile('world.pl');
      expect(countPredicates(content, 'world')).toBeGreaterThanOrEqual(1);
      expect(countPredicates(content, 'world_description')).toBeGreaterThanOrEqual(1);
      expect(countPredicates(content, 'world_type')).toBeGreaterThanOrEqual(1);
      expect(countPredicates(content, 'game_type')).toBeGreaterThanOrEqual(1);
      expect(countPredicates(content, 'target_language')).toBeGreaterThanOrEqual(1);
      expect(countPredicates(content, 'country')).toBeGreaterThanOrEqual(1);
      expect(countPredicates(content, 'state')).toBeGreaterThanOrEqual(1);
    });

    it('should set world_type to historical_renaissance', () => {
      const content = readPrologFile('world.pl');
      expect(content).toContain('world_type(mughal_bengal, historical_renaissance)');
    });

    it('should set target_language to bengali', () => {
      const content = readPrologFile('world.pl');
      expect(content).toContain('target_language(mughal_bengal, bengali)');
    });
  });

  describe('settlements.pl', () => {
    it('should have at least 2 settlements', () => {
      const content = readPrologFile('settlements.pl');
      expect(countPredicates(content, 'settlement')).toBeGreaterThanOrEqual(2);
    });

    it('should have districts and streets', () => {
      const content = readPrologFile('settlements.pl');
      expect(countPredicates(content, 'district')).toBeGreaterThanOrEqual(2);
      expect(countPredicates(content, 'street')).toBeGreaterThanOrEqual(4);
    });
  });

  describe('locations.pl', () => {
    it('should have at least 30 lots', () => {
      const content = readPrologFile('locations.pl');
      expect(countPredicates(content, 'lot')).toBeGreaterThanOrEqual(30);
    });

    it('should have at least 10 businesses', () => {
      const content = readPrologFile('locations.pl');
      expect(countPredicates(content, 'business')).toBeGreaterThanOrEqual(10);
    });
  });

  describe('characters.pl', () => {
    it('should have at least 20 characters', () => {
      const content = readPrologFile('characters.pl');
      expect(countPredicates(content, 'person')).toBeGreaterThanOrEqual(20);
    });

    it('should have family relationships', () => {
      const content = readPrologFile('characters.pl');
      expect(countPredicates(content, 'parent')).toBeGreaterThanOrEqual(4);
      expect(countPredicates(content, 'spouse')).toBeGreaterThanOrEqual(2);
    });

    it('should have location assignments', () => {
      const content = readPrologFile('characters.pl');
      expect(countPredicates(content, 'location')).toBeGreaterThanOrEqual(20);
    });
  });

  describe('quests.pl', () => {
    it('should have at least 15 quests', () => {
      const content = readPrologFile('quests.pl');
      expect(countPredicates(content, 'quest')).toBeGreaterThanOrEqual(15);
    });

    it('should span CEFR levels A1 through B2', () => {
      const content = readPrologFile('quests.pl');
      expect(content).toContain('cefr_a1');
      expect(content).toContain('cefr_a2');
      expect(content).toContain('cefr_b1');
      expect(content).toContain('cefr_b2');
    });

    it('should have quest objectives and rewards', () => {
      const content = readPrologFile('quests.pl');
      expect(countPredicates(content, 'quest_objective')).toBeGreaterThanOrEqual(15);
      expect(countPredicates(content, 'quest_reward')).toBeGreaterThanOrEqual(15);
    });
  });

  describe('items.pl', () => {
    it('should have at least 20 items', () => {
      const content = readPrologFile('items.pl');
      expect(countPredicates(content, 'item')).toBeGreaterThanOrEqual(20);
    });

    it('should have culturally specific Bengali items', () => {
      const content = readPrologFile('items.pl');
      expect(content).toContain('muslin');
      expect(content).toContain('jamdani');
      expect(content).toContain('ilish');
    });
  });

  describe('languages.pl', () => {
    it('should define Bengali language', () => {
      const content = readPrologFile('languages.pl');
      expect(countPredicates(content, 'language')).toBeGreaterThanOrEqual(1);
      expect(content).toContain("language(bengali, 'Bengali')");
      expect(content).toContain('language_learning_target(bengali)');
    });
  });

  describe('grammars.pl', () => {
    it('should have at least 3 grammars', () => {
      const content = readPrologFile('grammars.pl');
      expect(countPredicates(content, 'grammar')).toBeGreaterThanOrEqual(3);
    });

    it('should have grammar rules for name generation', () => {
      const content = readPrologFile('grammars.pl');
      expect(countPredicates(content, 'grammar_rule')).toBeGreaterThanOrEqual(10);
    });
  });

  describe('truths.pl', () => {
    it('should have at least 20 truths', () => {
      const content = readPrologFile('truths.pl');
      expect(countPredicates(content, 'truth')).toBeGreaterThanOrEqual(20);
    });

    it('should include cultural and character truths', () => {
      const content = readPrologFile('truths.pl');
      expect(content).toContain('cultural');
      expect(content).toContain('trait');
      expect(content).toContain('secret');
    });
  });

  describe('history.pl', () => {
    it('should have at least 15 historical events', () => {
      const content = readPrologFile('history.pl');
      expect(countPredicates(content, 'historical_event')).toBeGreaterThanOrEqual(15);
    });

    it('should have event descriptions and importance', () => {
      const content = readPrologFile('history.pl');
      expect(countPredicates(content, 'event_description')).toBeGreaterThanOrEqual(15);
      expect(countPredicates(content, 'event_importance')).toBeGreaterThanOrEqual(15);
    });
  });
});
