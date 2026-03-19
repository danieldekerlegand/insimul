import crypto from 'crypto';

/**
 * Deterministic anonymization for research data export.
 * Uses HMAC-SHA256 with a per-export salt so the same ID always maps
 * to the same anonymous ID within one export, but differs across exports.
 */
export class ResearchAnonymizer {
  private salt: string;
  private nameCounter = 0;
  private nameCache = new Map<string, string>();

  constructor(salt?: string) {
    this.salt = salt ?? crypto.randomBytes(16).toString('hex');
  }

  getSalt(): string {
    return this.salt;
  }

  /** Deterministic hash of an ID — same input always yields same output within this export */
  anonymizeId(id: string): string {
    return crypto.createHmac('sha256', this.salt).update(id).digest('hex').slice(0, 16);
  }

  /** Replace a name with a stable anonymous label (e.g., "Participant_001") */
  anonymizeName(name: string): string {
    if (!name) return '';
    const cached = this.nameCache.get(name);
    if (cached) return cached;
    this.nameCounter++;
    const anon = `Participant_${String(this.nameCounter).padStart(3, '0')}`;
    this.nameCache.set(name, anon);
    return anon;
  }

  /** Deep-clone an object and replace known PII fields */
  anonymizeRecord<T extends Record<string, any>>(
    record: T,
    config: AnonymizationConfig
  ): T {
    const clone = JSON.parse(JSON.stringify(record)) as T;

    for (const field of config.idFields ?? []) {
      if (clone[field]) {
        (clone as any)[field] = this.anonymizeId(clone[field]);
      }
    }

    for (const field of config.nameFields ?? []) {
      if (clone[field]) {
        (clone as any)[field] = this.anonymizeName(clone[field]);
      }
    }

    for (const field of config.removeFields ?? []) {
      delete (clone as any)[field];
    }

    for (const field of config.idArrayFields ?? []) {
      if (Array.isArray(clone[field])) {
        (clone as any)[field] = (clone[field] as string[]).map((id) =>
          this.anonymizeId(id)
        );
      }
    }

    return clone;
  }
}

export interface AnonymizationConfig {
  idFields?: string[];
  nameFields?: string[];
  removeFields?: string[];
  idArrayFields?: string[];
}

/** Field configs for each entity type */
export const ANONYMIZATION_CONFIGS = {
  character: {
    idFields: ['id', 'worldId', 'spouseId', 'currentOccupationId', 'currentResidenceId'],
    nameFields: ['firstName', 'lastName', 'middleName', 'maidenName'],
    removeFields: ['genealogyData', 'mentalModels', 'thoughts'],
    idArrayFields: ['coworkerIds', 'friendIds', 'neighborIds', 'immediateFamilyIds', 'extendedFamilyIds', 'parentIds', 'childIds'],
  },
  playthrough: {
    idFields: ['id', 'userId', 'worldId', 'playerCharacterId'],
    nameFields: [] as string[],
    removeFields: ['saveData'],
  },
  trace: {
    idFields: ['id', 'playthroughId', 'userId', 'characterId', 'targetId', 'locationId'],
    nameFields: [] as string[],
    removeFields: [] as string[],
  },
  delta: {
    idFields: ['id', 'playthroughId', 'entityId'],
    nameFields: [] as string[],
    removeFields: [] as string[],
  },
  reputation: {
    idFields: ['id', 'playthroughId', 'userId', 'entityId'],
    nameFields: [] as string[],
    removeFields: ['notes'],
  },
  session: {
    idFields: ['id', 'userId', 'worldId', 'playthroughId'],
    nameFields: [] as string[],
    removeFields: ['sessionData'],
  },
} as const satisfies Record<string, AnonymizationConfig>;
