/**
 * Tests for WorldObjectActionManager
 *
 * Validates wiring of identify_object, examine_object, point_and_name,
 * and read_sign actions to world objects.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEventBus } from '../../logic/GameEventBus';
import { WorldObjectActionManager, type WorldObjectRef } from '../../logic/WorldObjectActionManager';

// ── Helpers ─────────────────────────────────────────────────────────────────

function createManager(eventBus?: GameEventBus) {
  const bus = eventBus ?? new GameEventBus();
  const manager = new WorldObjectActionManager(bus);
  return { manager, eventBus: bus };
}

function makeWorldItem(overrides: Partial<{
  id: string;
  objectRole: string;
  name: string;
  description: string;
  translations: WorldObjectRef['translations'];
  signData: { signId: string; targetText: string; nativeText: string; category?: string };
}> = {}) {
  return {
    id: overrides.id ?? 'item-1',
    objectRole: overrides.objectRole ?? 'apple',
    name: overrides.name ?? 'Apple',
    description: overrides.description ?? 'A red apple.',
    translations: overrides.translations,
    signData: overrides.signData,
  };
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('WorldObjectActionManager', () => {
  let manager: WorldObjectActionManager;
  let eventBus: GameEventBus;

  beforeEach(() => {
    const created = createManager();
    manager = created.manager;
    eventBus = created.eventBus;
  });

  describe('registerObjects', () => {
    it('registers world items and reports correct count', () => {
      const items = [
        makeWorldItem({ id: 'i1', objectRole: 'apple', name: 'Apple' }),
        makeWorldItem({ id: 'i2', objectRole: 'bread', name: 'Bread' }),
      ];
      const positions = new Map([
        ['apple', { x: 10, y: 0, z: 20 }],
        ['bread', { x: 15, y: 0, z: 25 }],
      ]);
      manager.registerObjects(items, positions);

      expect(manager.getObjectCount()).toBe(2);
      expect(manager.getObject('apple')).not.toBeNull();
      expect(manager.getObject('bread')).not.toBeNull();
    });

    it('skips items without objectRole', () => {
      const items = [
        { id: 'i1', name: 'Mystery' },
        makeWorldItem({ id: 'i2', objectRole: 'bread' }),
      ];
      manager.registerObjects(items as any, new Map());

      expect(manager.getObjectCount()).toBe(1);
    });

    it('detects sign objects by role', () => {
      const items = [
        makeWorldItem({ id: 's1', objectRole: 'signpost', name: 'Signpost' }),
        makeWorldItem({ id: 's2', objectRole: 'notice_board', name: 'Notice Board' }),
        makeWorldItem({ id: 'i1', objectRole: 'apple', name: 'Apple' }),
      ];
      manager.registerObjects(items, new Map());

      expect(manager.getSignCount()).toBe(2);
    });
  });

  describe('isSignObject', () => {
    it('recognizes sign roles', () => {
      expect(manager.isSignObject('sign')).toBe(true);
      expect(manager.isSignObject('signpost')).toBe(true);
      expect(manager.isSignObject('notice_board')).toBe(true);
      expect(manager.isSignObject('street_sign')).toBe(true);
      expect(manager.isSignObject('shop_sign')).toBe(true);
    });

    it('rejects non-sign roles', () => {
      expect(manager.isSignObject('apple')).toBe(false);
      expect(manager.isSignObject('chest')).toBe(false);
      expect(manager.isSignObject('lantern')).toBe(false);
    });

    it('recognizes registered sign objects', () => {
      const items = [
        makeWorldItem({ id: 's1', objectRole: 'bakery_sign', name: 'Bakery Sign' }),
      ];
      manager.registerObjects(items, new Map());

      expect(manager.isSignObject('bakery_sign')).toBe(true);
    });
  });

  describe('examineObject', () => {
    it('emits object_examined event with language data', () => {
      const events: any[] = [];
      eventBus.on('object_examined', (e) => events.push(e));

      const objRef: WorldObjectRef = {
        id: 'item-apple',
        objectRole: 'apple',
        name: 'Apple',
        position: { x: 10, y: 0, z: 20 },
        isSign: false,
        translations: {
          targetWord: 'pomme',
          targetLanguage: 'French',
          pronunciation: 'pom',
          category: 'food',
        },
      };

      const result = manager.examineObject(objRef, true);

      expect(result.action).toBe('examine_object');
      expect(result.displayTitle).toBe('pomme');
      expect(result.displayDescription).toContain('Apple');
      expect(result.displayDescription).toContain('[pom]');
      expect(events).toHaveLength(1);
      expect(events[0].objectName).toBe('Apple');
      expect(events[0].targetWord).toBe('pomme');
    });

    it('shows object name in non-language world', () => {
      const objRef: WorldObjectRef = {
        id: 'item-chest',
        objectRole: 'chest',
        name: 'Treasure Chest',
        position: { x: 0, y: 0, z: 0 },
        isSign: false,
        description: 'An ornate wooden chest.',
      };

      const result = manager.examineObject(objRef, false);

      expect(result.displayTitle).toBe('Treasure Chest');
      expect(result.displayDescription).toBe('An ornate wooden chest.');
    });
  });

  describe('readSign', () => {
    it('emits sign_read and object_examined events', () => {
      const signEvents: any[] = [];
      const examineEvents: any[] = [];
      eventBus.on('sign_read', (e) => signEvents.push(e));
      eventBus.on('object_examined', (e) => examineEvents.push(e));

      const objRef: WorldObjectRef = {
        id: 'sign-bakery',
        objectRole: 'shop_sign',
        name: 'Bakery Sign',
        position: { x: 5, y: 2, z: 10 },
        isSign: true,
        translations: {
          targetWord: 'Boulangerie',
          targetLanguage: 'French',
          category: 'buildings',
        },
        signData: {
          signId: 'sign-bakery',
          targetText: 'Boulangerie',
          nativeText: 'Bakery',
          category: 'buildings',
        },
      };

      const result = manager.readSign(objRef, true, 0);

      expect(result.action).toBe('read_sign');
      expect(result.displayTitle).toBe('Boulangerie');
      // Beginner tier shows native text in parens
      expect(result.displayDescription).toBe('(Bakery)');

      expect(signEvents).toHaveLength(1);
      expect(signEvents[0].signId).toBe('sign-bakery');
      expect(signEvents[0].targetText).toBe('Boulangerie');
      expect(examineEvents).toHaveLength(1);
    });

    it('shows only target text for advanced fluency', () => {
      const objRef: WorldObjectRef = {
        id: 'sign-1',
        objectRole: 'street_sign',
        name: 'Street Sign',
        position: { x: 0, y: 0, z: 0 },
        isSign: true,
        signData: {
          signId: 'sign-1',
          targetText: 'Rue de la Paix',
          nativeText: 'Peace Street',
        },
      };

      const result = manager.readSign(objRef, true, 80);

      expect(result.displayTitle).toBe('Rue de la Paix');
      // Advanced doesn't show native text
      expect(result.displayDescription).not.toContain('Peace Street');
    });

    it('synthesizes sign data from language learning data when signData is absent', () => {
      const signEvents: any[] = [];
      eventBus.on('sign_read', (e) => signEvents.push(e));

      const objRef: WorldObjectRef = {
        id: 'sign-2',
        objectRole: 'notice',
        name: 'Notice',
        position: { x: 0, y: 0, z: 0 },
        isSign: true,
        translations: {
          targetWord: 'Avis',
          targetLanguage: 'French',
          category: 'general',
        },
      };

      manager.readSign(objRef, true, 0);

      expect(signEvents).toHaveLength(1);
      expect(signEvents[0].targetText).toBe('Avis');
    });
  });

  describe('findNearestObject', () => {
    it('finds the closest object within range', () => {
      const items = [
        makeWorldItem({ id: 'far', objectRole: 'chest', name: 'Chest' }),
        makeWorldItem({ id: 'near', objectRole: 'apple', name: 'Apple' }),
      ];
      const positions = new Map([
        ['chest', { x: 100, y: 0, z: 100 }],
        ['apple', { x: 2, y: 0, z: 2 }],
      ]);
      manager.registerObjects(items, positions);

      const result = manager.findNearestObject({ x: 0, z: 0 });
      expect(result).not.toBeNull();
      expect(result!.objectRole).toBe('apple');
    });

    it('returns null when nothing is in range', () => {
      const items = [
        makeWorldItem({ id: 'far', objectRole: 'chest', name: 'Chest' }),
      ];
      const positions = new Map([
        ['chest', { x: 100, y: 0, z: 100 }],
      ]);
      manager.registerObjects(items, positions);

      const result = manager.findNearestObject({ x: 0, z: 0 });
      expect(result).toBeNull();
    });
  });

  describe('identifyObject', () => {
    it('triggers identification prompt for registered targets', () => {
      const toastCalls: any[] = [];
      manager.setOnToast((title, desc, dur) => toastCalls.push({ title, desc, dur }));

      manager.registerIdentificationTargets([{
        id: 'apple',
        questId: 'quest-1',
        objectiveId: 'obj-1',
        expectedAnswer: 'pomme',
        hintText: 'A fruit',
      }]);

      // Also register the object so it can be looked up
      manager.registerObjects(
        [makeWorldItem({ id: 'apple', objectRole: 'apple', name: 'Apple' })],
        new Map([['apple', { x: 0, y: 0, z: 0 }]]),
      );

      const triggered = manager.identifyObject('apple');
      expect(triggered).toBe(true);
      expect(toastCalls).toHaveLength(1);
    });

    it('returns false for unknown targets', () => {
      const triggered = manager.identifyObject('nonexistent');
      expect(triggered).toBe(false);
    });
  });

  describe('submitIdentification', () => {
    it('emits object_identified on correct answer', () => {
      const events: any[] = [];
      eventBus.on('object_identified', (e) => events.push(e));

      manager.registerIdentificationTargets([{
        id: 'apple',
        questId: 'quest-1',
        objectiveId: 'obj-1',
        expectedAnswer: 'pomme',
        hintText: 'A fruit',
      }]);
      manager.registerObjects(
        [makeWorldItem({ id: 'apple', objectRole: 'apple', name: 'Apple' })],
        new Map([['apple', { x: 0, y: 0, z: 0 }]]),
      );

      const result = manager.submitIdentification('apple', 'pomme');

      expect(result.passed).toBe(true);
      expect(events).toHaveLength(1);
      expect(events[0].objectName).toBe('Apple');
    });

    it('does not emit event on incorrect answer', () => {
      const events: any[] = [];
      eventBus.on('object_identified', (e) => events.push(e));

      manager.registerIdentificationTargets([{
        id: 'apple',
        questId: 'quest-1',
        objectiveId: 'obj-1',
        expectedAnswer: 'pomme',
        hintText: 'A fruit',
      }]);

      const result = manager.submitIdentification('apple', 'wrong');

      expect(result.passed).toBe(false);
      expect(events).toHaveLength(0);
    });
  });

  describe('pointAndNameObject', () => {
    it('registers and prompts for nameable objects', () => {
      const promptCalls: any[] = [];
      manager.setOnPromptInput((prompt, objRef) => promptCalls.push({ prompt, objRef }));

      manager.registerObjects([
        makeWorldItem({
          id: 'apple',
          objectRole: 'apple',
          name: 'Apple',
          translations: {
            targetWord: 'pomme',
            targetLanguage: 'French',
            category: 'food',
          },
        }),
      ], new Map([['apple', { x: 0, y: 0, z: 0 }]]));

      const triggered = manager.pointAndNameObject('apple');
      expect(triggered).toBe(true);
    });

    it('returns false for non-registered objects', () => {
      const triggered = manager.pointAndNameObject('nonexistent');
      expect(triggered).toBe(false);
    });
  });

  describe('submitPointAndName', () => {
    it('returns correct result on matching answer', () => {
      manager.registerObjects([
        makeWorldItem({
          id: 'apple',
          objectRole: 'apple',
          name: 'Apple',
          translations: {
            targetWord: 'pomme',
            targetLanguage: 'French',
            category: 'food',
          },
        }),
      ], new Map([['apple', { x: 0, y: 0, z: 0 }]]));

      const result = manager.submitPointAndName('apple', 'pomme');

      expect(result).not.toBeNull();
      expect(result!.correct).toBe(true);
      expect(result!.feedback).toContain('Correct');
    });

    it('returns incorrect result on wrong answer', () => {
      manager.registerObjects([
        makeWorldItem({
          id: 'apple',
          objectRole: 'apple',
          name: 'Apple',
          translations: {
            targetWord: 'pomme',
            targetLanguage: 'French',
            category: 'food',
          },
        }),
      ], new Map([['apple', { x: 0, y: 0, z: 0 }]]));

      const result = manager.submitPointAndName('apple', 'wrong');

      expect(result).not.toBeNull();
      expect(result!.correct).toBe(false);
      expect(result!.feedback).toContain('Try again');
    });

    it('returns null for unknown objects', () => {
      const result = manager.submitPointAndName('nonexistent', 'test');
      expect(result).toBeNull();
    });
  });

  describe('dispose', () => {
    it('clears all state', () => {
      manager.registerObjects(
        [makeWorldItem({ id: 'i1', objectRole: 'apple' })],
        new Map(),
      );
      expect(manager.getObjectCount()).toBe(1);

      manager.dispose();

      expect(manager.getObjectCount()).toBe(0);
    });
  });
});
