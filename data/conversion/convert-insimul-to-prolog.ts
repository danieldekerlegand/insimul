#!/usr/bin/env tsx
/**
 * Convert .insimul files to Prolog
 *
 * Reads each .insimul JSON file in data/insimul/ subdirectories and produces
 * a corresponding .pl file using the predicate schema from
 * shared/prolog/predicate-schema.ts.
 *
 * .insimul format sections:
 *   world        → world/1, world_name/2, world_description/2, world_config/3
 *   countries    → country/1, country_name/2, government_type/2, economic_system/2
 *   settlements  → settlement/1, settlement_name/2, settlement_type/2, settlement_country/2,
 *                  settlement_population/2, settlement_terrain/2
 *   characters   → person/1, first_name/2, last_name/2, full_name/2, gender/2, birth_year/2,
 *                  occupation/2, at_location/2, alive/1, race/2, married_to/2, parent_of/2, child_of/2
 *   relationships → relationship/3 (friends)
 *
 * Usage:
 *   npx tsx data/insimul/convert-insimul-to-prolog.ts
 *   npx tsx data/insimul/convert-insimul-to-prolog.ts --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dryRun = process.argv.includes('--dry-run');

function prologString(s: string): string {
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function toAtom(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function convertFile(srcPath: string): string {
  const data = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));
  const lines: string[] = [];

  const worldName = data.world?.name || 'Unknown';
  lines.push(`%% Insimul World: ${worldName}`);
  lines.push(`%% Source: ${path.relative(path.resolve(__dirname, '../..'), srcPath)}`);
  lines.push(`%% Converted: ${new Date().toISOString()}`);
  lines.push('');

  // ── World ──────────────────────────────────────────────────────────────
  if (data.world) {
    const w = data.world;
    const id = toAtom(w.name);
    lines.push('%% ═══ World ═══');
    lines.push(`world(${id}).`);
    lines.push(`world_name(${id}, ${prologString(w.name)}).`);
    if (w.description) {
      lines.push(`world_description(${id}, ${prologString(w.description)}).`);
    }
    if (w.sourceFormats) {
      for (const fmt of w.sourceFormats) {
        lines.push(`world_source_format(${id}, ${toAtom(fmt)}).`);
      }
    }
    if (w.config) {
      for (const [key, val] of Object.entries(w.config)) {
        if (typeof val === 'object' && Array.isArray(val)) {
          for (const item of val) {
            lines.push(`world_config(${id}, ${toAtom(key)}, ${toAtom(String(item))}).`);
          }
        } else {
          const valStr = typeof val === 'string' ? toAtom(val) : String(val);
          lines.push(`world_config(${id}, ${toAtom(key)}, ${valStr}).`);
        }
      }
    }
    lines.push('');
  }

  // ── Countries ──────────────────────────────────────────────────────────
  if (data.countries?.length) {
    lines.push('%% ═══ Countries ═══');
    for (const c of data.countries) {
      const id = c.id;
      lines.push(`country(${id}).`);
      lines.push(`country_name(${id}, ${prologString(c.name)}).`);
      if (c.governmentType) {
        lines.push(`government_type(${id}, ${toAtom(c.governmentType)}).`);
      }
      if (c.economicSystem) {
        lines.push(`economic_system(${id}, ${toAtom(c.economicSystem)}).`);
      }
    }
    lines.push('');
  }

  // ── Settlements ────────────────────────────────────────────────────────
  if (data.settlements?.length) {
    lines.push('%% ═══ Settlements ═══');
    for (const s of data.settlements) {
      const id = s.id;
      lines.push(`settlement(${id}).`);
      lines.push(`settlement_name(${id}, ${prologString(s.name)}).`);
      if (s.countryRef) {
        lines.push(`settlement_country(${id}, ${s.countryRef}).`);
      }
      if (s.settlementType) {
        lines.push(`settlement_type(${id}, ${toAtom(s.settlementType)}).`);
      }
      if (s.population != null) {
        lines.push(`settlement_population(${id}, ${s.population}).`);
      }
      if (s.terrain) {
        lines.push(`settlement_terrain(${id}, ${toAtom(s.terrain)}).`);
      }
    }
    lines.push('');
  }

  // ── Characters ─────────────────────────────────────────────────────────
  if (data.characters?.length) {
    lines.push('%% ═══ Characters ═══');
    for (const ch of data.characters) {
      const id = ch.id;
      const fullName = `${ch.firstName} ${ch.lastName}`;
      lines.push('');
      lines.push(`%% ${fullName}`);
      lines.push(`person(${id}).`);
      lines.push(`first_name(${id}, ${prologString(ch.firstName)}).`);
      lines.push(`last_name(${id}, ${prologString(ch.lastName)}).`);
      lines.push(`full_name(${id}, ${prologString(fullName)}).`);
      lines.push(`gender(${id}, ${toAtom(ch.gender)}).`);
      if (ch.birthYear != null) {
        lines.push(`birth_year(${id}, ${ch.birthYear}).`);
      }
      lines.push(`alive(${id}).`);
      if (ch.occupation) {
        lines.push(`occupation(${id}, ${toAtom(ch.occupation)}).`);
      }
      if (ch.locationRef) {
        lines.push(`at_location(${id}, ${ch.locationRef}).`);
      }
      if (ch.race) {
        lines.push(`race(${id}, ${toAtom(ch.race)}).`);
      }
      if (ch.spouseRef) {
        lines.push(`married_to(${id}, ${ch.spouseRef}).`);
      }
      if (ch.parentRefs) {
        for (const parentId of ch.parentRefs) {
          lines.push(`child_of(${id}, ${parentId}).`);
          lines.push(`parent_of(${parentId}, ${id}).`);
        }
      }
    }
    lines.push('');
  }

  // ── Relationships ──────────────────────────────────────────────────────
  if (data.relationships?.length) {
    lines.push('%% ═══ Relationships ═══');
    for (const rel of data.relationships) {
      const charId = rel.characterRef;
      if (rel.friendRefs) {
        for (const friendId of rel.friendRefs) {
          lines.push(`relationship(${charId}, ${friendId}, friends).`);
          lines.push(`relationship(${friendId}, ${charId}, friends).`);
        }
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  console.log('============================================================');
  console.log('  Convert .insimul Files to Prolog');
  console.log('============================================================\n');

  if (dryRun) {
    console.log('  *** DRY RUN — no files will be written ***\n');
  }

  // Find all .insimul files recursively
  const dirs = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let totalFiles = 0;

  for (const dir of dirs) {
    const dirPath = path.join(__dirname, dir);
    const insimulFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.insimul'));

    for (const file of insimulFiles) {
      const srcPath = path.join(dirPath, file);
      const plFile = file.replace('.insimul', '.pl');
      const outPath = path.join(dirPath, plFile);

      const prolog = convertFile(srcPath);

      if (!dryRun) {
        fs.writeFileSync(outPath, prolog);
      }

      // Count entities
      const data = JSON.parse(fs.readFileSync(srcPath, 'utf-8'));
      const countries = data.countries?.length || 0;
      const settlements = data.settlements?.length || 0;
      const characters = data.characters?.length || 0;

      console.log(`  ✅ ${dir}/${file} → ${plFile}`);
      console.log(`     ${countries} countries, ${settlements} settlements, ${characters} characters`);
      totalFiles++;
    }
  }

  console.log('\n============================================================');
  console.log(`  Total: ${totalFiles} files converted`);
  console.log('============================================================');
}

main();
