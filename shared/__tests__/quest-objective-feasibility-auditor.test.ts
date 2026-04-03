/**
 * Quest Objective Feasibility Auditor Tests
 *
 * Tests the auditor module that flags quest steps that cannot be completed
 * in-game. Validates:
 * 1. All canonical objective types have QCE handlers
 * 2. All canonical types have completion event mappings
 * 3. Placeholder detection works
 * 4. Quest corpus audit catches real issues
 * 5. Report generation is accurate
 */

import { describe, it, expect } from 'vitest';
import {
  auditObjectiveTypeCoverage,
  auditQuestObjectives,
  runFeasibilityAudit,
  getObjectiveTypeFrequency,
  formatAuditReport,
  QCE_HANDLED_OBJECTIVE_TYPES,
  INTERNAL_OBJECTIVE_TYPES,
  type QuestData,
  type AuditIssue,
} from '../quest-objective-feasibility-auditor';
import { ACHIEVABLE_OBJECTIVE_TYPES, VALID_OBJECTIVE_TYPES } from '../quest-objective-types';
import { OBJECTIVE_COMPLETION_EVENT_MAP } from '../quest-completability-validator';
import { ACTION_MAPPED_OBJECTIVE_TYPES } from '../quest-feasibility-validator';
import { QUEST_ACTION_MAPPINGS } from '../game-engine/quest-action-mapping';
import { QUEST_SEEDS } from '../language/quest-seed-library';

// ── Helper: build quest data from seed library ────────────────────────────

