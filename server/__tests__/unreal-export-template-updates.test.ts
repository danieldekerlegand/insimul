/**
 * Tests for Unreal export template updates (US-062)
 *
 * Verifies that the Unreal export pipeline correctly generates:
 * - Lot DataTable from settlement lots
 * - Infrastructure structured data (not just JSON string)
 * - Elevation profile fields in settlement DataTable
 * - All data struct headers are included in C++ output
 */

import { describe, it, expect } from 'vitest';
import { generateDataTableFiles } from '../services/game-export/unreal/unreal-datatable-generator';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Minimal WorldIR fixture
// ─────────────────────────────────────────────

function makeMinimalIR(overrides?: Partial<WorldIR>): WorldIR {
  const base: WorldIR = {
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
      settlements: [
        {
          id: 'settlement-1',
          worldId: 'test-world',
          countryId: null,
          stateId: null,
          name: 'Testville',
          description: 'A test settlement',
          settlementType: 'town',
          terrain: null,
          population: 150,
          foundedYear: 1850,
          founderIds: [],
          mayorId: null,
          position: { x: 10, y: 0, z: 20 },
          radius: 50,
          elevationProfile: {
            minElevation: 5,
            maxElevation: 25,
            meanElevation: 15,
            elevationRange: 20,
            slopeClass: 'gentle',
          },
          lots: [
            {
              id: 'lot-1',
              address: '1 Main St',
              houseNumber: 1,
              streetName: 'Main St',
              block: 'A',
              districtName: 'Downtown',
              position: { x: 11, y: 0, z: 21 },
              buildingType: 'residential',
              buildingId: 'bld-1',
            },
            {
              id: 'lot-2',
              address: '2 Main St',
              houseNumber: 2,
              streetName: 'Main St',
              block: 'A',
              districtName: 'Downtown',
              position: { x: 12, y: 0, z: 22 },
              buildingType: 'commercial',
              buildingId: null,
            },
          ],
          businessIds: [],
          internalRoads: [],
          infrastructure: [
            { id: 'inf-1', name: 'Town Well', category: 'water', level: 2, builtYear: 1860, description: 'Public water well' },
            { id: 'inf-2', name: 'Market Square', category: 'commerce', level: 1, builtYear: 1855, description: 'Central marketplace' },
          ],
          streetNetwork: { layout: 'grid', nodes: [], segments: [] },
        },
      ],
      waterFeatures: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [
        {
          id: 'bld-1',
          settlementId: 'settlement-1',
          position: { x: 11, y: 0, z: 21 },
          rotation: 0,
          spec: { buildingRole: 'house', floors: 2, width: 8, depth: 10, hasChimney: true, hasBalcony: false },
          style: {} as any,
          occupantIds: ['char-1'],
          interior: null,
          businessId: null,
          modelAssetKey: null,
        },
      ],
      businesses: [],
      roads: [],
      natureObjects: [],
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

  return { ...base, ...overrides };
}

// ─────────────────────────────────────────────
// Lot DataTable
// ─────────────────────────────────────────────

describe('Unreal export - Lot DataTable', () => {
  it('generates DT_Lots.json file', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const lotsFile = files.find(f => f.path.endsWith('DT_Lots.json'));
    expect(lotsFile).toBeDefined();
  });

  it('exports all lots from all settlements', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const lotsFile = files.find(f => f.path.endsWith('DT_Lots.json'))!;
    const lots = JSON.parse(lotsFile.content);
    expect(lots).toHaveLength(2);
  });

  it('includes lot fields with correct values', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const lotsFile = files.find(f => f.path.endsWith('DT_Lots.json'))!;
    const lots = JSON.parse(lotsFile.content);
    const lot1 = lots.find((l: any) => l.LotId === 'lot-1');
    expect(lot1).toBeDefined();
    expect(lot1.Address).toBe('1 Main St');
    expect(lot1.HouseNumber).toBe(1);
    expect(lot1.StreetName).toBe('Main St');
    expect(lot1.Block).toBe('A');
    expect(lot1.DistrictName).toBe('Downtown');
    expect(lot1.BuildingType).toBe('residential');
    expect(lot1.BuildingId).toBe('bld-1');
    expect(lot1.SettlementId).toBe('settlement-1');
  });

  it('converts lot positions to Unreal coordinate system (Z-up, cm)', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const lotsFile = files.find(f => f.path.endsWith('DT_Lots.json'))!;
    const lots = JSON.parse(lotsFile.content);
    const lot1 = lots.find((l: any) => l.LotId === 'lot-1');
    // IR position {x:11, y:0, z:21} → Unreal {X:1100, Y:2100, Z:0}
    expect(lot1.Position.X).toBe(1100);
    expect(lot1.Position.Y).toBe(2100);
    expect(lot1.Position.Z).toBe(0);
  });

  it('handles null optional lot fields gracefully', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const lotsFile = files.find(f => f.path.endsWith('DT_Lots.json'))!;
    const lots = JSON.parse(lotsFile.content);
    const lot2 = lots.find((l: any) => l.LotId === 'lot-2');
    expect(lot2.BuildingId).toBe('');
  });
});

