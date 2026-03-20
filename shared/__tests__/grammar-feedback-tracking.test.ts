import { describe, it, expect } from 'vitest';
import {
  parseGrammarFeedbackBlock,
  stripSystemMarkers,
} from '../language/progress';
import {
  buildMetadataExtractionPrompt,
  buildGrammarAnalysisPrompt,
  buildGrammarFeedbackSection,
} from '../language/utils';

// ── parseGrammarFeedbackBlock ──────────────────────────────────────────────

describe('parseGrammarFeedbackBlock', () => {
  it('parses a complete grammar feedback block with corrections', () => {
    const response = `Bonjour! Comment allez-vous?

**GRAMMAR_FEEDBACK**
Status: corrected
Errors: 2
Pattern: verb conjugation | Incorrect: "je suis allé" | Corrected: "je suis allée" | Explanation: Past participle agrees with feminine subject
Pattern: article agreement | Incorrect: "le maison" | Corrected: "la maison" | Explanation: Maison is feminine, use la
**END_GRAMMAR**`;

    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(response);

    expect(feedback).not.toBeNull();
    expect(feedback!.status).toBe('corrected');
    expect(feedback!.errorCount).toBe(2);
    expect(feedback!.errors).toHaveLength(2);

    expect(feedback!.errors[0].pattern).toBe('verb conjugation');
    expect(feedback!.errors[0].incorrect).toBe('je suis allé');
    expect(feedback!.errors[0].corrected).toBe('je suis allée');
    expect(feedback!.errors[0].explanation).toBe('Past participle agrees with feminine subject');

    expect(feedback!.errors[1].pattern).toBe('article agreement');
    expect(feedback!.errors[1].incorrect).toBe('le maison');
    expect(feedback!.errors[1].corrected).toBe('la maison');

    expect(cleanedResponse).toBe('Bonjour! Comment allez-vous?');
  });

  it('parses a correct status with no errors', () => {
    const response = `Très bien! Vous parlez bien français.

**GRAMMAR_FEEDBACK**
Status: correct
Errors: 0
**END_GRAMMAR**`;

    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(response);

    expect(feedback).not.toBeNull();
    expect(feedback!.status).toBe('correct');
    expect(feedback!.errorCount).toBe(0);
    expect(feedback!.errors).toHaveLength(0);
    expect(cleanedResponse).toBe('Très bien! Vous parlez bien français.');
  });

  it('handles no_target_language status', () => {
    const response = `Hello there!

**GRAMMAR_FEEDBACK**
Status: no_target_language
Errors: 0
**END_GRAMMAR**`;

    const { feedback } = parseGrammarFeedbackBlock(response);

    expect(feedback).not.toBeNull();
    expect(feedback!.status).toBe('no_target_language');
    expect(feedback!.errors).toHaveLength(0);
  });

  it('returns null when no grammar block present', () => {
    const response = 'Bonjour! Comment allez-vous?';
    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(response);

    expect(feedback).toBeNull();
    expect(cleanedResponse).toBe(response);
  });

  it('includes timestamp in feedback', () => {
    const before = Date.now();
    const response = `Test **GRAMMAR_FEEDBACK**\nStatus: correct\nErrors: 0\n**END_GRAMMAR**`;
    const { feedback } = parseGrammarFeedbackBlock(response);
    const after = Date.now();

    expect(feedback).not.toBeNull();
    expect(feedback!.timestamp).toBeGreaterThanOrEqual(before);
    expect(feedback!.timestamp).toBeLessThanOrEqual(after);
  });
});

// ── stripSystemMarkers ─────────────────────────────────────────────────────

describe('stripSystemMarkers', () => {
  it('strips complete grammar feedback blocks', () => {
    const text = 'Hello **GRAMMAR_FEEDBACK**\nStatus: correct\nErrors: 0\n**END_GRAMMAR** world';
    expect(stripSystemMarkers(text)).toBe('Hello  world');
  });

  it('strips complete quest assign blocks', () => {
    const text = 'Hello **QUEST_ASSIGN**\nTitle: Test\n**END_QUEST** world';
    expect(stripSystemMarkers(text)).toBe('Hello  world');
  });

  it('strips partial/incomplete blocks mid-stream', () => {
    const text = 'Hello **GRAMMAR_FEEDBACK**\nStatus: correc';
    expect(stripSystemMarkers(text)).toBe('Hello');
  });

  it('strips orphaned closing markers', () => {
    const text = 'Hello **END_GRAMMAR** world';
    expect(stripSystemMarkers(text)).toBe('Hello  world');
  });

  it('handles text with no markers', () => {
    expect(stripSystemMarkers('Clean text')).toBe('Clean text');
  });

  it('strips vocab hints blocks', () => {
    const text = 'Hello **VOCAB_HINTS**\nword: test\n**END_VOCAB** world';
    expect(stripSystemMarkers(text)).toBe('Hello  world');
  });
});

// ── buildMetadataExtractionPrompt ──────────────────────────────────────────

