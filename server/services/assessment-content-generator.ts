/**
 * Assessment Content Generator (Server-Side)
 *
 * Generates assessment content (passages, questions, writing prompts) for
 * each phase of an assessment using the LLM at world creation time.
 * Falls back to hardcoded encounter content if LLM generation fails.
 *
 * The generated content is stored in quest customData.assessment as
 * AssessmentQuestData so the game client can render assessments without
 * additional API calls.
 */

import { getGenAI, GEMINI_MODELS, isGeminiConfigured } from '../config/gemini.js';
import type {
  AssessmentDefinition,
  AssessmentQuestData,
  ContentTemplate,
  PhaseType,
  AssessmentQuestion,
} from '../../shared/assessment/assessment-types.js';
import { resolveAssessment } from '../../shared/assessment/arrival-encounter.js';
import {
  buildAssessmentQuestData,
  type GeneratedPhaseContent,
} from '../../shared/assessment/assessment-content-builder.js';

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate all assessment content for an encounter definition at world creation time.
 *
 * For reading/listening phases: generates a passage and comprehension questions.
 * For writing phases: generates writing prompts.
 * For conversation/initiate_conversation phases: no content generation needed.
 *
 * If LLM generation fails for any phase, falls back to empty content
 * (the game client will use the encounter definition as fallback).
 *
 * @returns AssessmentQuestData with pre-generated content, ready for customData.assessment
 */
export async function generateAssessmentQuestContent(
  encounter: AssessmentDefinition,
  targetLanguage: string,
  cityName: string,
): Promise<AssessmentQuestData> {
  // Resolve template variables ({{targetLanguage}}, {{cityName}})
  const resolved = resolveAssessment(encounter, { targetLanguage, cityName });

  const generatedContent: GeneratedPhaseContent[] = [];

  // Generate content for each phase that needs it
  for (const phase of resolved.phases) {
    const phaseType = phase.type as PhaseType;

    // Skip phases that don't need LLM content generation
    if (phaseType === 'conversation' || phaseType === 'initiate_conversation') {
      continue;
    }

    // Find the task that has a contentTemplate
    const task = phase.tasks.find(t => t.contentTemplate);
    if (!task || !task.contentTemplate) continue;

    const content = await generatePhaseContent(
      phase.id,
      phaseType,
      targetLanguage,
      cityName,
      task.contentTemplate,
    );

    if (content) {
      generatedContent.push(content);
    }
  }

  return buildAssessmentQuestData(resolved, generatedContent);
}

// ── LLM Content Generation ─────────────────────────────────────────────────

async function generatePhaseContent(
  phaseId: string,
  phaseType: PhaseType,
  targetLanguage: string,
  cityName: string,
  template: ContentTemplate,
): Promise<GeneratedPhaseContent | null> {
  if (!isGeminiConfigured()) {
    console.warn(`[AssessmentContentGen] Gemini not configured, skipping content generation for phase ${phaseId}`);
    return null;
  }

  try {
    const prompt = buildContentGenerationPrompt(phaseType, targetLanguage, cityName, template);
    if (!prompt) return null;

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: GEMINI_MODELS.FLASH,
      contents: prompt,
    });

    const text = response.text ?? '';
    const parsed = parseGeneratedContent(phaseType, text);

    if (!parsed) {
      console.warn(`[AssessmentContentGen] Failed to parse content for phase ${phaseId}, will use fallback`);
      return null;
    }

    console.log(`[AssessmentContentGen] Generated content for phase ${phaseId} (${phaseType})`);

    return {
      phaseId,
      passage: parsed.passage,
      questions: parsed.questions,
      writingPrompts: parsed.writingPrompts,
    };
  } catch (error) {
    console.warn(`[AssessmentContentGen] LLM generation failed for phase ${phaseId}:`, error);
    return null;
  }
}

// ── Prompt Building ─────────────────────────────────────────────────────────
// Extracted from server/routes/assessment-scoring.ts for reuse

