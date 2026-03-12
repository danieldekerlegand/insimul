/**
 * US-009: Integration test — telemetry batch upload with API key validation
 *
 * Tests the POST /external/telemetry/batch endpoint from telemetry-routes.ts.
 * Uses Express + createTelemetryRoutes with a mock storage object.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { type Express } from 'express';
import http from 'http';
import { createTelemetryRoutes } from '../routes/telemetry-routes';

// Lightweight request helper (no supertest dependency)
function request(app: Express) {
  const server = http.createServer(app);

  function makeRequest(method: string, path: string, body?: any, headers?: Record<string, string>): Promise<{ status: number; body: any }> {
    return new Promise((resolve, reject) => {
      server.listen(0, () => {
        const addr = server.address() as { port: number };
        const bodyStr = body ? JSON.stringify(body) : undefined;
        const reqHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...headers,
        };
        if (bodyStr) reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr).toString();

        const req = http.request(
          { hostname: '127.0.0.1', port: addr.port, path, method, headers: reqHeaders },
          (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              server.close();
              try {
                resolve({ status: res.statusCode!, body: JSON.parse(data) });
              } catch {
                resolve({ status: res.statusCode!, body: data });
              }
            });
          },
        );
        req.on('error', (err) => { server.close(); reject(err); });
        if (bodyStr) req.write(bodyStr);
        req.end();
      });
    });
  }

  return {
    post: (path: string, body?: any, headers?: Record<string, string>) => makeRequest('POST', path, body, headers),
  };
}

describe('External telemetry batch endpoint', () => {
  let mockStorage: Record<string, any>;
  let app: Express;

  beforeEach(() => {
    mockStorage = {
      validateApiKey: vi.fn(),
      createTelemetryBatch: vi.fn().mockResolvedValue(0),
      createEngagementBatch: vi.fn().mockResolvedValue(0),
    };
    app = express();
    app.use(express.json());
    app.use('/api', createTelemetryRoutes(mockStorage));
  });

  it('returns 401 when X-API-Key header is missing', async () => {
    const res = await request(app).post('/api/external/telemetry/batch', {
      telemetryEvents: [{ sessionId: 's1', metricType: 'fps', value: 60 }],
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Missing X-API-Key/i);
    expect(mockStorage.validateApiKey).not.toHaveBeenCalled();
  });

  it('returns 403 when API key is invalid', async () => {
    mockStorage.validateApiKey.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/external/telemetry/batch',
      { telemetryEvents: [{ sessionId: 's1', metricType: 'fps', value: 60 }] },
      { 'x-api-key': 'bad-key-123' },
    );

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Invalid or expired/i);
    expect(mockStorage.validateApiKey).toHaveBeenCalledWith('bad-key-123');
  });

  it('succeeds with valid API key and well-formed events', async () => {
    mockStorage.validateApiKey.mockResolvedValue({ worldId: 'w1', key: 'valid-key' });
    mockStorage.createTelemetryBatch.mockResolvedValue(2);
    mockStorage.createEngagementBatch.mockResolvedValue(1);

    const res = await request(app).post(
      '/api/external/telemetry/batch',
      {
        telemetryEvents: [
          { sessionId: 's1', metricType: 'fps', value: 60 },
          { sessionId: 's1', metricType: 'load_time', value: 1200 },
        ],
        engagementEvents: [
          { playerId: 'p1', eventType: 'quest_start', sessionId: 's1' },
        ],
      },
      { 'x-api-key': 'valid-key' },
    );

    expect(res.status).toBe(200);
    expect(res.body.telemetryInserted).toBe(2);
    expect(res.body.engagementInserted).toBe(1);
    expect(res.body.telemetryRejected).toBe(0);
    expect(res.body.engagementRejected).toBe(0);
    expect(res.body.rejectionReasons).toEqual([]);

    // Verify events were enriched with worldId and source
    const telemetryCall = mockStorage.createTelemetryBatch.mock.calls[0][0];
    expect(telemetryCall[0]).toMatchObject({ worldId: 'w1', source: 'external', sessionId: 's1' });

    const engagementCall = mockStorage.createEngagementBatch.mock.calls[0][0];
    expect(engagementCall[0]).toMatchObject({ worldId: 'w1', source: 'external', playerId: 'p1' });
  });

  it('accepts valid events and rejects malformed ones with rejection details', async () => {
    mockStorage.validateApiKey.mockResolvedValue({ worldId: 'w1', key: 'valid-key' });
    mockStorage.createTelemetryBatch.mockResolvedValue(1);
    mockStorage.createEngagementBatch.mockResolvedValue(1);

    const res = await request(app).post(
      '/api/external/telemetry/batch',
      {
        telemetryEvents: [
          { sessionId: 's1', metricType: 'fps', value: 60 },       // valid
          { metricType: 'fps' },                                      // missing sessionId
          { sessionId: 's2' },                                        // missing metricType
        ],
        engagementEvents: [
          { playerId: 'p1', eventType: 'quest_start' },              // valid
          { eventType: 'quest_end' },                                  // missing playerId
          { playerId: 'p2' },                                         // missing eventType
        ],
      },
      { 'x-api-key': 'valid-key' },
    );

    expect(res.status).toBe(200);
    expect(res.body.telemetryInserted).toBe(1);
    expect(res.body.telemetryRejected).toBe(2);
    expect(res.body.engagementInserted).toBe(1);
    expect(res.body.engagementRejected).toBe(2);
    expect(res.body.rejectionReasons).toHaveLength(4);
    expect(res.body.rejectionReasons[0]).toContain('telemetryEvents[1]');
    expect(res.body.rejectionReasons[1]).toContain('telemetryEvents[2]');
    expect(res.body.rejectionReasons[2]).toContain('engagementEvents[1]');
    expect(res.body.rejectionReasons[3]).toContain('engagementEvents[2]');
  });

  it('handles empty body gracefully with valid key', async () => {
    mockStorage.validateApiKey.mockResolvedValue({ worldId: 'w1', key: 'valid-key' });

    const res = await request(app).post(
      '/api/external/telemetry/batch',
      {},
      { 'x-api-key': 'valid-key' },
    );

    expect(res.status).toBe(200);
    expect(res.body.telemetryInserted).toBe(0);
    expect(res.body.engagementInserted).toBe(0);
    expect(res.body.rejectionReasons).toEqual([]);
  });
});
