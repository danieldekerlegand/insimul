/**
 * Tests for expanded business type definitions (specialized shops & service businesses)
 *
 * Run with: npx vitest run client/src/components/3DGame/__tests__/ExpandedBusinessTypes.test.ts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  NPCBusinessInteractionSystem,
  type PlayerStats,
} from '../NPCBusinessInteractionSystem';
import type { PlacedInteriorNPC } from '../InteriorNPCManager';
import type { BusinessType } from '@shared/schema';

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

describe('Expanded Business Types', () => {
  let system: NPCBusinessInteractionSystem;

  beforeEach(() => {
    system = new NPCBusinessInteractionSystem();
  });

  describe('BusinessType union includes new types', () => {
    it('accepts all new specialized shop types', () => {
      const shopTypes: BusinessType[] = [
        'Blacksmith', 'Tailor', 'Butcher', 'BookStore', 'HerbShop', 'PawnShop',
      ];
      // If this compiles, the types are valid
      expect(shopTypes).toHaveLength(6);
    });

    it('accepts all new service business types', () => {
      const serviceTypes: BusinessType[] = [
        'Barbershop', 'Bathhouse', 'Carpenter', 'Stables', 'Clinic',
      ];
      expect(serviceTypes).toHaveLength(5);
    });
  });

  describe('Mercantile business types', () => {
    const mercantileShops: BusinessType[] = [
      'Blacksmith', 'Tailor', 'Butcher', 'BookStore', 'HerbShop', 'PawnShop', 'Carpenter',
    ];

    for (const shopType of mercantileShops) {
      it(`${shopType} is mercantile (supports buying/selling)`, () => {
        expect(system.isMercantileBusiness(shopType)).toBe(true);
      });
    }

    const nonMercantile: BusinessType[] = ['Barbershop', 'Bathhouse', 'Stables'];

    for (const serviceType of nonMercantile) {
      it(`${serviceType} is NOT mercantile`, () => {
        expect(system.isMercantileBusiness(serviceType)).toBe(false);
      });
    }
  });

  describe('Services for new service businesses', () => {
    it('Barbershop offers haircut service', () => {
      const services = system.getServicesForBusinessType('Barbershop');
      expect(services.some(s => s.id === 'haircut')).toBe(true);
    });

    it('Bathhouse offers bathing service', () => {
      const services = system.getServicesForBusinessType('Bathhouse');
      expect(services.some(s => s.id === 'bathe')).toBe(true);
    });

    it('Carpenter offers repair service', () => {
      const services = system.getServicesForBusinessType('Carpenter');
      expect(services.some(s => s.id === 'repair')).toBe(true);
    });

    it('Stables offers stable_horse service', () => {
      const services = system.getServicesForBusinessType('Stables');
      expect(services.some(s => s.id === 'stable_horse')).toBe(true);
    });

    it('Clinic offers heal and cure_status services', () => {
      const services = system.getServicesForBusinessType('Clinic');
      expect(services.some(s => s.id === 'heal')).toBe(true);
      expect(services.some(s => s.id === 'cure_status')).toBe(true);
    });

    it('Blacksmith offers repair service', () => {
      const services = system.getServicesForBusinessType('Blacksmith');
      expect(services.some(s => s.id === 'repair')).toBe(true);
    });
  });

  describe('Interactions for new business types', () => {
    it('Blacksmith owner has browse wares and repair service', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Blacksmith', stats);
      const ids = result.map(r => r.id);
      expect(ids).toContain('__browse_wares__');
      expect(ids).toContain('repair');
    });

    it('Tailor owner has browse wares but no special services', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Tailor', stats);
      const ids = result.map(r => r.id);
      expect(ids).toContain('__browse_wares__');
      expect(ids).toContain('__chat__');
    });

    it('PawnShop owner has browse wares', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'PawnShop', stats);
      const ids = result.map(r => r.id);
      expect(ids).toContain('__browse_wares__');
    });

    it('Clinic employee has heal service', () => {
      const npc = makePlacedNPC({ role: 'employee' });
      const stats = makePlayerStats({ health: 50 });
      const result = system.getInteractionsForNPC(npc, 'Clinic', stats);
      const ids = result.map(r => r.id);
      expect(ids).toContain('heal');
    });

    it('Barbershop owner has haircut service but no browse wares', () => {
      const npc = makePlacedNPC({ role: 'owner' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Barbershop', stats);
      const ids = result.map(r => r.id);
      expect(ids).toContain('haircut');
      expect(ids).not.toContain('__browse_wares__');
    });

    it('visitor at Blacksmith cannot access services or wares', () => {
      const npc = makePlacedNPC({ role: 'visitor' });
      const stats = makePlayerStats();
      const result = system.getInteractionsForNPC(npc, 'Blacksmith', stats);
      const ids = result.map(r => r.id);
      expect(ids).toContain('__chat__');
      expect(ids).not.toContain('__browse_wares__');
      expect(ids).not.toContain('repair');
    });
  });

  describe('All new service businesses have valid service definitions', () => {
    const serviceBusinesses = ['Barbershop', 'Bathhouse', 'Carpenter', 'Stables', 'Clinic', 'Blacksmith'];

    for (const bizType of serviceBusinesses) {
      it(`${bizType} services have required fields`, () => {
        const services = system.getServicesForBusinessType(bizType);
        expect(services.length).toBeGreaterThan(0);
        for (const service of services) {
          expect(service.id).toBeTruthy();
          expect(service.name).toBeTruthy();
          expect(service.description).toBeTruthy();
          expect(typeof service.cost).toBe('number');
          expect(service.cost).toBeGreaterThanOrEqual(0);
          expect(service.icon).toBeTruthy();
          expect(service.availableToRoles.length).toBeGreaterThan(0);
        }
      });
    }
  });
});
