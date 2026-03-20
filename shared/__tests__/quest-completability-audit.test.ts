import { describe, it, expect } from 'vitest';
import {
  auditQuestCompletability,
  type AuditQuest,
  type WorldContext,
} from '../quest-completability-audit';
import type { GameAction } from '../quest-feasibility-validator';

// ── Fixtures ────────────────────────────────────────────────────────────────

const SOCIAL_ACTION: GameAction = {
  name: 'Talk',
  actionType: 'social',
  category: 'conversation',
  isActive: true,
  tags: ['conversation', 'dialogue'],
};

const PHYSICAL_ACTION: GameAction = {
  name: 'Move',
  actionType: 'physical',
  category: 'movement',
  isActive: true,
  tags: ['movement', 'travel'],
};

const LANGUAGE_ACTION: GameAction = {
  name: 'Practice',
  actionType: 'language',
  category: 'vocabulary',
  isActive: true,
  tags: ['vocabulary', 'language'],
};

const ALL_ACTIONS = [SOCIAL_ACTION, PHYSICAL_ACTION, LANGUAGE_ACTION];

function makeCtx(overrides?: Partial<WorldContext>): WorldContext {
  return {
    npcNames: new Set(['Alice', 'Bob']),
    npcCharacterIds: new Set(['char-1', 'char-2']),
    itemNames: new Set(['Sword', 'Shield']),
    locationNames: new Set(['Market', 'Tavern']),
    questIds: new Set(['quest-1', 'quest-2']),
    ...overrides,
  };
}

function makeQuest(overrides?: Partial<AuditQuest>): AuditQuest {
  return {
    id: 'q-1',
    title: 'Test Quest',
    status: 'active',
    assignedTo: 'Player',
    objectives: [
      { type: 'talk_to_npc', target: 'Alice', required: 1 },
    ],
    ...overrides,
  };
}

const WORLD_ID = 'test-world';

// ── Tests ───────────────────────────────────────────────────────────────────

