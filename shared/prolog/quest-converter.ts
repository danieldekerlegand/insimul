/**
 * Quest-to-Prolog Converter
 *
 * Converts Insimul quest definitions (objectives, completion criteria, prerequisites)
 * into Prolog predicates. Quests become queryable facts and rules:
 *
 *   quest(QuestId, Title, QuestType, Difficulty, Status).
 *   quest_objective(QuestId, ObjectiveIndex, ObjectiveGoal).
 *   quest_completion(QuestId, CriteriaGoal).
 *   quest_prerequisite(QuestId, PrerequisiteQuestId).
 *   quest_reward(QuestId, RewardType, Value).
 *   quest_available(Player, QuestId) :- <prerequisites check>.
 *   quest_complete(Player, QuestId) :- <completion criteria check>.
 */

// ── Types ───────────────────────────────────────────────────────────────────

interface QuestStage {
  stageId: string;
  title: string;
  description: string;
  objectives: any[];
  preconditions?: string[];
  postconditions?: string[];
  nextStageIds?: string[];
}

interface QuestData {
  title: string;
  description?: string;
  questType: string;
  difficulty: string;
  status?: string;
  assignedTo?: string;
  assignedBy?: string | null;
  targetLanguage?: string;
  experienceReward?: number;
  objectives?: any[] | null;
  completionCriteria?: Record<string, any> | null;
  prerequisites?: any[] | null;
  prerequisiteQuestIds?: string[] | null;
  rewards?: Record<string, any> | null;
  itemRewards?: Array<{ itemId: string; quantity: number; name: string }> | null;
  skillRewards?: Array<{ skillId: string; name: string; level: number }> | null;
  unlocks?: Array<{ type: string; id: string; name: string }> | null;
  failureConditions?: Record<string, any> | null;
  questChainId?: string | null;
  questChainOrder?: number | null;
  tags?: string[] | null;
  stages?: QuestStage[] | null;
  parentQuestId?: string | null;
}

interface ConversionResult {
  prologContent: string;
  predicates: string[];
  errors: string[];
}

// ── Converter ───────────────────────────────────────────────────────────────

