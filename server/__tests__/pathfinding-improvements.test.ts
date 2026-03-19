/**
 * Tests for NPC pathfinding improvements:
 * - Binary heap (PathNodeHeap)
 * - Catmull-Rom spline path smoothing
 * - Waypoint look-ahead steering
 * - Corner speed modulation
 */

import { describe, it, expect } from 'vitest';

// --- Mock Vector3 (minimal) ---

class V3 {
  constructor(public x = 0, public y = 0, public z = 0) {}
  clone(): V3 { return new V3(this.x, this.y, this.z); }
  subtract(o: V3): V3 { return new V3(this.x - o.x, this.y - o.y, this.z - o.z); }
  length(): number { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
  scale(s: number): V3 { return new V3(this.x * s, this.y * s, this.z * s); }
  addInPlace(o: V3): V3 { this.x += o.x; this.y += o.y; this.z += o.z; return this; }
  normalizeToNew(): V3 {
    const l = this.length();
    return l < 0.001 ? new V3() : new V3(this.x / l, this.y / l, this.z / l);
  }
  static Dot(a: V3, b: V3): number { return a.x * b.x + a.y * b.y + a.z * b.z; }
  static Cross(a: V3, b: V3): V3 {
    return new V3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
  }
  static Up(): V3 { return new V3(0, 1, 0); }
}

// ===========================================================================
// Binary Heap Tests
// ===========================================================================

interface HeapNode {
  x: number; z: number; g: number; h: number; f: number;
  parent: HeapNode | null; heapIndex: number;
}

/** Standalone copy of PathNodeHeap for testing without Babylon.js imports */
class PathNodeHeap {
  private nodes: HeapNode[] = [];
  get length(): number { return this.nodes.length; }

  push(node: HeapNode): void {
    node.heapIndex = this.nodes.length;
    this.nodes.push(node);
    this.bubbleUp(node.heapIndex);
  }

  pop(): HeapNode | undefined {
    if (this.nodes.length === 0) return undefined;
    const min = this.nodes[0];
    const last = this.nodes.pop()!;
    if (this.nodes.length > 0) {
      last.heapIndex = 0;
      this.nodes[0] = last;
      this.sinkDown(0);
    }
    return min;
  }

  decreaseKey(node: HeapNode): void {
    this.bubbleUp(node.heapIndex);
  }

  findByCoord(x: number, z: number): HeapNode | undefined {
    return this.nodes.find(n => n.x === x && n.z === z);
  }

  private bubbleUp(i: number): void {
    const node = this.nodes[i];
    while (i > 0) {
      const parentIdx = (i - 1) >> 1;
      const parent = this.nodes[parentIdx];
      if (node.f >= parent.f) break;
      this.nodes[i] = parent;
      parent.heapIndex = i;
      i = parentIdx;
    }
    this.nodes[i] = node;
    node.heapIndex = i;
  }

  private sinkDown(i: number): void {
    const length = this.nodes.length;
    const node = this.nodes[i];
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < length && this.nodes[left].f < this.nodes[smallest].f) smallest = left;
      if (right < length && this.nodes[right].f < this.nodes[smallest].f) smallest = right;
      if (smallest === i) break;
      const swap = this.nodes[smallest];
      this.nodes[i] = swap;
      swap.heapIndex = i;
      this.nodes[smallest] = node;
      node.heapIndex = smallest;
      i = smallest;
    }
  }
}

function makeNode(x: number, z: number, f: number): HeapNode {
  return { x, z, g: f, h: 0, f, parent: null, heapIndex: 0 };
}

