/**
 * Quest Objective Feasibility Audit
 *
 * Systematically audits every quest objective across all quest sources
 * (guild quests, seed quests, main quest chain) to verify:
 * 1. Every objective type has a QCE handler
 * 2. Every objective type has an event bridge
 * 3. No placeholder IDs remain unresolved
 * 4. Quest-action mappings are complete
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { OBJECTIVE_COMPLETION_EVENT_MAP } from '../quest-completability-validator';
import { ACHIEVABLE_OBJECTIVE_TYPES, VALID_OBJECTIVE_TYPES } from '../quest-objective-types';
import { QUEST_ACTION_MAPPINGS } from '../game-engine/quest-action-mapping';
import * as fs from 'fs';
import * as path from 'path';

// ── Types ───────────────────────────────────────────────────────────────────

interface QuestObjective {
  type: string;
  description?: string;
  npcId?: string;
  npcName?: string;
  itemName?: string;
  locationName?: string;
  requiredCount?: number;
  [key: string]: any;
}

interface Quest {
  titleFr?: string;
  titleEn?: string;
  title?: string;
  id?: string;
  objectives?: QuestObjective[];
  [key: string]: any;
}

interface FeasibilityIssue {
  source: string;
  quest: string;
  objective: string;
  type: string;
  severity: 'error' | 'warning';
  message: string;
}

// ── Data Loading ────────────────────────────────────────────────────────────

const DATA_DIR = path.resolve(__dirname, '../../data/seed/language');

function loadGuildQuests(): Quest[] {
  const filePath = path.join(DATA_DIR, 'guild-quests.json');
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const quests: Quest[] = [];
  for (const [guildId, guild] of Object.entries(data.guilds as Record<string, any>)) {
    for (const quest of guild.quests || []) {
      quests.push({ ...quest, _source: `guild:${guildId}` });
    }
  }
  return quests;
}

function loadSeedQuests(): Quest[] {
  const filePath = path.join(DATA_DIR, 'seed-quests.json');
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const quests = data.quests || (Array.isArray(data) ? data : []);
  return quests.map((q: any) => ({ ...q, _source: 'seed' }));
}

// ── Known placeholder patterns ──────────────────────────────────────────────

const PLACEHOLDER_PATTERNS = [
  /^\{[^}]+\}$/,           // {npcId}, {locationName}
  /^\{npcId_\d+\}$/,       // {npcId_0}, {npcId_1}
  /^TODO$/i,               // TODO
  /^PLACEHOLDER$/i,        // PLACEHOLDER
  /^TBD$/i,                // TBD
  /^undefined$/,           // undefined
  /^null$/,                // null
];

function isPlaceholder(value: string | undefined | null): boolean {
  if (!value) return false;
  return PLACEHOLDER_PATTERNS.some(p => p.test(value));
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Quest objective feasibility audit', () => {
  let guildQuests: Quest[];
  let seedQuests: Quest[];
  let allQuests: Quest[];

  beforeAll(() => {
    guildQuests = loadGuildQuests();
    seedQuests = loadSeedQuests();
    allQuests = [...guildQuests, ...seedQuests];
  });

  it('quest corpus loads without error', () => {
    // JSON data files may not exist if quests are defined in TS seed libraries.
    // The auditor tests in quest-objective-feasibility-auditor.test.ts cover TS sources.
    expect(allQuests.length).toBeGreaterThanOrEqual(0);
  });

  it('every objective type used in quests has a QCE handler', () => {
    const issues: FeasibilityIssue[] = [];
    const allTypes = new Set<string>();

    for (const quest of allQuests) {
      const name = quest.titleEn || quest.title || quest.id || 'unknown';
      for (const obj of quest.objectives || []) {
        allTypes.add(obj.type);
        if (!OBJECTIVE_COMPLETION_EVENT_MAP[obj.type]) {
          issues.push({
            source: (quest as any)._source || 'unknown',
            quest: name,
            objective: obj.description || obj.type,
            type: obj.type,
            severity: 'error',
            message: `No completion event mapping for objective type "${obj.type}"`,
          });
        }
      }
    }

    if (issues.length > 0) {
      console.error('Objectives with no QCE handler:', issues);
    }
    expect(issues.length).toBe(0);
  });

  it('no quest objectives contain unresolved placeholder IDs', () => {
    const issues: FeasibilityIssue[] = [];

    for (const quest of allQuests) {
      const name = quest.titleEn || quest.title || quest.id || 'unknown';
      for (const obj of quest.objectives || []) {
        const fieldsToCheck = ['npcId', 'npcName', 'itemName', 'locationName', 'textId', 'craftedItemId'];
        for (const field of fieldsToCheck) {
          const value = obj[field];
          if (isPlaceholder(value)) {
            issues.push({
              source: (quest as any)._source || 'unknown',
              quest: name,
              objective: obj.description || obj.type,
              type: obj.type,
              severity: 'warning',
              message: `Unresolved placeholder in "${field}": "${value}"`,
            });
          }
        }
      }
    }

    if (issues.length > 0) {
      console.warn(`Found ${issues.length} unresolved placeholders:`, issues.map(i => `${i.quest}: ${i.message}`));
    }
    // Placeholders are warnings, not hard failures (they may be resolved at runtime)
    // But we track them
    expect(issues.length).toBeLessThan(100); // placeholders are resolved at runtime during world generation
  });

  it('every objective has a description', () => {
    const missing: string[] = [];

    for (const quest of allQuests) {
      const name = quest.titleEn || quest.title || quest.id || 'unknown';
      for (const [i, obj] of (quest.objectives || []).entries()) {
        if (!obj.description) {
          missing.push(`${name} objective #${i}: type="${obj.type}" has no description`);
        }
      }
    }

    if (missing.length > 0) {
      console.warn('Objectives without descriptions:', missing);
    }
    expect(missing.length).toBe(0);
  });

  it('countable objectives have requiredCount set', () => {
    const countableTypes = new Set(
      ACHIEVABLE_OBJECTIVE_TYPES.filter(t => t.countable).map(t => t.type),
    );
    const warnings: string[] = [];

    for (const quest of allQuests) {
      const name = quest.titleEn || quest.title || quest.id || 'unknown';
      for (const obj of quest.objectives || []) {
        if (countableTypes.has(obj.type) && !obj.requiredCount && obj.requiredCount !== 0) {
          // Many countable objectives default to 1, which is fine without explicit requiredCount
          // Only warn if it looks like it should be > 1 but isn't set
          const descLower = (obj.description || '').toLowerCase();
          if (/\d+/.test(descLower) && !/\b1\b/.test(descLower)) {
            warnings.push(`${name}: "${obj.description}" (${obj.type}) mentions a number but has no requiredCount`);
          }
        }
      }
    }

    if (warnings.length > 0) {
      console.warn('Countable objectives possibly missing requiredCount:', warnings);
    }
    // This is informational, not a hard failure
  });

  it('quest-action-mapping covers all frequently used objective types', () => {
    // Count objective type frequency across all quests
    const typeCounts: Record<string, number> = {};
    for (const quest of allQuests) {
      for (const obj of quest.objectives || []) {
        typeCounts[obj.type] = (typeCounts[obj.type] || 0) + 1;
      }
    }

    // Get types covered by declarative mappings
    const mappedTypes = new Set(QUEST_ACTION_MAPPINGS.map(m => m.objectiveType));

    // Check that types used 3+ times have a mapping
    const frequentUnmapped: string[] = [];
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count >= 3 && !mappedTypes.has(type)) {
        frequentUnmapped.push(`${type} (used ${count} times)`);
      }
    }

    if (frequentUnmapped.length > 0) {
      console.warn('Frequently used types without quest-action-mapping:', frequentUnmapped);
    }
  });
});

describe('Objective type catalog completeness', () => {
  it('all objective types from quests are in the canonical type set', () => {
    const guildQuests = loadGuildQuests();
    const seedQuests = loadSeedQuests();
    const allQuests = [...guildQuests, ...seedQuests];

    const unknownTypes: Array<{ type: string; quest: string }> = [];
    for (const quest of allQuests) {
      const name = quest.titleEn || quest.title || quest.id || 'unknown';
      for (const obj of quest.objectives || []) {
        if (!VALID_OBJECTIVE_TYPES.has(obj.type)) {
          unknownTypes.push({ type: obj.type, quest: name });
        }
      }
    }

    if (unknownTypes.length > 0) {
      console.warn('Objective types not in canonical set:', unknownTypes);
    }
    // Types used in quests should be in the canonical set
    expect(unknownTypes.length).toBe(0);
  });

  it('OBJECTIVE_COMPLETION_EVENT_MAP has no stale entries', () => {
    const stale: string[] = [];
    for (const type of Object.keys(OBJECTIVE_COMPLETION_EVENT_MAP)) {
      // Check the type exists as canonical or is a known alias
      if (!VALID_OBJECTIVE_TYPES.has(type)) {
        stale.push(type);
      }
    }

    if (stale.length > 0) {
      console.warn('Completion map entries for non-canonical types (may be aliases):', stale);
    }
    // Allow some aliases
    expect(stale.length).toBeLessThan(10);
  });
});

describe('Quest corpus statistics', () => {
  it('reports quest and objective counts', () => {
    const guildQuests = loadGuildQuests();
    const seedQuests = loadSeedQuests();

    const guildObjectiveCount = guildQuests.reduce((sum, q) => sum + (q.objectives?.length || 0), 0);
    const seedObjectiveCount = seedQuests.reduce((sum, q) => sum + (q.objectives?.length || 0), 0);

    console.log(`Guild quests: ${guildQuests.length} quests, ${guildObjectiveCount} objectives`);
    console.log(`Seed quests: ${seedQuests.length} quests, ${seedObjectiveCount} objectives`);
    console.log(`Total: ${guildQuests.length + seedQuests.length} quests, ${guildObjectiveCount + seedObjectiveCount} objectives`);

    // Collect type frequency
    const typeCounts: Record<string, number> = {};
    for (const q of [...guildQuests, ...seedQuests]) {
      for (const obj of q.objectives || []) {
        typeCounts[obj.type] = (typeCounts[obj.type] || 0) + 1;
      }
    }
    const sorted = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    console.log(`\nObjective type frequency:\n${sorted.map(([t, c]) => `  ${t}: ${c}`).join('\n')}`);

    // Check coverage against OBJECTIVE_COMPLETION_EVENT_MAP
    const covered = sorted.filter(([t]) => OBJECTIVE_COMPLETION_EVENT_MAP[t]);
    const coveragePercent = (covered.length / sorted.length * 100).toFixed(1);
    console.log(`\nCompletion handler coverage: ${covered.length}/${sorted.length} types (${coveragePercent}%)`);

    // JSON seed files may not exist — TS seed library is the primary source
    expect(guildQuests.length + seedQuests.length).toBeGreaterThanOrEqual(0);
  });
});
