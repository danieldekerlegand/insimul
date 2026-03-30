import { describe, it, expect, vi } from 'vitest';
import { GameEventBus } from '@/components/3DGame/GameEventBus.ts';

describe('examine_object action', () => {
  describe('GameEventBus — object_examined event', () => {
    it('emits and receives object_examined with language data', () => {
      const bus = new GameEventBus();
      const handler = vi.fn();
      bus.on('object_examined', handler);

      bus.emit({
        type: 'object_examined',
        objectId: 'item_apple',
        objectName: 'Apple',
        targetWord: 'nakasi',
        targetLanguage: 'Chitimacha',
        pronunciation: 'na-KA-si',
        category: 'food',
      });

      expect(handler).toHaveBeenCalledOnce();
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'object_examined',
          objectId: 'item_apple',
          objectName: 'Apple',
          targetWord: 'nakasi',
          targetLanguage: 'Chitimacha',
          pronunciation: 'na-KA-si',
          category: 'food',
        }),
      );
      bus.dispose();
    });

    it('emits object_examined without optional pronunciation/category', () => {
      const bus = new GameEventBus();
      const handler = vi.fn();
      bus.on('object_examined', handler);

      bus.emit({
        type: 'object_examined',
        objectId: 'prop_chair',
        objectName: 'Chair',
        targetWord: 'silla',
        targetLanguage: 'Spanish',
      });

      expect(handler).toHaveBeenCalledOnce();
      const event = handler.mock.calls[0][0];
      expect(event.targetWord).toBe('silla');
      expect(event.pronunciation).toBeUndefined();
      expect(event.category).toBeUndefined();
      bus.dispose();
    });

    it('does not trigger unrelated handlers', () => {
      const bus = new GameEventBus();
      const examineHandler = vi.fn();
      const vocabHandler = vi.fn();
      bus.on('object_examined', examineHandler);
      bus.on('vocabulary_used', vocabHandler);

      bus.emit({
        type: 'object_examined',
        objectId: 'item_bread',
        objectName: 'Bread',
        targetWord: 'pan',
        targetLanguage: 'Spanish',
      });

      expect(examineHandler).toHaveBeenCalledOnce();
      expect(vocabHandler).not.toHaveBeenCalled();
      bus.dispose();
    });

    it('global handler receives object_examined events', () => {
      const bus = new GameEventBus();
      const globalHandler = vi.fn();
      bus.onAny(globalHandler);

      bus.emit({
        type: 'object_examined',
        objectId: 'item_table',
        objectName: 'Table',
        targetWord: 'mesa',
        targetLanguage: 'Spanish',
      });

      expect(globalHandler).toHaveBeenCalledOnce();
      expect(globalHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'object_examined', targetWord: 'mesa' }),
      );
      bus.dispose();
    });
  });

  describe('examine object — item resolution logic', () => {
    /**
     * Extracted logic for finding the nearest examinable item and resolving
     * its display data. This mirrors what BabylonGame.handleExamineObject does.
     */
    function resolveExamineData(
      worldItems: Array<{ objectRole?: string; name?: string; description?: string; id?: string; translations?: { targetWord: string; targetLanguage: string; pronunciation?: string; category?: string } }>,
      objectRole: string,
      isLangWorld: boolean,
    ) {
      const role = objectRole.toLowerCase();
      const dbItem = worldItems.find(
        (item) => item.objectRole && item.objectRole.toLowerCase() === role
      );
      const itemName = dbItem?.name || role.split(/[_\s]+/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
      const langData = dbItem?.translations;

      if (isLangWorld && langData?.targetWord) {
        const pronunciation = langData.pronunciation ? ` [${langData.pronunciation}]` : '';
        return {
          title: langData.targetWord,
          description: `${itemName}${pronunciation}`,
          isLanguageLabel: true,
          event: {
            type: 'object_examined' as const,
            objectId: dbItem?.id || objectRole,
            objectName: itemName,
            targetWord: langData.targetWord,
            targetLanguage: langData.targetLanguage,
            pronunciation: langData.pronunciation,
            category: langData.category,
          },
        };
      }

      return {
        title: itemName,
        description: dbItem?.description || 'You examine the object closely.',
        isLanguageLabel: false,
        event: null,
      };
    }

    it('returns target-language label for language-learning world', () => {
      const items = [{
        objectRole: 'apple',
        name: 'Apple',
        id: 'item_1',
        translations: {
          targetWord: 'nakasi',
          targetLanguage: 'Chitimacha',
          pronunciation: 'na-KA-si',
          category: 'food',
        },
      }];

      const result = resolveExamineData(items, 'apple', true);
      expect(result.isLanguageLabel).toBe(true);
      expect(result.title).toBe('nakasi');
      expect(result.description).toBe('Apple [na-KA-si]');
      expect(result.event).toBeTruthy();
      expect(result.event!.targetWord).toBe('nakasi');
    });

    it('returns plain name for non-language-learning world', () => {
      const items = [{
        objectRole: 'apple',
        name: 'Apple',
        description: 'A red apple',
        translations: {
          targetWord: 'nakasi',
          targetLanguage: 'Chitimacha',
          pronunciation: 'na-KA-si',
          category: 'food',
        },
      }];

      const result = resolveExamineData(items, 'apple', false);
      expect(result.isLanguageLabel).toBe(false);
      expect(result.title).toBe('Apple');
      expect(result.description).toBe('A red apple');
      expect(result.event).toBeNull();
    });

    it('falls back to formatted objectRole when no DB item found', () => {
      const result = resolveExamineData([], 'wooden_chair', false);
      expect(result.title).toBe('Wooden Chair');
      expect(result.description).toBe('You examine the object closely.');
    });

    it('handles missing pronunciation gracefully', () => {
      const items = [{
        objectRole: 'book',
        name: 'Book',
        id: 'item_book',
        translations: {
          targetWord: 'libro',
          targetLanguage: 'Spanish',
          category: 'objects',
        },
      }];

      const result = resolveExamineData(items, 'book', true);
      expect(result.title).toBe('libro');
      expect(result.description).toBe('Book');
      expect(result.event!.pronunciation).toBeUndefined();
    });

    it('matches objectRole case-insensitively', () => {
      const items = [{
        objectRole: 'Bread_Loaf',
        name: 'Bread Loaf',
        id: 'item_bread',
        translations: {
          targetWord: 'pan',
          targetLanguage: 'Spanish',
          category: 'food',
        },
      }];

      const result = resolveExamineData(items, 'bread_loaf', true);
      expect(result.isLanguageLabel).toBe(true);
      expect(result.title).toBe('pan');
    });
  });
});
