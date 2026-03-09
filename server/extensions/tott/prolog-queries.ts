/**
 * Prolog Query Helpers for TotT Systems
 *
 * Provides Prolog-backed queries that TotT systems can use to augment
 * their TypeScript logic. All queries gracefully degrade — if Prolog
 * fails or hasn't been initialized, they return null/default values
 * so the calling system's original logic is used instead.
 */

import { prologAutoSync } from '../../engines/prolog/prolog-auto-sync';

function sanitize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
}

// ── Hiring System Queries ──────────────────────────────────────────────────

/**
 * Check if a candidate is qualified for a job via Prolog.
 * Returns null if Prolog can't answer (caller uses JS fallback).
 */
export async function prologQualifiedForJob(
  worldId: string,
  candidateId: string,
  vocation: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `qualified_for_job(${sanitize(candidateId)}, ${sanitize(vocation)}, _)`
    );
    return result !== null;
  } catch {
    return null;
  }
}

/**
 * Get candidate score from Prolog.
 * Returns null if not available.
 */
export async function prologCandidateScore(
  worldId: string,
  candidateId: string,
  vocation: string
): Promise<number | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `candidate_score(${sanitize(candidateId)}, ${sanitize(vocation)}, Score)`
    );
    if (result && (result as any).Score !== undefined) {
      return Number((result as any).Score);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a character can be hired (employable) via Prolog.
 */
export async function prologCanBeHired(
  worldId: string,
  characterId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(`can_be_hired(${sanitize(characterId)})`);
    return result !== null;
  } catch {
    return null;
  }
}

// ── Social Dynamics Queries ────────────────────────────────────────────────

/**
 * Check compatibility between two characters via Prolog.
 */
