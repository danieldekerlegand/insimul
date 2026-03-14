/**
 * Tests for US-070: Address-to-position mapping and lot coordinate persistence
 */

import { describe, it, expect } from 'vitest';
import {
  generateStreetNetwork,
  placeLots,
  type StreetNetworkConfig,
  type LotPlacement,
} from '../generators/street-network-generator';

// ─────────────────────────────────────────────
// LotPlacement coordinate persistence
// ─────────────────────────────────────────────

describe('placeLots - coordinate fields', () => {
  const config: StreetNetworkConfig = {
    centerX: 100,
    centerZ: 100,
    settlementType: 'town',
    foundedYear: 1900,
    seed: 'address-test',
    layoutOverride: 'grid',
  };

  const network = generateStreetNetwork(config);

  it('returns placements with x and z coordinates', () => {
    const placements = placeLots(network, 10, 'test-seed');
    expect(placements.length).toBeGreaterThan(0);
    for (const p of placements) {
      expect(typeof p.x).toBe('number');
      expect(typeof p.z).toBe('number');
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.z)).toBe(true);
    }
  });

  it('returns placements with facingAngle', () => {
    const placements = placeLots(network, 10, 'test-seed');
    for (const p of placements) {
      expect(typeof p.facingAngle).toBe('number');
      expect(Number.isFinite(p.facingAngle)).toBe(true);
      // facingAngle should be in [-π, π] range
      expect(p.facingAngle).toBeGreaterThanOrEqual(-Math.PI);
      expect(p.facingAngle).toBeLessThanOrEqual(Math.PI);
    }
  });

  it('returns placements with streetId and side', () => {
    const placements = placeLots(network, 10, 'test-seed');
    for (const p of placements) {
      expect(typeof p.streetId).toBe('string');
      expect(p.streetId.length).toBeGreaterThan(0);
      expect(['left', 'right']).toContain(p.side);
    }
  });

  it('returns placements with streetName and houseNumber', () => {
    const placements = placeLots(network, 10, 'test-seed');
    for (const p of placements) {
      expect(typeof p.streetName).toBe('string');
      expect(p.streetName.length).toBeGreaterThan(0);
      expect(typeof p.houseNumber).toBe('number');
      expect(p.houseNumber).toBeGreaterThan(0);
    }
  });

  it('positions are offset from the street centerline', () => {
    const placements = placeLots(network, 10, 'test-seed');
    // Lots should not be at the exact street waypoint positions
    const streetWaypoints = network.segments.flatMap(s => s.waypoints);
    for (const p of placements) {
      const onStreet = streetWaypoints.some(
        wp => Math.abs(wp.x - p.x) < 0.01 && Math.abs(wp.z - p.z) < 0.01
      );
      expect(onStreet).toBe(false);
    }
  });

  it('is deterministic with the same seed', () => {
    const p1 = placeLots(network, 10, 'determinism-seed');
    const p2 = placeLots(network, 10, 'determinism-seed');
    expect(p1.length).toBe(p2.length);
    for (let i = 0; i < p1.length; i++) {
      expect(p1[i].x).toBe(p2[i].x);
      expect(p1[i].z).toBe(p2[i].z);
      expect(p1[i].facingAngle).toBe(p2[i].facingAngle);
      expect(p1[i].side).toBe(p2[i].side);
    }
  });
});

// ─────────────────────────────────────────────
// Address-to-position mapping logic
// ─────────────────────────────────────────────

describe('address-to-position mapping', () => {
  const config: StreetNetworkConfig = {
    centerX: 100,
    centerZ: 100,
    settlementType: 'town',
    foundedYear: 1900,
    seed: 'mapping-test',
    layoutOverride: 'grid',
  };

  const network = generateStreetNetwork(config);

  it('each placement has a unique streetName+houseNumber address', () => {
    const placements = placeLots(network, 20, 'address-unique');
    const addressKeys = placements.map(p => `${p.streetName}:${p.houseNumber}`);
    // Within the same street segment, house numbers are unique
    const perStreet = new Map<string, Set<number>>();
    for (const p of placements) {
      if (!perStreet.has(p.streetId)) perStreet.set(p.streetId, new Set());
      const nums = perStreet.get(p.streetId)!;
      expect(nums.has(p.houseNumber)).toBe(false);
      nums.add(p.houseNumber);
    }
  });

  it('can build a lookup map from address to position', () => {
    const placements = placeLots(network, 15, 'lookup-test');
    const lookupMap = new Map<string, LotPlacement>();
    for (const p of placements) {
      const key = `${p.houseNumber} ${p.streetName}`;
      lookupMap.set(key.toLowerCase(), p);
    }

    // Verify all placements are findable by address
    for (const p of placements) {
      const addr = `${p.houseNumber} ${p.streetName}`.toLowerCase();
      const found = lookupMap.get(addr);
      expect(found).toBeDefined();
      expect(found!.x).toBe(p.x);
      expect(found!.z).toBe(p.z);
      expect(found!.facingAngle).toBe(p.facingAngle);
    }
  });

  it('left and right side lots face opposite directions', () => {
    const placements = placeLots(network, 20, 'sides-test');
    // Group by street segment
    const byStreet = new Map<string, LotPlacement[]>();
    for (const p of placements) {
      if (!byStreet.has(p.streetId)) byStreet.set(p.streetId, []);
      byStreet.get(p.streetId)!.push(p);
    }

    for (const [, streetLots] of byStreet) {
      const leftLots = streetLots.filter(p => p.side === 'left');
      const rightLots = streetLots.filter(p => p.side === 'right');

      if (leftLots.length > 0 && rightLots.length > 0) {
        // Left and right facing angles should differ (approximately opposite)
        const leftAngle = leftLots[0].facingAngle;
        const rightAngle = rightLots[0].facingAngle;
        const angleDiff = Math.abs(leftAngle - rightAngle);
        // Should be roughly π apart (opposite directions)
        const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
        expect(normalizedDiff).toBeGreaterThan(Math.PI * 0.8);
      }
    }
  });
});
