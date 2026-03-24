/**
 * Tests for Unity Force Text scene generation and GUID management.
 *
 * Covers:
 * - Deterministic GUID generation from asset paths
 * - GuidRegistry tracking and deduplication
 * - .meta file generation for scripts, scenes, folders
 * - Force Text .unity scene YAML structure
 * - EditorSettings.asset with Force Text mode
 * - Scene contains required settings and GameObjects
 */

import { describe, it, expect } from 'vitest';
import {
  generateGuid,
  generateFileId,
  GuidRegistry,
  generateMetaFile,
  getImporterType,
  generateMetaFiles,
} from '../services/game-export/unity/unity-guid-manager';
import { generateSceneFiles, buildSceneYaml } from '../services/game-export/unity/unity-scene-generator';
import { generateProjectFiles } from '../services/game-export/unity/unity-project-generator';
import { generateUnityFilesFromIR } from '../services/game-export/unity/unity-exporter';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(): WorldIR {
  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'test-world',
      worldName: 'Test World',
      worldType: 'medieval_fantasy',
      seed: 'test-seed',
      terrainSize: 512,
      genreConfig: {
        genre: 'rpg',
        features: { crafting: false, resources: false, survival: false },
      },
    },
    geography: {
      terrainSize: 512,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      roads: [],
      businesses: [],
      natureObjects: [],
      animals: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      items: [],
      lootTables: [],
      languages: [],
      knowledgeBase: null,
      dialogueContexts: [],
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.5, g: 0.4, b: 0.3 },
        skyColor: { r: 0.6, g: 0.7, b: 0.9 },
        roadColor: { r: 0.3, g: 0.3, b: 0.3 },
        roadRadius: 1.5,
        settlementBaseColor: { r: 0.6, g: 0.5, b: 0.4 },
        settlementRoofColor: { r: 0.3, g: 0.2, b: 0.15 },
      },
      ambientLighting: { color: [0.4, 0.4, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0, 1, 0], intensity: 1.0 },
      fog: { density: 0.02 },
    },
    assets: { animations: [], textures: [], models: [], audio: [] },
    player: {
      speed: 5,
      jumpHeight: 1.2,
      gravity: 1,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      startPosition: { x: 50, y: 0, z: 50 },
    },
    ui: {
      minimap: true,
      healthBar: true,
      staminaBar: false,
      ammoCounter: false,
      compass: true,
    },
    combat: {
      style: 'melee',
      settings: {
        baseDamage: 10,
        criticalChance: 0.15,
        criticalMultiplier: 1.5,
        blockReduction: 0.25,
        dodgeChance: 0.1,
        attackCooldown: 1000,
        combatRange: 2,
      },
    },
    survival: null,
    resources: null,
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// GUID generation
// ─────────────────────────────────────────────

describe('generateGuid', () => {
  it('produces a 32-char hex string', () => {
    const guid = generateGuid('Assets/Scripts/Test.cs');
    expect(guid).toMatch(/^[0-9a-f]{32}$/);
  });

  it('is deterministic — same path always gives same GUID', () => {
    const a = generateGuid('Assets/Scripts/Foo.cs');
    const b = generateGuid('Assets/Scripts/Foo.cs');
    expect(a).toBe(b);
  });

  it('different paths produce different GUIDs', () => {
    const a = generateGuid('Assets/Scripts/Foo.cs');
    const b = generateGuid('Assets/Scripts/Bar.cs');
    expect(a).not.toBe(b);
  });
});

describe('generateFileId', () => {
  it('produces a positive integer', () => {
    const id = generateFileId('scene.unity', 'Camera');
    expect(id).toBeGreaterThan(0);
  });

  it('is deterministic', () => {
    const a = generateFileId('scene.unity', 'Camera');
    const b = generateFileId('scene.unity', 'Camera');
    expect(a).toBe(b);
  });

  it('different components produce different IDs', () => {
    const a = generateFileId('scene.unity', 'Camera');
    const b = generateFileId('scene.unity', 'Light');
    expect(a).not.toBe(b);
  });
});

// ─────────────────────────────────────────────
// GuidRegistry
// ─────────────────────────────────────────────

describe('GuidRegistry', () => {
  it('returns the same GUID for the same path', () => {
    const reg = new GuidRegistry();
    const a = reg.getGuid('Assets/Scripts/Test.cs');
    const b = reg.getGuid('Assets/Scripts/Test.cs');
    expect(a).toBe(b);
  });

  it('tracks all registered entries', () => {
    const reg = new GuidRegistry();
    reg.getGuid('Assets/A.cs');
    reg.getGuid('Assets/B.cs');
    expect(reg.entries()).toHaveLength(2);
  });

  it('produces sequential fileIDs', () => {
    const reg = new GuidRegistry();
    expect(reg.nextFileId()).toBe(1);
    expect(reg.nextFileId()).toBe(2);
    expect(reg.nextFileId()).toBe(3);
  });

  it('getFileId returns stable IDs for same key', () => {
    const reg = new GuidRegistry();
    const a = reg.getFileId('camera:go');
    const b = reg.getFileId('camera:go');
    expect(a).toBe(b);
  });
});

