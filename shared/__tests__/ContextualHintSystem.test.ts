import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEventBus } from '../game-engine/logic/GameEventBus';
import {
  ContextualHintSystem,
  HINT_CATALOG,
  type HintDefinition,
} from '../game-engine/rendering/ContextualHintSystem';

describe('ContextualHintSystem', () => {
  let eventBus: GameEventBus;
  let system: ContextualHintSystem;
  let displayedHints: HintDefinition[];
  let dismissedHintIds: string[];

  beforeEach(() => {
    vi.useFakeTimers();
    eventBus = new GameEventBus();
    system = new ContextualHintSystem(eventBus, 'French');
    displayedHints = [];
    dismissedHintIds = [];

    system.setDisplayCallback((hint) => displayedHints.push(hint));
    system.setDismissCallback((id) => dismissedHintIds.push(id));
  });

  it('has a non-empty hint catalog', () => {
    expect(HINT_CATALOG.length).toBeGreaterThan(0);
    expect(system.getTotalHintCount()).toBe(HINT_CATALOG.length);
  });

  it('triggers a hint by ID and shows it', () => {
    const result = system.triggerHint('first_npc_approach');
    expect(result).toBe(true);
    expect(displayedHints).toHaveLength(1);
    expect(displayedHints[0].id).toBe('first_npc_approach');
  });

  it('never shows the same hint twice', () => {
    system.triggerHint('first_npc_approach');
    vi.advanceTimersByTime(6000); // let it auto-dismiss

    const result = system.triggerHint('first_npc_approach');
    expect(result).toBe(false);
    expect(displayedHints).toHaveLength(1);
  });

  it('auto-dismisses after durationMs', () => {
    system.triggerHint('first_npc_approach');
    expect(dismissedHintIds).toHaveLength(0);

    vi.advanceTimersByTime(5000);
    expect(dismissedHintIds).toHaveLength(1);
    expect(dismissedHintIds[0]).toBe('first_npc_approach');
  });

  it('queues hints when one is already showing', () => {
    system.triggerHint('first_npc_approach');
    system.triggerHint('first_quest_received');

    // Only first hint should be displayed initially
    expect(displayedHints).toHaveLength(1);
    expect(displayedHints[0].id).toBe('first_npc_approach');

    // After first dismisses, second should appear
    vi.advanceTimersByTime(5000);
    expect(displayedHints).toHaveLength(2);
    expect(displayedHints[1].id).toBe('first_quest_received');
  });

  it('dismissCurrent forces immediate dismissal', () => {
    system.triggerHint('first_npc_approach');
    system.dismissCurrent();
    expect(dismissedHintIds).toHaveLength(1);
  });

  it('returns false for unknown hint IDs', () => {
    const result = system.triggerHint('nonexistent_hint');
    expect(result).toBe(false);
    expect(displayedHints).toHaveLength(0);
  });

  it('tracks shown count correctly', () => {
    expect(system.getShownCount()).toBe(0);
    system.triggerHint('first_npc_approach');
    expect(system.getShownCount()).toBe(1);
    vi.advanceTimersByTime(6000);
    system.triggerHint('first_quest_received');
    expect(system.getShownCount()).toBe(2);
  });

  it('persists and restores shown hint IDs', () => {
    system.triggerHint('first_npc_approach');
    const ids = system.getShownHintIds();
    expect(ids).toContain('first_npc_approach');

    // Create new system and restore
    vi.advanceTimersByTime(6000);
    const newSystem = new ContextualHintSystem(eventBus, 'French');
    newSystem.restoreShownHints(ids);
    expect(newSystem.wasHintShown('first_npc_approach')).toBe(true);

    // Should not show the restored hint again
    const newDisplayed: HintDefinition[] = [];
    newSystem.setDisplayCallback((h) => newDisplayed.push(h));
    const result = newSystem.triggerHint('first_npc_approach');
    expect(result).toBe(false);
    expect(newDisplayed).toHaveLength(0);

    newSystem.dispose();
  });

  describe('event-driven hints', () => {
    it('triggers first_npc_approach on npc_greeting event', () => {
      eventBus.emit({
        type: 'npc_greeting',
        npcId: 'npc1',
        npcName: 'Pierre',
        language: 'French',
        greetingText: 'Bonjour!',
        isFirstMeeting: true,
      });
      expect(displayedHints).toHaveLength(1);
      expect(displayedHints[0].id).toBe('first_npc_approach');
    });

    it('triggers first_quest_received on quest_accepted event', () => {
      eventBus.emit({
        type: 'quest_accepted',
        questId: 'q1',
        questTitle: 'Test Quest',
      });
      expect(displayedHints).toHaveLength(1);
      expect(displayedHints[0].id).toBe('first_quest_received');
    });

    it('triggers first_combat_encounter on combat_action event', () => {
      eventBus.emit({
        type: 'combat_action',
        actionType: 'attack',
        targetId: 'enemy1',
      });
      expect(displayedHints).toHaveLength(1);
      expect(displayedHints[0].id).toBe('first_combat_encounter');
    });

    it('triggers first_item_ground only for world source items', () => {
      eventBus.emit({
        type: 'item_collected',
        itemId: 'item1',
        itemName: 'Apple',
        quantity: 1,
        source: 'shop',
      });
      expect(displayedHints).toHaveLength(0);

      eventBus.emit({
        type: 'item_collected',
        itemId: 'item2',
        itemName: 'Rock',
        quantity: 1,
        source: 'world',
      });
      expect(displayedHints).toHaveLength(1);
      expect(displayedHints[0].id).toBe('first_item_ground');
    });

    it('triggers first_notice_board on sign_read event', () => {
      eventBus.emit({
        type: 'sign_read',
        signId: 's1',
        objectId: 'obj1',
        targetText: 'Bienvenue',
      });
      expect(displayedHints).toHaveLength(1);
      expect(displayedHints[0].id).toBe('first_notice_board');
    });

    it('triggers first_text_document on text_collected event', () => {
      eventBus.emit({
        type: 'text_collected',
        textId: 't1',
        title: 'A Letter',
        textType: 'letter',
        difficulty: 'beginner',
        vocabularyWordCount: 5,
      });
      expect(displayedHints).toHaveLength(1);
      expect(displayedHints[0].id).toBe('first_text_document');
    });
  });

  it('disposes cleanly without errors', () => {
    system.dispose();
    // Events after dispose should not trigger hints
    eventBus.emit({
      type: 'npc_greeting',
      npcId: 'npc1',
      npcName: 'Pierre',
      language: 'French',
      greetingText: 'Bonjour!',
      isFirstMeeting: true,
    });
    expect(displayedHints).toHaveLength(0);
  });

  afterEach(() => {
    system.dispose();
    vi.useRealTimers();
  });
});
