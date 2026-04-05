/**
 * NPC Exam Routes
 *
 * Endpoints for NPC-initiated exams/quizzes that integrate with the
 * assessment engine. Supports:
 *   - Generating exam questions via LLM
 *   - Scoring completed exams
 *   - Persisting results as assessment sessions
 */

import { Router, type Request, type Response } from 'express';
import type { IStorage } from '../db/storage';
import { getGenAI, GEMINI_MODELS, isGeminiConfigured } from '../config/gemini';
import {
  getNpcExamTemplate,
  buildExamGenerationPrompt,
  buildNpcExamFromTemplate,
} from '../../shared/assessment/npc-exam-definitions';
import {
  scoreNpcExam,
  npcExamResultToPhaseResult,
} from '../../shared/assessment/npc-exam-types';
import type { NpcExamConfig, NpcExamQuestion } from '../../shared/assessment/npc-exam-types';

export function createNpcExamRoutes(storage: IStorage): Router {
  const router = Router();

  // POST /api/npc-exams/generate — Generate exam questions from a template
  router.post('/npc-exams/generate', async (req: Request, res: Response) => {
    try {
      const { templateId, npcId, npcName, targetLanguage, difficulty } = req.body;

      if (!templateId || !npcId || !npcName || !targetLanguage) {
        return res.status(400).json({
          message: 'Missing required fields: templateId, npcId, npcName, targetLanguage',
        });
      }

      const template = getNpcExamTemplate(templateId);
      if (!template) {
        return res.status(404).json({ message: `Unknown exam template: ${templateId}` });
      }

      let questions: NpcExamQuestion[];

      if (isGeminiConfigured()) {
        const prompt = buildExamGenerationPrompt(template, targetLanguage, difficulty);
        const fullPrompt = [
          prompt,
          '',
          'Respond with EXACTLY this JSON format (no markdown fences):',
          '[',
          '  { "prompt": "question text", "expectedAnswer": "correct answer", "acceptableAnswers": ["alt1", "alt2"] },',
          '  ...',
          ']',
        ].join('\n');

        const ai = getGenAI();
        const response = await ai.models.generateContent({
          model: GEMINI_MODELS.FLASH,
          contents: fullPrompt,
        });

        const text = (response.text ?? '').trim();
        questions = parseGeneratedQuestions(text, template.pointsPerQuestion);
      } else {
        // Fallback: generate placeholder questions
        questions = generateFallbackQuestions(template, targetLanguage);
      }

      const examConfig = buildNpcExamFromTemplate(
        template,
        npcId,
        npcName,
        targetLanguage,
        questions,
        difficulty,
      );

      res.json(examConfig);
    } catch (error) {
      console.error('Generate NPC exam error:', error);
      res.status(500).json({ message: 'Failed to generate NPC exam' });
    }
  });

  // POST /api/npc-exams/score — Score a completed NPC exam and persist as assessment
  router.post('/npc-exams/score', async (req: Request, res: Response) => {
    try {
      const { examConfig, answers, playerId, worldId, startedAt } = req.body as {
        examConfig: NpcExamConfig;
        answers: Record<string, string>;
        playerId: string;
        worldId: string;
        startedAt: number;
      };

      if (!examConfig || !answers || !playerId || !worldId) {
        return res.status(400).json({
          message: 'Missing required fields: examConfig, answers, playerId, worldId',
        });
      }

      // Score the exam
      const result = scoreNpcExam(examConfig, answers, startedAt ?? Date.now() - 60000);

      // Persist as an assessment session
      const session = await storage.createAssessmentSession({
        playerId,
        worldId,
        assessmentDefinitionId: `npc_exam_${examConfig.category}`,
        assessmentType: 'npc_exam',
        targetLanguage: examConfig.targetLanguage,
        status: 'complete',
        phaseResults: [npcExamResultToPhaseResult(result)],
        totalMaxPoints: examConfig.totalMaxPoints,
        recordings: [],
        createdAt: new Date().toISOString(),
      });

      // Complete the session
      await storage.completeAssessmentSession(
        session.id,
        result.totalScore,
        result.totalMaxPoints,
        result.cefrLevel,
      );

      // Mirror cefrLevel to playerProgress for direct server-side queries
      if (result.cefrLevel) {
        const playerProg = await storage.getPlayerProgressByUser(playerId, worldId);
        if (playerProg) {
          await storage.updatePlayerProgress(playerProg.id, { cefrLevel: result.cefrLevel } as any).catch(err =>
            console.warn('[NpcExam] Failed to mirror cefrLevel to playerProgress:', err)
          );
        }
      }

      res.json({ result, sessionId: session.id });
    } catch (error) {
      console.error('Score NPC exam error:', error);
      res.status(500).json({ message: 'Failed to score NPC exam' });
    }
  });

  // GET /api/npc-exams/templates — List available exam templates
  router.get('/npc-exams/templates', (_req: Request, res: Response) => {
    const { NPC_EXAM_TEMPLATES } = require('../../shared/assessment/npc-exam-definitions');
    res.json(NPC_EXAM_TEMPLATES.map((t: any) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      description: t.description,
      defaultDifficulty: t.defaultDifficulty,
      questionCount: t.questionCount,
      timeLimitSeconds: t.timeLimitSeconds,
    })));
  });

  return router;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseGeneratedQuestions(text: string, pointsPerQuestion: number): NpcExamQuestion[] {
  try {
    // Strip markdown fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) return [];

    return parsed.map((q: any, i: number) => ({
      id: `q${i + 1}`,
      prompt: String(q.prompt || q.question || ''),
      expectedAnswer: String(q.expectedAnswer || q.answer || ''),
      acceptableAnswers: Array.isArray(q.acceptableAnswers)
        ? q.acceptableAnswers.map(String)
        : [],
      maxPoints: pointsPerQuestion,
      hint: q.hint ? String(q.hint) : undefined,
    }));
  } catch {
    console.warn('[NpcExamRoutes] Failed to parse LLM question response');
    return [];
  }
}

function generateFallbackQuestions(
  template: { questionCount: number; pointsPerQuestion: number; category: string },
  targetLanguage: string,
): NpcExamQuestion[] {
  const questions: NpcExamQuestion[] = [];
  for (let i = 0; i < template.questionCount; i++) {
    questions.push({
      id: `q${i + 1}`,
      prompt: `${targetLanguage} ${template.category.replace('_', ' ')} question ${i + 1}`,
      expectedAnswer: `answer_${i + 1}`,
      acceptableAnswers: [],
      maxPoints: template.pointsPerQuestion,
    });
  }
  return questions;
}
