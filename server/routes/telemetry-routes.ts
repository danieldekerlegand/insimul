/**
 * Telemetry, Evaluation, and Language Progress API Routes
 *
 * Covers:
 *  - US-5.01: Language progress sync
 *  - US-5.02: Evaluation instrument responses
 *  - US-5.03: Technical telemetry (FPS, load times, errors)
 *  - US-5.04: Engagement events and sessions
 *  - US-6.02: External telemetry ingestion + API key management
 */

import { Router, type Request, type Response } from 'express';
import crypto from 'crypto';

// Simple in-memory rate limiter for API key requests (100 req/min per key)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(apiKey: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(apiKey);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(apiKey, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

export function createTelemetryRoutes(storage: any): Router {
  const router = Router();

  // ============= LANGUAGE PROGRESS (US-5.01) =============

  // GET /api/language-progress/:playerId/:worldId — get full progress
  router.get('/language-progress/:playerId/:worldId', async (req: Request, res: Response) => {
    try {
      const { playerId, worldId } = req.params;

      const [progress, vocabulary, grammarPatterns, conversations] = await Promise.all([
        storage.getLanguageProgress(playerId, worldId),
        storage.getVocabularyEntries(playerId, worldId),
        storage.getGrammarPatterns(playerId, worldId),
        storage.getConversationRecords(playerId, worldId),
      ]);

      res.json({
        progress,
        vocabulary,
        grammarPatterns,
        conversations,
      });
    } catch (error) {
      console.error('Get language progress error:', error);
      res.status(500).json({ message: 'Failed to get language progress' });
    }
  });

  // POST /api/language-progress/sync — batch upsert from client
  router.post('/language-progress/sync', async (req: Request, res: Response) => {
    try {
      const { playerId, worldId, progress, vocabulary, grammarPatterns, conversations } = req.body;

      if (!playerId || !worldId) {
        return res.status(400).json({ message: 'Missing required fields: playerId, worldId' });
      }

      const results: any = {};

      // Upsert progress if provided
      if (progress) {
        results.progress = await storage.upsertLanguageProgress(playerId, worldId, progress);
      }

      // Upsert vocabulary entries
      if (vocabulary && Array.isArray(vocabulary)) {
        results.vocabulary = [];
        for (const entry of vocabulary) {
          if (!entry.word) continue;
          const upserted = await storage.upsertVocabularyEntry(playerId, worldId, entry.word, entry);
          results.vocabulary.push(upserted);
        }
      }

      // Upsert grammar patterns
      if (grammarPatterns && Array.isArray(grammarPatterns)) {
        results.grammarPatterns = [];
        for (const entry of grammarPatterns) {
          if (!entry.pattern) continue;
          const upserted = await storage.upsertGrammarPattern(playerId, worldId, entry.pattern, entry);
          results.grammarPatterns.push(upserted);
        }
      }

      // Create conversation records
      if (conversations && Array.isArray(conversations)) {
        results.conversations = [];
        for (const conv of conversations) {
          const created = await storage.createConversationRecord({ ...conv, playerId, worldId });
          results.conversations.push(created);
        }
      }

      res.json({ synced: true, ...results });
    } catch (error) {
      console.error('Sync language progress error:', error);
      res.status(500).json({ message: 'Failed to sync language progress' });
    }
  });

  // ============= EVALUATION (US-5.02) =============

  // POST /api/evaluation/:studyId/response — submit instrument response
  router.post('/evaluation/:studyId/response', async (req: Request, res: Response) => {
    try {
      const { studyId } = req.params;
      const { participantId, instrumentType, responses, score } = req.body;

      if (!participantId || !instrumentType) {
        return res.status(400).json({ message: 'Missing required fields: participantId, instrumentType' });
      }

      const evalResponse = await storage.createEvaluationResponse({
        studyId,
        participantId,
        instrumentType,
        responses: responses || [],
        score: score ?? null,
        createdAt: new Date(),
      });

      res.status(201).json(evalResponse);
    } catch (error) {
      console.error('Create evaluation response error:', error);
      res.status(500).json({ message: 'Failed to create evaluation response' });
    }
  });

  // GET /api/evaluation/:studyId/responses — get all responses
  // Supports ?participantId=...&targetLanguage=... query params for filtering
  router.get('/evaluation/:studyId/responses', async (req: Request, res: Response) => {
    try {
      const { studyId } = req.params;
      const participantId = req.query.participantId as string | undefined;
      const targetLanguage = req.query.targetLanguage as string | undefined;

      const responses = await storage.getEvaluationResponses(studyId, participantId, targetLanguage);
      res.json(responses);
    } catch (error) {
      console.error('Get evaluation responses error:', error);
      res.status(500).json({ message: 'Failed to get evaluation responses' });
    }
  });

  // GET /api/evaluation/:studyId/summary — aggregate scores
  // Supports ?targetLanguage=... for within-language analysis
  router.get('/evaluation/:studyId/summary', async (req: Request, res: Response) => {
    try {
      const { studyId } = req.params;
      const targetLanguage = req.query.targetLanguage as string | undefined;
      const summary = await storage.getEvaluationSummary(studyId, targetLanguage);
      res.json(summary);
    } catch (error) {
      console.error('Get evaluation summary error:', error);
      res.status(500).json({ message: 'Failed to get evaluation summary' });
    }
  });

  // GET /api/evaluation/:studyId/export — export as CSV
  // Supports ?targetLanguage=... for within-language and cross-language analysis
  router.get('/evaluation/:studyId/export', async (req: Request, res: Response) => {
    try {
      const { studyId } = req.params;
      const targetLanguage = req.query.targetLanguage as string | undefined;
      const responses = await storage.getEvaluationResponses(studyId, undefined, targetLanguage);

      if (responses.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="evaluation_${studyId}.csv"`);
        return res.send('No data');
      }

      // Build CSV header
      const headers = [
        'id',
        'studyId',
        'participantId',
        'instrumentType',
        'targetLanguage',
        'score',
        'createdAt',
      ];
      const csvRows: string[] = [headers.join(',')];

      // Build data rows
      for (const r of responses) {
        const row = [
          csvEscape(r.id),
          csvEscape(r.studyId || studyId),
          csvEscape(r.participantId),
          csvEscape(r.instrumentType),
          csvEscape(r.targetLanguage),
          r.score != null ? String(r.score) : '',
          csvEscape(r.createdAt ? new Date(r.createdAt).toISOString() : ''),
        ];
        csvRows.push(row.join(','));
      }

      const csv = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="evaluation_${studyId}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error('Export evaluation error:', error);
      res.status(500).json({ message: 'Failed to export evaluation data' });
    }
  });

  // ============= TECHNICAL TELEMETRY (US-5.03) =============

  // POST /api/telemetry/batch — batch upload telemetry events
  router.post('/telemetry/batch', async (req: Request, res: Response) => {
    try {
      const { events } = req.body;

      if (!events || !Array.isArray(events)) {
        return res.status(400).json({ message: 'Missing required field: events (array)' });
      }

      if (events.length === 0) {
        return res.json({ inserted: 0 });
      }

      // Validate each event has minimum required fields
      for (let i = 0; i < events.length; i++) {
        const evt = events[i];
        if (!evt.sessionId || !evt.metricType) {
          return res.status(400).json({
            message: `Event at index ${i} missing required fields: sessionId, metricType`,
          });
        }
      }

      const inserted = await storage.createTelemetryBatch(events);
      res.json({ inserted });
    } catch (error) {
      console.error('Create telemetry batch error:', error);
      res.status(500).json({ message: 'Failed to create telemetry batch' });
    }
  });

  // GET /api/telemetry/:sessionId/summary — per-session summary
  router.get('/telemetry/:sessionId/summary', async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const summary = await storage.getTelemetrySummary(sessionId);
      res.json(summary);
    } catch (error) {
      console.error('Get telemetry summary error:', error);
      res.status(500).json({ message: 'Failed to get telemetry summary' });
    }
  });

  // ============= ENGAGEMENT (US-5.04) =============

  // POST /api/engagement/event — single event
  router.post('/engagement/event', async (req: Request, res: Response) => {
    try {
      const { playerId, eventType, sessionId } = req.body;

      if (!playerId || !eventType) {
        return res.status(400).json({ message: 'Missing required fields: playerId, eventType' });
      }

      const event = await storage.createEngagementEvent({
        ...req.body,
        createdAt: new Date(),
      });

      res.status(201).json(event);
    } catch (error) {
      console.error('Create engagement event error:', error);
      res.status(500).json({ message: 'Failed to create engagement event' });
    }
  });

  // POST /api/engagement/batch — batch events
  router.post('/engagement/batch', async (req: Request, res: Response) => {
    try {
      const { events } = req.body;

      if (!events || !Array.isArray(events)) {
        return res.status(400).json({ message: 'Missing required field: events (array)' });
      }

      if (events.length === 0) {
        return res.json({ inserted: 0 });
      }

      // Validate minimum fields
      for (let i = 0; i < events.length; i++) {
        const evt = events[i];
        if (!evt.playerId || !evt.eventType) {
          return res.status(400).json({
            message: `Event at index ${i} missing required fields: playerId, eventType`,
          });
        }
      }

      const inserted = await storage.createEngagementBatch(events);
      res.json({ inserted });
    } catch (error) {
      console.error('Create engagement batch error:', error);
      res.status(500).json({ message: 'Failed to create engagement batch' });
    }
  });

  // GET /api/engagement/sessions — session history
  router.get('/engagement/sessions', async (req: Request, res: Response) => {
    try {
      const playerId = req.query.playerId as string;
      const studyId = req.query.studyId as string | undefined;

      if (!playerId) {
        return res.status(400).json({ message: 'Missing required query parameter: playerId' });
      }

      const sessions = await storage.getEngagementSessions(playerId, studyId);
      res.json(sessions);
    } catch (error) {
      console.error('Get engagement sessions error:', error);
      res.status(500).json({ message: 'Failed to get engagement sessions' });
    }
  });

  // ============= EXTERNAL TELEMETRY (US-6.02) =============

  // POST /api/external/telemetry/batch — from exported games (API key auth)
  // TODO: Add rate limiting middleware (e.g., express-rate-limit) before production
  router.post('/external/telemetry/batch', async (req: Request, res: Response) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;

      if (!apiKey) {
        return res.status(401).json({ message: 'Missing X-API-Key header' });
      }

      const keyRecord = await storage.validateApiKey(apiKey);
      if (!keyRecord) {
        return res.status(403).json({ message: 'Invalid or expired API key' });
      }

      // Rate limiting: 100 requests per minute per API key
      if (!checkRateLimit(apiKey)) {
        return res.status(429).json({ message: 'Rate limit exceeded. Max 100 requests per minute.' });
      }

      const { telemetryEvents, engagementEvents } = req.body;

      const rejectionReasons: string[] = [];
      let telemetryInserted = 0;
      let telemetryRejected = 0;
      let engagementInserted = 0;
      let engagementRejected = 0;

      // Validate and insert technical telemetry events
      if (telemetryEvents && Array.isArray(telemetryEvents) && telemetryEvents.length > 0) {
        const validTelemetry: any[] = [];
        for (let i = 0; i < telemetryEvents.length; i++) {
          const evt = telemetryEvents[i];
          if (!evt.sessionId || typeof evt.sessionId !== 'string') {
            telemetryRejected++;
            rejectionReasons.push(`telemetryEvents[${i}]: missing or invalid sessionId`);
            continue;
          }
          if (!evt.metricType || typeof evt.metricType !== 'string') {
            telemetryRejected++;
            rejectionReasons.push(`telemetryEvents[${i}]: missing or invalid metricType`);
            continue;
          }
          validTelemetry.push({ ...evt, worldId: keyRecord.worldId, source: 'external' });
        }
        if (validTelemetry.length > 0) {
          telemetryInserted = await storage.createTelemetryBatch(validTelemetry);
        }
      }

      // Validate and insert engagement events
      if (engagementEvents && Array.isArray(engagementEvents) && engagementEvents.length > 0) {
        const validEngagement: any[] = [];
        for (let i = 0; i < engagementEvents.length; i++) {
          const evt = engagementEvents[i];
          if (!evt.playerId || typeof evt.playerId !== 'string') {
            engagementRejected++;
            rejectionReasons.push(`engagementEvents[${i}]: missing or invalid playerId`);
            continue;
          }
          if (!evt.eventType || typeof evt.eventType !== 'string') {
            engagementRejected++;
            rejectionReasons.push(`engagementEvents[${i}]: missing or invalid eventType`);
            continue;
          }
          validEngagement.push({ ...evt, worldId: keyRecord.worldId, source: 'external' });
        }
        if (validEngagement.length > 0) {
          engagementInserted = await storage.createEngagementBatch(validEngagement);
        }
      }

      if (rejectionReasons.length > 0) {
        console.warn(`External telemetry batch: ${telemetryRejected + engagementRejected} events rejected`, rejectionReasons);
      }

      res.json({ telemetryInserted, telemetryRejected, engagementInserted, engagementRejected, rejectionReasons });
    } catch (error) {
      console.error('External telemetry batch error:', error);
      res.status(500).json({ message: 'Failed to process external telemetry batch' });
    }
  });

  // GET /api/external/telemetry/status — health check
  router.get('/external/telemetry/status', async (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ============= API KEYS (US-6.02) =============

  // POST /api/worlds/:worldId/api-keys — generate key
  router.post('/worlds/:worldId/api-keys', async (req: Request, res: Response) => {
    try {
      const { worldId } = req.params;
      const { ownerId, permissions, expiresAt } = req.body;

      if (!ownerId) {
        return res.status(400).json({ message: 'Missing required field: ownerId' });
      }

      const key = 'insimul_' + crypto.randomBytes(32).toString('hex');

      const apiKey = await storage.createApiKey({
        key,
        worldId,
        ownerId,
        permissions: permissions || ['telemetry:write'],
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      res.status(201).json(apiKey);
    } catch (error) {
      console.error('Create API key error:', error);
      res.status(500).json({ message: 'Failed to create API key' });
    }
  });

  // DELETE /api/worlds/:worldId/api-keys/:keyId — revoke key
  router.delete('/worlds/:worldId/api-keys/:keyId', async (req: Request, res: Response) => {
    try {
      const { keyId } = req.params;

      const revoked = await storage.revokeApiKey(keyId);
      if (!revoked) {
        return res.status(404).json({ message: 'API key not found or already revoked' });
      }

      res.json({ revoked: true });
    } catch (error) {
      console.error('Revoke API key error:', error);
      res.status(500).json({ message: 'Failed to revoke API key' });
    }
  });

  // GET /api/worlds/:worldId/api-keys — list keys
  router.get('/worlds/:worldId/api-keys', async (req: Request, res: Response) => {
    try {
      const { worldId } = req.params;
      const keys = await storage.getApiKeysByWorld(worldId);

      // Mask the key values for security — only show prefix + last 8 chars
      const masked = keys.map((k: any) => ({
        ...k,
        key: k.key
          ? k.key.substring(0, 8) + '...' + k.key.substring(k.key.length - 8)
          : undefined,
      }));

      res.json(masked);
    } catch (error) {
      console.error('Get API keys error:', error);
      res.status(500).json({ message: 'Failed to get API keys' });
    }
  });

  // ============= AGGREGATE ENDPOINTS =============

  // GET /api/telemetry/aggregate — aggregate technical metrics by study
  router.get('/telemetry/aggregate', async (req: Request, res: Response) => {
    try {
      const studyId = req.query.studyId as string | undefined;
      const worldId = req.query.worldId as string | undefined;

      const filter: Record<string, unknown> = {};
      if (worldId) filter.worldId = worldId;

      const events: any[] = await storage.getTelemetryEvents?.(filter) ?? [];

      // Group by metric type
      const byType: Record<string, number[]> = {};
      for (const evt of events) {
        const key = evt.metricType || 'unknown';
        if (!byType[key]) byType[key] = [];
        if (evt.value != null) byType[key].push(Number(evt.value));
      }

      // Compute percentiles
      const computePercentiles = (values: number[]) => {
        if (values.length === 0) return { count: 0, mean: 0, p50: 0, p95: 0, p99: 0 };
        const sorted = values.slice().sort((a, b) => a - b);
        const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
        const p = (pct: number) => sorted[Math.min(Math.floor(sorted.length * pct), sorted.length - 1)];
        return { count: sorted.length, mean: Math.round(mean * 100) / 100, p50: p(0.5), p95: p(0.95), p99: p(0.99) };
      };

      const aggregate: Record<string, ReturnType<typeof computePercentiles>> = {};
      for (const [key, values] of Object.entries(byType)) {
        aggregate[key] = computePercentiles(values);
      }

      res.json({ studyId, worldId, totalEvents: events.length, metrics: aggregate });
    } catch (error) {
      console.error('Telemetry aggregate error:', error);
      res.status(500).json({ message: 'Failed to get telemetry aggregate' });
    }
  });

  // GET /api/engagement/dashboard — aggregate engagement metrics
  router.get('/engagement/dashboard', async (req: Request, res: Response) => {
    try {
      const studyId = req.query.studyId as string | undefined;
      const worldId = req.query.worldId as string | undefined;

      const events: any[] = await storage.getEngagementEvents?.(worldId) ?? [];

      // Group by session
      const sessions = new Map<string, { events: any[]; playerId: string }>();
      for (const evt of events) {
        const sid = evt.sessionId || 'unknown';
        if (!sessions.has(sid)) sessions.set(sid, { events: [], playerId: evt.playerId || '' });
        sessions.get(sid)!.events.push(evt);
      }

      // Compute per-session metrics
      const sessionMetrics: Array<{
        sessionId: string;
        playerId: string;
        eventCount: number;
        startTime: number;
        endTime: number;
        durationMs: number;
      }> = [];

      for (const [sid, data] of Array.from(sessions.entries())) {
        const timestamps = data.events
          .map((e: any) => new Date(e.timestamp || e.createdAt || 0).getTime())
          .filter((t: number) => t > 0)
          .sort((a: number, b: number) => a - b);

        if (timestamps.length === 0) continue;

        sessionMetrics.push({
          sessionId: sid,
          playerId: data.playerId,
          eventCount: data.events.length,
          startTime: timestamps[0],
          endTime: timestamps[timestamps.length - 1],
          durationMs: timestamps[timestamps.length - 1] - timestamps[0],
        });
      }

      // Aggregate stats
      const durations = sessionMetrics.map(s => s.durationMs).filter(d => d > 0);
      const avgDurationMs = durations.length > 0
        ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
        : 0;

      const actionsPerMin = sessionMetrics
        .filter(s => s.durationMs > 0)
        .map(s => (s.eventCount / (s.durationMs / 60_000)));
      const avgActionsPerMin = actionsPerMin.length > 0
        ? Math.round(actionsPerMin.reduce((s, v) => s + v, 0) / actionsPerMin.length * 10) / 10
        : 0;

      // Event type distribution
      const eventTypeDist: Record<string, number> = {};
      for (const evt of events) {
        const t = evt.eventType || 'unknown';
        eventTypeDist[t] = (eventTypeDist[t] || 0) + 1;
      }

      // Unique players
      const uniquePlayers = new Set(events.map((e: any) => e.playerId).filter(Boolean));

      // Completion rate: sessions with session_end / total sessions
      const completedSessions = sessionMetrics.filter(s =>
        sessions.get(s.sessionId)?.events.some((e: any) => e.eventType === 'session_end')
      ).length;
      const completionRate = sessionMetrics.length > 0
        ? Math.round((completedSessions / sessionMetrics.length) * 100)
        : 0;

      // Flag if completion drops below 70%
      const completionWarning = completionRate < 70 && sessionMetrics.length >= 5;

      res.json({
        studyId,
        worldId,
        totalEvents: events.length,
        totalSessions: sessionMetrics.length,
        uniquePlayers: uniquePlayers.size,
        avgSessionDurationMs: avgDurationMs,
        avgActionsPerMinute: avgActionsPerMin,
        completionRate,
        completionWarning,
        eventTypeDistribution: eventTypeDist,
      });
    } catch (error) {
      console.error('Engagement dashboard error:', error);
      res.status(500).json({ message: 'Failed to get engagement dashboard' });
    }
  });

  // ============= ASSESSMENT ENDPOINTS =============

  // GET /api/assessment/dashboard/:worldId — aggregate assessment data for admin dashboard
  router.get('/assessment/dashboard/:worldId', async (req: Request, res: Response) => {
    try {
      const { worldId } = req.params;
      const assessmentType = req.query.assessmentType as string | undefined;
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;

      const assessments: any[] = await storage.getLanguageAssessmentsByWorld(worldId, {
        assessmentType,
        dateFrom,
        dateTo,
      });

      // Compute aggregations
      const playerMap = new Map<string, any[]>();
      const byType: Record<string, { scores: number[], maxScores: number[], count: number }> = {};
      const byPhase: Record<string, { scores: number[], count: number }> = {};
      const cefrDistribution: Record<string, number> = {};

      for (const a of assessments) {
        // Group by player
        if (!playerMap.has(a.playerId)) playerMap.set(a.playerId, []);
        playerMap.get(a.playerId)!.push(a);

        // Group by type
        const type = a.assessmentType || 'unknown';
        if (!byType[type]) byType[type] = { scores: [], maxScores: [], count: 0 };
        byType[type].count++;
        if (a.score != null) {
          byType[type].scores.push(a.score);
          byType[type].maxScores.push(a.maxScore || 100);
        }

        // Group by phase/testWindow
        const phase = a.testWindow || 'unspecified';
        if (!byPhase[phase]) byPhase[phase] = { scores: [], count: 0 };
        byPhase[phase].count++;
        if (a.score != null && a.maxScore) {
          byPhase[phase].scores.push((a.score / a.maxScore) * 100);
        }

        // CEFR mapping from percentage score
        if (a.score != null && a.maxScore) {
          const pct = (a.score / a.maxScore) * 100;
          let cefr: string;
          if (pct >= 95) cefr = 'C2';
          else if (pct >= 85) cefr = 'C1';
          else if (pct >= 70) cefr = 'B2';
          else if (pct >= 55) cefr = 'B1';
          else if (pct >= 40) cefr = 'A2';
          else cefr = 'A1';
          cefrDistribution[cefr] = (cefrDistribution[cefr] || 0) + 1;
        }
      }

      // Score distribution histogram (10-point buckets)
      const allPercentages = assessments
        .filter(a => a.score != null && a.maxScore)
        .map(a => (a.score / a.maxScore) * 100);
      const histogram: Record<string, number> = {};
      for (let i = 0; i < 10; i++) {
        const label = `${i * 10}-${i * 10 + 9}`;
        histogram[label] = 0;
      }
      histogram['100'] = 0;
      for (const pct of allPercentages) {
        if (pct >= 100) histogram['100']++;
        else {
          const bucket = `${Math.floor(pct / 10) * 10}-${Math.floor(pct / 10) * 10 + 9}`;
          histogram[bucket] = (histogram[bucket] || 0) + 1;
        }
      }

      // Per-type averages
      const typeAverages: Record<string, { avgScore: number; avgPercentage: number; count: number }> = {};
      for (const [type, data] of Object.entries(byType)) {
        const avgScore = data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0;
        const avgPct = data.scores.length > 0
          ? data.scores.map((s, i) => (s / data.maxScores[i]) * 100).reduce((a, b) => a + b, 0) / data.scores.length
          : 0;
        typeAverages[type] = { avgScore: Math.round(avgScore * 10) / 10, avgPercentage: Math.round(avgPct * 10) / 10, count: data.count };
      }

      // Per-phase averages
      const phaseAverages: Record<string, { avgPercentage: number; count: number }> = {};
      for (const [phase, data] of Object.entries(byPhase)) {
        const avg = data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0;
        phaseAverages[phase] = { avgPercentage: Math.round(avg * 10) / 10, count: data.count };
      }

      // Player summaries
      const players = Array.from(playerMap.entries()).map(([playerId, playerAssessments]) => {
        const scores = playerAssessments.filter(a => a.score != null && a.maxScore);
        const avgPct = scores.length > 0
          ? scores.map(a => (a.score / a.maxScore) * 100).reduce((a, b) => a + b, 0) / scores.length
          : 0;
        return {
          playerId,
          assessmentCount: playerAssessments.length,
          avgPercentage: Math.round(avgPct * 10) / 10,
          lastAssessment: playerAssessments[0]?.createdAt,
        };
      });

      res.json({
        worldId,
        totalAssessments: assessments.length,
        uniquePlayers: playerMap.size,
        histogram,
        cefrDistribution,
        typeAverages,
        phaseAverages,
        players,
      });
    } catch (error) {
      console.error('Assessment dashboard error:', error);
      res.status(500).json({ message: 'Failed to get assessment dashboard data' });
    }
  });

  // GET /api/assessment/:participantId/schedule — shows which tests are due
  router.get('/assessment/:participantId/schedule', async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;
      const studyId = req.query.studyId as string | undefined;

      // Get all existing assessment responses for this participant
      const existing: any[] = studyId
        ? await storage.getEvaluationResponses(studyId, participantId)
        : [];

      // Determine completed test windows
      const completedWindows = new Set(existing.map((r: any) => r.testWindow).filter(Boolean));

      // Build schedule
      const windows = ['pre', 'post', 'delayed'];
      const instruments = ['actfl_opi', 'sus', 'ssq', 'ipq'];
      const schedule: Array<{
        testWindow: string;
        instrumentType: string;
        status: 'completed' | 'due' | 'upcoming';
      }> = [];

      for (const window of windows) {
        for (const inst of instruments) {
          const completed = existing.some(
            (r: any) => r.testWindow === window && r.instrumentType === inst
          );
          schedule.push({
            testWindow: window,
            instrumentType: inst,
            status: completed ? 'completed' : (completedWindows.has(window) ? 'upcoming' : 'due'),
          });
        }
      }

      res.json({
        participantId,
        studyId,
        schedule,
        completedCount: existing.length,
      });
    } catch (error) {
      console.error('Assessment schedule error:', error);
      res.status(500).json({ message: 'Failed to get assessment schedule' });
    }
  });

  // POST /api/assessment/:participantId/submit — submit test responses with auto-scoring
  router.post('/assessment/:participantId/submit', async (req: Request, res: Response) => {
    try {
      const { participantId } = req.params;
      const { studyId, instrumentType, testWindow, responses, targetLanguage } = req.body;

      if (!studyId || !instrumentType) {
        return res.status(400).json({ message: 'Missing required fields: studyId, instrumentType' });
      }

      // Auto-score if possible
      let score: number | null = null;
      try {
        // Dynamic import to avoid circular deps
        const { scoreInstrument } = await import('../services/assessment-framework');
        const scoreResult = scoreInstrument(instrumentType, responses || []);
        score = scoreResult.totalScore;
      } catch {
        // Scoring not available for this instrument type — store raw responses
      }

      const evalResponse = await storage.createEvaluationResponse({
        studyId,
        participantId,
        instrumentType,
        testWindow: testWindow || 'post',
        targetLanguage: targetLanguage || undefined,
        responses: responses || [],
        score,
        createdAt: new Date(),
      });

      res.status(201).json(evalResponse);
    } catch (error) {
      console.error('Assessment submit error:', error);
      res.status(500).json({ message: 'Failed to submit assessment' });
    }
  });

  return router;
}

// ============= HELPERS =============

/** Escape a value for CSV output (wrap in quotes if it contains commas, quotes, or newlines) */
function csvEscape(value: string | undefined | null): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}