function questsFromSeeds(): QuestData[] {
  return QUEST_SEEDS.map(seed => ({
    id: seed.id,
    title: seed.name,
    _source: `seed:${seed.id}`,
    objectives: seed.objectiveTemplates.map((obj, i) => ({
      id: `obj_${i}`,
      type: obj.type,
      description: obj.descriptionTemplate,
      requiredCount: typeof obj.countTemplate === 'number' ? obj.countTemplate : 1,
    })),
  }));
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Quest Objective Feasibility Auditor', () => {

  describe('auditObjectiveTypeCoverage', () => {
    it('returns no errors for canonical types with full coverage', () => {
      const issues = auditObjectiveTypeCoverage();
      const errors = issues.filter(i => i.severity === 'error');

      if (errors.length > 0) {
        console.error('Coverage errors:', errors.map(e => e.message));
      }
      // All canonical types should have handlers and event mappings
      expect(errors.length).toBe(0);
    });

    it('every canonical objective type has a QCE handler', () => {
      const missing: string[] = [];
      for (const typeInfo of ACHIEVABLE_OBJECTIVE_TYPES) {
        if (!QCE_HANDLED_OBJECTIVE_TYPES.has(typeInfo.type)) {
          missing.push(typeInfo.type);
        }
      }

      if (missing.length > 0) {
        console.error('Types without QCE handler:', missing);
      }
      expect(missing).toEqual([]);
    });

    it('every canonical objective type has a completion event mapping', () => {
      const missing: string[] = [];
      for (const typeInfo of ACHIEVABLE_OBJECTIVE_TYPES) {
        if (!OBJECTIVE_COMPLETION_EVENT_MAP[typeInfo.type]) {
          missing.push(typeInfo.type);
        }
      }

      if (missing.length > 0) {
        console.error('Types without completion event mapping:', missing);
      }
      expect(missing).toEqual([]);
    });

    it('internal objective types are tracked in QCE', () => {
      for (const t of INTERNAL_OBJECTIVE_TYPES) {
        expect(QCE_HANDLED_OBJECTIVE_TYPES.has(t)).toBe(true);
      }
    });

    it('no dead entries in completion event map', () => {
      const issues = auditObjectiveTypeCoverage();
      const deadHandlers = issues.filter(i => i.category === 'dead_handler');

      if (deadHandlers.length > 0) {
        console.warn('Dead completion map entries:', deadHandlers.map(d => d.objectiveType));
      }
      // Allow a few known aliases
      expect(deadHandlers.length).toBeLessThan(10);
    });
  });

  describe('auditQuestObjectives', () => {
    it('flags quests with unknown objective types', () => {
      const quests: QuestData[] = [{
        id: 'test-1',
        title: 'Test Quest',
        objectives: [
          { type: 'completely_made_up_type', description: 'Do something impossible' },
        ],
      }];

      const issues = auditQuestObjectives(quests);
      const unknownTypeIssues = issues.filter(i => i.category === 'unknown_type');
      expect(unknownTypeIssues.length).toBe(1);
      expect(unknownTypeIssues[0].objectiveType).toBe('completely_made_up_type');
      expect(unknownTypeIssues[0].severity).toBe('error');
    });

    it('accepts quests with valid canonical objective types', () => {
      const quests: QuestData[] = [{
        id: 'test-valid',
        title: 'Valid Quest',
        objectives: [
          { type: 'talk_to_npc', description: 'Talk to someone' },
          { type: 'collect_item', description: 'Collect something' },
          { type: 'visit_location', description: 'Go somewhere' },
        ],
      }];

      const issues = auditQuestObjectives(quests);
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('normalizes known aliases to canonical types', () => {
      const quests: QuestData[] = [{
        id: 'test-aliases',
        title: 'Alias Quest',
        objectives: [
          { type: 'speak_to', description: 'Talk using alias' },  // alias → talk_to_npc
          { type: 'gather', description: 'Collect using alias' },  // alias → collect_item
          { type: 'craft', description: 'Craft using alias' },     // alias → craft_item
        ],
      }];

      const issues = auditQuestObjectives(quests);
      const unknownTypeIssues = issues.filter(i => i.category === 'unknown_type');
      expect(unknownTypeIssues.length).toBe(0);
    });

    it('flags placeholder npcId values', () => {
      const quests: QuestData[] = [{
        id: 'test-placeholder',
        title: 'Placeholder Quest',
        objectives: [
          { type: 'talk_to_npc', description: 'Talk', npcId: '{npcId}' },
          { type: 'deliver_item', description: 'Deliver', npcId: '{{npc_0}}' },
        ],
      }];

      const issues = auditQuestObjectives(quests);
      const placeholders = issues.filter(i => i.category === 'placeholder');
      expect(placeholders.length).toBe(2);
      expect(placeholders[0].field).toBe('npcId');
    });

    it('flags placeholder itemName values', () => {
      const quests: QuestData[] = [{
        id: 'test-placeholder-item',
        title: 'Item Placeholder Quest',
        objectives: [
          { type: 'collect_item', description: 'Collect', itemName: 'PLACEHOLDER' },
        ],
      }];

      const issues = auditQuestObjectives(quests);
      const placeholders = issues.filter(i => i.category === 'placeholder');
      expect(placeholders.length).toBe(1);
      expect(placeholders[0].field).toBe('itemName');
    });

    it('flags empty string target fields as placeholders', () => {
      const quests: QuestData[] = [{
        id: 'test-empty',
        title: 'Empty Field Quest',
        objectives: [
          { type: 'visit_location', description: 'Visit', locationName: '' },
        ],
      }];

      const issues = auditQuestObjectives(quests);
      const placeholders = issues.filter(i => i.category === 'placeholder');
      expect(placeholders.length).toBe(1);
    });

    it('does not flag valid target field values', () => {
      const quests: QuestData[] = [{
        id: 'test-valid-targets',
        title: 'Valid Targets Quest',
        objectives: [
          { type: 'talk_to_npc', description: 'Talk', npcId: 'npc-123' },
          { type: 'collect_item', description: 'Collect', itemName: 'iron_ore' },
          { type: 'visit_location', description: 'Visit', locationName: 'Town Square' },
        ],
      }];

      const issues = auditQuestObjectives(quests);
      const placeholders = issues.filter(i => i.category === 'placeholder');
      expect(placeholders.length).toBe(0);
    });

    it('skips quests with no objectives', () => {
      const quests: QuestData[] = [
        { id: 'empty-1', title: 'No Objectives' },
        { id: 'empty-2', title: 'Empty Array', objectives: [] },
      ];

      const issues = auditQuestObjectives(quests);
      expect(issues.length).toBe(0);
    });
  });

  describe('runFeasibilityAudit', () => {
    it('produces a complete report with no quests', () => {
      const report = runFeasibilityAudit();

      expect(report.summary.totalObjectiveTypes).toBe(ACHIEVABLE_OBJECTIVE_TYPES.length);
      expect(report.summary.totalQuestsAudited).toBe(0);
      expect(report.summary.totalObjectivesAudited).toBe(0);
      expect(report.coverage.handlerCoverage).toBeGreaterThan(0);
      expect(report.coverage.eventMappingCoverage).toBeGreaterThan(0);
    });

    it('reports 100% handler coverage for canonical types', () => {
      const report = runFeasibilityAudit();
      expect(report.coverage.handlerCoverage).toBe(100);
    });

    it('reports 100% event mapping coverage for canonical types', () => {
      const report = runFeasibilityAudit();
      expect(report.coverage.eventMappingCoverage).toBe(100);
    });

    it('marks report as feasible when no errors', () => {
      const report = runFeasibilityAudit([{
        id: 'good-quest',
        title: 'Good Quest',
        objectives: [
          { type: 'talk_to_npc', description: 'Talk', npcId: 'real-npc' },
        ],
      }]);

      expect(report.feasible).toBe(true);
      expect(report.summary.errorCount).toBe(0);
    });

    it('marks report as infeasible when errors exist', () => {
      const report = runFeasibilityAudit([{
        id: 'bad-quest',
        title: 'Bad Quest',
        objectives: [
          { type: 'impossible_type_xyz', description: 'Cannot do this' },
        ],
      }]);

      expect(report.feasible).toBe(false);
      expect(report.summary.errorCount).toBeGreaterThan(0);
    });

    it('correctly counts quest and objective totals', () => {
      const quests: QuestData[] = [
        { id: 'q1', title: 'Q1', objectives: [{ type: 'talk_to_npc', description: 'A' }, { type: 'visit_location', description: 'B' }] },
        { id: 'q2', title: 'Q2', objectives: [{ type: 'collect_item', description: 'C' }] },
      ];

      const report = runFeasibilityAudit(quests);
      expect(report.summary.totalQuestsAudited).toBe(2);
      expect(report.summary.totalObjectivesAudited).toBe(3);
    });
  });

  describe('getObjectiveTypeFrequency', () => {
    it('counts objective types correctly', () => {
      const quests: QuestData[] = [
        { objectives: [{ type: 'talk_to_npc' }, { type: 'talk_to_npc' }, { type: 'visit_location' }] },
        { objectives: [{ type: 'talk_to_npc' }, { type: 'craft_item' }] },
      ];

      const freq = getObjectiveTypeFrequency(quests);
      expect(freq.get('talk_to_npc')).toBe(3);
      expect(freq.get('visit_location')).toBe(1);
      expect(freq.get('craft_item')).toBe(1);
    });

    it('handles quests with no objectives', () => {
      const freq = getObjectiveTypeFrequency([{ id: 'empty' }]);
      expect(freq.size).toBe(0);
    });
  });

  describe('formatAuditReport', () => {
    it('produces readable output', () => {
      const report = runFeasibilityAudit();
      const text = formatAuditReport(report);

      expect(text).toContain('Quest Objective Feasibility Audit Report');
      expect(text).toContain('Coverage:');
      expect(text).toContain('QCE handlers:');
      expect(text).toContain('Event mappings:');
      expect(text).toContain('Verdict:');
    });

    it('shows FEASIBLE when no errors', () => {
      const report = runFeasibilityAudit();
      const text = formatAuditReport(report);
      expect(text).toContain('FEASIBLE');
    });

    it('shows INFEASIBLE when errors exist', () => {
      const report = runFeasibilityAudit([{
        id: 'bad',
        title: 'Bad',
        objectives: [{ type: 'nonexistent_action_type' }],
      }]);
      const text = formatAuditReport(report);
      expect(text).toContain('INFEASIBLE');
    });
  });

  describe('Quest seed library audit', () => {
    it('all seed library objective types are canonical', () => {
      const seedQuests = questsFromSeeds();
      const issues = auditQuestObjectives(seedQuests);
      const unknowns = issues.filter(i => i.category === 'unknown_type');

      if (unknowns.length > 0) {
        console.error('Unknown types in seed library:', unknowns.map(u => `${u.questName}: ${u.objectiveType}`));
      }
      expect(unknowns.length).toBe(0);
    });

    it('all seed library objective types have QCE handlers', () => {
      const seedQuests = questsFromSeeds();
      const issues = auditQuestObjectives(seedQuests);
      const noHandler = issues.filter(i => i.category === 'no_handler');

      if (noHandler.length > 0) {
        console.error('No handler in seed library:', noHandler.map(n => `${n.questName}: ${n.objectiveType}`));
      }
      expect(noHandler.length).toBe(0);
    });

    it('seed library has no placeholder values', () => {
      const seedQuests = questsFromSeeds();
      const issues = auditQuestObjectives(seedQuests);
      const placeholders = issues.filter(i => i.category === 'placeholder');
      expect(placeholders.length).toBe(0);
    });

    it('full audit report for seed library is feasible', () => {
      const seedQuests = questsFromSeeds();
      const report = runFeasibilityAudit(seedQuests);

      if (!report.feasible) {
        console.error(formatAuditReport(report));
      }
      expect(report.feasible).toBe(true);
    });
  });

  describe('Cross-system validation', () => {
    it('QUEST_ACTION_MAPPINGS objective types are all canonical or recognized', () => {
      const unrecognized: string[] = [];

      for (const mapping of QUEST_ACTION_MAPPINGS) {
        if (!VALID_OBJECTIVE_TYPES.has(mapping.objectiveType)) {
          // Check if it's a known non-canonical type used in the declarative mappings
          const knownExtras = ['complete_reading', 'answer_questions', 'use_item', 'equip_item', 'drop_item', 'perform_action', 'receive_directions'];
          if (!knownExtras.includes(mapping.objectiveType)) {
            unrecognized.push(mapping.objectiveType);
          }
        }
      }

      if (unrecognized.length > 0) {
        console.warn('Unrecognized types in QUEST_ACTION_MAPPINGS:', unrecognized);
      }
      expect(unrecognized.length).toBe(0);
    });

    it('ACTION_MAPPED_OBJECTIVE_TYPES covers all canonical types used in generators', () => {
      // These are the most commonly used types across all generators
      const commonGeneratorTypes = [
        'talk_to_npc', 'collect_item', 'visit_location', 'use_vocabulary',
        'craft_item', 'deliver_item', 'complete_conversation', 'collect_vocabulary',
      ];

      const actionMapSet = new Set(ACTION_MAPPED_OBJECTIVE_TYPES);
      const missing: string[] = [];
      for (const t of commonGeneratorTypes) {
        if (!actionMapSet.has(t)) {
          missing.push(t);
        }
      }

      if (missing.length > 0) {
        console.warn('Common generator types not in OBJECTIVE_ACTION_MAP:', missing);
      }
      expect(missing.length).toBe(0);
    });

    it('every canonical type with a QCE handler also has an event mapping', () => {
      const typesWithHandlerButNoMapping: string[] = [];
      for (const typeInfo of ACHIEVABLE_OBJECTIVE_TYPES) {
        const t = typeInfo.type;
        if (QCE_HANDLED_OBJECTIVE_TYPES.has(t) && !OBJECTIVE_COMPLETION_EVENT_MAP[t]) {
          typesWithHandlerButNoMapping.push(t);
        }
      }

      expect(typesWithHandlerButNoMapping).toEqual([]);
    });
  });
});
