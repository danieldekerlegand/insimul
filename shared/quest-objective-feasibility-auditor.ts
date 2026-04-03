/**
 * Quest Objective Feasibility Auditor
 *
 * Systematically audits quest objectives across all quest sources to flag
 * steps that cannot be completed in-game. Checks:
 * 1. Every objective type has a QuestCompletionEngine handler
 * 2. Every objective type has a completion event mapping
 * 3. Every objective type has an action requirement mapping
 * 4. No placeholder IDs remain unresolved in quest data
 * 5. Internal objective types (arrival_*, complete_assessment) are tracked
 * 6. Quest-action mappings cover all frequently used types
 */

import {
  ACHIEVABLE_OBJECTIVE_TYPES,
  VALID_OBJECTIVE_TYPES,
  normalizeObjectiveType,
} from './quest-objective-types';
import { OBJECTIVE_COMPLETION_EVENT_MAP } from './quest-completability-validator';
import { ACTION_MAPPED_OBJECTIVE_TYPES } from './quest-feasibility-validator';
import { QUEST_ACTION_MAPPINGS } from './game-engine/quest-action-mapping';

// ── Types ───────────────────────────────────────────────────────────────────

export interface AuditIssue {
  category: 'no_handler' | 'no_event_mapping' | 'no_action_mapping' | 'placeholder' | 'unknown_type' | 'dead_handler' | 'internal_type_gap';
  severity: 'error' | 'warning' | 'info';
  objectiveType: string;
  source?: string;
  questName?: string;
  field?: string;
  message: string;
}

export interface AuditReport {
  /** True if no errors found */
  feasible: boolean;
  /** All issues found */
  issues: AuditIssue[];
  /** Summary counts */
  summary: {
    totalObjectiveTypes: number;
    typesWithHandler: number;
    typesWithEventMapping: number;
    typesWithActionMapping: number;
    totalQuestsAudited: number;
    totalObjectivesAudited: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
  /** Coverage percentages */
  coverage: {
    handlerCoverage: number;
    eventMappingCoverage: number;
    actionMappingCoverage: number;
  };
}

export interface QuestObjectiveData {
  type: string;
  description?: string;
  npcId?: string;
  npcName?: string;
  itemName?: string;
  locationName?: string;
  locationId?: string;
  textId?: string;
  craftedItemId?: string;
  requiredCount?: number;
  [key: string]: any;
}

export interface QuestData {
  id?: string;
  title?: string;
  titleEn?: string;
  titleFr?: string;
  objectives?: QuestObjectiveData[];
  _source?: string;
  [key: string]: any;
}

// ── Internal objective types used by QCE but not in canonical set ──────────
// These are arrival/assessment types handled inside QCE's trackEvent method.
// They must have completion event mappings even though they're not in the
// canonical ACHIEVABLE_OBJECTIVE_TYPES list.

export const INTERNAL_OBJECTIVE_TYPES = [
  'arrival_reading',
  'arrival_listening',
  'arrival_conversation',
  'arrival_initiate_conversation',
  'arrival_writing',
  'complete_assessment',
] as const;

// ── Placeholder detection ──────────────────────────────────────────────────

const PLACEHOLDER_PATTERNS = [
  /^\{[^}]+\}$/,           // {npcId}, {locationName}
  /^\{\{[^}]+\}\}$/,       // {{npc}}, {{location}}
  /^TODO$/i,
  /^PLACEHOLDER$/i,
  /^TBD$/i,
  /^undefined$/,
  /^null$/,
  /^$/,                     // empty string
];

function isPlaceholder(value: string | undefined | null): boolean {
  if (value === undefined || value === null) return false;
  if (value === '') return true;
  return PLACEHOLDER_PATTERNS.some(p => p.test(value));
}

// ── QCE handler types ──────────────────────────────────────────────────────
// All objective types that have explicit forEachObjective calls in QCE.
// This is the ground truth for "can the game detect completion of this type?"

export const QCE_HANDLED_OBJECTIVE_TYPES = new Set([
  // Canonical types handled
  'talk_to_npc',
  'introduce_self',
  'ask_for_directions',
  'conversation_initiation',
  'use_vocabulary',
  'collect_vocabulary',
  'vocabulary',
  'complete_conversation',
  'conversation',
  'grammar',
  'buy_item',
  'sell_item',
  'listen_and_repeat',
  'build_friendship',
  'collect_item',
  'collect_items',
  'deliver_item',
  'defeat_enemies',
  'craft_item',
  'perform_physical_action',
  'physical_action',
  'visit_location',
  'discover_location',
  'escort_npc',
  'gain_reputation',
  'listening_comprehension',
  'translation_challenge',
  'navigate_language',
  'write_response',
  'describe_scene',
  'teach_vocabulary',
  'teach_phrase',
  'identify_object',
  'examine_object',
  'read_sign',
  'point_and_name',
  'give_gift',
  'follow_directions',
  'order_food',
  'haggle_price',
  'find_text',
  'collect_text',
  'read_text',
  'read_document',
  'comprehension_quiz',
  'photograph_subject',
  'photograph_activity',
  'observe_activity',
  'eavesdrop',
  'pronunciation_check',
  // Internal types
  'arrival_reading',
  'arrival_listening',
  'arrival_conversation',
  'arrival_initiate_conversation',
  'arrival_writing',
  'complete_assessment',
]);

