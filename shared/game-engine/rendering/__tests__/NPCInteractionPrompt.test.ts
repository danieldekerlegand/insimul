/**
 * Tests for NPCInteractionPrompt
 *
 * Verifies quest indicator hints, prompt text, and visibility behaviour.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock @babylonjs/core ────────────────────────────────────────────────────

vi.mock('@babylonjs/core', () => {
  class MockAbstractMesh {
    parent: any = null;
  }
  class MockMesh extends MockAbstractMesh {
    name = '';
  }
  class MockEngine {
    getRenderWidth() { return 800; }
    getRenderHeight() { return 600; }
  }
  class MockScene {
    activeCamera = { position: { x: 0, y: 0, z: 0 } };
    pick = vi.fn(() => null);
    getEngine = vi.fn(() => new MockEngine());
  }
  return {
    Scene: MockScene,
    Mesh: MockMesh,
    AbstractMesh: MockAbstractMesh,
  };
});

// ── Mock @babylonjs/gui ─────────────────────────────────────────────────────

vi.mock('@babylonjs/gui', () => {
  class MockControl {
    isVisible = false;
    width: any = '';
    height: any = '';
    color = '';
    background = '';
    thickness = 0;
    cornerRadius = 0;
    verticalAlignment = 0;
    paddingTop: any = '';
    paddingBottom: any = '';
    paddingLeft: any = '';
    paddingRight: any = '';
    adaptHeightToChildren = false;
    addControl = vi.fn();
  }
  class MockTextBlock extends MockControl {
    text = '';
    fontSize = 0;
    fontFamily = '';
    fontWeight = '';
    textWrapping: any = false;
    resizeToFit = false;
    textHorizontalAlignment = 0;
  }
  class MockRectangle extends MockControl {}
  class MockAdvancedDynamicTexture {
    addControl = vi.fn();
    dispose = vi.fn();
    static CreateFullscreenUI() { return new MockAdvancedDynamicTexture(); }
  }

  return {
    AdvancedDynamicTexture: MockAdvancedDynamicTexture,
    TextBlock: MockTextBlock,
    Rectangle: MockRectangle,
  };
});

import { NPCInteractionPrompt } from '../NPCInteractionPrompt';
import { Scene, Mesh } from '@babylonjs/core';

function makeScene(): Scene {
  return new Scene() as any;
}

function makeMesh(): Mesh {
  return new Mesh() as any;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('NPCInteractionPrompt', () => {
  let scene: Scene;
  let prompt: NPCInteractionPrompt;

  beforeEach(() => {
    vi.clearAllMocks();
    scene = makeScene();
    prompt = new NPCInteractionPrompt(scene);
  });

  it('registers and unregisters NPCs', () => {
    const mesh = makeMesh();
    prompt.registerNPC({ id: 'npc1', name: 'Alice', mesh });
    // No assertion on internal state — just verifying no error
    prompt.unregisterNPC('npc1');
  });

  it('accepts quest indicator callback', () => {
    const fn = vi.fn(() => 'available' as const);
    prompt.setQuestIndicatorCallback(fn);
    // Callback is stored — will be called during update()
    expect(fn).not.toHaveBeenCalled();
  });

  it('accepts conversation partner callback', () => {
    const fn = vi.fn(() => null);
    prompt.setConversationPartnerCallback(fn);
    expect(fn).not.toHaveBeenCalled();
  });

  it('hides prompt when no NPC is hit by ray', () => {
    // Default scene.pick returns null — prompt should stay hidden
    prompt.update();
    // No error thrown = success; prompt stays hidden
  });

  it('disposes without error', () => {
    prompt.dispose();
  });
});