describe('auditQuestCompletability', () => {
  it('returns clean report for valid quests', () => {
    const quests = [makeQuest()];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    expect(report.totalQuests).toBe(1);
    expect(report.errorCount).toBe(0);
    expect(report.incompletableQuests).toBe(0);
    expect(report.completableQuests).toBe(1);
  });

  it('flags quests with no objectives', () => {
    const quests = [makeQuest({ objectives: [] })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    expect(report.errorCount).toBe(1);
    expect(report.issues[0].category).toBe('no_objectives');
    expect(report.incompletableQuests).toBe(1);
  });

  it('flags unknown objective types', () => {
    const quests = [makeQuest({
      objectives: [{ type: 'summon_dragon' }],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    expect(report.errorCount).toBe(1);
    expect(report.issues[0].category).toBe('invalid_objective_type');
  });

  it('normalizes objective types before checking', () => {
    // 'talk' normalizes to 'talk_to_npc'
    const quests = [makeQuest({
      objectives: [{ type: 'talk', target: 'Alice' }],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    expect(report.issues.filter(i => i.category === 'invalid_objective_type')).toHaveLength(0);
  });

  it('flags objectives with non-existent target NPC', () => {
    const quests = [makeQuest({
      objectives: [{ type: 'talk_to_npc', target: 'NonExistent' }],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const npcIssues = report.issues.filter(i => i.category === 'invalid_target_npc');
    expect(npcIssues).toHaveLength(1);
    expect(npcIssues[0].severity).toBe('warning');
  });

  it('flags objectives with non-existent target item', () => {
    const quests = [makeQuest({
      objectives: [{ type: 'collect_item', target: 'MagicOrb' }],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const itemIssues = report.issues.filter(i => i.category === 'invalid_target_item');
    expect(itemIssues).toHaveLength(1);
  });

  it('flags objectives with non-existent target location', () => {
    const quests = [makeQuest({
      objectives: [{ type: 'visit_location', target: 'Castle' }],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const locIssues = report.issues.filter(i => i.category === 'invalid_target_location');
    expect(locIssues).toHaveLength(1);
  });

  it('passes when target NPC exists (case-insensitive)', () => {
    const quests = [makeQuest({
      objectives: [{ type: 'talk_to_npc', target: 'alice' }],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const npcIssues = report.issues.filter(i => i.category === 'invalid_target_npc');
    expect(npcIssues).toHaveLength(0);
  });

  it('flags expired but still active quests', () => {
    const past = new Date('2020-01-01');
    const quests = [makeQuest({ expiresAt: past })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS, new Date('2025-01-01'));
    const expiredIssues = report.issues.filter(i => i.category === 'expired_still_active');
    expect(expiredIssues).toHaveLength(1);
  });

  it('does not flag expired completed quests', () => {
    const past = new Date('2020-01-01');
    const quests = [makeQuest({ expiresAt: past, status: 'completed' })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS, new Date('2025-01-01'));
    const expiredIssues = report.issues.filter(i => i.category === 'expired_still_active');
    expect(expiredIssues).toHaveLength(0);
  });

  it('flags exceeded max attempts', () => {
    const quests = [makeQuest({ maxAttempts: 3, attemptCount: 3 })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const attemptIssues = report.issues.filter(i => i.category === 'exceeded_max_attempts');
    expect(attemptIssues).toHaveLength(1);
  });

  it('flags broken objective dependencies', () => {
    const quests = [makeQuest({
      objectives: [
        { id: 'obj-1', type: 'talk_to_npc', target: 'Alice' },
        { id: 'obj-2', type: 'talk_to_npc', target: 'Bob', dependsOn: ['obj-999'] },
      ],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const depIssues = report.issues.filter(i => i.category === 'broken_dependency');
    expect(depIssues).toHaveLength(1);
    expect(depIssues[0].severity).toBe('error');
  });

  it('passes valid objective dependencies', () => {
    const quests = [makeQuest({
      objectives: [
        { id: 'obj-1', type: 'talk_to_npc', target: 'Alice' },
        { id: 'obj-2', type: 'talk_to_npc', target: 'Bob', dependsOn: ['obj-1'] },
      ],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const depIssues = report.issues.filter(i => i.category === 'broken_dependency');
    expect(depIssues).toHaveLength(0);
  });

  it('flags invalid parent quest reference', () => {
    const quests = [makeQuest({ parentQuestId: 'nonexistent-quest' })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const parentIssues = report.issues.filter(i => i.category === 'invalid_parent_quest');
    expect(parentIssues).toHaveLength(1);
  });

  it('flags unassigned active quests', () => {
    const quests = [makeQuest({ assignedTo: null, assignedToCharacterId: null })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const assignIssues = report.issues.filter(i => i.category === 'missing_assignment');
    expect(assignIssues).toHaveLength(1);
  });

  it('flags assigned-by NPC not in world', () => {
    const quests = [makeQuest({ assignedBy: 'Ghost' })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    const npcIssues = report.issues.filter(i => i.category === 'invalid_assigned_npc');
    expect(npcIssues).toHaveLength(1);
  });

  it('warns when no actions can fulfill an objective type', () => {
    // Only provide social actions, try combat objective
    const quests = [makeQuest({
      objectives: [{ type: 'defeat_enemies', required: 1 }],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), [SOCIAL_ACTION]);
    const actionIssues = report.issues.filter(i => i.category === 'no_feasible_actions');
    expect(actionIssues).toHaveLength(1);
  });

  it('builds correct category summary', () => {
    const quests = [
      makeQuest({ id: 'q-1', objectives: [] }),
      makeQuest({ id: 'q-2', objectives: [{ type: 'summon_dragon' }] }),
    ];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    expect(report.categorySummary.length).toBeGreaterThanOrEqual(2);
    const noObjCategory = report.categorySummary.find(c => c.category === 'no_objectives');
    expect(noObjCategory?.errorCount).toBe(1);
  });

  it('handles empty quest list', () => {
    const report = auditQuestCompletability(WORLD_ID, [], makeCtx(), ALL_ACTIONS);
    expect(report.totalQuests).toBe(0);
    expect(report.errorCount).toBe(0);
    expect(report.issues).toHaveLength(0);
  });

  it('counts active quests correctly', () => {
    const quests = [
      makeQuest({ id: 'q-1', status: 'active' }),
      makeQuest({ id: 'q-2', status: 'completed' }),
      makeQuest({ id: 'q-3', status: 'failed' }),
    ];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    expect(report.activeQuests).toBe(1);
  });

  it('includes worldId and timestamp in report', () => {
    const now = new Date('2026-03-20T12:00:00Z');
    const report = auditQuestCompletability(WORLD_ID, [], makeCtx(), ALL_ACTIONS, now);
    expect(report.worldId).toBe(WORLD_ID);
    expect(report.timestamp).toBe('2026-03-20T12:00:00.000Z');
  });

  it('skips target validation when world context is empty', () => {
    const emptyCtx = makeCtx({
      npcNames: new Set(),
      itemNames: new Set(),
      locationNames: new Set(),
    });
    const quests = [makeQuest({
      objectives: [{ type: 'talk_to_npc', target: 'Nobody' }],
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, emptyCtx, ALL_ACTIONS);
    const targetIssues = report.issues.filter(
      i => i.category === 'invalid_target_npc' ||
           i.category === 'invalid_target_item' ||
           i.category === 'invalid_target_location',
    );
    expect(targetIssues).toHaveLength(0);
  });

  it('handles multiple issues per quest', () => {
    const quests = [makeQuest({
      objectives: [
        { type: 'summon_dragon' },
        { type: 'talk_to_npc', target: 'Ghost' },
      ],
      assignedBy: 'Phantom',
    })];
    const report = auditQuestCompletability(WORLD_ID, quests, makeCtx(), ALL_ACTIONS);
    expect(report.issues.length).toBeGreaterThanOrEqual(2);
    expect(report.questsWithIssues).toBe(1);
  });
});
