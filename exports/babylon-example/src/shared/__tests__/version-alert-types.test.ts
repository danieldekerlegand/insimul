import { describe, it, expect } from 'vitest';
import type { VersionAlert, InsertVersionAlert } from '../schema';
import { checkSnapshotCompatibility } from '../world-snapshot-version';

describe('VersionAlert types', () => {
  it('InsertVersionAlert can be constructed from compatibility check', () => {
    const worldVersion = 10;
    const snapshotVersion = 5;
    const compat = checkSnapshotCompatibility(worldVersion, snapshotVersion);

    const insert: InsertVersionAlert = {
      worldId: 'world-1',
      playthroughId: 'pt-1',
      userId: 'user-1',
      worldVersion,
      snapshotVersion,
      versionsBehind: compat.versionsBehind,
      status: compat.status as 'behind' | 'incompatible',
      message: compat.message,
      entityType: 'character',
    };

    expect(insert.versionsBehind).toBe(5);
    expect(insert.status).toBe('behind');
    expect(insert.entityType).toBe('character');
  });

  it('VersionAlert extends InsertVersionAlert with id and metadata', () => {
    const alert: VersionAlert = {
      id: 'alert-1',
      worldId: 'world-1',
      playthroughId: 'pt-1',
      userId: 'user-1',
      worldVersion: 10,
      snapshotVersion: 5,
      versionsBehind: 5,
      status: 'behind',
      message: 'Save is 5 versions behind.',
      dismissed: false,
      createdAt: new Date(),
    };

    expect(alert.id).toBe('alert-1');
    expect(alert.dismissed).toBe(false);
  });

  it('incompatible status is captured when gap exceeds maximum', () => {
    const compat = checkSnapshotCompatibility(100, 1);
    expect(compat.status).toBe('incompatible');

    const insert: InsertVersionAlert = {
      worldId: 'w',
      playthroughId: 'p',
      userId: 'u',
      worldVersion: 100,
      snapshotVersion: 1,
      versionsBehind: compat.versionsBehind,
      status: compat.status as 'behind' | 'incompatible',
      message: compat.message,
    };

    expect(insert.status).toBe('incompatible');
    expect(insert.versionsBehind).toBe(99);
  });

  it('current status does not produce an alert (no behind/incompatible)', () => {
    const compat = checkSnapshotCompatibility(5, 5);
    expect(compat.status).toBe('current');
    // current playthroughs should not generate alerts
    expect(compat.status !== 'behind' && compat.status !== 'incompatible').toBe(true);
  });
});