// ─────────────────────────────────────────────
// Settlement elevation profile in DataTable
// ─────────────────────────────────────────────

describe('Unreal export - Settlement elevation profile', () => {
  it('includes elevation fields in settlement DataTable', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const settFile = files.find(f => f.path.endsWith('DT_Settlements.json'))!;
    const settlements = JSON.parse(settFile.content);
    const s = settlements[0];
    expect(s.MinElevation).toBe(500);   // 5 * 100
    expect(s.MaxElevation).toBe(2500);  // 25 * 100
    expect(s.MeanElevation).toBe(1500); // 15 * 100
    expect(s.ElevationRange).toBe(2000); // 20 * 100
    expect(s.SlopeClass).toBe('gentle');
  });

  it('defaults elevation to 0 when profile is null', () => {
    const ir = makeMinimalIR();
    ir.geography.settlements[0].elevationProfile = null;
    const files = generateDataTableFiles(ir);
    const settFile = files.find(f => f.path.endsWith('DT_Settlements.json'))!;
    const settlements = JSON.parse(settFile.content);
    const s = settlements[0];
    expect(s.MinElevation).toBe(0);
    expect(s.MaxElevation).toBe(0);
    expect(s.MeanElevation).toBe(0);
    expect(s.ElevationRange).toBe(0);
    expect(s.SlopeClass).toBe('flat');
  });
});

// ─────────────────────────────────────────────
// Settlement infrastructure in DataTable
// ─────────────────────────────────────────────

describe('Unreal export - Settlement infrastructure', () => {
  it('exports infrastructure as structured array', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const settFile = files.find(f => f.path.endsWith('DT_Settlements.json'))!;
    const settlements = JSON.parse(settFile.content);
    const s = settlements[0];
    expect(Array.isArray(s.Infrastructure)).toBe(true);
    expect(s.Infrastructure).toHaveLength(2);
  });

  it('includes all infrastructure fields', () => {
    const ir = makeMinimalIR();
    const files = generateDataTableFiles(ir);
    const settFile = files.find(f => f.path.endsWith('DT_Settlements.json'))!;
    const settlements = JSON.parse(settFile.content);
    const inf = settlements[0].Infrastructure[0];
    expect(inf.Id).toBe('inf-1');
    expect(inf.Name).toBe('Town Well');
    expect(inf.Category).toBe('water');
    expect(inf.Level).toBe(2);
    expect(inf.BuiltYear).toBe(1860);
    expect(inf.Description).toBe('Public water well');
  });

  it('handles empty infrastructure array', () => {
    const ir = makeMinimalIR();
    ir.geography.settlements[0].infrastructure = [];
    const files = generateDataTableFiles(ir);
    const settFile = files.find(f => f.path.endsWith('DT_Settlements.json'))!;
    const settlements = JSON.parse(settFile.content);
    expect(settlements[0].Infrastructure).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// C++ generator includes all data structs
// ─────────────────────────────────────────────

describe('Unreal export - C++ data struct completeness', () => {
  it('includes WaterFeatureData.h in generated files', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const wf = files.find(f => f.path.endsWith('WaterFeatureData.h'));
    expect(wf).toBeDefined();
    expect(wf!.content).toContain('FInsimulWaterFeatureData');
  });

  it('includes GameTypes.h in generated files', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const gt = files.find(f => f.path.endsWith('GameTypes.h'));
    expect(gt).toBeDefined();
    expect(gt!.content).toContain('FInsimulShopItem');
  });

  it('includes LotData.h in generated files', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const ld = files.find(f => f.path.endsWith('LotData.h'));
    expect(ld).toBeDefined();
    expect(ld!.content).toContain('FInsimulLotData');
  });

  it('includes InfrastructureData.h in generated files', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const id = files.find(f => f.path.endsWith('InfrastructureData.h'));
    expect(id).toBeDefined();
    expect(id!.content).toContain('FInsimulInfrastructureItem');
  });

  it('includes all expected data struct headers', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const dataFiles = files.filter(f => f.path.includes('/Data/'));
    const names = dataFiles.map(f => f.path.split('/').pop());
    expect(names).toContain('CharacterData.h');
    expect(names).toContain('NPCData.h');
    expect(names).toContain('ActionData.h');
    expect(names).toContain('RuleData.h');
    expect(names).toContain('QuestData.h');
    expect(names).toContain('SettlementData.h');
    expect(names).toContain('BuildingData.h');
    expect(names).toContain('DialogueContextData.h');
    expect(names).toContain('WaterFeatureData.h');
    expect(names).toContain('GameTypes.h');
    expect(names).toContain('LotData.h');
    expect(names).toContain('InfrastructureData.h');
  });
});
