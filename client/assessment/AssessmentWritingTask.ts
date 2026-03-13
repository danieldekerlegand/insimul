/**
 * Assessment Writing Task Handler (US-5.06)
 *
 * Handles the writing phase of assessment encounters:
 *   Task 3A — Form Completion (/5 points, LLM scoring callback)
 *   Task 3B — Brief Message (/6 points, scored on taskCompletion + vocab + grammar)
 *
 * Combined maximum: /11 points.
 * Stores all player text verbatim.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FormField {
  id: string;
  label: string;
  /** Hint shown to the player */
  placeholder?: string;
}

export interface FormCompletionConfig {
  fields: FormField[];
  /** Max points for form completion (default: 5) */
  maxPoints?: number;
}

export interface BriefMessageConfig {
  /** The writing prompt shown to the player */
  prompt: string;
  /** Max points for the brief message (default: 6) */
  maxPoints?: number;
}

export interface WritingTaskConfig {
  /** Target language the player is writing in */
  targetLanguage: string;
  /** City name for template resolution */
  cityName: string;
  /** Form completion task config */
  formCompletion: FormCompletionConfig;
  /** Brief message task config */
  briefMessage: BriefMessageConfig;
}

export interface FormSubmission {
  /** Field id → player's verbatim text */
  fields: Record<string, string>;
  submittedAt: number;
}

export interface MessageSubmission {
  text: string;
  submittedAt: number;
}

export interface FormScoringResult {
  /** Points earned (0 to maxPoints) */
  score: number;
  maxPoints: number;
  /** Per-field feedback from LLM */
  fieldFeedback: Record<string, { score: number; rationale: string }>;
  /** Overall rationale */
  rationale: string;
}

export interface MessageScoringResult {
  score: number;
  maxPoints: number;
  /** Breakdown by dimension */
  dimensions: {
    taskCompletion: { score: number; maxScore: number; rationale: string };
    vocabulary: { score: number; maxScore: number; rationale: string };
    grammar: { score: number; maxScore: number; rationale: string };
  };
  rationale: string;
}

export interface WritingPhaseResult {
  formResult: FormScoringResult | null;
  messageResult: MessageScoringResult | null;
  totalScore: number;
  totalMaxPoints: number;
  /** Player's raw form submission */
  formSubmission: FormSubmission | null;
  /** Player's raw message submission */
  messageSubmission: MessageSubmission | null;
  startedAt: number;
  completedAt: number;
}

export type WritingTaskStatus = 'idle' | 'form_active' | 'form_scored' | 'message_active' | 'message_scored' | 'completed';

/**
 * Callback that sends player text to an LLM for evaluation.
 * Returns the raw LLM response text containing a WRITING_EVAL block.
 */
export type LLMScoringCallback = (prompt: string) => Promise<string>;

export interface WritingTaskCallbacks {
  onStatusChange?: (status: WritingTaskStatus) => void;
  onFormScored?: (result: FormScoringResult) => void;
  onMessageScored?: (result: MessageScoringResult) => void;
  onComplete?: (result: WritingPhaseResult) => void;
}

// ─── LLM Response Parsing ────────────────────────────────────────────────────

/**
 * Parse a FORM_EVAL block from LLM response.
 *
 * Expected format:
 * **FORM_EVAL**
 * field:<id>: <0-1> | <rationale>
 * ...
 * overall: <rationale>
 * **END_FORM_EVAL**
 */
export function parseFormEvalBlock(
  response: string,
  fieldIds: string[],
  maxPoints: number,
): FormScoringResult | null {
  const match = response.match(/\*\*FORM_EVAL\*\*([\s\S]*?)\*\*END_FORM_EVAL\*\*/);
  if (!match) return null;

  const block = match[1];
  const fieldFeedback: Record<string, { score: number; rationale: string }> = {};

  for (const fieldId of fieldIds) {
    const fieldMatch = block.match(new RegExp(`field:${fieldId}:\\s*([0-1])\\s*\\|\\s*(.+)`));
    if (fieldMatch) {
      fieldFeedback[fieldId] = {
        score: parseInt(fieldMatch[1]),
        rationale: fieldMatch[2].trim(),
      };
    } else {
      fieldFeedback[fieldId] = { score: 0, rationale: 'Not evaluated' };
    }
  }

  const overallMatch = block.match(/overall:\s*(.+)/);
  const rationale = overallMatch ? overallMatch[1].trim() : '';

  const rawScore = Object.values(fieldFeedback).reduce((sum, f) => sum + f.score, 0);
  const score = Math.min(maxPoints, rawScore);

  return { score, maxPoints, fieldFeedback, rationale };
}

