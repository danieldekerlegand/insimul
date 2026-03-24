/**
 * Tests for Unity HUD enhancements: survival bars, compass, and interaction prompts.
 *
 * Verifies that:
 * - HUDManager.cs template includes survival bar, compass, and interaction prompt sections
 * - SurvivalSystem.cs exposes GetAllNeeds()
 * - InsimulPlayerController.cs includes interaction detection
 * - IInteractable.cs interface is generated
 * - C# generator includes IInteractable.cs in output
 */

import { describe, it, expect } from 'vitest';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
import { loadStaticTemplate } from '../services/game-export/unity/unity-template-loader';
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
        features: { crafting: false, resources: false, survival: true },
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
    assets: [],
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
    survival: {
      needs: [
        { id: 'hunger', name: 'Hunger', startValue: 100, maxValue: 100, decayRate: 0.5, criticalThreshold: 10, warningThreshold: 30, damageRate: 1 },
        { id: 'thirst', name: 'Thirst', startValue: 100, maxValue: 100, decayRate: 0.8, criticalThreshold: 10, warningThreshold: 30, damageRate: 1.5 },
      ],
      damageConfig: { enabled: true, globalDamageMultiplier: 1 },
      temperatureConfig: null,
      staminaConfig: null,
      modifierPresets: [],
    },
    resources: null,
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// HUDManager.cs template content
// ─────────────────────────────────────────────

describe('Unity HUDManager - survival bars', () => {
  const content = loadStaticTemplate('scripts/ui/HUDManager.cs');

  it('includes survival bar container field', () => {
    expect(content).toContain('survivalBarContainer');
  });

  it('includes survival bar prefab field', () => {
    expect(content).toContain('survivalBarPrefab');
  });

  it('calls BuildSurvivalBars in Start', () => {
    expect(content).toContain('BuildSurvivalBars()');
  });

  it('calls UpdateSurvivalBars in Update', () => {
    expect(content).toContain('UpdateSurvivalBars()');
  });

  it('reads needs from SurvivalSystem.GetAllNeeds', () => {
    expect(content).toContain('GetAllNeeds()');
  });

  it('applies color coding for critical/warning/normal states', () => {
    expect(content).toContain('Color.red');
    expect(content).toContain('Color.green');
  });
});

describe('Unity HUDManager - compass', () => {
  const content = loadStaticTemplate('scripts/ui/HUDManager.cs');

  it('includes compass bar field', () => {
    expect(content).toContain('compassBar');
  });

  it('includes compass text field', () => {
    expect(content).toContain('compassText');
  });

  it('defines all 8 compass directions', () => {
    expect(content).toContain('"N"');
    expect(content).toContain('"NE"');
    expect(content).toContain('"E"');
    expect(content).toContain('"SE"');
    expect(content).toContain('"S"');
    expect(content).toContain('"SW"');
    expect(content).toContain('"W"');
    expect(content).toContain('"NW"');
  });

  it('computes direction from camera yaw', () => {
    expect(content).toContain('eulerAngles.y');
  });

  it('calls UpdateCompass in Update', () => {
    expect(content).toContain('UpdateCompass()');
  });
});

describe('Unity HUDManager - interaction prompts', () => {
  const content = loadStaticTemplate('scripts/ui/HUDManager.cs');

  it('includes interaction prompt GameObject field', () => {
    expect(content).toContain('interactionPrompt');
  });

  it('includes interaction text field', () => {
    expect(content).toContain('interactionText');
  });

  it('displays [E] keybind with verb', () => {
    expect(content).toContain('[E] {target.InteractionVerb}');
  });

  it('reads NearestInteractable from player controller', () => {
    expect(content).toContain('NearestInteractable');
  });

  it('hides prompt when no interactable nearby', () => {
    expect(content).toContain('SetActive(false)');
  });

  it('calls UpdateInteractionPrompt in Update', () => {
    expect(content).toContain('UpdateInteractionPrompt()');
  });
});

// ─────────────────────────────────────────────
// SurvivalSystem.cs - GetAllNeeds exposure
// ─────────────────────────────────────────────

describe('Unity SurvivalSystem - GetAllNeeds', () => {
  const content = loadStaticTemplate('scripts/systems/SurvivalSystem.cs');

  it('exposes GetAllNeeds method', () => {
    expect(content).toContain('GetAllNeeds()');
  });

  it('returns IReadOnlyList<NeedState>', () => {
    expect(content).toContain('IReadOnlyList<NeedState>');
  });
});

// ─────────────────────────────────────────────
// InsimulPlayerController.cs - interaction detection
// ─────────────────────────────────────────────

describe('Unity InsimulPlayerController - interaction detection', () => {
  const content = loadStaticTemplate('scripts/characters/InsimulPlayerController.cs');

  it('has interactionRadius field defaulting to 2m', () => {
    expect(content).toContain('interactionRadius = 2f');
  });

  it('uses OverlapSphereNonAlloc for detection', () => {
    expect(content).toContain('OverlapSphereNonAlloc');
  });

  it('exposes NearestInteractable property', () => {
    expect(content).toContain('NearestInteractable');
  });

  it('calls DetectInteractables in Update', () => {
    expect(content).toContain('DetectInteractables()');
  });

  it('invokes Interact on nearest when OnInteract fires', () => {
    expect(content).toContain('_nearestInteractable.Interact()');
  });

  it('checks CanInteract before invoking', () => {
    expect(content).toContain('_nearestInteractable.CanInteract');
  });
});

// ─────────────────────────────────────────────
// IInteractable.cs interface
// ─────────────────────────────────────────────

describe('Unity IInteractable interface', () => {
  const content = loadStaticTemplate('scripts/systems/IInteractable.cs');

  it('declares IInteractable interface', () => {
    expect(content).toContain('interface IInteractable');
  });

  it('has InteractionVerb property', () => {
    expect(content).toContain('InteractionVerb');
  });

  it('has CanInteract property', () => {
    expect(content).toContain('CanInteract');
  });

  it('has Interact method', () => {
    expect(content).toContain('void Interact()');
  });
});

// ─────────────────────────────────────────────
// C# generator includes IInteractable
// ─────────────────────────────────────────────

describe('Unity C# generator - HUD and interaction files', () => {
  const ir = makeMinimalIR();
  const files = generateCSharpFiles(ir);

  it('includes IInteractable.cs in output', () => {
    const file = files.find(f => f.path.endsWith('IInteractable.cs'));
    expect(file).toBeDefined();
    expect(file!.content).toContain('interface IInteractable');
  });

  it('includes HUDManager.cs in output', () => {
    const file = files.find(f => f.path.endsWith('HUDManager.cs'));
    expect(file).toBeDefined();
    expect(file!.content).toContain('survivalBarContainer');
    expect(file!.content).toContain('compassText');
    expect(file!.content).toContain('interactionPrompt');
  });

  it('includes SurvivalSystem.cs when survival is enabled', () => {
    const file = files.find(f => f.path.endsWith('SurvivalSystem.cs'));
    expect(file).toBeDefined();
    expect(file!.content).toContain('GetAllNeeds');
  });

  it('InsimulPlayerController.cs has interaction detection', () => {
    const file = files.find(f => f.path.endsWith('InsimulPlayerController.cs'));
    expect(file).toBeDefined();
    expect(file!.content).toContain('NearestInteractable');
    expect(file!.content).toContain('interactionRadius');
  });
});