export function convertQuestToProlog(quest: QuestData): ConversionResult {
  const errors: string[] = [];
  const predicates: string[] = [];
  const lines: string[] = [];
  const questId = sanitizeAtom(quest.title);

  // Metadata comments
  lines.push(`% Quest: ${quest.title}`);
  if (quest.description) lines.push(`% ${quest.description}`);
  lines.push(`% Type: ${quest.questType} / Difficulty: ${quest.difficulty}`);
  lines.push('');

  // Core quest fact
  const status = quest.status || 'active';
  lines.push(`quest(${questId}, '${escapeString(quest.title)}', ${sanitizeAtom(quest.questType)}, ${sanitizeAtom(quest.difficulty)}, ${sanitizeAtom(status)}).`);
  predicates.push('quest/5');

  // Quest assignment
  if (quest.assignedTo) {
    lines.push(`quest_assigned_to(${questId}, '${escapeString(quest.assignedTo)}').`);
    predicates.push('quest_assigned_to/2');
  }
  if (quest.assignedBy) {
    lines.push(`quest_assigned_by(${questId}, '${escapeString(quest.assignedBy)}').`);
    predicates.push('quest_assigned_by/2');
  }

  // Target language
  if (quest.targetLanguage) {
    lines.push(`quest_language(${questId}, ${sanitizeAtom(quest.targetLanguage)}).`);
    predicates.push('quest_language/2');
  }

  // Quest chain info
  if (quest.questChainId) {
    lines.push(`quest_chain(${questId}, ${sanitizeAtom(quest.questChainId)}).`);
    predicates.push('quest_chain/2');
    if (quest.questChainOrder != null) {
      lines.push(`quest_chain_order(${questId}, ${quest.questChainOrder}).`);
      predicates.push('quest_chain_order/2');
    }
  }

  // Tags
  const tags = quest.tags || [];
  for (const tag of tags) {
    lines.push(`quest_tag(${questId}, ${sanitizeAtom(tag)}).`);
  }
  if (tags.length > 0) {
    predicates.push('quest_tag/2');
  }

  lines.push('');

  // ── Objectives → Prolog goals ──────────────────────────────────────────

  const objectives = quest.objectives || [];
  for (let i = 0; i < objectives.length; i++) {
    const obj = objectives[i];
    const goal = convertObjective(obj, i, errors);
    if (goal) {
      lines.push(`quest_objective(${questId}, ${i}, ${goal}).`);
    }
  }
  if (objectives.length > 0) {
    predicates.push('quest_objective/3');
  }

  lines.push('');

  // ── Completion Criteria → Prolog goal ──────────────────────────────────

  const criteria = quest.completionCriteria;
  if (criteria && typeof criteria === 'object') {
    const criteriaGoal = convertCompletionCriteria(criteria, errors);
    if (criteriaGoal) {
      lines.push(`quest_completion(${questId}, ${criteriaGoal}).`);
      predicates.push('quest_completion/2');
    }
  }

  // ── Failure Conditions ─────────────────────────────────────────────────

  const failureConditions = quest.failureConditions;
  if (failureConditions && typeof failureConditions === 'object') {
    const failGoal = convertFailureCondition(failureConditions, errors);
    if (failGoal) {
      lines.push(`quest_failure_condition(${questId}, ${failGoal}).`);
      predicates.push('quest_failure_condition/2');
    }
  }

  lines.push('');

  // ── Prerequisites ──────────────────────────────────────────────────────

  const prereqIds = quest.prerequisiteQuestIds || [];
  for (const prereqId of prereqIds) {
    lines.push(`quest_prerequisite(${questId}, ${sanitizeAtom(prereqId)}).`);
  }
  if (prereqIds.length > 0) {
    predicates.push('quest_prerequisite/2');
  }

  lines.push('');

  // ── Rewards ────────────────────────────────────────────────────────────

  const xpReward = quest.experienceReward || 0;
  if (xpReward > 0) {
    lines.push(`quest_reward(${questId}, experience, ${xpReward}).`);
    predicates.push('quest_reward/3');
  }

  // General rewards object
  const rewards = quest.rewards || {};
  for (const [key, value] of Object.entries(rewards)) {
    if (typeof value === 'number') {
      lines.push(`quest_reward(${questId}, ${sanitizeAtom(key)}, ${value}).`);
    } else if (typeof value === 'string') {
      lines.push(`quest_reward(${questId}, ${sanitizeAtom(key)}, '${escapeString(value)}').`);
    }
  }

  // Item rewards
  const itemRewards = quest.itemRewards || [];
  for (const item of itemRewards) {
    lines.push(`quest_item_reward(${questId}, '${escapeString(item.name)}', ${item.quantity}).`);
  }
  if (itemRewards.length > 0) {
    predicates.push('quest_item_reward/3');
  }

  // Skill rewards
  const skillRewards = quest.skillRewards || [];
  for (const skill of skillRewards) {
    lines.push(`quest_skill_reward(${questId}, '${escapeString(skill.name)}', ${skill.level}).`);
  }
  if (skillRewards.length > 0) {
    predicates.push('quest_skill_reward/3');
  }

  // Unlocks
  const unlocks = quest.unlocks || [];
  for (const unlock of unlocks) {
    lines.push(`quest_unlock(${questId}, ${sanitizeAtom(unlock.type)}, '${escapeString(unlock.name)}').`);
  }
  if (unlocks.length > 0) {
    predicates.push('quest_unlock/3');
  }

  lines.push('');

  // ── quest_available rule ───────────────────────────────────────────────

  lines.push(`% Can Player take this quest?`);
  const availConditions: string[] = [
    `quest(${questId}, _, _, _, active)`,
  ];

  if (prereqIds.length > 0) {
    // All prerequisite quests must be completed
    for (const prereqId of prereqIds) {
      availConditions.push(`quest_status(Player, ${sanitizeAtom(prereqId)}, completed)`);
    }
  }

  lines.push(`quest_available(Player, ${questId}) :-`);
  lines.push(`    ${availConditions.join(',\n    ')}.`);
  predicates.push('quest_available/2');

  lines.push('');

  // ── quest_complete rule ────────────────────────────────────────────────

  if (criteria && typeof criteria === 'object') {
    const completeGoal = convertCompletionCheck(criteria, questId, errors);
    if (completeGoal) {
      lines.push(`% Check if quest is complete for Player`);
      lines.push(`quest_complete(Player, ${questId}) :-`);
      lines.push(`    ${completeGoal}.`);
      predicates.push('quest_complete/2');
    }
  }

  // ── Multi-stage quests ─────────────────────────────────────────────────

  const stages = quest.stages || [];
  if (stages.length > 0) {
    lines.push('');
    lines.push(`% Quest stages for ${quest.title}`);

    for (const stage of stages) {
      const stageAtom = sanitizeAtom(stage.stageId);
      const nextStages = (stage.nextStageIds || []).map(s => sanitizeAtom(s));
      const nextList = nextStages.length > 0 ? `[${nextStages.join(', ')}]` : '[]';

      lines.push(`quest_stage(${questId}, ${stageAtom}, ${nextList}).`);

      // Stage objectives
      for (let i = 0; i < stage.objectives.length; i++) {
        const goal = convertObjective(stage.objectives[i], i, errors);
        if (goal) {
          lines.push(`stage_objective(${questId}, ${stageAtom}, ${i}, ${goal}).`);
        }
      }

      // Stage preconditions
      if (stage.preconditions && stage.preconditions.length > 0) {
        for (const pre of stage.preconditions) {
          lines.push(`stage_precondition(${questId}, ${stageAtom}, ${sanitizeAtom(pre)}).`);
        }
      }

      // Stage postconditions
      if (stage.postconditions && stage.postconditions.length > 0) {
        for (const post of stage.postconditions) {
          lines.push(`stage_postcondition(${questId}, ${stageAtom}, ${sanitizeAtom(post)}).`);
        }
      }
    }

    predicates.push('quest_stage/3', 'stage_objective/4', 'stage_precondition/3', 'stage_postcondition/3');

    // Stage completion rule
    lines.push('');
    lines.push(`% Stage complete: all objectives done`);
    lines.push(`stage_complete(Player, ${questId}, Stage) :-`);
    lines.push(`    quest_stage(${questId}, Stage, _),`);
    lines.push(`    \\+ (stage_objective(${questId}, Stage, Idx, _), \\+ objective_complete(Player, ${questId}, Stage, Idx)).`);
    predicates.push('stage_complete/3');
  }

  // ── Parent quest ────────────────────────────────────────────────────

  if (quest.parentQuestId) {
    lines.push(`quest_parent(${questId}, ${sanitizeAtom(quest.parentQuestId)}).`);
    predicates.push('quest_parent/2');
  }

  return {
    prologContent: lines.join('\n'),
    predicates: Array.from(new Set(predicates)),
    errors,
  };
}

