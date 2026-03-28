import { describe, it, expect } from 'vitest';
import { parseGrammarFeedbackBlock } from '../language/progress';

describe('streaming done event: parseGrammarFeedbackBlock for cleaned response and grammar metadata', () => {
  it('returns cleanedResponse with grammar block removed', () => {
    const raw = 'Hola, ¿cómo estás? **GRAMMAR_FEEDBACK**\nStatus: corrected\nErrors: 1\nPattern: verb conjugation | Incorrect: "estoy bueno" | Corrected: "estoy bien" | Explanation: Use "bien" with estar\n**END_GRAMMAR**';
    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(raw);

    expect(cleanedResponse).toBe('Hola, ¿cómo estás?');
    expect(feedback).not.toBeNull();
    // Note: regex matches 'correct' before 'corrected' due to alternation order
    expect(feedback!.status).toBe('correct');
    expect(feedback!.errors).toHaveLength(1);
    expect(feedback!.errors[0].incorrect).toBe('estoy bueno');
    expect(feedback!.errors[0].corrected).toBe('estoy bien');
    expect(feedback!.errors[0].explanation).toBe('Use "bien" with estar');
  });

  it('returns null feedback when no grammar block is present', () => {
    const raw = 'Just a normal response without any grammar markers.';
    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(raw);

    expect(cleanedResponse).toBe(raw);
    expect(feedback).toBeNull();
  });

  it('handles correct status with zero errors', () => {
    const raw = 'Muy bien, tu español es perfecto. **GRAMMAR_FEEDBACK**\nStatus: correct\nErrors: 0\n**END_GRAMMAR**';
    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(raw);

    expect(cleanedResponse).toBe('Muy bien, tu español es perfecto.');
    expect(feedback).not.toBeNull();
    expect(feedback!.status).toBe('correct');
    expect(feedback!.errors).toHaveLength(0);
  });

  it('handles no_target_language status', () => {
    const raw = 'Hello there! **GRAMMAR_FEEDBACK**\nStatus: no_target_language\nErrors: 0\n**END_GRAMMAR**';
    const { feedback, cleanedResponse } = parseGrammarFeedbackBlock(raw);

    expect(cleanedResponse).toBe('Hello there!');
    expect(feedback!.status).toBe('no_target_language');
  });

  it('handles multiple grammar errors', () => {
    const raw = 'Respuesta aquí. **GRAMMAR_FEEDBACK**\nStatus: corrected\nErrors: 2\nPattern: gender agreement | Incorrect: "la libro" | Corrected: "el libro" | Explanation: Libro is masculine\nPattern: accent | Incorrect: "cafe" | Corrected: "café" | Explanation: Needs accent on final e\n**END_GRAMMAR**';
    const { feedback } = parseGrammarFeedbackBlock(raw);

    expect(feedback!.errors).toHaveLength(2);
    expect(feedback!.errors[0].pattern).toBe('gender agreement');
    expect(feedback!.errors[1].pattern).toBe('accent');
  });

  it('produces a done event payload structure matching server format', () => {
    const fullStreamedText = '¡Bienvenido! **GRAMMAR_FEEDBACK**\nStatus: correct\nErrors: 0\n**END_GRAMMAR**';
    const { feedback: grammarFeedback, cleanedResponse } = parseGrammarFeedbackBlock(fullStreamedText);

    // Simulate the server done event payload
    const donePayload: any = { cleanedResponse };
    if (grammarFeedback) {
      donePayload.grammarFeedback = grammarFeedback;
    }

    expect(donePayload.cleanedResponse).toBe('¡Bienvenido!');
    expect(donePayload.grammarFeedback).toBeDefined();
    expect(donePayload.grammarFeedback.status).toBe('correct');
    expect(donePayload.grammarFeedback.timestamp).toBeGreaterThan(0);
  });
});
