import { describe, it, expect } from 'vitest';
import {
  CHARACTER_STYLES,
  CHARACTER_STYLE_LABELS,
  DIVERSITY_LEVELS,
  DIVERSITY_LEVEL_LABELS,
  DEFAULT_NPC_APPEARANCE_CONFIG,
  worldTypeToCharacterStyle,
  type NpcAppearanceConfig,
  type CharacterStyle,
  type DiversityLevel,
} from '../npc-appearance-config';

describe('NPC Appearance Config', () => {
  describe('CHARACTER_STYLES', () => {
    it('contains all expected styles', () => {
      expect(CHARACTER_STYLES).toContain('medieval');
      expect(CHARACTER_STYLES).toContain('fantasy');
      expect(CHARACTER_STYLES).toContain('modern');
      expect(CHARACTER_STYLES).toContain('sci-fi');
      expect(CHARACTER_STYLES).toContain('historical');
      expect(CHARACTER_STYLES).toContain('cyberpunk');
      expect(CHARACTER_STYLES).toContain('steampunk');
      expect(CHARACTER_STYLES).toContain('custom');
      expect(CHARACTER_STYLES).toHaveLength(8);
    });

    it('has a label for every style', () => {
      for (const style of CHARACTER_STYLES) {
        expect(CHARACTER_STYLE_LABELS[style]).toBeTruthy();
      }
    });
  });

  describe('DIVERSITY_LEVELS', () => {
    it('contains low, medium, high', () => {
      expect(DIVERSITY_LEVELS).toEqual(['low', 'medium', 'high']);
    });

    it('has a label for every level', () => {
      for (const level of DIVERSITY_LEVELS) {
        expect(DIVERSITY_LEVEL_LABELS[level]).toBeTruthy();
      }
    });
  });

  describe('DEFAULT_NPC_APPEARANCE_CONFIG', () => {
    it('has valid defaults', () => {
      expect(DEFAULT_NPC_APPEARANCE_CONFIG.characterStyle).toBe('medieval');
      expect(DEFAULT_NPC_APPEARANCE_CONFIG.diversityLevel).toBe('medium');
      expect(DEFAULT_NPC_APPEARANCE_CONFIG.enableGenderModels).toBe(true);
      expect(DEFAULT_NPC_APPEARANCE_CONFIG.roleOverrides).toEqual([]);
    });
  });

  describe('worldTypeToCharacterStyle', () => {
    it('maps null/undefined to medieval', () => {
      expect(worldTypeToCharacterStyle(null)).toBe('medieval');
      expect(worldTypeToCharacterStyle(undefined)).toBe('medieval');
      expect(worldTypeToCharacterStyle('')).toBe('medieval');
    });

    it('maps cyberpunk world types', () => {
      expect(worldTypeToCharacterStyle('cyberpunk')).toBe('cyberpunk');
      expect(worldTypeToCharacterStyle('cyberpunk-noir')).toBe('cyberpunk');
    });

    it('maps sci-fi world types', () => {
      expect(worldTypeToCharacterStyle('sci-fi-space')).toBe('sci-fi');
      expect(worldTypeToCharacterStyle('sci-fi')).toBe('sci-fi');
      expect(worldTypeToCharacterStyle('space-opera')).toBe('sci-fi');
    });

    it('maps steampunk world types', () => {
      expect(worldTypeToCharacterStyle('steampunk')).toBe('steampunk');
      expect(worldTypeToCharacterStyle('steampunk-victorian')).toBe('steampunk');
    });

    it('maps modern world types', () => {
      expect(worldTypeToCharacterStyle('modern-realistic')).toBe('modern');
      expect(worldTypeToCharacterStyle('contemporary')).toBe('modern');
    });

    it('maps historical world types', () => {
      expect(worldTypeToCharacterStyle('historical-medieval')).toBe('historical');
      expect(worldTypeToCharacterStyle('historical')).toBe('historical');
    });

    it('maps fantasy world types', () => {
      expect(worldTypeToCharacterStyle('medieval-fantasy')).toBe('fantasy');
      expect(worldTypeToCharacterStyle('dark-fantasy')).toBe('fantasy');
    });

    it('maps medieval world types (without fantasy)', () => {
      expect(worldTypeToCharacterStyle('medieval')).toBe('medieval');
    });

    it('returns custom for unrecognized types', () => {
      expect(worldTypeToCharacterStyle('post-apocalyptic')).toBe('custom');
      expect(worldTypeToCharacterStyle('underwater')).toBe('custom');
    });

    it('is case insensitive', () => {
      expect(worldTypeToCharacterStyle('CYBERPUNK')).toBe('cyberpunk');
      expect(worldTypeToCharacterStyle('Sci-Fi-Space')).toBe('sci-fi');
    });
  });

  describe('NpcAppearanceConfig type', () => {
    it('accepts a valid config object', () => {
      const config: NpcAppearanceConfig = {
        characterStyle: 'cyberpunk',
        diversityLevel: 'high',
        enableGenderModels: false,
        roleOverrides: [
          { role: 'guard', assetId: 'asset-123', label: 'Cyber Guard' },
        ],
      };
      expect(config.characterStyle).toBe('cyberpunk');
      expect(config.roleOverrides).toHaveLength(1);
      expect(config.roleOverrides[0].role).toBe('guard');
    });
  });
});
