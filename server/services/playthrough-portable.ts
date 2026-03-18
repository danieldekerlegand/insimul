import { storage } from '../db/storage';
import { getPlaythroughReputations } from './reputation-service';
import type {
  Playthrough,
  PlaythroughDelta,
  PlayTrace,
  Reputation,
  InsertPlaythrough,
  InsertPlaythroughDelta,
  InsertPlayTrace,
  InsertReputation,
} from '@shared/schema';
import { db } from '../db';
import { reputations } from '@shared/schema';
import crypto from 'crypto';

export const PORTABLE_SAVE_VERSION = 1;

export interface PortableSave {
  version: number;
  exportedAt: string;
  sourceWorldId: string;
  sourceWorldSnapshotVersion: number;
  checksum: string;
  playthrough: Omit<Playthrough, 'id' | 'userId'>;
  deltas: Omit<PlaythroughDelta, 'id' | 'playthroughId'>[];
  traces: Omit<PlayTrace, 'id' | 'playthroughId' | 'userId'>[];
  reputations: Omit<Reputation, 'id' | 'playthroughId' | 'userId'>[];
}

function computeChecksum(data: Omit<PortableSave, 'checksum'>): string {
  const json = JSON.stringify({
    version: data.version,
    exportedAt: data.exportedAt,
    sourceWorldId: data.sourceWorldId,
    playthrough: data.playthrough,
    deltas: data.deltas,
    traces: data.traces,
    reputations: data.reputations,
  });
  return crypto.createHash('sha256').update(json).digest('hex').slice(0, 16);
}

/**
 * Export a playthrough to a portable save format.
 * Strips user-specific IDs so the save can be imported by any user.
 */
export async function exportPlaythrough(
  playthroughId: string,
  options: { includeTraces?: boolean } = {}
): Promise<PortableSave> {
  const playthrough = await storage.getPlaythrough(playthroughId);
  if (!playthrough) {
    throw new Error('Playthrough not found');
  }

  const [deltas, traces, reps] = await Promise.all([
    storage.getDeltasByPlaythrough(playthroughId),
    options.includeTraces !== false
      ? storage.getTracesByPlaythrough(playthroughId)
      : Promise.resolve([]),
    getPlaythroughReputations(playthroughId),
  ]);

  // Strip IDs for portability
  const { id: _pid, userId: _uid, ...playthroughData } = playthrough;

  const portableDeltas = deltas.map(({ id, playthroughId: _ptId, ...rest }) => rest);
  const portableTraces = traces.map(({ id, playthroughId: _ptId, userId: _uId, ...rest }) => rest);
  const portableReps = reps.map(({ id, playthroughId: _ptId, userId: _uId, ...rest }) => rest);

  const partial: Omit<PortableSave, 'checksum'> = {
    version: PORTABLE_SAVE_VERSION,
    exportedAt: new Date().toISOString(),
    sourceWorldId: playthrough.worldId,
    sourceWorldSnapshotVersion: playthrough.worldSnapshotVersion,
    playthrough: playthroughData,
    deltas: portableDeltas,
    traces: portableTraces,
    reputations: portableReps,
  };

  return {
    ...partial,
    checksum: computeChecksum(partial),
  };
}

/**
 * Validate a portable save file structure.
 * Returns an error message if invalid, null if valid.
 */
export function validatePortableSave(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return 'Invalid save data: not an object';
  }

  const save = data as Record<string, unknown>;

  if (save.version !== PORTABLE_SAVE_VERSION) {
    return `Unsupported save version: ${save.version} (expected ${PORTABLE_SAVE_VERSION})`;
  }

  if (typeof save.exportedAt !== 'string') {
    return 'Missing or invalid exportedAt timestamp';
  }

  if (typeof save.sourceWorldId !== 'string') {
    return 'Missing or invalid sourceWorldId';
  }

  if (!save.playthrough || typeof save.playthrough !== 'object') {
    return 'Missing or invalid playthrough data';
  }

  if (!Array.isArray(save.deltas)) {
    return 'Missing or invalid deltas array';
  }

  if (!Array.isArray(save.traces)) {
    return 'Missing or invalid traces array';
  }

  if (!Array.isArray(save.reputations)) {
    return 'Missing or invalid reputations array';
  }

  if (typeof save.checksum !== 'string') {
    return 'Missing checksum';
  }

  // Verify checksum
  const { checksum, ...rest } = save as unknown as PortableSave;
  const expected = computeChecksum(rest);
  if (checksum !== expected) {
    return 'Checksum mismatch: save file may be corrupted or tampered with';
  }

  return null;
}

/**
 * Import a portable save into a target world for a specific user.
 * Creates a new playthrough with all associated data.
 */
export async function importPlaythrough(
  saveData: PortableSave,
  userId: string,
  targetWorldId: string
): Promise<Playthrough> {
  // Verify target world exists
  const world = await storage.getWorld(targetWorldId);
  if (!world) {
    throw new Error('Target world not found');
  }

  // Create the playthrough
  const newPlaythrough = await storage.createPlaythrough({
    userId,
    worldId: targetWorldId,
    worldSnapshotVersion: world.version || 1,
    name: saveData.playthrough.name
      ? `${saveData.playthrough.name} (imported)`
      : 'Imported Playthrough',
    description: saveData.playthrough.description,
    notes: saveData.playthrough.notes,
    status: saveData.playthrough.status || 'paused',
    currentTimestep: saveData.playthrough.currentTimestep || 0,
    playtime: saveData.playthrough.playtime || 0,
    actionsCount: saveData.playthrough.actionsCount || 0,
    decisionsCount: saveData.playthrough.decisionsCount || 0,
    playerCharacterId: saveData.playthrough.playerCharacterId,
    saveData: saveData.playthrough.saveData || {},
  });

  // Import deltas
  for (const delta of saveData.deltas) {
    await storage.createPlaythroughDelta({
      playthroughId: newPlaythrough.id,
      entityType: delta.entityType,
      entityId: delta.entityId,
      operation: delta.operation,
      deltaData: delta.deltaData,
      fullData: delta.fullData,
      timestep: delta.timestep,
      description: delta.description,
      tags: delta.tags,
    });
  }

  // Import traces
  for (const trace of saveData.traces) {
    await storage.createPlayTrace({
      playthroughId: newPlaythrough.id,
      userId,
      actionType: trace.actionType,
      actionName: trace.actionName,
      actionData: trace.actionData,
      timestep: trace.timestep,
      characterId: trace.characterId,
      targetId: trace.targetId,
      targetType: trace.targetType,
      locationId: trace.locationId,
      outcome: trace.outcome,
      outcomeData: trace.outcomeData,
      stateChanges: trace.stateChanges,
      narrativeText: trace.narrativeText,
      durationMs: trace.durationMs,
    });
  }

  // Import reputations
  for (const rep of saveData.reputations) {
    await db.insert(reputations).values({
      id: crypto.randomUUID(),
      playthroughId: newPlaythrough.id,
      userId,
      entityType: rep.entityType,
      entityId: rep.entityId,
      score: rep.score,
      violationCount: rep.violationCount,
      warningCount: rep.warningCount,
      lastViolation: rep.lastViolation,
      violationHistory: rep.violationHistory,
      standing: rep.standing,
      isBanned: rep.isBanned,
      banExpiry: rep.banExpiry,
      totalFinesPaid: rep.totalFinesPaid,
      outstandingFines: rep.outstandingFines,
      hasDiscounts: rep.hasDiscounts,
      hasSpecialAccess: rep.hasSpecialAccess,
      notes: rep.notes,
      tags: rep.tags,
    });
  }

  return newPlaythrough;
}
