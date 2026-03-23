/**
 * Quest Completability Audit
 *
 * Audits all quests in a world to identify completability issues:
 * - Invalid or unknown objective types
 * - Objectives referencing non-existent NPCs, items, or locations
 * - Missing completion event handlers
 * - Missing action feasibility mappings
 * - Expired quests still marked active
 * - Quests with no objectives
 * - Dependency chain issues (objectives depending on non-existent objectives)
 * - Exceeded max attempts
 *
 * Pure logic — no DB or server dependencies. Accepts pre-fetched data.
 */

import { normalizeObjectiveType, VALID_OBJECTIVE_TYPES } from './quest-objective-types';
import { OBJECTIVE_COMPLETION_EVENT_MAP } from './quest-completability-validator';
import { findMatchingActions, type GameAction } from './quest-feasibility-validator';

// ── Types ───────────────────────────────────────────────────────────────────

export interface AuditQuest {
  id: string;
  title: string;
  status: string;
  objectives?: Array<{
    id?: string;
    type: string;
    description?: string;
    target?: string;
    required?: number;
    requiredCount?: number;
    completed?: boolean;
    dependsOn?: string[];
    order?: number;
    [key: string]: any;
  }>;
  assignedTo?: string | null;
  assignedToCharacterId?: string | null;
  assignedBy?: string | null;
  assignedByCharacterId?: string | null;
  locationId?: string | null;
  locationName?: string | null;
  expiresAt?: Date | string | null;
  maxAttempts?: number | null;
  attemptCount?: number | null;
  stages?: any[] | null;
  currentStageId?: string | null;
  questChainId?: string | null;
  questChainOrder?: number | null;
  parentQuestId?: string | null;
  [key: string]: any;
}

export interface WorldContext {
  npcNames: Set<string>;
  npcCharacterIds: Set<string>;
  itemNames: Set<string>;
  locationNames: Set<string>;
  questIds: Set<string>;
}

export interface QuestIssue {
  questId: string;
  questTitle: string;
  severity: 'error' | 'warning';
  category: AuditCategory;
  message: string;
  objectiveIndex?: number;
}

export type AuditCategory =
  | 'no_objectives'
  | 'invalid_objective_type'
  | 'missing_completion_handler'
  | 'missing_action_mapping'
  | 'invalid_target_npc'
  | 'invalid_target_item'
  | 'invalid_target_location'
  | 'invalid_assigned_npc'
  | 'expired_still_active'
  | 'exceeded_max_attempts'
  | 'broken_dependency'
  | 'invalid_parent_quest'
  | 'no_feasible_actions'
  | 'missing_assignment';

export interface AuditCategorySummary {
  category: AuditCategory;
  errorCount: number;
  warningCount: number;
}

export interface QuestCompletabilityAuditReport {
  worldId: string;
  timestamp: string;
  totalQuests: number;
  activeQuests: number;
  questsWithIssues: number;
  errorCount: number;
  warningCount: number;
  issues: QuestIssue[];
  categorySummary: AuditCategorySummary[];
  completableQuests: number;
  incompletableQuests: number;
  incompletableQuestIds: string[];
}

// ── Audit logic ─────────────────────────────────────────────────────────────

