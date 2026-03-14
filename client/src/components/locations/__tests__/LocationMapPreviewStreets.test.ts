import { describe, it, expect } from 'vitest';
import { computeStreetScale, type StreetSegmentData } from '../LocationMapPreview';

const sampleStreets: StreetSegmentData[] = [
  {
    id: 'street_ns_0',
    name: '1st St',
    direction: 'NS',
    waypoints: [
      { x: 10, z: 10 },
      { x: 10, z: 50 },
    ],
    width: 2.5,
  },
  {
    id: 'street_ns_1',
    name: '2nd St',
    direction: 'NS',
    waypoints: [
      { x: 30, z: 10 },
      { x: 30, z: 50 },
    ],
    width: 2.5,
  },
  {
    id: 'street_ew_0',
    name: 'Main St',
    direction: 'EW',
    waypoints: [
      { x: 10, z: 30 },
      { x: 30, z: 30 },
    ],
    width: 2.5,
  },
];

describe('computeStreetScale', () => {
  it('computes the center of the street network bounding box', () => {
    const { cx, cz } = computeStreetScale(sampleStreets);
    // min x=10, max x=30 → center=20; min z=10, max z=50 → center=30
    expect(cx).toBe(20);
    expect(cz).toBe(30);
  });

  it('computes a scale that fits streets within editor bounds', () => {
    const { scale } = computeStreetScale(sampleStreets);
    // range x=20, range z=40 → max=40 → scale = 24/40 = 0.6
    expect(scale).toBeCloseTo(0.6);
  });

  it('handles streets with identical coordinates (zero range)', () => {
    const singlePoint: StreetSegmentData[] = [
      {
        id: 's1',
        name: 'Dot St',
        waypoints: [{ x: 5, z: 5 }, { x: 5, z: 5 }],
      },
    ];
    const { scale, cx, cz } = computeStreetScale(singlePoint);
    // range = 0, fallback to 1 → scale = 24/1 = 24
    expect(scale).toBe(24);
    expect(cx).toBe(5);
    expect(cz).toBe(5);
  });

  it('uses the larger of x/z range for uniform scaling', () => {
    const wideStreets: StreetSegmentData[] = [
      {
        id: 's1',
        name: 'Wide',
        waypoints: [{ x: 0, z: 0 }, { x: 100, z: 10 }],
      },
    ];
    const { scale } = computeStreetScale(wideStreets);
    // range x=100, range z=10 → max=100 → scale=24/100=0.24
    expect(scale).toBeCloseTo(0.24);
  });
});

describe('StreetSegmentData interface', () => {
  it('accepts minimal street data without optional fields', () => {
    const street: StreetSegmentData = {
      id: 'test',
      name: 'Test St',
      waypoints: [{ x: 0, z: 0 }, { x: 10, z: 10 }],
    };
    expect(street.direction).toBeUndefined();
    expect(street.width).toBeUndefined();
  });
});
