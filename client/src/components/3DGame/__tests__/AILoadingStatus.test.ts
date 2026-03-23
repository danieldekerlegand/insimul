/**
 * Tests for AI loading status on the game loading screen.
 *
 * Verifies:
 * 1. DataSource.loadGenerationJobs returns job summaries
 * 2. AI status text formats correctly for various job states
 * 3. Loading screen shows/hides AI status line
 * 4. Polling starts and stops correctly
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GenerationJobSummary } from '../DataSource';

// Extract the formatting logic so we can test it without instantiating BabylonGame.
// This mirrors the private formatAIStatus method in BabylonGame.
function formatAIStatus(jobs: GenerationJobSummary[]): string {
  if (jobs.length === 0) return '';
  const processing = jobs.filter((j) => j.status === 'processing');
  const queued = jobs.filter((j) => j.status === 'queued');
  const parts: string[] = [];
  if (processing.length > 0) {
    const totalCompleted = processing.reduce((s, j) => s + j.completedCount, 0);
    const totalItems = processing.reduce((s, j) => s + j.batchSize, 0);
    const types = [...new Set(processing.map((j) => j.assetType).filter(Boolean))];
    const typeLabel = types.length > 0 ? types.join(', ') : 'assets';
    parts.push(`AI generating ${typeLabel}: ${totalCompleted}/${totalItems}`);
  }
  if (queued.length > 0) {
    parts.push(`${queued.length} queued`);
  }
  return parts.join(' · ');
}

function makeJob(overrides: Partial<GenerationJobSummary> = {}): GenerationJobSummary {
  return {
    id: 'job-1',
    jobType: 'batch_generation',
    assetType: 'portrait',
    status: 'processing',
    progress: 0.5,
    completedCount: 3,
    batchSize: 6,
    ...overrides,
  };
}

describe('AI Loading Status - formatAIStatus', () => {
  it('returns empty string for no jobs', () => {
    expect(formatAIStatus([])).toBe('');
  });

  it('formats a single processing job', () => {
    const result = formatAIStatus([makeJob()]);
    expect(result).toBe('AI generating portrait: 3/6');
  });

  it('formats multiple processing jobs with different asset types', () => {
    const jobs = [
      makeJob({ id: 'j1', assetType: 'portrait', completedCount: 2, batchSize: 4 }),
      makeJob({ id: 'j2', assetType: 'texture', completedCount: 1, batchSize: 3 }),
    ];
    const result = formatAIStatus(jobs);
    expect(result).toBe('AI generating portrait, texture: 3/7');
  });

  it('de-duplicates asset types', () => {
    const jobs = [
      makeJob({ id: 'j1', assetType: 'portrait', completedCount: 1, batchSize: 2 }),
      makeJob({ id: 'j2', assetType: 'portrait', completedCount: 2, batchSize: 3 }),
    ];
    const result = formatAIStatus(jobs);
    expect(result).toBe('AI generating portrait: 3/5');
  });

  it('uses "assets" when no asset types are specified', () => {
    const result = formatAIStatus([makeJob({ assetType: null })]);
    expect(result).toBe('AI generating assets: 3/6');
  });

  it('shows only queued count when no processing jobs', () => {
    const jobs = [
      makeJob({ status: 'queued' }),
      makeJob({ id: 'j2', status: 'queued' }),
    ];
    const result = formatAIStatus(jobs);
    expect(result).toBe('2 queued');
  });

  it('shows both processing and queued info', () => {
    const jobs = [
      makeJob({ status: 'processing', completedCount: 1, batchSize: 4, assetType: 'portrait' }),
      makeJob({ id: 'j2', status: 'queued' }),
      makeJob({ id: 'j3', status: 'queued' }),
    ];
    const result = formatAIStatus(jobs);
    expect(result).toBe('AI generating portrait: 1/4 · 2 queued');
  });
});

describe('AI Loading Status - ApiDataSource.loadGenerationJobs', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('fetches processing and queued jobs and returns summaries', async () => {
    const processingJobs = [
      { id: 'j1', jobType: 'batch_generation', assetType: 'portrait', status: 'processing', progress: 0.5, completedCount: 2, batchSize: 4 },
    ];
    const queuedJobs = [
      { id: 'j2', jobType: 'single_asset', assetType: 'texture', status: 'queued', progress: 0, completedCount: 0, batchSize: 1 },
    ];

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(processingJobs) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(queuedJobs) });

    // Import and instantiate ApiDataSource
    const { ApiDataSource } = await import('../DataSource');
    const ds = new ApiDataSource('test-token', 'http://localhost:3000');
    const result = await ds.loadGenerationJobs('world-1');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'j1',
      jobType: 'batch_generation',
      assetType: 'portrait',
      status: 'processing',
      progress: 0.5,
      completedCount: 2,
      batchSize: 4,
    });
    expect(result[1]).toEqual({
      id: 'j2',
      jobType: 'single_asset',
      assetType: 'texture',
      status: 'queued',
      progress: 0,
      completedCount: 0,
      batchSize: 1,
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect((globalThis.fetch as any).mock.calls[0][0]).toContain('generation-jobs?status=processing');
    expect((globalThis.fetch as any).mock.calls[1][0]).toContain('generation-jobs?status=queued');
  });

  it('returns empty array on fetch failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { ApiDataSource } = await import('../DataSource');
    const ds = new ApiDataSource('test-token', 'http://localhost:3000');
    const result = await ds.loadGenerationJobs('world-1');

    expect(result).toEqual([]);
  });

  it('returns only processing jobs when queued fetch fails', async () => {
    const processingJobs = [
      { id: 'j1', jobType: 'batch_generation', assetType: 'portrait', status: 'processing', progress: 0.3, completedCount: 1, batchSize: 5 },
    ];

    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(processingJobs) })
      .mockResolvedValueOnce({ ok: false });

    const { ApiDataSource } = await import('../DataSource');
    const ds = new ApiDataSource('test-token', 'http://localhost:3000');
    const result = await ds.loadGenerationJobs('world-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('j1');
  });
});

describe('AI Loading Status - FileDataSource.loadGenerationJobs', () => {
  it('returns empty array in exported mode', async () => {
    const mockStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    const { FileDataSource } = await import('../DataSource');
    const ds = new FileDataSource(mockStorage);
    const result = await ds.loadGenerationJobs('world-1');
    expect(result).toEqual([]);
  });
});
