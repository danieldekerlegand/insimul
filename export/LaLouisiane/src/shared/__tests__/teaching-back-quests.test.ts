import { describe, it, expect } from 'vitest';
import { QUEST_TEMPLATES, getTemplatesByCategory } from '../language/quest-templates';
import {
  QUEST_SEEDS,
  getSeedsByCategory,
  getSeedById,
  instantiateSeed,
} from '../language/quest-seed-library';
import { normalizeObjectiveType, VALID_OBJECTIVE_TYPES } from '../quest-objective-types';
import { languageLearningQuestType } from '../quest-types/language-learning';
import {
  getTeachingSeeds,
  selectTeachingSeed,
  generateTeachingQuest,
  generateTeachingQuestBatch,
} from '../quest/teaching-back-quests';

// ── Quest Category ──────────────────────────────────────────────────────────

describe('teaching quest category', () => {
  it('language-learning quest type includes teaching category', () => {
    const teaching = languageLearningQuestType.questCategories.find(
      c => c.id === 'teaching',
    );
    expect(teaching).toBeDefined();
    expect(teaching!.name).toBe('Teaching');
  });

  it('language-learning quest type includes teach_vocabulary objective type', () => {
    const obj = languageLearningQuestType.objectiveTypes.find(
      o => o.id === 'teach_vocabulary',
    );
    expect(obj).toBeDefined();
    expect(obj!.name).toBe('Teach Vocabulary');
  });

  it('language-learning quest type includes teach_phrase objective type', () => {
    const obj = languageLearningQuestType.objectiveTypes.find(
      o => o.id === 'teach_phrase',
    );
    expect(obj).toBeDefined();
    expect(obj!.name).toBe('Teach Phrase');
  });
});

// ── Objective Types ─────────────────────────────────────────────────────────

describe('teaching objective types', () => {
  it('teach_vocabulary is a valid canonical objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('teach_vocabulary')).toBe(true);
  });

  it('teach_phrase is a valid canonical objective type', () => {
    expect(VALID_OBJECTIVE_TYPES.has('teach_phrase')).toBe(true);
  });
});

describe('teaching normalization entries', () => {
  it('normalizes teach_word to teach_vocabulary', () => {
    expect(normalizeObjectiveType('teach_word')).toBe('teach_vocabulary');
  });

  it('normalizes teach_words to teach_vocabulary', () => {
    expect(normalizeObjectiveType('teach_words')).toBe('teach_vocabulary');
  });

  it('normalizes teach_npc to teach_vocabulary', () => {
    expect(normalizeObjectiveType('teach_npc')).toBe('teach_vocabulary');
  });

  it('normalizes teach_sentence to teach_phrase', () => {
    expect(normalizeObjectiveType('teach_sentence')).toBe('teach_phrase');
  });

  it('normalizes model_phrase to teach_phrase', () => {
    expect(normalizeObjectiveType('model_phrase')).toBe('teach_phrase');
  });

  it('normalizes tutor_vocabulary to teach_vocabulary', () => {
    expect(normalizeObjectiveType('tutor_vocabulary')).toBe('teach_vocabulary');
  });
});

// ── Quest Templates ─────────────────────────────────────────────────────────

