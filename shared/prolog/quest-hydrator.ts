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
  const pattern = /quest_objective\(\s*\w+\s*,\s*(\d+)\s*,\s*(.*?)\)\s*\./g;
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

  return objectives;
}

/**
 * Parse a Prolog objective goal term into a structured objective object.
 * Handles all goal types generated by quest-converter.ts convertObjective().
 */
function parseObjectiveGoal(goal: string): any | null {
  // ── Collection ──
  // collect(item, count) or collect('item name', count)
  const collectMatch = goal.match(/^collect\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*,\s*(\d+)\s*\)$/);
  if (collectMatch) {
    const item = collectMatch[1] || collectMatch[2];
    const count = parseInt(collectMatch[3]);
    return { type: 'collect_item', description: `Collect ${count} ${item}`, target: item, requiredCount: count, required: count };
  }

  // ── Talk ──
  // talk_to('NPC', Turns) or talk_to('NPC')
  const talkTurnsMatch = goal.match(/^talk_to\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*,\s*(\d+)\s*\)$/);
  if (talkTurnsMatch) {
    return { type: 'talk_to_npc', description: `Talk to ${talkTurnsMatch[1]}`, target: talkTurnsMatch[1], npcId: talkTurnsMatch[1], requiredCount: parseInt(talkTurnsMatch[2]), required: parseInt(talkTurnsMatch[2]) };
  }
  const talkMatch = goal.match(/^talk_to\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*\)$/);
  if (talkMatch) {
    return { type: 'talk_to_npc', description: `Talk to ${talkMatch[1]}`, target: talkMatch[1], npcId: talkMatch[1], requiredCount: 1, required: 1 };
  }

  // ── Visit ──
  const visitMatch = goal.match(/^visit_location\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*\)$/);
  if (visitMatch) {
    return { type: 'visit_location', description: `Visit ${visitMatch[1]}`, target: visitMatch[1], requiredCount: 1, required: 1 };
  }

  // ── Defeat ──
  const defeatMatch = goal.match(/^defeat\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*,\s*(\d+)\s*\)$/);
  if (defeatMatch) {
    return { type: 'defeat_enemies', description: `Defeat ${defeatMatch[2]} ${defeatMatch[1]}`, target: defeatMatch[1], requiredCount: parseInt(defeatMatch[2]), required: parseInt(defeatMatch[2]) };
  }

  // ── Deliver ──
  const deliverMatch = goal.match(/^deliver\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*,\s*'((?:[^'\\\\]|\\\\.)*)'\s*\)$/);
  if (deliverMatch) {
    const item = deliverMatch[1] || deliverMatch[2];
    return { type: 'deliver_item', description: `Deliver ${item} to ${deliverMatch[3]}`, target: deliverMatch[3], item, requiredCount: 1, required: 1 };
  }

  // ── Use item ──
  const useMatch = goal.match(/^use_item\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*\)$/);
  if (useMatch) {
    const item = useMatch[1] || useMatch[2];
    return { type: 'use_item', description: `Use ${item}`, target: item, requiredCount: 1, required: 1 };
  }

  // ── Craft ──
  const craftMatch = goal.match(/^craft_item\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*,\s*(\d+)\s*\)$/);
  if (craftMatch) {
    const item = craftMatch[1] || craftMatch[2];
    const count = parseInt(craftMatch[3]);
    return { type: 'craft_item', description: `Craft ${count} ${item}`, target: item, requiredCount: count, required: count };
  }

  // ── Escort ──
  const escortMatch = goal.match(/^escort\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*(?:,\s*'((?:[^'\\\\]|\\\\.)*)'\s*)?\)$/);
  if (escortMatch) {
    return { type: 'escort_npc', description: `Escort ${escortMatch[1]}${escortMatch[2] ? ' to ' + escortMatch[2] : ''}`, target: escortMatch[1], requiredCount: 1, required: 1 };
  }

  // ── Discover ──
  const discoverMatch = goal.match(/^discover_location\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*\)$/);
  if (discoverMatch) {
    return { type: 'discover_location', description: `Discover ${discoverMatch[1]}`, target: discoverMatch[1], requiredCount: 1, required: 1 };
  }

  // ── Solve puzzle ──
  const puzzleMatch = goal.match(/^solve_puzzle\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*\)$/);
  if (puzzleMatch) {
    return { type: 'solve_puzzle', description: `Solve puzzle: ${puzzleMatch[1]}`, target: puzzleMatch[1], requiredCount: 1, required: 1 };
  }

  // ── Reputation ──
  const repMatch = goal.match(/^gain_reputation\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*,\s*(\d+)\s*\)$/);
  if (repMatch) {
    const faction = repMatch[1] || repMatch[2];
    return { type: 'gain_reputation', description: `Gain ${repMatch[3]} reputation with ${faction}`, target: faction, requiredCount: parseInt(repMatch[3]), required: parseInt(repMatch[3]) };
  }

  // ── Reach level ──
  const levelMatch = goal.match(/^reach_level\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*,\s*(\d+)\s*\)$/);
  if (levelMatch) {
    const skill = levelMatch[1] || levelMatch[2];
    return { type: 'reach_level', description: `Reach level ${levelMatch[3]} in ${skill}`, target: skill, requiredCount: parseInt(levelMatch[3]), required: parseInt(levelMatch[3]) };
  }

  // ── Survive ──
  const surviveMatch = goal.match(/^survive\(\s*(\d+)\s*\)$/);
  if (surviveMatch) {
    return { type: 'survive', description: `Survive for ${surviveMatch[1]} seconds`, requiredCount: parseInt(surviveMatch[1]), required: parseInt(surviveMatch[1]) };
  }

  // ── Count-based objectives (single-arity goals) ──
  const countGoals: Record<string, string> = {
    conversation_turns: 'Complete conversation turns',
    examine_object: 'Examine objects',
    read_sign: 'Read signs',
    write_response: 'Write responses',
    listen_and_repeat: 'Listen and repeat phrases',
    pronunciation_check: 'Complete pronunciation checks',
    identify_object: 'Identify objects',
    order_food: 'Order food items',
    haggle_price: 'Haggle prices',
    buy_item: 'Buy items',
    sell_item: 'Sell items',
    ask_for_directions: 'Ask for directions',
    comprehension_quiz: 'Complete comprehension quizzes',
    translation_challenge: 'Complete translation challenges',
    follow_directions: 'Follow directions',
    listening_comprehension: 'Complete listening exercises',
    collect_vocabulary: 'Collect vocabulary words',
    collect_clue: 'Collect clues',
    vocabulary_activities: 'Complete vocabulary activities',
    conversation_activities: 'Complete conversation activities',
    grammar_activities: 'Complete grammar activities',
    sustained_conversation: 'Sustain a conversation',
    master_words: 'Master vocabulary words',
    learn_new_words: 'Learn new words',
    find_vocabulary_items: 'Find vocabulary items',
    find_text: 'Find texts',
    combat_action: 'Perform combat actions',
    observe_activity: 'Observe activities',
    physical_action: 'Complete physical actions',
    build_friendship: 'Build friendships',
    learn_words_count: 'Learn vocabulary words',
  };

  for (const [functor, desc] of Object.entries(countGoals)) {
    const countMatch = goal.match(new RegExp(`^${functor}\\(\\s*(\\d+)\\s*\\)$`));
    if (countMatch) {
      const count = parseInt(countMatch[1]);
      return { type: functor, description: `${desc} (${count})`, requiredCount: count, required: count };
    }
  }

  // ── physical_action with specific type ──
  const physMatch = goal.match(/^physical_action\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*,\s*(\d+)\s*\)$/);
  if (physMatch) {
    return { type: 'physical_action', description: `Perform ${physMatch[1]} (${physMatch[2]} times)`, target: physMatch[1], requiredCount: parseInt(physMatch[2]), required: parseInt(physMatch[2]) };
  }

  // ── Vocabulary words list ──
  const wordsMatch = goal.match(/^learn_words\(\s*\[(.*?)\]\s*\)$/);
  if (wordsMatch) {
    const words = wordsMatch[1].split(',').map(w => w.trim().replace(/'/g, ''));
    return { type: 'use_vocabulary', description: `Learn words: ${words.join(', ')}`, targetWords: words, requiredCount: words.length, required: words.length };
  }

  // ── Grammar ──
  const grammarMatch = goal.match(/^practice_grammar\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*,\s*(\d+)\s*\)$/);
  if (grammarMatch) {
    return { type: 'grammar_pattern', description: `Practice grammar: ${grammarMatch[1]}`, target: grammarMatch[1], requiredCount: parseInt(grammarMatch[2]), required: parseInt(grammarMatch[2]) };
  }

  // ── Give gift ──
  const giftMatch = goal.match(/^give_gift\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*\)$/);
  if (giftMatch) {
    const target = giftMatch[1] || giftMatch[2];
    return { type: 'give_gift', description: target === 'any' ? 'Give a gift' : `Give a gift to ${target}`, target, requiredCount: 1, required: 1 };
  }

  // ── Photograph ──
  const photoMatch = goal.match(/^photograph\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*,\s*(\d+)\s*\)$/);
  if (photoMatch) {
    const subject = photoMatch[1] || photoMatch[2];
    const count = parseInt(photoMatch[3]);
    return { type: 'photograph_subject', description: subject === 'any' ? `Take ${count} photos` : `Photograph ${subject}`, target: subject, requiredCount: count, required: count };
  }

  // ── Read text ──
  const readMatch = goal.match(/^read_text\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*\)$/);
  if (readMatch) {
    const textId = readMatch[1] || readMatch[2];
    return { type: 'read_text', description: textId === 'any' ? 'Read a text' : `Read: ${textId}`, target: textId, requiredCount: 1, required: 1 };
  }

  // ── Equip item ──
  const equipMatch = goal.match(/^equip_item\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*\)$/);
  if (equipMatch) {
    const item = equipMatch[1] || equipMatch[2];
    return { type: 'equip_item', description: item === 'any' ? 'Equip an item' : `Equip ${item}`, target: item, requiredCount: 1, required: 1 };
  }

  // ── Drop item ──
  const dropMatch = goal.match(/^drop_item\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*\)$/);
  if (dropMatch) {
    const item = dropMatch[1] || dropMatch[2];
    return { type: 'drop_item', description: item === 'any' ? 'Drop an item' : `Drop ${item}`, target: item, requiredCount: 1, required: 1 };
  }

  // ── Accept quest ──
  const acceptMatch = goal.match(/^accept_quest\(\s*(?:'((?:[^'\\\\]|\\\\.)*)'|(\w+))\s*\)$/);
  if (acceptMatch) {
    const qid = acceptMatch[1] || acceptMatch[2];
    return { type: 'accept_quest', description: qid === 'any' ? 'Accept a quest' : `Accept quest: ${qid}`, target: qid, requiredCount: 1, required: 1 };
  }

  // ── introduce_self (no args) ──
  if (goal.trim() === 'introduce_self') {
    return { type: 'introduce_self', description: 'Introduce yourself', requiredCount: 1, required: 1 };
  }

  // ── complete_assessment (no args) ──
  if (goal.trim() === 'complete_assessment') {
    return { type: 'complete_assessment', description: 'Complete the assessment', requiredCount: 1, required: 1 };
  }

  // ── Assessment phase ──
  const assessPhaseMatch = goal.match(/^assessment_phase\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*,\s*'((?:[^'\\\\]|\\\\.)*)'\s*\)$/);
  if (assessPhaseMatch) {
    return {
      type: assessPhaseMatch[1],
      description: assessPhaseMatch[1].replace(/_/g, ' '),
      assessmentPhaseId: assessPhaseMatch[1],
      completionTrigger: assessPhaseMatch[2],
      requiredCount: 1,
      required: 1,
    };
  }

  // ── Generic objective('description') ──
  const objMatch = goal.match(/^objective\(\s*'((?:[^'\\\\]|\\\\.)*)'\s*\)$/);
  if (objMatch) {
    return { type: 'objective', description: objMatch[1], requiredCount: 1, required: 1 };
  }

  // ── Fallback ──
  return { type: 'custom', description: goal.replace(/_/g, ' '), requiredCount: 1, required: 1 };
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