/**
 * Batch convert multiple quests.
 */
export function convertQuestsToProlog(quests: QuestData[]): ConversionResult {
  const allLines: string[] = [];
  const allPredicates: string[] = [];
  const allErrors: string[] = [];

  allLines.push('% Insimul Quests - Auto-generated Prolog');
  allLines.push(`% Generated: ${new Date().toISOString()}`);
  allLines.push(`% Total quests: ${quests.length}`);
  allLines.push('');

  // Shared dynamic declarations
  const dynamicPreds = [
    'quest/5', 'quest_assigned_to/2', 'quest_assigned_by/2',
    'quest_language/2', 'quest_chain/2', 'quest_chain_order/2',
    'quest_tag/2', 'quest_objective/3', 'quest_completion/2',
    'quest_failure_condition/2', 'quest_prerequisite/2',
    'quest_reward/3', 'quest_item_reward/3', 'quest_skill_reward/3',
    'quest_unlock/3', 'quest_available/2', 'quest_complete/2',
    'quest_status/3', 'quest_progress/3',
    'quest_stage/3', 'stage_objective/4', 'stage_precondition/3',
    'stage_postcondition/3', 'stage_complete/3', 'quest_parent/2',
  ];
  for (const p of dynamicPreds) {
    allLines.push(`:- dynamic(${p}).`);
  }
  allLines.push('');

  for (const quest of quests) {
    const result = convertQuestToProlog(quest);
    allLines.push(result.prologContent);
    allLines.push('');
    allPredicates.push(...result.predicates);
    if (result.errors.length > 0) {
      allErrors.push(`[${quest.title}]: ${result.errors.join('; ')}`);
    }
  }

  // Helper rules
  allLines.push('% Helper: find all available quests for a player');
  allLines.push('available_quests(Player, Quests) :-');
  allLines.push('    findall(Q, quest_available(Player, Q), Quests).');
  allLines.push('');
  allLines.push('% Helper: find completed quests for a player');
  allLines.push('completed_quests(Player, Quests) :-');
  allLines.push('    findall(Q, quest_status(Player, Q, completed), Quests).');
  allLines.push('');
  allLines.push('% Helper: find quests by type');
  allLines.push('quests_of_type(Type, Quests) :-');
  allLines.push('    findall(Q, quest(Q, _, Type, _, _), Quests).');

  return {
    prologContent: allLines.join('\n'),
    predicates: Array.from(new Set(allPredicates)),
    errors: allErrors,
  };
}

