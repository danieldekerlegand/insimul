/**
 * Tests for NPCBusinessInteractionSystem
 *
 * Run with: npx vitest run client/src/components/3DGame/__tests__/NPCBusinessInteractionSystem.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  NPCBusinessInteractionSystem,
  type PlayerStats,
  type BusinessService,
} from '../NPCBusinessInteractionSystem';
import type { PlacedInteriorNPC } from '../InteriorNPCManager';

function makePlayerStats(overrides?: Partial<PlayerStats>): PlayerStats {
  return {
    gold: 100,
    health: 80,
    maxHealth: 100,
    energy: 60,
    maxEnergy: 100,
    ...overrides,
  };
}

function makePlacedNPC(overrides?: Partial<PlacedInteriorNPC>): PlacedInteriorNPC {
  return {
    npcId: 'npc-1',
    mesh: {} as any,
    role: 'owner',
    interiorPosition: { x: 5, y: 0, z: 5 } as any,
    savedPosition: { x: 0, y: 0, z: 0 } as any,
    wasEnabled: true,
    animationState: 'idle',
    characterData: { firstName: 'Merchant' },
    ...overrides,
  };
}

describe('NPCBusinessInteractionSystem', () => {
  let system: NPCBusinessInteractionSystem;

  beforeEach(() => {
    system = new NPCBusinessInteractionSystem();
  });

  describe('getInteractionsForNPC', () => {
    it('returns empty array for undefined business type', () => {
      const npc = makePlacedNPC();
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, undefined, stats);
      expect(result).toEqual([]);
    });

    it('returns chat + browse wares for a Shop owner', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Shop', stats);

      const ids = result.map(r => r.id);
      expect(ids).toContain('__chat__');
      expect(ids).toContain('__browse_wares__');
    });

    it('does not return browse wares for a visitor in a shop', () => {
      const npc = makePlacedNPC({ role: 'visitor' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Shop', stats);

      const ids = result.map(r => r.id);
      expect(ids).toContain('__chat__');
      expect(ids).not.toContain('__browse_wares__');
    });

    it('returns heal service for Hospital employee', () => {
      const npc = makePlacedNPC({ role: 'employee' });
      const stats = makePlayerStats({ health: 50, maxHealth: 100 });
      const result = system.getInteractionsForNPC(npc, 'Hospital', stats);

      const ids = result.map(r => r.id);
      expect(ids).toContain('heal');
      expect(ids).toContain('cure_status');
      expect(ids).toContain('__browse_wares__'); // Hospital is mercantile
    });

    it('returns rest service for Hotel owner', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Hotel', stats);

      const ids = result.map(r => r.id);
      expect(ids).toContain('rest');
    });

    it('returns blessing for Church', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Church', stats);

      const ids = result.map(r => r.id);
      expect(ids).toContain('blessing');
      expect(ids).not.toContain('__browse_wares__'); // Church is not mercantile
    });

    it('marks heal as disabled when at full health', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats({ health: 100, maxHealth: 100 });
      const result = system.getInteractionsForNPC(npc, 'Hospital', stats);

      const healInteraction = result.find(r => r.id === 'heal');
      expect(healInteraction?.enabled).toBe(false);
      expect(healInteraction?.disabledReason).toContain('full health');
    });

    it('marks service as disabled when not enough gold', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats({ gold: 5, health: 50 });
      const result = system.getInteractionsForNPC(npc, 'Hospital', stats);

      const healInteraction = result.find(r => r.id === 'heal');
      expect(healInteraction?.enabled).toBe(false);
      expect(healInteraction?.disabledReason).toContain('gold');
    });

    it('filters by proximity when position provided', () => {
      const npc = makePlacedNPC();
      // NPC is at (5, 0, 5) — place player far away
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Shop', stats, { x: 100, z: 100 });
      expect(result).toEqual([]);
    });

    it('returns interactions when player is close', () => {
      const npc = makePlacedNPC();
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Shop', stats, { x: 6, z: 5 });
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns eat_meal for Restaurant', () => {
      const npc = makePlacedNPC({ role: 'employee' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Restaurant', stats);

      const ids = result.map(r => r.id);
      expect(ids).toContain('eat_meal');
    });

    it('returns buy_drink for Bar', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Bar', stats);

      const ids = result.map(r => r.id);
      expect(ids).toContain('buy_drink');
    });
  });

  describe('executeService', () => {
    it('heals player to full health', () => {
      const service: BusinessService = {
        id: 'heal',
        name: 'Heal',
        description: 'Heal',
        cost: 25,
        icon: '',
        availableToRoles: ['owner'],
      };
      const stats = makePlayerStats({ health: 50, maxHealth: 100, gold: 100 });
      const result = system.executeService(service, stats);

      expect(result.success).toBe(true);
      expect(result.effects).toContainEqual({ type: 'gold', amount: -25 });
      expect(result.effects).toContainEqual({ type: 'health', amount: 50 });
    });

    it('fails when player cannot afford', () => {
      const service: BusinessService = {
        id: 'heal',
        name: 'Heal',
        description: 'Heal',
        cost: 25,
        icon: '',
        availableToRoles: ['owner'],
      };
      const stats = makePlayerStats({ gold: 5, health: 50 });
      const result = system.executeService(service, stats);

      expect(result.success).toBe(false);
      expect(result.message).toContain('gold');
    });

    it('fails when already at full health', () => {
      const service: BusinessService = {
        id: 'heal',
        name: 'Heal',
        description: 'Heal',
        cost: 25,
        icon: '',
        availableToRoles: ['owner'],
      };
      const stats = makePlayerStats({ health: 100, maxHealth: 100, gold: 100 });
      const result = system.executeService(service, stats);

      expect(result.success).toBe(false);
      expect(result.message).toContain('full health');
    });

    it('rest restores energy and partial health', () => {
      const service: BusinessService = {
        id: 'rest',
        name: 'Rest',
        description: 'Rest',
        cost: 20,
        icon: '',
        availableToRoles: ['owner'],
      };
      const stats = makePlayerStats({ energy: 40, maxEnergy: 100, health: 60, maxHealth: 100, gold: 50 });
      const result = system.executeService(service, stats);

      expect(result.success).toBe(true);
      // Should restore energy to full (60 amount)
      const energyEffect = result.effects.find(e => e.type === 'energy');
      expect(energyEffect?.amount).toBe(60);
      // Should restore 50% of missing health = (100-60)*0.5 = 20
      const healthEffect = result.effects.find(e => e.type === 'health');
      expect(healthEffect?.amount).toBe(20);
    });

    it('blessing gives energy and status', () => {
      const service: BusinessService = {
        id: 'blessing',
        name: 'Blessing',
        description: 'Blessing',
        cost: 0,
        icon: '',
        availableToRoles: ['owner'],
      };
      const stats = makePlayerStats();
      const result = system.executeService(service, stats);

      expect(result.success).toBe(true);
      expect(result.effects).toContainEqual({ type: 'energy', amount: 20 });
      expect(result.effects).toContainEqual(
        expect.objectContaining({ type: 'status', statusName: 'blessed' })
      );
    });

    it('eat_meal restores energy', () => {
      const service: BusinessService = {
        id: 'eat_meal',
        name: 'Order a Meal',
        description: 'Meal',
        cost: 10,
        icon: '',
        availableToRoles: ['owner'],
      };
      const stats = makePlayerStats({ gold: 50 });
      const result = system.executeService(service, stats);

      expect(result.success).toBe(true);
      expect(result.effects).toContainEqual({ type: 'gold', amount: -10 });
      expect(result.effects).toContainEqual({ type: 'energy', amount: 40 });
    });

    it('study costs energy and gold', () => {
      const service: BusinessService = {
        id: 'study',
        name: 'Study',
        description: 'Study',
        cost: 10,
        icon: '',
        availableToRoles: ['owner'],
      };
      const stats = makePlayerStats({ gold: 50 });
      const result = system.executeService(service, stats);

      expect(result.success).toBe(true);
      expect(result.effects).toContainEqual({ type: 'gold', amount: -10 });
      expect(result.effects).toContainEqual({ type: 'energy', amount: -10 });
    });
  });

  describe('isMercantileBusiness', () => {
    it('returns true for Shop', () => {
      expect(system.isMercantileBusiness('Shop')).toBe(true);
    });

    it('returns true for GroceryStore', () => {
      expect(system.isMercantileBusiness('GroceryStore')).toBe(true);
    });

    it('returns false for Church', () => {
      expect(system.isMercantileBusiness('Church')).toBe(false);
    });

    it('returns false for School', () => {
      expect(system.isMercantileBusiness('School')).toBe(false);
    });
  });

  describe('findNearestInteractableNPC', () => {
    it('returns nearest NPC within range', () => {
      const npc1 = makePlacedNPC({ npcId: 'npc-1', interiorPosition: { x: 3, y: 0, z: 3 } as any });
      const npc2 = makePlacedNPC({ npcId: 'npc-2', interiorPosition: { x: 10, y: 0, z: 10 } as any });
      const result = system.findNearestInteractableNPC([npc1, npc2], { x: 2, z: 3 });
      expect(result?.npcId).toBe('npc-1');
    });

    it('returns null when no NPCs in range', () => {
      const npc = makePlacedNPC({ interiorPosition: { x: 100, y: 0, z: 100 } as any });
      const result = system.findNearestInteractableNPC([npc], { x: 0, z: 0 });
      expect(result).toBeNull();
    });

    it('returns null for empty array', () => {
      const result = system.findNearestInteractableNPC([], { x: 0, z: 0 });
      expect(result).toBeNull();
    });
  });

  describe('getServicesForBusinessType', () => {
    it('returns services for Hospital', () => {
      const services = system.getServicesForBusinessType('Hospital');
      expect(services.length).toBeGreaterThan(0);
      expect(services.some(s => s.id === 'heal')).toBe(true);
    });

    it('returns empty for unknown business type', () => {
      const services = system.getServicesForBusinessType('UnknownBusiness');
      expect(services).toEqual([]);
    });

    it('returns services for all defined business types', () => {
      const expectedTypes = ['Hospital', 'Bank', 'Hotel', 'Church', 'School', 'Restaurant', 'Bar', 'LawFirm', 'Barbershop', 'Bathhouse', 'Carpenter', 'Stables', 'Clinic', 'Blacksmith'];
      for (const type of expectedTypes) {
        const services = system.getServicesForBusinessType(type);
        expect(services.length).toBeGreaterThan(0);
      }
    });
  });
});
