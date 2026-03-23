import { describe, it, expect } from 'vitest';
import { generateAssessmentPrologContent } from '../prolog/assessment-prolog-generator';
import { ARRIVAL_ENCOUNTER } from '../assessment/arrival-encounter';
import { DEPARTURE_ENCOUNTER } from '../assessment/departure-encounter';

describe('generateAssessmentPrologContent', () => {
  describe('arrival assessment', () => {
    const content = generateAssessmentPrologContent({
      encounter: ARRIVAL_ENCOUNTER,
      difficulty: 'beginner',
      targetLanguage: 'French',
      tags: ['assessment', 'arrival', 'onboarding'],
      experienceReward: 50,
    });

    it('includes header comment with encounter name', () => {
      expect(content).toContain('% Arrival Encounter');
      expect(content).toContain('Pre-test baseline');
    });

    it('emits assessment_quest fact with correct fields', () => {
      expect(content).toContain('assessment_quest(arrival_encounter, arrival, beginner, 53).');
    });

    it('emits assessment_language fact', () => {
      expect(content).toContain("assessment_language(arrival_encounter, 'French').");
    });

    it('emits experience reward', () => {
      expect(content).toContain('quest_reward(arrival_encounter, experience, 50).');
    });

    it('emits tags', () => {
      expect(content).toContain('assessment_tag(arrival_encounter, assessment).');
      expect(content).toContain('assessment_tag(arrival_encounter, arrival).');
      expect(content).toContain('assessment_tag(arrival_encounter, onboarding).');
    });

    it('emits all assessment phases', () => {
      expect(content).toContain("assessment_phase(arrival_encounter, arrival_reading, reading, 'Reading Comprehension', 15).");
      expect(content).toContain("assessment_phase(arrival_encounter, arrival_writing, writing, 'Writing Assessment', 15).");
      expect(content).toContain("assessment_phase(arrival_encounter, arrival_listening, listening, 'Listening Comprehension', 13).");
      expect(content).toContain("assessment_phase(arrival_encounter, arrival_conversation, conversation, 'Conversation', 10).");
    });

    it('emits phase ordering', () => {
      expect(content).toContain('phase_order(arrival_encounter, arrival_reading, 0).');
      expect(content).toContain('phase_order(arrival_encounter, arrival_writing, 1).');
      expect(content).toContain('phase_order(arrival_encounter, arrival_listening, 2).');
    });

    it('emits tasks for each phase', () => {
      expect(content).toContain('assessment_task(arrival_encounter, arrival_reading, arrival_reading_comprehension, reading_comprehension, 15).');
      expect(content).toContain('assessment_task(arrival_encounter, arrival_conversation, arrival_conversation_quest, conversation_quest, 10).');
    });

    it('emits scoring dimensions', () => {
      expect(content).toContain("scoring_dimension(arrival_encounter, arrival_reading, comprehension, 'Comprehension', 5).");
      expect(content).toContain("scoring_dimension(arrival_encounter, arrival_reading, vocabulary_recognition, 'Vocabulary Recognition', 5).");
      expect(content).toContain("scoring_dimension(arrival_encounter, arrival_conversation, fluency, 'Fluency', 2).");
    });

    it('emits objectives for each phase', () => {
      expect(content).toContain('assessment_objective(arrival_encounter, 0, arrival_reading, complete_phase(arrival_reading)).');
      expect(content).toContain('assessment_objective(arrival_encounter, 3, arrival_initiate_conversation, complete_phase(arrival_initiate_conversation)).');
    });

    it('emits phase_complete rule', () => {
      expect(content).toContain('phase_complete(arrival_encounter, PhaseId) :-');
      expect(content).toContain('phase_score(arrival_encounter, PhaseId, _).');
    });

    it('emits assessment_complete rule', () => {
      expect(content).toContain('assessment_complete(arrival_encounter) :-');
      expect(content).toContain('\\+ (assessment_phase(arrival_encounter, PhaseId, _, _, _), \\+ phase_complete(arrival_encounter, PhaseId)).');
    });

    it('emits assessment_total_score rule', () => {
      expect(content).toContain('assessment_total_score(arrival_encounter, Total) :-');
      expect(content).toContain('findall(S, phase_score(arrival_encounter, _, S), Scores)');
    });

    it('does NOT emit departure_eligible rule', () => {
      expect(content).not.toContain('departure_eligible');
    });

    it('emits dynamic declarations', () => {
      expect(content).toContain(':- dynamic(assessment_quest/4).');
      expect(content).toContain(':- dynamic(assessment_phase/5).');
      expect(content).toContain(':- dynamic(scoring_dimension/5).');
    });
  });

  describe('departure assessment', () => {
    const content = generateAssessmentPrologContent({
      encounter: DEPARTURE_ENCOUNTER,
      difficulty: 'intermediate',
      targetLanguage: 'Spanish',
      tags: ['assessment', 'departure', 'non-skippable'],
      experienceReward: 500,
      departureThreshold: 10,
    });

    it('includes header comment with encounter name', () => {
      expect(content).toContain('% Departure Encounter');
      expect(content).toContain('Post-test final');
    });

    it('emits assessment_quest fact for departure', () => {
      expect(content).toContain('assessment_quest(departure_encounter, departure, intermediate, 53).');
    });

    it('emits departure-specific language', () => {
      expect(content).toContain("assessment_language(departure_encounter, 'Spanish').");
    });

    it('emits departure phases', () => {
      expect(content).toContain("assessment_phase(departure_encounter, departure_reading, reading, 'Reading Comprehension', 15).");
      expect(content).toContain("assessment_phase(departure_encounter, departure_conversation, conversation, 'Conversation', 10).");
    });

    it('emits departure_eligible rule with threshold', () => {
      expect(content).toContain('departure_eligible(Player) :-');
      expect(content).toContain('Count >= 10.');
    });

    it('emits departure tags', () => {
      expect(content).toContain('assessment_tag(departure_encounter, departure).');
      expect(content).toContain('assessment_tag(departure_encounter, non_skippable).');
    });

    it('emits higher experience reward', () => {
      expect(content).toContain('quest_reward(departure_encounter, experience, 500).');
    });
  });

  describe('edge cases', () => {
    it('works without optional fields', () => {
      const content = generateAssessmentPrologContent({
        encounter: ARRIVAL_ENCOUNTER,
        difficulty: 'beginner',
      });
      expect(content).toContain('assessment_quest(arrival_encounter, arrival, beginner, 53).');
      expect(content).not.toMatch(/assessment_language\(/);
      expect(content).not.toMatch(/quest_reward\(/);
      expect(content).not.toMatch(/assessment_tag\(arrival_encounter,/);
    });

    it('escapes single quotes in strings', () => {
      const content = generateAssessmentPrologContent({
        encounter: {
          ...ARRIVAL_ENCOUNTER,
          phases: [{
            ...ARRIVAL_ENCOUNTER.phases[0],
            name: "Reader's Comprehension",
          }],
        },
        difficulty: 'beginner',
      });
      expect(content).toContain("'Reader\\'s Comprehension'");
    });
  });
});

describe('integration: buildArrivalAssessmentQuest includes Prolog content', () => {
  it('populates content field with Prolog', async () => {
    const { buildArrivalAssessmentQuest } = await import('../services/assessment-quest-bridge-shared');
    const quest = buildArrivalAssessmentQuest({
      worldId: 'w1',
      playerId: 'p1',
      targetLanguage: 'French',
      cityName: 'Paris',
    });
    expect(quest.content).toBeDefined();
    expect(quest.content).toContain('assessment_quest(arrival_encounter');
    expect(quest.content).toContain('assessment_phase(arrival_encounter');
    expect(quest.content).toContain("assessment_language(arrival_encounter, 'French')");
  });
});
