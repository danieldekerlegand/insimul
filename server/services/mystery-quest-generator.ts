/**
 * Mystery Quest Generator using Abductive Reasoning
 *
 * Phase 13: Generates mystery/detective quests by querying the Prolog
 * knowledge base for suspects, motives, evidence, and clues using the
 * abductive reasoning predicates defined in advanced-predicates.ts.
 *
 * Uses tau-prolog through prologAutoSync to:
 *   - Find potential victims (characters with enemies or wealth)
 *   - Identify suspects via suspect_for/2
 *   - Infer motives via infer_motive/3 (jealousy, revenge, greed, power)
 *   - Determine prime suspect via prime_suspect/2
 *   - Generate clues via clue_leads_to/2
 *   - Add red herrings via red_herring/2
 */

import { prologAutoSync } from '../engines/prolog/prolog-auto-sync';
import { storage } from '../db/storage';

// ── Types ───────────────────────────────────────────────────────────────────

export interface MysteryQuest {
  title: string;
  description: string;
  victim: string;
  suspects: Array<{
    characterId: string;
    motive: string;
    evidenceCount: number;
    isPrimeSuspect: boolean;
  }>;
  clues: Array<{
    description: string;
    leadsTo: string;
    isRedHerring: boolean;
  }>;
  solution: string;
  objectives: Array<{
    type: string;
    target: string;
    description: string;
  }>;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sanitize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^([0-9])/, '_$1')
    .replace(/_+/g, '_')
    .replace(/_$/, '');
}

const CRIME_TYPES = ['murder', 'theft', 'arson', 'kidnapping', 'fraud'];
const MOTIVE_LABELS: Record<string, string> = {
  jealousy: 'consumed by jealousy',
  revenge: 'seeking revenge',
  greed: 'driven by greed',
  power: 'hungry for power',
};

// ── Generator ───────────────────────────────────────────────────────────────

