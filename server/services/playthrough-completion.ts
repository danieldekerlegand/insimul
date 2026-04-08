/**
 * Playthrough Completion Service
 *
 * Handles the completion flow for a playthrough:
 * - Generates a journey summary with stats (playtime, quests, NPCs, vocabulary, etc.)
 * - Compares pre/post CEFR assessment levels for a learning report card
 * - Updates playthrough status to 'completed'
 * - Records a play trace for the completion event
 */

import { storage } from '../db/storage.js';
import { MainQuestProgressionManager } from '../../shared/quests/main-quest-progression.js';
import { mongoQuestStorage } from '../db/mongo-quest-storage.js';
import * as PlaythroughOverlay from './playthrough-overlay.js';

const mainQuestProgressionManager = new MainQuestProgressionManager(mongoQuestStorage, PlaythroughOverlay);
import type { Playthrough, PlayTrace } from '@shared/schema.js';
import type { MainQuestState } from '@shared/quest/main-quest-chapters.js';
import { PlaythroughQuestOverlay } from '../../shared/game-engine/logic/PlaythroughQuestOverlay.js';
import { isArrivalAssessmentQuest } from '../../shared/services/assessment-quest-bridge-shared.js';
import {
  extractOverlayAssessmentData,
  generateReportCardFromOverlays,
} from '../../shared/quests/assessment-quest-bridge.js';

export interface JourneySummary {
  playthroughId: string;
  playtime: number; // seconds
  actionsCount: number;
  decisionsCount: number;
  questsCompleted: number;
  questsFailed: number;
  npcsInteracted: number;
  favoriteNpc: { id: string; name: string; interactionCount: number } | null;
  locationsVisited: number;
  mostVisitedLocation: { id: string; name: string; visitCount: number } | null;
  vocabularyLearned: number;
  achievementsEarned: number;
  mainQuestChaptersCompleted: number;
  startedAt: string;
  completedAt: string;
}

export interface LearningReportCard {
  startCefrLevel: string | null;
  endCefrLevel: string | null;
  improvementLevels: number;
}

export interface PlaythroughCompletionResult {
  summary: JourneySummary;
  reportCard: LearningReportCard;
  completionBonusXP: number;
}

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2'];

function cefrIndex(level: string | null): number {
  if (!level) return -1;
  return CEFR_ORDER.indexOf(level);
}

/**
 * Generate a journey summary from playthrough data.
 */
export async function generateJourneySummary(
  playthrough: Playthrough,
  traces: PlayTrace[],
): Promise<JourneySummary> {
  const now = new Date().toISOString();

  // Count quests completed/failed from traces
  const questCompletedTraces = traces.filter(t => t.actionType === 'quest_completed' || t.actionType === 'quest_complete');
  const questFailedTraces = traces.filter(t => t.actionType === 'quest_failed' || t.actionType === 'quest_fail');

  // Count unique NPCs interacted with
  const npcInteractions = new Map<string, { name: string; count: number }>();
  for (const trace of traces) {
    if (trace.actionType === 'npc_talked' || trace.actionType === 'dialogue' || trace.actionType === 'conversation') {
      const npcId = trace.targetId || (trace.actionData as any)?.npcId;
      const npcName = (trace.actionData as any)?.npcName || trace.targetType || 'Unknown';
      if (npcId) {
        const existing = npcInteractions.get(npcId) || { name: npcName, count: 0 };
        existing.count++;
        npcInteractions.set(npcId, existing);
      }
    }
  }

  // Find favorite NPC
  let favoriteNpc: JourneySummary['favoriteNpc'] = null;
  let maxInteractions = 0;
  npcInteractions.forEach((data, id) => {
    if (data.count > maxInteractions) {
      maxInteractions = data.count;
      favoriteNpc = { id, name: data.name, interactionCount: data.count };
    }
  });

  // Count unique locations visited
  const locationVisits = new Map<string, { name: string; count: number }>();
  for (const trace of traces) {
    if (trace.actionType === 'location_visited' || trace.actionType === 'settlement_entered') {
      const locId = trace.targetId || (trace.actionData as any)?.locationId;
      const locName = (trace.actionData as any)?.locationName || trace.targetType || 'Unknown';
      if (locId) {
        const existing = locationVisits.get(locId) || { name: locName, count: 0 };
        existing.count++;
        locationVisits.set(locId, existing);
      }
    }
  }

  // Find most visited location
  let mostVisitedLocation: JourneySummary['mostVisitedLocation'] = null;
  let maxVisits = 0;
  locationVisits.forEach((data, id) => {
    if (data.count > maxVisits) {
      maxVisits = data.count;
      mostVisitedLocation = { id, name: data.name, visitCount: data.count };
    }
  });

  // Count vocabulary learned from traces
  const vocabWords = new Set<string>();
  for (const trace of traces) {
    if (trace.actionType === 'vocabulary_used' || trace.actionType === 'object_examined' || trace.actionType === 'object_named') {
      const word = (trace.actionData as any)?.word || (trace.actionData as any)?.targetWord;
      if (word) vocabWords.add(word);
    }
  }

  // Count achievements
  const achievementTraces = traces.filter(t => t.actionType === 'achievement_unlocked');

  // Main quest chapters completed
  let chaptersCompleted = 0;
  if (playthrough.playerCharacterId) {
    try {
      const state = await mainQuestProgressionManager.getMainQuestState(
        playthrough.worldId,
        playthrough.playerCharacterId,
      );
      chaptersCompleted = state.chapters.filter(c => c.status === 'completed').length;
    } catch {
      // If main quest state can't be fetched, default to 0
    }
  }

  return {
    playthroughId: playthrough.id,
    playtime: playthrough.playtime || 0,
    actionsCount: playthrough.actionsCount || 0,
    decisionsCount: playthrough.decisionsCount || 0,
    questsCompleted: questCompletedTraces.length,
    questsFailed: questFailedTraces.length,
    npcsInteracted: npcInteractions.size,
    favoriteNpc,
    locationsVisited: locationVisits.size,
    mostVisitedLocation,
    vocabularyLearned: vocabWords.size,
    achievementsEarned: achievementTraces.length,
    mainQuestChaptersCompleted: chaptersCompleted,
    startedAt: playthrough.startedAt?.toISOString() || playthrough.createdAt?.toISOString() || now,
    completedAt: now,
  };
}

