import tracery from 'tracery-grammar';

/**
 * TraceryService - Handles Tracery grammar expansion
 *
 * This service wraps the tracery-grammar library and provides
 * methods for expanding grammars with variable substitution.
 */
export class TraceryService {
  /**
   * Expand a Tracery grammar with optional variable substitution
   *
   * @param grammarRules - The Tracery grammar object (e.g., {"origin": ["#name# walks."], "name": ["John", "Mary"]})
   * @param variables - Variables to inject into the grammar (e.g., {name: "Alice"})
   * @param startSymbol - The starting rule to expand (default: "origin")
   * @returns The expanded narrative text
   */
  static expand(
    grammarRules: Record<string, string | string[]>,
    variables: Record<string, any> = {},
    startSymbol: string = 'origin'
  ): string {
    // Create a copy of the grammar rules
    const mergedRules = { ...grammarRules };

    // Inject variables as single-value rules
    // This allows templates like "#heir# is crowned" with variables {heir: "John"}
    for (const [key, value] of Object.entries(variables)) {
      if (value !== undefined && value !== null) {
        // Convert value to string if it's an object with toString
        const stringValue = typeof value === 'object' && value.toString
          ? value.toString()
          : String(value);
        mergedRules[key] = [stringValue];
      }
    }

    // Create Tracery grammar instance
    const grammar = tracery.createGrammar(mergedRules);

    // Add base English modifiers (capitalize, a, s, ed, etc.)
    grammar.addModifiers(tracery.baseEngModifiers);

    // Flatten/expand starting from the specified symbol
    const result = grammar.flatten(`#${startSymbol}#`);

    return result;
  }

  /**
   * Validate that a grammar has the required structure
   *
   * @param grammarRules - The grammar to validate
   * @param requiredSymbol - Symbol that must exist (default: "origin")
   * @returns true if valid, throws error otherwise
   */
  static validate(
    grammarRules: Record<string, string | string[]>,
    requiredSymbol: string = 'origin'
  ): boolean {
    if (!grammarRules || typeof grammarRules !== 'object') {
      throw new Error('Grammar must be an object');
    }

    if (!(requiredSymbol in grammarRules)) {
      throw new Error(`Grammar must contain "${requiredSymbol}" rule`);
    }

    // Check that the required symbol has at least one option
    const symbolValue = grammarRules[requiredSymbol];
    if (Array.isArray(symbolValue) && symbolValue.length === 0) {
      throw new Error(`Grammar "${requiredSymbol}" rule cannot be empty`);
    }

    return true;
  }

  /**
   * Expand a grammar with truth bindings resolved from the database.
   * Truth bindings map Tracery placeholders to data from truth records.
   *
   * @param grammarRules - The Tracery grammar object
   * @param truthBindings - Array of { placeholder, truthQuery } mappings
   * @param truths - Array of truth records from the world to resolve bindings against
   * @param variables - Additional variables to inject
   * @param startSymbol - The starting rule to expand (default: "origin")
   * @returns The expanded narrative text with truth bindings resolved
   */
  static expandWithTruthBindings(
    grammarRules: Record<string, string | string[]>,
    truthBindings: Array<{ placeholder: string; truthQuery: string }>,
    truths: Array<{
      id: string;
      title: string;
      content: string;
      entryType?: string;
      timeYear?: number;
      timeSeason?: string;
      historicalEra?: string;
      historicalSignificance?: string;
      relatedCharacterIds?: string[];
      relatedLocationIds?: string[];
      tags?: string[];
    }>,
    variables: Record<string, any> = {},
    startSymbol: string = 'origin'
  ): string {
    const resolvedVars = { ...variables };

    for (const binding of truthBindings) {
      const { placeholder, truthQuery } = binding;
      const resolved = this.resolveTruthQuery(truthQuery, truths);
      if (resolved !== null) {
        resolvedVars[placeholder] = resolved;
      }
    }

    return this.expand(grammarRules, resolvedVars, startSymbol);
  }

