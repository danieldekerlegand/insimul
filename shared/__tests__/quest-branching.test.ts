import { describe, it, expect } from 'vitest';
import {
  parseQuestBranchBlock,
  stripQuestBranchBlock,
  validateBranchChoice,
  applyBranchChoice,
} from '../quest-branching';

describe('Quest Branching', () => {
  // ── Parsing ───────────────────────────────────────────────────────────

  describe('parseQuestBranchBlock', () => {
    it('parses a valid QUEST_BRANCH block', () => {
      const response = `The merchant looks at you expectantly.
**QUEST_BRANCH**
QuestId: quest-123
Prompt: How will you help the merchant?
Choice: help_directly | Help carry the goods | stage_carry | The merchant smiles gratefully
Choice: investigate | Investigate the theft | stage_investigate | You decide to look into things
**END_BRANCH**
What do you think?`;

      const result = parseQuestBranchBlock(response);
      expect(result).not.toBeNull();
      expect(result!.questId).toBe('quest-123');
      expect(result!.prompt).toBe('How will you help the merchant?');
      expect(result!.choices).toHaveLength(2);
      expect(result!.choices[0]).toEqual({
        choiceId: 'help_directly',
        label: 'Help carry the goods',
        targetStageId: 'stage_carry',
        consequence: 'The merchant smiles gratefully',
      });
      expect(result!.choices[1]).toEqual({
        choiceId: 'investigate',
        label: 'Investigate the theft',
        targetStageId: 'stage_investigate',
        consequence: 'You decide to look into things',
      });
    });

    it('returns null for response without branch block', () => {
      expect(parseQuestBranchBlock('Just a normal response')).toBeNull();
    });

    it('returns null if no QuestId', () => {
      const response = `**QUEST_BRANCH**
Prompt: What will you do?
Choice: a | Option A | stage_a
**END_BRANCH**`;
      expect(parseQuestBranchBlock(response)).toBeNull();
    });

    it('returns null if no choices', () => {
      const response = `**QUEST_BRANCH**
QuestId: quest-1
Prompt: What will you do?
**END_BRANCH**`;
      expect(parseQuestBranchBlock(response)).toBeNull();
    });

    it('uses default prompt when none provided', () => {
      const response = `**QUEST_BRANCH**
QuestId: quest-1
Choice: a | Option A | stage_a
**END_BRANCH**`;
      const result = parseQuestBranchBlock(response);
      expect(result!.prompt).toBe('What will you do?');
    });

    it('handles choices without consequence', () => {
      const response = `**QUEST_BRANCH**
QuestId: quest-1
Prompt: Choose wisely
Choice: opt_a | Go left | stage_left
Choice: opt_b | Go right | stage_right
**END_BRANCH**`;
      const result = parseQuestBranchBlock(response);
      expect(result!.choices[0].consequence).toBeUndefined();
      expect(result!.choices[1].consequence).toBeUndefined();
    });

    it('skips malformed choice lines (fewer than 3 parts)', () => {
      const response = `**QUEST_BRANCH**
QuestId: quest-1
Prompt: Choose
Choice: only_two | Missing target
Choice: valid | Valid option | stage_valid
**END_BRANCH**`;
      const result = parseQuestBranchBlock(response);
      expect(result!.choices).toHaveLength(1);
      expect(result!.choices[0].choiceId).toBe('valid');
    });
  });

  describe('stripQuestBranchBlock', () => {
    it('removes the QUEST_BRANCH block from the response', () => {
      const response = `Hello traveler! **QUEST_BRANCH**
QuestId: q1
Choice: a | A | s1
**END_BRANCH** How are you?`;
      expect(stripQuestBranchBlock(response)).toBe('Hello traveler!  How are you?');
    });

    it('returns original text if no block present', () => {
      expect(stripQuestBranchBlock('no markers here')).toBe('no markers here');
    });
  });

  // ── Validation ────────────────────────────────────────────────────────

  describe('validateBranchChoice', () => {
    const quest = {
      status: 'active',
      currentStageId: 'stage_1',
      stages: [
        { stageId: 'stage_1', nextStageIds: ['stage_2a', 'stage_2b'] },
        { stageId: 'stage_2a', nextStageIds: ['stage_3'] },
        { stageId: 'stage_2b', nextStageIds: ['stage_3'] },
        { stageId: 'stage_3' },
      ],
    };

    it('accepts a valid transition', () => {
      const result = validateBranchChoice(quest, 'stage_2a');
      expect(result.valid).toBe(true);
    });

    it('rejects a transition not in nextStageIds', () => {
      const result = validateBranchChoice(quest, 'stage_3');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot branch from');
    });

    it('rejects non-existent target stage', () => {
      const result = validateBranchChoice(quest, 'stage_nonexistent');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    it('rejects when quest is not active', () => {
      const result = validateBranchChoice({ ...quest, status: 'completed' }, 'stage_2a');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Quest is not active');
    });

    it('rejects when quest has no stages', () => {
      const result = validateBranchChoice({ status: 'active', stages: [] }, 'stage_1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Quest has no stages to branch');
    });

    it('rejects when quest has null stages', () => {
      const result = validateBranchChoice({ status: 'active', stages: null }, 'stage_1');
      expect(result.valid).toBe(false);
    });

    it('allows any valid stage when no currentStageId is set', () => {
      const questNoStage = { ...quest, currentStageId: null };
      const result = validateBranchChoice(questNoStage, 'stage_2a');
      expect(result.valid).toBe(true);
    });

    it('allows transition when current stage has empty nextStageIds', () => {
      const questOpen = {
        status: 'active',
        currentStageId: 'open_stage',
        stages: [
          { stageId: 'open_stage', nextStageIds: [] },
          { stageId: 'any_target' },
        ],
      };
      const result = validateBranchChoice(questOpen, 'any_target');
      expect(result.valid).toBe(true);
    });
  });

  // ── Applying ──────────────────────────────────────────────────────────

  describe('applyBranchChoice', () => {
    it('sets the new currentStageId and records branch history', () => {
      const quest = { id: 'q1', currentStageId: 'stage_1', progress: {} };
      const result = applyBranchChoice(quest, 'help_merchant', 'stage_2a');

      expect(result.currentStageId).toBe('stage_2a');
      expect(result.progress.branchHistory).toHaveLength(1);
      expect(result.progress.branchHistory[0]).toMatchObject({
        choiceId: 'help_merchant',
        fromStage: 'stage_1',
        toStage: 'stage_2a',
      });
      expect(result.progress.branchHistory[0].at).toBeDefined();
    });

    it('appends to existing branch history', () => {
      const existing = {
        branchHistory: [
          { choiceId: 'prev', fromStage: null, toStage: 'stage_1', at: '2026-01-01T00:00:00.000Z' },
        ],
      };
      const quest = { id: 'q1', currentStageId: 'stage_1', progress: existing };
      const result = applyBranchChoice(quest, 'next_choice', 'stage_2');

      expect(result.progress.branchHistory).toHaveLength(2);
      expect(result.progress.branchHistory[1].choiceId).toBe('next_choice');
    });

    it('handles null progress', () => {
      const quest = { id: 'q1', currentStageId: null, progress: null };
      const result = applyBranchChoice(quest, 'first', 'stage_1');

      expect(result.currentStageId).toBe('stage_1');
      expect(result.progress.branchHistory[0].fromStage).toBeNull();
    });
  });
});
