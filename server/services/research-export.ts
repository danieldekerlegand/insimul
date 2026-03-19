import { storage } from '../db/storage';
import { ResearchAnonymizer, ANONYMIZATION_CONFIGS } from './research-anonymizer';
import type {
  Character,
  Playthrough,
  PlaythroughDelta,
  PlayTrace,
  Reputation,
} from '@shared/schema';
import { getPlaythroughReputations } from './reputation-service';

export type ResearchExportFormat = 'json' | 'csv';

export interface ResearchExportOptions {
  worldId: string;
  format?: ResearchExportFormat;
  /** Include character personality/demographic data */
  includeCharacters?: boolean;
  /** Include detailed action traces */
  includeTraces?: boolean;
  /** Include playthrough deltas */
  includeDeltas?: boolean;
  /** Include reputation data */
  includeReputations?: boolean;
  /** Pre-configured anonymizer (for testing) — otherwise one is created automatically */
  anonymizer?: ResearchAnonymizer;
}

export interface ResearchExportResult {
  format: ResearchExportFormat;
  exportedAt: string;
  anonymizationSalt: string;
  worldId: string;
  data: ResearchExportData;
}

export interface ResearchExportData {
  playthroughs: Record<string, any>[];
  traces: Record<string, any>[];
  characters: Record<string, any>[];
  deltas: Record<string, any>[];
  reputations: Record<string, any>[];
}

/**
 * Export research data for a world with anonymization applied.
 * All IDs are deterministically hashed and names are replaced with participant labels.
 */
export async function exportResearchData(
  options: ResearchExportOptions
): Promise<ResearchExportResult> {
  const {
    worldId,
    format = 'json',
    includeCharacters = true,
    includeTraces = true,
    includeDeltas = false,
    includeReputations = true,
  } = options;

  const world = await storage.getWorld(worldId);
  if (!world) {
    throw new Error('World not found');
  }

  const anonymizer = options.anonymizer ?? new ResearchAnonymizer();

  // Fetch all playthroughs for this world
  const playthroughs = await storage.getPlaythroughsByWorld(worldId);

  // Fetch parallel data for all playthroughs
  const [allTraces, allDeltas, allReputations] = await Promise.all([
    includeTraces
      ? Promise.all(playthroughs.map((p) => storage.getTracesByPlaythrough(p.id)))
      : Promise.resolve([]),
    includeDeltas
      ? Promise.all(playthroughs.map((p) => storage.getDeltasByPlaythrough(p.id)))
      : Promise.resolve([]),
    includeReputations
      ? Promise.all(playthroughs.map((p) => getPlaythroughReputations(p.id)))
      : Promise.resolve([]),
  ]);

  const traces = allTraces.flat();
  const deltas = allDeltas.flat();
  const reps = allReputations.flat();

  // Fetch characters if requested
  const characters = includeCharacters
    ? await storage.getCharactersByWorld(worldId)
    : [];

  // Anonymize everything
  const anonPlaythroughs = playthroughs.map((p) =>
    anonymizer.anonymizeRecord(p as Record<string, any>, ANONYMIZATION_CONFIGS.playthrough)
  );
  const anonTraces = traces.map((t) =>
    anonymizer.anonymizeRecord(t as Record<string, any>, ANONYMIZATION_CONFIGS.trace)
  );
  const anonDeltas = deltas.map((d) =>
    anonymizer.anonymizeRecord(d as Record<string, any>, ANONYMIZATION_CONFIGS.delta)
  );
  const anonReps = reps.map((r) =>
    anonymizer.anonymizeRecord(r as Record<string, any>, ANONYMIZATION_CONFIGS.reputation)
  );
  const anonCharacters = characters.map((c) =>
    anonymizer.anonymizeRecord(c as Record<string, any>, ANONYMIZATION_CONFIGS.character)
  );

  return {
    format,
    exportedAt: new Date().toISOString(),
    anonymizationSalt: anonymizer.getSalt(),
    worldId: anonymizer.anonymizeId(worldId),
    data: {
      playthroughs: anonPlaythroughs,
      traces: anonTraces,
      characters: anonCharacters,
      deltas: anonDeltas,
      reputations: anonReps,
    },
  };
}

/**
 * Convert research export data to CSV format.
 * Returns a map of dataset name → CSV string.
 */
export function researchDataToCsv(data: ResearchExportData): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, rows] of Object.entries(data)) {
    if (rows.length === 0) {
      result[key] = '';
      continue;
    }
    result[key] = arrayToCsv(rows);
  }

  return result;
}

function arrayToCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';

  // Collect all keys across all rows for consistent columns
  const keySet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      keySet.add(key);
    }
  }
  const headers = Array.from(keySet);

  const csvRows = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return csvEscape(JSON.stringify(val));
      return csvEscape(String(val));
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
