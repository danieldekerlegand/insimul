/**
 * Tests for Unity Packages/manifest.json
 *
 * Verifies that the manifest includes glTFast and all required Unity packages
 * for proper GLTF/GLB model import at runtime.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const manifestPath = resolve(
  __dirname,
  '../services/game-export/unity/templates/project/manifest.json',
);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

describe('Unity Packages/manifest.json', () => {
  it('is valid JSON with a dependencies object', () => {
    expect(manifest).toHaveProperty('dependencies');
    expect(typeof manifest.dependencies).toBe('object');
  });

  it('includes com.unity.cloud.gltfast for GLTF/GLB import', () => {
    expect(manifest.dependencies['com.unity.cloud.gltfast']).toBeDefined();
    // Version should be 6.9.1 or higher
    const version = manifest.dependencies['com.unity.cloud.gltfast'];
    const [major, minor] = version.split('.').map(Number);
    expect(major).toBeGreaterThanOrEqual(6);
    if (major === 6) {
      expect(minor).toBeGreaterThanOrEqual(9);
    }
  });

  it('includes com.unity.nuget.newtonsoft-json (glTFast dependency)', () => {
    expect(manifest.dependencies['com.unity.nuget.newtonsoft-json']).toBeDefined();
  });

  it('includes core Unity packages', () => {
    const required = [
      'com.unity.inputsystem',
      'com.unity.cinemachine',
      'com.unity.ai.navigation',
      'com.unity.textmeshpro',
      'com.unity.ugui',
    ];
    for (const pkg of required) {
      expect(manifest.dependencies[pkg]).toBeDefined();
    }
  });

  it('includes required Unity modules', () => {
    const requiredModules = [
      'com.unity.modules.ai',
      'com.unity.modules.animation',
      'com.unity.modules.audio',
      'com.unity.modules.imageconversion',
      'com.unity.modules.jsonserialize',
      'com.unity.modules.physics',
      'com.unity.modules.ui',
      'com.unity.modules.unitywebrequest',
      'com.unity.modules.unitywebrequesttexture',
    ];
    for (const mod of requiredModules) {
      expect(manifest.dependencies[mod]).toBeDefined();
    }
  });

  it('has scopedRegistries for Unity packages', () => {
    expect(manifest.scopedRegistries).toBeDefined();
    expect(Array.isArray(manifest.scopedRegistries)).toBe(true);
    const unityRegistry = manifest.scopedRegistries.find(
      (r: any) => r.url === 'https://packages.unity.com',
    );
    expect(unityRegistry).toBeDefined();
    expect(unityRegistry.scopes).toContain('com.unity');
  });
});