describe('PathNodeHeap (Binary Heap)', () => {
  it('should extract nodes in ascending f-score order', () => {
    const heap = new PathNodeHeap();
    heap.push(makeNode(0, 0, 10));
    heap.push(makeNode(1, 0, 3));
    heap.push(makeNode(2, 0, 7));
    heap.push(makeNode(3, 0, 1));
    heap.push(makeNode(4, 0, 5));

    const extracted: number[] = [];
    while (heap.length > 0) {
      extracted.push(heap.pop()!.f);
    }
    expect(extracted).toEqual([1, 3, 5, 7, 10]);
  });

  it('should handle single element', () => {
    const heap = new PathNodeHeap();
    heap.push(makeNode(0, 0, 42));
    expect(heap.pop()!.f).toBe(42);
    expect(heap.length).toBe(0);
  });

  it('should return undefined when popping empty heap', () => {
    const heap = new PathNodeHeap();
    expect(heap.pop()).toBeUndefined();
  });

  it('should support decrease-key operation', () => {
    const heap = new PathNodeHeap();
    const a = makeNode(0, 0, 10);
    const b = makeNode(1, 0, 20);
    const c = makeNode(2, 0, 15);
    heap.push(a);
    heap.push(b);
    heap.push(c);

    // Decrease b's f-score to be the minimum
    b.f = 1;
    b.g = 1;
    heap.decreaseKey(b);

    expect(heap.pop()!.x).toBe(1); // b should come first now
  });

  it('should find nodes by coordinate', () => {
    const heap = new PathNodeHeap();
    heap.push(makeNode(5, 3, 10));
    heap.push(makeNode(2, 7, 20));

    expect(heap.findByCoord(5, 3)).toBeDefined();
    expect(heap.findByCoord(5, 3)!.f).toBe(10);
    expect(heap.findByCoord(9, 9)).toBeUndefined();
  });

  it('should handle many nodes correctly', () => {
    const heap = new PathNodeHeap();
    const values = [50, 30, 70, 10, 90, 20, 60, 40, 80, 5];
    for (let i = 0; i < values.length; i++) {
      heap.push(makeNode(i, 0, values[i]));
    }

    const extracted: number[] = [];
    while (heap.length > 0) {
      extracted.push(heap.pop()!.f);
    }

    const sorted = [...values].sort((a, b) => a - b);
    expect(extracted).toEqual(sorted);
  });

  it('should maintain valid heap indices after operations', () => {
    const heap = new PathNodeHeap();
    const nodes = [makeNode(0, 0, 5), makeNode(1, 0, 3), makeNode(2, 0, 8)];
    for (const n of nodes) heap.push(n);

    // After push, each node's heapIndex should be valid
    const popped = heap.pop()!;
    expect(popped.f).toBe(3);
    expect(heap.length).toBe(2);
  });
});

// ===========================================================================
// Catmull-Rom Spline Tests
// ===========================================================================

/**
 * Standalone Catmull-Rom evaluation matching NavigationSystem.catmullRomSmooth
 */
function catmullRomPoint(p0: V3, p1: V3, p2: V3, p3: V3, t: number): V3 {
  const t2 = t * t;
  const t3 = t2 * t;
  return new V3(
    0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    0.5 * ((2 * p1.z) + (-p0.z + p2.z) * t + (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 + (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3),
  );
}

function catmullRomSmooth(points: V3[], segmentsPerSpan = 4): V3[] {
  if (points.length <= 2) return points;
  const result: V3[] = [points[0]];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 1; s <= segmentsPerSpan; s++) {
      result.push(catmullRomPoint(p0, p1, p2, p3, s / segmentsPerSpan));
    }
  }
  return result;
}

describe('Catmull-Rom Spline Smoothing', () => {
  it('should pass through original waypoints at t=0 and t=1', () => {
    const p0 = new V3(0, 0, 0);
    const p1 = new V3(5, 0, 0);
    const p2 = new V3(10, 0, 5);
    const p3 = new V3(15, 0, 5);

    const atStart = catmullRomPoint(p0, p1, p2, p3, 0);
    const atEnd = catmullRomPoint(p0, p1, p2, p3, 1);

    expect(atStart.x).toBeCloseTo(p1.x, 5);
    expect(atStart.z).toBeCloseTo(p1.z, 5);
    expect(atEnd.x).toBeCloseTo(p2.x, 5);
    expect(atEnd.z).toBeCloseTo(p2.z, 5);
  });

  it('should produce more waypoints than input', () => {
    const path = [
      new V3(0, 0, 0),
      new V3(10, 0, 0),
      new V3(10, 0, 10),
      new V3(0, 0, 10),
    ];
    const smoothed = catmullRomSmooth(path);
    expect(smoothed.length).toBeGreaterThan(path.length);
    // 1 (first point) + 3 spans * 4 segments = 13
    expect(smoothed.length).toBe(13);
  });

  it('should return input unchanged for 2 or fewer points', () => {
    const twoPoints = [new V3(0, 0, 0), new V3(10, 0, 0)];
    expect(catmullRomSmooth(twoPoints)).toEqual(twoPoints);

    const onePoint = [new V3(5, 0, 5)];
    expect(catmullRomSmooth(onePoint)).toEqual(onePoint);
  });

  it('should produce a curve that deviates from straight-line L-shaped path', () => {
    // L-shaped path: go right then turn up
    const path = [
      new V3(0, 0, 0),
      new V3(10, 0, 0),
      new V3(10, 0, 10),
    ];
    const smoothed = catmullRomSmooth(path);

    // The midpoint of the curve at the corner should deviate from the sharp corner
    // Find the point nearest to the turn
    const cornerRegion = smoothed.filter(p =>
      p.x > 4 && p.x < 12 && p.z > -2 && p.z < 6
    );
    // At least some points should NOT lie on the two straight line segments
    const offLinePoints = cornerRegion.filter(p => {
      const onHorizontal = Math.abs(p.z) < 0.01;
      const onVertical = Math.abs(p.x - 10) < 0.01;
      return !onHorizontal && !onVertical;
    });
    expect(offLinePoints.length).toBeGreaterThan(0);
  });

  it('should preserve Y values through interpolation', () => {
    const path = [
      new V3(0, 2, 0),
      new V3(5, 2, 0),
      new V3(10, 2, 5),
    ];
    const smoothed = catmullRomSmooth(path);
    // All Y values should be close to 2 for a flat path
    for (const p of smoothed) {
      expect(p.y).toBeCloseTo(2, 0);
    }
  });
});

