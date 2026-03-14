import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @babylonjs/gui before importing the panel
vi.mock('@babylonjs/gui', () => {
  class MockControl {
    children: MockControl[] = [];
    isVisible = true;
    width = '';
    height = '';
    color = '';
    background = '';
    cornerRadius = 0;
    thickness = 0;
    fontSize = 0;
    fontWeight = '';
    text = '';
    left = '';
    top = '';
    zIndex = 0;
    spacing = 0;
    isVertical = true;
    textWrapping = false;
    barColor = '';
    barBackground = '';
    horizontalAlignment = 0;
    verticalAlignment = 0;
    textHorizontalAlignment = 0;
    isPointerBlocker = false;
    onPointerUpObservable = { add: vi.fn() };
    onPointerEnterObservable = { add: vi.fn() };
    onPointerOutObservable = { add: vi.fn() };

    addControl(child: MockControl) { this.children.push(child); return this; }
    removeControl(child: MockControl) {
      const idx = this.children.indexOf(child);
      if (idx >= 0) this.children.splice(idx, 1);
      return this;
    }
    dispose() { this.children = []; }
  }

  class MockRectangle extends MockControl {
    constructor(public name?: string) { super(); }
  }

  class MockTextBlock extends MockControl {
    constructor(public name?: string) { super(); }
  }

  class MockStackPanel extends MockControl {
    constructor(public name?: string) { super(); }
  }

  class MockScrollViewer extends MockControl {
    constructor(public name?: string) { super(); }
  }

  class MockButton extends MockControl {
    constructor(public name?: string) { super(); }
    static CreateSimpleButton(name: string, text: string) {
      const btn = new MockButton(name);
      btn.text = text;
      return btn;
    }
  }

  class MockAdvancedDynamicTexture extends MockControl {
    static CreateFullscreenUI() { return new MockAdvancedDynamicTexture(); }
  }

  return {
    Rectangle: MockRectangle,
    TextBlock: MockTextBlock,
    StackPanel: MockStackPanel,
    ScrollViewer: MockScrollViewer,
    Button: MockButton,
    AdvancedDynamicTexture: MockAdvancedDynamicTexture,
    Control: {
      HORIZONTAL_ALIGNMENT_CENTER: 2,
      HORIZONTAL_ALIGNMENT_LEFT: 0,
      HORIZONTAL_ALIGNMENT_RIGHT: 1,
      VERTICAL_ALIGNMENT_CENTER: 2,
      VERTICAL_ALIGNMENT_TOP: 0,
      VERTICAL_ALIGNMENT_BOTTOM: 1,
    },
  };
});

import * as GUI from '@babylonjs/gui';
import { BabylonSkillTreePanel, type SkillTreeStats } from '../BabylonSkillTreePanel';

function createMockTexture(): GUI.AdvancedDynamicTexture {
  return GUI.AdvancedDynamicTexture.CreateFullscreenUI('test') as unknown as GUI.AdvancedDynamicTexture;
}

function createStats(overrides: Partial<SkillTreeStats> = {}): SkillTreeStats {
  return {
    wordsLearned: 0,
    wordsMastered: 0,
    conversations: 0,
    grammarPatterns: 0,
    avgTargetLanguagePct: 0,
    fluency: 0,
    maxSustainedTurns: 0,
    questsCompleted: 0,
    ...overrides,
  };
}

// Helper: find a named control recursively in the mock GUI tree
function findControl(root: any, name: string): any | null {
  if (root.name === name) return root;
  for (const child of (root.children || [])) {
    const found = findControl(child, name);
    if (found) return found;
  }
  return null;
}

// Helper: find all controls matching a name prefix
function findControlsByPrefix(root: any, prefix: string): any[] {
  const results: any[] = [];
  if (root.name?.startsWith(prefix)) results.push(root);
  for (const child of (root.children || [])) {
    results.push(...findControlsByPrefix(child, prefix));
  }
  return results;
}