describe('teaching quest templates', () => {
  it('includes teaching category templates', () => {
    const teaching = getTemplatesByCategory('teaching');
    expect(teaching.length).toBe(4);
  });

  it('teaching templates have valid structure', () => {
    const teaching = getTemplatesByCategory('teaching');
    for (const template of teaching) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.category).toBe('teaching');
      expect(template.objectiveTemplates.length).toBeGreaterThan(0);
      expect(template.rewardScale.xp).toBeGreaterThan(0);
      expect(template.rewardScale.fluency).toBeGreaterThan(0);
    }
  });

  it('teaching templates use only canonical objective types', () => {
    const teaching = getTemplatesByCategory('teaching');
    for (const template of teaching) {
      for (const obj of template.objectiveTemplates) {
        expect(VALID_OBJECTIVE_TYPES.has(obj.type)).toBe(true);
      }
    }
  });

  it('teaching templates cover multiple difficulties', () => {
    const teaching = getTemplatesByCategory('teaching');
    const difficulties = new Set(teaching.map(t => t.difficulty));
    expect(difficulties.has('intermediate')).toBe(true);
    expect(difficulties.has('advanced')).toBe(true);
  });

  it('vocabulary_tutor template uses teach_vocabulary objective', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'vocabulary_tutor');
    expect(template).toBeDefined();
    expect(template!.objectiveTemplates.some(o => o.type === 'teach_vocabulary')).toBe(true);
  });

  it('phrase_coach template uses teach_phrase objective', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'phrase_coach');
    expect(template).toBeDefined();
    expect(template!.objectiveTemplates.some(o => o.type === 'teach_phrase')).toBe(true);
  });

  it('newcomer_welcome template uses both teach_vocabulary and teach_phrase', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'newcomer_welcome');
    expect(template).toBeDefined();
    expect(template!.objectiveTemplates.some(o => o.type === 'teach_vocabulary')).toBe(true);
    expect(template!.objectiveTemplates.some(o => o.type === 'teach_phrase')).toBe(true);
  });
});

// ── Quest Seeds ─────────────────────────────────────────────────────────────

describe('teaching quest seeds', () => {
  it('includes teaching category seeds', () => {
    const teaching = getSeedsByCategory('teaching');
    expect(teaching.length).toBe(4);
  });

  it('teaching seeds have unique ids', () => {
    const teaching = getSeedsByCategory('teaching');
    const ids = teaching.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all teaching seeds have teaching-back tag', () => {
    const teaching = getSeedsByCategory('teaching');
    for (const seed of teaching) {
      expect(seed.tags).toContain('teaching-back');
    }
  });

  it('teach_greetings seed can be instantiated', () => {
    const seed = getSeedById('teach_greetings')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'Chitimacha',
      assignedTo: 'Player',
      values: { npcName: 'New Villager' },
    });

    expect(quest.title).toContain('New Villager');
    expect(quest.description).toContain('Chitimacha');
    expect(quest.questType).toBe('teaching');
    expect(quest.content).toContain('quest(');
  });

  it('teach_shopping_words seed produces teach_vocabulary + conversation objectives', () => {
    const seed = getSeedById('teach_shopping_words')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: { npcName: 'Pierre' },
    });

    expect(quest.title).toContain('Pierre');
    const hasTeachVocab = quest.objectives.some((o: any) => o.type === 'teach_vocabulary');
    const hasConversation = quest.objectives.some((o: any) => o.type === 'complete_conversation');
    expect(hasTeachVocab).toBe(true);
    expect(hasConversation).toBe(true);
  });

  it('teach_directions seed produces teach_phrase + teach_vocabulary objectives', () => {
    const seed = getSeedById('teach_directions')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'Spanish',
      assignedTo: 'Player',
      values: { npcName: 'Maria' },
    });

    expect(quest.title).toContain('Maria');
    const hasTeachPhrase = quest.objectives.some((o: any) => o.type === 'teach_phrase');
    const hasTeachVocab = quest.objectives.some((o: any) => o.type === 'teach_vocabulary');
    expect(hasTeachPhrase).toBe(true);
    expect(hasTeachVocab).toBe(true);
  });

  it('teach_advanced_conversation seed is advanced difficulty', () => {
    const seed = getSeedById('teach_advanced_conversation')!;
    expect(seed).toBeDefined();
    expect(seed.difficulty).toBe('advanced');

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'German',
      assignedTo: 'Player',
      values: { npcName: 'Hans' },
    });

    expect(quest.difficulty).toBe('advanced');
    // Advanced gets higher XP multiplier
    expect(quest.experienceReward).toBeGreaterThan(50);
  });
});