// ─────────────────────────────────────────────
// Meta file generation
// ─────────────────────────────────────────────

describe('getImporterType', () => {
  it('returns MonoImporter for .cs files', () => {
    expect(getImporterType('Assets/Scripts/Test.cs')).toBe('MonoImporter');
  });

  it('returns DefaultImporter for .unity files', () => {
    expect(getImporterType('Assets/Scenes/Main.unity')).toBe('DefaultImporter');
  });

  it('returns TextScriptImporter for .json files', () => {
    expect(getImporterType('Assets/Data/config.json')).toBe('TextScriptImporter');
  });

  it('returns DefaultImporter for .asset files', () => {
    expect(getImporterType('Assets/Settings.asset')).toBe('DefaultImporter');
  });
});

describe('generateMetaFile', () => {
  it('includes fileFormatVersion and guid', () => {
    const meta = generateMetaFile('Assets/Test.cs', 'abc123', 'MonoImporter');
    expect(meta).toContain('fileFormatVersion: 2');
    expect(meta).toContain('guid: abc123');
  });

  it('includes MonoImporter section for scripts', () => {
    const meta = generateMetaFile('Assets/Test.cs', 'abc123', 'MonoImporter');
    expect(meta).toContain('MonoImporter:');
    expect(meta).toContain('executionOrder: 0');
  });

  it('includes folderAsset for folders', () => {
    const meta = generateMetaFile('Assets/Scripts', 'abc123', 'FolderImporter');
    expect(meta).toContain('folderAsset: yes');
  });

  it('includes DefaultImporter for scenes', () => {
    const meta = generateMetaFile('Assets/Scenes/Main.unity', 'abc123', 'DefaultImporter');
    expect(meta).toContain('DefaultImporter:');
  });
});

describe('generateMetaFiles', () => {
  it('generates .meta for files inside Assets/', () => {
    const files = [
      { path: 'Assets/Scripts/Test.cs', content: 'class Test {}' },
      { path: 'README.md', content: '# readme' },
    ];
    const reg = new GuidRegistry();
    const metas = generateMetaFiles(files, reg);

    const metaPaths = metas.map(m => m.path);
    expect(metaPaths).toContain('Assets/Scripts/Test.cs.meta');
    // README.md is not under Assets/, no meta
    expect(metaPaths.every(p => p.startsWith('Assets/'))).toBe(true);
  });

  it('generates .meta for intermediate folders', () => {
    const files = [
      { path: 'Assets/Scripts/Insimul/Core/Test.cs', content: '' },
    ];
    const reg = new GuidRegistry();
    const metas = generateMetaFiles(files, reg);

    const metaPaths = metas.map(m => m.path);
    expect(metaPaths).toContain('Assets/Scripts.meta');
    expect(metaPaths).toContain('Assets/Scripts/Insimul.meta');
    expect(metaPaths).toContain('Assets/Scripts/Insimul/Core.meta');
  });

  it('folder .meta files use FolderImporter', () => {
    const files = [
      { path: 'Assets/Scripts/Test.cs', content: '' },
    ];
    const reg = new GuidRegistry();
    const metas = generateMetaFiles(files, reg);
    const folderMeta = metas.find(m => m.path === 'Assets/Scripts.meta');
    expect(folderMeta).toBeDefined();
    expect(folderMeta!.content).toContain('folderAsset: yes');
  });

  it('does not generate .meta for Assets root folder', () => {
    const files = [{ path: 'Assets/Test.cs', content: '' }];
    const reg = new GuidRegistry();
    const metas = generateMetaFiles(files, reg);
    expect(metas.find(m => m.path === 'Assets.meta')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// Force Text .unity scene generation
// ─────────────────────────────────────────────

describe('Force Text .unity scene', () => {
  const ir = makeMinimalIR();

  it('generates a .unity file at Assets/Scenes/Main.unity', () => {
    const files = generateSceneFiles(ir);
    const unityFile = files.find(f => f.path === 'Assets/Scenes/Main.unity');
    expect(unityFile).toBeDefined();
  });

  it('still generates SceneDescriptor.json', () => {
    const files = generateSceneFiles(ir);
    const jsonFile = files.find(f => f.path.endsWith('SceneDescriptor.json'));
    expect(jsonFile).toBeDefined();
  });

  it('starts with %YAML 1.1 header', () => {
    const files = generateSceneFiles(ir);
    const unityFile = files.find(f => f.path.endsWith('.unity'))!;
    expect(unityFile.content).toMatch(/^%YAML 1\.1\n/);
  });

  it('includes Unity tag declaration', () => {
    const files = generateSceneFiles(ir);
    const unityFile = files.find(f => f.path.endsWith('.unity'))!;
    expect(unityFile.content).toContain('%TAG !u! tag:unity3d.com,2011:');
  });

  it('includes OcclusionCullingSettings', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('OcclusionCullingSettings:');
  });

  it('includes RenderSettings with ambient light from IR', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('RenderSettings:');
    expect(content).toContain('m_AmbientIntensity: 0.5');
  });

  it('includes LightmapSettings', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('LightmapSettings:');
  });

  it('includes NavMeshSettings', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('NavMeshSettings:');
  });

  it('includes Main Camera with Camera and AudioListener', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('m_Name: Main Camera');
    expect(content).toContain('Camera:');
    expect(content).toContain('field of view: 60');
    expect(content).toContain('AudioListener:');
  });

  it('includes Main Camera tagged as MainCamera', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('m_TagString: MainCamera');
  });

  it('includes Directional Light', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('m_Name: Directional Light');
    expect(content).toContain('Light:');
    expect(content).toContain('m_Type: 1');
  });

  it('includes EventSystem', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('m_Name: EventSystem');
  });

  it('includes GameManager', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('m_Name: GameManager');
  });

  it('uses consistent fileID cross-references (component → GameObject)', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    // Camera component should reference Main Camera GameObject's fileID
    const goMatch = content.match(/--- !u!1 &(\d+)\nGameObject:[\s\S]*?m_Name: Main Camera/);
    expect(goMatch).toBeTruthy();
    const goFileId = goMatch![1];
    // Camera component should have m_GameObject referencing this ID
    expect(content).toContain(`m_GameObject: {fileID: ${goFileId}}`);
  });

  it('RenderSettings reflects fog settings from IR', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('m_Fog: 1');
    expect(content).toContain('m_FogDensity: 0.02');
  });

  it('Light intensity matches IR directional light', () => {
    const files = generateSceneFiles(ir);
    const content = files.find(f => f.path.endsWith('.unity'))!.content;
    expect(content).toContain('m_Intensity: 1');
  });
});

