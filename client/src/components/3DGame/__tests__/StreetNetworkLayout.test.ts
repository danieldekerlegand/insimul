import { describe, it, expect } from 'vitest';
import { buildStreetNetwork } from '../StreetNetworkLayout';
import type { StreetNetwork } from '../../../../../shared/game-engine/types';

const baseConfig = {
  settlementId: 'test-settlement',
  centerX: 100,
  centerZ: 200,
  radius: 55,
  population: 500,
  settlementType: 'town',
};

describe('StreetNetworkLayout', () => {
  describe('buildStreetNetwork — grid layout', () => {
    it('generates grid nodes and segments for a town', () => {
      const net = buildStreetNetwork(baseConfig);

      expect(net.nodes.length).toBeGreaterThan(0);
      expect(net.segments.length).toBeGreaterThan(0);

      // Grid layout: should have NS and EW segments
      const nsSegments = net.segments.filter(s => s.direction === 'NS');
      const ewSegments = net.segments.filter(s => s.direction === 'EW');
      expect(nsSegments.length).toBeGreaterThan(0);
      expect(ewSegments.length).toBeGreaterThan(0);
    });

    it('centers the grid on the given position', () => {
      const net = buildStreetNetwork(baseConfig);

      const avgX = net.nodes.reduce((s, n) => s + n.x, 0) / net.nodes.length;
      const avgZ = net.nodes.reduce((s, n) => s + n.z, 0) / net.nodes.length;

      expect(avgX).toBeCloseTo(baseConfig.centerX, 0);
      expect(avgZ).toBeCloseTo(baseConfig.centerZ, 0);
    });

    it('creates intersection nodes with multiple street references', () => {
      const net = buildStreetNetwork(baseConfig);

      // Interior nodes should belong to 2 streets (one NS + one EW)
      const multiStreetNodes = net.nodes.filter(n => n.intersectionOf.length >= 2);
      expect(multiStreetNodes.length).toBeGreaterThan(0);
    });

    it('each segment has at least 2 waypoints', () => {
      const net = buildStreetNetwork(baseConfig);
      for (const seg of net.segments) {
        expect(seg.waypoints.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('segment waypoints match their node positions', () => {
      const net = buildStreetNetwork(baseConfig);
      const nodeById = new Map(net.nodes.map(n => [n.id, n]));

      for (const seg of net.segments) {
        for (let i = 0; i < seg.nodeIds.length; i++) {
          const node = nodeById.get(seg.nodeIds[i])!;
          expect(node).toBeDefined();
          expect(seg.waypoints[i].x).toBeCloseTo(node.x, 5);
          expect(seg.waypoints[i].z).toBeCloseTo(node.z, 5);
        }
      }
    });

    it('uses provided street names when available', () => {
      const net = buildStreetNetwork({
        ...baseConfig,
        streetNames: ['Foo Blvd', 'Bar Lane'],
      });

      const names = net.segments.map(s => s.name);
      expect(names).toContain('Foo Blvd');
      expect(names).toContain('Bar Lane');
    });

    it('scales grid size with settlement radius', () => {
      const small = buildStreetNetwork({ ...baseConfig, radius: 25 });
      const large = buildStreetNetwork({ ...baseConfig, radius: 100 });

      expect(large.nodes.length).toBeGreaterThan(small.nodes.length);
    });
  });

  describe('buildStreetNetwork — organic layout', () => {
    const villageConfig = {
      ...baseConfig,
      population: 80,
      settlementType: 'village',
      radius: 25,
    };

    it('generates organic layout for villages', () => {
      const net = buildStreetNetwork(villageConfig);

      const radialSegs = net.segments.filter(s => s.direction === 'radial');
      const ringSegs = net.segments.filter(s => s.direction === 'ring');

      expect(radialSegs.length).toBeGreaterThan(0);
      // Ring may or may not exist depending on radius
      expect(radialSegs.length + ringSegs.length).toBe(net.segments.length);
    });

    it('radial spokes start from center', () => {
      const net = buildStreetNetwork(villageConfig);
      const radials = net.segments.filter(s => s.direction === 'radial');

      for (const seg of radials) {
        expect(seg.waypoints[0].x).toBeCloseTo(villageConfig.centerX, 0);
        expect(seg.waypoints[0].z).toBeCloseTo(villageConfig.centerZ, 0);
      }
    });

    it('ring roads form closed loops', () => {
      const net = buildStreetNetwork({
        ...villageConfig,
        radius: 45, // large enough to get rings
      });

      const rings = net.segments.filter(s => s.direction === 'ring');
      for (const ring of rings) {
        const first = ring.waypoints[0];
        const last = ring.waypoints[ring.waypoints.length - 1];
        // First and last should be the same point (loop closure)
        expect(first.x).toBeCloseTo(last.x, 1);
        expect(first.z).toBeCloseTo(last.z, 1);
      }
    });
  });

  describe('buildStreetNetwork — server data passthrough', () => {
    it('uses server-provided StreetNetwork when available', () => {
      const serverNetwork: StreetNetwork = {
        nodes: [
          { id: 'n1', x: 0, z: 0, intersectionOf: ['s1'] },
          { id: 'n2', x: 10, z: 0, intersectionOf: ['s1'] },
        ],
        segments: [
          {
            id: 's1',
            name: 'Server St',
            direction: 'EW',
            nodeIds: ['n1', 'n2'],
            waypoints: [{ x: 0, z: 0 }, { x: 10, z: 0 }],
            width: 3,
          },
        ],
      };

      const net = buildStreetNetwork(baseConfig, serverNetwork);

      // Should use server data, offset to settlement center
      expect(net.segments.length).toBe(1);
      expect(net.segments[0].name).toBe('Server St');
      expect(net.nodes[0].x).toBeCloseTo(baseConfig.centerX + 0, 5);
      expect(net.nodes[0].z).toBeCloseTo(baseConfig.centerZ + 0, 5);
      expect(net.segments[0].waypoints[1].x).toBeCloseTo(baseConfig.centerX + 10, 5);
    });

    it('falls back to generated layout when server data is empty', () => {
      const emptyNetwork: StreetNetwork = { nodes: [], segments: [] };
      const net = buildStreetNetwork(baseConfig, emptyNetwork);

      // Should generate layout since server data is empty
      expect(net.segments.length).toBeGreaterThan(0);
    });

    it('falls back to generated layout when server data is null', () => {
      const net = buildStreetNetwork(baseConfig, null);
      expect(net.segments.length).toBeGreaterThan(0);
    });
  });
});
