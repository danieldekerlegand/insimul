/**
 * Tests for street network export in IR
 *
 * Verifies that street network topology (nodes, segments, layout)
 * is correctly converted to StreetNetworkIR format.
 */

import { describe, it, expect } from 'vitest';
import {
  generateStreetNetwork,
  chooseLayout,
  type StreetNetworkConfig,
} from '../generators/street-network-generator';
import type {
  StreetNetworkIR,
  StreetNodeIR,
  StreetSegmentIR,
} from '@shared/game-engine/ir-types';

/**
 * Convert a StreetNetwork to StreetNetworkIR (mirrors ir-generator logic).
 */
function toStreetNetworkIR(
  config: StreetNetworkConfig,
): StreetNetworkIR {
  const network = generateStreetNetwork(config);
  const layout = chooseLayout(
    config.settlementType,
    config.foundedYear,
    config.layoutOverride,
  );

  return {
    layout,
    nodes: network.nodes.map(n => ({
      id: n.id,
      position: { x: n.x, y: 0, z: n.z },
      intersectionOf: n.intersectionOf,
    })),
    segments: network.segments.map(seg => ({
      id: seg.id,
      name: seg.name,
      direction: seg.direction,
      nodeIds: seg.nodeIds,
      waypoints: seg.waypoints.map(wp => ({ x: wp.x, y: 0, z: wp.z })),
      width: seg.width,
    })),
  };
}

// ─────────────────────────────────────────────
// Grid layout IR export
// ─────────────────────────────────────────────

