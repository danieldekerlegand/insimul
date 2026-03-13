/**
 * River Crossing Point Generator
 * Generates bridges and fords where streets intersect rivers within a settlement.
 */

export interface Point {
  x: number;
  y: number;
}

export interface RiverSegment {
  start: Point;
  end: Point;
  width: number;
}

export interface RiverPath {
  id: string;
  name: string;
  points: Point[];
  width: number;
}

export interface StreetSegment {
  id: string;
  name: string;
  start: Point;
  end: Point;
}

export type CrossingType = 'bridge' | 'ford' | 'ferry';

export interface CrossingPoint {
  id: string;
  name: string;
  type: CrossingType;
  x: number;
  y: number;
  riverName: string;
  streetName: string;
  riverWidth: number;
  properties: {
    capacity: 'foot' | 'cart' | 'heavy';
    condition: 'new' | 'good' | 'worn' | 'damaged';
    material: string;
    builtYear?: number;
  };
}

/** Seeded PRNG (mulberry32) for deterministic generation */
function seededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Find the intersection point of two line segments, or null if they don't intersect.
 */
export function segmentIntersection(
  p1: Point, p2: Point,
  p3: Point, p4: Point
): Point | null {
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;

  const denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < 1e-10) return null; // parallel or coincident

  const t = ((p3.x - p1.x) * dy2 - (p3.y - p1.y) * dx2) / denom;
  const u = ((p3.x - p1.x) * dy1 - (p3.y - p1.y) * dx1) / denom;

  if (t < 0 || t > 1 || u < 0 || u > 1) return null;

  return {
    x: p1.x + t * dx1,
    y: p1.y + t * dy1,
  };
}

export interface CrossingGeneratorConfig {
  seed?: number;
  mapSize: number;
  foundedYear?: number;
}

export class CrossingGenerator {
  private rand: () => number;
  private config: CrossingGeneratorConfig;

  constructor(config: CrossingGeneratorConfig) {
    this.config = config;
    this.rand = seededRandom(config.seed ?? 42);
  }

  /**
   * Generate a river path that flows across the settlement map.
   * The river meanders from one edge to another with sinusoidal curves.
   */
  generateRiverPath(name: string, riverWidth: number = 15): RiverPath {
    const size = this.config.mapSize;
    const points: Point[] = [];
    const numPoints = 20;

    // Pick entry/exit edges (river flows roughly across the map)
    const enterFromLeft = this.rand() > 0.5;
    const amplitude = size * 0.15;
    const frequency = 2 + this.rand() * 2;

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      let x: number, y: number;

      if (enterFromLeft) {
        x = t * size;
        y = size / 2 + Math.sin(t * Math.PI * frequency) * amplitude;
      } else {
        y = t * size;
        x = size / 2 + Math.sin(t * Math.PI * frequency) * amplitude;
      }

      points.push({ x, y });
    }

    return { id: `river-${name.toLowerCase().replace(/\s+/g, '-')}`, name, points, width: riverWidth };
  }

  /**
   * Convert street locations (from geography generator) into line segments.
   * Streets have an x/y center and a length property; we give them a random angle.
   */
  streetsToSegments(streets: Array<{ id: string; name: string; x: number; y: number; properties: Record<string, any> }>): StreetSegment[] {
    const segments: StreetSegment[] = [];
    for (const street of streets) {
      const length = (street.properties?.length as number) || 250;
      const halfLen = length / 2;
      // Distribute street angles: mostly grid-aligned with some variation
      const baseAngle = this.rand() > 0.5 ? 0 : Math.PI / 2;
      const angle = baseAngle + (this.rand() - 0.5) * 0.3;

      segments.push({
        id: street.id,
        name: street.name,
        start: {
          x: street.x - Math.cos(angle) * halfLen,
          y: street.y - Math.sin(angle) * halfLen,
        },
        end: {
          x: street.x + Math.cos(angle) * halfLen,
          y: street.y + Math.sin(angle) * halfLen,
        },
      });
    }
    return segments;
  }

  /**
   * Find all crossing points where streets intersect a river path.
   */
  findCrossings(river: RiverPath, streets: StreetSegment[]): CrossingPoint[] {
    const crossings: CrossingPoint[] = [];
    const usedStreets = new Set<string>();

    for (let i = 0; i < river.points.length - 1; i++) {
      const rStart = river.points[i];
      const rEnd = river.points[i + 1];

      for (const street of streets) {
        if (usedStreets.has(street.id)) continue;

        const intersection = segmentIntersection(rStart, rEnd, street.start, street.end);
        if (intersection) {
          usedStreets.add(street.id);
          crossings.push(this.createCrossing(intersection, river, street));
        }
      }
    }

    return crossings;
  }

  /**
   * Create a crossing point at the given intersection.
   * Narrow rivers get fords, wider rivers get bridges.
   */
  private createCrossing(point: Point, river: RiverPath, street: StreetSegment): CrossingPoint {
    const type = this.chooseCrossingType(river.width);
    const material = this.chooseMaterial(type);
    const capacity = this.chooseCapacity(type, river.width);
    const foundedYear = this.config.foundedYear ?? 1800;
    const builtYear = foundedYear + Math.floor(this.rand() * 80);

    const typeName = type === 'bridge' ? 'Bridge' : type === 'ford' ? 'Ford' : 'Ferry';
    const name = `${street.name} ${typeName}`;

    return {
      id: `crossing-${street.id}-${river.id}`,
      name,
      type,
      x: point.x,
      y: point.y,
      riverName: river.name,
      streetName: street.name,
      riverWidth: river.width,
      properties: {
        capacity,
        condition: this.chooseCondition(),
        material,
        builtYear,
      },
    };
  }

  private chooseCrossingType(riverWidth: number): CrossingType {
    if (riverWidth <= 8) return 'ford';
    if (riverWidth <= 20) return this.rand() > 0.3 ? 'bridge' : 'ford';
    if (riverWidth <= 40) return this.rand() > 0.1 ? 'bridge' : 'ferry';
    return this.rand() > 0.3 ? 'bridge' : 'ferry';
  }

  private chooseMaterial(type: CrossingType): string {
    if (type === 'ford') return 'stone';
    if (type === 'ferry') return 'wood';
    const materials = ['wood', 'stone', 'stone', 'iron'];
    return materials[Math.floor(this.rand() * materials.length)];
  }

  private chooseCapacity(type: CrossingType, riverWidth: number): 'foot' | 'cart' | 'heavy' {
    if (type === 'ford') return riverWidth <= 5 ? 'cart' : 'foot';
    if (type === 'ferry') return 'cart';
    return this.rand() > 0.4 ? 'heavy' : 'cart';
  }

  private chooseCondition(): 'new' | 'good' | 'worn' | 'damaged' {
    const r = this.rand();
    if (r < 0.1) return 'new';
    if (r < 0.5) return 'good';
    if (r < 0.85) return 'worn';
    return 'damaged';
  }

  /**
   * Main entry: generate river(s) and find all crossing points for a settlement.
   */
  generate(streets: Array<{ id: string; name: string; x: number; y: number; properties: Record<string, any> }>): {
    rivers: RiverPath[];
    crossings: CrossingPoint[];
  } {
    const river = this.generateRiverPath('Town River');
    const streetSegments = this.streetsToSegments(streets);
    const crossings = this.findCrossings(river, streetSegments);

    return { rivers: [river], crossings };
  }
}
