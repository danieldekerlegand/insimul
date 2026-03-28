/**
 * Tests for QuestRewardIntegration
 */

import { describe, it, expect, vi } from 'vitest';
import {
  QuestRewardIntegration,
  type VocabularyReward,
  type KnowledgeReward,
} from '../game-engine/logic/QuestRewardIntegration';

describe('QuestRewardIntegration', () => {
  it('marks target vocabulary as practiced on quest completion', () => {
    const integration = new QuestRewardIntegration();
    const markPracticed = vi.fn();
    integration.setMarkVocabularyPracticed(markPracticed);

    integration.processQuestCompletion({
      questId: 'q1',
      questTitle: 'Learn Greetings',
      targetVocabulary: ['bonjour', 'merci', 'au revoir'],
    });

    expect(markPracticed).toHaveBeenCalledWith(['bonjour', 'merci', 'au revoir']);
  });

  it('adds text vocabulary to player word list on quest completion', () => {
    const integration = new QuestRewardIntegration();
    const addVocab = vi.fn();
    integration.setAddVocabulary(addVocab);

    const textVocab: VocabularyReward[] = [
      { word: 'maison', translation: 'house', category: 'place', status: 'encountered' },
      { word: 'jardin', translation: 'garden', category: 'place', status: 'encountered' },
    ];

    const summary = integration.processQuestCompletion({
      questId: 'q1',
      questTitle: 'Read the Letter',
      textVocabulary: textVocab,
    });

    expect(addVocab).toHaveBeenCalledWith(textVocab);
    expect(summary.vocabularyLearned).toHaveLength(2);
  });

  it('adds conversation vocabulary with encountered status', () => {
    const integration = new QuestRewardIntegration();
    const addVocab = vi.fn();
    integration.setAddVocabulary(addVocab);

    const convVocab: VocabularyReward[] = [
      { word: 'bibliothèque', translation: 'library', category: 'place', status: 'practiced' },
    ];

    const summary = integration.processQuestCompletion({
      questId: 'q1',
      questTitle: 'Talk to Librarian',
      conversationVocabulary: convVocab,
    });

    // Should be called with 'encountered' status override
    expect(addVocab).toHaveBeenCalled();
    const calledWith = addVocab.mock.calls[0][0];
    expect(calledWith[0].status).toBe('encountered');
    expect(summary.vocabularyLearned[0].status).toBe('encountered');
  });

  it('creates knowledge entries for discoveries', () => {
    const integration = new QuestRewardIntegration();
    const addKnowledge = vi.fn();
    integration.setAddKnowledge(addKnowledge);

    const discoveries: KnowledgeReward[] = [
      { key: 'npc-pierre', title: 'Pierre', description: 'A local baker', category: 'npc' },
      { key: 'loc-library', title: 'Library', description: 'The town library', category: 'location' },
    ];

    const summary = integration.processQuestCompletion({
      questId: 'q1',
      questTitle: 'Explore Town',
      discoveries,
    });

    expect(addKnowledge).toHaveBeenCalledWith(discoveries);
    expect(summary.knowledgeGained).toHaveLength(2);
  });

  it('unlocks skill branches for chapter milestones', () => {
    const integration = new QuestRewardIntegration();

    const summary1 = integration.processQuestCompletion({
      questId: 'ch1-final',
      questTitle: 'Chapter 1 Complete',
      chapterNumber: 1,
    });
    expect(summary1.skillsUnlocked).toHaveLength(1);
    expect(summary1.skillsUnlocked[0].skillBranch).toBe('conversation');

    const summary2 = integration.processQuestCompletion({
      questId: 'ch2-final',
      questTitle: 'Chapter 2 Complete',
      chapterNumber: 2,
    });
    expect(summary2.skillsUnlocked[0].skillBranch).toBe('reading');
  });

  it('calls onSummaryReady callback', () => {
    const integration = new QuestRewardIntegration();
    const onSummary = vi.fn();
    integration.setOnSummaryReady(onSummary);

    integration.processQuestCompletion({
      questId: 'q1',
      questTitle: 'Test Quest',
      xpEarned: 50,
    });

    expect(onSummary).toHaveBeenCalledOnce();
    expect(onSummary.mock.calls[0][0].xpEarned).toBe(50);
  });

  it('getSkillBranchForChapter returns correct branches', () => {
    expect(QuestRewardIntegration.getSkillBranchForChapter(1)).toBe('conversation');
    expect(QuestRewardIntegration.getSkillBranchForChapter(2)).toBe('reading');
    expect(QuestRewardIntegration.getSkillBranchForChapter(3)).toBe('writing');
    expect(QuestRewardIntegration.getSkillBranchForChapter(4)).toBe('cultural_knowledge');
    expect(QuestRewardIntegration.getSkillBranchForChapter(5)).toBe('advanced_grammar');
    expect(QuestRewardIntegration.getSkillBranchForChapter(99)).toBeUndefined();
  });

  it('summary includes all reward types', () => {
    const integration = new QuestRewardIntegration();
    integration.setMarkVocabularyPracticed(vi.fn());
    integration.setAddVocabulary(vi.fn());
    integration.setAddKnowledge(vi.fn());

    const summary = integration.processQuestCompletion({
      questId: 'q1',
      questTitle: 'Full Quest',
      questCategory: 'exploration',
      chapterNumber: 1,
      targetVocabulary: ['bonjour'],
      textVocabulary: [{ word: 'livre', translation: 'book', category: 'object', status: 'encountered' }],
      conversationVocabulary: [{ word: 'merci', translation: 'thank you', category: 'greeting', status: 'practiced' }],
      discoveries: [{ key: 'clue-1', title: 'A Clue', description: 'Found a clue', category: 'clue' }],
      xpEarned: 100,
    });

    expect(summary.xpEarned).toBe(100);
    expect(summary.vocabularyLearned.length).toBe(2);
    expect(summary.knowledgeGained.length).toBe(1);
    expect(summary.skillsUnlocked.length).toBeGreaterThanOrEqual(1);
  });
});
