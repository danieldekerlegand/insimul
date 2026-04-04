/**
 * Rule-to-Prolog Converter
 *
 * Converts Insimul rule definitions (conditions/effects in JSON or DSL format)
 * into Prolog predicates that can be evaluated by tau-prolog.
 *
 * Supports:
 * - Ensemble format (JSON conditions with predicates)
 * - Insimul DSL format (when/then blocks)
 * - Plain JSON conditions/effects arrays
 */

// ── Types ───────────────────────────────────────────────────────────────────

interface EnsembleCondition {
  type: string;
  predicate?: string;
  first?: string;
  second?: string;
  operator?: string;
  value?: any;
  negated?: boolean;
}

interface EnsembleEffect {
  type: string;
  target?: string;
  action?: string;
  value?: any;
  parameters?: {
    category?: string;
    type?: string;
    first?: string;
    second?: string;
    weight?: number;
    intentType?: boolean;
  };
}

interface RuleData {
  name: string;
  content?: string;
  sourceFormat?: string;
  ruleType?: string;
  conditions?: any[];
  effects?: any[];
  priority?: number;
  likelihood?: number;
  category?: string;
  description?: string;
}

interface ConversionResult {
  prologContent: string;
  predicates: string[];
  errors: string[];
}

// ── Converter ───────────────────────────────────────────────────────────────

export function convertRuleToProlog(rule: RuleData): ConversionResult {
  const errors: string[] = [];
  const predicates: string[] = [];
  const lines: string[] = [];

  const ruleName = sanitizeAtom(rule.name);

  // Add metadata as comments
  lines.push(`% Rule: ${rule.name}`);
  if (rule.description) lines.push(`% ${rule.description}`);
  if (rule.category) lines.push(`% Category: ${rule.category}`);
  lines.push(`% Format: ${rule.sourceFormat || 'unknown'} / Type: ${rule.ruleType || 'default'}`);
  lines.push('');

  // Dynamic declarations for the rule predicate
  lines.push(`:- dynamic(rule_active/1).`);
  lines.push(`:- dynamic(rule_priority/2).`);
  lines.push(`:- dynamic(rule_likelihood/2).`);
  lines.push('');

  // Rule metadata as facts
  lines.push(`rule_active(${ruleName}).`);
  if (rule.priority !== undefined) {
    lines.push(`rule_priority(${ruleName}, ${rule.priority}).`);
  }
  if (rule.likelihood !== undefined) {
    lines.push(`rule_likelihood(${ruleName}, ${rule.likelihood}).`);
  }
  lines.push('');

  // Convert conditions and effects based on format
  const conditions = rule.conditions || [];
  const effects = rule.effects || [];

  if (conditions.length > 0 || effects.length > 0) {
    const conditionGoals = convertConditions(conditions, rule.sourceFormat, errors);
    const effectGoals = convertEffects(effects, rule.sourceFormat, errors);

    // Build the main rule predicate
    // rule_applies(RuleName, X, Y) :- <conditions>
    // rule_effect(RuleName, X, Y, Effect) :- <effect facts>

    if (conditionGoals.length > 0) {
      const condBody = conditionGoals.join(',\n    ');
      lines.push(`% Conditions`);
      lines.push(`:- dynamic(rule_applies/3).`);
      lines.push(`rule_applies(${ruleName}, X, Y) :-`);
      lines.push(`    ${condBody}.`);
      lines.push('');
      predicates.push(`rule_applies/3`);
    }

    if (effectGoals.length > 0) {
      lines.push(`% Effects`);
      lines.push(`:- dynamic(rule_effect/4).`);
      for (const effect of effectGoals) {
        lines.push(`rule_effect(${ruleName}, X, Y, ${effect}).`);
      }
      lines.push('');
      predicates.push(`rule_effect/4`);
    }
  }

  // If the rule has raw content in Insimul DSL, try to parse it too
  if (rule.content && rule.sourceFormat === 'insimul') {
    const dslResult = convertInsimulDSL(rule.content, ruleName, errors);
    if (dslResult) {
      lines.push('% Parsed from Insimul DSL');
      lines.push(dslResult);
      lines.push('');
    }
  }

  // If the rule content is already Prolog-like, include it directly
  if (rule.sourceFormat === 'prolog' && rule.content) {
    lines.push('% Direct Prolog content');
    lines.push(rule.content.trim());
    lines.push('');
  }

  return {
    prologContent: lines.join('\n'),
    predicates,
    errors,
  };
}

