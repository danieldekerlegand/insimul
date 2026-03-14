import { describe, it, expect } from 'vitest';
import { createSettlementHistoryRoutes } from '../routes/settlement-history-routes';

// Mock storage for testing routes
function createMockStorage(events: any[] = []) {
  return {
    getSettlementHistoryBySettlement: async (settlementId: string) =>
      events.filter(e => e.settlementId === settlementId),
    getSettlementHistoryByWorld: async (worldId: string) =>
      events.filter(e => e.worldId === worldId),
    createSettlementHistoryEvent: async (event: any) => ({
      id: 'evt-1',
      ...event,
      createdAt: new Date(),
    }),
    deleteSettlementHistoryEvent: async (id: string) =>
      events.some(e => e.id === id),
  };
}

function mockReq(params: any = {}, query: any = {}, body: any = {}): any {
  return { params, query, body };
}

function mockRes(): any {
  const res: any = {
    statusCode: 200,
    body: null,
    status(code: number) { res.statusCode = code; return res; },
    json(data: any) { res.body = data; return res; },
  };
  return res;
}

const sampleEvents = [
  {
    id: 'evt-1',
    worldId: 'world-1',
    settlementId: 'settlement-1',
    eventType: 'population_change',
    category: 'demographic',
    year: 1850,
    timestep: 10,
    description: 'Population grew from 100 to 150',
    previousValue: { population: 100 },
    newValue: { population: 150 },
    significance: 'minor',
    relatedCharacterIds: [],
    tags: ['growth'],
    createdAt: new Date(),
  },
  {
    id: 'evt-2',
    worldId: 'world-1',
    settlementId: 'settlement-1',
    eventType: 'mayor_change',
    category: 'governance',
    year: 1855,
    timestep: 15,
    description: 'New mayor elected: John Smith',
    previousValue: { mayorId: 'char-1' },
    newValue: { mayorId: 'char-2' },
    significance: 'major',
    relatedCharacterIds: ['char-1', 'char-2'],
    tags: ['election'],
    createdAt: new Date(),
  },
  {
    id: 'evt-3',
    worldId: 'world-1',
    settlementId: 'settlement-2',
    eventType: 'founding',
    category: 'political',
    year: 1840,
    timestep: 1,
    description: 'Settlement founded by pioneers',
    previousValue: null,
    newValue: { name: 'Newtown', population: 20 },
    significance: 'critical',
    relatedCharacterIds: ['char-3'],
    tags: ['founding'],
    createdAt: new Date(),
  },
];

describe('Settlement History Routes', () => {
  describe('GET /settlements/:settlementId/history', () => {
    it('returns history events for a settlement', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'get', '/settlements/:settlementId/history');

      const req = mockReq({ settlementId: 'settlement-1' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body).toHaveLength(2);
      expect(res.body[0].eventType).toBe('population_change');
      expect(res.body[1].eventType).toBe('mayor_change');
    });

    it('filters by eventType', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'get', '/settlements/:settlementId/history');

      const req = mockReq({ settlementId: 'settlement-1' }, { eventType: 'mayor_change' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].eventType).toBe('mayor_change');
    });

    it('filters by category', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'get', '/settlements/:settlementId/history');

      const req = mockReq({ settlementId: 'settlement-1' }, { category: 'demographic' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].category).toBe('demographic');
    });

    it('filters by year range', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'get', '/settlements/:settlementId/history');

      const req = mockReq({ settlementId: 'settlement-1' }, { minYear: '1853', maxYear: '1860' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].year).toBe(1855);
    });

    it('filters by significance', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'get', '/settlements/:settlementId/history');

      const req = mockReq({ settlementId: 'settlement-1' }, { significance: 'major' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].significance).toBe('major');
    });
  });

  describe('GET /worlds/:worldId/settlement-history', () => {
    it('returns all settlement history for a world', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'get', '/worlds/:worldId/settlement-history');

      const req = mockReq({ worldId: 'world-1' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body).toHaveLength(3);
    });

    it('filters by settlementId query param', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'get', '/worlds/:worldId/settlement-history');

      const req = mockReq({ worldId: 'world-1' }, { settlementId: 'settlement-2' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].settlementId).toBe('settlement-2');
    });
  });

  describe('GET /settlements/:settlementId/history/summary', () => {
    it('returns aggregated history stats', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'get', '/settlements/:settlementId/history/summary');

      const req = mockReq({ settlementId: 'settlement-1' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body.totalEvents).toBe(2);
      expect(res.body.minYear).toBe(1850);
      expect(res.body.maxYear).toBe(1855);
      expect(res.body.byCategory).toEqual({ demographic: 1, governance: 1 });
      expect(res.body.byEventType).toEqual({ population_change: 1, mayor_change: 1 });
      expect(res.body.bySignificance).toEqual({ minor: 1, major: 1 });
    });

    it('returns null years when no events have years', async () => {
      const storage = createMockStorage([]);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'get', '/settlements/:settlementId/history/summary');

      const req = mockReq({ settlementId: 'settlement-99' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body.totalEvents).toBe(0);
      expect(res.body.minYear).toBeNull();
      expect(res.body.maxYear).toBeNull();
    });
  });

  describe('POST /settlements/:settlementId/history', () => {
    it('creates a history event', async () => {
      const storage = createMockStorage([]);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'post', '/settlements/:settlementId/history');

      const req = mockReq(
        { settlementId: 'settlement-1' },
        {},
        {
          worldId: 'world-1',
          eventType: 'population_change',
          category: 'demographic',
          year: 1860,
          description: 'Population increased to 200',
          previousValue: { population: 150 },
          newValue: { population: 200 },
        }
      );
      const res = mockRes();
      await handler(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body.id).toBe('evt-1');
      expect(res.body.settlementId).toBe('settlement-1');
      expect(res.body.eventType).toBe('population_change');
    });

    it('rejects missing required fields', async () => {
      const storage = createMockStorage([]);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'post', '/settlements/:settlementId/history');

      const req = mockReq(
        { settlementId: 'settlement-1' },
        {},
        { worldId: 'world-1' } // missing eventType, category, description
      );
      const res = mockRes();
      await handler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Missing required fields');
    });
  });

  describe('DELETE /settlement-history/:id', () => {
    it('deletes an existing history event', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'delete', '/settlement-history/:id');

      const req = mockReq({ id: 'evt-1' });
      const res = mockRes();
      await handler(req, res);

      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent event', async () => {
      const storage = createMockStorage(sampleEvents);
      const router = createSettlementHistoryRoutes(storage);
      const handler = getRouteHandler(router, 'delete', '/settlement-history/:id');

      const req = mockReq({ id: 'non-existent' });
      const res = mockRes();
      await handler(req, res);

      expect(res.statusCode).toBe(404);
    });
  });
});

// Helper to extract route handler from Express router
function getRouteHandler(router: any, method: string, path: string): Function {
  const layer = router.stack.find((l: any) =>
    l.route?.path === path && l.route?.methods[method]
  );
  if (!layer) {
    throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
  }
  return layer.route.stack[0].handle;
}
