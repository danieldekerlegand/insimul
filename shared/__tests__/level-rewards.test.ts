import { describe, it, expect } from 'vitest';
import {
  getRewardsForLevel,
  getInventorySlotBonus,
  getMerchantDiscount,
} from '../language/level-rewards';

describe('Level Rewards', () => {
  describe('getRewardsForLevel', () => {
    it('always includes skill points', () => {
      for (let level = 2; level <= 20; level++) {
        const rewards = getRewardsForLevel(level);
        const skillPoints = rewards.find(r => r.type === 'skill_points');
        expect(skillPoints, `Level ${level} should have skill points`).toBeDefined();
      }
    });

    it('grants 1 skill point for levels 1-5', () => {
      for (let level = 1; level <= 5; level++) {
        const rewards = getRewardsForLevel(level);
        const sp = rewards.find(r => r.type === 'skill_points');
        expect(sp?.value).toBe(1);
      }
    });

    it('grants 2 skill points for levels 6-10', () => {
      for (let level = 6; level <= 10; level++) {
        const rewards = getRewardsForLevel(level);
        const sp = rewards.find(r => r.type === 'skill_points');
        expect(sp?.value).toBe(2);
      }
    });

    it('grants 3 skill points for levels 11-15', () => {
      for (let level = 11; level <= 15; level++) {
        const rewards = getRewardsForLevel(level);
        const sp = rewards.find(r => r.type === 'skill_points');
        expect(sp?.value).toBe(3);
      }
    });

    it('grants 4 skill points for levels 16-20', () => {
      for (let level = 16; level <= 20; level++) {
        const rewards = getRewardsForLevel(level);
        const sp = rewards.find(r => r.type === 'skill_points');
        expect(sp?.value).toBe(4);
      }
    });

    it('grants inventory slots every 3 levels', () => {
      expect(getRewardsForLevel(3).find(r => r.type === 'inventory_slots')).toBeDefined();
      expect(getRewardsForLevel(6).find(r => r.type === 'inventory_slots')).toBeDefined();
      expect(getRewardsForLevel(9).find(r => r.type === 'inventory_slots')).toBeDefined();
      expect(getRewardsForLevel(2).find(r => r.type === 'inventory_slots')).toBeUndefined();
      expect(getRewardsForLevel(4).find(r => r.type === 'inventory_slots')).toBeUndefined();
    });

    it('grants merchant discount every 5 levels', () => {
      expect(getRewardsForLevel(5).find(r => r.type === 'merchant_discount')).toBeDefined();
      expect(getRewardsForLevel(10).find(r => r.type === 'merchant_discount')).toBeDefined();
      expect(getRewardsForLevel(3).find(r => r.type === 'merchant_discount')).toBeUndefined();
    });

    it('grants correct merchant discount values', () => {
      const l5 = getRewardsForLevel(5).find(r => r.type === 'merchant_discount');
      expect(l5?.value).toBe(2);
      const l10 = getRewardsForLevel(10).find(r => r.type === 'merchant_discount');
      expect(l10?.value).toBe(4);
      const l15 = getRewardsForLevel(15).find(r => r.type === 'merchant_discount');
      expect(l15?.value).toBe(6);
    });

    it('grants conversation topic at tier milestones', () => {
      const l5 = getRewardsForLevel(5).find(r => r.type === 'conversation_topic');
      expect(l5?.value).toBe('daily_life');
      const l10 = getRewardsForLevel(10).find(r => r.type === 'conversation_topic');
      expect(l10?.value).toBe('culture');
      const l15 = getRewardsForLevel(15).find(r => r.type === 'conversation_topic');
      expect(l15?.value).toBe('abstract');
      const l20 = getRewardsForLevel(20).find(r => r.type === 'conversation_topic');
      expect(l20?.value).toBe('mastery');
    });

    it('grants quest tier at milestones', () => {
      expect(getRewardsForLevel(5).find(r => r.type === 'quest_tier')?.value).toBe('elementary');
      expect(getRewardsForLevel(10).find(r => r.type === 'quest_tier')?.value).toBe('intermediate');
      expect(getRewardsForLevel(15).find(r => r.type === 'quest_tier')?.value).toBe('advanced');
      expect(getRewardsForLevel(20).find(r => r.type === 'quest_tier')?.value).toBe('native');
    });

    it('non-milestone levels have no topic or quest tier rewards', () => {
      const rewards = getRewardsForLevel(7);
      expect(rewards.find(r => r.type === 'conversation_topic')).toBeUndefined();
      expect(rewards.find(r => r.type === 'quest_tier')).toBeUndefined();
    });
  });

  describe('getInventorySlotBonus', () => {
    it('returns 0 for levels 1-2', () => {
      expect(getInventorySlotBonus(1)).toBe(0);
      expect(getInventorySlotBonus(2)).toBe(0);
    });

    it('returns cumulative bonuses', () => {
      expect(getInventorySlotBonus(3)).toBe(2);
      expect(getInventorySlotBonus(6)).toBe(4);
      expect(getInventorySlotBonus(9)).toBe(6);
      expect(getInventorySlotBonus(12)).toBe(8);
    });
  });

  describe('getMerchantDiscount', () => {
    it('returns 0 for levels below 5', () => {
      expect(getMerchantDiscount(1)).toBe(0);
      expect(getMerchantDiscount(4)).toBe(0);
    });

    it('returns cumulative discounts', () => {
      expect(getMerchantDiscount(5)).toBe(2);
      expect(getMerchantDiscount(10)).toBe(4);
      expect(getMerchantDiscount(15)).toBe(6);
      expect(getMerchantDiscount(20)).toBe(8);
    });
  });
});
