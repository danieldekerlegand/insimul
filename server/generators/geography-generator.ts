/**
 * Procedural Geography Generator
 * Creates towns, cities, districts, streets, and buildings
 * using StreetGenerator for connected street network graphs.
 */

import { storage } from '../db/storage';
import { nameGenerator } from './name-generator';
import { AgriculturalZone, AgriculturalZoneGenerator } from './agricultural-zone-generator';
import { CrossingGenerator } from './crossing-generator';
import { generateCoastline, isOnWaterSide, isInsideBay, type CoastlineData } from './coastline-generator';
import { generateHarborAndDocks, type HarborZone } from './harbor-dock-generator';
import {
  generateStreetNetwork,
  placeLots,
  placeLotsAlongStreets,
  type StreetNetwork,
  type StreetNetworkConfig,
  type LotPlacement,
} from './street-network-generator';
import { StreetGenerator } from './street-generator';
import { validateBuildingAddresses } from './address-validator';
import { generateSettlementBoundary } from './boundary-generator';
import { inferSettlementSubtype, getSubtypeConfig } from './settlement-subtype';
import type { StreetNode, StreetEdge } from '../../shared/game-engine/types';

/**
 * Weighted business types for fallback random selection.
 * Weights reflect realistic distribution of businesses in a small town.
 */
export const BUSINESS_TYPE_WEIGHTS: Array<[string, number]> = [
  ['Shop', 20],
  ['GroceryStore', 15],
  ['Restaurant', 12],
  ['Bakery', 8],
  ['BarberShop', 7],
  ['TailorShop', 6],
  ['HardwareStore', 6],
  ['Pharmacy', 5],
  ['Bookstore', 5],
  ['Hotel', 4],
  ['Bank', 4],
  ['ShoeStore', 3],
  ['AutoRepair', 3],
  ['Theater', 2],
];

/** Simple hash of a string to produce a deterministic seed */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Pick a business type using weighted random selection, seeded by name */
export function weightedRandomBusinessType(name: string): string {
  const totalWeight = BUSINESS_TYPE_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  const roll = hashString(name) % totalWeight;
  let cumulative = 0;
  for (const [type, weight] of BUSINESS_TYPE_WEIGHTS) {
    cumulative += weight;
    if (roll < cumulative) return type;
  }
  return BUSINESS_TYPE_WEIGHTS[0][0];
}

export interface Location {
  id: string;
  name: string;
  type: 'district' | 'street' | 'building' | 'landmark';
  x: number;
  y: number;
  width?: number;
  height?: number;
  parentId?: string;
  properties: Record<string, any>;
}

export interface GeographyConfig {
  worldId: string;
  settlementId: string; // Now generates for a specific settlement
  settlementName: string;
  settlementType: 'dwelling' | 'roadhouse' | 'homestead' | 'hamlet' | 'village' | 'town' | 'city';
  population: number;
  foundedYear: number;
  terrain: 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
  countryId?: string;
  stateId?: string;
  /** Target language for localized street names (language-learning worlds) */
  targetLanguage?: string;
  /** World type for grammar-based name generation */
  worldType?: string;
}

/** District role types for terrain-influenced placement */
export type DistrictRole = 'commercial' | 'wealthy_residential' | 'working_residential' | 'industrial' | 'religious_civic' | 'general';

/** District role assignments ordered by priority for each settlement size */
const DISTRICT_ROLES: Record<string, DistrictRole[]> = {
  dwelling: ['general'],
  roadhouse: ['commercial'],
  homestead: ['general'],
  hamlet: ['general'],
  village: ['commercial', 'general'],
  town: ['commercial', 'wealthy_residential', 'working_residential', 'religious_civic'],
  city: ['commercial', 'wealthy_residential', 'wealthy_residential', 'working_residential', 'working_residential', 'industrial', 'religious_civic', 'general'],
};

/** District names mapped to roles */
const ROLE_NAMES: Record<DistrictRole, string[]> = {
  commercial: ['Market Quarter', 'Downtown', 'Trade District'],
  wealthy_residential: ['Residential Heights', 'Hillside', 'Upper Town'],
  working_residential: ['Old Town', 'East Side', 'South Gate', 'West End'],
  industrial: ['Industrial District', 'Dockside', 'Mill Quarter'],
  religious_civic: ['Temple Hill', 'Cathedral Square', 'Civic Center'],
  general: ['North Ward', 'Riverside', 'Central Ward'],
};

export class GeographyGenerator {
  private streetGenerator = new StreetGenerator();

  /** Default location names — overridden per-generation by grammar names when available */
  private locationNames = {
    districts: ['Downtown', 'Riverside', 'Hillside', 'Old Town', 'Market Quarter', 'Industrial District',
               'Residential Heights', 'West End', 'East Side', 'North Ward', 'South Gate'],
    landmarks: ['Town Square', 'Central Park', 'Old Mill', 'Clock Tower', 'Town Hall', 'Public Library',
               'Train Station', 'Post Office', 'Fire Station', 'Police Station', 'Cemetery'],
    businesses: ["General Store", "Hardware Store", "Grocery", "Pharmacy", "Diner", "Café",
                "Restaurant", "Bakery", "Barber Shop", "Salon", "Bank", "Hotel", "Theater",
                "Bookstore", "Tailor", "Shoe Store", "Auto Repair", "Gas Station"]
  };

  /** Business names pool — populated from grammar when available */
  private businessNamesPool: string[] = this.locationNames.businesses;

  /**
   * Load grammar-based business names if available, falling back to defaults.
   */
  private async loadBusinessNames(config: GeographyConfig): Promise<void> {
    if (!config.worldType || !config.worldId) return;
    try {
      const grammarNames = await nameGenerator.generateNamesFromGrammar(
        'business', config.worldType, config.worldId, 30
      );
      if (grammarNames.length >= 5) {
        this.businessNamesPool = grammarNames;
        console.log(`  📝 Loaded ${grammarNames.length} business names from grammar`);
      }
    } catch {
      // Keep defaults
    }
  }

