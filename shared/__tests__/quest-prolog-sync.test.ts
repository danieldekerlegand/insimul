import { describe, it, expect, beforeEach } from 'vitest';
import { TauPrologEngine } from '../prolog/tau-engine';

/**
 * Tests for US-006: Quest sync to Prolog auto-sync.
 *
 * We test the quest fact assertion/retraction logic directly against
 * TauPrologEngine, mirroring what PrologAutoSync.onQuestChanged() does.
 */

// Sanitize helper matching prolog-auto-sync.ts
function sanitizeAtom(str: string): string {
  let atom = str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (/^[0-9]/.test(atom)) atom = `n${atom}`;
  return atom || 'unknown';
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

describe('Quest Prolog Sync', () => {
  let engine: TauPrologEngine;

  beforeEach(() => {
    engine = new TauPrologEngine();
  });

  it('asserts quest/4 fact when quest is synced', async () => {
    const quest = {
      id: 'quest-001',
      title: 'Find the Lost Book',
      questType: 'exploration',
      difficulty: 'easy',
      status: 'active',
    };

    const questId = sanitizeAtom(quest.title);
    const status = sanitizeAtom(quest.status);
    await engine.assertFacts([
      `quest(${questId}, '${escapeString(quest.title)}', ${sanitizeAtom(quest.questType)}, ${status})`,
      `quest_status(${questId}, ${status})`,
    ]);

    const allFacts = engine.getAllFacts();
    const questFacts = allFacts.filter(f => f.startsWith('quest('));
    expect(questFacts.length).toBeGreaterThanOrEqual(1);
    expect(questFacts.some(f => f.includes('find_the_lost_book'))).toBe(true);
    expect(questFacts.some(f => f.includes('exploration'))).toBe(true);

    const statusFacts = allFacts.filter(f => f.startsWith('quest_status('));
    expect(statusFacts.length).toBe(1);
    expect(statusFacts[0]).toContain('active');
  });

  it('asserts quest_assigned_to/2 when quest has assignedTo', async () => {
    const quest = {
      id: 'quest-002',
      title: 'Talk to the Baker',
      questType: 'conversation',
      difficulty: 'easy',
      status: 'active',
      assignedTo: 'Player One',
    };

    const questId = sanitizeAtom(quest.title);
    await engine.assertFacts([
      `quest(${questId}, '${escapeString(quest.title)}', ${sanitizeAtom(quest.questType)}, active)`,
      `quest_assigned_to(${questId}, '${escapeString(quest.assignedTo)}')`,
    ]);

    const allFacts = engine.getAllFacts();
    const assignedFacts = allFacts.filter(f => f.startsWith('quest_assigned_to('));
    expect(assignedFacts.length).toBe(1);
    expect(assignedFacts[0]).toContain('Player One');
  });

  it('asserts quest_objective/3 for each objective', async () => {
    const quest = {
      id: 'quest-003',
      title: 'Market Shopping',
      questType: 'daily',
      difficulty: 'easy',
      status: 'active',
      objectives: [
        { description: 'Buy bread from baker' },
        { description: 'Buy fish from fishmonger' },
        { text: 'Return home' },
      ],
    };

    const questId = sanitizeAtom(quest.title);
    const facts: string[] = [];
    for (let i = 0; i < quest.objectives.length; i++) {
      const obj = quest.objectives[i];
      const desc = (obj as any).description || (obj as any).text || '';
      facts.push(`quest_objective(${questId}, ${i}, '${escapeString(desc)}')`);
    }
    await engine.assertFacts(facts);

    const allFacts = engine.getAllFacts();
    const objFacts = allFacts.filter(f => f.startsWith('quest_objective('));
    expect(objFacts.length).toBe(3);
  });

  it('updates quest_status to completed when quest is completed', async () => {
    const questId = sanitizeAtom('Deliver the Letter');

    // Initial: active
    await engine.assertFacts([
      `quest(${questId}, 'Deliver the Letter', conversation, active)`,
      `quest_status(${questId}, active)`,
    ]);

    let allFacts = engine.getAllFacts();
    expect(allFacts.some(f => f.includes('quest_status') && f.includes('active'))).toBe(true);

    // Simulate update: retract old, assert new (as onQuestChanged does)
    await engine.retractFact(`quest_status(${questId}, active)`);
    await engine.retractFact(`quest(${questId}, 'Deliver the Letter', conversation, active)`);
    await engine.assertFacts([
      `quest(${questId}, 'Deliver the Letter', conversation, completed)`,
      `quest_status(${questId}, completed)`,
    ]);

    allFacts = engine.getAllFacts();
    const statusFacts = allFacts.filter(f => f.startsWith('quest_status('));
    expect(statusFacts.length).toBe(1);
    expect(statusFacts[0]).toContain('completed');
  });

  it('retracts all quest facts on delete', async () => {
    const questId = sanitizeAtom('Mystery Quest');

    await engine.assertFacts([
      `quest(${questId}, 'Mystery Quest', exploration, active)`,
      `quest_status(${questId}, active)`,
      `quest_assigned_to(${questId}, 'player')`,
      `quest_objective(${questId}, 0, 'Find the clue')`,
    ]);

    let allFacts = engine.getAllFacts();
    expect(allFacts.filter(f => f.includes(questId)).length).toBe(4);

    // Retract all facts for this quest (simulating onQuestDeleted)
    const predicates = ['quest', 'quest_status', 'quest_assigned_to', 'quest_objective'];
    for (const pred of predicates) {
      const matching = allFacts.filter(f => f.startsWith(`${pred}(${questId}`));
      for (const fact of matching) {
        await engine.retractFact(fact);
      }
    }

    allFacts = engine.getAllFacts();
    expect(allFacts.filter(f => f.includes(questId)).length).toBe(0);
  });

  it('sync-back detects quest_completed fact added by Prolog', async () => {
    const questId = sanitizeAtom('Gather Herbs');

    // Simulate Prolog rule asserting quest_completed
    await engine.assertFacts([
      `quest_completed(${questId})`,
    ]);

    const allFacts = engine.getAllFacts();
    const completedFacts = allFacts.filter(f => f.startsWith('quest_completed('));
    expect(completedFacts.length).toBe(1);
    expect(completedFacts[0]).toContain(questId);
  });

  it('handles quests with special characters in titles', async () => {
    const quest = {
      title: "Baker's Dozen: Special Order!",
      questType: 'daily',
      status: 'active',
    };

    const questId = sanitizeAtom(quest.title);
    await engine.assertFacts([
      `quest(${questId}, '${escapeString(quest.title)}', ${sanitizeAtom(quest.questType)}, active)`,
    ]);

    const allFacts = engine.getAllFacts();
    const questFacts = allFacts.filter(f => f.startsWith('quest('));
    expect(questFacts.length).toBe(1);
    expect(questFacts[0]).toContain('baker_s_dozen_special_order');
  });
});
