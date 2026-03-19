/**
 * Version Alert Service
 *
 * Generates alerts for active playthroughs when the world version is bumped.
 * Provides helpers for querying and managing version alerts.
 */

import { storage } from '../db/storage';
import { checkSnapshotCompatibility } from '@shared/world-snapshot-version';
import type { VersionAlert } from '@shared/schema';

export interface BumpResult {
  newVersion: number;
  alertsCreated: number;
  alerts: VersionAlert[];
}

/**
 * Bump the world version and create alerts for every active playthrough
 * that is now behind or incompatible.
 */
export async function bumpVersionWithAlerts(
  worldId: string,
  entityType?: string,
): Promise<BumpResult> {
  const newVersion = await storage.bumpWorldVersion(worldId);

  // Find all active playthroughs for this world
  const allPlaythroughs = await storage.getPlaythroughsByWorld(worldId);
  const active = allPlaythroughs.filter(p => p.status === 'active');

  const alerts: VersionAlert[] = [];

  for (const pt of active) {
    const compat = checkSnapshotCompatibility(newVersion, pt.worldSnapshotVersion ?? 1);

    // Only create alerts for playthroughs that are behind or incompatible
    if (compat.status === 'behind' || compat.status === 'incompatible') {
      const alert = await storage.createVersionAlert({
        worldId,
        playthroughId: pt.id,
        userId: pt.userId,
        worldVersion: newVersion,
        snapshotVersion: pt.worldSnapshotVersion ?? 1,
        versionsBehind: compat.versionsBehind,
        status: compat.status,
        message: compat.message,
        entityType,
      });
      alerts.push(alert);
    }
  }

  return { newVersion, alertsCreated: alerts.length, alerts };
}

/**
 * Get undismissed alerts for a user, optionally filtered by world.
 */
export async function getActiveAlertsForUser(
  userId: string,
  worldId?: string,
): Promise<VersionAlert[]> {
  const alerts = await storage.getVersionAlertsByUser(userId, false);
  if (worldId) {
    return alerts.filter(a => a.worldId === worldId);
  }
  return alerts;
}

/**
 * Dismiss all alerts for a playthrough (e.g. after the user syncs their version).
 */
export async function dismissAlertsForPlaythrough(playthroughId: string): Promise<number> {
  return storage.dismissVersionAlertsByPlaythrough(playthroughId);
}
