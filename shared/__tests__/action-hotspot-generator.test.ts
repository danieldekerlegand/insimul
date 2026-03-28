/**
 * Tests for ActionHotspotGenerator
 */

import { describe, it, expect } from 'vitest';
import { ActionHotspotGenerator, type WorldLocation } from '../game-engine/logic/ActionHotspotGenerator';

const SAMPLE_LOCATIONS: WorldLocation[] = [
  { id: 'loc-1', name: 'River Bank', type: 'river', position: { x: 10, z: 20 }, hasWater: true },
  { id: 'loc-2', name: 'Town Garden', type: 'garden', position: { x: 30, z: 40 }, hasGarden: true },
  { id: 'loc-3', name: 'Le Boulanger', type: 'business', position: { x: 50, z: 60 }, businessType: 'Bakery' },
  { id: 'loc-4', name: 'Mountain Quarry', type: 'quarry', position: { x: 70, z: 80 }, hasRocks: true },
  { id: 'loc-5', name: "Pierre's House", type: 'residence', position: { x: 90, z: 100 } },
  { id: 'loc-6', name: 'Deep Forest', type: 'forest', position: { x: 110, z: 120 }, hasForest: true },
  { id: 'loc-7', name: 'The Forge', type: 'business', position: { x: 130, z: 140 }, businessType: 'Blacksmith' },
  { id: 'loc-8', name: 'Empty Lot', type: 'empty', position: { x: 150, z: 160 } },
  { id: 'loc-9', name: 'No Position', type: 'river' }, // no position - should be skipped
];

describe('ActionHotspotGenerator', () => {
  describe('generate', () => {
    it('creates fishing hotspots at water locations', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      const fishing = hotspots.filter(h => h.actionType === 'fishing');

      expect(fishing.length).toBeGreaterThan(0);
      expect(fishing.some(h => h.locationId === 'loc-1')).toBe(true);
    });

    it('creates herbalism hotspots at garden/forest locations', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      const herbs = hotspots.filter(h => h.actionType === 'herbalism');

      expect(herbs.length).toBeGreaterThan(0);
      expect(herbs.some(h => h.locationId === 'loc-2')).toBe(true);
      expect(herbs.some(h => h.locationId === 'loc-6')).toBe(true);
    });

    it('creates cooking hotspots at restaurants and residences', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      const cooking = hotspots.filter(h => h.actionType === 'cooking');

      expect(cooking.length).toBeGreaterThan(0);
      expect(cooking.some(h => h.locationId === 'loc-3')).toBe(true); // Bakery
      expect(cooking.some(h => h.locationId === 'loc-5')).toBe(true); // residence
    });

    it('creates mining hotspots at rocky locations', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      const mining = hotspots.filter(h => h.actionType === 'mining');

      expect(mining.length).toBeGreaterThan(0);
      expect(mining.some(h => h.locationId === 'loc-4')).toBe(true);
    });

    it('creates crafting hotspots at blacksmith', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      const crafting = hotspots.filter(h => h.actionType === 'crafting');

      expect(crafting.length).toBeGreaterThan(0);
      expect(crafting.some(h => h.locationId === 'loc-7')).toBe(true);
    });

    it('skips locations without position', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      expect(hotspots.every(h => h.locationId !== 'loc-9')).toBe(true);
    });

    it('does not create hotspots for non-matching locations', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      expect(hotspots.every(h => h.locationId !== 'loc-8')).toBe(true);
    });

    it('each hotspot has vocabulary data', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      for (const h of hotspots) {
        expect(h.vocabulary.length).toBeGreaterThan(0);
        for (const v of h.vocabulary) {
          expect(v.targetWord).toBeTruthy();
          expect(v.translation).toBeTruthy();
          expect(v.category).toBeTruthy();
        }
      }
    });

    it('each hotspot has unique ID', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      const ids = hotspots.map(h => h.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('hotspot positions are offset from location center', () => {
      const hotspots = ActionHotspotGenerator.generate([
        { id: 'loc-1', name: 'River', type: 'river', position: { x: 100, z: 200 }, hasWater: true },
      ]);

      expect(hotspots.length).toBeGreaterThan(0);
      // Position should be offset from 100, 200 (within radius 2)
      const h = hotspots[0];
      const dx = h.position.x - 100;
      const dz = h.position.z - 200;
      const dist = Math.sqrt(dx * dx + dz * dz);
      // Should be exactly at radius 2 from center
      expect(dist).toBeCloseTo(2, 1);
    });
  });

  describe('generateQuestSuggestions', () => {
    it('generates quest suggestions from hotspots', () => {
      const hotspots = ActionHotspotGenerator.generate(SAMPLE_LOCATIONS);
      const suggestions = ActionHotspotGenerator.generateQuestSuggestions(hotspots);

      expect(suggestions.length).toBeGreaterThan(0);
      for (const s of suggestions) {
        expect(s.questDescription).toBeTruthy();
        expect(s.vocabulary.length).toBeGreaterThan(0);
        expect(s.locationName).toBeTruthy();
      }
    });

    it('quest descriptions reference the location name', () => {
      const hotspots = ActionHotspotGenerator.generate([
        { id: 'loc-1', name: 'River Bank', type: 'river', position: { x: 0, z: 0 }, hasWater: true },
      ]);
      const suggestions = ActionHotspotGenerator.generateQuestSuggestions(hotspots);

      expect(suggestions.some(s => s.questDescription.includes('River Bank'))).toBe(true);
    });
  });
});