/**
 * Batch convert multiple rules into a single Prolog program.
 */
export function convertRulesToProlog(rules: RuleData[]): ConversionResult {
  const allLines: string[] = [];
  const allPredicates: string[] = [];
  const allErrors: string[] = [];

  allLines.push('% Insimul Rules - Auto-generated Prolog');
  allLines.push(`% Generated: ${new Date().toISOString()}`);
  allLines.push(`% Total rules: ${rules.length}`);
  allLines.push('');

  // Shared dynamic declarations
  allLines.push(':- dynamic(rule_active/1).');
  allLines.push(':- dynamic(rule_priority/2).');
  allLines.push(':- dynamic(rule_likelihood/2).');
  allLines.push(':- dynamic(rule_applies/3).');
  allLines.push(':- dynamic(rule_effect/4).');
  allLines.push('');

  for (const rule of rules) {
    const result = convertRuleToProlog(rule);
    // Strip redundant dynamic declarations (already declared above)
    const filtered = result.prologContent
      .split('\n')
      .filter(line => !line.startsWith(':- dynamic('))
      .join('\n');
    allLines.push(filtered);
    allLines.push('');
    allPredicates.push(...result.predicates);
    if (result.errors.length > 0) {
      allErrors.push(`[${rule.name}]: ${result.errors.join('; ')}`);
    }
  }

  // Helper rules for rule evaluation
  allLines.push('% Helper: find all applicable rules for two characters');
  allLines.push('applicable_rules(X, Y, Rules) :-');
  allLines.push('    findall(R, (rule_active(R), rule_applies(R, X, Y)), Rules).');
  allLines.push('');
  allLines.push('% Helper: get highest priority applicable rule');
  allLines.push('best_rule(X, Y, Rule) :-');
  allLines.push('    applicable_rules(X, Y, Rules),');
  allLines.push('    Rules \\= [],');
  allLines.push('    sort_by_priority(Rules, Sorted),');
  allLines.push('    Sorted = [Rule|_].');
  allLines.push('');
  allLines.push('sort_by_priority([], []).');
  allLines.push('sort_by_priority(Rules, Sorted) :-');
  allLines.push('    findall(P-R, (member(R, Rules), (rule_priority(R, P) -> true ; P = 5)), Pairs),');
  allLines.push('    sort(1, @>=, Pairs, SortedPairs),');
  allLines.push('    findall(R, member(_-R, SortedPairs), Sorted).');

  return {
    prologContent: allLines.join('\n'),
    predicates: Array.from(new Set(allPredicates)),
    errors: allErrors,
  };
}

// ── Condition Converters ────────────────────────────────────────────────────

function convertConditions(conditions: any[], sourceFormat: string | undefined, errors: string[]): string[] {
  const goals: string[] = [];

  for (const cond of conditions) {
    if (typeof cond === 'string') {
      // Raw string condition — try to use as-is if it looks like Prolog
      goals.push(cond);
      continue;
    }

    if (!cond || typeof cond !== 'object') continue;

    const goal = convertSingleCondition(cond, sourceFormat, errors);
    if (goal) goals.push(goal);
  }

  return goals;
}

