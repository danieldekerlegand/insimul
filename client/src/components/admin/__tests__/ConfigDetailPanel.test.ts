import { describe, it, expect } from 'vitest';
import type { VisualAsset } from '@shared/schema';

/**
 * Tests for ConfigDetailPanel asset name resolution logic.
 * Verifies that asset dropdowns display human-readable names instead of raw IDs.
 */

// Mirror the getAssetName helper used in ConfigDetailPanel
function getAssetName(assets: Pick<VisualAsset, 'id' | 'name'>[], id: string | undefined): string | null {
  if (!id) return null;
  return assets.find(a => a.id === id)?.name ?? id.slice(0, 12) + '...';
}

const mockAssets: Pick<VisualAsset, 'id' | 'name'>[] = [
  { id: 'asset-abc-123-def-456', name: 'Grass Texture' },
  { id: 'asset-xyz-789-ghi-012', name: 'Stone Floor' },
  { id: 'asset-model-char-001', name: 'Villager Model' },
];

describe('ConfigDetailPanel asset name resolution', () => {
  it('returns asset name when ID matches a known asset', () => {
    expect(getAssetName(mockAssets, 'asset-abc-123-def-456')).toBe('Grass Texture');
    expect(getAssetName(mockAssets, 'asset-xyz-789-ghi-012')).toBe('Stone Floor');
    expect(getAssetName(mockAssets, 'asset-model-char-001')).toBe('Villager Model');
  });

  it('returns truncated ID when asset is not found', () => {
    expect(getAssetName(mockAssets, 'unknown-asset-id-very-long')).toBe('unknown-asse...');
  });

  it('returns null when ID is undefined', () => {
    expect(getAssetName(mockAssets, undefined)).toBeNull();
  });

  it('returns null when ID is empty string', () => {
    // Empty string is falsy, so treated same as undefined
    expect(getAssetName(mockAssets, '')).toBeNull();
  });

  it('handles empty assets array gracefully', () => {
    expect(getAssetName([], 'some-id-12345')).toBe('some-id-1234...');
  });
});