/**
 * Parse a MESSAGE_EVAL block from LLM response.
 *
 * Expected format:
 * **MESSAGE_EVAL**
 * task_completion: <0-2> | <rationale>
 * vocabulary: <0-2> | <rationale>
 * grammar: <0-2> | <rationale>
 * overall: <rationale>
 * **END_MESSAGE_EVAL**
 */
export function parseMessageEvalBlock(
  response: string,
  maxPoints: number,
): MessageScoringResult | null {
  const match = response.match(/\*\*MESSAGE_EVAL\*\*([\s\S]*?)\*\*END_MESSAGE_EVAL\*\*/);
  if (!match) return null;

  const block = match[1];

  const parseDimension = (key: string, maxScore: number) => {
    const dimMatch = block.match(new RegExp(`${key}:\\s*(\\d)\\s*\\|\\s*(.+)`));
    if (!dimMatch) return { score: 0, maxScore, rationale: 'Not evaluated' };
    return {
      score: Math.min(maxScore, parseInt(dimMatch[1])),
      maxScore,
      rationale: dimMatch[2].trim(),
    };
  };

  const dimensions = {
    taskCompletion: parseDimension('task_completion', 2),
    vocabulary: parseDimension('vocabulary', 2),
    grammar: parseDimension('grammar', 2),
  };

  const overallMatch = block.match(/overall:\s*(.+)/);
  const rationale = overallMatch ? overallMatch[1].trim() : '';
  const score = Math.min(
    maxPoints,
    dimensions.taskCompletion.score + dimensions.vocabulary.score + dimensions.grammar.score,
  );

  return { score, maxPoints, dimensions, rationale };
}

// ─── LLM Prompt Builders ────────────────────────────────────────────────────

export function buildFormScoringPrompt(
  submission: FormSubmission,
  fields: FormField[],
  targetLanguage: string,
): string {
  const fieldLines = fields.map(f => {
    const value = submission.fields[f.id] ?? '';
    return `- ${f.label} (${f.id}): "${value}"`;
  }).join('\n');

  return [
    `Evaluate this form completed in ${targetLanguage}.`,
    `The student filled out a visitor registration form. Score each field 0 or 1:`,
    `0 = empty, incomprehensible, or wrong language`,
    `1 = recognizable attempt in ${targetLanguage} that addresses the field`,
    '',
    'Fields submitted:',
    fieldLines,
    '',
    'Respond with EXACTLY this format:',
    '**FORM_EVAL**',
    ...fields.map(f => `field:${f.id}: <0-1> | <brief rationale>`),
    'overall: <brief overall rationale>',
    '**END_FORM_EVAL**',
  ].join('\n');
}

export function buildMessageScoringPrompt(
  submission: MessageSubmission,
  prompt: string,
  targetLanguage: string,
): string {
  return [
    `Evaluate this brief message written in ${targetLanguage}.`,
    `The student was asked: "${prompt}"`,
    '',
    `Student's response: "${submission.text}"`,
    '',
    'Score on three dimensions (0-2 each):',
    '- task_completion: Does the message address the prompt requirements? (0=not at all, 1=partially, 2=fully)',
    '- vocabulary: Is the word choice appropriate and varied? (0=none/wrong language, 1=basic but adequate, 2=good range)',
    '- grammar: Are sentence structures and verb forms correct? (0=incomprehensible, 1=errors but understandable, 2=mostly correct)',
    '',
    'Respond with EXACTLY this format:',
    '**MESSAGE_EVAL**',
    'task_completion: <0-2> | <brief rationale>',
    'vocabulary: <0-2> | <brief rationale>',
    'grammar: <0-2> | <brief rationale>',
    'overall: <brief overall rationale>',
    '**END_MESSAGE_EVAL**',
  ].join('\n');
}

// ─── Controller ──────────────────────────────────────────────────────────────

const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: 'name', label: 'Name', placeholder: 'Your name' },
  { id: 'origin', label: 'Origin', placeholder: 'Where you are from' },
  { id: 'reason', label: 'Reason for visit', placeholder: 'Why you are visiting' },
  { id: 'duration', label: 'Length of stay', placeholder: 'How long you will stay' },
  { id: 'additional', label: 'Additional information', placeholder: 'Anything else' },
];

export class AssessmentWritingTask {
  private _status: WritingTaskStatus = 'idle';
  private _formSubmission: FormSubmission | null = null;
  private _messageSubmission: MessageSubmission | null = null;
  private _formResult: FormScoringResult | null = null;
  private _messageResult: MessageScoringResult | null = null;
  private _startedAt = 0;

  private readonly _config: WritingTaskConfig;
  private readonly _callbacks: WritingTaskCallbacks;
  private readonly _llmScore: LLMScoringCallback;

