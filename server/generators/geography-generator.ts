/**
 * Procedural Geography Generator
 * Creates towns, cities, districts, streets, and buildings
 */

import { storage } from '../db/storage';
import { AgriculturalZone, AgriculturalZoneGenerator } from './agricultural-zone-generator';
import { CrossingGenerator } from './crossing-generator';
import {
  generateStreetNetwork,
  placeLots,
  type StreetNetwork,
  type StreetNetworkConfig,
  type LotPlacement,
} from './street-network-generator';

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

export class GeographyGenerator {
  private locationNames = {
    districts: ['Downtown', 'Riverside', 'Hillside', 'Old Town', 'Market Quarter', 'Industrial District',
               'Residential Heights', 'West End', 'East Side', 'North Ward', 'South Gate'],
    streets: ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington St',
             'Lincoln Ave', 'Jefferson Blvd', 'Madison Way', 'Monroe Dr', 'Adams St', 'High St',
             'Park Ave', 'Church St', 'Market St', 'Mill Rd', 'Spring St', 'River Rd', 'Hill St'],
    landmarks: ['Town Square', 'Central Park', 'Old Mill', 'Clock Tower', 'Town Hall', 'Public Library',
               'Train Station', 'Post Office', 'Fire Station', 'Police Station', 'Cemetery'],
    businesses: ["General Store", "Hardware Store", "Grocery", "Pharmacy", "Diner", "Café", 
                "Restaurant", "Bakery", "Barber Shop", "Salon", "Bank", "Hotel", "Theater",
                "Bookstore", "Tailor", "Shoe Store", "Auto Repair", "Gas Station"]
  };

  /**
   * Generate complete geography for a settlement
   */
  async generate(config: GeographyConfig): Promise<{
    districts: Location[];
    streets: Location[];
    buildings: Location[];
    landmarks: Location[];
    lotIds: string[];
    agriculturalZones: AgriculturalZone[];
    streetNetwork: StreetNetwork;
  }> {
    console.log(`🗺️  Generating geography for ${config.settlementName} (${config.settlementType}, pop: ${config.population})...`);

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

    // Update settlement with geography metadata including street network
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
    });

    // Persist lots, residences, and businesses as proper database records
    const lotIds = await this.persistLotsAndBuildings(config, districts, streets, buildings, streetNetwork);

    console.log(`✅ Generated ${districts.length} districts, ${streetNetwork.segments.length} streets (${streetNetwork.nodes.length} nodes), ${buildings.length} buildings (${lotIds.length} lots persisted), ${agriculturalZones.length} agricultural zones`);

    return { districts, streets, buildings, landmarks, lotIds, agriculturalZones, streetNetwork };
  }

  /**
   * Create Lot, Residence, and Business records from generated building data.
   * Inspired by Talk of the Town's lot-based town model where each lot tracks
   * its building history over time.
   */
  private async persistLotsAndBuildings(
    config: GeographyConfig,
    districts: Location[],
    streets: Location[],
    buildings: Location[],
    streetNetwork?: StreetNetwork
  ): Promise<string[]> {
    // Build lookup maps for parent references
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
      const streetName = street?.name || 'Unknown St';
      const districtName = district?.name || 'Unknown District';
      const houseNumber = (building.properties?.houseNumber as number) ||
        Math.floor(Math.random() * 200) + 1;
      const address = `${houseNumber} ${streetName}`;
      const isResidence = building.properties?.buildingType === 'residence';

      // Try to match to a lot placement by streetName+houseNumber, else by index
      const placement = placementByKey.get(`${streetName}:${houseNumber}`) || lotPlacements[bi];

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
        facingAngle: placement?.facingAngle ?? 0,
        streetEdgeId: placement?.streetId ?? null,
        side: placement?.side ?? null,
        formerBuildingIds: [],
        // Placeholder — buildingId will be set after residence/business creation
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

    // Now create residences and businesses referencing the lot IDs
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

    // Bulk-insert residences and businesses
    if (residenceDocs.length > 0) {
      const createdResidences = await (storage as any).createResidencesInBulk(residenceDocs);
      // Update lot records with building IDs
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
    if (lower.includes('shop') || lower.includes('store') || lower.includes('market')) return 'Shop';
    return 'Shop';
  }

  /**
   * Generate districts/neighborhoods
   */
  private generateDistricts(config: GeographyConfig): Location[] {
    const numDistricts = this.getDistrictCount(config.settlementType);
    const districts: Location[] = [];
    const mapSize = this.getMapSize(config.settlementType);
    
    for (let i = 0; i < numDistricts; i++) {
      const angle = (i / numDistricts) * 2 * Math.PI;
      const radius = mapSize / 3;
      
      districts.push({
        id: `district-${i}`,
        name: this.locationNames.districts[i % this.locationNames.districts.length],
        type: 'district',
        x: mapSize / 2 + Math.cos(angle) * radius,
        y: mapSize / 2 + Math.sin(angle) * radius,
        width: mapSize / 4,
        height: mapSize / 4,
        properties: {
          wealth: Math.random() * 100,
          crime: Math.random() * 50,
          established: config.foundedYear + Math.floor(Math.random() * 50)
        }
      });
    }
    
    return districts;
  }

  /**
   * Generate streets
   */
  private generateStreets(config: GeographyConfig, districts: Location[]): Location[] {
    const streetsPerDistrict = this.getStreetsPerDistrict(config.settlementType);
    const streets: Location[] = [];
    let streetIndex = 0;
    
    for (const district of districts) {
      for (let i = 0; i < streetsPerDistrict; i++) {
        const streetName = this.locationNames.streets[streetIndex % this.locationNames.streets.length];
        
        streets.push({
          id: `street-${streetIndex}`,
          name: streetName,
          type: 'street',
          x: (district.x || 0) + (Math.random() - 0.5) * (district.width || 100),
          y: (district.y || 0) + (Math.random() - 0.5) * (district.height || 100),
          parentId: district.id,
          properties: {
            length: 200 + Math.random() * 300,
            condition: Math.random() > 0.7 ? 'poor' : 'good',
            traffic: Math.random() > 0.5 ? 'high' : 'low'
          }
        });
        
        streetIndex++;
      }
    }
    
    return streets;
  }

  /**
   * Generate landmarks
   */
  private generateLandmarks(config: GeographyConfig, districts: Location[]): Location[] {
    const numLandmarks = Math.min(this.locationNames.landmarks.length, districts.length * 2);
    const landmarks: Location[] = [];
    
    for (let i = 0; i < numLandmarks; i++) {
      const district = districts[i % districts.length];
      
      landmarks.push({
        id: `landmark-${i}`,
        name: this.locationNames.landmarks[i],
        type: 'landmark',
        x: (district.x || 0) + (Math.random() - 0.5) * 50,
        y: (district.y || 0) + (Math.random() - 0.5) * 50,
        parentId: district.id,
        properties: {
          visitors: Math.floor(Math.random() * 1000),
          historical: Math.random() > 0.5,
          established: config.foundedYear + Math.floor(Math.random() * (new Date().getFullYear() - config.foundedYear))
        }
      });
    }
    
    return landmarks;
  }

  /**
   * Generate buildings (residences and businesses)
   */
  private generateBuildings(config: GeographyConfig, districts: Location[], streets: Location[]): Location[] {
    const buildingsPerStreet = this.getBuildingsPerStreet(config.settlementType);
    const buildings: Location[] = [];
    let buildingIndex = 0;
    
    for (const street of streets) {
      for (let i = 0; i < buildingsPerStreet; i++) {
        const isResidence = Math.random() > 0.3; // 70% residential
        const name = isResidence 
          ? `${Math.floor(buildingIndex / 2) + 1} ${street.name}`
          : this.locationNames.businesses[buildingIndex % this.locationNames.businesses.length];
        
        buildings.push({
          id: `building-${buildingIndex}`,
          name,
          type: 'building',
          x: (street.x || 0) + i * 20,
          y: (street.y || 0) + (Math.random() - 0.5) * 10,
          width: 15,
          height: 15,
          parentId: street.id,
          properties: {
            buildingType: isResidence ? 'residence' : 'business',
            floors: Math.floor(Math.random() * 3) + 1,
            condition: Math.random() > 0.7 ? 'poor' : Math.random() > 0.3 ? 'average' : 'excellent',
            built: config.foundedYear + Math.floor(Math.random() * 100),
            occupants: isResidence ? Math.floor(Math.random() * 6) + 1 : Math.floor(Math.random() * 10)
          }
        });
        
        buildingIndex++;
      }
    }
    
    return buildings;
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
   * Get streets per district
   */
  private getStreetsPerDistrict(type: string): number {
    switch (type) {
      case 'village': return 3;
      case 'town': return 5;
      case 'city': return 8;
      default: return 5;
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
}