function convertSingleCondition(cond: any, sourceFormat: string | undefined, errors: string[]): string | null {
  const type = cond.type || '';

  // Ensemble-style predicate conditions
  if (type === 'predicate' && cond.predicate) {
    return convertEnsemblePredicate(cond, errors);
  }

  // Simple property conditions
  if (type === 'mood') {
    return convertPropertyCondition('mood', 'X', cond.operator, cond.value);
  }
  if (type === 'relationship') {
    return convertPropertyCondition('relationship_strength', 'X, Y', cond.operator, cond.value);
  }
  if (type === 'trait') {
    return `has_trait(X, ${sanitizeAtom(String(cond.value || cond.trait || ''))})`;
  }
  if (type === 'location') {
    return `at_location(X, ${sanitizeAtom(String(cond.value || ''))})`;
  }
  if (type === 'age') {
    return convertPropertyCondition('age', 'X', cond.operator, cond.value);
  }
  if (type === 'occupation') {
    return `occupation(X, ${sanitizeAtom(String(cond.value || ''))})`;
  }
  if (type === 'status') {
    return `status(X, ${sanitizeAtom(String(cond.value || ''))})`;
  }
  if (type === 'has_item') {
    return `has_item(X, ${sanitizeAtom(String(cond.value || cond.item || ''))}, _)`;
  }
  if (type === 'knowledge' || type === 'knows') {
    const fact = sanitizeAtom(String(cond.value || cond.fact || ''));
    const subject = cond.second ? (cond.second === 'y' ? 'Y' : sanitizeAtom(cond.second)) : 'Y';
    return `knows(X, ${subject}, ${fact})`;
  }
  if (type === 'knowledge_value' || type === 'knows_value') {
    const attr = sanitizeAtom(String(cond.attribute || cond.property || ''));
    const subject = cond.second ? (cond.second === 'y' ? 'Y' : sanitizeAtom(cond.second)) : 'Y';
    if (cond.value !== undefined) {
      const val = typeof cond.value === 'string' ? `'${cond.value}'` : String(cond.value);
      return `knows_value(X, ${subject}, ${attr}, ${val})`;
    }
    return `knows_value(X, ${subject}, ${attr}, _)`;
  }
  if (type === 'belief' || type === 'believes') {
    const quality = sanitizeAtom(String(cond.value || cond.quality || ''));
    const subject = cond.second ? (cond.second === 'y' ? 'Y' : sanitizeAtom(cond.second)) : 'Y';
    if (cond.operator && cond.threshold !== undefined) {
      return convertPropertyCondition_belief(quality, subject, cond.operator, cond.threshold);
    }
    return `believes(X, ${subject}, ${quality}, _)`;
  }
  if (type === 'mental_model') {
    const subject = cond.second ? (cond.second === 'y' ? 'Y' : sanitizeAtom(cond.second)) : 'Y';
    if (cond.operator && cond.value !== undefined) {
      return `mental_model_confidence(X, ${subject}, C), C ${convertCompOp(cond.operator)} ${cond.value}`;
    }
    return `has_mental_model(X, ${subject})`;
  }

  // Generic fallback
  if (cond.predicate || cond.attribute) {
    const pred = sanitizeAtom(cond.predicate || cond.attribute);
    if (cond.first && cond.second) {
      return `${pred}(${cond.first === 'x' ? 'X' : sanitizeAtom(cond.first)}, ${cond.second === 'y' ? 'Y' : sanitizeAtom(cond.second)})`;
    }
    if (cond.first) {
      return `${pred}(${cond.first === 'x' ? 'X' : sanitizeAtom(cond.first)})`;
    }
    return `${pred}(X)`;
  }

  errors.push(`Unknown condition type: ${type}`);
  return null;
}

function convertEnsemblePredicate(cond: EnsembleCondition, errors: string[]): string | null {
  const pred = cond.predicate || '';

  // Parse ensemble predicate names like "trait_child", "directed status_rivals"
  const parts = pred.split(/\s+/);
  const isDirected = parts[0] === 'directed';
  const predicateName = sanitizeAtom(isDirected ? parts.slice(1).join('_') : pred);

  const first = cond.first === 'x' ? 'X' : cond.first === 'y' ? 'Y' : sanitizeAtom(cond.first || 'X');
  const second = cond.second === 'y' ? 'Y' : cond.second === 'x' ? 'X' : (cond.second ? sanitizeAtom(cond.second) : undefined);

  let goal: string;
  if (isDirected && second) {
    goal = `${predicateName}(${first}, ${second})`;
  } else if (second) {
    goal = `${predicateName}(${first}, ${second})`;
  } else {
    goal = `${predicateName}(${first})`;
  }

  // Handle value comparison
  if (cond.operator && cond.operator !== 'equals' && cond.value !== undefined) {
    const op = convertOperator(cond.operator);
    if (op) {
      const varName = `${predicateName.charAt(0).toUpperCase()}${predicateName.slice(1)}Val`;
      goal = `${predicateName}(${first}${second ? ', ' + second : ''}, ${varName}), ${varName} ${op} ${cond.value}`;
    }
  } else if (cond.operator === 'equals' && cond.value === false) {
    goal = `\\+ ${goal}`;
  }

  if (cond.negated) {
    goal = `\\+ (${goal})`;
  }

  return goal;
}

