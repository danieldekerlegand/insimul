/**
 * Address Validator — Post-generation validation and auto-fix for lot addresses.
 *
 * Checks:
 * 1. No duplicate addresses within settlement
 * 2. House numbers monotonically increasing per street per side
 * 3. All lots reference a valid street edge
 * 4. Street names match the assigned edge name
 *
 * Auto-fixes duplicate addresses by appending letter suffixes (e.g. 42A Oak Ave).
 */

import type { StreetNetwork, StreetEdge } from '../../shared/game-engine/types';
import type { StreetNetwork as GeneratorStreetNetwork } from './street-network-generator';
import type { LotPosition } from './lot-generator';
import type { Location } from './geography-generator';

/** Accept either IR-format (edges) or generator-format (segments) street networks */
type AnyStreetNetwork = StreetNetwork | GeneratorStreetNetwork;

/** Lot with address fields (set by assignAddresses) */
interface AddressedLotLike extends LotPosition {
  houseNumber?: number;
  streetName?: string;
  address?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fixesApplied: string[];
}

/**
 * Validate addresses on lots and auto-fix duplicates.
 * Mutates lots in-place when applying fixes.
 */
export function validateAddresses(
  lots: LotPosition[],
  streetNetwork: AnyStreetNetwork,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fixesApplied: string[] = [];

  if (lots.length === 0) {
    return { valid: true, errors, warnings, fixesApplied };
  }

  // Support both IR-format (edges) and generator-format (segments)
  const edges: Array<{ id: string; name: string }> =
    ('edges' in streetNetwork && Array.isArray(streetNetwork.edges))
      ? streetNetwork.edges
      : ('segments' in streetNetwork && Array.isArray(streetNetwork.segments))
        ? streetNetwork.segments.map(s => ({ id: s.id, name: s.name } as any))
        : [];

  const edgeMap = new Map<string, { id: string; name: string }>();
  for (const edge of edges) {
    edgeMap.set(edge.id, edge);
  }

  const addressedLots = lots as AddressedLotLike[];

  // --- Check 1: All lots reference a valid street edge ---
  for (const lot of addressedLots) {
    // Skip lots with no street assignment (overflow lots placed at settlement center)
    if (!lot.streetEdgeId) continue;
    if (!edgeMap.has(lot.streetEdgeId)) {
      errors.push(`Lot at (${lot.position.x.toFixed(1)}, ${lot.position.z.toFixed(1)}) references invalid street edge "${lot.streetEdgeId}"`);
    }
  }

  // --- Check 2: Street names match the assigned edge name ---
  for (const lot of addressedLots) {
    if (!lot.streetName || !lot.address) continue;
    const edge = edgeMap.get(lot.streetEdgeId);
    if (!edge) continue;
    // Corner lots may be reassigned to a different street, so only warn if edge has a name
    // and the lot's street name doesn't match ANY edge in the network with that name
    if (edge.name && edge.name !== lot.streetName) {
      // Check if there's any edge with the lot's street name (corner lot reassignment)
      const hasMatchingEdge = edges.some(e => e.name === lot.streetName);
      if (!hasMatchingEdge) {
        errors.push(`Lot "${lot.address}" references street "${lot.streetName}" which doesn't exist in the network`);
      }
    }
  }

  // --- Check 3: No duplicate addresses (auto-fix) ---
  const addressCounts = new Map<string, AddressedLotLike[]>();
  for (const lot of addressedLots) {
    if (!lot.address) continue;
    if (!addressCounts.has(lot.address)) addressCounts.set(lot.address, []);
    addressCounts.get(lot.address)!.push(lot);
  }

  const allAddresses = new Set<string>();
  for (const lot of addressedLots) {
    if (lot.address) allAddresses.add(lot.address);
  }

  for (const [address, dupes] of Array.from(addressCounts)) {
    if (dupes.length <= 1) continue;

    // Keep the first one, fix the rest with letter suffixes
    for (let i = 1; i < dupes.length; i++) {
      const lot = dupes[i];
      const suffix = String.fromCharCode(65 + i - 1); // A, B, C...
      const newAddress = `${lot.houseNumber}${suffix} ${lot.streetName}`;

      // Ensure the new address is also unique
      let finalAddress = newAddress;
      let suffixIdx = i - 1;
      while (allAddresses.has(finalAddress)) {
        suffixIdx++;
        const nextSuffix = String.fromCharCode(65 + suffixIdx);
        finalAddress = `${lot.houseNumber}${nextSuffix} ${lot.streetName}`;
      }

      fixesApplied.push(`Duplicate address "${address}" → renamed to "${finalAddress}"`);
      lot.address = finalAddress;
      allAddresses.add(finalAddress);
    }
  }

  // --- Check 4: House numbers monotonically increasing per street per side ---
  const lotsByStreetAndSide = new Map<string, AddressedLotLike[]>();
  for (const lot of addressedLots) {
    if (!lot.streetName || lot.houseNumber == null) continue;
    const key = `${lot.streetName}::${lot.side}`;
    if (!lotsByStreetAndSide.has(key)) lotsByStreetAndSide.set(key, []);
    lotsByStreetAndSide.get(key)!.push(lot);
  }

  for (const [key, streetLots] of Array.from(lotsByStreetAndSide)) {
    // Sort by distanceAlongStreet to check monotonicity in spatial order
    const sorted = streetLots.slice().sort((a, b) => a.distanceAlongStreet - b.distanceAlongStreet);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].houseNumber! < sorted[i - 1].houseNumber!) {
        const [streetName, side] = key.split('::');
        warnings.push(
          `Non-monotonic house numbers on ${streetName} (${side} side): ` +
          `#${sorted[i - 1].houseNumber} → #${sorted[i].houseNumber}`
        );
        break; // Only report once per street/side
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fixesApplied,
  };
}

