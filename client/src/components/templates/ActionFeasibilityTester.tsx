import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2, XCircle, Minus, RefreshCw, Loader2, ChevronDown, ChevronRight, Lightbulb,
} from 'lucide-react';
import type { CharacterTemplate } from '@shared/schema';
import { PredicateBuilder, type StartingTruth } from './PredicateBuilder';
import { TauPrologEngine } from '@shared/prolog/tau-engine';
import { HELPER_PREDICATES_PROLOG } from '@shared/prolog/helper-predicates';
import { GAMEPLAY_PREDICATES } from '@shared/prolog/gameplay-predicates';
import {
  ACTION_PREREQUISITES, type PrerequisiteDefinition,
} from '@shared/prolog/action-prerequisites';
import {
  ACTION_MATRIX, getActionsByCategory, type ActionCategory,
} from '@shared/game-engine/action-matrix';

// ── Types ─────────────────────────────────────────────────────────────────────

type TestStatus = 'pass' | 'fail' | 'animation-only';

interface ActionTestResult {
  actionId: string;
  displayName: string;
  status: TestStatus;
  failedPrerequisites?: string[];
  missingPredicates?: string[];
}

interface CategoryResults {
  category: ActionCategory;
  label: string;
  actions: ActionTestResult[];
  passCount: number;
  failCount: number;
  animationCount: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ActionCategory, string> = {
  movement: 'Movement',
  combat: 'Combat',
  social: 'Social',
  commerce: 'Commerce',
  resource: 'Resource',
  items: 'Items',
  exploration: 'Exploration',
  language: 'Language',
  survival: 'Survival',
};

const CATEGORY_ORDER: ActionCategory[] = [
  'combat', 'resource', 'commerce', 'social', 'language',
  'exploration', 'items', 'survival', 'movement',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getResolvedPrerequisites(actionId: string): string[] | null {
  const def = ACTION_PREREQUISITES[actionId];
  if (!def) return null;

  const goals: string[] = [];

  // If inherits from parent, resolve parent prerequisites
  if (def.inheritsFromParent) {
    const matrixEntry = ACTION_MATRIX.find(e => e.actionId === actionId);
    if (matrixEntry?.parentAction) {
      const parentPrereqs = getResolvedPrerequisites(matrixEntry.parentAction);
      if (parentPrereqs) {
        goals.push(...parentPrereqs);
      }
    }
  }

  goals.push(...def.prerequisites);
  return goals;
}

/**
 * Extract predicate names referenced in a goal string.
 * e.g., "has_equipped(Actor, weapon, W), is_weapon_type(W, sword)" → ["has_equipped", "is_weapon_type"]
 */
function extractPredicateNames(goal: string): string[] {
  const matches = goal.match(/[a-z_]\w*(?=\s*\()/g);
  return matches || [];
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ActionFeasibilityTesterProps {
  templates: CharacterTemplate[];
  selectedTemplateId?: string;
}

export function ActionFeasibilityTester({ templates, selectedTemplateId }: ActionFeasibilityTesterProps) {
  const [chosenTemplateId, setChosenTemplateId] = useState<string>(selectedTemplateId || '');
  const [inlineTruths, setInlineTruths] = useState<StartingTruth[] | null>(null);
  const [results, setResults] = useState<CategoryResults[] | null>(null);
  const [testing, setTesting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const chosenTemplate = useMemo(
    () => templates.find(t => t.id === chosenTemplateId) || null,
    [templates, chosenTemplateId],
  );

  const activeTruths = useMemo<StartingTruth[]>(() => {
    if (inlineTruths !== null) return inlineTruths;
    if (chosenTemplate) return (chosenTemplate.startingTruths as StartingTruth[] | null) || [];
    return [];
  }, [inlineTruths, chosenTemplate]);

  const handleTemplateSelect = useCallback((id: string) => {
    setChosenTemplateId(id);
    setInlineTruths(null);
    setResults(null);
    setExpandedAction(null);
  }, []);

  const handleInlineTruthChange = useCallback((truths: StartingTruth[]) => {
    setInlineTruths(truths);
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  // ── Run Feasibility Test ──────────────────────────────────────────────────

  const runTest = useCallback(async () => {
    if (activeTruths.length === 0) return;
    setTesting(true);
    setExpandedAction(null);

    try {
      const engine = new TauPrologEngine(5000);

      // Declare dynamic predicates for all gameplay predicates
      const dynamicDecls = GAMEPLAY_PREDICATES.map(p => `${p.name}/${p.arity}`);
      // Add additional predicates used in prerequisites
      dynamicDecls.push(
        'alive/1', 'near/3', 'person/1',
        'action/4', 'action_prerequisite/2', 'action_effect/2',
        'can_perform/2', 'can_perform/3',
      );
      await engine.declareDynamic(dynamicDecls);

      // Load helper predicates (cefr_gte, is_weapon_type, etc.)
      await engine.consult(HELPER_PREDICATES_PROLOG);

      // Assert template truths as facts for 'player'
      const facts: string[] = [];
      for (const truth of activeTruths) {
        const args = truth.args.map(a => typeof a === 'string' ? a : String(a));
        facts.push(`${truth.predicate}(${args.join(', ')})`);
      }
      // Always assert player is alive
      facts.push('alive(player)');
      await engine.assertFacts(facts);

      // Build can_perform rules from ACTION_PREREQUISITES
      const rules: string[] = [];
      for (const [actionId, def] of Object.entries(ACTION_PREREQUISITES)) {
        const resolved = getResolvedPrerequisites(actionId);
        if (!resolved || resolved.length === 0) {
          // No prerequisites — always available
          const matrixEntry = ACTION_MATRIX.find(e => e.actionId === actionId);
          if (matrixEntry?.requiresTarget) {
            rules.push(`can_perform(_, ${actionId}, _)`);
          } else {
            rules.push(`can_perform(_, ${actionId})`);
          }
        } else {
          const matrixEntry = ACTION_MATRIX.find(e => e.actionId === actionId);
          // Replace Actor with player for testing, Target with test_target
          const goals = resolved.map(g =>
            g.replace(/\bActor\b/g, 'player').replace(/\bTarget\b/g, 'test_target'),
          );
          if (matrixEntry?.requiresTarget) {
            rules.push(`can_perform(player, ${actionId}, test_target) :- ${goals.join(', ')}`);
          } else {
            rules.push(`can_perform(player, ${actionId}) :- ${goals.join(', ')}`);
          }
        }
      }
      await engine.addRules(rules);

      // Also assert some test environment facts
      await engine.assertFacts([
        'near(player, test_target, 1)',
        'alive(test_target)',
        'person(test_target)',
        'location_accessible(test_location)',
        'near(player, test_building, 3)',
        'location_accessible(test_building)',
        'npc_will_trade(test_target)',
        'npc_quest_available(test_target, test_quest)',
      ]);

      // Test each action
      const categoryResults: CategoryResults[] = [];
      for (const cat of CATEGORY_ORDER) {
        const catActions = getActionsByCategory(cat);
        const actionResults: ActionTestResult[] = [];

        for (const matrixEntry of catActions) {
          const prereqDef = ACTION_PREREQUISITES[matrixEntry.actionId];

          // Animation-only: no prerequisites defined and status is animation-only
          if (!prereqDef && matrixEntry.status === 'animation-only') {
            actionResults.push({
              actionId: matrixEntry.actionId,
              displayName: matrixEntry.displayName,
              status: 'animation-only',
            });
            continue;
          }

          // No prerequisite definition — skip (not in our prerequisite system)
          if (!prereqDef) {
            actionResults.push({
              actionId: matrixEntry.actionId,
              displayName: matrixEntry.displayName,
              status: 'animation-only',
            });
            continue;
          }

          // Query can_perform
          let query: string;
          if (matrixEntry.requiresTarget) {
            query = `can_perform(player, ${matrixEntry.actionId}, test_target)`;
          } else {
            query = `can_perform(player, ${matrixEntry.actionId})`;
          }

          const result = await engine.query(query, 1);

          if (result.success && result.bindings.length > 0) {
            actionResults.push({
              actionId: matrixEntry.actionId,
              displayName: matrixEntry.displayName,
              status: 'pass',
            });
          } else {
            // Find which prerequisites failed
            const resolved = getResolvedPrerequisites(matrixEntry.actionId) || [];
            const failedPrereqs: string[] = [];
            const missingPreds: string[] = [];

            for (const goal of resolved) {
              const testGoal = goal
                .replace(/\bActor\b/g, 'player')
                .replace(/\bTarget\b/g, 'test_target');
              const goalResult = await engine.query(testGoal, 1);
              if (!goalResult.success || goalResult.bindings.length === 0) {
                failedPrereqs.push(goal);
                // Extract which predicates are needed
                const predNames = extractPredicateNames(goal);
                const gameplayPredNames = GAMEPLAY_PREDICATES.map(p => p.name);
                for (const pn of predNames) {
                  if (gameplayPredNames.includes(pn)) {
                    const alreadyHas = activeTruths.some(t => t.predicate === pn);
                    if (!alreadyHas && !missingPreds.includes(pn)) {
                      missingPreds.push(pn);
                    }
                  }
                }
              }
            }

            actionResults.push({
              actionId: matrixEntry.actionId,
              displayName: matrixEntry.displayName,
              status: 'fail',
              failedPrerequisites: failedPrereqs,
              missingPredicates: missingPreds.length > 0 ? missingPreds : undefined,
            });
          }
        }

        const passCount = actionResults.filter(r => r.status === 'pass').length;
        const failCount = actionResults.filter(r => r.status === 'fail').length;
        const animationCount = actionResults.filter(r => r.status === 'animation-only').length;

        categoryResults.push({
          category: cat,
          label: CATEGORY_LABELS[cat],
          actions: actionResults,
          passCount,
          failCount,
          animationCount,
        });
      }

      setResults(categoryResults);
      // Auto-expand categories with failures
      const catsWithFailures = new Set(
        categoryResults.filter(c => c.failCount > 0).map(c => c.category),
      );
      setExpandedCategories(catsWithFailures);
    } catch (err) {
      console.error('Feasibility test error:', err);
    } finally {
      setTesting(false);
    }
  }, [activeTruths]);

  // ── Summary stats ─────────────────────────────────────────────────────────

  const summary = useMemo(() => {
    if (!results) return null;
    let pass = 0, fail = 0, anim = 0;
    for (const cat of results) {
      pass += cat.passCount;
      fail += cat.failCount;
      anim += cat.animationCount;
    }
    return { pass, fail, anim, total: pass + fail + anim };
  }, [results]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Action Feasibility Tester</h3>
      </div>

      {/* Template selector */}
      <div className="flex items-center gap-3">
        <Select value={chosenTemplateId} onValueChange={handleTemplateSelect}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a template..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map(t => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} {t.isBase ? '(Base)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          onClick={runTest}
          disabled={testing || activeTruths.length === 0}
        >
          {testing ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-1" />
          )}
          {results ? 'Re-test' : 'Test'}
        </Button>
      </div>

      {/* Inline truth editor */}
      {chosenTemplate && (
        <div className="border rounded-lg p-3 bg-muted/20">
          <p className="text-xs text-muted-foreground mb-2">
            Modify truths below and click Re-test — changes are <strong>not</strong> saved to DB.
          </p>
          <PredicateBuilder
            truths={activeTruths}
            onChange={handleInlineTruthChange}
          />
        </div>
      )}

      {/* Summary bar */}
      {summary && (
        <div className="flex items-center gap-4 p-3 border rounded-lg bg-card text-sm">
          <span className="font-medium">Results:</span>
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-4 h-4" /> {summary.pass} pass
          </span>
          <span className="flex items-center gap-1 text-red-600">
            <XCircle className="w-4 h-4" /> {summary.fail} fail
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Minus className="w-4 h-4" /> {summary.anim} animation-only
          </span>
          <span className="text-muted-foreground ml-auto">{summary.total} total</span>
        </div>
      )}

      {/* Category results */}
      {results && (
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-1">
            {results.map(cat => {
              const isExpanded = expandedCategories.has(cat.category);
              return (
                <div key={cat.category} className="border rounded-lg overflow-hidden">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(cat.category)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                    <span className="font-medium text-sm">{cat.label}</span>
                    <div className="flex items-center gap-2 ml-auto">
                      {cat.passCount > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-600/30 text-xs">
                          {cat.passCount} pass
                        </Badge>
                      )}
                      {cat.failCount > 0 && (
                        <Badge variant="outline" className="text-red-600 border-red-600/30 text-xs">
                          {cat.failCount} fail
                        </Badge>
                      )}
                      {cat.animationCount > 0 && (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                          {cat.animationCount} anim
                        </Badge>
                      )}
                    </div>
                  </button>

                  {/* Action list */}
                  {isExpanded && (
                    <div className="border-t">
                      {cat.actions.map(action => {
                        const isActionExpanded = expandedAction === action.actionId;
                        return (
                          <div key={action.actionId}>
                            <button
                              onClick={() => {
                                if (action.status === 'fail') {
                                  setExpandedAction(isActionExpanded ? null : action.actionId);
                                }
                              }}
                              className={`w-full flex items-center gap-2 px-4 py-1.5 text-left text-sm ${
                                action.status === 'fail' ? 'hover:bg-muted/30 cursor-pointer' : 'cursor-default'
                              }`}
                            >
                              {action.status === 'pass' && (
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                              )}
                              {action.status === 'fail' && (
                                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                              )}
                              {action.status === 'animation-only' && (
                                <Minus className="w-4 h-4 text-muted-foreground shrink-0" />
                              )}
                              <span className={action.status === 'fail' ? 'text-red-700 dark:text-red-400' : ''}>
                                {action.displayName}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono ml-1">
                                {action.actionId}
                              </span>
                              {action.status === 'fail' && (
                                <ChevronDown className={`w-3 h-3 ml-auto text-muted-foreground transition-transform ${
                                  isActionExpanded ? '' : '-rotate-90'
                                }`} />
                              )}
                            </button>

                            {/* Failed prerequisite detail */}
                            {isActionExpanded && action.failedPrerequisites && (
                              <div className="px-6 pb-2 space-y-2">
                                <div>
                                  <p className="text-xs font-medium text-red-600 mb-1">Failed prerequisites:</p>
                                  {action.failedPrerequisites.map((prereq, i) => (
                                    <div key={i} className="font-mono text-xs bg-red-500/10 text-red-700 dark:text-red-400 px-2 py-1 rounded mb-0.5">
                                      {prereq}
                                    </div>
                                  ))}
                                </div>
                                {action.missingPredicates && action.missingPredicates.length > 0 && (
                                  <div className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <div>
                                      <span className="font-medium">What's missing? </span>
                                      Add {action.missingPredicates.map((p, i) => (
                                        <span key={p}>
                                          {i > 0 && ', '}
                                          <code className="bg-amber-500/10 px-1 rounded">{p}</code>
                                        </span>
                                      ))} to the template truths
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Empty state */}
      {!chosenTemplateId && (
        <div className="text-center text-muted-foreground text-sm py-8">
          Select a character template to test action feasibility.
        </div>
      )}
    </div>
  );
}
