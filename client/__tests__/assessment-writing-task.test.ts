import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AssessmentWritingTask,
  parseFormEvalBlock,
  parseMessageEvalBlock,
  buildFormScoringPrompt,
  buildMessageScoringPrompt,
  type WritingTaskConfig,
  type WritingTaskCallbacks,
  type LLMScoringCallback,
  type FormField,
} from '../assessment/AssessmentWritingTask';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TEST_FIELDS: FormField[] = [
  { id: 'name', label: 'Name' },
  { id: 'origin', label: 'Origin' },
  { id: 'reason', label: 'Reason for visit' },
  { id: 'duration', label: 'Length of stay' },
  { id: 'additional', label: 'Additional information' },
];

function makeConfig(overrides: Partial<WritingTaskConfig> = {}): WritingTaskConfig {
  return {
    targetLanguage: 'es',
    cityName: 'Madrid',
    formCompletion: { fields: TEST_FIELDS, maxPoints: 5 },
    briefMessage: {
      prompt: 'Write a short message to a friend telling them you arrived in Madrid.',
      maxPoints: 6,
    },
    ...overrides,
  };
}

function formEvalBlock(scores: Record<string, number>): string {
  const lines = Object.entries(scores).map(
    ([id, score]) => `field:${id}: ${score} | ${score === 1 ? 'Good attempt' : 'Missing or wrong'}`,
  );
  return [
    '**FORM_EVAL**',
    ...lines,
    'overall: Good effort',
    '**END_FORM_EVAL**',
  ].join('\n');
}

function messageEvalBlock(tc: number, v: number, g: number): string {
  return [
    '**MESSAGE_EVAL**',
    `task_completion: ${tc} | ${tc === 2 ? 'Fully addressed' : 'Partial'}`,
    `vocabulary: ${v} | ${v === 2 ? 'Good range' : 'Basic'}`,
    `grammar: ${g} | ${g === 2 ? 'Mostly correct' : 'Some errors'}`,
    'overall: Reasonable attempt',
    '**END_MESSAGE_EVAL**',
  ].join('\n');
}

// ─── Tests: parseFormEvalBlock ───────────────────────────────────────────────

describe('parseFormEvalBlock', () => {
  const fieldIds = ['name', 'origin', 'reason', 'duration', 'additional'];

  it('parses a valid FORM_EVAL block', () => {
    const response = formEvalBlock({ name: 1, origin: 1, reason: 0, duration: 1, additional: 0 });
    const result = parseFormEvalBlock(response, fieldIds, 5);

    expect(result).not.toBeNull();
    expect(result!.score).toBe(3);
    expect(result!.maxPoints).toBe(5);
    expect(result!.fieldFeedback.name.score).toBe(1);
    expect(result!.fieldFeedback.reason.score).toBe(0);
    expect(result!.rationale).toBe('Good effort');
  });

  it('returns null when no FORM_EVAL block present', () => {
    const result = parseFormEvalBlock('Just some text', fieldIds, 5);
    expect(result).toBeNull();
  });

  it('handles all fields scoring 1', () => {
    const response = formEvalBlock({ name: 1, origin: 1, reason: 1, duration: 1, additional: 1 });
    const result = parseFormEvalBlock(response, fieldIds, 5);
    expect(result!.score).toBe(5);
  });

  it('handles all fields scoring 0', () => {
    const response = formEvalBlock({ name: 0, origin: 0, reason: 0, duration: 0, additional: 0 });
    const result = parseFormEvalBlock(response, fieldIds, 5);
    expect(result!.score).toBe(0);
  });

  it('defaults missing fields to score 0', () => {
    const response = '**FORM_EVAL**\nfield:name: 1 | Good\noverall: Partial\n**END_FORM_EVAL**';
    const result = parseFormEvalBlock(response, fieldIds, 5);
    expect(result!.score).toBe(1);
    expect(result!.fieldFeedback.origin.score).toBe(0);
    expect(result!.fieldFeedback.origin.rationale).toBe('Not evaluated');
  });

  it('caps score at maxPoints', () => {
    // If somehow all 5 fields score 1, but maxPoints is 3
    const response = formEvalBlock({ name: 1, origin: 1, reason: 1, duration: 1, additional: 1 });
    const result = parseFormEvalBlock(response, fieldIds, 3);
    expect(result!.score).toBe(3);
  });
});

// ─── Tests: parseMessageEvalBlock ────────────────────────────────────────────

