import {
  getSettlementTier,
  getEligibleBuildingTypes,
  isBuildingTypeEligible,
} from '@shared/game-engine/building-generation-rules';

describe('getSettlementTier', () => {
  it('classifies population < 200 as village', () => {
    expect(getSettlementTier(50)).toBe('village');
    expect(getSettlementTier(199)).toBe('village');
  });

  it('classifies population 200-2000 as town', () => {
    expect(getSettlementTier(200)).toBe('town');
    expect(getSettlementTier(2000)).toBe('town');
  });

  it('classifies population > 2000 as city', () => {
    expect(getSettlementTier(2001)).toBe('city');
    expect(getSettlementTier(50000)).toBe('city');
  });
});

describe('getEligibleBuildingTypes', () => {
  it('includes basic village types for small populations', () => {
    const types = getEligibleBuildingTypes('village', 100);
    expect(types).toContain('Farm');
    expect(types).toContain('Blacksmith');
    expect(types).toContain('Tavern');
    expect(types).toContain('Church');
    expect(types).toContain('Bakery');
    expect(types).toContain('Inn');
    expect(types).toContain('Windmill');
  });

  it('excludes town/city types from villages', () => {
    const types = getEligibleBuildingTypes('village', 50);
    expect(types).not.toContain('University');
    expect(types).not.toContain('Hospital');
    expect(types).not.toContain('Factory');
    expect(types).not.toContain('School');
    expect(types).not.toContain('Bank');
    expect(types).not.toContain('Theater');
  });

  it('adds town-tier types for populations 200-2000', () => {
    const types = getEligibleBuildingTypes('town', 500);
    expect(types).toContain('School');
    expect(types).toContain('Bank');
    expect(types).toContain('Hotel');
    expect(types).toContain('Theater');
    expect(types).toContain('Library');
    expect(types).toContain('Brewery');
    // Still includes village types
    expect(types).toContain('Farm');
    expect(types).toContain('Blacksmith');
  });

  it('excludes city types from towns', () => {
    const types = getEligibleBuildingTypes('town', 1000);
    expect(types).not.toContain('University');
    expect(types).not.toContain('Hospital');
    expect(types).not.toContain('Factory');
    expect(types).not.toContain('PoliceStation');
  });

  it('adds city-tier types for populations > 2000', () => {
    const types = getEligibleBuildingTypes('city', 5000);
    expect(types).toContain('University');
    expect(types).toContain('Hospital');
    expect(types).toContain('Factory');
    expect(types).toContain('PoliceStation');
    expect(types).toContain('FireStation');
    expect(types).toContain('AutoRepair');
    // Still includes village + town types
    expect(types).toContain('Farm');
    expect(types).toContain('School');
  });

  it('excludes maritime types without coast/river geography', () => {
    const types = getEligibleBuildingTypes('city', 5000);
    expect(types).not.toContain('Harbor');
    expect(types).not.toContain('Boatyard');
    expect(types).not.toContain('FishMarket');
    expect(types).not.toContain('Lighthouse');
  });

  it('includes maritime types with coast geography', () => {
    const types = getEligibleBuildingTypes('city', 5000, null, ['coast']);
    expect(types).toContain('Harbor');
    expect(types).toContain('Boatyard');
    expect(types).toContain('FishMarket');
    expect(types).toContain('CustomsHouse');
    expect(types).toContain('Lighthouse');
  });

  it('includes maritime types with river geography', () => {
    const types = getEligibleBuildingTypes('village', 100, null, ['river']);
    expect(types).toContain('Harbor');
    expect(types).toContain('FishMarket');
  });

  it('includes Mine only with mountains geography', () => {
    expect(getEligibleBuildingTypes('city', 5000)).not.toContain('Mine');
    expect(getEligibleBuildingTypes('city', 5000, null, ['mountains'])).toContain('Mine');
  });

  it('includes Lumbermill only with forest geography', () => {
    expect(getEligibleBuildingTypes('city', 5000)).not.toContain('Lumbermill');
    expect(getEligibleBuildingTypes('city', 5000, null, ['forest'])).toContain('Lumbermill');
  });

  it('uses population to determine tier regardless of settlementType string', () => {
    // Even if settlementType says "city", a pop of 50 gives village-tier
    const types = getEligibleBuildingTypes('city', 50);
    expect(types).not.toContain('University');
    expect(types).toContain('Farm');
  });
});

describe('isBuildingTypeEligible', () => {
  it('returns true for eligible types', () => {
    expect(isBuildingTypeEligible('Farm', 'village', 100)).toBe(true);
  });

  it('returns false for ineligible types', () => {
    expect(isBuildingTypeEligible('University', 'village', 50)).toBe(false);
  });

  it('respects geography for maritime types', () => {
    expect(isBuildingTypeEligible('Harbor', 'city', 5000)).toBe(false);
    expect(isBuildingTypeEligible('Harbor', 'city', 5000, null, ['coast'])).toBe(true);
  });
});
