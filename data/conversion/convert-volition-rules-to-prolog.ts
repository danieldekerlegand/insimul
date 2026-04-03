#!/usr/bin/env tsx
/**
 * Convert Ensemble Volition Rules to Prolog files
 *
 * Reads each JSON file in data/ensemble/volitionRules/ and produces a
 * corresponding .pl file following the predicate structure used by the
 * existing base rules (see data/backups/French Louisiana/rules.json).
 *
 * Ensemble volition rule structure:
 *   { name, conditions[], effects[] }
 *
 * Output predicate structure:
 *   rule_likelihood(Id, 1).
 *   rule_type(Id, volition).
 *   % Human-readable name
 *   rule_active(Id).
 *   rule_category(Id, Category).
 *   rule_source(Id, ensemble).
 *   rule_priority(Id, Priority).
 *   rule_applies(Id, X, Y) :- <conditions>.
 *   rule_effect(Id, <effect>).
 *
 * Ensemble condition categories → Prolog predicates:
 *   - "directed status" → directed_status(X, Y, Type)
 *   - "relationship"    → relationship(X, Y, Type)
 *   - "status"          → status(X, Type)
 *   - "trait"           → trait(X, Type)
 *   - "attribute"       → attribute(X, Type, Val), Val op Threshold
 *   - "network"         → network(X, Y, Type, Val), Val op Threshold
 *   - "bond"            → bond(X, Y, Type, Val), Val op Threshold
 *   - "mood"            → mood(X, Type)
 *   - "event"           → event(X, Type)
 *   - "intent"          → intent(X, Type, Y)
 *
 * Ensemble effect categories → Prolog terms:
 *   - "intent"       → set_intent(X, Type, Y, Weight)
 *   - "network"      → modify_network(X, Y, Type, Sign, Weight)
 *   - "relationship" → set_relationship(X, Y, Type, Weight)
 *   - "bond"         → modify_bond(X, Y, Type, Sign, Weight)
 *   - "attribute"    → modify_attribute(X, Type, Sign, Weight)
 *
 * Usage:
 *   npx tsx data/ensemble/convert-volition-rules-to-prolog.ts
 *   npx tsx data/ensemble/convert-volition-rules-to-prolog.ts --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'volitionRules');
const OUT_DIR = path.join(__dirname, 'volitionRules-prolog');
const dryRun = process.argv.includes('--dry-run');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a name to a Prolog-safe atom */
function toAtom(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

/** Escape a string for Prolog single quotes */
function prologString(s: string): string {
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

/** Map x/y/someone to Prolog variables */
function toVar(role: string): string {
  if (role === 'x') return 'X';
  if (role === 'y') return 'Y';
  if (role === 'someone') return 'Someone';
  return prologString(role);
}

/** Map operator to Prolog comparison */
function toPrologOp(op: string | undefined): string {
  if (!op) return '>';
  switch (op) {
    case '>': return '>';
    case '<': return '<';
    case '>=': return '>=';
    case '<=': return '=<';
    case '=': case '==': return '=:=';
    default: return '>';
  }
}

// ─── Condition → Prolog body term ────────────────────────────────────────────

function conditionToProlog(c: any): string {
  const cat = c.category;
  const type = c.type;
  const first = toVar(c.first);
  const second = c.second ? toVar(c.second) : null;
  const val = c.value;
  const op = c.operator;

  switch (cat) {
    case 'directed status': {
      const statusAtom = toAtom(type);
      if (val === false) return `\\+ directed_status(${first}, ${second || '_'}, ${statusAtom})`;
      return `directed_status(${first}, ${second || '_'}, ${statusAtom})`;
    }

    case 'relationship': {
      const relAtom = toAtom(type);
      if (val === false) return `\\+ relationship(${first}, ${second || '_'}, ${relAtom})`;
      return `relationship(${first}, ${second || '_'}, ${relAtom})`;
    }

    case 'status': {
      const statusAtom = toAtom(type);
      if (val === false) return `\\+ status(${first}, ${statusAtom})`;
      return `status(${first}, ${statusAtom})`;
    }

    case 'trait': {
      const traitAtom = toAtom(type);
      if (val === false) return `\\+ trait(${first}, ${traitAtom})`;
      return `trait(${first}, ${traitAtom})`;
    }

    case 'attribute': {
      const attrAtom = toAtom(type);
      const varName = `${attrAtom.charAt(0).toUpperCase()}${attrAtom.slice(1)}_val`;
      const pOp = toPrologOp(op);
      return `attribute(${first}, ${attrAtom}, ${varName}), ${varName} ${pOp} ${val}`;
    }

    case 'network': {
      const netAtom = toAtom(type);
      const varName = `${netAtom.charAt(0).toUpperCase()}${netAtom.slice(1)}_val`;
      const pOp = toPrologOp(op);
      return `network(${first}, ${second || '_'}, ${netAtom}, ${varName}), ${varName} ${pOp} ${val}`;
    }

    case 'bond': {
      const bondAtom = toAtom(type);
      const varName = `${bondAtom.charAt(0).toUpperCase()}${bondAtom.slice(1)}_val`;
      const pOp = toPrologOp(op);
      return `bond(${first}, ${second || '_'}, ${bondAtom}, ${varName}), ${varName} ${pOp} ${val}`;
    }

    case 'mood': {
      const moodAtom = toAtom(type);
      if (val === false) return `\\+ mood(${first}, ${moodAtom})`;
      return `mood(${first}, ${moodAtom})`;
    }

    case 'event': {
      const eventAtom = toAtom(type);
      if (val === false) return `\\+ event(${first}, ${eventAtom})`;
      return `event(${first}, ${eventAtom})`;
    }

    case 'intent': {
      const intentAtom = toAtom(type);
      if (val === false) return `\\+ intent(${first}, ${intentAtom}, ${second || '_'})`;
      return `intent(${first}, ${intentAtom}, ${second || '_'})`;
    }

    default:
      return `ensemble_condition(${first}, ${toAtom(type)}, ${val})`;
  }
}

// ─── Effect → Prolog term ────────────────────────────────────────────────────

function effectToProlog(e: any): string {
  const cat = e.category;
  const type = e.type;
  const first = toVar(e.first);
  const second = e.second ? toVar(e.second) : null;
  const weight = e.weight ?? 0;
  const sign = weight >= 0 ? '+' : '-';
  const absWeight = Math.abs(weight);

  switch (cat) {
    case 'intent': {
      const intentAtom = toAtom(type);
      return `set_intent(${first}, ${intentAtom}, ${second || '_'}, ${weight})`;
    }

    case 'network': {
      const netAtom = toAtom(type);
      return `modify_network(${first}, ${second || '_'}, ${netAtom}, '${sign}', ${absWeight})`;
    }

    case 'relationship': {
      const relAtom = toAtom(type);
      return `set_relationship(${first}, ${second || '_'}, ${relAtom}, ${weight})`;
    }

    case 'bond': {
      const bondAtom = toAtom(type);
      return `modify_bond(${first}, ${second || '_'}, ${bondAtom}, '${sign}', ${absWeight})`;
    }

    case 'attribute': {
      const attrAtom = toAtom(type);
      return `modify_attribute(${first}, ${attrAtom}, '${sign}', ${absWeight})`;
    }

    default:
      return `ensemble_effect(${first}, ${toAtom(type)}, ${weight})`;
  }
}

// ─── Generate Prolog for one rule ────────────────────────────────────────────

interface EnsembleRule {
  name: string;
  conditions?: any[];
  effects?: any[];
}

function ruleToProlog(rule: EnsembleRule, category: string): string {
  const lines: string[] = [];
  const id = toAtom(rule.name);
  const categoryAtom = toAtom(category);
  const conditions = rule.conditions || [];
  const effects = rule.effects || [];

  // Determine priority from effect weights (higher weight = higher priority)
  const maxWeight = effects.reduce((max, e) => Math.max(max, Math.abs(e.weight ?? 0)), 0);
  const priority = maxWeight >= 10 ? 8 : maxWeight >= 5 ? 5 : maxWeight >= 3 ? 3 : 1;

  // Rule metadata facts
  lines.push(`rule_likelihood(${id}, 1).`);
  lines.push(`rule_type(${id}, volition).`);
  lines.push(`% ${rule.name}`);
  lines.push(`rule_active(${id}).`);
  lines.push(`rule_category(${id}, ${categoryAtom}).`);
  lines.push(`rule_source(${id}, ensemble).`);
  lines.push(`rule_priority(${id}, ${priority}).`);

  // rule_applies/3 — conditions become the rule body
  if (conditions.length > 0) {
    const condTerms = conditions.map(conditionToProlog);
    const body = condTerms.map(t => '    ' + t).join(',\n');
    lines.push(`rule_applies(${id}, X, Y) :-`);
    lines.push(body + '.');
  } else {
    lines.push(`rule_applies(${id}, X, Y) :- true.`);
  }

  // rule_effect/2 — one fact per effect
  for (const e of effects) {
    const term = effectToProlog(e);
    lines.push(`rule_effect(${id}, ${term}).`);
  }

  return lines.join('\n');
}

// ─── Process one JSON file ───────────────────────────────────────────────────

function convertFile(jsonPath: string): { prolog: string; count: number } {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const category: string = data.category;
  const rules: EnsembleRule[] = data.rules;

  const lines: string[] = [];

  lines.push(`%% Ensemble Volition Rules: ${category}`);
  lines.push(`%% Source: data/ensemble/volitionRules/${path.basename(jsonPath)}`);
  lines.push(`%% Converted: ${new Date().toISOString()}`);
  lines.push(`%% Total rules: ${rules.length}`);
  lines.push('');

  for (const rule of rules) {
    lines.push(ruleToProlog(rule, category));
    lines.push('');
  }

  return { prolog: lines.join('\n'), count: rules.length };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  console.log('============================================================');
  console.log('  Convert Ensemble Volition Rules to Prolog');
  console.log('============================================================\n');

  if (dryRun) {
    console.log('  *** DRY RUN — no files will be written ***\n');
  }

  if (!dryRun) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const jsonFiles = fs.readdirSync(SRC_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  let totalRules = 0;
  let totalFiles = 0;

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(SRC_DIR, jsonFile);
    const plFile = jsonFile.replace('.json', '.pl');

    const { prolog, count } = convertFile(jsonPath);
    totalRules += count;
    totalFiles++;

    if (!dryRun) {
      fs.writeFileSync(path.join(OUT_DIR, plFile), prolog);
    }

    console.log(`  ✅ ${jsonFile} → ${plFile}: ${count} rules`);
  }

  // Combined file
  if (!dryRun) {
    const allLines: string[] = [];
    allLines.push('%% Ensemble Volition Rules — Combined');
    allLines.push(`%% Generated: ${new Date().toISOString()}`);
    allLines.push(`%% Total: ${totalRules} rules from ${totalFiles} categories`);
    allLines.push('');

    for (const jsonFile of jsonFiles) {
      const jsonPath = path.join(SRC_DIR, jsonFile);
      const { prolog } = convertFile(jsonPath);
      allLines.push(`%% ═══════════════════════════════════════════════════════════`);
      allLines.push(`%% Category: ${jsonFile.replace('.json', '')}`);
      allLines.push(`%% ═══════════════════════════════════════════════════════════`);
      allLines.push('');
      allLines.push(prolog);
    }

    fs.writeFileSync(path.join(OUT_DIR, 'all_volition_rules.pl'), allLines.join('\n'));
    console.log(`\n  📦 all_volition_rules.pl: ${totalRules} rules combined`);
  }

  console.log('\n============================================================');
  console.log(`  Total: ${totalRules} rules across ${totalFiles} files`);
  if (!dryRun) {
    console.log(`  Output: ${OUT_DIR}`);
  }
  console.log('============================================================');
}

main();
