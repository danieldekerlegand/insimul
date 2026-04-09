/**
 * Quest Prolog Linter
 *
 * Parses quest Prolog content and validates that referenced entities
 * (characters, locations, items, languages) exist in the world data.
 * Returns warnings for missing references so creators can fix them.
 */

export interface LintWarning {
  type: 'character' | 'location' | 'item' | 'language' | 'quest';
  severity: 'error' | 'warning';
  message: string;
  /** The referenced value that couldn't be resolved */
  reference: string;
  /** The Prolog predicate where the reference was found */
  predicate: string;
  /** Line number in the content (1-based) */
  line?: number;
}

export interface LintContext {
  /** All character names in the world (first + last) */
  characterNames: string[];
  /** All character IDs in the world */
  characterIds: string[];
  /** All location/lot addresses and names */
  locationNames: string[];
  /** All location IDs */
  locationIds: string[];
  /** All business names */
  businessNames: string[];
  /** All item names */
  itemNames: string[];
  /** All quest IDs in the world */
  questIds: string[];
  /** The world's target language */
  targetLanguage?: string;
}

/**
 * Extract quoted string values from Prolog content.
 * Handles both single-quoted 'value' and double-quoted "value" atoms.
 */
function extractQuotedValues(content: string): Array<{ value: string; line: number; context: string }> {
  const results: Array<{ value: string; line: number; context: string }> = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('%')) continue; // Skip comments

    // Match single-quoted atoms: 'Some Value'
    let singleMatch: RegExpExecArray | null;
    const singleRe = /'([^']+)'/g;
    while ((singleMatch = singleRe.exec(line)) !== null) {
      results.push({ value: singleMatch[1], line: i + 1, context: line });
    }
  }

  return results;
}

/**
 * Extract predicate-specific references from Prolog content.
 */