  /**
   * Generate complete geography for a settlement.
   * Flow: generateStreetNetwork() -> deriveDistricts() -> generateBuildings()
   * @param heightmap Optional heightmap for terrain-influenced district placement
   * @param slopeMap Optional slope map for terrain-influenced district placement
   */
  async generate(config: GeographyConfig, heightmap?: number[][], slopeMap?: number[][]): Promise<{
    districts: Location[];
    streets: Location[];
    buildings: Location[];
    landmarks: Location[];
    streetNetwork: StreetNetwork;
    lotIds: string[];
    agriculturalZones: AgriculturalZone[];
    harborZones?: HarborZone[];
  }> {
    // Step 0a: Load grammar-based names if available
    await this.loadBusinessNames(config);

    // Step 0: Infer settlement subtype
    const settlementSubtype = inferSettlementSubtype(config);
    const subtypeConfig = getSubtypeConfig(settlementSubtype);
    console.log(`🗺️  Generating geography for ${config.settlementName} (${config.settlementType}/${settlementSubtype}, pop: ${config.population})...`);

    const districts = this.generateDistricts(config);
    const landmarks = this.generateLandmarks(config, districts);

    // Pre-load grammar-based street names if available
    let grammarStreetNames: string[] | undefined;
    if (config.worldType && config.worldId) {
      try {
        const streetNames = await nameGenerator.generateNamesFromGrammar(
          'street', config.worldType, config.worldId, 20
        );
        if (streetNames.length >= 6) {
          grammarStreetNames = streetNames;
          console.log(`  📝 Loaded ${streetNames.length} street names from grammar`);
        }
      } catch { /* use defaults */ }
    }

    // Generate street network with actual polyline geometry
    const mapSize = this.getMapSize(config.settlementType);

    // ── Generate water data BEFORE streets so we can avoid placing in water ──
    const isWaterFn = this.buildWaterTestFunction(config, mapSize);

    // Shift the settlement center away from water so the entire town sits on land.
    // Coastline occupies ~25-30% of the map from one edge; push the center toward
    // the opposite edge to maximize land margin.
    const { centerX, centerZ } = this.computeSettlementCenter(config, mapSize);

    const streetNetworkConfig: StreetNetworkConfig = {
      centerX,
      centerZ,
      settlementType: config.settlementType,
      foundedYear: config.foundedYear,
      seed: `${config.worldId}_${config.settlementId}`,
      targetLanguage: config.targetLanguage,
      grammarStreetNames,
      isWater: isWaterFn,
      terrain: config.terrain,
      population: config.population,
    };
    const streetNetwork = generateStreetNetwork(streetNetworkConfig);
    if (streetNetwork.pattern) {
      console.log(`   Street pattern: ${streetNetwork.pattern} (terrain: ${config.terrain}, type: ${config.settlementType})`);
    }

    // Convert street segments to Location objects for backward compatibility
    const streets = streetNetwork.segments.map((seg, i) => ({
      id: seg.id,
      name: seg.name,
      type: 'street' as const,
      x: seg.waypoints[0]?.x || 0,
      y: seg.waypoints[0]?.z || 0,
      parentId: districts[i % districts.length]?.id,
      properties: {
        direction: seg.direction,
        width: seg.width,
        waypoints: seg.waypoints,
        nodeIds: seg.nodeIds,
      },
    }));

    const buildings = this.generateBuildings(config, districts, streets);

    // Validate addresses and auto-fix duplicates
    validateBuildingAddresses(buildings, streetNetwork, config.settlementId);

    // Generate settlement boundary polygon
    const boundary = generateSettlementBoundary({
      seed: `${config.worldId}-${config.settlementId}`,
      terrain: config.terrain,
      settlementType: config.settlementType,
      population: config.population,
    });

    // Generate agricultural zones around the settlement
    const agriGen = new AgriculturalZoneGenerator();
    const agriculturalZones = agriGen.generate({
      settlementType: config.settlementType,
      terrain: config.terrain,
      foundedYear: config.foundedYear,
      mapSize,
      centerX: mapSize / 2,
      centerY: mapSize / 2,
    });

    // Generate river crossing points for river-terrain settlements
    if (config.terrain === 'river') {
      const crossingGen = new CrossingGenerator({
        seed: config.settlementName.length * 31 + config.foundedYear,
        mapSize: this.getMapSize(config.settlementType),
        foundedYear: config.foundedYear,
      });
      const { rivers, crossings } = crossingGen.generate(streets);

      for (const crossing of crossings) {
        landmarks.push({
          id: crossing.id,
          name: crossing.name,
          type: 'landmark',
          x: crossing.x,
          y: crossing.y,
          properties: {
            crossingType: crossing.type,
            riverName: crossing.riverName,
            streetName: crossing.streetName,
            riverWidth: crossing.riverWidth,
            ...crossing.properties,
          },
        });
      }

      // Store river data on the settlement for downstream consumers
      (config as any)._rivers = rivers;
    }

    // Generate harbor and dock infrastructure for coastal settlements
    let harborZones: HarborZone[] | undefined;
    if (config.terrain === 'coast') {
      // Reuse coastline data generated earlier for water avoidance
      const coastline: CoastlineData = (config as any)._coastlineData ?? generateCoastline({
        seed: config.settlementName.length * 37 + config.foundedYear,
        mapSize,
        waterSide: 'north',
        minBays: 1,
        maxBays: 3,
      });

      const harborResult = generateHarborAndDocks({
        seed: config.settlementName.length * 41 + config.foundedYear,
        coastline,
        settlementType: config.settlementType,
        foundedYear: config.foundedYear,
      });

      harborZones = harborResult.zones;

      // Add harbor structures as landmarks
      for (const structure of harborResult.allStructures) {
        landmarks.push({
          id: structure.id,
          name: structure.name,
          type: 'landmark',
          x: structure.x,
          y: structure.z,
          width: structure.width,
          height: structure.depth,
          properties: {
            harborStructureType: structure.type,
            material: structure.properties.material,
            condition: structure.properties.condition,
            capacity: structure.properties.capacity,
            builtYear: structure.properties.builtYear,
            rotation: structure.rotation,
          },
        });
      }
    }

    // Update settlement with geography metadata including street network and boundary
    const streetPattern = (streetNetwork as any).pattern as string | undefined;
    await storage.updateSettlement(config.settlementId, {
      districts,
      streets: streetNetwork.segments.map(seg => ({
        id: seg.id,
        name: seg.name,
        direction: seg.direction,
        waypoints: seg.waypoints,
        nodeIds: seg.nodeIds,
        width: seg.width,
      })),
      landmarks,
      boundaryPolygon: boundary.polygon,
      settlementSubtype,
      ...(streetPattern ? { streetPattern } : {}),
    } as any);

    // Persist lots, residences, and businesses as proper database records
    const lotIds = await this.persistLotsAndBuildings(config, districts, streets, buildings, streetNetwork, isWaterFn, streetPattern);

    const harborMsg = harborZones ? `, ${harborZones.length} harbor zones` : '';
    console.log(`✅ Generated ${districts.length} districts, ${streetNetwork.segments.length} streets (${streetNetwork.nodes.length} nodes), ${buildings.length} buildings (${lotIds.length} lots persisted), ${agriculturalZones.length} agricultural zones${harborMsg}`);

    return { districts, streets, buildings, landmarks, lotIds, agriculturalZones, streetNetwork, harborZones };
  }

