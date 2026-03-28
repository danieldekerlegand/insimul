import { describe, it, expect } from 'vitest';
import type { AssetCollectionSnapshot } from '../game-engine/asset-pipeline';

describe('AssetCollectionSnapshot exterior texture fields', () => {
  function makeSnapshot(overrides: Partial<AssetCollectionSnapshot> = {}): AssetCollectionSnapshot {
    return {
      buildingModels: {},
      natureModels: {},
      characterModels: {},
      objectModels: {},
      playerModels: {},
      questObjectModels: {},
      groundTextureId: null,
      roadTextureId: null,
      wallTextureId: null,
      roofTextureId: null,
      audioAssets: {},
      unrealAssets: { textures: {}, materials: {}, models: {} },
      unityAssets: { textures: {}, materials: {}, models: {} },
      godotAssets: { textures: {}, materials: {}, models: {} },
      modelScaling: {},
      proceduralBuildings: null,
      buildingTypeConfigs: null,
      categoryPresets: null,
      npcConfig: null,
      ...overrides,
    };
  }

  it('snapshot includes wallTextureId field', () => {
    const snapshot = makeSnapshot({ wallTextureId: 'stone-wall-tex' });
    expect(snapshot.wallTextureId).toBe('stone-wall-tex');
  });

  it('snapshot includes roofTextureId field', () => {
    const snapshot = makeSnapshot({ roofTextureId: 'thatch-roof-tex' });
    expect(snapshot.roofTextureId).toBe('thatch-roof-tex');
  });

  it('snapshot defaults exterior textures to null', () => {
    const snapshot = makeSnapshot();
    expect(snapshot.wallTextureId).toBeNull();
    expect(snapshot.roofTextureId).toBeNull();
  });

  it('all four texture fields can be set independently', () => {
    const snapshot = makeSnapshot({
      groundTextureId: 'ground-1',
      roadTextureId: 'road-1',
      wallTextureId: 'wall-1',
      roofTextureId: 'roof-1',
    });
    expect(snapshot.groundTextureId).toBe('ground-1');
    expect(snapshot.roadTextureId).toBe('road-1');
    expect(snapshot.wallTextureId).toBe('wall-1');
    expect(snapshot.roofTextureId).toBe('roof-1');
  });
});