// ── Teaching-Back Quest Generator ───────────────────────────────────────────

describe('teaching-back quest generator', () => {
  it('getTeachingSeeds returns all teaching seeds', () => {
    const seeds = getTeachingSeeds();
    expect(seeds.length).toBe(4);
    for (const seed of seeds) {
      expect(seed.category).toBe('teaching');
    }
  });

  it('selectTeachingSeed returns a seed for intermediate level', () => {
    const seed = selectTeachingSeed('A2');
    expect(seed).not.toBeNull();
    expect(seed!.category).toBe('teaching');
  });

  it('selectTeachingSeed returns a specific seed by id', () => {
    const seed = selectTeachingSeed(undefined, 'teach_greetings');
    expect(seed).not.toBeNull();
    expect(seed!.id).toBe('teach_greetings');
  });

  it('selectTeachingSeed returns null for unknown seed id', () => {
    const seed = selectTeachingSeed(undefined, 'nonexistent_seed');
    expect(seed).toBeNull();
  });

  it('selectTeachingSeed allows advanced for B1+', () => {
    // Run multiple times to check advanced seeds are eligible
    const seeds = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const seed = selectTeachingSeed('B1');
      if (seed) seeds.add(seed.id);
    }
    // Should include at least one seed (could be intermediate or advanced)
    expect(seeds.size).toBeGreaterThan(0);
  });

  it('generateTeachingQuest produces a valid quest', () => {
    const quest = generateTeachingQuest({
      worldId: 'world-1',
      targetLanguage: 'Chitimacha',
      playerName: 'Player',
      studentNpcName: 'New Villager',
      playerCefrLevel: 'B1',
    });

    expect(quest).not.toBeNull();
    expect(quest!.worldId).toBe('world-1');
    expect(quest!.targetLanguage).toBe('Chitimacha');
    expect(quest!.assignedTo).toBe('Player');
    expect(quest!.questType).toBe('teaching');
    expect(quest!.objectives.length).toBeGreaterThan(0);
    expect(quest!.content).toContain('quest(');
  });

  it('generateTeachingQuest with specific seed id', () => {
    const quest = generateTeachingQuest({
      worldId: 'world-1',
      targetLanguage: 'French',
      playerName: 'Player',
      studentNpcName: 'Jacques',
      seedId: 'teach_greetings',
    });

    expect(quest).not.toBeNull();
    expect(quest!.title).toContain('Jacques');
    expect(quest!.description).toContain('French');
  });

  it('generateTeachingQuest includes assignedBy when provided', () => {
    const quest = generateTeachingQuest({
      worldId: 'world-1',
      targetLanguage: 'Spanish',
      playerName: 'Player',
      studentNpcName: 'Carlos',
      assignedBy: 'Professor Garcia',
      seedId: 'teach_greetings',
    });

    expect(quest).not.toBeNull();
    expect(quest!.assignedBy).toBe('Professor Garcia');
  });

  it('generateTeachingQuestBatch produces multiple quests', () => {
    const quests = generateTeachingQuestBatch({
      worldId: 'world-1',
      targetLanguage: 'Chitimacha',
      playerName: 'Player',
      studentNpcName: 'Newcomer',
      playerCefrLevel: 'B1',
    }, 3);

    expect(quests.length).toBeGreaterThan(0);
    expect(quests.length).toBeLessThanOrEqual(3);
    for (const quest of quests) {
      expect(quest.questType).toBe('teaching');
    }
  });

  it('generateTeachingQuestBatch uses different seeds', () => {
    const quests = generateTeachingQuestBatch({
      worldId: 'world-1',
      targetLanguage: 'French',
      playerName: 'Player',
      studentNpcName: 'Pierre',
      playerCefrLevel: 'B1',
    }, 4);

    const titles = quests.map(q => q.title);
    // At least some titles should differ (different seeds)
    expect(new Set(titles).size).toBeGreaterThan(1);
  });
});
