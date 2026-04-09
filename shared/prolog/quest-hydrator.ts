/**
 * Quest Hydrator — Populates quest fields from Prolog content
 *
 * The quest's `content` field (Prolog source) is the single source of truth.
 * This module parses the Prolog predicates and populates the structured fields
 * that the game engine reads (objectives, rewards, status, etc.).
 *
 * Call `hydrateQuestFromProlog(quest)` on any quest object to ensure its
 * fields reflect the Prolog content. This is called during quest loading
 * so the engine always sees Prolog-derived data.
 */

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Populate a quest object's fields from its Prolog `content`.
 * Mutates the quest in-place and returns it.
 * If `content` is empty/null, the quest is returned unchanged.
 */
export function hydrateQuestFromProlog(quest: any): any {
  const content = quest?.content;
  if (!content || typeof content !== 'string') return quest;

  // Parse the main quest/5 fact
  const main = parseQuestFact(content);
  if (main) {
    quest.title = main.title;
    quest.questType = main.questType;
    quest.difficulty = main.difficulty;
    // Only set status from Prolog if quest doesn't already have a runtime status override
    if (!quest.status || quest.status === 'unavailable') {
      quest.status = main.status;
    }
  }

  // Parse objectives — always overwrite from Prolog content
  const objectives = parseObjectives(content);
  if (objectives.length > 0) {
    // Merge with existing objective state (completed, currentCount) if present
    const existingObjs = Array.isArray(quest.objectives) ? quest.objectives : [];
    quest.objectives = objectives.map((obj: any) => {
      const existing = existingObjs.find((e: any) => e.id === obj.id);
      if (existing) {
        // Preserve runtime-mutable state from the existing objective
        return {
          ...obj,
          completed: existing.completed ?? obj.completed,
          currentCount: existing.currentCount ?? obj.currentCount,
          current: existing.current ?? existing.currentCount ?? obj.currentCount,
        };
      }
      return obj;
    });
  }

  // Parse scalar fields
  quest.assignedTo = parseStringFact(content, 'quest_assigned_to') ?? quest.assignedTo;
  quest.assignedBy = parseStringFact(content, 'quest_assigned_by') ?? quest.assignedBy;
  quest.targetLanguage = parseAtomFact(content, 'quest_language') ?? quest.targetLanguage;
  quest.questChainId = parseAtomFact(content, 'quest_chain') ?? quest.questChainId ?? null;
  quest.parentQuestId = parseAtomFact(content, 'quest_parent') ?? quest.parentQuestId ?? null;

  const chainOrder = parseNumberFact(content, 'quest_chain_order');
  if (chainOrder !== null) quest.questChainOrder = chainOrder;

  // Parse location
  const location = parseAtomOrStringFact(content, 'quest_location');
  if (location && location !== 'anywhere') {
    quest.locationName = quest.locationName || location;
  }

  // Parse CEFR level gate
  const cefrLevel = parseAtomFact(content, 'quest_cefr_level');
  if (cefrLevel) quest.cefrLevel = cefrLevel;

  // Parse tags
  const tags = parseAllAtomFacts(content, 'quest_tag');
  if (tags.length > 0) quest.tags = tags;

  // Parse rewards
  const rewards = parseRewards(content);
  if (rewards.experience) {
    quest.experienceReward = rewards.experience;
    delete rewards.experience;
  }
  if (Object.keys(rewards).length > 0) {
    quest.rewards = { ...quest.rewards, ...rewards };
  }

  // Parse item rewards
  const itemRewards = parseItemRewards(content);
  if (itemRewards.length > 0) quest.itemRewards = itemRewards;

  // Parse skill rewards
  const skillRewards = parseSkillRewards(content);
  if (skillRewards.length > 0) quest.skillRewards = skillRewards;

  // Parse unlocks
  const unlocks = parseUnlocks(content);
  if (unlocks.length > 0) quest.unlocks = unlocks;

  // Parse prerequisites
  const prereqs = parsePrerequisites(content);
  if (prereqs.length > 0 && !(prereqs.length === 1 && prereqs[0] === 'none')) {
    quest.prerequisiteQuestIds = prereqs;
  }

  // Parse completion criteria
  const completionCriteria = parseCompletionCriteria(content);
  if (completionCriteria) quest.completionCriteria = completionCriteria;

  // Parse failure conditions
  const failureConditions = parseFailureConditions(content);
  if (failureConditions) quest.failureConditions = failureConditions;

  return quest;
}

/**
 * Hydrate an array of quests from their Prolog content.
 * Convenience wrapper for bulk loading.
 */
