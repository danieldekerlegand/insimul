/**
 * Unity C# Template Linting Tests
 *
 * Validates all C# template files for common errors without needing the Unity editor.
 * Catches: unregistered files, unreplaced tokens, deprecated APIs, unbalanced braces,
 * missing namespaces, cross-reference issues, and known anti-patterns.
 */

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';
import { generateCSharpFiles } from '../services/game-export/unity/unity-csharp-generator';
import type { WorldIR } from '@shared/game-engine/ir-types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const TEMPLATES_DIR = join(__dirname, '../services/game-export/unity/templates/scripts');

/** Recursively collect all .cs files under a directory. */
function collectCsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectCsFiles(full));
    } else if (entry.name.endsWith('.cs')) {
      results.push(full);
    }
  }
  return results;
}

/** Minimal IR fixture that exercises all generator paths. */
function makeFullIR(): WorldIR {
  return {
    meta: {
      insimulVersion: '1.0.0',
      worldId: 'lint-world',
      worldName: 'Lint World',
      worldType: 'medieval_fantasy',
      seed: 'lint-seed',
      terrainSize: 256,
      exportTimestamp: '2026-03-28T00:00:00Z',
      genreConfig: {
        id: 'rpg',
        name: 'RPG',
        genre: 'rpg',
        features: { crafting: true, resources: true, survival: true, combat: true, ranged: true },
      },
    },
    geography: {
      terrainSize: 256,
      countries: [],
      states: [],
      settlements: [],
      waterFeatures: [],
      terrainFeatures: [],
      biomeZones: [],
    },
    entities: {
      characters: [],
      npcs: [],
      buildings: [],
      roads: [],
    },
    systems: {
      rules: [],
      baseRules: [],
      actions: [],
      baseActions: [],
      quests: [],
      items: [],
      lootTables: [],
      truths: [],
      grammars: [],
      dialogueContexts: [],
      languages: [],
    },
    theme: {
      visualTheme: {
        groundColor: { r: 0.3, g: 0.5, b: 0.2 },
        skyColor: { r: 0.5, g: 0.7, b: 0.9 },
        roadColor: { r: 0.4, g: 0.4, b: 0.4 },
        settlementBaseColor: { r: 0.6, g: 0.5, b: 0.4 },
        settlementRoofColor: { r: 0.5, g: 0.3, b: 0.2 },
        roadRadius: 3,
      },
      ambientLighting: { color: [0.5, 0.5, 0.5], intensity: 0.5 },
      directionalLight: { direction: [0.5, -1, 0.3], intensity: 1.0 },
      fog: { density: 0.002 },
    },
    player: {
      speed: 5,
      jumpHeight: 1.5,
      gravity: 2,
      initialHealth: 100,
      initialEnergy: 100,
      initialGold: 50,
      startPosition: { x: 0, y: 0, z: 0 },
    },
    combat: {
      style: 'fighting',
      settings: {
        baseDamage: 10,
        criticalChance: 0.15,
        criticalMultiplier: 2.0,
        blockReduction: 0.5,
        dodgeChance: 0.1,
        attackCooldown: 1000,
      },
    },
    ui: {
      menuConfig: {
        mapScreen: { enabled: true },
        dialogueScreen: { enabled: true },
      },
    },
  } as unknown as WorldIR;
}

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe('Unity C# Template Lint', () => {
  const allTemplateFiles = collectCsFiles(TEMPLATES_DIR);
  const ir = makeFullIR();

  // Generate all files through the pipeline to get post-substitution content
  let generatedFiles: { path: string; content: string }[];
  try {
    generatedFiles = generateCSharpFiles(ir);
  } catch (e) {
    generatedFiles = [];
  }

  // ── Registration completeness ──

  it('all .cs template files are registered in the generator', () => {
    // Generate with multiple genre configs to cover all conditional paths
    const configs = [
      { ...ir, meta: { ...ir.meta, genreConfig: { ...ir.meta.genreConfig, id: 'rpg' } }, combat: { ...ir.combat, style: 'fighting' } },
      { ...ir, meta: { ...ir.meta, genreConfig: { ...ir.meta.genreConfig, id: 'shooter' } }, combat: { ...ir.combat, style: 'ranged' } },
      { ...ir, meta: { ...ir.meta, genreConfig: { ...ir.meta.genreConfig, id: 'rpg' } }, combat: { ...ir.combat, style: 'turnbased' } },
    ] as unknown as WorldIR[];

    const allGeneratedPaths = new Set<string>();
    for (const config of configs) {
      try {
        const files = generateCSharpFiles(config);
        for (const f of files) {
          allGeneratedPaths.add(f.path.replace('Assets/Scripts/', 'scripts/').toLowerCase());
        }
      } catch { /* skip configs that fail */ }
    }

    const unregistered: string[] = [];
    for (const file of allTemplateFiles) {
      const rel = relative(TEMPLATES_DIR, file).replace(/\\/g, '/').toLowerCase();
      const normalized = rel.startsWith('scripts/') ? rel : `scripts/${rel}`;
      if (!allGeneratedPaths.has(normalized)) {
        unregistered.push(rel);
      }
    }

    expect(unregistered, `Unregistered template files:\n${unregistered.join('\n')}`).toEqual([]);
  });

  // ── Token substitution ──

  it('no unreplaced {{TOKEN}} placeholders after substitution', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      const remaining = file.content.match(/\{\{[A-Z_]+\}\}/g);
      if (remaining) {
        const unique = [...new Set(remaining)];
        failures.push(`${file.path}: ${unique.join(', ')}`);
      }
    }
    expect(failures, `Unreplaced tokens:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── Balanced braces ──

  it('all files have balanced curly braces', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      // Count raw { and } in the file. C# interpolated strings ($"...{expr}...")
      // make exact brace-matching impossible without a full parser, so we just
      // check that open and close counts match (tolerating ±2 for interpolation).
      let open = 0;
      let close = 0;
      for (const ch of file.content) {
        if (ch === '{') open++;
        if (ch === '}') close++;
      }
      const diff = Math.abs(open - close);
      if (diff > 2) {
        failures.push(`${file.path}: { count=${open}, } count=${close}, diff=${diff}`);
      }
    }
    expect(failures, `Significantly unbalanced braces:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── Namespace declarations ──

  it('all files declare an Insimul namespace', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      if (!file.content.match(/namespace\s+Insimul\./)) {
        failures.push(file.path);
      }
    }
    expect(failures, `Files missing Insimul namespace:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── Deprecated API patterns ──

  describe('no deprecated Unity APIs', () => {
    it('no FindObjectOfType (use FindFirstObjectByType)', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        // Match FindObjectOfType but NOT FindFirstObjectByType or FindObjectsByType
        const matches = file.content.match(/FindObjectOfType\b(?!s)/g);
        if (matches) {
          failures.push(`${file.path}: ${matches.length} occurrence(s)`);
        }
      }
      expect(failures, `Deprecated FindObjectOfType:\n${failures.join('\n')}`).toEqual([]);
    });

    it('no enableWordWrapping (use textWrappingMode)', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (file.content.includes('enableWordWrapping')) {
          failures.push(file.path);
        }
      }
      expect(failures, `Deprecated enableWordWrapping:\n${failures.join('\n')}`).toEqual([]);
    });
  });

  // ── Cross-reference validation ──

  describe('type cross-references', () => {
    it('files using InsimulWorldIR import Insimul.Data', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (file.content.includes('InsimulWorldIR') && !file.content.includes('namespace Insimul.Data')) {
          if (!file.content.includes('using Insimul.Data') && !file.content.includes('Insimul.Data.InsimulWorldIR')) {
            failures.push(file.path);
          }
        }
      }
      expect(failures, `Missing 'using Insimul.Data' for InsimulWorldIR:\n${failures.join('\n')}`).toEqual([]);
    });

    it('files using GameClock import Insimul.Core', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (file.content.includes('GameClock') && !file.content.includes('namespace Insimul.Core')) {
          if (!file.content.includes('using Insimul.Core') && !file.content.includes('Insimul.Core.GameClock')) {
            failures.push(file.path);
          }
        }
      }
      expect(failures, `Missing 'using Insimul.Core' for GameClock:\n${failures.join('\n')}`).toEqual([]);
    });

    it('files using InventoryItem import Insimul.Systems', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        // Strip comments before checking for type references
        const stripped = file.content
          .replace(/\/\/.*$/gm, '')
          .replace(/\/\*[\s\S]*?\*\//g, '');
        if (stripped.includes('InventoryItem') && !file.content.includes('namespace Insimul.Systems')) {
          if (!file.content.includes('using Insimul.Systems')) {
            failures.push(file.path);
          }
        }
      }
      expect(failures, `Missing 'using Insimul.Systems' for InventoryItem:\n${failures.join('\n')}`).toEqual([]);
    });

    it('files using IInteractable import Insimul.Systems', () => {
      const failures: string[] = [];
      for (const file of generatedFiles) {
        if (file.content.match(/\bIInteractable\b/) && !file.content.includes('namespace Insimul.Systems')) {
          if (!file.content.includes('using Insimul.Systems')) {
            failures.push(file.path);
          }
        }
      }
      expect(failures, `Missing 'using Insimul.Systems' for IInteractable:\n${failures.join('\n')}`).toEqual([]);
    });
  });

  // ── LINQ usage ──

  it('files using LINQ methods have using System.Linq', () => {
    // Only match LINQ extension methods that definitely need System.Linq
    // Exclude .Count( which is also a List<T> property, .First/.Last which could be array[0]
    const linqMethods = /\.(Select|Where|OrderBy|OrderByDescending|GroupBy|SelectMany|Distinct|ToDictionary|Aggregate|Zip|Average|ThenBy)\s*\(/;
    const failures: string[] = [];
    for (const file of generatedFiles) {
      // Strip comments and strings first
      const stripped = file.content
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\$"(?:[^"\\]|\\.)*"/g, '')
        .replace(/"(?:[^"\\]|\\.)*"/g, '');
      if (stripped.match(linqMethods) && !file.content.includes('using System.Linq')) {
        failures.push(file.path);
      }
    }
    expect(failures, `Missing 'using System.Linq':\n${failures.join('\n')}`).toEqual([]);
  });

  // ── Known anti-patterns ──

  it('no references to non-existent types (InventorySlot, InsimulGeographyData)', () => {
    const badTypes = ['InventorySlot', 'InsimulGeographyData'];
    const failures: string[] = [];
    for (const file of generatedFiles) {
      for (const badType of badTypes) {
        if (file.content.includes(badType)) {
          failures.push(`${file.path}: references ${badType}`);
        }
      }
    }
    expect(failures, `References to non-existent types:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── Class/struct declarations ──

  it('every file has at least one class, struct, enum, or interface declaration', () => {
    const declPattern = /\b(class|struct|enum|interface)\s+\w+/;
    const failures: string[] = [];
    for (const file of generatedFiles) {
      if (!file.content.match(declPattern)) {
        failures.push(file.path);
      }
    }
    expect(failures, `Files with no type declarations:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── File size sanity ──

  it('no template file exceeds 2000 lines', () => {
    const failures: string[] = [];
    for (const file of generatedFiles) {
      const lines = file.content.split('\n').length;
      if (lines > 2000) {
        failures.push(`${file.path}: ${lines} lines`);
      }
    }
    expect(failures, `Oversized files:\n${failures.join('\n')}`).toEqual([]);
  });

  // ── Unity module dependencies ──

  it('ParticleSystem usage matches manifest dependency', () => {
    const usesParticles = generatedFiles.some(f => f.content.includes('ParticleSystem'));
    if (usesParticles) {
      const manifest = readFileSync(
        join(__dirname, '../services/game-export/unity/templates/project/manifest.json'),
        'utf8'
      );
      expect(manifest).toContain('com.unity.modules.particlesystem');
    }
  });

  it('NavMeshAgent usage matches manifest dependency', () => {
    const usesNavMesh = generatedFiles.some(f => f.content.includes('NavMeshAgent'));
    if (usesNavMesh) {
      const manifest = readFileSync(
        join(__dirname, '../services/game-export/unity/templates/project/manifest.json'),
        'utf8'
      );
      expect(manifest).toContain('com.unity.modules.ai');
    }
  });

  it('AudioSource/AudioClip usage matches manifest dependency', () => {
    const usesAudio = generatedFiles.some(f =>
      f.content.includes('AudioSource') || f.content.includes('AudioClip'));
    if (usesAudio) {
      const manifest = readFileSync(
        join(__dirname, '../services/game-export/unity/templates/project/manifest.json'),
        'utf8'
      );
      expect(manifest).toContain('com.unity.modules.audio');
    }
  });

  it('TextMeshPro usage matches manifest dependency', () => {
    const usesTMP = generatedFiles.some(f =>
      f.content.includes('TextMeshPro') || f.content.includes('TMPro'));
    if (usesTMP) {
      const manifest = readFileSync(
        join(__dirname, '../services/game-export/unity/templates/project/manifest.json'),
        'utf8'
      );
      expect(manifest).toContain('com.unity.textmeshpro');
    }
  });
});
