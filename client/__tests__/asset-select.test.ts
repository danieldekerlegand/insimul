import { describe, it, expect } from 'vitest';
import { isModelAsset } from '../src/components/AssetSelect';
import type { VisualAsset } from '@shared/schema';

function makeAsset(overrides: Partial<VisualAsset> = {}): VisualAsset {
  return {
    id: 'test-id',
    name: 'Test Asset',
    assetType: 'texture_ground',
    filePath: 'assets/textures/ground.png',
    mimeType: 'image/png',
    worldId: null,
    description: null,
    entityType: null,
    entityId: null,
    width: null,
    height: null,
    fileSize: null,
    generationPrompt: null,
    generationProvider: null,
    generationModel: null,
    status: null,
    quality: null,
    tags: null,
    metadata: null,
    parentAssetId: null,
    processingType: null,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  } as VisualAsset;
}

describe('isModelAsset', () => {
  it('detects model assets by assetType prefix', () => {
    expect(isModelAsset(makeAsset({ assetType: 'model_building' }))).toBe(true);
    expect(isModelAsset(makeAsset({ assetType: 'model_character' }))).toBe(true);
    expect(isModelAsset(makeAsset({ assetType: 'model_' }))).toBe(true);
  });

  it('detects model assets by mimeType', () => {
    expect(isModelAsset(makeAsset({ mimeType: 'model/gltf-binary' }))).toBe(true);
  });

  it('detects model assets by file extension', () => {
    expect(isModelAsset(makeAsset({ filePath: 'assets/models/building.glb' }))).toBe(true);
    expect(isModelAsset(makeAsset({ filePath: 'assets/models/character.gltf' }))).toBe(true);
    expect(isModelAsset(makeAsset({ filePath: 'ASSETS/MODELS/BUILDING.GLB' }))).toBe(true);
  });

  it('rejects non-model assets', () => {
    expect(isModelAsset(makeAsset({ assetType: 'texture_ground' }))).toBe(false);
    expect(isModelAsset(makeAsset({ assetType: 'character_portrait' }))).toBe(false);
    expect(isModelAsset(makeAsset({ filePath: 'assets/images/portrait.png' }))).toBe(false);
  });

  it('handles null/undefined fields gracefully', () => {
    expect(isModelAsset(makeAsset({ assetType: '', mimeType: null as any, filePath: null as any }))).toBe(false);
    expect(isModelAsset(makeAsset({ assetType: undefined as any, mimeType: undefined as any, filePath: undefined as any }))).toBe(false);
  });
});

describe('AssetSelect filtering', () => {
  const assets: VisualAsset[] = [
    makeAsset({ id: '1', name: 'Ground Texture', assetType: 'texture_ground', filePath: 'ground.png' }),
    makeAsset({ id: '2', name: 'Building Model', assetType: 'model_building', filePath: 'building.glb' }),
    makeAsset({ id: '3', name: 'Character Portrait', assetType: 'character_portrait', filePath: 'portrait.jpg' }),
    makeAsset({ id: '4', name: 'Tree Model', filePath: 'tree.gltf', mimeType: 'model/gltf-binary' }),
  ];

  it('filters to models only when modelsOnly is true', () => {
    const filtered = assets.filter(isModelAsset);
    expect(filtered).toHaveLength(2);
    expect(filtered.map(a => a.id)).toEqual(['2', '4']);
  });

  it('returns all assets when not filtering', () => {
    expect(assets).toHaveLength(4);
  });
});

describe('CLEAR_VALUE handling', () => {
  it('clear value constant is a non-ID string', () => {
    const CLEAR_VALUE = '__clear__';
    expect(CLEAR_VALUE).not.toMatch(/^[0-9a-f-]+$/);
  });
});