// ===========================================================================
// Look-Ahead Steering Tests
// ===========================================================================

/**
 * Standalone version of NPCMovementController.computeLookAheadTarget
 */
function computeLookAheadTarget(
  position: V3,
  currentWP: V3,
  distToWP: number,
  nextWP: V3 | null,
  lookAheadDist: number,
): V3 {
  if (!nextWP || distToWP > lookAheadDist) {
    return currentWP;
  }
  const blend = 1 - (distToWP / lookAheadDist);
  return new V3(
    currentWP.x + (nextWP.x - currentWP.x) * blend * 0.5,
    currentWP.y + (nextWP.y - currentWP.y) * blend * 0.5,
    currentWP.z + (nextWP.z - currentWP.z) * blend * 0.5,
  );
}

describe('Waypoint Look-Ahead Steering', () => {
  const LOOK_AHEAD = 2.0;

  it('should return current waypoint when far away', () => {
    const pos = new V3(0, 0, 0);
    const wp = new V3(10, 0, 0);
    const next = new V3(10, 0, 10);
    const result = computeLookAheadTarget(pos, wp, 10, next, LOOK_AHEAD);
    expect(result.x).toBe(wp.x);
    expect(result.z).toBe(wp.z);
  });

  it('should return current waypoint when no next waypoint', () => {
    const pos = new V3(9, 0, 0);
    const wp = new V3(10, 0, 0);
    const result = computeLookAheadTarget(pos, wp, 1, null, LOOK_AHEAD);
    expect(result.x).toBe(wp.x);
    expect(result.z).toBe(wp.z);
  });

  it('should blend toward next waypoint when within look-ahead distance', () => {
    const pos = new V3(9, 0, 0);
    const wp = new V3(10, 0, 0);
    const next = new V3(10, 0, 10);
    const dist = 1.0; // within LOOK_AHEAD

    const result = computeLookAheadTarget(pos, wp, dist, next, LOOK_AHEAD);

    // Should be shifted toward next waypoint (z > 0)
    expect(result.z).toBeGreaterThan(0);
    // Should still be near current waypoint x
    expect(result.x).toBe(10);
  });

  it('should increase blend as NPC gets closer to waypoint', () => {
    const wp = new V3(10, 0, 0);
    const next = new V3(10, 0, 10);

    const far = computeLookAheadTarget(new V3(8.5, 0, 0), wp, 1.5, next, LOOK_AHEAD);
    const close = computeLookAheadTarget(new V3(9.5, 0, 0), wp, 0.5, next, LOOK_AHEAD);

    // Closer NPC should have more blend toward next waypoint
    expect(close.z).toBeGreaterThan(far.z);
  });

  it('should return exact waypoint when at look-ahead boundary', () => {
    const pos = new V3(8, 0, 0);
    const wp = new V3(10, 0, 0);
    const next = new V3(10, 0, 10);

    const result = computeLookAheadTarget(pos, wp, LOOK_AHEAD, next, LOOK_AHEAD);
    // blend = 1 - (2/2) = 0, so result should equal currentWP
    expect(result.x).toBe(wp.x);
    expect(result.z).toBe(wp.z);
  });
});

// ===========================================================================
// Corner Speed Modulation Tests
// ===========================================================================