describe('parseMessageEvalBlock', () => {
  it('parses a valid MESSAGE_EVAL block', () => {
    const response = messageEvalBlock(2, 1, 2);
    const result = parseMessageEvalBlock(response, 6);

    expect(result).not.toBeNull();
    expect(result!.score).toBe(5);
    expect(result!.maxPoints).toBe(6);
    expect(result!.dimensions.taskCompletion.score).toBe(2);
    expect(result!.dimensions.vocabulary.score).toBe(1);
    expect(result!.dimensions.grammar.score).toBe(2);
  });

  it('returns null when no MESSAGE_EVAL block present', () => {
    expect(parseMessageEvalBlock('No block here', 6)).toBeNull();
  });

  it('parses perfect scores', () => {
    const result = parseMessageEvalBlock(messageEvalBlock(2, 2, 2), 6);
    expect(result!.score).toBe(6);
  });

  it('parses zero scores', () => {
    const result = parseMessageEvalBlock(messageEvalBlock(0, 0, 0), 6);
    expect(result!.score).toBe(0);
  });

  it('clamps individual dimensions to maxScore', () => {
    const response = [
      '**MESSAGE_EVAL**',
      'task_completion: 9 | Over the max',
      'vocabulary: 5 | Over the max',
      'grammar: 2 | Fine',
      'overall: Clamped',
      '**END_MESSAGE_EVAL**',
    ].join('\n');
    const result = parseMessageEvalBlock(response, 6);
    expect(result!.dimensions.taskCompletion.score).toBe(2);
    expect(result!.dimensions.vocabulary.score).toBe(2);
    expect(result!.score).toBe(6);
  });
});

// ─── Tests: buildFormScoringPrompt ───────────────────────────────────────────

describe('buildFormScoringPrompt', () => {
  it('includes target language and all fields', () => {
    const submission = {
      fields: { name: 'Juan', origin: 'México', reason: 'vacaciones', duration: 'una semana', additional: '' },
      submittedAt: Date.now(),
    };
    const prompt = buildFormScoringPrompt(submission, TEST_FIELDS, 'es');
    expect(prompt).toContain('es');
    expect(prompt).toContain('Juan');
    expect(prompt).toContain('México');
    expect(prompt).toContain('FORM_EVAL');
    expect(prompt).toContain('field:name');
    expect(prompt).toContain('field:additional');
  });
});

// ─── Tests: buildMessageScoringPrompt ────────────────────────────────────────

describe('buildMessageScoringPrompt', () => {
  it('includes the student response and prompt', () => {
    const submission = { text: 'Hola amigo, llegué a Madrid!', submittedAt: Date.now() };
    const prompt = buildMessageScoringPrompt(submission, 'Tell your friend you arrived', 'es');
    expect(prompt).toContain('Hola amigo');
    expect(prompt).toContain('Tell your friend you arrived');
    expect(prompt).toContain('MESSAGE_EVAL');
    expect(prompt).toContain('task_completion');
    expect(prompt).toContain('vocabulary');
    expect(prompt).toContain('grammar');
  });
});

// ─── Tests: AssessmentWritingTask Controller ─────────────────────────────────

