import { describe, it, expect } from 'vitest';
import {
  checkSnapshotCompatibility,
  shouldBumpVersion,
  nextVersion,
  MAX_COMPATIBLE_VERSION_GAP,
  VERSION_BUMP_ENTITY_TYPES,
} from '../world-snapshot-version';

describe('checkSnapshotCompatibility', () => {
  it('returns current when versions match', () => {
    const result = checkSnapshotCompatibility(5, 5);
    expect(result.compatible).toBe(true);
    expect(result.status).toBe('current');
    expect(result.versionsBehind).toBe(0);
  });

  it('returns behind when snapshot is older but within gap', () => {
    const result = checkSnapshotCompatibility(10, 7);
    expect(result.compatible).toBe(true);
    expect(result.status).toBe('behind');
    expect(result.versionsBehind).toBe(3);
    expect(result.message).toContain('3 versions behind');
  });

  it('returns behind with singular wording for 1 version behind', () => {
    const result = checkSnapshotCompatibility(2, 1);
    expect(result.compatible).toBe(true);
    expect(result.status).toBe('behind');
    expect(result.message).toContain('1 version behind');
    expect(result.message).not.toContain('1 versions');
  });

  it('returns incompatible when gap exceeds maximum', () => {
    const result = checkSnapshotCompatibility(
      MAX_COMPATIBLE_VERSION_GAP + 2,
      1,
    );
    expect(result.compatible).toBe(false);
    expect(result.status).toBe('incompatible');
    expect(result.versionsBehind).toBe(MAX_COMPATIBLE_VERSION_GAP + 1);
  });

  it('returns incompatible at exactly max + 1 gap', () => {
    const result = checkSnapshotCompatibility(MAX_COMPATIBLE_VERSION_GAP + 2, 1);
    expect(result.compatible).toBe(false);
    expect(result.status).toBe('incompatible');
  });

  it('returns compatible at exactly max gap', () => {
    const result = checkSnapshotCompatibility(MAX_COMPATIBLE_VERSION_GAP + 1, 1);
    expect(result.compatible).toBe(true);
    expect(result.status).toBe('behind');
  });

  it('returns incompatible when snapshot is ahead of world (rollback)', () => {
    const result = checkSnapshotCompatibility(3, 5);
    expect(result.compatible).toBe(false);
    expect(result.status).toBe('incompatible');
    expect(result.versionsBehind).toBe(-2);
    expect(result.message).toContain('rolled back');
  });

  it('handles version 1 defaults', () => {
    const result = checkSnapshotCompatibility(1, 1);
    expect(result.compatible).toBe(true);
    expect(result.status).toBe('current');
  });
});

describe('shouldBumpVersion', () => {
  it('returns true for tracked entity types', () => {
    for (const entityType of VERSION_BUMP_ENTITY_TYPES) {
      expect(shouldBumpVersion(entityType)).toBe(true);
    }
  });

  it('returns false for untracked entity types', () => {
    expect(shouldBumpVersion('user')).toBe(false);
    expect(shouldBumpVersion('playthrough')).toBe(false);
    expect(shouldBumpVersion('grammar')).toBe(false);
    expect(shouldBumpVersion('unknown')).toBe(false);
  });
});

describe('nextVersion', () => {
  it('increments by 1', () => {
    expect(nextVersion(1)).toBe(2);
    expect(nextVersion(42)).toBe(43);
  });
});
