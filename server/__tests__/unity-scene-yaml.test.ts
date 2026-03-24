/**
 * Tests for Unity scene YAML generation
 *
 * Verifies that the Unity scene YAML (.unity) file contains correct
 * camera, lighting, environment, and EventSystem GameObjects with
 * proper cross-references and fileIDs.
 */

import { describe, it, expect } from 'vitest';
import { generateSceneFiles, generateUnitySceneYaml } from '../services/game-export/unity/unity-scene-generator';
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
      skyboxAssetKey: null,
      ambientLighting: { color: [0.4, 0.4, 0.5], intensity: 0.6 },
      directionalLight: { direction: [0.5, -0.7, 0.5], intensity: 1.2 },
      fog: { mode: 'exponential', density: 0.02, color: [0.7, 0.7, 0.8] },
    },
    assets: [],
    player: {
      speed: 5,
      jumpHeight: 1.2,
      gravity: 1,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      startPosition: { x: 10, y: 0, z: 20 },
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
// File output
// ─────────────────────────────────────────────

describe('Unity scene YAML - file output', () => {
  const ir = makeMinimalIR();
  const files = generateSceneFiles(ir);

  it('generates both SceneDescriptor.json and Main.unity', () => {
    expect(files.find(f => f.path.endsWith('SceneDescriptor.json'))).toBeDefined();
    expect(files.find(f => f.path.endsWith('Main.unity'))).toBeDefined();
  });

  it('places Main.unity in Assets/Scenes/', () => {
    const sceneFile = files.find(f => f.path.endsWith('.unity'));
    expect(sceneFile!.path).toBe('Assets/Scenes/Main.unity');
  });
});

// ─────────────────────────────────────────────
// YAML header
// ─────────────────────────────────────────────

describe('Unity scene YAML - header', () => {
  const ir = makeMinimalIR();
  const yaml = generateUnitySceneYaml(ir);

  it('starts with %YAML 1.1 header', () => {
    expect(yaml.startsWith('%YAML 1.1')).toBe(true);
  });

  it('includes Unity TAG directive', () => {
    expect(yaml).toContain('%TAG !u! tag:unity3d.com,2011:');
  });
});

// ─────────────────────────────────────────────
// Main Camera
// ─────────────────────────────────────────────

describe('Unity scene YAML - Main Camera', () => {
  const ir = makeMinimalIR();
  const yaml = generateUnitySceneYaml(ir);

  it('has Main Camera GameObject', () => {
    expect(yaml).toContain('m_Name: Main Camera');
  });

  it('Main Camera is tagged as MainCamera', () => {
    expect(yaml).toContain('m_TagString: MainCamera');
  });

  it('includes Camera component with FOV', () => {
    expect(yaml).toContain('field of view: 60');
  });

  it('includes near and far clip planes', () => {
    expect(yaml).toContain('near clip plane: 0.3');
    expect(yaml).toContain('far clip plane: 1000');
  });

  it('includes AudioListener component', () => {
    expect(yaml).toContain('AudioListener:');
  });

  it('camera position is offset from player start', () => {
    // Player starts at x:10, y:0, z:20 — camera should be above and behind
    expect(yaml).toContain('m_LocalPosition: {x: 10');
    expect(yaml).toMatch(/m_LocalPosition: \{x: 10.*y: 5.*z: 12/);
  });

  it('Camera component references its GameObject', () => {
    // Find the Camera component's m_GameObject reference
    const cameraSection = yaml.match(/--- !u!20 &\d+\nCamera:[\s\S]*?m_GameObject: \{fileID: (\d+)\}/);
    expect(cameraSection).not.toBeNull();
    const goId = cameraSection![1];

    // Verify that GO exists and is named "Main Camera"
    const goPattern = new RegExp(`--- !u!1 &${goId}\\nGameObject:[\\s\\S]*?m_Name: Main Camera`);
    expect(yaml).toMatch(goPattern);
  });

  it('AudioListener references the camera GameObject', () => {
    // Find the Camera GO by looking at the Camera component's m_GameObject reference
    const cameraSection = yaml.match(/--- !u!20 &\d+\nCamera:[\s\S]*?m_GameObject: \{fileID: (\d+)\}/);
    expect(cameraSection).not.toBeNull();
    const goId = cameraSection![1];

    const alSection = yaml.match(/--- !u!81 &\d+\nAudioListener:[\s\S]*?m_GameObject: \{fileID: (\d+)\}/);
    expect(alSection).not.toBeNull();
    expect(alSection![1]).toBe(goId);
  });

  it('camera Transform references camera GameObject', () => {
    const goMatch = yaml.match(/--- !u!1 &(\d+)\nGameObject:[\s\S]*?m_Name: Main Camera/);
    const goId = goMatch![1];

    // Get the transform fileID listed in the camera GO components
    const compMatch = yaml.match(/m_Name: Main Camera[\s\S]*?--- !u!4 &(\d+)\nTransform:[\s\S]*?m_GameObject: \{fileID: (\d+)\}/);
    // Alternative: just check the transform references the GO
    const transformSections = [...yaml.matchAll(/--- !u!4 &(\d+)\nTransform:[\s\S]*?m_GameObject: \{fileID: (\d+)\}/g)];
    const cameraTransform = transformSections.find(m => m[2] === goId);
    expect(cameraTransform).toBeDefined();
  });
});

// ─────────────────────────────────────────────
// Directional Light
// ─────────────────────────────────────────────

describe('Unity scene YAML - Directional Light', () => {
  const ir = makeMinimalIR();
  const yaml = generateUnitySceneYaml(ir);

  it('has Directional Light GameObject', () => {
    expect(yaml).toContain('m_Name: Directional Light');
  });

  it('Light component is directional (m_Type: 1)', () => {
    expect(yaml).toContain('m_Type: 1');
  });

  it('Light has intensity from theme IR', () => {
    // IR says 1.2
    expect(yaml).toContain('m_Intensity: 1.2');
  });

  it('Light has soft shadows enabled', () => {
    // m_Type: 2 under m_Shadows means Soft
    expect(yaml).toMatch(/m_Shadows:[\s\S]*?m_Type: 2/);
  });

  it('Light component references its GameObject', () => {
    // Find the Light component's m_GameObject reference
    const lightSection = yaml.match(/--- !u!108 &\d+\nLight:[\s\S]*?m_GameObject: \{fileID: (\d+)\}/);
    expect(lightSection).not.toBeNull();
    const goId = lightSection![1];

    // Verify that GO exists and is named "Directional Light"
    const goPattern = new RegExp(`--- !u!1 &${goId}\\nGameObject:[\\s\\S]*?m_Name: Directional Light`);
    expect(yaml).toMatch(goPattern);
  });

  it('Light transform has rotation derived from direction', () => {
    // Direction is [0.5, -0.7, 0.5], should produce a non-identity quaternion
    const lightTransformMatch = yaml.match(/m_Name: Directional Light[\s\S]*?--- !u!4 &\d+\nTransform:[\s\S]*?m_LocalRotation: \{x: ([\d.-]+), y: ([\d.-]+), z: ([\d.-]+), w: ([\d.-]+)\}/);
    expect(lightTransformMatch).not.toBeNull();
    // Quaternion should not be identity (0,0,0,1)
    const x = parseFloat(lightTransformMatch![1]);
    const y = parseFloat(lightTransformMatch![2]);
    const z = parseFloat(lightTransformMatch![3]);
    const w = parseFloat(lightTransformMatch![4]);
    const isIdentity = Math.abs(x) < 0.001 && Math.abs(y) < 0.001 && Math.abs(z) < 0.001 && Math.abs(w - 1) < 0.001;
    expect(isIdentity).toBe(false);
  });
});

// ─────────────────────────────────────────────
// RenderSettings (environment)
// ─────────────────────────────────────────────

describe('Unity scene YAML - RenderSettings', () => {
  const ir = makeMinimalIR();
  const yaml = generateUnitySceneYaml(ir);

  it('includes RenderSettings section', () => {
    expect(yaml).toContain('RenderSettings:');
  });

  it('has fog enabled from theme', () => {
    // IR has fog with density 0.02
    expect(yaml).toMatch(/m_Fog: 1/);
    expect(yaml).toContain('m_FogDensity: 0.02');
  });

  it('has fog color from theme', () => {
    expect(yaml).toMatch(/m_FogColor: \{r: 0\.70.*g: 0\.70.*b: 0\.80/);
  });

  it('has ambient sky color derived from theme', () => {
    expect(yaml).toContain('m_AmbientSkyColor:');
  });

  it('has ambient intensity from theme', () => {
    expect(yaml).toContain('m_AmbientIntensity: 0.6');
  });

  it('sun references the directional light component', () => {
    // Extract the light component fileID
    const lightMatch = yaml.match(/--- !u!108 &(\d+)\nLight:/);
    expect(lightMatch).not.toBeNull();
    const lightId = lightMatch![1];
    expect(yaml).toContain(`m_Sun: {fileID: ${lightId}}`);
  });

  it('disables fog when theme has no fog', () => {
    const noFogIR = makeMinimalIR();
    (noFogIR.theme as any).fog = null;
    const noFogYaml = generateUnitySceneYaml(noFogIR);
    expect(noFogYaml).toMatch(/m_Fog: 0/);
    expect(noFogYaml).toContain('m_FogDensity: 0');
  });
});

// ─────────────────────────────────────────────
// EventSystem
// ─────────────────────────────────────────────

describe('Unity scene YAML - EventSystem', () => {
  const ir = makeMinimalIR();
  const yaml = generateUnitySceneYaml(ir);

  it('has EventSystem GameObject', () => {
    expect(yaml).toContain('m_Name: EventSystem');
  });

  it('EventSystem has MonoBehaviour components', () => {
    // Should have at least 2 MonoBehaviour components (EventSystem + InputModule)
    const monoCount = (yaml.match(/MonoBehaviour:/g) || []).length;
    expect(monoCount).toBeGreaterThanOrEqual(2);
  });

  it('StandaloneInputModule has axis configuration', () => {
    expect(yaml).toContain('m_HorizontalAxis: Horizontal');
    expect(yaml).toContain('m_VerticalAxis: Vertical');
    expect(yaml).toContain('m_SubmitButton: Submit');
    expect(yaml).toContain('m_CancelButton: Cancel');
  });
});

// ─────────────────────────────────────────────
// Scene structure and settings
// ─────────────────────────────────────────────

describe('Unity scene YAML - scene settings', () => {
  const ir = makeMinimalIR();
  const yaml = generateUnitySceneYaml(ir);

  it('includes OcclusionCullingSettings', () => {
    expect(yaml).toContain('OcclusionCullingSettings:');
  });

  it('includes LightmapSettings', () => {
    expect(yaml).toContain('LightmapSettings:');
  });

  it('includes NavMeshSettings', () => {
    expect(yaml).toContain('NavMeshSettings:');
  });

  it('has a SceneRoot GameObject', () => {
    expect(yaml).toContain('m_Name: SceneRoot');
  });

  it('SceneRoot has children referencing camera, light, and eventsystem transforms', () => {
    // Extract root transform section
    const rootMatch = yaml.match(/m_Name: SceneRoot[\s\S]*?--- !u!4 &(\d+)\nTransform:[\s\S]*?m_Children:([\s\S]*?)m_Father/);
    expect(rootMatch).not.toBeNull();
    const childrenBlock = rootMatch![2];
    // Should have 3 children
    const childRefs = childrenBlock.match(/\{fileID: \d+\}/g);
    expect(childRefs).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────
// fileID consistency
// ─────────────────────────────────────────────

describe('Unity scene YAML - fileID consistency', () => {
  const ir = makeMinimalIR();
  const yaml = generateUnitySceneYaml(ir);

  it('all fileID references point to defined objects', () => {
    // Collect all defined object IDs (--- !u!<classId> &<fileId>)
    const definedIds = new Set<string>();
    const defMatches = yaml.matchAll(/--- !u!\d+ &(\d+)/g);
    for (const m of defMatches) {
      definedIds.add(m[1]);
    }

    // Collect all fileID references (excluding {fileID: 0} which means "none")
    const refMatches = yaml.matchAll(/\{fileID: (\d+)\}/g);
    for (const m of refMatches) {
      if (m[1] !== '0') {
        expect(definedIds.has(m[1])).toBe(true);
      }
    }
  });

  it('all defined IDs are unique', () => {
    const ids: string[] = [];
    const defMatches = yaml.matchAll(/--- !u!\d+ &(\d+)/g);
    for (const m of defMatches) {
      ids.push(m[1]);
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every GameObject component list references existing fileIDs', () => {
    // Find all component references in GameObjects
    const compRefs = yaml.matchAll(/- component: \{fileID: (\d+)\}/g);
    const definedIds = new Set<string>();
    const defMatches = yaml.matchAll(/--- !u!\d+ &(\d+)/g);
    for (const m of defMatches) {
      definedIds.add(m[1]);
    }
    for (const m of compRefs) {
      expect(definedIds.has(m[1])).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────
// Camera background color from sky
// ─────────────────────────────────────────────

describe('Unity scene YAML - theme-driven values', () => {
  const ir = makeMinimalIR();
  const yaml = generateUnitySceneYaml(ir);

  it('camera background color uses sky color from theme', () => {
    // skyColor is { r: 0.6, g: 0.7, b: 0.9 }
    expect(yaml).toMatch(/m_BackGroundColor: \{r: 0\.6.*g: 0\.70.*b: 0\.90/);
  });
});