function extractPredicateRefs(content: string): Array<{
  predicate: string;
  args: string[];
  line: number;
}> {
  const results: Array<{ predicate: string; args: string[]; line: number }> = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('%') || !line.includes('(')) continue;

    // Match predicate(arg1, arg2, ...)
    const match = line.match(/^(\w+)\((.+?)\)\s*[.:]?/);
    if (match) {
      const predicate = match[1];
      // Split args, handling quoted strings
      const argsStr = match[2];
      const args: string[] = [];
      let current = '';
      let inQuote = false;
      let quoteChar = '';
      for (const ch of argsStr) {
        if (!inQuote && (ch === "'" || ch === '"')) {
          inQuote = true;
          quoteChar = ch;
        } else if (inQuote && ch === quoteChar) {
          inQuote = false;
        } else if (!inQuote && ch === ',') {
          args.push(current.trim());
          current = '';
          continue;
        }
        current += ch;
      }
      if (current.trim()) args.push(current.trim());

      results.push({ predicate, args: args.map(a => a.replace(/^['"]|['"]$/g, '')), line: i + 1 });
    }
  }

  return results;
}

/**
 * Lint quest Prolog content against world data.
 */
export function lintQuestContent(content: string | null | undefined, context: LintContext): LintWarning[] {
  if (!content) return [];
  const warnings: LintWarning[] = [];

  const predicates = extractPredicateRefs(content);

  // Build lookup sets for fast matching
  const charNameSet = new Set(context.characterNames.map(n => n.toLowerCase()));
  const charIdSet = new Set(context.characterIds);
  const locationNameSet = new Set(context.locationNames.map(n => n.toLowerCase()));
  const locationIdSet = new Set(context.locationIds);
  const businessNameSet = new Set(context.businessNames.map(n => n.toLowerCase()));
  const itemNameSet = new Set(context.itemNames.map(n => n.toLowerCase()));
  const questIdSet = new Set(context.questIds);

  for (const pred of predicates) {
    // Check quest_assigned_by / quest_assigned_to for character references
    if (pred.predicate === 'quest_assigned_by' && pred.args.length >= 2) {
      const name = pred.args[1];
      if (name !== 'Player' && name !== 'player' && !charNameSet.has(name.toLowerCase()) && !charIdSet.has(name)) {
        warnings.push({
          type: 'character',
          severity: 'warning',
          message: `Character "${name}" not found in world`,
          reference: name,
          predicate: pred.predicate,
          line: pred.line,
        });
      }
    }

    if (pred.predicate === 'quest_assigned_to' && pred.args.length >= 2) {
      const name = pred.args[1];
      if (name !== 'Player' && name !== 'player' && !charNameSet.has(name.toLowerCase()) && !charIdSet.has(name)) {
        warnings.push({
          type: 'character',
          severity: 'warning',
          message: `Character "${name}" not found in world`,
          reference: name,
          predicate: pred.predicate,
          line: pred.line,
        });
      }
    }

    // Check quest_language for target language match
    if (pred.predicate === 'quest_language' && pred.args.length >= 2) {
      const lang = pred.args[1];
      if (context.targetLanguage && lang.toLowerCase() !== context.targetLanguage.toLowerCase()) {
        warnings.push({
          type: 'language',
          severity: 'warning',
          message: `Language "${lang}" doesn't match world target language "${context.targetLanguage}"`,
          reference: lang,
          predicate: pred.predicate,
          line: pred.line,
        });
      }
    }

    // Check quest_location for location references
    if (pred.predicate === 'quest_location' && pred.args.length >= 2) {
      let loc = pred.args[1];
      // Unescape Prolog quotes for matching
      loc = loc.replace(/\\'/g, "'").replace(/\\\\/g, '');
      // Reserved placeholders — skip validation
      const reservedLocations = new Set(['anywhere', 'any_npc', 'any_merchant', 'any_text_location', 'any_crafting_station']);
      // Main quest / narrative quests may reference procedural locations
      const isProceduralQuest = /quest_tag\(\s*\w+\s*,\s*(main_quest|narrative)\s*\)/.test(content);
      // Skip validation entirely when the linter context has no location data loaded
      const hasLocationData = locationNameSet.size > 0 || locationIdSet.size > 0 || businessNameSet.size > 0;
      if (!reservedLocations.has(loc) && !isProceduralQuest && hasLocationData
          && !locationNameSet.has(loc.toLowerCase()) && !locationIdSet.has(loc) && !businessNameSet.has(loc.toLowerCase())) {
        warnings.push({
          type: 'location',
          severity: 'warning',
          message: `Location "${loc}" not found in world`,
          reference: loc,
          predicate: pred.predicate,
          line: pred.line,
        });
      }
    }

    // Check quest_requires_item / quest_reward_item for item references
    if ((pred.predicate === 'quest_requires_item' || pred.predicate === 'quest_reward_item') && pred.args.length >= 2) {
      const item = pred.args[1];
      if (!itemNameSet.has(item.toLowerCase())) {
        warnings.push({
          type: 'item',
          severity: 'warning',
          message: `Item "${item}" not found in world`,
          reference: item,
          predicate: pred.predicate,
          line: pred.line,
        });
      }
    }

    // Check prerequisite quest references
    if (pred.predicate === 'quest_prerequisite' && pred.args.length >= 2) {
      const reqQuestId = pred.args[1];
      // 'none' is a reserved placeholder meaning "no prerequisites"
      if (reqQuestId !== 'none' && !questIdSet.has(reqQuestId)) {
        warnings.push({
          type: 'quest',
          severity: 'warning',
          message: `Prerequisite quest "${reqQuestId}" not found`,
          reference: reqQuestId,
          predicate: pred.predicate,
          line: pred.line,
        });
      }
    }
  }

  // Also scan quoted strings for character name references in objectives and descriptions
  const quotedValues = extractQuotedValues(content);
  for (const qv of quotedValues) {
    // Check if a quoted value looks like a character name (First Last pattern)
    const nameParts = qv.value.split(' ');
    if (nameParts.length === 2 && nameParts[0][0] === nameParts[0][0].toUpperCase() && nameParts[1][0] === nameParts[1][0].toUpperCase()) {
      // Looks like a proper name — check if it's a known character
      // Skip values inside location(...), merchant(...), settlement(...) terms — those are place names
      const isLocationRef = /location\s*\(\s*'/.test(qv.context) || /merchant\s*\(\s*'/.test(qv.context) || /settlement\s*\(\s*'/.test(qv.context);
      if (!isLocationRef && !charNameSet.has(qv.value.toLowerCase()) && !['Player', 'the NPC'].includes(qv.value)) {
        // Only warn if it's in a quest-related predicate context
        if (qv.context.includes('quest_') || qv.context.includes('objective')) {
          warnings.push({
            type: 'character',
            severity: 'warning',
            message: `Possible character reference "${qv.value}" not found in world`,
            reference: qv.value,
            predicate: 'quoted_string',
            line: qv.line,
          });
        }
      }
    }
  }

  return warnings;
}