/**
 * Generate a learning report card comparing pre/post assessment CEFR levels.
 * Reads assessment results from quest overlays (save file) first, falling back
 * to play traces if no quest overlay data is available.
 */
export async function generateLearningReportCard(
  playthrough: Playthrough,
  traces: PlayTrace[],
): Promise<LearningReportCard> {
  // Try to read from quest overlays first (new flow)
  const overlayResult = await generateReportCardFromQuestOverlays(playthrough);
  if (overlayResult) return overlayResult;

  // Fallback: read from play traces (legacy flow)
  const assessmentTraces = traces.filter(t =>
    t.actionType === 'assessment_completed' ||
    t.actionType === 'assessment_result'
  );

  let startCefrLevel: string | null = null;
  let endCefrLevel: string | null = null;

  if (assessmentTraces.length > 0) {
    // Sort by timestamp to get earliest and latest
    const sorted = [...assessmentTraces].sort((a, b) => {
      const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return ta - tb;
    });

    startCefrLevel = (sorted[0].actionData as any)?.cefrLevel ||
                     (sorted[0].outcomeData as any)?.cefrLevel || null;
    endCefrLevel = (sorted[sorted.length - 1].actionData as any)?.cefrLevel ||
                   (sorted[sorted.length - 1].outcomeData as any)?.cefrLevel || null;
  }

  const improvement = cefrIndex(endCefrLevel) - cefrIndex(startCefrLevel);

  return {
    startCefrLevel,
    endCefrLevel,
    improvementLevels: Math.max(0, improvement),
  };
}

/**
 * Read assessment results from quest overlays and generate a report card.
 * Returns null if quest overlay data is not available.
 */
async function generateReportCardFromQuestOverlays(
  playthrough: Playthrough,
): Promise<LearningReportCard | null> {
  const saveData = playthrough.saveData as Record<string, any> | null;
  const questProgressData = saveData?.questProgress;
  if (!questProgressData) return null;

  // Get base world quests
  const baseQuests = await storage.getQuestsByWorld(playthrough.worldId);

  // Deserialize quest overlay and merge with base quests
  const overlay = new PlaythroughQuestOverlay();
  overlay.deserialize(questProgressData);
  const mergedQuests = overlay.mergeQuests(baseQuests);

  // Find arrival and departure assessment quests
  const arrivalQuest = mergedQuests.find((q: any) => isArrivalAssessmentQuest(q));
  const departureQuest = mergedQuests.find((q: any) => {
    const tags = q.tags;
    return Array.isArray(tags) && tags.includes('assessment') && tags.includes('departure');
  });

  if (!arrivalQuest || !departureQuest) return null;

  // Extract overlay assessment data
  const arrivalData = extractOverlayAssessmentData(arrivalQuest);
  const departureData = extractOverlayAssessmentData(departureQuest);

  if (!arrivalData || !departureData) return null;

  // Find periodic assessment quests
  const periodicQuests = mergedQuests.filter((q: any) => {
    const tags = q.tags;
    return Array.isArray(tags) && tags.includes('assessment') && tags.includes('periodic');
  });
  const periodicData = periodicQuests
    .map((q: any) => extractOverlayAssessmentData(q))
    .filter((d): d is NonNullable<typeof d> => d !== null);

  // Generate the detailed report card
  const detailedReport = generateReportCardFromOverlays({
    playerId: playthrough.userId,
    worldId: playthrough.worldId,
    arrivalData,
    departureData,
    periodicData,
  });

  // Map to the simple LearningReportCard format used by playthrough completion
  return {
    startCefrLevel: detailedReport.arrivalCefrLevel,
    endCefrLevel: detailedReport.departureCefrLevel,
    improvementLevels: detailedReport.cefrImproved
      ? cefrIndex(detailedReport.departureCefrLevel) - cefrIndex(detailedReport.arrivalCefrLevel)
      : 0,
  };
}

/**
 * Complete a playthrough: update status, generate summary, record trace.
 */
export async function completePlaythrough(
  playthroughId: string,
  userId: string,
): Promise<PlaythroughCompletionResult> {
  const playthrough = await storage.getPlaythrough(playthroughId);
  if (!playthrough) {
    throw new Error('Playthrough not found');
  }
  if (playthrough.userId !== userId) {
    throw new Error('Not your playthrough');
  }
  if (playthrough.status === 'completed') {
    throw new Error('Playthrough already completed');
  }

  const traces = await storage.getTracesByPlaythrough(playthroughId);
  const summary = await generateJourneySummary(playthrough, traces);
  const reportCard = await generateLearningReportCard(playthrough, traces);

  const completionBonusXP = 500;

  // Update playthrough status
  await storage.updatePlaythrough(playthroughId, {
    status: 'completed',
    completedAt: new Date(),
  });

  // Record completion trace
  await storage.createPlayTrace({
    playthroughId,
    userId,
    actionType: 'playthrough_completed',
    actionName: 'Playthrough Completed',
    actionData: {
      summary,
      reportCard,
      completionBonusXP,
    },
    timestep: playthrough.currentTimestep || 0,
    outcome: 'success',
  });

  return {
    summary,
    reportCard,
    completionBonusXP,
  };
}
