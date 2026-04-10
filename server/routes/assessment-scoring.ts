/**
 * Assessment Scoring & Content Generation Routes
 *
 * Two endpoints:
 * - POST /api/assessments/generate-content — LLM generates passages/questions/prompts
 * - POST /api/assessments/score-phase — LLM scores player answers
 */

import { Router, type Request, type Response } from 'express';
import { getGenAI, GEMINI_MODELS, isGeminiConfigured } from '../config/gemini';
import type { ContentTemplate, PhaseType } from '../../shared/assessment/assessment-types';
import { getTTSProvider, VOICE_PROFILES } from '../services/conversation/tts/tts-provider';
import '../services/conversation/tts/google-tts-provider'; // ensure provider is registered

export function createAssessmentScoringRoutes(): Router {
  const router = Router();

  // ─── Content Generation ────────────────────────────────────────────────────

  router.post('/assessments/generate-content', async (req: Request, res: Response) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ message: 'Gemini API not configured' });
      }

      const { phaseType, targetLanguage, cityName, contentTemplate } = req.body as {
        phaseType: PhaseType;
        targetLanguage: string;
        cityName: string;
        contentTemplate: ContentTemplate;
      };

      if (!phaseType || !targetLanguage || !contentTemplate) {
        return res.status(400).json({ message: 'Missing required fields: phaseType, targetLanguage, contentTemplate' });
      }

      const prompt = buildContentGenerationPrompt(phaseType, targetLanguage, cityName, contentTemplate);
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.FLASH,
        contents: prompt,
      });

      const text = response.text ?? '';
      const parsed = parseGeneratedContent(phaseType, text);

      if (!parsed) {
        console.error('[AssessmentScoring] Failed to parse generated content:', text.substring(0, 500));
        return res.status(500).json({ message: 'Failed to parse generated content from LLM' });
      }

      res.json(parsed);
    } catch (error) {
      console.error('Generate assessment content error:', error);
      res.status(500).json({ message: 'Failed to generate assessment content' });
    }
  });

  // ─── Phase Scoring ─────────────────────────────────────────────────────────

  router.post('/assessments/score-phase', async (req: Request, res: Response) => {
    try {
      if (!isGeminiConfigured()) {
        return res.status(503).json({ message: 'Gemini API not configured' });
      }

      const { phaseType, targetLanguage, passage, questions, writingPrompts, answers } = req.body as {
        phaseType: PhaseType;
        targetLanguage: string;
        passage?: string;
        questions?: Array<{ id: string; text: string; maxPoints: number }>;
        writingPrompts?: string[];
        answers: Record<string, string>;
      };

      if (!phaseType || !targetLanguage || !answers) {
        return res.status(400).json({ message: 'Missing required fields: phaseType, targetLanguage, answers' });
      }

      const prompt = buildScoringPrompt(phaseType, targetLanguage, passage, questions, writingPrompts, answers);
      const ai = getGenAI();

      // Retry with backoff on network/rate-limit errors
      let lastError: any = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: GEMINI_MODELS.FLASH,
            contents: prompt,
          });

          const text = response.text ?? '';
          const parsed = parseScoringResponse(phaseType, text, questions, writingPrompts);

          if (!parsed) {
            console.error('[AssessmentScoring] Failed to parse scoring response:', text.substring(0, 500));
            return res.status(500).json({ message: 'Failed to parse scoring response from LLM' });
          }

          return res.json(parsed);
        } catch (err: any) {
          lastError = err;
          const isRetryable = err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.status === 503 || err.status === 429
            || err.message?.includes('fetch failed') || err.message?.includes('timeout');
          if (isRetryable && attempt < 2) {
            const delay = 2000 * Math.pow(2, attempt);
            console.warn(`[AssessmentScoring] Attempt ${attempt + 1} failed (${err.code || err.status || 'unknown'}), retrying in ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
            continue;
          }
          break;
        }
      }

      // All retries failed — return a fallback score so the assessment can still proceed
      console.error('Score assessment phase error (all retries failed):', lastError);
      const fallbackScore = buildFallbackScore(phaseType, questions, writingPrompts);
      if (fallbackScore) {
        console.warn('[AssessmentScoring] Using fallback scoring — LLM unavailable');
        return res.json(fallbackScore);
      }
      res.status(500).json({ message: 'Failed to score assessment phase' });
    } catch (error) {
      console.error('Score assessment phase error:', error);
      res.status(500).json({ message: 'Failed to score assessment phase' });
    }
  });

  // ─── TTS for Listening Phase ───────────────────────────────────────────────

  router.post('/assessments/tts', async (req: Request, res: Response) => {
    try {
      const { text, targetLanguage } = req.body as {
        text: string;
        targetLanguage: string;
      };

      if (!text || !targetLanguage) {
        return res.status(400).json({ message: 'Missing required fields: text, targetLanguage' });
      }

      const languageCode = resolveLanguageCodeForTTS(targetLanguage);

      let ttsProvider;
      try {
        ttsProvider = getTTSProvider('google');
      } catch {
        return res.status(503).json({ message: 'TTS provider not available' });
      }

      // Use a neutral adult female voice for assessment passages
      const voice = VOICE_PROFILES.find(v => v.id === 'f-mid-b') ?? VOICE_PROFILES[2];

      // Collect all audio chunks into a single MP3 buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of ttsProvider.synthesize(text, voice, {
        languageCode,
        speakingRate: 0.9, // slightly slower for assessment listening
      })) {
        chunks.push(chunk.data);
      }

      if (chunks.length === 0) {
        return res.status(500).json({ message: 'TTS synthesis produced no audio' });
      }

      // Concatenate all chunks
      const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
      const fullAudio = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        fullAudio.set(chunk, offset);
        offset += chunk.length;
      }

      // Return as base64-encoded data URL for easy client consumption
      const base64 = Buffer.from(fullAudio).toString('base64');
      res.json({ audioDataUrl: `data:audio/mp3;base64,${base64}` });
    } catch (error) {
      console.error('Assessment TTS error:', error);
      res.status(500).json({ message: 'Failed to synthesize assessment audio' });
    }
  });

  return router;
}

// ─── Language Code Resolution ────────────────────────────────────────────────

const LANGUAGE_CODES: Record<string, string> = {
  english: 'en-US', en: 'en-US',
  french: 'fr-FR', fr: 'fr-FR', français: 'fr-FR',
  spanish: 'es-ES', es: 'es-ES', español: 'es-ES',
  german: 'de-DE', de: 'de-DE', deutsch: 'de-DE',
  italian: 'it-IT', it: 'it-IT', italiano: 'it-IT',
  portuguese: 'pt-BR', pt: 'pt-BR', português: 'pt-BR',
  japanese: 'ja-JP', ja: 'ja-JP',
  korean: 'ko-KR', ko: 'ko-KR',
  chinese: 'zh-CN', zh: 'zh-CN',
  arabic: 'ar-XA', ar: 'ar-XA',
  russian: 'ru-RU', ru: 'ru-RU',
};

function resolveLanguageCodeForTTS(lang: string): string {
  const lower = lang.toLowerCase().trim();
  if (LANGUAGE_CODES[lower]) return LANGUAGE_CODES[lower];
  if (/^[a-z]{2}(-[A-Za-z]{2,4})?$/.test(lower)) return lang;
  for (const [key, code] of Object.entries(LANGUAGE_CODES)) {
    if (lower.includes(key)) return code;
  }
  return 'en-US';
}

// ─── Content Generation Prompts ──────────────────────────────────────────────

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

// ─── Content Parsing ─────────────────────────────────────────────────────────

interface GeneratedContent {
  passage?: string;
  questions?: Array<{ id: string; questionText: string; maxPoints: number }>;
  writingPrompts?: string[];
}

function parseGeneratedContent(phaseType: PhaseType, response: string): GeneratedContent | null {
  if (phaseType === 'reading' || phaseType === 'listening') {
    const passageMatch = response.match(/\*\*PASSAGE\*\*([\s\S]*?)\*\*END_PASSAGE\*\*/);
    const questionsMatch = response.match(/\*\*QUESTIONS\*\*([\s\S]*?)\*\*END_QUESTIONS\*\*/);

    if (!passageMatch) return null;

    const passage = passageMatch[1].trim();
    const questions: Array<{ id: string; questionText: string; maxPoints: number }> = [];

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
            ? 13 - pointsPerQuestion * (qLines.length - 1) // give remainder to last question
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

// ─── Scoring Prompts ─────────────────────────────────────────────────────────

function buildScoringPrompt(
  phaseType: PhaseType,
  targetLanguage: string,
  passage?: string,
  questions?: Array<{ id: string; text: string; maxPoints: number }>,
  writingPrompts?: string[],
  answers?: Record<string, string>,
): string {
  if (phaseType === 'reading' || phaseType === 'listening') {
    const label = phaseType === 'reading' ? 'read' : 'listened to';
    const questionLines = (questions ?? []).map((q, i) => {
      const answer = answers?.[q.id] ?? '';
      return `Q${i + 1} (max ${q.maxPoints} pts): ${q.text}\nStudent's answer: "${answer}"`;
    }).join('\n\n');

    return [
      `Evaluate a student's ${phaseType} comprehension in ${targetLanguage}.`,
      `The student ${label} the following passage and answered comprehension questions.`,
      '',
      `Passage: "${passage}"`,
      '',
      'Student answers:',
      questionLines,
      '',
      `Score each answer from 0 to its max points. Award full points for correct and complete answers,`,
      `partial points for partially correct answers, and 0 for incorrect or empty answers.`,
      '',
      'Respond with EXACTLY this format:',
      '**SCORE_EVAL**',
      ...(questions ?? []).map((q, i) => `Q${i + 1}: <0-${q.maxPoints}> | <brief rationale>`),
      'overall: <brief overall rationale>',
      '**END_SCORE_EVAL**',
    ].join('\n');
  }

  if (phaseType === 'writing') {
    const promptLines = (writingPrompts ?? []).map((p, i) => {
      const answer = answers?.[`p${i + 1}`] ?? '';
      return `Prompt ${i + 1}: ${p}\nStudent's response: "${answer}"`;
    }).join('\n\n');

    return [
      `Evaluate a student's writing in ${targetLanguage}.`,
      '',
      promptLines,
      '',
      'Score the overall writing on three dimensions (0-5 each):',
      '- task_completion: Does the response address the prompt requirements? (0=not at all, 5=thoroughly)',
      '- vocabulary: Is the word choice appropriate and varied? (0=none/wrong language, 5=excellent range)',
      '- grammar: Are sentence structures and verb forms correct? (0=incomprehensible, 5=mostly correct)',
      '',
      'Respond with EXACTLY this format:',
      '**WRITING_EVAL**',
      'task_completion: <0-5> | <brief rationale>',
      'vocabulary: <0-5> | <brief rationale>',
      'grammar: <0-5> | <brief rationale>',
      'overall: <brief overall rationale>',
      '**END_WRITING_EVAL**',
    ].join('\n');
  }

  return '';
}

