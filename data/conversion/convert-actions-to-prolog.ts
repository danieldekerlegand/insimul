#!/usr/bin/env tsx
/**
 * Convert Ensemble JSON actions to Prolog files
 *
 * Reads each JSON file in data/ensemble/actions/ and produces a corresponding
 * .pl file following the same predicate structure as data/backups/base_actions.pl.
 *
 * Ensemble action structure:
 *   { name, displayName?, conditions[], effects[], influenceRules[], leadsTo[], isAccept? }
 *
 * Output predicate structure (per base_actions.pl):
 *   action(Id, Name, ActionType, EnergyCost).
 *   action_difficulty(Id, Difficulty).
 *   action_duration(Id, Duration).
 *   action_category(Id, Category).
 *   action_parent(Id, ParentId).           — if this is a sub-action (leadsTo target)
 *   action_verb(Id, past, Verb).
 *   action_verb(Id, present, Verb).
 *   action_target_type(Id, TargetType).
 *   action_requires_target(Id).            — if target-directed
 *   action_source(Id, ensemble).
 *   action_leads_to(Id, ChildId).          — for each leadsTo entry
 *   action_is_accept(Id).                  — if isAccept is true
 *   action_prerequisite(Id, Condition).    — per Ensemble condition
 *   action_effect(Id, Effect).             — per Ensemble effect
 *   action_influence(Id, Influence).       — per Ensemble influenceRule
 *   can_perform(Actor, Id, Target) :- ...  — derived from conditions
 *
 * Usage:
 *   npx tsx data/ensemble/convert-actions-to-prolog.ts
 *   npx tsx data/ensemble/convert-actions-to-prolog.ts --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, 'actions');
const OUT_DIR = path.join(__dirname, 'actions-prolog');
const dryRun = process.argv.includes('--dry-run');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert action name to a Prolog-safe atom (lowercase, underscored) */
function toAtom(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

/** Escape a string for Prolog single-quoted atoms */
function prologString(s: string): string {
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

/** Map Ensemble category to action type */
function categoryToActionType(category: string): string {
  if (category.startsWith('romantic')) return 'romantic';
  if (category.startsWith('hostile') || category.startsWith('dominance')) return 'hostile';
  if (category.startsWith('deceptive')) return 'deceptive';
  if (category.startsWith('conversational')) return 'social';
  if (category.startsWith('impression') || category.startsWith('theatrical')) return 'social';
  if (category.startsWith('social') || category.startsWith('trust') || category.startsWith('gratitude')) return 'social';
  if (category === 'self-improvement') return 'self_improvement';
  if (category === 'physical-activities' || category === 'environmental-interaction') return 'physical';
  if (category.startsWith('information')) return 'social';
  if (category.startsWith('behavioral') || category.startsWith('intent') || category.startsWith('virtue')) return 'social';
  if (category.startsWith('rejection')) return 'social';
  if (category.startsWith('status')) return 'social';
  if (category.startsWith('emotional')) return 'social';
  return 'social';
}

/** Determine if action is target-directed based on conditions */
function isTargetDirected(conditions: any[]): boolean {
  return conditions.some(
    (c: any) => c.second === 'responder' || c.first === 'responder'
  );
}

/** Convert a single Ensemble condition to a Prolog term */
function conditionToProlog(c: any): string {
  const cat = c.category;
  const type = c.type;
  const op = c.operator || '==';
  const val = c.value;
  const first = c.first === 'initiator' ? 'Actor'
    : c.first === 'responder' ? 'Target'
    : c.first === 'someone' ? 'Someone'
    : prologString(c.first);
  const second = c.second === 'initiator' ? 'Actor'
    : c.second === 'responder' ? 'Target'
    : c.second === 'someone' ? 'Someone'
    : c.second ? prologString(c.second)
    : null;

  if (cat === 'relationship') {
    if (val === true) return `relationship(${first}, ${second}, ${type})`;
    if (val === false) return `\\+ relationship(${first}, ${second}, ${type})`;
    return `relationship(${first}, ${second}, ${type})`;
  }

  if (cat === 'network') {
    const prologOp = op === '>' ? '>' : op === '<' ? '<' : op === '>=' ? '>=' : op === '<=' ? '=<' : '=:=';
    return `network(${first}, ${second}, ${type}, V), V ${prologOp} ${val}`;
  }

  if (cat === 'status') {
    if (val === true) return `status(${first}, ${type})`;
    if (val === false) return `\\+ status(${first}, ${type})`;
    return `status(${first}, ${type})`;
  }

  if (cat === 'trait') {
    if (val === true) return `trait(${first}, ${type})`;
    if (val === false) return `\\+ trait(${first}, ${type})`;
    return `trait(${first}, ${type})`;
  }

  if (cat === 'attribute') {
    const prologOp = op === '>' ? '>' : op === '<' ? '<' : op === '>=' ? '>=' : op === '<=' ? '=<' : '=:=';
    return `attribute(${first}, ${type}, V), V ${prologOp} ${val}`;
  }

  if (cat === 'bond') {
    const prologOp = op === '>' ? '>' : op === '<' ? '<' : op === '>=' ? '>=' : op === '<=' ? '=<' : '=:=';
    return `bond(${first}, ${second}, ${type}, V), V ${prologOp} ${val}`;
  }

  // Fallback: emit a generic predicate
  return `ensemble_condition(${first}, ${type}, ${val})`;
}

/** Convert a single Ensemble effect to a Prolog term */
function effectToProlog(e: any): string {
  const cat = e.category;
  const type = e.type;
  const op = e.operator || '+';
  const val = e.value;
  const first = e.first === 'initiator' ? 'Actor'
    : e.first === 'responder' ? 'Target'
    : e.first === 'someone' ? 'Someone'
    : prologString(e.first);
  const second = e.second === 'initiator' ? 'Actor'
    : e.second === 'responder' ? 'Target'
    : e.second === 'someone' ? 'Someone'
    : e.second ? prologString(e.second)
    : null;

  if (cat === 'network') {
    return `modify_network(${first}, ${second}, ${type}, ${op === '+' ? '+' : '-'}, ${Math.abs(val)})`;
  }

  if (cat === 'relationship') {
    if (val === true) return `assert(relationship(${first}, ${second}, ${type}))`;
    if (val === false) return `retract(relationship(${first}, ${second}, ${type}))`;
    return `assert(relationship(${first}, ${second}, ${type}))`;
  }

  if (cat === 'status') {
    if (val === true) return `assert(status(${first}, ${type}))`;
    if (val === false) return `retract(status(${first}, ${type}))`;
    return `assert(status(${first}, ${type}))`;
  }

  if (cat === 'bond') {
    return `modify_bond(${first}, ${second}, ${type}, ${op === '+' ? '+' : '-'}, ${Math.abs(val)})`;
  }

  if (cat === 'attribute') {
    return `modify_attribute(${first}, ${type}, ${op === '+' ? '+' : '-'}, ${Math.abs(val)})`;
  }

  if (cat === 'trait') {
    if (val === true) return `assert(trait(${first}, ${type}))`;
    if (val === false) return `retract(trait(${first}, ${type}))`;
    return `assert(trait(${first}, ${type}))`;
  }

  // Fallback
  return `ensemble_effect(${first}, ${type}, ${val})`;
}

/** Convert an influence rule to a Prolog term */
function influenceToProlog(ir: any): string {
  // Influence rules have the same structure as conditions/effects
  // but represent how the action's weight is modified
  const type = ir.type || 'weight';
  const val = ir.value || 0;
  const op = ir.operator || '+';
  const first = ir.first === 'initiator' ? 'Actor'
    : ir.first === 'responder' ? 'Target'
    : ir.first ? prologString(ir.first) : '_';
  const second = ir.second === 'initiator' ? 'Actor'
    : ir.second === 'responder' ? 'Target'
    : ir.second ? prologString(ir.second) : '_';
  const cat = ir.category || 'unknown';

  return `influence(${cat}, ${first}, ${second}, ${type}, ${op}, ${val})`;
}

// ─── Generate Prolog for one action ──────────────────────────────────────────

interface EnsembleAction {
  name: string;
  displayName?: string;
  conditions?: any[];
  effects?: any[];
  influenceRules?: any[];
  leadsTo?: string[];
  isAccept?: boolean;
}

function actionToProlog(action: EnsembleAction, category: string, parentAtom?: string): string {
  const lines: string[] = [];
  const id = toAtom(action.name);
  const displayName = action.displayName || action.name;
  const actionType = categoryToActionType(category);
  const conditions = action.conditions || [];
  const effects = action.effects || [];
  const influences = action.influenceRules || [];
  const leadsTo = action.leadsTo || [];
  const hasTarget = isTargetDirected(conditions) || isTargetDirected(effects);

  // Header comment
  lines.push(`%% ${id}`);
  lines.push(`% Action: ${displayName}`);
  lines.push(`% Source: Ensemble / ${category}`);
  lines.push('');

  // Core facts
  lines.push(`action(${id}, ${prologString(displayName)}, ${actionType}, 1).`);
  lines.push(`action_difficulty(${id}, 0.5).`);
  lines.push(`action_duration(${id}, 1).`);
  lines.push(`action_category(${id}, ${toAtom(category)}).`);
  lines.push(`action_source(${id}, ensemble).`);

  // Parent reference
  if (parentAtom) {
    lines.push(`action_parent(${id}, ${parentAtom}).`);
  }

  // Verb conjugation (derive from name)
  const nameLower = action.name.toLowerCase();
  lines.push(`action_verb(${id}, past, ${prologString(nameLower)}).`);
  lines.push(`action_verb(${id}, present, ${prologString(nameLower)}).`);

  // Target type
  if (hasTarget) {
    lines.push(`action_target_type(${id}, other).`);
    lines.push(`action_requires_target(${id}).`);
    lines.push(`action_range(${id}, 5).`);
  } else {
    lines.push(`action_target_type(${id}, self).`);
  }

  // Is accept (response action)
  if (action.isAccept) {
    lines.push(`action_is_accept(${id}).`);
  }

  // leadsTo references
  for (const child of leadsTo) {
    lines.push(`action_leads_to(${id}, ${toAtom(child)}).`);
  }

  // Prerequisites (from conditions)
  for (const c of conditions) {
    const term = conditionToProlog(c);
    lines.push(`action_prerequisite(${id}, (${term})).`);
  }

  // Effects
  for (const e of effects) {
    const term = effectToProlog(e);
    lines.push(`action_effect(${id}, (${term})).`);
  }

  // Influence rules
  for (const ir of influences) {
    const term = influenceToProlog(ir);
    lines.push(`action_influence(${id}, (${term})).`);
  }

  // can_perform rule
  if (conditions.length > 0) {
    const condTerms = conditions.map(conditionToProlog);
    const body = condTerms.map(t => '    ' + t).join(',\n');
    if (hasTarget) {
      lines.push(`% Can Actor perform this action?`);
      lines.push(`can_perform(Actor, ${id}, Target) :-`);
    } else {
      lines.push(`% Can Actor perform this action?`);
      lines.push(`can_perform(Actor, ${id}) :-`);
    }
    lines.push(body + '.');
  } else {
    // No conditions — always performable
    if (hasTarget) {
      lines.push(`can_perform(Actor, ${id}, Target) :- true.`);
    } else {
      lines.push(`can_perform(Actor, ${id}) :- true.`);
    }
  }

  return lines.join('\n');
}

// ─── Process one JSON file ───────────────────────────────────────────────────

function convertFile(jsonPath: string): { prolog: string; count: number } {
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const category: string = data.category;
  const actions: EnsembleAction[] = data.actions;

  const lines: string[] = [];

  lines.push(`%% Ensemble Actions: ${category}`);
  lines.push(`%% Source: data/ensemble/actions/${path.basename(jsonPath)}`);
  lines.push(`%% Converted: ${new Date().toISOString()}`);
  lines.push(`%% Total actions: ${actions.length}`);
  lines.push('');

  // Build parent→children map from leadsTo
  const parentMap = new Map<string, string>();
  for (const action of actions) {
    if (action.leadsTo) {
      const parentAtom = toAtom(action.name);
      for (const child of action.leadsTo) {
        parentMap.set(toAtom(child), parentAtom);
      }
    }
  }

  // Convert each action
  for (const action of actions) {
    const id = toAtom(action.name);
    const parentAtom = parentMap.get(id);
    lines.push(actionToProlog(action, category, parentAtom));
    lines.push('');
  }

  return { prolog: lines.join('\n'), count: actions.length };
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  console.log('============================================================');
  console.log('  Convert Ensemble Actions to Prolog');
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

  let totalActions = 0;
  let totalFiles = 0;

  for (const jsonFile of jsonFiles) {
    const jsonPath = path.join(SRC_DIR, jsonFile);
    const plFile = jsonFile.replace('.json', '.pl');

    const { prolog, count } = convertFile(jsonPath);
    totalActions += count;
    totalFiles++;

    if (!dryRun) {
      fs.writeFileSync(path.join(OUT_DIR, plFile), prolog);
    }

    console.log(`  ✅ ${jsonFile} → ${plFile}: ${count} actions`);
  }

  // Also generate a combined file
  if (!dryRun) {
    const allLines: string[] = [];
    allLines.push('%% Ensemble Actions — Combined');
    allLines.push(`%% Generated: ${new Date().toISOString()}`);
    allLines.push(`%% Total: ${totalActions} actions from ${totalFiles} categories`);
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

    fs.writeFileSync(path.join(OUT_DIR, 'all_ensemble_actions.pl'), allLines.join('\n'));
    console.log(`\n  📦 all_ensemble_actions.pl: ${totalActions} actions combined`);
  }

  console.log('\n============================================================');
  console.log(`  Total: ${totalActions} actions across ${totalFiles} files`);
  if (!dryRun) {
    console.log(`  Output: ${OUT_DIR}`);
  }
  console.log('============================================================');
}

main();
