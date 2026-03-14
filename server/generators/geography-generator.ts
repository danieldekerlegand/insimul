/**
 * Procedural Geography Generator
 * Creates towns, cities, districts, streets, and buildings
 * using StreetGenerator for connected street network graphs.
 */

import { storage } from '../db/storage';
import { AgriculturalZone, AgriculturalZoneGenerator } from './agricultural-zone-generator';
import { CrossingGenerator } from './crossing-generator';
import { generateCoastline } from './coastline-generator';
import { generateHarborAndDocks, type HarborZone } from './harbor-dock-generator';
import {
  generateStreetNetwork,
  placeLots,
  type StreetNetwork,
  type StreetNetworkConfig,
  type LotPlacement,
} from './street-network-generator';
import { StreetGenerator } from './street-generator';
import { validateBuildingAddresses } from './address-validator';
import { generateSettlementBoundary } from './boundary-generator';
import { inferSettlementSubtype, getSubtypeConfig } from './settlement-subtype';
import type { StreetNode, StreetEdge } from '../../shared/game-engine/types';

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
  settlementType: 'village' | 'town' | 'city';
  population: number;
  foundedYear: number;
  terrain: 'plains' | 'hills' | 'mountains' | 'coast' | 'river' | 'forest' | 'desert';
  countryId?: string;
  stateId?: string;
}

/** District role types for terrain-influenced placement */
export type DistrictRole = 'commercial' | 'wealthy_residential' | 'working_residential' | 'industrial' | 'religious_civic' | 'general';

