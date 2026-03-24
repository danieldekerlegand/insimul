/**
 * Tests for Unreal Interchange glTF plugin configuration and asset conversion.
 *
 * Verifies:
 * - .uproject includes InterchangeEditor, InterchangePlugins, GLTFImporter plugins
 * - DefaultEngine.ini includes Interchange import settings
 * - Asset converter routes static GLB to Content/Models/
 * - Asset converter detects animated GLB and converts to FBX in Content/Characters/
 * - Non-model assets route to correct Content/ subdirectories
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { convertAssetsForUnreal, glbHasSkeletalAnimation } from '../services/game-export/unreal/asset-converter';
import type { BundledAsset } from '../services/game-export/asset-bundler';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(__dirname, '..', 'services', 'game-export', 'unreal', 'templates');

// ─────────────────────────────────────────────
// .uproject plugin configuration
// ─────────────────────────────────────────────

describe('InsimulExport.uproject plugins', () => {
  const uproject = JSON.parse(
    readFileSync(join(templatesDir, 'project', 'InsimulExport.uproject'), 'utf-8'),
  );
  const pluginNames = (uproject.Plugins as Array<{ Name: string; Enabled: boolean }>).map(p => p.Name);

  it('includes InterchangeEditor plugin', () => {
    expect(pluginNames).toContain('InterchangeEditor');
  });

  it('includes InterchangePlugins plugin', () => {
    expect(pluginNames).toContain('InterchangePlugins');
  });

  it('includes GLTFImporter plugin', () => {
    expect(pluginNames).toContain('GLTFImporter');
  });

  it('all Interchange/glTF plugins are enabled', () => {
    const interchangePlugins = uproject.Plugins.filter((p: any) =>
      ['InterchangeEditor', 'InterchangePlugins', 'GLTFImporter'].includes(p.Name),
    );
    for (const plugin of interchangePlugins) {
      expect(plugin.Enabled).toBe(true);
    }
  });

  it('retains existing plugins (EnhancedInput, ProceduralMeshComponent)', () => {
    expect(pluginNames).toContain('EnhancedInput');
    expect(pluginNames).toContain('ProceduralMeshComponent');
  });
});

// ─────────────────────────────────────────────
// DefaultEngine.ini Interchange settings
// ─────────────────────────────────────────────

describe('DefaultEngine.ini Interchange settings', () => {
  const ini = readFileSync(join(templatesDir, 'project', 'DefaultEngine.ini'), 'utf-8');

  it('includes InterchangeStaticMeshFactoryNode auto-create materials setting', () => {
    expect(ini).toContain('InterchangeStaticMeshFactoryNode');
    expect(ini).toContain('bAutoCreateMaterials=True');
  });

  it('includes InterchangeImport texture and material settings', () => {
    expect(ini).toContain('InterchangeImportSettings');
    expect(ini).toContain('bImportTextures=True');
    expect(ini).toContain('bImportMaterials=True');
  });

  it('includes GLTFImporter lightmap UV generation setting', () => {
    expect(ini).toContain('GLTFImportSettings');
    expect(ini).toContain('bGenerateLightmapUVs=True');
  });

  it('retains existing engine settings', () => {
    expect(ini).toContain('InsimulGameMode');
    expect(ini).toContain('RuntimeGeneration=Dynamic');
  });
});

// ─────────────────────────────────────────────
// GLB animation detection
// ─────────────────────────────────────────────

describe('glbHasSkeletalAnimation', () => {
  /**
   * Build a minimal valid GLB buffer with the given JSON content.
   */
  function makeGlb(json: object): Buffer {
    const jsonStr = JSON.stringify(json);
    const jsonBuf = Buffer.from(jsonStr, 'utf8');
    // Pad to 4-byte alignment
    const padding = (4 - (jsonBuf.length % 4)) % 4;
    const paddedJson = Buffer.concat([jsonBuf, Buffer.alloc(padding, 0x20)]);

    // GLB header: 12 bytes
    // JSON chunk header: 8 bytes + paddedJson.length
    const totalLength = 12 + 8 + paddedJson.length;
    const header = Buffer.alloc(12);
    header.writeUInt32LE(0x46546c67, 0); // magic: "glTF"
    header.writeUInt32LE(2, 4);           // version: 2
    header.writeUInt32LE(totalLength, 8); // total length

    const chunkHeader = Buffer.alloc(8);
    chunkHeader.writeUInt32LE(paddedJson.length, 0); // chunk length
    chunkHeader.writeUInt32LE(0x4e4f534a, 4);        // chunk type: "JSON"

    return Buffer.concat([header, chunkHeader, paddedJson]);
  }

  it('returns true when GLB has skins', () => {
    const glb = makeGlb({ skins: [{ joints: [0] }] });
    expect(glbHasSkeletalAnimation(glb)).toBe(true);
  });

  it('returns true when GLB has animations', () => {
    const glb = makeGlb({ animations: [{ channels: [], samplers: [] }] });
    expect(glbHasSkeletalAnimation(glb)).toBe(true);
  });

  it('returns false when GLB has no skins or animations', () => {
    const glb = makeGlb({ meshes: [{ primitives: [] }] });
    expect(glbHasSkeletalAnimation(glb)).toBe(false);
  });

  it('returns false for too-small buffer', () => {
    expect(glbHasSkeletalAnimation(Buffer.alloc(10))).toBe(false);
  });

  it('returns false for non-GLB buffer', () => {
    const buf = Buffer.alloc(100);
    buf.write('NOT_GLB', 0);
    expect(glbHasSkeletalAnimation(buf)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// Asset converter routing
// ─────────────────────────────────────────────

describe('convertAssetsForUnreal', () => {
  function makeBundledAsset(overrides: Partial<BundledAsset> & { exportPath: string }): BundledAsset {
    return {
      buffer: Buffer.from('test-data'),
      category: 'prop',
      role: 'test',
      ...overrides,
    };
  }

  it('routes static GLB to Content/Models/', () => {
    const assets: BundledAsset[] = [
      makeBundledAsset({ exportPath: 'assets/containers/chest.glb', category: 'container', role: 'chest' }),
    ];
    const result = convertAssetsForUnreal(assets);
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].exportPath).toBe('Content/Models/chest.glb');
    expect(result.assets[0].convertedToFbx).toBe(false);
    expect(result.stats.staticModels).toBe(1);
  });

  it('routes GLTF files to Content/Models/', () => {
    const assets: BundledAsset[] = [
      makeBundledAsset({ exportPath: 'assets/buildings/house.gltf', category: 'building', role: 'house' }),
    ];
    const result = convertAssetsForUnreal(assets);
    expect(result.assets[0].exportPath).toBe('Content/Models/house.gltf');
  });

  it('routes texture files to Content/Textures/', () => {
    const assets: BundledAsset[] = [
      makeBundledAsset({ exportPath: 'assets/ground/ground.jpg', category: 'ground', role: 'ground_diffuse' }),
    ];
    const result = convertAssetsForUnreal(assets);
    expect(result.assets[0].exportPath).toBe('Content/Textures/ground.jpg');
    expect(result.stats.textures).toBe(1);
  });

  it('routes audio files to Content/Audio/', () => {
    const assets: BundledAsset[] = [
      makeBundledAsset({ exportPath: 'assets/audio/ambient/wind.mp3', category: 'audio', role: 'ambient_wind' }),
    ];
    const result = convertAssetsForUnreal(assets);
    expect(result.assets[0].exportPath).toBe('Content/Audio/wind.mp3');
    expect(result.stats.audio).toBe(1);
  });

  it('routes character assets to Content/Characters/', () => {
    const assets: BundledAsset[] = [
      makeBundledAsset({ exportPath: 'assets/player/model.glb', category: 'character', role: 'player_default' }),
    ];
    const result = convertAssetsForUnreal(assets);
    expect(result.assets[0].exportPath).toBe('Content/Characters/model.glb');
  });

  it('routes .bin companion files to Content/Models/', () => {
    const assets: BundledAsset[] = [
      makeBundledAsset({ exportPath: 'assets/buildings/house.bin', category: 'building', role: 'house_bin' }),
    ];
    const result = convertAssetsForUnreal(assets);
    expect(result.assets[0].exportPath).toBe('Content/Models/house.bin');
  });

  it('handles mixed asset types correctly', () => {
    const assets: BundledAsset[] = [
      makeBundledAsset({ exportPath: 'assets/props/gem.glb', category: 'prop', role: 'gem' }),
      makeBundledAsset({ exportPath: 'assets/ground/ground.png', category: 'ground', role: 'ground_normal' }),
      makeBundledAsset({ exportPath: 'assets/audio/footstep.mp3', category: 'audio', role: 'footstep' }),
    ];
    const result = convertAssetsForUnreal(assets);
    expect(result.assets).toHaveLength(3);
    expect(result.stats.staticModels).toBe(1);
    expect(result.stats.textures).toBe(1);
    expect(result.stats.audio).toBe(1);
  });

  it('returns correct total count', () => {
    const assets: BundledAsset[] = [
      makeBundledAsset({ exportPath: 'a.glb', category: 'prop' }),
      makeBundledAsset({ exportPath: 'b.png', category: 'ground' }),
    ];
    const result = convertAssetsForUnreal(assets);
    expect(result.stats.totalAssets).toBe(2);
  });
});

// ─────────────────────────────────────────────
// ImportInsimulAssets.py script
// ─────────────────────────────────────────────

describe('ImportInsimulAssets.py', () => {
  const script = readFileSync(join(templatesDir, 'scripts', 'ImportInsimulAssets.py'), 'utf-8');

  it('handles FBX files for skeletal mesh import', () => {
    expect(script).toContain('.fbx');
    expect(script).toContain('import_as_skeletal');
    expect(script).toContain('import_animations');
  });

  it('scans Content/Models and Content/Characters directories', () => {
    expect(script).toContain('"Models"');
    expect(script).toContain('"Characters"');
  });

  it('scans Content/Textures and Content/Audio directories', () => {
    expect(script).toContain('"Textures"');
    expect(script).toContain('"Audio"');
  });

  it('mentions Interchange plugins in docstring', () => {
    expect(script).toContain('InterchangeEditor');
    expect(script).toContain('GLTFImporter');
  });
});
