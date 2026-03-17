/**
 * Tests for street-network-generator.ts
 */

import { describe, it, expect } from 'vitest';
import {
  generateStreetNetwork,
  chooseLayout,
  placeLots,
  type StreetNetworkConfig,
} from '../generators/street-network-generator';

// ─────────────────────────────────────────────
// chooseLayout
// ─────────────────────────────────────────────

describe('chooseLayout', () => {
  it('returns grid by default regardless of founding year', () => {
    expect(chooseLayout('city', 1750)).toBe('grid');
    expect(chooseLayout('city', 1850)).toBe('grid');
    expect(chooseLayout('village', 1950)).toBe('grid');
    expect(chooseLayout('town', 1900)).toBe('grid');
  });

  it('respects layoutOverride', () => {
    expect(chooseLayout('city', 1850, 'organic')).toBe('organic');
    expect(chooseLayout('village', 1600, 'grid')).toBe('grid');
  });
});

// ─────────────────────────────────────────────
// Grid layout
// ─────────────────────────────────────────────

describe('generateStreetNetwork - grid', () => {
  const config: StreetNetworkConfig = {
    centerX: 100,
    centerZ: 100,
    settlementType: 'town',
    foundedYear: 1900,
    seed: 'test-seed',
    layoutOverride: 'grid',
  };

  it('produces nodes and segments', () => {
    const net = generateStreetNetwork(config);
    expect(net.nodes.length).toBeGreaterThan(0);
    expect(net.segments.length).toBeGreaterThan(0);
  });

  it('creates NS and EW streets', () => {
    const net = generateStreetNetwork(config);
    const ns = net.segments.filter(s => s.direction === 'NS');
    const ew = net.segments.filter(s => s.direction === 'EW');
    expect(ns.length).toBeGreaterThan(0);
    expect(ew.length).toBeGreaterThan(0);
  });

  it('grid nodes are near the center', () => {
    const net = generateStreetNetwork(config);
    for (const node of net.nodes) {
      // Town grid with spacing 35 and size 5: half-extent = 2*35 = 70, plus jitter
      expect(Math.abs(node.x - config.centerX)).toBeLessThan(100);
      expect(Math.abs(node.z - config.centerZ)).toBeLessThan(100);
    }
  });

  it('every node has at least one intersection', () => {
    const net = generateStreetNetwork(config);
    for (const node of net.nodes) {
      expect(node.intersectionOf.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('corner nodes intersect exactly 2 streets', () => {
    const net = generateStreetNetwork(config);
    // Grid corners are at grid positions (0,0), (0,cols-1), (rows-1,0), (rows-1,cols-1)
    const corners = net.nodes.filter(n => n.id === 'node_0_0' || n.id === 'node_4_4');
    for (const corner of corners) {
      expect(corner.intersectionOf.length).toBe(2);
    }
  });

  it('each segment has at least 2 waypoints', () => {
    const net = generateStreetNetwork(config);
    for (const seg of net.segments) {
      expect(seg.waypoints.length).toBeGreaterThanOrEqual(2);
      expect(seg.nodeIds.length).toBe(seg.waypoints.length);
    }
  });

  it('is deterministic with same seed', () => {
    const net1 = generateStreetNetwork(config);
    const net2 = generateStreetNetwork(config);
    expect(net1.nodes.length).toBe(net2.nodes.length);
    for (let i = 0; i < net1.nodes.length; i++) {
      expect(net1.nodes[i].x).toBe(net2.nodes[i].x);
      expect(net1.nodes[i].z).toBe(net2.nodes[i].z);
    }
  });

  it('grid positions are purely geometric (no random jitter)', () => {
    // Two grids with different seeds but same type should produce identical positions
    const net1 = generateStreetNetwork(config);
    const net2 = generateStreetNetwork({ ...config, seed: 'different-seed' });
    expect(net1.nodes.length).toBe(net2.nodes.length);
    for (let i = 0; i < net1.nodes.length; i++) {
      expect(net1.nodes[i].x).toBe(net2.nodes[i].x);
      expect(net1.nodes[i].z).toBe(net2.nodes[i].z);
    }
  });

  it('village grid is smaller than city grid', () => {
    const village = generateStreetNetwork({ ...config, settlementType: 'village', layoutOverride: 'grid' });
    const city = generateStreetNetwork({ ...config, settlementType: 'city', layoutOverride: 'grid' });
    expect(village.nodes.length).toBeLessThan(city.nodes.length);
    expect(village.segments.length).toBeLessThan(city.segments.length);
  });
});

// ─────────────────────────────────────────────
// Organic / radial layout
// ─────────────────────────────────────────────

describe('generateStreetNetwork - organic', () => {
  const config: StreetNetworkConfig = {
    centerX: 200,
    centerZ: 200,
    settlementType: 'village',
    foundedYear: 1700,
    seed: 'organic-test',
    layoutOverride: 'organic',
  };

  it('produces a center node', () => {
    const net = generateStreetNetwork(config);
    const center = net.nodes.find(n => n.id === 'node_center');
    expect(center).toBeDefined();
    expect(center!.x).toBe(config.centerX);
    expect(center!.z).toBe(config.centerZ);
  });

  it('produces spoke and ring segments', () => {
    const net = generateStreetNetwork(config);
    const spokes = net.segments.filter(s => s.id.startsWith('street_spoke_'));
    const rings = net.segments.filter(s => s.id.startsWith('street_ring_'));
    expect(spokes.length).toBeGreaterThan(0);
    expect(rings.length).toBeGreaterThan(0);
  });

  it('ring segments close back to their first node', () => {
    const net = generateStreetNetwork(config);
    const rings = net.segments.filter(s => s.id.startsWith('street_ring_'));
    for (const ring of rings) {
      expect(ring.nodeIds[0]).toBe(ring.nodeIds[ring.nodeIds.length - 1]);
    }
  });

  it('spoke segments start at center', () => {
    const net = generateStreetNetwork(config);
    const spokes = net.segments.filter(s => s.id.startsWith('street_spoke_'));
    for (const spoke of spokes) {
      expect(spoke.nodeIds[0]).toBe('node_center');
    }
  });

  it('all nodes are within reasonable radius from center', () => {
    const net = generateStreetNetwork(config);
    for (const node of net.nodes) {
      const dx = node.x - config.centerX;
      const dz = node.z - config.centerZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      // Should be within max radius + jitter
      expect(dist).toBeLessThan(200);
    }
  });
});

// ─────────────────────────────────────────────
// Lot placement
// ─────────────────────────────────────────────

describe('placeLots', () => {
  const config: StreetNetworkConfig = {
    centerX: 0,
    centerZ: 0,
    settlementType: 'town',
    foundedYear: 1900,
    seed: 'lot-test',
    layoutOverride: 'grid',
  };

  it('returns lots up to the requested count (capped by capacity)', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 30, 'lot-seed', 'town');
    expect(lots.length).toBeGreaterThan(0);
    expect(lots.length).toBeLessThanOrEqual(30);
  });

  it('assigns street names from the network', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 20, 'lot-seed', 'town');
    const streetNames = new Set(net.segments.map(s => s.name));
    for (const lot of lots) {
      expect(streetNames.has(lot.streetName)).toBe(true);
    }
  });

  it('lots are offset from street centerlines', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 10, 'lot-seed', 'town');
    // Lots should not be exactly on any waypoint
    for (const lot of lots) {
      const onWaypoint = net.segments.some(seg =>
        seg.waypoints.some(wp =>
          Math.abs(wp.x - lot.x) < 0.01 && Math.abs(wp.z - lot.z) < 0.01,
        ),
      );
      expect(onWaypoint).toBe(false);
    }
  });

  it('places lots on both sides of streets', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 20, 'lot-seed', 'town');
    const leftCount = lots.filter(l => l.side === 'left').length;
    const rightCount = lots.filter(l => l.side === 'right').length;
    expect(leftCount).toBeGreaterThan(0);
    expect(rightCount).toBeGreaterThan(0);
  });

  it('handles zero lots gracefully', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 0, 'lot-seed', 'town');
    expect(lots.length).toBe(0);
  });

  it('caps lots at street capacity when requesting more than fits', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 200, 'lot-seed', 'town');
    // Should return a reasonable number, not 200
    expect(lots.length).toBeGreaterThan(0);
    expect(lots.length).toBeLessThanOrEqual(200);
  });

  it('includes lotWidth and lotDepth on each placement', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 10, 'lot-seed', 'town');
    for (const lot of lots) {
      // Block-based: lot width varies based on block subdivision
      expect(lot.lotWidth).toBeGreaterThan(0);
      expect(lot.lotWidth).toBeLessThanOrEqual(40); // cannot exceed grid spacing
      expect(lot.lotDepth).toBeGreaterThan(0);
      expect(lot.lotDepth).toBeLessThanOrEqual(20); // half-block depth
    }
  });

  it('assigns sequential house numbers', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 20, 'lot-seed', 'town');
    const numbers = lots.map(l => l.houseNumber);
    // House numbers should be sequential starting from 1
    for (let i = 0; i < numbers.length; i++) {
      expect(numbers[i]).toBe(i + 1);
    }
  });

  it('same-side lots on the same street do not overlap', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 40, 'lot-seed', 'town');
    // Group by street + side
    const groups = new Map<string, typeof lots>();
    for (const lot of lots) {
      const key = `${lot.streetId}:${lot.side}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(lot);
    }
    groups.forEach((group) => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const dx = group[i].x - group[j].x;
          const dz = group[i].z - group[j].z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          // Same-side lots should be at least lot-width apart
          expect(dist).toBeGreaterThan(group[i].lotWidth * 0.9);
        }
      }
    });
  });
});