  /**
   * Resolve a truth query against a set of truths.
   * Query formats:
   *   - "truth:title:entryType=history" → returns title of first matching truth
   *   - "truth:content:era=founding" → returns content of first truth in founding era
   *   - "truth:timeYear:significance=world" → returns year of first world-significance truth
   *   - "truth:title:tag=war" → returns title of first truth tagged 'war'
   *   - "truth:random:entryType=event" → returns title of a random matching truth
   *   - "truth:count:era=industrial" → returns count of matching truths
   */
  private static resolveTruthQuery(
    query: string,
    truths: Array<{
      id: string;
      title: string;
      content: string;
      entryType?: string;
      timeYear?: number;
      timeSeason?: string;
      historicalEra?: string;
      historicalSignificance?: string;
      relatedCharacterIds?: string[];
      relatedLocationIds?: string[];
      tags?: string[];
    }>
  ): string | null {
    if (!query.startsWith('truth:')) return null;

    const parts = query.split(':');
    if (parts.length < 3) return null;

    const field = parts[1]; // title, content, timeYear, random, count
    const filterPart = parts.slice(2).join(':'); // e.g., "entryType=history"

    // Parse filter
    const eqIdx = filterPart.indexOf('=');
    if (eqIdx === -1) return null;
    const filterKey = filterPart.substring(0, eqIdx);
    const filterValue = filterPart.substring(eqIdx + 1);

    // Filter truths
    const filtered = truths.filter(t => {
      switch (filterKey) {
        case 'entryType': return t.entryType === filterValue;
        case 'era': return t.historicalEra === filterValue;
        case 'significance': return t.historicalSignificance === filterValue;
        case 'tag': return t.tags?.includes(filterValue);
        case 'id': return t.id === filterValue;
        default: return false;
      }
    });

    if (filtered.length === 0) return null;

    if (field === 'count') return String(filtered.length);

    const target = field === 'random'
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : filtered[0];

    switch (field) {
      case 'title': case 'random': return target.title;
      case 'content': return target.content;
      case 'timeYear': return target.timeYear != null ? String(target.timeYear) : null;
      case 'timeSeason': return target.timeSeason ?? null;
      case 'era': return target.historicalEra ?? null;
      default: return target.title;
    }
  }

  /**
   * Test a grammar by expanding it multiple times
   * Useful for debugging and seeing variations
   *
   * @param grammarRules - The grammar to test
   * @param variables - Variables to use
   * @param iterations - Number of times to expand (default: 5)
   * @returns Array of expanded results
   */
  static test(
    grammarRules: Record<string, string | string[]>,
    variables: Record<string, any> = {},
    iterations: number = 5
  ): string[] {
    const results: string[] = [];
    for (let i = 0; i < iterations; i++) {
      results.push(this.expand(grammarRules, variables));
    }
    return results;
  }

  /**
   * Get pre-built grammar templates for history narration.
   * Each template uses truth binding placeholders.
   */
  static getHistoryNarrationTemplates(): Record<string, Record<string, string | string[]>> {
    return {
      historical_event: {
        origin: [
          'In #year#, #character# #event_verb# in #settlement#.',
          '#character# #event_verb# in #settlement# during the year #year#.',
          'The year #year# saw #character# #event_verb# in #settlement#.',
        ],
        event_verb: [
          'founded a new business',
          'arrived as a settler',
          'married',
          'passed away',
          'was elected mayor',
          'established a homestead',
        ],
      },
      birth_event: {
        origin: [
          '#child# was born to #parent1# and #parent2# in #settlement#, in the year #year#.',
          'In #year#, #parent1# and #parent2# welcomed #child# into the world in #settlement#.',
        ],
      },
      death_event: {
        origin: [
          '#character# passed away in #year# at the age of #age#, leaving behind #legacy#.',
          'In #year#, #settlement# mourned the loss of #character#, aged #age#.',
        ],
        legacy: [
          'a grieving family',
          'a thriving business',
          'many cherished memories',
          'a lasting legacy in the community',
        ],
      },
      marriage_event: {
        origin: [
          '#character1# and #character2# were married in #settlement# in the year #year#.',
          'In #year#, #character1# wed #character2# in a #ceremony# ceremony in #settlement#.',
        ],
        ceremony: ['modest', 'grand', 'simple', 'traditional', 'joyous'],
      },
      business_event: {
        origin: [
          'In #year#, #character# opened #business_name#, a #business_type#, in #settlement#.',
          '#settlement# gained a new #business_type# in #year# when #character# opened #business_name#.',
        ],
      },
      era_summary: {
        origin: [
          'The #era_name# era (#start_year#–#end_year#) was characterized by #era_theme#.',
          'During the #era_name# period, #settlement# experienced #era_theme#.',
        ],
        era_theme: [
          'rapid growth and expansion',
          'hardship and resilience',
          'cultural flourishing',
          'economic transformation',
          'social upheaval',
          'technological advancement',
          'peaceful prosperity',
        ],
      },
    };
  }
}