/**
 * Validate addresses on Location-based buildings (from GeographyGenerator).
 * Extracts address fields from properties and delegates to validateAddresses.
 * Fixes are applied back to the Location properties.
 */
export function validateBuildingAddresses(
  buildings: Location[],
  streetNetwork: AnyStreetNetwork,
  settlementId: string,
): ValidationResult {
  // Convert Location buildings to LotPosition-like objects for validation
  const lotLike: (LotPosition & { houseNumber?: number; streetName?: string; address?: string })[] = [];
  const locationMap = new Map<object, Location>(); // map lot-like back to building

  for (const building of buildings) {
    if (building.type !== 'building') continue;
    const p = building.properties;
    const lot = {
      position: { x: building.x, y: 0, z: building.y },
      facingAngle: p.facingAngle ?? 0,
      width: p.lotWidth ?? 12,
      depth: p.lotDepth ?? 16,
      side: (p.side ?? 'left') as 'left' | 'right',
      distanceAlongStreet: p.distanceAlongStreet ?? 0,
      streetEdgeId: p.edgeId ?? '',
      houseNumber: p.houseNumber,
      streetName: p.streetName,
      address: p.houseNumber != null && p.streetName ? `${p.houseNumber} ${p.streetName}` : undefined,
    };
    lotLike.push(lot);
    locationMap.set(lot, building);
  }

  const result = validateAddresses(lotLike, streetNetwork);

  // Apply fixes back to Location properties
  for (const lot of lotLike) {
    const building = locationMap.get(lot);
    if (building && lot.address) {
      building.properties.address = lot.address;
      // Update building name if it was a residence with an address
      if (building.properties.buildingType === 'residence') {
        building.name = lot.address;
      }
    }
  }

  // Log errors and warnings with settlement ID
  if (result.errors.length > 0) {
    console.error(`[${settlementId}] Address validation errors:`, result.errors);
  }
  if (result.warnings.length > 0) {
    console.warn(`[${settlementId}] Address validation warnings:`, result.warnings);
  }
  if (result.fixesApplied.length > 0) {
    console.log(`[${settlementId}] Address validation fixes applied:`, result.fixesApplied);
  }

  return result;
}
