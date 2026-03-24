/**
 * Tests for Unity dialogue UI panel export
 *
 * Verifies that the Unity export pipeline correctly generates:
 * - DialogueUI.cs template file in the UI directory
 * - NPC info sidebar with portrait, name, disposition, relationship
 * - Chat area with message scroll, input, send button
 * - Social action buttons panel
 * - Conditional inclusion based on dialogueScreen.enabled
 * - Close with T/Escape key, cursor management
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

describe('Unity export - DialogueUI file generation', () => {
  it('generates DialogueUI.cs in the UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const dialogueFile = files.find(f => f.path.endsWith('DialogueUI.cs'));
    expect(dialogueFile).toBeDefined();
    expect(dialogueFile!.path).toContain('Assets/Scripts/UI/');
  });

  it('is a non-empty file', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const dialogueFile = files.find(f => f.path.endsWith('DialogueUI.cs'));
    expect(dialogueFile!.content.length).toBeGreaterThan(100);
  });
});

// ─────────────────────────────────────────────
// Conditional inclusion
// ─────────────────────────────────────────────

describe('Unity export - DialogueUI conditional inclusion', () => {
  it('includes dialogue UI when ui has no menuConfig (default enabled)', () => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    const dialogueFile = files.find(f => f.path.endsWith('DialogueUI.cs'));
    expect(dialogueFile).toBeDefined();
  });

  it('includes dialogue UI when dialogueScreen.enabled is true', () => {
    const ir = makeMinimalIR();
    (ir.ui as any).menuConfig = { dialogueScreen: { enabled: true, showDisposition: true, showRelationship: true, showActions: true } };
    const files = generateCSharpFiles(ir);
    const dialogueFile = files.find(f => f.path.endsWith('DialogueUI.cs'));
    expect(dialogueFile).toBeDefined();
  });

  it('excludes dialogue UI when dialogueScreen.enabled is false', () => {
    const ir = makeMinimalIR();
    (ir.ui as any).menuConfig = { dialogueScreen: { enabled: false, showDisposition: false, showRelationship: false, showActions: false } };
    const files = generateCSharpFiles(ir);
    const dialogueFile = files.find(f => f.path.endsWith('DialogueUI.cs'));
    expect(dialogueFile).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// Class structure
// ─────────────────────────────────────────────

describe('Unity export - DialogueUI class structure', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('DialogueUI.cs'))!.content;
  });

  it('is in the Insimul.UI namespace', () => {
    expect(content).toContain('namespace Insimul.UI');
  });

  it('extends MonoBehaviour', () => {
    expect(content).toContain('class DialogueUI : MonoBehaviour');
  });

  it('imports UnityEngine.UI', () => {
    expect(content).toContain('using UnityEngine.UI');
  });

  it('imports TMPro', () => {
    expect(content).toContain('using TMPro');
  });

  it('imports Insimul.Systems for DialogueSystem', () => {
    expect(content).toContain('using Insimul.Systems');
  });

  it('imports Insimul.Data for dialogue contexts', () => {
    expect(content).toContain('using Insimul.Data');
  });

  it('imports Insimul.Services for AI service', () => {
    expect(content).toContain('using Insimul.Services');
  });
});

// ─────────────────────────────────────────────
// NPC info sidebar
// ─────────────────────────────────────────────

describe('Unity export - DialogueUI NPC info sidebar', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('DialogueUI.cs'))!.content;
  });

  it('has NPC name text field', () => {
    expect(content).toContain('_npcNameText');
    expect(content).toContain('TextMeshProUGUI');
  });

  it('has NPC description text', () => {
    expect(content).toContain('_npcDescriptionText');
  });

  it('has NPC portrait image', () => {
    expect(content).toContain('_npcPortrait');
    expect(content).toContain('Image');
  });

  it('has disposition bar (slider)', () => {
    expect(content).toContain('_dispositionBar');
    expect(content).toContain('Slider');
  });

  it('has disposition text label', () => {
    expect(content).toContain('_dispositionText');
  });

  it('has relationship text', () => {
    expect(content).toContain('_relationshipText');
  });

  it('has SetDisposition method', () => {
    expect(content).toContain('void SetDisposition(float value)');
  });

  it('has SetRelationship method', () => {
    expect(content).toContain('void SetRelationship(string label)');
  });

  it('maps disposition value to labels', () => {
    expect(content).toContain('Friendly');
    expect(content).toContain('Warm');
    expect(content).toContain('Neutral');
    expect(content).toContain('Cool');
    expect(content).toContain('Hostile');
  });

  it('maps disposition value to colors', () => {
    expect(content).toContain('GetDispositionColor');
  });

  it('truncates long descriptions', () => {
    expect(content).toContain('TruncateDescription');
  });
});

// ─────────────────────────────────────────────
// Chat area
// ─────────────────────────────────────────────

describe('Unity export - DialogueUI chat area', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('DialogueUI.cs'))!.content;
  });

  it('has chat scroll rect', () => {
    expect(content).toContain('_chatScrollRect');
    expect(content).toContain('ScrollRect');
  });

  it('has chat content container', () => {
    expect(content).toContain('_chatContent');
    expect(content).toContain('RectTransform');
  });

  it('has chat input field', () => {
    expect(content).toContain('_chatInput');
    expect(content).toContain('TMP_InputField');
  });

  it('has send button', () => {
    expect(content).toContain('_sendButton');
  });

  it('has player message prefab reference', () => {
    expect(content).toContain('_playerMessagePrefab');
  });

  it('has NPC message prefab reference', () => {
    expect(content).toContain('_npcMessagePrefab');
  });

  it('creates programmatic message bubbles as fallback', () => {
    expect(content).toContain('CreateMessageBubble');
    expect(content).toContain('PlayerMsg');
    expect(content).toContain('NPCMsg');
  });

  it('scrolls to bottom after messages', () => {
    expect(content).toContain('ScrollToBottom');
    expect(content).toContain('verticalNormalizedPosition');
  });

  it('streams AI responses', () => {
    expect(content).toContain('_isStreaming');
    expect(content).toContain('_streamingMessageText');
    expect(content).toContain('onChunk');
    expect(content).toContain('onComplete');
  });

  it('integrates with InsimulAIService', () => {
    expect(content).toContain('InsimulAIService.Instance');
    expect(content).toContain('SendMessage');
    expect(content).toContain('GetContext');
  });

  it('shows NPC greeting on open', () => {
    expect(content).toContain('ctx.greeting');
    expect(content).toContain('AddNPCMessage');
  });
});

// ─────────────────────────────────────────────
// Social action buttons
// ─────────────────────────────────────────────

describe('Unity export - DialogueUI action buttons', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('DialogueUI.cs'))!.content;
  });

  it('has action button container', () => {
    expect(content).toContain('_actionButtonContainer');
  });

  it('has action button prefab reference', () => {
    expect(content).toContain('_actionButtonPrefab');
  });

  it('populates action buttons from DialogueSystem', () => {
    expect(content).toContain('PopulateActionButtons');
    expect(content).toContain('GetAvailableActions');
  });

  it('handles action button clicks', () => {
    expect(content).toContain('OnActionButtonClicked');
    expect(content).toContain('SelectAction');
  });

  it('shows energy cost', () => {
    expect(content).toContain('_energyText');
    expect(content).toContain('Energy:');
  });

  it('refreshes actions after selection', () => {
    expect(content).toContain('PopulateActionButtons');
  });

  it('clears action buttons on close/refresh', () => {
    expect(content).toContain('ClearActionButtons');
  });

  it('has "Actions" label in sidebar', () => {
    expect(content).toContain('"Actions"');
  });
});

// ─────────────────────────────────────────────
// Open/close and controls
// ─────────────────────────────────────────────

describe('Unity export - DialogueUI open/close controls', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('DialogueUI.cs'))!.content;
  });

  it('has Open method accepting NPC ID', () => {
    expect(content).toContain('void Open(string npcId)');
  });

  it('has Close method', () => {
    expect(content).toContain('void Close()');
  });

  it('exposes IsOpen property', () => {
    expect(content).toContain('bool IsOpen');
  });

  it('closes on T key', () => {
    expect(content).toContain('KeyCode.T');
  });

  it('closes on Escape key', () => {
    expect(content).toContain('KeyCode.Escape');
  });

  it('shows cursor when open', () => {
    expect(content).toContain('Cursor.visible = true');
  });

  it('hides cursor when closed', () => {
    expect(content).toContain('Cursor.visible = false');
  });

  it('locks cursor when closed', () => {
    expect(content).toContain('CursorLockMode.Locked');
  });

  it('unlocks cursor when open', () => {
    expect(content).toContain('CursorLockMode.None');
  });

  it('ends dialogue via DialogueSystem on close', () => {
    expect(content).toContain('_dialogueSystem?.EndDialogue()');
  });

  it('shows close hint text', () => {
    expect(content).toContain('Press T or Escape to close');
  });

  it('has close button', () => {
    expect(content).toContain('_closeButton');
  });

  it('activates input field on open', () => {
    expect(content).toContain('ActivateInputField');
  });
});

// ─────────────────────────────────────────────
// Programmatic UI layout
// ─────────────────────────────────────────────

describe('Unity export - DialogueUI programmatic UI creation', () => {
  let content: string;

  beforeAll(() => {
    const ir = makeMinimalIR();
    const files = generateCSharpFiles(ir);
    content = files.find(f => f.path.endsWith('DialogueUI.cs'))!.content;
  });

  it('creates UI programmatically if panel is null', () => {
    expect(content).toContain('if (_dialoguePanel == null) CreateUI()');
  });

  it('uses horizontal layout for main panel (sidebar + chat)', () => {
    expect(content).toContain('HorizontalLayoutGroup');
  });

  it('creates sidebar with fixed width', () => {
    expect(content).toContain('CreateSidebar');
    expect(content).toContain('preferredWidth = 250');
  });

  it('creates chat area with flexible width', () => {
    expect(content).toContain('CreateChatArea');
    expect(content).toContain('flexibleWidth = 1');
  });

  it('creates slider for disposition bar', () => {
    expect(content).toContain('CreateSlider');
    expect(content).toContain('fillRect');
  });

  it('uses screen-space overlay canvas', () => {
    expect(content).toContain('RenderMode.ScreenSpaceOverlay');
  });

  it('uses high sort order above other UI', () => {
    expect(content).toContain('sortingOrder = 110');
  });

  it('creates portrait placeholder', () => {
    expect(content).toContain('"Portrait"');
  });

  it('creates vertical layout for action buttons', () => {
    expect(content).toContain('"ActionButtons"');
    expect(content).toContain('VerticalLayoutGroup');
  });
});
