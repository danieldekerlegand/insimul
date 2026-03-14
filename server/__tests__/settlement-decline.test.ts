/**
 * Tests for settlement decline mechanics (US-064)
 *
 * Functions under test: server/extensions/tott/settlement-decline-system.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---- Mock storage ----
const mockStorage = vi.hoisted(() => ({
  getSettlement: vi.fn(),
  updateSettlement: vi.fn(),
  getLotsBySettlement: vi.fn(),
  getBusinessesBySettlement: vi.fn(),
  getBusiness: vi.fn(),
  updateBusiness: vi.fn(),
}));

vi.mock('../db/storage', () => ({
  storage: mockStorage,
}));

// ---- Mock dependent TotT modules ----
vi.mock('../extensions/tott/building-commission-system.js', () => ({
  demolishBuilding: vi.fn(),
}));

vi.mock('../extensions/tott/prolog-queries.js', () => ({
  prologAssertFact: vi.fn(),
}));

import {
  calculateDeclineMetrics,
  determineDeclinePhase,
  checkSettlementDowngrade,
  evaluateSettlementDecline,
  getDeclineHistory,
  setPeakPopulation,
  getPeakPopulation,
  clearDeclineState,
} from '../extensions/tott/settlement-decline-system';

import { demolishBuilding } from '../extensions/tott/building-commission-system.js';

// ---- Helpers ----
const WORLD_ID = 'world-1';
const SETTLEMENT_ID = 'settlement-1';

function makeSettlement(overrides: Record<string, any> = {}) {
  return {
    id: SETTLEMENT_ID,
    worldId: WORLD_ID,
    name: 'Testville',
    settlementType: 'city',
    population: 300,
    foundedYear: 1800,
    ...overrides,
  };
}

function makeLot(overrides: Record<string, any> = {}) {
  return {
    id: 'lot-1',
    worldId: WORLD_ID,
    settlementId: SETTLEMENT_ID,
    buildingId: null,
    buildingType: 'vacant',
    address: '1 Main St',
    distanceFromDowntown: 0,
    ...overrides,
  };
}

function makeBusiness(overrides: Record<string, any> = {}) {
  return {
    id: 'biz-1',
    worldId: WORLD_ID,
    settlementId: SETTLEMENT_ID,
    name: 'Test Shop',
    businessType: 'shop',
    isOutOfBusiness: false,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  clearDeclineState();
  mockStorage.getLotsBySettlement.mockResolvedValue([]);
  mockStorage.getBusinessesBySettlement.mockResolvedValue([]);
  mockStorage.updateSettlement.mockImplementation(async (id: string, data: any) => ({
    ...makeSettlement(),
    ...data,
  }));
  mockStorage.updateBusiness.mockImplementation(async (id: string, data: any) => ({
    ...makeBusiness({ id }),
    ...data,
  }));
});

// ============================================================================
// determineDeclinePhase
// ============================================================================

describe('determineDeclinePhase', () => {
  it('returns stable when all metrics are healthy', () => {
    expect(determineDeclinePhase(0, 0.1, 0.1)).toBe('stable');
  });

  it('returns stagnating on small population loss', () => {
    expect(determineDeclinePhase(-0.06, 0.1, 0.1)).toBe('stagnating');
  });

  it('returns stagnating on high vacancy alone', () => {
    expect(determineDeclinePhase(0, 0.3, 0)).toBe('stagnating');
  });

  it('returns declining on moderate population loss', () => {
    expect(determineDeclinePhase(-0.16, 0.1, 0.1)).toBe('declining');
  });

  it('returns declining on combined vacancy and closure', () => {
    expect(determineDeclinePhase(0, 0.45, 0.35)).toBe('declining');
  });

  it('returns collapsing on severe population loss', () => {
    expect(determineDeclinePhase(-0.31, 0, 0)).toBe('collapsing');
  });

  it('returns collapsing on extreme vacancy plus closures', () => {
    expect(determineDeclinePhase(0, 0.65, 0.55)).toBe('collapsing');
  });
});

// ============================================================================
// checkSettlementDowngrade
// ============================================================================

describe('checkSettlementDowngrade', () => {
  it('returns null for stable city', () => {
    const s = makeSettlement({ settlementType: 'city', population: 300 });
    expect(checkSettlementDowngrade(s as any, 300)).toBeNull();
  });

  it('downgrades city to town when below threshold', () => {
    const s = makeSettlement({ settlementType: 'city', population: 100 });
    expect(checkSettlementDowngrade(s as any, 100)).toBe('town');
  });

  it('downgrades town to village when below threshold', () => {
    const s = makeSettlement({ settlementType: 'town', population: 30 });
    expect(checkSettlementDowngrade(s as any, 30)).toBe('village');
  });

  it('returns null for village (cannot downgrade further)', () => {
    const s = makeSettlement({ settlementType: 'village', population: 5 });
    expect(checkSettlementDowngrade(s as any, 5)).toBeNull();
  });
});

// ============================================================================
// calculateDeclineMetrics
// ============================================================================

describe('calculateDeclineMetrics', () => {
  it('tracks peak population and calculates change rate', async () => {
    const settlement = makeSettlement({ population: 300 });
    mockStorage.getLotsBySettlement.mockResolvedValue([]);
    mockStorage.getBusinessesBySettlement.mockResolvedValue([]);

    // First call establishes peak
    setPeakPopulation(SETTLEMENT_ID, 400);
    const metrics = await calculateDeclineMetrics(settlement as any);

    expect(metrics.peakPopulation).toBe(400);
    expect(metrics.currentPopulation).toBe(300);
    expect(metrics.populationChangeRate).toBeCloseTo(-0.25);
  });

  it('calculates vacancy ratio correctly', async () => {
    const settlement = makeSettlement({ population: 100 });
    mockStorage.getLotsBySettlement.mockResolvedValue([
      makeLot({ id: 'l1', buildingType: 'vacant', buildingId: null }),
      makeLot({ id: 'l2', buildingType: 'business', buildingId: 'b1' }),
      makeLot({ id: 'l3', buildingType: 'vacant', buildingId: null }),
      makeLot({ id: 'l4', buildingType: 'residence', buildingId: 'r1' }),
    ]);
    mockStorage.getBusinessesBySettlement.mockResolvedValue([]);

    const metrics = await calculateDeclineMetrics(settlement as any);
    expect(metrics.vacantLotRatio).toBeCloseTo(0.5);
  });

  it('calculates closed business ratio correctly', async () => {
    const settlement = makeSettlement({ population: 100 });
    mockStorage.getLotsBySettlement.mockResolvedValue([]);
    mockStorage.getBusinessesBySettlement.mockResolvedValue([
      makeBusiness({ id: 'b1', isOutOfBusiness: false }),
      makeBusiness({ id: 'b2', isOutOfBusiness: true }),
      makeBusiness({ id: 'b3', isOutOfBusiness: true }),
    ]);

    const metrics = await calculateDeclineMetrics(settlement as any);
    expect(metrics.closedBusinessRatio).toBeCloseTo(2 / 3);
  });

  it('handles zero lots and businesses gracefully', async () => {
    const settlement = makeSettlement({ population: 0 });
    const metrics = await calculateDeclineMetrics(settlement as any);

    expect(metrics.vacantLotRatio).toBe(0);
    expect(metrics.closedBusinessRatio).toBe(0);
  });
});

// ============================================================================
// evaluateSettlementDecline
// ============================================================================

describe('evaluateSettlementDecline', () => {
  it('returns stable assessment for healthy settlement', async () => {
    const settlement = makeSettlement({ population: 300 });
    mockStorage.getSettlement.mockResolvedValue(settlement);
    mockStorage.getBusinessesBySettlement.mockResolvedValue([]);

    const result = await evaluateSettlementDecline(SETTLEMENT_ID, 1900);

    expect(result.metrics.phase).toBe('stable');
    expect(result.events).toHaveLength(0);
    expect(result.downgradeTo).toBeUndefined();
  });

  it('generates population_drop event when population falls', async () => {
    setPeakPopulation(SETTLEMENT_ID, 400);
    const settlement = makeSettlement({ population: 300 });
    mockStorage.getSettlement.mockResolvedValue(settlement);
    mockStorage.getBusinessesBySettlement.mockResolvedValue([]);

    const result = await evaluateSettlementDecline(SETTLEMENT_ID, 1900);

    const popDrop = result.events.find(e => e.type === 'population_drop');
    expect(popDrop).toBeDefined();
    expect(popDrop!.description).toContain('25%');
  });

  it('generates mass_exodus event on severe population loss', async () => {
    setPeakPopulation(SETTLEMENT_ID, 400);
    const settlement = makeSettlement({ population: 200 });
    mockStorage.getSettlement.mockResolvedValue(settlement);
    mockStorage.getBusinessesBySettlement.mockResolvedValue([]);

    const result = await evaluateSettlementDecline(SETTLEMENT_ID, 1900);

    const exodus = result.events.find(e => e.type === 'mass_exodus');
    expect(exodus).toBeDefined();
  });

  it('closes businesses during decline phase', async () => {
    setPeakPopulation(SETTLEMENT_ID, 500);
    const settlement = makeSettlement({ population: 200 });
    mockStorage.getSettlement.mockResolvedValue(settlement);

    // Create many active businesses so at least one gets closed probabilistically
    const businesses = Array.from({ length: 20 }, (_, i) =>
      makeBusiness({ id: `biz-${i}`, isOutOfBusiness: false })
    );
    mockStorage.getBusinessesBySettlement.mockResolvedValue(businesses);

    // Run multiple times to overcome randomness
    let closureSeen = false;
    for (let i = 0; i < 10; i++) {
      clearDeclineState();
      setPeakPopulation(SETTLEMENT_ID, 500);
      const result = await evaluateSettlementDecline(SETTLEMENT_ID, 1900);
      if (result.events.some(e => e.type === 'business_closure')) {
        closureSeen = true;
        break;
      }
    }
    expect(closureSeen).toBe(true);
  });

  it('downgrades city to town when population is too low', async () => {
    const settlement = makeSettlement({ population: 100, settlementType: 'city' });
    mockStorage.getSettlement.mockResolvedValue(settlement);
    mockStorage.getBusinessesBySettlement.mockResolvedValue([]);

    const result = await evaluateSettlementDecline(SETTLEMENT_ID, 1900);

    expect(result.downgradeTo).toBe('town');
    expect(mockStorage.updateSettlement).toHaveBeenCalledWith(
      SETTLEMENT_ID,
      expect.objectContaining({ settlementType: 'town' })
    );
    const downgradeEvent = result.events.find(e => e.type === 'settlement_downgrade');
    expect(downgradeEvent).toBeDefined();
  });

  it('triggers building abandonment when vacancy is high and declining', async () => {
    setPeakPopulation(SETTLEMENT_ID, 500);
    const settlement = makeSettlement({ population: 200 });
    mockStorage.getSettlement.mockResolvedValue(settlement);

    // Many vacant lots + one lot with a closed business
    const lots = [
      ...Array.from({ length: 6 }, (_, i) =>
        makeLot({ id: `vacant-${i}`, buildingType: 'vacant', buildingId: null })
      ),
      makeLot({
        id: 'biz-lot',
        buildingType: 'business',
        buildingId: 'closed-biz',
        distanceFromDowntown: 10,
      }),
    ];
    mockStorage.getLotsBySettlement.mockResolvedValue(lots);
    mockStorage.getBusinessesBySettlement.mockResolvedValue([
      makeBusiness({ id: 'closed-biz', isOutOfBusiness: true }),
    ]);
    mockStorage.getBusiness.mockResolvedValue(
      makeBusiness({ id: 'closed-biz', isOutOfBusiness: true })
    );

    const result = await evaluateSettlementDecline(SETTLEMENT_ID, 1900);

    const abandonEvent = result.events.find(e => e.type === 'building_abandoned');
    expect(abandonEvent).toBeDefined();
    expect(demolishBuilding).toHaveBeenCalled();
  });

  it('throws when settlement not found', async () => {
    mockStorage.getSettlement.mockResolvedValue(undefined);
    await expect(evaluateSettlementDecline('missing', 1900))
      .rejects.toThrow('Settlement missing not found');
  });
});

// ============================================================================
// Decline history
// ============================================================================

describe('decline history', () => {
  it('accumulates events across evaluations', async () => {
    setPeakPopulation(SETTLEMENT_ID, 400);
    const settlement = makeSettlement({ population: 300 });
    mockStorage.getSettlement.mockResolvedValue(settlement);
    mockStorage.getBusinessesBySettlement.mockResolvedValue([]);

    await evaluateSettlementDecline(SETTLEMENT_ID, 1900);
    await evaluateSettlementDecline(SETTLEMENT_ID, 1901);

    const history = getDeclineHistory(SETTLEMENT_ID);
    expect(history.length).toBeGreaterThanOrEqual(2);
  });

  it('clearDeclineState resets everything', () => {
    setPeakPopulation(SETTLEMENT_ID, 500);
    clearDeclineState();
    expect(getPeakPopulation(SETTLEMENT_ID)).toBe(0);
    expect(getDeclineHistory(SETTLEMENT_ID)).toHaveLength(0);
  });
});

// ============================================================================
// Peak population tracking
// ============================================================================

describe('peak population tracking', () => {
  it('setPeakPopulation and getPeakPopulation round-trip', () => {
    setPeakPopulation(SETTLEMENT_ID, 999);
    expect(getPeakPopulation(SETTLEMENT_ID)).toBe(999);
  });

  it('metrics never lower the peak', async () => {
    setPeakPopulation(SETTLEMENT_ID, 500);
    const settlement = makeSettlement({ population: 300 });

    const metrics = await calculateDeclineMetrics(settlement as any);
    expect(metrics.peakPopulation).toBe(500);

    // Second call with even lower population keeps peak
    const settlement2 = makeSettlement({ population: 100 });
    const metrics2 = await calculateDeclineMetrics(settlement2 as any);
    expect(metrics2.peakPopulation).toBe(500);
  });
});
