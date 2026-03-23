import { describe, it, expect, beforeEach } from 'vitest';
import {
  UtteranceQuestSystem,
  type UtteranceObjectiveDefinition,
} from '../../client/src/components/3DGame/UtteranceQuestSystem';
import { languageLearningQuestType } from '../quest-types/language-learning';
import { QUEST_TEMPLATES } from '../language/quest-templates';

// ── Helper to build a collect_vocabulary objective ─────────────────────────

function makeCollectVocabObjective(
  overrides: Partial<UtteranceObjectiveDefinition> = {},
): UtteranceObjectiveDefinition {
  return {
    id: 'obj-collect-1',
    questId: 'quest-vocab-1',
    type: 'collect_vocabulary',
    prompt: 'Collect 3 food words.',
    targetLanguage: 'es',
    acceptedUtterances: [],
    targetCategory: 'food',
    requiredCount: 3,
    difficulty: 'beginner',
    hints: [{ text: 'Look around the market', scorePenalty: 0.1 }],
    xpReward: 20,
    maxAttempts: 0,
    ...overrides,
  };
}

describe('Vocabulary Bank Quest Objectives Integration', () => {
  let system: UtteranceQuestSystem;

  beforeEach(() => {
    system = new UtteranceQuestSystem();
  });

  // ── collect_vocabulary evaluation ──────────────────────────────────────

  describe('collect_vocabulary objective type', () => {
    it('accepts words in the correct category', () => {
      const obj = makeCollectVocabObjective();
      system.registerObjective(obj);
      system.activateObjective(obj.id);

      const result = system.evaluateInput(obj.id, 'manzana:food');
      expect(result.passed).toBe(true);
      expect(result.feedback).toContain('manzana');
      expect(result.feedback).toContain('1/3');
    });

    it('rejects words in wrong category', () => {
      const obj = makeCollectVocabObjective();
      system.registerObjective(obj);
      system.activateObjective(obj.id);

      const result = system.evaluateInput(obj.id, 'rojo:colors');
      expect(result.passed).toBe(false);
      expect(result.feedback).toContain('not in the "food" category');
    });

    it('rejects duplicate words', () => {
      const obj = makeCollectVocabObjective();
      system.registerObjective(obj);
      system.activateObjective(obj.id);

      system.evaluateInput(obj.id, 'pan:food');
      const dup = system.evaluateInput(obj.id, 'pan:food');
      expect(dup.passed).toBe(false);
      expect(dup.feedback).toContain('already collected');
    });

    it('completes when requiredCount words collected', () => {
      const obj = makeCollectVocabObjective({ requiredCount: 2 });
      system.registerObjective(obj);
      system.activateObjective(obj.id);

      system.evaluateInput(obj.id, 'pan:food');
      const final = system.evaluateInput(obj.id, 'queso:food');
      expect(final.passed).toBe(true);

      const prog = system.getProgress(obj.id);
      expect(prog?.completed).toBe(true);
    });

    it('rejects invalid input format (no colon)', () => {
      const obj = makeCollectVocabObjective();
      system.registerObjective(obj);
      system.activateObjective(obj.id);

      const result = system.evaluateInput(obj.id, 'manzana');
      expect(result.passed).toBe(false);
      expect(result.feedback).toContain('Invalid format');
    });

    it('accepts any category when targetCategory is not set', () => {
      const obj = makeCollectVocabObjective({ targetCategory: undefined, requiredCount: 2 });
      system.registerObjective(obj);
      system.activateObjective(obj.id);

      const r1 = system.evaluateInput(obj.id, 'rojo:colors');
      expect(r1.passed).toBe(true);

      const r2 = system.evaluateInput(obj.id, 'pan:food');
      expect(r2.passed).toBe(true);
    });

    it('normalizes word casing', () => {
      const obj = makeCollectVocabObjective();
      system.registerObjective(obj);
      system.activateObjective(obj.id);

      system.evaluateInput(obj.id, 'Pan:food');
      // Same word, different case — should count as duplicate
      const dup = system.evaluateInput(obj.id, 'pan:food');
      expect(dup.passed).toBe(false);
      expect(dup.feedback).toContain('already collected');
    });
  });

  // ── Serialization round-trip ───────────────────────────────────────────

  describe('serialization', () => {
    it('preserves collectedWords across serialize/deserialize', () => {
      const obj = makeCollectVocabObjective({ requiredCount: 5 });
      system.registerObjective(obj);
      system.activateObjective(obj.id);
      system.evaluateInput(obj.id, 'pan:food');
      system.evaluateInput(obj.id, 'queso:food');

      const saved = system.serialize();
      const restored = new UtteranceQuestSystem();
      restored.deserialize(saved);

      const prog = restored.getProgress(obj.id);
      expect(prog).not.toBeNull();
      expect(prog!.collectedWords).toBeInstanceOf(Set);
      expect(prog!.collectedWords!.size).toBe(2);
      expect(prog!.collectedWords!.has('pan')).toBe(true);
      expect(prog!.collectedWords!.has('queso')).toBe(true);
    });
  });

  // ── Quest templates existence ──────────────────────────────────────────

  describe('quest templates', () => {
    it('language-learning quest type includes collect_vocabulary objective', () => {
      const objType = languageLearningQuestType.objectiveTypes.find(
        (o) => o.id === 'collect_vocabulary',
      );
      expect(objType).toBeDefined();
      expect(objType!.name).toBe('Collect Vocabulary');
    });

    it('collect_vocabulary completionCheck works correctly', () => {
      const objType = languageLearningQuestType.objectiveTypes.find(
        (o) => o.id === 'collect_vocabulary',
      );
      expect(objType!.completionCheck({ collectedWords: 5, required: 5 })).toBe(true);
      expect(objType!.completionCheck({ collectedWords: 3, required: 5 })).toBe(false);
      expect(objType!.completionCheck({ collectedWords: 0, required: 5 })).toBe(false);
    });

    it('QUEST_TEMPLATES includes word_explorer_nouns', () => {
      const tpl = QUEST_TEMPLATES.find((t) => t.id === 'word_explorer_nouns');
      expect(tpl).toBeDefined();
      expect(tpl!.category).toBe('vocabulary');
      expect(tpl!.objectiveTemplates[0].type).toBe('collect_vocabulary');
    });

    it('QUEST_TEMPLATES includes color_hunter', () => {
      const tpl = QUEST_TEMPLATES.find((t) => t.id === 'color_hunter');
      expect(tpl).toBeDefined();
      expect(tpl!.category).toBe('vocabulary');
      expect(tpl!.objectiveTemplates[0].type).toBe('collect_vocabulary');
    });

    it('QUEST_TEMPLATES includes action_spotter', () => {
      const tpl = QUEST_TEMPLATES.find((t) => t.id === 'action_spotter');
      expect(tpl).toBeDefined();
      expect(tpl!.category).toBe('vocabulary');
      expect(tpl!.objectiveTemplates[0].type).toBe('collect_vocabulary');
    });
  });

  // ── UTTERANCE_QUEST_TEMPLATES ──────────────────────────────────────────

  describe('utterance quest templates', () => {
    // Import dynamically to test the templates object
    it('word_explorer_nouns template has correct defaults', async () => {
      const { UTTERANCE_QUEST_TEMPLATES } = await import(
        '../../client/src/components/3DGame/UtteranceQuestSystem'
      );
      const tpl = UTTERANCE_QUEST_TEMPLATES.word_explorer_nouns;
      expect(tpl).toBeDefined();
      expect(tpl.type).toBe('collect_vocabulary');
      expect(tpl.targetCategory).toBe('food');
      expect(tpl.requiredCount).toBe(5);
      expect(tpl.difficulty).toBe('beginner');
    });

    it('color_hunter template targets colors category', async () => {
      const { UTTERANCE_QUEST_TEMPLATES } = await import(
        '../../client/src/components/3DGame/UtteranceQuestSystem'
      );
      const tpl = UTTERANCE_QUEST_TEMPLATES.color_hunter;
      expect(tpl).toBeDefined();
      expect(tpl.type).toBe('collect_vocabulary');
      expect(tpl.targetCategory).toBe('colors');
      expect(tpl.requiredCount).toBe(3);
    });

    it('action_spotter template targets actions category', async () => {
      const { UTTERANCE_QUEST_TEMPLATES } = await import(
        '../../client/src/components/3DGame/UtteranceQuestSystem'
      );
      const tpl = UTTERANCE_QUEST_TEMPLATES.action_spotter;
      expect(tpl).toBeDefined();
      expect(tpl.type).toBe('collect_vocabulary');
      expect(tpl.targetCategory).toBe('actions');
      expect(tpl.requiredCount).toBe(3);
    });
  });

  // ── End-to-end quest flow ──────────────────────────────────────────────

  describe('end-to-end collect vocabulary quest flow', () => {
    it('completes a full Color Hunter quest', () => {
      const obj = makeCollectVocabObjective({
        id: 'color-hunt-obj',
        questId: 'color-hunt-quest',
        prompt: 'Find 3 colorful objects.',
        targetCategory: 'colors',
        requiredCount: 3,
        xpReward: 15,
      });

      system.registerObjective(obj);
      system.activateObjective(obj.id);

      // Collect 3 color words
      const r1 = system.evaluateInput(obj.id, 'rojo:colors');
      expect(r1.passed).toBe(true);
      expect(r1.feedback).toContain('1/3');

      const r2 = system.evaluateInput(obj.id, 'azul:colors');
      expect(r2.passed).toBe(true);
      expect(r2.feedback).toContain('2/3');

      const r3 = system.evaluateInput(obj.id, 'verde:colors');
      expect(r3.passed).toBe(true);
      expect(r3.feedback).toContain('3/3');

      // Quest should be complete
      expect(system.isQuestComplete('color-hunt-quest')).toBe(true);
      const prog = system.getProgress(obj.id);
      expect(prog?.completed).toBe(true);
      expect(prog?.currentCount).toBe(3);
    });

    it('does not complete quest with wrong category words', () => {
      const obj = makeCollectVocabObjective({
        targetCategory: 'colors',
        requiredCount: 2,
      });

      system.registerObjective(obj);
      system.activateObjective(obj.id);

      // Wrong category
      system.evaluateInput(obj.id, 'pan:food');
      const prog = system.getProgress(obj.id);
      expect(prog?.completed).toBe(false);
      expect(prog?.currentCount).toBe(0);
    });
  });
});