export function hydrateQuestsFromProlog(quests: any[]): any[] {
  return quests.map(q => hydrateQuestFromProlog(q));
}

// ── Parsers ────────────────────────────────────────────────────────────────

function parseQuestFact(content: string): { title: string; questType: string; difficulty: string; status: string } | null {
  // Match quest/5 fact — handle escaped quotes in title (e.g., Writer\'s Home)
  const m = content.match(/quest\(\s*\w+\s*,\s*'((?:[^'\\]|\\.)*)'\s*,\s*(\w+)\s*,\s*(\w+)\s*,\s*(\w+)\s*\)/);
  if (!m) return null;
  return { title: unescape(m[1]), questType: m[2], difficulty: m[3], status: m[4] };
}

/** Unescape Prolog string escapes (\\' → ', \\\\ → \\) */
function unescape(s: string): string {
  return s.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

/**
 * Extract a quoted Prolog string from a goal term.
 * Handles escaped quotes: 'Bergeron\'s Market' → "Bergeron's Market"
 * Returns null if no quoted string is found at the expected position.
 */
function extractQuoted(goal: string, prefix: string): string | null {
  if (!goal.startsWith(prefix + '(')) return null;
  const rest = goal.slice(prefix.length + 1); // after the opening paren
  if (!rest.startsWith("'")) return null;
  // Find the closing quote (not preceded by backslash)
  let i = 1;
  let result = '';
  while (i < rest.length) {
    if (rest[i] === '\\' && i + 1 < rest.length) {
      result += rest[i + 1]; // escaped char
      i += 2;
    } else if (rest[i] === "'") {
      return result; // found closing quote
    } else {
      result += rest[i];
      i++;
    }
  }
  return null; // no closing quote found
}

/** Capitalize the first letter of a string */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Convert a Prolog goal term to a human-readable description */
function goalToDescription(functor: string, args: string[]): string {
  const labels: Record<string, string> = {
    visit_location: 'Visit',
    discover_location: 'Discover',
    talk_to: 'Talk to',
    collect: 'Collect',
    defeat: 'Defeat',
    deliver: 'Deliver to',
    use_item: 'Use',
    craft_item: 'Craft',
    escort: 'Escort',
    solve_puzzle: 'Solve',
    gain_reputation: 'Gain reputation with',
    reach_level: 'Reach level',
    give_gift: 'Give a gift to',
    equip_item: 'Equip',
    drop_item: 'Drop',
    accept_quest: 'Accept quest',
    read_text: 'Read',
    find_text: 'Find texts',
    photograph: 'Photograph',
  };
  const label = labels[functor] || capitalize(functor.replace(/_/g, ' '));
  if (args.length === 0) return label;
  const mainArg = args[0] === 'any' ? '' : ` ${args[0]}`;
  const countArg = args.length > 1 && /^\d+$/.test(args[1]) ? ` (${args[1]})` : '';
  return `${label}${mainArg}${countArg}`.trim();
}

/** Recursively unescape all string values in a parsed objective */
function unescapeObj(obj: any): any {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') obj[key] = unescape(obj[key]);
  }
  return obj;
}

function parseObjectives(content: string): any[] {
  const objectives: any[] = [];

  // quest_objective(QuestId, Index, Goal).
  // Use greedy match up to the last ")." on the line to handle nested parens
  const pattern = /quest_objective\(\s*\w+\s*,\s*(\d+)\s*,\s*(.*)\)\s*\./g;
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const index = parseInt(match[1]);
    const goalStr = match[2].trim();
    const parsed = parseObjectiveGoal(goalStr);
    if (parsed) {
      objectives.push({
        id: `obj_${index}`,
        ...unescapeObj(parsed),
        completed: false,
        currentCount: 0,
        current: 0,
      });
    }
  }

  // Also extract objective descriptions from comments if available
  // Format: % Objective N: description text
  const descPattern = /% Objective (\d+):\s*(.*)/g;
  let descMatch;
  while ((descMatch = descPattern.exec(content)) !== null) {
    const idx = parseInt(descMatch[1]);
    const obj = objectives.find(o => o.id === `obj_${idx}`);
    if (obj && !obj.description) {
      obj.description = descMatch[2].trim();
    }
  }

  // Parse quest_objective_location to attach location atoms to objectives
  const locPattern = /quest_objective_location\(\s*\w+\s*,\s*(\d+)\s*,\s*(.*)\)\s*\./g;
  let locMatch;
  while ((locMatch = locPattern.exec(content)) !== null) {
    const idx = parseInt(locMatch[1]);
    const locAtom = locMatch[2].trim().replace(/^'|'$/g, '');
    const obj = objectives.find(o => o.id === `obj_${idx}`);
    if (obj) {
      obj.objectiveLocation = locAtom;
    }
  }

  return objectives;
}

