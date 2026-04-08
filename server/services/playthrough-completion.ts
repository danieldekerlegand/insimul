/**
 * Playthrough Completion Service
 *
 * Handles the completion flow for a playthrough:
 * - Generates a journey summary with stats (playtime, quests, NPCs, etc.)
 * - Compares pre/post CEFR assessment levels for a learning report card
 * - Updates playthrough status to 'completed'
 */

import { storage } from '../db/storage.js';
import { MainQuestProgressionManager } from '../../shared/quests/main-quest-progression.js';
import { mongoQuestStorage } from '../db/mongo-quest-storage.js';
import * as PlaythroughOverlay from './playthrough-overlay.js';

const mainQuestProgressionManager = new MainQuestProgressionManager(mongoQuestStorage, PlaythroughOverlay);
import type { Playthrough } from '@shared/schema.js';
import { PlaythroughQuestOverlay } from '../../shared/game-engine/logic/PlaythroughQuestOverlay.js';
import { isArrivalAssessmentQuest } from '../../shared/quests/assessment-quest-bridge.js';
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
): Promise<JourneySummary> {
  const now = new Date().toISOString();

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
    questsCompleted: 0,
    questsFailed: 0,
    npcsInteracted: 0,
    favoriteNpc: null,
    locationsVisited: 0,
    mostVisitedLocation: null,
    vocabularyLearned: 0,
    achievementsEarned: 0,
    mainQuestChaptersCompleted: chaptersCompleted,
    startedAt: playthrough.startedAt?.toISOString() || playthrough.createdAt?.toISOString() || now,
    completedAt: now,
  };
}

/**
 * Generate a learning report card comparing pre/post assessment CEFR levels.
 * Reads assessment results from quest overlays (save file).
 */
export async function generateLearningReportCard(
  playthrough: Playthrough,
): Promise<LearningReportCard> {
  const overlayResult = await generateReportCardFromQuestOverlays(playthrough);
  if (overlayResult) return overlayResult;

  return {
    startCefrLevel: null,
    endCefrLevel: null,
    improvementLevels: 0,
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
 * Complete a playthrough: update status and generate summary.
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

  const summary = await generateJourneySummary(playthrough);
  const reportCard = await generateLearningReportCard(playthrough);

  const completionBonusXP = 500;

  // Update playthrough status
  await storage.updatePlaythrough(playthroughId, {
    status: 'completed',
    completedAt: new Date(),
  });

  return {
    summary,
    reportCard,
    completionBonusXP,
  };
}