export async function prologCompatibility(
  worldId: string,
  char1Id: string,
  char2Id: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `compatible(${sanitize(char1Id)}, ${sanitize(char2Id)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

/**
 * Check if character should socialize via Prolog.
 */
export async function prologShouldSocialize(
  worldId: string,
  characterId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `should_socialize(${sanitize(characterId)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

/**
 * Check if two characters would befriend each other.
 */
export async function prologWillBefriend(
  worldId: string,
  char1Id: string,
  char2Id: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `will_befriend(${sanitize(char1Id)}, ${sanitize(char2Id)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

// ── Economics Queries ───────────────────────────────────────────────────────

/**
 * Check if a character can afford a given amount.
 */
export async function prologCanAfford(
  worldId: string,
  characterId: string,
  amount: number
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `can_afford(${sanitize(characterId)}, ${amount})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

/**
 * Check if a character is wealthy via Prolog.
 */
export async function prologIsWealthy(
  worldId: string,
  characterId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `is_wealthy(${sanitize(characterId)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

// ── Lifecycle Queries ──────────────────────────────────────────────────────

/**
 * Check if two characters can marry via Prolog.
 */
export async function prologCanMarry(
  worldId: string,
  person1Id: string,
  person2Id: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `can_marry(${sanitize(person1Id)}, ${sanitize(person2Id)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

/**
 * Check if a character can conceive via Prolog.
 */
export async function prologCanConceive(
  worldId: string,
  characterId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `can_conceive(${sanitize(characterId)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

/**
 * Check if a character is school age via Prolog.
 */
export async function prologIsSchoolAge(
  worldId: string,
  characterId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `school_age(${sanitize(characterId)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

/**
 * Get death risk level for a character via Prolog.
 * Returns 'low', 'medium', 'high', 'very_high', 'critical', or null.
 */
export async function prologDeathRisk(
  worldId: string,
  characterId: string
): Promise<string | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `death_risk(${sanitize(characterId)}, Level)`
    );
    if (result && (result as any).Level) {
      return String((result as any).Level);
    }
    return null;
  } catch {
    return null;
  }
}

// ── Knowledge System Queries ───────────────────────────────────────────────

/**
 * Check if observer knows a fact about subject via Prolog.
 */
export async function prologKnows(
  worldId: string,
  observerId: string,
  subjectId: string,
  fact: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `knows(${sanitize(observerId)}, ${sanitize(subjectId)}, ${sanitize(fact)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

/**
 * Check if observer believes something about subject via Prolog.
 */
export async function prologBelieves(
  worldId: string,
  observerId: string,
  subjectId: string,
  quality: string
): Promise<{ confidence: number } | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `believes(${sanitize(observerId)}, ${sanitize(subjectId)}, ${sanitize(quality)}, Confidence)`
    );
    if (result && (result as any).Confidence !== undefined) {
      return { confidence: Number((result as any).Confidence) };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if knowledge should propagate between two characters.
 */
export async function prologShouldPropagate(
  worldId: string,
  speakerId: string,
  listenerId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `should_propagate(${sanitize(speakerId)}, ${sanitize(listenerId)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

// ── Education Queries ────────────────────────────────────────────────────

/**
 * Check if a character is eligible for a given education level via Prolog.
 */
export async function prologEducationEligible(
  worldId: string,
  characterId: string,
  level: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `education_eligible(${sanitize(characterId)}, ${sanitize(level)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

// ── Business Queries ─────────────────────────────────────────────────────

/**
 * Check if a character owns a business via Prolog.
 */
export async function prologBusinessOwner(
  worldId: string,
  characterId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `owns(${sanitize(characterId)}, _)`
    );
    return result !== null;
  } catch {
    return null;
  }
}

/**
 * Check if a character can found a business via Prolog.
 */
export async function prologCanFoundBusiness(
  worldId: string,
  characterId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `can_found_business(${sanitize(characterId)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

// ── Grieving Queries ─────────────────────────────────────────────────────

/**
 * Check if a character is grieving via Prolog.
 */
export async function prologGrieving(
  worldId: string,
  characterId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `grieving(${sanitize(characterId)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

// ── Routine Queries ──────────────────────────────────────────────────────

/**
 * Query a character's routine location for a time of day via Prolog.
 * Returns the location string or null.
 */
export async function prologRoutine(
  worldId: string,
  characterId: string,
  timeOfDay: string
): Promise<string | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `routine(${sanitize(characterId)}, ${sanitize(timeOfDay)}, Location)`
    );
    if (result && (result as any).Location !== undefined) {
      return String((result as any).Location);
    }
    return null;
  } catch {
    return null;
  }
}

// ── Sexuality Queries ────────────────────────────────────────────────────

/**
 * Check if char1 has attraction to char2 via Prolog.
 */
export async function prologHasAttraction(
  worldId: string,
  char1Id: string,
  char2Id: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `attraction(${sanitize(char1Id)}, ${sanitize(char2Id)})`
    );
    return result !== null;
  } catch {
    return null;
  }
}

// ── Drama Queries ────────────────────────────────────────────────────────

/**
 * Query dramatic tension type between two characters via Prolog.
 * Returns the tension type string or null.
 */
export async function prologDramaticTension(
  worldId: string,
  char1Id: string,
  char2Id: string
): Promise<string | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `dramatic_tension(${sanitize(char1Id)}, ${sanitize(char2Id)}, Type)`
    );
    if (result && (result as any).Type !== undefined) {
      return String((result as any).Type);
    }
    return null;
  } catch {
    return null;
  }
}

// ── Governance Queries ──────────────────────────────────────────────────

/**
 * Check if a character violates a specific law via Prolog.
 * Returns null if Prolog can't answer (caller uses fallback).
 */
export async function prologViolatesLaw(
  worldId: string,
  characterId: string,
  lawId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `violates_law(${sanitize(characterId)}, ${sanitize(lawId)})`
    );
    return result;
  } catch {
    return null;
  }
}

/**
 * Check if a character has authority over another via Prolog.
 * Uses has_authority_over/2 from governance meta-predicates.
 */
export async function prologHasAuthority(
  worldId: string,
  charId: string,
  targetId: string
): Promise<boolean | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.queryOnce(
      `has_authority_over(${sanitize(charId)}, ${sanitize(targetId)})`
    );
    return result;
  } catch {
    return null;
  }
}

/**
 * Query the tax amount owed by a character via Prolog.
 * Returns the numeric amount or null if not available.
 */
export async function prologTaxOwed(
  worldId: string,
  charId: string
): Promise<number | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.query(
      `tax_owed(${sanitize(charId)}, Amount)`, 1
    );
    if (result.success && result.bindings.length > 0 && result.bindings[0].Amount != null) {
      return Number(result.bindings[0].Amount);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Query the rights of a citizen via Prolog.
 * Returns an array of right atoms (e.g. ['vote', 'trade']) or null.
 */
export async function prologCitizenRights(
  worldId: string,
  charId: string
): Promise<string[] | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    const result = await engine.query(
      `citizen_rights(${sanitize(charId)}, Rights)`, 10
    );
    if (result.success && result.bindings.length > 0) {
      return result.bindings
        .map(b => b.Rights != null ? String(b.Rights) : null)
        .filter((r): r is string => r !== null);
    }
    return null;
  } catch {
    return null;
  }
}

// ── Fact Management ──────────────────────────────────────────────────────

/**
 * Assert a fact into the world's Prolog knowledge base.
 */
export async function prologAssertFact(
  worldId: string,
  fact: string
): Promise<void> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    await engine.assertFact(fact);
  } catch {
    // non-fatal
  }
}

/**
 * Retract a fact from the world's Prolog knowledge base.
 */
export async function prologRetractFact(
  worldId: string,
  fact: string
): Promise<void> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    await engine.retractFact(fact);
  } catch {
    // non-fatal
  }
}
