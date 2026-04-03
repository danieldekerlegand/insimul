#!/usr/bin/env tsx
/**
 * Convert Ensemble Trigger Rules to Prolog files
 *
 * Reads data/ensemble/triggerRules/triggerRules.json and produces a .pl file
 * following the same predicate structure as the volition rules.
 *
 * Trigger rules fire automatically when conditions are met (unlike volition
 * rules which influence NPC intent/desire). They use rule_type(Id, trigger).
 *
 * Additional condition/effect categories vs volition rules:
 *   Conditions: "event undirected" → event_undirected(X, Type)
 *   Effects:    "mood"   → assert(mood(X, Type))
 *               "status" → assert/retract(status(X, Type))
 *               "network" with value/operator → modify_network(X, Y, Type, Sign, Abs)
 *
 * Usage:
 *   npx tsx data/ensemble/convert-trigger-rules-to-prolog.ts
 *   npx tsx data/ensemble/convert-trigger-rules-to-prolog.ts --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_FILE = path.join(__dirname, 'triggerRules', 'triggerRules.json');
const OUT_DIR = path.join(__dirname, 'triggerRules-prolog');
const dryRun = process.argv.includes('--dry-run');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toAtom(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function prologString(s: string): string {
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function toVar(role: string): string {
  if (role === 'x') return 'X';
  if (role === 'y') return 'Y';
  if (role === 'z') return 'Z';
  if (role === 'someone') return 'Someone';
  if (role === 'other') return 'Other';
  if (role === 'victim') return 'Victim';
  if (role === 'wouldBeLover') return 'WouldBeLover';
  if (role === 'someoneElse') return 'SomeoneElse';
  // Capitalize first letter for any other variable
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function toPrologOp(op: string | undefined): string {
  switch (op) {
    case '>': return '>';
    case '<': return '<';
    case '>=': return '>=';
    case '<=': return '=<';
    case '=': case '==': return '=:=';
    default: return '>';
  }
}

// ─── Condition → Prolog ──────────────────────────────────────────────────────

function conditionToProlog(c: any): string {
  const cat = c.category;
  const type = c.type;
  const first = toVar(c.first);
  const second = c.second ? toVar(c.second) : null;
  const val = c.value;
  const op = c.operator;

  switch (cat) {
    case 'trait': {
      const atom = toAtom(type);
      if (val === false) return `\\+ trait(${first}, ${atom})`;
      return `trait(${first}, ${atom})`;
    }

    case 'status': {
      const atom = toAtom(type);
      if (val === false) return `\\+ status(${first}, ${atom})`;
      return `status(${first}, ${atom})`;
    }

    case 'attribute': {
      const atom = toAtom(type);
      const varName = `${atom.charAt(0).toUpperCase()}${atom.slice(1)}_val`;
      return `attribute(${first}, ${atom}, ${varName}), ${varName} ${toPrologOp(op)} ${val}`;
    }

    case 'event': {
      const atom = toAtom(type);
      if (val === false) return `\\+ event(${first}, ${atom}, ${second || '_'})`;
      return `event(${first}, ${atom}, ${second || '_'})`;
    }

    case 'event undirected': {
      const atom = toAtom(type);
      if (val === false) return `\\+ event_undirected(${first}, ${atom})`;
      return `event_undirected(${first}, ${atom})`;
    }

    case 'directed status': {
      const atom = toAtom(type);
      if (val === false) return `\\+ directed_status(${first}, ${second || '_'}, ${atom})`;
      return `directed_status(${first}, ${second || '_'}, ${atom})`;
    }

    case 'relationship': {
      const atom = toAtom(type);
      if (val === false) return `\\+ relationship(${first}, ${second || '_'}, ${atom})`;
      return `relationship(${first}, ${second || '_'}, ${atom})`;
    }

    case 'network': {
      const atom = toAtom(type);
      const varName = `${atom.charAt(0).toUpperCase()}${atom.slice(1)}_val`;
      return `network(${first}, ${second || '_'}, ${atom}, ${varName}), ${varName} ${toPrologOp(op)} ${val}`;
    }

    default:
      return `ensemble_condition(${first}, ${toAtom(type)}, ${val})`;
  }
}

// ─── Effect → Prolog ─────────────────────────────────────────────────────────

function effectToProlog(e: any): string {
  const cat = e.category;
  const type = e.type;
  const first = toVar(e.first);
  const second = e.second ? toVar(e.second) : null;
  const val = e.value;
  const op = e.operator;

  switch (cat) {
    case 'mood': {
      const atom = toAtom(type);
      if (val === false) return `retract(mood(${first}, ${atom}))`;
      return `assert(mood(${first}, ${atom}))`;
    }

    case 'status': {
      const atom = toAtom(type);
      if (val === false) return `retract(status(${first}, ${atom}))`;
      return `assert(status(${first}, ${atom}))`;
    }

    case 'network': {
      const atom = toAtom(type);
      if (op) {
        const sign = op === '-' ? '-' : '+';
        return `modify_network(${first}, ${second || '_'}, ${atom}, '${sign}', ${Math.abs(val)})`;
      }
      // No operator — set absolute value
      return `set_network(${first}, ${second || '_'}, ${atom}, ${val})`;
    }

    case 'relationship': {
      const atom = toAtom(type);
      if (val === false) return `retract(relationship(${first}, ${second || '_'}, ${atom}))`;
      return `assert(relationship(${first}, ${second || '_'}, ${atom}))`;
    }

    case 'trait': {
      const atom = toAtom(type);
      if (val === false) return `retract(trait(${first}, ${atom}))`;
      return `assert(trait(${first}, ${atom}))`;
    }

    default:
      return `ensemble_effect(${first}, ${toAtom(type)}, ${val})`;
  }
}

// ─── Generate Prolog for one rule ────────────────────────────────────────────

function ruleToProlog(rule: any): string {
  const lines: string[] = [];
  const id = toAtom(rule.name);
  const conditions = rule.conditions || [];
  const effects = rule.effects || [];

  lines.push(`rule_likelihood(${id}, 1).`);
  lines.push(`rule_type(${id}, trigger).`);
  lines.push(`% ${rule.name}`);
  lines.push(`rule_active(${id}).`);
  lines.push(`rule_category(${id}, trigger).`);
  lines.push(`rule_source(${id}, ensemble).`);
  lines.push(`rule_priority(${id}, 5).`);

  // rule_applies — use all unique variable roles from conditions
  // Collect the distinct roles used
  const roles = new Set<string>();
  for (const c of conditions) {
    if (c.first) roles.add(toVar(c.first));
    if (c.second) roles.add(toVar(c.second));
  }
  for (const e of effects) {
    if (e.first) roles.add(toVar(e.first));
    if (e.second) roles.add(toVar(e.second));
  }

  // Determine the two primary roles for rule_applies/3
  const roleList = [...roles];
  const arg1 = roleList[0] || 'X';
  const arg2 = roleList[1] || 'Y';

  if (conditions.length > 0) {
    const condTerms = conditions.map(conditionToProlog);
    const body = condTerms.map(t => '    ' + t).join(',\n');
    lines.push(`rule_applies(${id}, ${arg1}, ${arg2}) :-`);
    lines.push(body + '.');
  } else {
    lines.push(`rule_applies(${id}, ${arg1}, ${arg2}) :- true.`);
  }

  for (const e of effects) {
    const term = effectToProlog(e);
    lines.push(`rule_effect(${id}, ${term}).`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  console.log('============================================================');
  console.log('  Convert Ensemble Trigger Rules to Prolog');
  console.log('============================================================\n');

  if (dryRun) {
    console.log('  *** DRY RUN — no files will be written ***\n');
  }

  const data = JSON.parse(fs.readFileSync(SRC_FILE, 'utf-8'));
  const rules: any[] = data.rules;

  console.log(`  Source: ${rules.length} trigger rules\n`);

  const lines: string[] = [];
  lines.push('%% Ensemble Trigger Rules');
  lines.push(`%% Source: data/ensemble/triggerRules/triggerRules.json`);
  lines.push(`%% Converted: ${new Date().toISOString()}`);
  lines.push(`%% Total rules: ${rules.length}`);
  lines.push('');

  for (const rule of rules) {
    lines.push(ruleToProlog(rule));
    lines.push('');
    console.log(`  ✅ ${rule.name}`);
  }

  const prolog = lines.join('\n');

  if (!dryRun) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, 'trigger-rules.pl'), prolog);
  }

  console.log('\n============================================================');
  console.log(`  Total: ${rules.length} trigger rules`);
  if (!dryRun) {
    console.log(`  Output: ${OUT_DIR}/trigger-rules.pl`);
  }
  console.log('============================================================');
}

main();