export async function generateMysteryQuest(
  worldId: string,
  options?: {
    victimId?: string;
    crimeType?: string;
  }
): Promise<MysteryQuest | null> {
  try {
    const engine = prologAutoSync.getEngine(worldId);
    if (!engine) return null;

    // Ensure the world is initialized in Prolog
    if (!prologAutoSync.isWorldSynced(worldId)) {
      return null;
    }

    const crimeType = options?.crimeType || CRIME_TYPES[Math.floor(Math.random() * CRIME_TYPES.length)];

    // ── 1. Find or validate victim ────────────────────────────────────────

    let victimAtom: string | null = null;
    let victimName = 'Unknown';

    if (options?.victimId) {
      // Use specified victim
      const victim = await storage.getCharacter(options.victimId);
      if (!victim) return null;
      victimAtom = sanitize(`${victim.firstName}_${victim.lastName}_${victim.id}`);
      victimName = `${victim.firstName} ${victim.lastName}`;
    } else {
      // Query Prolog for characters who have enemies (potential victims)
      const enemyResult = await engine.query('enemies(_, Victim)', 10);
      const wealthResult = await engine.query('wealth(Victim, W)', 10);

      // Collect potential victim atoms
      const potentialVictims = new Set<string>();
      if (enemyResult.success) {
        for (const b of enemyResult.bindings) {
          if (b.Victim) potentialVictims.add(String(b.Victim));
        }
      }
      if (wealthResult.success) {
        for (const b of wealthResult.bindings) {
          if (b.Victim && Number(b.W) > 1000) potentialVictims.add(String(b.Victim));
        }
      }

      // Fallback: any person
      if (potentialVictims.size === 0) {
        const personResult = await engine.query('person(P)', 20);
        if (personResult.success) {
          for (const b of personResult.bindings) {
            if (b.P) potentialVictims.add(String(b.P));
          }
        }
      }

      if (potentialVictims.size === 0) return null;

      const victims = Array.from(potentialVictims);
      victimAtom = victims[Math.floor(Math.random() * victims.length)];
    }

    if (!victimAtom) return null;

    // Try to resolve victim's display name
    const nameResult = await engine.query(`full_name(${victimAtom}, Name)`, 1);
    if (nameResult.success && nameResult.bindings.length > 0 && nameResult.bindings[0].Name) {
      victimName = String(nameResult.bindings[0].Name).replace(/'/g, '');
    }

    // ── 2. Assert crime fact so Prolog rules can fire ─────────────────────

    const crimeId = sanitize(`crime_${Date.now()}`);
    // Assert the crime and mystery facts
    await engine.assertFacts([
      `crime(${crimeId}, ${victimAtom}, ${sanitize(crimeType)})`,
      `mystery(${crimeId}, ${crimeId})`,
    ]);

    // ── 3. Find suspects via suspect_for/2 ────────────────────────────────

    const suspectsResult = await engine.query(`suspect_for(Person, ${crimeId})`, 20);
    const suspectAtoms: string[] = [];
    if (suspectsResult.success) {
      for (const b of suspectsResult.bindings) {
        if (b.Person) suspectAtoms.push(String(b.Person));
      }
    }

    // If no suspects from rules, find characters with relationships to victim
    if (suspectAtoms.length === 0) {
      const nearbyResult = await engine.query(`same_location(${victimAtom}, Person)`, 10);
      if (nearbyResult.success) {
        for (const b of nearbyResult.bindings) {
          if (b.Person) suspectAtoms.push(String(b.Person));
        }
      }
    }

    // Need at least one suspect to generate a mystery
    if (suspectAtoms.length === 0) {
      // Clean up asserted facts
      await engine.retractFact(`crime(${crimeId}, ${victimAtom}, ${sanitize(crimeType)})`);
      await engine.retractFact(`mystery(${crimeId}, ${crimeId})`);
      return null;
    }

    // ── 4. Determine motives for each suspect ─────────────────────────────

    const suspects: MysteryQuest['suspects'] = [];

    for (const suspectAtom of suspectAtoms) {
      // Query infer_motive/3
      const motiveResult = await engine.query(
        `infer_motive(${suspectAtom}, ${crimeId}, Motive)`,
        5
      );

      let motive = 'unknown';
      if (motiveResult.success && motiveResult.bindings.length > 0 && motiveResult.bindings[0].Motive) {
        motive = String(motiveResult.bindings[0].Motive);
      }

      // Query evidence_weight/3
      const weightResult = await engine.query(
        `evidence_weight(${suspectAtom}, ${crimeId}, Weight)`,
        1
      );
      let evidenceCount = 0;
      if (weightResult.success && weightResult.bindings.length > 0 && weightResult.bindings[0].Weight != null) {
        evidenceCount = Math.max(0, Number(weightResult.bindings[0].Weight));
      }

      // Query prime_suspect/2
      const primeResult = await engine.queryOnce(
        `prime_suspect(${suspectAtom}, ${crimeId})`
      );

      // Resolve suspect name
      let suspectName = suspectAtom;
      const sNameResult = await engine.query(`full_name(${suspectAtom}, Name)`, 1);
      if (sNameResult.success && sNameResult.bindings.length > 0 && sNameResult.bindings[0].Name) {
        suspectName = String(sNameResult.bindings[0].Name).replace(/'/g, '');
      }

      suspects.push({
        characterId: suspectName,
        motive: MOTIVE_LABELS[motive] || motive,
        evidenceCount,
        isPrimeSuspect: primeResult === true,
      });
    }

    // ── 5. Generate clues ─────────────────────────────────────────────────

    const clues: MysteryQuest['clues'] = [];

    // Query clue_leads_to/2 for real clues
    const clueResult = await engine.query(`clue_leads_to(Clue, Person)`, 20);
    if (clueResult.success) {
      for (const b of clueResult.bindings) {
        if (b.Clue && b.Person) {
          clues.push({
            description: `Clue found: ${String(b.Clue)}`,
            leadsTo: String(b.Person),
            isRedHerring: false,
          });
        }
      }
    }

    // ── 6. Add red herrings ───────────────────────────────────────────────

    const herringResult = await engine.query(`red_herring(Person, ${crimeId})`, 5);
    if (herringResult.success) {
      for (const b of herringResult.bindings) {
        if (b.Person) {
          const herringName = String(b.Person);
          clues.push({
            description: `Suspicious activity by ${herringName}`,
            leadsTo: herringName,
            isRedHerring: true,
          });
        }
      }
    }

    // If no clues generated from Prolog, create procedural ones from suspects
    if (clues.length === 0) {
      for (const suspect of suspects) {
        clues.push({
          description: `Witnesses say ${suspect.characterId} was seen near the scene`,
          leadsTo: suspect.characterId,
          isRedHerring: !suspect.isPrimeSuspect && suspect.evidenceCount <= 0,
        });
      }
    }

    // ── 7. Determine solution ─────────────────────────────────────────────

    const primeSuspect = suspects.find(s => s.isPrimeSuspect);
    const solution = primeSuspect
      ? `${primeSuspect.characterId} committed the ${crimeType}, ${primeSuspect.motive}.`
      : suspects.length > 0
        ? `${suspects[0].characterId} is the most likely perpetrator of the ${crimeType}.`
        : `The ${crimeType} remains unsolved.`;

    // ── 8. Build objectives ───────────────────────────────────────────────

    const objectives: MysteryQuest['objectives'] = [];

    // Interview each suspect
    for (const suspect of suspects) {
      objectives.push({
        type: 'interview',
        target: suspect.characterId,
        description: `Interview ${suspect.characterId} about the ${crimeType}`,
      });
    }

    // Find evidence at locations
    const locationResult = await engine.query(`at_location(${victimAtom}, Location)`, 1);
    if (locationResult.success && locationResult.bindings.length > 0 && locationResult.bindings[0].Location) {
      const loc = String(locationResult.bindings[0].Location);
      objectives.push({
        type: 'investigate',
        target: loc,
        description: `Investigate the scene of the crime at ${loc}`,
      });
    }

    // Gather evidence
    objectives.push({
      type: 'collect_evidence',
      target: crimeId,
      description: `Gather enough evidence to identify the perpetrator`,
    });

    // Confront prime suspect
    if (primeSuspect) {
      objectives.push({
        type: 'confront',
        target: primeSuspect.characterId,
        description: `Confront ${primeSuspect.characterId} with the evidence`,
      });
    }

    // ── 9. Clean up temporary crime facts ─────────────────────────────────
    // Leave them in the KB so the quest can be re-queried during gameplay

    // ── 10. Build and return quest ────────────────────────────────────────

    const title = `The ${capitalise(crimeType)} of ${victimName}`;
    const description = `A ${crimeType} has been committed against ${victimName}. ` +
      `${suspects.length} suspect${suspects.length !== 1 ? 's' : ''} have been identified. ` +
      `Investigate the clues, interview the suspects, and bring the perpetrator to justice.`;

    return {
      title,
      description,
      victim: victimName,
      suspects,
      clues,
      solution,
      objectives,
    };
  } catch (error) {
    console.error('[MysteryQuestGenerator] Error generating mystery quest:', error);
    return null;
  }
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
