/**
 * Tests for Unreal dialogue UI widget export
 *
 * Verifies that the Unreal export pipeline correctly generates
 * the DialogueWidget UMG C++ files with proper structure and integration.
 */

import { describe, it, expect } from 'vitest';
import { generateCppFiles } from '../services/game-export/unreal/unreal-cpp-generator';
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
// DialogueWidget file generation
// ─────────────────────────────────────────────

describe('Unreal export - DialogueWidget UI', () => {
  it('generates DialogueWidget.h in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetH = files.find(f => f.path.endsWith('UI/DialogueWidget.h'));
    expect(widgetH).toBeDefined();
  });

  it('generates DialogueWidget.cpp in UI directory', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetCpp = files.find(f => f.path.endsWith('UI/DialogueWidget.cpp'));
    expect(widgetCpp).toBeDefined();
  });

  it('header declares UDialogueWidget as UUserWidget subclass', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetH = files.find(f => f.path.endsWith('UI/DialogueWidget.h'))!;
    expect(widgetH.content).toContain('class INSIMULEXPORT_API UDialogueWidget : public UUserWidget');
  });

  it('header includes required UMG component forward declarations', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetH = files.find(f => f.path.endsWith('UI/DialogueWidget.h'))!;
    expect(widgetH.content).toContain('UVerticalBox');
    expect(widgetH.content).toContain('UScrollBox');
    expect(widgetH.content).toContain('UEditableTextBox');
    expect(widgetH.content).toContain('UTextBlock');
    expect(widgetH.content).toContain('UButton');
  });

  it('header declares OpenDialogue and CloseDialogue methods', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetH = files.find(f => f.path.endsWith('UI/DialogueWidget.h'))!;
    expect(widgetH.content).toContain('void OpenDialogue(const FString& NPCId)');
    expect(widgetH.content).toContain('void CloseDialogue()');
  });

  it('header declares AddChatMessage method', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetH = files.find(f => f.path.endsWith('UI/DialogueWidget.h'))!;
    expect(widgetH.content).toContain('void AddChatMessage(const FString& Speaker, const FString& Message, bool bIsPlayer)');
  });

  it('header declares RefreshActions method with energy parameter', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetH = files.find(f => f.path.endsWith('UI/DialogueWidget.h'))!;
    expect(widgetH.content).toContain('void RefreshActions(float PlayerEnergy)');
  });

  it('header declares BindWidgetOptional UI components', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetH = files.find(f => f.path.endsWith('UI/DialogueWidget.h'))!;
    expect(widgetH.content).toContain('BindWidgetOptional');
    expect(widgetH.content).toContain('NPCNameText');
    expect(widgetH.content).toContain('ChatScrollBox');
    expect(widgetH.content).toContain('PlayerInputBox');
    expect(widgetH.content).toContain('SendButton');
    expect(widgetH.content).toContain('CloseButton');
    expect(widgetH.content).toContain('ActionsContainer');
  });

  it('header includes DialogueContextData dependency', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetH = files.find(f => f.path.endsWith('UI/DialogueWidget.h'))!;
    expect(widgetH.content).toContain('#include "Data/DialogueContextData.h"');
  });

  it('cpp includes DialogueSystem integration', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetCpp = files.find(f => f.path.endsWith('UI/DialogueWidget.cpp'))!;
    expect(widgetCpp.content).toContain('#include "Systems/DialogueSystem.h"');
    expect(widgetCpp.content).toContain('#include "Services/InsimulAIService.h"');
  });

  it('cpp implements OpenDialogue with NPC context lookup', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetCpp = files.find(f => f.path.endsWith('UI/DialogueWidget.cpp'))!;
    expect(widgetCpp.content).toContain('UDialogueWidget::OpenDialogue');
    expect(widgetCpp.content).toContain('GetContext(NPCId)');
    expect(widgetCpp.content).toContain('StartDialogue(NPCId)');
  });

  it('cpp implements CloseDialogue with cleanup', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetCpp = files.find(f => f.path.endsWith('UI/DialogueWidget.cpp'))!;
    expect(widgetCpp.content).toContain('UDialogueWidget::CloseDialogue');
    expect(widgetCpp.content).toContain('EndDialogue()');
    expect(widgetCpp.content).toContain('ClearHistory');
    expect(widgetCpp.content).toContain('ESlateVisibility::Collapsed');
  });

  it('cpp implements SendPlayerMessage with AI service', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetCpp = files.find(f => f.path.endsWith('UI/DialogueWidget.cpp'))!;
    expect(widgetCpp.content).toContain('UDialogueWidget::SendPlayerMessage');
    expect(widgetCpp.content).toContain('AIService->SendMessage(CurrentNPCId, Message)');
  });

  it('cpp implements streaming response handling', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetCpp = files.find(f => f.path.endsWith('UI/DialogueWidget.cpp'))!;
    expect(widgetCpp.content).toContain('OnAIChatChunk');
    expect(widgetCpp.content).toContain('OnAIChatComplete');
    expect(widgetCpp.content).toContain('OnAIChatError');
    expect(widgetCpp.content).toContain('StreamingResponseText');
  });

  it('cpp creates action buttons with energy cost and affordability', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetCpp = files.find(f => f.path.endsWith('UI/DialogueWidget.cpp'))!;
    expect(widgetCpp.content).toContain('CreateActionButton');
    expect(widgetCpp.content).toContain('EnergyCost');
    expect(widgetCpp.content).toContain('bCanAfford');
  });

  it('cpp auto-scrolls chat to bottom on new messages', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const widgetCpp = files.find(f => f.path.endsWith('UI/DialogueWidget.cpp'))!;
    expect(widgetCpp.content).toContain('ScrollToEnd');
  });

  it('UI files are included alongside other C++ files', () => {
    const ir = makeMinimalIR();
    const files = generateCppFiles(ir);
    const uiFiles = files.filter(f => f.path.includes('/UI/'));
    expect(uiFiles).toHaveLength(2);
    expect(uiFiles.map(f => f.path.split('/').pop())).toContain('DialogueWidget.h');
    expect(uiFiles.map(f => f.path.split('/').pop())).toContain('DialogueWidget.cpp');
  });
});