// ── Core audit functions ───────────────────────────────────────────────────

/**
 * Audit canonical objective types for handler/mapping coverage.
 */
export function auditObjectiveTypeCoverage(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const actionMapSet = new Set(ACTION_MAPPED_OBJECTIVE_TYPES);
  const mappedObjectiveTypes = new Set(QUEST_ACTION_MAPPINGS.map(m => m.objectiveType));

  for (const typeInfo of ACHIEVABLE_OBJECTIVE_TYPES) {
    const t = typeInfo.type;

    // Check QCE handler
    if (!QCE_HANDLED_OBJECTIVE_TYPES.has(t)) {
      issues.push({
        category: 'no_handler',
        severity: 'error',
        objectiveType: t,
        message: `Canonical objective type "${t}" has no QuestCompletionEngine handler — objectives of this type can never be completed`,
      });
    }

    // Check completion event mapping
    if (!OBJECTIVE_COMPLETION_EVENT_MAP[t]) {
      issues.push({
        category: 'no_event_mapping',
        severity: 'error',
        objectiveType: t,
        message: `Canonical objective type "${t}" has no completion event mapping in OBJECTIVE_COMPLETION_EVENT_MAP`,
      });
    }

    // Check action requirement mapping
    if (!actionMapSet.has(t)) {
      issues.push({
        category: 'no_action_mapping',
        severity: 'warning',
        objectiveType: t,
        message: `Canonical objective type "${t}" has no action requirement mapping in OBJECTIVE_ACTION_MAP — feasibility validator cannot check it`,
      });
    }
  }

  // Check internal types have completion event mappings
  for (const t of INTERNAL_OBJECTIVE_TYPES) {
    if (!OBJECTIVE_COMPLETION_EVENT_MAP[t] && !QCE_HANDLED_OBJECTIVE_TYPES.has(t)) {
      issues.push({
        category: 'internal_type_gap',
        severity: 'warning',
        objectiveType: t,
        message: `Internal objective type "${t}" is referenced in QCE but has no completion event mapping`,
      });
    }
  }

  // Check for dead entries in completion event map
  for (const t of Object.keys(OBJECTIVE_COMPLETION_EVENT_MAP)) {
    if (!VALID_OBJECTIVE_TYPES.has(t) && !INTERNAL_OBJECTIVE_TYPES.includes(t as any)) {
      // It's an alias or stale entry
      if (!QCE_HANDLED_OBJECTIVE_TYPES.has(t)) {
        issues.push({
          category: 'dead_handler',
          severity: 'info',
          objectiveType: t,
          message: `Completion event mapping exists for "${t}" but it is not canonical and not handled by QCE`,
        });
      }
    }
  }

  return issues;
}

/**
 * Audit a collection of quests for objective feasibility.
 */