export function auditQuestCompletability(
  worldId: string,
  quests: AuditQuest[],
  worldContext: WorldContext,
  availableActions: GameAction[],
  now?: Date,
): QuestCompletabilityAuditReport {
  const currentTime = now ?? new Date();
  const issues: QuestIssue[] = [];
  const questsWithErrors = new Set<string>();

  for (const quest of quests) {
    const questIssues = auditSingleQuest(quest, worldContext, availableActions, currentTime);
    for (const issue of questIssues) {
      issues.push(issue);
      if (issue.severity === 'error') {
        questsWithErrors.add(issue.questId);
      }
    }
  }

  // Build category summary
  const categoryMap = new Map<AuditCategory, { errors: number; warnings: number }>();
  for (const issue of issues) {
    const entry = categoryMap.get(issue.category) ?? { errors: 0, warnings: 0 };
    if (issue.severity === 'error') entry.errors++;
    else entry.warnings++;
    categoryMap.set(issue.category, entry);
  }

  const categorySummary: AuditCategorySummary[] = Array.from(categoryMap.entries()).map(
    ([category, counts]) => ({
      category,
      errorCount: counts.errors,
      warningCount: counts.warnings,
    }),
  );

  const activeQuests = quests.filter(q => q.status === 'active');
  const incompletableQuestIds = Array.from(questsWithErrors);

  return {
    worldId,
    timestamp: currentTime.toISOString(),
    totalQuests: quests.length,
    activeQuests: activeQuests.length,
    questsWithIssues: new Set(issues.map(i => i.questId)).size,
    errorCount: issues.filter(i => i.severity === 'error').length,
    warningCount: issues.filter(i => i.severity === 'warning').length,
    issues,
    categorySummary,
    completableQuests: quests.length - incompletableQuestIds.length,
    incompletableQuests: incompletableQuestIds.length,
    incompletableQuestIds,
  };
}

function auditSingleQuest(
  quest: AuditQuest,
  ctx: WorldContext,
  actions: GameAction[],
  now: Date,
): QuestIssue[] {
  const issues: QuestIssue[] = [];
  const q = { id: quest.id, title: quest.title || '(untitled)' };

  // 1. No objectives
  if (!quest.objectives || quest.objectives.length === 0) {
    issues.push({
      questId: q.id,
      questTitle: q.title,
      severity: 'error',
      category: 'no_objectives',
      message: 'Quest has no objectives',
    });
    // Can't validate objectives further
    return addNonObjectiveChecks(issues, quest, ctx, now);
  }

  // 2. Validate each objective
  const objectiveIds = new Set(
    quest.objectives
      .map(o => o.id)
      .filter((id): id is string => !!id),
  );

  for (let i = 0; i < quest.objectives.length; i++) {
    const obj = quest.objectives[i];
    const rawType = obj.type;

    // 2a. Invalid objective type
    const normalized = normalizeObjectiveType(rawType);
    if (!normalized) {
      issues.push({
        questId: q.id,
        questTitle: q.title,
        severity: 'error',
        category: 'invalid_objective_type',
        message: `Objective ${i}: unknown type "${rawType}"`,
        objectiveIndex: i,
      });
      continue;
    }

    // 2b. Missing completion handler
    if (!OBJECTIVE_COMPLETION_EVENT_MAP[normalized]) {
      issues.push({
        questId: q.id,
        questTitle: q.title,
        severity: 'error',
        category: 'missing_completion_handler',
        message: `Objective ${i}: type "${normalized}" has no completion event handler`,
        objectiveIndex: i,
      });
    }

    // 2c. No feasible actions
    const matching = findMatchingActions(normalized, actions);
    if (matching.length === 0) {
      issues.push({
        questId: q.id,
        questTitle: q.title,
        severity: 'warning',
        category: 'no_feasible_actions',
        message: `Objective ${i}: no world actions can fulfill type "${normalized}"`,
        objectiveIndex: i,
      });
    }

    // 2d. Target validation
    if (obj.target) {
      const targetLower = obj.target.toLowerCase();
      const requiresNpc = ['talk_to_npc', 'deliver_item', 'escort_npc', 'build_friendship',
        'give_gift', 'listening_comprehension', 'listen_and_repeat', 'ask_for_directions',
        'order_food', 'haggle_price', 'introduce_self', 'teach_vocabulary', 'teach_phrase',
        'conversation_initiation'].includes(normalized);
      const requiresItem = ['collect_item', 'craft_item', 'examine_object', 'read_sign',
        'point_and_name'].includes(normalized);
      const requiresLocation = ['visit_location', 'discover_location',
        'navigate_language'].includes(normalized);

      if (requiresNpc && ctx.npcNames.size > 0) {
        const found = Array.from(ctx.npcNames).some(n => n.toLowerCase() === targetLower);
        if (!found) {
          issues.push({
            questId: q.id,
            questTitle: q.title,
            severity: 'warning',
            category: 'invalid_target_npc',
            message: `Objective ${i}: target NPC "${obj.target}" not found in world`,
            objectiveIndex: i,
          });
        }
      }

      if (requiresItem && ctx.itemNames.size > 0) {
        const found = Array.from(ctx.itemNames).some(n => n.toLowerCase() === targetLower);
        if (!found) {
          issues.push({
            questId: q.id,
            questTitle: q.title,
            severity: 'warning',
            category: 'invalid_target_item',
            message: `Objective ${i}: target item "${obj.target}" not found in world`,
            objectiveIndex: i,
          });
        }
      }

      if (requiresLocation && ctx.locationNames.size > 0) {
        const found = Array.from(ctx.locationNames).some(n => n.toLowerCase() === targetLower);
        if (!found) {
          issues.push({
            questId: q.id,
            questTitle: q.title,
            severity: 'warning',
            category: 'invalid_target_location',
            message: `Objective ${i}: target location "${obj.target}" not found in world`,
            objectiveIndex: i,
          });
        }
      }
    }

    // 2e. Dependency validation
    if (obj.dependsOn && obj.dependsOn.length > 0) {
      for (const depId of obj.dependsOn) {
        if (!objectiveIds.has(depId)) {
          issues.push({
            questId: q.id,
            questTitle: q.title,
            severity: 'error',
            category: 'broken_dependency',
            message: `Objective ${i}: depends on non-existent objective "${depId}"`,
            objectiveIndex: i,
          });
        }
      }
    }
  }

  return addNonObjectiveChecks(issues, quest, ctx, now);
}