describe('Street network IR export - grid', () => {
  const config: StreetNetworkConfig = {
    centerX: 100,
    centerZ: 200,
    settlementType: 'town',
    foundedYear: 1900,
    seed: 'ir-test-grid',
    layoutOverride: 'grid',
  };

  it('sets layout to grid', () => {
    const ir = toStreetNetworkIR(config);
    expect(ir.layout).toBe('grid');
  });

  it('exports all nodes with Vec3 positions', () => {
    const ir = toStreetNetworkIR(config);
    expect(ir.nodes.length).toBeGreaterThan(0);
    for (const node of ir.nodes) {
      expect(node.position).toHaveProperty('x');
      expect(node.position).toHaveProperty('y');
      expect(node.position).toHaveProperty('z');
      expect(node.position.y).toBe(0);
    }
  });

  it('preserves node intersection references', () => {
    const ir = toStreetNetworkIR(config);
    for (const node of ir.nodes) {
      expect(node.intersectionOf.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('exports all segments with names and directions', () => {
    const ir = toStreetNetworkIR(config);
    expect(ir.segments.length).toBeGreaterThan(0);
    for (const seg of ir.segments) {
      expect(seg.name).toBeTruthy();
      expect(['NS', 'EW']).toContain(seg.direction);
      expect(seg.width).toBeGreaterThan(0);
    }
  });

  it('segment waypoints have Vec3 format', () => {
    const ir = toStreetNetworkIR(config);
    for (const seg of ir.segments) {
      expect(seg.waypoints.length).toBeGreaterThanOrEqual(2);
      for (const wp of seg.waypoints) {
        expect(typeof wp.x).toBe('number');
        expect(wp.y).toBe(0);
        expect(typeof wp.z).toBe('number');
      }
    }
  });

  it('segment nodeIds match waypoint count', () => {
    const ir = toStreetNetworkIR(config);
    for (const seg of ir.segments) {
      expect(seg.nodeIds.length).toBe(seg.waypoints.length);
    }
  });

  it('all segment nodeIds reference existing nodes', () => {
    const ir = toStreetNetworkIR(config);
    const nodeIds = new Set(ir.nodes.map(n => n.id));
    for (const seg of ir.segments) {
      for (const nid of seg.nodeIds) {
        expect(nodeIds.has(nid)).toBe(true);
      }
    }
  });

  it('has both NS and EW segments', () => {
    const ir = toStreetNetworkIR(config);
    const ns = ir.segments.filter(s => s.direction === 'NS');
    const ew = ir.segments.filter(s => s.direction === 'EW');
    expect(ns.length).toBeGreaterThan(0);
    expect(ew.length).toBeGreaterThan(0);
  });

  it('is deterministic', () => {
    const ir1 = toStreetNetworkIR(config);
    const ir2 = toStreetNetworkIR(config);
    expect(ir1.nodes.length).toBe(ir2.nodes.length);
    expect(ir1.segments.length).toBe(ir2.segments.length);
    for (let i = 0; i < ir1.nodes.length; i++) {
      expect(ir1.nodes[i].position.x).toBe(ir2.nodes[i].position.x);
      expect(ir1.nodes[i].position.z).toBe(ir2.nodes[i].position.z);
    }
  });
});

// ─────────────────────────────────────────────
// Organic layout IR export
// ─────────────────────────────────────────────

describe('Street network IR export - organic', () => {
  const config: StreetNetworkConfig = {
    centerX: 50,
    centerZ: 50,
    settlementType: 'village',
    foundedYear: 1700,
    seed: 'ir-test-organic',
    layoutOverride: 'organic',
  };

  it('sets layout to organic', () => {
    const ir = toStreetNetworkIR(config);
    expect(ir.layout).toBe('organic');
  });

  it('includes center node at settlement position', () => {
    const ir = toStreetNetworkIR(config);
    const center = ir.nodes.find(n => n.id === 'node_center');
    expect(center).toBeDefined();
    expect(center!.position.x).toBe(config.centerX);
    expect(center!.position.z).toBe(config.centerZ);
  });

  it('has spoke and ring segments', () => {
    const ir = toStreetNetworkIR(config);
    const spokes = ir.segments.filter(s => s.id.startsWith('street_spoke_'));
    const rings = ir.segments.filter(s => s.id.startsWith('street_ring_'));
    expect(spokes.length).toBeGreaterThan(0);
    expect(rings.length).toBeGreaterThan(0);
  });

  it('exports all nodes with intersection data', () => {
    const ir = toStreetNetworkIR(config);
    for (const node of ir.nodes) {
      expect(node.id).toBeTruthy();
      expect(Array.isArray(node.intersectionOf)).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────
// Layout auto-selection in IR
// ─────────────────────────────────────────────

describe('Street network IR layout selection', () => {
  it('city founded after 1800 gets grid layout', () => {
    const ir = toStreetNetworkIR({
      centerX: 0, centerZ: 0,
      settlementType: 'city',
      foundedYear: 1850,
      seed: 'layout-test',
    });
    expect(ir.layout).toBe('grid');
  });

  it('city founded before 1800 gets organic layout', () => {
    const ir = toStreetNetworkIR({
      centerX: 0, centerZ: 0,
      settlementType: 'city',
      foundedYear: 1750,
      seed: 'layout-test',
    });
    expect(ir.layout).toBe('organic');
  });

  it('village always gets organic layout', () => {
    const ir = toStreetNetworkIR({
      centerX: 0, centerZ: 0,
      settlementType: 'village',
      foundedYear: 2000,
      seed: 'layout-test',
    });
    expect(ir.layout).toBe('organic');
  });

  it('city has more nodes and segments than village', () => {
    const city = toStreetNetworkIR({
      centerX: 0, centerZ: 0,
      settlementType: 'city',
      foundedYear: 1900,
      seed: 'scale-test',
      layoutOverride: 'grid',
    });
    const village = toStreetNetworkIR({
      centerX: 0, centerZ: 0,
      settlementType: 'village',
      foundedYear: 1900,
      seed: 'scale-test',
      layoutOverride: 'grid',
    });
    expect(city.nodes.length).toBeGreaterThan(village.nodes.length);
    expect(city.segments.length).toBeGreaterThan(village.segments.length);
  });
});
