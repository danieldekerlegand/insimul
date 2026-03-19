import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted, so use vi.hoisted to create the mocks
const mockStorage = vi.hoisted(() => ({
  bumpWorldVersion: vi.fn(),
  getPlaythroughsByWorld: vi.fn(),
  createVersionAlert: vi.fn(),
  getVersionAlertsByUser: vi.fn(),
  dismissVersionAlertsByPlaythrough: vi.fn(),
}));

vi.mock('../db/storage', () => ({
  storage: mockStorage,
}));

import {
  bumpVersionWithAlerts,
  getActiveAlertsForUser,
  dismissAlertsForPlaythrough,
} from '../services/version-alert-service';

describe('version-alert-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('bumpVersionWithAlerts', () => {
    it('bumps version and creates alerts for active playthroughs that are behind', async () => {
      mockStorage.bumpWorldVersion.mockResolvedValue(5);
      mockStorage.getPlaythroughsByWorld.mockResolvedValue([
        { id: 'pt-1', userId: 'u1', worldId: 'w1', worldSnapshotVersion: 3, status: 'active' },
        { id: 'pt-2', userId: 'u2', worldId: 'w1', worldSnapshotVersion: 4, status: 'active' },
      ]);

      let alertCounter = 0;
      mockStorage.createVersionAlert.mockImplementation(async (alert: any) => ({
        ...alert,
        id: `alert-${++alertCounter}`,
        dismissed: false,
        createdAt: new Date(),
      }));

      const result = await bumpVersionWithAlerts('w1', 'character');

      expect(result.newVersion).toBe(5);
      expect(result.alertsCreated).toBe(2);
      expect(result.alerts).toHaveLength(2);

      // First playthrough is 2 behind
      expect(mockStorage.createVersionAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          worldId: 'w1',
          playthroughId: 'pt-1',
          userId: 'u1',
          worldVersion: 5,
          snapshotVersion: 3,
          versionsBehind: 2,
          status: 'behind',
          entityType: 'character',
        }),
      );

      // Second playthrough is 1 behind
      expect(mockStorage.createVersionAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          playthroughId: 'pt-2',
          versionsBehind: 1,
          status: 'behind',
        }),
      );
    });

    it('skips completed/paused/abandoned playthroughs', async () => {
      mockStorage.bumpWorldVersion.mockResolvedValue(3);
      mockStorage.getPlaythroughsByWorld.mockResolvedValue([
        { id: 'pt-1', userId: 'u1', worldId: 'w1', worldSnapshotVersion: 1, status: 'completed' },
        { id: 'pt-2', userId: 'u2', worldId: 'w1', worldSnapshotVersion: 1, status: 'paused' },
        { id: 'pt-3', userId: 'u3', worldId: 'w1', worldSnapshotVersion: 1, status: 'abandoned' },
      ]);

      const result = await bumpVersionWithAlerts('w1');

      expect(result.alertsCreated).toBe(0);
      expect(mockStorage.createVersionAlert).not.toHaveBeenCalled();
    });

    it('does not create alerts for up-to-date playthroughs', async () => {
      mockStorage.bumpWorldVersion.mockResolvedValue(5);
      mockStorage.getPlaythroughsByWorld.mockResolvedValue([
        { id: 'pt-1', userId: 'u1', worldId: 'w1', worldSnapshotVersion: 5, status: 'active' },
      ]);

      const result = await bumpVersionWithAlerts('w1');

      expect(result.alertsCreated).toBe(0);
    });

    it('creates incompatible alert when gap exceeds max', async () => {
      mockStorage.bumpWorldVersion.mockResolvedValue(100);
      mockStorage.getPlaythroughsByWorld.mockResolvedValue([
        { id: 'pt-1', userId: 'u1', worldId: 'w1', worldSnapshotVersion: 1, status: 'active' },
      ]);

      mockStorage.createVersionAlert.mockImplementation(async (alert: any) => ({
        ...alert,
        id: 'alert-1',
        dismissed: false,
        createdAt: new Date(),
      }));

      const result = await bumpVersionWithAlerts('w1');

      expect(result.alertsCreated).toBe(1);
      expect(mockStorage.createVersionAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'incompatible',
          versionsBehind: 99,
        }),
      );
    });

    it('handles no active playthroughs gracefully', async () => {
      mockStorage.bumpWorldVersion.mockResolvedValue(2);
      mockStorage.getPlaythroughsByWorld.mockResolvedValue([]);

      const result = await bumpVersionWithAlerts('w1');

      expect(result.newVersion).toBe(2);
      expect(result.alertsCreated).toBe(0);
      expect(result.alerts).toEqual([]);
    });

    it('passes entityType through to alerts', async () => {
      mockStorage.bumpWorldVersion.mockResolvedValue(3);
      mockStorage.getPlaythroughsByWorld.mockResolvedValue([
        { id: 'pt-1', userId: 'u1', worldId: 'w1', worldSnapshotVersion: 1, status: 'active' },
      ]);
      mockStorage.createVersionAlert.mockImplementation(async (alert: any) => ({
        ...alert,
        id: 'a1',
        dismissed: false,
        createdAt: new Date(),
      }));

      await bumpVersionWithAlerts('w1', 'settlement');

      expect(mockStorage.createVersionAlert).toHaveBeenCalledWith(
        expect.objectContaining({ entityType: 'settlement' }),
      );
    });
  });

  describe('getActiveAlertsForUser', () => {
    it('returns undismissed alerts for a user', async () => {
      const alerts = [
        { id: 'a1', worldId: 'w1', userId: 'u1', dismissed: false },
        { id: 'a2', worldId: 'w2', userId: 'u1', dismissed: false },
      ];
      mockStorage.getVersionAlertsByUser.mockResolvedValue(alerts);

      const result = await getActiveAlertsForUser('u1');

      expect(result).toHaveLength(2);
      expect(mockStorage.getVersionAlertsByUser).toHaveBeenCalledWith('u1', false);
    });

    it('filters by worldId when provided', async () => {
      const alerts = [
        { id: 'a1', worldId: 'w1', userId: 'u1', dismissed: false },
        { id: 'a2', worldId: 'w2', userId: 'u1', dismissed: false },
      ];
      mockStorage.getVersionAlertsByUser.mockResolvedValue(alerts);

      const result = await getActiveAlertsForUser('u1', 'w1');

      expect(result).toHaveLength(1);
      expect(result[0].worldId).toBe('w1');
    });
  });

  describe('dismissAlertsForPlaythrough', () => {
    it('delegates to storage', async () => {
      mockStorage.dismissVersionAlertsByPlaythrough.mockResolvedValue(3);

      const count = await dismissAlertsForPlaythrough('pt-1');

      expect(count).toBe(3);
      expect(mockStorage.dismissVersionAlertsByPlaythrough).toHaveBeenCalledWith('pt-1');
    });
  });
});
