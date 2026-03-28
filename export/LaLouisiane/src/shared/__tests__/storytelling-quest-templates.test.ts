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

describe('storytelling quest category', () => {
  it('language-learning quest type includes storytelling category', () => {
    const storytelling = languageLearningQuestType.questCategories.find(
      c => c.id === 'storytelling',
    );
    expect(storytelling).toBeDefined();
    expect(storytelling!.name).toBe('Storytelling');
  });
});

describe('storytelling quest templates', () => {
  it('includes storytelling category templates', () => {
    const storytelling = getTemplatesByCategory('storytelling');
    expect(storytelling.length).toBe(4);
  });

  it('storytelling templates have valid structure', () => {
    const storytelling = getTemplatesByCategory('storytelling');
    for (const template of storytelling) {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.category).toBe('storytelling');
      expect(template.objectiveTemplates.length).toBeGreaterThan(0);
      expect(template.rewardScale.xp).toBeGreaterThan(0);
      expect(template.rewardScale.fluency).toBeGreaterThan(0);
    }
  });

  it('storytelling templates use only canonical objective types', () => {
    const storytelling = getTemplatesByCategory('storytelling');
    for (const template of storytelling) {
      for (const obj of template.objectiveTemplates) {
        expect(VALID_OBJECTIVE_TYPES.has(obj.type)).toBe(true);
      }
    }
  });

  it('storytelling templates cover multiple difficulties', () => {
    const storytelling = getTemplatesByCategory('storytelling');
    const difficulties = new Set(storytelling.map(t => t.difficulty));
    expect(difficulties.has('intermediate')).toBe(true);
    expect(difficulties.has('advanced')).toBe(true);
  });

  it('story_circle template uses conversation and vocabulary objectives', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'story_circle');
    expect(template).toBeDefined();
    expect(template!.difficulty).toBe('intermediate');
    expect(template!.objectiveTemplates.some(o => o.type === 'complete_conversation')).toBe(true);
    expect(template!.objectiveTemplates.some(o => o.type === 'use_vocabulary')).toBe(true);
  });

  it('local_legend template uses listening + conversation + vocabulary objectives', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'local_legend');
    expect(template).toBeDefined();
    expect(template!.difficulty).toBe('advanced');
    expect(template!.objectiveTemplates.some(o => o.type === 'listening_comprehension')).toBe(true);
    expect(template!.objectiveTemplates.some(o => o.type === 'complete_conversation')).toBe(true);
    expect(template!.objectiveTemplates.some(o => o.type === 'use_vocabulary')).toBe(true);
  });

  it('my_adventure template emphasizes past tense vocabulary', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'my_adventure');
    expect(template).toBeDefined();
    const vocabObj = template!.objectiveTemplates.find(o => o.type === 'use_vocabulary');
    expect(vocabObj).toBeDefined();
    expect(vocabObj!.descriptionTemplate).toContain('past tense');
  });

  it('picture_this template includes visit_location objective', () => {
    const template = QUEST_TEMPLATES.find(t => t.id === 'picture_this');
    expect(template).toBeDefined();
    expect(template!.objectiveTemplates.some(o => o.type === 'visit_location')).toBe(true);
    expect(template!.objectiveTemplates.some(o => o.type === 'use_vocabulary')).toBe(true);
  });
});

describe('storytelling quest seeds', () => {
  it('includes storytelling category seeds', () => {
    const storytelling = getSeedsByCategory('storytelling');
    expect(storytelling.length).toBe(4);
  });

  it('storytelling seeds have unique ids', () => {
    const storytelling = getSeedsByCategory('storytelling');
    const ids = storytelling.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all storytelling seeds have storytelling tag', () => {
    const storytelling = getSeedsByCategory('storytelling');
    for (const seed of storytelling) {
      expect(seed.tags).toContain('storytelling');
    }
  });

  it('all storytelling seeds have narrative tag', () => {
    const storytelling = getSeedsByCategory('storytelling');
    for (const seed of storytelling) {
      expect(seed.tags).toContain('narrative');
    }
  });

  it('story_circle seed can be instantiated', () => {
    const seed = getSeedById('story_circle')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'Chitimacha',
      assignedTo: 'Player',
      values: { npcCount: 3 },
    });

    expect(quest.title).toBe('The Story Circle');
    expect(quest.description).toContain('Chitimacha');
    expect(quest.description).toContain('3 NPCs');
    expect(quest.questType).toBe('storytelling');
    expect(quest.content).toContain('quest(');
  });

  it('local_legend seed produces listening + conversation objectives', () => {
    const seed = getSeedById('local_legend')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: { storytellerName: 'Elder Marie', listenerName: 'Jacques' },
    });

    expect(quest.title).toContain('Elder Marie');
    const hasListening = quest.objectives.some((o: any) => o.type === 'listening_comprehension');
    const hasConversation = quest.objectives.some((o: any) => o.type === 'complete_conversation');
    expect(hasListening).toBe(true);
    expect(hasConversation).toBe(true);
  });

  it('my_adventure seed produces conversation objectives', () => {
    const seed = getSeedById('my_adventure')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'Spanish',
      assignedTo: 'Player',
      values: { npcName: 'Scribe Pedro' },
    });

    expect(quest.title).toContain('Scribe Pedro');
    expect(quest.questType).toBe('storytelling');
    const hasConversation = quest.objectives.some((o: any) => o.type === 'complete_conversation');
    expect(hasConversation).toBe(true);
  });

  it('picture_this seed produces visit + conversation + vocabulary objectives', () => {
    const seed = getSeedById('picture_this')!;
    expect(seed).toBeDefined();

    const quest = instantiateSeed(seed, {
      worldId: 'world-1',
      targetLanguage: 'French',
      assignedTo: 'Player',
      values: { location: 'the old bridge', npcName: 'Blind Henri' },
    });

    expect(quest.title).toContain('the old bridge');
    const hasVisit = quest.objectives.some((o: any) => o.type === 'visit_location');
    const hasConversation = quest.objectives.some((o: any) => o.type === 'complete_conversation');
    const hasVocab = quest.objectives.some((o: any) => o.type === 'use_vocabulary');
    expect(hasVisit).toBe(true);
    expect(hasConversation).toBe(true);
    expect(hasVocab).toBe(true);
  });
});

describe('storytelling normalization entries', () => {
  it('normalizes tell_story to complete_conversation', () => {
    expect(normalizeObjectiveType('tell_story')).toBe('complete_conversation');
  });

  it('normalizes retell_story to complete_conversation', () => {
    expect(normalizeObjectiveType('retell_story')).toBe('complete_conversation');
  });

  it('normalizes narrate to complete_conversation', () => {
    expect(normalizeObjectiveType('narrate')).toBe('complete_conversation');
  });

  it('normalizes storytelling to complete_conversation', () => {
    expect(normalizeObjectiveType('storytelling')).toBe('complete_conversation');
  });

  it('normalizes collaborative_story to complete_conversation', () => {
    expect(normalizeObjectiveType('collaborative_story')).toBe('complete_conversation');
  });

  it('normalizes describe_scene to complete_conversation', () => {
    expect(normalizeObjectiveType('describe_scene')).toBe('complete_conversation');
  });

  it('normalizes retell to complete_conversation', () => {
    expect(normalizeObjectiveType('retell')).toBe('complete_conversation');
  });
});