  constructor(
    config: WritingTaskConfig,
    llmScore: LLMScoringCallback,
    callbacks: WritingTaskCallbacks = {},
  ) {
    this._config = {
      ...config,
      formCompletion: {
        fields: config.formCompletion.fields.length > 0
          ? config.formCompletion.fields
          : DEFAULT_FORM_FIELDS,
        maxPoints: config.formCompletion.maxPoints ?? 5,
      },
      briefMessage: {
        ...config.briefMessage,
        maxPoints: config.briefMessage.maxPoints ?? 6,
      },
    };
    this._llmScore = llmScore;
    this._callbacks = callbacks;
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  get status(): WritingTaskStatus { return this._status; }
  get formSubmission(): FormSubmission | null { return this._formSubmission; }
  get messageSubmission(): MessageSubmission | null { return this._messageSubmission; }
  get formResult(): FormScoringResult | null { return this._formResult; }
  get messageResult(): MessageScoringResult | null { return this._messageResult; }

  get formFields(): ReadonlyArray<FormField> {
    return this._config.formCompletion.fields;
  }

  get messagePrompt(): string {
    return this._config.briefMessage.prompt;
  }

  get totalMaxPoints(): number {
    return (this._config.formCompletion.maxPoints ?? 5) + (this._config.briefMessage.maxPoints ?? 6);
  }

  /** Start the writing phase — begins with form completion. */
  start(): void {
    if (this._status !== 'idle') {
      throw new Error(`Cannot start: status is ${this._status}`);
    }
    this._startedAt = Date.now();
    this._setStatus('form_active');
  }

  /** Submit the form and trigger LLM scoring. */
  async submitForm(fields: Record<string, string>): Promise<FormScoringResult> {
    if (this._status !== 'form_active') {
      throw new Error(`Cannot submit form: status is ${this._status}`);
    }

    this._formSubmission = { fields, submittedAt: Date.now() };

    const maxPoints = this._config.formCompletion.maxPoints ?? 5;
    const prompt = buildFormScoringPrompt(
      this._formSubmission,
      this._config.formCompletion.fields,
      this._config.targetLanguage,
    );

    const llmResponse = await this._llmScore(prompt);
    const fieldIds = this._config.formCompletion.fields.map(f => f.id);
    const parsed = parseFormEvalBlock(llmResponse, fieldIds, maxPoints);

    this._formResult = parsed ?? {
      score: 0,
      maxPoints,
      fieldFeedback: Object.fromEntries(fieldIds.map(id => [id, { score: 0, rationale: 'Scoring unavailable' }])),
      rationale: 'LLM scoring failed to return a valid evaluation block.',
    };

    this._setStatus('form_scored');
    this._callbacks.onFormScored?.(this._formResult);

    // Automatically transition to message task
    this._setStatus('message_active');

    return this._formResult;
  }

  /** Submit the brief message and trigger LLM scoring. */
  async submitMessage(text: string): Promise<MessageScoringResult> {
    if (this._status !== 'message_active') {
      throw new Error(`Cannot submit message: status is ${this._status}`);
    }

    this._messageSubmission = { text, submittedAt: Date.now() };

    const maxPoints = this._config.briefMessage.maxPoints ?? 6;
    const prompt = buildMessageScoringPrompt(
      this._messageSubmission,
      this._config.briefMessage.prompt,
      this._config.targetLanguage,
    );

    const llmResponse = await this._llmScore(prompt);
    const parsed = parseMessageEvalBlock(llmResponse, maxPoints);

    this._messageResult = parsed ?? {
      score: 0,
      maxPoints,
      dimensions: {
        taskCompletion: { score: 0, maxScore: 2, rationale: 'Scoring unavailable' },
        vocabulary: { score: 0, maxScore: 2, rationale: 'Scoring unavailable' },
        grammar: { score: 0, maxScore: 2, rationale: 'Scoring unavailable' },
      },
      rationale: 'LLM scoring failed to return a valid evaluation block.',
    };

    this._setStatus('message_scored');
    this._callbacks.onMessageScored?.(this._messageResult);

    // Finalize
    this._setStatus('completed');
    const result = this.getResult();
    this._callbacks.onComplete?.(result);

    return this._messageResult;
  }

  /** Get the final writing phase result. Only valid after completion. */
  getResult(): WritingPhaseResult {
    const formScore = this._formResult?.score ?? 0;
    const messageScore = this._messageResult?.score ?? 0;

    return {
      formResult: this._formResult,
      messageResult: this._messageResult,
      totalScore: formScore + messageScore,
      totalMaxPoints: this.totalMaxPoints,
      formSubmission: this._formSubmission,
      messageSubmission: this._messageSubmission,
      startedAt: this._startedAt,
      completedAt: this._status === 'completed' ? Date.now() : 0,
    };
  }

  // ─── Internal ──────────────────────────────────────────────────────────

  private _setStatus(status: WritingTaskStatus): void {
    this._status = status;
    this._callbacks.onStatusChange?.(status);
  }
}
