/**
 * Tests for Unity world map UI export
 *
 * Verifies that the Unity export pipeline correctly generates:
 * - WorldMapUI.cs template file in the UI directory
 * - Full-screen overlay with pan, zoom, markers, roads, player arrow
 * - Conditional inclusion based on mapScreen.enabled
 * - Toggle with M key, game pause, cursor management
 * - Terrain texture generation from heightmap
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
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
      worldDescription: 'A test world',
      worldType: 'fantasy',
      genreConfig: {
        genre: 'rpg',
        subGenre: 'action-rpg',
        features: { crafting: false, resources: false, survival: false, dungeons: false, vehicles: false, companions: false, factions: false, housing: false, farming: false, fishing: false, cooking: false, mining: false, trading: true },
        cameraMode: 'third-person' as any,
        combatStyle: 'melee' as any,
      },
      exportTimestamp: new Date().toISOString(),
      exportVersion: 1,
      seed: 'test-seed',
    },
    geography: {
      terrainSize: 1000,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      businesses: [],
      roads: [],
      natureObjects: [],
      animals: [],
      dungeons: [],
      questObjects: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      truths: [],
      grammars: [],
      languages: [],
      items: [],
      lootTables: [],
      dialogueContexts: [],
      knowledgeBase: null,
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.4, g: 0.6, b: 0.3 },
        skyColor: { r: 0.5, g: 0.7, b: 1.0 },
        settlementBaseColor: { r: 0.8, g: 0.7, b: 0.6 },
        settlementRoofColor: { r: 0.6, g: 0.3, b: 0.2 },
        roadColor: { r: 0.5, g: 0.5, b: 0.5 },
        roadRadius: 2.5,
      } as any,
      skyboxAssetKey: null,
      ambientLighting: { color: [0.3, 0.3, 0.3], intensity: 0.5 },
      directionalLight: { direction: [0, -1, 0], intensity: 1.0 },
      fog: null,
    },
    assets: { collectionId: null, textures: [], models: [], audio: [], animations: [] },
    player: {
      startPosition: { x: 0, y: 1, z: 0 },
      modelAssetKey: null,
      initialEnergy: 100,
      initialGold: 50,
      initialHealth: 100,
      speed: 6,
      jumpHeight: 4,
      gravity: 9.8,
    },
    ui: { showMinimap: true, showHealthBar: true, showStaminaBar: true, showAmmoCounter: false, showCompass: true, genreLayout: 'rpg' },
    combat: {
      style: 'melee' as any,
      settings: { baseDamage: 10, damageVariance: 2, criticalChance: 0.1, criticalMultiplier: 2, blockReduction: 0.5, dodgeChance: 0.1, attackCooldown: 500, comboWindowMs: 300, maxComboLength: 3 },
    },
    survival: null,
    resources: null,
    aiConfig: { apiMode: 'insimul', insimulEndpoint: '', geminiModel: '', geminiApiKeyPlaceholder: '', voiceEnabled: false, defaultVoice: '' },
  };
}

// ─────────────────────────────────────────────
// File generation
// ─────────────────────────────────────────────

describe('Unity export - World Map file generation', () => {
  it('generates WorldMapUI.cs in the UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const mapFile = files.find(f => f.path.endsWith('WorldMapUI.cs'));
    expect(mapFile).toBeDefined();
    expect(mapFile!.path).toContain('Assets/Scripts/UI/');
  });

  it('is a non-empty file', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const mapFile = files.find(f => f.path.endsWith('WorldMapUI.cs'));
    expect(mapFile!.content.length).toBeGreaterThan(100);
  });
});

// ─────────────────────────────────────────────
// Conditional inclusion
// ─────────────────────────────────────────────

describe('Unity export - World Map conditional inclusion', () => {
  it('includes world map when ui has no menuConfig (default enabled)', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const mapFile = files.find(f => f.path.endsWith('WorldMapUI.cs'));
    expect(mapFile).toBeDefined();
  });

  it('includes world map when mapScreen.enabled is true', () => {
    const ir = makeMinimalIR();
    (ir.ui as any).menuConfig = { mapScreen: { enabled: true, zoomLevels: [0.5, 1, 2, 4] } };
    const files = generateCSharpFiles(ir);
    const mapFile = files.find(f => f.path.endsWith('WorldMapUI.cs'));
    expect(mapFile).toBeDefined();
  });

  it('excludes world map when mapScreen.enabled is false', () => {
    const ir = makeMinimalIR();
    (ir.ui as any).menuConfig = { mapScreen: { enabled: false, zoomLevels: [] } };
    const files = generateCSharpFiles(ir);
    const mapFile = files.find(f => f.path.endsWith('WorldMapUI.cs'));
    expect(mapFile).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// Class structure
// ─────────────────────────────────────────────

describe('Unity export - World Map class structure', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('WorldMapUI.cs'))!.content;
  });

  it('is in the Insimul.UI namespace', () => {
    expect(content).toContain('namespace Insimul.UI');
  });

  it('extends MonoBehaviour', () => {
    expect(content).toContain('class WorldMapUI : MonoBehaviour');
  });

  it('imports UnityEngine.UI', () => {
    expect(content).toContain('using UnityEngine.UI');
  });

  it('imports TMPro', () => {
    expect(content).toContain('using TMPro');
  });

  it('declares MapMarkerType enum', () => {
    expect(content).toContain('enum MapMarkerType');
    expect(content).toContain('Settlement');
    expect(content).toContain('QuestObjective');
    expect(content).toContain('NPC');
    expect(content).toContain('Player');
  });

  it('declares MapMarker struct', () => {
    expect(content).toContain('struct MapMarker');
    expect(content).toContain('worldPosition');
    expect(content).toContain('markerType');
    expect(content).toContain('label');
  });

  it('declares MapRoad struct', () => {
    expect(content).toContain('struct MapRoad');
    expect(content).toContain('waypoints');
    expect(content).toContain('width');
  });
});

// ─────────────────────────────────────────────
// Toggle and game pause
// ─────────────────────────────────────────────

describe('Unity export - World Map toggle and pause', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('WorldMapUI.cs'))!.content;
  });

  it('toggles on M key press', () => {
    expect(content).toContain('KeyCode.M');
  });

  it('has ToggleMap method', () => {
    expect(content).toContain('void ToggleMap()');
  });

  it('pauses game when open (Time.timeScale = 0)', () => {
    expect(content).toContain('Time.timeScale = 0f');
  });

  it('resumes game when closed (Time.timeScale = 1)', () => {
    expect(content).toContain('Time.timeScale = 1f');
  });

  it('shows cursor when open', () => {
    expect(content).toContain('Cursor.visible = true');
  });

  it('hides cursor when closed', () => {
    expect(content).toContain('Cursor.visible = false');
  });

  it('exposes IsMapOpen property', () => {
    expect(content).toContain('IsMapOpen');
  });
});

// ─────────────────────────────────────────────
// Pan and zoom support
// ─────────────────────────────────────────────

describe('Unity export - World Map pan and zoom', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('WorldMapUI.cs'))!.content;
  });

  it('has zoom levels array', () => {
    expect(content).toContain('zoomLevels');
  });

  it('has pan offset tracking', () => {
    expect(content).toContain('_panOffset');
  });

  it('handles scroll wheel for zoom', () => {
    expect(content).toContain('Mouse ScrollWheel');
  });

  it('handles mouse drag for pan', () => {
    expect(content).toContain('_isDragging');
    expect(content).toContain('_dragStart');
  });

  it('clamps pan offset to world bounds', () => {
    expect(content).toContain('ClampPanOffset');
  });

  it('has InitializeMap method', () => {
    expect(content).toContain('void InitializeMap(float inWorldSize, float[] inZoomLevels)');
  });
});

// ─────────────────────────────────────────────
// Coordinate conversion
// ─────────────────────────────────────────────

describe('Unity export - World Map coordinate conversion', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('WorldMapUI.cs'))!.content;
  });

  it('has WorldToMap conversion method', () => {
    expect(content).toContain('WorldToMap');
  });

  it('normalizes world position by worldSize', () => {
    expect(content).toContain('worldPos.x / worldSize');
    expect(content).toContain('worldPos.y / worldSize');
  });
});

// ─────────────────────────────────────────────
// Marker management
// ─────────────────────────────────────────────

describe('Unity export - World Map markers', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('WorldMapUI.cs'))!.content;
  });

  it('has AddMarker method', () => {
    expect(content).toContain('void AddMarker(MapMarker marker)');
  });

  it('has AddRoad method', () => {
    expect(content).toContain('void AddRoad(MapRoad road)');
  });

  it('has ClearMarkersByType method', () => {
    expect(content).toContain('void ClearMarkersByType(MapMarkerType type)');
  });

  it('has UpdatePlayerPosition method', () => {
    expect(content).toContain('void UpdatePlayerPosition(Vector2 position, float rotationDegrees)');
  });

  it('creates settlement labels', () => {
    expect(content).toContain('MapMarkerType.Settlement');
    expect(content).toContain('marker.label');
  });

  it('has marker prefab references', () => {
    expect(content).toContain('settlementMarkerPrefab');
    expect(content).toContain('questMarkerPrefab');
    expect(content).toContain('npcMarkerPrefab');
  });
});

// ─────────────────────────────────────────────
// Player arrow
// ─────────────────────────────────────────────

describe('Unity export - World Map player arrow', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('WorldMapUI.cs'))!.content;
  });

  it('has player arrow RectTransform', () => {
    expect(content).toContain('RectTransform playerArrow');
  });

  it('rotates player arrow based on player rotation', () => {
    expect(content).toContain('_playerRotation');
    expect(content).toContain('Quaternion.Euler');
  });

  it('positions player arrow via WorldToMap', () => {
    expect(content).toContain('WorldToMap(_playerPosition)');
  });
});

// ─────────────────────────────────────────────
// Terrain texture generation
// ─────────────────────────────────────────────

describe('Unity export - World Map terrain texture', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('WorldMapUI.cs'))!.content;
  });

  it('has GenerateTerrainTexture static method', () => {
    expect(content).toContain('static Texture2D GenerateTerrainTexture');
  });

  it('has SetTerrainTexture method', () => {
    expect(content).toContain('void SetTerrainTexture(Texture2D texture)');
  });

  it('maps elevation to color bands', () => {
    expect(content).toContain('ElevationToColor');
  });

  it('has RawImage for terrain display', () => {
    expect(content).toContain('RawImage terrainImage');
  });

  it('cleans up terrain texture on destroy', () => {
    expect(content).toContain('OnDestroy');
    expect(content).toContain('Destroy(_terrainTexture)');
  });
});

// ─────────────────────────────────────────────
// Legend
// ─────────────────────────────────────────────

describe('Unity export - World Map legend', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('WorldMapUI.cs'))!.content;
  });

  it('displays zoom level info', () => {
    expect(content).toContain('Zoom:');
  });

  it('shows control hints', () => {
    expect(content).toContain('Scroll to zoom');
    expect(content).toContain('Drag to pan');
  });

  it('shows close key hint', () => {
    expect(content).toContain('to close');
  });
});
