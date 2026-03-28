/**
 * Tests for PlaythroughQuestOverlay
 *
 * Verifies overlay state management, merging with base quests,
 * serialization/deserialization, and backward compatibility.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PlaythroughQuestOverlay } from '../../logic/PlaythroughQuestOverlay';

const baseQuests = [
  { id: 'q1', title: 'Find the Artifact', status: 'available', experienceReward: 100 },
  { id: 'q2', title: 'Deliver the Letter', status: 'available', experienceReward: 50 },
  { id: 'q3', title: 'Guard the Gate', status: 'active', experienceReward: 75 },
];

describe('PlaythroughQuestOverlay', () => {
  let overlay: PlaythroughQuestOverlay;

  beforeEach(() => {
    overlay = new PlaythroughQuestOverlay();
  });

  describe('updateQuest', () => {
    it('should store quest overrides', () => {
      overlay.updateQuest('q1', { status: 'active' });
      expect(overlay.getOverride('q1')).toEqual({ status: 'active' });
    });

    it('should merge multiple updates to the same quest', () => {
      overlay.updateQuest('q1', { status: 'active' });
      overlay.updateQuest('q1', { progress: { step: 2 } });
      expect(overlay.getOverride('q1')).toEqual({ status: 'active', progress: { step: 2 } });
    });

    it('should return null for quests with no override', () => {
      expect(overlay.getOverride('q999')).toBeNull();
    });
  });

  describe('hasOverrides', () => {
    it('should return false when empty', () => {
      expect(overlay.hasOverrides()).toBe(false);
    });

    it('should return true after an update', () => {
      overlay.updateQuest('q1', { status: 'completed' });
      expect(overlay.hasOverrides()).toBe(true);
    });

    it('should return true after a create', () => {
      overlay.createQuest({ id: 'dynamic-1', title: 'Dynamic Quest' });
      expect(overlay.hasOverrides()).toBe(true);
    });
  });

  describe('mergeQuests', () => {
    it('should return base quests unchanged when no overrides', () => {
      const merged = overlay.mergeQuests(baseQuests);
      expect(merged).toEqual(baseQuests);
    });

    it('should overlay status changes onto base quests', () => {
      overlay.updateQuest('q1', { status: 'completed', completedAt: '2026-03-18' });
      const merged = overlay.mergeQuests(baseQuests);

      expect(merged.find(q => q.id === 'q1')).toEqual({
        id: 'q1',
        title: 'Find the Artifact',
        status: 'completed',
        experienceReward: 100,
        completedAt: '2026-03-18',
      });
      // Other quests unchanged
      expect(merged.find(q => q.id === 'q2')!.status).toBe('available');
    });

    it('should not mutate the input array', () => {
      overlay.updateQuest('q1', { status: 'completed' });
      const original = [...baseQuests];
      overlay.mergeQuests(baseQuests);
      expect(baseQuests).toEqual(original);
    });

    it('should append quests created during this playthrough', () => {
      const dynamicQuest = { id: 'dynamic-1', title: 'Dynamic Quest', status: 'active' };
      overlay.createQuest(dynamicQuest);
      const merged = overlay.mergeQuests(baseQuests);

      expect(merged).toHaveLength(4);
      expect(merged.find(q => q.id === 'dynamic-1')).toEqual(dynamicQuest);
    });

    it('should not duplicate created quests that already exist in base', () => {
      // Edge case: if a created quest ID somehow matches a base quest
      overlay.createQuest({ id: 'q1', title: 'Duplicate' });
      const merged = overlay.mergeQuests(baseQuests);
      expect(merged).toHaveLength(3);
    });

    it('should apply overrides to created quests too', () => {
      overlay.createQuest({ id: 'dyn-1', title: 'New Quest', status: 'available' });
      overlay.updateQuest('dyn-1', { status: 'active' });

      const merged = overlay.mergeQuests([]);
      expect(merged.find(q => q.id === 'dyn-1')!.status).toBe('active');
    });
  });

  describe('getQuest', () => {
    it('should return base quest with no overlay', () => {
      const quest = overlay.getQuest('q1', baseQuests);
      expect(quest).toEqual(baseQuests[0]);
    });

    it('should return merged quest with overlay', () => {
      overlay.updateQuest('q1', { status: 'completed' });
      const quest = overlay.getQuest('q1', baseQuests);
      expect(quest!.status).toBe('completed');
      expect(quest!.title).toBe('Find the Artifact');
    });

    it('should return null for unknown quest', () => {
      expect(overlay.getQuest('unknown', baseQuests)).toBeNull();
    });

    it('should return created quests', () => {
      overlay.createQuest({ id: 'dyn-1', title: 'Dynamic', status: 'active' });
      const quest = overlay.getQuest('dyn-1', []);
      expect(quest!.title).toBe('Dynamic');
    });
  });

  describe('serialize / deserialize', () => {
    it('should round-trip overrides', () => {
      overlay.updateQuest('q1', { status: 'completed' });
      overlay.updateQuest('q2', { progress: { step: 3 } });

      const serialized = overlay.serialize();
      const restored = new PlaythroughQuestOverlay();
      restored.deserialize(serialized);

      expect(restored.getOverride('q1')).toEqual({ status: 'completed' });
      expect(restored.getOverride('q2')).toEqual({ progress: { step: 3 } });
    });

    it('should round-trip created quests', () => {
      overlay.createQuest({ id: 'dyn-1', title: 'Dynamic', status: 'active' });

      const serialized = overlay.serialize();
      const restored = new PlaythroughQuestOverlay();
      restored.deserialize(serialized);

      const merged = restored.mergeQuests([]);
      expect(merged).toHaveLength(1);
      expect(merged[0].title).toBe('Dynamic');
    });

    it('should produce correct structure', () => {
      overlay.updateQuest('q1', { status: 'completed' });
      overlay.createQuest({ id: 'dyn-1', title: 'Dynamic' });

      const state = overlay.serialize();
      expect(state).toHaveProperty('overrides');
      expect(state).toHaveProperty('created');
      expect(state.overrides['q1']).toEqual({ status: 'completed' });
      expect(state.created['dyn-1']).toEqual({ id: 'dyn-1', title: 'Dynamic' });
    });

    it('should handle backward-compatible flat Record format', () => {
      // Old questProgress was Record<questId, progressData>
      const oldFormat: Record<string, any> = {
        'q1': { status: 'completed', step: 2 },
        'q2': { step: 1 },
      };

      overlay.deserialize(oldFormat);
      expect(overlay.getOverride('q1')).toEqual({ status: 'completed', step: 2 });
      expect(overlay.getOverride('q2')).toEqual({ step: 1 });
    });

    it('should handle empty state', () => {
      overlay.deserialize({});
      expect(overlay.hasOverrides()).toBe(false);
    });

    it('should handle null/undefined gracefully', () => {
      overlay.deserialize(null as any);
      expect(overlay.hasOverrides()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all overrides and created quests', () => {
      overlay.updateQuest('q1', { status: 'completed' });
      overlay.createQuest({ id: 'dyn-1', title: 'Dynamic' });
      expect(overlay.hasOverrides()).toBe(true);

      overlay.clear();
      expect(overlay.hasOverrides()).toBe(false);
      expect(overlay.getOverride('q1')).toBeNull();
      expect(overlay.mergeQuests(baseQuests)).toEqual(baseQuests);
    });
  });

  describe('persistence round-trip', () => {
    it('should preserve quest state across serialize/deserialize/merge cycle', () => {
      // Simulate a game session: accept quest, make progress, complete one
      overlay.updateQuest('q1', { status: 'active', assignedAt: '2026-03-18' });
      overlay.updateQuest('q1', { progress: { step: 3 }, status: 'completed', completedAt: '2026-03-18' });
      overlay.updateQuest('q3', { status: 'failed' });
      overlay.createQuest({ id: 'side-1', title: 'Side Quest', status: 'active', progress: { step: 1 } });

      // Save
      const saved = overlay.serialize();

      // Simulate new session: create fresh overlay and restore
      const restored = new PlaythroughQuestOverlay();
      restored.deserialize(saved);

      // Merge with base quests (simulating loadQuests)
      const merged = restored.mergeQuests(baseQuests);

      // Verify quest states survived the round-trip
      expect(merged.find(q => q.id === 'q1')!.status).toBe('completed');
      expect(merged.find(q => q.id === 'q1')!.progress).toEqual({ step: 3 });
      expect(merged.find(q => q.id === 'q2')!.status).toBe('available'); // unchanged
      expect(merged.find(q => q.id === 'q3')!.status).toBe('failed');
      expect(merged.find(q => q.id === 'side-1')!.title).toBe('Side Quest');
      expect(merged.find(q => q.id === 'side-1')!.status).toBe('active');
    });

    it('should handle multiple serialize/deserialize cycles', () => {
      // Session 1: start quest
      overlay.updateQuest('q1', { status: 'active' });
      const save1 = overlay.serialize();

      // Session 2: restore and make progress
      const session2 = new PlaythroughQuestOverlay();
      session2.deserialize(save1);
      session2.updateQuest('q1', { progress: { step: 2 } });
      const save2 = session2.serialize();

      // Session 3: restore and complete
      const session3 = new PlaythroughQuestOverlay();
      session3.deserialize(save2);
      session3.updateQuest('q1', { status: 'completed' });

      const merged = session3.mergeQuests(baseQuests);
      expect(merged.find(q => q.id === 'q1')!.status).toBe('completed');
      expect(merged.find(q => q.id === 'q1')!.progress).toEqual({ step: 2 });
    });
  });

  describe('playthrough isolation', () => {
    it('should allow different overlays to track different playthrough states', () => {
      const playerA = new PlaythroughQuestOverlay();
      const playerB = new PlaythroughQuestOverlay();

      // Player A completes quest 1
      playerA.updateQuest('q1', { status: 'completed' });

      // Player B has not completed quest 1
      const mergedA = playerA.mergeQuests(baseQuests);
      const mergedB = playerB.mergeQuests(baseQuests);

      expect(mergedA.find(q => q.id === 'q1')!.status).toBe('completed');
      expect(mergedB.find(q => q.id === 'q1')!.status).toBe('available');
    });
  });
});
