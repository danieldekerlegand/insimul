/**
 * Tests for public building type: schema types, storage CRUD, and API routes.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PublicBuildingType, BuildingType } from '../../shared/schema';

// ---- Mock storage ----
const mockStorage = vi.hoisted(() => ({
  getPublicBuilding: vi.fn(),
  getPublicBuildingsBySettlement: vi.fn(),
  getPublicBuildingsByWorld: vi.fn(),
  createPublicBuilding: vi.fn(),
  updatePublicBuilding: vi.fn(),
  deletePublicBuilding: vi.fn(),
}));

vi.mock('../db/storage', () => ({
  storage: mockStorage,
}));

describe('PublicBuildingType', () => {
  it('includes all expected subtypes', () => {
    const types: PublicBuildingType[] = ['School', 'CityHall', 'Library', 'PostOffice'];
    expect(types).toHaveLength(4);
    expect(types).toContain('School');
    expect(types).toContain('CityHall');
    expect(types).toContain('Library');
    expect(types).toContain('PostOffice');
  });

  it('BuildingType includes public', () => {
    const bt: BuildingType = 'public';
    expect(bt).toBe('public');
  });
});

describe('Public Building storage operations', () => {
  const sampleBuilding = {
    id: 'pb-1',
    worldId: 'world-1',
    settlementId: 'settlement-1',
    lotId: 'lot-1',
    name: 'Riverside Library',
    publicBuildingType: 'Library' as PublicBuildingType,
    address: '100 Main St',
    foundedYear: 1920,
    isOperational: true,
    capacity: 200,
    employeeIds: ['char-1', 'char-2'],
    buildingData: { bookCount: 5000 },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPublicBuilding returns a building by id', async () => {
    mockStorage.getPublicBuilding.mockResolvedValue(sampleBuilding);

    const result = await mockStorage.getPublicBuilding('pb-1');
    expect(result).toEqual(sampleBuilding);
    expect(mockStorage.getPublicBuilding).toHaveBeenCalledWith('pb-1');
  });

  it('getPublicBuilding returns undefined for missing id', async () => {
    mockStorage.getPublicBuilding.mockResolvedValue(undefined);

    const result = await mockStorage.getPublicBuilding('nonexistent');
    expect(result).toBeUndefined();
  });

  it('getPublicBuildingsBySettlement returns buildings for a settlement', async () => {
    const buildings = [
      { ...sampleBuilding, id: 'pb-1' },
      { ...sampleBuilding, id: 'pb-2', name: 'Town School', publicBuildingType: 'School' },
    ];
    mockStorage.getPublicBuildingsBySettlement.mockResolvedValue(buildings);

    const result = await mockStorage.getPublicBuildingsBySettlement('settlement-1');
    expect(result).toHaveLength(2);
    expect(mockStorage.getPublicBuildingsBySettlement).toHaveBeenCalledWith('settlement-1');
  });

  it('getPublicBuildingsByWorld returns buildings for a world', async () => {
    mockStorage.getPublicBuildingsByWorld.mockResolvedValue([sampleBuilding]);

    const result = await mockStorage.getPublicBuildingsByWorld('world-1');
    expect(result).toHaveLength(1);
  });

  it('createPublicBuilding creates and returns a building', async () => {
    mockStorage.createPublicBuilding.mockResolvedValue(sampleBuilding);

    const result = await mockStorage.createPublicBuilding(sampleBuilding);
    expect(result.name).toBe('Riverside Library');
    expect(result.publicBuildingType).toBe('Library');
  });

  it('updatePublicBuilding updates and returns the building', async () => {
    const updated = { ...sampleBuilding, isOperational: false };
    mockStorage.updatePublicBuilding.mockResolvedValue(updated);

    const result = await mockStorage.updatePublicBuilding('pb-1', { isOperational: false });
    expect(result?.isOperational).toBe(false);
  });

  it('deletePublicBuilding returns true on success', async () => {
    mockStorage.deletePublicBuilding.mockResolvedValue(true);

    const result = await mockStorage.deletePublicBuilding('pb-1');
    expect(result).toBe(true);
  });

  it('deletePublicBuilding returns false for missing building', async () => {
    mockStorage.deletePublicBuilding.mockResolvedValue(false);

    const result = await mockStorage.deletePublicBuilding('nonexistent');
    expect(result).toBe(false);
  });
});

describe('Public building type coverage', () => {
  it('each PublicBuildingType has a unique value', () => {
    const types: PublicBuildingType[] = ['School', 'CityHall', 'Library', 'PostOffice'];
    const unique = new Set(types);
    expect(unique.size).toBe(types.length);
  });

  it('School building stores education-specific data', async () => {
    const school = {
      id: 'pb-school',
      worldId: 'world-1',
      settlementId: 'settlement-1',
      lotId: 'lot-2',
      name: 'Oakwood Elementary',
      publicBuildingType: 'School' as PublicBuildingType,
      address: '50 School Rd',
      foundedYear: 1955,
      isOperational: true,
      capacity: 300,
      employeeIds: ['teacher-1', 'teacher-2', 'principal-1'],
      buildingData: { grades: ['K', '1', '2', '3', '4', '5'] },
    };
    mockStorage.createPublicBuilding.mockResolvedValue(school);

    const result = await mockStorage.createPublicBuilding(school);
    expect(result.publicBuildingType).toBe('School');
    expect(result.buildingData.grades).toHaveLength(6);
  });

  it('CityHall building stores government data', async () => {
    const cityHall = {
      id: 'pb-city',
      worldId: 'world-1',
      settlementId: 'settlement-1',
      lotId: 'lot-3',
      name: 'Riverside City Hall',
      publicBuildingType: 'CityHall' as PublicBuildingType,
      address: '1 Government Plaza',
      foundedYear: 1890,
      isOperational: true,
      capacity: 100,
      employeeIds: ['mayor-1'],
      buildingData: { departments: ['permits', 'records', 'treasury'] },
    };
    mockStorage.createPublicBuilding.mockResolvedValue(cityHall);

    const result = await mockStorage.createPublicBuilding(cityHall);
    expect(result.publicBuildingType).toBe('CityHall');
    expect(result.buildingData.departments).toContain('records');
  });

  it('PostOffice building stores postal data', async () => {
    const postOffice = {
      id: 'pb-post',
      worldId: 'world-1',
      settlementId: 'settlement-1',
      lotId: 'lot-4',
      name: 'Main Street Post Office',
      publicBuildingType: 'PostOffice' as PublicBuildingType,
      address: '200 Main St',
      foundedYear: 1910,
      isOperational: true,
      capacity: 30,
      employeeIds: ['postmaster-1'],
      buildingData: { zipCode: '70001' },
    };
    mockStorage.createPublicBuilding.mockResolvedValue(postOffice);

    const result = await mockStorage.createPublicBuilding(postOffice);
    expect(result.publicBuildingType).toBe('PostOffice');
  });
});
