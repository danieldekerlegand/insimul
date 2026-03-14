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
  it('returns organic for settlements founded before 1800', () => {
    expect(chooseLayout('city', 1750)).toBe('organic');
  });

  it('returns grid for cities founded after 1800', () => {
    expect(chooseLayout('city', 1850)).toBe('grid');
  });

  it('returns organic for villages regardless of year', () => {
    expect(chooseLayout('village', 1950)).toBe('organic');
  });

  it('returns grid for towns founded after 1800', () => {
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

  it('produces different results with different seeds', () => {
    const net2 = generateStreetNetwork({ ...config, seed: 'different-seed' });
    const net1 = generateStreetNetwork(config);
    // Node positions should differ
    const sameCount = net1.nodes.filter((n, i) =>
      n.x === net2.nodes[i]?.x && n.z === net2.nodes[i]?.z,
    ).length;
    expect(sameCount).toBeLessThan(net1.nodes.length);
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

  it('returns the requested number of lots', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 30, 'lot-seed');
    expect(lots.length).toBe(30);
  });

  it('assigns street names from the network', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 20, 'lot-seed');
    const streetNames = new Set(net.segments.map(s => s.name));
    for (const lot of lots) {
      expect(streetNames.has(lot.streetName)).toBe(true);
    }
  });

  it('lots are offset from street centerlines', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 10, 'lot-seed');
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

  it('alternates sides', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 20, 'lot-seed');
    const leftCount = lots.filter(l => l.side === 'left').length;
    const rightCount = lots.filter(l => l.side === 'right').length;
    expect(leftCount).toBeGreaterThan(0);
    expect(rightCount).toBeGreaterThan(0);
  });

  it('handles zero lots gracefully', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 0, 'lot-seed');
    expect(lots.length).toBe(0);
  });

  it('handles more lots than street length', () => {
    const net = generateStreetNetwork(config);
    const lots = placeLots(net, 200, 'lot-seed');
    expect(lots.length).toBe(200);
  });
});
