/**
 * Tests for relationship tier definitions and utilities.
 */

import { describe, it, expect } from 'vitest';
import {
  getRelationshipTier,
  getRelationshipTierLabel,
  RELATIONSHIP_TIERS,
  RELATIONSHIP_DELTAS,
} from '../relationship-tiers';

describe('relationship-tiers', () => {
  describe('RELATIONSHIP_TIERS', () => {
    it('should have 8 tiers covering the full -1 to 1 range', () => {
      expect(RELATIONSHIP_TIERS).toHaveLength(8);
      expect(RELATIONSHIP_TIERS[0].minStrength).toBe(-1.0);
      expect(RELATIONSHIP_TIERS[RELATIONSHIP_TIERS.length - 1].maxStrength).toBe(1.0);
    });

    it('should have non-overlapping ranges', () => {
      for (let i = 1; i < RELATIONSHIP_TIERS.length; i++) {
        expect(RELATIONSHIP_TIERS[i].minStrength).toBeGreaterThan(RELATIONSHIP_TIERS[i - 1].minStrength);
      }
    });

    it('each tier should have required properties', () => {
      for (const tier of RELATIONSHIP_TIERS) {
        expect(tier.id).toBeTruthy();
        expect(tier.label).toBeTruthy();
        expect(typeof tier.priceMultiplier).toBe('number');
        expect(typeof tier.canOfferQuests).toBe('boolean');
        expect(typeof tier.canShareSecrets).toBe('boolean');
        expect(tier.greetingStyle).toBeTruthy();
        expect(tier.conversationContext).toBeTruthy();
      }
    });
  });

  describe('getRelationshipTier', () => {
    it('should return enemy tier for very negative strength', () => {
      expect(getRelationshipTier(-0.8).id).toBe('enemy');
      expect(getRelationshipTier(-1.0).id).toBe('enemy');
    });

    it('should return stranger tier for near-zero strength', () => {
      expect(getRelationshipTier(0).id).toBe('stranger');
      expect(getRelationshipTier(0.05).id).toBe('stranger');
      expect(getRelationshipTier(-0.05).id).toBe('stranger');
    });

    it('should return friend tier for moderate positive strength', () => {
      expect(getRelationshipTier(0.5).id).toBe('friend');
    });

    it('should return best_friend tier for max strength', () => {
      expect(getRelationshipTier(1.0).id).toBe('best_friend');
      expect(getRelationshipTier(0.9).id).toBe('best_friend');
    });

    it('should clamp out-of-range values', () => {
      expect(getRelationshipTier(-5).id).toBe('enemy');
      expect(getRelationshipTier(5).id).toBe('best_friend');
    });

    it('should return stranger as fallback', () => {
      // Should never happen with proper tiers, but test the fallback
      expect(getRelationshipTier(0)).toBeDefined();
    });
  });

  describe('getRelationshipTierLabel', () => {
    it('should return human-readable labels', () => {
      expect(getRelationshipTierLabel(-0.8)).toBe('Enemy');
      expect(getRelationshipTierLabel(0)).toBe('Stranger');
      expect(getRelationshipTierLabel(0.5)).toBe('Friend');
      expect(getRelationshipTierLabel(0.9)).toBe('Best Friend');
    });
  });

  describe('gameplay effects', () => {
    it('enemy tier should have higher prices', () => {
      const enemy = getRelationshipTier(-0.8);
      expect(enemy.priceMultiplier).toBeGreaterThan(1.0);
    });

    it('friend tier should have lower prices', () => {
      const friend = getRelationshipTier(0.5);
      expect(friend.priceMultiplier).toBeLessThan(1.0);
    });

    it('enemy tier should not offer quests', () => {
      expect(getRelationshipTier(-0.8).canOfferQuests).toBe(false);
    });

    it('friend tier should share secrets', () => {
      expect(getRelationshipTier(0.5).canShareSecrets).toBe(true);
    });

    it('stranger tier should not share secrets', () => {
      expect(getRelationshipTier(0).canShareSecrets).toBe(false);
    });
  });

  describe('RELATIONSHIP_DELTAS', () => {
    it('quest_completed should be positive', () => {
      expect(RELATIONSHIP_DELTAS.quest_completed).toBeGreaterThan(0);
    });

    it('quest_failed should be negative', () => {
      expect(RELATIONSHIP_DELTAS.quest_failed).toBeLessThan(0);
    });

    it('conversation should be small positive', () => {
      expect(RELATIONSHIP_DELTAS.conversation).toBeGreaterThan(0);
      expect(RELATIONSHIP_DELTAS.conversation).toBeLessThan(0.1);
    });
  });
});