  /**
   * Generate the street network using StreetGenerator with auto-selected pattern.
   * Names all streets after generation.
   */
  private generateStreetNetwork(config: GeographyConfig): { network: StreetNetwork; pattern: string } {
    const mapSize = this.getMapSize(config.settlementType);
    const center = { x: mapSize / 2, z: mapSize / 2 };
    const radius = mapSize / 2.5;

    const seed = `${config.worldId}-${config.settlementId}`;
    const { network, pattern } = this.streetGenerator.generate(
      { center, radius, settlementType: config.settlementType, seed },
      config
    );

    // Name all streets
    this.streetGenerator.assignStreetNames(network, seed);

    return { network, pattern };
  }

  /**
   * Derive districts from the street network using Voronoi-like clustering.
   * When heightmap/slopeMap provided, places district seeds based on terrain
   * suitability (commercial at flat center, wealthy at overlooks, etc.).
   * Falls back to radial placement when no heightmap available.
   */
  private deriveDistricts(
    config: GeographyConfig,
    network: StreetNetwork,
    heightmap?: number[][],
    slopeMap?: number[][],
  ): Location[] {
    const numDistricts = this.getDistrictCount(config.settlementType);
    const mapSize = this.getMapSize(config.settlementType);
    const centerX = mapSize / 2;
    const centerY = mapSize / 2;

    // Assign roles for this settlement size
    const roleList = DISTRICT_ROLES[config.settlementType] || DISTRICT_ROLES.town;
    const roles: DistrictRole[] = [];
    for (let i = 0; i < numDistricts; i++) {
      roles.push(roleList[i % roleList.length]);
    }

    let seedPoints: { x: number; y: number }[];

    if (heightmap && slopeMap && heightmap.length > 0 && slopeMap.length > 0) {
      // Terrain-influenced placement
      seedPoints = this.placeDistrictSeedsByTerrain(
        roles, mapSize, centerX, centerY, heightmap, slopeMap, network, config,
      );
    } else {
      // Fallback: radial placement
      seedPoints = [];
      for (let i = 0; i < numDistricts; i++) {
        const angle = (i / numDistricts) * 2 * Math.PI;
        const seedRadius = mapSize / 3;
        seedPoints.push({
          x: centerX + Math.cos(angle) * seedRadius,
          y: centerY + Math.sin(angle) * seedRadius,
        });
      }
    }

    // Assign each node to nearest district seed (Voronoi assignment)
    const nodeDistrict = new Map<string, number>();
    for (const node of network.nodes) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < seedPoints.length; i++) {
        const dx = node.position.x - seedPoints[i].x;
        const dz = node.position.z - seedPoints[i].y;
        const d = dx * dx + dz * dz;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      nodeDistrict.set(node.id, bestIdx);
    }

    // Compute district bounding boxes from assigned nodes
    const districtBounds: { minX: number; maxX: number; minY: number; maxY: number; count: number }[] =
      seedPoints.map(() => ({ minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, count: 0 }));

    for (const node of network.nodes) {
      const idx = nodeDistrict.get(node.id)!;
      const b = districtBounds[idx];
      b.minX = Math.min(b.minX, node.position.x);
      b.maxX = Math.max(b.maxX, node.position.x);
      b.minY = Math.min(b.minY, node.position.z);
      b.maxY = Math.max(b.maxY, node.position.z);
      b.count++;
    }

    // Build Location objects for each district
    const districts: Location[] = [];
    for (let i = 0; i < numDistricts; i++) {
      const b = districtBounds[i];
      const hasNodes = b.count > 0;
      const cx = hasNodes ? (b.minX + b.maxX) / 2 : seedPoints[i].x;
      const cy = hasNodes ? (b.minY + b.maxY) / 2 : seedPoints[i].y;
      const w = hasNodes ? Math.max(b.maxX - b.minX, 50) : mapSize / 4;
      const h = hasNodes ? Math.max(b.maxY - b.minY, 50) : mapSize / 4;

      const role = roles[i];
      const roleNames = ROLE_NAMES[role];
      const districtName = roleNames[i % roleNames.length];

      districts.push({
        id: `district-${i}`,
        name: districtName,
        type: 'district',
        x: cx,
        y: cy,
        width: w,
        height: h,
        properties: {
          nodeCount: b.count,
          seedX: seedPoints[i].x,
          seedY: seedPoints[i].y,
          role,
        },
      });
    }

    // Store the node-to-district mapping on the districts for building assignment
    (districts as any).__nodeDistrict = nodeDistrict;