function convertPropertyCondition(predicate: string, args: string, operator: string | undefined, value: any): string {
  if (!operator || operator === 'equals') {
    if (typeof value === 'string') {
      return `${predicate}(${args}, ${sanitizeAtom(value)})`;
    }
    return `${predicate}(${args}, ${value})`;
  }

  const op = convertOperator(operator);
  if (op) {
    const varName = 'Val';
    return `${predicate}(${args}, ${varName}), ${varName} ${op} ${value}`;
  }

  return `${predicate}(${args}, ${value})`;
}

function convertOperator(op: string): string | null {
  switch (op) {
    case 'equals': return '=:=';
    case 'not_equals': return '=\\=';
    case 'greater_than': return '>';
    case 'less_than': return '<';
    case 'greater_equal': case 'gte': return '>=';
    case 'less_equal': case 'lte': return '=<';
    default: return null;
  }
}

function convertCompOp(op: string): string {
  return convertOperator(op) || '=:=';
}

function convertPropertyCondition_belief(quality: string, subject: string, operator: string, threshold: any): string {
  const op = convertOperator(operator) || '>=';
  return `believes(X, ${subject}, ${quality}, C), C ${op} ${threshold}`;
}

// ── Effect Converters ───────────────────────────────────────────────────────

function convertEffects(effects: any[], sourceFormat: string | undefined, errors: string[]): string[] {
  const goals: string[] = [];

  for (const effect of effects) {
    if (typeof effect === 'string') {
      goals.push(sanitizeAtom(effect));
      continue;
    }

    if (!effect || typeof effect !== 'object') continue;

    const goal = convertSingleEffect(effect, sourceFormat, errors);
    if (goal) goals.push(goal);
  }

  return goals;
}

function convertSingleEffect(effect: any, sourceFormat: string | undefined, errors: string[]): string | null {
  const type = effect.type || '';
  const params = effect.parameters || {};

  // Ensemble-style effects
  if (type === 'modify' || type === 'set') {
    const category = params.category || effect.action || '';
    const effectType = params.type || '';
    const weight = params.weight !== undefined ? params.weight : effect.value;

    if (category === 'network' || category === 'intent') {
      const first = params.first === 'x' ? 'X' : params.first === 'y' ? 'Y' : sanitizeAtom(params.first || 'X');
      const second = params.second === 'x' ? 'X' : params.second === 'y' ? 'Y' : sanitizeAtom(params.second || 'Y');
      return `effect(${sanitizeAtom(category)}, ${sanitizeAtom(effectType)}, ${first}, ${second}, ${weight})`;
    }

    if (effect.action) {
      return `effect(${sanitizeAtom(effect.action)}, ${sanitizeAtom(String(effect.value || ''))})`;
    }
  }

  // Simple effects
  if (type === 'dialogue') {
    return `effect(dialogue, '${escapeString(String(effect.value || ''))}')`;
  }
  if (type === 'relationship_change') {
    return `effect(relationship_change, ${effect.value || 0})`;
  }
  if (type === 'mood_change') {
    return `effect(mood_change, ${sanitizeAtom(String(effect.value || ''))})`;
  }
  if (type === 'give_item') {
    return `effect(give_item, ${sanitizeAtom(String(effect.item || effect.value || ''))})`;
  }
  if (type === 'remove_item') {
    return `effect(remove_item, ${sanitizeAtom(String(effect.item || effect.value || ''))})`;
  }
  if (type === 'learn_fact' || type === 'knowledge') {
    const fact = sanitizeAtom(String(effect.fact || effect.value || ''));
    return `effect(learn_fact, ${fact})`;
  }
  if (type === 'learn_value') {
    const attr = sanitizeAtom(String(effect.attribute || effect.property || ''));
    return `effect(learn_value, ${attr})`;
  }
  if (type === 'add_belief' || type === 'belief') {
    const quality = sanitizeAtom(String(effect.quality || effect.value || ''));
    return `effect(add_belief, ${quality})`;
  }
  if (type === 'share_knowledge') {
    return `effect(share_knowledge, all)`;
  }

  // Fallback
  if (effect.action) {
    return `effect(${sanitizeAtom(effect.action)}, ${sanitizeAtom(String(effect.value || ''))})`;
  }

  errors.push(`Unknown effect type: ${type}`);
  return null;
}