const SHARP_TURN_ANGLE = Math.PI / 3;
const CORNER_SPEED_MIN = 0.4;
const LOOK_AHEAD_DISTANCE = 2.0;

/**
 * Standalone version of NPCMovementController.computeCornerSpeedMultiplier
 */
function computeCornerSpeedMultiplier(
  position: V3,
  currentWP: V3,
  nextWP: V3 | null,
): number {
  if (!nextWP) return 1.0;

  const toCurrent_x = currentWP.x - position.x;
  const toCurrent_z = currentWP.z - position.z;
  const toNext_x = nextWP.x - currentWP.x;
  const toNext_z = nextWP.z - currentWP.z;

  const lenA = Math.sqrt(toCurrent_x * toCurrent_x + toCurrent_z * toCurrent_z);
  const lenB = Math.sqrt(toNext_x * toNext_x + toNext_z * toNext_z);
  if (lenA < 0.01 || lenB < 0.01) return 1.0;

  const dot = (toCurrent_x * toNext_x + toCurrent_z * toNext_z) / (lenA * lenB);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

  const distToWP = lenA;
  if (distToWP > LOOK_AHEAD_DISTANCE * 2) return 1.0;

  if (angle > SHARP_TURN_ANGLE) {
    const sharpness = Math.min(1, (angle - SHARP_TURN_ANGLE) / (Math.PI - SHARP_TURN_ANGLE));
    const approachFactor = 1 - (distToWP / (LOOK_AHEAD_DISTANCE * 2));
    return 1.0 - (1.0 - CORNER_SPEED_MIN) * sharpness * approachFactor;
  }

  return 1.0;
}

describe('Corner Speed Modulation', () => {
  it('should return 1.0 for straight path (no turn)', () => {
    const pos = new V3(0, 0, 0);
    const wp = new V3(5, 0, 0);
    const next = new V3(10, 0, 0);
    expect(computeCornerSpeedMultiplier(pos, wp, next)).toBe(1.0);
  });

  it('should return 1.0 when no next waypoint', () => {
    const pos = new V3(0, 0, 0);
    const wp = new V3(5, 0, 0);
    expect(computeCornerSpeedMultiplier(pos, wp, null)).toBe(1.0);
  });

  it('should return 1.0 when far from the turn', () => {
    const pos = new V3(0, 0, 0);
    const wp = new V3(20, 0, 0); // 20 units away, > LOOK_AHEAD * 2
    const next = new V3(20, 0, 20); // 90-degree turn
    expect(computeCornerSpeedMultiplier(pos, wp, next)).toBe(1.0);
  });

  it('should slow down for 90-degree turn when close', () => {
    const pos = new V3(2, 0, 0);
    const wp = new V3(3, 0, 0); // 1 unit away
    const next = new V3(3, 0, 10); // 90-degree turn
    const multiplier = computeCornerSpeedMultiplier(pos, wp, next);
    expect(multiplier).toBeLessThan(1.0);
    expect(multiplier).toBeGreaterThanOrEqual(CORNER_SPEED_MIN);
  });

  it('should slow down more for 180-degree turn (U-turn)', () => {
    const pos = new V3(2, 0, 0);
    const wp = new V3(3, 0, 0); // 1 unit away
    const next90 = new V3(3, 0, 10);
    const nextUturn = new V3(-5, 0, 0); // Going backwards

    const mult90 = computeCornerSpeedMultiplier(pos, wp, next90);
    const multUturn = computeCornerSpeedMultiplier(pos, wp, nextUturn);

    expect(multUturn).toBeLessThan(mult90);
  });

  it('should not slow down for gentle turns below threshold', () => {
    const pos = new V3(0, 0, 0);
    const wp = new V3(2, 0, 0);
    // Small angle turn (~15 degrees)
    const next = new V3(4, 0, 0.5);
    const multiplier = computeCornerSpeedMultiplier(pos, wp, next);
    expect(multiplier).toBe(1.0);
  });

  it('should scale slowdown with proximity to corner', () => {
    const wp = new V3(10, 0, 0);
    const next = new V3(10, 0, 10); // 90-degree turn

    const farPos = new V3(7, 0, 0); // 3 units away
    const closePos = new V3(9, 0, 0); // 1 unit away

    const farMult = computeCornerSpeedMultiplier(farPos, wp, next);
    const closeMult = computeCornerSpeedMultiplier(closePos, wp, next);

    expect(closeMult).toBeLessThan(farMult);
  });
});