describe('BabylonSkillTreePanel', () => {
  let texture: GUI.AdvancedDynamicTexture;
  let panel: BabylonSkillTreePanel;

  beforeEach(() => {
    texture = createMockTexture();
    panel = new BabylonSkillTreePanel(texture);
  });

  // --- Visibility ---

  it('starts hidden', () => {
    expect(panel.getIsVisible()).toBe(false);
  });

  it('shows when show() is called', () => {
    panel.show();
    expect(panel.getIsVisible()).toBe(true);
  });

  it('hides when hide() is called', () => {
    panel.show();
    panel.hide();
    expect(panel.getIsVisible()).toBe(false);
  });

  it('toggles visibility', () => {
    panel.toggle();
    expect(panel.getIsVisible()).toBe(true);
    panel.toggle();
    expect(panel.getIsVisible()).toBe(false);
  });

  // --- State management ---

  it('initializes with all 15 nodes locked', () => {
    const state = panel.getState();
    expect(state.nodes).toHaveLength(15);
    expect(state.nodes.every(n => !n.unlocked)).toBe(true);
  });

  it('getState returns a deep copy', () => {
    const state1 = panel.getState();
    state1.nodes[0].unlocked = true;
    const state2 = panel.getState();
    expect(state2.nodes[0].unlocked).toBe(false);
  });

  // --- Stats and unlocking ---

  it('unlocks nodes when stats meet thresholds', () => {
    const onUnlock = vi.fn();
    panel.setOnSkillUnlocked(onUnlock);
    panel.updateStats(createStats({ wordsLearned: 10, conversations: 3 }));

    const state = panel.getState();
    const greetings = state.nodes.find(n => n.id === 'greetings')!;
    const firstChat = state.nodes.find(n => n.id === 'first_chat')!;
    const wordHunter = state.nodes.find(n => n.id === 'word_hunter')!;

    expect(greetings.unlocked).toBe(true);
    expect(firstChat.unlocked).toBe(true);
    expect(wordHunter.unlocked).toBe(true);
    expect(onUnlock).toHaveBeenCalledTimes(3);
  });

  it('tracks partial progress for unmet thresholds', () => {
    panel.updateStats(createStats({ wordsLearned: 3 }));
    const state = panel.getState();
    const greetings = state.nodes.find(n => n.id === 'greetings')!;
    expect(greetings.progress).toBeCloseTo(0.6); // 3/5
    expect(greetings.unlocked).toBe(false);
  });

  it('does not re-unlock already unlocked nodes', () => {
    const onUnlock = vi.fn();
    panel.setOnSkillUnlocked(onUnlock);
    panel.updateStats(createStats({ wordsLearned: 10 }));
    onUnlock.mockClear();
    panel.updateStats(createStats({ wordsLearned: 20 }));
    // greetings and word_hunter were already unlocked, should not fire again
    expect(onUnlock).not.toHaveBeenCalled();
  });

  // --- Recently unlocked tracking ---

  it('tracks recently unlocked node ids', () => {
    panel.updateStats(createStats({ wordsLearned: 5 }));
    // Show panel to render recently-unlocked badges
    panel.show();
    const newBadges = findControlsByPrefix(texture as any, 'skillNew_');
    expect(newBadges.length).toBeGreaterThan(0);
  });

  it('clearRecentlyUnlocked removes NEW badges', () => {
    panel.updateStats(createStats({ wordsLearned: 5 }));
    panel.clearRecentlyUnlocked();
    panel.show();
    const newBadges = findControlsByPrefix(texture as any, 'skillNew_');
    expect(newBadges.length).toBe(0);
  });

  // --- Interactive node expansion ---

  it('starts with no expanded node', () => {
    expect(panel.getExpandedNodeId()).toBeNull();
  });

  it('expands a node on click', () => {
    const onNodeSelected = vi.fn();
    panel.setOnNodeSelected(onNodeSelected);
    panel.show();

    // Find a skill card and click it
    const skillCard = findControl(texture as any, 'skill_greetings');
    expect(skillCard).toBeDefined();

    // Trigger the click handler
    const clickHandler = skillCard.onPointerUpObservable.add.mock.calls[0][0];
    clickHandler();

    expect(panel.getExpandedNodeId()).toBe('greetings');
    expect(onNodeSelected).toHaveBeenCalledTimes(1);
    expect(onNodeSelected.mock.calls[0][0].id).toBe('greetings');
  });

  it('collapses expanded node on second click', () => {
    panel.show();

    const skillCard = findControl(texture as any, 'skill_greetings');
    const clickHandler = skillCard.onPointerUpObservable.add.mock.calls[0][0];

    // Click once to expand
    clickHandler();
    expect(panel.getExpandedNodeId()).toBe('greetings');

    // After refresh, the card is recreated — find it again
    const skillCard2 = findControl(texture as any, 'skill_greetings');
    const clickHandler2 = skillCard2.onPointerUpObservable.add.mock.calls[0][0];
    clickHandler2();
    expect(panel.getExpandedNodeId()).toBeNull();
  });

  it('shows detail section with requirement info when expanded', () => {
    panel.updateStats(createStats({ wordsLearned: 3 }));
    panel.show();

    // Click greetings to expand
    const skillCard = findControl(texture as any, 'skill_greetings');
    skillCard.onPointerUpObservable.add.mock.calls[0][0]();

    // Should now have a detail text block
    const detailText = findControl(texture as any, 'skillDetailText_greetings');
    expect(detailText).toBeDefined();
    expect(detailText.text).toContain('Words Learned');
    expect(detailText.text).toContain('3/5');
  });

  it('shows Complete! text for unlocked expanded nodes', () => {
    panel.updateStats(createStats({ wordsLearned: 10, conversations: 5 }));
    panel.show();

    // Click greetings (which is now unlocked)
    const skillCard = findControl(texture as any, 'skill_greetings');
    skillCard.onPointerUpObservable.add.mock.calls[0][0]();

    const detailText = findControl(texture as any, 'skillDetailText_greetings');
    expect(detailText).toBeDefined();
    expect(detailText.text).toContain('Complete!');
  });

  // --- Hover effects ---

  it('attaches hover handlers to skill nodes', () => {
    panel.show();
    const skillCard = findControl(texture as any, 'skill_greetings');
    expect(skillCard.onPointerEnterObservable.add).toHaveBeenCalledTimes(1);
    expect(skillCard.onPointerOutObservable.add).toHaveBeenCalledTimes(1);
  });

  it('hover changes background on locked nodes', () => {
    panel.show();
    const skillCard = findControl(texture as any, 'skill_greetings');

    // Trigger hover enter
    const enterHandler = skillCard.onPointerEnterObservable.add.mock.calls[0][0];
    enterHandler();
    expect(skillCard.background).toBe('rgba(40, 40, 50, 0.8)');
    expect(skillCard.thickness).toBe(2);

    // Trigger hover leave
    const leaveHandler = skillCard.onPointerOutObservable.add.mock.calls[0][0];
    leaveHandler();
    expect(skillCard.thickness).toBe(1);
  });

  // --- Segmented progress bar ---

  it('renders segmented progress bar when shown', () => {
    panel.show();
    const progressBg = findControl(texture as any, 'progressBg');
    expect(progressBg).toBeDefined();

    const progressLabel = findControl(texture as any, 'progressLabel');
    expect(progressLabel).toBeDefined();
    expect(progressLabel.text).toBe('0%');
  });

  it('updates progress bar percentage when skills are unlocked', () => {
    panel.updateStats(createStats({ wordsLearned: 10, conversations: 3 }));
    panel.show();

    const progressLabel = findControl(texture as any, 'progressLabel');
    // 3 out of 15 = 20%
    expect(progressLabel.text).toBe('20%');
  });

  it('renders tier fill segments in progress bar', () => {
    panel.updateStats(createStats({ wordsLearned: 10, conversations: 3 }));
    panel.show();

    const fills = findControlsByPrefix(texture as any, 'progressFill_');
    expect(fills.length).toBeGreaterThan(0);
  });

  // --- Tier connectors ---

  it('renders tier connector indicators between sections', () => {
    panel.show();
    // There should be 4 connectors (between 5 tiers)
    const connectors = findControlsByPrefix(texture as any, 'connector_');
    expect(connectors).toHaveLength(4);
  });

  it('connector arrows change style when tier is fully unlocked', () => {
    // Unlock all tier 1 nodes
    panel.updateStats(createStats({ wordsLearned: 10, conversations: 3 }));
    panel.show();

    const arrow1 = findControl(texture as any, 'connArrow_1');
    expect(arrow1).toBeDefined();
    expect(arrow1.text).toBe('▼'); // Filled arrow for completed tier
  });

  it('connector arrows show outline when tier is incomplete', () => {
    panel.show();
    const arrow1 = findControl(texture as any, 'connArrow_1');
    expect(arrow1.text).toBe('▽'); // Outline arrow for incomplete tier
  });

  // --- Tier section rendering ---

  it('renders all 5 tier sections', () => {
    panel.show();
    for (let t = 1; t <= 5; t++) {
      const tier = findControl(texture as any, `tier_${t}`);
      expect(tier).toBeDefined();
    }
  });

  it('tier badge shows checkmark when all nodes unlocked', () => {
    panel.updateStats(createStats({ wordsLearned: 10, conversations: 3 }));
    panel.show();
    const badge = findControl(texture as any, 'tierBadge_1');
    expect(badge.text).toContain('✓');
  });

  it('tier badge shows plain count when not all unlocked', () => {
    panel.show();
    const badge = findControl(texture as any, 'tierBadge_1');
    expect(badge.text).toBe('0/3');
    expect(badge.text).not.toContain('✓');
  });

  // --- Close callback ---

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    panel.setOnClose(onClose);
    panel.show();

    const closeBtn = findControl(texture as any, 'skillTreeClose');
    expect(closeBtn).toBeDefined();
    closeBtn.onPointerUpObservable.add.mock.calls[0][0]();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(panel.getIsVisible()).toBe(false);
  });

  // --- Export / Import ---

  it('exports and imports state', () => {
    panel.updateStats(createStats({ wordsLearned: 10 }));
    const exported = panel.exportState();
    const parsed = JSON.parse(exported);
    expect(parsed.nodes.find((n: any) => n.id === 'greetings').unlocked).toBe(true);

    // Create new panel and import
    const panel2 = new BabylonSkillTreePanel(createMockTexture());
    panel2.importState(exported);
    const state = panel2.getState();
    expect(state.nodes.find(n => n.id === 'greetings')!.unlocked).toBe(true);
  });

  it('importState handles invalid JSON gracefully', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    panel.importState('not-json');
    // Should not throw
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  // --- Dispose ---

  it('dispose cleans up container', () => {
    panel.dispose();
    panel.show();
    expect(panel.getIsVisible()).toBe(false);
  });
});