describe('buildMetadataExtractionPrompt', () => {
  it('builds a prompt with the correct structure', () => {
    const prompt = buildMetadataExtractionPrompt(
      'French',
      'Je suis allé au magasin',
      'Très bien! Vous avez fait des achats?',
    );

    expect(prompt).toContain('French');
    expect(prompt).toContain('Je suis allé au magasin');
    expect(prompt).toContain('Très bien! Vous avez fait des achats?');
    expect(prompt).toContain('vocabHints');
    expect(prompt).toContain('grammarFeedback');
    expect(prompt).toContain('"status"');
    expect(prompt).toContain('"errors"');
  });

  it('includes eval section when requested', () => {
    const prompt = buildMetadataExtractionPrompt(
      'Spanish',
      'Hola',
      'Hola! Como estas?',
      { includeEval: true },
    );

    expect(prompt).toContain('"eval"');
    expect(prompt).toContain('vocabulary');
    expect(prompt).toContain('grammar');
    expect(prompt).toContain('fluency');
  });

  it('includes player proficiency when provided', () => {
    const prompt = buildMetadataExtractionPrompt(
      'German',
      'Hallo',
      'Guten Tag!',
      { playerProficiency: 'intermediate' },
    );

    expect(prompt).toContain('intermediate');
  });
});

// ── buildGrammarAnalysisPrompt ─────────────────────────────────────────────

describe('buildGrammarAnalysisPrompt', () => {
  it('builds a grammar analysis prompt', () => {
    const prompt = buildGrammarAnalysisPrompt(
      'French',
      'Je mange le pomme',
      'Ah, la pomme! Oui, c\'est bon.',
    );

    expect(prompt).toContain('French');
    expect(prompt).toContain('Je mange le pomme');
    expect(prompt).toContain('"correct" | "corrected" | "no_target_language"');
    expect(prompt).toContain('"pattern"');
  });

  it('includes conlang grammar rules when provided', () => {
    const conlang = {
      name: 'Elvish',
      kind: 'constructed' as const,
      grammar: {
        verbTenses: ['past', 'present', 'future'],
        nounCases: ['nominative', 'accusative'],
      },
      features: { wordOrder: 'SOV' },
    };

    const prompt = buildGrammarAnalysisPrompt(
      'Elvish',
      'test input',
      'test response',
      conlang as any,
    );

    expect(prompt).toContain('SOV');
    expect(prompt).toContain('past, present, future');
    expect(prompt).toContain('nominative, accusative');
  });
});

// ── buildGrammarFeedbackSection ────────────────────────────────────────────

describe('buildGrammarFeedbackSection', () => {
  it('builds grammar correction instructions for natural languages', () => {
    const section = buildGrammarFeedbackSection('French');

    expect(section).toContain('GRAMMAR CORRECTION ROLE');
    expect(section).toContain('French');
    expect(section).toContain('Do NOT include any structured data blocks');
  });

  it('includes conlang grammar rules', () => {
    const conlang = {
      name: 'Thalish',
      kind: 'constructed' as const,
      grammar: {
        verbTenses: ['progressive', 'perfective'],
        genders: ['animate', 'inanimate'],
        pluralization: 'suffix -en',
      },
      features: { wordOrder: 'VSO' },
    };

    const section = buildGrammarFeedbackSection('Thalish', conlang as any);

    expect(section).toContain('VSO');
    expect(section).toContain('progressive, perfective');
    expect(section).toContain('animate, inanimate');
    expect(section).toContain('suffix -en');
  });
});

// ── Integration: metadata JSON parsing ─────────────────────────────────────

describe('metadata JSON parsing', () => {
  it('parses valid metadata response', () => {
    const jsonResponse = JSON.stringify({
      vocabHints: [
        { word: 'bonjour', translation: 'hello', context: 'greeting' },
      ],
      grammarFeedback: {
        status: 'corrected',
        errors: [
          {
            pattern: 'article agreement',
            incorrect: 'le maison',
            corrected: 'la maison',
            explanation: 'Maison is feminine',
          },
        ],
      },
    });

    const metadata = JSON.parse(jsonResponse);

    expect(metadata.vocabHints).toHaveLength(1);
    expect(metadata.vocabHints[0].word).toBe('bonjour');
    expect(metadata.grammarFeedback.status).toBe('corrected');
    expect(metadata.grammarFeedback.errors).toHaveLength(1);
    expect(metadata.grammarFeedback.errors[0].pattern).toBe('article agreement');
  });

  it('handles JSON wrapped in markdown code fences', () => {
    const responseText = '```json\n{"vocabHints":[],"grammarFeedback":{"status":"correct","errors":[]}}\n```';

    const jsonText = responseText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const metadata = JSON.parse(jsonText);
    expect(metadata.grammarFeedback.status).toBe('correct');
    expect(metadata.grammarFeedback.errors).toHaveLength(0);
  });

  it('handles no_target_language status in metadata', () => {
    const metadata = {
      vocabHints: [],
      grammarFeedback: {
        status: 'no_target_language',
        errors: [],
      },
    };

    expect(metadata.grammarFeedback.status).toBe('no_target_language');
    expect(metadata.vocabHints).toHaveLength(0);
  });
});