function addNonObjectiveChecks(
  issues: QuestIssue[],
  quest: AuditQuest,
  ctx: WorldContext,
  now: Date,
): QuestIssue[] {
  const q = { id: quest.id, title: quest.title || '(untitled)' };

  // 3. Expired but still active
  if (quest.status === 'active' && quest.expiresAt) {
    const expiry = new Date(quest.expiresAt);
    if (expiry < now) {
      issues.push({
        questId: q.id,
        questTitle: q.title,
        severity: 'warning',
        category: 'expired_still_active',
        message: `Quest expired at ${expiry.toISOString()} but is still active`,
      });
    }
  }

  // 4. Exceeded max attempts
  if (
    quest.maxAttempts &&
    quest.attemptCount &&
    quest.attemptCount >= quest.maxAttempts &&
    quest.status === 'active'
  ) {
    issues.push({
      questId: q.id,
      questTitle: q.title,
      severity: 'warning',
      category: 'exceeded_max_attempts',
      message: `Quest has ${quest.attemptCount}/${quest.maxAttempts} attempts used but is still active`,
    });
  }

  // 5. Assigned NPC validation
  if (quest.assignedBy && ctx.npcNames.size > 0) {
    const found = Array.from(ctx.npcNames).some(
      n => n.toLowerCase() === quest.assignedBy!.toLowerCase(),
    );
    if (!found) {
      issues.push({
        questId: q.id,
        questTitle: q.title,
        severity: 'warning',
        category: 'invalid_assigned_npc',
        message: `Assigned-by NPC "${quest.assignedBy}" not found in world`,
      });
    }
  }

  // 6. Parent quest validation
  if (quest.parentQuestId && !ctx.questIds.has(quest.parentQuestId)) {
    issues.push({
      questId: q.id,
      questTitle: q.title,
      severity: 'warning',
      category: 'invalid_parent_quest',
      message: `Parent quest "${quest.parentQuestId}" not found`,
    });
  }

  // 7. No assignment
  if (!quest.assignedTo && !quest.assignedToCharacterId && quest.status === 'active') {
    issues.push({
      questId: q.id,
      questTitle: q.title,
      severity: 'warning',
      category: 'missing_assignment',
      message: 'Active quest has no player assignment',
    });
  }

  return issues;
}