// ── Insimul DSL Parser ──────────────────────────────────────────────────────

function convertInsimulDSL(content: string, ruleName: string, errors: string[]): string | null {
  // Parse basic "when { ... } then { ... }" blocks
  const ruleMatch = content.match(/rule\s+\w+\s*\{[\s\S]*?when\s*\{([\s\S]*?)\}\s*then\s*\{([\s\S]*?)\}/);
  if (!ruleMatch) return null;

  const whenBlock = ruleMatch[1].trim();
  const thenBlock = ruleMatch[2].trim();

  const conditions: string[] = [];
  const effects: string[] = [];

  // Parse when conditions
  for (const line of whenBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // character.property == "value"
    const propMatch = trimmed.match(/(\w+)\.(\w+)\s*(==|!=|>|<|>=|<=)\s*["']?([^"']+)["']?/);
    if (propMatch) {
      const [, target, prop, op, val] = propMatch;
      const tgtVar = target === 'character' ? 'X' : target === 'target' ? 'Y' : sanitizeAtom(target);
      const prologOp = op === '==' ? '=' : op === '!=' ? '\\=' : op;

      if (isNaN(Number(val))) {
        conditions.push(`${sanitizeAtom(prop)}(${tgtVar}, ${sanitizeAtom(val)})`);
      } else {
        conditions.push(`${sanitizeAtom(prop)}(${tgtVar}, Val), Val ${prologOp} ${val}`);
      }
      continue;
    }

    // Simple predicate-like condition
    const simpleMatch = trimmed.match(/^(\w+)\.(\w+)$/);
    if (simpleMatch) {
      conditions.push(`${sanitizeAtom(simpleMatch[2])}(${simpleMatch[1] === 'character' ? 'X' : 'Y'})`);
      continue;
    }
  }

  // Parse then effects
  for (const line of thenBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // say("text")
    const sayMatch = trimmed.match(/say\(["'](.+?)["']\)/);
    if (sayMatch) {
      effects.push(`effect(dialogue, '${escapeString(sayMatch[1])}')`);
      continue;
    }

    // property.method(value)
    const methodMatch = trimmed.match(/(\w+)\.(\w+)\(([^)]*)\)/);
    if (methodMatch) {
      effects.push(`effect(${sanitizeAtom(methodMatch[2])}, ${methodMatch[3] || 0})`);
      continue;
    }
  }

  if (conditions.length === 0 && effects.length === 0) return null;

  const parts: string[] = [];
  if (conditions.length > 0) {
    parts.push(`rule_applies(${ruleName}, X, Y) :-`);
    parts.push(`    ${conditions.join(',\n    ')}.`);
  }
  for (const eff of effects) {
    parts.push(`rule_effect(${ruleName}, X, Y, ${eff}).`);
  }

  return parts.join('\n');
}

// ── Prolog Validation ───────────────────────────────────────────────────────

/**
 * Validate Prolog content syntax using tau-prolog.
 * Returns errors if any.
 */
export async function validatePrologSyntax(prologContent: string): Promise<string[]> {
  // Dynamic import to avoid circular deps if needed
  const { TauPrologEngine } = await import('./tau-engine');
  const engine = new TauPrologEngine();

  const result = await engine.consult(prologContent);
  if (!result.success) {
    return [result.error || 'Invalid Prolog syntax'];
  }
  return [];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sanitizeAtom(str: string): string {
  let atom = str
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (/^[0-9]/.test(atom)) atom = `n${atom}`;
  return atom || 'unknown';
}

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