describe('AssessmentWritingTask', () => {
  let llmScore: LLMScoringCallback;

  beforeEach(() => {
    llmScore = vi.fn();
  });

  it('starts in idle status', () => {
    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    expect(task.status).toBe('idle');
  });

  it('transitions to form_active on start', () => {
    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    task.start();
    expect(task.status).toBe('form_active');
  });

  it('throws when starting twice', () => {
    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    task.start();
    expect(() => task.start()).toThrow('Cannot start');
  });

  it('throws when submitting form before starting', async () => {
    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    await expect(task.submitForm({ name: 'test' })).rejects.toThrow('Cannot submit form');
  });

  it('throws when submitting message before form', async () => {
    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    task.start();
    await expect(task.submitMessage('hello')).rejects.toThrow('Cannot submit message');
  });

  it('scores form submission via LLM callback', async () => {
    const mockResponse = formEvalBlock({ name: 1, origin: 1, reason: 1, duration: 0, additional: 1 });
    (llmScore as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    task.start();

    const result = await task.submitForm({
      name: 'Juan', origin: 'México', reason: 'turismo', duration: '', additional: 'nada',
    });

    expect(result.score).toBe(4);
    expect(result.maxPoints).toBe(5);
    expect(result.fieldFeedback.name.score).toBe(1);
    expect(result.fieldFeedback.duration.score).toBe(0);
    expect(task.status).toBe('message_active');
  });

  it('stores form submission verbatim', async () => {
    (llmScore as ReturnType<typeof vi.fn>).mockResolvedValue(formEvalBlock({ name: 1, origin: 0, reason: 0, duration: 0, additional: 0 }));

    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    task.start();
    await task.submitForm({ name: 'María', origin: 'España' });

    expect(task.formSubmission).not.toBeNull();
    expect(task.formSubmission!.fields.name).toBe('María');
    expect(task.formSubmission!.fields.origin).toBe('España');
  });

  it('scores message submission via LLM callback', async () => {
    (llmScore as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(formEvalBlock({ name: 1, origin: 1, reason: 1, duration: 1, additional: 1 }))
      .mockResolvedValueOnce(messageEvalBlock(2, 2, 1));

    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    task.start();
    await task.submitForm({ name: 'a', origin: 'b', reason: 'c', duration: 'd', additional: 'e' });
    const result = await task.submitMessage('Hola amigo, estoy en Madrid!');

    expect(result.score).toBe(5);
    expect(result.maxPoints).toBe(6);
    expect(result.dimensions.taskCompletion.score).toBe(2);
    expect(result.dimensions.grammar.score).toBe(1);
    expect(task.status).toBe('completed');
  });

  it('stores message submission verbatim', async () => {
    (llmScore as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(formEvalBlock({ name: 1, origin: 0, reason: 0, duration: 0, additional: 0 }))
      .mockResolvedValueOnce(messageEvalBlock(1, 1, 1));

    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    task.start();
    await task.submitForm({ name: 'test' });
    await task.submitMessage('Mi mensaje en español');

    expect(task.messageSubmission).not.toBeNull();
    expect(task.messageSubmission!.text).toBe('Mi mensaje en español');
  });

  it('computes total score from both tasks', async () => {
    (llmScore as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(formEvalBlock({ name: 1, origin: 1, reason: 0, duration: 1, additional: 0 }))
      .mockResolvedValueOnce(messageEvalBlock(2, 1, 2));

    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    task.start();
    await task.submitForm({ name: 'a', origin: 'b', reason: '', duration: 'c', additional: '' });
    await task.submitMessage('some message');

    const result = task.getResult();
    expect(result.totalScore).toBe(3 + 5); // form 3/5 + message 5/6
    expect(result.totalMaxPoints).toBe(11);
  });

  it('fires status change callbacks', async () => {
    const statusChanges: string[] = [];
    const callbacks: WritingTaskCallbacks = {
      onStatusChange: (s) => statusChanges.push(s),
    };
    (llmScore as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(formEvalBlock({ name: 1, origin: 0, reason: 0, duration: 0, additional: 0 }))
      .mockResolvedValueOnce(messageEvalBlock(1, 1, 1));

    const task = new AssessmentWritingTask(makeConfig(), llmScore, callbacks);
    task.start();
    await task.submitForm({ name: 'a' });
    await task.submitMessage('b');

    expect(statusChanges).toEqual([
      'form_active',
      'form_scored',
      'message_active',
      'message_scored',
      'completed',
    ]);
  });

  it('fires onFormScored and onMessageScored callbacks', async () => {
    const onFormScored = vi.fn();
    const onMessageScored = vi.fn();
    const onComplete = vi.fn();

    (llmScore as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(formEvalBlock({ name: 1, origin: 1, reason: 1, duration: 1, additional: 1 }))
      .mockResolvedValueOnce(messageEvalBlock(2, 2, 2));

    const task = new AssessmentWritingTask(makeConfig(), llmScore, {
      onFormScored,
      onMessageScored,
      onComplete,
    });

    task.start();
    await task.submitForm({ name: 'a', origin: 'b', reason: 'c', duration: 'd', additional: 'e' });
    await task.submitMessage('Perfect message');

    expect(onFormScored).toHaveBeenCalledTimes(1);
    expect(onFormScored.mock.calls[0][0].score).toBe(5);
    expect(onMessageScored).toHaveBeenCalledTimes(1);
    expect(onMessageScored.mock.calls[0][0].score).toBe(6);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0].totalScore).toBe(11);
  });

  it('handles LLM returning invalid response gracefully', async () => {
    (llmScore as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('Sorry, I cannot evaluate this.')
      .mockResolvedValueOnce('Invalid response');

    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    task.start();

    const formResult = await task.submitForm({ name: 'test' });
    expect(formResult.score).toBe(0);
    expect(formResult.rationale).toContain('failed');

    const msgResult = await task.submitMessage('test message');
    expect(msgResult.score).toBe(0);
    expect(msgResult.rationale).toContain('failed');
    expect(task.status).toBe('completed');
  });

  it('exposes formFields and messagePrompt', () => {
    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    expect(task.formFields).toHaveLength(5);
    expect(task.formFields[0].id).toBe('name');
    expect(task.messagePrompt).toContain('Madrid');
  });

  it('reports totalMaxPoints as 11', () => {
    const task = new AssessmentWritingTask(makeConfig(), llmScore);
    expect(task.totalMaxPoints).toBe(11);
  });

  it('uses default fields when empty array provided', () => {
    const config = makeConfig({ formCompletion: { fields: [], maxPoints: 5 } });
    const task = new AssessmentWritingTask(config, llmScore);
    expect(task.formFields).toHaveLength(5);
    expect(task.formFields[0].id).toBe('name');
  });
});