function buildContentGenerationPrompt(
  phaseType: PhaseType,
  targetLanguage: string,
  cityName: string,
  template: ContentTemplate,
): string {
  const topic = template.topic
    .replace(/\{\{cityName\}\}/g, cityName)
    .replace(/\{\{targetLanguage\}\}/g, targetLanguage);

  if (phaseType === 'reading' || phaseType === 'listening') {
    return [
      `Generate a ${phaseType === 'listening' ? 'spoken' : 'written'} passage in ${targetLanguage} for a language assessment.`,
      '',
      `Topic: ${topic}`,
      `Difficulty: ${template.difficulty}`,
      `Length: approximately ${template.lengthSentences ?? 5} sentences`,
      `Number of comprehension questions: ${template.questionCount ?? 3}`,
      '',
      'The passage should be entirely in the target language.',
      'The comprehension questions should be in English (the test-taker answers in English or the target language).',
      'Each question should test a different aspect of understanding (main idea, specific detail, inference).',
      '',
      'Respond with EXACTLY this format:',
      '**PASSAGE**',
      '<the passage text in the target language>',
      '**END_PASSAGE**',
      '**QUESTIONS**',
      'Q1: <question text>',
      'Q2: <question text>',
      `Q${template.questionCount ?? 3}: <question text>`,
      '**END_QUESTIONS**',
    ].join('\n');
  }

  if (phaseType === 'writing') {
    return [
      `Generate ${template.promptCount ?? 2} writing prompts for a ${targetLanguage} language assessment.`,
      '',
      `Topic: ${topic}`,
      `Difficulty: ${template.difficulty}`,
      '',
      'Each prompt should ask the student to write a short response (2-5 sentences) in the target language.',
      'Prompts should be in English so the student understands what to write about.',
      '',
      'Respond with EXACTLY this format:',
      '**PROMPTS**',
      'P1: <prompt text>',
      `P${template.promptCount ?? 2}: <prompt text>`,
      '**END_PROMPTS**',
    ].join('\n');
  }

  return '';
}

// ── Content Parsing ─────────────────────────────────────────────────────────
// Extracted from server/routes/assessment-scoring.ts for reuse

interface ParsedContent {
  passage?: string;
  questions?: AssessmentQuestion[];
  writingPrompts?: string[];
}

function parseGeneratedContent(phaseType: PhaseType, response: string): ParsedContent | null {
  if (phaseType === 'reading' || phaseType === 'listening') {
    const passageMatch = response.match(/\*\*PASSAGE\*\*([\s\S]*?)\*\*END_PASSAGE\*\*/);
    const questionsMatch = response.match(/\*\*QUESTIONS\*\*([\s\S]*?)\*\*END_QUESTIONS\*\*/);

    if (!passageMatch) return null;

    const passage = passageMatch[1].trim();
    const questions: AssessmentQuestion[] = [];

    if (questionsMatch) {
      const qBlock = questionsMatch[1].trim();
      const qLines = qBlock.split('\n').filter(l => l.match(/^Q\d+:/));
      const pointsPerQuestion = phaseType === 'reading' ? 5 : Math.floor(13 / Math.max(qLines.length, 1));

      for (let i = 0; i < qLines.length; i++) {
        const qText = qLines[i].replace(/^Q\d+:\s*/, '').trim();
        questions.push({
          id: `q${i + 1}`,
          questionText: qText,
          maxPoints: i === qLines.length - 1 && phaseType === 'listening'
            ? 13 - pointsPerQuestion * (qLines.length - 1)
            : pointsPerQuestion,
        });
      }
    }

    return { passage, questions };
  }

  if (phaseType === 'writing') {
    const promptsMatch = response.match(/\*\*PROMPTS\*\*([\s\S]*?)\*\*END_PROMPTS\*\*/);
    if (!promptsMatch) return null;

    const pBlock = promptsMatch[1].trim();
    const pLines = pBlock.split('\n').filter(l => l.match(/^P\d+:/));
    const writingPrompts = pLines.map(l => l.replace(/^P\d+:\s*/, '').trim());

    return { writingPrompts };
  }

  return null;
}