// ── Objective Converter ─────────────────────────────────────────────────────

function convertObjective(obj: any, index: number, errors: string[]): string | null {
  if (typeof obj === 'string') return `'${escapeString(obj)}'`;
  if (!obj || typeof obj !== 'object') return null;

  const type = obj.type || obj.objectiveType || '';
  const desc = obj.description || obj.text || '';

  // Common objective patterns
  if (type === 'collect' || type === 'gather') {
    const item = obj.item || obj.target || '';
    const count = obj.count || obj.quantity || 1;
    return `collect(${sanitizeAtom(item)}, ${count})`;
  }

  if (type === 'talk' || type === 'speak' || type === 'conversation') {
    const npc = obj.npc || obj.target || obj.character || '';
    return `talk_to('${escapeString(npc)}')`;
  }

  if (type === 'visit' || type === 'go_to' || type === 'travel') {
    const location = obj.location || obj.target || '';
    return `visit_location('${escapeString(location)}')`;
  }

  if (type === 'defeat' || type === 'kill' || type === 'combat') {
    const target = obj.target || obj.enemy || '';
    const count = obj.count || 1;
    return `defeat('${escapeString(target)}', ${count})`;
  }

  if (type === 'use' || type === 'use_item') {
    const item = obj.item || obj.target || '';
    return `use_item(${sanitizeAtom(item)})`;
  }

  if (type === 'deliver') {
    const item = obj.item || '';
    const to = obj.to || obj.target || '';
    return `deliver(${sanitizeAtom(item)}, '${escapeString(to)}')`;
  }

  if (type === 'learn' || type === 'vocabulary_usage') {
    const words = obj.words || obj.requiredWords || [];
    if (words.length > 0) {
      return `learn_words([${words.map((w: string) => `'${escapeString(w)}'`).join(', ')}])`;
    }
    const count = obj.count || obj.requiredCount || 1;
    return `learn_words_count(${count})`;
  }

  if (type === 'grammar_pattern') {
    const pattern = obj.pattern || obj.target || '';
    const count = obj.count || obj.requiredCount || 1;
    return `practice_grammar('${escapeString(pattern)}', ${count})`;
  }

  if (type === 'craft' || type === 'craft_item') {
    const item = obj.item || obj.target || '';
    const count = obj.count || obj.quantity || 1;
    return `craft_item(${sanitizeAtom(item)}, ${count})`;
  }

  if (type === 'reach_level' || type === 'level') {
    const skill = obj.skill || obj.attribute || '';
    const level = obj.level || obj.value || 1;
    return `reach_level(${sanitizeAtom(skill)}, ${level})`;
  }

  if (type === 'escort' || type === 'escort_npc') {
    const npc = obj.npc || obj.target || '';
    const dest = obj.destination || obj.location || '';
    return `escort('${escapeString(npc)}', '${escapeString(dest)}')`;
  }

  if (type === 'discover' || type === 'discover_location' || type === 'explore') {
    const location = obj.location || obj.target || '';
    return `discover_location('${escapeString(location)}')`;
  }

  if (type === 'reputation' || type === 'gain_reputation') {
    const faction = obj.faction || obj.target || '';
    const amount = obj.amount || obj.required || 100;
    return `gain_reputation(${sanitizeAtom(faction)}, ${amount})`;
  }

  if (type === 'survive' || type === 'survive_duration') {
    const duration = obj.duration || obj.time || 60;
    return `survive(${duration})`;
  }

  if (type === 'puzzle' || type === 'solve_puzzle') {
    const puzzleId = obj.puzzleId || obj.target || '';
    return `solve_puzzle('${escapeString(puzzleId)}')`;
  }

  if (type === 'collect_item' || type === 'collect_items') {
    const item = obj.item || obj.itemName || obj.target || '';
    const count = obj.count || obj.quantity || 1;
    return `collect(${sanitizeAtom(item)}, ${count})`;
  }

  if (type === 'talk_to_npc') {
    const npc = obj.npc || obj.npcId || obj.target || '';
    const turns = obj.requiredTurns || obj.minTurns || 1;
    return `talk_to('${escapeString(npc)}', ${turns})`;
  }

  if (type === 'deliver_item') {
    const item = obj.item || obj.itemName || '';
    const npc = obj.npc || obj.npcId || obj.to || '';
    return `deliver(${sanitizeAtom(item)}, '${escapeString(npc)}')`;
  }

  if (type === 'visit_location') {
    const location = obj.location || obj.locationId || obj.target || '';
    return `visit_location('${escapeString(location)}')`;
  }

  if (type === 'defeat_enemies') {
    const enemyType = obj.enemyType || obj.target || obj.enemy || '';
    const count = obj.count || obj.required || 1;
    return `defeat('${escapeString(enemyType)}', ${count})`;
  }

  if (type === 'use_vocabulary') {
    const words = obj.targetWords || obj.words || [];
    const count = obj.requiredCount || words.length || 1;
    if (words.length > 0) {
      return `learn_words([${words.map((w: string) => `'${escapeString(w)}'`).join(', ')}])`;
    }
    return `learn_words_count(${count})`;
  }

  if (type === 'complete_conversation') {
    const turns = obj.requiredTurns || obj.requiredCount || 5;
    return `conversation_turns(${turns})`;
  }

  // Generic: store as a quoted description
  if (desc) {
    return `objective('${escapeString(desc)}')`;
  }

  // Raw JSON fallback
  try {
    return `objective('${escapeString(JSON.stringify(obj))}')`;
  } catch {
    errors.push(`Could not convert objective at index ${index}`);
    return null;
  }
}