export function auditQuestObjectives(quests: QuestData[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  for (const quest of quests) {
    const questName = quest.titleEn || quest.title || quest.id || 'unknown';
    const source = quest._source || 'unknown';

    if (!quest.objectives || quest.objectives.length === 0) continue;

    for (const obj of quest.objectives) {
      // Check for unknown types
      const normalized = normalizeObjectiveType(obj.type);
      if (!normalized) {
        issues.push({
          category: 'unknown_type',
          severity: 'error',
          objectiveType: obj.type,
          source,
          questName,
          message: `Quest "${questName}" uses unknown objective type "${obj.type}" — cannot be completed in-game`,
        });
        continue;
      }

      // Check the normalized type has a handler
      if (!QCE_HANDLED_OBJECTIVE_TYPES.has(normalized) && !INTERNAL_OBJECTIVE_TYPES.includes(normalized as any)) {
        issues.push({
          category: 'no_handler',
          severity: 'error',
          objectiveType: normalized,
          source,
          questName,
          message: `Quest "${questName}" objective type "${normalized}" (raw: "${obj.type}") has no QCE handler`,
        });
      }

      // Check for placeholder values in target fields
      const targetFields = ['npcId', 'npcName', 'itemName', 'locationName', 'locationId', 'textId', 'craftedItemId'] as const;
      for (const field of targetFields) {
        const value = obj[field];
        if (typeof value === 'string' && isPlaceholder(value)) {
          issues.push({
            category: 'placeholder',
            severity: 'warning',
            objectiveType: obj.type,
            source,
            questName,
            field,
            message: `Quest "${questName}" has unresolved placeholder in "${field}": "${value}"`,
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Run the full feasibility audit and produce a report.
 */
export function runFeasibilityAudit(quests: QuestData[] = []): AuditReport {
  const coverageIssues = auditObjectiveTypeCoverage();
  const questIssues = auditQuestObjectives(quests);
  const allIssues = [...coverageIssues, ...questIssues];

  const totalTypes = ACHIEVABLE_OBJECTIVE_TYPES.length;
  const typesWithHandler = ACHIEVABLE_OBJECTIVE_TYPES.filter(t => QCE_HANDLED_OBJECTIVE_TYPES.has(t.type)).length;
  const typesWithEventMapping = ACHIEVABLE_OBJECTIVE_TYPES.filter(t => OBJECTIVE_COMPLETION_EVENT_MAP[t.type]).length;
  const actionMapSet = new Set(ACTION_MAPPED_OBJECTIVE_TYPES);
  const typesWithActionMapping = ACHIEVABLE_OBJECTIVE_TYPES.filter(t => actionMapSet.has(t.type)).length;

  const totalObjectives = quests.reduce((sum, q) => sum + (q.objectives?.length || 0), 0);
  const errorCount = allIssues.filter(i => i.severity === 'error').length;
  const warningCount = allIssues.filter(i => i.severity === 'warning').length;
  const infoCount = allIssues.filter(i => i.severity === 'info').length;

  return {
    feasible: errorCount === 0,
    issues: allIssues,
    summary: {
      totalObjectiveTypes: totalTypes,
      typesWithHandler,
      typesWithEventMapping,
      typesWithActionMapping,
      totalQuestsAudited: quests.length,
      totalObjectivesAudited: totalObjectives,
      errorCount,
      warningCount,
      infoCount,
    },
    coverage: {
      handlerCoverage: totalTypes > 0 ? (typesWithHandler / totalTypes) * 100 : 0,
      eventMappingCoverage: totalTypes > 0 ? (typesWithEventMapping / totalTypes) * 100 : 0,
      actionMappingCoverage: totalTypes > 0 ? (typesWithActionMapping / totalTypes) * 100 : 0,
    },
  };
}

/**
 * Get all objective types from a quest collection, with frequency counts.
 */
export function getObjectiveTypeFrequency(quests: QuestData[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const quest of quests) {
    for (const obj of quest.objectives || []) {
      freq.set(obj.type, (freq.get(obj.type) || 0) + 1);
    }
  }
  return freq;
}

/**
 * Format audit report as human-readable text.
 */
export function formatAuditReport(report: AuditReport): string {
  const lines: string[] = [];
  lines.push('=== Quest Objective Feasibility Audit Report ===\n');

  lines.push('Coverage:');
  lines.push(`  QCE handlers:       ${report.summary.typesWithHandler}/${report.summary.totalObjectiveTypes} (${report.coverage.handlerCoverage.toFixed(1)}%)`);
  lines.push(`  Event mappings:     ${report.summary.typesWithEventMapping}/${report.summary.totalObjectiveTypes} (${report.coverage.eventMappingCoverage.toFixed(1)}%)`);
  lines.push(`  Action mappings:    ${report.summary.typesWithActionMapping}/${report.summary.totalObjectiveTypes} (${report.coverage.actionMappingCoverage.toFixed(1)}%)`);
  lines.push(`  Quests audited:     ${report.summary.totalQuestsAudited}`);
  lines.push(`  Objectives audited: ${report.summary.totalObjectivesAudited}`);
  lines.push('');

  lines.push(`Issues: ${report.summary.errorCount} errors, ${report.summary.warningCount} warnings, ${report.summary.infoCount} info`);
  lines.push(`Verdict: ${report.feasible ? 'FEASIBLE' : 'INFEASIBLE'}\n`);

  if (report.issues.length > 0) {
    const byCategory = new Map<string, AuditIssue[]>();
    for (const issue of report.issues) {
      const list = byCategory.get(issue.category) || [];
      list.push(issue);
      byCategory.set(issue.category, list);
    }

    for (const [category, issues] of Array.from(byCategory.entries())) {
      lines.push(`--- ${category} (${issues.length}) ---`);
      for (const issue of issues) {
        const prefix = issue.severity === 'error' ? 'ERROR' : issue.severity === 'warning' ? 'WARN' : 'INFO';
        lines.push(`  [${prefix}] ${issue.message}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}