// ─── Scoring Response Parsing ────────────────────────────────────────────────

interface ScoringResult {
  totalScore: number;
  maxScore: number;
  questionScores?: Array<{ questionId: string; score: number; maxScore: number; rationale: string }>;
  dimensionScores?: Record<string, { score: number; maxScore: number; rationale: string }>;
  overallRationale: string;
}

/**
 * Build a neutral fallback score when the LLM is unavailable.
 * Awards ~50% of max points so the player can proceed without being penalized
 * or inflated. The rationale clearly states it was auto-scored.
 */
function buildFallbackScore(
  phaseType: PhaseType,
  questions?: Array<{ id: string; text: string; maxPoints: number }>,
  _writingPrompts?: string[],
): ScoringResult | null {
  const fallbackRationale = 'Auto-scored: language model was unavailable. Score reflects a neutral estimate.';

  if (phaseType === 'reading' || phaseType === 'listening') {
    if (!questions || questions.length === 0) return null;
    const questionScores = questions.map(q => ({
      questionId: q.id,
      score: Math.round(q.maxPoints * 0.5),
      maxScore: q.maxPoints,
      rationale: fallbackRationale,
    }));
    const totalScore = questionScores.reduce((sum, qs) => sum + qs.score, 0);
    const maxScore = questions.reduce((sum, q) => sum + q.maxPoints, 0);
    return { totalScore, maxScore, questionScores, overallRationale: fallbackRationale };
  }

  if (phaseType === 'writing') {
    const dimensionScores: Record<string, { score: number; maxScore: number; rationale: string }> = {};
    for (const dim of ['task_completion', 'vocabulary', 'grammar']) {
      dimensionScores[dim] = { score: 3, maxScore: 5, rationale: fallbackRationale };
    }
    return { totalScore: 9, maxScore: 15, dimensionScores, overallRationale: fallbackRationale };
  }

  // Conversation phase — no structured score needed, return minimal result
  return { totalScore: 5, maxScore: 10, overallRationale: fallbackRationale };
}