// ── Completion Criteria Converter ───────────────────────────────────────────

function convertCompletionCriteria(criteria: Record<string, any>, errors: string[]): string | null {
  const type = criteria.type || '';

  if (type === 'vocabulary_usage') {
    const count = criteria.requiredCount || 1;
    const words = criteria.requiredWords || [];
    if (words.length > 0) {
      return `vocabulary_usage([${words.map((w: string) => `'${escapeString(w)}'`).join(', ')}], ${count})`;
    }
    return `vocabulary_count(${count})`;
  }

  if (type === 'conversation_turns') {
    const turns = criteria.requiredTurns || 1;
    return `conversation_turns(${turns})`;
  }

  if (type === 'grammar_pattern') {
    const count = criteria.requiredCount || 1;
    return `grammar_patterns(${count})`;
  }

  if (type === 'conversation_engagement') {
    const messages = criteria.requiredMessages || 1;
    return `conversation_engagement(${messages})`;
  }

  if (type === 'all_objectives') {
    return `all_objectives_complete`;
  }

  if (type === 'score' || type === 'points') {
    const target = criteria.targetScore || criteria.requiredPoints || 0;
    return `score_reached(${target})`;
  }

  if (type === 'collect_items' || type === 'collect_item') {
    const itemName = criteria.itemName || criteria.items?.[0] || '';
    const count = criteria.count || criteria.items?.length || 1;
    return `collect(${sanitizeAtom(itemName)}, ${count})`;
  }

  if (type === 'defeat_enemies') {
    const enemyType = criteria.enemyType || '';
    const count = criteria.count || 1;
    return `defeat('${escapeString(enemyType)}', ${count})`;
  }

  if (type === 'deliver_item') {
    const itemName = criteria.itemName || '';
    const npc = criteria.targetNpc || '';
    return `deliver(${sanitizeAtom(itemName)}, '${escapeString(npc)}')`;
  }

  if (type === 'discover_location') {
    const location = criteria.locationId || criteria.locationName || '';
    return `discover_location('${escapeString(location)}')`;
  }

  if (type === 'escort_npc') {
    const npc = criteria.npcName || criteria.npcId || '';
    return `escort('${escapeString(npc)}', destination)`;
  }

  if (type === 'gain_reputation') {
    const faction = criteria.factionId || '';
    const amount = criteria.amount || 100;
    return `gain_reputation(${sanitizeAtom(faction)}, ${amount})`;
  }

  if (type === 'craft_item') {
    const itemName = criteria.itemName || '';
    const count = criteria.count || 1;
    return `craft_item(${sanitizeAtom(itemName)}, ${count})`;
  }

  if (type === 'custom' && criteria.predicate) {
    return sanitizeAtom(criteria.predicate);
  }

  if (criteria.description) {
    return `criteria('${escapeString(criteria.description)}')`;
  }

  return null;
}

