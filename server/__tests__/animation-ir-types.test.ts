/**
 * Tests for Animation IR types and the buildAnimationIRs population logic.
 */

import { describe, it, expect } from 'vitest';
import { buildAnimationIRs } from '../services/game-export/ir-generator';
import type { AnimationReferenceIR } from '@shared/game-engine/ir-types';

function makeAsset(overrides: Record<string, any> = {}) {
  return {
    id: 'anim-001',
    name: 'idle',
    assetType: 'animation',
    filePath: '/assets/animations/idle.glb',
    tags: ['idle'],
    metadata: {},
    ...overrides,
  };
}

describe('buildAnimationIRs', () => {
  it('filters only animation assets', () => {
    const assets = [
      makeAsset({ id: 'a1', assetType: 'animation' }),
      makeAsset({ id: 'a2', assetType: 'texture' }),
      makeAsset({ id: 'a3', assetType: 'model_3d' }),
      makeAsset({ id: 'a4', assetType: 'sprite_sheet_animation' }),
    ];
    const result = buildAnimationIRs(assets);
    expect(result).toHaveLength(2);
    expect(result.map(r => r.assetRef.id)).toEqual(['a1', 'a4']);
  });

  it('returns empty array when no animation assets exist', () => {
    const assets = [
      makeAsset({ id: 'a1', assetType: 'texture' }),
      makeAsset({ id: 'a2', assetType: 'model' }),
    ];
    expect(buildAnimationIRs(assets)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(buildAnimationIRs([])).toEqual([]);
  });

  it('populates all required AnimationReferenceIR fields', () => {
    const result = buildAnimationIRs([makeAsset()]);
    const anim: AnimationReferenceIR = result[0];

    expect(anim.name).toBe('idle');
    expect(anim.animationType).toBe('idle');
    expect(anim.assetRef.id).toBe('anim-001');
    expect(anim.assetRef.babylonPath).toBe('/assets/animations/idle.glb');
    expect(anim.assetRef.role).toBe('idle');
    expect(anim.assetRef.assetType).toBe('animation');
    expect(anim.assetRef.tags).toEqual(['idle']);
    expect(anim.frameRange).toEqual([0, 1]);
    expect(anim.loop).toBe(true);
    expect(anim.speedRatio).toBe(1.0);
    expect(anim.format).toBe('glb');
    expect(anim.skeletonType).toBe('humanoid');
    expect(anim.isMixamo).toBe(false);
  });

  it('reads animationType from metadata first', () => {
    const asset = makeAsset({
      tags: ['walk'],
      metadata: { animationType: 'run' },
    });
    const result = buildAnimationIRs([asset]);
    expect(result[0].animationType).toBe('run');
  });

  it('falls back to tag-based animationType when metadata lacks it', () => {
    const asset = makeAsset({
      tags: ['walk', 'locomotion'],
      metadata: {},
    });
    const result = buildAnimationIRs([asset]);
    expect(result[0].animationType).toBe('walk');
  });

  it('defaults animationType to idle when no match found', () => {
    const asset = makeAsset({
      tags: ['custom_anim'],
      metadata: {},
    });
    const result = buildAnimationIRs([asset]);
    expect(result[0].animationType).toBe('idle');
  });

  it('detects format from file extension', () => {
    const cases: [string, string][] = [
      ['/path/to/anim.glb', 'glb'],
      ['/path/to/anim.gltf', 'gltf'],
      ['/path/to/anim.babylon', 'babylon'],
      ['/path/to/anim.fbx', 'glb'], // unsupported ext defaults to glb
      ['/path/to/anim.GLB', 'glb'], // case insensitive
    ];

    for (const [filePath, expectedFormat] of cases) {
      const result = buildAnimationIRs([makeAsset({ filePath })]);
      expect(result[0].format).toBe(expectedFormat);
    }
  });

  it('defaults format to glb when filePath is empty', () => {
    const result = buildAnimationIRs([makeAsset({ filePath: '' })]);
    expect(result[0].format).toBe('glb');
  });

  it('uses metadata for speedRatio, skeletonType, isMixamo, frameRange', () => {
    const asset = makeAsset({
      metadata: {
        speedRatio: 1.5,
        skeletonType: 'mixamo',
        isMixamo: true,
        frameRange: [10, 50],
      },
    });
    const result = buildAnimationIRs([asset]);
    expect(result[0].speedRatio).toBe(1.5);
    expect(result[0].skeletonType).toBe('mixamo');
    expect(result[0].isMixamo).toBe(true);
    expect(result[0].frameRange).toEqual([10, 50]);
  });

  it('sets loop=true for looping animation types', () => {
    const loopingTypes = ['idle', 'walk', 'run', 'talk', 'listen', 'work', 'sit', 'eat', 'sleep'];
    for (const type of loopingTypes) {
      const asset = makeAsset({ metadata: { animationType: type } });
      const result = buildAnimationIRs([asset]);
      expect(result[0].loop).toBe(true);
    }
  });

  it('sets loop=false for non-looping animation types (wave)', () => {
    const asset = makeAsset({ metadata: { animationType: 'wave' } });
    const result = buildAnimationIRs([asset]);
    expect(result[0].loop).toBe(false);
  });

  it('respects explicit loop override from metadata', () => {
    const asset = makeAsset({
      metadata: { animationType: 'idle', loop: false },
    });
    const result = buildAnimationIRs([asset]);
    expect(result[0].loop).toBe(false);

    const asset2 = makeAsset({
      metadata: { animationType: 'wave', loop: true },
    });
    const result2 = buildAnimationIRs([asset2]);
    expect(result2[0].loop).toBe(true);
  });

  it('uses asset name as animation name', () => {
    const asset = makeAsset({ name: 'Walking Forward' });
    const result = buildAnimationIRs([asset]);
    expect(result[0].name).toBe('Walking Forward');
  });

  it('falls back to animationType for name when name is empty', () => {
    const asset = makeAsset({ name: '', metadata: { animationType: 'run' } });
    const result = buildAnimationIRs([asset]);
    expect(result[0].name).toBe('run');
  });

  it('handles assets with null/undefined tags and metadata', () => {
    const asset = {
      id: 'a1',
      name: 'test',
      assetType: 'animation',
      filePath: '/anim.glb',
      tags: null,
      metadata: null,
    };
    const result = buildAnimationIRs([asset]);
    expect(result).toHaveLength(1);
    expect(result[0].animationType).toBe('idle');
    expect(result[0].assetRef.role).toBe('animation');
    expect(result[0].assetRef.tags).toEqual([]);
  });

  it('processes multiple animation assets correctly', () => {
    const assets = [
      makeAsset({ id: 'a1', name: 'idle', metadata: { animationType: 'idle' } }),
      makeAsset({ id: 'a2', name: 'walk', filePath: '/walk.gltf', metadata: { animationType: 'walk', speedRatio: 1.2 } }),
      makeAsset({ id: 'a3', name: 'wave', metadata: { animationType: 'wave', isMixamo: true } }),
    ];
    const result = buildAnimationIRs(assets);
    expect(result).toHaveLength(3);
    expect(result[0].animationType).toBe('idle');
    expect(result[0].loop).toBe(true);
    expect(result[1].animationType).toBe('walk');
    expect(result[1].format).toBe('gltf');
    expect(result[1].speedRatio).toBe(1.2);
    expect(result[2].animationType).toBe('wave');
    expect(result[2].loop).toBe(false);
    expect(result[2].isMixamo).toBe(true);
  });
});