    return districts;
  }

  /**
   * Place district seed points based on terrain suitability.
   * Each role has specific terrain preferences:
   * - commercial: flattest, most central
   * - wealthy_residential: moderate elevation with views
   * - working_residential: lower-lying, less desirable
   * - industrial: near periphery or water
   * - religious_civic: highest accessible point
   */
  private placeDistrictSeedsByTerrain(
    roles: DistrictRole[],
    mapSize: number,
    centerX: number,
    centerY: number,
    heightmap: number[][],
    slopeMap: number[][],
    network: StreetNetwork,
    config: GeographyConfig,
  ): { x: number; y: number }[] {
    const resolution = heightmap.length;
    const seedRadius = mapSize / 3;

    // Generate candidate positions from network nodes spread around
    const candidates: { x: number; y: number; elevation: number; slope: number; distToCenter: number }[] = [];

    // Sample a grid of candidate points across the settlement area
    const gridSteps = 8;
    for (let gx = 0; gx < gridSteps; gx++) {
      for (let gy = 0; gy < gridSteps; gy++) {
        const px = (mapSize * (gx + 0.5)) / gridSteps;
        const py = (mapSize * (gy + 0.5)) / gridSteps;
        const distToCenter = Math.sqrt((px - centerX) ** 2 + (py - centerY) ** 2);

        // Skip points too far from center
        if (distToCenter > seedRadius * 1.5) continue;

        const hCol = Math.min(resolution - 1, Math.max(0, Math.round((px / mapSize) * (resolution - 1))));
        const hRow = Math.min(resolution - 1, Math.max(0, Math.round((py / mapSize) * (resolution - 1))));
        const elevation = heightmap[hRow][hCol];
        const slope = slopeMap[hRow][hCol];

        candidates.push({ x: px, y: py, elevation, slope, distToCenter });
      }
    }

    if (candidates.length === 0) {
      // No valid candidates — fallback to radial
      return roles.map((_, i) => ({
        x: centerX + Math.cos((i / roles.length) * 2 * Math.PI) * seedRadius,
        y: centerY + Math.sin((i / roles.length) * 2 * Math.PI) * seedRadius,
      }));
    }

    const usedIndices = new Set<number>();
    const seedPoints: { x: number; y: number }[] = [];
    const minSeedDist = seedRadius * 0.4; // Minimum distance between seeds

    for (const role of roles) {
      // Score each candidate for this role
      let bestIdx = -1;
      let bestScore = -Infinity;

      for (let c = 0; c < candidates.length; c++) {
        if (usedIndices.has(c)) continue;

        // Check minimum distance to already-placed seeds
        const cand = candidates[c];
        let tooClose = false;
        for (const sp of seedPoints) {
          const d = Math.sqrt((cand.x - sp.x) ** 2 + (cand.y - sp.y) ** 2);
          if (d < minSeedDist) { tooClose = true; break; }
        }
        if (tooClose) continue;

        const score = this.scoreCandidate(role, cand, mapSize, config);
        if (score > bestScore) {
          bestScore = score;
          bestIdx = c;
        }
      }

      if (bestIdx >= 0) {
        usedIndices.add(bestIdx);
        seedPoints.push({ x: candidates[bestIdx].x, y: candidates[bestIdx].y });
      } else {
        // All candidates taken or too close — use radial fallback for this seed
        const angle = (seedPoints.length / roles.length) * 2 * Math.PI;
        seedPoints.push({
          x: centerX + Math.cos(angle) * seedRadius,
          y: centerY + Math.sin(angle) * seedRadius,
        });
      }
    }

    return seedPoints;
  }

  /**
   * Score a candidate position for a given district role.
   * Higher is better.
   */
  private scoreCandidate(
    role: DistrictRole,
    cand: { elevation: number; slope: number; distToCenter: number },
    mapSize: number,
    config: GeographyConfig,
  ): number {
    const maxDist = mapSize / 2;
    const centralityNorm = 1 - Math.min(cand.distToCenter / maxDist, 1); // 1=center, 0=edge
    const flatnessNorm = 1 - Math.min(cand.slope, 1); // 1=flat, 0=steep
    const peripheryNorm = Math.min(cand.distToCenter / maxDist, 1); // 1=edge, 0=center

    switch (role) {
      case 'commercial':
        // Flattest + most central
        return centralityNorm * 3 + flatnessNorm * 2;

      case 'wealthy_residential':
        // Moderate elevation with good views (higher elevation, moderate slope OK)
        return cand.elevation * 3 + flatnessNorm * 0.5 + centralityNorm * 0.3;

      case 'working_residential':
        // Lower-lying, less desirable terrain
        return (1 - cand.elevation) * 2 + flatnessNorm * 1.5;

      case 'industrial':
        // Near periphery; near water if coast/river terrain
        let waterBonus = 0;
        if (config.terrain === 'coast' || config.terrain === 'river') {
          // Lower elevation = closer to water
          waterBonus = (1 - cand.elevation) * 2;
        }
        return peripheryNorm * 3 + flatnessNorm * 1 + waterBonus;

      case 'religious_civic':
        // Highest accessible point (high elevation but not too steep to build on)
        return cand.elevation * 4 + flatnessNorm * 1.5 - (cand.slope > 0.5 ? 3 : 0);

      case 'general':
      default:
        // General purpose — moderate everything
        return flatnessNorm * 1 + centralityNorm * 1;
    }
  }

  /**
   * Convert street edges to Location objects for backward compatibility.
   * Each unique-named edge chain becomes one Location.
   */
  private streetEdgesToLocations(network: StreetNetwork, districts: Location[]): Location[] {
    const nodeDistrict: Map<string, number> = (districts as any).__nodeDistrict || new Map();
    const seen = new Set<string>();
    const locations: Location[] = [];
    let idx = 0;

    for (const edge of network.edges) {
      const name = edge.name || `Street-${idx}`;
      if (seen.has(name)) continue;
      seen.add(name);

      // Use the midpoint of the first waypoint
      const midWp = edge.waypoints[Math.floor(edge.waypoints.length / 2)];
      const districtIdx = nodeDistrict.get(edge.fromNodeId) ?? 0;

      locations.push({
        id: `street-${idx}`,
        name,
        type: 'street',
        x: midWp?.x ?? 0,
        y: midWp?.z ?? 0,
        parentId: `district-${districtIdx}`,
        properties: {
          streetType: edge.streetType,
          width: edge.width,
          length: edge.length,
          edgeId: edge.id,
          condition: edge.condition > 0.7 ? 'good' : 'poor',
          traffic: edge.traffic > 0.5 ? 'high' : 'low',
        },
      });
      idx++;
    }

    return locations;
  }

  /**
   * Generate buildings at evenly spaced positions along street edges.
   * Building density varies by street type: main roads get more buildings.
   */
  private generateBuildingsAlongStreets(
    config: GeographyConfig,
    network: StreetNetwork,
    districts: Location[]
  ): Location[] {
    const nodeDistrict: Map<string, number> = (districts as any).__nodeDistrict || new Map();
    const buildings: Location[] = [];
    let buildingIndex = 0;

    const buildingsPerStreet = this.getBuildingsPerStreet(config.settlementType);

    for (const edge of network.edges) {
      // Scale building count by street type
      const typeScale = this.buildingDensityByStreetType(edge.streetType);
      const count = Math.max(1, Math.round(buildingsPerStreet * typeScale));
      const streetName = edge.name || 'Unknown St';
      const districtIdx = nodeDistrict.get(edge.fromNodeId) ?? 0;
      const districtRole = districts[districtIdx]?.properties?.role as DistrictRole | undefined;

      for (let i = 0; i < count; i++) {
        // Position buildings at evenly spaced points along the edge waypoints
        const t = count === 1 ? 0.5 : i / (count - 1);
        const pos = this.interpolateWaypoints(edge.waypoints, t);

        // Offset slightly perpendicular to the street
        const sideSign = i % 2 === 0 ? 1 : -1;
        const sideLabel = sideSign === 1 ? 'left' : 'right';
        const perpOffset = (edge.width / 2 + 5) * sideSign;
        const tangent = this.edgeTangent(edge.waypoints, t);
        const bx = pos.x + tangent.nz * perpOffset;
        const by = pos.z + (-tangent.nx) * perpOffset;

        // Compute facing angle: point from lot toward street center
        const facingAngle = Math.atan2(pos.z - by, pos.x - bx);

        const isResidence = this.shouldBeResidence(edge.streetType, buildingIndex, districtRole);
        const name = isResidence
          ? `${(buildingIndex % 200) + 1} ${streetName}`
          : this.businessNamesPool[buildingIndex % this.businessNamesPool.length];

        // Lot dimensions by settlement type
        const lotWidth = config.settlementType === 'village' ? 15 : config.settlementType === 'town' ? 12 : 10;
        const lotDepth = config.settlementType === 'village' ? 28 : config.settlementType === 'town' ? 24 : 20;

        buildings.push({
          id: `building-${buildingIndex}`,
          name,
          type: 'building',
          x: bx,
          y: by,
          width: 15,
          height: 15,
          parentId: `street-${edge.id}`,
          properties: {
            buildingType: isResidence ? 'residence' : 'business',
            floors: Math.floor(((buildingIndex * 7 + 3) % 5) / 2) + 1,
            houseNumber: (buildingIndex % 200) + 1,
            condition: buildingIndex % 5 === 0 ? 'poor' : buildingIndex % 3 === 0 ? 'average' : 'excellent',
            built: config.foundedYear + (buildingIndex * 13) % 100,
            occupants: isResidence ? (buildingIndex % 6) + 1 : (buildingIndex % 10),
            streetName,
            districtId: `district-${districtIdx}`,
            edgeId: edge.id,
            side: sideLabel,
            facingAngle,
            lotWidth,
            lotDepth,
            distanceAlongStreet: Math.round(t * 100),
            elevation: 0,
            foundationType: 'flat',
          },
        });

        buildingIndex++;
      }
    }

    return buildings;
  }

  /**
   * Interpolate a position along edge waypoints at parameter t ∈ [0, 1].
   */
  private interpolateWaypoints(waypoints: { x: number; z: number }[], t: number): { x: number; z: number } {
    if (waypoints.length === 0) return { x: 0, z: 0 };
    if (waypoints.length === 1 || t <= 0) return waypoints[0];
    if (t >= 1) return waypoints[waypoints.length - 1];

    // Compute total length
    let totalLen = 0;
    const segLens: number[] = [];
    for (let i = 1; i < waypoints.length; i++) {
      const dx = waypoints[i].x - waypoints[i - 1].x;
      const dz = waypoints[i].z - waypoints[i - 1].z;
      const len = Math.sqrt(dx * dx + dz * dz);
      segLens.push(len);
      totalLen += len;
    }

    const targetDist = t * totalLen;
    let accum = 0;
    for (let i = 0; i < segLens.length; i++) {
      if (accum + segLens[i] >= targetDist) {
        const segT = segLens[i] > 0 ? (targetDist - accum) / segLens[i] : 0;
        return {
          x: waypoints[i].x + (waypoints[i + 1].x - waypoints[i].x) * segT,
          z: waypoints[i].z + (waypoints[i + 1].z - waypoints[i].z) * segT,
        };
      }
      accum += segLens[i];
    }
    return waypoints[waypoints.length - 1];
  }

  /**
   * Compute normalized tangent direction at parameter t along waypoints.
   * Returns { nx, nz } tangent and perpendicular can be derived as (-nz, nx).
   */
  private edgeTangent(waypoints: { x: number; z: number }[], t: number): { nx: number; nz: number } {
    if (waypoints.length < 2) return { nx: 1, nz: 0 };

    const idx = Math.min(Math.floor(t * (waypoints.length - 1)), waypoints.length - 2);
    const dx = waypoints[idx + 1].x - waypoints[idx].x;
    const dz = waypoints[idx + 1].z - waypoints[idx].z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len === 0) return { nx: 1, nz: 0 };
    return { nx: dx / len, nz: dz / len };
  }

  /**
   * Scale building count by street type — busier streets get more buildings.
   */
  private buildingDensityByStreetType(streetType: string): number {
    switch (streetType) {
      case 'boulevard':
      case 'main_road': return 1.0;
      case 'avenue': return 0.8;
      case 'residential': return 0.6;
      case 'lane': return 0.3;
      case 'alley': return 0.1;
      default: return 0.5;
    }
  }

  /**
   * Determine if a building should be residential based on street type, district role, and index.
   * District roles heavily influence the ratio:
   * - commercial: mostly businesses
   * - wealthy_residential/working_residential: mostly residences
   * - industrial: mostly businesses (factories, workshops)
   * - religious_civic: mixed
   * Street type provides a secondary influence.
   */
  private shouldBeResidence(streetType: string, index: number, districtRole?: DistrictRole): boolean {
    // District role determines the base residential probability
    let residentialChance: number;
    switch (districtRole) {
      case 'commercial':
        residentialChance = 0.25; // Mostly businesses
        break;
      case 'wealthy_residential':
        residentialChance = 0.90; // Almost all residences
        break;
      case 'working_residential':
        residentialChance = 0.85; // Mostly residences
        break;
      case 'industrial':
        residentialChance = 0.15; // Mostly businesses/factories
        break;
      case 'religious_civic':
        residentialChance = 0.50; // Mixed
        break;
      default:
        residentialChance = 0.65; // General default
        break;
    }

    // Street type modifies the probability
    switch (streetType) {
      case 'boulevard':
      case 'main_road':
        residentialChance *= 0.7; // Main roads attract more businesses
        break;
      case 'avenue':
        residentialChance *= 0.85;
        break;
      case 'residential':
        residentialChance = Math.min(1, residentialChance * 1.15);
        break;
      case 'lane':
        residentialChance = Math.min(1, residentialChance * 1.2);
        break;
    }

    // Use deterministic hash from index for reproducibility
    const hash = ((index * 2654435761) >>> 0) / 4294967296;
    return hash < residentialChance;
  }

  /**
   * Generate landmarks within districts
   */
  private generateLandmarks(config: GeographyConfig, districts: Location[]): Location[] {
    const numLandmarks = Math.min(this.locationNames.landmarks.length, districts.length * 2);
    const landmarks: Location[] = [];

    for (let i = 0; i < numLandmarks; i++) {
      const district = districts[i % districts.length];
      // Deterministic offset based on index
      const offsetX = ((i * 17 + 7) % 50) - 25;
      const offsetY = ((i * 13 + 11) % 50) - 25;

      landmarks.push({
        id: `landmark-${i}`,
        name: this.locationNames.landmarks[i],
        type: 'landmark',
        x: (district.x || 0) + offsetX,
        y: (district.y || 0) + offsetY,
        parentId: district.id,
        properties: {
          visitors: (i * 97 + 31) % 1000,
          historical: i % 2 === 0,
          established: config.foundedYear + (i * 23) % Math.max(1, new Date().getFullYear() - config.foundedYear),
        }
      });
    }

    return landmarks;
  }

  /**
   * Create Lot, Residence, and Business records from generated building data.
   */
  private async persistLotsAndBuildings(
    config: GeographyConfig,
    districts: Location[],
    streets: Location[],
    buildings: Location[],
    streetNetwork?: StreetNetwork,
    isWater?: (x: number, z: number) => boolean,
    streetPattern?: string,
  ): Promise<string[]> {
    const districtById = new Map(districts.map(d => [d.id, d]));
    const streetById = new Map(streets.map(s => [s.id, s]));

    // Generate lot placements with world-space coordinates.
    // Request Infinity so placeLots generates ALL available block slots,
    // ensuring every building can get a unique placement.
    let allPlacements: LotPlacement[] = [];
    if (streetNetwork) {
      const seed = `${config.worldId}_${config.settlementId}`;
      // Use grid-specific placement for grid pattern, edge-based for everything else
      const isGridPattern = !streetPattern || streetPattern === 'grid';
      if (isGridPattern) {
        allPlacements = placeLots(streetNetwork, Infinity, seed, config.settlementType, isWater);
      } else {
        allPlacements = placeLotsAlongStreets(
          streetNetwork, Infinity, seed, config.settlementType, streetPattern, isWater,
        );
      }
    }
    // Separate park placements from buildable placements
    const parkPlacements = allPlacements.filter(p => p.zone === 'park');
    const lotPlacements = allPlacements.filter(p => p.zone !== 'park');

    // Clear existing lots, residences, and businesses for this settlement
    // so regeneration replaces rather than duplicates.
    const existingLots = await storage.getLotsBySettlement(config.settlementId);
    if (existingLots.length > 0) {
      for (const lot of existingLots) {
        if (lot.buildingId) {
          if (lot.buildingType === 'residence') {
            await storage.deleteResidence(lot.buildingId);
          } else {
            await storage.deleteBusiness(lot.buildingId);
          }
        }
        await storage.deleteLot(lot.id);
      }
      console.log(`🧹 Cleared ${existingLots.length} existing lots for settlement ${config.settlementId}`);
    }

    // Prepare bulk-insert arrays
    const lotDocs: any[] = [];
    const residenceDocs: any[] = [];
    const businessDocs: any[] = [];

    for (let bi = 0; bi < buildings.length; bi++) {
      const building = buildings[bi];
      const street = building.parentId ? streetById.get(building.parentId) : undefined;
      const district = street?.parentId ? districtById.get(street.parentId) : undefined;
      const districtId = building.properties?.districtId;
      const districtFromProp = districtId ? districtById.get(districtId) : undefined;
      const districtName = (districtFromProp || district)?.name || 'Unknown District';
      const isResidence = building.properties?.buildingType === 'residence';

      // Assign placement directly by index — each building gets a unique lot.
      // Skip buildings that have no lot placement to avoid placing them
      // at the settlement center (which is typically an intersection).
      const placement = bi < lotPlacements.length
        ? lotPlacements[bi]
        : undefined;
      if (!placement) continue;

      // Use placement's street/house info as the authoritative address.
      // For overflow buildings (no placement), generate a unique house number
      // by continuing from the highest placement number.
      const maxPlacementHouseNum = lotPlacements.length > 0
        ? lotPlacements[lotPlacements.length - 1].houseNumber
        : 0;
      const streetName = placement?.streetName || building.properties?.streetName || street?.name || 'Unknown St';
      const houseNumber = placement
        ? placement.houseNumber
        : maxPlacementHouseNum + (bi - lotPlacements.length) + 1;
      const address = `${houseNumber} ${streetName}`;

      const side = placement?.side || 'left';
      const facingAngle = placement?.facingAngle ?? 0;
      const lotWidth = placement?.lotWidth || 12;
      const lotDepth = placement?.lotDepth || 24;
      const elevation = building.properties?.elevation || 0;
      const foundationType = building.properties?.foundationType || 'flat';
      const blockId = building.properties?.blockId || null;

      lotDocs.push({
        worldId: config.worldId,
        settlementId: config.settlementId,
        address,
        houseNumber,
        streetName,
        districtName,
        buildingType: isResidence ? 'residence' : 'business',
        positionX: placement.x,
        positionZ: placement.z,
        lotWidth,
        lotDepth,
        streetEdgeId: placement.streetId,
        distanceAlongStreet: bi % lotPlacements.length,
        side,
        blockId,
        facingAngle,
        elevation,
        foundationType,
        formerBuildingIds: [],
        _buildingIndex: lotDocs.length,
        _isResidence: isResidence,
        _buildingName: building.name,
        _floors: building.properties?.floors || 1,
        _built: building.properties?.built || config.foundedYear,
      });
    }

    // Add park lots — these are dedicated green spaces, not buildable lots
    for (const placement of parkPlacements) {
      const streetName = placement.streetName || 'Town Square';
      lotDocs.push({
        worldId: config.worldId,
        settlementId: config.settlementId,
        address: `${streetName} Park`,
        houseNumber: 0,
        streetName,
        districtName: 'Town Center',
        buildingType: 'park',
        positionX: placement.x,
        positionZ: placement.z,
        lotWidth: placement.lotWidth,
        lotDepth: placement.lotDepth,
        streetEdgeId: placement.streetId,
        distanceAlongStreet: 0,
        side: placement.side,
        blockId: null,
        facingAngle: placement.facingAngle,
        elevation: 0,
        foundationType: 'flat',
        formerBuildingIds: [],
        _buildingIndex: -1,
        _isResidence: false,
        _buildingName: `${streetName} Park`,
        _floors: 0,
        _built: config.foundedYear,
      });
    }

    // Bulk-insert lots
    const createdLots = await (storage as any).createLotsInBulk(
      lotDocs.map(({ _buildingIndex, _isResidence, _buildingName, _floors, _built, ...lot }) => lot)
    );

    // Create residences and businesses referencing the lot IDs
    for (let i = 0; i < createdLots.length; i++) {
      const lot = createdLots[i];
      const meta = lotDocs[i];

      // Skip park lots — they don't have buildings
      if (meta._buildingIndex === -1) continue;

      if (meta._isResidence) {
        const residenceType = this.getResidenceType(config.settlementType || 'town', meta._buildingIndex);
        residenceDocs.push({
          worldId: config.worldId,
          settlementId: config.settlementId,
          lotId: lot.id,
          address: lot.address,
          residenceType,
          ownerIds: [],
          residentIds: [],
        });
      } else {
        businessDocs.push({
          worldId: config.worldId,
          settlementId: config.settlementId,
          lotId: lot.id,
          name: meta._buildingName,
          businessType: this.inferBusinessType(meta._buildingName),
          ownerId: null,
          founderId: null,
          foundedYear: meta._built,
          address: lot.address,
        });
      }
    }

    if (residenceDocs.length > 0) {
      const createdResidences = await (storage as any).createResidencesInBulk(residenceDocs);
      let resIdx = 0;
      for (let i = 0; i < createdLots.length; i++) {
        if (lotDocs[i]._buildingIndex === -1) continue; // Skip park lots
        if (lotDocs[i]._isResidence) {
          await storage.updateLot(createdLots[i].id, { buildingId: createdResidences[resIdx].id });
          resIdx++;
        }
      }
    }

    if (businessDocs.length > 0) {
      const createdBusinesses = await (storage as any).createBusinessesInBulk(businessDocs);
      let bizIdx = 0;
      for (let i = 0; i < createdLots.length; i++) {
        if (lotDocs[i]._buildingIndex === -1) continue; // Skip park lots
        if (!lotDocs[i]._isResidence) {
          await storage.updateLot(createdLots[i].id, { buildingId: createdBusinesses[bizIdx].id });
          bizIdx++;
        }
      }
    }

    return createdLots.map((l: any) => l.id);
  }

  /**
   * Weighted residence-type distributions per settlement type.
   * Cities skew toward apartments/townhouses; villages toward cottages/mobile homes.
   */
  private static readonly RESIDENCE_WEIGHTS: Record<string, { type: string; weight: number }[]> = {
    hamlet: [
      { type: 'house', weight: 30 },
      { type: 'cottage', weight: 50 },
      { type: 'mobile_home', weight: 20 },
    ],
    city: [
      { type: 'house', weight: 25 },
      { type: 'apartment', weight: 30 },
      { type: 'cottage', weight: 5 },
      { type: 'townhouse', weight: 25 },
      { type: 'mansion', weight: 5 },
      { type: 'mobile_home', weight: 10 },
    ],
    town: [
      { type: 'house', weight: 40 },
      { type: 'apartment', weight: 20 },
      { type: 'cottage', weight: 15 },
      { type: 'townhouse', weight: 15 },
      { type: 'mansion', weight: 5 },
      { type: 'mobile_home', weight: 5 },
    ],
    village: [
      { type: 'house', weight: 35 },
      { type: 'apartment', weight: 5 },
      { type: 'cottage', weight: 30 },
      { type: 'townhouse', weight: 5 },
      { type: 'mansion', weight: 5 },
      { type: 'mobile_home', weight: 20 },
    ],
  };

  /**
   * Pick a residence type using deterministic weighted selection.
   * Uses a seed (building index) for reproducibility.
   */
  getResidenceType(settlementType: string, seed: number): string {
    const weights = GeographyGenerator.RESIDENCE_WEIGHTS[settlementType]
      || GeographyGenerator.RESIDENCE_WEIGHTS['town'];
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    // Deterministic pseudo-random value from seed
    const roll = ((seed * 2654435761) >>> 0) % totalWeight;
    let cumulative = 0;
    for (const entry of weights) {
      cumulative += entry.weight;
      if (roll < cumulative) return entry.type;
    }
    return weights[weights.length - 1].type;
  }

  /**
   * Infer a BusinessType from the business name string.
   * Falls back to weighted random selection seeded by name for variety.
   */
  private inferBusinessType(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('bakery')) return 'Bakery';
    if (lower.includes('restaurant') || lower.includes('diner')) return 'Restaurant';
    if (lower.includes('café') || lower.includes('cafe')) return 'Restaurant';
    if (lower.includes('bank')) return 'Bank';
    if (lower.includes('hotel') || lower.includes('inn')) return 'Hotel';
    if (lower.includes('theater') || lower.includes('theatre')) return 'Theater';
    if (lower.includes('pharmacy')) return 'Pharmacy';
    if (lower.includes('barber') || lower.includes('salon')) return 'BarberShop';
    if (lower.includes('bookstore') || lower.includes('library')) return 'Bookstore';
    if (lower.includes('tailor')) return 'TailorShop';
    if (lower.includes('hardware')) return 'HardwareStore';
    if (lower.includes('grocery') || lower.includes('general store')) return 'GroceryStore';
    if (lower.includes('shoe')) return 'ShoeStore';
    if (lower.includes('auto') || lower.includes('gas station')) return 'AutoRepair';
    if (lower.includes('harbor') || lower.includes('dock') || lower.includes('pier')) return 'Harbor';
    if (lower.includes('boatyard')) return 'Boatyard';
    if (lower.includes('fish market')) return 'FishMarket';
    if (lower.includes('customs')) return 'CustomsHouse';
    if (lower.includes('lighthouse')) return 'Lighthouse';
    if (lower.includes('warehouse')) return 'Warehouse';
    if (lower.includes('shop') || lower.includes('store') || lower.includes('market')) return 'Shop';
    return weightedRandomBusinessType(name);
  }

  /**
   * Get number of districts based on settlement type
   */
  private getDistrictCount(type: string): number {
    switch (type) {
      case 'dwelling': return 1;
      case 'roadhouse': return 1;
      case 'homestead': return 1;
      case 'hamlet': return 1;
      case 'village': return 2;
      case 'town': return 4;
      case 'city': return 8;
      default: return 2;
    }
  }

  /**
   * Build a water test function for the given terrain type.
   * Returns a function that checks if a world-space point is in water
   * OR within the padding buffer zone around water, so that streets,
   * lots, and buildings are kept well away from the water's edge.
   */
  private buildWaterTestFunction(
    config: GeographyConfig,
    mapSize: number,
  ): ((x: number, z: number) => boolean) | undefined {
    // Padding in world units — no streets or lots will be placed
    // within this distance of any water boundary.
    const WATER_PADDING = 120;

    if (config.terrain === 'coast') {
      const coastline = generateCoastline({
        seed: config.settlementName.length * 37 + config.foundedYear,
        mapSize,
        waterSide: 'north',
        minBays: 1,
        maxBays: 3,
      });
      // Cache coastline data on config so downstream consumers can still use it
      (config as any)._coastlineData = coastline;

      // Raw water test (no padding)
      const rawIsWater = (x: number, z: number): boolean => {
        if (isOnWaterSide(x, z, coastline.contour, coastline.waterSide, coastline.mapSize)) {
          return true;
        }
        for (const bay of coastline.bays) {
          if (isInsideBay(x, z, bay, coastline.waterSide)) {
            return true;
          }
        }
        return false;
      };

      // Padded water test — also returns true for points near water.
      // Uses 16 sample directions at two distances for thorough boundary detection.
      return (x: number, z: number) => {
        if (rawIsWater(x, z)) return true;
        // Sample at full padding distance
        for (let a = 0; a < 16; a++) {
          const angle = (a / 16) * Math.PI * 2;
          const sx = x + Math.cos(angle) * WATER_PADDING;
          const sz = z + Math.sin(angle) * WATER_PADDING;
          if (rawIsWater(sx, sz)) return true;
        }
        // Sample at half padding distance to catch narrow inlets
        for (let a = 0; a < 8; a++) {
          const angle = (a / 8) * Math.PI * 2;
          const sx = x + Math.cos(angle) * (WATER_PADDING * 0.5);
          const sz = z + Math.sin(angle) * (WATER_PADDING * 0.5);
          if (rawIsWater(sx, sz)) return true;
        }
        return false;
      };
    }

    if (config.terrain === 'river') {
      const crossingGen = new CrossingGenerator({
        seed: config.settlementName.length * 31 + config.foundedYear,
        mapSize,
        foundedYear: config.foundedYear,
      });
      const river = crossingGen.generateRiverPath('Town River');
      // Cache river data on config for downstream use
      (config as any)._riverForWaterTest = river;
      // Include padding in the exclusion distance
      const riverExclusionRadius = (river.width || 15) / 2 + WATER_PADDING;
      return (x: number, z: number) => {
        // Check distance from point to each river segment
        for (let i = 0; i < river.points.length - 1; i++) {
          const ax = river.points[i].x, az = river.points[i].y;
          const bx = river.points[i + 1].x, bz = river.points[i + 1].y;
          const dx = bx - ax, dz = bz - az;
          const lenSq = dx * dx + dz * dz;
          let t = lenSq > 0 ? ((x - ax) * dx + (z - az) * dz) / lenSq : 0;
          t = Math.max(0, Math.min(1, t));
          const cx = ax + t * dx, cz = az + t * dz;
          const dist = Math.sqrt((x - cx) ** 2 + (z - cz) ** 2);
          if (dist <= riverExclusionRadius) return true;
        }
        return false;
      };
    }

    return undefined;
  }

  /**
   * Compute the settlement center, shifted away from water for coast/river terrains.
   * For non-water terrains, returns the map center.
   */
  private computeSettlementCenter(
    config: GeographyConfig,
    mapSize: number,
  ): { centerX: number; centerZ: number } {
    const defaultCenter = { centerX: mapSize / 2, centerZ: mapSize / 2 };

    if (config.terrain === 'coast') {
      // Coastline uses waterSide='north' (water at low Z).
      // Push the settlement center toward high Z (away from water).
      // The coastline sits at ~25-30% from the water edge, so place
      // the settlement center at ~72% of the map to give maximum margin
      // and ensure the full settlement footprint stays well inland.
      return { centerX: mapSize / 2, centerZ: mapSize * 0.72 };
    }

    if (config.terrain === 'river') {
      // The river meanders across the map (roughly through the center).
      // Push the settlement center well off-center to avoid the river path.
      // The crossing generator's river flows either left→right or top→bottom
      // through ~mapSize/2, so offset the center further from the river.
      return { centerX: mapSize * 0.3, centerZ: mapSize * 0.7 };
    }

    return defaultCenter;
  }

  /**
   * Get map size based on settlement type
   */
  private getMapSize(type: string): number {
    switch (type) {
      case 'dwelling': return 100;
      case 'roadhouse': return 100;
      case 'homestead': return 150;
      case 'hamlet': return 300;
      case 'village': return 500;
      case 'town': return 1000;
      case 'city': return 2000;
      default: return 1000;
    }
  }

  /**
   * Get buildings per street
   */
  private getBuildingsPerStreet(type: string): number {
    switch (type) {
      case 'dwelling': return 1;
      case 'roadhouse': return 1;
      case 'homestead': return 1;
      case 'hamlet': return 3;
      case 'village': return 5;
      case 'town': return 10;
      case 'city': return 15;
      default: return 5;
    }
  }

  /**
   * Generate a random natural feature
   */
  generateNaturalFeature(terrain: string): Location {
    const features: Record<string, string[]> = {
      plains: ['Oak Grove', 'Wheat Field', 'Prairie', 'Meadow'],
      hills: ['Rocky Hill', 'Vista Point', 'Rolling Hills', 'Highland'],
      mountains: ['Mountain Pass', 'Summit', 'Cave', 'Gorge'],
      coast: ['Beach', 'Harbor', 'Lighthouse', 'Pier'],
      river: ['River Bend', 'Bridge', 'Falls', 'Ford']
    };

    const names = features[terrain] || features.plains;
    const name = names[Math.floor(Math.random() * names.length)];

    return {
      id: `natural-${Date.now()}`,
      name,
      type: 'landmark',
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      properties: {
        natural: true,
        terrain
      }
    };
  }

  /**
   * Generate districts using simple radial placement (used by the legacy generate() path).
   */
  private generateDistricts(config: GeographyConfig): Location[] {
    const numDistricts = this.getDistrictCount(config.settlementType);
    const mapSize = this.getMapSize(config.settlementType);
    const centerX = mapSize / 2;
    const centerY = mapSize / 2;
    const roleList = DISTRICT_ROLES[config.settlementType] || DISTRICT_ROLES.town;
    const districts: Location[] = [];

    for (let i = 0; i < numDistricts; i++) {
      const angle = (i / numDistricts) * 2 * Math.PI;
      const seedRadius = mapSize / 3;
      const x = centerX + Math.cos(angle) * seedRadius;
      const y = centerY + Math.sin(angle) * seedRadius;
      const role = roleList[i % roleList.length];
      const roleNames = ROLE_NAMES[role];
      const name = roleNames[i % roleNames.length];

      districts.push({
        id: `district-${i}`,
        name,
        type: 'district',
        x,
        y,
        width: mapSize / 4,
        height: mapSize / 4,
        properties: { role },
      });
    }

    return districts;
  }

  /**
   * Generate buildings using the legacy district+street approach.
   */
  private generateBuildings(config: GeographyConfig, districts: Location[], streets: Location[]): Location[] {
    const buildingsPerStreet = this.getBuildingsPerStreet(config.settlementType);
    const buildings: Location[] = [];
    let buildingIndex = 0;

    for (const street of streets) {
      const district = districts.find(d => d.id === street.parentId);
      for (let i = 0; i < buildingsPerStreet; i++) {
        const offsetX = ((buildingIndex * 17 + 5) % 80) - 40;
        const offsetY = ((buildingIndex * 13 + 3) % 80) - 40;
        const isResidence = buildingIndex % 4 !== 0;
        const houseNumber = (buildingIndex % 200) + 1;
        const streetName = street.name;

        buildings.push({
          id: `building-${buildingIndex}`,
          name: isResidence
            ? `${houseNumber} ${streetName}`
            : this.businessNamesPool[buildingIndex % this.businessNamesPool.length],
          type: 'building',
          x: (street.x || 0) + offsetX,
          y: (street.y || 0) + offsetY,
          width: 15,
          height: 15,
          parentId: street.id,
          properties: {
            buildingType: isResidence ? 'residence' : 'business',
            floors: Math.floor(((buildingIndex * 7 + 3) % 5) / 2) + 1,
            houseNumber,
            condition: buildingIndex % 5 === 0 ? 'poor' : buildingIndex % 3 === 0 ? 'average' : 'excellent',
            built: config.foundedYear + (buildingIndex * 13) % 100,
            occupants: isResidence ? (buildingIndex % 6) + 1 : (buildingIndex % 10),
            streetName,
            districtId: district?.id || null,
            side: buildingIndex % 2 === 0 ? 'left' : 'right',
            facingAngle: 0,
            lotWidth: config.settlementType === 'village' ? 15 : config.settlementType === 'town' ? 12 : 10,
            lotDepth: config.settlementType === 'village' ? 28 : config.settlementType === 'town' ? 24 : 20,
            distanceAlongStreet: Math.round((i / buildingsPerStreet) * 100),
            elevation: 0,
            foundationType: 'flat',
          },
        });

        buildingIndex++;
      }
    }

    return buildings;
  }
}