/** District role assignments ordered by priority for each settlement size */
const DISTRICT_ROLES: Record<string, DistrictRole[]> = {
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

  private locationNames = {
    districts: ['Downtown', 'Riverside', 'Hillside', 'Old Town', 'Market Quarter', 'Industrial District',
               'Residential Heights', 'West End', 'East Side', 'North Ward', 'South Gate'],
    landmarks: ['Town Square', 'Central Park', 'Old Mill', 'Clock Tower', 'Town Hall', 'Public Library',
               'Train Station', 'Post Office', 'Fire Station', 'Police Station', 'Cemetery'],
    businesses: ["General Store", "Hardware Store", "Grocery", "Pharmacy", "Diner", "Café",
                "Restaurant", "Bakery", "Barber Shop", "Salon", "Bank", "Hotel", "Theater",
                "Bookstore", "Tailor", "Shoe Store", "Auto Repair", "Gas Station"]
  };

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
    // Step 0: Infer settlement subtype
    const settlementSubtype = inferSettlementSubtype(config);
    const subtypeConfig = getSubtypeConfig(settlementSubtype);
    console.log(`🗺️  Generating geography for ${config.settlementName} (${config.settlementType}/${settlementSubtype}, pop: ${config.population})...`);

    const districts = this.generateDistricts(config);
    const landmarks = this.generateLandmarks(config, districts);

    // Generate street network with actual polyline geometry
    const mapSize = this.getMapSize(config.settlementType);
    const streetNetworkConfig: StreetNetworkConfig = {
      centerX: mapSize / 2,
      centerZ: mapSize / 2,
      settlementType: config.settlementType,
      foundedYear: config.foundedYear,
      seed: `${config.worldId}_${config.settlementId}`,
    };
    const streetNetwork = generateStreetNetwork(streetNetworkConfig);

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
      const coastline = generateCoastline({
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
    });

    // Persist lots, residences, and businesses as proper database records
    const lotIds = await this.persistLotsAndBuildings(config, districts, streets, buildings, streetNetwork);

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

        const isResidence = this.shouldBeResidence(edge.streetType, buildingIndex);
        const name = isResidence
          ? `${(buildingIndex % 200) + 1} ${streetName}`
          : this.locationNames.businesses[buildingIndex % this.locationNames.businesses.length];

        // Lot dimensions by settlement type
        const lotWidth = config.settlementType === 'village' ? 15 : config.settlementType === 'town' ? 12 : 10;
        const lotDepth = config.settlementType === 'village' ? 20 : config.settlementType === 'town' ? 16 : 14;

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
   * Determine if a building should be residential based on street type and index.
   * Main roads and avenues have more businesses; residential streets are mostly homes.
   */
  private shouldBeResidence(streetType: string, index: number): boolean {
    switch (streetType) {
      case 'boulevard':
      case 'main_road':
      case 'avenue':
        return index % 3 !== 0; // ~67% residential on main roads
      case 'residential':
        return index % 5 !== 0; // ~80% residential
      case 'lane':
        return index % 7 !== 0; // ~86% residential
      default:
        return index % 4 !== 0; // ~75% residential
    }
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
    streetNetwork?: StreetNetwork
  ): Promise<string[]> {
    const districtById = new Map(districts.map(d => [d.id, d]));
    const streetById = new Map(streets.map(s => [s.id, s]));

    // Generate lot placements with world-space coordinates
    let lotPlacements: LotPlacement[] = [];
    if (streetNetwork) {
      const seed = `${config.worldId}_${config.settlementId}`;
      lotPlacements = placeLots(streetNetwork, buildings.length, seed);
    }

    // Build a lookup: streetName+houseNumber -> placement for matching
    const placementByKey = new Map<string, LotPlacement>();
    for (const p of lotPlacements) {
      placementByKey.set(`${p.streetName}:${p.houseNumber}`, p);
    }

    // Prepare bulk-insert arrays
    const lotDocs: any[] = [];
    const residenceDocs: any[] = [];
    const businessDocs: any[] = [];

    for (let bi = 0; bi < buildings.length; bi++) {
      const building = buildings[bi];
      const street = building.parentId ? streetById.get(building.parentId) : undefined;
      const district = street?.parentId ? districtById.get(street.parentId) : undefined;
      const streetName = building.properties?.streetName || street?.name || 'Unknown St';
      const districtId = building.properties?.districtId;
      const districtFromProp = districtId ? districtById.get(districtId) : undefined;
      const districtName = (districtFromProp || district)?.name || 'Unknown District';
      const houseNumber = (building.properties?.houseNumber as number) ||
        Math.floor(Math.random() * 200) + 1;
      const address = `${houseNumber} ${streetName}`;
      const isResidence = building.properties?.buildingType === 'residence';

      // Try to match to a lot placement by streetName+houseNumber, else by index
      const placement = placementByKey.get(`${streetName}:${houseNumber}`) || lotPlacements[bi];

      // Extract lot geometry from building properties
      const edgeId = building.properties?.edgeId || null;
      const side = building.properties?.side || placement?.side || 'left';
      const facingAngle = building.properties?.facingAngle ?? placement?.facingAngle ?? 0;
      const lotWidth = building.properties?.lotWidth || 12;
      const lotDepth = building.properties?.lotDepth || 16;
      const distanceAlongStreet = building.properties?.distanceAlongStreet || 0;
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
        positionX: placement?.x ?? null,
        positionZ: placement?.z ?? null,
        lotWidth,
        lotDepth,
        streetEdgeId: edgeId || placement?.streetId || null,
        distanceAlongStreet,
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

    // Bulk-insert lots
    const createdLots = await (storage as any).createLotsInBulk(
      lotDocs.map(({ _buildingIndex, _isResidence, _buildingName, _floors, _built, ...lot }) => lot)
    );

    // Create residences and businesses referencing the lot IDs
    for (let i = 0; i < createdLots.length; i++) {
      const lot = createdLots[i];
      const meta = lotDocs[i];

      if (meta._isResidence) {
        const floors = meta._floors;
        const residenceType = floors >= 3 ? 'mansion' : floors === 2 ? 'house' : 'cottage';
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
        if (!lotDocs[i]._isResidence) {
          await storage.updateLot(createdLots[i].id, { buildingId: createdBusinesses[bizIdx].id });
          bizIdx++;
        }
      }
    }

    return createdLots.map((l: any) => l.id);
  }

  /**
   * Infer a BusinessType from the business name string
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
    return 'Shop';
  }

  /**
   * Get number of districts based on settlement type
   */
  private getDistrictCount(type: string): number {
    switch (type) {
      case 'village': return 2;
      case 'town': return 4;
      case 'city': return 8;
      default: return 4;
    }
  }

  /**
   * Get map size based on settlement type
   */
  private getMapSize(type: string): number {
    switch (type) {
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
      case 'village': return 5;
      case 'town': return 10;
      case 'city': return 15;
      default: return 10;
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
            : this.locationNames.businesses[buildingIndex % this.locationNames.businesses.length],
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
            lotDepth: config.settlementType === 'village' ? 20 : config.settlementType === 'town' ? 16 : 14,
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