function parseScoringResponse(
  phaseType: PhaseType,
  response: string,
  questions?: Array<{ id: string; text: string; maxPoints: number }>,
  _writingPrompts?: string[],
): ScoringResult | null {
  if (phaseType === 'reading' || phaseType === 'listening') {
    const match = response.match(/\*\*SCORE_EVAL\*\*([\s\S]*?)\*\*END_SCORE_EVAL\*\*/);
    if (!match) return null;

    const block = match[1];
    const questionScores: Array<{ questionId: string; score: number; maxScore: number; rationale: string }> = [];
    let totalScore = 0;
    const maxScore = (questions ?? []).reduce((sum, q) => sum + q.maxPoints, 0);

    for (let i = 0; i < (questions ?? []).length; i++) {
      const q = questions![i];
      const qMatch = block.match(new RegExp(`Q${i + 1}:\\s*(\\d+)\\s*\\|\\s*(.+)`));
      const score = qMatch ? Math.min(q.maxPoints, parseInt(qMatch[1])) : 0;
      const rationale = qMatch ? qMatch[2].trim() : 'Not evaluated';
      questionScores.push({ questionId: q.id, score, maxScore: q.maxPoints, rationale });
      totalScore += score;
    }

    const overallMatch = block.match(/overall:\s*(.+)/);
    const overallRationale = overallMatch ? overallMatch[1].trim() : '';

    return { totalScore, maxScore, questionScores, overallRationale };
  }

  if (phaseType === 'writing') {
    const match = response.match(/\*\*WRITING_EVAL\*\*([\s\S]*?)\*\*END_WRITING_EVAL\*\*/);
    if (!match) return null;

    const block = match[1];
    const dimensionScores: Record<string, { score: number; maxScore: number; rationale: string }> = {};

    for (const dim of ['task_completion', 'vocabulary', 'grammar']) {
      const dimMatch = block.match(new RegExp(`${dim}:\\s*(\\d)\\s*\\|\\s*(.+)`));
      dimensionScores[dim] = {
        score: dimMatch ? Math.min(5, parseInt(dimMatch[1])) : 0,
        maxScore: 5,
        rationale: dimMatch ? dimMatch[2].trim() : 'Not evaluated',
      };
    }

    const totalScore = Object.values(dimensionScores).reduce((sum, d) => sum + d.score, 0);
    const overallMatch = block.match(/overall:\s*(.+)/);
    const overallRationale = overallMatch ? overallMatch[1].trim() : '';

    return { totalScore, maxScore: 15, dimensionScores, overallRationale };
  }

  return null;
}