function convertCompletionCheck(criteria: Record<string, any>, questId: string, errors: string[]): string | null {
  const type = criteria.type || '';

  if (type === 'vocabulary_usage') {
    const count = criteria.requiredCount || 1;
    return `quest_progress(Player, ${questId}, Progress), Progress >= ${count}`;
  }

  if (type === 'conversation_turns') {
    const turns = criteria.requiredTurns || 1;
    return `quest_progress(Player, ${questId}, Turns), Turns >= ${turns}`;
  }

  if (type === 'grammar_pattern') {
    const count = criteria.requiredCount || 1;
    return `quest_progress(Player, ${questId}, Count), Count >= ${count}`;
  }

  if (type === 'collect_items' || type === 'collect_item') {
    const itemName = sanitizeAtom(criteria.itemName || '');
    const count = criteria.count || criteria.items?.length || 1;
    return `collected(Player, ${itemName}, Qty), Qty >= ${count}`;
  }

  if (type === 'defeat_enemies') {
    const enemyType = sanitizeAtom(criteria.enemyType || 'any');
    const count = criteria.count || 1;
    return `aggregate_all(count, defeated(Player, ${enemyType}), C), C >= ${count}`;
  }

  if (type === 'deliver_item') {
    const itemName = sanitizeAtom(criteria.itemName || '');
    const npcId = sanitizeAtom(criteria.targetNpcId || '');
    return `delivered(Player, ${npcId}, ${itemName})`;
  }

  if (type === 'discover_location') {
    const locationId = sanitizeAtom(criteria.locationId || criteria.locationName || '');
    return `discovered(Player, ${locationId})`;
  }

  if (type === 'escort_npc') {
    const npcId = sanitizeAtom(criteria.npcId || '');
    const destId = sanitizeAtom(criteria.destinationId || 'destination');
    return `escorted(Player, ${npcId}, ${destId})`;
  }

  if (type === 'gain_reputation') {
    const factionId = sanitizeAtom(criteria.factionId || '');
    const amount = criteria.amount || 100;
    return `reputation(Player, ${factionId}, Rep), Rep >= ${amount}`;
  }

  if (type === 'craft_item') {
    const itemName = sanitizeAtom(criteria.itemName || '');
    const count = criteria.count || 1;
    return `crafted(Player, ${itemName}, Qty), Qty >= ${count}`;
  }

  if (type === 'conversation_engagement') {
    const messages = criteria.requiredMessages || 1;
    return `quest_progress(Player, ${questId}, Msgs), Msgs >= ${messages}`;
  }

  if (type === 'all_objectives') {
    return `\\+ (quest_objective(${questId}, Idx, _), \\+ objective_complete(Player, ${questId}, Idx))`;
  }

  // Generic: check progress >= 100%
  return `quest_progress(Player, ${questId}, Progress), Progress >= 100`;
}

// ── Failure Condition Converter ─────────────────────────────────────────────

function convertFailureCondition(condition: Record<string, any>, errors: string[]): string | null {
  const type = condition.type || '';

  if (type === 'timeout' || type === 'expired') {
    return 'timeout';
  }

  if (type === 'death' || type === 'player_death') {
    return 'player_death';
  }

  if (type === 'reputation' && condition.threshold != null) {
    return `reputation_below(${condition.threshold})`;
  }

  if (condition.description) {
    return `failure('${escapeString(condition.description)}')`;
  }

  return null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeAtom(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
