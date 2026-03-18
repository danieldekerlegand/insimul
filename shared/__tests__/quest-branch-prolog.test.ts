import { describe, it, expect } from 'vitest';
import { convertQuestToProlog } from '../prolog/quest-converter';

describe('Quest Branching Prolog Conversion', () => {
  it('generates branch_choice predicates for stages with branchChoices', () => {
    const quest = {
      title: 'The Merchant Quest',
      questType: 'conversation',
      difficulty: 'intermediate',
      stages: [
        {
          stageId: 'intro',
          title: 'Introduction',
          description: 'Meet the merchant',
          objectives: [{ type: 'talk', target: 'Merchant' }],
          nextStageIds: ['help_path', 'investigate_path'],
          branchChoices: [
            {
              choiceId: 'help_merchant',
              label: 'Help carry the goods',
              targetStageId: 'help_path',
              consequence: 'The merchant is grateful',
            },
            {
              choiceId: 'investigate',
              label: 'Investigate the theft',
              targetStageId: 'investigate_path',
            },
          ],
        },
        {
          stageId: 'help_path',
          title: 'Helping Hand',
          description: 'Carry goods to the market',
          objectives: [{ type: 'deliver', item: 'goods', to: 'Market' }],
          nextStageIds: ['finale'],
        },
        {
          stageId: 'investigate_path',
          title: 'Investigation',
          description: 'Find out who stole the goods',
          objectives: [{ type: 'talk', target: 'Guard' }],
          nextStageIds: ['finale'],
        },
        {
          stageId: 'finale',
          title: 'Resolution',
          description: 'Return to the merchant',
          objectives: [{ type: 'talk', target: 'Merchant' }],
        },
      ],
    };

    const result = convertQuestToProlog(quest);

    // Should contain branch_choice predicates
    expect(result.prologContent).toContain('branch_choice(the_merchant_quest, intro, help_merchant, help_path,');
    expect(result.prologContent).toContain('branch_choice(the_merchant_quest, intro, investigate, investigate_path,');

    // Should include branch_choice/5 in predicates
    expect(result.predicates).toContain('branch_choice/5');

    // Should still have quest_stage predicates
    expect(result.prologContent).toContain('quest_stage(the_merchant_quest, intro, [help_path, investigate_path])');
    expect(result.prologContent).toContain('quest_stage(the_merchant_quest, help_path, [finale])');

    expect(result.errors).toHaveLength(0);
  });

  it('does not generate branch_choice when stages have no branchChoices', () => {
    const quest = {
      title: 'Simple Quest',
      questType: 'vocabulary',
      difficulty: 'beginner',
      stages: [
        {
          stageId: 'step_1',
          title: 'Step 1',
          description: 'Do something',
          objectives: [],
          nextStageIds: ['step_2'],
        },
        {
          stageId: 'step_2',
          title: 'Step 2',
          description: 'Do something else',
          objectives: [],
        },
      ],
    };

    const result = convertQuestToProlog(quest);
    expect(result.prologContent).not.toContain('branch_choice');
  });
});