/**
 * Parse a Prolog objective goal term into a structured objective object.
 * Handles all goal types generated by quest-converter.ts convertObjective().
 */
function parseObjectiveGoal(goal: string): any | null {
  // Generic parser: extract functor name, then parse args robustly.
  // This avoids broken escaped-quote regexes for each individual goal type.
  const functorMatch = goal.match(/^(\w+)\(/);
  if (!functorMatch) {
    // No-arg goals
    if (goal.trim() === 'introduce_self') return { type: 'introduce_self', description: 'Introduce yourself', requiredCount: 1, required: 1 };
    if (goal.trim() === 'complete_assessment') return { type: 'complete_assessment', description: 'Complete the assessment', requiredCount: 1, required: 1 };
    return null;
  }

  const functor = functorMatch[1];
  const argsStr = goal.slice(functor.length + 1, -1).trim(); // strip "functor(" and ")"

  // Parse arguments: handles 'quoted strings with \'escapes', atoms, numbers, [lists]
  const args: string[] = [];
  let i = 0;
  while (i < argsStr.length) {
    if (argsStr[i] === ' ' || argsStr[i] === ',') { i++; continue; }
    if (argsStr[i] === "'") {
      // Quoted string — find matching close quote
      let val = '';
      i++; // skip opening quote
      while (i < argsStr.length) {
        if (argsStr[i] === '\\' && i + 1 < argsStr.length) { val += argsStr[i + 1]; i += 2; }
        else if (argsStr[i] === "'") { i++; break; }
        else { val += argsStr[i]; i++; }
      }
      args.push(val);
    } else if (argsStr[i] === '[') {
      // List — find matching ]
      const end = argsStr.indexOf(']', i);
      args.push(argsStr.slice(i, end + 1));
      i = end + 1;
    } else {
      // Atom or number
      let val = '';
      while (i < argsStr.length && argsStr[i] !== ',' && argsStr[i] !== ')') { val += argsStr[i]; i++; }
      args.push(val.trim());
    }
  }

  // ── Map functor + args to structured objective ──

  // Two-arg goals: functor(target, count)
  const twoArgGoals: Record<string, string> = {
    collect: 'collect_item', defeat: 'defeat_enemies', craft_item: 'craft_item',
    gain_reputation: 'gain_reputation', reach_level: 'reach_level',
    photograph: 'photograph_subject', physical_action: 'physical_action',
    practice_grammar: 'grammar_pattern',
  };
  if (twoArgGoals[functor] && args.length >= 2) {
    const target = args[0];
    const count = parseInt(args[1]) || 1;
    return { type: twoArgGoals[functor], description: goalToDescription(functor, args), target, requiredCount: count, required: count };
  }

  // Single-quoted-arg goals: functor('target')
  const singleArgGoals: Record<string, string> = {
    visit_location: 'visit_location', discover_location: 'discover_location',
    talk_to: 'talk_to_npc', solve_puzzle: 'solve_puzzle',
    use_item: 'use_item', equip_item: 'equip_item', drop_item: 'drop_item',
    give_gift: 'give_gift', read_text: 'read_text', accept_quest: 'accept_quest',
    escort: 'escort_npc',
  };
  if (singleArgGoals[functor] && args.length >= 1) {
    const target = args[0];
    const count = args.length >= 2 ? (parseInt(args[1]) || 1) : 1;
    const result: any = { type: singleArgGoals[functor], description: goalToDescription(functor, args), target, requiredCount: count, required: count };
    if (functor === 'talk_to') result.npcId = target;
    return result;
  }

  // Deliver: deliver(item, npc)
  if (functor === 'deliver' && args.length >= 2) {
    return { type: 'deliver_item', description: `Deliver ${args[0]} to ${args[1]}`, target: args[1], item: args[0], requiredCount: 1, required: 1 };
  }

  // Count-only goals: functor(count)
  const countGoals: Record<string, string> = {
    conversation_turns: 'Complete conversation turns',
    examine_object: 'Examine objects', read_sign: 'Read signs',
    write_response: 'Write responses', listen_and_repeat: 'Listen and repeat phrases',
    pronunciation_check: 'Complete pronunciation checks', identify_object: 'Identify objects',
    order_food: 'Order food items', haggle_price: 'Haggle prices',
    buy_item: 'Buy items', sell_item: 'Sell items',
    ask_for_directions: 'Ask for directions', comprehension_quiz: 'Complete comprehension quizzes',
    translation_challenge: 'Complete translation challenges', follow_directions: 'Follow directions',
    listening_comprehension: 'Complete listening exercises', collect_vocabulary: 'Collect vocabulary words',
    collect_clue: 'Collect clues', vocabulary_activities: 'Complete vocabulary activities',
    conversation_activities: 'Complete conversation activities', grammar_activities: 'Complete grammar activities',
    sustained_conversation: 'Sustain a conversation', master_words: 'Master vocabulary words',
    learn_new_words: 'Learn new words', find_vocabulary_items: 'Find vocabulary items',
    find_text: 'Find texts', combat_action: 'Perform combat actions',
    observe_activity: 'Observe activities', build_friendship: 'Build friendships',
    learn_words_count: 'Learn vocabulary words', survive: 'Survive',
    visit_location: 'Visit locations',
  };
  if (countGoals[functor] && args.length === 1 && /^\d+$/.test(args[0])) {
    const count = parseInt(args[0]);
    return { type: functor, description: `${countGoals[functor]} (${count})`, requiredCount: count, required: count };
  }

  // learn_words([word1, word2, ...])
  if (functor === 'learn_words' && args.length === 1 && args[0].startsWith('[')) {
    const words = args[0].slice(1, -1).split(',').map(w => w.trim().replace(/'/g, ''));
    return { type: 'use_vocabulary', description: `Learn words: ${words.join(', ')}`, targetWords: words, requiredCount: words.length, required: words.length };
  }

  // assessment_phase('phase_id', 'trigger')
  if (functor === 'assessment_phase' && args.length >= 2) {
    return {
      type: args[0],
      description: capitalize(args[0].replace(/_/g, ' ')),
      assessmentPhaseId: args[0],
      completionTrigger: args[1],
      requiredCount: 1, required: 1,
    };
  }

  // objective('description text') — generic, with deep recovery for nested corruption
  if (functor === 'objective' && args.length >= 1) {
    let desc = args[0];
    // Deep recovery: strip all objective/Objective wrappers to find a buried Prolog term
    const stripped = desc
      .replace(/[Oo]bjective\(\s*'?/g, '')
      .replace(/'?\s*\)(?:\s*'\s*\))*\s*$/g, '')
      .replace(/^'+|'+$/g, '')
      .trim();
    const buriedTerm = stripped.match(/^(visit[\s_]location|discover[\s_]location|talk[\s_]to|collect|deliver|escort)\s*\(\s*'?/i);
    if (buriedTerm) {
      const funcName = buriedTerm[1].replace(/\s/g, '_').toLowerCase();
      const afterParen = stripped.slice(buriedTerm[0].length);
      const targetName = afterParen.replace(/[')\s]+$/g, '').trim();
      if (targetName) {
        return { type: funcName, description: goalToDescription(funcName, [targetName]), target: targetName, requiredCount: 1, required: 1 };
      }
    }
    return { type: 'objective', description: capitalize(desc), requiredCount: 1, required: 1 };
  }

  // ── Fallback — produce human-readable description from raw goal ──
  return { type: functor || 'custom', description: capitalize(goal.replace(/_/g, ' ').replace(/'/g, '').replace(/\(.*\)/, '').trim()), requiredCount: 1, required: 1 };
}

// ── Scalar fact parsers ────────────────────────────────────────────────────

function parseStringFact(content: string, predicate: string): string | null {
  const m = content.match(new RegExp(`${predicate}\\(\\s*\\w+\\s*,\\s*'((?:[^'\\\\]|\\\\.)*)'\\s*\\)`));
  return m ? unescape(m[1]) : null;
}

function parseAtomFact(content: string, predicate: string): string | null {
  const m = content.match(new RegExp(`${predicate}\\(\\s*\\w+\\s*,\\s*(\\w+)\\s*\\)`));
  return m ? m[1] : null;
}

function parseAtomOrStringFact(content: string, predicate: string): string | null {
  return parseStringFact(content, predicate) ?? parseAtomFact(content, predicate);
}

function parseNumberFact(content: string, predicate: string): number | null {
  const m = content.match(new RegExp(`${predicate}\\(\\s*\\w+\\s*,\\s*(\\d+(?:\\.\\d+)?)\\s*\\)`));
  return m ? parseFloat(m[1]) : null;
}

function parseAllAtomFacts(content: string, predicate: string): string[] {
  const results: string[] = [];
  const pattern = new RegExp(`${predicate}\\(\\s*\\w+\\s*,\\s*(\\w+)\\s*\\)`, 'g');
  let m;
  while ((m = pattern.exec(content)) !== null) {
    results.push(m[1]);
  }
  return results;
}

// ── Rewards ────────────────────────────────────────────────────────────────

function parseRewards(content: string): Record<string, number> {
  const rewards: Record<string, number> = {};
  const pattern = /quest_reward\(\s*\w+\s*,\s*(\w+)\s*,\s*(\d+(?:\.\d+)?)\s*\)/g;
  let m;
  while ((m = pattern.exec(content)) !== null) {
    rewards[m[1]] = parseFloat(m[2]);
  }
  return rewards;
}

function parseItemRewards(content: string): Array<{ itemName: string; quantity: number }> {
  const items: Array<{ itemName: string; quantity: number }> = [];
  const pattern = /quest_item_reward\(\s*\w+\s*,\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*,\s*(\d+)\s*\)/g;
  let m;
  while ((m = pattern.exec(content)) !== null) {
    items.push({ itemName: m[1] || m[2], quantity: parseInt(m[3]) });
  }
  return items;
}

function parseSkillRewards(content: string): Array<{ skillName: string; level: number }> {
  const skills: Array<{ skillName: string; level: number }> = [];
  const pattern = /quest_skill_reward\(\s*\w+\s*,\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*,\s*(\d+)\s*\)/g;
  let m;
  while ((m = pattern.exec(content)) !== null) {
    skills.push({ skillName: m[1] || m[2], level: parseInt(m[3]) });
  }
  return skills;
}

function parseUnlocks(content: string): Array<{ type: string; name: string }> {
  const unlocks: Array<{ type: string; name: string }> = [];
  const pattern = /quest_unlock\(\s*\w+\s*,\s*(\w+)\s*,\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*\)/g;
  let m;
  while ((m = pattern.exec(content)) !== null) {
    unlocks.push({ type: m[1], name: m[2] || m[3] });
  }
  return unlocks;
}

// ── Prerequisites ──────────────────────────────────────────────────────────

function parsePrerequisites(content: string): string[] {
  const prereqs: string[] = [];
  const pattern = /quest_prerequisite\(\s*\w+\s*,\s*(\w+)\s*\)/g;
  let m;
  while ((m = pattern.exec(content)) !== null) {
    if (m[1] !== 'none') prereqs.push(m[1]);
  }
  return prereqs;
}

// ── Completion criteria ────────────────────────────────────────────────────

function parseCompletionCriteria(content: string): Record<string, any> | null {
  // quest_completion(QuestId, Goal).
  const m = content.match(/quest_completion\(\s*\w+\s*,\s*(.*?)\)\s*\./);
  if (!m) return null;
  const goal = m[1].trim();

  if (goal === 'all_objectives_complete') {
    return { type: 'all_objectives', description: 'Complete all objectives' };
  }

  // vocabulary_usage([...], count)
  const vocabMatch = goal.match(/^vocabulary_usage\(\s*\[(.*?)\]\s*,\s*(\d+)\s*\)$/);
  if (vocabMatch) {
    const words = vocabMatch[1].split(',').map(w => w.trim().replace(/'/g, ''));
    return { type: 'vocabulary_usage', requiredWords: words, requiredCount: parseInt(vocabMatch[2]) };
  }

  // vocabulary_count(N)
  const vocabCountMatch = goal.match(/^vocabulary_count\(\s*(\d+)\s*\)$/);
  if (vocabCountMatch) {
    return { type: 'vocabulary_usage', requiredCount: parseInt(vocabCountMatch[1]) };
  }

  // conversation_turns(N)
  const convMatch = goal.match(/^conversation_turns\(\s*(\d+)\s*\)$/);
  if (convMatch) {
    return { type: 'conversation_turns', requiredTurns: parseInt(convMatch[1]) };
  }

  return { type: 'all_objectives', description: 'Complete all objectives' };
}

// ── Failure conditions ─────────────────────────────────────────────────────

function parseFailureConditions(content: string): Record<string, any> | null {
  const m = content.match(/quest_failure_condition\(\s*\w+\s*,\s*(.*?)\)\s*\./);
  if (!m) return null;
  const goal = m[1].trim();

  if (goal === 'timeout') return { type: 'timeout' };
  if (goal === 'player_death') return { type: 'player_death' };

  const repMatch = goal.match(/^reputation_below\(\s*(\d+)\s*\)$/);
  if (repMatch) return { type: 'reputation_below', threshold: parseInt(repMatch[1]) };

  return { type: 'custom', description: goal };
}