// ─────────────────────────────────────────────
// EditorSettings.asset
// ─────────────────────────────────────────────

describe('EditorSettings.asset', () => {
  const ir = makeMinimalIR();
  const files = generateProjectFiles(ir);

  it('is generated in ProjectSettings/', () => {
    const editorSettings = files.find(f => f.path === 'ProjectSettings/EditorSettings.asset');
    expect(editorSettings).toBeDefined();
  });

  it('has Force Text serialization mode (m_SerializationMode: 2)', () => {
    const editorSettings = files.find(f => f.path === 'ProjectSettings/EditorSettings.asset')!;
    expect(editorSettings.content).toContain('m_SerializationMode: 2');
  });

  it('starts with YAML header', () => {
    const editorSettings = files.find(f => f.path === 'ProjectSettings/EditorSettings.asset')!;
    expect(editorSettings.content).toMatch(/^%YAML 1\.1/);
  });
});

// ─────────────────────────────────────────────
// Full pipeline integration
// ─────────────────────────────────────────────

describe('Full Unity export pipeline with GUID/meta/scene', () => {
  const ir = makeMinimalIR();
  const files = generateUnityFilesFromIR(ir);

  it('includes .unity scene file', () => {
    expect(files.some(f => f.path === 'Assets/Scenes/Main.unity')).toBe(true);
  });

  it('includes .meta files for generated scripts', () => {
    const csFiles = files.filter(f => f.path.endsWith('.cs'));
    for (const cs of csFiles) {
      const metaPath = `${cs.path}.meta`;
      expect(files.some(f => f.path === metaPath)).toBe(true);
    }
  });

  it('includes .meta for the .unity scene file', () => {
    expect(files.some(f => f.path === 'Assets/Scenes/Main.unity.meta')).toBe(true);
  });

  it('.meta files contain valid GUIDs (32 hex chars)', () => {
    const metaFiles = files.filter(f => f.path.endsWith('.meta'));
    expect(metaFiles.length).toBeGreaterThan(0);
    for (const meta of metaFiles) {
      const guidMatch = meta.content.match(/guid: ([0-9a-f]+)/);
      expect(guidMatch).toBeTruthy();
      expect(guidMatch![1]).toMatch(/^[0-9a-f]{32}$/);
    }
  });

  it('each .meta has a unique GUID', () => {
    const guids = files
      .filter(f => f.path.endsWith('.meta'))
      .map(f => f.content.match(/guid: ([0-9a-f]+)/)![1]);
    const uniqueGuids = new Set(guids);
    expect(uniqueGuids.size).toBe(guids.length);
  });

  it('includes EditorSettings.asset with Force Text mode', () => {
    const es = files.find(f => f.path === 'ProjectSettings/EditorSettings.asset');
    expect(es).toBeDefined();
    expect(es!.content).toContain('m_SerializationMode: 2');
  });
});
